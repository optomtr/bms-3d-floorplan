// ---------------------------------------------------------------------------
// Хранение — модели библиотеки мебели.
//
// Каждая модель возвращает THREE.Group с началом координат в центре пятна
// на полу (y = 0). Порядок ключей в палитре задаёт MODEL_ORDER в ./index.ts,
// а не порядок записей в этом файле.
// ---------------------------------------------------------------------------

import * as THREE from 'three';
import { mat, box, cyl, tint, WOOD, METAL, WHITE, DARK, GLASS, type FurnitureBuilder } from '../primitives';

export const storageModels = {
  wardrobe: (c) => {
    const g = new THREE.Group();
    g.add(tint(box(1.2, 2.0, 0.6, mat(WOOD), 0, 1.0, 0), c));
    g.add(box(0.04, 1.8, 0.02, mat(METAL), -0.02, 1.0, 0.31)); // door split
    g.add(cyl(0.02, 0.02, 0.15, mat(METAL), -0.2, 1.0, 0.32)); // handle
    g.add(cyl(0.02, 0.02, 0.15, mat(METAL), 0.16, 1.0, 0.32));
    return g;
  },
  bookshelf: (c) => {
    const g = new THREE.Group();
    g.add(tint(box(1.0, 1.8, 0.32, mat(WOOD), 0, 0.9, 0), c));
    for (let i = 1; i <= 4; i++) g.add(box(0.94, 0.03, 0.3, mat(DARK), 0, i * 0.36, 0));
    return g;
  },
  // ---- Extra kitchen ----
  wall_cabinet: (c) => {
    // Upper kitchen cabinets (wall-mounted run of doors).
    const g = new THREE.Group();
    const W = 1.6, H = 0.7, D = 0.34;
    g.add(tint(box(W, H, D, mat(WHITE), 0, 0, 0), c));
    for (const sx of [-1, 1]) {
      g.add(box(W / 2 - 0.03, H - 0.04, 0.02, mat(0xf6f6f6), (sx * W) / 4, 0, D / 2 + 0.005));
      g.add(box(0.04, 0.18, 0.03, mat(METAL), sx * 0.03, -H / 4, D / 2 + 0.02)); // handles
    }
    return g;
  },
  // Glass-front kitchen wall cabinet (навесной шкаф со стеклом + подсветкой), as
  // in the reference photo: a dark shaker-frame run whose OUTER sections have
  // glass doors over a lit white interior with glass shelves, and whose CENTRE
  // sections are solid doors. Vertical LED strips down each glass bay light the
  // shelves ("polkalardagi vertikal podsvetka"), and an under-cabinet strip
  // washes the backsplash below ("fartukdagi podsvetka"). Every glow mesh is
  // 'emissive', so binding a light/switch lights them together. Wall-mounted;
  // origin at the cabinet's base. 2.4 x 1.0 x 0.35 m.
  glass_wall_cabinet: (c) => {
    const g = new THREE.Group();
    const W = 2.4, H = 1.0, D = 0.35;
    const backZ = -D / 2, frontZ = D / 2;
    const frame = mat(0x1c2622, { roughness: 0.35, metalness: 0.25 }); // dark green-black
    const frameLite = mat(0x243029, { roughness: 0.4, metalness: 0.2 });
    const metal = mat(METAL, { metalness: 0.7, roughness: 0.3 });
    const glass = mat(0xbfe6ef, { transparent: true, opacity: 0.18, roughness: 0.1, metalness: 0.1 });
    const shelfGlass = mat(0xdfeef2, { transparent: true, opacity: 0.34, roughness: 0.15 });

    // Carcass — back, top, bottom, sides (tinted so a recolor hits the cabinet).
    g.add(tint(box(W, H, 0.02, frame, 0, H / 2, backZ + 0.01), c));
    g.add(tint(box(W, 0.05, D, frame, 0, H - 0.025, 0), c));
    g.add(tint(box(W, 0.05, D, frame, 0, 0.025, 0), c));
    g.add(tint(box(0.04, H, D, frame, -W / 2 + 0.02, H / 2, 0), c));
    g.add(tint(box(0.04, H, D, frame, W / 2 - 0.02, H / 2, 0), c));

    const n = 4, sw = W / n;         // four doors; outer two are glass
    const glassCols = [0, 3];
    for (let i = 0; i < n; i++) {
      const cx = -W / 2 + sw * (i + 0.5);
      if (i < n - 1) g.add(tint(box(0.03, H - 0.06, D - 0.02, frame, cx + sw / 2, H / 2, 0), c)); // divider

      if (glassCols.includes(i)) {
        // Lit display bay: glowing back, vertical side LEDs, glass shelves.
        const inW = sw - 0.1;
        const back = box(inW, H - 0.12, 0.01, mat(0xf6f4ee, { emissive: 0x000000 }), cx, H / 2, backZ + 0.03);
        back.name = 'emissive';
        g.add(back);
        for (const s of [-1, 1]) {
          const strip = box(0.018, H - 0.16, 0.02, mat(0xfff3dc, { emissive: 0x000000 }), cx + s * (inW / 2 - 0.01), H / 2, backZ + 0.07);
          strip.name = 'emissive';
          g.add(strip);
        }
        for (let s = 0; s < 4; s++) {
          g.add(box(inW - 0.03, 0.014, D - 0.12, shelfGlass, cx, 0.16 + s * ((H - 0.24) / 3), 0));
        }
        // Glass door: frame stiles/rails + vertical mullion + translucent pane.
        g.add(box(sw - 0.05, 0.03, 0.03, frameLite, cx, H - 0.05, frontZ - 0.02));
        g.add(box(sw - 0.05, 0.03, 0.03, frameLite, cx, 0.05, frontZ - 0.02));
        for (const s of [-1, 1]) g.add(box(0.03, H - 0.04, 0.03, frameLite, cx + s * (sw / 2 - 0.04), H / 2, frontZ - 0.02));
        g.add(box(0.02, H - 0.08, 0.02, frameLite, cx, H / 2, frontZ - 0.02)); // mullion
        g.add(box(sw - 0.09, H - 0.09, 0.006, glass, cx, H / 2, frontZ - 0.03));
        g.add(box(0.02, 0.14, 0.02, metal, cx + sw / 2 - 0.09, H / 2, frontZ - 0.005)); // handle
      } else {
        // Solid dark door: slab + shaker inset + slim handle meeting the centre.
        g.add(box(sw - 0.05, H - 0.08, 0.03, frameLite, cx, H / 2, frontZ - 0.02));
        g.add(box(sw - 0.16, H - 0.2, 0.008, frame, cx, H / 2, frontZ - 0.004));
        const hx = i < 2 ? cx + sw / 2 - 0.06 : cx - sw / 2 + 0.06;
        g.add(box(0.02, 0.18, 0.025, metal, hx, H / 2, frontZ - 0.005));
      }
    }

    // Under-cabinet LED that washes the marble backsplash below (фартук).
    const under = box(W - 0.1, 0.02, 0.05, mat(0xffe9c4, { emissive: 0x000000 }), 0, 0.006, frontZ - 0.1);
    under.name = 'emissive';
    g.add(under);

    g.add(tint(box(W + 0.05, 0.05, D + 0.04, frame, 0, H + 0.02, 0), c)); // slim crown
    return g;
  },
  // Tall floor-to-ceiling display cabinet — dark tinted glass doors in a
  // brass-framed wood body (the "uzun shkaf"). Sits flush on the wall.
  tall_cabinet: (c) => {
    const g = new THREE.Group();
    const W = 1.5, H = 2.6, D = 0.42;
    const wood = mat(WOOD, { roughness: 0.6 });
    g.add(tint(box(W, H, D, wood, 0, H / 2, 0), c)); // body
    g.add(box(W - 0.1, H - 0.55, D - 0.08, mat(0x14161a, { roughness: 0.6 }), 0, H / 2 + 0.05, -0.02)); // interior
    for (let i = 1; i <= 5; i++) g.add(box(W - 0.14, 0.03, D - 0.12, mat(0x2a2d33), 0, 0.35 + i * 0.38, -0.02)); // shelves
    const glass = mat(0x0e0f12, { transparent: true, opacity: 0.72, roughness: 0.15, metalness: 0.3 });
    for (const sx of [-1, 1]) g.add(box(W / 2 - 0.06, H - 0.55, 0.02, glass, sx * (W / 4), H / 2 + 0.05, D / 2)); // glass doors
    const brass = mat(0xcbb26a, { metalness: 0.6, roughness: 0.35 });
    for (const x of [-W / 2 + 0.05, 0, W / 2 - 0.05]) g.add(box(0.025, H - 0.5, 0.03, brass, x, H / 2 + 0.05, D / 2 + 0.005)); // frame stiles
    g.add(box(W - 0.06, 0.03, 0.03, brass, 0, H - 0.22, D / 2 + 0.005)); // top rail
    g.add(box(W - 0.06, 0.03, 0.03, brass, 0, 0.32, D / 2 + 0.005)); // bottom rail
    g.add(tint(box(W, 0.3, D, wood, 0, 0.15, 0), c)); // wood base
    return g;
  },
  tv_stand: (c) => {
    const g = new THREE.Group();
    g.add(tint(box(1.4, 0.4, 0.4, mat(DARK), 0, 0.2, 0), c));
    g.add(box(0.6, 0.02, 0.36, mat(METAL), -0.35, 0.41, 0));
    return g;
  },
  // Low media console under the TV — a wood cabinet with door fronts + a top.
  tv_console: (c) => {
    const g = new THREE.Group();
    const W = 2.0, H = 0.5, D = 0.45;
    const wood = mat(WOOD, { roughness: 0.6 });
    g.add(tint(box(W, H, D, wood, 0, H / 2 + 0.05, 0), c)); // carcass
    g.add(box(W + 0.04, 0.03, D + 0.04, mat(0x6e4a2f, { roughness: 0.5 }), 0, H + 0.065, 0)); // top
    const n = 4, dw = W / n;
    for (let i = 0; i < n; i++) g.add(tint(box(dw - 0.02, H - 0.08, 0.02, wood, -W / 2 + dw * (i + 0.5), H / 2 + 0.05, D / 2 + 0.005), c)); // door fronts
    g.add(box(W - 0.1, 0.06, D - 0.06, mat(0x3a2f26), 0, 0.03, 0)); // toe kick
    return g;
  },
  sideboard: (c) => {
    const g = new THREE.Group();
    g.add(tint(box(1.6, 0.8, 0.45, mat(WOOD), 0, 0.4, 0), c));
    for (let i = -1; i <= 1; i++) g.add(box(0.02, 0.1, 0.02, mat(METAL), i * 0.5, 0.5, 0.23));
    return g;
  },
  wine_rack: (c) => {
    const g = new THREE.Group();
    const w = mat(WOOD);
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const)
      g.add(tint(box(0.05, 0.8, 0.05, w, sx * 0.28, 0.4, sz * 0.14), c));
    for (const y of [0.15, 0.35, 0.55, 0.75]) g.add(box(0.56, 0.03, 0.28, w, 0, y, 0));
    return g;
  },
  // ---- Office ----
  filing_cabinet: (c) => {
    const g = new THREE.Group();
    g.add(tint(box(0.45, 1.0, 0.55, mat(METAL, { metalness: 0.4, roughness: 0.5 }), 0, 0.5, 0), c));
    for (const y of [0.25, 0.5, 0.75]) g.add(box(0.4, 0.02, 0.02, mat(DARK), 0, y, 0.28));
    return g;
  },
  // ---- Entry / utility / decor ----
  shoe_rack: (c) => {
    const g = new THREE.Group();
    const w = mat(WOOD);
    for (const y of [0.1, 0.3, 0.5]) g.add(tint(box(0.8, 0.03, 0.3, w, 0, y, 0), c));
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const)
      g.add(box(0.04, 0.55, 0.04, w, sx * 0.38, 0.275, sz * 0.13));
    return g;
  },
  coat_rack: (c) => {
    const g = new THREE.Group();
    const w = mat(WOOD);
    g.add(tint(cyl(0.04, 0.06, 1.7, w, 0, 0.85, 0, 12), c));
    g.add(cyl(0.25, 0.25, 0.04, w, 0, 0.02, 0, 16));
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2;
      g.add(box(0.18, 0.03, 0.03, w, Math.cos(a) * 0.09, 1.6, Math.sin(a) * 0.09));
    }
    return g;
  },
  wall_shelf: (c) => {
    const g = new THREE.Group();
    const w = mat(WOOD);
    g.add(tint(box(0.8, 0.04, 0.22, w, 0, 0, 0.11), c));
    g.add(box(0.04, 0.2, 0.2, w, -0.36, -0.1, 0.1));
    g.add(box(0.04, 0.2, 0.2, w, 0.36, -0.1, 0.1));
    return g;
  },
  // ---- Wardrobes / cabinets ----
  wardrobe_glass: (c) => {
    // Multi-shelf wardrobe with transparent glass doors (see the shelves).
    const g = new THREE.Group();
    const W = 1.2, H = 2.1, D = 0.58;
    g.add(tint(box(W, H, D, mat(WHITE), 0, H / 2, 0), c)); // body
    g.add(box(W - 0.06, H - 0.06, D - 0.08, mat(0x202428), 0, H / 2, -0.02)); // dark interior
    for (const y of [0.45, 0.9, 1.35, 1.75]) g.add(box(W - 0.1, 0.03, D - 0.1, mat(WOOD), 0, y, 0)); // shelves
    const gl = mat(GLASS, { transparent: true, opacity: 0.3, metalness: 0.2, roughness: 0.05 });
    g.add(box(W / 2 - 0.04, H - 0.14, 0.02, gl, -W / 4, H / 2, D / 2 + 0.01));
    g.add(box(W / 2 - 0.04, H - 0.14, 0.02, gl, W / 4, H / 2, D / 2 + 0.01));
    g.add(box(0.04, H - 0.1, 0.05, mat(METAL), 0, H / 2, D / 2 + 0.015)); // center stile
    g.add(cyl(0.012, 0.012, 0.2, mat(METAL), -0.06, H / 2, D / 2 + 0.05, 8));
    g.add(cyl(0.012, 0.012, 0.2, mat(METAL), 0.06, H / 2, D / 2 + 0.05, 8));
    return g;
  },
  display_cabinet: (c) => {
    // Tall glass display cabinet with lit-looking shelves + a couple of items.
    const g = new THREE.Group();
    const W = 0.9, H = 1.9, D = 0.4;
    g.add(tint(box(W, H, D, mat(WOOD), 0, H / 2, 0), c));
    g.add(box(W - 0.08, H - 0.2, D - 0.06, mat(0x1c2024), 0, H / 2 + 0.04, -0.01)); // interior
    const gl = mat(GLASS, { transparent: true, opacity: 0.26, metalness: 0.2, roughness: 0.05 });
    g.add(box(W - 0.06, H - 0.28, 0.02, gl, 0, H / 2 + 0.04, D / 2)); // front glass
    for (const y of [0.55, 0.95, 1.35, 1.7]) g.add(box(W - 0.1, 0.02, D - 0.08, mat(0xf2f2f2), 0, y, 0));
    g.add(tint(cyl(0.05, 0.07, 0.16, mat(0xdfe6ea), -0.2, 0.63, 0, 12), c));
    g.add(box(0.12, 0.18, 0.1, mat(0x8a3b3b), 0.18, 0.64, 0));
    return g;
  },
  shelving_unit: (c) => {
    // Tall open multi-tier shelving.
    const g = new THREE.Group();
    const w = mat(WOOD);
    const W = 1.0, H = 2.0, D = 0.32;
    g.add(tint(box(0.04, H, D, w, -W / 2, H / 2, 0), c));
    g.add(tint(box(0.04, H, D, w, W / 2, H / 2, 0), c));
    g.add(box(W, 0.03, 0.04, w, 0, H - 0.02, -D / 2 + 0.02)); // top back rail
    for (let i = 0; i < 6; i++) g.add(box(W, 0.03, D, w, 0, 0.04 + (i * (H - 0.08)) / 5, 0));
    return g;
  },
  wardrobe_lit: (c) => {
    // Backlit wardrobe: the LED strips (named "emissive") glow when a bound
    // light/switch entity is on. Open-front so the glow is visible.
    const g = new THREE.Group();
    const W = 1.2, H = 2.1, D = 0.58;
    g.add(tint(box(W, H, D, mat(WHITE), 0, H / 2, 0), c)); // body
    g.add(box(W - 0.06, H - 0.06, D - 0.08, mat(0x14171a), 0, H / 2, -0.02)); // dark interior
    for (const y of [0.6, 1.5]) g.add(box(W - 0.1, 0.03, D - 0.1, mat(WOOD), 0, y, 0)); // shelves
    const rod = cyl(0.015, 0.015, W - 0.16, mat(METAL), 0, 1.95, 0.05, 8);
    rod.rotation.z = Math.PI / 2;
    g.add(rod); // hanging rail
    // LED strips laid along the underside of the top and a shelf — these glow.
    for (const y of [H - 0.12, 1.45, 0.55]) {
      const led = box(W - 0.16, 0.035, 0.04, mat(0xeaeaea, { emissive: 0x000000 }), 0, y, D / 2 - 0.12);
      led.name = 'emissive';
      g.add(led);
    }
    return g;
  },
  // Built-in arched bookcase wall with a window seat (арочные ниши + скамья).
  // Two arched niches — open cubbies over wood cabinets — flanking a cushioned
  // bench nook with drawers. The face is ONE slab with the arches and the bench
  // nook cut out of it, so the openings read as real reveals; everything else
  // lives behind that face and is occluded by it.
  arch_shelf_wall: (c) => {
    const g = new THREE.Group();
    const W = 4.8, H = 2.5, D = 0.42;
    const FZ = D / 2 - 0.06; // front slab spans z FZ .. D/2
    const NX = 1.5;          // niche centre offset
    const R = 0.625;         // niche half-width == arch radius
    const NY0 = 0.05;        // niche opening bottom
    const NY1 = 2.2;         // arch crown
    const YS = NY1 - R;      // arch spring line
    const BW = 1.75, BH = 1.02; // bench nook
    const IZ = -0.03, ID = 0.34; // interior parts: centre z + depth (stay behind FZ)
    const white = mat(WHITE, { roughness: 0.75 });
    const wood = mat(0xa9764a, { roughness: 0.6 });
    const metal = mat(METAL, { metalness: 0.6, roughness: 0.3 });
    const knob = (x: number, y: number, z: number, r = 0.016) => {
      const m = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), metal);
      m.position.set(x, y, z);
      return m;
    };

    const face = new THREE.Shape();
    face.moveTo(-W / 2, 0);
    face.lineTo(W / 2, 0);
    face.lineTo(W / 2, H);
    face.lineTo(-W / 2, H);
    face.closePath();
    const archHole = (cx: number) => {
      const p = new THREE.Path();
      p.moveTo(cx - R, NY0);
      p.lineTo(cx - R, YS);
      p.absarc(cx, YS, R, Math.PI, 0, true); // clockwise PI→0 = the TOP semicircle
      p.lineTo(cx + R, NY0);
      p.closePath();
      return p;
    };
    const benchHole = new THREE.Path();
    benchHole.moveTo(-BW / 2, 0);
    benchHole.lineTo(BW / 2, 0);
    benchHole.lineTo(BW / 2, BH);
    benchHole.lineTo(-BW / 2, BH);
    benchHole.closePath();
    face.holes.push(archHole(-NX), archHole(NX), benchHole);
    const front = new THREE.Mesh(
      new THREE.ExtrudeGeometry(face, { depth: 0.06, bevelEnabled: false }),
      white,
    );
    front.position.z = FZ;
    g.add(tint(front, c));

    // Niches: back, sides, wood cabinet, three rows of cubbies split in two.
    const CT = 0.72; // cabinet top
    for (const cx of [-NX, NX]) {
      g.add(tint(box(R * 2, NY1 - NY0, 0.02, white, cx, (NY0 + NY1) / 2, -D / 2 + 0.01), c));
      for (const s of [-1, 1]) {
        g.add(tint(box(0.02, NY1 - NY0, 0.36, white, cx + s * R, (NY0 + NY1) / 2, IZ), c));
        g.add(box(R - 0.05, CT - NY0 - 0.04, 0.02, wood, cx + s * (R / 2), (NY0 + CT) / 2, D / 2 - 0.08));
        g.add(knob(cx + s * 0.06, CT - 0.14, D / 2 - 0.06));
      }
      g.add(tint(box(R * 2, 0.03, ID, white, cx, CT, IZ), c));
      for (const sy of [1.2, 1.68]) g.add(tint(box(R * 2 - 0.04, 0.025, ID, white, cx, sy, IZ), c));
      g.add(tint(box(0.025, 1.68 - CT, ID, white, cx, (CT + 1.68) / 2, IZ), c));
    }

    // Bench nook: back, side returns, drawers, seat, striped cushion, pillows.
    g.add(tint(box(BW, BH, 0.02, white, 0, BH / 2, -D / 2 + 0.01), c));
    for (const s of [-1, 1]) g.add(tint(box(0.02, BH, 0.36, white, s * (BW / 2), BH / 2, IZ), c));
    for (const dx of [-0.55, 0, 0.55]) {
      g.add(box(0.5, 0.36, 0.02, wood, dx, 0.24, D / 2 - 0.08));
      g.add(knob(dx, 0.24, D / 2 - 0.06, 0.018));
    }
    const SY = 0.46;
    g.add(tint(box(BW - 0.04, 0.04, ID, white, 0, SY, IZ), c));
    g.add(box(BW - 0.14, 0.09, 0.3, mat(0xdfe3e8, { roughness: 0.9 }), 0, SY + 0.065, IZ));
    const stripe = mat(0x8b95a4, { roughness: 0.9 });
    for (let i = 0; i < 9; i++) {
      g.add(box(0.02, 0.092, 0.302, stripe, -0.7 + i * 0.175, SY + 0.065, IZ));
    }
    for (const s of [-1, 1]) {
      g.add(box(0.3, 0.15, 0.12, mat(WHITE, { roughness: 0.95 }), s * 0.6, SY + 0.18, -0.12));
    }

    g.add(tint(box(W, 0.07, D + 0.05, white, 0, H - 0.035, 0.02), c)); // crown
    return g;
  },
  // Backlit niche display wall (ниши с подсветкой + стеклянные полки). Two tall
  // rectangular niches with a stone back, dark floating glass shelves and a
  // vertical cove-light strip down each inner edge; a framed TV panel between
  // them over a low fluted black console. The light strips are 'emissive', so
  // binding the room's подсветка light glows them. 4.6 x 2.5 x 0.4 m.
  niche_shelf_wall: (c) => {
    const g = new THREE.Group();
    const W = 4.6, H = 2.5, D = 0.4;
    const FZ = D / 2 - 0.06;      // front slab front face
    const NX = 1.5, R = 0.48;     // niche centre offset + half-width
    const NY0 = 0.06, NY1 = 2.25; // niche opening bottom / top
    const IZ = -0.02, ID = 0.32;  // interior parts: centre z + depth (behind FZ)
    const white = mat(WHITE, { roughness: 0.8 });
    const stone = mat(0x8d8f92, { roughness: 0.85 });
    const glass = mat(0x23262b, { roughness: 0.25, metalness: 0.35, transparent: true, opacity: 0.72 });
    const dark = mat(0x1b1d20, { roughness: 0.5, metalness: 0.2 });

    // Front slab with two rectangular niche cut-outs.
    const face = new THREE.Shape();
    face.moveTo(-W / 2, 0); face.lineTo(W / 2, 0); face.lineTo(W / 2, H); face.lineTo(-W / 2, H); face.closePath();
    const rectHole = (cx: number) => {
      const p = new THREE.Path();
      p.moveTo(cx - R, NY0); p.lineTo(cx + R, NY0); p.lineTo(cx + R, NY1); p.lineTo(cx - R, NY1); p.closePath();
      return p;
    };
    face.holes.push(rectHole(-NX), rectHole(NX));
    const front = new THREE.Mesh(new THREE.ExtrudeGeometry(face, { depth: 0.06, bevelEnabled: false }), white);
    front.position.z = FZ;
    g.add(tint(front, c));

    // Niches: stone back, side reveals, cove-light strips, dark glass shelves.
    for (const cx of [-NX, NX]) {
      g.add(tint(box(R * 2, NY1 - NY0, 0.02, stone, cx, (NY0 + NY1) / 2, -D / 2 + 0.01), c));
      for (const s of [-1, 1]) {
        g.add(tint(box(0.02, NY1 - NY0, ID, white, cx + s * R, (NY0 + NY1) / 2, IZ), c));
        const strip = box(0.03, NY1 - NY0 - 0.1, 0.04, mat(0xfff1d8, { emissive: 0x000000 }),
          cx + s * (R - 0.05), (NY0 + NY1) / 2, IZ + ID / 2 - 0.03);
        strip.name = 'emissive';
        g.add(strip);
      }
      for (let i = 0; i < 4; i++) {
        g.add(box(R * 2 - 0.08, 0.02, ID - 0.04, glass, cx, 0.5 + i * 0.48, IZ));
      }
    }

    // Centre: a framed TV panel over a low fluted console.
    const frameZ = FZ + 0.045, fx = 0.72, fy0 = 0.62, fy1 = 2.15, ft = 0.03;
    g.add(tint(box(fx * 2, ft, 0.03, white, 0, fy1, frameZ), c));
    g.add(tint(box(fx * 2, ft, 0.03, white, 0, fy0, frameZ), c));
    g.add(tint(box(ft, fy1 - fy0, 0.03, white, -fx, (fy0 + fy1) / 2, frameZ), c));
    g.add(tint(box(ft, fy1 - fy0, 0.03, white, fx, (fy0 + fy1) / 2, frameZ), c));
    const CW = 1.7, CH = 0.5, CD = 0.34, cz = D / 2 - CD / 2 + 0.02;
    g.add(box(CW, CH, CD, dark, 0, CH / 2 + 0.02, cz));
    g.add(box(CW + 0.04, 0.04, CD + 0.03, mat(0x121316, { roughness: 0.4 }), 0, CH + 0.04, cz)); // top slab
    const rib = mat(0x2a2d31, { roughness: 0.55, metalness: 0.15 });
    for (let i = 0; i < 16; i++) {
      g.add(box(0.022, CH - 0.06, 0.02, rib, -CW / 2 + 0.06 + i * ((CW - 0.12) / 15), CH / 2 + 0.02, cz + CD / 2));
    }

    g.add(tint(box(W, 0.08, D + 0.05, white, 0, H - 0.04, 0.02), c)); // crown
    g.add(tint(box(W, 0.1, D + 0.02, white, 0, 0.05, 0.01), c));      // skirting
    return g;
  },
  books: (c) => {
    const g = new THREE.Group();
    const cols = [0x8a3b3b, 0x3b5a8a, 0x3b8a5a, 0xb5912f];
    let y = 0.02;
    for (let i = 0; i < 4; i++) {
      g.add(box(0.22, 0.04, 0.16, mat(cols[i % cols.length]), 0, y, (i % 2) * 0.01));
      y += 0.045;
    }
    tint(g.children[0] as THREE.Mesh, c);
    return g;
  },
} satisfies Record<string, FurnitureBuilder>;
