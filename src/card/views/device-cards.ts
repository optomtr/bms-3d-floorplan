// ---------------------------------------------------------------------------
// Карточки устройств в панели комнаты.
// ---------------------------------------------------------------------------

import type { BmsFloorplanCard } from '../../ha-3d-floorplan-card';
import { climateModeIconName } from '../../scene/icons';
import { climateStep } from '../format';
import { climateModeLabel } from '../i18n';
import { effTarget, effVol, intercomOpenDoor, lightSupportsBrightness, lightSupportsCT, lockAction, mediaVolStep, onSliderDown, setLightCT, sliderValue, stepTemp } from '../state';
import type { IntercomGroup } from '../types';
import { html, nothing } from 'lit';

/** One card for the whole intercom: Просмотр(Звук) + Открыть
 *  дверь. The live two-way CALL is intentionally left to the integration's own
 *  auto pop-up (it needs the HTTPS mic window and appears on any dashboard);
 *  here it's just "peek at the door + open it", per the agreed design. */
export function renderIntercomCard(host: BmsFloorplanCard, g: IntercomGroup) {
  const st = host.hass!.states;
  const viewing = host.effState(g.prosmotr) === 'on';
  const callState = st[g.vyzov]?.attributes?.call_state;
  const ringing = callState === 'ringing' || (callState == null && host.effState(g.vyzov) === 'on');
  const sub = ringing ? host.t('Ringing') : viewing ? host.t('Viewing') : host.t('Idle');
  return html`<div class="card intercom ${ringing ? 'ring' : ''}">
    <div class="crow">
      <div class="cicon ${ringing || viewing ? 'lit' : ''}">${host.ic('camera')}</div>
      <div class="cgrow">
        <div class="clabel">${host.cardName(g.camera ?? g.vyzov, host.t('Intercom'))}</div>
        <div class="csub">${sub}</div>
      </div>
    </div>
    <div class="qbtns intercom-btns">
      <button type="button" class="qb ${viewing ? 'on' : ''}"
        @click=${() => host.svc('switch', viewing ? 'turn_off' : 'turn_on', {}, g.prosmotr, viewing ? 'off' : 'on')}>
        <span class="qb-ic">${host.ic('eye')}</span><span>${host.t('View')}</span></button>
      ${g.open
        ? html`<button type="button" class="qb primary"
            @click=${() => intercomOpenDoor(host, g.open!)}>
            <span class="qb-ic">${host.ic('doorOpen')}</span><span>${host.t('Open door')}</span></button>`
        : nothing}
    </div>
  </div>`;
}

/** A room's lights: a header (count on + master all-toggle) over a wrapping
 *  grid of per-light tiles, so each light is controlled individually. The
 *  brightness/colour-temp sliders only appear when a light is actually dimmable
 *  (on/off-only lights don't get a slider that snaps back to 100%). */
