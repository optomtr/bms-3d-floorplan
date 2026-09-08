// ---------------------------------------------------------------------------
// Редактор планировки видом сверху — сборка целиком.
//
// Здесь сходятся камера, ввод, экранный слой и правки плана. Сам файл почти не
// содержит логики инструментов: она в tool-draw.ts и tool-select.ts, и приходит
// сюда через узкий ToolHost. Причина простая — этот файл обязан оставаться тем
// местом, где видно ЖИЗНЕННЫЙ ЦИКЛ (что происходит при монтировании, при
// правке, при отмене), а не тем, где тонут детали черчения.
//
// Движок ничего не знает про Lit, Home Assistant и карточку: на входе узел DOM
// и план, на выходе — план и события.
// ---------------------------------------------------------------------------

import type { FloorDef, FloorPlan, Vec2 } from '../types';
import { snapPoint } from '../editor/snapping';
import { ensurePlanIds, syncAttachments } from '../editor/ids';
import { PlanHistory, type PlanSnapshot } from '../editor/history';
import type { BindRequest, PlanEditor, Selection, Tool } from './api';
import { buildChrome } from './chrome';
import { bboxOfFloor } from './geom';
import { PICK_PX } from './hit';
import { Hud } from './hud';
import type { AreaMode, SnapHit, ToolHost } from './host';
import { emptyDrag } from './host';
import { InputController } from './input';
import { OPENING_PRESETS, floorAt } from './model';
import { wallHeightOf } from './place';
import { RULER, renderScene } from './render';
import { applyPatch, buildSelection, deleteSel, selectionAlive } from './selection';
import { emptyDraft, type SelRef } from './state';
import {
  drawAnswerRoom,
  drawCancel,
  drawCommitFields,
  drawDragEnd,
  drawDragStart,
  drawFields,
  drawFinish,
  drawHover,
  drawModes,
  drawStatus,
  drawTap,
} from './tool-draw';
import { selectDragEnd, selectDragMove, selectDragStart, selectStatus, selectTap } from './tool-select';
import { View } from './view';

export class PlanEditorImpl implements PlanEditor, ToolHost {
  readonly view = new View();
  readonly draft = emptyDraft();
  readonly drag = emptyDrag();
  tool: Tool = 'select';
  roomMode: AreaMode = 'rect';
  zoneMode: AreaMode = 'rect';
  snapOn = true;
  pendingModel: string | null = null;

  private root: HTMLDivElement | null = null;
  private svg: SVGSVGElement | null = null;
  private hud: Hud | null = null;
  private input: InputController | null = null;
  private ro: ResizeObserver | null = null;

  private plan: FloorPlan | null = null;
  private floorIndex = 0;
  private sel: SelRef | null = null;
  private readonly history = new PlanHistory();
  private dragShot: PlanSnapshot | null = null;
  private rectByDrag = false;
  private cursorPx: [number, number] | null = null;
  private override: string | null = null;
  private lastStatus = '';
  private raf = 0;

  private readonly changeCbs: Array<(p: FloorPlan) => void> = [];
  private readonly selectCbs: Array<(s: Selection | null) => void> = [];
  private readonly statusCbs: Array<(t: string) => void> = [];
  private readonly bindCbs: Array<(r: BindRequest) => void> = [];

  // --- жизненный цикл -----------------------------------------------------

