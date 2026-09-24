#!/usr/bin/env node
// ---------------------------------------------------------------------------
// «Умеет ли проверка киоска краснеть».
//
// Правило компании: проверка, которую ни разу не видели красной, считается
// ненаписанной. Здесь ломается ровно то, что стережёт каждая проверка, — но в
// КОПИИ страницы: tests/.tmp/kiosk/<правка>/{root,integration}.html. Настоящие
// standalone/index.html и custom_components/.../index.html не трогаются.
//
//   node tests/tools/prove-kiosk.mjs           — весь список
//   node tests/tools/prove-kiosk.mjs break-auth-latch
//
// Каждая правка обязана найтись РОВНО один раз в каждой копии, иначе инструмент
// падает: молча «применившаяся» правка снова дала бы ложную зелень.
// ---------------------------------------------------------------------------

import { mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = resolve(ROOT, 'tests/.tmp/kiosk');

const SOURCES = {
  root: 'standalone/index.html',
  integration: 'custom_components/bms_floorplan/standalone/index.html',
};

/** Ядро вклеивается в страницу со сдвигом на два пробела (tools/sync-kiosk.mjs),
 *  поэтому якоря пишем как в исходнике standalone/kiosk/*.js, а сдвиг
 *  добавляем здесь. Иначе правку пришлось бы писать «как в HTML» и она
 *  молча перестала бы находиться при любой смене отступа. */
const shift = (text) =>
  text
    .split('\n')
    .map((l) => (l.trim() ? '  ' + l : l))
    .join('\n');

/** Правка = [что найти, чем заменить]. Найтись обязана ровно один раз. */
export const PATCHES = {
  'break-auth-latch': {
    note: 'возвращает прежний тупик: после auth_invalid страница больше не подключается',
    edits: [
      [
        "      invalidate(auth.source);\n      auth.source = null;\n      closeSock(sock);",
        "      live.timer = 1; /* вечный флаг отказа, как было до 0.180.0 */\n      closeSock(sock);",
      ],
    ],
  },
  'break-no-pairing': {
    note: 'входа нет — и экран привязки не показывается',
    edits: [["        runPairing();", "        /* привязки нет */;"]],
  },
  'break-no-watchdog': {
    note: 'сторож никогда не перезагружает страницу',
    edits: [["    if (now() - live.lastGood < WATCHDOG_MS) return;", "    if (true) return;"]],
  },
  'break-no-plan-cache': {
    note: 'прошлый план не сохраняется — экран после перезапуска пуст',
    edits: [["function cachePlan(plan) {\n  if (!validPlan(plan)) return false;", "function cachePlan(plan) {\n  if (plan) return false;"]],
  },
  'break-no-wake': {
    note: 'пробуждение планшета никого не будит: зомби-сокет живёт дальше',
    edits: [
      ["    if (gap > WAKE_GAP_MS) kick('планшет проснулся');", "    if (gap > WAKE_GAP_MS) { /* спим дальше */ }"],
      ["    if (!document.hidden) kick('вкладку показали');", "    if (!document.hidden) { /* ничего */ }"],
    ],
  },
  'break-renew-never': {
    note: 'отвергнутый токен не восстанавливается по секрету',
    edits: [["      const updated = await renewKioskToken(cred);", "      const updated = { token: cred.token };"]],
  },
};

export function buildPatched(id) {
  const patch = PATCHES[id];
  if (!patch) throw new Error(`неизвестная правка: ${id}`);
  const dir = resolve(OUT, id);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  for (const [name, source] of Object.entries(SOURCES)) {
    let html = readFileSync(resolve(ROOT, source), 'utf8');
    for (const [rawFind, rawReplace] of patch.edits) {
      const find = shift(rawFind);
      const replace = shift(rawReplace);
      const hits = html.split(find).length - 1;
      if (hits !== 1) {
        throw new Error(`${id}: в ${source} якорь найден ${hits} раз(а), а нужен ровно один:\n${find}`);
      }
      html = html.replace(find, replace);
    }
    writeFileSync(resolve(dir, `${name}.html`), html);
  }
  return `/tests/.tmp/kiosk/${id}`;
}

/** [файл проверок, кусок названия, правка, ожидаемый цвет] */
const CASES = [
  ['30-kiosk-recovery', 'отозвали посреди работы', 'break-renew-never', 'red'],
  ['30-kiosk-recovery', 'auth_invalid при подключении', 'break-auth-latch', 'red'],
  ['30-kiosk-recovery', 'refresh-токен отвергнут', 'break-no-pairing', 'red'],
  ['30-kiosk-recovery', 'проспал час', 'break-no-wake', 'red'],
  ['30-kiosk-recovery', 'код привязки, подтверждение', 'break-no-pairing', 'red'],
  ['30-kiosk-recovery', 'прошлый план остаётся', 'break-no-plan-cache', 'red'],
  ['32-kiosk-watchdog', 'три минуты без связи', 'break-no-watchdog', 'red'],
];

const only = process.argv.slice(2);
const cases = only.length ? CASES.filter((c) => only.some((o) => c[2].includes(o) || c[0].includes(o))) : CASES;

const built = new Map();
let bad = 0;

for (const [file, grep, patch, expect] of cases) {
  if (!built.has(patch)) built.set(patch, buildPatched(patch));
  const args = ['playwright', 'test', `tests/${file}.spec.ts`, '--reporter=line'];
  if (grep) args.push('-g', grep);
  const res = spawnSync('npx', args, {
    cwd: ROOT,
    env: { ...process.env, BMS_KIOSK_PAGE: built.get(patch) },
    encoding: 'utf8',
  });
  const got = res.status === 0 ? 'green' : 'red';
  const ok = got === expect;
  if (!ok) bad++;
  console.log(
    `${ok ? 'OK ' : 'ХМ '} ${file.padEnd(20)} ${grep.padEnd(30)} ${patch.padEnd(22)} ждали ${expect}, вышло ${got}`,
  );
  if (!ok) {
    const line = (res.stdout || '')
      .split('\n')
      .filter((l) => /Error|expect|passed|failed/.test(l))
      .slice(0, 3)
      .map((l) => l.trim())
      .join(' | ');
    console.log(`      ${line}`);
  }
}

console.log(bad ? `\nНесовпадений: ${bad}` : '\nВсе проверки киоска поменяли цвет ровно так, как ожидалось.');
process.exit(bad ? 1 : 0);
