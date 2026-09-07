// ---------------------------------------------------------------------------
// Geometry builder: turns a FloorDef into Three.js meshes.
//   - Walls extruded from 2D segments, with door/window openings handled by
//     splitting each wall into solid sub-spans + headers/sills (no CSG needed,
//     stays fast on tablet-class GPUs).
//   - Floors from room polygons.
//   - Furniture resolved via the loader.
// ---------------------------------------------------------------------------

import * as THREE from 'three';
import type { FloorDef, WallDef, RoomDef, OpeningDef, OpeningKind, Vec2 } from '../types';
import { resolveFurniture } from '../furniture/loader';
import { TextLabel } from './labels';
import { isShapeRoom, roomPolygon, roomWalls } from './room-shapes';
import { surfaceTexture, tiled, isBakedMaterial, grainTexture } from './materials';
import { num, vec2, finitePolygon, isFiniteBox } from './sanitize';

const DEFAULT_WALL_HEIGHT = 2.6;
const DEFAULT_THICKNESS = 0.12;

// Plan numbers are guarded on the way into geometry — see scene/sanitize.ts for
// why a single NaN used to mean a black screen with an empty console.

/** Selectable style variants for door / window openings. */
export const DOOR_VARIANTS = ['single', 'double', 'glass', 'sliding'];
export const WINDOW_VARIANTS = ['single', 'double', 'picture', 'sliding', 'terrace', 'storefront'];

// ---------------------------------------------------------------------------
// Русские подписи для списков в редакторе. Ключи ('single', 'terrace', 'door')
// лежат в сохранённых планах — их менять нельзя; человеку показывается только
// название. У двери и окна ключи совпадают, а род разный, поэтому карты две.
// ---------------------------------------------------------------------------

export const DOOR_VARIANT_LABELS: Record<string, string> = {
  single: 'Одностворчатая',
  double: 'Двустворчатая',
  glass: 'Стеклянная',
  sliding: 'Раздвижная',
};

export const WINDOW_VARIANT_LABELS: Record<string, string> = {
  single: 'Одностворчатое',
  double: 'Двустворчатое',
  picture: 'Витраж',
  sliding: 'Раздвижное',
  // Остекление во всю высоту: с дверной створкой и без неё.
  terrace: 'Панорамное с дверью',
  storefront: 'Панорамное',
};

/** Кирпич проёма: чем он вообще является. */
export const OPENING_KIND_LABELS: Record<OpeningKind, string> = {
  door: 'Дверь',
  window: 'Окно',
  opening: 'Проём',
};

/** Название варианта створки для показа человеку. Незнакомый ключ (план из
 *  будущей версии, ручная правка JSON) возвращается как есть. */
export function openingVariantLabel(kind: OpeningKind | string | undefined, variant?: string): string {
  const map = kind === 'door' ? DOOR_VARIANT_LABELS : WINDOW_VARIANT_LABELS;
  const key = variant || 'single';
  return map[key] ?? key;
}

/** Название вида проёма (дверь / окно / проём). */
export function openingKindLabel(kind?: OpeningKind | string): string {
  if (!kind) return OPENING_KIND_LABELS.opening;
  return OPENING_KIND_LABELS[kind as OpeningKind] ?? kind;
}

export interface BuiltFloor {
  group: THREE.Group;
  /** Map of furniture id -> Object3D, for binding anchors. */
  furnitureById: Map<string, THREE.Object3D>;
  /** Map of wall array-index -> wall sub-group (for editor selection). */
  wallById: Map<number, THREE.Object3D>;
  /** Map of room array-index -> floor mesh (for editor selection). */
  roomById: Map<number, THREE.Object3D>;
  /** The same walls keyed by WallDef.id. The index map moves under every delete
   *  and every mergeWalls(); the editor selects by id, so it needs a key that
   *  doesn't. Both are filled from one build — they can't drift. */
  wallByKey: Map<string, THREE.Object3D>;
  /** The same rooms keyed by RoomDef.id (see wallByKey). */
  roomByKey: Map<string, THREE.Object3D>;
  /** Bounding box of this floor in world space. */
  bbox: THREE.Box3;
  labels: TextLabel[];
  /** Elements dropped because their numbers were unusable ("стена 3", "мебель
   *  sofa1"). The house still draws; the card tells the human what is missing,
   *  because a wall that vanishes silently is worse than one that complains. */
  skipped: string[];
}

