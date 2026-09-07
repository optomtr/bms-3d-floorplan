// ---------------------------------------------------------------------------
// Режим «Обзор»: сводка дома и сетка комнат.
// ---------------------------------------------------------------------------

import type { BmsFloorplanCard } from '../../ha-3d-floorplan-card';
import type { RoomInfo } from '../../scene/scene-manager';
import { houseStatus, overviewStats, roomLights, roomTempStrs } from '../aggregates';
import { shortLightName } from '../entities';
import { fmtClockDate, fmtClockTime, roomIcon } from '../i18n';
import { openDetail } from '../scene';
import { onSleep } from '../session';
import { allOffHouse, lockAction } from '../state';
import { renderViewToggle } from '../views/room-panel';
import { html, nothing } from 'lit';

export function renderOverview(host: BmsFloorplanCard) {
  const stats = overviewStats(host);
  const st = houseStatus(host);
  const num = (v: any, d: number) => {
    const n = Number(v);
    return Number.isFinite(n) ? n.toLocaleString(host.uiLocale, { minimumFractionDigits: d, maximumFractionDigits: d }) : '—';
  };
  return html`
    <div class="ov-top">
      <div class="ov-clock">
        <div class="ctime">${fmtClockTime(host)}</div>
        <div class="cdate">${fmtClockDate(host)}</div>
      </div>
      <div class="ov-actions">
        <div class="sumcard act"><div class="sumn">${stats.onCount}</div><div class="suml">${host.t('lights on')}</div></div>
        <div class="sumcard"><div class="sumn">${stats.avgTemp}</div><div class="suml">${host.t('on average')}</div></div>
        <button type="button" class="ov-master" @click=${() => allOffHouse(host)}>${host.ic('power')}<span>${host.t('All off short')}</span></button>
        <button type="button" class="bsleep" title="Screensaver" @click=${(e: Event) => onSleep(host, e)}>${host.ic('moon')}</button>
        ${renderViewToggle(host)}
      </div>
    </div>
    <div class="bstatus">
      <div class="bstat warm"><div class="bstat-ic">${host.ic('heat')}</div><div><div class="bstat-v">${st.heat}</div><div class="bstat-l">${st.heatLabel}</div></div></div>
      <div class="bstat"><div class="bstat-ic">${host.ic('curtain')}</div><div><div class="bstat-v">${st.blinds}</div><div class="bstat-l">${host.t('blinds open')}</div></div></div>
      <div class="bstat cool"><div class="bstat-ic">${host.ic('drop')}</div><div><div class="bstat-v">${st.hum}</div><div class="bstat-l">${host.t('humidity in house')}</div></div></div>
      <div class="bstat good"><div class="bstat-ic">${host.ic(st.secIcon)}</div><div><div class="bstat-v">${st.secLabel}</div><div class="bstat-l">${host.t('front door')}</div></div></div>
    </div>
    <div class="ov-grid">
      ${renderOverviewRooms(host, num)}
    </div>
  `;
}

/** All rooms of the home, grouped by floor with a heading per floor (headings
 *  span the grid). One scrolling list top-to-bottom, so the whole house is
 *  reachable from Обзор without switching floors first. */
export function renderOverviewRooms(host: BmsFloorplanCard, num: (v: any, d: number) => string) {
  const floors = host.sceneManager?.roomsByFloor() ?? [host.rooms];
  host.overviewRoomByKey.clear();
  for (const rs of floors) for (const r of rs) host.overviewRoomByKey.set(r.key, r);
  const multi = host.floorNames.length > 1;
  const anyRoom = floors.some((rs) => rs.length);
  if (!anyRoom) return html`<div class="rp-empty">${host.t('No devices in this room')}</div>`;
  return floors.map((rs, fi) => {
    if (!rs.length) return nothing;
    // Nest sub-rooms (zones whose parentId resolves to a sibling zone) inside
    // their parent's card; everything else stays a top-level card.
    const byId = new Map<string, RoomInfo>();
    for (const r of rs) if (r.id) byId.set(r.id, r);
    const isChild = (r: RoomInfo) => !!(r.parentId && r.parentId !== r.id && byId.has(r.parentId));
    const childrenOf = (id?: string) => (id ? rs.filter((r) => isChild(r) && r.parentId === id) : []);
    const tops = rs.filter((r) => !isChild(r));
    return html`${multi ? html`<div class="ov-floor-h">${host.floorNames[fi] ?? ''}</div>` : nothing}
      ${tops.map((r) => renderOverviewCard(host, r, num, childrenOf(r.id)))}`;
  });
}

/** One light "segment" button (used by the room card and its sub-rooms). */
export function renderLightChip(host: BmsFloorplanCard, id: string, roomName?: string) {
  const lon = host.effState(id) === 'on';
  const nm = host.hass?.states[id]?.attributes?.friendly_name ?? id;
  return html`<button type="button" class="lightseg ${lon ? 'on' : ''}" title=${nm}
    @click=${(e: Event) => { e.stopPropagation(); host.svc(id.split('.')[0], 'toggle', {}, id, lon ? 'off' : 'on'); }}><span>${shortLightName(host, id, roomName)}</span></button>`;
}

