// ---------------------------------------------------------------------------
// Plan persistence — multiple named projects ("obyekt").
//
// Primary store: Home Assistant's per-user frontend storage
// (frontend/get_user_data + frontend/set_user_data) — no backend, no files,
// shared across all of that user's devices. Falls back to localStorage.
//
// Data shape: { active, projects: { [id]: FloorPlan } }. Each plan also carries
// a human `name`. Old projects persist until explicitly deleted; "New" creates
// a fresh id rather than overwriting.
// ---------------------------------------------------------------------------

import type { FloorPlan, HomeAssistant } from './types';

const HA_KEY = 'ha3d_floorplans';
const LS_KEY = 'ha3d-floorplans-set'; // full {active, projects} set
const LS_LEGACY = 'ha3d-floorplan-default'; // older single-plan key (migration)
// The integration's install-wide copy (custom_components/…/plan_api.py). `callApi`
// prefixes /api/. Per-user data alone meant a wall tablet holding another
// account's long-lived token read that account's stale plan and never saw edits.
const PLAN_API = 'ha3d_floorplan/plan';

export interface StoredProjects {
  active?: string;
  projects: Record<string, FloorPlan>;
  /** Hashed PIN that gates Edit mode (casual tamper-protection on a kiosk).
   *  Not cryptographically strong — just stops a passer-by from editing. */
  editPin?: string;
}

/** Small non-cryptographic hash so the edit PIN isn't stored in plain text.
 *  (Casual protection only — clearing browser/HA storage resets it.) */
export function hashPin(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return 'h' + h.toString(36);
}

export interface ProjectInfo {
  id: string;
  name: string;
}

function valid(plan: any): plan is FloorPlan {
  return !!plan && Array.isArray(plan.floors) && plan.floors.length > 0;
}

async function readHA(hass: HomeAssistant): Promise<StoredProjects | null> {
  try {
    const res: any = await hass.callWS?.({ type: 'frontend/get_user_data', key: HA_KEY });
    const data = res?.value as StoredProjects | undefined;
    if (data && data.projects) return data;
  } catch {
    /* not available */
  }
  return null;
}

/** The install-wide copy served by the integration. null when the endpoint is
 *  missing (older integration / non-HA host) or nothing is stored yet. */
async function readShared(hass: HomeAssistant): Promise<StoredProjects | null> {
  try {
    const data: any = await hass.callApi?.('GET', PLAN_API);
    if (data && data.projects) return data as StoredProjects;
  } catch {
    /* endpoint not available — fall back to the per-user store */
  }
  return null;
}

/** Mirror the set to the install-wide copy. Best effort: an older integration
 *  has no such endpoint, and the per-user store still holds the plan. */
async function writeShared(hass: HomeAssistant, data: StoredProjects): Promise<boolean> {
  try {
    await hass.callApi?.('POST', PLAN_API, data);
    return true;
  } catch {
    return false;
  }
}

/** Load the full project set.
 *
 *  Inside Home Assistant the INSTALL-WIDE copy wins, so every user and device —
 *  including a wall tablet whose long-lived token belongs to another account —
 *  converges on one plan. It falls back to this user's per-user store (and seeds
 *  the shared copy from it, so existing plans carry over without a manual save).
 *
 *  We deliberately do NOT fall back to localStorage while connected to HA:
 *  localStorage is shared across same-origin URLs, so two HA instances reached at
 *  the same host:port (e.g. both `homeassistant.local:8123`) would otherwise show
 *  each other's projects. localStorage is used only with no HA connection at all
 *  (a manually-served standalone page). */
export async function loadProjects(hass?: HomeAssistant): Promise<StoredProjects> {
  if (hass?.callWS) {
    const shared = await readShared(hass);
    if (shared) return shared;
    const mine = await readHA(hass);
    if (mine) {
      // First load after the upgrade: publish this user's plan so other devices
      // pick it up straight away rather than waiting for the next save.
      await writeShared(hass, mine);
      return mine;
    }
    return { projects: {} };
  }
  return loadLocalSet() ?? { projects: {} };
}

/** Persist the full project set. Inside HA it is written to BOTH the
 *  install-wide copy (so the kiosk/tablet sees this edit no matter which account
 *  its token belongs to) and this user's per-user store (kept so nothing is lost
 *  if the shared endpoint is unavailable). localStorage is written just as a
 *  fallback when there's no HA connection or the HA write fails — never as a
 *  shadow copy that could leak between instances. */
export async function saveProjects(
  data: StoredProjects,
  hass?: HomeAssistant,
): Promise<{ ha: boolean }> {
  if (!hass?.callWS) {
    saveLocalSet(data);
    return { ha: false };
  }
  await writeShared(hass, data);
  try {
    await hass.callWS({ type: 'frontend/set_user_data', key: HA_KEY, value: data });
    return { ha: true };
  } catch (e) {
    console.error('[3d-floorplan] HA save failed, kept localStorage copy:', e);
    saveLocalSet(data);
    return { ha: false };
  }
}

function loadLocalSet(): StoredProjects | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const data = JSON.parse(raw) as StoredProjects;
      if (data && data.projects) return data;
    }
  } catch {
    /* ignore */
  }
  // Migrate an older single-plan localStorage entry into a one-project set.
  const legacy = loadLegacyPlan();
  return legacy ? { active: 'default', projects: { default: legacy } } : null;
}

function saveLocalSet(data: StoredProjects): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(data));
  } catch {
    /* quota / unavailable */
  }
}

function loadLegacyPlan(): FloorPlan | null {
  try {
    const raw = localStorage.getItem(LS_LEGACY);
    if (!raw) return null;
    const plan = JSON.parse(raw);
    return valid(plan) ? plan : null;
  } catch {
    return null;
  }
}

export function listProjects(data: StoredProjects): ProjectInfo[] {
  return Object.entries(data.projects)
    .filter(([, p]) => valid(p))
    .map(([id, p]) => ({ id, name: p.name || id }))
    .sort((a, b) => a.name.localeCompare(b.name));
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

export function newProjectId(): string {
  try {
    if (typeof crypto !== 'undefined' && (crypto as any).randomUUID) {
      return 'p' + (crypto as any).randomUUID().replace(/-/g, '').slice(0, 12);
    }
  } catch {
    /* fall through */
  }
  return `p${Date.now().toString(36)}${Math.floor(Math.random() * 1e9).toString(36)}`;
}

/** A fresh empty plan to draw on from scratch. */
export function blankPlan(name = 'New Plan'): FloorPlan {
  return {
    name,
    wallHeight: 2.6,
    floors: [{ name: 'Ground Floor', elevation: 0, wallHeight: 2.6, walls: [], rooms: [], furniture: [], bindings: [] }],
  };
}
