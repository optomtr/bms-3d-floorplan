// ---------------------------------------------------------------------------
// Предметы, зоны, выделение и то, что чертится прямо сейчас.
//
// Отдельный файл от render.ts по одной причине: подложка (сетка, полы, стены)
// меняется редко и читается спокойно, а этот слой живёт под пальцем и должен
// быть виден целиком — призрак будущей стены, её длина и угол, расстояние
// проёма от угла. Именно этого не хватало в перспективе: цифры были, но не там,
// куда смотрит рука.
// ---------------------------------------------------------------------------

import type { FloorDef, Vec2 } from '../types';
import { angleDeg, dist, furnitureCorners, polyArea, rectPoly } from './geom';
import { footprint, modelName } from './furniture-meta';
import { findWall, openingSpan, wallDir, wallLength } from './model';
import { fmtNum } from './num';
import type { Draft, SelRef } from './state';
import { badge, circle, line, polygon, polyline, text } from './svg';
import type { View } from './view';

/** Насколько ручка поворота отодвинута от края предмета, px. */
const ROT_GAP = 26;

const px = (v: View, p: Vec2): [number, number] => [v.sx(p[0]), v.sy(p[1])];

export function renderItems(floor: FloorDef, v: View, sel: SelRef | null, draft: Draft): string {
  return furnitureLayer(floor, v, sel) + zonesLayer(floor, v, sel) + selectionLayer(floor, v, sel) + draftLayer(floor, v, draft);
}

// --- мебель ---------------------------------------------------------------

/** Экранная точка ручки поворота выбранного предмета (её же ловит нажатие). */
export function rotationHandlePx(v: View, c: Vec2, depthM: number, rotationDeg: number): [number, number] {
  const r = (rotationDeg * Math.PI) / 180;
  const s = px(v, c);
  const reach = (depthM / 2) * v.scale + ROT_GAP;
  return [s[0] + Math.sin(r) * reach, s[1] + Math.cos(r) * reach];
}

function furnitureLayer(floor: FloorDef, v: View, sel: SelRef | null): string {
  const out: string[] = ['<g class="e2-furniture">'];
  for (const f of floor.furniture ?? []) {
    const [fw, fd] = footprint(f.model);
    const c: Vec2 = [f.position[0], f.position[2]];
    const on = sel?.kind === 'furniture' && sel.id === f.id;
    const corners = furnitureCorners(c, fw, fd, f.rotation ?? 0).map((p) => px(v, p));
    out.push(polygon(corners, `e2-furn${on ? ' e2-sel' : ''}`, `data-id="${f.id ?? ''}"`));
    // «Лицо» предмета — короткая черта по передней грани.
    out.push(line(corners[3][0], corners[3][1], corners[2][0], corners[2][1], 'e2-furn-front'));
    if (Math.min(fw, fd) * v.scale > 26) {
      const s = px(v, c);
      out.push(text(s[0], s[1] + 4, modelName(f.model), 'e2-furn-tx', 'text-anchor="middle"'));
    }
  }
  out.push('</g>');
  return out.join('');
}

// --- зоны -----------------------------------------------------------------

function zonesLayer(floor: FloorDef, v: View, sel: SelRef | null): string {
  const out: string[] = ['<g class="e2-zones">'];
  for (const z of floor.zones ?? []) {
    const s = px(v, [z.x, z.z]);
    const on = sel?.kind === 'zone' && sel.id === z.id;
    out.push(circle(s[0], s[1], 13, `e2-zone${on ? ' e2-sel' : ''}`, `data-id="${z.id}"`));
    out.push(text(s[0], s[1] + 4, String((z.entities ?? []).length), 'e2-zone-count', 'text-anchor="middle"'));
    out.push(text(s[0], s[1] + 28, z.name ?? '', 'e2-zone-tx', 'text-anchor="middle"'));
  }
  out.push('</g>');
  return out.join('');
}

// --- выделение ------------------------------------------------------------

