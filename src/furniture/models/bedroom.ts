// ---------------------------------------------------------------------------
// Спальня — модели библиотеки мебели.
//
// Каждая модель возвращает THREE.Group с началом координат в центре пятна
// на полу (y = 0). Порядок ключей в палитре задаёт MODEL_ORDER в ./index.ts,
// а не порядок записей в этом файле.
// ---------------------------------------------------------------------------

import * as THREE from 'three';
import { mat, box, cyl, tint, WOOD, FABRIC, METAL, WHITE, DARK, type FurnitureBuilder } from '../primitives';

export const bedroomModels = {
  bed: (c) => {
    const g = new THREE.Group();
    const uph = mat(FABRIC, { roughness: 0.9 });   // upholstery: base + headboard + duvet (shared so one tint recolors all)
    const linen = mat(WHITE, { roughness: 0.85 });  // mattress, turned-down sheet, pillows
    const foot = mat(DARK, { roughness: 0.6 });
    // short feet at the four corners
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const)
      g.add(box(0.1, 0.1, 0.1, foot, sx * 0.82, 0.05, sz * 0.92));
    // upholstered base / valance — MAIN tinted surface (shared uph material recolors every upholstered part)
    g.add(tint(box(1.9, 0.3, 2.15, uph, 0, 0.25, 0), c));
    g.add(box(1.86, 0.06, 2.11, uph, 0, 0.41, 0)); // chamfer rail stacked on the base
    // mattress
    g.add(box(1.8, 0.22, 1.98, linen, 0, 0.51, 0.05));
    // duvet — drapes slightly past the mattress edges
    g.add(box(1.84, 0.12, 1.3, uph, 0, 0.68, 0.39));
    // folded-back sheet turn-down over the head of the duvet
    const fold = box(1.84, 0.07, 0.22, linen, 0, 0.74, -0.2);
    fold.rotation.x = -0.12;
    g.add(fold);
    // two pillows propped at the head
    for (const sx of [-1, 1] as const) {
      const p = box(0.74, 0.16, 0.44, linen, sx * 0.42, 0.71, -0.62);
      p.rotation.x = -0.18;
      g.add(p);
    }
    // tall upholstered headboard: backing panel + padded face + tufted panel grid
    g.add(box(1.9, 1.05, 0.1, uph, 0, 0.725, -1.025));
    g.add(box(1.78, 0.95, 0.06, uph, 0, 0.75, -0.97));
    for (const px of [-0.6, 0, 0.6])
      for (const py of [0.58, 1.02])
        g.add(box(0.54, 0.4, 0.05, uph, px, py, -0.93)); // raised cushions; gaps read as tufting
    return g;
  },
  nightstand: (c) => {
    const g = new THREE.Group();
    const wood = mat(WOOD, { roughness: 0.6 });     // carcass + drawer fronts + top (shared -> recolor together)
    const dark = mat(DARK, { roughness: 0.6 });
    const metal = mat(METAL, { roughness: 0.3, metalness: 0.6 });
    // four short tapered legs
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const)
      g.add(cyl(0.02, 0.03, 0.12, dark, sx * 0.2, 0.06, sz * 0.16, 8));
    // carcass — MAIN tinted surface (shared wood material recolors drawers + top too)
    g.add(tint(box(0.46, 0.34, 0.4, wood, 0, 0.29, 0), c));
    // two drawer fronts, sitting slightly proud of the carcass face
    g.add(box(0.42, 0.15, 0.02, wood, 0, 0.21, 0.205));
    g.add(box(0.42, 0.15, 0.02, wood, 0, 0.37, 0.205));
    // slim horizontal bar handles
    g.add(box(0.16, 0.015, 0.02, metal, 0, 0.235, 0.22));
    g.add(box(0.16, 0.015, 0.02, metal, 0, 0.395, 0.22));
    // thin overhanging top
    g.add(box(0.5, 0.03, 0.44, wood, 0, 0.475, 0));
    return g;
  },
  dresser: (c) => {
    const g = new THREE.Group();
    g.add(tint(box(1.1, 0.85, 0.5, mat(WOOD), 0, 0.42, 0), c));
    for (let i = 0; i < 3; i++) g.add(box(0.9, 0.02, 0.02, mat(METAL), 0, 0.2 + i * 0.25, 0.26));
    return g;
  },
  bunk_bed: (c) => {
    const g = new THREE.Group();
    for (const y of [0.4, 1.4]) {
      g.add(box(1.0, 0.12, 2.0, mat(WOOD), 0, y, 0));
      g.add(tint(box(0.95, 0.12, 1.95, mat(WHITE), 0, y + 0.12, 0), c));
    }
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const)
      g.add(box(0.08, 1.9, 0.08, mat(WOOD), sx * 0.46, 0.95, sz * 0.96));
    return g;
  },
  // ---- Bedroom ----
  crib: (c) => {
    const g = new THREE.Group();
    const w = mat(WHITE);
    g.add(tint(box(0.66, 0.1, 1.16, w, 0, 0.5, 0), c));
    for (const sz of [-1, 1]) g.add(box(0.7, 0.5, 0.04, w, 0, 0.65, sz * 0.58));
    for (const sx of [-1, 1]) g.add(box(0.04, 0.5, 1.2, w, sx * 0.33, 0.65, 0));
    return g;
  },
  vanity: (c) => {
    const g = new THREE.Group();
    const w = mat(WHITE);
    g.add(tint(box(1.0, 0.05, 0.45, w, 0, 0.78, 0), c));
    for (const sx of [-1, 1]) g.add(box(0.36, 0.78, 0.42, w, sx * 0.3, 0.39, 0));
    g.add(box(0.66, 0.66, 0.04, w, 0, 1.2, -0.22)); // mirror frame
    g.add(box(0.6, 0.6, 0.02, mat(0xcfe0e6, { metalness: 0.4, roughness: 0.1 }), 0, 1.2, -0.2));
    return g;
  },
} satisfies Record<string, FurnitureBuilder>;
