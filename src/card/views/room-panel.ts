// ---------------------------------------------------------------------------
// Режим «Комната»: правая панель, график, заставка, «Отчёт».
// ---------------------------------------------------------------------------

import { html, nothing, svg } from 'lit';
import type { BmsFloorplanCard } from '../../ha-3d-floorplan-card';
import type { RoomInfo } from '../../scene/scene-manager';
import { homeSummary, roomTempStrs, tempSensorsToHide } from '../aggregates';
import { detectIntercom } from '../entities';
import { historyPts, historyStatus } from '../history';
import { fmtClockDate, fmtClockTime, roomIcon } from '../i18n';
import { activeRoom, onResetView, onSelectFloor, selectRoom, setViewMode, toggleSparkMetric } from '../scene';
import { toggleRoomsBar } from '../prefs';
import { onSleep, openKiosk, wake } from '../session';
import { allOffHouse, isEntityOffline, onRoomAllOff } from '../state';
import { renderClimateCard, renderCoverCard, renderFanCard, renderInfoCard, renderIntercomCard, renderLightCard, renderLockCard, renderMediaCard, renderToggleCard, renderUnavailableCard } from './device-cards';
import { renderMasterButton, renderMasterPanel } from './master';

/** Compact 24h LINE GRAPH for a room's bound degree sensors (air + floor on one
 *  shared axis). A left gutter shows the temperature scale in degrees with
 *  faint horizontal gridlines. Uniform-scaled (so the axis text isn't
 *  distorted). Appears once a temperature sensor is bound and its history
 *  loads; renders nothing with no bound sensor or no data. */
