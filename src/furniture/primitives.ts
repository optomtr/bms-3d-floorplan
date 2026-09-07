// ---------------------------------------------------------------------------
// Кирпичики библиотеки мебели — общие материалы, примитивы и сборщики.
//
// Здесь лежит всё, из чего собраны 190 моделей: материал, коробка, скруглённая
// коробка, цилиндр, подкраска главной поверхности, а также готовые узлы
// (светящаяся рамка, потолочная колонка, витрина) и помощники, снимающие
// повторы в самих моделях (defineModel, glow, legs4, lightSet, alongX,
// stairFlight).
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
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

/** Optional per-placement build options. `spread` widens the SPACING of a light
 *  set (keeping each element's size); `count` sets how many elements. */
export interface BuildOpts {
  spread?: number;
  count?: number;
}
export type FurnitureBuilder = (color: THREE.Color, opts?: BuildOpts) => THREE.Group;

export const WOOD = 0x9c6b3f;
export const FABRIC = 0x6f7d8c;
export const METAL = 0xb8bcc4;
export const WHITE = 0xf2f2f2;
export const DARK = 0x2b2f36;
export const GLASS = 0x88c0d0;

export function mat(color: number | THREE.Color, opts: THREE.MeshStandardMaterialParameters = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.8,
    metalness: 0.05,
    ...opts,
  });
}

export function box(
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

/** Rounded-corner box. Soft edges read far less "LEGO" than a hard BoxGeometry —
 *  it's what makes molded car panels look molded rather than blocky. */
export function rbox(
  w: number,
  h: number,
  d: number,
  material: THREE.Material,
  x = 0,
  y = 0,
  z = 0,
  r = 0.06,
): THREE.Mesh {
  const rr = Math.max(0.01, Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001));
  const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, rr), material);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

export function cyl(
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
export function tint(mesh: THREE.Mesh, color: THREE.Color): THREE.Mesh {
  (mesh.material as THREE.MeshStandardMaterial).color.copy(color);
  return mesh;
}

/** "BMS" in white on black, as an emissive texture for a TV screen — so a bound
 *  TV lights up its brand when it turns on (and stays dark when off). Cached. */
let _bmsScreenTex: THREE.CanvasTexture | null = null;
export function bmsScreenTexture(): THREE.CanvasTexture | null {
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
export function ledFrame(W: number, D: number, t: number, colorHex: number): THREE.Mesh {
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
export function ceilingSpeakerUnit(c: THREE.Color): THREE.Group {
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
export function cabinetUnit(c: THREE.Color): THREE.Group {
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

// ---------------------------------------------------------------------------
// Помощники, снимающие повторы в самих моделях.
// ---------------------------------------------------------------------------

/**
 * Обёртка модели. Раньше каждая из 190 моделей начиналась с
 * `const g = new THREE.Group()` и заканчивалась `return g` — 380 строк, в
 * которых нельзя ошибиться, но можно забыть. Теперь сборщик получает готовую
 * группу и просто наполняет её.
 */
export function defineModel(
  build: (g: THREE.Group, color: THREE.Color, opts?: BuildOpts) => void,
): FurnitureBuilder {
  return (color, opts) => {
    const g = new THREE.Group();
    build(g, color, opts);
    return g;
  };
}

/**
 * Помечает меш как светящуюся часть. Имя 'emissive' — договор со scene/bindings:
 * привязанная лампа/выключатель зажигает именно меши с этим именем, поэтому имя
 * менять НЕЛЬЗЯ. Обёртка нужна, чтобы это имя стояло в одном месте, а не в 36.
 */
export function glow<T extends THREE.Object3D>(o: T): T {
  o.name = 'emissive';
  return o;
}

/** Четыре угла пятна: (−x,−z), (+x,−z), (−x,+z), (+x,+z). Порядок важен —
 *  в этом порядке ножки ложатся в группу. */
const CORNERS = [
  [-1, -1],
  [1, -1],
  [-1, 1],
  [1, 1],
] as const;

/** Ножка в каждом из четырёх углов: что вернёт `make`, то и добавится. */
export function legs4(g: THREE.Group, make: (sx: number, sz: number) => THREE.Object3D): void {
  for (const [sx, sz] of CORNERS) g.add(make(sx, sz));
}

/** Четыре одинаковые прямоугольные ножки в углах (±lx, ±lz) на высоте y. */
export function legs4Box(
  g: THREE.Group,
  w: number,
  h: number,
  d: number,
  material: THREE.Material,
  lx: number,
  lz: number,
  y: number,
): void {
  legs4(g, (sx, sz) => box(w, h, d, material, sx * lx, y, sz * lz));
}

/** Четыре одинаковые круглые (обычно чуть конические) ножки в углах (±lx, ±lz). */
export function legs4Cyl(
  g: THREE.Group,
  rTop: number,
  rBot: number,
  h: number,
  material: THREE.Material,
  lx: number,
  lz: number,
  y: number,
  seg = 16,
): void {
  legs4(g, (sx, sz) => cyl(rTop, rBot, h, material, sx * lx, y, sz * lz, seg));
}

/** Настройка набора: сколько элементов по умолчанию, потолок и шаг при разбросе 1. */
export interface SetLayout {
  /** сколько элементов, если пользователь не задал «Количество» */
  count: number;
  /** больше этого числа не ставим */
  max: number;
  /** расстояние между центрами при «Разбросе» 1 */
  gap: number;
}

/**
 * Раскладка набора вдоль X: элементы РАССТАВЛЯЮТСЯ шире, каждый сохраняет свой
 * размер. Вызывает `place` с готовым смещением по X для каждого элемента.
 */
export function lightSet(
  opts: BuildOpts | undefined,
  layout: SetLayout,
  place: (x: number, i: number) => void,
): void {
  const count = Math.max(1, Math.min(layout.max, Math.round(opts?.count ?? layout.count)));
  const gap = layout.gap * (opts?.spread ?? 1);
  for (let i = 0; i < count; i++) place((i - (count - 1) / 2) * gap, i);
}

/** То же, но элемент — целый узел: собрали, сдвинули по X, положили в группу. */
export function lightSetUnits(
  g: THREE.Group,
  opts: BuildOpts | undefined,
  layout: SetLayout,
  unit: (i: number) => THREE.Object3D,
): void {
  lightSet(opts, layout, (x, i) => {
    const u = unit(i);
    u.position.x = x;
    g.add(u);
  });
}

/** Равномерный ряд вдоль X по центру: `n` шагов шириной `width / n`, начиная от
 *  левого края. Так набираются рейки, ламели, панели, балясины и прочие «через
 *  равные промежутки». */
export function alongX(width: number, n: number, put: (x: number, i: number) => void): void {
  const seg = width / n;
  for (let i = 0; i < n; i++) put(-width / 2 + (i + 0.5) * seg, i);
}