function wallMaterial(color?: string, material?: string): THREE.MeshStandardMaterial {
  // Baked materials (wood/marble) carry their own colour → show on white so the
  // rich tone reads through; a user-chosen colour still tints if set.
  //
  // Unpainted walls default to champagne, not neutral grey. A wall at R=G=B takes
  // light back flat and dead — the room reads cheap however good the geometry is.
  // Champagne's red sitting well above its blue lets the lamps land warm on it,
  // which is most of what makes an interior look expensive.
  const base = color ?? (isBakedMaterial(material) ? '#ffffff' : '#dcc3a0');
  return new THREE.MeshStandardMaterial({
    color: base,
    roughness: 0.9,
    metalness: 0.0,
    // Plain walls get a shared fine grain so they read as painted plaster, not
    // flat plastic (shared → still merges in view mode).
    map: material && material !== 'plain' ? tiled(surfaceTexture(material), 3, 2) : grainTexture(),
  });
}

/** Add a single axis-aligned-along-segment wall box spanning [a, b] of the wall. */
function addWallSpan(
  group: THREE.Group,
  start: THREE.Vector2,
  dir: THREE.Vector2,
  normalAngle: number,
  from: number,
  to: number,
  yBottom: number,
  yTop: number,
  thickness: number,
  material: THREE.Material,
): void {
  const len = to - from;
  // Written as `!(x > n)` on purpose: `NaN <= 1e-4` is false, so the obvious
  // form lets NaN straight into BoxGeometry (see the note at the top).
  if (!(len > 1e-4)) return;
  const height = yTop - yBottom;
  if (!(height > 1e-4)) return;
  if (!(thickness > 0) || !Number.isFinite(start.x) || !Number.isFinite(start.y)) return;
  if (!Number.isFinite(dir.x) || !Number.isFinite(dir.y) || !Number.isFinite(normalAngle)) return;
  const geo = new THREE.BoxGeometry(len, height, thickness);
  const mesh = new THREE.Mesh(geo, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  const mid = from + len / 2;
  const cx = start.x + dir.x * mid;
  const cz = start.y + dir.y * mid;
  mesh.position.set(cx, yBottom + height / 2, cz);
  mesh.rotation.y = normalAngle;
  group.add(mesh);
}

function buildWall(
  parent: THREE.Group,
  wall: WallDef,
  defaultHeight: number,
  index: number,
): THREE.Group | null {
  const s2 = vec2(wall?.start);
  const e2 = vec2(wall?.end);
  const start = new THREE.Vector2(s2[0], s2[1]);
  const end = new THREE.Vector2(e2[0], e2[1]);
  const full = end.clone().sub(start);
  const length = full.length();
  if (!(length > 1e-4)) return null;
  const dir = full.clone().normalize();
  // Each wall's spans live in their own group so the editor can pick/select/
  // color/delete the whole wall as a unit.
  const group = new THREE.Group();
  group.userData.wallIndex = index;
  if (wall.id) group.userData.wallId = wall.id;
  // Rotation so a box's local X aligns with the wall direction (in XZ plane).
  const angle = Math.atan2(dir.y, dir.x);
  const normalAngle = -angle;

  const height = Math.max(0.05, num(wall.height, num(defaultHeight, DEFAULT_WALL_HEIGHT)));
  const thickness = Math.max(0.01, num(wall.thickness, DEFAULT_THICKNESS));
  const material = wallMaterial(wall.color, wall.material);
  // Door/window frames are rendered INTO the wall group so they're owned by the
  // wall (deleted with it), coupled to the opening, and sized to the hole.
  const doorMat = new THREE.MeshStandardMaterial({ color: 0xb98a52, roughness: 0.6 });
  const doorFrameMat = new THREE.MeshStandardMaterial({ color: 0x6f5535, roughness: 0.55 });
  const handleMat = new THREE.MeshStandardMaterial({ color: 0xcbb26a, roughness: 0.35, metalness: 0.6 });
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x9cc7da,
    transparent: true,
    opacity: 0.38, // see-through: glass reads as a real opening through the wall
    roughness: 0.05,
    metalness: 0.25,
    depthWrite: false,
  });
  // Window frame is darker so it reads against light walls (was invisible white-on-white).
  const winFrameMat = new THREE.MeshStandardMaterial({ color: 0x55606a, roughness: 0.6 });

  // Keep each opening's ORIGINAL index (for selection/editing) while drawing
  // them left-to-right.
  // Sanitised copies: an opening with a NaN/absent position or width must not
  // reach clamp() (which would return NaN) or BoxGeometry. A zero-width opening
  // is dropped outright — it can only ever draw nothing.
  const openings = (Array.isArray(wall.openings) ? wall.openings : [])
    .map((raw, oi) => ({
      oi,
      op: {
        ...raw,
        position: num(raw?.position, 0),
        width: Math.max(0, num(raw?.width, 0)),
        sill: raw?.sill == null ? undefined : num(raw.sill, 0),
        top: raw?.top == null ? undefined : num(raw.top, 0),
      } as OpeningDef,
    }))
    .filter(({ op }) => op.width > 1e-3)
    .sort((a, b) => a.op.position - b.op.position);

  let cursor = 0;
  for (const { op, oi } of openings) {
    const opStart = clamp(op.position, 0, length);
    const opEnd = clamp(op.position + op.width, 0, length);
    if (opEnd <= cursor) continue; // fully engulfed by a previous opening — skip
    // Solid wall before the opening.
    addWallSpan(group, start, dir, normalAngle, cursor, opStart, 0, height, thickness, material);
    // Sill below (windows) and header above the opening. A bare "opening" is a
    // cased passage (no leaf), taller than a door so corridors read as open.
    const sill = op.sill ?? (op.kind === 'window' ? 0.9 : 0);
    const top = op.top ?? (op.kind === 'window' ? 2.1 : op.kind === 'opening' ? 2.4 : 2.05);
    if (sill > 0) {
      addWallSpan(group, start, dir, normalAngle, opStart, opEnd, 0, sill, thickness, material);
    }
    if (top < height) {
      addWallSpan(group, start, dir, normalAngle, opStart, opEnd, top, height, thickness, material);
    }
    // "bare" openings are just holes — skip the leaf/glass infill.
    if (op.bare) {
      cursor = Math.max(cursor, opEnd);
      continue;
    }
    // The leaf/glass lives in its own sub-group so it can be picked + selected +
    // restyled (variant) independently of the wall.
    const opGroup = new THREE.Group();
    // Only explicit walls (index >= 0) get pickable openings; shape-room walls
    // (index -1) stay part of the room selection.
    if (index >= 0) {
      opGroup.userData.openingWall = index;
      opGroup.userData.openingIndex = oi;
      // Parallel id keys: the numbers above still answer "which slot", these
      // answer "which opening" after the slots have moved.
      if (wall.id) opGroup.userData.openingWallId = wall.id;
      if (op.id) opGroup.userData.openingId = op.id;
    }
    group.add(opGroup);
    const span = (a: number, b: number, yb: number, yt: number, th: number, mat: THREE.Material) =>
      addWallSpan(opGroup, start, dir, normalAngle, a, b, yb, yt, th, mat);
    // A small proud knob at distance `along` (m from wall start) and height `y`.
    const handle = (along: number, y: number) =>
      span(along - 0.025, along + 0.025, y - 0.05, y + 0.05, thickness * 1.5, handleMat);
    const fw = 0.06; // frame width
    const mid = (opStart + opEnd) / 2;
    const ymid = (sill + top) / 2;
    if (op.kind === 'door') {
      const v = op.variant || 'single';
      // A finished casing/frame around the opening (wood, slightly proud of the
      // wall) so doors read as installed rather than a bare slab.
      span(opStart, opStart + fw, sill, top, thickness * 1.15, doorFrameMat);
      span(opEnd - fw, opEnd, sill, top, thickness * 1.15, doorFrameMat);
      span(opStart, opEnd, top - fw, top, thickness * 1.15, doorFrameMat);
      const li = opStart + fw;
      const ri = opEnd - fw;
      const ti = top - fw;
      const lmid = (li + ri) / 2;
      if (v === 'double') {
        span(li, lmid - 0.02, sill, ti, 0.055, doorMat);
        span(lmid + 0.02, ri, sill, ti, 0.055, doorMat);
        handle(lmid - 0.1, ymid);
        handle(lmid + 0.1, ymid);
      } else if (v === 'glass') {
        span(li, li + fw, sill, ti, thickness, doorMat);
        span(ri - fw, ri, sill, ti, thickness, doorMat);
        span(li + fw, ri - fw, sill, ti - fw, 0.04, glassMat);
        handle(ri - 0.12, ymid);
      } else if (v === 'sliding') {
        span(li, lmid + 0.06, sill, ti, 0.045, glassMat);
        span(lmid - 0.06, ri, sill, ti, 0.05, doorMat);
        handle(lmid - 0.12, ymid);
      } else {
        span(li, ri, sill, ti, 0.055, doorMat); // single leaf, inset in casing
        handle(ri - 0.12, ymid);
      }
    } else {
      // Window: frame all around + see-through glass spanning the wall thickness.
      const v = op.variant || 'single';
      span(opStart, opStart + fw, sill, top, thickness * 1.05, winFrameMat);
      span(opEnd - fw, opEnd, sill, top, thickness * 1.05, winFrameMat);
      span(opStart, opEnd, sill, sill + fw, thickness * 1.05, winFrameMat);
      span(opStart, opEnd, top - fw, top, thickness * 1.05, winFrameMat);
      span(opStart + fw, opEnd - fw, sill + fw, top - fw, thickness, glassMat);
      if (v === 'single') {
        span(mid - 0.03, mid + 0.03, sill + fw, top - fw, thickness * 1.05, winFrameMat);
        span(opStart + fw, opEnd - fw, ymid - 0.03, ymid + 0.03, thickness * 1.05, winFrameMat);
      } else if (v === 'double' || v === 'sliding') {
        span(mid - 0.03, mid + 0.03, sill + fw, top - fw, thickness * 1.05, winFrameMat);
      } else if (v === 'terrace') {
        // Full-height glazing: several vertical mullions + one framed door pane.
        const panes = Math.max(2, Math.round((opEnd - opStart) / 0.95));
        for (let i = 1; i < panes; i++) {
          const x = opStart + ((opEnd - opStart) * i) / panes;
          span(x - 0.03, x + 0.03, sill + fw, top - fw, thickness * 1.05, winFrameMat);
        }
        // Turn the first pane into a door: outline it + a handle.
        const dx = opStart + (opEnd - opStart) / panes;
        span(opStart + fw, dx, sill, sill + 0.06, thickness * 1.1, winFrameMat); // bottom rail
        handle(dx - 0.14, 1.05);
      } else if (v === 'storefront') {
        // Full-height mullioned glazing WITHOUT a door (a terrace/picture window).
        const panes = Math.max(2, Math.round((opEnd - opStart) / 0.9));
        for (let i = 1; i < panes; i++) {
          const x = opStart + ((opEnd - opStart) * i) / panes;
          span(x - 0.03, x + 0.03, sill + fw, top - fw, thickness * 1.05, winFrameMat);
        }
        const ty = sill + (top - sill) * 0.74; // one horizontal transom near the top
        span(opStart + fw, opEnd - fw, ty - 0.03, ty + 0.03, thickness * 1.05, winFrameMat);
      }
      // 'picture' → no mullions (clean pane).
    }
    cursor = Math.max(cursor, opEnd);
  }
  // Remaining solid wall after the last opening.
  addWallSpan(group, start, dir, normalAngle, cursor, length, 0, height, thickness, material);

  // Corner posts at both ends fill the gap where walls meet at an angle (a 90°
  // joint would otherwise leave an open corner).
  for (const pt of [start, end]) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(thickness, height, thickness), material);
    post.position.set(pt.x, height / 2, pt.y);
    post.castShadow = true;
    post.receiveShadow = true;
    group.add(post);
  }

  parent.add(group);
  return group;
}

