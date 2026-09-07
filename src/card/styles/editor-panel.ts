// ---------------------------------------------------------------------------
// Панель редактора: тулбар, сетки кнопок, поля, диалоги (PIN, перенос
// из старой версии), палитра моделей и списки устройств комнаты.
//
// Кусок общей таблицы стилей карточки. ПОРЯДОК кусков в массиве
// `BmsFloorplanCard.styles` = порядок каскада: в файле есть селекторы,
// которые повторяются, и побеждает последний. Переставлять нельзя.
// ---------------------------------------------------------------------------

import { css } from 'lit';

export const editorPanelStyles = css`
    .toolbar {
      flex-direction: column;
      align-items: stretch;
      gap: var(--sp-2);
      top: var(--sp-3);
      left: var(--sp-3);
      bottom: var(--sp-3);
      /* Было 270px + 20 отступа + 2 рамки = 292 наружу и 270 под содержимое.
         С box-sizing ширина стала полной, а кнопки выросли до 44px — поэтому
         300px: две колонки по 136px, как и было. */
      width: 300px;
      max-width: 80%;
      overflow-y: auto;
      overflow-x: hidden;
      padding: var(--sp-3);
      scrollbar-width: thin;
      border-radius: var(--r-3);
      background: var(--glass-2);
      border: 1px solid var(--w-4);
      backdrop-filter: blur(6px);
      -webkit-overflow-scrolling: touch;
    }
    /* The toolbar is a scrolling column — its children must keep their natural
       height (never shrink), or long content like the palette collapses to a
       thin unusable strip. */
    .toolbar > * {
      flex: 0 0 auto;
    }
    .ed-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: var(--fs-4);
      font-weight: 700;
      color: var(--tx);
      padding: 2px 2px 2px;
    }
    /* Uniform two-column button grid — buttons stretch so the panel reads tidy. */
    .grid2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--sp-2);
    }
    .grid2 .btn {
      width: 100%;
      text-align: center;
      padding: var(--sp-3) var(--sp-2);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .span2 {
      grid-column: 1 / -1;
    }
    .pin-box {
      /* min(300px) при box-sizing съело бы 32px отступа из содержимого. */
      width: min(340px, 86%);
      display: flex;
      flex-direction: column;
      gap: var(--sp-3);
      padding: var(--sp-5);
      border-radius: var(--r-3);
      background: var(--glass-2);
      border: 1px solid var(--w-5);
    }
    .pin-error {
      font-size: var(--fs-2);
      color: var(--bad);
    }
    /* Own confirm/prompt + the "import from the old version" list. Kept here,
       next to .pin-box, so the three @media blocks stay LAST in this sheet —
       in this file the order of rules IS the cascade. */
    .ask-msg {
      font-size: var(--fs-3);
      line-height: 1.4;
      color: var(--tx);
    }
    /* Wider than the PIN box: these carry a sentence, not four digits. */
    .ask-form {
      width: min(420px, 92%);
    }
    .legacy-list {
      display: flex;
      flex-direction: column;
      gap: var(--sp-3);
      min-height: 0;
      overflow-y: auto;
    }
    .btn.danger {
      background: var(--bad-line);
      border-color: var(--bad);
      color: var(--tx);
    }
    .legacy-src {
      display: flex;
      flex-direction: column;
      gap: 2px;
      padding: var(--sp-3) var(--sp-3);
      border-radius: var(--r-2);
      background: var(--w-2);
    }
    .legacy-head {
      font-size: var(--fs-3);
      font-weight: 600;
      color: var(--tx);
    }
    .legacy-names {
      font-size: var(--fs-2);
      color: var(--info);
      word-break: break-word;
    }
    .panel-section {
      display: flex;
      flex-direction: column;
      gap: var(--sp-2);
      margin-top: var(--sp-3);
      padding-top: var(--sp-3);
      border-top: 1px solid var(--w-4);
    }
    .color {
      width: var(--tap);
      height: var(--tap);
      padding: 0;
      border: 1px solid var(--w-5);
      border-radius: var(--r-1);
      background: transparent;
      cursor: pointer;
    }
    .name-input {
      flex: 1;
      min-width: 0;
      min-height: var(--tap);
      font: inherit;
      font-size: var(--fs-3);
      color: var(--tx);
      background: var(--field);
      border: 1px solid var(--w-5);
      border-radius: var(--r-2);
      padding: var(--sp-2) var(--sp-3);
    }
    .num-input {
      /* 72px при box-sizing не вмещали бы четыре знака с отступами. */
      width: 84px;
      min-height: var(--tap);
      font: inherit;
      font-size: var(--fs-3);
      color: var(--tx);
      background: var(--field);
      border: 1px solid var(--w-5);
      border-radius: var(--r-2);
      padding: var(--sp-2) var(--sp-3);
    }
    .import-modal {
      position: absolute;
      inset: 0;
      z-index: var(--z-popup);
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--scrim);
    }
    .import-box {
      width: min(560px, 92%);
      max-height: 86%;
      display: flex;
      flex-direction: column;
      gap: var(--sp-3);
      padding: var(--sp-4);
      border-radius: var(--r-3);
      background: var(--glass-2);
      border: 1px solid var(--w-5);
    }
    .import-title {
      font-size: var(--fs-4);
      font-weight: 600;
      color: var(--tx);
    }
    .import-text {
      width: 100%;
      min-height: 240px;
      resize: vertical;
      font-family: ui-monospace, Menlo, Consolas, monospace;
      font-size: var(--fs-2);
      color: var(--tx);
      background: var(--bg-0);
      border: 1px solid var(--w-5);
      border-radius: var(--r-2);
      padding: var(--sp-3);
    }
    .toolrow {
      display: flex;
      flex-wrap: wrap;
      gap: var(--sp-2);
      align-items: center;
    }
    .select.wide {
      min-width: 150px;
    }
    /* Ползунки редактора (прозрачность подложки и её масштаб, прозрачность
       и размер выбранного предмета) размечены БЕЗ класса и оставались
       браузерными — 16px высоты, то есть мимо пальца начисто. */
    .toolbar input[type='range'] {
      flex: 1 1 120px;
      min-width: 120px;
      height: var(--tap);
      accent-color: var(--accent);
      cursor: pointer;
      touch-action: manipulation;
    }
    .hint {
      font-size: var(--fs-2);
      line-height: 1.35;
      color: var(--info);
      background: var(--field);
      padding: var(--sp-1) var(--sp-3);
      border-radius: var(--r-1);
    }
    ha-entity-picker {
      width: 240px;
      max-width: 70vw;
    }
    .palette-btn {
      display: inline-flex;
      align-items: center;
      gap: var(--sp-3);
    }
    .palette-thumb {
      width: 28px;
      height: 28px;
      border-radius: var(--r-1);
      background: var(--w-2);
    }
    .palette {
      background: var(--glass-2);
      border: 1px solid var(--w-5);
      border-radius: var(--r-3);
      padding: var(--sp-3) var(--sp-3);
      max-height: 50vh;
      overflow-y: auto;
      overflow-x: hidden;
      backdrop-filter: blur(6px);
      max-width: 340px;
      flex: 0 0 auto; /* never let the flex column squish it to a thin strip */
    }
    .zone-devs {
      display: flex;
      flex-direction: column;
      gap: 2px;
      max-height: 34vh;
      overflow-y: auto;
      overflow-x: hidden;
      background: var(--w-1);
      border-radius: var(--r-2);
      padding: var(--sp-1) var(--sp-2);
    }
    /* Строка-галочка «привязать сущность к комнате»: это тоже цель под палец,
       раньше строка была высотой в один кегль 12px. */
    .zone-dev {
      display: flex;
      align-items: center;
      gap: var(--sp-3);
      min-height: var(--tap);
      padding: 0 var(--sp-1);
      border-radius: var(--r-1);
      font-size: var(--fs-2);
      color: var(--tx);
      cursor: pointer;
      touch-action: manipulation;
    }
    .zone-dev:active {
      background: var(--w-3);
    }
    .zone-dev input {
      width: 20px;
      height: 20px;
      flex: none;
    }
    .zone-dev span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    /* An entity already assigned to another room is dimmed + tagged. */
    .zone-dev.taken {
      opacity: 0.6;
    }
    .zone-dev .taken-tag {
      color: var(--accent);
      font-style: normal;
    }
    /* Ordered device list for the selected room (reorder ▲▼, ✕ removes). */
    .zone-order {
      display: flex;
      flex-direction: column;
      gap: var(--sp-1);
      max-height: 28vh;
      overflow-y: auto;
      overflow-x: hidden;
      background: var(--w-1);
      border-radius: var(--r-2);
      padding: var(--sp-1);
    }
    .zrow {
      display: flex;
      align-items: center;
      gap: var(--sp-1);
      font-size: var(--fs-2);
      color: var(--tx);
    }
    .zrow .zname {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    /* Было 26x24 — самая мелкая цель во всём продукте, и одна из кнопок
       УДАЛЯЕТ привязку комнаты. */
    .zbtn {
      flex: none;
      width: var(--tap);
      height: var(--tap);
      border-radius: var(--r-1);
      border: 1px solid var(--brd);
      background: var(--w-2);
      color: var(--tx);
      cursor: pointer;
      font-size: var(--fs-2);
      display: flex;
      align-items: center;
      justify-content: center;
      touch-action: manipulation;
    }
    .zbtn:active {
      background: var(--w-5);
    }
    .zbtn:disabled {
      opacity: 0.3;
      cursor: default;
    }
    .zbtn.del:active {
      background: var(--bad-line);
    }
    .palette-group,
    .panel-group {
      font-size: var(--fs-1);
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--mut);
      margin: var(--sp-3) 2px 2px;
      padding-bottom: var(--sp-1);
      border-bottom: 1px solid var(--w-3);
    }
    .palette-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, 76px);
      gap: var(--sp-2);
      justify-content: start;
    }
    .palette-cell {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      width: 76px;
      min-height: var(--tap);
      padding: var(--sp-1);
      border-radius: var(--r-2);
      border: 1px solid transparent;
      background: var(--w-1);
      color: var(--tx);
      font: inherit;
      font-size: var(--fs-1);
      cursor: pointer;
      touch-action: manipulation;
    }
    .palette-cell:active {
      background: var(--w-4);
    }
    .palette-cell.active {
      border-color: var(--pri);
      background: var(--pri-soft);
    }
    .palette-cell img {
      width: 64px;
      height: 64px;
    }
    .palette-cell span {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 68px;
    }
    @media (hover: hover) {
      .zbtn:hover {
        background: var(--w-4);
      }
      .zbtn.del:hover {
        background: var(--bad-line);
      }
      .palette-cell:hover {
        background: var(--w-3);
      }
    }
`;
