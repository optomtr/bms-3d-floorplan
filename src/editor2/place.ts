// ---------------------------------------------------------------------------
// Куда НА САМОМ ДЕЛЕ встаёт поставленный предмет: высота и посадка на стену.
//
// Вид сверху даёт две координаты из трёх. Третью — высоту — знает справочник
// моделей: потолочный светильник висит под потолком, бра на 1,6 м, торшер
// стоит на полу. Раньше её тут просто не спрашивали, и весь свет ложился на
// пол; отсюда и этот файл.
//
// Ничего своего здесь не считается. Высота — defaultY, «вешается ли на стену» —
// isWallMount, вынос на комнатную сторону стены и разворот лицом внутрь —
// resolveWallMount + nearestMountPoint. Всё это уже написано и уже работает в
// старом редакторе; вторая копия этой математики разошлась бы с первой в
// первый же месяц.
// ---------------------------------------------------------------------------

import type { FloorDef, FloorPlan } from '../types';
import { resolveWallMount } from '../editor/geometry';
import { nearestMountPoint } from '../editor/snapping';
import { LIGHT_KEYS, defaultY, isLightSet, isWallMount } from '../furniture/library';

export { isLightSet, isWallMount };

/** Высота стен, если её не задали ни этажу, ни плану. */
export const DEFAULT_WALL_HEIGHT = 2.6;

/** На каком расстоянии настенная модель ещё «дотягивается» до стены, метры.
 *  Больше, чем у старого редактора (1,2): на плане целятся указателем в комнату,
 *  а не в саму линию стены. */
export const MOUNT_REACH = 1.5;

/** Модель — светильник: у неё есть светящаяся часть и ей просят привязку. */
export function isLight(model: string): boolean {
  return LIGHT_KEYS.includes(model);
}

/** Высота стен этажа: этаж → план → 2,6 м. Ровно тот же порядок, что у сцены
 *  (scene/builder.ts) и у старого редактора — иначе свет висел бы на одной
 *  высоте в плане и на другой в 3D. */
export function wallHeightOf(plan: FloorPlan | null | undefined, floor: FloorDef | null | undefined): number {
  const h = floor?.wallHeight ?? plan?.wallHeight ?? DEFAULT_WALL_HEIGHT;
  return Number.isFinite(h) && h > 0 ? h : DEFAULT_WALL_HEIGHT;
}

/** Миллиметры — предел осмысленной точности плана. */
const mm = (v: number): number => Math.round(v * 1000) / 1000;

export interface Spot {
  /** Координаты в 3D: x вправо, y вверх, z «вниз по плану». */
  x: number;
  y: number;
  z: number;
  rotation: number;
  /** Модель вешается на стену. */
  wallMount: boolean;
  /** Стена нашлась и предмет к ней прижат (у ненастенных всегда false). */
  onWall: boolean;
}

/**
 * Итоговое место предмета: высота из справочника, а настенные ещё и прижаты к
 * ближайшей стене лицом в комнату.
 *
 * Настенная модель, для которой стены рядом не нашлось, возвращается с
 * `onWall: false` и на том месте, куда ткнули: решение «ставить или сказать
 * человеку» принимает инструмент, а не эта функция.
 */
export function resolveSpot(
  floor: FloorDef,
  model: string,
  x: number,
  y: number,
  rotationDeg: number,
  wallHeight: number,
): Spot {
  const h = mm(defaultY(model, wallHeight));
  if (!isWallMount(model)) {
    return { x: mm(x), y: h, z: mm(y), rotation: rotationDeg, wallMount: false, onWall: false };
  }
  const mount = nearestMountPoint(floor, x, y, MOUNT_REACH);
  if (!mount) {
    return { x: mm(x), y: h, z: mm(y), rotation: rotationDeg, wallMount: true, onWall: false };
  }
  const r = resolveWallMount(model, mount);
  return { x: mm(r.x), y: h, z: mm(r.z), rotation: Math.round(r.rotation), wallMount: true, onWall: true };
}