function buildFloor(
  group: THREE.Group,
  room: RoomDef,
  index: number,
  polygon: Vec2[],
): { centroid: THREE.Vector2; mesh: THREE.Mesh } | null {
  const poly = finitePolygon(polygon);
  if (poly.length < 3) return null;
  const shape = new THREE.Shape();
  poly.forEach((p, i) => {
    if (i === 0) shape.moveTo(p[0], p[1]);
    else shape.lineTo(p[0], p[1]);
  });
  shape.closePath();
  const geo = new THREE.ShapeGeometry(shape);
  // ShapeGeometry lies in XY; rotate to XZ and lift slightly to avoid z-fighting.
  geo.rotateX(Math.PI / 2);
  const mesh = new THREE.Mesh(
    geo,
    new THREE.MeshStandardMaterial({
      // Honey oak, not greige: a floor darker and warmer than the walls is what
      // gives a room depth. Equal-toned walls and floor read as a model, not a home.
      color: room.color ?? (isBakedMaterial(room.material) ? '#ffffff' : '#c6a87e'),
      roughness: 0.9,
      metalness: 0,
      side: THREE.DoubleSide,
      map: room.material && room.material !== 'plain' ? surfaceTexture(room.material) : grainTexture(),
    }),
  );
  mesh.position.y = 0.005;
  mesh.receiveShadow = true;
  mesh.userData.roomIndex = index;
  if (room.id) mesh.userData.roomId = room.id;
  group.add(mesh);

  // centroid for label
  let cx = 0, cz = 0;
  for (const p of poly) {
    cx += p[0];
    cz += p[1];
  }
  return {
    centroid: new THREE.Vector2(cx / poly.length, cz / poly.length),
    mesh,
  };
}

