// ---------------------------------------------------------------------------
// Procedural surface materials for walls and floors — "wallpaper"-style
// presets generated as CanvasTextures (no external assets). Each is tintable
// via the surface color. Cached per (name) and reused across the scene.
// ---------------------------------------------------------------------------

import * as THREE from 'three';

export type SurfaceMaterial =
  | 'plain'
  | 'stripes'
  | 'tile'
  | 'wood'
  | 'plaster'
  | 'brick'
  | 'panel'
  | 'molding'
  | 'concrete'
  | 'marble'
  | 'carpet'
  | 'parquet'
  | 'herringbone'
  | 'walnut';

export const WALL_MATERIALS: SurfaceMaterial[] = ['plain', 'molding', 'panel', 'stripes', 'plaster', 'brick', 'concrete', 'marble'];
export const FLOOR_MATERIALS: SurfaceMaterial[] = ['plain', 'herringbone', 'parquet', 'wood', 'walnut', 'tile', 'marble', 'carpet', 'concrete'];

/** Materials that bake their own colour (wood etc.) — the builder shows them on
 *  a WHITE base so the rich tone reads through instead of being tinted flat. */
export const BAKED_MATERIALS = new Set<SurfaceMaterial>(['wood', 'parquet', 'herringbone', 'walnut', 'marble']);
export function isBakedMaterial(name?: string): boolean {
  return BAKED_MATERIALS.has(name as SurfaceMaterial);
}

const cache = new Map<string, THREE.Texture | null>();

function canvas(size = 256): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  return [c, c.getContext('2d')!];
}

