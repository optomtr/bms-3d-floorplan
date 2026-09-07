// ---------------------------------------------------------------------------
// Лестницы и конструктив — модели библиотеки мебели.
//
// Каждая модель возвращает THREE.Group с началом координат в центре пятна
// на полу (y = 0). Порядок ключей в палитре задаёт MODEL_ORDER в ./index.ts,
// а не порядок записей в этом файле.
// ---------------------------------------------------------------------------

import * as THREE from 'three';
import { mat, box, cyl, tint, WOOD, METAL, type FurnitureBuilder } from '../primitives';

export const structureModels = {
  stairs: (c) => {
    const g = new THREE.Group();
    const steps = 8;
    for (let i = 0; i < steps; i++)
      g.add(tint(box(1.0, 0.18, 0.3, mat(WOOD), 0, 0.09 + i * 0.18, -i * 0.3), c));
    return g;
  },
  // Descending staircase — for an UPPER floor, a flight going DOWN to the level
  // below (steps drop beneath the floor). Treads + risers + side stringers read
  // clearly as a stairwell.
  stairs_down: (c) => {
    const g = new THREE.Group();
    const steps = 8;
    const rise = 0.19;
    const run = 0.3;
    const w = 1.0;
    const wood = mat(WOOD);
    const riserMat = mat(0x8a5f34);
    for (let i = 0; i < steps; i++) {
      const y = -0.02 - i * rise;
      const z = -0.15 - i * run;
      g.add(tint(box(w, 0.05, run, wood, 0, y, z), c)); // tread
      g.add(box(w - 0.02, rise, 0.03, riserMat, 0, y - rise / 2, z - run / 2)); // riser
    }
    const strLen = Math.hypot(steps * rise, steps * run);
    const ang = Math.atan2(steps * rise, steps * run);
    for (const sx of [-1, 1]) {
      const s = box(0.05, 0.3, strLen, mat(0x7a5230), sx * (w / 2), -0.02 - (steps * rise) / 2, -0.15 - (steps * run) / 2 + run / 2);
      s.rotation.x = -ang;
      g.add(s);
    }
    return g;
  },
  // U-shaped switchback stair: two flights bridged by a mid landing (as drawn in
  // the Лестничная клетка stairwells).
  stairs_switchback: (c) => {
    const g = new THREE.Group();
    const steps = 7, rise = 0.18, run = 0.28, w = 0.95, gap = 0.06;
    const wood = mat(WOOD);
    const lane = w / 2 + gap / 2;
    const zFar = -steps * run;
    for (let i = 0; i < steps; i++)
      g.add(tint(box(w, 0.16, run, wood, -lane, 0.08 + i * rise, -i * run - run / 2), c)); // up flight (left)
    const landY = 0.08 + (steps - 1) * rise + rise;
    g.add(tint(box(2 * w + gap, 0.16, run * 2, wood, 0, landY, zFar - run), c)); // landing
    const base2 = landY;
    for (let i = 0; i < steps; i++)
      g.add(tint(box(w, 0.16, run, wood, lane, base2 + (i + 1) * rise, zFar - run / 2 + i * run), c)); // down-return flight (right)
    return g;
  },
  // Flat, plan-symbol staircase — lies FLUSH on the floor and reads like the way
  // stairs are drawn on the plan: a wooden footprint with tread lines across the
  // run (no arrow), for tracing the plan rather than a raised 3D flight.
  stairs_flat: (c) => {
    const g = new THREE.Group();
    const steps = 12, run = 0.27, W = 1.2, t = 0.014;
    const L = steps * run;
    const slab = mat(WOOD, { roughness: 0.96 });
    g.add(tint(box(W, t, L, slab, 0, t / 2, 0), c)); // flush wooden footprint
    const line = mat(0x5a3d24, { roughness: 0.9 }); // darker-wood tread lines
    for (let i = 1; i < steps; i++) // tread lines across the width
      g.add(box(W - 0.04, t * 1.4, 0.018, line, 0, t + 0.002, -L / 2 + i * run));
    for (const sx of [-1, 1]) // side stringer outlines
      g.add(box(0.02, t * 1.4, L, line, sx * (W / 2 - 0.01), t + 0.002, 0));
    return g;
  },
  // Freestanding structural columns (the red-square posts on the grid). A wall of
  // zero length collapses in the builder, so a placeable column model is needed.
  column_sq: (c) => {
    const g = new THREE.Group();
    g.add(tint(box(0.38, 2.6, 0.38, mat(0xd8d2c6, { roughness: 0.9 }), 0, 1.3, 0), c));
    return g;
  },
  column_round: (c) => {
    const g = new THREE.Group();
    g.add(tint(cyl(0.19, 0.19, 2.6, mat(0xd8d2c6, { roughness: 0.9 }), 0, 1.3, 0, 24), c));
    return g;
  },
  // Elevator (Лифт) — shaft on three sides, a cabin, and two sliding leaves on
  // the open face. Footprint ~3.1 x 1.9 m to match the plan.
  elevator: (c) => {
    const g = new THREE.Group();
    const W = 3.1, D = 1.9, H = 2.6;
    const shaft = mat(0xbfc3c8, { roughness: 0.6, metalness: 0.3 });
    g.add(box(W, H, 0.1, shaft, 0, H / 2, -D / 2 + 0.05)); // back
    g.add(box(0.1, H, D, shaft, -W / 2 + 0.05, H / 2, 0)); // left
    g.add(box(0.1, H, D, shaft, W / 2 - 0.05, H / 2, 0)); // right
    g.add(box(W, 0.12, D, shaft, 0, H - 0.06, 0)); // lintel
    g.add(tint(box(W - 0.32, H - 0.22, D - 0.32, mat(0xe8eaec, { roughness: 0.4, metalness: 0.5 }), 0, (H - 0.22) / 2, -0.06), c)); // cabin
    const door = mat(METAL, { roughness: 0.35, metalness: 0.7 });
    g.add(box(0.72, H - 0.2, 0.05, door, -0.38, (H - 0.2) / 2, D / 2 - 0.05)); // left leaf
    g.add(box(0.72, H - 0.2, 0.05, door, 0.38, (H - 0.2) / 2, D / 2 - 0.05)); // right leaf
    return g;
  },
  wall_panel: (c) => {
    const g = new THREE.Group();
    g.add(tint(box(1.5, 2.6, 0.12, mat(0xe6e6e6), 0, 1.3, 0), c));
    return g;
  },
  arch: (c) => {
    const g = new THREE.Group();
    g.add(tint(box(0.15, 2.0, 0.25, mat(0xe6e6e6), -0.6, 1.0, 0), c));
    g.add(tint(box(0.15, 2.0, 0.25, mat(0xe6e6e6), 0.6, 1.0, 0), c));
    g.add(tint(box(1.35, 0.25, 0.25, mat(0xe6e6e6), 0, 2.1, 0), c));
    return g;
  },
  // Decorative feature wall (декоративная стена, панно): a floor-to-ceiling
  // walnut wood-clad backdrop with thin gold plank reveals, a rounded walnut
  // column, and a tall black-gloss panel in a slim gold frame. The seam between
  // the column and the black panel carries a warm 'emissive' LED reveal, so a
  // bound light/switch lights it. Free-standing — slide it flat against a wall
  // and rotate to face the room. 2.6 x 2.5 x 0.26 m.
  feature_wall: (c) => {
    const g = new THREE.Group();
    const W = 2.6, H = 2.5, D = 0.26;
    const backZ = -D / 2;           // backing slab hugs the wall
    const faceZ = D / 2 - 0.02;     // front face of the flat cladding
    const walnut = mat(0x6f4326, { roughness: 0.4, metalness: 0.12 });
    const gold = mat(0xc9a24a, { metalness: 0.85, roughness: 0.25 });
    const black = mat(0x0e0f12, { roughness: 0.12, metalness: 0.6 });

    // Full backing slab (wall side) — tinted, so a recolor hits the wood.
    g.add(tint(box(W, H, 0.04, walnut, 0, H / 2, backZ + 0.02), c));

    // ---- Left: wood-clad section, vertical planks + thin gold reveals ----
    const woodX0 = -W / 2, woodX1 = 0.02;
    const woodW = woodX1 - woodX0, woodCx = (woodX0 + woodX1) / 2;
    g.add(tint(box(woodW, H - 0.02, 0.05, walnut, woodCx, H / 2, faceZ - 0.03), c));
    for (let x = woodX0 + 0.44; x < woodX1 - 0.1; x += 0.44) {
      g.add(box(0.012, H - 0.12, 0.012, gold, x, H / 2, faceZ + 0.008)); // gold plank reveal
    }

    // ---- Rounded walnut column at the wood/black junction ----
    const colX = 0.14, colR = 0.16, colZ = faceZ - 0.02; // bulges forward from the panel
    g.add(tint(cyl(colR, colR, H, walnut, colX, H / 2, colZ, 28), c));
    g.add(box(0.014, H - 0.06, 0.014, gold, colX, H / 2, colZ + colR + 0.002)); // gold seam down its face

    // ---- Right: tall black-gloss panel in a slim gold frame ----
    const blkX0 = 0.30, blkX1 = W / 2;
    const blkW = blkX1 - blkX0, blkCx = (blkX0 + blkX1) / 2;
    g.add(box(blkW, H - 0.02, 0.03, black, blkCx, H / 2, faceZ - 0.01));
    const fz = faceZ + 0.014;
    g.add(box(blkW, 0.02, 0.02, gold, blkCx, H - 0.06, fz));            // frame top
    g.add(box(blkW, 0.02, 0.02, gold, blkCx, 0.06, fz));               // frame bottom
    g.add(box(0.02, H - 0.02, 0.02, gold, blkX0 + 0.01, H / 2, fz));    // frame left
    g.add(box(0.02, H - 0.02, 0.02, gold, blkX1 - 0.01, H / 2, fz));    // frame right

    // ---- Warm LED reveal in the wood/black seam (glows when bound) ----
    const led = box(0.03, H - 0.22, 0.02, mat(0xffe9c0, { emissive: 0x000000 }), 0.29, H / 2, faceZ + 0.02);
    led.name = 'emissive';
    g.add(led);

    return g;
  },
  // Vertical fluted wood wall panel (реечная панель) — battens on a backing
  // board, floor-to-ceiling; sits flush on the wall surface.
  wood_slat_panel: (c) => {
    const g = new THREE.Group();
    const W = 1.2, H = 2.6, OFF = 0.02;
    g.add(box(W, H, 0.02, mat(0x6e4a2f, { roughness: 0.85 }), 0, H / 2, OFF - 0.012)); // backing
    const n = 16, gap = W / n;
    for (let i = 0; i < n; i++)
      g.add(tint(box(gap * 0.55, H, 0.045, mat(WOOD, { roughness: 0.7 }), -W / 2 + gap * (i + 0.5), H / 2, OFF + 0.02), c));
    return g;
  },
  // Climbing / bouldering wall — a tan panel studded with colourful holds.
  // Deterministic pseudo-random layout (no Math.random, so it's stable).
  climbing_wall: (c) => {
    const g = new THREE.Group();
    const W = 2.4, H = 2.6, OFF = 0.03;
    g.add(tint(box(W, H, 0.04, mat(0xcbb089, { roughness: 0.95 }), 0, H / 2, OFF - 0.02), c)); // board
    const colors = [0xd0544a, 0x4a7dd0, 0x4caf6a, 0x8a5fb0, 0xe6e6e6, 0xe08a3a, 0x333333, 0xd8c840, 0x30b0b0];
    const hash = (n: number) => {
      const s = Math.sin(n * 12.9898) * 43758.5453;
      return s - Math.floor(s);
    };
    const cols = 6, rows = 7;
    let k = 0;
    for (let r = 0; r < rows; r++)
      for (let cxi = 0; cxi < cols; cxi++) {
        k++;
        const x = -W / 2 + (W / cols) * (cxi + 0.5) + (hash(k) - 0.5) * (W / cols) * 0.7;
        const y = (H / rows) * (r + 0.5) + (hash(k + 100) - 0.5) * (H / rows) * 0.7;
        const sz = 0.055 + hash(k + 20) * 0.075;
        const col = colors[Math.floor(hash(k + 50) * colors.length) % colors.length];
        const hold = new THREE.Mesh(new THREE.IcosahedronGeometry(sz, 0), mat(col, { roughness: 0.55, flatShading: true }));
        hold.position.set(x, y, OFF + sz * 0.5);
        hold.scale.z = 0.55; // flatten against the wall
        hold.rotation.set(hash(k) * 3, hash(k + 1) * 3, hash(k + 2) * 3);
        hold.castShadow = true;
        g.add(hold);
      }
    return g;
  },
  // Full-wall floor-to-ceiling terrace glazing WITH a door pane. Placed from the
  // palette it cuts a full-height opening (auto-fits the wall).
  terrace_wall: (c) => {
    const g = new THREE.Group();
    const fr = mat(0x4a5560);
    const W = 4, H = 2.55, fw = 0.08, d = 0.12;
    g.add(tint(box(W, fw, d, fr, 0, H - fw / 2, 0), c)); // top
    g.add(box(W, fw, d, fr, 0, fw / 2, 0)); // bottom
    g.add(box(fw, H, d, fr, -W / 2 + fw / 2, H / 2, 0)); // left
    g.add(box(fw, H, d, fr, W / 2 - fw / 2, H / 2, 0)); // right
    const panes = 4;
    for (let i = 1; i < panes; i++) g.add(box(0.05, H, d * 0.6, fr, -W / 2 + (W * i) / panes, H / 2, 0));
    // First pane = a door: edge post, bottom rail, handle.
    const dx1 = -W / 2 + W / panes;
    g.add(box(0.06, H - fw, d * 0.7, fr, dx1 - 0.03, H / 2, 0));
    g.add(box(W / panes - 0.1, 0.07, d * 0.7, fr, (-W / 2 + dx1) / 2, 0.12, 0));
    g.add(box(0.04, 0.16, d * 1.2, mat(0xcbb26a, { metalness: 0.6, roughness: 0.35 }), dx1 - 0.16, 1.05, 0)); // handle
    g.add(box(W - fw, H - fw, 0.02, mat(0x9cc7da, { transparent: true, opacity: 0.4, metalness: 0.2 }), 0, H / 2, 0));
    return g;
  },
  // Curved exterior entrance porch — stacked half-round stone treads + railing
  // posts. Self-contained (does not need a curved wall).
  porch: (c) => {
    const g = new THREE.Group();
    const stone = mat(0xd7d2c8, { roughness: 0.9 });
    const treads = 3;
    for (let i = 0; i < treads; i++) {
      const r = 2.2 - i * 0.4;
      const t = cyl(r, r, 0.15, stone, 0, 0.075 + i * 0.15, 0, 44);
      t.scale.z = 0.55; // flatten to a shallow arc footprint
      g.add(tint(t, c));
    }
    const post = mat(METAL, { roughness: 0.5, metalness: 0.4 });
    const rTop = 2.2 - (treads - 1) * 0.4;
    const yTop = 0.075 + (treads - 1) * 0.15;
    const n = 7;
    for (let k = 0; k <= n; k++) {
      const a = -Math.PI / 2 + Math.PI * (k / n);
      g.add(cyl(0.03, 0.03, 0.9, post, Math.cos(a) * rTop, yTop + 0.45, Math.sin(a) * rTop * 0.55, 8));
    }
    return g;
  },
  // Carport canopy (Навес) — a flat roof on four slim posts.
  canopy: (c) => {
    const g = new THREE.Group();
    const W = 7.2, D = 7.0, H = 2.7;
    const post = mat(METAL, { roughness: 0.5, metalness: 0.4 });
    for (const sx of [-1, 1])
      for (const sz of [-1, 1]) g.add(cyl(0.08, 0.08, H, post, sx * (W / 2 - 0.2), H / 2, sz * (D / 2 - 0.2), 12));
    g.add(tint(box(W, 0.15, D, mat(0xd8d8dc, { roughness: 0.7 }), 0, H + 0.07, 0), c)); // roof slab
    return g;
  },
} satisfies Record<string, FurnitureBuilder>;
