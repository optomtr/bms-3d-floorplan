// ---------------------------------------------------------------------------
// Мост «новая оболочка → готовая логика проектов» и всё, что правит план
// МИМО черчения: этажи и подложка-калька.
//
// Проекты (сохранить, новый, открыть, удалить, импорт, экспорт, перенос из
// старой версии) уже написаны и проверены — src/card/projects.ts. Они говорят
// со старым EditorController, поэтому здесь стоит мост ровно той формы, какой
// они пользуются: живой план и загрузка плана. Ни строчки этой логики не
// переписано.
//
// Этажи и подложка в договоре движка не описаны (в нём только черчение), зато
// они описаны в ФОРМАТЕ ПЛАНА, который договор запрещает менять. Поэтому
// оболочка правит их прямо в плане и пересобирает движок — см. remountEditor2.
// ---------------------------------------------------------------------------

import type { BmsFloorplanCard } from '../ha-3d-floorplan-card';
import type { FloorDef, FloorPlan, Underlay } from '../types';
import { askConfirm } from './dialogs';

/** То, чем пользуются projects.ts / editor-commands.ts от старого редактора.
 *  Больше ничего им не нужно — проверено чтением обоих файлов. */
export interface ProjectBridge {
  readonly plan: FloorPlan;
  loadPlan(plan: FloorPlan): void;
  stop(): void;
  shiftHeld: boolean;
  undo(): void;
  redo(): void;
  finishChain(): void;
  cancelChain(): void;
  setUnderlayImage(data: string, w: number, h: number): void;
  setUnderlayField(field: 'widthM' | 'opacity' | 'rotation', value: number): void;
  nudgeUnderlay(dx: number, dz: number): void;
  removeUnderlay(): void;
}

export function makeProjectBridge(host: BmsFloorplanCard): ProjectBridge {
  return {
    get plan(): FloorPlan {
      return host.e2!.plan;
    },
    loadPlan(plan: FloorPlan): void {
      const st = host.e2;
      if (!st) return;
      if (!plan.floors || !plan.floors.length) plan.floors = [blankFloor('Первый этаж')];
      st.plan = plan;
      st.floorIndex = 0;
      st.selection = null;
      host.editPlanName = plan.name ?? '';
      host.floorNames = plan.floors.map((f, i) => f.name || `Этаж ${i + 1}`);
      remountEditor2(host);
    },
    stop(): void {
      /* Движок останавливает exitEditor2 — мост только изображает старый API. */
    },
    shiftHeld: false,
    undo(): void {
      host.e2?.editor.undo();
      host.requestUpdate();
    },
    redo(): void {
      host.e2?.editor.redo();
      host.requestUpdate();
    },
    finishChain(): void {
      /* Enter/Esc обрабатывает сам движок — на нём поле длины у курсора. */
    },
    cancelChain(): void {
      /* см. finishChain */
    },
    setUnderlayImage(data: string, w: number, h: number): void {
      const f = currentFloor(host);
      if (!f) return;
      const prev = f.underlay;
      f.underlay = {
        image: data,
        widthM: prev?.widthM ?? 10,
        aspect: w > 0 ? h / w : 1,
        x: prev?.x ?? 0,
        z: prev?.z ?? 0,
        rotation: prev?.rotation ?? 0,
        opacity: prev?.opacity ?? 0.6,
      };
      afterPlanEdit(host, 'Подложка добавлена — задайте её ширину в метрах');
    },
    setUnderlayField(field, value): void {
      const f = currentFloor(host);
      if (!f?.underlay || !Number.isFinite(value)) return;
      (f.underlay as unknown as Record<string, number>)[field] = value;
      afterPlanEdit(host);
    },
    nudgeUnderlay(dx: number, dz: number): void {
      const f = currentFloor(host);
      if (!f?.underlay) return;
      f.underlay.x = (f.underlay.x ?? 0) + dx;
      f.underlay.z = (f.underlay.z ?? 0) + dz;
      afterPlanEdit(host);
    },
    removeUnderlay(): void {
      const f = currentFloor(host);
      if (!f) return;
      delete f.underlay;
      afterPlanEdit(host, 'Подложка убрана');
    },
  };
}

