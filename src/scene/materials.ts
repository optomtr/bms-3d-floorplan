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
  | 'concrete'
  | 'marble'
  | 'carpet'
  | 'parquet';

export const WALL_MATERIALS: SurfaceMaterial[] = ['plain', 'stripes', 'plaster', 'brick', 'panel', 'concrete', 'marble'];
export const FLOOR_MATERIALS: SurfaceMaterial[] = ['plain', 'wood', 'parquet', 'tile', 'marble', 'carpet', 'concrete'];

const cache = new Map<string, THREE.Texture | null>();

function canvas(size = 256): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  return [c, c.getContext('2d')!];
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
  } else if (name === 'wood') {
    for (let y = 0; y < 256; y += 26) {
      ctx.fillStyle = 'rgba(0,0,0,0.10)';
      ctx.fillRect(0, y, 256, 2);
      for (let i = 0; i < 40; i++) {
        ctx.fillStyle = `rgba(90,60,30,${Math.random() * 0.06})`;
        ctx.fillRect(Math.random() * 256, y + Math.random() * 24, 18, 1);
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
    // Soft veining: a few faint diagonal strokes.
    ctx.strokeStyle = 'rgba(120,120,140,0.18)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 14; i++) {
      ctx.beginPath();
      let x = Math.random() * 256, y = 0;
      ctx.moveTo(x, y);
      while (y < 256) {
        x += (Math.random() - 0.5) * 30;
        y += 16 + Math.random() * 16;
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
    const s = 32;
    ctx.strokeStyle = 'rgba(0,0,0,0.14)';
    ctx.lineWidth = 1.5;
    for (let by = 0; by < 256; by += s) {
      for (let bx = 0; bx < 256; bx += s) {
        const vertical = ((bx / s) + (by / s)) % 2 === 0;
        ctx.strokeRect(bx, by, s, s);
        for (let k = 4; k < s; k += 6) {
          ctx.beginPath();
          if (vertical) { ctx.moveTo(bx + k, by); ctx.lineTo(bx + k, by + s); }
          else { ctx.moveTo(bx, by + k); ctx.lineTo(bx + s, by + k); }
          ctx.stroke();
        }
      }
    }
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
