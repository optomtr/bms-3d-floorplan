// ---------------------------------------------------------------------------
// Работа со списком сущностей HA: подписи, комнаты, поиск, домофон.
// ---------------------------------------------------------------------------

import type { BmsFloorplanCard } from '../ha-3d-floorplan-card';
import type { HassEntity } from '../types';
import type { IntercomGroup } from './types';

/** Entities that make sense to bind as a room's temperature (also floor) or
 *  humidity readout — temp/humidity sensors by device_class or unit, plus
 *  climate units for temperature. Sorted by friendly name, for the editor
 *  dropdowns. `keep` guarantees an already-bound id stays selectable even if
 *  it's momentarily missing from hass. */
export function sensorCandidates(host: BmsFloorplanCard, kind: 'temp' | 'humidity', keep?: string): { id: string; label: string }[] {
  const out: { id: string; label: string }[] = [];
  for (const [id, st] of Object.entries(host.hass?.states ?? {})) {
    const a = (st as HassEntity).attributes;
    const dc = a?.device_class;
    const u = a?.unit_of_measurement;
    const ok =
      kind === 'temp'
        ? (id.startsWith('sensor.') && (dc === 'temperature' || u === '°C' || u === '°F')) || id.startsWith('climate.')
        : id.startsWith('sensor.') && (dc === 'humidity' || u === '%');
    if (ok) out.push({ id, label: (a?.friendly_name as string) || id });
  }
  if (keep && !out.some((o) => o.id === keep)) out.push({ id: keep, label: keep });
  out.sort((x, y) => x.label.localeCompare(y.label));
  return out;
}

/** Friendly label for an entity in the editor lists (name, else the id). */
export function entityShort(host: BmsFloorplanCard, eid: string): string {
  return host.hass?.states[eid]?.attributes?.friendly_name ?? eid;
}

/** If this entity is already assigned to a DIFFERENT manual room, that room's
 *  name — so the picker can flag entities that are already taken (first zone
 *  to list an entity owns it, so a second assignment is silently ignored). */
export function boundElsewhere(host: BmsFloorplanCard, eid: string, exceptZoneId: string): string | null {
  for (const z of host.editZones) {
    if (z.id !== exceptZoneId && (z.entities ?? []).includes(eid)) return z.name || 'Room';
  }
  return null;
}

/** Entity ids for the selected piece, filtered by its natural domain(s).
 *  If the domain filter matches nothing, fall back to ALL entities so the
 *  dropdown is never empty. */
export function candidateEntities(host: BmsFloorplanCard, domains: string[]): { ids: string[]; fellBack: boolean } {
  if (!host.hass) return { ids: [], fellBack: false };
  const all = Object.keys(host.hass.states);
  let ids = domains.length
    ? all.filter((id) => domains.includes(id.split('.')[0]))
    : all;
  const fellBack = domains.length > 0 && ids.length === 0;
  if (fellBack) ids = all; // filter too strict → show everything
  // Sort by room (area) first, then friendly name — groups same-named entities
  // by where they are so the right one is easy to pick.
  ids = [...ids].sort((a, b) => {
    const ra = entityArea(host, a);
    const rb = entityArea(host, b);
    if (ra !== rb) return (ra || '￿').localeCompare(rb || '￿');
    return entityLabel(host, a).localeCompare(entityLabel(host, b));
  });
  return { ids, fellBack };
}

export function entityLabel(host: BmsFloorplanCard, id: string): string {
  return host.hass?.states[id]?.attributes?.friendly_name || id;
}

/** The HA area (room) an entity belongs to: its own area, else its device's. */
export function entityArea(host: BmsFloorplanCard, id: string): string {
  const h = host.hass as any;
  const ent = h?.entities?.[id];
  let areaId: string | undefined = ent?.area_id ?? undefined;
  if (!areaId && ent?.device_id) areaId = h?.devices?.[ent.device_id]?.area_id;
  if (!areaId) return '';
  const a = h?.areas?.[areaId];
  return (a?.name as string) || '';
}

/** Rich option text: "Friendly name · Room · entity.id" so same-named
 *  entities in different rooms are easy to tell apart. */
export function entityOptionText(host: BmsFloorplanCard, id: string): string {
  const name = entityLabel(host, id);
  const area = entityArea(host, id);
  const parts = [name];
  if (area) parts.push(area);
  if (id !== name) parts.push(id);
  return parts.join('  ·  ');
}

export function entityCardName(host: BmsFloorplanCard, id: string, fallback?: string): string {
  return fallback ?? host.hass?.states[id]?.attributes?.friendly_name ?? id;
}

/** Spot a BMS Intercom in a room's entities. Its objects share a base name
 *  ("<base>_video", "<base>_vyzov", "<base>_prosmotr", "<base>_otkryt_dver",
 *  …); any one of them being present (usually the camera bound to the intercom
 *  model) pulls in the siblings from hass, so the user only binds ONE entity. */
export function detectIntercom(host: BmsFloorplanCard, ents: { entity_id: string }[]): IntercomGroup | null {
  const st = host.hass?.states ?? {};
  const suffix: Record<string, string> = {
    camera: '_video', switch: '_prosmotr', binary_sensor: '_vyzov', button: '_otkryt_dver',
  };
  for (const e of ents) {
    const dot = e.entity_id.indexOf('.');
    const dom = e.entity_id.slice(0, dot);
    const obj = e.entity_id.slice(dot + 1);
    const suf = suffix[dom];
    if (!suf || !obj.endsWith(suf)) continue;
    const base = obj.slice(0, -suf.length);
    const prosmotr = `switch.${base}_prosmotr`;
    const vyzov = `binary_sensor.${base}_vyzov`;
    if (!st[prosmotr] || !st[vyzov]) continue; // not an intercom base
    const pick = (id: string) => (st[id] ? id : undefined);
    const g: IntercomGroup = {
      base, prosmotr, vyzov,
      camera: pick(`camera.${base}_video`),
      open: pick(`button.${base}_otkryt_dver`),
      answer: pick(`button.${base}_otvetit`),
      reset: pick(`button.${base}_sbrosit`),
      ids: new Set<string>(),
    };
    [g.camera, g.vyzov, g.prosmotr, g.open, g.answer, g.reset].forEach((id) => id && g.ids.add(id));
    return g;
  }
  return null;
}

/** Short label for a light segment — the HA name with the room prefix stripped
 *  (e.g. "Гостиная · Люстра" → "Люстра"). Truncation is done in CSS. */
export function shortLightName(host: BmsFloorplanCard, id: string, roomName?: string): string {
  const st = host.hass?.states[id];
  let n = (st?.attributes?.friendly_name as string) ?? id.split('.').pop() ?? id;
  if (roomName) {
    const rn = roomName.trim().toLowerCase();
    if (rn && n.toLowerCase().startsWith(rn)) n = n.slice(roomName.trim().length);
  }
  n = n.replace(/^[\s·:,_\-–—]+/, '').trim();
  return n || (st?.attributes?.friendly_name as string) || id;
}
