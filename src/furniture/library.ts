// ---------------------------------------------------------------------------
// Библиотека встроенной мебели — единая точка входа.
//
// Файл был на 3931 строку; теперь это витрина, за которой:
//   primitives.ts     — материалы, примитивы и помощники, из которых всё собрано
//   models/<тема>.ts  — сами модели, разложенные по темам (190 + служебный marker)
//   models/index.ts    — сборка и MODEL_ORDER (порядок плиток в палитре)
//   metadata.ts        — где вешать, чем красить, что можно привязать
//   names.ts           — русские названия моделей и категорий для палитры
//
// Снаружи ничего не изменилось: карточка, редактор, загрузчик и превью
// импортируют те же имена из './furniture/library'.
//
// Модели рисуются кодом из примитивов Three.js, а не грузятся из GLB: бандл
// остаётся крошечным, лицензии на модели не нужны, и любую вещь можно
// перекрасить. Свои .glb по-прежнему поддерживаются на размещение (loader.ts).
// ---------------------------------------------------------------------------

export type { BuildOpts, FurnitureBuilder } from './primitives';
export type { ModelKey } from './models';
export { builders, MODEL_ORDER } from './models';

export {
  FURNITURE_KEYS,
  WALL_MOUNT_KEYS,
  isWallMount,
  SURFACE_MOUNT_KEYS,
  isSurfaceMount,
  ventCount,
  LIGHT_KEYS,
  entityDomainsFor,
  defaultY,
  defaultColor,
  SET_LIGHT_KEYS,
  isLightSet,
  buildFurniture,
  modelBackZ,
} from './metadata';

// (names.ts подключается ниже по ходу работы)
