// ---------------------------------------------------------------------------
// МАНЕКЕН ДВИЖКА — ВРЕМЯНКА, УДАЛИТЬ ПРИ СЛИЯНИИ.
//
// Настоящий движок черчения (src/editor2/api.ts) пишет соседний пакет. Чтобы
// оболочку можно было собрать, посмотреть и проверить до слияния, здесь лежит
// манекен: он честно исполняет договор PlanEditor, но УМЕЕТ ТОЛЬКО показать
// план видом сверху и дать выбрать в нём объект. Черчения, привязок к сетке,
// жестов и набора размера у клавиатуры здесь НЕТ и быть не должно — это зона
// движка, и дублировать её значит получить две разные правды.
//
// Всё, что проверяют автопроверки оболочки, идёт через договор
// (updateSelected / setPendingModel / setTool / onSelect), поэтому проверки
// переживут замену манекена на настоящий движок.
// ---------------------------------------------------------------------------

import type { FloorPlan, FloorDef, FurnitureDef, RoomDef, WallDef } from '../types';
import type { PlanEditor, Selection, Tool } from './editor2-api';

const SVG_NS = 'http://www.w3.org/2000/svg';

/** Стабильный идентификатор: договор требует пользоваться id, а не номерами
 *  в массивах. У старых планов их нет — проставляем на загрузке, как это
 *  делает src/editor/ids.ts у прежнего редактора. */
let seq = 0;
function ensureId(obj: { id?: string }, prefix: string): string {
  if (!obj.id) obj.id = `${prefix}${++seq}_${Math.random().toString(36).slice(2, 7)}`;
  return obj.id;
}

function polygonArea(poly: [number, number][]): number {
  let a = 0;
  for (let i = 0; i < poly.length; i++) {
    const [x1, y1] = poly[i];
    const [x2, y2] = poly[(i + 1) % poly.length];
    a += x1 * y2 - x2 * y1;
  }
  return Math.abs(a) / 2;
}

class StubPlanEditor implements PlanEditor {
  private host?: HTMLElement;
  private svg?: SVGSVGElement;
  private plan: FloorPlan = { floors: [] };
  private floorIndex = 0;
  private tool: Tool = 'select';
  private snap = true;
  private pendingModel: string | null = null;
  private selId: string | null = null;
  private selKind: Selection['kind'] | null = null;
  private past: string[] = [];
  private future: string[] = [];
  private changeCb?: (p: FloorPlan) => void;
  private selectCb?: (s: Selection | null) => void;
  private statusCb?: (t: string) => void;

  // -- договор: жизненный цикл ------------------------------------------------

  mount(host: HTMLElement, plan: FloorPlan, floorIndex: number): void {
    this.host = host;
    this.plan = plan;
    this.floorIndex = Math.max(0, Math.min(floorIndex, (plan.floors?.length ?? 1) - 1));
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('class', 'e2-canvas');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    host.replaceChildren(svg);
    this.svg = svg;
    this.zoomToFit();
    this.status(
      'Манекен движка: план показан сверху, объект можно выбрать. Черчение подключит движок.',
    );
  }

  destroy(): void {
    this.host?.replaceChildren();
    this.host = undefined;
    this.svg = undefined;
  }

  // -- договор: инструменты ---------------------------------------------------

  setTool(t: Tool): void {
    this.tool = t;
    if (t === 'select') {
      this.status('Выбор: коснитесь стены, комнаты, проёма или предмета');
    } else if (t === 'furniture') {
      this.status(
        `Инструмент «мебель» подключит движок черчения${
          this.pendingModel ? `; выбрана модель ${this.pendingModel}` : ''
        }`,
      );
    } else {
      this.status(`Инструмент «${t}» подключит движок черчения`);
    }
  }
  getTool(): Tool {
    return this.tool;
  }
  setSnap(on: boolean): void {
    this.snap = on;
    this.status(on ? 'Привязка включена' : 'Привязка выключена');
  }
  getSnap(): boolean {
    return this.snap;
  }
  setFloor(index: number): void {
    if (index < 0 || index >= (this.plan.floors?.length ?? 0)) return;
    this.floorIndex = index;
    this.select(null, null);
    this.zoomToFit();
  }

