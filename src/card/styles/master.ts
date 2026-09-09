// ---------------------------------------------------------------------------
// Панель «Мастер» — управление домом по разделам (src/card/views/master.ts).
//
// Кусок общей таблицы стилей карточки. ПОРЯДОК кусков в массиве
// `BmsFloorplanCard.styles` = порядок каскада; этот файл стоит ПОСЛЕ «Обзора»
// и ДО detailStyles, в конце которого живут завершающие @media-блоки.
//
// Все свои селекторы начинаются с `.ms-` — раздел ничего не переопределяет
// у соседей, и его можно двигать по массиву, не разбирая каскад.
// ---------------------------------------------------------------------------

import { css } from 'lit';

export const masterStyles = css`
    /* Вход в панель: подписанная кнопка в «Обзоре» и кружок в полосе 3D.
       48px — цель под палец на настенном планшете (наш общий пол 44 здесь
       поднят: это кнопка, меняющая весь дом, промах по ней дорог). */
    .ms-open {
      min-height: 48px;
    }
    .sdot.ms-open {
      width: 48px;
      height: 48px;
      color: var(--tx);
      border-color: var(--w-4);
    }
    /* Подпись «Управление» стоит 112px ширины. Ряд шапки «Обзора» стоит
       абсолютно, а строка состояния под ним прибита к 122px сверху: как только
       ряд переносится, он ложится НА неё. Замерено: с подписью перенос
       начинался с 1100px вместо прежних ~950. Ниже 1200px оставляем один
       значок — ровно как это уже сделано у переключателя «Комната/Обзор». */
    @media (max-width: 1200px) {
      .ov-master.ms-open span {
        display: none;
      }
      .ov-master.ms-open {
        width: 48px;
        padding: 0;
        justify-content: center;
      }
    }

    /* У панели НЕТ анимации въезда — и это решение, а не забывчивость.
       Карточка рисует кадры по требованию (сцена спит, пока её не трогают), а
       время анимации идёт только по нарисованным кадрам. Замерено на стенде:
       через 800 мс после открытия у выдвижной карточки комнаты прошло 66 мс
       анимации, а у этой панели — 0 мс. То есть панель, которую человек только
       что позвал, стоит прозрачной и сдвинутой на 40px за правый край экрана.
       Панель управления домом обязана появляться СРАЗУ; красивый въезд не
       стоит риска показать пустоту. Сторож — tests/27-master.spec.ts. */
    .ms-back {
      position: absolute;
      inset: 0;
      z-index: var(--z-scrim);
      background: var(--scrim);
    }
    .ms-sheet {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      width: min(560px, 92%);
      z-index: var(--z-sheet);
      background: radial-gradient(150% 120% at 80% 4%, var(--bg-3), var(--bg-1) 55%, var(--bg-0));
      border-left: 1px solid var(--brd);
      box-shadow: -30px 0 80px -20px var(--scrim);
      display: flex;
      flex-direction: column;
    }
    .ms-head {
      display: flex;
      align-items: center;
      gap: var(--sp-4);
      padding: var(--sp-6) var(--sp-6) var(--sp-5);
    }
    .ms-x {
      width: 48px;
      height: 48px;
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
    .ms-x:active {
      background: var(--w-5);
    }
    .ms-title {
      font-size: var(--fs-7);
      font-weight: 700;
      color: var(--tx-hi);
      letter-spacing: -0.01em;
    }
    .ms-sub {
      font-size: var(--fs-3);
      color: var(--mut);
      margin-top: 2px;
    }
    .ms-body {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden; /* только вертикальная прокрутка — никакого качания вбок */
      padding: 0 var(--sp-6) var(--sp-6);
      display: flex;
      flex-direction: column;
      gap: var(--sp-4);
    }
    .ms-body::-webkit-scrollbar {
      width: 0;
    }
    .ms-sec {
      background: var(--card);
      border: 1px solid var(--brd);
      border-radius: var(--r-5);
      padding: var(--sp-5);
      display: flex;
      flex-direction: column;
      gap: var(--sp-4);
      min-width: 0;
    }
    .ms-sec-h {
      display: flex;
      align-items: center;
      gap: var(--sp-4);
      min-width: 0;
    }
    .ms-ic {
      width: 38px;
      height: 38px;
      flex: none;
      border-radius: var(--r-3);
      background: var(--w-2);
      color: var(--mut);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .ms-ic.on {
      background: var(--accent-soft);
      color: var(--accent);
    }
    .ms-name {
      font-size: var(--fs-5);
      font-weight: 700;
      color: var(--tx-hi);
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    /* Счётчик «работает N из M» — он и есть предупреждение перед массовым
       действием, поэтому прижат к правому краю и не сжимается в многоточие. */
    .ms-count {
      margin-left: auto;
      flex: none;
      font-size: var(--fs-2);
      color: var(--mut);
      text-align: right;
    }
    .ms-note {
      display: flex;
      align-items: center;
      gap: var(--sp-2);
      font-size: var(--fs-2);
      color: var(--mut);
    }
    .ms-note.bad {
      color: var(--bad);
    }
    .ms-note .icn {
      width: 16px;
      height: 16px;
      flex: none;
    }
    .ms-empty {
      padding: var(--sp-5);
      border: 1px dashed var(--w-4);
      border-radius: var(--r-5);
      font-size: var(--fs-3);
      color: var(--mut);
      line-height: 1.5;
    }
    /* 190px — не «на глаз»: при 16px/600 самая длинная подпись раздела
       («Выключить все» + значок + число) занимает ~186px. Уже — и подписи
       кнопок, меняющих весь дом, ужимаются в многоточие. */
    .ms-btns {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
      gap: var(--sp-3);
    }
    .ms-btn {
      box-sizing: border-box;
      min-height: 52px;
      min-width: 0; /* иначе длинная подпись распирает колонку за край панели */
      padding: 0 var(--sp-4);
      display: flex;
      align-items: center;
      gap: var(--sp-3);
      border-radius: var(--r-4);
      border: 1px solid var(--brd);
      background: var(--card2);
      color: var(--tx);
      font: inherit;
      font-size: var(--fs-4);
      font-weight: 600;
      cursor: pointer;
      touch-action: manipulation;
    }
    .ms-btn .icn {
      flex: none;
    }
    .ms-btn-l {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    /* Число устройств, которых коснётся ЭТА кнопка. Стоит на самой кнопке,
       а не только в заголовке раздела: жмут по кнопке. */
    .ms-n {
      margin-left: auto;
      flex: none;
      min-width: 26px;
      padding: 2px var(--sp-2);
      border-radius: var(--r-pill);
      background: var(--w-3);
      color: var(--tx);
      font-size: var(--fs-2);
      font-weight: 700;
      text-align: center;
    }
    .ms-btn.warm {
      border-color: var(--accent-line);
      color: var(--accent);
    }
    .ms-btn.warm .ms-n {
      background: var(--accent-soft);
      color: var(--accent);
    }
    .ms-btn.cool {
      border-color: var(--cool-line);
      color: var(--cool);
    }
    .ms-btn.cool .ms-n {
      background: var(--cool-soft);
      color: var(--cool);
    }
    .ms-btn:active {
      background: var(--w-5);
    }
    /* Делать нечего — кнопка гаснет и перестаёт быть целью. Молчаливое
       нажатие «в никуда» человек читает как поломку панели. */
    .ms-btn[disabled] {
      opacity: 0.4;
      cursor: default;
      border-color: var(--brd);
      color: var(--mut);
    }
    .ms-btn[disabled] .ms-n {
      background: var(--w-2);
      color: var(--mut);
    }
    .ms-alloff {
      border-color: var(--bad-line);
      background: linear-gradient(var(--bad-soft), transparent 60%), var(--card);
    }
    .ms-alloff .ms-ic.on {
      background: var(--bad-soft);
      color: var(--bad);
    }
    .ms-alloff .ms-btn {
      grid-column: 1 / -1;
      justify-content: flex-start;
    }
    @media (hover: hover) {
      .ms-btn:hover:not([disabled]) {
        background: var(--w-4);
      }
      .ms-x:hover,
      .sdot.ms-open:hover {
        background: var(--card2);
      }
    }
    /* Телефон и узкая карточка: панель на всю ширину, кнопки в один столбец —
       иначе подписи «Выключить все» ужимаются до многоточия. */
    @media (max-width: 720px) {
      .ms-sheet {
        width: 100%;
      }
      .ms-head {
        padding: var(--sp-5) var(--sp-5) var(--sp-4);
      }
      .ms-body {
        padding: 0 var(--sp-5) var(--sp-5);
      }
      .ms-btns {
        grid-template-columns: 1fr;
      }
    }
`;
