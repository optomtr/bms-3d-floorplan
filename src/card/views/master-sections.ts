// ---------------------------------------------------------------------------
// «Мастер»: РАЗБОР ДОМА ПО РАЗДЕЛАМ — свет, кондиционеры, отопление,
// вентиляция, шторы. Только счёт и разбор; кнопки и разметка — в master.ts.
//
// РАЗБОР КЛИМАТА ЗДЕСЬ НЕ ЖИВЁТ. Вид климатической техники (кондиционер,
// тёплый пол, конвектор, вентиляция) определяет ОДНА функция на всю систему —
// climateKindOf() из `src/climate-kind.ts`; её же спрашивают кружки климата в
// 3D. Раньше правило было написано здесь во второй раз, и вторая копия
// ошибалась на живом объекте владельца:
//   • реле без модели предмета считалось СВЕТОМ — а на объекте оба реле
//     коллектора это тёплый пол, и кнопка «Выключить весь свет» снимала с них
//     питание;
//   • домен `fan` всегда означал вентиляцию — а 13 из 14 «вентиляторов»
//     объекта это вентилятор ВНУТРИ конвектора, то есть обогрев.
//
// ЧЕМ «МАСТЕР» ОТЛИЧАЕТСЯ ОТ КРУЖКОВ — ровно одним: у него есть раздел «Свет»,
// которого у кружков нет. Общее правило отвечает только на вопрос «климат
// такого-то вида или не климат»; что делать с «не климатом», решает уже
// sectionOf() ниже: светильник — всегда свет, реле и переключатель без
// климатических признаков — тоже свет, остальное разделов не образует.
// Понятие «свет» в общий модуль не тащим: кружкам оно не нужно.
//
// Видов климата пять, а разделов у «мастера» три, поэтому SECTION_OF_KIND
// сводит их: тёплый пол и конвектор — оба «Отопление», а «климат неизвестного
// вида» уходит в «Кондиционеры». Последнее — осознанная осторожность: ровно
// так же с ним поступает «Выключить всё» (allOffHouse его гасит), а два разных
// ответа на один вопрос хуже, чем один осторожный.
// ---------------------------------------------------------------------------

import {
  climateBehaviorOf,
  climateKindOf,
  isHeatOnlyClimate,
  type ClimateEntityRef,
  type ClimateKind,
} from '../../climate-kind';
import type { BmsFloorplanCard } from '../../ha-3d-floorplan-card';
import type { RoomInfo } from '../../scene/scene-manager';
import { isEntityOffline } from '../state';

/** Разделы «мастера» в порядке показа. */
export type MasterKey = 'lights' | 'ac' | 'heat' | 'vent' | 'curtains';

/** Пять видов климата → три раздела «мастера». Тёплый пол и конвектор — это
 *  одно «Отопление»; климат неизвестного вида осторожно уходит к кондиционерам
 *  (см. шапку файла). */
const SECTION_OF_KIND: Record<ClimateKind, MasterKey> = {
  ac: 'ac',
  floor: 'heat',
  heater: 'heat',
  vent: 'vent',
  other: 'ac',
};

/** Раздел «мастера» для одной привязки. null — устройству здесь не место
 *  (медиа, замки, датчики: у них нет общедомового действия). */
export function sectionOf(host: BmsFloorplanCard, e: ClimateEntityRef): MasterKey | null {
  const b = climateBehaviorOf(e); // `auto` разворачивается в домен сущности
  if (b === 'cover') return 'curtains';

  // Вопрос «климат или нет» задаём ОБЩЕМУ правилу — тому же, что рисует кружки
  // в 3D. Светильник до него не доходит вовсе: лампа — всегда свет, что бы за
  // модель предмета к ней ни привязали.
  if (b !== 'light') {
    const kind = climateKindOf(e, host.hass?.states[e.entity_id]?.attributes);
    if (kind) return SECTION_OF_KIND[kind];
  }

  // «Не климат». Раздел «Свет» — местное решение «мастера»: реле и
  // переключатель, у которых климатических признаков не нашлось, это свет, и
  // они остаются там же, где были.
  if (b === 'light' || b === 'switch' || b === 'input_boolean') return 'lights';
  return null;
}

export interface MasterDevice {
  id: string;
  domain: string;
  /** «Работает»: горит, дует, греет, открыта. */
  on: boolean;
  /** Команду реально можно отправить: домен разрешён и устройство на связи. */
  live: boolean;
  /** Режимы climate.* (у остальных пусто). */
  modes: string[];
}

export interface MasterSection {
  key: MasterKey;
  icon: string;
  devices: MasterDevice[];
  /** Только те, до кого дойдёт команда. Кнопки считают именно по ним. */
  live: MasterDevice[];
  total: number;
  onCount: number;
}

const SECTION_ORDER: MasterKey[] = ['lights', 'ac', 'heat', 'vent', 'curtains'];
const SECTION_ICON: Record<MasterKey, string> = {
  lights: 'bulb',
  ac: 'snow',
  heat: 'heat',
  vent: 'fan',
  curtains: 'curtain',
};

