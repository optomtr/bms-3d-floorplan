// ---------------------------------------------------------------------------
// Рисование плана СВЕРХУ.
//
// Слои снизу вверх: сетка → линейки → полы комнат → стены → проёмы → предметы и
// зоны → выделение → то, что человек чертит прямо сейчас. Порядок и есть
// «читаемость»: подпись длины обязана лежать поверх стены, а призрак будущей
// стены — поверх всего.
//
// Весь слой собирается строкой и разом кладётся в <svg>. Никаких точечных
// правок дерева: план перерисовывается целиком, состояние картинки всегда равно
// состоянию плана, и «подвисшего» узла от прошлого кадра не бывает.
// ---------------------------------------------------------------------------

import type { FloorDef, Vec2 } from '../types';
import { angleDeg, dist, polyArea, polyCentroid } from './geom';
import { openingSpan, wallLength } from './model';
import { fmtM, fmtNum } from './num';
import { renderItems } from './render-items';
import type { Draft, SelRef } from './state';
import { badge, line, polygon, rect, text } from './svg';
import type { View } from './view';

/** Ширина линеек по краям, px. */
export const RULER = 22;

export interface Scene {
  floor: FloorDef | null;
  view: View;
  sel: SelRef | null;
  draft: Draft;
  /** Экранная точка курсора — бегунок на линейках. */
  cursorPx: [number, number] | null;
}

export function renderScene(s: Scene): string {
  const parts: string[] = [];
  parts.push(gridLayer(s.view));
  if (s.floor) {
    parts.push(roomsLayer(s.floor, s.view, s.sel));
    parts.push(wallsLayer(s.floor, s.view, s.sel));
    parts.push(openingsLayer(s.floor, s.view, s.sel));
    parts.push(renderItems(s.floor, s.view, s.sel, s.draft));
  }
  parts.push(rulersLayer(s.view, s.cursorPx));
  return parts.join('');
}

// --- сетка ----------------------------------------------------------------

function gridLayer(v: View): string {
  const { minor, major } = v.gridStep();
  const tl = v.toWorld(0, 0);
  const br = v.toWorld(v.w, v.h);
  const out: string[] = ['<g class="e2-grid">'];
  const draw = (step: number, cls: string) => {
    // Предохранитель: при странном масштабе цикл мог бы уйти на десятки тысяч
    // линий и подвесить вкладку. Больше 600 линий на экране всё равно каша.
    const count = (br[0] - tl[0]) / step + (br[1] - tl[1]) / step;
    if (!Number.isFinite(count) || count > 1200) return;
    for (let x = Math.ceil(tl[0] / step) * step; x <= br[0]; x += step) {
      const px = v.sx(x);
      out.push(line(px, 0, px, v.h, cls));
    }
    for (let y = Math.ceil(tl[1] / step) * step; y <= br[1]; y += step) {
      const py = v.sy(y);
      out.push(line(0, py, v.w, py, cls));
    }
  };
  if (minor < major) draw(minor, 'e2-grid-minor');
  draw(major, 'e2-grid-major');
  // Начало координат: без него на пустом листе непонятно, где ты.
  out.push(line(v.sx(0), 0, v.sx(0), v.h, 'e2-axis'));
  out.push(line(0, v.sy(0), v.w, v.sy(0), 'e2-axis'));
  out.push('</g>');
  return out.join('');
}

// --- линейки --------------------------------------------------------------

function rulersLayer(v: View, cursor: [number, number] | null): string {
  const { major } = v.gridStep();
  const tl = v.toWorld(0, 0);
  const br = v.toWorld(v.w, v.h);
  const out: string[] = ['<g class="e2-rulers">'];
  out.push(rect(0, 0, v.w, RULER, 'e2-ruler-bg'));
  out.push(rect(0, 0, RULER, v.h, 'e2-ruler-bg'));
  const count = (br[0] - tl[0]) / major + (br[1] - tl[1]) / major;
  if (Number.isFinite(count) && count < 400) {
    for (let x = Math.ceil(tl[0] / major) * major; x <= br[0]; x += major) {
      const px = v.sx(x);
      if (px < RULER) continue;
      out.push(line(px, RULER - 5, px, RULER, 'e2-ruler-tick'));
      out.push(text(px + 3, RULER - 8, fmtNum(x, 2), 'e2-ruler-tx'));
    }
    for (let y = Math.ceil(tl[1] / major) * major; y <= br[1]; y += major) {
      const py = v.sy(y);
      if (py < RULER) continue;
      out.push(line(RULER - 5, py, RULER, py, 'e2-ruler-tick'));
      out.push(text(3, py - 4, fmtNum(y, 2), 'e2-ruler-tx'));
    }
  }
  if (cursor) {
    out.push(line(cursor[0], 0, cursor[0], RULER, 'e2-ruler-cursor'));
    out.push(line(0, cursor[1], RULER, cursor[1], 'e2-ruler-cursor'));
  }
  // Масштаб словами: «в экране 12,4 м» честнее любой линейки-полоски. Стоит под
  // верхней линейкой справа — снизу его закрывала бы строка состояния.
  out.push(
    text(v.w - 10, RULER + 15, `в экране ${fmtNum(v.spanM(), 1)} м · сетка ${fmtM(major)}`, 'e2-scale-tx', 'text-anchor="end"'),
  );
  out.push('</g>');
  return out.join('');
}

// --- комнаты --------------------------------------------------------------

