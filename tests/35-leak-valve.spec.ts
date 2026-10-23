// ---------------------------------------------------------------------------
// Протечка у владельца: кран «Клапан протечки» заведён дважды —
// valve.klapan_protechki и switch.klapan_protechki — и под старое правило
// «water…valve» не подходил: тревога шла без кнопки «Открыть кран».
// Датчик протечки в списке комнаты — тревога называет комнату.
// ---------------------------------------------------------------------------

import { test, expect, type Page } from '@playwright/test';
import { openHarness, mountCard } from './helpers/harness';
import { simplePlan, baseStates, type AnyPlan } from './helpers/plans';

function planWithBathroom(): AnyPlan {
  const p = simplePlan();
  p.floors[0].zones = [{ id: 'z1', name: 'Санузел девочки', x: 3, z: 2.5, entities: ['binary_sensor.detskaia_devochka_datchik'] }];
  return p;
}

const states = (valve: string, wet: boolean) => ({
  ...baseStates(),
  'valve.klapan_protechki': { state: valve, attributes: { friendly_name: 'Клапан протечки' } },
  'switch.klapan_protechki': { state: valve === 'open' ? 'on' : 'off', attributes: { friendly_name: 'Клапан протечки' } },
  // Каналы реле того же крана — у владельца они тоже есть и не должны прятать кнопку.
  'switch.klapan_protechki_switch_1': { state: 'off', attributes: { friendly_name: 'Клапан протечки Switch 1' } },
  'switch.klapan_protechki_switch_2': { state: 'off', attributes: { friendly_name: 'Клапан протечки Switch 2' } },
  'binary_sensor.detskaia_devochka_datchik': { state: wet ? 'on' : 'off', attributes: { friendly_name: 'Детская Девочка датчик', device_class: 'moisture' } },
});

const alertOf = (page: Page) => page.evaluate(() => {
  const a = window.BMS.root().querySelector('.leak-alert');
  const btn = [...(a?.querySelectorAll('button.leak-b.primary') ?? [])][0] as HTMLButtonElement | undefined;
  return { shown: !!a, text: (a?.textContent ?? '').replace(/\s+/g, ' ').trim(), valveBtn: btn ? { text: btn.textContent?.trim(), disabled: btn.disabled } : null };
});

test('кран закрыт после протечки: «Вода перекрыта» и кнопка открывает именно valve.*', async ({ page }) => {
  await openHarness(page);
  await mountCard(page, { config: { plan: planWithBathroom() }, states: states('closed', false) });
  await page.waitForFunction(() => !!window.BMS.root().querySelector('.leak-alert'), undefined, { timeout: 20_000 });
  const a = await alertOf(page);
  expect(a.text).toContain('Вода перекрыта');
  expect(a.valveBtn, 'кнопка крана обязана быть — кран у владельца один').not.toBeNull();
  expect(a.valveBtn?.disabled).toBe(false);
  await page.evaluate(() => {
    const btn = window.BMS.root().querySelector('.leak-alert button.leak-b.primary') as HTMLButtonElement;
    btn.click();
  });
  const calls = await page.evaluate(() => window.BMS.serviceCalls.map((c) => `${c.domain}.${c.service}:${JSON.stringify(c.data)}`));
  expect(calls.join(' | ')).toContain('valve.open_valve');
  expect(calls.join(' | ')).toContain('valve.klapan_protechki');
  expect(calls.join(' | '), 'выключатель-двойник не трогаем').not.toContain('switch.turn_on');
});

test('мокрый датчик в списке комнаты — тревога называет комнату', async ({ page }) => {
  await openHarness(page);
  await mountCard(page, { config: { plan: planWithBathroom() }, states: states('open', true) });
  await page.waitForFunction(() => !!window.BMS.root().querySelector('.leak-alert'), undefined, { timeout: 20_000 });
  const a = await alertOf(page);
  expect(a.text).toContain('Протечка');
  expect(a.text).toContain('Санузел девочки');
  expect(a.valveBtn?.text).toContain('Кран открыт');
});
