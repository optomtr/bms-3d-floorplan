// ---------------------------------------------------------------------------
// Команды редактора: всё, что нажимается в панели редактора.
// ---------------------------------------------------------------------------

import type { BmsFloorplanCard } from '../ha-3d-floorplan-card';
import { EditTool, EditorController } from '../editor/editor-controller';
import type { FloorPlan, RoomShape } from '../types';
import { ask, askConfirm } from './dialogs';
import { humanNum } from './format';
import { ruPlural } from './i18n';
import { onSavePlan } from './projects';
import { applyHass } from './state';

export function onRenameFloor(host: BmsFloorplanCard, e: Event): void {
  host.editor?.setFloorName(host.editFloorIndex, (e.target as HTMLInputElement).value);
}

export function enterEditNow(host: BmsFloorplanCard): void {
  if (!host.sceneManager || !host.currentPlan) return;
  host.qualityMenuOpen = false; // don't let the view-mode menu outlive its DOM
  // Edit a deep copy so View mode keeps the last saved/loaded plan until save.
  const editable: FloorPlan = JSON.parse(JSON.stringify(host.currentPlan));
  host.editor = new EditorController(host.sceneManager, editable);
  host.editor.onChange = () => {
    const ed = host.editor!;
    host.editTool = ed.tool;
    host.editSelectedModel = ed.selectedModel;
    host.editSelectedObjModel = ed.selectedObjectModel;
    host.editSelectedKind = ed.selectedKind;
    host.editOpeningKind = ed.selectedOpeningKind;
    host.editOpeningVariant = ed.selectedOpeningVariant;
    host.editOpeningWidth = ed.selectedOpeningWidth;
    host.editSelectedColor = ed.selectedColor;
    host.editSelectedWallLength = ed.selectedWallLength;
    host.editSelectedWallThickness = ed.selectedWallThickness;
    host.editSelectedWallAngle = ed.selectedWallAngle;
    host.editRoom = ed.selectedRoomData;
    host.editFurnScale = ed.selectedFurnitureScale as [number, number, number] | null;
    host.editMaterial = ed.selectedMaterial;
    host.editFloorIndex = ed.floorIndex;
    host.editPlanName = ed.plan.name ?? '';
    host.editCanUndo = ed.canUndo;
    host.editCanRedo = ed.canRedo;
    host.editUnderlay = ed.underlay;
    host.editCameraDistance = ed.cameraDistance;
    host.editIsLight = ed.selectedIsLight;
    host.editBrightness = ed.selectedBrightness;
    host.editIsLightSet = ed.selectedIsLightSet;
    host.editSpread = ed.selectedSpread;
    host.editCount = ed.selectedCount;
    host.editZones = [...ed.zones];
    host.editSelectedZoneId = ed.selectedZoneId;
    host.editZonePlacing = ed.zonePlacing;
    host.requestUpdate();
  };
  // Сам EditorController живёт вне карточки и говорит по-английски. Перевод
  // здесь, на стыке: это единственное место, где сообщение становится видимым
  // человеку, и единственный слой, который знает язык интерфейса.
  host.editor.onMessage = (m) => host.showToast(editorMessage(host, m));
  host.editor.onCalibrate = (measured) => {
    void calibrateUnderlay(host, measured);
  };
  host.sceneManager.loadPlan(editable, true);
  // Edit the floor the user is currently viewing — not always floor 0.
  host.editor.floorIndex = Math.min(host.activeFloorIndex, editable.floors.length - 1);
  host.editFloorIndex = host.editor.floorIndex;
  host.editor.setSnap(host.editSnap); // carry the snap preference into the new editor
  host.editShowAllEntities = false;
  host.editingProjectId = host.currentProjectId; // edit the project currently loaded
  host.editPlanName = editable.name ?? 'Plan';
  host.editor.start();
  host.editing = true;
  host.editTool = host.editor.tool;
  host.showToast(host.tx(
    'Режим правки: выберите «Стена» и касайтесь пола, чтобы ставить точки',
    'Edit mode — pick "Wall", tap the floor to place points',
  ));
}

