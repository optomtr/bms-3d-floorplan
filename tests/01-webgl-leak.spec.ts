import { test, expect } from '@playwright/test';
import { openHarness, mountCard } from './helpers/harness';
import { simplePlan, baseStates } from './helpers/plans';

/**
 * Карточка живёт на планшете, который не перезагружают месяцами: переключение
 * вкладок Lovelace монтирует и размонтирует её десятки раз в день. Каждый
 * SceneManager поднимает свой WebGL-контекст, а браузер держит их около
 * полутора десятков — дальше он начинает гасить самые старые, и на стене
 * появляются пустые чёрные карточки.
 */
test.describe('Ресурсы WebGL', () => {
  test('20 монтирований/размонтирований не оставляют живых GL-контекстов', async ({ page }) => {
    await openHarness(page, { countGl: true });

    const CYCLES = 20;
    for (let i = 0; i < CYCLES; i++) {
      await mountCard(page, { config: { plan: simplePlan() }, states: baseStates(), height: '320px' });
      await page.evaluate(() => window.BMS.unmount());
    }

    // Дать браузеру шанс собрать мусор и по-настоящему отпустить контексты.
    await page.evaluate(async () => {
      (window as any).gc?.();
      await new Promise((r) => setTimeout(r, 800));
    });

    const gl = await page.evaluate(() => window.__glStats());

    // Страховка от декоративной зелени: если счётчик перестал считать,
    // «0 живых контекстов» ничего не значит.
    expect(gl.created, 'счётчик контекстов обязан их видеть').toBeGreaterThanOrEqual(CYCLES);
    expect(gl.live, `после ${CYCLES} циклов живых WebGL-контекстов осталось ${gl.live}`).toBeLessThanOrEqual(3);
  });
});
