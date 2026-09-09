// ---------------------------------------------------------------------------
// Состояние сущностей: оптимистичные предположения, вызовы служб HA,
// ползунки и групповые выключения.
// ---------------------------------------------------------------------------

import type { BmsFloorplanCard } from '../ha-3d-floorplan-card';
import type { RoomInfo } from '../scene/scene-manager';
import type { HassEntity, HomeAssistant } from '../types';
import { CONTROL_DOMAINS } from './constants';
import { askConfirm } from './dialogs';
import { isOfflineState } from './format';
import { setSceneLanguage } from '../scene/bindings';

/** Устройства нет: Home Assistant его потерял или сущность удалили. Проверяем
 *  по СЫРОМУ hass, а не по effState — тот подставляет 'unknown' и для
 *  удалённой сущности, и для «показания ещё нет». */
export function isEntityOffline(host: BmsFloorplanCard, id: string): boolean {
  if (!host.hass) return false; // hass ещё не пришёл — ничего не утверждаем
  const st = host.hass.states[id];
  if (!st) return true; // сущность удалили из Home Assistant
  return isOfflineState(st.state);
}

/** Написано ли сейчас «Нет связи» прямо на плане (3D). Лезет в приватное поле
 *  менеджера сцены сознательно: снаружи это единственный способ доказать, что
 *  пропавшее устройство ВИДНО, а не просто не светится. */
export function offlineShownInScene(host: BmsFloorplanCard, id: string): boolean {
  const slots = (host.sceneManager as unknown as { slots?: { bindings?: { isOffline?(i: string): boolean } }[] } | undefined)?.slots;
  return (slots ?? []).some((s) => s.bindings?.isOffline?.(id) === true);
}

export function applyHass(host: BmsFloorplanCard, hass: HomeAssistant): void {
  if (!host.sceneManager) return;
  // Язык подписей внутри сцены («Нет связи», «Заперто») — тот же, что у карточки.
  setSceneLanguage(host.isRu);
  // Keep the scene's asset origin current so `/local/...` room photos resolve
  // against Home Assistant (needed on the file:// kiosk).
  host.sceneManager.setImageBase(assetBase(hass));
  // Reconcile optimistic overrides: once HA re-reports an entity (its state
  // object reference changed), the real value is authoritative — drop the
  // override so we don't fight it.
  if (host.optimistic.size && host.lastHass) {
    for (const [id, ov] of [...host.optimistic]) {
      if (hass.states[id] !== host.lastHass.states[id]) {
        clearTimeout(ov.timer);
        host.optimistic.delete(id);
        host.optGen++; // the effective state moved — see homeStats()'s memo key
      }
    }
  }
  // A pending setpoint stands until HA reports OUR value (confirmed) or some
  // other value (changed at the wall unit — that's authoritative). It must
  // NOT clear just because the entity object changed: these thermostats
  // re-report current_temperature long before the target, which would snap
  // the number back to the stale setpoint mid-press.
  if (host.optTemp.size) {
    for (const [id, ov] of [...host.optTemp]) {
      const t = hass.states[id]?.attributes?.temperature;
      if (typeof t !== 'number') continue;
      if (t === ov.temp || t !== ov.base) {
        clearTimeout(ov.timer);
        host.optTemp.delete(id);
      }
    }
  }
  // Same idea for a pending volume: clear once HA reports our value (confirmed)
  // or a different one (changed elsewhere). Speakers report within ~1s, so
  // this hands control back quickly without the number snapping mid-tap.
  if (host.optVol.size) {
    for (const [id, ov] of [...host.optVol]) {
      const v = hass.states[id]?.attributes?.volume_level;
      if (typeof v !== 'number') continue;
      if (Math.abs(v - ov.vol) < 0.005 || v !== ov.base) {
        clearTimeout(ov.timer);
        host.optVol.delete(id);
      }
    }
  }
  host.lastHass = hass;
  pushEffective(host, hass);
  if (host.controlOpen) host.requestUpdate();
}

