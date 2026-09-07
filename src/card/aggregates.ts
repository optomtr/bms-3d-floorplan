// ---------------------------------------------------------------------------
// Сводки по дому и комнатам: температура, влажность, свет, шторы, замки.
// ---------------------------------------------------------------------------

import type { BmsFloorplanCard } from '../ha-3d-floorplan-card';
import type { RoomInfo } from '../scene/scene-manager';
import type { HassEntity } from '../types';
import { ruPlural } from './i18n';

/** First sensor in the room matching a device_class / unit (for header chips). */
export function roomSensor(host: BmsFloorplanCard, room: RoomInfo, cls: string, units: string[]): HassEntity | undefined {
  for (const e of room.entities) {
    if (e.behavior !== 'sensor') continue;
    const st = host.hass?.states[e.entity_id];
    if (!st) continue;
    const dc = st.attributes?.device_class;
    const u = st.attributes?.unit_of_measurement;
    if (dc === cls || (u && units.includes(u))) return st;
  }
  return undefined;
}

/** Room AIR temp + optional FLOOR temp. When a room has BOTH a climate/AC air
 *  reading AND a bound temperature sensor, the sensor is treated as the floor
 *  probe ("Температура пола"); otherwise the single reading is the room temp. */
/** The numeric reading of a bound sensor — a `sensor.*` state, or a
 *  `climate.*` current_temperature. null when unbound or not a finite number. */
export function boundReading(host: BmsFloorplanCard, id?: string): number | null {
  if (!id) return null;
  const st = host.hass?.states[id];
  if (!st) return null;
  const raw = id.startsWith('climate.') ? st.attributes?.current_temperature : st.state;
  const v = Number(raw);
  return Number.isFinite(v) ? v : null;
}

export function roomTempStrs(host: BmsFloorplanCard, room: RoomInfo, num: (v: any, d: number) => string): { air: string | null; floor: string | null } {
// Read ONLY the sensors explicitly bound to the room in the editor
// (zone.tempSensor / zone.floorSensor). No auto-detect: an unbound metric is
// blank (null), never a guess or a dash.
  const air = boundReading(host, room.tempSensor);
  const floor = boundReading(host, room.floorSensor);
  return { air: air != null ? `${num(air, 1)}°` : null, floor: floor != null ? `${num(floor, 1)}°` : null };
}

/** Temperature sensors to HIDE from the room's device cards: they're already
 *  summarised in the header chips, so a per-sensor card would be redundant.
 *  EXCEPTION — a sensor bound to a `wall_switch` (an inert info/control plate):
 *  the user placed it there precisely to surface that reading, so it stays as a
 *  full-name info card in the panel. */
export function tempSensorsToHide(host: BmsFloorplanCard, room: RoomInfo): Set<string> {
  const skip = new Set<string>();
  for (const e of room.entities) {
    if (e.behavior !== 'sensor') continue;
    if (e.model === 'wall_switch') continue; // deliberately surfaced as info
    const a = host.hass?.states[e.entity_id]?.attributes;
    if (a?.device_class === 'temperature' || a?.unit_of_measurement === '°C' || a?.unit_of_measurement === '°F') {
      skip.add(e.entity_id);
    }
  }
  return skip;
}

/**
 * Whole-home rollup: humidity, temperature and the number of lights that are
 * on. Computed in ONE pass over hass.states and memoised per (hass object,
 * optimistic generation).
 *
 * These three were three separate full scans of every entity in the home, and
 * render() calls them several times each — on a house with 2000 entities that
 * is tens of thousands of attribute lookups per interface frame, repeated for
 * every state change that arrives. The inputs only move when hass or an
 * optimistic override moves, so a scan per hass object is the honest cost.
 */
