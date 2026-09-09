// ---------------------------------------------------------------------------
// СТОРОЖ НАДПИСИ «НЕТ СВЯЗИ».
//
// Случай с живого объекта: клиент видит в 3D висящие надписи «Нет связи» и
// пугается. Разгадка — сцена считала одинаковыми две РАЗНЫЕ вещи:
//
//   • устройство ЕСТЬ, но не отвечает (`unavailable`) — это его дело: питание,
//     сеть, шлюз. Надпись полезна и обязана остаться;
//   • сущности в Home Assistant НЕТ ВОВСЕ — её удалили или переименовали.
//     Это устаревшая привязка в плане. Клиенту про неё писать нечего: чинить
//     ему нечем, а «Нет связи» он читает как поручение себе.
//
// На объекте таких было четыре — остатки чужого демо-дома (кухня и домофон,
// которых в офисе нет). Здесь они названы теми же идентификаторами.
//
// Стерегутся четыре вещи:
//   • удалённая сущность НЕ пишет «Нет связи» на плане;
//   • `unavailable` — пишет (контроль: «выключить надпись совсем» не пройдёт);
//   • конструктор показывает число устаревших привязок и их список;
//   • кнопка чистки убирает РОВНО битые и не трогает живые (и это обычная
//     правка плана: она и отменяется, и сохраняется как все остальные).
//
// Каждая ломалась в исходнике и краснела — чем именно, написано в отчёте.
// ---------------------------------------------------------------------------

import { expect, test, type Page } from '@playwright/test';
import { mountCard, openHarness, settleScene, waitToast } from './helpers/harness';
import { boxWalls } from './helpers/plans';

/** Ровно те четыре привязки-сироты, что висят у владельца. */
const GHOSTS = ['light.liustra_3', 'cover.kukhnia_roller', 'cover.shtory_ab', 'camera.domofon_video'];

/** Пятая — датчик. Он отдельный случай: подпись у него ОБЩАЯ (та же, что
 *  показывает значение), и её тоже нельзя оставить ни с «Нет связи», ни с
 *  последним показанием умершей сущности. */
const GHOST_SENSOR = 'sensor.propavshii_datchik';

const ALL_GHOSTS = [...GHOSTS, GHOST_SENSOR];

/** Живые привязки. Без них любая проверка «ничего не нарисовано» была бы
 *  верна и для пустой сцены. */
const LIVE = ['light.zhivoi', 'sensor.zhivoi_datchik'];

/** Офисный план: две живые привязки и пять ведущих в никуда. */
function officePlan(withGhosts = true) {
  const bindings: Record<string, unknown>[] = [
    { entity_id: 'light.zhivoi', anchor_object: 'lamp', behavior: 'light' },
    { entity_id: 'sensor.zhivoi_datchik', anchor_object: 'termo', behavior: 'sensor' },
  ];
  if (withGhosts) {
    bindings.push(
      { entity_id: 'light.liustra_3', anchor_object: 'ghostLamp', behavior: 'light' },
      { entity_id: 'cover.kukhnia_roller', anchor_object: 'ghostCurtain1', behavior: 'cover' },
      { entity_id: 'cover.shtory_ab', anchor_object: 'ghostCurtain2', behavior: 'cover' },
      { entity_id: 'camera.domofon_video', anchor_object: 'ghostCam' },
      { entity_id: GHOST_SENSOR, anchor_object: 'ghostSensor', behavior: 'sensor' },
    );
  }
  return {
    name: 'Офис',
    wallHeight: 2.7,
    floors: [
      {
        name: '1 Этаж',
        elevation: 0,
        wallHeight: 2.7,
        walls: boxWalls(10, 8),
        rooms: [{ name: 'Кабинет', polygon: [[0, 0], [10, 0], [10, 8], [0, 8]] }],
        // Мебель ОДНА И ТА ЖЕ с призраками и без них: разница между двумя
        // планами — только привязки, иначе сравнивать было бы нечего.
        furniture: [
          { id: 'lamp', model: 'ceiling_light', position: [2, 2.5, 2] },
          { id: 'termo', model: 'sofa', position: [3, 0, 4] },
          { id: 'ghostLamp', model: 'ceiling_light', position: [7, 2.5, 6] },
          { id: 'ghostCurtain1', model: 'curtain', position: [8, 1, 6] },
          { id: 'ghostCurtain2', model: 'curtain', position: [9.4, 1, 6] },
          { id: 'ghostCam', model: 'tv', position: [1, 1.8, 7] },
          { id: 'ghostSensor', model: 'sofa', position: [6, 0, 1] },
        ],
        bindings,
      },
    ],
  };
}