/** Origin for resolving root-relative asset paths (e.g. a room's `/local/…`
 *  design photo). Same-origin in the HA frontend (returns ''), the HA URL in
 *  the kiosk — read from `hass.hassUrl`, which both surfaces expose. */
export function assetBase(hass?: HomeAssistant): string {
  const h = hass as unknown as { hassUrl?: (p?: string) => string } | undefined;
  if (h?.hassUrl) {
    try {
      return String(h.hassUrl('/')).replace(/\/+$/, '');
    } catch {
      /* fall through to same-origin */
    }
  }
  return '';
}

/** hass with optimistic overrides layered on top (fresh objects for overridden
 *  entities so the scene-diff and Lit both see the change). */
export function effectiveHass(host: BmsFloorplanCard, base: HomeAssistant): HomeAssistant {
  if (!host.optimistic.size) return base;
  const states: Record<string, any> = { ...base.states };
  for (const [id, ov] of host.optimistic) {
    const b = states[id];
    if (!b) continue;
    let ent: any = { ...b, state: ov.state };
    // Position-based covers (curtains) animate from current_position, not the
    // state string — override that too so they slide instantly.
    if (id.startsWith('cover.') && b.attributes && 'current_position' in b.attributes) {
      const pos = ov.state === 'open' ? 100 : ov.state === 'closed' ? 0 : b.attributes.current_position;
      ent = { ...ent, attributes: { ...b.attributes, current_position: pos } };
    }
    states[id] = ent;
  }
  return { ...base, states } as HomeAssistant;
}

/** Push the effective state to the 3D scene, updating only what changed.
 *
 *  Walks ONLY the entities the scene actually reacts to (bindings + room
 *  membership). It used to walk `eff.states` — every entity in the home — on
 *  every single update: with 2000 entities and a handful of them ticking each
 *  second, that is millions of comparisons an hour for a few hundred that can
 *  possibly matter. */
export function pushEffective(host: BmsFloorplanCard, base: HomeAssistant): void {
  if (!host.sceneManager) return;
  const eff = effectiveHass(host, base);
  if (!host.lastPushed) {
    host.sceneManager.syncAll(eff);
  } else {
    const prev = host.lastPushed;
    for (const id of host.sceneManager.trackedEntities()) {
      if (eff.states[id] !== prev.states[id]) host.sceneManager.updateEntity(id, eff);
    }
  }
  host.lastPushed = eff;
}

/** Optimistically assume `state` for an entity until HA confirms (or reverts
 *  after a timeout). Reflects in the popup and the 3D scene immediately. */
export function setOptimistic(host: BmsFloorplanCard, id: string, state: string): number {
  const prev = host.optimistic.get(id);
  if (prev) clearTimeout(prev.timer);
  const gen = ++host.optGen;
  const timer = setTimeout(() => {
    // Only revert if this generation is still the current one.
    if (host.optimistic.get(id)?.gen === gen) clearOptimistic(host, id);
  }, 5000);
  host.optimistic.set(id, { state, timer, gen });
  if (host.hass) pushEffective(host, host.hass);
  host.requestUpdate();
  return gen;
}

export function clearOptimistic(host: BmsFloorplanCard, id: string): void {
  const ov = host.optimistic.get(id);
  if (!ov) return;
  clearTimeout(ov.timer);
  host.optimistic.delete(id);
  host.optGen++; // the effective state moved — see homeStats()'s memo key
  if (host.hass) pushEffective(host, host.hass);
  host.requestUpdate();
}

/** Nudge a climate setpoint by `d` steps: snap to the step grid, clamp to the
 *  device's own min/max, show it at once, then send it. Stepping from the
 *  EFFECTIVE target (not HA's) is what lets ± tap repeatedly — 22 → 23 → 24 —
 *  while HA is still sitting on the old value. */
