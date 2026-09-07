// ---------------------------------------------------------------------------
// Русские названия моделей и разделов палитры.
//
// До этого подпись плитки собиралась регуляркой из ключа, и электрик видел в
// палитре «Roof Lantern», «Sofa L», «Ac Unit». Здесь названия такие, какими их
// произносят на объекте: «Диван угловой», «Шкаф-купе», «Кондиционер», «Люстра»,
// «Точечный светильник», «Светодиодная лента», «Унитаз», «Вытяжка».
//
// Названия — часть интерфейса, а не служебные строки: меняя их, помните, что
// человек ищет вещь глазами по первому слову. Поэтому «Стол обеденный», а не
// «Обеденный стол»: в списке сначала читается род вещи, потом уточнение.
//
// Ключ без названия не молчит: modelLabel() падает на старую регулярку, так что
// новая модель всё равно получит подпись — просто английскую, и это заметно.
// ---------------------------------------------------------------------------

import { MODEL_ORDER, type ModelKey } from './models';

/** Раздел палитры: заголовок и его модели в том порядке, в каком их показывать. */
export interface ModelCategory {
  id: string;
  label: string;
  keys: readonly ModelKey[];
}

/** Разделы палитры: все 190 моделей, которые человек может поставить.
 *  Служебной метки `marker` тут нет — её не ставят, ею подменяется модель с
 *  неизвестным ключом (см. FURNITURE_KEYS), но название у неё всё равно есть. */
export const MODEL_CATEGORIES: readonly ModelCategory[] = [
  {
    id: 'seating',
    label: 'Диваны и кресла',
    keys: ['sofa', 'sofa_l', 'sofa_u', 'sofa_round', 'armchair', 'recliner', 'roly_chair', 'tub_chair',
      'office_chair', 'conference_chair', 'chair', 'bar_stool', 'ottoman', 'bench'],
  },
  {
    id: 'tables',
    label: 'Столы и рабочие места',
    keys: ['table', 'dining_table', 'dining_table_oval', 'round_table', 'coffee_table', 'console_table',
      'desk', 'executive_desk', 'boss_desk', 'conference_table', 'reception'],
  },
  {
    id: 'bedroom',
    label: 'Спальня',
    keys: ['bed', 'bunk_bed', 'crib', 'nightstand', 'dresser', 'vanity'],
  },
  {
    id: 'storage',
    label: 'Хранение',
    keys: ['wardrobe', 'wardrobe_glass', 'wardrobe_lit', 'tall_cabinet', 'display_cabinet', 'shelving_unit',
      'bookshelf', 'wall_shelf', 'wall_cabinet', 'glass_wall_cabinet', 'sideboard', 'tv_stand', 'tv_console',
      'filing_cabinet', 'wine_rack', 'shoe_rack', 'coat_rack', 'arch_shelf_wall', 'niche_shelf_wall', 'books'],
  },
  {
    id: 'kitchen',
    label: 'Кухня',
    keys: ['kitchen_counter', 'kitchen_island', 'bar_counter', 'cooktop', 'oven', 'stove', 'range_hood',
      'fridge', 'dishwasher', 'microwave', 'coffee_machine', 'kettle', 'toaster', 'blender', 'dish_rack', 'trash_can'],
  },
  {
    id: 'bathroom',
    label: 'Ванная и санузел',
    keys: ['sink', 'sink_double', 'toilet', 'bidet', 'urinal', 'bathtub', 'bathtub_oval', 'shower',
      'bathroom_cabinet', 'towel_rack', 'washing_machine', 'dryer', 'water_heater'],
  },
  {
    id: 'lighting',
    label: 'Освещение',
    keys: ['ceiling_light', 'pendant_light', 'chandelier', 'chandelier_double', 'crystal_chandelier',
      'crystal_chandelier_double', 'spotlight', 'spotlight_bar', 'led_panel', 'led_strip', 'led_backlight',
      'track_light', 'track_bar', 'track_double', 'wall_light', 'wall_light_double', 'wall_sconce', 'sconce_pair',
      'wall_backlight', 'wall_backlight_double', 'cabinet_pair', 'floor_lamp', 'table_lamp', 'lantern'],
  },
  {
    id: 'appliances',
    label: 'Техника и медиа',
    keys: ['tv', 'tv_wall', 'monitor', 'printer', 'speaker', 'ceiling_speaker', 'ceiling_speaker_double',
      'ac_unit', 'convector', 'radiator', 'warm_floor', 'ceiling_fan', 'ceiling_vent', 'air_purifier',
      'security_camera', 'intercom', 'wall_switch', 'whiteboard'],
  },
  {
    id: 'openings',
    label: 'Двери и остекление',
    keys: ['door', 'double_door', 'sliding_door', 'patio_door', 'garage_door', 'window_frame', 'terrace_window',
      'terrace_window_full', 'transom_window', 'roof_lantern', 'curtain', 'curtain_single', 'curtain_short',
      'curtain_sheer', 'curtain_sheer_single', 'roller_blind', 'roman_blind', 'blind_bottomup'],
  },
  {
    id: 'structure',
    label: 'Лестницы и конструктив',
    keys: ['stairs', 'stairs_down', 'stairs_switchback', 'stairs_flat', 'elevator', 'column_sq', 'column_round',
      'arch', 'wall_panel', 'wood_slat_panel', 'feature_wall', 'terrace_wall', 'climbing_wall', 'porch', 'canopy'],
  },
  {
    id: 'outdoor',
    label: 'Улица и терраса',
    keys: ['terrace_parapet', 'terrace_glass_parapet', 'terrace_stone_parapet', 'balustrade', 'pergola_retractable',
      'fountain_pool', 'stone_planter', 'tree', 'shrub', 'swing', 'slide', 'car', 'offroader'],
  },
  {
    id: 'wellness',
    label: 'Спорт и здоровье',
    keys: ['treadmill', 'exercise_bike', 'weight_bench', 'gym_machine', 'dumbbell_rack', 'swimming_pool',
      'sauna_bench', 'sauna_heater', 'massage_table', 'barber_chair', 'prayer_mat'],
  },
  {
    id: 'decor',
    label: 'Декор',
    keys: ['painting', 'mirror', 'wall_clock', 'plant', 'rug', 'vase', 'floor_vase', 'aquarium', 'fireplace',
      'piano', 'pool_table'],
  },
];

