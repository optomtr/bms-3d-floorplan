// ---------------------------------------------------------------------------
// Призраки рисования: точки, полупрозрачные стены и бегущая подпись с длиной и
// углом отрезка. Всё это живёт в previewGroup сцены и стирается целиком перед
// каждой перерисовкой — состояния у слоя нет.
// ---------------------------------------------------------------------------

import * as THREE from 'three';
import type { Vec2, WallDef } from '../types';
import type { TextLabel } from '../scene/labels';
import { arcNodes } from './geometry';
import { isConnection, type SnapResult } from './snapping';

/** На каком расстоянии от первой точки подсвечивается замыкание контура. */
export const CLOSE_DIST = 0.4;

export interface PreviewInput {
  /** 'arc' рисует дугу по трём точкам, остальное — ломаную. */
  arc: boolean;
  chain: Vec2[];
  cursor: Vec2 | null;
  snapInfo: SnapResult | null;
  /** Стены этажа — только чтобы отличить стык от свободной точки. */
  walls: WallDef[];
  elevation: number;
  wallHeight: number;
  label?: TextLabel;
}

export function renderPreview(group: THREE.Group, input: PreviewInput): void {
  const { chain, cursor, snapInfo, walls, elevation: elev, wallHeight: h, label } = input;

  const dot = (p: Vec2, r: number, color: number) => {
    const m = new THREE.Mesh(
      new THREE.SphereGeometry(r, 12, 12),
      new THREE.MeshBasicMaterial({ color }),
    );
    m.position.set(p[0], elev + 0.06, p[1]);
    group.add(m);
  };
  const ghost = (a: Vec2, b: Vec2, color: number, opacity: number) => {
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (len < 1e-3) return;
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(len, h, 0.1),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity }),
    );
    mesh.position.set((a[0] + b[0]) / 2, elev + h / 2, (a[1] + b[1]) / 2);
    mesh.rotation.y = -Math.atan2(b[1] - a[1], b[0] - a[0]);
    group.add(mesh);
  };

  // Дуга: тап 1 — начало, тап 2 — конец, затем курсор выгибает дугу; она
  // показывается цепочкой зелёных призрачных отрезков.
  if (input.arc && chain.length >= 1) {
    const nodes =
      chain.length === 2 && cursor
        ? arcNodes(chain[0], chain[1], cursor)
        : [...chain, ...(cursor ? [cursor] : [])];
    for (const p of nodes) dot(p, 0.07, 0x4fd06a);
    for (let i = 0; i < nodes.length - 1; i++) ghost(nodes[i], nodes[i + 1], 0x4fd06a, 0.4);
    if (label) {
      if (chain.length === 2 && cursor) {
        const seg = nodes.length - 1;
        const mid = nodes[Math.floor(nodes.length / 2)];
        label.setText(`arc · ${seg} seg`, '#7CFC8A');
        label.setPosition(mid[0], elev + h + 0.4, mid[1]);
        label.sprite.visible = true;
      } else {
        label.sprite.visible = false;
      }
    }
    return;
  }

  const pts = cursor ? [...chain, cursor] : [...chain];

  // Вершины. Точка, попавшая на конец существующей стены, получает крупный
  // зелёный узел «стык» — видно, что две стены соединились.
  for (const p of pts) {
    const connected = isConnection(walls, p);
    dot(p, connected ? 0.12 : 0.07, connected ? 0x4fd06a : 0x44aaff);
  }

  // Призраки отрезков. Активный (последний) зеленеет, когда сработал магнит
  // (длина совпала с соседней стеной или отрезок параллелен ей).
  for (let i = 0; i < pts.length - 1; i++) {
    const isActive = i === pts.length - 2 && !!cursor;
    const aided = isActive && snapInfo && (snapInfo.matchedLen || snapInfo.parallel);
    ghost(pts[i], pts[i + 1], aided ? 0x4fd06a : 0x44aaff, aided ? 0.5 : 0.35);
  }

  // Живая подпись на активном отрезке.
  if (label) {
    if (cursor && chain.length >= 1 && snapInfo) {
      const a = chain[chain.length - 1];
      const b = cursor;
      const tags = `${snapInfo.parallel ? ' ∥' : ''}${snapInfo.matchedLen ? ' =' : ''}`;
      label.setText(
        `${snapInfo.lengthM.toFixed(2)}m  ${Math.round(((snapInfo.angleDeg % 360) + 360) % 360)}°${tags}`,
        snapInfo.matchedLen || snapInfo.parallel ? '#7CFC8A' : '#ffffff',
      );
      label.setPosition((a[0] + b[0]) / 2, elev + h + 0.4, (a[1] + b[1]) / 2);
      label.sprite.visible = true;
    } else {
      label.sprite.visible = false;
    }
  }

  // Подсветка замыкания, когда курсор подошёл к первой точке.
  if (chain.length >= 2 && cursor) {
    const s = chain[0];
    if (Math.hypot(cursor[0] - s[0], cursor[1] - s[1]) < CLOSE_DIST) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.22, 0.04, 8, 24),
        new THREE.MeshBasicMaterial({ color: 0x4fd06a }),
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.set(s[0], elev + 0.06, s[1]);
      group.add(ring);
    }
  }
}