/** Ask for the real-world length between the two calibration points. Uses the
 *  card's own dialog — a kiosk browser can suppress window.prompt entirely,
 *  and an unstyled system box on a wall tablet is unusable anyway. */
export async function calibrateUnderlay(host: BmsFloorplanCard, measured: number): Promise<void> {
  const answer = await ask(host, {
    title: host.tx('Калибровка подложки', 'Calibrate the reference image'),
    message: host.tx(
      `На экране между точками ${measured.toFixed(2)} м. Введите РЕАЛЬНОЕ расстояние в метрах:`,
      `Measured ${measured.toFixed(2)} m on screen between those points. Enter their REAL length in meters:`,
    ),
    okLabel: host.tx('Применить', 'Apply'),
    input: { placeholder: host.tx('например 8,1', 'e.g. 8.1'), inputmode: 'decimal' },
  });
  // Accept a comma decimal: on a RU/UZ keyboard "8,1" is the natural way to
  // type 8.1, and parseFloat reads it as 8 — silently mis-scaling the plan by
  // whatever the fraction was, with nothing on screen to show it happened.
  const real = parseFloat(String(answer ?? '').trim().replace(',', '.'));
  if (real > 0) host.editor?.applyUnderlayScale(measured, real);
  else host.showToast(host.tx('Калибровка отменена', 'Calibration cancelled'));
}

export async function exitEdit(host: BmsFloorplanCard): Promise<void> {
  // Done = auto-save: no need to press Save separately.
  if (host.editor) await onSavePlan(host);
  host.editor?.stop();
  host.editor = undefined;
  host.editing = false;
  // Reload the last saved/loaded plan for clean View mode.
  if (host.currentPlan && host.sceneManager) {
    host.sceneManager.loadPlan(host.currentPlan);
    host.sceneManager.optimizeForView(); // re-merge static geometry for view
    if (host.hass) {
      host.lastHass = undefined;
      host.lastPushed = undefined;
      applyHass(host, host.hass);
    }
  }
}

export function onEditTool(host: BmsFloorplanCard, t: EditTool): void {
  host.editor?.setTool(t);
}

export function onSelectEditFloor(host: BmsFloorplanCard, e: Event): void {
  const i = parseInt((e.target as HTMLSelectElement).value, 10);
  if (Number.isNaN(i) || !host.editor) return;
  if (i < 0 || i >= host.editor.plan.floors.length) return;
  host.editor.setFloor(i);
  host.activeFloorIndex = i;
}

export function onUndoPoint(host: BmsFloorplanCard): void {
  host.editor?.undoPoint();
}

export function onUndo(host: BmsFloorplanCard): void {
  host.editor?.undo();
}

export function onRedo(host: BmsFloorplanCard): void {
  host.editor?.redo();
}

export function onMergeWalls(host: BmsFloorplanCard): void {
  host.editor?.mergeWalls();
}

export function onAutoFloors(host: BmsFloorplanCard): void {
  host.editor?.autoFloors();
}

export function onSetCameraDistance(host: BmsFloorplanCard, e: Event): void {
  const v = humanNum((e.target as HTMLInputElement).value);
  if (!Number.isNaN(v)) host.editor?.setCameraDistance(v);
}

export function onSetBrightness(host: BmsFloorplanCard, e: Event): void {
  const v = humanNum((e.target as HTMLInputElement).value);
  if (!Number.isNaN(v)) host.editor?.setBrightness(v);
}

export function onSetSpread(host: BmsFloorplanCard, e: Event): void {
  const v = humanNum((e.target as HTMLInputElement).value);
  if (!Number.isNaN(v)) host.editor?.setSpread(v);
}

export function onSetCount(host: BmsFloorplanCard, e: Event): void {
  const v = parseInt((e.target as HTMLInputElement).value, 10);
  if (!Number.isNaN(v)) host.editor?.setCount(v);
}

