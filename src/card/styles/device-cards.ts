// ---------------------------------------------------------------------------
// Карточки устройств в панели комнаты: свет, переключатели, климат,
// шторы, медиа, замки, ползунки и степперы.
//
// Кусок общей таблицы стилей карточки. ПОРЯДОК кусков в массиве
// `BmsFloorplanCard.styles` = порядок каскада: в файле есть селекторы,
// которые повторяются, и побеждает последний. Переставлять нельзя.
// ---------------------------------------------------------------------------

import { css } from 'lit';

export const deviceCardStyles = css`
    /* ---- Device cards ---- */
    .card {
      background: var(--card);
      border: 1px solid var(--brd);
      border-radius: var(--r-5);
      padding: var(--sp-5);
      animation: rp-rise 0.36s both;
    }
    @keyframes rp-rise {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: none; }
    }
    .card.on {
      border-color: var(--accent-line);
      background: linear-gradient(var(--accent-soft), transparent 60%), var(--card);
    }
    .card.on.cool {
      border-color: var(--cool-line);
      background: linear-gradient(var(--cool-soft), transparent 60%), var(--card);
    }
    .crow {
      display: flex;
      align-items: center;
      gap: var(--sp-4);
    }
    .cicon {
      width: var(--tap);
      height: var(--tap);
      border-radius: var(--r-4);
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--w-2);
      color: var(--mut);
      flex: none;
      border: none;
      cursor: default;
    }
    button.cicon {
      cursor: pointer;
      touch-action: manipulation;
    }
    button.cicon:active {
      background: var(--w-5);
    }
    .cicon .icn {
      width: 24px;
      height: 24px;
    }
    .card.on .cicon.lit {
      background: var(--accent-soft);
      color: var(--accent);
    }
    .card.on.cool .cicon.lit {
      background: var(--cool-soft);
      color: var(--cool);
    }
    /* Per-light tiles: a wrapping grid so each light is controlled on its own,
       with bigger icons and long names clamped to two lines (never overflow). */
    .lgrid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(94px, 1fr));
      gap: var(--sp-3);
      margin-top: var(--sp-4);
    }
    .ltile {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--sp-3);
      min-width: 0;
      min-height: var(--tap);
      padding: var(--sp-4) var(--sp-2) var(--sp-3);
      border-radius: var(--r-4);
      border: 1px solid var(--brd);
      background: var(--w-1);
      color: var(--mut);
      font: inherit;
      cursor: pointer;
      touch-action: manipulation;
    }
    .ltile:active {
      background: var(--w-4);
    }
    .ltile.on {
      background: var(--accent-soft);
      border-color: var(--accent-line);
      color: var(--tx);
    }
    .lti {
      width: 48px;
      height: 48px;
      border-radius: var(--r-4);
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--w-2);
      color: var(--mut);
    }
    .lti.lit {
      background: var(--accent-soft);
      color: var(--accent);
    }
    .lti .icn {
      width: 26px;
      height: 26px;
    }
    .ltn {
      font-size: var(--fs-2);
      font-weight: 600;
      line-height: 1.2;
      text-align: center;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      max-width: 100%;
      word-break: break-word;
    }
    /* Media volume buttons for devices without a volume slider (icon chips). */
    .seg.vol .segb {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--sp-4) 0;
    }
    /* Volume % readout between the − / + chips (replaces the slider). */
    .seg.vol .volind {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--fs-4);
      font-weight: 700;
      font-variant-numeric: tabular-nums;
      /* Было var(--txt) — ОПЕЧАТКА вместо --tx, и БЕЗ запасного значения:
         индикатор громкости наследовал цвет родителя (.segb — приглушённый
         серый), то есть числа выглядели выключенными. */
      color: var(--tx);
    }
    .cgrow {
      flex: 1;
      min-width: 0;
    }
    .clabel {
      font-size: var(--fs-5);
      font-weight: 700;
      color: var(--tx);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .csub {
      font-size: var(--fs-3);
      color: var(--mut);
      margin-top: 3px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .info-val {
      font-size: var(--fs-4);
      font-weight: 700;
      color: var(--tx-hi);
      flex: none;
    }
    /* ---- Главный тумблер --------------------------------------------------
       Ежедневный контакт клиента с системой: этим включают свет. Был 54x31 —
       самая заметная промашка по пальцу во всём продукте. Кнопка стала
       56x44, а видимая дорожка (та же на вид: 56x32) переехала в ::before,
       чтобы вырасти могла ЗОНА НАЖАТИЯ, а не рисунок. */
    .sw {
      width: 56px;
      height: var(--tap);
      border-radius: var(--r-pill);
      background: transparent;
      position: relative;
      cursor: pointer;
      flex: none;
      border: none;
      padding: 0;
      touch-action: manipulation;
    }
    .sw::before {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      top: 6px;
      bottom: 6px;
      border-radius: var(--r-pill);
      background: var(--w-4);
      transition: background 0.2s;
    }
    .sw-k {
      position: absolute;
      top: 9px;
      left: 3px;
      width: 26px;
      height: 26px;
      border-radius: var(--r-circle);
      background: var(--fill-hi);
      transition: left 0.2s, transform 0.12s;
      box-shadow: 0 2px 5px var(--shadow);
    }
    .sw.on::before {
      background: var(--accent);
    }
    .sw.on .sw-k {
      left: 27px;
    }
    .sw:active::before {
      background: var(--w-5);
    }
    .sw.on:active::before {
      background: var(--accent);
      filter: brightness(1.12);
    }
    .sw:active .sw-k {
      transform: scale(0.92);
    }
    /* Slider */
    .slider {
      height: var(--tap);
      border-radius: var(--r-4);
      background: var(--w-3);
      position: relative;
      margin-top: var(--sp-4);
      cursor: pointer;
      overflow: hidden;
      touch-action: none;
      user-select: none;
    }
    .slider-fill {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 0;
      background: var(--accent);
      border-radius: var(--r-4);
    }
    .slider-fill.white {
      background: var(--tx);
    }
    .slider-lab {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 var(--sp-4);
      font-size: var(--fs-3);
      font-weight: 700;
      color: var(--tx-hi);
      pointer-events: none;
      text-shadow: 0 1px 3px var(--shadow);
    }
    /* White (cover) fill: dark labels read better on the light bar. */
    .slider.cover .slider-lab {
      color: var(--ink);
      text-shadow: 0 1px 2px var(--w-5);
    }
    /* Climate stepper */
    .stepper {
      display: flex;
      align-items: center;
      gap: var(--sp-1);
      flex: none;
    }
    .stbtn {
      width: var(--tap);
      height: var(--tap);
      border-radius: var(--r-3);
      background: var(--w-2);
      border: 1px solid var(--brd);
      color: var(--tx);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      flex: none;
      touch-action: manipulation;
    }
    .stbtn:active {
      background: var(--w-5);
    }
    .tval {
      font-size: var(--fs-7);
      font-weight: 700;
      min-width: 46px;
      text-align: center;
      color: var(--tx-hi);
      font-variant-numeric: tabular-nums;
    }
    /* Media */
    .mp {
      display: flex;
      align-items: center;
      gap: var(--sp-4);
      margin-top: var(--sp-4);
    }
    .mpart {
      width: 48px;
      height: 48px;
      border-radius: var(--r-3);
      background: linear-gradient(135deg, var(--bg-3), var(--bg-2));
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--mut);
      flex: none;
    }
    .mptxt {
      flex: 1;
      min-width: 0;
    }
    .mptrack {
      font-size: var(--fs-4);
      font-weight: 700;
      color: var(--tx-hi);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .mpartist {
      font-size: var(--fs-3);
      color: var(--mut);
      margin-top: 1px;
    }
    .mpctl {
      display: flex;
      align-items: center;
      gap: var(--sp-1);
      flex: none;
    }
    .mpb {
      width: var(--tap);
      height: var(--tap);
      border-radius: var(--r-circle);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--tx);
      cursor: pointer;
      background: var(--w-2);
      border: none;
      flex: none;
      touch-action: manipulation;
    }
    .mpb:active {
      background: var(--w-5);
      transform: scale(0.92);
    }
    .mpb.play {
      background: var(--fill-hi);
      color: var(--ink);
    }
    /* Speakers currently synced together: the link button lights accent. */
    .mpb.on {
      background: var(--accent);
      color: var(--ink);
    }
    .mpb .icn {
      width: 22px;
      height: 22px;
    }
    /* Lock */
    .lockbtn {
      display: flex;
      align-items: center;
      gap: var(--sp-4);
      width: 100%;
      min-height: var(--tap);
      padding: var(--sp-5);
      border-radius: var(--r-5);
      cursor: pointer;
      font: inherit;
      border: 1px solid var(--brd);
      background: var(--card);
      animation: rp-rise 0.36s both;
      touch-action: manipulation;
    }
    /* Заливку трогать нельзя: у .locked / .unlocked она смысловая (зелёный
       «заперто» / красный «отперто»), и правило-состояние стоит НИЖЕ. */
    .lockbtn:active {
      filter: brightness(1.3);
    }
    .lockbtn.locked {
      background: var(--good-soft);
      border-color: var(--good-line);
      color: var(--good);
    }
    .lockbtn.unlocked {
      background: var(--bad-soft);
      border-color: var(--bad-line);
      color: var(--bad);
    }
    .lktxt {
      font-size: var(--fs-5);
      font-weight: 700;
    }
    .lksub {
      font-size: var(--fs-3);
      opacity: 0.75;
      font-weight: 500;
      margin-top: 1px;
    }
    @media (hover: hover) {
      button.cicon:hover,
      .ltile:hover,
      .stbtn:hover,
      .mpb:hover {
        background: var(--w-4);
      }
      .lockbtn:hover {
        filter: brightness(1.15);
      }
    }

`;
