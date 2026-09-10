#!/usr/bin/env node
// ---------------------------------------------------------------------------
// «Умеет ли проверка краснеть».
//
// Правило компании: проверка, которую ни разу не видели красной, считается
// ненаписанной. Чтобы это доказать, нужно сломать ровно то, что проверка
// стережёт — но dist/ трогать нельзя (его собирает другой человек, и правка
// уехала бы клиентам). Поэтому здесь делается КОПИЯ бандла с точечной правкой,
// а стенд грузит её параметром ?bundle=… . Сам dist/ остаётся нетронутым.
//
//   node tests/tools/patch-bundle.mjs <id>      — собрать копию tests/.tmp/<id>.js
//   node tests/tools/patch-bundle.mjs --list    — список правок
//
// Каждая правка обязана найтись РОВНО столько раз, сколько заявлено, иначе
// инструмент падает: молча «применившаяся» правка снова дала бы ложную зелень.
// ---------------------------------------------------------------------------

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const SRC = resolve(ROOT, 'dist/bms-floorplan-card.js');
const OUT_DIR = resolve(ROOT, 'tests/.tmp');

/** kind: 'fix' — чинит дефект (красная проверка обязана позеленеть);
 *  kind: 'break' — вносит дефект (зелёная проверка обязана покраснеть). */
