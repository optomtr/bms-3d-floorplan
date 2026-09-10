// ---------------------------------------------------------------------------
// Пальцы и замеры сцены — общее для проверок навигации.
//
// page.touchscreen умеет ровно одно касание, а щипок и поворот — это ДВА, и
// проверять их нечем. Поэтому касания идут напрямую через CDP: там touchPoints
// — список, и второй палец задаётся так же просто, как первый.
// ---------------------------------------------------------------------------

import type { CDPSession, Page } from '@playwright/test';

export interface Pt { x: number; y: number }

// --- пальцы (через CDP: page.touchscreen не умеет два касания) --------------

export class Touch {
  constructor(private readonly cdp: CDPSession) {}

  private send(type: string, pts: Pt[]) {
    return this.cdp.send('Input.dispatchTouchEvent' as any, {
      type,
      touchPoints: pts.map((p, i) => ({ x: Math.round(p.x), y: Math.round(p.y), id: i })),
    } as any);
  }

  down = (pts: Pt[]) => this.send('touchStart', pts);
  move = (pts: Pt[]) => this.send('touchMove', pts);
  up = () => this.send('touchEnd', []);

  /** Протяжка одним пальцем — с промежуточными точками, как настоящая. */
  async drag(from: Pt, to: Pt, steps = 10): Promise<void> {
    await this.down([from]);
    for (let i = 1; i <= steps; i++) {
      await this.move([{ x: from.x + ((to.x - from.x) * i) / steps, y: from.y + ((to.y - from.y) * i) / steps }]);
    }
    await this.up();
  }

  /** Щипок вокруг общей середины: пальцы расходятся с `from` до `to` пикселей. */
  async pinch(mid: Pt, from: number, to: number, steps = 10): Promise<void> {
    const pair = (d: number) => [{ x: mid.x - d / 2, y: mid.y }, { x: mid.x + d / 2, y: mid.y }];
    await this.down(pair(from));
    for (let i = 1; i <= steps; i++) await this.move(pair(from + ((to - from) * i) / steps));
    await this.up();
  }

  /** Поворот: оба пальца едут в одну сторону, расстояние между ними постоянно
   *  (значит, это ЧИСТЫЙ поворот — щипка в жесте нет). */
  async twist(mid: Pt, dx: number, gap = 120, steps = 10): Promise<void> {
    const pair = (o: number) => [{ x: mid.x - gap / 2 + o, y: mid.y }, { x: mid.x + gap / 2 + o, y: mid.y }];
    await this.down(pair(0));
    for (let i = 1; i <= steps; i++) await this.move(pair((dx * i) / steps));
    await this.up();
  }

  /** Наклон: оба пальца едут вверх или вниз, расстояние между ними постоянно. */
  async tilt(mid: Pt, dy: number, gap = 120, steps = 10): Promise<void> {
    const pair = (o: number) => [{ x: mid.x - gap / 2, y: mid.y + o }, { x: mid.x + gap / 2, y: mid.y + o }];
    await this.down(pair(0));
    for (let i = 1; i <= steps; i++) await this.move(pair((dy * i) / steps));
    await this.up();
  }
}

export async function touchOf(page: Page): Promise<Touch> {
  return new Touch(await page.context().newCDPSession(page));
}

// --- замеры -----------------------------------------------------------------

export const rect = (page: Page) =>
  page.evaluate(() => {
    const r = window.BMS.card.sceneManager.renderer.domElement.getBoundingClientRect();
    return { x: r.left, y: r.top, w: r.width, h: r.height, cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
  });

/** Экранная точка мирового места — считаем камерой сцены, а не по пикселям. */
export const screenOf = (page: Page, x: number, y: number, z: number) =>
  page.evaluate(([wx, wy, wz]) => {
    const sm = window.BMS.card.sceneManager;
    const r = sm.renderer.domElement.getBoundingClientRect();
    const v = new (window as any).__V3(wx, wy, wz);
    v.project(sm.camera);
    return { x: r.left + (v.x * 0.5 + 0.5) * r.width, y: r.top + (0.5 - v.y * 0.5) * r.height };
  }, [x, y, z]) as Promise<Pt>;

/** Мировая точка пола под экранной точкой. */
export const groundOf = (page: Page, p: Pt) =>
  page.evaluate(([x, y]) => {
    const g = window.BMS.card.sceneManager.groundIntersect({ clientX: x, clientY: y });
    return g ? { x: g.x, z: g.z } : null;
  }, [p.x, p.y]) as Promise<{ x: number; z: number } | null>;

/** Состояние камеры в метрах и радианах. */
export const cam = (page: Page) =>
  page.evaluate(() => {
    const sm = window.BMS.card.sceneManager;
    const t = sm.controls.target;
    return {
      pos: { x: sm.camera.position.x, y: sm.camera.position.y, z: sm.camera.position.z },
      target: { x: t.x, y: t.y, z: t.z },
      radius: sm.camera.position.distanceTo(t),
      azimuth: sm.controls.getAzimuthalAngle(),
      polar: sm.controls.getPolarAngle(),
    };
  });

/** Что лежит под точкой в теневом корне: холст 3D или накладка карточки. */
export const under = (page: Page, p: Pt) =>
  page.evaluate(([x, y]) => {
    const el = (window.BMS.root() as ShadowRoot).elementFromPoint(x, y) as HTMLElement | null;
    return el ? `${el.tagName}.${el.getAttribute('class') ?? ''}` : 'НИЧЕГО';
  }, [p.x, p.y]) as Promise<string>;

export const flat = (a: { x: number; z: number }, b: { x: number; z: number }) => Math.hypot(a.x - b.x, a.z - b.z);
export const px = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);
export const settle = (page: Page) => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => r(null))));