  mount(host: HTMLElement, plan: FloorPlan, floorIndex: number): void {
    this.destroy();
    this.plan = plan;
    this.floorIndex = Math.max(0, floorIndex | 0);
    // Стабильные id — условие работы всего остального: по ним живут выделение,
    // проёмы и привязки. Планы клиентов приходят и без них.
    ensurePlanIds(plan);

    const { root, svg, hud } = buildChrome(host, this.tool, {
      onMode: (id) => this.onMode(id),
      onSnapToggle: () => this.setSnap(!this.snapOn),
      onFit: () => this.zoomToFit(),
      onZoom: (dir) => {
        this.view.zoomAt(this.view.w / 2, this.view.h / 2, dir > 0 ? 1.3 : 1 / 1.3);
        this.schedule();
      },
      onCommitFields: (values) => {
        this.override = null;
        drawCommitFields(this, values);
        hud.blurFields();
        this.schedule();
      },
      onAsk: (yes) => drawAnswerRoom(this, yes),
    });
    this.root = root;
    this.svg = svg;
    this.hud = hud;
    this.view.setSize(root.clientWidth || 800, root.clientHeight || 600);
    this.input = new InputController(svg, this.view, {
      onHover: (p, at) => this.onHover(p, at),
      onTap: (p, at) => this.onTap(p, at),
      onDoubleTap: () => this.onDoubleTap(),
      onDragStart: (p, at) => this.onDragStart(p, at),
      onDragMove: (p, at) => this.onDragMove(p, at),
      onDragEnd: (p, at) => this.onDragEnd(p, at),
      onCancel: () => this.onCancel(),
      onView: () => this.schedule(),
    });
    if (typeof ResizeObserver !== 'undefined') {
      this.ro = new ResizeObserver(() => this.schedule());
      this.ro.observe(root);
    }
    hud.setSnap(this.snapOn);
    this.zoomToFit();
  }

  destroy(): void {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.input?.destroy();
    this.ro?.disconnect();
    this.hud?.destroy();
    this.root?.remove();
    this.input = null;
    this.ro = null;
    this.hud = null;
    this.root = null;
    this.svg = null;
    this.plan = null;
    this.sel = null;
  }

  // --- договор ------------------------------------------------------------

  setTool(t: Tool): void {
    if (t === this.tool) return;
    drawCancel(this);
    this.tool = t;
    this.draft.mode = 'none';
    this.draft.model = this.pendingModel;
    if (t === 'door' || t === 'window' || t === 'opening') {
      this.draft.kind = t;
      this.draft.width = OPENING_PRESETS[t].width;
    }
    this.override = null;
    this.root?.setAttribute('data-tool', t);
    this.schedule();
  }

  getTool(): Tool {
    return this.tool;
  }

  setSnap(on: boolean): void {
    this.snapOn = !!on;
    this.hud?.setSnap(this.snapOn);
    this.schedule();
  }

  getSnap(): boolean {
    return this.snapOn;
  }

  setFloor(index: number): void {
    this.floorIndex = Math.max(0, index | 0);
    this.select(null);
    drawCancel(this);
    this.zoomToFit();
  }

  zoomToFit(): void {
    this.syncSize();
    this.view.fit(bboxOfFloor(this.floor()), Math.max(RULER + 12, 44));
    this.schedule();
  }

  getSelection(): Selection | null {
    return buildSelection(this.floor(), this.sel);
  }

  updateSelected(patch: Record<string, unknown>): void {
    const floor = this.floor();
    const sel = this.sel;
    if (!floor || !sel) return;
    this.edit(() => {
      applyPatch(floor, sel, patch, this.wallHeight());
    });
    this.emitSelect();
  }

  deleteSelected(): void {
    const floor = this.floor();
    const sel = this.sel;
    if (!floor || !sel) return;
    this.edit(() => {
      deleteSel(floor, sel);
    });
    this.select(null);
  }

  undo(): void {
    if (!this.plan) return;
    const next = this.history.undo(this.plan);
    if (next) this.adopt(next);
  }

  redo(): void {
    if (!this.plan) return;
    const next = this.history.redo(this.plan);
    if (next) this.adopt(next);
  }

  canUndo(): boolean {
    return this.history.canUndo;
  }

  canRedo(): boolean {
    return this.history.canRedo;
  }

  setPendingModel(model: string | null): void {
    this.pendingModel = model ? String(model) : null;
    this.draft.model = this.pendingModel;
    this.schedule();
  }

