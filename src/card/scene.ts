// ---------------------------------------------------------------------------
// Мост к 3D-сцене: создание, разбор, выбор комнаты, режимы вида.
// ---------------------------------------------------------------------------

import type { BmsFloorplanCard } from '../ha-3d-floorplan-card';
import { releaseThumbnailRenderer } from '../furniture/thumbnails';
import { ClickResult, QualityChoice, RoomInfo, SceneManager } from '../scene/scene-manager';
import { pendingTeardown } from './constants';
import { qualityLabel } from './i18n';
import { loadActiveProject } from './projects';

/** Place the open control popup above the tap, or below (clamped) when there
 *  isn't room above — measured from the popup's actual height so a tall
 *  multi-device popup is never cut off by the card edges. */
export function positionControlPopup(host: BmsFloorplanCard): void {
  const el = host.renderRoot?.querySelector?.('.control-popup') as HTMLElement | null;
  if (!el) return;
  const cardH = host.viewport?.clientHeight ?? el.parentElement?.clientHeight ?? 480;
  const h = el.offsetHeight;
  const gap = 14;
  const margin = 8;
  const anchorY = host.controlPos[1];
  let top = anchorY - gap - h; // prefer sitting above the tapped object
  if (top < margin) {
    // Not enough room above → drop below, clamped to stay fully visible.
    top = anchorY + gap;
    if (top + h > cardH - margin) top = Math.max(margin, cardH - h - margin);
  }
  el.style.top = `${top}px`;
}

// -- Scene setup ------------------------------------------------------------

export function initScene(host: BmsFloorplanCard): void {
  if (!host.viewport) return;
  const bg = host.config?.background ?? '#1b1d22';
  host.sceneManager = new SceneManager(host.viewport, bg);
  host.qualityChoice = host.sceneManager.getQualityChoice();
  if (host.config?.cameraDistance) host.sceneManager.setCameraDistance(host.config.cameraDistance);
  host.sceneManager.setPickHandler((r) => handlePick(host, r));
  host.sceneManager.setRoomsHandler((rooms) => onRoomsChanged(host, rooms));
  host.sceneManager.setBackdropHandler((url) => {
    host.roomPhoto = url;
    host.roomPhotoBaked = null;
    if (url) bakeRoomPhoto(host, url);
  });
  host.sceneManager.start();
  loadActiveProject(host);
}

/** Render the room photo once with its blur/dim already applied, so the card
 *  can show a plain bitmap instead of a live CSS filter.
 *
 *  The filter version is re-evaluated by the compositor whenever the backdrop
 *  behind it repaints — which, with the 3D sitting on top, is every frame of
 *  every drag. Baking is the identical picture for a one-off cost. The photo
 *  is capped at 1280px on upload, so this is a single small draw.
 *
 *  Falls back to the raw photo (with the CSS filter) if anything here can't
 *  run: no 2D context, a cross-origin URL that taints the canvas, or a photo
 *  that fails to decode. */
export function bakeRoomPhoto(host: BmsFloorplanCard, url: string): void {
  const img = new Image();
  img.crossOrigin = 'anonymous'; // needed for /local/… to stay exportable
  img.onload = () => {
    if (host.roomPhoto !== url) return; // room changed while decoding
    try {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      if (!w || !h) return;
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      // Same look as the CSS rule this replaces. The scale-up compensates for
      // the blur softening the edges, exactly as the transform did.
      ctx.filter = 'blur(6px) brightness(0.92)';
      const over = 0.06;
      ctx.drawImage(img, -w * over * 0.5, -h * over * 0.5, w * (1 + over), h * (1 + over));
      const baked = canvas.toDataURL('image/jpeg', 0.86);
      if (host.roomPhoto === url) host.roomPhotoBaked = baked;
    } catch {
      /* tainted canvas or out of memory — the raw photo + CSS filter stands in */
    }
  };
  img.onerror = () => {
    /* the scene already validated it loads; nothing to do but keep the raw one */
  };
  img.src = url;
}

export function handlePick(host: BmsFloorplanCard, r: ClickResult | null): void {
  if (!r || !host.hass) {
    host.controlOpen = false;
    return;
  }
  // Anchor the popup near the tap (final vertical placement is clamped in
  // positionControlPopup once its real height is known).
  const vw = host.viewport?.clientWidth ?? 360;
  const vh = host.viewport?.clientHeight ?? 480;
  const sx = r.screen ? r.screen[0] : vw / 2;
  const sy = r.screen ? r.screen[1] : vh / 2;
  const x = Math.max(150, Math.min(vw - 150, sx));
  host.controlPos = [x, Math.max(0, Math.min(vh, sy))];

  if (r.roomKey && r.roomEntities && r.roomEntities.length) {
    // A room pin → fill the right-side panel with that room's devices.
    selectRoom(host, r.roomKey);
    return;
  }
  // A device tap → the tapped entity + any others stacked at the same spot.
  const near = r.point ? host.sceneManager!.entitiesNear(r.point, 1.6) : [];
  const list = near.length ? near : [{ entity_id: r.entity_id, behavior: r.behavior }];
  const seen = new Set<string>();
  host.controlEntities = [r.entity_id, ...list.map((e) => e.entity_id)].filter(
    (id) => id && !seen.has(id) && seen.add(id),
  );
  host.controlRoom = null;
  host.controlCategory = null;
  host.controlOpenedAt = performance.now();
  host.controlOpen = true;
  host.requestUpdate();
}