export function renderOverviewCard(host: BmsFloorplanCard, room: RoomInfo, num: (v: any, d: number) => string, children: RoomInfo[] = []) {
  const self = roomLights(host, room);
  const ids = self.ids;
  const kids = children.map((c) => ({ room: c, ids: roomLights(host, c).ids }));
// Header count/toggle span the room AND its sub-rooms.
  const allIds = [...ids, ...kids.flatMap((k) => k.ids)];
  const anyOn = allIds.some((id) => host.effState(id) === 'on');
  const onCount = allIds.filter((id) => host.effState(id) === 'on').length;
  const pct = allIds.length ? Math.round((onCount / allIds.length) * 100) : 0;
  const toggleEnts = [room, ...children].flatMap((r) => r.entities.filter((x) => ['light', 'switch', 'input_boolean'].includes(x.behavior)));
  const humEnt = room.humiditySensor ? host.hass?.states[room.humiditySensor] : undefined;
  const climate = room.entities.find((e) => e.behavior === 'climate');
  const lock = room.entities.find((e) => e.behavior === 'lock');
  const cover = room.entities.find((e) => e.behavior === 'cover');
  const { air: tempStr, floor: floorStr } = roomTempStrs(host, room, num);
  const humStr = humEnt && Number.isFinite(Number(humEnt.state)) ? `${num(humEnt.state, 0)}%` : null;

// One extra footer chip (lock > climate > cover), mirroring the mockup.
  let extraChip = nothing as unknown;
  if (lock) {
    const locked = host.effState(lock.entity_id) === 'locked';
    extraChip = html`<button type="button" class="qstat lockq ${locked ? 'locked' : 'unlocked'}"
      @click=${(e: Event) => { e.stopPropagation(); lockAction(host, lock.entity_id, locked ? 'unlock' : 'lock'); }}>
      ${host.ic(locked ? 'lockClosed' : 'lockOpen')}${locked ? host.t('Locked') : host.t('Unlocked')}</button>`;
  } else if (climate) {
    const target = host.hass?.states[climate.entity_id]?.attributes?.temperature;
    extraChip = html`<div class="qstat">${host.ic('heat')}${target != null ? `${target}°` : '—'}</div>`;
  } else if (cover) {
    const pos = host.hass?.states[cover.entity_id]?.attributes?.current_position;
    extraChip = html`<div class="qstat">${host.ic('curtain')}${pos != null ? `${pos}%` : '—'}</div>`;
  }

  return html`<div class="rcard link ${anyOn ? 'on' : ''}" @click=${() => openDetail(host, room.key)}>
    <div class="rchead">
      <div class="rcicon">${host.ic(roomIcon(room.name))}</div>
      <div class="cgrow">
        <div class="rcname">${room.name || host.t('Room')}<span class="rcchev">${host.ic('chevRight')}</span></div>
        <div class="rctemp">${[tempStr, humStr].filter(Boolean).join(' · ')}${floorStr ? html`<span class="rcfloor"> · ${host.t('Floor')} ${floorStr}</span>` : nothing}</div>
      </div>
      ${allIds.length
        ? html`<button type="button" class="sw ${anyOn ? 'on' : ''}" title="Toggle"
            @click=${(e: Event) => { e.stopPropagation(); host.onToggleAll(toggleEnts); }}><span class="sw-k"></span></button>`
        : nothing}
    </div>
    ${allIds.length
      ? html`
        <div class="rcmid">
          <span class="icn-mid">${host.ic('bulb')}</span><span class="lbltxt">${host.t('Light')}</span>
          <div class="grow"></div><span class="brival">${onCount}/${allIds.length} · ${pct}%</span>
        </div>
        ${ids.length
          ? html`<div class="lightsegs">${ids.map((id) => renderLightChip(host, id, room.name))}</div>`
          : nothing}
        ${kids.map((k) => k.ids.length
          ? html`<div class="subroom">
              <div class="subroom-h">${host.ic(roomIcon(k.room.name))}<span>${k.room.name || host.t('Room')}</span>
                <div class="grow"></div><span class="subroom-n">${k.ids.filter((id) => host.effState(id) === 'on').length}/${k.ids.length}</span></div>
              <div class="lightsegs">${k.ids.map((id) => renderLightChip(host, id, k.room.name))}</div>
            </div>`
          : nothing)}`
      : nothing}
    ${humStr || extraChip !== nothing
      ? html`<div class="rcfoot">
          ${humStr ? html`<div class="qstat">${host.ic('drop')}${humStr}</div>` : nothing}
          ${extraChip}
        </div>`
      : nothing}
  </div>`;
}
