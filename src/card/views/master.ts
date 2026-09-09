// ---------------------------------------------------------------------------
// Панель «Мастер»: управление ДОМОМ ЦЕЛИКОМ по разделам — свет, кондиционеры,
// отопление, вентиляция, шторы, и общая «Выключить всё».
//
// Живёт выдвижной панелью поверх «Обзора» (единственный экран про дом целиком)
// и открывается кнопкой из «Обзора» и из верхней полосы 3D. Разбор дома по
// разделам и деление климата — в master-sections.ts, здесь только кнопки.
//
// ПРАВИЛО ЭТОГО ФАЙЛА: у каждой кнопки на виду число устройств, которых она
// коснётся, и если их ноль — кнопка выключена. Массовое действие, о котором
// человек узнаёт только по результату, страшнее, чем отсутствие кнопки.
// ---------------------------------------------------------------------------

import { html, nothing } from 'lit';
import type { BmsFloorplanCard } from '../../ha-3d-floorplan-card';
import { ruPlural } from '../i18n';
import { allOffHouse, setAll } from '../state';
import {
  allOffCount,
  masterSections,
  sectionTitle,
  type MasterDevice,
  type MasterSection,
} from './master-sections';

export function openMaster(host: BmsFloorplanCard): void {
  // Выдвижная карточка комнаты и «мастер» — две панели на одном слое. Открытая
  // комната закрывается: два наложенных экрана человек читает как сбой.
  host.detailRoomKey = null;
  host.masterOpen = true;
}

export function closeMaster(host: BmsFloorplanCard): void {
  host.masterOpen = false;
}

/** Одна кнопка раздела. `targets` — те устройства, которых она РЕАЛЬНО
 *  коснётся: их число стоит на кнопке, и по нему же она гаснет. */
interface MasterAction {
  act: string;
  label: string;
  icon: string;
  targets: MasterDevice[];
  run: () => void;
  tone?: 'warm' | 'cool' | 'off';
}

/** Полностью ли штора открыта/закрыта (для процентных штор — по положению). */
function coverAt(host: BmsFloorplanCard, id: string, want: 'open' | 'closed'): boolean {
  const pos = host.hass?.states[id]?.attributes?.current_position;
  if (typeof pos === 'number') return want === 'open' ? pos >= 100 : pos <= 0;
  const s = host.effState(id);
  return want === 'open' ? s === 'open' : s === 'closed';
}

/** Режим включения для climate.*: предпочтительный, иначе первый рабочий. */
function onMode(dev: MasterDevice, prefer: string): string | null {
  if (dev.modes.includes(prefer)) return prefer;
  const active = dev.modes.filter((m) => m !== 'off');
  return active[0] ?? prefer;
}

/** Включить/выключить разнородный список: климат — режимом, реле — оптом. */
function runPower(host: BmsFloorplanCard, targets: MasterDevice[], on: boolean, prefer: string): void {
  const bulk: string[] = [];
  for (const d of targets) {
    if (d.domain === 'climate') {
      const m = on ? onMode(d, prefer) : 'off';
      if (m) host.svc('climate', 'set_hvac_mode', { hvac_mode: m }, d.id, m);
    } else {
      bulk.push(d.id);
    }
  }
  if (bulk.length) setAll(host, bulk, on);
}

/** Перевести все поддерживающие устройства раздела в один режим. */
function runMode(host: BmsFloorplanCard, targets: MasterDevice[], mode: string): void {
  for (const d of targets) host.svc('climate', 'set_hvac_mode', { hvac_mode: mode }, d.id, mode);
}

