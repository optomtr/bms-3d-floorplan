// ---------------------------------------------------------------------------
// Проёмы: двери, окна и сквозные проходы.
//
// Три инструмента приводят сюда — палитра остекления, врезаемая в стену модель
// (гаражные ворота) и собственно инструмент проёма. Все три ищут ближайшую
// стену и режут в ней дырку, поэтому математика у них общая (snapping.ts), а
// здесь — правила: какой ширины, где именно и что делать с совпавшими стенами.
// ---------------------------------------------------------------------------

import type { FloorDef, OpeningKind, RoomDef, WallDef } from '../types';
import { isShapeRoom, roomPolygon } from '../scene/room-shapes';
import { nearestWall } from './snapping';

/** Модели из палитры мебели, которые при установке становятся настоящим
 *  проёмом в стене (а не висят на её поверхности). */
export const GLAZING_MODELS: Record<string, { kind: OpeningKind; width: number; variant: string; sill?: number; top?: number }> = {
  window_frame: { kind: 'window', width: 1.2, variant: 'single' },
  terrace_window: { kind: 'window', width: 2.4, variant: 'picture' },
  // Панорамное террасное ОКНО во всю высоту (со средниками, без двери).
  terrace_window_full: { kind: 'window', width: 2.6, variant: 'storefront', sill: 0, top: 2.55 },
  patio_door: { kind: 'door', width: 2.4, variant: 'glass', sill: 0, top: 2.2 },
  // Остекление во всю стену с дверной створкой (ширина подгоняется по стене).
  terrace_wall: { kind: 'window', width: 12, variant: 'terrace', sill: 0, top: 2.55 },
  // Двери из палитры режут настоящий проём в ближайшей стене (чтобы стоять
  // заподлицо, а не мерцать), и дальше их можно выбирать и двигать вдоль стены.
  door: { kind: 'door', width: 0.9, variant: 'single' },
  double_door: { kind: 'door', width: 1.6, variant: 'double' },
  sliding_door: { kind: 'door', width: 1.7, variant: 'sliding' },
};

/** Модели, которые монтируются В стену как дверь: установка пробивает ГОЛЫЙ
 *  проём (настоящую дыру) и сажает модель заподлицо в него; связь `attach`
 *  следит, чтобы удаление предмета закрыло дыру. */
export const WALL_CUT_MODELS: Record<string, { width: number; top: number }> = {
  garage_door: { width: 2.6, top: 2.2 },
};

/** Где именно встанет проём заданной ширины на стене длины `len`. */
function placeOn(len: number, along: number, wanted: number): { width: number; position: number } {
  const width = Math.min(wanted, Math.max(0.4, len - 0.1));
  return { width, position: Math.max(0, Math.min(len - width, along - width / 2)) };
}

/** Место под остекление на ближайшей стене, или null — стены рядом нет.
 *  Поиск отделён от врезки нарочно: снимок для отмены делается ТОЛЬКО когда
 *  врезать действительно есть куда. */
export function findGlazingSpot(
  walls: WallDef[],
  p: { x: number; z: number },
  cfg: (typeof GLAZING_MODELS)[string],
): { wallIndex: number; width: number; position: number } | null {
  const best = nearestWall(walls, p.x, p.z, 0.9);
  if (!best) return null;
  const { width, position } = placeOn(best.len, best.along, cfg.width);
  return { wallIndex: best.index, width, position };
}

/** Врезать найденное остекление. Возвращает индекс нового проёма в стене. */
export function applyGlazing(
  walls: WallDef[],
  spot: { wallIndex: number; width: number; position: number },
  cfg: (typeof GLAZING_MODELS)[string],
): number {
  const w = walls[spot.wallIndex];
  (w.openings ??= []).push({
    kind: cfg.kind,
    position: spot.position,
    width: spot.width,
    variant: cfg.variant,
    ...(cfg.sill !== undefined ? { sill: cfg.sill } : {}),
    ...(cfg.top !== undefined ? { top: cfg.top } : {}),
  });
  return w.openings!.length - 1;
}

/**
 * Прорезать ГОЛЫЙ (без створки) дверной проём под врезаемую модель и вернуть
 * её место в стене: точку на осевой линии и угол стены, чтобы модель села в
 * дыру заподлицо.
 */
export function cutForWallModel(
  walls: WallDef[],
  p: { x: number; z: number },
  cfg: { width: number; top: number },
): { wallIndex: number; openingIndex: number; x: number; z: number; rotation: number } | null {
  const best = nearestWall(walls, p.x, p.z, 1.0);
  if (!best) return null;
  const w = walls[best.index];
  const len = best.len;
  const { width, position } = placeOn(len, best.along, cfg.width);
  (w.openings ??= []).push({ kind: 'door', position, width, sill: 0, top: cfg.top, bare: true });
  const dxu = (w.end[0] - w.start[0]) / len, dzu = (w.end[1] - w.start[1]) / len;
  const centre = position + width / 2;
  return {
    wallIndex: best.index,
    openingIndex: w.openings!.length - 1,
    x: w.start[0] + dxu * centre,
    z: w.start[1] + dzu * centre,
    rotation: (-Math.atan2(w.end[1] - w.start[1], w.end[0] - w.start[0]) * 180) / Math.PI,
  };
}

type Hit =
  | { type: 'wall'; wall: WallDef; along: number; len: number }
  | { type: 'room'; room: RoomDef; edge: number; along: number; len: number };

