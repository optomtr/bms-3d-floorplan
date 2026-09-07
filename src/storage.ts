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
// Data shape: { active, projects: { [id]: FloorPlan } }. Each plan also carries
// a human `name`. Old projects persist until explicitly deleted; "New" creates
// a fresh id rather than overwriting.
//
// TWO GENERATIONS LIVE SIDE BY SIDE. The previous "3D Floor Plan" integration
// stays installed and working on customer systems. Its keys are listed at the
// bottom of this block and are READ-ONLY: they exist so a plan can be COPIED
// into our store with one button. Nothing in this module ever writes to them.
// ---------------------------------------------------------------------------

import type { FloorPlan, HomeAssistant } from './types';

// --- Our own keys (the only ones we ever write) ----------------------------
const HA_KEY = 'bms_floorplan_projects';
const LS_KEY = 'bms-floorplan-projects'; // full {active, projects} set
const PLAN_WS_GET = 'bms_floorplan/plan/get';
const PLAN_WS_SET = 'bms_floorplan/plan/set';

// --- Previous version's keys — READ ONLY, never written --------------------
const OLD_HA_KEY = 'ha3d_floorplans';
const OLD_LS_KEY = 'ha3d-floorplans-set';
const OLD_LS_SINGLE = 'ha3d-floorplan-default'; // even older single-plan entry
/** Our integration's admin-only reader for the OLD install-wide plan. It answers
 *  `{found, data}` — we never touch the old integration's storage ourselves. */
const OLD_WS_GET = 'bms_floorplan/legacy/get';

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

function errMsg(e: any): string {
  return String(e?.message ?? e?.code ?? e ?? 'unknown error');
}

/** True when the failure means "this endpoint does not exist here" (an older or
 *  absent integration) rather than "the read went wrong". The difference
 *  matters: absent is a normal state we fall back from, a failed read is NOT —
 *  treating it as "empty" is how a save wipes every other device's projects. */
function isUnavailable(e: any): boolean {
  const code = String(e?.code ?? '').toLowerCase();
  if (code === 'unknown_command' || code === 'not_found') return true;
  const msg = String(e?.message ?? e ?? '').toLowerCase();
  return msg.includes('unknown command') || msg.includes('unknown_command') || msg.includes('not found');
}

type ReadStatus =
  | 'ok' // read succeeded and there is data
  | 'empty' // read succeeded, nothing stored yet
  | 'unavailable' // the endpoint does not exist here
  | 'error'; // the read FAILED — the data may well exist

interface ReadOutcome {
  status: ReadStatus;
  data?: StoredProjects;
  error?: string;
}

/** Accept both the bare `{active, projects}` document and a `{found, data}`
 *  envelope, so the same reader works for plan/get and legacy/get. */
function asSet(raw: any): StoredProjects | null {
  if (!raw || typeof raw !== 'object') return null;
  if (raw.projects && typeof raw.projects === 'object') return raw as StoredProjects;
  const inner = (raw as any).data;
  if (inner && typeof inner === 'object' && inner.projects) return inner as StoredProjects;
  return null;
}

/** The install-wide copy served by our integration. */
async function readShared(hass: HomeAssistant, cmd = PLAN_WS_GET): Promise<ReadOutcome> {
  if (!hass.callWS) return { status: 'unavailable' };
  try {
    const raw: any = await hass.callWS({ type: cmd });
    const data = asSet(raw);
    return data ? { status: 'ok', data } : { status: 'empty' };
  } catch (e) {
    return isUnavailable(e) ? { status: 'unavailable' } : { status: 'error', error: errMsg(e) };
  }
}

/** A `frontend/get_user_data` document (ours, or — read-only — the old one). */
async function readUserData(hass: HomeAssistant, key: string): Promise<ReadOutcome> {
  if (!hass.callWS) return { status: 'unavailable' };
  try {
    const res: any = await hass.callWS({ type: 'frontend/get_user_data', key });
    const data = asSet(res?.value);
    return data ? { status: 'ok', data } : { status: 'empty' };
  } catch (e) {
    return isUnavailable(e) ? { status: 'unavailable' } : { status: 'error', error: errMsg(e) };
  }
}

interface WriteOutcome {
  ok: boolean;
  /** The endpoint isn't there (older/absent integration) — not a failure of ours. */
  unavailable?: boolean;
  error?: string;
}

/** Mirror the set to the install-wide copy. Writing is admin-only in the
 *  integration, so a non-admin editor legitimately gets a refusal here. */
