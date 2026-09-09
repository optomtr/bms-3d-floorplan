// ---------------------------------------------------------------------------
// КРУЖКИ-ЗНАЧКИ КЛИМАТА У МАРКЕРА КОМНАТЫ.
//
// Свет на плане виден и без подписи — лампа светится. Климат не виден никак:
// кондиционер, тёплый пол и конвектор выглядят одинаково выключенными. Поэтому
// под «домиком» комнаты встаёт ряд маленьких кружков — по одному на ТИП
// климата, который в этой комнате ЕСТЬ. Нет кондиционера — нет и кружка: пустых
// мест в ряду не бывает.
//
// ПО ЧЕМУ ОПРЕДЕЛЯЕТСЯ ТИП: здесь — НИ ПО ЧЕМУ. Разбор климата один на всю
// систему и живёт в `src/climate-kind.ts`: и этот файл, и разделы «мастера»
// спрашивают его, а не пишут своё. Второго списка моделей, режимов и подсказок
// по имени в репозитории быть не должно — ровно на нём вторая копия и
// ошибалась (вентилятор конвектора уезжал в вентиляцию, а тёплый пол на голом
// реле — в свет).
//
// ОДИН ПРИБОР — ОДИН КРУЖОК. Ряд собирается по ТИПАМ, а не по сущностям,
// поэтому `fan.*_konvektor` и `climate.konvektor_*` одной комнаты попадают в
// общий кружок обогрева, а не рисуются дважды и разными знаками.
//
// «РАБОТАЕТ» ПРОТИВ «ВКЛЮЧЁН»:
//   climate — по hvac_action: heating/cooling/drying/fan = работает (кружок
//   горит), idle/off при включённом термостате = простаивает (кружок приглушён).
//   Термостат, который hvac_action не сообщает вовсе, считается работающим по
//   своему состоянию — иначе кружок не загорелся бы никогда.
//   switch/fan — реле либо подаёт питание, либо нет: включено = работает.
// ---------------------------------------------------------------------------

import * as THREE from 'three';
import { climateBehaviorOf, climateKindOf, type ClimateEntityRef, type ClimateKind } from '../climate-kind';
import { drawBadgeCanvas } from './icons';

/** Тип кружка = вид климата из общего разбора: один список на всю систему. */
export type ClimateBadgeType = ClimateKind;
/** off — выключено, idle — включено, но простаивает, active — реально работает. */
export type ClimateBadgeState = 'off' | 'idle' | 'active';

export interface ClimateBadge {
  type: ClimateBadgeType;
  state: ClimateBadgeState;
  /** Подпись по-русски (подсказка, озвучка, диагностика). */
  label: string;
  /** Из каких сущностей собран кружок. */
  entities: string[];
}

/** Одна привязка комнаты — ровно то, что лежит в RoomInfo.entities. */
export type { ClimateEntityRef };

/** Знак, подпись и цвета кружка каждого типа. */
export const CLIMATE_BADGE_STYLE: Record<
  ClimateBadgeType,
  { icon: string; label: string; on: number; idle: number }
> = {
  ac: { icon: 'snow', label: 'Кондиционер', on: 0x4fb0ff, idle: 0x74899b },
  floor: { icon: 'floorHeat', label: 'Тёплый пол', on: 0xffa040, idle: 0x9c8368 },
  heater: { icon: 'heat', label: 'Обогрев (конвектор, радиатор)', on: 0xff6a2a, idle: 0x977059 },
  vent: { icon: 'fan', label: 'Вентиляция', on: 0x7fe3d0, idle: 0x738f8a },
  other: { icon: 'thermo', label: 'Климат', on: 0xf3c86a, idle: 0x8f866c },
};

/** Порядок кружков слева направо. Кондиционер первым — про него и спрашивают. */
export const CLIMATE_BADGE_ORDER: ClimateBadgeType[] = ['ac', 'floor', 'heater', 'vent', 'other'];

/** Цвет погашенного кружка (работает и для любого типа сразу). */
export const CLIMATE_BADGE_OFF = 0x8d95a1;

/** Сколько кружков помещается под «домиком», не превращаясь в кашу. Больше —
 *  лишние сворачиваются в один общий «Климат» (см. computeClimateBadges). */
export const MAX_CLIMATE_BADGES = 4;

/** Размер кружка в долях «домика» и насколько ниже его центра стоит ряд. */
const BADGE_SCALE = 0.42;
const ROW_DROP = 0.70;