/** Кнопки раздела вместе с тем, кого каждая затронет. */
export function sectionActions(host: BmsFloorplanCard, sec: MasterSection): MasterAction[] {
  const live = sec.live;
  if (sec.key === 'lights') {
    const toOn = live.filter((d) => !d.on);
    const toOff = live.filter((d) => d.on);
    return [
      { act: 'lights-on', label: host.t('All on'), icon: 'bulb', targets: toOn, tone: 'warm', run: () => setAll(host, toOn.map((d) => d.id), true) },
      { act: 'lights-off', label: host.t('All off'), icon: 'power', targets: toOff, tone: 'off', run: () => setAll(host, toOff.map((d) => d.id), false) },
    ];
  }
  if (sec.key === 'ac') {
    const out: MasterAction[] = [];
    // Общий режим — только те, что его умеют и в нём ещё не стоят. Отправить
    // сплиту режим, которого у него нет, — это ошибка службы Home Assistant.
    const modeBtn = (mode: string, label: string, icon: string, tone: MasterAction['tone']) => {
      const targets = live.filter((d) => d.domain === 'climate' && d.modes.includes(mode) && host.effState(d.id) !== mode);
      const supported = live.some((d) => d.domain === 'climate' && d.modes.includes(mode));
      if (!supported) return;
      out.push({ act: `ac-${mode}`, label, icon, targets, tone, run: () => runMode(host, targets, mode) });
    };
    modeBtn('cool', host.t('Cooling'), 'snow', 'cool');
    // «Обогрев», а не «Отопление»: раздел «Отопление» — соседний, и две
    // одинаковые подписи на одном экране означали бы разные вещи.
    modeBtn('heat', host.tx('Обогрев', 'Heat'), 'heat', 'warm');
    modeBtn('fan_only', host.t('Ventilation'), 'fan', 'cool');
    const toOff = live.filter((d) => d.on);
    out.push({ act: 'ac-off', label: host.tx('Выключить все', 'Turn all off'), icon: 'power', targets: toOff, tone: 'off', run: () => runPower(host, toOff, false, 'cool') });
    return out;
  }
  if (sec.key === 'heat' || sec.key === 'vent') {
    const prefer = sec.key === 'heat' ? 'heat' : 'fan_only';
    const toOn = live.filter((d) => !d.on);
    const toOff = live.filter((d) => d.on);
    return [
      {
        act: `${sec.key}-on`,
        label: host.tx('Включить', 'Turn on'),
        icon: sec.key === 'heat' ? 'heat' : 'fan',
        targets: toOn,
        tone: sec.key === 'heat' ? 'warm' : 'cool',
        run: () => runPower(host, toOn, true, prefer),
      },
      {
        act: `${sec.key}-off`,
        label: host.tx('Выключить', 'Turn off'),
        icon: 'power',
        targets: toOff,
        tone: 'off',
        run: () => runPower(host, toOff, false, prefer),
      },
    ];
  }
  // Шторы. «Стоп» относится ко ВСЕМ шторам раздела: остановка на полпути
  // осмысленна для любой из них, а Home Assistant не всегда успевает сказать
  // «открывается». Гаснет она только когда штор, до которых дойдёт команда,
  // нет вовсе.
  const toOpen = live.filter((d) => !coverAt(host, d.id, 'open'));
  const toClose = live.filter((d) => !coverAt(host, d.id, 'closed'));
  return [
    { act: 'curtains-open', label: host.t('Open blind'), icon: 'chevUp', targets: toOpen, tone: 'warm', run: () => toOpen.forEach((d) => host.svc('cover', 'open_cover', {}, d.id, 'open')) },
    { act: 'curtains-stop', label: host.t('Stop blind'), icon: 'stop', targets: live, run: () => live.forEach((d) => host.svc('cover', 'stop_cover', {}, d.id)) },
    { act: 'curtains-close', label: host.t('Close blind'), icon: 'chevDown', targets: toClose, tone: 'off', run: () => toClose.forEach((d) => host.svc('cover', 'close_cover', {}, d.id, 'closed')) },
  ];
}

/** «N устройств» — по-русски со склонением. */
function devicesWord(host: BmsFloorplanCard, n: number): string {
  return host.isRu ? `${n} ${ruPlural(n, 'устройство', 'устройства', 'устройств')}` : `${n} ${n === 1 ? 'device' : 'devices'}`;
}

function renderAction(host: BmsFloorplanCard, a: MasterAction) {
  const n = a.targets.length;
  const dead = n === 0;
  const what = dead
    ? host.tx('менять нечего', 'nothing to change')
    : host.tx(`затронет ${devicesWord(host, n)}`, `affects ${devicesWord(host, n)}`);
  return html`<button type="button" class="ms-btn ${a.tone ?? ''}" data-act=${a.act}
    ?disabled=${dead}
    title=${`${a.label} — ${what}`}
    aria-label=${`${a.label} — ${what}`}
    @click=${() => a.run()}
  >${host.ic(a.icon)}<span class="ms-btn-l">${a.label}</span><b class="ms-n" aria-hidden="true">${n}</b></button>`;
}

function renderSection(host: BmsFloorplanCard, sec: MasterSection) {
  const count = sec.key === 'curtains'
    ? host.tx(`открыто ${sec.onCount} из ${sec.total}`, `${sec.onCount} of ${sec.total} open`)
    : host.tx(`работает ${sec.onCount} из ${sec.total}`, `${sec.onCount} of ${sec.total} on`);
  // Раздел, где всё пропало из сети, обязан сказать об этом словами: иначе
  // человек видит серые кнопки и решает, что сломалась панель.
  const gone = sec.live.length === 0;
  return html`<section class="ms-sec" data-sec=${sec.key}>
    <div class="ms-sec-h">
      <span class="ms-ic ${sec.onCount ? 'on' : ''}">${host.ic(sec.icon)}</span>
      <span class="ms-name">${sectionTitle(host, sec.key)}</span>
      <span class="ms-count" data-count=${sec.key}>${count}</span>
    </div>
    ${gone
      ? html`<div class="ms-note bad">${host.ic('wifiOff')}<span>${host.tx(
          'Нет связи ни с одним устройством раздела',
          'No connection to any device in this category',
        )}</span></div>`
      : nothing}
    <div class="ms-btns">${sectionActions(host, sec).map((a) => renderAction(host, a))}</div>
  </section>`;
}

