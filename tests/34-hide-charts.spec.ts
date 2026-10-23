// ---------------------------------------------------------------------------
// Владелец: «вот эти графики можно скрыть полностью». В плане «hideCharts»:
// нет ни суточного графика в карточке комнаты, ни кнопки «Отчёт».
// ---------------------------------------------------------------------------

import { test, expect, type Page } from '@playwright/test';
import { openHarness, mountCard } from './helpers/harness';
import { simplePlan, baseStates } from './helpers/plans';

async function roomChartsAndReport(page: Page, hide: boolean) {
  const plan = simplePlan();
  if (hide) (plan as Record<string, unknown>).hideCharts = true;
  await openHarness(page);
  await mountCard(page, { config: { plan }, states: baseStates() });
  await page.waitForFunction(() => (window.BMS.card.rooms?.length ?? 0) > 0, undefined, { timeout: 20_000 });
  await page.evaluate(async () => {
    const c = window.BMS.card;
    c.activeRoomKey = c.rooms[0].key;
    c.requestUpdate();
    await c.updateComplete;
  });
  return page.evaluate(() => {
    const root = window.BMS.root();
    return {
      chart: !!root.querySelector('.rp-spark-note, .rp-spark svg, svg.rp-spark'),
      report: !![...root.querySelectorAll('button.sdot')].find((b) => (b.getAttribute('title') ?? '').startsWith('Отчёт')),
    };
  });
}

test('графики показаны по умолчанию — контроль', async ({ page }) => {
  const r = await roomChartsAndReport(page, false);
  expect(r.chart, 'без настройки место графика в карточке комнаты есть').toBe(true);
  expect(r.report, 'без настройки кнопка «Отчёт» есть').toBe(true);
});

test('hideCharts — ни графика в комнате, ни кнопки «Отчёт»', async ({ page }) => {
  const r = await roomChartsAndReport(page, true);
  expect(r.chart, 'график в карточке комнаты скрыт').toBe(false);
  expect(r.report, 'кнопка «Отчёт» скрыта').toBe(false);
});
