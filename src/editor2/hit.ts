// ---------------------------------------------------------------------------
// Во что человек ткнул.
//
// Попадание считается МАТЕМАТИКОЙ по плану, а не событиями SVG. Причина
// простая: стена толщиной 12 см на общем виде — это полтора пикселя, попасть в
// неё пальцем нельзя. Допуск здесь задаётся в ПИКСЕЛЯХ и переводится в метры по
// текущему масштабу, поэтому цель остаётся крупной на любом зуме.
// ---------------------------------------------------------------------------

import type { FloorDef, Vec2 } from '../types';
import { distToSeg, furnitureCorners, pointInPoly, polyArea } from './geom';
import { footprint } from './furniture-meta';
import { openingSpan, wallLength } from './model';

export type Hit =
  | { kind: 'vertex'; pt: Vec2 }
  | { kind: 'opening'; id: string; wallId: string }
  | { kind: 'furniture'; id: string }
  | { kind: 'zone'; id: string }
  | { kind: 'wall'; id: string; along: number }
  | { kind: 'room'; id: string };

/** Радиус пальца в пикселях. Меньше 12 px — снова «не могу попасть». */
export const PICK_PX = 14;

/**
 * Что лежит под точкой плана.
 *
 * Порядок важнее самого поиска: сначала то, что мельче и лежит сверху (узел,
 * проём, предмет, значок зоны), потом стена, и только потом комната — иначе
 * заливка пола перехватывала бы каждое касание.
 */
export function hitTest(floor: FloorDef, p: Vec2, tolM: number): Hit | null {
  const walls = floor.walls ?? [];

  // 1) узел — конец стены
  let bestV: Vec2 | null = null;
  let bestVd = tolM;
  for (const w of walls) {
    for (const e of [w.start, w.end] as Vec2[]) {
      const d = Math.hypot(p[0] - e[0], p[1] - e[1]);
      if (d < bestVd) {
        bestVd = d;
        bestV = [e[0], e[1]];
      }
    }
  }
  if (bestV) return { kind: 'vertex', pt: bestV };

  // 2) проём — только в пределах своего куска стены
  for (const w of walls) {
    for (const o of w.openings ?? []) {
      if (!o.id) continue;
      const [a, b] = openingSpan(w, o);
      if (distToSeg(p, a, b).d < tolM) return { kind: 'opening', id: o.id, wallId: w.id ?? '' };
    }
  }

  // 3) предмет — по своему следу на полу
  const furn = floor.furniture ?? [];
  for (let i = furn.length - 1; i >= 0; i--) {
    const f = furn[i];
    if (!f?.id) continue;
    const [fw, fd] = footprint(f.model);
    const c: Vec2 = [f.position[0], f.position[2]];
    const poly = furnitureCorners(c, Math.max(fw, tolM * 1.2), Math.max(fd, tolM * 1.2), f.rotation ?? 0);
    if (pointInPoly(p, poly)) return { kind: 'furniture', id: f.id };
  }

  // 4) значок зоны
  for (const z of floor.zones ?? []) {
    if (Math.hypot(p[0] - z.x, p[1] - z.z) < Math.max(tolM, 0.35)) return { kind: 'zone', id: z.id };
  }

  // 5) стена — с учётом её настоящей толщины
  let bestW: Hit | null = null;
  let bestWd = Infinity;
  for (const w of walls) {
    if (!w.id) continue;
    const h = distToSeg(p, w.start as Vec2, w.end as Vec2);
    const reach = tolM + (w.thickness ?? 0.12) / 2;
    if (h.d < reach && h.d < bestWd) {
      bestWd = h.d;
      bestW = { kind: 'wall', id: w.id, along: h.t * wallLength(w) };
    }
  }
  if (bestW) return bestW;

  // 6) комната — самая маленькая из накрывающих точку
  let bestR: Hit | null = null;
  let bestArea = Infinity;
  for (const r of floor.rooms ?? []) {
    if (!r.id || !r.polygon?.length) continue;
    const a = polyArea(r.polygon);
    if (a < bestArea && pointInPoly(p, r.polygon)) {
      bestArea = a;
      bestR = { kind: 'room', id: r.id };
    }
  }
  return bestR;
}

export interface WallProbe {
  id: string;
  along: number;
  len: number;
  d: number;
}

/** Ближайшая стена в пределах `maxM` — для инструментов проёма (проём скользит
 *  вдоль стены, а не ставится в воздух). */
export function nearestWallProbe(floor: FloorDef, p: Vec2, maxM: number): WallProbe | null {
  let best: WallProbe | null = null;
  let bd = maxM;
  for (const w of floor.walls ?? []) {
    if (!w.id) continue;
    const h = distToSeg(p, w.start as Vec2, w.end as Vec2);
    if (h.d < bd) {
      bd = h.d;
      const len = wallLength(w);
      best = { id: w.id, along: h.t * len, len, d: h.d };
    }
  }
  return best;
}
