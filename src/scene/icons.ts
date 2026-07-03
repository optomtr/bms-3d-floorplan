// ---------------------------------------------------------------------------
// Shared vector icons (24x24 viewBox, stroked paths).
//
// The SAME path data is used two ways so icons look identical everywhere and
// never depend on emoji / system fonts (some tablets render ⏻ ❄ 🔥 as a tofu box):
//   - the control popup renders them as inline <svg> (see the card's `ic()`),
//   - the floating 3D device markers rasterize them onto a <canvas> sprite.
// ---------------------------------------------------------------------------

export const ICON_PATHS: Record<string, string[]> = {
  power: ['M12 4v7', 'M8.5 6.6a6 6 0 1 0 7 0'],
  bulb: [
    'M12 3a6 6 0 0 0-3.5 10.9c.5.4.8.9.9 1.6l.1.5h5l.1-.5c.1-.7.4-1.2.9-1.6A6 6 0 0 0 12 3z',
    'M9.5 19h5',
    'M10.5 21.5h3',
  ],
  snow: ['M12 3v18', 'M4.2 7.5l15.6 9', 'M19.8 7.5l-15.6 9'],
  heat: [
    'M12 3.5c3 3.7 5 6 5 9a5 5 0 0 1-10 0c0-1.6.7-3 1.7-4.1.4 1 1.2 1.7 2 1.8-1.2-2.1.3-5 1.3-6.7z',
  ],
  auto: ['M20.5 11.5a8.5 8.5 0 1 0-2.6 6.6', 'M20.8 20.3v-5h-5'],
  dry: ['M12 3.5c4 4.6 6 7.2 6 10.2a6 6 0 0 1-12 0c0-3 2-5.6 6-10.2z'],
  fan: [
    'M3 8h11a3 3 0 1 0-3-3',
    'M3 12h16a3 3 0 1 1-3 3',
    'M3 16h8.5a2.5 2.5 0 1 1-2.5 2.5',
  ],
  heatcool: ['M7 10l5-5 5 5', 'M7 15l5 5 5-5'],
  volUp: ['M4 9.5v5h3.5L13 19V5L7.5 9.5z', 'M16.5 8.8a4.5 4.5 0 0 1 0 6.4', 'M19.2 6a8 8 0 0 1 0 12'],
  volDown: ['M4 9.5v5h3.5L13 19V5L7.5 9.5z', 'M16.5 9.5a4 4 0 0 1 0 5'],
  mute: ['M4 9.5v5h3.5L13 19V5L7.5 9.5z', 'M16.5 9.5l5 5', 'M21.5 9.5l-5 5'],
  lockClosed: ['M6 11h12v9H6z', 'M8.5 11V7.5a3.5 3.5 0 0 1 7 0V11'],
  lockOpen: ['M6 11h12v9H6z', 'M8.5 11V7.5a3.5 3.5 0 0 1 6.8-1.6'],
  chevUp: ['M5 15l7-7 7 7'],
  chevDown: ['M5 9l7 7 7-7'],
  stop: ['M6.5 6.5h11v11h-11z'],
  minus: ['M5 12h14'],
  plus: ['M12 5v14', 'M5 12h14'],
  tv: ['M3 5.5h18v12H3z', 'M8.5 21h7', 'M12 17.5v3.5'],
  curtain: ['M3.5 4h17', 'M5.5 4v16', 'M9.2 4v16', 'M12 4v16', 'M14.8 4v16', 'M18.5 4v16'],
  gauge: ['M4.5 17.5a8 8 0 1 1 15 0', 'M12 15l4.5-3.2'],
  camera: ['M3 8h3.5l1.5-2h6l1.5 2H21v10H3z', 'M12 16.5a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4z'],
  dot: ['M12 12m-3.2 0a3.2 3.2 0 1 0 6.4 0a3.2 3.2 0 1 0-6.4 0'],
  // Room / house (used by the per-room grouped marker).
  room: ['M4 11l8-6 8 6', 'M6 10v9h12v-9', 'M10.5 19v-5h3v5'],
};

/** Icon for a climate HVAC mode chip (undefined → fall back to the text label). */
export function climateModeIconName(mode: string): string | undefined {
  return (
    {
      off: 'power',
      cool: 'snow',
      heat: 'heat',
      auto: 'auto',
      dry: 'dry',
      fan_only: 'fan',
      heat_cool: 'heatcool',
    } as Record<string, string>
  )[mode];
}

/** Icon for a floating device marker, by binding behavior. */
export function markerIconName(behavior: string): string {
  return (
    {
      light: 'bulb',
      switch: 'power',
      climate: 'snow',
      media_player: 'tv',
      cover: 'curtain',
      lock: 'lockClosed',
      fan: 'fan',
      sensor: 'gauge',
      binary_sensor: 'gauge',
      camera: 'camera',
      room: 'room',
    } as Record<string, string>
  )[behavior] ?? 'dot';
}

/**
 * Draw a circular badge + the behavior's icon onto a canvas, for use as a 3D
 * marker sprite texture. Self-contained vector drawing — no font dependency.
 */
export function drawMarkerCanvas(behavior: string): HTMLCanvasElement {
  const SZ = 128;
  const canvas = document.createElement('canvas');
  canvas.width = SZ;
  canvas.height = SZ;
  const ctx = canvas.getContext('2d')!;

  // Translucent badge so a white-on-white icon stays visible on light walls.
  ctx.beginPath();
  ctx.arc(SZ / 2, SZ / 2, 54, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(24,26,32,0.82)';
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = 'rgba(255,255,255,0.6)';
  ctx.stroke();

  // Icon centered, scaled from the 24-unit viewBox.
  const paths = ICON_PATHS[markerIconName(behavior)] ?? ICON_PATHS.dot;
  const S = 62;
  const k = S / 24;
  ctx.save();
  ctx.translate((SZ - S) / 2, (SZ - S) / 2);
  ctx.scale(k, k);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  for (const d of paths) ctx.stroke(new Path2D(d));
  ctx.restore();

  return canvas;
}
