// ---------------------------------------------------------------------------
// Переключатель «Комната / Обзор».
//
// Кусок общей таблицы стилей карточки. ПОРЯДОК кусков в массиве
// `BmsFloorplanCard.styles` = порядок каскада: в файле есть селекторы,
// которые повторяются, и побеждает последний. Переставлять нельзя.
// ---------------------------------------------------------------------------

import { css } from 'lit';

export const viewToggleStyles = css`
    /* ---- View toggle (Обзор / Комната) ---- */
    .view-toggle {
      display: inline-flex;
      align-self: center;
      flex: none;
      padding: var(--sp-1);
      gap: var(--sp-1);
      border-radius: var(--r-4);
      background: var(--card);
      border: 1px solid var(--brd);
    }
    /* Было 29,6px по высоте — а это главная развилка интерфейса: «Обзор» или
       «Комната». Теперь 44. */
    .vt-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--sp-2);
      min-height: var(--tap);
      padding: 0 var(--sp-4);
      border-radius: var(--r-3);
      border: none;
      background: transparent;
      color: var(--mut);
      font: inherit;
      font-size: var(--fs-4);
      font-weight: 600;
      cursor: pointer;
      touch-action: manipulation;
    }
    .vt-btn .icn {
      width: 18px;
      height: 18px;
    }
    .vt-btn:active {
      background: var(--w-4);
      color: var(--tx);
    }
    .vt-btn.on {
      background: var(--fill-hi);
      color: var(--ink);
    }
    @media (hover: hover) {
      .vt-btn:hover {
        color: var(--tx);
      }
      .vt-btn.on:hover {
        color: var(--ink);
      }
    }

`;
