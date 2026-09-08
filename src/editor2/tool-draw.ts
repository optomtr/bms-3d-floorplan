// ---------------------------------------------------------------------------
// Инструменты черчения: стена, комната, зона, проём, мебель, линейка.
//
// Главное отличие от старого редактора — не в коде, а в том, что здесь можно
// НАБРАТЬ размер. Любое незавершённое действие держит рядом с курсором свои
// поля (длина/угол, ширина/глубина, ширина/отступ), и Enter доводит его до
// точного числа. Мышью то же самое доступно тягой, но точность больше не
// зависит от того, насколько ровно человек попал пальцем.
// ---------------------------------------------------------------------------

import type { Vec2 } from '../types';
import { angleDeg, dist, fromPolar, polyCentroid, rectPoly } from './geom';
import { modelName } from './furniture-meta';
import type { ToolHost } from './host';
import type { FieldSpec, ModeSpec } from './hud';
import { fmtNum } from './num';
import {
  addChain,
  addFurniture,
  addOpening,
  addRoom,
  addWall,
  addZone,
  faceUnder,
  findWall,
  mergeWalls,
  wallLength,
} from './model';
import { nearestWallProbe } from './hit';
import { isLight, isWallMount, resolveSpot } from './place';

const KIND_RU = { door: 'Дверь', window: 'Окно', opening: 'Проём' } as const;

const isOpeningTool = (t: string): t is 'door' | 'window' | 'opening' =>
  t === 'door' || t === 'window' || t === 'opening';

const areaMode = (h: ToolHost) => (h.tool === 'zone' ? h.zoneMode : h.roomMode);

/** Насколько близко к первой точке надо подойти, чтобы контур замкнулся. */
const closeTol = (h: ToolHost) => Math.max(h.pickTol(), 0.15);

// --- наведение ------------------------------------------------------------

export function drawHover(h: ToolHost, p: Vec2): void {
  const d = h.draft;
  const floor = h.floor();
  if (h.tool === 'wall' || h.tool === 'measure') {
    const s = h.snapWorld(p, d.pts);
    d.mode = 'chain';
    d.cursor = s.pt;
    d.joined = s.joined;
    return;
  }
  if (h.tool === 'room' || h.tool === 'zone') {
    const mode = areaMode(h);
    if (mode === 'fill') {
      d.mode = 'none';
      d.cursor = p;
      d.joined = false;
      return;
    }
    const s = h.snapWorld(p, mode === 'poly' ? d.pts : []);
    d.mode = mode === 'poly' ? 'poly' : 'rect';
    d.cursor = s.pt;
    d.joined = s.joined;
    return;
  }
  if (isOpeningTool(h.tool)) {
    d.mode = 'opening';
    d.kind = h.tool;
    d.cursor = p;
    const probe = floor ? nearestWallProbe(floor, p, Math.max(0.9, h.pickTol() * 3)) : null;
    d.wallId = probe?.id ?? null;
    d.along = probe?.along ?? 0;
    return;
  }
  if (h.tool === 'furniture') {
    const s = h.snapWorld(p, []);
    d.mode = 'furniture';
    d.cursor = s.pt;
    d.joined = s.joined;
    d.model = h.pendingModel;
    return;
  }
  d.mode = 'none';
  d.cursor = p;
}

// --- касание --------------------------------------------------------------

