// ---------------------------------------------------------------------------
// Режим «Комната»: 3D во весь экран, часы, статусные точки, вкладки
// этажей, таблетки комнат, заставка.
//
// Кусок общей таблицы стилей карточки. ПОРЯДОК кусков в массиве
// `BmsFloorplanCard.styles` = порядок каскада: в файле есть селекторы,
// которые повторяются, и побеждает последний. Переставлять нельзя.
// ---------------------------------------------------------------------------

import { css } from 'lit';

export const roomViewStyles = css`
    /* ===================================================================
       Room-in-focus layout (Option 1A): 3D + clock + pills on the left,
       the selected room's device panel on the right.

       Переменные, которые раньше объявлялись ЗДЕСЬ (--accent, --cool, --tx,
       --mut, --brd, --card, --card2, --panel-w), переехали в :host
       (styles/tokens.ts): пока они висели на ha-card.view, весь редактор
       (ha-card.editing) оставался вне системы оформления.
       =================================================================== */
    ha-card.view {
      background: radial-gradient(150% 120% at 80% 4%, var(--bg-3), var(--bg-1) 52%, var(--bg-0));
    }
    ha-card.view.room .viewport {
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      width: auto;
      height: auto;
      background: transparent;
      /* Deliberately NOT animated. Easing the right edge resizes the WebGL
         canvas on every frame of the transition, and each resize reallocates
         the drawing buffer and forces a synchronous draw (see
         SceneManager.resize) — which is what made opening a room stutter on the
         tablets. The canvas now resizes once and the panel slides over it on
         transform alone. */
    }
    /* A room is in focus → make room for the right-side panel. */
    ha-card.view.room.has-room .viewport {
      right: var(--panel-w);
    }

    /* ---- Clock + status dots + room pills (over the 3D) ---- */
    .clock {
      position: absolute;
      top: var(--sp-6);
      left: 30px;
      z-index: var(--z-chrome);
      pointer-events: none;
    }
    .ctime {
      font-family: 'Unbounded', 'Onest', sans-serif;
      font-size: var(--fs-clock);
      line-height: 0.9;
      font-weight: 300;
      letter-spacing: -0.02em;
      color: var(--tx-hi);
      font-variant-numeric: tabular-nums;
    }
    .cdate {
      margin-top: var(--sp-3);
      font-size: var(--fs-4);
      color: var(--mut);
    }
    .topstat {
      position: absolute;
      top: 30px;
      right: 30px;
      z-index: var(--z-menu);
      display: flex;
      align-items: center;
      gap: var(--sp-3);
      /* Not animated. Easing the right edge relayouts this row on every frame of
         the panel animation. A transform would be compositor-only, but --panel-w
         is a clamp() holding a percentage, and inside transform a percentage
         resolves against this element's own width rather than the card's — so it
         lands in the wrong place. Snapping matches .stage-bottom below. */
    }
    ha-card.view.room.has-room .topstat {
      right: calc(var(--panel-w) + var(--sp-6));
    }
    /* Было 42x42 плюс рамка — порог 44 брался только за счёт рамки, а с
       box-sizing рамка уже внутри. Задаём 44 явно. */
    .sdot {
      position: relative;
      width: var(--tap);
      height: var(--tap);
      border-radius: var(--r-4);
      background: var(--card);
      border: 1px solid var(--brd);
      color: var(--mut);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font: inherit;
      touch-action: manipulation;
    }
    .sdot:active {
      background: var(--w-4);
      color: var(--tx);
    }
    .sdot .on-dot {
      position: absolute;
      top: var(--sp-3);
      right: var(--sp-3);
      width: 6px;
      height: 6px;
      border-radius: var(--r-circle);
      background: var(--accent);
    }
    /* Bottom stack over the 3D: floor tabs, room pills, and the "pick a room"
       hint. Shifts left of the panel when a room is in focus. */
    .stage-bottom {
      position: absolute;
      left: 26px;
      right: 26px;
      bottom: 22px;
      z-index: var(--z-chrome);
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: var(--sp-4);
      /* Not animated: this box is pinned on BOTH edges, so easing the right one
         animates its WIDTH — a relayout of the floor tabs and room pills every
         frame. Its content is left-aligned, so snapping the edge is invisible
         unless the pills happen to wrap. */
    }
    ha-card.view.room.has-room .stage-bottom {
      right: calc(var(--panel-w) + var(--sp-6));
    }
    /* Счётчик комнат на язычке, который убирает полосу: на объекте владельца
       восемнадцать плашек занимали половину экрана. Всё остальное у язычка —
       общее с плашкой (см. групповой селектор .pill, .pills-tab ниже). */
    .pills-tab em {
      font-style: normal;
      color: var(--tx-hi);
      font-variant-numeric: tabular-nums;
    }
    .pills {
      display: flex;
      flex-wrap: wrap;
      gap: var(--sp-3);
    }
    .ftabs {
      display: inline-flex;
      padding: var(--sp-1);
      gap: var(--sp-1);
      border-radius: var(--r-4);
      background: var(--card);
      border: 1px solid var(--brd);
    }
    .ftab {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: var(--tap);
      padding: 0 var(--sp-5);
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
    .ftab:active {
      background: var(--w-4);
      color: var(--tx);
    }
    .ftab.on {
      background: var(--fill-hi);
      color: var(--ink);
    }
    .ahint {
      display: inline-flex;
      align-items: center;
      gap: var(--sp-3);
      padding: var(--sp-3) var(--sp-5);
      border-radius: var(--r-4);
      background: var(--accent-soft);
      border: 1px solid var(--accent-line);
      color: var(--accent);
      font-size: var(--fs-4);
      font-weight: 600;
      max-width: 100%;
    }
    .ahint .icn {
      width: 18px;
      height: 18px;
    }
    /* Room panel header top row (name + close). */
    .rp-top {
      display: flex;
      align-items: center;
      gap: var(--sp-3);
    }
    .rp-top .rp-name {
      flex: 1;
      min-width: 0;
    }
    .closebtn {
      width: var(--tap);
      height: var(--tap);
      flex: none;
      border-radius: var(--r-3);
      border: 1px solid var(--brd);
      background: var(--card);
      color: var(--mut);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      touch-action: manipulation;
    }
    .closebtn:active {
      background: var(--w-5);
      color: var(--tx);
    }
    /* Climate mode chips — wrap onto more rows so a unit with many modes
       (auto/fan/dry/cool/heat/off) is never squashed or clipped. */
    .seg {
      display: flex;
      flex-wrap: wrap;
      gap: var(--sp-2);
      margin-top: var(--sp-4);
    }
    .segb {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: 1 1 auto;
      min-width: 72px;
      min-height: var(--tap);
      padding: var(--sp-3) var(--sp-3);
      border-radius: var(--r-3);
      border: 1px solid var(--brd);
      background: var(--w-2);
      color: var(--mut);
      font: inherit;
      font-size: var(--fs-4);
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      touch-action: manipulation;
    }
    .segb:active {
      background: var(--w-4);
      color: var(--tx);
    }
    .segb.on {
      background: var(--cool-soft);
      border-color: var(--cool-line);
      color: var(--cool);
    }
    /* Blinds quick buttons. */
    .qbtns {
      display: flex;
      gap: var(--sp-3);
      margin-top: var(--sp-4);
    }
    /* Intercom: two big pill buttons, icon over label. */
    .intercom-btns {
      gap: var(--sp-3);
    }
    .intercom-btns .qb {
      flex-direction: column;
      gap: var(--sp-3);
      padding: var(--sp-5) 0;
      font-size: var(--fs-4);
      border-radius: var(--r-4);
      transition: background 0.15s ease;
    }
    .intercom-btns .qb-ic {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .intercom-btns .qb-ic .icn {
      width: 26px;
      height: 26px;
    }
    .intercom-btns .qb.on {
      background: var(--accent);
      color: var(--ink);
      border-color: transparent;
    }
    .intercom-btns .qb.primary {
      background: var(--ok);
      color: var(--tx);
      border-color: transparent;
    }
    .intercom-btns .qb.primary:active {
      filter: brightness(1.18);
    }
    .card.intercom.ring .cicon {
      background: var(--bad);
      color: var(--ink);
      animation: pulse 1.1s ease-in-out infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.45; }
    }
    .qb {
      display: flex;
      align-items: center;
      justify-content: center;
      flex: 1;
      min-height: var(--tap);
      padding: var(--sp-4) 0;
      border-radius: var(--r-3);
      border: 1px solid var(--brd);
      background: var(--w-2);
      color: var(--tx);
      font: inherit;
      font-size: var(--fs-4);
      font-weight: 600;
      cursor: pointer;
      touch-action: manipulation;
    }
    .qb.gate.on {
      border-color: var(--accent);
      color: var(--tx);
      background: var(--accent-soft);
    }
    .qb:active {
      background: var(--w-5);
    }
    /* ---- Screensaver (idle) ---- */
    .saver {
      position: absolute;
      inset: 0;
      z-index: var(--z-saver);
      background: radial-gradient(150% 120% at 50% 0%, var(--bg-1), var(--bg-0) 60%);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      animation: rp-fade 0.4s both;
    }
    @keyframes rp-fade {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .saver-aurora {
      position: absolute;
      inset: -20%;
      background:
        radial-gradient(40% 40% at 25% 30%, var(--accent-soft), transparent 70%),
        radial-gradient(35% 35% at 78% 65%, var(--cool-soft), transparent 70%),
        radial-gradient(30% 30% at 60% 20%, rgba(185, 140, 255, 0.16), transparent 70%);
      filter: blur(20px);
      /* Бесконечная 16-секундная анимация ровно тогда, когда панель обязана
         утихнуть. На сенсорных устройствах (то есть на настенных панелях) она
         выключена — см. блок @media (pointer: coarse) в detail.ts. На
         настольном браузере она ничего не стоит и остаётся. */
      animation: aurora 16s ease-in-out infinite alternate;
    }
    @keyframes aurora {
      from { transform: translate(-3%, -2%) scale(1); }
      to { transform: translate(4%, 3%) scale(1.12); }
    }
    .saver-in {
      position: relative;
      z-index: var(--z-over);
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    .saver-home {
      font-size: var(--fs-6);
      font-weight: 600;
      color: var(--mut);
      letter-spacing: 0.04em;
    }
    .saver-time {
      font-family: 'Unbounded', 'Onest', sans-serif;
      font-weight: 300;
      font-size: var(--fs-saver);
      line-height: 0.92;
      color: var(--tx-hi);
      letter-spacing: -0.03em;
      font-variant-numeric: tabular-nums;
      margin-top: var(--sp-2);
    }
    .saver-date {
      font-size: var(--fs-6);
      color: var(--mut);
      margin-top: var(--sp-3);
    }
    .saver-info {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: var(--sp-4);
      margin-top: 34px;
    }
    .si {
      display: flex;
      align-items: center;
      gap: var(--sp-3);
      padding: var(--sp-4) var(--sp-5);
      border-radius: var(--r-5);
      background: var(--card);
      border: 1px solid var(--brd);
      color: var(--mut);
    }
    .si .icn {
      width: 22px;
      height: 22px;
    }
    .si.cool .icn {
      color: var(--cool);
    }
    .si.good .icn {
      color: var(--good);
    }
    .sitx {
      text-align: left;
    }
    .siv {
      font-size: var(--fs-6);
      font-weight: 700;
      color: var(--tx-hi);
      line-height: 1;
    }
    .sil {
      font-size: var(--fs-2);
      color: var(--mut);
      margin-top: 3px;
    }
    /* ЕДИНСТВЕННАЯ надпись на заставке — «Коснитесь экрана, чтобы вернуться».
       Висит на экране круглые сутки, а цвет был --fnt (переменная, которой
       нигде нет) с запасным #646a75 — контраст 3,35:1. Теперь --faint (5,6:1)
       и кегль 16px вместо 14: читать её будут с двух-трёх метров. */
    .saver-hint {
      display: flex;
      align-items: center;
      gap: var(--sp-3);
      margin-top: 38px;
      font-size: var(--fs-4);
      color: var(--faint);
    }
    .saver-hint .icn {
      width: 18px;
      height: 18px;
    }
    .pill,
    .pills-tab {
      display: inline-flex;
      align-items: center;
      gap: var(--sp-3);
      min-height: var(--tap);
      padding: 0 var(--sp-5);
      border-radius: var(--r-4);
      background: var(--card);
      border: 1px solid var(--brd);
      color: var(--mut);
      font: inherit;
      font-size: var(--fs-4);
      font-weight: 600;
      cursor: pointer;
      transition: background 0.16s, color 0.16s;
      touch-action: manipulation;
    }
    .pill:active,
    .pills-tab:active {
      background: var(--w-5);
      color: var(--tx);
    }
    .pill.on {
      background: var(--fill-hi);
      color: var(--ink);
      border-color: var(--tx-hi);
    }
    @media (hover: hover) {
      .sdot:hover,
      .closebtn:hover,
      .pills-tab:hover,
      .pill:hover {
        background: var(--card2);
        color: var(--tx);
      }
      .qb:hover {
        background: var(--w-4);
      }
      .intercom-btns .qb.primary:hover {
        filter: brightness(1.12);
      }
    }

`;
