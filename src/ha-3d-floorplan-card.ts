// ---------------------------------------------------------------------------
// <bms-floorplan-card> — the custom Lovelace card entry point.
//
// Здесь остаётся только то, что обязано быть на самом элементе: договор с
// Lovelace, жизненный цикл Lit, поля состояния, render() и склейка кусков.
// Всё остальное живёт в src/card/**: обычные функции, первым параметром
// которых идёт сама карточка (host). Контекст-объектов нет — их пришлось бы
// собирать из сотни полей, а host и есть готовый контекст.
//
// Теневой корень ОДИН на всю карточку (никаких вложенных веб-компонентов),
// поэтому таблица стилей общая, а .viewport, по которому updated() создаёт
// 3D-сцену, остаётся в том же корне.
// ---------------------------------------------------------------------------

import { LitElement, html, PropertyValues, nothing } from 'lit';
import { property, state, query } from 'lit/decorators.js';
import type { CardConfig, FloorPlan, HomeAssistant, RoomDef } from './types';
import { SceneManager, QualityChoice, QUALITY_CHOICES, RoomInfo } from './scene/scene-manager';
import { CARD_VERSION } from './version';
import { EditorController, EditTool } from './editor/editor-controller';
import { ProjectInfo, StoredProjects, LegacyFind, LegacySource } from './storage';
import { CARD_TAG, CARD_EDITOR_TAG, DISPOSE_GRACE_MS, pendingTeardown } from './card/constants';
import type { AskOptions, LeakAlarm } from './card/types';
import { stubConfig } from './card/stub-config';
import { injectFonts } from './card/fonts';
import { svgIcon } from './card/icon';
import { isRuLang, uiText, uiTx, localeTag, qualityLabel } from './card/i18n';
import { applyHass, effectiveState, isControllable, callService, toggleAll } from './card/state';
import { positionControlPopup, initScene, teardownScene, activeRoom, onSelectFloor, onResetView, onPickQuality } from './card/scene';
import { loadActiveProject, onSelectProject, onImportText, onImportLoad } from './card/projects';
import { armIdle, wake, onHotspotDown, onHotspotMove, onHotspotUp } from './card/session';
import { submitPin, cancelPin } from './card/pin';
import { pushToast, renderAsk, renderLegacyDialog } from './card/dialogs';
import { entityCardName } from './card/entities';
import { enterEditNow, exitEdit, trackShift, onSetWallThickness } from './card/editor-commands';
import { currentLeak, roomOfEntity, renderLeakAlert } from './card/leak';
import { renderEditor } from './card/views/editor-panel';
import { renderControlPopup } from './card/views/control-popup';
import { renderRoomPanel, renderStageChrome, renderScreensaver, renderReport } from './card/views/room-panel';
import { renderPlanState } from './card/views/plan-state';
import { renderOverview, renderDetail } from './card/views/overview';
// Новый конструктор (ставится РЯДОМ со старым; старый пока не удаляем).
import type { Editor2State } from './card/editor2-state';
import { enterEditor2, mountEditor2, openNewEditor } from './card/editor2-commands';
import { renderEditor2 } from './card/views/editor2/shell';

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
import { stateStyles } from './card/styles/states';
import { editor2Styles } from './card/styles/editor2';
import { detailStyles } from './card/styles/detail';

// Теги — часть договора с интеграцией: их спрашивают и снаружи модуля.
export { CARD_TAG, CARD_EDITOR_TAG };