const isFiniteVec2 = (v: unknown): v is [number, number] =>
  Array.isArray(v) && v.length >= 2 && Number.isFinite(v[0]) && Number.isFinite(v[1]);

/** Default wall height for a floor (per-floor, else per-plan, else 2.6). Shared
 *  so a single-element rebuild uses exactly the number the full build used. */
export function floorWallHeight(floor: FloorDef, planWallHeight?: number): number {
  return Math.max(0.05, num(floor?.wallHeight, num(planWallHeight, DEFAULT_WALL_HEIGHT)));
}

/**
 * ONE wall of a floor, built into `group`.
 *
 * Exported so an in-place edit (dragging a vertex, sliding a door, typing a
 * width) can re-cut just the wall that changed instead of tearing the whole
 * plan down and building it again. Same code path as the full build, so the two
 * can't drift apart. Throws on unusable coordinates — see the caller's isolate().
 */
export function buildWallElement(
  group: THREE.Group,
  wall: WallDef,
  index: number,
  defaultHeight: number,
): THREE.Object3D | null {
  // Sanitising an unusable endpoint to 0 would draw a wall the customer
  // never drew — worse than a gap, because nothing on screen says so.
  // A missing coordinate is a MISSING element: skip it and be counted.
  if (!isFiniteVec2(wall?.start) || !isFiniteVec2(wall?.end)) {
    throw new Error('координаты стены не заданы или не число');
  }
  return buildWall(group, wall, defaultHeight, index);
}

