// ---------------------------------------------------------------------------
// СТОРОЖ ДВУХ ПРАВОК, о которых попросил владелец, глядя на живой объект.
//
//   1) Нижняя полоса комнат занимала пол-экрана: восемнадцать плашек
//      переносились в два ряда. Теперь она убирается язычком, и выбор помнит
//      само устройство. Переключатель этажей рядом НЕ прячется.
//   2) В комнату было трудно попасть: открывалась она только точным касанием
//      значка-«домика». Теперь тап в ЛЮБОЕ место пола открывает комнату, а
//      устройство под пальцем по-прежнему важнее комнаты.
//
// Стенд повторяет объект владельца: двенадцать комнат с длинными названиями на
// первом этаже и мансарда на втором — значит, есть и полоса, и переключатель
// этажей.
//
// Каждая проверка ломалась в исходнике и краснела — чем именно, написано в
// отчёте.
// ---------------------------------------------------------------------------

import { expect, test, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { mountCard, openHarness, settleScene } from './helpers/harness';
import { boxWalls, type AnyPlan } from './helpers/plans';

const SHOTS = 'test-results/shots-room-tap';

// --- объект владельца -------------------------------------------------------

/** Названия — как в его доме: длинные, в две строки плашек они и не влезают. */
const NAMES = [
  'Гостевой санузел', 'Гардеробная', 'Санузел', 'Кабинет 3',
  'Спальня родителей', 'Детская', 'Кухня-гостиная', 'Прихожая',
  'Котельная', 'Кабинет 1', 'Кабинет 2', 'Терраса',
];
const COLS = 4;
const RW = 5;
const RD = 4.5;

/** Левый ближний угол комнаты №i в сетке 4 x 3. */
const cell = (i: number) => ({ x: (i % COLS) * RW, z: Math.floor(i / COLS) * RD });
/** Центр комнаты — там же, где стоит её «домик». */
const centre = (i: number) => ({ x: cell(i).x + RW / 2, z: cell(i).z + RD / 2 });
/** Торшер комнаты — НАРОЧНО в стороне от центра, иначе он оказался бы прямо
 *  под значком комнаты и «тап по устройству» было бы не отличить от «тап по
 *  домику». */
const lampAt = (i: number) => ({ x: cell(i).x + 1, z: cell(i).z + 0.9 });

function objectPlan(): AnyPlan {
  const rows = Math.ceil(NAMES.length / COLS);
  return {
    name: 'Объект владельца',
    wallHeight: 2.6,
    floors: [
      {
        name: '0 Этаж',
        elevation: 0,
        wallHeight: 2.6,
        walls: boxWalls(COLS * RW, rows * RD),
        rooms: NAMES.map((name, i) => {
          const { x, z } = cell(i);
          return {
            name,
            polygon: [[x, z], [x + RW, z], [x + RW, z + RD], [x, z + RD]],
            material: 'wood',
          };
        }),
        furniture: NAMES.map((_, i) => ({
          id: `lamp${i}`,
          model: 'floor_lamp',
          position: [lampAt(i).x, 0, lampAt(i).z],
        })),
        bindings: NAMES.map((_, i) => ({
          entity_id: `light.room_${i}`,
          anchor_object: `lamp${i}`,
          behavior: 'light',
        })),
      },
      {
        name: '1 Этаж',
        elevation: 3,
        wallHeight: 2.6,
        walls: boxWalls(RW, RD),
        rooms: [{ name: 'Мансарда', polygon: [[0, 0], [RW, 0], [RW, RD], [0, RD]], material: 'wood' }],
        furniture: [{ id: 'lampM', model: 'floor_lamp', position: [1, 0, 0.9] }],
        bindings: [{ entity_id: 'light.mansarda', anchor_object: 'lampM', behavior: 'light' }],
      },
    ],
  };
}

// Для проверок КАСАНИЯ — свой, просторный дом: четыре большие комнаты. На
// двенадцати мелких комнатах значки стоят так тесно, что «далеко от домика»
// негде показать, а проверка про полосу плашек, наоборот, требует их много.
const TAP_NAMES = ['Кухня-гостиная', 'Спальня родителей', 'Детская', 'Кабинет'];
const TW = 8;
const TD = 7;
const tCell = (i: number) => ({ x: (i % 2) * TW, z: Math.floor(i / 2) * TD });
const tLamp = (i: number) => ({ x: tCell(i).x + 1.4, z: tCell(i).z + 1.2 });
/** Дальний от «домика» угол пола комнаты. */
const tFar = (i: number) => ({ x: tCell(i).x + TW - 1, z: tCell(i).z + TD - 1 });

function tapPlan(): AnyPlan {
  return {
    name: 'Дом для касаний',
    wallHeight: 2.6,
    floors: [
      {
        name: '0 Этаж',
        elevation: 0,
        wallHeight: 2.6,
        walls: boxWalls(2 * TW, 2 * TD),
        rooms: TAP_NAMES.map((name, i) => {
          const { x, z } = tCell(i);
          return {
            name,
            polygon: [[x, z], [x + TW, z], [x + TW, z + TD], [x, z + TD]],
            material: 'wood',
          };
        }),
        furniture: TAP_NAMES.map((_, i) => ({
          id: `lamp${i}`,
          model: 'floor_lamp',
          position: [tLamp(i).x, 0, tLamp(i).z],
        })),
        bindings: TAP_NAMES.map((_, i) => ({
          entity_id: `light.room_${i}`,
          anchor_object: `lamp${i}`,
          behavior: 'light',
        })),
      },
    ],
  };
}

function tapStates(): Record<string, any> {
  const st: Record<string, any> = {};
  TAP_NAMES.forEach((name, i) => {
    st[`light.room_${i}`] = { state: 'off', attributes: { friendly_name: `${name}, торшер` } };
  });
  return st;
}

function objectStates(): Record<string, any> {
  const st: Record<string, any> = {
    'light.mansarda': { state: 'off', attributes: { friendly_name: 'Мансарда, торшер' } },
  };
  NAMES.forEach((name, i) => {
    st[`light.room_${i}`] = { state: 'off', attributes: { friendly_name: `${name}, торшер` } };
  });
  return st;
}

// --- стенд ------------------------------------------------------------------

async function open(page: Page, plan: AnyPlan, states: Record<string, any>): Promise<void> {
  await page.setViewportSize({ width: 1280, height: 820 });
  await openHarness(page);
  await page.evaluate(() => {
    (document.getElementById('host') as HTMLElement).style.width = '1240px';
  });
  await mountCard(page, { config: { plan }, states, height: '700px' });
  await settleScene(page);
  await armProjector(page);
}

/** Объект владельца: двенадцать комнат и два этажа — для полосы плашек. */
const openObject = (page: Page) => open(page, objectPlan(), objectStates());
/** Просторный дом — для проверок касания. */
const openTapHouse = (page: Page) => open(page, tapPlan(), tapStates());

async function settle(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await window.BMS.card.updateComplete;
    await new Promise((r) => requestAnimationFrame(() => r(null)));
  });
}

