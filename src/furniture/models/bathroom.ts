// ---------------------------------------------------------------------------
// Ванная — модели библиотеки мебели.
//
// Каждая модель возвращает THREE.Group с началом координат в центре пятна
// на полу (y = 0). Порядок ключей в палитре задаёт MODEL_ORDER в ./index.ts,
// а не порядок записей в этом файле.
// ---------------------------------------------------------------------------

import * as THREE from 'three';
import { mat, box, cyl, tint, METAL, WHITE, DARK, GLASS, type FurnitureBuilder } from '../primitives';

export const bathroomModels = {
  sink: (c) => {
    const g = new THREE.Group();
    g.add(tint(box(0.6, 0.8, 0.5, mat(WHITE), 0, 0.4, 0), c)); // base
    g.add(box(0.5, 0.08, 0.4, mat(METAL), 0, 0.82, 0)); // basin rim
    g.add(cyl(0.02, 0.02, 0.25, mat(METAL), 0, 0.95, -0.12)); // tap
    return g;
  },
  toilet: (c) => {
    const g = new THREE.Group();
    g.add(tint(cyl(0.22, 0.25, 0.4, mat(WHITE), 0, 0.2, 0.05), c)); // bowl
    g.add(box(0.35, 0.5, 0.18, mat(WHITE), 0, 0.45, -0.18)); // cistern
    g.add(cyl(0.24, 0.24, 0.05, mat(WHITE), 0, 0.42, 0.05)); // seat
    return g;
  },
  // Freestanding bath — an open shell (4 walls + floor) so it reads as a real
  // empty basin, on a slim plinth, with a chrome mixer at one end.
  bathtub: (c) => {
    const g = new THREE.Group();
    const W = 1.7, H = 0.58, D = 0.78, t = 0.09;
    const shell = mat(WHITE, { roughness: 0.3, metalness: 0.05 });
    g.add(box(W - 0.04, 0.05, D - 0.04, mat(0xe4e8eb, { roughness: 0.6 }), 0, 0.025, 0)); // plinth
    g.add(tint(box(W, t, D, shell, 0, 0.05 + t / 2, 0), c)); // tub floor
    const wallH = H - 0.05 - t, cy = 0.05 + t + wallH / 2;
    g.add(tint(box(W, wallH, t, shell, 0, cy, D / 2 - t / 2), c));
    g.add(tint(box(W, wallH, t, shell, 0, cy, -(D / 2 - t / 2)), c));
    g.add(tint(box(t, wallH, D - 2 * t, shell, W / 2 - t / 2, cy, 0), c));
    g.add(tint(box(t, wallH, D - 2 * t, shell, -(W / 2 - t / 2), cy, 0), c));
    const chrome = mat(METAL, { metalness: 0.8, roughness: 0.2 });
    g.add(cyl(0.018, 0.022, 0.2, chrome, -W / 2 + 0.16, H + 0.1, -D / 2 + 0.15, 12)); // riser
    g.add(box(0.14, 0.025, 0.028, chrome, -W / 2 + 0.24, H + 0.185, -D / 2 + 0.15)); // spout
    return g;
  },
  // Built-in OVAL bath — a white oval basin sunk into a tiled surround, the shape
  // drawn on this plan. (bathtub is the rectangular freestanding shell.) The basin
  // is left empty, like bathtub. ~1.9 x 1.0 m.
  bathtub_oval: (c) => {
    const g = new THREE.Group();
    const W = 1.9, D = 1.0, H = 0.55;
    const surround = mat(0xdfd8cb, { roughness: 0.7 });
    const shell = mat(WHITE, { roughness: 0.3, metalness: 0.05 });
    const chrome = mat(METAL, { metalness: 0.8, roughness: 0.2 });
    g.add(tint(box(W, H, D, surround, 0, H / 2, 0), c)); // tiled platform
    g.add(box(W - 0.05, 0.03, D - 0.05, surround, 0, H + 0.012, 0)); // coping
    // The basin is a solid oval drum whose TOP FACE sits below the coping, so from
    // above the platform reads as having an oval opening recessed into it.
    const bh = H - 0.07;
    const basin = cyl(0.74, 0.74, bh, shell, 0, bh / 2, 0, 40);
    basin.scale.z = 0.5; // ellipse: 1.48 m long x 0.74 m wide
    g.add(basin);
    g.add(cyl(0.018, 0.022, 0.18, chrome, -W / 2 + 0.16, H + 0.11, 0, 12)); // riser
    g.add(box(0.14, 0.025, 0.028, chrome, -W / 2 + 0.24, H + 0.19, 0)); // spout
    return g;
  },
  shower: (c) => {
    const g = new THREE.Group();
    g.add(tint(box(0.9, 0.04, 0.9, mat(WHITE), 0, 0.02, 0), c)); // tray
    g.add(box(0.04, 2.0, 0.9, mat(GLASS, { transparent: true, opacity: 0.25 }), -0.43, 1.0, 0));
    g.add(box(0.9, 2.0, 0.04, mat(GLASS, { transparent: true, opacity: 0.25 }), 0, 1.0, -0.43));
    g.add(cyl(0.06, 0.06, 0.04, mat(METAL), 0.3, 1.9, 0.3));
    return g;
  },
  // Wall-hung urinal for the WCs (Сан.узел).
  urinal: (c) => {
    const g = new THREE.Group();
    const white = mat(WHITE, { roughness: 0.35 });
    g.add(tint(box(0.36, 0.6, 0.32, white, 0, 0, -0.02), c)); // bowl body
    g.add(tint(cyl(0.18, 0.14, 0.16, white, 0, -0.18, 0.06, 18), c)); // rounded lip
    g.add(box(0.08, 0.12, 0.06, mat(METAL, { metalness: 0.7, roughness: 0.3 }), 0, 0.42, -0.06)); // flush valve
    return g;
  },
  washing_machine: (c) => {
    const g = new THREE.Group();
    g.add(tint(box(0.6, 0.85, 0.6, mat(WHITE), 0, 0.42, 0), c));
    g.add(cyl(0.2, 0.2, 0.04, mat(DARK), 0, 0.45, 0.31).rotateX(Math.PI / 2) as unknown as THREE.Mesh);
    return g;
  },
  // ---- Bathroom ----
  bidet: (c) => {
    const g = new THREE.Group();
    g.add(tint(box(0.4, 0.4, 0.55, mat(WHITE), 0, 0.2, 0), c));
    g.add(cyl(0.16, 0.18, 0.12, mat(WHITE), 0, 0.42, 0.05, 18));
    return g;
  },
  towel_rack: (c) => {
    const g = new THREE.Group();
    g.add(box(0.6, 0.04, 0.05, mat(METAL, { metalness: 0.6, roughness: 0.3 }), 0, 0.12, 0.04));
    g.add(tint(box(0.5, 0.32, 0.02, mat(WHITE), 0, -0.05, 0.06), c)); // towel
    return g;
  },
  bathroom_cabinet: (c) => {
    const g = new THREE.Group();
    g.add(tint(box(0.6, 0.7, 0.15, mat(WHITE), 0, 0, 0.075), c));
    g.add(box(0.56, 0.66, 0.02, mat(0xcfe0e6, { metalness: 0.4, roughness: 0.1 }), 0, 0, 0.16));
    return g;
  },
  dryer: (c) => {
    const g = new THREE.Group();
    g.add(tint(box(0.6, 0.85, 0.6, mat(WHITE), 0, 0.425, 0), c));
    g.add(cyl(0.22, 0.22, 0.04, mat(0x2a2f36, { metalness: 0.3 }), 0, 0.5, 0.3, 24));
    g.add(box(0.5, 0.08, 0.04, mat(METAL), 0, 0.78, 0.31));
    return g;
  },
  water_heater: (c) => {
    const g = new THREE.Group();
    g.add(tint(cyl(0.25, 0.25, 0.9, mat(WHITE), 0, 0.45, 0, 20), c));
    g.add(cyl(0.25, 0.25, 0.05, mat(METAL), 0, 0.9, 0, 20));
    g.add(box(0.1, 0.1, 0.1, mat(METAL), 0, 0.2, 0.26));
    return g;
  },
  sink_double: (c) => {
    const g = new THREE.Group();
    // Wall-hung double vanity. Built around the countertop plane at local y=0
    // (like the wall-mounted urinal) so, placed at defaultY, the top lands at a
    // realistic ~0.8m: cabinet hangs below (-y), faucets/backsplash/mirrors rise (+y).
    const stone = mat(0xeef1f3, { roughness: 0.28, metalness: 0.08 }); // countertop / basins
    const cab = mat(0xdad0c4, { roughness: 0.7 });                    // cabinet carcass
    const face = mat(0xcabfae, { roughness: 0.6 });                   // door fronts
    const metal = mat(METAL, { metalness: 0.7, roughness: 0.25 });
    const W = 1.4, D = 0.55, tT = 0.04;
    // Countertop slab (top surface at local y=0), chamfered by a slimmer top reveal.
    g.add(tint(box(W, tT, D, stone, 0, -tT / 2, 0), c));              // main slab
    g.add(box(W - 0.06, 0.014, D - 0.06, stone, 0, 0.006, 0));        // rounded top reveal
    g.add(box(W, 0.05, 0.03, stone, 0, 0.025, -D / 2 + 0.015));       // backsplash upstand
    // Wall-hung cabinet under the counter.
    const cw = W - 0.06, ch = 0.44, cd = D - 0.06, cyBody = -tT - ch / 2;
    g.add(box(cw, ch, cd, cab, 0, cyBody, 0.005));                    // cabinet body
    for (const sx of [-1, 1]) {                                       // two door fronts + slim handles
      g.add(box(cw / 2 - 0.02, ch - 0.05, 0.02, face, sx * (cw / 4), cyBody, cd / 2 + 0.006));
      g.add(box(0.018, 0.1, 0.02, metal, sx * 0.018, cyBody, cd / 2 + 0.02)); // handles at the centre gap
    }
    // Two inset oval basins + rims + faucets.
    for (const sx of [-1, 1]) {
      const bx = sx * 0.34, bz = 0.02;
      const rim = cyl(0.185, 0.185, 0.02, stone, bx, -0.01, bz, 20); rim.scale.z = 0.72; g.add(rim);
      const bowl = cyl(0.155, 0.09, 0.11, mat(0xf6f8f9, { roughness: 0.22 }), bx, -0.07, bz, 20); bowl.scale.z = 0.72; g.add(bowl);
      g.add(cyl(0.016, 0.02, 0.17, metal, bx, 0.085, -D / 2 + 0.11, 12));   // faucet riser
      g.add(box(0.03, 0.03, 0.11, metal, bx, 0.16, -D / 2 + 0.16));         // forward spout
      g.add(box(0.05, 0.02, 0.02, metal, bx, 0.1, -D / 2 + 0.09));          // lever handle
    }
    // Two framed mirrors above the counter (wall-mounted behind the backsplash).
    for (const sx of [-1, 1]) {
      const mx = sx * 0.34;
      g.add(box(0.5, 0.62, 0.02, cab, mx, 0.62, -D / 2 + 0.02));            // frame
      g.add(box(0.44, 0.56, 0.01, mat(0xbcd0d6, { metalness: 0.4, roughness: 0.08 }), mx, 0.62, -D / 2 + 0.035)); // glass
    }
    return g;
  },
} satisfies Record<string, FurnitureBuilder>;
