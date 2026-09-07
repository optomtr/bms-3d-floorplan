// ---------------------------------------------------------------------------
// История датчиков из HA для суточного графика.
// ---------------------------------------------------------------------------

import type { BmsFloorplanCard } from '../ha-3d-floorplan-card';
import { HIST_CACHE_MAX } from './constants';

/** Recent samples for a sensor (the sparkline). Returns cached points and, when
 *  the cache is missing or older than 5 min, kicks off a background fetch
 *  (guarded, so a render may call it freely). null until the first fetch lands. */
export function historyPts(host: BmsFloorplanCard, entityId?: string): [number, number][] | null {
  if (!entityId) return null;
  const c = host.histCache.get(entityId);
  if (!c || Date.now() - c.ts > 5 * 60 * 1000) void fetchHistory(host, entityId);
  return c ? c.pts : null;
}

/** Store a fetched series, keeping the cache BOUNDED. A panel that runs for
 *  weeks visits many rooms; without a cap this map grew a 120-point series
 *  per sensor ever looked at and never gave any of it back. Oldest fetch
 *  first — it will simply be re-fetched if that room is opened again. */
export function putHistory(host: BmsFloorplanCard, entityId: string, pts: [number, number][]): void {
  host.histCache.set(entityId, { pts, ts: Date.now() });
  while (host.histCache.size > HIST_CACHE_MAX) {
    let oldestKey: string | null = null;
    let oldestTs = Infinity;
    for (const [k, v] of host.histCache) {
      if (v.ts < oldestTs) { oldestTs = v.ts; oldestKey = k; }
    }
    if (!oldestKey) break;
    host.histCache.delete(oldestKey);
  }
}

/** Pull the last 24h of a sensor from HA's history. Tries the websocket
 *  (history/history_during_period) first, then falls back to the REST history
 *  API — the data is all in HA, so one of the two reaches it on any core.
 *  Failures cache an empty series so we don't hammer, and the graph just
 *  doesn't show. */
export async function fetchHistory(host: BmsFloorplanCard, entityId: string): Promise<void> {
  const hass = host.hass as any;
  if ((!hass?.callWS && !hass?.callApi) || host.histInFlight.has(entityId)) return;
  host.histInFlight.add(entityId);
  const end = new Date();
  const start = new Date(end.getTime() - 24 * 3600 * 1000);
  const toPts = (rows: any[]): [number, number][] => {
    const out: [number, number][] = [];
    for (const r of rows ?? []) {
      const v = Number(r.s ?? r.state);
      const lu = r.lu ?? r.last_updated ?? r.last_changed;
      const t = typeof lu === 'number' ? lu * 1000 : Date.parse(lu);
      if (Number.isFinite(v) && Number.isFinite(t)) out.push([t, v]);
    }
    return out;
  };
  try {
    let pts: [number, number][] = [];
    if (hass.callWS) {
      try {
        const res = await hass.callWS({
          type: 'history/history_during_period',
          start_time: start.toISOString(),
          end_time: end.toISOString(),
          entity_ids: [entityId],
          minimal_response: true,
          no_attributes: true,
          significant_changes_only: false,
        });
        pts = toPts(res?.[entityId] ?? []);
      } catch { /* fall through to REST */ }
    }
    if (!pts.length && hass.callApi) {
      const path =
        `history/period/${start.toISOString()}?filter_entity_id=${entityId}` +
        `&end_time=${encodeURIComponent(end.toISOString())}&minimal_response&no_attributes`;
      const rest = await hass.callApi('GET', path);
      pts = toPts(Array.isArray(rest) ? (rest[0] ?? []) : []);
    }
    // Down-sample a long series so the SVG stays light (≤120 points).
    const step = Math.ceil(pts.length / 120) || 1;
    putHistory(host, entityId, step > 1 ? pts.filter((_, i) => i % step === 0) : pts);
  } catch {
    putHistory(host, entityId, []);
  } finally {
    host.histInFlight.delete(entityId);
    host.requestUpdate();
  }
}
