// ---------------------------------------------------------------------------
// Панель инструментов — КОРОТКАЯ ПОЛОСА сбоку, а не колонка на пятнадцать
// разделов. Ровно девять инструментов, затем привязка, отмена/возврат и
// «вписать в экран». Всё остальное ушло: свойства — в инспектор (он показывает
// только выбранное), проект и этажи — в выдвижной ящик.
//
// Привязка включается ЭКРАННОЙ КНОПКОЙ и видно, включена ли она: клавиш
// Shift/Ctrl/Alt на планшете нет, а других способов быть не должно.
// ---------------------------------------------------------------------------

import { html } from 'lit';
import type { BmsFloorplanCard } from '../../../ha-3d-floorplan-card';
import type { Tool } from '../../editor2-api';
import { fit2, redo2, setTool2, toggleSnap2, undo2 } from '../../editor2-commands';
import { e2Btn } from './parts';

interface ToolDef {
  id: Tool;
  icon: string;
  label: string;
  hint: string;
}

/** Порядок — рабочий: сначала выбор, потом стены и комнаты, потом проёмы,
 *  потом наполнение. Так его называет монтажник, когда объясняет по телефону. */
export const E2_TOOLS: ToolDef[] = [
  { id: 'select', icon: 'cursor', label: 'Выбор', hint: 'Выбрать и передвинуть объект' },
  { id: 'wall', icon: 'wall', label: 'Стена', hint: 'Чертить стены: длину и угол можно набрать с клавиатуры' },
  { id: 'room', icon: 'rect', label: 'Комната', hint: 'Комната целиком: обвести контур и получить пол со стенами' },
  { id: 'door', icon: 'door', label: 'Дверь', hint: 'Поставить дверь — коснитесь стены' },
  { id: 'window', icon: 'windowIcon', label: 'Окно', hint: 'Поставить окно — коснитесь стены' },
  { id: 'opening', icon: 'opening', label: 'Проём', hint: 'Открытый проём без двери' },
  { id: 'furniture', icon: 'couch', label: 'Мебель', hint: 'Расставить мебель и светильники' },
  { id: 'zone', icon: 'pin', label: 'Зона', hint: 'Комната для управления: значок и список устройств' },
  { id: 'measure', icon: 'ruler', label: 'Мерка', hint: 'Измерить расстояние на плане' },
];

export function renderE2Toolbar(host: BmsFloorplanCard) {
  const st = host.e2!;
  return html`
    <div class="e2-rail" role="toolbar" aria-label="Инструменты конструктора">
      ${E2_TOOLS.map((t) =>
        e2Btn(host, {
          icon: t.icon,
          label: t.label,
          hint: t.hint,
          cls: 'e2-tool',
          act: `tool-${t.id}`,
          active: st.tool === t.id,
          onClick: () => setTool2(host, t.id),
        }),
      )}
      <div class="e2-rail-sep" role="separator"></div>
      ${e2Btn(host, {
        icon: 'magnet',
        label: st.snap ? 'Привязка вкл' : 'Привязка выкл',
        hint: st.snap
          ? 'Привязка включена: углы кратно 45°, ровные длины, выравнивание. Нажмите, чтобы выключить'
          : 'Привязка выключена: линия идёт как ведёте. Нажмите, чтобы включить',
        cls: 'e2-tool e2-snap',
        act: 'snap',
        active: st.snap,
        onClick: () => toggleSnap2(host),
      })}
      ${e2Btn(host, {
        icon: 'undo', label: 'Отменить', hint: 'Отменить последнее действие',
        cls: 'e2-tool', act: 'undo', disabled: !st.canUndo, onClick: () => undo2(host),
      })}
      ${e2Btn(host, {
        icon: 'redo', label: 'Вернуть', hint: 'Вернуть отменённое',
        cls: 'e2-tool', act: 'redo', disabled: !st.canRedo, onClick: () => redo2(host),
      })}
      ${e2Btn(host, {
        icon: 'room', label: 'Весь план', hint: 'Вписать план в экран',
        cls: 'e2-tool', act: 'fit', onClick: () => fit2(host),
      })}
    </div>
  `;
}
