// ---------------------------------------------------------------------------
// Стабильные идентификаторы плана и привязки, которые их переживают.
//
// Раньше врезанная модель помнила своё место НОМЕРОМ позиции в массиве
// (`attach = { kind, index, opening }`). Номер не отменяется вместе с массивом:
// удалили стену — все привязки после неё показывают на соседа; слили стены —
// массив заменился целиком, и номера потеряли смысл разом. Дальше удаление
// гаражных ворот вырезало ЧУЖОЙ проём, а свой оставляло навсегда.
//
// Здесь три вещи:
//   1) выдача id — идемпотентная: у кого id есть, тот его и сохраняет;
//   2) чтение привязки в ОБОИХ видах — по id (правильный) и по номеру (старые
//      планы клиентов, которых у нас на руках нет);
//   3) обновление ЗЕРКАЛА из номеров. Зеркало — не источник правды, а
//      совместимость: карточка версии до этой читает только номера и обязана
//      продолжать работать на том же файле.
// ---------------------------------------------------------------------------

import type { FloorDef, FloorPlan, FurnitureDef, OpeningDef, RoomDef, RoomOpening, WallDef } from '../types';

/** Случайная метка запуска: два браузера, правящих один план, не выдадут
 *  одинаковых id даже совпав счётчиками. */
const RUN = Math.random().toString(36).slice(2, 7);
let seq = 0;

function mint(prefix: string): string {
  seq += 1;
  return `${prefix}${seq.toString(36)}${RUN}`;
}

/** Id новой стены. */
export const newWallId = (): string => mint('w');
/** Id нового проёма (в стене или на грани комнаты-фигуры). */
export const newOpeningId = (): string => mint('o');
/** Id новой комнаты. */
export const newRoomId = (): string => mint('r');

/** Этажи плана: и обычные, и внутри зданий (Designer Mode). Один и тот же
 *  объект этажа не обходится дважды. */
function floorsOf(plan: FloorPlan): FloorDef[] {
  const out: FloorDef[] = [];
  const seen = new Set<FloorDef>();
  const add = (list?: FloorDef[]) => {
    for (const f of list ?? []) {
      if (f && !seen.has(f)) {
        seen.add(f);
        out.push(f);
      }
    }
  };
  add(plan?.floors);
  for (const b of plan?.buildings ?? []) add(b?.floors);
  return out;
}

/**
 * Выдать недостающие id по всему плану и перевести привязки на них.
 *
 * Идемпотентна: повторный вызов ничего не меняет. Совпавшие id (склеенный
 * вручную JSON, скопированный этаж) разводятся — иначе «стабильный» id
 * показывал бы на два объекта сразу.
 *
 * @returns сколько id пришлось выдать (0 — план уже был с идентификаторами).
 */
export function ensurePlanIds(plan: FloorPlan): number {
  if (!plan) return 0;
  const seen = new Set<string>();
  let issued = 0;
  const keep = (id: string | undefined, prefix: string): string => {
    if (id && !seen.has(id)) {
      seen.add(id);
      return id;
    }
    let next = mint(prefix);
    while (seen.has(next)) next = mint(prefix);
    seen.add(next);
    issued += 1;
    return next;
  };

  for (const floor of floorsOf(plan)) {
    for (const w of floor.walls ?? []) {
      if (!w) continue;
      w.id = keep(w.id, 'w');
      for (const o of w.openings ?? []) if (o) o.id = keep(o.id, 'o');
    }
    for (const r of floor.rooms ?? []) {
      if (!r) continue;
      r.id = keep(r.id, 'r');
      for (const o of r.openings ?? []) if (o) o.id = keep(o.id, 'o');
    }
    // Привязки переезжают на id ТОЛЬКО пока номера ещё верны — то есть сразу
    // при загрузке, до первой правки.
    syncAttachments(floor);
  }
  return issued;
}

