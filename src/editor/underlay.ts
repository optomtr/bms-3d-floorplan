// ---------------------------------------------------------------------------
// Подложка-калька: правила над данными Underlay. Саму картинку в сцену кладёт
// scene/underlay.ts — здесь только то, что записывается в план.
// ---------------------------------------------------------------------------

import type { Underlay } from '../types';

/** Новая (или заменённая) подложка. Размеры и положение прежней сохраняются:
 *  человек уже мог выставить масштаб, и замена картинки не должна его сбить. */
export function makeUnderlay(
  prev: Underlay | undefined,
  image: string,
  naturalW: number,
  naturalH: number,
  at: { x: number; z: number },
): Underlay {
  return {
    image,
    widthM: prev?.widthM ?? 10,
    aspect: naturalW > 0 ? naturalH / naturalW : 1,
    x: prev?.x ?? Math.round(at.x * 100) / 100,
    z: prev?.z ?? Math.round(at.z * 100) / 100,
    rotation: prev?.rotation ?? 0,
    opacity: prev?.opacity ?? 0.6,
  };
}

/** Одно поле подложки, с границами: ширина не меньше 20 см, прозрачность в
 *  пределах 0.05..1 (совсем прозрачную подложку не найти на экране). */
export function setUnderlayField(
  u: Underlay,
  field: 'widthM' | 'opacity' | 'rotation' | 'x' | 'z',
  value: number,
): void {
  if (field === 'widthM') u.widthM = Math.max(0.2, value);
  else if (field === 'opacity') u.opacity = Math.max(0.05, Math.min(1, value));
  else u[field] = value;
}

/** Сдвинуть подложку на dx/dz метров (округление до сантиметра). */
export function nudgeUnderlay(u: Underlay, dx: number, dz: number): void {
  u.x = Math.round(((u.x ?? 0) + dx) * 100) / 100;
  u.z = Math.round(((u.z ?? 0) + dz) * 100) / 100;
}

/** Пересчитать масштаб по калибровке: `measured` метров на экране должны стать
 *  `real` метрами в жизни. */
export function rescaleUnderlay(u: Underlay, measured: number, real: number): void {
  u.widthM = Math.max(0.2, u.widthM * (real / measured));
}