export function stepTemp(host: BmsFloorplanCard, id: string, ent: HassEntity | undefined, target: number, step: number, d: number): void {
  const inv = step > 0 ? 1 / step : 2;
  let next = Math.round((target + d) * inv) / inv;
  const lo = Number(ent?.attributes?.min_temp);
  const hi = Number(ent?.attributes?.max_temp);
  if (Number.isFinite(lo)) next = Math.max(lo, next);
  if (Number.isFinite(hi)) next = Math.min(hi, next);
  if (next === target) return;
  setOptimisticTemp(host, id, next);
  host.svc('climate', 'set_temperature', { temperature: next }, id);
}

/** The setpoint to show and to step from: the pending one if we have an
 *  unconfirmed set_temperature in flight, else whatever HA reports. */
export function effTarget(host: BmsFloorplanCard, id: string): number | undefined {
  const ov = host.optTemp.get(id);
  if (ov) return ov.temp;
  const v = host.hass?.states[id]?.attributes?.temperature;
  return typeof v === 'number' ? v : undefined;
}

/** Show `temp` as the setpoint until HA catches up (see optTemp). The window
 *  is generous because these thermostats can take far longer than a normal
 *  device to report; if HA never confirms, we fall back to its truth. */
export function setOptimisticTemp(host: BmsFloorplanCard, id: string, temp: number): void {
  const prev = host.optTemp.get(id);
  if (prev) clearTimeout(prev.timer);
  const base = host.hass?.states[id]?.attributes?.temperature;
  const timer = setTimeout(() => {
    host.optTemp.delete(id);
    host.requestUpdate();
  }, 60000);
  host.optTemp.set(id, { temp, base: typeof base === 'number' ? base : undefined, timer });
  host.requestUpdate();
}

/** Set a light's colour temperature from a 0..100 slider (0 = warm, 100 = cold). */
export function setLightCT(host: BmsFloorplanCard, id: string, pct: number): void {
  const a = host.hass?.states[id]?.attributes ?? {};
  const minK = Number(a.min_color_temp_kelvin) || 2200;
  const maxK = Number(a.max_color_temp_kelvin) || 6500;
  const kelvin = Math.round(minK + ((maxK - minK) * pct) / 100);
  host.svc('light', 'turn_on', { color_temp_kelvin: kelvin }, id, 'on');
}

/** Whether a light exposes colour-temperature control. */
export function lightSupportsCT(host: BmsFloorplanCard, id: string): boolean {
  const a = host.hass?.states[id]?.attributes ?? {};
  const modes: string[] = a.supported_color_modes ?? [];
  return modes.includes('color_temp') || a.color_temp_kelvin != null || a.min_color_temp_kelvin != null;
}

/** Whether a light can be dimmed. On/off-only lights (['onoff']) return false,
 *  so no bogus brightness slider is shown for them. */
export function lightSupportsBrightness(host: BmsFloorplanCard, id: string): boolean {
  const a = host.hass?.states[id]?.attributes ?? {};
  const modes: string[] = a.supported_color_modes ?? [];
  return (
    modes.some((m) => ['brightness', 'color_temp', 'hs', 'rgb', 'xy', 'rgbw', 'rgbww'].includes(m)) ||
    a.brightness != null
  );
}

/** Call a HA service for an entity in the control popup. When `optimisticState`
 *  is given we assume that result immediately (fast UI) and revert if the call
 *  rejects or HA never confirms. */
