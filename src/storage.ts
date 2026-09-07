// ---------------------------------------------------------------------------
// Plan persistence — multiple named projects ("obyekt").
//
// Primary store: the BMS Планировка integration's install-wide copy, reached
// over the WebSocket so the same commands work from the tablet's file:// kiosk
// page. Mirrored into Home Assistant's per-user frontend storage
// (frontend/get_user_data + frontend/set_user_data) so nothing is lost when the
// integration is unavailable. localStorage is used only with no HA connection
// at all (a manually-served standalone page).
//
// Data shape: { active, projects: { [id]: FloorPlan }, version }. Each plan also
// carries a human `name`. Old projects persist until explicitly deleted; "New"
// creates a fresh id rather than overwriting.
//
// ONE DOCUMENT, MANY DEVICES. `version` is stamped by the integration and rides
// along inside the set we loaded; every save sends it back as `base_version`.
// If the stored document moved on meanwhile, the save is REFUSED and comes back
// as `SaveResult.conflict` with the document that won — instead of the second
// tablet silently deleting the first tablet's projects.
//
// The edit PIN is NOT part of this document any more. It has a store of its own
// in the integration, because it used to be erased by any plan save from any
// device. `editPin` still appears on `StoredProjects` — that is the card's view
// of it — but it is loaded from and written to the PIN store, not the plan.
//
// TWO GENERATIONS LIVE SIDE BY SIDE. The previous "3D Floor Plan" integration
// stays installed and working on customer systems; reading its plans so they
// can be COPIED into ours lives in `storage-legacy.ts`, and is read-only.
//
// This file is the entry point for all of it: the card imports everything from
// here, so `plan-store.ts` (shape + wire) and `storage-legacy.ts` (previous
// version) are re-exported below rather than imported by anyone else.
// ---------------------------------------------------------------------------

import type { FloorPlan, HomeAssistant } from './types';
import {
  asSet,
  errMsg,
  listProjects,
  readPin,
  readShared,
  readUserData,
  valid,
  writePin,
  writeShared,
} from './plan-store';
import type { SaveFailReason, StoredProjects } from './plan-store';

// The card imports the whole surface from './storage'; these keep that one door
// open while the code behind it is split by job.
export { blankPlan, hashPin, listProjects, newProjectId } from './plan-store';
export type { ProjectInfo, SaveFailReason, StoredProjects } from './plan-store';
export { findLegacyProjects, mergeProjects } from './storage-legacy';
export type { LegacyFind, LegacyScan, LegacySource, MergeResult } from './storage-legacy';

// --- Our own keys (the only ones we ever write) ----------------------------
const HA_KEY = 'bms_floorplan_projects';
const LS_KEY = 'bms-floorplan-projects'; // full {active, projects} set

export interface LoadResult {
  /** FALSE means the store could not be read. The caller must NOT save on top
   *  of this: the set looks empty only because the read failed, and saving it
   *  would delete every project on every device. */
  ok: boolean;
  data: StoredProjects;
  source: 'shared' | 'user' | 'local' | 'none';
  error?: string;
}

/** Load the full project set, saying honestly whether the read worked.
 *
 *  Inside Home Assistant the INSTALL-WIDE copy wins, so every user and device —
 *  including a wall tablet whose long-lived token belongs to another account —
 *  converges on one plan. It falls back to this user's per-user store (and seeds
 *  the shared copy from it, so existing plans carry over without a manual save).
 *
 *  We deliberately do NOT fall back to localStorage while connected to HA:
 *  localStorage is shared across same-origin URLs, so two HA instances reached at
 *  the same host:port (e.g. both `homeassistant.local:8123`) would otherwise show
 *  each other's projects. */
