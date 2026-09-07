import { test, expect } from '@playwright/test';
import { openHarness, mountCard } from './helpers/harness';
import { simplePlan, baseStates } from './helpers/plans';

test.describe('Стенд', () => {
  test('карточка монтируется, сцена строится, WebGL живой', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    await openHarness(page, { countGl: true });
    await mountCard(page, { config: { plan: simplePlan() }, states: baseStates() });

    const info = await page.evaluate(() => {
      const sm = window.BMS.card.sceneManager;
      return {
        planLoaded: window.BMS.card.planLoaded,
        loadError: window.BMS.card.loadError ?? null,
        floors: sm.floors.length,
        frames: window.BMS.frames(),
        gl: (window as any).__glStats(),
      };
    });
    expect(info.loadError).toBeNull();
    expect(info.planLoaded).toBe(true);
    expect(info.floors).toBe(1);
    expect(info.frames).toBeGreaterThan(0);
    expect(info.gl.live).toBeGreaterThan(0);
    expect(errors).toEqual([]);
  });

  test('ручной стенд test/index.html жив', async ({ page }) => {
    // Стенд для рук — единственный способ посмотреть карточку глазами.
    // Проверки его не используют, но и сломать его им нельзя.
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    await page.goto('/test/index.html');
    await page.waitForFunction(() => !!(window as any).BMS?.card?.sceneManager, undefined, {
      timeout: 30_000,
    });
    const ok = await page.evaluate(() => {
      const c = (window as any).BMS.card;
      return { loaded: c.planLoaded, err: c.loadError ?? null, buttons: document.querySelectorAll('.controls button').length };
    });
    expect(ok.err).toBeNull();
    expect(ok.loaded).toBe(true);
    expect(ok.buttons, 'кнопки ручного стенда на месте').toBeGreaterThanOrEqual(7);
    expect(errors).toEqual([]);
  });
});
