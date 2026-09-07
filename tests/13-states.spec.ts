// ---------------------------------------------------------------------------
// Состояния экрана: «устройства нет», «план грузится», «план не загрузился»,
// «это встроенный пример», «графика нет — вот почему».
//
// Все пять раньше выглядели одинаково — молчанием. Отвалившееся устройство
// показывалось как «выключено» (а из списка комнаты вовсе пропадало), загрузка
// — пустым тёмным прямоугольником, сбой — сырой английской строкой без единой
// кнопки, встроенный демо-план — чужой квартирой без объяснений.
// ---------------------------------------------------------------------------

import { test, expect, type Page } from '@playwright/test';
import { openHarness, mountCard } from './helpers/harness';
import { simplePlan, baseStates, type AnyPlan } from './helpers/plans';

/** План с РУЧНОЙ комнатой: устройства ей назначены списком, а не геометрией.
 *  Именно здесь пропажа была особенно наглой — сущность удаляли из Home
 *  Assistant, а панель комнаты просто переставала её показывать. */
function zonedPlan(): AnyPlan {
  const p = simplePlan();
  p.floors[0].zones = [
    { id: 'z1', name: 'Зал', x: 3, z: 2.5, entities: ['light.zal', 'lock.front_door'] },
  ];
  return p;
}

/** Открыть панель комнаты (первая комната активного этажа). */
async function openRoom(page: Page): Promise<void> {
  await page.waitForFunction(() => (window.BMS.card.rooms?.length ?? 0) > 0, undefined, { timeout: 20_000 });
  await page.evaluate(async () => {
    const c = window.BMS.card;
    c.activeRoomKey = c.rooms[0].key;
    c.requestUpdate();
    await c.updateComplete;
  });
}

/** Текст всей панели комнаты. */
const panelText = (page: Page) =>
  page.evaluate(() => (window.BMS.root().querySelector('.room-panel')?.textContent ?? '').replace(/\s+/g, ' ').trim());

test.describe('Устройства нет — и это видно', () => {
  test('недоступное устройство остаётся в комнате, помечено «Нет связи» и не управляется', async ({ page }) => {
    await openHarness(page);
    await mountCard(page, { config: { plan: zonedPlan() }, states: baseStates() });
    await openRoom(page);

    // КОНТРОЛЬ: пока связь есть — обычная карточка света, и команда доходит.
    expect(await panelText(page), 'исправный свет обязан быть в списке комнаты').toContain('Свет');
    expect(
      await page.evaluate(() => !!window.BMS.root().querySelector('.room-panel .card.lights')),
      'исправный свет — обычная карточка, а не «нет связи»',
    ).toBe(true);
    await page.evaluate(() => {
      window.BMS.card.svc('light', 'toggle', {}, 'light.zal', 'off');
    });
    expect(
      await page.evaluate(() => window.BMS.serviceCalls.length),
      'без этого «ноль вызовов» ниже был бы верен и для наглухо сломанной кнопки',
    ).toBe(1);

    // Устройство отвалилось.
    await page.evaluate(async () => {
      window.BMS.serviceCalls.length = 0;
      window.BMS.card.toast = undefined;
      window.BMS.setStates({ 'light.zal': { state: 'unavailable' } });
      await window.BMS.card.updateComplete;
    });

    const view = await page.evaluate(() => {
      const root = window.BMS.root();
      const card = root.querySelector('.room-panel .card.unavailable[data-entity="light.zal"]');
      return {
        shown: !!card,
        text: (card?.textContent ?? '').replace(/\s+/g, ' ').trim(),
        buttons: card ? card.querySelectorAll('button, input, select').length : -1,
        stillLooksLikeASwitch: !!root.querySelector('.room-panel .card.lights'),
        // 3D: подпись «Нет связи» над самим светильником на плане.
        inScene: (window.BMS.card.sceneManager as any).slots
          .some((s: any) => s.bindings.isOffline('light.zal')),
      };
    });

    expect(view.shown, 'пропавшее устройство обязано остаться на экране').toBe(true);
    expect(view.text, 'и обязано СКАЗАТЬ, что связи нет').toContain('Нет связи');
    expect(view.buttons, 'управлять тем, чего нет, нельзя — органов управления быть не должно').toBe(0);
    expect(view.stillLooksLikeASwitch, '«недоступно» не имеет права выглядеть как «выключено»').toBe(false);
    expect(view.inScene, 'на самом плане (3D) тоже обязана быть подпись «Нет связи»').toBe(true);

    // Команда к недоступному устройству никуда не уходит — и человеку об этом
    // говорят, а не делают вид, что всё получилось.
    await page.evaluate(() => {
      window.BMS.card.svc('light', 'toggle', {}, 'light.zal', 'off');
    });
    await page.waitForTimeout(200);
    expect(
      await page.evaluate(() => window.BMS.serviceCalls.length),
      'до отвалившегося устройства команда дойти не может',
    ).toBe(0);
    expect(await page.evaluate(() => String(window.BMS.card.toast ?? ''))).toContain('недоступно');
  });

  test('сущность, удалённая из Home Assistant, не исчезает из комнаты молча', async ({ page }) => {
    await openHarness(page);
    await mountCard(page, { config: { plan: zonedPlan() }, states: baseStates() });
    await openRoom(page);
    expect(await panelText(page)).toContain('Свет');

    // Сущность удалили (переименовали, убрали интеграцию — неважно).
    await page.evaluate(async () => {
      window.BMS.setStates({ 'light.zal': null });
      await window.BMS.card.updateComplete;
    });

    const after = await page.evaluate(() => {
      const card = window.BMS.root().querySelector('.room-panel .card.unavailable[data-entity="light.zal"]');
      return { shown: !!card, text: (card?.textContent ?? '').replace(/\s+/g, ' ').trim() };
    });
    expect(after.shown, 'устройство не имеет права исчезнуть без следа').toBe(true);
    expect(after.text, 'причину пропажи обязаны назвать').toMatch(/Нет связи|Home Assistant/);
  });
});