  onChange(cb: (plan: FloorPlan) => void): void {
    this.changeCbs.push(cb);
  }

  onSelect(cb: (sel: Selection | null) => void): void {
    this.selectCbs.push(cb);
  }

  onStatus(cb: (text: string) => void): void {
    this.statusCbs.push(cb);
  }

  onBindRequest(cb: (req: BindRequest) => void): void {
    this.bindCbs.push(cb);
  }

  // --- дополнения сверх договора (нужны стенду и проверкам) ---------------

  getPlan(): FloorPlan | null {
    return this.plan;
  }

  getStatus(): string {
    return this.lastStatus;
  }

  worldToClient(x: number, y: number): { x: number; y: number } {
    const r = this.svg?.getBoundingClientRect();
    return { x: (r?.left ?? 0) + this.view.sx(x), y: (r?.top ?? 0) + this.view.sy(y) };
  }

  clientToWorld(x: number, y: number): { x: number; y: number } {
    const r = this.svg?.getBoundingClientRect();
    const p = this.view.toWorld(x - (r?.left ?? 0), y - (r?.top ?? 0));
    return { x: p[0], y: p[1] };
  }

  // --- ToolHost -----------------------------------------------------------

  floor(): FloorDef | null {
    return floorAt(this.plan, this.floorIndex);
  }

  wallHeight(): number {
    return wallHeightOf(this.plan, this.floor());
  }

  edit(fn: () => void): void {
    const plan = this.plan;
    if (!plan) return;
    const before = this.history.snapshot(plan);
    fn();
    const floor = this.floor();
    if (floor) syncAttachments(floor);
    this.history.commitIfChanged(before, plan);
    this.afterChange();
  }

  beginDrag(): void {
    if (this.plan) this.dragShot = this.history.snapshot(this.plan);
  }

  dragMutate(fn: () => void): void {
    fn();
    this.schedule();
  }

  endDrag(): void {
    const plan = this.plan;
    const before = this.dragShot;
    this.dragShot = null;
    if (!plan || !before) return;
    const floor = this.floor();
    if (floor) syncAttachments(floor);
    if (this.history.commitIfChanged(before, plan)) this.afterChange();
    else this.schedule();
  }

  select(ref: SelRef | null): void {
    const same = ref?.kind === this.sel?.kind && ref?.id === this.sel?.id;
    this.sel = ref;
    if (!same) this.emitSelect();
    this.schedule();
  }

  selection(): SelRef | null {
    return this.sel;
  }

  setStatus(text: string): void {
    this.override = text;
    this.schedule();
  }

  refresh(): void {
    this.schedule();
  }

  snapWorld(p: Vec2, chain: Vec2[]): SnapHit {
    // Привязка выключена — точка встаёт РОВНО туда, куда ткнули. Ни сетки, ни
    // «доводки» к соседям: выключатель должен выключать, а не смягчать.
    if (!this.snapOn) return { pt: [p[0], p[1]], joined: false };
    const floor = this.floor();
    const r = snapPoint(p[0], p[1], { walls: floor?.walls ?? [], chain, enabled: true });
    return { pt: r.pt, joined: r.joined };
  }

  pickTol(): number {
    return PICK_PX / this.view.scale;
  }

  askRoom(ring: Vec2[] | null): void {
    this.draft.pendingRing = ring && ring.length >= 3 ? ring : null;
    this.schedule();
  }

  requestBinding(id: string, model: string): void {
    for (const cb of this.bindCbs) cb({ id, model });
  }

  // --- ввод ---------------------------------------------------------------

  private onHover(p: Vec2, at: [number, number]): void {
    this.cursorPx = at;
    if (this.tool !== 'select') drawHover(this, p);
    this.schedule();
  }

  private onTap(p: Vec2, at: [number, number]): void {
    this.cursorPx = at;
    this.override = null;
    if (this.tool === 'select') selectTap(this, p);
    else drawTap(this, p);
    this.schedule();
  }

