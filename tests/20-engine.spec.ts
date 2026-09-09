// ---------------------------------------------------------------------------
// Движок нового конструктора (src/editor2) — проверки самого важного.
//
// Стенд поднимается без карточки и без WebGL: движок по договору не знает ни
// про Lit, ни про Home Assistant, поэтому и проверять его надо в голом DOM.
// Исходники собираются esbuild'ом прямо здесь — так проверяется РОВНО то, что
// лежит в src/editor2, а не подвернувшийся собранный файл.
//
// Каждая проверка здесь ломалась руками и краснела — иначе она украшение, а не
// проверка (см. отчёт: что именно ломали).
// ---------------------------------------------------------------------------

import { expect, test, type Page } from '@playwright/test';
import { build } from 'esbuild';
import { fileURLToPath } from 'url';

let BUNDLE = '';

test.beforeAll(async () => {
  const out = await build({
    entryPoints: [fileURLToPath(new URL('../src/editor2/api.ts', import.meta.url))],
    bundle: true,
    write: false,
    format: 'iife',
    globalName: 'E2',
    target: 'es2020',
  });
  BUNDLE = out.outputFiles[0].text;
  expect(BUNDLE.length, 'движок должен собраться').toBeGreaterThan(1000);
});

interface XY {
  x: number;
  y: number;
}

const emptyPlan = () => ({ name: 'Проверка', floors: [{ name: 'Первый', walls: [] as unknown[] }] });

/** Сколько действий сделал «человек» — считаем честно, из помощников. */
let actions = 0;

async function mount(page: Page, plan: unknown = emptyPlan()): Promise<void> {
  actions = 0;
  // НЕ '/': там index.html с мгновенным meta-refresh, он уводит страницу
  // из-под setContent. Нужен просто живой http-источник.
  await page.goto('/tests/');
  await page.setContent(
    '<!doctype html><meta charset="utf-8"><style>html,body{margin:0;background:#0f1115}' +
      '#host{width:1000px;height:760px}</style><div id="host"></div>',
  );
  await page.addScriptTag({ content: BUNDLE });
  await page.evaluate((p) => {
    const w = window as unknown as Record<string, unknown>;
    const ed = (w.E2 as { createPlanEditor(): unknown }).createPlanEditor() as Record<string, Function>;
    w.ed = ed;
    w.plan = p;
    w.changes = 0;
    w.statuses = [] as string[];
    ed.onChange(() => {
      w.changes = (w.changes as number) + 1;
    });
    ed.onStatus((t: string) => (w.statuses as string[]).push(t));
    ed.mount(document.getElementById('host'), p, 0);
  }, plan);
  await settle(page);
}

async function settle(page: Page): Promise<void> {
  await page.evaluate(
    () => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r()))),
  );
}

const call = (page: Page, method: string, ...args: unknown[]) =>
  page.evaluate(
    ([m, a]) => (window as never as Record<string, Record<string, Function>>).ed[m as string](...(a as unknown[])),
    [method, args] as const,
  );

async function toClient(page: Page, x: number, y: number): Promise<XY> {
  return page.evaluate(
    ([wx, wy]) => (window as never as Record<string, { worldToClient(a: number, b: number): XY }>).ed.worldToClient(wx, wy),
    [x, y],
  );
}

async function toWorld(page: Page, cx: number, cy: number): Promise<XY> {
  return page.evaluate(
    ([x, y]) => (window as never as Record<string, { clientToWorld(a: number, b: number): XY }>).ed.clientToWorld(x, y),
    [cx, cy],
  );
}

/** Касание в точке ЭКРАНА (целые пиксели — так же, как палец). */
async function tapClient(page: Page, cx: number, cy: number): Promise<void> {
  actions += 1;
  await page.mouse.move(cx, cy);
  await page.mouse.down();
  await page.mouse.up();
  await settle(page);
}

/** Касание в точке ПЛАНА. */
async function tap(page: Page, x: number, y: number): Promise<void> {
  const p = await toClient(page, x, y);
  await tapClient(page, Math.round(p.x), Math.round(p.y));
}

async function type(page: Page, field: string, value: string): Promise<void> {
  actions += 1;
  await page.locator(`#host input[data-field="${field}"]`).fill(value);
}