export function drawTap(h: ToolHost, p: Vec2): void {
  const floor = h.floor();
  if (!floor) return;
  const d = h.draft;

  if (h.tool === 'measure') {
    // Линейка ничего не меняет в плане: первое касание — начало, второе — сброс.
    d.pts = d.pts.length ? [] : [h.snapWorld(p, []).pt];
    d.mode = 'chain';
    return;
  }

  if (h.tool === 'wall') {
    const s = h.snapWorld(p, d.pts);
    if (!d.pts.length) {
      d.pts = [s.pt];
      return;
    }
    const last = d.pts[d.pts.length - 1];
    const closing = d.pts.length >= 2 && dist(s.pt, d.pts[0]) < closeTol(h);
    const target: Vec2 = closing ? d.pts[0] : s.pt;
    if (dist(target, last) < 0.02) return;
    h.edit(() => {
      addWall(floor, last, target);
      mergeWalls(floor);
    });
    if (closing) {
      const ring = d.pts.slice();
      d.pts = [];
      h.askRoom(ring);
    } else {
      d.pts = [...d.pts, target];
    }
    return;
  }

  if (h.tool === 'room' || h.tool === 'zone') {
    const mode = areaMode(h);
    if (mode === 'fill') {
      const face = faceUnder(floor, p);
      if (!face) {
        h.setStatus('Здесь нет замкнутого контура стен — обведите комнату стенами или начертите её рамкой.');
        return;
      }
      commitArea(h, face, false);
      return;
    }
    const s = h.snapWorld(p, mode === 'poly' ? d.pts : []);
    if (mode === 'rect') {
      if (!d.a) {
        d.a = s.pt;
        return;
      }
      commitArea(h, rectPoly(d.a, s.pt), true);
      d.a = null;
      return;
    }
    // многоугольник
    if (d.pts.length >= 3 && dist(s.pt, d.pts[0]) < closeTol(h)) {
      const ring = d.pts.slice();
      d.pts = [];
      commitArea(h, ring, true);
      return;
    }
    d.pts = [...d.pts, s.pt];
    return;
  }

  if (isOpeningTool(h.tool)) {
    if (!d.wallId) {
      h.setStatus(`${KIND_RU[h.tool]} ставится НА стену. Подведите указатель к стене.`);
      return;
    }
    const wallId = d.wallId;
    const along = d.along;
    const width = d.width;
    h.edit(() => {
      const o = addOpening(floor, wallId, h.tool as 'door' | 'window' | 'opening', along, width);
      if (o?.id) h.select({ kind: 'opening', id: o.id });
    });
    return;
  }

  if (h.tool === 'furniture') {
    if (!h.pendingModel) {
      h.setStatus('Выберите модель в палитре — потом коснитесь плана, чтобы поставить её.');
      return;
    }
    const model = h.pendingModel;
    const s = h.snapWorld(p, []);
    // Настенное посреди комнаты — это бра, висящее в воздухе. Лучше сказать
    // человеку, куда целиться, чем молча поставить не туда.
    const spot = resolveSpot(floor, model, s.pt[0], s.pt[1], d.rotation, h.wallHeight());
    if (spot.wallMount && !spot.onWall) {
      h.setStatus(`${modelName(model)} вешается НА стену, а рядом стены нет. Поднесите указатель ближе к стене.`);
      return;
    }
    let placed = '';
    h.edit(() => {
      const f = addFurniture(floor, model, s.pt[0], s.pt[1], d.rotation, h.wallHeight());
      if (f.id) {
        placed = f.id;
        h.select({ kind: 'furniture', id: f.id });
      }
    });
    if (!placed) return;
    if (isLight(model)) {
      // Смысл светильника в плане — управлять им. Привязку предлагаем сразу,
      // а не оставляем на «потом», из которого никто не возвращается.
      h.setStatus(`${modelName(model)} поставлен. Выберите устройство Home Assistant — без него это просто украшение.`);
      h.requestBinding(placed, model);
    }
  }
}

/** Прямоугольник комнаты тянется мышью: старт и конец — те же две точки. */
export function drawDragStart(h: ToolHost, p: Vec2): boolean {
  if ((h.tool !== 'room' && h.tool !== 'zone') || areaMode(h) !== 'rect') return false;
  h.draft.a = h.snapWorld(p, []).pt;
  h.draft.mode = 'rect';
  return true;
}

export function drawDragEnd(h: ToolHost, p: Vec2): boolean {
  if ((h.tool !== 'room' && h.tool !== 'zone') || areaMode(h) !== 'rect' || !h.draft.a) return false;
  const a = h.draft.a;
  const b = h.snapWorld(p, []).pt;
  h.draft.a = null;
  if (Math.abs(b[0] - a[0]) < 0.05 || Math.abs(b[1] - a[1]) < 0.05) return true;
  commitArea(h, rectPoly(a, b), true);
  return true;
}

/** Область → комната (с периметром стен) или зона (значок в центре тяжести). */
export function commitArea(h: ToolHost, poly: Vec2[], withWalls: boolean): void {
  const floor = h.floor();
  if (!floor || poly.length < 3) return;
  if (h.tool === 'zone') {
    const c = polyCentroid(poly);
    h.edit(() => {
      const z = addZone(floor, c[0], c[1]);
      h.select({ kind: 'zone', id: z.id });
    });
    return;
  }
  h.edit(() => {
    if (withWalls) {
      addChain(floor, poly, true);
      mergeWalls(floor);
    }
    const r = addRoom(floor, poly);
    if (r?.id) h.select({ kind: 'room', id: r.id });
  });
}

