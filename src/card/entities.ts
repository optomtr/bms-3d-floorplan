// ---------------------------------------------------------------------------
// Работа со списком сущностей HA: подписи, комнаты, поиск, домофон.
// ---------------------------------------------------------------------------

import type { BmsFloorplanCard } from '../ha-3d-floorplan-card';
import type { FloorPlan, HassEntity } from '../types';
import { modelLabel } from '../furniture/names';
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

/** Ключ комнаты (области HA) сущности: своя area_id, иначе — у её устройства.
 *  Пусто — комната неизвестна (или реестра в hass нет вовсе). */
export function entityAreaId(host: BmsFloorplanCard, id: string): string {
  const h = host.hass as any;
  const ent = h?.entities?.[id];
  const own: string | undefined = ent?.area_id ?? undefined;
  const byDevice: string | undefined = ent?.device_id ? h?.devices?.[ent.device_id]?.area_id : undefined;
  return (own || byDevice || '') as string;
}

/** The HA area (room) an entity belongs to: its own area, else its device's. */
export function entityArea(host: BmsFloorplanCard, id: string): string {
  const areaId = entityAreaId(host, id);
  if (!areaId) return '';
  const a = (host.hass as any)?.areas?.[areaId];
  return (a?.name as string) || '';
}

/** Имя УСТРОЙСТВА, к которому приписана сущность («Гостиная свет»).
 *
 *  Это ключ ко всему списку. У реле каналы в Home Assistant так и называются —
 *  «Канал 1», «Канал 2», — и в трёх разных комнатах имена совпадают буква в
 *  букву. Различает их только имя устройства. */
export function entityDeviceName(host: BmsFloorplanCard, id: string): string {
  const h = host.hass as any;
  const did = h?.entities?.[id]?.device_id;
  const d = did ? h?.devices?.[did] : undefined;
  return String((d?.name_by_user as string) || (d?.name as string) || '').trim();
}

/** Крупная строка списка: «Гостиная свет · Канал 1».
 *  Если имя сущности и так осмысленное (уже содержит имя устройства) — второй
 *  раз его не приписываем. */
