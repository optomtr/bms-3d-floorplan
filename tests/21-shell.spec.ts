// ---------------------------------------------------------------------------
// СТОРОЖ ОБОЛОЧКИ нового конструктора: раскладка, контекстный инспектор,
// вкладки планшета, цели под палец и палитра.
//
// Здесь проверяется ОБОЛОЧКА, а не движок черчения. Поэтому там, где нужен
// выбранный объект, движок подменяется «стойкой» прямо на стыке (getSelection /
// updateSelected из E2-CONTRACT.md): оболочка обязана спросить у движка ровно
// то, что положено, и отдать ему ровно тот патч, который набрал человек. Так
// проверки переживут подстановку настоящего движка — они не знают о нём
// ничего, кроме договора.
//
// Снимки раскладки кладутся в test-results/shots-e2 (папка не в репозитории).
// ---------------------------------------------------------------------------

import { test, expect, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { openHarness, mountCard, settleScene } from './helpers/harness';
import { simplePlan, baseStates } from './helpers/plans';

const SHOTS = 'test-results/shots-e2';

/** План с тем, что нужно инспектору: стены, комната, дверь, мебель, свет. */
function shellPlan() {
  const p = simplePlan();
  p.floors[0].walls[0] = {
    ...p.floors[0].walls[0],
    id: 'w1',
    thickness: 0.12,
    openings: [{ id: 'o1', kind: 'door', position: 2, width: 0.9, variant: 'single' }],
  } as any;
  p.floors[0].rooms[0].id = 'r1';
  p.floors[0].rooms[0].name = 'Зал';
  return p;
}

/** Открыть карточку и войти в НОВЫЙ конструктор. Ширину задаём хозяину
 *  карточки: раскладка смотрит на ширину самой карточки, а не окна. */
async function openShell(page: Page, width: string, height: string): Promise<void> {
  await openHarness(page);
  await page.evaluate((w) => {
    (document.getElementById('host') as HTMLElement).style.width = w;
  }, width);
  await mountCard(page, { config: { plan: shellPlan() }, states: baseStates(), height });
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
    // Место под 3D меряется после раскладки — дождёмся кадра.
    await new Promise((r) => requestAnimationFrame(() => r(null)));
  });
}

/** Подменить движок «стойкой» и положить в оболочку выбранный объект.
 *  Возвращает всё через window.__e2: патчи и текущий выбор. */
async function useSelection(page: Page, sel: Record<string, unknown>): Promise<void> {
  await page.evaluate(async (s) => {
    const w = window as any;
    const st = window.BMS.card.e2;
    w.__e2 = w.__e2 ?? { patches: [], sel: null };
    w.__e2.patches = [];
    w.__e2.sel = { ...s };
    st.editor.getSelection = () => w.__e2.sel;
    st.editor.updateSelected = (patch: Record<string, unknown>) => {
      w.__e2.patches.push(patch);
      Object.assign(w.__e2.sel, patch);
    };
    st.selection = w.__e2.sel;
    window.BMS.card.requestUpdate();
    await window.BMS.card.updateComplete;
  }, sel);
}

const val = (page: Page, field: string) =>
  page.evaluate(
    (f) => (window.BMS.root().querySelector(`[data-field="${f}"]`) as HTMLInputElement | null)?.value ?? null,
    field,
  );

const has = (page: Page, sel: string) =>
  page.evaluate((s) => !!window.BMS.root().querySelector(s), sel);

/** Цели под палец внутри оболочки, которые мельче порога. Меряются НАСТОЯЩИЕ
 *  прямоугольники, а не то, что написано в стилях. */
