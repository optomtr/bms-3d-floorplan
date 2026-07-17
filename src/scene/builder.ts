// ---------------------------------------------------------------------------
// Geometry builder: turns a FloorDef into Three.js meshes.
//   - Walls extruded from 2D segments, with door/window openings handled by
//     splitting each wall into solid sub-spans + headers/sills (no CSG needed,
//     stays fast on tablet-class GPUs).
//   - Floors from room polygons.
//   - Furniture resolved via the loader.
// ---------------------------------------------------------------------------

import * as THREE from 'three';
import type { FloorDef, WallDef, RoomDef, Vec2 } from '../types';
import { resolveFurniture } from '../furniture/loader';
import { TextLabel } from './labels';
import { isShapeRoom, roomPolygon, roomWalls } from './room-shapes';
import { surfaceTexture, tiled, isBakedMaterial, grainTexture } from './materials';

const DEFAULT_WALL_HEIGHT = 2.6;
const DEFAULT_THICKNESS = 0.12;

/** Selectable style variants for door / window openings. */
export const DOOR_VARIANTS = ['single', 'double', 'glass', 'sliding'];
export const WINDOW_VARIANTS = ['single', 'double', 'picture', 'sliding', 'terrace', 'storefront'];

export interface BuiltFloor {
  group: THREE.Group;
  /** Map of furniture id -> Object3D, for binding anchors. */
  furnitureById: Map<string, THREE.Object3D>;
  /** Map of wall array-index -> wall sub-group (for editor selection). */
  wallById: Map<number, THREE.Object3D>;
  /** Map of room array-index -> floor mesh (for editor selection). */
  roomById: Map<number, THREE.Object3D>;
  /** Bounding box of this floor in world space. */
  bbox: THREE.Box3;
  labels: TextLabel[];
}

function wallMaterial(color?: string, material?: string): THREE.MeshStandardMaterial {
  // Baked materials (wood/marble) carry their own colour → show on white so the
  // rich tone reads through; a user-chosen colour still tints if set.
  //
  // Unpainted walls are warm ivory, not neutral grey. A wall at R=G=B takes light
  // back flat and dead — the room reads cheap however good the geometry is.
  // Nudging red above blue lets the lamps land warm on it, which is most of what
  // makes an interior look expensive.
  const base = color ?? (isBakedMaterial(material) ? '#ffffff' : '#eae2d4');
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
  if (len <= 1e-4) return;
  const height = yTop - yBottom;
  if (height <= 1e-4) return;
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
  const start = new THREE.Vector2(wall.start[0], wall.start[1]);
  const end = new THREE.Vector2(wall.end[0], wall.end[1]);
  const full = end.clone().sub(start);
  const length = full.length();
  if (length <= 1e-4) return null;
  const dir = full.clone().normalize();
  // Each wall's spans live in their own group so the editor can pick/select/
  // color/delete the whole wall as a unit.
  const group = new THREE.Group();
  group.userData.wallIndex = index;
  // Rotation so a box's local X aligns with the wall direction (in XZ plane).
  const angle = Math.atan2(dir.y, dir.x);
  const normalAngle = -angle;

  const height = wall.height ?? defaultHeight;
  const thickness = wall.thickness ?? DEFAULT_THICKNESS;
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
  const openings = (wall.openings ?? [])
    .map((op, oi) => ({ op, oi }))
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
  if (!polygon || polygon.length < 3) return null;
  const shape = new THREE.Shape();
  polygon.forEach((p, i) => {
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
  group.add(mesh);

  // centroid for label
  let cx = 0, cz = 0;
  for (const p of polygon) {
    cx += p[0];
    cz += p[1];
  }
  return {
    centroid: new THREE.Vector2(cx / polygon.length, cz / polygon.length),
    mesh,
  };
}

export function buildFloorGroup(floor: FloorDef, planWallHeight?: number): BuiltFloor {
  const group = new THREE.Group();
  group.position.y = floor.elevation ?? 0;
  const defaultHeight = floor.wallHeight ?? planWallHeight ?? DEFAULT_WALL_HEIGHT;
  const labels: TextLabel[] = [];
  const wallById = new Map<number, THREE.Object3D>();
  const roomById = new Map<number, THREE.Object3D>();

  (floor.rooms ?? []).forEach((room, i) => {
    const poly = isShapeRoom(room) ? roomPolygon(room) : room.polygon;
    const built = buildFloor(group, room, i, poly);
    if (built) {
      roomById.set(i, built.mesh);
      // (room name labels intentionally NOT rendered — no floating text in rooms)
    }
    // Shape rooms also generate their perimeter walls. They're owned by the
    // room (tagged roomIndex, not wallIndex) so clicking a wall selects the
    // ROOM, not an individual wall segment.
    if (isShapeRoom(room)) {
      const th = room.thickness ?? DEFAULT_THICKNESS;
      for (const w of roomWalls(room, room.height ?? defaultHeight, th)) {
        const wg = buildWall(group, w, room.height ?? defaultHeight, -1);
        if (wg) {
          delete wg.userData.wallIndex;
          wg.userData.roomIndex = i;
        }
      }
    }
  });

  (floor.walls ?? []).forEach((wall, i) => {
    const wg = buildWall(group, wall, defaultHeight, i);
    if (wg) wallById.set(i, wg);
  });

  const furnitureById = new Map<string, THREE.Object3D>();
  for (const f of floor.furniture ?? []) {
    const obj = resolveFurniture(f);
    // Manual brightness: glow the emissive parts even without a bound entity
    // (a bound light still overrides this on state updates).
    if (f.brightness != null && f.brightness > 0) {
      obj.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.isMesh && m.name === 'emissive') {
          const mat = m.material as THREE.MeshStandardMaterial;
          if (mat && 'emissive' in mat) {
            mat.emissive.setHex(0xfff1d0);
            mat.emissiveIntensity = f.brightness as number;
          }
        }
      });
    }
    group.add(obj);
    if (f.id) furnitureById.set(f.id, obj);
  }

  const bbox = new THREE.Box3().setFromObject(group);
  return { group, furnitureById, wallById, roomById, bbox, labels };
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

export { DEFAULT_WALL_HEIGHT };
