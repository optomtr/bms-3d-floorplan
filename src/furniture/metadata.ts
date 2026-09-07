// ---------------------------------------------------------------------------
// Свойства моделей: где вешать, чем красить, что можно привязать.
//
// Здесь только справочные данные о встроенных моделях — сама геометрия лежит в
// ./models/*. Все списки ключей типизированы как ModelKey[], поэтому опечатка
// («ceiling_ligth») ломает компиляцию, а не тихо выключает поведение у модели.
// ---------------------------------------------------------------------------

import * as THREE from 'three';
import type { BuildOpts } from './primitives';
import { builders, MODEL_ORDER, type ModelKey } from './models';

/** Список ключей моделей: литерал проверяется компилятором, наружу отдаётся
 *  обычным string[] — карточка и редактор ищут в нём произвольные строки. */
function modelKeys(list: ModelKey[]): string[] {
  return list;
}

/** Порядок плиток в палитре. Задан явным списком MODEL_ORDER, а не порядком
 *  записей в объекте: см. комментарий в models/index.ts. */
export const FURNITURE_KEYS: string[] = MODEL_ORDER.filter((k) => k !== 'marker');

/** Models that should auto-attach to a wall when placed (snap + orient). */
export const WALL_MOUNT_KEYS = modelKeys([
  'door', 'double_door', 'sliding_door', 'window_frame', 'patio_door',
  'terrace_window', 'tv', 'painting', 'mirror', 'wall_light', 'wall_clock',
  'ac_unit', 'intercom', 'security_camera', 'curtain', 'range_hood',
  'towel_rack', 'bathroom_cabinet', 'whiteboard', 'wall_shelf',
  'curtain_sheer', 'curtain_sheer_single', 'roller_blind', 'roman_blind', 'wall_cabinet', 'wall_sconce',
  'curtain_single', 'urinal', 'sink_double', 'blind_bottomup', 'garage_door',
  'wood_slat_panel', 'wall_backlight', 'tall_cabinet', 'terrace_window_full', 'climbing_wall',
  'wall_light_double', 'sconce_pair', 'glass_wall_cabinet', 'wall_backlight_double', 'wall_switch',
  'transom_window', 'curtain_short',
]);
export function isWallMount(model: string): boolean {
  return WALL_MOUNT_KEYS.includes(model);
}

/** Wall-mount models that sit ON the room-side surface of the wall (offset out
 *  so they're not buried in the wall). Doors/windows/curtains sit in-plane. */
export const SURFACE_MOUNT_KEYS = modelKeys([
  'tv', 'painting', 'mirror', 'wall_light', 'wall_clock', 'ac_unit',
  'intercom', 'security_camera', 'range_hood', 'terrace_window',
  'towel_rack', 'bathroom_cabinet', 'whiteboard', 'wall_shelf', 'wall_cabinet',
  'curtain', 'curtain_sheer', 'curtain_sheer_single', 'roller_blind', 'roman_blind', 'wall_sconce',
  'curtain_single', 'urinal', 'sink_double', 'blind_bottomup',
  'wood_slat_panel', 'wall_backlight', 'tall_cabinet', 'terrace_window_full', 'climbing_wall',
  'wall_light_double', 'sconce_pair', 'glass_wall_cabinet', 'wall_backlight_double', 'wall_switch',
]);
export function isSurfaceMount(model: string): boolean {
  return SURFACE_MOUNT_KEYS.includes(model);
}

/** How many independently-bindable opening vents a model exposes. roof_lantern
 *  has two (each its own `cover`); 0 means a single binding drives the whole. */
export function ventCount(model: string): number {
  return model === 'roof_lantern' ? 2 : 0;
}

