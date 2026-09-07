// ---------------------------------------------------------------------------
// Спорт и здоровье — модели библиотеки мебели.
//
// Каждая модель возвращает THREE.Group с началом координат в центре пятна
// на полу (y = 0). Порядок ключей в палитре задаёт MODEL_ORDER в ./index.ts,
// а не порядок записей в этом файле.
// ---------------------------------------------------------------------------

import * as THREE from 'three';
import { mat, box, cyl, tint, defineModel, WOOD, FABRIC, METAL, WHITE, DARK, type FurnitureBuilder } from '../primitives';

export const wellnessModels = {
  // ---- SPA / gym / pool (basement plan) ----
  treadmill: defineModel((g, c) => {
    const frame = mat(DARK);
    // low running deck near the floor
    const deck = tint(box(0.9, 0.14, 2.0, mat(WHITE), 0, 0.1, 0), c);
    g.add(deck);
    g.add(box(0.52, 0.03, 1.55, mat(0x18191d, { roughness: 0.95 }), 0, 0.185, -0.15)); // belt
    g.add(tint(box(0.16, 0.07, 1.55, mat(WHITE), 0.34, 0.2, -0.15), c));
    g.add(tint(box(0.16, 0.07, 1.55, mat(WHITE), -0.34, 0.2, -0.15), c));
    g.add(box(0.86, 0.16, 0.24, frame, 0, 0.18, 1.0)); // front motor cowling
    // upright posts + handlebar + console at the front
    g.add(box(0.07, 0.9, 0.07, frame, 0.3, 0.62, 0.9));
    g.add(box(0.07, 0.9, 0.07, frame, -0.3, 0.62, 0.9));
    const bar = cyl(0.03, 0.03, 0.68, mat(METAL), 0, 1.02, 0.9); bar.rotation.z = Math.PI / 2; g.add(bar);
    g.add(box(0.66, 0.36, 0.08, frame, 0, 1.15, 0.86));
    g.add(box(0.42, 0.24, 0.02, mat(0x0a1016, { emissive: 0x16405e }), 0, 1.17, 0.91));
  }),
  exercise_bike: defineModel((g, c) => {
    const frame = mat(METAL, { roughness: 0.4, metalness: 0.5 });
    const foot = mat(DARK, { roughness: 0.6 });
    // stabiliser feet (front & rear bars across the width)
    for (const fz of [0.45, -0.45]) g.add(box(0.5, 0.07, 0.1, foot, 0, 0.035, fz));
    // front upright post (carries handlebars/console) + rear seat post
    const front = cyl(0.05, 0.06, 1.05, frame, 0, 0.55, 0.32, 12); front.rotation.x = 0.16;
    const seatPost = cyl(0.045, 0.05, 0.85, frame, 0, 0.55, -0.28, 12); seatPost.rotation.x = -0.18;
    g.add(tint(front, c)); g.add(tint(seatPost, c));
    g.add(tint(box(0.09, 0.1, 0.7, frame, 0, 0.16, 0.02), c)); // lower frame over the crank
    const wheel = cyl(0.24, 0.24, 0.08, mat(DARK), 0, 0.28, 0.28, 20); wheel.rotation.z = Math.PI / 2;
    g.add(wheel);
    for (const s of [-1, 1]) { // crank arms + pedals
      g.add(box(0.14, 0.02, 0.02, mat(METAL), s * 0.09, 0.28, 0.28));
      g.add(box(0.11, 0.03, 0.07, mat(0x33373d), s * 0.16, 0.22, 0.28));
    }
    g.add(tint(box(0.28, 0.06, 0.22, mat(FABRIC), 0, 0.95, -0.36), c)); // seat
    g.add(box(0.4, 0.05, 0.05, mat(METAL), 0, 1.12, 0.24)); // handlebars
    g.add(box(0.05, 0.05, 0.22, mat(METAL), 0, 1.12, 0.34));
    g.add(box(0.24, 0.16, 0.03, mat(0x1a1d22, { emissive: 0x223344 }), 0, 1.2, 0.4)); // console
  }),
  weight_bench: defineModel((g, c) => {
    const frame = mat(DARK, { metalness: .5, roughness: .4 });
    const steel = mat(METAL, { metalness: .7, roughness: .3 });
    // padded flat bench top
    const pad = box(1.1, .1, .34, mat(FABRIC), 0, .5, 0);
    tint(pad, c); g.add(pad);
    g.add(box(1.0, .05, .12, frame, 0, .43, 0));
    // A-frame legs at each end
    [-.45, .45].forEach(x => {
      g.add(box(.05, .43, .05, steel, x, .215, .13));
      g.add(box(.05, .43, .05, steel, x, .215, -.13));
      g.add(box(.05, .05, .3, steel, x, .0, 0));
    });
    // two upright rack posts holding a barbell at one end
    [-.22, .22].forEach(x => g.add(box(.05, 1.3, .05, steel, x, .65, .55)));
    const bar = cyl(.022, .022, 1.5, steel, 0, 1.15, .55); bar.rotation.z = Math.PI / 2; g.add(bar);
    [-.62, .62].forEach(x => g.add(cyl(.16, .16, .06, frame, x, 1.15, .55)));
  }),
  gym_machine: defineModel((g, c) => {
    const frame = mat(METAL, { roughness: 0.35, metalness: 0.7 });
    const pad = mat(FABRIC, { roughness: 0.85 });
    const stack = mat(DARK, { roughness: 0.5, metalness: 0.4 });
    // frame: two rear uprights + a base
    g.add(box(1.1, 0.08, 1.4, frame, 0, 0.04, 0));
    g.add(cyl(0.045, 0.045, 1.8, frame, -0.45, 0.9, -0.6, 12));
    g.add(cyl(0.045, 0.045, 1.8, frame, 0.45, 0.9, -0.6, 12));
    g.add(box(1.0, 0.06, 0.06, frame, 0, 1.78, -0.6));
    // weight stack: guide rods + column of plates (tinted)
    g.add(cyl(0.015, 0.015, 1.4, frame, -0.08, 0.75, -0.62, 8));
    g.add(cyl(0.015, 0.015, 1.4, frame, 0.08, 0.75, -0.62, 8));
    for (let i = 0; i < 9; i++)
      g.add(tint(box(0.34, 0.055, 0.24, stack, 0, 0.16 + i * 0.075, -0.62), c));
    // seat + backrest pad
    g.add(cyl(0.05, 0.05, 0.5, frame, 0, 0.25, 0.15, 10));
    g.add(tint(box(0.42, 0.09, 0.4, pad, 0, 0.52, 0.15), c));
    g.add(tint(box(0.42, 0.6, 0.1, pad, 0, 0.85, -0.08), c));
    // two pivoting arms (pec-deck) hinged at the top uprights
    for (const sx of [-1, 1]) {
      const arm = box(0.07, 0.07, 0.7, frame, sx * 0.42, 1.2, -0.25);
      arm.rotation.y = sx * 0.35;
      g.add(arm);
      g.add(tint(box(0.1, 0.45, 0.1, pad, sx * 0.5, 1.15, 0.15), c)); // forearm pad
    }
  }),
  dumbbell_rack: defineModel((g, c) => {
    const steel = mat(METAL, { roughness: 0.35, metalness: 0.7 });
    const dark = mat(DARK, { roughness: 0.6 });
    const chrome = mat(METAL, { roughness: 0.2, metalness: 0.85 });
    // End A-frames: tall back post, short front post, floor foot each side
    for (const sx of [-0.72, 0.72]) {
      g.add(box(0.05, 0.9, 0.05, steel, sx, 0.45, -0.16));
      g.add(box(0.05, 0.62, 0.05, steel, sx, 0.31, 0.16));
      g.add(box(0.05, 0.05, 0.46, steel, sx, 0.03, 0));
    }
    // Two slanted tiers: low/front (heavy) and high/back (light)
    g.add(tint(box(1.5, 0.04, 0.14, steel, 0, 0.35, 0.13), c));
    g.add(tint(box(1.5, 0.04, 0.14, steel, 0, 0.62, -0.12), c));
    const dumbbell = (x: number, y: number, z: number, r: number) => {
      const bar = cyl(0.018, 0.018, 0.26, chrome, x, y, z, 10); bar.rotation.x = Math.PI / 2; g.add(bar);
      for (const dz of [-0.13, 0.13]) {
        const w = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 12), dark);
        w.position.set(x, y, z + dz); w.scale.set(1, 1, 0.7); g.add(w);
      }
    };
    for (let i = 0; i < 5; i++) {
      const x = -0.58 + i * 0.29;
      dumbbell(x, 0.44, 0.13, 0.075); // lower front row, heavier
      dumbbell(x, 0.69, -0.12, 0.055); // upper back row, lighter
    }
  }),
  swimming_pool: defineModel((g, c) => {
    const stone = mat(0xc9c3b3, { roughness: 0.85 });
    const w = 6.0, d = 4.0, rim = 0.35, wallH = 0.25;
    // coping rim: four stone bars framing the basin
    [
      box(w, wallH, rim, stone, 0, wallH / 2, (d - rim) / 2),
      box(w, wallH, rim, stone, 0, wallH / 2, -(d - rim) / 2),
      box(rim, wallH, d - rim * 2, stone, (w - rim) / 2, wallH / 2, 0),
      box(rim, wallH, d - rim * 2, stone, -(w - rim) / 2, wallH / 2, 0)
    ].forEach(m => { tint(m, c); g.add(m); });
    const iw = w - rim * 2, id = d - rim * 2;
    g.add(box(iw, 0.02, id, mat(0x1a5f7a, { roughness: 0.4 }), 0, 0.06, 0)); // basin floor
    g.add(box(iw, 0.02, id, mat(0x2f9fd0, { transparent: true, opacity: 0.75, roughness: 0.15 }), 0, wallH - 0.05, 0));
  }),
  sauna_bench: defineModel((g, c) => {
    const wood = mat(WOOD);
    const slatT = 0.04, gap = 0.008;
    // two tiers: [depth, front-Z, top-Y]
    const tiers = [[0.6, 0.0, 0.45], [0.45, -0.075, 0.85]];
    tiers.forEach(([depth, cz, topY]) => {
      let z = cz + depth / 2 - 0.06;
      while (z > cz - depth / 2) {
        g.add(tint(box(2.0, slatT, 0.06, wood, 0, topY - slatT / 2, z), c));
        z -= 0.06 + gap;
      }
      const legY = topY - slatT;
      [[-0.9, depth / 2 - 0.05 + cz], [0.9, depth / 2 - 0.05 + cz], [-0.9, -depth / 2 + 0.05 + cz], [0.9, -depth / 2 + 0.05 + cz]].forEach(([lx, lz]) =>
        g.add(box(0.06, legY, 0.06, wood, lx, legY / 2, lz)));
    });
  }),
  sauna_heater: defineModel((g, c) => {
    const metal = mat(METAL, { roughness: 0.5, metalness: 0.7 });
    const body = box(0.5, 0.6, 0.5, metal, 0, 0.31, 0);
    tint(body, c);
    g.add(body);
    g.add(box(0.54, 0.04, 0.54, mat(DARK), 0, 0.02, 0));   // base plate
    g.add(box(0.52, 0.05, 0.52, metal, 0, 0.63, 0));        // top rim
    const stoneMat = mat(0x8a8f96, { roughness: 0.95 });
    const geo = new THREE.SphereGeometry(0.06, 8, 6);
    const spots = [[0,0.68,0],[0.11,0.67,0.05],[-0.1,0.67,-0.04],[0.05,0.66,-0.12],[-0.07,0.68,0.12],[0.13,0.72,-0.08],[-0.12,0.71,0.09],[0,0.77,0.02],[0.07,0.76,0.1],[-0.05,0.75,-0.09]];
    spots.forEach(([x, y, z]) => {
      const s = new THREE.Mesh(geo, stoneMat);
      s.position.set(x, y, z);
      s.scale.set(1, 0.8, 1);
      g.add(s);
    });
  }),
  massage_table: defineModel((g, c) => {
    const padMat = mat(FABRIC);
    const frameMat = mat(WOOD);
    const legMat = mat(METAL, { metalness: 0.4, roughness: 0.5 });
    // padded main top
    const top = tint(box(2.0, 0.10, 0.7, padMat, 0, 0.60, 0), c);
    g.add(top);
    g.add(box(1.96, 0.05, 0.66, frameMat, 0, 0.53, 0)); // frame under pad
    // four legs
    const lx = 0.9, lz = 0.28;
    [[lx, lz], [lx, -lz], [-lx, lz], [-lx, -lz]].forEach(([x, z]) => {
      g.add(box(0.05, 0.53, 0.05, legMat, x, 0.265, z));
    });
    g.add(box(1.7, 0.04, 0.04, legMat, 0, 0.20, 0)); // stretcher
    // round face-cradle pad at head end (+X), raised slightly
    const cradle = tint(cyl(0.13, 0.13, 0.05, padMat, 1.05, 0.665, 0, 20), c);
    g.add(cradle);
  }),
  barber_chair: defineModel((g, c) => {
    const chrome = mat(METAL, { roughness: 0.2, metalness: 0.9 });
    const uph = mat(0x3f6f8c, { roughness: 0.7 }); // padded leather (tinted)

    // chromed round base + central post
    g.add(cyl(0.32, 0.34, 0.05, chrome, 0, 0.025, 0, 32));
    g.add(cyl(0.07, 0.09, 0.42, chrome, 0, 0.26, 0, 20));
    g.add(cyl(0.16, 0.16, 0.04, chrome, 0, 0.46, 0, 24)); // hydraulic collar

    // footrest bar at the front
    const fbar = cyl(0.02, 0.02, 0.34, chrome, 0, 0.2, 0.4, 12);
    fbar.rotation.z = Math.PI / 2;
    g.add(fbar);
    g.add(box(0.3, 0.03, 0.1, chrome, 0, 0.2, 0.42));

    // padded seat, reclined backrest, headrest
    g.add(tint(box(0.56, 0.14, 0.56, uph, 0, 0.55, 0.02), c)); // seat
    const back = tint(box(0.54, 0.62, 0.14, uph, 0, 0.9, -0.24), c);
    back.rotation.x = -0.14;
    g.add(back);
    g.add(tint(box(0.44, 0.2, 0.12, uph, 0, 1.24, -0.31), c)); // headrest

    // armrests
    for (const s of [-1, 1]) {
      g.add(box(0.1, 0.06, 0.4, mat(DARK, { roughness: 0.5 }), s * 0.32, 0.74, 0.06));
      g.add(cyl(0.03, 0.03, 0.16, chrome, s * 0.32, 0.66, 0.22, 10));
    }
  }),
  prayer_mat: defineModel((g, c) => {
    const L = 1.2, W = 0.7;
    const field = tint(box(W, 0.015, L, mat(0x3f6d5a), 0, 0.008, 0), c);
    g.add(field);
    // raised border frame
    const bC = mat(0xcaa14a, { metalness: 0.15, roughness: 0.6 });
    g.add(box(W, 0.022, 0.04, bC, 0, 0.011, -L / 2 + 0.02));
    g.add(box(W, 0.022, 0.04, bC, 0, 0.011, L / 2 - 0.02));
    g.add(box(0.04, 0.022, L, bC, -W / 2 + 0.02, 0.011, 0));
    g.add(box(0.04, 0.022, L, bC, W / 2 - 0.02, 0.011, 0));
    // mihrab arch at the front end (+Z): stem + rounded top
    const aC = mat(0xe4d8b4, { roughness: 0.7 });
    g.add(box(0.28, 0.018, 0.34, aC, 0, 0.017, L / 2 - 0.28));
    // Thin half-disc lying FLAT on the mat as the arch motif (cylinder axis is
    // Y, so an un-rotated slim one is already a flat disc; theta 0..PI = a half).
    const arch = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.018, 20, 1, false, 0, Math.PI), aC);
    arch.position.set(0, 0.02, L / 2 - 0.44);
    g.add(arch);
  }),
} satisfies Record<string, FurnitureBuilder>;
