// ---------------------------------------------------------------------------
// КРУЖКИ-ЗНАЧКИ КЛИМАТА У МАРКЕРА КОМНАТЫ.
//
// Свет на плане виден и без подписи — лампа светится. Климат не виден никак:
// кондиционер, тёплый пол и конвектор выглядят одинаково выключенными. Поэтому
// под «домиком» комнаты встаёт ряд маленьких кружков — по одному на ТИП
// климата, который в этой комнате ЕСТЬ. Нет кондиционера — нет и кружка: пустых
// мест в ряду не бывает.
//
// ПО ЧЕМУ ОПРЕДЕЛЯЕТСЯ ТИП (сверху вниз, первый сработавший выигрывает):
//   1) модель предмета, к которому привязана сущность (ac_unit, warm_floor,
//      radiator/convector, ceiling_vent/ceiling_fan/air_purifier) — самое
//      надёжное: предмет поставил человек и назвал его сам;
//   2) для climate.* — hvac_modes: есть охлаждающий режим (cool/heat_cool/dry/
//      fan_only) — кондиционер; есть только heat — обогрев. Внутри обогрева
//      тёплый пол от конвектора отличается ТОЛЬКО по названию (подсказки ниже);
//      подсказка не может перевернуть «греет» в «охлаждает» — худшее, что она
//      сделает, это оставит общий значок обогрева;
//   3) для fan.* — сперва имя, и только потом домен. На объекте владельца 13 из
//      14 «вентиляторов» — это `fan.*_konvektor`: вентилятор ВНУТРИ конвектора,
//      часть обогрева, а не вентиляция. «Вентиляция» остаётся значением по
//      умолчанию для домена fan — но лишь там, где имя ничего не сказало;
//   4) для switch/input_boolean — ТОЛЬКО имя. Голое `switch.rele_3` климатом не
//      считается (реле может быть чем угодно), а вот реле, которое человек
//      назвал «Тёплый пол», — считается: на объекте владельца тёплые полы
//      висят именно на голых реле коллектора, и правило «switch — не климат»
//      съедало их целиком, оставляя комнату вообще без кружков.
// Признаков не хватило — рисуется общий кружок «Климат», а не выдуманный тип.
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
import { drawBadgeCanvas } from './icons';

export type ClimateBadgeType = 'ac' | 'floor' | 'heater' | 'vent' | 'other';
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
export interface ClimateEntityRef {
  entity_id: string;
  behavior: string;
  model?: string;
}

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

// -- Определение типа ---------------------------------------------------------

/** Модель предмета — самый надёжный признак: её выбрал человек. */
const MODEL_TYPE: Record<string, ClimateBadgeType> = {
  ac_unit: 'ac',
  warm_floor: 'floor',
  radiator: 'heater',
  convector: 'heater',
  ceiling_vent: 'vent',
  ceiling_fan: 'vent',
  air_purifier: 'vent',
};

/** Поведения, у которых вообще бывает «работает / не работает». Датчик
 *  температуры тёплого пола — это показание, а не работа, и кружка не даёт. */
const CONTROL_BEHAVIORS = new Set(['climate', 'switch', 'input_boolean', 'fan']);

/** Режимы, которые умеет только охлаждающая техника. `auto` сюда НЕ входит:
 *  термостаты тёплого пола сплошь и рядом отдают ['off','heat','auto']. */
const COOL_MODES = ['cool', 'heat_cool', 'dry', 'fan_only'];

/** Подсказки по названию. Для climate.* — последняя ступень, после hvac_modes;
 *  для fan/switch — ПЕРВАЯ и единственная, потому что домен там врёт (см. шапку).
 *  Порядок важен: «тёплый пол» проверяется до «обогрева», а «конвектор» — до
 *  «вентиляции», иначе «Вентилятор конвектора» ушёл бы в вентиляцию. */
const NAME_HINTS: [ClimateBadgeType, RegExp][] = [
  ['floor', /(тепл\w*\s*пол|тёплый|teplyi[_ ]?pol|teplyy[_ ]?pol|warm[_ ]?floor|floor[_ ]?heat|underfloor|podogrev|\bpol[_ ]|[_ ]pol\b)/],
  ['heater', /(конвектор|konvektor|convector|радиатор|radiator|батаре|batare|обогрев|obogrev)/],
  ['ac', /(кондиц|kondic|konditsion|сплит|split|\bac[_ ]|[_ ]ac\b)/],
  // `ventil[a-z]*ats` ловит и «ventiliatsiia», и «ventilyacia»; на «вентилятор»
  // и «ventilyator_konvektor» не срабатывает — там между ventil и ats/ac нет
  // сплошных букв, а конвектор к тому же выигрывает строкой выше.
  ['vent', /(вентиляц|вытяж|приточ|ventil[a-z]*ats|ventil[a-z]*ac|vytyazh|pritoch)/],
];

function hintType(entityId: string, friendly?: unknown): ClimateBadgeType | null {
  const hay = `${entityId} ${typeof friendly === 'string' ? friendly : ''}`.toLowerCase();
  for (const [type, re] of NAME_HINTS) if (re.test(hay)) return type;
  return null;
}

/** Поведение привязки; `auto` (и пустое) разворачивается в домен сущности. */
function behaviorOf(e: ClimateEntityRef): string {
  return !e.behavior || e.behavior === 'auto' ? e.entity_id.split('.')[0] : e.behavior;
}

/** Тип климата этой сущности, либо null — «это не климат». */
export function climateTypeOf(e: ClimateEntityRef, ent?: any): ClimateBadgeType | null {
  const behavior = behaviorOf(e);
  if (!CONTROL_BEHAVIORS.has(behavior)) return null;

  // Модель предмета выбрал человек — она главнее любого имени и любого домена.
  const byModel = e.model ? MODEL_TYPE[e.model] : undefined;
  if (byModel) return byModel;

  const attrs = ent?.attributes;
  const hint = hintType(e.entity_id, attrs?.friendly_name);

  if (behavior === 'climate') {
    const modes: string[] = Array.isArray(attrs?.hvac_modes) ? attrs.hvac_modes : [];
    if (modes.some((m) => COOL_MODES.includes(m))) return 'ac';
    if (modes.includes('heat')) return hint === 'floor' ? 'floor' : 'heater';
    return hint ?? 'other';
  }

  // Вентилятор: имя вперёд домена. «Вентилятор конвектора» — обогрев, и он
  // сливается с `climate.konvektor_*` той же комнаты в ОДИН кружок. Домен
  // остаётся вентиляцией только там, где имя промолчало.
  if (behavior === 'fan') return hint ?? 'vent';

  // Реле и переключатель: климат ТОЛЬКО по имени. «switch.rele_3» может быть
  // чем угодно, и кружок ему рисовать нельзя; «Тёплый пол» на реле коллектора —
  // это настоящий тёплый пол, и без кружка комната осталась бы пустой.
  return hint;
}

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
    const type = climateTypeOf(e, ent);
    if (!type) continue;
    const state = climateStateOf(behaviorOf(e), ent);
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

  /** Кружки держат постоянный размер на экране — как и сам маркер. */
  updateScales(cameraPos: THREE.Vector3): void {
    for (const c of this.group.children) {
      const s = THREE.MathUtils.clamp(cameraPos.distanceTo(c.position) * 0.05, 0.3, 1.2) * BADGE_SCALE;
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
