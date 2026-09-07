// ---------------------------------------------------------------------------
// Что показывает карточка, пока плана ещё нет, когда он не загрузился и когда
// вместо настоящего плана открыт встроенный пример.
//
// Три состояния, каждое из которых раньше молчало:
//   • загрузка   — был пустой тёмный прямоугольник (бандл больше мегабайта);
//   • сбой       — была сырая английская строка «Failed to fetch …: 404»
//                  и НИ ОДНОЙ кнопки, даже «Повторить»;
//   • демо-план  — карточка молча показывала чужую квартиру.
// ---------------------------------------------------------------------------

import { html, nothing } from 'lit';
import type { BmsFloorplanCard } from '../../ha-3d-floorplan-card';
import { loadActiveProject } from '../projects';
import { enterEdit } from '../session';

/** Человеческий текст поверх технической строки ошибки. Разбираем ровно те
 *  случаи, которые монтажник действительно встречает; для остального —
 *  честное «не удалось», а не пересказ исключения. */
export function loadErrorText(host: BmsFloorplanCard, detail: string): { title: string; what: string } {
  const d = (detail || '').toLowerCase();
  if (d.includes('404') || d.includes('not found')) {
    return {
      title: host.tx('Файл плана не найден', 'The plan file was not found'),
      what: host.tx(
        'По указанному адресу файла нет. Проверьте путь в настройках карточки и то, что файл лежит в папке «www» Home Assistant (адрес /local/…).',
        'There is no file at that address. Check the path in the card settings and that the file is in the Home Assistant "www" folder (/local/… address).',
      ),
    };
  }
  if (d.includes('failed to fetch') || d.includes('networkerror') || d.includes('load failed')) {
    return {
      title: host.tx('Нет связи с Home Assistant', 'No connection to Home Assistant'),
      what: host.tx(
        'Планшет не достучался до сервера. Проверьте сеть и питание сервера, затем нажмите «Повторить».',
        'The tablet could not reach the server. Check the network and the server, then press "Try again".',
      ),
    };
  }
  if (d.includes('json') || d.includes('unexpected token') || d.includes('floors')) {
    return {
      title: host.tx('Файл плана повреждён', 'The plan file is damaged'),
      what: host.tx(
        'Файл прочитан, но это не планировка. Откройте редактор и загрузите план заново (раздел «Проект» → «Импорт»).',
        'The file was read but it is not a floor plan. Open the editor and import the plan again (section "Project" → "Import").',
      ),
    };
  }
  if (d.includes('permission') || d.includes('403') || d.includes('401') || d.includes('unauthorized')) {
    return {
      title: host.tx('Нет доступа к плану', 'No access to the plan'),
      what: host.tx(
        'Сервер отказал в доступе. Войдите в Home Assistant заново или попросите администратора открыть доступ.',
        'The server refused access. Sign in to Home Assistant again, or ask an administrator to grant access.',
      ),
    };
  }
  return {
    title: host.tx('Планировка не загрузилась', 'The floor plan did not load'),
    what: host.tx(
      'Попробуйте ещё раз. Если не поможет — покажите монтажнику строку ниже.',
      'Try again. If it keeps failing, show the line below to your installer.',
    ),
  };
}

/** Экран загрузки. Тёмный прямоугольник без единого слова человек читает как
 *  «сломалось», а не как «идёт загрузка». */
export function renderPlanLoading(host: BmsFloorplanCard) {
  // `toast` здесь — ВРЕМЕННЫЙ носитель оформления: он уже спозиционирован и
  // читаем. Своё оформление .plan-loading пишет агент по стилям (см. отчёт),
  // после чего носитель убирается.
  return html`<div class="plan-loading toast" role="status" aria-live="polite">
    <span class="plan-loading-ic">${host.ic('loading')}</span>
    <span class="plan-loading-t">${host.tx('Загружаем планировку…', 'Loading the floor plan…')}</span>
  </div>`;
}

/** Сбой загрузки: что случилось, что делать и кнопка «Повторить». */
export function renderPlanError(host: BmsFloorplanCard) {
  const detail = host.loadErrorDetail ?? host.loadError ?? '';
  const { title, what } = loadErrorText(host, detail);
  return html`<div class="error" role="alert">
    <div class="error-head">${host.ic('warn')}<span class="error-title">${title}</span></div>
    <div class="error-what">${what}</div>
    ${detail ? html`<div class="error-detail"><code>${detail}</code></div>` : nothing}
    <div class="error-acts">
      <button type="button" class="btn primary ic-btn" data-act="retry"
        aria-label=${host.tx('Повторить загрузку планировки', 'Try loading the floor plan again')}
        @click=${() => void loadActiveProject(host)}
      >${host.ic('refresh')}<span class="ic-btn-lab">${host.tx('Повторить', 'Try again')}</span></button>
    </div>
  </div>`;
}

/** Встроенный пример вместо настоящего плана. Клиент видит чужую квартиру и
 *  не понимает почему — значит, надо сказать прямо и показать выход. */
export function renderDemoBanner(host: BmsFloorplanCard) {
  // `plan-warning` — тоже временный носитель оформления (та же полоса внизу
  // экрана). Без него плашка ложится под часы и не читается вовсе.
  return html`<div class="demo-banner plan-warning" role="note">
    <span class="demo-ic">${host.ic('warn')}</span>
    <span class="demo-text">
      <b>${host.tx('Это пример, а не ваш дом.', 'This is a sample home, not yours.')}</b>
      ${host.tx(
        'Своя планировка ещё не создана — карточке нечего показать, и она открыла встроенный образец.',
        'No floor plan of your own has been created yet, so the card opened its built-in sample.',
      )}
    </span>
    <button type="button" class="btn ic-btn demo-make" data-act="make-plan"
      aria-label=${host.tx('Создать свой план в редакторе', 'Create your own plan in the editor')}
      @click=${() => enterEdit(host)}
    >${host.ic('pencil')}<span class="ic-btn-lab">${host.tx('Создать свой план', 'Create your own plan')}</span></button>
    <button type="button" class="btn demo-hide" data-act="hide-demo"
      title=${host.tx('Скрыть', 'Hide')}
      aria-label=${host.tx('Скрыть подпись примера', 'Hide the sample notice')}
      @click=${() => { host.demoNoticeHidden = true; }}
    >${host.ic('close')}</button>
  </div>`;
}

/** Часть плана не построилась: план виден, но не весь. */
export function renderPlanWarning(host: BmsFloorplanCard) {
  return html`<div class="plan-warning" role="alert">
    <span class="pw-ic">${host.ic('warn')}</span>
    <span>${host.planWarning}</span>
    <button class="pw-close" title=${host.tx('Скрыть', 'Hide')}
      aria-label=${host.tx('Скрыть предупреждение', 'Hide the warning')}
      @click=${() => (host.planWarning = undefined)}>${host.ic('close')}</button>
  </div>`;
}

/** Всё состояние плана одним куском: загрузка / сбой / «это пример» /
 *  «часть плана не построилась». */
export function renderPlanState(host: BmsFloorplanCard) {
  if (host.loadError) return renderPlanError(host);
  if (host.planLoading) return renderPlanLoading(host);
  return html`
    ${host.planWarning ? renderPlanWarning(host) : nothing}
    ${host.isDemoPlan && !host.demoNoticeHidden && !host.editing ? renderDemoBanner(host) : nothing}
  `;
}