export interface AttachHit {
  kind: 'wall' | 'room';
  /** Стена или комната, которой принадлежит проём. */
  ownerId: string;
  ownerIndex: number;
  /** Массив проёмов этого владельца — из него и удаляют. */
  openings: (OpeningDef | RoomOpening)[];
  openingIndex: number;
  opening: OpeningDef | RoomOpening;
}

/**
 * Найти проём, который держит привязка.
 *
 * Порядок попыток — от самого надёжного к самому хрупкому:
 *   1. по id проёма, поиском по всему этажу. Переживает и слияние стен: проём
 *      сохраняет свой id, даже когда стена под ним стала другой;
 *   2. по id владельца + номеру проёма внутри него;
 *   3. по номерам (старый план, который ещё не открывали в редакторе).
 */
export function resolveAttach(floor: FloorDef, attach: FurnitureDef['attach']): AttachHit | null {
  if (!attach) return null;
  const walls = floor.walls ?? [];
  const rooms = floor.rooms ?? [];

  const hitFrom = (
    kind: 'wall' | 'room',
    ownerIndex: number,
    owner: WallDef | RoomDef | undefined,
    openingIndex: number,
  ): AttachHit | null => {
    const openings = owner?.openings;
    if (!owner || !openings || openingIndex < 0 || openingIndex >= openings.length) return null;
    return {
      kind,
      ownerId: owner.id ?? '',
      ownerIndex,
      openings,
      openingIndex,
      opening: openings[openingIndex],
    };
  };

  // 1) по id проёма
  if (attach.openingId) {
    for (let i = 0; i < walls.length; i++) {
      const oi = (walls[i]?.openings ?? []).findIndex((o) => o?.id === attach.openingId);
      if (oi >= 0) return hitFrom('wall', i, walls[i], oi);
    }
    for (let i = 0; i < rooms.length; i++) {
      const oi = (rooms[i]?.openings ?? []).findIndex((o) => o?.id === attach.openingId);
      if (oi >= 0) return hitFrom('room', i, rooms[i], oi);
    }
  }

  // 2) по id владельца + номеру внутри него
  if (attach.targetId && attach.opening != null) {
    const list = attach.kind === 'room' ? rooms : walls;
    const idx = list.findIndex((x) => x?.id === attach.targetId);
    if (idx >= 0) return hitFrom(attach.kind, idx, list[idx], attach.opening);
  }

  // 3) по номерам — только для планов, которых ещё не касался этот редактор
  if (attach.index != null && attach.opening != null) {
    const list = attach.kind === 'room' ? rooms : walls;
    return hitFrom(attach.kind, attach.index, list[attach.index], attach.opening);
  }
  return null;
}

/** Записать в привязку то, что нашли: id — как правду, номера — как зеркало
 *  для старой версии карточки. */
export function writeAttach(attach: NonNullable<FurnitureDef['attach']>, hit: AttachHit): void {
  attach.kind = hit.kind;
  attach.targetId = hit.ownerId;
  attach.openingId = hit.opening.id;
  attach.index = hit.ownerIndex;
  attach.opening = hit.openingIndex;
  if (hit.kind === 'room') attach.edge = (hit.opening as RoomOpening).edge;
  else delete attach.edge;
}

/**
 * Пройти по мебели этажа и привести КАЖДУЮ привязку в согласие с планом.
 *
 * Вызывается после любой правки, которая двигает массивы (удаление стены,
 * слияние, добавление проёма): id остаются на месте, а номера-зеркала обязаны
 * показывать туда же, куда id — иначе старая карточка на этом же файле снова
 * вырежет чужой проём.
 *
 * Привязка, для которой проёма больше нет, не трогается: пусть висит, чем
 * молча прицепится к соседу.
 */
export function syncAttachments(floor: FloorDef): void {
  for (const f of floor?.furniture ?? []) {
    if (!f?.attach) continue;
    const hit = resolveAttach(floor, f.attach);
    if (hit) writeAttach(f.attach, hit);
  }
}
