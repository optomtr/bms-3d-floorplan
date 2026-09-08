// ---------------------------------------------------------------------------
// То, что инструменты вправе спросить у редактора.
//
// Инструменты (черчение и правка) не держат ссылку на класс редактора: они
// работают через этот узкий набор. Так их можно читать по одному и так же —
// проверять, не поднимая ни DOM, ни камеру.
//
// Разделение правок здесь не косметическое:
//   • edit()      — одно законченное действие = один шаг отмены;
//   • beginDrag() / dragMutate() / endDrag() — вся тяга мышью = ТОЖЕ один шаг.
// Без второго набора каждый кадр тяги ложился бы в историю, и «отменить» после
// перетаскивания стены нужно было бы нажать сорок раз.
// ---------------------------------------------------------------------------

import type { FloorDef, Vec2 } from '../types';
import type { Tool } from './api';
import type { Draft, SelRef } from './state';
import type { View } from './view';

/** Как рисуется комната или зона. */
export type AreaMode = 'rect' | 'poly' | 'fill';

export interface DragState {
  kind: 'none' | 'vertex' | 'wall' | 'opening' | 'furniture' | 'zone' | 'rotate';
  /** Текущее положение узла, который тянут. */
  vertex: Vec2 | null;
  id: string;
  /** Прошлая точка указателя (уже с привязкой). */
  last: Vec2 | null;
}

export function emptyDrag(): DragState {
  return { kind: 'none', vertex: null, id: '', last: null };
}

export interface SnapHit {
  pt: Vec2;
  /** Точка села на существующую вершину. */
  joined: boolean;
}

export interface ToolHost {
  readonly view: View;
  readonly draft: Draft;
  readonly drag: DragState;
  tool: Tool;
  roomMode: AreaMode;
  zoneMode: AreaMode;
  snapOn: boolean;
  pendingModel: string | null;

  floor(): FloorDef | null;
  /** Высота стен ЭТОГО этажа (этаж → план → 2,6). От неё считается высота
   *  потолочных светильников: на этаже 3,2 м люстра висит под 3,2, а не под 2,6. */
  wallHeight(): number;
  /** Законченная правка: снимок для отмены + оповещение оболочки. */
  edit(fn: () => void): void;
  /** Начало тяги: снимок берётся один раз. */
  beginDrag(): void;
  /** Кадр тяги: меняем план и перерисовываем, историю не трогаем. */
  dragMutate(fn: () => void): void;
  /** Конец тяги: один шаг отмены, если что-то реально сдвинулось. */
  endDrag(): void;

  select(ref: SelRef | null): void;
  selection(): SelRef | null;
  setStatus(text: string): void;
  /** Перерисовать без правки плана. */
  refresh(): void;

  /** Куда на самом деле встанет точка. Привязка выключена — ровно туда, куда ткнули. */
  snapWorld(p: Vec2, chain: Vec2[]): SnapHit;
  /** Допуск попадания в метрах при текущем масштабе. */
  pickTol(): number;
  /** Показать вопрос «сделать комнату?» по замкнутому контуру. */
  askRoom(ring: Vec2[] | null): void;
  /** Светильник поставлен — попросить оболочку предложить привязку устройства.
   *  Светильник без привязки это украшение, а не свет. */
  requestBinding(id: string, model: string): void;
}
