import { test, expect } from '@playwright/test';
import { openHarness, mountCard, enterEditFast } from './helpers/harness';
import { simplePlan, baseStates } from './helpers/plans';

/**
 * На русской и узбекской раскладке десятичный разделитель — запятая. Монтажник
 * набирает «3,5» и ждёт три с половиной метра.
 *
 * Сегодня это работает НЕ благодаря карточке, а благодаря браузеру: поля
 * размеров — <input type="number">, и Chromium сам приводит «3,5» к «3.5»
 * прежде, чем значение дойдёт до обработчика. Собственной защиты у карточки
 * нет: parseFloat('3,5') читается как 3. Ровно поэтому здесь две проверки —
 * одна стережёт поведение целиком, вторая отдельно стережёт разбор, который
 * принадлежит нам, а не браузеру.
 */
async function selectFirstWall(page: any) {
  await page.evaluate(async () => {
    // Панель свойств появляется только у инструмента «выбор».
    window.BMS.card.editor.setTool('select');
    window.BMS.card.editor.selectWall(0);
    await window.BMS.card.updateComplete;
  });
}

test.describe('Числа с запятой', () => {
  test('«3,5» в поле толщины стены даёт 3.5, а не 3 и не NaN', async ({ page }) => {
    await openHarness(page);
    await mountCard(page, { config: { plan: simplePlan() }, states: baseStates() });
    await enterEditFast(page);
    await selectFirstWall(page);

    const input = page.locator('bms-floorplan-card input.num-input[title^="Wall thickness"]');
    await expect(input).toHaveCount(1);
    const before = await page.evaluate(() => window.BMS.card.editor.selectedWallThickness);

    await input.click();
    await page.keyboard.press('ControlOrMeta+a');
    await page.keyboard.type('3,5');
    await page.keyboard.press('Tab'); // blur → change

    const after = await page.evaluate(() => window.BMS.card.editor.selectedWallThickness);
    expect(after, `было ${before}, набрали «3,5», стало ${after}`).toBeCloseTo(3.5, 5);
  });

  test('контроль: «3.5» с точкой поле принимает', async ({ page }) => {
    // Без этого «поле не изменилось» ничего не доказывало бы: может быть сломан
    // весь путь ввода, а не разбор запятой.
    await openHarness(page);
    await mountCard(page, { config: { plan: simplePlan() }, states: baseStates() });
    await enterEditFast(page);
    await selectFirstWall(page);

    const input = page.locator('bms-floorplan-card input.num-input[title^="Wall thickness"]');
    await input.click();
    await page.keyboard.press('ControlOrMeta+a');
    await page.keyboard.type('3.5');
    await page.keyboard.press('Tab');

    expect(await page.evaluate(() => window.BMS.card.editor.selectedWallThickness)).toBeCloseTo(3.5, 5);
  });

  test('разбор размера сам понимает запятую, без помощи браузера', async ({ page }) => {
    await openHarness(page);
    await mountCard(page, { config: { plan: simplePlan() }, states: baseStates() });
    await enterEditFast(page);
    await selectFirstWall(page);

    // Ровно то значение, которое приходит из поля БЕЗ приведения: так ведёт
    // себя <input type="text">, поле с inputmode="decimal" и часть экранных
    // клавиатур в WebView планшета.
    const after = await page.evaluate(async () => {
      const c = window.BMS.card;
      c.onSetWallThickness({ target: { value: '3,5' } } as any);
      await c.updateComplete;
      return c.editor.selectedWallThickness;
    });

    expect(after, `«3,5» прочитано как ${after} — стена стала бы вдвое тоньше задуманного`).toBeCloseTo(3.5, 5);
  });
});
