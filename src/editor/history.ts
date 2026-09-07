// ---------------------------------------------------------------------------
// Отмена и возврат.
//
// Снимок — это JSON всего плана. Дёшево ровно до тех пор, пока в плане нет
// картинок: фотографии комнат и скан-подложка лежат в нём ТЕКСТОМ (data-URL), и
// скан на 4 МБ занимает в JSON около 5,3 МБ. Восемьдесят шагов отмены — сотни
// мегабайт, после которых вкладка планшета падает вместе с несохранённой
// работой монтажника.
//
// Поэтому снимок и картинки разведены. В JSON на месте тяжёлой строки остаётся
// короткая метка, а сама строка кладётся рядом — ССЫЛКОЙ. Восемьдесят снимков
// одной и той же фотографии — это одна фотография в памяти, а не восемьдесят:
// строки в JS не копируются, копируется указатель. В самом плане картинки
// остаются как были — иначе поехали бы сохранённые планы клиентов.
//
// Договор: снимок делается ДО изменения. Обёртка EditorController.edit() —
// единственное место, где это происходит.
// ---------------------------------------------------------------------------

import type { FloorPlan } from '../types';

/** Поля плана, в которых лежат картинки (Underlay.image, RoomDef.bgImage,
 *  ZoneDef.bgImage). */
const IMAGE_KEYS = new Set(['image', 'bgImage']);
/** Короткая ссылка вида `/local/plan.jpg` дешевле метки — выносим только то,
 *  что действительно весит. */
const HEAVY_MIN = 512;
/** Метка начинается с NUL: в настоящем плане такого символа нет, поэтому её
 *  нельзя спутать с обычной строкой (JSON.stringify её экранирует). */
const TOKEN = '\u0000img:';

/** Снимок плана: текст без картинок + сами картинки ссылками. */
export interface PlanSnapshot {
  json: string;
  images: string[];
}

/** Сколько текста занимает снимок (картинки не в счёт — они общие). */
export function snapshotBytes(shot: PlanSnapshot): number {
  return shot.json.length;
}

export class PlanHistory {
  private undoStack: PlanSnapshot[] = [];
  private redoStack: PlanSnapshot[] = [];
  private undoBytes = 0;

  /** @param max     сколько шагов помнить;
   *  @param maxBytes потолок по тексту снимков. Без него план без картинок, но с
   *                  сотнями предметов, снова упирался бы в память планшета. */
  constructor(
    private readonly max = 80,
    private readonly maxBytes = 6_000_000,
  ) {}

  /** Снимок плана, каким он был. */
  snapshot(plan: FloorPlan): PlanSnapshot {
    const images: string[] = [];
    const json = JSON.stringify(plan, (key, value) => {
      if (typeof value === 'string' && value.length >= HEAVY_MIN && IMAGE_KEYS.has(key)) {
        // Ссылка на ту же строку, а не её копия.
        images.push(value);
        return `${TOKEN}${images.length - 1}`;
      }
      return value;
    });
    return { json, images };
  }

  /** Снимок обратно в план: метки заменяются теми же строками. */
  private restore(shot: PlanSnapshot): FloorPlan {
    return JSON.parse(shot.json, (_key, value) => {
      if (typeof value === 'string' && value.startsWith(TOKEN)) {
        const i = Number(value.slice(TOKEN.length));
        return shot.images[i] ?? '';
      }
      return value;
    }) as FloorPlan;
  }

  /** Два снимка описывают одно и то же состояние? Текст сравнивается как текст,
   *  картинки — по ссылке: подменили фотографию — снимок другой, даже если JSON
   *  совпал до буквы. */
  private same(a: PlanSnapshot, b: PlanSnapshot): boolean {
    if (a.json !== b.json || a.images.length !== b.images.length) return false;
    for (let i = 0; i < a.images.length; i++) if (a.images[i] !== b.images[i]) return false;
    return true;
  }

  /** Запомнить состояние ДО изменения. Возврат при этом обнуляется — обычное
   *  правило: новое действие уводит ветку «вперёд». */
  push(plan: FloorPlan): void {
    this.pushRaw(this.snapshot(plan));
  }

  private pushRaw(shot: PlanSnapshot): void {
    this.undoStack.push(shot);
    this.undoBytes += snapshotBytes(shot);
    this.trim();
    this.redoStack = [];
  }

  /** Держать стопку в рамках — и по числу шагов, и по объёму текста. Последний
   *  шаг не выбрасывается никогда: отмена, которая ничего не умеет, хуже
   *  тяжёлой. */
  private trim(): void {
    while (this.undoStack.length > this.max) {
      this.undoBytes -= snapshotBytes(this.undoStack.shift() as PlanSnapshot);
    }
    while (this.undoBytes > this.maxBytes && this.undoStack.length > 1) {
      this.undoBytes -= snapshotBytes(this.undoStack.shift() as PlanSnapshot);
    }
  }

  /** Действие ничего не изменило — снять лишний снимок. */
  dropLast(): void {
    const shot = this.undoStack.pop();
    if (shot) this.undoBytes -= snapshotBytes(shot);
  }

  /** Записать снимок, только если план после действия реально отличается.
   *  Так тяга мышью без сдвига не оставляет пустого шага отмены. */
  commitIfChanged(before: PlanSnapshot, plan: FloorPlan): boolean {
    if (this.same(before, this.snapshot(plan))) return false;
    this.pushRaw(before);
    return true;
  }

  get canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  get canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  /** Сколько шагов отмены сейчас хранится (диагностика / замеры). */
  get depth(): number {
    return this.undoStack.length;
  }

  /** Вес истории отмены в символах JSON (диагностика / замеры). */
  get bytes(): number {
    return this.undoBytes;
  }

  /** Предыдущий план (или null, если отменять нечего). */
  undo(current: FloorPlan): FloorPlan | null {
    const shot = this.undoStack.pop();
    if (!shot) return null;
    this.undoBytes -= snapshotBytes(shot);
    this.redoStack.push(this.snapshot(current));
    return this.restore(shot);
  }

  /** Отменённый план обратно (или null). */
  redo(current: FloorPlan): FloorPlan | null {
    const shot = this.redoStack.pop();
    if (!shot) return null;
    const back = this.snapshot(current);
    this.undoStack.push(back);
    this.undoBytes += snapshotBytes(back);
    this.trim();
    return this.restore(shot);
  }
}
