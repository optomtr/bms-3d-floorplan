// ---------------------------------------------------------------------------
// СТОРОЖ ПАНЕЛИ «МАСТЕР» — управление домом по разделам.
//
// Одна кнопка меняет весь этаж, поэтому стережём не «нажалось», а ЧТО именно
// ушло в Home Assistant:
//   • «Выключить весь свет» гасит свет и НЕ трогает шторы, телевизор,
//     кондиционер и отопление (контрольная против «выключили всё подряд»);
//   • счётчик «работает N из M» совпадает с настоящими состояниями и следует
//     за ними;
//   • раздела, которого в доме нет, на панели нет;
//   • кнопка, которой нечего делать, выключена — и молча ничего не шлёт;
//   • шторы: открыть / стоп / закрыть зовут ТРИ РАЗНЫЕ службы;
//   • панель видно сразу, а не «после того, как доедет анимация»;
//   • на планшете в книжной ориентации цели не мельче 48px и панель не
//     прокручивается вбок.
//
// Второй блок ниже стережёт разбор на ЖИВЫХ сущностях объекта владельца — тех
// самых, где «мастер» ошибался, пока правило климата было написано во второй
// раз (реле тёплого пола попадало в «Свет», вентилятор конвектора — в
// «Вентиляцию»). Те же сущности стерегут кружки в tests/25-climate-badges.
//
// Каждая проверка ломалась в исходниках и краснела — чем именно, написано в
// отчёте к задаче.
// ---------------------------------------------------------------------------

import { expect, test, type Page } from '@playwright/test';
import { mountCard, openHarness } from './helpers/harness';
import { boxWalls } from './helpers/plans';

/** Дом со всеми разделами: свет, кондиционеры, отопление (тёплый пол +
 *  конвектор на реле), вентиляция, шторы. Плюс телевизор — он в разделы не
 *  попадает и служит контрольным «чужим» устройством. */
function fullPlan() {
  return {
    name: 'Дом',
    wallHeight: 2.7,
    floors: [
      {
        name: 'Первый этаж',
        elevation: 0,
        wallHeight: 2.7,
        walls: boxWalls(10, 8),
        rooms: [{ name: 'Гостиная', polygon: [[0, 0], [10, 0], [10, 8], [0, 8]] }],
        furniture: [
          { id: 'lamp1', model: 'floor_lamp', position: [1.4, 0, 1.4] },
          { id: 'lamp2', model: 'ceiling_light', position: [5, 2.6, 2.5] },
          { id: 'plate1', model: 'wall_switch', position: [0.2, 1.2, 3] },
          { id: 'ac1', model: 'ac_unit', position: [9.4, 2.2, 2.5] },
          { id: 'ac2', model: 'ac_unit', position: [0.6, 2.2, 6.5] },
          { id: 'floor1', model: 'warm_floor', position: [4, 0, 6.5] },
          { id: 'conv1', model: 'convector', position: [7, 0.3, 7.6] },
          { id: 'fan1', model: 'ceiling_fan', position: [5, 2.4, 6.5] },
          { id: 'cur1', model: 'curtain', position: [2, 1.2, 0.2] },
          { id: 'cur2', model: 'curtain', position: [8, 1.2, 0.2] },
          { id: 'tv1', model: 'tv', position: [5, 1, 0.3] },
        ],
        zones: [
          {
            id: 'z1', name: 'Гостиная', x: 5, z: 4,
            entities: [
              'light.zal', 'light.liustra', 'switch.rozetka',
              'climate.ac_zal', 'climate.ac_kuhnia', 'climate.teplyi_pol', 'switch.convector',
              'fan.vent', 'cover.shtory', 'cover.shtory_2', 'media_player.tv',
            ],
          },
        ],
        bindings: [
          { entity_id: 'light.zal', anchor_object: 'lamp1', behavior: 'light' },
          { entity_id: 'light.liustra', anchor_object: 'lamp2', behavior: 'light' },
          { entity_id: 'switch.rozetka', anchor_object: 'plate1', behavior: 'switch' },
          { entity_id: 'climate.ac_zal', anchor_object: 'ac1', behavior: 'climate' },
          { entity_id: 'climate.ac_kuhnia', anchor_object: 'ac2', behavior: 'climate' },
          { entity_id: 'climate.teplyi_pol', anchor_object: 'floor1', behavior: 'climate' },
          { entity_id: 'switch.convector', anchor_object: 'conv1', behavior: 'switch' },
          { entity_id: 'fan.vent', anchor_object: 'fan1', behavior: 'fan' },
          { entity_id: 'cover.shtory', anchor_object: 'cur1', behavior: 'cover' },
          { entity_id: 'cover.shtory_2', anchor_object: 'cur2', behavior: 'cover' },
          { entity_id: 'media_player.tv', anchor_object: 'tv1', behavior: 'media_player' },
        ],
      },
    ],
  };
}