// --- набранные числа ------------------------------------------------------

export function drawCommitFields(h: ToolHost, v: Record<string, number>): void {
  const floor = h.floor();
  if (!floor) return;
  const d = h.draft;

  if (h.tool === 'wall' && d.pts.length) {
    const len = v.len;
    const ang = Number.isFinite(v.ang) ? v.ang : d.cursor ? angleDeg(d.pts[d.pts.length - 1], d.cursor) : 0;
    if (!Number.isFinite(len) || len <= 0) return;
    const last = d.pts[d.pts.length - 1];
    const pt = fromPolar(last, len, ang);
    h.edit(() => {
      addWall(floor, last, pt);
      mergeWalls(floor);
    });
    d.pts = [...d.pts, pt];
    d.cursor = pt;
    return;
  }

  if ((h.tool === 'room' || h.tool === 'zone') && areaMode(h) === 'rect' && d.a) {
    const w = Math.abs(v.w);
    const dep = Math.abs(v.d);
    if (!(w > 0) || !(dep > 0)) return;
    // Направление берём то, в которое человек уже потянул, — набранное число
    // уточняет размер, а не переносит комнату на другую сторону от угла.
    const sx = d.cursor && d.cursor[0] < d.a[0] ? -1 : 1;
    const sy = d.cursor && d.cursor[1] < d.a[1] ? -1 : 1;
    const b: Vec2 = [d.a[0] + sx * w, d.a[1] + sy * dep];
    const a = d.a;
    d.a = null;
    commitArea(h, rectPoly(a, b), true);
    return;
  }

  if (isOpeningTool(h.tool) && d.wallId) {
    const wall = findWall(floor, d.wallId);
    if (!wall) return;
    const width = Number.isFinite(v.w) && v.w > 0 ? v.w : d.width;
    const off = Number.isFinite(v.off) ? v.off : Math.max(0, d.along - width / 2);
    d.width = width;
    const wallId = d.wallId;
    h.edit(() => {
      const o = addOpening(floor, wallId, h.tool as 'door' | 'window' | 'opening', off + width / 2, width);
      if (o?.id) h.select({ kind: 'opening', id: o.id });
    });
    return;
  }

  if (h.tool === 'furniture' && Number.isFinite(v.ang)) {
    d.rotation = v.ang;
    h.refresh();
  }
}

// --- поля, подсказки и подрежимы -----------------------------------------

export function drawFields(h: ToolHost): FieldSpec[] | null {
  const d = h.draft;
  if (h.tool === 'wall' && d.pts.length) {
    const last = d.pts[d.pts.length - 1];
    const c = d.cursor ?? last;
    return [
      { key: 'len', label: 'Длина, м', value: dist(last, c) },
      { key: 'ang', label: 'Угол, °', value: angleDeg(last, c), digits: 0 },
    ];
  }
  if ((h.tool === 'room' || h.tool === 'zone') && areaMode(h) === 'rect' && d.a) {
    const c = d.cursor ?? d.a;
    return [
      { key: 'w', label: 'Ширина, м', value: Math.abs(c[0] - d.a[0]) },
      { key: 'd', label: 'Глубина, м', value: Math.abs(c[1] - d.a[1]) },
    ];
  }
  if (isOpeningTool(h.tool) && d.wallId) {
    const floor = h.floor();
    const wall = floor ? findWall(floor, d.wallId) : null;
    const len = wall ? wallLength(wall) : 0;
    const start = Math.max(0, Math.min(len - d.width, d.along - d.width / 2));
    return [
      { key: 'w', label: 'Ширина, м', value: d.width },
      { key: 'off', label: 'От угла, м', value: start },
    ];
  }
  if (h.tool === 'furniture' && h.pendingModel) {
    return [{ key: 'ang', label: 'Поворот, °', value: d.rotation, digits: 0 }];
  }
  return null;
}

