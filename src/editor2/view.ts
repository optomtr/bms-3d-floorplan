// ---------------------------------------------------------------------------
// Камера вида сверху: метры ⇄ пиксели.
//
// Никакой перспективы. Это и есть главная причина переделки: на плане длина
// отрезка на экране ПРОПОРЦИОНАЛЬНА длине в метрах, всегда и везде, поэтому
// «пять метров» можно увидеть, а не угадать.
// ---------------------------------------------------------------------------

import type { Vec2 } from '../types';
import type { Box } from './geom';

/** Пиксель на метр. Ниже — весь посёлок в экране, выше — розетка во весь экран. */
export const MIN_SCALE = 3;
export const MAX_SCALE = 800;

/** Ряд «круглых» шагов сетки. Плотнее 5 см не размечаем: это уже не планировка. */
const STEPS = [0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10, 25, 50, 100, 250];

export class View {
  w = 800;
  h = 600;
  /** Пикселей в метре. */
  scale = 60;
  /** Точка плана в центре экрана. */
  cx = 0;
  cy = 0;

  setSize(w: number, h: number): void {
    this.w = Math.max(1, w);
    this.h = Math.max(1, h);
  }

  sx(x: number): number {
    return (x - this.cx) * this.scale + this.w / 2;
  }

  sy(y: number): number {
    return (y - this.cy) * this.scale + this.h / 2;
  }

  toScreen(p: Vec2): Vec2 {
    return [this.sx(p[0]), this.sy(p[1])];
  }

  toWorld(px: number, py: number): Vec2 {
    return [(px - this.w / 2) / this.scale + this.cx, (py - this.h / 2) / this.scale + this.cy];
  }

  /** Сдвиг «схватил и потащил»: экранные пиксели, а не метры. */
  panByPx(dx: number, dy: number): void {
    this.cx -= dx / this.scale;
    this.cy -= dy / this.scale;
  }

  /** Масштаб вокруг точки экрана — под курсором/пальцами остаётся то же место плана. */
  zoomAt(px: number, py: number, factor: number): void {
    const before = this.toWorld(px, py);
    const next = this.scale * factor;
    this.scale = next < MIN_SCALE ? MIN_SCALE : next > MAX_SCALE ? MAX_SCALE : next;
    const after = this.toWorld(px, py);
    this.cx += before[0] - after[0];
    this.cy += before[1] - after[1];
  }

  /** Вписать габарит в экран. Пустой план — нейтральный масштаб вокруг нуля. */
  fit(box: Box | null, padPx = 56): void {
    if (!box) {
      this.scale = 60;
      this.cx = 0;
      this.cy = 0;
      return;
    }
    const bw = Math.max(0.5, box.maxX - box.minX);
    const bh = Math.max(0.5, box.maxY - box.minY);
    const sw = (this.w - padPx * 2) / bw;
    const sh = (this.h - padPx * 2) / bh;
    const s = Math.min(sw, sh);
    this.scale = s < MIN_SCALE ? MIN_SCALE : s > MAX_SCALE ? MAX_SCALE : s;
    this.cx = (box.minX + box.maxX) / 2;
    this.cy = (box.minY + box.maxY) / 2;
  }

  /**
   * Шаг сетки под текущий масштаб: мелкий — не тоньше 7 px, крупный (с
   * подписью) — не ближе 64 px. Иначе на общем виде сетка превращается в кашу,
   * а вблизи исчезает совсем.
   */
  gridStep(): { minor: number; major: number } {
    const minor = STEPS.find((s) => s * this.scale >= 7) ?? STEPS[STEPS.length - 1];
    const major = STEPS.find((s) => s * this.scale >= 64) ?? STEPS[STEPS.length - 1];
    return { minor, major: Math.max(major, minor) };
  }

  /** Сколько метров помещается по ширине экрана — для подписи масштаба. */
  spanM(): number {
    return this.w / this.scale;
  }
}
