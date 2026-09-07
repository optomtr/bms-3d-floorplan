// ---------------------------------------------------------------------------
// Освещение — модели библиотеки мебели.
//
// Каждая модель возвращает THREE.Group с началом координат в центре пятна
// на полу (y = 0). Порядок ключей в палитре задаёт MODEL_ORDER в ./index.ts,
// а не порядок записей в этом файле.
// ---------------------------------------------------------------------------


// Одиночные люстры вынесены отдельными сборщиками: из них набираются наборы
// chandelier_double / crystal_chandelier_double, поэтому их нужно звать по имени.

import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { mat, box, cyl, tint, ledFrame, cabinetUnit, defineModel, glow, legs4Box, lightSet, lightSetUnits, METAL, WHITE, DARK, type FurnitureBuilder } from '../primitives';

const chandelier: FurnitureBuilder = defineModel((g, c) => {
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
      const flame = glow(new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 10), mat(0xfff1c0, { emissive: 0x000000 })));
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
});

const crystal_chandelier: FurnitureBuilder = defineModel((g, c) => {
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
  g.add(tint(glow(cyl(0.05, 0.05, 0.42, mat(0xfff3d0, { emissive: 0x000000, transparent: true, opacity: 0.9 }), 0, -0.4, 0, 16)), c));
});

