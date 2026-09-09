// ---------------------------------------------------------------------------
// СТОРОЖ КРУЖКОВ КЛИМАТА У МАРКЕРА КОМНАТЫ.
//
// Слово владельца: «В 3D нужно сделать статус, чтобы рядом с домиком
// показывало, что кондер работает. Свет и так понятно, но с кондиционером не
// так понятно. Работают ли тёплый пол, конвектор, кондиционер — чтобы рядом
// маленькие кружочки тоже показывали».
//
// Стережётся ровно это, и отдельно — то, чем такую задачу проще всего
// «выполнить» неправильно:
//   • кружок появляется ТОЛЬКО там, где техника этого типа есть;
//   • горит, когда прибор реально работает, и приглушён, когда включён, но
//     простаивает (кондиционер добрал температуру и стоит);
//   • тёплый пол и конвектор различимы между собой в ОДНОМ состоянии;
//   • тип берётся и без модели предмета — по hvac_modes живой сущности;
//   • КОНТРОЛЬНАЯ: в комнате без климата кружков нет ни одного, и включённое
//     реле без климатической модели климатом не считается. Без неё «нарисовали
//     всем подряд» прошло бы за исправление.
//
// Второй блок ниже стережёт те же правила на ЖИВЫХ сущностях объекта владельца,
// где правило «домен решает» ошибалось: вентилятор конвектора, единственная
// настоящая вентиляция и тёплый пол на голом реле коллектора.
//
// Каждая проверка ломалась руками и краснела — чем именно, написано в отчёте.
// ---------------------------------------------------------------------------

import { expect, test, type Page } from '@playwright/test';
import { mountCard, openHarness, settleScene } from './helpers/harness';
import { boxWalls } from './helpers/plans';

/** Этаж владельца в миниатюре: четыре зоны с разным набором климата. */
function climatePlan() {
  return {
    name: 'Климат',
    wallHeight: 2.7,
    floors: [
      {
        name: '1 Этаж',
        elevation: 0,
        wallHeight: 2.7,
        walls: boxWalls(16, 10),
        rooms: [{ name: 'Этаж', polygon: [[0, 0], [16, 0], [16, 10], [0, 10]] }],
        furniture: [
          { id: 'ac1', model: 'ac_unit', position: [2, 2.2, 2] },
          { id: 'lampZal', model: 'ceiling_light', position: [3, 2.5, 2] },
          { id: 'pol1', model: 'warm_floor', position: [7, 0, 2] },
          { id: 'konv1', model: 'convector', position: [9, 0, 2] },
          { id: 'lampKlad', model: 'ceiling_light', position: [13, 2.5, 2] },
          // Голое реле на НЕклиматическом предмете — климатом быть не должно.
          { id: 'rele1', model: 'tv', position: [13, 1, 4] },
        ],
        zones: [
          { id: 'z_zal', name: 'Зал', x: 2.5, z: 2, entities: ['climate.kondicioner_zal', 'light.zal'] },
          { id: 'z_spal', name: 'Спальня', x: 8, z: 2, entities: ['climate.teplyi_pol_spalnia', 'climate.konvektor_spalnia'] },
          { id: 'z_klad', name: 'Кладовая', x: 13, z: 3, entities: ['light.kladovaia', 'switch.rele_kladovaia'] },
          // Зона БЕЗ привязок к предметам: модели нет, тип берётся из hvac_modes.
          { id: 'z_kab', name: 'Кабинет', x: 5, z: 7, entities: ['climate.split_kabinet', 'climate.pol_kabineta'] },
        ],
        bindings: [
          { entity_id: 'climate.kondicioner_zal', anchor_object: 'ac1', behavior: 'climate' },
          { entity_id: 'light.zal', anchor_object: 'lampZal', behavior: 'light' },
          { entity_id: 'climate.teplyi_pol_spalnia', anchor_object: 'pol1', behavior: 'climate' },
          { entity_id: 'climate.konvektor_spalnia', anchor_object: 'konv1', behavior: 'climate' },
          { entity_id: 'light.kladovaia', anchor_object: 'lampKlad', behavior: 'light' },
          { entity_id: 'switch.rele_kladovaia', anchor_object: 'rele1', behavior: 'switch' },
        ],
      },
    ],
  };
}

