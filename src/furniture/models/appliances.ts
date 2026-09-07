// ---------------------------------------------------------------------------
// Техника и медиа — модели библиотеки мебели.
//
// Каждая модель возвращает THREE.Group с началом координат в центре пятна
// на полу (y = 0). Порядок ключей в палитре задаёт MODEL_ORDER в ./index.ts,
// а не порядок записей в этом файле.
// ---------------------------------------------------------------------------

import * as THREE from 'three';
import { mat, box, cyl, tint, bmsScreenTexture, ceilingSpeakerUnit, defineModel, glow, lightSetUnits, WOOD, METAL, WHITE, DARK, GLASS, type FurnitureBuilder } from '../primitives';

export const applianceModels = {
  tv: defineModel((g, c) => {
    // Flat wall panel, centered at local y=0 (placed at defaultY). The back sits
    // at local z=0 so it can be offset to rest flush on the wall surface.
    g.add(tint(box(1.3, 0.78, 0.06, mat(DARK), 0, 0, 0.03), c)); // bezel
    // Screen: dark when off; when bound to a media_player and ON, its emissive
    // lifts and the white "BMS" texture lights up (named 'emissive' so it binds).
    g.add(glow(box(
      1.18,
      0.66,
      0.02,
      mat(0x0a0a0a, { emissive: 0xffffff, emissiveMap: bmsScreenTexture(), emissiveIntensity: 0 }),
      0,
      0,
      0.07,
    )));
  }),
  ac_unit: defineModel((g, c) => {
    g.add(tint(box(0.9, 0.28, 0.18, mat(WHITE), 0, 0, 0), c));
    g.add(box(0.8, 0.04, 0.02, mat(DARK), 0, -0.1, 0.09)); // vent
  }),
  intercom: defineModel((g, c) => {
    g.add(tint(box(0.16, 0.26, 0.04, mat(DARK), 0, 0, 0), c));
    g.add(glow(box(0.12, 0.14, 0.01, mat(0x101418, { emissive: 0x0a2a3a }), 0, 0.03, 0.025)));
  }),
  // Rectangular tower air purifier (очиститель воздуха) — floor-standing. The
  // display panel is 'emissive' so it lights when the bound fan/switch is on.
  air_purifier: defineModel((g, c) => {
    const W = 0.3, H = 0.9, D = 0.22;
    g.add(box(W + 0.02, 0.03, D + 0.02, mat(0xd8dce0, { roughness: 0.6 }), 0, 0.015, 0)); // base
    g.add(tint(box(W, H, D, mat(WHITE, { roughness: 0.5, metalness: 0.1 }), 0, 0.03 + H / 2, 0), c)); // body
    // Intake mesh on the lower front + both sides.
    const mesh = mat(0x3a3f45, { roughness: 0.9 });
    g.add(box(W - 0.05, H * 0.5, 0.006, mesh, 0, 0.03 + H * 0.33, D / 2));
    g.add(box(0.006, H * 0.5, D - 0.05, mesh, -W / 2, 0.03 + H * 0.33, 0));
    g.add(box(0.006, H * 0.5, D - 0.05, mesh, W / 2, 0.03 + H * 0.33, 0));
    // Top: cap + recessed outlet grille.
    g.add(tint(box(W, 0.04, D, mat(0xf2f2f2, { roughness: 0.5 }), 0, 0.03 + H + 0.02, 0), c));
    g.add(box(W - 0.08, 0.02, D - 0.08, mat(0x2a2d31, { roughness: 0.8 }), 0, 0.03 + H + 0.045, 0));
    // Control display — glows when running.
    g.add(glow(box(0.1, 0.06, 0.006, mat(0x2fd0ff, { emissive: 0x000000 }), 0, 0.03 + H * 0.82, D / 2 + 0.002)));
  }),
  speaker: defineModel((g, c) => {
    g.add(tint(box(0.25, 0.4, 0.25, mat(DARK), 0, 0.2, 0), c));
    g.add(cyl(0.08, 0.08, 0.01, mat(0x111111), 0, 0.26, 0.13).rotateX(Math.PI / 2) as unknown as THREE.Mesh);
  }),
  // Flush ceiling speaker (потолочная колонка) — a round grille facing down.
  // Binds to a media_player (or switch); its LED glows when playing.
  ceiling_speaker: (c) => ceilingSpeakerUnit(c),
  // Ceiling-speaker SET — a pair by default; `spread` sets the GAP between the
  // units WITHOUT resizing them, `count` how many.
  ceiling_speaker_double: defineModel((g, c, opts) => {
    lightSetUnits(g, opts, { count: 2, max: 8, gap: 1.0 }, () => ceilingSpeakerUnit(c));
  }),
  security_camera: defineModel((g, c) => {
    g.add(tint(cyl(0.06, 0.06, 0.18, mat(WHITE), 0, 0, 0), c));
    const lens = glow(cyl(0.04, 0.04, 0.04, mat(0x101418, { emissive: 0x300000 }), 0, 0, 0.1));
    lens.rotateX(Math.PI / 2);
    g.add(lens);
  }),
  // Panel radiator (радиатор отопления) — sits low against a wall. The front
  // panel is the 'emissive' face: it glows warm when the bound thermostat (or
  // relay switch) is actively heating (hvac_action = heating / switch on).
  radiator: defineModel((g, c) => {
    const W = 0.9, H = 0.55, D = 0.09;
    const yc = 0.16 + H / 2; // lifted off the floor on feet
    const shell = mat(WHITE, { roughness: 0.55, metalness: 0.1 });
    g.add(tint(box(W, H, D * 0.45, shell, 0, yc, -D * 0.22), c)); // back plate
    const front = glow(box(W, H, D * 0.45, mat(WHITE, { roughness: 0.5, emissive: 0x000000 }), 0, yc, D * 0.22)); // glows warm when heating
    g.add(tint(front, c));
    // Vertical fluting ribs across the front for the classic panel look.
    const rib = mat(0xe6e6e6, { roughness: 0.5 });
    const n = 14;
    for (let i = 0; i < n; i++) {
      const x = -W / 2 + 0.05 + (i / (n - 1)) * (W - 0.1);
      g.add(box(0.014, H - 0.06, 0.02, rib, x, yc, D * 0.22 + 0.025));
    }
    g.add(tint(box(W, 0.03, D, mat(0xf2f2f2), 0, yc + H / 2, 0), c)); // top cap
    g.add(tint(box(W, 0.03, D, mat(0xf2f2f2), 0, yc - H / 2, 0), c)); // bottom cap
    const leg = mat(METAL, { metalness: 0.5, roughness: 0.4 });
    g.add(box(0.035, 0.16, D, leg, -W / 2 + 0.1, 0.08, 0)); // feet
    g.add(box(0.035, 0.16, D, leg, W / 2 - 0.1, 0.08, 0));
    // Inlet pipe + thermostatic valve on the right.
    g.add(cyl(0.014, 0.014, 0.16, leg, W / 2 - 0.03, 0.08, 0, 12));
    g.add(cyl(0.032, 0.032, 0.06, mat(0xcf4040, { roughness: 0.5, metalness: 0.2 }), W / 2 - 0.03, 0.17, 0, 14));
  }),
  // Built-in TV media wall — wood cabinet + marble centre with a mounted TV,
  // a fluted-wood top border, and a brass-framed glass display niche.
  tv_wall: defineModel((g, c) => {
    const W = 3.6, H = 2.6, D = 0.4, F = -D / 2;
    const wood = mat(WOOD, { roughness: 0.6 });
    g.add(tint(box(W, 0.55, D, wood, 0, 0.275, 0), c)); // low cabinet base
    g.add(box(W, 0.03, D + 0.02, mat(0xece7dd, { roughness: 0.5 }), 0, 0.565, 0)); // stone top
    const marble = mat(0xf0eee9, { roughness: 0.35 });
    g.add(box(1.8, 1.9, 0.05, marble, -0.4, 1.5, F + 0.05)); // centre marble panel
    g.add(box(1.3, 0.78, 0.05, mat(0x0e0e10, { roughness: 0.25 }), -0.4, 1.62, F + 0.11)); // TV
    const nT = 22, gT = W / nT; // fluted-wood top border
    for (let i = 0; i < nT; i++)
      g.add(tint(box(gT * 0.5, 0.5, 0.05, wood, -W / 2 + gT * (i + 0.5), H - 0.25, F + 0.03), c));
    const glass = mat(GLASS, { transparent: true, opacity: 0.22, roughness: 0.1 });
    g.add(box(0.86, 1.9, 0.03, glass, 1.15, 1.5, F + 0.06)); // glass niche
    for (const x of [0.7, 1.6]) g.add(box(0.03, 1.9, 0.07, mat(0xb8932e, { metalness: 0.6, roughness: 0.4 }), x, 1.5, F + 0.09));
    for (const y of [1.05, 1.55, 2.05]) g.add(box(0.82, 0.03, 0.22, mat(0x6e4a2f, { roughness: 0.7 }), 1.15, y, F + 0.14));
  }),
  monitor: defineModel((g, c) => {
    g.add(tint(box(0.5, 0.32, 0.03, mat(DARK), 0, 0.45, 0), c));
    g.add(box(0.46, 0.28, 0.01, mat(0x0a0a0a, { emissive: 0x10131a }), 0, 0.45, 0.02));
    g.add(cyl(0.03, 0.03, 0.18, mat(DARK), 0, 0.3, -0.02, 10));
    g.add(box(0.2, 0.02, 0.14, mat(DARK), 0, 0.21, -0.02));
  }),
  printer: defineModel((g, c) => {
    g.add(tint(box(0.45, 0.3, 0.4, mat(WHITE), 0, 0.15, 0), c));
    g.add(box(0.4, 0.02, 0.3, mat(DARK), 0, 0.31, 0));
    g.add(box(0.34, 0.04, 0.08, mat(0xddddee), 0, 0.3, 0.12));
  }),
  whiteboard: defineModel((g, c) => {
    g.add(tint(box(1.26, 0.86, 0.02, mat(METAL), 0, 0, 0), c));
    g.add(box(1.2, 0.8, 0.02, mat(0xf6f6f6), 0, 0, 0.02));
    g.add(box(0.4, 0.03, 0.06, mat(METAL), 0, -0.36, 0.05));
  }),
  ceiling_fan: defineModel((g, c) => {
    g.add(cyl(0.1, 0.1, 0.1, mat(METAL), 0, 0, 0, 16));
    const blades = new THREE.Group();
    blades.name = 'fanBlade'; // only this group spins when a fan is bound
    blades.add(tint(box(1.4, 0.02, 0.18, mat(WOOD), 0, -0.02, 0), c));
    blades.add(tint(box(0.18, 0.02, 1.4, mat(WOOD), 0, -0.02, 0), c));
    g.add(blades);
    g.add(cyl(0.04, 0.04, 0.22, mat(METAL), 0, 0.14, 0, 10));
  }),
  // Small round ceiling exhaust vent (extractor). Sits flush under the ceiling;
  // bind a fan.* entity and the whole grille spins while the fan is ON.
  ceiling_vent: defineModel((g, c) => {
    const shell = mat(WHITE, { metalness: 0.1, roughness: 0.7 });
    const grille = mat(0xd7dce1, { metalness: 0.25, roughness: 0.55 });
    const hubMat = mat(METAL, { metalness: 0.55, roughness: 0.35 });
    // Round housing, flush under the ceiling (origin at the ceiling face).
    g.add(tint(cyl(0.24, 0.26, 0.05, shell, 0, -0.025, 0, 32), c));
    // Recessed face plate.
    g.add(cyl(0.2, 0.2, 0.012, grille, 0, -0.055, 0, 32));
    // Center hub (the fan boss).
    g.add(cyl(0.055, 0.06, 0.045, hubMat, 0, -0.07, 0, 20));
    // Radial fan blades — discrete spokes so the spin reads when it's running.
    const blade = mat(0xeceef1, { metalness: 0.2, roughness: 0.5 });
    const blades = new THREE.Group();
    blades.name = 'fanBlade'; // only this group spins when a fan is bound
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      const b = box(0.15, 0.006, 0.05, blade, Math.cos(a) * 0.11, -0.062, Math.sin(a) * 0.11);
      b.rotation.y = -a;
      blades.add(b);
    }
    g.add(blades);
  }),
  // Underfloor heating mat (тёплый пол) — lies flat on the floor; the serpentine
  // heating loop glows when the heater is ON (bind climate/switch).
  warm_floor: defineModel((g, c) => {
    const W = 1.6;
    const D = 1.1;
    g.add(tint(box(W, 0.015, D, mat(0xb98f7d, { roughness: 0.9 }), 0, 0.0075, 0), c));
    const coil = mat(0xd9784a, { roughness: 0.5 });
    const rows = 5;
    const xL = -W / 2 + 0.14;
    const xR = W / 2 - 0.14;
    const z0 = -D / 2 + 0.14;
    const dz = (D - 0.28) / (rows - 1);
    for (let i = 0; i < rows; i++) {
      const bar = glow(box(xR - xL, 0.02, 0.035, coil, 0, 0.02, z0 + i * dz));
      g.add(bar);
    }
    for (let i = 0; i < rows - 1; i++) {
      const ex = i % 2 === 0 ? xR : xL;
      const b = glow(box(0.035, 0.02, dz, coil, ex, 0.02, z0 + i * dz + dz / 2));
      g.add(b);
    }
  }),
  // In-floor trench convector (конвектор) — a recessed linear grille FLUSH with
  // the floor (like the warm-floor mat), usually along a window. The grille bars
  // glow warm when the heater is ON (bind climate/switch/fan).
  convector: defineModel((g, c) => {
    const W = 1.0;
    const D = 0.18;
    // Recessed metal frame, sitting flush at floor level.
    g.add(tint(box(W, 0.04, D, mat(0x9aa0a6, { metalness: 0.55, roughness: 0.35 }), 0, 0.02, 0), c));
    // Linear grille bars across the trench.
    const bar = mat(0xd98a5a, { metalness: 0.3, roughness: 0.5 });
    const n = 16;
    for (let i = 0; i < n; i++) {
      const x = -W / 2 + 0.05 + (i / (n - 1)) * (W - 0.1);
      g.add(glow(box(0.018, 0.02, D - 0.05, bar, x, 0.035, 0)));
    }
  }),
  // A neutral wall switch / control plate. DELIBERATELY has NO 'emissive' mesh and
  // no moving parts, so a bound device NEVER changes its look — no glow, no point
  // light, no spin, no floating label. It is purely a tap target that surfaces the
  // bound device's controls (a switch toggle, a media/AC "pult", a cover) in the 3D
  // UI. entityDomainsFor(wall_switch) restricts binding to the inert behaviours
  // (switch/media_player/climate/cover) precisely so it stays visually static.
  // Centered at local y=0, back at z=0 (surface-mounts flush). 0.13 x 0.13 m.
  wall_switch: defineModel((g, c) => {
    const W = 0.13, H = 0.13;
    const plate = mat(0xeef0f2, { roughness: 0.5, metalness: 0.08 });
    const surround = mat(0xe4e7ea, { roughness: 0.55 });
    const rocker = mat(0xf7f8fa, { roughness: 0.4 });
    const dot = mat(0x9aa0a6, { roughness: 0.5 }); // neutral indicator — never lights
    g.add(tint(box(W, H, 0.01, plate, 0, 0, 0.005), c));                 // faceplate (back flush at z=0)
    g.add(box(W * 0.9, H * 0.9, 0.014, surround, 0, 0, 0.012));          // inner surround
    g.add(box(W * 0.46, H * 0.74, 0.02, rocker, 0, 0, 0.022));           // rocker paddle
    g.add(box(0.012, 0.012, 0.006, dot, 0, -H * 0.3, 0.026));            // tiny status dot (static)
  }),
} satisfies Record<string, FurnitureBuilder>;
