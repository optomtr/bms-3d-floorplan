// ---------------------------------------------------------------------------
// Каркас карточки: :host, ha-card, вьюпорт, фон комнаты, оверлеи,
// подсказка входа в редактор, меню качества и базовые кнопки.
//
// Кусок общей таблицы стилей карточки. ПОРЯДОК кусков в массиве
// `BmsFloorplanCard.styles` = порядок каскада: в файле есть селекторы,
// которые повторяются, и побеждает последний. Переставлять нельзя.
//
// Первым здесь подключаются ТОКЕНЫ (./tokens): массив стилей объявлен в
// ha-3d-floorplan-card.ts и трогать его нельзя, а объявления обязаны идти
// раньше всех обращений — поэтому они вложены в начало этого, первого куска.
// ---------------------------------------------------------------------------

import { css } from 'lit';
import { tokenStyles } from './tokens';

export const baseStyles = css`
    ${tokenStyles}

    :host {
      display: block;
      /* Фон и цвет текста заданы ЯВНО: карточка намеренно тёмная всегда и не
         должна перенимать светлую тему хозяйской страницы (см. tokens.ts). */
      color: var(--tx);
      background: var(--bg-2);
      font-family: 'Onest', system-ui, -apple-system, 'Segoe UI', sans-serif;
      font-size: var(--fs-3);
    }
    /* Отступ и рамка НЕ должны прибавляться к заявленному размеру. Во всех
       2491 строке прежних стилей box-sizing не встречался ни разу — из-за
       этого «кнопка 44px» на деле была 46, кнопка grid2 с width:100%
       вылезала за колонку сетки, а ячейка палитры (76px + padding) не
       помещалась в дорожку repeat(auto-fill, 76px). Задаём глобально. */
    *,
    *::before,
    *::after {
      box-sizing: border-box;
    }
    /* Киоск/планшет: никакой браузерной вспышки по тапу — WebView рисует свою
       подсветку и на ссылках, и на пилюлях, и на div'ах. Отклик на нажатие мы
       даём сами, правилами :active (их теперь 40+ вместо двух). */
    * {
      -webkit-tap-highlight-color: transparent;
    }
    /* Мышиный фокус не обводим, КЛАВИАТУРНЫЙ — обязательно. Раньше здесь
       стояло «outline: none !important» разом на :focus и :focus-visible:
       карточка становилась непроходимой с клавиатуры, а !important не давал
       вернуть кольцо ни одному правилу ниже. */
    *:focus {
      outline: none;
    }
    *:focus-visible {
      outline: 2px solid var(--pri);
      outline-offset: 2px;
    }
    ha-card {
      display: block;
      position: relative;
      overflow: hidden;
      padding: 0;
      color: var(--tx);
      background: var(--bg-2);
    }
    .viewport {
      position: relative;
      width: 100%;
      /* Critical for tablets: stop the browser hijacking pinch into page zoom. */
      touch-action: none;
      overscroll-behavior: contain;
      background: var(--bg-2);
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
      background: var(--glass-photo);
      backdrop-filter: blur(7px) saturate(1.18);
      -webkit-backdrop-filter: blur(7px) saturate(1.18);
      border-left-color: var(--w-5);
    }
    .overlay {
      position: absolute;
      z-index: var(--z-over);
      display: flex;
      gap: var(--sp-2);
    }
    .top-right {
      top: var(--sp-3);
      right: var(--sp-3);
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
      z-index: var(--z-chrome);
      touch-action: none;
    }
    /* Tap anywhere outside the open quality menu to dismiss it. Sits above the
       canvas but below the overlay that holds the menu itself. */
    .menu-backdrop {
      position: absolute;
      inset: 0;
      z-index: var(--z-under);
    }
    .quality-menu {
      position: absolute;
      top: calc(100% + var(--sp-2));
      right: 0;
      display: flex;
      flex-direction: column;
      gap: var(--sp-1);
      padding: var(--sp-1);
      border-radius: var(--r-3);
      background: var(--glass);
      border: 1px solid var(--w-5);
      backdrop-filter: blur(6px);
      z-index: var(--z-menu);
    }
    .qopt {
      font: inherit;
      font-size: var(--fs-3);
      min-height: var(--tap);
      color: var(--tx);
      background: var(--w-2);
      border: 1px solid var(--w-4);
      border-radius: var(--r-2);
      padding: var(--sp-2) var(--sp-5);
      cursor: pointer;
      text-align: left;
      white-space: nowrap;
      touch-action: manipulation;
    }
    .qopt:active {
      background: var(--w-5);
    }
    .qopt.on {
      background: var(--pri);
      border-color: var(--pri);
    }
    .top-left {
      top: var(--sp-3);
      left: var(--sp-3);
    }
    .bottom {
      bottom: var(--sp-3);
      left: 50%;
      transform: translateX(-50%);
      flex-wrap: wrap;
      justify-content: center;
      max-width: 90%;
    }
    /* Все кнопки редактора и селекторы. Раньше 31,6px по высоте — под палец
       не годится ни одна; теперь пол в 44px задан явно. */
    .btn,
    .tab,
    .select {
      font: inherit;
      font-size: var(--fs-3);
      min-height: var(--tap);
      color: var(--tx);
      background: var(--field);
      border: 1px solid var(--w-5);
      border-radius: var(--r-2);
      padding: var(--sp-2) var(--sp-4);
      cursor: pointer;
      backdrop-filter: blur(4px);
      touch-action: manipulation;
    }
    .btn:active,
    .tab:active {
      background: var(--w-5);
    }
    .tab.active,
    .btn.active {
      background: var(--pri);
      border-color: var(--pri);
    }
    .btn.primary {
      background: var(--ok);
      border-color: var(--ok);
    }
    .btn[disabled] {
      opacity: 0.4;
      cursor: default;
      pointer-events: none;
    }
    /* Наведение — только там, где есть настоящий курсор. На планшете
       :hover «залипает» после тапа и элемент остаётся подсвеченным. */
    @media (hover: hover) {
      .qopt:hover {
        background: var(--w-4);
      }
      .btn:hover,
      .tab:hover {
        background: var(--w-4);
      }
    }
`;