  private onDoubleTap(): void {
    // Незаконченная цепочка важнее камеры: двойным касанием её и завершают.
    if (this.draft.pts.length) {
      drawFinish(this);
      return;
    }
    this.zoomToFit();
  }

  private onDragStart(p: Vec2, at: [number, number]): void {
    this.override = null;
    if (this.tool === 'select') selectDragStart(this, p, at);
    else this.rectByDrag = drawDragStart(this, p);
    this.schedule();
  }

  private onDragMove(p: Vec2, at: [number, number]): void {
    this.cursorPx = at;
    if (this.tool === 'select') selectDragMove(this, p);
    else drawHover(this, p);
    this.schedule();
  }

  private onDragEnd(p: Vec2, at: [number, number]): void {
    this.cursorPx = at;
    if (this.tool === 'select') selectDragEnd(this);
    else if (!drawDragEnd(this, p)) drawTap(this, p);
    this.rectByDrag = false;
    this.schedule();
  }

  private onCancel(): void {
    if (this.drag.kind !== 'none') selectDragEnd(this);
    if (this.rectByDrag) {
      this.draft.a = null;
      this.rectByDrag = false;
    }
    this.schedule();
  }

  // --- кнопки ------------------------------------------------------------

  private onMode(id: string): void {
    if (id === 'cancel') {
      drawCancel(this);
      this.schedule();
      return;
    }
    if (id === 'finish') {
      drawFinish(this);
      return;
    }
    if (id.startsWith('mode:')) {
      const mode = id.slice(5) as AreaMode;
      if (this.tool === 'zone') this.zoneMode = mode === 'fill' ? 'poly' : mode;
      else this.roomMode = mode;
      drawCancel(this);
      this.schedule();
    }
  }

  // --- отрисовка и события ------------------------------------------------

  private adopt(next: FloorPlan): void {
    const p = this.plan;
    if (!p) return;
    // Объект плана сохраняем ТОТ ЖЕ: у оболочки на него ссылка, и подмена
    // молча оставила бы её на прошлом состоянии.
    for (const k of Object.keys(p)) delete (p as unknown as Record<string, unknown>)[k];
    Object.assign(p, next);
    this.afterChange();
  }

  private afterChange(): void {
    if (this.sel && !selectionAlive(this.floor(), this.sel)) this.select(null);
    for (const cb of this.changeCbs) if (this.plan) cb(this.plan);
    this.schedule();
  }

  private emitSelect(): void {
    const s = this.getSelection();
    for (const cb of this.selectCbs) cb(s);
  }

  private syncSize(): void {
    if (!this.root) return;
    this.view.setSize(this.root.clientWidth || this.view.w, this.root.clientHeight || this.view.h);
  }

  private schedule(): void {
    if (this.raf || !this.svg) return;
    this.raf = requestAnimationFrame(() => {
      this.raf = 0;
      this.draw();
    });
  }

  private draw(): void {
    if (!this.svg || !this.root) return;
    this.syncSize();
    const { w, h } = this.view;
    this.svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    this.svg.innerHTML = renderScene({
      floor: this.floor(),
      view: this.view,
      sel: this.sel,
      draft: this.draft,
      cursorPx: this.cursorPx,
    });
    const hud = this.hud;
    if (!hud) return;
    hud.setModes(this.tool === 'select' ? [] : drawModes(this));
    const fields = this.tool === 'select' ? null : drawFields(this);
    hud.setFields(fields, this.cursorPx);
    hud.ask(this.draft.pendingRing ? 'Контур замкнут. Сделать из него комнату?' : null);
    const text = this.override ?? (this.tool === 'select' ? selectStatus(this) : drawStatus(this));
    hud.setStatus(text);
    if (text !== this.lastStatus) {
      this.lastStatus = text;
      for (const cb of this.statusCbs) cb(text);
    }
  }
}
