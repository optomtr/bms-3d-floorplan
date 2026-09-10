// ---------------------------------------------------------------------------
// SceneManager: owns the Three.js renderer, camera, controls, lights and the
// render loop. Handles the critical tablet-touch hardening from the brief:
//   - touch-action:none is set on the canvas (see card CSS) so the browser
//     never hijacks pinch into page zoom.
//   - OrbitControls with damping, min/max distance clamps, target clamped to
//     the floor bounding box, and a reset-view that recenters instantly.
//
// What lives elsewhere (same folder): device quality policy in quality.ts, the
// frame loop in render-loop.ts, pointer→object in picking.ts, the backdrop and
// room photos in backdrop.ts, the view-mode geometry collapse in
// static-merge.ts, and the one room-grouping rule in room-grouping.ts.
// ---------------------------------------------------------------------------

import * as THREE from 'three';
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { ClickResult, FloorDef, FloorPlan, RoomInfo, Underlay } from '../types';
import { buildFloorGroup, buildRoomElement, buildWallElement, floorWallHeight } from './builder';
import { BindingManager } from './bindings';
import { isShapeRoom, roomPolygon } from './room-shapes';
import { disposeObject3D } from './dispose';
import { finitePolygon } from './sanitize';
import {
  AdaptiveQuality,
  QUALITY_PRESETS,
  type QualityChoice,
  type QualityTier,
  detectTier,
  readStoredQuality,
  storeQuality,
} from './quality';
import { RoomPhoto, makeBackdropTexture } from './backdrop';
import { Picker, SelectionBox, applyDrawMode, applyLeftReserved } from './picking';
import { RenderLoop, type RenderLoopHost } from './render-loop';
import { mergeStaticGeometry, simplifyMaterials } from './static-merge';
import { ROOM_MARKER_Y, groupRooms, roomAtPoint } from './room-grouping';
import { MarkerLayer } from './markers';
import { applyTouchScheme, clampTarget, createControls, frameBox, targetLimits } from './camera-rig';
import { TouchNav } from './touch-nav';
import { setUnderlay } from './underlay';
import type { FloorSlot } from './floor-slot';

// Re-exported so the card keeps one import for everything it needs from the
// scene. The types themselves live in ../types (both ends of the app need them).
export type { ClickResult, RoomInfo } from '../types';
export type { QualityChoice } from './quality';
export { QUALITY_CHOICES } from './quality';

export class SceneManager implements RenderLoopHost {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene: THREE.Scene;
  readonly camera: THREE.PerspectiveCamera;
  readonly controls: OrbitControls;

  private container: HTMLElement;
  /** Render-on-demand frame loop — the only owner of "draw one more frame". */
  private loop = new RenderLoop(this);
  private resizeObserver?: ResizeObserver;
  private inViewport = true;
  private viewObserver?: IntersectionObserver;
  /** Everything hung off `window`/`document`, kept so dispose() can take it all
   *  back down. Without this the manager stayed pinned to window forever. */
  private teardown: (() => void)[] = [];
  /** Last size the drawing buffer was fitted to — see resize(). */
  private lastW = -1;
  private lastH = -1;

  /** Steps the renderer down when interaction runs slow (see quality.ts). */
  private adaptive = new AdaptiveQuality({
    dropShadows: () => {
      this.renderer.shadowMap.enabled = false;
      if (this.sun) this.sun.castShadow = false;
      this.recompileMaterials();
      this.loop.invalidate();
    },
    useMatteMaterials: () => this.simplify(),
    lowerDragResolution: () => {
      // The still image stays crisp via idlePR() — it's on-demand, so it isn't
      // the cost that hurts.
      this.staticPR = Math.max(0.75, Math.min(1, this.staticPR));
    },
  });
  private materialsSimplified = false;

  // Dynamic resolution: render COARSE only WHILE a finger is actively dragging
  // the view (fill rate is the weak-GPU bottleneck, so fewer pixels = a smooth
  // drag), then snap back to the SHARP pixel ratio the instant the finger lifts.
  // The still image you actually read is always full quality. `staticPR` is that
  // sharp target. Pointer-driven (not damping) so it can never get stuck coarse.
  private staticPR = 1.5;
  private viewDragging = false;
  private heavyPlan = false; // big plan → fewer real lights (quality-neutral)

  /** Every floor of the loaded plan, one record each (see floor-slot.ts). */
  private slots: FloorSlot[] = [];
  /** The plan the slots were built from — the SAME object the editor mutates.
   *  Kept so a single wall/room can be re-cut in place (refreshParts) without
   *  the caller having to hand the floor back in on every pointer move. */
  private loadedPlan: FloorPlan | null = null;
  /** Plan elements the last loadPlan() had to drop (see BuiltFloor.skipped). */
  private skippedParts: string[] = [];
  private activeFloor = 0;
  private fullBBox = new THREE.Box3();
  /** Framing-distance multiplier for resetView (config: cameraDistance). */
  private cameraDistance = 1;

  /** Render-quality (device-adaptive; user-overridable at runtime). */
  private qualityChoice: QualityChoice = 'auto';
  private qualityTier: QualityTier = 'high';
  private sun?: THREE.DirectionalLight;

  private picker: Picker;
  private onPick?: (r: ClickResult | null) => void;

  // pointerdown bookkeeping to distinguish a tap from a drag.
  private downPos = { x: 0, y: 0 };
  private downTime = 0;
  /** Указатели, лежащие на холсте сейчас, и признак «в жесте был не один
   *  палец». Щипок двумя пальцами раньше кончался тапом того из них, который
   *  сдвинулся меньше, — и посреди приближения всплывало окно устройства. */
  private downIds = new Set<number>();
  private multiTouch = false;

  /** Пальцы: один ведёт план, два — щипок с поворотом (см. touch-nav.ts). */
  private touchNav: TouchNav;

