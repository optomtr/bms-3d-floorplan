// ---------------------------------------------------------------------------
// Правая панель комнаты: заголовок, чипы, график за сутки, «Отчёт»,
// тело списка карточек.
//
// Кусок общей таблицы стилей карточки. ПОРЯДОК кусков в массиве
// `BmsFloorplanCard.styles` = порядок каскада: в файле есть селекторы,
// которые повторяются, и побеждает последний. Переставлять нельзя.
// ---------------------------------------------------------------------------

import { css } from 'lit';

export const roomPanelStyles = css`
    /* ---- Right-side room control panel ---- */
    .room-panel {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      width: var(--panel-w);
      z-index: 5;
      display: flex;
      flex-direction: column;
      background: var(--model, #141519);
      border-left: 1px solid var(--brd);
      animation: panel-in 0.28s cubic-bezier(0.22, 1, 0.36, 1) both;
    }
    @keyframes panel-in {
      from { transform: translateX(18px); opacity: 0; }
      to { transform: none; opacity: 1; }
    }
    .rp-head {
      padding: 26px 22px 12px;
    }
    .rp-name {
      font-size: 25px;
      font-weight: 700;
      color: #fff;
      letter-spacing: -0.01em;
    }
    .rp-chips {
      display: flex;
      gap: 8px;
      margin-top: 12px;
    }
    .rp-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 11px;
      border-radius: 11px;
      background: var(--card);
      border: 1px solid var(--brd);
      font-size: 14px;
      font-weight: 600;
      color: var(--tx);
    }
    .rp-chip .icn {
      width: 17px;
      height: 17px;
      color: var(--mut);
    }
    .rp-chip.cool .icn {
      color: var(--cool);
    }
    .rp-chip.warm .icn {
      color: var(--accent, #f3a83c);
    }
    button.rp-chip {
      cursor: pointer;
      font: inherit;
    }
    .rp-chip.sel {
      border-color: var(--accent, #f3a83c);
      box-shadow: inset 0 0 0 1px var(--accent, #f3a83c);
    }
    .rp-spark-wrap {
      margin-top: 10px;
      padding: 6px 8px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--brd, rgba(255, 255, 255, 0.08));
    }
    .rp-spark {
      display: block;
      width: 100%;
      height: auto;
    }
    .rp-spark .spark {
      fill: none;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
      vector-effect: non-scaling-stroke;
    }
    .rp-spark .spark.air {
      stroke: var(--accent, #f3a83c);
    }
    .rp-spark .spark.warm {
      stroke: #ff6b5e;
      opacity: 0.85;
    }
    .rp-spark .spark.hum {
      stroke: var(--cool, #5aa9e6);
    }
    .rp-spark .spark-grid {
      stroke: rgba(255, 255, 255, 0.09);
      stroke-width: 1;
      vector-effect: non-scaling-stroke;
    }
    .rp-spark .spark-axis {
      fill: rgba(255, 255, 255, 0.55);
      font-size: 9px;
    }
    .spark-legend {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-bottom: 4px;
    }
    .spark-leg {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 11px;
      color: rgba(255, 255, 255, 0.7);
    }
    .spark-leg i {
      width: 11px;
      height: 3px;
      border-radius: 2px;
      display: inline-block;
    }
    .spark-leg.air i { background: var(--accent, #f3a83c); }
    .spark-leg.warm i { background: #ff6b5e; }
    .spark-leg.hum i { background: var(--cool, #5aa9e6); }
    .report-back {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.55);
      z-index: 20;
      animation: panel-in 0.2s ease both;
    }
    .report {
      position: absolute;
      inset: 4%;
      z-index: 21;
      display: flex;
      flex-direction: column;
      background: var(--model, #141519);
      border: 1px solid var(--brd);
      border-radius: 18px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      overflow: hidden;
      animation: panel-in 0.24s cubic-bezier(0.22, 1, 0.36, 1) both;
    }
    .report-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid var(--brd);
    }
    .report-tabs {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      padding: 12px 20px 0;
    }
    .report-tab {
      cursor: pointer;
      font: inherit;
      font-size: 14px;
      font-weight: 600;
      color: var(--mut, #9aa0a6);
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--brd, rgba(255, 255, 255, 0.08));
      border-radius: 10px;
      padding: 8px 14px;
    }
    .report-tab.sel {
      color: #fff;
      background: rgba(243, 168, 60, 0.16);
      border-color: var(--accent, #f3a83c);
    }
    .report-tab em {
      font-style: normal;
      opacity: 0.6;
      font-size: 12px;
    }
    .report-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 18px;
      font-weight: 700;
      color: #fff;
    }
    .report-title .icn {
      width: 22px;
      height: 22px;
      color: var(--accent, #f3a83c);
    }
    .report-grid {
      flex: 1;
      overflow-y: auto;
      padding: 16px 20px;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 14px;
      align-content: start;
    }
    .report-item {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--brd, rgba(255, 255, 255, 0.08));
      border-radius: 12px;
      padding: 10px 12px;
    }
    .report-room {
      font-size: 14px;
      font-weight: 600;
      color: #dfe3e8;
      margin-bottom: 6px;
    }
    .report-item .rp-spark-wrap {
      margin-top: 0;
    }
    .rp-body {
      flex: 1;
      overflow-y: auto;
      /* Only ever scroll vertically. Without this, overflow-y:auto makes the X
         axis 'auto' too, so any hair of horizontal overflow (a wide light grid,
         a long name) turns into a left-right drag/wobble. Clip it instead. */
      overflow-x: hidden;
      padding: 6px 20px 18px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    /* Let cards + their grid tiles shrink to the panel width instead of forcing
       a horizontal overflow (flex/grid items default to min-width:auto). */
    .rp-body > .card {
      min-width: 0;
    }
    .rp-body::-webkit-scrollbar {
      width: 0;
    }
    .rp-empty {
      color: var(--mut);
      font-size: 14px;
      padding: 24px 4px;
      text-align: center;
    }
    .rp-foot {
      padding: 12px 20px 18px;
      border-top: 1px solid var(--brd);
    }
    .rp-master {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 9px;
      width: 100%;
      padding: 14px;
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid var(--brd);
      color: var(--tx);
      font: inherit;
      font-weight: 700;
      font-size: 15px;
      cursor: pointer;
      transition: background 0.15s;
    }
    .rp-master:hover {
      background: rgba(255, 255, 255, 0.11);
    }

`;