const officeStates = () => ({
  'light.zhivoi': { state: 'on', attributes: { friendly_name: 'Свет кабинета' } },
  'sensor.zhivoi_datchik': {
    state: '23',
    attributes: { friendly_name: 'Температура', unit_of_measurement: '°C' },
  },
});

/** Написана ли сейчас «Нет связи» над этой сущностью — по факту ОТРИСОВКИ
 *  (BindingManager.isOffline ставится в showOffline, а не считается по
 *  состоянию сущности). */
const offlineOnPlan = (page: Page, id: string) =>
  page.evaluate(
    (eid) => (window.BMS.card.sceneManager as any).slots.some((s: any) => s.bindings.isOffline(eid)),
    id,
  );

/** Сколько подписей-спрайтов ВИДНО на плане. Считаем и родителей: этаж,
 *  который спрятан, не показывает своих подписей. */
const visibleSprites = (page: Page) =>
  page.evaluate(() => {
    let n = 0;
    (window.BMS.card.sceneManager as any).scene.traverse((o: any) => {
      if (!o.isSprite) return;
      for (let p = o; p; p = p.parent) if (!p.visible) return;
      n++;
    });
    return n;
  });

/** Вход в новый конструктор — тот же, что у остальных проверок оболочки. */
async function enterEditor2(page: Page): Promise<void> {
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

/** Что показывает плашка устаревших привязок. */
const warnBox = (page: Page) =>
  page.evaluate(() => {
    const el = window.BMS.root().querySelector('.e2-warn') as HTMLElement | null;
    if (!el) return null;
    return {
      text: (el.textContent ?? '').replace(/\s+/g, ' ').trim(),
      count: el.getAttribute('data-broken'),
      rows: [...el.querySelectorAll('.e2-warn-list li')].map((li) =>
        (li.textContent ?? '').replace(/\s+/g, ' ').trim(),
      ),
      hasButton: !!el.querySelector('[data-act="clean-broken"]'),
    };
  });

/** Идентификаторы привязок правимого плана. */
const planBindings = (page: Page) =>
  page.evaluate(() =>
    ((window.BMS.card.e2.plan.floors[0].bindings ?? []) as { entity_id: string }[])
      .map((b) => b.entity_id),
  );

test.describe('Привязка устарела — это не «нет связи»', () => {
  test('привязка к УДАЛЁННОЙ сущности не пишет «Нет связи» на плане', async ({ page }) => {
    await openHarness(page);
    await mountCard(page, { config: { plan: officePlan() }, states: officeStates(), height: '620px' });
    await settleScene(page);

    // КОНТРОЛЬ: живые привязки на месте. Без этого «ничего не написано» было
    // бы верно и для сцены, которая вообще не собралась.
    const bound = await page.evaluate((ids) =>
      ids.map((id) => (window.BMS.card.sceneManager as any).slots.some((s: any) => s.bindings.has(id))),
      [...LIVE, ...ALL_GHOSTS],
    );
    expect(bound.every(Boolean), 'все привязки плана обязаны попасть в сцену').toBe(true);

    for (const id of ALL_GHOSTS) {
      expect(
        await offlineOnPlan(page, id),
        `«${id}»: сущности нет в Home Assistant — это устаревшая привязка, а не «нет связи»`,
      ).toBe(false);
    }

    // И то же самое замером, а не признаком: план с призраками показывает
    // РОВНО столько же подписей, сколько план без них. Признак isOffline
    // считает свои надписи сам — замер считает то, что действительно висит.
    const withGhosts = await visibleSprites(page);
    await page.evaluate(() => window.BMS.unmount());
    await mountCard(page, {
      config: { plan: officePlan(false) },
      states: officeStates(),
      height: '620px',
    });
    await settleScene(page);
    const withoutGhosts = await visibleSprites(page);
    expect(
      withGhosts,
      'пять привязок в никуда не имеют права добавить на план ни одной подписи',
    ).toBe(withoutGhosts);
  });

  test('КОНТРОЛЬ: устройство в состоянии «unavailable» надпись получает', async ({ page }) => {
    // Без этой проверки «починка» могла бы свестись к «выключить надпись
    // совсем» — и никто бы не заметил.
    await openHarness(page);
    await mountCard(page, { config: { plan: officePlan() }, states: officeStates(), height: '620px' });
    await settleScene(page);

    expect(await offlineOnPlan(page, 'light.zhivoi'), 'исправный свет молчит').toBe(false);
    const before = await visibleSprites(page);

    // Устройство отвалилось: оно ЕСТЬ в Home Assistant и не отвечает.
    await page.evaluate(async () => {
      window.BMS.setStates({ 'light.zhivoi': { state: 'unavailable' } });
      await window.BMS.card.updateComplete;
    });
    await page.waitForTimeout(300);

    expect(
      await offlineOnPlan(page, 'light.zhivoi'),
      'устройство не отвечает — про это человеку сказать надо',
    ).toBe(true);
    expect(
      await visibleSprites(page),
      'и надпись обязана появиться на плане, а не только в признаке',
    ).toBe(before + 1);

    // Датчик: подпись у него общая — она обязана смениться на «Нет связи».
    await page.evaluate(async () => {
      window.BMS.setStates({ 'sensor.zhivoi_datchik': { state: 'unavailable' } });
      await window.BMS.card.updateComplete;
    });
    await page.waitForTimeout(300);
    expect(await offlineOnPlan(page, 'sensor.zhivoi_datchik')).toBe(true);

    // А призраки как молчали, так и молчат — их состояние не менялось.
    for (const id of ALL_GHOSTS) expect(await offlineOnPlan(page, id), id).toBe(false);
  });
});

test.describe('Устаревшие привязки видно тому, кто правит план', () => {
  test('конструктор показывает их число и список', async ({ page }) => {
    await openHarness(page);
    await mountCard(page, { config: { plan: officePlan() }, states: officeStates(), height: '760px' });
    await settleScene(page);
    await enterEditor2(page);

    const warn = await warnBox(page);
    expect(warn, 'плашка обязана быть: молчать про это нельзя').toBeTruthy();
    expect(warn!.text, 'сколько их — цифрой, по-русски').toContain(
      `Привязок к несуществующим устройствам: ${ALL_GHOSTS.length}`,
    );
    expect(warn!.count).toBe(String(ALL_GHOSTS.length));
    expect(warn!.hasButton, 'рядом обязана быть кнопка «убрать»').toBe(true);

    const rows = warn!.rows.join(' | ');
    for (const id of ALL_GHOSTS) {
      expect(rows, `в списке обязан быть ${id} — иначе искать нечего`).toContain(id);
    }
    // И не только идентификатор: человек ищет глазами ВЕЩЬ на плане.
    expect(rows, 'какой предмет ведёт в никуда — тоже').toContain('Светильник потолочный');
    expect(rows).toContain('Шторы');
    for (const id of LIVE) {
      expect(rows, `живую привязку ${id} оговаривать не за что`).not.toContain(id);
    }

    // КОНТРОЛЬ: в плане без сирот плашки нет. Постоянно висящее
    // предупреждение перестаёт читаться на второй день.
    await page.evaluate(() => window.BMS.unmount());
    await mountCard(page, {
      config: { plan: officePlan(false) },
      states: officeStates(),
      height: '760px',
    });
    await settleScene(page);
    await enterEditor2(page);
    expect(await warnBox(page), 'жаловаться не на что — и плашки быть не должно').toBeNull();
  });

  test('кнопка чистки убирает РОВНО битые привязки', async ({ page }) => {
    await openHarness(page);
    await mountCard(page, { config: { plan: officePlan() }, states: officeStates(), height: '760px' });
    await settleScene(page);
    await enterEditor2(page);

    expect(await planBindings(page), 'до чистки в плане все семь').toEqual([...LIVE, ...ALL_GHOSTS]);

    // Системных окошек браузера в проекте нет — считаем их вызовы.
    await page.evaluate(() => {
      const w = window as any;
      w.__native = 0;
      window.confirm = () => (w.__native++, true);
      window.alert = () => void w.__native++;
      window.prompt = () => (w.__native++, '');
    });

    await page.evaluate(async () => {
      (window.BMS.root().querySelector('[data-act="clean-broken"]') as HTMLElement).click();
      await window.BMS.card.updateComplete;
    });

    expect(
      await page.evaluate(() => !!window.BMS.root().querySelector('.ask-form')),
      'спрашивают своим окном карточки',
    ).toBe(true);
    expect(await page.evaluate(() => (window as any).__native), 'системных окон быть не должно').toBe(0);

    // Пока не ответили «да» — план не тронут.
    expect(await planBindings(page), 'вопрос ещё не отвечен — правки нет').toHaveLength(7);

    await page.evaluate(async () => {
      (window.BMS.root().querySelector('.ask-form button[type="submit"]') as HTMLElement).click();
      await window.BMS.card.updateComplete;
    });
    // Ждём ЛЮБОЙ правки, а не «стало ровно две»: иначе чистка, снёсшая заодно
    // живые привязки, свалилась бы по таймауту вместо внятного сравнения.
    await page.waitForFunction(
      () => ((window.BMS.card.e2.plan.floors[0].bindings ?? []) as unknown[]).length !== 7,
      undefined,
      { timeout: 10_000 },
    );

    expect(await planBindings(page), 'убраны ровно битые, живые не тронуты').toEqual(LIVE);
    expect(
      await page.evaluate(() => (window.BMS.card.e2.plan.floors[0].furniture ?? []).length),
      'предметы на плане остаются: убирали ссылку на устройство, а не мебель',
    ).toBe(7);
    expect(await warnBox(page), 'жаловаться больше не на что').toBeNull();

    // Это ОБЫЧНАЯ правка плана: она отменяется…
    expect(await page.evaluate(() => window.BMS.card.e2.canUndo), 'правка попала в отмену').toBe(true);
    await page.evaluate(async () => {
      (window.BMS.root().querySelector('[data-act="undo"]') as HTMLElement).click();
      await window.BMS.card.updateComplete;
    });
    expect(await planBindings(page), '«Отменить» возвращает всё как было').toEqual([
      ...LIVE,
      ...ALL_GHOSTS,
    ]);

    // …и уезжает тем же «Сохранить», что и остальные правки редактора.
    await page.evaluate(async () => {
      (window.BMS.root().querySelector('[data-act="redo"]') as HTMLElement).click();
      await window.BMS.card.updateComplete;
      window.BMS.card.toast = undefined;
      (window.BMS.root().querySelector('[data-act="save"]') as HTMLElement).click();
    });
    await waitToast(page, 'сохранён');
    const saved: string[] = await page.evaluate(() => {
      const projects = Object.values(window.BMS.wsStore.shared?.projects ?? {}) as any[];
      const plan = projects[projects.length - 1];
      return ((plan?.floors?.[0]?.bindings ?? []) as { entity_id: string }[]).map((b) => b.entity_id);
    });
    expect(saved, 'в сохранённом плане битых привязок нет').toEqual(LIVE);
  });
});
