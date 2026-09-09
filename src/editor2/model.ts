// ---------------------------------------------------------------------------
// Правки плана. Ни DOM, ни камеры — только данные.
//
// Формат плана не меняется (E2-CONTRACT.md): пишем ровно те WallDef / RoomDef /
// OpeningDef / FurnitureDef / ZoneDef, которые уже лежат у клиентов. Всё, что
// умеет старый редактор считать (слияние стен, замкнутые контуры, стабильные
// id), берётся импортом, а не переписывается заново.
// ---------------------------------------------------------------------------

import type {
  BindingDef,
  FloorDef,
  FloorPlan,
  FurnitureDef,
  OpeningDef,
  OpeningKind,
  RoomDef,
  Vec2,
  WallDef,
  ZoneDef,
} from '../types';
import { newOpeningId, newRoomId, newWallId, syncAttachments } from '../editor/ids';
import { closedFaces, mergeCollinearWalls } from '../editor/topology';
import { dist, pointInPoly, polyArea } from './geom';
import { isWallMount, resolveSpot } from './place';

export const DEFAULT_THICKNESS = 0.12;
export const DEFAULT_HEIGHT = 2.6;
/** Совпадение вершин: 5 мм. Всё, что ближе, — один и тот же угол дома. */
export const VERTEX_EPS = 0.005;

/** Заводские размеры проёмов: то, что человек ставит, не набирая ничего. */
export const OPENING_PRESETS: Record<OpeningKind, { width: number; sill: number; top: number; variant?: string }> = {
  door: { width: 0.9, sill: 0, top: 2.05, variant: 'single' },
  window: { width: 1.2, sill: 0.9, top: 2.1, variant: 'single' },
  opening: { width: 1.0, sill: 0, top: 2.05 },
};

/** Все этажи плана по порядку: сначала обычные, потом внутри зданий. */
export function floorList(plan: FloorPlan | null | undefined): FloorDef[] {
  const out: FloorDef[] = [];
  const seen = new Set<FloorDef>();
  const add = (list?: FloorDef[]) => {
    for (const f of list ?? []) if (f && !seen.has(f)) (seen.add(f), out.push(f));
  };
  add(plan?.floors);
  for (const b of plan?.buildings ?? []) add(b?.floors);
  return out;
}

export function floorAt(plan: FloorPlan | null | undefined, index: number): FloorDef | null {
  const list = floorList(plan);
  if (!list.length) return null;
  return list[Math.max(0, Math.min(list.length - 1, index))] ?? null;
}

const same = (a: Vec2, b: Vec2): boolean => Math.abs(a[0] - b[0]) <= VERTEX_EPS && Math.abs(a[1] - b[1]) <= VERTEX_EPS;

export function wallLength(w: WallDef): number {
  return dist(w.start as Vec2, w.end as Vec2);
}

/** Единичный вектор вдоль стены (нулевая стена — вправо). */
export function wallDir(w: WallDef): Vec2 {
  const len = wallLength(w);
  if (len < 1e-9) return [1, 0];
  return [(w.end[0] - w.start[0]) / len, (w.end[1] - w.start[1]) / len];
}

/** Начало и конец проёма в координатах плана. */
export function openingSpan(w: WallDef, o: OpeningDef): [Vec2, Vec2] {
  const d = wallDir(w);
  const a: Vec2 = [w.start[0] + d[0] * o.position, w.start[1] + d[1] * o.position];
  const b: Vec2 = [a[0] + d[0] * o.width, a[1] + d[1] * o.width];
  return [a, b];
}

export function findWall(floor: FloorDef, id: string): WallDef | null {
  return (floor.walls ?? []).find((w) => w.id === id) ?? null;
}

export interface OpeningHit {
  wall: WallDef;
  opening: OpeningDef;
}

export function findOpening(floor: FloorDef, id: string): OpeningHit | null {
  for (const w of floor.walls ?? []) {
    for (const o of w.openings ?? []) if (o.id === id) return { wall: w, opening: o };
  }
  return null;
}

export const findRoom = (floor: FloorDef, id: string): RoomDef | null =>
  (floor.rooms ?? []).find((r) => r.id === id) ?? null;
export const findFurniture = (floor: FloorDef, id: string): FurnitureDef | null =>
  (floor.furniture ?? []).find((f) => f.id === id) ?? null;
export const findZone = (floor: FloorDef, id: string): ZoneDef | null =>
  (floor.zones ?? []).find((z) => z.id === id) ?? null;

