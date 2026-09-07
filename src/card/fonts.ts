// ---------------------------------------------------------------------------
// Разовая регистрация вебшрифта Onest на уровне документа.
// ---------------------------------------------------------------------------

import { FONT_FACE_CSS } from '../scene/fonts';

// -- Lit lifecycle ----------------------------------------------------------

/** Register the Onest webfont once at the document level. @font-face rules are
 *  ignored inside Shadow DOM, so the card's shadow styles can only *use* the
 *  family if it's declared in the light DOM (here). Guarded so many cards share
 *  the one <style>. */
export function injectFonts(): void {
  if (typeof document === 'undefined' || document.getElementById('ha3d-onest-font')) return;
  const style = document.createElement('style');
  style.id = 'ha3d-onest-font';
  style.textContent = FONT_FACE_CSS;
  (document.head || document.documentElement).appendChild(style);
}