interface Pt { x: number; y: number }

/** Экранная точка мирового места. Считаем камерой сцены, а не ищем по
 *  пикселям: текстуры материалов случайные, пиксельный поиск мигал бы. */
async function screenOf(page: Page, wx: number, wy: number, wz: number): Promise<Pt> {
  return page.evaluate(([x, y, z]) => {
    const sm = window.BMS.card.sceneManager;
    const r = sm.renderer.domElement.getBoundingClientRect();
    const v = new (window as any).__THREE_V3(x, y, z);
    v.project(sm.camera);
    return { x: r.left + (v.x * 0.5 + 0.5) * r.width, y: r.top + (0.5 - v.y * 0.5) * r.height };
  }, [wx, wy, wz]);
}

/** Ставим на страницу конструктор вектора three.js — брать его из сцены проще,
 *  чем тянуть three в тест. */
async function armProjector(page: Page): Promise<void> {
  await page.evaluate(() => {
    const sm = window.BMS.card.sceneManager;
    (window as any).__THREE_V3 = sm.camera.position.constructor;
  });
}

/** Что лежит под точкой в теневом корне карточки: холст 3D или что-то из
 *  накладок. Предусловие каждого касания — попасть именно в холст. */
async function under(page: Page, pt: Pt): Promise<string> {
  return page.evaluate(([x, y]) => {
    const el = (window.BMS.root() as ShadowRoot).elementFromPoint(x, y) as HTMLElement | null;
    return el ? `${el.tagName}.${el.getAttribute('class') ?? ''}` : 'НИЧЕГО';
  }, [pt.x, pt.y]);
}