test.describe('План не загрузился', () => {
  test('человеческий текст вместо строки исключения и рабочая кнопка «Повторить»', async ({ page }) => {
    // Первый запрос плана отдаёт 404, второй — настоящий план. Так «Повторить»
    // проверяется по существу: кнопка обязана СХОДИТЬ ЗА ПЛАНОМ ЗАНОВО, а не
    // просто убрать сообщение с экрана.
    let serveThePlan = false;
    await page.route('**/plan-under-test.json', async (route) => {
      if (serveThePlan) {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(simplePlan()) });
      } else {
        await route.fulfill({ status: 404, contentType: 'text/plain', body: 'Not Found' });
      }
    });

    await openHarness(page);
    await mountCard(page, { config: { url: '/plan-under-test.json' }, states: baseStates() });

    const err = await page.evaluate(() => {
      const root = window.BMS.root();
      const box = root.querySelector('.error');
      const t = (sel: string) => (box?.querySelector(sel)?.textContent ?? '').replace(/\s+/g, ' ').trim();
      return {
        shown: !!box,
        title: t('.error-title'),
        what: t('.error-what'),
        detail: t('.error-detail'),
        retry: !!box?.querySelector('[data-act="retry"]'),
        retryText: (box?.querySelector('[data-act="retry"]')?.textContent ?? '').trim(),
      };
    });

    expect(err.shown, 'о несостоявшейся загрузке обязаны сказать').toBe(true);
    expect(err.title, 'заголовок — по-русски и про суть').toMatch(/[А-Яа-я]/);
    expect(err.title).toContain('не найден');
    expect(err.what, 'человеку обязаны сказать, ЧТО ДЕЛАТЬ').toMatch(/[А-Яа-я]/);
    expect(err.what.length, 'объяснение не может быть пустым').toBeGreaterThan(20);
    expect(err.what, 'объяснение — не пересказ исключения').not.toMatch(/HTTP 404|Failed to fetch/);
    // Техническая строка остаётся, но ОТДЕЛЬНО — она для монтажника.
    expect(err.detail).toContain('404');
    expect(err.retry, 'кнопка «Повторить» обязана быть').toBe(true);
    expect(err.retryText).toContain('Повторить');

    // Теперь план отдаётся — нажатие обязано его загрузить.
    serveThePlan = true;
    await page.evaluate(() => {
      (window.BMS.root().querySelector('.error [data-act="retry"]') as HTMLElement).click();
    });
    await page.waitForFunction(() => window.BMS.card.planLoaded === true, undefined, { timeout: 20_000 });

    const ok = await page.evaluate(() => ({
      err: window.BMS.card.loadError ?? null,
      box: !!window.BMS.root().querySelector('.error'),
      floors: window.BMS.card.sceneManager.floors.length,
    }));
    expect(ok.err, 'после успешной повторной загрузки сообщения быть не должно').toBeNull();
    expect(ok.box).toBe(false);
    expect(ok.floors, 'кнопка обязана ЗАГРУЗИТЬ план, а не просто стереть сообщение').toBe(1);
  });
});

