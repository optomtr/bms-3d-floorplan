// ---------------------------------------------------------------------------
// Панель редактора, раздел выбранного объекта: подсказки по инструменту,
// палитра моделей и свойства выделенного (мебель / стена / комната /
// проём), включая привязку сущностей.
// ---------------------------------------------------------------------------

import { html, nothing } from 'lit';
import type { BmsFloorplanCard } from '../../ha-3d-floorplan-card';
import { FURNITURE_KEYS, LIGHT_KEYS, entityDomainsFor, ventCount } from '../../furniture/library';
import { modelLabel } from '../../furniture/names';
import { getThumbnail } from '../../furniture/thumbnails';
import { DOOR_VARIANTS, WINDOW_VARIANTS, openingVariantLabel } from '../../scene/builder';
import { FLOOR_MATERIALS, WALL_MATERIALS, materialLabel } from '../../scene/materials';
import { onDeleteRoomOpening, onDeleteSelected, onDeleteWallOpening, onFinishWall, onNudgeHeight, onPickEntityPart, onRotateSelected, onSetBrightness, onSetColor, onSetCount, onSetFurnScale, onSetMaterial, onSetOpeningKind, onSetOpeningVariant, onSetOpeningWidth, onSetRoomField, onSetSpread, onSetWallAngle, onSetWallLength, onSlideOpening, onToggleSnap, onUndoPoint, pickModel, togglePalette } from '../editor-commands';
import { candidateEntities, entityOptionText } from '../entities';
import { edBtn } from './editor-panel';

/** Подпись модели в палитре берётся из справочника русских названий; для
 *  незнакомого ключа modelLabel сам вернёт прежний машинный вариант. */

/** Мебель — это всё, что не светильник (у света своя группа в палитре). */
const FURNITURE_ONLY = FURNITURE_KEYS.filter((k) => !LIGHT_KEYS.includes(k));

export function renderPaletteCell(host: BmsFloorplanCard, model: string, label: string) {
  return html`
    <button
      class="palette-cell ${model === host.editSelectedModel ? 'active' : ''}"
      title=${label}
      @click=${() => pickModel(host, model)}
    >
      <img src=${getThumbnail(model)} alt="" />
      <span>${label}</span>
    </button>
  `;
}