/** Состояния: кондиционер охлаждает, тёплый пол греет, конвектор простаивает. */
function climateStates(): Record<string, any> {
  return {
    'climate.kondicioner_zal': {
      state: 'cool',
      attributes: { friendly_name: 'Кондиционер зал', hvac_modes: ['off', 'cool', 'heat'], hvac_action: 'cooling' },
    },
    'light.zal': { state: 'off', attributes: { friendly_name: 'Свет зал' } },
    'climate.teplyi_pol_spalnia': {
      state: 'heat',
      attributes: { friendly_name: 'Тёплый пол спальня', hvac_modes: ['off', 'heat'], hvac_action: 'heating' },
    },
    'climate.konvektor_spalnia': {
      state: 'heat',
      attributes: { friendly_name: 'Конвектор спальня', hvac_modes: ['off', 'heat'], hvac_action: 'idle' },
    },
    'light.kladovaia': { state: 'off', attributes: { friendly_name: 'Свет кладовой' } },
    // Реле ВКЛЮЧЕНО: если кружки раздаются всем подряд, здесь и загорится.
    'switch.rele_kladovaia': { state: 'on', attributes: { friendly_name: 'Реле кладовой' } },
    'climate.split_kabinet': {
      state: 'off',
      attributes: { friendly_name: 'Сплит кабинет', hvac_modes: ['off', 'cool', 'heat_cool'] },
    },
    'climate.pol_kabineta': {
      state: 'heat',
      attributes: { friendly_name: 'Пол кабинета', hvac_modes: ['off', 'heat'], hvac_action: 'heating' },
    },
  };
}

interface BadgeView {
  roomKey: string;
  type: string;
  state: string;
  label: string;
  color: string;
  opacity: number;
  tex: string | null;
  entities: string[];
  centerX: number;
  centerY: number;
}

/** Читаем НАРИСОВАННОЕ: сами спрайты сцены, а не пересчёт тех же правил. */
function readBadges(page: Page): Promise<BadgeView[]> {
  return page.evaluate(() => {
    const sm = (window.BMS.card as any).sceneManager;
    return sm.climateBadgeGroup.children.map((sp: any) => ({
      roomKey: sp.userData.roomKey,
      type: sp.userData.badgeType,
      state: sp.userData.badgeState,
      label: sp.userData.badgeLabel,
      color: `#${sp.material.color.getHexString()}`,
      opacity: sp.material.opacity,
      tex: sp.material.map ? sp.material.map.uuid : null,
      entities: (sp.userData.badgeEntities ?? []) as string[],
      centerX: sp.center.x,
      centerY: sp.center.y,
    }));
  });
}

/** Ключ комнаты по её id-зоне (room-grouping добавляет к нему «#номер»). */
const roomKey = (all: BadgeView[], zoneId: string) =>
  all.filter((b) => b.roomKey.startsWith(`${zoneId}#`));

async function mount(page: Page): Promise<void> {
  await openHarness(page);
  await mountCard(page, { config: { plan: climatePlan() }, states: climateStates(), height: '640px' });
  await settleScene(page);
}

