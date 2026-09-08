// ---------------------------------------------------------------------------
// СТОРОЖ СПИСКА УСТРОЙСТВ в новом конструкторе.
//
// Стенд повторяет ЖИВОЙ дом владельца: реле, у которых каналы называются
// «Канал 1», «Канал 2», «Канал 3», и в трёх разных комнатах эти имена
// совпадают буква в букву. Плюс щит без комнаты и одна лампа, уже привязанная
// к другому предмету на плане.
//
// Стерегутся пять вещей:
//   • устройства разложены ПО КОМНАТАМ, и раздел сворачивается;
//   • три одинаковых «Канал 1» из разных комнат РАЗЛИЧИМЫ — видно устройство;
//   • уже привязанное помечено «занято» и не спрятано;
//   • поиск фильтрует ВНУТРИ разделов и не схлопывает их в плоский список;
//   • цели под палец не мельче 48 px;
//   • и шестое: сначала подходящие домены, остальное — за кнопкой.
//
// Каждая проверка ломалась в исходнике и краснела — чем именно, написано
// в отчёте.
// ---------------------------------------------------------------------------

import { expect, test, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { mountCard, openHarness, settleScene } from './helpers/harness';
import { boxWalls, room } from './helpers/plans';

const SHOTS = 'test-results/shots-picker';

// --- дом владельца ----------------------------------------------------------

/** Реестр Home Assistant: комнаты, устройства, приписка сущностей к ним.
 *  Именно его отдаёт живой HA (hass.areas / hass.devices / hass.entities), и
 *  без него «Канал 1» ничем не отличается от «Канал 1». */
const REGISTRY = {
  areas: {
    a_gost: { area_id: 'a_gost', name: 'Гостиная' },
    a_kuh: { area_id: 'a_kuh', name: 'Кухня' },
    a_spal: { area_id: 'a_spal', name: 'Спальня' },
  },
  devices: {
    d_gost: { id: 'd_gost', name: 'Реле гостиной', name_by_user: 'Гостиная свет', area_id: 'a_gost' },
    d_kuh: { id: 'd_kuh', name: 'Кухня свет', area_id: 'a_kuh' },
    d_spal: { id: 'd_spal', name: 'Спальня свет', area_id: 'a_spal' },
    // Щит в коридоре: комнату ему никто не назначил — обычное дело.
    d_shchit: { id: 'd_shchit', name: 'Щит освещения' },
  },
  entities: {
    'light.gostinaia_svet_kanal_1': { entity_id: 'light.gostinaia_svet_kanal_1', device_id: 'd_gost' },
    'light.gostinaia_svet_kanal_2': { entity_id: 'light.gostinaia_svet_kanal_2', device_id: 'd_gost' },
    'light.gostinaia_svet_kanal_3': { entity_id: 'light.gostinaia_svet_kanal_3', device_id: 'd_gost' },
    'light.kukhnia_svet_kanal_1': { entity_id: 'light.kukhnia_svet_kanal_1', device_id: 'd_kuh' },
    'light.kukhnia_svet_kanal_2': { entity_id: 'light.kukhnia_svet_kanal_2', device_id: 'd_kuh' },
    'light.spalnia_svet_kanal_1': { entity_id: 'light.spalnia_svet_kanal_1', device_id: 'd_spal' },
    'light.spalnia_svet_kanal_2': { entity_id: 'light.spalnia_svet_kanal_2', device_id: 'd_spal' },
    'light.shchit_kanal_1': { entity_id: 'light.shchit_kanal_1', device_id: 'd_shchit' },
    'switch.shchit_rozetki': { entity_id: 'switch.shchit_rozetki', device_id: 'd_shchit' },
    'sensor.gostinaia_temperatura': { entity_id: 'sensor.gostinaia_temperatura', device_id: 'd_gost' },
  },
};

/** Состояния к ним. Имена — ровно те, что видно в его Home Assistant. */
function homeStates(): Record<string, any> {
  const st: Record<string, any> = {};
  const put = (id: string, name: string) => {
    st[id] = { state: 'off', attributes: { friendly_name: name } };
  };
  put('light.gostinaia_svet_kanal_1', 'Канал 1');
  put('light.gostinaia_svet_kanal_2', 'Канал 2');
  put('light.gostinaia_svet_kanal_3', 'Канал 3');
  put('light.kukhnia_svet_kanal_1', 'Канал 1');
  put('light.kukhnia_svet_kanal_2', 'Канал 2');
  put('light.spalnia_svet_kanal_1', 'Канал 1');
  put('light.spalnia_svet_kanal_2', 'Канал 2');
  put('light.shchit_kanal_1', 'Канал 1');
  // Так HA называет сущность по умолчанию: имя устройства уже внутри.
  put('switch.shchit_rozetki', 'Щит освещения розетки');
  put('sensor.gostinaia_temperatura', 'Температура');
  return st;
}

/** План: гостиная (слева) и кухня (справа). На кухне уже висит светильник,
 *  привязанный к «Кухня свет · Канал 1» — он обязан пометиться занятым. */
function homePlan() {
  const kitchen = { ...room('Кухня', 6, 5), polygon: [[6, 0], [12, 0], [12, 5], [6, 5]] };
  return {
    name: 'Дом',
    wallHeight: 2.6,
    floors: [
      {
        name: 'Первый этаж',
        elevation: 0,
        wallHeight: 2.6,
        walls: boxWalls(12, 5),
        rooms: [room('Гостиная'), kitchen],
        furniture: [{ id: 'busy1', model: 'ceiling_light', position: [9, 2.55, 2.5] }],
        bindings: [{ entity_id: 'light.kukhnia_svet_kanal_1', anchor_object: 'busy1' }],
      },
    ],
  };
}

// --- стенд ------------------------------------------------------------------

/** Открыть карточку с ЖИВЫМ реестром HA и войти в новый конструктор.
 *  Реестр подмешивается в hass до монтажа: стенд его сам не отдаёт, а весь
 *  список без него — одна безымянная куча. */
async function openHome(page: Page): Promise<void> {
  await openHarness(page);
  await page.evaluate((reg) => {
    (document.getElementById('host') as HTMLElement).style.width = '1440px';
    const api = window.BMS as any;
    const orig = api.makeHass.bind(api);
    api.makeHass = () => Object.assign(orig(), reg);
  }, REGISTRY);
  await mountCard(page, { config: { plan: homePlan() }, states: homeStates(), height: '820px' });
  await settleScene(page);
  await page.evaluate(async () => {
    const c = window.BMS.card;
    c.editEntry = 'e2';
    c.doEnterEdit();
    await c.updateComplete;
  });
  await page.waitForFunction(() => !!window.BMS.root().querySelector('.e2-shell'));
  await settle(page);
}

async function settle(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await window.BMS.card.updateComplete;
    await new Promise((r) => requestAnimationFrame(() => r(null)));
  });
}