async function tooSmall(page: Page, min: number): Promise<string[]> {
  return page.evaluate((limit) => {
    const shell = window.BMS.root().querySelector('.e2-shell') as HTMLElement | null;
    if (!shell) return ['оболочки нет на экране'];
    const TAGS = new Set(['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA']);
    const out: string[] = [];
    for (const el of Array.from(shell.querySelectorAll('*'))) {
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden' || cs.pointerEvents === 'none') continue;
      if (el.closest('.hidden')) continue; // спрятанная вкладка — её не жмут
      const pointer = cs.cursor === 'pointer';
      const parentPointer = el.parentElement && getComputedStyle(el.parentElement).cursor === 'pointer';
      if (!TAGS.has(el.tagName) && !(pointer && !parentPointer)) continue;
      if (el.tagName === 'INPUT' && (el as HTMLInputElement).type === 'file') continue; // спрятан в подписи
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) continue;
      if (r.width < limit || r.height < limit) {
        const cls = (el.getAttribute('class') || '').trim().split(/\s+/).filter(Boolean).join('.');
        out.push(`${el.tagName.toLowerCase()}${cls ? '.' + cls : ''} ${Math.round(r.width)}x${Math.round(r.height)}`);
      }
    }
    return out;
  }, min);
}

/** Порог: 44 px, а на сенсорном экране 48 — так задано в стилях оболочки. */
const minTarget = (page: Page) =>
  page.evaluate(() => (matchMedia('(pointer: coarse)').matches ? 48 : 44));