export function renderLightCard(host: BmsFloorplanCard, ids: string[]) {
  const onCount = ids.filter((id) => host.effState(id) === 'on').length;
  const anyOn = onCount > 0;
  const dimIds = ids.filter((id) => lightSupportsBrightness(host, id));
  const dimmable = dimIds.length > 0;
  const repId = dimIds.find((id) => host.effState(id) === 'on') ?? dimIds[0];
  const rawBri = repId ? host.hass?.states[repId]?.attributes?.brightness : undefined;
  const briReal = rawBri != null ? Math.round((rawBri / 255) * 100) : 100;
  const briKey = ids[0];
  const bri = sliderValue(host, briKey, briReal);
  const setAllBri = (p: number) => { for (const id of dimIds) host.svc('light', 'turn_on', { brightness_pct: p }, id, 'on'); };
// Colour temperature (warm↔cold) from the lights that expose it.
  const ctIds = ids.filter((id) => lightSupportsCT(host, id));
  const ctRep = ctIds.find((id) => host.effState(id) === 'on') ?? ctIds[0];
  const a = ctRep ? host.hass?.states[ctRep]?.attributes ?? {} : {};
  const minK = Number(a.min_color_temp_kelvin) || 2200;
  const maxK = Number(a.max_color_temp_kelvin) || 6500;
  const curK = Number(a.color_temp_kelvin);
  const ctReal = Number.isFinite(curK) ? Math.round(((curK - minK) / (maxK - minK)) * 100) : 50;
  const ctKey = `${ids[0]}#ct`;
  const ct = sliderValue(host, ctKey, Math.max(0, Math.min(100, ctReal)));
  const setAllCT = (p: number) => { for (const id of ctIds) setLightCT(host, id, p); };
  return html`<div class="card lights ${anyOn ? 'on' : ''}">
    <div class="crow">
      <div class="cicon ${anyOn ? 'lit' : ''}">${host.ic('bulb')}</div>
      <div class="cgrow">
        <div class="clabel">${host.t('Light')}</div>
        <div class="csub">${onCount} / ${ids.length}${anyOn && dimmable ? ` · ${bri}%` : ''}</div>
      </div>
      <button type="button" class="sw ${anyOn ? 'on' : ''}" title="Toggle all"
        @click=${() => host.onToggleAll(ids.map((id) => ({ entity_id: id, behavior: 'light' })))}><span class="sw-k"></span></button>
    </div>
    ${ids.length > 1
      ? html`<div class="lgrid">
          ${ids.map((id) => {
            const lon = host.effState(id) === 'on';
            return html`<button type="button" class="ltile ${lon ? 'on' : ''}" title=${host.cardName(id)}
              @click=${() => host.svc(id.split('.')[0], 'toggle', {}, id, lon ? 'off' : 'on')}>
              <span class="lti ${lon ? 'lit' : ''}">${host.ic('bulb')}</span>
              <span class="ltn">${host.cardName(id)}</span>
            </button>`;
          })}
        </div>`
      : nothing}
    ${anyOn && dimmable
      ? html`<div class="slider" @pointerdown=${(e: PointerEvent) => onSliderDown(host, e, briKey, setAllBri)}>
            <div class="slider-fill" style="width:${bri}%"></div>
            <div class="slider-lab"><span>${host.t('Brightness')}</span><span>${bri}%</span></div>
          </div>
          ${ctIds.length
            ? html`<div class="ctwrap">
                <div class="ctlab"><span>${host.t('Warm')}</span><span>${host.t('Cool')}</span></div>
                <div class="cttrack" @pointerdown=${(e: PointerEvent) => onSliderDown(host, e, ctKey, setAllCT)}>
                  <div class="ctthumb" style="left:${ct}%"></div>
                </div>
              </div>`
            : nothing}`
      : nothing}
  </div>`;
}

export function renderToggleCard(host: BmsFloorplanCard, id: string, icon: string) {
  const on = host.effState(id) === 'on';
  const domain = id.split('.')[0];
  return html`<div class="card ${on ? 'on' : ''}">
    <div class="crow">
      <div class="cicon ${on ? 'lit' : ''}">${host.ic(icon)}</div>
      <div class="cgrow">
        <div class="clabel">${host.cardName(id)}</div>
        <div class="csub">${on ? host.t('On') : host.t('Off')}</div>
      </div>
      <button type="button" class="sw ${on ? 'on' : ''}" title="Toggle"
        @click=${() => host.svc(domain, 'toggle', {}, id, on ? 'off' : 'on')}><span class="sw-k"></span></button>
    </div>
  </div>`;
}

/** Fan card: on/off toggle + a speed row. Preset-mode fans (e.g. 25/50/75/100)
 *  show their presets as buttons; percentage fans show N even steps. */