/** Lighting fixtures (have an emissive mesh; bind a light.* entity to them). */
export const LIGHT_KEYS = modelKeys([
  'ceiling_light',
  'floor_lamp',
  'table_lamp',
  'wall_light',
  'chandelier',
  'crystal_chandelier',
  'spotlight',
  'pendant_light',
  'led_strip',
  'track_light',
  'lantern',
  'led_panel',
  'spotlight_bar',
  'led_backlight',
  'track_bar',
  'wall_sconce',
  'track_double',
  'wall_backlight',
  'wall_light_double',
  'sconce_pair',
  'chandelier_double',
  'crystal_chandelier_double',
  'cabinet_pair',
  'wall_backlight_double',
]);

/**
 * Likely Home Assistant entity domains for a furniture model, used to filter the
 * entity picker when binding (so selecting a lamp offers light.* entities, an AC
 * offers climate.*, a TV offers media_player, a curtain offers cover, …).
 * Returns [] to mean "no filter — show all entities".
 */
const CLIMATE_LIKE = ['climate', 'fan', 'switch', 'sensor'];
const HEATING = ['climate', 'switch', 'sensor']; // allow binding a floor-temp sensor
const GLOWING_JOINERY = ['light', 'switch']; // the cove-light strips glow when bound
const FAN_LIKE = ['fan', 'switch'];
const MEDIA = ['media_player', 'switch'];
const COVER = ['cover'];
const DOOR_LIKE = ['lock', 'cover', 'binary_sensor'];
const WHITE_GOODS = ['switch', 'sensor', 'binary_sensor'];
const PLUMBING = ['sensor', 'binary_sensor', 'switch'];

const ENTITY_DOMAINS: Partial<Record<ModelKey, string[]>> = {
  ac_unit: CLIMATE_LIKE,
  convector: CLIMATE_LIKE,
  warm_floor: HEATING,
  radiator: HEATING,
  niche_shelf_wall: GLOWING_JOINERY,
  feature_wall: GLOWING_JOINERY,
  glass_wall_cabinet: GLOWING_JOINERY,
  // A neutral control anchor: allow ONLY behaviours that cause no visual change
  // on an emissive-less model (a switch toggle, a media/AC "pult", a cover).
  // Excludes light (adds a point light), fan (spins), sensor/binary_sensor/lock
  // (float a label) — so the plate never reacts on state.
  wall_switch: ['switch', 'media_player', 'climate', 'cover'],
  ceiling_fan: FAN_LIKE,
  ceiling_vent: FAN_LIKE,
  wardrobe_lit: GLOWING_JOINERY,
  tv: MEDIA,
  tv_stand: MEDIA,
  speaker: MEDIA,
  ceiling_speaker: MEDIA,
  ceiling_speaker_double: MEDIA,
  air_purifier: FAN_LIKE,
  fountain_pool: ['switch', 'light'], // the pump, and any underwater lighting
  curtain: COVER,
  curtain_single: COVER,
  curtain_sheer: COVER,
  curtain_sheer_single: COVER,
  roller_blind: COVER,
  roman_blind: COVER,
  blind_bottomup: COVER,
  garage_door: COVER,
  roof_lantern: COVER,
  pergola_retractable: COVER,
  transom_window: COVER,
  curtain_short: COVER,
  door: DOOR_LIKE,
  double_door: DOOR_LIKE,
  sliding_door: DOOR_LIKE,
  security_camera: ['camera', 'binary_sensor'],
  intercom: ['camera', 'lock', 'binary_sensor'],
  fridge: WHITE_GOODS,
  washing_machine: WHITE_GOODS,
  dishwasher: WHITE_GOODS,
  stove: WHITE_GOODS,
  oven: WHITE_GOODS,
  microwave: WHITE_GOODS,
  toilet: PLUMBING,
  bathtub: PLUMBING,
  shower: PLUMBING,
  sink: PLUMBING,
};

export function entityDomainsFor(model: string): string[] {
  if (LIGHT_KEYS.includes(model)) return ['light', 'switch'];
  const domains = ENTITY_DOMAINS[model as ModelKey];
  return domains ? domains.slice() : [];
}