export function renderRoomSpark(host: BmsFloorplanCard, room: RoomInfo, metric: 'auto' | 'temp' | 'floor' | 'humidity' = 'auto') {
  const defs = ([
    { key: 'temp', id: room.tempSensor, cls: 'air', label: 'Воздух', unit: '°' },
    { key: 'floor', id: room.floorSensor, cls: 'warm', label: 'Пол', unit: '°' },
    { key: 'humidity', id: room.humiditySensor, cls: 'hum', label: 'Влажность', unit: '%' },
  ] as { key: string; id?: string; cls: string; label: string; unit: string }[]).filter((m) => !!m.id);
  // Ни одного привязанного датчика: графику просто неоткуда взяться. Это НЕ
  // то же самое, что «архив не отвечает», и человек обязан видеть разницу.
  if (!defs.length) {
    return html`<div class="rp-spark-note">${host.tx(
      'Датчик не привязан — графика нет',
      'No sensor bound — no graph',
    )}</div>`;
  }
  // Tapping a chip graphs just that metric; 'auto' shows the degree metrics
  // (air + floor) together, else the single bound one.
  const chosen0 = metric === 'auto'
    ? (defs.some((m) => m.unit === '°') ? defs.filter((m) => m.unit === '°') : defs.slice(0, 1))
    : defs.filter((m) => m.key === metric);
  const chosen = chosen0.length ? chosen0 : defs;
  const series = chosen
    .map((m) => ({ cls: m.cls, label: m.label, unit: m.unit, pts: historyPts(host, m.id) }))
    .filter((m) => !!m.pts && m.pts.length >= 2) as { cls: string; label: string; unit: string; pts: [number, number][] }[];
  if (!series.length) {
    // Датчик есть, а линии нет. Три разные причины — три разные фразы.
    const states = chosen.map((m) => historyStatus(host, m.id));
    const note = states.includes('loading')
      ? host.tx('Загружаем историю за сутки…', 'Loading 24 h of history…')
      : states.every((st) => st === 'failed')
        ? host.tx('Архив истории не отвечает — график недоступен', 'The history archive is not responding — no graph')
        : host.tx('За сутки данных нет', 'No data for the last 24 h');
    return html`<div class="rp-spark-note ${states.every((st) => st === 'failed') ? 'bad' : ''}">${note}</div>`;
  }
  const unit = series[0].unit;
  const all = series.flatMap((s) => s.pts);
  const vs = all.map((p) => p[1]);
  // Fixed, exact 24-hour window (now − 24h → now), so the time axis always
  // reads as a clear 24h regardless of how dense the recorder data is.
  const t1 = Date.now();
  const t0 = t1 - 24 * 3600 * 1000;
  // Value scale with headroom; minimum span 2° for temperature, 5% for humidity.
  const minSpan = unit === '%' ? 5 : 2;
  let lo = Math.floor(Math.min(...vs));
  let hi = Math.ceil(Math.max(...vs));
  if (hi - lo < minSpan) { const m = (lo + hi) / 2; lo = Math.floor(m - minSpan / 2); hi = Math.ceil(m + minSpan / 2); }
  const W = 260, H = 116, axisW = 30, top = 8, bot = H - 22, right = W - 6;
  const xFor = (t: number) => (t1 === t0 ? (axisW + right) / 2 : axisW + ((t - t0) / (t1 - t0)) * (right - axisW));
  const yFor = (v: number) => bot - ((v - lo) / (hi - lo)) * (bot - top);
  // Degree scale down the left, faint horizontal gridlines.
  const TICKS = 4;
  const grid: unknown[] = [];
  for (let i = 0; i <= TICKS; i++) {
    const v = lo + ((hi - lo) * i) / TICKS;
    const y = yFor(v);
    grid.push(svg`<line class="spark-grid" x1=${axisW} y1=${y.toFixed(1)} x2=${right} y2=${y.toFixed(1)}></line>`);
    grid.push(svg`<text class="spark-axis" x=${axisW - 5} y=${(y + 3).toFixed(1)} text-anchor="end">${Math.round(v)}${unit}</text>`);
  }
  // Time scale along the bottom (HH:MM), faint vertical gridlines. Edge labels
  // are start/end-anchored so they don't clip.
  const fmtTime = (ms: number) => new Date(ms).toLocaleTimeString(host.uiLocale, { hour: '2-digit', minute: '2-digit' });
  // Ticks on ROUND local 6-hour marks (00:00 / 06:00 / 12:00 / 18:00), so the
  // labels are clean and each sits exactly where that clock time falls on the
  // line (positioned by real timestamp, not an even fraction of the window).
  const mark = new Date(t0);
  mark.setMinutes(0, 0, 0);
  while (mark.getHours() % 6 !== 0 || mark.getTime() < t0) mark.setHours(mark.getHours() + 1);
  for (; mark.getTime() <= t1; mark.setHours(mark.getHours() + 6)) {
    const t = mark.getTime();
    const x = xFor(t);
    const frac = (t - t0) / (t1 - t0);
    const anchor = frac < 0.05 ? 'start' : frac > 0.95 ? 'end' : 'middle';
    grid.push(svg`<line class="spark-grid" x1=${x.toFixed(1)} y1=${top} x2=${x.toFixed(1)} y2=${bot}></line>`);
    grid.push(svg`<text class="spark-axis" x=${x.toFixed(1)} y=${H - 7} text-anchor=${anchor}>${fmtTime(t)}</text>`);
  }
  const lines = series.map((s) => {
    const d = s.pts.map((p, i) => `${i ? 'L' : 'M'}${xFor(p[0]).toFixed(1)} ${yFor(p[1]).toFixed(1)}`).join(' ');
    return svg`<path class="spark ${s.cls}" d=${d}></path>`;
  });
  return html`<div class="rp-spark-wrap" title=${host.tx('За последние сутки', 'The last 24 hours')}>
    <div class="spark-legend">${series.map((s) => html`<span class="spark-leg ${s.cls}"><i></i>${s.label}</span>`)}</div>
    <svg class="rp-spark" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet">${grid}${lines}</svg>
  </div>`;
}