// -- Manual room zones --
export function onAddZone(host: BmsFloorplanCard): void {
  host.editor?.addZone();
}

export function onSelectZone(host: BmsFloorplanCard, id: string | null): void {
  host.editor?.selectZone(id);
}

export function onSetZoneName(host: BmsFloorplanCard, id: string, e: Event): void {
  host.editor?.setZoneName(id, (e.target as HTMLInputElement).value);
}

export function onSetZoneParent(host: BmsFloorplanCard, id: string, e: Event): void {
  const v = (e.target as HTMLSelectElement).value;
  host.editor?.setZoneParent(id, v || null);
  if (host.editor) host.editZones = [...host.editor.zones];
}

export function onSetZoneSensor(host: BmsFloorplanCard, id: string, kind: 'temp' | 'floor' | 'humidity', e: Event): void {
  host.editor?.setZoneSensor(id, kind, (e.target as HTMLSelectElement).value);
  if (host.editor) host.editZones = [...host.editor.zones];
}

export function onZonePlace(host: BmsFloorplanCard): void {
  host.editor?.beginZonePlace();
}

export function onToggleZoneDevice(host: BmsFloorplanCard, id: string, entityId: string): void {
  host.editor?.toggleZoneDevice(id, entityId);
}

export function onMoveZone(host: BmsFloorplanCard, id: string, dir: -1 | 1): void {
  host.editor?.moveZone(id, dir);
}

export function onMoveZoneEntity(host: BmsFloorplanCard, id: string, entityId: string, dir: -1 | 1): void {
  host.editor?.moveZoneEntity(id, entityId, dir);
}

export function onDeleteZone(host: BmsFloorplanCard, id: string): void {
  host.editor?.deleteZone(id);
}

export function onSetOpeningVariant(host: BmsFloorplanCard, e: Event): void {
  host.editor?.setOpeningVariant((e.target as HTMLSelectElement).value);
}

export function onSetOpeningKind(host: BmsFloorplanCard, e: Event): void {
  host.editor?.setOpeningKind((e.target as HTMLSelectElement).value as 'door' | 'window' | 'opening');
}

export function onSetOpeningWidth(host: BmsFloorplanCard, e: Event): void {
  const v = humanNum((e.target as HTMLInputElement).value);
  if (!Number.isNaN(v) && v > 0) host.editor?.setOpeningWidth(v);
}

export function onToggleSnap(host: BmsFloorplanCard): void {
  if (!host.editor) return;
  host.editSnap = !host.editSnap;
  host.editor.setSnap(host.editSnap);
}

export function onSetColor(host: BmsFloorplanCard, e: Event): void {
  const color = (e.target as HTMLInputElement).value;
  host.editor?.setColor(color);
}

export function onSetFurnScale(host: BmsFloorplanCard, axis: 0 | 1 | 2, e: Event): void {
  const v = humanNum((e.target as HTMLInputElement).value);
  if (!Number.isNaN(v)) host.editor?.setFurnitureScale(axis, v);
}

export function onSetMaterial(host: BmsFloorplanCard, e: Event): void {
  host.editor?.setSurfaceMaterial((e.target as HTMLSelectElement).value);
}

export function onNudgeHeight(host: BmsFloorplanCard, delta: number): void {
  host.editor?.nudgeHeight(delta);
}

export function onSlideOpening(host: BmsFloorplanCard, delta: number): void {
  host.editor?.nudgeOpeningPosition(delta);
}

export function onSetWallLength(host: BmsFloorplanCard, e: Event): void {
  const v = humanNum((e.target as HTMLInputElement).value);
  if (!Number.isNaN(v) && v > 0) host.editor?.setWallLength(v);
}

export function onSetWallThickness(host: BmsFloorplanCard, e: Event): void {
  const v = humanNum((e.target as HTMLInputElement).value);
  if (!Number.isNaN(v) && v > 0) host.editor?.setWallThickness(v);
}

export function onSetWallAngle(host: BmsFloorplanCard, e: Event): void {
  const v = humanNum((e.target as HTMLInputElement).value);
  if (!Number.isNaN(v)) host.editor?.setWallAngle(v);
}

