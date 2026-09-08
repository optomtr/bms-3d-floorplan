// ---------------------------------------------------------------------------
// Выделение и правка того, что уже начерчено.
//
// Тянуть можно четыре вещи, и все четыре — одним пальцем:
//   • узел (угол дома) — вместе с ним едут ВСЕ стены и вершины комнат, стоящие
//     в этой точке, поэтому угол не рвётся;
//   • стену целиком — оба её конца вместе с примыкающими;
//   • проём — только ВДОЛЬ своей стены и не дальше её краёв;
//   • предмет — по полу, а поворот отдельной ручкой с шагом 15°.
//
// Вся тяга — ОДИН шаг отмены: снимок берётся в начале, сверяется в конце.
// ---------------------------------------------------------------------------

import type { Vec2 } from '../types';
import { snap } from '../editor/geometry';
import { distToSeg, rotationFromVector } from './geom';
import { footprint, modelName } from './furniture-meta';
import { hitTest } from './hit';
import type { ToolHost } from './host';
import { fmtCm, fmtNum } from './num';
import {
  findFurniture,
  findOpening,
  findWall,
  findZone,
  moveVertex,
  moveWall,
  setOpeningOffset,
  wallLength,
} from './model';
import { polyArea } from './geom';
import { rotationHandlePx } from './render-items';

/** Радиус ручки поворота на экране, px. Меньше — не попасть пальцем. */
const ROT_GRAB_PX = 22;
/** Шаг поворота: 15° — та же сетка, что у привязки углов стен. */
const ROT_STEP = 15;

const gridPt = (h: ToolHost, p: Vec2): Vec2 => (h.snapOn ? [snap(p[0]), snap(p[1])] : p);

export function selectTap(h: ToolHost, p: Vec2): void {
  const floor = h.floor();
  if (!floor) return;
  const hit = hitTest(floor, p, h.pickTol());
  if (!hit || hit.kind === 'vertex') {
    h.select(hit && hit.kind === 'vertex' ? h.selection() : null);
    return;
  }
  h.select({ kind: hit.kind, id: hit.id } as never);
}

export function selectDragStart(h: ToolHost, p: Vec2, at: [number, number]): void {
  const floor = h.floor();
  if (!floor) return;

  // Ручка поворота у выбранного предмета важнее всего остального под курсором.
  const sel = h.selection();
  if (sel?.kind === 'furniture') {
    const f = findFurniture(floor, sel.id);
    if (f) {
      const [, fd] = footprint(f.model);
      const hp = rotationHandlePx(h.view, [f.position[0], f.position[2]], fd, f.rotation ?? 0);
      if (Math.hypot(at[0] - hp[0], at[1] - hp[1]) < ROT_GRAB_PX) {
        h.drag.kind = 'rotate';
        h.drag.id = sel.id;
        h.beginDrag();
        return;
      }
    }
  }

  const hit = hitTest(floor, p, h.pickTol());
  if (!hit) return;
  if (hit.kind === 'vertex') {
    h.drag.kind = 'vertex';
    h.drag.vertex = hit.pt;
    h.beginDrag();
    return;
  }
  if (hit.kind === 'room') {
    h.select({ kind: 'room', id: hit.id });
    return;
  }
  h.select({ kind: hit.kind, id: hit.id } as never);
  h.drag.kind = hit.kind;
  h.drag.id = hit.id;
  h.drag.last = gridPt(h, p);
  h.beginDrag();
}

