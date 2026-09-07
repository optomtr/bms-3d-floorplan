// ---------------------------------------------------------------------------
// Выдвижная карточка комнаты из «Обзора» + завершающие @media-блоки.
//
// ВНИМАНИЕ: этот кусок обязан оставаться ПОСЛЕДНИМ в массиве стилей —
// в нём живут @media, которые переопределяют правила выше. Три исходных
// блока (телефон, телефон, pointer: coarse) обязаны оставаться САМЫМИ
// ПОСЛЕДНИМИ правилами файла; новые блоки (планшет, prefers-reduced-motion)
// добавлены ПЕРЕД ними и им не мешают: планшетный запрос с телефонным
// взаимоисключающий, а reduced-motion трогает только длительности.
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
      z-index: var(--z-scrim);
      background: var(--scrim);
      backdrop-filter: blur(3px);
      animation: rp-fade 0.2s both;
    }
    .detail {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      width: min(720px, 82%);
      z-index: var(--z-sheet);
      background: radial-gradient(150% 120% at 80% 4%, var(--bg-3), var(--bg-1) 55%, var(--bg-0));
      border-left: 1px solid var(--brd);
      box-shadow: -30px 0 80px -20px var(--scrim);
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
      gap: var(--sp-4);
      padding: var(--sp-6) var(--sp-6) var(--sp-5);
    }
    .dback {
      width: var(--tap);
      height: var(--tap);
      flex: none;
      border-radius: var(--r-4);
      border: 1px solid var(--brd);
      background: var(--card);
      color: var(--tx);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      touch-action: manipulation;
    }
    .dback:active {
      background: var(--w-5);
    }
    .dtitle {
      font-size: var(--fs-7);
      font-weight: 700;
      color: var(--tx-hi);
      letter-spacing: -0.01em;
    }
    .dsub {
      font-size: var(--fs-3);
      color: var(--mut);
      margin-top: 2px;
    }
    .dbody {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden; /* vertical scroll only — never a left-right wobble */
      padding: var(--sp-2) var(--sp-6) var(--sp-6);
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      grid-auto-rows: min-content;
      gap: var(--sp-4);
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
    @media (hover: hover) {
      .dback:hover {
        background: var(--card2);
      }
    }

    /* Keep the editor/legacy overlays clear of the room panel in view mode. */
    ha-card.view .overlay.top-left {
      top: 108px;
      left: 30px;
    }
    ha-card.view .overlay.bottom {
      left: 26px;
      right: calc(var(--panel-w) + var(--sp-6));
      bottom: 74px;
      justify-content: flex-start;
    }

    /* ---- ЕДИНЫЙ ОТКЛИК НА НАЖАТИЕ --------------------------------------
       Правил :hover в продукте было 18, а :active — ДВА. Вместе с глобальным
       -webkit-tap-highlight-color: transparent это значило: на планшете почти
       шесть десятков кликабельных элементов не отвечали на палец НИЧЕМ, и
       человек жал второй раз — переключая устройство туда-обратно.
       Каждый элемент теперь красится сам (см. свои файлы), а это правило
       лежит в самом конце таблицы намеренно: заливку включённого элемента
       (.on / .sel / .active) правила-состояния перебивают, а сжатие — нет.
       Поэтому отклик виден и у включённой лампы, и у выбранной вкладки. */
    .btn:active,
    .tab:active,
    .qopt:active,
    .ctl:active,
    .cat-btn:active,
    .zbtn:active,
    .palette-cell:active,
    .zone-dev:active,
    .sdot:active,
    .vt-btn:active,
    .ftab:active,
    .pill:active,
    .closebtn:active,
    .segb:active,
    .qb:active,
    .ltile:active,
    .stbtn:active,
    .rp-master:active,
    .report-tab:active,
    button.rp-chip:active,
    button.cicon:active,
    .lightseg:active,
    .qstat.lockq:active,
    .ov-master:active,
    .bsleep:active,
    .dback:active,
    .leak-b:active,
    .leak-x:active,
    .pw-close:active {
      transform: scale(0.96);
    }
    /* Этим двум сжатие не подходит: у обоих идёт анимация появления
       rp-rise с fill-mode both, а значение transform из доигравшей анимации
       перебивает обычное объявление. Отвечают яркостью. */
    .lockbtn:active,
    .rcard.link:active {
      filter: brightness(1.35);
    }

    /* ---- Планшет на стене (целевое устройство продукта) -----------------
       Медиазапросов было три: два одинаковых max-width:720px (телефон) и
       pointer:coarse, который лишь гасил размытие. Планшет 1280x800 — то,
       на чём карточка живёт каждый день, — получал раскладку рабочего стола.
       Здесь: цель под палец 48px вместо 44 (до панели тянутся стоя и почти
       не глядя), панель комнаты шире под подросший кегль, поля по краям
       больше, чтобы таблетки комнат не липли к рамке экрана. */
    @media (min-width: 721px) and (max-width: 1400px) {
      :host {
        --tap: 48px;
        --panel-w: clamp(360px, 38%, 500px);
      }
      .clock {
        top: 28px;
        left: 34px;
      }
      .topstat {
        top: 28px;
        right: 34px;
      }
      .stage-bottom {
        left: 34px;
        right: 34px;
        bottom: 26px;
        gap: var(--sp-5);
      }
      .pills {
        gap: var(--sp-4);
      }
      .ov-top,
      .bstatus,
      .ov-grid {
        left: 34px;
        right: 34px;
      }
      .ov-grid {
        gap: var(--sp-5);
        bottom: 26px;
      }
      .rcfoot,
      .lightsegs {
        gap: var(--sp-2);
      }
      ha-card.view .overlay.top-left {
        left: 34px;
      }
      ha-card.view .overlay.bottom {
        left: 34px;
      }
    }

    /* ---- Меньше движения ------------------------------------------------
       Ни одна из 13 анимаций карточки не спрашивала prefers-reduced-motion.
       Гасим все разом; 0.01ms вместо none — чтобы анимации с fill-mode
       both (карточки устройств выезжают из opacity: 0) не остались
       невидимыми, а мгновенно доехали до конечного кадра. */
    @media (prefers-reduced-motion: reduce) {
      ha-card *,
      ha-card *::before,
      ha-card *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
      .saver-aurora {
        animation: none !important;
      }
    }

    @media (max-width: 720px) {
      .detail {
        width: 100%;
      }
      .dbody {
        grid-template-columns: 1fr;
      }
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
      .room-panel {
        top: 54%;
        width: 100%;
        border-left: none;
        border-top: 1px solid var(--brd);
      }
      .topstat {
        top: 16px;
        right: 16px;
      }
      /* Подпись у переключателя режимов рядом с часами и четырьмя точками
         статуса на 400px не помещается — остаются значки. */
      .vt-btn span {
        display: none;
      }
      .vt-btn {
        padding: 0 var(--sp-3);
      }
      /* Часы уходят ПОД ряд статуса: наверху они с ним пересекались. */
      .clock {
        top: 72px;
        left: 18px;
      }
      .ctime {
        font-size: 48px;
      }
      .pills {
        right: 18px;
      }
      ha-card.view .overlay.bottom {
        right: 18px;
      }
      /* «Обзор» на узком экране. Три слоя стояли абсолютно, с жёсткими
         отступами сверху (30 / 122 / 202px), рассчитанными на широкую
         карточку: на 400px шапка, статусная строка и сетка складывались
         друг в друга. Переводим раздел в обычный поток. */
      ha-card.view.overview {
        overflow-y: auto;
      }
      ha-card.view.overview .ov-top,
      ha-card.view.overview .bstatus,
      ha-card.view.overview .ov-grid {
        position: static;
        inset: auto;
      }
      ha-card.view.overview .ov-top {
        flex-direction: column;
        align-items: stretch;
        gap: var(--sp-4);
        padding: var(--sp-5) var(--sp-5) 0;
      }
      ha-card.view.overview .ov-actions {
        justify-content: flex-start;
      }
      ha-card.view.overview .bstatus {
        grid-template-columns: repeat(2, 1fr);
        padding: var(--sp-5) var(--sp-5) 0;
      }
      ha-card.view.overview .ov-grid {
        grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
        padding: var(--sp-5);
        overflow: visible;
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
        background: var(--glass-photo-flat);
      }
      /* Заставка крутила бесконечную 16-секундную «полярную зарю» ровно тогда,
         когда панели надо утихнуть: композитор не засыпает, экран не гаснет,
         подсветка светит всю ночь. На сенсорных устройствах (а это и есть
         настенные панели) гасим — картинка остаётся той же, просто
         неподвижной. На настольном браузере она ничего не стоит и живёт. */
      .saver-aurora {
        animation: none !important;
      }
    }
`;