/** Насколько НИЖЕ потолка висит модель (метры). Всё, что крепится к потолку. */
const Y_BELOW_CEILING: Partial<Record<ModelKey, number>> = {
  ceiling_light: 0.05, chandelier: 0.05, crystal_chandelier: 0.05,
  chandelier_double: 0.05, crystal_chandelier_double: 0.05, pendant_light: 0.05,
  spotlight: 0.02, led_strip: 0.02, led_panel: 0.02, track_light: 0.02,
  spotlight_bar: 0.02, led_backlight: 0.02, track_bar: 0.02, track_double: 0.02,
  ceiling_speaker: 0.02, ceiling_speaker_double: 0.02,
  ceiling_fan: 0.25,
  ceiling_vent: 0.02,
  roof_lantern: 0, pergola_retractable: 0, // ceiling-level canopy
  transom_window: 0.42, // clerestory band under the ceiling
  curtain_short: 0.78,  // hangs over that band
};

/** Постоянная высота от пола (метры) — настенные и напольные модели. */
const Y_FIXED: Partial<Record<ModelKey, number>> = {
  wall_sconce: 1.6, sconce_pair: 1.6,
  wall_light_double: 1.8,
  wall_cabinet: 1.55,
  glass_wall_cabinet: 1.4, // upper cabinet, origin at its base
  wall_switch: 1.15,       // switch height, centered at origin
  wall_light: 2.0, ac_unit: 2.0, security_camera: 2.0,
  bathroom_cabinet: 1.5, whiteboard: 1.5,
  wall_shelf: 1.4,
  painting: 1.4, mirror: 1.4, tv: 1.4, intercom: 1.4,
  towel_rack: 1.1,
  terrace_window: 1.2,
  wall_clock: 1.7,
  range_hood: 1.6,
  curtain: 0.1, curtain_single: 0.1, curtain_sheer: 0.1, curtain_sheer_single: 0.1,
  roller_blind: 0.1, roman_blind: 0.1, blind_bottomup: 0.1,
  urinal: 0.55,
  sink_double: 0.8,
};

/** Default vertical offset (meters) so a placed piece sits naturally. Lights
 *  default to near the ceiling; everything else on the floor. */
export function defaultY(model: string, wallHeight = 2.6): number {
  const key = model as ModelKey;
  const below = Y_BELOW_CEILING[key];
  if (below !== undefined) return wallHeight - below;
  return Y_FIXED[key] ?? 0;
}

/**
 * Realistic default tint per model, so a freshly-placed piece (and its palette
 * thumbnail) looks natural instead of flat white. The builder tints its main
 * surface with this; fixed materials (wood frames, metal legs, glass) keep their
 * own look. The user can still override the color per placement.
 */
