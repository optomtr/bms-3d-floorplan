import { test, expect, type Page } from '@playwright/test';
import { openHarness, mountCard, settleScene } from './helpers/harness';
import { tapPlan, baseStates } from './helpers/plans';

const STATES = {
  ...baseStates(),
  'switch.veranda': { state: 'off', attributes: { friendly_name: 'Телевизор на веранде' } },
};

/** Экранный прямоугольник предмета — считаем через камеру сцены, а не ищем
 *  по пикселям: текстуры в src/scene/materials.ts случайные при каждой
 *  загрузке, пиксельный поиск мигал бы. */
async function targetBox(page: Page, furnitureId: string) {
  const box = await page.evaluate((id) => {
    const sm = window.BMS.card.sceneManager;
    const obj = sm.getFurnitureObject(id);
    if (!obj) return null;
    obj.updateMatrixWorld(true);
    const r = sm.renderer.domElement.getBoundingClientRect();
    const xs: number[] = [];
    const ys: number[] = [];
    obj.traverse((o: any) => {
      if (!o.isMesh) return;
      o.geometry.computeBoundingBox();
      const b = o.geometry.boundingBox;
      for (const x of [b.min.x, b.max.x])
        for (const y of [b.min.y, b.max.y])
          for (const z of [b.min.z, b.max.z]) {
            const v = obj.position.clone();
            v.set(x, y, z).applyMatrix4(o.matrixWorld).project(sm.camera);
            xs.push(r.left + (v.x * 0.5 + 0.5) * r.width);
            ys.push(r.top + (0.5 - v.y * 0.5) * r.height);
          }
    });
    return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
  }, furnitureId);
  if (!box) throw new Error(`Нет предмета ${furnitureId} — план изменился`);
  return { cx: (box.x0 + box.x1) / 2, cy: (box.y0 + box.y1) / 2, w: box.x1 - box.x0, h: box.y1 - box.y0 };
}

/** Настоящий палец: касание, смещение, отрыв. page.touchscreen так не умеет,
 *  поэтому события идут напрямую через CDP — с pointerType «touch». */
async function fingerTap(page: Page, x: number, y: number, dx: number): Promise<void> {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  if (dx) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + dx, y }] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await cdp.detach();
}

const popupOpen = (page: Page) =>
  page.evaluate(async () => {
    await window.BMS.card.updateComplete;
    return !!window.BMS.root().querySelector('.control-popup');
  });

const closePopup = (page: Page) =>
  page.evaluate(async () => {
    const c = window.BMS.card;
    c.controlOpenedAt = 0;
    c.controlOpen = false;
    await c.updateComplete;
  });

test.describe('Тап пальцем', () => {
  test('смещение 10px — попап открывается и не схлопывается', async ({ page }) => {
    await openHarness(page);
    await mountCard(page, { config: { plan: tapPlan() }, states: STATES });
    await settleScene(page);

    const t = await targetBox(page, 'veranda_tv');
    await fingerTap(page, t.cx - 5, t.cy, 10);

    expect(await popupOpen(page), 'палец дрожит — 10px это тап, а не перетаскивание').toBe(true);
    expect(await page.evaluate(() => window.BMS.card.controlEntities)).toContain('switch.veranda');

    // Синтетический «призрачный» click прилетает примерно через 300 мс и
    // раньше гасил только что открытый попап.
    await page.waitForTimeout(700);
    expect(await popupOpen(page), 'попап обязан пережить призрачный click').toBe(true);
  });

  test('смещение 30px — это перетаскивание камеры, попап не открывается', async ({ page }) => {
    await openHarness(page);
    await mountCard(page, { config: { plan: tapPlan() }, states: STATES });
    await settleScene(page);

    const t = await targetBox(page, 'veranda_tv');
    expect(t.w, 'цель должна быть шире смещения, иначе проверялся бы промах, а не жест').toBeGreaterThan(60);

    // Предусловие: обе точки жеста лежат НА предмете. Без него «попап не
    // открылся» означало бы всего лишь «палец промахнулся».
    await fingerTap(page, t.cx - 15, t.cy, 0);
    expect(await popupOpen(page), 'начальная точка обязана попадать в предмет').toBe(true);
    await closePopup(page);
    await fingerTap(page, t.cx + 15, t.cy, 0);
    expect(await popupOpen(page), 'конечная точка обязана попадать в предмет').toBe(true);
    await closePopup(page);

    // А теперь то же расстояние, но одним жестом.
    await fingerTap(page, t.cx - 15, t.cy, 30);
    await page.waitForTimeout(300);
    expect(await popupOpen(page), 'смаз в 30px — это жест камеры').toBe(false);
  });
});