test.describe('Кружки климата у маркера комнаты', () => {
  test('кружок кондиционера есть только в комнате, где кондиционер ЕСТЬ', async ({ page }) => {
    await mount(page);
    const all = await readBadges(page);

    expect(roomKey(all, 'z_zal').map((b) => b.type), 'в зале только кондиционер').toEqual(['ac']);
    expect(
      all.filter((b) => b.type === 'ac').map((b) => b.roomKey.split('#')[0]).sort(),
      'кондиционер обязан появиться в зале и в кабинете — и больше нигде',
    ).toEqual(['z_kab', 'z_zal']);
    // Спальня — та самая проверка «нет кондиционера, нет и кружка».
    expect(
      roomKey(all, 'z_spal').map((b) => b.type),
      'в спальне кондиционера нет — и кружка кондиционера быть не должно',
    ).toEqual(['floor', 'heater']);

    // Диагностический список карточки обязан говорить то же, что нарисовано.
    const listed = await page.evaluate(() =>
      (window.BMS.card as any).sceneManager.climateBadges().map((b: any) => `${b.roomKey}|${b.type}|${b.state}`),
    );
    expect(listed.sort()).toEqual(all.map((b) => `${b.roomKey}|${b.type}|${b.state}`).sort());
  });

  test('горит, когда охлаждает; приглушён, когда включён, но простаивает', async ({ page }) => {
    await mount(page);
    const all = await readBadges(page);

    const ac = roomKey(all, 'z_zal')[0];
    expect(ac.state, 'hvac_action = cooling — кондиционер РАБОТАЕТ').toBe('active');
    expect(ac.label).toBe('Кондиционер');

    const konv = roomKey(all, 'z_spal').find((b) => b.type === 'heater')!;
    expect(konv.state, 'climate включён, но hvac_action = idle — прибор простаивает').toBe('idle');

    // ТОТ ЖЕ прибор начинает греть: сравниваем «простаивает» с «работает» на
    // одном устройстве, а не два разных кружка между собой.
    await page.evaluate(async () => {
      (window.BMS as any).setStates({
        'climate.konvektor_spalnia': { state: 'heat', attributes: { hvac_action: 'heating' } },
      });
      await new Promise((r) => setTimeout(r, 400));
    });
    const konvOn = roomKey(await readBadges(page), 'z_spal').find((b) => b.type === 'heater')!;
    expect(konvOn.state, 'hvac_action = heating — теперь работает').toBe('active');
    expect(konvOn.color, 'работающий кружок обязан гореть другим цветом').not.toBe(konv.color);
    expect(konv.opacity, 'простаивающий — приглушённый').toBeLessThan(konvOn.opacity);

    // Тот же прибор, три состояния подряд: работает → простаивает → выключен.
    const trail = await page.evaluate(async () => {
      const api = window.BMS as any;
      const sm = api.card.sceneManager;
      const acState = () =>
        sm.climateBadges().find((b: any) => b.roomKey.startsWith('z_zal#') && b.type === 'ac')?.state;
      const out = [acState()];
      api.setStates({ 'climate.kondicioner_zal': { state: 'cool', attributes: { hvac_action: 'idle' } } });
      await new Promise((r) => setTimeout(r, 400));
      out.push(acState());
      api.setStates({ 'climate.kondicioner_zal': { state: 'off', attributes: { hvac_action: 'off' } } });
      await new Promise((r) => setTimeout(r, 400));
      out.push(acState());
      return out;
    });
    expect(trail, 'охлаждает → добрал температуру → выключен').toEqual(['active', 'idle', 'off']);

    const off = (await readBadges(page)).find((b) => b.type === 'ac' && b.roomKey.startsWith('z_zal#'))!;
    expect(off.opacity, 'выключенный кружок — самый тусклый').toBeLessThan(konv.opacity);
  });

  test('тёплый пол и конвектор различимы между собой', async ({ page }) => {
    await mount(page);
    // Приводим ОБА к одному состоянию: тогда различить их можно только знаком,
    // а не «один горит, другой нет».
    await page.evaluate(async () => {
      (window.BMS as any).setStates({
        'climate.konvektor_spalnia': { state: 'heat', attributes: { hvac_action: 'heating' } },
      });
      await new Promise((r) => setTimeout(r, 400));
    });
    const spal = roomKey(await readBadges(page), 'z_spal');

    expect(spal.map((b) => b.type), 'два разных типа обогрева, а не один общий').toEqual(['floor', 'heater']);
    expect(spal.map((b) => b.state), 'оба реально греют').toEqual(['active', 'active']);
    expect(spal.map((b) => b.label)).toEqual(['Тёплый пол', 'Обогрев (конвектор, радиатор)']);
    expect(spal[0].tex, 'у тёплого пола свой знак, у конвектора свой').not.toBe(spal[1].tex);
    expect(spal[0].tex).toBeTruthy();
    // И стоят они рядом, под «домиком», а не друг на друге.
    expect(spal[0].centerX).not.toBe(spal[1].centerX);
    expect(spal[0].centerY, 'ряд кружков смещён ВНИЗ от маркера').toBeGreaterThan(1);
    expect(spal[0].centerY).toBe(spal[1].centerY);
  });

  test('без модели предмета тип берётся из hvac_modes живой сущности', async ({ page }) => {
    await mount(page);
    const kab = roomKey(await readBadges(page), 'z_kab');

    // Кабинет — зона без единой привязки к мебели: моделей нет вообще.
    expect(kab.map((b) => b.type), 'умеет охлаждать — кондиционер; только heat — обогрев').toEqual([
      'ac',
      'floor',
    ]);
    expect(kab.find((b) => b.type === 'ac')!.state, 'сплит выключен').toBe('off');
    expect(kab.find((b) => b.type === 'floor')!.state, 'пол греет').toBe('active');
  });

  test('типов больше, чем помещается в ряд — хвост сворачивается в один «Климат»', async ({ page }) => {
    // Пять типов сразу — редкий, но возможный случай. Ряд из пяти кружков под
    // маленьким «домиком» уже не читается, поэтому старшие остаются собой, а
    // хвост уходит в общий кружок; его состояние — самое «живое» из свёрнутых.
    await openHarness(page);
    await mountCard(page, {
      config: {
        plan: {
          name: 'Всё сразу',
          wallHeight: 2.7,
          floors: [{
            name: '1 Этаж', elevation: 0, wallHeight: 2.7,
            walls: boxWalls(8, 6),
            rooms: [{ name: 'Зал', polygon: [[0, 0], [8, 0], [8, 6], [0, 6]] }],
            furniture: [
              { id: 'ac', model: 'ac_unit', position: [1, 2.2, 1] },
              { id: 'pol', model: 'warm_floor', position: [3, 0, 1] },
              { id: 'konv', model: 'convector', position: [5, 0, 1] },
            ],
            zones: [{
              id: 'z_vse', name: 'Зал', x: 4, z: 3,
              entities: ['climate.ac', 'climate.pol', 'climate.konv', 'fan.vytyazhka', 'climate.termostat_5'],
            }],
            bindings: [
              { entity_id: 'climate.ac', anchor_object: 'ac', behavior: 'climate' },
              { entity_id: 'climate.pol', anchor_object: 'pol', behavior: 'climate' },
              { entity_id: 'climate.konv', anchor_object: 'konv', behavior: 'climate' },
            ],
          }],
        },
      },
      states: {
        'climate.ac': { state: 'cool', attributes: { hvac_modes: ['off', 'cool'], hvac_action: 'cooling' } },
        'climate.pol': { state: 'off', attributes: { hvac_modes: ['off', 'heat'] } },
        'climate.konv': { state: 'off', attributes: { hvac_modes: ['off', 'heat'] } },
        'fan.vytyazhka': { state: 'off', attributes: { friendly_name: 'Вытяжка' } },
        // Термостат без hvac_modes и без говорящего имени — общий «Климат».
        'climate.termostat_5': { state: 'heat', attributes: { friendly_name: 'Термостат 5' } },
      },
      height: '600px',
    });
    await settleScene(page);
    const all = await readBadges(page);

    expect(all.map((b) => b.type), 'ровно четыре кружка, последний — общий').toEqual([
      'ac', 'floor', 'heater', 'other',
    ]);
    const other = all[3];
    expect(other.entities.sort(), 'в общий свёрнуты вентиляция и неопознанный термостат').toEqual([
      'climate.termostat_5', 'fan.vytyazhka',
    ]);
    expect(other.state, 'термостат работает — общий кружок обязан гореть').toBe('active');
  });

  test('КОНТРОЛЬНАЯ: в комнате без климата кружков нет, включённое реле — не климат', async ({ page }) => {
    await mount(page);
    const all = await readBadges(page);

    expect(
      roomKey(all, 'z_klad'),
      'в кладовой только свет и голое реле — климата нет, кружков быть не должно',
    ).toEqual([]);
    expect(
      all.map((b) => b.type).sort(),
      'на всём этаже ровно пять кружков: зал 1, спальня 2, кабинет 2',
    ).toEqual(['ac', 'ac', 'floor', 'floor', 'heater']);
    expect(
      all.some((b) => b.entities.includes('switch.rele_kladovaia')),
      'включённое реле не имеет права попасть ни в один кружок',
    ).toBe(false);

    // Комнаты на месте — иначе «кружков нет» было бы верно и для пустой сцены.
    const rooms = await page.evaluate(() =>
      (window.BMS.card as any).sceneManager.getRooms().map((r: any) => r.key as string),
    );
    expect(rooms.length, 'четыре зоны обязаны существовать').toBe(4);
  });
});