const DEFAULT_COLORS: Partial<Record<ModelKey, string>> = {
  // Upholstery / fabric
  sofa: '#7d8a99', sofa_round: '#7d8a99', armchair: '#8a7c72', recliner: '#6b7682',
  ottoman: '#8a7c72', bench: '#9a8c7c',
  // Beds / soft
  bed: '#e9e4da', bunk_bed: '#e3ded4', crib: '#e9e4da',
  // Wood furniture
  table: '#9c6b3f', dining_table: '#9c6b3f', coffee_table: '#9c6b3f',
  console_table: '#9c6b3f', desk: '#9c6b3f', chair: '#9c6b3f', office_chair: '#3a3e44',
  bar_stool: '#9c6b3f', stairs: '#b08a5a', stairs_down: '#b08a5a', wall_shelf: '#9c6b3f', door: '#9c6b3f',
  swing: '#8a6a4a', slide: '#dcc5a0', round_table: '#e9e2d5', roly_chair: '#9aa878',
  stairs_switchback: '#b08a5a', stairs_flat: '#9c6b3f', column_sq: '#d8d2c6', column_round: '#d8d2c6',
  elevator: '#e8eaec', reception: '#9c6b3f', canopy: '#d8d8dc', car: '#30506e', offroader: '#0c0c0e', porch: '#d7d2c8',
  double_door: '#9c6b3f', sliding_door: '#b8c4cc', // sliding door's tinted part is glass → keep it glassy
  // Cabinetry (darker wood)
  wardrobe: '#8a5a34', wardrobe_glass: '#7a4f2e', wardrobe_lit: '#7a4f2e',
  display_cabinet: '#7a4f2e', shelving_unit: '#8a5a34', dresser: '#8a5a34',
  nightstand: '#8a5a34', sideboard: '#8a5a34', bookshelf: '#8a5a34',
  filing_cabinet: '#7a8088', shoe_rack: '#8a5a34', tv_stand: '#5b3f28',
  vanity: '#cdbba8', wine_rack: '#7a4f2e', coat_rack: '#8a5a34', books: '#8a5a34',
  // Kitchen
  kitchen_counter: '#ececec', kitchen_island: '#ececec', wall_cabinet: '#eceae6',
  bar_counter: '#caa37a', cooktop: '#2b2f36',
  // Appliances (stainless / white goods)
  fridge: '#c6cace', washing_machine: '#dfe3e6', dishwasher: '#c6cace',
  oven: '#c6cace', microwave: '#cfd3d7', stove: '#c6cace', dryer: '#dfe3e6',
  range_hood: '#c6cace', dish_rack: '#cfd3d7', kettle: '#cfd3d7', toaster: '#cfd3d7',
  blender: '#cfd3d7', coffee_machine: '#3a3e44', water_heater: '#e8eaec',
  // Bathroom (porcelain)
  sink: '#f2f5f6', toilet: '#f2f5f6', bathtub: '#f2f5f6', shower: '#dfe7ea', bidet: '#f2f5f6', urinal: '#f2f5f6',
  // Decor / soft furnishings
  plant: '#3f8f4f', rug: '#b5563a', floor_vase: '#b0764a', vase: '#b0764a',
  painting: '#cfc2a8', mirror: '#bcc8cc', wall_clock: '#f0f0f0', whiteboard: '#f4f6f8',
  curtain: '#cdd3da', curtain_single: '#cdd3da', curtain_sheer: '#e6ecf2', curtain_sheer_single: '#e6ecf2', roller_blind: '#d6dadf', roman_blind: '#cdd3da', blind_bottomup: '#cbb79c', garage_door: '#f2f0ea',
  towel_rack: '#d0d4d8', bathroom_cabinet: '#e8eaec', trash_can: '#9aa0a6',
  // Statement / misc
  piano: '#1b1d22', pool_table: '#2e6b3f', aquarium: '#6fb6c8', fireplace: '#3a3a3a',
  radiator: '#eeeeee', arch_shelf_wall: '#f4f2ee', niche_shelf_wall: '#f0eee9', feature_wall: '#6f4326',
  tv: '#15171a', monitor: '#15171a', printer: '#3a3e44',
  speaker: '#2b2f36', ceiling_speaker: '#eef0f2', ceiling_speaker_double: '#eef0f2', air_purifier: '#f2f2f2',
  treadmill: '#454b54', exercise_bike: '#8a8f96', weight_bench: '#8a2f2f', gym_machine: '#5b6470', dumbbell_rack: '#8a8f96', swimming_pool: '#c9c3b3', sauna_bench: '#b5824a', sauna_heater: '#8a8f96', massage_table: '#7b8fa1', barber_chair: '#3f6f8c', prayer_mat: '#3f6d5a',
  ac_unit: '#f0f2f4', security_camera: '#d8dce0', intercom: '#d8dce0',
  wall_panel: '#d8d2c6', arch: '#d8d2c6', ceiling_fan: '#d8d8d8', ceiling_vent: '#eaecee',
  warm_floor: '#b98f7d', convector: '#9aa0a6',
  window_frame: '#e8e8e8', terrace_window: '#e8e8e8', patio_door: '#e8e8e8', terrace_wall: '#dfe6ea',
  terrace_window_full: '#2c3138', tall_cabinet: '#9c6b3f', tv_console: '#9c6b3f', climbing_wall: '#cbb089',
  // Lighting (warm shades)
  floor_lamp: '#fff4d6', table_lamp: '#fff4d6', wall_light: '#fff4d6',
  ceiling_light: '#fff4d6', pendant_light: '#fff4d6', lantern: '#fff4d6',
  chandelier: '#f3e6c0', crystal_chandelier: '#eaf2fb', spotlight: '#fff4d6',
  chandelier_double: '#f3e6c0', crystal_chandelier_double: '#eaf2fb', cabinet_pair: '#1a1712',
  track_light: '#fff4d6', led_panel: '#f7faff', led_strip: '#ffffff',
  spotlight_bar: '#fff4d6', led_backlight: '#f2f7ff', track_bar: '#fff4d6', wall_sconce: '#fff2d6',
  wall_light_double: '#fff2d6', sconce_pair: '#fff4d6',
  track_double: '#fff4d6', wall_backlight: '#fff0d0', wall_backlight_double: '#fff0d0', glass_wall_cabinet: '#1c2622', wall_switch: '#eef0f2', roof_lantern: '#dfe3da', pergola_retractable: '#ede4cc', terrace_parapet: '#9c6b3f',
  terrace_glass_parapet: '#e3d9c4', terrace_stone_parapet: '#e3d9c4', balustrade: '#e3d9c4',
  fountain_pool: '#24262b', stone_planter: '#e3d9c4',
  transom_window: '#2c3138', curtain_short: '#9a8b76',
  dining_table_oval: '#9c6b3f', bathtub_oval: '#dfd8cb',
  wood_slat_panel: '#9c6b3f', tv_wall: '#9c6b3f', boss_desk: '#cfc9bd',
  sofa_l: '#7d8a99', sofa_u: '#6f7d8c', conference_chair: '#454b54', tub_chair: '#a89a86', conference_table: '#9c6b3f', executive_desk: '#6e4a2f', tree: '#3f7d3f', shrub: '#4a7d3a', sink_double: '#eceff1',
};

