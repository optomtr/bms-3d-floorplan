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

const builders: Record<string, FurnitureBuilder> = {
  sofa: (c) => {
    const g = new THREE.Group();
    const fabric = mat(FABRIC);
    g.add(tint(box(1.9, 0.4, 0.85, fabric, 0, 0.2, 0), c)); // base
    g.add(tint(box(1.9, 0.5, 0.2, fabric, 0, 0.55, -0.32), c)); // backrest
    g.add(tint(box(0.2, 0.45, 0.85, fabric, -0.85, 0.5, 0), c)); // left arm
    g.add(tint(box(0.2, 0.45, 0.85, fabric, 0.85, 0.5, 0), c)); // right arm
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
    g.add(box(1.6, 0.3, 2.0, mat(WOOD), 0, 0.15, 0)); // frame
    g.add(tint(box(1.55, 0.18, 1.95, mat(WHITE), 0, 0.39, 0), c)); // mattress/duvet
    g.add(box(1.6, 0.6, 0.1, mat(WOOD), 0, 0.5, -0.95)); // headboard
    g.add(box(0.5, 0.12, 0.35, mat(WHITE), -0.45, 0.5, -0.7)); // pillow
    g.add(box(0.5, 0.12, 0.35, mat(WHITE), 0.45, 0.5, -0.7));
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
    g.add(box(1.18, 0.66, 0.02, mat(0x0a0a0a, { emissive: 0x111417 }), 0, 0, 0.07)); // screen
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
    const f = mat(FABRIC);
    g.add(tint(box(0.85, 0.4, 0.85, f, 0, 0.2, 0), c));
    g.add(tint(box(0.85, 0.5, 0.18, f, 0, 0.55, -0.33), c));
    g.add(tint(box(0.16, 0.45, 0.85, f, -0.42, 0.5, 0), c));
    g.add(tint(box(0.16, 0.45, 0.85, f, 0.42, 0.5, 0), c));
    return g;
  },
  coffee_table: (c) => {
    const g = new THREE.Group();
    g.add(tint(box(1.0, 0.05, 0.55, mat(WOOD), 0, 0.4, 0), c));
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const)
      g.add(box(0.06, 0.4, 0.06, mat(WOOD), sx * 0.42, 0.2, sz * 0.22));
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
    g.add(tint(box(1.3, 0.05, 0.65, mat(WOOD), 0, 0.74, 0), c));
    g.add(box(0.5, 0.7, 0.6, mat(DARK), 0.35, 0.37, 0)); // drawers
    g.add(box(0.05, 0.74, 0.6, mat(WOOD), -0.6, 0.37, 0)); // leg panel
    return g;
  },
  office_chair: (c) => {
    const g = new THREE.Group();
    g.add(tint(box(0.5, 0.06, 0.5, mat(DARK), 0, 0.5, 0), c));
    g.add(tint(box(0.5, 0.5, 0.06, mat(DARK), 0, 0.78, -0.22), c));
    g.add(cyl(0.04, 0.04, 0.45, mat(METAL), 0, 0.25, 0));
    g.add(cyl(0.26, 0.26, 0.04, mat(METAL), 0, 0.04, 0));
    return g;
  },
  nightstand: (c) => {
    const g = new THREE.Group();
    g.add(tint(box(0.45, 0.5, 0.4, mat(WOOD), 0, 0.25, 0), c));
    g.add(box(0.4, 0.02, 0.02, mat(METAL), 0, 0.32, 0.21));
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
  bathtub: (c) => {
    const g = new THREE.Group();
    g.add(tint(box(1.6, 0.55, 0.75, mat(WHITE), 0, 0.275, 0), c));
    g.add(box(1.45, 0.2, 0.6, mat(0xdfeef2), 0, 0.4, 0)); // water/inside
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
  security_camera: (c) => {
    const g = new THREE.Group();
    g.add(tint(cyl(0.06, 0.06, 0.18, mat(WHITE), 0, 0, 0), c));
    const lens = cyl(0.04, 0.04, 0.04, mat(0x101418, { emissive: 0x300000 }), 0, 0, 0.1);
    lens.name = 'emissive';
    lens.rotateX(Math.PI / 2);
    g.add(lens);
    return g;
  },
  radiator: (c) => {
    const g = new THREE.Group();
    for (let i = 0; i < 8; i++) g.add(tint(box(0.06, 0.6, 0.1, mat(WHITE), -0.35 + i * 0.1, 0.4, 0), c));
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

  double_door: (c) => {
    const g = new THREE.Group();
    g.add(tint(box(0.7, 2.0, 0.05, mat(WOOD), -0.36, 1.0, 0), c));
    g.add(tint(box(0.7, 2.0, 0.05, mat(WOOD), 0.36, 1.0, 0), c));
    g.add(cyl(0.025, 0.025, 0.1, mat(METAL), -0.05, 1.0, 0.05));
    g.add(cyl(0.025, 0.025, 0.1, mat(METAL), 0.05, 1.0, 0.05));
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
    g.add(tint(box(0.6, 0.4, 0.6, mat(FABRIC), 0, 0.2, 0), c));
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
  'curtain_sheer', 'roller_blind', 'roman_blind', 'wall_cabinet', 'wall_sconce',
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
  'curtain', 'curtain_sheer', 'roller_blind', 'roman_blind', 'wall_sconce',
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
      return ['climate', 'fan', 'switch'];
    case 'ceiling_fan':
    case 'ceiling_vent':
      return ['fan', 'switch'];
    case 'wardrobe_lit':
      return ['light', 'switch'];
    case 'tv':
    case 'tv_stand':
      return ['media_player', 'switch'];
    case 'speaker':
      return ['media_player'];
    case 'curtain':
    case 'curtain_sheer':
    case 'roller_blind':
    case 'roman_blind':
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
    model === 'track_bar'
  )
    return wallHeight - 0.02;
  if (model === 'wall_sconce') return 1.6;
  if (model === 'ceiling_fan') return wallHeight - 0.25;
  if (model === 'ceiling_vent') return wallHeight - 0.02;
  if (model === 'wall_cabinet') return 1.55;
  if (model === 'wall_light' || model === 'ac_unit' || model === 'security_camera') return 2.0;
  if (model === 'bathroom_cabinet' || model === 'whiteboard') return 1.5;
  if (model === 'wall_shelf') return 1.4;
  if (model === 'painting' || model === 'mirror' || model === 'tv' || model === 'intercom') return 1.4;
  if (model === 'towel_rack') return 1.1;
  if (model === 'terrace_window') return 1.2;
  if (model === 'wall_clock') return 1.7;
  if (model === 'range_hood') return 1.6;
  if (model === 'curtain' || model === 'curtain_sheer' || model === 'roller_blind' || model === 'roman_blind') return 0.1;
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
  bar_stool: '#9c6b3f', stairs: '#b08a5a', wall_shelf: '#9c6b3f', door: '#9c6b3f',
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
  sink: '#f2f5f6', toilet: '#f2f5f6', bathtub: '#f2f5f6', shower: '#dfe7ea', bidet: '#f2f5f6',
  // Decor / soft furnishings
  plant: '#3f8f4f', rug: '#b5563a', floor_vase: '#b0764a', vase: '#b0764a',
  painting: '#cfc2a8', mirror: '#bcc8cc', wall_clock: '#f0f0f0', whiteboard: '#f4f6f8',
  curtain: '#cdd3da', curtain_sheer: '#e6ecf2', roller_blind: '#d6dadf', roman_blind: '#cdd3da',
  towel_rack: '#d0d4d8', bathroom_cabinet: '#e8eaec', trash_can: '#9aa0a6',
  // Statement / misc
  piano: '#1b1d22', pool_table: '#2e6b3f', aquarium: '#6fb6c8', fireplace: '#3a3a3a',
  radiator: '#eeeeee', tv: '#15171a', monitor: '#15171a', printer: '#3a3e44',
  speaker: '#2b2f36', ac_unit: '#f0f2f4', security_camera: '#d8dce0', intercom: '#d8dce0',
  wall_panel: '#d8d2c6', arch: '#d8d2c6', ceiling_fan: '#d8d8d8', ceiling_vent: '#eaecee',
  window_frame: '#e8e8e8', terrace_window: '#e8e8e8', patio_door: '#e8e8e8', terrace_wall: '#dfe6ea',
  // Lighting (warm shades)
  floor_lamp: '#fff4d6', table_lamp: '#fff4d6', wall_light: '#fff4d6',
  ceiling_light: '#fff4d6', pendant_light: '#fff4d6', lantern: '#fff4d6',
  chandelier: '#f3e6c0', crystal_chandelier: '#eaf2fb', spotlight: '#fff4d6',
  track_light: '#fff4d6', led_panel: '#f7faff', led_strip: '#ffffff',
  spotlight_bar: '#fff4d6', led_backlight: '#f2f7ff', track_bar: '#fff4d6', wall_sconce: '#fff2d6',
};

/** Realistic default color for a model (neutral grey when unspecified). */
export function defaultColor(model: string): string {
  return DEFAULT_COLORS[model] ?? '#c9cdd2';
}

/** Light "set" models whose Spread/Count are adjustable (spacing, not stretch). */
export const SET_LIGHT_KEYS = ['spotlight_bar', 'led_backlight', 'track_bar'];
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
