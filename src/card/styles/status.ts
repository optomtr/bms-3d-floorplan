// ---------------------------------------------------------------------------
// Предупреждение о плане и ошибка загрузки.
//
// Кусок общей таблицы стилей карточки. ПОРЯДОК кусков в массиве
// `BmsFloorplanCard.styles` = порядок каскада: в файле есть селекторы,
// которые повторяются, и побеждает последний. Переставлять нельзя.
// ---------------------------------------------------------------------------

import { css } from 'lit';

export const statusStyles = css`
    .plan-warning {
      position: absolute;
      z-index: var(--z-chrome);
      left: var(--sp-4);
      right: var(--sp-4);
      bottom: var(--sp-4);
      display: flex;
      align-items: flex-start;
      gap: var(--sp-3);
      color: var(--accent);
      background: var(--warn-bg);
      border: 1px solid var(--accent-line);
      padding: var(--sp-3) var(--sp-4);
      border-radius: var(--r-3);
      font-size: var(--fs-3);
      line-height: 1.35;
    }
    .pw-close {
      flex: none;
      min-width: var(--tap);
      min-height: var(--tap);
      margin: calc(var(--sp-3) * -1) calc(var(--sp-3) * -1) calc(var(--sp-3) * -1) 0;
      background: none;
      border: 0;
      color: inherit;
      font-size: var(--fs-4);
      cursor: pointer;
      touch-action: manipulation;
    }
    .pw-close:active {
      opacity: 0.6;
    }

    .error {
      position: absolute;
      z-index: var(--z-chrome);
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: var(--bad);
      background: var(--bad-bg);
      border: 1px solid var(--bad-line);
      padding: var(--sp-4) var(--sp-5);
      border-radius: var(--r-2);
      font-size: var(--fs-4);
      max-width: 80%;
      text-align: center;
    }

`;
