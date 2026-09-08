// ---------------------------------------------------------------------------
// Выдвижной ящик «Проект»: проекты, этажи, подложка-калька, перенос из старой
// версии и замок редактора.
//
// Это ровно те разделы, которые в старой панели стояли пятнадцатыми по счёту и
// ради которых окно растягивали до 2600 px. Логика НЕ переписана: вызываются
// те же функции, что и раньше (src/card/projects.ts, editor-commands.ts,
// pin.ts) — изменилось только место, где они живут: ящик открывается кнопкой и
// закрывается, а не отнимает у плана 270 px постоянно.
// ---------------------------------------------------------------------------

import { html, nothing } from 'lit';
import type { BmsFloorplanCard } from '../../../ha-3d-floorplan-card';
import { onNudgeUnderlay, onPickUnderlay, onRemoveUnderlay, onSetUnderlayField } from '../../editor-commands';
import { hasEditPin, onRemoveEditPin, onSetEditPin } from '../../pin';
import { onDeleteProject, onExportPlan, onNewPlan, onOpenImport, onRenamePlan, onSavePlan, onScanLegacy, onSelectStorageProject } from '../../projects';
import { addFloor2, currentUnderlay, deleteFloor2, renameFloor2, selectFloor2 } from '../../editor2-project';
import { openLegacyEditor } from '../../editor2-commands';
import { e2Btn, textField } from './parts';

export function renderE2Project(host: BmsFloorplanCard) {
  const st = host.e2!;
  return html`
    <div class="e2-scrim" @click=${() => { st.projectOpen = false; host.requestUpdate(); }}></div>
    <div class="e2-drawer" role="dialog" aria-label="Проект, этажи и подложка">
      <div class="e2-sheet-head">
        ${host.ic('save')}<span>Проект</span>
        ${e2Btn(host, {
          icon: 'close', label: 'Закрыть', hint: 'Закрыть ящик «Проект»', cls: 'e2-mini',
          act: 'project-close', compact: true,
          onClick: () => { st.projectOpen = false; host.requestUpdate(); },
        })}
      </div>
      <div class="e2-drawer-body">
        ${projectSection(host)}
        ${floorsSection(host)}
        ${underlaySection(host)}
        ${pinSection(host)}
        ${legacySection(host)}
      </div>
    </div>
  `;
}

function projectSection(host: BmsFloorplanCard) {
  return html`
    <div class="e2-group">Проект</div>
    ${textField({ field: 'plan-name', label: 'Название', value: host.editPlanName,
      placeholder: 'Название проекта',
      onSet: (v) => onRenamePlan(host, { target: { value: v } } as unknown as Event) })}
    ${host.projectList.length
      ? html`<div class="e2-field">
          <span class="e2-lab">Открытый проект</span>
          <div class="e2-list">
            ${host.projectList.map(
              (p) => html`<button class="e2-entity ${p.id === host.editingProjectId ? 'on' : ''}"
                data-project=${p.id}
                @click=${() => onSelectStorageProject(host, { target: { value: p.id } } as unknown as Event)}>
                ${p.name}
              </button>`,
            )}
          </div>
        </div>`
      : nothing}
    <div class="e2-row">
      ${e2Btn(host, { icon: 'plus', label: 'Новый', hint: 'Создать новый проект (остальные сохранятся)',
        act: 'new', onClick: () => onNewPlan(host) })}
      ${e2Btn(host, { icon: 'save', label: 'Сохранить', hint: 'Сохранить этот проект', cls: 'primary',
        act: 'save', onClick: () => onSavePlan(host) })}
    </div>
    <div class="e2-row">
      ${e2Btn(host, { icon: 'download', label: 'Импорт', hint: 'Вставить план в виде JSON и построить его',
        act: 'import', onClick: () => onOpenImport(host) })}
      ${e2Btn(host, { icon: 'upload', label: 'Экспорт', hint: 'Скопировать этот план как JSON',
        act: 'export', onClick: () => onExportPlan(host) })}
      ${host.projectList.length
        ? e2Btn(host, { icon: 'trash', label: 'Удалить', hint: 'Удалить этот проект', cls: 'danger',
            act: 'delete-project', onClick: () => onDeleteProject(host) })
        : nothing}
    </div>
  `;
}

function floorsSection(host: BmsFloorplanCard) {
  const st = host.e2!;
  const floors = st.plan.floors;
  return html`
    <div class="e2-group">Этажи</div>
    ${floors.length > 1
      ? html`<div class="e2-chips" role="group" aria-label="Этаж, который правим">
          ${floors.map(
            (f, i) => html`<button class="e2-chip ${i === st.floorIndex ? 'on' : ''}" data-floor=${i}
              aria-pressed=${i === st.floorIndex ? 'true' : 'false'}
              @click=${() => selectFloor2(host, i)}>${f.name || `Этаж ${i + 1}`}</button>`,
          )}
        </div>`
      : nothing}
    ${textField({ field: 'floor-name-drawer', label: 'Название этажа',
      value: floors[st.floorIndex]?.name ?? '', placeholder: 'Первый этаж',
      onSet: (v) => renameFloor2(host, v) })}
    <div class="e2-row">
      ${e2Btn(host, { icon: 'plus', label: 'Добавить этаж', hint: 'Добавить этаж сверху',
        act: 'add-floor', onClick: () => addFloor2(host) })}
      ${floors.length > 1
        ? e2Btn(host, { icon: 'trash', label: 'Удалить этаж', hint: 'Удалить этот этаж со всем, что на нём',
            cls: 'danger', act: 'del-floor', onClick: () => void deleteFloor2(host) })
        : nothing}
    </div>
  `;
}

