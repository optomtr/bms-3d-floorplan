// ---------------------------------------------------------------------------
// «Магнит» редактора: куда на самом деле встанет точка, которую человек тапнул.
//
// Тоже чистые функции: стены приходят аргументом, а не через `this`. Раньше
// snapPoint() был 73 строками математики внутри контроллера и проверить его
// можно было только глазами на планшете.
//
// Порядок притяжения (он же порядок приоритета):
//   1) стык — на ближайшую существующую вершину или вершину текущей цепочки;
//   2) угол — направление отрезка к шагу 15° (параллельно / перпендикулярно);
//   3) длина — к длине соседней стены (равные стены), иначе к сетке;
// плюс выравнивание ПЕРВОЙ точки по x/z с существующей вершиной.
// ---------------------------------------------------------------------------

import type { FloorDef, Vec2, WallDef } from '../types';
import { isShapeRoom, roomPolygon } from '../scene/room-shapes';
import { SNAP, snap } from './geometry';
import type { WallMountPoint } from './geometry';

export type { WallMountPoint } from './geometry';

/** Расстояние, на котором новая точка садится на существующую вершину. */
export const VERT_SNAP = 0.3;
/** 15° — сильное притяжение к параллели и перпендикуляру. */
const ANGLE_STEP = Math.PI / 12;
/** Допуск, внутри которого длина отрезка приравнивается к длине соседней стены. */
const LEN_TOL = 0.12;
/** Допуск выравнивания первой точки по оси с существующей вершиной. */
const ALIGN_TOL = 0.25;

export interface SnapResult {
  pt: Vec2;
  /** Точка села на существующую вершину (стены соединились). */
  joined: boolean;
  /** Длина отрезка равна длине существующей стены. */
  matchedLen: boolean;
  /** Отрезок параллелен существующей стене. */
  parallel: boolean;
  lengthM: number;
  angleDeg: number;
}

export interface SnapInput {
  /** Стены этажа — источник вершин, длин и направлений. */
  walls: WallDef[];
  /** Точки текущей цепочки (последняя — та, от которой тянется отрезок). */
  chain: Vec2[];
  /** Магнит включён. Выключенный оставляет только стык и сетку. */
  enabled: boolean;
}

/** Все концы всех стен этажа. */
export function existingEndpoints(walls: WallDef[]): Vec2[] {
  const out: Vec2[] = [];
  for (const w of walls) out.push([w.start[0], w.start[1]], [w.end[0], w.end[1]]);
  return out;
}

/** Ближайший конец стены в пределах `tol` (или null). */
export function nearestEndpoint(walls: WallDef[], x: number, z: number, tol: number): Vec2 | null {
  let best: Vec2 | null = null;
  let bd = tol;
  for (const w of walls) {
    for (const pt of [w.start, w.end]) {
      const d = Math.hypot(x - pt[0], z - pt[1]);
      if (d < bd) {
        bd = d;
        best = [pt[0], pt[1]];
      }
    }
  }
  return best;
}

/** Точка стоит ровно на существующей вершине — рисуем крупный «стык». */
export function isConnection(walls: WallDef[], pt: Vec2): boolean {
  return existingEndpoints(walls).some((e) => Math.hypot(e[0] - pt[0], e[1] - pt[1]) < 1e-3);
}

