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
      gap: 6px;
      top: 10px;
      left: 10px;
      bottom: 10px;
      width: 270px;
      max-width: 80%;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 10px;
      scrollbar-width: thin;
      border-radius: 12px;
      background: rgba(22, 24, 28, 0.86);
      border: 1px solid rgba(255, 255, 255, 0.12);
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
      font-size: 14px;
      font-weight: 700;
      color: #fff;
      padding: 2px 2px 2px;
    }
    /* Uniform two-column button grid — buttons stretch so the panel reads tidy. */
    .grid2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
    }
    .grid2 .btn {
      width: 100%;
      text-align: center;
      padding: 8px 6px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .span2 {
      grid-column: 1 / -1;
    }
    .pin-box {
      width: min(300px, 86%);
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 16px;
      border-radius: 12px;
      background: rgba(24, 26, 30, 0.98);
      border: 1px solid rgba(255, 255, 255, 0.16);
    }
    .pin-error {
      font-size: 12px;
      color: #ff9a9a;
    }
    /* Own confirm/prompt + the "import from the old version" list. Kept here,
       next to .pin-box, so the three @media blocks stay LAST in this sheet —
       in this file the order of rules IS the cascade. */
    .ask-msg {
      font-size: 13px;
      line-height: 1.4;
      color: #d8dde6;
    }
    /* Wider than the PIN box: these carry a sentence, not four digits. */
    .ask-form {
      width: min(420px, 92%);
    }
    .legacy-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      min-height: 0;
      overflow-y: auto;
    }
    .btn.danger {
      background: rgba(190, 60, 60, 0.9);
      border-color: rgba(255, 140, 140, 0.5);
    }
    .legacy-src {
      display: flex;
      flex-direction: column;
      gap: 2px;
      padding: 8px 10px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.06);
    }
    .legacy-head {
      font-size: 13px;
      font-weight: 600;
      color: #fff;
    }
    .legacy-names {
      font-size: 12px;
      color: #cfe0ff;
      word-break: break-word;
    }
    .panel-section {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid rgba(255, 255, 255, 0.12);
    }
    .color {
      width: 42px;
      height: 30px;
      padding: 0;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 6px;
      background: transparent;
      cursor: pointer;
    }
    .name-input {
      flex: 1;
      min-width: 0;
      font: inherit;
      font-size: 13px;
      color: #fff;
      background: rgba(30, 33, 40, 0.82);
      border: 1px solid rgba(255, 255, 255, 0.16);
      border-radius: 8px;
      padding: 7px 10px;
    }
    .num-input {
      width: 72px;
      font: inherit;
      font-size: 13px;
      color: #fff;
      background: rgba(30, 33, 40, 0.82);
      border: 1px solid rgba(255, 255, 255, 0.16);
      border-radius: 8px;
      padding: 6px 8px;
    }
    .import-modal {
      position: absolute;
      inset: 0;
      z-index: 6;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.5);
    }
    .import-box {
      width: min(560px, 92%);
      max-height: 86%;
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 14px;
      border-radius: 12px;
      background: rgba(24, 26, 30, 0.98);
      border: 1px solid rgba(255, 255, 255, 0.16);
    }
    .import-title {
      font-size: 14px;
      font-weight: 600;
      color: #fff;
    }
    .import-text {
      width: 100%;
      box-sizing: border-box;
      min-height: 240px;
      resize: vertical;
      font-family: ui-monospace, Menlo, Consolas, monospace;
      font-size: 12px;
      color: #e6e6e6;
      background: rgba(15, 17, 20, 0.95);
      border: 1px solid rgba(255, 255, 255, 0.16);
      border-radius: 8px;
      padding: 10px;
    }
    .toolrow {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      align-items: center;
    }
    .select.wide {
      min-width: 150px;
    }
    .hint {
      font-size: 12px;
      color: #cfe0ff;
      background: rgba(30, 33, 40, 0.7);
      padding: 4px 8px;
      border-radius: 6px;
    }
    ha-entity-picker {
      width: 240px;
      max-width: 70vw;
    }
    .palette-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    .palette-thumb {
      width: 28px;
      height: 28px;
      border-radius: 4px;
      background: rgba(255, 255, 255, 0.06);
    }
    .palette {
      background: rgba(22, 24, 28, 0.96);
      border: 1px solid rgba(255, 255, 255, 0.16);
      border-radius: 12px;
      padding: 8px 10px;
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
      background: rgba(255, 255, 255, 0.04);
      border-radius: 8px;
      padding: 5px 7px;
    }
    .zone-dev {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: #ddd;
      cursor: pointer;
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
      color: #f3a83c;
      font-style: normal;
    }
    /* Ordered device list for the selected room (reorder ▲▼, ✕ removes). */
    .zone-order {
      display: flex;
      flex-direction: column;
      gap: 3px;
      max-height: 28vh;
      overflow-y: auto;
      overflow-x: hidden;
      background: rgba(255, 255, 255, 0.04);
      border-radius: 8px;
      padding: 5px;
    }
    .zrow {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: #ddd;
    }
    .zrow .zname {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .zbtn {
      flex: none;
      width: 26px;
      height: 24px;
      border-radius: 6px;
      border: 1px solid var(--brd);
      background: rgba(255, 255, 255, 0.06);
      color: var(--tx);
      cursor: pointer;
      font-size: 11px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .zbtn:hover {
      background: rgba(255, 255, 255, 0.14);
    }
    .zbtn:disabled {
      opacity: 0.3;
      cursor: default;
    }
    .zbtn.del:hover {
      background: rgba(214, 69, 69, 0.5);
    }
    .palette-group,
    .panel-group {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: #8fa6c4;
      margin: 8px 2px 2px;
      padding-bottom: 4px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .palette-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, 76px);
      gap: 6px;
      justify-content: start;
    }
    .palette-cell {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      width: 76px;
      padding: 4px;
      border-radius: 8px;
      border: 1px solid transparent;
      background: rgba(255, 255, 255, 0.04);
      color: #ddd;
      font: inherit;
      font-size: 10px;
      cursor: pointer;
    }
    .palette-cell:hover {
      background: rgba(255, 255, 255, 0.1);
    }
    .palette-cell.active {
      border-color: var(--primary-color, #03a9f4);
      background: rgba(3, 169, 244, 0.18);
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
`;