export class BmsFloorplanCard extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;
  // Set by HA when this element is used as a `panel_custom` sidebar panel.
  @property({ attribute: false }) public panel?: { config?: Record<string, any> };
  @property({ attribute: false }) public narrow?: boolean;
  @state() public config?: CardConfig;
  @state() public activeProjectId?: string;
  @state() public loadError?: string;
  /** Техническая строка сбоя (статус, текст исключения). Человеку показывается
   *  ОТДЕЛЬНО от объяснения — монтажнику она нужна, клиенту нет. */
  @state() public loadErrorDetail?: string;
  /** План сейчас грузится. Без этого признака карточка показывала пустой
   *  тёмный прямоугольник и человек читал его как поломку. */
  @state() public planLoading = false;
  /** Показан ВСТРОЕННЫЙ ПРИМЕР, а не план этого дома. */
  @state() public isDemoPlan = false;
  /** Подпись примера убрана вручную (на этот сеанс). */
  @state() public demoNoticeHidden = false;
  /** Set when the plan drew, but parts of it were unusable. A dropped wall must
   *  never disappear in silence — the installer has to know what to fix. */
  @state() public planWarning?: string;
  @state() public floorNames: string[] = [];
  @state() public activeFloorIndex = 0;
  @state() public editing = false;
  /** Открыт НОВЫЙ конструктор (план сверху + 3D рядом). Идёт ВМЕСТЕ с
   *  `editing`: на том признаке висит вся логика «в режиме правки не трогать
   *  сцену живыми состояниями, не гасить экран, не показывать хром просмотра»,
   *  а `editing2` отличает новую оболочку от старой панели. */
  @state() public editing2 = false;
  /** Состояние оболочки нового конструктора (раскладка, выбранное, ящики).
   *  Меняется на месте, перерисовка запрашивается вручную. */
  public e2?: Editor2State;
  /** Куда ведёт вход в правку. Скрытое удержание угла открывает НОВЫЙ
   *  конструктор; `legacy` остаётся для прямого doEnterEdit() (и старый
   *  редактор пока никуда не делся). */
  public editEntry: 'legacy' | 'e2' = 'legacy';
  @state() public editTool: EditTool = 'wall';
  @state() public editSelectedModel = 'sofa';
  @state() public editSelectedObjModel: string | null = null;
  @state() public editShowAllEntities = false;
  @state() public editSnap = true;
  @state() public editFloorIndex = 0;
  @state() public editSelectedKind: 'furniture' | 'wall' | 'room' | 'opening' | null = null;
  @state() public editOpeningKind: 'door' | 'window' | 'opening' | null = null;
  @state() public editOpeningVariant = 'single';
  @state() public editOpeningWidth: number | null = null;
  @state() public editSelectedColor: string | null = null;
  @state() public editSelectedWallLength: number | null = null;
  @state() public editSelectedWallThickness: number | null = null;
  @state() public editSelectedWallAngle: number | null = null;
  @state() public editRoom: RoomDef | null = null;
  @state() public editFurnScale: [number, number, number] | null = null;
  @state() public editMaterial = 'plain';
  @state() public editCanUndo = false;
  @state() public editCanRedo = false;
  @state() public editUnderlay: import('./types').Underlay | null = null;
  @state() public editCameraDistance = 1;
  @state() public editIsLight = false;
  @state() public editBrightness = 0;
  @state() public editIsLightSet = false;
  @state() public editSpread = 1;
  @state() public editCount = 6;
  // Manual room zones (Rooms panel).
  @state() public editZones: import('./types').ZoneDef[] = [];
  @state() public editSelectedZoneId: string | null = null;
  @state() public editZonePlacing = false;
  // View-mode control popup (tap a bound object → controls/remote).
  @state() public controlOpen = false;
  @state() public controlEntities: string[] = [];
  /** When a ROOM marker is tapped: its devices + which category is expanded. */
  @state() public controlRoom: { name?: string; entities: { entity_id: string; behavior: string }[] } | null = null;
  @state() public controlCategory: string | null = null;
  @state() public controlPos: [number, number] = [0, 0];
  /** Timestamp the popup opened — guards against the touch "ghost click" that
   *  would otherwise close it the instant it appears on tablets. */
  public controlOpenedAt = 0;
  // --- Room control panel (Option 1A: room in focus) ---
  /** Which view is showing: single room in focus (1A) or the house grid (1B). */
  @state() public viewMode: 'room' | 'overview' = 'room';
  /** Rooms on the active floor (from the scene), for the pills + right panel. */
  @state() public rooms: RoomInfo[] = [];
  /** The focused room's design photo, once the scene has confirmed it loads.
   *  Painted as a CSS layer across the whole card (the canvas can't reach behind
   *  the side panel), with the canvas transparent over it. */
  @state() public roomPhoto: string | null = null;
  /** The room photo with its softening already baked in — see bakeRoomPhoto.
   *  null until baking finishes (or if it can't run), when the raw photo is
   *  shown with the equivalent CSS filter instead. */
  @state() public roomPhotoBaked: string | null = null;
  /** The room whose devices fill the right-side panel. */
  @state() public activeRoomKey: string | null = null;
  /** Overview (1B): the room opened in the full-screen detail slide-over. */
  @state() public detailRoomKey: string | null = null;
  /** Every floor's rooms keyed by their floor-qualified key, rebuilt each Обзор
   *  render — the detail slide-over resolves a card from any floor through it. */
  public overviewRoomByKey = new Map<string, RoomInfo>();
  /** Live clock for the panel header (ticks every 10s). */
  @state() public now = new Date();
  public clockTimer?: number;
  /** Idle screensaver (big clock + home summary) after N minutes of no input. */
  @state() public idle = false;
  public idleTimer?: number;
  /** "Отчёт": a full-screen overlay of every room's temperature line graph. */
  @state() public showReport = false;
  /** Which metric the "Отчёт" grid graphs for every room (its category tab). */
  @state() public reportMetric: 'temp' | 'floor' | 'humidity' = 'temp';
  /** Which metric the room-panel graph shows: 'auto' = air + floor together,
   *  else just the one whose chip was tapped. */
  @state() public sparkMetric: 'auto' | 'temp' | 'floor' | 'humidity' = 'auto';
  /** Transient value (0..100) shown while dragging a slider, before HA confirms. */
  @state() public dragEntity: string | null = null;
  public dragValue = 0;
  @state() public editEntitySearch = '';
  /** Search box for the room's device picker (it lists every HA entity). */
  @state() public editZoneSearch = '';
  @state() public editFurnSearch = '';
  // Whole-floor surface appearance pickers (apply to all walls / all floors).
  @state() public editAllWallColor = '#e8e6e1';
  @state() public editAllWallMat = 'plain';
  @state() public editAllFloorColor = '#cfc7ba';
  @state() public editAllFloorMat = 'plain';
  @state() public importOpen = false;
  @state() public importText = '';
  // Render-quality picker (view mode).
  @state() public qualityMenuOpen = false;
  @state() public qualityChoice: QualityChoice = 'auto';
  // Edit-mode PIN lock (casual tamper-protection on a kiosk/tablet).
  @state() public editUnlocked = false;
  @state() public pinPromptOpen = false;
  @state() public pinError = '';
  @state() public editPinInput = '';
  @state() public projectList: ProjectInfo[] = [];
  @state() public currentProjectId: string | null = null;
  /** Id of the project open in the editor this session (null = unsaved new). */
  @state() public editingProjectId: string | null = null;
  @state() public editPlanName = '';
  @state() public paletteOpen = false;
  @state() public toast?: string;
  // Our own confirm/prompt layer — system alert/confirm/prompt are forbidden.
  @state() public askOpen = false;
  public askData: AskOptions = { title: '' };
  public askResolve?: (value: string | null) => void;
  // "Import from the previous version" (read-only scan of the old integration).
  @state() public legacyOpen = false;
  @state() public legacyBusy = false;
  @state() public legacyFinds: LegacyFind[] = [];
  @state() public legacyErrors: { source: LegacySource; error: string }[] = [];
  public storedProjects: StoredProjects = { projects: {} };
  @query('.viewport') public viewport?: HTMLDivElement;
  public sceneManager?: SceneManager;
  public planLoaded = false;
  public lastHass?: HomeAssistant;
  public pendingHass?: HomeAssistant;
  /** Effective (real + optimistic) state map last pushed to the 3D scene. */
  public lastPushed?: HomeAssistant;
  /** Optimistic overrides: entity_id -> the state we assume until HA confirms
   *  (or a timeout reverts it). Makes controls feel instant. `gen` tags each
   *  override so a stale revert (late reject / old timer) can't clobber a newer
   *  optimistic state chosen by a rapid re-tap. */
  public optimistic = new Map<string, { state: string; timer: ReturnType<typeof setTimeout>; gen: number }>();
  public optGen = 0;
  /** Pending climate setpoints: entity_id -> the target we asked for, plus the
   *  value HA reported when we asked (`base`). The Tuya thermostats here obey
   *  set_temperature — the wall unit moves — but don't report the new target
   *  back for a long time (measured: not within 20s), so reading HA alone
   *  leaves ± looking dead on a stale number. Cleared once HA reports our value
   *  (confirmed) or any other value (someone used the wall unit — that wins). */
  public optTemp = new Map<string, { temp: number; base?: number; timer: ReturnType<typeof setTimeout> }>();
  /** Pending speaker volume (0..1) shown at once so ± feels instant instead of
   *  waiting a round-trip, and so repeated taps step from the pending value.
   *  Cleared when HA reports our value or any other. */
  public optVol = new Map<string, { vol: number; base?: number; timer: ReturnType<typeof setTimeout> }>();
  /** Recent history for a room's bound degree sensors, for the compact sparkline
   *  in the room panel. Keyed by entity_id → sampled [timeMs, value] points +
   *  fetch time. Fetched on demand from HA's history API, refreshed every ~5min.
   *  `ok: false` — архив НЕ ответил (это не то же самое, что «данных нет»). */
  public histCache = new Map<string, { pts: [number, number][]; ts: number; ok?: boolean }>();
  public histInFlight = new Set<string>();
  /** Pending scene teardown after the card leaves the DOM (see disconnectedCallback). */
  public disposeTimer?: number;
  /** Memoised whole-home rollup (humidity / temperature / lights on). Rebuilt
   *  when hass or an optimistic override changes — not per call, and not three
   *  times per render. See homeStats(). */
  public homeStatsCache?: { hass: HomeAssistant; opt: number; hum: string; temp: number | null; on: number };
  public currentPlan?: FloorPlan;
  public editor?: EditorController;
  public toastTimer?: number;

  // --- Hidden Edit entry (long-press top-left corner) ----------------------
  // A deliberate 5s hold enters the editor (then the PIN gate, if set). It's a
  // long-press, NOT a tap count, so it can't clash with a kiosk browser's own
  // multi-tap menu gesture. Moving the finger cancels it.
  public hotspotTimer?: number;
  public hotspotStart?: { x: number; y: number };
  public readonly idleEvents = ['pointerdown', 'keydown', 'wheel', 'touchstart'];
  /** Слушатели на window снимаются ПО ССЫЛКЕ, поэтому это поля-стрелки с
   *  постоянной идентичностью, а не методы: тело живёт в модулях. */
  public trackShift = (e: KeyboardEvent): void => trackShift(this, e);
  public onActivity = (): void => wake(this);
  /** Set when someone closes the alarm with the X. Cleared the moment the house
   *  is back to normal (dry and the supply open), so the NEXT leak alarms again
   *  — an acknowledgement must not silence the sensor for good. */
  @state() public leakAck = false;
  public leakCache?: { hass: unknown; leak: LeakAlarm | null };

  // -- Lovelace API -----------------------------------------------------------

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
    if (this.sceneManager) loadActiveProject(this);
  }

  public getCardSize(): number {
    return 8;
  }

  static getStubConfig(): CardConfig {
    return stubConfig();
  }

  static async getConfigElement() {
    await import('./editor');
    return document.createElement(CARD_EDITOR_TAG);
  }

  // -- Жизненный цикл Lit -----------------------------------------------------

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
      initScene(this);
    }
    // Движок нового конструктора монтируется в место под план — оно появляется
    // только после первой отрисовки его разметки. Здесь же холст 3D ставится
    // на своё место-заглушку (см. syncViewport).
    if (this.editing2) mountEditor2(this);
    // While editing, don't apply live entity updates — they'd churn the
    // edit-copy scene and fight the editor's rebuilds. exitEdit re-syncs.
    if (this.pendingHass && this.sceneManager && this.planLoaded && !this.editing) {
      applyHass(this, this.pendingHass);
      this.pendingHass = undefined;
    }
    // Flash the pin of any room with a wet sensor. Driven from here rather than
    // render() so the scene hears about it only when the set actually changes.
    if (this.sceneManager && !this.editing) {
      const leak = currentLeak(this);
      // Re-arm once the house is genuinely back to normal, so a later leak isn't
      // swallowed by an X someone tapped hours ago.
      if (!leak && this.leakAck) this.leakAck = false;
      // The pin keeps flashing even after the X — closing the panel acknowledges
      // the alarm, it doesn't mean the water stopped.
      this.sceneManager.setAlarmRooms(
        leak
          ? leak.sensors.map((id) => roomOfEntity(this, id)?.key).filter((k): k is string => !!k)
          : [],
      );
    }
    // Anchor the control popup once its real height is known so it can never be
    // clipped by the card's overflow:hidden top/bottom edge.
    if (this.controlOpen) positionControlPopup(this);
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

  public override connectedCallback(): void {
    super.connectedCallback();
    injectFonts();
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
    armIdle(this);
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
      if (!this.isConnected) teardownScene(this);
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
    if (!this.isConnected) teardownScene(this);
  }

  // -- Тонкие обёртки над модулями src/card/** --------------------------------
  //
  // Тела уехали в модули, но САМИ методы остались на элементе по двум
  // причинам: svc / effState / onToggleAll / doEnterEdit / onSetWallThickness
  // дёргают автопроверки прямо у элемента, а t / tx / ic / showToast /
  // cardName / canControl / isRu / uiLocale зовутся из модулей сотни раз —
  // так они пишутся как host.t(…), а не тащат ещё один импорт в каждый файл.

  /** Call a HA service for an entity in the control popup. When `optimisticState`
   *  is given we assume that result immediately (fast UI) and revert if the call
   *  rejects or HA never confirms. */
  public svc(
    domain: string,
    service: string,
    data: Record<string, any> = {},
    entityId?: string,
    optimisticState?: string,
  ): void {
    callService(this, domain, service, data, entityId, optimisticState);
  }

  /** True when this entity belongs to a domain the card may actually control.
   *  Everything else is rendered as information only. */
  public canControl(id: string): boolean {
    return isControllable(id);
  }

  /** Effective (optimistic-aware) state of an entity, for rendering controls. */
  public effState(id: string): string {
    return effectiveState(this, id);
  }

  /** Toggle every device in a category at once: if any is on → all off, else all
   *  on (optimistic + revert-on-fail, like the individual controls). */
  public onToggleAll(ents: { entity_id: string; behavior: string }[]): void {
    toggleAll(this, ents);
  }

  /** Вход в правку. Оба конструктора живут рядом: удержание угла ведёт в
   *  новый (editEntry = 'e2'), прямой вызов — в старый. PIN-замок общий: он
   *  зовёт этот же метод после верного кода. */
  public doEnterEdit(): void {
    if (this.editEntry === 'e2') enterEditor2(this);
    else enterEditNow(this);
  }

  public onSetWallThickness(e: Event): void {
    onSetWallThickness(this, e);
  }

  public showToast(msg: string): void {
    pushToast(this, msg);
  }

  public cardName(id: string, fallback?: string): string {
    return entityCardName(this, id, fallback);
  }

  /** Translate a user-visible string. English is the key + fallback. */
  public t(en: string): string {
    return uiText(this, en);
  }

  /** Bilingual one-liner for text added after RU_STRINGS was written. */
  public tx(ru: string, en: string): string {
    return uiTx(this, ru, en);
  }

  /** Inline SVG icon (shared path set) — never an emoji, so it renders the same
   *  on every tablet/browser instead of a tofu box. */
  public ic(name: string) {
    return svgIcon(name);
  }

  /** True when the UI should be Russian.
   *
   *  This is a BMS product: Russian is the DEFAULT, not something that switches
   *  itself off because Home Assistant happens to be set to English. Set
   *  `language: en` in the card config for English, or `language: auto` for the
   *  old behaviour (follow the HA user, then the browser). */
  public get isRu(): boolean {
    return isRuLang(this);
  }

  /** Локаль для Intl: русская, если интерфейс русский, иначе — из hass. */
  public get uiLocale(): string {
    return localeTag(this);
  }

  // -- Разметка ---------------------------------------------------------------

  protected override render() {
    if (!this.config) return nothing;
    const height = this.config.height ?? '500px';
    const projects = this.config.projects ?? [];

    return html`
      <ha-card
        class=${this.editing
          ? this.editing2 ? 'editing e2' : 'editing'
          : `view ${this.viewMode}${this.viewMode === 'room' && activeRoom(this) ? ' has-room' : ''}${this.viewMode === 'room' && this.roomPhoto ? ' has-photo' : ''}${this.idle ? ' idle' : ''}`}
        style=${this.editing ? '' : `height:${height}`}
      >
        ${this.viewMode === 'room' && this.roomPhoto
          ? html`<div
              class="roombg${this.roomPhotoBaked ? '' : ' raw'}"
              style=${`background-image:url("${(this.roomPhotoBaked ?? this.roomPhoto).replace(/"/g, '%22')}")`}
            ></div>`
          : nothing}
        <!-- В новом конструкторе размер холста задают правила ha-card.e2:
             он встаёт на место-заглушку рядом с планом, а не занимает всю
             карточку, поэтому высота отсюда не навязывается. -->
        <div class="viewport" style=${this.editing && !this.editing2 ? `height:${height}` : ''}></div>

        <!-- Загрузка / сбой с кнопкой «Повторить» / «это пример» / брак в плане.
             Раньше здесь были два молчаливых блока: сырая английская строка
             исключения и предупреждение. См. card/views/plan-state.ts. -->
        ${renderPlanState(this)}

        ${this.editing ? nothing : renderLeakAlert(this)}

        ${this.editing
          ? nothing
          : this.viewMode === 'overview'
            ? html`${renderOverview(this)}${renderDetail(this)}`
            : html`${renderStageChrome(this)}${renderRoomPanel(this)}`}

        ${this.showReport && !this.editing ? renderReport(this) : nothing}

        ${!this.editing && this.idle ? renderScreensaver(this) : nothing}

        ${this.editing && !this.editing2
          ? html`<div class="overlay top-right">
              <button class="btn ic-btn" title=${this.tx('Открыть новый конструктор — план сверху, 3D рядом', 'Open the new editor — top-down plan, 3D beside it')}
                aria-label=${this.tx('Открыть новый конструктор', 'Open the new editor')}
                @click=${() => void openNewEditor(this)}>${this.ic('layers')}<span class="ic-btn-lab">${this.tx('Новый конструктор', 'New editor')}</span></button>
              <button class="btn ic-btn" title=${this.tx('Показать план целиком', 'Reset the view')}
                aria-label=${this.tx('Показать план целиком', 'Reset the view')}
                @click=${() => onResetView(this)}>${this.ic('room')}<span class="ic-btn-lab">${this.t('Reset')}</span></button>
              <div class="quality-wrap">
                <button class="btn ic-btn"
                  title=${this.tx('Качество отрисовки (снизьте, если на планшете дёргается)',
                                  'Render quality (lower it if the view stutters on a tablet)')}
                  aria-label=${this.tx('Качество отрисовки', 'Render quality')}
                  @click=${() => (this.qualityMenuOpen = !this.qualityMenuOpen)}>
                  ${this.ic('gear')}<span class="ic-btn-lab">${qualityLabel(this, this.qualityChoice)}</span>
                </button>
                ${this.qualityMenuOpen
                  ? html`<div class="quality-menu">
                      ${QUALITY_CHOICES.map(
                        (q) => html`<button
                          class="qopt ${q === this.qualityChoice ? 'on' : ''}"
                          @click=${() => onPickQuality(this, q)}>${qualityLabel(this, q)}</button>`,
                      )}
                    </div>`
                  : nothing}
              </div>
              <button class="btn primary ic-btn" title=${this.tx('Сохранить и выйти из редактора', 'Save & exit the editor')}
                aria-label=${this.tx('Сохранить и выйти из редактора', 'Save & exit the editor')}
                @click=${() => exitEdit(this)}>
                ${this.ic('check')}<span class="ic-btn-lab">${this.t('Done & Save')}</span>
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
              @pointerdown=${(e: PointerEvent) => {
                // По умолчанию удержание открывает НОВЫЙ конструктор. Признак
                // ставится до таймера, потому что PIN-замок уводит вход в
                // сторону и возвращается сюда же через doEnterEdit().
                this.editEntry = 'e2';
                onHotspotDown(this, e);
              }}
              @pointermove=${(e: PointerEvent) => onHotspotMove(this, e)}
              @pointerup=${() => onHotspotUp(this)}
              @pointercancel=${() => onHotspotUp(this)}
              @pointerleave=${() => onHotspotUp(this)}
            ></div>`}

        ${this.qualityMenuOpen
          ? html`<div class="menu-backdrop" @click=${() => (this.qualityMenuOpen = false)}></div>`
          : nothing}

        ${this.editing && !this.editing2 ? renderEditor(this) : nothing}

        ${this.editing2 ? renderEditor2(this) : nothing}

        ${this.importOpen
          ? html`<div class="import-modal">
              <div class="import-box">
                <div class="import-title">${this.tx('Импорт и экспорт плана (JSON)', 'Import / Export plan JSON')}</div>
                <textarea
                  class="import-text"
                  spellcheck="false"
                  aria-label=${this.tx('Текст плана в формате JSON', 'Plan JSON text')}
                  placeholder=${this.tx('Вставьте сюда план в формате JSON и нажмите «Загрузить»…',
                                        'Paste a floor-plan JSON here, then press Load…')}
                  .value=${this.importText}
                  @input=${(e: Event) => onImportText(this, e)}
                ></textarea>
                <div class="toolrow">
                  <button class="btn primary ic-btn"
                    aria-label=${this.tx('Загрузить этот план', 'Load this plan')}
                    @click=${() => onImportLoad(this)}>${this.ic('download')}<span class="ic-btn-lab">${this.tx('Загрузить', 'Load')}</span></button>
                  <button class="btn" @click=${() => (this.importOpen = false)}>${this.tx('Отмена', 'Cancel')}</button>
                </div>
              </div>
            </div>`
          : nothing}

        ${this.pinPromptOpen
          ? html`<div class="import-modal" @click=${() => cancelPin(this)}>
              <form class="pin-box" @click=${(e: Event) => e.stopPropagation()} @submit=${(e?: Event) => submitPin(this, e)}>
                <div class="import-title">${this.ic('lockClosed')}<span>${this.tx('Введите PIN редактора', 'Enter the edit PIN')}</span></div>
                <input class="pin-input name-input" type="password" inputmode="numeric"
                  autocomplete="off" placeholder="PIN"
                  aria-label=${this.tx('PIN редактора', 'Edit PIN')} />
                ${this.pinError ? html`<div class="pin-error">${this.pinError}</div>` : nothing}
                <div class="toolrow">
                  <button type="submit" class="btn primary">${this.tx('Открыть', 'Unlock')}</button>
                  <button type="button" class="btn" @click=${() => cancelPin(this)}>${this.tx('Отмена', 'Cancel')}</button>
                </div>
              </form>
            </div>`
          : nothing}

        ${this.legacyOpen ? renderLegacyDialog(this) : nothing}

        ${this.askOpen ? renderAsk(this) : nothing}

        ${this.controlOpen && !this.editing ? renderControlPopup(this) : nothing}

        ${this.toast ? html`<div class="toast">${this.toast}</div>` : nothing}

        ${projects.length > 1
          ? html`
              <div class="overlay top-left">
                <select class="select" aria-label=${this.tx('Объект', 'Project')}
                  @change=${(e: Event) => onSelectProject(this, e)}>
                  ${projects.map(
                    (p) => html`<option value=${p.id} ?selected=${p.id === this.activeProjectId}>
                      ${p.name || p.id}
                    </option>`,
                  )}
                </select>
              </div>
            `
          : nothing}

        ${this.floorNames.length > 1 && this.editing && !this.editing2
          ? html`
              <div class="overlay bottom">
                ${this.floorNames.map(
                  (name, i) => html`
                    <button
                      class="tab ${i === this.activeFloorIndex ? 'active' : ''}"
                      @click=${() => onSelectFloor(this, i)}
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
    stateStyles,
    editor2Styles,
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
