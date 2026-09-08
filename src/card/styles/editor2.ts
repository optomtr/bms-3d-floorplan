// ---------------------------------------------------------------------------
// Оформление НОВОГО конструктора: раскладка «план сверху + 3D рядом», полоса
// инструментов, контекстный инспектор.
//
// Кусок общей таблицы стилей карточки, подключается ПЕРЕД detailStyles: три
// блока @media в конце detailStyles обязаны оставаться последними правилами.
//
// Первым внутрь вложены кнопки и поля (./editor2-controls): правила раскладки
// уточняют их (.e2-tool крупнее .e2-btn), а при равной силе селектора
// побеждает последний — значит база обязана идти раньше.
//
// Токены общие (styles/tokens.ts): ни одного своего цвета и ни одного своего
// кегля здесь нет. Единственная местная переменная — --e2-tap: цель под палец
// 44 px, на сенсорном экране 48.
//
// Слои. Холст 3D (.viewport) один на карточку и лежит НАД оболочкой, поэтому
// место под него (.e2-3d-slot) оставлено дырой без фона, а всё, что обязано
// быть поверх холста, поднято на --z-chrome и выше.
// ---------------------------------------------------------------------------

import { css } from 'lit';
import { editor2ControlsStyles } from './editor2-controls';

export const editor2Styles = css`
    ${editor2ControlsStyles}

    .e2-shell {
      --e2-tap: 44px;
      position: relative;
      display: flex;
      flex-direction: column;
      width: 100%;
      overflow: hidden;
      font-size: var(--fs-3);
    }

    /* ---- Холст 3D ставится ровно на место-заглушку ---------------------- */
    ha-card.e2 .viewport {
      position: absolute;
      left: var(--e2-vp-x, 0px);
      top: var(--e2-vp-y, 0px);
      width: var(--e2-vp-w, 1px);
      height: var(--e2-vp-h, 1px);
      visibility: var(--e2-vp-vis, hidden);
      border-radius: var(--r-3);
      overflow: hidden;
    }

    /* ---- Верхняя полоса -------------------------------------------------- */
    .e2-top {
      position: relative;
      z-index: var(--z-chrome);
      display: flex;
      align-items: center;
      gap: var(--sp-2);
      padding: var(--sp-2) var(--sp-3);
      background: var(--bg-1);
      border-bottom: 1px solid var(--w-3);
      flex: 0 0 auto;
      flex-wrap: wrap;
    }
    .e2-top-gap {
      flex: 1 1 auto;
    }
    .e2-top-btn {
      max-width: 220px;
    }
    .e2-top-floor {
      color: var(--mut);
      padding: 0 var(--sp-2);
      white-space: nowrap;
    }
    .e2-tabs {
      display: flex;
      gap: 2px;
      padding: 2px;
      border-radius: var(--r-pill);
      background: var(--w-2);
    }
    .e2-tab {
      font: inherit;
      font-size: var(--fs-4);
      min-height: var(--e2-tap);
      min-width: 84px;
      padding: 0 var(--sp-5);
      color: var(--tx);
      background: transparent;
      border: 0;
      border-radius: var(--r-pill);
      cursor: pointer;
      touch-action: manipulation;
    }
    .e2-tab.on {
      background: var(--pri);
      color: var(--tx-hi);
    }

    /* ---- Тело: полоса инструментов + панели ------------------------------ */
    .e2-body {
      position: relative;
      display: flex;
      flex: 1 1 auto;
      min-height: 0;
    }
    /* Полоса инструментов лежит ГОРИЗОНТАЛЬНО под верхней полосой. Вертикальная
       колонка из тех же тринадцати кнопок не помещается по высоте планшета
       (на сенсорном экране кнопка ещё выше) и молча обрезалась вторым
       столбцом — половину инструментов было не достать. По ширине место есть
       всегда, а в книжной ориентации полоса честно переносится на вторую
       строку. */
    .e2-rail {
      position: relative;
      z-index: var(--z-chrome);
      display: flex;
      flex-flow: row wrap;
      align-items: stretch;
      gap: var(--sp-1);
      padding: var(--sp-2) var(--sp-3);
      background: var(--bg-1);
      border-bottom: 1px solid var(--w-3);
      flex: 0 0 auto;
    }
    .e2-rail-sep {
      width: 1px;
      align-self: stretch;
      margin: 0 var(--sp-2);
      background: var(--w-3);
    }
    .e2-tool {
      flex-direction: column;
      gap: 2px;
      width: 76px;
      min-height: 56px;
      padding: var(--sp-1);
      font-size: var(--fs-1);
      line-height: 1.1;
    }
    /* Привязке нужна не только подсветка: «включена/выключена» обязано
       читаться словом, а слово шире значка. */
    .e2-snap {
      width: 96px;
    }

    .e2-panes {
      position: relative;
      flex: 1 1 auto;
      min-width: 0;
    }
    .e2-plan {
      position: absolute;
      z-index: var(--z-chrome);
      inset: 0 var(--e2-side) 0 0;
      background: var(--bg-2);
      display: flex;
      flex-direction: column;
    }
    .e2-plan-host {
      flex: 1 1 auto;
      min-height: 0;
      /* Планшет: жесты достаются движку, браузер не забирает их под свой зум. */
      touch-action: none;
      overscroll-behavior: contain;
    }
    .e2-canvas {
      display: block;
      width: 100%;
      height: 100%;
    }
    .e2-status {
      flex: 0 0 auto;
      padding: var(--sp-2) var(--sp-4);
      color: var(--info);
      font-size: var(--fs-2);
      background: var(--w-1);
      border-top: 1px solid var(--w-3);
    }
    .e2-grip {
      position: absolute;
      z-index: var(--z-menu);
      top: 0;
      bottom: 0;
      right: calc(var(--e2-side) - 7px);
      width: 14px;
      cursor: col-resize;
      touch-action: none;
      background: linear-gradient(90deg, transparent 5px, var(--w-4) 5px, var(--w-4) 9px, transparent 9px);
    }
    .e2-grip:hover,
    .e2-grip:focus-visible {
      background: linear-gradient(90deg, transparent 4px, var(--pri) 4px, var(--pri) 10px, transparent 10px);
    }
    /* Дыра: сюда смотрит общий холст сцены, своего фона быть не должно. */
    .e2-3d-slot {
      position: absolute;
      top: 0;
      right: 0;
      width: var(--e2-side);
      height: var(--e2-3d-h);
    }
    .e2-inspect-wrap {
      position: absolute;
      z-index: var(--z-chrome);
      top: var(--e2-3d-h);
      right: 0;
      bottom: 0;
      width: var(--e2-side);
      background: var(--bg-1);
      border-left: 1px solid var(--w-3);
      display: flex;
      flex-direction: column;
      min-height: 0;
    }
    /* Спрятанная панель ОСТАЁТСЯ в разметке: движок не размонтируется и
       состояние черчения при переключении вкладок не теряется. */
    .e2-plan.hidden,
    .e2-3d-slot.hidden,
    .e2-inspect-wrap.hidden {
      visibility: hidden;
      pointer-events: none;
    }

    /* ---- Инспектор ------------------------------------------------------- */
    .e2-inspect {
      display: flex;
      flex-direction: column;
      min-height: 0;
      height: 100%;
    }
    .e2-inspect-head {
      display: flex;
      align-items: center;
      gap: var(--sp-2);
      padding: var(--sp-3) var(--sp-4);
      font-size: var(--fs-4);
      font-weight: 700;
      border-bottom: 1px solid var(--w-3);
      flex: 0 0 auto;
    }
    .e2-inspect-head > span {
      flex: 1 1 auto;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .e2-inspect-body {
      flex: 1 1 auto;
      min-height: 0;
      overflow-y: auto;
      padding: var(--sp-3) var(--sp-4) var(--sp-5);
      display: flex;
      flex-direction: column;
      gap: var(--sp-3);
      scrollbar-width: thin;
      -webkit-overflow-scrolling: touch;
    }

    /* ---- Планшет книжный: вкладки вместо двух панелей -------------------- */
    .e2-shell.narrow .e2-plan {
      inset: 0;
    }
    /* Шторка инспектора не накрывает чертёж, а отжимает его: чертить под
       наполовину закрытым планом невозможно. */
    .e2-shell.narrow .e2-plan.with-sheet {
      bottom: 46%;
    }
    .e2-shell.narrow .e2-3d-slot {
      inset: 0;
      width: auto;
      height: auto;
    }
    .e2-shell.narrow .e2-inspect-wrap {
      top: auto;
      left: 0;
      right: 0;
      bottom: 0;
      width: auto;
      max-height: 46%;
      border-left: 0;
      border-top: 1px solid var(--w-4);
      border-radius: var(--r-4) var(--r-4) 0 0;
      box-shadow: 0 -8px 24px var(--shadow);
    }
    .e2-shell.narrow .e2-palette {
      left: var(--sp-3);
      right: var(--sp-3);
      width: auto;
      top: auto;
      height: 62%;
    }

    /* Планшет: цель под палец крупнее — 48 px вместо 44. */
    @media (pointer: coarse) {
      .e2-shell {
        --e2-tap: 48px;
      }
      .e2-tool {
        min-height: 60px;
      }
    }
`;
