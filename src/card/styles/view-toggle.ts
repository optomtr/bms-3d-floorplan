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
      padding: 4px;
      gap: 3px;
      border-radius: 13px;
      background: var(--card);
      border: 1px solid var(--brd);
    }
    .vt-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 12px;
      border-radius: 9px;
      border: none;
      background: transparent;
      color: var(--mut);
      font: inherit;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }
    .vt-btn .icn {
      width: 15px;
      height: 15px;
    }
    .vt-btn.on {
      background: #fff;
      color: #17181c;
    }

`;
