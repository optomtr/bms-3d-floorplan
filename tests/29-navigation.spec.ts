// ---------------------------------------------------------------------------
// НАВИГАЦИЯ ПАЛЬЦАМИ по большому плану.
//
// Жалоба владельца с живого объекта: «навигация по 3D очень плохо работает на
// планшете, как будто он только на центр привязан, и при большой 3D он не
// работает хорошо». Этаж у него 40 x 25 м.
//
// Причина была не одна:
//   * одним пальцем можно было ТОЛЬКО вращать — сдвинуть вид человеку было
//     нечем, и любое движение швыряло камеру по дуге вокруг далёкой точки;
//   * два пальца одновременно и щипали, и двигали, а сам сдвиг считался по
//     экранной плоскости камеры: наклонный план под пальцем «уплывал»;
//   * ближе, чем на maxDim * 0,1 (для 40 м это ЧЕТЫРЕ метра), подойти было
//     нельзя.
//
// Стало: один палец ведёт план (точка под пальцем остаётся под пальцем), два —
// щипок с поворотом и наклоном, ось вращения переезжает туда, куда смотрят.
//
// Здесь всё измеряется В ПИКСЕЛЯХ И МЕТРАХ, а не «функция вызвалась». Каждая
// проверка ломалась в бандле и краснела — чем именно, см. tests/tools/prove.mjs
// (случаи 29-navigation).
// ---------------------------------------------------------------------------

