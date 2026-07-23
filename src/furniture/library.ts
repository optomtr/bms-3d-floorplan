// ---------------------------------------------------------------------------
// Built-in furniture library — procedural low-poly geometry.
//
// Rather than shipping (and licensing) GLB binaries, the built-in pieces are
// generated from Three.js primitives. This keeps the bundle tiny, sidesteps
// asset-licensing concerns entirely, and every piece is recolorable via a base
// tint. Custom .glb models are still supported per placement (see loader.ts).
//
// Each builder returns a THREE.Group whose origin is the footprint center at
// floor level (y = 0), so placements sit naturally on the floor.
// ---------------------------------------------------------------------------

import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/** Optional per-placement build options. `spread` widens the SPACING of a light
 *  set (keeping each element's size); `count` sets how many elements. */
export interface BuildOpts {
  spread?: number;
  count?: number;
}
export type FurnitureBuilder = (color: THREE.Color, opts?: BuildOpts) => THREE.Group;

const WOOD = 0x9c6b3f;
const FABRIC = 0x6f7d8c;
const METAL = 0xb8bcc4;
const WHITE = 0xf2f2f2;
const DARK = 0x2b2f36;
const GLASS = 0x88c0d0;

function mat(color: number | THREE.Color, opts: THREE.MeshStandardMaterialParameters = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.8,
    metalness: 0.05,
    ...opts,
  });
}

function box(
  w: number,
  h: number,
  d: number,
  material: THREE.Material,
  x = 0,
  y = 0,
  z = 0,
): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

function cyl(
  rTop: number,
  rBot: number,
  h: number,
  material: THREE.Material,
  x = 0,
  y = 0,
  z = 0,
  seg = 16,
): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, h, seg), material);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

/** Tag a mesh as the "tintable" surface so a binding/recolor hits the right part. */
function tint(mesh: THREE.Mesh, color: THREE.Color): THREE.Mesh {
  (mesh.material as THREE.MeshStandardMaterial).color.copy(color);
  return mesh;
}

/** "BMS" in white on black, as an emissive texture for a TV screen — so a bound
 *  TV lights up its brand when it turns on (and stays dark when off). Cached. */
let _bmsScreenTex: THREE.CanvasTexture | null = null;
function bmsScreenTexture(): THREE.CanvasTexture | null {
  if (_bmsScreenTex) return _bmsScreenTex;
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 288;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 150px system-ui, Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('BMS', canvas.width / 2, canvas.height / 2 + 6);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  _bmsScreenTex = tex;
  return tex;
}

/**
 * A hollow rectangle of light (glowing frame, open centre) built from 4 thin
 * bars MERGED into a single emissive mesh — one draw call regardless of size.
 * W×D = outer footprint, t = bar thickness. Named 'emissive' so it binds.
 */
function ledFrame(W: number, D: number, t: number, colorHex: number): THREE.Mesh {
  const hW = W / 2;
  const hD = D / 2;
  const parts: THREE.BufferGeometry[] = [];
  const bar = (w: number, d: number, x: number, z: number) => {
    const geo = new THREE.BoxGeometry(w, 0.03, d);
    geo.translate(x, 0, z);
    parts.push(geo);
  };
  bar(W, t, 0, -(hD - t / 2)); // near edge
  bar(W, t, 0, hD - t / 2); // far edge
  bar(t, D - 2 * t, -(hW - t / 2), 0); // left edge
  bar(t, D - 2 * t, hW - t / 2, 0); // right edge
  const mesh = new THREE.Mesh(mergeGeometries(parts, false), mat(colorHex, { emissive: 0x000000 }));
  mesh.name = 'emissive';
  mesh.castShadow = false;
  parts.forEach((p) => p.dispose());
  return mesh;
}

/** One flush ceiling speaker (потолочная колонка) — a round grille facing down.
 *  Shared by the single and double models. The tiny status LED is 'emissive',
 *  so it lights when the bound media_player is playing. */
function ceilingSpeakerUnit(c: THREE.Color): THREE.Group {
  const u = new THREE.Group();
  u.add(tint(cyl(0.15, 0.15, 0.022, mat(WHITE, { roughness: 0.6 }), 0, -0.011, 0, 28), c)); // white bezel
  u.add(cyl(0.125, 0.125, 0.02, mat(0x26292e, { roughness: 0.85, metalness: 0.15 }), 0, -0.024, 0, 28)); // dark grille
  u.add(cyl(0.045, 0.045, 0.016, mat(0x15171a, { roughness: 0.9 }), 0, -0.032, 0, 18)); // centre dome
  const led = cyl(0.008, 0.008, 0.006, mat(0x2fd06a, { emissive: 0x000000 }), 0.105, -0.02, 0, 10);
  led.name = 'emissive';
  u.add(led);
  return u;
}

/** One tall dark-gloss display cabinet with a gold-trimmed front and a column of
 *  backlit glass shelves. The shelf LED strips are 'emissive', so a bound
 *  light/switch makes the shelves glow. Shared by the cabinet_pair set. */
function cabinetUnit(c: THREE.Color): THREE.Group {
  const u = new THREE.Group();
  const W = 0.62, H = 2.4, D = 0.42;
  const dark = mat(0x1a1712, { roughness: 0.22, metalness: 0.35 }); // dark glossy wenge/black
  const gold = mat(0xc9a24a, { metalness: 0.75, roughness: 0.3 });
  u.add(tint(box(W, H, D, dark, 0, H / 2, 0), c)); // body
  u.add(box(0.014, H, 0.014, gold, -W / 2 + 0.02, H / 2, D / 2)); // gold trim edges
  u.add(box(0.014, H, 0.014, gold, W / 2 - 0.02, H / 2, D / 2));
  u.add(box(W, 0.02, D, gold, 0, H - 0.01, 0)); // top cap trim
  // Recessed shelf niche with a stone back and backlit glass shelves.
  u.add(box(W - 0.16, H - 0.24, 0.02, mat(0x2a2521, { roughness: 0.5 }), 0, H / 2, D / 2 - 0.13));
  const glass = mat(0x2a2d31, { transparent: true, opacity: 0.55, roughness: 0.2, metalness: 0.2 });
  for (let i = 0; i < 4; i++) {
    const y = 0.55 + i * 0.5;
    u.add(box(W - 0.18, 0.02, 0.24, glass, 0, y, D / 2 - 0.15)); // glass shelf
    const led = box(W - 0.2, 0.015, 0.02, mat(0xfff0d0, { emissive: 0x000000 }), 0, y - 0.02, D / 2 - 0.25);
    led.name = 'emissive'; // under-shelf backlight
    u.add(led);
  }
  return u;
}

