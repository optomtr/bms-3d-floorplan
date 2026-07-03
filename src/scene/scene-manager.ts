// ---------------------------------------------------------------------------
// SceneManager: owns the Three.js renderer, camera, controls, lights and the
// render loop. Handles the critical tablet-touch hardening from the brief:
//   - touch-action:none is set on the canvas (see card CSS) so the browser
//     never hijacks pinch into page zoom.
//   - OrbitControls with damping, min/max distance clamps, target clamped to
//     the floor bounding box, and a reset-view that recenters instantly.
// ---------------------------------------------------------------------------

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { FloorPlan, Underlay } from '../types';
import { buildFloorGroup, BuiltFloor } from './builder';
import { BindingManager } from './bindings';
import { drawMarkerCanvas, markerIconName } from './icons';

// ---------------------------------------------------------------------------
// Render quality tiers. Weak mobile GPUs (e.g. Adreno 610 in a Redmi Pad SE)
// choke on the per-frame shadow pass and 2x pixel ratio when a large plan has
// hundreds of meshes. We auto-detect the device tier and let the user override
// it at runtime; the choice is saved per-device (localStorage), so a kiosk
// tablet keeps "low" while a desktop dashboard keeps "high".
// ---------------------------------------------------------------------------

export type QualityChoice = 'auto' | 'high' | 'medium' | 'low';
export const QUALITY_CHOICES: QualityChoice[] = ['auto', 'high', 'medium', 'low'];
type QualityTier = 'high' | 'medium' | 'low';

interface QualityPreset {
  shadows: boolean;
  shadowType: THREE.ShadowMapType;
  shadowMap: number;
  pixelRatio: number;
  aa: boolean;
}

const QUALITY_PRESETS: Record<QualityTier, QualityPreset> = {
  // "high" is intentionally identical to the original hard-coded settings, so
  // capable devices see zero change.
  high: { shadows: true, shadowType: THREE.PCFSoftShadowMap, shadowMap: 1024, pixelRatio: 2, aa: true },
  medium: { shadows: true, shadowType: THREE.PCFShadowMap, shadowMap: 1024, pixelRatio: 1.5, aa: true },
  // The big win for weak GPUs is dropping the shadow pass entirely; the pixel
  // ratio only comes down to 1.5 (not 1) so it doesn't look soft on a tablet.
  low: { shadows: false, shadowType: THREE.BasicShadowMap, shadowMap: 512, pixelRatio: 1.5, aa: false },
};

const QUALITY_KEY = 'ha3dFloorplanQuality';

function readStoredQuality(): QualityChoice {
  try {
    const v = localStorage.getItem(QUALITY_KEY);
    if (v === 'high' || v === 'medium' || v === 'low' || v === 'auto') return v;
  } catch {
    /* ignore */
  }
  return 'auto';
}

/** Best-effort device tier from the GPU string + CPU/memory hints. */
function detectTier(): QualityTier {
  try {
    const canvas = document.createElement('canvas');
    const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    let renderer = '';
    if (gl) {
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      if (ext) renderer = String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || '').toLowerCase();
    }
    // Known weak / low-end mobile GPUs → low.
    if (/adreno \(tm\) (?:[1-5]\d\d|6[0-4]\d)\b|adreno (?:[1-5]\d\d|6[0-4]\d)\b|mali-g5|mali-g3|mali-4|mali-t|powervr|videocore|apple a[789]\b/.test(renderer)) {
      return 'low';
    }
    const mem = (navigator as any).deviceMemory ?? 4;
    const cores = navigator.hardwareConcurrency ?? 4;
    const touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    // A touch device whose GPU string is hidden (privacy) is conservatively
    // treated as a tablet: never auto-select "high" (the user can still opt in).
    if (touch) return mem <= 3 || cores <= 4 ? 'low' : 'medium';
    if (mem <= 4 || cores <= 4) return 'medium';
    return 'high';
  } catch {
    return 'medium';
  }
}

