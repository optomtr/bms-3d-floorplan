// ---------------------------------------------------------------------------
// Новый конструктор, часть 1: поля, кнопки, плитки выбора, списки, палитра и
// ящик «Проект». Раскладка — во второй части (styles/editor2.ts), которая
// подключает этот кусок первым: правила раскладки уточняют кнопки полосы
// инструментов и обязаны идти ПОСЛЕ базовых.
//
// Файл разделён надвое ровно по правилу «до 500 строк». Карточка по-прежнему
// подключает один editor2Styles.
//
// Цель под палец — --e2-tap (44 px, на сенсорном 48): объявлена в
// styles/editor2.ts на .e2-shell.
// ---------------------------------------------------------------------------

import { css } from 'lit';

export const editor2ControlsStyles = css`
    .e2-field {
      display: flex;
      flex-direction: column;
      gap: var(--sp-1);
    }
    .e2-field.row {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
    }
    .e2-lab {
      color: var(--mut);
      font-size: var(--fs-2);
    }
    .e2-input {
      font: inherit;
      font-size: var(--fs-4);
      min-height: var(--e2-tap);
      width: 100%;
      color: var(--tx);
      background: var(--field);
      border: 1px solid var(--w-4);
      border-radius: var(--r-2);
      padding: var(--sp-2) var(--sp-3);
    }
    .e2-input.ro {
      color: var(--mut);
      background: var(--w-1);
    }
    .e2-range {
      width: 100%;
      min-height: var(--e2-tap);
      accent-color: var(--pri);
    }
    .e2-color {
      width: var(--e2-tap);
      height: var(--e2-tap);
      padding: 2px;
      background: var(--field);
      border: 1px solid var(--w-4);
      border-radius: var(--r-2);
      cursor: pointer;
    }
    .e2-chips,
    .e2-cats {
      display: flex;
      flex-wrap: wrap;
      gap: var(--sp-2);
    }
    .e2-chip {
      font: inherit;
      font-size: var(--fs-3);
      min-height: var(--e2-tap);
      min-width: var(--e2-tap);
      padding: var(--sp-2) var(--sp-4);
      color: var(--tx);
      background: var(--w-2);
      border: 1px solid var(--w-3);
      border-radius: var(--r-pill);
      cursor: pointer;
      touch-action: manipulation;
    }
    .e2-chip.on {
      background: var(--pri);
      border-color: var(--pri);
      color: var(--tx-hi);
    }
    .e2-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--sp-2);
      font: inherit;
      font-size: var(--fs-3);
      min-height: var(--e2-tap);
      min-width: var(--e2-tap);
      padding: var(--sp-2) var(--sp-4);
      color: var(--tx);
      background: var(--w-2);
      border: 1px solid var(--w-3);
      border-radius: var(--r-2);
      cursor: pointer;
      touch-action: manipulation;
      text-align: center;
    }
    .e2-btn:active {
      background: var(--w-5);
    }
    .e2-btn.on {
      background: var(--pri);
      border-color: var(--pri);
      color: var(--tx-hi);
    }
    .e2-btn.primary {
      background: var(--ok);
      border-color: var(--ok);
    }
    .e2-btn.danger {
      color: var(--bad);
      border-color: var(--bad-line);
      background: var(--bad-soft);
    }
    .e2-btn[disabled] {
      opacity: 0.4;
      pointer-events: none;
    }
    .e2-btn .icn {
      width: 22px;
      height: 22px;
      flex: 0 0 auto;
    }
    .e2-btn-lab {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .e2-mini {
      padding: var(--sp-1) var(--sp-2);
    }
    .e2-row {
      display: flex;
      flex-wrap: wrap;
      gap: var(--sp-2);
    }
    .e2-row .e2-btn {
      flex: 1 1 auto;
    }
    .e2-hint {
      color: var(--mut);
      font-size: var(--fs-2);
      line-height: 1.35;
    }
    .e2-group {
      color: var(--w-6);
      font-size: var(--fs-1);
      letter-spacing: 0.06em;
      text-transform: uppercase;
      padding-top: var(--sp-3);
    }
    .e2-bound {
      display: flex;
      align-items: center;
      gap: var(--sp-2);
      padding: var(--sp-2);
      border-radius: var(--r-2);
      background: var(--good-soft);
      border: 1px solid var(--good-line);
    }
    .e2-bound > span {
      flex: 1 1 auto;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: var(--fs-2);
    }
    /* Только что поставленный светильник ещё ничем не управляет: раздел
       «Устройство» выделен тёплым — тем же цветом, которым во всей карточке
       обозначен свет. Гаснет, как только устройство выбрано. */
    .e2-field.e2-ask {
      padding: var(--sp-2);
      border-radius: var(--r-2);
      background: var(--accent-soft);
      border: 1px solid var(--accent-line);
    }
    .e2-ask-note {
      color: var(--accent);
      font-size: var(--fs-2);
      line-height: 1.35;
    }
    .e2-entities,
    .e2-list {
      display: flex;
      flex-direction: column;
      gap: var(--sp-1);
      max-height: 260px;
      overflow-y: auto;
      scrollbar-width: thin;
    }
    .e2-entity {
      font: inherit;
      font-size: var(--fs-3);
      min-height: var(--e2-tap);
      padding: var(--sp-2) var(--sp-3);
      color: var(--tx);
      background: var(--w-1);
      border: 1px solid var(--w-3);
      border-radius: var(--r-2);
      cursor: pointer;
      text-align: left;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      touch-action: manipulation;
    }
    .e2-entity.on {
      background: var(--pri-soft);
      border-color: var(--pri);
    }
    .e2-model {
      display: flex;
      align-items: center;
      gap: var(--sp-3);
      min-height: 56px;
      padding: var(--sp-2) var(--sp-3);
      color: var(--tx);
      background: var(--w-2);
      border: 1px solid var(--w-3);
      border-radius: var(--r-2);
      cursor: pointer;
      font: inherit;
      font-size: var(--fs-3);
      text-align: left;
    }
    .e2-model img {
      width: 40px;
      height: 40px;
      object-fit: contain;
    }
    .e2-model > span {
      flex: 1 1 auto;
    }
    .e2-sheet,
    .e2-drawer {
      position: absolute;
      z-index: var(--z-panel);
      display: flex;
      flex-direction: column;
      background: var(--glass-2);
      border: 1px solid var(--w-4);
      border-radius: var(--r-4);
      box-shadow: 0 12px 36px var(--shadow);
      overflow: hidden;
    }
    .e2-palette {
      right: var(--sp-4);
      bottom: var(--sp-6);
      top: 76px;
      width: min(520px, 78%);
    }
    .e2-drawer {
      right: 0;
      top: 0;
      bottom: 0;
      width: min(420px, 92%);
      border-radius: var(--r-4) 0 0 var(--r-4);
    }
    .e2-scrim {
      position: absolute;
      inset: 0;
      z-index: var(--z-menu);
      background: var(--scrim);
    }
    .e2-sheet-head {
      display: flex;
      align-items: center;
      gap: var(--sp-2);
      padding: var(--sp-3) var(--sp-4);
      font-size: var(--fs-4);
      font-weight: 700;
      border-bottom: 1px solid var(--w-3);
      flex: 0 0 auto;
    }
    .e2-sheet-head > span {
      flex: 1 1 auto;
    }
    .e2-sheet-row {
      padding: var(--sp-3) var(--sp-4) 0;
    }
    .e2-cats {
      padding: var(--sp-3) var(--sp-4) 0;
    }
    .e2-models {
      flex: 1 1 auto;
      min-height: 0;
      overflow-y: auto;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(104px, 1fr));
      gap: var(--sp-2);
      padding: var(--sp-3) var(--sp-4) var(--sp-5);
      scrollbar-width: thin;
    }
    .e2-model-cell {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--sp-1);
      min-height: 104px;
      padding: var(--sp-2);
      font: inherit;
      font-size: var(--fs-1);
      color: var(--tx);
      background: var(--w-1);
      border: 1px solid var(--w-3);
      border-radius: var(--r-2);
      cursor: pointer;
      touch-action: manipulation;
    }
    .e2-model-cell.on {
      background: var(--pri-soft);
      border-color: var(--pri);
    }
    .e2-model-cell img {
      width: 64px;
      height: 64px;
      object-fit: contain;
    }
    .e2-model-cell span {
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      text-align: center;
    }
    .e2-drawer-body {
      flex: 1 1 auto;
      min-height: 0;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: var(--sp-3);
      padding: var(--sp-3) var(--sp-4) var(--sp-6);
      scrollbar-width: thin;
      -webkit-overflow-scrolling: touch;
    }
    .e2-file {
      position: relative;
    }
    @media (hover: hover) {
      .e2-btn:hover,
      .e2-chip:hover,
      .e2-entity:hover,
      .e2-model-cell:hover {
        background: var(--w-4);
      }
    }
`;