const builders: Record<string, FurnitureBuilder> = {
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
  bed: (c) => {
    const g = new THREE.Group();
    const uph = mat(FABRIC, { roughness: 0.9 });   // upholstery: base + headboard + duvet (shared so one tint recolors all)
    const linen = mat(WHITE, { roughness: 0.85 });  // mattress, turned-down sheet, pillows
    const foot = mat(DARK, { roughness: 0.6 });
    // short feet at the four corners
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const)
      g.add(box(0.1, 0.1, 0.1, foot, sx * 0.82, 0.05, sz * 0.92));
    // upholstered base / valance — MAIN tinted surface (shared uph material recolors every upholstered part)
    g.add(tint(box(1.9, 0.3, 2.15, uph, 0, 0.25, 0), c));
    g.add(box(1.86, 0.06, 2.11, uph, 0, 0.41, 0)); // chamfer rail stacked on the base
    // mattress
    g.add(box(1.8, 0.22, 1.98, linen, 0, 0.51, 0.05));
    // duvet — drapes slightly past the mattress edges
    g.add(box(1.84, 0.12, 1.3, uph, 0, 0.68, 0.39));
    // folded-back sheet turn-down over the head of the duvet
    const fold = box(1.84, 0.07, 0.22, linen, 0, 0.74, -0.2);
    fold.rotation.x = -0.12;
    g.add(fold);
    // two pillows propped at the head
    for (const sx of [-1, 1] as const) {
      const p = box(0.74, 0.16, 0.44, linen, sx * 0.42, 0.71, -0.62);
      p.rotation.x = -0.18;
      g.add(p);
    }
    // tall upholstered headboard: backing panel + padded face + tufted panel grid
    g.add(box(1.9, 1.05, 0.1, uph, 0, 0.725, -1.025));
    g.add(box(1.78, 0.95, 0.06, uph, 0, 0.75, -0.97));
    for (const px of [-0.6, 0, 0.6])
      for (const py of [0.58, 1.02])
        g.add(box(0.54, 0.4, 0.05, uph, px, py, -0.93)); // raised cushions; gaps read as tufting
    return g;
  },
  table: (c) => {
    const g = new THREE.Group();
    const wood = mat(WOOD);
    g.add(tint(box(1.4, 0.06, 0.8, wood, 0, 0.74, 0), c)); // top
    const lx = 0.62, lz = 0.32;
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) {
      g.add(box(0.07, 0.74, 0.07, wood, sx * lx, 0.37, sz * lz));
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
  // Hanging swing (arg'imchoq) — a freestanding A-frame with a rope seat.
  swing: (c) => {
    // House-shaped garden swing: an A-frame carrying a little pitched ROOF canopy
    // ("uycha") over a hanging bench seat with a back + arms.
    const g = new THREE.Group();
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
    return g;
  },
  // Wooden Montessori-style children's SLIDE (toyinchoq): a raised deck under a
  // tall rounded arch (a mirror/opening), with a CURVED chute descending to the
  // floor + side rails. Light natural oak.
  slide: (c) => {
    const g = new THREE.Group();
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
    return g;
  },
  // Round/oval stone table (travertine look) on two chunky curved feet.
  round_table: (c) => {
    const g = new THREE.Group();
    const stone = mat(0xe9e2d5, { roughness: 0.55, metalness: 0.02 });
    const top = cyl(0.75, 0.75, 0.08, stone, 0, 0.73, 0, 44);
    top.scale.z = 0.72; // oval
    g.add(tint(top, c));
    for (const sz of [-1, 1]) {
      const foot = cyl(0.16, 0.24, 0.7, stone, 0, 0.35, sz * 0.22, 24);
      foot.scale.x = 1.3;
      g.add(tint(foot, c));
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
  wardrobe: (c) => {
    const g = new THREE.Group();
    g.add(tint(box(1.2, 2.0, 0.6, mat(WOOD), 0, 1.0, 0), c));
    g.add(box(0.04, 1.8, 0.02, mat(METAL), -0.02, 1.0, 0.31)); // door split
    g.add(cyl(0.02, 0.02, 0.15, mat(METAL), -0.2, 1.0, 0.32)); // handle
    g.add(cyl(0.02, 0.02, 0.15, mat(METAL), 0.16, 1.0, 0.32));
    return g;
  },
  kitchen_counter: (c) => {
    const g = new THREE.Group();
    g.add(tint(box(2.0, 0.85, 0.6, mat(WHITE), 0, 0.425, 0), c)); // cabinet
    g.add(box(2.05, 0.05, 0.65, mat(DARK), 0, 0.875, 0)); // worktop
    return g;
  },
  tv: (c) => {
    // Flat wall panel, centered at local y=0 (placed at defaultY). The back sits
    // at local z=0 so it can be offset to rest flush on the wall surface.
    const g = new THREE.Group();
    g.add(tint(box(1.3, 0.78, 0.06, mat(DARK), 0, 0, 0.03), c)); // bezel
    // Screen: dark when off; when bound to a media_player and ON, its emissive
    // lifts and the white "BMS" texture lights up (named 'emissive' so it binds).
    const screen = box(
      1.18,
      0.66,
      0.02,
      mat(0x0a0a0a, { emissive: 0xffffff, emissiveMap: bmsScreenTexture(), emissiveIntensity: 0 }),
      0,
      0,
      0.07,
    );
    screen.name = 'emissive';
    g.add(screen);
    return g;
  },
  fridge: (c) => {
    const g = new THREE.Group();
    g.add(tint(box(0.7, 1.8, 0.7, mat(METAL), 0, 0.9, 0), c));
    g.add(box(0.04, 0.1, 0.02, mat(DARK), 0.3, 1.3, 0.36)); // handle upper
    g.add(box(0.04, 0.1, 0.02, mat(DARK), 0.3, 0.6, 0.36)); // handle lower
    return g;
  },
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
  door: (c) => {
    const g = new THREE.Group();
    const jamb = mat(WHITE);
    // Frame (jambs + header) so it reads as a real door, then the leaf + panels.
    g.add(box(0.06, 2.06, 0.16, jamb, -0.46, 1.03, 0));
    g.add(box(0.06, 2.06, 0.16, jamb, 0.46, 1.03, 0));
    g.add(box(0.98, 0.06, 0.16, jamb, 0, 2.06, 0));
    const leaf = tint(box(0.84, 2.0, 0.06, mat(WOOD), 0, 1.0, 0), c);
    g.add(leaf);
    g.add(cyl(0.03, 0.03, 0.12, mat(0xb8932e), 0.33, 1.0, 0.06)); // brass handle
    return g;
  },
  window_frame: (c) => {
    const g = new THREE.Group();
    const frame = mat(0x55606a); // dark frame so the window is clearly visible
    const W = 1.2, H = 1.2, yc = 1.45, fw = 0.07, d = 0.1;
    g.add(tint(box(W, fw, d, frame, 0, yc + H / 2, 0), c)); // top
    g.add(tint(box(W, fw, d, frame, 0, yc - H / 2, 0), c)); // bottom (sill)
    g.add(box(fw, H, d, frame, -W / 2 + fw / 2, yc, 0)); // left
    g.add(box(fw, H, d, frame, W / 2 - fw / 2, yc, 0)); // right
    g.add(box(0.05, H, d * 0.6, frame, 0, yc, 0)); // vertical mullion
    g.add(box(W, 0.05, d * 0.6, frame, 0, yc, 0)); // horizontal mullion
    g.add(box(W - fw, H - fw, 0.02, mat(0x9cc7da, { transparent: true, opacity: 0.5, metalness: 0.2 }), 0, yc, 0));
    return g;
  },
  ceiling_light: (c) => {
    const g = new THREE.Group();
    // Anchor at ceiling; the binding system attaches a PointLight to this.
    const shade = cyl(0.18, 0.22, 0.12, mat(WHITE, { emissive: 0x000000 }), 0, 0, 0);
    shade.name = 'emissive';
    g.add(tint(shade, c));
    g.add(cyl(0.01, 0.01, 0.25, mat(METAL), 0, 0.18, 0)); // cord
    return g;
  },
  ac_unit: (c) => {
    const g = new THREE.Group();
    g.add(tint(box(0.9, 0.28, 0.18, mat(WHITE), 0, 0, 0), c));
    g.add(box(0.8, 0.04, 0.02, mat(DARK), 0, -0.1, 0.09)); // vent
    return g;
  },
  intercom: (c) => {
    const g = new THREE.Group();
    g.add(tint(box(0.16, 0.26, 0.04, mat(DARK), 0, 0, 0), c));
    const scr = box(0.12, 0.14, 0.01, mat(0x101418, { emissive: 0x0a2a3a }), 0, 0.03, 0.025);
    scr.name = 'emissive';
    g.add(scr);
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
  coffee_table: (c) => {
    const g = new THREE.Group();
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
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const)
      g.add(cyl(0.023, 0.036, 0.36, legMat, sx * 0.52, 0.18, sz * 0.245, 12));
    return g;
  },
  dining_table: (c) => {
    const g = new THREE.Group();
    g.add(tint(box(1.8, 0.06, 0.95, mat(WOOD), 0, 0.75, 0), c));
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const)
      g.add(box(0.08, 0.75, 0.08, mat(WOOD), sx * 0.8, 0.37, sz * 0.4));
    return g;
  },
  bookshelf: (c) => {
    const g = new THREE.Group();
    g.add(tint(box(1.0, 1.8, 0.32, mat(WOOD), 0, 0.9, 0), c));
    for (let i = 1; i <= 4; i++) g.add(box(0.94, 0.03, 0.3, mat(DARK), 0, i * 0.36, 0));
    return g;
  },
  desk: (c) => {
    const g = new THREE.Group();
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
  nightstand: (c) => {
    const g = new THREE.Group();
    const wood = mat(WOOD, { roughness: 0.6 });     // carcass + drawer fronts + top (shared -> recolor together)
    const dark = mat(DARK, { roughness: 0.6 });
    const metal = mat(METAL, { roughness: 0.3, metalness: 0.6 });
    // four short tapered legs
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const)
      g.add(cyl(0.02, 0.03, 0.12, dark, sx * 0.2, 0.06, sz * 0.16, 8));
    // carcass — MAIN tinted surface (shared wood material recolors drawers + top too)
    g.add(tint(box(0.46, 0.34, 0.4, wood, 0, 0.29, 0), c));
    // two drawer fronts, sitting slightly proud of the carcass face
    g.add(box(0.42, 0.15, 0.02, wood, 0, 0.21, 0.205));
    g.add(box(0.42, 0.15, 0.02, wood, 0, 0.37, 0.205));
    // slim horizontal bar handles
    g.add(box(0.16, 0.015, 0.02, metal, 0, 0.235, 0.22));
    g.add(box(0.16, 0.015, 0.02, metal, 0, 0.395, 0.22));
    // thin overhanging top
    g.add(box(0.5, 0.03, 0.44, wood, 0, 0.475, 0));
    return g;
  },
  dresser: (c) => {
    const g = new THREE.Group();
    g.add(tint(box(1.1, 0.85, 0.5, mat(WOOD), 0, 0.42, 0), c));
    for (let i = 0; i < 3; i++) g.add(box(0.9, 0.02, 0.02, mat(METAL), 0, 0.2 + i * 0.25, 0.26));
    return g;
  },
  stove: (c) => {
    const g = new THREE.Group();
    g.add(tint(box(0.6, 0.85, 0.6, mat(METAL), 0, 0.42, 0), c));
    g.add(box(0.55, 0.02, 0.55, mat(DARK), 0, 0.86, 0)); // cooktop
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const)
      g.add(cyl(0.08, 0.08, 0.01, mat(0x222222), sx * 0.13, 0.875, sz * 0.13));
    return g;
  },
  microwave: (c) => {
    const g = new THREE.Group();
    g.add(tint(box(0.5, 0.3, 0.35, mat(DARK), 0, 0.15, 0), c));
    g.add(box(0.32, 0.22, 0.01, mat(0x101418, { emissive: 0x0a1a22 }), -0.05, 0.15, 0.18));
    return g;
  },
  dishwasher: (c) => {
    const g = new THREE.Group();
    g.add(tint(box(0.6, 0.85, 0.6, mat(METAL), 0, 0.42, 0), c));
    g.add(box(0.5, 0.02, 0.02, mat(DARK), 0, 0.75, 0.31));
    return g;
  },
  washing_machine: (c) => {
    const g = new THREE.Group();
    g.add(tint(box(0.6, 0.85, 0.6, mat(WHITE), 0, 0.42, 0), c));
    g.add(cyl(0.2, 0.2, 0.04, mat(DARK), 0, 0.45, 0.31).rotateX(Math.PI / 2) as unknown as THREE.Mesh);
    return g;
  },
  // Freestanding bath — an open shell (4 walls + floor) so it reads as a real
  // basin with water, on a slim plinth, with a chrome mixer at one end.
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
    g.add(box(W - 2 * t, 0.02, D - 2 * t, mat(0xbfe0ea, { transparent: true, opacity: 0.72, roughness: 0.15 }), 0, H - 0.07, 0)); // water
    const chrome = mat(METAL, { metalness: 0.8, roughness: 0.2 });
    g.add(cyl(0.018, 0.022, 0.2, chrome, -W / 2 + 0.16, H + 0.1, -D / 2 + 0.15, 12)); // riser
    g.add(box(0.14, 0.025, 0.028, chrome, -W / 2 + 0.24, H + 0.185, -D / 2 + 0.15)); // spout
    return g;
  },
  // A PAIR of tall dark display cabinets flanking a feature wall — `count`
  // cabinets, `spread` sets the GAP between them WITHOUT resizing each. The
  // backlit glass shelves glow when bound to a light/switch.
  cabinet_pair: (c, opts) => {
    const g = new THREE.Group();
    const count = Math.max(1, Math.min(6, Math.round(opts?.count ?? 2)));
    const spread = opts?.spread ?? 1;
    const gap = 1.7 * spread;
    for (let i = 0; i < count; i++) {
      const u = cabinetUnit(c);
      u.position.x = (i - (count - 1) / 2) * gap;
      g.add(u);
    }
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
  mirror: (c) => {
    const g = new THREE.Group();
    g.add(tint(box(0.6, 0.9, 0.04, mat(METAL), 0, 0, 0), c));
    g.add(box(0.5, 0.8, 0.01, mat(0xaad4e0, { metalness: 0.9, roughness: 0.1 }), 0, 0, 0.03));
    return g;
  },
  plant: (c) => {
    const g = new THREE.Group();
    g.add(cyl(0.16, 0.2, 0.3, mat(0x8a5a30), 0, 0.15, 0));
    g.add(tint(new THREE.Mesh(new THREE.IcosahedronGeometry(0.32, 0), mat(0x3f7d3f)), c).translateY(0.6) as THREE.Mesh);
    return g;
  },
  rug: (c) => {
    const g = new THREE.Group();
    g.add(tint(box(2.0, 0.02, 1.4, mat(0x884444), 0, 0.012, 0), c));
    return g;
  },
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
  // Reception / front desk (Ресепшн) — counter carcass + raised transaction top +
  // a lower inner work surface.
  reception: (c) => {
    const g = new THREE.Group();
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
  // Passenger car (parked under the canopy on the plan).
  car: (c) => {
    const g = new THREE.Group();
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
  // Wall-hung urinal for the WCs (Сан.узел).
  urinal: (c) => {
    const g = new THREE.Group();
    const white = mat(WHITE, { roughness: 0.35 });
    g.add(tint(box(0.36, 0.6, 0.32, white, 0, 0, -0.02), c)); // bowl body
    g.add(tint(cyl(0.18, 0.14, 0.16, white, 0, -0.18, 0.06, 18), c)); // rounded lip
    g.add(box(0.08, 0.12, 0.06, mat(METAL, { metalness: 0.7, roughness: 0.3 }), 0, 0.42, -0.06)); // flush valve
    return g;
  },
  curtain: (c) => {
    // Pleated fabric, slightly off the wall, in two pivot panels named
    // "curtainPivot" so a bound cover entity can slide them open/closed.
    const g = new THREE.Group();
    const W = 1.8, H = 2.2, OFF = 0.03;
    const fabric = mat(0x9a8b76, { roughness: 1 });
    const rod = cyl(0.022, 0.022, W + 0.2, mat(METAL), 0, H + 0.02, OFF, 8);
    rod.rotation.z = Math.PI / 2;
    g.add(rod);
    const panel = (sign: number) => {
      const pivot = new THREE.Group();
      pivot.name = 'curtainPivot';
      pivot.position.x = (sign * W) / 2; // hinge at the outer edge
      const half = W / 2, n = 9, seg = half / n;
      for (let i = 0; i < n; i++) {
        const px = -sign * (i + 0.5) * seg; // pleats run inward
        const wave = i % 2 === 0 ? 0.035 : -0.025;
        pivot.add(tint(box(seg * 0.96, H, 0.05, fabric, px, H / 2, OFF + wave), c));
      }
      return pivot;
    };
    g.add(panel(-1));
    g.add(panel(1));
    return g;
  },
  // Half curtain: ONE panel that slides to a single side (not centre-split).
  curtain_single: (c) => {
    const g = new THREE.Group();
    const W = 1.6, H = 2.2, OFF = 0.03;
    const fabric = mat(0x9a8b76, { roughness: 1 });
    const rod = cyl(0.022, 0.022, W + 0.2, mat(METAL), 0, H + 0.02, OFF, 8);
    rod.rotation.z = Math.PI / 2;
    g.add(rod);
    const pivot = new THREE.Group();
    pivot.name = 'curtainPivot';
    pivot.position.x = -W / 2; // hinge at the left edge → gathers to the left
    const n = 14, seg = W / n;
    for (let i = 0; i < n; i++) {
      const px = (i + 0.5) * seg; // pleats run rightward from the hinge
      const wave = i % 2 === 0 ? 0.035 : -0.025;
      pivot.add(tint(box(seg * 0.96, H, 0.05, fabric, px, H / 2, OFF + wave), c));
    }
    g.add(pivot);
    return g;
  },
  curtain_sheer: (c) => {
    const g = new THREE.Group();
    const W = 1.8, H = 2.2, OFF = 0.03;
    const sheer = mat(0xf2efe9, { transparent: true, opacity: 0.5, roughness: 1 });
    const rod = cyl(0.02, 0.02, W + 0.2, mat(METAL), 0, H + 0.02, OFF, 8);
    rod.rotation.z = Math.PI / 2;
    g.add(rod);
    const panel = (sign: number) => {
      const pivot = new THREE.Group();
      pivot.name = 'curtainPivot';
      pivot.position.x = (sign * W) / 2;
      const half = W / 2, n = 8, seg = half / n;
      for (let i = 0; i < n; i++) {
        const px = -sign * (i + 0.5) * seg;
        pivot.add(tint(box(seg * 0.96, H, 0.03, sheer, px, H / 2, OFF + (i % 2 ? 0.02 : -0.02)), c));
      }
      return pivot;
    };
    g.add(panel(-1));
    g.add(panel(1));
    return g;
  },
  // Half sheer: ONE tulle panel that slides to a single side (not centre-split),
  // the sheer twin of curtain_single.
  curtain_sheer_single: (c) => {
    const g = new THREE.Group();
    const W = 1.6, H = 2.2, OFF = 0.03;
    const sheer = mat(0xf2efe9, { transparent: true, opacity: 0.5, roughness: 1 });
    const rod = cyl(0.02, 0.02, W + 0.2, mat(METAL), 0, H + 0.02, OFF, 8);
    rod.rotation.z = Math.PI / 2;
    g.add(rod);
    const pivot = new THREE.Group();
    pivot.name = 'curtainPivot';
    pivot.position.x = -W / 2; // hinge at the left edge → gathers to the left
    const n = 12, seg = W / n;
    for (let i = 0; i < n; i++) {
      const px = (i + 0.5) * seg;
      pivot.add(tint(box(seg * 0.96, H, 0.03, sheer, px, H / 2, OFF + (i % 2 ? 0.02 : -0.02)), c));
    }
    g.add(pivot);
    return g;
  },
  roller_blind: (c) => {
    // Window roller blind: a roll at top + a panel that "rolls up" (scale.y) via
    // the curtainPivot hook (anchored at the top).
    const g = new THREE.Group();
    const W = 1.4, H = 1.9, OFF = 0.02;
    const roll = cyl(0.05, 0.05, W, mat(0xd8d2c4), 0, H, OFF, 10);
    roll.rotation.z = Math.PI / 2;
    g.add(roll);
    const pivot = new THREE.Group();
    pivot.name = 'curtainPivot';
    pivot.add(tint(box(W, H, 0.02, mat(0xbfae93, { roughness: 1 }), 0, H / 2, OFF), c));
    g.add(pivot);
    return g;
  },
  roman_blind: (c) => {
    const g = new THREE.Group();
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
    return g;
  },
  // Bottom-up venetian blind (jalyuzi) — opens from the BOTTOM upward: the slats
  // retract up into the fixed top headrail. Uses the vertical cover hook
  // 'blindPivotV' (the binding scales it in Y, anchored at the top).
  blind_bottomup: (c) => {
    const g = new THREE.Group();
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
  // A neutral wall switch / control plate. DELIBERATELY has NO 'emissive' mesh and
  // no moving parts, so a bound device NEVER changes its look — no glow, no point
  // light, no spin, no floating label. It is purely a tap target that surfaces the
  // bound device's controls (a switch toggle, a media/AC "pult", a cover) in the 3D
  // UI. entityDomainsFor(wall_switch) restricts binding to the inert behaviours
  // (switch/media_player/climate/cover) precisely so it stays visually static.
  // Centered at local y=0, back at z=0 (surface-mounts flush). 0.13 x 0.13 m.
  wall_switch: (c) => {
    const g = new THREE.Group();
    const W = 0.13, H = 0.13;
    const plate = mat(0xeef0f2, { roughness: 0.5, metalness: 0.08 });
    const surround = mat(0xe4e7ea, { roughness: 0.55 });
    const rocker = mat(0xf7f8fa, { roughness: 0.4 });
    const dot = mat(0x9aa0a6, { roughness: 0.5 }); // neutral indicator — never lights
    g.add(tint(box(W, H, 0.01, plate, 0, 0, 0.005), c));                 // faceplate (back flush at z=0)
    g.add(box(W * 0.9, H * 0.9, 0.014, surround, 0, 0, 0.012));          // inner surround
    g.add(box(W * 0.46, H * 0.74, 0.02, rocker, 0, 0, 0.022));           // rocker paddle
    g.add(box(0.012, 0.012, 0.006, dot, 0, -H * 0.3, 0.026));            // tiny status dot (static)
    return g;
  },
  cooktop: (c) => {
    const g = new THREE.Group();
    g.add(tint(box(0.6, 0.04, 0.52, mat(0x141414, { roughness: 0.3, metalness: 0.2 }), 0, 0.9, 0), c));
    for (const [dx, dz] of [[-0.15, -0.13], [0.15, -0.13], [-0.15, 0.13], [0.15, 0.13]] as const)
      g.add(cyl(0.07, 0.07, 0.006, mat(0x2a2a2a), dx, 0.923, dz, 18));
    return g;
  },
  dish_rack: (c) => {
    const g = new THREE.Group();
    g.add(tint(box(0.42, 0.04, 0.3, mat(METAL, { metalness: 0.5, roughness: 0.4 }), 0, 0.92, 0), c));
    for (let i = 0; i < 5; i++) g.add(box(0.006, 0.16, 0.26, mat(METAL), -0.18 + i * 0.09, 1.0, 0));
    return g;
  },
  // ---- Extra lighting (emissive; bindable as lights) ----
  track_light: (c) => {
    const g = new THREE.Group();
    const rail = box(1.2, 0.05, 0.05, mat(DARK), 0, 0, 0);
    g.add(tint(rail, c));
    for (const x of [-0.4, 0, 0.4]) {
      g.add(box(0.08, 0.1, 0.08, mat(DARK), x, -0.08, 0));
      const bulb = cyl(0.05, 0.06, 0.08, mat(0xfff4d6, { emissive: 0x000000 }), x, -0.16, 0, 12);
      bulb.name = 'emissive';
      g.add(bulb);
    }
    return g;
  },
  lantern: (c) => {
    const g = new THREE.Group();
    g.add(tint(box(0.22, 0.04, 0.22, mat(DARK), 0, 0, 0), c));
    g.add(box(0.22, 0.04, 0.22, mat(DARK), 0, 0.5, 0));
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const)
      g.add(box(0.02, 0.5, 0.02, mat(DARK), sx * 0.1, 0.25, sz * 0.1));
    const glow = box(0.16, 0.42, 0.16, mat(0xfff1c0, { emissive: 0x000000, transparent: true, opacity: 0.85 }), 0, 0.25, 0);
    glow.name = 'emissive';
    g.add(glow);
    return g;
  },
  led_panel: (c) => {
    const g = new THREE.Group();
    g.add(tint(box(0.6, 0.04, 0.6, mat(METAL), 0, 0, 0), c));
    const panel = box(0.56, 0.02, 0.56, mat(0xf7faff, { emissive: 0x000000 }), 0, -0.02, 0);
    panel.name = 'emissive';
    g.add(panel);
    return g;
  },

  // ---- Consolidated fixtures: ONE model + ONE bound entity in place of many
  //      stacked spots/strips. Fewer meshes, one marker, one point light → much
  //      lighter on weak GPUs than 6-8 separate placements. ----
  // A recessed-spot SET (white trims). `count` spots, `spread` widens the
  // spacing WITHOUT resizing each spot. Trims + lenses each merge into one mesh
  // (2 draw calls) — far lighter than placing N separate spots by hand.
  spotlight_bar: (c, opts) => {
    const g = new THREE.Group();
    const count = Math.max(1, Math.min(12, Math.round(opts?.count ?? 6)));
    const spread = opts?.spread ?? 1;
    const rows = count <= 3 ? 1 : 2;
    const cols = Math.ceil(count / rows);
    const dx = 0.32 * spread;
    const dz = 0.26 * spread;
    const trimGeos: THREE.BufferGeometry[] = [];
    const lensGeos: THREE.BufferGeometry[] = [];
    let n = 0;
    for (let r = 0; r < rows && n < count; r++) {
      for (let col = 0; col < cols && n < count; col++, n++) {
        const x = (col - (cols - 1) / 2) * dx;
        const z = rows === 1 ? 0 : (r - (rows - 1) / 2) * dz;
        const t = new THREE.CylinderGeometry(0.07, 0.078, 0.028, 16);
        t.translate(x, 0, z);
        trimGeos.push(t);
        const l = new THREE.CylinderGeometry(0.05, 0.055, 0.02, 16);
        l.translate(x, -0.018, z);
        lensGeos.push(l);
      }
    }
    const trim = new THREE.Mesh(mergeGeometries(trimGeos, false), mat(0xededed, { metalness: 0.15, roughness: 0.6 }));
    trim.castShadow = false;
    trimGeos.forEach((gg) => gg.dispose());
    g.add(trim);
    const lenses = new THREE.Mesh(mergeGeometries(lensGeos, false), mat(0xfff4d6, { emissive: 0x000000 }));
    lenses.name = 'emissive';
    lenses.castShadow = false;
    lensGeos.forEach((gg) => gg.dispose());
    g.add(tint(lenses, c));
    return g;
  },
  // Hollow rectangular LED backlight. `spread` grows the frame (keeps the strip
  // thickness), so the rectangle gets bigger without the border thickening.
  led_backlight: (c, opts) => {
    const s = opts?.spread ?? 1;
    const g = new THREE.Group();
    g.add(tint(ledFrame(1.0 * s, 0.6 * s, 0.06, 0xf2f7ff), c));
    return g;
  },
  // Track light ("rels svet") — long thin frame; `spread` extends its length.
  track_bar: (c, opts) => {
    const s = opts?.spread ?? 1;
    const g = new THREE.Group();
    g.add(tint(ledFrame(1.5 * s, 0.22, 0.045, 0xfff4d6), c));
    return g;
  },
  // Double wall light SET — a pair (default) of modern up/down wall luminaires.
  // `count` fixtures, `spread` sets the GAP between them WITHOUT resizing any of
  // them. Each fixture's up + down glow panels are 'emissive', so binding a
  // light/switch lights the pair together.
  wall_light_double: (c, opts) => {
    const g = new THREE.Group();
    const count = Math.max(1, Math.min(8, Math.round(opts?.count ?? 2)));
    const spread = opts?.spread ?? 1;
    const gap = 0.95 * spread; // centre-to-centre at spread 1
    for (let i = 0; i < count; i++) {
      const u = new THREE.Group();
      u.add(box(0.09, 0.34, 0.07, mat(0x2b2f36, { metalness: 0.5, roughness: 0.4 }), 0, 0, 0)); // slim body
      for (const sy of [0.19, -0.19]) {
        const gl = box(0.06, 0.03, 0.055, mat(0xfff2d6, { emissive: 0x000000 }), 0, sy, 0.02);
        gl.name = 'emissive';
        u.add(tint(gl, c));
      }
      u.position.x = (i - (count - 1) / 2) * gap; // spaced apart, never scaled
      g.add(u);
    }
    return g;
  },
  // Classic wall-sconce SET ("бра") — a pair (default) of brass sconces with an
  // upward shade. `count` fixtures, `spread` sets the GAP; each keeps its size.
  sconce_pair: (c, opts) => {
    const g = new THREE.Group();
    const count = Math.max(1, Math.min(8, Math.round(opts?.count ?? 2)));
    const spread = opts?.spread ?? 1;
    const gap = 0.9 * spread;
    const brass = mat(0xb8935a, { metalness: 0.6, roughness: 0.35 });
    for (let i = 0; i < count; i++) {
      const u = new THREE.Group();
      u.add(box(0.11, 0.12, 0.03, brass, 0, -0.08, 0.015)); // backplate on the wall
      u.add(box(0.03, 0.03, 0.12, brass, 0, -0.04, 0.08));  // arm out into the room
      u.add(box(0.02, 0.16, 0.02, brass, 0, 0.04, 0.13));   // upright stem
      const shade = cyl(0.09, 0.055, 0.14, mat(0xfff4d6, { emissive: 0x000000, transparent: true, opacity: 0.92 }), 0, 0.16, 0.13, 16);
      shade.name = 'emissive';
      u.add(tint(shade, c));
      u.position.x = (i - (count - 1) / 2) * gap;
      g.add(u);
    }
    return g;
  },
  // Rectangular wall sconce ("bra") — a slim vertical luminous bar on the wall.
  wall_sconce: (c) => {
    const g = new THREE.Group();
    g.add(box(0.1, 0.5, 0.1, mat(METAL), 0, 0, 0)); // backplate/body (fixed)
    const glow = box(
      0.06,
      0.44,
      0.05,
      mat(0xfff4d6, { emissive: 0x000000, transparent: true, opacity: 0.92 }),
      0,
      0,
      0.06,
    );
    glow.name = 'emissive';
    g.add(tint(glow, c));
    return g;
  },

  // Rectangular tower air purifier (очиститель воздуха) — floor-standing. The
  // display panel is 'emissive' so it lights when the bound fan/switch is on.
  air_purifier: (c) => {
    const g = new THREE.Group();
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
    const disp = box(0.1, 0.06, 0.006, mat(0x2fd0ff, { emissive: 0x000000 }), 0, 0.03 + H * 0.82, D / 2 + 0.002);
    disp.name = 'emissive';
    g.add(disp);
    return g;
  },

  // ---- SPA / gym / pool (basement plan) ----
  treadmill: (c) => {
    const g = new THREE.Group();
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
    return g;
  },
  exercise_bike: (c) => {
    const g = new THREE.Group();
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
    return g;
  },
  weight_bench: (c) => {
    const g = new THREE.Group();
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
    return g;
  },
  gym_machine: (c) => {
    const g = new THREE.Group();
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
    return g;
  },
  dumbbell_rack: (c) => {
    const g = new THREE.Group();
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
    return g;
  },
  swimming_pool: (c) => {
    const g = new THREE.Group();
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
    return g;
  },
  sauna_bench: (c) => {
    const g = new THREE.Group();
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
    return g;
  },
  sauna_heater: (c) => {
    const g = new THREE.Group();
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
    return g;
  },
  massage_table: (c) => {
    const g = new THREE.Group();
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
    return g;
  },
  barber_chair: (c) => {
    const g = new THREE.Group();
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
    return g;
  },
  prayer_mat: (c) => {
    const g = new THREE.Group();
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
    return g;
  },

  // Generic fallback marker so an unknown model key still renders something.
  painting: (c) => {
    const g = new THREE.Group();
    g.add(tint(box(0.7, 0.5, 0.04, mat(WOOD), 0, 0, 0), c));
    g.add(box(0.6, 0.4, 0.01, mat(0x6688aa), 0, 0, 0.03));
    return g;
  },
  speaker: (c) => {
    const g = new THREE.Group();
    g.add(tint(box(0.25, 0.4, 0.25, mat(DARK), 0, 0.2, 0), c));
    g.add(cyl(0.08, 0.08, 0.01, mat(0x111111), 0, 0.26, 0.13).rotateX(Math.PI / 2) as unknown as THREE.Mesh);
    return g;
  },
  // Flush ceiling speaker (потолочная колонка) — a round grille facing down.
  // Binds to a media_player (or switch); its LED glows when playing.
  ceiling_speaker: (c) => ceilingSpeakerUnit(c),
  // Ceiling-speaker SET — a pair by default; `spread` sets the GAP between the
  // units WITHOUT resizing them, `count` how many.
  ceiling_speaker_double: (c, opts) => {
    const g = new THREE.Group();
    const count = Math.max(1, Math.min(8, Math.round(opts?.count ?? 2)));
    const spread = opts?.spread ?? 1;
    const gap = 1.0 * spread;
    for (let i = 0; i < count; i++) {
      const u = ceilingSpeakerUnit(c);
      u.position.x = (i - (count - 1) / 2) * gap;
      g.add(u);
    }
    return g;
  },
  security_camera: (c) => {
    const g = new THREE.Group();
    g.add(tint(cyl(0.06, 0.06, 0.18, mat(WHITE), 0, 0, 0), c));
    const lens = cyl(0.04, 0.04, 0.04, mat(0x101418, { emissive: 0x300000 }), 0, 0, 0.1);
    lens.name = 'emissive';
    lens.rotateX(Math.PI / 2);
    g.add(lens);
    return g;
  },
  // Panel radiator (радиатор отопления) — sits low against a wall. The front
  // panel is the 'emissive' face: it glows warm when the bound thermostat (or
  // relay switch) is actively heating (hvac_action = heating / switch on).
  radiator: (c) => {
    const g = new THREE.Group();
    const W = 0.9, H = 0.55, D = 0.09;
    const yc = 0.16 + H / 2; // lifted off the floor on feet
    const shell = mat(WHITE, { roughness: 0.55, metalness: 0.1 });
    g.add(tint(box(W, H, D * 0.45, shell, 0, yc, -D * 0.22), c)); // back plate
    const front = box(W, H, D * 0.45, mat(WHITE, { roughness: 0.5, emissive: 0x000000 }), 0, yc, D * 0.22);
    front.name = 'emissive'; // glows warm when heating
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

  // ---- Lighting (освещение) — each has an 'emissive' mesh + reads as a lamp ----
  floor_lamp: (c) => {
    const g = new THREE.Group();
    g.add(cyl(0.18, 0.22, 0.03, mat(METAL), 0, 0.015, 0)); // base
    g.add(cyl(0.02, 0.02, 1.5, mat(METAL), 0, 0.75, 0)); // pole
    const shade = cyl(0.18, 0.25, 0.28, mat(0xfff4d6, { emissive: 0x000000 }), 0, 1.55, 0);
    shade.name = 'emissive';
    g.add(tint(shade, c));
    return g;
  },
  table_lamp: (c) => {
    const g = new THREE.Group();
    g.add(cyl(0.1, 0.12, 0.03, mat(METAL), 0, 0.015, 0));
    g.add(cyl(0.015, 0.015, 0.3, mat(METAL), 0, 0.18, 0));
    const shade = cyl(0.12, 0.16, 0.18, mat(0xfff4d6, { emissive: 0x000000 }), 0, 0.42, 0);
    shade.name = 'emissive';
    g.add(tint(shade, c));
    return g;
  },
  wall_light: (c) => {
    const g = new THREE.Group();
    g.add(box(0.12, 0.2, 0.08, mat(METAL), 0, 0, 0));
    const glow = box(0.1, 0.16, 0.04, mat(0xfff4d6, { emissive: 0x000000 }), 0, 0, 0.06);
    glow.name = 'emissive';
    g.add(tint(glow, c));
    return g;
  },
  // Ornate two-tier candle chandelier. Origin sits at the ceiling mount; the
  // fixture hangs DOWN (negative Y). Candle "flames" are the emissive meshes.
  chandelier: (c) => {
    const g = new THREE.Group();
    const gold = mat(0xd9b863, { metalness: 0.6, roughness: 0.35 });
    const crystal = mat(0xcfe6f5, { transparent: true, opacity: 0.55, roughness: 0.1, metalness: 0.1 });
    const wax = mat(0xf3ead2);
    // Ceiling canopy + drop rod.
    g.add(cyl(0.07, 0.09, 0.04, gold, 0, -0.02, 0));
    g.add(cyl(0.012, 0.012, 0.34, gold, 0, -0.2, 0));
    // Central body (urn) + bottom finial.
    const bodyY = -0.42;
    g.add(cyl(0.05, 0.09, 0.13, gold, 0, bodyY, 0));
    const finial = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), gold);
    finial.position.set(0, bodyY - 0.1, 0);
    g.add(finial);
    // Two tiers of curved arms, each ending in a candle + flame.
    const tiers = [
      { n: 6, r: 0.34, y: bodyY + 0.0, off: 0 },
      { n: 5, r: 0.22, y: bodyY + 0.13, off: 0.4 },
    ];
    for (const t of tiers) {
      for (let i = 0; i < t.n; i++) {
        const a = (i / t.n) * Math.PI * 2 + t.off;
        const cx = Math.cos(a) * t.r;
        const cz = Math.sin(a) * t.r;
        // Arm reaching out from the body.
        const arm = cyl(0.012, 0.012, t.r, gold, cx / 2, t.y, cz / 2);
        arm.rotation.z = Math.PI / 2;
        arm.rotation.y = -a;
        g.add(arm);
        // Cup, candle, flame.
        g.add(cyl(0.035, 0.05, 0.04, gold, cx, t.y - 0.02, cz));
        g.add(cyl(0.02, 0.022, 0.1, wax, cx, t.y + 0.05, cz));
        const flame = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 10), mat(0xfff1c0, { emissive: 0x000000 }));
        flame.name = 'emissive';
        flame.position.set(cx, t.y + 0.12, cz);
        g.add(tint(flame, c));
      }
    }
    // Hanging crystal beads around the outer ring.
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2 + 0.3;
      const bead = new THREE.Mesh(new THREE.OctahedronGeometry(0.03), crystal);
      bead.position.set(Math.cos(a) * 0.33, bodyY - 0.05, Math.sin(a) * 0.33);
      g.add(bead);
    }
    return g;
  },
  // Modern cascading-crystal chandelier: three descending rings dripping with
  // crystals around a central warm glow column (the emissive part).
  crystal_chandelier: (c) => {
    const g = new THREE.Group();
    const gold = mat(0xe6c66e, { metalness: 0.7, roughness: 0.3 });
    const crystal = mat(0xdff0fb, { transparent: true, opacity: 0.5, roughness: 0.05, metalness: 0.2 });
    g.add(cyl(0.06, 0.08, 0.03, gold, 0, -0.015, 0)); // canopy
    g.add(cyl(0.01, 0.01, 0.25, gold, 0, -0.14, 0)); // rod
    const rings = [
      { r: 0.28, y: -0.3 },
      { r: 0.2, y: -0.42 },
      { r: 0.12, y: -0.54 },
    ];
    for (const ring of rings) {
      const torus = new THREE.Mesh(new THREE.TorusGeometry(ring.r, 0.012, 8, 40), gold);
      torus.rotation.x = Math.PI / 2;
      torus.position.y = ring.y;
      g.add(torus);
      const n = Math.max(8, Math.round(ring.r * 36));
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        const bead = new THREE.Mesh(new THREE.OctahedronGeometry(0.022), crystal);
        bead.position.set(Math.cos(a) * ring.r, ring.y - 0.05, Math.sin(a) * ring.r);
        g.add(bead);
      }
    }
    const glow = cyl(0.05, 0.05, 0.42, mat(0xfff3d0, { emissive: 0x000000, transparent: true, opacity: 0.9 }), 0, -0.4, 0, 16);
    glow.name = 'emissive';
    g.add(tint(glow, c));
    return g;
  },
  // A PAIR of chandeliers as a set — `count` fixtures, `spread` sets the GAP
  // between them WITHOUT resizing each (reuses the single-chandelier geometry).
  chandelier_double: (c, opts) => {
    const g = new THREE.Group();
    const count = Math.max(1, Math.min(8, Math.round(opts?.count ?? 2)));
    const spread = opts?.spread ?? 1;
    const gap = 1.4 * spread;
    for (let i = 0; i < count; i++) {
      const u = builders.chandelier(c, opts);
      u.position.x = (i - (count - 1) / 2) * gap;
      g.add(u);
    }
    return g;
  },
  crystal_chandelier_double: (c, opts) => {
    const g = new THREE.Group();
    const count = Math.max(1, Math.min(8, Math.round(opts?.count ?? 2)));
    const spread = opts?.spread ?? 1;
    const gap = 1.3 * spread;
    for (let i = 0; i < count; i++) {
      const u = builders.crystal_chandelier(c, opts);
      u.position.x = (i - (count - 1) / 2) * gap;
      g.add(u);
    }
    return g;
  },
  spotlight: (c) => {
    const g = new THREE.Group();
    g.add(cyl(0.05, 0.07, 0.06, mat(METAL), 0, 0, 0));
    const lens = cyl(0.05, 0.05, 0.01, mat(0xfff4d6, { emissive: 0x000000 }), 0, -0.03, 0);
    lens.name = 'emissive';
    g.add(tint(lens, c));
    return g;
  },
  pendant_light: (c) => {
    const g = new THREE.Group();
    g.add(cyl(0.008, 0.008, 0.4, mat(DARK), 0, 0.2, 0));
    const shade = cyl(0.16, 0.05, 0.2, mat(0xfff4d6, { emissive: 0x000000 }), 0, -0.1, 0);
    shade.name = 'emissive';
    g.add(tint(shade, c));
    return g;
  },
  led_strip: (c) => {
    const g = new THREE.Group();
    const strip = box(1.5, 0.03, 0.04, mat(0xffffff, { emissive: 0x000000 }), 0, 0, 0);
    strip.name = 'emissive';
    g.add(tint(strip, c));
    return g;
  },
  // Twin parallel linear ceiling lights (the two parallel LED lines on the
  // ceiling). Bindable — the 'emissive' strips glow when linked to a light.
  track_double: (c) => {
    const g = new THREE.Group();
    const L = 2.0, sep = 0.5;
    for (const z of [-sep / 2, sep / 2]) {
      g.add(box(L, 0.04, 0.07, mat(DARK, { roughness: 0.7 }), 0, 0, z)); // recessed channel
      const strip = box(L - 0.06, 0.02, 0.035, mat(0xfff4d6, { emissive: 0x000000 }), 0, -0.02, z);
      strip.name = 'emissive';
      g.add(tint(strip, c));
    }
    return g;
  },
  // Vertical wall backlight — a tall glowing reveal in a dark channel (the
  // "vertikal podsvetka"). Bindable to a light; mounts on the wall surface.
  wall_backlight: (c) => {
    const g = new THREE.Group();
    const H = 2.3, y0 = 0.15;
    g.add(box(0.09, H + 0.06, 0.03, mat(0x2f2620, { roughness: 0.9 }), 0, y0 + H / 2, 0)); // channel
    const strip = box(0.05, H, 0.035, mat(0xfff0d0, { emissive: 0x000000 }), 0, y0 + H / 2, 0.02);
    strip.name = 'emissive';
    g.add(tint(strip, c));
    return g;
  },
  // Double vertical wall backlight — a PAIR (default) of the vertical reveals
  // above. `count` strips, `spread` sets the GAP between them WITHOUT resizing
  // any strip. Each strip is 'emissive', so binding a light/switch lights the
  // pair together. Mounts on the wall surface, floor-to-ceiling.
  wall_backlight_double: (c, opts) => {
    const g = new THREE.Group();
    const count = Math.max(1, Math.min(6, Math.round(opts?.count ?? 2)));
    const spread = opts?.spread ?? 1;
    const gap = 0.5 * spread;        // centre-to-centre at spread 1
    const H = 2.3, y0 = 0.15;
    for (let i = 0; i < count; i++) {
      const x = (i - (count - 1) / 2) * gap;
      g.add(box(0.09, H + 0.06, 0.03, mat(0x2f2620, { roughness: 0.9 }), x, y0 + H / 2, 0)); // channel
      const strip = box(0.05, H, 0.035, mat(0xfff0d0, { emissive: 0x000000 }), x, y0 + H / 2, 0.02);
      strip.name = 'emissive';
      g.add(tint(strip, c));
    }
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
  // Built-in TV media wall — wood cabinet + marble centre with a mounted TV,
  // a fluted-wood top border, and a brass-framed glass display niche.
  tv_wall: (c) => {
    const g = new THREE.Group();
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
    return g;
  },
  // Modern L-shaped executive (director's) desk — sculptural solid body with a
  // dark-wood top and a lower side return.
  boss_desk: (c) => {
    const g = new THREE.Group();
    const body = mat(0xcfc9bd, { roughness: 0.5 });
    const top = mat(0x5b3f28, { roughness: 0.4 });
    g.add(box(2.0, 0.05, 0.95, top, 0, 0.76, 0)); // main dark top
    g.add(tint(box(2.1, 0.72, 1.0, body, 0, 0.36, 0.02), c)); // solid body
    g.add(box(1.0, 0.62, 0.05, mat(0x2b2f36, { roughness: 0.8 }), 0, 0.33, -0.42)); // kneehole recess
    g.add(box(1.0, 0.05, 0.6, top, -1.4, 0.66, -0.15)); // L return top
    g.add(tint(box(1.0, 0.62, 0.6, body, -1.4, 0.31, -0.15), c)); // L return body
    return g;
  },

  double_door: (c) => {
    const g = new THREE.Group();
    g.add(tint(box(0.7, 2.0, 0.05, mat(WOOD), -0.36, 1.0, 0), c));
    g.add(tint(box(0.7, 2.0, 0.05, mat(WOOD), 0.36, 1.0, 0), c));
    g.add(cyl(0.025, 0.025, 0.1, mat(METAL), -0.05, 1.0, 0.05));
    g.add(cyl(0.025, 0.025, 0.1, mat(METAL), 0.05, 1.0, 0.05));
    return g;
  },
  // Cottage sectional garage door — opens UPWARD (the panelled door lifts into the
  // headbox). Reuses the vertical cover hook 'blindPivotV' so a bound `cover`
  // entity raises/lowers it; closed = down, open = retracted to the top.
  garage_door: (c) => {
    const g = new THREE.Group();
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
    return g;
  },
  sliding_door: (c) => {
    const g = new THREE.Group();
    g.add(box(1.6, 0.06, 0.08, mat(METAL), 0, 2.05, 0)); // rail
    g.add(tint(box(0.78, 1.95, 0.04, mat(GLASS, { transparent: true, opacity: 0.4 }), -0.4, 1.0, 0), c));
    g.add(tint(box(0.78, 1.95, 0.04, mat(GLASS, { transparent: true, opacity: 0.4 }), 0.4, 1.0, 0.05), c));
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
  bar_stool: (c) => {
    const g = new THREE.Group();
    g.add(tint(cyl(0.18, 0.18, 0.05, mat(WOOD), 0, 0.66, 0), c));
    g.add(cyl(0.03, 0.03, 0.66, mat(METAL), 0, 0.33, 0));
    g.add(cyl(0.2, 0.2, 0.02, mat(METAL), 0, 0.02, 0));
    return g;
  },
  tv_stand: (c) => {
    const g = new THREE.Group();
    g.add(tint(box(1.4, 0.4, 0.4, mat(DARK), 0, 0.2, 0), c));
    g.add(box(0.6, 0.02, 0.36, mat(METAL), -0.35, 0.41, 0));
    return g;
  },
  kitchen_island: (c) => {
    const g = new THREE.Group();
    g.add(tint(box(1.6, 0.9, 0.9, mat(WHITE), 0, 0.45, 0), c));
    g.add(box(1.7, 0.05, 1.0, mat(DARK), 0, 0.92, 0)); // worktop
    return g;
  },
  sideboard: (c) => {
    const g = new THREE.Group();
    g.add(tint(box(1.6, 0.8, 0.45, mat(WOOD), 0, 0.4, 0), c));
    for (let i = -1; i <= 1; i++) g.add(box(0.02, 0.1, 0.02, mat(METAL), i * 0.5, 0.5, 0.23));
    return g;
  },
  bunk_bed: (c) => {
    const g = new THREE.Group();
    for (const y of [0.4, 1.4]) {
      g.add(box(1.0, 0.12, 2.0, mat(WOOD), 0, y, 0));
      g.add(tint(box(0.95, 0.12, 1.95, mat(WHITE), 0, y + 0.12, 0), c));
    }
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const)
      g.add(box(0.08, 1.9, 0.08, mat(WOOD), sx * 0.46, 0.95, sz * 0.96));
    return g;
  },
  bar_counter: (c) => {
    const g = new THREE.Group();
    g.add(tint(box(2.0, 1.05, 0.55, mat(WOOD), 0, 0.525, 0), c));
    g.add(box(2.1, 0.05, 0.65, mat(DARK), 0, 1.07, 0));
    return g;
  },
  piano: (c) => {
    const g = new THREE.Group();
    g.add(tint(box(1.5, 0.9, 0.6, mat(0x16181c), 0, 0.45, 0), c));
    g.add(box(1.4, 0.06, 0.25, mat(WHITE), 0, 0.78, 0.18)); // keys
    return g;
  },
  range_hood: (c) => {
    const g = new THREE.Group();
    g.add(tint(box(0.9, 0.25, 0.5, mat(METAL), 0, 0, 0), c));
    g.add(box(0.3, 0.4, 0.3, mat(METAL), 0, 0.3, 0));
    return g;
  },
  wall_clock: (c) => {
    const g = new THREE.Group();
    const face = cyl(0.18, 0.18, 0.04, mat(WHITE), 0, 0, 0, 24);
    face.rotateX(Math.PI / 2);
    g.add(tint(face, c));
    return g;
  },

  patio_door: (c) => {
    // Wide floor-to-ceiling terrace door / glass wall (built from the floor up).
    const g = new THREE.Group();
    const fr = mat(0x55606a);
    const W = 2.6, H = 2.2, fw = 0.08, d = 0.1;
    g.add(tint(box(W, fw, d, fr, 0, H - fw / 2, 0), c));
    g.add(box(W, fw, d, fr, 0, fw / 2, 0));
    g.add(box(fw, H, d, fr, -W / 2 + fw / 2, H / 2, 0));
    g.add(box(fw, H, d, fr, W / 2 - fw / 2, H / 2, 0));
    g.add(box(0.06, H, d * 0.6, fr, -W / 6, H / 2, 0)); // mullions → 3 panes
    g.add(box(0.06, H, d * 0.6, fr, W / 6, H / 2, 0));
    g.add(box(W - fw, H - fw, 0.02, mat(0x9cc7da, { transparent: true, opacity: 0.42, metalness: 0.2 }), 0, H / 2, 0));
    return g;
  },
  terrace_window: (c) => {
    // Wide panoramic window, centered at local y=0 (placed at defaultY).
    const g = new THREE.Group();
    const fr = mat(0x55606a);
    const W = 2.6, H = 1.5, fw = 0.07, d = 0.1;
    g.add(tint(box(W, fw, d, fr, 0, H / 2, 0), c));
    g.add(box(W, fw, d, fr, 0, -H / 2, 0));
    g.add(box(fw, H, d, fr, -W / 2 + fw / 2, 0, 0));
    g.add(box(fw, H, d, fr, W / 2 - fw / 2, 0, 0));
    g.add(box(0.05, H, d * 0.6, fr, -W / 4, 0, 0)); // mullions → 3 panes
    g.add(box(0.05, H, d * 0.6, fr, W / 4, 0, 0));
    g.add(box(W - fw, H - fw, 0.02, mat(0x9cc7da, { transparent: true, opacity: 0.45 }), 0, 0, 0));
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
  // Floor-to-ceiling terrace WINDOW (mullioned, no door) — a black-framed
  // panoramic window. Placed like the other glazing (cuts a real opening).
  terrace_window_full: (c) => {
    const g = new THREE.Group();
    const fr = mat(0x2c3138, { roughness: 0.5 });
    const W = 2.6, H = 2.55, fw = 0.08, d = 0.1;
    g.add(tint(box(W, fw, d, fr, 0, H - fw / 2, 0), c)); // top
    g.add(box(W, fw, d, fr, 0, fw / 2, 0)); // bottom sill
    g.add(box(fw, H, d, fr, -W / 2 + fw / 2, H / 2, 0)); // left
    g.add(box(fw, H, d, fr, W / 2 - fw / 2, H / 2, 0)); // right
    for (let i = 1; i < 3; i++) g.add(box(0.05, H, d * 0.6, fr, -W / 2 + (W * i) / 3, H / 2, 0)); // vertical mullions
    g.add(box(W - fw, 0.05, d * 0.6, fr, 0, H * 0.74, 0)); // horizontal transom
    g.add(box(W - fw, H - fw, 0.02, mat(0x9cc7da, { transparent: true, opacity: 0.38, metalness: 0.2 }), 0, H / 2, 0));
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

  // ---- Kitchen ----
  oven: (c) => {
    const g = new THREE.Group();
    g.add(tint(box(0.6, 0.9, 0.6, mat(METAL, { metalness: 0.6, roughness: 0.4 }), 0, 0.45, 0), c));
    g.add(box(0.5, 0.5, 0.02, mat(0x111417, { metalness: 0.3 }), 0, 0.5, 0.3)); // glass door
    g.add(box(0.5, 0.06, 0.04, mat(DARK), 0, 0.78, 0.31)); // handle
    for (const x of [-0.18, -0.06, 0.06, 0.18]) g.add(cyl(0.03, 0.03, 0.04, mat(DARK), x, 0.86, 0.31, 12));
    return g;
  },
  kettle: (c) => {
    const g = new THREE.Group();
    g.add(cyl(0.11, 0.11, 0.03, mat(DARK), 0, 0.015, 0, 18));
    g.add(tint(cyl(0.09, 0.11, 0.2, mat(METAL, { metalness: 0.5, roughness: 0.3 }), 0, 0.12, 0, 18), c));
    g.add(box(0.04, 0.14, 0.04, mat(DARK), 0, 0.18, -0.11));
    return g;
  },
  coffee_machine: (c) => {
    const g = new THREE.Group();
    g.add(tint(box(0.26, 0.36, 0.3, mat(DARK), 0, 0.18, 0), c));
    g.add(box(0.2, 0.05, 0.06, mat(METAL), 0, 0.12, 0.16));
    g.add(cyl(0.05, 0.05, 0.08, mat(0x6b4a2f), 0, 0.05, 0.13, 12));
    return g;
  },
  toaster: (c) => {
    const g = new THREE.Group();
    g.add(tint(box(0.3, 0.18, 0.16, mat(METAL, { metalness: 0.6, roughness: 0.3 }), 0, 0.09, 0), c));
    g.add(box(0.22, 0.02, 0.02, mat(DARK), 0, 0.19, 0));
    return g;
  },
  blender: (c) => {
    const g = new THREE.Group();
    g.add(box(0.15, 0.1, 0.15, mat(DARK), 0, 0.05, 0));
    g.add(tint(cyl(0.07, 0.06, 0.22, mat(GLASS, { transparent: true, opacity: 0.5 }), 0, 0.21, 0, 14), c));
    return g;
  },
  trash_can: (c) => {
    const g = new THREE.Group();
    g.add(tint(cyl(0.18, 0.16, 0.5, mat(METAL, { metalness: 0.5, roughness: 0.4 }), 0, 0.25, 0, 20), c));
    g.add(cyl(0.19, 0.19, 0.03, mat(METAL, { metalness: 0.5 }), 0, 0.51, 0, 20));
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
  console_table: (c) => {
    const g = new THREE.Group();
    const w = mat(WOOD);
    g.add(tint(box(1.2, 0.05, 0.4, w, 0, 0.8, 0), c));
    for (const sx of [-1, 1]) g.add(box(0.06, 0.8, 0.36, w, sx * 0.55, 0.4, 0));
    g.add(box(1.1, 0.04, 0.36, w, 0, 0.4, 0));
    return g;
  },
  fireplace: (c) => {
    const g = new THREE.Group();
    const stone = mat(0x8a8a86, { roughness: 1 });
    g.add(tint(box(1.4, 1.2, 0.4, stone, 0, 0.6, 0), c));
    g.add(box(0.9, 0.7, 0.26, mat(0x141414), 0, 0.5, 0.1));
    g.add(box(0.74, 0.36, 0.18, mat(0xff7a30, { emissive: 0xff5a1a }), 0, 0.4, 0.14)); // fire glow
    g.add(box(1.5, 0.1, 0.5, stone, 0, 1.22, 0)); // mantel
    return g;
  },
  floor_vase: (c) => {
    const g = new THREE.Group();
    g.add(tint(cyl(0.1, 0.18, 0.7, mat(0xb5651d), 0, 0.35, 0, 20), c));
    g.add(cyl(0.12, 0.1, 0.08, mat(0xb5651d), 0, 0.74, 0, 20));
    for (const dx of [-0.05, 0.05, 0]) g.add(box(0.012, 0.5, 0.012, mat(0x3a6b3a), dx, 1.0, 0));
    return g;
  },
  aquarium: (c) => {
    const g = new THREE.Group();
    g.add(box(1.0, 0.5, 0.4, mat(WOOD), 0, 0.25, 0)); // stand
    g.add(box(0.95, 0.18, 0.38, mat(0x2a6fa0, { transparent: true, opacity: 0.55 }), 0, 0.62, 0)); // water
    g.add(tint(box(0.96, 0.46, 0.39, mat(GLASS, { transparent: true, opacity: 0.28, metalness: 0.1 }), 0, 0.73, 0), c));
    return g;
  },
  pool_table: (c) => {
    const g = new THREE.Group();
    g.add(box(2.1, 0.16, 1.2, mat(WOOD), 0, 0.68, 0)); // rails
    g.add(tint(box(1.96, 0.06, 1.06, mat(0x1f7a3d), 0, 0.79, 0), c)); // felt
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const)
      g.add(box(0.14, 0.6, 0.14, mat(WOOD), sx * 0.95, 0.3, sz * 0.5));
    return g;
  },
  // ---- Bedroom ----
  crib: (c) => {
    const g = new THREE.Group();
    const w = mat(WHITE);
    g.add(tint(box(0.66, 0.1, 1.16, w, 0, 0.5, 0), c));
    for (const sz of [-1, 1]) g.add(box(0.7, 0.5, 0.04, w, 0, 0.65, sz * 0.58));
    for (const sx of [-1, 1]) g.add(box(0.04, 0.5, 1.2, w, sx * 0.33, 0.65, 0));
    return g;
  },
  vanity: (c) => {
    const g = new THREE.Group();
    const w = mat(WHITE);
    g.add(tint(box(1.0, 0.05, 0.45, w, 0, 0.78, 0), c));
    for (const sx of [-1, 1]) g.add(box(0.36, 0.78, 0.42, w, sx * 0.3, 0.39, 0));
    g.add(box(0.66, 0.66, 0.04, w, 0, 1.2, -0.22)); // mirror frame
    g.add(box(0.6, 0.6, 0.02, mat(0xcfe0e6, { metalness: 0.4, roughness: 0.1 }), 0, 1.2, -0.2));
    return g;
  },
  bench: (c) => {
    const g = new THREE.Group();
    const w = mat(WOOD);
    g.add(tint(box(1.1, 0.1, 0.4, mat(FABRIC), 0, 0.45, 0), c));
    for (const sx of [-1, 1]) g.add(box(0.06, 0.45, 0.36, w, sx * 0.5, 0.225, 0));
    return g;
  },
  ceiling_fan: (c) => {
    const g = new THREE.Group();
    g.add(cyl(0.1, 0.1, 0.1, mat(METAL), 0, 0, 0, 16));
    g.add(tint(box(1.4, 0.02, 0.18, mat(WOOD), 0, -0.02, 0), c));
    g.add(tint(box(0.18, 0.02, 1.4, mat(WOOD), 0, -0.02, 0), c));
    g.add(cyl(0.04, 0.04, 0.22, mat(METAL), 0, 0.14, 0, 10));
    return g;
  },
  // Small round ceiling exhaust vent (extractor). Sits flush under the ceiling;
  // bind a fan.* entity and the whole grille spins while the fan is ON.
  ceiling_vent: (c) => {
    const g = new THREE.Group();
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
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      const b = box(0.15, 0.006, 0.05, blade, Math.cos(a) * 0.11, -0.062, Math.sin(a) * 0.11);
      b.rotation.y = -a;
      g.add(b);
    }
    return g;
  },
  // Underfloor heating mat (тёплый пол) — lies flat on the floor; the serpentine
  // heating loop glows when the heater is ON (bind climate/switch).
  warm_floor: (c) => {
    const g = new THREE.Group();
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
      const bar = box(xR - xL, 0.02, 0.035, coil, 0, 0.02, z0 + i * dz);
      bar.name = 'emissive';
      g.add(bar);
    }
    for (let i = 0; i < rows - 1; i++) {
      const ex = i % 2 === 0 ? xR : xL;
      const b = box(0.035, 0.02, dz, coil, ex, 0.02, z0 + i * dz + dz / 2);
      b.name = 'emissive';
      g.add(b);
    }
    return g;
  },
  // In-floor trench convector (конвектор) — a recessed linear grille FLUSH with
  // the floor (like the warm-floor mat), usually along a window. The grille bars
  // glow warm when the heater is ON (bind climate/switch/fan).
  convector: (c) => {
    const g = new THREE.Group();
    const W = 1.0;
    const D = 0.18;
    // Recessed metal frame, sitting flush at floor level.
    g.add(tint(box(W, 0.04, D, mat(0x9aa0a6, { metalness: 0.55, roughness: 0.35 }), 0, 0.02, 0), c));
    // Linear grille bars across the trench.
    const bar = mat(0xd98a5a, { metalness: 0.3, roughness: 0.5 });
    const n = 16;
    for (let i = 0; i < n; i++) {
      const x = -W / 2 + 0.05 + (i / (n - 1)) * (W - 0.1);
      const b = box(0.018, 0.02, D - 0.05, bar, x, 0.035, 0);
      b.name = 'emissive';
      g.add(b);
    }
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
  // ---- Office ----
  filing_cabinet: (c) => {
    const g = new THREE.Group();
    g.add(tint(box(0.45, 1.0, 0.55, mat(METAL, { metalness: 0.4, roughness: 0.5 }), 0, 0.5, 0), c));
    for (const y of [0.25, 0.5, 0.75]) g.add(box(0.4, 0.02, 0.02, mat(DARK), 0, y, 0.28));
    return g;
  },
  monitor: (c) => {
    const g = new THREE.Group();
    g.add(tint(box(0.5, 0.32, 0.03, mat(DARK), 0, 0.45, 0), c));
    g.add(box(0.46, 0.28, 0.01, mat(0x0a0a0a, { emissive: 0x10131a }), 0, 0.45, 0.02));
    g.add(cyl(0.03, 0.03, 0.18, mat(DARK), 0, 0.3, -0.02, 10));
    g.add(box(0.2, 0.02, 0.14, mat(DARK), 0, 0.21, -0.02));
    return g;
  },
  printer: (c) => {
    const g = new THREE.Group();
    g.add(tint(box(0.45, 0.3, 0.4, mat(WHITE), 0, 0.15, 0), c));
    g.add(box(0.4, 0.02, 0.3, mat(DARK), 0, 0.31, 0));
    g.add(box(0.34, 0.04, 0.08, mat(0xddddee), 0, 0.3, 0.12));
    return g;
  },
  whiteboard: (c) => {
    const g = new THREE.Group();
    g.add(tint(box(1.26, 0.86, 0.02, mat(METAL), 0, 0, 0), c));
    g.add(box(1.2, 0.8, 0.02, mat(0xf6f6f6), 0, 0, 0.02));
    g.add(box(0.4, 0.03, 0.06, mat(METAL), 0, -0.36, 0.05));
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
  water_heater: (c) => {
    const g = new THREE.Group();
    g.add(tint(cyl(0.25, 0.25, 0.9, mat(WHITE), 0, 0.45, 0, 20), c));
    g.add(cyl(0.25, 0.25, 0.05, mat(METAL), 0, 0.9, 0, 20));
    g.add(box(0.1, 0.1, 0.1, mat(METAL), 0, 0.2, 0.26));
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
  vase: (c) => {
    const g = new THREE.Group();
    g.add(tint(cyl(0.06, 0.1, 0.28, mat(0xdfe6ea, { metalness: 0.1, roughness: 0.3 }), 0, 0.14, 0, 18), c));
    for (const dx of [-0.03, 0.03, 0]) g.add(box(0.01, 0.3, 0.01, mat(0x3a6b3a), dx, 0.4, 0));
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
  conference_table: (c) => {
    const g = new THREE.Group();
    const L = 6.8, W = 1.4; // long boardroom footprint (length on X, width on Z)
    const veneer = mat(WOOD, { roughness: 0.45 });
    const bandMat = mat(0x6f4a28, { roughness: 0.55 }); // darker edge band / plinths
    const inlayMat = mat(0x4a3218, { roughness: 0.4 }); // subtle contrast inlay
    const portMat = mat(DARK, { roughness: 0.4, metalness: 0.45 }); // cable/port boxes
    const glow = mat(0x101418, { emissive: 0x0a1a22 }); // recessed port faces
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
      g.add(box(0.3, 0.01, 0.16, glow, px, 0.772, 0)); // recessed port face
    }
    return g;
  },
  executive_desk: (c) => {
    const g = new THREE.Group();
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
    return g;
  },
  tree: (c) => {
    const g = new THREE.Group();
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
    return g;
  },
  shrub: (c) => {
    const g = new THREE.Group();
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

  marker: (c) => {
    const g = new THREE.Group();
    g.add(tint(cyl(0, 0.12, 0.3, mat(0xff5555), 0, 0.15, 0, 8), c));
    return g;
  },
};

export const FURNITURE_KEYS = Object.keys(builders).filter((k) => k !== 'marker');

/** Models that should auto-attach to a wall when placed (snap + orient). */
export const WALL_MOUNT_KEYS = [
  'door', 'double_door', 'sliding_door', 'window_frame', 'patio_door',
  'terrace_window', 'tv', 'painting', 'mirror', 'wall_light', 'wall_clock',
  'ac_unit', 'intercom', 'security_camera', 'curtain', 'range_hood',
  'towel_rack', 'bathroom_cabinet', 'whiteboard', 'wall_shelf',
  'curtain_sheer', 'curtain_sheer_single', 'roller_blind', 'roman_blind', 'wall_cabinet', 'wall_sconce',
  'curtain_single', 'urinal', 'sink_double', 'blind_bottomup', 'garage_door',
  'wood_slat_panel', 'wall_backlight', 'tall_cabinet', 'terrace_window_full', 'climbing_wall',
  'wall_light_double', 'sconce_pair', 'glass_wall_cabinet', 'wall_backlight_double', 'wall_switch',
];
export function isWallMount(model: string): boolean {
  return WALL_MOUNT_KEYS.includes(model);
}

/** Wall-mount models that sit ON the room-side surface of the wall (offset out
 *  so they're not buried in the wall). Doors/windows/curtains sit in-plane. */
export const SURFACE_MOUNT_KEYS = [
  'tv', 'painting', 'mirror', 'wall_light', 'wall_clock', 'ac_unit',
  'intercom', 'security_camera', 'range_hood', 'terrace_window',
  'towel_rack', 'bathroom_cabinet', 'whiteboard', 'wall_shelf', 'wall_cabinet',
  'curtain', 'curtain_sheer', 'curtain_sheer_single', 'roller_blind', 'roman_blind', 'wall_sconce',
  'curtain_single', 'urinal', 'sink_double', 'blind_bottomup',
  'wood_slat_panel', 'wall_backlight', 'tall_cabinet', 'terrace_window_full', 'climbing_wall',
  'wall_light_double', 'sconce_pair', 'glass_wall_cabinet', 'wall_backlight_double', 'wall_switch',
];
export function isSurfaceMount(model: string): boolean {
  return SURFACE_MOUNT_KEYS.includes(model);
}

/** Lighting fixtures (have an emissive mesh; bind a light.* entity to them). */
export const LIGHT_KEYS = [
  'ceiling_light',
  'floor_lamp',
  'table_lamp',
  'wall_light',
  'chandelier',
  'crystal_chandelier',
  'spotlight',
  'pendant_light',
  'led_strip',
  'track_light',
  'lantern',
  'led_panel',
  'spotlight_bar',
  'led_backlight',
  'track_bar',
  'wall_sconce',
  'track_double',
  'wall_backlight',
  'wall_light_double',
  'sconce_pair',
  'chandelier_double',
  'crystal_chandelier_double',
  'cabinet_pair',
  'wall_backlight_double',
];

/**
 * Likely Home Assistant entity domains for a furniture model, used to filter the
 * entity picker when binding (so selecting a lamp offers light.* entities, an AC
 * offers climate.*, a TV offers media_player, a curtain offers cover, …).
 * Returns [] to mean "no filter — show all entities".
 */
export function entityDomainsFor(model: string): string[] {
  if (LIGHT_KEYS.includes(model)) return ['light', 'switch'];
  switch (model) {
    case 'ac_unit':
    case 'convector':
      return ['climate', 'fan', 'switch'];
    case 'warm_floor':
    case 'radiator':
      return ['climate', 'switch'];
    case 'niche_shelf_wall':
    case 'feature_wall':
    case 'glass_wall_cabinet':
      return ['light', 'switch']; // the cove-light strips glow when bound
    case 'wall_switch':
      // A neutral control anchor: allow ONLY behaviours that cause no visual
      // change on an emissive-less model (a switch toggle, a media/AC "pult", a
      // cover). Excludes light (adds a point light), fan (spins), sensor/
      // binary_sensor/lock (float a label) — so the plate never reacts on state.
      return ['switch', 'media_player', 'climate', 'cover'];

    case 'ceiling_fan':
    case 'ceiling_vent':
      return ['fan', 'switch'];
    case 'wardrobe_lit':
      return ['light', 'switch'];
    case 'tv':
    case 'tv_stand':
      return ['media_player', 'switch'];
    case 'speaker':
    case 'ceiling_speaker':
    case 'ceiling_speaker_double':
      return ['media_player', 'switch'];
    case 'air_purifier':
      return ['fan', 'switch'];
    case 'curtain':
    case 'curtain_single':
    case 'curtain_sheer':
    case 'curtain_sheer_single':
    case 'roller_blind':
    case 'roman_blind':
    case 'blind_bottomup':
    case 'garage_door':
      return ['cover'];
    case 'door':
    case 'double_door':
    case 'sliding_door':
      return ['lock', 'cover', 'binary_sensor'];
    case 'security_camera':
      return ['camera', 'binary_sensor'];
    case 'intercom':
      return ['camera', 'lock', 'binary_sensor'];
    case 'fridge':
    case 'washing_machine':
    case 'dishwasher':
    case 'stove':
    case 'oven':
    case 'microwave':
      return ['switch', 'sensor', 'binary_sensor'];
    case 'toilet':
    case 'bathtub':
    case 'shower':
    case 'sink':
      return ['sensor', 'binary_sensor', 'switch'];
    default:
      return [];
  }
}

/** Default vertical offset (meters) so a placed piece sits naturally. Lights
 *  default to near the ceiling; everything else on the floor. */
export function defaultY(model: string, wallHeight = 2.6): number {
  if (
    model === 'ceiling_light' ||
    model === 'chandelier' ||
    model === 'crystal_chandelier' ||
    model === 'chandelier_double' ||
    model === 'crystal_chandelier_double' ||
    model === 'pendant_light'
  )
    return wallHeight - 0.05;
  if (
    model === 'spotlight' ||
    model === 'led_strip' ||
    model === 'led_panel' ||
    model === 'track_light' ||
    model === 'spotlight_bar' ||
    model === 'led_backlight' ||
    model === 'track_bar' ||
    model === 'track_double' ||
    model === 'ceiling_speaker' ||
    model === 'ceiling_speaker_double'
  )
    return wallHeight - 0.02;
  if (model === 'wall_sconce' || model === 'sconce_pair') return 1.6;
  if (model === 'wall_light_double') return 1.8;
  if (model === 'ceiling_fan') return wallHeight - 0.25;
  if (model === 'ceiling_vent') return wallHeight - 0.02;
  if (model === 'wall_cabinet') return 1.55;
  if (model === 'glass_wall_cabinet') return 1.4; // upper cabinet, origin at its base
  if (model === 'wall_switch') return 1.15;       // switch height, centered at origin
  if (model === 'wall_light' || model === 'ac_unit' || model === 'security_camera') return 2.0;
  if (model === 'bathroom_cabinet' || model === 'whiteboard') return 1.5;
  if (model === 'wall_shelf') return 1.4;
  if (model === 'painting' || model === 'mirror' || model === 'tv' || model === 'intercom') return 1.4;
  if (model === 'towel_rack') return 1.1;
  if (model === 'terrace_window') return 1.2;
  if (model === 'wall_clock') return 1.7;
  if (model === 'range_hood') return 1.6;
  if (model === 'curtain' || model === 'curtain_single' || model === 'curtain_sheer' || model === 'curtain_sheer_single' || model === 'roller_blind' || model === 'roman_blind' || model === 'blind_bottomup') return 0.1;
  if (model === 'urinal') return 0.55;
  if (model === 'sink_double') return 0.8;
  return 0;
}

/**
 * Realistic default tint per model, so a freshly-placed piece (and its palette
 * thumbnail) looks natural instead of flat white. The builder tints its main
 * surface with this; fixed materials (wood frames, metal legs, glass) keep their
 * own look. The user can still override the color per placement.
 */
const DEFAULT_COLORS: Record<string, string> = {
  // Upholstery / fabric
  sofa: '#7d8a99', sofa_round: '#7d8a99', armchair: '#8a7c72', recliner: '#6b7682',
  ottoman: '#8a7c72', bench: '#9a8c7c',
  // Beds / soft
  bed: '#e9e4da', bunk_bed: '#e3ded4', crib: '#e9e4da',
  // Wood furniture
  table: '#9c6b3f', dining_table: '#9c6b3f', coffee_table: '#9c6b3f',
  console_table: '#9c6b3f', desk: '#9c6b3f', chair: '#9c6b3f', office_chair: '#3a3e44',
  bar_stool: '#9c6b3f', stairs: '#b08a5a', stairs_down: '#b08a5a', wall_shelf: '#9c6b3f', door: '#9c6b3f',
  swing: '#8a6a4a', slide: '#dcc5a0', round_table: '#e9e2d5', roly_chair: '#9aa878',
  stairs_switchback: '#b08a5a', stairs_flat: '#9c6b3f', column_sq: '#d8d2c6', column_round: '#d8d2c6',
  elevator: '#e8eaec', reception: '#9c6b3f', canopy: '#d8d8dc', car: '#30506e', porch: '#d7d2c8',
  double_door: '#9c6b3f', sliding_door: '#b8c4cc', // sliding door's tinted part is glass → keep it glassy
  // Cabinetry (darker wood)
  wardrobe: '#8a5a34', wardrobe_glass: '#7a4f2e', wardrobe_lit: '#7a4f2e',
  display_cabinet: '#7a4f2e', shelving_unit: '#8a5a34', dresser: '#8a5a34',
  nightstand: '#8a5a34', sideboard: '#8a5a34', bookshelf: '#8a5a34',
  filing_cabinet: '#7a8088', shoe_rack: '#8a5a34', tv_stand: '#5b3f28',
  vanity: '#cdbba8', wine_rack: '#7a4f2e', coat_rack: '#8a5a34', books: '#8a5a34',
  // Kitchen
  kitchen_counter: '#ececec', kitchen_island: '#ececec', wall_cabinet: '#eceae6',
  bar_counter: '#caa37a', cooktop: '#2b2f36',
  // Appliances (stainless / white goods)
  fridge: '#c6cace', washing_machine: '#dfe3e6', dishwasher: '#c6cace',
  oven: '#c6cace', microwave: '#cfd3d7', stove: '#c6cace', dryer: '#dfe3e6',
  range_hood: '#c6cace', dish_rack: '#cfd3d7', kettle: '#cfd3d7', toaster: '#cfd3d7',
  blender: '#cfd3d7', coffee_machine: '#3a3e44', water_heater: '#e8eaec',
  // Bathroom (porcelain)
  sink: '#f2f5f6', toilet: '#f2f5f6', bathtub: '#f2f5f6', shower: '#dfe7ea', bidet: '#f2f5f6', urinal: '#f2f5f6',
  // Decor / soft furnishings
  plant: '#3f8f4f', rug: '#b5563a', floor_vase: '#b0764a', vase: '#b0764a',
  painting: '#cfc2a8', mirror: '#bcc8cc', wall_clock: '#f0f0f0', whiteboard: '#f4f6f8',
  curtain: '#cdd3da', curtain_single: '#cdd3da', curtain_sheer: '#e6ecf2', curtain_sheer_single: '#e6ecf2', roller_blind: '#d6dadf', roman_blind: '#cdd3da', blind_bottomup: '#cbb79c', garage_door: '#f2f0ea',
  towel_rack: '#d0d4d8', bathroom_cabinet: '#e8eaec', trash_can: '#9aa0a6',
  // Statement / misc
  piano: '#1b1d22', pool_table: '#2e6b3f', aquarium: '#6fb6c8', fireplace: '#3a3a3a',
  radiator: '#eeeeee', arch_shelf_wall: '#f4f2ee', niche_shelf_wall: '#f0eee9', feature_wall: '#6f4326',
  tv: '#15171a', monitor: '#15171a', printer: '#3a3e44',
  speaker: '#2b2f36', ceiling_speaker: '#eef0f2', ceiling_speaker_double: '#eef0f2', air_purifier: '#f2f2f2',
  treadmill: '#454b54', exercise_bike: '#8a8f96', weight_bench: '#8a2f2f', gym_machine: '#5b6470', dumbbell_rack: '#8a8f96', swimming_pool: '#c9c3b3', sauna_bench: '#b5824a', sauna_heater: '#8a8f96', massage_table: '#7b8fa1', barber_chair: '#3f6f8c', prayer_mat: '#3f6d5a',
  ac_unit: '#f0f2f4', security_camera: '#d8dce0', intercom: '#d8dce0',
  wall_panel: '#d8d2c6', arch: '#d8d2c6', ceiling_fan: '#d8d8d8', ceiling_vent: '#eaecee',
  warm_floor: '#b98f7d', convector: '#9aa0a6',
  window_frame: '#e8e8e8', terrace_window: '#e8e8e8', patio_door: '#e8e8e8', terrace_wall: '#dfe6ea',
  terrace_window_full: '#2c3138', tall_cabinet: '#9c6b3f', tv_console: '#9c6b3f', climbing_wall: '#cbb089',
  // Lighting (warm shades)
  floor_lamp: '#fff4d6', table_lamp: '#fff4d6', wall_light: '#fff4d6',
  ceiling_light: '#fff4d6', pendant_light: '#fff4d6', lantern: '#fff4d6',
  chandelier: '#f3e6c0', crystal_chandelier: '#eaf2fb', spotlight: '#fff4d6',
  chandelier_double: '#f3e6c0', crystal_chandelier_double: '#eaf2fb', cabinet_pair: '#1a1712',
  track_light: '#fff4d6', led_panel: '#f7faff', led_strip: '#ffffff',
  spotlight_bar: '#fff4d6', led_backlight: '#f2f7ff', track_bar: '#fff4d6', wall_sconce: '#fff2d6',
  wall_light_double: '#fff2d6', sconce_pair: '#fff4d6',
  track_double: '#fff4d6', wall_backlight: '#fff0d0', wall_backlight_double: '#fff0d0', glass_wall_cabinet: '#1c2622', wall_switch: '#eef0f2', wood_slat_panel: '#9c6b3f', tv_wall: '#9c6b3f', boss_desk: '#cfc9bd',
  sofa_l: '#7d8a99', sofa_u: '#6f7d8c', conference_chair: '#454b54', tub_chair: '#a89a86', conference_table: '#9c6b3f', executive_desk: '#6e4a2f', tree: '#3f7d3f', shrub: '#4a7d3a', sink_double: '#eceff1',
};

/** Realistic default color for a model (neutral grey when unspecified). */
export function defaultColor(model: string): string {
  return DEFAULT_COLORS[model] ?? '#c9cdd2';
}

/** Light "set" models whose Spread/Count are adjustable (spacing, not stretch). */
export const SET_LIGHT_KEYS = ['spotlight_bar', 'led_backlight', 'track_bar', 'wall_light_double', 'sconce_pair', 'ceiling_speaker_double', 'chandelier_double', 'crystal_chandelier_double', 'cabinet_pair', 'wall_backlight_double'];
export function isLightSet(model: string): boolean {
  return SET_LIGHT_KEYS.includes(model);
}

export function buildFurniture(model: string, color?: string, opts?: BuildOpts): THREE.Group {
  const builder = builders[model] ?? builders.marker;
  const c = new THREE.Color(color ?? defaultColor(model));
  const group = builder(c, opts);
  group.userData.model = model;
  return group;
}

const _backZCache = new Map<string, number>();
/** The model's back-most local Z (its front faces +Z). A wall-mounted piece is
 *  offset by -this so its BACK sits flush on the wall surface instead of the
 *  fixed offset letting a deep cabinet punch through the wall. */
export function modelBackZ(model: string): number {
  let z = _backZCache.get(model);
  if (z === undefined) {
    const g = buildFurniture(model);
    g.updateMatrixWorld(true);
    z = new THREE.Box3().setFromObject(g).min.z;
    if (!Number.isFinite(z)) z = 0;
    _backZCache.set(model, z);
  }
  return z;
}