export function currentFloor(host: BmsFloorplanCard): FloorDef | undefined {
  const st = host.e2;
  return st?.plan.floors[st.floorIndex];
}

export function currentUnderlay(host: BmsFloorplanCard): Underlay | undefined {
  return currentFloor(host)?.underlay;
}

function blankFloor(name: string): FloorDef {
  return { name, elevation: 0, wallHeight: 2.6, walls: [], rooms: [], furniture: [], bindings: [], zones: [] };
}

/** План изменили мимо движка (этаж, подложка): движок держит его у себя, и
 *  единственный способ по договору — смонтировать заново. Договор даёт только
 *  mount/destroy, отдельной «перезагрузки плана» в нём нет. */
export function remountEditor2(host: BmsFloorplanCard): void {
  const st = host.e2;
  if (!st) return;
  st.floorIndex = Math.max(0, Math.min(st.floorIndex, st.plan.floors.length - 1));
  if (st.mounted) {
    st.editor.destroy();
    st.editor.mount(st.mounted, st.plan, st.floorIndex);
    st.editor.setTool(st.tool);
    st.editor.setSnap(st.snap);
    st.editor.setPendingModel(st.tool === 'furniture' ? st.model : null);
  }
  st.selection = null;
  host.sceneManager?.loadPlan(st.plan, true);
  host.requestUpdate();
}

function afterPlanEdit(host: BmsFloorplanCard, toast?: string): void {
  remountEditor2(host);
  if (toast) host.showToast(toast);
}

// -- этажи -------------------------------------------------------------------

export function selectFloor2(host: BmsFloorplanCard, index: number): void {
  const st = host.e2;
  if (!st || index < 0 || index >= st.plan.floors.length) return;
  st.floorIndex = index;
  st.selection = null;
  st.editor.setFloor(index);
  host.activeFloorIndex = index;
  host.requestUpdate();
}

export function addFloor2(host: BmsFloorplanCard): void {
  const st = host.e2;
  if (!st) return;
  const below = st.plan.floors[st.plan.floors.length - 1];
  const floor = blankFloor(`Этаж ${st.plan.floors.length + 1}`);
  floor.elevation = (below?.elevation ?? 0) + (below?.wallHeight ?? st.plan.wallHeight ?? 2.6);
  st.plan.floors.push(floor);
  st.floorIndex = st.plan.floors.length - 1;
  host.floorNames = st.plan.floors.map((f, i) => f.name || `Этаж ${i + 1}`);
  remountEditor2(host);
  host.showToast(`Добавлен «${floor.name}»`);
}

export function renameFloor2(host: BmsFloorplanCard, name: string): void {
  const f = currentFloor(host);
  if (!f) return;
  f.name = name;
  const st = host.e2!;
  host.floorNames = st.plan.floors.map((x, i) => x.name || `Этаж ${i + 1}`);
  host.requestUpdate();
}

export async function deleteFloor2(host: BmsFloorplanCard): Promise<void> {
  const st = host.e2;
  if (!st) return;
  if (st.plan.floors.length < 2) {
    host.showToast('Единственный этаж удалить нельзя');
    return;
  }
  const name = currentFloor(host)?.name ?? '';
  const ok = await askConfirm(
    host,
    'Удалить этаж?',
    `«${name}» и всё, что на нём, будут удалены.`,
    'Удалить',
  );
  if (!ok || !host.e2) return;
  st.plan.floors.splice(st.floorIndex, 1);
  st.floorIndex = Math.max(0, st.floorIndex - 1);
  host.floorNames = st.plan.floors.map((f, i) => f.name || `Этаж ${i + 1}`);
  remountEditor2(host);
  host.showToast('Этаж удалён');
}
