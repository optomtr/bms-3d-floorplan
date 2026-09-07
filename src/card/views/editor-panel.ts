// ---------------------------------------------------------------------------
// Панель редактора: оболочка и первый экран — отмена/повтор, инструменты,
// части здания, подложка, поверхности и этажи.
//
// Разделы вынесены в соседние файлы (editor-rooms / editor-selection /
// editor-project) и вставляются сюда как вложенные шаблоны Lit: DOM внутри
// .toolbar остаётся тем же, поэтому правило `.toolbar > *` работает как
// работало.
//
// Язык — русский (английский остаётся запасным через host.tx). Значки —
// ТОЛЬКО из общего набора src/scene/icons.ts: эмодзи на части планшетов
// рисуются пустым квадратом, и подпись кнопки превращается в загадку.
// ---------------------------------------------------------------------------

import { html, nothing } from 'lit';
import type { BmsFloorplanCard } from '../../ha-3d-floorplan-card';
import { FLOOR_MATERIALS, WALL_MATERIALS, materialLabel } from '../../scene/materials';
import { onAddFloor, onAddRoomShape, onAutoFloors, onCalibrateUnderlay, onDeleteFloor, onEditTool, onMergeWalls, onNudgeUnderlay, onPickUnderlay, onRedo, onRemoveUnderlay, onRenameFloor, onSelectEditFloor, onSetCameraDistance, onSetUnderlayField, onUndo } from '../editor-commands';
import { renderEditorProject } from './editor-project';
import { renderEditorRooms } from './editor-rooms';
import { renderEditorSelection } from './editor-selection';

export function renderEditor(host: BmsFloorplanCard) {
  return html`
    <div class="overlay top-left toolbar">
      ${renderEditorTools(host)}
      ${renderEditorRooms(host)}
      ${renderEditorSelection(host)}
      ${renderEditorProject(host)}
    </div>
  `;
}

/** Кнопка со значком И подписью. На сенсорном экране всплывающей подсказки не
 *  бывает — видимая подпись обязательна, `aria-label` дублирует её для
 *  озвучивания. */
export function edBtn(
  host: BmsFloorplanCard,
  opts: { icon: string; label: string; hint?: string; cls?: string; disabled?: boolean; onClick: () => void },
) {
  return html`<button
    class="btn ic-btn ${opts.cls ?? ''}"
    title=${opts.hint ?? opts.label}
    aria-label=${opts.hint ? `${opts.label}. ${opts.hint}` : opts.label}
    ?disabled=${opts.disabled === true}
    @click=${opts.onClick}
  >${host.ic(opts.icon)}<span class="ic-btn-lab">${opts.label}</span></button>`;
}

/** Верх панели: отмена/повтор, инструменты, части здания, подложка,
 *  поверхности и этажи. */
