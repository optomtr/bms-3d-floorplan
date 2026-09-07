// ---------------------------------------------------------------------------
// Плоская геометрия редактора: сетка, вершины, поворот, дуга, посадка на стену.
//
// Здесь нет ни сцены, ни DOM, ни `this` — только числа на входе и числа на
// выходе. Это первая поверхность проекта, которую можно проверить, не поднимая
// WebGL: дугу через три точки или посадку шкафа на стену видно прямо в
// значениях.
// ---------------------------------------------------------------------------

import type { Vec2 } from '../types';
import { isSurfaceMount, modelBackZ } from '../furniture/library';

/** Шаг сетки, метры. */
export const SNAP = 0.1;

/** Притянуть число к сетке. */
export const snap = (v: number) => Math.round(v / SNAP) * SNAP;

/** Две точки — одна и та же вершина (с точностью до мм). */
export const sameVertex = (a: Vec2, b: Vec2) => Math.hypot(a[0] - b[0], a[1] - b[1]) < 1e-4;

/** Повернуть вектор вокруг начала координат на `deg` градусов. */
export const rotateVec = (x: number, z: number, deg: number): Vec2 => {
  const r = (deg * Math.PI) / 180;
  const c = Math.cos(r);
  const s = Math.sin(r);
  return [x * c - z * s, x * s + z * c];
};

/**
 * Окружность через три точки, разбитая на узлы дуги, которая идёт из A в B
 * через C. Точки на одной прямой → просто [A, B].
 *
 * Дуга режется на короткие прямые стены: так работает тот же движок прямых
 * стен, и сам целевой план рисует свои изгибы хордами.
 */
export function arcNodes(A: Vec2, B: Vec2, C: Vec2): Vec2[] {
  const [ax, az] = A, [bx, bz] = B, [cx, cz] = C;
  const d = 2 * (ax * (bz - cz) + bx * (cz - az) + cx * (az - bz));
  if (Math.abs(d) < 1e-6) return [A, B];
  const a2 = ax * ax + az * az, b2 = bx * bx + bz * bz, c2 = cx * cx + cz * cz;
  const ux = (a2 * (bz - cz) + b2 * (cz - az) + c2 * (az - bz)) / d;
  const uz = (a2 * (cx - bx) + b2 * (ax - cx) + c2 * (bx - ax)) / d;
  const r = Math.hypot(ax - ux, az - uz);
  const angA = Math.atan2(az - uz, ax - ux);
  const angB = Math.atan2(bz - uz, bx - ux);
  const angC = Math.atan2(cz - uz, cx - ux);
  const TAU = Math.PI * 2;
  const norm = (x: number) => ((x % TAU) + TAU) % TAU;
  let sweep = norm(angB - angA);
  if (norm(angC - angA) > sweep) sweep -= TAU; // берём ту сторону, где лежит C
  const N = Math.min(40, Math.max(2, Math.round((r * Math.abs(sweep)) / 0.4)));
  const nodes: Vec2[] = [];
  for (let k = 0; k <= N; k++) {
    const t = angA + sweep * (k / N);
    nodes.push([+(ux + r * Math.cos(t)).toFixed(3), +(uz + r * Math.sin(t)).toFixed(3)]);
  }
  return nodes;
}

/** Точка на стене: где, как повёрнута стена, куда смотрит нормаль (в сторону
 *  тапнувшего) и какая стена толщины. */
export interface WallMountPoint {
  x: number;
  z: number;
  rotation: number;
  nx: number;
  nz: number;
  thickness: number;
}

/**
 * Итоговое место и поворот для предмета, который вешается на стену.
 *
 * Накладные (телевизор, картина) выносятся на комнатную сторону стены и
 * поворачиваются лицом в комнату; двери, окна и шторы остаются в плоскости
 * стены. Отступ = половина толщины стены ПЛЮС то, насколько модель уходит за
 * свою точку отсчёта, — иначе глубокий шкаф пробивает стену насквозь. Ещё 5 мм
 * держат предмет чуть впереди поверхности.
 */
export function resolveWallMount(model: string, p: WallMountPoint): { x: number; z: number; rotation: number } {
  if (!isSurfaceMount(model)) return { x: p.x, z: p.z, rotation: p.rotation };
  const off = p.thickness / 2 - modelBackZ(model) + 0.005;
  return {
    x: p.x + p.nx * off,
    z: p.z + p.nz * off,
    // Поворот такой, чтобы «лицо» модели (+Z в её системе) смотрело в комнату.
    rotation: (Math.atan2(p.nx, p.nz) * 180) / Math.PI,
  };
}