/** Полоса комнат внизу 3D — вместе с язычком, который её убирает.
 *
 *  На живом объекте комнат восемнадцать: плашки переносились в два ряда и
 *  занимали половину экрана. Свёрнутая полоса оставляет только язычок — по
 *  нему видно, что там комнаты и сколько их, — а 3D получает освободившееся
 *  место. Выбор человека помнит устройство (card/prefs.ts), как и качество
 *  отрисовки; переключатель этажей рядом НЕ прячется — он нужен всегда. */
export function renderPills(host: BmsFloorplanCard) {
  if (!host.rooms.length) return nothing;
  const open = host.roomsBarOpen;
  const n = host.rooms.length;
  // Язычок и плашки — соседи внутри .stage-bottom: та уже колонка с отступом,
  // и своя обёртка была бы лишним слоем ради тех же правил.
  return html`
    <button type="button" class="pills-tab" data-act="rooms-bar"
      aria-expanded=${open ? 'true' : 'false'}
      aria-controls="rooms-bar"
      title=${open ? host.tx('Свернуть комнаты', 'Collapse the rooms') : host.tx('Показать комнаты', 'Show the rooms')}
      aria-label=${open
        ? host.tx(`Свернуть полосу комнат, их ${n}`, `Collapse the room bar, ${n} rooms`)
        : host.tx(`Показать комнаты, их ${n}`, `Show the rooms, ${n} of them`)}
      @click=${() => toggleRoomsBar(host)}
    >${host.ic('room')}<span>${host.tx('Комнаты', 'Rooms')}</span><em>${n}</em>${host.ic(open ? 'chevDown' : 'chevUp')}</button>
    ${open
      ? html`<div class="pills" id="rooms-bar">
          ${host.rooms.map(
            (r) => html`<button
              type="button"
              class="pill ${r.key === host.activeRoomKey ? 'on' : ''}"
              aria-pressed=${r.key === host.activeRoomKey ? 'true' : 'false'}
              aria-label=${`${host.tx('Комната', 'Room')}: ${r.name || host.t('Room')}`}
              @click=${() => selectRoom(host, r.key)}
            >${host.ic(roomIcon(r.name))}<span>${r.name || host.t('Room')}</span></button>`,
          )}
        </div>`
      : nothing}`;
}

export function renderFloorTabs(host: BmsFloorplanCard) {
  if (host.floorNames.length <= 1) return nothing;
  return html`<div class="ftabs">
    ${host.floorNames.map(
      (name, i) => html`<button type="button" class="ftab ${i === host.activeFloorIndex ? 'on' : ''}"
        aria-pressed=${i === host.activeFloorIndex ? 'true' : 'false'}
        aria-label=${`${host.tx('Этаж', 'Floor')}: ${name}`}
        @click=${() => onSelectFloor(host, i)}>${name}</button>`,
    )}
  </div>`;
}

export function renderStageChrome(host: BmsFloorplanCard) {
  return html`
    <div class="clock">
      <div class="ctime">${fmtClockTime(host)}</div>
      <div class="cdate">${fmtClockDate(host)}</div>
    </div>
    <div class="topstat">
      <button class="sdot" title=${host.tx('Показать план целиком', 'Reset the view')}
        aria-label=${host.tx('Показать план целиком', 'Reset the view')}
        @click=${() => onResetView(host)}>${host.ic('room')}</button>
      ${host.panel ? html`<button class="sdot" title=${host.tx('Во весь экран', 'Full-screen 3D')}
        aria-label=${host.tx('Открыть на весь экран', 'Open full-screen')}
        @click=${() => openKiosk()}>${host.ic('shield')}</button>` : nothing}
      <button class="sdot" title=${host.tx('Заставка', 'Screensaver')}
        aria-label=${host.tx('Включить заставку', 'Turn on the screensaver')}
        @click=${(e: Event) => onSleep(host, e)}>${host.ic('moon')}</button>
      <button class="sdot" title=${host.t('All off short')}
        aria-label=${host.tx('Выключить всё в доме', 'Turn everything off')}
        @click=${() => allOffHouse(host)}>${host.ic('power')}</button>
      <button class="sdot" title=${host.tx('Отчёт — графики за сутки', 'Report — 24 h graphs')}
        aria-label=${host.tx('Открыть отчёт', 'Open the report')}
        @click=${() => { host.showReport = true; }}>${host.ic('chart')}</button>
      ${renderMasterButton(host, true)}
      ${renderViewToggle(host)}
    </div>
    <div class="stage-bottom">
      ${renderFloorTabs(host)}
      ${renderPills(host)}
    </div>
    ${renderMasterPanel(host)}
  `;
}