function roomsLayer(floor: FloorDef, v: View, sel: SelRef | null): string {
  const out: string[] = ['<g class="e2-rooms">'];
  for (const r of floor.rooms ?? []) {
    const poly = r.polygon ?? [];
    if (poly.length < 3) continue;
    const on = sel?.kind === 'room' && sel.id === r.id;
    const pts = poly.map((p) => [v.sx(p[0]), v.sy(p[1])] as [number, number]);
    const fill = r.color ? ` fill="${r.color}" fill-opacity="0.25"` : '';
    out.push(polygon(pts, `e2-room${on ? ' e2-sel' : ''}`, `data-id="${r.id ?? ''}"${fill}`));
    const c = polyCentroid(poly);
    const area = polyArea(poly);
    const cx = v.sx(c[0]);
    const cy = v.sy(c[1]);
    // Подпись только если комната на экране крупнее плашки — иначе на общем
    // виде названия слипаются в кашу.
    if (Math.sqrt(area) * v.scale > 56) {
      out.push(text(cx, cy - 2, r.name ?? '', 'e2-room-name', 'text-anchor="middle"'));
      out.push(text(cx, cy + 14, `${fmtNum(area, 1)} м²`, 'e2-room-area', 'text-anchor="middle"'));
    }
  }
  out.push('</g>');
  return out.join('');
}

// --- стены ----------------------------------------------------------------

function wallsLayer(floor: FloorDef, v: View, sel: SelRef | null): string {
  const out: string[] = ['<g class="e2-walls">'];
  const labels: string[] = [];
  for (const w of floor.walls ?? []) {
    const a: Vec2 = [v.sx(w.start[0]), v.sy(w.start[1])];
    const b: Vec2 = [v.sx(w.end[0]), v.sy(w.end[1])];
    const on = sel?.kind === 'wall' && sel.id === w.id;
    const sw = Math.max(2, (w.thickness ?? 0.12) * v.scale);
    out.push(line(a[0], a[1], b[0], b[1], `e2-wall${on ? ' e2-sel' : ''}`, `data-id="${w.id ?? ''}" stroke-width="${sw.toFixed(1)}"`));
    // Настоящая длина прямо на чертеже — то, чего не было в перспективе.
    const lenPx = dist(a, b);
    if (lenPx > 46) {
      const len = wallLength(w);
      const mx = (a[0] + b[0]) / 2;
      const my = (a[1] + b[1]) / 2;
      const nx = -(b[1] - a[1]) / lenPx;
      const ny = (b[0] - a[0]) / lenPx;
      const off = sw / 2 + 12;
      labels.push(badge(mx + nx * off, my + ny * off, fmtNum(len, 2), on ? 'e2-dim e2-dim-on' : 'e2-dim'));
    }
  }
  out.push('</g>');
  return out.join('') + `<g class="e2-wall-dims">${labels.join('')}</g>`;
}

// --- проёмы ---------------------------------------------------------------

function openingsLayer(floor: FloorDef, v: View, sel: SelRef | null): string {
  const out: string[] = ['<g class="e2-openings">'];
  for (const w of floor.walls ?? []) {
    const sw = Math.max(2, (w.thickness ?? 0.12) * v.scale);
    for (const o of w.openings ?? []) {
      const [wa, wb] = openingSpan(w, o);
      const a: Vec2 = [v.sx(wa[0]), v.sy(wa[1])];
      const b: Vec2 = [v.sx(wb[0]), v.sy(wb[1])];
      const on = sel?.kind === 'opening' && sel.id === o.id;
      // Дыра в стене: перекрываем кусок стены фоном, потом рисуем символ.
      out.push(line(a[0], a[1], b[0], b[1], 'e2-open-cut', `stroke-width="${(sw + 1.5).toFixed(1)}"`));
      const cls = `e2-open e2-open-${o.kind}${on ? ' e2-sel' : ''}`;
      const attrs = `data-id="${o.id ?? ''}" stroke-width="${Math.max(1.5, sw * 0.5).toFixed(1)}"`;
      if (o.kind === 'window') {
        const nx = -(b[1] - a[1]) / (dist(a, b) || 1);
        const ny = (b[0] - a[0]) / (dist(a, b) || 1);
        const d = sw / 3;
        out.push(line(a[0] + nx * d, a[1] + ny * d, b[0] + nx * d, b[1] + ny * d, cls, attrs));
        out.push(line(a[0] - nx * d, a[1] - ny * d, b[0] - nx * d, b[1] - ny * d, cls, attrs));
      } else {
        out.push(line(a[0], a[1], b[0], b[1], cls, attrs));
      }
      // Косяки: две поперечины по краям — граница проёма видна и без цвета.
      const len = dist(a, b) || 1;
      const nx = -(b[1] - a[1]) / len;
      const ny = (b[0] - a[0]) / len;
      for (const p of [a, b]) {
        out.push(line(p[0] - nx * sw * 0.6, p[1] - ny * sw * 0.6, p[0] + nx * sw * 0.6, p[1] + ny * sw * 0.6, 'e2-open-jamb'));
      }
    }
  }
  out.push('</g>');
  return out.join('');
}

/** Подпись угла и длины отрезка — общий кусок для черчения и для выделения. */
export function segmentBadges(v: View, a: Vec2, b: Vec2, withAngle: boolean): string {
  const sa: Vec2 = [v.sx(a[0]), v.sy(a[1])];
  const sb: Vec2 = [v.sx(b[0]), v.sy(b[1])];
  const len = dist(a, b);
  const mx = (sa[0] + sb[0]) / 2;
  const my = (sa[1] + sb[1]) / 2;
  const out = [badge(mx, my - 16, fmtNum(len, 2), 'e2-dim e2-dim-on')];
  if (withAngle && len > 0.01) out.push(badge(mx, my + 16, `${fmtNum(angleDeg(a, b), 0)}°`, 'e2-dim e2-dim-angle'));
  return out.join('');
}
