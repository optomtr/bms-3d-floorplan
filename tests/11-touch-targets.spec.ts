// ---------------------------------------------------------------------------
// СТОРОЖ ПАЛЬЦА: ни одна цель, по которой жмут, не бывает мельче 44x44.
//
// Карточка висит на стене, ей управляют пальцем и с двух-трёх метров. Аудит
// оформления насчитал 26 правил с целями меньше 44px — среди них тумблер
// света (.sw 31x54), кнопка удаления зоны (.zbtn 26x28) и переключатель
// «Обзор/Комната» (.vt-btn 29,6). Ещё шесть проходили порог ТОЛЬКО за счёт
// рамки в 1px, а box-sizing в стилях не был задан ни разу.
//
// Проверка ходит по живой странице во всех рабочих состояниях и меряет
// НАСТОЯЩИЕ прямоугольники (getBoundingClientRect), а не то, что написано
// в CSS.
// ---------------------------------------------------------------------------

import { test, expect, type Page } from '@playwright/test';
import { openHarness, mountCard, settleScene, enterEditFast } from './helpers/harness';
import { simplePlan, baseStates } from './helpers/plans';

/** Минимальная цель под палец: WCAG 2.5.5 (AAA) и Apple HIG сходятся на 44. */
const MIN = 44;

/** План с полным набором управляемого: свет, выключатель, замок, климат. */
function richPlan() {
  const p = simplePlan();
  p.floors[0].rooms.push({
    name: 'Кухня',
    polygon: [
      [0, 5],
      [6, 5],
      [6, 8],
      [0, 8],
    ],
    material: 'tile',
  } as any);
  p.floors[0].furniture.push(
    { id: 'lamp2', model: 'floor_lamp', position: [1.4, 0, 6.4] },
    { id: 'tv1', model: 'tv', position: [4.6, 1, 6.4] },
    { id: 'ac1', model: 'tv', position: [0.6, 2, 6.4] },
  );
  p.floors[0].bindings.push(
    { entity_id: 'light.kitchen', anchor_object: 'lamp2', behavior: 'light' },
    { entity_id: 'switch.tv', anchor_object: 'tv1', behavior: 'switch' },
    { entity_id: 'climate.kitchen', anchor_object: 'ac1', behavior: 'climate' },
  );
  // Зона со списком устройств — без неё в редакторе не открылись бы ▲▼✕
  // (.zbtn), а это была САМАЯ мелкая цель продукта: 26x24.
  p.floors[0].zones = [
    {
      id: 'z1',
      name: 'Гостиная',
      x: 3,
      z: 2.5,
      entities: ['light.zal', 'switch.tv', 'lock.front_door'],
    },
  ];
  return p;
}

const richStates = () => ({
  ...baseStates(),
  'light.kitchen': {
    state: 'on',
    attributes: { friendly_name: 'Свет на кухне', supported_color_modes: ['brightness'], brightness: 200 },
  },
  'switch.tv': { state: 'on', attributes: { friendly_name: 'Телевизор' } },
  'climate.kitchen': {
    state: 'cool',
    attributes: {
      friendly_name: 'Кондиционер',
      current_temperature: 24,
      temperature: 22,
      hvac_modes: ['off', 'cool', 'heat', 'auto', 'dry', 'fan_only'],
    },
  },
});

interface Small {
  sel: string;
  w: number;
  h: number;
}

/**
 * Все цели под палец на экране, которые мельче порога.
 *
 * Кого считаем целью:
 *  - button / a / input / select / textarea / label — по тегу;
 *  - любой элемент с вычисленным `cursor: pointer`, У КОТОРОГО РОДИТЕЛЬ НЕ
 *    указывает пальцем. Курсор наследуется, поэтому без этой оговорки в
 *    список попал бы каждый значок и каждый span внутри кнопки.
 * Кого не считаем:
 *  - ненарисованное (нулевой прямоугольник, display:none, visibility:hidden);
 *  - `pointer-events: none` — по такому нельзя попасть в принципе;
 *  - галочку внутри <label>, если сама подпись уже дотягивает до порога:
 *    жмут по строке, а не по квадратику 20x20.
 */