export function renderFanCard(host: BmsFloorplanCard, id: string) {
  const on = host.effState(id) === 'on';
  const a = host.hass?.states[id]?.attributes ?? {};
  const presets = (a.preset_modes as string[] | undefined) ?? [];
  const curPreset = a.preset_mode as string | undefined;
  const pct = a.percentage as number | undefined;
  const step = a.percentage_step as number | undefined;
  const count = step && step > 0 ? Math.round(100 / step) : 0;
  const pcts = count > 1 && count <= 8
    ? Array.from({ length: count }, (_, i) => Math.round(((i + 1) / count) * 100))
    : [];
  const sub = !on ? host.t('Off') : (curPreset ?? (pct != null ? `${pct}%` : host.t('On')));
  return html`<div class="card ${on ? 'on' : ''}">
    <div class="crow">
      <div class="cicon ${on ? 'lit' : ''}">${host.ic('fan')}</div>
      <div class="cgrow">
        <div class="clabel">${host.cardName(id)}</div>
        <div class="csub">${sub}</div>
      </div>
      <button type="button" class="sw ${on ? 'on' : ''}" title="Toggle"
        @click=${() => host.svc('fan', 'toggle', {}, id, on ? 'off' : 'on')}><span class="sw-k"></span></button>
    </div>
    ${presets.length
      ? html`<div class="seg fan">
          ${presets.map((p) => html`<button type="button" class="segb ${curPreset === p ? 'on' : ''}"
            @click=${() => host.svc('fan', 'set_preset_mode', { preset_mode: p }, id)}>${p}</button>`)}
        </div>`
      : pcts.length
        ? html`<div class="seg fan">
            ${pcts.map((p) => html`<button type="button" class="segb ${pct === p ? 'on' : ''}"
              @click=${() => host.svc('fan', 'set_percentage', { percentage: p }, id)}>${p}%</button>`)}
          </div>`
        : nothing}
  </div>`;
}

