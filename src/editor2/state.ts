// ---------------------------------------------------------------------------
// Состояние черчения между кадрами: что человек уже поставил и что видит
// «призраком» под курсором.
//
// Живёт отдельным файлом, потому что его читают ДВОЕ — редактор (он его меняет)
// и рисовалка (она только читает). Общий тип избавляет от кольцевого импорта
// между ними.
// ---------------------------------------------------------------------------

import type { OpeningKind, Vec2 } from '../types';

export type SelRef =
  | { kind: 'wall'; id: string }
  | { kind: 'room'; id: string }
  | { kind: 'opening'; id: string }
  | { kind: 'furniture'; id: string }
  | { kind: 'zone'; id: string };

export type DraftMode =
  | 'none'
  /** Цепочка стен: точка — точка — точка. */
  | 'chain'
  /** Прямоугольник растягиванием (комната или зона). */
  | 'rect'
  /** Многоугольник по точкам (комната или зона). */
  | 'poly'
  /** Проём скользит вдоль стены. */
  | 'opening'
  /** Предмет висит под курсором. */
  | 'furniture';

export interface Draft {
  mode: DraftMode;
  /** Точки цепочки/многоугольника. */
  pts: Vec2[];
  /** Первый угол прямоугольника. */
  a: Vec2 | null;
  /** Курсор после привязки — то место, куда действительно встанет точка. */
  cursor: Vec2 | null;
  /** Курсор сел на существующую вершину: рисуем крупный «стык». */
  joined: boolean;
  /** Стена, вдоль которой едет проём. */
  wallId: string | null;
  /** Отступ проёма от начала стены, метры. */
  along: number;
  /** Ширина будущего проёма, метры. */
  width: number;
  kind: OpeningKind;
  /** Модель под курсором для инструмента «мебель». */
  model: string | null;
  /** Поворот будущего предмета. */
  rotation: number;
  /** Замкнутый контур ждёт ответа «делать комнату?». */
  pendingRing: Vec2[] | null;
}

export function emptyDraft(): Draft {
  return {
    mode: 'none',
    pts: [],
    a: null,
    cursor: null,
    joined: false,
    wallId: null,
    along: 0,
    width: 0.9,
    kind: 'door',
    model: null,
    rotation: 0,
    pendingRing: null,
  };
}
