// ---------------------------------------------------------------------------
// The PREVIOUS integration's plans — READ ONLY.
//
// The old "3D Floor Plan" integration stays installed and working on customer
// systems. Three places may hold a plan made with it, and everything in this
// file only READS them: the old store is left exactly as it was, so the old
// card keeps working for the customer until they decide to remove it.
//
// The one write this feeds is `mergeProjects`, which copies into OUR set
// without overwriting anything — see the note on it.
// ---------------------------------------------------------------------------

import type { FloorPlan, HomeAssistant } from './types';
import { asSet, listProjects, newProjectId, readShared, readUserData, valid } from './plan-store';
import type { StoredProjects } from './plan-store';

// --- Previous version's keys — READ ONLY, never written --------------------
const OLD_HA_KEY = 'ha3d_floorplans';
const OLD_LS_KEY = 'ha3d-floorplans-set';
const OLD_LS_SINGLE = 'ha3d-floorplan-default'; // even older single-plan entry
/** Our integration's admin-only reader for the OLD install-wide plan. It answers
 *  `{found, data}` — we never touch the old integration's storage ourselves. */
const OLD_WS_GET = 'bms_floorplan/legacy/get';

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
