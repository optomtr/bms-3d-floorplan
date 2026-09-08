// ---------------------------------------------------------------------------
// Команды ОБОЛОЧКИ нового конструктора: вход и выход, монтаж движка, место
// под 3D, инструменты, правка выбранного, вкладки и разделитель.
//
// Всё, что относится к самому черчению, живёт в движке и вызывается только
// через договор (editor2-api.ts). Здесь нет ни одной строчки геометрии.
// ---------------------------------------------------------------------------

import type { BmsFloorplanCard } from '../ha-3d-floorplan-card';
import type { EditorController } from '../editor/editor-controller';
import type { FloorPlan } from '../types';
import { createPlanEditor, type BindRequest, type Selection, type Tool } from './editor2-api';
import { NARROW_PX, SIDE_MAX_FRAC, SIDE_MIN, makeEditor2State, type Editor2State } from './editor2-state';
import { makeProjectBridge } from './editor2-project';
import { enterEditNow, exitEdit } from './editor-commands';

/** Вход в новый конструктор. Правим КОПИЮ плана — ровно как старый редактор,
 *  чтобы просмотр держал последний сохранённый до «Готово». */
export function enterEditor2(host: BmsFloorplanCard): void {
  if (!host.sceneManager || !host.currentPlan) return;
  host.qualityMenuOpen = false;
  const plan: FloorPlan = JSON.parse(JSON.stringify(host.currentPlan));
  const floorIndex = Math.min(host.activeFloorIndex, Math.max(0, plan.floors.length - 1));
  const st = makeEditor2State(createPlanEditor(), plan, floorIndex);
  host.e2 = st;

  st.editor.onChange((p) => {
    st.plan = p;
    st.canUndo = st.editor.canUndo();
    st.canRedo = st.editor.canRedo();
    schedule3D(host);
    host.requestUpdate();
  });
  st.editor.onSelect((sel: Selection | null) => {
    st.selection = sel;
    // Ушли с того светильника — ожидание привязки снимается вместе с ним.
    if (st.bindPrompt && sel?.id !== st.bindPrompt) st.bindPrompt = undefined;
    host.requestUpdate();
  });
  st.editor.onStatus((text: string) => {
    st.status = text;
    host.requestUpdate();
  });
  // Светильник поставлен — инспектор открывается СРАЗУ на выборе устройства.
  st.editor.onBindRequest((req: BindRequest) => {
    st.bindPrompt = req.id;
    st.entityQuery = '';
    st.paletteOpen = false;
    st.projectOpen = false;
    // Планшет книжный: раздел свойств живёт на вкладке «План» нижней шторкой,
    // и она поднимается сама, потому что светильник уже выбран.
    st.tab = 'plan';
    host.requestUpdate();
    void host.updateComplete.then(() => {
      const el = host.renderRoot?.querySelector('[data-bind-prompt]') as HTMLElement | null;
      el?.scrollIntoView({ block: 'nearest' });
    });
  });

  // Проекты (сохранить, новый, импорт, перенос) написаны против старого
  // EditorController. Переписывать их незачем — мост отдаёт им ровно то, чем
  // они пользуются: живой план и загрузку плана.
  host.editor = makeProjectBridge(host) as unknown as EditorController;
  host.editingProjectId = host.currentProjectId;
  host.editPlanName = plan.name ?? '';
  // `editing` включаем ТОЖЕ: на нём висит вся логика «в режиме правки не
  // трогать сцену живыми состояниями, не гасить экран, не показывать хром
  // просмотра». Второй признак `editing2` отличает новую оболочку от старой.
  host.editing = true;
  host.editing2 = true;
  host.sceneManager.loadPlan(plan, true);
  host.showToast(
    host.tx(
      'Новый конструктор: чертите видом сверху, справа видно 3D',
      'New editor: draw top-down, the 3D preview is on the right',
    ),
  );
}

/** Монтаж движка в место под план. Зовётся из updated() карточки: элемент
 *  появляется только после первой отрисовки разметки. */
export function mountEditor2(host: BmsFloorplanCard): void {
  const st = host.e2;
  if (!st) return;
  const el = host.renderRoot?.querySelector('.e2-plan-host') as HTMLElement | null;
  if (el && st.mounted !== el) {
    st.mounted = el;
    st.editor.mount(el, st.plan, st.floorIndex);
    st.editor.setTool(st.tool);
    st.editor.setSnap(st.snap);
    st.editor.setPendingModel(st.tool === 'furniture' ? st.model : null);
    st.canUndo = st.editor.canUndo();
    st.canRedo = st.editor.canRedo();
  }
  observeLayout(host);
  syncViewport(host);
}