/** До ближайшего «домика» на экране и каков он сам в пикселях. Так проверяется,
 *  что касание пришлось ДАЛЕКО от значка, а не рядом с ним: значок — спрайт
 *  шириной 1,2 м, и его экранный радиус зависит от ракурса. */
async function nearestPin(page: Page, pt: Pt): Promise<{ dist: number; radius: number }> {
  return page.evaluate(([x, y]) => {
    const sm = window.BMS.card.sceneManager;
    const r = sm.renderer.domElement.getBoundingClientRect();
    const V = sm.camera.position.constructor as any;
    let best = { dist: Infinity, radius: 0 };
    sm.scene.traverse((o: any) => {
      if (!o.isSprite || !o.userData?.roomMarker) return;
      const toScreen = (p: any) => {
        const v = p.clone().project(sm.camera);
        return [r.left + (v.x * 0.5 + 0.5) * r.width, r.top + (0.5 - v.y * 0.5) * r.height];
      };
      const [cx, cy] = toScreen(o.position);
      // Спрайт всегда развёрнут к камере: его половина ширины идёт по «вправо»
      // камеры, и её длина на экране — это и есть радиус значка.
      const edge = o.position.clone().add(
        new V().setFromMatrixColumn(sm.camera.matrixWorld, 0).multiplyScalar(o.scale.x / 2),
      );
      const [ex, ey] = toScreen(edge);
      const d = Math.hypot(cx - x, cy - y);
      if (d < best.dist) best = { dist: d, radius: Math.hypot(ex - cx, ey - cy) };
    });
    return best;
  }, [pt.x, pt.y]);
}

/** Мировая точка, куда смотрит луч из экранной точки (или null — луч ушёл в
 *  небо). Нужна, чтобы доказать: касание пришлось ВНЕ плана, а не просто
 *  куда-то. */
async function groundOf(page: Page, pt: Pt): Promise<{ x: number; z: number } | null> {
  return page.evaluate(([x, y]) => {
    const p = window.BMS.card.sceneManager.groundIntersect({ clientX: x, clientY: y });
    return p ? { x: p.x, z: p.z } : null;
  }, [pt.x, pt.y]);
}

/** Первая из комнат, чей дальний угол ВИДЕН на холсте и лежит далеко от всех
 *  «домиков». Полоса плашек закрывает низ карточки — какая именно комната
 *  окажется свободной, зависит от ракурса, и выбирать её вручную значило бы
 *  переписывать проверку при каждом повороте камеры. */
async function freeFloorPoint(page: Page, order: number[]): Promise<{ i: number; pt: Pt }> {
  const seen: string[] = [];
  for (const i of order) {
    const c = tFar(i);
    const pt = await screenOf(page, c.x, 0, c.z);
    const el = await under(page, pt);
    const pin = await nearestPin(page, pt);
    seen.push(`${TAP_NAMES[i]}: ${Math.round(pt.x)},${Math.round(pt.y)} ${el} до значка ${Math.round(pin.dist)} px при радиусе ${Math.round(pin.radius)} px`);
    if (!el.includes('CANVAS')) continue;
    // «Далеко от домика» меряем ЗНАЧКОМ, а не круглым числом: спрайт комнаты
    // около 12 px в радиусе, и три радиуса — это заведомо мимо него.
    if (pin.dist <= Math.max(30, pin.radius * 3)) continue;
    return { i, pt };
  }
  throw new Error(`Ни один пол не годится для касания:\n${seen.join('\n')}`);
}

async function tap(page: Page, pt: Pt): Promise<void> {
  await page.mouse.click(Math.round(pt.x), Math.round(pt.y));
  await settle(page);
}

/** Что открылось: комната справа и/или попап устройства. */
const opened = (page: Page) =>
  page.evaluate(async () => {
    const c = window.BMS.card;
    await c.updateComplete;
    const root = window.BMS.root();
    return {
      roomKey: c.activeRoomKey as string | null,
      roomName: (root.querySelector('.room-panel .rp-name')?.textContent ?? '').trim() || null,
      popup: !!root.querySelector('.control-popup'),
      entities: [...(c.controlEntities ?? [])] as string[],
    };
  });

