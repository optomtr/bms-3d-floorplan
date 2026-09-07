// ---------------------------------------------------------------------------
// Оформление состояний, у которых до этого пакета не было ни своего вида, ни
// своих правил: загрузка плана, человеческий разбор сбоя, подпись встроенного
// примера, «нет связи» у устройства, пустой «Обзор», строка поиска и кнопки
// со значком + подписью.
//
// Классы завёл пакет «состояния и тексты», а пакет «оформление» шёл параллельно
// и о них не знал — этот файл и есть их стык. Всё на общих токенах: ни одного
// нового литерала цвета.
//
// Место в массиве стилей: ПЕРЕД detailStyles, потому что три @media живут в
// конце detailStyles и обязаны оставаться последними правилами таблицы.
// ---------------------------------------------------------------------------

import { css } from 'lit';

export const stateStyles = css`
  /* ---- Кнопка «значок + подпись» ---------------------------------------- */
  .ic-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--sp-2);
  }
  .ic-btn-lab {
    white-space: nowrap;
  }

  /* ---- Загрузка плана ---------------------------------------------------- */
  .plan-loading {
    /* Своё положение, а не одолженное у всплывающего сообщения: карточка может
       показывать загрузку и тост одновременно, и они не должны спорить. */
    position: absolute;
    z-index: var(--z-menu);
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    background: var(--glass);
    border: 1px solid var(--w-5);
    border-radius: var(--r-3);
    padding: var(--sp-3) var(--sp-4);
    display: flex;
    align-items: center;
    gap: var(--sp-3);
    font-size: var(--fs-3);
    color: var(--tx);
  }
  .plan-loading-ic {
    display: inline-flex;
    color: var(--mut);
    animation: bms-spin 1.1s linear infinite;
  }
  @keyframes bms-spin {
    to {
      transform: rotate(360deg);
    }
  }

  /* ---- Сбой загрузки ----------------------------------------------------- */
  .error-head {
    display: flex;
    align-items: center;
    gap: var(--sp-3);
    margin-bottom: var(--sp-3);
  }
  .error-title {
    font-size: var(--fs-4);
    font-weight: 600;
    color: var(--tx-hi);
  }
  .error-what {
    font-size: var(--fs-3);
    line-height: 1.45;
    color: var(--tx);
    margin-bottom: var(--sp-4);
  }
  /* Техническая строка адресована монтажнику, а не хозяину: тише текстом,
     но выделяема и переносится, чтобы длинный адрес не рвал плашку. */
  .error-detail {
    font-size: var(--fs-1);
    color: var(--mut);
    background: var(--w-1);
    border: 1px solid var(--w-3);
    border-radius: var(--r-2);
    padding: var(--sp-2) var(--sp-3);
    margin-bottom: var(--sp-4);
    max-height: 96px;
    overflow: auto;
    overflow-wrap: anywhere;
    user-select: text;
  }
  .error-acts {
    display: flex;
    gap: var(--sp-3);
    justify-content: flex-end;
  }

  /* ---- «Это пример, а не ваш дом» ---------------------------------------- */
  .demo-banner {
    position: absolute;
    z-index: var(--z-chrome);
    left: var(--sp-4);
    right: var(--sp-4);
    bottom: var(--sp-4);
    display: flex;
    align-items: center;
    gap: var(--sp-4);
    color: var(--accent);
    background: var(--warn-bg);
    border: 1px solid var(--accent-line);
    padding: var(--sp-3) var(--sp-4);
    border-radius: var(--r-3);
    font-size: var(--fs-3);
    line-height: 1.35;
  }
  /* Если обе плашки видны разом, предупреждение о плане поднимается выше. */
  .demo-banner ~ .plan-warning,
  .plan-warning ~ .demo-banner {
    bottom: calc(var(--sp-4) * 2 + 52px);
  }
  .demo-ic,
  .pw-ic {
    display: inline-flex;
    flex: none;
    color: var(--accent);
  }
  .demo-text {
    flex: 1 1 auto;
    min-width: 0;
  }
  .demo-text b {
    display: block;
  }
  .demo-make,
  .demo-hide {
    flex: none;
  }

  /* ---- Устройства нет — и это видно -------------------------------------- */
  /* Приглушаем целиком, чтобы «нет связи» читалось раньше названия, но не
     прячем: исчезнувшее устройство человек принимает за исправное. */
  .card.unavailable,
  .control-row.unavailable {
    border-color: var(--w-3);
    background: var(--w-1);
    color: var(--mut);
  }
  .card.unavailable .cname,
  .control-row.unavailable .ctl-name {
    color: var(--mut);
  }
  .na-note,
  .ctl-state.na {
    display: inline-flex;
    align-items: center;
    gap: var(--sp-2);
    font-size: var(--fs-1);
    color: var(--bad);
  }
  .na-note {
    margin-top: var(--sp-2);
  }
  .lightseg.na {
    background: var(--w-1);
    border-color: var(--bad-line);
    color: var(--mut);
  }
  .lightseg-na {
    display: inline-flex;
    margin-left: var(--sp-2);
    color: var(--bad);
  }

  /* ---- Пустой «Обзор» ---------------------------------------------------- */
  .ov-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--sp-2);
    text-align: center;
    padding: var(--sp-6) var(--sp-5);
  }
  .ov-empty-title {
    font-size: var(--fs-4);
    color: var(--tx);
  }
  .ov-empty-note {
    font-size: var(--fs-2);
    color: var(--mut);
    max-width: 46ch;
    line-height: 1.45;
  }

  /* ---- Пустой график объясняет себя -------------------------------------- */
  .rp-spark-note {
    font-size: var(--fs-1);
    color: var(--mut);
  }
  .rp-spark-note.bad {
    color: var(--bad);
  }

  /* ---- Строка поиска ------------------------------------------------------ */
  /* Значок был эмодзи внутри placeholder — на разных планшетах он рисовался
     по-разному и уезжал вместе с текстом. Теперь это отдельный элемент. */
  .search-row {
    position: relative;
  }
  .search-ic {
    position: absolute;
    left: var(--sp-3);
    top: 50%;
    transform: translateY(-50%);
    display: inline-flex;
    color: var(--mut);
    pointer-events: none;
  }
  .search-row input {
    padding-left: calc(var(--sp-3) * 2 + 16px);
  }
`;