// --- стены ----------------------------------------------------------------

/** Одна стена от точки к точке. Нулевые отрезки не заводим — из них потом
 *  получаются грани нулевой площади и «комнаты» на 0 м². */
export function addWall(floor: FloorDef, a: Vec2, b: Vec2, thickness = DEFAULT_THICKNESS): WallDef | null {
  if (dist(a, b) < 0.02) return null;
  const w: WallDef = { id: newWallId(), start: [a[0], a[1]], end: [b[0], b[1]], thickness };
  (floor.walls ??= []).push(w);
  return w;
}

/** Цепочка точек в стены. `closed` дорисовывает замыкающий отрезок. */
export function addChain(floor: FloorDef, pts: Vec2[], closed: boolean, thickness = DEFAULT_THICKNESS): WallDef[] {
  const made: WallDef[] = [];
  for (let i = 1; i < pts.length; i++) {
    const w = addWall(floor, pts[i - 1], pts[i], thickness);
    if (w) made.push(w);
  }
  if (closed && pts.length > 2) {
    const w = addWall(floor, pts[pts.length - 1], pts[0], thickness);
    if (w) made.push(w);
  }
  return made;
}

/**
 * Слить совпавшие и лежащие на одной прямой стены.
 *
 * Нужно ровно там, где две комнаты делят одну перегородку: без слияния проём,
 * прорезанный в одной из двух наложенных стен, остаётся заткнут второй. Проёмы
 * и их id слияние переносит само, поэтому после него достаточно поправить
 * зеркала привязок.
 */
export function mergeWalls(floor: FloorDef): void {
  if (!floor.walls?.length) return;
  floor.walls = mergeCollinearWalls(floor.walls).walls;
  syncAttachments(floor);
}

/**
 * Сдвинуть узел: ВСЕ концы стен и ВСЕ вершины комнат, стоящие в этой точке.
 *
 * Иначе тяга за угол разрывала дом: одна стена уходила, три соседние
 * оставались, и на месте угла появлялась щель, которую потом никто не находил.
 */
export function moveVertex(floor: FloorDef, from: Vec2, to: Vec2): void {
  for (const w of floor.walls ?? []) {
    if (same(w.start as Vec2, from)) w.start = [to[0], to[1]];
    if (same(w.end as Vec2, from)) w.end = [to[0], to[1]];
  }
  for (const r of floor.rooms ?? []) {
    r.polygon = (r.polygon ?? []).map((p) => (same(p, from) ? ([to[0], to[1]] as Vec2) : p));
  }
}

/** Двигать стену целиком: оба её конца, вместе с тем, что к ним примыкает. */
export function moveWall(floor: FloorDef, wallId: string, dx: number, dy: number): void {
  const w = findWall(floor, wallId);
  if (!w) return;
  const s: Vec2 = [w.start[0], w.start[1]];
  const e: Vec2 = [w.end[0], w.end[1]];
  const bump = (p: Vec2): Vec2 => (same(p, s) || same(p, e) ? [p[0] + dx, p[1] + dy] : p);
  for (const x of floor.walls ?? []) {
    x.start = bump(x.start as Vec2);
    x.end = bump(x.end as Vec2);
  }
  for (const r of floor.rooms ?? []) r.polygon = (r.polygon ?? []).map(bump);
}

// --- комнаты --------------------------------------------------------------

export function addRoom(floor: FloorDef, polygon: Vec2[], name?: string): RoomDef | null {
  if (polygon.length < 3 || polyArea(polygon) < 0.01) return null;
  const rooms = (floor.rooms ??= []);
  const room: RoomDef = {
    id: newRoomId(),
    name: name ?? `Комната ${rooms.length + 1}`,
    polygon: polygon.map((p) => [p[0], p[1]] as Vec2),
  };
  rooms.push(room);
  return room;
}

/**
 * Замкнутая область стен под точкой — вход для инструмента «залить».
 *
 * Из всех граней, накрывающих точку, берём САМУЮ МАЛЕНЬКУЮ: внешний обвод дома
 * тоже накрывает любую точку внутри, и без этого «залить» всегда выдавало бы
 * одну комнату размером со всю квартиру.
 */
