// ---------------------------------------------------------------------------
// Мелкие кирпичики новой оболочки: кнопка, числовое поле, ряд «плиток выбора».
//
// Почему свой ряд плиток вместо <select>: выпадающий список — это системное
// окошко браузера, на планшете оно перекрывает половину экрана и рисуется не
// нашими цветами. Плитки видно все сразу, и каждая — цель под палец.
//
// Числа вводятся С КЛАВИАТУРЫ и понимают запятую: поле текстовое с цифровой
// клавиатурой, значение читается через humanNum (общий разбор проекта).
// ---------------------------------------------------------------------------

import { html, nothing, type TemplateResult } from 'lit';
import type { BmsFloorplanCard } from '../../../ha-3d-floorplan-card';
import { humanNum } from '../../format';

export interface E2BtnOpts {
  icon?: string;
  label: string;
  /** Подсказка мышью + расширенный ярлык для озвучивания. */
  hint?: string;
  cls?: string;
  active?: boolean;
  disabled?: boolean;
  /** Скрыть подпись визуально (в узкой полосе), оставив её для доступности. */
  compact?: boolean;
  act?: string;
  onClick: () => void;
}

export function e2Btn(host: BmsFloorplanCard, o: E2BtnOpts): TemplateResult {
  return html`<button
    class="e2-btn ${o.cls ?? ''} ${o.active ? 'on' : ''}"
    data-act=${o.act ?? ''}
    title=${o.hint ?? o.label}
    aria-label=${o.hint ? `${o.label}. ${o.hint}` : o.label}
    aria-pressed=${o.active === undefined ? nothing : o.active ? 'true' : 'false'}
    ?disabled=${o.disabled === true}
    @click=${o.onClick}
  >${o.icon ? host.ic(o.icon) : nothing}${o.compact
    ? nothing
    : html`<span class="e2-btn-lab">${o.label}</span>`}</button>`;
}

export interface NumFieldOpts {
  field: string;
  label: string;
  value: number | undefined;
  /** Сколько знаков показывать. Длина в метрах — два, угол — один. */
  digits?: number;
  suffix?: string;
  readonly?: boolean;
  onSet?: (v: number) => void;
}

/** Числовое поле: набирается с клавиатуры, «3,5» = 3.5. */
export function numField(o: NumFieldOpts): TemplateResult {
  const shown = o.value === undefined || !Number.isFinite(o.value)
    ? ''
    : String(Number(o.value.toFixed(o.digits ?? 2)));
  return html`<div class="e2-field">
    <span class="e2-lab">${o.label}${o.suffix ? html`, ${o.suffix}` : nothing}</span>
    <input
      class="e2-input ${o.readonly ? 'ro' : ''}"
      data-field=${o.field}
      type="text"
      inputmode="decimal"
      autocomplete="off"
      ?readonly=${o.readonly === true}
      aria-label=${o.suffix ? `${o.label} (${o.suffix})` : o.label}
      .value=${shown}
      @change=${(e: Event) => {
        if (o.readonly || !o.onSet) return;
        const v = humanNum((e.target as HTMLInputElement).value);
        if (Number.isFinite(v)) o.onSet(v);
      }}
    />
  </div>`;
}

export function textField(o: {
  field: string;
  label: string;
  value: string;
  placeholder?: string;
  onSet: (v: string) => void;
}): TemplateResult {
  return html`<div class="e2-field">
    <span class="e2-lab">${o.label}</span>
    <input
      class="e2-input"
      data-field=${o.field}
      type="text"
      autocomplete="off"
      placeholder=${o.placeholder ?? ''}
      aria-label=${o.label}
      .value=${o.value}
      @change=${(e: Event) => o.onSet((e.target as HTMLInputElement).value)}
      @input=${(e: Event) => o.onSet((e.target as HTMLInputElement).value)}
    />
  </div>`;
}

export interface ChipsOpts {
  field: string;
  label: string;
  value?: string;
  options: { id: string; label: string }[];
  onPick: (id: string) => void;
}

/** Ряд плиток вместо выпадающего списка. */
export function chips(o: ChipsOpts): TemplateResult {
  return html`<div class="e2-field">
    <span class="e2-lab">${o.label}</span>
    <div class="e2-chips" role="group" aria-label=${o.label} data-field=${o.field}>
      ${o.options.map(
        (opt) => html`<button
          class="e2-chip ${opt.id === o.value ? 'on' : ''}"
          data-chip=${opt.id}
          aria-pressed=${opt.id === o.value ? 'true' : 'false'}
          @click=${() => o.onPick(opt.id)}
        >${opt.label}</button>`,
      )}
    </div>
  </div>`;
}

export function colorField(o: {
  field: string;
  label: string;
  value?: string;
  fallback: string;
  onSet: (v: string) => void;
}): TemplateResult {
  return html`<div class="e2-field row">
    <span class="e2-lab">${o.label}</span>
    <input
      class="e2-color"
      data-field=${o.field}
      type="color"
      aria-label=${o.label}
      .value=${o.value ?? o.fallback}
      @change=${(e: Event) => o.onSet((e.target as HTMLInputElement).value)}
    />
  </div>`;
}
