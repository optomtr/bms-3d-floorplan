// ---------------------------------------------------------------------------
// Numeric guards for plan data.
//
// A plan is user data: hand-edited JSON, a half-finished sync, an import from
// another tool, an editor field left mid-typing. One non-finite number used to
// be fatal AND invisible:
//
//   NaN <= 1e-4  is false  →  the "too short to draw" guard lets NaN through
//   →  new THREE.BoxGeometry(NaN)  →  NaN vertices  →  NaN bounding box
//   →  the camera is framed at NaN  →  black screen, and nothing in the console.
//
// So every number that reaches geometry passes through here first, and every
// "is it big enough" test is written as `!(x > n)` so NaN fails it.
// ---------------------------------------------------------------------------

import type * as THREE from 'three';
import type { Vec2 } from '../types';

/** A finite number, or the fallback. */
export function num(v: unknown, fallback: number): number {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
}

/** A finite 2D point, defaulting each axis independently. */
export function vec2(v: unknown, fx = 0, fy = 0): Vec2 {
  const a = Array.isArray(v) ? v : [];
  return [num(a[0], fx), num(a[1], fy)];
}

/** Drop polygon points that aren't finite instead of letting them poison the
 *  shape — a single NaN vertex makes the whole floor mesh, and its bounding
 *  box, NaN. */
export function finitePolygon(poly: unknown): Vec2[] {
  const out: Vec2[] = [];
  for (const p of Array.isArray(poly) ? poly : []) {
    if (!Array.isArray(p)) continue;
    const x = Number(p[0]);
    const y = Number(p[1]);
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
    out.push([x, y]);
  }
  return out;
}

/** True when every component of the box is a real number. A NaN box is worse
 *  than an empty one: Box3.isEmpty() answers false for it (NaN comparisons are
 *  always false), so it sails straight into the camera framing. */
export function isFiniteBox(box: THREE.Box3): boolean {
  return (
    Number.isFinite(box.min.x) && Number.isFinite(box.min.y) && Number.isFinite(box.min.z) &&
    Number.isFinite(box.max.x) && Number.isFinite(box.max.y) && Number.isFinite(box.max.z)
  );
}
