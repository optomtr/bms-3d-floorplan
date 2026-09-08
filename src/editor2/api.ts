// ---------------------------------------------------------------------------
// Граница между движком и оболочкой (E2-CONTRACT.md).
//
// Всё, что оболочке позволено знать о новом конструкторе, описано здесь. Движок
// не знает про Lit, Home Assistant и карточку: ему дают узел DOM и план, он
// отдаёт план и события.
//
// Плоскость: метры, x — вправо, y — ВНИЗ (как на бумаге). В 3D это X и Z.
// Пересчёт живёт внутри движка; ни оболочка, ни проверки о нём не думают.
// ---------------------------------------------------------------------------

import type { FloorPlan } from '../types';
import { PlanEditorImpl } from './editor';

export type Tool =
  | 'select'
  | 'wall'
  | 'room'
  | 'door'
  | 'window'
  | 'opening'
  | 'furniture'
  | 'zone'
  | 'measure';

export type Selection =
  | { kind: 'wall'; id: string; lengthM: number; thicknessM: number; angleDeg: number; material?: string; color?: string }
  | { kind: 'room'; id: string; name?: string; areaM2: number; material?: string; color?: string }
  | { kind: 'opening'; id: string; wallId: string; kind2: 'door' | 'window' | 'opening'; widthM: number; offsetM: number; variant?: string }
  | { kind: 'furniture'; id: string; model: string; rotationDeg: number; scale: number; entityId?: string }
  | { kind: 'zone'; id: string; name?: string };

export interface PlanEditor {
  /** Смонтировать редактор в узел. План правится НА МЕСТЕ: тот же объект
   *  остаётся актуальным и после отмены. */
  mount(host: HTMLElement, plan: FloorPlan, floorIndex: number): void;
  destroy(): void;

  setTool(t: Tool): void;
  getTool(): Tool;
  /** ТОЛЬКО кнопкой. Никаких Shift/Ctrl/Alt — на планшете их нет. */
  setSnap(on: boolean): void;
  getSnap(): boolean;
  setFloor(index: number): void;
  zoomToFit(): void;

  getSelection(): Selection | null;
  /** Длина, толщина, угол, имя, ширина проёма… Числа принимаются и строкой:
   *  «3,5» означает три с половиной. */
  updateSelected(patch: Record<string, unknown>): void;
  deleteSelected(): void;

  undo(): void;
  redo(): void;
  canUndo(): boolean;
  canRedo(): boolean;

  /** Модель для инструмента «мебель» задаётся снаружи: палитра живёт в оболочке. */
  setPendingModel(model: string | null): void;

  /** После КАЖДОЙ завершённой правки. */
  onChange(cb: (plan: FloorPlan) => void): void;
  onSelect(cb: (sel: Selection | null) => void): void;
  /** «поставьте вторую точку», «контур замкнут» — уже по-русски. */
  onStatus(cb: (text: string) => void): void;
}

/**
 * Сверх договора: то, что нужно стенду и автопроверкам, чтобы попадать
 * указателем в конкретный метр плана. Оболочке это не требуется — она видит
 * ровно PlanEditor.
 */
export interface EngineExtras {
  getPlan(): FloorPlan | null;
  getStatus(): string;
  worldToClient(x: number, y: number): { x: number; y: number };
  clientToWorld(x: number, y: number): { x: number; y: number };
}

export function createPlanEditor(): PlanEditor & EngineExtras {
  return new PlanEditorImpl();
}