/** Выдвижная панель «Мастер». Рисуется из «Обзора» и из режима «Комната», но
 *  на экране всегда одна: открытость хранит сама карточка. */
export function renderMasterPanel(host: BmsFloorplanCard) {
  if (!host.masterOpen) return nothing;
  const secs = masterSections(host);
  const devTotal = secs.reduce((s, x) => s + x.total, 0);
  const offN = allOffCount(host);
  return html`
    <div class="ms-back" @click=${() => closeMaster(host)}></div>
    <div class="ms-sheet" role="dialog" aria-modal="true"
      aria-label=${host.tx('Управление домом по разделам', 'Whole-home control by category')}
      @click=${(e: Event) => e.stopPropagation()}>
      <div class="ms-head">
        <button type="button" class="ms-x" data-act="master-close"
          title=${host.tx('Закрыть', 'Close')}
          aria-label=${host.tx('Закрыть управление домом', 'Close whole-home control')}
          @click=${() => closeMaster(host)}>${host.ic('close')}</button>
        <div class="cgrow">
          <div class="ms-title">${host.tx('Управление домом', 'Whole home')}</div>
          <div class="ms-sub">${secs.length
            ? host.tx(
                `${secs.length} ${ruPlural(secs.length, 'раздел', 'раздела', 'разделов')} · ${devicesWord(host, devTotal)}`,
                `${secs.length} ${secs.length === 1 ? 'category' : 'categories'} · ${devicesWord(host, devTotal)}`,
              )
            : host.tx('Устройств пока нет', 'No devices yet')}</div>
        </div>
      </div>
      <div class="ms-body">
        ${secs.length
          ? secs.map((s) => renderSection(host, s))
          : html`<div class="ms-empty">${host.tx(
              'В доме не отмечено ни одного управляемого устройства. Откройте редактор и добавьте комнате свет, климат или шторы.',
              'No controllable devices are marked in the home yet. Open the editor and add lights, climate or blinds to a room.',
            )}</div>`}
        <section class="ms-sec ms-alloff" data-sec="alloff">
          <div class="ms-sec-h">
            <span class="ms-ic ${offN ? 'on' : ''}">${host.ic('power')}</span>
            <span class="ms-name">${host.t('Turn everything off')}</span>
            <span class="ms-count" data-count="alloff">${offN
              ? host.tx(`выключит ${devicesWord(host, offN)}`, `turns off ${devicesWord(host, offN)}`)
              : host.tx('всё уже выключено', 'everything is already off')}</span>
          </div>
          <div class="ms-note">${host.tx(
            'Телевизор и отопление останутся включёнными',
            'The TV and the heating stay on',
          )}</div>
          <div class="ms-btns">
            <button type="button" class="ms-btn off" data-act="all-off"
              ?disabled=${offN === 0}
              title=${host.tx('Выключить всё в доме', 'Turn everything off')}
              aria-label=${offN
                ? host.tx(`Выключить всё в доме — затронет ${devicesWord(host, offN)}`, `Turn everything off — affects ${devicesWord(host, offN)}`)
                : host.tx('Выключить всё в доме — выключать нечего', 'Turn everything off — nothing to turn off')}
              @click=${() => allOffHouse(host)}
            >${host.ic('power')}<span class="ms-btn-l">${host.t('Turn everything off')}</span><b class="ms-n" aria-hidden="true">${offN}</b></button>
          </div>
        </section>
      </div>
    </div>
  `;
}

/** Кнопка «Управление» — вход в панель. `dot` — круглый значок для верхней
 *  полосы 3D (там ряд одинаковых кружков), иначе подписанная кнопка «Обзора».
 *  Дома без единого управляемого раздела кнопки не получают: она открыла бы
 *  пустую панель. */
export function renderMasterButton(host: BmsFloorplanCard, dot = false) {
  if (!masterSections(host).length) return nothing;
  const label = host.tx('Управление домом', 'Whole-home control');
  if (dot) {
    return html`<button type="button" class="sdot ms-open" data-act="master-open"
      title=${label} aria-label=${label}
      @click=${() => openMaster(host)}>${host.ic('layers')}</button>`;
  }
  return html`<button type="button" class="ov-master ms-open" data-act="master-open"
    title=${label} aria-label=${label}
    @click=${() => openMaster(host)}>${host.ic('layers')}<span>${host.tx('Управление', 'Control')}</span></button>`;
}
