// ---------------------------------------------------------------------------
// Состояние ОБОЛОЧКИ нового конструктора.
//
// Это не состояние плана и не состояние черчения — то и другое живёт в движке
// (см. editor2-api.ts). Здесь только раскладка: что открыто, что выбрано, где
// граница между планом и 3D, какая вкладка активна на планшете.
//
// Хранится ОДНИМ полем карточки (host.e2) и меняется на месте, а перерисовку
// запрашиваем сами через host.requestUpdate(). Иначе на элемент пришлось бы
// завести полтора десятка @state — ровно та «колонка на пятнадцать разделов»,
// от которой мы уходим, только в коде.
// ---------------------------------------------------------------------------

import type { FloorPlan } from '../types';
import type { PlanEditor, Selection, Tool } from './editor2-api';

/** Ширина карточки, ниже которой раскладка «план + 3D рядом» перестаёт быть
 *  честной: планшет в книжной ориентации (800 px) обязан получить вкладки. */
export const NARROW_PX = 900;

/** Границы, за которые нельзя утащить разделитель: и план, и 3D обязаны
 *  оставаться пригодными, а не превращаться в полоску. */
export const SIDE_MIN = 220;
export const SIDE_MAX_FRAC = 0.55;

export interface Editor2State {
  editor: PlanEditor;
  /** Правим КОПИЮ плана — просмотр держит последний сохранённый до «Готово». */
  plan: FloorPlan;
  floorIndex: number;
  tool: Tool;
  snap: boolean;
  selection: Selection | null;
  /** Подсказка движка («поставьте вторую точку»), показывается под планом. */
  status: string;
  canUndo: boolean;
  canRedo: boolean;
  /** Модель, которой чертит инструмент «мебель» (палитра живёт в оболочке). */
  model: string;
  paletteOpen: boolean;
  paletteQuery: string;
  paletteCat: string;
  /** Выдвижной ящик «Проект»: проекты, этажи, подложка, перенос, PIN. */
  projectOpen: boolean;
  /** Поиск по сущностям Home Assistant в инспекторе мебели. */
  entityQuery: string;
  /** Планшет книжный: какая вкладка на экране. Обе панели остаются в DOM —
   *  состояние черчения при переключении не теряется. */
  tab: 'plan' | '3d';
  /** Ширина правой колонки (3D + инспектор), px. */
  sideW: number;
  /** 3D свёрнуто — план занимает всё. */
  showThree: boolean;
  /** Карточка уже, чем NARROW_PX: раскладка переключается на вкладки. */
  narrow: boolean;
  /** Элемент, в который смонтирован движок (сверяется при перерисовке). */
  mounted?: HTMLElement;
  /** Наблюдатель за местом под 3D: холст сцены живёт вне нашей разметки. */
  ro?: ResizeObserver;
  /** Отложенная пересборка 3D после правки плана. */
  syncTimer?: number;
}

export function makeEditor2State(editor: PlanEditor, plan: FloorPlan, floorIndex: number): Editor2State {
  return {
    editor,
    plan,
    floorIndex,
    tool: 'select',
    snap: true,
    selection: null,
    status: '',
    canUndo: false,
    canRedo: false,
    model: 'sofa',
    paletteOpen: false,
    paletteQuery: '',
    paletteCat: 'seating',
    projectOpen: false,
    entityQuery: '',
    tab: 'plan',
    sideW: 420,
    showThree: true,
    narrow: false,
  };
}
