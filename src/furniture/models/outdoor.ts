// ---------------------------------------------------------------------------
// Улица и терраса — модели библиотеки мебели.
//
// Каждая модель возвращает THREE.Group с началом координат в центре пятна
// на полу (y = 0). Порядок ключей в палитре задаёт MODEL_ORDER в ./index.ts,
// а не порядок записей в этом файле.
// ---------------------------------------------------------------------------

import * as THREE from 'three';
import { mat, box, rbox, cyl, tint, defineModel, alongX, WOOD, type FurnitureBuilder } from '../primitives';

/**
 * Низ каменного парапета: тело плюс облицовочные панели на обеих гранях с
 * тонким швом между ними. Один сборщик на стеклянный парапет, глухой парапет и
 * кашпо — раньше это была одна и та же дюжина строк, переписанная трижды.
 */
function stoneFacing(
  g: THREE.Group,
  c: THREE.Color,
  stone: THREE.Material,
  W: number,
  H: number,
  D: number,
  panel: { step: number; joint: number; inset: number; thick: number; dy: number; off: number },
): void {
  g.add(tint(box(W, H, D, stone, 0, H / 2, 0), c)); // тело
  const np = Math.max(3, Math.round(W / panel.step)), pw = W / np;
  alongX(W, np, (x) => {
    for (const sz of [1, -1])
      g.add(tint(box(pw - panel.joint, H - panel.inset, panel.thick, stone, x, H / 2 + panel.dy, sz * (D / 2 + panel.off)), c));
  });
}