test.describe('Встроенный пример', () => {
  test('демо-план подписан как пример и предлагает создать свой', async ({ page }) => {
    await openHarness(page);
    // Ничего не настроено и в хранилище пусто — карточка открывает образец.
    await mountCard(page, { config: {}, states: baseStates() });

    const demo = await page.evaluate(() => {
      const b = window.BMS.root().querySelector('.demo-banner');
      return {
        shown: !!b,
        text: (b?.textContent ?? '').replace(/\s+/g, ' ').trim(),
        make: (b?.querySelector('[data-act="make-plan"]')?.textContent ?? '').trim(),
        isDemo: window.BMS.card.isDemoPlan === true,
      };
    });
    expect(demo.isDemo, 'контроль: карточка действительно открыла встроенный пример').toBe(true);
    expect(demo.shown, 'чужую квартиру нельзя показывать молча').toBe(true);
    expect(demo.text).toContain('пример');
    expect(demo.make, 'из примера обязан быть выход — «создать свой план»').toContain('Создать свой план');
  });

  test('контроль: у настоящего плана подписи «это пример» нет', async ({ page }) => {
    // Без этого проверка выше была бы верна и для плашки, висящей ВСЕГДА.
    await openHarness(page);
    await mountCard(page, { config: { plan: simplePlan() }, states: baseStates() });
    expect(await page.evaluate(() => !!window.BMS.root().querySelector('.demo-banner'))).toBe(false);
    expect(await page.evaluate(() => window.BMS.card.isDemoPlan)).toBe(false);
  });
});

test.describe('Пустой график объясняет себя', () => {
  test('«датчик не привязан» и «архив не отвечает» — разные фразы', async ({ page }) => {
    const plan = simplePlan();
    plan.floors[0].zones = [
      // У этой комнаты датчик привязан — но архива истории на стенде нет.
      { id: 'z1', name: 'С датчиком', x: 2, z: 2, entities: ['light.zal'], tempSensor: 'sensor.zal_temp' },
      // А у этой не привязан ни один.
      { id: 'z2', name: 'Без датчика', x: 4, z: 3, entities: ['lock.front_door'] },
    ];
    await openHarness(page);
    await mountCard(page, {
      config: { plan },
      states: {
        ...baseStates(),
        'sensor.zal_temp': { state: '22.4', attributes: { friendly_name: 'Температура зала', device_class: 'temperature', unit_of_measurement: '°C' } },
      },
    });

    const noteFor = async (i: number) => {
      await page.evaluate(async (idx) => {
        const c = window.BMS.card;
        c.activeRoomKey = c.rooms[idx].key;
        c.requestUpdate();
        await c.updateComplete;
      }, i);
      // Ответ архива приходит не мгновенно — ждём, пока фраза перестанет быть
      // «загружаем».
      await page.waitForFunction(
        () => {
          const t = window.BMS.root().querySelector('.rp-spark-note')?.textContent ?? '';
          return !!t && !t.includes('Загружаем');
        },
        undefined,
        { timeout: 20_000, polling: 100 },
      );
      return page.evaluate(() => (window.BMS.root().querySelector('.rp-spark-note')?.textContent ?? '').trim());
    };

    const withSensor = await noteFor(0);
    const withoutSensor = await noteFor(1);

    expect(withSensor, 'датчик есть, а истории нет — так и надо сказать').toContain('Архив');
    expect(withoutSensor, 'датчика нет — это другая причина').toContain('Датчик не привязан');
    expect(withSensor, 'две разные причины не имеют права выглядеть одинаково').not.toBe(withoutSensor);
  });
});
