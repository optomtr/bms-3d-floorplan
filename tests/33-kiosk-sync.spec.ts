import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
// @ts-expect-error — обычный .mjs без деклараций типов, нам нужны две функции
import { buildCore, sync, PAGES } from '../tools/sync-kiosk.mjs';

/**
 * Две копии киоск-страницы уже однажды разъехались: правку вносили в одну, а
 * планшет владельца показывал другую, и месяцами было непонятно, почему
 * «починенное» не работает. Теперь общий код живёт ОДИН раз, в
 * standalone/kiosk/*.js, и вклеивается в обе страницы.
 *
 * Эта проверка — замок на двери: правка в HTML мимо ядра, забытый запуск
 * сборки, ручное «только тут подправлю» — всё это здесь краснеет.
 */
test.describe('Две копии киоска не расходятся', () => {
  test('вклеенное ядро совпадает с исходником в обеих страницах', () => {
    const { drifted } = sync({ check: true });
    expect(
      drifted,
      'Копии киоска отстали от standalone/kiosk/. Почините: node tools/sync-kiosk.mjs',
    ).toEqual([]);
  });

  test('обе страницы несут БАЙТ В БАЙТ одно и то же ядро', () => {
    const blocks = PAGES.map((page: string) => {
      const html = readFileSync(page, 'utf8');
      const from = html.indexOf('<!-- BMS_KIOSK_CORE:BEGIN');
      const to = html.indexOf('<!-- BMS_KIOSK_CORE:END -->');
      expect(from, `${page}: нет метки начала ядра`).toBeGreaterThan(-1);
      expect(to, `${page}: нет метки конца ядра`).toBeGreaterThan(from);
      return html.slice(from, to);
    });
    expect(blocks.length).toBe(2);
    expect(blocks[0]).toBe(blocks[1]);
  });

  test('ядро содержит то, ради чего всё затевалось', () => {
    const core = buildCore();
    // Страховка от декоративной зелени: если ядро вдруг соберётся пустым,
    // предыдущие две проверки останутся зелёными и ничего не будут значить.
    expect(core.length).toBeGreaterThan(10_000);
    for (const needle of [
      'WATCHDOG_MS', // сторож
      'webglcontextlost', // потеря контекста
      'runPairing', // привязка по коду
      'cachePlan', // прошлый план на экране
      'BACKOFF_CAP_MS', // ограниченная пауза
      'function invalidate', // отказ входа не конечный
    ]) {
      expect(core, `в ядре киоска пропало: ${needle}`).toContain(needle);
    }
    // И ни одного старого тупика.
    expect(core).not.toContain('authFailed');
  });

  test('в самих страницах не осталось прежних тупиков', () => {
    for (const page of PAGES) {
      const html = readFileSync(page, 'utf8');
      expect(html, `${page}: вернулся вечный флаг отказа`).not.toContain('authFailed');
      expect(html, `${page}: вернулось «обновите страницу»`).not.toContain('обновите страницу');
      expect(html, `${page}: вернулось «reload the page»`).not.toContain('reload the page');
    }
  });
});
