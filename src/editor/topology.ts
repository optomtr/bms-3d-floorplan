// ---------------------------------------------------------------------------
// Топология стен: что из нарисованного вообще образует комнату, и какие стены
// на самом деле одна стена.
//
// Обе задачи чисто расчётные (стены на входе — стены/грани на выходе), поэтому
// живут отдельно от контроллера: их можно прогнать на любом наборе координат,
// не поднимая сцену.
// ---------------------------------------------------------------------------

import type { Vec2, WallDef } from '../types';

/** Знаковая площадь многоугольника. Знак важен: при обходе граней внутренние
 *  получаются положительными, а внешняя граница — отрицательной. */
export function signedArea(poly: Vec2[]): number {
  let s = 0;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    s += a[0] * b[1] - b[0] * a[1];
  }
  return s / 2;
}

/** Среднее по вершинам — грубый центр, которого хватает для сравнения граней. */
export function centroid(poly: Vec2[]): Vec2 {
  let cx = 0, cz = 0;
  for (const p of poly) {
    cx += p[0];
    cz += p[1];
  }
  return [cx / poly.length, cz / poly.length];
}

/**
 * Замкнутые области (грани), которые образуют стены этажа.
 *
 * Близкие концы свариваются в один узел, поэтому нарисованные от руки углы с
 * маленькими щелями всё равно закрываются в комнату. Дальше обычный обход
 * полурёбер «всегда самый правый поворот»: каждое ребро проходится в обе
 * стороны, и каждый проход даёт одну грань.
 *
 * Возвращает ВСЕ грани, включая внешнюю границу — отбор по знаку площади
 * оставлен вызывающему (см. signedArea).
 */
export function closedFaces(walls: WallDef[], weld = 0.2): Vec2[][] {
  const pts: Vec2[] = [];
  const adj = new Map<number, Set<number>>();
  const nodeId = (p: Vec2): number => {
    for (let i = 0; i < pts.length; i++) {
      if (Math.hypot(pts[i][0] - p[0], pts[i][1] - p[1]) <= weld) return i;
    }
    pts.push([p[0], p[1]]);
    adj.set(pts.length - 1, new Set());
    return pts.length - 1;
  };
  const edges: Array<[number, number]> = [];
  for (const w of walls) {
    const a = nodeId(w.start as Vec2);
    const b = nodeId(w.end as Vec2);
    if (a !== b) {
      adj.get(a)!.add(b);
      adj.get(b)!.add(a);
      edges.push([a, b]);
    }
  }
  const ang = (from: number, to: number): number =>
    Math.atan2(pts[to][1] - pts[from][1], pts[to][0] - pts[from][0]);
  const TAU = Math.PI * 2;
  const used = new Set<string>();
  const he = (u: number, v: number) => `${u}|${v}`;
  const faces: Vec2[][] = [];
  for (const [a, b] of edges) {
    for (const [u0, v0] of [[a, b], [b, a]] as const) {
      if (used.has(he(u0, v0))) continue;
      const facePts: number[] = [];
      let u = u0;
      let v = v0;
      let guard = 0;
      do {
        used.add(he(u, v));
        facePts.push(u);
        const back = ang(v, u);
        let bestW: number | null = null;
        let bestTurn = Infinity;
        for (const w2 of adj.get(v)!) {
          let turn = back - ang(v, w2);
          turn = ((turn % TAU) + TAU) % TAU; // (0, 2π]
          if (turn < 1e-9) turn = TAU; // разворот назад — крайний случай
          if (turn < bestTurn) {
            bestTurn = turn;
            bestW = w2;
          }
        }
        if (bestW === null) break;
        u = v;
        v = bestW;
        guard++;
      } while (!(u === u0 && v === v0) && guard < 100000);
      if (facePts.length >= 3) faces.push(facePts.map((i) => pts[i]));
    }
  }
  return faces;
}

/**
 * Слить дубли и перекрывающиеся стены на одной прямой в один отрезок.
 *
 * Совпавшие стены мешают: проём, поставленный там, где две комнаты делят одну
 * стену, остаётся заткнут второй стеной. Проёмы переносятся на слитую стену
 * через мировые координаты, поэтому двери и окна не разъезжаются.
 */
export function mergeCollinearWalls(walls: WallDef[]): WallDef[] {
  const EPS = 0.08;
  // Каждую стену описываем на её бесконечной прямой.
  type Item = { w: WallDef; ang: number; perp: number; t0: number; t1: number };
  const items: Item[] = walls.map((w) => {
    const dx = w.end[0] - w.start[0];
    const dz = w.end[1] - w.start[1];
    let ang = Math.atan2(dz, dx);
    if (ang < 0) ang += Math.PI; // приводим к [0, π)
    const ux = Math.cos(ang), uz = Math.sin(ang);
    const t0 = w.start[0] * ux + w.start[1] * uz;
    const t1 = w.end[0] * ux + w.end[1] * uz;
    const perp = w.start[0] * -uz + w.start[1] * ux; // знаковое расстояние от начала координат
    return { w, ang, perp, t0: Math.min(t0, t1), t1: Math.max(t0, t1) };
  });
  const used = new Array(items.length).fill(false);
  const out: WallDef[] = [];
  for (let i = 0; i < items.length; i++) {
    if (used[i]) continue;
    const group = [items[i]];
    used[i] = true;
    for (let j = i + 1; j < items.length; j++) {
      if (used[j]) continue;
      const a = items[i], b = items[j];
      const sameLine = Math.abs(a.ang - b.ang) < 0.03 && Math.abs(a.perp - b.perp) < EPS;
      if (!sameLine) continue;
      // перекрытие (или касание) с любой стеной, уже попавшей в группу
      const overlaps = group.some((g) => b.t1 >= g.t0 - EPS && b.t0 <= g.t1 + EPS);
      if (overlaps) {
        group.push(b);
        used[j] = true;
      }
    }
    if (group.length === 1) {
      out.push(group[0].w);
      continue;
    }
    // Группа превращается в один отрезок [min t0, max t1] на своей прямой.
    const ang = group[0].ang;
    const ux = Math.cos(ang), uz = Math.sin(ang);
    const tmin = Math.min(...group.map((g) => g.t0));
    const tmax = Math.max(...group.map((g) => g.t1));
    const perp = group[0].perp;
    // Точка на прямой: начало координат + perp по нормали, затем сдвиг по u.
    const nx = -uz, nz = ux;
    const px = perp * nx, pz = perp * nz;
    const ms: Vec2 = [px + ux * tmin, pz + uz * tmin];
    const me: Vec2 = [px + ux * tmax, pz + uz * tmax];
    const merged: WallDef = {
      start: ms,
      end: me,
      height: group[0].w.height,
      thickness: group[0].w.thickness,
      color: group[0].w.color,
      material: group[0].w.material,
      openings: [],
    };
    for (const g of group) {
      for (const op of g.w.openings ?? []) {
        // мировое начало проёма на своей стене → параметр на слитой прямой
        const wdx = g.w.end[0] - g.w.start[0];
        const wdz = g.w.end[1] - g.w.start[1];
        const wlen = Math.hypot(wdx, wdz) || 1;
        const owx = g.w.start[0] + (wdx / wlen) * op.position;
        const owz = g.w.start[1] + (wdz / wlen) * op.position;
        const pos = (owx - ms[0]) * ux + (owz - ms[1]) * uz;
        merged.openings!.push({ ...op, position: Math.max(0, pos) });
      }
    }
    if (!merged.openings!.length) delete merged.openings;
    out.push(merged);
  }
  return out;
}