export const PATCHES = {
  // --- 1. Утечка WebGL-контекстов ------------------------------------------
  'fix-gl-dispose': {
    kind: 'fix',
    note: 'disconnectedCallback отпускает контекст рендерера + разовая проба GPU',
    edits: [
      {
        find: 'super.disconnectedCallback(), this.sceneManager?.stop(),',
        replace:
          'super.disconnectedCallback(), (() => { const sm = this.sceneManager; if (!sm) return; this.sceneManager = void 0; try { sm.renderer?.forceContextLoss?.(); } catch (e) {} try { sm.dispose(); } catch (e) {} })(),',
      },
      {
        // Второй источник утечки: определение класса GPU поднимает свой
        // одноразовый WebGL-контекст на КАЖДОЕ создание сцены и не отпускает
        // его. Видеокарта между монтированиями не меняется — считаем один раз.
        find: 'function Kd() {\n  try {',
        replace:
          'function Kd() {\n  if (Kd.__cached === void 0) Kd.__cached = Kd__probe();\n  return Kd.__cached;\n}\nfunction Kd__probe() {\n  try {',
      },
    ],
  },

  // --- 2. Сохранение стирает чужие проекты ---------------------------------
  'break-save-wipes': {
    kind: 'break',
    note: 'провал чтения общего плана снова считается «пустым хранилищем»',
    edits: [
      {
        // Якорь берём вместе с шапкой onSavePlan — «const e = await os(...)»
        // встречается и в других обработчиках.
        find:
          't.name || (t.name = this.editPlanName || "Plan");\n    const e = await os(this.hass);',
        replace:
          't.name || (t.name = this.editPlanName || "Plan");\n    const e = await os(this.hass).then((r) => r.ok ? r : { ok: !0, data: { projects: {} }, source: "none" });',
      },
    ],
  },

  // --- 3. Сообщение о сохранении врёт --------------------------------------
  'break-save-message': {
    kind: 'break',
    note: 'после отказа общей записи снова пишется «сохранён на все устройства»',
    edits: [
      {
        find: 'i.shared ? o = this.tx(`«${t.name}» сохранён на все устройства`',
        replace: '!0 ? o = this.tx(`«${t.name}» сохранён на все устройства`',
      },
    ],
  },

  // --- 4. Битый план гасит экран -------------------------------------------
  'fix-broken-plan': {
    kind: 'fix',
    note: 'брак в плане пропускается, остальное строится, ошибка человеческая',
    edits: [
      {
        // Предмет без position больше не роняет всю сборку этажа.
        find: 's.position.set(t.position[0], t.position[1], t.position[2]),',
        replace:
          's.position.set(Number(t.position?.[0]) || 0, Number(t.position?.[1]) || 0, Number(t.position?.[2]) || 0),',
      },
      {
        // Стена с NaN-координатой пропускается (NaN <= 1e-4 даёт false).
        find: 'r = o.clone().sub(i), a = r.length();\n  if (a <= 1e-4) return null;',
        replace: 'r = o.clone().sub(i), a = r.length();\n  if (!(a > 1e-4)) return null;',
      },
    ],
  },

  'fix-broken-plan-message': {
    kind: 'fix',
    note: 'то же самое + внятная русская строка о том, что в плане отбраковано',
    edits: [
      {
        find: 's.position.set(t.position[0], t.position[1], t.position[2]),',
        replace:
          's.position.set(Number(t.position?.[0]) || 0, Number(t.position?.[1]) || 0, Number(t.position?.[2]) || 0),',
      },
      {
        find: 'r = o.clone().sub(i), a = r.length();\n  if (a <= 1e-4) return null;',
        replace: 'r = o.clone().sub(i), a = r.length();\n  if (!(a > 1e-4)) return null;',
      },
      {
        find: 'this.currentPlan = t, this.sceneManager.loadPlan(t), this.sceneManager.optimizeForView(),',
        replace:
          'this.currentPlan = t, (() => { let bad = 0; for (const fl of t.floors ?? []) { for (const w of fl.walls ?? []) if (![w?.start?.[0], w?.start?.[1], w?.end?.[0], w?.end?.[1]].every((v) => Number.isFinite(v))) bad++; for (const f of fl.furniture ?? []) if (!Array.isArray(f?.position) || !f.position.every((v) => Number.isFinite(v))) bad++; } if (bad) this.loadError = `В плане пропущено испорченных элементов: ${bad}. Остальное показано — откройте редактор и поправьте их.`; })(), this.sceneManager.loadPlan(t), this.sceneManager.optimizeForView(),',
      },
    ],
  },

  // --- 5. Рендер по требованию ---------------------------------------------
  'fix-render-on-demand': {
    kind: 'fix',
    note: 'обновление сущности БЕЗ привязки больше не заставляет перерисовать кадр',
    edits: [
      {
        find:
          'updateEntity(t, e) {\n    this.lastHass = e, this.bindingManagers[this.activeFloor]?.updateEntity(t, e), this.bindingManagers.forEach((i, o) => {\n      o !== this.activeFloor && i.updateEntity(t, e);\n    }), this.updateMarkerColor(t, e), this.needsRender = !0;\n  }',
        replace:
          'updateEntity(t, e) {\n    this.lastHass = e;\n    const _bound = this.bindingManagers.some((m) => (m.bindings || []).some((b) => b?.def?.entity_id === t));\n    this.bindingManagers[this.activeFloor]?.updateEntity(t, e), this.bindingManagers.forEach((i, o) => {\n      o !== this.activeFloor && i.updateEntity(t, e);\n    }), this.updateMarkerColor(t, e), _bound && (this.needsRender = !0);\n  }',
      },
    ],
  },

  // --- 6. Вентилятор жжёт GPU ----------------------------------------------
  'fix-fan-idle': {
    kind: 'fix',
    note: 'крутящийся вентилятор перерисовывается ~10 раз в секунду, а не 60',
    edits: [
      {
        find:
          'const e = this.clock.getDelta(), n = this.controls.update(), i = this.bindingManagers[this.activeFloor]?.animate(e) ?? !1, o = n || i;',
        replace:
          'const e = this.clock.getDelta(), n = this.controls.update(), i = this.bindingManagers[this.activeFloor]?.animate(e) ?? !1; this._animAcc = (this._animAcc || 0) + e; let _tick = !1; i && this._animAcc >= 0.1 && (this._animAcc = 0, _tick = !0); const o = n || _tick;',
      },
    ],
  },
  'break-fan-timer-loop': {
    kind: 'break',
    note: 'цикл кадров на setTimeout вместо requestAnimationFrame — скрытая вкладка его не тормозит',
    edits: [
      { find: 'this.rafId = requestAnimationFrame(t);', replace: 'this.rafId = setTimeout(t, 8);' },
    ],
  },

  // --- 7. Тап пальцем ------------------------------------------------------
  'break-touch-slop': {
    kind: 'break',
    note: 'палец меряется мышиным допуском 6px — чуть смазанный тап читается как перетаскивание',
    edits: [
      { find: 'a = e.pointerType === "mouse" ? 6 : 12;', replace: 'a = 6;' },
    ],
  },

  'break-touch-slop-huge': {
    kind: 'break',
    note: 'допуск раздут до 40px — смаз камеры на 30px принимается за тап',
    edits: [
      { find: 'a = e.pointerType === "mouse" ? 6 : 12;', replace: 'a = 40;' },
    ],
  },

  // --- 8. Оптимистичное состояние ------------------------------------------
  'break-no-rollback': {
    kind: 'break',
    note: 'отказ службы больше не откатывает предположенное состояние',
    edits: [
      {
        find: 'r >= 0 && l && typeof l.catch == "function" && l.catch(a);',
        replace: 'r >= 0 && l && typeof l.catch == "function" && l.catch(() => {});',
      },
    ],
  },
  'break-rollback-clobbers': {
    kind: 'break',
    note: 'поздний отказ первого нажатия затирает второе (откат без проверки поколения)',
    edits: [
      {
        find:
          'const r = i && o !== void 0 ? this.setOptimistic(i, o) : -1, a = () => {\n      i && r >= 0 && this.optimistic.get(i)?.gen === r && this.clearOptimistic(i);\n    };',
        replace:
          'const r = i && o !== void 0 ? this.setOptimistic(i, o) : -1, a = () => {\n      i && r >= 0 && this.clearOptimistic(i);\n    };',
      },
    ],
  },

  // --- 9. Протечка поверх заставки -----------------------------------------
  'break-leak-under-saver': {
    kind: 'break',
    note: 'тревога о протечке уезжает ПОД заставку',
    edits: [
      { find: '.leak-alert {\n      position: absolute;\n      z-index: 60;', replace: '.leak-alert {\n      position: absolute;\n      z-index: 20;' },
    ],
  },

  // --- 10. Опасные действия ------------------------------------------------
  'break-script-allowed': {
    kind: 'break',
    note: 'script/automation снова попадают в список управляемых доменов',
    edits: [
      { find: '"lock",\n  "valve",\n  "button"\n]', replace: '"lock",\n  "valve",\n  "button",\n  "script",\n  "automation"\n]' },
    ],
  },
  'break-unlock-no-confirm': {
    kind: 'break',
    note: 'замок открывается без подтверждения',
    edits: [
      {
        find: 'e === "unlock" && !await this.askConfirm(',
        replace: 'e === "__never__" && !await this.askConfirm(',
      },
    ],
  },

  // --- 11. Перенос из старой версии ----------------------------------------
  'break-legacy-moves': {
    kind: 'break',
    note: 'чтение старого хранилища его же и вычищает (перенос вместо копии)',
    edits: [
      {
        find: 'const s = localStorage.getItem(O2);\n    if (s) {\n      const t = ta(JSON.parse(s));\n      if (t) return t;\n    }',
        replace:
          'const s = localStorage.getItem(O2);\n    if (s) {\n      const t = ta(JSON.parse(s));\n      if (t) { localStorage.removeItem(O2); return t; }\n    }',
      },
    ],
  },

  // --- 12. Числа с запятой -------------------------------------------------
  'fix-comma-numbers': {
    kind: 'fix',
    note: 'поля размеров принимают «3,5» (текстовое поле + нормализация запятой)',
    edits: [
      {
        find:
          '<input class="num-input" type="number" min="0.05" step="0.01" title="Wall thickness in meters (e.g. 0.25, 0.38, 0.78)"',
        replace:
          '<input class="num-input" type="text" inputmode="decimal" title="Wall thickness in meters (e.g. 0.25, 0.38, 0.78)"',
      },
      {
        find: 'onSetWallThickness(t) {\n    const e = parseFloat(t.target.value);',
        replace: 'onSetWallThickness(t) {\n    const e = parseFloat(String(t.target.value).replace(",", "."));',
      },
    ],
  },
  // --- 13. Навигация пальцами по большому плану -----------------------------
  'break-nav-one-finger-dead': {
    kind: 'break',
    note: 'один палец больше не ведёт план (как было: им можно только вращать)',
    edits: [
      {
        find: 'drag(e, n) {\n    const i = this.groundAt(e, n);\n    if (!i || !this.anchor) return;',
        replace: 'drag(e, n) {\n    const i = this.groundAt(e, n);\n    if (!i || !this.anchor || 1) return;',
      },
    ],
  },
  'break-nav-pan-approx': {
    kind: 'break',
    note: 'сдвиг считается «примерно» (на 20% меньше) — план уплывает из-под пальца',
    edits: [
      {
        find: 'const s = this.anchor.x - i.x, r = this.anchor.z - i.z;',
        replace: 'const s = (this.anchor.x - i.x) * 0.8, r = (this.anchor.z - i.z) * 0.8;',
      },
    ],
  },
  'break-nav-pivot-house': {
    kind: 'break',
    note: 'ось вращения на каждый жест возвращается в СЕРЕДИНУ ЗДАНИЯ — жалоба владельца',
    edits: [
      {
        find:
          'const i = Xn.clamp(n, this.controls.minDistance, this.controls.maxDistance), s = e.position.clone().addScaledVector(this.dir, i), r = this.host.limits();',
        replace:
          'const i = Xn.clamp(n, this.controls.minDistance, this.controls.maxDistance), s = (() => { const b = this.host.limits(); return b ? b.getCenter(new (this.dir.constructor)()) : e.position.clone().addScaledVector(this.dir, i); })(), r = this.host.limits();',
      },
    ],
  },
  'break-nav-min-distance': {
    kind: 'break',
    note: 'предел приближения снова от размера плана (на этаже 40 м — четыре метра)',
    edits: [
      { find: 'e.maxDistance = c * 3, e.minDistance = Rg,', replace: 'e.maxDistance = c * 3, e.minDistance = Math.max(1.2, l * 0.1),' },
    ],
  },
  'break-nav-tap-eaten': {
    kind: 'break',
    note: 'сторож «в жесте был второй палец» срабатывает всегда — тапы перестают доходить',
    edits: [
      { find: 'const i = this.multiTouch;', replace: 'const i = !0;' },
    ],
  },
  'break-nav-camera-in-floor': {
    kind: 'break',
    note: 'камера больше не держится над полом — при наклоне и приближении уезжает под перекрытие',
    edits: [
      { find: 'if (t.position.y < l) {', replace: 'if (!1 && t.position.y < l) {' },
    ],
  },
  'break-nav-edit-pans': {
    kind: 'break',
    note: 'в правке один палец ведёт план (схема просмотра протекла в редактор)',
    edits: [
      {
        find: 't.touches = e ? { ONE: Qn.ROTATE, TWO: Qn.DOLLY_PAN } : { ONE: null, TWO: Qn.DOLLY_ROTATE };',
        replace: 't.touches = { ONE: null, TWO: Qn.DOLLY_ROTATE };',
      },
      {
        find: 'enabled: () => !this.editing && this.controls.enabled',
        replace: 'enabled: () => this.controls.enabled',
      },
    ],
  },

  // --- Поломки для КОНТРОЛЬНЫХ проверок ------------------------------------
  // Контрольная проверка стережёт саму осмысленность соседней («мало кадров» /
  // «мешей нет» верно и для мёртвого стенда). Она тоже обязана уметь краснеть.
  'break-no-scene': {
    kind: 'break',
    note: 'сцена не создаётся вовсе — стенд обязан это заметить',
    edits: [
      {
        find: 'initScene() {\n    if (!this.viewport) return;',
        replace: 'initScene() {\n    if (!this.viewport || 1) return;',
      },
    ],
  },
  'break-empty-floor': {
    kind: 'break',
    note: 'этаж собирается пустым (мебель не ставится)',
    edits: [
      { find: 'for (const c of s.furniture ?? []) {', replace: 'for (const c of []) {' },
    ],
  },
  'break-never-render': {
    kind: 'break',
    note: 'сцена не перерисовывается даже на изменение привязанной сущности',
    edits: [
      {
        find: '}), this.updateMarkerColor(t, e), this.needsRender = !0;\n  }',
        replace: '}), this.updateMarkerColor(t, e);\n  }',
      },
    ],
  },
  'break-size-input-dead': {
    kind: 'break',
    note: 'поле толщины стены перестало применять введённое число',
    edits: [
      {
        find: 'onSetWallThickness(t) {\n    const e = parseFloat(t.target.value);',
        replace: 'onSetWallThickness(t) {\n    const e = NaN, _ = parseFloat(t.target.value);',
      },
    ],
  },
};

