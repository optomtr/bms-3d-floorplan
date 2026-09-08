// ---------------------------------------------------------------------------
// Плоская геометрия вида сверху.
//
// Договор осей (E2-CONTRACT.md): метры, x — вправо, y — ВНИЗ, как на бумаге.
// В 3D это X и Z; пересчёт делает движок, и только в одном месте — при работе
// с FurnitureDef.position (см. model.ts).
//
// УГЛЫ здесь человеческие, а не машинные: 0° — вправо, 90° — ВВЕРХ, −90° —
// вниз. Ось y смотрит вниз, поэтому знак atan2 переворачивается ровно один раз,
// здесь. Всё остальное считает углы через эти две функции и больше нигде знак
// не трогает.
// ---------------------------------------------------------------------------

import type { FloorDef, Vec2 } from '../types';

export const dist = (a: Vec2, b: Vec2): number => Math.hypot(b[0] - a[0], b[1] - a[1]);

/** Привести градусы к (−180, 180]. */
export function normDeg(d: number): number {
  let v = d % 360;
  if (v > 180) v -= 360;
  if (v <= -180) v += 360;
  return v;
}

/** Угол отрезка a→b: 0° вправо, 90° вверх. */
export function angleDeg(a: Vec2, b: Vec2): number {
  return normDeg((-Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI);
}

/** Точка на расстоянии `len` от `o` под углом `deg` (обратна angleDeg). */
export function fromPolar(o: Vec2, len: number, deg: number): Vec2 {
  const r = (deg * Math.PI) / 180;
  return [o[0] + Math.cos(r) * len, o[1] - Math.sin(r) * len];
}

/** Площадь многоугольника (всегда положительная). */
export function polyArea(poly: Vec2[]): number {
  let s = 0;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    s += a[0] * b[1] - b[0] * a[1];
  }
  return Math.abs(s) / 2;
}

/**
 * Центр тяжести многоугольника. Не среднее по вершинам: у Г-образной комнаты
 * среднее вылезает наружу, и подпись повисает вне пола.
 */
export function polyCentroid(poly: Vec2[]): Vec2 {
  let a2 = 0;
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i];
    const q = poly[(i + 1) % poly.length];
    const f = p[0] * q[1] - q[0] * p[1];
    a2 += f;
    cx += (p[0] + q[0]) * f;
    cy += (p[1] + q[1]) * f;
  }
  if (Math.abs(a2) < 1e-9) {
    let sx = 0;
    let sy = 0;
    for (const p of poly) {
      sx += p[0];
      sy += p[1];
    }
    return [sx / (poly.length || 1), sy / (poly.length || 1)];
  }
  return [cx / (3 * a2), cy / (3 * a2)];
}

/** Точка внутри многоугольника (луч вправо, чётность пересечений). */
export function pointInPoly(p: Vec2, poly: Vec2[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0];
    const yi = poly[i][1];
    const xj = poly[j][0];
    const yj = poly[j][1];
    if (yi > p[1] !== yj > p[1] && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

export interface SegHit {
  /** Расстояние от точки до отрезка. */
  d: number;
  /** Доля вдоль отрезка (0..1). */
  t: number;
  /** Ближайшая точка на отрезке. */
  pt: Vec2;
}

export function distToSeg(p: Vec2, a: Vec2, b: Vec2): SegHit {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const l2 = dx * dx + dy * dy;
  if (l2 < 1e-12) return { d: dist(p, a), t: 0, pt: [a[0], a[1]] };
  let t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l2;
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  const pt: Vec2 = [a[0] + dx * t, a[1] + dy * t];
  return { d: dist(p, pt), t, pt };
}

/** Прямоугольник по двум углам, обход по часовой стрелке на экране. */
export function rectPoly(a: Vec2, b: Vec2): Vec2[] {
  return [
    [a[0], a[1]],
    [b[0], a[1]],
    [b[0], b[1]],
    [a[0], b[1]],
  ];
}

/**
 * Углы прямоугольного следа предмета.
 *
 * `rotationDeg` — поворот из FurnitureDef (вокруг вертикали в 3D). При 0°
 * «лицо» модели смотрит по +Z, а на плане это +y, то есть вниз листа. Поэтому
 * направление «вперёд» = (sin r, cos r), «вправо» = (cos r, −sin r).
 */
export function furnitureCorners(c: Vec2, w: number, d: number, rotationDeg: number): Vec2[] {
  const r = (rotationDeg * Math.PI) / 180;
  const fx = Math.sin(r);
  const fy = Math.cos(r);
  const rx = Math.cos(r);
  const ry = -Math.sin(r);
  const hw = w / 2;
  const hd = d / 2;
  const at = (sw: number, sd: number): Vec2 => [c[0] + rx * hw * sw + fx * hd * sd, c[1] + ry * hw * sw + fy * hd * sd];
  return [at(-1, -1), at(1, -1), at(1, 1), at(-1, 1)];
}

/** Угол поворота предмета по вектору «от центра к точке» (обратно к furnitureCorners). */
export function rotationFromVector(dx: number, dy: number): number {
  return normDeg((Math.atan2(dx, dy) * 180) / Math.PI);
}

export interface Box {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export function growBox(box: Box | null, x: number, y: number): Box {
  if (!box) return { minX: x, minY: y, maxX: x, maxY: y };
  box.minX = Math.min(box.minX, x);
  box.minY = Math.min(box.minY, y);
  box.maxX = Math.max(box.maxX, x);
  box.maxY = Math.max(box.maxY, y);
  return box;
}

/** Габарит всего, что нарисовано на этаже (null — этаж пуст). */
export function bboxOfFloor(floor: FloorDef | null | undefined): Box | null {
  if (!floor) return null;
  let box: Box | null = null;
  for (const w of floor.walls ?? []) {
    box = growBox(box, w.start[0], w.start[1]);
    box = growBox(box, w.end[0], w.end[1]);
  }
  for (const r of floor.rooms ?? []) for (const p of r.polygon ?? []) box = growBox(box, p[0], p[1]);
  for (const f of floor.furniture ?? []) box = growBox(box, f.position[0], f.position[2]);
  for (const z of floor.zones ?? []) box = growBox(box, z.x, z.z);
  return box;
}
