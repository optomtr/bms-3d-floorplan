// ---------------------------------------------------------------------------
// <bms-floorplan-card> — the custom Lovelace card entry point.
// ---------------------------------------------------------------------------

import { LitElement, html, PropertyValues, nothing, svg } from 'lit';
import { property, state, query } from 'lit/decorators.js';
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
import { DEMO_PLAN } from './scene/demo-plan';
import { EditorController, EditTool } from './editor/editor-controller';
import {
  loadProjects,
  loadProjectsResult,
  saveProjects,
  listProjects,
  newProjectId,
  blankPlan,
  hashPin,
  findLegacyProjects,
  mergeProjects,
  ProjectInfo,
  StoredProjects,
  LegacyFind,
  LegacySource,
} from './storage';
import { FURNITURE_KEYS, LIGHT_KEYS, entityDomainsFor, ventCount } from './furniture/library';
import { getThumbnail, releaseThumbnailRenderer } from './furniture/thumbnails';
import { WALL_MATERIALS, FLOOR_MATERIALS } from './scene/materials';
import { isZirconPlan, convertZircon } from './import/zircon';
import { DOOR_VARIANTS, WINDOW_VARIANTS } from './scene/builder';
import { ICON_PATHS, climateModeIconName } from './scene/icons';
import { FONT_FACE_CSS } from './scene/fonts';
import { baseStyles } from './card/styles/base';
import { editorPanelStyles } from './card/styles/editor-panel';
import { leakStyles } from './card/styles/leak';
import { controlsStyles } from './card/styles/controls';
import { statusStyles } from './card/styles/status';
import { roomViewStyles } from './card/styles/room-view';
import { roomPanelStyles } from './card/styles/room-panel';
import { deviceCardStyles } from './card/styles/device-cards';
import { viewToggleStyles } from './card/styles/view-toggle';
import { overviewStyles } from './card/styles/overview';
import { detailStyles } from './card/styles/detail';

/** Read a number a HUMAN typed. On RU/UZ keyboards the decimal separator is a
 *  comma, and `<input type="number">` does not accept one: the browser drops it
 *  and «3,5» arrives as «35» — a 35-metre-thick wall. So the size fields are
 *  plain text with a decimal keypad, and every one of them comes through here. */
function humanNum(raw: string): number {
  return parseFloat(String(raw ?? '').trim().replace(',', '.'));
}

/** Step for a climate ±: whole degrees, never finer. A Generic Thermostat
 *  reports target_temp_step 0.1 (Celsius default precision, not settable from
 *  its helper flow), which makes ± crawl 21.0 → 21.1 and land on values like
 *  21.9. Round the device's own step up to a whole degree; entities that already
 *  step by 1° (ACs, the Tuya floor thermostats) are unaffected. */
function climateStep(ent?: HassEntity): number {
  const s = Number(ent?.attributes?.target_temp_step);
  return Number.isFinite(s) && s >= 1 ? Math.round(s) : 1;
}

/** Input for the card's own modal (the company forbids window.alert/confirm/
 *  prompt — a system pop-up on a wall tablet is unreadable and unstyled). */