export function callService(host: BmsFloorplanCard, domain: string, service: string, data: Record<string, any> = {}, entityId?: string, optimisticState?: string): void {
  if (!host.hass) return;
  // The plan is DATA: it names the entities, and the domain above comes
  // straight out of it. Anything outside CONTROL_DOMAINS is shown read-only
  // rather than called, so a tampered (or careless) plan cannot turn a tap on
  // a sofa into `script.…` / `automation.…`.
  if (!CONTROL_DOMAINS.has(domain) || (entityId && !host.canControl(entityId))) {
    host.showToast(
      host.tx(`Только просмотр: ${entityId ?? domain}`, `Read-only: ${entityId ?? domain}`),
    );
    return;
  }
  // Устройства нет — команду отправлять некому. Молча «выполнить» её значило бы
  // показать человеку выключенный свет и уверенность, что всё в порядке.
  if (entityId && isEntityOffline(host, entityId)) {
    host.showToast(
      host.tx(
        `Устройство недоступно: ${host.cardName(entityId)}. Проверьте питание и связь.`,
        `Device unavailable: ${host.cardName(entityId)}. Check its power and connection.`,
      ),
    );
    return;
  }
  const gen = entityId && optimisticState !== undefined ? setOptimistic(host, entityId, optimisticState) : -1;
  // Revert only if OUR override is still the current one (a newer re-tap wins).
  const revertIfCurrent = () => {
    if (entityId && gen >= 0 && host.optimistic.get(entityId)?.gen === gen) clearOptimistic(host, entityId);
  };
  try {
    const p: any = host.hass.callService(domain, service, {
      ...(entityId ? { entity_id: entityId } : {}),
      ...data,
    });
    if (gen >= 0 && p && typeof p.catch === 'function') p.catch(revertIfCurrent);
  } catch {
    revertIfCurrent();
  }
}

/** True when this entity belongs to a domain the card may actually control.
 *  Everything else is rendered as information only. */
export function isControllable(id: string): boolean {
  return CONTROL_DOMAINS.has(id.split('.')[0]);
}

/** Lock/unlock, asking first before UNLOCKING. In view mode a lock card is one
 *  tap away on a wall tablet in the hallway, so "open the front door" must not
 *  be something a guest does by brushing the screen. Locking is safe and needs
 *  no confirmation. */
export async function lockAction(host: BmsFloorplanCard, id: string, service: 'lock' | 'unlock'): Promise<void> {
  if (!host.canControl(id)) {
    host.showToast(host.tx(`Только просмотр: ${id}`, `Read-only: ${id}`));
    return;
  }
  // Спрашивать «Открыть замок?» у замка, которого нет в сети, — обман: ответа
  // «да» он всё равно не услышит.
  if (isEntityOffline(host, id)) {
    host.showToast(host.tx(
      `Замок недоступен: ${host.cardName(id)}. Проверьте питание и связь.`,
      `Lock unavailable: ${host.cardName(id)}. Check its power and connection.`,
    ));
    return;
  }
  if (service === 'unlock') {
    const ok = await askConfirm(host, 
      host.tx('Открыть замок?', 'Unlock?'),
      host.tx(
        `«${host.cardName(id)}» будет открыт для всех, кто рядом.`,
        `"${host.cardName(id)}" will be unlocked for anyone nearby.`,
      ),
      host.tx('Открыть', 'Unlock'),
    );
    if (!ok) return;
  }
  host.svc('lock', service, {}, id, service === 'lock' ? 'locked' : 'unlocked');
}

/** The intercom's "Открыть дверь" button — same reasoning as an unlock. */
export async function intercomOpenDoor(host: BmsFloorplanCard, id: string): Promise<void> {
  if (!host.canControl(id)) {
    host.showToast(host.tx(`Только просмотр: ${id}`, `Read-only: ${id}`));
    return;
  }
  if (isEntityOffline(host, id)) {
    host.showToast(host.tx(
      `Домофон недоступен: ${host.cardName(id)}. Проверьте питание и связь.`,
      `Intercom unavailable: ${host.cardName(id)}. Check its power and connection.`,
    ));
    return;
  }
  const ok = await askConfirm(host, 
    host.tx('Открыть дверь?', 'Open the door?'),
    host.tx(
      'Дверь откроется сразу. У планшета может стоять кто угодно.',
      'The door opens immediately — anyone could be standing at the tablet.',
    ),
    host.tx('Открыть', 'Open'),
  );
  if (ok) host.svc('button', 'press', {}, id);
}

