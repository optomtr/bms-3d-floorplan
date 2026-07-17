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
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { FloorPlan, Underlay, ZoneDef } from '../types';
import { buildFloorGroup, BuiltFloor } from './builder';
import { BindingManager } from './bindings';
import { drawMarkerCanvas, markerIconName } from './icons';
import { isShapeRoom, roomPolygon } from './room-shapes';

// ---------------------------------------------------------------------------
// Scene backdrop: instead of a flat clear colour, paint a soft radial
// "spotlight" gradient behind the model — a touch lighter (and faintly cool)
// where the building sits, deepening to near-black at the edges. Derived from
// the configured background colour so a custom `background:` still tints it.
// ---------------------------------------------------------------------------
function makeBackdropTexture(base: string): THREE.Texture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const b = new THREE.Color(base);
  const hex = (c: THREE.Color) => '#' + c.getHexString();
  if (!ctx) {
    // No 2D context (headless/edge case) — fall back to a flat fill.
    return new THREE.Color(base) as unknown as THREE.Texture;
  }

  // 1) Base spotlight: lifted, faintly cool centre behind the model, deepening
  //    to a near-black vignette at the rim.
  const inner = hex(b.clone().lerp(new THREE.Color('#4a5468'), 0.34));
  const mid = hex(b.clone().lerp(new THREE.Color('#000000'), 0.12));
  const outer = hex(b.clone().lerp(new THREE.Color('#000000'), 0.66));
  const base_g = ctx.createRadialGradient(size * 0.5, size * 0.4, 0, size * 0.5, size * 0.42, size * 0.82);
  base_g.addColorStop(0, inner);
  base_g.addColorStop(0.55, mid);
  base_g.addColorStop(1, outer);
  ctx.fillStyle = base_g;
  ctx.fillRect(0, 0, size, size);

  // 2) Brand glows, added softly so the backdrop has a little life without
  //    fighting the model: a cool wash top-right, a warm one low-centre.
  const glow = (x: number, y: number, r: number, rgb: string, a: number) => {
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = a;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(${rgb}, 1)`);
    g.addColorStop(1, `rgba(${rgb}, 0)`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  };
  glow(size * 0.82, size * 0.08, size * 0.7, '91, 184, 232', 0.1); // cool  (#5bb8e8)
  glow(size * 0.5, size * 0.72, size * 0.62, '243, 168, 60', 0.08); // warm (#f3a83c)
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

// A matte Lambert twin of a Standard (PBR) material. Standard runs a full PBR
// BRDF per pixel per light — the dominant fill-rate cost on a weak GPU — while
// Lambert is a cheap diffuse. For a stylised floor plan the two look nearly
// identical (no metal/gloss to lose), so swapping lets us keep a SHARP pixel
// ratio and still stay smooth. Copies every property that affects the look.
function toLambert(std: THREE.MeshStandardMaterial): THREE.MeshLambertMaterial {
  const lam = new THREE.MeshLambertMaterial({
    color: std.color,
    map: std.map,
    emissive: std.emissive,
    emissiveIntensity: std.emissiveIntensity,
    emissiveMap: std.emissiveMap,
    transparent: std.transparent,
    opacity: std.opacity,
    alphaTest: std.alphaTest,
    side: std.side,
    depthWrite: std.depthWrite,
    vertexColors: std.vertexColors,
    flatShading: std.flatShading,
    toneMapped: std.toneMapped,
  });
  lam.name = std.name;
  lam.userData = std.userData;
  return lam;
}

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
  /** Max real point lights. Each one makes EVERY material's fragment shader loop
   *  once more per pixel, so this is the dominant cost of a light-heavy plan on a
   *  weak GPU. Past the cap, lights still glow via their emissive material. */
  maxLights: number;
}

const QUALITY_PRESETS: Record<QualityTier, QualityPreset> = {
  // "high" is intentionally identical to the original hard-coded settings, so
  // capable devices see zero change.
  high: { shadows: true, shadowType: THREE.PCFSoftShadowMap, shadowMap: 1024, pixelRatio: 2, aa: true, maxLights: 16 },
  medium: { shadows: true, shadowType: THREE.PCFShadowMap, shadowMap: 1024, pixelRatio: 1.5, aa: true, maxLights: 8 },
  // Weak GPUs: drop the shadow pass, keep only a few real point lights (the rest
  // glow emissively for free), and swap to matte Lambert materials (see
  // simplifyMaterials). Those cut the per-pixel cost enough to keep a SHARP 1.5×
  // pixel ratio — so a big plan stays smooth without looking soft.
  low: { shadows: false, shadowType: THREE.BasicShadowMap, shadowMap: 512, pixelRatio: 1.5, aa: false, maxLights: 3 },
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
  /** Set when a ROOM marker was tapped: all bound devices in that room. */
  roomEntities?: { entity_id: string; behavior: string }[];
  roomName?: string;
  /** Stable key of the tapped room (matches getRooms()), for panel selection. */
  roomKey?: string;
}

/**
 * Clean up an image reference before it's stored or loaded.
 *
 * The obvious way to get a URL for a picture dropped in `config/www` is to copy
 * it out of the File editor add-on — but that hands you an ingress link:
 *
 *   /api/hassio_ingress/<session-token>/api/file?filename=/homeassistant/config/www/x.jpg
 *
 * That's the add-on's private read-a-file API, authorised by the ingress session
 * of the browser that copied it. It renders perfectly for that person and 404s
 * on every other device — a wall tablet just shows nothing, and no error
 * surfaces anywhere. HA already serves `config/www` at `/local`, so rewrite it
 * to the path that works for every device. Applied when saving AND when loading,
 * so plans that already hold a raw link start working without re-entering it.
 * Anything else (data URL, /local path, plain absolute URL) is left alone.
 */
export function normalizeAssetRef(value: string): string {
  const s = String(value).trim();
  const q = /[?&]filename=([^&]+)/.exec(s);
  if (q) {
    const www = /(?:^|\/)(?:config\/)?www\/(.+)$/.exec(decodeURIComponent(q[1]));
    if (www) return '/local/' + www[1];
  }
  return s;
}

/** A room surfaced to the card for the pills + right-side control panel. */
export interface RoomInfo {
  key: string;
  name?: string;
  entities: { entity_id: string; behavior: string }[];
  /** World-space centre of the room's marker (metres). */
  center: [number, number, number];
  /** Optional per-room design photo (URL/`/local/` path) used as the 3D
   *  backdrop while this room is focused in view mode. */
  bgImage?: string;
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
  // Render-on-demand: only draw when something changed (camera moving, an
  // animation is running, a state update, or while editing). A static kiosk view
  // then costs ~zero GPU — the key to staying smooth at high quality on weak
  // tablets. `invalidate()` requests one more frame. (Edit mode uses the existing
  // `editing` flag to force continuous rendering.)
  private needsRender = true;
  private resizeObserver?: ResizeObserver;

  // Adaptive quality: if sustained interaction (orbit/pan) runs slow, step the
  // renderer down — drop the shadow pass, then the pixel ratio — so the view
  // stays smooth no matter how many devices/furniture the plan grows to. Only
  // ever degrades (never auto-upgrades) to avoid oscillation; a manual quality
  // pick or a plan reload resets it.
  private frameMs = 16;
  private slowStreak = 0;
  private autoDegrade = 0; // 0 = none, 1 = shadows off, 2 = Lambert, 3 = pixelRatio
  private materialsSimplified = false;

  // Dynamic resolution: render COARSE only WHILE a finger is actively dragging
  // the view (fill rate is the weak-GPU bottleneck, so fewer pixels = a smooth
  // drag), then snap back to the SHARP pixel ratio the instant the finger lifts.
  // The still image you actually read is always full quality. `staticPR` is that
  // sharp target. Pointer-driven (not damping) so it can never get stuck coarse.
  private staticPR = 1.5;
  private viewDragging = false;
  private heavyPlan = false; // big plan → fewer real lights (quality-neutral)

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
  /** entity_id -> its marker sprite, for O(1) on/off recolor. */
  private markerByEntity = new Map<string, THREE.Sprite>();
  /** Last hass seen, so markers can colour themselves right after a rebuild. */
  private lastHass?: any;
  /** Per-floor room outlines (world XZ) + name + elevation, for grouping the
   *  floating markers by room ("one icon per room"). */
  private floorRooms: { name?: string; poly: [number, number][]; elev: number; bgImage?: string }[][] = [];
  /** Per-floor manual zones (hand-placed room icons + explicit membership). */
  private floorZones: ZoneDef[][] = [];
  private floorElev: number[] = [];
  /** Rooms on the active floor, in marker-build order — the source for the
   *  card's room pills + right-side panel. Rebuilt with the markers. */
  private activeRooms: (RoomInfo & { sprite: THREE.Sprite })[] = [];
  /** Key of the room the card currently has selected (drives the accent pin). */
  private selectedRoomKey: string | null = null;
  /** The default gradient backdrop, kept so a per-room photo can be swapped in
   *  and then restored. Assigned in the constructor. */
  private defaultBackdrop!: THREE.Texture;
  /** The focused room's design-photo URL + its loaded texture (view mode only).
   *  null when no room bg is wanted; disposed/replaced on each change. */
  private roomBgUrl: string | null = null;
  private roomBgTex: THREE.Texture | null = null;
  /** Origin used to resolve root-relative asset paths (e.g. `/local/photo.jpg`).
   *  Empty in the same-origin HA frontend; set to the HA URL in the file://
   *  kiosk, where a bare `/local/...` would otherwise hit the APK's assets. */
  private imageBase = '';
  /** Fired after markers rebuild so the card can refresh its room list. */
  private onRoomsChanged?: (rooms: RoomInfo[]) => void;
  /** Edit-mode dots showing where each zone's icon sits. */
  readonly zoneGroup = new THREE.Group();
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
    this.staticPR = preset.pixelRatio;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, preset.pixelRatio));
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
    this.scene.add(this.markerGroup);
    this.scene.add(this.zoneGroup);

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
    // Clamp panning to the floor bbox after every change + request a redraw.
    this.controls.addEventListener('change', () => {
      this.clampTarget();
      this.needsRender = true;
    });

    // Dynamic resolution: coarse while a finger is dragging the view, sharp the
    // instant it lifts (release listeners on window so they fire even off-canvas).
    const el = this.renderer.domElement;
    el.addEventListener('pointerdown', () => this.setViewDragging(true), { passive: true });
    const stopDrag = () => this.setViewDragging(false);
    window.addEventListener('pointerup', stopDrag, { passive: true });
    window.addEventListener('pointercancel', stopDrag, { passive: true });

    this.setupLights();
    this.setupResize();
    this.setupPointer();
  }

  /** Re-render the (static) shadow map once on the next frame. Call after any
   *  change to what casts shadows — plan load, floor switch, quality change, or
   *  an in-place edit that moves a shadow-caster without a full rebuild. */
  requestShadowUpdate(): void {
    this.renderer.shadowMap.needsUpdate = true;
  }

  /** Request one more rendered frame (render-on-demand). Call after anything
   *  that changes what's on screen but isn't a camera move or animation. */
  invalidate(): void {
    this.needsRender = true;
  }

  /** Collapse each floor's STATIC architecture (walls, floors, opening frames —
   *  everything EXCEPT furniture, which stays live for bindings/markers) into a
   *  handful of merged meshes, one per material look. This cuts a heavy plan
   *  from hundreds of draw calls to a few — the main win for weak tablet GPUs.
   *  View mode ONLY; the editor always rebuilds the scene unmerged (loadPlan) so
   *  per-wall/room selection keeps working. Safe to call after each view load. */
  optimizeForView(): void {
    if (this.editing) return;
    for (let i = 0; i < this.floors.length; i++) {
      // Keep BOUND furniture live (glow/spin/curtain + markers); everything else
      // — architecture AND unbound furniture — is fair game to merge.
      const keep = new Set<THREE.Object3D>(this.bindingManagers[i]?.anchorObjects() ?? []);
      this.mergeStatic(this.floors[i], keep);
    }
    // Weak tier, a big plan, or a device the adaptive pass proved slow → swap to
    // cheap matte materials. Shadows are KEPT (they carry most of the depth/
    // "quality" look) — if the device then can't keep up, the adaptive pass drops
    // them first anyway.
    if (this.qualityTier === 'low' || this.heavyPlan || this.autoDegrade >= 2) {
      this.simplifyMaterials();
    }
    // Crisp, super-sampled still image now the scene is built.
    if (!this.viewDragging) this.applyPR(this.idlePR(), true);
    this.requestShadowUpdate();
    this.invalidate();
  }

  /** Swap every Standard (PBR) material in the scene for a matte Lambert twin —
   *  a big per-pixel win with almost no visual change on a stylised plan. A cache
   *  maps each source material to ONE Lambert, preserving the draw-call batching
   *  the merge just created. Idempotent; reset on the next loadPlan. */
  private simplifyMaterials(): void {
    if (this.materialsSimplified) return;
    const cache = new Map<THREE.Material, THREE.MeshLambertMaterial>();
    const conv = (mat: THREE.Material): THREE.Material => {
      if (!(mat as THREE.MeshStandardMaterial).isMeshStandardMaterial) return mat;
      let lam = cache.get(mat);
      if (!lam) {
        lam = toLambert(mat as THREE.MeshStandardMaterial);
        cache.set(mat, lam);
      }
      return lam;
    };
    this.scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      m.material = Array.isArray(m.material) ? m.material.map(conv) : conv(m.material);
    });
    this.materialsSimplified = true;
    this.needsRender = true;
  }

  private mergeStatic(floor: BuiltFloor, keepRoots: Set<THREE.Object3D>): void {
    const inKept = (o: THREE.Object3D): boolean => {
      for (let cur: THREE.Object3D | null = o; cur; cur = cur.parent) {
        if (keepRoots.has(cur)) return true;
      }
      return false;
    };
    floor.group.updateMatrixWorld(true);
    const invFloor = floor.group.matrixWorld.clone().invert();

    // Bucket mergeable meshes by a material "signature" (same look → one mesh).
    const groups = new Map<string, { mat: THREE.Material; meshes: THREE.Mesh[] }>();
    floor.group.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh || m.userData.merged || inKept(m)) return;
      if (Array.isArray(m.material) || !m.geometry) return;
      const mat = m.material as THREE.MeshStandardMaterial;
      const sig = [
        mat.type,
        mat.color?.getHexString?.() ?? '',
        mat.emissive?.getHexString?.() ?? '', mat.emissiveIntensity ?? '',
        (mat.map as { uuid?: string } | null)?.uuid ?? '',
        mat.transparent, mat.opacity, mat.roughness, mat.metalness, mat.side, mat.depthWrite,
      ].join('|');
      let g = groups.get(sig);
      if (!g) { g = { mat, meshes: [] }; groups.set(sig, g); }
      g.meshes.push(m);
    });

    for (const { mat, meshes } of groups.values()) {
      if (meshes.length < 2) continue; // nothing to gain from a lone mesh
      const geos: THREE.BufferGeometry[] = [];
      for (const m of meshes) {
        m.updateMatrixWorld(true);
        const g = m.geometry.clone();
        g.applyMatrix4(invFloor.clone().multiply(m.matrixWorld)); // bake into floor space
        geos.push(g);
      }
      const merged = mergeGeometries(geos, false);
      geos.forEach((g) => g.dispose());
      if (!merged) continue; // incompatible attributes — leave those meshes as-is
      const mesh = new THREE.Mesh(merged, mat.clone());
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData.merged = true;
      floor.group.add(mesh);
      for (const m of meshes) {
        m.removeFromParent();
        m.geometry.dispose();
        (m.material as THREE.Material).dispose();
      }
    }
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
    // Re-fit the room-photo backdrop's cover-crop to the new aspect.
    if (this.roomBgTex) this.updateBackdropCover();
    this.needsRender = true;
    // setSize() clears the WebGL buffer, so with render-on-demand the canvas
    // would flash black for a frame until the next rAF. This matters when the
    // viewport animates its width (opening/closing the room panel) — the
    // observer fires every frame. Draw synchronously so it never blanks.
    if (this.running && this.floors.length) {
      this.renderer.render(this.scene, this.camera);
      this.needsRender = false;
    }
  }

  /** Switch render resolution (device-pixel ratio) and re-fit the buffer — used
   *  by dynamic resolution (motion vs idle) and the adaptive floor. */
  /** Set the render resolution. Normally capped at the device pixel ratio; with
   *  `allowSupersample` it may exceed it (up to 3x) — rendering ABOVE native then
   *  down-sampling anti-aliases the still image, so it looks crisp even when a
   *  WebView reports a low pixel ratio. */
  private applyPR(pr: number, allowSupersample = false): void {
    const clamped = allowSupersample ? Math.min(pr, 3) : Math.min(window.devicePixelRatio, pr);
    if (Math.abs(this.renderer.getPixelRatio() - clamped) < 0.001) return;
    this.renderer.setPixelRatio(clamped);
    this.resize(); // re-fits the buffer and draws one frame at the new ratio
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
    this.floorRooms = [];
    this.floorZones = [];
    this.floorElev = [];
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

    plan.floors.forEach((floorDef) => {
      const built = buildFloorGroup(floorDef, plan.wallHeight);
      const bm = new BindingManager(built.group, maxLights);
      bm.register(built, floorDef.bindings ?? []);
      this.scene.add(built.group);
      this.floors.push(built);
      this.floorGroups.push(built.group);
      this.bindingManagers.push(bm);
      this.fullBBox.union(built.bbox);
      // Room outlines (world XZ) for grouping markers by room.
      const elev = floorDef.elevation ?? 0;
      this.floorElev.push(elev);
      this.floorZones.push(floorDef.zones ?? []);
      this.floorRooms.push(
        (floorDef.rooms ?? [])
          .map((room) => {
            const poly = (isShapeRoom(room) ? roomPolygon(room) : room.polygon) ?? [];
            return { name: room.name, poly: poly as [number, number][], elev, bgImage: room.bgImage };
          })
          .filter((r) => r.poly.length >= 3),
      );
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
    this.requestShadowUpdate();
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
    this.markerByEntity.clear();
    for (const child of [...this.zoneGroup.children]) (child as THREE.Sprite).material.dispose();
    this.zoneGroup.clear();
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
    // Show curtains at their real open/closed state immediately (an inactive
    // floor never animated), instead of sliding on entry.
    this.bindingManagers[index]?.settleCovers();
    this.resetView();
    this.buildMarkers();
    this.requestShadowUpdate();
  }

  get currentFloor(): number {
    return this.activeFloor;
  }

  // -- Camera / touch hardening ----------------------------------------------

  /** Recenter on the visible floor's bounding box. The kiosk safety net. */
  /** Frame the active floor. `distMul` < 1 dollies closer (e.g. the short,
   *  wide Обзор banner, where the fit-to-view distance leaves the model tiny). */
  resetView(distMul = 1): void {
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
    const dist = (maxDim * 0.95 + 3) * this.cameraDistance * distMul;
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
    // Force every material to recompile so shadow support is added/removed.
    this.scene.traverse((o) => {
      const m = (o as THREE.Mesh).material;
      if (m) (Array.isArray(m) ? m : [m]).forEach((mm) => (mm.needsUpdate = true));
    });
    // A deliberate quality pick clears any adaptive degrade and re-arms it.
    this.autoDegrade = 0;
    this.slowStreak = 0;
    this.frameMs = 16;
    this.requestShadowUpdate();
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

  private makeMarkerSprite(iconBehavior: string, x: number, y: number, z: number): THREE.Sprite {
    const mat = new THREE.SpriteMaterial({
      map: this.markerTexture(iconBehavior),
      depthTest: false, // always visible, even through walls (Zircon-style)
      depthWrite: false,
      transparent: true,
    });
    const sp = new THREE.Sprite(mat);
    sp.position.set(x, y, z);
    sp.renderOrder = 999;
    this.markerGroup.add(sp);
    return sp;
  }

  private buildMarkers(): void {
    // Sprites share cached textures, so only dispose the materials here.
    for (const child of [...this.markerGroup.children]) {
      (child as THREE.Sprite).material.dispose();
    }
    this.markerGroup.clear();
    this.markerByEntity.clear();
    this.activeRooms = [];
    if (this.editing) {
      this.onRoomsChanged?.([]);
      return;
    }
    const bm = this.bindingManagers[this.activeFloor];
    if (!bm) {
      this.onRoomsChanged?.([]);
      return;
    }
    const allDevices = bm.markerData();
    const rooms = this.floorRooms[this.activeFloor] ?? [];
    const zones = this.floorZones[this.activeFloor] ?? [];
    const elev = this.floorElev[this.activeFloor] ?? 0;

    // 1) Manual zones (hand-placed icons) come first and OWN their listed
    //    entities, overriding the automatic grouping for those devices.
    const behaviorOf = new Map(allDevices.map((d) => [d.entity_id, d.behavior]));
    const claimed = new Set<string>();
    for (const z of zones) {
      // First zone to list an entity wins it (no duplicate markers). A zone is an
      // EXPLICIT device list, so keep every entity the user checked — not only the
      // ones that happen to be bound to a 3D furniture object (behaviorOf). For an
      // unbound entity the behaviour is taken from its domain; the panel filters
      // out any that no longer exist in hass at render time.
      const ents = (z.entities ?? []).filter(
        (id) => !claimed.has(id) && (behaviorOf.has(id) || !this.lastHass || !!this.lastHass.states?.[id]),
      );
      if (!ents.length) continue;
      for (const id of ents) claimed.add(id);
      const sp = this.makeMarkerSprite('room', z.x, elev + 1.6, z.z);
      const roomEntities = ents.map((id) => ({ entity_id: id, behavior: behaviorOf.get(id) ?? id.split('.')[0] }));
      const key = `${z.id ?? z.name ?? 'zone'}#${this.activeRooms.length}`;
      sp.userData = {
        roomMarker: true,
        roomKey: key,
        roomName: z.name,
        roomEntities,
        wx: z.x,
        wy: elev + 1.6,
        wz: z.z,
      };
      // A zone's OWN photo always wins. With none set it borrows the photo of
      // the geometric room it sits in, but ONLY where that room holds exactly
      // one zone. Rooms often share a floor polygon, and borrowing there is what
      // put one room's picture behind all its neighbours; a one-zone room is
      // unambiguous, so plans whose photo was set on the room shape keep working.
      let zoneBg: string | undefined = z.bgImage;
      if (!zoneBg) {
        let host: (typeof rooms)[number] | null = null;
        let hostArea = Infinity;
        for (const r of rooms) {
          if (!r.bgImage || !pointInPoly(z.x, z.z, r.poly)) continue;
          const a = polyArea(r.poly); // smallest containing room = most specific
          if (a < hostArea) {
            hostArea = a;
            host = r;
          }
        }
        if (host && zones.filter((o) => pointInPoly(o.x, o.z, host!.poly)).length === 1) {
          zoneBg = host.bgImage;
        }
      }
      this.activeRooms.push({ key, name: z.name, entities: roomEntities, center: [z.x, elev + 1.6, z.z], bgImage: zoneBg, sprite: sp });
      for (const id of ents) this.markerByEntity.set(id, sp);
    }
    // 2) Auto-group the remaining (unclaimed) devices by their room polygon.
    const devices = allDevices.filter((d) => !claimed.has(d.entity_id));
    const perRoom = new Map<number, typeof devices>();
    const loose: typeof devices = [];
    const roomAreas = rooms.map((r) => polyArea(r.poly)); // constant across devices
    for (const d of devices) {
      // If several room polygons contain the device (overlapping/auto-floor
      // rooms), pick the SMALLEST — the most specific room it belongs to.
      let ri = -1;
      let bestArea = Infinity;
      for (let i = 0; i < rooms.length; i++) {
        if (pointInPoly(d.pos[0], d.pos[2], rooms[i].poly) && roomAreas[i] < bestArea) {
          bestArea = roomAreas[i];
          ri = i;
        }
      }
      if (ri >= 0) {
        (perRoom.get(ri) ?? perRoom.set(ri, []).get(ri)!).push(d);
      } else {
        loose.push(d);
      }
    }

    for (const [ri, ds] of perRoom) {
      const room = rooms[ri];
      const [cx, cz] = polyCentroid(room.poly);
      const sp = this.makeMarkerSprite('room', cx, room.elev + 1.6, cz);
      const roomEntities = ds.map((d) => ({ entity_id: d.entity_id, behavior: d.behavior }));
      const key = `${room.name ?? 'room'}#${this.activeRooms.length}`;
      sp.userData = {
        roomMarker: true,
        roomKey: key,
        roomName: room.name,
        roomEntities,
        wx: cx,
        wy: room.elev + 1.6,
        wz: cz,
      };
      this.activeRooms.push({ key, name: room.name, entities: roomEntities, center: [cx, room.elev + 1.6, cz], bgImage: room.bgImage, sprite: sp });
      for (const d of ds) this.markerByEntity.set(d.entity_id, sp);
    }
    for (const d of loose) {
      const sp = this.makeMarkerSprite(d.behavior, d.pos[0], d.pos[1] + 0.35, d.pos[2]);
      sp.userData = {
        markerEntity: d.entity_id,
        markerBehavior: d.behavior,
        wx: d.pos[0],
        wy: d.pos[1],
        wz: d.pos[2],
      };
      this.markerByEntity.set(d.entity_id, sp);
    }
    // Colour freshly-built markers from the last known state (on = blue).
    if (this.lastHass) this.refreshAllMarkerColors(this.lastHass);
    this.needsRender = true;
    // Drop a stale selection that no longer maps to a room on this floor.
    if (this.selectedRoomKey && !this.activeRooms.some((r) => r.key === this.selectedRoomKey)) {
      this.selectedRoomKey = null;
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

  /** Rooms on the active floor, in build order (zones first, then auto-grouped). */
  getRooms(): RoomInfo[] {
    return this.activeRooms.map((r) => ({ key: r.key, name: r.name, entities: r.entities, center: r.center, bgImage: r.bgImage }));
  }

  /** Highlight one room's pin (accent) and neutralise the rest. */
  selectRoom(key: string | null): void {
    this.selectedRoomKey = key;
    // Show the focused room's design photo behind the 3D (view mode only).
    const room = key ? this.activeRooms.find((r) => r.key === key) : null;
    this.setRoomBackdrop(room?.bgImage ?? null);
    if (this.lastHass) this.refreshAllMarkerColors(this.lastHass);
    else for (const c of this.markerGroup.children) this.colorMarker(c as THREE.Sprite, this.lastHass);
    this.needsRender = true;
    this.invalidate();
  }

  /** Set the focused room's design photo as the 3D backdrop. Pass null to want
   *  no photo. The photo is only actually shown in view mode — applyBackdrop()
   *  falls back to the gradient while editing so it never disturbs the editor. */
  setRoomBackdrop(url: string | null): void {
    if (url === this.roomBgUrl) {
      this.applyBackdrop();
      return;
    }
    this.roomBgUrl = url;

    // No photo for this room: drop straight to the gradient.
    if (!url) {
      if (this.roomBgTex) {
        this.roomBgTex.dispose();
        this.roomBgTex = null;
      }
      this.applyBackdrop();
      return;
    }

    // Decode the new picture BEFORE swapping it in. Handing the renderer a
    // still-loading texture blanked the backdrop for as long as the decode took,
    // so every room switch flashed dark; what's on screen now stays until the
    // replacement is actually ready.
    const prev = this.roomBgTex;
    new THREE.TextureLoader().load(
      this.resolveAsset(url),
      (tex) => {
        if (this.roomBgUrl !== url) {
          tex.dispose(); // the room changed again while this was decoding
          return;
        }
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.center.set(0.5, 0.5); // crop around the middle
        this.roomBgTex = tex;
        if (prev) prev.dispose();
        this.updateBackdropCover(); // now that the real dimensions are known
        this.applyBackdrop();
        this.needsRender = true;
        this.invalidate();
      },
      undefined,
      () => {
        // Unreadable photo (bad path, gone from /local/…): show the gradient
        // rather than a black backdrop, and don't strand the old room's picture.
        if (this.roomBgUrl !== url) return;
        console.warn('[3d-floorplan] could not load room photo:', url.slice(0, 80));
        this.roomBgUrl = null;
        if (prev) prev.dispose();
        this.roomBgTex = null;
        this.applyBackdrop();
      },
    );
  }

  /** Crop the room-photo backdrop to cover the viewport without distortion —
   *  scale the shorter axis to fill and centre-crop the overflow. Re-run on
   *  resize and once the image loads. */
  private updateBackdropCover(): void {
    const tex = this.roomBgTex;
    const img = tex?.image as { width?: number; height?: number } | undefined;
    if (!tex || !img?.width || !img?.height) return;
    const va = (this.container.clientWidth || 1) / (this.container.clientHeight || 1);
    const ia = img.width / img.height;
    if (va > ia) tex.repeat.set(1, ia / va); // viewport wider → crop top/bottom
    else tex.repeat.set(va / ia, 1); // viewport taller → crop sides
    tex.updateMatrix();
  }

  /** Origin for resolving root-relative asset paths (see `imageBase`). */
  setImageBase(base: string): void {
    this.imageBase = base || '';
  }

  /** Turn a room-photo reference into a loadable URL: data/blob/absolute URLs
   *  pass through; a root-relative `/local/...` path is prefixed with the HA
   *  origin so it resolves off the file:// kiosk too. */
  private resolveAsset(u: string): string {
    // Rewrite a File-editor ingress link to the /local path it maps to. Plans
    // saved before the editor started doing this at input time still hold the
    // raw link, and it only ever renders for the session that copied it.
    const ref = normalizeAssetRef(u);
    if (/^(data:|blob:|https?:)/i.test(ref)) return ref;
    if (ref.startsWith('/') && this.imageBase) return this.imageBase + ref;
    return ref;
  }

  /** Choose which backdrop is visible: the room photo in view mode, otherwise
   *  (overview, no photo, or editing) the default gradient. */
  private applyBackdrop(): void {
    const next = !this.editing && this.roomBgTex ? this.roomBgTex : this.defaultBackdrop;
    if (this.scene.background !== next) {
      this.scene.background = next;
      this.needsRender = true;
      this.invalidate();
    }
  }

  /** Whether a toggle device counts as "on" (drives the blue marker tint). */
  /** Whether a device counts as "active" for a marker to glow — ANY controllable
   *  device that is on / running, not only lights. Covers (open/closed) and locks
   *  have no on/off "running" state, so they don't drive the glow. */
  private isDeviceActive(behavior?: string, state?: string): boolean {
    if (!state || state === 'unavailable' || state === 'unknown') return false;
    switch (behavior) {
      case 'light':
      case 'switch':
      case 'input_boolean':
      case 'fan':
        return state === 'on';
      case 'climate':
        return state !== 'off';
      case 'media_player':
        return state === 'playing' || state === 'on';
      default:
        return false;
    }
  }

  /** Tint a marker: the selected room's pin is accent-orange; other room pins
   *  glow soft-amber when any of their lights are on; loose device markers turn
   *  blue when on. */
  private colorMarker(sp: THREE.Sprite, hass: any): void {
    const ud = sp.userData;
    if (ud.roomMarker) {
      if (ud.roomKey && ud.roomKey === this.selectedRoomKey) {
        (sp.material as THREE.SpriteMaterial).color.setHex(0xf3a83c);
        return;
      }
      const anyOn = (ud.roomEntities || []).some((e: any) => this.isDeviceActive(e.behavior, hass?.states?.[e.entity_id]?.state));
      (sp.material as THREE.SpriteMaterial).color.setHex(anyOn ? 0xf6c98a : 0xffffff);
      return;
    }
    const on = this.isDeviceActive(ud.markerBehavior, hass?.states?.[ud.markerEntity]?.state);
    (sp.material as THREE.SpriteMaterial).color.setHex(on ? 0x4da3ff : 0xffffff);
  }

  private refreshAllMarkerColors(hass: any): void {
    if (!hass?.states) return;
    for (const c of this.markerGroup.children) this.colorMarker(c as THREE.Sprite, hass);
  }

  private updateMarkerColor(entityId: string, hass: any): void {
    const sp = this.markerByEntity.get(entityId);
    if (sp) this.colorMarker(sp, hass);
  }

  /** Keep markers a roughly constant on-screen size as the camera dollies. */
  private updateMarkerScales(): void {
    const cam = this.camera.position;
    for (const grp of [this.markerGroup, this.zoneGroup]) {
      for (const c of grp.children) {
        const d = cam.distanceTo(c.position);
        c.scale.set(THREE.MathUtils.clamp(d * 0.05, 0.3, 1.2), THREE.MathUtils.clamp(d * 0.05, 0.3, 1.2), 1);
      }
    }
  }

  /** Show hand-placed zone icons while editing (so they can be positioned). */
  drawZoneDots(zones: { id: string; x: number; z: number; name?: string }[], elev: number, selId?: string | null): void {
    for (const c of [...this.zoneGroup.children]) (c as THREE.Sprite).material.dispose();
    this.zoneGroup.clear();
    for (const z of zones) {
      const mat = new THREE.SpriteMaterial({
        map: this.markerTexture('room'),
        depthTest: false,
        depthWrite: false,
        transparent: true,
      });
      mat.color.setHex(z.id === selId ? 0x4da3ff : 0xffffff);
      const sp = new THREE.Sprite(mat);
      sp.position.set(z.x, elev + 1.6, z.z);
      sp.renderOrder = 1000;
      this.zoneGroup.add(sp);
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
        const screen: [number, number] = [e.clientX - rect.left, e.clientY - rect.top];
        const point: [number, number, number] = [ud.wx, ud.wy, ud.wz];
        if (ud.roomMarker) {
          this.onPick({ entity_id: '', behavior: 'room', roomEntities: ud.roomEntities, roomName: ud.roomName, roomKey: ud.roomKey, point, screen });
        } else {
          this.onPick({ entity_id: ud.markerEntity as string, behavior: ud.markerBehavior as string, point, screen });
        }
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
    this.lastHass = hass;
    const bm = this.bindingManagers[this.activeFloor];
    bm?.updateEntity(entityId, hass);
    // Other floors may bind the same entity; update them too (cheap).
    this.bindingManagers.forEach((m, i) => {
      if (i !== this.activeFloor) m.updateEntity(entityId, hass);
    });
    this.updateMarkerColor(entityId, hass);
    this.needsRender = true;
  }

  /** Full state sync (called on each hass update from the card). */
  syncAll(hass: any): void {
    this.lastHass = hass;
    for (const bm of this.bindingManagers) bm.update(hass);
    this.refreshAllMarkerColors(hass);
    this.needsRender = true;
  }

  // -- Render loop ------------------------------------------------------------

  start(): void {
    if (this.running) return;
    this.running = true;
    const loop = () => {
      if (!this.running) return;
      this.rafId = requestAnimationFrame(loop);
      const delta = this.clock.getDelta();
      // update() eases damping and returns true while the camera is still moving;
      // animate() returns true while a fan spins / curtain slides. Render only
      // when the view actually changes (or while editing) — a static kiosk then
      // idles the GPU, which is what keeps high quality smooth on weak tablets.
      const moved = this.controls.update();
      const anim = this.bindingManagers[this.activeFloor]?.animate(delta) ?? false;
      const interacting = moved || anim; // continuous frames — where lag is felt
      if (this.needsRender || interacting || this.editing) {
        this.updateMarkerScales();
        this.renderer.render(this.scene, this.camera);
        this.needsRender = false;
        if (interacting) this.trackFrame(delta);
      }
    };
    loop();
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.rafId);
  }

  /** Smooth the interaction frame time; step quality down if it stays slow, so a
   *  plan can grow without the tablet ever bogging down. */
  private trackFrame(delta: number): void {
    // Only auto-tune when the user hasn't pinned a quality — an explicit pick is
    // respected as-is.
    if (this.qualityChoice !== 'auto') return;
    const ms = Math.min(delta * 1000, 200); // ignore huge gaps (tab was hidden)
    this.frameMs = this.frameMs * 0.9 + ms * 0.1;
    if (this.frameMs > 42) {
      // ~sustained < 24 fps: after ~0.7s of it, drop a rung.
      if (++this.slowStreak > 40 && this.autoDegrade < 3) {
        this.stepDownQuality();
        this.slowStreak = 0;
      }
    } else if (this.slowStreak > 0) {
      this.slowStreak--;
    }
  }

  /** One rung down the adaptive-quality ladder. Sharpness (pixel ratio) is given
   *  up LAST — the cheaper, near-invisible cuts (shadows, matte materials) go
   *  first, so it stays smooth AND sharp. Applied live; never auto-upgrades. */
  private stepDownQuality(): void {
    this.autoDegrade++;
    if (this.autoDegrade === 1) {
      // 1) Drop the shadow pass — cheap, barely noticeable.
      this.renderer.shadowMap.enabled = false;
      if (this.sun) this.sun.castShadow = false;
      this.scene.traverse((o) => {
        const m = (o as THREE.Mesh).material;
        if (m) (Array.isArray(m) ? m : [m]).forEach((mm) => (mm.needsUpdate = true));
      });
      this.needsRender = true;
    } else if (this.autoDegrade === 2) {
      // 2) Matte Lambert materials — big per-pixel win, keeps the pixel ratio.
      this.simplifyMaterials();
    } else {
      // 3) Last resort: lower the DRAG resolution target (the still image stays
      //    crisp via idlePR() — it's on-demand, so it isn't the cost that hurts).
      this.staticPR = Math.max(0.75, Math.min(1, this.staticPR));
    }
    this.frameMs = 16; // reset the average so the next rung waits for real slowness
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

/** Ray-casting point-in-polygon test (polygon points are world [x, z]). */
function pointInPoly(x: number, z: number, poly: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], zi = poly[i][1];
    const xj = poly[j][0], zj = poly[j][1];
    if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inside = !inside;
  }
  return inside;
}

function polyCentroid(poly: [number, number][]): [number, number] {
  let x = 0;
  let z = 0;
  for (const p of poly) {
    x += p[0];
    z += p[1];
  }
  return [x / poly.length, z / poly.length];
}

/** Absolute polygon area (shoelace), for picking the most specific room. */
function polyArea(poly: [number, number][]): number {
  let a = 0;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    a += (poly[j][0] + poly[i][0]) * (poly[j][1] - poly[i][1]);
  }
  return Math.abs(a) / 2;
}
