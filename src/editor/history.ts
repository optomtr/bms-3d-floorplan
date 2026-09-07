// ---------------------------------------------------------------------------
// Отмена и возврат.
//
// Снимок — это JSON всего плана: план маленький, а любая попытка отменять
// «точечно» упирается в то, что выбор в редакторе хранится ИНДЕКСАМИ массивов
// (см. заметку о стабильных id в отчёте), и частичный откат оставил бы выбор
// показывать на чужой объект.
//
// Договор: снимок делается ДО изменения. Обёртка EditorController.edit() —
// единственное место, где это происходит.
// ---------------------------------------------------------------------------

import type { FloorPlan } from '../types';

export class PlanHistory {
  private undoStack: string[] = [];
  private redoStack: string[] = [];

  constructor(private readonly max = 80) {}

  /** Снимок плана, каким он был. */
  snapshot(plan: FloorPlan): string {
    return JSON.stringify(plan);
  }

  /** Запомнить состояние ДО изменения. Возврат при этом обнуляется — обычное
   *  правило: новое действие уводит ветку «вперёд». */
  push(plan: FloorPlan): void {
    this.pushRaw(this.snapshot(plan));
  }

  private pushRaw(shot: string): void {
    this.undoStack.push(shot);
    if (this.undoStack.length > this.max) this.undoStack.shift();
    this.redoStack = [];
  }

  /** Действие ничего не изменило — снять лишний снимок. */
  dropLast(): void {
    this.undoStack.pop();
  }

  /** Записать снимок, только если план после действия реально отличается.
   *  Так тяга мышью без сдвига не оставляет пустого шага отмены. */
  commitIfChanged(before: string, plan: FloorPlan): boolean {
    if (before === this.snapshot(plan)) return false;
    this.pushRaw(before);
    return true;
  }

  get canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  get canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  /** Предыдущий план (или null, если отменять нечего). */
  undo(current: FloorPlan): FloorPlan | null {
    if (!this.undoStack.length) return null;
    this.redoStack.push(this.snapshot(current));
    return JSON.parse(this.undoStack.pop() as string) as FloorPlan;
  }

  /** Отменённый план обратно (или null). */
  redo(current: FloorPlan): FloorPlan | null {
    if (!this.redoStack.length) return null;
    this.undoStack.push(this.snapshot(current));
    return JSON.parse(this.redoStack.pop() as string) as FloorPlan;
  }
}