/**
 * ONE room of a floor: its floor polygon plus, for a shape room, its perimeter
 * walls. Returns the floor mesh (the pickable/selectable part).
 *
 * Shape-room perimeter walls are owned by the room (tagged roomIndex/roomId,
 * not wallIndex) so clicking a wall selects the ROOM, not a wall segment.
 */
export function buildRoomElement(
  group: THREE.Group,
  room: RoomDef,
  index: number,
  defaultHeight: number,
): THREE.Object3D | null {
  const poly = isShapeRoom(room) ? roomPolygon(room) : room.polygon;
  const built = buildFloor(group, room, index, poly);
  // (room name labels intentionally NOT rendered — no floating text in rooms)
  if (isShapeRoom(room)) {
    const rh = Math.max(0.05, num(room.height, defaultHeight));
    const th = Math.max(0.01, num(room.thickness, DEFAULT_THICKNESS));
    for (const w of roomWalls(room, rh, th)) {
      const wg = buildWall(group, w, rh, -1);
      if (wg) {
        delete wg.userData.wallIndex;
        delete wg.userData.wallId;
        wg.userData.roomIndex = index;
        if (room.id) wg.userData.roomId = room.id;
      }
    }
  }
  return built?.mesh ?? null;
}

export function buildFloorGroup(floor: FloorDef, planWallHeight?: number): BuiltFloor {
  const group = new THREE.Group();
  group.position.y = num(floor?.elevation, 0);
  const defaultHeight = floorWallHeight(floor, planWallHeight);
  const labels: TextLabel[] = [];
  const wallById = new Map<number, THREE.Object3D>();
  const roomById = new Map<number, THREE.Object3D>();
  const wallByKey = new Map<string, THREE.Object3D>();
  const roomByKey = new Map<string, THREE.Object3D>();
  // Every element is built in isolation: one broken wall or one broken piece of
  // furniture is skipped with a named warning, and the rest of the house is
  // still drawn. Before this, a single throw took the whole plan down.
  const skipped: string[] = [];
  const isolate = (what: string, fn: () => void): void => {
    try {
      fn();
    } catch (err) {
      skipped.push(what);
      console.warn(`[3d-floorplan] skipped a broken plan element (${what}):`, err);
    }
  };

  (Array.isArray(floor?.rooms) ? floor.rooms : []).forEach((room, i) => {
    isolate(`комната №${i + 1}${room?.name ? ` «${room.name}»` : ''}`, () => {
      const mesh = buildRoomElement(group, room, i, defaultHeight);
      if (mesh) {
        roomById.set(i, mesh);
        if (room.id) roomByKey.set(room.id, mesh);
      }
    });
  });

  (Array.isArray(floor?.walls) ? floor.walls : []).forEach((wall, i) => {
    isolate(`стена №${i + 1}`, () => {
      const wg = buildWallElement(group, wall, i, defaultHeight);
      if (wg) {
        wallById.set(i, wg);
        if (wall.id) wallByKey.set(wall.id, wg);
      }
    });
  });

  const furnitureById = new Map<string, THREE.Object3D>();
  (Array.isArray(floor?.furniture) ? floor.furniture : []).forEach((f, i) => {
    isolate(`мебель №${i + 1}${f?.model ? ` (${f.model})` : ''}`, () => {
      if (!Array.isArray(f?.position) || !f.position.slice(0, 3).every(Number.isFinite)) {
        throw new Error('координаты предмета не заданы или не число');
      }
      const obj = resolveFurniture(f);
      obj.userData.model = f.model; // so a binding can tell WHAT it's anchored to
      // Manual brightness: glow the emissive parts even without a bound entity
      // (a bound light still overrides this on state updates).
      const brightness = f.brightness == null ? 0 : num(f.brightness, 0);
      if (brightness > 0) {
        obj.traverse((o) => {
          const m = o as THREE.Mesh;
          if (m.isMesh && m.name === 'emissive') {
            const mat = m.material as THREE.MeshStandardMaterial;
            if (mat && 'emissive' in mat) {
              mat.emissive.setHex(0xfff1d0);
              mat.emissiveIntensity = brightness;
            }
          }
        });
      }
      group.add(obj);
      if (f.id) furnitureById.set(f.id, obj);
    });
  });

  if (skipped.length) {
    console.warn(
      `[3d-floorplan] plan drawn without ${skipped.length} broken element(s): ${skipped.join(', ')}`,
    );
  }

  const bbox = new THREE.Box3().setFromObject(group);
  // A NaN box would put the camera at NaN and black the screen; an EMPTY box is
  // handled (resetView frames a default area around the origin), so degrade to
  // that instead of trusting a poisoned one.
  if (!isFiniteBox(bbox)) {
    console.warn('[3d-floorplan] floor bounding box is not finite — framing a default view instead');
    bbox.makeEmpty();
  }
  return { group, furnitureById, wallById, roomById, wallByKey, roomByKey, bbox, labels, skipped };
}

/** NaN-safe clamp: `Math.min(hi, NaN)` is NaN, so an unsanitised value used to
 *  clamp to NaN and travel on into the geometry. */
function clamp(v: number, lo: number, hi: number): number {
  const n = num(v, lo);
  return Math.max(lo, Math.min(hi, n));
}

export { DEFAULT_WALL_HEIGHT };
