// ---------------------------------------------------------------------------
// Панель редактора, раздел «Комнаты»: ручные зоны, их датчики, фон и
// список устройств.
// ---------------------------------------------------------------------------

import { html, nothing } from 'lit';
import type { BmsFloorplanCard } from '../../ha-3d-floorplan-card';
import { onAddZone, onClearZoneBg, onDeleteZone, onMoveZone, onMoveZoneEntity, onSelectZone, onSetZoneBg, onSetZoneName, onSetZoneParent, onSetZoneSensor, onToggleZoneDevice, onUploadZoneBg, onZonePlace } from '../editor-commands';
import { boundElsewhere, candidateEntities, entityOptionText, entityShort, sensorCandidates } from '../entities';
import { edBtn } from './editor-panel';

/** Раздел «Комнаты — свой значок и устройства» панели редактора. */
export function renderEditorRooms(host: BmsFloorplanCard) {
  const T = (ru: string, en: string) => host.tx(ru, en);
  return html`
      <div class="panel-group">${T('Комнаты — свой значок и устройства', 'Rooms — manual icon & devices')}</div>
      <div class="toolrow">
        ${edBtn(host, {
          icon: 'plus', label: T('Добавить комнату', 'Add room'),
          hint: T('Добавить значок комнаты и поставить его вручную', 'Add a room control icon you place by hand'),
          onClick: () => onAddZone(host),
        })}
        ${host.editZones.length
          ? html`<select class="select" aria-label=${T('Выбрать комнату', 'Select a room')}
              @change=${(e: Event) =>
              onSelectZone(host, (e.target as HTMLSelectElement).value || null)}>
              <option value="">${T('— выберите —', '— select —')}</option>
              ${host.editZones.map(
                (z) => html`<option value=${z.id} ?selected=${z.id === host.editSelectedZoneId}>${z.name || T('Комната', 'Room')}</option>`,
              )}
            </select>`
          : nothing}
      </div>
      ${host.editSelectedZoneId && host.editZones.length > 1
        ? (() => {
            const i = host.editZones.findIndex((z) => z.id === host.editSelectedZoneId);
            return html`<div class="toolrow">
              <span class="hint">${T('Порядок комнат:', 'Room order:')}</span>
              ${edBtn(host, {
                icon: 'arrowUp', label: T('Выше', 'Up'), hint: T('Поднять комнату в списке', 'Move the room up'),
                disabled: i <= 0, onClick: () => onMoveZone(host, host.editSelectedZoneId!, -1),
              })}
              ${edBtn(host, {
                icon: 'arrowDown', label: T('Ниже', 'Down'), hint: T('Опустить комнату в списке', 'Move the room down'),
                disabled: i < 0 || i >= host.editZones.length - 1,
                onClick: () => onMoveZone(host, host.editSelectedZoneId!, 1),
              })}
            </div>`;
          })()
        : nothing}
      ${(() => {
        const z = host.editZones.find((x) => x.id === host.editSelectedZoneId);
        if (!z) return host.editZones.length
          ? html`<span class="hint">${T(
              'выберите комнату, чтобы поставить её значок и отметить устройства',
              'select a room to place its icon & pick devices',
            )}</span>`
          : html`<span class="hint">${T(
              'устройства группируются по комнатам сами; добавьте комнату вручную, если группировка ошиблась',
              'auto-groups devices by room; add a manual room to override a mis-detected one',
            )}</span>`;
        const tOpts = sensorCandidates(host, 'temp', z.tempSensor);
        const fOpts = sensorCandidates(host, 'temp', z.floorSensor);
        const hOpts = sensorCandidates(host, 'humidity', z.humiditySensor);
        return html`<div class="toolrow">
            <input class="name-input" type="text" placeholder=${T('Название комнаты', 'Room name')}
              aria-label=${T('Название комнаты', 'Room name')}
              .value=${z.name ?? ''} @input=${(e: Event) => onSetZoneName(host, z.id, e)} />
          </div>
          <div class="toolrow">
            <label class="hint">${T('Внутри комнаты (подкомната):', 'Inside a room (sub-room):')}</label>
            <select class="select" aria-label=${T('Родительская комната', 'Parent room')}
              @change=${(e: Event) => onSetZoneParent(host, z.id, e)}>
              <option value="" ?selected=${!z.parentId}>${T('— (отдельная комната)', '— (a room of its own)')}</option>
              ${host.editZones
                .filter((o) => o.id !== z.id && !o.parentId)
                .map((o) => html`<option value=${o.id} ?selected=${z.parentId === o.id}>${o.name || T('Комната', 'Room')}</option>`)}
            </select>
          </div>
          <div class="panel-group">${T('Датчики комнаты (нет = пусто, без догадок)', 'Room sensors (none = blank, never guessed)')}</div>
          <div class="toolrow">
            <label class="hint">${T('Температура:', 'Temperature:')}</label>
            <select class="select" aria-label=${T('Датчик температуры воздуха', 'Air temperature sensor')}
              @change=${(e: Event) => onSetZoneSensor(host, z.id, 'temp', e)}>
              <option value="" ?selected=${!z.tempSensor}>${T('— (нет)', '— (none)')}</option>
              ${tOpts.map((o) => html`<option value=${o.id} ?selected=${z.tempSensor === o.id}>${o.label}</option>`)}
            </select>
          </div>
          <div class="toolrow">
            <label class="hint">${T('Температура пола:', 'Floor temperature:')}</label>
            <select class="select" aria-label=${T('Датчик температуры пола', 'Floor temperature sensor')}
              @change=${(e: Event) => onSetZoneSensor(host, z.id, 'floor', e)}>
              <option value="" ?selected=${!z.floorSensor}>${T('— (нет)', '— (none)')}</option>
              ${fOpts.map((o) => html`<option value=${o.id} ?selected=${z.floorSensor === o.id}>${o.label}</option>`)}
            </select>
          </div>
          <div class="toolrow">
            <label class="hint">${T('Влажность:', 'Humidity:')}</label>
            <select class="select" aria-label=${T('Датчик влажности', 'Humidity sensor')}
              @change=${(e: Event) => onSetZoneSensor(host, z.id, 'humidity', e)}>
              <option value="" ?selected=${!z.humiditySensor}>${T('— (нет)', '— (none)')}</option>
              ${hOpts.map((o) => html`<option value=${o.id} ?selected=${z.humiditySensor === o.id}>${o.label}</option>`)}
            </select>
          </div>
          <div class="toolrow">
            ${edBtn(host, {
              icon: 'pin',
              label: host.editZonePlacing ? T('Коснитесь пола…', 'Tap the floor…') : T('Поставить значок', 'Place the icon'),
              hint: T('Затем коснитесь пола в нужном месте', 'Then tap the floor where it should sit'),
              cls: host.editZonePlacing ? 'active' : '',
              onClick: () => onZonePlace(host),
            })}
            ${edBtn(host, {
              icon: 'trash', label: T('Удалить', 'Delete'), hint: T('Удалить эту комнату', 'Delete this room'),
              onClick: () => onDeleteZone(host, z.id),
            })}
          </div>
          <div class="panel-group">${T('Фон комнаты (виден на планшете при выборе)', 'Room photo (shown on the tablet when selected)')}</div>
          <div class="toolrow">
            <input class="name-input" type="text" placeholder=${T('URL или /local/room.jpg', 'A URL or /local/room.jpg')}
              aria-label=${T('Адрес фонового снимка комнаты', 'Room photo address')}
              .value=${z.bgImage && !z.bgImage.startsWith('data:') ? z.bgImage : ''}
              @change=${(e: Event) => onSetZoneBg(host, z.id, e)} />
          </div>
          <div class="toolrow">
            <label class="btn ic-btn" title=${T('Загрузить фото с устройства', 'Upload a photo from this device')}
              >${host.ic('camera')}<span class="ic-btn-lab">${T('Загрузить фото', 'Upload a photo')}</span><input
              type="file" accept="image/*" style="display:none"
              aria-label=${T('Загрузить фото комнаты', 'Upload a room photo')}
              @change=${(e: Event) => onUploadZoneBg(host, z.id, e)} /></label>
            ${z.bgImage
              ? html`${edBtn(host, {
                    icon: 'trash', label: T('Убрать фон', 'Remove the photo'),
                    hint: T('Убрать фон комнаты', 'Remove the room photo'),
                    onClick: () => onClearZoneBg(host, z.id),
                  })}
                  <span class="hint">${z.bgImage.startsWith('data:') ? T('фото загружено', 'photo uploaded') : T('задан URL', 'URL set')}</span>`
              : html`<span class="hint">${T('не задан', 'not set')}</span>`}
          </div>
          ${z.entities.length
            ? html`<span class="hint">${T('В этой комнате — порядок и удаление:', 'In this room — order and removal:')}</span>
                <div class="zone-order">
                  ${z.entities.map(
                    (eid, i) => html`<div class="zrow">
                      <span class="zname" title=${eid}>${entityShort(host, eid)}</span>
                      <button class="zbtn" title=${T('Поднять', 'Move up')}
                        aria-label=${`${entityShort(host, eid)} — ${T('поднять в списке', 'move up')}`}
                        ?disabled=${i === 0}
                        @click=${() => onMoveZoneEntity(host, z.id, eid, -1)}>${host.ic('arrowUp')}</button>
                      <button class="zbtn" title=${T('Опустить', 'Move down')}
                        aria-label=${`${entityShort(host, eid)} — ${T('опустить в списке', 'move down')}`}
                        ?disabled=${i === z.entities.length - 1}
                        @click=${() => onMoveZoneEntity(host, z.id, eid, 1)}>${host.ic('arrowDown')}</button>
                      <button class="zbtn del" title=${T('Убрать из комнаты', 'Remove from the room')}
                        aria-label=${`${entityShort(host, eid)} — ${T('убрать из комнаты', 'remove from the room')}`}
                        @click=${() => onToggleZoneDevice(host, z.id, eid)}>${host.ic('close')}</button>
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
            return html`<div class="panel-group">${T('Добавить устройство в комнату', 'Add a device to the room')}</div>
              <div class="toolrow search-row">
                <span class="search-ic">${host.ic('search')}</span>
                <input class="select wide" type="search"
                  placeholder=${T('имя, комната или entity_id…', 'name, room or entity_id…')}
                  aria-label=${T('Поиск устройства', 'Search for a device')}
                  .value=${host.editZoneSearch}
                  @input=${(e: Event) => (host.editZoneSearch = (e.target as HTMLInputElement).value)} />
              </div>
              ${shown.length
                ? html`<div class="zone-devs">
                      ${shown.map((id) => {
                        const taken = boundElsewhere(host, id, z.id);
                        return html`<label class="zone-dev ${taken ? 'taken' : ''}"
                          title=${entityOptionText(host, id)}>
                          <input type="checkbox" aria-label=${entityOptionText(host, id)}
                            @change=${() => onToggleZoneDevice(host, z.id, id)} />
                          <span>${entityShort(host, id)}${taken ? html`<em class="taken-tag"> · ${taken}</em>` : nothing}</span>
                        </label>`;
                      })}
                    </div>
                    ${hits.length > LIMIT
                      ? html`<span class="hint">${T(
                          `показано ${LIMIT} из ${hits.length} — уточните поиск`,
                          `showing ${LIMIT} of ${hits.length} — narrow the search`,
                        )}</span>`
                      : nothing}`
                : html`<span class="hint">${T('ничего не найдено', 'nothing found')}</span>`}`;
          })()}`;
      })()}
  `;
}