/** Полоса комнат глазами человека. */
const bar = (page: Page) =>
  page.evaluate(async () => {
    await window.BMS.card.updateComplete;
    const root = window.BMS.root();
    const tab = root.querySelector('[data-act="rooms-bar"]') as HTMLElement | null;
    // Именно плашки комнат: язычок носит тот же класс .pill (вид у них общий),
    // но живёт снаружи .pills.
    const pills = [...root.querySelectorAll('.pills .pill')] as HTMLElement[];
    const box = (el: HTMLElement | null) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top) };
    };
    return {
      tabText: (tab?.textContent ?? '').replace(/\s+/g, ' ').trim(),
      expanded: tab?.getAttribute('aria-expanded') ?? null,
      tabBox: box(tab),
      pills: pills.map((p) => (p.textContent ?? '').trim()),
      // Насколько высоко полоса поднимается над низом карточки — это и есть
      // «сколько экрана она съедает».
      barHeight: (() => {
        const el = root.querySelector('.stage-bottom') as HTMLElement | null;
        return el ? Math.round(el.getBoundingClientRect().height) : 0;
      })(),
      floors: [...root.querySelectorAll('.ftab')].map((f) => (f.textContent ?? '').trim()),
    };
  });

// --- проверки ---------------------------------------------------------------

