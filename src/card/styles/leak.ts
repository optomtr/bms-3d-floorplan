// ---------------------------------------------------------------------------
// Полноэкранная тревога о протечке.
//
// Кусок общей таблицы стилей карточки. ПОРЯДОК кусков в массиве
// `BmsFloorplanCard.styles` = порядок каскада: в файле есть селекторы,
// которые повторяются, и побеждает последний. Переставлять нельзя.
// ---------------------------------------------------------------------------

import { css } from 'lit';

export const leakStyles = css`
    /* Water leak. Sits above the screensaver (z-index 40) on purpose: a panel
       that has dimmed itself to a clock is exactly when a leak most needs to be
       seen. Not dismissible — it goes when the sensor dries, not when tapped. */
    .leak-alert {
      position: absolute;
      z-index: 60;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      padding: 24px;
      text-align: center;
      color: #fff;
      background: radial-gradient(ellipse at center, rgba(206, 38, 30, 0.98), rgba(120, 14, 11, 0.99));
      animation: leak-flash 1.1s ease-in-out infinite;
    }
    @keyframes leak-flash {
      0%, 100% { filter: brightness(1); }
      50% { filter: brightness(1.35); }
    }
    .leak-x {
      position: absolute;
      top: 14px;
      right: 16px;
      appearance: none;
      cursor: pointer;
      width: 52px;
      height: 52px;
      border-radius: 50%;
      color: #fff;
      font-size: 24px;
      line-height: 1;
      background: rgba(255, 255, 255, 0.16);
      border: 1px solid rgba(255, 255, 255, 0.34);
    }
    .leak-ic {
      display: grid;
      place-items: center;
      width: 84px;
      height: 84px;
      border-radius: 26px;
      background: rgba(255, 255, 255, 0.18);
    }
    .leak-ic .icn { width: 46px; height: 46px; }
    .leak-title { font-size: 34px; font-weight: 800; letter-spacing: 0.3px; }
    .leak-sub { font-size: 18px; opacity: 0.95; max-width: 80%; }
    .leak-hint { font-size: 14px; opacity: 0.78; }
    .leak-btns { display: flex; gap: 12px; margin-top: 8px; flex-wrap: wrap; justify-content: center; }
    /* Deliberately large: this gets tapped in a hurry, sometimes with wet hands. */
    .leak-b {
      appearance: none;
      cursor: pointer;
      color: #fff;
      background: rgba(255, 255, 255, 0.16);
      border: 1px solid rgba(255, 255, 255, 0.34);
      border-radius: 14px;
      padding: 16px 28px;
      font-size: 18px;
      font-weight: 700;
    }
    .leak-b.primary { color: #8f1410; background: #fff; border-color: #fff; }
    .leak-b[disabled] { opacity: 0.55; cursor: default; }

`;
