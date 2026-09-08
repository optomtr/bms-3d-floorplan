// ---------------------------------------------------------------------------
// ЕДИНСТВЕННЫЙ СТЫК ОБОЛОЧКИ С ДВИЖКОМ.
//
// ВРЕМЯНКА. Движок (src/editor2/api.ts) пишет другой пакет, его файлов здесь
// ещё нет. Договор (E2-CONTRACT.md) описан ниже слово в слово, поэтому вся
// оболочка уже написана против настоящего интерфейса и при слиянии не
// правится НИГДЕ, кроме этого файла.
//
// ЧТО СДЕЛАТЬ ПРИ СЛИЯНИИ (две строки):
//   1. заменить всё содержимое этого файла на
//        export * from '../editor2/api';
//   2. удалить src/card/editor2-stub.ts (манекен) и tests/21-shell.spec.ts
//      правки не требует — он говорит с оболочкой, а не с движком.
//
// Типы объявлены здесь СТРУКТУРНО такими же, как в договоре: TypeScript
// сверяет формы, а не имена файлов, поэтому подстановка настоящего движка
// проходит без единой правки в оболочке.
// ---------------------------------------------------------------------------

import type { FloorPlan } from '../types';

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
  mount(host: HTMLElement, plan: FloorPlan, floorIndex: number): void;
  destroy(): void;

  setTool(t: Tool): void;
  getTool(): Tool;
  /** ТОЛЬКО экранной кнопкой. Никаких Shift/Ctrl/Alt — на планшете их нет. */
  setSnap(on: boolean): void;
  getSnap(): boolean;
  setFloor(index: number): void;
  zoomToFit(): void;

  getSelection(): Selection | null;
  updateSelected(patch: Record<string, unknown>): void;
  deleteSelected(): void;

  undo(): void;
  redo(): void;
  canUndo(): boolean;
  canRedo(): boolean;

  /** Модель для инструмента «мебель» задаётся снаружи: палитра живёт в оболочке. */
  setPendingModel(model: string | null): void;

  onChange(cb: (plan: FloorPlan) => void): void;
  onSelect(cb: (sel: Selection | null) => void): void;
  onStatus(cb: (text: string) => void): void;
}

// Пока движка нет — манекен. Строка ниже и есть весь «переключатель».
export { createPlanEditor } from './editor2-stub';
