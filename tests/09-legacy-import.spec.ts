import { test, expect } from '@playwright/test';
import { openHarness, mountCard, enterEditFast, clickByText, waitToast } from './helpers/harness';
import { simplePlan, baseStates } from './helpers/plans';

const OLD_KEY = 'ha3d-floorplans-set';

/** Что лежит в хранилище ПРЕДЫДУЩЕЙ интеграции. Она остаётся установленной и
 *  рабочей у заказчика — трогать её нельзя ни под каким видом. */
function legacySet() {
  return {
    active: 'old_a',
    projects: {
      old_a: { ...simplePlan(), name: 'Дом Ахмедовых' },
      old_b: { ...simplePlan(), name: 'Офис на Мустакиллик' },
    },
  };
}

test.describe('Перенос из старой версии', () => {
  test('кнопка находит старые проекты, копирует их и НЕ трогает старый ключ', async ({ page }) => {
    await openHarness(page);
    await page.evaluate(
      ({ key, doc }) => {
        localStorage.setItem(key, JSON.stringify(doc));
      },
      { key: OLD_KEY, doc: legacySet() },
    );
    const before = await page.evaluate((key) => localStorage.getItem(key), OLD_KEY);

    await mountCard(page, { config: { plan: simplePlan() }, states: baseStates() });
    await enterEditFast(page);

    await clickByText(page, '.btn', 'Перенести из старой версии');
    await page.waitForFunction(() => !!window.BMS.root().querySelector('.legacy-list'));

    const listed = await page.evaluate(
      () => window.BMS.root().querySelector('.legacy-list')!.textContent ?? '',
    );
    expect(listed).toContain('Дом Ахмедовых');
    expect(listed).toContain('Офис на Мустакиллик');

    await page.evaluate(() => {
      window.BMS.card.toast = undefined;
    });
    await clickByText(page, '.btn', 'Перенести (2)');
    await waitToast(page, 'Перенесено');

    // Проекты действительно приехали в НАШЕ хранилище.
    const ours = await page.evaluate(() =>
      Object.values(window.BMS.wsStore.shared?.projects ?? {}).map((p: any) => p.name),
    );
    expect(ours).toContain('Дом Ахмедовых');
    expect(ours).toContain('Офис на Мустакиллик');

    // И главное: старое хранилище осталось байт в байт прежним. Старая карточка
    // у заказчика продолжает работать, пока он сам её не снимет.
    const after = await page.evaluate((key) => localStorage.getItem(key), OLD_KEY);
    expect(after, 'старый ключ ha3d-floorplans-set обязан остаться нетронутым').toBe(before);
  });
});
