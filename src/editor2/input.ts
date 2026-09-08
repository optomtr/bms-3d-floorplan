// ---------------------------------------------------------------------------
// Жесты и мышь.
//
// Договор, из-за которого старый редактор был непригоден на планшете:
//   • ОДИН палец / левая кнопка — ВСЕГДА инструмент, никогда камера;
//   • ДВА пальца — панорама и масштаб одновременно;
//   • у мыши — колесо на масштаб и ПРАВАЯ (или средняя) кнопка на панораму;
//   • двойное касание — вписать всё.
//
// Клавиш-модификаторов здесь нет ни одной. Ни shiftKey, ни ctrlKey, ни altKey
// не читаются нигде в движке: на планшете их не существует, а вся привязка
// висела именно на Shift.
// ---------------------------------------------------------------------------

import type { Vec2 } from '../types';
import type { View } from './view';

export interface InputHandlers {
  onHover(p: Vec2, at: [number, number]): void;
  onTap(p: Vec2, at: [number, number]): void;
  onDoubleTap(p: Vec2, at: [number, number]): void;
  onDragStart(p: Vec2, at: [number, number]): void;
  onDragMove(p: Vec2, at: [number, number]): void;
  onDragEnd(p: Vec2, at: [number, number]): void;
  /** Жест перехвачен камерой (вторым пальцем) или отменён системой. */
  onCancel(): void;
  /** Камера сдвинулась — перерисовать. */
  onView(): void;
}

/** Порог, после которого касание считается тягой, а не нажатием. */
const DRAG_PX = 6;
/** Окно двойного касания. */
const DOUBLE_MS = 320;
const DOUBLE_PX = 26;

interface Pt {
  x: number;
  y: number;
}

export class InputController {
  private pointers = new Map<number, Pt>();
  private mode: 'idle' | 'tool' | 'pan' | 'pinch' = 'idle';
  private toolId = -1;
  private start: Pt = { x: 0, y: 0 };
  private dragging = false;
  private panPrev: Pt = { x: 0, y: 0 };
  private pinchDist = 0;
  private pinchMid: Pt = { x: 0, y: 0 };
  /** После пинча оставшийся палец игнорируем до полного отрыва — иначе план
   *  прыгает под последним пальцем в момент, когда второй уже убрали. */
  private muted = false;
  private lastTap = { t: 0, x: 0, y: 0 };
  private readonly off: Array<() => void> = [];

  constructor(
    private readonly el: Element,
    private readonly view: View,
    private readonly h: InputHandlers,
  ) {
    this.bind('pointerdown', this.down as EventListener);
    this.bind('pointermove', this.move as EventListener);
    this.bind('pointerup', this.up as EventListener);
    this.bind('pointercancel', this.cancel as EventListener);
    this.bind('pointerleave', this.leave as EventListener);
    this.bind('wheel', this.wheel as EventListener, { passive: false });
    this.bind('contextmenu', this.ctx as EventListener);
  }

  private bind(type: string, fn: EventListener, opts?: AddEventListenerOptions): void {
    this.el.addEventListener(type, fn, opts);
    this.off.push(() => this.el.removeEventListener(type, fn, opts));
  }

  destroy(): void {
    for (const f of this.off) f();
    this.off.length = 0;
    this.pointers.clear();
  }

  private local(ev: PointerEvent | WheelEvent): Pt {
    const r = this.el.getBoundingClientRect();
    return { x: ev.clientX - r.left, y: ev.clientY - r.top };
  }

  private world(p: Pt): Vec2 {
    return this.view.toWorld(p.x, p.y);
  }

  private down = (ev: PointerEvent): void => {
    ev.preventDefault();
    const p = this.local(ev);
    this.pointers.set(ev.pointerId, p);
    try {
      (this.el as Element & { setPointerCapture(id: number): void }).setPointerCapture(ev.pointerId);
    } catch {
      /* захват не обязателен — без него просто менее надёжная тяга */
    }

    // Правая и средняя кнопки мыши — камера. Левая никогда.
    if (ev.pointerType === 'mouse' && (ev.button === 1 || ev.button === 2)) {
      this.mode = 'pan';
      this.panPrev = p;
      return;
    }
    if (this.pointers.size >= 2) {
      if (this.mode === 'tool') this.h.onCancel();
      this.mode = 'pinch';
      this.muted = true;
      this.syncPinch();
      return;
    }
    if (this.muted) return;
    this.mode = 'tool';
    this.toolId = ev.pointerId;
    this.start = p;
    this.dragging = false;
  };

