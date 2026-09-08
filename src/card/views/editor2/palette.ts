// ---------------------------------------------------------------------------
// Палитра мебели: разделы по-русски, поиск, картинки моделей.
//
// Ничего своего здесь не заведено — всё берётся из готового справочника
// проекта: MODEL_CATEGORIES и modelLabel (src/furniture/names), картинки
// getThumbnail (src/furniture/thumbnails). Выбранная модель уходит в движок
// одним вызовом setPendingModel — палитра живёт в оболочке, как велит договор.
//
// Показываем ОДИН раздел за раз: рисовать все 190 картинок разом — это 190
// кадров offscreen-WebGL на открытие панели, на планшете это заметно.
// ---------------------------------------------------------------------------

import { html, nothing } from 'lit';
import type { BmsFloorplanCard } from '../../../ha-3d-floorplan-card';
import { MODEL_CATEGORIES, modelLabel } from '../../../furniture/names';
import { getThumbnail } from '../../../furniture/thumbnails';
import { pickModel2 } from '../../editor2-commands';
import { e2Btn } from './parts';

export function renderE2Palette(host: BmsFloorplanCard) {
  const st = host.e2!;
  const q = st.paletteQuery.trim().toLowerCase();
  const cat = MODEL_CATEGORIES.find((c) => c.id === st.paletteCat) ?? MODEL_CATEGORIES[0];
  const keys: string[] = q
    ? MODEL_CATEGORIES.flatMap((c) => c.keys as readonly string[]).filter(
        (k) => modelLabel(k).toLowerCase().includes(q) || k.includes(q),
      )
    : [...cat.keys];

  return html`
    <div class="e2-sheet e2-palette" role="dialog" aria-label="Выбор модели мебели">
      <div class="e2-sheet-head">
        ${host.ic('couch')}<span>Мебель и светильники</span>
        ${e2Btn(host, {
          icon: 'close', label: 'Закрыть', hint: 'Закрыть палитру', cls: 'e2-mini',
          act: 'palette-close', compact: true,
          onClick: () => { st.paletteOpen = false; host.requestUpdate(); },
        })}
      </div>
      <div class="e2-sheet-row">
        <input class="e2-input" data-field="palette-search" type="search" autocomplete="off"
          placeholder="поиск модели…" aria-label="Поиск модели мебели"
          .value=${st.paletteQuery}
          @input=${(e: Event) => { st.paletteQuery = (e.target as HTMLInputElement).value; host.requestUpdate(); }} />
      </div>
      ${q
        ? nothing
        : html`<div class="e2-cats" role="tablist" aria-label="Разделы палитры">
            ${MODEL_CATEGORIES.map(
              (c) => html`<button class="e2-chip ${c.id === cat.id ? 'on' : ''}" role="tab"
                data-cat=${c.id} aria-selected=${c.id === cat.id ? 'true' : 'false'}
                @click=${() => { st.paletteCat = c.id; host.requestUpdate(); }}>${c.label}</button>`,
            )}
          </div>`}
      <div class="e2-models">
        ${keys.map(
          (k) => html`<button class="e2-model-cell ${k === st.model ? 'on' : ''}" data-model=${k}
            title=${modelLabel(k)} aria-label=${modelLabel(k)}
            @click=${() => pickModel2(host, k)}>
            <img src=${getThumbnail(k)} alt="" />
            <span>${modelLabel(k)}</span>
          </button>`,
        )}
        ${!keys.length
          ? html`<span class="e2-hint">По запросу «${st.paletteQuery}» ничего не найдено</span>`
          : nothing}
      </div>
    </div>
  `;
}