/** Холст 3D (.viewport) живёт вне нашей разметки — он один на карточку и
 *  создаётся до редактора. Поэтому не «переносим» его, а ставим ровно на
 *  место-заглушку .e2-3d-slot и держим там переменными CSS. */
export function syncViewport(host: BmsFloorplanCard): void {
  const st = host.e2;
  const root = host.renderRoot as ShadowRoot | undefined;
  if (!st || !root) return;
  const card = root.querySelector('ha-card') as HTMLElement | null;
  const slot = root.querySelector('.e2-3d-slot') as HTMLElement | null;
  if (!card) return;
  const c = card.getBoundingClientRect();

  const narrow = c.width > 0 && c.width < NARROW_PX;
  if (narrow !== st.narrow) {
    st.narrow = narrow;
    host.requestUpdate();
  }

  const visible = !!slot && st.showThree && (!st.narrow || st.tab === '3d');
  if (!visible || !slot) {
    host.style.setProperty('--e2-vp-vis', 'hidden');
    return;
  }
  const s = slot.getBoundingClientRect();
  if (s.width < 2 || s.height < 2) {
    host.style.setProperty('--e2-vp-vis', 'hidden');
    return;
  }
  host.style.setProperty('--e2-vp-x', `${Math.round(s.left - c.left)}px`);
  host.style.setProperty('--e2-vp-y', `${Math.round(s.top - c.top)}px`);
  host.style.setProperty('--e2-vp-w', `${Math.round(s.width)}px`);
  host.style.setProperty('--e2-vp-h', `${Math.round(s.height)}px`);
  host.style.setProperty('--e2-vp-vis', 'visible');
}

function observeLayout(host: BmsFloorplanCard): void {
  const st = host.e2;
  const root = host.renderRoot as ShadowRoot | undefined;
  if (!st || st.ro || !root) return;
  const card = root.querySelector('ha-card');
  if (!card) return;
  st.ro = new ResizeObserver(() => syncViewport(host));
  st.ro.observe(card);
}

function clearViewportVars(host: BmsFloorplanCard): void {
  for (const v of ['--e2-vp-x', '--e2-vp-y', '--e2-vp-w', '--e2-vp-h', '--e2-vp-vis']) {
    host.style.removeProperty(v);
  }
}

/** Пересборка 3D после правки. Движок зовёт onChange после КАЖДОЙ завершённой
 *  правки, но соседние правки (набрал длину, тут же угол) идут очередью —
 *  собираем сцену один раз на пачку. */
function schedule3D(host: BmsFloorplanCard): void {
  const st = host.e2;
  if (!st || st.syncTimer) return;
  st.syncTimer = window.setTimeout(() => {
    st.syncTimer = undefined;
    if (host.e2 === st && host.sceneManager) host.sceneManager.loadPlan(st.plan, true);
  }, 150);
}

/** «Готово»: сохранить и вернуться в просмотр. Сохранение и возврат сцены —
 *  та же функция, что у старого редактора. */
export async function exitEditor2(host: BmsFloorplanCard): Promise<void> {
  const st = host.e2;
  await exitEdit(host);
  if (st) {
    st.ro?.disconnect();
    if (st.syncTimer) window.clearTimeout(st.syncTimer);
    st.editor.destroy();
  }
  host.e2 = undefined;
  host.editing2 = false;
  host.editEntry = 'legacy';
  clearViewportVars(host);
}

/** Открыть СТАРЫЙ редактор (он пока остаётся рядом). */
export async function openLegacyEditor(host: BmsFloorplanCard): Promise<void> {
  await exitEditor2(host);
  enterEditNow(host);
}

/** Из старого редактора — в новый конструктор. */
export async function openNewEditor(host: BmsFloorplanCard): Promise<void> {
  await exitEdit(host);
  host.editEntry = 'e2';
  enterEditor2(host);
}

// -- инструменты -------------------------------------------------------------

export function setTool2(host: BmsFloorplanCard, tool: Tool): void {
  const st = host.e2;
  if (!st) return;
  st.tool = tool;
  st.editor.setTool(tool);
  // Модель нужна ТОЛЬКО инструменту «мебель»: иначе движок держал бы висящую
  // модель и первое же касание другим инструментом поставило бы диван.
  st.editor.setPendingModel(tool === 'furniture' ? st.model : null);
  if (tool === 'furniture') {
    st.paletteFor = 'place';
    st.paletteOpen = true;
  }
  host.requestUpdate();
}

export function toggleSnap2(host: BmsFloorplanCard): void {
  const st = host.e2;
  if (!st) return;
  st.snap = !st.snap;
  st.editor.setSnap(st.snap);
  host.requestUpdate();
}

export function undo2(host: BmsFloorplanCard): void {
  const st = host.e2;
  if (!st) return;
  st.editor.undo();
  st.canUndo = st.editor.canUndo();
  st.canRedo = st.editor.canRedo();
  host.requestUpdate();
}

