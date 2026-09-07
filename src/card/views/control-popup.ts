// ---------------------------------------------------------------------------
// Поп-ап управления по тапу в 3D: устройство или комната.
// ---------------------------------------------------------------------------

import type { BmsFloorplanCard } from '../../ha-3d-floorplan-card';
import { climateModeIconName } from '../../scene/icons';
import { DEVICE_CATEGORIES } from '../constants';
import { climateStep } from '../format';
import { closeControl } from '../scene';
import { effTarget, lockAction, stepTemp } from '../state';
import { html, nothing } from 'lit';

/** View-mode control popup: a list of the tapped (+ nearby) entities, each
 *  with domain-appropriate controls / a mini remote. */
export function renderControlPopup(host: BmsFloorplanCard) {
  if (host.controlRoom) return renderRoomPopup(host);
  const hass = host.hass;
  const ids = host.controlEntities.filter((id) => hass?.states[id]);
  if (!hass || !ids.length) return nothing;
  const [x] = host.controlPos;
  return html`
    <div class="control-backdrop" @click=${() => closeControl(host)}></div>
    <div class="control-popup" style="left:${x}px"
      @click=${(e: Event) => e.stopPropagation()}>
      <div class="control-head">
        <span>${ids.length > 1 ? `${ids.length} ${host.t('devices')}` : ''}</span>
        <button type="button" class="ctl close" @click=${() => closeControl(host)}>✕</button>
      </div>
      ${ids.map((id) => renderEntityControl(host, id))}
    </div>
  `;
}

/** Room marker popup: pick a category (Lights/Climate/Curtains…), then control
 *  every device of that kind in the room — like the AC remote, per room. */
export function renderRoomPopup(host: BmsFloorplanCard) {
  const room = host.controlRoom;
  const hass = host.hass;
  if (!room || !hass) return nothing;
  const present = room.entities.filter((e) => hass.states[e.entity_id]);
  const cats = DEVICE_CATEGORIES.map((c) => ({
    ...c,
    ents: present.filter((e) => c.behaviors.includes(e.behavior)),
  })).filter((c) => c.ents.length);
// Any device whose behavior matches no category still needs to be reachable.
  const categorized = new Set(DEVICE_CATEGORIES.flatMap((c) => c.behaviors));
  const otherEnts = present.filter((e) => !categorized.has(e.behavior));
  if (otherEnts.length) cats.push({ key: 'other', label: 'Other', icon: 'dot', behaviors: [], ents: otherEnts });
  const [x] = host.controlPos;
  const active = host.controlCategory ? cats.find((c) => c.key === host.controlCategory) : null;
  return html`
    <div class="control-backdrop" @click=${() => closeControl(host)}></div>
    <div class="control-popup" style="left:${x}px"
      @click=${(e: Event) => e.stopPropagation()}>
      <div class="control-head">
        <span>${active
          ? html`<button type="button" class="ctl back" title="Back"
              @click=${() => (host.controlCategory = null)}>${host.ic('chevUp')}</button> ${host.t(active.label)}`
          : room.name || host.t('Room')}</span>
        <button type="button" class="ctl close" @click=${() => closeControl(host)}>✕</button>
      </div>
      ${active
        ? html`${active.key === 'lights'
              ? (() => {
                  const anyOn = active.ents.some((e) => host.effState(e.entity_id) === 'on');
                  return html`<div class="control-row">
                    <span class="control-name">${host.t(anyOn ? 'All off' : 'All on')}</span>
                    <div class="control-ctls">
                      <button type="button" class="ctl big ${anyOn ? 'on' : ''}" title="Toggle all"
                        @click=${() => host.onToggleAll(active.ents)}>${host.ic('power')}</button>
                    </div>
                  </div>`;
                })()
              : nothing}
            ${active.ents.map((e) => renderEntityControl(host, e.entity_id))}`
        : cats.length
          ? html`<div class="cat-grid">
              ${cats.map(
                (c) => html`<button type="button" class="cat-btn" @click=${() => (host.controlCategory = c.key)}>
                  ${host.ic(c.icon)}<span>${host.t(c.label)}</span><small>${c.ents.length}</small>
                </button>`,
              )}
            </div>`
          : html`<span class="hint">${host.t('No controllable devices')}</span>`}
    </div>
  `;
}

