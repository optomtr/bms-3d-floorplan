// ---------------------------------------------------------------------------
// След предмета на полу и его русское имя.
//
// Таблица размеров заведомо неполная и это нормально: незнакомая модель
// рисуется квадратом 60×60 см. Палитра живёт в оболочке, она и знает полный
// список.
//
// Имена — другое дело. Короткая подпись отсюда нужна тесноте чертежа («Стол
// раб.»), но если ключа здесь нет, человек не должен читать «wall_sconce»: за
// названием идём в общий справочник furniture/names.ts. Он тянет за собой
// models/*, то есть three.js, — и это не новая цена: движок уже связан с ним
// через editor/geometry.ts (посадка на стену считается там же, где в старом
// редакторе, и второй копии этой математики быть не должно).
// ---------------------------------------------------------------------------

import { modelLabel } from '../furniture/names';

/** [ширина, глубина] в метрах. Ширина — поперёк «лица» модели. */
const FOOT: Record<string, [number, number]> = {
  sofa: [2.0, 0.9],
  sofa_l: [2.4, 1.6],
  sofa_u: [2.6, 2.2],
  sofa_round: [2.0, 1.2],
  armchair: [0.9, 0.9],
  recliner: [0.95, 1.0],
  roly_chair: [0.9, 0.9],
  tub_chair: [0.8, 0.8],
  office_chair: [0.6, 0.6],
  conference_chair: [0.55, 0.55],
  chair: [0.45, 0.45],
  bar_stool: [0.4, 0.4],
  ottoman: [0.6, 0.6],
  bench: [1.4, 0.4],
  table: [1.2, 0.8],
  dining_table: [1.8, 0.9],
  dining_table_oval: [2.0, 1.0],
  coffee_table: [1.1, 0.6],
  desk: [1.4, 0.7],
  side_table: [0.5, 0.5],
  bed: [1.6, 2.0],
  bed_single: [0.9, 2.0],
  bed_double: [1.8, 2.05],
  bed_king: [2.0, 2.1],
  crib: [0.7, 1.3],
  wardrobe: [1.8, 0.6],
  dresser: [1.2, 0.5],
  nightstand: [0.45, 0.4],
  bookshelf: [0.9, 0.35],
  cabinet: [1.0, 0.45],
  kitchen_counter: [1.2, 0.6],
  kitchen_island: [1.8, 0.9],
  fridge: [0.7, 0.7],
  stove: [0.6, 0.6],
  oven: [0.6, 0.6],
  dishwasher: [0.6, 0.6],
  sink: [0.6, 0.5],
  washer: [0.6, 0.6],
  toilet: [0.4, 0.7],
  bathtub: [1.7, 0.75],
  shower: [0.9, 0.9],
  tv: [1.2, 0.1],
  door: [0.9, 0.1],
  double_door: [1.6, 0.1],
  sliding_door: [1.7, 0.1],
  window_frame: [1.2, 0.1],
  terrace_window: [2.4, 0.12],
  garage_door: [2.6, 0.2],
  plant: [0.5, 0.5],
  rug: [2.0, 1.4],
  ceiling_light: [0.4, 0.4],
  spotlight_bar: [1.0, 0.1],
  radiator: [0.9, 0.12],
  ac_indoor: [0.9, 0.2],
  camera: [0.15, 0.15],
  switch_panel: [0.09, 0.02],
  socket: [0.09, 0.02],
  sensor: [0.1, 0.1],
  stairs: [1.0, 2.4],
};

/** Короткое русское имя для подписи на плане. Ключи, которых здесь нет,
 *  подписываются собственным ключом — это честнее выдуманного перевода. */
const LABEL: Record<string, string> = {
  sofa: 'Диван',
  sofa_l: 'Диван угл.',
  sofa_u: 'Диван П',
  sofa_round: 'Диван круг.',
  armchair: 'Кресло',
  recliner: 'Реклайнер',
  roly_chair: 'Кресло',
  tub_chair: 'Кресло',
  office_chair: 'Кресло офис.',
  conference_chair: 'Стул',
  chair: 'Стул',
  bar_stool: 'Табурет',
  ottoman: 'Пуф',
  bench: 'Скамья',
  table: 'Стол',
  dining_table: 'Стол обед.',
  dining_table_oval: 'Стол овал.',
  coffee_table: 'Стол журн.',
  desk: 'Стол раб.',
  side_table: 'Столик',
  bed: 'Кровать',
  bed_single: 'Кровать 1-сп.',
  bed_double: 'Кровать 2-сп.',
  bed_king: 'Кровать king',
  crib: 'Кроватка',
  wardrobe: 'Шкаф',
  dresser: 'Комод',
  nightstand: 'Тумба',
  bookshelf: 'Стеллаж',
  cabinet: 'Шкафчик',
  kitchen_counter: 'Кухня',
  kitchen_island: 'Остров',
  fridge: 'Холодильник',
  stove: 'Плита',
  oven: 'Духовка',
  dishwasher: 'Посудомойка',
  sink: 'Мойка',
  washer: 'Стиральная',
  toilet: 'Унитаз',
  bathtub: 'Ванна',
  shower: 'Душ',
  tv: 'Телевизор',
  door: 'Дверь',
  double_door: 'Дверь двойн.',
  sliding_door: 'Дверь купе',
  window_frame: 'Окно',
  terrace_window: 'Окно панор.',
  garage_door: 'Ворота',
  plant: 'Растение',
  rug: 'Ковёр',
  ceiling_light: 'Светильник',
  spotlight_bar: 'Трек',
  radiator: 'Радиатор',
  ac_indoor: 'Кондиционер',
  camera: 'Камера',
  switch_panel: 'Выключатель',
  socket: 'Розетка',
  sensor: 'Датчик',
  stairs: 'Лестница',
};

/** Размер следа модели на полу; незнакомая — 60×60 см. */
export function footprint(model: string): [number, number] {
  return FOOT[model] ?? [0.6, 0.6];
}

/** Подпись на плане. Короткое имя отсюда — для тесноты чертежа; всё остальное
 *  берём из общего справочника названий, чтобы человек не читал в строке
 *  состояния «wall_sconce вешается на стену». */
export function modelName(model: string): string {
  return LABEL[model] ?? modelLabel(model);
}
