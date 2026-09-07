import { test, expect, type Page } from '@playwright/test';
import { openHarness, mountCard, enterEditFast } from './helpers/harness';
import { baseStates } from './helpers/plans';

/**
 * Редактор: стабильные идентификаторы и цена жеста.
 *
 * Привязка врезанной модели (гаражные ворота) раньше хранилась НОМЕРАМИ позиций
 * в массивах: `attach = { kind, index, opening }`. Любая правка, которая сдвигает
 * массив — удаление стены, слияние стен — оставляла номер прежним, а смысл его
 * менялся. Дальше удаление ворот вырезало ЧУЖОЙ проём: у соседа появлялась дыра,
 * а своя оставалась навсегда.
 *
 * Здесь три сторожа на это и один — на цену перетаскивания: раньше каждое
 * движение пальца пересобирало ВСЮ сцену.
 *
 * Планы в этих проверках нарочно записаны В СТАРОМ ВИДЕ (привязка по номерам,
 * без идентификаторов) — так же, как они лежат у клиентов. Значит проверки
 * заодно стерегут и совместимость: старый план обязан продолжать работать.
 */

/** Стена по её началу — номера в массиве после правок доверия не заслуживают. */
function wallAt(walls: any[], sx: number, sz: number): any {
  return walls.find((w) => Math.abs(w.start[0] - sx) < 1e-6 && Math.abs(w.start[1] - sz) < 1e-6);
}

/** Коробка 6×5, у стены №2 — голый проём под гаражные ворота, у стены №3 — окно.
 *  Ворота привязаны СТАРЫМ способом: `index: 2`. */
function garagePlan() {
  return {
    name: 'Гараж и окно',
    wallHeight: 2.6,
    floors: [
      {
        name: 'Первый этаж',
        elevation: 0,
        wallHeight: 2.6,
        walls: [
          { start: [0, 0], end: [6, 0] },
          { start: [6, 0], end: [6, 5] },
          {
            start: [6, 5],
            end: [0, 5],
            openings: [{ kind: 'door', position: 1.5, width: 2.6, sill: 0, top: 2.2, bare: true }],
          },
          {
            start: [0, 5],
            end: [0, 0],
            openings: [{ kind: 'window', position: 1.5, width: 1.2 }],
          },
        ],
        rooms: [{ polygon: [[0, 0], [6, 0], [6, 5], [0, 5]], color: '#c9c4bb' }],
        furniture: [
          {
            id: 'garage1',
            model: 'garage_door',
            position: [3, 1.1, 5],
            rotation: 180,
            attach: { kind: 'wall', index: 2, opening: 0 },
          },
        ],
        bindings: [],
      },
    ],
  };
}

/** Две налегающие стены на одной прямой: (0,0)–(6,0) с окном и (3,0)–(9,0) с
 *  голым проёмом под ворота. `mergeWalls()` сливает их в одну. */
function mergePlan() {
  return {
    name: 'Две стены на одной прямой',
    wallHeight: 2.6,
    floors: [
      {
        name: 'Первый этаж',
        elevation: 0,
        wallHeight: 2.6,
        walls: [
          { start: [0, 0], end: [6, 0], openings: [{ kind: 'window', position: 1, width: 1.2 }] },
          {
            start: [3, 0],
            end: [9, 0],
            openings: [{ kind: 'door', position: 2, width: 2.6, sill: 0, top: 2.2, bare: true }],
          },
        ],
        rooms: [],
        furniture: [
          {
            id: 'garage1',
            model: 'garage_door',
            position: [5, 1.1, 0],
            rotation: 0,
            attach: { kind: 'wall', index: 1, opening: 0 },
          },
        ],
        bindings: [],
      },
    ],
  };
}

async function openEditor(page: Page, plan: any): Promise<void> {
  await openHarness(page);
  await mountCard(page, { config: { plan }, states: baseStates() });
  await enterEditFast(page);
  await page.evaluate(() => {
    window.BMS.card.editor.setTool('select');
  });
}