// ---------------------------------------------------------------------------
// ЖИВОЙ ОБЪЕКТ ВЛАДЕЛЬЦА. Здесь нет придуманных id: всё ниже реально привязано
// в плане, и на этих трёх местах правило «домен решает» ошибалось.
//   • 13 из 14 `fan.*` объекта — `fan.*_konvektor`, вентилятор ВНУТРИ
//     конвектора: обогрев, а не вентиляция, и рядом с `climate.konvektor_*`
//     той же комнаты он обязан слиться в ОДИН кружок, а не встать вторым;
//   • `fan.kirish_sanuzel_spoty_ventiliatsiia_switch_2` — единственная
//     настоящая вентиляция: контрольная против «объявили все fan обогревом»;
//   • тёплые полы объекта висят на голых реле коллектора, и их спасает только
//     имя — при этом `switch.rele_3` без имени климатом быть не должен.
// ---------------------------------------------------------------------------

/** Кусок этажа владельца: кабинет с конвектором, санузел, гардеробная. */
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
        rooms: [{ name: 'Этаж', polygon: [[0, 0], [18, 0], [18, 10], [0, 10]] }],
        // Ни одного климатического предмета: на объекте эти сущности к мебели
        // не привязаны, и тип брать неоткуда, кроме домена и имени.
        furniture: [{ id: 'lampG', model: 'ceiling_light', position: [15, 2.5, 2] }],
        zones: [
          {
            id: 'z_kab1', name: 'Кабинет 1', x: 3, z: 2,
            entities: ['climate.konvektor_kabinet_1', 'fan.kabinet_1_konvektor', 'fan.kabinet_1_konvektor_2'],
          },
          // Конвектор без своей climate-сущности: остался один вентилятор.
          { id: 'z_res', name: 'Ресепшн', x: 8, z: 2, entities: ['fan.resepshn_3_konvektor'] },
          { id: 'z_kirish', name: 'Кириш санузел', x: 12, z: 2, entities: ['fan.kirish_sanuzel_spoty_ventiliatsiia_switch_2'] },
          {
            id: 'z_gard', name: 'Гардеробная', x: 15, z: 2,
            entities: [
              'switch.resepshn_kollektor_2_rele_1_switch_1',
              'switch.resepshn_kollektor_2_rele_1_switch_2',
              'switch.rele_3',
              'light.garderobnaia',
            ],
          },
        ],
        bindings: [{ entity_id: 'light.garderobnaia', anchor_object: 'lampG', behavior: 'light' }],
      },
    ],
  };
}