/** Effective (optimistic-aware) state of an entity, for rendering controls. */
export function effectiveState(host: BmsFloorplanCard, id: string): string {
  return host.optimistic.get(id)?.state ?? host.hass?.states[id]?.state ?? 'unknown';
}

/** Toggle every device in a category at once: if any is on → all off, else all
 *  on (optimistic + revert-on-fail, like the individual controls). */
export function toggleAll(host: BmsFloorplanCard, ents0: { entity_id: string; behavior: string }[]): void {
  // `homeassistant.turn_on` takes an arbitrary entity list and would happily
  // start a script or an automation, so the list is filtered down to the
  // domains this card controls before it is sent (see CONTROL_DOMAINS).
  // Недоступное устройство из списка тоже убираем: команда до него не дойдёт,
  // а «включили всё» человек прочитает как «всё включилось».
  const ents = ents0.filter((e) => host.canControl(e.entity_id) && !isEntityOffline(host, e.entity_id));
  if (!host.hass || !ents.length) return;
  const anyOn = ents.some((e) => host.effState(e.entity_id) === 'on');
  const service = anyOn ? 'turn_off' : 'turn_on';
  const optState = anyOn ? 'off' : 'on';
  const ids = ents.map((e) => e.entity_id);
  const gens = ids.map((id) => setOptimistic(host, id, optState));
  const revert = () =>
    ids.forEach((id, i) => {
      if (host.optimistic.get(id)?.gen === gens[i]) clearOptimistic(host, id);
    });
  try {
    const p: any = host.hass.callService('homeassistant', service, { entity_id: ids });
    if (p && typeof p.catch === 'function') p.catch(revert);
  } catch {
    revert();
  }
}

/** Slider pointer-drag: live visual via dragValue, throttled service calls. */
export function onSliderDown(host: BmsFloorplanCard, e: PointerEvent, id: string, cb: (pct: number) => void): void {
  if (e.cancelable) e.preventDefault();
  const track = e.currentTarget as HTMLElement;
  const rect = track.getBoundingClientRect();
  let lastSent = -1;
  let lastAt = 0;
  const apply = (clientX: number, force: boolean) => {
    const p = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const pct = Math.round(p * 100);
    host.dragEntity = id;
    host.dragValue = pct;
    host.requestUpdate();
    const t = performance.now();
    if (force || (pct !== lastSent && t - lastAt > 110)) {
      lastSent = pct;
      lastAt = t;
      cb(pct);
    }
  };
  apply(e.clientX, false);
  const mv = (ev: PointerEvent) => apply(ev.clientX, false);
  const up = (ev: PointerEvent) => {
    apply(ev.clientX, true); // always deliver the final value
    window.removeEventListener('pointermove', mv);
    window.removeEventListener('pointerup', up);
    host.dragEntity = null;
    host.requestUpdate();
  };
  window.addEventListener('pointermove', mv);
  window.addEventListener('pointerup', up);
}

/** 0..100 slider value: the live drag value while dragging, else `real`. */
export function sliderValue(host: BmsFloorplanCard, id: string, real: number): number {
  return host.dragEntity === id ? host.dragValue : real;
}

/** The volume to show and to step from: the pending one if a set is in flight,
 *  else HA's. Lets ± tap repeatedly (0.40 → 0.45 → 0.50) while HA still sits on
 *  the old value, and keeps the % live. */
export function effVol(host: BmsFloorplanCard, id: string): number {
  const ov = host.optVol.get(id);
  if (ov) return ov.vol;
  const v = host.hass?.states[id]?.attributes?.volume_level;
  return typeof v === 'number' ? v : 0;
}