export function redo2(host: BmsFloorplanCard): void {
  const st = host.e2;
  if (!st) return;
  st.editor.redo();
  st.canUndo = st.editor.canUndo();
  st.canRedo = st.editor.canRedo();
  host.requestUpdate();
}

export function fit2(host: BmsFloorplanCard): void {
  host.e2?.editor.zoomToFit();
}

// -- выбранное ---------------------------------------------------------------

/** Правка свойства выбранного объекта. Поля патча названы ровно так же, как
 *  поля Selection в договоре (lengthM, thicknessM, angleDeg, name, widthM…). */
export function patchSelected(host: BmsFloorplanCard, patch: Record<string, unknown>): void {
  const st = host.e2;
  if (!st || !st.selection) return;
  // Устройство выбрано — просьба выполнена, подсказку убираем.
  if ('entityId' in patch && String(patch.entityId ?? '')) st.bindPrompt = undefined;
  st.editor.updateSelected(patch);
  st.selection = st.editor.getSelection();
  st.canUndo = st.editor.canUndo();
  st.canRedo = st.editor.canRedo();
  host.requestUpdate();
}

export function deleteSelected2(host: BmsFloorplanCard): void {
  const st = host.e2;
  if (!st) return;
  st.editor.deleteSelected();
  st.selection = st.editor.getSelection();
  st.canUndo = st.editor.canUndo();
  host.requestUpdate();
}

// -- палитра мебели ----------------------------------------------------------

export function pickModel2(host: BmsFloorplanCard, model: string): void {
  const st = host.e2;
  if (!st) return;
  st.model = model;
  // Решает НАМЕРЕНИЕ, а не то, что случайно осталось выбранным. Палитру открыли
  // плиткой «Модель» в инспекторе — меняем выбранный предмет; открыли
  // инструментом «Мебель» — заряжаем следующую постановку. Раньше выбор
  // побеждал всегда, и второй светильник подряд поставить было нельзя: он
  // переделывал первый.
  if (st.paletteFor === 'model' && st.selection?.kind === 'furniture') patchSelected(host, { model });
  else if (st.tool === 'furniture') st.editor.setPendingModel(model);
  st.paletteOpen = false;
  host.requestUpdate();
}

// -- раскладка ---------------------------------------------------------------

export function setTab2(host: BmsFloorplanCard, tab: 'plan' | '3d'): void {
  const st = host.e2;
  if (!st) return;
  st.tab = tab;
  host.requestUpdate();
  // Место под 3D меняется той же перерисовкой — меряем после неё.
  void host.updateComplete.then(() => syncViewport(host));
}

export function toggleThree2(host: BmsFloorplanCard): void {
  const st = host.e2;
  if (!st) return;
  st.showThree = !st.showThree;
  host.requestUpdate();
  void host.updateComplete.then(() => syncViewport(host));
}

/** Разделитель между планом и 3D. Тянется и пальцем, и мышью; клавиатуре
 *  отданы стрелки — двигать границу должно быть можно и без указателя. */
export function startSplitDrag(host: BmsFloorplanCard, e: PointerEvent): void {
  const st = host.e2;
  const root = host.renderRoot as ShadowRoot | undefined;
  if (!st || !root) return;
  const card = root.querySelector('ha-card') as HTMLElement | null;
  if (!card) return;
  const grip = e.currentTarget as HTMLElement;
  grip.setPointerCapture?.(e.pointerId);
  const move = (ev: PointerEvent) => {
    const c = card.getBoundingClientRect();
    setSideWidth(host, c.right - ev.clientX, c.width);
  };
  const up = () => {
    grip.removeEventListener('pointermove', move);
    grip.removeEventListener('pointerup', up);
    grip.removeEventListener('pointercancel', up);
  };
  grip.addEventListener('pointermove', move);
  grip.addEventListener('pointerup', up);
  grip.addEventListener('pointercancel', up);
}

export function nudgeSplit(host: BmsFloorplanCard, delta: number): void {
  const st = host.e2;
  const card = host.renderRoot?.querySelector('ha-card') as HTMLElement | null;
  if (!st || !card) return;
  setSideWidth(host, st.sideW + delta, card.getBoundingClientRect().width);
}

function setSideWidth(host: BmsFloorplanCard, want: number, cardW: number): void {
  const st = host.e2;
  if (!st) return;
  const max = Math.max(SIDE_MIN, cardW * SIDE_MAX_FRAC);
  st.sideW = Math.round(Math.min(max, Math.max(SIDE_MIN, want)));
  host.requestUpdate();
  void host.updateComplete.then(() => syncViewport(host));
}

/** Тип состояния переэкспортируем, чтобы карточке хватило одного импорта. */
export type { Editor2State };
