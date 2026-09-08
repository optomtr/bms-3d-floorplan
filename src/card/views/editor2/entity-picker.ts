// ---------------------------------------------------------------------------
// ВЫБОР УСТРОЙСТВА для предмета на плане.
//
// Плоский список идентификаторов выбрать невозможно. В живом доме владельца
// светильники называются «Канал 1», «Канал 2», «Канал 3» — это каналы реле, и
// в трёх разных комнатах имена совпадают буква в букву. Идентификатор
// (light.gostinaia_svet_kanal_1) человек читать не обязан.
//
// Поэтому список:
//   • разложен по комнатам, каждый раздел сворачивается ЦЕЛОЙ строкой;
//   • крупно показывает устройство и канал («Гостиная свет · Канал 1»),
//     мелко — идентификатор, который нужен монтажнику;
//   • помечает занятое: одну лампу нельзя повесить на план дважды;
//   • при поиске фильтрует ВНУТРИ разделов, а не сваливает всё в плоскую кучу;
//   • сначала показывает подходящие домены (свет и выключатели), остальное —
//     за кнопкой «Показать все устройства».
//
// Ни одного системного окошка браузера: разделы и строки — обычные кнопки.
// ---------------------------------------------------------------------------

import { html, nothing, type TemplateResult } from 'lit';
import type { BmsFloorplanCard } from '../../../ha-3d-floorplan-card';
import type { Vec2 } from '../../../types';
import { pointInPoly, polyArea, polyCentroid } from '../../../editor2/geom';
import { entityDomainsFor } from '../../../furniture/library';
import {
  entityArea, entityTitle, pickerGroups, planTakenBy, type PickGroup, type PickRow,
} from '../../entities';
import { patchSelected } from '../../editor2-commands';

/** Сколько строк показываем в ОДНОМ разделе. Их бывают сотни — остальное
 *  отсекается поиском, и об этом сказано прямо, а не молча. */
const ROW_LIMIT = 40;

export interface PickerOpts {
  model: string;
  /** Предмет, которому выбираем устройство (его привязка — не «занято»). */
  itemId: string;
  current?: string;
  /** Светильник только что поставлен и ещё ничем не управляет. */
  prompt: boolean;
}

export function entityPicker(host: BmsFloorplanCard, o: PickerOpts): TemplateResult {
  const st = host.e2!;
  const domains = st.entityAll ? [] : entityDomainsFor(o.model);
  const taken = planTakenBy(st.plan, o.itemId);
  const { groups, fellBack, total } = pickerGroups(host, domains, taken);
  const q = st.entityQuery.trim().toLowerCase();
  const shown = groups
    .map((g) => ({ ...g, rows: q ? g.rows.filter((r) => hits(r, g, q)) : g.rows }))
    .filter((g) => g.rows.length > 0);
  const found = shown.reduce((n, g) => n + g.rows.length, 0);
  const auto = autoOpenKey(host, shown, o.itemId, o.current);

  return html`
    <div class="e2-field e2-pick ${o.prompt ? 'e2-bind-ask' : ''}" ?data-bind-prompt=${o.prompt}>
      <span class="e2-lab">Устройство Home Assistant</span>
      ${o.prompt
        ? html`<span class="e2-bind-note" role="status">
            Светильник поставлен. Выберите устройство — без него он не включится,
            это просто украшение на плане.
          </span>`
        : nothing}
      ${o.current
        ? html`<div class="e2-bound" data-bound=${o.current}>
            ${host.ic('link')}
            <span class="e2-bound-txt">
              <span class="e2-ent-title">${entityTitle(host, o.current)}</span>
              <span class="e2-ent-sub">${[entityArea(host, o.current), o.current]
                .filter(Boolean).join(' · ')}</span>
            </span>
            <button class="e2-mini" data-act="unbind" aria-label="Снять привязку"
              title="Снять привязку" @click=${() => patchSelected(host, { entityId: '' })}>
              ${host.ic('close')}
            </button>
          </div>`
        : nothing}
      <input class="e2-input" data-field="entity-search" type="search" autocomplete="off"
        placeholder="поиск по комнате, устройству, каналу…" aria-label="Поиск устройства Home Assistant"
        .value=${st.entityQuery}
        @input=${(e: Event) => { st.entityQuery = (e.target as HTMLInputElement).value; host.requestUpdate(); }} />
      ${fellBack
        ? html`<span class="e2-hint">Для этой модели подходящих доменов не нашлось — показаны все устройства.</span>`
        : nothing}
      <div class="e2-groups" data-groups>
        ${shown.map((g) => section(host, g, q, o.current, auto))}
      </div>
      ${!shown.length ? html`<span class="e2-hint">${emptyText(st.entityQuery, total)}</span>` : nothing}
      ${scopeButton(host, o.model, fellBack, found)}
    </div>
  `;
}

