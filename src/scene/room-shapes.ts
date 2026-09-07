// ---------------------------------------------------------------------------
// Shape rooms (Designer Mode) → primitives.
//
// A shape room (rect for now) stores center/size/rotation; at build time we
// derive its floor polygon and perimeter walls so it can be moved / rotated /
// resized as a single unit. Plain polygon rooms (legacy) are untouched.
// ---------------------------------------------------------------------------

import type { RoomDef, WallDef, Vec2, OpeningDef, BuildingDef, FloorPlan } from '../types';
import { num } from './sanitize';

export function isShapeRoom(room: RoomDef): boolean {
  return !!room.shape;
}

function rotate(x: number, z: number, deg: number): Vec2 {
  const r = (deg * Math.PI) / 180;
  const c = Math.cos(r);
  const s = Math.sin(r);
  return [x * c - z * s, x * s + z * c];
}

/** Corner ring (CCW) of a shape room in world XZ. */
export function roomPolygon(room: RoomDef): Vec2[] {
  if (room.shape === 'rect' || room.shape === 'bevel' || room.shape === 'lshape') {
    // `??` only catches null/undefined — a NaN slipping in here (a half-typed
    // editor field, a bad import) would make every derived corner NaN and take
    // the floor's bounding box, and with it the camera, down with it.
    const x = num(room.x, 0);
    const z = num(room.z, 0);
    const w = Math.max(0.05, num(room.width, 3));
    const d = Math.max(0.05, num(room.depth, 3));
    const rot = num(room.rotation, 0);
    const hw = w / 2;
    const hd = d / 2;
    let local: Vec2[];
    if (room.shape === 'lshape') {
      // L cut out of the +x/+z corner (half each way).
      local = [
        [-hw, -hd],
        [hw, -hd],
        [hw, 0],
        [0, 0],
        [0, hd],
        [-hw, hd],
      ];
    } else if (room.shape === 'bevel') {
      const b = Math.min(hw, hd) * 0.4;
      local = [
        [-hw + b, -hd],
        [hw - b, -hd],
        [hw, -hd + b],
        [hw, hd - b],
        [hw - b, hd],
        [-hw + b, hd],
        [-hw, hd - b],
        [-hw, -hd + b],
      ];
    } else {
      local = [
        [-hw, -hd],
        [hw, -hd],
        [hw, hd],
        [-hw, hd],
      ];
    }
    return local.map(([lx, lz]) => {
      const [rx, rz] = rotate(lx, lz, rot);
      return [x + rx, z + rz] as Vec2;
    });
  }
  return room.polygon ?? [];
}

/** Perimeter walls for a shape room, with its openings mapped onto each edge. */
export function roomWalls(
  room: RoomDef,
  defaultHeight: number,
  defaultThickness: number,
): WallDef[] {
  const poly = roomPolygon(room);
  const walls: WallDef[] = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    const openings: OpeningDef[] = (Array.isArray(room.openings) ? room.openings : [])
      .filter((o) => o && o.edge === i)
      .map((o) => ({
        kind: o.kind,
        position: num(o.position, 0),
        width: Math.max(0, num(o.width, 0)),
        sill: o.sill == null ? undefined : num(o.sill, 0),
        top: o.top == null ? undefined : num(o.top, 0),
        bare: o.bare,
      }))
      .filter((o) => o.width > 1e-3);
    walls.push({
      start: a,
      end: b,
      height: Math.max(0.05, num(room.height, defaultHeight)),
      thickness: Math.max(0.01, num(room.thickness, defaultThickness)),
      color: room.wallColor,
      material: room.wallMaterial,
      openings: openings.length ? openings : undefined,
    });
  }
  return walls;
}

/** Buildings for a plan: explicit `buildings`, else a single implicit one. */
export function getBuildings(plan: FloorPlan): BuildingDef[] {
  if (plan.buildings && plan.buildings.length) return plan.buildings;
  return [{ id: 'b0', name: plan.name || 'Building', floors: plan.floors }];
}
