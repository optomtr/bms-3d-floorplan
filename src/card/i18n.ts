// ---------------------------------------------------------------------------
// Язык интерфейса: русский по умолчанию, форматирование времени и подписей.
// ---------------------------------------------------------------------------

import type { BmsFloorplanCard } from '../ha-3d-floorplan-card';
import type { QualityChoice } from '../scene/scene-manager';
import { RU_STRINGS } from './constants';

/** True when the UI should be Russian.
 *
 *  This is a BMS product: Russian is the DEFAULT, not something that switches
 *  itself off because Home Assistant happens to be set to English. Set
 *  `language: en` in the card config for English, or `language: auto` for the
 *  old behaviour (follow the HA user, then the browser). */
export function isRuLang(host: BmsFloorplanCard): boolean {
  const pref = host.config?.language;
  if (pref === 'ru') return true;
  if (pref === 'en') return false;
  if (pref === 'auto') {
    const l = (
      host.hass?.language ||
      (typeof navigator !== 'undefined' ? navigator.language : '') ||
      ''
    ).toLowerCase();
    return l.startsWith('ru');
  }
  return true;
}

/** Translate a user-visible string. English is the key + fallback. */
export function uiText(host: BmsFloorplanCard, en: string): string {
  return host.isRu ? RU_STRINGS[en] ?? en : en;
}

export function qualityLabel(host: BmsFloorplanCard, q: QualityChoice): string {
  return host.t({ auto: 'Auto', high: 'High', medium: 'Medium', low: 'Low' }[q]);
}

/** Bilingual one-liner for text added after RU_STRINGS was written. */
export function uiTx(host: BmsFloorplanCard, ru: string, en: string): string {
  return host.isRu ? ru : en;
}

export function localeTag(host: BmsFloorplanCard): string {
  if (host.isRu) return 'ru-RU';
  return host.hass?.locale?.language || host.hass?.language || 'en';
}

export function fmtClockTime(host: BmsFloorplanCard): string {
  const h = String(host.now.getHours()).padStart(2, '0');
  const m = String(host.now.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

export function fmtClockDate(host: BmsFloorplanCard): string {
  try {
    const s = new Intl.DateTimeFormat(host.uiLocale, { weekday: 'long', day: 'numeric', month: 'long' }).format(host.now);
    return s.charAt(0).toUpperCase() + s.slice(1);
  } catch {
    return host.now.toDateString();
  }
}

/** Best-effort icon for a room pill, guessed from its (localised) name. */
export function roomIcon(name?: string): string {
  const n = (name || '').toLowerCase();
  const has = (...ws: string[]) => ws.some((w) => n.includes(w));
  if (has('гост', 'зал', 'living', 'lounge')) return 'couch';
  if (has('кухн', 'kitchen')) return 'counter';
  if (has('спал', 'bed')) return 'bed';
  if (has('дет', 'child', 'kid', 'nursery')) return 'child';
  if (has('ванн', 'санузел', 'bath', 'toilet', 'wc')) return 'bath';
  if (has('прихож', 'коридор', 'hall', 'entry', 'corridor')) return 'door';
  return 'room';
}

export function climateModeLabel(host: BmsFloorplanCard, mode: string): string {
  return host.t(
    { heat: 'Heating', cool: 'Cooling', auto: 'Auto', fan_only: 'Ventilation', dry: 'Drying', heat_cool: 'Auto' }[mode] ?? 'Heating',
  );
}

export function ruPlural(n: number, one: string, few: string, many: string): string {
  const a = n % 10, b = n % 100;
  if (a === 1 && b !== 11) return one;
  if (a >= 2 && a <= 4 && (b < 10 || b >= 20)) return few;
  return many;
}
