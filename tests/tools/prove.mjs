#!/usr/bin/env node
// ---------------------------------------------------------------------------
// «Докажи, что проверка умеет краснеть».
//
// Гоняет каждую проверку против намеренно испорченной (или, для уже красных, —
// починенной) копии бандла и сверяет цвет с ожидаемым. dist/ при этом не
// меняется: копии лежат в tests/.tmp и подставляются параметром ?bundle=.
//
//   node tests/tools/prove.mjs            — весь список
//   node tests/tools/prove.mjs 05 06      — только эти файлы проверок
//
// Красный там, где ждали зелёный (или наоборот) — повод не верить проверке.
// ---------------------------------------------------------------------------

import { execFileSync, spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildPatched } from './patch-bundle.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

/** [файл проверок, кусок названия, правка бандла, ожидаемый цвет] */
const CASES = [
  // Проверка ручного стенда грузит /test/index.html напрямую и подменой бандла
  // не управляется — её краснота показана отдельно, вручную (см. отчёт).
  ['00-smoke', 'карточка монтируется', 'break-no-scene', 'red'],

  ['01-webgl-leak', '', 'fix-gl-dispose', 'green'],

  ['02-save-projects', 'не стирает чужой проект', 'break-save-wipes', 'red'],
  ['02-save-projects', 'не обещает', 'break-save-message', 'red'],

  ['03-broken-plan', 'контроль', 'break-empty-floor', 'red'],
  ['03-broken-plan', 'не гасит остальную', 'fix-broken-plan', 'green'],
  ['03-broken-plan', 'по-человечески', 'fix-broken-plan-message', 'green'],

  ['04-render-on-demand', '300 чужих', 'fix-render-on-demand', 'green'],
  ['04-render-on-demand', 'контроль', 'break-never-render', 'red'],
  ['04-render-on-demand', 'не держит 60', 'fix-fan-idle', 'green'],
  ['04-render-on-demand', 'вкладку скрыли', 'break-fan-timer-loop', 'red'],

  ['05-touch-tap', '10px', 'break-touch-slop', 'red'],
  ['05-touch-tap', '30px', 'break-touch-slop-huge', 'red'],

  ['06-optimistic', 'откатывает', 'break-no-rollback', 'red'],
  ['06-optimistic', 'поздний отказ', 'break-rollback-clobbers', 'red'],

  ['07-leak-over-saver', '', 'break-leak-under-saver', 'red'],

  ['08-dangerous-actions', 'не вызываются', 'break-script-allowed', 'red'],
  ['08-dangerous-actions', 'замок', 'break-unlock-no-confirm', 'red'],

  ['09-legacy-import', '', 'break-legacy-moves', 'red'],

  ['10-comma-numbers', 'даёт 3.5', 'fix-comma-numbers', 'green'],
  ['10-comma-numbers', 'контроль', 'break-size-input-dead', 'red'],
  ['10-comma-numbers', 'без помощи браузера', 'fix-comma-numbers', 'green'],

  // Навигация пальцами. Гоняем на одном размере экрана (лёжа 1280 x 800) —
  // проверка одна и та же, а прогон каждой стоит минуту.
  ['29-navigation', 'лёжа.*угол этажа', 'break-nav-one-finger-dead', 'red'],
  ['29-navigation', 'лёжа.*под пальцем', 'break-nav-pan-approx', 'red'],
  ['29-navigation', 'лёжа.*вокруг видимой', 'break-nav-pivot-house', 'red'],
  ['29-navigation', 'лёжа.*вплотную', 'break-nav-min-distance', 'red'],
  ['29-navigation', 'лёжа.*вплотную', 'break-nav-camera-in-floor', 'red'],
  ['29-navigation', 'лёжа.*одиночный тап', 'break-nav-tap-eaten', 'red'],
  ['29-navigation', 'лёжа.*рисует стену', 'break-nav-edit-pans', 'red'],
];

const only = process.argv.slice(2);
const cases = only.length ? CASES.filter((c) => only.some((o) => c[0].includes(o))) : CASES;

const built = new Set();
let bad = 0;

for (const [file, grep, patch, expect] of cases) {
  if (!built.has(patch)) {
    buildPatched(patch);
    built.add(patch);
  }
  const args = ['playwright', 'test', `tests/${file}.spec.ts`, '--reporter=line'];
  if (grep) args.push('-g', grep);
  const res = spawnSync('npx', args, {
    cwd: ROOT,
    env: { ...process.env, BMS_BUNDLE: `/tests/.tmp/${patch}.js` },
    encoding: 'utf8',
  });
  const got = res.status === 0 ? 'green' : 'red';
  const ok = got === expect;
  if (!ok) bad++;
  const line = (res.stdout || '')
    .split('\n')
    .filter((l) => /Error|expect|Received|Expected|passed|failed/.test(l))
    .slice(0, 3)
    .map((l) => l.trim())
    .join(' | ');
  console.log(
    `${ok ? 'OK ' : 'ХМ '} ${file.padEnd(21)} ${(grep || '(весь файл)').padEnd(26)} ${patch.padEnd(24)} ждали ${expect}, вышло ${got}`,
  );
  if (!ok) console.log(`      ${line}`);
}

console.log(bad ? `\nНесовпадений: ${bad}` : '\nВсе проверки поменяли цвет ровно так, как ожидалось.');
process.exit(bad ? 1 : 0);
