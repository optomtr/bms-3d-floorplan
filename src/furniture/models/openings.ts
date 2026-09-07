// ---------------------------------------------------------------------------
// Двери и остекление — модели библиотеки мебели.
//
// Каждая модель возвращает THREE.Group с началом координат в центре пятна
// на полу (y = 0). Порядок ключей в палитре задаёт MODEL_ORDER в ./index.ts,
// а не порядок записей в этом файле.
// ---------------------------------------------------------------------------

import * as THREE from 'three';
import { mat, box, cyl, tint, defineModel, WOOD, METAL, WHITE, GLASS, type FurnitureBuilder } from '../primitives';

/** Карниз над проёмом: круглая штанга чуть длиннее самого проёма. */
function curtainRod(g: THREE.Group, W: number, H: number, off: number, r: number, over: number): void {
  const rod = cyl(r, r, W + over, mat(METAL), 0, H + 0.02, off, 8);
  rod.rotation.z = Math.PI / 2;
  g.add(rod);
}

/**
 * Полотнище шторы, собранное в складки, на петле с именем 'curtainPivot':
 * привязанная штора (cover) раздвигается именно поворотом этой группы.
 * `sign` — в какую сторону от петли уходят складки. Один сборщик на все пять
 * штор: две створки, одинарная, короткая и обе тюлевые.
 */
function pleatedPanel(
  c: THREE.Color,
  o: {
    x: number;
    sign: number;
    span: number;
    n: number;
    H: number;
    off: number;
    thick: number;
    wave: (i: number) => number;
    fabric: THREE.Material;
  },
): THREE.Group {
  const pivot = new THREE.Group();
  pivot.name = 'curtainPivot';
  pivot.position.x = o.x;
  const seg = o.span / o.n;
  for (let i = 0; i < o.n; i++)
    pivot.add(tint(box(seg * 0.96, o.H, o.thick, o.fabric, o.sign * (i + 0.5) * seg, o.H / 2, o.off + o.wave(i)), c));
  return pivot;
}

