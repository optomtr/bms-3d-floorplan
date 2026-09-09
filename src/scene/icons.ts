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
  // Тёплый пол: линия пола и две волны тепла над ней. Отдельный знак от
  // «пламени» (конвектор/радиатор) — владелец различает их на слух и на плане.
  floorHeat: [
    'M3.4 19.8h17.2',
    'M9 16.4c-2-2 2-3.6 0-5.6s2-3.6 0-5.6',
    'M15 16.4c-2-2 2-3.6 0-5.6s2-3.6 0-5.6',
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
  play: ['M8 5.2l11 6.8-11 6.8z'],
  pause: ['M9 5v14', 'M15 5v14'],
  skipPrev: ['M7 6v12', 'M18 6l-8 6 8 6z'],
  skipNext: ['M17 6v12', 'M6 6l8 6-8 6z'],
  // Chain link — the speaker-group ("sync these speakers together") button.
  link: ['M9.5 14.5l5-5', 'M8.2 11.8l-1.7 1.7a3 3 0 0 0 4.24 4.24l1.7-1.7', 'M15.8 12.2l1.7-1.7a3 3 0 0 0-4.24-4.24l-1.7 1.7'],
  album: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', 'M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z'],
  grid: ['M5.5 5.5h4v4h-4z', 'M14.5 5.5h4v4h-4z', 'M5.5 14.5h4v4h-4z', 'M14.5 14.5h4v4h-4z'],
  moon: ['M20 14.5A8 8 0 0 1 9.5 4a7 7 0 1 0 10.5 10.5z'],
  close: ['M6 6l12 12', 'M18 6l-12 12'],
  chevRight: ['M9 5l7 7-7 7'],
  arrowLeft: ['M19 12H5', 'M11 6l-6 6 6 6'],
  shieldCheck: ['M12 3l7 3v5c0 4.6-3 7.7-7 9-4-1.3-7-4.4-7-9V6z', 'M9 12l2 2 4-4'],
  minus: ['M5 12h14'],
  plus: ['M12 5v14', 'M5 12h14'],
  tv: ['M3 5.5h18v12H3z', 'M8.5 21h7', 'M12 17.5v3.5'],
  curtain: ['M3.5 4h17', 'M5.5 4v16', 'M9.2 4v16', 'M12 4v16', 'M14.8 4v16', 'M18.5 4v16'],
  gauge: ['M4.5 17.5a8 8 0 1 1 15 0', 'M12 15l4.5-3.2'],
  chart: ['M4 4v16h16', 'M7.5 14l3-3.2 3 2 4-5.3'],
  camera: ['M3 8h3.5l1.5-2h6l1.5 2H21v10H3z', 'M12 16.5a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4z'],
  eye: ['M2 12s3.6-6.5 10-6.5 10 6.5 10 6.5-3.6 6.5-10 6.5S2 12 2 12z', 'M12 9.3a2.7 2.7 0 1 0 0 5.4 2.7 2.7 0 0 0 0-5.4z'],
  doorOpen: ['M13 21V3.6L5 5.2V21', 'M4 21h13', 'M17 21V6l3 1.2V21', 'M10.6 12.4v1.6'],
  dot: ['M12 12m-3.2 0a3.2 3.2 0 1 0 6.4 0a3.2 3.2 0 1 0-6.4 0'],
  // Room / house (used by the per-room grouped marker).
  room: ['M4 11l8-6 8 6', 'M6 10v9h12v-9', 'M10.5 19v-5h3v5'],
  // Header chips + status dots for the room control panel.
  thermo: ['M12 4a2 2 0 0 0-2 2v8.1a3.5 3.5 0 1 0 4 0V6a2 2 0 0 0-2-2z', 'M12 9v5.5'],
  drop: ['M12 3.6c3.6 4.3 5.6 6.8 5.6 9.6a5.6 5.6 0 0 1-11.2 0c0-2.8 2-5.3 5.6-9.6z'],
  wifi: ['M4.5 9.5a11 11 0 0 1 15 0', 'M7.5 12.8a6.5 6.5 0 0 1 9 0', 'M10.4 16a2.3 2.3 0 0 1 3.2 0', 'M12 19h.01'],
  shield: ['M12 3l7 3v5c0 4.6-3 7.7-7 9-4-1.3-7-4.4-7-9V6z'],
  // Room-type glyphs for the pill bar (best-effort match to the mockup).
  couch: ['M4 12v5', 'M20 12v5', 'M4 14h16', 'M6 14v-3a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3', 'M6.5 17v1.5', 'M17.5 17v1.5'],
  counter: ['M3.5 10h17', 'M4.5 10v8.5', 'M19.5 10v8.5', 'M7 7.5l1-2.5h8l1 2.5', 'M9 14v2'],
  bed: ['M3 18v-9', 'M3 14h18', 'M21 18v-4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2', 'M7 12v-1.3A1.7 1.7 0 0 1 8.7 9h2a1.7 1.7 0 0 1 1.7 1.7V12'],
  child: ['M12 5.6a1.8 1.8 0 1 0 .01 0', 'M12 8.4v5.6', 'M8.8 10.6h6.4', 'M9.4 18l2.6-3.2 2.6 3.2'],
  bath: ['M5 12V6.6A1.6 1.6 0 0 1 6.6 5a1.5 1.5 0 0 1 1.5 1.1', 'M3.5 12h17', 'M5 12v2.6a3.4 3.4 0 0 0 3.4 3.4h7.2a3.4 3.4 0 0 0 3.4-3.4V12', 'M7 18l-1 2', 'M17 18l1 2'],
  door: ['M6 3.6h12v16.8H6z', 'M14.4 12h.01'],

  // -- Состояние связи -------------------------------------------------------
  // Перечёркнутая «волна»: устройство не отвечает. Отдельный знак, а не просто
  // погашенная лампа — «выключено» и «нет связи» человек обязан различать.
  wifiOff: [
    'M4.5 9.5a11 11 0 0 1 5.2-2.8',
    'M14.6 6.8a11 11 0 0 1 4.9 2.7',
    'M7.5 12.8a6.5 6.5 0 0 1 2.4-1.5',
    'M14.4 11.5a6.5 6.5 0 0 1 2.1 1.3',
    'M10.4 16a2.3 2.3 0 0 1 3.2 0',
    'M12 19h.01',
    'M3.5 3.5l17 17',
  ],
  warn: ['M12 3.8L21.2 19.6H2.8z', 'M12 9.6v4.6', 'M12 17.1h.01'],
  refresh: ['M20 12a8 8 0 1 1-2.34-5.66', 'M20.4 3.6v5h-5'],
  loading: ['M12 3.5a8.5 8.5 0 1 0 8.5 8.5'],

  // -- Редактор: инструменты и действия --------------------------------------
  pencil: ['M4 20l1-4.2L16.2 4.6a2 2 0 0 1 2.8 2.8L7.8 19z', 'M14.6 6.6l2.8 2.8'],
  trash: ['M4.5 7h15', 'M9.5 7V4.8h5V7', 'M6.8 7l1 12.2h8.4L17 7', 'M10.4 10.4v6', 'M13.6 10.4v6'],
  search: ['M11 4.2a6.8 6.8 0 1 0 0 13.6 6.8 6.8 0 0 0 0-13.6z', 'M15.9 15.9L20.8 20.8'],
  magnet: ['M5 4.2h4v8.3a3 3 0 0 0 6 0V4.2h4', 'M5 9.4h4', 'M15 9.4h4', 'M5 4.2v5.2', 'M19 4.2v5.2'],
  ruler: ['M2.9 15.1L15.1 2.9l6 6L8.9 21.1z', 'M6.6 11.4l2 2', 'M9.6 8.4l2 2', 'M12.6 5.4l2 2'],
  pin: ['M12 21.2s6.2-6 6.2-10.4a6.2 6.2 0 1 0-12.4 0C5.8 15.2 12 21.2 12 21.2z', 'M12 12.8a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4z'],
  download: ['M12 3.6v10.6', 'M7.8 10.4l4.2 4.2 4.2-4.2', 'M4.5 19.8h15'],
  upload: ['M12 20.4V9.8', 'M7.8 13.6L12 9.4l4.2 4.2', 'M4.5 4.2h15'],
  save: ['M5 4.6h11.2L19.4 8v11.4H5z', 'M8.6 4.6v4.8h6.8V4.6', 'M8 19.4v-5.2h8v5.2'],
  check: ['M4.8 12.6l4.8 4.8L19.2 7.2'],
  undo: ['M9 6.6L4.6 11 9 15.4', 'M4.6 11h9a5.4 5.4 0 0 1 0 10.8h-3'],
  redo: ['M15 6.6L19.4 11 15 15.4', 'M19.4 11h-9a5.4 5.4 0 0 0 0 10.8h3'],
  rotate: ['M20 12a8 8 0 1 1-2.34-5.66', 'M20.4 3.6v5h-5', 'M12 15.4a3.4 3.4 0 1 0 0-6.8 3.4 3.4 0 0 0 0 6.8z'],
  merge: ['M3.5 6.5h4.8l4 5.5h7.2', 'M3.5 17.5h4.8l2.6-3.6', 'M16.6 8.6L20 12l-3.4 3.4'],
  // Стена (кирпичная кладка), дуга, проём, пол — инструменты черчения.
  wall: ['M3.5 6h17v12h-17z', 'M3.5 12h17', 'M9.5 6v6', 'M15 12v6'],
  arc: ['M3.8 19.6A15.8 15.8 0 0 1 19.6 3.8', 'M3.8 19.6h.01', 'M19.6 3.8h.01'],
  windowIcon: ['M4 4.4h16v15.2H4z', 'M12 4.4v15.2', 'M4 12h16'],
  opening: ['M5 20.2V11a7 7 0 0 1 14 0v9.2', 'M2.4 20.2h19.2'],
  floorArea: ['M2.6 16.4l5.2-8.8h13.6l-5.2 8.8z', 'M6.4 12h11'],
  cursor: ['M6 3.4l12.2 8.2-5.4 1.4-2.2 5.6z'],
  rect: ['M4 6.4h16v11.2H4z'],
  lshape: ['M4.4 4.4h7v8.2h8.2v7H4.4z'],
  bevel: ['M8.2 4.4H19.6v15.2H4.4V8.2z'],
  layers: ['M12 3.4l8.4 4.4-8.4 4.4-8.4-4.4z', 'M4.4 12.4L12 16.4l7.6-4', 'M4.4 16.4L12 20.4l7.6-4'],
  gear: [
    'M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4z',
    'M19.3 13.6l1.8 1-1.6 2.8-2-.6a7.6 7.6 0 0 1-1.7 1l-.4 2.1h-3.2l-.4-2.1a7.6 7.6 0 0 1-1.7-1l-2 .6-1.6-2.8 1.8-1a7.7 7.7 0 0 1 0-3.2l-1.8-1 1.6-2.8 2 .6c.5-.4 1.1-.75 1.7-1l.4-2.1h3.2l.4 2.1c.6.25 1.2.6 1.7 1l2-.6 1.6 2.8-1.8 1a7.7 7.7 0 0 1 0 3.2z',
  ],
  image: ['M3.6 5.2h16.8v13.6H3.6z', 'M3.6 15.4l5-4.4 3.9 3.4 3.4-2.9 4.5 3.9', 'M9.2 9.4a1.35 1.35 0 1 1-2.7 0 1.35 1.35 0 0 1 2.7 0'],
  arrowUp: ['M12 19.4V5', 'M6 11l6-6 6 6'],
  arrowDown: ['M12 4.6V19', 'M6 13l6 6 6-6'],
  arrowRight: ['M5 12h14', 'M13 6l6 6-6 6'],
  chevLeft: ['M15 5l-7 7 7 7'],
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

/**
 * Кружок-значок состояния климата, для маленького спрайта РЯДОМ с «домиком»
 * комнаты. Рисуется тем же набором путей, что и всё остальное (никаких эмодзи:
 * на части планшетов ❄🔥 превращаются в квадрат-«тофу»).
 *
 * Две заливки на один и тот же знак, потому что на кружке размером в треть
 * «домика» цвет один читается плохо:
 *   filled = true  — светлый диск и тёмный знак: спрайт красится в цвет типа и
 *                    выглядит ГОРЯЩИМ (устройство работает или простаивает);
 *   filled = false — тёмный диск и светлый знак: выключено, кружок гасится
 *                    серым и уходит на второй план.
 */
export function drawBadgeCanvas(iconName: string, filled: boolean): HTMLCanvasElement {
  const SZ = 72;
  const canvas = document.createElement('canvas');
  canvas.width = SZ;
  canvas.height = SZ;
  const ctx = canvas.getContext('2d')!;

  ctx.beginPath();
  ctx.arc(SZ / 2, SZ / 2, 32, 0, Math.PI * 2);
  ctx.fillStyle = filled ? 'rgba(255,255,255,0.96)' : 'rgba(18,20,25,0.88)';
  ctx.fill();
  // Тёмный кант у горящего кружка: цветной диск иначе теряется на светлой стене.
  ctx.lineWidth = 4;
  ctx.strokeStyle = filled ? 'rgba(16,18,23,0.9)' : 'rgba(255,255,255,0.6)';
  ctx.stroke();

  const paths = ICON_PATHS[iconName] ?? ICON_PATHS.dot;
  const S = 40;
  const k = S / 24;
  ctx.save();
  ctx.translate((SZ - S) / 2, (SZ - S) / 2);
  ctx.scale(k, k);
  // Толще, чем у большого маркера: на 72 px тонкая линия просто исчезает.
  ctx.strokeStyle = filled ? '#14171c' : '#ffffff';
  ctx.lineWidth = 2.6;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  for (const d of paths) ctx.stroke(new Path2D(d));
  ctx.restore();

  return canvas;
}
