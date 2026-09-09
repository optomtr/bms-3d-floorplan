// ---------------------------------------------------------------------------
// ЗАМЕР: виден ли кружок климата на ОБЩЕМ ВИДЕ ЭТАЖА.
//
// Слово владельца: «чтобы рядом с домиком показывало, что кондер работает».
// Смотрят на это не из комнаты, а с общего вида — этаж целиком на планшете.
// Здесь берётся объект владельца в натуральную величину (40 × 25 м, 18 комнат,
// в каждой кондиционер + тёплый пол + конвектор), камера ставится в «вписать
// этаж» — и меряется РЕАЛЬНЫЙ размер спрайта на экране, в пикселях холста.
//
// Замер, а не «кружок существует»: кружок существовал и раньше — 4,6 px, то
// есть пылинка, по которой снежинку от радиатора не отличить.
// ---------------------------------------------------------------------------

import { expect, test, type Page } from '@playwright/test';
import { mountCard, openHarness, settleScene } from './helpers/harness';

/** Порог различимости на общем виде этажа, в пикселях холста. */
const MIN_BADGE_PX = 9;

const COLS = 6;
const ROWS = 3;
const W = 40;
const D = 25;

/** Этаж объекта владельца: 40 × 25 м, 6 × 3 = 18 комнат. */
function bigFloorPlan(withVent = false) {
  const cw = W / COLS;
  const cd = D / ROWS;
  const walls: any[] = [
    { start: [0, 0], end: [W, 0] },
    { start: [W, 0], end: [W, D] },
    { start: [W, D], end: [0, D] },
    { start: [0, D], end: [0, 0] },
  ];
  for (let i = 1; i < COLS; i++) walls.push({ start: [i * cw, 0], end: [i * cw, D] });
  for (let j = 1; j < ROWS; j++) walls.push({ start: [0, j * cd], end: [W, j * cd] });

  const rooms: any[] = [];
  const zones: any[] = [];
  for (let j = 0; j < ROWS; j++) {
    for (let i = 0; i < COLS; i++) {
      const n = j * COLS + i;
      const x0 = i * cw;
      const z0 = j * cd;
      rooms.push({
        name: `К${n}`,
        polygon: [[x0, z0], [x0 + cw, z0], [x0 + cw, z0 + cd], [x0, z0 + cd]],
        material: 'wood',
      });
      const entities = [`climate.ac_${n}`, `climate.pol_${n}`, `climate.konv_${n}`];
      if (withVent) entities.push(`fan.ventiliatsiia_${n}`);
      zones.push({ id: `z${n}`, name: `Комната ${n}`, x: x0 + cw / 2, z: z0 + cd / 2, entities });
    }
  }
  return {
    name: 'Объект владельца',
    wallHeight: 2.7,
    floors: [{ name: '1 Этаж', elevation: 0, wallHeight: 2.7, walls, rooms, zones, furniture: [], bindings: [] }],
  };
}

/** Живой этаж: часть техники работает, часть простаивает, часть выключена. */
function bigFloorStates(withVent = false): Record<string, any> {
  const out: Record<string, any> = {};
  for (let n = 0; n < COLS * ROWS; n++) {
    out[`climate.ac_${n}`] = {
      state: n % 3 === 2 ? 'off' : 'cool',
      attributes: {
        friendly_name: `Кондиционер ${n}`,
        hvac_modes: ['off', 'cool', 'heat'],
        hvac_action: n % 3 === 0 ? 'cooling' : 'idle',
      },
    };
    out[`climate.pol_${n}`] = {
      state: n % 4 === 3 ? 'off' : 'heat',
      attributes: {
        friendly_name: `Тёплый пол ${n}`,
        hvac_modes: ['off', 'heat'],
        hvac_action: n % 2 === 0 ? 'heating' : 'idle',
      },
    };
    out[`climate.konv_${n}`] = {
      state: n % 5 === 4 ? 'off' : 'heat',
      attributes: {
        friendly_name: `Конвектор ${n}`,
        hvac_modes: ['off', 'heat'],
        hvac_action: n % 3 === 1 ? 'heating' : 'idle',
      },
    };
    if (withVent) {
      out[`fan.ventiliatsiia_${n}`] = {
        state: n % 2 === 0 ? 'on' : 'off',
        attributes: { friendly_name: `Вентиляция ${n}` },
      };
    }
  }
  return out;
}

interface SizeReport {
  canvas: { w: number; h: number };
  badgeCount: number;
  houseCount: number;
  /** Наименьший и наибольший на экране кружок и «домик», в пикселях холста. */
  badgeMinPx: number;
  badgeMaxPx: number;
  houseMinPx: number;
  houseMaxPx: number;
  /** Просвет между кружками РАЗНЫХ комнат: <= 0 — они наехали друг на друга. */
  crossRoomGapPx: number;
  /** Шаг соседних комнат по экрану — во что должен уместиться ряд. */
  roomStepPx: number;
  /** Сколько «домиков» попало в кадр: этаж должен быть виден ЦЕЛИКОМ. */
  roomsOnScreen: number;
  camDistM: number;
}

/**
 * Размер спрайта на экране. Спрайт three.js — квадрат, развёрнутый к камере;
 * его высота в мире равна scale.y, а на экране — scale.y * H / (2·z·tg(fov/2)),
 * где z — глубина точки вдоль оси взгляда. Считаем ровно это, по живым камере
 * и холсту, а не по формуле из исходника (иначе замер повторил бы ошибку).
 *
 * Заодно считается экранный прямоугольник КАЖДОГО кружка — с учётом сдвига
 * ряда через Sprite.center (в шейдере квадрат смещён на (0.5 - center) * scale).
 * По этим прямоугольникам и видно, каша на экране или нет.
 */
