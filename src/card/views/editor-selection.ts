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
  const tool = host.editTool;
  const kind = host.editSelectedKind;
  const hasSelection = tool === 'select' && !!kind;
  const isFurniture = kind === 'furniture';

  return html`
      ${tool === 'wall' || tool === 'floor'
        ? html`<div class="toolrow">
            <button class="btn" title="Remove the last point" @click=${() => onUndoPoint(host)}>⤺ Undo point</button>
            <button class="btn" title="Finish this run (Enter)" @click=${() => onFinishWall(host)}>✓ Finish</button>
            <button class="btn ${host.editSnap ? 'active' : ''}"
              title="Snap assist: parallel/perpendicular angles, equal lengths, alignment"
              @click=${() => onToggleSnap(host)}>🧲 Snap</button>
            <span class="hint">${tool === 'floor'
              ? 'trace a floor: tap corners · tap start (or Finish) to close'
              : 'tap to add points · tap start to close (adds floor) · Finish/Enter to end'}</span>
          </div>`
        : nothing}

      ${tool === 'furniture'
        ? html`<div class="toolrow">
            <button class="btn palette-btn" title="Choose a model" @click=${() => togglePalette(host)}>
              <img class="palette-thumb" src=${getThumbnail(host.editSelectedModel)} alt="" />
              ${modelLabel(host.editSelectedModel)} ▾
            </button>
            <span class="hint">tap floor to place</span>
          </div>
          ${host.paletteOpen
            ? (() => {
                const q = host.editFurnSearch.trim().toLowerCase();
                const match = (k: string) => !q || modelLabel(k).toLowerCase().includes(q) || k.includes(q);
                const lights = LIGHT_KEYS.filter(match);
                const furn = FURNITURE_ONLY.filter(match);
                return html`<div class="palette">
                  <input class="select wide" type="search" placeholder="🔍 search models…"
                    .value=${host.editFurnSearch}
                    @input=${(e: Event) => (host.editFurnSearch = (e.target as HTMLInputElement).value)} />
                  ${lights.length
                    ? html`<div class="palette-group">Lighting</div>
                        <div class="palette-grid">
                          ${lights.map((k) => renderPaletteCell(host, k, modelLabel(k)))}
                        </div>`
                    : nothing}
                  ${furn.length
                    ? html`<div class="palette-group">Furniture</div>
                        <div class="palette-grid">
                          ${furn.map((k) => renderPaletteCell(host, k, modelLabel(k)))}
                        </div>`
                    : nothing}
                  ${!lights.length && !furn.length
                    ? html`<span class="hint">no models match "${host.editFurnSearch}"</span>`
                    : nothing}
                </div>`;
              })()
            : nothing}`
        : nothing}

      ${hasSelection
        ? html`<div class="toolrow">
            <span class="hint">${kind === 'room' && !host.editRoom?.shape ? 'floor' : kind} selected</span>
            ${isFurniture
              ? html`<button class="btn" title="Rotate 45°" @click=${() => onRotateSelected(host)}>⟳ Rotate</button>
                  <button class="btn" title="Lower" @click=${() => onNudgeHeight(host, -0.1)}>▼ Down</button>
                  <button class="btn" title="Raise" @click=${() => onNudgeHeight(host, 0.1)}>▲ Up</button>`
              : nothing}
            ${kind === 'opening'
              ? html`<button class="btn" title="Slide left along the wall" @click=${() => onSlideOpening(host, -0.1)}>◀ Left</button>
                  <button class="btn" title="Slide right along the wall" @click=${() => onSlideOpening(host, 0.1)}>Right ▶</button>`
              : nothing}
            <button class="btn" title="Delete the selected item" @click=${() => onDeleteSelected(host)}>🗑 Delete</button>
          </div>
          ${isFurniture && host.editIsLight
            ? html`<div class="toolrow">
                <span class="hint">Brightness:</span>
                <input type="range" min="0" max="1" step="0.05"
                  .value=${String(host.editBrightness)}
                  title="Manual glow level (bound light overrides)"
                  @input=${(e: Event) => onSetBrightness(host, e)} />
              </div>`
            : nothing}
          ${isFurniture && host.editIsLightSet
            ? html`<div class="toolrow">
                  <span class="hint">Spread:</span>
                  <input type="range" min="0.6" max="10" step="0.1"
                    .value=${String(host.editSpread)}
                    title="Spacing between elements (each keeps its size)"
                    @input=${(e: Event) => onSetSpread(host, e)} />
                </div>
                ${host.editSelectedObjModel === 'spotlight_bar'
                  ? html`<div class="toolrow">
                      <span class="hint">Spots:</span>
                      <input class="num-input" type="text" inputmode="decimal" min="1" max="12" step="1"
                        .value=${String(host.editCount)}
                        @change=${(e: Event) => onSetCount(host, e)} />
                    </div>`
                  : nothing}`
            : nothing}
          ${kind === 'opening'
            ? html`<div class="toolrow">
                  <span class="hint">Type:</span>
                  <select class="select" @change=${(e: Event) => onSetOpeningKind(host, e)}>
                    ${['door', 'window', 'opening'].map(
                      (k) => html`<option value=${k} ?selected=${k === host.editOpeningKind}>${k}</option>`,
                    )}
                  </select>
                </div>
                ${host.editOpeningKind !== 'opening'
                  ? html`<div class="toolrow">
                      <span class="hint">Style:</span>
                      <select class="select" @change=${(e: Event) => onSetOpeningVariant(host, e)}>
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
                  <span class="hint">Width (m):</span>
                  <input class="num-input" type="text" inputmode="decimal" min="0.3" step="0.1"
                    .value=${host.editOpeningWidth != null ? host.editOpeningWidth.toFixed(2) : ''}
                    @change=${(e: Event) => onSetOpeningWidth(host, e)} />
                </div>`
            : nothing}
          ${kind !== 'opening'
            ? html`<div class="toolrow">
                <span class="hint">Color:</span>
                <input
                  class="color"
                  type="color"
                  .value=${host.editSelectedColor ?? (kind === 'room' ? '#c6a87e' : kind === 'wall' ? '#dcc3a0' : '#ffffff')}
                  @input=${(e: Event) => onSetColor(host, e)}
                />
                ${kind === 'wall' || kind === 'room'
                  ? html`<span class="hint">${kind === 'room' ? 'Floor' : 'Wall'}:</span>
                      <select class="select" @change=${(e: Event) => onSetMaterial(host, e)}>
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
                <span class="hint">Size</span>
                <input class="num-input" type="text" inputmode="decimal" min="0.1" step="0.1" title="Width"
                  .value=${host.editFurnScale[0].toFixed(1)}
                  @change=${(e: Event) => onSetFurnScale(host, 0, e)} />
                <input class="num-input" type="text" inputmode="decimal" min="0.1" step="0.1" title="Height"
                  .value=${host.editFurnScale[1].toFixed(1)}
                  @change=${(e: Event) => onSetFurnScale(host, 1, e)} />
                <input class="num-input" type="text" inputmode="decimal" min="0.1" step="0.1" title="Depth"
                  .value=${host.editFurnScale[2].toFixed(1)}
                  @change=${(e: Event) => onSetFurnScale(host, 2, e)} />
              </div>`
            : nothing}
          ${kind === 'wall'
            ? html`<div class="toolrow">
                <span class="hint">Length (m):</span>
                <input
                  class="num-input"
                  type="text"
                  inputmode="decimal"
                  min="0.1"
                  step="0.1"
                  .value=${host.editSelectedWallLength != null ? host.editSelectedWallLength.toFixed(2) : ''}
                  @change=${(e: Event) => onSetWallLength(host, e)}
                />
                <span class="hint">or drag the wall's end point</span>
              </div>
              <div class="toolrow">
                <span class="hint">Thickness (m):</span>
                <input class="num-input" type="text" inputmode="decimal" min="0.05" step="0.01" title="Wall thickness in meters (e.g. 0.25, 0.38, 0.78)"
                  .value=${host.editSelectedWallThickness != null ? host.editSelectedWallThickness.toFixed(2) : ''}
                  @change=${host.onSetWallThickness} />
                <span class="hint">Angle (°):</span>
                <input class="num-input" type="text" inputmode="decimal" step="1" title="Absolute heading in degrees (45 = diagonal), pivots on the start point"
                  .value=${host.editSelectedWallAngle != null ? host.editSelectedWallAngle.toFixed(0) : ''}
                  @change=${(e: Event) => onSetWallAngle(host, e)} />
              </div>
              ${host.editor && host.editor.selectedWallOpenings.length
                ? html`<div class="panel-group">Openings (tap 🗑 to remove)</div>
                    ${host.editor.selectedWallOpenings.map(
                      (o, i) => html`<div class="toolrow">
                        <span class="hint">${o.kind} @ ${o.position.toFixed(1)}m · ${o.width.toFixed(1)}m</span>
                        <button class="btn" title="Delete this opening"
                          @click=${() => onDeleteWallOpening(host, i)}>🗑</button>
                      </div>`,
                    )}`
                : nothing}`
            : nothing}
          ${kind === 'room' && host.editRoom?.shape
            ? html`<div class="toolrow">
                  <input class="name-input" type="text" placeholder="Room name"
                    .value=${host.editRoom.name ?? ''}
                    @change=${(e: Event) => onSetRoomField(host, 'name', e)} />
                </div>
                <div class="toolrow">
                  <span class="hint">W</span>
                  <input class="num-input" type="text" inputmode="decimal" min="0.5" step="0.1"
                    .value=${(host.editRoom.width ?? 0).toFixed(1)}
                    @change=${(e: Event) => onSetRoomField(host, 'width', e)} />
                  <span class="hint">D</span>
                  <input class="num-input" type="text" inputmode="decimal" min="0.5" step="0.1"
                    .value=${(host.editRoom.depth ?? 0).toFixed(1)}
                    @change=${(e: Event) => onSetRoomField(host, 'depth', e)} />
                </div>
                <div class="toolrow">
                  <span class="hint">Height</span>
                  <input class="num-input" type="text" inputmode="decimal" min="1" step="0.1"
                    .value=${(host.editRoom.height ?? 2.6).toFixed(1)}
                    @change=${(e: Event) => onSetRoomField(host, 'height', e)} />
                  <span class="hint">Rot°</span>
                  <input class="num-input" type="text" inputmode="decimal" step="15"
                    .value=${Math.round(host.editRoom.rotation ?? 0).toString()}
                    @change=${(e: Event) => onSetRoomField(host, 'rotation', e)} />
                </div>
                <span class="hint">drag body=move · ring=rotate · corners=resize · Shift=no snap</span>
                ${host.editor && host.editor.selectedRoomOpenings.length
                  ? html`<div class="panel-group">Openings (tap 🗑 to remove)</div>
                      ${host.editor.selectedRoomOpenings.map(
                        (o, i) => html`<div class="toolrow">
                          <span class="hint">${o.kind} · ${o.width.toFixed(1)}m</span>
                          <button class="btn" title="Delete this opening"
                            @click=${() => onDeleteRoomOpening(host, i)}>🗑</button>
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
                    ? `bound: ${bound}`
                    : fellBack
                      ? `${ids.length} entities (no ${domains.join(' / ')} found)`
                      : domains.length
                        ? `${ids.length} ${domains.join(' / ')} entities (tap All for every entity)`
                        : `${ids.length} entities`;
                // One picker normally; a roof lantern gets one cover picker per
                // opening window so its two vents bind to two covers.
                const picker = (part: number, label: string | null) => {
                  const bound = host.editor?.selectedEntityPart(part) ?? null;
                  return html`
                    ${label ? html`<div class="panel-group">${label}</div>` : nothing}
                    <div class="toolrow">
                      <select class="select wide" size=${vc >= 2 ? 4 : 6}
                        @change=${(e: Event) => onPickEntityPart(host, e, part)}>
                        <option value="" ?selected=${!bound}>— bind entity —</option>
                        ${fids.map(
                          (id) => html`<option value=${id} ?selected=${id === bound} title=${id}>
                            ${entityOptionText(host, id)}
                          </option>`,
                        )}
                      </select>
                      ${part === 0
                        ? html`<button class="btn ${host.editShowAllEntities ? 'active' : ''}"
                            title="Show all entities (ignore type filter)"
                            @click=${() => (host.editShowAllEntities = !host.editShowAllEntities)}>All</button>`
                        : nothing}
                    </div>
                    <span class="hint">${hint(bound)}</span>`;
                };
                return html`<div class="toolrow">
                    <input class="select wide" type="search" placeholder="🔍 search entity / room…"
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
        ? html`<span class="hint">tap to select · DRAG furniture to move it · drag a wall end to reshape</span>`
        : nothing}
      ${tool === 'door' || tool === 'window'
        ? html`<span class="hint">tap a wall to add a ${tool}</span>`
        : nothing}
      ${tool === 'wall'
        ? html`<span class="hint">tap 2 points = 1 wall · 🧲 snaps parallel/right-angle + equal length · drag empty space = orbit</span>`
        : nothing}
  `;
}