export function renderScreensaver(host: BmsFloorplanCard) {
  const s = homeSummary(host);
  return html`<div class="saver" @pointerdown=${() => wake(host)}>
    <div class="saver-aurora"></div>
    <div class="saver-in">
      <div class="saver-home">${host.t('My home')}</div>
      <div class="saver-time">${fmtClockTime(host)}</div>
      <div class="saver-date">${fmtClockDate(host)}</div>
      <div class="saver-info">
        <div class="si">${host.ic('thermo')}<div class="sitx"><div class="siv">${s.temp}</div><div class="sil">${host.t('in the house')}</div></div></div>
        <div class="si cool">${host.ic('drop')}<div class="sitx"><div class="siv">${s.hum}</div><div class="sil">${host.t('humidity')}</div></div></div>
        <div class="si">${host.ic('bulb')}<div class="sitx"><div class="siv">${s.on}</div><div class="sil">${host.t('lights on')}</div></div></div>
        <div class="si good">${host.ic(s.secIcon)}<div class="sitx"><div class="siv">${s.secLabel}</div><div class="sil">${host.t('security')}</div></div></div>
      </div>
      <div class="saver-hint">${host.ic('dot')}<span>${host.t('Touch the screen to return')}</span></div>
    </div>
  </div>`;
}

/** The temperature / floor / humidity chips, tappable to filter the graph to
 *  just that metric (the active one is highlighted). */
export function renderTempChips(host: BmsFloorplanCard, t: string | null, f: string | null, h: string | null) {
  if (!t && !f && !h) return nothing;
  const chip = (val: string | null, m: 'temp' | 'floor' | 'humidity', cls: string, icon: string, title = '') =>
    val
      ? html`<button type="button" class="rp-chip ${cls} ${host.sparkMetric === m ? 'sel' : ''}" title=${title}
          aria-pressed=${host.sparkMetric === m ? 'true' : 'false'}
          aria-label=${`${title || host.tx('Температура воздуха', 'Air temperature')}: ${val}`}
          @click=${() => toggleSparkMetric(host, m)}>${host.ic(icon)}${val}</button>`
      : nothing;
  return html`<div class="rp-chips">
    ${chip(t, 'temp', '', 'thermo')}
    ${chip(f, 'floor', 'warm', 'heat', host.t('Floor'))}
    ${chip(h, 'humidity', 'cool', 'drop')}
  </div>`;
}

/** "Отчёт" overlay: every room's 24h graph, split into category tabs —
 *  Температура (air), Тёплый пол (floor) and Влажность. The active tab graphs
 *  that one metric for every room that has it bound; just name + graph. */