  private syncPinch(): void {
    const [a, b] = [...this.pointers.values()];
    if (!a || !b) return;
    this.pinchDist = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    this.pinchMid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  }

  private move = (ev: PointerEvent): void => {
    const p = this.local(ev);
    const had = this.pointers.has(ev.pointerId);
    if (had) this.pointers.set(ev.pointerId, p);

    if (this.mode === 'pinch' && this.pointers.size >= 2) {
      const [a, b] = [...this.pointers.values()];
      const d = Math.hypot(b.x - a.x, b.y - a.y) || 1;
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      this.view.panByPx(mid.x - this.pinchMid.x, mid.y - this.pinchMid.y);
      this.view.zoomAt(mid.x, mid.y, d / this.pinchDist);
      this.pinchDist = d;
      this.pinchMid = mid;
      this.h.onView();
      return;
    }
    if (this.mode === 'pan') {
      this.view.panByPx(p.x - this.panPrev.x, p.y - this.panPrev.y);
      this.panPrev = p;
      this.h.onView();
      return;
    }
    if (this.mode === 'tool' && ev.pointerId === this.toolId) {
      if (!this.dragging && Math.hypot(p.x - this.start.x, p.y - this.start.y) > DRAG_PX) {
        this.dragging = true;
        this.h.onDragStart(this.world(this.start), [this.start.x, this.start.y]);
      }
      if (this.dragging) this.h.onDragMove(this.world(p), [p.x, p.y]);
      else this.h.onHover(this.world(p), [p.x, p.y]);
      return;
    }
    if (this.mode === 'idle') this.h.onHover(this.world(p), [p.x, p.y]);
  };

  private up = (ev: PointerEvent): void => {
    const p = this.local(ev);
    this.pointers.delete(ev.pointerId);
    try {
      (this.el as Element & { releasePointerCapture(id: number): void }).releasePointerCapture(ev.pointerId);
    } catch {
      /* уже отпущен */
    }

    if (this.mode === 'pinch') {
      if (this.pointers.size < 2) this.mode = 'idle';
      if (this.pointers.size === 0) this.muted = false;
      return;
    }
    if (this.mode === 'pan') {
      this.mode = this.pointers.size ? this.mode : 'idle';
      return;
    }
    if (this.mode === 'tool' && ev.pointerId === this.toolId) {
      this.mode = 'idle';
      if (this.dragging) {
        this.dragging = false;
        this.h.onDragEnd(this.world(p), [p.x, p.y]);
        return;
      }
      const now = Date.now();
      const isDouble = now - this.lastTap.t < DOUBLE_MS && Math.hypot(p.x - this.lastTap.x, p.y - this.lastTap.y) < DOUBLE_PX;
      this.lastTap = isDouble ? { t: 0, x: 0, y: 0 } : { t: now, x: p.x, y: p.y };
      this.h.onTap(this.world(p), [p.x, p.y]);
      if (isDouble) this.h.onDoubleTap(this.world(p), [p.x, p.y]);
    }
    if (this.pointers.size === 0) this.muted = false;
  };

  private cancel = (ev: PointerEvent): void => {
    this.pointers.delete(ev.pointerId);
    if (this.mode === 'tool') this.h.onCancel();
    this.mode = 'idle';
    this.dragging = false;
    if (this.pointers.size === 0) this.muted = false;
  };

  private leave = (): void => {
    if (this.mode === 'idle') this.h.onCancel();
  };

  private wheel = (ev: WheelEvent): void => {
    ev.preventDefault();
    const p = this.local(ev);
    // deltaMode 1 — «строки», а не пиксели: без пересчёта одно деление колеса
    // прыгало бы на весь экран.
    const dy = ev.deltaY * (ev.deltaMode === 1 ? 16 : ev.deltaMode === 2 ? 400 : 1);
    const factor = Math.min(2, Math.max(0.5, Math.exp(-dy * 0.0018)));
    this.view.zoomAt(p.x, p.y, factor);
    this.h.onView();
  };

  private ctx = (ev: Event): void => {
    // Правая кнопка — панорама, значит системное меню здесь не нужно.
    ev.preventDefault();
  };
}