export const openingModels = {
  door: defineModel((g, c) => {
    const jamb = mat(WHITE);
    // Frame (jambs + header) so it reads as a real door, then the leaf + panels.
    g.add(box(0.06, 2.06, 0.16, jamb, -0.46, 1.03, 0));
    g.add(box(0.06, 2.06, 0.16, jamb, 0.46, 1.03, 0));
    g.add(box(0.98, 0.06, 0.16, jamb, 0, 2.06, 0));
    const leaf = tint(box(0.84, 2.0, 0.06, mat(WOOD), 0, 1.0, 0), c);
    g.add(leaf);
    g.add(cyl(0.03, 0.03, 0.12, mat(0xb8932e), 0.33, 1.0, 0.06)); // brass handle
  }),
  window_frame: defineModel((g, c) => {
    const frame = mat(0x55606a); // dark frame so the window is clearly visible
    const W = 1.2, H = 1.2, yc = 1.45, fw = 0.07, d = 0.1;
    g.add(tint(box(W, fw, d, frame, 0, yc + H / 2, 0), c)); // top
    g.add(tint(box(W, fw, d, frame, 0, yc - H / 2, 0), c)); // bottom (sill)
    g.add(box(fw, H, d, frame, -W / 2 + fw / 2, yc, 0)); // left
    g.add(box(fw, H, d, frame, W / 2 - fw / 2, yc, 0)); // right
    g.add(box(0.05, H, d * 0.6, frame, 0, yc, 0)); // vertical mullion
    g.add(box(W, 0.05, d * 0.6, frame, 0, yc, 0)); // horizontal mullion
    g.add(box(W - fw, H - fw, 0.02, mat(0x9cc7da, { transparent: true, opacity: 0.5, metalness: 0.2 }), 0, yc, 0));
  }),
  curtain: defineModel((g, c) => {
    // Pleated fabric, slightly off the wall, in two pivot panels named
    // "curtainPivot" so a bound cover entity can slide them open/closed.
    const W = 1.8, H = 2.2, OFF = 0.03;
    const fabric = mat(0x9a8b76, { roughness: 1 });
    curtainRod(g, W, H, OFF, 0.022, 0.2);
    const wave = (i: number) => (i % 2 === 0 ? 0.035 : -0.025);
    // Hinge at each outer edge; pleats run inward.
    for (const sign of [-1, 1])
      g.add(pleatedPanel(c, { x: (sign * W) / 2, sign: -sign, span: W / 2, n: 9, H, off: OFF, thick: 0.05, wave, fabric }));
  }),
  // Half curtain: ONE panel that slides to a single side (not centre-split).
  curtain_single: defineModel((g, c) => {
    const W = 1.6, H = 2.2, OFF = 0.03;
    const fabric = mat(0x9a8b76, { roughness: 1 });
    curtainRod(g, W, H, OFF, 0.022, 0.2);
    // Hinge at the left edge → gathers to the left.
    g.add(pleatedPanel(c, { x: -W / 2, sign: 1, span: W, n: 14, H, off: OFF, thick: 0.05, fabric,
      wave: (i) => (i % 2 === 0 ? 0.035 : -0.025) }));
  }),
  // Short curtain for a transom / clerestory band — the same gathering
  // curtainPivot as the full-height ones, but only ~0.62 m deep, so it dresses a
  // window strip near the ceiling instead of a floor-length opening.
  curtain_short: defineModel((g, c) => {
    const W = 2.3, H = 0.62, OFF = 0.03;
    const fabric = mat(0x9a8b76, { roughness: 1 });
    curtainRod(g, W, H, OFF, 0.02, 0.18);
    g.add(pleatedPanel(c, { x: -W / 2, sign: 1, span: W, n: 16, H, off: OFF, thick: 0.045, fabric,
      wave: (i) => (i % 2 === 0 ? 0.03 : -0.022) }));
  }),
  curtain_sheer: defineModel((g, c) => {
    const W = 1.8, H = 2.2, OFF = 0.03;
    const sheer = mat(0xf2efe9, { transparent: true, opacity: 0.5, roughness: 1 });
    curtainRod(g, W, H, OFF, 0.02, 0.2);
    const wave = (i: number) => (i % 2 ? 0.02 : -0.02);
    for (const sign of [-1, 1])
      g.add(pleatedPanel(c, { x: (sign * W) / 2, sign: -sign, span: W / 2, n: 8, H, off: OFF, thick: 0.03, wave, fabric: sheer }));
  }),
  // Half sheer: ONE tulle panel that slides to a single side (not centre-split),
  // the sheer twin of curtain_single.
  curtain_sheer_single: defineModel((g, c) => {
    const W = 1.6, H = 2.2, OFF = 0.03;
    const sheer = mat(0xf2efe9, { transparent: true, opacity: 0.5, roughness: 1 });
    curtainRod(g, W, H, OFF, 0.02, 0.2);
    g.add(pleatedPanel(c, { x: -W / 2, sign: 1, span: W, n: 12, H, off: OFF, thick: 0.03, fabric: sheer,
      wave: (i) => (i % 2 ? 0.02 : -0.02) }));
  }),
  roller_blind: defineModel((g, c) => {
    // Window roller blind: a roll at top + a panel that "rolls up" (scale.y) via
    // the curtainPivot hook (anchored at the top).
    const W = 1.4, H = 1.9, OFF = 0.02;
    const roll = cyl(0.05, 0.05, W, mat(0xd8d2c4), 0, H, OFF, 10);
    roll.rotation.z = Math.PI / 2;
    g.add(roll);
    const pivot = new THREE.Group();
    pivot.name = 'curtainPivot';
    pivot.add(tint(box(W, H, 0.02, mat(0xbfae93, { roughness: 1 }), 0, H / 2, OFF), c));
    g.add(pivot);
  }),
  roman_blind: defineModel((g, c) => {
    const W = 1.4, H = 1.9, OFF = 0.02;
    const fabric = mat(0x8a7f6c, { roughness: 1 });
    const rod = cyl(0.04, 0.04, W, mat(METAL), 0, H + 0.02, OFF, 8);
    rod.rotation.z = Math.PI / 2;
    g.add(rod);
    const pivot = new THREE.Group();
    pivot.name = 'curtainPivot';
    for (let i = 0; i < 5; i++) {
      pivot.add(tint(box(W, 0.36, 0.04 + (i % 2 ? 0.02 : 0), fabric, 0, 0.2 + i * 0.36, OFF), c)); // folds
    }
    g.add(pivot);
  }),
  // Bottom-up venetian blind (jalyuzi) — opens from the BOTTOM upward: the slats
  // retract up into the fixed top headrail. Uses the vertical cover hook
  // 'blindPivotV' (the binding scales it in Y, anchored at the top).
  blind_bottomup: defineModel((g, c) => {
    const W = 1.6, H = 2.0, OFF = 0.03;
    g.add(box(W + 0.06, 0.07, 0.08, mat(METAL), 0, H + 0.02, OFF)); // fixed headrail
    const pivot = new THREE.Group();
    pivot.name = 'blindPivotV'; // origin at the TOP; slats hang DOWN (negative y)
    pivot.position.set(0, H, OFF);
    const slat = mat(0xcbb79c, { roughness: 0.9 });
    const n = 18, gap = H / n;
    for (let i = 1; i <= n; i++) {
      const s = tint(box(W, 0.02, 0.035, slat, 0, -i * gap + gap * 0.4, 0), c);
      s.rotation.x = 0.32; // tilt → reads as venetian louvres
      pivot.add(s);
    }
    pivot.add(box(W + 0.02, 0.045, 0.05, mat(0x9a8b73), 0, -H, 0)); // bottom rail
    for (const sx of [-1, 1]) // lift cords
      pivot.add(box(0.006, H, 0.006, mat(0xcfc8ba), sx * W * 0.3, -H / 2, 0.012));
    g.add(pivot);
  }),
  // Pyramidal glass roof lantern (световой фонарь / фонарь-крыша) that sits on TOP
  // of a room, like the reference photo: a rectangular kerb rising through hip-
  // sloped blue glazing to a short ridge, dark aluminium bars along every edge and
  // hip, a central ridge box, and TWO opening vents on the middle of the long
  // faces. Each vent is a top-hinged 'ventPivot' group — bind a `cover` and both
  // tilt outward as it opens (see bindings.ts). Place it at ceiling height
  // (defaultY = wallHeight). 2.6 x 1.8 x ~0.95 m.
  roof_lantern: defineModel((g, c) => {
    const W = 2.6, Dep = 1.8, Hh = 0.78, Rl = 1.0;
    const hw = W / 2, hd = Dep / 2;
    const frame = mat(0x3a3f45, { metalness: 0.6, roughness: 0.4 });
    const glass = mat(0x9fc4e6, { transparent: true, opacity: 0.3, roughness: 0.12, metalness: 0.25, side: THREE.DoubleSide });
    const kerb = mat(0xdfe3da, { roughness: 0.7 });

    const C0: [number, number, number] = [-hw, 0, -hd];
    const C1: [number, number, number] = [hw, 0, -hd];
    const C2: [number, number, number] = [hw, 0, hd];
    const C3: [number, number, number] = [-hw, 0, hd];
    const R0: [number, number, number] = [-Rl / 2, Hh, 0];
    const R1: [number, number, number] = [Rl / 2, Hh, 0];

    // Kerb ring (the painted upstand the lantern sits on), just below y=0.
    const kh = 0.16;
    g.add(tint(box(W, kh, 0.06, kerb, 0, -kh / 2, -hd), c));
    g.add(tint(box(W, kh, 0.06, kerb, 0, -kh / 2, hd), c));
    g.add(tint(box(0.06, kh, Dep, kerb, -hw, -kh / 2, 0), c));
    g.add(tint(box(0.06, kh, Dep, kerb, hw, -kh / 2, 0), c));

    // Sloped glass faces (2 trapezoids + 2 hip triangles). DoubleSide → winding-agnostic.
    const poly = (...pts: [number, number, number][]) => {
      const idx = pts.length === 4 ? [0, 1, 2, 0, 2, 3] : [0, 1, 2];
      const arr: number[] = [];
      for (const i of idx) arr.push(...pts[i]);
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(arr), 3));
      geo.computeVertexNormals();
      const m = new THREE.Mesh(geo, glass);
      m.castShadow = false;
      return m;
    };
    g.add(poly(C0, C1, R1, R0)); // front
    g.add(poly(C2, C3, R0, R1)); // back
    g.add(poly(C3, C0, R0));     // left hip
    g.add(poly(C1, C2, R1));     // right hip

    // Dark aluminium bars: eaves, ridge, hips.
    const bar = (p0: [number, number, number], p1: [number, number, number], r = 0.02) => {
      const a = new THREE.Vector3(...p0), b = new THREE.Vector3(...p1);
      const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, a.distanceTo(b), 6), frame);
      m.castShadow = false;
      m.position.copy(a).add(b).multiplyScalar(0.5);
      m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
      return m;
    };
    g.add(bar(C0, C1)); g.add(bar(C1, C2)); g.add(bar(C2, C3)); g.add(bar(C3, C0)); // eaves
    g.add(bar(R0, R1, 0.025));                                                       // ridge
    g.add(bar(C0, R0)); g.add(bar(C3, R0)); g.add(bar(C1, R1)); g.add(bar(C2, R1));  // hips
    g.add(box(0.16, 0.34, 0.16, mat(0x2b2f33, { metalness: 0.4, roughness: 0.5 }), 0, Hh - 0.1, 0)); // ridge box

    // Two opening vents on the middle of the long faces. Each: a mount oriented to
    // lie IN the slope, holding a top-hinged 'ventPivot' the animation swings out.
    const makeVent = (front: boolean) => {
      const s = front ? -1 : 1;                       // z-sign of this face's eave
      const zAt = (y: number) => s * hd * (1 - y / Hh);
      const yTop = 0.6, yBot = 0.22;
      const top = new THREE.Vector3(0, yTop, zAt(yTop));
      const bot = new THREE.Vector3(0, yBot, zAt(yBot));
      const ex = new THREE.Vector3(front ? 1 : -1, 0, 0);
      const eyp = bot.clone().sub(top).normalize();               // down the slope
      const ezp = new THREE.Vector3().crossVectors(ex, eyp).normalize(); // outward normal
      const mount = new THREE.Group();
      mount.position.copy(top).addScaledVector(ezp, 0.02);        // sit just proud of the fixed glass
      mount.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(ex, eyp, ezp));
      const pivot = new THREE.Group();
      pivot.name = 'ventPivot';
      const vlen = top.distanceTo(bot), vw = 0.86, th = 0.03;
      const vg = mat(0x9fc4e6, { transparent: true, opacity: 0.42, roughness: 0.12, metalness: 0.25, side: THREE.DoubleSide });
      const pane = box(vw, vlen, th, vg, 0, vlen / 2, 0); pane.castShadow = false;
      pivot.add(pane);
      pivot.add(box(vw, 0.03, th + 0.01, frame, 0, 0.015, 0));            // top rail (hinge)
      pivot.add(box(vw, 0.03, th + 0.01, frame, 0, vlen - 0.015, 0));     // bottom rail
      pivot.add(box(0.03, vlen, th + 0.01, frame, -vw / 2 + 0.015, vlen / 2, 0));
      pivot.add(box(0.03, vlen, th + 0.01, frame, vw / 2 - 0.015, vlen / 2, 0));
      mount.add(pivot);
      return mount;
    };
    g.add(makeVent(true));
    g.add(makeVent(false));
  }),
  double_door: defineModel((g, c) => {
    g.add(tint(box(0.7, 2.0, 0.05, mat(WOOD), -0.36, 1.0, 0), c));
    g.add(tint(box(0.7, 2.0, 0.05, mat(WOOD), 0.36, 1.0, 0), c));
    g.add(cyl(0.025, 0.025, 0.1, mat(METAL), -0.05, 1.0, 0.05));
    g.add(cyl(0.025, 0.025, 0.1, mat(METAL), 0.05, 1.0, 0.05));
  }),
  // Cottage sectional garage door — opens UPWARD (the panelled door lifts into the
  // headbox). Reuses the vertical cover hook 'blindPivotV' so a bound `cover`
  // entity raises/lowers it; closed = down, open = retracted to the top.
  garage_door: defineModel((g, c) => {
    const W = 2.6, H = 2.2, OFF = 0.05;
    const frameMat = mat(0xe6e4de, { roughness: 0.7 });
    g.add(box(0.12, H + 0.14, 0.16, frameMat, -(W / 2 + 0.06), (H + 0.14) / 2, OFF)); // left jamb
    g.add(box(0.12, H + 0.14, 0.16, frameMat, W / 2 + 0.06, (H + 0.14) / 2, OFF)); // right jamb
    g.add(box(W + 0.24, 0.18, 0.18, frameMat, 0, H + 0.09, OFF)); // headbox / lintel
    const pivot = new THREE.Group();
    pivot.name = 'blindPivotV'; // origin at the TOP; panels hang DOWN → lift up to open
    pivot.position.set(0, H, OFF);
    const panelMat = mat(0xf2f0ea, { roughness: 0.6 });
    const recess = mat(0xdad7ce, { roughness: 0.7 });
    const rows = 5, ph = H / rows;
    for (let i = 1; i <= rows; i++) {
      const yc = -(i - 0.5) * ph;
      pivot.add(tint(box(W, ph - 0.02, 0.06, panelMat, 0, yc, 0.02), c)); // section slab
      for (const px of [-W / 3, 0, W / 3]) // three raised-panel recesses per row
        pivot.add(box(W / 3 - 0.16, ph - 0.14, 0.02, recess, px, yc, 0.06));
    }
    pivot.add(box(0.28, 0.05, 0.05, mat(METAL), 0, -H + 0.55, 0.07)); // handle
    g.add(pivot);
  }),
  sliding_door: defineModel((g, c) => {
    g.add(box(1.6, 0.06, 0.08, mat(METAL), 0, 2.05, 0)); // rail
    g.add(tint(box(0.78, 1.95, 0.04, mat(GLASS, { transparent: true, opacity: 0.4 }), -0.4, 1.0, 0), c));
    g.add(tint(box(0.78, 1.95, 0.04, mat(GLASS, { transparent: true, opacity: 0.4 }), 0.4, 1.0, 0.05), c));
  }),
  patio_door: defineModel((g, c) => {
    // Wide floor-to-ceiling terrace door / glass wall (built from the floor up).
    const fr = mat(0x55606a);
    const W = 2.6, H = 2.2, fw = 0.08, d = 0.1;
    g.add(tint(box(W, fw, d, fr, 0, H - fw / 2, 0), c));
    g.add(box(W, fw, d, fr, 0, fw / 2, 0));
    g.add(box(fw, H, d, fr, -W / 2 + fw / 2, H / 2, 0));
    g.add(box(fw, H, d, fr, W / 2 - fw / 2, H / 2, 0));
    g.add(box(0.06, H, d * 0.6, fr, -W / 6, H / 2, 0)); // mullions → 3 panes
    g.add(box(0.06, H, d * 0.6, fr, W / 6, H / 2, 0));
    g.add(box(W - fw, H - fw, 0.02, mat(0x9cc7da, { transparent: true, opacity: 0.42, metalness: 0.2 }), 0, H / 2, 0));
  }),
  terrace_window: defineModel((g, c) => {
    // Wide panoramic window, centered at local y=0 (placed at defaultY).
    const fr = mat(0x55606a);
    const W = 2.6, H = 1.5, fw = 0.07, d = 0.1;
    g.add(tint(box(W, fw, d, fr, 0, H / 2, 0), c));
    g.add(box(W, fw, d, fr, 0, -H / 2, 0));
    g.add(box(fw, H, d, fr, -W / 2 + fw / 2, 0, 0));
    g.add(box(fw, H, d, fr, W / 2 - fw / 2, 0, 0));
    g.add(box(0.05, H, d * 0.6, fr, -W / 4, 0, 0)); // mullions → 3 panes
    g.add(box(0.05, H, d * 0.6, fr, W / 4, 0, 0));
    g.add(box(W - fw, H - fw, 0.02, mat(0x9cc7da, { transparent: true, opacity: 0.45 }), 0, 0, 0));
  }),
  // Floor-to-ceiling terrace WINDOW (mullioned, no door) — a black-framed
  // panoramic window. Placed like the other glazing (cuts a real opening).
  // Small openable transom window (форточка) — the band of top-hinged sashes that
  // runs along the TOP of a terrace wall, just under the ceiling, above the solid
  // parapet. Bind ONE `cover` and all three sashes tilt outward together.
  //
  // The sash mounts are turned 180° about z, so inside them +y is world-DOWN
  // while +z is still the outward normal. That is the same local frame the roof
  // lantern's vents sit in, which lets the shared ventPivot animation swing the
  // bottom edge out with no special case. Wall-mounted, centred on its origin
  // like terrace_window. 2.2 x 0.44 m.
  transom_window: defineModel((g, c) => {
    const W = 2.2, H = 0.44, fw = 0.05, d = 0.09;
    const fr = mat(0x2c3138, { roughness: 0.5, metalness: 0.3 });
    const glass = mat(0x9fc4e6, { transparent: true, opacity: 0.32, roughness: 0.12, metalness: 0.25, side: THREE.DoubleSide });
    g.add(tint(box(W, fw, d, fr, 0, H / 2 - fw / 2, 0), c)); // head
    g.add(box(W, fw, d, fr, 0, -H / 2 + fw / 2, 0)); // sill
    g.add(box(fw, H, d, fr, -W / 2 + fw / 2, 0, 0));
    g.add(box(fw, H, d, fr, W / 2 - fw / 2, 0, 0));
    const ih = H - 2 * fw; // clear opening height
    // Fixed pane behind the sashes, so an open window is never a hole.
    g.add(box(W - 2 * fw, ih, 0.014, glass, 0, 0, 0));
    const n = 3, span = (W - 2 * fw) / n;
    for (let i = 1; i < n; i++) g.add(box(0.035, ih, d * 0.7, fr, -W / 2 + fw + i * span, 0, 0));
    for (let i = 0; i < n; i++) {
      const mount = new THREE.Group();
      mount.position.set(-W / 2 + fw + (i + 0.5) * span, ih / 2, d / 2 - 0.01);
      mount.rotation.z = Math.PI;
      const pivot = new THREE.Group();
      pivot.name = 'ventPivot';
      const sw = span - 0.05, th = 0.024;
      pivot.add(box(sw, ih, th, glass, 0, ih / 2, 0));
      pivot.add(box(sw, 0.026, th + 0.008, fr, 0, 0.013, 0)); // hinge rail
      pivot.add(box(sw, 0.026, th + 0.008, fr, 0, ih - 0.013, 0));
      pivot.add(box(0.026, ih, th + 0.008, fr, -sw / 2 + 0.013, ih / 2, 0));
      pivot.add(box(0.026, ih, th + 0.008, fr, sw / 2 - 0.013, ih / 2, 0));
      mount.add(pivot);
      g.add(mount);
    }
  }),
  terrace_window_full: defineModel((g, c) => {
    const fr = mat(0x2c3138, { roughness: 0.5 });
    const W = 2.6, H = 2.55, fw = 0.08, d = 0.1;
    g.add(tint(box(W, fw, d, fr, 0, H - fw / 2, 0), c)); // top
    g.add(box(W, fw, d, fr, 0, fw / 2, 0)); // bottom sill
    g.add(box(fw, H, d, fr, -W / 2 + fw / 2, H / 2, 0)); // left
    g.add(box(fw, H, d, fr, W / 2 - fw / 2, H / 2, 0)); // right
    for (let i = 1; i < 3; i++) g.add(box(0.05, H, d * 0.6, fr, -W / 2 + (W * i) / 3, H / 2, 0)); // vertical mullions
    g.add(box(W - fw, 0.05, d * 0.6, fr, 0, H * 0.74, 0)); // horizontal transom
    g.add(box(W - fw, H - fw, 0.02, mat(0x9cc7da, { transparent: true, opacity: 0.38, metalness: 0.2 }), 0, H / 2, 0));
  }),
} satisfies Record<string, FurnitureBuilder>;