/**
 * Поставить проём инструментом «дверь / окно / проём» на ближайший отрезок —
 * им может быть и обычная стена, и грань комнаты-фигуры.
 *
 * Проём прорезается ещё и во всех ДРУГИХ стенах и гранях, которые лежат на той
 * же линии в том же месте: там, где две комнаты делят одну стену, дверь иначе
 * остаётся заткнутой второй стеной.
 *
 * @returns false, если рядом не нашлось ни стены, ни грани.
 */
export function addOpening(floor: FloorDef, p: { x: number; z: number }, kind: OpeningKind): boolean {
  const width = kind === 'door' ? 0.9 : kind === 'opening' ? 1.4 : 1.0;
  // Простой «проём» (проход) — голая дыра с перемычкой, без створки и стекла.
  const bare = kind === 'opening';
  let bd = 0.6;
  let best: Hit | null = null;

  const consider = (
    ax: number, az: number, bx: number, bz: number,
    make: (along: number, len: number) => Hit,
  ) => {
    const dx = bx - ax, dz = bz - az;
    const len2 = dx * dx + dz * dz;
    if (len2 < 1e-6) return;
    let t = ((p.x - ax) * dx + (p.z - az) * dz) / len2;
    t = Math.max(0, Math.min(1, t));
    const cx = ax + dx * t, cz = az + dz * t;
    const d = Math.hypot(p.x - cx, p.z - cz);
    if (d < bd) {
      bd = d;
      const len = Math.sqrt(len2);
      best = make(t * len, len);
    }
  };

  for (const w of floor.walls ?? []) {
    consider(w.start[0], w.start[1], w.end[0], w.end[1], (along, len) => ({
      type: 'wall', wall: w, along, len,
    }));
  }
  for (const room of floor.rooms ?? []) {
    if (!isShapeRoom(room)) continue;
    const poly = roomPolygon(room);
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i];
      const b = poly[(i + 1) % poly.length];
      const edge = i;
      consider(a[0], a[1], b[0], b[1], (along, len) => ({
        type: 'room', room, edge, along, len,
      }));
    }
  }

  if (!best) return false;
  const hit = best as Hit;
  const position = Math.max(0, Math.min(hit.len - width, hit.along - width / 2));
  const center = position + width / 2;
  let seg: [number, number, number, number];
  if (hit.type === 'wall') {
    if (!hit.wall.openings) hit.wall.openings = [];
    hit.wall.openings.push({ kind, position, width, ...(bare ? { bare } : {}) });
    seg = [hit.wall.start[0], hit.wall.start[1], hit.wall.end[0], hit.wall.end[1]];
  } else {
    if (!hit.room.openings) hit.room.openings = [];
    hit.room.openings.push({ kind, edge: hit.edge, position, width, ...(bare ? { bare } : {}) });
    const poly = roomPolygon(hit.room);
    const a = poly[hit.edge];
    const b = poly[(hit.edge + 1) % poly.length];
    seg = [a[0], a[1], b[0], b[1]];
  }
  // Проём рисует сам строитель (простая створка / рама со стеклом) — отдельной
  // модели нет, поэтому мерцать нечему.
  const [ax, az, bx, bz] = seg;
  const len = Math.hypot(bx - ax, bz - az) || 1;
  const wx = ax + ((bx - ax) / len) * center;
  const wz = az + ((bz - az) / len) * center;
  const ang0 = Math.atan2(bz - az, bx - ax);
  /** Позиция такого же проёма на совпавшем отрезке, или null. */
  const cutSeg = (ax2: number, az2: number, bx2: number, bz2: number): number | null => {
    const dx = bx2 - ax2, dz = bz2 - az2;
    const l2 = dx * dx + dz * dz;
    if (l2 < 1e-6) return null;
    const a2 = Math.atan2(dz, dx);
    // на одной прямой = параллельно или антипараллельно
    const da = Math.abs((a2 - ang0 + Math.PI) % Math.PI);
    if (da > 0.03 && Math.abs(da - Math.PI) > 0.03) return null;
    const l = Math.sqrt(l2);
    const t = ((wx - ax2) * dx + (wz - az2) * dz) / l2;
    const cx = ax2 + dx * t, cz = az2 + dz * t;
    if (Math.hypot(wx - cx, wz - cz) > 0.12) return null; // не на этой линии
    const along = t * l;
    if (along < 0 || along > l) return null;
    return Math.max(0, Math.min(l - width, along - width / 2));
  };
  for (const w of floor.walls ?? []) {
    if (hit.type === 'wall' && w === hit.wall) continue;
    const pos = cutSeg(w.start[0], w.start[1], w.end[0], w.end[1]);
    if (pos != null) (w.openings ??= []).push({ kind, position: pos, width, ...(bare ? { bare } : {}) });
  }
  for (const room of floor.rooms ?? []) {
    if (!isShapeRoom(room)) continue;
    const poly = roomPolygon(room);
    for (let e = 0; e < poly.length; e++) {
      if (hit.type === 'room' && room === hit.room && e === hit.edge) continue;
      const a = poly[e], b = poly[(e + 1) % poly.length];
      const pos = cutSeg(a[0], a[1], b[0], b[1]);
      if (pos != null) (room.openings ??= []).push({ kind, edge: e, position: pos, width, ...(bare ? { bare } : {}) });
    }
  }
  return true;
}
