// ---------------------------------------------------------------------------
// УСТАРЕВШИЕ ПРИВЯЗКИ: план ссылается на устройства, которых в Home Assistant
// уже нет.
//
// Откуда берутся: сущность удалили или переименовали (сменили интеграцию,
// пересобрали шлюз, увезли демо-дом), а строчка в плане осталась. На объекте
// владельца таких было четыре — остатки чужого демо-дома: кухня и домофон,
// которых в офисе нет.
//
// Клиенту про них не пишут ВООБЩЕ (см. scene/bindings.ts, isEntityMissing):
// надпись «Нет связи» он читает как поручение себе и идёт проверять розетку —
// а проверять нечего. Но и молчать нельзя: молчание превратило бы починку в
// сокрытие. Поэтому ровно одно место, где это видно, — конструктор, то есть
// тот, кто план и правит. Плашка сделана как `.plan-warning` карточки (те же
// цвета, тот же значок): второго вида предупреждений в системе заводить не за
// чем.
// ---------------------------------------------------------------------------

import { html, nothing } from 'lit';
import type { BmsFloorplanCard } from '../../../ha-3d-floorplan-card';
import { floorList } from '../../../editor2/model';
import { modelLabel } from '../../../furniture/names';
import { askConfirm } from '../../dialogs';
import { e2Btn } from './parts';

/** Одна привязка, ведущая в никуда. */
export interface BrokenBinding {
  entityId: string;
  /** Что стоит на плане: «Люстра», «Штора». Человек ищет глазами вещь. */
  what: string;
  /** Этаж — только если этажей больше одного. */
  where: string;
}

/** Сколько строк списка показываем целиком: дальше «и ещё N». */
const LIST_LIMIT = 8;

/**
 * Привязки правимого плана, у которых сущности нет в Home Assistant.
 *
 * Пока hass не пришёл (или не отдал НИ ОДНОГО состояния) — молчим: обвинить
 * весь план в устаревании из-за не доехавшего списка состояний хуже, чем
 * промолчать. Это ровно та же осторожность, что и в scene/room-grouping.ts,
 * где отсутствие hass означает «ничего не отбрасываем».
 */
export function brokenBindings(host: BmsFloorplanCard): BrokenBinding[] {
  const st = host.e2;
  const states = host.hass?.states;
  if (!st || !states || !Object.keys(states).length) return [];
  const floors = floorList(st.plan);
  const many = floors.length > 1;
  const out: BrokenBinding[] = [];
  floors.forEach((f, i) => {
    for (const b of f.bindings ?? []) {
      const id = b?.entity_id;
      if (!id || states[id]) continue;
      const item = (f.furniture ?? []).find((x) => !!x.id && x.id === b.anchor_object);
      out.push({
        entityId: id,
        what: item ? modelLabel(item.model) : 'точка на плане',
        where: many ? f.name || `этаж ${i + 1}` : '',
      });
    }
  });
  return out;
}

/** Строка списка: что стоит на плане и куда оно ведёт. */
const lineOf = (b: BrokenBinding): string =>
  `${b.what}${b.where ? ` · ${b.where}` : ''} → ${b.entityId}`;

/** Плашка над планом. Ничего нет — ничего и не показываем: постоянная
 *  «всё хорошо» перестаёт читаться через день. */
export function renderE2Broken(host: BmsFloorplanCard) {
  const list = brokenBindings(host);
  if (!list.length) return nothing;
  const shown = list.slice(0, LIST_LIMIT);
  return html`
    <div class="plan-warning e2-warn" role="alert" data-broken=${list.length}>
      <span class="pw-ic">${host.ic('warn')}</span>
      <div class="e2-warn-txt">
        <b class="e2-warn-head">Привязок к несуществующим устройствам: ${list.length}</b>
        <span class="e2-warn-what">
          Эти привязки ведут к устройствам, которых в Home Assistant нет — их удалили
          или переименовали. На плане у клиента они ничего не показывают. Уберите их
          или привяжите предметы к живым устройствам заново.
        </span>
        <ul class="e2-warn-list">
          ${shown.map((b) => html`<li data-entity=${b.entityId}>${lineOf(b)}</li>`)}
          ${list.length > shown.length
            ? html`<li class="e2-warn-more">и ещё ${list.length - shown.length}</li>`
            : nothing}
        </ul>
      </div>
      ${e2Btn(host, {
        icon: 'trash',
        label: 'Убрать битые привязки',
        hint: 'Убрать из плана привязки к несуществующим устройствам. Предметы останутся на месте',
        cls: 'e2-warn-act danger',
        act: 'clean-broken',
        onClick: () => void onCleanBroken(host),
      })}
    </div>
  `;
}

/** Убрать битые привязки. Спрашиваем СВОИМ окном (системные confirm/alert в
 *  проекте запрещены), убираем через движок — значит, правка попадает в
 *  «Отменить» и уезжает тем же «Сохранить», что и всё остальное. */
export async function onCleanBroken(host: BmsFloorplanCard): Promise<void> {
  const st = host.e2;
  if (!st) return;
  const list = brokenBindings(host);
  if (!list.length) return;
  const ok = await askConfirm(
    host,
    `Убрать привязки к несуществующим устройствам: ${list.length}?`,
    `Уйдут только ссылки на устройства, которых нет в Home Assistant (${list
      .slice(0, 4)
      .map((b) => b.entityId)
      .join(', ')}${list.length > 4 ? ` и ещё ${list.length - 4}` : ''}). Сами предметы` +
      ' останутся на плане, а действие можно отменить кнопкой «Отменить».',
    'Убрать',
  );
  if (!ok) return;
  const gone = st.editor.removeBindings(list.map((b) => b.entityId));
  st.selection = st.editor.getSelection();
  st.canUndo = st.editor.canUndo();
  st.canRedo = st.editor.canRedo();
  host.requestUpdate();
  host.showToast(
    gone
      ? `Убрано привязок: ${gone}. Нажмите «Сохранить», чтобы записать.`
      : 'Убирать нечего: битых привязок не осталось',
  );
}