export async function loadProjectsResult(hass?: HomeAssistant): Promise<LoadResult> {
  if (hass?.callWS) {
    const shared = await readShared(hass);
    if (shared.status === 'error') {
      return { ok: false, data: { projects: {} }, source: 'none', error: shared.error };
    }
    if (shared.status === 'unavailable') {
      // No integration here at all: no versioning, no PIN store — the old
      // per-user path, exactly as it behaved before.
      const mine = await readUserData(hass, HA_KEY);
      if (mine.status === 'ok') return { ok: true, data: mine.data!, source: 'user' };
      if (mine.status === 'error') {
        return { ok: false, data: { projects: {} }, source: 'none', error: mine.error };
      }
      return { ok: true, data: { projects: {} }, source: 'none' };
    }

    // The integration answered, so it is the authority on both the version and
    // the PIN. `empty` means the document really is empty (a failed read raises
    // instead), so version 0 is the correct base for the first save.
    if (shared.status === 'ok') {
      const data = shared.data!;
      if (typeof data.version !== 'number') data.version = 0;
      const pin = await hydratePin(hass, data);
      if (!pin.ok) return { ok: false, data, source: 'shared', error: pin.error };
      return { ok: true, data, source: 'shared' };
    }

    const mine = await readUserData(hass, HA_KEY);
    if (mine.status === 'error') {
      return { ok: false, data: { projects: {} }, source: 'none', error: mine.error };
    }
    const data: StoredProjects = mine.status === 'ok' ? mine.data! : { projects: {} };
    data.version = 0;
    const pin = await hydratePin(hass, data);
    if (!pin.ok) return { ok: false, data, source: 'none', error: pin.error };
    if (mine.status === 'ok') {
      // First load after the upgrade: publish this user's plan so other devices
      // pick it up straight away rather than waiting for the next save. Written
      // through saveShared so it carries base_version 0 — if another device got
      // there first, this seeding write is refused instead of replacing it.
      await saveShared(hass, data);
      return { ok: true, data, source: 'user' };
    }
    return { ok: true, data, source: 'none' };
  }
  const local = loadLocalSet();
  return { ok: true, data: local ?? { projects: {} }, source: local ? 'local' : 'none' };
}

// The PIN this session last saw in the PIN store, so a save can tell "the
// operator changed the PIN" from "the operator changed the plan". Before the
// PIN moved out of the plan document, every save rewrote it and any device
// whose copy predated the PIN erased it.
let lastKnownPin: string | null | undefined;
/** undefined until the first attempt; false when the integration has no PIN
 *  store (older version), in which case the PIN stays inside the plan. */
let pinStoreAvailable: boolean | undefined;

/** Fill `data.editPin` from the PIN's own document.
 *
 *  A FAILED read is reported, never guessed at: `ok: false` stops the card from
 *  saving, which is what keeps a hiccup from clearing the PIN. */
async function hydratePin(
  hass: HomeAssistant,
  data: StoredProjects,
): Promise<{ ok: boolean; error?: string }> {
  const res = await readPin(hass);
  if (res.status === 'ok') {
    pinStoreAvailable = true;
    lastKnownPin = res.pin ?? null;
    if (res.pin) data.editPin = res.pin;
    else delete data.editPin;
    return { ok: true };
  }
  if (res.status === 'unavailable') {
    // Integration older than the PIN store: leave whatever the plan carried.
    pinStoreAvailable = false;
    lastKnownPin = undefined;
    return { ok: true };
  }
  pinStoreAvailable = false;
  lastKnownPin = undefined;
  return { ok: false, error: res.error };
}

/** The plan document as it goes on the wire — without the PIN, which lives in
 *  its own document now. */
function withoutPin(data: StoredProjects): StoredProjects {
  const copy: StoredProjects = { ...data };
  delete copy.editPin;
  return copy;
}

/** Convenience wrapper for read-only callers (rendering a plan). Anything that
 *  goes on to SAVE must use `loadProjectsResult` and honour `ok`. */
export async function loadProjects(hass?: HomeAssistant): Promise<StoredProjects> {
  return (await loadProjectsResult(hass)).data;
}

export interface SaveResult {
  /** Written to the install-wide copy — i.e. every device really will see it. */
  shared: boolean;
  /** Written to this HA account's per-user store. */
  user: boolean;
  /** Written to this browser only. */
  local: boolean;
  /** At least one Home Assistant store took the write. */
  ha: boolean;
  sharedError?: string;
  userError?: string;
  /** TRUE means the install-wide copy moved on while this edit was open, so
   *  NOTHING was written to it — the projects on the other device are intact and
   *  this edit is the one that still has to be re-applied. */
  conflict?: boolean;
  /** Why the shared write did not happen (rights / conflict / size / store). */
  reason?: SaveFailReason;
  /** Version now stored; on a conflict, the version that won. */
  version?: number;
  /** On a conflict: the document that is actually stored, ready to show or
   *  merge into, so nobody has to guess what the other device saved. */
  current?: StoredProjects;
  /** The edit PIN was written to its own document. Undefined = unchanged, so
   *  no plan save can erase it any more. */
  pin?: boolean;
  pinError?: string;
}

