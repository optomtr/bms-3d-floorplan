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
      border-radius: 18px;
      padding: 16px;
      animation: rp-rise 0.36s both;
    }
    @keyframes rp-rise {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: none; }
    }
    .card.on {
      border-color: rgba(243, 168, 60, 0.5);
      background: linear-gradient(rgba(243, 168, 60, 0.16), transparent 60%), var(--card);
    }
    .card.on.cool {
      border-color: rgba(91, 184, 232, 0.5);
      background: linear-gradient(rgba(91, 184, 232, 0.15), transparent 60%), var(--card);
    }
    .crow {
      display: flex;
      align-items: center;
      gap: 13px;
    }
    .cicon {
      width: 44px;
      height: 44px;
      border-radius: 13px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.06);
      color: var(--mut);
      flex: none;
      border: none;
      cursor: default;
    }
    button.cicon {
      cursor: pointer;
    }
    .cicon .icn {
      width: 23px;
      height: 23px;
    }
    .card.on .cicon.lit {
      background: rgba(243, 168, 60, 0.16);
      color: var(--accent);
    }
    .card.on.cool .cicon.lit {
      background: rgba(91, 184, 232, 0.16);
      color: var(--cool);
    }
    /* Per-light tiles: a wrapping grid so each light is controlled on its own,
       with bigger icons and long names clamped to two lines (never overflow). */
    .lgrid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(94px, 1fr));
      gap: 8px;
      margin-top: 12px;
    }
    .ltile {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      min-width: 0;
      padding: 12px 6px 10px;
      border-radius: 14px;
      border: 1px solid var(--brd);
      background: rgba(255, 255, 255, 0.04);
      color: var(--mut);
      font: inherit;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }
    .ltile.on {
      background: rgba(243, 168, 60, 0.14);
      border-color: rgba(243, 168, 60, 0.4);
      color: var(--tx);
    }
    .lti {
      width: 48px;
      height: 48px;
      border-radius: 13px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.06);
      color: var(--mut);
    }
    .lti.lit {
      background: rgba(243, 168, 60, 0.18);
      color: var(--accent);
    }
    .lti .icn {
      width: 26px;
      height: 26px;
    }
    .ltn {
      font-size: 12px;
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
      padding: 11px 0;
    }
    .seg.vol .segb .icn {
      width: 20px;
      height: 20px;
    }
    /* Volume % readout between the − / + chips (replaces the slider). */
    .seg.vol .volind {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 15px;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
      color: var(--txt);
    }
    .cgrow {
      flex: 1;
      min-width: 0;
    }
    .clabel {
      font-size: 16px;
      font-weight: 700;
      color: var(--tx);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .csub {
      font-size: 13px;
      color: var(--mut);
      margin-top: 3px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .info-val {
      font-size: 15px;
      font-weight: 700;
      color: #fff;
      flex: none;
    }
    /* Toggle switch */
    .sw {
      width: 54px;
      height: 31px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.14);
      position: relative;
      cursor: pointer;
      flex: none;
      border: none;
      padding: 0;
      transition: background 0.2s;
    }
    .sw-k {
      position: absolute;
      top: 3px;
      left: 3px;
      width: 25px;
      height: 25px;
      border-radius: 50%;
      background: #fff;
      transition: left 0.2s;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.35);
    }
    .sw.on {
      background: var(--accent);
    }
    .sw.on .sw-k {
      left: 26px;
    }
    /* Slider */
    .slider {
      height: 44px;
      border-radius: 13px;
      background: rgba(255, 255, 255, 0.08);
      position: relative;
      margin-top: 14px;
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
      border-radius: 13px;
    }
    .slider-fill.white {
      background: rgba(255, 255, 255, 0.88);
    }
    .slider-lab {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 14px;
      font-size: 13px;
      font-weight: 700;
      color: #fff;
      pointer-events: none;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
    }
    /* White (cover) fill: dark labels read better on the light bar. */
    .slider.cover .slider-lab {
      color: #2b2e35;
      text-shadow: 0 1px 2px rgba(255, 255, 255, 0.3);
    }
    /* Climate stepper */
    .stepper {
      display: flex;
      align-items: center;
      gap: 4px;
      flex: none;
    }
    .stbtn {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.07);
      border: 1px solid var(--brd);
      color: var(--tx);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      flex: none;
    }
    .stbtn:hover {
      background: rgba(255, 255, 255, 0.13);
    }
    .tval {
      font-size: 24px;
      font-weight: 700;
      min-width: 46px;
      text-align: center;
      color: #fff;
      font-variant-numeric: tabular-nums;
    }
    /* Media */
    .mp {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 14px;
    }
    .mpart {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: linear-gradient(135deg, #3a3d47, #22242a);
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
      font-size: 15px;
      font-weight: 700;
      color: #fff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .mpartist {
      font-size: 13px;
      color: var(--mut);
      margin-top: 1px;
    }
    .mpctl {
      display: flex;
      align-items: center;
      gap: 5px;
      flex: none;
    }
    .mpb {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--tx);
      cursor: pointer;
      background: rgba(255, 255, 255, 0.06);
      border: none;
      flex: none;
    }
    .mpb:hover {
      background: rgba(255, 255, 255, 0.12);
    }
    .mpb.play {
      background: #fff;
      color: #17181c;
    }
    /* Speakers currently synced together: the link button lights accent. */
    .mpb.on {
      background: var(--accent, #f3a83c);
      color: #17181c;
    }
    .mpb .icn {
      width: 22px;
      height: 22px;
    }
    /* Lock */
    .lockbtn {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      padding: 15px;
      border-radius: 16px;
      cursor: pointer;
      font: inherit;
      border: 1px solid var(--brd);
      background: var(--card);
      animation: rp-rise 0.36s both;
    }
    .lockbtn.locked {
      background: rgba(55, 197, 142, 0.13);
      border-color: rgba(55, 197, 142, 0.42);
      color: #37c58e;
    }
    .lockbtn.unlocked {
      background: rgba(242, 106, 75, 0.13);
      border-color: rgba(242, 106, 75, 0.42);
      color: #f26a4b;
    }
    .lktxt {
      font-size: 16px;
      font-weight: 700;
    }
    .lksub {
      font-size: 13px;
      opacity: 0.75;
      font-weight: 500;
      margin-top: 1px;
    }

`;