test.describe('Редактор: стабильные идентификаторы', () => {
  test('удаление стены №0 не уводит дверь на чужую стену', async ({ page }) => {
    await openEditor(page, garagePlan());

    const walls = await page.evaluate(async () => {
      const ed = window.BMS.card.editor;
      ed.selectWall(0); // стена (0,0)–(6,0), к которой никто не привязан
      ed.deleteSelected();
      await window.BMS.card.updateComplete;
      // Теперь удаляем сами ворота: они обязаны закрыть СВОЙ проём.
      ed.selectFurniture('garage1');
      ed.deleteSelected();
      await window.BMS.card.updateComplete;
      return JSON.parse(JSON.stringify(ed.plan.floors[0].walls));
    });

    const garageWall = wallAt(walls, 6, 5);
    const windowWall = wallAt(walls, 0, 5);
    expect(garageWall, 'стена с воротами должна остаться в плане').toBeTruthy();
    expect(windowWall, 'стена с окном должна остаться в плане').toBeTruthy();

    expect(
      garageWall.openings ?? [],
      'ворота удалили — их собственный проём обязан закрыться',
    ).toHaveLength(0);
    expect(
      (windowWall.openings ?? []).map((o: any) => o.kind),
      'окно на соседней стене трогать было нельзя',
    ).toEqual(['window']);
  });

  test('слияние стен не теряет проёмы и привязку ворот', async ({ page }) => {
    await openEditor(page, mergePlan());

    const afterMerge = await page.evaluate(async () => {
      const ed = window.BMS.card.editor;
      ed.mergeWalls();
      await window.BMS.card.updateComplete;
      return JSON.parse(JSON.stringify(ed.plan.floors[0].walls));
    });

    // Контроль: слияние само по себе проёмы сохраняет (иначе проверка ниже
    // краснела бы не по той причине).
    expect(afterMerge, 'две стены на одной прямой обязаны слиться в одну').toHaveLength(1);
    expect(
      (afterMerge[0].openings ?? []).map((o: any) => o.kind).sort(),
      'после слияния обязаны остаться оба проёма',
    ).toEqual(['door', 'window']);

    const afterDelete = await page.evaluate(async () => {
      const ed = window.BMS.card.editor;
      ed.selectFurniture('garage1');
      ed.deleteSelected();
      await window.BMS.card.updateComplete;
      return JSON.parse(JSON.stringify(ed.plan.floors[0].walls));
    });

    const kinds = (afterDelete[0].openings ?? []).map((o: any) => o.kind);
    expect(
      kinds,
      'после слияния привязка обязана пережить смену массива: удалить нужно проём ворот и только его',
    ).toEqual(['window']);
  });

  test('старый план получает идентификаторы, номера остаются верными', async ({ page }) => {
    await openEditor(page, garagePlan());

    const before = await page.evaluate(() => {
      const fl = window.BMS.card.editor.plan.floors[0];
      return {
        wallIds: fl.walls.map((w: any) => w.id ?? null),
        openingIds: fl.walls.map((w: any) => (w.openings ?? []).map((o: any) => o.id ?? null)),
        attach: JSON.parse(JSON.stringify(fl.furniture[0].attach)),
      };
    });

    // Идентификаторы выдаются при загрузке плана, а не «когда-нибудь потом».
    expect(before.wallIds.every((id: any) => typeof id === 'string' && id.length > 0)).toBe(true);
    expect(before.openingIds[2][0], 'у проёма ворот обязан быть свой id').toEqual(expect.any(String));
    expect(before.attach.targetId, 'привязка переехала на id стены').toBe(before.wallIds[2]);
    expect(before.attach.openingId, 'привязка переехала на id проёма').toBe(before.openingIds[2][0]);

    // Обратная совместимость: старая версия карточки читает ТОЛЬКО номера.
    // После правки, сдвинувшей массив, номера обязаны остаться верными.
    const after = await page.evaluate(async () => {
      const ed = window.BMS.card.editor;
      ed.selectWall(0);
      ed.deleteSelected();
      await window.BMS.card.updateComplete;
      const fl = ed.plan.floors[0];
      return {
        walls: JSON.parse(JSON.stringify(fl.walls)),
        attach: JSON.parse(JSON.stringify(fl.furniture[0].attach)),
      };
    });

    const garageIndex = after.walls.findIndex(
      (w: any) => Math.abs(w.start[0] - 6) < 1e-6 && Math.abs(w.start[1] - 5) < 1e-6,
    );
    expect(garageIndex, 'стена с воротами осталась в плане').toBeGreaterThanOrEqual(0);
    expect(
      after.attach.index,
      'номер в привязке — зеркало для старой карточки, он обязан показывать на ту же стену',
    ).toBe(garageIndex);
    expect(after.attach.opening, 'номер проёма — то же зеркало').toBe(0);
  });
});

test.describe('Редактор: цена жеста', () => {
  test('перетаскивание стены не пересобирает сцену на каждое движение', async ({ page }) => {
    await openEditor(page, garagePlan());

    const result = await page.evaluate(async () => {
      const card = window.BMS.card;
      const sm = card.sceneManager;
      const ed = card.editor;
      const canvas = sm.renderer.domElement;

      // Счётчик ПОЛНЫХ пересборок сцены.
      let rebuilds = 0;
      const orig = sm.loadPlan.bind(sm);
      sm.loadPlan = (...a: any[]) => {
        rebuilds++;
        return orig(...a);
      };

      ed.selectWall(1); // стена (6,0)–(6,5): выбрана — значит её и тянем
      await card.updateComplete;

      // Точка захвата берётся ДАЛЕКО от стен и углов, чтобы жест гарантированно
      // был «перенос выбранной стены», а не правка вершины.
      const rect = canvas.getBoundingClientRect();
      const probe = sm.camera.position.clone();
      const toScreen = (x: number, z: number) => {
        probe.set(x, 0, z);
        probe.project(sm.camera);
        return {
          clientX: rect.left + ((probe.x + 1) / 2) * rect.width,
          clientY: rect.top + ((1 - probe.y) / 2) * rect.height,
        };
      };
      const fire = (type: string, x: number, z: number) => {
        const p = toScreen(x, z);
        canvas.dispatchEvent(
          new PointerEvent(type, {
            ...p,
            bubbles: true,
            isPrimary: true,
            pointerId: 1,
            pointerType: 'mouse',
            buttons: type === 'pointerup' ? 0 : 1,
          }),
        );
      };

      const startedAt = performance.now();
      fire('pointerdown', -8, -8);
      for (let i = 1; i <= 20; i++) fire('pointermove', -8 + i * 0.05, -8);
      const duringMoves = rebuilds;
      fire('pointerup', -8 + 20 * 0.05, -8);
      const ms = performance.now() - startedAt;

      sm.loadPlan = orig;
      const w = ed.plan.floors[0].walls[1];
      return { duringMoves, total: rebuilds, ms, moved: Math.abs(w.start[0] - 6) > 1e-6 };
    });

    // Контроль: если стена не сдвинулась, жест не состоялся и считать нечего.
    expect(result.moved, 'стена обязана реально сдвинуться — иначе замер пустой').toBe(true);
    expect(
      result.duringMoves,
      `20 движений пальца дали ${result.duringMoves} полных пересборок сцены (${Math.round(result.ms)} мс)`,
    ).toBe(0);
    expect(result.total, 'по окончании жеста — ровно одна пересборка').toBeLessThanOrEqual(2);
  });
});