interface AskOptions {
  title: string;
  message?: string;
  okLabel?: string;
  cancelLabel?: string;
  /** Paint the confirm button as destructive. */
  danger?: boolean;
  /** Ask for a value instead of a yes/no. */
  input?: { placeholder?: string; value?: string; inputmode?: string };
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
  Floor: 'Пол',
  Window: 'Окно',
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

/** Tag names and routes are the contract with the integration
 *  (custom_components/bms_floorplan/const.py). Keep them in step with it. */
export const CARD_TAG = 'bms-floorplan-card';
export const CARD_EDITOR_TAG = 'bms-floorplan-card-editor';
const KIOSK_PATH = '/bms-floorplan-kiosk';

/** How long a detached card waits before freeing its 3D scene. Long enough to
 *  ride out Lovelace re-attaching a card during a re-layout, short enough that
 *  a closed panel gives its WebGL context back straight away. */
const DISPOSE_GRACE_MS = 4000;

/** Cards whose scene is waiting out the grace period above. The delay tells a
 *  Lovelace re-layout apart from a real removal, but it bounds the leak in TIME
 *  only — twenty quick opens leave twenty scenes waiting, and a browser keeps
 *  ~8-16 WebGL contexts before it starts killing live ones. So a card that is
 *  ATTACHED reclaims every pending scene immediately: nobody needs a spare
 *  context more than the visible panel needs to keep drawing. */
const pendingTeardown = new Set<{ reclaimScene(): void }>();

/** Most sensor history series kept at once (24h, ≤120 points each). Bounded so
 *  a panel that runs for weeks can't accumulate one series per sensor visited. */
const HIST_CACHE_MAX = 60;

/** Service domains this card is allowed to CALL.
 *
 *  Every control here is driven by an entity_id that came out of the stored
 *  plan, and the domain is taken from that id. Without a list, a plan carrying
 *  `script.open_the_gate` or `automation.disarm` turns a tap on a sofa into a
 *  call to it. These are the domains the card actually renders controls for;
 *  `script` and `automation` are deliberately NOT among them — those are
 *  "run anything" domains, and a floor plan has no business firing them.
 *  Entities outside the list still show their state, read-only. */
const CONTROL_DOMAINS: ReadonlySet<string> = new Set([
  'light',
  'switch',
  'input_boolean',
  'fan',
  'cover',
  'climate',
  'media_player',
  'lock',
  'valve',
  'button',
]);

export class BmsFloorplanCard extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;
  // Set by HA when this element is used as a `panel_custom` sidebar panel.
  @property({ attribute: false }) public panel?: { config?: Record<string, any> };
  @property({ attribute: false }) public narrow?: boolean;
  @state() private config?: CardConfig;
  @state() private activeProjectId?: string;
  @state() private loadError?: string;
  /** Set when the plan drew, but parts of it were unusable. A dropped wall must
   *  never disappear in silence — the installer has to know what to fix. */
  @state() private planWarning?: string;
  @state() private floorNames: string[] = [];
  @state() private activeFloorIndex = 0;
  @state() private editing = false;
  @state() private editTool: EditTool = 'wall';
  @state() private editSelectedModel = 'sofa';
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
  /** "Отчёт": a full-screen overlay of every room's temperature line graph. */
  @state() private showReport = false;
  /** Which metric the "Отчёт" grid graphs for every room (its category tab). */
  @state() private reportMetric: 'temp' | 'floor' | 'humidity' = 'temp';
  /** Which metric the room-panel graph shows: 'auto' = air + floor together,
   *  else just the one whose chip was tapped. */
  @state() private sparkMetric: 'auto' | 'temp' | 'floor' | 'humidity' = 'auto';
  /** Transient value (0..100) shown while dragging a slider, before HA confirms. */
  @state() private dragEntity: string | null = null;
  private dragValue = 0;
  @state() private editEntitySearch = '';
  /** Search box for the room's device picker (it lists every HA entity). */
  @state() private editZoneSearch = '';
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
  // Our own confirm/prompt layer — system alert/confirm/prompt are forbidden.
  @state() private askOpen = false;
  private askData: AskOptions = { title: '' };
  private askResolve?: (value: string | null) => void;
  // "Import from the previous version" (read-only scan of the old integration).
  @state() private legacyOpen = false;
  @state() private legacyBusy = false;
  @state() private legacyFinds: LegacyFind[] = [];
  @state() private legacyErrors: { source: LegacySource; error: string }[] = [];
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
  /** Pending speaker volume (0..1) shown at once so ± feels instant instead of
   *  waiting a round-trip, and so repeated taps step from the pending value.
   *  Cleared when HA reports our value or any other. */
  private optVol = new Map<string, { vol: number; base?: number; timer: ReturnType<typeof setTimeout> }>();
  /** Recent history for a room's bound degree sensors, for the compact sparkline
   *  in the room panel. Keyed by entity_id → sampled [timeMs, value] points +
   *  fetch time. Fetched on demand from HA's history API, refreshed every ~5min. */
  private histCache = new Map<string, { pts: [number, number][]; ts: number }>();
  private histInFlight = new Set<string>();
  /** Pending scene teardown after the card leaves the DOM (see disconnectedCallback). */
  private disposeTimer?: number;
  /** Memoised whole-home rollup (humidity / temperature / lights on). Rebuilt
   *  when hass or an optimistic override changes — not per call, and not three
   *  times per render. See homeStats(). */
  private homeStatsCache?: { hass: HomeAssistant; opt: number; hum: string; temp: number | null; on: number };
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
      type: `custom:${CARD_TAG}`,
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
    return document.createElement(CARD_EDITOR_TAG);
  }

  // -- hass updates -----------------------------------------------------------

  protected override willUpdate(changed: PropertyValues): void {
    // Used as a sidebar panel (panel_custom): take config from panel.config and
    // fill the viewport. This path is reliable across refresh/tabs/devices.
    if (changed.has('panel') && this.panel && !this.config) {
      const cfg = (this.panel.config ?? {}) as CardConfig;
      this.setConfig({ height: '100vh', ...cfg, type: `custom:${CARD_TAG}` });
    }
    if (changed.has('hass') && this.hass) {
      this.pendingHass = this.hass;
    }
  }

  protected override updated(_changed: PropertyValues): void {
    // `isConnected` matters: Lit keeps updating a DETACHED element, and the
    // teardown below touches reactive state (rooms) — without this guard the
    // teardown's own re-render immediately built a fresh scene, with a fresh
    // WebGL context, for a card that had already left the page.
    if (!this.sceneManager && this.viewport && this.isConnected) {
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
    if (this.askOpen && _changed.has('askOpen')) {
      const input = this.renderRoot?.querySelector('.ask-input') as HTMLInputElement | null;
      input?.focus();
      input?.select();
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
          this.optGen++; // the effective state moved — see homeStats()'s memo key
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
    // Same idea for a pending volume: clear once HA reports our value (confirmed)
    // or a different one (changed elsewhere). Speakers report within ~1s, so
    // this hands control back quickly without the number snapping mid-tap.
    if (this.optVol.size) {
      for (const [id, ov] of [...this.optVol]) {
        const v = hass.states[id]?.attributes?.volume_level;
        if (typeof v !== 'number') continue;
        if (Math.abs(v - ov.vol) < 0.005 || v !== ov.base) {
          clearTimeout(ov.timer);
          this.optVol.delete(id);
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

  /** Push the effective state to the 3D scene, updating only what changed.
   *
   *  Walks ONLY the entities the scene actually reacts to (bindings + room
   *  membership). It used to walk `eff.states` — every entity in the home — on
   *  every single update: with 2000 entities and a handful of them ticking each
   *  second, that is millions of comparisons an hour for a few hundred that can
   *  possibly matter. */
  private pushEffective(base: HomeAssistant): void {
    if (!this.sceneManager) return;
    const eff = this.effectiveHass(base);
    if (!this.lastPushed) {
      this.sceneManager.syncAll(eff);
    } else {
      const prev = this.lastPushed;
      for (const id of this.sceneManager.trackedEntities()) {
        if (eff.states[id] !== prev.states[id]) this.sceneManager.updateEntity(id, eff);
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
    this.optGen++; // the effective state moved — see homeStats()'s memo key
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
    this.planWarning = undefined;
    this.planLoaded = false;
    try {
      const plan = await this.resolvePlan();
      this.currentPlan = plan;
      this.sceneManager.loadPlan(plan);
      this.sceneManager.optimizeForView(); // merge static geometry (view mode)
      const broken = this.sceneManager.brokenParts();
      if (broken.length) {
        const list = broken.slice(0, 3).join(', ');
        const more = broken.length > 3 ? ` и ещё ${broken.length - 3}` : '';
        this.planWarning = this.tx(
          `Часть плана не удалось построить (${list}${more}) — проверьте размеры этих элементов. Остальное показано.`,
          `Some plan elements could not be built (${list}${more}) — check their sizes. The rest is shown.`,
        );
      }
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
    this.sparkMetric = 'auto'; // fresh graph view when a different room opens
    this.sceneManager?.selectRoom(this.activeRoomKey);
    this.requestUpdate();
  }
  /** Tap a temperature/humidity chip to graph just that metric; tap it again
   *  (or another) to switch. */
  private toggleSparkMetric(m: 'temp' | 'floor' | 'humidity'): void {
    this.sparkMetric = this.sparkMetric === m ? 'auto' : m;
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
    // The plan is DATA: it names the entities, and the domain above comes
    // straight out of it. Anything outside CONTROL_DOMAINS is shown read-only
    // rather than called, so a tampered (or careless) plan cannot turn a tap on
    // a sofa into `script.…` / `automation.…`.
    if (!CONTROL_DOMAINS.has(domain) || (entityId && !this.canControl(entityId))) {
      this.showToast(
        this.tx(`Только просмотр: ${entityId ?? domain}`, `Read-only: ${entityId ?? domain}`),
      );
      return;
    }
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

  /** True when this entity belongs to a domain the card may actually control.
   *  Everything else is rendered as information only. */
  private canControl(id: string): boolean {
    return CONTROL_DOMAINS.has(id.split('.')[0]);
  }

  /** Lock/unlock, asking first before UNLOCKING. In view mode a lock card is one
   *  tap away on a wall tablet in the hallway, so "open the front door" must not
   *  be something a guest does by brushing the screen. Locking is safe and needs
   *  no confirmation. */
  private async lockAction(id: string, service: 'lock' | 'unlock'): Promise<void> {
    if (!this.canControl(id)) {
      this.showToast(this.tx(`Только просмотр: ${id}`, `Read-only: ${id}`));
      return;
    }
    if (service === 'unlock') {
      const ok = await this.askConfirm(
        this.tx('Открыть замок?', 'Unlock?'),
        this.tx(
          `«${this.cardName(id)}» будет открыт для всех, кто рядом.`,
          `"${this.cardName(id)}" will be unlocked for anyone nearby.`,
        ),
        this.tx('Открыть', 'Unlock'),
      );
      if (!ok) return;
    }
    this.svc('lock', service, {}, id, service === 'lock' ? 'locked' : 'unlocked');
  }

  /** The intercom's "Открыть дверь" button — same reasoning as an unlock. */
  private async intercomOpenDoor(id: string): Promise<void> {
    if (!this.canControl(id)) {
      this.showToast(this.tx(`Только просмотр: ${id}`, `Read-only: ${id}`));
      return;
    }
    const ok = await this.askConfirm(
      this.tx('Открыть дверь?', 'Open the door?'),
      this.tx(
        'Дверь откроется сразу. У планшета может стоять кто угодно.',
        'The door opens immediately — anyone could be standing at the tablet.',
      ),
      this.tx('Открыть', 'Open'),
    );
    if (ok) this.svc('button', 'press', {}, id);
  }

  /** Effective (optimistic-aware) state of an entity, for rendering controls. */
  private effState(id: string): string {
    return this.optimistic.get(id)?.state ?? this.hass?.states[id]?.state ?? 'unknown';
  }

  /** Toggle every device in a category at once: if any is on → all off, else all
   *  on (optimistic + revert-on-fail, like the individual controls). */
  private onToggleAll(ents0: { entity_id: string; behavior: string }[]): void {
    // `homeassistant.turn_on` takes an arbitrary entity list and would happily
    // start a script or an automation, so the list is filtered down to the
    // domains this card controls before it is sent (see CONTROL_DOMAINS).
    const ents = ents0.filter((e) => this.canControl(e.entity_id));
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
    window.location.href = KIOSK_PATH;
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

  /** True when the UI should be Russian.
   *
   *  This is a BMS product: Russian is the DEFAULT, not something that switches
   *  itself off because Home Assistant happens to be set to English. Set
   *  `language: en` in the card config for English, or `language: auto` for the
   *  old behaviour (follow the HA user, then the browser). */
  private get isRu(): boolean {
    const pref = this.config?.language;
    if (pref === 'ru') return true;
    if (pref === 'en') return false;
    if (pref === 'auto') {
      const l = (
        this.hass?.language ||
        (typeof navigator !== 'undefined' ? navigator.language : '') ||
        ''
      ).toLowerCase();
      return l.startsWith('ru');
    }
    return true;
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
    const loaded = await loadProjectsResult(this.hass);
    if (!loaded.ok) {
      this.showToast(
        this.tx('Не удалось прочитать хранилище — PIN не сохранён', 'Could not read the store — PIN not saved'),
      );
      return;
    }
    this.storedProjects = loaded.data;
    this.storedProjects.editPin = hashPin(v);
    this.editPinInput = '';
    this.editUnlocked = true; // we're already editing
    await saveProjects(this.storedProjects, this.hass);
    this.showToast('Edit PIN set');
    this.requestUpdate();
  }

  private async onRemoveEditPin(): Promise<void> {
    const loaded = await loadProjectsResult(this.hass);
    if (!loaded.ok) {
      this.showToast(
        this.tx('Не удалось прочитать хранилище — PIN не изменён', 'Could not read the store — PIN unchanged'),
      );
      return;
    }
    this.storedProjects = loaded.data;
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
      void this.calibrateUnderlay(measured);
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

  /** Ask for the real-world length between the two calibration points. Uses the
   *  card's own dialog — a kiosk browser can suppress window.prompt entirely,
   *  and an unstyled system box on a wall tablet is unusable anyway. */
  private async calibrateUnderlay(measured: number): Promise<void> {
    const answer = await this.ask({
      title: this.tx('Калибровка подложки', 'Calibrate the reference image'),
      message: this.tx(
        `На экране между точками ${measured.toFixed(2)} м. Введите РЕАЛЬНОЕ расстояние в метрах:`,
        `Measured ${measured.toFixed(2)} m on screen between those points. Enter their REAL length in meters:`,
      ),
      okLabel: this.tx('Применить', 'Apply'),
      input: { placeholder: this.tx('например 8,1', 'e.g. 8.1'), inputmode: 'decimal' },
    });
    // Accept a comma decimal: on a RU/UZ keyboard "8,1" is the natural way to
    // type 8.1, and parseFloat reads it as 8 — silently mis-scaling the plan by
    // whatever the fraction was, with nothing on screen to show it happened.
    const real = parseFloat(String(answer ?? '').trim().replace(',', '.'));
    if (real > 0) this.editor?.applyUnderlayScale(measured, real);
    else this.showToast(this.tx('Калибровка отменена', 'Calibration cancelled'));
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
    const v = humanNum((e.target as HTMLInputElement).value);
    if (!Number.isNaN(v)) this.editor?.setCameraDistance(v);
  }

  private onSetBrightness(e: Event): void {
    const v = humanNum((e.target as HTMLInputElement).value);
    if (!Number.isNaN(v)) this.editor?.setBrightness(v);
  }

  private onSetSpread(e: Event): void {
    const v = humanNum((e.target as HTMLInputElement).value);
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
  private onSetZoneParent(id: string, e: Event): void {
    const v = (e.target as HTMLSelectElement).value;
    this.editor?.setZoneParent(id, v || null);
    if (this.editor) this.editZones = [...this.editor.zones];
  }
  private onSetZoneSensor(id: string, kind: 'temp' | 'floor' | 'humidity', e: Event): void {
    this.editor?.setZoneSensor(id, kind, (e.target as HTMLSelectElement).value);
    if (this.editor) this.editZones = [...this.editor.zones];
  }
  /** Entities that make sense to bind as a room's temperature (also floor) or
   *  humidity readout — temp/humidity sensors by device_class or unit, plus
   *  climate units for temperature. Sorted by friendly name, for the editor
   *  dropdowns. `keep` guarantees an already-bound id stays selectable even if
   *  it's momentarily missing from hass. */
  private sensorCandidates(kind: 'temp' | 'humidity', keep?: string): { id: string; label: string }[] {
    const out: { id: string; label: string }[] = [];
    for (const [id, st] of Object.entries(this.hass?.states ?? {})) {
      const a = (st as HassEntity).attributes;
      const dc = a?.device_class;
      const u = a?.unit_of_measurement;
      const ok =
        kind === 'temp'
          ? (id.startsWith('sensor.') && (dc === 'temperature' || u === '°C' || u === '°F')) || id.startsWith('climate.')
          : id.startsWith('sensor.') && (dc === 'humidity' || u === '%');
      if (ok) out.push({ id, label: (a?.friendly_name as string) || id });
    }
    if (keep && !out.some((o) => o.id === keep)) out.push({ id: keep, label: keep });
    out.sort((x, y) => x.label.localeCompare(y.label));
    return out;
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
    const v = humanNum((e.target as HTMLInputElement).value);
    if (!Number.isNaN(v) && v > 0) this.editor?.setOpeningWidth(v);
  }

  private onToggleSnap(): void {
    if (!this.editor) return;
    this.editSnap = !this.editSnap;
    this.editor.setSnap(this.editSnap);
  }

  private async onNewPlan(): Promise<void> {
    if (!this.editor) return;
    // "New" creates a separate project — your other SAVED projects are untouched.
    const ok = await this.askConfirm(
      this.tx('Создать НОВЫЙ проект?', 'Create a NEW project?'),
      this.tx(
        'Другие сохранённые проекты останутся. Несохранённые правки текущего будут потеряны. Нарисуйте и нажмите «Сохранить».',
        'Your other saved projects stay. Unsaved changes in the current one will be lost. Draw, then Save to keep the new project.',
      ),
      this.tx('Создать', 'Create'),
      false,
    );
    if (!ok) return;
    if (!this.editor) return;
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

  private async onSelectStorageProject(e: Event): Promise<void> {
    const select = e.target as HTMLSelectElement;
    const id = select.value;
    if (!id || id === this.currentProjectId) return;
    const plan = this.storedProjects.projects[id];
    if (!plan) return;
    if (this.editing) {
      const ok = await this.askConfirm(
        this.tx('Переключить проект?', 'Switch project?'),
        this.tx(
          'Несохранённые правки текущего проекта будут потеряны.',
          'Unsaved changes in the current one will be lost.',
        ),
        this.tx('Переключить', 'Switch'),
      );
      if (!ok) {
        // Put the dropdown back where it was: the answer arrives a tick later,
        // so Lit has already settled on the value the user picked.
        select.value = this.editingProjectId ?? '';
        this.requestUpdate();
        return;
      }
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
    // A failed read must not be mistaken for "there is nothing there".
    const loaded = await loadProjectsResult(this.hass);
    if (!loaded.ok) {
      this.showToast(
        this.tx(
          `Не удалось прочитать хранилище (${loaded.error ?? ''}) — удаление отменено`,
          `Could not read the store (${loaded.error ?? ''}) — delete cancelled`,
        ),
      );
      return;
    }
    this.storedProjects = loaded.data;
    if (!id || !this.storedProjects.projects[id]) {
      this.showToast('This project is not saved yet');
      return;
    }
    const name = this.storedProjects.projects[id].name || id;
    const ok = await this.askConfirm(
      this.tx('Удалить проект?', 'Delete project?'),
      this.tx(`«${name}» будет удалён безвозвратно.`, `"${name}" will be deleted. This cannot be undone.`),
      this.tx('Удалить', 'Delete'),
    );
    if (!ok) return;
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
    const v = humanNum((e.target as HTMLInputElement).value);
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
    const v = humanNum((e.target as HTMLInputElement).value);
    if (!Number.isNaN(v) && v > 0) this.editor?.setWallLength(v);
  }

  private onSetWallThickness(e: Event): void {
    const v = humanNum((e.target as HTMLInputElement).value);
    if (!Number.isNaN(v) && v > 0) this.editor?.setWallThickness(v);
  }

  private onSetWallAngle(e: Event): void {
    const v = humanNum((e.target as HTMLInputElement).value);
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
    const v = humanNum((e.target as HTMLInputElement).value);
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

  private async onDeleteFloor(): Promise<void> {
    const ok = await this.askConfirm(
      this.tx('Удалить этаж?', 'Delete this floor?'),
      this.tx('Этаж и всё, что на нём, будут удалены.', 'The floor and everything on it will be removed.'),
      this.tx('Удалить', 'Delete'),
    );
    if (ok) this.editor?.deleteFloor();
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

  /** Bind an entity to a specific opening (`part`) of a model (part 0 = whole). */
  private onPickEntityPart(e: Event, part: number): void {
    const entityId = (e.target as HTMLSelectElement).value || null;
    this.editor?.bindEntity(entityId, part);
    this.requestUpdate();
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
    // clobber projects saved meanwhile on another device/tab. A FAILED read
    // looks exactly like an empty store, so saving on top of one would delete
    // every other project on every device — refuse instead.
    const loaded = await loadProjectsResult(this.hass);
    if (!loaded.ok) {
      this.showToast(
        this.tx(
          `Не сохранено: не удалось прочитать хранилище (${loaded.error ?? ''}). Повторите позже.`,
          `Not saved: the store could not be read (${loaded.error ?? ''}). Try again.`,
        ),
      );
      return;
    }
    this.storedProjects = loaded.data;
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
    // Say what actually happened. The shared (install-wide) write is the only
    // one that reaches other devices, and it is admin-only in the integration —
    // so "saved to all devices" must not be printed after it was refused.
    let msg: string;
    if (res.shared) {
      msg = this.tx(`«${plan.name}» сохранён на все устройства`, `Saved "${plan.name}" to all devices`);
    } else if (res.user) {
      msg = this.tx(
        `«${plan.name}» сохранён только в этой учётной записи — общий план не записан (${res.sharedError ?? 'нет прав или интеграция недоступна'})`,
        `Saved "${plan.name}" to this account only — the shared plan was not written (${res.sharedError ?? 'no permission, or the integration is unavailable'})`,
      );
    } else if (res.local) {
      msg = this.tx(
        `«${plan.name}» сохранён только в этом браузере (Home Assistant недоступен)`,
        `Saved "${plan.name}" in this browser only (Home Assistant unavailable)`,
      );
    } else {
      msg = this.tx(
        `НЕ сохранено: ${res.sharedError ?? res.userError ?? 'хранилище недоступно'}`,
        `NOT saved: ${res.sharedError ?? res.userError ?? 'the store is unavailable'}`,
      );
    }
    this.showToast(msg);
  }

  private showToast(msg: string): void {
    this.toast = msg;
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(() => {
      this.toast = undefined;
      this.requestUpdate();
    }, 3200);
  }

  // -- Own modal layer (window.alert/confirm/prompt are forbidden) -----------

  /** Open the card's own dialog. Resolves with the entered text (or `'ok'` for a
   *  plain confirm), or `null` when the user cancels. */
  private ask(opts: AskOptions): Promise<string | null> {
    this.askResolve?.(null); // a newer question supersedes an open one
    this.askData = opts;
    this.askOpen = true;
    return new Promise<string | null>((resolve) => {
      this.askResolve = resolve;
    });
  }

  /** Yes/no. Replaces window.confirm — same call shape, own styling, and it
   *  works inside a kiosk browser that suppresses system dialogs. */
  private async askConfirm(
    title: string,
    message?: string,
    okLabel?: string,
    danger = true,
  ): Promise<boolean> {
    return (await this.ask({ title, message, okLabel, danger })) !== null;
  }

  private closeAsk(value: string | null): void {
    this.askOpen = false;
    const resolve = this.askResolve;
    this.askResolve = undefined;
    resolve?.(value);
  }

  private cancelAsk = (): void => this.closeAsk(null);

  private submitAsk = (e?: Event): void => {
    e?.preventDefault();
    if (!this.askData.input) {
      this.closeAsk('ok');
      return;
    }
    const input = this.renderRoot?.querySelector('.ask-input') as HTMLInputElement | null;
    this.closeAsk(input?.value ?? '');
  };

  /** Bilingual one-liner for text added after RU_STRINGS was written. */
  private tx(ru: string, en: string): string {
    return this.isRu ? ru : en;
  }

  // -- Import from the PREVIOUS version (read-only) --------------------------

  private legacySourceLabel(src: LegacySource): string {
    if (src === 'shared') return this.tx('Старая интеграция (общий план)', 'Old integration (shared plan)');
    if (src === 'user') return this.tx('Старая версия, эта учётная запись', 'Old version, this account');
    return this.tx('Старая версия, этот браузер', 'Old version, this browser');
  }

  /** Look for plans made with the previous integration. Reads only — the old
   *  store is never written to, so the old card keeps working afterwards. */
  private async onScanLegacy(): Promise<void> {
    this.legacyBusy = true;
    this.legacyFinds = [];
    this.legacyErrors = [];
    this.legacyOpen = true;
    try {
      const scan = await findLegacyProjects(this.hass);
      this.legacyFinds = scan.finds;
      this.legacyErrors = scan.errors;
    } catch (err: any) {
      this.legacyFinds = [];
      this.legacyErrors = [{ source: 'shared', error: String(err?.message ?? err) }];
    } finally {
      this.legacyBusy = false;
    }
  }

  /** Copy everything found into OUR store. Existing projects are never
   *  overwritten: a clashing name gets a mark appended instead. */
  private async onImportLegacy(): Promise<void> {
    if (!this.legacyFinds.length) return;
    this.legacyBusy = true;
    try {
      const current = await loadProjectsResult(this.hass);
      if (!current.ok) {
        this.showToast(
          this.tx(
            `Не удалось прочитать наше хранилище — перенос отменён (${current.error ?? ''})`,
            `Could not read our own store — import cancelled (${current.error ?? ''})`,
          ),
        );
        return;
      }
      const mark = this.tx('(из старой версии)', '(from the old version)');
      let data = current.data;
      let added = 0;
      let renamed = 0;
      for (const find of this.legacyFinds) {
        const res = mergeProjects(data, find.data, mark);
        data = res.data;
        added += res.added;
        renamed += res.renamed;
      }
      if (!added) {
        this.showToast(this.tx('Переносить нечего', 'Nothing to import'));
        return;
      }
      const save = await saveProjects(data, this.hass);
      if (!save.ha && !save.local) {
        this.showToast(
          this.tx(
            `Перенос не сохранён: ${save.sharedError ?? save.userError ?? ''}`,
            `Import not saved: ${save.sharedError ?? save.userError ?? ''}`,
          ),
        );
        return;
      }
      this.storedProjects = data;
      this.projectList = listProjects(data);
      this.legacyOpen = false;
      this.showToast(
        this.tx(
          `Перенесено проектов: ${added}${renamed ? `, переименовано: ${renamed}` : ''}. Старая версия не тронута.`,
          `Imported ${added} project(s)${renamed ? `, ${renamed} renamed` : ''}. The old version is untouched.`,
        ),
      );
    } finally {
      this.legacyBusy = false;
    }
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
    BmsFloorplanCard.injectFonts();
    // A pending teardown means the card was only being MOVED in the DOM
    // (Lovelace re-layouts do that): keep the scene we already have.
    if (this.disposeTimer) {
      clearTimeout(this.disposeTimer);
      this.disposeTimer = undefined;
      pendingTeardown.delete(this);
    }
    // Someone is on screen again — no scene may sit around waiting any more.
    for (const card of [...pendingTeardown]) {
      if (card !== (this as unknown as { reclaimScene(): void })) card.reclaimScene();
    }
    if (this.sceneManager) this.sceneManager.start();
    else if (this.viewport) this.requestUpdate(); // torn down earlier — rebuild in updated()
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
    // Free the 3D scene — but not instantly. Lovelace detaches and re-attaches
    // a card when it re-lays-out a view, and that happens SYNCHRONOUSLY, so a
    // short delay tells a real removal apart from a move. Without the teardown
    // the card left a whole WebGL context behind on every close; a browser
    // keeps ~8-16 (8 in some Android WebViews) and then starts killing the
    // oldest — including the one drawing the panel on the wall.
    if (this.disposeTimer) clearTimeout(this.disposeTimer);
    pendingTeardown.add(this);
    this.disposeTimer = window.setTimeout(() => {
      this.disposeTimer = undefined;
      pendingTeardown.delete(this);
      if (!this.isConnected) this.teardownScene();
    }, DISPOSE_GRACE_MS);
  }

  /** Drop the 3D scene and everything it holds. The card stays usable: if it is
   *  attached again, updated() builds a fresh scene and reloads the plan. */
  /** Give the scene back NOW, without waiting out the grace period. Called on
   *  another card's mount, so pending scenes can never pile up. */
  public reclaimScene(): void {
    if (this.disposeTimer) {
      clearTimeout(this.disposeTimer);
      this.disposeTimer = undefined;
    }
    pendingTeardown.delete(this);
    if (!this.isConnected) this.teardownScene();
  }

  private teardownScene(): void {
    pendingTeardown.delete(this);
    if (!this.sceneManager || this.editing) return; // never mid-edit
    try {
      this.sceneManager.dispose();
    } catch (err) {
      console.warn('[3d-floorplan] scene teardown:', err);
    }
    this.sceneManager = undefined;
    this.planLoaded = false;
    this.lastPushed = undefined;
    this.lastHass = undefined;
    this.rooms = [];
    this.histCache.clear();
    this.homeStatsCache = undefined;
    releaseThumbnailRenderer();
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
                <input class="num-input" type="text" inputmode="decimal" min="0.5" step="0.1"
                  .value=${String(this.editUnderlay.widthM)}
                  @change=${(e: Event) => this.onSetUnderlayField('widthM', e)} />
                <label class="hint">Opacity:</label>
                <input type="range" min="0.05" max="1" step="0.05"
                  .value=${String(this.editUnderlay.opacity ?? 0.6)}
                  @input=${(e: Event) => this.onSetUnderlayField('opacity', e)} />
                <label class="hint">Rotate°:</label>
                <input class="num-input" type="text" inputmode="decimal" step="1"
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
          const tOpts = this.sensorCandidates('temp', z.tempSensor);
          const fOpts = this.sensorCandidates('temp', z.floorSensor);
          const hOpts = this.sensorCandidates('humidity', z.humiditySensor);
          return html`<div class="toolrow">
              <input class="name-input" type="text" placeholder="Room name"
                .value=${z.name ?? ''} @input=${(e: Event) => this.onSetZoneName(z.id, e)} />
            </div>
            <div class="toolrow">
              <label class="hint">Внутри комнаты (подкомната):</label>
              <select class="select" @change=${(e: Event) => this.onSetZoneParent(z.id, e)}>
                <option value="" ?selected=${!z.parentId}>— (отдельная комната)</option>
                ${this.editZones
                  .filter((o) => o.id !== z.id && !o.parentId)
                  .map((o) => html`<option value=${o.id} ?selected=${z.parentId === o.id}>${o.name || 'Room'}</option>`)}
              </select>
            </div>
            <div class="panel-group">Датчики комнаты (нет = пусто, без догадок)</div>
            <div class="toolrow">
              <label class="hint">Температура:</label>
              <select class="select" @change=${(e: Event) => this.onSetZoneSensor(z.id, 'temp', e)}>
                <option value="" ?selected=${!z.tempSensor}>— (нет)</option>
                ${tOpts.map((o) => html`<option value=${o.id} ?selected=${z.tempSensor === o.id}>${o.label}</option>`)}
              </select>
            </div>
            <div class="toolrow">
              <label class="hint">Температура пола:</label>
              <select class="select" @change=${(e: Event) => this.onSetZoneSensor(z.id, 'floor', e)}>
                <option value="" ?selected=${!z.floorSensor}>— (нет)</option>
                ${fOpts.map((o) => html`<option value=${o.id} ?selected=${z.floorSensor === o.id}>${o.label}</option>`)}
              </select>
            </div>
            <div class="toolrow">
              <label class="hint">Влажность:</label>
              <select class="select" @change=${(e: Event) => this.onSetZoneSensor(z.id, 'humidity', e)}>
                <option value="" ?selected=${!z.humiditySensor}>— (нет)</option>
                ${hOpts.map((o) => html`<option value=${o.id} ?selected=${z.humiditySensor === o.id}>${o.label}</option>`)}
              </select>
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
              // A room is an EXPLICIT device list, so offer every entity Home
              // Assistant knows — not only the ones bound to a 3D model. The
              // scene already gives an unbound entity its domain as behaviour,
              // so it lands in the right panel category with full controls and
              // nothing has to be drawn for it.
              const q = this.editZoneSearch.trim().toLowerCase();
              const pool = this.candidateEntities([]).ids.filter((id) => !z.entities.includes(id));
              const hits = q ? pool.filter((id) => this.entityOptionText(id).toLowerCase().includes(q)) : pool;
              const LIMIT = 60; // a whole house is thousands of entities — keep the DOM sane
              const shown = hits.slice(0, LIMIT);
              return html`<div class="panel-group">Добавить устройство в комнату</div>
                <div class="toolrow">
                  <input class="select wide" type="search"
                    placeholder="🔍 имя, комната или entity_id…"
                    .value=${this.editZoneSearch}
                    @input=${(e: Event) => (this.editZoneSearch = (e.target as HTMLInputElement).value)} />
                </div>
                ${shown.length
                  ? html`<div class="zone-devs">
                        ${shown.map((id) => {
                          const taken = this.boundElsewhere(id, z.id);
                          return html`<label class="zone-dev ${taken ? 'taken' : ''}"
                            title=${this.entityOptionText(id)}>
                            <input type="checkbox" @change=${() => this.onToggleZoneDevice(z.id, id)} />
                            <span>${this.entityShort(id)}${taken ? html`<em class="taken-tag"> · ${taken}</em>` : nothing}</span>
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
                        <input class="num-input" type="text" inputmode="decimal" min="1" max="12" step="1"
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
                    <input class="num-input" type="text" inputmode="decimal" min="0.3" step="0.1"
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
                  <input class="num-input" type="text" inputmode="decimal" min="0.1" step="0.1" title="Width"
                    .value=${this.editFurnScale[0].toFixed(1)}
                    @change=${(e: Event) => this.onSetFurnScale(0, e)} />
                  <input class="num-input" type="text" inputmode="decimal" min="0.1" step="0.1" title="Height"
                    .value=${this.editFurnScale[1].toFixed(1)}
                    @change=${(e: Event) => this.onSetFurnScale(1, e)} />
                  <input class="num-input" type="text" inputmode="decimal" min="0.1" step="0.1" title="Depth"
                    .value=${this.editFurnScale[2].toFixed(1)}
                    @change=${(e: Event) => this.onSetFurnScale(2, e)} />
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
                    .value=${this.editSelectedWallLength != null ? this.editSelectedWallLength.toFixed(2) : ''}
                    @change=${this.onSetWallLength}
                  />
                  <span class="hint">or drag the wall's end point</span>
                </div>
                <div class="toolrow">
                  <span class="hint">Thickness (m):</span>
                  <input class="num-input" type="text" inputmode="decimal" min="0.05" step="0.01" title="Wall thickness in meters (e.g. 0.25, 0.38, 0.78)"
                    .value=${this.editSelectedWallThickness != null ? this.editSelectedWallThickness.toFixed(2) : ''}
                    @change=${this.onSetWallThickness} />
                  <span class="hint">Angle (°):</span>
                  <input class="num-input" type="text" inputmode="decimal" step="1" title="Absolute heading in degrees (45 = diagonal), pivots on the start point"
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
                    <input class="num-input" type="text" inputmode="decimal" min="0.5" step="0.1"
                      .value=${(this.editRoom.width ?? 0).toFixed(1)}
                      @change=${(e: Event) => this.onSetRoomField('width', e)} />
                    <span class="hint">D</span>
                    <input class="num-input" type="text" inputmode="decimal" min="0.5" step="0.1"
                      .value=${(this.editRoom.depth ?? 0).toFixed(1)}
                      @change=${(e: Event) => this.onSetRoomField('depth', e)} />
                  </div>
                  <div class="toolrow">
                    <span class="hint">Height</span>
                    <input class="num-input" type="text" inputmode="decimal" min="1" step="0.1"
                      .value=${(this.editRoom.height ?? 2.6).toFixed(1)}
                      @change=${(e: Event) => this.onSetRoomField('height', e)} />
                    <span class="hint">Rot°</span>
                    <input class="num-input" type="text" inputmode="decimal" step="15"
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
                  const model = this.editSelectedObjModel ?? '';
                  const domains = this.editShowAllEntities || !model ? [] : entityDomainsFor(model);
                  const { ids, fellBack } = this.candidateEntities(domains);
                  const q = this.editEntitySearch.trim().toLowerCase();
                  const fids = q
                    ? ids.filter((id) => this.entityOptionText(id).toLowerCase().includes(q))
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
                    const bound = this.editor?.selectedEntityPart(part) ?? null;
                    return html`
                      ${label ? html`<div class="panel-group">${label}</div>` : nothing}
                      <div class="toolrow">
                        <select class="select wide" size=${vc >= 2 ? 4 : 6}
                          @change=${(e: Event) => this.onPickEntityPart(e, part)}>
                          <option value="" ?selected=${!bound}>— bind entity —</option>
                          ${fids.map(
                            (id) => html`<option value=${id} ?selected=${id === bound} title=${id}>
                              ${this.entityOptionText(id)}
                            </option>`,
                          )}
                        </select>
                        ${part === 0
                          ? html`<button class="btn ${this.editShowAllEntities ? 'active' : ''}"
                              title="Show all entities (ignore type filter)"
                              @click=${() => (this.editShowAllEntities = !this.editShowAllEntities)}>All</button>`
                          : nothing}
                      </div>
                      <span class="hint">${hint(bound)}</span>`;
                  };
                  return html`<div class="toolrow">
                      <input class="select wide" type="search" placeholder="🔍 search entity / room…"
                        .value=${this.editEntitySearch}
                        @input=${(e: Event) => (this.editEntitySearch = (e.target as HTMLInputElement).value)} />
                    </div>
                    ${vc >= 2
                      ? Array.from({ length: vc }, (_, i) => picker(i, `${this.t('Window')} ${i + 1}`))
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
          <div class="toolrow">
            <button class="btn" ?disabled=${this.legacyBusy}
              title=${this.tx(
                'Найти планы старой версии и скопировать их сюда. Старое хранилище не изменяется.',
                'Find plans from the previous version and copy them here. The old store is left untouched.',
              )}
              @click=${this.onScanLegacy}>
              ⬇ ${this.tx('Перенести из старой версии', 'Import from the old version')}
            </button>
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

  /** The card's own confirm/prompt box. Same modal layer as Import and the PIN
   *  gate — the company forbids window.alert/confirm/prompt. */
  private renderAsk() {
    const a = this.askData;
    return html`<div class="import-modal" @click=${this.cancelAsk}>
      <form class="pin-box ask-form" @click=${(e: Event) => e.stopPropagation()} @submit=${this.submitAsk}>
        <div class="import-title">${a.title}</div>
        ${a.message ? html`<div class="ask-msg">${a.message}</div>` : nothing}
        ${a.input
          ? html`<input class="ask-input name-input" type="text" autocomplete="off"
              inputmode=${a.input.inputmode ?? 'text'}
              placeholder=${a.input.placeholder ?? ''}
              .value=${a.input.value ?? ''} />`
          : nothing}
        <div class="toolrow">
          <button type="submit" class="btn primary ${a.danger ? 'danger' : ''}">
            ${a.okLabel ?? this.tx('Да', 'OK')}
          </button>
          <button type="button" class="btn" @click=${this.cancelAsk}>
            ${a.cancelLabel ?? this.tx('Отмена', 'Cancel')}
          </button>
        </div>
      </form>
    </div>`;
  }

  /** What the previous version holds, before anything is copied. The operator
   *  sees the source, the count and the names — then decides. */
  private renderLegacyDialog() {
    const total = this.legacyFinds.reduce((n, f) => n + f.count, 0);
    return html`<div class="import-modal" @click=${() => (this.legacyOpen = false)}>
      <div class="import-box" @click=${(e: Event) => e.stopPropagation()}>
        <div class="import-title">${this.tx('Перенос из старой версии', 'Import from the old version')}</div>
        ${this.legacyBusy && !this.legacyFinds.length
          ? html`<div class="ask-msg">${this.tx('Ищем планы старой версии…', 'Looking for old plans…')}</div>`
          : nothing}
        ${!this.legacyBusy && !this.legacyFinds.length
          ? html`<div class="ask-msg">
              ${this.tx('Планы старой версии не найдены.', 'No plans from the previous version were found.')}
            </div>`
          : nothing}
        <div class="legacy-list">
        ${this.legacyFinds.map(
          (f) => html`<div class="legacy-src">
            <div class="legacy-head">
              ${this.legacySourceLabel(f.source)} — ${f.count}
              ${this.isRu ? this.ruPlural(f.count, 'проект', 'проекта', 'проектов') : 'project(s)'}
            </div>
            <div class="legacy-names">${f.names.join(' · ')}</div>
          </div>`,
        )}
        ${this.legacyErrors.map(
          (e) => html`<div class="pin-error">
            ${this.legacySourceLabel(e.source)}: ${this.tx('не удалось прочитать', 'could not be read')} — ${e.error}
          </div>`,
        )}
        </div>
        ${this.legacyFinds.length
          ? html`<div class="ask-msg">
              ${this.tx(
                'Проекты будут СКОПИРОВАНЫ сюда. Ваши существующие проекты не затираются: при совпадении имени копия получит пометку. Старое хранилище остаётся нетронутым.',
                'The projects will be COPIED here. Your existing projects are not overwritten — a copy with a clashing name gets a mark appended. The old store is left untouched.',
              )}
            </div>`
          : nothing}
        <div class="toolrow">
          ${this.legacyFinds.length
            ? html`<button class="btn primary" ?disabled=${this.legacyBusy} @click=${this.onImportLegacy}>
                ⬇ ${this.tx(`Перенести (${total})`, `Import (${total})`)}
              </button>`
            : nothing}
          <button class="btn" @click=${() => (this.legacyOpen = false)}>${this.tx('Закрыть', 'Close')}</button>
        </div>
      </div>
    </div>`;
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
        @click=${() => this.lockAction(id, on ? 'lock' : 'unlock')}>${this.ic(on ? 'lockOpen' : 'lockClosed')}</button>`;
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

  /** Room AIR temp + optional FLOOR temp. When a room has BOTH a climate/AC air
   *  reading AND a bound temperature sensor, the sensor is treated as the floor
   *  probe ("Температура пола"); otherwise the single reading is the room temp. */
  /** The numeric reading of a bound sensor — a `sensor.*` state, or a
   *  `climate.*` current_temperature. null when unbound or not a finite number. */
  private boundReading(id?: string): number | null {
    if (!id) return null;
    const st = this.hass?.states[id];
    if (!st) return null;
    const raw = id.startsWith('climate.') ? st.attributes?.current_temperature : st.state;
    const v = Number(raw);
    return Number.isFinite(v) ? v : null;
  }

  private roomTempStrs(room: RoomInfo, num: (v: any, d: number) => string): { air: string | null; floor: string | null } {
    // Read ONLY the sensors explicitly bound to the room in the editor
    // (zone.tempSensor / zone.floorSensor). No auto-detect: an unbound metric is
    // blank (null), never a guess or a dash.
    const air = this.boundReading(room.tempSensor);
    const floor = this.boundReading(room.floorSensor);
    return { air: air != null ? `${num(air, 1)}°` : null, floor: floor != null ? `${num(floor, 1)}°` : null };
  }

  /** Recent samples for a sensor (the sparkline). Returns cached points and, when
   *  the cache is missing or older than 5 min, kicks off a background fetch
   *  (guarded, so a render may call it freely). null until the first fetch lands. */
  private historyPts(entityId?: string): [number, number][] | null {
    if (!entityId) return null;
    const c = this.histCache.get(entityId);
    if (!c || Date.now() - c.ts > 5 * 60 * 1000) void this.fetchHistory(entityId);
    return c ? c.pts : null;
  }

  /** Store a fetched series, keeping the cache BOUNDED. A panel that runs for
   *  weeks visits many rooms; without a cap this map grew a 120-point series
   *  per sensor ever looked at and never gave any of it back. Oldest fetch
   *  first — it will simply be re-fetched if that room is opened again. */
  private putHistory(entityId: string, pts: [number, number][]): void {
    this.histCache.set(entityId, { pts, ts: Date.now() });
    while (this.histCache.size > HIST_CACHE_MAX) {
      let oldestKey: string | null = null;
      let oldestTs = Infinity;
      for (const [k, v] of this.histCache) {
        if (v.ts < oldestTs) { oldestTs = v.ts; oldestKey = k; }
      }
      if (!oldestKey) break;
      this.histCache.delete(oldestKey);
    }
  }

  /** Pull the last 24h of a sensor from HA's history. Tries the websocket
   *  (history/history_during_period) first, then falls back to the REST history
   *  API — the data is all in HA, so one of the two reaches it on any core.
   *  Failures cache an empty series so we don't hammer, and the graph just
   *  doesn't show. */
  private async fetchHistory(entityId: string): Promise<void> {
    const hass = this.hass as any;
    if ((!hass?.callWS && !hass?.callApi) || this.histInFlight.has(entityId)) return;
    this.histInFlight.add(entityId);
    const end = new Date();
    const start = new Date(end.getTime() - 24 * 3600 * 1000);
    const toPts = (rows: any[]): [number, number][] => {
      const out: [number, number][] = [];
      for (const r of rows ?? []) {
        const v = Number(r.s ?? r.state);
        const lu = r.lu ?? r.last_updated ?? r.last_changed;
        const t = typeof lu === 'number' ? lu * 1000 : Date.parse(lu);
        if (Number.isFinite(v) && Number.isFinite(t)) out.push([t, v]);
      }
      return out;
    };
    try {
      let pts: [number, number][] = [];
      if (hass.callWS) {
        try {
          const res = await hass.callWS({
            type: 'history/history_during_period',
            start_time: start.toISOString(),
            end_time: end.toISOString(),
            entity_ids: [entityId],
            minimal_response: true,
            no_attributes: true,
            significant_changes_only: false,
          });
          pts = toPts(res?.[entityId] ?? []);
        } catch { /* fall through to REST */ }
      }
      if (!pts.length && hass.callApi) {
        const path =
          `history/period/${start.toISOString()}?filter_entity_id=${entityId}` +
          `&end_time=${encodeURIComponent(end.toISOString())}&minimal_response&no_attributes`;
        const rest = await hass.callApi('GET', path);
        pts = toPts(Array.isArray(rest) ? (rest[0] ?? []) : []);
      }
      // Down-sample a long series so the SVG stays light (≤120 points).
      const step = Math.ceil(pts.length / 120) || 1;
      this.putHistory(entityId, step > 1 ? pts.filter((_, i) => i % step === 0) : pts);
    } catch {
      this.putHistory(entityId, []);
    } finally {
      this.histInFlight.delete(entityId);
      this.requestUpdate();
    }
  }

  /** Compact 24h LINE GRAPH for a room's bound degree sensors (air + floor on one
   *  shared axis). A left gutter shows the temperature scale in degrees with
   *  faint horizontal gridlines. Uniform-scaled (so the axis text isn't
   *  distorted). Appears once a temperature sensor is bound and its history
   *  loads; renders nothing with no bound sensor or no data. */
  private renderRoomSpark(room: RoomInfo, metric: 'auto' | 'temp' | 'floor' | 'humidity' = 'auto') {
    const defs = ([
      { key: 'temp', id: room.tempSensor, cls: 'air', label: 'Воздух', unit: '°' },
      { key: 'floor', id: room.floorSensor, cls: 'warm', label: 'Пол', unit: '°' },
      { key: 'humidity', id: room.humiditySensor, cls: 'hum', label: 'Влажность', unit: '%' },
    ] as { key: string; id?: string; cls: string; label: string; unit: string }[]).filter((m) => !!m.id);
    // Tapping a chip graphs just that metric; 'auto' shows the degree metrics
    // (air + floor) together, else the single bound one.
    const chosen = metric === 'auto'
      ? (defs.some((m) => m.unit === '°') ? defs.filter((m) => m.unit === '°') : defs.slice(0, 1))
      : defs.filter((m) => m.key === metric);
    const series = chosen
      .map((m) => ({ cls: m.cls, label: m.label, unit: m.unit, pts: this.historyPts(m.id) }))
      .filter((m) => !!m.pts && m.pts.length >= 2) as { cls: string; label: string; unit: string; pts: [number, number][] }[];
    if (!series.length) return nothing;
    const unit = series[0].unit;
    const all = series.flatMap((s) => s.pts);
    const vs = all.map((p) => p[1]);
    // Fixed, exact 24-hour window (now − 24h → now), so the time axis always
    // reads as a clear 24h regardless of how dense the recorder data is.
    const t1 = Date.now();
    const t0 = t1 - 24 * 3600 * 1000;
    // Value scale with headroom; minimum span 2° for temperature, 5% for humidity.
    const minSpan = unit === '%' ? 5 : 2;
    let lo = Math.floor(Math.min(...vs));
    let hi = Math.ceil(Math.max(...vs));
    if (hi - lo < minSpan) { const m = (lo + hi) / 2; lo = Math.floor(m - minSpan / 2); hi = Math.ceil(m + minSpan / 2); }
    const W = 260, H = 116, axisW = 30, top = 8, bot = H - 22, right = W - 6;
    const xFor = (t: number) => (t1 === t0 ? (axisW + right) / 2 : axisW + ((t - t0) / (t1 - t0)) * (right - axisW));
    const yFor = (v: number) => bot - ((v - lo) / (hi - lo)) * (bot - top);
    // Degree scale down the left, faint horizontal gridlines.
    const TICKS = 4;
    const grid: unknown[] = [];
    for (let i = 0; i <= TICKS; i++) {
      const v = lo + ((hi - lo) * i) / TICKS;
      const y = yFor(v);
      grid.push(svg`<line class="spark-grid" x1=${axisW} y1=${y.toFixed(1)} x2=${right} y2=${y.toFixed(1)}></line>`);
      grid.push(svg`<text class="spark-axis" x=${axisW - 5} y=${(y + 3).toFixed(1)} text-anchor="end">${Math.round(v)}${unit}</text>`);
    }
    // Time scale along the bottom (HH:MM), faint vertical gridlines. Edge labels
    // are start/end-anchored so they don't clip.
    const fmtTime = (ms: number) => new Date(ms).toLocaleTimeString(this.uiLocale, { hour: '2-digit', minute: '2-digit' });
    // Ticks on ROUND local 6-hour marks (00:00 / 06:00 / 12:00 / 18:00), so the
    // labels are clean and each sits exactly where that clock time falls on the
    // line (positioned by real timestamp, not an even fraction of the window).
    const mark = new Date(t0);
    mark.setMinutes(0, 0, 0);
    while (mark.getHours() % 6 !== 0 || mark.getTime() < t0) mark.setHours(mark.getHours() + 1);
    for (; mark.getTime() <= t1; mark.setHours(mark.getHours() + 6)) {
      const t = mark.getTime();
      const x = xFor(t);
      const frac = (t - t0) / (t1 - t0);
      const anchor = frac < 0.05 ? 'start' : frac > 0.95 ? 'end' : 'middle';
      grid.push(svg`<line class="spark-grid" x1=${x.toFixed(1)} y1=${top} x2=${x.toFixed(1)} y2=${bot}></line>`);
      grid.push(svg`<text class="spark-axis" x=${x.toFixed(1)} y=${H - 7} text-anchor=${anchor}>${fmtTime(t)}</text>`);
    }
    const lines = series.map((s) => {
      const d = s.pts.map((p, i) => `${i ? 'L' : 'M'}${xFor(p[0]).toFixed(1)} ${yFor(p[1]).toFixed(1)}`).join(' ');
      return svg`<path class="spark ${s.cls}" d=${d}></path>`;
    });
    return html`<div class="rp-spark-wrap" title="24h">
      <div class="spark-legend">${series.map((s) => html`<span class="spark-leg ${s.cls}"><i></i>${s.label}</span>`)}</div>
      <svg class="rp-spark" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet">${grid}${lines}</svg>
    </div>`;
  }

  /** Temperature sensors to HIDE from the room's device cards: they're already
   *  summarised in the header chips, so a per-sensor card would be redundant.
   *  EXCEPTION — a sensor bound to a `wall_switch` (an inert info/control plate):
   *  the user placed it there precisely to surface that reading, so it stays as a
   *  full-name info card in the panel. */
  private tempSensorsToHide(room: RoomInfo): Set<string> {
    const skip = new Set<string>();
    for (const e of room.entities) {
      if (e.behavior !== 'sensor') continue;
      if (e.model === 'wall_switch') continue; // deliberately surfaced as info
      const a = this.hass?.states[e.entity_id]?.attributes;
      if (a?.device_class === 'temperature' || a?.unit_of_measurement === '°C' || a?.unit_of_measurement === '°F') {
        skip.add(e.entity_id);
      }
    }
    return skip;
  }

  /**
   * Whole-home rollup: humidity, temperature and the number of lights that are
   * on. Computed in ONE pass over hass.states and memoised per (hass object,
   * optimistic generation).
   *
   * These three were three separate full scans of every entity in the home, and
   * render() calls them several times each — on a house with 2000 entities that
   * is tens of thousands of attribute lookups per interface frame, repeated for
   * every state change that arrives. The inputs only move when hass or an
   * optimistic override moves, so a scan per hass object is the honest cost.
   */
  private homeStats(): { hum: string; temp: number | null; on: number } {
    const hass = this.hass;
    const cached = this.homeStatsCache;
    if (cached && hass && cached.hass === hass && cached.opt === this.optGen) return cached;

    const humVals: number[] = [];
    const tempVals: number[] = [];
    const climateVals: number[] = [];
    let on = 0;
    for (const id in hass?.states ?? {}) {
      const st = hass!.states[id] as HassEntity;
      // Lights that are on — through effState so an optimistic tap counts.
      if (id.startsWith('light.')) {
        if (this.effState(id) === 'on') on++;
        continue;
      }
      const a = st?.attributes;
      const dc = a?.device_class;
      if (dc === 'humidity') {
        const v = Number(st.state);
        if (Number.isFinite(v)) humVals.push(v);
      } else if (dc === 'temperature') {
        // Only real air-temperature readings. The Tuya floor thermostats expose
        // a unit-less raw floor-probe value (~220-290) as device_class
        // temperature; averaging that in dragged the whole-home mean to absurd
        // numbers (110°). Require a °C/°F unit and a sane range so a mis-scaled
        // probe can't skew it.
        if (a.unit_of_measurement !== '°C' && a.unit_of_measurement !== '°F') continue;
        const v = Number(st.state);
        if (Number.isFinite(v) && v >= -60 && v <= 160) tempVals.push(v);
      } else if (id.startsWith('climate.')) {
        const cur = Number(a?.current_temperature);
        if (Number.isFinite(cur)) climateVals.push(cur);
      }
    }
    const avg = (v: number[]) => v.reduce((s, n) => s + n, 0) / v.length;
    // Fall back to the climate units' current_temperature when no standalone
    // temperature sensor reports: some homes only have thermostats.
    const tSrc = tempVals.length ? tempVals : climateVals;
    const out = {
      hum: humVals.length ? `${Math.round(avg(humVals))}%` : '—',
      temp: tSrc.length ? avg(tSrc) : null,
      on,
    };
    if (hass) this.homeStatsCache = { hass, opt: this.optGen, ...out };
    return out;
  }

  /** Whole-home humidity = average of every humidity sensor in HA (not just the
   *  ones bound to a room). Humidity sensors are usually auxiliary AC readings
   *  that aren't placed in the 3D scene, so a room-only lookup shows nothing. */
  private homeHumidity(): string {
    return this.homeStats().hum;
  }

  /** Whole-home temperature (°) = average of every temperature sensor in HA,
   *  else the climate units' current_temperature. Same reasoning as
   *  homeHumidity: the temp sensors often aren't bound to a room, and some
   *  climates report no current_temperature, so a room-only lookup shows "—".
   *  Returns null if none. */
  private homeTemperature(): number | null {
    return this.homeStats().temp;
  }

  /** Whole-home count of lights that are on — every light.* entity in HA, not
   *  just the ones assigned to a room on the active floor (a room-only count
   *  shows 0 when the on-lights live on other floors / aren't zoned). */
  private homeLightsOn(): number {
    return this.homeStats().on;
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
    return html`
      <div class="clock">
        <div class="ctime">${this.fmtClockTime()}</div>
        <div class="cdate">${this.fmtClockDate()}</div>
      </div>
      <div class="topstat">
        <button class="sdot" title="Reset view" @click=${this.onResetView}>${this.ic('room')}</button>
        ${this.panel ? html`<button class="sdot" title="Full-screen 3D" @click=${this.openKiosk}>${this.ic('shield')}</button>` : nothing}
        <button class="sdot" title="Screensaver" @click=${(e: Event) => this.onSleep(e)}>${this.ic('moon')}</button>
        <button class="sdot" title=${this.t('All off short')} @click=${() => this.allOffHouse()}>${this.ic('power')}</button>
        <button class="sdot" title="Отчёт — графики температуры" @click=${() => { this.showReport = true; }}>${this.ic('chart')}</button>
        ${this.renderViewToggle()}
      </div>
      <div class="stage-bottom">
        ${this.renderFloorTabs()}
        ${this.renderPills()}
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

  /** The temperature / floor / humidity chips, tappable to filter the graph to
   *  just that metric (the active one is highlighted). */
  private renderTempChips(t: string | null, f: string | null, h: string | null) {
    if (!t && !f && !h) return nothing;
    const chip = (val: string | null, m: 'temp' | 'floor' | 'humidity', cls: string, icon: string, title = '') =>
      val
        ? html`<button type="button" class="rp-chip ${cls} ${this.sparkMetric === m ? 'sel' : ''}" title=${title}
            @click=${() => this.toggleSparkMetric(m)}>${this.ic(icon)}${val}</button>`
        : nothing;
    return html`<div class="rp-chips">
      ${chip(t, 'temp', '', 'thermo')}
      ${chip(f, 'floor', 'warm', 'heat', this.t('Floor'))}
      ${chip(h, 'humidity', 'cool', 'drop')}
    </div>`;
  }

  /** "Отчёт" overlay: every room's 24h graph, split into category tabs —
   *  Температура (air), Тёплый пол (floor) and Влажность. The active tab graphs
   *  that one metric for every room that has it bound; just name + graph. */
  private renderReport() {
    const rooms = (this.sceneManager?.roomsByFloor() ?? [this.rooms]).flat();
    const cats: { key: 'temp' | 'floor' | 'humidity'; label: string; has: (r: RoomInfo) => boolean }[] = [
      { key: 'temp', label: 'Температура', has: (r) => !!r.tempSensor },
      { key: 'floor', label: 'Тёплый пол', has: (r) => !!r.floorSensor },
      { key: 'humidity', label: 'Влажность', has: (r) => !!r.humiditySensor },
    ];
    const active = this.reportMetric;
    const shown = rooms.filter((r) => cats.find((c) => c.key === active)!.has(r));
    return html`
      <div class="report-back" @click=${() => { this.showReport = false; }}></div>
      <div class="report" @click=${(e: Event) => e.stopPropagation()}>
        <div class="report-head">
          <div class="report-title">${this.ic('chart')}<span>Отчёт — 24ч</span></div>
          <button type="button" class="closebtn" title="Close" @click=${() => { this.showReport = false; }}>${this.ic('close')}</button>
        </div>
        <div class="report-tabs">
          ${cats.map((c) => {
            const n = rooms.filter(c.has).length;
            return html`<button type="button" class="report-tab ${active === c.key ? 'sel' : ''}"
              @click=${() => { this.reportMetric = c.key; }}>${c.label}${n ? html` <em>${n}</em>` : nothing}</button>`;
          })}
        </div>
        <div class="report-grid">
          ${shown.length
            ? shown.map((r) => html`<div class="report-item">
                <div class="report-room">${r.name || this.t('Room')}</div>
                ${this.renderRoomSpark(r, active)}
              </div>`)
            : html`<div class="rp-empty">Нет комнат с этим датчиком</div>`}
        </div>
      </div>`;
  }

  private renderRoomPanel() {
    const room = this.activeRoom;
    if (!room) return nothing;
    const humEnt = room.humiditySensor ? this.hass?.states[room.humiditySensor] : undefined;
    const skip = this.tempSensorsToHide(room);
    if (humEnt) skip.add(humEnt.entity_id);

    const num = (v: any, digits: number) => {
      const n = Number(v);
      return Number.isFinite(n) ? n.toLocaleString(this.uiLocale, { minimumFractionDigits: digits, maximumFractionDigits: digits }) : '—';
    };
    const { air: tempChip, floor: floorChip } = this.roomTempStrs(room, num);
    const humChip = humEnt && Number.isFinite(Number(humEnt.state)) ? `${num(humEnt.state, 0)}%` : null;

    const cards = this.roomCards(room, skip);
    return html`
      <div class="room-panel">
        <div class="rp-head">
          <div class="rp-top">
            <div class="rp-name">${room.name || this.t('Room')}</div>
            <button type="button" class="closebtn" title="Close" @click=${() => this.selectRoom(null)}>${this.ic('close')}</button>
          </div>
          ${this.renderTempChips(tempChip, floorChip, humChip)}
          ${this.renderRoomSpark(room, this.sparkMetric)}
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
    const humEnt = room.humiditySensor ? this.hass?.states[room.humiditySensor] : undefined;
    const skip = this.tempSensorsToHide(room);
    if (humEnt) skip.add(humEnt.entity_id);
    const num = (v: any, d: number) => {
      const n = Number(v);
      return Number.isFinite(n) ? n.toLocaleString(this.uiLocale, { minimumFractionDigits: d, maximumFractionDigits: d }) : '—';
    };
    const { air: tempChip, floor: floorChip } = this.roomTempStrs(room, num);
    const humChip = humEnt && Number.isFinite(Number(humEnt.state)) ? `${num(humEnt.state, 0)}%` : null;
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
          ${this.renderTempChips(tempChip, floorChip, humChip)}
          ${this.renderRoomSpark(room, this.sparkMetric)}
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
    // A binding can name any entity; one we may not control is shown as a
    // read-only readout instead of a switch (see CONTROL_DOMAINS).
    const of = (...b: string[]) =>
      ents.filter((e) => this.canControl(e.entity_id) && b.includes(e.behavior));
    const lights = of('light');
    const switches = of('switch', 'input_boolean');
    const climates = of('climate');
    const fans = of('fan');
    const covers = of('cover');
    const medias = of('media_player');
    const locks = of('lock');
    const known = new Set(['light', 'switch', 'input_boolean', 'climate', 'fan', 'cover', 'media_player', 'lock']);
    const infos = ents.filter((e) => !known.has(e.behavior) || !this.canControl(e.entity_id));

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
    fans.forEach((e) => out.push(this.renderFanCard(e.entity_id)));
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
              @click=${() => this.intercomOpenDoor(g.open!)}>
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

  /** Fan card: on/off toggle + a speed row. Preset-mode fans (e.g. 25/50/75/100)
   *  show their presets as buttons; percentage fans show N even steps. */
  private renderFanCard(id: string) {
    const on = this.effState(id) === 'on';
    const a = this.hass?.states[id]?.attributes ?? {};
    const presets = (a.preset_modes as string[] | undefined) ?? [];
    const curPreset = a.preset_mode as string | undefined;
    const pct = a.percentage as number | undefined;
    const step = a.percentage_step as number | undefined;
    const count = step && step > 0 ? Math.round(100 / step) : 0;
    const pcts = count > 1 && count <= 8
      ? Array.from({ length: count }, (_, i) => Math.round(((i + 1) / count) * 100))
      : [];
    const sub = !on ? this.t('Off') : (curPreset ?? (pct != null ? `${pct}%` : this.t('On')));
    return html`<div class="card ${on ? 'on' : ''}">
      <div class="crow">
        <div class="cicon ${on ? 'lit' : ''}">${this.ic('fan')}</div>
        <div class="cgrow">
          <div class="clabel">${this.cardName(id)}</div>
          <div class="csub">${sub}</div>
        </div>
        <button type="button" class="sw ${on ? 'on' : ''}" title="Toggle"
          @click=${() => this.svc('fan', 'toggle', {}, id, on ? 'off' : 'on')}><span class="sw-k"></span></button>
      </div>
      ${presets.length
        ? html`<div class="seg fan">
            ${presets.map((p) => html`<button type="button" class="segb ${curPreset === p ? 'on' : ''}"
              @click=${() => this.svc('fan', 'set_preset_mode', { preset_mode: p }, id)}>${p}</button>`)}
          </div>`
        : pcts.length
          ? html`<div class="seg fan">
              ${pcts.map((p) => html`<button type="button" class="segb ${pct === p ? 'on' : ''}"
                @click=${() => this.svc('fan', 'set_percentage', { percentage: p }, id)}>${p}%</button>`)}
            </div>`
          : nothing}
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
      // `middle` is what the Tuya ACs report; without it the raw English word
      // showed up untranslated between Низкое and Высокое.
      this.t(
        ({ low: 'Low', mid: 'Medium', medium: 'Medium', middle: 'Medium', high: 'High', auto: 'Auto' } as Record<
          string,
          string
        >)[f.toLowerCase()] ?? f,
      );
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

  /** Gates get ONE one-touch button (moving→stop, closed→open, else close, with
   *  the label showing the next action); every other cover keeps the explicit
   *  Open / Stop / Close buttons. No position slider or state line. */
  private renderCoverCard(id: string) {
    const ent = this.hass!.states[id];
    const head = html`<div class="crow">
        <div class="cicon">${this.ic('curtain')}</div>
        <div class="cgrow">
          <div class="clabel">${this.cardName(id)}</div>
        </div>
      </div>`;
    // The one-touch single button is ONLY for gates (device_class gate/garage/
    // door, or a gate-like name). Every other cover — curtains, blinds — keeps
    // the explicit Open / Stop / Close buttons.
    const dc = String(ent?.attributes?.device_class ?? '').toLowerCase();
    const nm = (String(ent?.attributes?.friendly_name ?? '') + ' ' + id).toLowerCase();
    const isGate = dc === 'gate' || dc === 'garage' || dc === 'door' || /ворот|gate|darvoza|калитк/.test(nm);
    if (isGate) {
      const st = this.effState(id);
      const moving = st === 'opening' || st === 'closing';
      const action = moving ? 'stop' : st === 'closed' ? 'open' : 'close';
      const svcName = action === 'stop' ? 'stop_cover' : action === 'open' ? 'open_cover' : 'close_cover';
      const title = action === 'stop' ? this.t('Stop blind') : action === 'open' ? this.t('Open blind') : this.t('Close blind');
      const opt = action === 'open' ? 'opening' : action === 'close' ? 'closing' : 'open';
      // ONE button with a fixed, unchanging icon (no Open/Stop/Close text). A
      // press still runs the gate's one-touch open/stop/close logic; the title
      // carries the current action for hover / accessibility only.
      return html`<div class="card">
        ${head}
        <div class="qbtns">
          <button type="button" class="qb gate icon-only" title=${title}
            @click=${() => this.svc('cover', svcName, {}, id, opt)}>${this.ic('power')}</button>
        </div>
      </div>`;
    }
    const feat = Number(ent?.attributes?.supported_features ?? 0);
    return html`<div class="card">
      ${head}
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
    // Read the EFFECTIVE volume so the % jumps the instant ± is tapped, and so a
    // synced pair shows the shared level rather than this speaker's stale one.
    const volReal = Math.round(this.effVol(id) * 100);
    const track = ent?.attributes?.media_title ?? this.cardName(id, title);
    const artist = ent?.attributes?.media_artist ?? '';
    // Now-playing line, shown while the speaker is playing. Transport controls
    // (play/pause/next/…) are omitted on purpose — these panels drive speakers
    // that play from a phone or an HA automation; power + volume is all that's
    // needed here.
    const showMedia = playing;
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

  /** The volume to show and to step from: the pending one if a set is in flight,
   *  else HA's. Lets ± tap repeatedly (0.40 → 0.45 → 0.50) while HA still sits on
   *  the old value, and keeps the % live. */
  private effVol(id: string): number {
    const ov = this.optVol.get(id);
    if (ov) return ov.vol;
    const v = this.hass?.states[id]?.attributes?.volume_level;
    return typeof v === 'number' ? v : 0;
  }

  /** Show `vol` (0..1) for `id` until HA catches up (see optVol reconcile). */
  private setOptimisticVol(id: string, vol: number): void {
    const prev = this.optVol.get(id);
    if (prev) clearTimeout(prev.timer);
    const base = this.hass?.states[id]?.attributes?.volume_level;
    const timer = setTimeout(() => {
      this.optVol.delete(id);
      this.requestUpdate();
    }, 4000);
    this.optVol.set(id, { vol, base: typeof base === 'number' ? base : undefined, timer });
    this.requestUpdate();
  }

  /** The speakers a volume nudge should move: the whole HA group when this one is
   *  grouped, so ± drives them as ONE volume; otherwise just this speaker. */
  private volTargets(id: string, ent: HassEntity | undefined): string[] {
    const g = ent?.attributes?.group_members as string[] | undefined;
    if (g && g.length > 1) return g.filter((m) => this.hass?.states[m]);
    return [id];
  }

  /** Nudge volume by ±5%. Absolute volume_set (not volume_up/down) so it lands
   *  in one call — instant via the optimistic %, and the only way to hold a group
   *  in lockstep. Every group member gets the SAME level, so a synced pair reads
   *  as one control. Falls back to relative stepping for a lone device that has
   *  STEP but not SET (some TVs), where an absolute level isn't available. */
  private mediaVolStep(id: string, ent: HassEntity | undefined, volStep: boolean, dir: number): void {
    const targets = this.volTargets(id, ent);
    const canSet = (m: string) =>
      (Number(this.hass?.states[m]?.attributes?.supported_features) || 0) & 4;
    if (targets.every(canSet)) {
      const cur = this.effVol(id);
      const next = Math.round(Math.max(0, Math.min(1, cur + dir * 0.05)) * 100) / 100;
      if (next === Math.round(cur * 100) / 100) return; // already at the rail
      for (const m of targets) {
        this.setOptimisticVol(m, next);
        this.svc('media_player', 'volume_set', { volume_level: next }, m);
      }
      return;
    }
    if (volStep) this.svc('media_player', dir > 0 ? 'volume_up' : 'volume_down', {}, id);
  }

  private renderLockCard(id: string) {
    const locked = this.effState(id) === 'locked';
    return html`<button type="button" class="lockbtn ${locked ? 'locked' : 'unlocked'}"
      @click=${() => this.lockAction(id, locked ? 'unlock' : 'lock')}>
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
      // `homeassistant.turn_off` would also stop a script / disable an
      // automation — keep the bulk list inside CONTROL_DOMAINS.
      .filter((id) => this.canControl(id) && this.effState(id) === 'on');
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
    // "All off" turns off everything EXCEPT the TV and heating (warm floor /
    // radiators). Only two categories need a keep/off split — climate and media:
    //   climate → turn off anything that can COOL (an AC); keep heat-only units.
    //   media   → pause speakers; keep the TV.
    // Lights, switches, input_booleans and fans are always turned off.
    const offIds: string[] = [];
    const seen = new Set<string>();
    for (const room of this.rooms) {
      for (const e of room.entities) {
        if (seen.has(e.entity_id)) continue;
        seen.add(e.entity_id);
        // Same reasoning as onRoomAllOff: never sweep an entity this card is
        // not allowed to control into `homeassistant.turn_off`.
        if (!this.canControl(e.entity_id)) continue;
        const attrs = this.hass.states[e.entity_id]?.attributes ?? {};
        if (['light', 'switch', 'input_boolean', 'fan'].includes(e.behavior)) {
          if (this.effState(e.entity_id) === 'on') offIds.push(e.entity_id);
        } else if (e.behavior === 'media_player') {
          if (attrs.device_class === 'tv') continue; // keep the TV
          const s = this.effState(e.entity_id);
          if (!['off', 'paused', 'idle', 'standby', 'unavailable', 'unknown'].includes(s)) {
            this.svc('media_player', 'media_pause', {}, e.entity_id, 'paused');
          }
        } else if (e.behavior === 'climate') {
          // Heat-only (modes ⊆ {off, heat}) = warm floor / radiator → keep.
          // Anything that can cool (cool/heat_cool/dry/fan_only/auto) = AC → off.
          const modes: string[] = attrs.hvac_modes ?? [];
          const heatOnly = modes.length > 0 && modes.every((m) => m === 'off' || m === 'heat');
          if (!heatOnly && this.effState(e.entity_id) !== 'off') {
            this.svc('climate', 'set_hvac_mode', { hvac_mode: 'off' }, e.entity_id, 'off');
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
    return floors.map((rs, fi) => {
      if (!rs.length) return nothing;
      // Nest sub-rooms (zones whose parentId resolves to a sibling zone) inside
      // their parent's card; everything else stays a top-level card.
      const byId = new Map<string, RoomInfo>();
      for (const r of rs) if (r.id) byId.set(r.id, r);
      const isChild = (r: RoomInfo) => !!(r.parentId && r.parentId !== r.id && byId.has(r.parentId));
      const childrenOf = (id?: string) => (id ? rs.filter((r) => isChild(r) && r.parentId === id) : []);
      const tops = rs.filter((r) => !isChild(r));
      return html`${multi ? html`<div class="ov-floor-h">${this.floorNames[fi] ?? ''}</div>` : nothing}
        ${tops.map((r) => this.renderOverviewCard(r, num, childrenOf(r.id)))}`;
    });
  }

  /** One light "segment" button (used by the room card and its sub-rooms). */
  private renderLightChip(id: string, roomName?: string) {
    const lon = this.effState(id) === 'on';
    const nm = this.hass?.states[id]?.attributes?.friendly_name ?? id;
    return html`<button type="button" class="lightseg ${lon ? 'on' : ''}" title=${nm}
      @click=${(e: Event) => { e.stopPropagation(); this.svc(id.split('.')[0], 'toggle', {}, id, lon ? 'off' : 'on'); }}><span>${this.shortLightName(id, roomName)}</span></button>`;
  }

  private renderOverviewCard(room: RoomInfo, num: (v: any, d: number) => string, children: RoomInfo[] = []) {
    const self = this.roomLights(room);
    const ids = self.ids;
    const kids = children.map((c) => ({ room: c, ids: this.roomLights(c).ids }));
    // Header count/toggle span the room AND its sub-rooms.
    const allIds = [...ids, ...kids.flatMap((k) => k.ids)];
    const anyOn = allIds.some((id) => this.effState(id) === 'on');
    const onCount = allIds.filter((id) => this.effState(id) === 'on').length;
    const pct = allIds.length ? Math.round((onCount / allIds.length) * 100) : 0;
    const toggleEnts = [room, ...children].flatMap((r) => r.entities.filter((x) => ['light', 'switch', 'input_boolean'].includes(x.behavior)));
    const humEnt = room.humiditySensor ? this.hass?.states[room.humiditySensor] : undefined;
    const climate = room.entities.find((e) => e.behavior === 'climate');
    const lock = room.entities.find((e) => e.behavior === 'lock');
    const cover = room.entities.find((e) => e.behavior === 'cover');
    const { air: tempStr, floor: floorStr } = this.roomTempStrs(room, num);
    const humStr = humEnt && Number.isFinite(Number(humEnt.state)) ? `${num(humEnt.state, 0)}%` : null;

    // One extra footer chip (lock > climate > cover), mirroring the mockup.
    let extraChip = nothing as unknown;
    if (lock) {
      const locked = this.effState(lock.entity_id) === 'locked';
      extraChip = html`<button type="button" class="qstat lockq ${locked ? 'locked' : 'unlocked'}"
        @click=${(e: Event) => { e.stopPropagation(); this.lockAction(lock.entity_id, locked ? 'unlock' : 'lock'); }}>
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
          <div class="rctemp">${[tempStr, humStr].filter(Boolean).join(' · ')}${floorStr ? html`<span class="rcfloor"> · ${this.t('Floor')} ${floorStr}</span>` : nothing}</div>
        </div>
        ${allIds.length
          ? html`<button type="button" class="sw ${anyOn ? 'on' : ''}" title="Toggle"
              @click=${(e: Event) => { e.stopPropagation(); this.onToggleAll(toggleEnts); }}><span class="sw-k"></span></button>`
          : nothing}
      </div>
      ${allIds.length
        ? html`
          <div class="rcmid">
            <span class="icn-mid">${this.ic('bulb')}</span><span class="lbltxt">${this.t('Light')}</span>
            <div class="grow"></div><span class="brival">${onCount}/${allIds.length} · ${pct}%</span>
          </div>
          ${ids.length
            ? html`<div class="lightsegs">${ids.map((id) => this.renderLightChip(id, room.name))}</div>`
            : nothing}
          ${kids.map((k) => k.ids.length
            ? html`<div class="subroom">
                <div class="subroom-h">${this.ic(this.roomIcon(k.room.name))}<span>${k.room.name || this.t('Room')}</span>
                  <div class="grow"></div><span class="subroom-n">${k.ids.filter((id) => this.effState(id) === 'on').length}/${k.ids.length}</span></div>
                <div class="lightsegs">${k.ids.map((id) => this.renderLightChip(id, k.room.name))}</div>
              </div>`
            : nothing)}`
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

        ${this.planWarning && !this.loadError
          ? html`<div class="plan-warning">
              <span>⚠ ${this.planWarning}</span>
              <button class="pw-close" @click=${() => (this.planWarning = undefined)} title="Скрыть">✕</button>
            </div>`
          : nothing}

        ${this.editing ? nothing : this.renderLeakAlert()}

        ${this.editing
          ? nothing
          : this.viewMode === 'overview'
            ? html`${this.renderOverview()}${this.renderDetail()}`
            : html`${this.renderStageChrome()}${this.renderRoomPanel()}`}

        ${this.showReport && !this.editing ? this.renderReport() : nothing}

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

        ${this.legacyOpen ? this.renderLegacyDialog() : nothing}

        ${this.askOpen ? this.renderAsk() : nothing}

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

  // Таблица стилей карточки собрана из кусков (src/card/styles/*). ПОРЯДОК
  // здесь = порядок каскада: в исходной таблице 14 повторяющихся селекторов
  // верхнего уровня, и побеждает последний — переставлять нельзя. Три блока
  // @media живут в конце `detailStyles` и обязаны оставаться последними.
  static override styles = [
    baseStyles,
    editorPanelStyles,
    leakStyles,
    controlsStyles,
    statusStyles,
    roomViewStyles,
    roomPanelStyles,
    deviceCardStyles,
    viewToggleStyles,
    overviewStyles,
    detailStyles,
  ];
}

// The integration serves this bundle on EVERY Home Assistant page, and an
// install may still list an older copy of the resource in Lovelace. Handing the
// same tag to customElements twice throws, and that throw aborts the whole
// module — the card would vanish from every dashboard at once. Register only
// while the name is free.
if (!customElements.get(CARD_TAG)) customElements.define(CARD_TAG, BmsFloorplanCard);

// Register in the Lovelace card picker.
(window as any).customCards = (window as any).customCards || [];
if (!((window as any).customCards as any[]).some((c) => c?.type === CARD_TAG)) {
  (window as any).customCards.push({
    type: CARD_TAG,
    name: 'BMS Планировка',
    description: 'Интерактивная 3D-планировка объекта с живым управлением устройствами Home Assistant.',
    preview: false,
    documentationURL: 'https://github.com/optomtr/bms-3d-floorplan',
  });
}

// eslint-disable-next-line no-console
console.info(
  `%c BMS ПЛАНИРОВКА %c v${CARD_VERSION} `,
  'color:#fff;background:#0a84ff;border-radius:4px 0 0 4px;padding:2px 6px',
  'color:#0a84ff;background:#222;border-radius:0 4px 4px 0;padding:2px 6px',
);

declare global {
  interface HTMLElementTagNameMap {
    'bms-floorplan-card': BmsFloorplanCard;
  }
}