/** Draw wood grain (streaks + pores) over a filled plank region. */
function woodGrain(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, dark: string): void {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  for (let i = 0; i < Math.max(6, (w * h) / 400); i++) {
    ctx.strokeStyle = dark;
    ctx.globalAlpha = 0.08 + Math.random() * 0.14;
    ctx.lineWidth = 0.6 + Math.random();
    ctx.beginPath();
    const sy = y + Math.random() * h;
    ctx.moveTo(x, sy);
    for (let px = x; px < x + w; px += 8) ctx.lineTo(px, sy + (Math.random() - 0.5) * 3);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

/** A parallelogram plank at 45° (for herringbone). */
function plank45(ctx: CanvasRenderingContext2D, cx: number, cy: number, len: number, wid: number, dir: 1 | -1, fill: string, dark: string): void {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((dir * Math.PI) / 4);
  ctx.fillStyle = fill;
  ctx.fillRect(-len / 2, -wid / 2, len, wid);
  ctx.strokeStyle = dark;
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = 1;
  ctx.strokeRect(-len / 2, -wid / 2, len, wid);
  ctx.globalAlpha = 0.18;
  for (let gx = -len / 2 + 4; gx < len / 2; gx += 7) {
    ctx.beginPath();
    ctx.moveTo(gx, -wid / 2);
    ctx.lineTo(gx, wid / 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

function build(name: SurfaceMaterial): THREE.Texture | null {
  if (name === 'plain') return null;
  const [c, ctx] = canvas(256);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 256, 256);

  if (name === 'stripes') {
    ctx.fillStyle = 'rgba(0,0,0,0.06)';
    for (let x = 0; x < 256; x += 32) ctx.fillRect(x, 0, 16, 256);
  } else if (name === 'plaster') {
    for (let i = 0; i < 9000; i++) {
      ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.05})`;
      ctx.fillRect(Math.random() * 256, Math.random() * 256, 1, 1);
    }
  } else if (name === 'brick') {
    ctx.strokeStyle = 'rgba(0,0,0,0.18)';
    ctx.lineWidth = 2;
    const bh = 28;
    for (let row = 0, y = 0; y < 256; y += bh, row++) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(256, y);
      ctx.stroke();
      const off = row % 2 ? 32 : 0;
      for (let x = off; x <= 256; x += 64) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + bh);
        ctx.stroke();
      }
    }
  } else if (name === 'panel') {
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 3;
    for (let i = 24; i < 256; i += 64) {
      ctx.strokeRect(i, 24, 40, 208);
    }
  } else if (name === 'wood' || name === 'walnut') {
    // Wide planks with baked oak / walnut tone + grain.
    const tones = name === 'walnut'
      ? ['#6f4a2f', '#78502f', '#664226', '#7a5535']
      : ['#c9a878', '#c4a06e', '#cfb083', '#bd9862'];
    const dark = name === 'walnut' ? '#3c2716' : '#8a5f34';
    const ph = 34;
    for (let y = 0; y < 256; y += ph) {
      const offset = ((y / ph) % 2) * 40; // stagger the seams
      for (let x = -offset; x < 256; x += 128) {
        ctx.fillStyle = tones[Math.floor(Math.random() * tones.length)];
        ctx.fillRect(x, y, 128, ph);
        woodGrain(ctx, x, y, 128, ph, dark);
        ctx.strokeStyle = 'rgba(0,0,0,0.28)';
        ctx.lineWidth = 1.4;
        ctx.strokeRect(x, y, 128, ph);
      }
    }
  } else if (name === 'herringbone') {
    ctx.fillStyle = '#c7a678';
    ctx.fillRect(0, 0, 256, 256);
    const L = 46;
    const W = 22;
    let dir: 1 | -1 = 1;
    for (let row = 0; row < 10; row++) {
      dir = (row % 2 === 0 ? 1 : -1) as 1 | -1;
      for (let col = -1; col < 8; col++) {
        const cx = col * L * 0.72 + (row % 2) * L * 0.36;
        const cy = row * W * 1.5;
        const tone = ['#c9a878', '#c1a06f', '#d0b184', '#bb9660'][(row + col + 8) % 4];
        plank45(ctx, cx, cy, L, W, dir, tone, '#8a5f34');
        plank45(ctx, cx + L * 0.36, cy + W * 0.75, L, W, (dir * -1) as 1 | -1, tone, '#8a5f34');
      }
    }
  } else if (name === 'tile') {
    ctx.strokeStyle = 'rgba(0,0,0,0.14)';
    ctx.lineWidth = 2;
    for (let i = 0; i <= 256; i += 64) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 256);
      ctx.moveTo(0, i);
      ctx.lineTo(256, i);
      ctx.stroke();
    }
  } else if (name === 'concrete') {
    for (let i = 0; i < 14000; i++) {
      ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.07})`;
      ctx.fillRect(Math.random() * 256, Math.random() * 256, 1, 1);
    }
    ctx.fillStyle = 'rgba(0,0,0,0.05)';
    for (let i = 0; i < 6; i++) ctx.fillRect(0, Math.random() * 256, 256, 1);
  } else if (name === 'marble') {
    // Light stone base + stronger grey/gold veining.
    ctx.fillStyle = '#eef0f3';
    ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 18; i++) {
      ctx.strokeStyle = i % 4 === 0 ? 'rgba(150,120,70,0.35)' : 'rgba(90,95,110,0.35)';
      ctx.lineWidth = i % 3 === 0 ? 2.2 : 1;
      ctx.beginPath();
      let x = Math.random() * 256;
      let y = 0;
      ctx.moveTo(x, y);
      while (y < 256) {
        x += (Math.random() - 0.5) * 34;
        y += 12 + Math.random() * 14;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  } else if (name === 'carpet') {
    for (let i = 0; i < 22000; i++) {
      ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.10})`;
      ctx.fillRect(Math.random() * 256, Math.random() * 256, 1, 2);
    }
  } else if (name === 'parquet') {
    const s = 42;
    const tones = ['#c9a878', '#c1a06f', '#cfb083', '#bd9862'];
    for (let by = 0, r = 0; by < 256; by += s, r++) {
      for (let bx = 0, cc = 0; bx < 256; bx += s, cc++) {
        const vertical = (r + cc) % 2 === 0;
        ctx.fillStyle = tones[(r + cc) % tones.length];
        ctx.fillRect(bx, by, s, s);
        woodGrain(ctx, bx, by, s, s, '#8a5f34');
        // planks within the block run one way
        ctx.strokeStyle = 'rgba(0,0,0,0.22)';
        ctx.lineWidth = 1;
        for (let k = 0; k <= s; k += s / 4) {
          ctx.beginPath();
          if (vertical) { ctx.moveTo(bx + k, by); ctx.lineTo(bx + k, by + s); }
          else { ctx.moveTo(bx, by + k); ctx.lineTo(bx + s, by + k); }
          ctx.stroke();
        }
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 1.4;
        ctx.strokeRect(bx, by, s, s);
      }
    }
  } else if (name === 'molding') {
    // Premium wall: a large framed molding panel (like classic wainscoting).
    const inset = 26;
    const draw = (x: number, y: number, w: number, h: number) => {
      ctx.strokeStyle = 'rgba(0,0,0,0.16)';
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, w, h);
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.lineWidth = 1.4;
      ctx.strokeRect(x + 4, y + 4, w - 8, h - 8);
      ctx.strokeStyle = 'rgba(0,0,0,0.10)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 8, y + 8, w - 16, h - 16);
    };
    draw(inset, inset, 256 - inset * 2, 256 - inset * 2);
  }

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

/** A cached texture for a surface material (null = plain color). */
export function surfaceTexture(name?: string): THREE.Texture | null {
  const key = (name as SurfaceMaterial) || 'plain';
  if (!cache.has(key)) cache.set(key, build(key as SurfaceMaterial));
  return cache.get(key) ?? null;
}

/** Repeat the texture across a surface of the given world size (meters). */
export function tiled(tex: THREE.Texture | null, wMeters: number, hMeters: number): THREE.Texture | null {
  if (!tex) return null;
  const t = tex.clone();
  t.needsUpdate = true;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(Math.max(1, wMeters / 1.0), Math.max(1, hMeters / 1.0));
  return t;
}