function underlaySection(host: BmsFloorplanCard) {
  const ul = currentUnderlay(host);
  return html`
    <div class="e2-group">Подложка — обвести плоский план</div>
    ${ul
      ? html`
          <div class="e2-field">
            <span class="e2-lab">Ширина, м</span>
            <input class="e2-input" data-field="ul-width" type="text" inputmode="decimal"
              aria-label="Ширина подложки в метрах" .value=${String(ul.widthM)}
              @change=${(e: Event) => onSetUnderlayField(host, 'widthM', e)} />
          </div>
          <div class="e2-field">
            <span class="e2-lab">Прозрачность</span>
            <input class="e2-range" type="range" min="0.05" max="1" step="0.05"
              aria-label="Прозрачность подложки" .value=${String(ul.opacity ?? 0.6)}
              @input=${(e: Event) => onSetUnderlayField(host, 'opacity', e)} />
          </div>
          <div class="e2-field">
            <span class="e2-lab">Поворот, °</span>
            <input class="e2-input" data-field="ul-rot" type="text" inputmode="decimal"
              aria-label="Поворот подложки в градусах" .value=${String(ul.rotation ?? 0)}
              @change=${(e: Event) => onSetUnderlayField(host, 'rotation', e)} />
          </div>
          <div class="e2-row">
            ${e2Btn(host, { icon: 'chevLeft', label: 'Влево', hint: 'Сдвинуть подложку влево', cls: 'e2-mini',
              compact: true, onClick: () => onNudgeUnderlay(host, -0.25, 0) })}
            ${e2Btn(host, { icon: 'chevRight', label: 'Вправо', hint: 'Сдвинуть подложку вправо', cls: 'e2-mini',
              compact: true, onClick: () => onNudgeUnderlay(host, 0.25, 0) })}
            ${e2Btn(host, { icon: 'arrowUp', label: 'Вверх', hint: 'Сдвинуть подложку вверх', cls: 'e2-mini',
              compact: true, onClick: () => onNudgeUnderlay(host, 0, -0.25) })}
            ${e2Btn(host, { icon: 'arrowDown', label: 'Вниз', hint: 'Сдвинуть подложку вниз', cls: 'e2-mini',
              compact: true, onClick: () => onNudgeUnderlay(host, 0, 0.25) })}
            ${e2Btn(host, { icon: 'trash', label: 'Убрать', hint: 'Убрать картинку-подложку', cls: 'danger',
              act: 'ul-remove', onClick: () => onRemoveUnderlay(host) })}
          </div>`
      : html`<label class="e2-btn e2-file">
          ${host.ic('image')}<span class="e2-btn-lab">Загрузить картинку</span>
          <input type="file" accept="image/*" hidden aria-label="Загрузить картинку плана"
            @change=${(e: Event) => onPickUnderlay(host, e)} />
        </label>
        <span class="e2-hint">затем укажите ширину в метрах и обводите стены поверх</span>`}
  `;
}

function pinSection(host: BmsFloorplanCard) {
  return html`
    <div class="e2-group">Замок редактора</div>
    <div class="e2-field">
      <span class="e2-lab">${hasEditPin(host) ? 'Новый PIN (заменит текущий)' : 'Задать PIN'}</span>
      <input class="e2-input" type="password" inputmode="numeric" autocomplete="off"
        aria-label=${hasEditPin(host) ? 'Новый PIN редактора' : 'PIN для входа в редактор'}
        .value=${host.editPinInput}
        @input=${(e: Event) => (host.editPinInput = (e.target as HTMLInputElement).value)} />
    </div>
    <div class="e2-row">
      ${e2Btn(host, { icon: 'check', label: hasEditPin(host) ? 'Изменить' : 'Задать',
        hint: 'Сохранить этот PIN', cls: 'primary', act: 'set-pin', onClick: () => onSetEditPin(host) })}
      ${hasEditPin(host)
        ? e2Btn(host, { icon: 'trash', label: 'Снять PIN', hint: 'Убрать PIN редактора', cls: 'danger',
            act: 'del-pin', onClick: () => onRemoveEditPin(host) })
        : nothing}
    </div>
  `;
}

function legacySection(host: BmsFloorplanCard) {
  return html`
    <div class="e2-group">Старая версия</div>
    <div class="e2-row">
      ${e2Btn(host, {
        icon: 'download', label: 'Перенести планы',
        hint: 'Найти планы старой версии и скопировать их сюда. Старое хранилище не изменяется.',
        disabled: host.legacyBusy, act: 'legacy', onClick: () => onScanLegacy(host),
      })}
    </div>
    <div class="e2-row">
      ${e2Btn(host, {
        icon: 'pencil', label: 'Открыть старый редактор',
        hint: 'Прежний редактор пока остаётся рядом. Правки сохранятся перед переходом.',
        act: 'legacy-editor', onClick: () => void openLegacyEditor(host),
      })}
    </div>
  `;
}