async function writeShared(hass: HomeAssistant, data: StoredProjects): Promise<WriteOutcome> {
  if (!hass.callWS) return { ok: false, unavailable: true };
  try {
    await hass.callWS({ type: PLAN_WS_SET, value: data });
    return { ok: true };
  } catch (e) {
    return isUnavailable(e)
      ? { ok: false, unavailable: true, error: errMsg(e) }
      : { ok: false, error: errMsg(e) };
  }
}

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
    if (shared.status === 'ok') return { ok: true, data: shared.data!, source: 'shared' };
    if (shared.status === 'error') {
      return { ok: false, data: { projects: {} }, source: 'none', error: shared.error };
    }
    const mine = await readUserData(hass, HA_KEY);
    if (mine.status === 'ok') {
      // First load after the upgrade: publish this user's plan so other devices
      // pick it up straight away rather than waiting for the next save.
      await writeShared(hass, mine.data!);
      return { ok: true, data: mine.data!, source: 'user' };
    }
    if (mine.status === 'error') {
      return { ok: false, data: { projects: {} }, source: 'none', error: mine.error };
    }
    return { ok: true, data: { projects: {} }, source: 'none' };
  }
  const local = loadLocalSet();
  return { ok: true, data: local ?? { projects: {} }, source: local ? 'local' : 'none' };
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
    return { shared: false, user: false, local, ha: false };
  }
  const shared = await writeShared(hass, data);
  let user = false;
  let userError: string | undefined;
  try {
    await hass.callWS({ type: 'frontend/set_user_data', key: HA_KEY, value: data });
    user = true;
  } catch (e) {
    userError = errMsg(e);
  }
  let local = false;
  if (!shared.ok && !user) {
    console.error('[bms-floorplan] HA save failed, kept a local copy:', shared.error ?? userError);
    local = saveLocalSet(data);
  }
  return {
    shared: shared.ok,
    user,
    local,
    ha: shared.ok || user,
    sharedError: shared.error,
    userError,
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

// ---------------------------------------------------------------------------
// Previous version — READ ONLY.
//
// Three places may hold a plan made with the old integration. Everything below
// only reads; the old store is left exactly as it was, so the old card keeps
// working for the customer until they decide to remove it.
// ---------------------------------------------------------------------------

export type LegacySource = 'shared' | 'user' | 'local';

export interface LegacyFind {
  /** Where it was found: the old install-wide plan, this account's per-user
   *  copy, or this browser's localStorage. */
  source: LegacySource;
  count: number;
  /** Project names, in the order they will be copied. */
  names: string[];
  data: StoredProjects;
}

export interface LegacyScan {
  finds: LegacyFind[];
  /** Places that could not be read (so "nothing found" is never a guess). */
  errors: { source: LegacySource; error: string }[];
}

function legacyLocalSet(): StoredProjects | null {
  try {
    const raw = localStorage.getItem(OLD_LS_KEY);
    if (raw) {
      const data = asSet(JSON.parse(raw));
      if (data) return data;
    }
  } catch {
    /* ignore */
  }
  try {
    const raw = localStorage.getItem(OLD_LS_SINGLE);
    if (raw) {
      const plan = JSON.parse(raw);
      if (valid(plan)) return { active: 'default', projects: { default: plan } };
    }
  } catch {
    /* ignore */
  }
  return null;
}

function describe(source: LegacySource, data: StoredProjects): LegacyFind | null {
  const list = listProjects(data);
  if (!list.length) return null;
  return { source, count: list.length, names: list.map((p) => p.name), data };
}

/** Look for plans made with the PREVIOUS integration, in all three places.
 *  Reads only — nothing is written anywhere by this call. */
export async function findLegacyProjects(hass?: HomeAssistant): Promise<LegacyScan> {
  const finds: LegacyFind[] = [];
  const errors: { source: LegacySource; error: string }[] = [];

  if (hass?.callWS) {
    const shared = await readShared(hass, OLD_WS_GET);
    if (shared.status === 'ok') {
      const f = describe('shared', shared.data!);
      if (f) finds.push(f);
    } else if (shared.status === 'error') {
      errors.push({ source: 'shared', error: shared.error ?? 'unknown error' });
    }

    const mine = await readUserData(hass, OLD_HA_KEY);
    if (mine.status === 'ok') {
      const f = describe('user', mine.data!);
      if (f) finds.push(f);
    } else if (mine.status === 'error') {
      errors.push({ source: 'user', error: mine.error ?? 'unknown error' });
    }
  }

  const local = legacyLocalSet();
  if (local) {
    const f = describe('local', local);
    if (f) finds.push(f);
  }
  return { finds, errors };
}

export interface MergeResult {
  data: StoredProjects;
  added: number;
  /** How many had to be renamed because a project of that name already existed. */
  renamed: number;
}

/** Copy `incoming` projects into `current` WITHOUT overwriting anything.
 *
 *  A clashing id gets a fresh one; a clashing name gets `mark` appended (and a
 *  counter after that), so the operator can tell the imported copy from the one
 *  they already had instead of silently losing one of them. */
export function mergeProjects(
  current: StoredProjects,
  incoming: StoredProjects,
  mark: string,
): MergeResult {
  const data: StoredProjects = {
    ...current,
    projects: { ...current.projects },
  };
  const usedNames = new Set(
    Object.values(data.projects)
      .filter(valid)
      .map((p) => (p.name || '').trim().toLowerCase()),
  );
  let added = 0;
  let renamed = 0;
  let firstAdded: string | undefined;

  for (const [id, plan] of Object.entries(incoming.projects ?? {})) {
    if (!valid(plan)) continue;
    const copy: FloorPlan = JSON.parse(JSON.stringify(plan));
    let name = (copy.name || id).trim() || id;
    if (usedNames.has(name.toLowerCase())) {
      let candidate = `${name} ${mark}`;
      let n = 2;
      while (usedNames.has(candidate.toLowerCase())) candidate = `${name} ${mark} ${n++}`;
      name = candidate;
      renamed++;
    }
    copy.name = name;
    usedNames.add(name.toLowerCase());

    let newId = id;
    while (!newId || data.projects[newId]) newId = newProjectId();
    data.projects[newId] = copy;
    if (!firstAdded) firstAdded = newId;
    added++;
  }

  // Only adopt an active project if there wasn't one — never move the operator
  // off the plan they were looking at.
  if (!data.active || !valid(data.projects[data.active])) data.active = firstAdded ?? data.active;
  return { data, added, renamed };
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