/** Докуда кружок РАСТЁТ вслед за отдалением камеры (мировые единицы, до
 *  умножения на BADGE_SCALE). Пока предел не достигнут, размер НА ЭКРАНЕ не
 *  меняется вовсе; упёрлись — и дальше кружок на экране только уменьшается.
 *
 *  У «домика» этот предел 1.2, и кружку он не годится: на общем виде этажа
 *  владельца (40 × 25 м, 18 комнат, холст 900 × 640, камера в 66 м) кружок
 *  выходил 4,6 px — пылинка, по которой снежинку от радиатора не отличить.
 *  2.6 держит постоянный размер до 52 м, и тот же кружок становится 10 px.
 *
 *  Предел нужен именно как ПРЕДЕЛ: убрать его совсем — и кружок останется
 *  13 px даже когда сам этаж отъехал вдвое, а ряды соседних комнат сойдутся.
 *  Замерено на том же этаже: при 10 px между кружками разных комнат остаётся
 *  13,6 px, при 13 px — уже 9,8 px, а кашей (наезд на −6 px) ряд становится
 *  к 28 px. Обе границы — «видно» и «не каша» — стережёт
 *  tests/25-climate-badges-size.spec.ts. */
const BADGE_MAX_SPAN = 2.6;
const BADGE_MIN_SPAN = 0.3;

// -- «Работает» против «включён» ----------------------------------------------

const ACTIVE_ACTIONS = new Set(['heating', 'cooling', 'drying', 'fan', 'defrosting', 'preheating']);
const IDLE_ACTIONS = new Set(['idle', 'off']);
const RANK: Record<ClimateBadgeState, number> = { off: 0, idle: 1, active: 2 };

export function climateStateOf(behavior: string, ent?: any): ClimateBadgeState {
  const s = typeof ent?.state === 'string' ? ent.state : '';
  if (!s || s === 'off' || s === 'unavailable' || s === 'unknown') return 'off';
  // Реле и вентилятор: питание либо подано, либо нет — простоя не бывает.
  if (behavior !== 'climate') return 'active';
  const action = ent?.attributes?.hvac_action;
  if (typeof action === 'string' && action) {
    if (ACTIVE_ACTIONS.has(action)) return 'active';
    if (IDLE_ACTIONS.has(action)) return 'idle';
    // Незнакомое значение выдавать за работу нельзя — приглушаем.
    return 'idle';
  }
  // hvac_action не сообщается вовсе: другого источника правды нет.
  return 'active';
}

/**
 * Ряд кружков для одной комнаты: по одному на присутствующий тип климата, в
 * фиксированном порядке. Кружок «горит», если работает ХОТЯ БЫ одно устройство
 * этого типа; «приглушён», если ни одно не работает, но что-то включено.
 */
export function computeClimateBadges(
  entities: readonly ClimateEntityRef[] | undefined,
  hass?: { states?: Record<string, any> },
): ClimateBadge[] {
  const buckets = new Map<ClimateBadgeType, { state: ClimateBadgeState; entities: string[] }>();
  for (const e of entities ?? []) {
    const ent = hass?.states?.[e.entity_id];
    const type = climateKindOf(e, ent?.attributes);
    if (!type) continue;
    const state = climateStateOf(climateBehaviorOf(e), ent);
    const cur = buckets.get(type);
    if (!cur) buckets.set(type, { state, entities: [e.entity_id] });
    else {
      cur.entities.push(e.entity_id);
      if (RANK[state] > RANK[cur.state]) cur.state = state;
    }
  }

  const list: ClimateBadge[] = CLIMATE_BADGE_ORDER.filter((t) => buckets.has(t)).map((type) => ({
    type,
    state: buckets.get(type)!.state,
    label: CLIMATE_BADGE_STYLE[type].label,
    entities: buckets.get(type)!.entities,
  }));
  if (list.length <= MAX_CLIMATE_BADGES) return list;

  // Типов больше, чем читается с планшета: старшие остаются собой, хвост
  // сворачивается в один общий кружок «Климат» — он честнее, чем ряд, в
  // котором уже ничего не разобрать.
  const keep = list.slice(0, MAX_CLIMATE_BADGES - 1);
  const rest = list.slice(MAX_CLIMATE_BADGES - 1);
  keep.push({
    type: 'other',
    state: rest.reduce<ClimateBadgeState>((a, b) => (RANK[b.state] > RANK[a] ? b.state : a), 'off'),
    label: CLIMATE_BADGE_STYLE.other.label,
    entities: rest.flatMap((r) => r.entities),
  });
  return keep;
}

// -- Слой спрайтов ------------------------------------------------------------

/**
 * Кружки живут в СВОЁЙ группе, а не среди маркеров: маркер комнаты красится
 * целиком (подсветка «в комнате что-то включено», оранжевый выбор, красное
 * мигание протечки), и кружки, попав туда же, потеряли бы собственный цвет.
 *
 * Сдвиг ряда задаётся не мировыми координатами, а `Sprite.center` — тогда
 * кружки висят под «домиком» с ЛЮБОГО угла камеры, а не уезжают за него при
 * повороте сцены. Текстуры общие на весь дом: типов пять, заливки две.
 */
export class ClimateBadgeLayer {
  readonly group = new THREE.Group();
  private texCache = new Map<string, THREE.Texture>();
  /** roomKey -> его кружки, слева направо. */
  private byRoom = new Map<string, THREE.Sprite[]>();