export function drawModes(h: ToolHost): ModeSpec[] {
  const d = h.draft;
  if (h.tool === 'wall') {
    return d.pts.length ? [{ id: 'finish', label: 'Завершить' }, { id: 'cancel', label: 'Отмена' }] : [];
  }
  if (h.tool === 'room' || h.tool === 'zone') {
    const mode = areaMode(h);
    const list: ModeSpec[] = [
      { id: 'mode:rect', label: 'Прямоугольник', active: mode === 'rect' },
      { id: 'mode:poly', label: 'По точкам', active: mode === 'poly' },
    ];
    if (h.tool === 'room') list.push({ id: 'mode:fill', label: 'Залить контур', active: mode === 'fill' });
    if (d.pts.length >= 3) list.push({ id: 'finish', label: 'Готово' });
    if (d.pts.length || d.a) list.push({ id: 'cancel', label: 'Отмена' });
    return list;
  }
  return [];
}

export function drawStatus(h: ToolHost): string {
  const d = h.draft;
  switch (h.tool) {
    case 'wall':
      if (!d.pts.length) return 'Стена: коснитесь плана, чтобы поставить первую точку.';
      if (d.pts.length >= 2 && d.cursor && dist(d.cursor, d.pts[0]) < closeTol(h))
        return 'Здесь контур замкнётся — и можно будет сразу сделать комнату.';
      return `Стена: ${fmtNum(d.cursor ? dist(d.pts[d.pts.length - 1], d.cursor) : 0, 2)} м. Наберите длину и угол — Enter поставит точно.`;
    case 'room':
    case 'zone': {
      const what = h.tool === 'zone' ? 'Зона' : 'Комната';
      const mode = areaMode(h);
      if (mode === 'fill') return 'Коснитесь внутри замкнутого контура стен — он станет комнатой.';
      if (mode === 'poly')
        return d.pts.length
          ? `${what}: ставьте точки по контуру, замкните на первой или нажмите «Готово».`
          : `${what}: коснитесь первой точки контура.`;
      return d.a
        ? `${what}: второй угол. Ширину и глубину можно набрать — Enter зафиксирует.`
        : `${what}: коснитесь первого угла или растяните рамку.`;
    }
    case 'door':
    case 'window':
    case 'opening':
      return d.wallId
        ? `${KIND_RU[h.tool]}: ведите вдоль стены, касание — поставить. Ширину и отступ от угла можно набрать.`
        : `${KIND_RU[h.tool]} ставится НА стену — подведите указатель к стене.`;
    case 'furniture':
      if (!h.pendingModel) return 'Выберите модель в палитре, затем коснитесь плана.';
      if (isWallMount(h.pendingModel))
        return `${modelName(h.pendingModel)}: вешается на стену — коснитесь рядом со стеной, он сам прижмётся и повернётся лицом в комнату.`;
      return `${modelName(h.pendingModel)}: коснитесь плана. Поворот — ручкой на предмете, шаг 15°.`;
    case 'measure':
      return d.pts.length && d.cursor
        ? `Линейка: ${fmtNum(dist(d.pts[0], d.cursor), 2)} м, ${fmtNum(angleDeg(d.pts[0], d.cursor), 0)}°.`
        : 'Линейка: коснитесь начальной точки.';
    default:
      return '';
  }
}

/** Сбросить незавершённое черчение (кнопка «Отмена», смена инструмента). */
export function drawCancel(h: ToolHost): void {
  h.draft.pts = [];
  h.draft.a = null;
  h.draft.pendingRing = null;
  h.askRoom(null);
}

/**
 * «Готово». Многоугольник замыкается в комнату или зону; цепочка стен просто
 * заканчивается — стены уже стоят в плане, они появлялись по ходу черчения.
 */
export function drawFinish(h: ToolHost): void {
  const d = h.draft;
  if ((h.tool === 'room' || h.tool === 'zone') && d.pts.length >= 3) {
    const ring = d.pts.slice();
    d.pts = [];
    commitArea(h, ring, true);
  }
  d.pts = [];
  d.a = null;
  h.refresh();
}

/** Ответ на «контур замкнут — сделать комнату?». */
export function drawAnswerRoom(h: ToolHost, yes: boolean): void {
  const ring = h.draft.pendingRing;
  h.draft.pendingRing = null;
  const floor = h.floor();
  if (yes && ring && floor) {
    h.edit(() => {
      const r = addRoom(floor, ring);
      if (r?.id) h.select({ kind: 'room', id: r.id });
    });
  }
  h.refresh();
}