async function tooSmall(page: Page, min = MIN): Promise<Small[]> {
  return page.evaluate((limit) => {
    const root = (window as any).BMS.root() as ShadowRoot;
    const TAGS = new Set(['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA', 'LABEL']);
    const out: { sel: string; w: number; h: number }[] = [];

    const name = (el: Element) => {
      const cls = (el.getAttribute('class') || '').trim().split(/\s+/).filter(Boolean).join('.');
      return `${el.tagName.toLowerCase()}${cls ? '.' + cls : ''}`;
    };

    const isPointer = (el: Element) => getComputedStyle(el).cursor === 'pointer';

    for (const el of Array.from(root.querySelectorAll('*'))) {
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden' || cs.pointerEvents === 'none') continue;

      const parent = el.parentElement;
      let byTag = TAGS.has(el.tagName);
      // <label class="hint">Opacity:</label> — это подпись, а не цель: она
      // ничем не управляет. Считаем подпись целью, только если она несёт в
      // себе поле, ссылается на него через for или сама указывает пальцем.
      if (byTag && el.tagName === 'LABEL') {
        byTag =
          !!el.querySelector('input, select, textarea') || !!el.getAttribute('for') || isPointer(el);
      }
      const byCursor = isPointer(el) && !(parent && isPointer(parent));
      if (!byTag && !byCursor) continue;

      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) continue; // не нарисовано (например <option>)

      // Галочка живёт внутри подписи — целью служит вся строка.
      if (el.tagName === 'INPUT') {
        const type = (el as HTMLInputElement).type;
        if (type === 'checkbox' || type === 'radio') {
          const lab = el.closest('label');
          if (lab) {
            const lr = lab.getBoundingClientRect();
            if (lr.height >= limit && lr.width >= limit) continue;
          }
        }
      }

      if (r.width < limit || r.height < limit) {
        out.push({ sel: name(el), w: Math.round(r.width * 10) / 10, h: Math.round(r.height * 10) / 10 });
      }
    }
    return out;
  }, min);
}

/** Понятный текст падения: что именно и насколько мелкое. */
const report = (state: string, small: Small[]) =>
  `${state}: цели мельче ${MIN}px — ` + small.map((s) => `${s.sel} ${s.w}x${s.h}`).join('; ');

/** Предусловие: на экране вообще есть что мерить. Без него «нарушений нет»
 *  означало бы всего лишь «состояние не открылось». */
async function targetCount(page: Page): Promise<number> {
  return page.evaluate(() => {
    const root = (window as any).BMS.root() as ShadowRoot;
    return Array.from(root.querySelectorAll('button, input, select, textarea, label')).filter((el) => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    }).length;
  });
}