/** Show `vol` (0..1) for `id` until HA catches up (see optVol reconcile). */
export function setOptimisticVol(host: BmsFloorplanCard, id: string, vol: number): void {
  const prev = host.optVol.get(id);
  if (prev) clearTimeout(prev.timer);
  const base = host.hass?.states[id]?.attributes?.volume_level;
  const timer = setTimeout(() => {
    host.optVol.delete(id);
    host.requestUpdate();
  }, 4000);
  host.optVol.set(id, { vol, base: typeof base === 'number' ? base : undefined, timer });
  host.requestUpdate();
}

/** The speakers a volume nudge should move: the whole HA group when this one is
 *  grouped, so ± drives them as ONE volume; otherwise just this speaker. */
export function volTargets(host: BmsFloorplanCard, id: string, ent: HassEntity | undefined): string[] {
  const g = ent?.attributes?.group_members as string[] | undefined;
  if (g && g.length > 1) return g.filter((m) => host.hass?.states[m]);
  return [id];
}

/** Nudge volume by ±5%. Absolute volume_set (not volume_up/down) so it lands
 *  in one call — instant via the optimistic %, and the only way to hold a group
 *  in lockstep. Every group member gets the SAME level, so a synced pair reads
 *  as one control. Falls back to relative stepping for a lone device that has
 *  STEP but not SET (some TVs), where an absolute level isn't available. */
export function mediaVolStep(host: BmsFloorplanCard, id: string, ent: HassEntity | undefined, volStep: boolean, dir: number): void {
  const targets = volTargets(host, id, ent);
  const canSet = (m: string) =>
    (Number(host.hass?.states[m]?.attributes?.supported_features) || 0) & 4;
  if (targets.every(canSet)) {
    const cur = effVol(host, id);
    const next = Math.round(Math.max(0, Math.min(1, cur + dir * 0.05)) * 100) / 100;
    if (next === Math.round(cur * 100) / 100) return; // already at the rail
    for (const m of targets) {
      setOptimisticVol(host, m, next);
      host.svc('media_player', 'volume_set', { volume_level: next }, m);
    }
    return;
  }
  if (volStep) host.svc('media_player', dir > 0 ? 'volume_up' : 'volume_down', {}, id);
}

/** Master "turn everything off": lights + switches off, media paused. */
export function onRoomAllOff(host: BmsFloorplanCard, room: RoomInfo): void {
  if (!host.hass) return;
  const offIds = room.entities
    .filter((e) => ['light', 'switch', 'input_boolean', 'fan'].includes(e.behavior))
    .map((e) => e.entity_id)
    // `homeassistant.turn_off` would also stop a script / disable an
    // automation — keep the bulk list inside CONTROL_DOMAINS.
    .filter((id) => host.canControl(id) && host.effState(id) === 'on');
  if (offIds.length) {
    const gens = offIds.map((id) => setOptimistic(host, id, 'off'));
    const revert = () => offIds.forEach((id, i) => { if (host.optimistic.get(id)?.gen === gens[i]) clearOptimistic(host, id); });
    try {
      const p: any = host.hass.callService('homeassistant', 'turn_off', { entity_id: offIds });
      if (p && typeof p.catch === 'function') p.catch(revert);
    } catch {
      revert();
    }
  }
  for (const e of room.entities) {
    if (e.behavior !== 'media_player') continue;
    const s = host.effState(e.entity_id);
    if (!['off', 'paused', 'idle', 'standby', 'unavailable', 'unknown'].includes(s)) {
      host.svc('media_player', 'media_pause', {}, e.entity_id, 'paused');
    }
  }
}