export function onDeleteWallOpening(host: BmsFloorplanCard, i: number): void {
  host.editor?.deleteWallOpening(i);
}

export function onDeleteRoomOpening(host: BmsFloorplanCard, i: number): void {
  host.editor?.deleteRoomOpening(i);
}

export function onAddFloor(host: BmsFloorplanCard): void {
  host.editor?.addFloor();
}

export function onAddRoomShape(host: BmsFloorplanCard, shape: RoomShape): void {
  host.editor?.addRoomShape(shape);
}

/** Import a 2D plan image as a tracing underlay (reference). */
export function onPickUnderlay(host: BmsFloorplanCard, e: Event): void {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file || !host.editor) return;
  const reader = new FileReader();
  reader.onload = () => {
    const url = String(reader.result || '');
    const img = new Image();
    img.onload = () => {
      // Скан подложки клали в план КАК ЕСТЬ: файл на 4 МБ превращался в 5,3 МБ
      // текста внутри плана, который потом уезжает на каждый планшет. Фото
      // комнат ужимаются давно — здесь этого не делали. Ужимаем и тут, но
      // мягче: по кальке чертят, мельче 2048 px нельзя.
      const MAX = 2048;
      const scale = Math.min(1, MAX / Math.max(img.naturalWidth, img.naturalHeight));
      let data = url;
      if (scale < 1 || url.length > 1_500_000) {
        const w = Math.max(1, Math.round(img.naturalWidth * scale));
        const h = Math.max(1, Math.round(img.naturalHeight * scale));
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          try {
            data = canvas.toDataURL('image/jpeg', 0.85);
          } catch {
            data = url; // «испорченный» холст (редко) — лучше тяжёлый скан, чем никакого
          }
        }
      }
      // Размеры передаём ИСХОДНЫЕ: из них берётся только соотношение сторон.
      host.editor?.setUnderlayImage(data, img.naturalWidth, img.naturalHeight);
    };
    img.onerror = () => host.showToast(host.tx('Не удалось прочитать изображение', 'Could not read that image'));
    img.src = url;
  };
  reader.onerror = () => host.showToast(host.tx('Не удалось прочитать файл', 'Could not read that file'));
  reader.readAsDataURL(file);
  input.value = ''; // allow re-picking the same file
}

export function onSetUnderlayField(host: BmsFloorplanCard, field: 'widthM' | 'opacity' | 'rotation', e: Event): void {
  const v = humanNum((e.target as HTMLInputElement).value);
  host.editor?.setUnderlayField(field, v);
}

export function onNudgeUnderlay(host: BmsFloorplanCard, dx: number, dz: number): void {
  host.editor?.nudgeUnderlay(dx, dz);
}

export function onRemoveUnderlay(host: BmsFloorplanCard): void {
  host.editor?.removeUnderlay();
}

export function onCalibrateUnderlay(host: BmsFloorplanCard): void {
  host.editor?.startUnderlayCalibration();
}

export function onFinishWall(host: BmsFloorplanCard): void {
  host.editor?.finishChain();
}

export function onSetRoomField(host: BmsFloorplanCard, field: 'name' | 'width' | 'depth' | 'height' | 'rotation', e: Event): void {
  host.editor?.setRoomField(field, (e.target as HTMLInputElement).value);
}

/** Set the focused manual room's (zone's) design photo from a typed URL. */
export function onSetZoneBg(host: BmsFloorplanCard, id: string, e: Event): void {
  host.editor?.setZoneBgImage(id, (e.target as HTMLInputElement).value);
}

export function onClearZoneBg(host: BmsFloorplanCard, id: string): void {
  host.editor?.setZoneBgImage(id, '');
}

export function onUploadZoneBg(host: BmsFloorplanCard, id: string, e: Event): void {
  pickDesignPhoto(host, e, (data) => host.editor?.setZoneBgImage(id, data));
}

