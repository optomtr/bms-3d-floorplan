// ---------------------------------------------------------------------------
// Жизнь панели: заставка по бездействию, скрытый вход в редактор, киоск.
// ---------------------------------------------------------------------------

import type { BmsFloorplanCard } from '../ha-3d-floorplan-card';
import { KIOSK_PATH } from './constants';
import { hasEditPin } from './pin';

/** Open the chrome-free full-screen kiosk page (HA panel only). */
export function openKiosk(): void {
  window.location.href = KIOSK_PATH;
}

export function onHotspotDown(host: BmsFloorplanCard, e: PointerEvent): void {
  clearHotspot(host); // reset any prior state BEFORE recording this press
  (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  host.hotspotStart = { x: e.clientX, y: e.clientY };
  host.hotspotTimer = window.setTimeout(() => {
    host.hotspotTimer = undefined;
    enterEdit(host);
  }, 5000);
}

export function onHotspotMove(host: BmsFloorplanCard, e: PointerEvent): void {
  if (
    host.hotspotStart &&
    Math.hypot(e.clientX - host.hotspotStart.x, e.clientY - host.hotspotStart.y) > 24
  ) {
    clearHotspot(host);
  }
}

export function onHotspotUp(host: BmsFloorplanCard): void {
  return clearHotspot(host);
}

export function clearHotspot(host: BmsFloorplanCard): void {
  if (host.hotspotTimer) {
    clearTimeout(host.hotspotTimer);
    host.hotspotTimer = undefined;
  }
  host.hotspotStart = undefined;
}

// -- Editor -----------------------------------------------------------------

/** Edit button → enter edit, unless a PIN is set and we're still locked. */
export function enterEdit(host: BmsFloorplanCard): void {
  if (hasEditPin(host) && !host.editUnlocked) {
    host.pinError = '';
    host.pinPromptOpen = true;
    return;
  }
  host.doEnterEdit();
}

/** (Re)start the idle countdown. idleMinutes: config, default 10, 0 = disabled. */
export function armIdle(host: BmsFloorplanCard): void {
  if (host.idleTimer) window.clearTimeout(host.idleTimer);
  const min = host.config?.idleMinutes ?? 10;
  if (!(min > 0) || host.editing) return; // never dim while editing
  host.idleTimer = window.setTimeout(() => {
    host.now = new Date();
    host.idle = true;
  }, min * 60000);
}

export function wake(host: BmsFloorplanCard): void {
  if (host.idle) host.idle = false;
  armIdle(host);
}

export function onSleep(host: BmsFloorplanCard, e: Event): void {
  if (e && 'stopPropagation' in e) e.stopPropagation();
  if (host.idleTimer) window.clearTimeout(host.idleTimer);
  host.now = new Date();
  host.idle = true;
}
