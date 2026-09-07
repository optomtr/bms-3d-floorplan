// ---------------------------------------------------------------------------
// Всплывающее сообщение и поп-ап управления устройством/комнатой.
//
// Кусок общей таблицы стилей карточки. ПОРЯДОК кусков в массиве
// `BmsFloorplanCard.styles` = порядок каскада: в файле есть селекторы,
// которые повторяются, и побеждает последний. Переставлять нельзя.
// ---------------------------------------------------------------------------

import { css } from 'lit';

export const controlsStyles = css`
    .toast {
      position: absolute;
      z-index: var(--z-menu);
      bottom: var(--sp-4);
      left: 50%;
      transform: translateX(-50%);
      color: var(--tx);
      background: var(--glass);
      border: 1px solid var(--w-5);
      padding: var(--sp-3) var(--sp-4);
      border-radius: var(--r-3);
      font-size: var(--fs-3);
      max-width: 86%;
      text-align: center;
      backdrop-filter: blur(4px);
    }
    .control-backdrop {
      position: absolute;
      inset: 0;
      z-index: var(--z-panel);
    }
    .control-popup {
      position: absolute;
      z-index: var(--z-popup);
      /* Horizontal centering only; the vertical "top" is set in JS
       * (positionControlPopup) from the popup's measured height so it can never
       * be clipped by the card's overflow:hidden edges. */
      transform: translateX(-50%);
      width: max-content;
      min-width: 200px;
      /* Было min(320px, 84%): в него больше не влезает ряд кнопок 44px. */
      max-width: min(380px, 88%);
      max-height: 90%;
      overflow-y: auto;
      overflow-x: hidden;
      background: rgba(20, 22, 26, 0.62);
      border: 1px solid var(--w-5);
      border-radius: var(--r-3);
      padding: var(--sp-2) var(--sp-3);
      backdrop-filter: blur(7px);
      box-shadow: 0 6px 22px var(--scrim);
    }
    .control-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 600;
      font-size: var(--fs-2);
      color: var(--info);
      padding: 1px 1px var(--sp-1);
      gap: var(--sp-3);
    }
    .control-head span {
      display: inline-flex;
      align-items: center;
      gap: var(--sp-2);
    }
    .ctl.back .icn {
      width: 20px;
      height: 20px;
      transform: rotate(-90deg);
    }
    /* Room category chooser (Lights / Climate / Curtains …). */
    .cat-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--sp-2);
      padding: var(--sp-1) 0 2px;
    }
    .cat-btn {
      display: flex;
      align-items: center;
      gap: var(--sp-3);
      font: inherit;
      font-size: var(--fs-4);
      min-height: var(--tap);
      color: var(--tx);
      background: var(--w-3);
      border: 1px solid var(--w-5);
      border-radius: var(--r-2);
      padding: var(--sp-3) var(--sp-3);
      cursor: pointer;
      touch-action: manipulation;
    }
    .cat-btn:active {
      background: var(--w-5);
    }
    .cat-btn .icn {
      width: 22px;
      height: 22px;
      flex: 0 0 auto;
    }
    .cat-btn span {
      flex: 1 1 auto;
    }
    .cat-btn small {
      color: var(--mut);
      font-size: var(--fs-1);
    }
    .control-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--sp-3);
      padding: var(--sp-1) 2px;
      border-top: 1px solid var(--w-3);
    }
    .ctl.big {
      padding: var(--sp-2) var(--sp-4);
      font-size: var(--fs-4);
    }
    .control-name {
      color: var(--tx);
      font-size: var(--fs-3);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex: 1 1 auto;
      min-width: 0;
    }
    .control-ctls {
      display: flex;
      align-items: center;
      gap: var(--sp-2);
      flex: 0 0 auto;
    }
    /* Кнопки поп-апа. Было min 36x34 (и 30x28 у «✕», 26x24 у «назад») —
       ни одна не дотягивала до пальца. */
    .ctl {
      background: var(--w-3);
      border: 1px solid var(--w-5);
      color: var(--tx);
      border-radius: var(--r-2);
      padding: var(--sp-2) var(--sp-2);
      font-size: var(--fs-3);
      cursor: pointer;
      line-height: 1;
      min-width: var(--tap);
      min-height: var(--tap);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      touch-action: manipulation;
    }
    .ctl:active {
      background: var(--w-5);
    }
    .ctl.on {
      background: var(--pri-soft);
      border-color: var(--pri);
    }
    /* Один общий значок. Раньше это правило дублировалось: 18px здесь и 20px
       ниже, в room-view — то есть 18px не действовали НИКОГДА (побеждал
       последний файл). Дубль убран, оставлен действовавший размер. */
    .icn {
      width: 20px;
      height: 20px;
      display: block;
      flex: none;
    }
    .ctl.big .icn {
      width: 22px;
      height: 22px;
    }
    .ctl-range {
      width: 92px;
      height: var(--tap);
      accent-color: var(--accent);
    }
    .ctl-col {
      display: flex;
      flex-direction: column;
      gap: var(--sp-1);
      align-items: flex-end;
    }
    .ctl-row {
      display: flex;
      gap: var(--sp-1);
      align-items: center;
    }
    .ctl-row.wrap {
      flex-wrap: wrap;
      justify-content: flex-end;
    }
    .ctl-temp {
      min-width: 70px;
      text-align: center;
      color: var(--cool);
      font-size: var(--fs-3);
    }
    .ctl-state {
      color: var(--accent);
      font-size: var(--fs-3);
    }
    @media (hover: hover) {
      .cat-btn:hover,
      .ctl:hover {
        background: var(--w-4);
      }
    }
`;
