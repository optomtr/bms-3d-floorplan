// ---------------------------------------------------------------------------
// Сборка библиотеки: все категории моделей в один справочник.
//
// ГЛАВНОЕ ПРАВИЛО. Порядок плиток в палитре редактора — это MODEL_ORDER ниже,
// а НЕ порядок ключей в объекте `builders`. Раньше порядок задавался тем, в
// каком месте одного огромного файла лежала запись; после разбивки по темам
// такой порядок перетасовался бы, и человек, который годами берёт «диван»
// третьим сверху, вдруг нашёл бы там что-то другое. Поэтому порядок вынесен в
// явный список и закреплён автопроверкой: список и `builders` обязаны совпадать
// ключ в ключ, иначе сборка падает.
//
// Добавляете модель — впишите её и в свой файл категории, и в MODEL_ORDER
// (в то место палитры, где человек ожидает её увидеть).
// ---------------------------------------------------------------------------

import type { FurnitureBuilder } from '../primitives';
import { seatingModels } from './seating';
import { bedroomModels } from './bedroom';
import { storageModels } from './storage';
import { kitchenModels } from './kitchen';
import { bathroomModels } from './bathroom';
import { lightingModels } from './lighting';
import { applianceModels } from './appliances';
import { openingModels } from './openings';
import { structureModels } from './structure';
import { outdoorModels } from './outdoor';
import { wellnessModels } from './wellness';
import { decorModels } from './decor';
import { tableModels } from './tables';

/** Порядок плиток в палитре — тот же, что был до разбивки файла на модули. */
export const MODEL_ORDER = [
  'sofa', 'sofa_round', 'bed', 'table', 'chair', 'swing', 'slide', 'round_table', 'roly_chair',
  'wardrobe', 'kitchen_counter', 'tv', 'fridge', 'sink', 'toilet', 'door', 'window_frame',
  'ceiling_light', 'ac_unit', 'intercom', 'armchair', 'coffee_table', 'dining_table',
  'dining_table_oval', 'bookshelf', 'desk', 'office_chair', 'nightstand', 'dresser', 'stove',
  'microwave', 'dishwasher', 'washing_machine', 'bathtub', 'bathtub_oval', 'cabinet_pair',
  'shower', 'mirror', 'plant', 'rug', 'stairs', 'stairs_down', 'stairs_switchback',
  'stairs_flat', 'column_sq', 'column_round', 'elevator', 'reception', 'canopy', 'car',
  'offroader', 'porch', 'urinal', 'curtain', 'curtain_single', 'curtain_short', 'curtain_sheer',
  'curtain_sheer_single', 'roller_blind', 'roman_blind', 'blind_bottomup', 'wall_cabinet',
  'glass_wall_cabinet', 'wall_switch', 'roof_lantern', 'pergola_retractable', 'terrace_parapet',
  'terrace_glass_parapet', 'terrace_stone_parapet', 'balustrade', 'cooktop', 'dish_rack',
  'track_light', 'lantern', 'led_panel', 'spotlight_bar', 'led_backlight', 'track_bar',
  'wall_light_double', 'sconce_pair', 'wall_sconce', 'air_purifier', 'treadmill',
  'exercise_bike', 'weight_bench', 'gym_machine', 'dumbbell_rack', 'swimming_pool',
  'fountain_pool', 'stone_planter', 'sauna_bench', 'sauna_heater', 'massage_table',
  'barber_chair', 'prayer_mat', 'painting', 'speaker', 'ceiling_speaker',
  'ceiling_speaker_double', 'security_camera', 'radiator', 'arch_shelf_wall', 'niche_shelf_wall',
  'feature_wall', 'floor_lamp', 'table_lamp', 'wall_light', 'chandelier', 'crystal_chandelier',
  'chandelier_double', 'crystal_chandelier_double', 'spotlight', 'pendant_light', 'led_strip',
  'track_double', 'wall_backlight', 'wall_backlight_double', 'wood_slat_panel', 'tv_wall',
  'boss_desk', 'double_door', 'garage_door', 'sliding_door', 'wall_panel', 'arch', 'bar_stool',
  'tv_stand', 'kitchen_island', 'sideboard', 'bunk_bed', 'bar_counter', 'piano', 'range_hood',
  'wall_clock', 'patio_door', 'terrace_window', 'terrace_wall', 'transom_window',
  'terrace_window_full', 'tall_cabinet', 'tv_console', 'climbing_wall', 'oven', 'kettle',
  'coffee_machine', 'toaster', 'blender', 'trash_can', 'wine_rack', 'recliner', 'ottoman',
  'console_table', 'fireplace', 'floor_vase', 'aquarium', 'pool_table', 'crib', 'vanity',
  'bench', 'ceiling_fan', 'ceiling_vent', 'warm_floor', 'convector', 'bidet', 'towel_rack',
  'bathroom_cabinet', 'dryer', 'filing_cabinet', 'monitor', 'printer', 'whiteboard', 'shoe_rack',
  'coat_rack', 'water_heater', 'books', 'vase', 'wall_shelf', 'wardrobe_glass',
  'display_cabinet', 'shelving_unit', 'wardrobe_lit', 'sofa_l', 'sofa_u', 'conference_chair',
  'tub_chair', 'conference_table', 'executive_desk', 'tree', 'shrub', 'sink_double', 'marker',
] as const;

/** Ключ встроенной модели. Опечатка в любом списке ключей ломает компиляцию. */
export type ModelKey = (typeof MODEL_ORDER)[number];

const allBuilders = {
  ...seatingModels,
  ...bedroomModels,
  ...storageModels,
  ...kitchenModels,
  ...bathroomModels,
  ...lightingModels,
  ...applianceModels,
  ...openingModels,
  ...structureModels,
  ...outdoorModels,
  ...wellnessModels,
  ...decorModels,
  ...tableModels,
};

/** Не даём завести модель, которой нет в MODEL_ORDER: иначе она молча выпала бы
 *  из палитры. Проверка чисто типовая, в бандл не попадает. */
function assertOrderCoversBuilders<_K extends ModelKey>(): void {}
assertOrderCoversBuilders<keyof typeof allBuilders>();

/** Все встроенные модели. Аннотация Record<ModelKey, …> ловит обратное: ключ
 *  есть в MODEL_ORDER, а сборщика к нему никто не написал. */
export const builders: Record<ModelKey, FurnitureBuilder> = allBuilders;