/** Русское/английское имя раздела. */
export function sectionTitle(host: BmsFloorplanCard, key: MasterKey): string {
  return {
    lights: host.t('Lights'),
    ac: host.tx('Кондиционеры', 'Air conditioners'),
    heat: host.tx('Отопление', 'Heating'),
    vent: host.t('Ventilation'),
    curtains: host.t('Curtains'),
  }[key];
}

/** Все комнаты ДОМА (все этажи), а не только текущего этажа: «мастер» — это
 *  экран про дом целиком. Запасной путь — host.rooms, если сцены ещё нет. */
export function houseRooms(host: BmsFloorplanCard): RoomInfo[] {
  const byFloor = host.sceneManager?.roomsByFloor();
  return byFloor && byFloor.length ? byFloor.flat() : host.rooms;
}

/** Работает ли устройство прямо сейчас (с учётом оптимистичного нажатия). */
export function deviceOn(host: BmsFloorplanCard, id: string, key: MasterKey): boolean {
  const s = host.effState(id);
  if (key === 'curtains') {
    const pos = host.hass?.states[id]?.attributes?.current_position;
    if (typeof pos === 'number') return pos > 0;
    return s === 'open' || s === 'opening';
  }
  // Климат «работает», когда он НЕ выключен: состояние у него — это режим
  // (cool / heat / fan_only), а не «on». Вентиляция сюда входит наравне с
  // остальными: приточка на climate.* докладывает `fan_only`, и проверка на
  // «on» посчитала бы работающую вентиляцию выключенной.
  if (key === 'ac' || key === 'heat' || key === 'vent') {
    if (id.startsWith('climate.')) return s !== 'off' && s !== 'unavailable' && s !== 'unknown';
    return s === 'on';
  }
  return s === 'on';
}

/** Разделы дома: только те, устройства которых в доме ЕСТЬ. Пустых нет —
 *  кнопка, которой некем управлять, лжёт о доме. */
export function masterSections(host: BmsFloorplanCard): MasterSection[] {
  const groups = new Map<MasterKey, MasterDevice[]>();
  const seen = new Set<string>();
  for (const room of houseRooms(host)) {
    for (const e of room.entities) {
      if (seen.has(e.entity_id)) continue;
      seen.add(e.entity_id);
      // Сущности нет в Home Assistant — её нельзя ни считать, ни включить.
      if (!host.hass?.states[e.entity_id]) continue;
      const key = sectionOf(host, e);
      if (!key) continue;
      const modes = key === 'ac' || key === 'heat' || key === 'vent'
        ? ((host.hass.states[e.entity_id]?.attributes?.hvac_modes as string[] | undefined) ?? []).map(String)
        : [];
      const dev: MasterDevice = {
        id: e.entity_id,
        domain: e.entity_id.split('.')[0],
        on: deviceOn(host, e.entity_id, key),
        live: host.canControl(e.entity_id) && !isEntityOffline(host, e.entity_id),
        modes,
      };
      const list = groups.get(key);
      if (list) list.push(dev);
      else groups.set(key, [dev]);
    }
  }
  return SECTION_ORDER.filter((k) => groups.has(k)).map((key) => {
    const devices = groups.get(key)!;
    return {
      key,
      icon: SECTION_ICON[key],
      devices,
      live: devices.filter((d) => d.live),
      total: devices.length,
      onCount: devices.filter((d) => d.on).length,
    };
  });
}

/** Сколько устройств погасит существующая кнопка «Выключить всё».
 *
 *  Повторяет правила allOffHouse() ОДИН В ОДИН, включая охват (host.rooms —
 *  комнаты текущего этажа) и обе оговорки: телевизор и отопление остаются.
 *  Считаем ровно то, что произойдёт: счётчик, который больше действия, — это
 *  обещание, которого кнопка не выполнит. */
export function allOffCount(host: BmsFloorplanCard): number {
  let n = 0;
  const seen = new Set<string>();
  for (const room of host.rooms) {
    for (const e of room.entities) {
      if (seen.has(e.entity_id)) continue;
      seen.add(e.entity_id);
      if (!host.canControl(e.entity_id)) continue;
      if (isEntityOffline(host, e.entity_id)) continue;
      const attrs = host.hass?.states[e.entity_id]?.attributes ?? {};
      const s = host.effState(e.entity_id);
      if (['light', 'switch', 'input_boolean', 'fan'].includes(e.behavior)) {
        if (s === 'on') n++;
      } else if (e.behavior === 'media_player') {
        if (attrs.device_class === 'tv') continue; // телевизор не трогаем
        if (!['off', 'paused', 'idle', 'standby', 'unavailable', 'unknown'].includes(s)) n++;
      } else if (e.behavior === 'climate') {
        if (!isHeatOnlyClimate(attrs) && s !== 'off') n++;
      }
    }
  }
  return n;
}