test.describe('Цели под палец', () => {
  test('комната, панель комнаты, обзор и выдвижная карточка', async ({ page }) => {
    await openHarness(page);
    await mountCard(page, { config: { plan: richPlan() }, states: richStates(), height: '820px' });
    await settleScene(page);

    // --- 1. Комната, ни одна не выбрана: часы, статусные точки, таблетки.
    expect(await targetCount(page), 'в режиме «Комната» должны быть кнопки').toBeGreaterThanOrEqual(5);
    let small = await tooSmall(page);
    expect(report('комната', small), report('комната', small)).toBe(report('комната', []));

    // --- 2. Панель комнаты: карточки устройств, тумблеры, ползунки.
    await page.evaluate(async () => {
      const root = (window as any).BMS.root();
      (root.querySelector('.pill') as HTMLElement).click();
      await (window as any).BMS.card.updateComplete;
    });
    await page.waitForFunction(() => !!(window as any).BMS.root().querySelector('.room-panel'));
    await page.evaluate(() => (window as any).BMS.card.updateComplete);
    expect(
      await page.evaluate(() => (window as any).BMS.root().querySelectorAll('.sw').length),
      'в панели комнаты обязан быть тумблер — иначе меряли бы пустоту',
    ).toBeGreaterThan(0);
    small = await tooSmall(page);
    expect(report('панель комнаты', small), report('панель комнаты', small)).toBe(report('панель комнаты', []));

    // --- 3. Обзор: сетка комнат, сегменты света, замки.
    await page.evaluate(async () => {
      const c = (window as any).BMS.card;
      c.viewMode = 'overview';
      await c.updateComplete;
    });
    await page.waitForFunction(() => !!(window as any).BMS.root().querySelector('.ov-grid'));
    expect(
      await page.evaluate(() => (window as any).BMS.root().querySelectorAll('.lightseg').length),
      'в «Обзоре» обязаны быть сегменты света',
    ).toBeGreaterThan(0);
    small = await tooSmall(page);
    expect(report('обзор', small), report('обзор', small)).toBe(report('обзор', []));

    // --- 4. Выдвижная карточка комнаты из «Обзора».
    await page.evaluate(async () => {
      const root = (window as any).BMS.root();
      (root.querySelector('.rcard.link') as HTMLElement).click();
      await (window as any).BMS.card.updateComplete;
    });
    await page.waitForFunction(() => !!(window as any).BMS.root().querySelector('.detail'));
    small = await tooSmall(page);
    expect(report('карточка комнаты', small), report('карточка комнаты', small)).toBe(
      report('карточка комнаты', []),
    );
  });

  test('поп-ап устройства', async ({ page }) => {
    await openHarness(page);
    await mountCard(page, { config: { plan: richPlan() }, states: richStates(), height: '820px' });
    await settleScene(page);

    await page.evaluate(async () => {
      const c = (window as any).BMS.card;
      c.controlEntities = ['light.zal', 'switch.tv', 'climate.kitchen', 'lock.front_door'];
      c.controlOpen = true;
      c.controlOpenedAt = Date.now();
      await c.updateComplete;
    });
    await page.waitForFunction(() => !!(window as any).BMS.root().querySelector('.control-popup'));

    expect(
      await page.evaluate(() => (window as any).BMS.root().querySelectorAll('.control-popup .ctl').length),
      'в поп-апе обязаны быть кнопки управления',
    ).toBeGreaterThan(2);

    const small = await tooSmall(page);
    expect(report('поп-ап устройства', small), report('поп-ап устройства', small)).toBe(
      report('поп-ап устройства', []),
    );
  });

  test('редактор с открытой палитрой', async ({ page }) => {
    await openHarness(page);
    await mountCard(page, { config: { plan: richPlan() }, states: richStates(), height: '820px' });
    await settleScene(page);
    await enterEditFast(page);

    await page.evaluate(async () => {
      const c = (window as any).BMS.card;
      c.editTool = 'furniture';
      c.paletteOpen = true;
      await c.updateComplete;
    });
    await page.waitForFunction(() => !!(window as any).BMS.root().querySelector('.palette'));

    expect(
      await page.evaluate(() => (window as any).BMS.root().querySelectorAll('.palette-cell').length),
      'палитра обязана быть заполнена',
    ).toBeGreaterThan(5);
    expect(
      await page.evaluate(() => (window as any).BMS.root().querySelectorAll('.toolbar .btn').length),
      'тулбар редактора обязан быть на месте',
    ).toBeGreaterThan(5);

    const small = await tooSmall(page);
    expect(report('редактор', small), report('редактор', small)).toBe(report('редактор', []));
  });

  test('редактор — устройства комнаты (порядок и удаление)', async ({ page }) => {
    await openHarness(page);
    await mountCard(page, { config: { plan: richPlan() }, states: richStates(), height: '820px' });
    await settleScene(page);
    await enterEditFast(page);

    await page.evaluate(async () => {
      const c = (window as any).BMS.card;
      c.editTool = 'select';
      c.editSelectedZoneId = c.editZones[0]?.id ?? null;
      await c.updateComplete;
    });
    await page.waitForFunction(() => !!(window as any).BMS.root().querySelector('.zone-order'));

    expect(
      await page.evaluate(() => (window as any).BMS.root().querySelectorAll('.zbtn').length),
      'кнопки ▲▼✕ обязаны быть на экране — иначе меряли бы пустоту',
    ).toBeGreaterThanOrEqual(3);
    expect(
      await page.evaluate(() => (window as any).BMS.root().querySelectorAll('.zone-dev').length),
      'список «добавить устройство» обязан быть на экране',
    ).toBeGreaterThan(0);

    const small = await tooSmall(page);
    expect(report('устройства комнаты', small), report('устройства комнаты', small)).toBe(
      report('устройства комнаты', []),
    );
  });
});
