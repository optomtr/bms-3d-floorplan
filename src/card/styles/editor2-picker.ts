// ---------------------------------------------------------------------------
// Оформление СПИСКА УСТРОЙСТВ (см. views/editor2/entity-picker.ts).
//
// Подключается ПОСЛЕ editor2-controls: уточняет .e2-entity (там строка была
// однострочной кнопкой), поэтому обязано идти следом, а не раньше.
//
// Своя цель под палец --e2-pick: 48 px и на мыши тоже. Общая --e2-tap на
// настольном экране 44, а по этому списку тычут пальцем, стоя у стены с
// планшетом, — здесь занижать нельзя.
// ---------------------------------------------------------------------------

import { css } from 'lit';

export const editor2PickerStyles = css`
    .e2-pick {
      --e2-pick: 48px;
    }
    /* Список прокручивается сам и не растягивает инспектор до бесконечности. */
    .e2-groups {
      display: flex;
      flex-direction: column;
      gap: var(--sp-1);
      max-height: 340px;
      overflow-y: auto;
      overscroll-behavior: contain;
      scrollbar-width: thin;
      -webkit-overflow-scrolling: touch;
    }
    .e2-grp {
      display: flex;
      flex-direction: column;
      gap: var(--sp-1);
    }
    /* Разворот — ПО ВСЕЙ строке заголовка, а не по маленькой стрелке. */
    .e2-grp-head {
      display: flex;
      align-items: center;
      gap: var(--sp-2);
      width: 100%;
      min-height: var(--e2-pick);
      padding: var(--sp-2) var(--sp-3);
      font: inherit;
      font-size: var(--fs-3);
      font-weight: 700;
      text-align: left;
      color: var(--tx);
      background: var(--w-2);
      border: 1px solid var(--w-3);
      border-radius: var(--r-2);
      cursor: pointer;
      touch-action: manipulation;
      /* Заголовок комнаты виден и когда её список прокручен. */
      position: sticky;
      top: 0;
      z-index: 1;
    }
    .e2-grp[data-open] .e2-grp-head {
      background: var(--w-3);
    }
    .e2-grp-head .icn {
      width: 20px;
      height: 20px;
      flex: 0 0 auto;
    }
    .e2-grp-name {
      flex: 1 1 auto;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    /* Сколько внутри подходящих устройств — чтобы не разворачивать все подряд. */
    .e2-grp-count {
      flex: 0 0 auto;
      min-width: 24px;
      padding: 2px var(--sp-2);
      text-align: center;
      font-size: var(--fs-2);
      font-weight: 600;
      color: var(--mut);
      background: var(--w-1);
      border-radius: var(--r-pill);
    }
    .e2-grp-body {
      display: flex;
      flex-direction: column;
      gap: var(--sp-1);
      padding: 0 0 var(--sp-2) var(--sp-3);
    }
    /* Строка устройства: крупно — что это, мелко — идентификатор и «занято». */
    .e2-grp-body .e2-entity {
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 2px;
      min-height: var(--e2-pick);
      padding: var(--sp-2) var(--sp-3);
      white-space: normal;
      overflow: visible;
    }
    .e2-ent-title {
      font-size: var(--fs-3);
      line-height: 1.25;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .e2-ent-meta {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: var(--sp-1) var(--sp-2);
      min-width: 0;
    }
    .e2-ent-sub {
      flex: 0 1 auto;
      font-size: var(--fs-1);
      color: var(--mut);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    /* Занятое НЕ прячем — помечаем: иначе одна лампа тихо повиснет дважды. */
    .e2-ent-taken {
      flex: 0 0 auto;
      font-size: var(--fs-1);
      color: var(--accent);
      padding: 1px var(--sp-2);
      background: var(--accent-soft);
      border: 1px solid var(--accent-line);
      border-radius: var(--r-pill);
    }
    .e2-entity.taken {
      border-style: dashed;
    }
    /* Привязанное показываем той же строкой, что и в списке: крупно —
       устройство и канал, мелко — комната и идентификатор. */
    .e2-bound .e2-bound-txt {
      display: flex;
      flex-direction: column;
      gap: 1px;
      min-width: 0;
    }
    .e2-hit {
      color: var(--tx-hi);
      background: var(--pri);
      border-radius: 3px;
      padding: 0 1px;
    }
    .e2-scope {
      justify-content: flex-start;
      min-height: var(--e2-pick);
      text-align: left;
    }
`;