/** Раздел одной комнаты: заголовок-кнопка + строки. Заголовок сам говорит,
 *  сколько внутри подходящих устройств, — иначе разворачивать пришлось бы все. */
function section(
  host: BmsFloorplanCard,
  g: PickGroup,
  q: string,
  current: string | undefined,
  auto: string,
): TemplateResult {
  const st = host.e2!;
  // При поиске раздел с находками открыт всегда: иначе поиск показывал бы
  // только заголовки и человек считал бы, что ничего не нашлось.
  const open = q ? true : (st.entityOpen[g.key] ?? g.key === auto);
  return html`
    <div class="e2-grp" data-area=${g.key} ?data-open=${open}>
      <button class="e2-grp-head" data-area-head=${g.key} aria-expanded=${open ? 'true' : 'false'}
        @click=${() => {
          st.entityOpen = { ...st.entityOpen, [g.key]: !open };
          host.requestUpdate();
        }}>
        ${host.ic(open ? 'chevDown' : 'chevRight')}
        <span class="e2-grp-name">${mark(g.area, q)}</span>
        <span class="e2-grp-count">${g.rows.length}</span>
      </button>
      ${open
        ? html`<div class="e2-grp-body" role="group" aria-label=${g.area}>
            ${g.rows.slice(0, ROW_LIMIT).map((r) => row(host, r, q, current))}
            ${g.rows.length > ROW_LIMIT
              ? html`<span class="e2-hint">Показаны первые ${ROW_LIMIT} из ${g.rows.length} — уточните поиск.</span>`
              : nothing}
          </div>`
        : nothing}
    </div>
  `;
}

/** Строка устройства: крупно — что это, мелко — идентификатор и «занято». */
function row(host: BmsFloorplanCard, r: PickRow, q: string, current?: string): TemplateResult {
  const on = r.id === current;
  return html`<button class="e2-entity ${on ? 'on' : ''} ${r.taken ? 'taken' : ''}"
    data-entity=${r.id} data-taken=${r.taken ?? nothing}
    aria-pressed=${on ? 'true' : 'false'}
    @click=${() => patchSelected(host, { entityId: r.id })}>
    <span class="e2-ent-title">${mark(r.title, q)}</span>
    ${r.sub || r.taken
      ? html`<span class="e2-ent-meta">
          ${r.sub ? html`<span class="e2-ent-sub">${mark(r.sub, q)}</span>` : nothing}
          ${r.taken ? html`<span class="e2-ent-taken">занято · ${r.taken}</span>` : nothing}
        </span>`
      : nothing}
  </button>`;
}

/** «Показать все устройства» — и обратно. Сначала человек видит только то, что
 *  подходит модели: для светильника это свет и выключатели. */
function scopeButton(
  host: BmsFloorplanCard,
  model: string,
  fellBack: boolean,
  found: number,
): TemplateResult | typeof nothing {
  const st = host.e2!;
  const domains = entityDomainsFor(model);
  // Домены у модели не заданы или всё равно не сработали — переключать нечего.
  if (!domains.length || (fellBack && !st.entityAll)) return nothing;
  const flip = () => {
    st.entityAll = !st.entityAll;
    st.entityOpen = {};
    host.requestUpdate();
  };
  return html`<button class="e2-btn e2-scope" data-act="entity-all"
    aria-pressed=${st.entityAll ? 'true' : 'false'} @click=${flip}>
    ${host.ic(st.entityAll ? 'bulb' : 'grid')}
    <span class="e2-btn-lab">${st.entityAll
      ? `Только подходящие: ${domainsRu(domains)}`
      : `Показать все устройства${found ? '' : ' — подходящих нет'}`}</span>
  </button>`;
}

