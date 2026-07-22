// ---------------------------------------------------------------------------
// <ha-3d-floorplan-card> — the custom Lovelace card entry point.
// ---------------------------------------------------------------------------

import { LitElement, html, css, PropertyValues, nothing, svg } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';
import type {
  CardConfig,
  FloorPlan,
  HassEntity,
  HomeAssistant,
  ProjectRef,
  RoomDef,
  RoomShape,
} from './types';
import { SceneManager, ClickResult, QualityChoice, QUALITY_CHOICES, RoomInfo } from './scene/scene-manager';
import { CARD_VERSION } from './version';
import { installSidebar } from './sidebar';
import { DEMO_PLAN } from './scene/demo-plan';
import { EditorController, EditTool } from './editor/editor-controller';
import {
  loadProjects,
  saveProjects,
  listProjects,
  newProjectId,
  blankPlan,
  hashPin,
  ProjectInfo,
  StoredProjects,
} from './storage';
import { FURNITURE_KEYS, LIGHT_KEYS, entityDomainsFor } from './furniture/library';
import { getThumbnail } from './furniture/thumbnails';
import { WALL_MATERIALS, FLOOR_MATERIALS } from './scene/materials';
import { isZirconPlan, convertZircon } from './import/zircon';
import { DOOR_VARIANTS, WINDOW_VARIANTS } from './scene/builder';
import { ICON_PATHS, climateModeIconName } from './scene/icons';
import { FONT_FACE_CSS } from './scene/fonts';

/** Step for a climate ±: whole degrees, never finer. A Generic Thermostat
 *  reports target_temp_step 0.1 (Celsius default precision, not settable from
 *  its helper flow), which makes ± crawl 21.0 → 21.1 and land on values like
 *  21.9. Round the device's own step up to a whole degree; entities that already
 *  step by 1° (ACs, the Tuya floor thermostats) are unaffected. */
function climateStep(ent?: HassEntity): number {
  const s = Number(ent?.attributes?.target_temp_step);
  return Number.isFinite(s) && s >= 1 ? Math.round(s) : 1;
}

/** A BMS Intercom's related entities, discovered by their shared base name. */
interface IntercomGroup {
  base: string;
  prosmotr: string; // switch — Просмотр (live view / sound)
  vyzov: string; // binary_sensor — Вызов (call state)
  camera?: string; // camera — Видео
  open?: string; // button — Открыть дверь
  answer?: string; // button — Ответить (integration pop-up handles the call)
  reset?: string; // button — Сбросить
  ids: Set<string>; // all of the above, to hide from the per-domain cards
}

/** A live water leak: the sensors reporting wet, plus the shut-off to reopen
 *  once the leak has been dealt with. Both are discovered from hass, so adding a
 *  second sensor later needs no change to the plan or this card's config. */
interface LeakAlarm {
  sensors: string[];
  valve?: string;
  /** A sensor is wet right now, as opposed to the supply merely still being shut. */
  wet: boolean;
}

/** Device categories shown when a room marker is tapped (only present ones).
 *  Fans/ventilation live under Climate (not Lights). */
const DEVICE_CATEGORIES: { key: string; label: string; icon: string; behaviors: string[] }[] = [
  { key: 'lights', label: 'Lights', icon: 'bulb', behaviors: ['light', 'switch', 'input_boolean'] },
  { key: 'climate', label: 'Climate', icon: 'snow', behaviors: ['climate', 'fan'] },
  { key: 'curtains', label: 'Curtains', icon: 'curtain', behaviors: ['cover'] },
  { key: 'media', label: 'Media', icon: 'tv', behaviors: ['media_player'] },
  { key: 'locks', label: 'Locks', icon: 'lockClosed', behaviors: ['lock'] },
  { key: 'sensors', label: 'Sensors', icon: 'gauge', behaviors: ['sensor', 'binary_sensor'] },
];

/** Russian translations for the user-visible view-mode UI. English is the key
 *  and the fallback, so any language that isn't Russian shows English. */
const RU_STRINGS: Record<string, string> = {
  Reset: 'Сброс',
  Edit: 'Изменить',
  'Done & Save': 'Готово',
  Auto: 'Авто',
  High: 'Высокое',
  Medium: 'Среднее',
  Low: 'Низкое',
  Quality: 'Качество',
  Lights: 'Свет',
  Climate: 'Климат',
  Curtains: 'Шторы',
  Media: 'Медиа',
  Locks: 'Замки',
  Sensors: 'Датчики',
  Other: 'Другое',
  'Water leak!': 'Протечка воды!',
  'Water detected': 'Обнаружена вода',
  'Open the valve': 'Открыть кран',
  'Water is shut off': 'Вода перекрыта',
  Close: 'Закрыть',
  'Fix the leak, then open the valve': 'Устраните протечку и откройте кран',
  'Valve is open': 'Кран открыт',
  Show: 'Показать',
  'Sync speakers': 'Объединить колонки',
  'Unsync speakers': 'Разъединить колонки',
  'Place this sensor on the plan to see the room': 'Разместите датчик на плане, чтобы видеть комнату',
  Room: 'Комната',
  'All on': 'Включить всё',
  'All off': 'Выключить всё',
  devices: 'устройств',
  'No controllable devices': 'Нет управляемых устройств',
  // Room control panel (Option 1A layout).
  Light: 'Свет',
  Brightness: 'Яркость',
  Volume: 'Громкость',
  Closed: 'Закрыто',
  Open: 'Открыто',
  On: 'Включён',
  Off: 'Выключен',
  Heating: 'Отопление',
  Cooling: 'Охлаждение',
  Ventilation: 'Вентиляция',
  Drying: 'Осушение',
  'Playing now': 'Играет сейчас',
  Paused: 'На паузе',
  Locked: 'Заперто',
  Unlocked: 'Отперто',
  'Front door': 'Входная дверь',
  'Turn everything off': 'Выключить всё',
  // Intercom (домофон)
  Intercom: 'Домофон',
  View: 'Просмотр',
  'Open door': 'Открыть дверь',
  Ringing: 'Входящий вызов',
  Viewing: 'Просмотр включён',
  Idle: 'Готов',
  'opened to': 'Открыто на',
  'No devices in this room': 'В этой комнате нет устройств',
  'Select a room': 'Выберите комнату',
  // Overview (Option 1B: house overview).
  Overview: 'Обзор',
  'lights on': 'свет включён',
  'on average': 'в среднем',
  'All off short': 'Всё выкл.',
  'My home': 'Мой дом',
  rooms: 'комнат',
  'light sources active': 'источников света активно',
  // Screensaver + new controls (design v3).
  'Select a room to control its devices': 'Выберите комнату, чтобы управлять её устройствами',
  'Touch the screen to return': 'Коснитесь экрана, чтобы вернуться',
  'in the house': 'в доме',
  humidity: 'влажность',
  security: 'безопасность',
  'At home': 'Дома',
  'Heat mode': 'Обогрев',
  'Auto mode': 'Авто',
  'Off mode': 'Выкл',
  'Close blind': 'Закрыть',
  'Open blind': 'Открыть',
  'Stop blind': 'Стоп',
  Opening: 'Открывается',
  Closing: 'Закрывается',
  Warm: 'Тёплый',
  Cool: 'Холодный',
  now: 'сейчас',
  of: 'из',
  'blinds open': 'шторы открыты',
  'humidity in house': 'влажность в доме',
  'front door': 'входная дверь',
};

