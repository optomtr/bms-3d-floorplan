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
      z-index: 4;
      bottom: 14px;
      left: 50%;
      transform: translateX(-50%);
      color: #fff;
      background: rgba(20, 22, 26, 0.92);
      border: 1px solid rgba(255, 255, 255, 0.16);
      padding: 9px 14px;
      border-radius: 10px;
      font-size: 13px;
      max-width: 86%;
      text-align: center;
      backdrop-filter: blur(4px);
    }
    .control-backdrop {
      position: absolute;
      inset: 0;
      z-index: 5;
    }
    .control-popup {
      position: absolute;
      z-index: 6;
      /* Horizontal centering only; the vertical "top" is set in JS
       * (positionControlPopup) from the popup's measured height so it can never
       * be clipped by the card's overflow:hidden edges. */
      transform: translateX(-50%);
      width: max-content;
      min-width: 180px;
      max-width: min(320px, 84%);
      max-height: 90%;
      overflow-y: auto;
      overflow-x: hidden;
      background: rgba(20, 22, 26, 0.62);
      border: 1px solid rgba(255, 255, 255, 0.18);
      border-radius: 12px;
      padding: 5px 8px;
      backdrop-filter: blur(7px);
      box-shadow: 0 6px 22px rgba(0, 0, 0, 0.45);
    }
    .control-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 600;
      font-size: 12px;
      color: #cfe0ff;
      padding: 1px 1px 4px;
      gap: 8px;
    }
    .control-head span {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .ctl.back {
      min-width: 26px;
      min-height: 24px;
      padding: 2px 5px;
    }
    .ctl.back .icn {
      width: 15px;
      height: 15px;
      transform: rotate(-90deg);
    }
    /* Room category chooser (Lights / Climate / Curtains …). */
    .cat-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
      padding: 4px 0 2px;
    }
    .cat-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      font: inherit;
      font-size: 13px;
      color: #eee;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.16);
      border-radius: 9px;
      padding: 10px 10px;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }
    .cat-btn:active {
      background: rgba(255, 255, 255, 0.18);
    }
    .cat-btn .icn {
      width: 20px;
      height: 20px;
      flex: 0 0 auto;
    }
    .cat-btn span {
      flex: 1 1 auto;
    }
    .cat-btn small {
      color: #9fb3cc;
      font-size: 11px;
    }
    .control-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 5px 2px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }
    .ctl.big {
      padding: 6px 12px;
      font-size: 15px;
    }
    .control-name {
      color: #eee;
      font-size: 13px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex: 1 1 auto;
      min-width: 0;
    }
    .control-ctls {
      display: flex;
      align-items: center;
      gap: 6px;
      flex: 0 0 auto;
    }
    .ctl {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.16);
      color: #eee;
      border-radius: 8px;
      padding: 6px 9px;
      font-size: 14px;
      cursor: pointer;
      line-height: 1;
      /* Reliable finger tap targets on tablets. */
      min-width: 36px;
      min-height: 34px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
    }
    .ctl:active {
      background: rgba(255, 255, 255, 0.18);
    }
    .ctl.close {
      min-width: 30px;
      min-height: 28px;
      padding: 3px 7px;
    }
    .ctl.on {
      background: rgba(3, 169, 244, 0.35);
      border-color: var(--primary-color, #03a9f4);
    }
    .icn {
      width: 18px;
      height: 18px;
      display: block;
    }
    .ctl.big .icn {
      width: 20px;
      height: 20px;
    }
    .ctl-range {
      width: 92px;
    }
    .ctl-col {
      display: flex;
      flex-direction: column;
      gap: 4px;
      align-items: flex-end;
    }
    .ctl-row {
      display: flex;
      gap: 5px;
      align-items: center;
    }
    .ctl-row.wrap {
      flex-wrap: wrap;
      justify-content: flex-end;
    }
    .ctl-temp {
      min-width: 70px;
      text-align: center;
      color: #9ad0ff;
      font-size: 13px;
    }
    .ctl-state {
      color: #ffe7a0;
      font-size: 13px;
    }
`;
