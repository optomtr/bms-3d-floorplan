import { test, expect, type Page } from '@playwright/test';
import { openHarness, mountCard, waitToast } from './helpers/harness';
import { dangerousPlan, baseStates } from './helpers/plans';

async function openPopup(page: Page, ids: string[]): Promise<void> {
  await page.evaluate(async (list) => {
    const c = window.BMS.card;
    c.controlRoom = null;
    c.controlCategory = null;
    c.controlEntities = list;
    c.controlPos = [300, 200];
    c.controlOpenedAt = performance.now();
    c.controlOpen = true;
    c.requestUpdate();
    await c.updateComplete;
  }, ids);
}

const dangerStates = () => ({
  ...baseStates(),
  'script.open_the_gate': { state: 'off', attributes: { friendly_name: 'Открыть ворота' } },
  'automation.disarm': { state: 'on', attributes: { friendly_name: 'Снять с охраны' } },
});

test.describe('Опасные действия', () => {
  test('script.* и automation.* из плана не вызываются — карточка говорит «Только просмотр»', async ({ page }) => {
    await openHarness(page);
    await mountCard(page, { config: { plan: dangerousPlan() }, states: dangerStates() });

    // План — это ДАННЫЕ. Домен берётся из него, поэтому в файле плана может
    // оказаться что угодно; сюда всё и упирается.
    await page.evaluate(() => {
      window.BMS.card.toast = undefined;
      window.BMS.card.svc('script', 'turn_on', {}, 'script.open_the_gate', 'on');
    });
    const t1 = await waitToast(page);
    expect(t1).toContain('Только просмотр');

    await page.evaluate(() => {
      window.BMS.card.toast = undefined;
      window.BMS.card.svc('automation', 'trigger', {}, 'automation.disarm', 'on');
    });
    const t2 = await waitToast(page);
    expect(t2).toContain('Только просмотр');

    // «Выключить всё» в комнате — второй путь, где домен приходит из плана.
    await page.evaluate(() => {
      window.BMS.card.onToggleAll([
        { entity_id: 'light.zal', behavior: 'light' },
        { entity_id: 'script.open_the_gate', behavior: 'switch' },
        { entity_id: 'automation.disarm', behavior: 'switch' },
      ]);
    });
    await page.waitForTimeout(200);

    // Считаем ВСЁ, до чего дотянулись вызовы: и домен вызова, и каждый
    // entity_id внутри (homeassistant.turn_off принимает список).
    const touched: string[] = await page.evaluate(() =>
      window.BMS.serviceCalls.flatMap((c) => {
        const ids = c.data?.entity_id;
        return [`${c.domain}.${c.service}`, ...(Array.isArray(ids) ? ids : ids ? [ids] : [])];
      }),
    );
    expect(
      touched.filter((s) => s.startsWith('script.') || s.startsWith('automation.')),
      'ни один скрипт и ни одна автоматизация не должны быть запущены',
    ).toEqual([]);

    // Контроль: обычный свет при этом гасится — значит, «пусто» выше не от того,
    // что кнопка вообще ничего не делает.
    expect(touched).toContain('light.zal');
  });

  test('замок открывается только после подтверждения, отмена оставляет его закрытым', async ({ page }) => {
    await openHarness(page);
    await mountCard(page, { config: { plan: dangerousPlan() }, states: dangerStates() });
    await openPopup(page, ['lock.front_door']);

    // Кнопка замка: сейчас закрыт → предлагает открыть.
    await page.evaluate(() =>
      (window.BMS.root().querySelector('.control-popup [data-act="unlock"]') as HTMLElement).click(),
    );
    await page.waitForFunction(() => !!window.BMS.root().querySelector('.ask-form'));

    expect(
      await page.evaluate(() => window.BMS.serviceCalls.length),
      'до подтверждения дверь трогать нельзя',
    ).toBe(0);
    const ask = await page.evaluate(() => window.BMS.root().querySelector('.ask-form')?.textContent);
    expect(ask).toContain('Открыть замок?');

    // Отмена.
    await page.evaluate(async () => {
      const btns = [...window.BMS.root().querySelectorAll('.ask-form .btn')] as HTMLElement[];
      btns.find((b) => (b.textContent ?? '').includes('Отмена'))!.click();
      await window.BMS.card.updateComplete;
    });
    await page.waitForTimeout(200);

    expect(await page.evaluate(() => window.BMS.serviceCalls.length), 'отмена — значит замок закрыт').toBe(0);
    expect(await page.evaluate(() => window.BMS.card.effState('lock.front_door'))).toBe('locked');

    // Контроль: подтверждение действительно открывает — иначе «нулей» выше было
    // бы достаточно и у полностью сломанной кнопки.
    await page.evaluate(() =>
      (window.BMS.root().querySelector('.control-popup [data-act="unlock"]') as HTMLElement).click(),
    );
    await page.waitForFunction(() => !!window.BMS.root().querySelector('.ask-form'));
    await page.evaluate(async () => {
      const btns = [...window.BMS.root().querySelectorAll('.ask-form .btn')] as HTMLElement[];
      btns.find((b) => (b.textContent ?? '').includes('Открыть'))!.click();
      await window.BMS.card.updateComplete;
    });
    await page.waitForFunction(() => window.BMS.serviceCalls.length > 0);

    const call = await page.evaluate(() => window.BMS.serviceCalls[0]);
    expect(`${call.domain}.${call.service}`).toBe('lock.unlock');
  });
});
