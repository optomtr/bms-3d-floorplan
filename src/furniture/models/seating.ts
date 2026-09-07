// ---------------------------------------------------------------------------
// Диваны и кресла — модели библиотеки мебели.
//
// Каждая модель возвращает THREE.Group с началом координат в центре пятна
// на полу (y = 0). Порядок ключей в палитре задаёт MODEL_ORDER в ./index.ts,
// а не порядок записей в этом файле.
// ---------------------------------------------------------------------------

import * as THREE from 'three';
import { mat, box, cyl, tint, WOOD, FABRIC, METAL, DARK, type FurnitureBuilder } from '../primitives';

export const seatingModels = {
  sofa: (c) => {
    const g = new THREE.Group();
    const frameC = c.clone().multiplyScalar(0.62);          // two-tone: darker frame
    const seatMat = () => mat(FABRIC, { roughness: 0.9 }); // fresh mat per cushion so tint is independent
    const frameMat = () => mat(FABRIC, { roughness: 0.97 });
    const legMat = mat(0x3b2f26, { roughness: 0.5, metalness: 0.2 }); // dark-wood feet

    // 4 short tapered feet
    for (const sx of [-1, 1])
      for (const sz of [-1, 1])
        g.add(cyl(0.035, 0.05, 0.1, legMat, sx * 0.92, 0.05, sz * 0.34, 10));

    // base plinth (darker) + chamfered seat deck
    g.add(tint(box(2.0, 0.24, 0.86, frameMat(), 0, 0.22, 0), frameC));
    g.add(tint(box(1.9, 0.06, 0.8, frameMat(), 0, 0.35, 0.02), frameC));

    // two upholstered arms with rounded top rolls
    for (const sx of [-1, 1]) {
      g.add(tint(box(0.2, 0.52, 0.86, seatMat(), sx * 0.95, 0.36, 0), c));
      const roll = cyl(0.1, 0.1, 0.86, seatMat(), sx * 0.95, 0.62, 0, 14);
      roll.rotation.x = Math.PI / 2;
      g.add(tint(roll, c));
    }

    // back frame board
    g.add(tint(box(1.74, 0.5, 0.12, frameMat(), 0, 0.62, -0.37), frameC));

    // 3 separate seat cushions (slab + inset cap = faux-rounded piping)
    for (const sx of [-0.58, 0, 0.58]) {
      g.add(tint(box(0.56, 0.16, 0.6, seatMat(), sx, 0.42, 0.08), c));
      g.add(tint(box(0.5, 0.06, 0.54, seatMat(), sx, 0.52, 0.08), c));
    }

    // 3 back cushions, slightly reclined
    for (const sx of [-0.58, 0, 0.58]) {
      const b = box(0.56, 0.42, 0.16, seatMat(), sx, 0.66, -0.3);
      b.rotation.x = -0.14;
      g.add(tint(b, c));
    }

    // 2 accent throw pillows (diamond-tilted, leaning on the back)
    for (const [px, rot] of [[-0.6, 0.5], [0.5, -0.5]]) {
      const p = box(0.34, 0.34, 0.12, seatMat(), px, 0.6, -0.12);
      p.rotation.z = rot;
      p.rotation.x = -0.2;
      g.add(tint(p, frameC));
    }
    return g;
  },
  sofa_round: (c) => {
    // Curved (semi-circular) sofa — a conversation-pit lounge. Built from three
    // torus arcs that share the SAME orientation so their open gaps line up.
    // NOTE: the torus lies in its local XY plane with the tube along local Z;
    // after rotation.x the tube becomes the WORLD-VERTICAL axis, so the cushion
    // is flattened via scale.z (NOT scale.y) and lifted so nothing dips below 0.
    const g = new THREE.Group();
    const fabric = mat(FABRIC);
    const R = 1.0;
    const arc = Math.PI * 1.15; // a bit more than a half-ring
    const start = Math.PI / 2 - arc / 2;
    const orient = (m: THREE.Mesh) => {
      m.rotation.x = Math.PI / 2;
      m.rotation.z = -start;
    };
    // Seat cushion: flattened tube, sitting on the base.
    const seat = new THREE.Mesh(new THREE.TorusGeometry(R, 0.42, 12, 48, arc), fabric);
    orient(seat);
    seat.scale.z = 0.45; // flatten vertically → a low cushion
    seat.position.y = 0.31;
    g.add(tint(seat, c));
    // Backrest: taller (scale up the vertical tube), set further out.
    const back = new THREE.Mesh(new THREE.TorusGeometry(R + 0.34, 0.2, 12, 48, arc), fabric);
    orient(back);
    back.scale.z = 1.5;
    back.position.y = 0.62;
    g.add(tint(back, c));
    // Base trim ring at the floor — same arc/orientation, so it can't misalign.
    const base = new THREE.Mesh(new THREE.TorusGeometry(R, 0.46, 10, 48, arc), mat(0x4a4f57));
    orient(base);
    base.scale.z = 0.18;
    base.position.y = 0.1;
    g.add(base);
    return g;
  },
  armchair: (c) => {
    const g = new THREE.Group();
    const fabric = mat(FABRIC, { roughness: 0.9 });
    const wood = mat(0x5b3f28, { roughness: 0.45, metalness: 0.05 });
    const seam = mat(0x4a4f57, { roughness: 0.7 });
    // Four tapered wooden legs, splayed slightly outward (mid-century base).
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) {
      const leg = cyl(0.022, 0.038, 0.2, wood, sx * 0.3, 0.1, sz * 0.32, 10);
      leg.rotation.z = sx * 0.08;
      leg.rotation.x = -sz * 0.06;
      g.add(leg);
    }
    // Slim base frame / plinth the cushions rest on.
    g.add(box(0.72, 0.09, 0.76, wood, 0, 0.24, 0));
    // Seat cushion — chamfered (fat box + smaller rounded top layer).
    g.add(tint(box(0.66, 0.13, 0.68, fabric, 0, 0.35, 0.02), c));
    g.add(tint(box(0.6, 0.05, 0.62, fabric, 0, 0.43, 0.02), c));
    g.add(box(0.6, 0.02, 0.02, seam, 0, 0.41, 0.35)); // front welt seam
    // Curved/reclined back: main panel + inner pad + rounded top bolster.
    const back = tint(box(0.66, 0.52, 0.13, fabric, 0, 0.66, -0.33), c);
    back.rotation.x = -0.12;
    g.add(back);
    const pad = tint(box(0.58, 0.44, 0.06, fabric, 0, 0.66, -0.26), c);
    pad.rotation.x = -0.12;
    g.add(pad);
    const bolster = tint(cyl(0.08, 0.08, 0.62, fabric, 0, 0.88, -0.31, 14), c);
    bolster.rotation.z = Math.PI / 2;
    g.add(bolster);
    // Two padded arms — a block + a rounded top roll each.
    for (const sx of [-1, 1]) {
      g.add(tint(box(0.13, 0.26, 0.66, fabric, sx * 0.34, 0.5, 0.02), c));
      const roll = tint(cyl(0.07, 0.07, 0.66, fabric, sx * 0.34, 0.63, 0.02, 14), c);
      roll.rotation.x = Math.PI / 2;
      g.add(roll);
    }
    return g;
  },
  chair: (c) => {
    const g = new THREE.Group();
    const wood = mat(WOOD);
    g.add(tint(box(0.45, 0.05, 0.45, wood, 0, 0.45, 0), c)); // seat
    g.add(tint(box(0.45, 0.45, 0.05, wood, 0, 0.68, -0.2), c)); // back
    const lx = 0.18, lz = 0.18;
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) {
      g.add(box(0.05, 0.45, 0.05, wood, sx * lx, 0.22, sz * lz));
    }
    return g;
  },
  // Chunky rounded tub armchair (Roly-Poly style) — a fat cushion, a wrap-around
  // back/arms, and 4 stubby rounded legs.
  roly_chair: (c) => {
    const g = new THREE.Group();
    const body = mat(0x9aa878, { roughness: 0.95 }); // sage green default
    g.add(tint(cyl(0.26, 0.28, 0.18, body, 0, 0.4, 0, 28), c)); // seat cushion
    const back = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.1, 12, 24, Math.PI * 1.3), body);
    back.castShadow = true;
    back.receiveShadow = true;
    back.position.set(0, 0.55, 0.02);
    back.rotation.x = Math.PI / 2;
    back.rotation.z = -Math.PI * 0.15; // open the ring toward the front
    g.add(tint(back, c));
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) {
      const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.2, 4, 8), body);
      leg.castShadow = true;
      leg.position.set(sx * 0.17, 0.14, sz * 0.17);
      g.add(tint(leg, c));
    }
    return g;
  },
  office_chair: (c) => {
    const g = new THREE.Group();
    const chrome = mat(METAL, { roughness: 0.25, metalness: 0.85 });
    const dark = mat(DARK, { roughness: 0.6 });
    const uph = mat(0x3a3e44, { roughness: 0.85 }); // executive upholstery (tinted)
    const stitch = mat(0x2b2f36, { roughness: 0.9 }); // armrest pads / accents

    // --- 5-star base: chrome hub + 5 radiating spokes, each ending in a caster ---
    g.add(cyl(0.055, 0.07, 0.07, chrome, 0, 0.06, 0, 16)); // central hub
    for (let i = 0; i < 5; i++) {
      const a = (i * Math.PI * 2) / 5;
      const spoke = box(0.055, 0.05, 0.30, chrome, 0, 0.055, 0.16); // extends outward +Z
      spoke.rotation.y = a;
      g.add(spoke);
      const cx = Math.sin(a) * 0.31;
      const cz = Math.cos(a) * 0.31;
      const yoke = box(0.05, 0.06, 0.05, chrome, cx, 0.075, cz); // caster fork
      yoke.rotation.y = a;
      g.add(yoke);
      const wheel = cyl(0.04, 0.04, 0.045, dark, cx, 0.04, cz, 14); // caster wheel
      wheel.rotation.z = Math.PI / 2;
      wheel.rotation.y = a;
      g.add(wheel);
    }

    // --- Chrome gas cylinder (telescoping look) + tilt mechanism ---
    g.add(cyl(0.045, 0.05, 0.20, chrome, 0, 0.19, 0, 14)); // outer shroud
    g.add(cyl(0.028, 0.028, 0.24, chrome, 0, 0.38, 0, 12)); // piston rod
    g.add(box(0.15, 0.07, 0.22, dark, 0, 0.435, 0)); // seat-plate / tilt block

    // --- Contoured seat (top ~0.50m) ---
    g.add(tint(box(0.50, 0.07, 0.48, uph, 0, 0.465, 0), c)); // seat pad
    g.add(tint(box(0.44, 0.04, 0.42, uph, 0, 0.51, 0.01), c)); // rounded top cushion
    g.add(tint(box(0.06, 0.10, 0.44, uph, -0.23, 0.50, 0), c)); // left bolster
    g.add(tint(box(0.06, 0.10, 0.44, uph, 0.23, 0.50, 0), c)); // right bolster
    g.add(tint(box(0.46, 0.06, 0.06, uph, 0, 0.50, 0.23), c)); // front waterfall lip

    // --- Tall padded backrest (slightly reclined) with headrest hint ---
    const back = new THREE.Group();
    back.position.set(0, 0.50, -0.23);
    back.rotation.x = -0.14; // recline: top leans back
    back.add(tint(box(0.46, 0.56, 0.07, uph, 0, 0.31, 0), c)); // main back panel
    back.add(tint(box(0.40, 0.50, 0.04, uph, 0, 0.31, 0.05), c)); // padded front face
    back.add(tint(box(0.10, 0.54, 0.05, uph, -0.20, 0.31, 0.04), c)); // left wing bolster
    back.add(tint(box(0.10, 0.54, 0.05, uph, 0.20, 0.31, 0.04), c)); // right wing bolster
    back.add(tint(box(0.44, 0.16, 0.06, uph, 0, 0.12, 0.06), c)); // lumbar cushion bulge
    back.add(tint(box(0.34, 0.15, 0.06, uph, 0, 0.66, 0.04), c)); // headrest hint
    back.add(cyl(0.02, 0.02, 0.30, chrome, -0.24, 0.10, -0.05, 10)); // left frame post
    back.add(cyl(0.02, 0.02, 0.30, chrome, 0.24, 0.10, -0.05, 10)); // right frame post
    g.add(back);

    // --- Two armrests: chrome posts + padded tops ---
    for (const sx of [-1, 1]) {
      g.add(cyl(0.022, 0.022, 0.20, chrome, sx * 0.29, 0.60, -0.02, 10)); // vertical post
      g.add(box(0.055, 0.05, 0.06, chrome, sx * 0.29, 0.71, 0.06)); // elbow bracket
      g.add(box(0.075, 0.05, 0.26, stitch, sx * 0.29, 0.73, 0.03)); // padded armrest top
    }

    return g;
  },
  bar_stool: (c) => {
    const g = new THREE.Group();
    g.add(tint(cyl(0.18, 0.18, 0.05, mat(WOOD), 0, 0.66, 0), c));
    g.add(cyl(0.03, 0.03, 0.66, mat(METAL), 0, 0.33, 0));
    g.add(cyl(0.2, 0.2, 0.02, mat(METAL), 0, 0.02, 0));
    return g;
  },
  // ---- Living / common ----
  recliner: (c) => {
    const g = new THREE.Group();
    const f = mat(FABRIC);
    g.add(tint(box(0.9, 0.4, 0.95, f, 0, 0.25, 0), c));
    g.add(tint(box(0.9, 0.7, 0.18, f, 0, 0.6, -0.38), c));
    g.add(tint(box(0.18, 0.35, 0.95, f, -0.45, 0.45, 0), c));
    g.add(tint(box(0.18, 0.35, 0.95, f, 0.45, 0.45, 0), c));
    g.add(box(0.78, 0.16, 0.36, f, 0, 0.22, 0.62)); // footrest
    return g;
  },
  ottoman: (c) => {
    const g = new THREE.Group();
    const fabric = mat(FABRIC, { roughness: 0.9 });
    const wood = mat(0x5b3f28, { roughness: 0.45, metalness: 0.05 });
    const pipe = mat(0x4a4f57, { roughness: 0.7 }); // contrast piping/trim
    // Small tapered feet.
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const)
      g.add(cyl(0.02, 0.03, 0.09, wood, sx * 0.24, 0.045, sz * 0.24, 8));
    // Upholstered body.
    g.add(tint(box(0.56, 0.22, 0.56, fabric, 0, 0.2, 0), c));
    // Piped rim around the top edge.
    g.add(box(0.6, 0.03, 0.6, pipe, 0, 0.31, 0));
    // Top cushion — chamfered (box + smaller rounded top).
    g.add(tint(box(0.54, 0.1, 0.54, fabric, 0, 0.35, 0), c));
    g.add(tint(box(0.48, 0.04, 0.48, fabric, 0, 0.4, 0), c));
    // Center button tuft.
    g.add(cyl(0.02, 0.02, 0.025, pipe, 0, 0.41, 0, 8));
    return g;
  },
  bench: (c) => {
    const g = new THREE.Group();
    const w = mat(WOOD);
    g.add(tint(box(1.1, 0.1, 0.4, mat(FABRIC), 0, 0.45, 0), c));
    for (const sx of [-1, 1]) g.add(box(0.06, 0.45, 0.36, w, sx * 0.5, 0.225, 0));
    return g;
  },
  conference_chair: (c) => {
  const g = new THREE.Group();
  const fab = mat(0x454b54, { roughness: 0.85 }); // upholstery
  const frame = mat(METAL, { roughness: 0.4, metalness: 0.5 });
  const dark = mat(DARK, { roughness: 0.6 });
  // Seat — chamfered slab: pan + slightly smaller cushion stacked on top
  g.add(box(0.48, 0.06, 0.46, dark, 0, 0.42, 0)); // seat pan/frame
  g.add(tint(box(0.44, 0.06, 0.42, fab, 0, 0.47, 0), c)); // seat cushion
  // Gas post + hub
  g.add(cyl(0.028, 0.03, 0.30, frame, 0, 0.24, 0, 12)); // post
  g.add(cyl(0.055, 0.06, 0.05, dark, 0, 0.08, 0, 12)); // hub
  // 4-star base with foot glides
  for (let i = 0; i < 4; i++) {
    const a = i * Math.PI / 2 + Math.PI / 4;
    const arm = box(0.26, 0.035, 0.06, frame, Math.cos(a) * 0.12, 0.055, Math.sin(a) * 0.12);
    arm.rotation.y = -a;
    g.add(arm);
    g.add(cyl(0.03, 0.035, 0.04, dark, Math.cos(a) * 0.23, 0.025, Math.sin(a) * 0.23, 10)); // glide
  }
  // Back — support riser + mid-back panel + cushion (slight recline)
  g.add(box(0.07, 0.30, 0.05, dark, 0, 0.56, -0.19)); // riser
  const back = box(0.46, 0.42, 0.06, dark, 0, 0.74, -0.21);
  back.rotation.x = -0.10;
  g.add(back);
  const backPad = box(0.42, 0.38, 0.05, fab, 0, 0.74, -0.18);
  backPad.rotation.x = -0.10;
  g.add(tint(backPad, c));
  // Thin arms — L-shaped (vertical support + horizontal top)
  for (const sx of [-1, 1]) {
    g.add(box(0.04, 0.20, 0.04, frame, sx * 0.25, 0.57, 0.02)); // upright
    g.add(box(0.05, 0.03, 0.26, dark, sx * 0.25, 0.66, 0.0)); // armrest top
  }
  return g;
},
  tub_chair: (c) => {
  const g = new THREE.Group();
  const fab = mat(0xa89a86, { roughness: 0.9 }); // taupe upholstery
  const wood = mat(WOOD, { roughness: 0.5 });
  // Upholstered base skirt + round seat cushion (chamfered top)
  g.add(tint(cyl(0.26, 0.28, 0.16, fab, 0, 0.28, 0, 28), c)); // skirt / base
  g.add(tint(cyl(0.25, 0.26, 0.13, fab, 0, 0.44, 0, 28), c)); // seat cushion
  g.add(cyl(0.21, 0.22, 0.05, mat(0x8f8271, { roughness: 0.9 }), 0, 0.51, 0, 24)); // cushion top inset
  // Wrap-around barrel back — partial torus, open toward the front (+Z)
  const barrel = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.12, 12, 30, Math.PI * 1.4), fab);
  barrel.castShadow = true;
  barrel.receiveShadow = true;
  barrel.position.set(0, 0.53, 0.0);
  barrel.rotation.x = Math.PI / 2;
  barrel.rotation.z = -Math.PI * 0.20; // open the wrap toward the front
  g.add(tint(barrel, c));
  // Slim piping trim along the top rim (two-tone accent)
  const trim = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.025, 8, 30, Math.PI * 1.4), wood);
  trim.castShadow = true;
  trim.position.set(0, 0.64, 0.0);
  trim.rotation.x = Math.PI / 2;
  trim.rotation.z = -Math.PI * 0.20;
  g.add(trim);
  // Four short splayed wooden legs
  for (let i = 0; i < 4; i++) {
    const a = i * Math.PI / 2 + Math.PI / 4;
    const leg = cyl(0.02, 0.032, 0.20, wood, Math.cos(a) * 0.20, 0.10, Math.sin(a) * 0.20, 10);
    leg.rotation.z = Math.cos(a) * 0.12;
    leg.rotation.x = -Math.sin(a) * 0.12; // slight outward splay
    g.add(leg);
  }
  return g;
},
  // Generic fallback marker so an unknown model key still renders something.
  sofa_l: (c) => {
    const g = new THREE.Group();
    const frameC = c.clone().multiplyScalar(0.62);          // two-tone: darker frame
    const seatMat = () => mat(FABRIC, { roughness: 0.9 });
    const frameMat = () => mat(FABRIC, { roughness: 0.97 });
    const legMat = mat(0x3b2f26, { roughness: 0.5, metalness: 0.2 });

    // feet at the L's outer corners + mid supports
    for (const [fx, fz] of [[-1.15, -1.05], [1.15, -1.05], [1.15, 1.05], [0.5, 1.05], [-1.15, -0.4], [0.5, -0.4]])
      g.add(cyl(0.035, 0.05, 0.1, legMat, fx, 0.05, fz, 10));

    // L-shaped base: rear bar + forward chaise column, each with a chamfer deck
    g.add(tint(box(2.6, 0.24, 0.95, frameMat(), 0, 0.22, -0.725), frameC));   // rear bar
    g.add(tint(box(0.95, 0.24, 1.45, frameMat(), 0.825, 0.22, 0.475), frameC)); // chaise column
    g.add(tint(box(2.5, 0.06, 0.88, frameMat(), 0, 0.35, -0.725), frameC));
    g.add(tint(box(0.88, 0.06, 1.4, frameMat(), 0.825, 0.35, 0.475), frameC));

    // right outer arm (full depth) + roll
    g.add(tint(box(0.2, 0.52, 2.4, seatMat(), 1.2, 0.36, 0), c));
    const rr = cyl(0.1, 0.1, 2.4, seatMat(), 1.2, 0.62, 0, 14);
    rr.rotation.x = Math.PI / 2;
    g.add(tint(rr, c));
    // left arm (rear bar only) + roll
    g.add(tint(box(0.2, 0.52, 0.95, seatMat(), -1.2, 0.36, -0.725), c));
    const lr = cyl(0.1, 0.1, 0.95, seatMat(), -1.2, 0.62, -0.725, 14);
    lr.rotation.x = Math.PI / 2;
    g.add(tint(lr, c));

    // rear back frame board
    g.add(tint(box(2.2, 0.5, 0.12, frameMat(), 0, 0.62, -1.09), frameC));

    // seat cushions: 2 main run + 2 chaise (slab + inset cap)
    for (const [sx, sz, sw, sd] of [[-0.75, -0.65, 0.7, 0.62], [-0.02, -0.65, 0.7, 0.62], [0.82, -0.55, 0.86, 0.7], [0.82, 0.45, 0.86, 1.1]]) {
      g.add(tint(box(sw, 0.16, sd, seatMat(), sx, 0.42, sz), c));
      g.add(tint(box(sw - 0.06, 0.06, sd - 0.06, seatMat(), sx, 0.52, sz), c));
    }

    // 3 back cushions along the rear, slightly reclined
    for (const sx of [-0.75, -0.02, 0.72]) {
      const b = box(0.7, 0.42, 0.16, seatMat(), sx, 0.66, -1.0);
      b.rotation.x = -0.14;
      g.add(tint(b, c));
    }

    // 3 accent throw pillows (diamond-tilted)
    for (const [px, pz, rot] of [[-0.7, -0.75, 0.5], [0.1, -0.75, -0.4], [0.85, -0.1, 0.3]]) {
      const p = box(0.36, 0.36, 0.12, seatMat(), px, 0.62, pz);
      p.rotation.z = rot;
      p.rotation.x = -0.18;
      g.add(tint(p, frameC));
    }
    return g;
  },
  sofa_u: (c) => {
  // Premium U-shaped modular lounge, ~3.0m wide x 2.6m deep, opening toward +Z.
  // A continuous plinth carries three seating runs (back + two sides); upholstered
  // backrests wrap the inner perimeter, plush arms cap the two open front ends,
  // and layered seat cushions + leaning back cushions + accent throw pillows give
  // the generous, one-piece sectional read. Seats seven (3 back + 2 + 2 sides).
  const g = new THREE.Group();
  const fabric = mat(FABRIC, { roughness: 0.9 });                  // main upholstery (tinted)
  const frame = mat(0x4d5560, { roughness: 0.85 });                // darker plinth (two-tone)
  const foot = mat(0x2e2823, { roughness: 0.5, metalness: 0.25 }); // low dark feet
  const accent = mat(0xc9b48f, { roughness: 0.95 });              // accent throw pillows

  const W = 3.0, D = 2.6, run = 0.85;
  const hW = W / 2, hD = D / 2;
  const baseH = 0.24, baseY = 0.18, seatTop = 0.30;

  // --- low feet (bottoms at y~0; the plinth rests just above) ---
  const feet: number[][] = [[-1.30, -1.15], [1.30, -1.15], [-1.30, 1.15], [1.30, 1.15], [0, -1.15], [0, 0.9]];
  for (const [fx, fz] of feet) g.add(cyl(0.05, 0.065, 0.09, foot, fx, 0.045, fz, 10));

  // --- continuous U plinth: back run + two full-depth side runs (solid corners) ---
  g.add(box(W, baseH, run, frame, 0, baseY, -(hD - run / 2)));     // back run
  g.add(box(run, baseH, D, frame, -(hW - run / 2), baseY, 0));     // left run
  g.add(box(run, baseH, D, frame, (hW - run / 2), baseY, 0));      // right run

  // --- upholstered backrest blocks wrapping the three inner sides ---
  g.add(tint(box(2.60, 0.50, 0.20, fabric, 0, 0.55, -1.15), c));       // back
  g.add(tint(box(0.20, 0.50, 2.30, fabric, -1.40, 0.55, -0.10), c));   // left
  g.add(tint(box(0.20, 0.50, 2.30, fabric, 1.40, 0.55, -0.10), c));    // right

  // --- plush arms capping the two open front ends (slab + chamfer cap) ---
  for (const sx of [-1, 1]) {
    const ax = sx * (hW - run / 2);
    g.add(tint(box(run, 0.30, 0.30, fabric, ax, 0.45, hD - 0.15), c));
    g.add(tint(box(run - 0.06, 0.05, 0.26, fabric, ax, 0.625, hD - 0.15), c)); // rounded top
  }

  // --- seat cushions (soft slab + thin chamfer cap) across all three runs ---
  const seat = (x: number, z: number, w: number, d: number) => {
    g.add(tint(box(w, 0.12, d, fabric, x, seatTop + 0.06, z), c));
    g.add(tint(box(w - 0.06, 0.035, d - 0.06, fabric, x, seatTop + 0.14, z), c));
  };
  for (const bx of [-0.72, 0, 0.72]) seat(bx, -0.72, 0.68, 0.62);        // back run (3)
  for (const sx of [-1, 1]) {                                            // sides (2 + 2)
    seat(sx * 0.925, -0.01, 0.72, 0.66);
    seat(sx * 0.925, 0.66, 0.72, 0.66);
  }

  // --- leaning back cushions on all three runs ---
  const backCush = (x: number, z: number, w: number, d: number) =>
    g.add(tint(box(w, 0.40, d, fabric, x, 0.60, z), c));
  for (const bx of [-0.80, 0, 0.80]) backCush(bx, -1.00, 0.74, 0.16);   // back (3)
  for (const sx of [-1, 1]) {                                           // sides (2 + 2)
    backCush(sx * 1.26, -0.45, 0.16, 0.74);
    backCush(sx * 1.26, 0.40, 0.16, 0.74);
  }

  // --- accent throw pillows tucked into corners (rotated for a casual look) ---
  const pillow = (x: number, z: number, ry: number) => {
    const p = box(0.38, 0.36, 0.12, accent, x, 0.60, z);
    p.rotation.y = ry;
    g.add(p);
  };
  pillow(-0.95, -0.90, Math.PI * 0.18);
  pillow(0.95, -0.90, -Math.PI * 0.18);
  pillow(-1.12, 0.55, Math.PI * 0.5 - 0.3);
  pillow(1.05, -0.10, -Math.PI * 0.5 + 0.3);

  return g;
},
} satisfies Record<string, FurnitureBuilder>;