export function renderReport(host: BmsFloorplanCard) {
  const rooms = (host.sceneManager?.roomsByFloor() ?? [host.rooms]).flat();
  const cats: { key: 'temp' | 'floor' | 'humidity'; label: string; has: (r: RoomInfo) => boolean }[] = [
    { key: 'temp', label: 'Температура', has: (r) => !!r.tempSensor },
    { key: 'floor', label: 'Тёплый пол', has: (r) => !!r.floorSensor },
    { key: 'humidity', label: 'Влажность', has: (r) => !!r.humiditySensor },
  ];
  const active = host.reportMetric;
  const shown = rooms.filter((r) => cats.find((c) => c.key === active)!.has(r));
  return html`
    <div class="report-back" @click=${() => { host.showReport = false; }}></div>
    <div class="report" @click=${(e: Event) => e.stopPropagation()}>
      <div class="report-head">
        <div class="report-title">${host.ic('chart')}<span>${host.tx('Отчёт — за сутки', 'Report — last 24 h')}</span></div>
        <button type="button" class="closebtn" title=${host.tx('Закрыть', 'Close')}
          aria-label=${host.tx('Закрыть отчёт', 'Close the report')}
          @click=${() => { host.showReport = false; }}>${host.ic('close')}</button>
      </div>
      <div class="report-tabs">
        ${cats.map((c) => {
          const n = rooms.filter(c.has).length;
          return html`<button type="button" class="report-tab ${active === c.key ? 'sel' : ''}"
            @click=${() => { host.reportMetric = c.key; }}>${c.label}${n ? html` <em>${n}</em>` : nothing}</button>`;
        })}
      </div>
      <div class="report-grid">
        ${shown.length
          ? shown.map((r) => html`<div class="report-item">
              <div class="report-room">${r.name || host.t('Room')}</div>
              ${renderRoomSpark(host, r, active)}
            </div>`)
          : html`<div class="rp-empty">${host.tx(
              'Ни в одной комнате этот датчик не привязан. Привяжите его в редакторе — раздел «Комнаты».',
              'No room has this sensor bound. Bind one in the editor, section "Rooms".',
            )}</div>`}
      </div>
    </div>`;
}

export function renderRoomPanel(host: BmsFloorplanCard) {
  const room = activeRoom(host);
  if (!room) return nothing;
  const humEnt = room.humiditySensor ? host.hass?.states[room.humiditySensor] : undefined;
  const skip = tempSensorsToHide(host, room);
  if (humEnt) skip.add(humEnt.entity_id);

  const num = (v: any, digits: number) => {
    const n = Number(v);
    return Number.isFinite(n) ? n.toLocaleString(host.uiLocale, { minimumFractionDigits: digits, maximumFractionDigits: digits }) : '—';
  };
  const { air: tempChip, floor: floorChip } = roomTempStrs(host, room, num);
  const humChip = humEnt && Number.isFinite(Number(humEnt.state)) ? `${num(humEnt.state, 0)}%` : null;

  const cards = roomCards(host, room, skip);
  return html`
    <div class="room-panel">
      <div class="rp-head">
        <div class="rp-top">
          <div class="rp-name">${room.name || host.t('Room')}</div>
          <button type="button" class="closebtn" title=${host.tx('Закрыть', 'Close')}
            aria-label=${host.tx('Закрыть панель комнаты', 'Close the room panel')}
            @click=${() => selectRoom(host, null)}>${host.ic('close')}</button>
        </div>
        ${renderTempChips(host, tempChip, floorChip, humChip)}
        ${renderRoomSpark(host, room, host.sparkMetric)}
      </div>
      <div class="rp-body">
        ${cards.length ? cards : html`<div class="rp-empty">${host.t('No devices in this room')}</div>`}
      </div>
      <div class="rp-foot">
        <button type="button" class="rp-master"
          aria-label=${host.tx('Выключить всё в этой комнате', 'Turn everything off in this room')}
          @click=${() => onRoomAllOff(host, room)}>
          ${host.ic('power')}<span>${host.t('Turn everything off')}</span>
        </button>
      </div>
    </div>
  `;
}