const fullStates = () => ({
  'light.zal': { state: 'on', attributes: { friendly_name: 'Свет в зале' } },
  'light.liustra': { state: 'off', attributes: { friendly_name: 'Люстра' } },
  'switch.rozetka': { state: 'on', attributes: { friendly_name: 'Розетка' } },
  'climate.ac_zal': {
    state: 'cool',
    attributes: { friendly_name: 'Кондиционер зал', current_temperature: 24, temperature: 22, hvac_modes: ['off', 'cool', 'heat', 'dry', 'fan_only'] },
  },
  'climate.ac_kuhnia': {
    state: 'off',
    attributes: { friendly_name: 'Кондиционер кухня', current_temperature: 25, temperature: 23, hvac_modes: ['off', 'cool', 'heat', 'fan_only'] },
  },
  'climate.teplyi_pol': {
    state: 'heat',
    attributes: { friendly_name: 'Тёплый пол', current_temperature: 26, temperature: 28, hvac_modes: ['off', 'heat'] },
  },
  'switch.convector': { state: 'off', attributes: { friendly_name: 'Конвектор' } },
  'fan.vent': { state: 'on', attributes: { friendly_name: 'Вентиляция' } },
  'cover.shtory': { state: 'open', attributes: { friendly_name: 'Шторы', current_position: 100 } },
  'cover.shtory_2': { state: 'closed', attributes: { friendly_name: 'Шторы 2', current_position: 0 } },
  'media_player.tv': { state: 'playing', attributes: { friendly_name: 'Телевизор', device_class: 'tv' } },
});

/** Дом, где есть ТОЛЬКО свет (и телевизор — он раздела не образует). */
function lightsOnlyPlan() {
  const p = fullPlan();
  const f = p.floors[0];
  const keep = new Set(['light.zal', 'light.liustra', 'switch.rozetka', 'media_player.tv']);
  f.bindings = f.bindings.filter((b) => keep.has(b.entity_id));
  f.zones[0].entities = f.zones[0].entities.filter((e) => keep.has(e));
  return p;
}

const lightsOnlyStates = () => {
  const st = fullStates() as Record<string, unknown>;
  for (const id of Object.keys(st)) {
    if (!['light.zal', 'light.liustra', 'switch.rozetka', 'media_player.tv'].includes(id)) delete st[id];
  }
  return st;
};

async function open(page: Page, plan: unknown, states: Record<string, unknown>, height = '860px'): Promise<void> {
  await openHarness(page);
  await page.evaluate(() => {
    (document.getElementById('host') as HTMLElement).style.width = '100%';
  });
  await mountCard(page, { config: { plan }, states, height });
  // Тишины сцены НЕ ждём: в доме есть включённый вентилятор, он крутится
  // каждый кадр и сцена не замолкает никогда (см. tests/04-render-on-demand).
  // Панель живёт в DOM, ей хватает построенного плана.
  await page.evaluate(async () => {
    await window.BMS.card.updateComplete;
  });
  await page.evaluate(async () => {
    window.BMS.card.viewMode = 'overview';
    await window.BMS.card.updateComplete;
  });
  await page.evaluate(async () => {
    const b = window.BMS.root().querySelector('[data-act="master-open"]') as HTMLElement | null;
    if (!b) throw new Error('в «Обзоре» нет кнопки «Управление домом»');
    b.click();
    await window.BMS.card.updateComplete;
  });
  await page.waitForFunction(() => !!window.BMS.root().querySelector('.ms-sheet'));
}