export function snapPoint(x: number, z: number, input: SnapInput): SnapResult {
  const { walls, chain, enabled } = input;
  const last = chain[chain.length - 1] as Vec2 | undefined;
  const angTo = (a: Vec2, b: Vec2) => (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
  const make = (pt: Vec2, extra: Partial<SnapResult> = {}): SnapResult => ({
    pt,
    joined: false,
    matchedLen: false,
    parallel: false,
    lengthM: last ? Math.hypot(pt[0] - last[0], pt[1] - last[1]) : 0,
    angleDeg: last ? angTo(last, pt) : 0,
    ...extra,
  });

  // 1) Стык с существующей вершиной или вершиной цепочки.
  let best: Vec2 | null = null;
  let bd = VERT_SNAP;
  for (const c of [...existingEndpoints(walls), ...chain]) {
    const d = Math.hypot(x - c[0], z - c[1]);
    if (d < bd) {
      bd = d;
      best = c;
    }
  }
  if (best) return make([best[0], best[1]], { joined: true });

  if (!enabled) return make([snap(x), snap(z)]);

  // Первая точка отрезка: выровнять x/z по существующей вершине, если близко.
  if (!last) {
    let px = snap(x);
    let pz = snap(z);
    for (const e of existingEndpoints(walls)) {
      if (Math.abs(x - e[0]) < ALIGN_TOL) px = e[0];
      if (Math.abs(z - e[1]) < ALIGN_TOL) pz = e[1];
    }
    return make([px, pz]);
  }

  // 2) Угол относительно предыдущей точки.
  const dx = x - last[0];
  const dz = z - last[1];
  const rawLen = Math.hypot(dx, dz);
  if (rawLen < 1e-4) return make([last[0], last[1]]);
  const ang = Math.round(Math.atan2(dz, dx) / ANGLE_STEP) * ANGLE_STEP;

  // 3) Длина: к длине близкой существующей стены, иначе к сетке.
  let finalLen = Math.round(rawLen / SNAP) * SNAP;
  let matchedLen = false;
  let bestDiff = LEN_TOL;
  for (const w of walls) {
    const wl = Math.hypot(w.end[0] - w.start[0], w.end[1] - w.start[1]);
    if (Math.abs(wl - rawLen) < bestDiff) {
      bestDiff = Math.abs(wl - rawLen);
      finalLen = wl;
      matchedLen = true;
    }
  }

  // Держим ровно то направление и ту длину, которые выбрали, — координаты по
  // сетке НЕ доводим: это исказило бы и угол, и длину.
  const pt: Vec2 = [last[0] + Math.cos(ang) * finalLen, last[1] + Math.sin(ang) * finalLen];

  // Параллельность считаем по фактическому направлению отрезка.
  const fang = Math.atan2(pt[1] - last[1], pt[0] - last[0]);
  const parallel = walls.some((w) => {
    const wa = Math.atan2(w.end[1] - w.start[1], w.end[0] - w.start[0]);
    let diff = Math.abs(wa - fang) % Math.PI;
    if (diff > Math.PI / 2) diff = Math.PI - diff;
    return diff < 0.03;
  });

  return make(pt, { matchedLen, parallel });
}

/** Попадание в отрезок: индекс стены, расстояние от её начала до проекции и
 *  полная длина стены. */
export interface WallHit {
  index: number;
  along: number;
  len: number;
}

/**
 * Ближайшая к точке стена в пределах `maxDist`. Одна и та же математика нужна
 * трём инструментам (остекление, врезка гаражных ворот, проём), и раньше она
 * была переписана в каждом из них.
 */
export function nearestWall(walls: WallDef[], px: number, pz: number, maxDist: number): WallHit | null {
  let best: WallHit | null = null;
  let bd = maxDist;
  for (let i = 0; i < walls.length; i++) {
    const w = walls[i];
    const ax = w.start[0], az = w.start[1];
    const dx = w.end[0] - ax, dz = w.end[1] - az;
    const l2 = dx * dx + dz * dz;
    if (l2 < 1e-6) continue;
    let t = ((px - ax) * dx + (pz - az) * dz) / l2;
    t = Math.max(0, Math.min(1, t));
    const cx = ax + dx * t, cz = az + dz * t;
    const d = Math.hypot(px - cx, pz - cz);
    if (d < bd) {
      bd = d;
      const len = Math.sqrt(l2);
      best = { index: i, along: t * len, len };
    }
  }
  return best;
}

/**
 * Ближайшая точка на любой стене или на грани комнаты-фигуры, с поворотом и
 * нормалью (с какой стороны стены тапнули) — вход для посадки навесной мебели.
 */
export function nearestMountPoint(floor: FloorDef, px: number, pz: number, maxDist = 1.2): WallMountPoint | null {
  let bd = maxDist;
  let best: WallMountPoint | null = null;
  const tryEdge = (ax: number, az: number, bx: number, bz: number, thickness: number) => {
    const dx = bx - ax, dz = bz - az;
    const len2 = dx * dx + dz * dz;
    if (len2 < 1e-6) return;
    let t = ((px - ax) * dx + (pz - az) * dz) / len2;
    t = Math.max(0, Math.min(1, t));
    const cx = ax + dx * t, cz = az + dz * t;
    const d = Math.hypot(px - cx, pz - cz);
    if (d < bd) {
      bd = d;
      const len = Math.sqrt(len2);
      // единичная нормаль в сторону тапнутой стороны стены
      let nx = -dz / len, nz = dx / len;
      if ((px - cx) * nx + (pz - cz) * nz < 0) {
        nx = -nx;
        nz = -nz;
      }
      best = { x: cx, z: cz, rotation: (-Math.atan2(dz, dx) * 180) / Math.PI, nx, nz, thickness };
    }
  };
  for (const w of floor.walls ?? []) {
    tryEdge(w.start[0], w.start[1], w.end[0], w.end[1], w.thickness ?? 0.12);
  }
  for (const room of floor.rooms ?? []) {
    if (!isShapeRoom(room)) continue;
    const poly = roomPolygon(room);
    const th = room.thickness ?? 0.12;
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i];
      const b = poly[(i + 1) % poly.length];
      tryEdge(a[0], a[1], b[0], b[1], th);
    }
  }
  return best;
}