test.describe('Тап по комнате', () => {
  test('тап по полу комнаты — далеко от «домика» — открывает эту комнату', async ({ page }) => {
    await openTapHouse(page);

    // Целимся в дальний угол комнаты, а не в её центр: там «домика» заведомо
    // нет — freeFloorPoint держит от значка больше трёх его радиусов.
    const first = await freeFloorPoint(page, [0, 1, 2, 3]);
    expect((await opened(page)).roomKey, 'до касания ничего не открыто').toBeNull();

    await tap(page, first.pt);

    const now = await opened(page);
    expect(now.roomName, `открылась комната «${now.roomName}»`).toBe(TAP_NAMES[first.i]);
    expect(now.roomKey, 'и она же отмечена выбранной').toContain(TAP_NAMES[first.i]);
    expect(now.popup, 'попап устройства при этом не всплывает — под пальцем не было устройства').toBe(false);

    // Другая комната открывается СВОИМ полом, а не «той же самой» — иначе
    // проверка зеленела бы на любой комнате.
    const second = await freeFloorPoint(page, [0, 1, 2, 3].filter((i) => i !== first.i));
    await tap(page, second.pt);
    expect((await opened(page)).roomName, 'вторая комната').toBe(TAP_NAMES[second.i]);
  });

  test('КОНТРОЛЬНАЯ: тап по торшеру открывает ЛАМПУ, а не комнату', async ({ page }) => {
    await openTapHouse(page);

    // Нужен торшер, ПОД которым действительно есть пол комнаты: если луч
    // сквозь абажур уходит мимо плана, порядок «устройство → комната»
    // проверять нечем — комната не открылась бы и без всякого порядка.
    // Абажур торшера — на высоте 1,55 м (см. floor_lamp в библиотеке мебели).
    let lamp: { i: number; pt: Pt } | null = null;
    const tried: string[] = [];
    for (const i of [0, 1, 2, 3]) {
      const l = tLamp(i);
      const pt = await screenOf(page, l.x, 1.55, l.z);
      const el = await under(page, pt);
      const g = await groundOf(page, pt);
      const overFloor = !!g && g.x > 0 && g.z > 0 && g.x < 2 * TW && g.z < 2 * TD;
      tried.push(`${TAP_NAMES[i]}: ${el} пол под лучом: ${g ? `${g.x.toFixed(1)}/${g.z.toFixed(1)}` : 'мимо'}`);
      if (!el.includes('CANVAS') || !overFloor) continue;
      lamp = { i, pt };
      break;
    }
    expect(lamp, `нужен торшер над полом комнаты; пробовали:\n${tried.join('\n')}`).not.toBeNull();

    await tap(page, lamp!.pt);

    const now = await opened(page);
    expect(now.popup, 'открылся попап устройства').toBe(true);
    expect(now.entities, `в попапе: ${now.entities.join(', ')}`).toContain(`light.room_${lamp!.i}`);
    expect(now.roomKey, 'комната при этом НЕ открылась: устройство важнее комнаты').toBeNull();
  });

  test('тап мимо плана ничего не открывает, а открытый попап гаснет', async ({ page }) => {
    await openTapHouse(page);

    // Точка ВНЕ плана. Ищем по холсту, а не по мировым координатам: камера
    // подогнана под план, и «шесть метров правее» просто не попадает в кадр.
    const rect = await page.evaluate(() => {
      const r = window.BMS.card.sceneManager.renderer.domElement.getBoundingClientRect();
      return { x: r.left, y: r.top, w: r.width, h: r.height };
    });
    const outside = (g: { x: number; z: number } | null) =>
      !g || g.x < -0.5 || g.z < -0.5 || g.x > 2 * TW + 0.5 || g.z > 2 * TD + 0.5;
    const candidates: Pt[] = [
      { x: rect.x + rect.w / 2, y: rect.y + 24 },
      { x: rect.x + rect.w * 0.4, y: rect.y + 40 },
      { x: rect.x + 24, y: rect.y + rect.h / 2 },
      { x: rect.x + rect.w - 24, y: rect.y + rect.h / 2 },
    ];
    let empty: Pt | null = null;
    const tried: string[] = [];
    for (const pt of candidates) {
      const el = await under(page, pt);
      const g = await groundOf(page, pt);
      tried.push(`${Math.round(pt.x)},${Math.round(pt.y)} ${el} пол: ${g ? `${g.x.toFixed(1)}/${g.z.toFixed(1)}` : 'мимо'}`);
      if (!el.includes('CANVAS') || !outside(g)) continue;
      empty = pt;
      break;
    }
    expect(empty, `нужна видимая точка за пределами плана; пробовали:\n${tried.join('\n')}`).not.toBeNull();
    const pin = await nearestPin(page, empty!);
    expect(pin.dist, 'и она далеко от любого «домика»').toBeGreaterThan(Math.max(30, pin.radius * 3));

    // 1) В пустоте нет ни устройства, ни пола комнаты — не открывается ничего.
    await tap(page, empty!);
    let now = await opened(page);
    expect(now.roomKey, 'никакой комнаты пустота не открывает').toBeNull();
    expect(now.popup, 'и попапа устройства тоже').toBe(false);

    // 2) А открытый попап тем же касанием гаснет — так было и раньше.
    const l = tLamp(1);
    await tap(page, await screenOf(page, l.x, 1.55, l.z));
    expect((await opened(page)).popup, 'предусловие: попап открыт').toBe(true);
    // Только что открытый попап держит 400 мс «противопризрачную» защиту (см.
    // closeControl): на планшете синтетический click прилетает следом за
    // касанием. Ждём её, иначе проверялась бы защита, а не закрытие.
    await page.waitForTimeout(500);
    await tap(page, empty!);
    now = await opened(page);
    expect(now.popup, 'тап мимо всего закрывает окно').toBe(false);
    expect(now.roomKey, 'и комнату при этом не открывает').toBeNull();
  });

  test('в режиме правки тап по полу НЕ открывает карточку комнаты', async ({ page }) => {
    await openTapHouse(page);

    const { i, pt } = await freeFloorPoint(page, [0, 1, 2, 3]);
    const c = tFar(i);
    // Предусловие: ровно этим касанием комната открывается в обычном режиме.
    await tap(page, pt);
    expect((await opened(page)).roomName, 'в просмотре пол комнаты работает').toBe(TAP_NAMES[i]);

    await page.evaluate(async () => {
      const c2 = window.BMS.card;
      c2.activeRoomKey = null;
      c2.doEnterEdit();
      await c2.updateComplete;
    });
    // settleScene тут не годится: в правке сцена рисует кадры непрерывно.
    await page.waitForTimeout(700);
    await settle(page);
    expect(await page.evaluate(() => window.BMS.card.editing), 'мы в правке').toBe(true);

    // Камера в правке своя — точку берём заново.
    const ptEdit = await screenOf(page, c.x, 0, c.z);
    expect(await under(page, ptEdit), 'касание по холсту 3D').toContain('CANVAS');
    await tap(page, ptEdit);

    const now = await opened(page);
    expect(now.roomKey, 'в правке тап по полу принадлежит редактору, а не карточке комнаты').toBeNull();
    expect(now.popup, 'и попап устройства тоже не всплывает').toBe(false);
    expect(await page.evaluate(() => window.BMS.card.editing), 'из правки нас не выкинуло').toBe(true);
  });
});

