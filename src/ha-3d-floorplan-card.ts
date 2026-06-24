// ---------------------------------------------------------------------------
// <ha-3d-floorplan-card> — the custom Lovelace card entry point.
// ---------------------------------------------------------------------------

import { LitElement, html, css, PropertyValues, nothing } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';
import type {
  CardConfig,
  FloorPlan,
  HomeAssistant,
  ProjectRef,
  RoomDef,
  RoomShape,
} from './types';
import { SceneManager, ClickResult } from './scene/scene-manager';
import { clickToService } from './scene/bindings';
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
  ProjectInfo,
  StoredProjects,
} from './storage';
import { FURNITURE_KEYS, LIGHT_KEYS, entityDomainsFor } from './furniture/library';
import { getThumbnail } from './furniture/thumbnails';
import { WALL_MATERIALS, FLOOR_MATERIALS } from './scene/materials';

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
  @state() private editSelectedKind: 'furniture' | 'wall' | 'room' | null = null;
  @state() private editSelectedColor: string | null = null;
  @state() private editSelectedWallLength: number | null = null;
  @state() private editRoom: RoomDef | null = null;
  @state() private editFurnScale: [number, number, number] | null = null;
  @state() private editMaterial = 'plain';
  @state() private editCanUndo = false;
  @state() private editCanRedo = false;
  @state() private importOpen = false;
  @state() private importText = '';
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
  }

  private applyHass(hass: HomeAssistant): void {
    if (!this.sceneManager) return;
    if (!this.lastHass) {
      // First sync: push everything.
      this.sceneManager.syncAll(hass);
    } else {
      // Targeted: only update entities whose state object reference changed.
      for (const id in hass.states) {
        if (hass.states[id] !== this.lastHass.states[id]) {
          this.sceneManager.updateEntity(id, hass);
        }
      }
    }
    this.lastHass = hass;
  }

  // -- Scene setup ------------------------------------------------------------

  private initScene(): void {
    if (!this.viewport) return;
    const bg = this.config?.background ?? '#1b1d22';
    this.sceneManager = new SceneManager(this.viewport, bg);
    this.sceneManager.setPickHandler((r) => this.handlePick(r));
    this.sceneManager.start();
    this.loadActiveProject();
  }

  private async loadActiveProject(): Promise<void> {
    if (!this.config || !this.sceneManager) return;
    this.loadError = undefined;
    this.planLoaded = false;
    try {
      const plan = await this.resolvePlan();
      this.currentPlan = plan;
      this.sceneManager.loadPlan(plan);
      this.floorNames = plan.floors.map((f, i) => f.name || `Floor ${i + 1}`);
      this.activeFloorIndex = 0;
      this.planLoaded = true;
      // Push current state into the freshly built scene.
      if (this.hass) {
        this.lastHass = undefined;
        this.applyHass(this.hass);
      }
    } catch (err: any) {
      this.loadError = err?.message ?? String(err);
      console.error('[3d-floorplan] load failed:', err);
    }
  }

  private async resolvePlan(): Promise<FloorPlan> {
    const cfg = this.config!;
    if (cfg.projects && cfg.projects.length) {
      const proj =
        cfg.projects.find((p) => p.id === this.activeProjectId) ?? cfg.projects[0];
      return this.loadProjectRef(proj);
    }
    if (cfg.plan) return cfg.plan;
    if (cfg.url) return this.fetchPlan(cfg.url);
    // Nothing configured → named projects (HA shared / localStorage) or demo.
    this.storedProjects = await loadProjects(this.hass);
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
    if (!r || !this.hass) return;
    const ent = this.hass.states[r.entity_id];

    // Lock toggles need current state.
    if (r.behavior === 'lock' && ent) {
      const service = ent.state === 'locked' ? 'unlock' : 'lock';
      this.hass.callService('lock', service, { entity_id: r.entity_id });
      return;
    }

    const call = clickToService(r.entity_id, r.behavior as any);
    if (call) {
      this.hass.callService(call.domain, call.service, call.data);
    } else {
      this.fireMoreInfo(r.entity_id);
    }
  }

  private fireMoreInfo(entityId: string): void {
    const event = new CustomEvent('hass-more-info', {
      detail: { entityId },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
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

  // -- Editor -----------------------------------------------------------------

  private enterEdit(): void {
    if (!this.sceneManager || !this.currentPlan) return;
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
      this.editSelectedColor = ed.selectedColor;
      this.editSelectedWallLength = ed.selectedWallLength;
      this.editRoom = ed.selectedRoomData;
      this.editFurnScale = ed.selectedFurnitureScale as [number, number, number] | null;
      this.editMaterial = ed.selectedMaterial;
      this.editFloorIndex = ed.floorIndex;
      this.editPlanName = ed.plan.name ?? '';
      this.editCanUndo = ed.canUndo;
      this.editCanRedo = ed.canRedo;
      this.requestUpdate();
    };
    this.editor.onMessage = (m) => this.showToast(m);
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
      if (this.hass) {
        this.lastHass = undefined;
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
      plan = JSON.parse(this.importText) as FloorPlan;
      if (!plan || !Array.isArray(plan.floors) || plan.floors.length === 0) {
        throw new Error('Plan must have a non-empty "floors" array');
      }
    } catch (err: any) {
      this.showToast(`Import failed: ${err?.message ?? 'invalid JSON'}`);
      return;
    }
    if (!this.editor) this.enterEdit();
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

  private onSetWallLength(e: Event): void {
    const v = parseFloat((e.target as HTMLInputElement).value);
    if (!Number.isNaN(v) && v > 0) this.editor?.setWallLength(v);
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

  private onSetRoomField(
    field: 'name' | 'width' | 'depth' | 'height' | 'rotation',
    e: Event,
  ): void {
    this.editor?.setRoomField(field, (e.target as HTMLInputElement).value);
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
    ids = [...ids].sort((a, b) => this.entityLabel(a).localeCompare(this.entityLabel(b)));
    return { ids, fellBack };
  }

  private entityLabel(id: string): string {
    return this.hass?.states[id]?.attributes?.friendly_name || id;
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

  public override connectedCallback(): void {
    super.connectedCallback();
    this.sceneManager?.start();
    window.addEventListener('keydown', this.trackShift);
    window.addEventListener('keyup', this.trackShift);
  }

  public override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.sceneManager?.stop();
    window.removeEventListener('keydown', this.trackShift);
    window.removeEventListener('keyup', this.trackShift);
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
        <div class="toolrow">
          <button class="btn" title="Undo (Ctrl+Z)" ?disabled=${!this.editCanUndo}
            @click=${this.onUndo}>↶ Undo</button>
          <button class="btn" title="Redo (Ctrl+Y)" ?disabled=${!this.editCanRedo}
            @click=${this.onRedo}>↷ Redo</button>
          <button class="btn" title="Merge duplicate / overlapping walls into one"
            @click=${this.onMergeWalls}>🧹 Merge walls</button>
        </div>
        <div class="toolrow">
          <button class="btn ${tool === 'wall' ? 'active' : ''}" title="Draw walls"
            @click=${() => this.onEditTool('wall')}>▟ Wall</button>
          <button class="btn ${tool === 'door' ? 'active' : ''}" title="Add a door — tap a wall"
            @click=${() => this.onEditTool('door')}>🚪 Door</button>
          <button class="btn ${tool === 'window' ? 'active' : ''}" title="Add a window — tap a wall"
            @click=${() => this.onEditTool('window')}>🪟 Window</button>
          <button class="btn ${tool === 'furniture' ? 'active' : ''}" title="Place furniture"
            @click=${() => this.onEditTool('furniture')}>🛋 Furniture</button>
          <button class="btn ${tool === 'select' ? 'active' : ''}" title="Select / move / bind (camera always works: drag empty = orbit)"
            @click=${() => this.onEditTool('select')}>☝ Select</button>
        </div>
        <span class="hint">Camera always on: drag empty space = orbit · two fingers = pan/zoom · tap = act</span>

        <div class="panel-group">Building Parts — drop a room</div>
        <div class="toolrow">
          <button class="btn" title="Rectangle room" @click=${() => this.onAddRoomShape('rect')}>▭ Rect</button>
          <button class="btn" title="L-shaped room" @click=${() => this.onAddRoomShape('lshape')}>L L-shape</button>
          <button class="btn" title="Bevelled room" @click=${() => this.onAddRoomShape('bevel')}>⬡ Bevel</button>
          <span class="hint">then drag / rotate / resize it</span>
        </div>

        ${(() => {
          // Derive the floor list from the LIVE edit plan (not View-mode state),
          // so it stays correct after New / project switch while editing.
          const efloors = this.editor?.plan.floors ?? [];
          return html`<div class="toolrow">
            <span class="hint">Floor:</span>
            ${efloors.length > 1
              ? html`<select class="select" @change=${this.onSelectEditFloor}>
                  ${efloors.map(
                    (f, i) => html`<option value=${i} ?selected=${i === this.editFloorIndex}>
                      ${f.name || `Floor ${i + 1}`}
                    </option>`,
                  )}
                </select>`
              : html`<span class="hint">${efloors[0]?.name || 'Ground'}</span>`}
            <button class="btn" title="Add a floor above" @click=${this.onAddFloor}>➕ Floor</button>
            ${efloors.length > 1
              ? html`<button class="btn" title="Delete this floor" @click=${this.onDeleteFloor}>🗑</button>`
              : nothing}
          </div>`;
        })()}

        ${tool === 'wall'
          ? html`<div class="toolrow">
              <button class="btn" title="Remove the last wall" @click=${this.onUndoPoint}>⤺ Undo wall</button>
              <button class="btn ${this.editSnap ? 'active' : ''}"
                title="Snap assist: parallel/perpendicular angles, equal lengths, alignment"
                @click=${this.onToggleSnap}>🧲 Snap</button>
              <span class="hint">tap 2 points = 1 wall (auto)</span>
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
              ? html`<div class="palette">
                  <div class="palette-group">Lighting</div>
                  <div class="palette-grid">
                    ${LIGHT_KEYS.map((k) => this.renderPaletteCell(k, label(k)))}
                  </div>
                  <div class="palette-group">Furniture</div>
                  <div class="palette-grid">
                    ${furnitureKeys.map((k) => this.renderPaletteCell(k, label(k)))}
                  </div>
                </div>`
              : nothing}`
          : nothing}

        ${hasSelection
          ? html`<div class="toolrow">
              <span class="hint">${kind} selected</span>
              ${isFurniture
                ? html`<button class="btn" title="Rotate 45°" @click=${this.onRotateSelected}>⟳ Rotate</button>
                    <button class="btn" title="Lower" @click=${() => this.onNudgeHeight(-0.1)}>▼ Down</button>
                    <button class="btn" title="Raise" @click=${() => this.onNudgeHeight(0.1)}>▲ Up</button>`
                : nothing}
              ${kind !== 'room'
                ? html`<button class="btn" title="Delete" @click=${this.onDeleteSelected}>🗑 Delete</button>`
                : nothing}
            </div>
            <div class="toolrow">
              <span class="hint">Color:</span>
              <input
                class="color"
                type="color"
                .value=${this.editSelectedColor ?? (kind === 'room' ? '#cfc7ba' : kind === 'wall' ? '#e6e6e6' : '#ffffff')}
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
            </div>
            ${isFurniture && this.editFurnScale
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
                  return html`<div class="toolrow">
                      <select class="select wide" @change=${this.onPickEntity}>
                        <option value="" ?selected=${!this.editSelectedEntity}>
                          — bind entity —
                        </option>
                        ${ids.map(
                          (id) => html`<option value=${id} ?selected=${id === this.editSelectedEntity}>
                            ${this.entityLabel(id)}
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
      </div>
    `;
  }

  // -- Render -----------------------------------------------------------------

  protected override render() {
    if (!this.config) return nothing;
    const height = this.config.height ?? '500px';
    const projects = this.config.projects ?? [];

    return html`
      <ha-card>
        <div class="viewport" style="height:${height}"></div>

        ${this.loadError
          ? html`<div class="error">⚠ ${this.loadError}</div>`
          : nothing}

        <div class="overlay top-right">
          <button class="btn" title="Reset view" @click=${this.onResetView}>
            ⌂ Reset
          </button>
          ${this.editing
            ? html`<button class="btn primary" title="Save & exit editor" @click=${this.exitEdit}>
                ✓ Done &amp; Save
              </button>`
            : html`<button class="btn" title="Edit floor plan" @click=${this.enterEdit}>
                ✎ Edit
              </button>`}
        </div>

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

        ${this.floorNames.length > 1 && !this.editing
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
    ha-card {
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
      border-radius: 12px;
      background: rgba(22, 24, 28, 0.86);
      border: 1px solid rgba(255, 255, 255, 0.12);
      backdrop-filter: blur(6px);
      -webkit-overflow-scrolling: touch;
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
      max-height: 60vh;
      overflow: auto;
      backdrop-filter: blur(6px);
      max-width: 340px;
    }
    .palette-group,
    .panel-group {
      font-size: 12px;
      font-weight: 600;
      color: #9ab;
      margin: 6px 2px 4px;
    }
    .palette-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, 76px);
      gap: 6px;
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
