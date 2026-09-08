// ---------------------------------------------------------------------------
// ОБОЛОЧКА нового конструктора: раскладка «план сверху + 3D рядом».
//
// Настольный экран: слева план (главный, занимает больше места), справа живое
// 3D — видно, что получается, пока чертишь. Границу между ними можно двигать,
// 3D можно свернуть.
//
// Планшет книжный (узкая карточка): две вкладки «План» и «3D». Обе панели
// ОСТАЮТСЯ В РАЗМЕТКЕ — переключение прячет их через visibility, поэтому
// движок не размонтируется и состояние черчения при переключении не теряется.
//
// Холст 3D один на карточку (.viewport создаётся до редактора и живёт вне
// нашей разметки), поэтому здесь стоит место-заглушка .e2-3d-slot, а холст
// ставится ровно на него переменными CSS — см. syncViewport.
// ---------------------------------------------------------------------------

import { html, nothing } from 'lit';
import type { BmsFloorplanCard } from '../../../ha-3d-floorplan-card';
import { exitEditor2, nudgeSplit, setTab2, startSplitDrag, toggleThree2 } from '../../editor2-commands';
import { onSavePlan } from '../../projects';
import { renderE2Inspector } from './inspector';
import { renderE2Palette } from './palette';
import { renderE2Project } from './project';
import { renderE2Toolbar } from './toolbar';
import { e2Btn } from './parts';

/** Доля высоты правой колонки, отданная 3D. Остальное — инспектор. */
const THREE_FRACTION = '46%';

export function renderEditor2(host: BmsFloorplanCard) {
  const st = host.e2;
  if (!st) return nothing;
  const height = host.config?.height ?? '500px';
  // Свёрнутое 3D не должно оставлять за собой пустую колонку: правая полоса
  // сжимается до ширины инспектора.
  const side = st.showThree ? st.sideW : 320;
  const style = `height:${height};--e2-side:${side}px;--e2-3d-h:${st.showThree ? THREE_FRACTION : '0px'}`;
  const planHidden = st.narrow && st.tab === '3d';
  const threeHidden = !st.showThree || (st.narrow && st.tab !== '3d');
  // В книжной раскладке инспектор — нижняя шторка, и она поднимается ТОЛЬКО
  // над выбранным объектом: иначе она навсегда отъела бы у плана 46 % экрана
  // ради свойств этажа, которые лежат в ящике «Проект».
  const sheet = st.narrow && st.tab === 'plan' && !!st.selection;
  const inspectHidden = st.narrow && !sheet;

  return html`
    <div class="e2-shell ${st.narrow ? 'narrow' : 'wide'}" style=${style}>
      ${renderTopBar(host)}
      ${renderE2Toolbar(host)}
      <div class="e2-body">
        <div class="e2-panes">
          <div class="e2-plan ${planHidden ? 'hidden' : ''} ${sheet ? 'with-sheet' : ''}">
            <!-- Сюда движок монтирует поверхность черчения (см. mountEditor2). -->
            <div class="e2-plan-host"></div>
            ${st.status ? html`<div class="e2-status" role="status">${st.status}</div>` : nothing}
          </div>
          ${!st.narrow && st.showThree
            ? html`<div
                class="e2-grip"
                role="separator"
                tabindex="0"
                aria-label="Граница между планом и 3D. Стрелками влево и вправо шире или уже"
                aria-orientation="vertical"
                @pointerdown=${(e: PointerEvent) => startSplitDrag(host, e)}
                @keydown=${(e: KeyboardEvent) => {
                  if (e.key === 'ArrowLeft') { e.preventDefault(); nudgeSplit(host, 40); }
                  if (e.key === 'ArrowRight') { e.preventDefault(); nudgeSplit(host, -40); }
                }}
              ></div>`
            : nothing}
          <div class="e2-3d-slot ${threeHidden ? 'hidden' : ''}" aria-label="Трёхмерный вид"></div>
          <div class="e2-inspect-wrap ${inspectHidden ? 'hidden' : ''}">${renderE2Inspector(host)}</div>
        </div>
      </div>
      ${st.paletteOpen ? renderE2Palette(host) : nothing}
      ${st.projectOpen ? renderE2Project(host) : nothing}
    </div>
  `;
}

function renderTopBar(host: BmsFloorplanCard) {
  const st = host.e2!;
  const floors = st.plan.floors;
  return html`
    <div class="e2-top">
      ${e2Btn(host, {
        icon: 'layers', label: host.editPlanName || 'Проект',
        hint: 'Проект, этажи, подложка, перенос из старой версии',
        cls: 'e2-top-btn', act: 'project',
        onClick: () => { st.projectOpen = true; host.requestUpdate(); },
      })}
      ${floors.length > 1
        ? html`<span class="e2-top-floor" title="Этаж, который правим">
            ${floors[st.floorIndex]?.name || `Этаж ${st.floorIndex + 1}`}
          </span>`
        : nothing}
      ${st.narrow
        ? html`<div class="e2-tabs" role="tablist" aria-label="Что на экране">
            <button class="e2-tab ${st.tab === 'plan' ? 'on' : ''}" role="tab" data-tab="plan"
              aria-selected=${st.tab === 'plan' ? 'true' : 'false'}
              @click=${() => setTab2(host, 'plan')}>План</button>
            <button class="e2-tab ${st.tab === '3d' ? 'on' : ''}" role="tab" data-tab="3d"
              aria-selected=${st.tab === '3d' ? 'true' : 'false'}
              @click=${() => setTab2(host, '3d')}>3D</button>
          </div>`
        : e2Btn(host, {
            icon: st.showThree ? 'chevRight' : 'chevLeft',
            label: st.showThree ? 'Свернуть 3D' : 'Показать 3D',
            hint: st.showThree ? 'Отдать плану всю ширину' : 'Показать трёхмерный вид рядом с планом',
            cls: 'e2-top-btn', act: 'toggle-3d', onClick: () => toggleThree2(host),
          })}
      <span class="e2-top-gap"></span>
      <!-- data-act="save" — по нему сохранение находят и автопроверки. -->
      ${e2Btn(host, {
        icon: 'save', label: 'Сохранить', hint: 'Сохранить проект, не выходя из конструктора',
        cls: 'e2-top-btn', act: 'save', onClick: () => onSavePlan(host),
      })}
      ${e2Btn(host, {
        icon: 'check', label: 'Готово', hint: 'Сохранить и вернуться к просмотру',
        cls: 'e2-top-btn primary', act: 'done', onClick: () => void exitEditor2(host),
      })}
    </div>
  `;
}