  // -- Editor support --
  /** Editor preview meshes (wall ghosts, point dots) live here. */
  readonly previewGroup = new THREE.Group();
  /** Gizmo handle meshes (Position Helper) live here. */
  readonly gizmoGroup = new THREE.Group();
  /** Reference-image underlay (tracing guide) lives here. */
  readonly underlayGroup = new THREE.Group();
  /** Floating, always-on-top device icons + the edit-mode zone dots. */
  private markers = new MarkerLayer({
    hass: () => this.lastHass,
    invalidate: () => this.loop.invalidate(),
  });
  /** Last hass seen, so markers can colour themselves right after a rebuild. */
  private lastHass?: any;
  /** Маркеры собраны до прихода состояний — их надо пересобрать. */
  private markersBlind = false;
  /** Every entity the 3D actually reacts to (bindings + zone membership).
   *  A home has 2000+ entities and the scene cares about a few hundred. */
  private trackedCache: Set<string> | null = null;
  /** Which of those currently exist in hass — the only live input the room
   *  grouping depends on, so the cache below can be invalidated honestly. */
  private presentTracked = new Set<string>();
  /** roomsByFloor() result. Rebuilt on plan/marker changes and when a tracked
   *  entity appears or disappears; NOT on every value change, because the
   *  grouping doesn't depend on values. */
  private roomsCache: RoomInfo[][] | null = null;
  /** Rooms on the active floor, in marker-build order — the source for the
   *  card's room pills + right-side panel. Rebuilt with the markers. */
  private activeRooms: (RoomInfo & { sprite: THREE.Sprite })[] = [];
  /** Ключи комнат по индексу контура активного этажа — карта «пол → комната»
   *  из той же группировки, что строит значки (см. buildMarkers). */
  private roomKeysByOutline: string[][] = [];
  /** Key of the room the card currently has selected (drives the accent pin). */
  private selectedRoomKey: string | null = null;
  /** The default gradient backdrop, kept so a per-room photo can be swapped in
   *  and then restored. Assigned in the constructor. */
  private defaultBackdrop!: THREE.Texture;
  /** The focused room's design photo. The picture itself is painted by the
   *  card, not the scene — the canvas stops at the side panel. */
  private photo: RoomPhoto;
  private onBackdrop?: (url: string | null) => void;
  /** Fired after markers rebuild so the card can refresh its room list. */
  private onRoomsChanged?: (rooms: RoomInfo[]) => void;
  private editing = false;
  private gridHelper?: THREE.GridHelper;
  private selection: SelectionBox;
  private groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  private onGround?: {
    click?: (p: THREE.Vector3, e: PointerEvent) => void;
    move?: (p: THREE.Vector3, e: PointerEvent) => void;
  };
  /** True while a grabbed object/handle is being dragged. The ONE owner of
   *  "the camera is suspended": every place that used to write
   *  `controls.enabled` now goes through applyCameraGate(). */
  private dragging = false;
  private onDrag?: {
    start: (e: PointerEvent) => boolean;
    move: (p: THREE.Vector3, e: PointerEvent) => void;
    end: () => void;
  };