const calls = (page: Page) => page.evaluate(() => window.BMS.serviceCalls.map((c) => ({ domain: c.domain, service: c.service, data: c.data })));

const clearCalls = (page: Page) => page.evaluate(() => { window.BMS.serviceCalls.length = 0; });

async function press(page: Page, act: string): Promise<void> {
  const ok = await page.evaluate(async (a) => {
    const b = window.BMS.root().querySelector(`[data-act="${a}"]`) as HTMLElement | null;
    if (!b) return false;
    b.click();
    await window.BMS.card.updateComplete;
    return true;
  }, act);
  if (!ok) throw new Error(`на панели нет кнопки ${act}`);
}

const textOf = (page: Page, sel: string) =>
  page.evaluate((s) => window.BMS.root().querySelector(s)?.textContent?.trim() ?? null, sel);

const disabled = (page: Page, act: string) =>
  page.evaluate((a) => {
    const b = window.BMS.root().querySelector(`[data-act="${a}"]`) as HTMLButtonElement | null;
    return b ? b.disabled : null;
  }, act);

test.describe('Мастер: управление домом по разделам', () => {
  test('«выключить весь свет» гасит именно свет — шторы, телевизор, климат не трогает', async ({ page }) => {
    await open(page, fullPlan(), fullStates());
    await clearCalls(page);
    await press(page, 'lights-off');

    const sent = await calls(page);
    // Ровно ОДНА команда: ушла (иначе «ничего лишнего не тронули» было бы верно
    // и для мёртвой кнопки) и ровно одна (никаких «заодно приглушим телевизор»).
    expect(sent.length, `ждали ровно одну команду, ушло ${sent.length}: ${JSON.stringify(sent)}`).toBe(1);
    expect(sent[0].domain).toBe('homeassistant');
    expect(sent[0].service).toBe('turn_off');

    const ids: string[] = [].concat(sent[0].data.entity_id);
    // Гасим ровно то, что горело в разделе «Свет».
    expect([...ids].sort(), `выключили: ${ids.join(', ')}`).toEqual(['light.zal', 'switch.rozetka']);
    // И ни одного чужого домена — это и есть контрольная.
    for (const bad of ['cover.shtory', 'cover.shtory_2', 'media_player.tv', 'climate.ac_zal', 'climate.teplyi_pol', 'switch.convector', 'fan.vent']) {
      expect(ids, `кнопка «весь свет» задела ${bad}`).not.toContain(bad);
    }
    expect(
      sent.filter((c) => ['cover', 'media_player', 'climate', 'fan'].includes(c.domain)),
      'кнопка «весь свет» не имеет права звать службы штор, медиа, климата и вентиляции',
    ).toEqual([]);
  });

  test('счётчик «работает N из M» совпадает с настоящими состояниями и следует за ними', async ({ page }) => {
    await open(page, fullPlan(), fullStates());

    // Свет: горят light.zal и switch.rozetka, погашена люстра.
    expect(await textOf(page, '[data-count="lights"]')).toBe('работает 2 из 3');
    // Кондиционеры: ac_zal охлаждает, ac_kuhnia выключен. Тёплый пол и
    // конвектор сюда не попадают — они отопление.
    expect(await textOf(page, '[data-count="ac"]')).toBe('работает 1 из 2');
    expect(await textOf(page, '[data-count="heat"]')).toBe('работает 1 из 2');
    expect(await textOf(page, '[data-count="vent"]')).toBe('работает 1 из 1');
    expect(await textOf(page, '[data-count="curtains"]')).toBe('открыто 1 из 2');

    // Состояния поменялись в Home Assistant — счётчики обязаны поехать следом.
    await page.evaluate(async () => {
      window.BMS.setStates({
        'light.liustra': { state: 'on' },
        'climate.ac_kuhnia': { state: 'cool' },
        'switch.convector': { state: 'on' },
        'cover.shtory_2': { state: 'open', attributes: { current_position: 60 } },
      });
      await window.BMS.card.updateComplete;
    });
    expect(await textOf(page, '[data-count="lights"]')).toBe('работает 3 из 3');
    expect(await textOf(page, '[data-count="ac"]')).toBe('работает 2 из 2');
    expect(await textOf(page, '[data-count="heat"]')).toBe('работает 2 из 2');
    expect(await textOf(page, '[data-count="curtains"]')).toBe('открыто 2 из 2');
  });

  test('раздела, которого в доме нет, на панели нет', async ({ page }) => {
    await open(page, lightsOnlyPlan(), lightsOnlyStates());

    const secs = await page.evaluate(() =>
      [...window.BMS.root().querySelectorAll('.ms-sec')].map((s) => s.getAttribute('data-sec')),
    );
    expect(secs, 'в доме только свет — разделов климата, штор и вентиляции быть не должно').toEqual(['lights', 'alloff']);

    // Контроль: в доме со всем набором эти же разделы ЕСТЬ. Без него «ничего
    // не показали» прошло бы и за пустую панель.
    const page2 = await page.context().newPage();
    await open(page2, fullPlan(), fullStates());
    const secs2 = await page2.evaluate(() =>
      [...window.BMS.root().querySelectorAll('.ms-sec')].map((s) => s.getAttribute('data-sec')),
    );
    expect(secs2).toEqual(['lights', 'ac', 'heat', 'vent', 'curtains', 'alloff']);
    await page2.close();
  });

  test('кнопка выключена, когда делать нечего, — и молча ничего не отправляет', async ({ page }) => {
    await open(page, fullPlan(), fullStates());

    // Вентилятор один и он уже работает: «Включить» делать нечего.
    expect(await disabled(page, 'vent-on'), 'вентиляция уже включена — кнопке «Включить» нечего делать').toBe(true);
    expect(await disabled(page, 'vent-off'), 'а «Выключить» обязана оставаться живой').toBe(false);

    // Контроль обратного случая: гасим весь свет — теперь мертва «Выключить всё».
    await page.evaluate(async () => {
      window.BMS.setStates({ 'light.zal': { state: 'off' }, 'switch.rozetka': { state: 'off' } });
      await window.BMS.card.updateComplete;
    });
    expect(await disabled(page, 'lights-off'), 'гасить больше нечего').toBe(true);
    expect(await disabled(page, 'lights-on'), '…а включать есть что').toBe(false);

    await clearCalls(page);
    await press(page, 'lights-off');
    expect(await calls(page), 'выключенная кнопка не имеет права ничего отправлять').toEqual([]);
  });

  test('шторы: открыть, стоп и закрыть зовут три разные службы', async ({ page }) => {
    await open(page, fullPlan(), fullStates());

    await clearCalls(page);
    await press(page, 'curtains-open');
    let sent = await calls(page);
    expect(sent.map((c) => `${c.domain}.${c.service}`), 'открытие').toEqual(['cover.open_cover']);
    // Открывать надо ту штору, что закрыта, а не ту, что уже открыта.
    expect(sent[0].data.entity_id).toBe('cover.shtory_2');

    await clearCalls(page);
    await press(page, 'curtains-stop');
    sent = await calls(page);
    expect(new Set(sent.map((c) => `${c.domain}.${c.service}`)), 'стоп').toEqual(new Set(['cover.stop_cover']));
    expect(sent.length, 'стоп относится ко всем шторам дома').toBe(2);

    await clearCalls(page);
    await press(page, 'curtains-close');
    sent = await calls(page);
    expect(sent.map((c) => `${c.domain}.${c.service}`), 'закрытие').toEqual(['cover.close_cover']);
    expect(sent[0].data.entity_id).toBe('cover.shtory');
  });

  test('приточка на climate попадает в вентиляцию, а не в кондиционеры, и считается работающей', async ({ page }) => {
    // Устройство, которое умеет только гонять воздух: в Home Assistant это
    // climate.* с режимами off/fan_only, а состояние у него — «fan_only», а не
    // «on». Проверка ловит сразу две ошибки: попадание в «Кондиционеры» и
    // подсчёт работающей приточки как выключенной.
    const p = fullPlan();
    const f = p.floors[0];
    const keep = new Set(['fan.vent']);
    f.bindings = f.bindings.filter((b) => keep.has(b.entity_id));
    f.bindings.push({ entity_id: 'climate.pritochka', anchor_object: 'ac2', behavior: 'climate' });
    f.zones[0].entities = ['fan.vent', 'climate.pritochka'];
    await open(page, p, {
      'fan.vent': { state: 'off', attributes: { friendly_name: 'Вентилятор' } },
      'climate.pritochka': { state: 'fan_only', attributes: { friendly_name: 'Приточка', hvac_modes: ['off', 'fan_only'] } },
    });

    const secs = await page.evaluate(() =>
      [...window.BMS.root().querySelectorAll('.ms-sec')].map((s) => s.getAttribute('data-sec')),
    );
    expect(secs, 'приточка — вентиляция, а не кондиционер').toEqual(['vent', 'alloff']);
    expect(await textOf(page, '[data-count="vent"]'), 'приточка в режиме fan_only работает').toBe('работает 1 из 2');

    await clearCalls(page);
    await press(page, 'vent-off');
    const sent = await calls(page);
    expect(sent.map((c) => `${c.domain}.${c.service}`), 'выключаем приточку её же способом — режимом').toEqual(['climate.set_hvac_mode']);
    expect(sent[0].data).toMatchObject({ entity_id: 'climate.pritochka', hvac_mode: 'off' });
  });

  test('панель видно сразу, а не после того, как доедет анимация', async ({ page }) => {
    // Карточка рисует кадры по требованию: анимация с fill-mode both замирает
    // на своём первом (прозрачном) кадре, и панели на экране НЕТ. Меряем
    // сразу после открытия, ничем не подталкивая кадры.
    await open(page, fullPlan(), fullStates());
    const look = await page.evaluate(() => {
      const el = window.BMS.root().querySelector('.ms-sheet') as HTMLElement;
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return { opacity: Number(cs.opacity), w: Math.round(r.width), h: Math.round(r.height) };
    });
    expect(look.opacity, `панель открыта, но её прозрачность ${look.opacity}`).toBeGreaterThan(0.9);
    expect(look.w, 'и она занимает своё место').toBeGreaterThan(200);
    expect(look.h).toBeGreaterThan(200);
  });

  test('планшет в книжной ориентации: цели не мельче 48px, ничего не уезжает вбок', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await open(page, fullPlan(), fullStates(), '1000px');

    const measured = await page.evaluate(() => {
      const root = window.BMS.root() as ShadowRoot;
      const sheet = root.querySelector('.ms-sheet') as HTMLElement;
      const card = root.querySelector('ha-card')!.getBoundingClientRect();
      const small: string[] = [];
      const outside: string[] = [];
      const btns = [...sheet.querySelectorAll('button')] as HTMLElement[];
      for (const b of btns) {
        const r = b.getBoundingClientRect();
        if (r.width < 48 || r.height < 48) small.push(`${b.getAttribute('data-act') ?? b.className} ${Math.round(r.width)}x${Math.round(r.height)}`);
        if (r.right > card.right + 1 || r.left < card.left - 1) outside.push(`${b.getAttribute('data-act')} ${Math.round(r.left)}…${Math.round(r.right)}`);
      }
      return {
        count: btns.length,
        small,
        outside,
        sideScroll: sheet.scrollWidth - sheet.clientWidth,
        sheetRight: Math.round(sheet.getBoundingClientRect().right),
        cardRight: Math.round(card.right),
      };
    });
    expect(measured.count, 'на панели должны быть кнопки — иначе меряли бы пустоту').toBeGreaterThan(8);
    expect(measured.small.join('; '), `мелкие цели: ${measured.small.join('; ')}`).toBe('');
    expect(measured.outside.join('; '), `уехало за край: ${measured.outside.join('; ')}`).toBe('');
    expect(measured.sideScroll, 'панель прокручивается вбок').toBeLessThanOrEqual(0);
    expect(measured.sheetRight).toBeLessThanOrEqual(measured.cardRight + 1);
  });
});


