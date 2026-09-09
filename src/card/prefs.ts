// ---------------------------------------------------------------------------
// Настройки, которые помнит САМО УСТРОЙСТВО, а не план.
//
// Способ ровно тот же, каким уже хранится качество отрисовки
// (src/scene/quality.ts): ключ с приставкой `bms-floorplan-`, чтение и запись
// обёрнуты в try — в киоске хранилище бывает запрещено, и падать из-за
// настройки вида нельзя.
//
// Почему не в плане: настенный планшет у двери и телефон монтажника смотрят
// ОДИН объект, а нижняя полоса комнат нужна им по-разному.
// ---------------------------------------------------------------------------

import type { BmsFloorplanCard } from '../ha-3d-floorplan-card';

const ROOMS_BAR_KEY = 'bms-floorplan-rooms-bar';

/** Развёрнута ли нижняя полоса комнат над 3D. По умолчанию — да. */
export function readRoomsBarOpen(): boolean {
  try {
    return localStorage.getItem(ROOMS_BAR_KEY) !== 'off';
  } catch {
    return true;
  }
}

export function storeRoomsBarOpen(open: boolean): void {
  try {
    localStorage.setItem(ROOMS_BAR_KEY, open ? 'on' : 'off');
  } catch {
    /* ignore */
  }
}

/** Свернуть/развернуть полосу комнат и запомнить выбор на этом устройстве. */
export function toggleRoomsBar(host: BmsFloorplanCard): void {
  host.roomsBarOpen = !host.roomsBarOpen;
  storeRoomsBarOpen(host.roomsBarOpen);
}