function apply(id) {
  const patch = PATCHES[id];
  if (!patch) throw new Error(`Нет такой правки: ${id}`);
  let code = readFileSync(SRC, 'utf8');
  for (const { find, replace, count = 1 } of patch.edits) {
    const hits = code.split(find).length - 1;
    if (hits !== count) {
      throw new Error(
        `Правка «${id}» не легла: якорь встретился ${hits} раз(а), ожидалось ${count}.\n` +
          `Скорее всего dist/ пересобрали и текст изменился — обнови якорь.\nЯкорь:\n${find}`,
      );
    }
    code = code.split(find).join(replace);
  }
  mkdirSync(OUT_DIR, { recursive: true });
  const out = resolve(OUT_DIR, `${id}.js`);
  writeFileSync(out, code, 'utf8');
  return `/tests/.tmp/${id}.js`;
}

export function buildPatched(id) {
  return apply(id);
}

// CLI — только когда файл запущен напрямую (его же импортирует prove.mjs).
const [, entry, arg] = process.argv;
if (!entry?.endsWith('patch-bundle.mjs')) {
  // импорт — ничего не делаем
} else if (arg === '--list') {
  for (const [id, p] of Object.entries(PATCHES)) {
    console.log(`${p.kind === 'fix' ? 'ЧИНИТ ' : 'ЛОМАЕТ'}  ${id.padEnd(26)} ${p.note}`);
  }
} else if (arg) {
  console.log(apply(arg));
}
