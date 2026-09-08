// ---------------------------------------------------------------------------
// КОНТЕКСТНЫЙ ИНСПЕКТОР: показывает свойства ТОГО, что выбрано, и ничего
// больше. Ничего не выбрано — этаж и подсказка, а не пятнадцать разделов.
//
// Все числа набираются с клавиатуры и понимают запятую (numField → humanNum).
// Выпадающих списков нет: варианты показаны плитками, каждая — цель под палец.
// ---------------------------------------------------------------------------

import { html, nothing } from 'lit';
import type { BmsFloorplanCard } from '../../../ha-3d-floorplan-card';
import { DOOR_VARIANTS, WINDOW_VARIANTS, openingVariantLabel } from '../../../scene/builder';
import { FLOOR_MATERIALS, WALL_MATERIALS, materialLabel } from '../../../scene/materials';
import { entityDomainsFor } from '../../../furniture/library';
import { modelLabel } from '../../../furniture/names';
import { getThumbnail } from '../../../furniture/thumbnails';
import { candidateEntities, entityOptionText } from '../../entities';
import { deleteSelected2, patchSelected } from '../../editor2-commands';
import { currentFloor, renameFloor2 } from '../../editor2-project';
import { chips, colorField, e2Btn, numField, textField } from './parts';

/** Сколько сущностей показываем списком. Их бывают тысячи — остальное
 *  отсекается поиском, и об этом сказано прямо, а не молча. */
const ENTITY_LIMIT = 40;

const matOptions = (list: readonly string[]) =>
  list.map((m) => ({ id: m, label: materialLabel(m) }));

export function renderE2Inspector(host: BmsFloorplanCard) {
  const st = host.e2!;
  const sel = st.selection;
  return html`
    <div class="e2-inspect" data-sel=${sel?.kind ?? 'none'}>
      <div class="e2-inspect-head">
        ${host.ic(sel ? 'pencil' : 'layers')}
        <span>${headTitle(host)}</span>
        ${sel
          ? e2Btn(host, {
              icon: 'trash', label: 'Удалить', hint: 'Удалить выбранный объект',
              cls: 'e2-mini danger', act: 'delete', compact: true,
              onClick: () => deleteSelected2(host),
            })
          : nothing}
      </div>
      <div class="e2-inspect-body">${body(host)}</div>
    </div>
  `;
}

function headTitle(host: BmsFloorplanCard): string {
  const sel = host.e2!.selection;
  if (!sel) return 'Этаж';
  switch (sel.kind) {
    case 'wall': return 'Стена';
    case 'room': return 'Комната';
    case 'opening':
      return sel.kind2 === 'door' ? 'Дверь' : sel.kind2 === 'window' ? 'Окно' : 'Проём';
    case 'furniture': return modelLabel(sel.model);
    case 'zone': return 'Зона';
  }
}

