// ---------------------------------------------------------------------------
// Выделенное — наружу и обратно.
//
// Оболочка не знает ни про WallDef, ни про полигоны: она получает плоский
// Selection из договора и шлёт обратно плоский patch. Все числа из patch
// проходят через humanNum — оболочка вправе передать строку «3,5» прямо из
// своего поля, и это обязано означать три с половиной, а не тридцать пять.
// ---------------------------------------------------------------------------

import type { FloorDef, OpeningKind, Vec2 } from '../types';
import type { Selection } from './api';
import { angleDeg, fromPolar, polyArea } from './geom';
import { humanNum } from './num';
import {
  OPENING_PRESETS,
  bindingOf,
  deleteFurniture,
  deleteOpening,
  deleteRoom,
  deleteWall,
  deleteZone,
  findFurniture,
  findOpening,
  findRoom,
  findWall,
  findZone,
  moveVertex,
  setFurnitureEntity,
  setOpeningOffset,
  setOpeningWidth,
  wallLength,
} from './model';
import { DEFAULT_WALL_HEIGHT, isLight, isLightSet, isWallMount, resolveSpot } from './place';
import type { SelRef } from './state';

export function buildSelection(floor: FloorDef | null, sel: SelRef | null): Selection | null {
  if (!floor || !sel) return null;
  if (sel.kind === 'wall') {
    const w = findWall(floor, sel.id);
    if (!w) return null;
    return {
      kind: 'wall',
      id: sel.id,
      lengthM: wallLength(w),
      thicknessM: w.thickness ?? 0.12,
      angleDeg: angleDeg(w.start as Vec2, w.end as Vec2),
      material: w.material,
      color: w.color,
    };
  }
  if (sel.kind === 'room') {
    const r = findRoom(floor, sel.id);
    if (!r) return null;
    return { kind: 'room', id: sel.id, name: r.name, areaM2: polyArea(r.polygon ?? []), material: r.material, color: r.color };
  }
  if (sel.kind === 'opening') {
    const hit = findOpening(floor, sel.id);
    if (!hit) return null;
    return {
      kind: 'opening',
      id: sel.id,
      wallId: hit.wall.id ?? '',
      kind2: hit.opening.kind,
      widthM: hit.opening.width,
      offsetM: hit.opening.position,
      variant: hit.opening.variant,
    };
  }
  if (sel.kind === 'furniture') {
    const f = findFurniture(floor, sel.id);
    if (!f) return null;
    const scale = typeof f.scale === 'number' ? f.scale : 1;
    const set = isLightSet(f.model);
    return {
      kind: 'furniture',
      id: sel.id,
      model: f.model,
      rotationDeg: f.rotation ?? 0,
      scale,
      entityId: bindingOf(floor, sel.id)?.entity_id,
      isLight: isLight(f.model),
      wallMount: isWallMount(f.model),
      isSet: set,
      // «Разброс» 1 — общий множитель по умолчанию у всех наборов, его можно
      // показать смело. «Количество» у каждой модели своё (у пары — два, у
      // набора точечных — шесть), и второй копии этих чисел здесь быть не
      // должно: пока человек его не задал, отдаём undefined, а инспектор
      // честно говорит «как заложено в модели».
      ...(set ? { spread: f.spread ?? 1, count: f.count } : {}),
    };
  }
  const z = findZone(floor, sel.id);
  if (!z) return null;
  return { kind: 'zone', id: sel.id, name: z.name };
}

const numOf = (patch: Record<string, unknown>, key: string): number | null => {
  if (!(key in patch)) return null;
  const v = humanNum(patch[key]);
  return Number.isFinite(v) ? v : null;
};

const strOf = (patch: Record<string, unknown>, key: string): string | null =>
  key in patch ? String(patch[key] ?? '') : null;

/** Применить правку к выделенному. Возвращает false, если менять было нечего.
 *  `wallHeight` нужна замене модели: новая высота считается от потолка этажа. */
