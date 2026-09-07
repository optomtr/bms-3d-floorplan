// ---------------------------------------------------------------------------
// Протечка воды: обнаружение и полноэкранная тревога.
// ---------------------------------------------------------------------------

import { html, nothing } from 'lit';
import type { BmsFloorplanCard } from '../ha-3d-floorplan-card';
import type { RoomInfo } from '../scene/scene-manager';
import { selectRoom } from './scene';
import type { LeakAlarm } from './types';

/** The leak as of the latest state push. Recomputed once per hass object, not
 *  once per render — render runs far more often, and this scans every entity. */
export function currentLeak(host: BmsFloorplanCard): LeakAlarm | null {
  if (host.leakCache && host.leakCache.hass === host.hass) return host.leakCache.leak;
  const leak = detectLeak(host);
  host.leakCache = { hass: host.hass, leak };
  return leak;
}

/** Wet leak sensors, found by HA's own device_class rather than by name — so a
 *  sensor added to the house later starts alarming with nothing to configure
 *  here or in the plan. */
export function detectLeak(host: BmsFloorplanCard): LeakAlarm | null {
  const st = host.hass?.states;
  if (!st) return null;
  const sensors: string[] = [];
  for (const id of Object.keys(st)) {
    if (!id.startsWith('binary_sensor.')) continue;
    if (st[id]?.attributes?.device_class !== 'moisture') continue;
    if (host.effState(id) === 'on') sensors.push(id);
  }
  const valve = waterValve(host);
  // The alarm outlives the puddle. Once the automation has shut the supply it
  // stays up until someone opens it again, so nobody can walk past a panel
  // that looks calm while the house is still without water.
  const shut = !!valve && valveShut(host, valve);
  if (!sensors.length && !shut) return null;
  return { sensors, valve, wet: sensors.length > 0 };
}

/** Shut only on a definite closed state: 'unknown' and 'unavailable' must not
 *  put a full-screen alarm on the wall just because HA hasn't reported yet. */
export function valveShut(host: BmsFloorplanCard, valve: string): boolean {
  const s = host.effState(valve);
  return valve.startsWith('valve.') ? s === 'closed' : s === 'off';
}

/** The shut-off to reopen by hand once the leak is dealt with. Closing it is
 *  the automation's job; this card only ever opens it, and only when the user
 *  taps. With several candidates we offer no button at all rather than one
 *  that might cut the wrong supply. */
export function waterValve(host: BmsFloorplanCard): string | undefined {
  const st = host.hass?.states ?? {};
  const found = Object.keys(st).filter(
    (id) => /^(valve|switch)\./.test(id) && /(water[_a-z0-9]*valve|valve[_a-z0-9]*water)/i.test(id),
  );
  return found.length === 1 ? found[0] : undefined;
}

/** The room a sensor sits in — known only where the plan binds it to one. */
export function roomOfEntity(host: BmsFloorplanCard, id: string): RoomInfo | undefined {
  return host.rooms.find((r) => r.entities.some((e) => e.entity_id === id));
}

/** A leak has to interrupt whatever is on screen, screensaver included, so
 *  this renders above everything and isn't dismissible: it clears when the
 *  sensor dries out, not when someone taps it away. */
export function renderLeakAlert(host: BmsFloorplanCard) {
  const leak = currentLeak(host);
  if (!leak || host.leakAck) return nothing;
  const room = leak.wet ? roomOfEntity(host, leak.sensors[0]) : undefined;
  const names = leak.sensors.map((id) => host.cardName(id)).join(', ');
  const valve = leak.valve;
  const open = valve ? !valveShut(host, valve) : true;
  return html`<div class="leak-alert">
    <button type="button" class="leak-x" title=${host.t('Close')}
      aria-label=${host.tx('Закрыть предупреждение о протечке', 'Dismiss the leak alarm')}
      @click=${() => (host.leakAck = true)}>${host.ic('close')}</button>
    <div class="leak-ic">${host.ic('drop')}</div>
    <div class="leak-title">${leak.wet ? host.t('Water leak!') : host.t('Water is shut off')}</div>
    <div class="leak-sub">
      ${leak.wet
        ? room?.name ? `${room.name} · ${names}` : names
        : host.t('Fix the leak, then open the valve')}
    </div>
    ${leak.wet && !room
      ? html`<div class="leak-hint">${host.t('Place this sensor on the plan to see the room')}</div>`
      : nothing}
    <div class="leak-btns">
      ${room
        ? html`<button type="button" class="leak-b"
            aria-label=${host.tx('Показать комнату с протечкой', 'Show the room with the leak')}
            @click=${() => selectRoom(host, room.key)}>
            ${host.t('Show')}</button>`
        : nothing}
      ${valve
        ? html`<button type="button" class="leak-b primary" ?disabled=${open}
            @click=${() =>
              valve.startsWith('valve.')
                ? host.svc('valve', 'open_valve', {}, valve, 'open')
                : host.svc('switch', 'turn_on', {}, valve, 'on')}>
            ${open ? host.t('Valve is open') : host.t('Open the valve')}</button>`
        : nothing}
    </div>
  </div>`;
}
