#!/usr/bin/env node
// ---------------------------------------------------------------------------
// Одно ядро киоска на две страницы.
//
// Киоск-страница существует в двух копиях: интеграция отдаёт свою
// (custom_components/bms_floorplan/standalone/index.html), а приложение на
// планшете грузит корневую (standalone/index.html). Они разъехались, и правка
// в одной месяцами не доезжала до другой — владелец при этом не знает, какую
// именно копию показывает его планшет.
//
// Теперь общий код живёт ОДИН раз, в standalone/kiosk/*.js, и этот скрипт
// вклеивает его в обе страницы между метками. Страницы остаются одним файлом
// каждая: и приложение с file:///android_asset, и статическая раздача папки
// работают без второго запроса.
//
//   node tools/sync-kiosk.mjs           — вклеить
//   node tools/sync-kiosk.mjs --check   — упасть, если копии разъехались
// ---------------------------------------------------------------------------

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC_DIR = resolve(ROOT, 'standalone/kiosk');

export const PAGES = [
  'standalone/index.html',
  'custom_components/bms_floorplan/standalone/index.html',
];

const BEGIN = '<!-- BMS_KIOSK_CORE:BEGIN';
const END = '<!-- BMS_KIOSK_CORE:END -->';

/** Собранное ядро: файлы в порядке имён, всё внутри одного замыкания. */
export function buildCore() {
  const files = readdirSync(SRC_DIR).filter((f) => f.endsWith('.js')).sort();
  if (!files.length) throw new Error('standalone/kiosk/*.js: нечего собирать');
  const parts = files.map((f) => {
    const text = readFileSync(resolve(SRC_DIR, f), 'utf8').replace(/\s+$/, '');
    return `// ===== standalone/kiosk/${f} =====\n${text}`;
  });
  const body = parts.join('\n\n');
  // Литерал </script внутри инлайнового скрипта закрыл бы элемент раньше
  // времени и разнёс бы страницу молча.
  if (/<\/script/i.test(body)) throw new Error('в ядре киоска есть литерал </script');
  return ['(function () {', "  'use strict';", '', body, '', '})();', ''].join('\n');
}

/** Отступ как у остального HTML, чтобы страница читалась глазами. */
function indent(text, pad) {
  return text
    .split('\n')
    .map((l) => (l.trim() ? pad + l : ''))
    .join('\n');
}

function block(core) {
  return [
    `${BEGIN} — собрано из standalone/kiosk/*.js скриптом tools/sync-kiosk.mjs.`,
    '     Править ЗДЕСЬ нельзя: правка живёт в standalone/kiosk/, иначе две копии',
    '     киоска снова разъедутся. Проверка: npm run check:kiosk. -->',
    '<script>',
    indent(core.replace(/\n+$/, ''), '  '),
    '</script>',
    END,
  ].join('\n');
}

function apply(page, core) {
  const path = resolve(ROOT, page);
  const html = readFileSync(path, 'utf8');
  const from = html.indexOf(BEGIN);
  const to = html.indexOf(END);
  if (from < 0 || to < 0 || to < from) {
    throw new Error(`${page}: не найдены метки ${BEGIN} … ${END}`);
  }
  // Отступ берём от самой метки — он у двух страниц одинаковый, но пусть это
  // проверяет файл, а не память.
  const lineStart = html.lastIndexOf('\n', from) + 1;
  const pad = html.slice(lineStart, from);
  if (pad.trim()) throw new Error(`${page}: метка ${BEGIN} обязана стоять с начала строки`);
  const next = html.slice(0, lineStart) + indent(block(core), pad) + html.slice(to + END.length);
  const changed = next !== html;
  return { path, next, changed };
}

export function sync({ check = false } = {}) {
  const core = buildCore();
  const drifted = [];
  for (const page of PAGES) {
    const { path, next, changed } = apply(page, core);
    if (!changed) continue;
    drifted.push(page);
    if (!check) writeFileSync(path, next);
  }
  return { drifted, bytes: core.length };
}

const invoked = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invoked) {
  const check = process.argv.includes('--check');
  try {
    const { drifted, bytes } = sync({ check });
    if (check && drifted.length) {
      console.error(
        'Копии киоска разъехались с ядром standalone/kiosk/:\n  ' +
          drifted.join('\n  ') +
          '\nПочините одной командой: node tools/sync-kiosk.mjs',
      );
      process.exit(1);
    }
    console.log(
      check
        ? `Обе копии киоска совпадают с ядром (${bytes} байт).`
        : drifted.length
          ? `Ядро киоска вклеено (${bytes} байт) в:\n  ` + drifted.join('\n  ')
          : `Ядро киоска уже на месте в обеих копиях (${bytes} байт).`,
    );
  } catch (err) {
    console.error('' + (err && err.message ? err.message : err));
    process.exit(1);
  }
}
