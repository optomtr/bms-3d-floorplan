// ---------------------------------------------------------------------------
// Встроенная SVG-иконка (не эмодзи: на планшетах эмодзи рисуются по-разному).
// ---------------------------------------------------------------------------

import { html, svg } from 'lit';
import { ICON_PATHS } from '../scene/icons';

/** Inline SVG icon (shared path set) — never an emoji, so it renders the same
 *  on every tablet/browser instead of a tofu box. */
export function svgIcon(name: string) {
  const paths = ICON_PATHS[name] ?? ICON_PATHS.dot;
  return html`<svg class="icn" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
  >${paths.map((d) => svg`<path d=${d}></path>`)}</svg>`;
}