export const outdoorModels = {
  // Hanging swing (arg'imchoq) — a freestanding A-frame with a rope seat.
  swing: defineModel((g, c) => {
    // House-shaped garden swing: an A-frame carrying a little pitched ROOF canopy
    // ("uycha") over a hanging bench seat with a back + arms.
    const post = mat(0x8a6a4a, { roughness: 0.75 });
    const H = 2.05, span = 1.9, depth = 1.4;
    // splayed A-frame legs (two per side)
    const legLen = Math.hypot(H, depth / 2);
    const tilt = Math.atan2(depth / 2, H);
    for (const sx of [-1, 1])
      for (const sz of [-1, 1]) {
        const leg = cyl(0.045, 0.06, legLen, post, sx * (span / 2), H / 2, (sz * depth) / 4, 10);
        leg.rotation.x = -sz * tilt;
        g.add(leg);
      }
    const beam = cyl(0.055, 0.055, span + 0.2, post, 0, H, 0, 10); // top beam the seat hangs from
    beam.rotation.z = Math.PI / 2;
    g.add(beam);
    // pitched roof canopy — two sloped panels meeting at a ridge (the "little house")
    const roofMat = mat(0x7a4f2e, { roughness: 0.85 });
    const rLen = span + 0.5, ridgeY = H + 0.6, eaveY = H + 0.16, eaveZ = depth / 2 + 0.28;
    for (const s of [-1, 1]) {
      const panel = box(rLen, 0.05, Math.hypot(ridgeY - eaveY, eaveZ) + 0.06, roofMat, 0, (ridgeY + eaveY) / 2, (s * eaveZ) / 2);
      panel.rotation.x = s * Math.atan2(ridgeY - eaveY, eaveZ);
      g.add(tint(panel, c));
    }
    g.add(box(rLen, 0.07, 0.09, roofMat, 0, ridgeY, 0)); // ridge beam
    // hanging bench seat: seat + frame + backrest + arms
    const seatMat = mat(WOOD, { roughness: 0.7 });
    const seatY = 0.52, sw = span - 0.5, sd = 0.5;
    g.add(tint(box(sw, 0.06, sd, seatMat, 0, seatY, 0.02), c));
    g.add(box(sw, 0.08, sd, mat(0x6e4a2f), 0, seatY - 0.06, 0.02));
    g.add(tint(box(sw, 0.42, 0.05, seatMat, 0, seatY + 0.23, -0.22), c));
    for (const sx of [-1, 1]) g.add(box(0.05, 0.22, sd, seatMat, sx * (sw / 2 - 0.03), seatY + 0.13, 0.02));
    const rope = mat(0x5b5b5b, { roughness: 0.95 });
    for (const sx of [-1, 1])
      for (const sz of [-1, 1])
        g.add(cyl(0.01, 0.01, H - seatY - 0.1, rope, sx * (sw / 2 - 0.05), (H + seatY) / 2, 0.02 + sz * (sd / 2 - 0.06), 6));
  }),
  // Wooden Montessori-style children's SLIDE (toyinchoq): a raised deck under a
  // tall rounded arch (a mirror/opening), with a CURVED chute descending to the
  // floor + side rails. Light natural oak.
  slide: defineModel((g, c) => {
    const oak = mat(0xdcc5a0, { roughness: 0.72 });
    const oak2 = mat(0xcab086, { roughness: 0.8 });
    const chuteMat = mat(0xe0cba6, { roughness: 0.55 });
    const platH = 0.92, W = 0.9;
    // raised deck + posts + a back apron under it
    g.add(tint(box(W, 0.08, 0.85, oak, 0, platH, -0.95), c));
    for (const sx of [-1, 1])
      for (const sz of [-0.6, -1.3])
        g.add(box(0.08, platH, 0.08, oak2, sx * (W / 2 - 0.06), platH / 2, sz));
    g.add(box(W, platH - 0.1, 0.05, oak2, 0, (platH - 0.1) / 2, -1.32));
    // tall rounded arch behind the deck (the "little house" arch + inner panel)
    const arch = mat(0xe6d5b6, { roughness: 0.85 });
    const aW = W + 0.16, aH = 1.5, az = -1.42;
    for (const sx of [-1, 1]) g.add(box(0.1, aH, 0.14, arch, sx * (aW / 2 - 0.05), platH + aH / 2 - 0.15, az));
    const ring = new THREE.Mesh(new THREE.TorusGeometry(aW / 2 - 0.05, 0.07, 8, 22, Math.PI), arch);
    ring.position.set(0, platH + aH - 0.15, az);
    g.add(ring);
    g.add(box(aW - 0.34, aH - 0.15, 0.04, mat(0xf1e8d4, { roughness: 0.5 }), 0, platH + (aH - 0.15) / 2 - 0.08, az + 0.06));
    // curved chute down to the floor + side rails (faceted quarter-curve)
    const N = 10, z0 = -0.5, z1 = 1.7;
    const pts: number[][] = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      pts.push([z0 + (z1 - z0) * t, platH * Math.pow(1 - t, 1.7)]);
    }
    for (let i = 0; i < N; i++) {
      const za = pts[i][0], ya = pts[i][1], zb = pts[i + 1][0], yb = pts[i + 1][1];
      const zc = (za + zb) / 2, yc = (ya + yb) / 2;
      const dz = zb - za, dy = yb - ya, len = Math.hypot(dz, dy), ang = Math.atan2(dy, dz);
      const bed = tint(box(W, 0.05, len + 0.03, chuteMat, 0, yc + 0.04, zc), c);
      bed.rotation.x = -ang;
      g.add(bed);
      for (const sx of [-1, 1]) {
        const r = box(0.06, 0.17, len + 0.03, oak2, sx * (W / 2), yc + 0.11, zc);
        r.rotation.x = -ang;
        g.add(r);
      }
    }
  }),
  // Passenger car (parked under the canopy on the plan).
  car: defineModel((g, c) => {
    const body = mat(0x30506e, { roughness: 0.4, metalness: 0.5 });
    g.add(tint(box(1.82, 0.55, 4.3, body, 0, 0.5, 0), c)); // lower body
    g.add(tint(box(1.7, 0.35, 3.5, body, 0, 0.85, 0), c)); // waist
    g.add(box(1.5, 0.42, 1.9, mat(0x1a2634, { roughness: 0.2, metalness: 0.3 }), 0, 1.12, -0.15)); // greenhouse
    const tire = mat(0x1c1c1e, { roughness: 0.9 });
    for (const sx of [-1, 1])
      for (const sz of [-1, 1]) {
        const wl = cyl(0.33, 0.33, 0.22, tire, sx * 0.88, 0.33, sz * 1.35, 18);
        wl.rotation.z = Math.PI / 2;
        g.add(wl);
      }
  }),
  // Off-road SUV — an upright 4x4 in the spirit of a classic G-class wagon, but
  // with molded (rounded) panels, gloss paint, alloy wheels with spokes and
  // arch trims, tinted glass and lit LED details so it reads as a real vehicle
  // rather than a block. All original primitive geometry (no badges or logos),
  // recolorable via the body tint; defaults to gloss black. Length runs along Z
  // like `car`, nose toward +Z.
  offroader: defineModel((g, c) => {
    const paint = () => mat(0x15171d, { roughness: 0.15, metalness: 0.68 }); // gloss paint (fresh per panel so tint is independent)
    const clad = mat(0x0c0d10, { roughness: 0.72, metalness: 0.12 });         // matte black bumpers / cladding / arches
    const glass = mat(0x1b2432, { roughness: 0.05, metalness: 0.92 });        // reflective tinted glass
    const tireMat = mat(0x131418, { roughness: 0.86, metalness: 0.05 });
    const rimMat = mat(0x34373f, { roughness: 0.28, metalness: 0.85 });       // machined dark alloy
    const chrome = mat(0xd0d4dc, { roughness: 0.18, metalness: 0.95 });
    const silver = mat(0x9aa0aa, { roughness: 0.4, metalness: 0.7 });
    const lamp = mat(0xf2f6ff, { roughness: 0.2, metalness: 0.1, emissive: 0x93a9d8, emissiveIntensity: 0.9 });
    const tail = mat(0x7a1414, { roughness: 0.35, metalness: 0.2, emissive: 0x6a0d0d, emissiveIntensity: 0.85 });

    // ---- body: rocker, main sides, beltline, sloped hood + power dome ----
    g.add(rbox(1.96, 0.3, 4.2, clad, 0, 0.46, 0, 0.06));                 // rocker/sill (dark cladding)
    g.add(tint(rbox(1.9, 0.68, 4.42, paint(), 0, 0.86, 0, 0.16), c));    // lower body
    g.add(tint(rbox(1.86, 0.18, 4.34, paint(), 0, 1.2, 0, 0.09), c));    // beltline shoulder
    const hood = tint(rbox(1.64, 0.14, 1.6, paint(), 0, 1.25, 1.4, 0.06), c);
    hood.rotation.x = -0.03; g.add(hood);                               // slightly sloped hood
    g.add(tint(rbox(0.82, 0.1, 1.1, paint(), 0, 1.33, 1.42, 0.05), c)); // power dome

    // ---- greenhouse: paint shell + raked windshield, side & rear glass ----
    g.add(tint(rbox(1.72, 0.66, 2.5, paint(), 0, 1.6, -0.3, 0.1), c));   // cabin shell (pillars + roof structure)
    const wsh = rbox(1.5, 0.6, 0.07, glass, 0, 1.62, 0.98, 0.03);
    wsh.rotation.x = 0.16; g.add(wsh);                                  // raked windshield
    for (const sx of [-1, 1]) {
      g.add(rbox(0.05, 0.42, 0.94, glass, sx * 0.88, 1.62, 0.16, 0.02));  // front side window
      g.add(rbox(0.05, 0.42, 0.94, glass, sx * 0.88, 1.62, -0.84, 0.02)); // rear side window
    }
    g.add(rbox(1.46, 0.5, 0.07, glass, 0, 1.62, -1.56, 0.03));           // rear glass
    g.add(tint(rbox(1.8, 0.14, 2.56, paint(), 0, 1.98, -0.3, 0.07), c)); // roof
    for (const sx of [-1, 1]) g.add(rbox(0.06, 0.07, 2.3, clad, sx * 0.76, 2.08, -0.3, 0.02)); // roof rails

    // ---- alloy wheels (spoked) + arch trims ----
    const wheel = (wx: number, wz: number) => {
      const w = new THREE.Group();
      w.position.set(wx, 0.46, wz);
      const dir = wx < 0 ? -1 : 1;
      const tire = cyl(0.46, 0.46, 0.34, tireMat, 0, 0, 0, 30); tire.rotation.z = Math.PI / 2; w.add(tire);
      const barrel = cyl(0.35, 0.35, 0.36, rimMat, 0, 0, 0, 26); barrel.rotation.z = Math.PI / 2; w.add(barrel);
      const face = cyl(0.34, 0.34, 0.05, rimMat, dir * 0.16, 0, 0, 26); face.rotation.z = Math.PI / 2; w.add(face);
      for (let k = 0; k < 3; k++) { const sp = box(0.05, 0.6, 0.09, rimMat, dir * 0.19, 0, 0); sp.rotation.x = (k * Math.PI) / 3; w.add(sp); }
      const hub = cyl(0.1, 0.1, 0.06, chrome, dir * 0.22, 0, 0, 18); hub.rotation.z = Math.PI / 2; w.add(hub);
      return w;
    };
    for (const wx of [-0.95, 0.95])
      for (const wz of [-1.5, 1.5]) {
        g.add(wheel(wx, wz));
        const a = new THREE.Mesh(new THREE.TorusGeometry(0.57, 0.1, 8, 20, Math.PI), clad);
        a.position.set(wx * 1.03, 0.46, wz); a.rotation.y = Math.PI / 2; a.castShadow = true; g.add(a);
      }

    // ---- front: grille, halo headlights, bumper, skid plate, LED strips ----
    g.add(rbox(0.98, 0.46, 0.08, clad, 0, 1.0, 2.19, 0.03));            // grille recess
    for (let i = -3; i <= 3; i++) g.add(box(0.04, 0.4, 0.1, chrome, i * 0.13, 1.0, 2.22));
    for (const sx of [-1, 1]) {
      const halo = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.028, 8, 24), lamp);
      halo.position.set(sx * 0.62, 1.0, 2.24); g.add(halo);
      const lens = cyl(0.13, 0.13, 0.06, lamp, sx * 0.62, 1.0, 2.24, 24); lens.rotation.x = Math.PI / 2; g.add(lens);
    }
    g.add(rbox(1.92, 0.5, 0.4, clad, 0, 0.56, 2.32, 0.1));              // front bumper
    g.add(rbox(0.94, 0.1, 0.22, silver, 0, 0.35, 2.44, 0.04));          // skid plate
    for (const sx of [-1, 1]) g.add(box(0.42, 0.06, 0.05, lamp, sx * 0.6, 0.64, 2.53)); // LED day strips

    // ---- rear: bumper, tail lights, spare (body-colour cover), exhausts ----
    g.add(rbox(1.92, 0.5, 0.4, clad, 0, 0.56, -2.32, 0.1));
    for (const sx of [-1, 1]) g.add(rbox(0.3, 0.4, 0.08, tail, sx * 0.74, 1.06, -2.24, 0.04));
    const spare = cyl(0.46, 0.46, 0.22, tireMat, 0, 1.06, -2.42, 30); spare.rotation.x = Math.PI / 2; g.add(spare);
    const cover = cyl(0.4, 0.4, 0.1, paint(), 0, 1.06, -2.5, 28); cover.rotation.x = Math.PI / 2; g.add(tint(cover, c));
    for (const sx of [-1, 1]) { const ex = cyl(0.05, 0.05, 0.16, chrome, sx * 0.55, 0.32, -2.46, 12); ex.rotation.x = Math.PI / 2; g.add(ex); }

    // ---- sides: running boards, mirrors, handles, roof light bar ----
    for (const sx of [-1, 1]) {
      g.add(rbox(0.1, 0.08, 2.4, clad, sx * 0.98, 0.42, -0.1, 0.03));                     // running board
      g.add(tint(rbox(0.18, 0.12, 0.12, paint(), sx * 1.04, 1.42, 0.62, 0.04), c));       // mirror housing
      g.add(box(0.06, 0.04, 0.08, clad, sx * 0.99, 1.4, 0.62));                           // mirror arm
      g.add(box(0.02, 0.04, 0.16, chrome, sx * 0.96, 1.16, 0.2));                         // front door handle
      g.add(box(0.02, 0.04, 0.16, chrome, sx * 0.96, 1.16, -0.7));                        // rear door handle
    }
    g.add(rbox(1.5, 0.1, 0.14, clad, 0, 2.12, 0.75, 0.03));                               // roof light bar
    for (let i = -3; i <= 3; i++) g.add(box(0.12, 0.06, 0.04, lamp, i * 0.2, 2.12, 0.83));

  }),
  // Retractable louvered pergola roof — a ceiling-level slatted canopy that FOLDS
  // toward its mounting (house) side. The cream louvres live in a 'curtainPivot'
  // group, so a bound `cover` gathers them: cover-closed = full canopy over the
  // terrace, cover-open = retracted to the house. Fixed dark side-tracks stay put.
  // Place at ceiling height (defaultY = wallHeight). ~3.2 x 2.8 m.
  pergola_retractable: defineModel((g, c) => {
    const W = 3.2, Dep = 2.8, hw = W / 2, hd = Dep / 2;
    const frame = mat(0x2b2f33, { metalness: 0.55, roughness: 0.4 });
    const cream = mat(0xede4cc, { roughness: 0.85 });
    // Fixed side tracks (run house->terrace along x) + a house-side mount beam.
    g.add(box(W + 0.06, 0.14, 0.11, frame, 0, 0, -hd));
    g.add(box(W + 0.06, 0.14, 0.11, frame, 0, 0, hd));
    g.add(box(0.14, 0.2, Dep + 0.1, frame, -hw - 0.02, 0, 0));
    // Retractable louvre pack — curtainPivot hinged at the house side (-hw), so
    // scale.x gathers the slats toward the house as the cover opens.
    const pivot = new THREE.Group();
    pivot.name = 'curtainPivot';
    pivot.position.x = -hw;
    const n = 18, seg = W / n;
    for (let i = 0; i < n; i++) {
      const px = (i + 0.5) * seg;
      pivot.add(tint(box(seg * 0.86, 0.05, Dep - 0.14, cream, px, 0.03, 0), c));
    }
    // Leading-edge beam travels with the slats (at the far/terrace end).
    pivot.add(box(0.1, 0.16, Dep, frame, W - 0.05, 0, 0));
    g.add(pivot);
  }),
  // Half-height terrace parapet — a warm vertical-slat clad low wall topped by a
  // frameless glass balustrade with a slim metal handrail. Free-standing: sits on
  // the deck at the terrace edge. ~2.4 m long, ~0.95 m wall + 0.5 m glass.
  terrace_parapet: defineModel((g, c) => {
    const W = 2.4, H = 0.95, D = 0.14;
    const wood = mat(0x9c6b3f, { roughness: 0.7 });
    const frame = mat(0x2b2f33, { metalness: 0.5, roughness: 0.4 });
    const glass = mat(0xaecbe0, { transparent: true, opacity: 0.22, roughness: 0.1, metalness: 0.2, side: THREE.DoubleSide });
    const core = mat(0xcfc8bd, { roughness: 0.9 });
    g.add(box(W, H, D * 0.6, core, 0, H / 2, 0)); // solid core
    // Vertical wood slats cladding both faces.
    const n = Math.max(6, Math.round(W / 0.085)), seg = W / n;
    alongX(W, n, (x) => {
      g.add(tint(box(seg * 0.68, H - 0.06, 0.022, wood, x, H / 2, D * 0.3 + 0.011), c));
      g.add(tint(box(seg * 0.68, H - 0.06, 0.022, wood, x, H / 2, -D * 0.3 - 0.011), c));
    });
    g.add(box(W + 0.04, 0.04, D + 0.04, frame, 0, H + 0.02, 0)); // coping cap
    // Glass balustrade + posts + handrail on top.
    const gh = 0.5;
    g.add(box(W - 0.08, gh, 0.014, glass, 0, H + 0.04 + gh / 2, 0));
    for (const x of [-W / 2 + 0.06, 0, W / 2 - 0.06]) g.add(box(0.028, gh, 0.03, frame, x, H + 0.04 + gh / 2, 0));
    const rail = cyl(0.018, 0.018, W, frame, 0, H + 0.04 + gh, 0, 8);
    rail.rotation.z = Math.PI / 2;
    g.add(rail);
  }),
  // Stone terrace parapet under a REEDED glass screen — the enclosed-terrace
  // wall: cream stone facing panels, a dark stone coping, then a fluted
  // translucent screen between dark end posts. Free-standing at the terrace
  // edge. ~2.4 m long; 0.9 m of wall + 0.62 m of glass.
  terrace_glass_parapet: defineModel((g, c) => {
    const W = 2.4, H = 0.9, D = 0.16;
    const stone = mat(0xe3d9c4, { roughness: 0.85 });
    const dark = mat(0x33363b, { roughness: 0.55, metalness: 0.25 });
    const glass = mat(0xd8e2df, { transparent: true, opacity: 0.34, roughness: 0.12, metalness: 0.1, side: THREE.DoubleSide });
    // Core + large-format facing panels on both faces, with a slim joint between them.
    stoneFacing(g, c, stone, W, H, D, { step: 0.62, joint: 0.012, inset: 0.05, thick: 0.014, dy: 0, off: 0.007 });
    g.add(box(W + 0.03, 0.05, D + 0.05, dark, 0, H + 0.025, 0)); // dark coping
    // Reeded screen: one translucent pane, with vertical flutes proud of its face.
    const gy = H + 0.05, gh = 0.62;
    g.add(box(W - 0.06, gh, 0.016, glass, 0, gy + gh / 2, 0));
    const nr = Math.max(8, Math.round(W / 0.075)), rw = (W - 0.06) / nr;
    alongX(W - 0.06, nr, (x) => g.add(box(rw * 0.72, gh - 0.02, 0.012, glass, x, gy + gh / 2, 0.012)));
    g.add(box(W - 0.06, 0.035, 0.05, dark, 0, gy + gh + 0.017, 0)); // cap rail
    for (const sx of [-1, 1]) g.add(box(0.05, gh, 0.05, dark, sx * (W / 2 - 0.025), gy + gh / 2, 0)); // end posts
  }),
  // Plain stone terrace parapet — cream facing panels between a dark skirting and
  // a dark coping cap. The solid low wall that rings the open roof terrace, and
  // the bench-height ledge inside it. ~2.4 m long, ~1.0 m tall.
  terrace_stone_parapet: defineModel((g, c) => {
    const W = 2.4, H = 1.0, D = 0.18;
    const stone = mat(0xe3d9c4, { roughness: 0.85 });
    const dark = mat(0x33363b, { roughness: 0.55, metalness: 0.25 });
    stoneFacing(g, c, stone, W, H, D, { step: 0.6, joint: 0.014, inset: 0.08, thick: 0.014, dy: 0.01, off: 0.007 });
    g.add(box(W + 0.04, 0.055, D + 0.06, dark, 0, H + 0.028, 0)); // coping cap
    g.add(box(W, 0.05, D + 0.02, dark, 0, 0.025, 0)); // skirting
  }),
  // Classical stone balustrade — turned vase balusters between a moulded plinth
  // and a handrail, as on the open (unroofed) terrace. ~2.4 m long, ~0.8 m tall.
  balustrade: defineModel((g, c) => {
    const W = 2.4, D = 0.2;
    const stone = mat(0xe3d9c4, { roughness: 0.85 });
    g.add(tint(box(W, 0.06, D, stone, 0, 0.03, 0), c)); // plinth
    g.add(tint(box(W - 0.05, 0.06, D - 0.05, stone, 0, 0.09, 0), c)); // base moulding
    const bY = 0.12, bH = 0.56;
    const n = Math.max(4, Math.round(W / 0.17));
    alongX(W, n, (x) => {
      // Vase profile: a wide belly tapering up to a narrow neck, then a flare.
      g.add(tint(cyl(0.032, 0.058, bH * 0.62, stone, x, bY + bH * 0.31, 0, 10), c));
      g.add(tint(cyl(0.052, 0.030, bH * 0.28, stone, x, bY + bH * 0.76, 0, 10), c));
      g.add(tint(box(0.085, bH * 0.1, 0.085, stone, x, bY + bH * 0.95, 0), c));
    });
    const rY = bY + bH;
    g.add(tint(box(W, 0.05, D - 0.02, stone, 0, rY + 0.025, 0), c)); // rail underside
    g.add(tint(box(W + 0.05, 0.06, D + 0.02, stone, 0, rY + 0.08, 0), c)); // handrail cap
  }),
  // Raised star-plan granite fountain (the terrace "hauz") — a two-step polished
  // black granite plinth whose zig-zag parapet rings a circular water basin, with
  // slatted teak decking filling the space between. ~3.2 m square, 0.75 m tall.
  fountain_pool: defineModel((g, c) => {
    const gran = mat(0x24262b, { roughness: 0.25, metalness: 0.25 }); // polished
    const speck = mat(0x44484e, { roughness: 0.7 }); // speckled granite copings
    const wood = mat(0x8a5a30, { roughness: 0.75 });
    const water = mat(0x8fc8dc, { transparent: true, opacity: 0.82, roughness: 0.1 });
    // Two-step plinth, each course finished with a speckled cap.
    const S = 3.2;
    g.add(tint(box(S, 0.1, S, gran, 0, 0.05, 0), c));
    g.add(box(S + 0.02, 0.025, S + 0.02, speck, 0, 0.112, 0));
    const S2 = S - 0.62;
    g.add(tint(box(S2, 0.14, S2, gran, 0, 0.195, 0), c));
    g.add(box(S2 + 0.02, 0.025, S2 + 0.02, speck, 0, 0.278, 0));
    // Teak deck, laid inside the parapet and hidden under the basin.
    const dHalf = 0.98, nb = 13, sw = (dHalf * 2) / nb;
    alongX(dHalf * 2, nb, (x) => g.add(box(sw * 0.66, 0.035, dHalf * 2, wood, x, 0.308, 0)));
    // Zig-zag parapet: 8 tangent panels at ALTERNATING radii, which is what gives
    // the plan its star. Each panel is turned to face radially outward.
    const n = 8, ph = 0.46;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const even = i % 2 === 0;
      const s = new THREE.Group();
      const wSeg = even ? 1.12 : 0.92;
      s.add(tint(box(wSeg, ph, 0.1, gran, 0, ph / 2, 0), c));
      s.add(box(wSeg + 0.06, 0.04, 0.17, speck, 0, ph + 0.02, 0));
      const r = even ? 1.36 : 1.12;
      s.position.set(Math.cos(a) * r, 0.29, Math.sin(a) * r);
      s.rotation.y = Math.PI / 2 - a;
      g.add(s);
    }
    // Circular basin: a speckled granite drum whose top face reads as the rim,
    // with the water disc set just below it so the pool looks sunken.
    const R = 0.72;
    g.add(cyl(R + 0.13, R + 0.13, 0.17, speck, 0, 0.36, 0, 32));
    g.add(cyl(R, R, 0.02, water, 0, 0.432, 0, 32));
  }),
  // Built-in stone planter — cream stone facing over a dark skirting, capped by a
  // dark granite frame around a sunken bed. The window-side boxes that run along
  // the terrace glazing. ~1.6 x 0.6 m, 0.6 m tall.
  stone_planter: defineModel((g, c) => {
    const W = 1.6, H = 0.55, D = 0.6;
    const stone = mat(0xe3d9c4, { roughness: 0.85 });
    const dark = mat(0x33363b, { roughness: 0.4, metalness: 0.2 });
    const soil = mat(0x2e2a26, { roughness: 0.95 });
    stoneFacing(g, c, stone, W, H, D, { step: 0.4, joint: 0.012, inset: 0.14, thick: 0.012, dy: 0.03, off: 0.006 });
    g.add(box(W + 0.02, 0.07, D + 0.02, dark, 0, 0.035, 0)); // dark skirting
    // Granite cap as a frame, so the middle reads as a sunken bed.
    const cw = 0.13, cy = H + 0.025;
    g.add(box(W + 0.04, 0.05, cw, dark, 0, cy, (D - cw) / 2 + 0.02));
    g.add(box(W + 0.04, 0.05, cw, dark, 0, cy, -((D - cw) / 2 + 0.02)));
    g.add(box(cw, 0.05, D + 0.04, dark, (W - cw) / 2 + 0.02, cy, 0));
    g.add(box(cw, 0.05, D + 0.04, dark, -((W - cw) / 2 + 0.02), cy, 0));
    g.add(box(W - cw * 2, 0.02, D - cw * 2, soil, 0, H - 0.03, 0)); // bed
  }),
  tree: defineModel((g, c) => {
    const bark = mat(0x6b4a2f, { roughness: 0.95 });
    const leaf = mat(0x3f7d3f);
    // Tapered trunk (wider at the base), low seg — it's mostly hidden by canopy.
    g.add(cyl(0.09, 0.17, 1.3, bark, 0, 0.65, 0, 8));
    // Two short branch stubs angling out from the crown to break the silhouette.
    const b1 = cyl(0.035, 0.07, 0.55, bark, -0.13, 1.25, 0.05, 6);
    b1.rotation.z = 0.5;
    g.add(b1);
    const b2 = cyl(0.035, 0.07, 0.55, bark, 0.14, 1.3, -0.04, 6);
    b2.rotation.z = -0.6;
    g.add(b2);
    // Layered leafy canopy: overlapping low-poly icosahedron blobs, slightly
    // squashed vertically so it reads as a rounded crown rather than a ball.
    const blob = (r: number, x: number, y: number, z: number) => {
      const m = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 0), leaf);
      m.position.set(x, y, z);
      m.scale.set(1, 0.92, 1);
      m.castShadow = true;
      m.receiveShadow = true;
      return tint(m, c);
    };
    g.add(blob(0.85, 0, 2.05, 0)); // central mass (main tinted surface)
    g.add(blob(0.6, -0.62, 1.78, 0.15)); // lower-left bulge
    g.add(blob(0.58, 0.6, 1.82, -0.2)); // lower-right bulge
    g.add(blob(0.55, 0.1, 2.45, 0.2)); // top crown
    g.add(blob(0.5, 0.2, 1.9, 0.58)); // front bulge
    g.add(blob(0.48, -0.16, 1.92, -0.55)); // back bulge
  }),
  shrub: defineModel((g, c) => {
    const leaf = mat(0x4a7d3a);
    // A round hedge clump from a few flattened, overlapping low-poly spheres.
    const blob = (r: number, x: number, y: number, z: number) => {
      const m = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 0), leaf);
      m.position.set(x, y, z);
      m.scale.set(1, 0.62, 1); // squash → low mounded bush
      m.castShadow = true;
      m.receiveShadow = true;
      return tint(m, c);
    };
    g.add(blob(0.34, 0, 0.22, 0)); // central mound (main tinted surface)
    g.add(blob(0.27, -0.2, 0.18, 0.06)); // left lobe
    g.add(blob(0.26, 0.2, 0.19, -0.05)); // right lobe
  }),
} satisfies Record<string, FurnitureBuilder>;