  private texture(icon: string, filled: boolean): THREE.Texture {
    const key = `${icon}:${filled ? 'on' : 'off'}`;
    let tex = this.texCache.get(key);
    if (!tex) {
      tex = new THREE.CanvasTexture(drawBadgeCanvas(icon, filled));
      tex.colorSpace = THREE.SRGBColorSpace;
      this.texCache.set(key, tex);
    }
    return tex;
  }

  /**
   * Привести ряд комнаты к переданному состоянию. Возвращает true, только если
   * на экране что-то ДЕЙСТВИТЕЛЬНО изменилось — сцена рисует кадры по запросу,
   * и «изменилось» на каждое обновление состояний сожгло бы её экономию.
   */
  sync(roomKey: string, center: [number, number, number], badges: ClimateBadge[]): boolean {
    const cur = this.byRoom.get(roomKey);
    const sameRow =
      (cur?.length ?? 0) === badges.length &&
      (cur ?? []).every((sp, i) => sp.userData.badgeType === badges[i].type);

    let changed = false;
    let row = cur ?? [];
    if (!sameRow) {
      if (cur) this.dropRow(cur);
      row = badges.map((b, i) => this.makeSprite(roomKey, center, b, i, badges.length));
      if (row.length) this.byRoom.set(roomKey, row);
      else this.byRoom.delete(roomKey);
      changed = true;
    }
    for (let i = 0; i < badges.length; i++) if (this.paint(row[i], badges[i])) changed = true;
    return changed;
  }

  private makeSprite(
    roomKey: string,
    center: [number, number, number],
    badge: ClimateBadge,
    index: number,
    total: number,
  ): THREE.Sprite {
    const mat = new THREE.SpriteMaterial({
      map: this.texture(CLIMATE_BADGE_STYLE[badge.type].icon, false),
      depthTest: false, // видно сквозь стены, как и сам маркер
      depthWrite: false,
      transparent: true,
    });
    const sp = new THREE.Sprite(mat);
    sp.position.set(center[0], center[1], center[2]);
    // Шаг ряда равен ширине кружка, поэтому смещение — целое число позиций.
    sp.center.set(0.5 - (index - (total - 1) / 2), 0.5 + ROW_DROP / BADGE_SCALE);
    sp.renderOrder = 999;
    sp.userData = { climateBadge: true, roomKey, badgeType: badge.type, badgeState: '', badgeLabel: badge.label };
    this.group.add(sp);
    return sp;
  }

  /** Цвет и заливка одного кружка. True — цвет действительно сдвинулся. */
  private paint(sp: THREE.Sprite, badge: ClimateBadge): boolean {
    if (sp.userData.badgeState === badge.state) return false;
    const style = CLIMATE_BADGE_STYLE[badge.type];
    const mat = sp.material as THREE.SpriteMaterial;
    const lit = badge.state !== 'off';
    mat.map = this.texture(style.icon, lit);
    mat.color.setHex(
      badge.state === 'active' ? style.on : badge.state === 'idle' ? style.idle : CLIMATE_BADGE_OFF,
    );
    mat.opacity = badge.state === 'active' ? 1 : badge.state === 'idle' ? 0.82 : 0.5;
    mat.needsUpdate = true;
    sp.userData.badgeState = badge.state;
    sp.userData.badgeEntities = badge.entities;
    return true;
  }

  /** Кружки держат постоянный размер на экране — как и сам маркер, но дальше
   *  него: см. BADGE_MAX_SPAN, там же и замеренные границы. */
  updateScales(cameraPos: THREE.Vector3): void {
    for (const c of this.group.children) {
      const d = cameraPos.distanceTo(c.position) * 0.05;
      const s = THREE.MathUtils.clamp(d, BADGE_MIN_SPAN, BADGE_MAX_SPAN) * BADGE_SCALE;
      c.scale.set(s, s, 1);
    }
  }

  /** Что сейчас нарисовано — для карточки, диагностики и автопроверок. */
  list(): { roomKey: string; type: ClimateBadgeType; state: ClimateBadgeState; label: string; entities: string[] }[] {
    const out: ReturnType<ClimateBadgeLayer['list']> = [];
    for (const [roomKey, row] of this.byRoom) {
      for (const sp of row) {
        out.push({
          roomKey,
          type: sp.userData.badgeType,
          state: sp.userData.badgeState,
          label: sp.userData.badgeLabel,
          entities: (sp.userData.badgeEntities ?? []) as string[],
        });
      }
    }
    return out;
  }

  private dropRow(row: THREE.Sprite[]): void {
    for (const sp of row) {
      this.group.remove(sp);
      sp.material.dispose();
    }
  }

  clear(): void {
    for (const row of this.byRoom.values()) this.dropRow(row);
    this.byRoom.clear();
    this.group.clear();
  }

  dispose(): void {
    this.clear();
    for (const t of this.texCache.values()) t.dispose();
    this.texCache.clear();
  }
}