import { expect, test, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { enterEditFast, mountCard, openHarness, settleScene } from './helpers/harness';
import { boxWalls, type AnyPlan } from './helpers/plans';
import {
  bringToCentre, cam, canvasPoint, flat, groundOf, px, rect, screenOf, settle, touchOf, under,
  type Pt, type Touch,
} from './helpers/touch';

const SHOTS = 'test-results/shots-navigation';

// --- этаж владельца: 40 x 25 м ---------------------------------------------

const FW = 40;
const FD = 25;
const COLS = 3;
const ROWS = 2;
const RW = FW / COLS;
const RD = FD / ROWS;
const NAMES = ['Прихожая', 'Кухня-гостиная', 'Кабинет 1', 'Спальня родителей', 'Детская', 'Дальний кабинет'];
/** Дальняя от входа комната — та, до которой владелец и не мог доехать. */
const FAR = 5;

const cell = (i: number) => ({ x: (i % COLS) * RW, z: Math.floor(i / COLS) * RD });
const centre = (i: number) => ({ x: cell(i).x + RW / 2, z: cell(i).z + RD / 2 });
const lampAt = (i: number) => ({ x: cell(i).x + 1.6, z: cell(i).z + 1.4 });
/** Четыре угла этажа — их и надо уметь довести до середины экрана. */
const CORNERS = [
  { name: 'ближний левый', x: 0.4, z: 0.4 },
  { name: 'ближний правый', x: FW - 0.4, z: 0.4 },
  { name: 'дальний правый', x: FW - 0.4, z: FD - 0.4 },
  { name: 'дальний левый', x: 0.4, z: FD - 0.4 },
];

function bigPlan(): AnyPlan {
  return {
    name: 'Этаж 40 x 25',
    wallHeight: 2.6,
    floors: [
      {
        name: '0 Этаж',
        elevation: 0,
        wallHeight: 2.6,
        walls: boxWalls(FW, FD),
        rooms: NAMES.map((name, i) => {
          const { x, z } = cell(i);
          return { name, polygon: [[x, z], [x + RW, z], [x + RW, z + RD], [x, z + RD]], material: 'wood' };
        }),
        furniture: NAMES.map((_, i) => ({ id: `lamp${i}`, model: 'floor_lamp', position: [lampAt(i).x, 0, lampAt(i).z] })),
        bindings: NAMES.map((_, i) => ({ entity_id: `light.room_${i}`, anchor_object: `lamp${i}`, behavior: 'light' })),
      },
    ],
  };
}

const states = (): Record<string, any> =>
  Object.fromEntries(NAMES.map((n, i) => [`light.room_${i}`, { state: 'off', attributes: { friendly_name: `${n}, торшер` } }]));

// --- планшет ----------------------------------------------------------------

interface Tablet { name: string; w: number; h: number; card: string }
const TABLETS: Tablet[] = [
  { name: 'планшет стоя 768 x 1024', w: 768, h: 1024, card: '860px' },
  { name: 'планшет лёжа 1280 x 800', w: 1280, h: 800, card: '660px' },
];

async function open(page: Page, dev: Tablet): Promise<void> {
  await page.setViewportSize({ width: dev.w, height: dev.h });
  await openHarness(page);
  await page.evaluate((w) => {
    (document.getElementById('host') as HTMLElement).style.width = `${w}px`;
  }, dev.w);
  await mountCard(page, { config: { plan: bigPlan() }, states: states(), height: dev.card });
  await settleScene(page);
  await page.evaluate(() => {
    const sm = window.BMS.card.sceneManager;
    (window as any).__V3 = sm.camera.position.constructor;
    // Полоса комнат съедает низ холста; жесты должны начинаться по 3D.
    const tab = window.BMS.root().querySelector('[data-act="rooms-bar"]') as HTMLElement | null;
    if (tab?.getAttribute('aria-expanded') === 'true') tab.click();
  });
  await page.evaluate(() => window.BMS.card.updateComplete);
}

// --- проверки ---------------------------------------------------------------

for (const dev of TABLETS) {
  test.describe(`Навигация: ${dev.name}`, () => {
    test('одним пальцем каждый угол этажа доезжает до середины экрана', async ({ page }) => {
      await open(page, dev);
      const t = await touchOf(page);
      mkdirSync(SHOTS, { recursive: true });
      await page.locator('bms-floorplan-card').screenshot({ path: `${SHOTS}/${dev.w}x${dev.h}-до.png` });

      const report: string[] = [];
      for (const c of CORNERS) {
        // Каждый угол — от исходного вида, иначе проверялась бы цепочка жестов.
        await page.evaluate(() => window.BMS.card.sceneManager.resetView());
        await settle(page);
        const before = await cam(page);
        const { pulls, off } = await bringToCentre(page, t, c);
        const now = await cam(page);
        // Замер честный: смотрим, ЧТО оказалось в середине холста — мировую
        // точку под серединой, а не «функция вызвалась».
        const r = await rect(page);
        const mid = await groundOf(page, { x: r.cx, y: r.cy });
        report.push(
          `${c.name}: ${pulls} протяжек, промах ${off.toFixed(1)} px, ` +
            `в середине пол ${mid ? `${mid.x.toFixed(1)}/${mid.z.toFixed(1)}` : 'мимо'}`,
        );
        expect(off, `${c.name}: угол доехал до середины (осталось ${off.toFixed(1)} px)`).toBeLessThan(12);
        expect(mid, `${c.name}: под серединой холста — пол`).not.toBeNull();
        expect(flat(mid!, c), `${c.name}: в середине именно этот угол`).toBeLessThan(1.5);
        expect(flat(now.target, before.target), `${c.name}: вид действительно уехал, а не покрутился на месте`)
          .toBeGreaterThan(4);
      }
      await page.locator('bms-floorplan-card').screenshot({ path: `${SHOTS}/${dev.w}x${dev.h}-после.png` });
      test.info().annotations.push({ type: 'замер', description: report.join('; ') });
    });

    test('точка под пальцем остаётся под пальцем', async ({ page }) => {
      await open(page, dev);
      const t = await touchOf(page);
      const r = await rect(page);

      // Четыре протяжки в разные стороны и с разной глубины кадра: у верхней
      // трети холста пол в полусотне метров от камеры, у нижней — в полутора
      // десятках. «Одна цифра на весь экран» (так считает pan у OrbitControls)
      // обязана разъехаться хотя бы на одной из них.
      const runs = [
        { from: { x: r.cx - r.w * 0.12, y: r.cy - r.h * 0.08 }, to: { x: r.cx + r.w * 0.14, y: r.cy + r.h * 0.06 } },
        { from: { x: r.cx + r.w * 0.14, y: r.cy + r.h * 0.1 }, to: { x: r.cx - r.w * 0.12, y: r.cy - r.h * 0.09 } },
        { from: { x: r.cx, y: r.cy + r.h * 0.14 }, to: { x: r.cx + r.w * 0.04, y: r.cy - r.h * 0.16 } },
        { from: { x: r.cx - r.w * 0.05, y: r.cy - r.h * 0.18 }, to: { x: r.cx + r.w * 0.02, y: r.cy + r.h * 0.2 } },
      ];
      const seen: string[] = [];
      for (const run of runs) {
        // Каждая протяжка — от исходного вида: иначе четыре подряд упёрлись бы
        // в рамку clampTarget, и мерился бы упор, а не слежение за пальцем.
        await page.evaluate(() => window.BMS.card.sceneManager.resetView());
        await settle(page);
        expect(await under(page, run.from), 'жест начинается по холсту 3D').toContain('CANVAS');
        const grabbed = await groundOf(page, run.from);
        expect(grabbed, 'палец лёг на пол, а не в небо').not.toBeNull();
        const before = await cam(page);
        await t.drag(run.from, run.to);
        await settle(page);
        const after = await cam(page);
        // Куда уехала СХВАЧЕННАЯ точка на экране.
        const now = await screenOf(page, grabbed!.x, 0, grabbed!.z);
        const drift = px(now, run.to);
        seen.push(`${Math.round(run.from.x)},${Math.round(run.from.y)} → ${Math.round(run.to.x)},${Math.round(run.to.y)}: увод ${drift.toFixed(2)} px`);
        expect(flat(after.target, before.target), 'предусловие: вид и правда поехал').toBeGreaterThan(5);
        // Допуск 3 px. Обоснование: сама математика точная (перенос камеры не
        // меняет направление луча через ту же точку экрана), и остаётся только
        // округление касания до целого пикселя в CDP — до 0,7 px. Замер даёт
        // 0,3–0,8 px. А человеку и мерить нечем: палец касается экрана пятном
        // около 40 px, 3 px — меньше десятой его доли.
        expect(drift, `увод под пальцем: ${drift.toFixed(2)} px`).toBeLessThan(3);
      }
      test.info().annotations.push({ type: 'замер', description: seen.join('; ') });
    });

    test('после приближения два пальца крутят вокруг видимой комнаты, а не вокруг центра здания', async ({ page }) => {
      await open(page, dev);
      const t = await touchOf(page);
      const room = centre(FAR);
      const house = { x: FW / 2, z: FD / 2 };

      // 1. Довели дальнюю комнату до середины экрана и приблизились к ней.
      const pulled = await bringToCentre(page, t, room);
      expect(pulled.off, 'предусловие: комната в середине холста').toBeLessThan(12);
      let r = await rect(page);
      for (let i = 0; i < 3; i++) {
        await t.pinch({ x: r.cx, y: r.cy }, 90, 300);
        await settle(page);
      }
      const near = await cam(page);
      expect(near.radius, `предусловие: подъехали (радиус ${near.radius.toFixed(1)} м)`).toBeLessThan(20);
      expect(flat(near.target, room), 'предусловие: смотрим на дальнюю комнату').toBeLessThan(4);

      // 2. Поворот двумя пальцами. Расстояние между пальцами постоянно —
      //    значит это ЧИСТЫЙ поворот, без щипка.
      r = await rect(page);
      const mid = { x: r.cx, y: r.cy };
      // Точка пола, на которую человек СМОТРИТ, — под серединой экрана.
      const looked = await groundOf(page, mid);
      expect(looked, 'предусловие: под серединой экрана пол').not.toBeNull();
      expect(flat(looked!, room), 'и это пол дальней комнаты').toBeLessThan(7);
      await t.twist(mid, Math.round(r.h * 0.18));
      await settle(page);
      const after = await cam(page);

      const turned = Math.abs(after.azimuth - near.azimuth) * (180 / Math.PI);
      expect(turned, `поворот и правда состоялся: ${turned.toFixed(0)}°`).toBeGreaterThan(20);
      // Ось вращения — в этой комнате, а не в середине здания.
      const toRoom = flat(after.target, room);
      const toHouse = flat(after.target, house);
      expect(toRoom, `ось вращения в комнате (${toRoom.toFixed(1)} м от её центра)`).toBeLessThan(5);
      expect(toHouse, `и уж точно не в центре здания (${toHouse.toFixed(1)} м)`).toBeGreaterThan(8);
      // И глазами: то, на что смотрели, осталось на месте. Вокруг центра
      // здания эта точка улетела бы за край холста.
      const kept = await screenOf(page, looked!.x, 0, looked!.z);
      const slip = px(kept, mid);
      expect(slip, `точка под взглядом осталась в середине: ушла на ${slip.toFixed(0)} px`).toBeLessThan(50);
      // Комната не потерялась: её центр всё ещё на холсте.
      const roomAfter = await screenOf(page, room.x, 0, room.z);
      expect(roomAfter.x, 'комната осталась в кадре по горизонтали').toBeGreaterThan(r.x - 20);
      expect(roomAfter.x).toBeLessThan(r.x + r.w + 20);
      expect(roomAfter.y, 'и по вертикали').toBeGreaterThan(r.y - 20);
      expect(roomAfter.y).toBeLessThan(r.y + r.h + 20);
      test.info().annotations.push({
        type: 'замер',
        description: `поворот ${turned.toFixed(0)}°, точка под взглядом ушла на ${slip.toFixed(0)} px, ось в ${toRoom.toFixed(1)} м от центра комнаты и в ${toHouse.toFixed(1)} м от центра здания`,
      });
    });

    test('щипком можно подойти к комнате вплотную', async ({ page }) => {
      await open(page, dev);
      const t = await touchOf(page);
      const room = centre(FAR);
      const start = await cam(page);
      expect(start.radius, 'предусловие: сперва виден весь этаж').toBeGreaterThan(30);

      await bringToCentre(page, t, room);
      let r = await rect(page);
      const track: number[] = [];
      for (let i = 0; i < 8; i++) {
        await t.pinch({ x: r.cx, y: r.cy }, 80, 320);
        await settle(page);
        track.push((await cam(page)).radius);
        r = await rect(page);
      }
      const end = await cam(page);
      // Порог 1,5 м: предел приближения выставлен в 1,2 м (MIN_DISTANCE в
      // camera-rig.ts) — это «стоя посреди комнаты». Раньше на этаже 40 м
      // предел считался как maxDim * 0,1, то есть ЧЕТЫРЕ метра.
      expect(end.radius, `подошли на ${end.radius.toFixed(2)} м (путь: ${track.map((v) => v.toFixed(1)).join(' → ')})`)
        .toBeLessThan(1.5);
      expect(flat(end.target, room), 'и подошли именно к этой комнате').toBeLessThan(4);
      // Комната обязана остаться видимой: вплотную — не значит «внутри стены».
      const seen = await screenOf(page, room.x, 0, room.z);
      expect(seen.x, 'её центр по-прежнему на холсте').toBeGreaterThan(r.x - 10);
      expect(seen.x).toBeLessThan(r.x + r.w + 10);

      // А теперь наклон до упора при полном приближении — самое опасное
      // сочетание: раньше предел был 4 м, теперь 1,2, и камера могла лечь на
      // пол и уехать ПОД перекрытие (чёрный экран на настенном планшете).
      // Пальцы ВВЕРХ — камера ложится к горизонту (вниз она, наоборот, встаёт
      // над планом сверху).
      await t.tilt({ x: r.cx, y: r.cy }, -Math.round(r.h * 0.42));
      await settle(page);
      for (let i = 0; i < 3; i++) {
        await t.pinch({ x: r.cx, y: r.cy }, 80, 320);
        await settle(page);
      }
      const low = await cam(page);
      expect(low.polar * (180 / Math.PI), `наклон ушёл к горизонту: ${(low.polar * 180 / Math.PI).toFixed(0)}°`)
        .toBeGreaterThan(80);
      expect(low.pos.y, `камера держится над полом: ${low.pos.y.toFixed(2)} м`).toBeGreaterThan(0.3);
      test.info().annotations.push({
        type: 'замер',
        description: `радиус ${track.map((v) => v.toFixed(2)).join(' → ')} м; при наклоне ${(low.polar * 180 / Math.PI).toFixed(0)}° камера на высоте ${low.pos.y.toFixed(2)} м`,
      });
    });

    test('КОНТРОЛЬНАЯ: одиночный тап по-прежнему открывает комнату и устройство', async ({ page }) => {
      await open(page, dev);
      const t = await touchOf(page);

      // 1. Тап по полу дальней комнаты — открывается комната.
      const room = centre(FAR);
      await bringToCentre(page, t, room);
      const r = await rect(page);
      const floorPt = { x: r.cx, y: r.cy };
      expect(await under(page, floorPt), 'тап приходится по холсту 3D').toContain('CANVAS');
      await t.drag(floorPt, floorPt, 1); // касание с дрожью в 0 px — настоящий тап
      await page.evaluate(() => window.BMS.card.updateComplete);
      const opened = await page.evaluate(() => ({
        room: (window.BMS.root().querySelector('.room-panel .rp-name')?.textContent ?? '').trim() || null,
        key: window.BMS.card.activeRoomKey as string | null,
      }));
      expect(opened.room, `открылась комната «${opened.room}»`).toBe(NAMES[FAR]);

      // 2. Тап по торшеру — открывается устройство, а не комната.
      await page.evaluate(async () => {
        window.BMS.card.activeRoomKey = null;
        await window.BMS.card.updateComplete;
      });
      const l = lampAt(FAR);
      const lampPt = await screenOf(page, l.x, 1.55, l.z);
      expect(await under(page, lampPt), 'торшер виден на холсте').toContain('CANVAS');
      await t.drag(lampPt, lampPt, 1);
      await page.evaluate(() => window.BMS.card.updateComplete);
      const dev2 = await page.evaluate(() => ({
        popup: !!window.BMS.root().querySelector('.control-popup'),
        entities: [...(window.BMS.card.controlEntities ?? [])] as string[],
      }));
      expect(dev2.popup, 'попап устройства всплыл').toBe(true);
      expect(dev2.entities, `в попапе: ${dev2.entities.join(', ')}`).toContain(`light.room_${FAR}`);
    });

    test('КОНТРОЛЬНАЯ: в правке один палец рисует стену, а не двигает вид', async ({ page }) => {
      await open(page, dev);
      const t = await touchOf(page);
      await enterEditFast(page);
      await page.waitForTimeout(700);
      await settle(page);
      expect(await page.evaluate(() => window.BMS.card.editing), 'мы в правке').toBe(true);
      expect(await page.evaluate(() => window.BMS.card.editor?.tool), 'инструмент — стена').toBe('wall');

      // 1. Протяжка одним пальцем НЕ ведёт план: точка вращения обязана остаться
      //    на месте (её двигает только перенос вида, поворот её не трогает).
      const r = await rect(page);
      const from = await canvasPoint(page, { x: r.cx - r.w * 0.14, y: r.cy - r.h * 0.08 });
      const to = { x: from.x + r.w * 0.22, y: from.y + r.h * 0.12 };
      const before = await cam(page);
      await t.drag(from, to);
      await settle(page);
      const after = await cam(page);
      // Перенос вида двигает точку вращения, поворот — нет. Значит стоящая
      // на месте цель и означает «палец НЕ повёл план».
      const moved = flat(after.target, before.target);
      expect(moved, `вид в правке пальцем не уезжает (ушёл на ${moved.toFixed(2)} м)`).toBeLessThan(0.5);

      // 2. А ТАП ставит точку стены — ровно там, куда попал палец.
      const walls0 = await page.evaluate(() => window.BMS.card.editor.walls().length);
      expect(await page.evaluate(() => window.BMS.card.editor.pointCount), 'предусловие: цепочка пуста').toBe(0);
      const a = await canvasPoint(page, { x: r.cx, y: r.cy });
      const want = await groundOf(page, a);
      expect(want, 'тап приходится по полу').not.toBeNull();
      await t.drag(a, a, 1);
      await settle(page);
      expect(await page.evaluate(() => window.BMS.card.editor.pointCount), 'один палец поставил точку стены').toBe(1);

      // Второй тап — второй угол, третий (в ту же точку) завершает отрезок.
      const b = await canvasPoint(page, { x: a.x + Math.min(150, r.w * 0.18), y: a.y - Math.min(60, r.h * 0.07) });
      await t.drag(b, b, 1);
      await settle(page);
      expect(await page.evaluate(() => window.BMS.card.editor.pointCount), 'и второй угол').toBe(2);
      // Переключение инструмента завершает начатую цепочку — так стена и
      // ложится в план. Значит нарисовано пальцем всё, от точки до стены.
      await page.evaluate(() => window.BMS.card.editor.setTool('select'));
      await settle(page);
      const walls1 = await page.evaluate(() => window.BMS.card.editor.walls().length);
      expect(walls1, `стена дочерчена пальцем: было ${walls0}, стало ${walls1}`).toBe(walls0 + 1);
      // И встала она туда, куда тыкали, а не «куда-нибудь».
      const put = await page.evaluate(() => {
        const w = window.BMS.card.editor.walls().at(-1);
        return { x: w.start[0], z: w.start[1] };
      });
      expect(flat(put, want!), `точка стены легла под палец (${flat(put, want!).toFixed(2)} м)`).toBeLessThan(0.6);
    });
  });
}