/** Состояния тех же сущностей — имена ровно те, что видит владелец в HA. */
function realStates(): Record<string, any> {
  return {
    'climate.konvektor_kabinet_1': {
      state: 'heat',
      attributes: { friendly_name: 'Конвектор кабинет 1', hvac_modes: ['off', 'heat'], hvac_action: 'heating' },
    },
    'fan.kabinet_1_konvektor': { state: 'on', attributes: { friendly_name: 'Вентилятор конвектора' } },
    'fan.kabinet_1_konvektor_2': { state: 'on', attributes: { friendly_name: 'Вентилятор конвектора 2' } },
    'fan.resepshn_3_konvektor': { state: 'on', attributes: { friendly_name: 'Вентилятор конвектора' } },
    'fan.kirish_sanuzel_spoty_ventiliatsiia_switch_2': { state: 'on', attributes: { friendly_name: 'Вентиляция' } },
    'switch.resepshn_kollektor_2_rele_1_switch_1': { state: 'on', attributes: { friendly_name: 'Тёплый пол' } },
    'switch.resepshn_kollektor_2_rele_1_switch_2': { state: 'off', attributes: { friendly_name: 'Тёплый пол санузла' } },
    // Реле без внятного имени: включено, и всё равно климатом быть не должно.
    'switch.rele_3': { state: 'on', attributes: { friendly_name: 'Реле 3' } },
    'light.garderobnaia': { state: 'off', attributes: { friendly_name: 'Свет гардеробной' } },
  };
}

