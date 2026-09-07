// ---------------------------------------------------------------------------
// Режим «Обзор»: сводка дома, статусная строка, сетка комнат,
// подкомнаты и ползунок цветовой температуры.
//
// Кусок общей таблицы стилей карточки. ПОРЯДОК кусков в массиве
// `BmsFloorplanCard.styles` = порядок каскада: в файле есть селекторы,
// которые повторяются, и побеждает последний. Переставлять нельзя.
// ---------------------------------------------------------------------------

import { css } from 'lit';

export const overviewStyles = css`
    /* ===================================================================
       House overview (Option 1B): summary bar + 3D banner + room grid.
       =================================================================== */
    ha-card.view.overview {
      background: radial-gradient(1200px 900px at 28% 0%, var(--bg-2), var(--bg-0) 62%);
    }
    /* Обзор has no 3D — it's a pure grid dashboard (the 3D lives in Комната). */
    ha-card.view.overview .viewport {
      display: none;
    }
    .ov-top {
      position: absolute;
      top: 30px;
      left: 30px;
      right: 30px;
      z-index: var(--z-panel);
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: var(--sp-5);
    }
    .ov-actions {
      display: flex;
      align-items: center;
      gap: var(--sp-3);
      flex-wrap: wrap;
      justify-content: flex-end;
    }
    .sumcard {
      min-height: var(--tap);
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 0;
      padding: 0 var(--sp-5);
      border-radius: var(--r-4);
      background: var(--card);
      border: 1px solid var(--brd);
      /* 90px при box-sizing оставили бы под подпись 60px — не влезает. */
      min-width: 120px;
    }
    .sumn {
      font-size: var(--fs-6);
      font-weight: 700;
      color: var(--tx-hi);
      line-height: 1.05;
    }
    .suml {
      font-size: var(--fs-1);
      color: var(--mut);
    }
    .sumcard.act {
      background: var(--accent-soft);
      border-color: var(--accent-line);
    }
    .sumcard.act .sumn {
      color: var(--accent);
    }
    .ov-master {
      min-height: var(--tap);
      display: inline-flex;
      align-items: center;
      gap: var(--sp-3);
      padding: 0 var(--sp-5);
      border-radius: var(--r-4);
      background: var(--card);
      border: 1px solid var(--brd);
      color: var(--tx);
      font: inherit;
      font-weight: 700;
      font-size: var(--fs-4);
      cursor: pointer;
      touch-action: manipulation;
    }
    .ov-master:active {
      background: var(--w-5);
    }
    .ov-banner-label {
      position: absolute;
      top: 120px;
      left: 30px;
      right: 30px;
      height: 150px;
      z-index: var(--z-popup);
      pointer-events: none;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding-left: 22px;
      border-radius: var(--r-5);
      background: linear-gradient(90deg, rgba(12, 13, 16, 0.92) 0%, rgba(12, 13, 16, 0.55) 20%, transparent 42%);
    }
    .bmh {
      font-size: var(--fs-6);
      font-weight: 700;
      color: var(--tx-hi);
    }
    .bms {
      font-size: var(--fs-3);
      color: var(--mut);
      margin-top: 3px;
    }
    .bsleep {
      width: var(--tap);
      height: var(--tap);
      flex: none;
      border-radius: var(--r-4);
      border: 1px solid var(--brd);
      background: var(--card);
      color: var(--mut);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      touch-action: manipulation;
    }
    .bsleep:active {
      background: var(--w-5);
      color: var(--tx);
    }
    /* House status row (heating / blinds / humidity / door). */
    .bstatus {
      position: absolute;
      top: 122px;
      left: 30px;
      right: 30px;
      z-index: var(--z-panel);
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--sp-4);
    }
    .bstat {
      display: flex;
      align-items: center;
      gap: var(--sp-4);
      padding: var(--sp-4) var(--sp-5);
      border-radius: var(--r-5);
      background: var(--card);
      border: 1px solid var(--brd);
      min-width: 0;
    }
    .bstat-ic {
      width: 40px;
      height: 40px;
      flex: none;
      border-radius: var(--r-3);
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--w-2);
      color: var(--mut);
    }
    .bstat.warm .bstat-ic {
      background: var(--accent-soft);
      color: var(--accent);
    }
    .bstat.cool .bstat-ic {
      background: var(--cool-soft);
      color: var(--cool);
    }
    .bstat.good .bstat-ic {
      background: var(--good-soft);
      color: var(--good);
    }
    .bstat-v {
      font-size: var(--fs-6);
      font-weight: 700;
      color: var(--tx-hi);
      line-height: 1.1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .bstat-l {
      font-size: var(--fs-2);
      color: var(--mut);
      margin-top: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .ov-grid {
      position: absolute;
      top: 202px;
      left: 30px;
      right: 30px;
      bottom: var(--sp-6);
      z-index: var(--z-panel);
      overflow-y: auto;
      overflow-x: hidden; /* vertical scroll only — never a left-right wobble */
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--sp-4);
      align-content: start;
    }
    /* Floor heading spans the whole grid row so the cards below it flow back to
       the first column — one continuous scroll, split into floors. */
    .ov-floor-h {
      grid-column: 1 / -1;
      font-size: var(--fs-4);
      font-weight: 700;
      letter-spacing: 0.02em;
      color: var(--w-6);
      text-transform: uppercase;
      padding: var(--sp-2) 2px 0;
      margin-top: var(--sp-1);
      border-top: 1px solid var(--w-3);
    }
    .ov-floor-h:first-child {
      margin-top: 0;
      border-top: none;
    }
    .ov-grid::-webkit-scrollbar {
      width: 0;
    }
    .rcard {
      background: var(--card);
      border: 1px solid var(--brd);
      border-radius: var(--r-5);
      padding: var(--sp-5);
      display: flex;
      flex-direction: column;
      min-width: 0; /* shrink to the grid column instead of overflowing it */
      animation: rp-rise 0.36s both;
    }
    .rcard.on {
      border-color: var(--accent-line);
      background: linear-gradient(var(--accent-soft), transparent 55%), var(--card);
    }
    .rchead {
      display: flex;
      align-items: center;
      gap: var(--sp-4);
    }
    .rcicon {
      width: 38px;
      height: 38px;
      border-radius: var(--r-3);
      background: var(--w-2);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--mut);
      flex: none;
    }
    .rcard.on .rcicon {
      background: var(--accent-soft);
      color: var(--accent);
    }
    .rcname {
      font-size: var(--fs-5);
      font-weight: 700;
      color: var(--tx);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .rctemp {
      font-size: var(--fs-2);
      color: var(--mut);
      margin-top: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .rctemp .rcfloor {
      color: var(--accent);
    }
    .rcmid {
      display: flex;
      align-items: center;
      gap: var(--sp-3);
      margin-top: var(--sp-4);
    }
    .icn-mid {
      display: inline-flex;
      color: var(--mut);
    }
    .icn-mid .icn {
      width: 18px;
      height: 18px;
    }
    .lbltxt {
      font-size: var(--fs-4);
      font-weight: 600;
      color: var(--mut);
    }
    .brival {
      font-size: var(--fs-4);
      font-weight: 700;
      color: var(--tx-hi);
    }
    .slider.sm {
      height: var(--tap);
      margin-top: var(--sp-3);
    }
    .slider-fill.dim {
      background: var(--w-6);
    }
    /* One segment per light: on = accent, off = dim. Filling them raises the %.
       Было 34px высоты при кегле 10,5px — самая мелкая надпись продукта на
       кнопке, по которой жмут чаще всего в «Обзоре». */
    .lightsegs {
      display: flex;
      flex-wrap: wrap;
      gap: var(--sp-1);
      margin-top: var(--sp-3);
    }
    .lightseg {
      flex: 1 1 74px;
      min-width: 0;
      min-height: var(--tap);
      border: none;
      border-radius: var(--r-2);
      background: var(--w-3);
      cursor: pointer;
      padding: 0 var(--sp-2);
      display: flex;
      align-items: center;
      justify-content: center;
      font: inherit;
      font-size: var(--fs-1);
      font-weight: 700;
      letter-spacing: -0.01em;
      color: var(--mut);
      transition: background 0.15s, box-shadow 0.15s, color 0.15s;
      touch-action: manipulation;
    }
    .lightseg span {
      max-width: 100%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .lightseg:active {
      background: var(--w-5);
      color: var(--tx);
    }
    .lightseg.on {
      background: var(--accent);
      color: var(--ink);
      box-shadow: 0 2px 10px -3px var(--accent-line);
    }
    .subroom {
      margin-top: var(--sp-3);
      padding-top: var(--sp-3);
      border-top: 1px dashed var(--w-4);
    }
    .subroom-h {
      display: flex;
      align-items: center;
      gap: var(--sp-2);
      font-size: var(--fs-1);
      font-weight: 700;
      color: var(--mut);
      margin-bottom: 2px;
    }
    .subroom-h svg {
      width: 16px;
      height: 16px;
      opacity: 0.8;
    }
    .subroom-h .grow {
      flex: 1;
    }
    .subroom-n {
      font-variant-numeric: tabular-nums;
      opacity: 0.85;
    }
    .subroom .lightsegs {
      margin-top: var(--sp-1);
    }
    .rcfoot {
      display: flex;
      gap: var(--sp-3);
      margin-top: var(--sp-4);
    }
    .qstat {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--sp-2);
      min-height: var(--tap);
      padding: var(--sp-3) var(--sp-3);
      border-radius: var(--r-3);
      background: var(--w-2);
      font-size: var(--fs-3);
      font-weight: 600;
      color: var(--mut);
      flex: 1;
      border: none;
      font-family: inherit;
    }
    .qstat .icn {
      width: 18px;
      height: 18px;
    }
    .qstat.lockq {
      cursor: pointer;
      touch-action: manipulation;
    }
    .qstat.lockq.locked {
      color: var(--good);
      background: var(--good-soft);
    }
    .qstat.lockq.unlocked {
      color: var(--bad);
      background: var(--bad-soft);
    }
    .rcard.link {
      cursor: pointer;
    }
    .rcchev {
      display: inline-flex;
      vertical-align: -3px;
      margin-left: var(--sp-1);
      color: var(--faint);
    }
    .rcchev .icn {
      width: 16px;
      height: 16px;
    }

    /* ---- Light colour-temperature slider (Тёплый ↔ Холодный) ---- */
    .ctwrap {
      margin-top: var(--sp-4);
    }
    .ctlab {
      display: flex;
      justify-content: space-between;
      font-size: var(--fs-3);
      font-weight: 600;
      color: var(--mut);
      margin-bottom: var(--sp-2);
    }
    .cttrack {
      position: relative;
      height: var(--tap);
      border-radius: var(--r-4);
      cursor: pointer;
      touch-action: none;
      user-select: none;
      background: linear-gradient(90deg, var(--accent), var(--fill-hi) 52%, var(--info));
    }
    .ctthumb {
      position: absolute;
      top: 50%;
      width: 26px;
      height: 26px;
      border-radius: var(--r-circle);
      background: var(--fill-hi);
      transform: translate(-50%, -50%);
      box-shadow: 0 2px 8px var(--shadow);
      border: 2px solid rgba(0, 0, 0, 0.06);
    }
    @media (hover: hover) {
      .ov-master:hover,
      .bsleep:hover {
        background: var(--card2);
        color: var(--tx);
      }
      .lightseg:hover {
        background: var(--w-5);
        color: var(--tx);
      }
      /* Включённый сегмент был дублем акцента (#f4b358) — сведено к одному
         цвету плюс подсветка. */
      .lightseg.on:hover {
        filter: brightness(1.08);
      }
    }

`;
