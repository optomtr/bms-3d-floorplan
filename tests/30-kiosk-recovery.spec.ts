import { test, expect } from '@playwright/test';
import { KIOSK_PAGES, KioskPage, openKiosk, kioskState, waitLive, ha } from './helpers/kiosk';

/**
 * Киоск на стене должен пережить ВСЁ без человека.
 *
 * Жалоба владельца: «когда я его запускаю в киоск режиме, время от времени он
 * перестаёт работать, так как Home Assistant давно не открывался». Причина была
 * прямо в странице: на auth_invalid и на «токена нет» она ставила authFailed и
 * больше не подключалась НИКОГДА — до тех пор, пока кто-нибудь не подойдёт и не
 * обновит её руками.
 *
 * Каждая проверка ниже заканчивается работающей страницей БЕЗ единого действия
 * человека (кроме одного подтверждения привязки там, где это её предмет).
 *
 * Гоняется по ОБЕИМ копиям страницы: владелец не знает, какую показывает его
 * планшет, поэтому «починено в одной» не считается.
 */
for (const which of Object.keys(KIOSK_PAGES) as KioskPage[]) {
  test.describe(`Киоск не умирает · копия «${which}»`, () => {
    test('токен киоска отозвали посреди работы — восстанавливается сам', async ({ page }) => {
      await openKiosk(page, which, {
        cred: { token: 'kiosk-token-0' },
        grant: ['kiosk-token-0'],
        blockReload: true,
      });
      await waitLive(page);
      expect((await kioskState(page)).source).toBe('kiosk');

      // Администратор удалил токен в Home Assistant / срок кончился.
      await ha(page, (HA) => {
        HA.revoke('kiosk-token-0');
        HA.killSockets();
      });

      // Никто ничего не трогает: страница обязана выписать себе новый токен
      // по секрету и подключиться заново.
      await waitLive(page);
      const after = await kioskState(page);
      expect(after.source).toBe('kiosk');
      expect(after.hasKioskToken).toBe(true);
      expect(await ha(page, (HA) => HA.renews)).toBeGreaterThan(0);
      // Страховка от декоративной зелени: сервер обязан был увидеть отказ.
      expect(await ha(page, (HA) => HA.authAttempts)).toContain('kiosk-token-0');
    });

    test('auth_invalid при подключении — переходит к следующему входу', async ({ page }) => {
      await openKiosk(page, which, {
        // Своя привязка есть, но её секрет сервер не знает (личность отозвали),
        // а вот сессия Home Assistant на устройстве рабочая.
        session: { access: 'session-token-1' },
        grant: ['session-token-1'],
        blockReload: true,
      });
      await page.evaluate(() => {
        localStorage.setItem(
          'bms_floorplan_kiosk.cred',
          JSON.stringify({ device_id: 'f'.repeat(32), secret: 'a'.repeat(64), token: 'мусор', exp: Date.now() + 1e12 }),
        );
      });
      await page.reload();
      await page.waitForFunction(() => !!(window as any).BMSKiosk);

      await waitLive(page);
      const s = await kioskState(page);
      expect(s.source).toBe('session');
      // Негодный токен отброшен, а не оставлен «на подумать».
      expect(await ha(page, (HA) => HA.authAttempts)).toContain('мусор');
    });

    test('refresh-токен отвергнут — не тупик, а экран привязки, который сам гаснет', async ({ page }) => {
      await openKiosk(page, which, {
        // Сессия есть, но почти истекла, а обновить её сервер отказывается.
        session: { access: 'старый', expiresInMs: 1000, refresh: 'refresh-1' },
        refreshOk: false,
        blockReload: true,
      });

      await page.waitForFunction(() => window.BMSKiosk.state().pairing === true, undefined, {
        timeout: 30_000,
        polling: 100,
      });
      expect((await kioskState(page)).pairCode).toBe('424242');

      // Единственное действие человека во всей этой проверке.
      await ha(page, (HA) => HA.approve());

      await waitLive(page);
      expect((await kioskState(page)).pairing).toBe(false);
      expect((await kioskState(page)).source).toBe('kiosk');
    });

    test('Home Assistant перезапустился — возвращается сам, план с экрана не пропадает', async ({ page }) => {
      await openKiosk(page, which, {
        cred: { token: 'kiosk-token-0' },
        grant: ['kiosk-token-0'],
        blockReload: true,
      });
      await waitLive(page);

      await ha(page, (HA) => {
        HA.set({ down: true });
        HA.killSockets();
      });
      // Пока HA нет, план ОСТАЁТСЯ на экране с пометкой «нет связи».
      await page.waitForFunction(() => window.BMSKiosk.state().offline === true, undefined, {
        timeout: 20_000,
        polling: 100,
      });
      expect((await kioskState(page)).planOnScreen).toBe(true);

      await page.waitForTimeout(3000);
      await ha(page, (HA) => HA.set({ down: false }));

      await waitLive(page);
      expect((await kioskState(page)).planOnScreen).toBe(true);
    });

    test('планшет проспал час — просыпается с живой связью, а не с зомби-сокетом', async ({ page }) => {
      await openKiosk(page, which, {
        cred: { token: 'kiosk-token-0' },
        grant: ['kiosk-token-0'],
        blockReload: true,
      });
      await waitLive(page);

      // Сон. Сокет НЕ закрыт: он выглядит открытым и молчит — именно так это
      // и происходит на планшете, и именно этого браузер сам не замечает.
      await ha(page, (HA) => HA.set({ mute: true }));
      await page.clock.install();
      await page.clock.setSystemTime(new Date(Date.now() + 3600_000));
      // Проснулись: сеть на месте, вкладку показали.
      await ha(page, (HA) => HA.set({ mute: false }));
      await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));

      // Не «когда-нибудь», а сразу: иначе человек успевает потыкать в мёртвый
      // экран. Сердцебиение само справилось бы только через полминуты.
      await waitLive(page, 12_000);
      const s = await kioskState(page);
      expect(s.planOnScreen).toBe(true);
      // Проснулись переподключением, а не перезагрузкой страницы.
      expect(s.reloads).toBe(0);
    });

    test('вход не найден вовсе — код привязки, подтверждение админом, работа', async ({ page }) => {
      await openKiosk(page, which, { blockReload: true });

      await page.waitForFunction(() => window.BMSKiosk.state().pairing === true, undefined, {
        timeout: 30_000,
        polling: 100,
      });
      const shown = await kioskState(page);
      expect(shown.pairCode).toBe('424242');
      expect(shown.planOnScreen).toBe(false);

      // Секрет НИКОГДА не показан и не уехал в адрес.
      const secret = await ha(page, (HA) => HA.pair.secret);
      expect(secret).toMatch(/^[0-9a-f]{64}$/);
      expect(await page.content()).not.toContain(secret);
      expect(page.url()).not.toContain(secret);

      await ha(page, (HA) => HA.approve());

      await waitLive(page);
      const s = await kioskState(page);
      expect(s.pairing).toBe(false);
      expect(s.source).toBe('kiosk');
      expect(s.hasKioskToken).toBe(true);
      // Секрет РОТИРОВАЛСЯ: сервер уже знает не тот, что был на start.
      expect(await ha(page, (HA) => HA.pair.secret)).not.toBe(secret);
    });

    test('прошлый план остаётся на экране, пока связи нет', async ({ page }) => {
      await openKiosk(page, which, { cachedPlan: true, down: true, blockReload: true });

      // Ни одной успешной сетевой операции — и всё равно план на стене.
      await page.waitForFunction(() => window.BMSKiosk.state().planOnScreen === true, undefined, {
        timeout: 20_000,
        polling: 100,
      });
      expect((await kioskState(page)).offline).toBe(true);
      expect(await page.locator('#bms-offline').textContent()).toContain('нет связи');
      // Страховка: без кэша здесь было бы пусто.
      expect(await page.evaluate(() => !!document.querySelector('bms-floorplan-card'))).toBe(true);
    });

    test('пауза между попытками растёт, но не выше 60 секунд', async ({ page }) => {
      await openKiosk(page, which, { down: true, blockReload: true, cachedPlan: true });
      await page.waitForFunction(() => window.BMSKiosk.state().attempt >= 4, undefined, {
        timeout: 40_000,
        polling: 100,
      });
      // Потолок задан в ядре; проверяем, что попытки идут и не останавливаются.
      const first = (await kioskState(page)).attempt;
      await page.waitForTimeout(2500);
      expect((await kioskState(page)).attempt).toBeGreaterThanOrEqual(first);
      expect(await ha(page, (HA) => HA.wsOpens)).toBeGreaterThan(3);
    });
  });
}