export function entityTitle(host: BmsFloorplanCard, id: string): string {
  const name = entityLabel(host, id).trim();
  const dev = entityDeviceName(host, id);
  if (!dev) return name;
  const n = name.toLowerCase();
  const d = dev.toLowerCase();
  if (!n || n === d || n.includes(d)) return name;
  return `${dev} · ${name}`;
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

// ---------------------------------------------------------------------------
// СПИСОК УСТРОЙСТВ ПО КОМНАТАМ.
//
// Плоский список идентификаторов не выбирается руками: в доме их десятки, а
// имена повторяются («Канал 1» есть и в гостиной, и на кухне, и в спальне).
// Здесь тот же набор кандидатов раскладывается по комнатам и обогащается тем,
// что человек обязан видеть: чьё это устройство и не занято ли оно уже.
// ---------------------------------------------------------------------------

/** Раздел для тех, у кого комната неизвестна. Всегда последний. */
export const NO_ROOM = 'Без комнаты';

/** Единственный раздел, когда комнат в Home Assistant нет вовсе: называть его
 *  «Без комнаты» было бы враньём — комнат просто нет. */
export const ALL_ROOM = 'Все устройства';

export interface PickRow {
  id: string;
  /** Крупная строка: устройство и канал. */
  title: string;
  /** Мелкая строка: идентификатор. Пусто — если он уже в крупной. */
  sub: string;
  /** Чем сущность занята на плане, если занята. */
  taken: string | null;
}

export interface PickGroup {
  /** Ключ комнаты (для запоминания «свёрнут/развёрнут»). */
  key: string;
  /** Заголовок раздела. */
  area: string;
  rows: PickRow[];
}

/** Что на плане УЖЕ занято: сущность → чем именно («Люстра», «Люстра · Второй
 *  этаж»). Одну лампу нельзя повесить дважды, и человек обязан видеть это
 *  ДО нажатия, а не после.
 *
 *  `except` — предмет, который сейчас правят: его собственная привязка не
 *  «занята», она выбрана. */
export function planTakenBy(plan: FloorPlan | undefined, except?: string): Map<string, string> {
  const out = new Map<string, string>();
  const floors = plan?.floors ?? [];
  const many = floors.length > 1;
  floors.forEach((fl, i) => {
    const where = many ? ` · ${fl.name || `этаж ${i + 1}`}` : '';
    for (const b of fl.bindings ?? []) {
      const eid = b?.entity_id;
      if (!eid || out.has(eid)) continue;
      if (except && b.anchor_object === except) continue;
      const f = (fl.furniture ?? []).find((x) => !!x.id && x.id === b.anchor_object);
      out.set(eid, `${f ? modelLabel(f.model) : 'план'}${where}`);
    }
    for (const z of fl.zones ?? []) {
      for (const eid of z.entities ?? []) {
        if (eid && !out.has(eid)) out.set(eid, `комната ${z.name || 'без названия'}${where}`);
      }
    }
  });
  return out;
}

/** Кандидаты, разложенные по комнатам. Комнаты — по алфавиту, «Без комнаты» —
 *  всегда последним разделом, а не вперемешку. */
/** Срезает у имени сущности приставку с именем устройства: «Гостиная свет
 *  Канал 1» → «Канал 1», потому что имя устройства уже стоит в заголовке
 *  раздела и повторять его в каждой строке незачем.
 *
 *  Срезаем ТОЛЬКО если остаток читается сам по себе — с заглавной буквы или с
 *  цифры. Иначе «Щит освещения розетки» превратилось бы в «розетки»: обрывок,
 *  который в списке ничего не значит. (Поймано проверкой «без дублей».) */
function stripPrefix(name: string, dev: string): string {
  if (!name || !dev) return name;
  if (!name.toLowerCase().startsWith(dev.toLowerCase())) return name;
  const rest = name.slice(dev.length).replace(/^[\s·\-–—.:]+/, '').trim();
  if (rest.length < 2) return name;
  const head = rest[0];
  return head === head.toUpperCase() && head !== head.toLowerCase() ? rest : /^\d/.test(rest) ? rest : name;
}

export function pickerGroups(
  host: BmsFloorplanCard,
  domains: string[],
  taken?: Map<string, string>,
): { groups: PickGroup[]; fellBack: boolean; total: number } {
  const { ids, fellBack } = candidateEntities(host, domains);
  const by = new Map<string, PickGroup>();
  for (const id of ids) {
    const area = entityArea(host, id);
    // Комната в Home Assistant заполнена далеко не всегда. На живом доме
    // владельца комнаты заведены, но НИ ОДИН из 15 светильников к ним не
    // привязан — ни сама сущность, ни её устройство. Тогда группировать
    // по комнате не по чему, и список снова становится свалкой, ради ухода от
    // которой всё и делалось.
    // Запасная опора — имя устройства: «Гостиная свет · Канал 1», «Кухня свет ·
    // Канал 2». Монтажник мыслит именно устройствами (щит, реле, канал), и
    // такое имя обычно уже несёт комнату.
    const dev = area ? '' : entityDeviceName(host, id);
    const key = area ? entityAreaId(host, id) : dev ? `dev:${dev}` : '';
    let g = by.get(key);
    if (!g) by.set(key, (g = { key, area: area || dev || NO_ROOM, rows: [] }));
    // В разделе-устройстве его имя уже в заголовке — в строке оставляем канал.
    // Home Assistant обычно сам склеивает имя сущности из имени устройства
    // («Гостиная свет Канал 1»), поэтому приставку срезаем, иначе заголовок и
    // строка повторяют друг друга.
    const title = dev ? stripPrefix(entityLabel(host, id).trim(), dev) || id : entityTitle(host, id);
    g.rows.push({ id, title, sub: title.includes(id) ? '' : id, taken: taken?.get(id) ?? null });
  }
  const groups = [...by.values()].sort((a, b) => {
    if (!a.key !== !b.key) return a.key ? -1 : 1; // «Без комнаты» — в конец
    return a.area.localeCompare(b.area, 'ru');
  });
  for (const g of groups) g.rows.sort((a, b) => a.title.localeCompare(b.title, 'ru'));
  if (groups.length === 1 && !groups[0].key) groups[0].area = ALL_ROOM;
  return { groups, fellBack, total: ids.length };
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
