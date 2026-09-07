import { test, expect } from '@playwright/test';
import { openHarness, mountCard, settleScene } from './helpers/harness';
import { simplePlan, fanPlan, baseStates, unboundSensors } from './helpers/plans';

/**
 * Карточка висит на настенном планшете сутками. Весь расчёт на слабое железо
 * держится на одном правиле: кадр рисуется только тогда, когда на экране
 * что-то изменилось. Любая мелочь, которая просит кадр «просто так», сажает
 * планшет в постоянные 60 fps — он греется и садит батарею до вечера.
 */
test.describe('Рендер по требованию', () => {
  test('300 чужих сущностей, 5 обновлений в секунду, неподвижная камера — кадров почти нет', async ({ page }) => {
    await openHarness(page);
    await mountCard(page, {
      config: { plan: simplePlan() },
      states: { ...baseStates(), ...unboundSensors(300) },
    });
    await settleScene(page);

    await page.evaluate(() => window.BMS.markFrames());
    await page.evaluate(async () => {
      // 10 секунд по 5 обновлений: так ведёт себя дом с полусотней датчиков.
      for (let i = 0; i < 50; i++) {
        const patch: Record<string, any> = {};
        for (let k = 0; k < 300; k++) patch[`sensor.unbound_${k}`] = { state: String(20 + ((i + k) % 9)) };
        window.BMS.setStates(patch);
        await new Promise((r) => setTimeout(r, 200));
      }
    });
    const drawn = await page.evaluate(() => window.BMS.framesSinceMark());

    expect(drawn, `за 10 секунд без единого изменения на экране отрисовано кадров: ${drawn}`).toBeLessThanOrEqual(15);
  });

  test('контроль: привязанная сущность кадр всё-таки заказывает', async ({ page }) => {
    // Обратная сторона проверки выше: если карточка перестанет рисовать вообще,
    // «мало кадров» станет ложной зеленью.
    await openHarness(page);
    await mountCard(page, { config: { plan: simplePlan() }, states: baseStates() });
    await settleScene(page);

    await page.evaluate(() => window.BMS.markFrames());
    await page.evaluate(async () => {
      window.BMS.setStates({ 'light.zal': { state: 'off' } });
      await new Promise((r) => setTimeout(r, 400));
    });
    expect(await page.evaluate(() => window.BMS.framesSinceMark())).toBeGreaterThan(0);
  });
});

test.describe('Вентилятор', () => {
  test('включённый вентилятор не держит 60 кадров в секунду', async ({ page }) => {
    await openHarness(page);
    await mountCard(page, {
      config: { plan: fanPlan() },
      states: { ...baseStates(), 'fan.zal': { state: 'on', attributes: { friendly_name: 'Вентилятор' } } },
    });
    await page.waitForTimeout(1500); // дать вступительной анимации закончиться

    await page.evaluate(() => window.BMS.markFrames());
    await page.waitForTimeout(5000);
    const drawn = await page.evaluate(() => window.BMS.framesSinceMark());

    expect(drawn, 'лопасти должны крутиться — иначе замер бессмысленен').toBeGreaterThan(5);
    expect(drawn, `за 5 секунд отрисовано ${drawn} кадров (~${Math.round(drawn / 5)} fps)`).toBeLessThanOrEqual(120);
  });

  test('вкладку скрыли — цикл кадров встал вместе с requestAnimationFrame', async ({ page }) => {
    // Скрытая вкладка = браузер перестал выдавать rAF. Playwright в headless
    // по-настоящему увести вкладку в фон не может, поэтому мы моделируем ровно
    // то, что делает Chrome. Смысл проверки не в самом браузере, а в том, что
    // цикл кадров живёт на rAF: переведи его на setInterval — и скрытая
    // карточка продолжит жечь GPU планшета круглые сутки.
    await openHarness(page, { pausableRaf: true });
    await mountCard(page, {
      config: { plan: fanPlan() },
      states: { ...baseStates(), 'fan.zal': { state: 'on', attributes: { friendly_name: 'Вентилятор' } } },
    });
    await page.waitForTimeout(1200);

    // Контроль: на видимой вкладке вентилятор кадры заказывает.
    await page.evaluate(() => window.BMS.markFrames());
    await page.waitForTimeout(1000);
    expect(
      await page.evaluate(() => window.BMS.framesSinceMark()),
      'на видимой вкладке анимация обязана рисовать',
    ).toBeGreaterThan(3);

    await page.evaluate(() => (window as any).__rafPause());
    await page.evaluate(() => window.BMS.markFrames());
    await page.waitForTimeout(5000);
    const drawnHidden = await page.evaluate(() => window.BMS.framesSinceMark());
    await page.evaluate(() => (window as any).__rafResume());

    // Единица — это кадр, уже стоявший в очереди в момент «скрытия».
    expect(
      drawnHidden,
      `вкладка скрыта, а за 5 секунд отрисовано кадров: ${drawnHidden}`,
    ).toBeLessThanOrEqual(1);
  });
});
