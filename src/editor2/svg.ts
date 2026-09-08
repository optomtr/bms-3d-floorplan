// ---------------------------------------------------------------------------
// Сборка SVG строкой.
//
// Почему строкой: слой рисуется целиком на каждый кадр правки, и склеить
// разметку дешевле, чем сверять дерево узлов. Всё, что приходит от человека
// (имя комнаты, ключ модели), проходит через esc() — иначе кавычка в названии
// «Кухня "у окна"» разваливает атрибут, а угловая скобка вставляет чужой узел.
// ---------------------------------------------------------------------------

/** Экранирование текста и значений атрибутов. */
export function esc(v: unknown): string {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Координата в разметку: два знака хватает для пикселей, а строка короче. */
export function n(v: number): string {
  if (!Number.isFinite(v)) return '0';
  return (Math.round(v * 100) / 100).toString();
}

export function line(x1: number, y1: number, x2: number, y2: number, cls: string, extra = ''): string {
  return `<line class="${cls}" x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}"${extra ? ' ' + extra : ''}/>`;
}

export function circle(cx: number, cy: number, r: number, cls: string, extra = ''): string {
  return `<circle class="${cls}" cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}"${extra ? ' ' + extra : ''}/>`;
}

export function polygon(pts: Array<[number, number]>, cls: string, extra = ''): string {
  const d = pts.map((p) => `${n(p[0])},${n(p[1])}`).join(' ');
  return `<polygon class="${cls}" points="${d}"${extra ? ' ' + extra : ''}/>`;
}

export function polyline(pts: Array<[number, number]>, cls: string, extra = ''): string {
  const d = pts.map((p) => `${n(p[0])},${n(p[1])}`).join(' ');
  return `<polyline class="${cls}" points="${d}"${extra ? ' ' + extra : ''}/>`;
}

export function rect(x: number, y: number, w: number, h: number, cls: string, extra = ''): string {
  return `<rect class="${cls}" x="${n(x)}" y="${n(y)}" width="${n(Math.max(0, w))}" height="${n(Math.max(0, h))}"${extra ? ' ' + extra : ''}/>`;
}

export function text(x: number, y: number, s: string, cls: string, extra = ''): string {
  return `<text class="${cls}" x="${n(x)}" y="${n(y)}"${extra ? ' ' + extra : ''}>${esc(s)}</text>`;
}

/**
 * Подпись на плашке: цифры обязаны читаться поверх стен и пола, поэтому под
 * текстом всегда есть подложка. Ширина считается по числу знаков — точного
 * измерения тут не нужно, а обращение к getBBox() заставило бы браузер
 * пересчитывать раскладку на каждый кадр тяги.
 */
export function badge(x: number, y: number, s: string, cls = 'e2-dim', extra = ''): string {
  const w = Math.max(20, s.length * 6.6 + 10);
  const h = 17;
  return (
    `<g class="e2-badge ${cls}"${extra ? ' ' + extra : ''}>` +
    rect(x - w / 2, y - h / 2, w, h, 'e2-badge-bg', 'rx="4"') +
    text(x, y + 4, s, 'e2-badge-tx', 'text-anchor="middle"') +
    '</g>'
  );
}
