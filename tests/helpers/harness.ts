import type { Page } from '@playwright/test';

/** Что тесты могут спросить у стенда (tests/fixtures/harness.js). */
export interface HarnessApi {
  bundleUrl: string;
  card: any;
  states: Record<string, any>;
  serviceCalls: { domain: string; service: string; data: any; at: number }[];
  wsCalls: any[];
  serviceHandler: ((domain: string, service: string, data: any) => any) | null;
  wsStore: { shared: any; user: Record<string, any>; legacy: any };
  wsFail: Record<string, { times: number; message?: string; code?: string }>;
  mount(opts?: any): Promise<boolean>;
  unmount(): boolean;
  sceneReady(): boolean;
  setStates(patch: Record<string, any>, opts?: { push?: boolean }): boolean;
  push(): boolean;
  frames(): number;
  markFrames(): number;
  framesSinceMark(): number;
  root(): any;
  text(sel: string): string | null;
  click(sel: string): boolean;
  reset(): void;
}

declare global {
  interface Window {
    BMS: HarnessApi;
    __glStats: () => { created: number; live: number };
  }
}

/** Считалка WebGL-контекстов. Ставится ДО любых скриптов страницы, поэтому
 *  видит каждый контекст, который создаст three.js. `live` — те, что браузер
 *  ещё держит (потерянные контексты сюда не попадают). */
export const GL_COUNTER_INIT = () => {
  const orig = HTMLCanvasElement.prototype.getContext as any;
  const all: any[] = [];
  (HTMLCanvasElement.prototype as any).getContext = function (type: string, ...rest: any[]) {
    const ctx = orig.call(this, type, ...rest);
    if (ctx && /webgl/i.test(String(type))) all.push(ctx);
    return ctx;
  };
  (window as any).__glStats = () => ({
    created: all.length,
    live: all.filter((c) => {
      try {
        return !c.isContextLost();
      } catch {
        return false;
      }
    }).length,
  });
};

/** Модель скрытой вкладки: браузер перестаёт выдавать requestAnimationFrame.
 *  Playwright не умеет по-настоящему увести вкладку в фон в headless, а суть
 *  проверки именно в этом — цикл кадров обязан жить на rAF, а не на таймерах,
 *  иначе скрытая карточка продолжит жечь GPU планшета. */
export const RAF_PAUSE_INIT = () => {
  const raf = window.requestAnimationFrame.bind(window);
  let paused = false;
  const queued: FrameRequestCallback[] = [];
  window.requestAnimationFrame = (cb: FrameRequestCallback) => {
    if (paused) {
      queued.push(cb);
      return -1;
    }
    return raf(cb);
  };
  (window as any).__rafPause = () => {
    paused = true;
  };
  (window as any).__rafResume = () => {
    paused = false;
    for (const cb of queued.splice(0)) raf(cb);
  };
};

export interface OpenOptions {
  /** Подменить бандл (для проверки «умеет ли проверка краснеть»). */
  bundle?: string;
  /** Ставить считалку WebGL-контекстов. */
  countGl?: boolean;
  /** Зафиксировать Math.random — текстуры в src/scene/materials.ts случайные. */
  seedRandom?: boolean;
  /** Дать тесту возможность «скрыть вкладку» (перекрыть requestAnimationFrame). */
  pausableRaf?: boolean;
}