  constructor(container: HTMLElement, background = '#1b1d22') {
    this.container = container;

    this.qualityChoice = readStoredQuality();
    this.qualityTier = this.qualityChoice === 'auto' ? detectTier() : this.qualityChoice;
    const preset = QUALITY_PRESETS[this.qualityTier];

    // alpha: the canvas goes transparent while a room's design photo is up, so
    // the photo can be one CSS layer spanning the whole card (behind the side
    // panel too) instead of stopping at the canvas edge.
    this.renderer = new THREE.WebGLRenderer({ antialias: preset.aa, alpha: true, powerPreference: 'high-performance' });
    this.staticPR = preset.pixelRatio;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, preset.pixelRatio));
    // Filmic tone mapping — the flat linear default crushes bright walls to a
    // dead grey and clips lamp highlights. ACES rolls the highlights off and
    // deepens the mids, which is what reads as an "expensive" render; the slight
    // exposure lift keeps it from darkening the room. Nearly free on the GPU.
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = preset.shadows;
    this.renderer.shadowMap.type = preset.shadowType;
    // Shadows are cast only by the fixed sun, so the shadow map is static. Stop
    // re-rendering it every frame (the main cause of stutter on weak GPUs) — we
    // refresh it once whenever the scene actually changes (see requestShadowUpdate).
    this.renderer.shadowMap.autoUpdate = false;
    this.renderer.shadowMap.needsUpdate = true;
    this.renderer.domElement.style.touchAction = 'none';
    this.renderer.domElement.style.display = 'block';
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.defaultBackdrop = makeBackdropTexture(background);
    this.scene.background = this.defaultBackdrop;
    this.scene.add(this.previewGroup);
    this.scene.add(this.gizmoGroup);
    this.scene.add(this.underlayGroup);
    this.scene.add(this.markers.group);
    this.scene.add(this.markers.badgeGroup);
    this.scene.add(this.markers.zoneGroup);
    this.selection = new SelectionBox(this.scene);
    this.photo = new RoomPhoto((url) => {
      this.onBackdrop?.(url);
      this.applyBackdrop();
    });

    this.camera = new THREE.PerspectiveCamera(55, 1, 0.1, 1000);
    this.camera.position.set(8, 8, 8);
    this.picker = new Picker(this.camera, this.renderer.domElement);

    this.controls = createControls(this.camera, this.renderer.domElement);
    // Clamp panning to the floor bbox after every change + request a redraw.
    this.controls.addEventListener('change', () => {
      clampTarget(this.camera, this.controls, this.slots[this.activeFloor]?.built.bbox ?? this.fullBBox);
      this.loop.invalidate();
    });
    this.touchNav = new TouchNav(this.renderer.domElement, this.camera, this.controls, {
      groundY: () => this.slots[this.activeFloor]?.elevation ?? 0,
      pivotRoot: () => this.slots[this.activeFloor]?.group ?? null,
      limits: () => targetLimits(this.slots[this.activeFloor]?.built.bbox ?? this.fullBBox),
      // В правке один палец принадлежит инструменту; пока тащат предмет,
      // камера вообще стоит (applyCameraGate).
      enabled: () => !this.editing && this.controls.enabled,
    });
    this.teardown.push(() => this.touchNav.dispose());

    // Dynamic resolution: coarse while a finger is dragging the view, sharp the
    // instant it lifts (release listeners on window so they fire even off-canvas).
    // They are REMOVED in dispose(): a window listener holding `this` kept every
    // scene ever built — renderer, geometry, textures — alive for the life of
    // the page, which on a wall panel means for weeks.
    const el = this.renderer.domElement;
    el.addEventListener('pointerdown', () => this.setViewDragging(true), { passive: true });
    const stopDrag = () => this.setViewDragging(false);
    window.addEventListener('pointerup', stopDrag, { passive: true });
    window.addEventListener('pointercancel', stopDrag, { passive: true });
    this.teardown.push(() => {
      window.removeEventListener('pointerup', stopDrag);
      window.removeEventListener('pointercancel', stopDrag);
    });

    this.setupLights();
    this.setupResize();
    this.setupPointer();
    this.setupVisibility();
  }

  /** Watch whether the panel is actually being looked at. Two independent
   *  reasons to stand still: the tab/app is hidden, or the card is scrolled off
   *  screen (or on a dashboard tab that isn't showing). */
  private setupVisibility(): void {
    const onChange = () => this.loop.setVisible(!document.hidden && this.inViewport);
    document.addEventListener('visibilitychange', onChange);
    this.teardown.push(() => document.removeEventListener('visibilitychange', onChange));
    if (typeof IntersectionObserver !== 'undefined') {
      this.viewObserver = new IntersectionObserver((entries) => {
        this.inViewport = entries.some((e) => e.isIntersecting);
        onChange();
      });
      this.viewObserver.observe(this.container);
    }
  }

  // -- RenderLoopHost ---------------------------------------------------------

  /** Ease the orbit damping; true while the camera is still moving. */
  updateCamera(): boolean {
    return this.controls.update();
  }

  /** Advance bound animations on the visible floor (a fan, a curtain). */
  animate(dt: number): boolean {
    return this.slots[this.activeFloor]?.bindings.animate(dt) ?? false;
  }

  drawFrame(): void {
    this.markers.updateScales(this.camera.position);
    this.renderer.render(this.scene, this.camera);
  }

  onInteractiveFrame(seconds: number): void {
    // Only auto-tune when the user hasn't pinned a quality — an explicit pick
    // is respected as-is.
    if (this.qualityChoice === 'auto') this.adaptive.track(seconds);
  }

  /** The floating markers' scene node (диагностика / внешний осмотр). */
  get markerGroup(): THREE.Group {
    return this.markers.group;
  }

  /** Кружки-значки климата под маркерами комнат (диагностика / автопроверки). */
  get climateBadgeGroup(): THREE.Group {
    return this.markers.badgeGroup;
  }

  /** Что показывают кружки климата прямо сейчас (диагностика / автопроверки). */
  climateBadges(): ReturnType<MarkerLayer['climateBadges']> {
    return this.markers.climateBadges();
  }

  /** The edit-mode zone dots' scene node. */
  get zoneGroup(): THREE.Group {
    return this.markers.zoneGroup;
  }

  /** Re-render the (static) shadow map once on the next frame. Call after any
   *  change to what casts shadows — plan load, floor switch, quality change, or
   *  an in-place edit that moves a shadow-caster without a full rebuild. */
  requestShadowUpdate(): void {
    this.renderer.shadowMap.needsUpdate = true;
  }

  /** Collapse each floor's STATIC architecture (walls, floors, opening frames —
   *  everything EXCEPT bound furniture, which stays live for bindings/markers)
   *  into a handful of merged meshes. View mode ONLY — see static-merge.ts for
   *  why the editor must never run this. Safe to call after each view load. */
  optimizeForView(): void {
    if (this.editing) return;
    for (const slot of this.slots) {
      // Keep BOUND furniture live (glow/spin/curtain + markers); everything else
      // — architecture AND unbound furniture — is fair game to merge.
      mergeStaticGeometry(slot.built, new Set<THREE.Object3D>(slot.bindings.anchorObjects() ?? []));
    }
    // Weak tier, a big plan, or a device the adaptive pass proved slow → swap to
    // cheap matte materials. Shadows are KEPT (they carry most of the depth/
    // "quality" look) — if the device then can't keep up, the adaptive pass drops
    // them first anyway.
    if (this.qualityTier === 'low' || this.heavyPlan || this.adaptive.level >= 2) {
      this.simplify();
    }
    // Crisp, super-sampled still image now the scene is built.
    if (!this.viewDragging) this.applyPR(this.idlePR(), true);
    this.requestShadowUpdate();
    this.loop.invalidate();
  }

  /** Matte materials, once per plan load (idempotent; reset by loadPlan). */
  private simplify(): void {
    if (this.materialsSimplified) return;
    simplifyMaterials(this.scene);
    this.materialsSimplified = true;
    this.loop.invalidate();
  }

  private setupLights(): void {
    // Warm key + softly warm ambient, with a cooler ground bounce — the warm/cool
    // split is what stops an interior looking flat and fluorescent. Pure-white
    // light on warm walls just greys them back out.
    const ambient = new THREE.AmbientLight(0xfff4e6, 0.5);
    this.scene.add(ambient);

    const preset = QUALITY_PRESETS[this.qualityTier];
    const dir = new THREE.DirectionalLight(0xfff0dc, 0.95);
    dir.position.set(10, 18, 8);
    dir.castShadow = preset.shadows;
    dir.shadow.mapSize.set(preset.shadowMap, preset.shadowMap);
    dir.shadow.camera.near = 1;
    dir.shadow.camera.far = 60;
    const d = 20;
    dir.shadow.camera.left = -d;
    dir.shadow.camera.right = d;
    dir.shadow.camera.top = d;
    dir.shadow.camera.bottom = -d;
    this.scene.add(dir);
    this.sun = dir;

    const hemi = new THREE.HemisphereLight(0xfff2e0, 0x3a3f4a, 0.4);
    this.scene.add(hemi);
  }

  private setupResize(): void {
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.container);
    this.resize(true);
  }

  /** @param force re-fit even at an unchanged size — the pixel-ratio and quality
   *  paths change the buffer's resolution, not the element's box, so they must
   *  not be skipped by the same-size guard below. */
  private resize(force = false): void {
    const w = this.container.clientWidth || 1;
    const h = this.container.clientHeight || 1;
    // ResizeObserver also fires on observation start and on layout passes that
    // left the box the same size. Reallocating the drawing buffer for a size
    // that didn't change is pure cost on a tablet GPU.
    if (!force && w === this.lastW && h === this.lastH) return;
    this.lastW = w;
    this.lastH = h;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.loop.invalidate();
    // setSize() clears the WebGL buffer, so with render-on-demand the canvas
    // would flash black for a frame until the next rAF. This matters when the
    // viewport animates its width (opening/closing the room panel) — the
    // observer fires every frame. Draw synchronously so it never blanks.
    if (this.loop.isRunning && this.slots.length) this.loop.drawNow();
  }

  /** Set the render resolution. Normally capped at the device pixel ratio; with
   *  `allowSupersample` it may exceed it (up to 3x) — rendering ABOVE native then
   *  down-sampling anti-aliases the still image, so it looks crisp even when a
   *  WebView reports a low pixel ratio. */
  private applyPR(pr: number, allowSupersample = false): void {
    const clamped = allowSupersample ? Math.min(pr, 3) : Math.min(window.devicePixelRatio, pr);
    if (Math.abs(this.renderer.getPixelRatio() - clamped) < 0.001) return;
    this.renderer.setPixelRatio(clamped);
    this.resize(true); // re-fits the buffer and draws one frame at the new ratio
  }

  /** Idle (still-image) resolution: at least 2x and super-sampled for a crisp,
   *  anti-aliased picture. It renders once (on-demand), so it's nearly free. */
  private idlePR(): number {
    return Math.max(2, this.staticPR);
  }

  /** Enter/leave the low-res drag mode (dynamic resolution). Coarse while a
   *  finger drags for a smooth orbit; crisp + super-sampled again once it lifts. */
  private setViewDragging(d: boolean): void {
    if (this.viewDragging === d) return;
    this.viewDragging = d;
    if (d) this.applyPR(Math.max(0.6, this.staticPR * 0.6));
    else this.applyPR(this.idlePR(), true);
  }

  // -- Floor plan loading -----------------------------------------------------

  loadPlan(plan: FloorPlan, keepView = false): void {
    const prevTarget = this.controls.target.clone();
    const prevPos = this.camera.position.clone();
    const prevFloor = this.activeFloor;

    this.clearPlan();
    this.fullBBox.makeEmpty();
    // Fresh meshes are rebuilt with Standard materials; let optimizeForView (or
    // the adaptive pass) re-simplify them if this tier warrants it.
    this.materialsSimplified = false;

    // "Heavy" is driven by total GEOMETRY (furniture + rooms + walls), not just
    // bound devices — a big office is heavy even with few bindings. Such a plan
    // gets the aggressive path on ANY tablet (matte materials, no shadow pass,
    // few real lights) at FULL resolution, so it stays smooth AND sharp. A
    // desktop "high" tier keeps full PBR.
    const complexity = plan.floors.reduce(
      (n, f) =>
        n + (f.furniture?.length ?? 0) + (f.rooms?.length ?? 0) + (f.walls?.length ?? 0) + (f.bindings?.length ?? 0),
      0,
    );
    this.heavyPlan = complexity > 50 && this.qualityTier !== 'high';
    const maxLights = this.heavyPlan
      ? Math.min(QUALITY_PRESETS[this.qualityTier].maxLights, 3)
      : QUALITY_PRESETS[this.qualityTier].maxLights;
    // A heavy plan runs matte + shadowless, so its FRAGMENTS are cheap — spend
    // that budget on a crisp STILL image (idle renders once, on-demand, so a high
    // idle ratio is nearly free). Dynamic resolution keeps the *drag* coarse.
    this.staticPR = this.heavyPlan ? 2 : QUALITY_PRESETS[this.qualityTier].pixelRatio;

    this.skippedParts = [];
    this.loadedPlan = plan;
    plan.floors.forEach((floorDef) => {
      const built = buildFloorGroup(floorDef, plan.wallHeight);
      if (built.skipped.length) this.skippedParts.push(...built.skipped);
      const bindings = new BindingManager(built.group, maxLights);
      bindings.register(built, floorDef.bindings ?? []);
      this.scene.add(built.group);
      this.fullBBox.union(built.bbox);
      const elevation = floorDef.elevation ?? 0;
      this.slots.push({
        built,
        group: built.group,
        bindings,
        elevation,
        zones: floorDef.zones ?? [],
        // Room outlines (world XZ) for grouping markers by room.
        rooms: (floorDef.rooms ?? [])
          .map((room) => {
            // finitePolygon: a NaN corner would make every point-in-polygon test
            // and every centroid NaN, i.e. a room marker at nowhere.
            const poly = finitePolygon(isShapeRoom(room) ? roomPolygon(room) : room.polygon);
            return { name: room.name, poly: poly as [number, number][], elev: elevation, bgImage: room.bgImage };
          })
          .filter((r) => r.poly.length >= 3),
      });
    });

    if (plan.cameraDistance) this.cameraDistance = plan.cameraDistance;

    const floor = keepView ? Math.min(prevFloor, this.slots.length - 1) : 0;
    this.activeFloor = Math.max(0, floor);
    this.slots.forEach((s, i) => (s.group.visible = i === this.activeFloor));

    if (keepView) {
      this.controls.target.copy(prevTarget);
      this.camera.position.copy(prevPos);
      this.controls.update();
    } else {
      this.resetView();
    }
    this.buildMarkers();
    this.requestShadowUpdate();
  }

  /** What the last loaded plan lost to unusable numbers, for the card to show. */
  public brokenParts(): string[] {
    return this.skippedParts;
  }

  /** The built floors, for outside inspection (diagnostics / автопроверки).
   *  Read-only by convention: the scene owns these objects. */
  get floors(): FloorSlot['built'][] {
    return this.slots.map((s) => s.built);
  }

  private clearPlan(): void {
    this.trackedCache = null;
    this.roomsCache = null;
    this.presentTracked.clear();
    for (const slot of this.slots) {
      slot.bindings.dispose();
      // Label sprites are OWNED by TextLabel (canvas texture + material) and
      // freed here; the group walk below deliberately leaves every sprite alone
      // so this can't turn into a double dispose. See scene/dispose.ts.
      for (const label of slot.built.labels) label.dispose();
      this.scene.remove(slot.group);
      disposeObject3D(slot.group);
    }
    this.markers.clear();
    this.markers.clearZoneDots();
    this.slots = [];
    this.loadedPlan = null;
    this.activeFloor = 0;
  }

  setActiveFloor(index: number): void {
    if (index < 0 || index >= this.slots.length) return;
    this.activeFloor = index;
    this.slots.forEach((s, i) => {
      s.group.visible = i === index;
    });
    // Show curtains at their real open/closed state immediately (an inactive
    // floor never animated), instead of sliding on entry.
    this.slots[index]?.bindings.settleCovers();
    this.resetView();
    this.buildMarkers();
    this.requestShadowUpdate();
  }

  // -- Camera / touch hardening ----------------------------------------------

  /** Frame the active floor — the kiosk safety net. `distMul` < 1 dollies
   *  closer (e.g. the short, wide Обзор banner, where the fit-to-view distance
   *  leaves the model tiny). */
  resetView(distMul = 1): void {
    const box = this.slots[this.activeFloor]?.built.bbox ?? this.fullBBox;
    frameBox(this.camera, this.controls, box, this.cameraDistance, distMul);
  }

  /** Multiplier on the reset-view framing distance (from card config). */
  setCameraDistance(f: number): void {
    if (f > 0) this.cameraDistance = f;
  }

  /** The user's quality choice (auto/high/medium/low) for the picker UI. */
  getQualityChoice(): QualityChoice {
    return this.qualityChoice;
  }

  /** The tier actually in effect (what "auto" resolved to). */
  getQualityTier(): QualityTier {
    return this.qualityTier;
  }

  /**
   * Switch render quality at runtime. Shadows and pixel ratio apply instantly;
   * anti-aliasing is fixed when the WebGL context is created, so a change to AA
   * only takes full effect after the card reloads. Returns true if a reload is
   * needed for the AA change to show.
   */
  setQuality(choice: QualityChoice): boolean {
    const prevAA = QUALITY_PRESETS[this.qualityTier].aa;
    this.qualityChoice = choice;
    storeQuality(choice);
    this.qualityTier = choice === 'auto' ? detectTier() : choice;
    const p = QUALITY_PRESETS[this.qualityTier];

    this.staticPR = this.heavyPlan ? 2 : p.pixelRatio;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.staticPR));
    this.renderer.shadowMap.enabled = p.shadows;
    this.renderer.shadowMap.type = p.shadowType;
    if (this.sun) {
      this.sun.castShadow = p.shadows;
      this.sun.shadow.mapSize.set(p.shadowMap, p.shadowMap);
      // Drop the old shadow map so it's re-created at the new size.
      this.sun.shadow.map?.dispose();
      (this.sun.shadow as any).map = null;
    }
    this.recompileMaterials();
    // A deliberate quality pick clears any adaptive degrade and re-arms it.
    this.adaptive.reset();
    this.requestShadowUpdate();
    this.resize(true);
    return prevAA !== p.aa;
  }

  /** Force every material to recompile, so shadow support is added/removed. */
  private recompileMaterials(): void {
    this.scene.traverse((o) => {
      const m = (o as THREE.Mesh).material;
      if (m) (Array.isArray(m) ? m : [m]).forEach((mm) => (mm.needsUpdate = true));
    });
  }

  // -- Picking ----------------------------------------------------------------

  setPickHandler(handler: (r: ClickResult | null) => void): void {
    this.onPick = handler;
  }

  private setupPointer(): void {
    const el = this.renderer.domElement;
    el.addEventListener('pointerdown', (e) => {
      // Новая серия касаний: «зависшие» указатели прошлого жеста забываем —
      // иначе один потерянный pointerup выключил бы тапы навсегда.
      if (e.isPrimary) {
        this.downIds.clear();
        this.multiTouch = false;
      }
      this.downIds.add(e.pointerId);
      if (this.downIds.size > 1) this.multiTouch = true;
      this.downPos = { x: e.clientX, y: e.clientY };
      this.downTime = performance.now();
      // Editing: a single-pointer press may grab a draggable object.
      if (this.editing && e.isPrimary && this.onDrag && this.onDrag.start(e)) {
        this.dragging = true;
        this.applyCameraGate(); // suspend the camera while dragging
        try {
          el.setPointerCapture(e.pointerId);
        } catch {
          /* ignore */
        }
      }
    });
    el.addEventListener('pointerup', (e) => {
      const wasMulti = this.multiTouch;
      this.downIds.delete(e.pointerId);
      if (!this.downIds.size) this.multiTouch = false;
      if (this.dragging) {
        this.dragging = false;
        this.applyCameraGate(); // mappings (LEFT/ONE) are unchanged
        this.onDrag?.end();
        try {
          el.releasePointerCapture(e.pointerId);
        } catch {
          /* ignore */
        }
        return;
      }
      const dx = e.clientX - this.downPos.x;
      const dy = e.clientY - this.downPos.y;
      const moved = Math.hypot(dx, dy);
      const dt = performance.now() - this.downTime;
      // Treat as a tap only if it didn't move much and wasn't a long press.
      // Fingers (and pens) jitter far more than a mouse, so only the mouse gets
      // the tight slop — touch/pen/unknown get a generous one, otherwise a
      // slightly-imperfect tablet tap is misread as a drag and the control
      // popup never opens.
      const slop = e.pointerType === 'mouse' ? 6 : 12;
      if (moved >= slop || dt >= 600) return;
      // В жесте участвовал второй палец — это щипок или поворот, а не тап.
      if (wasMulti) return;
      if (this.editing && this.onGround?.click) {
        const p = this.groundIntersect(e);
        if (p) this.onGround.click(p, e);
      } else {
        this.handlePick(e);
      }
    });
    el.addEventListener('pointermove', (e) => {
      if (this.dragging && this.onDrag) {
        const p = this.groundIntersect(e);
        if (p) this.onDrag.move(p, e);
        // A move handler may rebuild the scene, which re-applies edit state.
        // Re-assert the gate for the whole drag (invariant: no orbit while
        // dragging) — it is cheap and self-documenting.
        this.applyCameraGate();
        return;
      }
      if (this.editing && this.onGround?.move) {
        const p = this.groundIntersect(e);
        if (p) this.onGround.move(p, e);
      }
    });
  }

  /** The single writer of `controls.enabled`: the camera is live unless a
   *  grabbed object is being dragged. Before this, three places set the flag
   *  independently and the last one to run won. */
  private applyCameraGate(): void {
    this.controls.enabled = !this.dragging;
  }

  setDragHandler(h?: {
    start: (e: PointerEvent) => boolean;
    move: (p: THREE.Vector3, e: PointerEvent) => void;
    end: () => void;
  }): void {
    this.onDrag = h;
  }

  /** Keep the selection box aligned after moving an object live (during drag). */
  refreshSelection(): void {
    this.selection.refresh();
  }

  // -- Editor API -------------------------------------------------------------

  setEditMode(on: boolean, elevation = 0): void {
    this.editing = on;
    // Схема пальцев зависит от режима, и переключить её надо здесь: выход из
    // правки идёт через setEditMode(false), а не только через setDrawMode.
    applyTouchScheme(this.controls, on);
    // The editor draws every frame: previews follow the pointer, so there is
    // nothing to invalidate on.
    this.loop.setContinuous(on);
    this.groundPlane.constant = -elevation;
    // A per-room design photo must never show while editing; restore it on exit.
    this.applyBackdrop();
    if (on) {
      if (!this.gridHelper) {
        this.gridHelper = new THREE.GridHelper(40, 80, 0x4aa3ff, 0x2a3340);
        (this.gridHelper.material as THREE.Material).transparent = true;
        (this.gridHelper.material as THREE.Material).opacity = 0.5;
        this.scene.add(this.gridHelper);
      }
      this.gridHelper.position.y = elevation + 0.002;
      this.gridHelper.visible = true;
    } else {
      if (this.gridHelper) this.gridHelper.visible = false;
      this.clearPreview();
      this.setSelection(null);
    }
    // Markers are a view-mode affordance — hide them while editing so they
    // don't sit on top of the editor's gizmos and previews.
    this.buildMarkers();
  }

  /** (Re)build the floating device markers for the active floor. Cleared while
   *  editing or when there are no bindings. */
  private buildMarkers(): void {
    // The room grouping is being rebuilt — the cached whole-home view of it
    // (roomsByFloor) is stale by definition.
    this.roomsCache = null;
    // План строится РАНЬШЕ, чем приходят состояния: на этом проходе проверить
    // «есть ли сущность в Home Assistant» нечем, и привязки к удалённым
    // устройствам собираются в отдельную «комнату» с маркером, которую человек
    // не может удалить — в плане её нет. Запоминаем, что собрали вслепую, и
    // пересоберём, как только состояния появятся.
    this.markersBlind = !this.lastHass;
    this.activeRooms = [];
    this.roomKeysByOutline = [];
    const slot = this.slots[this.activeFloor];
    if (this.editing || !slot) {
      this.markers.clear();
      this.onRoomsChanged?.([]);
      return;
    }

    const { rooms, loose, roomKeysByOutline } = groupRooms({
      devices: slot.bindings.markerData(),
      outlines: slot.rooms,
      zones: slot.zones,
      elevation: slot.elevation,
      hass: this.lastHass,
    });
    this.roomKeysByOutline = roomKeysByOutline;
    const sprites = this.markers.build(rooms, loose);
    rooms.forEach((room, i) => this.activeRooms.push({ ...room, sprite: sprites[i] }));
    // Drop a stale selection that no longer maps to a room on this floor.
    if (this.selectedRoomKey && !this.activeRooms.some((r) => r.key === this.selectedRoomKey)) {
      this.selectedRoomKey = null;
      this.markers.setSelected(null);
    }
    // Re-apply the focused room's backdrop — its photo may have changed (a live
    // edit / plan sync) or the selection may have just been dropped.
    const selRoom = this.selectedRoomKey
      ? this.activeRooms.find((r) => r.key === this.selectedRoomKey)
      : null;
    this.setRoomBackdrop(selRoom?.bgImage ?? null);
    this.onRoomsChanged?.(this.getRooms());
  }

  /** Register a listener for the active floor's room list (pills + panel). */
  setRoomsHandler(fn: (rooms: RoomInfo[]) => void): void {
    this.onRoomsChanged = fn;
  }

  /** Rooms on the active floor, in build order (zones first, then auto-grouped).
   *  Deliberately a narrowed copy: the pills and the side panel take exactly
   *  these fields, and the sprite must never leave the scene. */
  getRooms(): RoomInfo[] {
    return this.activeRooms.map((r) => ({ key: r.key, name: r.name, entities: r.entities, center: r.center, bgImage: r.bgImage, tempSensor: r.tempSensor, floorSensor: r.floorSensor, humiditySensor: r.humiditySensor }));
  }

  /** Every floor's rooms (index = floor), for the whole-home Обзор dashboard.
   *  Room keys are floor-qualified (`f{n}::…`) so they stay unique across
   *  floors — the active-floor getRooms() keys never contain "::".
   *
   *  CACHED: the card calls this from render(), and the work inside is a
   *  point-in-polygon test per device per room per floor (300 devices x 20
   *  rooms x 3 floors = thousands of tests) — for an answer that only changes
   *  when the plan changes or a tracked entity appears/disappears. */
  roomsByFloor(): RoomInfo[][] {
    if (!this.roomsCache) {
      this.roomsCache = this.slots.map((slot, fi) =>
        groupRooms({
          devices: slot.bindings.markerData(),
          outlines: slot.rooms,
          zones: slot.zones,
          elevation: slot.elevation,
          hass: this.lastHass,
          keyPrefix: `f${fi}::`,
        }).rooms,
      );
    }
    return this.roomsCache;
  }

  /** Every entity the scene reacts to: bound entities plus the ones a manual
   *  zone lists. The card diffs only these instead of walking all ~2000 states
   *  in the home on every update. */
  trackedEntities(): ReadonlySet<string> {
    if (!this.trackedCache) {
      const s = new Set<string>();
      for (const slot of this.slots) {
        for (const id of slot.bindings.entityIds()) s.add(id);
        for (const z of slot.zones) for (const id of z.entities ?? []) s.add(id);
      }
      this.trackedCache = s;
    }
    return this.trackedCache;
  }

  /** Note whether a tracked entity exists right now; a flip (renamed, removed,
   *  newly added) is the only state change that alters the room grouping. */
  private notePresence(entityId: string, hass: any): boolean {
    if (!this.trackedEntities().has(entityId)) return false;
    const now = !!hass?.states?.[entityId];
    const was = this.presentTracked.has(entityId);
    if (now === was) return false;
    if (now) this.presentTracked.add(entityId);
    else this.presentTracked.delete(entityId);
    this.roomsCache = null;
    return true;
  }

  private notePresenceAll(hass: any): boolean {
    let flipped = false;
    for (const id of this.trackedEntities()) if (this.notePresence(id, hass)) flipped = true;
    return flipped;
  }

  /** Rooms with a live water-leak alarm: their pins flash red (see markers.ts). */
  setAlarmRooms(keys: string[]): void {
    this.markers.setAlarmRooms(keys);
  }

  /** Highlight one room's pin (accent) and neutralise the rest. */
  selectRoom(key: string | null): void {
    this.selectedRoomKey = key;
    this.markers.setSelected(key);
    // Show the focused room's design photo behind the 3D (view mode only).
    const room = key ? this.activeRooms.find((r) => r.key === key) : null;
    this.setRoomBackdrop(room?.bgImage ?? null);
    this.markers.repaint();
  }

  /** Set the focused room's design photo as the 3D backdrop. Pass null to want
   *  no photo. The photo is only actually shown in view mode — applyBackdrop()
   *  falls back to the gradient while editing so it never disturbs the editor. */
  setRoomBackdrop(url: string | null): void {
    // `true` means "already the current request" — nothing will load, but the
    // backdrop may still need re-applying (e.g. leaving edit mode).
    if (this.photo.request(url)) this.applyBackdrop();
  }

  /** Register the card's photo-layer setter. */
  setBackdropHandler(fn: (url: string | null) => void): void {
    this.onBackdrop = fn;
    fn(this.photo.url);
  }

  /** Origin for resolving root-relative asset paths (see RoomPhoto). */
  setImageBase(base: string): void {
    this.photo.setImageBase(base);
  }

  /** Choose what's behind the 3D: with a room photo up the scene goes
   *  transparent so the card's photo layer shows through (and reaches behind the
   *  side panel); otherwise the default gradient fills the canvas as before. */
  private applyBackdrop(): void {
    const photo = !this.editing && this.photo.url;
    const next = photo ? null : this.defaultBackdrop;
    if (this.scene.background !== next) {
      this.scene.background = next;
      this.renderer.setClearAlpha(photo ? 0 : 1);
      this.loop.invalidate();
    }
  }

  /** Show hand-placed zone icons while editing (so they can be positioned). */
  drawZoneDots(zones: { id: string; x: number; z: number; name?: string }[], elev: number, selId?: string | null): void {
    this.markers.drawZoneDots(zones, elev + ROOM_MARKER_Y, selId);
  }

  /** The scene node of the floor currently on screen (null before a plan). */
  private get activeGroup(): THREE.Group | null {
    return this.slots[this.activeFloor]?.group ?? null;
  }

  /** Raycast a pointer event against the active floor; return the furniture
   *  placement it hits (by id), walking up to the placement group. */
  pickFurniture(e: PointerEvent): { id: string; object: THREE.Object3D } | null {
    const group = this.activeGroup;
    return group ? this.picker.furniture(e, group) : null;
  }

  getFurnitureObject(id: string): THREE.Object3D | undefined {
    return this.slots[this.activeFloor]?.built.furnitureById.get(id);
  }

  getWallObject(index: number): THREE.Object3D | undefined {
    return this.slots[this.activeFloor]?.built.wallById.get(index);
  }

  getRoomObject(index: number): THREE.Object3D | undefined {
    return this.slots[this.activeFloor]?.built.roomById.get(index);
  }

  /** The same wall, found by WallDef.id — the key that survives a delete or a
   *  mergeWalls(), which the array index does not. */
  getWallObjectById(id: string): THREE.Object3D | undefined {
    return this.slots[this.activeFloor]?.built.wallByKey.get(id);
  }

  /** The same room, found by RoomDef.id (see getWallObjectById). */
  getRoomObjectById(id: string): THREE.Object3D | undefined {
    return this.slots[this.activeFloor]?.built.roomByKey.get(id);
  }

  /** Raycast for a wall sub-group (returns its array-index AND its id). */
  pickWall(e: PointerEvent): { index: number; id?: string; object: THREE.Object3D } | null {
    const group = this.activeGroup;
    const hit = group ? this.picker.byTag(e, group, 'wallIndex') : null;
    return hit ? { ...hit, id: hit.object.userData?.wallId as string | undefined } : null;
  }

  /** Raycast for a room floor mesh (returns its array-index AND its id). */
  pickRoom(e: PointerEvent): { index: number; id?: string; object: THREE.Object3D } | null {
    const group = this.activeGroup;
    const hit = group ? this.picker.byTag(e, group, 'roomIndex') : null;
    return hit ? { ...hit, id: hit.object.userData?.roomId as string | undefined } : null;
  }

  /** Raycast for a door/window leaf — returns the wall + opening (index and id)
   *  so the opening can be selected directly, without selecting the wall first. */
  pickOpening(e: PointerEvent): {
    wallIndex: number;
    openingIndex: number;
    wallId?: string;
    openingId?: string;
    object: THREE.Object3D;
  } | null {
    const group = this.activeGroup;
    const hit = group ? this.picker.opening(e, group) : null;
    if (!hit) return null;
    return {
      ...hit,
      wallId: hit.object.userData?.openingWallId as string | undefined,
      openingId: hit.object.userData?.openingId as string | undefined,
    };
  }

  // -- In-place edits (a gesture must not rebuild the house) ------------------

  /** The floor definition the active slot was built from. */
  private activeFloorDef(): FloorDef | null {
    return this.loadedPlan?.floors?.[this.activeFloor] ?? null;
  }

  /**
   * Offset ONE wall by (dx, dz) without touching geometry.
   *
   * Wall spans are built at world coordinates inside the wall's own group, so a
   * pure translation of the whole wall is exactly the group's position — no
   * re-cut, no rebuild. This is what makes dragging a wall on a tablet cost the
   * same as dragging a chair.
   */
  offsetWall(index: number, dx: number, dz: number): void {
    const obj = this.slots[this.activeFloor]?.built.wallById.get(index);
    if (!obj) return;
    obj.position.set(dx, 0, dz);
    this.selection.refresh();
    this.loop.invalidate();
  }

  /**
   * Re-cut ONLY the named walls / rooms of the active floor, in place.
   *
   * Everything else — the other 300 walls, every piece of furniture, every
   * binding and every label — stays exactly as it is. Used while a gesture is
   * running (a vertex dragged, a door slid, a room resized) and for property
   * edits that touch one element, where a full loadPlan() used to be spent on
   * every keystroke.
   */
  refreshParts(parts: { walls?: number[]; rooms?: number[] }): void {
    const slot = this.slots[this.activeFloor];
    const floorDef = this.activeFloorDef();
    if (!slot || !floorDef) return;
    const defaultHeight = floorWallHeight(floorDef, this.loadedPlan?.wallHeight);
    const drop = (obj: THREE.Object3D | undefined): void => {
      if (!obj) return;
      slot.group.remove(obj);
      disposeObject3D(obj);
    };

    for (const i of parts.walls ?? []) {
      const old = slot.built.wallById.get(i);
      if (old) {
        drop(old);
        slot.built.wallById.delete(i);
        const key = old.userData?.wallId as string | undefined;
        if (key && slot.built.wallByKey.get(key) === old) slot.built.wallByKey.delete(key);
      }
      const wall = floorDef.walls?.[i];
      if (!wall) continue;
      try {
        const wg = buildWallElement(slot.group, wall, i, defaultHeight);
        if (wg) {
          slot.built.wallById.set(i, wg);
          if (wall.id) slot.built.wallByKey.set(wall.id, wg);
        }
      } catch {
        /* Unusable coordinates mid-drag: draw nothing, exactly as a full build
           would have. The next full rebuild reports it to the human. */
      }
    }

    for (const i of parts.rooms ?? []) {
      const old = slot.built.roomById.get(i);
      if (old) {
        slot.built.roomById.delete(i);
        const key = old.userData?.roomId as string | undefined;
        if (key && slot.built.roomByKey.get(key) === old) slot.built.roomByKey.delete(key);
      }
      // A shape room owns its perimeter walls too — they carry its roomIndex.
      for (const child of [...slot.group.children]) {
        if (child.userData?.roomIndex === i) drop(child);
      }
      const room = floorDef.rooms?.[i];
      if (!room) continue;
      try {
        const mesh = buildRoomElement(slot.group, room, i, defaultHeight);
        if (mesh) {
          slot.built.roomById.set(i, mesh);
          if (room.id) slot.built.roomByKey.set(room.id, mesh);
        }
      } catch {
        /* see above */
      }
    }

    // Room outlines feed the marker grouping; they are derived from the same
    // polygons, so they go stale with them.
    slot.rooms = (floorDef.rooms ?? [])
      .map((room) => {
        const poly = finitePolygon(isShapeRoom(room) ? roomPolygon(room) : room.polygon);
        return {
          name: room.name,
          poly: poly as [number, number][],
          elev: slot.elevation,
          bgImage: room.bgImage,
        };
      })
      .filter((r) => r.poly.length >= 3);
    slot.built.bbox.setFromObject(slot.group);
    this.selection.refresh();
    this.requestShadowUpdate();
    this.loop.invalidate();
  }

  /** Raycast the gizmo handles; returns the handle id (userData.gizmoHandle). */
  pickGizmo(e: PointerEvent): string | null {
    return this.picker.gizmo(e, this.gizmoGroup);
  }

  clearGizmo(): void {
    for (const child of [...this.gizmoGroup.children]) {
      const mesh = child as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      if (mesh.material) {
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mats.forEach((m) => m.dispose());
      }
    }
    this.gizmoGroup.clear();
  }

  /** Highlight a selected object with a bounding box, or clear it. */
  setSelection(obj: THREE.Object3D | null): void {
    this.selection.set(obj);
  }

  setGroundHandler(h?: { click?: (p: THREE.Vector3, e: PointerEvent) => void; move?: (p: THREE.Vector3, e: PointerEvent) => void }): void {
    this.onGround = h;
  }

  /** Restore the normal camera mappings (left orbit, right pan, wheel zoom).
   *  The `drawing` argument is kept for call-site compatibility: the camera is
   *  always fully controllable while editing, and only a real drag suspends it. */
  setDrawMode(_drawing: boolean): void {
    this.applyCameraGate();
    applyDrawMode(this.controls, this.editing);
  }

  /** Reserve LEFT mouse / one finger for dragging the selected object. */
  setLeftReserved(reserved: boolean): void {
    if (reserved) applyLeftReserved(this.controls);
    else this.setDrawMode(true);
  }

  /** Raycast a pointer event onto the current ground plane. */
  groundIntersect(e: PointerEvent): THREE.Vector3 | null {
    return this.picker.ground(e, this.groundPlane);
  }

  clearPreview(): void {
    for (const child of [...this.previewGroup.children]) {
      const mesh = child as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      if (mesh.material) {
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mats.forEach((m) => m.dispose());
      }
    }
    this.previewGroup.clear();
  }

  /** Show (or clear, when null) a flat reference image on the floor plane that
   *  walls can be traced over. Editor-only; not part of the rendered plan. */
  setUnderlay(u: Underlay | null, elevation = 0): void {
    setUnderlay(this.underlayGroup, u, elevation);
  }

  private handlePick(e: PointerEvent): void {
    if (!this.onPick) return;

    // Floating markers are larger, always-on-top tap targets — check them first
    // so they're the easy way to hit a bound device.
    const marker = this.picker.marker(e, this.markers.group);
    if (marker) {
      const ud = marker.userData;
      const screen = this.picker.screenPos(e);
      const point: [number, number, number] = [ud.wx, ud.wy, ud.wz];
      if (ud.roomMarker) {
        this.onPick({ entity_id: '', behavior: 'room', roomEntities: ud.roomEntities, roomName: ud.roomName, roomKey: ud.roomKey, point, screen });
      } else {
        this.onPick({ entity_id: ud.markerEntity as string, behavior: ud.markerBehavior as string, point, screen });
      }
      return;
    }

    // Кружок климата стоит вплотную к «домику» и обязан вести туда же: иначе
    // под крупной кнопкой комнаты появляется полоса, где палец «не работает».
    const badge = this.picker.marker(e, this.markers.badgeGroup);
    if (badge) {
      const room = this.activeRooms.find((r) => r.key === badge.userData.roomKey);
      if (room) {
        this.onPick({
          entity_id: '',
          behavior: 'room',
          roomEntities: room.entities,
          roomName: room.name,
          roomKey: room.key,
          point: room.center,
          screen: this.picker.screenPos(e),
        });
        return;
      }
    }

    const slot = this.slots[this.activeFloor];
    if (!slot) {
      this.onPick(null);
      return;
    }
    const hit = this.picker.anchors(e, slot.bindings.anchors);
    const result = hit ? slot.bindings.resolveClick(hit.object) : null;
    if (result) {
      const p = hit!.point;
      result.point = [p.x, p.y, p.z];
      result.screen = this.picker.screenPos(e);
      this.onPick(result);
      return;
    }

    // Ничего конкретного под пальцем не оказалось — остаётся САМА КОМНАТА.
    // Порядок разбора тапа: устройство → домик → пол комнаты. Попасть в
    // маленький значок на планшете трудно, а в пол комнаты — нет.
    const room = this.roomOnFloor(e, slot);
    this.onPick(
      room
        ? {
            entity_id: '',
            behavior: 'room',
            roomEntities: room.entities,
            roomName: room.name,
            roomKey: room.key,
            point: room.center,
            screen: this.picker.screenPos(e),
          }
        : null,
    );
  }

  /** Комната, по полу которой пришёлся тап. Луч кладётся на плоскость ЭТОГО
   *  этажа, а дальше отвечает одна общая машинка контуров (roomAtPoint).
   *
   *  В режиме правки этого пути нет вовсе: там тап уходит редактору
   *  (setupPointer), а группировка комнат на время правки не строится
   *  (buildMarkers) — значков нет, и отвечать было бы нечем. */
  private roomOnFloor(e: PointerEvent, slot: FloorSlot): (RoomInfo & { sprite: THREE.Sprite }) | null {
    if (!this.activeRooms.length) return null;
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -slot.elevation);
    const p = this.picker.ground(e, plane);
    if (!p) return null;
    return roomAtPoint(p.x, p.z, slot.rooms, this.roomKeysByOutline, this.activeRooms);
  }

  /** Bound entities near a world point (for the control popup). */
  entitiesNear(point: [number, number, number], radius: number): { entity_id: string; behavior: string }[] {
    const slot = this.slots[this.activeFloor];
    if (!slot) return [];
    return slot.bindings.near(new THREE.Vector3(point[0], point[1], point[2]), radius);
  }

  /**
   * Targeted live update for a single entity.
   *
   * Asks for a redraw ONLY when this entity actually changed something visible.
   * It used to set needsRender for ANY entity — so one power meter ticking once
   * a second held the GPU in a permanent render loop and quietly cancelled the
   * whole render-on-demand design the weak-tablet performance rests on.
   */
  updateEntity(entityId: string, hass: any): void {
    this.lastHass = hass;
    let changed = false;
    // Every floor: another floor may bind the same entity (cheap — the manager
    // answers from a map and returns immediately when it doesn't hold it).
    for (const slot of this.slots) {
      if (slot.bindings.updateEntity(entityId, hass)) changed = true;
    }
    if (this.markers.refreshOne(entityId, hass)) changed = true;
    if (this.notePresence(entityId, hass) || this.markersBlind) {
      this.buildMarkers(); // появилась/пропала сущность или маркеры собраны вслепую
      changed = true;
    }
    if (changed) this.loop.invalidate();
  }

  /** Full state sync (called on each hass update from the card). */
  syncAll(hass: any): void {
    this.lastHass = hass;
    let changed = false;
    for (const slot of this.slots) if (slot.bindings.update(hass)) changed = true;
    if (this.markers.refreshAll(hass)) changed = true;
    // Появление или ИСЧЕЗНОВЕНИЕ отслеживаемой сущности меняет саму раскладку
    // комнат, а не только их цвет: маркеры надо строить заново.
    //
    // Почему это важно. План строится РАНЬШЕ, чем приходят состояния, поэтому
    // фильтр «сущности нет в Home Assistant» на первом проходе пропускает
    // всё. Когда состояния приходят, пропажа замечается, но раньше сбрасывался
    // только кэш «Обзора» — сами маркеры оставались. На офисном объекте это
    // дало ДВА «домика» в одной комнате: второй был собран из четырёх
    // привязок к устройствам, которых в Home Assistant уже нет. Удалить его
    // человек не мог — в плане такой комнаты нет, она вычисляется на лету.
    if (this.notePresenceAll(hass) || this.markersBlind) {
      this.buildMarkers();
      changed = true;
    }
    if (changed) this.loop.invalidate();
  }

  // -- Render loop ------------------------------------------------------------

  start(): void {
    this.loop.start();
  }

  stop(): void {
    this.loop.stop();
  }

  /**
   * Give EVERYTHING back. Until this was actually called (and actually
   * complete), every open-and-close of the panel left behind a WebGLRenderer
   * with its own GL context, all of the plan's geometry, materials and
   * textures, two window listeners pinning the manager to `window`, and the
   * leak-flash timer. A browser keeps only ~8-16 WebGL contexts (8 in some
   * Android WebViews) and silently kills the oldest to make room — which is
   * exactly how a wall panel that has been opened a few times ends up showing
   * a black rectangle with nothing in the console.
   */
  dispose(): void {
    this.stop();
    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;
    this.viewObserver?.disconnect();
    this.viewObserver = undefined;
    for (const off of this.teardown) {
      try {
        off();
      } catch {
        /* keep tearing the rest down */
      }
    }
    this.teardown = [];
    this.markers.dispose();

    this.clearPlan();
    this.clearPreview();
    this.clearGizmo();
    this.setUnderlay(null);
    this.setSelection(null);
    if (this.gridHelper) {
      this.scene.remove(this.gridHelper);
      disposeObject3D(this.gridHelper);
      this.gridHelper = undefined;
    }
    // The gradient backdrop is a 512x512 CanvasTexture built per scene.
    this.defaultBackdrop?.dispose();
    this.scene.background = null;
    this.sun?.shadow?.map?.dispose();
    this.scene.clear();

    this.onPick = undefined;
    this.onRoomsChanged = undefined;
    this.onBackdrop = undefined;
    this.onGround = undefined;
    this.onDrag = undefined;
    this.lastHass = undefined;

    this.controls.dispose();
    this.renderer.dispose();
    // dispose() frees Three's own caches but leaves the GL context itself to
    // the garbage collector — which is far too late when the browser's context
    // budget is 8. Hand it back explicitly.
    this.renderer.forceContextLoss();
    this.renderer.domElement.width = 0;
    this.renderer.domElement.height = 0;
    this.renderer.domElement.remove();
  }
}