/** Путь человека: инструмент «Мебель» → раздел «Освещение» → модель → касание
 *  плана. Ни одного внутреннего вызова. */
async function placeLight(page: Page, x: number, y: number): Promise<void> {
  await page.evaluate(async () => {
    (window.BMS.root().querySelector('[data-act="tool-furniture"]') as HTMLElement).click();
    await window.BMS.card.updateComplete;
    (window.BMS.root().querySelector('[data-cat="lighting"]') as HTMLElement).click();
    await window.BMS.card.updateComplete;
    (window.BMS.root().querySelector('[data-model="ceiling_light"]') as HTMLElement).click();
    await window.BMS.card.updateComplete;
  });
  const pt = await page.evaluate(
    ([wx, wy]) => (window.BMS.card.e2.editor as any).worldToClient(wx, wy),
    [x, y],
  );
  await page.mouse.move(Math.round(pt.x), Math.round(pt.y));
  await page.mouse.down();
  await page.mouse.up();
  await settle(page);
}

interface Grp {
  key: string;
  name: string;
  count: number;
  open: boolean;
  rows: { id: string; text: string; title: string; sub: string; taken: string | null }[];
}

/** Что человек видит: разделы, их заголовки и строки внутри развёрнутых. */
const groups = (page: Page): Promise<Grp[]> =>
  page.evaluate(() =>
    [...window.BMS.root().querySelectorAll('.e2-grp')].map((g) => ({
      key: g.getAttribute('data-area') ?? '',
      name: (g.querySelector('.e2-grp-name')?.textContent ?? '').trim(),
      count: Number((g.querySelector('.e2-grp-count')?.textContent ?? '').trim()),
      open: g.hasAttribute('data-open'),
      rows: [...g.querySelectorAll('.e2-entity')].map((r) => ({
        id: r.getAttribute('data-entity') ?? '',
        text: (r.textContent ?? '').replace(/\s+/g, ' ').trim(),
        title: (r.querySelector('.e2-ent-title')?.textContent ?? '').trim(),
        sub: (r.querySelector('.e2-ent-sub')?.textContent ?? '').trim(),
        taken: r.getAttribute('data-taken'),
      })),
    })),
  );