test.describe('Полоса комнат', () => {
  test('сворачивается, разворачивается и переживает перезагрузку карточки', async ({ page }) => {
    await openObject(page);

    const open0 = await bar(page);
    expect(open0.pills.length, 'все комнаты этажа — плашками').toBe(NAMES.length);
    expect(open0.pills, 'и это именно они').toContain('Кухня-гостиная');
    expect(open0.expanded, 'язычок говорит, что полоса развёрнута').toBe('true');
    expect(open0.tabText, `на язычке: «${open0.tabText}»`).toContain('Комнаты');
    expect(open0.tabText, 'и сколько их').toContain(String(NAMES.length));
    expect(open0.tabBox!.h, 'язычок не мельче 44 px под палец').toBeGreaterThanOrEqual(44);
    expect(open0.floors, 'переключатель этажей на месте').toEqual(['0 Этаж', '1 Этаж']);

    mkdirSync(SHOTS, { recursive: true });
    await page.locator('bms-floorplan-card').screenshot({ path: `${SHOTS}/rooms-bar-open.png` });

    // Сворачиваем — так, как это делает человек: нажатием на язычок.
    await page.evaluate(() => (window.BMS.root().querySelector('[data-act="rooms-bar"]') as HTMLElement).click());
    await settle(page);

    const off = await bar(page);
    expect(off.pills.length, 'плашки убраны, а не просто прикрыты').toBe(0);
    expect(off.expanded, 'язычок говорит, что полоса свёрнута').toBe('false');
    expect(off.tabText, 'но сам остаётся виден и по-прежнему называет комнаты').toContain('Комнаты');
    expect(off.tabText, 'и сколько их там').toContain(String(NAMES.length));
    expect(off.floors, 'переключатель этажей НЕ прячется вместе с комнатами').toEqual(['0 Этаж', '1 Этаж']);
    expect(off.barHeight, `свёрнутая полоса ${off.barHeight} px против ${open0.barHeight} px — 3D получает место`)
      .toBeLessThan(open0.barHeight - 40);

    await page.locator('bms-floorplan-card').screenshot({ path: `${SHOTS}/rooms-bar-collapsed.png` });

    // Перезагрузка карточки: страница открывается заново, карточка монтируется
    // заново — выбор обязан пережить и то и другое.
    await openObject(page);
    const after = await bar(page);
    expect(after.pills.length, 'после перезагрузки полоса всё ещё свёрнута').toBe(0);
    expect(after.expanded, 'и язычок это подтверждает').toBe('false');

    // Разворачиваем обратно — и это тоже запоминается.
    await page.evaluate(() => (window.BMS.root().querySelector('[data-act="rooms-bar"]') as HTMLElement).click());
    await settle(page);
    expect((await bar(page)).pills.length, 'плашки вернулись').toBe(NAMES.length);

    await openObject(page);
    const back = await bar(page);
    expect(back.pills.length, 'и после перезагрузки остались').toBe(NAMES.length);
    expect(back.expanded, 'язычок развёрнут').toBe('true');
  });

  test('свёрнутая полоса освобождает низ 3D: там снова открывается комната', async ({ page }) => {
    await openObject(page);

    // Комната в нижнем ряду плана — как раз под полосой плашек.
    const c = centre(9);
    const pt = await screenOf(page, c.x + 1.6, 0, c.z + 1.6);

    await page.evaluate(() => (window.BMS.root().querySelector('[data-act="rooms-bar"]') as HTMLElement).click());
    await settle(page);
    expect((await bar(page)).pills.length, 'полоса свёрнута').toBe(0);

    expect(await under(page, pt), 'низ карточки снова принадлежит 3D').toContain('CANVAS');
    await tap(page, pt);
    expect((await opened(page)).roomName, 'и по нему открывается комната').toBe(NAMES[9]);
  });
});