/** Подсказки по текущему инструменту, палитра моделей и свойства выделенного. */
export function renderEditorSelection(host: BmsFloorplanCard) {
  const T = (ru: string, en: string) => host.tx(ru, en);
  const tool = host.editTool;
  const kind = host.editSelectedKind;
  const hasSelection = tool === 'select' && !!kind;
  const isFurniture = kind === 'furniture';

  return html`
      ${tool === 'wall' || tool === 'floor'
        ? html`<div class="toolrow">
            ${edBtn(host, { icon: 'undo', label: T('Убрать точку', 'Undo point'),
              hint: T('Убрать последнюю поставленную точку', 'Remove the last point'), onClick: () => onUndoPoint(host) })}
            ${edBtn(host, { icon: 'check', label: T('Готово', 'Finish'),
              hint: T('Завершить эту цепочку (Enter)', 'Finish this run (Enter)'), onClick: () => onFinishWall(host) })}
            ${edBtn(host, { icon: 'magnet', label: T('Привязка', 'Snap'),
              hint: T('Помощь при черчении: параллельно и под прямым углом, равные длины, выравнивание',
                      'Snap assist: parallel/perpendicular angles, equal lengths, alignment'),
              cls: host.editSnap ? 'active' : '', onClick: () => onToggleSnap(host) })}
            <span class="hint">${tool === 'floor'
              ? T('обведите пол: касайтесь углов · замкните на начальной точке (или «Готово»)',
                  'trace a floor: tap corners · tap start (or Finish) to close')
              : T('касание — точка · замкните на начальной точке (появится пол) · «Готово»/Enter — закончить',
                  'tap to add points · tap start to close (adds floor) · Finish/Enter to end')}</span>
          </div>`
        : nothing}

      ${tool === 'furniture'
        ? html`<div class="toolrow">
            <button class="btn palette-btn ic-btn" title=${T('Выбрать модель', 'Choose a model')}
              aria-label=${`${T('Выбрать модель', 'Choose a model')}: ${modelLabel(host.editSelectedModel)}`}
              @click=${() => togglePalette(host)}>
              <img class="palette-thumb" src=${getThumbnail(host.editSelectedModel)} alt="" />
              <span class="ic-btn-lab">${modelLabel(host.editSelectedModel)}</span>${host.ic('chevDown')}
            </button>
            <span class="hint">${T('коснитесь пола, чтобы поставить', 'tap the floor to place it')}</span>
          </div>
          ${host.paletteOpen
            ? (() => {
                const q = host.editFurnSearch.trim().toLowerCase();
                const match = (k: string) => !q || modelLabel(k).toLowerCase().includes(q) || k.includes(q);
                const lights = LIGHT_KEYS.filter(match);
                const furn = FURNITURE_ONLY.filter(match);
                return html`<div class="palette">
                  <div class="toolrow search-row">
                    <span class="search-ic">${host.ic('search')}</span>
                    <input class="select wide" type="search" placeholder=${T('поиск модели…', 'search models…')}
                      aria-label=${T('Поиск модели мебели', 'Search furniture models')}
                      .value=${host.editFurnSearch}
                      @input=${(e: Event) => (host.editFurnSearch = (e.target as HTMLInputElement).value)} />
                  </div>
                  ${lights.length
                    ? html`<div class="palette-group">${T('Освещение', 'Lighting')}</div>
                        <div class="palette-grid">
                          ${lights.map((k) => renderPaletteCell(host, k, modelLabel(k)))}
                        </div>`
                    : nothing}
                  ${furn.length
                    ? html`<div class="palette-group">${T('Мебель', 'Furniture')}</div>
                        <div class="palette-grid">
                          ${furn.map((k) => renderPaletteCell(host, k, modelLabel(k)))}
                        </div>`
                    : nothing}
                  ${!lights.length && !furn.length
                    ? html`<span class="hint">${T(
                        `по запросу «${host.editFurnSearch}» ничего не найдено`,
                        `no models match "${host.editFurnSearch}"`,
                      )}</span>`
                    : nothing}
                </div>`;
              })()
            : nothing}`
        : nothing}

      ${hasSelection
        ? html`<div class="toolrow">
            <span class="hint">${T('Выбрано: ', 'Selected: ')}${selectionName(host, kind)}</span>
            ${isFurniture
              ? html`${edBtn(host, { icon: 'rotate', label: T('Повернуть', 'Rotate'), hint: T('Повернуть на 45°', 'Rotate 45°'),
                    onClick: () => onRotateSelected(host) })}
                  ${edBtn(host, { icon: 'arrowDown', label: T('Ниже', 'Lower'), hint: T('Опустить предмет', 'Lower the item'),
                    onClick: () => onNudgeHeight(host, -0.1) })}
                  ${edBtn(host, { icon: 'arrowUp', label: T('Выше', 'Raise'), hint: T('Поднять предмет', 'Raise the item'),
                    onClick: () => onNudgeHeight(host, 0.1) })}`
              : nothing}
            ${kind === 'opening'
              ? html`${edBtn(host, { icon: 'chevLeft', label: T('Влево', 'Left'),
                    hint: T('Сдвинуть по стене влево', 'Slide left along the wall'), onClick: () => onSlideOpening(host, -0.1) })}
                  ${edBtn(host, { icon: 'chevRight', label: T('Вправо', 'Right'),
                    hint: T('Сдвинуть по стене вправо', 'Slide right along the wall'), onClick: () => onSlideOpening(host, 0.1) })}`
              : nothing}
            ${edBtn(host, { icon: 'trash', label: T('Удалить', 'Delete'),
              hint: T('Удалить выбранное', 'Delete the selected item'), onClick: () => onDeleteSelected(host) })}
          </div>
          ${isFurniture && host.editIsLight
            ? html`<div class="toolrow">
                <span class="hint">${T('Яркость:', 'Brightness:')}</span>
                <input type="range" min="0" max="1" step="0.05"
                  .value=${String(host.editBrightness)}
                  title=${T('Ручная яркость свечения (привязанный светильник её перебивает)',
                            'Manual glow level (bound light overrides)')}
                  aria-label=${T('Яркость свечения модели', 'Model glow brightness')}
                  @input=${(e: Event) => onSetBrightness(host, e)} />
              </div>`
            : nothing}
          ${isFurniture && host.editIsLightSet
            ? html`<div class="toolrow">
                  <span class="hint">${T('Разнос:', 'Spread:')}</span>
                  <input type="range" min="0.6" max="10" step="0.1"
                    .value=${String(host.editSpread)}
                    title=${T('Расстояние между элементами (размер каждого не меняется)',
                              'Spacing between elements (each keeps its size)')}
                    aria-label=${T('Расстояние между элементами', 'Spacing between elements')}
                    @input=${(e: Event) => onSetSpread(host, e)} />
                </div>
                ${host.editSelectedObjModel === 'spotlight_bar'
                  ? html`<div class="toolrow">
                      <span class="hint">${T('Светильников:', 'Spots:')}</span>
                      <input class="num-input" type="text" inputmode="decimal" min="1" max="12" step="1"
                        aria-label=${T('Число светильников на планке', 'Number of spots on the bar')}
                        .value=${String(host.editCount)}
                        @change=${(e: Event) => onSetCount(host, e)} />
                    </div>`
                  : nothing}`
            : nothing}
          ${kind === 'opening'
            ? html`<div class="toolrow">
                  <span class="hint">${T('Тип:', 'Type:')}</span>
                  <select class="select" aria-label=${T('Тип проёма', 'Opening type')}
                    @change=${(e: Event) => onSetOpeningKind(host, e)}>
                    ${(['door', 'window', 'opening'] as const).map(
                      (k) => html`<option value=${k} ?selected=${k === host.editOpeningKind}>${openingKindLabel(host, k)}</option>`,
                    )}
                  </select>
                </div>
                ${host.editOpeningKind !== 'opening'
                  ? html`<div class="toolrow">
                      <span class="hint">${T('Вид:', 'Style:')}</span>
                      <select class="select" aria-label=${T('Вид проёма', 'Opening style')}
                        @change=${(e: Event) => onSetOpeningVariant(host, e)}>
                        ${(host.editOpeningKind === 'door' ? DOOR_VARIANTS : WINDOW_VARIANTS).map(
                          (v) =>
                            html`<option value=${v} ?selected=${v === host.editOpeningVariant}>
                              ${openingVariantLabel(host.editOpeningKind ?? undefined, v)}
                            </option>`,
                        )}
                      </select>
                    </div>`
                  : nothing}
                <div class="toolrow">
                  <span class="hint">${T('Ширина (м):', 'Width (m):')}</span>
                  <input class="num-input" type="text" inputmode="decimal" min="0.3" step="0.1"
                    aria-label=${T('Ширина проёма в метрах', 'Opening width in metres')}
                    .value=${host.editOpeningWidth != null ? host.editOpeningWidth.toFixed(2) : ''}
                    @change=${(e: Event) => onSetOpeningWidth(host, e)} />
                </div>`
            : nothing}
          ${kind !== 'opening'
            ? html`<div class="toolrow">
                <span class="hint">${T('Цвет:', 'Color:')}</span>
                <input
                  class="color"
                  type="color"
                  aria-label=${T('Цвет выбранного', 'Colour of the selected item')}
                  .value=${host.editSelectedColor ?? (kind === 'room' ? '#c6a87e' : kind === 'wall' ? '#dcc3a0' : '#ffffff')}
                  @input=${(e: Event) => onSetColor(host, e)}
                />
                ${kind === 'wall' || kind === 'room'
                  ? html`<span class="hint">${kind === 'room' ? T('Пол', 'Floor') : T('Стена', 'Wall')}:</span>
                      <select class="select" aria-label=${kind === 'room' ? T('Покрытие пола', 'Floor material') : T('Покрытие стены', 'Wall material')}
                        @change=${(e: Event) => onSetMaterial(host, e)}>
                        ${(kind === 'room' ? FLOOR_MATERIALS : WALL_MATERIALS).map(
                          (m) =>
                            html`<option value=${m} ?selected=${m === host.editMaterial}>${materialLabel(m)}</option>`,
                        )}
                      </select>`
                  : nothing}
              </div>`
            : nothing}
          ${isFurniture && host.editFurnScale && !host.editIsLightSet
            ? html`<div class="toolrow">
                <span class="hint">${T('Размер', 'Size')}</span>
                <input class="num-input" type="text" inputmode="decimal" min="0.1" step="0.1"
                  title=${T('Ширина', 'Width')} aria-label=${T('Ширина предмета', 'Item width')}
                  .value=${host.editFurnScale[0].toFixed(1)}
                  @change=${(e: Event) => onSetFurnScale(host, 0, e)} />
                <input class="num-input" type="text" inputmode="decimal" min="0.1" step="0.1"
                  title=${T('Высота', 'Height')} aria-label=${T('Высота предмета', 'Item height')}
                  .value=${host.editFurnScale[1].toFixed(1)}
                  @change=${(e: Event) => onSetFurnScale(host, 1, e)} />
                <input class="num-input" type="text" inputmode="decimal" min="0.1" step="0.1"
                  title=${T('Глубина', 'Depth')} aria-label=${T('Глубина предмета', 'Item depth')}
                  .value=${host.editFurnScale[2].toFixed(1)}
                  @change=${(e: Event) => onSetFurnScale(host, 2, e)} />
              </div>`
            : nothing}
          ${kind === 'wall'
            ? html`<div class="toolrow">
                <span class="hint">${T('Длина (м):', 'Length (m):')}</span>
                <input
                  class="num-input"
                  type="text"
                  inputmode="decimal"
                  min="0.1"
                  step="0.1"
                  aria-label=${T('Длина стены в метрах', 'Wall length in metres')}
                  .value=${host.editSelectedWallLength != null ? host.editSelectedWallLength.toFixed(2) : ''}
                  @change=${(e: Event) => onSetWallLength(host, e)}
                />
                <span class="hint">${T('или потяните за конец стены', "or drag the wall's end point")}</span>
              </div>
              <div class="toolrow">
                <span class="hint">${T('Толщина (м):', 'Thickness (m):')}</span>
                <input class="num-input" type="text" inputmode="decimal" min="0.05" step="0.01"
                  data-field="wall-thickness" title=${host.tx('Толщина стены в метрах (например 0,25 · 0,38 · 0,78)', 'Wall thickness in meters (e.g. 0.25, 0.38, 0.78)')}
                  aria-label=${T('Толщина стены в метрах (например 0,25 · 0,38 · 0,78)', 'Wall thickness in metres (e.g. 0.25, 0.38, 0.78)')}
                  .value=${host.editSelectedWallThickness != null ? host.editSelectedWallThickness.toFixed(2) : ''}
                  @change=${host.onSetWallThickness} />
                <span class="hint">${T('Угол (°):', 'Angle (°):')}</span>
                <input class="num-input" type="text" inputmode="decimal" step="1"
                  title=${T('Абсолютный угол в градусах (45 — по диагонали), поворот вокруг начальной точки',
                            'Absolute heading in degrees (45 = diagonal), pivots on the start point')}
                  aria-label=${T('Угол стены в градусах', 'Wall heading in degrees')}
                  .value=${host.editSelectedWallAngle != null ? host.editSelectedWallAngle.toFixed(0) : ''}
                  @change=${(e: Event) => onSetWallAngle(host, e)} />
              </div>
              ${host.editor && host.editor.selectedWallOpenings.length
                ? html`<div class="panel-group">${T('Проёмы в этой стене', 'Openings in this wall')}</div>
                    ${host.editor.selectedWallOpenings.map(
                      (o, i) => html`<div class="toolrow">
                        <span class="hint">${openingKindLabel(host, o.kind)} · ${T('от начала', 'from the start')} ${o.position.toFixed(1)} ${T('м', 'm')} · ${T('ширина', 'width')} ${o.width.toFixed(1)} ${T('м', 'm')}</span>
                        ${edBtn(host, { icon: 'trash', label: T('Удалить', 'Delete'),
                          hint: T('Удалить этот проём', 'Delete this opening'), onClick: () => onDeleteWallOpening(host, i) })}
                      </div>`,
                    )}`
                : nothing}`
            : nothing}
          ${kind === 'room' && host.editRoom?.shape
            ? html`<div class="toolrow">
                  <input class="name-input" type="text" placeholder=${T('Название комнаты', 'Room name')}
                    aria-label=${T('Название комнаты', 'Room name')}
                    .value=${host.editRoom.name ?? ''}
                    @change=${(e: Event) => onSetRoomField(host, 'name', e)} />
                </div>
                <div class="toolrow">
                  <span class="hint">${T('Ширина', 'W')}</span>
                  <input class="num-input" type="text" inputmode="decimal" min="0.5" step="0.1"
                    aria-label=${T('Ширина комнаты, м', 'Room width, m')}
                    .value=${(host.editRoom.width ?? 0).toFixed(1)}
                    @change=${(e: Event) => onSetRoomField(host, 'width', e)} />
                  <span class="hint">${T('Глубина', 'D')}</span>
                  <input class="num-input" type="text" inputmode="decimal" min="0.5" step="0.1"
                    aria-label=${T('Глубина комнаты, м', 'Room depth, m')}
                    .value=${(host.editRoom.depth ?? 0).toFixed(1)}
                    @change=${(e: Event) => onSetRoomField(host, 'depth', e)} />
                </div>
                <div class="toolrow">
                  <span class="hint">${T('Высота', 'Height')}</span>
                  <input class="num-input" type="text" inputmode="decimal" min="1" step="0.1"
                    aria-label=${T('Высота комнаты, м', 'Room height, m')}
                    .value=${(host.editRoom.height ?? 2.6).toFixed(1)}
                    @change=${(e: Event) => onSetRoomField(host, 'height', e)} />
                  <span class="hint">${T('Поворот, °', 'Rot°')}</span>
                  <input class="num-input" type="text" inputmode="decimal" step="15"
                    aria-label=${T('Поворот комнаты в градусах', 'Room rotation in degrees')}
                    .value=${Math.round(host.editRoom.rotation ?? 0).toString()}
                    @change=${(e: Event) => onSetRoomField(host, 'rotation', e)} />
                </div>
                <span class="hint">${T(
                  'тянуть за тело — двигать · за кольцо — вращать · за углы — растягивать · Shift — без привязки',
                  'drag body=move · ring=rotate · corners=resize · Shift=no snap',
                )}</span>
                ${host.editor && host.editor.selectedRoomOpenings.length
                  ? html`<div class="panel-group">${T('Проёмы в этой комнате', 'Openings in this room')}</div>
                      ${host.editor.selectedRoomOpenings.map(
                        (o, i) => html`<div class="toolrow">
                          <span class="hint">${openingKindLabel(host, o.kind)} · ${T('ширина', 'width')} ${o.width.toFixed(1)} ${T('м', 'm')}</span>
                          ${edBtn(host, { icon: 'trash', label: T('Удалить', 'Delete'),
                            hint: T('Удалить этот проём', 'Delete this opening'), onClick: () => onDeleteRoomOpening(host, i) })}
                        </div>`,
                      )}`
                  : nothing}`
            : nothing}
          ${isFurniture && host.hass
            ? (() => {
                const model = host.editSelectedObjModel ?? '';
                const domains = host.editShowAllEntities || !model ? [] : entityDomainsFor(model);
                const { ids, fellBack } = candidateEntities(host, domains);
                const q = host.editEntitySearch.trim().toLowerCase();
                const fids = q
                  ? ids.filter((id) => entityOptionText(host, id).toLowerCase().includes(q))
                  : ids;
                const vc = ventCount(model);
                const hint = (bound: string | null) =>
                  bound
                    ? T(`привязано: ${bound}`, `bound: ${bound}`)
                    : fellBack
                      ? T(`сущностей: ${ids.length} (подходящих ${domains.join(' / ')} не нашлось)`,
                          `${ids.length} entities (no ${domains.join(' / ')} found)`)
                      : domains.length
                        ? T(`сущностей ${domains.join(' / ')}: ${ids.length} — «Все» покажет остальные`,
                            `${ids.length} ${domains.join(' / ')} entities (tap All for every entity)`)
                        : T(`сущностей: ${ids.length}`, `${ids.length} entities`);
                // One picker normally; a roof lantern gets one cover picker per
                // opening window so its two vents bind to two covers.
                const picker = (part: number, label: string | null) => {
                  const bound = host.editor?.selectedEntityPart(part) ?? null;
                  return html`
                    ${label ? html`<div class="panel-group">${label}</div>` : nothing}
                    <div class="toolrow">
                      <select class="select wide" size=${vc >= 2 ? 4 : 6}
                        aria-label=${T('Привязать сущность Home Assistant', 'Bind a Home Assistant entity')}
                        @change=${(e: Event) => onPickEntityPart(host, e, part)}>
                        <option value="" ?selected=${!bound}>${T('— привязать сущность —', '— bind entity —')}</option>
                        ${fids.map(
                          (id) => html`<option value=${id} ?selected=${id === bound} title=${id}>
                            ${entityOptionText(host, id)}
                          </option>`,
                        )}
                      </select>
                      ${part === 0
                        ? html`${edBtn(host, {
                            icon: 'grid', label: T('Все', 'All'),
                            hint: T('Показать все сущности, не только подходящие по типу', 'Show all entities (ignore type filter)'),
                            cls: host.editShowAllEntities ? 'active' : '',
                            onClick: () => (host.editShowAllEntities = !host.editShowAllEntities),
                          })}`
                        : nothing}
                    </div>
                    <span class="hint">${hint(bound)}</span>`;
                };
                return html`<div class="toolrow search-row">
                    <span class="search-ic">${host.ic('search')}</span>
                    <input class="select wide" type="search"
                      placeholder=${T('поиск сущности или комнаты…', 'search entity / room…')}
                      aria-label=${T('Поиск сущности', 'Search entities')}
                      .value=${host.editEntitySearch}
                      @input=${(e: Event) => (host.editEntitySearch = (e.target as HTMLInputElement).value)} />
                  </div>
                  ${vc >= 2
                    ? Array.from({ length: vc }, (_, i) => picker(i, `${host.t('Window')} ${i + 1}`))
                    : picker(0, null)}`;
              })()
            : nothing}`
        : nothing}

      ${tool === 'select' && !kind
        ? html`<span class="hint">${T(
            'касание — выбрать · мебель ТЯНИТЕ, чтобы передвинуть · за конец стены — изменить её',
            'tap to select · DRAG furniture to move it · drag a wall end to reshape',
          )}</span>`
        : nothing}
      ${tool === 'door' || tool === 'window'
        ? html`<span class="hint">${T(
            `коснитесь стены, чтобы поставить: ${openingKindLabel(host, tool)}`,
            `tap a wall to add a ${tool}`,
          )}</span>`
        : nothing}
      ${tool === 'wall'
        ? html`<span class="hint">${T(
            'две точки — одна стена · «Привязка» держит параллельность, прямой угол и равные длины · тянуть за пустое место — поворот камеры',
            'tap 2 points = 1 wall · Snap keeps parallel / right angles and equal lengths · drag empty space = orbit',
          )}</span>`
        : nothing}
  `;
}

/** Что именно сейчас выбрано — словами, а не служебным ключом (`floor`,
 *  `wall`, `opening` человеку ничего не говорят). */
function selectionName(host: BmsFloorplanCard, kind: string | null): string {
  if (kind === 'room') {
    return host.editRoom?.shape
      ? host.tx('комната', 'room')
      : host.tx('пол', 'floor');
  }
  return (
    {
      furniture: host.tx('предмет', 'furniture'),
      wall: host.tx('стена', 'wall'),
      opening: host.tx('проём', 'opening'),
    } as Record<string, string>
  )[kind ?? ''] ?? host.tx('ничего', 'nothing');
}

/** Русское название вида проёма (door / window / opening). */
export function openingKindLabel(host: BmsFloorplanCard, kind?: string): string {
  return (
    {
      door: host.tx('дверь', 'door'),
      window: host.tx('окно', 'window'),
      opening: host.tx('проём', 'opening'),
    } as Record<string, string>
  )[kind ?? ''] ?? (kind ?? '');
}
