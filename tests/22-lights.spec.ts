// ---------------------------------------------------------------------------
// СТОРОЖ СВЕТА в новом конструкторе.
//
// Человек ставит светильник видом сверху. Плоскость даёт две координаты из
// трёх; третью — высоту — обязан дать справочник моделей. Пока её не спрашивали,
// ВЕСЬ свет ложился на пол: и люстра, и потолочный, и бра.
//
// Здесь стерегутся четыре вещи и одна контрольная:
//   • потолочный светильник висит ПОД ПОТОЛКОМ;
//   • высота берётся у ЭТАЖА (3,2 м — значит под 3,2, а не под 2,6);
//   • бра прижимается к стене и смотрит ВНУТРЬ комнаты (с обеих стен по-своему);
//   • торшер остаётся на полу — контрольная: «подняли всё под потолок» не
//     должно проходить за исправление;
//   • поставленный светильник СРАЗУ просит устройство Home Assistant.
//
// Первая часть гоняет движок в голом DOM (собирается esbuild'ом прямо здесь —
// проверяется РОВНО то, что лежит в src/editor2). Вторая поднимает настоящую
// карточку: оболочку, инспектор и живую 3D-сцену.
//
// Каждая проверка ломалась руками и краснела — чем именно, написано в отчёте.
// ---------------------------------------------------------------------------

import { expect, test, type Page } from '@playwright/test';
import { build } from 'esbuild';
import { fileURLToPath } from 'url';
import { mountCard, openHarness, settleScene } from './helpers/harness';
import { baseStates, boxWalls, room } from './helpers/plans';

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

// --- часть 1: движок ---------------------------------------------------------

/** Комната 6×5 со стенами. wallHeight ставим этажу — именно её обязан спросить
 *  редактор, а не своё «2,6 по умолчанию». */
const roomPlan = (wallHeight: number) => ({
  name: 'Свет',
  wallHeight: 2.6,
  floors: [
    {
      name: 'Первый',
      elevation: 0,
      wallHeight,
      walls: boxWalls(),
      rooms: [room()],
      furniture: [] as unknown[],
      bindings: [] as unknown[],
    },
  ],
});

