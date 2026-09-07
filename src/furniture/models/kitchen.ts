// ---------------------------------------------------------------------------
// Кухня — модели библиотеки мебели.
//
// Каждая модель возвращает THREE.Group с началом координат в центре пятна
// на полу (y = 0). Порядок ключей в палитре задаёт MODEL_ORDER в ./index.ts,
// а не порядок записей в этом файле.
// ---------------------------------------------------------------------------

import { mat, box, cyl, tint, defineModel, legs4Cyl, WOOD, METAL, WHITE, DARK, GLASS, type FurnitureBuilder } from '../primitives';

export const kitchenModels = {
  kitchen_counter: defineModel((g, c) => {
    g.add(tint(box(2.0, 0.85, 0.6, mat(WHITE), 0, 0.425, 0), c)); // cabinet
    g.add(box(2.05, 0.05, 0.65, mat(DARK), 0, 0.875, 0)); // worktop
  }),
  fridge: defineModel((g, c) => {
    g.add(tint(box(0.7, 1.8, 0.7, mat(METAL), 0, 0.9, 0), c));
    g.add(box(0.04, 0.1, 0.02, mat(DARK), 0.3, 1.3, 0.36)); // handle upper
    g.add(box(0.04, 0.1, 0.02, mat(DARK), 0.3, 0.6, 0.36)); // handle lower
  }),
  stove: defineModel((g, c) => {
    g.add(tint(box(0.6, 0.85, 0.6, mat(METAL), 0, 0.42, 0), c));
    g.add(box(0.55, 0.02, 0.55, mat(DARK), 0, 0.86, 0)); // cooktop
    legs4Cyl(g, 0.08, 0.08, 0.01, mat(0x222222), 0.13, 0.13, 0.875);
  }),
  microwave: defineModel((g, c) => {
    g.add(tint(box(0.5, 0.3, 0.35, mat(DARK), 0, 0.15, 0), c));
    g.add(box(0.32, 0.22, 0.01, mat(0x101418, { emissive: 0x0a1a22 }), -0.05, 0.15, 0.18));
  }),
  dishwasher: defineModel((g, c) => {
    g.add(tint(box(0.6, 0.85, 0.6, mat(METAL), 0, 0.42, 0), c));
    g.add(box(0.5, 0.02, 0.02, mat(DARK), 0, 0.75, 0.31));
  }),
  cooktop: defineModel((g, c) => {
    g.add(tint(box(0.6, 0.04, 0.52, mat(0x141414, { roughness: 0.3, metalness: 0.2 }), 0, 0.9, 0), c));
    for (const [dx, dz] of [[-0.15, -0.13], [0.15, -0.13], [-0.15, 0.13], [0.15, 0.13]] as const)
      g.add(cyl(0.07, 0.07, 0.006, mat(0x2a2a2a), dx, 0.923, dz, 18));
  }),
  dish_rack: defineModel((g, c) => {
    g.add(tint(box(0.42, 0.04, 0.3, mat(METAL, { metalness: 0.5, roughness: 0.4 }), 0, 0.92, 0), c));
    for (let i = 0; i < 5; i++) g.add(box(0.006, 0.16, 0.26, mat(METAL), -0.18 + i * 0.09, 1.0, 0));
  }),
  kitchen_island: defineModel((g, c) => {
    g.add(tint(box(1.6, 0.9, 0.9, mat(WHITE), 0, 0.45, 0), c));
    g.add(box(1.7, 0.05, 1.0, mat(DARK), 0, 0.92, 0)); // worktop
  }),
  bar_counter: defineModel((g, c) => {
    g.add(tint(box(2.0, 1.05, 0.55, mat(WOOD), 0, 0.525, 0), c));
    g.add(box(2.1, 0.05, 0.65, mat(DARK), 0, 1.07, 0));
  }),
  range_hood: defineModel((g, c) => {
    g.add(tint(box(0.9, 0.25, 0.5, mat(METAL), 0, 0, 0), c));
    g.add(box(0.3, 0.4, 0.3, mat(METAL), 0, 0.3, 0));
  }),
  // ---- Kitchen ----
  oven: defineModel((g, c) => {
    g.add(tint(box(0.6, 0.9, 0.6, mat(METAL, { metalness: 0.6, roughness: 0.4 }), 0, 0.45, 0), c));
    g.add(box(0.5, 0.5, 0.02, mat(0x111417, { metalness: 0.3 }), 0, 0.5, 0.3)); // glass door
    g.add(box(0.5, 0.06, 0.04, mat(DARK), 0, 0.78, 0.31)); // handle
    for (const x of [-0.18, -0.06, 0.06, 0.18]) g.add(cyl(0.03, 0.03, 0.04, mat(DARK), x, 0.86, 0.31, 12));
  }),
  kettle: defineModel((g, c) => {
    g.add(cyl(0.11, 0.11, 0.03, mat(DARK), 0, 0.015, 0, 18));
    g.add(tint(cyl(0.09, 0.11, 0.2, mat(METAL, { metalness: 0.5, roughness: 0.3 }), 0, 0.12, 0, 18), c));
    g.add(box(0.04, 0.14, 0.04, mat(DARK), 0, 0.18, -0.11));
  }),
  coffee_machine: defineModel((g, c) => {
    g.add(tint(box(0.26, 0.36, 0.3, mat(DARK), 0, 0.18, 0), c));
    g.add(box(0.2, 0.05, 0.06, mat(METAL), 0, 0.12, 0.16));
    g.add(cyl(0.05, 0.05, 0.08, mat(0x6b4a2f), 0, 0.05, 0.13, 12));
  }),
  toaster: defineModel((g, c) => {
    g.add(tint(box(0.3, 0.18, 0.16, mat(METAL, { metalness: 0.6, roughness: 0.3 }), 0, 0.09, 0), c));
    g.add(box(0.22, 0.02, 0.02, mat(DARK), 0, 0.19, 0));
  }),
  blender: defineModel((g, c) => {
    g.add(box(0.15, 0.1, 0.15, mat(DARK), 0, 0.05, 0));
    g.add(tint(cyl(0.07, 0.06, 0.22, mat(GLASS, { transparent: true, opacity: 0.5 }), 0, 0.21, 0, 14), c));
  }),
  trash_can: defineModel((g, c) => {
    g.add(tint(cyl(0.18, 0.16, 0.5, mat(METAL, { metalness: 0.5, roughness: 0.4 }), 0, 0.25, 0, 20), c));
    g.add(cyl(0.19, 0.19, 0.03, mat(METAL, { metalness: 0.5 }), 0, 0.51, 0, 20));
  }),
} satisfies Record<string, FurnitureBuilder>;
