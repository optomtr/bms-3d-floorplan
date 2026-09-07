import { defineConfig, devices } from '@playwright/test';

/** Выделенный порт стенда. 10080 в компании запрещён, 8732 занят превью. */
export const PORT = 8733;
export const BASE_URL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: './tests',
  // 3D-сцена на SwiftShader строится медленно, а часть проверок специально
  // ждёт по 10 секунд — короткий таймаут дал бы ложную «красноту».
  timeout: 120_000,
  expect: { timeout: 15_000 },
  // Каждый тест поднимает свой WebGL-контекст; параллельные воркеры их
  // вытесняют друг у друга и проверка на утечку контекстов начинает врать.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: process.env.CI
    ? [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]]
    : [['list']],
  outputDir: 'test-results',
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    launchOptions: {
      // Без этого в headless-сборке нет WebGL, и вся карточка не стартует.
      args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
    },
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Полноценный Chromium в новом headless: в облегчённой оболочке
        // (headless shell) WebGL заводится не всегда, а без него карточки нет.
        channel: 'chromium',
        hasTouch: true,
        viewport: { width: 1100, height: 900 },
      },
    },
  ],
  webServer: {
    // Статика: стенду нужен только собранный бандл и фикстуры.
    command: `python3 -m http.server ${PORT} --bind 127.0.0.1`,
    url: `${BASE_URL}/tests/fixtures/harness.html`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