/** Master "everything off" across the whole home (overview). */
export function allOffHouse(host: BmsFloorplanCard): void {
  if (!host.hass) return;
  // "All off" turns off everything EXCEPT the TV and heating (warm floor /
  // radiators). Only two categories need a keep/off split — climate and media:
  //   climate → turn off anything that can COOL (an AC); keep heat-only units.
  //   media   → pause speakers; keep the TV.
  // Lights, switches, input_booleans and fans are always turned off.
  const offIds: string[] = [];
  const seen = new Set<string>();
  for (const room of host.rooms) {
    for (const e of room.entities) {
      if (seen.has(e.entity_id)) continue;
      seen.add(e.entity_id);
      // Same reasoning as onRoomAllOff: never sweep an entity this card is
      // not allowed to control into `homeassistant.turn_off`.
      if (!host.canControl(e.entity_id)) continue;
      if (isEntityOffline(host, e.entity_id)) continue; // до пропавшего не дозвониться
      const attrs = host.hass.states[e.entity_id]?.attributes ?? {};
      if (['light', 'switch', 'input_boolean', 'fan'].includes(e.behavior)) {
        if (host.effState(e.entity_id) === 'on') offIds.push(e.entity_id);
      } else if (e.behavior === 'media_player') {
        if (attrs.device_class === 'tv') continue; // keep the TV
        const s = host.effState(e.entity_id);
        if (!['off', 'paused', 'idle', 'standby', 'unavailable', 'unknown'].includes(s)) {
          host.svc('media_player', 'media_pause', {}, e.entity_id, 'paused');
        }
      } else if (e.behavior === 'climate') {
        // Heat-only (modes ⊆ {off, heat}) = warm floor / radiator → keep.
        // Anything that can cool (cool/heat_cool/dry/fan_only/auto) = AC → off.
        const modes: string[] = attrs.hvac_modes ?? [];
        const heatOnly = modes.length > 0 && modes.every((m) => m === 'off' || m === 'heat');
        if (!heatOnly && host.effState(e.entity_id) !== 'off') {
          host.svc('climate', 'set_hvac_mode', { hvac_mode: 'off' }, e.entity_id, 'off');
        }
      }
    }
  }
  if (offIds.length) {
    const gens = offIds.map((id) => setOptimistic(host, id, 'off'));
    const revert = () => offIds.forEach((id, i) => { if (host.optimistic.get(id)?.gen === gens[i]) clearOptimistic(host, id); });
    try {
      const p: any = host.hass.callService('homeassistant', 'turn_off', { entity_id: offIds });
      if (p && typeof p.catch === 'function') p.catch(revert);
    } catch {
      revert();
    }
  }
}

/** Массово включить или ВЫКЛЮЧИТЬ названный список — без «переключить».
 *
 *  toggleAll() решает за человека: «если хоть что-то горит — гасим, иначе
 *  включаем». Панели «Мастер» этого мало: там две РАЗНЫЕ кнопки, и каждая
 *  обязана делать ровно то, что на ней написано, даже когда полдома уже в
 *  нужном состоянии.
 *
 *  Список фильтруется так же, как в toggleAll: `homeassistant.turn_off` увёл
 *  бы в выключение и `script.*`, и `automation.*`, поэтому наружу уходят
 *  только разрешённые домены (CONTROL_DOMAINS) и только те устройства, что на
 *  связи — до пропавшего команда не дойдёт, а человек прочитает «выключено»
 *  как «выключилось». */
export function setAll(host: BmsFloorplanCard, ids0: string[], on: boolean): void {
  const ids = ids0.filter((id) => host.canControl(id) && !isEntityOffline(host, id));
  if (!host.hass || !ids.length) return;
  const optState = on ? 'on' : 'off';
  const gens = ids.map((id) => setOptimistic(host, id, optState));
  const revert = () =>
    ids.forEach((id, i) => {
      if (host.optimistic.get(id)?.gen === gens[i]) clearOptimistic(host, id);
    });
  try {
    const p: any = host.hass.callService('homeassistant', on ? 'turn_on' : 'turn_off', { entity_id: ids });
    if (p && typeof p.catch === 'function') p.catch(revert);
  } catch {
    revert();
  }
}