function body(host: BmsFloorplanCard) {
  const st = host.e2!;
  const sel = st.selection;
  if (!sel) return floorBody(host);
  if (sel.kind === 'wall') {
    return html`
      ${numField({ field: 'wall-length', label: 'Длина', suffix: 'м', value: sel.lengthM,
        onSet: (v) => v > 0 && patchSelected(host, { lengthM: v }) })}
      ${numField({ field: 'wall-thickness', label: 'Толщина', suffix: 'м', value: sel.thicknessM,
        onSet: (v) => v > 0 && patchSelected(host, { thicknessM: v }) })}
      ${numField({ field: 'wall-angle', label: 'Угол', suffix: '°', digits: 1, value: sel.angleDeg,
        onSet: (v) => patchSelected(host, { angleDeg: v }) })}
      ${chips({ field: 'wall-material', label: 'Покрытие', value: sel.material ?? 'plain',
        options: matOptions(WALL_MATERIALS), onPick: (m) => patchSelected(host, { material: m }) })}
      ${colorField({ field: 'wall-color', label: 'Цвет', value: sel.color, fallback: '#e8e6e1',
        onSet: (c) => patchSelected(host, { color: c }) })}
    `;
  }
  if (sel.kind === 'room') {
    return html`
      ${textField({ field: 'room-name', label: 'Название', value: sel.name ?? '',
        placeholder: 'например Гостиная', onSet: (v) => patchSelected(host, { name: v }) })}
      ${numField({ field: 'room-area', label: 'Площадь', suffix: 'м²', value: sel.areaM2, readonly: true })}
      ${chips({ field: 'room-material', label: 'Покрытие пола', value: sel.material ?? 'plain',
        options: matOptions(FLOOR_MATERIALS), onPick: (m) => patchSelected(host, { material: m }) })}
      ${colorField({ field: 'room-color', label: 'Цвет пола', value: sel.color, fallback: '#cfc7ba',
        onSet: (c) => patchSelected(host, { color: c }) })}
    `;
  }
  if (sel.kind === 'opening') {
    const variants = sel.kind2 === 'window' ? WINDOW_VARIANTS : DOOR_VARIANTS;
    return html`
      ${chips({ field: 'opening-kind', label: 'Что это', value: sel.kind2,
        options: [
          { id: 'door', label: 'Дверь' },
          { id: 'window', label: 'Окно' },
          { id: 'opening', label: 'Проём' },
        ],
        onPick: (k) => patchSelected(host, { kind2: k }) })}
      ${numField({ field: 'opening-width', label: 'Ширина', suffix: 'м', value: sel.widthM,
        onSet: (v) => v > 0 && patchSelected(host, { widthM: v }) })}
      ${numField({ field: 'opening-offset', label: 'От угла', suffix: 'м', value: sel.offsetM,
        onSet: (v) => patchSelected(host, { offsetM: Math.max(0, v) }) })}
      ${sel.kind2 === 'opening'
        ? html`<span class="e2-hint">У открытого проёма створки нет.</span>`
        : chips({ field: 'opening-variant', label: 'Створка', value: sel.variant ?? 'single',
            options: variants.map((v) => ({ id: v, label: openingVariantLabel(sel.kind2, v) })),
            onPick: (v) => patchSelected(host, { variant: v }) })}
    `;
  }
  if (sel.kind === 'furniture') {
    return html`
      <div class="e2-field">
        <span class="e2-lab">Модель</span>
        <button class="e2-model" data-act="open-palette" aria-label=${`Модель: ${modelLabel(sel.model)}. Выбрать другую`}
          @click=${() => { st.paletteFor = 'model'; st.paletteOpen = true; host.requestUpdate(); }}>
          <img src=${getThumbnail(sel.model)} alt="" />
          <span>${modelLabel(sel.model)}</span>
          ${host.ic('chevRight')}
        </button>
      </div>
      ${numField({ field: 'furn-rotation', label: 'Поворот', suffix: '°', digits: 0, value: sel.rotationDeg,
        onSet: (v) => patchSelected(host, { rotationDeg: v }) })}
      <div class="e2-row">
        ${e2Btn(host, { icon: 'undo', label: '−45°', hint: 'Повернуть против часовой на 45°', cls: 'e2-mini',
          onClick: () => patchSelected(host, { rotationDeg: sel.rotationDeg - 45 }) })}
        ${e2Btn(host, { icon: 'redo', label: '+45°', hint: 'Повернуть по часовой на 45°', cls: 'e2-mini',
          onClick: () => patchSelected(host, { rotationDeg: sel.rotationDeg + 45 }) })}
      </div>
      ${numField({ field: 'furn-scale', label: 'Размер', suffix: '×', value: sel.scale,
        onSet: (v) => v > 0 && patchSelected(host, { scale: v }) })}
      ${sel.isSet ? lightSetFields(host, sel.spread, sel.count) : nothing}
      ${entityPicker(host, sel.model, sel.entityId, st.bindPrompt === sel.id)}
    `;
  }
  return html`${textField({ field: 'zone-name', label: 'Название комнаты', value: sel.name ?? '',
    placeholder: 'например Кухня', onSet: (v) => patchSelected(host, { name: v }) })}`;
}

/** Ничего не выбрано — показываем этаж. Это ЕДИНСТВЕННОЕ, что уместно тут без
 *  выбора: всё остальное живёт в ящике «Проект». */