/** Домены по-русски: человеку «light, switch» ничего не говорит. */
const DOMAIN_RU: Record<string, string> = {
  light: 'свет', switch: 'выключатели', cover: 'шторы и ворота', lock: 'замки',
  climate: 'климат', fan: 'вентиляция', media_player: 'медиа', camera: 'камеры',
  sensor: 'датчики', binary_sensor: 'датчики', valve: 'краны', button: 'кнопки',
  water_heater: 'водонагреватели', humidifier: 'увлажнители', vacuum: 'пылесосы',
};

const domainsRu = (domains: string[]): string =>
  [...new Set(domains.map((d) => DOMAIN_RU[d] ?? d))].join(', ');

function emptyText(query: string, total: number): string {
  if (!total) return 'Home Assistant пока не отдал ни одного устройства';
  return query.trim()
    ? `По запросу «${query.trim()}» ничего не найдено`
    : 'Подходящих устройств нет — откройте «Показать все устройства»';
}

/** Совпадение строки с поиском: по имени, идентификатору И названию комнаты —
 *  «гостиная» обязана находить всё, что в гостиной. */
function hits(r: PickRow, g: PickGroup, q: string): boolean {
  return `${r.title} ${r.sub} ${g.area}`.toLowerCase().includes(q);
}

/** Подсветить найденное. */
function mark(text: string, q: string): unknown {
  if (!q) return text;
  const low = text.toLowerCase();
  const out: unknown[] = [];
  let at = 0;
  for (let i = low.indexOf(q); i >= 0; i = low.indexOf(q, at)) {
    out.push(text.slice(at, i), html`<mark class="e2-hit">${text.slice(i, i + q.length)}</mark>`);
    at = i + q.length;
  }
  if (!out.length) return text;
  out.push(text.slice(at));
  return html`${out}`;
}

/** Какой раздел открыт СРАЗУ.
 *
 *  Решение: ровно один. Развёрнутые все — это тот же плоский список, из
 *  которого мы уходим; свёрнутые все — пустой экран, на котором не видно ни
 *  одного устройства. Порядок предпочтений:
 *    1) комната уже привязанного устройства — человек пришёл смотреть именно
 *       на него;
 *    2) комната, в которой стоит сам предмет (по плану) — за ней он и пришёл;
 *    3) первый раздел — чтобы список никогда не открывался пустым. */
function autoOpenKey(
  host: BmsFloorplanCard,
  groups: PickGroup[],
  itemId: string,
  current?: string,
): string {
  if (!groups.length) return '';
  if (current) {
    const g = groups.find((x) => x.rows.some((r) => r.id === current));
    if (g) return g.key;
  }
  const room = roomOfItem(host, itemId).trim().toLowerCase();
  if (room) {
    const g = groups.find((x) => x.area.trim().toLowerCase() === room);
    if (g) return g.key;
  }
  return groups[0].key;
}

/** Комната ПЛАНА, в которой стоит предмет: самая маленькая, накрывающая его
 *  точку, а если он вне всех — ближайшая по центру. */
function roomOfItem(host: BmsFloorplanCard, itemId: string): string {
  const st = host.e2;
  const floor = st?.plan?.floors?.[st.floorIndex];
  const f = floor?.furniture?.find((x) => x.id === itemId);
  const rooms = (floor?.rooms ?? []).filter((r) => Array.isArray(r.polygon) && r.polygon.length > 2);
  if (!f || !Array.isArray(f.position) || !rooms.length) return '';
  // План — вид сверху: x и z сцены. Пересчёт делает только этот один разбор.
  const p: Vec2 = [Number(f.position[0]) || 0, Number(f.position[2]) || 0];
  let best = '';
  let bestArea = Infinity;
  for (const r of rooms) {
    if (!pointInPoly(p, r.polygon as Vec2[])) continue;
    const a = Math.abs(polyArea(r.polygon as Vec2[]));
    if (a < bestArea) {
      bestArea = a;
      best = r.name ?? '';
    }
  }
  if (best) return best;
  let bestDist = Infinity;
  for (const r of rooms) {
    const c = polyCentroid(r.polygon as Vec2[]);
    const d = Math.hypot(c[0] - p[0], c[1] - p[1]);
    if (d < bestDist) {
      bestDist = d;
      best = r.name ?? '';
    }
  }
  return best;
}
