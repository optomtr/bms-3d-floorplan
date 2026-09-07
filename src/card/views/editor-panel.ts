// ---------------------------------------------------------------------------
// Разметка панели редактора.
// ---------------------------------------------------------------------------

import type { BmsFloorplanCard } from '../../ha-3d-floorplan-card';
import { FURNITURE_KEYS, LIGHT_KEYS, entityDomainsFor, ventCount } from '../../furniture/library';
import { getThumbnail } from '../../furniture/thumbnails';
import { DOOR_VARIANTS, WINDOW_VARIANTS } from '../../scene/builder';
import { FLOOR_MATERIALS, WALL_MATERIALS } from '../../scene/materials';
import { onAddFloor, onAddRoomShape, onAddZone, onAutoFloors, onCalibrateUnderlay, onClearZoneBg, onDeleteFloor, onDeleteRoomOpening, onDeleteSelected, onDeleteWallOpening, onDeleteZone, onEditTool, onFinishWall, onMergeWalls, onMoveZone, onMoveZoneEntity, onNudgeHeight, onNudgeUnderlay, onPickEntityPart, onPickUnderlay, onRedo, onRemoveUnderlay, onRenameFloor, onRotateSelected, onSelectEditFloor, onSelectZone, onSetBrightness, onSetCameraDistance, onSetColor, onSetCount, onSetFurnScale, onSetMaterial, onSetOpeningKind, onSetOpeningVariant, onSetOpeningWidth, onSetRoomField, onSetSpread, onSetUnderlayField, onSetWallAngle, onSetWallLength, onSetZoneBg, onSetZoneName, onSetZoneParent, onSetZoneSensor, onSlideOpening, onToggleSnap, onToggleZoneDevice, onUndo, onUndoPoint, onUploadZoneBg, onZonePlace, pickModel, togglePalette } from '../editor-commands';
import { boundElsewhere, candidateEntities, entityOptionText, entityShort, sensorCandidates } from '../entities';
import { hasEditPin, onRemoveEditPin, onSetEditPin } from '../pin';
import { onDeleteProject, onExportPlan, onNewPlan, onOpenImport, onRenamePlan, onSavePlan, onScanLegacy, onSelectStorageProject } from '../projects';
import { html, nothing } from 'lit';

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

