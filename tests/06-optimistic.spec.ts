import { test, expect, type Page } from '@playwright/test';
import { openHarness, mountCard } from './helpers/harness';
import { simplePlan, baseStates } from './helpers/plans';

/** Открыть попап управления для набора сущностей — так же, как это делает
 *  handlePick после тапа (сам тап проверяется в 05-touch-tap). */
async function openPopup(page: Page, ids: string[]): Promise<void> {
  await page.evaluate(async (list) => {
    const c = window.BMS.card;
    c.controlRoom = null;
    c.controlCategory = null;
    c.controlEntities = list;
    c.controlPos = [300, 200];
    c.controlOpenedAt = performance.now();
    c.controlOpen = true;
    c.requestUpdate();
    await c.updateComplete;
  }, ids);
}

const effState = (page: Page, id: string) =>
  page.evaluate((e) => window.BMS.card.effState(e), id);

test.describe('Оптимистичное состояние', () => {
  test('отказ службы откатывает предположенное состояние', async ({ page }) => {
    await openHarness(page);
    await mountCard(page, { config: { plan: simplePlan() }, states: baseStates() });

    await page.evaluate(() => {
      window.BMS.serviceHandler = () =>
        new Promise((_, rej) => setTimeout(() => rej(new Error('устройство не ответило')), 300));
    });

    await openPopup(page, ['light.zal']);
    await page.evaluate(() => {
      (window.BMS.root().querySelector('.control-popup [title="Toggle"]') as HTMLElement).click();
    });

    // Мгновенная реакция — ради неё оптимизм и заведён.
    expect(await effState(page, 'light.zal'), 'экран обязан ответить сразу').toBe('off');

    await page.waitForTimeout(900);
    expect(
      await effState(page, 'light.zal'),
      'служба отказала — экран не имеет права дальше врать, что свет выключен',
    ).toBe('on');
  });

  test('поздний отказ первого нажатия не затирает второе', async ({ page }) => {
    await openHarness(page);
    await mountCard(page, {
      config: { plan: simplePlan() },
      states: {
        ...baseStates(),
        'cover.shtory': { state: 'closed', attributes: { friendly_name: 'Шторы' } },
      },
    });

    await page.evaluate(() => {
      // Первое нажатие («Закрыть») отваливается с опозданием, второе
      // («Открыть») проходит сразу.
      window.BMS.serviceHandler = (_d: string, service: string) =>
        service === 'close_cover'
          ? new Promise((_, rej) => setTimeout(() => rej(new Error('таймаут привода')), 600))
          : Promise.resolve();
    });

    await openPopup(page, ['cover.shtory']);
    await page.evaluate(async () => {
      const root = window.BMS.root();
      (root.querySelector('.control-popup [title="Close"]') as HTMLElement).click();
      await new Promise((r) => setTimeout(r, 60));
      (root.querySelector('.control-popup [title="Open"]') as HTMLElement).click();
    });

    expect(await effState(page, 'cover.shtory')).toBe('open');
    await page.waitForTimeout(1000);

    const calls = await page.evaluate(() => window.BMS.serviceCalls.map((c) => c.service));
    expect(calls, 'оба нажатия обязаны дойти до Home Assistant').toEqual(['close_cover', 'open_cover']);
    expect(
      await effState(page, 'cover.shtory'),
      'опоздавший отказ первого нажатия не должен отменять второе',
    ).toBe('open');
  });
});