export function renderClimateCard(host: BmsFloorplanCard, id: string) {
  const ent = host.hass!.states[id];
  const mode = host.effState(id);
  const on = mode !== 'off' && mode !== 'unavailable' && mode !== 'unknown';
  const target = effTarget(host, id);
  const step = climateStep(ent);
  const setTemp = (d: number) => {
    if (typeof target !== 'number') return;
    stepTemp(host, id, ent, target, step, d);
  };
  const cur = ent?.attributes?.current_temperature as number | undefined;
// The setpoint shows in the stepper and the mode in the segments below, so
// the sub carries the measured room temperature ("22,5° сейчас").
  const curStr = cur != null ? Number(cur).toLocaleString(host.uiLocale, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : null;
  const sub = on ? (curStr != null ? `${curStr}° ${host.t('now')}` : climateModeLabel(host, mode)) : host.t('Off');
// Only offer the modes the device actually supports — sending an unsupported
// mode (e.g. heat_cool / heat to a cool-only AC) errors in HA. Active modes
// first, "off" last. A fan-speed row appears when the unit exposes fan_modes.
  const modes: string[] =
    (ent?.attributes?.hvac_modes as string[] | undefined)?.length
      ? (ent!.attributes!.hvac_modes as string[])
      : ['off'];
  const active = modes.filter((m) => m !== 'off');
  const onMode = active[0] ?? 'heat';
  const segModes = [...active, ...(modes.includes('off') ? ['off'] : [])];
  const toggleIcon = climateModeIconName(on ? mode : onMode) ?? 'power';
  const fanModes = (ent?.attributes?.fan_modes as string[] | undefined) ?? [];
  const fanMode = ent?.attributes?.fan_mode as string | undefined;
  const fanLabel = (f: string) =>
    // `middle` is what the Tuya ACs report; without it the raw English word
    // showed up untranslated between Низкое and Высокое.
    host.t(
      ({ low: 'Low', mid: 'Medium', medium: 'Medium', middle: 'Medium', high: 'High', auto: 'Auto' } as Record<
        string,
        string
      >)[f.toLowerCase()] ?? f,
    );
  return html`<div class="card ${on ? 'on cool' : ''}">
    <div class="crow">
      <button type="button" class="cicon ${on ? 'lit' : ''}" title="Toggle"
        @click=${() => host.svc('climate', 'set_hvac_mode', { hvac_mode: on ? 'off' : onMode }, id, on ? 'off' : onMode)}>${host.ic(toggleIcon)}</button>
      <div class="cgrow">
        <div class="clabel">${host.cardName(id)}</div>
        <div class="csub">${sub}</div>
      </div>
      <div class="stepper">
        <button type="button" class="stbtn" title="Cooler" @click=${() => setTemp(-step)}>${host.ic('minus')}</button>
        <div class="tval">${target != null ? `${target}°` : '—'}</div>
        <button type="button" class="stbtn" title="Warmer" @click=${() => setTemp(step)}>${host.ic('plus')}</button>
      </div>
    </div>
    <div class="seg">
      ${segModes.map(
        (m) => html`<button type="button" class="segb ${mode === m ? 'on' : ''}"
          @click=${() => host.svc('climate', 'set_hvac_mode', { hvac_mode: m }, id, m)}>${m === 'off' ? host.t('Off mode') : climateModeLabel(host, m)}</button>`,
      )}
    </div>
    ${fanModes.length && on
      ? html`<div class="seg fan">
          ${fanModes.map(
            (f) => html`<button type="button" class="segb ${fanMode === f ? 'on' : ''}" title=${'Fan: ' + f}
              @click=${() => host.svc('climate', 'set_fan_mode', { fan_mode: f }, id)}>${fanLabel(f)}</button>`,
          )}
        </div>`
      : nothing}
  </div>`;
}

/** Gates get ONE one-touch button (moving→stop, closed→open, else close, with
 *  the label showing the next action); every other cover keeps the explicit
 *  Open / Stop / Close buttons. No position slider or state line. */
export function renderCoverCard(host: BmsFloorplanCard, id: string) {
  const ent = host.hass!.states[id];
  const head = html`<div class="crow">
      <div class="cicon">${host.ic('curtain')}</div>
      <div class="cgrow">
        <div class="clabel">${host.cardName(id)}</div>
      </div>
    </div>`;
// The one-touch single button is ONLY for gates (device_class gate/garage/
// door, or a gate-like name). Every other cover — curtains, blinds — keeps
// the explicit Open / Stop / Close buttons.
  const dc = String(ent?.attributes?.device_class ?? '').toLowerCase();
  const nm = (String(ent?.attributes?.friendly_name ?? '') + ' ' + id).toLowerCase();
  const isGate = dc === 'gate' || dc === 'garage' || dc === 'door' || /ворот|gate|darvoza|калитк/.test(nm);
  if (isGate) {
    const st = host.effState(id);
    const moving = st === 'opening' || st === 'closing';
    const action = moving ? 'stop' : st === 'closed' ? 'open' : 'close';
    const svcName = action === 'stop' ? 'stop_cover' : action === 'open' ? 'open_cover' : 'close_cover';
    const title = action === 'stop' ? host.t('Stop blind') : action === 'open' ? host.t('Open blind') : host.t('Close blind');
    const opt = action === 'open' ? 'opening' : action === 'close' ? 'closing' : 'open';
    // ONE button with a fixed, unchanging icon (no Open/Stop/Close text). A
    // press still runs the gate's one-touch open/stop/close logic; the title
    // carries the current action for hover / accessibility only.
    return html`<div class="card">
      ${head}
      <div class="qbtns">
        <button type="button" class="qb gate icon-only" title=${title}
          @click=${() => host.svc('cover', svcName, {}, id, opt)}>${host.ic('power')}</button>
      </div>
    </div>`;
  }
  const feat = Number(ent?.attributes?.supported_features ?? 0);
  return html`<div class="card">
    ${head}
    <div class="qbtns">
      ${feat & 1
        ? html`<button type="button" class="qb"
            @click=${() => host.svc('cover', 'open_cover', {}, id, 'open')}>${host.t('Open blind')}</button>`
        : nothing}
      ${feat & 8
        ? html`<button type="button" class="qb"
            @click=${() => host.svc('cover', 'stop_cover', {}, id)}>${host.t('Stop blind')}</button>`
        : nothing}
      ${feat & 2
        ? html`<button type="button" class="qb"
            @click=${() => host.svc('cover', 'close_cover', {}, id, 'closed')}>${host.t('Close blind')}</button>`
        : nothing}
    </div>
  </div>`;
}

export function renderMediaCard(host: BmsFloorplanCard, id: string, title?: string) {
  const ent = host.hass!.states[id];
  const state = host.effState(id);
  const on = state !== 'off' && state !== 'unavailable' && state !== 'unknown' && state !== 'standby';
  const playing = state === 'playing';
// Only show controls the device actually supports (a TV usually has power +
// volume up/down/mute, no play/pause and no volume slider).
  const sf = Number(ent?.attributes?.supported_features) || 0;
  const can = (b: number) => (sf & b) === b;
  const powerable = can(128) || can(256); // TURN_ON | TURN_OFF
  const volSet = can(4), volStep = can(1024), volMute = can(8); // SET | STEP | MUTE
  const muted = !!ent?.attributes?.is_volume_muted;
// Read the EFFECTIVE volume so the % jumps the instant ± is tapped, and so a
// synced pair shows the shared level rather than this speaker's stale one.
  const volReal = Math.round(effVol(host, id) * 100);
  const track = ent?.attributes?.media_title ?? host.cardName(id, title);
  const artist = ent?.attributes?.media_artist ?? '';
// Now-playing line, shown while the speaker is playing. Transport controls
// (play/pause/next/…) are omitted on purpose — these panels drive speakers
// that play from a phone or an HA automation; power + volume is all that's
// needed here.
  const showMedia = playing;
  return html`<div class="card ${on ? 'on' : ''}">
    <div class="crow">
      <div class="cicon ${on ? 'lit' : ''}">${host.ic('tv')}</div>
      <div class="cgrow">
        <div class="clabel">${host.cardName(id, title)}</div>
        <div class="csub">${playing ? host.t('Playing now') : on ? host.t('On') : host.t('Off')}</div>
      </div>
      ${powerable
        ? html`<button type="button" class="sw ${on ? 'on' : ''}" title="Toggle"
            @click=${() => host.svc('media_player', on ? 'turn_off' : 'turn_on', {}, id, on ? 'off' : 'on')}><span class="sw-k"></span></button>`
        : nothing}
    </div>
    ${showMedia
      ? html`<div class="mp">
          <div class="mpart">${host.ic('album')}</div>
          <div class="mptxt"><div class="mptrack">${track}</div><div class="mpartist">${artist}</div></div>
        </div>`
      : nothing}
    ${volSet || volStep || volMute
      ? html`<div class="seg vol">
          ${volMute ? html`<button type="button" class="segb ${muted ? 'on' : ''}" title="Mute"
            @click=${() => host.svc('media_player', 'volume_mute', { is_volume_muted: !muted }, id)}>${host.ic('mute')}</button>` : nothing}
          <button type="button" class="segb" title="Volume down"
            @click=${() => mediaVolStep(host, id, ent, volStep, -1)}>${host.ic('volDown')}</button>
          <div class="volind">${volReal}%</div>
          <button type="button" class="segb" title="Volume up"
            @click=${() => mediaVolStep(host, id, ent, volStep, 1)}>${host.ic('volUp')}</button>
        </div>`
      : nothing}
  </div>`;
}

export function renderLockCard(host: BmsFloorplanCard, id: string) {
  const locked = host.effState(id) === 'locked';
  return html`<button type="button" class="lockbtn ${locked ? 'locked' : 'unlocked'}"
    @click=${() => lockAction(host, id, locked ? 'unlock' : 'lock')}>
    ${host.ic(locked ? 'lockClosed' : 'lockOpen')}
    <div class="cgrow"><div class="lktxt">${locked ? host.t('Locked') : host.t('Unlocked')}</div>
      <div class="lksub">${host.cardName(id)}</div></div>
    ${host.ic('chevUp')}
  </button>`;
}

export function renderInfoCard(host: BmsFloorplanCard, id: string) {
  const ent = host.hass!.states[id];
  const unit = ent?.attributes?.unit_of_measurement ?? '';
  return html`<div class="card">
    <div class="crow">
      <div class="cicon">${host.ic('gauge')}</div>
      <div class="cgrow"><div class="clabel">${host.cardName(id)}</div></div>
      <div class="info-val">${host.effState(id)}${unit}</div>
    </div>
  </div>`;
}