async function measure(page: Page): Promise<SizeReport> {
  return page.evaluate(() => {
    const sm = (window.BMS.card as any).sceneManager;
    const cam = sm.camera;
    const el = sm.renderer.domElement as HTMLCanvasElement;
    const r = el.getBoundingClientRect();
    const e = cam.matrixWorld.elements;
    // Ось взгляда камеры в мире (третий столбец матрицы смотрит НАЗАД).
    const fwd = [-e[8], -e[9], -e[10]];
    const cp = cam.position;
    const k = r.height / (2 * Math.tan((cam.fov * Math.PI) / 360));

    const pxOf = (sp: any): number => {
      const dz =
        (sp.position.x - cp.x) * fwd[0] + (sp.position.y - cp.y) * fwd[1] + (sp.position.z - cp.z) * fwd[2];
      return (sp.scale.y * k) / dz;
    };
    /** Экранный квадрат спрайта: [центр X, центр Y, сторона]. */
    const rectOf = (sp: any): [number, number, number] => {
      const v = sp.position.clone().project(cam);
      const px = pxOf(sp);
      return [
        ((v.x + 1) / 2) * r.width + (0.5 - sp.center.x) * px,
        ((1 - v.y) / 2) * r.height + (sp.center.y - 0.5) * px,
        px,
      ];
    };

    const badges = sm.climateBadgeGroup.children;
    const houses = sm.markerGroup.children.filter((c: any) => c.userData.roomMarker);
    const bpx = badges.map(pxOf);
    const hpx = houses.map(pxOf);

    // Просвет между кружками из РАЗНЫХ комнат. Отрицательный — наехали.
    const rects = badges.map((sp: any) => ({ key: sp.userData.roomKey, r: rectOf(sp) }));
    let gap = Infinity;
    for (let i = 0; i < rects.length; i++) {
      for (let j = i + 1; j < rects.length; j++) {
        if (rects[i].key === rects[j].key) continue;
        const [ax, ay, as] = rects[i].r;
        const [bx, by, bs] = rects[j].r;
        const half = (as + bs) / 2;
        // Расстояние между квадратами: отрицательное только при пересечении
        // по ОБЕИМ осям сразу.
        gap = Math.min(gap, Math.max(Math.abs(ax - bx) - half, Math.abs(ay - by) - half));
      }
    }

    // Шаг соседних комнат по экрану: ближайшая пара «домиков».
    let step = Infinity;
    const hr = houses.map(rectOf);
    for (let i = 0; i < hr.length; i++) {
      for (let j = i + 1; j < hr.length; j++) {
        step = Math.min(step, Math.hypot(hr[i][0] - hr[j][0], hr[i][1] - hr[j][1]));
      }
    }

    const onScreen = hr.filter(([x, y]) => x >= 0 && x <= r.width && y >= 0 && y <= r.height).length;

    const round = (v: number) => Math.round(v * 10) / 10;
    const dist = (sp: any) => Math.hypot(sp.position.x - cp.x, sp.position.y - cp.y, sp.position.z - cp.z);
    return {
      canvas: { w: Math.round(r.width), h: Math.round(r.height) },
      badgeCount: badges.length,
      houseCount: houses.length,
      badgeMinPx: round(Math.min(...bpx)),
      badgeMaxPx: round(Math.max(...bpx)),
      houseMinPx: round(Math.min(...hpx)),
      houseMaxPx: round(Math.max(...hpx)),
      crossRoomGapPx: round(gap),
      roomStepPx: round(step),
      roomsOnScreen: onScreen,
      camDistM: round(Math.max(...houses.map(dist))),
    };
  });
}

async function mountBig(page: Page, withVent = false): Promise<void> {
  await openHarness(page);
  await mountCard(page, {
    config: { plan: bigFloorPlan(withVent) },
    states: bigFloorStates(withVent),
    height: '640px',
  });
  await settleScene(page);
}

test.describe('Кружки климата видны на общем виде этажа', () => {
  test('этаж 40 × 25 м, 18 комнат целиком — кружок не мельче порога', async ({ page }) => {
    await mountBig(page);
    const m = await measure(page);
    console.log('ЗАМЕР:', JSON.stringify(m));

    // Сначала — что мерили именно общий вид, а не одну комнату вблизи.
    expect(m.houseCount, 'на этаже обязаны быть все 18 комнат').toBe(18);
    expect(m.badgeCount, 'по три кружка на комнату').toBe(54);
    expect(m.canvas.h, 'холст того же размера, на котором мерил владелец').toBeGreaterThan(600);
    expect(m.roomsOnScreen, 'камера обязана показывать этаж ЦЕЛИКОМ, а не одну комнату').toBe(18);

    expect(
      m.badgeMinPx,
      `кружок климата на общем виде этажа: ${m.badgeMinPx} px — меньше ${MIN_BADGE_PX} px не читается`,
    ).toBeGreaterThanOrEqual(MIN_BADGE_PX);
  });

  test('72 кружка не сливаются в кашу: ряды соседних комнат не наезжают', async ({ page }) => {
    await mountBig(page, true);
    const m = await measure(page);
    console.log('ЗАМЕР (с вентиляцией):', JSON.stringify(m));
    expect(m.badgeCount, 'худший случай: четыре кружка на каждую из 18 комнат').toBe(72);
    expect(m.crossRoomGapPx, 'кружки соседних комнат не имеют права наезжать друг на друга').toBeGreaterThan(0);
  });
});