export const lightingModels = {
  ceiling_light: defineModel((g, c) => {
    // Anchor at ceiling; the binding system attaches a PointLight to this.
    const shade = glow(cyl(0.18, 0.22, 0.12, mat(WHITE, { emissive: 0x000000 }), 0, 0, 0));
    g.add(tint(shade, c));
    g.add(cyl(0.01, 0.01, 0.25, mat(METAL), 0, 0.18, 0)); // cord
  }),
  // A PAIR of tall dark display cabinets flanking a feature wall — `count`
  // cabinets, `spread` sets the GAP between them WITHOUT resizing each. The
  // backlit glass shelves glow when bound to a light/switch.
  cabinet_pair: defineModel((g, c, opts) => {
    lightSetUnits(g, opts, { count: 2, max: 6, gap: 1.7 }, () => cabinetUnit(c));
  }),
  // ---- Extra lighting (emissive; bindable as lights) ----
  track_light: defineModel((g, c) => {
    const rail = box(1.2, 0.05, 0.05, mat(DARK), 0, 0, 0);
    g.add(tint(rail, c));
    for (const x of [-0.4, 0, 0.4]) {
      g.add(box(0.08, 0.1, 0.08, mat(DARK), x, -0.08, 0));
      g.add(glow(cyl(0.05, 0.06, 0.08, mat(0xfff4d6, { emissive: 0x000000 }), x, -0.16, 0, 12)));
    }
  }),
  lantern: defineModel((g, c) => {
    g.add(tint(box(0.22, 0.04, 0.22, mat(DARK), 0, 0, 0), c));
    g.add(box(0.22, 0.04, 0.22, mat(DARK), 0, 0.5, 0));
    legs4Box(g, 0.02, 0.5, 0.02, mat(DARK), 0.1, 0.1, 0.25);
    g.add(glow(box(0.16, 0.42, 0.16, mat(0xfff1c0, { emissive: 0x000000, transparent: true, opacity: 0.85 }), 0, 0.25, 0)));
  }),
  led_panel: defineModel((g, c) => {
    g.add(tint(box(0.6, 0.04, 0.6, mat(METAL), 0, 0, 0), c));
    g.add(glow(box(0.56, 0.02, 0.56, mat(0xf7faff, { emissive: 0x000000 }), 0, -0.02, 0)));
  }),
  // ---- Consolidated fixtures: ONE model + ONE bound entity in place of many
  //      stacked spots/strips. Fewer meshes, one marker, one point light → much
  //      lighter on weak GPUs than 6-8 separate placements. ----
  // A recessed-spot SET (white trims). `count` spots, `spread` widens the
  // spacing WITHOUT resizing each spot. Trims + lenses each merge into one mesh
  // (2 draw calls) — far lighter than placing N separate spots by hand.
  spotlight_bar: defineModel((g, c, opts) => {
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
    const lenses = glow(new THREE.Mesh(mergeGeometries(lensGeos, false), mat(0xfff4d6, { emissive: 0x000000 })));
    lenses.castShadow = false;
    lensGeos.forEach((gg) => gg.dispose());
    g.add(tint(lenses, c));
  }),
  // Hollow rectangular LED backlight. `spread` grows the frame (keeps the strip
  // thickness), so the rectangle gets bigger without the border thickening.
  led_backlight: defineModel((g, c, opts) => {
    const s = opts?.spread ?? 1;
    g.add(tint(ledFrame(1.0 * s, 0.6 * s, 0.06, 0xf2f7ff), c));
  }),
  // Track light ("rels svet") — long thin frame; `spread` extends its length.
  track_bar: defineModel((g, c, opts) => {
    const s = opts?.spread ?? 1;
    g.add(tint(ledFrame(1.5 * s, 0.22, 0.045, 0xfff4d6), c));
  }),
  // Double wall light SET — a pair (default) of modern up/down wall luminaires.
  // `count` fixtures, `spread` sets the GAP between them WITHOUT resizing any of
  // them. Each fixture's up + down glow panels are 'emissive', so binding a
  // light/switch lights the pair together.
  wall_light_double: defineModel((g, c, opts) => {
    lightSetUnits(g, opts, { count: 2, max: 8, gap: 0.95 }, () => {
      const u = new THREE.Group();
      u.add(box(0.09, 0.34, 0.07, mat(0x2b2f36, { metalness: 0.5, roughness: 0.4 }), 0, 0, 0)); // slim body
      for (const sy of [0.19, -0.19]) {
        u.add(tint(glow(box(0.06, 0.03, 0.055, mat(0xfff2d6, { emissive: 0x000000 }), 0, sy, 0.02)), c));
      }
      return u;
    });
  }),
  // Classic wall-sconce SET ("бра") — a pair (default) of brass sconces with an
  // upward shade. `count` fixtures, `spread` sets the GAP; each keeps its size.
  sconce_pair: defineModel((g, c, opts) => {
    const brass = mat(0xb8935a, { metalness: 0.6, roughness: 0.35 }); // общая на все бра
    lightSetUnits(g, opts, { count: 2, max: 8, gap: 0.9 }, () => {
      const u = new THREE.Group();
      u.add(box(0.11, 0.12, 0.03, brass, 0, -0.08, 0.015)); // backplate on the wall
      u.add(box(0.03, 0.03, 0.12, brass, 0, -0.04, 0.08));  // arm out into the room
      u.add(box(0.02, 0.16, 0.02, brass, 0, 0.04, 0.13));   // upright stem
      u.add(tint(glow(cyl(0.09, 0.055, 0.14, mat(0xfff4d6, { emissive: 0x000000, transparent: true, opacity: 0.92 }), 0, 0.16, 0.13, 16)), c));
      return u;
    });
  }),
  // Rectangular wall sconce ("bra") — a slim vertical luminous bar on the wall.
  wall_sconce: defineModel((g, c) => {
    g.add(box(0.1, 0.5, 0.1, mat(METAL), 0, 0, 0)); // backplate/body (fixed)
    g.add(tint(glow(box(0.06, 0.44, 0.05, mat(0xfff4d6, { emissive: 0x000000, transparent: true, opacity: 0.92 }), 0, 0, 0.06)), c));
  }),
  // ---- Lighting (освещение) — each has an 'emissive' mesh + reads as a lamp ----
  floor_lamp: defineModel((g, c) => {
    g.add(cyl(0.18, 0.22, 0.03, mat(METAL), 0, 0.015, 0)); // base
    g.add(cyl(0.02, 0.02, 1.5, mat(METAL), 0, 0.75, 0)); // pole
    const shade = glow(cyl(0.18, 0.25, 0.28, mat(0xfff4d6, { emissive: 0x000000 }), 0, 1.55, 0));
    g.add(tint(shade, c));
  }),
  table_lamp: defineModel((g, c) => {
    g.add(cyl(0.1, 0.12, 0.03, mat(METAL), 0, 0.015, 0));
    g.add(cyl(0.015, 0.015, 0.3, mat(METAL), 0, 0.18, 0));
    const shade = glow(cyl(0.12, 0.16, 0.18, mat(0xfff4d6, { emissive: 0x000000 }), 0, 0.42, 0));
    g.add(tint(shade, c));
  }),
  wall_light: defineModel((g, c) => {
    g.add(box(0.12, 0.2, 0.08, mat(METAL), 0, 0, 0));
    g.add(tint(glow(box(0.1, 0.16, 0.04, mat(0xfff4d6, { emissive: 0x000000 }), 0, 0, 0.06)), c));
  }),
  // Ornate two-tier candle chandelier. Origin sits at the ceiling mount; the
  // fixture hangs DOWN (negative Y). Candle "flames" are the emissive meshes.
  chandelier,
  // Modern cascading-crystal chandelier: three descending rings dripping with
  // crystals around a central warm glow column (the emissive part).
  crystal_chandelier,
  // A PAIR of chandeliers as a set — `count` fixtures, `spread` sets the GAP
  // between them WITHOUT resizing each (reuses the single-chandelier geometry).
  chandelier_double: defineModel((g, c, opts) => {
    lightSetUnits(g, opts, { count: 2, max: 8, gap: 1.4 }, () => chandelier(c, opts));
  }),
  crystal_chandelier_double: defineModel((g, c, opts) => {
    lightSetUnits(g, opts, { count: 2, max: 8, gap: 1.3 }, () => crystal_chandelier(c, opts));
  }),
  spotlight: defineModel((g, c) => {
    g.add(cyl(0.05, 0.07, 0.06, mat(METAL), 0, 0, 0));
    g.add(tint(glow(cyl(0.05, 0.05, 0.01, mat(0xfff4d6, { emissive: 0x000000 }), 0, -0.03, 0)), c));
  }),
  pendant_light: defineModel((g, c) => {
    g.add(cyl(0.008, 0.008, 0.4, mat(DARK), 0, 0.2, 0));
    g.add(tint(glow(cyl(0.16, 0.05, 0.2, mat(0xfff4d6, { emissive: 0x000000 }), 0, -0.1, 0)), c));
  }),
  led_strip: defineModel((g, c) => {
    const strip = glow(box(1.5, 0.03, 0.04, mat(0xffffff, { emissive: 0x000000 }), 0, 0, 0));
    g.add(tint(strip, c));
  }),
  // Twin parallel linear ceiling lights (the two parallel LED lines on the
  // ceiling). Bindable — the 'emissive' strips glow when linked to a light.
  track_double: defineModel((g, c) => {
    const L = 2.0, sep = 0.5;
    for (const z of [-sep / 2, sep / 2]) {
      g.add(box(L, 0.04, 0.07, mat(DARK, { roughness: 0.7 }), 0, 0, z)); // recessed channel
      const strip = glow(box(L - 0.06, 0.02, 0.035, mat(0xfff4d6, { emissive: 0x000000 }), 0, -0.02, z));
      g.add(tint(strip, c));
    }
  }),
  // Vertical wall backlight — a tall glowing reveal in a dark channel (the
  // "vertikal podsvetka"). Bindable to a light; mounts on the wall surface.
  wall_backlight: defineModel((g, c) => {
    const H = 2.3, y0 = 0.15;
    g.add(box(0.09, H + 0.06, 0.03, mat(0x2f2620, { roughness: 0.9 }), 0, y0 + H / 2, 0)); // channel
    const strip = glow(box(0.05, H, 0.035, mat(0xfff0d0, { emissive: 0x000000 }), 0, y0 + H / 2, 0.02));
    g.add(tint(strip, c));
  }),
  // Double vertical wall backlight — a PAIR (default) of the vertical reveals
  // above. `count` strips, `spread` sets the GAP between them WITHOUT resizing
  // any strip. Each strip is 'emissive', so binding a light/switch lights the
  // pair together. Mounts on the wall surface, floor-to-ceiling.
  wall_backlight_double: defineModel((g, c, opts) => {
    const H = 2.3, y0 = 0.15;
    lightSet(opts, { count: 2, max: 6, gap: 0.5 }, (x) => {
      g.add(box(0.09, H + 0.06, 0.03, mat(0x2f2620, { roughness: 0.9 }), x, y0 + H / 2, 0)); // channel
      g.add(tint(glow(box(0.05, H, 0.035, mat(0xfff0d0, { emissive: 0x000000 }), x, y0 + H / 2, 0.02)), c));
    });
  }),
} satisfies Record<string, FurnitureBuilder>;
