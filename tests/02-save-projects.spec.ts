import { test, expect } from '@playwright/test';
import { openHarness, mountCard, enterEditByHold, enterEditFast, waitToast } from './helpers/harness';
import { simplePlan, baseStates, twoProjects } from './helpers/plans';

/** Названия проектов, лежащих сейчас в общем (install-wide) хранилище. */
const sharedNames = (page: any) =>
  page.evaluate(() =>
    Object.values(window.BMS.wsStore.shared?.projects ?? {}).map((p: any) => p.name).sort(),
  );

test.describe('Сохранение плана', () => {
  test('разовый сбой чтения общего плана не стирает чужой проект', async ({ page }) => {
    await openHarness(page);
    await page.evaluate((doc) => {
      window.BMS.wsStore.shared = doc;
    }, twoProjects());
    await mountCard(page, { config: {}, states: baseStates() });

    // Вход в редактор — настоящий, удержанием угла: это единственная дверь в
    // режим правки, и если она отвалится, сохранять будет некому.
    await enterEditByHold(page);

    expect(await sharedNames(page)).toEqual(['Второй объект', 'Первый объект']);

    // Связь с хранилищем оборвалась ровно на одном чтении.
    await page.evaluate(() => {
      window.BMS.wsFail['bms_floorplan/plan/get'] = { times: 1, message: 'соединение разорвано' };
    });

    await page.evaluate(() => {
      window.BMS.card.toast = undefined; // не поймать чужое сообщение
      const btn = window.BMS.root().querySelector('[title="Save this project"]') as HTMLElement;
      btn.click();
    });
    await waitToast(page);

    // Главное: второй объект обязан пережить неудачное сохранение.
    expect(
      await sharedNames(page),
      'провал чтения не даёт права записывать «пустое» хранилище поверх чужой работы',
    ).toEqual(['Второй объект', 'Первый объект']);

    // И контрольный выстрел: когда чтение работает, сохранение действительно
    // происходит — иначе проверка была бы зелёной просто потому, что кнопка
    // ничего не делает.
    await page.evaluate(async () => {
      window.BMS.card.toast = undefined;
      window.BMS.card.editor.plan.name = 'Первый объект (правка)';
      const btn = window.BMS.root().querySelector('[title="Save this project"]') as HTMLElement;
      btn.click();
    });
    await waitToast(page, 'сохранён');
    expect(await sharedNames(page)).toEqual(['Второй объект', 'Первый объект (правка)']);
  });

  test('сообщение о сохранении не обещает «на все устройства», когда общий план не записан', async ({ page }) => {
    await openHarness(page);
    await page.evaluate((doc) => {
      window.BMS.wsStore.shared = doc;
    }, twoProjects());
    await mountCard(page, { config: { plan: simplePlan() }, states: baseStates() });
    await enterEditFast(page);

    // Контроль: при успешной общей записи карточка ОБЯЗАНА сказать эту фразу.
    // Без этого проверка ниже была бы декоративной — «фразы нет» верно и для
    // пустого сообщения, и для переписанного текста.
    await page.evaluate(() => { window.BMS.card.toast = undefined; });
    await page.evaluate(() => (window.BMS.root().querySelector('[title="Save this project"]') as HTMLElement).click());
    const good = await waitToast(page, 'сохранён');
    expect(good, 'успешная общая запись должна отчитываться именно так').toContain('на все устройства');

    // Теперь интеграция отказывает в записи общего плана (не админ), а личное
    // хранилище принимает.
    await page.evaluate(() => {
      window.BMS.card.toast = undefined;
      window.BMS.wsFail['bms_floorplan/plan/set'] = {
        times: -1,
        message: 'изменять общий план может только администратор',
        code: 'unauthorized',
      };
    });

    await page.evaluate(() => (window.BMS.root().querySelector('[title="Save this project"]') as HTMLElement).click());
    const msg = await waitToast(page);

    expect(msg, 'сообщение обязано быть').not.toBe('');
    expect(msg, 'общий план не записан — обещать «все устройства» нельзя').not.toContain('на все устройства');
    expect(msg).toContain('учётной записи');
  });
});