/** Read a design photo picked from the device and hand the encoded image to
 *  `apply`. The picture is downscaled and re-encoded first, so the per-user
 *  plan JSON (synced to the tablet every ~10s) doesn't balloon with a
 *  full-resolution photo. */
export function pickDesignPhoto(host: BmsFloorplanCard, e: Event, apply: (data: string) => void): void {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file || !host.editor) return;
  const reader = new FileReader();
  reader.onload = () => {
    const src = String(reader.result || '');
    const img = new Image();
    img.onload = () => {
      const MAX = 1280; // cap the long edge
      const scale = Math.min(1, MAX / Math.max(img.naturalWidth, img.naturalHeight));
      const w = Math.max(1, Math.round(img.naturalWidth * scale));
      const h = Math.max(1, Math.round(img.naturalHeight * scale));
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      let data = src;
      if (ctx) {
        ctx.drawImage(img, 0, 0, w, h);
        try {
          data = canvas.toDataURL('image/jpeg', 0.82);
        } catch {
          data = src; // tainted/oversized — fall back to the original
        }
      }
      apply(data);
    };
    img.onerror = () => host.showToast('Не удалось прочитать изображение');
    img.src = src;
  };
  reader.onerror = () => host.showToast('Не удалось прочитать файл');
  reader.readAsDataURL(file);
  input.value = ''; // allow re-picking the same file
}

export function trackShift(host: BmsFloorplanCard, e: KeyboardEvent) {
  // Новый конструктор сам слушает клавиатуру: Enter фиксирует набранный размер,
  // Escape отменяет начатое. Старый обработчик тут ЛИШНИЙ и, что хуже, съедал
  // Enter через preventDefault — набранные «4,2 × 3,6» просто не применялись
  // (поймано на живом Home Assistant, а не в проверках).
  if (host.editing2) return;
  if (host.editor) host.editor.shiftHeld = e.shiftKey;
  // Undo/redo shortcuts while editing.
  if (host.editing && host.editor && e.type === 'keydown' && (e.ctrlKey || e.metaKey)) {
    const k = e.key.toLowerCase();
    if (k === 'z' && !e.shiftKey) {
      e.preventDefault();
      host.editor.undo();
    } else if (k === 'y' || (k === 'z' && e.shiftKey)) {
      e.preventDefault();
      host.editor.redo();
    }
  }
  // Enter finishes the current wall run; Escape cancels it.
  if (host.editing && host.editor && e.type === 'keydown') {
    if (e.key === 'Enter') {
      e.preventDefault();
      host.editor.finishChain();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      host.editor.cancelChain();
    }
  }
}

export async function onDeleteFloor(host: BmsFloorplanCard): Promise<void> {
  const ok = await askConfirm(host, 
    host.tx('Удалить этаж?', 'Delete this floor?'),
    host.tx('Этаж и всё, что на нём, будут удалены.', 'The floor and everything on it will be removed.'),
    host.tx('Удалить', 'Delete'),
  );
  if (ok) host.editor?.deleteFloor();
}

export function pickModel(host: BmsFloorplanCard, model: string): void {
  if (!host.editor) return;
  host.editor.selectedModel = model;
  host.editSelectedModel = model;
  host.paletteOpen = false;
}

export function togglePalette(host: BmsFloorplanCard): void {
  host.paletteOpen = !host.paletteOpen;
}

export function onRotateSelected(host: BmsFloorplanCard): void {
  host.editor?.rotateSelected();
}

export function onDeleteSelected(host: BmsFloorplanCard): void {
  host.editor?.deleteSelected();
}

/** Bind an entity to a specific opening (`part`) of a model (part 0 = whole). */
export function onPickEntityPart(host: BmsFloorplanCard, e: Event, part: number): void {
  const entityId = (e.target as HTMLSelectElement).value || null;
  host.editor?.bindEntity(entityId, part);
  host.requestUpdate();
  host.showToast(entityId
    ? host.tx(`Привязано: ${entityId}`, `Bound ${entityId}`)
    : host.tx('Привязка снята', 'Binding cleared'));
}