  zoomToFit(): void {
    const f = this.floor();
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    const pt = (x: number, y: number) => {
      if (!Number.isFinite(x) || !Number.isFinite(y)) return;
      minX = Math.min(minX, x); maxX = Math.max(maxX, x);
      minY = Math.min(minY, y); maxY = Math.max(maxY, y);
    };
    for (const w of f?.walls ?? []) { pt(w.start?.[0], w.start?.[1]); pt(w.end?.[0], w.end?.[1]); }
    for (const r of f?.rooms ?? []) for (const p of r.polygon ?? []) pt(p[0], p[1]);
    for (const it of f?.furniture ?? []) pt(it.position?.[0], it.position?.[2]);
    if (!Number.isFinite(minX)) { minX = 0; minY = 0; maxX = 10; maxY = 8; }
    const pad = Math.max(1, (maxX - minX + maxY - minY) * 0.06);
    this.svg?.setAttribute(
      'viewBox',
      `${minX - pad} ${minY - pad} ${maxX - minX + pad * 2} ${maxY - minY + pad * 2}`,
    );
    this.draw();
  }

  // -- договор: выбранное -----------------------------------------------------

  getSelection(): Selection | null {
    if (!this.selId || !this.selKind) return null;
    const f = this.floor();
    if (!f) return null;
    if (this.selKind === 'wall') {
      const w = (f.walls ?? []).find((x) => x.id === this.selId);
      if (!w) return null;
      const dx = w.end[0] - w.start[0];
      const dy = w.end[1] - w.start[1];
      return {
        kind: 'wall', id: w.id!,
        lengthM: Math.hypot(dx, dy),
        thicknessM: w.thickness ?? 0.12,
        angleDeg: (Math.atan2(dy, dx) * 180) / Math.PI,
        material: w.material, color: w.color,
      };
    }
    if (this.selKind === 'room') {
      const r = (f.rooms ?? []).find((x) => x.id === this.selId);
      if (!r) return null;
      return {
        kind: 'room', id: r.id!, name: r.name,
        areaM2: polygonArea((r.polygon ?? []) as [number, number][]),
        material: r.material, color: r.color,
      };
    }
    if (this.selKind === 'opening') {
      for (const w of f.walls ?? []) {
        const op = (w.openings ?? []).find((o) => o.id === this.selId);
        if (op) {
          return {
            kind: 'opening', id: op.id!, wallId: w.id!, kind2: op.kind,
            widthM: op.width, offsetM: op.position, variant: op.variant,
          };
        }
      }
      return null;
    }
    if (this.selKind === 'furniture') {
      const it = (f.furniture ?? []).find((x) => x.id === this.selId);
      if (!it) return null;
      const sc = Array.isArray(it.scale) ? it.scale[0] : (it.scale ?? 1);
      const bind = (f.bindings ?? []).find((b) => b.anchor_object === it.id);
      return {
        kind: 'furniture', id: it.id!, model: it.model,
        rotationDeg: it.rotation ?? 0, scale: sc, entityId: bind?.entity_id,
      };
    }
    return null;
  }

