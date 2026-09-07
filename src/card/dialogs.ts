// ---------------------------------------------------------------------------
// Свой слой диалогов и всплывающих сообщений (системные alert/confirm/prompt запрещены).
// ---------------------------------------------------------------------------

import type { BmsFloorplanCard } from '../ha-3d-floorplan-card';
import { ruPlural } from './i18n';
import { legacySourceLabel, onImportLegacy } from './projects';
import type { AskOptions } from './types';
import { html, nothing } from 'lit';

export function pushToast(host: BmsFloorplanCard, msg: string): void {
  host.toast = msg;
  if (host.toastTimer) clearTimeout(host.toastTimer);
  host.toastTimer = window.setTimeout(() => {
    host.toast = undefined;
    host.requestUpdate();
  }, 3200);
}

// -- Own modal layer (window.alert/confirm/prompt are forbidden) -----------

/** Open the card's own dialog. Resolves with the entered text (or `'ok'` for a
 *  plain confirm), or `null` when the user cancels. */
export function ask(host: BmsFloorplanCard, opts: AskOptions): Promise<string | null> {
  host.askResolve?.(null); // a newer question supersedes an open one
  host.askData = opts;
  host.askOpen = true;
  return new Promise<string | null>((resolve) => {
    host.askResolve = resolve;
  });
}

/** Yes/no. Replaces window.confirm — same call shape, own styling, and it
 *  works inside a kiosk browser that suppresses system dialogs. */
export async function askConfirm(host: BmsFloorplanCard, title: string, message?: string, okLabel?: string, danger = true): Promise<boolean> {
  return (await ask(host, { title, message, okLabel, danger })) !== null;
}

export function closeAsk(host: BmsFloorplanCard, value: string | null): void {
  host.askOpen = false;
  const resolve = host.askResolve;
  host.askResolve = undefined;
  resolve?.(value);
}

export function cancelAsk(host: BmsFloorplanCard): void {
  return closeAsk(host, null);
}

export function submitAsk(host: BmsFloorplanCard, e?: Event): void {
  e?.preventDefault();
  if (!host.askData.input) {
    closeAsk(host, 'ok');
    return;
  }
  const input = host.renderRoot?.querySelector('.ask-input') as HTMLInputElement | null;
  closeAsk(host, input?.value ?? '');
}

/** The card's own confirm/prompt box. Same modal layer as Import and the PIN
 *  gate — the company forbids window.alert/confirm/prompt. */
export function renderAsk(host: BmsFloorplanCard) {
  const a = host.askData;
  return html`<div class="import-modal" @click=${() => cancelAsk(host)}>
    <form class="pin-box ask-form" @click=${(e: Event) => e.stopPropagation()} @submit=${(e?: Event) => submitAsk(host, e)}>
      <div class="import-title">${a.title}</div>
      ${a.message ? html`<div class="ask-msg">${a.message}</div>` : nothing}
      ${a.input
        ? html`<input class="ask-input name-input" type="text" autocomplete="off"
            inputmode=${a.input.inputmode ?? 'text'}
            placeholder=${a.input.placeholder ?? ''}
            .value=${a.input.value ?? ''} />`
        : nothing}
      <div class="toolrow">
        <button type="submit" class="btn primary ${a.danger ? 'danger' : ''}">
          ${a.okLabel ?? host.tx('Да', 'OK')}
        </button>
        <button type="button" class="btn" @click=${() => cancelAsk(host)}>
          ${a.cancelLabel ?? host.tx('Отмена', 'Cancel')}
        </button>
      </div>
    </form>
  </div>`;
}

/** What the previous version holds, before anything is copied. The operator
 *  sees the source, the count and the names — then decides. */
export function renderLegacyDialog(host: BmsFloorplanCard) {
  const total = host.legacyFinds.reduce((n, f) => n + f.count, 0);
  return html`<div class="import-modal" @click=${() => (host.legacyOpen = false)}>
    <div class="import-box" @click=${(e: Event) => e.stopPropagation()}>
      <div class="import-title">${host.tx('Перенос из старой версии', 'Import from the old version')}</div>
      ${host.legacyBusy && !host.legacyFinds.length
        ? html`<div class="ask-msg">${host.tx('Ищем планы старой версии…', 'Looking for old plans…')}</div>`
        : nothing}
      ${!host.legacyBusy && !host.legacyFinds.length
        ? html`<div class="ask-msg">
            ${host.tx('Планы старой версии не найдены.', 'No plans from the previous version were found.')}
          </div>`
        : nothing}
      <div class="legacy-list">
      ${host.legacyFinds.map(
        (f) => html`<div class="legacy-src">
          <div class="legacy-head">
            ${legacySourceLabel(host, f.source)} — ${f.count}
            ${host.isRu ? ruPlural(f.count, 'проект', 'проекта', 'проектов') : 'project(s)'}
          </div>
          <div class="legacy-names">${f.names.join(' · ')}</div>
        </div>`,
      )}
      ${host.legacyErrors.map(
        (e) => html`<div class="pin-error">
          ${legacySourceLabel(host, e.source)}: ${host.tx('не удалось прочитать', 'could not be read')} — ${e.error}
        </div>`,
      )}
      </div>
      ${host.legacyFinds.length
        ? html`<div class="ask-msg">
            ${host.tx(
              'Проекты будут СКОПИРОВАНЫ сюда. Ваши существующие проекты не затираются: при совпадении имени копия получит пометку. Старое хранилище остаётся нетронутым.',
              'The projects will be COPIED here. Your existing projects are not overwritten — a copy with a clashing name gets a mark appended. The old store is left untouched.',
            )}
          </div>`
        : nothing}
      <div class="toolrow">
        ${host.legacyFinds.length
          ? html`<button class="btn primary" ?disabled=${host.legacyBusy} @click=${() => onImportLegacy(host)}>
              ⬇ ${host.tx(`Перенести (${total})`, `Import (${total})`)}
            </button>`
          : nothing}
        <button class="btn" @click=${() => (host.legacyOpen = false)}>${host.tx('Закрыть', 'Close')}</button>
      </div>
    </div>
  </div>`;
}