export function homeStats(host: BmsFloorplanCard): { hum: string; temp: number | null; on: number } {
  const hass = host.hass;
  const cached = host.homeStatsCache;
  if (cached && hass && cached.hass === hass && cached.opt === host.optGen) return cached;

  const humVals: number[] = [];
  const tempVals: number[] = [];
  const climateVals: number[] = [];
  let on = 0;
  for (const id in hass?.states ?? {}) {
    const st = hass!.states[id] as HassEntity;
    // Lights that are on — through effState so an optimistic tap counts.
    if (id.startsWith('light.')) {
      if (host.effState(id) === 'on') on++;
      continue;
    }
    const a = st?.attributes;
    const dc = a?.device_class;
    if (dc === 'humidity') {
      const v = Number(st.state);
      if (Number.isFinite(v)) humVals.push(v);
    } else if (dc === 'temperature') {
      // Only real air-temperature readings. The Tuya floor thermostats expose
      // a unit-less raw floor-probe value (~220-290) as device_class
      // temperature; averaging that in dragged the whole-home mean to absurd
      // numbers (110°). Require a °C/°F unit and a sane range so a mis-scaled
      // probe can't skew it.
      if (a.unit_of_measurement !== '°C' && a.unit_of_measurement !== '°F') continue;
      const v = Number(st.state);
      if (Number.isFinite(v) && v >= -60 && v <= 160) tempVals.push(v);
    } else if (id.startsWith('climate.')) {
      const cur = Number(a?.current_temperature);
      if (Number.isFinite(cur)) climateVals.push(cur);
    }
  }
  const avg = (v: number[]) => v.reduce((s, n) => s + n, 0) / v.length;
// Fall back to the climate units' current_temperature when no standalone
// temperature sensor reports: some homes only have thermostats.
  const tSrc = tempVals.length ? tempVals : climateVals;
  const out = {
    hum: humVals.length ? `${Math.round(avg(humVals))}%` : '—',
    temp: tSrc.length ? avg(tSrc) : null,
    on,
  };
  if (hass) host.homeStatsCache = { hass, opt: host.optGen, ...out };
  return out;
}

/** Whole-home humidity = average of every humidity sensor in HA (not just the
 *  ones bound to a room). Humidity sensors are usually auxiliary AC readings
 *  that aren't placed in the 3D scene, so a room-only lookup shows nothing. */
export function homeHumidity(host: BmsFloorplanCard): string {
  return homeStats(host).hum;
}

/** Whole-home temperature (°) = average of every temperature sensor in HA,
 *  else the climate units' current_temperature. Same reasoning as
 *  homeHumidity: the temp sensors often aren't bound to a room, and some
 *  climates report no current_temperature, so a room-only lookup shows "—".
 *  Returns null if none. */
export function homeTemperature(host: BmsFloorplanCard): number | null {
  return homeStats(host).temp;
}

/** Whole-home count of lights that are on — every light.* entity in HA, not
 *  just the ones assigned to a room on the active floor (a room-only count
 *  shows 0 when the on-lights live on other floors / aren't zoned). */
export function homeLightsOn(host: BmsFloorplanCard): number {
  return homeStats(host).on;
}