export function renderEditor(host: BmsFloorplanCard) {
  const tool = host.editTool;
  const label = (k: string) =>
    k.replace(/_/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
  const furnitureKeys = FURNITURE_KEYS.filter((k) => !LIGHT_KEYS.includes(k));
  const kind = host.editSelectedKind;
  const hasSelection = tool === 'select' && !!kind;
  const isFurniture = kind === 'furniture';

  return html`
    <div class="overlay top-left toolbar">
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
            (m) => html`<option value=${m} ?selected=${m === host.editAllWallMat}>${m}</option>`,
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
            (m) => html`<option value=${m} ?selected=${m === host.editAllFloorMat}>${m}</option>`,
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

      <div class="panel-group">Rooms — manual icon &amp; devices</div>
      <div class="toolrow">
        <button class="btn" title="Add a room control icon you place by hand"
          @click=${() => onAddZone(host)}>➕ Add room</button>
        ${host.editZones.length
          ? html`<select class="select" @change=${(e: Event) =>
              onSelectZone(host, (e.target as HTMLSelectElement).value || null)}>
              <option value="">— select —</option>
              ${host.editZones.map(
                (z) => html`<option value=${z.id} ?selected=${z.id === host.editSelectedZoneId}>${z.name || 'Room'}</option>`,
              )}
            </select>`
          : nothing}
      </div>
      ${host.editSelectedZoneId && host.editZones.length > 1
        ? (() => {
            const i = host.editZones.findIndex((z) => z.id === host.editSelectedZoneId);
            return html`<div class="toolrow">
              <span class="hint">Room order:</span>
              <button class="btn" title="Move room up" ?disabled=${i <= 0}
                @click=${() => onMoveZone(host, host.editSelectedZoneId!, -1)}>▲ Up</button>
              <button class="btn" title="Move room down" ?disabled=${i < 0 || i >= host.editZones.length - 1}
                @click=${() => onMoveZone(host, host.editSelectedZoneId!, 1)}>▼ Down</button>
            </div>`;
          })()
        : nothing}
      ${(() => {
        const z = host.editZones.find((x) => x.id === host.editSelectedZoneId);
        if (!z) return host.editZones.length
          ? html`<span class="hint">select a room to place its icon &amp; pick devices</span>`
          : html`<span class="hint">auto-groups devices by room; add a manual room to override a mis-detected one</span>`;
        const tOpts = sensorCandidates(host, 'temp', z.tempSensor);
        const fOpts = sensorCandidates(host, 'temp', z.floorSensor);
        const hOpts = sensorCandidates(host, 'humidity', z.humiditySensor);
        return html`<div class="toolrow">
            <input class="name-input" type="text" placeholder="Room name"
              .value=${z.name ?? ''} @input=${(e: Event) => onSetZoneName(host, z.id, e)} />
          </div>
          <div class="toolrow">
            <label class="hint">Внутри комнаты (подкомната):</label>
            <select class="select" @change=${(e: Event) => onSetZoneParent(host, z.id, e)}>
              <option value="" ?selected=${!z.parentId}>— (отдельная комната)</option>
              ${host.editZones
                .filter((o) => o.id !== z.id && !o.parentId)
                .map((o) => html`<option value=${o.id} ?selected=${z.parentId === o.id}>${o.name || 'Room'}</option>`)}
            </select>
          </div>
          <div class="panel-group">Датчики комнаты (нет = пусто, без догадок)</div>
          <div class="toolrow">
            <label class="hint">Температура:</label>
            <select class="select" @change=${(e: Event) => onSetZoneSensor(host, z.id, 'temp', e)}>
              <option value="" ?selected=${!z.tempSensor}>— (нет)</option>
              ${tOpts.map((o) => html`<option value=${o.id} ?selected=${z.tempSensor === o.id}>${o.label}</option>`)}
            </select>
          </div>
          <div class="toolrow">
            <label class="hint">Температура пола:</label>
            <select class="select" @change=${(e: Event) => onSetZoneSensor(host, z.id, 'floor', e)}>
              <option value="" ?selected=${!z.floorSensor}>— (нет)</option>
              ${fOpts.map((o) => html`<option value=${o.id} ?selected=${z.floorSensor === o.id}>${o.label}</option>`)}
            </select>
          </div>
          <div class="toolrow">
            <label class="hint">Влажность:</label>
            <select class="select" @change=${(e: Event) => onSetZoneSensor(host, z.id, 'humidity', e)}>
              <option value="" ?selected=${!z.humiditySensor}>— (нет)</option>
              ${hOpts.map((o) => html`<option value=${o.id} ?selected=${z.humiditySensor === o.id}>${o.label}</option>`)}
            </select>
          </div>
          <div class="toolrow">
            <button class="btn ${host.editZonePlacing ? 'active' : ''}" title="Then tap the floor"
              @click=${() => onZonePlace(host)}>📍 ${host.editZonePlacing ? 'Tap the floor…' : 'Place icon'}</button>
            <button class="btn" title="Delete this room" @click=${() => onDeleteZone(host, z.id)}>🗑 Delete</button>
          </div>
          <div class="panel-group">Фон комнаты (виден на планшете при выборе)</div>
          <div class="toolrow">
            <input class="name-input" type="text" placeholder="URL или /local/room.jpg"
              .value=${z.bgImage && !z.bgImage.startsWith('data:') ? z.bgImage : ''}
              @change=${(e: Event) => onSetZoneBg(host, z.id, e)} />
          </div>
          <div class="toolrow">
            <label class="btn" title="Загрузить фото с устройства">📷 Загрузить<input
              type="file" accept="image/*" style="display:none"
              @change=${(e: Event) => onUploadZoneBg(host, z.id, e)} /></label>
            ${z.bgImage
              ? html`<button class="btn" title="Убрать фон" @click=${() => onClearZoneBg(host, z.id)}>🗑</button>
                  <span class="hint">${z.bgImage.startsWith('data:') ? 'фото загружено' : 'задан URL'}</span>`
              : html`<span class="hint">не задан</span>`}
          </div>
          ${z.entities.length
            ? html`<span class="hint">In this room — order (▲▼), ✕ removes:</span>
                <div class="zone-order">
                  ${z.entities.map(
                    (eid, i) => html`<div class="zrow">
                      <span class="zname" title=${eid}>${entityShort(host, eid)}</span>
                      <button class="zbtn" title="Move up" ?disabled=${i === 0}
                        @click=${() => onMoveZoneEntity(host, z.id, eid, -1)}>▲</button>
                      <button class="zbtn" title="Move down" ?disabled=${i === z.entities.length - 1}
                        @click=${() => onMoveZoneEntity(host, z.id, eid, 1)}>▼</button>
                      <button class="zbtn del" title="Remove from room"
                        @click=${() => onToggleZoneDevice(host, z.id, eid)}>✕</button>
                    </div>`,
                  )}
                </div>`
            : nothing}
          ${(() => {
            // A room is an EXPLICIT device list, so offer every entity Home
            // Assistant knows — not only the ones bound to a 3D model. The
            // scene already gives an unbound entity its domain as behaviour,
            // so it lands in the right panel category with full controls and
            // nothing has to be drawn for it.
            const q = host.editZoneSearch.trim().toLowerCase();
            const pool = candidateEntities(host, []).ids.filter((id) => !z.entities.includes(id));
            const hits = q ? pool.filter((id) => entityOptionText(host, id).toLowerCase().includes(q)) : pool;
            const LIMIT = 60; // a whole house is thousands of entities — keep the DOM sane
            const shown = hits.slice(0, LIMIT);
            return html`<div class="panel-group">Добавить устройство в комнату</div>
              <div class="toolrow">
                <input class="select wide" type="search"
                  placeholder="🔍 имя, комната или entity_id…"
                  .value=${host.editZoneSearch}
                  @input=${(e: Event) => (host.editZoneSearch = (e.target as HTMLInputElement).value)} />
              </div>
              ${shown.length
                ? html`<div class="zone-devs">
                      ${shown.map((id) => {
                        const taken = boundElsewhere(host, id, z.id);
                        return html`<label class="zone-dev ${taken ? 'taken' : ''}"
                          title=${entityOptionText(host, id)}>
                          <input type="checkbox" @change=${() => onToggleZoneDevice(host, z.id, id)} />
                          <span>${entityShort(host, id)}${taken ? html`<em class="taken-tag"> · ${taken}</em>` : nothing}</span>
                        </label>`;
                      })}
                    </div>
                    ${hits.length > LIMIT
                      ? html`<span class="hint">показано ${LIMIT} из ${hits.length} — уточните поиск</span>`
                      : nothing}`
                : html`<span class="hint">ничего не найдено</span>`}`;
          })()}`;
      })()}

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
              ${label(host.editSelectedModel)} ▾
            </button>
            <span class="hint">tap floor to place</span>
          </div>
          ${host.paletteOpen
            ? (() => {
                const q = host.editFurnSearch.trim().toLowerCase();
                const match = (k: string) => !q || label(k).toLowerCase().includes(q) || k.includes(q);
                const lights = LIGHT_KEYS.filter(match);
                const furn = furnitureKeys.filter(match);
                return html`<div class="palette">
                  <input class="select wide" type="search" placeholder="🔍 search models…"
                    .value=${host.editFurnSearch}
                    @input=${(e: Event) => (host.editFurnSearch = (e.target as HTMLInputElement).value)} />
                  ${lights.length
                    ? html`<div class="palette-group">Lighting</div>
                        <div class="palette-grid">
                          ${lights.map((k) => renderPaletteCell(host, k, label(k)))}
                        </div>`
                    : nothing}
                  ${furn.length
                    ? html`<div class="palette-group">Furniture</div>
                        <div class="palette-grid">
                          ${furn.map((k) => renderPaletteCell(host, k, label(k)))}
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
                          (v) => html`<option value=${v} ?selected=${v === host.editOpeningVariant}>${v}</option>`,
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
                          (m) => html`<option value=${m} ?selected=${m === host.editMaterial}>${m}</option>`,
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
    </div>
  `;
}