async function enter(page: Page, field: string): Promise<void> {
  actions += 1;
  await page.locator(`#host input[data-field="${field}"]`).press('Enter');
  await settle(page);
}

async function press(page: Page, selector: string): Promise<void> {
  actions += 1;
  await page.locator(`#host ${selector}`).click();
  await settle(page);
}

async function floor(page: Page): Promise<any> {
  return page.evaluate(() =>
    JSON.parse(JSON.stringify((window as never as Record<string, { getPlan(): unknown }>).ed.getPlan())),
  ).then((p: any) => p.floors[0]);
}

const len = (w: any) => Math.hypot(w.end[0] - w.start[0], w.end[1] - w.start[1]);

function area(poly: number[][]): number {
  let s = 0;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    s += a[0] * b[1] - b[0] * a[1];
  }
  return Math.abs(s) / 2;
}

// ---------------------------------------------------------------------------

test.describe('Движок конструктора: вид сверху', () => {
  test('прямоугольник 5×4 даёт в плане ровно 5 и 4 метра', async ({ page }) => {
    await mount(page);
    await call(page, 'setTool', 'room');
    await tap(page, 0, 0);
    await type(page, 'w', '5');
    await type(page, 'd', '4');
    await enter(page, 'd');

    const f = await floor(page);
    expect(f.rooms, 'комната должна появиться').toHaveLength(1);
    const poly = f.rooms[0].polygon as number[][];
    const width = Math.max(...poly.map((p) => p[0])) - Math.min(...poly.map((p) => p[0]));
    const depth = Math.max(...poly.map((p) => p[1])) - Math.min(...poly.map((p) => p[1]));
    expect(width, `ширина вышла ${width}`).toBeCloseTo(5, 6);
    expect(depth, `глубина вышла ${depth}`).toBeCloseTo(4, 6);
    expect(area(poly)).toBeCloseTo(20, 6);

    // И стены по периметру — те же 5 и 4, а не «примерно».
    const lens = (f.walls as any[]).map(len).sort((a, b) => a - b);
    expect(lens).toHaveLength(4);
    expect(lens[0]).toBeCloseTo(4, 6);
    expect(lens[1]).toBeCloseTo(4, 6);
    expect(lens[2]).toBeCloseTo(5, 6);
    expect(lens[3]).toBeCloseTo(5, 6);
  });

  test('«3,5» с запятой даёт 3,5 — не 35 и не 3', async ({ page }) => {
    await mount(page);
    await call(page, 'setTool', 'wall');
    await tap(page, 0, 0);
    await type(page, 'len', '3,5');
    await type(page, 'ang', '0');
    await enter(page, 'len');

    const f = await floor(page);
    expect(f.walls, 'стена должна появиться').toHaveLength(1);
    const l = len(f.walls[0]);
    expect(l, `длина вышла ${l}`).toBeCloseTo(3.5, 6);
    expect(Math.abs(l - 35), 'запятую прочитали как разделитель тысяч').toBeGreaterThan(1);
    expect(Math.abs(l - 3), 'дробную часть потеряли').toBeGreaterThan(0.4);
  });

  test('контроль: «3.5» с точкой поле тоже принимает', async ({ page }) => {
    // Без этого предыдущая проверка ничего не значила бы: сломаться мог весь
    // путь ввода, а не разбор запятой.
    await mount(page);
    await call(page, 'setTool', 'wall');
    await tap(page, 0, 0);
    await type(page, 'len', '3.5');
    await type(page, 'ang', '0');
    await enter(page, 'len');
    const f = await floor(page);
    expect(len(f.walls[0])).toBeCloseTo(3.5, 6);
  });

  test('«3,5» в свойствах выделенного тоже читается как три с половиной', async ({ page }) => {
    await mount(page);
    await call(page, 'setTool', 'room');
    await tap(page, 0, 0);
    await type(page, 'w', '5');
    await type(page, 'd', '4');
    await enter(page, 'd');
    await call(page, 'setTool', 'select');
    await tap(page, 2.5, 0); // верхняя стена
    const sel = await page.evaluate(() =>
      (window as never as Record<string, { getSelection(): unknown }>).ed.getSelection(),
    );
    expect((sel as any)?.kind).toBe('wall');
    await call(page, 'updateSelected', { thicknessM: '0,25' });
    const f = await floor(page);
    const th = (f.walls as any[]).map((w) => w.thickness).sort((a, b) => b - a)[0];
    expect(th, `толщина вышла ${th}`).toBeCloseTo(0.25, 6);
  });

  test('привязка выключается кнопкой, и точка встаёт куда угодно', async ({ page }) => {
    await mount(page);
    await call(page, 'setTool', 'wall');

    // Заведомо «некруглая» точка экрана: 1 px = 1/60 м, ни одна координата не
    // ложится на сетку 10 см сама собой.
    const CX = 574;
    const CY = 537;
    const raw = await toWorld(page, CX, CY);
    const offGrid = (v: number) => Math.abs(v * 10 - Math.round(v * 10)) > 0.02;
    expect(offGrid(raw.x) && offGrid(raw.y), 'контрольная точка обязана быть вне сетки').toBe(true);

    // 1) привязка включена — точка садится на сетку
    expect(await call(page, 'getSnap')).toBe(true);
    await tapClient(page, CX, CY);
    await tap(page, 4, 4);
    let f = await floor(page);
    const on = f.walls[0].start;
    expect(Math.abs(on[0] * 10 - Math.round(on[0] * 10)), `x=${on[0]}`).toBeLessThan(1e-6);
    expect(Math.abs(on[1] * 10 - Math.round(on[1] * 10)), `y=${on[1]}`).toBeLessThan(1e-6);

    // 2) выключаем ЭКРАННОЙ кнопкой — не клавишей
    await press(page, 'button[data-role="snap"]');
    expect(await call(page, 'getSnap'), 'кнопка обязана выключать привязку').toBe(false);

    await mount(page); // чистый лист, чтобы не мешали чужие вершины
    await call(page, 'setTool', 'wall');
    await call(page, 'setSnap', false);
    await tapClient(page, CX, CY);
    await tap(page, 4, 4);
    f = await floor(page);
    const off = f.walls[0].start;
    expect(off[0], 'точка обязана встать ровно туда, куда ткнули').toBeCloseTo(raw.x, 6);
    expect(off[1]).toBeCloseTo(raw.y, 6);
    expect(offGrid(off[0]) || offGrid(off[1]), 'выключенная привязка всё равно тянет на сетку').toBe(true);
  });

  test('в движке нет ни одной клавиши-модификатора', async () => {
    // На планшете нет Shift/Ctrl/Alt, а старая привязка жила именно на Shift.
    expect(BUNDLE).not.toMatch(/shiftKey|ctrlKey|altKey|metaKey/);
  });

  test('замкнутый контур даёт комнату с правильной площадью', async ({ page }) => {
    await mount(page);
    await call(page, 'setTool', 'wall');
    for (const [x, y] of [
      [0, 0],
      [6, 0],
      [6, 3],
      [0, 3],
    ]) {
      await tap(page, x, y);
    }
    await tap(page, 0, 0); // замыкаем

    await expect(page.locator('#host .e2-ask[data-open="1"]'), 'должно предложить сделать комнату').toHaveCount(1);
    await press(page, 'button[data-role="ask-yes"]');

    const f = await floor(page);
    expect(f.walls).toHaveLength(4);
    expect(f.rooms).toHaveLength(1);
    expect(area(f.rooms[0].polygon), 'площадь замкнутого 6×3').toBeCloseTo(18, 4);
  });

  test('«залить контур» делает комнату по уже начерченным стенам', async ({ page }) => {
    await mount(page);
    await call(page, 'setTool', 'wall');
    for (const [x, y] of [
      [0, 0],
      [6, 0],
      [6, 3],
      [0, 3],
    ]) {
      await tap(page, x, y);
    }
    await tap(page, 0, 0);
    await press(page, 'button[data-role="ask-no"]'); // комнату НЕ делаем

    await call(page, 'setTool', 'room');
    await press(page, 'button[data-mode="mode:fill"]');
    await tap(page, 3, 1.5);

    const f = await floor(page);
    expect(f.rooms, 'заливка обязана дать ровно одну комнату').toHaveLength(1);
    expect(area(f.rooms[0].polygon)).toBeCloseTo(18, 4);
  });

  test('проём не уезжает с чужой стены при удалении соседней', async ({ page }) => {
    await mount(page);
    await call(page, 'setTool', 'room');
    await tap(page, 0, 0);
    await type(page, 'w', '6');
    await type(page, 'd', '3');
    await enter(page, 'd');

    // Дверь на НИЖНЮЮ стену (y = 3), посередине.
    await call(page, 'setTool', 'door');
    await tap(page, 3, 3);
    let f = await floor(page);
    const owner = (f.walls as any[]).find((w) => (w.openings ?? []).length);
    expect(owner, 'дверь должна встать на стену').toBeTruthy();
    const before = { wallId: owner.id, ...owner.openings[0] };
    expect((f.walls as any[]).filter((w) => (w.openings ?? []).length)).toHaveLength(1);

    // Удаляем ДРУГУЮ стену — верхнюю (y = 0).
    await call(page, 'setTool', 'select');
    await tap(page, 3, 0);
    const sel = await page.evaluate(() =>
      (window as never as Record<string, { getSelection(): any }>).ed.getSelection(),
    );
    expect(sel?.kind).toBe('wall');
    expect(sel.id, 'выбрали не ту стену — проверка ничего не докажет').not.toBe(before.wallId);
    await call(page, 'deleteSelected');

    f = await floor(page);
    expect(f.walls).toHaveLength(3);
    // Удалиться обязана ИМЕННО выбранная стена: удаление по номеру в массиве
    // сносит соседнюю и уводит вместе с ней чужие проёмы.
    expect(
      (f.walls as any[]).some((w) => w.id === sel.id),
      'удалили не ту стену, которую выбрали',
    ).toBe(false);
    const still = (f.walls as any[]).find((w) => w.id === before.wallId);
    expect(still, 'стена с дверью обязана остаться').toBeTruthy();
    expect(still.openings, 'дверь обязана остаться на СВОЕЙ стене').toHaveLength(1);
    expect(still.openings[0].id).toBe(before.id);
    expect(still.openings[0].position, `отступ уехал: было ${before.position}`).toBeCloseTo(before.position, 6);
    expect(still.openings[0].width).toBeCloseTo(before.width, 6);
    const withOpenings = (f.walls as any[]).filter((w) => (w.openings ?? []).length);
    expect(withOpenings, 'проём не должен появиться на чужой стене').toHaveLength(1);
  });

  test('отмена возвращает план и не подменяет объект под оболочкой', async ({ page }) => {
    await mount(page);
    await call(page, 'setTool', 'room');
    await tap(page, 0, 0);
    await type(page, 'w', '5');
    await type(page, 'd', '4');
    await enter(page, 'd');
    expect((await floor(page)).rooms).toHaveLength(1);
    expect(await call(page, 'canUndo')).toBe(true);

    await call(page, 'undo');
    let f = await floor(page);
    expect(f.rooms ?? [], 'после отмены комнаты быть не должно').toHaveLength(0);
    expect(f.walls, 'стены периметра тоже уходят').toHaveLength(0);

    // Оболочка держит ссылку на ТОТ ЖЕ объект плана — иначе она осталась бы
    // на прошлом состоянии и молча сохранила его.
    expect(
      await page.evaluate(() => (window as never as Record<string, unknown>).plan === (window as any).ed.getPlan()),
    ).toBe(true);

    await call(page, 'redo');
    f = await floor(page);
    expect(f.rooms).toHaveLength(1);
    expect(area(f.rooms[0].polygon)).toBeCloseTo(20, 6);
  });

  test('подсказки и подписи — по-русски, системных окошек нет', async ({ page }) => {
    await mount(page);
    await call(page, 'setTool', 'wall');
    await tap(page, 0, 0);
    const status = await page.locator('#host .e2-status').innerText();
    expect(status).toMatch(/[А-Яа-яЁё]/);
    // «Enter» — имя клавиши, оно на всех раскладках одно; всё остальное обязано
    // быть по-русски.
    expect(status.replace(/Enter/g, '')).not.toMatch(/[A-Za-z]{3,}/);
    // Ни alert/confirm/prompt в коде движка.
    expect(BUNDLE).not.toMatch(/\b(window\.)?(alert|confirm|prompt)\s*\(/);
    // Цели нажатия — не меньше 44 px.
    const small = await page.evaluate(() =>
      [...document.querySelectorAll('#host .e2-btn')]
        .map((b) => b.getBoundingClientRect())
        .filter((r) => r.width > 0 && r.height > 0) // спрятанные не в счёт
        .filter((r) => r.width < 44 || r.height < 44).length,
    );
    expect(small, 'кнопка мельче 44 px — мимо пальца').toBe(0);
  });

  test('сценарий «квартира из трёх комнат»: сколько действий и секунд', async ({ page }) => {
    await mount(page);
    const t0 = Date.now();

    await call(page, 'setTool', 'room');
    // Гостиная 4 × 3,5
    await tap(page, 0, 0);
    await type(page, 'w', '4');
    await type(page, 'd', '3,5');
    await enter(page, 'd');
    // Спальня 4 × 3,5 — встык, угол сам садится на существующую вершину
    await tap(page, 4, 0);
    await type(page, 'w', '4');
    await type(page, 'd', '3,5');
    await enter(page, 'd');
    // Кухня 8 × 2,5 вдоль низа
    await tap(page, 0, 3.5);
    await type(page, 'w', '8');
    await type(page, 'd', '2,5');
    await enter(page, 'd');
    // Три двери. Точки берём из САМОГО плана — середины трёх разных стен, а не
    // числа из головы: масштаб «вписать всё» зависит от размера холста, и на
    // другой машине жёсткая координата промахивается мимо стены (поймано на
    // сборке под Linux: две двери вместо трёх).
    await call(page, 'setTool', 'door');
    const before = await floor(page);
    const mids = (before.walls as any[])
      .map((w) => [ (w.start[0] + w.end[0]) / 2, (w.start[1] + w.end[1]) / 2 ] as [number, number])
      .filter((m, i, all) => all.findIndex((n) => Math.hypot(n[0] - m[0], n[1] - m[1]) < 0.01) === i)
      .slice(0, 3);
    expect(mids.length, 'в плане обязано быть минимум три стены под двери').toBe(3);
    for (const [mx, my] of mids) await tap(page, mx, my);

    const seconds = (Date.now() - t0) / 1000;
    const f = await floor(page);
    const areas = (f.rooms as any[]).map((r) => +area(r.polygon).toFixed(2)).sort((a, b) => a - b);
    expect(areas, 'три комнаты ровно тех размеров, что набрали').toEqual([14, 14, 20]);
    const doors = (f.walls as any[]).reduce((n, w) => n + (w.openings ?? []).length, 0);
    expect(doors, 'три двери').toBe(3);

    // Числа для отчёта. Порог держим с запасом: он стережёт не «быстро», а
    // «не разрослось вдвое».
    console.log(`СЦЕНАРИЙ 3 комнаты: действий ${actions}, автоматом ${seconds.toFixed(1)} с`);
    expect(actions, `действий получилось ${actions}`).toBeLessThanOrEqual(18);
  });

  test('сценарий тем же составом, но рамкой мышью: три перетаскивания', async ({ page }) => {
    await mount(page);
    await call(page, 'setTool', 'room');
    const t0 = Date.now();
    const boxes: Array<[number, number, number, number]> = [
      [0, 0, 4, 3.5],
      [4, 0, 8, 3.5],
      [0, 3.5, 8, 6],
    ];
    for (const [x1, y1, x2, y2] of boxes) {
      const a = await toClient(page, x1, y1);
      const b = await toClient(page, x2, y2);
      actions += 1;
      await page.mouse.move(Math.round(a.x), Math.round(a.y));
      await page.mouse.down();
      await page.mouse.move(Math.round(b.x), Math.round(b.y), { steps: 6 });
      await page.mouse.up();
      await settle(page);
    }
    const seconds = (Date.now() - t0) / 1000;
    const f = await floor(page);
    expect(f.rooms).toHaveLength(3);
    console.log(`СЦЕНАРИЙ 3 комнаты рамкой: действий ${actions}, автоматом ${seconds.toFixed(1)} с`);
    expect(actions).toBe(3);
  });
});
