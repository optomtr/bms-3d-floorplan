// ---------------------------------------------------------------------------
// Панель редактора, нижние разделы: проект (имя, список, сохранение,
// импорт/экспорт, перенос из старой версии) и PIN-замок редактора.
// ---------------------------------------------------------------------------

import { html, nothing } from 'lit';
import type { BmsFloorplanCard } from '../../ha-3d-floorplan-card';
import { hasEditPin, onRemoveEditPin, onSetEditPin } from '../pin';
import { onDeleteProject, onExportPlan, onNewPlan, onOpenImport, onRenamePlan, onSavePlan, onScanLegacy, onSelectStorageProject } from '../projects';
import { edBtn } from './editor-panel';

/** Разделы «Проект» и «Безопасность — замок редактора» панели редактора. */
export function renderEditorProject(host: BmsFloorplanCard) {
  const T = (ru: string, en: string) => host.tx(ru, en);
  return html`
      <div class="panel-section">
        <div class="toolrow">
          <span class="hint">${T('Проект', 'Project')}</span>
          <input
            class="name-input"
            type="text"
            placeholder=${T('Название проекта', 'Project name')}
            aria-label=${T('Название проекта', 'Project name')}
            .value=${host.editPlanName}
            @input=${(e: Event) => onRenamePlan(host, e)}
          />
        </div>
        ${host.projectList.length > 0
          ? html`<div class="toolrow">
              <select class="select wide" aria-label=${T('Открытый проект', 'The open project')}
                @change=${(e: Event) => onSelectStorageProject(host, e)}>
                ${!host.editingProjectId
                  ? html`<option value="" selected>${T('(новый, не сохранён)', '(unsaved new)')}</option>`
                  : nothing}
                ${host.projectList.map(
                  (p) => html`<option value=${p.id} ?selected=${p.id === host.editingProjectId}>${p.name}</option>`,
                )}
              </select>
              ${edBtn(host, {
                icon: 'trash', label: T('Удалить', 'Delete'),
                hint: T('Удалить этот проект', 'Delete this project'),
                onClick: () => onDeleteProject(host),
              })}
            </div>`
          : nothing}
        <div class="toolrow">
          ${edBtn(host, {
            icon: 'plus', label: T('Новый', 'New'),
            hint: T('Создать новый проект (остальные сохранятся)', 'Create a new project (keeps the others)'),
            onClick: () => onNewPlan(host),
          })}
          <button class="btn ic-btn primary" data-act="save" title=${host.tx('Сохранить этот проект', 'Save this project')}
            aria-label=${T('Сохранить проект', 'Save this project')}
            @click=${() => onSavePlan(host)}>${host.ic('save')}<span class="ic-btn-lab">${T('Сохранить', 'Save')}</span></button>
        </div>
        <div class="toolrow">
          ${edBtn(host, {
            icon: 'download', label: T('Импорт', 'Import'),
            hint: T('Вставить план в виде JSON и построить его', 'Paste a plan JSON to build it'),
            onClick: () => onOpenImport(host),
          })}
          ${edBtn(host, {
            icon: 'upload', label: T('Экспорт', 'Export'),
            hint: T('Скопировать этот план как JSON', 'Copy this plan as JSON'),
            onClick: () => onExportPlan(host),
          })}
        </div>
        <div class="toolrow">
          ${edBtn(host, {
            icon: 'download',
            label: host.tx('Перенести из старой версии', 'Import from the old version'),
            hint: host.tx(
              'Найти планы старой версии и скопировать их сюда. Старое хранилище не изменяется.',
              'Find plans from the previous version and copy them here. The old store is left untouched.',
            ),
            disabled: host.legacyBusy,
            onClick: () => onScanLegacy(host),
          })}
        </div>
      </div>

      <div class="panel-section">
        <div class="panel-group">${host.ic('lockClosed')}<span>${T('Безопасность — замок редактора', 'Security — lock editing')}</span></div>
        <div class="toolrow">
          <input class="name-input" type="password" inputmode="numeric" autocomplete="off"
            placeholder=${hasEditPin(host)
              ? T('Новый PIN (заменит текущий)', 'New PIN (replaces current)')
              : T('Задать PIN', 'Set a PIN')}
            aria-label=${hasEditPin(host)
              ? T('Новый PIN редактора', 'New editor PIN')
              : T('PIN для входа в редактор', 'PIN for entering the editor')}
            .value=${host.editPinInput}
            @input=${(e: Event) => (host.editPinInput = (e.target as HTMLInputElement).value)} />
          ${edBtn(host, {
            icon: 'check',
            label: hasEditPin(host) ? T('Изменить', 'Update') : T('Задать', 'Set'),
            hint: T('Сохранить этот PIN', 'Save this PIN'),
            cls: 'primary',
            onClick: () => onSetEditPin(host),
          })}
        </div>
        ${hasEditPin(host)
          ? html`<div class="toolrow">
              <span class="hint">${T('Вход в редактор — по PIN', 'A PIN is required to enter the editor')}</span>
              ${edBtn(host, {
                icon: 'trash', label: T('Снять PIN', 'Remove'),
                hint: T('Убрать PIN редактора', 'Remove the edit PIN'),
                onClick: () => onRemoveEditPin(host),
              })}
            </div>`
          : html`<span class="hint">${T(
              'PIN не задан — править может кто угодно. Задайте его, чтобы план не изменили случайно.',
              'No PIN set — anyone can edit. Set one to prevent accidental changes.',
            )}</span>`}
      </div>
  `;
}