const clickHead = async (page: Page, key: string): Promise<void> => {
  const ok = await page.evaluate((k) => {
    const el = window.BMS.root().querySelector(`.e2-grp[data-area="${k}"] .e2-grp-head`) as HTMLElement | null;
    el?.click();
    return !!el;
  }, key);
  expect(ok, `раздел «${key}» обязан быть на экране`).toBe(true);
  await settle(page);
};

const search = async (page: Page, text: string): Promise<void> => {
  await page.evaluate((t) => {
    const box = window.BMS.root().querySelector('[data-field="entity-search"]') as HTMLInputElement;
    box.value = t;
    box.dispatchEvent(new Event('input', { bubbles: true }));
  }, text);
  await settle(page);
};

/** Развернуть ВСЕ разделы — иначе мерить было бы нечего. */
async function openAll(page: Page): Promise<void> {
  for (const g of await groups(page)) if (!g.open) await clickHead(page, g.key);
}

test.describe('Список устройств: комнаты, каналы, занятое', () => {
  test('устройства разложены по комнатам, «Без комнаты» — последним, раздел сворачивается', async ({ page }) => {
    await openHome(page);
    await placeLight(page, 3, 2.5); // светильник в ГОСТИНОЙ

    const gs = await groups(page);
    expect(
      gs.map((g) => g.name),
      'разделы: комнаты по алфавиту, «Без комнаты» — в конце, а не вперемешку',
    ).toEqual(['Гостиная', 'Кухня', 'Спальня', 'Без комнаты']);
    expect(
      gs.map((g) => g.count),
      'в заголовке — сколько подходящих устройств в комнате',
    ).toEqual([3, 2, 2, 2]);

    // Открыт ровно один раздел — той комнаты, где стоит сам светильник.
    expect(gs.filter((g) => g.open).map((g) => g.name), 'открыт раздел комнаты предмета').toEqual(['Гостиная']);
    expect(gs[0].rows.length, 'и только он показывает устройства').toBe(3);
    expect(gs[1].rows.length, 'свёрнутая кухня строк не показывает').toBe(0);

    // Разворот — по всей строке заголовка.
    await clickHead(page, 'a_kuh');
    let now = await groups(page);
    expect(now[1].open, 'кухня развернулась').toBe(true);
    expect(now[1].rows.map((r) => r.id), 'и показала свои каналы').toEqual([
      'light.kukhnia_svet_kanal_1',
      'light.kukhnia_svet_kanal_2',
    ]);

    await clickHead(page, 'a_kuh');
    now = await groups(page);
    expect(now[1].open, 'и свернулась обратно').toBe(false);
    expect(now[1].rows.length, 'строки убраны, а не просто прикрыты').toBe(0);
  });

  test('три одинаковых «Канал 1» из разных комнат различимы — видно устройство', async ({ page }) => {
    await openHome(page);
    await placeLight(page, 3, 2.5);
    await openAll(page);

    const rows = (await groups(page)).flatMap((g) => g.rows);
    const ones = ['light.gostinaia_svet_kanal_1', 'light.kukhnia_svet_kanal_1', 'light.spalnia_svet_kanal_1']
      .map((id) => rows.find((r) => r.id === id)!);
    expect(ones.every(Boolean), 'все три «Канал 1» обязаны быть в списке').toBe(true);

    // В Home Assistant у всех трёх имя одно и то же — различает их устройство.
    expect(
      new Set(ones.map((r) => r.title)).size,
      `крупные строки: ${ones.map((r) => `«${r.title}»`).join(', ')} — их не различить`,
    ).toBe(3);
    expect(ones[0].title, 'гостиная').toBe('Гостиная свет · Канал 1');
    expect(ones[1].title, 'кухня').toBe('Кухня свет · Канал 1');
    expect(ones[2].title, 'спальня').toBe('Спальня свет · Канал 1');

    // Идентификатор нужен монтажнику — он второй строкой, мелко.
    expect(ones[0].sub, 'идентификатор показан отдельной строкой').toBe('light.gostinaia_svet_kanal_1');
    const smaller = await page.evaluate(() => {
      const r = window.BMS.root().querySelector('[data-entity="light.gostinaia_svet_kanal_1"]')!;
      const px = (s: string) => parseFloat(getComputedStyle(r.querySelector(s)!).fontSize);
      return { title: px('.e2-ent-title'), sub: px('.e2-ent-sub') };
    });
    expect(smaller.sub, `идентификатор ${smaller.sub}px против имени ${smaller.title}px`)
      .toBeLessThan(smaller.title);

    // Имя устройства НЕ приписывается второй раз, если оно уже в имени сущности.
    expect(rows.find((r) => r.id === 'switch.shchit_rozetki')!.title, 'без дублей')
      .toBe('Щит освещения розетки');
  });

  test('уже привязанное помечено занятым и видно, чем именно', async ({ page }) => {
    await openHome(page);
    await placeLight(page, 3, 2.5);
    await clickHead(page, 'a_kuh');

    const kitchen = (await groups(page)).find((g) => g.name === 'Кухня')!;
    const busy = kitchen.rows.find((r) => r.id === 'light.kukhnia_svet_kanal_1')!;
    const free = kitchen.rows.find((r) => r.id === 'light.kukhnia_svet_kanal_2')!;

    expect(busy.taken, 'занятое помечено, а не спрятано').toBe('Светильник потолочный');
    expect(busy.text, `строка сказала: «${busy.text}»`).toContain('занято');
    expect(busy.text, 'и назвала, чем занято').toContain('Светильник потолочный');
    expect(free.taken, 'свободное ничем не помечено — иначе метка обесценится').toBeNull();
    expect(kitchen.rows.length, 'занятое остаётся в списке: его можно выбрать осознанно').toBe(2);

    // Своя же привязка предмета — не «занято», она выбрана.
    await page.evaluate(async () => {
      (window.BMS.root().querySelector('[data-entity="light.gostinaia_svet_kanal_2"]') as HTMLElement).click();
      await window.BMS.card.updateComplete;
    });
    await settle(page);
    const mine = (await groups(page))
      .flatMap((g) => g.rows)
      .find((r) => r.id === 'light.gostinaia_svet_kanal_2')!;
    expect(mine.taken, 'выбранное самим предметом занятым не считается').toBeNull();
  });

  test('поиск фильтрует ВНУТРИ разделов и не схлопывает их в плоский список', async ({ page }) => {
    await openHome(page);
    await placeLight(page, 3, 2.5);

    await search(page, 'канал 1');
    let gs = await groups(page);
    expect(
      gs.map((g) => g.name),
      'разделы остались разделами — «Канал 1» есть в каждой комнате',
    ).toEqual(['Гостиная', 'Кухня', 'Спальня', 'Без комнаты']);
    expect(gs.every((g) => g.open), 'раздел с находкой открыт сам — иначе видно одни заголовки').toBe(true);
    expect(gs.map((g) => g.rows.length), 'внутри каждого — только найденное').toEqual([1, 1, 1, 1]);
    expect(
      await page.evaluate(() => window.BMS.root().querySelectorAll('.e2-hit').length),
      'найденное подсвечено',
    ).toBeGreaterThan(0);

    // Поиск по комнате: пустые разделы уходят с экрана целиком.
    await search(page, 'спальня');
    gs = await groups(page);
    expect(gs.map((g) => g.name), 'остался один раздел').toEqual(['Спальня']);
    expect(gs[0].rows.length, 'со всеми своими устройствами').toBe(2);

    await search(page, 'кукхния');
    expect(await groups(page), 'ничего не найдено — разделов нет').toEqual([]);
    expect(
      await page.evaluate(() => window.BMS.root().querySelector('.e2-pick .e2-hint')?.textContent ?? ''),
      'и об этом сказано словами',
    ).toContain('ничего не найдено');
  });

  test('сначала подходящие домены: датчик — только за кнопкой «Показать все устройства»', async ({ page }) => {
    await openHome(page);
    await placeLight(page, 3, 2.5);
    await openAll(page);

    const ids = (gs: Grp[]) => gs.flatMap((g) => g.rows.map((r) => r.id));
    expect(ids(await groups(page)), 'датчику температуры среди светильников не место')
      .not.toContain('sensor.gostinaia_temperatura');
    expect(ids(await groups(page)).length, 'а девять светильников и выключателей — на месте').toBe(9);

    await page.evaluate(async () => {
      (window.BMS.root().querySelector('[data-act="entity-all"]') as HTMLElement).click();
      await window.BMS.card.updateComplete;
    });
    await settle(page);
    await openAll(page);
    expect(ids(await groups(page)), 'по кнопке показаны все устройства')
      .toContain('sensor.gostinaia_temperatura');
  });

  test('цели под палец: заголовки разделов и строки не мельче 48 px', async ({ page }) => {
    // Окно шире карточки (1440): иначе правая колонка с инспектором уезжает за
    // край окна и снимок ловит её половину.
    await page.setViewportSize({ width: 1520, height: 1000 });
    await openHome(page);
    await placeLight(page, 3, 2.5);
    await openAll(page);

    const small = await page.evaluate(() => {
      const root = window.BMS.root();
      const out: string[] = [];
      const seen = root.querySelectorAll('.e2-grp-head, .e2-entity, [data-act="entity-all"]');
      for (const el of Array.from(seen) as HTMLElement[]) {
        const r = el.getBoundingClientRect();
        if (r.height < 48 || r.width < 48) {
          out.push(`${el.getAttribute('class')} ${Math.round(r.width)}x${Math.round(r.height)}`);
        }
      }
      return { small: out, n: seen.length };
    });
    expect(small.n, 'мерить обязано быть что — иначе проверка зеленеет на пустоте').toBeGreaterThan(11);
    expect(small.small.join('; '), 'цели мельче 48 px').toBe('');

    // Список прокручивается сам, а не растягивает инспектор до бесконечности.
    const box = await page.evaluate(() => {
      const el = window.BMS.root().querySelector('.e2-groups') as HTMLElement;
      const cs = getComputedStyle(el);
      return { over: cs.overflowY, h: el.getBoundingClientRect().height, inner: el.scrollHeight };
    });
    expect(box.over, 'список прокручивается').toBe('auto');
    expect(box.h, 'и не выше своего предела').toBeLessThanOrEqual(340);

    // Снимок делаем ПОСЛЕ анимации входа панели (bms-view-in): иначе в кадр
    // попадает призрак съезжающей раскладки, а не то, что видит человек.
    await page.evaluate(async () => {
      const running = (document.getAnimations?.() ?? []).map((a) =>
        Promise.race([a.finished.catch(() => null), new Promise((r) => setTimeout(r, 800))]),
      );
      await Promise.all(running);
      await new Promise((r) => requestAnimationFrame(() => r(null)));
    });
    mkdirSync(SHOTS, { recursive: true });
    // Для снимка сворачиваем 3D: колонка инспектора занимает всю высоту, и в
    // кадр попадает ВЕСЬ список, а не его верхние 370 px.
    await page.evaluate(async () => {
      window.BMS.card.e2.showThree = false;
      window.BMS.card.requestUpdate();
      await window.BMS.card.updateComplete;
    });
    await settle(page);
    const shot = async (name: string) => {
      const clip = await page.evaluate(() => {
        const r = (window.BMS.root().querySelector('.e2-inspect-wrap') as HTMLElement).getBoundingClientRect();
        return {
          x: Math.round(r.x), y: Math.round(r.y),
          width: Math.round(r.width), height: Math.round(r.height),
        };
      });
      await page.screenshot({ path: `${SHOTS}/${name}.png`, clip });
    };
    await page.locator('bms-floorplan-card').screenshot({ path: `${SHOTS}/card.png` });
    // Свёрнутые разделы — как их видит человек сразу после постановки.
    await page.evaluate(async () => {
      window.BMS.card.e2.entityOpen = {};
      window.BMS.card.requestUpdate();
      await window.BMS.card.updateComplete;
    });
    await settle(page);
    await shot('picker');
    await search(page, 'канал 1');
    await shot('picker-search');
  });

});