export interface ClickResult {
  entity_id: string;
  behavior: string;
  /** World-space hit point, for finding other entities near the tap. */
  point?: [number, number, number];
  /** Screen position (px, relative to the canvas) of the tap, for popup anchoring. */
  screen?: [number, number];
}

export class SceneManager {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene: THREE.Scene;
  readonly camera: THREE.PerspectiveCamera;
  readonly controls: OrbitControls;

  private container: HTMLElement;
  private clock = new THREE.Clock();
  private running = false;
  private rafId = 0;
  private resizeObserver?: ResizeObserver;

  private floors: BuiltFloor[] = [];
  private floorGroups: THREE.Group[] = [];
  private bindingManagers: BindingManager[] = [];
  private activeFloor = 0;
  private fullBBox = new THREE.Box3();
  /** Framing-distance multiplier for resetView (config: cameraDistance). */
  private cameraDistance = 1;

  /** Render-quality (device-adaptive; user-overridable at runtime). */
  private qualityChoice: QualityChoice = 'auto';
  private qualityTier: QualityTier = 'high';
  private sun?: THREE.DirectionalLight;
  /** Last-loaded plan, so a quality change can recompile in place. */
  private lastPlan?: FloorPlan;

  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();
  private onPick?: (r: ClickResult | null) => void;

  // pointerdown bookkeeping to distinguish a tap from a drag.
  private downPos = { x: 0, y: 0 };
  private downTime = 0;

  // -- Editor support --
  /** Editor preview meshes (wall ghosts, point dots) live here. */
  readonly previewGroup = new THREE.Group();
  /** Gizmo handle meshes (Position Helper) live here. */
  readonly gizmoGroup = new THREE.Group();
  /** Reference-image underlay (tracing guide) lives here. */
  readonly underlayGroup = new THREE.Group();
  /** Floating, always-on-top device icons (Zircon-style tap targets). */
  readonly markerGroup = new THREE.Group();
  /** One texture per icon, SHARED across markers — so a plan with 150 bound
   *  entities uses ~6 marker textures, not 150. */
  private markerTexCache = new Map<string, THREE.Texture>();
  private editing = false;
  private gridHelper?: THREE.GridHelper;
  private selectionHelper?: THREE.BoxHelper;
  private groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  private onGround?: {
    click?: (p: THREE.Vector3, e: PointerEvent) => void;
    move?: (p: THREE.Vector3, e: PointerEvent) => void;
  };
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

    this.renderer = new THREE.WebGLRenderer({ antialias: preset.aa, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, preset.pixelRatio));
    this.renderer.shadowMap.enabled = preset.shadows;
    this.renderer.shadowMap.type = preset.shadowType;
    this.renderer.domElement.style.touchAction = 'none';
    this.renderer.domElement.style.display = 'block';
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(background);
    this.scene.add(this.previewGroup);
    this.scene.add(this.gizmoGroup);
    this.scene.add(this.underlayGroup);
    this.scene.add(this.markerGroup);

