// ---------------------------------------------------------------------------
// Каркас карточки: :host, ha-card, вьюпорт, фон комнаты, оверлеи,
// подсказка входа в редактор, меню качества и базовые кнопки.
//
// Кусок общей таблицы стилей карточки. ПОРЯДОК кусков в массиве
// `BmsFloorplanCard.styles` = порядок каскада: в файле есть селекторы,
// которые повторяются, и побеждает последний. Переставлять нельзя.
// ---------------------------------------------------------------------------

import { css } from 'lit';

export const baseStyles = css`
    :host {
      display: block;
    }
    /* Kiosk/tablet: never draw a focus ring or tap flash on ANY control.
       WebView draws its own highlight on links/pills/divs too, so this has to
       be blanket — the earlier button-only rule left some controls ringed. */
    * {
      -webkit-tap-highlight-color: transparent;
    }
    *:focus,
    *:focus-visible {
      outline: none !important;
    }
    ha-card {
      display: block;
      position: relative;
      overflow: hidden;
      padding: 0;
    }
    .viewport {
      position: relative;
      width: 100%;
      /* Critical for tablets: stop the browser hijacking pinch into page zoom. */
      touch-action: none;
      overscroll-behavior: contain;
      background: #1b1d22;
    }
    /* The focused room's design photo, spanning the WHOLE card — the canvas
       stops at the side panel, so a backdrop drawn inside the scene could never
       reach behind it. The canvas goes transparent while this is up. */
    .roombg {
      position: absolute;
      inset: 0;
      z-index: 0;
      background-size: cover;
      background-position: center;
      /* The softening is baked into the bitmap once (see bakeRoomPhoto) rather
         than applied as a live CSS filter: a filter on a full-card layer is
         re-evaluated by the compositor as the 3D repaints behind it, which is
         pure cost on a tablet for a picture that never changes. Same look, none
         of the per-frame work. contain keeps it off the 3D's repaint path. */
      contain: strict;
      animation: fade-in 0.32s ease both;
    }
    /* Fallback for the un-baked original (canvas unavailable / cross-origin). */
    .roombg.raw {
      filter: blur(6px) brightness(0.92);
      transform: scale(1.06);
    }
    @keyframes fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    ha-card.has-photo .viewport {
      background: transparent;
    }
    /* Over a photo the panel is glass, not a wall that crops it. Light blur:
       enough to keep white text legible over a bright photo, little enough that
       the room still reads through it. */
    ha-card.has-photo .room-panel {
      background: rgba(16, 17, 21, 0.36);
      backdrop-filter: blur(7px) saturate(1.18);
      -webkit-backdrop-filter: blur(7px) saturate(1.18);
      border-left-color: rgba(255, 255, 255, 0.2);
    }
    .overlay {
      position: absolute;
      z-index: 2;
      display: flex;
      gap: 6px;
    }
    .top-right {
      top: 10px;
      right: 10px;
    }
    .quality-wrap {
      position: relative;
    }
    /* Invisible bottom-left hotspot: hold 5s to open the editor (kiosk-safe).
       Bottom-left keeps it clear of the kiosk's "Home Assistant" back button. */
    .edit-hotspot {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 56px;
      height: 56px;
      z-index: 3;
      touch-action: none;
    }
    /* Tap anywhere outside the open quality menu to dismiss it. Sits above the
       canvas but below the overlay that holds the menu itself. */
    .menu-backdrop {
      position: absolute;
      inset: 0;
      z-index: 1;
    }
    .quality-menu {
      position: absolute;
      top: calc(100% + 6px);
      right: 0;
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 5px;
      border-radius: 10px;
      background: rgba(20, 22, 26, 0.92);
      border: 1px solid rgba(255, 255, 255, 0.16);
      backdrop-filter: blur(6px);
      z-index: 4;
    }
    .qopt {
      font: inherit;
      font-size: 13px;
      color: #fff;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 7px;
      padding: 7px 14px;
      cursor: pointer;
      text-align: left;
      white-space: nowrap;
    }
    .qopt:hover {
      background: rgba(255, 255, 255, 0.14);
    }
    .qopt.on {
      background: var(--primary-color, #03a9f4);
      border-color: var(--primary-color, #03a9f4);
    }
    .top-left {
      top: 10px;
      left: 10px;
    }
    .bottom {
      bottom: 10px;
      left: 50%;
      transform: translateX(-50%);
      flex-wrap: wrap;
      justify-content: center;
      max-width: 90%;
    }
    .btn,
    .tab,
    .select {
      font: inherit;
      font-size: 13px;
      color: #fff;
      background: rgba(30, 33, 40, 0.82);
      border: 1px solid rgba(255, 255, 255, 0.16);
      border-radius: 8px;
      padding: 7px 12px;
      cursor: pointer;
      backdrop-filter: blur(4px);
      -webkit-tap-highlight-color: transparent;
    }
    .btn:hover,
    .tab:hover {
      background: rgba(55, 60, 70, 0.9);
    }
    .tab.active,
    .btn.active {
      background: var(--primary-color, #03a9f4);
      border-color: var(--primary-color, #03a9f4);
    }
    .btn.primary {
      background: #2e7d32;
      border-color: #2e7d32;
    }
    .btn[disabled] {
      opacity: 0.4;
      cursor: default;
      pointer-events: none;
    }
`;