  updateSelected(patch: Record<string, unknown>): void {
    const f = this.floor();
    const sel = this.getSelection();
    if (!f || !sel) return;
    this.snapshot();
    const num = (v: unknown, fb: number) => (typeof v === 'number' && Number.isFinite(v) ? v : fb);
    if (sel.kind === 'wall') {
      const w = (f.walls ?? []).find((x) => x.id === sel.id)!;
      if ('thicknessM' in patch) w.thickness = num(patch.thicknessM, w.thickness ?? 0.12);
      if ('material' in patch) w.material = String(patch.material ?? '') || undefined;
      if ('color' in patch) w.color = String(patch.color ?? '') || undefined;
      if ('lengthM' in patch || 'angleDeg' in patch) {
        const len = num(patch.lengthM, sel.lengthM);
        const ang = (num(patch.angleDeg, sel.angleDeg) * Math.PI) / 180;
        w.end = [w.start[0] + Math.cos(ang) * len, w.start[1] + Math.sin(ang) * len];
      }
    } else if (sel.kind === 'room') {
      const r = (f.rooms ?? []).find((x) => x.id === sel.id)!;
      if ('name' in patch) r.name = String(patch.name ?? '');
      if ('material' in patch) r.material = String(patch.material ?? '') || undefined;
      if ('color' in patch) r.color = String(patch.color ?? '') || undefined;
    } else if (sel.kind === 'opening') {
      const w = (f.walls ?? []).find((x) => x.id === sel.wallId)!;
      const op = (w.openings ?? []).find((o) => o.id === sel.id)!;
      if ('widthM' in patch) op.width = num(patch.widthM, op.width);
      if ('offsetM' in patch) op.position = num(patch.offsetM, op.position);
      if ('kind2' in patch) op.kind = patch.kind2 as 'door' | 'window' | 'opening';
      if ('variant' in patch) op.variant = String(patch.variant ?? '') || undefined;
    } else if (sel.kind === 'furniture') {
      const it = (f.furniture ?? []).find((x) => x.id === sel.id)!;
      if ('model' in patch) it.model = String(patch.model ?? it.model);
      if ('rotationDeg' in patch) it.rotation = num(patch.rotationDeg, it.rotation ?? 0);
      if ('scale' in patch) it.scale = num(patch.scale, 1);
      if ('entityId' in patch) {
        const eid = patch.entityId ? String(patch.entityId) : '';
        f.bindings = (f.bindings ?? []).filter((b) => b.anchor_object !== it.id);
        if (eid) f.bindings.push({ entity_id: eid, anchor_object: it.id, behavior: 'auto' });
      }
    }
    this.draw();
    this.emitChange();
    this.selectCb?.(this.getSelection());
  }

  deleteSelected(): void {
    const f = this.floor();
    const sel = this.getSelection();
    if (!f || !sel) return;
    this.snapshot();
    if (sel.kind === 'wall') f.walls = (f.walls ?? []).filter((w) => w.id !== sel.id);
    else if (sel.kind === 'room') f.rooms = (f.rooms ?? []).filter((r) => r.id !== sel.id);
    else if (sel.kind === 'furniture') {
      f.furniture = (f.furniture ?? []).filter((x) => x.id !== sel.id);
      f.bindings = (f.bindings ?? []).filter((b) => b.anchor_object !== sel.id);
    } else if (sel.kind === 'opening') {
      const w = (f.walls ?? []).find((x) => x.id === sel.wallId);
      if (w) w.openings = (w.openings ?? []).filter((o) => o.id !== sel.id);
    }
    this.select(null, null);
    this.draw();
    this.emitChange();
  }

  // -- договор: история -------------------------------------------------------

  undo(): void {
    const prev = this.past.pop();
    if (!prev) return;
    this.future.push(JSON.stringify(this.plan.floors));
    this.plan.floors = JSON.parse(prev);
    this.select(null, null);
    this.draw();
    this.emitChange();
  }
  redo(): void {
    const next = this.future.pop();
    if (!next) return;
    this.past.push(JSON.stringify(this.plan.floors));
    this.plan.floors = JSON.parse(next);
    this.select(null, null);
    this.draw();
    this.emitChange();
  }
  canUndo(): boolean {
    return this.past.length > 0;
  }
  canRedo(): boolean {
    return this.future.length > 0;
  }

  setPendingModel(model: string | null): void {
    this.pendingModel = model;
    if (model) this.status(`Модель для расстановки: ${model}`);
  }

  onChange(cb: (p: FloorPlan) => void): void {
    this.changeCb = cb;
  }
  onSelect(cb: (s: Selection | null) => void): void {
    this.selectCb = cb;
  }
  onStatus(cb: (t: string) => void): void {
    this.statusCb = cb;
  }

  // -- внутреннее -------------------------------------------------------------

  private floor(): FloorDef | undefined {
    return this.plan.floors?.[this.floorIndex];
  }
  private status(t: string): void {
    this.statusCb?.(t);
  }
  private snapshot(): void {
    this.past.push(JSON.stringify(this.plan.floors));
    if (this.past.length > 40) this.past.shift();
    this.future.length = 0;
  }
  private emitChange(): void {
    this.changeCb?.(this.plan);
  }
  private select(kind: Selection['kind'] | null, id: string | null): void {
    this.selKind = kind;
    this.selId = id;
    this.selectCb?.(this.getSelection());
  }

  private pick(kind: Selection['kind'], id: string): void {
    this.select(kind, id);
    this.draw();
  }

