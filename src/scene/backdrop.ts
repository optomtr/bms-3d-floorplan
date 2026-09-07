// ---------------------------------------------------------------------------
// What sits BEHIND the model: the default gradient, and the design photo of the
// room currently in focus.
//
// The photo itself is painted by the CARD, as one CSS layer spanning the whole
// card — the canvas stops at the side panel, so a backdrop drawn inside the
// scene could never reach behind it. This module's job is to decide WHICH url
// is showable and to hand the resolved one over exactly once.
// ---------------------------------------------------------------------------

import * as THREE from 'three';

/**
 * Scene backdrop: instead of a flat clear colour, paint a soft radial
 * "spotlight" gradient behind the model — a touch lighter (and faintly cool)
 * where the building sits, deepening to near-black at the edges. Derived from
 * the configured background colour so a custom `background:` still tints it.
 */
export function makeBackdropTexture(base: string): THREE.Texture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const b = new THREE.Color(base);
  const hex = (c: THREE.Color) => '#' + c.getHexString();
  if (!ctx) {
    // No 2D context (headless/edge case) — fall back to a flat fill.
    return new THREE.Color(base) as unknown as THREE.Texture;
  }

  // 1) Base spotlight: lifted, faintly cool centre behind the model, deepening
  //    to a near-black vignette at the rim.
  const inner = hex(b.clone().lerp(new THREE.Color('#4a5468'), 0.34));
  const mid = hex(b.clone().lerp(new THREE.Color('#000000'), 0.12));
  const outer = hex(b.clone().lerp(new THREE.Color('#000000'), 0.66));
  const base_g = ctx.createRadialGradient(size * 0.5, size * 0.4, 0, size * 0.5, size * 0.42, size * 0.82);
  base_g.addColorStop(0, inner);
  base_g.addColorStop(0.55, mid);
  base_g.addColorStop(1, outer);
  ctx.fillStyle = base_g;
  ctx.fillRect(0, 0, size, size);

  // 2) Brand glows, added softly so the backdrop has a little life without
  //    fighting the model: a cool wash top-right, a warm one low-centre.
  const glow = (x: number, y: number, r: number, rgb: string, a: number) => {
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = a;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(${rgb}, 1)`);
    g.addColorStop(1, `rgba(${rgb}, 0)`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  };
  glow(size * 0.82, size * 0.08, size * 0.7, '91, 184, 232', 0.1); // cool  (#5bb8e8)
  glow(size * 0.5, size * 0.72, size * 0.62, '243, 168, 60', 0.08); // warm (#f3a83c)
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Clean up an image reference before it's stored or loaded.
 *
 * The obvious way to get a URL for a picture dropped in `config/www` is to copy
 * it out of the File editor add-on — but that hands you an ingress link:
 *
 *   /api/hassio_ingress/<session-token>/api/file?filename=/homeassistant/config/www/x.jpg
 *
 * That's the add-on's private read-a-file API, authorised by the ingress session
 * of the browser that copied it. It renders perfectly for that person and 404s
 * on every other device — a wall tablet just shows nothing, and no error
 * surfaces anywhere. HA already serves `config/www` at `/local`, so rewrite it
 * to the path that works for every device. Applied when saving AND when loading,
 * so plans that already hold a raw link start working without re-entering it.
 * Anything else (data URL, /local path, plain absolute URL) is left alone.
 */
export function normalizeAssetRef(value: string): string {
  const s = String(value).trim();
  const q = /[?&]filename=([^&]+)/.exec(s);
  if (q) {
    const www = /(?:^|\/)(?:config\/)?www\/(.+)$/.exec(decodeURIComponent(q[1]));
    if (www) return '/local/' + www[1];
  }
  return s;
}

/** Turn a room-photo reference into a loadable URL: data/blob/absolute URLs
 *  pass through; a root-relative `/local/...` path is prefixed with the HA
 *  origin so it resolves off the file:// kiosk too. */
export function resolveAsset(u: string, imageBase: string): string {
  if (/^(data:|blob:|https?:)/i.test(u)) return u;
  if (u.startsWith('/') && imageBase) return imageBase + u;
  return u;
}

/** URLs to try for a room photo, best first.
 *
 *  A File-editor ingress link only renders for the session that copied it, so
 *  the /local path HA serves the same file from is tried first — that's the one
 *  a tablet can load. But `www` isn't always where the link implies (add-on
 *  mounts differ), and guessing wrong took away a photo that had been working,
 *  so the original link stays as a fallback rather than a replacement. */
export function assetCandidates(u: string, imageBase: string): string[] {
  const raw = String(u).trim();
  const out: string[] = [];
  const local = normalizeAssetRef(raw);
  if (local !== raw) out.push(resolveAsset(local, imageBase));
  out.push(resolveAsset(raw, imageBase));
  return out;
}

/**
 * The focused room's design photo.
 *
 * Contract: `request(url)` says what the plan WANTS; `onResolved` fires with
 * the url that actually decoded (or null for "show the gradient"), and never
 * fires twice for the same answer. Nothing is handed over before the picture is
 * decoded, so what's on screen stays put until the replacement is ready rather
 * than flashing.
 */
export class RoomPhoto {
  /** What the plan asked for (null = no photo for this room). */
  private wanted: string | null = null;
  /** The URL that actually loaded (null = show the gradient). */
  private resolved: string | null = null;
  private imageBase = '';

  constructor(private readonly onResolved: (url: string | null) => void) {}

  /** Origin for resolving root-relative asset paths (e.g. `/local/photo.jpg`).
   *  Empty in the same-origin HA frontend; set to the HA URL in the file://
   *  kiosk, where a bare `/local/...` would otherwise hit the APK's assets. */
  setImageBase(base: string): void {
    this.imageBase = base || '';
  }

  /** The URL currently on screen (null = the gradient). */
  get url(): string | null {
    return this.resolved;
  }

  /** True when the request was already the current one (nothing to load). */
  request(url: string | null): boolean {
    if (url === this.wanted) return true;
    this.wanted = url;

    // No photo for this room: drop straight to the gradient.
    if (!url) {
      this.settle(null);
      return false;
    }

    // Candidates are tried in order, so a photo that isn't where its link
    // implies still shows up.
    const tries = assetCandidates(url, this.imageBase);
    const attempt = (i: number): void => {
      if (this.wanted !== url) return; // room changed while we were loading
      if (i >= tries.length) {
        console.warn('[3d-floorplan] could not load room photo:', tries.join(' | '));
        this.wanted = null;
        this.settle(null); // gradient, rather than a blank backdrop
        return;
      }
      const img = new Image();
      img.onload = () => {
        if (this.wanted !== url) return; // superseded mid-decode
        this.settle(tries[i]);
      };
      img.onerror = () => attempt(i + 1);
      img.src = tries[i];
    };
    attempt(0);
    return false;
  }

  private settle(url: string | null): void {
    if (this.resolved === url) return;
    this.resolved = url;
    this.onResolved(url);
  }
}