export function faceUnder(floor: FloorDef, p: Vec2): Vec2[] | null {
  const faces = closedFaces(floor.walls ?? []);
  let best: Vec2[] | null = null;
  let bestArea = Infinity;
  for (const f of faces) {
    if (f.length < 3) continue;
    const a = polyArea(f);
    if (a < 0.05 || a >= bestArea) continue;
    if (!pointInPoly(p, f)) continue;
    best = f;
    bestArea = a;
  }
  return best;
}

// --- проёмы ---------------------------------------------------------------

/** Куда встанет проём заданной ширины, если человек метит в `along` метров от
 *  начала стены: середина проёма под курсором, но целиком внутри стены. */
export function placeOpening(len: number, along: number, wanted: number): { width: number; position: number } {
  const width = Math.min(wanted, Math.max(0.2, len - 0.05));
  return { width, position: Math.max(0, Math.min(len - width, along - width / 2)) };
}

export function addOpening(floor: FloorDef, wallId: string, kind: OpeningKind, along: number, wanted: number): OpeningDef | null {
  const w = findWall(floor, wallId);
  if (!w) return null;
  const len = wallLength(w);
  if (len < 0.3) return null;
  const preset = OPENING_PRESETS[kind];
  const { width, position } = placeOpening(len, along, wanted || preset.width);
  const o: OpeningDef = {
    id: newOpeningId(),
    kind,
    position,
    width,
    sill: preset.sill,
    top: preset.top,
    ...(preset.variant ? { variant: preset.variant } : {}),
  };
  (w.openings ??= []).push(o);
  return o;
}

/** Подвинуть проём вдоль СВОЕЙ стены. За её пределы не выпускаем. */
export function setOpeningOffset(floor: FloorDef, openingId: string, offset: number): void {
  const hit = findOpening(floor, openingId);
  if (!hit) return;
  const len = wallLength(hit.wall);
  hit.opening.position = Math.max(0, Math.min(len - hit.opening.width, offset));
}

export function setOpeningWidth(floor: FloorDef, openingId: string, width: number): void {
  const hit = findOpening(floor, openingId);
  if (!hit) return;
  const len = wallLength(hit.wall);
  hit.opening.width = Math.max(0.2, Math.min(len - 0.02, width));
  hit.opening.position = Math.max(0, Math.min(len - hit.opening.width, hit.opening.position));
}

// --- мебель и зоны --------------------------------------------------------

let furnSeq = 0;

/**
 * Поставить предмет. Плоскость даёт две координаты из трёх; третью — высоту —
 * и посадку на стену считает resolveSpot по справочнику моделей.
 *
 * Высота стен обязательна к передаче осознанно: этаж знает свою (FloorDef.
 * wallHeight), но запасное значение лежит у плана, а плана здесь нет. Молчаливое
 * «2,6» на этаже 3,2 повесило бы люстру на полметра ниже потолка.
 */
