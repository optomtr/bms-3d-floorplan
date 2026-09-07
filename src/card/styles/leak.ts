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
      z-index: var(--z-leak);
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--sp-5);
      padding: var(--sp-6);
      text-align: center;
      color: var(--tx);
      background: radial-gradient(ellipse at center, var(--leak-a), var(--leak-b));
      animation: leak-flash 1.1s ease-in-out infinite;
    }
    @keyframes leak-flash {
      0%, 100% { filter: brightness(1); }
      50% { filter: brightness(1.35); }
    }
    .leak-x {
      position: absolute;
      top: var(--sp-4);
      right: var(--sp-5);
      appearance: none;
      cursor: pointer;
      width: 52px;
      height: 52px;
      border-radius: var(--r-circle);
      color: var(--tx);
      font-size: var(--fs-7);
      line-height: 1;
      background: var(--w-5);
      border: 1px solid var(--w-5);
      touch-action: manipulation;
    }
    .leak-x:active {
      background: var(--w-6);
    }
    .leak-ic {
      display: grid;
      place-items: center;
      width: 84px;
      height: 84px;
      border-radius: var(--r-6);
      background: var(--w-5);
    }
    .leak-ic .icn { width: 46px; height: 46px; }
    .leak-title { font-size: var(--fs-8); font-weight: 800; letter-spacing: 0.3px; }
    .leak-sub { font-size: var(--fs-6); opacity: 0.95; max-width: 80%; }
    .leak-hint { font-size: var(--fs-4); opacity: 0.85; }
    .leak-btns { display: flex; gap: var(--sp-4); margin-top: var(--sp-3); flex-wrap: wrap; justify-content: center; }
    /* Deliberately large: this gets tapped in a hurry, sometimes with wet hands. */
    .leak-b {
      appearance: none;
      cursor: pointer;
      color: var(--tx);
      background: var(--w-5);
      border: 1px solid var(--w-5);
      border-radius: var(--r-4);
      padding: var(--sp-5) 28px;
      min-height: var(--tap);
      font-size: var(--fs-6);
      font-weight: 700;
      touch-action: manipulation;
    }
    .leak-b:active {
      background: var(--w-6);
    }
    .leak-b.primary { color: var(--leak-ink); background: var(--fill-hi); border-color: var(--fill-hi); }
    .leak-b.primary:active { background: var(--tx); }
    .leak-b[disabled] { opacity: 0.55; cursor: default; }

`;