/** Открыть стенд и дождаться, пока window.BMS появится. */
export async function openHarness(page: Page, opts: OpenOptions = {}): Promise<void> {
  if (opts.seedRandom !== false) {
    await page.addInitScript(() => {
      // Детерминированный ГПСЧ вместо Math.random: текстуры материалов иначе
      // разные при каждой загрузке (src/scene/materials.ts).
      let s = 0x2f6e2b1;
      Math.random = () => {
        s ^= s << 13;
        s ^= s >>> 17;
        s ^= s << 5;
        return ((s >>> 0) % 1e6) / 1e6;
      };
    });
  }
  if (opts.countGl) await page.addInitScript(GL_COUNTER_INIT);
  if (opts.pausableRaf) await page.addInitScript(RAF_PAUSE_INIT);
  // BMS_BUNDLE подменяет бандл целиком — так проверка гоняется против
  // намеренно испорченной (или, наоборот, починенной) копии, см.
  // tests/tools/patch-bundle.mjs.
  const bundle = opts.bundle ?? process.env.BMS_BUNDLE;
  const url = bundle
    ? `/tests/fixtures/harness.html?bundle=${encodeURIComponent(bundle)}`
    : '/tests/fixtures/harness.html';
  await page.goto(url);
  await page.waitForFunction(() => !!(window as any).BMS);
}

/** Смонтировать карточку и дождаться построенной сцены (или ошибки загрузки). */
export async function mountCard(page: Page, opts: any = {}): Promise<void> {
  await page.evaluate((o) => window.BMS.mount(o), opts);
  await page.waitForFunction(() => window.BMS.sceneReady(), undefined, { timeout: 30_000 });
}

/** «Прогон против подменённого бандла» — в нём ожидаемо падающие проверки
 *  помечать НЕ надо: там дефект либо починен, либо внесён нарочно. */
export const patchedRun = (): boolean => !!process.env.BMS_BUNDLE;

/** Войти в редактор так, как это делает монтажник: удержание 5 секунд в
 *  левом нижнем углу карточки. Медленно, зато проверяет и сам вход. */
export async function enterEditByHold(page: Page): Promise<void> {
  const box = await page.evaluate(() => {
    const el = window.BMS.root().querySelector('.edit-hotspot');
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  });
  await page.mouse.move(box.x, box.y);
  await page.mouse.down();
  await page.waitForTimeout(5400);
  await page.mouse.up();
  await page.waitForFunction(() => window.BMS.card.editing === true, undefined, { timeout: 10_000 });
  await page.evaluate(() => window.BMS.card.updateComplete);
}

/** Быстрый вход в редактор — там, где проверяется не он сам. */
export async function enterEditFast(page: Page): Promise<void> {
  await page.evaluate(async () => {
    window.BMS.card.doEnterEdit();
    await window.BMS.card.updateComplete;
  });
}

/** Текст всплывающего сообщения карточки (оно само гаснет через 3,2 с). */
export async function waitToast(page: Page, contains?: string): Promise<string> {
  await page.waitForFunction(
    (needle) => {
      const t = window.BMS.card?.toast;
      return !!t && (!needle || String(t).includes(needle));
    },
    contains,
    { timeout: 15_000, polling: 50 },
  );
  return page.evaluate(() => String(window.BMS.card.toast));
}

/** Найти кнопку в теневом DOM карточки по видимому тексту. */
export async function clickByText(page: Page, selector: string, text: string): Promise<void> {
  const ok = await page.evaluate(
    ({ selector, text }) => {
      const els = [...window.BMS.root().querySelectorAll(selector)] as HTMLElement[];
      const el = els.find((e) => (e.textContent ?? '').includes(text));
      if (!el) return false;
      el.click();
      return true;
    },
    { selector, text },
  );
  if (!ok) throw new Error(`Не найдена кнопка «${text}» по селектору ${selector}`);
}

/** Дождаться, пока сцена перестанет рисовать кадры (вступительная анимация
 *  камеры отрисовывает десятки кадров и смазала бы любой замер). */
export async function settleScene(page: Page, quietMs = 900): Promise<void> {
  await page.waitForFunction(
    (quiet) => {
      const w = window as any;
      const f = window.BMS.frames();
      const now = performance.now();
      if (w.__lastFrames !== f) {
        w.__lastFrames = f;
        w.__lastChange = now;
        return false;
      }
      return now - (w.__lastChange ?? 0) > quiet;
    },
    quietMs,
    { timeout: 30_000, polling: 100 },
  );
}