@customElement('ha-3d-floorplan-card')
export class Ha3dFloorplanCard extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;
  // Set by HA when this element is used as a `panel_custom` sidebar panel.
  @property({ attribute: false }) public panel?: { config?: Record<string, any> };
  @property({ attribute: false }) public narrow?: boolean;
  @state() private config?: CardConfig;
  @state() private activeProjectId?: string;
  @state() private loadError?: string;
  @state() private floorNames: string[] = [];
  @state() private activeFloorIndex = 0;
  @state() private editing = false;
  @state() private editTool: EditTool = 'wall';
  @state() private editSelectedModel = 'sofa';
  @state() private editSelectedEntity: string | null = null;
  @state() private editSelectedObjModel: string | null = null;
  @state() private editShowAllEntities = false;
  @state() private editSnap = true;
  @state() private editFloorIndex = 0;
  @state() private editSelectedKind: 'furniture' | 'wall' | 'room' | 'opening' | null = null;
  @state() private editOpeningKind: 'door' | 'window' | 'opening' | null = null;
  @state() private editOpeningVariant = 'single';
  @state() private editOpeningWidth: number | null = null;
  @state() private editSelectedColor: string | null = null;
  @state() private editSelectedWallLength: number | null = null;
  @state() private editSelectedWallThickness: number | null = null;
  @state() private editSelectedWallAngle: number | null = null;
  @state() private editRoom: RoomDef | null = null;
  @state() private editFurnScale: [number, number, number] | null = null;
  @state() private editMaterial = 'plain';
  @state() private editCanUndo = false;
  @state() private editCanRedo = false;
  @state() private editUnderlay: import('./types').Underlay | null = null;
  @state() private editCameraDistance = 1;
  @state() private editIsLight = false;
  @state() private editBrightness = 0;
  @state() private editIsLightSet = false;
  @state() private editSpread = 1;
  @state() private editCount = 6;
  // Manual room zones (Rooms panel).
  @state() private editZones: import('./types').ZoneDef[] = [];
  @state() private editSelectedZoneId: string | null = null;
  @state() private editZonePlacing = false;
  // View-mode control popup (tap a bound object → controls/remote).
  @state() private controlOpen = false;
  @state() private controlEntities: string[] = [];
  /** When a ROOM marker is tapped: its devices + which category is expanded. */
  @state() private controlRoom: { name?: string; entities: { entity_id: string; behavior: string }[] } | null = null;
  @state() private controlCategory: string | null = null;
  @state() private controlPos: [number, number] = [0, 0];
  /** Timestamp the popup opened — guards against the touch "ghost click" that
   *  would otherwise close it the instant it appears on tablets. */
  private controlOpenedAt = 0;
  // --- Room control panel (Option 1A: room in focus) ---
  /** Which view is showing: single room in focus (1A) or the house grid (1B). */
  @state() private viewMode: 'room' | 'overview' = 'room';
  /** Rooms on the active floor (from the scene), for the pills + right panel. */
  @state() private rooms: RoomInfo[] = [];
  /** The focused room's design photo, once the scene has confirmed it loads.
   *  Painted as a CSS layer across the whole card (the canvas can't reach behind
   *  the side panel), with the canvas transparent over it. */
  @state() private roomPhoto: string | null = null;
  /** The room photo with its softening already baked in — see bakeRoomPhoto.
   *  null until baking finishes (or if it can't run), when the raw photo is
   *  shown with the equivalent CSS filter instead. */
  @state() private roomPhotoBaked: string | null = null;
  /** The room whose devices fill the right-side panel. */
  @state() private activeRoomKey: string | null = null;
  /** Overview (1B): the room opened in the full-screen detail slide-over. */
  @state() private detailRoomKey: string | null = null;
  /** Every floor's rooms keyed by their floor-qualified key, rebuilt each Обзор
   *  render — the detail slide-over resolves a card from any floor through it. */
  private overviewRoomByKey = new Map<string, RoomInfo>();
  /** Live clock for the panel header (ticks every 10s). */
  @state() private now = new Date();
  private clockTimer?: number;
  /** Idle screensaver (big clock + home summary) after N minutes of no input. */
  @state() private idle = false;
  private idleTimer?: number;
  /** Transient value (0..100) shown while dragging a slider, before HA confirms. */
  @state() private dragEntity: string | null = null;
  private dragValue = 0;
  @state() private editEntitySearch = '';
  @state() private editFurnSearch = '';
  // Whole-floor surface appearance pickers (apply to all walls / all floors).
  @state() private editAllWallColor = '#e8e6e1';
  @state() private editAllWallMat = 'plain';
  @state() private editAllFloorColor = '#cfc7ba';
  @state() private editAllFloorMat = 'plain';
  @state() private importOpen = false;
  @state() private importText = '';
  // Render-quality picker (view mode).
  @state() private qualityMenuOpen = false;
  @state() private qualityChoice: QualityChoice = 'auto';
  // Edit-mode PIN lock (casual tamper-protection on a kiosk/tablet).
  @state() private editUnlocked = false;
  @state() private pinPromptOpen = false;
  @state() private pinError = '';
  @state() private editPinInput = '';
  @state() private projectList: ProjectInfo[] = [];
  @state() private currentProjectId: string | null = null;
  /** Id of the project open in the editor this session (null = unsaved new). */
  @state() private editingProjectId: string | null = null;
  @state() private editPlanName = '';
  @state() private paletteOpen = false;
  @state() private toast?: string;
  private storedProjects: StoredProjects = { projects: {} };

  @query('.viewport') private viewport?: HTMLDivElement;

  private sceneManager?: SceneManager;
  private planLoaded = false;
  private lastHass?: HomeAssistant;
  private pendingHass?: HomeAssistant;
  /** Effective (real + optimistic) state map last pushed to the 3D scene. */
  private lastPushed?: HomeAssistant;
  /** Optimistic overrides: entity_id -> the state we assume until HA confirms
   *  (or a timeout reverts it). Makes controls feel instant. `gen` tags each
   *  override so a stale revert (late reject / old timer) can't clobber a newer
   *  optimistic state chosen by a rapid re-tap. */
  private optimistic = new Map<string, { state: string; timer: ReturnType<typeof setTimeout>; gen: number }>();
  private optGen = 0;
  /** Pending climate setpoints: entity_id -> the target we asked for, plus the
   *  value HA reported when we asked (`base`). The Tuya thermostats here obey
   *  set_temperature — the wall unit moves — but don't report the new target
   *  back for a long time (measured: not within 20s), so reading HA alone
   *  leaves ± looking dead on a stale number. Cleared once HA reports our value
   *  (confirmed) or any other value (someone used the wall unit — that wins). */
  private optTemp = new Map<string, { temp: number; base?: number; timer: ReturnType<typeof setTimeout> }>();
  private currentPlan?: FloorPlan;
  private editor?: EditorController;
  private toastTimer?: number;

  // -- Lovelace lifecycle -----------------------------------------------------

  public setConfig(config: CardConfig): void {
    if (!config) throw new Error('Invalid configuration');
    // Empty config is allowed: the card falls back to a saved (localStorage)
    // plan or the built-in demo, so it works with zero files / zero YAML.
    this.config = config;
    this.loadError = undefined;
    this.planLoaded = false;
    this.activeProjectId =
      config.projects && config.projects.length
        ? config.projects[0].id
        : undefined;
    // Reload if scene already exists.
    if (this.sceneManager) this.loadActiveProject();
  }

  public getCardSize(): number {
    return 8;
  }

  static getStubConfig(): CardConfig {
    return {
      type: 'custom:ha-3d-floorplan-card',
      height: '500px',
      plan: {
        name: 'Demo',
        wallHeight: 2.6,
        floors: [
          {
            name: 'Ground',
            walls: [
              { start: [0, 0], end: [6, 0] },
              { start: [6, 0], end: [6, 5] },
              { start: [6, 5], end: [0, 5] },
              { start: [0, 5], end: [0, 0], openings: [{ kind: 'door', position: 2, width: 1 }] },
            ],
            rooms: [{ name: 'Living', polygon: [[0, 0], [6, 0], [6, 5], [0, 5]], color: '#cfc7ba' }],
            furniture: [
              { model: 'sofa', position: [1.5, 0, 1], rotation: 0, color: '#5b6b7a', id: 'sofa1' },
              { model: 'ceiling_light', position: [3, 2.5, 2.5], id: 'lamp1' },
            ],
            bindings: [
              { entity_id: 'light.living_room', anchor_object: 'lamp1', behavior: 'light' },
            ],
          },
        ],
      },
    };
  }

  static async getConfigElement() {
    await import('./editor');
    return document.createElement('ha-3d-floorplan-card-editor');
  }

  // -- hass updates -----------------------------------------------------------

  protected override willUpdate(changed: PropertyValues): void {
    // Used as a sidebar panel (panel_custom): take config from panel.config and
    // fill the viewport. This path is reliable across refresh/tabs/devices.
    if (changed.has('panel') && this.panel && !this.config) {
      (window as any).__ha3dPanelMode = true; // tells the injector to stand down
      const cfg = (this.panel.config ?? {}) as CardConfig;
      this.setConfig({ height: '100vh', ...cfg, type: 'custom:ha-3d-floorplan-card' });
    }
    if (changed.has('hass') && this.hass) {
      this.pendingHass = this.hass;
    }
  }

  protected override updated(_changed: PropertyValues): void {
    if (!this.sceneManager && this.viewport) {
      this.initScene();
    }
    // While editing, don't apply live entity updates — they'd churn the
    // edit-copy scene and fight the editor's rebuilds. exitEdit re-syncs.
    if (this.pendingHass && this.sceneManager && this.planLoaded && !this.editing) {
      this.applyHass(this.pendingHass);
      this.pendingHass = undefined;
    }
    // Flash the pin of any room with a wet sensor. Driven from here rather than
    // render() so the scene hears about it only when the set actually changes.
    if (this.sceneManager && !this.editing) {
      const leak = this.leak;
      // Re-arm once the house is genuinely back to normal, so a later leak isn't
      // swallowed by an X someone tapped hours ago.
      if (!leak && this.leakAck) this.leakAck = false;
      // The pin keeps flashing even after the X — closing the panel acknowledges
      // the alarm, it doesn't mean the water stopped.
      this.sceneManager.setAlarmRooms(
        leak
          ? leak.sensors.map((id) => this.roomOfEntity(id)?.key).filter((k): k is string => !!k)
          : [],
      );
    }
    // Anchor the control popup once its real height is known so it can never be
    // clipped by the card's overflow:hidden top/bottom edge.
    if (this.controlOpen) this.positionControlPopup();
    if (this.pinPromptOpen && _changed.has('pinPromptOpen')) {
      const input = this.renderRoot?.querySelector('.pin-input') as HTMLInputElement | null;
      input?.focus();
    }
  }

  /** Place the open control popup above the tap, or below (clamped) when there
   *  isn't room above — measured from the popup's actual height so a tall
   *  multi-device popup is never cut off by the card edges. */
  private positionControlPopup(): void {
    const el = this.renderRoot?.querySelector?.('.control-popup') as HTMLElement | null;
    if (!el) return;
    const cardH = this.viewport?.clientHeight ?? el.parentElement?.clientHeight ?? 480;
    const h = el.offsetHeight;
    const gap = 14;
    const margin = 8;
    const anchorY = this.controlPos[1];
    let top = anchorY - gap - h; // prefer sitting above the tapped object
    if (top < margin) {
      // Not enough room above → drop below, clamped to stay fully visible.
      top = anchorY + gap;
      if (top + h > cardH - margin) top = Math.max(margin, cardH - h - margin);
    }
    el.style.top = `${top}px`;
  }

  private applyHass(hass: HomeAssistant): void {
    if (!this.sceneManager) return;
    // Keep the scene's asset origin current so `/local/...` room photos resolve
    // against Home Assistant (needed on the file:// kiosk).
    this.sceneManager.setImageBase(this.assetBase(hass));
    // Reconcile optimistic overrides: once HA re-reports an entity (its state
    // object reference changed), the real value is authoritative — drop the
    // override so we don't fight it.
    if (this.optimistic.size && this.lastHass) {
      for (const [id, ov] of [...this.optimistic]) {
        if (hass.states[id] !== this.lastHass.states[id]) {
          clearTimeout(ov.timer);
          this.optimistic.delete(id);
        }
      }
    }
    // A pending setpoint stands until HA reports OUR value (confirmed) or some
    // other value (changed at the wall unit — that's authoritative). It must
    // NOT clear just because the entity object changed: these thermostats
    // re-report current_temperature long before the target, which would snap
    // the number back to the stale setpoint mid-press.
    if (this.optTemp.size) {
      for (const [id, ov] of [...this.optTemp]) {
        const t = hass.states[id]?.attributes?.temperature;
        if (typeof t !== 'number') continue;
        if (t === ov.temp || t !== ov.base) {
          clearTimeout(ov.timer);
          this.optTemp.delete(id);
        }
      }
    }
    this.lastHass = hass;
    this.pushEffective(hass);
    if (this.controlOpen) this.requestUpdate();
  }

  /** Origin for resolving root-relative asset paths (e.g. a room's `/local/…`
   *  design photo). Same-origin in the HA frontend (returns ''), the HA URL in
   *  the kiosk — read from `hass.hassUrl`, which both surfaces expose. */
  private assetBase(hass?: HomeAssistant): string {
    const h = hass as unknown as { hassUrl?: (p?: string) => string } | undefined;
    if (h?.hassUrl) {
      try {
        return String(h.hassUrl('/')).replace(/\/+$/, '');
      } catch {
        /* fall through to same-origin */
      }
    }
    return '';
  }

  /** hass with optimistic overrides layered on top (fresh objects for overridden
   *  entities so the scene-diff and Lit both see the change). */
  private effectiveHass(base: HomeAssistant): HomeAssistant {
    if (!this.optimistic.size) return base;
    const states: Record<string, any> = { ...base.states };
    for (const [id, ov] of this.optimistic) {
      const b = states[id];
      if (!b) continue;
      let ent: any = { ...b, state: ov.state };
      // Position-based covers (curtains) animate from current_position, not the
      // state string — override that too so they slide instantly.
      if (id.startsWith('cover.') && b.attributes && 'current_position' in b.attributes) {
        const pos = ov.state === 'open' ? 100 : ov.state === 'closed' ? 0 : b.attributes.current_position;
        ent = { ...ent, attributes: { ...b.attributes, current_position: pos } };
      }
      states[id] = ent;
    }
    return { ...base, states } as HomeAssistant;
  }

  /** Push the effective state to the 3D scene, updating only what changed. */
  private pushEffective(base: HomeAssistant): void {
    if (!this.sceneManager) return;
    const eff = this.effectiveHass(base);
    if (!this.lastPushed) {
      this.sceneManager.syncAll(eff);
    } else {
      for (const id in eff.states) {
        if (eff.states[id] !== this.lastPushed.states[id]) this.sceneManager.updateEntity(id, eff);
      }
    }
    this.lastPushed = eff;
  }

  /** Optimistically assume `state` for an entity until HA confirms (or reverts
   *  after a timeout). Reflects in the popup and the 3D scene immediately. */
  private setOptimistic(id: string, state: string): number {
    const prev = this.optimistic.get(id);
    if (prev) clearTimeout(prev.timer);
    const gen = ++this.optGen;
    const timer = setTimeout(() => {
      // Only revert if this generation is still the current one.
      if (this.optimistic.get(id)?.gen === gen) this.clearOptimistic(id);
    }, 5000);
    this.optimistic.set(id, { state, timer, gen });
    if (this.hass) this.pushEffective(this.hass);
    this.requestUpdate();
    return gen;
  }

  private clearOptimistic(id: string): void {
    const ov = this.optimistic.get(id);
    if (!ov) return;
    clearTimeout(ov.timer);
    this.optimistic.delete(id);
    if (this.hass) this.pushEffective(this.hass);
    this.requestUpdate();
  }

  /** Nudge a climate setpoint by `d` steps: snap to the step grid, clamp to the
   *  device's own min/max, show it at once, then send it. Stepping from the
   *  EFFECTIVE target (not HA's) is what lets ± tap repeatedly — 22 → 23 → 24 —
   *  while HA is still sitting on the old value. */
  private stepTemp(id: string, ent: HassEntity | undefined, target: number, step: number, d: number): void {
    const inv = step > 0 ? 1 / step : 2;
    let next = Math.round((target + d) * inv) / inv;
    const lo = Number(ent?.attributes?.min_temp);
    const hi = Number(ent?.attributes?.max_temp);
    if (Number.isFinite(lo)) next = Math.max(lo, next);
    if (Number.isFinite(hi)) next = Math.min(hi, next);
    if (next === target) return;
    this.setOptimisticTemp(id, next);
    this.svc('climate', 'set_temperature', { temperature: next }, id);
  }

  /** The setpoint to show and to step from: the pending one if we have an
   *  unconfirmed set_temperature in flight, else whatever HA reports. */
  private effTarget(id: string): number | undefined {
    const ov = this.optTemp.get(id);
    if (ov) return ov.temp;
    const v = this.hass?.states[id]?.attributes?.temperature;
    return typeof v === 'number' ? v : undefined;
  }

  /** Show `temp` as the setpoint until HA catches up (see optTemp). The window
   *  is generous because these thermostats can take far longer than a normal
   *  device to report; if HA never confirms, we fall back to its truth. */
  private setOptimisticTemp(id: string, temp: number): void {
    const prev = this.optTemp.get(id);
    if (prev) clearTimeout(prev.timer);
    const base = this.hass?.states[id]?.attributes?.temperature;
    const timer = setTimeout(() => {
      this.optTemp.delete(id);
      this.requestUpdate();
    }, 60000);
    this.optTemp.set(id, { temp, base: typeof base === 'number' ? base : undefined, timer });
    this.requestUpdate();
  }

  // -- Scene setup ------------------------------------------------------------

  private initScene(): void {
    if (!this.viewport) return;
    const bg = this.config?.background ?? '#1b1d22';
    this.sceneManager = new SceneManager(this.viewport, bg);
    this.qualityChoice = this.sceneManager.getQualityChoice();
    if (this.config?.cameraDistance) this.sceneManager.setCameraDistance(this.config.cameraDistance);
    this.sceneManager.setPickHandler((r) => this.handlePick(r));
    this.sceneManager.setRoomsHandler((rooms) => this.onRoomsChanged(rooms));
    this.sceneManager.setBackdropHandler((url) => {
      this.roomPhoto = url;
      this.roomPhotoBaked = null;
      if (url) this.bakeRoomPhoto(url);
    });
    this.sceneManager.start();
    this.loadActiveProject();
  }

  /** Render the room photo once with its blur/dim already applied, so the card
   *  can show a plain bitmap instead of a live CSS filter.
   *
   *  The filter version is re-evaluated by the compositor whenever the backdrop
   *  behind it repaints — which, with the 3D sitting on top, is every frame of
   *  every drag. Baking is the identical picture for a one-off cost. The photo
   *  is capped at 1280px on upload, so this is a single small draw.
   *
   *  Falls back to the raw photo (with the CSS filter) if anything here can't
   *  run: no 2D context, a cross-origin URL that taints the canvas, or a photo
   *  that fails to decode. */
  private bakeRoomPhoto(url: string): void {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // needed for /local/… to stay exportable
    img.onload = () => {
      if (this.roomPhoto !== url) return; // room changed while decoding
      try {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        if (!w || !h) return;
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        // Same look as the CSS rule this replaces. The scale-up compensates for
        // the blur softening the edges, exactly as the transform did.
        ctx.filter = 'blur(6px) brightness(0.92)';
        const over = 0.06;
        ctx.drawImage(img, -w * over * 0.5, -h * over * 0.5, w * (1 + over), h * (1 + over));
        const baked = canvas.toDataURL('image/jpeg', 0.86);
        if (this.roomPhoto === url) this.roomPhotoBaked = baked;
      } catch {
        /* tainted canvas or out of memory — the raw photo + CSS filter stands in */
      }
    };
    img.onerror = () => {
      /* the scene already validated it loads; nothing to do but keep the raw one */
    };
    img.src = url;
  }

  private async loadActiveProject(): Promise<void> {
    if (!this.config || !this.sceneManager) return;
    this.loadError = undefined;
    this.planLoaded = false;
    try {
      const plan = await this.resolvePlan();
      this.currentPlan = plan;
      this.sceneManager.loadPlan(plan);
      this.sceneManager.optimizeForView(); // merge static geometry (view mode)
      this.floorNames = plan.floors.map((f, i) => f.name || `Floor ${i + 1}`);
      this.activeFloorIndex = 0;
      this.planLoaded = true;
      // Push current state into the freshly built scene.
      if (this.hass) {
        this.lastHass = undefined;
        this.lastPushed = undefined;
        this.applyHass(this.hass);
      }
    } catch (err: any) {
      this.loadError = err?.message ?? String(err);
      console.error('[3d-floorplan] load failed:', err);
    }
  }

  private async resolvePlan(): Promise<FloorPlan> {
    const cfg = this.config!;
    // Always load the stored set first — it carries the edit PIN (and any saved
    // projects) regardless of how the plan itself is sourced. Without this, a
    // card configured with plan/url/projects would never see the PIN and the
    // edit lock would silently do nothing.
    this.storedProjects = await loadProjects(this.hass);
    if (cfg.projects && cfg.projects.length) {
      const proj =
        cfg.projects.find((p) => p.id === this.activeProjectId) ?? cfg.projects[0];
      return this.loadProjectRef(proj);
    }
    if (cfg.plan) return cfg.plan;
    if (cfg.url) return this.fetchPlan(cfg.url);
    // Nothing configured → named projects (HA shared / localStorage) or demo.
    this.projectList = listProjects(this.storedProjects);
    const id =
      this.storedProjects.active && this.storedProjects.projects[this.storedProjects.active]
        ? this.storedProjects.active
        : this.projectList[0]?.id;
    if (id) {
      this.currentProjectId = id;
      return this.storedProjects.projects[id];
    }
    this.currentProjectId = null;
    return DEMO_PLAN;
  }

  private async loadProjectRef(proj: ProjectRef): Promise<FloorPlan> {
    if (proj.plan) return proj.plan;
    if (proj.url) return this.fetchPlan(proj.url);
    if (this.config?.backend) {
      return this.fetchPlan(`${this.config.backend.replace(/\/$/, '')}/projects/${proj.id}`);
    }
    throw new Error(`Project "${proj.id}" has no plan, url, or backend.`);
  }

  private async fetchPlan(url: string): Promise<FloorPlan> {
    const res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
    return (await res.json()) as FloorPlan;
  }

  // -- Interaction ------------------------------------------------------------

  private handlePick(r: ClickResult | null): void {
    if (!r || !this.hass) {
      this.controlOpen = false;
      return;
    }
    // Anchor the popup near the tap (final vertical placement is clamped in
    // positionControlPopup once its real height is known).
    const vw = this.viewport?.clientWidth ?? 360;
    const vh = this.viewport?.clientHeight ?? 480;
    const sx = r.screen ? r.screen[0] : vw / 2;
    const sy = r.screen ? r.screen[1] : vh / 2;
    const x = Math.max(150, Math.min(vw - 150, sx));
    this.controlPos = [x, Math.max(0, Math.min(vh, sy))];

    if (r.roomKey && r.roomEntities && r.roomEntities.length) {
      // A room pin → fill the right-side panel with that room's devices.
      this.selectRoom(r.roomKey);
      return;
    }
    // A device tap → the tapped entity + any others stacked at the same spot.
    const near = r.point ? this.sceneManager!.entitiesNear(r.point, 1.6) : [];
    const list = near.length ? near : [{ entity_id: r.entity_id, behavior: r.behavior }];
    const seen = new Set<string>();
    this.controlEntities = [r.entity_id, ...list.map((e) => e.entity_id)].filter(
      (id) => id && !seen.has(id) && seen.add(id),
    );
    this.controlRoom = null;
    this.controlCategory = null;
    this.controlOpenedAt = performance.now();
    this.controlOpen = true;
    this.requestUpdate();
  }

  /** React to the scene's room list (plan load / floor switch). The panel opens
   *  with NO room in focus (full 3D + a hint); only keep a still-valid selection. */
  private onRoomsChanged(rooms: RoomInfo[]): void {
    this.rooms = rooms;
    if (this.activeRoomKey && !rooms.some((r) => r.key === this.activeRoomKey)) {
      this.activeRoomKey = null;
    }
    // The Обзор detail uses floor-qualified keys ("f{n}::…"), which never match
    // the active-floor list here — those are validated against the whole-home
    // map at render time (renderDetail returns nothing if a room vanished).
    if (this.detailRoomKey && !this.detailRoomKey.includes('::') && !rooms.some((r) => r.key === this.detailRoomKey)) {
      this.detailRoomKey = null;
    }
    this.sceneManager?.selectRoom(this.activeRoomKey);
    this.requestUpdate();
  }

  /** Select a room (or toggle off if it's already selected). */
  private selectRoom(key: string | null): void {
    this.activeRoomKey = this.activeRoomKey === key ? null : key;
    this.sceneManager?.selectRoom(this.activeRoomKey);
    this.requestUpdate();
  }

  private get activeRoom(): RoomInfo | undefined {
    return this.activeRoomKey ? this.rooms.find((r) => r.key === this.activeRoomKey) : undefined;
  }

  private openDetail(key: string): void {
    this.detailRoomKey = key;
    this.requestUpdate();
  }
  private closeDetail(): void {
    this.detailRoomKey = null;
    this.requestUpdate();
  }
  private get detailRoom(): RoomInfo | undefined {
    if (!this.detailRoomKey) return undefined;
    return this.overviewRoomByKey.get(this.detailRoomKey) ?? this.rooms.find((r) => r.key === this.detailRoomKey);
  }

  /** Set a light's colour temperature from a 0..100 slider (0 = warm, 100 = cold). */
  private setLightCT(id: string, pct: number): void {
    const a = this.hass?.states[id]?.attributes ?? {};
    const minK = Number(a.min_color_temp_kelvin) || 2200;
    const maxK = Number(a.max_color_temp_kelvin) || 6500;
    const kelvin = Math.round(minK + ((maxK - minK) * pct) / 100);
    this.svc('light', 'turn_on', { color_temp_kelvin: kelvin }, id, 'on');
  }

  /** Whether a light exposes colour-temperature control. */
  private lightSupportsCT(id: string): boolean {
    const a = this.hass?.states[id]?.attributes ?? {};
    const modes: string[] = a.supported_color_modes ?? [];
    return modes.includes('color_temp') || a.color_temp_kelvin != null || a.min_color_temp_kelvin != null;
  }

  /** Whether a light can be dimmed. On/off-only lights (['onoff']) return false,
   *  so no bogus brightness slider is shown for them. */
  private lightSupportsBrightness(id: string): boolean {
    const a = this.hass?.states[id]?.attributes ?? {};
    const modes: string[] = a.supported_color_modes ?? [];
    return (
      modes.some((m) => ['brightness', 'color_temp', 'hs', 'rgb', 'xy', 'rgbw', 'rgbww'].includes(m)) ||
      a.brightness != null
    );
  }

  private closeControl = (): void => {
    // A touch tap fires a synthesized "ghost" click ~300ms later that lands on
    // the freshly-rendered backdrop; ignore closes within that window so the
    // popup doesn't flash open and vanish on tablets.
    if (performance.now() - this.controlOpenedAt < 400) return;
    this.controlOpen = false;
    this.controlRoom = null;
    this.controlCategory = null;
  };

  /** Call a HA service for an entity in the control popup. When `optimisticState`
   *  is given we assume that result immediately (fast UI) and revert if the call
   *  rejects or HA never confirms. */
  private svc(
    domain: string,
    service: string,
    data: Record<string, any> = {},
    entityId?: string,
    optimisticState?: string,
  ): void {
    if (!this.hass) return;
    const gen = entityId && optimisticState !== undefined ? this.setOptimistic(entityId, optimisticState) : -1;
    // Revert only if OUR override is still the current one (a newer re-tap wins).
    const revertIfCurrent = () => {
      if (entityId && gen >= 0 && this.optimistic.get(entityId)?.gen === gen) this.clearOptimistic(entityId);
    };
    try {
      const p: any = this.hass.callService(domain, service, {
        ...(entityId ? { entity_id: entityId } : {}),
        ...data,
      });
      if (gen >= 0 && p && typeof p.catch === 'function') p.catch(revertIfCurrent);
    } catch {
      revertIfCurrent();
    }
  }

  /** Effective (optimistic-aware) state of an entity, for rendering controls. */
  private effState(id: string): string {
    return this.optimistic.get(id)?.state ?? this.hass?.states[id]?.state ?? 'unknown';
  }

  /** Toggle every device in a category at once: if any is on → all off, else all
   *  on (optimistic + revert-on-fail, like the individual controls). */
  private onToggleAll(ents: { entity_id: string; behavior: string }[]): void {
    if (!this.hass || !ents.length) return;
    const anyOn = ents.some((e) => this.effState(e.entity_id) === 'on');
    const service = anyOn ? 'turn_off' : 'turn_on';
    const optState = anyOn ? 'off' : 'on';
    const ids = ents.map((e) => e.entity_id);
    const gens = ids.map((id) => this.setOptimistic(id, optState));
    const revert = () =>
      ids.forEach((id, i) => {
        if (this.optimistic.get(id)?.gen === gens[i]) this.clearOptimistic(id);
      });
    try {
      const p: any = this.hass.callService('homeassistant', service, { entity_id: ids });
      if (p && typeof p.catch === 'function') p.catch(revert);
    } catch {
      revert();
    }
  }

  private onSelectFloor(index: number): void {
    this.activeFloorIndex = index;
    this.sceneManager?.setActiveFloor(index);
    // Re-sync state to the now-visible floor.
    if (this.hass) this.sceneManager?.syncAll(this.hass);
  }

  private onSelectProject(e: Event): void {
    this.activeProjectId = (e.target as HTMLSelectElement).value;
    this.loadActiveProject();
  }

  private onResetView(): void {
    this.sceneManager?.resetView();
  }

  /** Open the chrome-free full-screen kiosk page (HA panel only). */
  private openKiosk = (): void => {
    window.location.href = '/3d-floorplan-kiosk';
  };

  // --- Hidden Edit entry (long-press top-left corner) ----------------------
  // A deliberate 5s hold enters the editor (then the PIN gate, if set). It's a
  // long-press, NOT a tap count, so it can't clash with a kiosk browser's own
  // multi-tap menu gesture. Moving the finger cancels it.
  private hotspotTimer?: number;
  private hotspotStart?: { x: number; y: number };

  private onHotspotDown = (e: PointerEvent): void => {
    this.clearHotspot(); // reset any prior state BEFORE recording this press
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    this.hotspotStart = { x: e.clientX, y: e.clientY };
    this.hotspotTimer = window.setTimeout(() => {
      this.hotspotTimer = undefined;
      this.enterEdit();
    }, 5000);
  };

  private onHotspotMove = (e: PointerEvent): void => {
    if (
      this.hotspotStart &&
      Math.hypot(e.clientX - this.hotspotStart.x, e.clientY - this.hotspotStart.y) > 24
    ) {
      this.clearHotspot();
    }
  };

  private onHotspotUp = (): void => this.clearHotspot();

  private clearHotspot(): void {
    if (this.hotspotTimer) {
      clearTimeout(this.hotspotTimer);
      this.hotspotTimer = undefined;
    }
    this.hotspotStart = undefined;
  }

  /** True when the UI should be Russian (HA user language, else the browser). */
  private get isRu(): boolean {
    const l = (
      this.hass?.language ||
      (typeof navigator !== 'undefined' ? navigator.language : '') ||
      ''
    ).toLowerCase();
    return l.startsWith('ru');
  }

  /** Translate a user-visible string. English is the key + fallback. */
  private t(en: string): string {
    return this.isRu ? RU_STRINGS[en] ?? en : en;
  }

  private qualityLabel(q: QualityChoice): string {
    return this.t({ auto: 'Auto', high: 'High', medium: 'Medium', low: 'Low' }[q]);
  }

  private onPickQuality(q: QualityChoice): void {
    this.qualityMenuOpen = false;
    if (!this.sceneManager) return;
    const needsReload = this.sceneManager.setQuality(q);
    this.qualityChoice = q;
    const tier = this.sceneManager.getQualityTier();
    this.showToast(
      `${this.t('Quality')}: ${this.qualityLabel(q)}${q === 'auto' ? ` (${tier})` : ''}` +
        (needsReload ? ' — reload to finish applying' : ''),
    );
  }

  // -- Editor -----------------------------------------------------------------

  /** Edit button → enter edit, unless a PIN is set and we're still locked. */
  private enterEdit(): void {
    if (this.hasEditPin() && !this.editUnlocked) {
      this.pinError = '';
      this.pinPromptOpen = true;
      return;
    }
    this.doEnterEdit();
  }

  private hasEditPin(): boolean {
    return !!this.storedProjects.editPin;
  }

  private checkEditPin(value: string): boolean {
    return !!value && this.storedProjects.editPin === hashPin(value);
  }

  private submitPin(e?: Event): void {
    e?.preventDefault();
    const input = this.renderRoot?.querySelector('.pin-input') as HTMLInputElement | null;
    const val = input?.value ?? '';
    if (this.checkEditPin(val)) {
      this.editUnlocked = true;
      this.pinPromptOpen = false;
      this.pinError = '';
      this.doEnterEdit();
    } else {
      this.pinError = 'Wrong PIN — try again';
      if (input) input.value = '';
    }
  }

  private cancelPin = (): void => {
    this.pinPromptOpen = false;
    this.pinError = '';
  };

  /** Set or change the edit PIN (called from inside the editor). */
  private async onSetEditPin(): Promise<void> {
    const v = this.editPinInput.trim();
    if (v.length < 3) {
      this.showToast('PIN must be at least 3 characters');
      return;
    }
    // Re-read the shared set first so we don't clobber projects (or a PIN) saved
    // meanwhile on another device/tab — same guard as onSavePlan/onDeleteProject.
    this.storedProjects = await loadProjects(this.hass);
    this.storedProjects.editPin = hashPin(v);
    this.editPinInput = '';
    this.editUnlocked = true; // we're already editing
    await saveProjects(this.storedProjects, this.hass);
    this.showToast('Edit PIN set');
    this.requestUpdate();
  }

  private async onRemoveEditPin(): Promise<void> {
    this.storedProjects = await loadProjects(this.hass);
    delete this.storedProjects.editPin;
    await saveProjects(this.storedProjects, this.hass);
    this.showToast('Edit PIN removed');
    this.requestUpdate();
  }

  private onRenameFloor(e: Event): void {
    this.editor?.setFloorName(this.editFloorIndex, (e.target as HTMLInputElement).value);
  }

  private doEnterEdit(): void {
    if (!this.sceneManager || !this.currentPlan) return;
    this.qualityMenuOpen = false; // don't let the view-mode menu outlive its DOM
    // Edit a deep copy so View mode keeps the last saved/loaded plan until save.
    const editable: FloorPlan = JSON.parse(JSON.stringify(this.currentPlan));
    this.editor = new EditorController(this.sceneManager, editable);
    this.editor.onChange = () => {
      const ed = this.editor!;
      this.editTool = ed.tool;
      this.editSelectedModel = ed.selectedModel;
      this.editSelectedEntity = ed.selectedEntity;
      this.editSelectedObjModel = ed.selectedObjectModel;
      this.editSelectedKind = ed.selectedKind;
      this.editOpeningKind = ed.selectedOpeningKind;
      this.editOpeningVariant = ed.selectedOpeningVariant;
      this.editOpeningWidth = ed.selectedOpeningWidth;
      this.editSelectedColor = ed.selectedColor;
      this.editSelectedWallLength = ed.selectedWallLength;
      this.editSelectedWallThickness = ed.selectedWallThickness;
      this.editSelectedWallAngle = ed.selectedWallAngle;
      this.editRoom = ed.selectedRoomData;
      this.editFurnScale = ed.selectedFurnitureScale as [number, number, number] | null;
      this.editMaterial = ed.selectedMaterial;
      this.editFloorIndex = ed.floorIndex;
      this.editPlanName = ed.plan.name ?? '';
      this.editCanUndo = ed.canUndo;
      this.editCanRedo = ed.canRedo;
      this.editUnderlay = ed.underlay;
      this.editCameraDistance = ed.cameraDistance;
      this.editIsLight = ed.selectedIsLight;
      this.editBrightness = ed.selectedBrightness;
      this.editIsLightSet = ed.selectedIsLightSet;
      this.editSpread = ed.selectedSpread;
      this.editCount = ed.selectedCount;
      this.editZones = [...ed.zones];
      this.editSelectedZoneId = ed.selectedZoneId;
      this.editZonePlacing = ed.zonePlacing;
      this.requestUpdate();
    };
    this.editor.onMessage = (m) => this.showToast(m);
    this.editor.onCalibrate = (measured) => {
      const s = window.prompt(
        `Measured ${measured.toFixed(2)} m on screen between those points.\nEnter their REAL length in meters:`,
      );
      const real = parseFloat(s ?? '');
      if (real > 0) this.editor?.applyUnderlayScale(measured, real);
      else this.showToast('Calibration cancelled');
    };
    this.sceneManager.loadPlan(editable, true);
    // Edit the floor the user is currently viewing — not always floor 0.
    this.editor.floorIndex = Math.min(this.activeFloorIndex, editable.floors.length - 1);
    this.editFloorIndex = this.editor.floorIndex;
    this.editor.setSnap(this.editSnap); // carry the snap preference into the new editor
    this.editShowAllEntities = false;
    this.editingProjectId = this.currentProjectId; // edit the project currently loaded
    this.editPlanName = editable.name ?? 'Plan';
    this.editor.start();
    this.editing = true;
    this.editTool = this.editor.tool;
    this.showToast('Edit mode — pick "Draw wall", tap the floor to place points');
  }

  private async exitEdit(): Promise<void> {
    // Done = auto-save: no need to press Save separately.
    if (this.editor) await this.onSavePlan();
    this.editor?.stop();
    this.editor = undefined;
    this.editing = false;
    // Reload the last saved/loaded plan for clean View mode.
    if (this.currentPlan && this.sceneManager) {
      this.sceneManager.loadPlan(this.currentPlan);
      this.sceneManager.optimizeForView(); // re-merge static geometry for view
      if (this.hass) {
        this.lastHass = undefined;
        this.lastPushed = undefined;
        this.applyHass(this.hass);
      }
    }
  }

  private onEditTool(t: EditTool): void {
    this.editor?.setTool(t);
  }

  private onSelectEditFloor(e: Event): void {
    const i = parseInt((e.target as HTMLSelectElement).value, 10);
    if (Number.isNaN(i) || !this.editor) return;
    if (i < 0 || i >= this.editor.plan.floors.length) return;
    this.editor.setFloor(i);
    this.activeFloorIndex = i;
  }

  private onUndoPoint(): void {
    this.editor?.undoPoint();
  }

  private onUndo(): void {
    this.editor?.undo();
  }

  private onRedo(): void {
    this.editor?.redo();
  }

  private onMergeWalls(): void {
    this.editor?.mergeWalls();
  }

  private onAutoFloors(): void {
    this.editor?.autoFloors();
  }

  private onSetCameraDistance(e: Event): void {
    const v = parseFloat((e.target as HTMLInputElement).value);
    if (!Number.isNaN(v)) this.editor?.setCameraDistance(v);
  }

  private onSetBrightness(e: Event): void {
    const v = parseFloat((e.target as HTMLInputElement).value);
    if (!Number.isNaN(v)) this.editor?.setBrightness(v);
  }

  private onSetSpread(e: Event): void {
    const v = parseFloat((e.target as HTMLInputElement).value);
    if (!Number.isNaN(v)) this.editor?.setSpread(v);
  }

  private onSetCount(e: Event): void {
    const v = parseInt((e.target as HTMLInputElement).value, 10);
    if (!Number.isNaN(v)) this.editor?.setCount(v);
  }

  // -- Manual room zones --
  private onAddZone(): void {
    this.editor?.addZone();
  }
  private onSelectZone(id: string | null): void {
    this.editor?.selectZone(id);
  }
  private onSetZoneName(id: string, e: Event): void {
    this.editor?.setZoneName(id, (e.target as HTMLInputElement).value);
  }
  private onZonePlace(): void {
    this.editor?.beginZonePlace();
  }
  private onToggleZoneDevice(id: string, entityId: string): void {
    this.editor?.toggleZoneDevice(id, entityId);
  }
  private onMoveZone(id: string, dir: -1 | 1): void {
    this.editor?.moveZone(id, dir);
  }
  private onMoveZoneEntity(id: string, entityId: string, dir: -1 | 1): void {
    this.editor?.moveZoneEntity(id, entityId, dir);
  }
  private onDeleteZone(id: string): void {
    this.editor?.deleteZone(id);
  }

  /** Friendly label for an entity in the editor lists (name, else the id). */
  private entityShort(eid: string): string {
    return this.hass?.states[eid]?.attributes?.friendly_name ?? eid;
  }

  /** If this entity is already assigned to a DIFFERENT manual room, that room's
   *  name — so the picker can flag entities that are already taken (first zone
   *  to list an entity owns it, so a second assignment is silently ignored). */
  private boundElsewhere(eid: string, exceptZoneId: string): string | null {
    for (const z of this.editZones) {
      if (z.id !== exceptZoneId && (z.entities ?? []).includes(eid)) return z.name || 'Room';
    }
    return null;
  }

  private onSetOpeningVariant(e: Event): void {
    this.editor?.setOpeningVariant((e.target as HTMLSelectElement).value);
  }

  private onSetOpeningKind(e: Event): void {
    this.editor?.setOpeningKind((e.target as HTMLSelectElement).value as 'door' | 'window' | 'opening');
  }

  private onSetOpeningWidth(e: Event): void {
    const v = parseFloat((e.target as HTMLInputElement).value);
    if (!Number.isNaN(v) && v > 0) this.editor?.setOpeningWidth(v);
  }

  private onToggleSnap(): void {
    if (!this.editor) return;
    this.editSnap = !this.editSnap;
    this.editor.setSnap(this.editSnap);
  }

  private onNewPlan(): void {
    if (!this.editor) return;
    // "New" creates a separate project — your other SAVED projects are untouched.
    const ok = window.confirm(
      'Create a NEW project?\n\nYour other saved projects stay. Unsaved changes in the current one will be lost. Draw, then Save to keep the new project.',
    );
    if (!ok) return;
    const name = `Plan ${this.projectList.length + 1}`;
    // New is an unsaved project — don't touch currentProjectId (the view plan).
    // It gets a fresh id only on Save, so it never overwrites another project.
    this.editingProjectId = null;
    this.editor.loadPlan(blankPlan(name));
    this.editPlanName = name;
    this.showToast('New project — draw it, then Save to keep it');
  }

  private onRenamePlan(e: Event): void {
    const name = (e.target as HTMLInputElement).value;
    this.editPlanName = name;
    if (this.editor) this.editor.plan.name = name;
  }

  private onSelectStorageProject(e: Event): void {
    const id = (e.target as HTMLSelectElement).value;
    if (!id || id === this.currentProjectId) return;
    const plan = this.storedProjects.projects[id];
    if (!plan) return;
    if (
      this.editing &&
      !window.confirm('Switch project? Unsaved changes in the current one will be lost.')
    ) {
      this.requestUpdate();
      return;
    }
    this.currentProjectId = id;
    this.editingProjectId = id;
    this.activeFloorIndex = 0;
    const copy: FloorPlan = JSON.parse(JSON.stringify(plan));
    const viewCopy: FloorPlan = JSON.parse(JSON.stringify(plan));
    this.currentPlan = viewCopy;
    this.floorNames = plan.floors.map((f, i) => f.name || `Floor ${i + 1}`);
    if (this.editing && this.editor) {
      this.editor.loadPlan(copy);
      this.editPlanName = copy.name ?? '';
    } else if (this.sceneManager) {
      this.sceneManager.loadPlan(viewCopy);
      if (this.hass) {
        this.lastHass = undefined;
        this.lastPushed = undefined;
        this.applyHass(this.hass);
      }
    }
    this.showToast(`Loaded "${plan.name || id}"`);
  }

  private async onDeleteProject(): Promise<void> {
    const id = this.editingProjectId ?? this.currentProjectId;
    // Re-read so a concurrent change elsewhere isn't lost by this delete-save.
    this.storedProjects = await loadProjects(this.hass);
    if (!id || !this.storedProjects.projects[id]) {
      this.showToast('This project is not saved yet');
      return;
    }
    if (!window.confirm(`Delete project "${this.storedProjects.projects[id].name || id}"? This cannot be undone.`))
      return;
    delete this.storedProjects.projects[id];
    const remaining = listProjects(this.storedProjects);
    this.storedProjects.active = remaining[0]?.id;
    await saveProjects(this.storedProjects, this.hass);
    this.projectList = remaining;
    this.currentProjectId = this.storedProjects.active ?? null;
    this.editingProjectId = this.currentProjectId;
    this.activeFloorIndex = 0;
    const next = this.currentProjectId
      ? this.storedProjects.projects[this.currentProjectId]
      : blankPlan();
    this.currentPlan = JSON.parse(JSON.stringify(next));
    this.floorNames = next.floors.map((f, i) => f.name || `Floor ${i + 1}`);
    if (this.editor) {
      this.editor.loadPlan(JSON.parse(JSON.stringify(next)));
      this.editPlanName = next.name ?? '';
    }
    this.showToast('Project deleted');
  }

  private onSetColor(e: Event): void {
    const color = (e.target as HTMLInputElement).value;
    this.editor?.setColor(color);
  }

  private onSetFurnScale(axis: 0 | 1 | 2, e: Event): void {
    const v = parseFloat((e.target as HTMLInputElement).value);
    if (!Number.isNaN(v)) this.editor?.setFurnitureScale(axis, v);
  }

  private onSetMaterial(e: Event): void {
    this.editor?.setSurfaceMaterial((e.target as HTMLSelectElement).value);
  }

  private onOpenImport(): void {
    this.importText = '';
    this.importOpen = true;
  }

  private onExportPlan(): void {
    if (this.editor) this.importText = JSON.stringify(this.editor.plan, null, 2);
    else if (this.currentPlan) this.importText = JSON.stringify(this.currentPlan, null, 2);
    this.importOpen = true;
  }

  private onImportText(e: Event): void {
    this.importText = (e.target as HTMLTextAreaElement).value;
  }

  private async onImportLoad(): Promise<void> {
    let plan: FloorPlan;
    try {
      const raw = JSON.parse(this.importText);
      // Accept native Zircon3D `spacePlan` exports by converting them on the fly.
      plan = isZirconPlan(raw) ? convertZircon(raw) : (raw as FloorPlan);
      if (!plan || !Array.isArray(plan.floors) || plan.floors.length === 0) {
        throw new Error('Plan must have a non-empty "floors" array');
      }
    } catch (err: any) {
      this.showToast(`Import failed: ${err?.message ?? 'invalid JSON'}`);
      return;
    }
    if (!this.editor) this.doEnterEdit();
    if (!this.editor) return;
    this.editor.loadPlan(plan);
    this.editingProjectId = null; // imported = a new project until saved
    this.editPlanName = plan.name ?? 'Imported';
    this.importOpen = false;
    await this.onSavePlan();
    this.showToast(`Imported "${plan.name ?? 'plan'}" and saved`);
  }

  private onNudgeHeight(delta: number): void {
    this.editor?.nudgeHeight(delta);
  }

  private onSlideOpening(delta: number): void {
    this.editor?.nudgeOpeningPosition(delta);
  }

  private onSetWallLength(e: Event): void {
    const v = parseFloat((e.target as HTMLInputElement).value);
    if (!Number.isNaN(v) && v > 0) this.editor?.setWallLength(v);
  }

  private onSetWallThickness(e: Event): void {
    const v = parseFloat((e.target as HTMLInputElement).value);
    if (!Number.isNaN(v) && v > 0) this.editor?.setWallThickness(v);
  }

  private onSetWallAngle(e: Event): void {
    const v = parseFloat((e.target as HTMLInputElement).value);
    if (!Number.isNaN(v)) this.editor?.setWallAngle(v);
  }

  private onDeleteWallOpening(i: number): void {
    this.editor?.deleteWallOpening(i);
  }

  private onDeleteRoomOpening(i: number): void {
    this.editor?.deleteRoomOpening(i);
  }

  private onAddFloor(): void {
    this.editor?.addFloor();
  }

  private onAddRoomShape(shape: RoomShape): void {
    this.editor?.addRoomShape(shape);
  }

  /** Import a 2D plan image as a tracing underlay (reference). */
  private onPickUnderlay(e: Event): void {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !this.editor) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result || '');
      const img = new Image();
      img.onload = () => {
        this.editor?.setUnderlayImage(url, img.naturalWidth, img.naturalHeight);
      };
      img.onerror = () => this.showToast('Could not read that image');
      img.src = url;
    };
    reader.onerror = () => this.showToast('Could not read that file');
    reader.readAsDataURL(file);
    input.value = ''; // allow re-picking the same file
  }

  private onSetUnderlayField(field: 'widthM' | 'opacity' | 'rotation', e: Event): void {
    const v = parseFloat((e.target as HTMLInputElement).value);
    this.editor?.setUnderlayField(field, v);
  }

  private onNudgeUnderlay(dx: number, dz: number): void {
    this.editor?.nudgeUnderlay(dx, dz);
  }

  private onRemoveUnderlay(): void {
    this.editor?.removeUnderlay();
  }

  private onCalibrateUnderlay(): void {
    this.editor?.startUnderlayCalibration();
  }

  private onFinishWall(): void {
    this.editor?.finishChain();
  }

  private onSetRoomField(
    field: 'name' | 'width' | 'depth' | 'height' | 'rotation',
    e: Event,
  ): void {
    this.editor?.setRoomField(field, (e.target as HTMLInputElement).value);
  }

  /** Set the focused manual room's (zone's) design photo from a typed URL. */
  private onSetZoneBg(id: string, e: Event): void {
    this.editor?.setZoneBgImage(id, (e.target as HTMLInputElement).value);
  }

  private onClearZoneBg(id: string): void {
    this.editor?.setZoneBgImage(id, '');
  }

  private onUploadZoneBg(id: string, e: Event): void {
    this.pickDesignPhoto(e, (data) => this.editor?.setZoneBgImage(id, data));
  }

  /** Read a design photo picked from the device and hand the encoded image to
   *  `apply`. The picture is downscaled and re-encoded first, so the per-user
   *  plan JSON (synced to the tablet every ~10s) doesn't balloon with a
   *  full-resolution photo. */
  private pickDesignPhoto(e: Event, apply: (data: string) => void): void {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !this.editor) return;
    const reader = new FileReader();
    reader.onload = () => {
      const src = String(reader.result || '');
      const img = new Image();
      img.onload = () => {
        const MAX = 1280; // cap the long edge
        const scale = Math.min(1, MAX / Math.max(img.naturalWidth, img.naturalHeight));
        const w = Math.max(1, Math.round(img.naturalWidth * scale));
        const h = Math.max(1, Math.round(img.naturalHeight * scale));
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        let data = src;
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          try {
            data = canvas.toDataURL('image/jpeg', 0.82);
          } catch {
            data = src; // tainted/oversized — fall back to the original
          }
        }
        apply(data);
      };
      img.onerror = () => this.showToast('Не удалось прочитать изображение');
      img.src = src;
    };
    reader.onerror = () => this.showToast('Не удалось прочитать файл');
    reader.readAsDataURL(file);
    input.value = ''; // allow re-picking the same file
  }

  private trackShift = (e: KeyboardEvent) => {
    if (this.editor) this.editor.shiftHeld = e.shiftKey;
    // Undo/redo shortcuts while editing.
    if (this.editing && this.editor && e.type === 'keydown' && (e.ctrlKey || e.metaKey)) {
      const k = e.key.toLowerCase();
      if (k === 'z' && !e.shiftKey) {
        e.preventDefault();
        this.editor.undo();
      } else if (k === 'y' || (k === 'z' && e.shiftKey)) {
        e.preventDefault();
        this.editor.redo();
      }
    }
    // Enter finishes the current wall run; Escape cancels it.
    if (this.editing && this.editor && e.type === 'keydown') {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.editor.finishChain();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        this.editor.cancelChain();
      }
    }
  };

  private onDeleteFloor(): void {
    if (!window.confirm('Delete this floor and everything on it?')) return;
    this.editor?.deleteFloor();
  }

  private pickModel(model: string): void {
    if (!this.editor) return;
    this.editor.selectedModel = model;
    this.editSelectedModel = model;
    this.paletteOpen = false;
  }

  private togglePalette(): void {
    this.paletteOpen = !this.paletteOpen;
  }

  private onRotateSelected(): void {
    this.editor?.rotateSelected();
  }

  private onDeleteSelected(): void {
    this.editor?.deleteSelected();
  }

  private onPickEntity(e: Event): void {
    const entityId = (e.target as HTMLSelectElement).value || null;
    this.editor?.bindEntity(entityId);
    this.showToast(entityId ? `Bound ${entityId}` : 'Binding cleared');
  }

  /** Entity ids for the selected piece, filtered by its natural domain(s).
   *  If the domain filter matches nothing, fall back to ALL entities so the
   *  dropdown is never empty. */
  private candidateEntities(domains: string[]): { ids: string[]; fellBack: boolean } {
    if (!this.hass) return { ids: [], fellBack: false };
    const all = Object.keys(this.hass.states);
    let ids = domains.length
      ? all.filter((id) => domains.includes(id.split('.')[0]))
      : all;
    const fellBack = domains.length > 0 && ids.length === 0;
    if (fellBack) ids = all; // filter too strict → show everything
    // Sort by room (area) first, then friendly name — groups same-named entities
    // by where they are so the right one is easy to pick.
    ids = [...ids].sort((a, b) => {
      const ra = this.entityArea(a);
      const rb = this.entityArea(b);
      if (ra !== rb) return (ra || '￿').localeCompare(rb || '￿');
      return this.entityLabel(a).localeCompare(this.entityLabel(b));
    });
    return { ids, fellBack };
  }

  private entityLabel(id: string): string {
    return this.hass?.states[id]?.attributes?.friendly_name || id;
  }

  /** The HA area (room) an entity belongs to: its own area, else its device's. */
  private entityArea(id: string): string {
    const h = this.hass as any;
    const ent = h?.entities?.[id];
    let areaId: string | undefined = ent?.area_id ?? undefined;
    if (!areaId && ent?.device_id) areaId = h?.devices?.[ent.device_id]?.area_id;
    if (!areaId) return '';
    const a = h?.areas?.[areaId];
    return (a?.name as string) || '';
  }

  /** Rich option text: "Friendly name · Room · entity.id" so same-named
   *  entities in different rooms are easy to tell apart. */
  private entityOptionText(id: string): string {
    const name = this.entityLabel(id);
    const area = this.entityArea(id);
    const parts = [name];
    if (area) parts.push(area);
    if (id !== name) parts.push(id);
    return parts.join('  ·  ');
  }

  private async onSavePlan(): Promise<void> {
    if (!this.editor) return;
    const plan = this.editor.plan;
    if (!plan.name) plan.name = this.editPlanName || 'Plan';
    // Re-read the shared set first, then apply only THIS project, so we never
    // clobber projects saved meanwhile on another device/tab.
    this.storedProjects = await loadProjects(this.hass);
    let id = this.editingProjectId;
    if (!id) {
      id = newProjectId();
      while (this.storedProjects.projects[id]) id = newProjectId();
    }
    this.editingProjectId = id;
    this.currentProjectId = id;
    this.storedProjects.projects[id] = JSON.parse(JSON.stringify(plan));
    this.storedProjects.active = id;
    const res = await saveProjects(this.storedProjects, this.hass);
    // Adopt the saved plan as the current View-mode plan + refresh project list.
    this.currentPlan = JSON.parse(JSON.stringify(plan));
    this.projectList = listProjects(this.storedProjects);
    this.floorNames = plan.floors.map((f, i) => f.name || `Floor ${i + 1}`);
    this.showToast(
      res.ha
        ? `Saved "${plan.name}" to Home Assistant (all devices)`
        : `Saved "${plan.name}" locally (HA unavailable)`,
    );
  }

  private showToast(msg: string): void {
    this.toast = msg;
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(() => {
      this.toast = undefined;
      this.requestUpdate();
    }, 3200);
  }

  // -- Lit lifecycle ----------------------------------------------------------

  /** Register the Onest webfont once at the document level. @font-face rules are
   *  ignored inside Shadow DOM, so the card's shadow styles can only *use* the
   *  family if it's declared in the light DOM (here). Guarded so many cards share
   *  the one <style>. */
  private static injectFonts(): void {
    if (typeof document === 'undefined' || document.getElementById('ha3d-onest-font')) return;
    const style = document.createElement('style');
    style.id = 'ha3d-onest-font';
    style.textContent = FONT_FACE_CSS;
    (document.head || document.documentElement).appendChild(style);
  }

  public override connectedCallback(): void {
    super.connectedCallback();
    Ha3dFloorplanCard.injectFonts();
    this.sceneManager?.start();
    window.addEventListener('keydown', this.trackShift);
    window.addEventListener('keyup', this.trackShift);
    // Tick the panel clock on the minute boundary-ish (every 10s is plenty).
    this.now = new Date();
    this.clockTimer = window.setInterval(() => (this.now = new Date()), 10000);
    // Screensaver: any input wakes it and re-arms the idle timer.
    this.idleEvents.forEach((ev) => window.addEventListener(ev, this.onActivity, { passive: true }));
    this.armIdle();
  }

  public override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.sceneManager?.stop();
    window.removeEventListener('keydown', this.trackShift);
    window.removeEventListener('keyup', this.trackShift);
    if (this.clockTimer) window.clearInterval(this.clockTimer);
    if (this.idleTimer) window.clearTimeout(this.idleTimer);
    this.idleEvents.forEach((ev) => window.removeEventListener(ev, this.onActivity));
  }

  private readonly idleEvents = ['pointerdown', 'keydown', 'wheel', 'touchstart'];
  private onActivity = (): void => this.wake();

  /** (Re)start the idle countdown. idleMinutes: config, default 10, 0 = disabled. */
  private armIdle(): void {
    if (this.idleTimer) window.clearTimeout(this.idleTimer);
    const min = this.config?.idleMinutes ?? 10;
    if (!(min > 0) || this.editing) return; // never dim while editing
    this.idleTimer = window.setTimeout(() => {
      this.now = new Date();
      this.idle = true;
    }, min * 60000);
  }

  private wake(): void {
    if (this.idle) this.idle = false;
    this.armIdle();
  }

  private renderPaletteCell(model: string, label: string) {
    return html`
      <button
        class="palette-cell ${model === this.editSelectedModel ? 'active' : ''}"
        title=${label}
        @click=${() => this.pickModel(model)}
      >
        <img src=${getThumbnail(model)} alt="" />
        <span>${label}</span>
      </button>
    `;
  }

  private renderEditor() {
    const tool = this.editTool;
    const label = (k: string) =>
      k.replace(/_/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
    const furnitureKeys = FURNITURE_KEYS.filter((k) => !LIGHT_KEYS.includes(k));
    const kind = this.editSelectedKind;
    const hasSelection = tool === 'select' && !!kind;
    const isFurniture = kind === 'furniture';

    return html`
      <div class="overlay top-left toolbar">
        <div class="ed-head"><span>✎ Editor</span></div>

        <div class="grid2">
          <button class="btn" title="Undo (Ctrl+Z)" ?disabled=${!this.editCanUndo}
            @click=${this.onUndo}>↶ Undo</button>
          <button class="btn" title="Redo (Ctrl+Y)" ?disabled=${!this.editCanRedo}
            @click=${this.onRedo}>↷ Redo</button>
          <button class="btn" title="Merge duplicate / overlapping walls into one"
            @click=${this.onMergeWalls}>🧹 Merge</button>
          <button class="btn" title="Fill every closed wall loop with a floor"
            @click=${this.onAutoFloors}>▦ Auto floors</button>
        </div>

        <div class="panel-group">Tools</div>
        <div class="grid2">
          <button class="btn ${tool === 'wall' ? 'active' : ''}" title="Draw walls"
            @click=${() => this.onEditTool('wall')}>▟ Wall</button>
          <button class="btn ${tool === 'arc' ? 'active' : ''}" title="Curved wall — tap start, tap end, then move to bulge the arc and tap"
            @click=${() => this.onEditTool('arc')}>◜ Curve</button>
          <button class="btn ${tool === 'door' ? 'active' : ''}" title="Add a door — tap a wall"
            @click=${() => this.onEditTool('door')}>🚪 Door</button>
          <button class="btn ${tool === 'window' ? 'active' : ''}" title="Add a window — tap a wall"
            @click=${() => this.onEditTool('window')}>🪟 Window</button>
          <button class="btn ${tool === 'opening' ? 'active' : ''}" title="Add an open passage (no door) — tap a wall"
            @click=${() => this.onEditTool('opening')}>⬚ Opening</button>
          <button class="btn ${tool === 'floor' ? 'active' : ''}" title="Trace a floor: tap corners, tap start (or Finish) to close"
            @click=${() => this.onEditTool('floor')}>▱ Floor</button>
          <button class="btn ${tool === 'furniture' ? 'active' : ''}" title="Place furniture"
            @click=${() => this.onEditTool('furniture')}>🛋 Furniture</button>
          <button class="btn span2 ${tool === 'select' ? 'active' : ''}" title="Select / move / bind (camera always works: drag empty = orbit)"
            @click=${() => this.onEditTool('select')}>☝ Select</button>
        </div>
        ${tool === 'arc'
          ? html`<span class="hint">Curve: tap start · tap end · move to bend the arc · tap to place (Finish/Esc cancels)</span>`
          : nothing}
        <span class="hint">Camera always on: drag empty space = orbit · two fingers = pan/zoom · tap = act</span>

        <div class="panel-group">Building parts — drop a room</div>
        <div class="grid2">
          <button class="btn" title="Rectangle room" @click=${() => this.onAddRoomShape('rect')}>▭ Rect</button>
          <button class="btn" title="L-shaped room" @click=${() => this.onAddRoomShape('lshape')}>L L-shape</button>
          <button class="btn span2" title="Bevelled room" @click=${() => this.onAddRoomShape('bevel')}>⬡ Bevel</button>
        </div>
        <span class="hint">then drag / rotate / resize it</span>

        <div class="panel-group">Reference image — trace a 2D plan</div>
        ${this.editUnderlay
          ? html`<div class="toolrow">
                <label class="hint">Width (m):</label>
                <input class="num-input" type="number" min="0.5" step="0.1"
                  .value=${String(this.editUnderlay.widthM)}
                  @change=${(e: Event) => this.onSetUnderlayField('widthM', e)} />
                <label class="hint">Opacity:</label>
                <input type="range" min="0.05" max="1" step="0.05"
                  .value=${String(this.editUnderlay.opacity ?? 0.6)}
                  @input=${(e: Event) => this.onSetUnderlayField('opacity', e)} />
                <label class="hint">Rotate°:</label>
                <input class="num-input" type="number" step="1"
                  .value=${String(this.editUnderlay.rotation ?? 0)}
                  @change=${(e: Event) => this.onSetUnderlayField('rotation', e)} />
              </div>
              <div class="toolrow">
                <span class="hint">Move:</span>
                <button class="btn" @click=${() => this.onNudgeUnderlay(-0.25, 0)}>◀</button>
                <button class="btn" @click=${() => this.onNudgeUnderlay(0.25, 0)}>▶</button>
                <button class="btn" @click=${() => this.onNudgeUnderlay(0, -0.25)}>▲</button>
                <button class="btn" @click=${() => this.onNudgeUnderlay(0, 0.25)}>▼</button>
                <button class="btn" title="Set scale by tapping two points of known length"
                  @click=${this.onCalibrateUnderlay}>📏 Calibrate (2 pts)</button>
                <button class="btn" title="Remove reference image" @click=${this.onRemoveUnderlay}>🗑 Remove</button>
              </div>`
          : html`<div class="toolrow">
              <label class="btn" title="Import a top-down 2D plan image to trace over">
                📷 Import image
                <input type="file" accept="image/*" style="display:none"
                  @change=${this.onPickUnderlay} />
              </label>
              <span class="hint">then set its width (m) and draw walls over it</span>
            </div>`}

        <div class="panel-group">Surfaces — color &amp; wallpaper</div>
        <div class="toolrow">
          <span class="hint">Walls</span>
          <input class="color" type="color" title="Color for ALL walls"
            .value=${this.editAllWallColor}
            @change=${(e: Event) => {
              this.editAllWallColor = (e.target as HTMLInputElement).value;
              this.editor?.setAllWallsColor(this.editAllWallColor);
            }} />
          <select class="select" title="Wallpaper for ALL walls"
            @change=${(e: Event) => {
              this.editAllWallMat = (e.target as HTMLSelectElement).value;
              this.editor?.setAllWallsMaterial(this.editAllWallMat);
            }}>
            ${WALL_MATERIALS.map(
              (m) => html`<option value=${m} ?selected=${m === this.editAllWallMat}>${m}</option>`,
            )}
          </select>
        </div>
        <div class="toolrow">
          <span class="hint">Floor</span>
          <input class="color" type="color" title="Color for ALL floors"
            .value=${this.editAllFloorColor}
            @change=${(e: Event) => {
              this.editAllFloorColor = (e.target as HTMLInputElement).value;
              this.editor?.setAllFloorsColor(this.editAllFloorColor);
            }} />
          <select class="select" title="Material for ALL floors"
            @change=${(e: Event) => {
              this.editAllFloorMat = (e.target as HTMLSelectElement).value;
              this.editor?.setAllFloorsMaterial(this.editAllFloorMat);
            }}>
            ${FLOOR_MATERIALS.map(
              (m) => html`<option value=${m} ?selected=${m === this.editAllFloorMat}>${m}</option>`,
            )}
          </select>
        </div>
        <span class="hint">applies to every wall / floor on this level (or select one to set it alone)</span>

        ${(() => {
          // Derive the floor list from the LIVE edit plan (not View-mode state),
          // so it stays correct after New / project switch while editing.
          const efloors = this.editor?.plan.floors ?? [];
          const curName = efloors[this.editFloorIndex]?.name ?? '';
          return html`<div class="panel-group">Floors</div>
          <div class="toolrow">
            ${efloors.length > 1
              ? html`<select class="select" @change=${this.onSelectEditFloor}>
                  ${efloors.map(
                    (f, i) => html`<option value=${i} ?selected=${i === this.editFloorIndex}>
                      ${f.name || `Floor ${i + 1}`}
                    </option>`,
                  )}
                </select>`
              : nothing}
            <button class="btn" title="Add a floor above" @click=${this.onAddFloor}>➕ Floor</button>
            ${efloors.length > 1
              ? html`<button class="btn" title="Delete this floor" @click=${this.onDeleteFloor}>🗑</button>`
              : nothing}
          </div>
          <div class="toolrow">
            <input class="name-input" type="text" placeholder="Floor name"
              .value=${curName}
              title="Rename this floor"
              @input=${this.onRenameFloor} />
          </div>
          <div class="toolrow">
            <span class="hint">View distance:</span>
            <input type="range" min="0.4" max="2" step="0.05"
              .value=${String(this.editCameraDistance)}
              title="Default camera distance on Reset (saved with the project)"
              @input=${this.onSetCameraDistance} />
          </div>`;
        })()}

        <div class="panel-group">Rooms — manual icon &amp; devices</div>
        <div class="toolrow">
          <button class="btn" title="Add a room control icon you place by hand"
            @click=${this.onAddZone}>➕ Add room</button>
          ${this.editZones.length
            ? html`<select class="select" @change=${(e: Event) =>
                this.onSelectZone((e.target as HTMLSelectElement).value || null)}>
                <option value="">— select —</option>
                ${this.editZones.map(
                  (z) => html`<option value=${z.id} ?selected=${z.id === this.editSelectedZoneId}>${z.name || 'Room'}</option>`,
                )}
              </select>`
            : nothing}
        </div>
        ${this.editSelectedZoneId && this.editZones.length > 1
          ? (() => {
              const i = this.editZones.findIndex((z) => z.id === this.editSelectedZoneId);
              return html`<div class="toolrow">
                <span class="hint">Room order:</span>
                <button class="btn" title="Move room up" ?disabled=${i <= 0}
                  @click=${() => this.onMoveZone(this.editSelectedZoneId!, -1)}>▲ Up</button>
                <button class="btn" title="Move room down" ?disabled=${i < 0 || i >= this.editZones.length - 1}
                  @click=${() => this.onMoveZone(this.editSelectedZoneId!, 1)}>▼ Down</button>
              </div>`;
            })()
          : nothing}
        ${(() => {
          const z = this.editZones.find((x) => x.id === this.editSelectedZoneId);
          if (!z) return this.editZones.length
            ? html`<span class="hint">select a room to place its icon &amp; pick devices</span>`
            : html`<span class="hint">auto-groups devices by room; add a manual room to override a mis-detected one</span>`;
          const ents = this.editor?.floorEntities ?? [];
          return html`<div class="toolrow">
              <input class="name-input" type="text" placeholder="Room name"
                .value=${z.name ?? ''} @input=${(e: Event) => this.onSetZoneName(z.id, e)} />
            </div>
            <div class="toolrow">
              <button class="btn ${this.editZonePlacing ? 'active' : ''}" title="Then tap the floor"
                @click=${this.onZonePlace}>📍 ${this.editZonePlacing ? 'Tap the floor…' : 'Place icon'}</button>
              <button class="btn" title="Delete this room" @click=${() => this.onDeleteZone(z.id)}>🗑 Delete</button>
            </div>
            <div class="panel-group">Фон комнаты (виден на планшете при выборе)</div>
            <div class="toolrow">
              <input class="name-input" type="text" placeholder="URL или /local/room.jpg"
                .value=${z.bgImage && !z.bgImage.startsWith('data:') ? z.bgImage : ''}
                @change=${(e: Event) => this.onSetZoneBg(z.id, e)} />
            </div>
            <div class="toolrow">
              <label class="btn" title="Загрузить фото с устройства">📷 Загрузить<input
                type="file" accept="image/*" style="display:none"
                @change=${(e: Event) => this.onUploadZoneBg(z.id, e)} /></label>
              ${z.bgImage
                ? html`<button class="btn" title="Убрать фон" @click=${() => this.onClearZoneBg(z.id)}>🗑</button>
                    <span class="hint">${z.bgImage.startsWith('data:') ? 'фото загружено' : 'задан URL'}</span>`
                : html`<span class="hint">не задан</span>`}
            </div>
            ${z.entities.length
              ? html`<span class="hint">In this room — order (▲▼), ✕ removes:</span>
                  <div class="zone-order">
                    ${z.entities.map(
                      (eid, i) => html`<div class="zrow">
                        <span class="zname" title=${eid}>${this.entityShort(eid)}</span>
                        <button class="zbtn" title="Move up" ?disabled=${i === 0}
                          @click=${() => this.onMoveZoneEntity(z.id, eid, -1)}>▲</button>
                        <button class="zbtn" title="Move down" ?disabled=${i === z.entities.length - 1}
                          @click=${() => this.onMoveZoneEntity(z.id, eid, 1)}>▼</button>
                        <button class="zbtn del" title="Remove from room"
                          @click=${() => this.onToggleZoneDevice(z.id, eid)}>✕</button>
                      </div>`,
                    )}
                  </div>`
              : nothing}
            ${(() => {
              const add = ents.filter((en) => !z.entities.includes(en.entity_id));
              if (!add.length) {
                return ents.length ? nothing : html`<span class="hint">bind entities to furniture first, then add them here</span>`;
              }
              return html`<span class="hint">Add device (· room = already assigned):</span>
                <div class="zone-devs">
                  ${add.map((en) => {
                    const taken = this.boundElsewhere(en.entity_id, z.id);
                    return html`<label class="zone-dev ${taken ? 'taken' : ''}">
                      <input type="checkbox" @change=${() => this.onToggleZoneDevice(z.id, en.entity_id)} />
                      <span>${this.entityShort(en.entity_id)}${taken ? html`<em class="taken-tag"> · ${taken}</em>` : nothing}</span>
                    </label>`;
                  })}
                </div>`;
            })()}`;
        })()}

        ${tool === 'wall' || tool === 'floor'
          ? html`<div class="toolrow">
              <button class="btn" title="Remove the last point" @click=${this.onUndoPoint}>⤺ Undo point</button>
              <button class="btn" title="Finish this run (Enter)" @click=${this.onFinishWall}>✓ Finish</button>
              <button class="btn ${this.editSnap ? 'active' : ''}"
                title="Snap assist: parallel/perpendicular angles, equal lengths, alignment"
                @click=${this.onToggleSnap}>🧲 Snap</button>
              <span class="hint">${tool === 'floor'
                ? 'trace a floor: tap corners · tap start (or Finish) to close'
                : 'tap to add points · tap start to close (adds floor) · Finish/Enter to end'}</span>
            </div>`
          : nothing}

        ${tool === 'furniture'
          ? html`<div class="toolrow">
              <button class="btn palette-btn" title="Choose a model" @click=${this.togglePalette}>
                <img class="palette-thumb" src=${getThumbnail(this.editSelectedModel)} alt="" />
                ${label(this.editSelectedModel)} ▾
              </button>
              <span class="hint">tap floor to place</span>
            </div>
            ${this.paletteOpen
              ? (() => {
                  const q = this.editFurnSearch.trim().toLowerCase();
                  const match = (k: string) => !q || label(k).toLowerCase().includes(q) || k.includes(q);
                  const lights = LIGHT_KEYS.filter(match);
                  const furn = furnitureKeys.filter(match);
                  return html`<div class="palette">
                    <input class="select wide" type="search" placeholder="🔍 search models…"
                      .value=${this.editFurnSearch}
                      @input=${(e: Event) => (this.editFurnSearch = (e.target as HTMLInputElement).value)} />
                    ${lights.length
                      ? html`<div class="palette-group">Lighting</div>
                          <div class="palette-grid">
                            ${lights.map((k) => this.renderPaletteCell(k, label(k)))}
                          </div>`
                      : nothing}
                    ${furn.length
                      ? html`<div class="palette-group">Furniture</div>
                          <div class="palette-grid">
                            ${furn.map((k) => this.renderPaletteCell(k, label(k)))}
                          </div>`
                      : nothing}
                    ${!lights.length && !furn.length
                      ? html`<span class="hint">no models match "${this.editFurnSearch}"</span>`
                      : nothing}
                  </div>`;
                })()
              : nothing}`
          : nothing}

        ${hasSelection
          ? html`<div class="toolrow">
              <span class="hint">${kind === 'room' && !this.editRoom?.shape ? 'floor' : kind} selected</span>
              ${isFurniture
                ? html`<button class="btn" title="Rotate 45°" @click=${this.onRotateSelected}>⟳ Rotate</button>
                    <button class="btn" title="Lower" @click=${() => this.onNudgeHeight(-0.1)}>▼ Down</button>
                    <button class="btn" title="Raise" @click=${() => this.onNudgeHeight(0.1)}>▲ Up</button>`
                : nothing}
              ${kind === 'opening'
                ? html`<button class="btn" title="Slide left along the wall" @click=${() => this.onSlideOpening(-0.1)}>◀ Left</button>
                    <button class="btn" title="Slide right along the wall" @click=${() => this.onSlideOpening(0.1)}>Right ▶</button>`
                : nothing}
              <button class="btn" title="Delete the selected item" @click=${this.onDeleteSelected}>🗑 Delete</button>
            </div>
            ${isFurniture && this.editIsLight
              ? html`<div class="toolrow">
                  <span class="hint">Brightness:</span>
                  <input type="range" min="0" max="1" step="0.05"
                    .value=${String(this.editBrightness)}
                    title="Manual glow level (bound light overrides)"
                    @input=${this.onSetBrightness} />
                </div>`
              : nothing}
            ${isFurniture && this.editIsLightSet
              ? html`<div class="toolrow">
                    <span class="hint">Spread:</span>
                    <input type="range" min="0.6" max="10" step="0.1"
                      .value=${String(this.editSpread)}
                      title="Spacing between elements (each keeps its size)"
                      @input=${this.onSetSpread} />
                  </div>
                  ${this.editSelectedObjModel === 'spotlight_bar'
                    ? html`<div class="toolrow">
                        <span class="hint">Spots:</span>
                        <input class="num-input" type="number" min="1" max="12" step="1"
                          .value=${String(this.editCount)}
                          @change=${this.onSetCount} />
                      </div>`
                    : nothing}`
              : nothing}
            ${kind === 'opening'
              ? html`<div class="toolrow">
                    <span class="hint">Type:</span>
                    <select class="select" @change=${this.onSetOpeningKind}>
                      ${['door', 'window', 'opening'].map(
                        (k) => html`<option value=${k} ?selected=${k === this.editOpeningKind}>${k}</option>`,
                      )}
                    </select>
                  </div>
                  ${this.editOpeningKind !== 'opening'
                    ? html`<div class="toolrow">
                        <span class="hint">Style:</span>
                        <select class="select" @change=${this.onSetOpeningVariant}>
                          ${(this.editOpeningKind === 'door' ? DOOR_VARIANTS : WINDOW_VARIANTS).map(
                            (v) => html`<option value=${v} ?selected=${v === this.editOpeningVariant}>${v}</option>`,
                          )}
                        </select>
                      </div>`
                    : nothing}
                  <div class="toolrow">
                    <span class="hint">Width (m):</span>
                    <input class="num-input" type="number" min="0.3" step="0.1"
                      .value=${this.editOpeningWidth != null ? this.editOpeningWidth.toFixed(2) : ''}
                      @change=${this.onSetOpeningWidth} />
                  </div>`
              : nothing}
            ${kind !== 'opening'
              ? html`<div class="toolrow">
                  <span class="hint">Color:</span>
                  <input
                    class="color"
                    type="color"
                    .value=${this.editSelectedColor ?? (kind === 'room' ? '#c6a87e' : kind === 'wall' ? '#dcc3a0' : '#ffffff')}
                    @input=${this.onSetColor}
                  />
                  ${kind === 'wall' || kind === 'room'
                    ? html`<span class="hint">${kind === 'room' ? 'Floor' : 'Wall'}:</span>
                        <select class="select" @change=${this.onSetMaterial}>
                          ${(kind === 'room' ? FLOOR_MATERIALS : WALL_MATERIALS).map(
                            (m) => html`<option value=${m} ?selected=${m === this.editMaterial}>${m}</option>`,
                          )}
                        </select>`
                    : nothing}
                </div>`
              : nothing}
            ${isFurniture && this.editFurnScale && !this.editIsLightSet
              ? html`<div class="toolrow">
                  <span class="hint">Size</span>
                  <input class="num-input" type="number" min="0.1" step="0.1" title="Width"
                    .value=${this.editFurnScale[0].toFixed(1)}
                    @change=${(e: Event) => this.onSetFurnScale(0, e)} />
                  <input class="num-input" type="number" min="0.1" step="0.1" title="Height"
                    .value=${this.editFurnScale[1].toFixed(1)}
                    @change=${(e: Event) => this.onSetFurnScale(1, e)} />
                  <input class="num-input" type="number" min="0.1" step="0.1" title="Depth"
                    .value=${this.editFurnScale[2].toFixed(1)}
                    @change=${(e: Event) => this.onSetFurnScale(2, e)} />
                </div>`
              : nothing}
            ${kind === 'wall'
              ? html`<div class="toolrow">
                  <span class="hint">Length (m):</span>
                  <input
                    class="num-input"
                    type="number"
                    min="0.1"
                    step="0.1"
                    .value=${this.editSelectedWallLength != null ? this.editSelectedWallLength.toFixed(2) : ''}
                    @change=${this.onSetWallLength}
                  />
                  <span class="hint">or drag the wall's end point</span>
                </div>
                <div class="toolrow">
                  <span class="hint">Thickness (m):</span>
                  <input class="num-input" type="number" min="0.05" step="0.01" title="Wall thickness in meters (e.g. 0.25, 0.38, 0.78)"
                    .value=${this.editSelectedWallThickness != null ? this.editSelectedWallThickness.toFixed(2) : ''}
                    @change=${this.onSetWallThickness} />
                  <span class="hint">Angle (°):</span>
                  <input class="num-input" type="number" step="1" title="Absolute heading in degrees (45 = diagonal), pivots on the start point"
                    .value=${this.editSelectedWallAngle != null ? this.editSelectedWallAngle.toFixed(0) : ''}
                    @change=${this.onSetWallAngle} />
                </div>
                ${this.editor && this.editor.selectedWallOpenings.length
                  ? html`<div class="panel-group">Openings (tap 🗑 to remove)</div>
                      ${this.editor.selectedWallOpenings.map(
                        (o, i) => html`<div class="toolrow">
                          <span class="hint">${o.kind} @ ${o.position.toFixed(1)}m · ${o.width.toFixed(1)}m</span>
                          <button class="btn" title="Delete this opening"
                            @click=${() => this.onDeleteWallOpening(i)}>🗑</button>
                        </div>`,
                      )}`
                  : nothing}`
              : nothing}
            ${kind === 'room' && this.editRoom?.shape
              ? html`<div class="toolrow">
                    <input class="name-input" type="text" placeholder="Room name"
                      .value=${this.editRoom.name ?? ''}
                      @change=${(e: Event) => this.onSetRoomField('name', e)} />
                  </div>
                  <div class="toolrow">
                    <span class="hint">W</span>
                    <input class="num-input" type="number" min="0.5" step="0.1"
                      .value=${(this.editRoom.width ?? 0).toFixed(1)}
                      @change=${(e: Event) => this.onSetRoomField('width', e)} />
                    <span class="hint">D</span>
                    <input class="num-input" type="number" min="0.5" step="0.1"
                      .value=${(this.editRoom.depth ?? 0).toFixed(1)}
                      @change=${(e: Event) => this.onSetRoomField('depth', e)} />
                  </div>
                  <div class="toolrow">
                    <span class="hint">Height</span>
                    <input class="num-input" type="number" min="1" step="0.1"
                      .value=${(this.editRoom.height ?? 2.6).toFixed(1)}
                      @change=${(e: Event) => this.onSetRoomField('height', e)} />
                    <span class="hint">Rot°</span>
                    <input class="num-input" type="number" step="15"
                      .value=${Math.round(this.editRoom.rotation ?? 0).toString()}
                      @change=${(e: Event) => this.onSetRoomField('rotation', e)} />
                  </div>
                  <span class="hint">drag body=move · ring=rotate · corners=resize · Shift=no snap</span>
                  ${this.editor && this.editor.selectedRoomOpenings.length
                    ? html`<div class="panel-group">Openings (tap 🗑 to remove)</div>
                        ${this.editor.selectedRoomOpenings.map(
                          (o, i) => html`<div class="toolrow">
                            <span class="hint">${o.kind} · ${o.width.toFixed(1)}m</span>
                            <button class="btn" title="Delete this opening"
                              @click=${() => this.onDeleteRoomOpening(i)}>🗑</button>
                          </div>`,
                        )}`
                    : nothing}`
              : nothing}
            ${isFurniture && this.hass
              ? (() => {
                  const domains =
                    this.editShowAllEntities || !this.editSelectedObjModel
                      ? []
                      : entityDomainsFor(this.editSelectedObjModel);
                  const { ids, fellBack } = this.candidateEntities(domains);
                  const q = this.editEntitySearch.trim().toLowerCase();
                  const fids = q
                    ? ids.filter((id) => this.entityOptionText(id).toLowerCase().includes(q))
                    : ids;
                  return html`<div class="toolrow">
                      <input class="select wide" type="search" placeholder="🔍 search entity / room…"
                        .value=${this.editEntitySearch}
                        @input=${(e: Event) => (this.editEntitySearch = (e.target as HTMLInputElement).value)} />
                    </div>
                    <div class="toolrow">
                      <select class="select wide" size="6" @change=${this.onPickEntity}>
                        <option value="" ?selected=${!this.editSelectedEntity}>
                          — bind entity —
                        </option>
                        ${fids.map(
                          (id) => html`<option value=${id} ?selected=${id === this.editSelectedEntity}
                            title=${id}>
                            ${this.entityOptionText(id)}
                          </option>`,
                        )}
                      </select>
                      <button
                        class="btn ${this.editShowAllEntities ? 'active' : ''}"
                        title="Show all entities (ignore type filter)"
                        @click=${() => (this.editShowAllEntities = !this.editShowAllEntities)}
                      >
                        All
                      </button>
                    </div>
                    <span class="hint">
                      ${this.editSelectedEntity
                        ? `bound: ${this.editSelectedEntity}`
                        : fellBack
                          ? `${ids.length} entities (no ${domains.join(' / ')} found)`
                          : domains.length
                            ? `${ids.length} ${domains.join(' / ')} entities (tap All for every entity)`
                            : `${ids.length} entities`}
                    </span>`;
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
              .value=${this.editPlanName}
              @input=${this.onRenamePlan}
            />
          </div>
          ${this.projectList.length > 0
            ? html`<div class="toolrow">
                <select class="select wide" @change=${this.onSelectStorageProject}>
                  ${!this.editingProjectId
                    ? html`<option value="" selected>(unsaved new)</option>`
                    : nothing}
                  ${this.projectList.map(
                    (p) => html`<option value=${p.id} ?selected=${p.id === this.editingProjectId}>${p.name}</option>`,
                  )}
                </select>
                <button class="btn" title="Delete this project" @click=${this.onDeleteProject}>🗑</button>
              </div>`
            : nothing}
          <div class="toolrow">
            <button class="btn" title="Create a new project (keeps the others)" @click=${this.onNewPlan}>✚ New</button>
            <button class="btn primary" title="Save this project" @click=${this.onSavePlan}>💾 Save</button>
          </div>
          <div class="toolrow">
            <button class="btn" title="Paste a plan JSON to build it" @click=${this.onOpenImport}>📥 Import</button>
            <button class="btn" title="Copy this plan as JSON" @click=${this.onExportPlan}>📤 Export</button>
          </div>
        </div>

        <div class="panel-section">
          <div class="panel-group">🔒 Security — lock editing</div>
          <div class="toolrow">
            <input class="name-input" type="password" inputmode="numeric" autocomplete="off"
              placeholder=${this.hasEditPin() ? 'New PIN (replaces current)' : 'Set a PIN'}
              .value=${this.editPinInput}
              @input=${(e: Event) => (this.editPinInput = (e.target as HTMLInputElement).value)} />
            <button class="btn primary" title="Save this PIN" @click=${this.onSetEditPin}>
              ${this.hasEditPin() ? 'Update' : 'Set'}
            </button>
          </div>
          ${this.hasEditPin()
            ? html`<div class="toolrow">
                <span class="hint">🔒 PIN required to enter Edit</span>
                <button class="btn" title="Remove the edit PIN" @click=${this.onRemoveEditPin}>Remove</button>
              </div>`
            : html`<span class="hint">No PIN set — anyone can edit. Set one to prevent accidental changes.</span>`}
        </div>
      </div>
    `;
  }

  /** View-mode control popup: a list of the tapped (+ nearby) entities, each
   *  with domain-appropriate controls / a mini remote. */
  private renderControlPopup() {
    if (this.controlRoom) return this.renderRoomPopup();
    const hass = this.hass;
    const ids = this.controlEntities.filter((id) => hass?.states[id]);
    if (!hass || !ids.length) return nothing;
    const [x] = this.controlPos;
    return html`
      <div class="control-backdrop" @click=${this.closeControl}></div>
      <div class="control-popup" style="left:${x}px"
        @click=${(e: Event) => e.stopPropagation()}>
        <div class="control-head">
          <span>${ids.length > 1 ? `${ids.length} ${this.t('devices')}` : ''}</span>
          <button type="button" class="ctl close" @click=${this.closeControl}>✕</button>
        </div>
        ${ids.map((id) => this.renderEntityControl(id))}
      </div>
    `;
  }

  /** Room marker popup: pick a category (Lights/Climate/Curtains…), then control
   *  every device of that kind in the room — like the AC remote, per room. */
  private renderRoomPopup() {
    const room = this.controlRoom;
    const hass = this.hass;
    if (!room || !hass) return nothing;
    const present = room.entities.filter((e) => hass.states[e.entity_id]);
    const cats = DEVICE_CATEGORIES.map((c) => ({
      ...c,
      ents: present.filter((e) => c.behaviors.includes(e.behavior)),
    })).filter((c) => c.ents.length);
    // Any device whose behavior matches no category still needs to be reachable.
    const categorized = new Set(DEVICE_CATEGORIES.flatMap((c) => c.behaviors));
    const otherEnts = present.filter((e) => !categorized.has(e.behavior));
    if (otherEnts.length) cats.push({ key: 'other', label: 'Other', icon: 'dot', behaviors: [], ents: otherEnts });
    const [x] = this.controlPos;
    const active = this.controlCategory ? cats.find((c) => c.key === this.controlCategory) : null;
    return html`
      <div class="control-backdrop" @click=${this.closeControl}></div>
      <div class="control-popup" style="left:${x}px"
        @click=${(e: Event) => e.stopPropagation()}>
        <div class="control-head">
          <span>${active
            ? html`<button type="button" class="ctl back" title="Back"
                @click=${() => (this.controlCategory = null)}>${this.ic('chevUp')}</button> ${this.t(active.label)}`
            : room.name || this.t('Room')}</span>
          <button type="button" class="ctl close" @click=${this.closeControl}>✕</button>
        </div>
        ${active
          ? html`${active.key === 'lights'
                ? (() => {
                    const anyOn = active.ents.some((e) => this.effState(e.entity_id) === 'on');
                    return html`<div class="control-row">
                      <span class="control-name">${this.t(anyOn ? 'All off' : 'All on')}</span>
                      <div class="control-ctls">
                        <button type="button" class="ctl big ${anyOn ? 'on' : ''}" title="Toggle all"
                          @click=${() => this.onToggleAll(active.ents)}>${this.ic('power')}</button>
                      </div>
                    </div>`;
                  })()
                : nothing}
              ${active.ents.map((e) => this.renderEntityControl(e.entity_id))}`
          : cats.length
            ? html`<div class="cat-grid">
                ${cats.map(
                  (c) => html`<button type="button" class="cat-btn" @click=${() => (this.controlCategory = c.key)}>
                    ${this.ic(c.icon)}<span>${this.t(c.label)}</span><small>${c.ents.length}</small>
                  </button>`,
                )}
              </div>`
            : html`<span class="hint">${this.t('No controllable devices')}</span>`}
      </div>
    `;
  }

  /** Inline SVG icon (shared path set) — never an emoji, so it renders the same
   *  on every tablet/browser instead of a tofu box. */
  private ic(name: string) {
    const paths = ICON_PATHS[name] ?? ICON_PATHS.dot;
    return html`<svg class="icn" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
    >${paths.map((d) => svg`<path d=${d}></path>`)}</svg>`;
  }

  private renderEntityControl(id: string) {
    const hass = this.hass!;
    const ent = hass.states[id];
    const domain = id.split('.')[0];
    const state = this.effState(id); // optimistic-aware
    const name = ent?.attributes?.friendly_name ?? id;
    const on = state === 'on' || state === 'open' || state === 'playing' || state === 'home' || state === 'unlocked';
    let controls;
    if (domain === 'light' || domain === 'switch' || domain === 'fan' || domain === 'input_boolean') {
      controls = html`<button type="button" class="ctl big ${on ? 'on' : ''}" title="Toggle"
        @click=${() => this.svc(domain, 'toggle', {}, id, on ? 'off' : 'on')}>${this.ic('power')}</button>`;
    } else if (domain === 'cover') {
      controls = html`
        <button type="button" class="ctl" title="Open" @click=${() => this.svc('cover', 'open_cover', {}, id, 'open')}>${this.ic('chevUp')}</button>
        <button type="button" class="ctl" title="Stop" @click=${() => this.svc('cover', 'stop_cover', {}, id)}>${this.ic('stop')}</button>
        <button type="button" class="ctl" title="Close" @click=${() => this.svc('cover', 'close_cover', {}, id, 'closed')}>${this.ic('chevDown')}</button>`;
    } else if (domain === 'lock') {
      controls = html`<button type="button" class="ctl ${on ? '' : 'on'}" title=${on ? 'Lock' : 'Unlock'}
        @click=${() => this.svc('lock', on ? 'lock' : 'unlock', {}, id, on ? 'locked' : 'unlocked')}>${this.ic(on ? 'lockOpen' : 'lockClosed')}</button>`;
    } else if (domain === 'climate') {
      // Compact AC remote: temperature ± and the HVAC mode chips, inline.
      const target = this.effTarget(id);
      const cur = ent?.attributes?.current_temperature as number | undefined;
      const step = climateStep(ent);
      const modes: string[] = ent?.attributes?.hvac_modes ?? ['off', 'cool', 'heat', 'auto'];
      const setTemp = (d: number) => {
        if (typeof target === 'number') this.stepTemp(id, ent, target, step, d);
      };
      controls = html`<div class="ctl-col">
        <div class="ctl-row">
          <button type="button" class="ctl" title="Cooler" @click=${() => setTemp(-step)}>${this.ic('minus')}</button>
          <span class="ctl-temp">${target != null ? `${target}°` : '—'}${cur != null
            ? html`<small> · ${cur}°</small>`
            : nothing}</span>
          <button type="button" class="ctl" title="Warmer" @click=${() => setTemp(step)}>${this.ic('plus')}</button>
        </div>
        <div class="ctl-row wrap">
          ${modes.map((m) => {
            const icon = climateModeIconName(m);
            return html`<button type="button" class="ctl ${state === m ? 'on' : ''}" title=${m}
              @click=${() => this.svc('climate', 'set_hvac_mode', { hvac_mode: m }, id, m)}>${icon
              ? this.ic(icon)
              : m}</button>`;
          })}
        </div>
      </div>`;
    } else if (domain === 'media_player') {
      // Compact TV remote: power + volume only (no transport — per request).
      const muted = !!ent?.attributes?.is_volume_muted;
      // "On" for a media player = anything that isn't a clear off/unknown state
      // (playing, paused, idle and buffering all mean the device is powered).
      const mpOn = !['off', 'standby', 'unavailable', 'unknown'].includes(state);
      controls = html`<div class="ctl-row">
        <button type="button" class="ctl ${mpOn ? 'on' : ''}" title="Power" @click=${() => this.svc('media_player', 'toggle', {}, id, mpOn ? 'off' : 'playing')}>${this.ic('power')}</button>
        <button type="button" class="ctl" title="Volume down" @click=${() => this.svc('media_player', 'volume_down', {}, id)}>${this.ic('volDown')}</button>
        <button type="button" class="ctl ${muted ? 'on' : ''}" title="Mute" @click=${() => this.svc('media_player', 'volume_mute', { is_volume_muted: !muted }, id)}>${this.ic('mute')}</button>
        <button type="button" class="ctl" title="Volume up" @click=${() => this.svc('media_player', 'volume_up', {}, id)}>${this.ic('volUp')}</button>
      </div>`;
    } else {
      controls = html`<span class="ctl-state">${state}${ent?.attributes?.unit_of_measurement ?? ''}</span>`;
    }
    return html`<div class="control-row">
      <span class="control-name" title=${id}>${name}</span>
      <div class="control-ctls">${controls}</div>
    </div>`;
  }

  // -- Room control panel (Option 1A: room in focus) --------------------------

  private get uiLocale(): string {
    if (this.isRu) return 'ru-RU';
    return this.hass?.locale?.language || this.hass?.language || 'en';
  }

  private fmtClockTime(): string {
    const h = String(this.now.getHours()).padStart(2, '0');
    const m = String(this.now.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  }

  private fmtClockDate(): string {
    try {
      const s = new Intl.DateTimeFormat(this.uiLocale, { weekday: 'long', day: 'numeric', month: 'long' }).format(this.now);
      return s.charAt(0).toUpperCase() + s.slice(1);
    } catch {
      return this.now.toDateString();
    }
  }

  /** Best-effort icon for a room pill, guessed from its (localised) name. */
  private roomIcon(name?: string): string {
    const n = (name || '').toLowerCase();
    const has = (...ws: string[]) => ws.some((w) => n.includes(w));
    if (has('гост', 'зал', 'living', 'lounge')) return 'couch';
    if (has('кухн', 'kitchen')) return 'counter';
    if (has('спал', 'bed')) return 'bed';
    if (has('дет', 'child', 'kid', 'nursery')) return 'child';
    if (has('ванн', 'санузел', 'bath', 'toilet', 'wc')) return 'bath';
    if (has('прихож', 'коридор', 'hall', 'entry', 'corridor')) return 'door';
    return 'room';
  }

  /** First sensor in the room matching a device_class / unit (for header chips). */
  private roomSensor(room: RoomInfo, cls: string, units: string[]): HassEntity | undefined {
    for (const e of room.entities) {
      if (e.behavior !== 'sensor') continue;
      const st = this.hass?.states[e.entity_id];
      if (!st) continue;
      const dc = st.attributes?.device_class;
      const u = st.attributes?.unit_of_measurement;
      if (dc === cls || (u && units.includes(u))) return st;
    }
    return undefined;
  }

  /** Whole-home humidity = average of every humidity sensor in HA (not just the
   *  ones bound to a room). Humidity sensors are usually auxiliary AC readings
   *  that aren't placed in the 3D scene, so a room-only lookup shows nothing. */
  private homeHumidity(): string {
    const vals: number[] = [];
    for (const st of Object.values(this.hass?.states ?? {})) {
      if ((st as HassEntity).attributes?.device_class === 'humidity') {
        const v = Number((st as HassEntity).state);
        if (Number.isFinite(v)) vals.push(v);
      }
    }
    return vals.length ? `${Math.round(vals.reduce((s, v) => s + v, 0) / vals.length)}%` : '—';
  }

  /** Whole-home temperature (°) = average of every temperature sensor in HA,
   *  else the climate units' current_temperature. Same reasoning as homeHumidity:
   *  the temp sensors often aren't bound to a room, and some climates report no
   *  current_temperature, so a room-only lookup shows "—". Returns null if none. */
  private homeTemperature(): number | null {
    const vals: number[] = [];
    for (const st of Object.values(this.hass?.states ?? {})) {
      const a = (st as HassEntity).attributes;
      if (a?.device_class !== 'temperature') continue;
      // Only real air-temperature readings. The Tuya floor thermostats expose a
      // unit-less raw floor-probe value (~220-290) as device_class temperature;
      // averaging that in dragged the whole-home mean to absurd numbers (110°).
      // Require a °C/°F unit and a sane range so a mis-scaled probe can't skew it.
      if (a.unit_of_measurement !== '°C' && a.unit_of_measurement !== '°F') continue;
      const v = Number((st as HassEntity).state);
      if (Number.isFinite(v) && v >= -60 && v <= 160) vals.push(v);
    }
    if (!vals.length) {
      for (const [id, st] of Object.entries(this.hass?.states ?? {})) {
        if (id.startsWith('climate.')) {
          const cur = Number((st as HassEntity).attributes?.current_temperature);
          if (Number.isFinite(cur)) vals.push(cur);
        }
      }
    }
    return vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : null;
  }

  /** Whole-home count of lights that are on — every light.* entity in HA, not
   *  just the ones assigned to a room on the active floor (a room-only count
   *  shows 0 when the on-lights live on other floors / aren't zoned). */
  private homeLightsOn(): number {
    let n = 0;
    for (const id of Object.keys(this.hass?.states ?? {})) {
      if (id.startsWith('light.') && this.effState(id) === 'on') n++;
    }
    return n;
  }

  /** Slider pointer-drag: live visual via dragValue, throttled service calls. */
  private onSliderDown(e: PointerEvent, id: string, cb: (pct: number) => void): void {
    if (e.cancelable) e.preventDefault();
    const track = e.currentTarget as HTMLElement;
    const rect = track.getBoundingClientRect();
    let lastSent = -1;
    let lastAt = 0;
    const apply = (clientX: number, force: boolean) => {
      const p = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const pct = Math.round(p * 100);
      this.dragEntity = id;
      this.dragValue = pct;
      this.requestUpdate();
      const t = performance.now();
      if (force || (pct !== lastSent && t - lastAt > 110)) {
        lastSent = pct;
        lastAt = t;
        cb(pct);
      }
    };
    apply(e.clientX, false);
    const mv = (ev: PointerEvent) => apply(ev.clientX, false);
    const up = (ev: PointerEvent) => {
      apply(ev.clientX, true); // always deliver the final value
      window.removeEventListener('pointermove', mv);
      window.removeEventListener('pointerup', up);
      this.dragEntity = null;
      this.requestUpdate();
    };
    window.addEventListener('pointermove', mv);
    window.addEventListener('pointerup', up);
  }

  /** 0..100 slider value: the live drag value while dragging, else `real`. */
  private sliderValue(id: string, real: number): number {
    return this.dragEntity === id ? this.dragValue : real;
  }

  private climateModeLabel(mode: string): string {
    return this.t(
      { heat: 'Heating', cool: 'Cooling', auto: 'Auto', fan_only: 'Ventilation', dry: 'Drying', heat_cool: 'Auto' }[mode] ?? 'Heating',
    );
  }

  private renderPills() {
    if (!this.rooms.length) return nothing;
    return html`<div class="pills">
      ${this.rooms.map(
        (r) => html`<button
          type="button"
          class="pill ${r.key === this.activeRoomKey ? 'on' : ''}"
          @click=${() => this.selectRoom(r.key)}
        >${this.ic(this.roomIcon(r.name))}<span>${r.name || this.t('Room')}</span></button>`,
      )}
    </div>`;
  }

  private renderFloorTabs() {
    if (this.floorNames.length <= 1) return nothing;
    return html`<div class="ftabs">
      ${this.floorNames.map(
        (name, i) => html`<button type="button" class="ftab ${i === this.activeFloorIndex ? 'on' : ''}"
          @click=${() => this.onSelectFloor(i)}>${name}</button>`,
      )}
    </div>`;
  }

  private onSleep(e: Event): void {
    if (e && 'stopPropagation' in e) e.stopPropagation();
    if (this.idleTimer) window.clearTimeout(this.idleTimer);
    this.now = new Date();
    this.idle = true;
  }

  private renderStageChrome() {
    const hasRoom = !!this.activeRoom;
    return html`
      <div class="clock">
        <div class="ctime">${this.fmtClockTime()}</div>
        <div class="cdate">${this.fmtClockDate()}</div>
      </div>
      <div class="topstat">
        <button class="sdot" title="Reset view" @click=${this.onResetView}>${this.ic('room')}</button>
        ${this.panel ? html`<button class="sdot" title="Full-screen 3D" @click=${this.openKiosk}>${this.ic('shield')}</button>` : nothing}
        <button class="sdot" title="Screensaver" @click=${(e: Event) => this.onSleep(e)}>${this.ic('moon')}</button>
        ${this.renderViewToggle()}
      </div>
      <div class="stage-bottom">
        ${this.renderFloorTabs()}
        ${this.renderPills()}
        ${!hasRoom
          ? html`<div class="ahint">${this.ic('dot')}<span>${this.t('Select a room to control its devices')}</span></div>`
          : nothing}
      </div>
    `;
  }

  /** Whole-home rollup for the screensaver: avg temp/humidity, lights on, lock. */
  private homeSummary(): { temp: string; hum: string; on: string; secIcon: string; secLabel: string } {
    let tSum = 0, tN = 0;
    const locks: string[] = [];
    for (const room of this.rooms) {
      const t = this.roomSensor(room, 'temperature', ['°C', '°F']);
      let tv = t ? Number(t.state) : undefined;
      if (tv == null || !Number.isFinite(tv)) {
        const c = room.entities.find((e) => e.behavior === 'climate');
        const cur = c ? this.hass?.states[c.entity_id]?.attributes?.current_temperature : undefined;
        tv = cur != null ? Number(cur) : undefined;
      }
      if (tv != null && Number.isFinite(tv)) { tSum += tv; tN++; }
      for (const e of room.entities) if (e.behavior === 'lock') locks.push(e.entity_id);
    }
    const on = this.homeLightsOn();
    const fT = (v: number) => v.toLocaleString(this.uiLocale, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    let secIcon = 'room', secLabel = this.t('At home');
    if (locks.length) {
      const allLocked = locks.every((id) => this.effState(id) === 'locked');
      secIcon = allLocked ? 'lockClosed' : 'lockOpen';
      secLabel = allLocked ? this.t('Locked') : this.t('Unlocked');
    }
    const homeT = tN ? tSum / tN : this.homeTemperature();
    return { temp: homeT != null ? `${fT(homeT)}°` : '—', hum: this.homeHumidity(), on: String(on), secIcon, secLabel };
  }

  private renderScreensaver() {
    const s = this.homeSummary();
    return html`<div class="saver" @pointerdown=${() => this.wake()}>
      <div class="saver-aurora"></div>
      <div class="saver-in">
        <div class="saver-home">${this.t('My home')}</div>
        <div class="saver-time">${this.fmtClockTime()}</div>
        <div class="saver-date">${this.fmtClockDate()}</div>
        <div class="saver-info">
          <div class="si">${this.ic('thermo')}<div class="sitx"><div class="siv">${s.temp}</div><div class="sil">${this.t('in the house')}</div></div></div>
          <div class="si cool">${this.ic('drop')}<div class="sitx"><div class="siv">${s.hum}</div><div class="sil">${this.t('humidity')}</div></div></div>
          <div class="si">${this.ic('bulb')}<div class="sitx"><div class="siv">${s.on}</div><div class="sil">${this.t('lights on')}</div></div></div>
          <div class="si good">${this.ic(s.secIcon)}<div class="sitx"><div class="siv">${s.secLabel}</div><div class="sil">${this.t('security')}</div></div></div>
        </div>
        <div class="saver-hint">${this.ic('dot')}<span>${this.t('Touch the screen to return')}</span></div>
      </div>
    </div>`;
  }

  private renderRoomPanel() {
    const room = this.activeRoom;
    if (!room) return nothing;
    const tempEnt = this.roomSensor(room, 'temperature', ['°C', '°F']);
    const humEnt = this.roomSensor(room, 'humidity', ['%']);
    const skip = new Set<string>();
    if (tempEnt) skip.add(tempEnt.entity_id);
    if (humEnt) skip.add(humEnt.entity_id);
    // A climate entity's current_temperature is a good fallback temp chip.
    const climate = room.entities.find((e) => e.behavior === 'climate');
    const climateCur = climate ? this.hass?.states[climate.entity_id]?.attributes?.current_temperature : undefined;

    const num = (v: any, digits: number) => {
      const n = Number(v);
      return Number.isFinite(n) ? n.toLocaleString(this.uiLocale, { minimumFractionDigits: digits, maximumFractionDigits: digits }) : '—';
    };
    const tempChip =
      tempEnt != null ? `${num(tempEnt.state, 1)}°` : climateCur != null ? `${num(climateCur, 1)}°` : null;
    const humChip = humEnt != null ? `${num(humEnt.state, 0)}%` : null;

    const cards = this.roomCards(room, skip);
    return html`
      <div class="room-panel">
        <div class="rp-head">
          <div class="rp-top">
            <div class="rp-name">${room.name || this.t('Room')}</div>
            <button type="button" class="closebtn" title="Close" @click=${() => this.selectRoom(null)}>${this.ic('close')}</button>
          </div>
          ${tempChip || humChip
            ? html`<div class="rp-chips">
                ${tempChip ? html`<div class="rp-chip">${this.ic('thermo')}${tempChip}</div>` : nothing}
                ${humChip ? html`<div class="rp-chip cool">${this.ic('drop')}${humChip}</div>` : nothing}
              </div>`
            : nothing}
        </div>
        <div class="rp-body">
          ${cards.length ? cards : html`<div class="rp-empty">${this.t('No devices in this room')}</div>`}
        </div>
        <div class="rp-foot">
          <button type="button" class="rp-master" @click=${() => this.onRoomAllOff(room)}>
            ${this.ic('power')}<span>${this.t('Turn everything off')}</span>
          </button>
        </div>
      </div>
    `;
  }

  /** Count of distinct device categories present in a room (for "N устройства"). */
  private deviceCount(room: RoomInfo): number {
    const has = (...b: string[]) => room.entities.some((e) => b.includes(e.behavior));
    return [
      has('light', 'switch', 'input_boolean'),
      has('climate', 'fan'),
      has('cover'),
      has('media_player'),
      has('lock'),
    ].filter(Boolean).length;
  }

  private ruPlural(n: number, one: string, few: string, many: string): string {
    const a = n % 10, b = n % 100;
    if (a === 1 && b !== 11) return one;
    if (a >= 2 && a <= 4 && (b < 10 || b >= 20)) return few;
    return many;
  }

  /** Overview (1B) full-screen detail slide-over for one room. */
  private renderDetail() {
    const room = this.detailRoom;
    if (!room) return nothing;
    const tempEnt = this.roomSensor(room, 'temperature', ['°C', '°F']);
    const humEnt = this.roomSensor(room, 'humidity', ['%']);
    const skip = new Set<string>();
    if (tempEnt) skip.add(tempEnt.entity_id);
    if (humEnt) skip.add(humEnt.entity_id);
    const climate = room.entities.find((e) => e.behavior === 'climate');
    const climateCur = climate ? this.hass?.states[climate.entity_id]?.attributes?.current_temperature : undefined;
    const num = (v: any, d: number) => {
      const n = Number(v);
      return Number.isFinite(n) ? n.toLocaleString(this.uiLocale, { minimumFractionDigits: d, maximumFractionDigits: d }) : '—';
    };
    const tempChip = tempEnt != null ? `${num(tempEnt.state, 1)}°` : climateCur != null ? `${num(climateCur, 1)}°` : null;
    const humChip = humEnt != null ? `${num(humEnt.state, 0)}%` : null;
    const n = this.deviceCount(room);
    return html`
      <div class="detail-back" @click=${() => this.closeDetail()}></div>
      <div class="detail" @click=${(e: Event) => e.stopPropagation()}>
        <div class="dhead">
          <button type="button" class="dback" title="Back" @click=${() => this.closeDetail()}>${this.ic('arrowLeft')}</button>
          <div class="cgrow">
            <div class="dtitle">${room.name || this.t('Room')}</div>
            <div class="dsub">${n} ${this.ruPlural(n, 'устройство', 'устройства', 'устройств')}</div>
          </div>
          ${tempChip || humChip
            ? html`<div class="rp-chips">
                ${tempChip ? html`<div class="rp-chip">${this.ic('thermo')}${tempChip}</div>` : nothing}
                ${humChip ? html`<div class="rp-chip cool">${this.ic('drop')}${humChip}</div>` : nothing}
              </div>`
            : nothing}
        </div>
        <div class="dbody">${this.roomCards(room, skip)}</div>
      </div>
    `;
  }

  /** Build the ordered device cards for a room (lights, climate, covers, …). */
  private roomCards(room: RoomInfo, skip: Set<string>) {
    const hass = this.hass;
    if (!hass) return [];
    const ents0 = room.entities.filter((e) => hass.states[e.entity_id] && !skip.has(e.entity_id));
    // A BMS Intercom (домофон) exposes camera/vyzov/prosmotr/open/… sharing a
    // base name. Collapse them into ONE intercom card and hide the members from
    // the normal per-domain cards.
    const intercom = this.detectIntercom(ents0);
    const ents = intercom ? ents0.filter((e) => !intercom.ids.has(e.entity_id)) : ents0;
    const of = (...b: string[]) => ents.filter((e) => b.includes(e.behavior));
    const lights = of('light');
    const switches = of('switch', 'input_boolean');
    const climates = of('climate');
    const fans = of('fan');
    const covers = of('cover');
    const medias = of('media_player');
    const locks = of('lock');
    const known = new Set(['light', 'switch', 'input_boolean', 'climate', 'fan', 'cover', 'media_player', 'lock']);
    const infos = ents.filter((e) => !known.has(e.behavior));

    const out: unknown[] = [];
    if (intercom) out.push(this.renderIntercomCard(intercom));
    // All of a room's lights collapse into ONE "Свет" card (matches the design);
    // per-light on/off stays available via the overview segment buttons.
    if (lights.length) out.push(this.renderLightCard(lights.map((e) => e.entity_id)));
    switches.forEach((e) => out.push(this.renderToggleCard(e.entity_id, 'power')));
    // Always label a climate card with the device's own HA name. A room with a
    // single climate device used to be labelled with the generic category
    // ("Климат"), which hid the real names — "Тёплый пол", "Радиатор",
    // "Кондиционер" — exactly the ones that tell two heaters in a room apart.
    climates.forEach((e) => out.push(this.renderClimateCard(e.entity_id)));
    fans.forEach((e) => out.push(this.renderToggleCard(e.entity_id, 'fan')));
    covers.forEach((e) => out.push(this.renderCoverCard(e.entity_id)));
    medias.forEach((e) => out.push(this.renderMediaCard(e.entity_id, medias.length === 1 ? this.t('Media') : undefined)));
    locks.forEach((e) => out.push(this.renderLockCard(e.entity_id)));
    infos.forEach((e) => out.push(this.renderInfoCard(e.entity_id)));
    return out;
  }

  /** Set when someone closes the alarm with the X. Cleared the moment the house
   *  is back to normal (dry and the supply open), so the NEXT leak alarms again
   *  — an acknowledgement must not silence the sensor for good. */
  @state() private leakAck = false;

  private leakCache?: { hass: unknown; leak: LeakAlarm | null };

  /** The leak as of the latest state push. Recomputed once per hass object, not
   *  once per render — render runs far more often, and this scans every entity. */
  private get leak(): LeakAlarm | null {
    if (this.leakCache && this.leakCache.hass === this.hass) return this.leakCache.leak;
    const leak = this.detectLeak();
    this.leakCache = { hass: this.hass, leak };
    return leak;
  }

  /** Wet leak sensors, found by HA's own device_class rather than by name — so a
   *  sensor added to the house later starts alarming with nothing to configure
   *  here or in the plan. */
  private detectLeak(): LeakAlarm | null {
    const st = this.hass?.states;
    if (!st) return null;
    const sensors: string[] = [];
    for (const id of Object.keys(st)) {
      if (!id.startsWith('binary_sensor.')) continue;
      if (st[id]?.attributes?.device_class !== 'moisture') continue;
      if (this.effState(id) === 'on') sensors.push(id);
    }
    const valve = this.waterValve();
    // The alarm outlives the puddle. Once the automation has shut the supply it
    // stays up until someone opens it again, so nobody can walk past a panel
    // that looks calm while the house is still without water.
    const shut = !!valve && this.valveShut(valve);
    if (!sensors.length && !shut) return null;
    return { sensors, valve, wet: sensors.length > 0 };
  }

  /** Shut only on a definite closed state: 'unknown' and 'unavailable' must not
   *  put a full-screen alarm on the wall just because HA hasn't reported yet. */
  private valveShut(valve: string): boolean {
    const s = this.effState(valve);
    return valve.startsWith('valve.') ? s === 'closed' : s === 'off';
  }

  /** The shut-off to reopen by hand once the leak is dealt with. Closing it is
   *  the automation's job; this card only ever opens it, and only when the user
   *  taps. With several candidates we offer no button at all rather than one
   *  that might cut the wrong supply. */
  private waterValve(): string | undefined {
    const st = this.hass?.states ?? {};
    const found = Object.keys(st).filter(
      (id) => /^(valve|switch)\./.test(id) && /(water[_a-z0-9]*valve|valve[_a-z0-9]*water)/i.test(id),
    );
    return found.length === 1 ? found[0] : undefined;
  }

  /** The room a sensor sits in — known only where the plan binds it to one. */
  private roomOfEntity(id: string): RoomInfo | undefined {
    return this.rooms.find((r) => r.entities.some((e) => e.entity_id === id));
  }

  /** A leak has to interrupt whatever is on screen, screensaver included, so
   *  this renders above everything and isn't dismissible: it clears when the
   *  sensor dries out, not when someone taps it away. */
  private renderLeakAlert() {
    const leak = this.leak;
    if (!leak || this.leakAck) return nothing;
    const room = leak.wet ? this.roomOfEntity(leak.sensors[0]) : undefined;
    const names = leak.sensors.map((id) => this.cardName(id)).join(', ');
    const valve = leak.valve;
    const open = valve ? !this.valveShut(valve) : true;
    return html`<div class="leak-alert">
      <button type="button" class="leak-x" title=${this.t('Close')}
        @click=${() => (this.leakAck = true)}>✕</button>
      <div class="leak-ic">${this.ic('drop')}</div>
      <div class="leak-title">${leak.wet ? this.t('Water leak!') : this.t('Water is shut off')}</div>
      <div class="leak-sub">
        ${leak.wet
          ? room?.name ? `${room.name} · ${names}` : names
          : this.t('Fix the leak, then open the valve')}
      </div>
      ${leak.wet && !room
        ? html`<div class="leak-hint">${this.t('Place this sensor on the plan to see the room')}</div>`
        : nothing}
      <div class="leak-btns">
        ${room
          ? html`<button type="button" class="leak-b" @click=${() => this.selectRoom(room.key)}>
              ${this.t('Show')}</button>`
          : nothing}
        ${valve
          ? html`<button type="button" class="leak-b primary" ?disabled=${open}
              @click=${() =>
                valve.startsWith('valve.')
                  ? this.svc('valve', 'open_valve', {}, valve, 'open')
                  : this.svc('switch', 'turn_on', {}, valve, 'on')}>
              ${open ? this.t('Valve is open') : this.t('Open the valve')}</button>`
          : nothing}
      </div>
    </div>`;
  }

  private cardName(id: string, fallback?: string): string {
    return fallback ?? this.hass?.states[id]?.attributes?.friendly_name ?? id;
  }

  /** Spot a BMS Intercom in a room's entities. Its objects share a base name
   *  ("<base>_video", "<base>_vyzov", "<base>_prosmotr", "<base>_otkryt_dver",
   *  …); any one of them being present (usually the camera bound to the intercom
   *  model) pulls in the siblings from hass, so the user only binds ONE entity. */
  private detectIntercom(ents: { entity_id: string }[]): IntercomGroup | null {
    const st = this.hass?.states ?? {};
    const suffix: Record<string, string> = {
      camera: '_video', switch: '_prosmotr', binary_sensor: '_vyzov', button: '_otkryt_dver',
    };
    for (const e of ents) {
      const dot = e.entity_id.indexOf('.');
      const dom = e.entity_id.slice(0, dot);
      const obj = e.entity_id.slice(dot + 1);
      const suf = suffix[dom];
      if (!suf || !obj.endsWith(suf)) continue;
      const base = obj.slice(0, -suf.length);
      const prosmotr = `switch.${base}_prosmotr`;
      const vyzov = `binary_sensor.${base}_vyzov`;
      if (!st[prosmotr] || !st[vyzov]) continue; // not an intercom base
      const pick = (id: string) => (st[id] ? id : undefined);
      const g: IntercomGroup = {
        base, prosmotr, vyzov,
        camera: pick(`camera.${base}_video`),
        open: pick(`button.${base}_otkryt_dver`),
        answer: pick(`button.${base}_otvetit`),
        reset: pick(`button.${base}_sbrosit`),
        ids: new Set<string>(),
      };
      [g.camera, g.vyzov, g.prosmotr, g.open, g.answer, g.reset].forEach((id) => id && g.ids.add(id));
      return g;
    }
    return null;
  }

  /** One card for the whole intercom: Просмотр(Звук) + Открыть
   *  дверь. The live two-way CALL is intentionally left to the integration's own
   *  auto pop-up (it needs the HTTPS mic window and appears on any dashboard);
   *  here it's just "peek at the door + open it", per the agreed design. */
  private renderIntercomCard(g: IntercomGroup) {
    const st = this.hass!.states;
    const viewing = this.effState(g.prosmotr) === 'on';
    const callState = st[g.vyzov]?.attributes?.call_state;
    const ringing = callState === 'ringing' || (callState == null && this.effState(g.vyzov) === 'on');
    const sub = ringing ? this.t('Ringing') : viewing ? this.t('Viewing') : this.t('Idle');
    return html`<div class="card intercom ${ringing ? 'ring' : ''}">
      <div class="crow">
        <div class="cicon ${ringing || viewing ? 'lit' : ''}">${this.ic('camera')}</div>
        <div class="cgrow">
          <div class="clabel">${this.cardName(g.camera ?? g.vyzov, this.t('Intercom'))}</div>
          <div class="csub">${sub}</div>
        </div>
      </div>
      <div class="qbtns intercom-btns">
        <button type="button" class="qb ${viewing ? 'on' : ''}"
          @click=${() => this.svc('switch', viewing ? 'turn_off' : 'turn_on', {}, g.prosmotr, viewing ? 'off' : 'on')}>
          <span class="qb-ic">${this.ic('eye')}</span><span>${this.t('View')}</span></button>
        ${g.open
          ? html`<button type="button" class="qb primary"
              @click=${() => this.svc('button', 'press', {}, g.open!)}>
              <span class="qb-ic">${this.ic('doorOpen')}</span><span>${this.t('Open door')}</span></button>`
          : nothing}
      </div>
    </div>`;
  }

  /** Short label for a light segment — the HA name with the room prefix stripped
   *  (e.g. "Гостиная · Люстра" → "Люстра"). Truncation is done in CSS. */
  private shortLightName(id: string, roomName?: string): string {
    const st = this.hass?.states[id];
    let n = (st?.attributes?.friendly_name as string) ?? id.split('.').pop() ?? id;
    if (roomName) {
      const rn = roomName.trim().toLowerCase();
      if (rn && n.toLowerCase().startsWith(rn)) n = n.slice(roomName.trim().length);
    }
    n = n.replace(/^[\s·:,_\-–—]+/, '').trim();
    return n || (st?.attributes?.friendly_name as string) || id;
  }

  /** A room's lights: a header (count on + master all-toggle) over a wrapping
   *  grid of per-light tiles, so each light is controlled individually. The
   *  brightness/colour-temp sliders only appear when a light is actually dimmable
   *  (on/off-only lights don't get a slider that snaps back to 100%). */
  private renderLightCard(ids: string[]) {
    const onCount = ids.filter((id) => this.effState(id) === 'on').length;
    const anyOn = onCount > 0;
    const dimIds = ids.filter((id) => this.lightSupportsBrightness(id));
    const dimmable = dimIds.length > 0;
    const repId = dimIds.find((id) => this.effState(id) === 'on') ?? dimIds[0];
    const rawBri = repId ? this.hass?.states[repId]?.attributes?.brightness : undefined;
    const briReal = rawBri != null ? Math.round((rawBri / 255) * 100) : 100;
    const briKey = ids[0];
    const bri = this.sliderValue(briKey, briReal);
    const setAllBri = (p: number) => { for (const id of dimIds) this.svc('light', 'turn_on', { brightness_pct: p }, id, 'on'); };
    // Colour temperature (warm↔cold) from the lights that expose it.
    const ctIds = ids.filter((id) => this.lightSupportsCT(id));
    const ctRep = ctIds.find((id) => this.effState(id) === 'on') ?? ctIds[0];
    const a = ctRep ? this.hass?.states[ctRep]?.attributes ?? {} : {};
    const minK = Number(a.min_color_temp_kelvin) || 2200;
    const maxK = Number(a.max_color_temp_kelvin) || 6500;
    const curK = Number(a.color_temp_kelvin);
    const ctReal = Number.isFinite(curK) ? Math.round(((curK - minK) / (maxK - minK)) * 100) : 50;
    const ctKey = `${ids[0]}#ct`;
    const ct = this.sliderValue(ctKey, Math.max(0, Math.min(100, ctReal)));
    const setAllCT = (p: number) => { for (const id of ctIds) this.setLightCT(id, p); };
    return html`<div class="card lights ${anyOn ? 'on' : ''}">
      <div class="crow">
        <div class="cicon ${anyOn ? 'lit' : ''}">${this.ic('bulb')}</div>
        <div class="cgrow">
          <div class="clabel">${this.t('Light')}</div>
          <div class="csub">${onCount} / ${ids.length}${anyOn && dimmable ? ` · ${bri}%` : ''}</div>
        </div>
        <button type="button" class="sw ${anyOn ? 'on' : ''}" title="Toggle all"
          @click=${() => this.onToggleAll(ids.map((id) => ({ entity_id: id, behavior: 'light' })))}><span class="sw-k"></span></button>
      </div>
      ${ids.length > 1
        ? html`<div class="lgrid">
            ${ids.map((id) => {
              const lon = this.effState(id) === 'on';
              return html`<button type="button" class="ltile ${lon ? 'on' : ''}" title=${this.cardName(id)}
                @click=${() => this.svc(id.split('.')[0], 'toggle', {}, id, lon ? 'off' : 'on')}>
                <span class="lti ${lon ? 'lit' : ''}">${this.ic('bulb')}</span>
                <span class="ltn">${this.cardName(id)}</span>
              </button>`;
            })}
          </div>`
        : nothing}
      ${anyOn && dimmable
        ? html`<div class="slider" @pointerdown=${(e: PointerEvent) => this.onSliderDown(e, briKey, setAllBri)}>
              <div class="slider-fill" style="width:${bri}%"></div>
              <div class="slider-lab"><span>${this.t('Brightness')}</span><span>${bri}%</span></div>
            </div>
            ${ctIds.length
              ? html`<div class="ctwrap">
                  <div class="ctlab"><span>${this.t('Warm')}</span><span>${this.t('Cool')}</span></div>
                  <div class="cttrack" @pointerdown=${(e: PointerEvent) => this.onSliderDown(e, ctKey, setAllCT)}>
                    <div class="ctthumb" style="left:${ct}%"></div>
                  </div>
                </div>`
              : nothing}`
        : nothing}
    </div>`;
  }

  private renderToggleCard(id: string, icon: string) {
    const on = this.effState(id) === 'on';
    const domain = id.split('.')[0];
    return html`<div class="card ${on ? 'on' : ''}">
      <div class="crow">
        <div class="cicon ${on ? 'lit' : ''}">${this.ic(icon)}</div>
        <div class="cgrow">
          <div class="clabel">${this.cardName(id)}</div>
          <div class="csub">${on ? this.t('On') : this.t('Off')}</div>
        </div>
        <button type="button" class="sw ${on ? 'on' : ''}" title="Toggle"
          @click=${() => this.svc(domain, 'toggle', {}, id, on ? 'off' : 'on')}><span class="sw-k"></span></button>
      </div>
    </div>`;
  }

  private renderClimateCard(id: string) {
    const ent = this.hass!.states[id];
    const mode = this.effState(id);
    const on = mode !== 'off' && mode !== 'unavailable' && mode !== 'unknown';
    const target = this.effTarget(id);
    const step = climateStep(ent);
    const setTemp = (d: number) => {
      if (typeof target !== 'number') return;
      this.stepTemp(id, ent, target, step, d);
    };
    const cur = ent?.attributes?.current_temperature as number | undefined;
    // The setpoint shows in the stepper and the mode in the segments below, so
    // the sub carries the measured room temperature ("22,5° сейчас").
    const curStr = cur != null ? Number(cur).toLocaleString(this.uiLocale, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : null;
    const sub = on ? (curStr != null ? `${curStr}° ${this.t('now')}` : this.climateModeLabel(mode)) : this.t('Off');
    // Only offer the modes the device actually supports — sending an unsupported
    // mode (e.g. heat_cool / heat to a cool-only AC) errors in HA. Active modes
    // first, "off" last. A fan-speed row appears when the unit exposes fan_modes.
    const modes: string[] =
      (ent?.attributes?.hvac_modes as string[] | undefined)?.length
        ? (ent!.attributes!.hvac_modes as string[])
        : ['off'];
    const active = modes.filter((m) => m !== 'off');
    const onMode = active[0] ?? 'heat';
    const segModes = [...active, ...(modes.includes('off') ? ['off'] : [])];
    const toggleIcon = climateModeIconName(on ? mode : onMode) ?? 'power';
    const fanModes = (ent?.attributes?.fan_modes as string[] | undefined) ?? [];
    const fanMode = ent?.attributes?.fan_mode as string | undefined;
    const fanLabel = (f: string) =>
      this.t(({ low: 'Low', mid: 'Medium', medium: 'Medium', high: 'High', auto: 'Auto' } as Record<string, string>)[f] ?? f);
    return html`<div class="card ${on ? 'on cool' : ''}">
      <div class="crow">
        <button type="button" class="cicon ${on ? 'lit' : ''}" title="Toggle"
          @click=${() => this.svc('climate', 'set_hvac_mode', { hvac_mode: on ? 'off' : onMode }, id, on ? 'off' : onMode)}>${this.ic(toggleIcon)}</button>
        <div class="cgrow">
          <div class="clabel">${this.cardName(id)}</div>
          <div class="csub">${sub}</div>
        </div>
        <div class="stepper">
          <button type="button" class="stbtn" title="Cooler" @click=${() => setTemp(-step)}>${this.ic('minus')}</button>
          <div class="tval">${target != null ? `${target}°` : '—'}</div>
          <button type="button" class="stbtn" title="Warmer" @click=${() => setTemp(step)}>${this.ic('plus')}</button>
        </div>
      </div>
      <div class="seg">
        ${segModes.map(
          (m) => html`<button type="button" class="segb ${mode === m ? 'on' : ''}"
            @click=${() => this.svc('climate', 'set_hvac_mode', { hvac_mode: m }, id, m)}>${m === 'off' ? this.t('Off mode') : this.climateModeLabel(m)}</button>`,
        )}
      </div>
      ${fanModes.length && on
        ? html`<div class="seg fan">
            ${fanModes.map(
              (f) => html`<button type="button" class="segb ${fanMode === f ? 'on' : ''}" title=${'Fan: ' + f}
                @click=${() => this.svc('climate', 'set_fan_mode', { fan_mode: f }, id)}>${fanLabel(f)}</button>`,
            )}
          </div>`
        : nothing}
    </div>`;
  }

  /** Open / Stop / Close, mirroring the wall panel. No position slider: these
   *  curtain motors advertise SET_POSITION but report current_position stale at
   *  100 even once shut, so a slider (and an "opened to 100%" readout) just
   *  states something false. The state string is the honest signal. */
  private renderCoverCard(id: string) {
    const ent = this.hass!.states[id];
    const state = this.effState(id);
    const feat = Number(ent?.attributes?.supported_features ?? 0);
    const sub =
      state === 'closed' ? this.t('Closed')
        : state === 'opening' ? this.t('Opening')
          : state === 'closing' ? this.t('Closing')
            : this.t('Open');
    return html`<div class="card">
      <div class="crow">
        <div class="cicon">${this.ic('curtain')}</div>
        <div class="cgrow">
          <div class="clabel">${this.cardName(id)}</div>
          <div class="csub">${sub}</div>
        </div>
      </div>
      <div class="qbtns">
        ${feat & 1
          ? html`<button type="button" class="qb"
              @click=${() => this.svc('cover', 'open_cover', {}, id, 'open')}>${this.t('Open blind')}</button>`
          : nothing}
        ${feat & 8
          ? html`<button type="button" class="qb"
              @click=${() => this.svc('cover', 'stop_cover', {}, id)}>${this.t('Stop blind')}</button>`
          : nothing}
        ${feat & 2
          ? html`<button type="button" class="qb"
              @click=${() => this.svc('cover', 'close_cover', {}, id, 'closed')}>${this.t('Close blind')}</button>`
          : nothing}
      </div>
    </div>`;
  }

  private renderMediaCard(id: string, title?: string) {
    const ent = this.hass!.states[id];
    const state = this.effState(id);
    const on = state !== 'off' && state !== 'unavailable' && state !== 'unknown' && state !== 'standby';
    const playing = state === 'playing';
    // Only show controls the device actually supports (a TV usually has power +
    // volume up/down/mute, no play/pause and no volume slider).
    const sf = Number(ent?.attributes?.supported_features) || 0;
    const can = (b: number) => (sf & b) === b;
    const powerable = can(128) || can(256); // TURN_ON | TURN_OFF
    const volSet = can(4), volStep = can(1024), volMute = can(8); // SET | STEP | MUTE
    const muted = !!ent?.attributes?.is_volume_muted;
    const volReal = Math.round((Number(ent?.attributes?.volume_level) || 0) * 100);
    const track = ent?.attributes?.media_title ?? this.cardName(id, title);
    const artist = ent?.attributes?.media_artist ?? '';
    // Speaker grouping (HA media_player.join): sync this speaker with the home's
    // other groupable speakers so they play in step. Transport controls
    // (play/pause/next/…) were removed on purpose — these panels drive speakers
    // that play from a phone or an HA automation, and the one thing wanted here
    // is to bind the pair together, not to skip tracks. Shown only when the
    // device supports GROUPING and there's another speaker in the plan to join.
    const canGroup = can(524288); // GROUPING
    const grouped = ((ent?.attributes?.group_members as string[] | undefined)?.length ?? 0) > 1;
    const groupTargets = canGroup ? this.planGroupSpeakers(id) : [];
    const hasSync = groupTargets.length > 0;
    // Still show the now-playing line when something is on, so the sync button
    // has context; without either there is nothing for this block to hold.
    const showMedia = hasSync || playing;
    return html`<div class="card ${on ? 'on' : ''}">
      <div class="crow">
        <div class="cicon ${on ? 'lit' : ''}">${this.ic('tv')}</div>
        <div class="cgrow">
          <div class="clabel">${this.cardName(id, title)}</div>
          <div class="csub">${playing ? this.t('Playing now') : on ? this.t('On') : this.t('Off')}</div>
        </div>
        ${powerable
          ? html`<button type="button" class="sw ${on ? 'on' : ''}" title="Toggle"
              @click=${() => this.svc('media_player', on ? 'turn_off' : 'turn_on', {}, id, on ? 'off' : 'on')}><span class="sw-k"></span></button>`
          : nothing}
      </div>
      ${showMedia
        ? html`<div class="mp">
            <div class="mpart">${this.ic('album')}</div>
            <div class="mptxt"><div class="mptrack">${track}</div><div class="mpartist">${artist}</div></div>
            ${hasSync
              ? html`<div class="mpctl">
                  <button type="button" class="mpb ${grouped ? 'on' : ''}"
                    title=${grouped ? this.t('Unsync speakers') : this.t('Sync speakers')}
                    @click=${() => grouped
                      ? this.svc('media_player', 'unjoin', {}, id)
                      : this.syncSpeakers(id, ent, groupTargets)}>${this.ic('link')}</button>
                </div>`
              : nothing}
          </div>`
        : nothing}
      ${volSet || volStep || volMute
        ? html`<div class="seg vol">
            ${volMute ? html`<button type="button" class="segb ${muted ? 'on' : ''}" title="Mute"
              @click=${() => this.svc('media_player', 'volume_mute', { is_volume_muted: !muted }, id)}>${this.ic('mute')}</button>` : nothing}
            <button type="button" class="segb" title="Volume down"
              @click=${() => this.mediaVolStep(id, ent, volStep, -1)}>${this.ic('volDown')}</button>
            <div class="volind">${volReal}%</div>
            <button type="button" class="segb" title="Volume up"
              @click=${() => this.mediaVolStep(id, ent, volStep, 1)}>${this.ic('volUp')}</button>
          </div>`
        : nothing}
    </div>`;
  }

  /** Nudge a media player's volume: volume_up/down when it supports stepping,
   *  else a ±5% volume_set. Buttons + a % readout replace the slider. */
  private mediaVolStep(id: string, ent: HassEntity | undefined, volStep: boolean, dir: number): void {
    if (volStep) {
      this.svc('media_player', dir > 0 ? 'volume_up' : 'volume_down', {}, id);
      return;
    }
    const cur = Number(ent?.attributes?.volume_level) || 0;
    this.svc('media_player', 'volume_set', { volume_level: Math.max(0, Math.min(1, cur + dir * 0.05)) }, id);
  }

  /** Group `targets` under `id` and level their volume to `id`'s — so syncing
   *  from the upstairs speaker pulls the others to the upstairs volume, and from
   *  downstairs to the downstairs volume (the initiating speaker sets the level). */
  private syncSpeakers(id: string, ent: HassEntity | undefined, targets: string[]): void {
    this.svc('media_player', 'join', { group_members: targets }, id);
    const vol = Number(ent?.attributes?.volume_level);
    if (Number.isFinite(vol)) {
      for (const t of targets) this.svc('media_player', 'volume_set', { volume_level: vol }, t);
    }
  }

  /** Other speakers in the plan (any room) that support HA grouping — the
   *  targets for a "sync speakers" join. Grouping-capable set only, so the TV
   *  (no GROUPING feature) is never swept in. */
  private planGroupSpeakers(exceptId: string): string[] {
    const floors = this.sceneManager?.roomsByFloor() ?? [this.rooms];
    const out: string[] = [];
    const seen = new Set<string>([exceptId]);
    for (const rs of floors) {
      for (const r of rs) {
        for (const e of r.entities) {
          const eid = e.entity_id;
          if (!eid.startsWith('media_player.') || seen.has(eid)) continue;
          seen.add(eid);
          const sf = Number(this.hass?.states[eid]?.attributes?.supported_features) || 0;
          if (sf & 524288) out.push(eid); // GROUPING
        }
      }
    }
    return out;
  }

  private renderLockCard(id: string) {
    const locked = this.effState(id) === 'locked';
    return html`<button type="button" class="lockbtn ${locked ? 'locked' : 'unlocked'}"
      @click=${() => this.svc('lock', locked ? 'unlock' : 'lock', {}, id, locked ? 'unlocked' : 'locked')}>
      ${this.ic(locked ? 'lockClosed' : 'lockOpen')}
      <div class="cgrow"><div class="lktxt">${locked ? this.t('Locked') : this.t('Unlocked')}</div>
        <div class="lksub">${this.cardName(id)}</div></div>
      ${this.ic('chevUp')}
    </button>`;
  }

  private renderInfoCard(id: string) {
    const ent = this.hass!.states[id];
    const unit = ent?.attributes?.unit_of_measurement ?? '';
    return html`<div class="card">
      <div class="crow">
        <div class="cicon">${this.ic('gauge')}</div>
        <div class="cgrow"><div class="clabel">${this.cardName(id)}</div></div>
        <div class="info-val">${this.effState(id)}${unit}</div>
      </div>
    </div>`;
  }

  /** Master "turn everything off": lights + switches off, media paused. */
  private onRoomAllOff(room: RoomInfo): void {
    if (!this.hass) return;
    const offIds = room.entities
      .filter((e) => ['light', 'switch', 'input_boolean', 'fan'].includes(e.behavior))
      .map((e) => e.entity_id)
      .filter((id) => this.effState(id) === 'on');
    if (offIds.length) {
      const gens = offIds.map((id) => this.setOptimistic(id, 'off'));
      const revert = () => offIds.forEach((id, i) => { if (this.optimistic.get(id)?.gen === gens[i]) this.clearOptimistic(id); });
      try {
        const p: any = this.hass.callService('homeassistant', 'turn_off', { entity_id: offIds });
        if (p && typeof p.catch === 'function') p.catch(revert);
      } catch {
        revert();
      }
    }
    for (const e of room.entities) {
      if (e.behavior !== 'media_player') continue;
      const s = this.effState(e.entity_id);
      if (!['off', 'paused', 'idle', 'standby', 'unavailable', 'unknown'].includes(s)) {
        this.svc('media_player', 'media_pause', {}, e.entity_id, 'paused');
      }
    }
  }

  // -- Overview (Option 1B: house overview) -----------------------------------

  private setViewMode(mode: 'room' | 'overview'): void {
    if (this.viewMode === mode) return;
    this.viewMode = mode;
    this.detailRoomKey = null;
    this.requestUpdate();
    // Обзор hides the 3D; when returning to Комната the viewport is shown again,
    // so reframe it once the layout has settled.
    if (mode === 'room') {
      requestAnimationFrame(() => requestAnimationFrame(() => this.sceneManager?.resetView()));
    }
  }

  private renderViewToggle() {
    const on = (m: string) => (this.viewMode === m ? 'on' : '');
    return html`<div class="view-toggle">
      <button type="button" class="vt-btn ${on('room')}" @click=${() => this.setViewMode('room')}>
        ${this.ic('room')}<span>${this.t('Room')}</span>
      </button>
      <button type="button" class="vt-btn ${on('overview')}" @click=${() => this.setViewMode('overview')}>
        ${this.ic('grid')}<span>${this.t('Overview')}</span>
      </button>
    </div>`;
  }

  /** Aggregate light state + representative brightness for a whole room. */
  private roomLights(room: RoomInfo): { ids: string[]; lightId?: string; anyOn: boolean; bri: number } {
    const ids = room.entities
      .filter((e) => ['light', 'switch', 'input_boolean'].includes(e.behavior))
      .map((e) => e.entity_id)
      .filter((id) => this.hass?.states[id]);
    const anyOn = ids.some((id) => this.effState(id) === 'on');
    const lightId = room.entities.find((e) => e.behavior === 'light' && this.hass?.states[e.entity_id])?.entity_id;
    let bri = 100;
    if (lightId) {
      const b = this.hass?.states[lightId]?.attributes?.brightness;
      bri = b != null ? Math.round((b / 255) * 100) : 100;
      if (this.dragEntity === lightId) bri = this.dragValue;
    }
    return { ids, lightId, anyOn, bri };
  }

  private overviewStats(): { onCount: number; avgTemp: string; roomCount: number } {
    const onCount = this.homeLightsOn(); // whole-home, not just the active floor's rooms
    let sum = 0;
    let n = 0;
    for (const room of this.rooms) {
      const t = this.roomSensor(room, 'temperature', ['°C', '°F']);
      let tv = t ? Number(t.state) : undefined;
      if (tv == null || !Number.isFinite(tv)) {
        const c = room.entities.find((e) => e.behavior === 'climate');
        const cur = c ? this.hass?.states[c.entity_id]?.attributes?.current_temperature : undefined;
        tv = cur != null ? Number(cur) : undefined;
      }
      if (tv != null && Number.isFinite(tv)) { sum += tv; n++; }
    }
    const avgT = n ? sum / n : this.homeTemperature();
    return { onCount, avgTemp: avgT != null ? `${Math.round(avgT)}°` : '—', roomCount: this.rooms.length };
  }

  /** Master "everything off" across the whole home (overview). */
  private allOffHouse(): void {
    if (!this.hass) return;
    const offIds: string[] = [];
    for (const room of this.rooms) {
      for (const e of room.entities) {
        if (['light', 'switch', 'input_boolean', 'fan'].includes(e.behavior) && this.effState(e.entity_id) === 'on') {
          offIds.push(e.entity_id);
        }
        if (e.behavior === 'media_player') {
          const s = this.effState(e.entity_id);
          if (!['off', 'paused', 'idle', 'standby', 'unavailable', 'unknown'].includes(s)) {
            this.svc('media_player', 'media_pause', {}, e.entity_id, 'paused');
          }
        }
      }
    }
    if (offIds.length) {
      const gens = offIds.map((id) => this.setOptimistic(id, 'off'));
      const revert = () => offIds.forEach((id, i) => { if (this.optimistic.get(id)?.gen === gens[i]) this.clearOptimistic(id); });
      try {
        const p: any = this.hass.callService('homeassistant', 'turn_off', { entity_id: offIds });
        if (p && typeof p.catch === 'function') p.catch(revert);
      } catch {
        revert();
      }
    }
  }

  /** Whole-home status for the Обзор status row (heating / blinds / hum / lock). */
  private houseStatus(): { heat: string; heatLabel: string; blinds: string; hum: string; secIcon: string; secLabel: string } {
    let heatN = 0, bTotal = 0, bOpen = 0;
    const locks: string[] = [];
    for (const room of this.rooms) {
      const c = room.entities.find((e) => e.behavior === 'climate');
      if (c) {
        const s = this.effState(c.entity_id);
        if (s !== 'off' && s !== 'unavailable' && s !== 'unknown') heatN++;
      }
      for (const e of room.entities) {
        if (e.behavior === 'cover') {
          bTotal++;
          const pos = this.hass?.states[e.entity_id]?.attributes?.current_position;
          const open = typeof pos === 'number' ? pos > 0 : this.effState(e.entity_id) === 'open';
          if (open) bOpen++;
        }
        if (e.behavior === 'lock') locks.push(e.entity_id);
      }
    }
    let secIcon = 'room', secLabel = this.t('At home');
    if (locks.length) {
      const all = locks.every((id) => this.effState(id) === 'locked');
      secIcon = all ? 'lockClosed' : 'lockOpen';
      secLabel = all ? this.t('Locked') : this.t('Unlocked');
    }
    return {
      heat: String(heatN),
      heatLabel: this.ruPlural(heatN, 'комната греется', 'комнаты греются', 'комнат греются'),
      blinds: `${bOpen} ${this.t('of')} ${bTotal}`,
      hum: this.homeHumidity(),
      secIcon,
      secLabel,
    };
  }

  private renderOverview() {
    const stats = this.overviewStats();
    const st = this.houseStatus();
    const num = (v: any, d: number) => {
      const n = Number(v);
      return Number.isFinite(n) ? n.toLocaleString(this.uiLocale, { minimumFractionDigits: d, maximumFractionDigits: d }) : '—';
    };
    return html`
      <div class="ov-top">
        <div class="ov-clock">
          <div class="ctime">${this.fmtClockTime()}</div>
          <div class="cdate">${this.fmtClockDate()}</div>
        </div>
        <div class="ov-actions">
          <div class="sumcard act"><div class="sumn">${stats.onCount}</div><div class="suml">${this.t('lights on')}</div></div>
          <div class="sumcard"><div class="sumn">${stats.avgTemp}</div><div class="suml">${this.t('on average')}</div></div>
          <button type="button" class="ov-master" @click=${() => this.allOffHouse()}>${this.ic('power')}<span>${this.t('All off short')}</span></button>
          <button type="button" class="bsleep" title="Screensaver" @click=${(e: Event) => this.onSleep(e)}>${this.ic('moon')}</button>
          ${this.renderViewToggle()}
        </div>
      </div>
      <div class="bstatus">
        <div class="bstat warm"><div class="bstat-ic">${this.ic('heat')}</div><div><div class="bstat-v">${st.heat}</div><div class="bstat-l">${st.heatLabel}</div></div></div>
        <div class="bstat"><div class="bstat-ic">${this.ic('curtain')}</div><div><div class="bstat-v">${st.blinds}</div><div class="bstat-l">${this.t('blinds open')}</div></div></div>
        <div class="bstat cool"><div class="bstat-ic">${this.ic('drop')}</div><div><div class="bstat-v">${st.hum}</div><div class="bstat-l">${this.t('humidity in house')}</div></div></div>
        <div class="bstat good"><div class="bstat-ic">${this.ic(st.secIcon)}</div><div><div class="bstat-v">${st.secLabel}</div><div class="bstat-l">${this.t('front door')}</div></div></div>
      </div>
      <div class="ov-grid">
        ${this.renderOverviewRooms(num)}
      </div>
    `;
  }

  /** All rooms of the home, grouped by floor with a heading per floor (headings
   *  span the grid). One scrolling list top-to-bottom, so the whole house is
   *  reachable from Обзор without switching floors first. */
  private renderOverviewRooms(num: (v: any, d: number) => string) {
    const floors = this.sceneManager?.roomsByFloor() ?? [this.rooms];
    this.overviewRoomByKey.clear();
    for (const rs of floors) for (const r of rs) this.overviewRoomByKey.set(r.key, r);
    const multi = this.floorNames.length > 1;
    const anyRoom = floors.some((rs) => rs.length);
    if (!anyRoom) return html`<div class="rp-empty">${this.t('No devices in this room')}</div>`;
    return floors.map((rs, fi) =>
      rs.length
        ? html`${multi ? html`<div class="ov-floor-h">${this.floorNames[fi] ?? ''}</div>` : nothing}
            ${rs.map((r) => this.renderOverviewCard(r, num))}`
        : nothing,
    );
  }

  private renderOverviewCard(room: RoomInfo, num: (v: any, d: number) => string) {
    const { ids, anyOn } = this.roomLights(room);
    // Each light = one segment; the % is how many are on (1 of 5 = 20%, …).
    const onCount = ids.filter((id) => this.effState(id) === 'on').length;
    const pct = ids.length ? Math.round((onCount / ids.length) * 100) : 0;
    const tempEnt = this.roomSensor(room, 'temperature', ['°C', '°F']);
    const humEnt = this.roomSensor(room, 'humidity', ['%']);
    const climate = room.entities.find((e) => e.behavior === 'climate');
    const lock = room.entities.find((e) => e.behavior === 'lock');
    const cover = room.entities.find((e) => e.behavior === 'cover');
    const climateCur = climate ? this.hass?.states[climate.entity_id]?.attributes?.current_temperature : undefined;
    const tempStr = tempEnt ? `${num(tempEnt.state, 1)}°` : climateCur != null ? `${num(climateCur, 1)}°` : null;
    const humStr = humEnt ? `${num(humEnt.state, 0)}%` : null;

    // One extra footer chip (lock > climate > cover), mirroring the mockup.
    let extraChip = nothing as unknown;
    if (lock) {
      const locked = this.effState(lock.entity_id) === 'locked';
      extraChip = html`<button type="button" class="qstat lockq ${locked ? 'locked' : 'unlocked'}"
        @click=${(e: Event) => { e.stopPropagation(); this.svc('lock', locked ? 'unlock' : 'lock', {}, lock.entity_id, locked ? 'unlocked' : 'locked'); }}>
        ${this.ic(locked ? 'lockClosed' : 'lockOpen')}${locked ? this.t('Locked') : this.t('Unlocked')}</button>`;
    } else if (climate) {
      const target = this.hass?.states[climate.entity_id]?.attributes?.temperature;
      extraChip = html`<div class="qstat">${this.ic('heat')}${target != null ? `${target}°` : '—'}</div>`;
    } else if (cover) {
      const pos = this.hass?.states[cover.entity_id]?.attributes?.current_position;
      extraChip = html`<div class="qstat">${this.ic('curtain')}${pos != null ? `${pos}%` : '—'}</div>`;
    }

    return html`<div class="rcard link ${anyOn ? 'on' : ''}" @click=${() => this.openDetail(room.key)}>
      <div class="rchead">
        <div class="rcicon">${this.ic(this.roomIcon(room.name))}</div>
        <div class="cgrow">
          <div class="rcname">${room.name || this.t('Room')}<span class="rcchev">${this.ic('chevRight')}</span></div>
          <div class="rctemp">${[tempStr, humStr].filter(Boolean).join(' · ') || '—'}</div>
        </div>
        ${ids.length
          ? html`<button type="button" class="sw ${anyOn ? 'on' : ''}" title="Toggle"
              @click=${(e: Event) => { e.stopPropagation(); this.onToggleAll(room.entities.filter((x) => ['light', 'switch', 'input_boolean'].includes(x.behavior))); }}><span class="sw-k"></span></button>`
          : nothing}
      </div>
      ${ids.length
        ? html`
          <div class="rcmid">
            <span class="icn-mid">${this.ic('bulb')}</span><span class="lbltxt">${this.t('Light')}</span>
            <div class="grow"></div><span class="brival">${onCount}/${ids.length} · ${pct}%</span>
          </div>
          <div class="lightsegs">
            ${ids.map((id) => {
              const lon = this.effState(id) === 'on';
              const nm = this.hass?.states[id]?.attributes?.friendly_name ?? id;
              return html`<button type="button" class="lightseg ${lon ? 'on' : ''}" title=${nm}
                @click=${(e: Event) => { e.stopPropagation(); this.svc(id.split('.')[0], 'toggle', {}, id, lon ? 'off' : 'on'); }}><span>${this.shortLightName(id, room.name)}</span></button>`;
            })}
          </div>`
        : nothing}
      ${humStr || extraChip !== nothing
        ? html`<div class="rcfoot">
            ${humStr ? html`<div class="qstat">${this.ic('drop')}${humStr}</div>` : nothing}
            ${extraChip}
          </div>`
        : nothing}
    </div>`;
  }

  // -- Render -----------------------------------------------------------------

  protected override render() {
    if (!this.config) return nothing;
    const height = this.config.height ?? '500px';
    const projects = this.config.projects ?? [];

    return html`
      <ha-card
        class=${this.editing
          ? 'editing'
          : `view ${this.viewMode}${this.viewMode === 'room' && this.activeRoom ? ' has-room' : ''}${this.viewMode === 'room' && this.roomPhoto ? ' has-photo' : ''}${this.idle ? ' idle' : ''}`}
        style=${this.editing ? '' : `height:${height}`}
      >
        ${this.viewMode === 'room' && this.roomPhoto
          ? html`<div
              class="roombg${this.roomPhotoBaked ? '' : ' raw'}"
              style=${`background-image:url("${(this.roomPhotoBaked ?? this.roomPhoto).replace(/"/g, '%22')}")`}
            ></div>`
          : nothing}
        <div class="viewport" style=${this.editing ? `height:${height}` : ''}></div>

        ${this.loadError
          ? html`<div class="error">⚠ ${this.loadError}</div>`
          : nothing}

        ${this.editing ? nothing : this.renderLeakAlert()}

        ${this.editing
          ? nothing
          : this.viewMode === 'overview'
            ? html`${this.renderOverview()}${this.renderDetail()}`
            : html`${this.renderStageChrome()}${this.renderRoomPanel()}`}

        ${!this.editing && this.idle ? this.renderScreensaver() : nothing}

        ${this.editing
          ? html`<div class="overlay top-right">
              <button class="btn" title="Reset view" @click=${this.onResetView}>⌂ ${this.t('Reset')}</button>
              <div class="quality-wrap">
                <button class="btn" title="Render quality (lower it if the view stutters on a tablet)"
                  @click=${() => (this.qualityMenuOpen = !this.qualityMenuOpen)}>
                  ⚙ ${this.qualityLabel(this.qualityChoice)}
                </button>
                ${this.qualityMenuOpen
                  ? html`<div class="quality-menu">
                      ${QUALITY_CHOICES.map(
                        (q) => html`<button
                          class="qopt ${q === this.qualityChoice ? 'on' : ''}"
                          @click=${() => this.onPickQuality(q)}>${this.qualityLabel(q)}</button>`,
                      )}
                    </div>`
                  : nothing}
              </div>
              <button class="btn primary" title="Save & exit editor" @click=${this.exitEdit}>
                ✓ ${this.t('Done & Save')}
              </button>
            </div>`
          : nothing}

        <!-- Hidden Edit entry (kiosk-safe): a 5s hold in the bottom-left corner
             opens the editor (then the PIN prompt if one is set). A long-press,
             NOT a tap count, so it never clashes with a kiosk browser's own
             multi-tap menu gesture. -->
        ${this.editing
          ? nothing
          : html`<div
              class="edit-hotspot"
              @pointerdown=${this.onHotspotDown}
              @pointermove=${this.onHotspotMove}
              @pointerup=${this.onHotspotUp}
              @pointercancel=${this.onHotspotUp}
              @pointerleave=${this.onHotspotUp}
            ></div>`}

        ${this.qualityMenuOpen
          ? html`<div class="menu-backdrop" @click=${() => (this.qualityMenuOpen = false)}></div>`
          : nothing}

        ${this.editing ? this.renderEditor() : nothing}

        ${this.importOpen
          ? html`<div class="import-modal">
              <div class="import-box">
                <div class="import-title">Import / Export plan JSON</div>
                <textarea
                  class="import-text"
                  spellcheck="false"
                  placeholder="Paste a floor-plan JSON here, then press Load…"
                  .value=${this.importText}
                  @input=${this.onImportText}
                ></textarea>
                <div class="toolrow">
                  <button class="btn primary" @click=${this.onImportLoad}>📥 Load</button>
                  <button class="btn" @click=${() => (this.importOpen = false)}>Cancel</button>
                </div>
              </div>
            </div>`
          : nothing}

        ${this.pinPromptOpen
          ? html`<div class="import-modal" @click=${this.cancelPin}>
              <form class="pin-box" @click=${(e: Event) => e.stopPropagation()} @submit=${this.submitPin}>
                <div class="import-title">🔒 Enter edit PIN</div>
                <input class="pin-input name-input" type="password" inputmode="numeric"
                  autocomplete="off" placeholder="PIN" />
                ${this.pinError ? html`<div class="pin-error">${this.pinError}</div>` : nothing}
                <div class="toolrow">
                  <button type="submit" class="btn primary">Unlock</button>
                  <button type="button" class="btn" @click=${this.cancelPin}>Cancel</button>
                </div>
              </form>
            </div>`
          : nothing}

        ${this.controlOpen && !this.editing ? this.renderControlPopup() : nothing}

        ${this.toast ? html`<div class="toast">${this.toast}</div>` : nothing}

        ${projects.length > 1
          ? html`
              <div class="overlay top-left">
                <select class="select" @change=${this.onSelectProject}>
                  ${projects.map(
                    (p) => html`<option value=${p.id} ?selected=${p.id === this.activeProjectId}>
                      ${p.name || p.id}
                    </option>`,
                  )}
                </select>
              </div>
            `
          : nothing}

        ${this.floorNames.length > 1 && this.editing
          ? html`
              <div class="overlay bottom">
                ${this.floorNames.map(
                  (name, i) => html`
                    <button
                      class="tab ${i === this.activeFloorIndex ? 'active' : ''}"
                      @click=${() => this.onSelectFloor(i)}
                    >
                      ${name}
                    </button>
                  `,
                )}
              </div>
            `
          : nothing}
      </ha-card>
    `;
  }

  static override styles = css`
    :host {
      display: block;
    }
    /* Kiosk/tablet: never draw a focus ring or tap flash on ANY control.
       WebView draws its own highlight on links/pills/divs too, so this has to
       be blanket — the earlier button-only rule left some controls ringed. */
    * {
      -webkit-tap-highlight-color: transparent;
    }
    *:focus,
    *:focus-visible {
      outline: none !important;
    }
    ha-card {
      display: block;
      position: relative;
      overflow: hidden;
      padding: 0;
    }
    .viewport {
      position: relative;
      width: 100%;
      /* Critical for tablets: stop the browser hijacking pinch into page zoom. */
      touch-action: none;
      overscroll-behavior: contain;
      background: #1b1d22;
    }
    /* The focused room's design photo, spanning the WHOLE card — the canvas
       stops at the side panel, so a backdrop drawn inside the scene could never
       reach behind it. The canvas goes transparent while this is up. */
    .roombg {
      position: absolute;
      inset: 0;
      z-index: 0;
      background-size: cover;
      background-position: center;
      /* The softening is baked into the bitmap once (see bakeRoomPhoto) rather
         than applied as a live CSS filter: a filter on a full-card layer is
         re-evaluated by the compositor as the 3D repaints behind it, which is
         pure cost on a tablet for a picture that never changes. Same look, none
         of the per-frame work. contain keeps it off the 3D's repaint path. */
      contain: strict;
      animation: fade-in 0.32s ease both;
    }
    /* Fallback for the un-baked original (canvas unavailable / cross-origin). */
    .roombg.raw {
      filter: blur(6px) brightness(0.92);
      transform: scale(1.06);
    }
    @keyframes fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    ha-card.has-photo .viewport {
      background: transparent;
    }
    /* Over a photo the panel is glass, not a wall that crops it. Light blur:
       enough to keep white text legible over a bright photo, little enough that
       the room still reads through it. */
    ha-card.has-photo .room-panel {
      background: rgba(16, 17, 21, 0.36);
      backdrop-filter: blur(7px) saturate(1.18);
      -webkit-backdrop-filter: blur(7px) saturate(1.18);
      border-left-color: rgba(255, 255, 255, 0.2);
    }
    .overlay {
      position: absolute;
      z-index: 2;
      display: flex;
      gap: 6px;
    }
    .top-right {
      top: 10px;
      right: 10px;
    }
    .quality-wrap {
      position: relative;
    }
    /* Invisible bottom-left hotspot: hold 5s to open the editor (kiosk-safe).
       Bottom-left keeps it clear of the kiosk's "Home Assistant" back button. */
    .edit-hotspot {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 56px;
      height: 56px;
      z-index: 3;
      touch-action: none;
    }
    /* Tap anywhere outside the open quality menu to dismiss it. Sits above the
       canvas but below the overlay that holds the menu itself. */
    .menu-backdrop {
      position: absolute;
      inset: 0;
      z-index: 1;
    }
    .quality-menu {
      position: absolute;
      top: calc(100% + 6px);
      right: 0;
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 5px;
      border-radius: 10px;
      background: rgba(20, 22, 26, 0.92);
      border: 1px solid rgba(255, 255, 255, 0.16);
      backdrop-filter: blur(6px);
      z-index: 4;
    }
    .qopt {
      font: inherit;
      font-size: 13px;
      color: #fff;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 7px;
      padding: 7px 14px;
      cursor: pointer;
      text-align: left;
      white-space: nowrap;
    }
    .qopt:hover {
      background: rgba(255, 255, 255, 0.14);
    }
    .qopt.on {
      background: var(--primary-color, #03a9f4);
      border-color: var(--primary-color, #03a9f4);
    }
    .top-left {
      top: 10px;
      left: 10px;
    }
    .bottom {
      bottom: 10px;
      left: 50%;
      transform: translateX(-50%);
      flex-wrap: wrap;
      justify-content: center;
      max-width: 90%;
    }
    .btn,
    .tab,
    .select {
      font: inherit;
      font-size: 13px;
      color: #fff;
      background: rgba(30, 33, 40, 0.82);
      border: 1px solid rgba(255, 255, 255, 0.16);
      border-radius: 8px;
      padding: 7px 12px;
      cursor: pointer;
      backdrop-filter: blur(4px);
      -webkit-tap-highlight-color: transparent;
    }
    .btn:hover,
    .tab:hover {
      background: rgba(55, 60, 70, 0.9);
    }
    .tab.active,
    .btn.active {
      background: var(--primary-color, #03a9f4);
      border-color: var(--primary-color, #03a9f4);
    }
    .btn.primary {
      background: #2e7d32;
      border-color: #2e7d32;
    }
    .btn[disabled] {
      opacity: 0.4;
      cursor: default;
      pointer-events: none;
    }
    .toolbar {
      flex-direction: column;
      align-items: stretch;
      gap: 6px;
      top: 10px;
      left: 10px;
      bottom: 10px;
      width: 270px;
      max-width: 80%;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 10px;
      scrollbar-width: thin;
      border-radius: 12px;
      background: rgba(22, 24, 28, 0.86);
      border: 1px solid rgba(255, 255, 255, 0.12);
      backdrop-filter: blur(6px);
      -webkit-overflow-scrolling: touch;
    }
    /* The toolbar is a scrolling column — its children must keep their natural
       height (never shrink), or long content like the palette collapses to a
       thin unusable strip. */
    .toolbar > * {
      flex: 0 0 auto;
    }
    .ed-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 14px;
      font-weight: 700;
      color: #fff;
      padding: 2px 2px 2px;
    }
    /* Uniform two-column button grid — buttons stretch so the panel reads tidy. */
    .grid2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
    }
    .grid2 .btn {
      width: 100%;
      text-align: center;
      padding: 8px 6px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .span2 {
      grid-column: 1 / -1;
    }
    .pin-box {
      width: min(300px, 86%);
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 16px;
      border-radius: 12px;
      background: rgba(24, 26, 30, 0.98);
      border: 1px solid rgba(255, 255, 255, 0.16);
    }
    .pin-error {
      font-size: 12px;
      color: #ff9a9a;
    }
    .panel-section {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid rgba(255, 255, 255, 0.12);
    }
    .color {
      width: 42px;
      height: 30px;
      padding: 0;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 6px;
      background: transparent;
      cursor: pointer;
    }
    .name-input {
      flex: 1;
      min-width: 0;
      font: inherit;
      font-size: 13px;
      color: #fff;
      background: rgba(30, 33, 40, 0.82);
      border: 1px solid rgba(255, 255, 255, 0.16);
      border-radius: 8px;
      padding: 7px 10px;
    }
    .num-input {
      width: 72px;
      font: inherit;
      font-size: 13px;
      color: #fff;
      background: rgba(30, 33, 40, 0.82);
      border: 1px solid rgba(255, 255, 255, 0.16);
      border-radius: 8px;
      padding: 6px 8px;
    }
    .import-modal {
      position: absolute;
      inset: 0;
      z-index: 6;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.5);
    }
    .import-box {
      width: min(560px, 92%);
      max-height: 86%;
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 14px;
      border-radius: 12px;
      background: rgba(24, 26, 30, 0.98);
      border: 1px solid rgba(255, 255, 255, 0.16);
    }
    .import-title {
      font-size: 14px;
      font-weight: 600;
      color: #fff;
    }
    .import-text {
      width: 100%;
      box-sizing: border-box;
      min-height: 240px;
      resize: vertical;
      font-family: ui-monospace, Menlo, Consolas, monospace;
      font-size: 12px;
      color: #e6e6e6;
      background: rgba(15, 17, 20, 0.95);
      border: 1px solid rgba(255, 255, 255, 0.16);
      border-radius: 8px;
      padding: 10px;
    }
    .toolrow {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      align-items: center;
    }
    .select.wide {
      min-width: 150px;
    }
    .hint {
      font-size: 12px;
      color: #cfe0ff;
      background: rgba(30, 33, 40, 0.7);
      padding: 4px 8px;
      border-radius: 6px;
    }
    ha-entity-picker {
      width: 240px;
      max-width: 70vw;
    }
    .palette-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    .palette-thumb {
      width: 28px;
      height: 28px;
      border-radius: 4px;
      background: rgba(255, 255, 255, 0.06);
    }
    .palette {
      background: rgba(22, 24, 28, 0.96);
      border: 1px solid rgba(255, 255, 255, 0.16);
      border-radius: 12px;
      padding: 8px 10px;
      max-height: 50vh;
      overflow-y: auto;
      overflow-x: hidden;
      backdrop-filter: blur(6px);
      max-width: 340px;
      flex: 0 0 auto; /* never let the flex column squish it to a thin strip */
    }
    .zone-devs {
      display: flex;
      flex-direction: column;
      gap: 2px;
      max-height: 34vh;
      overflow-y: auto;
      overflow-x: hidden;
      background: rgba(255, 255, 255, 0.04);
      border-radius: 8px;
      padding: 5px 7px;
    }
    .zone-dev {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: #ddd;
      cursor: pointer;
    }
    .zone-dev span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    /* An entity already assigned to another room is dimmed + tagged. */
    .zone-dev.taken {
      opacity: 0.6;
    }
    .zone-dev .taken-tag {
      color: #f3a83c;
      font-style: normal;
    }
    /* Ordered device list for the selected room (reorder ▲▼, ✕ removes). */
    .zone-order {
      display: flex;
      flex-direction: column;
      gap: 3px;
      max-height: 28vh;
      overflow-y: auto;
      overflow-x: hidden;
      background: rgba(255, 255, 255, 0.04);
      border-radius: 8px;
      padding: 5px;
    }
    .zrow {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: #ddd;
    }
    .zrow .zname {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .zbtn {
      flex: none;
      width: 26px;
      height: 24px;
      border-radius: 6px;
      border: 1px solid var(--brd);
      background: rgba(255, 255, 255, 0.06);
      color: var(--tx);
      cursor: pointer;
      font-size: 11px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .zbtn:hover {
      background: rgba(255, 255, 255, 0.14);
    }
    .zbtn:disabled {
      opacity: 0.3;
      cursor: default;
    }
    .zbtn.del:hover {
      background: rgba(214, 69, 69, 0.5);
    }
    .palette-group,
    .panel-group {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: #8fa6c4;
      margin: 8px 2px 2px;
      padding-bottom: 4px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .palette-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, 76px);
      gap: 6px;
      justify-content: start;
    }
    .palette-cell {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      width: 76px;
      padding: 4px;
      border-radius: 8px;
      border: 1px solid transparent;
      background: rgba(255, 255, 255, 0.04);
      color: #ddd;
      font: inherit;
      font-size: 10px;
      cursor: pointer;
    }
    .palette-cell:hover {
      background: rgba(255, 255, 255, 0.1);
    }
    .palette-cell.active {
      border-color: var(--primary-color, #03a9f4);
      background: rgba(3, 169, 244, 0.18);
    }
    .palette-cell img {
      width: 64px;
      height: 64px;
    }
    .palette-cell span {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 68px;
    }
    /* Water leak. Sits above the screensaver (z-index 40) on purpose: a panel
       that has dimmed itself to a clock is exactly when a leak most needs to be
       seen. Not dismissible — it goes when the sensor dries, not when tapped. */
    .leak-alert {
      position: absolute;
      z-index: 60;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      padding: 24px;
      text-align: center;
      color: #fff;
      background: radial-gradient(ellipse at center, rgba(206, 38, 30, 0.98), rgba(120, 14, 11, 0.99));
      animation: leak-flash 1.1s ease-in-out infinite;
    }
    @keyframes leak-flash {
      0%, 100% { filter: brightness(1); }
      50% { filter: brightness(1.35); }
    }
    .leak-x {
      position: absolute;
      top: 14px;
      right: 16px;
      appearance: none;
      cursor: pointer;
      width: 52px;
      height: 52px;
      border-radius: 50%;
      color: #fff;
      font-size: 24px;
      line-height: 1;
      background: rgba(255, 255, 255, 0.16);
      border: 1px solid rgba(255, 255, 255, 0.34);
    }
    .leak-ic {
      display: grid;
      place-items: center;
      width: 84px;
      height: 84px;
      border-radius: 26px;
      background: rgba(255, 255, 255, 0.18);
    }
    .leak-ic .icn { width: 46px; height: 46px; }
    .leak-title { font-size: 34px; font-weight: 800; letter-spacing: 0.3px; }
    .leak-sub { font-size: 18px; opacity: 0.95; max-width: 80%; }
    .leak-hint { font-size: 14px; opacity: 0.78; }
    .leak-btns { display: flex; gap: 12px; margin-top: 8px; flex-wrap: wrap; justify-content: center; }
    /* Deliberately large: this gets tapped in a hurry, sometimes with wet hands. */
    .leak-b {
      appearance: none;
      cursor: pointer;
      color: #fff;
      background: rgba(255, 255, 255, 0.16);
      border: 1px solid rgba(255, 255, 255, 0.34);
      border-radius: 14px;
      padding: 16px 28px;
      font-size: 18px;
      font-weight: 700;
    }
    .leak-b.primary { color: #8f1410; background: #fff; border-color: #fff; }
    .leak-b[disabled] { opacity: 0.55; cursor: default; }

    .toast {
      position: absolute;
      z-index: 4;
      bottom: 14px;
      left: 50%;
      transform: translateX(-50%);
      color: #fff;
      background: rgba(20, 22, 26, 0.92);
      border: 1px solid rgba(255, 255, 255, 0.16);
      padding: 9px 14px;
      border-radius: 10px;
      font-size: 13px;
      max-width: 86%;
      text-align: center;
      backdrop-filter: blur(4px);
    }
    .control-backdrop {
      position: absolute;
      inset: 0;
      z-index: 5;
    }
    .control-popup {
      position: absolute;
      z-index: 6;
      /* Horizontal centering only; the vertical "top" is set in JS
       * (positionControlPopup) from the popup's measured height so it can never
       * be clipped by the card's overflow:hidden edges. */
      transform: translateX(-50%);
      width: max-content;
      min-width: 180px;
      max-width: min(320px, 84%);
      max-height: 90%;
      overflow-y: auto;
      overflow-x: hidden;
      background: rgba(20, 22, 26, 0.62);
      border: 1px solid rgba(255, 255, 255, 0.18);
      border-radius: 12px;
      padding: 5px 8px;
      backdrop-filter: blur(7px);
      box-shadow: 0 6px 22px rgba(0, 0, 0, 0.45);
    }
    .control-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 600;
      font-size: 12px;
      color: #cfe0ff;
      padding: 1px 1px 4px;
      gap: 8px;
    }
    .control-head span {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .ctl.back {
      min-width: 26px;
      min-height: 24px;
      padding: 2px 5px;
    }
    .ctl.back .icn {
      width: 15px;
      height: 15px;
      transform: rotate(-90deg);
    }
    /* Room category chooser (Lights / Climate / Curtains …). */
    .cat-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
      padding: 4px 0 2px;
    }
    .cat-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      font: inherit;
      font-size: 13px;
      color: #eee;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.16);
      border-radius: 9px;
      padding: 10px 10px;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }
    .cat-btn:active {
      background: rgba(255, 255, 255, 0.18);
    }
    .cat-btn .icn {
      width: 20px;
      height: 20px;
      flex: 0 0 auto;
    }
    .cat-btn span {
      flex: 1 1 auto;
    }
    .cat-btn small {
      color: #9fb3cc;
      font-size: 11px;
    }
    .control-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 5px 2px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }
    .ctl.big {
      padding: 6px 12px;
      font-size: 15px;
    }
    .control-name {
      color: #eee;
      font-size: 13px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex: 1 1 auto;
      min-width: 0;
    }
    .control-ctls {
      display: flex;
      align-items: center;
      gap: 6px;
      flex: 0 0 auto;
    }
    .ctl {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.16);
      color: #eee;
      border-radius: 8px;
      padding: 6px 9px;
      font-size: 14px;
      cursor: pointer;
      line-height: 1;
      /* Reliable finger tap targets on tablets. */
      min-width: 36px;
      min-height: 34px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
    }
    .ctl:active {
      background: rgba(255, 255, 255, 0.18);
    }
    .ctl.close {
      min-width: 30px;
      min-height: 28px;
      padding: 3px 7px;
    }
    .ctl.on {
      background: rgba(3, 169, 244, 0.35);
      border-color: var(--primary-color, #03a9f4);
    }
    .icn {
      width: 18px;
      height: 18px;
      display: block;
    }
    .ctl.big .icn {
      width: 20px;
      height: 20px;
    }
    .ctl-range {
      width: 92px;
    }
    .ctl-col {
      display: flex;
      flex-direction: column;
      gap: 4px;
      align-items: flex-end;
    }
    .ctl-row {
      display: flex;
      gap: 5px;
      align-items: center;
    }
    .ctl-row.wrap {
      flex-wrap: wrap;
      justify-content: flex-end;
    }
    .ctl-temp {
      min-width: 70px;
      text-align: center;
      color: #9ad0ff;
      font-size: 13px;
    }
    .ctl-state {
      color: #ffe7a0;
      font-size: 13px;
    }
    .error {
      position: absolute;
      z-index: 3;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #ffb3b3;
      background: rgba(40, 20, 20, 0.9);
      padding: 12px 16px;
      border-radius: 8px;
      max-width: 80%;
      text-align: center;
    }

    /* ===================================================================
       Room-in-focus layout (Option 1A): 3D + clock + pills on the left,
       the selected room's device panel on the right.
       =================================================================== */
    ha-card.view {
      --accent: #f3a83c;
      --cool: #5bb8e8;
      --tx: #f2f3f6;
      --mut: #99a0ac;
      --brd: rgba(255, 255, 255, 0.09);
      --card: rgba(255, 255, 255, 0.045);
      --card2: rgba(255, 255, 255, 0.08);
      --panel-w: clamp(300px, 36%, 470px);
      color: var(--tx);
      font-family: 'Onest', system-ui, -apple-system, 'Segoe UI', sans-serif;
      background: radial-gradient(150% 120% at 80% 4%, #20222a, #141519 52%, #0f1013);
    }
    ha-card.view.room .viewport {
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      width: auto;
      height: auto;
      background: transparent;
      /* Deliberately NOT animated. Easing the right edge resizes the WebGL
         canvas on every frame of the transition, and each resize reallocates
         the drawing buffer and forces a synchronous draw (see
         SceneManager.resize) — which is what made opening a room stutter on the
         tablets. The canvas now resizes once and the panel slides over it on
         transform alone. */
    }
    /* A room is in focus → make room for the right-side panel. */
    ha-card.view.room.has-room .viewport {
      right: var(--panel-w);
    }
    .icn {
      width: 20px;
      height: 20px;
      flex: none;
    }

    /* ---- Clock + status dots + room pills (over the 3D) ---- */
    .clock {
      position: absolute;
      top: 26px;
      left: 30px;
      z-index: 3;
      pointer-events: none;
    }
    .ctime {
      font-family: 'Unbounded', 'Onest', sans-serif;
      font-size: 64px;
      line-height: 0.9;
      font-weight: 300;
      letter-spacing: -0.02em;
      color: #fff;
      font-variant-numeric: tabular-nums;
    }
    .cdate {
      margin-top: 10px;
      font-size: 15px;
      color: var(--mut);
    }
    .topstat {
      position: absolute;
      top: 30px;
      right: 30px;
      z-index: 4;
      display: flex;
      align-items: center;
      gap: 10px;
      /* Not animated. Easing the right edge relayouts this row on every frame of
         the panel animation. A transform would be compositor-only, but --panel-w
         is a clamp() holding a percentage, and inside transform a percentage
         resolves against this element's own width rather than the card's — so it
         lands in the wrong place. Snapping matches .stage-bottom below. */
    }
    ha-card.view.room.has-room .topstat {
      right: calc(var(--panel-w) + 24px);
    }
    .sdot {
      position: relative;
      width: 42px;
      height: 42px;
      border-radius: 13px;
      background: var(--card);
      border: 1px solid var(--brd);
      color: var(--mut);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font: inherit;
    }
    .sdot .on-dot {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--accent);
    }
    /* Bottom stack over the 3D: floor tabs, room pills, and the "pick a room"
       hint. Shifts left of the panel when a room is in focus. */
    .stage-bottom {
      position: absolute;
      left: 26px;
      right: 26px;
      bottom: 22px;
      z-index: 3;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 11px;
      /* Not animated: this box is pinned on BOTH edges, so easing the right one
         animates its WIDTH — a relayout of the floor tabs and room pills every
         frame. Its content is left-aligned, so snapping the edge is invisible
         unless the pills happen to wrap. */
    }
    ha-card.view.room.has-room .stage-bottom {
      right: calc(var(--panel-w) + 24px);
    }
    .pills {
      display: flex;
      flex-wrap: wrap;
      gap: 9px;
    }
    .ftabs {
      display: inline-flex;
      padding: 4px;
      gap: 3px;
      border-radius: 13px;
      background: var(--card);
      border: 1px solid var(--brd);
    }
    .ftab {
      padding: 8px 15px;
      border-radius: 9px;
      border: none;
      background: transparent;
      color: var(--mut);
      font: inherit;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }
    .ftab.on {
      background: #fff;
      color: #17181c;
    }
    .ahint {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 15px;
      border-radius: 13px;
      background: rgba(243, 168, 60, 0.14);
      border: 1px solid rgba(243, 168, 60, 0.4);
      color: var(--accent);
      font-size: 13.5px;
      font-weight: 600;
      max-width: 100%;
    }
    .ahint .icn {
      width: 16px;
      height: 16px;
    }
    /* Room panel header top row (name + close). */
    .rp-top {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .rp-top .rp-name {
      flex: 1;
      min-width: 0;
    }
    .closebtn {
      width: 38px;
      height: 38px;
      flex: none;
      border-radius: 12px;
      border: 1px solid var(--brd);
      background: var(--card);
      color: var(--mut);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
    .closebtn:hover {
      background: var(--card2);
      color: var(--tx);
    }
    /* Climate mode chips — wrap onto more rows so a unit with many modes
       (auto/fan/dry/cool/heat/off) is never squashed or clipped. */
    .seg {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 14px;
    }
    .segb {
      flex: 1 1 auto;
      min-width: 72px;
      padding: 10px 8px;
      border-radius: 11px;
      border: 1px solid var(--brd);
      background: rgba(255, 255, 255, 0.05);
      color: var(--mut);
      font: inherit;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      -webkit-tap-highlight-color: transparent;
    }
    .segb.on {
      background: rgba(91, 184, 232, 0.18);
      border-color: rgba(91, 184, 232, 0.5);
      color: var(--cool);
    }
    /* Blinds quick buttons. */
    .qbtns {
      display: flex;
      gap: 8px;
      margin-top: 12px;
    }
    /* Intercom: two big pill buttons, icon over label. */
    .intercom-btns {
      gap: 10px;
    }
    .intercom-btns .qb {
      flex-direction: column;
      gap: 8px;
      padding: 16px 0;
      font-size: 14px;
      border-radius: 14px;
      transition: background 0.15s ease;
    }
    .intercom-btns .qb-ic {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .intercom-btns .qb-ic .icn {
      width: 25px;
      height: 25px;
    }
    .intercom-btns .qb.on {
      background: var(--accent, #f3a83c);
      color: #17181c;
      border-color: transparent;
    }
    .intercom-btns .qb.primary {
      background: #2e7d5b;
      color: #fff;
      border-color: transparent;
    }
    .intercom-btns .qb.primary:hover {
      background: #34926a;
    }
    .card.intercom.ring .cicon {
      background: #d64545;
      color: #fff;
      animation: pulse 1.1s ease-in-out infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.45; }
    }
    .qb {
      flex: 1;
      padding: 11px 0;
      border-radius: 12px;
      border: 1px solid var(--brd);
      background: rgba(255, 255, 255, 0.05);
      color: var(--tx);
      font: inherit;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }
    .qb:hover {
      background: rgba(255, 255, 255, 0.12);
    }
    /* ---- Screensaver (idle) ---- */
    .saver {
      position: absolute;
      inset: 0;
      z-index: 40;
      background: radial-gradient(150% 120% at 50% 0%, #14161d, #0a0b0e 60%);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      animation: rp-fade 0.4s both;
    }
    @keyframes rp-fade {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .saver-aurora {
      position: absolute;
      inset: -20%;
      background:
        radial-gradient(40% 40% at 25% 30%, rgba(243, 168, 60, 0.22), transparent 70%),
        radial-gradient(35% 35% at 78% 65%, rgba(91, 184, 232, 0.2), transparent 70%),
        radial-gradient(30% 30% at 60% 20%, rgba(185, 140, 255, 0.16), transparent 70%);
      filter: blur(20px);
      animation: aurora 16s ease-in-out infinite alternate;
    }
    @keyframes aurora {
      from { transform: translate(-3%, -2%) scale(1); }
      to { transform: translate(4%, 3%) scale(1.12); }
    }
    .saver-in {
      position: relative;
      z-index: 2;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    .saver-home {
      font-size: 20px;
      font-weight: 600;
      color: var(--mut);
      letter-spacing: 0.04em;
    }
    .saver-time {
      font-family: 'Unbounded', 'Onest', sans-serif;
      font-weight: 300;
      font-size: 132px;
      line-height: 0.92;
      color: #fff;
      letter-spacing: -0.03em;
      font-variant-numeric: tabular-nums;
      margin-top: 6px;
    }
    .saver-date {
      font-size: 18px;
      color: var(--mut);
      margin-top: 10px;
    }
    .saver-info {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 14px;
      margin-top: 34px;
    }
    .si {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 13px 18px;
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.045);
      border: 1px solid var(--brd);
      color: var(--mut);
    }
    .si .icn {
      width: 22px;
      height: 22px;
    }
    .si.cool .icn {
      color: var(--cool);
    }
    .si.good .icn {
      color: #37c58e;
    }
    .sitx {
      text-align: left;
    }
    .siv {
      font-size: 19px;
      font-weight: 700;
      color: #fff;
      line-height: 1;
    }
    .sil {
      font-size: 12px;
      color: var(--mut);
      margin-top: 3px;
    }
    .saver-hint {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 38px;
      font-size: 14px;
      color: var(--fnt, #646a75);
    }
    .saver-hint .icn {
      width: 17px;
      height: 17px;
    }
    .pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 14px;
      border-radius: 14px;
      background: var(--card);
      border: 1px solid var(--brd);
      color: var(--mut);
      font: inherit;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.16s, color 0.16s;
      -webkit-tap-highlight-color: transparent;
    }
    .pill .icn {
      width: 18px;
      height: 18px;
    }
    .pill:hover {
      background: var(--card2);
      color: var(--tx);
    }
    .pill.on {
      background: #fff;
      color: #17181c;
      border-color: #fff;
    }

    /* ---- Right-side room control panel ---- */
    .room-panel {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      width: var(--panel-w);
      z-index: 5;
      display: flex;
      flex-direction: column;
      background: var(--model, #141519);
      border-left: 1px solid var(--brd);
      animation: panel-in 0.28s cubic-bezier(0.22, 1, 0.36, 1) both;
    }
    @keyframes panel-in {
      from { transform: translateX(18px); opacity: 0; }
      to { transform: none; opacity: 1; }
    }
    .rp-head {
      padding: 26px 22px 12px;
    }
    .rp-name {
      font-size: 25px;
      font-weight: 700;
      color: #fff;
      letter-spacing: -0.01em;
    }
    .rp-chips {
      display: flex;
      gap: 8px;
      margin-top: 12px;
    }
    .rp-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 11px;
      border-radius: 11px;
      background: var(--card);
      border: 1px solid var(--brd);
      font-size: 14px;
      font-weight: 600;
      color: var(--tx);
    }
    .rp-chip .icn {
      width: 17px;
      height: 17px;
      color: var(--mut);
    }
    .rp-chip.cool .icn {
      color: var(--cool);
    }
    .rp-body {
      flex: 1;
      overflow-y: auto;
      /* Only ever scroll vertically. Without this, overflow-y:auto makes the X
         axis 'auto' too, so any hair of horizontal overflow (a wide light grid,
         a long name) turns into a left-right drag/wobble. Clip it instead. */
      overflow-x: hidden;
      padding: 6px 20px 18px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    /* Let cards + their grid tiles shrink to the panel width instead of forcing
       a horizontal overflow (flex/grid items default to min-width:auto). */
    .rp-body > .card {
      min-width: 0;
    }
    .rp-body::-webkit-scrollbar {
      width: 0;
    }
    .rp-empty {
      color: var(--mut);
      font-size: 14px;
      padding: 24px 4px;
      text-align: center;
    }
    .rp-foot {
      padding: 12px 20px 18px;
      border-top: 1px solid var(--brd);
    }
    .rp-master {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 9px;
      width: 100%;
      padding: 14px;
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid var(--brd);
      color: var(--tx);
      font: inherit;
      font-weight: 700;
      font-size: 15px;
      cursor: pointer;
      transition: background 0.15s;
    }
    .rp-master:hover {
      background: rgba(255, 255, 255, 0.11);
    }

    /* ---- Device cards ---- */
    .card {
      background: var(--card);
      border: 1px solid var(--brd);
      border-radius: 18px;
      padding: 16px;
      animation: rp-rise 0.36s both;
    }
    @keyframes rp-rise {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: none; }
    }
    .card.on {
      border-color: rgba(243, 168, 60, 0.5);
      background: linear-gradient(rgba(243, 168, 60, 0.16), transparent 60%), var(--card);
    }
    .card.on.cool {
      border-color: rgba(91, 184, 232, 0.5);
      background: linear-gradient(rgba(91, 184, 232, 0.15), transparent 60%), var(--card);
    }
    .crow {
      display: flex;
      align-items: center;
      gap: 13px;
    }
    .cicon {
      width: 44px;
      height: 44px;
      border-radius: 13px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.06);
      color: var(--mut);
      flex: none;
      border: none;
      cursor: default;
    }
    button.cicon {
      cursor: pointer;
    }
    .cicon .icn {
      width: 23px;
      height: 23px;
    }
    .card.on .cicon.lit {
      background: rgba(243, 168, 60, 0.16);
      color: var(--accent);
    }
    .card.on.cool .cicon.lit {
      background: rgba(91, 184, 232, 0.16);
      color: var(--cool);
    }
    /* Per-light tiles: a wrapping grid so each light is controlled on its own,
       with bigger icons and long names clamped to two lines (never overflow). */
    .lgrid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(94px, 1fr));
      gap: 8px;
      margin-top: 12px;
    }
    .ltile {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      min-width: 0;
      padding: 12px 6px 10px;
      border-radius: 14px;
      border: 1px solid var(--brd);
      background: rgba(255, 255, 255, 0.04);
      color: var(--mut);
      font: inherit;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }
    .ltile.on {
      background: rgba(243, 168, 60, 0.14);
      border-color: rgba(243, 168, 60, 0.4);
      color: var(--tx);
    }
    .lti {
      width: 48px;
      height: 48px;
      border-radius: 13px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.06);
      color: var(--mut);
    }
    .lti.lit {
      background: rgba(243, 168, 60, 0.18);
      color: var(--accent);
    }
    .lti .icn {
      width: 26px;
      height: 26px;
    }
    .ltn {
      font-size: 12px;
      font-weight: 600;
      line-height: 1.2;
      text-align: center;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      max-width: 100%;
      word-break: break-word;
    }
    /* Media volume buttons for devices without a volume slider (icon chips). */
    .seg.vol .segb {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 11px 0;
    }
    .seg.vol .segb .icn {
      width: 20px;
      height: 20px;
    }
    /* Volume % readout between the − / + chips (replaces the slider). */
    .seg.vol .volind {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 15px;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
      color: var(--txt);
    }
    .cgrow {
      flex: 1;
      min-width: 0;
    }
    .clabel {
      font-size: 16px;
      font-weight: 700;
      color: var(--tx);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .csub {
      font-size: 13px;
      color: var(--mut);
      margin-top: 3px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .info-val {
      font-size: 15px;
      font-weight: 700;
      color: #fff;
      flex: none;
    }
    /* Toggle switch */
    .sw {
      width: 54px;
      height: 31px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.14);
      position: relative;
      cursor: pointer;
      flex: none;
      border: none;
      padding: 0;
      transition: background 0.2s;
    }
    .sw-k {
      position: absolute;
      top: 3px;
      left: 3px;
      width: 25px;
      height: 25px;
      border-radius: 50%;
      background: #fff;
      transition: left 0.2s;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.35);
    }
    .sw.on {
      background: var(--accent);
    }
    .sw.on .sw-k {
      left: 26px;
    }
    /* Slider */
    .slider {
      height: 44px;
      border-radius: 13px;
      background: rgba(255, 255, 255, 0.08);
      position: relative;
      margin-top: 14px;
      cursor: pointer;
      overflow: hidden;
      touch-action: none;
      user-select: none;
    }
    .slider-fill {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 0;
      background: var(--accent);
      border-radius: 13px;
    }
    .slider-fill.white {
      background: rgba(255, 255, 255, 0.88);
    }
    .slider-lab {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 14px;
      font-size: 13px;
      font-weight: 700;
      color: #fff;
      pointer-events: none;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
    }
    /* White (cover) fill: dark labels read better on the light bar. */
    .slider.cover .slider-lab {
      color: #2b2e35;
      text-shadow: 0 1px 2px rgba(255, 255, 255, 0.3);
    }
    /* Climate stepper */
    .stepper {
      display: flex;
      align-items: center;
      gap: 4px;
      flex: none;
    }
    .stbtn {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.07);
      border: 1px solid var(--brd);
      color: var(--tx);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      flex: none;
    }
    .stbtn:hover {
      background: rgba(255, 255, 255, 0.13);
    }
    .tval {
      font-size: 24px;
      font-weight: 700;
      min-width: 46px;
      text-align: center;
      color: #fff;
      font-variant-numeric: tabular-nums;
    }
    /* Media */
    .mp {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 14px;
    }
    .mpart {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: linear-gradient(135deg, #3a3d47, #22242a);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--mut);
      flex: none;
    }
    .mptxt {
      flex: 1;
      min-width: 0;
    }
    .mptrack {
      font-size: 15px;
      font-weight: 700;
      color: #fff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .mpartist {
      font-size: 13px;
      color: var(--mut);
      margin-top: 1px;
    }
    .mpctl {
      display: flex;
      align-items: center;
      gap: 5px;
      flex: none;
    }
    .mpb {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--tx);
      cursor: pointer;
      background: rgba(255, 255, 255, 0.06);
      border: none;
      flex: none;
    }
    .mpb:hover {
      background: rgba(255, 255, 255, 0.12);
    }
    .mpb.play {
      background: #fff;
      color: #17181c;
    }
    /* Speakers currently synced together: the link button lights accent. */
    .mpb.on {
      background: var(--accent, #f3a83c);
      color: #17181c;
    }
    .mpb .icn {
      width: 22px;
      height: 22px;
    }
    /* Lock */
    .lockbtn {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      padding: 15px;
      border-radius: 16px;
      cursor: pointer;
      font: inherit;
      border: 1px solid var(--brd);
      background: var(--card);
      animation: rp-rise 0.36s both;
    }
    .lockbtn.locked {
      background: rgba(55, 197, 142, 0.13);
      border-color: rgba(55, 197, 142, 0.42);
      color: #37c58e;
    }
    .lockbtn.unlocked {
      background: rgba(242, 106, 75, 0.13);
      border-color: rgba(242, 106, 75, 0.42);
      color: #f26a4b;
    }
    .lktxt {
      font-size: 16px;
      font-weight: 700;
    }
    .lksub {
      font-size: 13px;
      opacity: 0.75;
      font-weight: 500;
      margin-top: 1px;
    }

    /* ---- View toggle (Обзор / Комната) ---- */
    .view-toggle {
      display: inline-flex;
      align-self: center;
      flex: none;
      padding: 4px;
      gap: 3px;
      border-radius: 13px;
      background: var(--card);
      border: 1px solid var(--brd);
    }
    .vt-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 12px;
      border-radius: 9px;
      border: none;
      background: transparent;
      color: var(--mut);
      font: inherit;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }
    .vt-btn .icn {
      width: 15px;
      height: 15px;
    }
    .vt-btn.on {
      background: #fff;
      color: #17181c;
    }

    /* ===================================================================
       House overview (Option 1B): summary bar + 3D banner + room grid.
       =================================================================== */
    ha-card.view.overview {
      background: radial-gradient(1200px 900px at 28% 0%, #1b1d24, #0b0c0e 62%);
    }
    /* Обзор has no 3D — it's a pure grid dashboard (the 3D lives in Комната). */
    ha-card.view.overview .viewport {
      display: none;
    }
    .ov-top {
      position: absolute;
      top: 30px;
      left: 30px;
      right: 30px;
      z-index: 5;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 18px;
    }
    .ov-actions {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
      justify-content: flex-end;
    }
    .sumcard {
      height: 42px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 0;
      padding: 0 15px;
      border-radius: 13px;
      background: var(--card);
      border: 1px solid var(--brd);
      min-width: 90px;
    }
    .sumn {
      font-size: 19px;
      font-weight: 700;
      color: #fff;
      line-height: 1.05;
    }
    .suml {
      font-size: 11.5px;
      color: var(--mut);
    }
    .sumcard.act {
      background: rgba(243, 168, 60, 0.16);
      border-color: rgba(243, 168, 60, 0.48);
    }
    .sumcard.act .sumn {
      color: var(--accent);
    }
    .ov-master {
      height: 42px;
      display: inline-flex;
      align-items: center;
      gap: 9px;
      padding: 0 18px;
      border-radius: 13px;
      background: var(--card);
      border: 1px solid var(--brd);
      color: var(--tx);
      font: inherit;
      font-weight: 700;
      font-size: 14px;
      cursor: pointer;
    }
    .ov-master:hover {
      background: var(--card2);
    }
    .ov-banner-label {
      position: absolute;
      top: 120px;
      left: 30px;
      right: 30px;
      height: 150px;
      z-index: 6;
      pointer-events: none;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding-left: 22px;
      border-radius: 20px;
      background: linear-gradient(90deg, rgba(12, 13, 16, 0.92) 0%, rgba(12, 13, 16, 0.55) 20%, transparent 42%);
    }
    .bmh {
      font-size: 19px;
      font-weight: 700;
      color: #fff;
    }
    .bms {
      font-size: 13px;
      color: var(--mut);
      margin-top: 3px;
    }
    .bsleep {
      width: 42px;
      height: 42px;
      flex: none;
      border-radius: 13px;
      border: 1px solid var(--brd);
      background: var(--card);
      color: var(--mut);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
    .bsleep:hover {
      background: var(--card2);
      color: var(--tx);
    }
    /* House status row (heating / blinds / humidity / door). */
    .bstatus {
      position: absolute;
      top: 122px;
      left: 30px;
      right: 30px;
      z-index: 5;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
    }
    .bstat {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 13px 16px;
      border-radius: 16px;
      background: var(--card);
      border: 1px solid var(--brd);
      min-width: 0;
    }
    .bstat-ic {
      width: 40px;
      height: 40px;
      flex: none;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.06);
      color: var(--mut);
    }
    .bstat.warm .bstat-ic {
      background: rgba(243, 168, 60, 0.16);
      color: var(--accent);
    }
    .bstat.cool .bstat-ic {
      background: rgba(91, 184, 232, 0.16);
      color: var(--cool);
    }
    .bstat.good .bstat-ic {
      background: rgba(55, 197, 142, 0.16);
      color: #37c58e;
    }
    .bstat-v {
      font-size: 18px;
      font-weight: 700;
      color: #fff;
      line-height: 1.1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .bstat-l {
      font-size: 12px;
      color: var(--mut);
      margin-top: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .ov-grid {
      position: absolute;
      top: 202px;
      left: 30px;
      right: 30px;
      bottom: 26px;
      z-index: 5;
      overflow-y: auto;
      overflow-x: hidden; /* vertical scroll only — never a left-right wobble */
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 14px;
      align-content: start;
    }
    /* Floor heading spans the whole grid row so the cards below it flow back to
       the first column — one continuous scroll, split into floors. */
    .ov-floor-h {
      grid-column: 1 / -1;
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 0.02em;
      color: rgba(255, 255, 255, 0.62);
      text-transform: uppercase;
      padding: 6px 2px 0;
      margin-top: 4px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }
    .ov-floor-h:first-child {
      margin-top: 0;
      border-top: none;
    }
    .ov-grid::-webkit-scrollbar {
      width: 0;
    }
    .rcard {
      background: var(--card);
      border: 1px solid var(--brd);
      border-radius: 18px;
      padding: 15px 16px 14px;
      display: flex;
      flex-direction: column;
      min-width: 0; /* shrink to the grid column instead of overflowing it */
      animation: rp-rise 0.36s both;
    }
    .rcard.on {
      border-color: rgba(243, 168, 60, 0.5);
      background: linear-gradient(rgba(243, 168, 60, 0.14), transparent 55%), var(--card);
    }
    .rchead {
      display: flex;
      align-items: center;
      gap: 11px;
    }
    .rcicon {
      width: 38px;
      height: 38px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.06);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--mut);
      flex: none;
    }
    .rcicon .icn {
      width: 20px;
      height: 20px;
    }
    .rcard.on .rcicon {
      background: rgba(243, 168, 60, 0.16);
      color: var(--accent);
    }
    .rcname {
      font-size: 16px;
      font-weight: 700;
      color: var(--tx);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .rctemp {
      font-size: 12.5px;
      color: var(--mut);
      margin-top: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .rcmid {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 13px;
    }
    .icn-mid {
      display: inline-flex;
      color: var(--mut);
    }
    .icn-mid .icn {
      width: 17px;
      height: 17px;
    }
    .lbltxt {
      font-size: 14px;
      font-weight: 600;
      color: var(--mut);
    }
    .brival {
      font-size: 15px;
      font-weight: 700;
      color: #fff;
    }
    .slider.sm {
      height: 38px;
      margin-top: 10px;
    }
    .slider-fill.dim {
      background: rgba(255, 255, 255, 0.5);
    }
    /* One segment per light: on = accent, off = dim. Filling them raises the %. */
    .lightsegs {
      display: flex;
      gap: 4px;
      margin-top: 10px;
      height: 38px;
    }
    .lightseg {
      flex: 1;
      min-width: 0;
      border: none;
      border-radius: 9px;
      background: rgba(255, 255, 255, 0.09);
      cursor: pointer;
      padding: 0 5px;
      display: flex;
      align-items: center;
      justify-content: center;
      font: inherit;
      font-size: 10.5px;
      font-weight: 700;
      letter-spacing: -0.01em;
      color: var(--mut);
      transition: background 0.15s, box-shadow 0.15s, color 0.15s;
      -webkit-tap-highlight-color: transparent;
    }
    .lightseg span {
      max-width: 100%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .lightseg:hover {
      background: rgba(255, 255, 255, 0.17);
      color: var(--tx);
    }
    .lightseg.on {
      background: var(--accent);
      color: #241a08;
      box-shadow: 0 2px 10px -3px rgba(243, 168, 60, 0.7);
    }
    .lightseg.on:hover {
      background: #f4b358;
      color: #241a08;
    }
    .rcfoot {
      display: flex;
      gap: 8px;
      margin-top: 12px;
    }
    .qstat {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 8px 10px;
      border-radius: 11px;
      background: rgba(255, 255, 255, 0.05);
      font-size: 13px;
      font-weight: 600;
      color: var(--mut);
      flex: 1;
      border: none;
      font-family: inherit;
    }
    .qstat .icn {
      width: 15px;
      height: 15px;
    }
    .qstat.lockq {
      cursor: pointer;
    }
    .qstat.lockq.locked {
      color: #37c58e;
      background: rgba(55, 197, 142, 0.12);
    }
    .qstat.lockq.unlocked {
      color: #f26a4b;
      background: rgba(242, 106, 75, 0.12);
    }
    .rcard.link {
      cursor: pointer;
    }
    .rcchev {
      display: inline-flex;
      vertical-align: -3px;
      margin-left: 4px;
      color: var(--fnt, #646a75);
    }
    .rcchev .icn {
      width: 15px;
      height: 15px;
    }

    /* ---- Light colour-temperature slider (Тёплый ↔ Холодный) ---- */
    .ctwrap {
      margin-top: 14px;
    }
    .ctlab {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      font-weight: 600;
      color: var(--mut);
      margin-bottom: 7px;
    }
    .cttrack {
      position: relative;
      height: 40px;
      border-radius: 13px;
      cursor: pointer;
      touch-action: none;
      user-select: none;
      background: linear-gradient(90deg, #f3a83c, #fff 52%, #cfe0ff);
    }
    .ctthumb {
      position: absolute;
      top: 50%;
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: #fff;
      transform: translate(-50%, -50%);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
      border: 2px solid rgba(0, 0, 0, 0.06);
    }

    /* ---- Overview detail slide-over (1B) ---- */
    .detail-back {
      position: absolute;
      inset: 0;
      z-index: 20;
      background: rgba(6, 7, 9, 0.55);
      backdrop-filter: blur(3px);
      animation: rp-fade 0.2s both;
    }
    .detail {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      width: min(720px, 82%);
      z-index: 21;
      background: radial-gradient(150% 120% at 80% 4%, #20222a, #141519 55%, #0f1013);
      border-left: 1px solid var(--brd);
      box-shadow: -30px 0 80px -20px rgba(0, 0, 0, 0.7);
      display: flex;
      flex-direction: column;
      animation: slide-in 0.28s cubic-bezier(0.22, 1, 0.36, 1) both;
    }
    @keyframes slide-in {
      from { transform: translateX(40px); opacity: 0; }
      to { transform: none; opacity: 1; }
    }
    .dhead {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 24px 26px 16px;
    }
    .dback {
      width: 46px;
      height: 46px;
      flex: none;
      border-radius: 14px;
      border: 1px solid var(--brd);
      background: var(--card);
      color: var(--tx);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
    .dback:hover {
      background: var(--card2);
    }
    .dtitle {
      font-size: 26px;
      font-weight: 700;
      color: #fff;
      letter-spacing: -0.01em;
    }
    .dsub {
      font-size: 13px;
      color: var(--mut);
      margin-top: 2px;
    }
    .dbody {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden; /* vertical scroll only — never a left-right wobble */
      padding: 6px 26px 24px;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      grid-auto-rows: min-content;
      gap: 14px;
      align-content: start;
    }
    .dbody > * {
      min-width: 0; /* shrink to the grid column instead of overflowing it */
    }
    .dbody::-webkit-scrollbar {
      width: 0;
    }
    .dbody > .lockbtn {
      grid-column: 1 / -1;
    }
    @media (max-width: 720px) {
      .detail {
        width: 100%;
      }
      .dbody {
        grid-template-columns: 1fr;
      }
    }

    /* Keep the editor/legacy overlays clear of the room panel in view mode. */
    ha-card.view .overlay.top-left {
      top: 108px;
      left: 30px;
    }
    ha-card.view .overlay.bottom {
      left: 26px;
      right: calc(var(--panel-w) + 24px);
      bottom: 74px;
      justify-content: flex-start;
    }

    /* Narrow cards: stack the panel below the 3D. */
    @media (max-width: 720px) {
      ha-card.view.room {
        --panel-w: 0px;
      }
      ha-card.view.room .viewport {
        right: 0;
        bottom: 46%;
      }
      ha-card.view.overview .ov-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      .room-panel {
        top: 54%;
        width: 100%;
        border-left: none;
        border-top: 1px solid var(--brd);
      }
      .topstat {
        right: 18px;
      }
      .pills {
        right: 18px;
      }
      ha-card.view .overlay.bottom {
        right: 18px;
      }
      .ctime {
        font-size: 48px;
      }
    }

    /* ---- Touch devices (wall tablets) ----------------------------------
       backdrop-filter re-blurs whatever sits behind it every time that
       backdrop repaints — and behind these panels is the 3D, which repaints
       on every drag. On a tablet that is the single biggest thing competing
       with the scene for the frame, and it buys a glass effect nobody studies
       while the plan is moving. Spending that budget on the 3D instead is the
       better trade: the panels stay translucent (just via opacity), and the
       scene keeps its full material quality rather than being auto-degraded
       to matte because the device looked slow. Desktop keeps the glass. */
    @media (pointer: coarse) {
      ha-card *,
      ha-card *::before,
      ha-card *::after {
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
      }
      /* Slightly more opaque to make up for the lost blur, so white text over a
         bright room photo stays as legible as it was. */
      ha-card.has-photo .room-panel {
        background: rgba(16, 17, 21, 0.72);
      }
    }
  `;
}

// Register in the Lovelace card picker.
(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: 'ha-3d-floorplan-card',
  name: '3D Floor Plan Card',
  description: 'Interactive true-3D floor plan with live entity bindings.',
  preview: false,
  documentationURL: 'https://github.com/your-org/ha-3d-floorplan-card',
});

// eslint-disable-next-line no-console
console.info(
  `%c 3D-FLOORPLAN-CARD %c v${CARD_VERSION} `,
  'color:#fff;background:#03a9f4;border-radius:4px 0 0 4px;padding:2px 6px',
  'color:#03a9f4;background:#222;border-radius:0 4px 4px 0;padding:2px 6px',
);

// Auto-add a sidebar entry (frontend-only, no YAML). Disable with
// `window.ha3dFloorplan = { sidebar: false }`. See src/sidebar.ts.
installSidebar();

declare global {
  interface HTMLElementTagNameMap {
    'ha-3d-floorplan-card': Ha3dFloorplanCard;
  }
}
