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
      z-index: var(--z-panel);
      display: flex;
      flex-direction: column;
      /* Было var(--model, #141519) — переменной --model НЕ СУЩЕСТВОВАЛО ни в
         одном файле, то есть панель всегда красилась запасным значением.
         Теперь это честная ступень грунта. */
      background: var(--bg-1);
      border-left: 1px solid var(--brd);
      animation: panel-in 0.28s cubic-bezier(0.22, 1, 0.36, 1) both;
    }
    @keyframes panel-in {
      from { transform: translateX(18px); opacity: 0; }
      to { transform: none; opacity: 1; }
    }
    .rp-head {
      padding: var(--sp-6) var(--sp-6) var(--sp-4);
    }
    .rp-name {
      font-size: var(--fs-7);
      font-weight: 700;
      color: var(--tx-hi);
      letter-spacing: -0.01em;
    }
    .rp-chips {
      display: flex;
      gap: var(--sp-3);
      margin-top: var(--sp-4);
    }
    .rp-chip {
      display: inline-flex;
      align-items: center;
      gap: var(--sp-2);
      padding: var(--sp-2) var(--sp-4);
      border-radius: var(--r-3);
      background: var(--card);
      border: 1px solid var(--brd);
      font-size: var(--fs-4);
      font-weight: 600;
      color: var(--tx);
    }
    .rp-chip .icn {
      width: 18px;
      height: 18px;
      color: var(--mut);
    }
    .rp-chip.cool .icn {
      color: var(--cool);
    }
    .rp-chip.warm .icn {
      color: var(--accent);
    }
    /* Чип-кнопка переключает метрику графика — значит, это цель под палец. */
    button.rp-chip {
      cursor: pointer;
      font: inherit;
      min-height: var(--tap);
      touch-action: manipulation;
    }
    button.rp-chip:active {
      background: var(--card2);
    }
    .rp-chip.sel {
      border-color: var(--accent);
      box-shadow: inset 0 0 0 1px var(--accent);
    }
    .rp-spark-wrap {
      margin-top: var(--sp-3);
      padding: var(--sp-2) var(--sp-3);
      border-radius: var(--r-3);
      background: var(--w-1);
      border: 1px solid var(--brd);
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
      stroke: var(--accent);
    }
    .rp-spark .spark.warm {
      stroke: var(--bad);
      opacity: 0.85;
    }
    .rp-spark .spark.hum {
      stroke: var(--cool);
    }
    .rp-spark .spark-grid {
      stroke: var(--w-3);
      stroke-width: 1;
      vector-effect: non-scaling-stroke;
    }
    /* 9px здесь — НЕ экранные пиксели: это пользовательские единицы внутри
       viewBox, а сама svg тянется по ширине панели. Кегельная шкала к ним
       неприменима, поэтому значение осталось числом. */
    .rp-spark .spark-axis {
      fill: var(--w-6);
      font-size: 9px;
    }
    .spark-legend {
      display: flex;
      flex-wrap: wrap;
      gap: var(--sp-4);
      margin-bottom: var(--sp-1);
    }
    .spark-leg {
      display: inline-flex;
      align-items: center;
      gap: var(--sp-1);
      font-size: var(--fs-1);
      color: var(--mut);
    }
    .spark-leg i {
      width: 11px;
      height: 3px;
      border-radius: var(--r-pill);
      display: inline-block;
    }
    .spark-leg.air i { background: var(--accent); }
    .spark-leg.warm i { background: var(--bad); }
    .spark-leg.hum i { background: var(--cool); }
    .report-back {
      position: absolute;
      inset: 0;
      background: var(--scrim);
      z-index: var(--z-scrim);
      animation: panel-in 0.2s ease both;
    }
    .report {
      position: absolute;
      inset: 4%;
      z-index: var(--z-sheet);
      display: flex;
      flex-direction: column;
      background: var(--bg-1);
      border: 1px solid var(--brd);
      border-radius: var(--r-5);
      box-shadow: 0 20px 60px var(--scrim);
      overflow: hidden;
      animation: panel-in 0.24s cubic-bezier(0.22, 1, 0.36, 1) both;
    }
    .report-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--sp-5) var(--sp-6);
      border-bottom: 1px solid var(--brd);
    }
    .report-tabs {
      display: flex;
      gap: var(--sp-3);
      flex-wrap: wrap;
      padding: var(--sp-4) var(--sp-6) 0;
    }
    .report-tab {
      cursor: pointer;
      font: inherit;
      font-size: var(--fs-4);
      font-weight: 600;
      min-height: var(--tap);
      color: var(--mut);
      background: var(--w-1);
      border: 1px solid var(--brd);
      border-radius: var(--r-3);
      padding: var(--sp-3) var(--sp-4);
      touch-action: manipulation;
    }
    .report-tab:active {
      background: var(--w-4);
      color: var(--tx);
    }
    .report-tab.sel {
      color: var(--tx);
      background: var(--accent-soft);
      border-color: var(--accent);
    }
    .report-tab em {
      font-style: normal;
      opacity: 0.6;
      font-size: var(--fs-2);
    }
    .report-title {
      display: flex;
      align-items: center;
      gap: var(--sp-3);
      font-size: var(--fs-6);
      font-weight: 700;
      color: var(--tx-hi);
    }
    .report-title .icn {
      width: 22px;
      height: 22px;
      color: var(--accent);
    }
    .report-grid {
      flex: 1;
      overflow-y: auto;
      padding: var(--sp-5) var(--sp-6);
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: var(--sp-4);
      align-content: start;
    }
    .report-item {
      background: var(--w-1);
      border: 1px solid var(--brd);
      border-radius: var(--r-3);
      padding: var(--sp-3) var(--sp-4);
    }
    .report-room {
      font-size: var(--fs-4);
      font-weight: 600;
      color: var(--tx);
      margin-bottom: var(--sp-2);
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
      padding: var(--sp-2) var(--sp-6) var(--sp-5);
      display: flex;
      flex-direction: column;
      gap: var(--sp-4);
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
      font-size: var(--fs-4);
      padding: var(--sp-6) var(--sp-1);
      text-align: center;
    }
    .rp-foot {
      padding: var(--sp-4) var(--sp-6) var(--sp-5);
      border-top: 1px solid var(--brd);
    }
    .rp-master {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--sp-3);
      width: 100%;
      min-height: var(--tap);
      padding: var(--sp-4);
      border-radius: var(--r-4);
      background: var(--w-2);
      border: 1px solid var(--brd);
      color: var(--tx);
      font: inherit;
      font-weight: 700;
      font-size: var(--fs-4);
      cursor: pointer;
      transition: background 0.15s;
      touch-action: manipulation;
    }
    .rp-master:active {
      background: var(--w-5);
    }
    @media (hover: hover) {
      .rp-master:hover {
        background: var(--w-4);
      }
      button.rp-chip:hover,
      .report-tab:hover {
        background: var(--card2);
      }
    }

`;
