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
       =================================================================== */
    ha-card.view {
      --accent: #f3a83c;
      --cool: #5bb8e8;
      --tx: #f2f3f6;
      --mut: #99a0ac;
      --brd: rgba(255, 255, 255, 0.09);
      --card: rgba(255, 255, 255, 0.045);
      --card2: rgba(255, 255, 255, 0.08);
      --panel-w: clamp(300px, 36%, 470px);
      color: var(--tx);
      font-family: 'Onest', system-ui, -apple-system, 'Segoe UI', sans-serif;
      background: radial-gradient(150% 120% at 80% 4%, #20222a, #141519 52%, #0f1013);
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
    .icn {
      width: 20px;
      height: 20px;
      flex: none;
    }

    /* ---- Clock + status dots + room pills (over the 3D) ---- */
    .clock {
      position: absolute;
      top: 26px;
      left: 30px;
      z-index: 3;
      pointer-events: none;
    }
    .ctime {
      font-family: 'Unbounded', 'Onest', sans-serif;
      font-size: 64px;
      line-height: 0.9;
      font-weight: 300;
      letter-spacing: -0.02em;
      color: #fff;
      font-variant-numeric: tabular-nums;
    }
    .cdate {
      margin-top: 10px;
      font-size: 15px;
      color: var(--mut);
    }
    .topstat {
      position: absolute;
      top: 30px;
      right: 30px;
      z-index: 4;
      display: flex;
      align-items: center;
      gap: 10px;
      /* Not animated. Easing the right edge relayouts this row on every frame of
         the panel animation. A transform would be compositor-only, but --panel-w
         is a clamp() holding a percentage, and inside transform a percentage
         resolves against this element's own width rather than the card's — so it
         lands in the wrong place. Snapping matches .stage-bottom below. */
    }
    ha-card.view.room.has-room .topstat {
      right: calc(var(--panel-w) + 24px);
    }
    .sdot {
      position: relative;
      width: 42px;
      height: 42px;
      border-radius: 13px;
      background: var(--card);
      border: 1px solid var(--brd);
      color: var(--mut);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font: inherit;
    }
    .sdot .on-dot {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--accent);
    }
    /* Bottom stack over the 3D: floor tabs, room pills, and the "pick a room"
       hint. Shifts left of the panel when a room is in focus. */
    .stage-bottom {
      position: absolute;
      left: 26px;
      right: 26px;
      bottom: 22px;
      z-index: 3;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 11px;
      /* Not animated: this box is pinned on BOTH edges, so easing the right one
         animates its WIDTH — a relayout of the floor tabs and room pills every
         frame. Its content is left-aligned, so snapping the edge is invisible
         unless the pills happen to wrap. */
    }
    ha-card.view.room.has-room .stage-bottom {
      right: calc(var(--panel-w) + 24px);
    }
    .pills {
      display: flex;
      flex-wrap: wrap;
      gap: 9px;
    }
    .ftabs {
      display: inline-flex;
      padding: 4px;
      gap: 3px;
      border-radius: 13px;
      background: var(--card);
      border: 1px solid var(--brd);
    }
    .ftab {
      padding: 8px 15px;
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
    .ftab.on {
      background: #fff;
      color: #17181c;
    }
    .ahint {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 15px;
      border-radius: 13px;
      background: rgba(243, 168, 60, 0.14);
      border: 1px solid rgba(243, 168, 60, 0.4);
      color: var(--accent);
      font-size: 13.5px;
      font-weight: 600;
      max-width: 100%;
    }
    .ahint .icn {
      width: 16px;
      height: 16px;
    }
    /* Room panel header top row (name + close). */
    .rp-top {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .rp-top .rp-name {
      flex: 1;
      min-width: 0;
    }
    .closebtn {
      width: 38px;
      height: 38px;
      flex: none;
      border-radius: 12px;
      border: 1px solid var(--brd);
      background: var(--card);
      color: var(--mut);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
    .closebtn:hover {
      background: var(--card2);
      color: var(--tx);
    }
    /* Climate mode chips — wrap onto more rows so a unit with many modes
       (auto/fan/dry/cool/heat/off) is never squashed or clipped. */
    .seg {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 14px;
    }
    .segb {
      flex: 1 1 auto;
      min-width: 72px;
      padding: 10px 8px;
      border-radius: 11px;
      border: 1px solid var(--brd);
      background: rgba(255, 255, 255, 0.05);
      color: var(--mut);
      font: inherit;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      -webkit-tap-highlight-color: transparent;
    }
    .segb.on {
      background: rgba(91, 184, 232, 0.18);
      border-color: rgba(91, 184, 232, 0.5);
      color: var(--cool);
    }
    /* Blinds quick buttons. */
    .qbtns {
      display: flex;
      gap: 8px;
      margin-top: 12px;
    }
    /* Intercom: two big pill buttons, icon over label. */
    .intercom-btns {
      gap: 10px;
    }
    .intercom-btns .qb {
      flex-direction: column;
      gap: 8px;
      padding: 16px 0;
      font-size: 14px;
      border-radius: 14px;
      transition: background 0.15s ease;
    }
    .intercom-btns .qb-ic {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .intercom-btns .qb-ic .icn {
      width: 25px;
      height: 25px;
    }
    .intercom-btns .qb.on {
      background: var(--accent, #f3a83c);
      color: #17181c;
      border-color: transparent;
    }
    .intercom-btns .qb.primary {
      background: #2e7d5b;
      color: #fff;
      border-color: transparent;
    }
    .intercom-btns .qb.primary:hover {
      background: #34926a;
    }
    .card.intercom.ring .cicon {
      background: #d64545;
      color: #fff;
      animation: pulse 1.1s ease-in-out infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.45; }
    }
    .qb {
      flex: 1;
      padding: 11px 0;
      border-radius: 12px;
      border: 1px solid var(--brd);
      background: rgba(255, 255, 255, 0.05);
      color: var(--tx);
      font: inherit;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }
    .qb.gate.on {
      border-color: var(--accent, #f3a83c);
      color: #fff;
      background: rgba(243, 168, 60, 0.14);
    }
    .qb.icon-only {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .qb.icon-only .icn {
      width: 20px;
      height: 20px;
    }
    .qb:hover {
      background: rgba(255, 255, 255, 0.12);
    }
    /* ---- Screensaver (idle) ---- */
    .saver {
      position: absolute;
      inset: 0;
      z-index: 40;
      background: radial-gradient(150% 120% at 50% 0%, #14161d, #0a0b0e 60%);
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
        radial-gradient(40% 40% at 25% 30%, rgba(243, 168, 60, 0.22), transparent 70%),
        radial-gradient(35% 35% at 78% 65%, rgba(91, 184, 232, 0.2), transparent 70%),
        radial-gradient(30% 30% at 60% 20%, rgba(185, 140, 255, 0.16), transparent 70%);
      filter: blur(20px);
      animation: aurora 16s ease-in-out infinite alternate;
    }
    @keyframes aurora {
      from { transform: translate(-3%, -2%) scale(1); }
      to { transform: translate(4%, 3%) scale(1.12); }
    }
    .saver-in {
      position: relative;
      z-index: 2;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    .saver-home {
      font-size: 20px;
      font-weight: 600;
      color: var(--mut);
      letter-spacing: 0.04em;
    }
    .saver-time {
      font-family: 'Unbounded', 'Onest', sans-serif;
      font-weight: 300;
      font-size: 132px;
      line-height: 0.92;
      color: #fff;
      letter-spacing: -0.03em;
      font-variant-numeric: tabular-nums;
      margin-top: 6px;
    }
    .saver-date {
      font-size: 18px;
      color: var(--mut);
      margin-top: 10px;
    }
    .saver-info {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 14px;
      margin-top: 34px;
    }
    .si {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 13px 18px;
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.045);
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
      color: #37c58e;
    }
    .sitx {
      text-align: left;
    }
    .siv {
      font-size: 19px;
      font-weight: 700;
      color: #fff;
      line-height: 1;
    }
    .sil {
      font-size: 12px;
      color: var(--mut);
      margin-top: 3px;
    }
    .saver-hint {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 38px;
      font-size: 14px;
      color: var(--fnt, #646a75);
    }
    .saver-hint .icn {
      width: 17px;
      height: 17px;
    }
    .pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 14px;
      border-radius: 14px;
      background: var(--card);
      border: 1px solid var(--brd);
      color: var(--mut);
      font: inherit;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.16s, color 0.16s;
      -webkit-tap-highlight-color: transparent;
    }
    .pill .icn {
      width: 18px;
      height: 18px;
    }
    .pill:hover {
      background: var(--card2);
      color: var(--tx);
    }
    .pill.on {
      background: #fff;
      color: #17181c;
      border-color: #fff;
    }

`;