/** Build the ordered device cards for a room (lights, climate, covers, …). */
export function roomCards(host: BmsFloorplanCard, room: RoomInfo, skip: Set<string>) {
  const hass = host.hass;
  if (!hass) return [];
  // Устройство, которое пропало из Home Assistant или не отвечает, раньше
  // просто ВЫПАДАЛО из списка комнаты. Теперь оно остаётся — отдельной
  // карточкой «Нет связи», без органов управления (см. renderUnavailableCard).
  const inRoom = room.entities.filter((e) => !skip.has(e.entity_id));
  const gone = inRoom.filter((e) => isEntityOffline(host, e.entity_id));
  const ents0 = inRoom.filter((e) => hass.states[e.entity_id] && !isEntityOffline(host, e.entity_id));
  // A BMS Intercom (домофон) exposes camera/vyzov/prosmotr/open/… sharing a
  // base name. Collapse them into ONE intercom card and hide the members from
  // the normal per-domain cards.
  const intercom = detectIntercom(host, ents0);
  const ents = intercom ? ents0.filter((e) => !intercom.ids.has(e.entity_id)) : ents0;
  // A binding can name any entity; one we may not control is shown as a
  // read-only readout instead of a switch (see CONTROL_DOMAINS).
  const of = (...b: string[]) =>
    ents.filter((e) => host.canControl(e.entity_id) && b.includes(e.behavior));
  const lights = of('light');
  const switches = of('switch', 'input_boolean');
  const climates = of('climate');
  const fans = of('fan');
  const covers = of('cover');
  const medias = of('media_player');
  const locks = of('lock');
  const known = new Set(['light', 'switch', 'input_boolean', 'climate', 'fan', 'cover', 'media_player', 'lock']);
  const infos = ents.filter((e) => !known.has(e.behavior) || !host.canControl(e.entity_id));

  const out: unknown[] = [];
  if (intercom) out.push(renderIntercomCard(host, intercom));
  // All of a room's lights collapse into ONE "Свет" card (matches the design);
  // per-light on/off stays available via the overview segment buttons.
  if (lights.length) out.push(renderLightCard(host, lights.map((e) => e.entity_id)));
  switches.forEach((e) => out.push(renderToggleCard(host, e.entity_id, 'power')));
  // Always label a climate card with the device's own HA name. A room with a
  // single climate device used to be labelled with the generic category
  // ("Климат"), which hid the real names — "Тёплый пол", "Радиатор",
  // "Кондиционер" — exactly the ones that tell two heaters in a room apart.
  climates.forEach((e) => out.push(renderClimateCard(host, e.entity_id)));
  fans.forEach((e) => out.push(renderFanCard(host, e.entity_id)));
  covers.forEach((e) => out.push(renderCoverCard(host, e.entity_id)));
  medias.forEach((e) => out.push(renderMediaCard(host, e.entity_id, medias.length === 1 ? host.t('Media') : undefined)));
  locks.forEach((e) => out.push(renderLockCard(host, e.entity_id)));
  infos.forEach((e) => out.push(renderInfoCard(host, e.entity_id)));
  // «Нет связи» — в конце списка: рабочие устройства человек ищет чаще.
  gone
    .filter((e) => !intercom?.ids.has(e.entity_id))
    .forEach((e) => out.push(renderUnavailableCard(host, e.entity_id)));
  return out;
}

export function renderViewToggle(host: BmsFloorplanCard) {
  const on = (m: string) => (host.viewMode === m ? 'on' : '');
  return html`<div class="view-toggle">
    <button type="button" class="vt-btn ${on('room')}" aria-pressed=${host.viewMode === 'room' ? 'true' : 'false'}
      @click=${() => setViewMode(host, 'room')}>
      ${host.ic('room')}<span>${host.t('Room')}</span>
    </button>
    <button type="button" class="vt-btn ${on('overview')}" aria-pressed=${host.viewMode === 'overview' ? 'true' : 'false'}
      @click=${() => setViewMode(host, 'overview')}>
      ${host.ic('grid')}<span>${host.t('Overview')}</span>
    </button>
  </div>`;
}