export function applyPatch(
  floor: FloorDef | null,
  sel: SelRef | null,
  patch: Record<string, unknown>,
  wallHeight = DEFAULT_WALL_HEIGHT,
): boolean {
  if (!floor || !sel || !patch) return false;

  if (sel.kind === 'wall') {
    const w = findWall(floor, sel.id);
    if (!w) return false;
    const th = numOf(patch, 'thicknessM');
    if (th !== null && th > 0) w.thickness = Math.max(0.02, Math.min(2, th));
    const mat = strOf(patch, 'material');
    if (mat !== null) (mat ? (w.material = mat) : delete w.material);
    const col = strOf(patch, 'color');
    if (col !== null) (col ? (w.color = col) : delete w.color);
    // Длина и угол двигают КОНЕЦ стены вместе со всем, что к нему примыкает:
    // иначе правка длины разрывала угол дома и щель искали потом руками.
    const len = numOf(patch, 'lengthM');
    const ang = numOf(patch, 'angleDeg');
    if (len !== null || ang !== null) {
      const start = w.start as Vec2;
      const nowLen = wallLength(w);
      const nowAng = angleDeg(start, w.end as Vec2);
      const to = fromPolar(start, len !== null && len > 0 ? len : nowLen, ang !== null ? ang : nowAng);
      moveVertex(floor, w.end as Vec2, to);
    }
    return true;
  }

  if (sel.kind === 'room') {
    const r = findRoom(floor, sel.id);
    if (!r) return false;
    const name = strOf(patch, 'name');
    if (name !== null) r.name = name;
    const mat = strOf(patch, 'material');
    if (mat !== null) (mat ? (r.material = mat) : delete r.material);
    const col = strOf(patch, 'color');
    if (col !== null) (col ? (r.color = col) : delete r.color);
    return true;
  }

  if (sel.kind === 'opening') {
    const hit = findOpening(floor, sel.id);
    if (!hit) return false;
    const kind = strOf(patch, 'kind2');
    if (kind === 'door' || kind === 'window' || kind === 'opening') {
      hit.opening.kind = kind as OpeningKind;
      hit.opening.sill = OPENING_PRESETS[kind].sill;
      hit.opening.top = OPENING_PRESETS[kind].top;
    }
    const w = numOf(patch, 'widthM');
    if (w !== null && w > 0) setOpeningWidth(floor, sel.id, w);
    const off = numOf(patch, 'offsetM');
    if (off !== null) setOpeningOffset(floor, sel.id, off);
    const variant = strOf(patch, 'variant');
    if (variant !== null) (variant ? (hit.opening.variant = variant) : delete hit.opening.variant);
    return true;
  }

  if (sel.kind === 'furniture') {
    const f = findFurniture(floor, sel.id);
    if (!f) return false;
    const rot = numOf(patch, 'rotationDeg');
    if (rot !== null) f.rotation = rot;
    const sc = numOf(patch, 'scale');
    if (sc !== null && sc > 0) f.scale = sc;
    const model = strOf(patch, 'model');
    if (model && model !== f.model) {
      // Замена модели меняет и правила посадки: люстра вместо торшера обязана
      // уехать под потолок, бра вместо люстры — на стену.
      f.model = model;
      const spot = resolveSpot(floor, model, f.position[0], f.position[2], f.rotation ?? 0, wallHeight);
      f.position = [spot.x, spot.y, spot.z];
      f.rotation = spot.rotation;
    }
    const spread = numOf(patch, 'spread');
    if (spread !== null && spread > 0) f.spread = Math.max(0.4, Math.min(12, Math.round(spread * 100) / 100));
    const count = numOf(patch, 'count');
    if (count !== null && count > 0) f.count = Math.max(1, Math.min(12, Math.round(count)));
    const ent = strOf(patch, 'entityId');
    if (ent !== null) setFurnitureEntity(floor, sel.id, ent);
    const col = strOf(patch, 'color');
    if (col !== null) (col ? (f.color = col) : delete f.color);
    return true;
  }

  const z = findZone(floor, sel.id);
  if (!z) return false;
  const name = strOf(patch, 'name');
  if (name !== null) z.name = name;
  return true;
}

export function deleteSel(floor: FloorDef | null, sel: SelRef | null): boolean {
  if (!floor || !sel) return false;
  switch (sel.kind) {
    case 'wall':
      return deleteWall(floor, sel.id);
    case 'room':
      return deleteRoom(floor, sel.id);
    case 'opening':
      return deleteOpening(floor, sel.id);
    case 'furniture':
      return deleteFurniture(floor, sel.id);
    default:
      return deleteZone(floor, sel.id);
  }
}

/** Выделенное ещё существует? После удаления и отмены — не всегда. */
export function selectionAlive(floor: FloorDef | null, sel: SelRef | null): boolean {
  if (!floor || !sel) return false;
  switch (sel.kind) {
    case 'wall':
      return !!findWall(floor, sel.id);
    case 'room':
      return !!findRoom(floor, sel.id);
    case 'opening':
      return !!findOpening(floor, sel.id);
    case 'furniture':
      return !!findFurniture(floor, sel.id);
    default:
      return !!findZone(floor, sel.id);
  }
}
