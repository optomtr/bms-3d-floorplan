// ---------------------------------------------------------------------------
// Ручные комнаты («зоны»): именованный значок, который человек ставит сам, и
// явный список устройств при нём. Зона перебивает автоматическую группировку —
// именно так неверно определившееся устройство попадает в нужную комнату.
//
// Здесь только правила над данными: как называется новая зона, что значит
// пустое поле, почему вложенность ровно одноуровневая. Снимки для отмены,
// перерисовку точек и уведомление карточки делает контроллер.
// ---------------------------------------------------------------------------

import type { ZoneDef } from '../types';

/** Новая зона со значком в точке (x, z). Имя — по счёту, его сразу видно в
 *  списке комнат и человек его переименовывает. */
export function makeZone(zones: ZoneDef[], x: number, z: number): ZoneDef {
  return {
    id: `z${zones.length}_${Math.floor(performance.now() % 100000)}`,
    name: `Room ${zones.length + 1}`,
    x: Math.round(x),
    z: Math.round(z),
    entities: [],
  };
}

/** Фото комнаты: сохраняется РОВНО как введено. Переписывание ссылки File-editor
 *  в /local выбрасывало оригинал, и когда догадка была неверной — фото
 *  пропадало навсегда; загрузчик пробует оба варианта сам (assetCandidates). */
export function setZonePhoto(z: ZoneDef, value: string): void {
  const v = String(value).trim();
  if (v) z.bgImage = v;
  else delete z.bgImage;
}

/**
 * Сделать зону ПОДКОМНАТОЙ родителя (или вернуть на верхний уровень с null).
 * Вложенность держится ровно одноуровневой: зона, ставшая родителем, сама
 * подкомнатой быть не может — иначе «Обзор» пришлось бы рисовать деревом.
 */
export function setZoneParent(zones: ZoneDef[], z: ZoneDef, parentId: string | null): void {
  if (parentId) {
    z.parentId = parentId;
    for (const c of zones) if (c.parentId === z.id) delete c.parentId;
  } else {
    delete z.parentId;
  }
}

/** Датчик комнаты: воздух / пол / влажность. Пустое значение = показания нет
 *  (пусто), без всякого угадывания. */
export function setZoneSensor(z: ZoneDef, kind: 'temp' | 'floor' | 'humidity', entityId: string): void {
  const key = kind === 'temp' ? 'tempSensor' : kind === 'floor' ? 'floorSensor' : 'humiditySensor';
  const v = String(entityId).trim();
  if (v) z[key] = v;
  else delete z[key];
}

/** Устройство в комнате: было — убрать, не было — добавить в конец. */
export function toggleZoneDevice(z: ZoneDef, entityId: string): void {
  z.entities = z.entities.includes(entityId)
    ? z.entities.filter((e) => e !== entityId)
    : [...z.entities, entityId];
}

/** Поменять местами два соседних элемента списка. Порядок зон задаёт порядок
 *  плашек комнат, порядок устройств — порядок света в панели комнаты. */
export function swapInList<T>(list: T[], i: number, j: number): void {
  [list[i], list[j]] = [list[j], list[i]];
}
