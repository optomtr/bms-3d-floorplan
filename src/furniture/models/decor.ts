// ---------------------------------------------------------------------------
// Декор — модели библиотеки мебели.
//
// Каждая модель возвращает THREE.Group с началом координат в центре пятна
// на полу (y = 0). Порядок ключей в палитре задаёт MODEL_ORDER в ./index.ts,
// а не порядок записей в этом файле.
// ---------------------------------------------------------------------------

import * as THREE from 'three';
import { mat, box, cyl, tint, WOOD, METAL, WHITE, GLASS, type FurnitureBuilder } from '../primitives';

export const decorModels = {
  mirror: (c) => {
    const g = new THREE.Group();
    g.add(tint(box(0.6, 0.9, 0.04, mat(METAL), 0, 0, 0), c));
    g.add(box(0.5, 0.8, 0.01, mat(0xaad4e0, { metalness: 0.9, roughness: 0.1 }), 0, 0, 0.03));
    return g;
  },
  plant: (c) => {
    const g = new THREE.Group();
    g.add(cyl(0.16, 0.2, 0.3, mat(0x8a5a30), 0, 0.15, 0));
    g.add(tint(new THREE.Mesh(new THREE.IcosahedronGeometry(0.32, 0), mat(0x3f7d3f)), c).translateY(0.6) as THREE.Mesh);
    return g;
  },
  rug: (c) => {
    const g = new THREE.Group();
    g.add(tint(box(2.0, 0.02, 1.4, mat(0x884444), 0, 0.012, 0), c));
    return g;
  },
  // Generic fallback marker so an unknown model key still renders something.
  painting: (c) => {
    const g = new THREE.Group();
    g.add(tint(box(0.7, 0.5, 0.04, mat(WOOD), 0, 0, 0), c));
    g.add(box(0.6, 0.4, 0.01, mat(0x6688aa), 0, 0, 0.03));
    return g;
  },
  wall_clock: (c) => {
    const g = new THREE.Group();
    const face = cyl(0.18, 0.18, 0.04, mat(WHITE), 0, 0, 0, 24);
    face.rotateX(Math.PI / 2);
    g.add(tint(face, c));
    return g;
  },
  piano: (c) => {
    const g = new THREE.Group();
    g.add(tint(box(1.5, 0.9, 0.6, mat(0x16181c), 0, 0.45, 0), c));
    g.add(box(1.4, 0.06, 0.25, mat(WHITE), 0, 0.78, 0.18)); // keys
    return g;
  },
  floor_vase: (c) => {
    const g = new THREE.Group();
    g.add(tint(cyl(0.1, 0.18, 0.7, mat(0xb5651d), 0, 0.35, 0, 20), c));
    g.add(cyl(0.12, 0.1, 0.08, mat(0xb5651d), 0, 0.74, 0, 20));
    for (const dx of [-0.05, 0.05, 0]) g.add(box(0.012, 0.5, 0.012, mat(0x3a6b3a), dx, 1.0, 0));
    return g;
  },
  aquarium: (c) => {
    const g = new THREE.Group();
    g.add(box(1.0, 0.5, 0.4, mat(WOOD), 0, 0.25, 0)); // stand
    g.add(box(0.95, 0.18, 0.38, mat(0x2a6fa0, { transparent: true, opacity: 0.55 }), 0, 0.62, 0)); // water
    g.add(tint(box(0.96, 0.46, 0.39, mat(GLASS, { transparent: true, opacity: 0.28, metalness: 0.1 }), 0, 0.73, 0), c));
    return g;
  },
  pool_table: (c) => {
    const g = new THREE.Group();
    g.add(box(2.1, 0.16, 1.2, mat(WOOD), 0, 0.68, 0)); // rails
    g.add(tint(box(1.96, 0.06, 1.06, mat(0x1f7a3d), 0, 0.79, 0), c)); // felt
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const)
      g.add(box(0.14, 0.6, 0.14, mat(WOOD), sx * 0.95, 0.3, sz * 0.5));
    return g;
  },
  vase: (c) => {
    const g = new THREE.Group();
    g.add(tint(cyl(0.06, 0.1, 0.28, mat(0xdfe6ea, { metalness: 0.1, roughness: 0.3 }), 0, 0.14, 0, 18), c));
    for (const dx of [-0.03, 0.03, 0]) g.add(box(0.01, 0.3, 0.01, mat(0x3a6b3a), dx, 0.4, 0));
    return g;
  },
  fireplace: (c) => {
    const g = new THREE.Group();
    const stone = mat(0x8a8a86, { roughness: 1 });
    g.add(tint(box(1.4, 1.2, 0.4, stone, 0, 0.6, 0), c));
    g.add(box(0.9, 0.7, 0.26, mat(0x141414), 0, 0.5, 0.1));
    g.add(box(0.74, 0.36, 0.18, mat(0xff7a30, { emissive: 0xff5a1a }), 0, 0.4, 0.14)); // fire glow
    g.add(box(1.5, 0.1, 0.5, stone, 0, 1.22, 0)); // mantel
    return g;
  },
  marker: (c) => {
    const g = new THREE.Group();
    g.add(tint(cyl(0, 0.12, 0.3, mat(0xff5555), 0, 0.15, 0, 8), c));
    return g;
  },
} satisfies Record<string, FurnitureBuilder>;
