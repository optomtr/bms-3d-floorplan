// ---------------------------------------------------------------------------
// Render quality tiers. Weak mobile GPUs (e.g. Adreno 610 in a Redmi Pad SE)
// choke on the per-frame shadow pass and 2x pixel ratio when a large plan has
// hundreds of meshes. We auto-detect the device tier and let the user override
// it at runtime; the choice is saved per-device (localStorage), so a kiosk
// tablet keeps "low" while a desktop dashboard keeps "high".
//
// Everything here is device policy, not scene state: what a tier costs, how a
// device is classified, and where the user's pick is remembered.
// ---------------------------------------------------------------------------

import * as THREE from 'three';
import { releaseGl } from './dispose';

export type QualityChoice = 'auto' | 'high' | 'medium' | 'low';
export const QUALITY_CHOICES: QualityChoice[] = ['auto', 'high', 'medium', 'low'];
export type QualityTier = 'high' | 'medium' | 'low';

export interface QualityPreset {
  shadows: boolean;
  shadowType: THREE.ShadowMapType;
  shadowMap: number;
  pixelRatio: number;
  aa: boolean;
  /** Max real point lights. Each one makes EVERY material's fragment shader loop
   *  once more per pixel, so this is the dominant cost of a light-heavy plan on a
   *  weak GPU. Past the cap, lights still glow via their emissive material. */
  maxLights: number;
}

export const QUALITY_PRESETS: Record<QualityTier, QualityPreset> = {
  // "high" is intentionally identical to the original hard-coded settings, so
  // capable devices see zero change.
  high: { shadows: true, shadowType: THREE.PCFSoftShadowMap, shadowMap: 1024, pixelRatio: 2, aa: true, maxLights: 16 },
  medium: { shadows: true, shadowType: THREE.PCFShadowMap, shadowMap: 1024, pixelRatio: 1.5, aa: true, maxLights: 8 },
  // Weak GPUs: drop the shadow pass, keep only a few real point lights (the rest
  // glow emissively for free), and swap to matte Lambert materials (see
  // scene/static-merge.ts). Those cut the per-pixel cost enough to keep a SHARP
  // 1.5x pixel ratio — so a big plan stays smooth without looking soft.
  low: { shadows: false, shadowType: THREE.BasicShadowMap, shadowMap: 512, pixelRatio: 1.5, aa: false, maxLights: 3 },
};

const QUALITY_KEY = 'bms-floorplan-quality';
/** The previous version's key. READ ONLY: that card is still installed on
 *  customer systems, and writing its keys would change its behaviour. */
const OLD_QUALITY_KEY = 'ha3dFloorplanQuality';

export function readStoredQuality(): QualityChoice {
  for (const key of [QUALITY_KEY, OLD_QUALITY_KEY]) {
    try {
      const v = localStorage.getItem(key);
      if (v === 'high' || v === 'medium' || v === 'low' || v === 'auto') return v;
    } catch {
      /* ignore */
    }
  }
  return 'auto';
}

/** Remember the user's pick for this device (never touches the legacy key). */
export function storeQuality(choice: QualityChoice): void {
  try {
    localStorage.setItem(QUALITY_KEY, choice);
  } catch {
    /* ignore */
  }
}

/** The GPU never changes under a running page, so the probe below runs ONCE.
 *  It used to run in the constructor AND on every "Quality" pick, each time
 *  creating a throw-away WebGL context and dropping it on the floor: switch
 *  quality a few times and the browser starts killing older contexts to stay
 *  under its 8-16 limit — including the one drawing the live scene. */
let tierProbe: QualityTier | null = null;

/** Best-effort device tier from the GPU string + CPU/memory hints. */
export function detectTier(): QualityTier {
  if (tierProbe) return tierProbe;
  tierProbe = probeTier();
  return tierProbe;
}

function probeTier(): QualityTier {
  let probeGl: WebGLRenderingContext | null = null;
  try {
    const canvas = document.createElement('canvas');
    const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    probeGl = gl;
    let renderer = '';
    if (gl) {
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      if (ext) renderer = String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || '').toLowerCase();
    }
    // Known weak / low-end mobile GPUs → low.
    if (/adreno \(tm\) (?:[1-5]\d\d|6[0-4]\d)\b|adreno (?:[1-5]\d\d|6[0-4]\d)\b|mali-g5|mali-g3|mali-4|mali-t|powervr|videocore|apple a[789]\b/.test(renderer)) {
      return 'low';
    }
    const mem = (navigator as any).deviceMemory ?? 4;
    const cores = navigator.hardwareConcurrency ?? 4;
    const touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    // A touch device whose GPU string is hidden (privacy) is conservatively
    // treated as a tablet: never auto-select "high" (the user can still opt in).
    if (touch) return mem <= 3 || cores <= 4 ? 'low' : 'medium';
    if (mem <= 4 || cores <= 4) return 'medium';
    return 'high';
  } catch {
    return 'medium';
  } finally {
    // Hand the probe context straight back — see the note above tierProbe.
    releaseGl(probeGl);
  }
}

// ---------------------------------------------------------------------------
// Adaptive floor: if sustained interaction (orbit/pan) runs slow, step the
// renderer down so the view stays smooth no matter how many devices or how much
// furniture the plan grows to. Only ever DEGRADES (never auto-upgrades), to
// avoid oscillation; a manual quality pick or a plan reload resets it.
//
// Sharpness (pixel ratio) is given up LAST — the cheaper, near-invisible cuts
// go first, so it stays smooth AND sharp.
// ---------------------------------------------------------------------------

export interface AdaptiveQualityHost {
  /** Rung 1: drop the shadow pass — cheap, barely noticeable. */
  dropShadows(): void;
  /** Rung 2: matte Lambert materials — a big per-pixel win at full sharpness. */
  useMatteMaterials(): void;
  /** Rung 3, last resort: lower the resolution rendered WHILE dragging. */
  lowerDragResolution(): void;
}

export class AdaptiveQuality {
  private frameMs = 16;
  private slowStreak = 0;
  private rung = 0;

  constructor(private readonly host: AdaptiveQualityHost) {}

  /** How many rungs have been given up (0 = untouched). */
  get level(): number {
    return this.rung;
  }

  /** Back to full quality and re-armed — a deliberate quality pick. */
  reset(): void {
    this.rung = 0;
    this.slowStreak = 0;
    this.frameMs = 16;
  }

  /** Feed one CONTINUOUS frame's duration (seconds). */
  track(seconds: number): void {
    const ms = Math.min(seconds * 1000, 200); // ignore huge gaps (tab was hidden)
    this.frameMs = this.frameMs * 0.9 + ms * 0.1;
    if (this.frameMs > 42) {
      // ~sustained < 24 fps: after ~0.7s of it, drop a rung.
      if (++this.slowStreak > 40 && this.rung < 3) {
        this.stepDown();
        this.slowStreak = 0;
      }
    } else if (this.slowStreak > 0) {
      this.slowStreak--;
    }
  }

  private stepDown(): void {
    this.rung++;
    if (this.rung === 1) this.host.dropShadows();
    else if (this.rung === 2) this.host.useMatteMaterials();
    else this.host.lowerDragResolution();
    this.frameMs = 16; // reset the average so the next rung waits for real slowness
  }
}