// ---------------------------------------------------------------------------
// ЖИВОЙ ОБЪЕКТ ВЛАДЕЛЬЦА. Никаких придуманных id, и климатических ПРЕДМЕТОВ у
// этих сущностей нет — тип брать неоткуда, кроме домена и имени. Ровно здесь
// вторая копия правила и ошибалась:
//   • оба реле коллектора объекта — тёплый пол, а «мастер» считал их СВЕТОМ, и
//     кнопка «Выключить весь свет» снимала с пола питание (опасная ошибка);
//   • 13 из 14 `fan.*` объекта — вентилятор ВНУТРИ конвектора, то есть
//     обогрев, а «мастер» отправлял их все в «Вентиляцию».
// Контрольная половина: реле, названное обычной нагрузкой («Розетка»), обязано
// остаться в «Свете» — иначе «унесли все реле в отопление» прошло бы за
// исправление.
// ---------------------------------------------------------------------------

/** Кусок этажа владельца: гардеробная с реле коллектора, кабинет с
 *  конвектором и санузел с настоящей вентиляцией. */
function realPlan() {
  return {
    name: 'Объект',
    wallHeight: 2.7,
    floors: [
      {
        name: '1 Этаж',
        elevation: 0,
        wallHeight: 2.7,
        walls: boxWalls(18, 10),
        // Единственный предмет — светильник. Климатических предметов у этих
        // сущностей на объекте нет, и модель ничего не подскажет.
        furniture: [{ id: 'lampG', model: 'ceiling_light', position: [15, 2.5, 2] }],
        zones: [
          { id: 'z_kab1', name: 'Кабинет 1', x: 3, z: 2, entities: ['fan.kabinet_1_konvektor'] },
          { id: 'z_kirish', name: 'Кириш санузел', x: 12, z: 2, entities: ['fan.kirish_sanuzel_spoty_ventiliatsiia_switch_2'] },
          {
            id: 'z_gard', name: 'Гардеробная', x: 15, z: 2,
            entities: [
              'switch.resepshn_kollektor_2_rele_1_switch_1',
              'switch.resepshn_kollektor_2_rele_1_switch_2',
              'switch.rozetka',
              'light.garderobnaia',
            ],
          },
        ],
        bindings: [{ entity_id: 'light.garderobnaia', anchor_object: 'lampG', behavior: 'light' }],
      },
    ],
  };
}

