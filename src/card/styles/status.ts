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
      z-index: 3;
      left: 12px;
      right: 12px;
      bottom: 12px;
      display: flex;
      align-items: flex-start;
      gap: 10px;
      color: #ffe0a8;
      background: rgba(58, 42, 16, 0.94);
      border: 1px solid rgba(243, 168, 60, 0.45);
      padding: 10px 12px;
      border-radius: 10px;
      font-size: 13px;
      line-height: 1.35;
    }
    .pw-close {
      flex: none;
      min-width: 44px;
      min-height: 44px;
      margin: -10px -8px -10px 0;
      background: none;
      border: 0;
      color: inherit;
      font-size: 15px;
      cursor: pointer;
    }
    .pw-close:active {
      opacity: 0.6;
    }

    .error {
      position: absolute;
      z-index: 3;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #ffb3b3;
      background: rgba(40, 20, 20, 0.9);
      padding: 12px 16px;
      border-radius: 8px;
      max-width: 80%;
      text-align: center;
    }

`;
