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
      background: radial-gradient(1200px 900px at 28% 0%, #1b1d24, #0b0c0e 62%);
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
      z-index: 5;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 18px;
    }
    .ov-actions {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
      justify-content: flex-end;
    }
    .sumcard {
      height: 42px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 0;
      padding: 0 15px;
      border-radius: 13px;
      background: var(--card);
      border: 1px solid var(--brd);
      min-width: 90px;
    }
    .sumn {
      font-size: 19px;
      font-weight: 700;
      color: #fff;
      line-height: 1.05;
    }
    .suml {
      font-size: 11.5px;
      color: var(--mut);
    }
    .sumcard.act {
      background: rgba(243, 168, 60, 0.16);
      border-color: rgba(243, 168, 60, 0.48);
    }
    .sumcard.act .sumn {
      color: var(--accent);
    }
    .ov-master {
      height: 42px;
      display: inline-flex;
      align-items: center;
      gap: 9px;
      padding: 0 18px;
      border-radius: 13px;
      background: var(--card);
      border: 1px solid var(--brd);
      color: var(--tx);
      font: inherit;
      font-weight: 700;
      font-size: 14px;
      cursor: pointer;
    }
    .ov-master:hover {
      background: var(--card2);
    }
    .ov-banner-label {
      position: absolute;
      top: 120px;
      left: 30px;
      right: 30px;
      height: 150px;
      z-index: 6;
      pointer-events: none;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding-left: 22px;
      border-radius: 20px;
      background: linear-gradient(90deg, rgba(12, 13, 16, 0.92) 0%, rgba(12, 13, 16, 0.55) 20%, transparent 42%);
    }
    .bmh {
      font-size: 19px;
      font-weight: 700;
      color: #fff;
    }
    .bms {
      font-size: 13px;
      color: var(--mut);
      margin-top: 3px;
    }
    .bsleep {
      width: 42px;
      height: 42px;
      flex: none;
      border-radius: 13px;
      border: 1px solid var(--brd);
      background: var(--card);
      color: var(--mut);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
    .bsleep:hover {
      background: var(--card2);
      color: var(--tx);
    }
    /* House status row (heating / blinds / humidity / door). */
    .bstatus {
      position: absolute;
      top: 122px;
      left: 30px;
      right: 30px;
      z-index: 5;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
    }
    .bstat {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 13px 16px;
      border-radius: 16px;
      background: var(--card);
      border: 1px solid var(--brd);
      min-width: 0;
    }
    .bstat-ic {
      width: 40px;
      height: 40px;
      flex: none;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.06);
      color: var(--mut);
    }
    .bstat.warm .bstat-ic {
      background: rgba(243, 168, 60, 0.16);
      color: var(--accent);
    }
    .bstat.cool .bstat-ic {
      background: rgba(91, 184, 232, 0.16);
      color: var(--cool);
    }
    .bstat.good .bstat-ic {
      background: rgba(55, 197, 142, 0.16);
      color: #37c58e;
    }
    .bstat-v {
      font-size: 18px;
      font-weight: 700;
      color: #fff;
      line-height: 1.1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .bstat-l {
      font-size: 12px;
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
      bottom: 26px;
      z-index: 5;
      overflow-y: auto;
      overflow-x: hidden; /* vertical scroll only — never a left-right wobble */
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 14px;
      align-content: start;
    }
    /* Floor heading spans the whole grid row so the cards below it flow back to
       the first column — one continuous scroll, split into floors. */
    .ov-floor-h {
      grid-column: 1 / -1;
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 0.02em;
      color: rgba(255, 255, 255, 0.62);
      text-transform: uppercase;
      padding: 6px 2px 0;
      margin-top: 4px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
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
      border-radius: 18px;
      padding: 15px 16px 14px;
      display: flex;
      flex-direction: column;
      min-width: 0; /* shrink to the grid column instead of overflowing it */
      animation: rp-rise 0.36s both;
    }
    .rcard.on {
      border-color: rgba(243, 168, 60, 0.5);
      background: linear-gradient(rgba(243, 168, 60, 0.14), transparent 55%), var(--card);
    }
    .rchead {
      display: flex;
      align-items: center;
      gap: 11px;
    }
    .rcicon {
      width: 38px;
      height: 38px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.06);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--mut);
      flex: none;
    }
    .rcicon .icn {
      width: 20px;
      height: 20px;
    }
    .rcard.on .rcicon {
      background: rgba(243, 168, 60, 0.16);
      color: var(--accent);
    }
    .rcname {
      font-size: 16px;
      font-weight: 700;
      color: var(--tx);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .rctemp {
      font-size: 12.5px;
      color: var(--mut);
      margin-top: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .rctemp .rcfloor {
      color: var(--accent, #f3a83c);
    }
    .rcmid {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 13px;
    }
    .icn-mid {
      display: inline-flex;
      color: var(--mut);
    }
    .icn-mid .icn {
      width: 17px;
      height: 17px;
    }
    .lbltxt {
      font-size: 14px;
      font-weight: 600;
      color: var(--mut);
    }
    .brival {
      font-size: 15px;
      font-weight: 700;
      color: #fff;
    }
    .slider.sm {
      height: 38px;
      margin-top: 10px;
    }
    .slider-fill.dim {
      background: rgba(255, 255, 255, 0.5);
    }
    /* One segment per light: on = accent, off = dim. Filling them raises the %. */
    .lightsegs {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-top: 10px;
    }
    .lightseg {
      flex: 1 1 74px;
      min-width: 0;
      height: 34px;
      border: none;
      border-radius: 9px;
      background: rgba(255, 255, 255, 0.09);
      cursor: pointer;
      padding: 0 5px;
      display: flex;
      align-items: center;
      justify-content: center;
      font: inherit;
      font-size: 10.5px;
      font-weight: 700;
      letter-spacing: -0.01em;
      color: var(--mut);
      transition: background 0.15s, box-shadow 0.15s, color 0.15s;
      -webkit-tap-highlight-color: transparent;
    }
    .lightseg span {
      max-width: 100%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .lightseg:hover {
      background: rgba(255, 255, 255, 0.17);
      color: var(--tx);
    }
    .lightseg.on {
      background: var(--accent);
      color: #241a08;
      box-shadow: 0 2px 10px -3px rgba(243, 168, 60, 0.7);
    }
    .lightseg.on:hover {
      background: #f4b358;
      color: #241a08;
    }
    .subroom {
      margin-top: 10px;
      padding-top: 8px;
      border-top: 1px dashed rgba(255, 255, 255, 0.12);
    }
    .subroom-h {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11.5px;
      font-weight: 700;
      color: var(--mut);
      margin-bottom: 2px;
    }
    .subroom-h svg {
      width: 15px;
      height: 15px;
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
      margin-top: 4px;
    }
    .rcfoot {
      display: flex;
      gap: 8px;
      margin-top: 12px;
    }
    .qstat {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 8px 10px;
      border-radius: 11px;
      background: rgba(255, 255, 255, 0.05);
      font-size: 13px;
      font-weight: 600;
      color: var(--mut);
      flex: 1;
      border: none;
      font-family: inherit;
    }
    .qstat .icn {
      width: 15px;
      height: 15px;
    }
    .qstat.lockq {
      cursor: pointer;
    }
    .qstat.lockq.locked {
      color: #37c58e;
      background: rgba(55, 197, 142, 0.12);
    }
    .qstat.lockq.unlocked {
      color: #f26a4b;
      background: rgba(242, 106, 75, 0.12);
    }
    .rcard.link {
      cursor: pointer;
    }
    .rcchev {
      display: inline-flex;
      vertical-align: -3px;
      margin-left: 4px;
      color: var(--fnt, #646a75);
    }
    .rcchev .icn {
      width: 15px;
      height: 15px;
    }

    /* ---- Light colour-temperature slider (Тёплый ↔ Холодный) ---- */
    .ctwrap {
      margin-top: 14px;
    }
    .ctlab {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      font-weight: 600;
      color: var(--mut);
      margin-bottom: 7px;
    }
    .cttrack {
      position: relative;
      height: 40px;
      border-radius: 13px;
      cursor: pointer;
      touch-action: none;
      user-select: none;
      background: linear-gradient(90deg, #f3a83c, #fff 52%, #cfe0ff);
    }
    .ctthumb {
      position: absolute;
      top: 50%;
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: #fff;
      transform: translate(-50%, -50%);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
      border: 2px solid rgba(0, 0, 0, 0.06);
    }

`;