/** Whole-home rollup for the screensaver: avg temp/humidity, lights on, lock. */
export function homeSummary(host: BmsFloorplanCard): { temp: string; hum: string; on: string; secIcon: string; secLabel: string } {
  let tSum = 0, tN = 0;
  const locks: string[] = [];
  for (const room of host.rooms) {
    const t = roomSensor(host, room, 'temperature', ['°C', '°F']);
    let tv = t ? Number(t.state) : undefined;
    if (tv == null || !Number.isFinite(tv)) {
      const c = room.entities.find((e) => e.behavior === 'climate');
      const cur = c ? host.hass?.states[c.entity_id]?.attributes?.current_temperature : undefined;
      tv = cur != null ? Number(cur) : undefined;
    }
    if (tv != null && Number.isFinite(tv)) { tSum += tv; tN++; }
    for (const e of room.entities) if (e.behavior === 'lock') locks.push(e.entity_id);
  }
  const on = homeLightsOn(host);
  const fT = (v: number) => v.toLocaleString(host.uiLocale, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  let secIcon = 'room', secLabel = host.t('At home');
  if (locks.length) {
    const allLocked = locks.every((id) => host.effState(id) === 'locked');
    secIcon = allLocked ? 'lockClosed' : 'lockOpen';
    secLabel = allLocked ? host.t('Locked') : host.t('Unlocked');
  }
  const homeT = tN ? tSum / tN : homeTemperature(host);
  return { temp: homeT != null ? `${fT(homeT)}°` : '—', hum: homeHumidity(host), on: String(on), secIcon, secLabel };
}

/** Count of distinct device categories present in a room (for "N устройства"). */
export function deviceCount(room: RoomInfo): number {
  const has = (...b: string[]) => room.entities.some((e) => b.includes(e.behavior));
  return [
    has('light', 'switch', 'input_boolean'),
    has('climate', 'fan'),
    has('cover'),
    has('media_player'),
    has('lock'),
  ].filter(Boolean).length;
}

/** Aggregate light state + representative brightness for a whole room. */
export function roomLights(host: BmsFloorplanCard, room: RoomInfo): { ids: string[]; lightId?: string; anyOn: boolean; bri: number } {
  const ids = room.entities
    .filter((e) => ['light', 'switch', 'input_boolean'].includes(e.behavior))
    .map((e) => e.entity_id)
    .filter((id) => host.hass?.states[id]);
  const anyOn = ids.some((id) => host.effState(id) === 'on');
  const lightId = room.entities.find((e) => e.behavior === 'light' && host.hass?.states[e.entity_id])?.entity_id;
  let bri = 100;
  if (lightId) {
    const b = host.hass?.states[lightId]?.attributes?.brightness;
    bri = b != null ? Math.round((b / 255) * 100) : 100;
    if (host.dragEntity === lightId) bri = host.dragValue;
  }
  return { ids, lightId, anyOn, bri };
}

export function overviewStats(host: BmsFloorplanCard): { onCount: number; avgTemp: string; roomCount: number } {
  const onCount = homeLightsOn(host); // whole-home, not just the active floor's rooms
  let sum = 0;
  let n = 0;
  for (const room of host.rooms) {
    const t = roomSensor(host, room, 'temperature', ['°C', '°F']);
    let tv = t ? Number(t.state) : undefined;
    if (tv == null || !Number.isFinite(tv)) {
      const c = room.entities.find((e) => e.behavior === 'climate');
      const cur = c ? host.hass?.states[c.entity_id]?.attributes?.current_temperature : undefined;
      tv = cur != null ? Number(cur) : undefined;
    }
    if (tv != null && Number.isFinite(tv)) { sum += tv; n++; }
  }
  const avgT = n ? sum / n : homeTemperature(host);
  return { onCount, avgTemp: avgT != null ? `${Math.round(avgT)}°` : '—', roomCount: host.rooms.length };
}

/** Whole-home status for the Обзор status row (heating / blinds / hum / lock). */
export function houseStatus(host: BmsFloorplanCard): { heat: string; heatLabel: string; blinds: string; hum: string; secIcon: string; secLabel: string } {
  let heatN = 0, bTotal = 0, bOpen = 0;
  const locks: string[] = [];
  for (const room of host.rooms) {
    const c = room.entities.find((e) => e.behavior === 'climate');
    if (c) {
      const s = host.effState(c.entity_id);
      if (s !== 'off' && s !== 'unavailable' && s !== 'unknown') heatN++;
    }
    for (const e of room.entities) {
      if (e.behavior === 'cover') {
        bTotal++;
        const pos = host.hass?.states[e.entity_id]?.attributes?.current_position;
        const open = typeof pos === 'number' ? pos > 0 : host.effState(e.entity_id) === 'open';
        if (open) bOpen++;
      }
      if (e.behavior === 'lock') locks.push(e.entity_id);
    }
  }
  let secIcon = 'room', secLabel = host.t('At home');
  if (locks.length) {
    const all = locks.every((id) => host.effState(id) === 'locked');
    secIcon = all ? 'lockClosed' : 'lockOpen';
    secLabel = all ? host.t('Locked') : host.t('Unlocked');
  }
  return {
    heat: String(heatN),
    heatLabel: ruPlural(heatN, 'комната греется', 'комнаты греются', 'комнат греются'),
    blinds: `${bOpen} ${host.t('of')} ${bTotal}`,
    hum: homeHumidity(host),
    secIcon,
    secLabel,
  };
}