async function mountReal(page: Page): Promise<void> {
  await openHarness(page);
  await mountCard(page, { config: { plan: realPlan() }, states: realStates(), height: '640px' });
  await settleScene(page);
}

test.describe('Кружки климата на живых сущностях объекта', () => {
  test('вентилятор конвектора — обогрев, и рядом с climate.konvektor_* он ОДИН кружок', async ({ page }) => {
    await mountReal(page);
    const all = await readBadges(page);

    const kab = roomKey(all, 'z_kab1');
    expect(
      kab.map((b) => b.type),
      'конвектор и два его вентилятора — один прибор, один кружок обогрева; бирюзовой «Вентиляции» в кабинете нет',
    ).toEqual(['heater']);
    expect(kab[0].label).toBe('Обогрев (конвектор, радиатор)');
    expect(
      kab[0].entities.slice().sort(),
      'вентиляторы не выброшены — они внутри того же кружка',
    ).toEqual(['climate.konvektor_kabinet_1', 'fan.kabinet_1_konvektor', 'fan.kabinet_1_konvektor_2']);

    // Отдельно: вентилятор конвектора — обогрев САМ ПО СЕБЕ, а не потому, что
    // рядом нашёлся climate.*. Иначе «прятать fan, если в комнате есть climate»
    // прошло бы за исправление.
    expect(
      roomKey(all, 'z_res').map((b) => b.type),
      'на ресепшне только вентилятор конвектора — и это обогрев, а не вентиляция',
    ).toEqual(['heater']);
    expect(
      all.some((b) => b.type === 'vent' && b.entities.some((e) => e.endsWith('_konvektor') || e.includes('_konvektor_'))),
      'ни один вентилятор конвектора не имеет права попасть в кружок вентиляции',
    ).toBe(false);
  });

  test('КОНТРОЛЬНАЯ: настоящая вентиляция осталась вентиляцией', async ({ page }) => {
    await mountReal(page);
    const kirish = roomKey(await readBadges(page), 'z_kirish');

    // Без этой проверки «объявим все fan обогревом» тоже стало бы зелёным.
    expect(
      kirish.map((b) => b.type),
      'fan.kirish_sanuzel_spoty_ventiliatsiia_switch_2 — единственная настоящая вентиляция объекта',
    ).toEqual(['vent']);
    expect(kirish[0].label).toBe('Вентиляция');
    expect(kirish[0].state, 'вентиляция включена — кружок горит').toBe('active');
  });

  test('реле, названное «Тёплый пол», даёт кружок; голое switch.rele_3 — ничего', async ({ page }) => {
    await mountReal(page);
    const all = await readBadges(page);
    const gard = roomKey(all, 'z_gard');

    expect(
      gard.map((b) => b.type),
      'в гардеробной климат только на реле коллектора — комната обязана получить кружок тёплого пола',
    ).toEqual(['floor']);
    expect(gard[0].label).toBe('Тёплый пол');
    expect(
      gard[0].entities.slice().sort(),
      'оба реле тёплого пола внутри кружка, и никого лишнего',
    ).toEqual([
      'switch.resepshn_kollektor_2_rele_1_switch_1',
      'switch.resepshn_kollektor_2_rele_1_switch_2',
    ]);
    expect(gard[0].state, 'первое реле включено — тёплый пол работает').toBe('active');

    // КОНТРОЛЬНАЯ половина: включённое реле без имени климатом не становится.
    expect(
      all.some((b) => b.entities.includes('switch.rele_3')),
      'switch.rele_3 включён, но он может быть чем угодно — кружка ему не положено',
    ).toBe(false);
    expect(
      all.some((b) => b.entities.includes('light.garderobnaia')),
      'свет — не климат',
    ).toBe(false);

    // Комнаты на месте: «кружка нет» не должно быть правдой из-за пустой сцены.
    const rooms = await page.evaluate(() =>
      (window.BMS.card as any).sceneManager.getRooms().map((r: any) => r.key as string),
    );
    expect(rooms.length, 'четыре зоны обязаны существовать').toBe(4);
  });
});