/** Состояния тех же сущностей — имена ровно те, что владелец видит в HA. */
const realStates = () => ({
  'fan.kabinet_1_konvektor': { state: 'on', attributes: { friendly_name: 'Вентилятор конвектора' } },
  'fan.kirish_sanuzel_spoty_ventiliatsiia_switch_2': { state: 'on', attributes: { friendly_name: 'Вентиляция' } },
  'switch.resepshn_kollektor_2_rele_1_switch_1': { state: 'on', attributes: { friendly_name: 'Тёплый пол' } },
  'switch.resepshn_kollektor_2_rele_1_switch_2': { state: 'off', attributes: { friendly_name: 'Тёплый пол санузла' } },
  // Контрольное реле: обычная нагрузка, климатом не притворяется.
  'switch.rozetka': { state: 'on', attributes: { friendly_name: 'Розетка' } },
  'light.garderobnaia': { state: 'on', attributes: { friendly_name: 'Свет гардеробной' } },
});

/** Единственный список id, ушедший в `homeassistant.turn_off`. */
async function offList(page: Page): Promise<string[]> {
  const sent = await calls(page);
  const bulk = sent.filter((c) => c.domain === 'homeassistant' && c.service === 'turn_off');
  expect(bulk.length, `ждали ровно одно массовое выключение, ушло ${sent.length} команд: ${JSON.stringify(sent)}`).toBe(1);
  return ([] as string[]).concat(bulk[0].data.entity_id).sort();
}