function renderEditorTools(host: BmsFloorplanCard) {
  const tool = host.editTool;
  const T = (ru: string, en: string) => host.tx(ru, en);

  return html`
      <div class="ed-head">${host.ic('pencil')}<span>${T('Редактор плана', 'Plan editor')}</span></div>

      <div class="grid2">
        ${edBtn(host, {
          icon: 'undo', label: T('Отменить', 'Undo'), hint: T('Отменить последнее действие (Ctrl+Z)', 'Undo the last action (Ctrl+Z)'),
          disabled: !host.editCanUndo, onClick: () => onUndo(host),
        })}
        ${edBtn(host, {
          icon: 'redo', label: T('Повторить', 'Redo'), hint: T('Вернуть отменённое (Ctrl+Y)', 'Redo (Ctrl+Y)'),
          disabled: !host.editCanRedo, onClick: () => onRedo(host),
        })}
        ${edBtn(host, {
          icon: 'merge', label: T('Объединить', 'Merge'),
          hint: T('Слить одинаковые и наложенные стены в одну', 'Merge duplicate / overlapping walls into one'),
          onClick: () => onMergeWalls(host),
        })}
        ${edBtn(host, {
          icon: 'floorArea', label: T('Полы авто', 'Auto floors'),
          hint: T('Залить полом каждый замкнутый контур стен', 'Fill every closed wall loop with a floor'),
          onClick: () => onAutoFloors(host),
        })}
      </div>

      <div class="panel-group">${T('Инструменты', 'Tools')}</div>
      <div class="grid2">
        ${edBtn(host, { icon: 'wall', label: T('Стена', 'Wall'), hint: T('Чертить стены', 'Draw walls'),
          cls: tool === 'wall' ? 'active' : '', onClick: () => onEditTool(host, 'wall') })}
        ${edBtn(host, { icon: 'arc', label: T('Дуга', 'Curve'),
          hint: T('Круглая стена: касание — начало, касание — конец, затем ведите и коснитесь, чтобы задать изгиб',
                  'Curved wall — tap start, tap end, then move to bulge the arc and tap'),
          cls: tool === 'arc' ? 'active' : '', onClick: () => onEditTool(host, 'arc') })}
        ${edBtn(host, { icon: 'door', label: T('Дверь', 'Door'), hint: T('Поставить дверь — коснитесь стены', 'Add a door — tap a wall'),
          cls: tool === 'door' ? 'active' : '', onClick: () => onEditTool(host, 'door') })}
        ${edBtn(host, { icon: 'windowIcon', label: T('Окно', 'Window'), hint: T('Поставить окно — коснитесь стены', 'Add a window — tap a wall'),
          cls: tool === 'window' ? 'active' : '', onClick: () => onEditTool(host, 'window') })}
        ${edBtn(host, { icon: 'opening', label: T('Проём', 'Opening'),
          hint: T('Открытый проём без двери — коснитесь стены', 'Add an open passage (no door) — tap a wall'),
          cls: tool === 'opening' ? 'active' : '', onClick: () => onEditTool(host, 'opening') })}
        ${edBtn(host, { icon: 'floorArea', label: T('Пол', 'Floor'),
          hint: T('Обвести пол: касайтесь углов, замкните на начальной точке (или «Готово»)',
                  'Trace a floor: tap corners, tap start (or Finish) to close'),
          cls: tool === 'floor' ? 'active' : '', onClick: () => onEditTool(host, 'floor') })}
        ${edBtn(host, { icon: 'couch', label: T('Мебель', 'Furniture'), hint: T('Расставить мебель', 'Place furniture'),
          cls: tool === 'furniture' ? 'active' : '', onClick: () => onEditTool(host, 'furniture') })}
        ${edBtn(host, { icon: 'cursor', label: T('Выбор', 'Select'),
          hint: T('Выбрать, передвинуть, привязать. Камера работает всегда: тянуть за пустое место — поворот',
                  'Select / move / bind (camera always works: drag empty = orbit)'),
          cls: `span2 ${tool === 'select' ? 'active' : ''}`, onClick: () => onEditTool(host, 'select') })}
      </div>
      ${tool === 'arc'
        ? html`<span class="hint">${T(
            'Дуга: касание — начало · касание — конец · ведите, чтобы выгнуть · касание — поставить («Готово» или Esc отменяют)',
            'Curve: tap start · tap end · move to bend the arc · tap to place (Finish/Esc cancels)',
          )}</span>`
        : nothing}
      <span class="hint">${T(
        'Камера всегда включена: тянуть за пустое место — поворот · два пальца — сдвиг и приближение · касание — действие',
        'Camera always on: drag empty space = orbit · two fingers = pan/zoom · tap = act',
      )}</span>

      <div class="panel-group">${T('Части здания — готовая комната', 'Building parts — drop a room')}</div>
      <div class="grid2">
        ${edBtn(host, { icon: 'rect', label: T('Прямоугольник', 'Rect'), hint: T('Прямоугольная комната', 'Rectangle room'),
          onClick: () => onAddRoomShape(host, 'rect') })}
        ${edBtn(host, { icon: 'lshape', label: T('Г-образная', 'L-shape'), hint: T('Комната буквой «Г»', 'L-shaped room'),
          onClick: () => onAddRoomShape(host, 'lshape') })}
        ${edBtn(host, { icon: 'bevel', label: T('Со скосом', 'Bevel'), hint: T('Комната со срезанным углом', 'Bevelled room'),
          cls: 'span2', onClick: () => onAddRoomShape(host, 'bevel') })}
      </div>
      <span class="hint">${T('затем двигайте, поворачивайте и растягивайте её', 'then drag / rotate / resize it')}</span>

      <div class="panel-group">${T('Подложка — обвести плоский план', 'Reference image — trace a 2D plan')}</div>
      ${host.editUnderlay
        ? html`<div class="toolrow">
              <label class="hint" for="ul-width">${T('Ширина (м):', 'Width (m):')}</label>
              <input id="ul-width" class="num-input" type="text" inputmode="decimal" min="0.5" step="0.1"
                aria-label=${T('Ширина подложки в метрах', 'Reference image width in metres')}
                .value=${String(host.editUnderlay.widthM)}
                @change=${(e: Event) => onSetUnderlayField(host, 'widthM', e)} />
              <label class="hint" for="ul-opacity">${T('Прозрачность:', 'Opacity:')}</label>
              <input id="ul-opacity" type="range" min="0.05" max="1" step="0.05"
                aria-label=${T('Прозрачность подложки', 'Reference image opacity')}
                .value=${String(host.editUnderlay.opacity ?? 0.6)}
                @input=${(e: Event) => onSetUnderlayField(host, 'opacity', e)} />
              <label class="hint" for="ul-rot">${T('Поворот, °:', 'Rotate°:')}</label>
              <input id="ul-rot" class="num-input" type="text" inputmode="decimal" step="1"
                aria-label=${T('Поворот подложки в градусах', 'Reference image rotation in degrees')}
                .value=${String(host.editUnderlay.rotation ?? 0)}
                @change=${(e: Event) => onSetUnderlayField(host, 'rotation', e)} />
            </div>
            <div class="toolrow">
              <span class="hint">${T('Сдвинуть:', 'Move:')}</span>
              ${edBtn(host, { icon: 'chevLeft', label: T('Влево', 'Left'), cls: 'icon-only',
                onClick: () => onNudgeUnderlay(host, -0.25, 0) })}
              ${edBtn(host, { icon: 'chevRight', label: T('Вправо', 'Right'), cls: 'icon-only',
                onClick: () => onNudgeUnderlay(host, 0.25, 0) })}
              ${edBtn(host, { icon: 'arrowUp', label: T('Вверх', 'Up'), cls: 'icon-only',
                onClick: () => onNudgeUnderlay(host, 0, -0.25) })}
              ${edBtn(host, { icon: 'arrowDown', label: T('Вниз', 'Down'), cls: 'icon-only',
                onClick: () => onNudgeUnderlay(host, 0, 0.25) })}
            </div>
            <div class="toolrow">
              ${edBtn(host, {
                icon: 'ruler', label: T('Задать масштаб', 'Calibrate'),
                hint: T('Отметьте две точки, расстояние между которыми известно', 'Set scale by tapping two points of known length'),
                onClick: () => onCalibrateUnderlay(host),
              })}
              ${edBtn(host, {
                icon: 'trash', label: T('Убрать подложку', 'Remove'), hint: T('Убрать картинку-подложку', 'Remove reference image'),
                onClick: () => onRemoveUnderlay(host),
              })}
            </div>`
        : html`<div class="toolrow">
            <label class="btn ic-btn" title=${T('Загрузить плоский план сверху, чтобы обвести его', 'Import a top-down 2D plan image to trace over')}>
              ${host.ic('image')}<span class="ic-btn-lab">${T('Загрузить картинку', 'Import image')}</span>
              <input type="file" accept="image/*" style="display:none"
                aria-label=${T('Загрузить картинку плана', 'Import a plan image')}
                @change=${(e: Event) => onPickUnderlay(host, e)} />
            </label>
            <span class="hint">${T(
              'затем укажите её ширину в метрах и чертите стены поверх',
              'then set its width (m) and draw walls over it',
            )}</span>
          </div>`}

      <div class="panel-group">${T('Поверхности — цвет и покрытие', 'Surfaces — color & wallpaper')}</div>
      <div class="toolrow">
        <span class="hint">${T('Стены', 'Walls')}</span>
        <input class="color" type="color" title=${T('Цвет ВСЕХ стен', 'Color for ALL walls')}
          aria-label=${T('Цвет всех стен этажа', 'Color for all walls on this level')}
          .value=${host.editAllWallColor}
          @change=${(e: Event) => {
            host.editAllWallColor = (e.target as HTMLInputElement).value;
            host.editor?.setAllWallsColor(host.editAllWallColor);
          }} />
        <select class="select" title=${T('Покрытие ВСЕХ стен', 'Wallpaper for ALL walls')}
          aria-label=${T('Покрытие всех стен этажа', 'Wallpaper for all walls on this level')}
          @change=${(e: Event) => {
            host.editAllWallMat = (e.target as HTMLSelectElement).value;
            host.editor?.setAllWallsMaterial(host.editAllWallMat);
          }}>
          ${WALL_MATERIALS.map(
            (m) => html`<option value=${m} ?selected=${m === host.editAllWallMat}>${materialLabel(m)}</option>`,
          )}
        </select>
      </div>
      <div class="toolrow">
        <span class="hint">${T('Пол', 'Floor')}</span>
        <input class="color" type="color" title=${T('Цвет ВСЕХ полов', 'Color for ALL floors')}
          aria-label=${T('Цвет всех полов этажа', 'Color for all floors on this level')}
          .value=${host.editAllFloorColor}
          @change=${(e: Event) => {
            host.editAllFloorColor = (e.target as HTMLInputElement).value;
            host.editor?.setAllFloorsColor(host.editAllFloorColor);
          }} />
        <select class="select" title=${T('Покрытие ВСЕХ полов', 'Material for ALL floors')}
          aria-label=${T('Покрытие всех полов этажа', 'Material for all floors on this level')}
          @change=${(e: Event) => {
            host.editAllFloorMat = (e.target as HTMLSelectElement).value;
            host.editor?.setAllFloorsMaterial(host.editAllFloorMat);
          }}>
          ${FLOOR_MATERIALS.map(
            (m) => html`<option value=${m} ?selected=${m === host.editAllFloorMat}>${materialLabel(m)}</option>`,
          )}
        </select>
      </div>
      <span class="hint">${T(
        'применяется ко всем стенам и полам этого этажа (или выделите один и задайте отдельно)',
        'applies to every wall / floor on this level (or select one to set it alone)',
      )}</span>

      ${(() => {
        // Derive the floor list from the LIVE edit plan (not View-mode state),
        // so it stays correct after New / project switch while editing.
        const efloors = host.editor?.plan.floors ?? [];
        const curName = efloors[host.editFloorIndex]?.name ?? '';
        return html`<div class="panel-group">${T('Этажи', 'Floors')}</div>
        <div class="toolrow">
          ${efloors.length > 1
            ? html`<select class="select" aria-label=${T('Этаж, который правим', 'The floor being edited')}
                @change=${(e: Event) => onSelectEditFloor(host, e)}>
                ${efloors.map(
                  (f, i) => html`<option value=${i} ?selected=${i === host.editFloorIndex}>
                    ${f.name || T(`Этаж ${i + 1}`, `Floor ${i + 1}`)}
                  </option>`,
                )}
              </select>`
            : nothing}
          ${edBtn(host, { icon: 'plus', label: T('Этаж', 'Floor'), hint: T('Добавить этаж сверху', 'Add a floor above'),
            onClick: () => onAddFloor(host) })}
          ${efloors.length > 1
            ? edBtn(host, { icon: 'trash', label: T('Удалить этаж', 'Delete floor'),
                hint: T('Удалить этот этаж со всем, что на нём', 'Delete this floor and everything on it'),
                onClick: () => onDeleteFloor(host) })
            : nothing}
        </div>
        <div class="toolrow">
          <input class="name-input" type="text" placeholder=${T('Название этажа', 'Floor name')}
            .value=${curName}
            title=${T('Переименовать этаж', 'Rename this floor')}
            aria-label=${T('Название этажа', 'Floor name')}
            @input=${(e: Event) => onRenameFloor(host, e)} />
        </div>
        <div class="toolrow">
          <span class="hint">${T('Дальность обзора:', 'View distance:')}</span>
          <input type="range" min="0.4" max="2" step="0.05"
            .value=${String(host.editCameraDistance)}
            title=${T('Как далеко стоит камера после «Сброс» (сохраняется в проекте)',
                      'Default camera distance on Reset (saved with the project)')}
            aria-label=${T('Дальность камеры по умолчанию', 'Default camera distance')}
            @input=${(e: Event) => onSetCameraDistance(host, e)} />
        </div>`;
      })()}
  `;
}