  private node(tag: string, attrs: Record<string, string | number>): SVGElement {
    const el = document.createElementNS(SVG_NS, tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
    return el;
  }

  private draw(): void {
    const svg = this.svg;
    const f = this.floor();
    if (!svg) return;
    svg.replaceChildren();
    if (!f) return;

    const ul = f.underlay;
    if (ul?.image) {
      const h = ul.widthM * (ul.aspect || 1);
      svg.append(
        this.node('image', {
          href: ul.image, x: (ul.x ?? 0) - ul.widthM / 2, y: (ul.z ?? 0) - h / 2,
          width: ul.widthM, height: h, opacity: ul.opacity ?? 0.6,
          preserveAspectRatio: 'none',
        }),
      );
    }

    for (const r of f.rooms ?? []) {
      const id = ensureId(r as RoomDef, 'r');
      const el = this.node('polygon', {
        points: (r.polygon ?? []).map((p) => `${p[0]},${p[1]}`).join(' '),
        fill: r.color ?? '#3a3f4b',
        'fill-opacity': this.selId === id ? 0.85 : 0.55,
        stroke: this.selId === id ? '#03a9f4' : 'none',
        'stroke-width': 0.06,
        'data-e2': `room:${id}`,
      });
      el.addEventListener('pointerdown', () => this.pick('room', id));
      svg.append(el);
      if (r.name) {
        const cx = (r.polygon ?? []).reduce((s, p) => s + p[0], 0) / Math.max(1, (r.polygon ?? []).length);
        const cy = (r.polygon ?? []).reduce((s, p) => s + p[1], 0) / Math.max(1, (r.polygon ?? []).length);
        const t = this.node('text', {
          x: cx, y: cy, 'font-size': 0.36, fill: '#f2f3f6', 'text-anchor': 'middle',
          'pointer-events': 'none',
        });
        t.textContent = r.name;
        svg.append(t);
      }
    }

    for (const w of f.walls ?? []) {
      const id = ensureId(w as WallDef, 'w');
      const el = this.node('line', {
        x1: w.start[0], y1: w.start[1], x2: w.end[0], y2: w.end[1],
        stroke: this.selId === id ? '#03a9f4' : (w.color ?? '#d8d5cf'),
        'stroke-width': Math.max(0.08, w.thickness ?? 0.12),
        'stroke-linecap': 'square',
        'data-e2': `wall:${id}`,
      });
      el.addEventListener('pointerdown', () => this.pick('wall', id));
      svg.append(el);

      const len = Math.hypot(w.end[0] - w.start[0], w.end[1] - w.start[1]) || 1;
      const ux = (w.end[0] - w.start[0]) / len;
      const uy = (w.end[1] - w.start[1]) / len;
      for (const op of w.openings ?? []) {
        const oid = ensureId(op, 'o');
        const x1 = w.start[0] + ux * op.position;
        const y1 = w.start[1] + uy * op.position;
        const oel = this.node('line', {
          x1, y1, x2: x1 + ux * op.width, y2: y1 + uy * op.width,
          stroke: this.selId === oid ? '#03a9f4' : op.kind === 'window' ? '#5bb8e8' : '#f3a83c',
          'stroke-width': Math.max(0.14, (w.thickness ?? 0.12) * 1.4),
          'stroke-linecap': 'butt',
          'data-e2': `opening:${oid}`,
        });
        oel.addEventListener('pointerdown', (e) => { e.stopPropagation(); this.pick('opening', oid); });
        svg.append(oel);
      }
    }

    for (const it of f.furniture ?? []) {
      const id = ensureId(it as FurnitureDef, 'f');
      const s = (Array.isArray(it.scale) ? it.scale[0] : (it.scale ?? 1)) * 0.5;
      const el = this.node('rect', {
        x: (it.position?.[0] ?? 0) - s / 2, y: (it.position?.[2] ?? 0) - s / 2,
        width: s, height: s, rx: 0.06,
        transform: `rotate(${it.rotation ?? 0} ${it.position?.[0] ?? 0} ${it.position?.[2] ?? 0})`,
        fill: this.selId === id ? '#03a9f4' : (it.color ?? '#8d94a3'),
        'data-e2': `furniture:${id}`,
      });
      el.addEventListener('pointerdown', () => this.pick('furniture', id));
      svg.append(el);
    }
  }
}

export function createPlanEditor(): PlanEditor {
  return new StubPlanEditor();
}