test.describe('Мастер на живых сущностях объекта', () => {
  test('ГЛАВНАЯ: реле «Тёплый пол» — это «Отопление», и «Выключить весь свет» его НЕ трогает', async ({ page }) => {
    await open(page, realPlan(), realStates());

    // Разделы: свет, отопление (реле пола + вентилятор конвектора), вентиляция.
    const secs = await page.evaluate(() =>
      [...window.BMS.root().querySelectorAll('.ms-sec')].map((s) => s.getAttribute('data-sec')),
    );
    expect(secs, 'реле коллектора обязаны образовать раздел «Отопление»').toEqual(['lights', 'heat', 'vent', 'alloff']);

    // Кнопка «Выключить весь свет» — то самое опасное место.
    await clearCalls(page);
    await press(page, 'lights-off');
    const off = await offList(page);
    expect(off, 'в «Свете» остаются лампа и обычная розетка — и только они').toEqual([
      'light.garderobnaia',
      'switch.rozetka',
    ]);
    for (const pol of ['switch.resepshn_kollektor_2_rele_1_switch_1', 'switch.resepshn_kollektor_2_rele_1_switch_2']) {
      expect(off, `кнопка «Выключить весь свет» сняла питание с тёплого пола (${pol})`).not.toContain(pol);
    }

    // И то же самое с другой стороны: «Отопление» гасит именно реле пола.
    await clearCalls(page);
    await press(page, 'heat-off');
    const heatOff = await offList(page);
    expect(heatOff, 'выключаем отопление: включённое реле пола и вентилятор конвектора').toEqual([
      'fan.kabinet_1_konvektor',
      'switch.resepshn_kollektor_2_rele_1_switch_1',
    ]);
  });

  test('КОНТРОЛЬНАЯ: реле, названное обычной нагрузкой, осталось в «Свете»', async ({ page }) => {
    await open(page, realPlan(), realStates());

    // Розетки в «Отоплении» быть не должно — иначе правило унесло туда все
    // реле подряд, и проверка выше прошла бы даром.
    await clearCalls(page);
    await press(page, 'heat-off');
    expect(await offList(page), 'switch.rozetka — обычная нагрузка, отоплением она не станет').not.toContain('switch.rozetka');

    // Счётчик «Света»: лампа и розетка, обе включены. Реле пола сюда не входят.
    expect(await textOf(page, '[data-count="lights"]'), 'в «Свете» ровно два устройства').toBe('работает 2 из 2');
  });

  test('вентилятор конвектора — «Отопление», настоящая вентиляция — «Вентиляция»', async ({ page }) => {
    await open(page, realPlan(), realStates());

    expect(await textOf(page, '[data-count="heat"]'), 'отопление: два реле пола и вентилятор конвектора').toBe('работает 2 из 3');
    expect(await textOf(page, '[data-count="vent"]'), 'вентиляция на объекте ровно одна').toBe('работает 1 из 1');

    // Контрольная против «объявили все fan обогревом».
    await clearCalls(page);
    await press(page, 'vent-off');
    expect(await offList(page), 'в «Вентиляции» только настоящая вытяжка').toEqual([
      'fan.kirish_sanuzel_spoty_ventiliatsiia_switch_2',
    ]);

    // …а вентилятор конвектора — в «Отоплении», и в вентиляцию не попал.
    await clearCalls(page);
    await press(page, 'heat-off');
    expect(await offList(page), 'fan.kabinet_1_konvektor — обогрев').toContain('fan.kabinet_1_konvektor');
  });
});
