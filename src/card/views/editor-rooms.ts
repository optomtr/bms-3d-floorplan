// ---------------------------------------------------------------------------
// Панель редактора, раздел «Комнаты»: ручные зоны, их датчики, фон и
// список устройств.
// ---------------------------------------------------------------------------

import { html, nothing } from 'lit';
import type { BmsFloorplanCard } from '../../ha-3d-floorplan-card';
import { onAddZone, onClearZoneBg, onDeleteZone, onMoveZone, onMoveZoneEntity, onSelectZone, onSetZoneBg, onSetZoneName, onSetZoneParent, onSetZoneSensor, onToggleZoneDevice, onUploadZoneBg, onZonePlace } from '../editor-commands';
import { boundElsewhere, candidateEntities, entityOptionText, entityShort, sensorCandidates } from '../entities';

/** Раздел «Rooms — manual icon & devices» панели редактора. */
export function renderEditorRooms(host: BmsFloorplanCard) {
  return html`
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
  `;
}
