// ---------------------------------------------------------------------------
// Столы и рабочие места — модели библиотеки мебели.
//
// Каждая модель возвращает THREE.Group с началом координат в центре пятна
// на полу (y = 0). Порядок ключей в палитре задаёт MODEL_ORDER в ./index.ts,
// а не порядок записей в этом файле.
// ---------------------------------------------------------------------------

import { mat, box, cyl, tint, defineModel, legs4Box, legs4Cyl, WOOD, METAL, DARK, type FurnitureBuilder } from '../primitives';

export const tableModels = {
  table: defineModel((g, c) => {
    const wood = mat(WOOD);
    g.add(tint(box(1.4, 0.06, 0.8, wood, 0, 0.74, 0), c)); // top
    const lx = 0.62, lz = 0.32;
    legs4Box(g, 0.07, 0.74, 0.07, wood, lx, lz, 0.37);
  }),
  // Round/oval stone table (travertine look) on two chunky curved feet.
  round_table: defineModel((g, c) => {
    const stone = mat(0xe9e2d5, { roughness: 0.55, metalness: 0.02 });
    const top = cyl(0.75, 0.75, 0.08, stone, 0, 0.73, 0, 44);
    top.scale.z = 0.72; // oval
    g.add(tint(top, c));
    for (const sz of [-1, 1]) {
      const foot = cyl(0.16, 0.24, 0.7, stone, 0, 0.35, sz * 0.22, 24);
      foot.scale.x = 1.3;
      g.add(tint(foot, c));
    }
  }),
  coffee_table: defineModel((g, c) => {
    const woodDark = mat(0x6f4a28, { roughness: 0.55 }); // edge band / underframe
    const legMat = mat(DARK, { roughness: 0.4, metalness: 0.3 }); // slim tapered metal legs
    // Top slab: darker edge band + a slightly smaller tinted cap (chamfer/reveal)
    g.add(box(1.2, 0.035, 0.6, woodDark, 0, 0.383, 0)); // edge band (peeks out under the cap)
    g.add(tint(box(1.15, 0.03, 0.55, mat(WOOD, { roughness: 0.5 }), 0, 0.415, 0), c)); // main veneer top
    // Apron under the top for a solid look
    g.add(box(1.06, 0.05, 0.46, woodDark, 0, 0.345, 0));
    // Lower display shelf (two-tone slab)
    g.add(box(1.02, 0.03, 0.5, mat(WOOD, { roughness: 0.5 }), 0, 0.13, 0));
    g.add(box(0.96, 0.02, 0.44, woodDark, 0, 0.112, 0)); // shelf underframe
    // 4 tapered legs (thinner at the foot)
    legs4Cyl(g, 0.023, 0.036, 0.36, legMat, 0.52, 0.245, 0.18, 12);
  }),
  dining_table: defineModel((g, c) => {
    g.add(tint(box(1.8, 0.06, 0.95, mat(WOOD), 0, 0.75, 0), c));
    legs4Box(g, 0.08, 0.75, 0.08, mat(WOOD), 0.8, 0.4, 0.37);
  }),
  // Long racetrack dining table — a flat top with straight sides and semicircular
  // ends, on two pedestal bases. The "yoni yumaloq" table: rectangular in the
  // middle, half-round at each end, so it seats a long side without hard corners.
  // ~2.6 x 1.1 m. (dining_table is the plain rectangle; round_table is a small oval.)
  dining_table_oval: defineModel((g, c) => {
    const L = 2.6, W = 1.1, t = 0.05, h = 0.75;
    const wood = mat(WOOD, { roughness: 0.45 });
    const dark = mat(0x6f4a28, { roughness: 0.55 });
    const mid = L - W; // straight run between the two half-round end caps
    g.add(tint(box(mid, t, W, wood, 0, h, 0), c));
    for (const sx of [-1, 1]) g.add(tint(cyl(W / 2, W / 2, t, wood, sx * (mid / 2), h, 0, 32), c));
    // Slim apron just under the top, following the same racetrack outline.
    g.add(box(mid, 0.04, W - 0.12, dark, 0, h - 0.045, 0));
    for (const sx of [-1, 1]) g.add(cyl(W / 2 - 0.06, W / 2 - 0.06, 0.04, dark, sx * (mid / 2), h - 0.045, 0, 24));
    // Two pedestal bases on floor plinths.
    const ph = h - 0.07;
    for (const sx of [-1, 1]) {
      g.add(tint(box(0.12, ph, W - 0.45, wood, sx * (mid / 2 - 0.1), ph / 2, 0), c));
      g.add(box(0.5, 0.05, W - 0.3, dark, sx * (mid / 2 - 0.1), 0.025, 0));
    }
  }),
  desk: defineModel((g, c) => {
    const wood = mat(WOOD, { roughness: 0.6 });
    const dark = mat(DARK, { roughness: 0.5 });
    const steel = mat(METAL, { roughness: 0.4, metalness: 0.5 });
    // Chamfered top: main slab + a slightly smaller raised inlay pad on top.
    g.add(tint(box(1.5, 0.04, 0.75, wood, 0, 0.71, 0), c)); // main top slab (tintable)
    g.add(box(1.42, 0.02, 0.67, mat(0x8a5f34, { roughness: 0.55 }), 0, 0.735, 0)); // inlay pad / chamfer
    // Drawer pedestal on the right side.
    g.add(box(0.42, 0.66, 0.68, dark, 0.5, 0.36, 0)); // pedestal body
    for (let i = 0; i < 3; i++) {
      const y = 0.2 + i * 0.2;
      g.add(box(0.34, 0.17, 0.02, mat(0x3a3f47, { roughness: 0.5 }), 0.5, y, 0.35)); // drawer front
      g.add(box(0.12, 0.02, 0.02, steel, 0.5, y, 0.37)); // handle
    }
    // Modesty panel spanning the kneehole.
    g.add(box(0.9, 0.42, 0.03, wood, -0.13, 0.45, -0.34));
    // Slim tapered metal legs on the open (left) side.
    g.add(cyl(0.025, 0.035, 0.68, steel, -0.68, 0.34, 0.3, 12));
    g.add(cyl(0.025, 0.035, 0.68, steel, -0.68, 0.34, -0.3, 12));
  }),
  console_table: defineModel((g, c) => {
    const w = mat(WOOD);
    g.add(tint(box(1.2, 0.05, 0.4, w, 0, 0.8, 0), c));
    for (const sx of [-1, 1]) g.add(box(0.06, 0.8, 0.36, w, sx * 0.55, 0.4, 0));
    g.add(box(1.1, 0.04, 0.36, w, 0, 0.4, 0));
  }),
  // Modern L-shaped executive (director's) desk — sculptural solid body with a
  // dark-wood top and a lower side return.
  boss_desk: defineModel((g, c) => {
    const body = mat(0xcfc9bd, { roughness: 0.5 });
    const top = mat(0x5b3f28, { roughness: 0.4 });
    g.add(box(2.0, 0.05, 0.95, top, 0, 0.76, 0)); // main dark top
    g.add(tint(box(2.1, 0.72, 1.0, body, 0, 0.36, 0.02), c)); // solid body
    g.add(box(1.0, 0.62, 0.05, mat(0x2b2f36, { roughness: 0.8 }), 0, 0.33, -0.42)); // kneehole recess
    g.add(box(1.0, 0.05, 0.6, top, -1.4, 0.66, -0.15)); // L return top
    g.add(tint(box(1.0, 0.62, 0.6, body, -1.4, 0.31, -0.15), c)); // L return body
  }),
  conference_table: defineModel((g, c) => {
    const L = 6.8, W = 1.4; // long boardroom footprint (length on X, width on Z)
    const veneer = mat(WOOD, { roughness: 0.45 });
    const bandMat = mat(0x6f4a28, { roughness: 0.55 }); // darker edge band / plinths
    const inlayMat = mat(0x4a3218, { roughness: 0.4 }); // subtle contrast inlay
    const portMat = mat(DARK, { roughness: 0.4, metalness: 0.45 }); // cable/port boxes
    const portFace = mat(0x101418, { emissive: 0x0a1a22 }); // recessed port faces
    // Top: darker edge band + a slightly smaller tinted veneer cap (chamfer/reveal)
    g.add(box(L, 0.045, W, bandMat, 0, 0.695, 0)); // edge band
    g.add(tint(box(L - 0.12, 0.04, W - 0.08, veneer, 0, 0.72, 0), c)); // main veneer top (surface ~0.74)
    // Subtle inlay border strips inset in the veneer, running the length
    for (const sz of [-1, 1])
      g.add(box(L - 0.5, 0.006, 0.05, inlayMat, 0, 0.741, sz * 0.5));
    // Two chunky panel/plinth legs near the ends
    for (const sx of [-1, 1]) {
      g.add(box(0.14, 0.66, W - 0.25, bandMat, sx * 2.35, 0.35, 0)); // panel leg
      g.add(box(0.12, 0.62, W - 0.4, mat(0x5a3d22, { roughness: 0.5 }), sx * 2.35, 0.35, 0)); // inset face
      g.add(box(0.5, 0.06, W - 0.1, bandMat, sx * 2.35, 0.03, 0)); // floor plinth
    }
    // Central connecting beam between the panels
    g.add(box(4.5, 0.18, 0.24, bandMat, 0, 0.42, 0));
    // Hint of cable/port boxes down the centre line
    for (const px of [-1.8, 0, 1.8]) {
      g.add(box(0.38, 0.03, 0.24, portMat, px, 0.755, 0)); // flush cable tray
      g.add(box(0.3, 0.01, 0.16, portFace, px, 0.772, 0)); // recessed port face
    }
  }),
  executive_desk: defineModel((g, c) => {
    const wood = mat(WOOD, { roughness: 0.55 });
    const dark = mat(DARK, { roughness: 0.5 });
    const steel = mat(METAL, { roughness: 0.4, metalness: 0.5 });
    // Large chamfered top: slab + inset leather-look pad.
    g.add(tint(box(2.0, 0.05, 0.95, wood, 0, 0.73, 0), c)); // main top slab (tintable)
    g.add(box(1.8, 0.02, 0.8, mat(0x7a5230, { roughness: 0.5 }), 0, 0.758, 0)); // desk pad / chamfer
    // Subtle raised back edge (director's gallery rail).
    g.add(box(2.0, 0.05, 0.07, wood, 0, 0.785, -0.44));
    // Full-height modesty front panel (visitor side) + recessed accent inset.
    g.add(box(1.45, 0.64, 0.04, wood, -0.255, 0.38, 0.44));
    g.add(box(1.3, 0.44, 0.02, mat(0x8a5f34, { roughness: 0.55 }), -0.255, 0.38, 0.465));
    // Solid left end panel.
    g.add(box(0.05, 0.7, 0.9, wood, -0.97, 0.35, 0));
    // Side return / drawer pedestal on the right; drawers face the seated user (-Z).
    g.add(box(0.5, 0.72, 0.9, dark, 0.72, 0.36, 0));
    for (let i = 0; i < 3; i++) {
      const y = 0.2 + i * 0.22;
      g.add(box(0.42, 0.2, 0.02, mat(0x3a3f47, { roughness: 0.5 }), 0.72, y, -0.46)); // drawer front
      g.add(box(0.14, 0.02, 0.02, steel, 0.72, y, -0.48)); // handle
    }
  }),
  // Reception / front desk (Ресепшн) — counter carcass + raised transaction top +
  // a lower inner work surface.
  reception: defineModel((g, c) => {
    // Premium floor-standing reception desk (~2.4 wide): recessed toe-kick, paneled
    // front with reveal grooves, staff-side inner work surface, and a raised stone
    // transaction top floating on slim metal standoffs. Front faces +Z.
    const W = 2.4, D = 0.72, H = 1.02;
    const body = mat(WOOD, { roughness: 0.55 });
    const panel = mat(0x8a5f34, { roughness: 0.5 });
    const stone = mat(0xe6e2d8, { roughness: 0.35, metalness: 0.05 });
    const dark = mat(DARK, { roughness: 0.4 });
    const metal = mat(METAL, { metalness: 0.7, roughness: 0.3 });
    const yBody = 0.12 + (H - 0.12) / 2;
    // Recessed toe-kick (set back so the carcass appears to float).
    g.add(box(W - 0.1, 0.12, D - 0.16, dark, 0, 0.06, 0));
    // Main carcass — the primary tinted surface.
    g.add(tint(box(W, H - 0.12, D, body, 0, yBody, 0), c));
    // Paneled front: three raised panels with reveal gaps between them.
    const pz = D / 2 + 0.012, pw = (W - 0.16) / 3;
    for (let i = 0; i < 3; i++) {
      const px = -W / 2 + 0.08 + pw / 2 + i * (pw + 0.02);
      g.add(box(pw - 0.02, H - 0.3, 0.024, panel, px, yBody, pz));
    }
    // Slim horizontal reveal grooves (top + bottom shadow lines).
    g.add(box(W - 0.12, 0.02, 0.006, dark, 0, H - 0.18, pz + 0.006));
    g.add(box(W - 0.12, 0.02, 0.006, dark, 0, 0.3, pz + 0.006));
    // Side return panels (subtle two-tone end caps).
    for (const sx of [-1, 1])
      g.add(box(0.02, H - 0.2, D - 0.06, panel, sx * (W / 2 + 0.011), yBody, 0));
    // Staff-side inner work surface (desk height).
    g.add(box(W - 0.2, 0.04, 0.5, mat(0xcbb79c, { roughness: 0.5 }), 0, 0.74, -0.16));
    // Raised transaction top — stone slab floating on slim metal standoffs.
    for (const sx of [-1, 0, 1])
      g.add(cyl(0.012, 0.012, 0.1, metal, sx * (W / 2 - 0.2), H + 0.05, 0.05, 8));
    g.add(box(W + 0.12, 0.05, D + 0.22, stone, 0, H + 0.125, 0.02));  // transaction slab
    g.add(box(W + 0.08, 0.03, D + 0.18, stone, 0, H + 0.09, 0.02));   // stepped under-lip (thick-edge reveal)
  }),
} satisfies Record<string, FurnitureBuilder>;