/** Ключ модели → как её называют на объекте. */
export const MODEL_NAMES: Record<ModelKey, string> = {
  // ---- Диваны и кресла ----
  sofa: 'Диван',
  sofa_l: 'Диван угловой',
  sofa_u: 'Диван П-образный',
  sofa_round: 'Диван полукруглый',
  armchair: 'Кресло',
  recliner: 'Кресло-реклайнер',
  roly_chair: 'Кресло мягкое круглое',
  tub_chair: 'Кресло-ракушка',
  office_chair: 'Кресло офисное',
  conference_chair: 'Стул для переговорной',
  chair: 'Стул',
  bar_stool: 'Табурет барный',
  ottoman: 'Пуф',
  bench: 'Скамья',

  // ---- Столы и рабочие места ----
  table: 'Стол',
  dining_table: 'Стол обеденный',
  dining_table_oval: 'Стол обеденный овальный',
  round_table: 'Стол круглый',
  coffee_table: 'Столик журнальный',
  console_table: 'Стол-консоль',
  desk: 'Стол письменный',
  executive_desk: 'Стол руководителя',
  boss_desk: 'Стол руководителя угловой',
  conference_table: 'Стол переговорный',
  reception: 'Стойка ресепшн',

  // ---- Спальня ----
  bed: 'Кровать',
  bunk_bed: 'Кровать двухъярусная',
  crib: 'Кроватка детская',
  nightstand: 'Тумба прикроватная',
  dresser: 'Комод',
  vanity: 'Столик туалетный',

  // ---- Хранение ----
  wardrobe: 'Шкаф-купе',
  wardrobe_glass: 'Шкаф со стеклянными дверями',
  wardrobe_lit: 'Шкаф с подсветкой',
  tall_cabinet: 'Шкаф-пенал',
  display_cabinet: 'Витрина',
  shelving_unit: 'Стеллаж',
  bookshelf: 'Полка книжная',
  wall_shelf: 'Полка настенная',
  wall_cabinet: 'Шкаф навесной',
  glass_wall_cabinet: 'Шкаф навесной со стеклом',
  sideboard: 'Буфет',
  tv_stand: 'Тумба под телевизор',
  tv_console: 'Тумба ТВ длинная',
  filing_cabinet: 'Шкаф картотечный',
  wine_rack: 'Стеллаж винный',
  shoe_rack: 'Обувница',
  coat_rack: 'Вешалка напольная',
  arch_shelf_wall: 'Стена с арочными нишами',
  niche_shelf_wall: 'Стена с нишами',
  books: 'Стопка книг',

  // ---- Кухня ----
  kitchen_counter: 'Тумба кухонная',
  kitchen_island: 'Остров кухонный',
  bar_counter: 'Стойка барная',
  cooktop: 'Варочная панель',
  oven: 'Духовой шкаф',
  stove: 'Плита',
  range_hood: 'Вытяжка',
  fridge: 'Холодильник',
  dishwasher: 'Посудомоечная машина',
  microwave: 'Микроволновая печь',
  coffee_machine: 'Кофемашина',
  kettle: 'Чайник',
  toaster: 'Тостер',
  blender: 'Блендер',
  dish_rack: 'Сушилка для посуды',
  trash_can: 'Мусорное ведро',

  // ---- Ванная и санузел ----
  sink: 'Раковина',
  sink_double: 'Раковина двойная',
  toilet: 'Унитаз',
  bidet: 'Биде',
  urinal: 'Писсуар',
  bathtub: 'Ванна',
  bathtub_oval: 'Ванна овальная',
  shower: 'Душевая кабина',
  bathroom_cabinet: 'Шкафчик в ванную',
  towel_rack: 'Полотенцесушитель',
  washing_machine: 'Стиральная машина',
  dryer: 'Сушильная машина',
  water_heater: 'Водонагреватель',

  // ---- Освещение ----
  ceiling_light: 'Светильник потолочный',
  pendant_light: 'Светильник подвесной',
  chandelier: 'Люстра',
  chandelier_double: 'Люстры (набор)',
  crystal_chandelier: 'Люстра хрустальная',
  crystal_chandelier_double: 'Люстры хрустальные (набор)',
  spotlight: 'Точечный светильник',
  spotlight_bar: 'Точечные светильники (набор)',
  led_panel: 'Светодиодная панель',
  led_strip: 'Светодиодная лента',
  led_backlight: 'Светодиодный контур',
  track_light: 'Трековый светильник',
  track_bar: 'Трековая шина',
  track_double: 'Трековые светильники (два ряда)',
  wall_light: 'Светильник настенный',
  wall_light_double: 'Светильники настенные (набор)',
  wall_sconce: 'Бра',
  sconce_pair: 'Бра (набор)',
  wall_backlight: 'Подсветка настенная',
  wall_backlight_double: 'Подсветка настенная (набор)',
  cabinet_pair: 'Витрины с подсветкой (набор)',
  floor_lamp: 'Торшер',
  table_lamp: 'Лампа настольная',
  lantern: 'Фонарь',

  // ---- Техника и медиа ----
  tv: 'Телевизор',
  tv_wall: 'ТВ-стена',
  monitor: 'Монитор',
  printer: 'Принтер',
  speaker: 'Колонка',
  ceiling_speaker: 'Колонка потолочная',
  ceiling_speaker_double: 'Колонки потолочные (набор)',
  ac_unit: 'Кондиционер',
  convector: 'Конвектор',
  radiator: 'Радиатор отопления',
  warm_floor: 'Тёплый пол',
  ceiling_fan: 'Вентилятор потолочный',
  ceiling_vent: 'Решётка вентиляционная',
  air_purifier: 'Очиститель воздуха',
  security_camera: 'Камера видеонаблюдения',
  intercom: 'Домофон',
  wall_switch: 'Выключатель',
  whiteboard: 'Доска маркерная',

  // ---- Двери и остекление ----
  door: 'Дверь',
  double_door: 'Дверь двустворчатая',
  sliding_door: 'Дверь раздвижная',
  patio_door: 'Дверь на террасу',
  garage_door: 'Ворота гаражные',
  window_frame: 'Окно',
  terrace_window: 'Окно панорамное',
  terrace_window_full: 'Остекление панорамное',
  transom_window: 'Фрамуга',
  roof_lantern: 'Фонарь зенитный',
  curtain: 'Шторы',
  curtain_single: 'Штора одинарная',
  curtain_short: 'Штора короткая',
  curtain_sheer: 'Тюль',
  curtain_sheer_single: 'Тюль одинарный',
  roller_blind: 'Штора рулонная',
  roman_blind: 'Штора римская',
  blind_bottomup: 'Штора снизу вверх',

  // ---- Лестницы и конструктив ----
  stairs: 'Лестница',
  stairs_down: 'Лестница вниз',
  stairs_switchback: 'Лестница с разворотом',
  stairs_flat: 'Лестница (план)',
  elevator: 'Лифт',
  column_sq: 'Колонна квадратная',
  column_round: 'Колонна круглая',
  arch: 'Арка',
  wall_panel: 'Панель стеновая',
  wood_slat_panel: 'Панель реечная',
  feature_wall: 'Стена акцентная с подсветкой',
  terrace_wall: 'Стена террасы',
  climbing_wall: 'Скалодром',
  porch: 'Крыльцо',
  canopy: 'Навес',

  // ---- Улица и терраса ----
  terrace_parapet: 'Парапет террасы',
  terrace_glass_parapet: 'Парапет со стеклом',
  terrace_stone_parapet: 'Парапет каменный',
  balustrade: 'Балюстрада',
  pergola_retractable: 'Пергола раздвижная',
  fountain_pool: 'Фонтан',
  stone_planter: 'Кашпо каменное',
  tree: 'Дерево',
  shrub: 'Кустарник',
  swing: 'Качели',
  slide: 'Горка детская',
  car: 'Легковой автомобиль',
  offroader: 'Внедорожник',

  // ---- Спорт и здоровье ----
  treadmill: 'Беговая дорожка',
  exercise_bike: 'Велотренажёр',
  weight_bench: 'Скамья для жима',
  gym_machine: 'Тренажёр силовой',
  dumbbell_rack: 'Стойка для гантелей',
  swimming_pool: 'Бассейн',
  sauna_bench: 'Полок для сауны',
  sauna_heater: 'Печь для сауны',
  massage_table: 'Стол массажный',
  barber_chair: 'Кресло парикмахерское',
  prayer_mat: 'Молитвенный коврик',

  // ---- Декор ----
  painting: 'Картина',
  mirror: 'Зеркало',
  wall_clock: 'Часы настенные',
  plant: 'Растение',
  rug: 'Ковёр',
  vase: 'Ваза',
  floor_vase: 'Ваза напольная',
  aquarium: 'Аквариум',
  fireplace: 'Камин',
  piano: 'Пианино',
  pool_table: 'Стол бильярдный',
  marker: 'Метка',
};

