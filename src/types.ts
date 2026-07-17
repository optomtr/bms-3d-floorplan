// ---------------------------------------------------------------------------
// Floor-plan schema + card config types.
//
// Coordinate system: floor plans are authored in 2D meters (x, y). In the 3D
// scene this maps to x -> X, y -> Z (the floor is the XZ plane) and height
// extrudes upward along +Y. No part of this schema imposes a count limit on
// walls, rooms, furniture, or bindings — that is an explicit project goal.
// ---------------------------------------------------------------------------

export type Vec2 = [number, number];
export type Vec3 = [number, number, number];

export interface WallDef {
  /** Start point in meters. */
  start: Vec2;
  /** End point in meters. */
  end: Vec2;
  /** Wall height in meters. Defaults to the floor's wallHeight or 2.6. */
  height?: number;
  /** Wall thickness in meters. Defaults to 0.12. */
  thickness?: number;
  /** Base color tint (hex string, e.g. "#dddddd"). */
  color?: string;
  /** Surface material preset (plain/stripes/plaster/brick/panel). */
  material?: string;
  /** Openings (doors/windows) cut into this wall. */
  openings?: OpeningDef[];
}

export type OpeningKind = 'door' | 'window' | 'opening';

export interface OpeningDef {
  kind: OpeningKind;
  /** Distance in meters from the wall's start point to the opening's start. */
  position: number;
  /** Width of the opening in meters. */
  width: number;
  /** Bottom of the opening above the floor (windows). Default 0 for doors, 0.9 for windows. */
  sill?: number;
  /** Top of the opening above the floor. Default 2.05 for doors, 2.1 for windows. */
  top?: number;
  /** Cut the hole only — don't render the leaf/glass infill (a placed door/window
   *  model fills it). Avoids z-fighting between the two. */
  bare?: boolean;
  /** Style variant (door: single/double/glass/sliding; window: single/double/picture/sliding). */
  variant?: string;
}

export type RoomShape = 'rect' | 'lshape' | 'bevel';

export interface RoomDef {
  /** Optional label, drawn as floating text at the room centroid. */
  name?: string;
  /** Polygon outline in meters (auto-closed). Derived from shape when present. */
  polygon: Vec2[];
  /** Floor material color. */
  color?: string;
  /** Floor surface material preset (plain/wood/tile/plaster). */
  material?: string;

  // --- Shape-room (Designer Mode) fields. When `shape` is set the builder
  //     derives the polygon + perimeter walls from these, so rooms can be
  //     moved/rotated/resized as a unit. Plain polygon rooms still work. ---
  /** Stable id for selection / parent-child / gizmo. */
  id?: string;
  /** Parametric shape; when set, polygon/walls are generated. */
  shape?: RoomShape;
  /** Center position on the floor plane (meters). */
  x?: number;
  z?: number;
  /** Footprint size (meters). */
  width?: number;
  depth?: number;
  /** Z-axis rotation in degrees. */
  rotation?: number;
  /** Wall height for this room (overrides floor default). */
  height?: number;
  /** Wall thickness for generated walls. */
  thickness?: number;
  /** Wall color for generated walls. */
  wallColor?: string;
  /** Wall surface material preset for generated walls. */
  wallMaterial?: string;
  /** Openings on this room's perimeter (shape rooms own their openings). */
  openings?: RoomOpening[];
  /** Parent room id (re-parenting / nesting). */
  parentId?: string;
  /** Optional design photo (URL or HA `/local/...` path) shown as the 3D
   *  backdrop ONLY when this room is focused in view mode — not in the
   *  overview and never while editing. Set per room in the integration. */
  bgImage?: string;
}

/** An opening on a shape-room's perimeter, addressed by edge + distance. */
export interface RoomOpening {
  id?: string;
  kind: OpeningKind;
  /** Which perimeter edge (0-based, following the polygon order). */
  edge: number;
  /** Distance along that edge from its start, to the opening start (meters). */
  position: number;
  width: number;
  sill?: number;
  top?: number;
  /** Cut the hole only — a placed model fills it (see OpeningDef.bare). */
  bare?: boolean;
  /** Style variant (see OpeningDef.variant). */
  variant?: string;
}

export interface FurnitureDef {
  /** Built-in library key (see furniture/library.ts) OR ignored if `glb` set. */
  model: string;
  /** Optional path to a custom .glb (e.g. /local/models/sofa.glb). Overrides `model`. */
  glb?: string;
  /** Position in meters [x, y, z]. y is the vertical offset (usually 0 = on floor). */
  position: Vec3;
  /** Rotation in degrees about the vertical (Y) axis. */
  rotation?: number;
  /** Uniform scale, or per-axis [sx, sy, sz]. Default 1. */
  scale?: number | Vec3;
  /** Base color tint applied to the model. */
  color?: string;
  /** Manual glow level 0..1 for light models (emissive intensity when unbound). */
  brightness?: number;
  /** Light-set spacing multiplier (spreads elements apart without resizing them). */
  spread?: number;
  /** Number of elements in a light set (e.g. spotlight_bar spot count). */
  count?: number;
  /** Unique id so entity bindings can anchor to this placement. */
  id?: string;
  /** Link to an opening this piece fills (door/window placed by the tool), so
   *  deleting the piece also removes the wall/room opening. */
  attach?: { kind: 'wall' | 'room'; index: number; edge?: number; opening: number };
}