/** Перевод сообщений редактора (src/editor/editor-controller.ts) на русский.
 *
 *  Английская плюрализация («1 wall added» / «3 walls added») в русском не
 *  работает вовсе: стена/стены/стен — три формы. Считает их ruPlural, готовая
 *  функция проекта; сюда же сведены и остальные фразы редактора.
 *
 *  Неизвестная фраза возвращается как есть: лучше английский текст, чем
 *  проглоченное сообщение. */
export function editorMessage(host: BmsFloorplanCard, msg: string): string {
  if (!host.isRu) return msg;

  // --- фразы с числами ---
  let m = /^(\d+) walls? added$/.exec(msg);
  if (m) {
    const n = Number(m[1]);
    return `Добавлено ${n} ${ruPlural(n, 'стена', 'стены', 'стен')}`;
  }
  m = /^Curved wall — (\d+) segments?$/.exec(msg);
  if (m) {
    const n = Number(m[1]);
    return `Круглая стена — ${n} ${ruPlural(n, 'отрезок', 'отрезка', 'отрезков')}`;
  }
  m = /^Added (\d+) floors?$/.exec(msg);
  if (m) {
    const n = Number(m[1]);
    return `Добавлено ${n} ${ruPlural(n, 'пол', 'пола', 'полов')}`;
  }
  m = /^Added "(.*)" — draw it$/.exec(msg);
  if (m) return `Добавлен «${m[1]}» — начертите его`;
  m = /^Scale set — (.*) m across those points$/.exec(msg);
  if (m) return `Масштаб задан: между точками ${m[1]} м`;
  m = /^Walls merged: (\d+) → (\d+)$/.exec(msg);
  if (m) return `Стены объединены: ${m[1]} → ${m[2]}`;
  m = /^(Door|Window|Opening) added — select the wall to edit\/delete it$/.exec(msg);
  if (m) {
    const word = { Door: 'Дверь добавлена', Window: 'Окно добавлено', Opening: 'Проём добавлен' }[m[1]]!;
    return `${word} — выберите стену, чтобы изменить или удалить`;
  }

  // --- фразы без чисел ---
  const fixed: Record<string, string> = {
    'Cannot delete the only floor': 'Единственный этаж удалить нельзя',
    'Tap on (or near) a wall to place this': 'Коснитесь стены (или рядом с ней), чтобы поставить это',
    'Tap on (or near) a wall to install the garage door': 'Коснитесь стены (или рядом), чтобы встроить гаражные ворота',
    'Garage door installed in wall': 'Гаражные ворота встроены в стену',
    'Glass door cut into wall': 'Стеклянная дверь врезана в стену',
    'Window cut into wall': 'Окно врезано в стену',
    'Tap the floor to place the room icon': 'Коснитесь пола, чтобы поставить значок комнаты',
    'Now tap the second point': 'Теперь коснитесь второй точки',
    'Tap at least 3 corners for a floor': 'Для пола нужно не меньше трёх углов',
    'Floor added': 'Пол добавлен',
    'Room closed — floor added': 'Контур замкнут — пол добавлен',
    'Tap closer to a wall (or room edge)': 'Коснитесь ближе к стене (или к краю комнаты)',
    'Reference image added — set its width (m), then trace walls':
      'Подложка добавлена — укажите её ширину в метрах и обводите стены',
    'Add a reference image first': 'Сначала загрузите подложку',
    'Calibrate: tap two points a known distance apart on the image':
      'Масштаб: отметьте на картинке две точки, расстояние между которыми известно',
    'Reference image removed': 'Подложка убрана',
    'Draw or import some walls first': 'Сначала начертите или загрузите стены',
    'No closed rooms found — make sure walls connect at corners':
      'Замкнутых комнат не найдено — проверьте, что стены сходятся в углах',
    'All rooms already have floors': 'У всех комнат пол уже есть',
    'Nothing to merge': 'Объединять нечего',
  };
  return fixed[msg] ?? msg;
}