/** Старый способ подписи: из ключа регуляркой. Остаётся запасным вариантом —
 *  чужой или только что заведённый ключ получит хоть какую-то подпись. */
function keyAsLabel(key: string): string {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
}

/** Название модели по-русски. Для неизвестного ключа — прежняя подпись из ключа. */
export function modelLabel(key: string): string {
  return MODEL_NAMES[key as ModelKey] ?? keyAsLabel(key);
}

const CATEGORY_OF = new Map<string, ModelCategory>();
for (const cat of MODEL_CATEGORIES) for (const key of cat.keys) CATEGORY_OF.set(key, cat);

/** Раздел палитры, в котором лежит модель (null — если ключ не наш). */
export function modelCategory(key: string): ModelCategory | null {
  return CATEGORY_OF.get(key) ?? null;
}

/** Заголовок раздела по его id (пустая строка — если раздела нет). */
export function categoryLabel(id: string): string {
  return MODEL_CATEGORIES.find((cat) => cat.id === id)?.label ?? '';
}

// Разделы обязаны покрывать все ставимые модели ровно по разу: раздел — это то,
// что человек видит вместо плоского списка из 190 плиток, и пропавшая плитка
// означает вещь, которую на объекте больше не найти. Проверка стоит на загрузке
// модуля: тихо потерять плитку нельзя.
const _placeable = MODEL_ORDER.filter((key) => key !== 'marker');
const _covered = MODEL_CATEGORIES.flatMap((cat) => cat.keys);
if (_covered.length !== _placeable.length || new Set(_covered).size !== _placeable.length)
  throw new Error(
    `furniture/names: разделы покрывают ${new Set(_covered).size} моделей из ${_placeable.length}`,
  );