function floorBody(host: BmsFloorplanCard) {
  const st = host.e2!;
  const floor = currentFloor(host);
  return html`
    ${textField({ field: 'floor-name', label: 'Название этажа', value: floor?.name ?? '',
      placeholder: 'например Первый этаж', onSet: (v) => renameFloor2(host, v) })}
    ${numField({ field: 'floor-height', label: 'Высота стен', suffix: 'м',
      value: floor?.wallHeight ?? st.plan.wallHeight ?? 2.6,
      onSet: (v) => { if (floor && v > 0) { floor.wallHeight = v; host.requestUpdate(); } } })}
    <span class="e2-hint">
      Коснитесь стены, комнаты, проёма или предмета на плане — здесь появятся его свойства.
    </span>
  `;
}

/** Набор светильников: элементы РАССТАВЛЯЮТСЯ шире, а не растягиваются.
 *  «Количество» у каждой модели своё, поэтому пустое поле значит «как заложено
 *  в модели», а не «ноль штук». */
function lightSetFields(host: BmsFloorplanCard, spread?: number, count?: number) {
  return html`
    ${numField({ field: 'furn-spread', label: 'Разброс', suffix: '×', value: spread ?? 1,
      onSet: (v) => v > 0 && patchSelected(host, { spread: v }) })}
    ${numField({ field: 'furn-count', label: 'Количество', digits: 0, value: count,
      onSet: (v) => v >= 1 && patchSelected(host, { count: v }) })}
    <span class="e2-hint">
      Разброс раздвигает элементы, не меняя их размера. Пустое количество —
      столько, сколько заложено в модели; у сплошных наборов (лента, рейка) оно
      не применяется.
    </span>
  `;
}

/** Привязка сущности Home Assistant: поиск по ВСЕМ сущностям, список —
 *  кнопками, а не выпадающим окошком браузера.
 *
 *  `prompt` — светильник только что поставлен и ещё ничем не управляет: об этом
 *  говорим прямо здесь, а не оставляем человеку догадываться. */
function entityPicker(host: BmsFloorplanCard, model: string, current?: string, prompt = false) {
  const st = host.e2!;
  const { ids, fellBack } = candidateEntities(host, entityDomainsFor(model));
  const q = st.entityQuery.trim().toLowerCase();
  const found = q ? ids.filter((id) => entityOptionText(host, id).toLowerCase().includes(q)) : ids;
  const shown = found.slice(0, ENTITY_LIMIT);
  return html`
    <div class="e2-field ${prompt ? 'e2-ask' : ''}" ?data-bind-prompt=${prompt}>
      <span class="e2-lab">Устройство Home Assistant</span>
      ${prompt
        ? html`<span class="e2-ask-note" role="status">
            Светильник поставлен. Выберите устройство — без него он не включится,
            это просто украшение на плане.
          </span>`
        : nothing}
      ${current
        ? html`<div class="e2-bound" data-bound=${current}>
            ${host.ic('link')}<span>${entityOptionText(host, current)}</span>
            <button class="e2-mini" data-act="unbind" aria-label="Снять привязку"
              title="Снять привязку" @click=${() => patchSelected(host, { entityId: '' })}>
              ${host.ic('close')}
            </button>
          </div>`
        : nothing}
      <input class="e2-input" data-field="entity-search" type="search" autocomplete="off"
        placeholder="поиск по устройствам…" aria-label="Поиск устройства Home Assistant"
        .value=${st.entityQuery}
        @input=${(e: Event) => { st.entityQuery = (e.target as HTMLInputElement).value; host.requestUpdate(); }} />
      ${fellBack
        ? html`<span class="e2-hint">Для этой модели подходящих доменов не нашлось — показаны все устройства.</span>`
        : nothing}
      <div class="e2-entities" role="listbox" aria-label="Устройства">
        ${shown.map(
          (id) => html`<button class="e2-entity ${id === current ? 'on' : ''}" data-entity=${id}
            role="option" aria-selected=${id === current ? 'true' : 'false'}
            @click=${() => patchSelected(host, { entityId: id })}>
            ${entityOptionText(host, id)}
          </button>`,
        )}
        ${!shown.length
          ? html`<span class="e2-hint">${ids.length
              ? `По запросу «${st.entityQuery}» ничего не найдено`
              : 'Home Assistant пока не отдал ни одного устройства'}</span>`
          : nothing}
      </div>
      ${found.length > ENTITY_LIMIT
        ? html`<span class="e2-hint">Показаны первые ${ENTITY_LIMIT} из ${found.length} — уточните поиск.</span>`
        : nothing}
    </div>
  `;
}
