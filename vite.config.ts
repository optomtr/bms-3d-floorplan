import { defineConfig } from 'vite';
import { resolve } from 'path';
import { copyFileSync, mkdirSync } from 'fs';

// Имя собранного бандла — часть договора с интеграцией: она отдаёт его по
// /bms_floorplan_frontend/bms-floorplan-card.js и грузит на каждой странице HA.
const BUNDLE = 'bms-floorplan-card.js';

// После сборки кладём бандл внутрь интеграции, чтобы она отдавала ровно тот же
// файл, что лежит в dist/.
function copyToIntegration() {
  return {
    name: 'copy-to-integration',
    closeBundle() {
      const src = resolve(__dirname, `dist/${BUNDLE}`);
      const destDir = resolve(__dirname, 'custom_components/bms_floorplan/frontend');
      mkdirSync(destDir, { recursive: true });
      copyFileSync(src, resolve(destDir, BUNDLE));
    },
  };
}

// Библиотечная сборка: ВСЁ (Lit + Three.js) в одном ES-модуле. Ресурс HACS
// обязан быть одним файлом без внешних зависимостей во время выполнения.
export default defineConfig({
  plugins: [copyToIntegration()],
  build: {
    target: 'esnext',
    lib: {
      // Точка входа осознанно оставлена под старым именем файла — исходники
      // дробятся отдельным пакетом, переименование там сломало бы работу.
      entry: resolve(__dirname, 'src/ha-3d-floorplan-card.ts'),
      formats: ['es'],
      fileName: () => BUNDLE,
    },
    rollupOptions: {
      // Ничего не выносим наружу — всё едет в одном бандле.
      external: [],
      output: {
        // Один чанк: все динамические импорты инлайнятся.
        inlineDynamicImports: true,
        entryFileNames: BUNDLE,
      },
    },
    minify: 'esbuild',
    sourcemap: false,
    // Результат остаётся в dist/, он коммитится для релизов.
    outDir: 'dist',
    emptyOutDir: true,
  },
});
