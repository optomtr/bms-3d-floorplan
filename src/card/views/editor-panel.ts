// ---------------------------------------------------------------------------
// Панель редактора: оболочка и первый экран — отмена/повтор, инструменты,
// части здания, подложка, поверхности и этажи.
//
// Разделы вынесены в соседние файлы (editor-rooms / editor-selection /
// editor-project) и вставляются сюда как вложенные шаблоны Lit: DOM внутри
// .toolbar остаётся тем же, поэтому правило `.toolbar > *` работает как
// работало.
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

/** Верх панели: отмена/повтор, инструменты, части здания, подложка,
 *  поверхности и этажи. */
function renderEditorTools(host: BmsFloorplanCard) {
  const tool = host.editTool;

  return html`
      <div class="ed-head"><span>✎ Editor</span></div>

      <div class="grid2">
        <button class="btn" title="Undo (Ctrl+Z)" ?disabled=${!host.editCanUndo}
          @click=${() => onUndo(host)}>↶ Undo</button>
        <button class="btn" title="Redo (Ctrl+Y)" ?disabled=${!host.editCanRedo}
          @click=${() => onRedo(host)}>↷ Redo</button>
        <button class="btn" title="Merge duplicate / overlapping walls into one"
          @click=${() => onMergeWalls(host)}>🧹 Merge</button>
        <button class="btn" title="Fill every closed wall loop with a floor"
          @click=${() => onAutoFloors(host)}>▦ Auto floors</button>
      </div>

      <div class="panel-group">Tools</div>
      <div class="grid2">
        <button class="btn ${tool === 'wall' ? 'active' : ''}" title="Draw walls"
          @click=${() => onEditTool(host, 'wall')}>▟ Wall</button>
        <button class="btn ${tool === 'arc' ? 'active' : ''}" title="Curved wall — tap start, tap end, then move to bulge the arc and tap"
          @click=${() => onEditTool(host, 'arc')}>◜ Curve</button>
        <button class="btn ${tool === 'door' ? 'active' : ''}" title="Add a door — tap a wall"
          @click=${() => onEditTool(host, 'door')}>🚪 Door</button>
        <button class="btn ${tool === 'window' ? 'active' : ''}" title="Add a window — tap a wall"
          @click=${() => onEditTool(host, 'window')}>🪟 Window</button>
        <button class="btn ${tool === 'opening' ? 'active' : ''}" title="Add an open passage (no door) — tap a wall"
          @click=${() => onEditTool(host, 'opening')}>⬚ Opening</button>
        <button class="btn ${tool === 'floor' ? 'active' : ''}" title="Trace a floor: tap corners, tap start (or Finish) to close"
          @click=${() => onEditTool(host, 'floor')}>▱ Floor</button>
        <button class="btn ${tool === 'furniture' ? 'active' : ''}" title="Place furniture"
          @click=${() => onEditTool(host, 'furniture')}>🛋 Furniture</button>
        <button class="btn span2 ${tool === 'select' ? 'active' : ''}" title="Select / move / bind (camera always works: drag empty = orbit)"
          @click=${() => onEditTool(host, 'select')}>☝ Select</button>
      </div>
      ${tool === 'arc'
        ? html`<span class="hint">Curve: tap start · tap end · move to bend the arc · tap to place (Finish/Esc cancels)</span>`
        : nothing}
      <span class="hint">Camera always on: drag empty space = orbit · two fingers = pan/zoom · tap = act</span>

      <div class="panel-group">Building parts — drop a room</div>
      <div class="grid2">
        <button class="btn" title="Rectangle room" @click=${() => onAddRoomShape(host, 'rect')}>▭ Rect</button>
        <button class="btn" title="L-shaped room" @click=${() => onAddRoomShape(host, 'lshape')}>L L-shape</button>
        <button class="btn span2" title="Bevelled room" @click=${() => onAddRoomShape(host, 'bevel')}>⬡ Bevel</button>
      </div>
      <span class="hint">then drag / rotate / resize it</span>

      <div class="panel-group">Reference image — trace a 2D plan</div>
      ${host.editUnderlay
        ? html`<div class="toolrow">
              <label class="hint">Width (m):</label>
              <input class="num-input" type="text" inputmode="decimal" min="0.5" step="0.1"
                .value=${String(host.editUnderlay.widthM)}
                @change=${(e: Event) => onSetUnderlayField(host, 'widthM', e)} />
              <label class="hint">Opacity:</label>
              <input type="range" min="0.05" max="1" step="0.05"
                .value=${String(host.editUnderlay.opacity ?? 0.6)}
                @input=${(e: Event) => onSetUnderlayField(host, 'opacity', e)} />
              <label class="hint">Rotate°:</label>
              <input class="num-input" type="text" inputmode="decimal" step="1"
                .value=${String(host.editUnderlay.rotation ?? 0)}
                @change=${(e: Event) => onSetUnderlayField(host, 'rotation', e)} />
            </div>
            <div class="toolrow">
              <span class="hint">Move:</span>
              <button class="btn" @click=${() => onNudgeUnderlay(host, -0.25, 0)}>◀</button>
              <button class="btn" @click=${() => onNudgeUnderlay(host, 0.25, 0)}>▶</button>
              <button class="btn" @click=${() => onNudgeUnderlay(host, 0, -0.25)}>▲</button>
              <button class="btn" @click=${() => onNudgeUnderlay(host, 0, 0.25)}>▼</button>
              <button class="btn" title="Set scale by tapping two points of known length"
                @click=${() => onCalibrateUnderlay(host)}>📏 Calibrate (2 pts)</button>
              <button class="btn" title="Remove reference image" @click=${() => onRemoveUnderlay(host)}>🗑 Remove</button>
            </div>`
        : html`<div class="toolrow">
            <label class="btn" title="Import a top-down 2D plan image to trace over">
              📷 Import image
              <input type="file" accept="image/*" style="display:none"
                @change=${(e: Event) => onPickUnderlay(host, e)} />
            </label>
            <span class="hint">then set its width (m) and draw walls over it</span>
          </div>`}

      <div class="panel-group">Surfaces — color &amp; wallpaper</div>
      <div class="toolrow">
        <span class="hint">Walls</span>
        <input class="color" type="color" title="Color for ALL walls"
          .value=${host.editAllWallColor}
          @change=${(e: Event) => {
            host.editAllWallColor = (e.target as HTMLInputElement).value;
            host.editor?.setAllWallsColor(host.editAllWallColor);
          }} />
        <select class="select" title="Wallpaper for ALL walls"
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
        <span class="hint">Floor</span>
        <input class="color" type="color" title="Color for ALL floors"
          .value=${host.editAllFloorColor}
          @change=${(e: Event) => {
            host.editAllFloorColor = (e.target as HTMLInputElement).value;
            host.editor?.setAllFloorsColor(host.editAllFloorColor);
          }} />
        <select class="select" title="Material for ALL floors"
          @change=${(e: Event) => {
            host.editAllFloorMat = (e.target as HTMLSelectElement).value;
            host.editor?.setAllFloorsMaterial(host.editAllFloorMat);
          }}>
          ${FLOOR_MATERIALS.map(
            (m) => html`<option value=${m} ?selected=${m === host.editAllFloorMat}>${materialLabel(m)}</option>`,
          )}
        </select>
      </div>
      <span class="hint">applies to every wall / floor on this level (or select one to set it alone)</span>

      ${(() => {
        // Derive the floor list from the LIVE edit plan (not View-mode state),
        // so it stays correct after New / project switch while editing.
        const efloors = host.editor?.plan.floors ?? [];
        const curName = efloors[host.editFloorIndex]?.name ?? '';
        return html`<div class="panel-group">Floors</div>
        <div class="toolrow">
          ${efloors.length > 1
            ? html`<select class="select" @change=${(e: Event) => onSelectEditFloor(host, e)}>
                ${efloors.map(
                  (f, i) => html`<option value=${i} ?selected=${i === host.editFloorIndex}>
                    ${f.name || `Floor ${i + 1}`}
                  </option>`,
                )}
              </select>`
            : nothing}
          <button class="btn" title="Add a floor above" @click=${() => onAddFloor(host)}>➕ Floor</button>
          ${efloors.length > 1
            ? html`<button class="btn" title="Delete this floor" @click=${() => onDeleteFloor(host)}>🗑</button>`
            : nothing}
        </div>
        <div class="toolrow">
          <input class="name-input" type="text" placeholder="Floor name"
            .value=${curName}
            title="Rename this floor"
            @input=${(e: Event) => onRenameFloor(host, e)} />
        </div>
        <div class="toolrow">
          <span class="hint">View distance:</span>
          <input type="range" min="0.4" max="2" step="0.05"
            .value=${String(host.editCameraDistance)}
            title="Default camera distance on Reset (saved with the project)"
            @input=${(e: Event) => onSetCameraDistance(host, e)} />
        </div>`;
      })()}
  `;
}
