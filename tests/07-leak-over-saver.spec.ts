import { test, expect } from '@playwright/test';
import { openHarness, mountCard } from './helpers/harness';
import { simplePlan, baseStates } from './helpers/plans';

/**
 * Заставка гасит планшет через десять минут покоя. Протечка обязана пробить
 * её насквозь: панель в прихожей, показывающая часы, пока в санузле течёт
 * вода, — ровно тот случай, ради которого датчик и ставили.
 */
test.describe('Протечка и заставка', () => {
  test('тревога о протечке видна ПОВЕРХ заставки', async ({ page }) => {
    await openHarness(page);
    await mountCard(page, {
      config: { plan: simplePlan() },
      states: {
        ...baseStates(),
        'binary_sensor.protechka': {
          state: 'off',
          attributes: { friendly_name: 'Датчик протечки', device_class: 'moisture' },
        },
      },
    });

    // Заставка «по времени» — это 10 минут ожидания; включаем её состояние
    // напрямую, сам таймер здесь ни при чём.
    await page.evaluate(async () => {
      window.BMS.card.idle = true;
      await window.BMS.card.updateComplete;
    });
    expect(await page.evaluate(() => !!window.BMS.root().querySelector('.saver'))).toBe(true);

    await page.evaluate(async () => {
      window.BMS.setStates({ 'binary_sensor.protechka': { state: 'on' } });
      await window.BMS.card.updateComplete;
    });

    const verdict = await page.evaluate(() => {
      const root = window.BMS.root();
      const saver = root.querySelector('.saver');
      const alert = root.querySelector('.leak-alert');
      if (!alert) return { alert: false, onTop: false, text: '' };
      const r = alert.getBoundingClientRect();
      // Не «есть в разметке», а «первое, во что упрётся палец» — заставка
      // растянута на ту же площадь, и порядок слоёв решает всё.
      const hit = root.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return {
        alert: true,
        saver: !!saver,
        onTop: !!hit && (hit === alert || alert.contains(hit)),
        text: (alert.textContent ?? '').trim(),
      };
    });

    expect(verdict.alert, 'мокрый датчик обязан поднять тревогу').toBe(true);
    expect(verdict.saver, 'заставка при этом никуда не делась').toBe(true);
    expect(verdict.text).toContain('Протечка');
    expect(verdict.onTop, 'тревога обязана лежать НАД заставкой, а не под ней').toBe(true);
  });
});