export function renderEntityControl(host: BmsFloorplanCard, id: string) {
  const hass = host.hass!;
  const ent = hass.states[id];
  const domain = id.split('.')[0];
  const state = host.effState(id); // optimistic-aware
  const name = ent?.attributes?.friendly_name ?? id;
  const on = state === 'on' || state === 'open' || state === 'playing' || state === 'home' || state === 'unlocked';
  let controls;
  if (domain === 'light' || domain === 'switch' || domain === 'fan' || domain === 'input_boolean') {
    controls = html`<button type="button" class="ctl big ${on ? 'on' : ''}" title="Toggle"
      @click=${() => host.svc(domain, 'toggle', {}, id, on ? 'off' : 'on')}>${host.ic('power')}</button>`;
  } else if (domain === 'cover') {
    controls = html`
      <button type="button" class="ctl" title="Open" @click=${() => host.svc('cover', 'open_cover', {}, id, 'open')}>${host.ic('chevUp')}</button>
      <button type="button" class="ctl" title="Stop" @click=${() => host.svc('cover', 'stop_cover', {}, id)}>${host.ic('stop')}</button>
      <button type="button" class="ctl" title="Close" @click=${() => host.svc('cover', 'close_cover', {}, id, 'closed')}>${host.ic('chevDown')}</button>`;
  } else if (domain === 'lock') {
    controls = html`<button type="button" class="ctl ${on ? '' : 'on'}" title=${on ? 'Lock' : 'Unlock'}
      @click=${() => lockAction(host, id, on ? 'lock' : 'unlock')}>${host.ic(on ? 'lockOpen' : 'lockClosed')}</button>`;
  } else if (domain === 'climate') {
    // Compact AC remote: temperature ± and the HVAC mode chips, inline.
    const target = effTarget(host, id);
    const cur = ent?.attributes?.current_temperature as number | undefined;
    const step = climateStep(ent);
    const modes: string[] = ent?.attributes?.hvac_modes ?? ['off', 'cool', 'heat', 'auto'];
    const setTemp = (d: number) => {
      if (typeof target === 'number') stepTemp(host, id, ent, target, step, d);
    };
    controls = html`<div class="ctl-col">
      <div class="ctl-row">
        <button type="button" class="ctl" title="Cooler" @click=${() => setTemp(-step)}>${host.ic('minus')}</button>
        <span class="ctl-temp">${target != null ? `${target}°` : '—'}${cur != null
          ? html`<small> · ${cur}°</small>`
          : nothing}</span>
        <button type="button" class="ctl" title="Warmer" @click=${() => setTemp(step)}>${host.ic('plus')}</button>
      </div>
      <div class="ctl-row wrap">
        ${modes.map((m) => {
          const icon = climateModeIconName(m);
          return html`<button type="button" class="ctl ${state === m ? 'on' : ''}" title=${m}
            @click=${() => host.svc('climate', 'set_hvac_mode', { hvac_mode: m }, id, m)}>${icon
            ? host.ic(icon)
            : m}</button>`;
        })}
      </div>
    </div>`;
  } else if (domain === 'media_player') {
    // Compact TV remote: power + volume only (no transport — per request).
    const muted = !!ent?.attributes?.is_volume_muted;
    // "On" for a media player = anything that isn't a clear off/unknown state
    // (playing, paused, idle and buffering all mean the device is powered).
    const mpOn = !['off', 'standby', 'unavailable', 'unknown'].includes(state);
    controls = html`<div class="ctl-row">
      <button type="button" class="ctl ${mpOn ? 'on' : ''}" title="Power" @click=${() => host.svc('media_player', 'toggle', {}, id, mpOn ? 'off' : 'playing')}>${host.ic('power')}</button>
      <button type="button" class="ctl" title="Volume down" @click=${() => host.svc('media_player', 'volume_down', {}, id)}>${host.ic('volDown')}</button>
      <button type="button" class="ctl ${muted ? 'on' : ''}" title="Mute" @click=${() => host.svc('media_player', 'volume_mute', { is_volume_muted: !muted }, id)}>${host.ic('mute')}</button>
      <button type="button" class="ctl" title="Volume up" @click=${() => host.svc('media_player', 'volume_up', {}, id)}>${host.ic('volUp')}</button>
    </div>`;
  } else {
    controls = html`<span class="ctl-state">${state}${ent?.attributes?.unit_of_measurement ?? ''}</span>`;
  }
  return html`<div class="control-row">
    <span class="control-name" title=${id}>${name}</span>
    <div class="control-ctls">${controls}</div>
  </div>`;
}