    this.camera = new THREE.PerspectiveCamera(55, 1, 0.1, 1000);
    this.camera.position.set(8, 8, 8);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.12;
    this.controls.screenSpacePanning = false;
    // Zoom toward the cursor / two-finger pinch midpoint, not a fixed point.
    this.controls.zoomToCursor = true;
    this.controls.minDistance = 2;
    this.controls.maxDistance = 40;
    // Keep the camera above the floor so you can't flip under the building.
    this.controls.maxPolarAngle = Math.PI * 0.49;
    this.controls.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: THREE.TOUCH.DOLLY_PAN,
    };
    // Clamp panning to the floor bbox after every change.
    this.controls.addEventListener('change', () => this.clampTarget());

    this.setupLights();
    this.setupResize();
    this.setupPointer();
  }

  private setupLights(): void {
    const ambient = new THREE.AmbientLight(0xffffff, 0.55);
    this.scene.add(ambient);

    const preset = QUALITY_PRESETS[this.qualityTier];
    const dir = new THREE.DirectionalLight(0xffffff, 0.9);
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

    const hemi = new THREE.HemisphereLight(0xffffff, 0x444455, 0.4);
    this.scene.add(hemi);
  }

  private setupResize(): void {
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.container);
    this.resize();
  }

  private resize(): void {
    const w = this.container.clientWidth || 1;
    const h = this.container.clientHeight || 1;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  // -- Floor plan loading -----------------------------------------------------

  loadPlan(plan: FloorPlan, keepView = false): void {
    this.lastPlan = plan;
    const prevTarget = this.controls.target.clone();
    const prevPos = this.camera.position.clone();
    const prevFloor = this.activeFloor;

    this.clearPlan();
    this.fullBBox.makeEmpty();

    plan.floors.forEach((floorDef) => {
      const built = buildFloorGroup(floorDef, plan.wallHeight);
      const bm = new BindingManager(built.group);
      bm.register(built, floorDef.bindings ?? []);
      this.scene.add(built.group);
      this.floors.push(built);
      this.floorGroups.push(built.group);
      this.bindingManagers.push(bm);
      this.fullBBox.union(built.bbox);
    });

    if (plan.cameraDistance) this.cameraDistance = plan.cameraDistance;

    const floor = keepView ? Math.min(prevFloor, this.floors.length - 1) : 0;
    this.activeFloor = Math.max(0, floor);
    this.floorGroups.forEach((g, i) => (g.visible = i === this.activeFloor));

    if (keepView) {
      this.controls.target.copy(prevTarget);
      this.camera.position.copy(prevPos);
      this.controls.update();
    } else {
      this.resetView();
    }
    this.buildMarkers();
  }

  private clearPlan(): void {
    for (const bm of this.bindingManagers) bm.dispose();
    for (const f of this.floors) {
      // CanvasTexture-backed sprite labels aren't freed by mesh disposal.
      for (const label of f.labels) label.dispose();
    }
    for (const g of this.floorGroups) {
      this.scene.remove(g);
      disposeGroup(g);
    }
    for (const child of [...this.markerGroup.children]) {
      // Textures are cached/shared — free only the per-sprite material.
      (child as THREE.Sprite).material.dispose();
    }
    this.markerGroup.clear();
    this.floors = [];
    this.floorGroups = [];
    this.bindingManagers = [];
    this.activeFloor = 0;
  }

  get floorCount(): number {
    return this.floors.length;
  }

  setActiveFloor(index: number): void {
    if (index < 0 || index >= this.floors.length) return;
    this.activeFloor = index;
    this.floorGroups.forEach((g, i) => {
      g.visible = i === index;
    });
    this.resetView();
    this.buildMarkers();
  }

  get currentFloor(): number {
    return this.activeFloor;
  }

  // -- Camera / touch hardening ----------------------------------------------

  /** Recenter on the visible floor's bounding box. The kiosk safety net. */
  resetView(): void {
    let box = this.floors[this.activeFloor]?.bbox ?? this.fullBBox;
    if (!box || box.isEmpty()) {
      // Blank/empty plan: frame a default area around the origin so the camera
      // isn't left parked far away with nothing in view.
      box = new THREE.Box3(
        new THREE.Vector3(-4, 0, -4),
        new THREE.Vector3(4, 2.6, 4),
      );
    }
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.z, 2);

    this.controls.target.copy(center);
    // Pull back enough to frame the floor. `cameraDistance` (config) scales it —
    // <1 = closer, >1 = further. Default sits noticeably closer than before.
    const dist = (maxDim * 0.95 + 3) * this.cameraDistance;
    this.camera.position.set(center.x + dist * 0.7, center.y + dist * 0.8, center.z + dist * 0.7);
    this.controls.maxDistance = dist * 3;
    this.controls.minDistance = Math.max(1.2, maxDim * 0.1);
    this.camera.lookAt(center);
    this.controls.update();
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
    try {
      localStorage.setItem(QUALITY_KEY, choice);
    } catch {
      /* ignore */
    }
    this.qualityTier = choice === 'auto' ? detectTier() : choice;
    const p = QUALITY_PRESETS[this.qualityTier];

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, p.pixelRatio));
    this.renderer.shadowMap.enabled = p.shadows;
    this.renderer.shadowMap.type = p.shadowType;
    if (this.sun) {
      this.sun.castShadow = p.shadows;
      this.sun.shadow.mapSize.set(p.shadowMap, p.shadowMap);
      // Drop the old shadow map so it's re-created at the new size.
      this.sun.shadow.map?.dispose();
      (this.sun.shadow as any).map = null;
    }
    // Force every material to recompile so shadow support is added/removed.
    this.scene.traverse((o) => {
      const m = (o as THREE.Mesh).material;
      if (m) (Array.isArray(m) ? m : [m]).forEach((mm) => (mm.needsUpdate = true));
    });
    this.resize();
    return prevAA !== p.aa;
  }

  /** Keep the orbit target from drifting outside the floor bbox + margin. */
  private clampTarget(): void {
    const box = this.floors[this.activeFloor]?.bbox ?? this.fullBBox;
    if (box.isEmpty()) return;
    const margin = 3;
    const t = this.controls.target;
    const nx = THREE.MathUtils.clamp(t.x, box.min.x - margin, box.max.x + margin);
    const ny = THREE.MathUtils.clamp(t.y, box.min.y, box.max.y + 1);
    const nz = THREE.MathUtils.clamp(t.z, box.min.z - margin, box.max.z + margin);
    // Apply the same correction to the camera so zoom-to-cursor (which moves
    // both camera and target) doesn't jump/stick when the target hits the clamp.
    this.camera.position.x += nx - t.x;
    this.camera.position.y += ny - t.y;
    this.camera.position.z += nz - t.z;
    t.set(nx, ny, nz);
  }

  // -- Picking ----------------------------------------------------------------

  setPickHandler(handler: (r: ClickResult | null) => void): void {
    this.onPick = handler;
  }

  private setupPointer(): void {
    const el = this.renderer.domElement;
    el.addEventListener('pointerdown', (e) => {
      this.downPos = { x: e.clientX, y: e.clientY };
      this.downTime = performance.now();
      // Editing: a single-pointer press may grab a draggable object.
      if (this.editing && e.isPrimary && this.onDrag && this.onDrag.start(e)) {
        this.dragging = true;
        this.controls.enabled = false; // suspend camera while dragging
        try {
          el.setPointerCapture(e.pointerId);
        } catch {
          /* ignore */
        }
      }
    });
    el.addEventListener('pointerup', (e) => {
      if (this.dragging) {
        this.dragging = false;
        this.controls.enabled = true; // mappings (LEFT/ONE) are unchanged
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
        // A move handler may rebuild the scene, which re-applies edit state and
        // can flip the camera controls back on. Re-assert that the camera stays
        // suspended for the whole drag (invariant: no orbit while dragging).
        this.controls.enabled = false;
        return;
      }
      if (this.editing && this.onGround?.move) {
        const p = this.groundIntersect(e);
        if (p) this.onGround.move(p, e);
      }
    });
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
    this.selectionHelper?.update();
  }

  // -- Editor API -------------------------------------------------------------

  setEditMode(on: boolean, elevation = 0): void {
    this.editing = on;
    this.groundPlane.constant = -elevation;
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
  /** A shared (cached) marker texture for a behavior's icon. */
  private markerTexture(behavior: string): THREE.Texture {
    const key = markerIconName(behavior);
    let tex = this.markerTexCache.get(key);
    if (!tex) {
      tex = new THREE.CanvasTexture(drawMarkerCanvas(behavior));
      tex.colorSpace = THREE.SRGBColorSpace;
      this.markerTexCache.set(key, tex);
    }
    return tex;
  }

  private buildMarkers(): void {
    // Sprites share cached textures, so only dispose the materials here.
    for (const child of [...this.markerGroup.children]) {
      (child as THREE.Sprite).material.dispose();
    }
    this.markerGroup.clear();
    if (this.editing) return;
    const bm = this.bindingManagers[this.activeFloor];
    if (!bm) return;
    for (const m of bm.markerData()) {
      const mat = new THREE.SpriteMaterial({
        map: this.markerTexture(m.behavior),
        depthTest: false, // always visible, even through walls (Zircon-style)
        depthWrite: false,
        transparent: true,
      });
      const sp = new THREE.Sprite(mat);
      sp.position.set(m.pos[0], m.pos[1] + 0.35, m.pos[2]);
      sp.renderOrder = 999;
      sp.userData = {
        markerEntity: m.entity_id,
        markerBehavior: m.behavior,
        wx: m.pos[0],
        wy: m.pos[1],
        wz: m.pos[2],
      };
      this.markerGroup.add(sp);
    }
  }

  /** Keep markers a roughly constant on-screen size as the camera dollies. */
  private updateMarkerScales(): void {
    const children = this.markerGroup.children;
    if (!children.length) return;
    const cam = this.camera.position;
    for (const c of children) {
      const d = cam.distanceTo(c.position);
      const s = THREE.MathUtils.clamp(d * 0.05, 0.3, 1.2);
      c.scale.set(s, s, 1);
    }
  }

  /** Raycast a pointer event against the active floor; return the furniture
   *  placement it hits (by id), walking up to the placement group. */
  pickFurniture(e: PointerEvent): { id: string; object: THREE.Object3D } | null {
    const group = this.floorGroups[this.activeFloor];
    if (!group) return null;
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hits = this.raycaster.intersectObject(group, true);
    for (const h of hits) {
      let cur: THREE.Object3D | null = h.object;
      while (cur) {
        const id = cur.userData?.furnitureId as string | undefined;
        if (id) return { id, object: cur };
        cur = cur.parent;
      }
    }
    return null;
  }

  getFurnitureObject(id: string): THREE.Object3D | undefined {
    return this.floors[this.activeFloor]?.furnitureById.get(id);
  }

  getWallObject(index: number): THREE.Object3D | undefined {
    return this.floors[this.activeFloor]?.wallById.get(index);
  }

  getRoomObject(index: number): THREE.Object3D | undefined {
    return this.floors[this.activeFloor]?.roomById.get(index);
  }

  /** Raycast for a wall sub-group (returns its wall array-index). */
  pickWall(e: PointerEvent): { index: number; object: THREE.Object3D } | null {
    return this.pickByUserData(e, 'wallIndex');
  }

  /** Raycast for a door/window leaf — returns the wall + opening index so the
   *  opening can be selected directly (without selecting the wall first). */
  pickOpening(e: PointerEvent): { wallIndex: number; openingIndex: number; object: THREE.Object3D } | null {
    const group = this.floorGroups[this.activeFloor];
    if (!group) return null;
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hits = this.raycaster.intersectObject(group, true);
    for (const h of hits) {
      let cur: THREE.Object3D | null = h.object;
      while (cur) {
        const wi = cur.userData?.openingWall;
        const oi = cur.userData?.openingIndex;
        if (wi !== undefined && oi !== undefined) {
          return { wallIndex: wi as number, openingIndex: oi as number, object: cur };
        }
        cur = cur.parent;
      }
    }
    return null;
  }

  /** Raycast for a room floor mesh (returns its room array-index). */
  pickRoom(e: PointerEvent): { index: number; object: THREE.Object3D } | null {
    return this.pickByUserData(e, 'roomIndex');
  }

  /** Raycast the gizmo handles; returns the handle id (userData.gizmoHandle). */
  pickGizmo(e: PointerEvent): string | null {
    if (!this.gizmoGroup.children.length) return null;
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hits = this.raycaster.intersectObjects(this.gizmoGroup.children, true);
    for (const h of hits) {
      let cur: THREE.Object3D | null = h.object;
      while (cur) {
        const g = cur.userData?.gizmoHandle as string | undefined;
        if (g) return g;
        cur = cur.parent;
      }
    }
    return null;
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

  private pickByUserData(
    e: PointerEvent,
    key: 'wallIndex' | 'roomIndex',
  ): { index: number; object: THREE.Object3D } | null {
    const group = this.floorGroups[this.activeFloor];
    if (!group) return null;
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hits = this.raycaster.intersectObject(group, true);
    for (const h of hits) {
      let cur: THREE.Object3D | null = h.object;
      while (cur) {
        const v = cur.userData?.[key];
        if (typeof v === 'number') return { index: v, object: cur };
        cur = cur.parent;
      }
    }
    return null;
  }

  /** Highlight a selected object with a bounding box, or clear it. */
  setSelection(obj: THREE.Object3D | null): void {
    if (this.selectionHelper) {
      this.scene.remove(this.selectionHelper);
      this.selectionHelper.geometry.dispose();
      this.selectionHelper = undefined;
    }
    if (obj) {
      this.selectionHelper = new THREE.BoxHelper(obj, 0x4fd06a);
      this.scene.add(this.selectionHelper);
    }
  }

  setGroundHandler(h?: { click?: (p: THREE.Vector3, e: PointerEvent) => void; move?: (p: THREE.Vector3, e: PointerEvent) => void }): void {
    this.onGround = h;
  }

  /** Enable/disable camera orbit + pan (zoom stays on so you never get stuck). */
  setControlsEnabled(on: boolean): void {
    this.controls.enableRotate = on;
    this.controls.enablePan = on;
  }

  /**
   * In draw mode, the LEFT mouse / single finger performs the editor action
   * (draw, place, select) while RIGHT mouse / two fingers always orbit + zoom —
   * so you never have to switch to a "View" tool to move the camera. In view
   * mode, the usual controls apply.
   */
  /**
   * Camera is ALWAYS fully controllable while editing (left-drag orbit, right
   * pan, wheel zoom, one-finger orbit, two-finger pan/zoom). The editor distin-
   * guishes a TAP (tool action) from a DRAG (camera), and suspends the camera
   * only while actually dragging a grabbed object/handle (see setupPointer).
   * The `drawing` arg is kept for call-site compatibility but no longer
   * restricts the camera.
   */
  setDrawMode(_drawing: boolean): void {
    this.controls.enabled = true;
    this.controls.enableRotate = true;
    this.controls.enableZoom = true;
    this.controls.enablePan = true;
    this.controls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.PAN,
    };
    this.controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN };
  }

  /**
   * When a movable object is selected, reserve LEFT mouse / one-finger for
   * dragging that object (so it moves instead of orbiting the camera). Camera
   * is still available via right-drag / two fingers.
   */
  setLeftReserved(reserved: boolean): void {
    if (reserved) {
      this.controls.mouseButtons = {
        LEFT: null as any,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.ROTATE,
      };
      this.controls.touches = { ONE: null as any, TWO: THREE.TOUCH.DOLLY_PAN };
    } else {
      this.setDrawMode(true);
    }
  }

  /** Raycast a pointer event onto the current ground plane. */
  groundIntersect(e: PointerEvent): THREE.Vector3 | null {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const out = new THREE.Vector3();
    return this.raycaster.ray.intersectPlane(this.groundPlane, out) ? out : null;
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
    // Dispose any previous underlay.
    for (const g of [...this.underlayGroup.children]) {
      g.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
        const mat = m.material as THREE.MeshBasicMaterial | undefined;
        if (mat) {
          mat.map?.dispose();
          mat.dispose();
        }
      });
    }
    this.underlayGroup.clear();
    if (!u || !u.image) return;

    const aspect = u.aspect > 0 ? u.aspect : 1;
    const w = Math.max(0.1, u.widthM || 10);
    const d = w * aspect;
    const tex = new THREE.TextureLoader().load(u.image);
    tex.colorSpace = THREE.SRGBColorSpace;
    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      opacity: u.opacity ?? 0.6,
      depthWrite: false, // walls/floor draw over it cleanly
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat);
    mesh.rotation.x = -Math.PI / 2; // lie flat on the floor (XZ plane)
    mesh.renderOrder = -1;

    const wrap = new THREE.Group();
    wrap.add(mesh);
    wrap.position.set(u.x ?? 0, elevation + 0.012, u.z ?? 0);
    wrap.rotation.y = (u.rotation ?? 0) * (Math.PI / 180);
    this.underlayGroup.add(wrap);
  }

  private handlePick(e: PointerEvent): void {
    if (!this.onPick) return;
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);

    // Floating markers are larger, always-on-top tap targets — check them first
    // so they're the easy way to hit a bound device.
    if (this.markerGroup.children.length) {
      const mHits = this.raycaster.intersectObjects(this.markerGroup.children, false);
      if (mHits.length) {
        const ud = mHits[0].object.userData;
        this.onPick({
          entity_id: ud.markerEntity as string,
          behavior: ud.markerBehavior as string,
          point: [ud.wx as number, ud.wy as number, ud.wz as number],
          screen: [e.clientX - rect.left, e.clientY - rect.top],
        });
        return;
      }
    }

    const bm = this.bindingManagers[this.activeFloor];
    if (!bm) {
      this.onPick(null);
      return;
    }
    const hits = this.raycaster.intersectObjects(bm.anchors, true);
    if (hits.length === 0) {
      this.onPick(null);
      return;
    }
    const result = bm.resolveClick(hits[0].object) as ClickResult | null;
    if (result) {
      const p = hits[0].point;
      result.point = [p.x, p.y, p.z];
      result.screen = [e.clientX - rect.left, e.clientY - rect.top];
    }
    this.onPick(result);
  }

  /** Bound entities near a world point (for the control popup). */
  entitiesNear(point: [number, number, number], radius: number): { entity_id: string; behavior: string }[] {
    const bm = this.bindingManagers[this.activeFloor];
    if (!bm) return [];
    return bm.near(new THREE.Vector3(point[0], point[1], point[2]), radius);
  }

  /** Targeted live update for a single entity. */
  updateEntity(entityId: string, hass: any): void {
    const bm = this.bindingManagers[this.activeFloor];
    bm?.updateEntity(entityId, hass);
    // Other floors may bind the same entity; update them too (cheap).
    this.bindingManagers.forEach((m, i) => {
      if (i !== this.activeFloor) m.updateEntity(entityId, hass);
    });
  }

  /** Full state sync (called on each hass update from the card). */
  syncAll(hass: any): void {
    for (const bm of this.bindingManagers) bm.update(hass);
  }

  // -- Render loop ------------------------------------------------------------

  start(): void {
    if (this.running) return;
    this.running = true;
    const loop = () => {
      if (!this.running) return;
      this.rafId = requestAnimationFrame(loop);
      const delta = this.clock.getDelta();
      this.controls.update();
      this.bindingManagers[this.activeFloor]?.animate(delta);
      this.updateMarkerScales();
      this.renderer.render(this.scene, this.camera);
    };
    loop();
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.rafId);
  }

  dispose(): void {
    this.stop();
    this.resizeObserver?.disconnect();
    this.clearPlan();
    for (const t of this.markerTexCache.values()) t.dispose();
    this.markerTexCache.clear();
    this.controls.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}

function disposeGroup(group: THREE.Object3D): void {
  group.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (mesh.geometry) mesh.geometry.dispose();
    if (mesh.material) {
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      mats.forEach((m) => m.dispose());
    }
  });
}
