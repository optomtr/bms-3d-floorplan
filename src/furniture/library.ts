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

export type FurnitureBuilder = (color: THREE.Color) => THREE.Group;

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
    const leaf = tint(box(0.84, 2.0, 0.05, mat(WOOD), 0, 1.0, 0), c);
    g.add(leaf);
    // Two recessed panels.
    g.add(box(0.5, 0.7, 0.06, mat(0x000000, { transparent: true, opacity: 0.12 }), 0, 1.45, 0.01));
    g.add(box(0.5, 0.7, 0.06, mat(0x000000, { transparent: true, opacity: 0.12 }), 0, 0.6, 0.01));
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
    const g = new THREE.Group();
    g.add(tint(box(1.4, 1.8, 0.05, mat(FABRIC), 0, 1.4, 0), c));
    return g;
  },
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
  chandelier: (c) => {
    const g = new THREE.Group();
    g.add(cyl(0.01, 0.01, 0.3, mat(METAL), 0, 0.15, 0));
    g.add(cyl(0.25, 0.3, 0.04, mat(METAL), 0, 0, 0));
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const bulb = new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 10, 10),
        mat(0xfff4d6, { emissive: 0x000000 }),
      );
      bulb.name = 'emissive';
      bulb.position.set(Math.cos(a) * 0.28, -0.05, Math.sin(a) * 0.28);
      g.add(tint(bulb, c));
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
];
export function isWallMount(model: string): boolean {
  return WALL_MOUNT_KEYS.includes(model);
}

/** Wall-mount models that sit ON the room-side surface of the wall (offset out
 *  so they're not buried in the wall). Doors/windows/curtains sit in-plane. */
export const SURFACE_MOUNT_KEYS = [
  'tv', 'painting', 'mirror', 'wall_light', 'wall_clock', 'ac_unit',
  'intercom', 'security_camera', 'range_hood', 'terrace_window',
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
  'spotlight',
  'pendant_light',
  'led_strip',
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
    case 'tv':
    case 'tv_stand':
      return ['media_player', 'switch'];
    case 'speaker':
      return ['media_player'];
    case 'curtain':
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
  if (model === 'ceiling_light' || model === 'chandelier' || model === 'pendant_light')
    return wallHeight - 0.05;
  if (model === 'spotlight' || model === 'led_strip') return wallHeight - 0.02;
  if (model === 'wall_light' || model === 'ac_unit' || model === 'security_camera') return 2.0;
  if (model === 'painting' || model === 'mirror' || model === 'tv' || model === 'intercom') return 1.4;
  if (model === 'terrace_window') return 1.2;
  if (model === 'wall_clock') return 1.7;
  if (model === 'range_hood') return 1.6;
  if (model === 'curtain') return 0.1;
  return 0;
}

export function buildFurniture(model: string, color?: string): THREE.Group {
  const builder = builders[model] ?? builders.marker;
  const c = new THREE.Color(color ?? '#ffffff');
  const group = builder(c);
  group.userData.model = model;
  return group;
}
