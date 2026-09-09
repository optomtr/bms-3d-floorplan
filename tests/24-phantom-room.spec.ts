// ---------------------------------------------------------------------------
// СТОРОЖ «ЛИШНЕГО ДОМИКА».
//
// Случай с офисного объекта владельца: в одной комнате два значка-домика, и
// второй не удаляется. Разгадка — он не объект: карточка собирает «комнату»
// из устройств, не попавших ни в одну зону, и рисует ей маркер. А состояла та
// комната ЦЕЛИКОМ из привязок к устройствам, которых в Home Assistant уже нет
// (переименовали или удалили). Удалить её человек не мог: в плане её нет.
//
// Почему фильтр не спасал: план строится РАНЬШЕ, чем приходят состояния.
// На первом проходе «сущности нет в HA» проверить нечем, поэтому призраки
// проходят. Когда состояния приходят, пропажа замечается — но раньше
// сбрасывался только кэш «Обзора», а маркеры оставались навсегда.
// ---------------------------------------------------------------------------

import { expect, test } from '@playwright/test';
import { mountCard, openHarness, settleScene } from './helpers/harness';
import { boxWalls } from './helpers/plans';

/** План офисного вида: одна зона с живым устройством плюс привязки к
 *  устройствам, которых в Home Assistant нет. */
function planWithGhosts() {
  return {
    name: 'Офис',
    wallHeight: 2.7,
    floors: [
      {
        name: '1 Этаж',
        elevation: 0,
        wallHeight: 2.7,
        walls: boxWalls(10, 8),
        rooms: [{ name: 'Ресепшн', polygon: [[0, 0], [10, 0], [10, 8], [0, 8]] }],
        furniture: [
          { id: 'lamp', model: 'ceiling_light', position: [2, 2.5, 2] },
          { id: 'ghost1', model: 'ceiling_light', position: [7, 2.5, 6] },
          { id: 'ghost2', model: 'curtain', position: [8, 1, 6] },
        ],
        zones: [{ id: 'z1', name: 'Ресепшн', x: 2, z: 2, entities: ['light.zhivaia'] }],
        bindings: [
          { entity_id: 'light.zhivaia', anchor_object: 'lamp', behavior: 'light' },
          // Привязки-призраки: таких сущностей в HA нет.
          { entity_id: 'light.liustra_3', anchor_object: 'ghost1', behavior: 'light' },
          { entity_id: 'cover.shtory_ab', anchor_object: 'ghost2', behavior: 'cover' },
        ],
      },
    ],
  };
}

const liveStates = () => ({
  'light.zhivaia': { entity_id: 'light.zhivaia', state: 'on', attributes: { friendly_name: 'Свет ресепшн' } },
});

test.describe('Лишний «домик»', () => {
  test('привязки к несуществующим устройствам не создают комнату, которую нельзя удалить', async ({ page }) => {
    await openHarness(page);
    await mountCard(page, { config: { plan: planWithGhosts() }, states: liveStates(), height: '620px' });
    await settleScene(page);

    const rooms: Array<{ key: string; name: string | null; ids: string[] }> = await page.evaluate(() => {
      const sm = window.BMS.card.sceneManager;
      return sm.getRooms().map((r: any) => ({
        key: r.key as string,
        name: (r.name ?? null) as string | null,
        ids: (r.entities || []).map((e: any) => e.entity_id as string),
      }));
    });

    // Контроль: живая зона на месте — иначе «нет лишних комнат» было бы верно
    // и для пустой сцены.
    const zone = rooms.find((r) => /^z/.test(r.key));
    expect(zone, 'зона с живым устройством обязана остаться').toBeTruthy();
    expect(zone!.ids, 'и держать своё устройство').toEqual(['light.zhivaia']);

    const ghosts = rooms.filter((r) =>
      (r.ids as string[]).some((id) => id === 'light.liustra_3' || id === 'cover.shtory_ab'),
    );
    expect(
      ghosts.map((g) => `${g.key}: ${g.ids.join(', ')}`),
      'комнат из несуществующих устройств быть не должно — их нельзя удалить',
    ).toEqual([]);
    expect(rooms.length, 'на этаже ровно одна комната — та, что настоящая').toBe(1);
  });

  test('устройство ПОЯВИЛОСЬ в Home Assistant — комната для него появляется', async ({ page }) => {
    // Обратная сторона: фильтр не должен прятать устройство, которое просто
    // ещё не успело приехать. Иначе «починка» превратилась бы в пропажу.
    await openHarness(page);
    await mountCard(page, { config: { plan: planWithGhosts() }, states: liveStates(), height: '620px' });
    await settleScene(page);

    const after: string[] = await page.evaluate(async () => {
      const api = window.BMS as any;
      api.setStates({
        'light.liustra_3': {
          entity_id: 'light.liustra_3', state: 'off', attributes: { friendly_name: 'Люстра 3' },
        },
      });
      await new Promise((r) => setTimeout(r, 600));
      const sm = window.BMS.card.sceneManager;
      return sm.getRooms().map((r: any) => (r.entities || []).map((e: any) => e.entity_id)).flat();
    });

    expect(after, 'появившееся устройство обязано занять своё место на плане').toContain('light.liustra_3');
  });
});