/** React to the scene's room list (plan load / floor switch). The panel opens
 *  with NO room in focus (full 3D + a hint); only keep a still-valid selection. */
export function onRoomsChanged(host: BmsFloorplanCard, rooms: RoomInfo[]): void {
  host.rooms = rooms;
  if (host.activeRoomKey && !rooms.some((r) => r.key === host.activeRoomKey)) {
    host.activeRoomKey = null;
  }
  // The Обзор detail uses floor-qualified keys ("f{n}::…"), which never match
  // the active-floor list here — those are validated against the whole-home
  // map at render time (renderDetail returns nothing if a room vanished).
  if (host.detailRoomKey && !host.detailRoomKey.includes('::') && !rooms.some((r) => r.key === host.detailRoomKey)) {
    host.detailRoomKey = null;
  }
  host.sceneManager?.selectRoom(host.activeRoomKey);
  host.requestUpdate();
}

/** Select a room (or toggle off if it's already selected). */
export function selectRoom(host: BmsFloorplanCard, key: string | null): void {
  host.activeRoomKey = host.activeRoomKey === key ? null : key;
  host.sparkMetric = 'auto'; // fresh graph view when a different room opens
  host.sceneManager?.selectRoom(host.activeRoomKey);
  host.requestUpdate();
}

/** Tap a temperature/humidity chip to graph just that metric; tap it again
 *  (or another) to switch. */
export function toggleSparkMetric(host: BmsFloorplanCard, m: 'temp' | 'floor' | 'humidity'): void {
  host.sparkMetric = host.sparkMetric === m ? 'auto' : m;
}

export function activeRoom(host: BmsFloorplanCard): RoomInfo | undefined {
  return host.activeRoomKey ? host.rooms.find((r) => r.key === host.activeRoomKey) : undefined;
}

export function openDetail(host: BmsFloorplanCard, key: string): void {
  host.detailRoomKey = key;
  host.requestUpdate();
}

export function closeDetail(host: BmsFloorplanCard): void {
  host.detailRoomKey = null;
  host.requestUpdate();
}

export function detailRoom(host: BmsFloorplanCard): RoomInfo | undefined {
  if (!host.detailRoomKey) return undefined;
  return host.overviewRoomByKey.get(host.detailRoomKey) ?? host.rooms.find((r) => r.key === host.detailRoomKey);
}

export function closeControl(host: BmsFloorplanCard): void {
  // A touch tap fires a synthesized "ghost" click ~300ms later that lands on
  // the freshly-rendered backdrop; ignore closes within that window so the
  // popup doesn't flash open and vanish on tablets.
  if (performance.now() - host.controlOpenedAt < 400) return;
  host.controlOpen = false;
  host.controlRoom = null;
  host.controlCategory = null;
}

export function onSelectFloor(host: BmsFloorplanCard, index: number): void {
  host.activeFloorIndex = index;
  host.sceneManager?.setActiveFloor(index);
  // Re-sync state to the now-visible floor.
  if (host.hass) host.sceneManager?.syncAll(host.hass);
}

export function onResetView(host: BmsFloorplanCard): void {
  host.sceneManager?.resetView();
}

export function onPickQuality(host: BmsFloorplanCard, q: QualityChoice): void {
  host.qualityMenuOpen = false;
  if (!host.sceneManager) return;
  const needsReload = host.sceneManager.setQuality(q);
  host.qualityChoice = q;
  const tier = host.sceneManager.getQualityTier();
  host.showToast(
    `${host.t('Quality')}: ${qualityLabel(host, q)}${q === 'auto' ? ` (${tier})` : ''}` +
      (needsReload ? ' — reload to finish applying' : ''),
  );
}

export function teardownScene(host: BmsFloorplanCard): void {
  pendingTeardown.delete(host);
  if (!host.sceneManager || host.editing) return; // never mid-edit
  try {
    host.sceneManager.dispose();
  } catch (err) {
    console.warn('[3d-floorplan] scene teardown:', err);
  }
  host.sceneManager = undefined;
  host.planLoaded = false;
  host.lastPushed = undefined;
  host.lastHass = undefined;
  host.rooms = [];
  host.histCache.clear();
  host.homeStatsCache = undefined;
  releaseThumbnailRenderer();
}

export function setViewMode(host: BmsFloorplanCard, mode: 'room' | 'overview'): void {
  if (host.viewMode === mode) return;
  host.viewMode = mode;
  host.detailRoomKey = null;
  host.requestUpdate();
  // Обзор hides the 3D; when returning to Комната the viewport is shown again,
  // so reframe it once the layout has settled.
  if (mode === 'room') {
    requestAnimationFrame(() => requestAnimationFrame(() => host.sceneManager?.resetView()));
  }
}