export function selectDragMove(h: ToolHost, p: Vec2): void {
  const floor = h.floor();
  if (!floor || h.drag.kind === 'none') return;

  if (h.drag.kind === 'vertex' && h.drag.vertex) {
    const from = h.drag.vertex;
    const to = h.snapWorld(p, []).pt;
    if (Math.hypot(to[0] - from[0], to[1] - from[1]) < 1e-6) return;
    h.dragMutate(() => moveVertex(floor, from, to));
    h.drag.vertex = to;
    return;
  }

  if (h.drag.kind === 'wall' && h.drag.last) {
    const now = gridPt(h, p);
    const dx = now[0] - h.drag.last[0];
    const dy = now[1] - h.drag.last[1];
    if (!dx && !dy) return;
    const id = h.drag.id;
    h.dragMutate(() => moveWall(floor, id, dx, dy));
    h.drag.last = now;
    return;
  }

  if (h.drag.kind === 'opening') {
    const hit = findOpening(floor, h.drag.id);
    if (!hit) return;
    const seg = distToSeg(p, hit.wall.start as Vec2, hit.wall.end as Vec2);
    const along = seg.t * wallLength(hit.wall);
    const raw = along - hit.opening.width / 2;
    const off = h.snapOn ? snap(raw) : raw;
    const id = h.drag.id;
    h.dragMutate(() => setOpeningOffset(floor, id, off));
    return;
  }

  if (h.drag.kind === 'furniture') {
    const f = findFurniture(floor, h.drag.id);
    if (!f) return;
    const to = gridPt(h, p);
    h.dragMutate(() => {
      f.position = [to[0], f.position[1], to[1]];
    });
    return;
  }

  if (h.drag.kind === 'zone') {
    const z = findZone(floor, h.drag.id);
    if (!z) return;
    const to = gridPt(h, p);
    h.dragMutate(() => {
      z.x = +to[0].toFixed(2);
      z.z = +to[1].toFixed(2);
    });
    return;
  }

  if (h.drag.kind === 'rotate') {
    const f = findFurniture(floor, h.drag.id);
    if (!f) return;
    const raw = rotationFromVector(p[0] - f.position[0], p[1] - f.position[2]);
    const deg = h.snapOn ? Math.round(raw / ROT_STEP) * ROT_STEP : Math.round(raw);
    h.dragMutate(() => {
      f.rotation = deg;
    });
  }
}

export function selectDragEnd(h: ToolHost): void {
  if (h.drag.kind === 'none') return;
  h.endDrag();
  h.drag.kind = 'none';
  h.drag.vertex = null;
  h.drag.last = null;
  h.drag.id = '';
}

/** Что сейчас выбрано — словами и числами. */
export function selectStatus(h: ToolHost): string {
  const floor = h.floor();
  const sel = h.selection();
  if (!floor || !sel) {
    return 'Выберите объект касанием. Два пальца — панорама и масштаб, двойное касание — вписать всё.';
  }
  if (sel.kind === 'wall') {
    const w = findWall(floor, sel.id);
    if (w) return `Стена ${fmtNum(wallLength(w), 2)} м, толщина ${fmtCm(w.thickness ?? 0.12)}. Тяните за концы или за середину.`;
  }
  if (sel.kind === 'room') {
    const r = (floor.rooms ?? []).find((x) => x.id === sel.id);
    if (r) return `Комната «${r.name ?? 'без имени'}», ${fmtNum(polyArea(r.polygon ?? []), 1)} м².`;
  }
  if (sel.kind === 'opening') {
    const hit = findOpening(floor, sel.id);
    if (hit) {
      const ru = hit.opening.kind === 'door' ? 'Дверь' : hit.opening.kind === 'window' ? 'Окно' : 'Проём';
      return `${ru} ${fmtNum(hit.opening.width, 2)} м, ${fmtNum(hit.opening.position, 2)} м от угла. Тяните вдоль стены.`;
    }
  }
  if (sel.kind === 'furniture') {
    const f = findFurniture(floor, sel.id);
    if (f) return `${modelName(f.model)}, поворот ${fmtNum(f.rotation ?? 0, 0)}°. Ручка сбоку поворачивает шагами по 15°.`;
  }
  if (sel.kind === 'zone') {
    const z = findZone(floor, sel.id);
    if (z) return `Зона «${z.name ?? 'без имени'}», устройств: ${(z.entities ?? []).length}.`;
  }
  return 'Выберите объект касанием.';
}
