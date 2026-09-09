// ---------------------------------------------------------------------------
// «Мастер»: РАЗБОР ДОМА ПО РАЗДЕЛАМ — свет, кондиционеры, отопление,
// вентиляция, шторы. Только счёт и разбор; кнопки и разметка — в master.ts.
//
// ЗДЕСЬ ЖЕ ЕДИНСТВЕННОЕ МЕСТО, ГДЕ КЛИМАТ ДЕЛИТСЯ на кондиционер / отопление /
// вентиляцию — функция climateKindOf(). Она НАМЕРЕННО чистая: ей не нужны ни
// карточка, ни hass, только атрибуты сущности и модель предмета, к которому её
// привязали. Значки климата в 3D делает другой человек; когда обе половины
// сойдутся, свести их надо в ЭТУ функцию, а не завести вторую.
//
// Признаки, по которым различаем (в порядке силы):
//   1. climate.* — по СПИСКУ РЕЖИМОВ устройства (hvac_modes). Это его
//      собственная правда: умеет холодить — кондиционер; только греет —
//      отопление; только гоняет воздух — вентиляция.
//   2. switch/input_boolean/fan — по МОДЕЛИ ПРЕДМЕТА из плана (радиатор,
//      конвектор, тёплый пол → отопление; вентилятор, вытяжка, очиститель →
//      вентиляция). У реле нет hvac_modes, и модель — единственный признак,
//      который человек задал сам.
//   3. Ничего не подошло — считаем кондиционером: ровно так же поступает
//      «Выключить всё» (allOffHouse), а два разных ответа на один вопрос хуже,
//      чем один осторожный.
//
// Почему «только греет» — это modes ⊆ {off, heat}, а не «есть heat»:
// СОВПАДЕНИЕ с allOffHouse обязательно. Там отопление сохраняется по этому же
// правилу, и если бы «мастер» считал отоплением ещё и режим `auto`, человек
// увидел бы устройство в разделе «Отопление» и тут же поймал бы его выключение
// кнопкой «Выключить всё». Пусть лучше раздел будет уже, чем подпись врёт.
// ---------------------------------------------------------------------------

import type { BmsFloorplanCard } from '../../ha-3d-floorplan-card';
import type { RoomInfo } from '../../scene/scene-manager';
import { isEntityOffline } from '../state';

export type ClimateKind = 'ac' | 'heat' | 'vent';

/** Разделы «мастера» в порядке показа. */
export type MasterKey = 'lights' | 'ac' | 'heat' | 'vent' | 'curtains';

/** Модели предметов, к которым привязано реле, — отопление. */
const HEAT_MODELS = new Set(['radiator', 'convector', 'warm_floor']);
/** …и вентиляция (вентилятор, приточка, вытяжка, очиститель воздуха). */
const VENT_MODELS = new Set(['ceiling_fan', 'ceiling_vent', 'air_purifier', 'range_hood']);
/** …и кондиционер (ИК-реле на сплите). */
const AC_MODELS = new Set(['ac_unit']);

/** Кондиционер, отопление или вентиляция — по режимам самого устройства.
 *  Чистая функция: ни карточки, ни hass. Держать деление климата ТОЛЬКО здесь. */
export function climateKindOf(attrs?: { hvac_modes?: unknown }): ClimateKind {
  const modes = Array.isArray(attrs?.hvac_modes) ? (attrs!.hvac_modes as unknown[]).map(String) : [];
  if (!modes.length) return 'ac';
  // Только греет (тёплый пол, конвектор, радиаторный термостат).
  if (modes.every((m) => m === 'off' || m === 'heat')) return 'heat';
  // Только гоняет воздух — приточка/вытяжка, прикинувшаяся климатом.
  if (modes.every((m) => m === 'off' || m === 'fan_only')) return 'vent';
  return 'ac';
}

/** Раздел по МОДЕЛИ предмета из плана — для реле, у которых режимов нет. */
export function modelKind(model?: string): ClimateKind | undefined {
  if (!model) return undefined;
  if (HEAT_MODELS.has(model)) return 'heat';
  if (VENT_MODELS.has(model)) return 'vent';
  if (AC_MODELS.has(model)) return 'ac';
  return undefined;
}

/** Раздел «мастера» для одной привязки. null — устройству здесь не место
 *  (медиа, замки, датчики: у них нет общедомового действия). */
export function sectionOf(host: BmsFloorplanCard, e: { entity_id: string; behavior: string; model?: string }): MasterKey | null {
  const domain = e.entity_id.split('.')[0];
  const b = e.behavior;
  if (b === 'cover' || domain === 'cover') return 'curtains';
  if (b === 'climate' || domain === 'climate') return climateKindOf(host.hass?.states[e.entity_id]?.attributes);
  if (b === 'fan' || domain === 'fan') return 'vent';
  if (b === 'light') return 'lights'; // светильник — всегда свет, что бы за модель ни была
  if (b === 'switch' || b === 'input_boolean') return modelKind(e.model) ?? 'lights';
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
        const modes: string[] = attrs.hvac_modes ?? [];
        const heatOnly = modes.length > 0 && modes.every((m) => m === 'off' || m === 'heat');
        if (!heatOnly && s !== 'off') n++;
      }
    }
  }
  return n;
}