export function addFurniture(
  floor: FloorDef,
  model: string,
  x: number,
  y: number,
  rotationDeg = 0,
  wallHeight = DEFAULT_HEIGHT,
): FurnitureDef {
  // План: x вправо, y вниз. В 3D это X и Z — единственное место пересчёта.
  const spot = resolveSpot(floor, model, x, y, rotationDeg, wallHeight);
  const f: FurnitureDef = {
    id: `f${(furnSeq += 1).toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    model,
    position: [spot.x, spot.y, spot.z],
    rotation: spot.rotation,
  };
  (floor.furniture ??= []).push(f);
  return f;
}

/** Пересадить уже стоящий настенный предмет на ближайшую стену (после тяги).
 *  Высоту не трогаем: её задал справочник при постановке. */
export function remountFurniture(floor: FloorDef, id: string): boolean {
  const f = findFurniture(floor, id);
  if (!f || !isWallMount(f.model)) return false;
  const spot = resolveSpot(floor, f.model, f.position[0], f.position[2], f.rotation ?? 0, f.position[1]);
  if (!spot.onWall) return false;
  f.position = [spot.x, f.position[1], spot.z];
  f.rotation = spot.rotation;
  return true;
}

/**
 * Зона (группа устройств комнаты). ZoneDef хранит ТОЧКУ, а не область: область
 * человек рисует, чтобы не целиться в пиксель, а значок встаёт в её центр
 * тяжести. Менять схему ради полигона зоны нельзя — на ней держатся сохранённые
 * планы.
 */
export function addZone(floor: FloorDef, x: number, y: number, name?: string): ZoneDef {
  const zones = (floor.zones ??= []);
  const z: ZoneDef = {
    id: `z${zones.length}_${Math.floor(Math.random() * 100000)}`,
    name: name ?? `Зона ${zones.length + 1}`,
    x: +x.toFixed(2),
    z: +y.toFixed(2),
    entities: [],
  };
  zones.push(z);
  return z;
}

export function bindingOf(floor: FloorDef, furnitureId: string): BindingDef | undefined {
  return (floor.bindings ?? []).find((b) => b.anchor_object === furnitureId);
}

/** Привязать сущность к предмету (пустая строка — снять привязку). */
export function setFurnitureEntity(floor: FloorDef, furnitureId: string, entityId: string): void {
  const list = (floor.bindings ??= []);
  const id = String(entityId ?? '').trim();
  const at = list.findIndex((b) => b.anchor_object === furnitureId);
  if (!id) {
    if (at >= 0) list.splice(at, 1);
    return;
  }
  if (at >= 0) list[at].entity_id = id;
  else list.push({ entity_id: id, anchor_object: furnitureId });
}

/** Убрать со ВСЕХ этажей привязки к перечисленным сущностям. Возвращает,
 *  сколько их было убрано.
 *
 *  Сам предмет на плане ОСТАЁТСЯ: люстра — вещь, которая висит в комнате, а
 *  привязка — только ссылка на устройство Home Assistant. Убираем ссылку,
 *  которая ведёт в никуда (сущность удалили или переименовали), а не мебель. */
export function dropBindings(plan: FloorPlan | null | undefined, entityIds: Iterable<string>): number {
  const ids = new Set(entityIds);
  if (!plan || !ids.size) return 0;
  let gone = 0;
  for (const f of floorList(plan)) {
    const before = f.bindings ?? [];
    if (!before.length) continue;
    const kept = before.filter((b) => !b?.entity_id || !ids.has(b.entity_id));
    gone += before.length - kept.length;
    f.bindings = kept;
  }
  return gone;
}

// --- удаление -------------------------------------------------------------

/** Удалить стену вместе с её проёмами и тем, что в эти проёмы врезано.
 *  Удаляем ПО id: номер позиции после первой же правки показывает на соседа. */
export function deleteWall(floor: FloorDef, id: string): boolean {
  const walls = floor.walls ?? [];
  const at = walls.findIndex((w) => w.id === id);
  if (at < 0) return false;
  const gone = new Set((walls[at].openings ?? []).map((o) => o.id).filter(Boolean) as string[]);
  walls.splice(at, 1);
  if (gone.size && floor.furniture?.length) {
    floor.furniture = floor.furniture.filter((f) => !(f.attach?.openingId && gone.has(f.attach.openingId)));
  }
  syncAttachments(floor);
  return true;
}

export function deleteOpening(floor: FloorDef, id: string): boolean {
  const hit = findOpening(floor, id);
  if (!hit) return false;
  const list = hit.wall.openings ?? [];
  const at = list.indexOf(hit.opening);
  if (at < 0) return false;
  list.splice(at, 1);
  if (floor.furniture?.length) floor.furniture = floor.furniture.filter((f) => f.attach?.openingId !== id);
  syncAttachments(floor);
  return true;
}

export function deleteRoom(floor: FloorDef, id: string): boolean {
  const list = floor.rooms ?? [];
  const at = list.findIndex((r) => r.id === id);
  if (at < 0) return false;
  list.splice(at, 1);
  return true;
}

export function deleteFurniture(floor: FloorDef, id: string): boolean {
  const list = floor.furniture ?? [];
  const at = list.findIndex((f) => f.id === id);
  if (at < 0) return false;
  // Дверь/окно, поставленные моделью, забирают с собой свой проём — иначе в
  // стене остаётся дыра, которую нечем выбрать.
  const attach = list[at].attach;
  list.splice(at, 1);
  if (attach?.openingId) {
    for (const w of floor.walls ?? []) {
      const oi = (w.openings ?? []).findIndex((o) => o.id === attach.openingId);
      if (oi >= 0) {
        w.openings!.splice(oi, 1);
        break;
      }
    }
  }
  if (floor.bindings?.length) floor.bindings = floor.bindings.filter((b) => b.anchor_object !== id);
  syncAttachments(floor);
  return true;
}

export function deleteZone(floor: FloorDef, id: string): boolean {
  const list = floor.zones ?? [];
  const at = list.findIndex((z) => z.id === id);
  if (at < 0) return false;
  list.splice(at, 1);
  for (const z of list) if (z.parentId === id) delete z.parentId;
  return true;
}