function selectionLayer(floor: FloorDef, v: View, sel: SelRef | null): string {
  if (!sel) return '';
  const out: string[] = ['<g class="e2-selection">'];
  if (sel.kind === 'wall') {
    const w = findWall(floor, sel.id);
    if (w) {
      const a = px(v, w.start as Vec2);
      const b = px(v, w.end as Vec2);
      out.push(circle(a[0], a[1], 7, 'e2-handle'));
      out.push(circle(b[0], b[1], 7, 'e2-handle'));
      out.push(badge((a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - 22, `${fmtNum(angleDeg(w.start as Vec2, w.end as Vec2), 0)}°`, 'e2-dim e2-dim-angle'));
    }
  } else if (sel.kind === 'room') {
    const r = (floor.rooms ?? []).find((x) => x.id === sel.id);
    for (const p of r?.polygon ?? []) {
      const s = px(v, p);
      out.push(circle(s[0], s[1], 6, 'e2-handle'));
    }
  } else if (sel.kind === 'opening') {
    for (const w of floor.walls ?? []) {
      const o = (w.openings ?? []).find((x) => x.id === sel.id);
      if (!o) continue;
      const [wa, wb] = openingSpan(w, o);
      const a = px(v, wa);
      const b = px(v, wb);
      out.push(circle(a[0], a[1], 6, 'e2-handle'));
      out.push(circle(b[0], b[1], 6, 'e2-handle'));
      out.push(badge((a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - 20, fmtNum(o.width, 2), 'e2-dim e2-dim-on'));
      // Расстояние от угла — то, чем проём и ставят на стройке.
      const s = px(v, w.start as Vec2);
      out.push(badge((s[0] + a[0]) / 2, (s[1] + a[1]) / 2 + 18, fmtNum(o.position, 2), 'e2-dim'));
    }
  } else if (sel.kind === 'furniture') {
    const f = (floor.furniture ?? []).find((x) => x.id === sel.id);
    if (f) {
      const [, fd] = footprint(f.model);
      const c: Vec2 = [f.position[0], f.position[2]];
      const s = px(v, c);
      const h = rotationHandlePx(v, c, fd, f.rotation ?? 0);
      out.push(line(s[0], s[1], h[0], h[1], 'e2-rot-arm'));
      out.push(circle(h[0], h[1], 11, 'e2-rot-handle'));
      out.push(badge(h[0], h[1] - 24, `${fmtNum(f.rotation ?? 0, 0)}°`, 'e2-dim e2-dim-angle'));
    }
  } else if (sel.kind === 'zone') {
    const z = (floor.zones ?? []).find((x) => x.id === sel.id);
    if (z) {
      const s = px(v, [z.x, z.z]);
      out.push(circle(s[0], s[1], 20, 'e2-zone-ring'));
    }
  }
  out.push('</g>');
  return out.join('');
}

// --- то, что чертится сейчас ----------------------------------------------

function draftLayer(floor: FloorDef, v: View, d: Draft): string {
  const out: string[] = ['<g class="e2-draft">'];
  if (d.mode === 'chain' || d.mode === 'poly') {
    const pts = d.pts.map((p) => px(v, p));
    if (pts.length > 1) out.push(polyline(pts, 'e2-draft-line'));
    for (const p of pts) out.push(circle(p[0], p[1], 5, 'e2-draft-node'));
    const last = d.pts[d.pts.length - 1];
    if (last && d.cursor) {
      const a = px(v, last);
      const b = px(v, d.cursor);
      out.push(line(a[0], a[1], b[0], b[1], 'e2-draft-ghost'));
      out.push(badge((a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - 16, fmtNum(dist(last, d.cursor), 2), 'e2-dim e2-dim-on'));
      out.push(badge((a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 16, `${fmtNum(angleDeg(last, d.cursor), 0)}°`, 'e2-dim e2-dim-angle'));
    }
    // Замыкание: первая точка подсвечивается, когда курсор к ней подошёл.
    if (d.pts.length > 2 && d.cursor && dist(d.pts[0], d.cursor) < 0.35) {
      const f = px(v, d.pts[0]);
      out.push(circle(f[0], f[1], 12, 'e2-draft-close'));
    }
  } else if (d.mode === 'rect' && d.a && d.cursor) {
    const poly = rectPoly(d.a, d.cursor);
    out.push(polygon(poly.map((p) => px(v, p)), 'e2-draft-rect'));
    const w = Math.abs(d.cursor[0] - d.a[0]);
    const h = Math.abs(d.cursor[1] - d.a[1]);
    const p0 = px(v, poly[0]);
    const p2 = px(v, poly[2]);
    out.push(badge((p0[0] + p2[0]) / 2, Math.min(p0[1], p2[1]) - 14, fmtNum(w, 2), 'e2-dim e2-dim-on'));
    out.push(badge(Math.min(p0[0], p2[0]) - 22, (p0[1] + p2[1]) / 2, fmtNum(h, 2), 'e2-dim e2-dim-on'));
    out.push(badge((p0[0] + p2[0]) / 2, (p0[1] + p2[1]) / 2, `${fmtNum(polyArea(poly), 1)} м²`, 'e2-dim e2-dim-area'));
  } else if (d.mode === 'opening' && d.wallId) {
    const w = findWall(floor, d.wallId);
    if (w) {
      const len = wallLength(w);
      const dir = wallDir(w);
      const start = Math.max(0, Math.min(len - d.width, d.along - d.width / 2));
      const a: Vec2 = [w.start[0] + dir[0] * start, w.start[1] + dir[1] * start];
      const b: Vec2 = [a[0] + dir[0] * d.width, a[1] + dir[1] * d.width];
      const sa = px(v, a);
      const sb = px(v, b);
      const ws = px(v, w.start as Vec2);
      const we = px(v, w.end as Vec2);
      out.push(line(sa[0], sa[1], sb[0], sb[1], 'e2-draft-open', `stroke-width="${Math.max(4, (w.thickness ?? 0.12) * v.scale + 2).toFixed(1)}"`));
      out.push(badge((sa[0] + sb[0]) / 2, (sa[1] + sb[1]) / 2 - 18, fmtNum(d.width, 2), 'e2-dim e2-dim-on'));
      out.push(badge((ws[0] + sa[0]) / 2, (ws[1] + sa[1]) / 2 + 18, fmtNum(start, 2), 'e2-dim'));
      out.push(badge((we[0] + sb[0]) / 2, (we[1] + sb[1]) / 2 + 18, fmtNum(Math.max(0, len - start - d.width), 2), 'e2-dim'));
    }
  } else if (d.mode === 'furniture' && d.cursor && d.model) {
    const [fw, fd] = footprint(d.model);
    const corners = furnitureCorners(d.cursor, fw, fd, d.rotation).map((p) => px(v, p));
    out.push(polygon(corners, 'e2-draft-furn'));
    const s = px(v, d.cursor);
    out.push(badge(s[0], s[1] - (fd / 2) * v.scale - 16, `${modelName(d.model)} · ${fmtNum(d.rotation, 0)}°`, 'e2-dim e2-dim-on'));
  }
  // Курсор с привязкой: маленький крест, а на стыке — крупное кольцо.
  if (d.cursor && d.mode !== 'none' && d.mode !== 'opening') {
    const s = px(v, d.cursor);
    out.push(circle(s[0], s[1], d.joined ? 10 : 4, d.joined ? 'e2-cursor-join' : 'e2-cursor'));
  }
  out.push('</g>');
  return out.join('');
}
