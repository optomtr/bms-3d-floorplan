// ---------------------------------------------------------------------------
// Панель редактора, нижние разделы: проект (имя, список, сохранение,
// импорт/экспорт, перенос из старой версии) и PIN-замок редактора.
// ---------------------------------------------------------------------------

import { html, nothing } from 'lit';
import type { BmsFloorplanCard } from '../../ha-3d-floorplan-card';
import { hasEditPin, onRemoveEditPin, onSetEditPin } from '../pin';
import { onDeleteProject, onExportPlan, onNewPlan, onOpenImport, onRenamePlan, onSavePlan, onScanLegacy, onSelectStorageProject } from '../projects';

/** Разделы «Project» и «Security — lock editing» панели редактора. */
export function renderEditorProject(host: BmsFloorplanCard) {
  return html`
      <div class="panel-section">
        <div class="toolrow">
          <span class="hint">Project</span>
          <input
            class="name-input"
            type="text"
            placeholder="Project name"
            .value=${host.editPlanName}
            @input=${(e: Event) => onRenamePlan(host, e)}
          />
        </div>
        ${host.projectList.length > 0
          ? html`<div class="toolrow">
              <select class="select wide" @change=${(e: Event) => onSelectStorageProject(host, e)}>
                ${!host.editingProjectId
                  ? html`<option value="" selected>(unsaved new)</option>`
                  : nothing}
                ${host.projectList.map(
                  (p) => html`<option value=${p.id} ?selected=${p.id === host.editingProjectId}>${p.name}</option>`,
                )}
              </select>
              <button class="btn" title="Delete this project" @click=${() => onDeleteProject(host)}>🗑</button>
            </div>`
          : nothing}
        <div class="toolrow">
          <button class="btn" title="Create a new project (keeps the others)" @click=${() => onNewPlan(host)}>✚ New</button>
          <button class="btn primary" title="Save this project" @click=${() => onSavePlan(host)}>💾 Save</button>
        </div>
        <div class="toolrow">
          <button class="btn" title="Paste a plan JSON to build it" @click=${() => onOpenImport(host)}>📥 Import</button>
          <button class="btn" title="Copy this plan as JSON" @click=${() => onExportPlan(host)}>📤 Export</button>
        </div>
        <div class="toolrow">
          <button class="btn" ?disabled=${host.legacyBusy}
            title=${host.tx(
              'Найти планы старой версии и скопировать их сюда. Старое хранилище не изменяется.',
              'Find plans from the previous version and copy them here. The old store is left untouched.',
            )}
            @click=${() => onScanLegacy(host)}>
            ⬇ ${host.tx('Перенести из старой версии', 'Import from the old version')}
          </button>
        </div>
      </div>

      <div class="panel-section">
        <div class="panel-group">🔒 Security — lock editing</div>
        <div class="toolrow">
          <input class="name-input" type="password" inputmode="numeric" autocomplete="off"
            placeholder=${hasEditPin(host) ? 'New PIN (replaces current)' : 'Set a PIN'}
            .value=${host.editPinInput}
            @input=${(e: Event) => (host.editPinInput = (e.target as HTMLInputElement).value)} />
          <button class="btn primary" title="Save this PIN" @click=${() => onSetEditPin(host)}>
            ${hasEditPin(host) ? 'Update' : 'Set'}
          </button>
        </div>
        ${hasEditPin(host)
          ? html`<div class="toolrow">
              <span class="hint">🔒 PIN required to enter Edit</span>
              <button class="btn" title="Remove the edit PIN" @click=${() => onRemoveEditPin(host)}>Remove</button>
            </div>`
          : html`<span class="hint">No PIN set — anyone can edit. Set one to prevent accidental changes.</span>`}
      </div>
  `;
}