async function mountEngine(page: Page, plan: unknown): Promise<void> {
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
    w.binds = [] as unknown[];
    ed.onBindRequest((r: unknown) => (w.binds as unknown[]).push(r));
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

/** Поставить модель касанием точки ПЛАНА — ровно так, как это делает палец. */
async function place(page: Page, model: string, x: number, y: number): Promise<void> {
  await call(page, 'setTool', 'furniture');
  await call(page, 'setPendingModel', model);
  const p = await page.evaluate(
    ([wx, wy]) =>
      (window as never as Record<string, { worldToClient(a: number, b: number): { x: number; y: number } }>).ed
        .worldToClient(wx, wy),
    [x, y],
  );
  await page.mouse.move(Math.round(p.x), Math.round(p.y));
  await page.mouse.down();
  await page.mouse.up();
  await settle(page);
}

const items = (page: Page) =>
  page.evaluate(() => {
    const plan = (window as never as Record<string, { getPlan(): any }>).ed.getPlan();
    return JSON.parse(JSON.stringify(plan.floors[0].furniture ?? []));
  });

const status = (page: Page) =>
  page.evaluate(() => (window as never as Record<string, { getStatus(): string }>).ed.getStatus());

test.describe('Свет в конструкторе: движок', () => {
  test('потолочный светильник висит под потолком, а не лежит на полу', async ({ page }) => {
    await mountEngine(page, roomPlan(2.6));
    await place(page, 'ceiling_light', 3, 2.5);

    const f = await items(page);
    expect(f, 'светильник должен появиться в плане').toHaveLength(1);
    const y = f[0].position[1];
    expect(y, `светильник встал на высоту ${y} м — это пол`).toBeGreaterThan(2);
    expect(y, 'потолочный висит в 5 см под потолком 2,6 м').toBeCloseTo(2.55, 3);
  });

  test('высота берётся у ЭТАЖА: при 3,2 м светильник под 3,2, а не под 2,6', async ({ page }) => {
    await mountEngine(page, roomPlan(3.2));
    await place(page, 'ceiling_light', 3, 2.5);

    const y = (await items(page))[0].position[1];
    expect(y, `на этаже 3,2 м светильник оказался на ${y} м`).toBeCloseTo(3.15, 3);
    expect(Math.abs(y - 2.55), 'высоту взяли «по умолчанию», а не у этажа').toBeGreaterThan(0.5);
  });

  test('торшер остаётся на полу — контрольная против «подняли всё под потолок»', async ({ page }) => {
    await mountEngine(page, roomPlan(3.2));
    await place(page, 'floor_lamp', 3, 2.5);

    const y = (await items(page))[0].position[1];
    expect(y, `торшер оказался на высоте ${y} м`).toBe(0);
  });

  test('бра прижимается к стене и смотрит ВНУТРЬ комнаты — с обеих стен по-своему', async ({ page }) => {
    await mountEngine(page, roomPlan(2.6));
    // Верхняя стена комнаты: y = 0, комната лежит ниже неё.
    await place(page, 'wall_sconce', 1.5, 0.6);
    // Нижняя стена: y = 5, комната выше неё.
    await place(page, 'wall_sconce', 3, 4.4);

    const f = await items(page);
    expect(f, 'оба бра должны появиться').toHaveLength(2);
    const [top, bottom] = f;

    expect(top.position[1], 'бра висит на 1,6 м, а не лежит на полу').toBeCloseTo(1.6, 3);
    expect(bottom.position[1], 'второе бра тоже на 1,6 м').toBeCloseTo(1.6, 3);

    // Прижато к стене: от линии стены не дальше четверти метра.
    expect(top.position[2], `первое бра осталось в ${top.position[2]} м от стены`).toBeLessThan(0.25);
    expect(top.position[2], 'но вынесено на комнатную сторону, а не утоплено в стену').toBeGreaterThan(0);
    expect(5 - bottom.position[2], 'второе бра прижато к своей стене').toBeLessThan(0.25);
    expect(5 - bottom.position[2], 'и тоже вынесено внутрь комнаты').toBeGreaterThan(0);

    // Лицом внутрь: у противоположных стен развороты противоположные.
    expect(Math.abs(top.rotation % 360), 'бра верхней стены смотрит вниз по плану').toBe(0);
    expect(Math.abs(bottom.rotation % 360), 'бра нижней стены смотрит вверх по плану').toBe(180);
  });

  test('настенный светильник вдали от стен не ставится молча — человеку говорят, куда целиться', async ({ page }) => {
    await mountEngine(page, roomPlan(2.6));
    // Середина комнаты 6×5: до ближайшей стены 2,5 м — дотянуться не за что.
    await place(page, 'wall_sconce', 3, 2.5);

    expect(await items(page), 'бра посреди комнаты висело бы в воздухе').toHaveLength(0);
    const text = await status(page);
    expect(text, `строка состояния сказала: «${text}»`).toContain('стен');
    expect(text, 'и названа модель по-русски, а не ключом').toContain('Бра');
  });

  test('поставленный светильник СРАЗУ просит устройство; диван — не просит', async ({ page }) => {
    await mountEngine(page, roomPlan(2.6));
    await place(page, 'ceiling_light', 3, 2.5);

    let binds = await page.evaluate(() => (window as any).binds);
    expect(binds, 'после светильника обязана прийти ровно одна просьба о привязке').toHaveLength(1);
    expect(binds[0].model).toBe('ceiling_light');
    expect(String(binds[0].id), 'просьба указывает на поставленный предмет').toBe((await items(page))[0].id);

    await place(page, 'sofa', 2, 3.5);
    binds = await page.evaluate(() => (window as any).binds);
    expect(binds, 'диван привязки не просит — иначе просьба обесценится').toHaveLength(1);
  });

  test('набор точечных встаёт под потолок, а разброс и количество доступны', async ({ page }) => {
    await mountEngine(page, roomPlan(2.6));
    await place(page, 'spotlight_bar', 3, 2.5);

    expect((await items(page))[0].position[1], 'набор точечных — потолочный').toBeCloseTo(2.58, 3);

    const sel = await page.evaluate(() =>
      (window as never as Record<string, { getSelection(): any }>).ed.getSelection(),
    );
    expect(sel.kind, 'поставленный набор сразу выбран').toBe('furniture');
    expect(sel.isSet, 'редактор объявил его набором — иначе полей не будет').toBe(true);
    expect(sel.spread, 'разброс по умолчанию — единица').toBe(1);

    await call(page, 'updateSelected', { count: '8', spread: '1,5' });
    const f = (await items(page))[0];
    expect(f.count, 'количество ушло в план').toBe(8);
    expect(f.spread, '«1,5» прочитано как полтора').toBeCloseTo(1.5, 6);
  });
});

// --- часть 2: оболочка и живая сцена ----------------------------------------

const lightsPlan = () => ({
  name: 'Свет',
  wallHeight: 2.6,
  floors: [
    {
      name: 'Первый этаж',
      elevation: 0,
      wallHeight: 2.6,
      walls: boxWalls(),
      rooms: [room()],
      furniture: [] as unknown[],
      bindings: [] as unknown[],
    },
  ],
});

async function openShell(page: Page): Promise<void> {
  await openHarness(page);
  await page.evaluate(() => {
    (document.getElementById('host') as HTMLElement).style.width = '1440px';
  });
  await mountCard(page, { config: { plan: lightsPlan() }, states: baseStates(), height: '820px' });
  await settleScene(page);
  await page.evaluate(async () => {
    const c = window.BMS.card;
    c.editEntry = 'e2';
    c.doEnterEdit();
    await c.updateComplete;
  });
  await page.waitForFunction(() => !!window.BMS.root().querySelector('.e2-shell'));
  await page.evaluate(async () => {
    await window.BMS.card.updateComplete;
    await new Promise((r) => requestAnimationFrame(() => r(null)));
  });
}

/** Пройти путь человека: инструмент «Мебель» → раздел «Освещение» → модель →
 *  касание плана. Ни одного внутреннего вызова — только то, по чему он жмёт. */
async function placeFromPalette(page: Page, model: string, x: number, y: number): Promise<void> {
  await page.evaluate(async () => {
    (window.BMS.root().querySelector('[data-act="tool-furniture"]') as HTMLElement).click();
    await window.BMS.card.updateComplete;
  });
  await page.evaluate(async () => {
    (window.BMS.root().querySelector('[data-cat="lighting"]') as HTMLElement).click();
    await window.BMS.card.updateComplete;
  });
  await page.evaluate(async (m) => {
    const cell = window.BMS.root().querySelector(`[data-model="${m}"]`) as HTMLElement | null;
    if (!cell) throw new Error(`в палитре нет плитки ${m}`);
    cell.click();
    await window.BMS.card.updateComplete;
  }, model);
  const pt = await page.evaluate(
    ([wx, wy]) => (window.BMS.card.e2.editor as any).worldToClient(wx, wy),
    [x, y],
  );
  await page.mouse.move(Math.round(pt.x), Math.round(pt.y));
  await page.mouse.down();
  await page.mouse.up();
  await page.evaluate(async () => {
    await window.BMS.card.updateComplete;
    await new Promise((r) => requestAnimationFrame(() => r(null)));
  });
}

const has = (page: Page, sel: string) =>
  page.evaluate((s) => !!window.BMS.root().querySelector(s), sel);

test.describe('Свет в конструкторе: оболочка и 3D', () => {
  test('после постановки светильника инспектор сам открывается на привязке', async ({ page }) => {
    await openShell(page);
    await placeFromPalette(page, 'ceiling_light', 3, 2.5);

    expect(await has(page, '[data-bind-prompt]'), 'привязку обязаны предложить сразу').toBe(true);
    expect(
      await page.evaluate(() => window.BMS.root().querySelector('[data-bind-prompt]')!.textContent!.trim()),
      'и сказать, зачем она',
    ).toContain('украшение');
    expect(await has(page, '[data-field="entity-search"]'), 'список устройств рядом').toBe(true);

    // Выбрали устройство — просьба выполнена и гаснет.
    await page.evaluate(async () => {
      (window.BMS.root().querySelector('[data-entity="light.zal"]') as HTMLElement).click();
      await window.BMS.card.updateComplete;
    });
    expect(await has(page, '[data-bound="light.zal"]'), 'привязка показана человеку').toBe(true);
    expect(await has(page, '[data-bind-prompt]'), 'выполненная просьба не висит на экране').toBe(false);
  });

  test('у набора светильников в инспекторе есть разброс и количество', async ({ page }) => {
    await openShell(page);
    await placeFromPalette(page, 'spotlight_bar', 3, 2.5);

    expect(await has(page, '[data-field="furn-spread"]'), 'разброс').toBe(true);
    expect(await has(page, '[data-field="furn-count"]'), 'количество').toBe(true);

    await page.locator('bms-floorplan-card input[data-field="furn-count"]').fill('9');
    await page.locator('bms-floorplan-card input[data-field="furn-count"]').press('Tab');
    await page.evaluate(() => window.BMS.card.updateComplete);
    expect(
      await page.evaluate(() => window.BMS.card.e2.plan.floors[0].furniture[0].count),
      'набранное количество ушло в план',
    ).toBe(9);

    // У обычного светильника этих полей быть не должно — они бы ничего не делали.
    await placeFromPalette(page, 'ceiling_light', 2, 1.5);
    expect(await has(page, '[data-field="furn-spread"]'), 'у одиночного светильника разброса нет').toBe(false);
  });

  test('привязанный светильник светится в 3D — на своей новой высоте', async ({ page }) => {
    await openShell(page);
    await placeFromPalette(page, 'ceiling_light', 3, 2.5);
    await page.evaluate(async () => {
      (window.BMS.root().querySelector('[data-entity="light.zal"]') as HTMLElement).click();
      await window.BMS.card.updateComplete;
    });
    const id = await page.evaluate(() => window.BMS.card.e2.plan.floors[0].furniture[0].id);

    // Живые состояния в режиме правки в сцену не идут — выходим в просмотр.
    await page.evaluate(async () => {
      (window.BMS.root().querySelector('[data-act="done"]') as HTMLElement).click();
      await window.BMS.card.updateComplete;
    });
    await page.waitForFunction(() => window.BMS.card.editing === false, undefined, { timeout: 20_000 });
    await settleScene(page);

    // Одной «силы свечения» мало: у непривязанной модели она равна единице,
    // просто цвет свечения чёрный. Смотрим ОБА числа — иначе проверка зеленела
    // бы и без привязки.
    const look = (furnId: string) =>
      page.evaluate((fid) => {
        const obj = window.BMS.card.sceneManager?.getFurnitureObject(fid);
        if (!obj) return null;
        obj.updateWorldMatrix(true, false);
        let power = -1;
        let tint = 0;
        obj.traverse((o: any) => {
          if (!o.isMesh || o.name !== 'emissive') return;
          power = Math.max(power, o.material?.emissiveIntensity ?? 0);
          tint = Math.max(tint, o.material?.emissive?.getHex?.() ?? 0);
        });
        return { y: obj.matrixWorld.elements[13], power, tint };
      }, furnId);

    await page.evaluate(() => window.BMS.setStates({ 'light.zal': { state: 'on' } }));
    await settleScene(page);
    const on = await look(id);
    expect(on, 'светильник обязан быть в сцене').not.toBeNull();
    expect(on!.y, `в 3D светильник оказался на высоте ${on!.y} м`).toBeCloseTo(2.55, 2);
    expect(on!.tint, 'у включённого светильника есть цвет свечения — значит привязка дошла').toBeGreaterThan(0);
    expect(on!.power, 'и сила свечения больше нуля').toBeGreaterThan(0);

    await page.evaluate(() => window.BMS.setStates({ 'light.zal': { state: 'off' } }));
    await settleScene(page);
    const off = await look(id);
    expect(off!.power, 'выключенный — не светится (иначе свечение не связано с состоянием)').toBe(0);
  });
});
