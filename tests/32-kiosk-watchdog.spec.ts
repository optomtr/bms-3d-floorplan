import { test, expect } from '@playwright/test';
import { KIOSK_PAGES, KioskPage, openKiosk, kioskState, waitLive, ha } from './helpers/kiosk';

/**
 * Последняя линия обороны. Если ничего не получалось три минуты — что бы это ни
 * было, включая поломку, которую мы ещё не придумали, — страница перезагружает
 * сама себя. И ровно поэтому она обязана делать это РЕДКО: сторож, крутящийся в
 * цикле, превращает планшет в мигающий белый экран.
 *
 * Время двигаем часами Playwright: ждать по-настоящему три минуты в проверке
 * нельзя, а уменьшать срок ради проверки — значит проверять не то число,
 * которое поедет на стену.
 */
for (const which of Object.keys(KIOSK_PAGES) as KioskPage[]) {
  test.describe(`Сторож · копия «${which}»`, () => {
    test('три минуты без связи — перезагрузка; шестнадцать минут — не цикл', async ({ page }) => {
      await page.clock.install();

      let loads = 0;
      page.on('load', () => loads++);

      // Сеть лежит с самого начала, показывать есть что (прошлый план).
      await openKiosk(page, which, { cachedPlan: true, down: true });
      await page.waitForFunction(() => window.BMSKiosk.state().planOnScreen === true, undefined, {
        timeout: 20_000,
        polling: 100,
      });
      const afterBoot = loads;

      // Первые две минуты сторож обязан МОЛЧАТЬ: обычный обрыв связи лечится
      // переподключением, а не перезагрузкой.
      await page.clock.fastForward('02:00');
      await page.waitForTimeout(500);
      expect(loads - afterBoot, 'через две минуты перезагружаться рано').toBe(0);

      // А на четвёртой — перезагружает.
      await page.clock.fastForward('02:30');
      await page.waitForFunction(() => true);
      await expect
        .poll(() => loads - afterBoot, { timeout: 20_000, message: 'сторож обязан перезагрузить страницу' })
        .toBeGreaterThanOrEqual(1);

      // Дальше — не чаще раза в пять минут. Шестнадцать минут полного мрака
      // дают максимум четыре перезагрузки, а не сотню.
      const afterFirst = loads;
      for (let i = 0; i < 8; i++) {
        await page.clock.fastForward('02:00');
        await page.waitForTimeout(150);
      }
      const extra = loads - afterFirst;
      expect(extra, `за 16 минут перезагрузок сверх первой: ${extra}`).toBeLessThanOrEqual(4);

      // И это всё ещё рабочая страница: сеть вернулась — планировка живая.
      await ha(page, (HA) => HA.set({ down: false }));
      await page.evaluate(() => {
        // Единственный вход, который тут возможен, — сессия устройства.
        localStorage.setItem(
          'hassTokens',
          JSON.stringify({
            access_token: 'session-token-1',
            expires: Date.now() + 3600_000,
            refresh_token: 'refresh-1',
            clientId: location.origin + '/',
          }),
        );
        (window as any).__HA.grant('session-token-1');
        window.BMSKiosk.kick('проверка');
      });
      await waitLive(page);
      expect((await kioskState(page)).planOnScreen).toBe(true);
    });

    test('пока на экране код привязки, сторож не перезагружает страницу', async ({ page }) => {
      await page.clock.install();
      let loads = 0;
      page.on('load', () => loads++);

      // Входа нет — страница показывает код и ЖДЁТ человека.
      await openKiosk(page, which, {});
      await page.waitForFunction(() => window.BMSKiosk.state().pairing === true, undefined, {
        timeout: 30_000,
        polling: 100,
      });
      const afterBoot = loads;

      await page.clock.fastForward('10:00');
      await page.waitForTimeout(500);
      expect(loads - afterBoot, 'код на экране нельзя стирать перезагрузкой').toBe(0);
      expect((await kioskState(page)).pairCode).toBe('424242');
    });
  });
}