export type BindingBehavior =
  | 'auto' // pick a sensible default from the entity domain
  | 'light'
  | 'switch'
  | 'climate'
  | 'sensor'
  | 'binary_sensor'
  | 'lock'
  | 'media_player'
  | 'cover'
  | 'fan'
  | 'label'; // just show state as floating text, no interaction

export interface BindingDef {
  entity_id: string;
  /** Id of the furniture placement (FurnitureDef.id) this binds to. */
  anchor_object?: string;
  /** Explicit anchor position if not anchoring to a furniture object. */
  anchor?: Vec3;
  /** How the bound entity drives the scene. Defaults to "auto". */
  behavior?: BindingBehavior;
  /** Optional friendly label override for floating text. */
  label?: string;
}

/** A reference image (e.g. a scanned/exported 2D floor plan) laid flat on the
 *  floor as a tracing guide. Editor-only; removable. */
export interface Underlay {
  /** Image as a data URL. */
  image: string;
  /** Real-world width of the image in meters (sets the scale). */
  widthM: number;
  /** imageHeight / imageWidth, to derive the depth from widthM. */
  aspect: number;
  /** Center position on the floor plane (meters). */
  x?: number;
  z?: number;
  /** Rotation in degrees about the vertical axis. */
  rotation?: number;
  /** Opacity 0..1. */
  opacity?: number;
}

export interface FloorDef {
  /** Display name shown in the floor switcher. */
  name: string;
  /** Stable id (Designer scope / breadcrumb). */
  id?: string;
  /** Vertical offset of this floor in meters (e.g. 0, 3, 6 for stories). */
  elevation?: number;
  /** Default wall height for walls on this floor. */
  wallHeight?: number;
  walls: WallDef[];
  rooms?: RoomDef[];
  furniture?: FurnitureDef[];
  bindings?: BindingDef[];
  /** Optional reference image traced over while drawing this floor. */
  underlay?: Underlay;
  /** Manual room "zones": a named control icon the user places by hand, holding
   *  an explicit list of entities — overrides the automatic room grouping so a
   *  mis-detected device can be assigned to the right room. */
  zones?: ZoneDef[];
}

/** A hand-placed room control icon + its explicit device membership. */
export interface ZoneDef {
  id: string;
  name?: string;
  /** Icon position on the floor plane (meters). */
  x: number;
  z: number;
  /** entity_ids controlled from this room icon. */
  entities: string[];
  /** Optional design photo, exactly like RoomDef.bgImage. A zone owns its own
   *  photo: several zones can sit inside one floor polygon, so the polygon's
   *  photo can't tell them apart (that made two zones share one picture). */
  bgImage?: string;
}

/** A building groups floors. Optional — a plan with top-level `floors` is
 *  treated as a single implicit building (back-compat). */
export interface BuildingDef {
  id?: string;
  name: string;
  floors: FloorDef[];
}

export interface FloorPlan {
  name?: string;
  /** Default wall height when not set per-floor or per-wall. */
  wallHeight?: number;
  /** Saved reset-view distance multiplier for this project (<1 closer). */
  cameraDistance?: number;
  /** Legacy / single-building: floors live here. */
  floors: FloorDef[];
  /** Designer Mode: multiple buildings (each with its own floors). */
  buildings?: BuildingDef[];
}

/** A named project entry in a multi-building card config. */
export interface ProjectRef {
  id: string;
  name?: string;
  /** Inline floor plan, OR... */
  plan?: FloorPlan;
  /** ...a URL/path to a JSON file (e.g. /local/floorplans/home.json). */
  url?: string;
}

export interface CardConfig {
  type: string;
  /** Single project: inline plan. */
  plan?: FloorPlan;
  /** Single project: load from URL. */
  url?: string;
  /** Multi-project: dropdown of buildings. */
  projects?: ProjectRef[];
  /** Card height (CSS value). Default "500px". */
  height?: string;
  /** Background color of the 3D viewport. */
  background?: string;
  /** Reset-view framing distance multiplier (<1 = closer, >1 = further). Default 1. */
  cameraDistance?: number;
  /** Start in editor mode. Default false. */
  editor?: boolean;
  /** Minutes of no input before the screensaver (big clock) appears. Default 10; 0 disables. */
  idleMinutes?: number;
  /** Optional backend base URL for project CRUD (stretch goal). */
  backend?: string;
}

// Minimal shape of the HA `hass` object we actually use.
export interface HassEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, any>;
  last_changed?: string;
  last_updated?: string;
}

export interface HomeAssistant {
  states: Record<string, HassEntity>;
  callService: (
    domain: string,
    service: string,
    data?: Record<string, any>,
  ) => Promise<unknown>;
  callWS?: (msg: Record<string, any>) => Promise<any>;
  /** REST call against HA's `/api/<path>` with this session's auth — used for
   *  the integration's shared-plan endpoint. Absent on non-HA hosts. */
  callApi?: <T = any>(method: string, path: string, parameters?: any) => Promise<T>;
  language?: string;
  locale?: { language: string };
  themes?: any;
  connection?: any;
}
