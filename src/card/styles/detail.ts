// ---------------------------------------------------------------------------
// Выдвижная карточка комнаты из «Обзора» + завершающие @media-блоки.
//
// ВНИМАНИЕ: этот кусок обязан оставаться ПОСЛЕДНИМ в массиве стилей —
// в нём живут три @media, которые переопределяют правила выше.
//
// Кусок общей таблицы стилей карточки. ПОРЯДОК кусков в массиве
// `BmsFloorplanCard.styles` = порядок каскада: в файле есть селекторы,
// которые повторяются, и побеждает последний. Переставлять нельзя.
// ---------------------------------------------------------------------------

import { css } from 'lit';

export const detailStyles = css`
    /* ---- Overview detail slide-over (1B) ---- */
    .detail-back {
      position: absolute;
      inset: 0;
      z-index: 20;
      background: rgba(6, 7, 9, 0.55);
      backdrop-filter: blur(3px);
      animation: rp-fade 0.2s both;
    }
    .detail {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      width: min(720px, 82%);
      z-index: 21;
      background: radial-gradient(150% 120% at 80% 4%, #20222a, #141519 55%, #0f1013);
      border-left: 1px solid var(--brd);
      box-shadow: -30px 0 80px -20px rgba(0, 0, 0, 0.7);
      display: flex;
      flex-direction: column;
      animation: slide-in 0.28s cubic-bezier(0.22, 1, 0.36, 1) both;
    }
    @keyframes slide-in {
      from { transform: translateX(40px); opacity: 0; }
      to { transform: none; opacity: 1; }
    }
    .dhead {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 24px 26px 16px;
    }
    .dback {
      width: 46px;
      height: 46px;
      flex: none;
      border-radius: 14px;
      border: 1px solid var(--brd);
      background: var(--card);
      color: var(--tx);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
    .dback:hover {
      background: var(--card2);
    }
    .dtitle {
      font-size: 26px;
      font-weight: 700;
      color: #fff;
      letter-spacing: -0.01em;
    }
    .dsub {
      font-size: 13px;
      color: var(--mut);
      margin-top: 2px;
    }
    .dbody {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden; /* vertical scroll only — never a left-right wobble */
      padding: 6px 26px 24px;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      grid-auto-rows: min-content;
      gap: 14px;
      align-content: start;
    }
    .dbody > * {
      min-width: 0; /* shrink to the grid column instead of overflowing it */
    }
    .dbody::-webkit-scrollbar {
      width: 0;
    }
    .dbody > .lockbtn {
      grid-column: 1 / -1;
    }
    @media (max-width: 720px) {
      .detail {
        width: 100%;
      }
      .dbody {
        grid-template-columns: 1fr;
      }
    }

    /* Keep the editor/legacy overlays clear of the room panel in view mode. */
    ha-card.view .overlay.top-left {
      top: 108px;
      left: 30px;
    }
    ha-card.view .overlay.bottom {
      left: 26px;
      right: calc(var(--panel-w) + 24px);
      bottom: 74px;
      justify-content: flex-start;
    }

    /* Narrow cards: stack the panel below the 3D. */
    @media (max-width: 720px) {
      ha-card.view.room {
        --panel-w: 0px;
      }
      ha-card.view.room .viewport {
        right: 0;
        bottom: 46%;
      }
      ha-card.view.overview .ov-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      .room-panel {
        top: 54%;
        width: 100%;
        border-left: none;
        border-top: 1px solid var(--brd);
      }
      .topstat {
        right: 18px;
      }
      .pills {
        right: 18px;
      }
      ha-card.view .overlay.bottom {
        right: 18px;
      }
      .ctime {
        font-size: 48px;
      }
    }

    /* ---- Touch devices (wall tablets) ----------------------------------
       backdrop-filter re-blurs whatever sits behind it every time that
       backdrop repaints — and behind these panels is the 3D, which repaints
       on every drag. On a tablet that is the single biggest thing competing
       with the scene for the frame, and it buys a glass effect nobody studies
       while the plan is moving. Spending that budget on the 3D instead is the
       better trade: the panels stay translucent (just via opacity), and the
       scene keeps its full material quality rather than being auto-degraded
       to matte because the device looked slow. Desktop keeps the glass. */
    @media (pointer: coarse) {
      ha-card *,
      ha-card *::before,
      ha-card *::after {
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
      }
      /* Slightly more opaque to make up for the lost blur, so white text over a
         bright room photo stays as legible as it was. */
      ha-card.has-photo .room-panel {
        background: rgba(16, 17, 21, 0.72);
      }
    }
`;