test.describe('Новый конструктор: оболочка', () => {
  test('настольная раскладка: план слева, 3D справа, границу можно двигать, 3D сворачивается', async ({ page }) => {
    await openShell(page, '1440px', '820px');

    const boxes = () =>
      page.evaluate(() => {
        const root = window.BMS.root();
        const rect = (s: string) => {
          const el = root.querySelector(s) as HTMLElement | null;
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return { x: Math.round(r.left), w: Math.round(r.width), h: Math.round(r.height) };
        };
        return {
          plan: rect('.e2-plan'),
          slot: rect('.e2-3d-slot'),
          inspect: rect('.e2-inspect-wrap'),
          viewport: rect('.viewport'),
          vis: getComputedStyle(window.BMS.card).getPropertyValue('--e2-vp-vis').trim(),
          narrow: window.BMS.card.e2.narrow,
        };
      });

    let b = await boxes();
    expect(b.narrow, 'на 1440 px это настольная раскладка, не вкладки').toBe(false);
    expect(b.plan!.w, 'план — главный: он шире правой колонки').toBeGreaterThan(b.slot!.w);
    expect(b.plan!.x, 'план слева').toBeLessThan(b.slot!.x);
    expect(b.vis, 'холст 3D показан').toBe('visible');
    // Холст стоит РОВНО на своём месте-заглушке — иначе 3D уехало бы за край.
    expect(b.viewport, 'холст 3D совпадает с местом под него').toEqual(b.slot);
    expect(b.inspect!.x, 'инспектор в правой колонке, под 3D').toBe(b.slot!.x);

    // Разделитель двигается (клавишами — чтобы проверка не зависела от мыши).
    const before = b.plan!.w;
    await page.evaluate(async () => {
      const grip = window.BMS.root().querySelector('.e2-grip') as HTMLElement;
      grip.focus();
      grip.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
      await window.BMS.card.updateComplete;
      await new Promise((r) => requestAnimationFrame(() => r(null)));
    });
    b = await boxes();
    expect(b.plan!.w, 'стрелка влево отдаёт ширину трёхмерному виду').toBeLessThan(before);
    expect(b.viewport, 'холст 3D переехал вместе с границей').toEqual(b.slot);

    // 3D сворачивается — план получает всё.
    await page.evaluate(async () => {
      (window.BMS.root().querySelector('[data-act="toggle-3d"]') as HTMLElement).click();
      await window.BMS.card.updateComplete;
      await new Promise((r) => requestAnimationFrame(() => r(null)));
    });
    const after = await boxes();
    expect(after.vis, 'свёрнутый 3D не показывает холст').toBe('hidden');
    expect(after.plan!.w, 'свёрнутый 3D отдаёт ширину плану').toBeGreaterThan(b.plan!.w);
  });

  test('инспектор показывает свойства ИМЕННО выбранного объекта', async ({ page }) => {
    await openShell(page, '1440px', '820px');

    // Ничего не выбрано — этаж и подсказка, а не пятнадцать разделов.
    expect(await has(page, '[data-field="floor-name"]'), 'без выбора показан этаж').toBe(true);
    expect(await has(page, '[data-field="wall-length"]')).toBe(false);

    await useSelection(page, {
      kind: 'wall', id: 'w1', lengthM: 6, thicknessM: 0.12, angleDeg: 90, material: 'brick',
    });
    expect(await val(page, 'wall-length')).toBe('6');
    expect(await val(page, 'wall-thickness')).toBe('0.12');
    expect(await val(page, 'wall-angle')).toBe('90');
    expect(await has(page, '[data-field="wall-material"] .e2-chip.on')).toBe(true);
    expect(
      await page.evaluate(
        () => window.BMS.root().querySelector('[data-field="wall-material"] .e2-chip.on')!.textContent!.trim(),
      ),
      'выбранное покрытие подсвечено и названо по-русски',
    ).toBe('Кирпич');
    expect(await has(page, '[data-field="room-name"]'), 'свойств комнаты у стены быть не должно').toBe(false);
    expect(await has(page, '[data-field="furn-rotation"]')).toBe(false);

    await useSelection(page, { kind: 'room', id: 'r1', name: 'Зал', areaM2: 30, material: 'wood' });
    expect(await val(page, 'room-name')).toBe('Зал');
    expect(await val(page, 'room-area'), 'площадь показана').toBe('30');
    expect(
      await page.evaluate(
        () => (window.BMS.root().querySelector('[data-field="room-area"]') as HTMLInputElement).readOnly,
      ),
      'площадь только для чтения — её не задают, её считают',
    ).toBe(true);
    expect(await has(page, '[data-field="wall-length"]'), 'свойств стены у комнаты быть не должно').toBe(false);

    await useSelection(page, {
      kind: 'furniture', id: 'f1', model: 'floor_lamp', rotationDeg: 0, scale: 1,
    });
    expect(
      await page.evaluate(() => window.BMS.root().querySelector('.e2-inspect-head span')!.textContent!.trim()),
      'заголовок инспектора — название модели по-русски',
    ).toBe('Торшер');
    expect(await has(page, '[data-field="entity-search"]'), 'у мебели есть поиск по сущностям').toBe(true);
    expect(await has(page, '[data-field="room-area"]')).toBe(false);
  });

  test('инспектор МЕНЯЕТ свойство выбранного: «3,5» уходит в движок как 3.5', async ({ page }) => {
    await openShell(page, '1440px', '820px');
    await useSelection(page, {
      kind: 'wall', id: 'w1', lengthM: 6, thicknessM: 0.12, angleDeg: 0,
    });

    const input = page.locator('bms-floorplan-card input[data-field="wall-thickness"]');
    await input.click();
    await page.keyboard.press('ControlOrMeta+a');
    await page.keyboard.type('3,5'); // русская раскладка: разделитель — запятая
    await page.keyboard.press('Tab');

    const patches = await page.evaluate(() => (window as any).__e2.patches);
    expect(patches, 'правка обязана уйти движку одним патчем').toHaveLength(1);
    expect(patches[0], '«3,5» — это 3.5, а не 3 и не NaN').toEqual({ thicknessM: 3.5 });
    expect(await val(page, 'wall-thickness'), 'поле показывает применённое значение').toBe('3.5');

    // Плитка покрытия — тот же путь, без выпадающих окошек браузера.
    await page.evaluate(async () => {
      (window.BMS.root().querySelector('[data-field="wall-material"] [data-chip="panel"]') as HTMLElement).click();
      await window.BMS.card.updateComplete;
    });
    const all = await page.evaluate(() => (window as any).__e2.patches);
    expect(all[1]).toEqual({ material: 'panel' });

    // Привязка сущности Home Assistant — поиск по всем сущностям.
    await useSelection(page, {
      kind: 'furniture', id: 'lamp1', model: 'floor_lamp', rotationDeg: 0, scale: 1,
    });
    await page.evaluate(async () => {
      const box = window.BMS.root().querySelector('[data-field="entity-search"]') as HTMLInputElement;
      box.value = 'zal';
      box.dispatchEvent(new Event('input', { bubbles: true }));
      await window.BMS.card.updateComplete;
      (window.BMS.root().querySelector('[data-entity="light.zal"]') as HTMLElement).click();
      await window.BMS.card.updateComplete;
    });
    const bound = await page.evaluate(() => (window as any).__e2.patches);
    expect(bound[bound.length - 1], 'выбранная сущность уходит движку').toEqual({ entityId: 'light.zal' });
    expect(await has(page, '[data-bound="light.zal"]'), 'привязка показана человеку').toBe(true);
  });

  test('планшет книжный: вкладки «План» и «3D» не теряют состояние черчения', async ({ page }) => {
    await page.setViewportSize({ width: 800, height: 1280 });
    await openShell(page, '800px', '1180px');

    expect(await page.evaluate(() => window.BMS.card.e2.narrow), 'узкая карточка = вкладки').toBe(true);
    expect(await has(page, '.e2-tabs'), 'вкладки на месте').toBe(true);
    expect(await has(page, '.e2-grip'), 'разделителя в книжной раскладке нет').toBe(false);

    // Помечаем ЖИВОЙ узел плана и сам движок: если переключение вкладок
    // пересоберёт их, состояние черчения будет потеряно молча.
    await page.evaluate(() => {
      const w = window as any;
      const host = window.BMS.root().querySelector('.e2-plan-host') as HTMLElement;
      host.dataset.mark = 'сохранить-меня';
      w.__engine = window.BMS.card.e2.editor;
      w.__host = host;
      // И сама поверхность черчения, которую движок положил внутрь: если её
      // пересоберут, недочерченная стена пропадёт вместе с ней.
      w.__surface = host.firstElementChild;
      window.BMS.card.e2.selection = { kind: 'room', id: 'r1', name: 'Зал', areaM2: 30 };
      window.BMS.card.requestUpdate();
    });

    const state = () =>
      page.evaluate(() => {
        const w = window as any;
        const root = window.BMS.root();
        const host = root.querySelector('.e2-plan-host') as HTMLElement | null;
        const plan = root.querySelector('.e2-plan') as HTMLElement | null;
        return {
          hostAlive: !!host && host === w.__host && host.dataset.mark === 'сохранить-меня',
          surfaceAlive: !!host && !!w.__surface && host.firstElementChild === w.__surface,
          sameEngine: window.BMS.card.e2.editor === w.__engine,
          planInDom: !!plan,
          planVisible: !!plan && getComputedStyle(plan).visibility === 'visible',
          selection: window.BMS.card.e2.selection?.id ?? null,
          vis: getComputedStyle(window.BMS.card).getPropertyValue('--e2-vp-vis').trim(),
        };
      });

    let s = await state();
    expect(s.planVisible, 'по умолчанию открыта вкладка «План»').toBe(true);
    expect(s.vis, 'на вкладке «План» холст 3D не лезет поверх').toBe('hidden');

    await page.evaluate(async () => {
      (window.BMS.root().querySelector('[data-tab="3d"]') as HTMLElement).click();
      await window.BMS.card.updateComplete;
      await new Promise((r) => requestAnimationFrame(() => r(null)));
    });
    s = await state();
    expect(s.vis, 'вкладка «3D» показывает холст').toBe('visible');
    expect(s.planInDom, 'план ОСТАЁТСЯ в разметке — иначе движок размонтируется').toBe(true);
    expect(s.planVisible, 'но не виден').toBe(false);
    expect(s.hostAlive, 'узел плана тот же самый').toBe(true);
    expect(s.surfaceAlive, 'поверхность черчения не пересобрана — недочерченное на месте').toBe(true);
    expect(s.sameEngine, 'движок тот же самый').toBe(true);

    await page.evaluate(async () => {
      (window.BMS.root().querySelector('[data-tab="plan"]') as HTMLElement).click();
      await window.BMS.card.updateComplete;
      await new Promise((r) => requestAnimationFrame(() => r(null)));
    });
    s = await state();
    expect(s.planVisible, 'вернулись к плану').toBe(true);
    expect(s.hostAlive, 'узел плана пережил оба переключения').toBe(true);
    expect(s.surfaceAlive, 'поверхность черчения пережила оба переключения').toBe(true);
    expect(s.sameEngine, 'движок пережил оба переключения').toBe(true);
    expect(s.selection, 'выбранное пережило переключение').toBe('r1');
  });

  test('цели под палец: ни одной мельче порога — и в настольной раскладке, и в планшетной', async ({ page }) => {
    const min = await (async () => {
      await openShell(page, '1440px', '820px');
      return minTarget(page);
    })();

    // Открываем всё, по чему жмут: инспектор мебели, палитру, ящик «Проект».
    await useSelection(page, { kind: 'furniture', id: 'f1', model: 'sofa', rotationDeg: 0, scale: 1 });
    expect(
      await page.evaluate(() => window.BMS.root().querySelectorAll('.e2-rail .e2-btn').length),
      'полоса инструментов обязана быть на экране — иначе меряли бы пустоту',
    ).toBeGreaterThan(9);
    let small = await tooSmall(page, min);
    expect(small.join('; '), `настольная раскладка, порог ${min}px`).toBe('');

    await page.evaluate(async () => {
      window.BMS.card.e2.paletteOpen = true;
      window.BMS.card.requestUpdate();
      await window.BMS.card.updateComplete;
    });
    expect(
      await page.evaluate(() => window.BMS.root().querySelectorAll('.e2-model-cell').length),
      'палитра обязана быть заполнена',
    ).toBeGreaterThan(5);
    small = await tooSmall(page, min);
    expect(small.join('; '), `палитра, порог ${min}px`).toBe('');

    await page.evaluate(async () => {
      window.BMS.card.e2.paletteOpen = false;
      window.BMS.card.e2.projectOpen = true;
      window.BMS.card.requestUpdate();
      await window.BMS.card.updateComplete;
    });
    expect(await has(page, '.e2-drawer'), 'ящик «Проект» открыт').toBe(true);
    small = await tooSmall(page, min);
    expect(small.join('; '), `ящик «Проект», порог ${min}px`).toBe('');

    // Планшетная раскладка — свой прогон: раскладка другая, кнопки другие.
    await page.setViewportSize({ width: 800, height: 1280 });
    await openShell(page, '800px', '1180px');
    await useSelection(page, { kind: 'wall', id: 'w1', lengthM: 6, thicknessM: 0.12, angleDeg: 0 });
    expect(await has(page, '.e2-tabs'), 'вкладки на месте').toBe(true);
    small = await tooSmall(page, await minTarget(page));
    expect(small.join('; '), 'планшетная раскладка').toBe('');
  });

  test('палитра мебели: русские названия, разделы и передача модели движку', async ({ page }) => {
    await openShell(page, '1440px', '820px');

    await page.evaluate(async () => {
      const w = window as any;
      w.__models = [];
      window.BMS.card.e2.editor.setPendingModel = (m: string | null) => w.__models.push(m);
      (window.BMS.root().querySelector('[data-act="tool-furniture"]') as HTMLElement).click();
      await window.BMS.card.updateComplete;
    });
    expect(await has(page, '.e2-palette'), 'инструмент «Мебель» открывает палитру').toBe(true);

    const cats = await page.evaluate(() =>
      [...window.BMS.root().querySelectorAll('.e2-cats .e2-chip')].map((e) => e.textContent!.trim()),
    );
    expect(cats, 'разделы палитры — по-русски').toContain('Диваны и кресла');
    expect(cats).toContain('Освещение');

    const cells = await page.evaluate(() =>
      [...window.BMS.root().querySelectorAll('.e2-model-cell')].map((e) => e.textContent!.trim()),
    );
    expect(cells, 'плитки подписаны по-русски, а не ключами').toContain('Диван угловой');
    expect(cells.join(' '), 'машинных подписей вида Sofa L быть не должно').not.toMatch(/Sofa|Armchair/);

    await page.evaluate(async () => {
      (window.BMS.root().querySelector('[data-cat="lighting"]') as HTMLElement).click();
      await window.BMS.card.updateComplete;
    });
    const lights = await page.evaluate(() =>
      [...window.BMS.root().querySelectorAll('.e2-model-cell')].map((e) => e.textContent!.trim()),
    );
    expect(lights, 'раздел «Освещение» показывает светильники').toContain('Люстра');

    await page.evaluate(async () => {
      const box = window.BMS.root().querySelector('[data-field="palette-search"]') as HTMLInputElement;
      box.value = 'унитаз';
      box.dispatchEvent(new Event('input', { bubbles: true }));
      await window.BMS.card.updateComplete;
    });
    expect(
      await page.evaluate(() =>
        [...window.BMS.root().querySelectorAll('.e2-model-cell')].map((e) => e.textContent!.trim()),
      ),
      'поиск идёт по русскому названию',
    ).toEqual(['Унитаз']);

    await page.evaluate(async () => {
      (window.BMS.root().querySelector('[data-model="toilet"]') as HTMLElement).click();
      await window.BMS.card.updateComplete;
    });
    expect(
      await page.evaluate(() => (window as any).__models),
      'выбранная модель уходит движку через setPendingModel',
    ).toContain('toilet');
    expect(await has(page, '.e2-palette'), 'после выбора палитра закрывается').toBe(false);
  });

  test('снимки раскладки: 1440, планшет 1280x800 и 800x1280', async ({ page }) => {
    mkdirSync(SHOTS, { recursive: true });

    await page.setViewportSize({ width: 1440, height: 900 });
    await openShell(page, '1440px', '860px');
    await useSelection(page, {
      kind: 'wall', id: 'w1', lengthM: 6, thicknessM: 0.12, angleDeg: 0, material: 'plain',
    });
    await page.locator('bms-floorplan-card').screenshot({ path: `${SHOTS}/desktop-1440.png` });

    await page.setViewportSize({ width: 1280, height: 800 });
    await openShell(page, '1280px', '760px');
    await useSelection(page, { kind: 'room', id: 'r1', name: 'Зал', areaM2: 30, material: 'wood' });
    await page.locator('bms-floorplan-card').screenshot({ path: `${SHOTS}/tablet-1280x800.png` });

    await page.setViewportSize({ width: 800, height: 1280 });
    await openShell(page, '800px', '1180px');
    await useSelection(page, {
      kind: 'furniture', id: 'lamp1', model: 'floor_lamp', rotationDeg: 0, scale: 1,
    });
    await page.locator('bms-floorplan-card').screenshot({ path: `${SHOTS}/tablet-800x1280-plan.png` });
    await page.evaluate(async () => {
      (window.BMS.root().querySelector('[data-tab="3d"]') as HTMLElement).click();
      await window.BMS.card.updateComplete;
      await new Promise((r) => requestAnimationFrame(() => r(null)));
    });
    await page.waitForTimeout(400);
    await page.locator('bms-floorplan-card').screenshot({ path: `${SHOTS}/tablet-800x1280-3d.png` });

    // Снимок без содержимого ничего не показывает — убеждаемся, что было что снимать.
    expect(await has(page, '.e2-shell')).toBe(true);
  });
});
