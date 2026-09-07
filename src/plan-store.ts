// ---------------------------------------------------------------------------
// The plan document: what a stored project set looks like, and the wire it
// travels on.
//
// `storage.ts` orchestrates (load / save / fall back / mirror); this file holds
// the shape everything agrees on and the raw WebSocket calls under it. The
// rules the wire enforces are worth reading on their own:
//
//  * A read that FAILED is never reported as "empty". An empty answer is a
//    licence to save on top, and saving on top of a failed read is how one
//    device wipes every project on every other device.
//  * A write carries the version the editor started from (`base_version`). The
//    integration refuses the write when the document has moved on since, and
//    hands back the document that won — so two tablets saving a second apart no
//    longer means the second one silently deletes the first one's work.
//  * A refusal says WHY (no rights / conflict / too large / store unavailable),
//    in Russian, so the interface can say something true instead of "не смог".
// ---------------------------------------------------------------------------

import type { FloorPlan, HomeAssistant } from './types';

export interface StoredProjects {
  active?: string;
  projects: Record<string, FloorPlan>;
  /** Hashed PIN that gates Edit mode (casual tamper-protection on a kiosk).
   *  Not cryptographically strong — just stops a passer-by from editing.
   *  Stored in its OWN document by the integration; filled in here on load and
   *  taken back out before the plan is written. */
  editPin?: string;
  /** Version of the install-wide document this set was read from, stamped by
   *  the integration. Sent back on save as `base_version` so a save cannot
   *  overwrite work done on another device in the meantime. Absent means the
   *  document came from somewhere that does not version (per-user storage,
   *  localStorage, or an integration older than this). */
  version?: number;
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

export function valid(plan: any): plan is FloorPlan {
  return !!plan && Array.isArray(plan.floors) && plan.floors.length > 0;
}

export function listProjects(data: StoredProjects): ProjectInfo[] {
  return Object.entries(data.projects)
    .filter(([, p]) => valid(p))
    .map(([id, p]) => ({ id, name: p.name || id }))
    .sort((a, b) => a.name.localeCompare(b.name));
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

// --- The wire --------------------------------------------------------------

export const PLAN_WS_GET = 'bms_floorplan/plan/get';
export const PLAN_WS_SET = 'bms_floorplan/plan/set';
/** The edit PIN has a document of its own — a plan save must not touch it. */
export const PIN_WS_GET = 'bms_floorplan/pin/get';
export const PIN_WS_SET = 'bms_floorplan/pin/set';

export function errMsg(e: any): string {
  return String(e?.message ?? e?.code ?? e ?? 'unknown error');
}

/** True when the failure means "this endpoint does not exist here" (an older or
 *  absent integration) rather than "the read went wrong". The difference
 *  matters: absent is a normal state we fall back from, a failed read is NOT —
 *  treating it as "empty" is how a save wipes every other device's projects. */
export function isUnavailable(e: any): boolean {
  const code = String(e?.code ?? '').toLowerCase();
  if (code === 'unknown_command' || code === 'not_found' || code === 'integration_unloaded') {
    return true;
  }
  const msg = String(e?.message ?? e ?? '').toLowerCase();
  return msg.includes('unknown command') || msg.includes('unknown_command') || msg.includes('not found');
}

export type ReadStatus =
  | 'ok' // read succeeded and there is data
  | 'empty' // read succeeded, nothing stored yet
  | 'unavailable' // the endpoint does not exist here
  | 'error'; // the read FAILED — the data may well exist

export interface ReadOutcome {
  status: ReadStatus;
  data?: StoredProjects;
  error?: string;
}

/** Why a write did not happen. Kept coarse on purpose: each value maps to one
 *  sentence a human can act on. */
export type SaveFailReason =
  | 'forbidden' // not an administrator
  | 'conflict' // someone saved first
  | 'too_large' // over the integration's ceiling
  | 'invalid' // the document was refused as malformed
  | 'unavailable' // the store could not be reached at all
  | 'failed'; // anything else — the raw message is carried alongside

const REASON_TEXT: Record<SaveFailReason, string> = {
  forbidden: 'Нет прав: изменять общий план может только администратор.',
  conflict: 'План уже изменён на другом устройстве — запись отменена, чтобы не стереть чужие правки.',
  too_large: 'План слишком большой для хранилища — уменьшите фотографии.',
  invalid: 'Хранилище не приняло документ плана.',
  unavailable: 'Хранилище плана недоступно.',
  failed: 'Не удалось сохранить план.',
};

function reasonFor(e: any): SaveFailReason {
  const code = String(e?.code ?? '').toLowerCase();
  if (code === 'unauthorized' || code === 'not_admin') return 'forbidden';
  if (code === 'too_large') return 'too_large';
  if (code === 'storage_unavailable') return 'unavailable';
  if (code === 'version_conflict') return 'conflict';
  if (
    code === 'invalid_plan' ||
    code === 'not_json' ||
    code === 'invalid_pin' ||
    code === 'invalid_base_version' ||
    code === 'invalid_format'
  ) {
    return 'invalid';
  }
  const msg = String(e?.message ?? e ?? '').toLowerCase();
  if (msg.includes('unauthorized') || msg.includes('администратор')) return 'forbidden';
  return 'failed';
}

/** Home Assistant's own refusals are English; ours are already Russian. */
function humanError(reason: SaveFailReason, serverMessage?: string): string {
  if (reason === 'forbidden') return REASON_TEXT.forbidden;
  const msg = (serverMessage ?? '').trim();
  return msg || REASON_TEXT[reason];
}

/** Accept both the bare `{active, projects}` document and a `{found, data}`
 *  envelope, so the same reader works for plan/get and legacy/get. */
export function asSet(raw: any): StoredProjects | null {
  if (!raw || typeof raw !== 'object') return null;
  if (raw.projects && typeof raw.projects === 'object') return raw as StoredProjects;
  const inner = (raw as any).data;
  if (inner && typeof inner === 'object' && inner.projects) return inner as StoredProjects;
  return null;
}

/** The install-wide copy served by our integration. */
export async function readShared(hass: HomeAssistant, cmd = PLAN_WS_GET): Promise<ReadOutcome> {
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
export async function readUserData(hass: HomeAssistant, key: string): Promise<ReadOutcome> {
  if (!hass.callWS) return { status: 'unavailable' };
  try {
    const res: any = await hass.callWS({ type: 'frontend/get_user_data', key });
    const data = asSet(res?.value);
    return data ? { status: 'ok', data } : { status: 'empty' };
  } catch (e) {
    return isUnavailable(e) ? { status: 'unavailable' } : { status: 'error', error: errMsg(e) };
  }
}

export interface WriteOutcome {
  ok: boolean;
  /** The endpoint isn't there (older/absent integration) — not a failure of ours. */
  unavailable?: boolean;
  /** Someone else saved first. NOTHING was written; our copy is the stale one. */
  conflict?: boolean;
  reason?: SaveFailReason;
  /** Ready-to-show Russian text. */
  error?: string;
  /** Raw code from the integration, for logs. */
  code?: string;
  /** Version now stored — after a successful write, or the winner's on a conflict. */
  version?: number;
  /** On a conflict: the document that is actually stored, so the interface can
   *  offer to reload instead of asking the operator to guess. */
  current?: StoredProjects;
}

function failure(e: any): WriteOutcome {
  if (isUnavailable(e)) return { ok: false, unavailable: true, error: errMsg(e), reason: 'unavailable' };
  const reason = reasonFor(e);
  return { ok: false, reason, error: humanError(reason, errMsg(e)), code: String(e?.code ?? '') };
}

/** Mirror the set to the install-wide copy.
 *
 *  `baseVersion` is the version this edit started from. Leaving it undefined is
 *  the blind write the card did before versioning existed — used only when the
 *  document we loaded carried no version at all. */
export async function writeShared(
  hass: HomeAssistant,
  data: StoredProjects,
  baseVersion?: number,
): Promise<WriteOutcome> {
  if (!hass.callWS) return { ok: false, unavailable: true, reason: 'unavailable' };
  const msg: Record<string, unknown> = { type: PLAN_WS_SET, value: data };
  if (typeof baseVersion === 'number') msg.base_version = baseVersion;
  try {
    const res: any = await hass.callWS(msg);
    if (res && res.ok === false) {
      // A refusal that carries data comes back as a RESULT, because a WebSocket
      // error can only carry a code and a message — and on a conflict the
      // caller needs the document that won. In a result the code travels as
      // `error`, so it is renamed here before classifying: reading the wrong
      // field turns a conflict into a nameless failure.
      const reason = reasonFor({ code: res.error, message: res.message });
      return {
        ok: false,
        conflict: reason === 'conflict',
        reason,
        error: humanError(reason, res.message),
        code: String(res.error ?? ''),
        version: typeof res.version === 'number' ? res.version : undefined,
        current: asSet(res.current) ?? undefined,
      };
    }
    return { ok: true, version: typeof res?.version === 'number' ? res.version : undefined };
  } catch (e) {
    // An integration older than base_version rejects the unknown field outright.
    // Retry once without it rather than refusing to save at all.
    if (typeof baseVersion === 'number' && reasonFor(e) === 'invalid') {
      return writeShared(hass, data);
    }
    return failure(e);
  }
}

export interface PinOutcome {
  status: ReadStatus;
  /** The stored hash, or null when Edit mode is not locked. */
  pin?: string | null;
  error?: string;
}

/** Read the PIN from its own document. Open to every signed-in user: the card
 *  has to know whether Edit mode is locked before it can ask for the PIN. */
export async function readPin(hass: HomeAssistant): Promise<PinOutcome> {
  if (!hass.callWS) return { status: 'unavailable' };
  try {
    const res: any = await hass.callWS({ type: PIN_WS_GET });
    const pin = typeof res?.pin === 'string' && res.pin ? res.pin : null;
    return { status: 'ok', pin };
  } catch (e) {
    return isUnavailable(e) ? { status: 'unavailable' } : { status: 'error', error: errMsg(e) };
  }
}

/** Set (or, with null, clear) the PIN. Admin-only in the integration. */
export async function writePin(hass: HomeAssistant, pin: string | null): Promise<WriteOutcome> {
  if (!hass.callWS) return { ok: false, unavailable: true, reason: 'unavailable' };
  try {
    await hass.callWS({ type: PIN_WS_SET, value: pin });
    return { ok: true };
  } catch (e) {
    return failure(e);
  }
}