interface SharedWrite {
  ok: boolean;
  conflict?: boolean;
  reason?: SaveFailReason;
  error?: string;
  version?: number;
  current?: StoredProjects;
  pin?: boolean;
  pinError?: string;
  /** The document as it went on the wire (PIN removed) — mirrored per-user too,
   *  so the two copies do not disagree about the PIN. */
  payload: StoredProjects;
}

/** Write the set to the install-wide copy: the PIN into its own document, the
 *  plan with `base_version` so a concurrent edit is refused, not overwritten.
 *
 *  On success `data.version` is UPDATED IN PLACE — the caller is holding the
 *  same object the card keeps in memory, so its next save carries the version
 *  this one produced. On a conflict it is deliberately left alone: a blind
 *  retry must keep failing until the operator reloads. */
async function saveShared(hass: HomeAssistant, data: StoredProjects): Promise<SharedWrite> {
  let pin: boolean | undefined;
  let pinError: string | undefined;
  if (pinStoreAvailable) {
    const wanted = data.editPin ?? null;
    // Only when THIS session actually changed it. A plan save by a device that
    // never saw the PIN must leave the PIN exactly where it is.
    if (wanted !== lastKnownPin) {
      const res = await writePin(hass, wanted);
      pin = res.ok;
      if (res.ok) lastKnownPin = wanted;
      else pinError = res.error;
    }
  }
  // Keep the PIN out of the plan — but only once it is safely in its own
  // document, otherwise dropping it here would lose it altogether.
  const payload = pinStoreAvailable && pinError === undefined ? withoutPin(data) : data;
  const base = typeof data.version === 'number' ? data.version : undefined;
  const res = await writeShared(hass, payload, base);
  if (res.ok && typeof res.version === 'number') {
    data.version = res.version;
    payload.version = res.version;
  }
  return {
    ok: res.ok,
    conflict: res.conflict,
    reason: res.reason,
    error: res.error,
    version: res.version,
    current: res.current,
    pin,
    pinError,
    payload,
  };
}

/** Persist the full project set. Inside HA it is written to BOTH the
 *  install-wide copy (so the kiosk/tablet sees this edit no matter which account
 *  its token belongs to) and this user's per-user store (kept so nothing is lost
 *  if the shared endpoint is unavailable). localStorage is written just as a
 *  fallback when there's no HA connection or every HA write failed — never as a
 *  shadow copy that could leak between instances.
 *
 *  The result reports what actually landed where, so the UI can say so instead
 *  of promising "saved to all devices" after a refused shared write. */
export async function saveProjects(
  data: StoredProjects,
  hass?: HomeAssistant,
): Promise<SaveResult> {
  if (!hass?.callWS) {
    const local = saveLocalSet(data);
    return {
      shared: false,
      user: false,
      local,
      ha: false,
      reason: local ? undefined : 'unavailable',
    };
  }
  const shared = await saveShared(hass, data);
  let user = false;
  let userError: string | undefined;
  try {
    await hass.callWS({
      type: 'frontend/set_user_data',
      key: HA_KEY,
      value: shared.payload,
    });
    user = true;
  } catch (e) {
    userError = errMsg(e);
  }
  let local = false;
  if (!shared.ok && !user) {
    console.error('[bms-floorplan] HA save failed, kept a local copy:', shared.error ?? userError);
    local = saveLocalSet(shared.payload);
  }
  return {
    shared: shared.ok,
    user,
    local,
    ha: shared.ok || user,
    // Already a human sentence in Russian, so an interface that only prints it
    // still says something true about WHY.
    sharedError: shared.error,
    userError,
    conflict: shared.conflict,
    reason: shared.reason,
    version: shared.version,
    current: shared.current,
    pin: shared.pin,
    pinError: shared.pinError,
  };
}

function loadLocalSet(): StoredProjects | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const data = asSet(JSON.parse(raw));
      if (data) return data;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function saveLocalSet(data: StoredProjects): boolean {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false; /* quota / unavailable */
  }
}

/** Load the active (or first valid) plan — used for View mode / zero-config. */
export async function loadPlan(hass?: HomeAssistant): Promise<FloorPlan | null> {
  const data = await loadProjects(hass);
  const id =
    data.active && valid(data.projects[data.active])
      ? data.active
      : listProjects(data)[0]?.id;
  const plan = id ? data.projects[id] : null;
  return valid(plan) ? plan : null;
}
