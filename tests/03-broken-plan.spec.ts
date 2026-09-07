import { test, expect } from '@playwright/test';
import { openHarness, mountCard } from './helpers/harness';
import { brokenPlan, simplePlan, baseStates } from './helpers/plans';

/** Сколько мешей реально построено на активном этаже. */
const meshCount = (page: any) =>
  page.evaluate(() => {
    const sm = window.BMS.card.sceneManager;
    let n = 0;
    for (const f of sm.floors ?? []) f.group.traverse((o: any) => o.isMesh && n++);
    return n;
  });

/** Сколько ЭЛЕМЕНТОВ плана реально построено. Меши для этого не годятся:
 *  optimizeForView() сливает статику по материалу, поэтому лишняя стена не
 *  меняет их число — на этом одна из версий этой проверки уже была
 *  декоративной (оставалась зелёной с вернувшимся дефектом). */
const partCount = (page: any) =>
  page.evaluate(() => {
    const sm = window.BMS.card.sceneManager;
    let walls = 0;
    let furniture = 0;
    for (const f of sm.floors ?? []) {
      walls += f.wallById?.size ?? 0;
      furniture += f.furnitureById?.size ?? 0;
    }
    return { walls, furniture, broken: sm.brokenParts?.() ?? [] };
  });

test.describe('Битый план', () => {
  test('контроль: целый план строится и даёт геометрию', async ({ page }) => {
    // Без этого замера соседняя проверка ничего не значит: «мешей 0» было бы
    // одинаково верно и для брака, и для сломанного стенда.
    await openHarness(page);
    await mountCard(page, { config: { plan: simplePlan() }, states: baseStates() });
    expect(await meshCount(page)).toBeGreaterThan(10);
  });

  test('брак в одной стене и одном предмете не гасит остальную планировку', async ({ page }) => {
    await openHarness(page);

    // Ожидание калибруем на месте, а не числом из головы: строим ТОТ ЖЕ план,
    // из которого брак просто вычеркнут. Битый обязан дать столько же — то
    // есть ровно «как будто этих двух элементов не писали».
    const clean = brokenPlan();
    clean.floors[0].walls = clean.floors[0].walls.filter((w: any) => Number.isFinite(w.end?.[0]));
    clean.floors[0].furniture = clean.floors[0].furniture.filter((f: any) => Array.isArray(f.position));
    await mountCard(page, { config: { plan: clean }, states: baseStates() });
    const ok = await partCount(page);
    await page.evaluate(() => window.BMS.unmount());

    await mountCard(page, { config: { plan: brokenPlan() }, states: baseStates() });
    const bad = await partCount(page);
    const lampAlive = await page.evaluate(
      () => !!window.BMS.card.sceneManager.getFurnitureObject('lamp1'),
    );

    // Страховка от декоративной зелени: если исправный план сам ничего не
    // построил, совпадение «0 = 0» ничего не доказывало бы.
    expect(ok.walls, 'исправный план обязан построить стены').toBe(4);
    expect(ok.furniture, 'исправный план обязан построить мебель').toBe(1);

    // Битый обязан дать РОВНО то же: брак не утащил исправное с собой и не
    // подрисовал стену там, где её никто не чертил.
    expect(bad.walls, `битый план построил ${bad.walls} стен вместо ${ok.walls}`).toBe(ok.walls);
    expect(bad.furniture, `битый план построил ${bad.furniture} предметов вместо ${ok.furniture}`).toBe(ok.furniture);
    expect(bad.broken.length, 'о каждом отброшенном элементе обязана остаться запись').toBe(2);
    expect(lampAlive, 'привязанный светильник обязан остаться на плане').toBe(true);
  });

  test('о браке в плане сообщают по-человечески, а не текстом исключения', async ({ page }) => {
    await openHarness(page);
    await mountCard(page, { config: { plan: brokenPlan() }, states: baseStates() });

    const msg = await page.evaluate(() => {
      const el = window.BMS.root().querySelector('.error, .plan-warning');
      return (el?.textContent ?? '').trim();
    });

    expect(msg, 'битый план обязан объяснить себя').not.toBe('');
    expect(msg, 'человеку нельзя показывать текст исключения').not.toMatch(
      /Cannot read|undefined|TypeError|NaN|is not a function/i,
    );
  });
});