/** Realistic default color for a model (neutral grey when unspecified). */
export function defaultColor(model: string): string {
  return DEFAULT_COLORS[model as ModelKey] ?? '#c9cdd2';
}

/**
 * Наборы: у этих моделей в редакторе доступны «Разброс» и «Количество» —
 * элементы РАССТАВЛЯЮТСЯ шире, а не растягиваются.
 *
 * Имя списка историческое («LIGHT»), но список НЕ равен LIGHT_KEYS и не должен:
 * ceiling_speaker_double — набор потолочных колонок, у него нет свечения и в
 * LIGHT_KEYS ему делать нечего (привязывается media_player), а вот разброс и
 * количество у него ровно такие же, как у набора светильников. Обратное тоже
 * верно: светильников много, а наборов из них — десять.
 */
export const SET_LIGHT_KEYS = modelKeys(['spotlight_bar', 'led_backlight', 'track_bar', 'wall_light_double', 'sconce_pair', 'ceiling_speaker_double', 'chandelier_double', 'crystal_chandelier_double', 'cabinet_pair', 'wall_backlight_double']);
export function isLightSet(model: string): boolean {
  return SET_LIGHT_KEYS.includes(model);
}

export function buildFurniture(model: string, color?: string, opts?: BuildOpts): THREE.Group {
  const builder = builders[model as ModelKey] ?? builders.marker;
  const c = new THREE.Color(color ?? defaultColor(model));
  const group = builder(c, opts);
  group.userData.model = model;
  return group;
}

const _backZCache = new Map<string, number>();
/** The model's back-most local Z (its front faces +Z). A wall-mounted piece is
 *  offset by -this so its BACK sits flush on the wall surface instead of the
 *  fixed offset letting a deep cabinet punch through the wall. */
export function modelBackZ(model: string): number {
  let z = _backZCache.get(model);
  if (z === undefined) {
    const g = buildFurniture(model);
    g.updateMatrixWorld(true);
    z = new THREE.Box3().setFromObject(g).min.z;
    if (!Number.isFinite(z)) z = 0;
    _backZCache.set(model, z);
  }
  return z;
}