/** Свободная точка холста, с которой можно тянуть на (dx, dy). */
export async function grabPoint(page: Page, dx: number, dy: number): Promise<Pt> {
  const r = await rect(page);
  const pad = 70;
  const lo = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
  const x0 = dx >= 0 ? r.x + pad : r.x + r.w - pad;
  const y0 = dy >= 0 ? r.y + pad : r.y + r.h - pad;
  const tried: string[] = [];
  for (const fy of [0, 0.25, 0.5, -0.25]) {
    for (const fx of [0, 0.25, 0.5, -0.25]) {
      const p = {
        x: lo(x0 + fx * (dx >= 0 ? r.w : -r.w) * 0.4, r.x + pad, r.x + r.w - pad),
        y: lo(y0 + fy * (dy >= 0 ? r.h : -r.h) * 0.4, r.y + pad, r.y + r.h - pad),
      };
      const el = await under(page, p);
      tried.push(`${Math.round(p.x)},${Math.round(p.y)} ${el}`);
      if (el.includes('CANVAS')) return p;
    }
  }
  throw new Error(`На холсте нет свободной точки для жеста:\n${tried.join('\n')}`);
}

/** Ближайшая к желаемой точка, под которой действительно ХОЛСТ, а не накладка
 *  карточки (в правке панель инструментов занимает изрядную часть экрана). */
export async function canvasPoint(page: Page, want: Pt): Promise<Pt> {
  const r = await rect(page);
  const tried: string[] = [];
  for (const ring of [0, 0.08, 0.16, 0.24, 0.32]) {
    for (const [fx, fy] of [[0, 0], [0, -1], [0, 1], [-1, 0], [1, 0], [-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      const p = {
        x: Math.max(r.x + 30, Math.min(r.x + r.w - 30, want.x + fx * ring * r.w)),
        y: Math.max(r.y + 30, Math.min(r.y + r.h - 30, want.y + fy * ring * r.h)),
      };
      const el = await under(page, p);
      tried.push(`${Math.round(p.x)},${Math.round(p.y)} ${el}`);
      if (el.includes('CANVAS')) return p;
      if (!ring) break;
    }
  }
  throw new Error(`Рядом с ${Math.round(want.x)},${Math.round(want.y)} холста нет:\n${tried.join('\n')}`);
}

/** Свезти вид так, чтобы мировая точка оказалась в середине холста. Возвращает
 *  сколько протяжек ушло и сколько пикселей осталось. */
export async function bringToCentre(
  page: Page,
  t: Touch,
  w: { x: number; z: number },
  limit = 6,
): Promise<{ pulls: number; off: number }> {
  let off = Infinity;
  for (let pulls = 1; pulls <= limit; pulls++) {
    const r = await rect(page);
    const p = await screenOf(page, w.x, 0, w.z);
    off = px(p, { x: r.cx, y: r.cy });
    if (off <= 6) return { pulls: pulls - 1, off };
    // Тянуть надо ровно на (середина − точка); если столько не помещается на
    // холст — тянем сколько влезает и повторяем.
    const want = { x: r.cx - p.x, y: r.cy - p.y };
    const k = Math.min(1, (r.w - 190) / (Math.abs(want.x) || 1), (r.h - 190) / (Math.abs(want.y) || 1));
    const d = { x: want.x * k, y: want.y * k };
    const from = await grabPoint(page, d.x, d.y);
    await t.drag(from, { x: from.x + d.x, y: from.y + d.y });
    await settle(page);
  }
  const r = await rect(page);
  off = px(await screenOf(page, w.x, 0, w.z), { x: r.cx, y: r.cy });
  return { pulls: limit, off };
}
