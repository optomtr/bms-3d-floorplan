import { test, expect } from '@playwright/test';
import { openHarness, mountCard, settleScene } from './helpers/harness';
import { simplePlan, baseStates } from './helpers/plans';

/**
 * Планшет на стене, проспавший ночь (или переживший нехватку памяти), отдаёт
 * WebGL-контекст системе. Обработчика на это в карточке не было НИ ОДНОГО:
 * после потери контекста сцена не рисуется больше никогда, и владелец видит
 * чёрный прямоугольник до тех пор, пока к панели не подойдёт человек.
 *
 * Одной этой поломки достаточно, чтобы киоск «перестал работать» — никакие
 * переподключения к Home Assistant тут не помогают, связь-то в порядке.
 */
test.describe('Потеря контекста WebGL', () => {
  test('сцена пересобирается сама и снова рисует кадры', async ({ page }) => {
    await openHarness(page, { countGl: true });
    await mountCard(page, { config: { plan: simplePlan() }, states: baseStates(), height: '320px' });
    await settleScene(page);

    // Запоминаем ИМЕННО холст: новая сцена обязана прийти с новым холстом,
    // потому что восстановленный старый контекст пуст — без текстур, буферов
    // и шейдеров.
    const marked = await page.evaluate(() => {
      const sm = (window as any).BMS.card.sceneManager;
      (window as any).__oldCanvas = sm.renderer.domElement;
      return !!sm;
    });
    expect(marked, 'сцена обязана существовать до опыта').toBe(true);

    // Настоящая потеря контекста, та же, что устраивает браузер.
    const lost = await page.evaluate(() => {
      const sm = (window as any).BMS.card.sceneManager;
      const gl = sm.renderer.getContext();
      const ext = gl.getExtension('WEBGL_lose_context');
      if (!ext) return false;
      ext.loseContext();
      return true;
    });
    expect(lost, 'браузер стенда обязан уметь ронять контекст').toBe(true);

    // Никто ничего не трогает.
    await page.waitForFunction(
      () => {
        const card = (window as any).BMS.card;
        const sm = card?.sceneManager;
        return !!sm && sm.renderer.domElement !== (window as any).__oldCanvas && card.planLoaded;
      },
      undefined,
      { timeout: 30_000, polling: 100 },
    );

    // И сцена именно РИСУЕТ, а не просто существует: новый рисовальщик обязан
    // отсчитать кадры с нуля, а его контекст — быть живым.
    await page.waitForFunction(() => (window as any).BMS.frames() > 0, undefined, {
      timeout: 20_000,
      polling: 100,
    });
    const alive = await page.evaluate(() => {
      const sm = (window as any).BMS.card.sceneManager;
      return !sm.renderer.getContext().isContextLost();
    });
    expect(alive, 'контекст новой сцены обязан быть живым').toBe(true);

    const gl = await page.evaluate(() => (window as any).__glStats());
    // Старый контекст потерян, новый живой — и их не расплодилось.
    expect(gl.live, `живых контекстов после восстановления: ${gl.live}`).toBeGreaterThanOrEqual(1);
    expect(gl.live).toBeLessThanOrEqual(3);
  });
});
