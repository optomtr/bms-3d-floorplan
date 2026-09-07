// ---------------------------------------------------------------------------
// Проекты планов: загрузка, сохранение, импорт/экспорт, перенос из старой версии.
// ---------------------------------------------------------------------------

import type { BmsFloorplanCard } from '../ha-3d-floorplan-card';
import { convertZircon, isZirconPlan } from '../import/zircon';
import { DEMO_PLAN } from '../scene/demo-plan';
import { LegacySource, blankPlan, findLegacyProjects, listProjects, loadProjects, loadProjectsResult, mergeProjects, newProjectId, saveProjects } from '../storage';
import type { FloorPlan, ProjectRef } from '../types';
import { askConfirm } from './dialogs';
import { applyHass } from './state';

export async function loadActiveProject(host: BmsFloorplanCard): Promise<void> {
  if (!host.config || !host.sceneManager) return;
  host.loadError = undefined;
  host.planWarning = undefined;
  host.planLoaded = false;
  try {
    const plan = await resolvePlan(host);
    host.currentPlan = plan;
    host.sceneManager.loadPlan(plan);
    host.sceneManager.optimizeForView(); // merge static geometry (view mode)
    const broken = host.sceneManager.brokenParts();
    if (broken.length) {
      const list = broken.slice(0, 3).join(', ');
      const more = broken.length > 3 ? ` и ещё ${broken.length - 3}` : '';
      host.planWarning = host.tx(
        `Часть плана не удалось построить (${list}${more}) — проверьте размеры этих элементов. Остальное показано.`,
        `Some plan elements could not be built (${list}${more}) — check their sizes. The rest is shown.`,
      );
    }
    host.floorNames = plan.floors.map((f, i) => f.name || `Floor ${i + 1}`);
    host.activeFloorIndex = 0;
    host.planLoaded = true;
    // Push current state into the freshly built scene.
    if (host.hass) {
      host.lastHass = undefined;
      host.lastPushed = undefined;
      applyHass(host, host.hass);
    }
  } catch (err: any) {
    host.loadError = err?.message ?? String(err);
    console.error('[3d-floorplan] load failed:', err);
  }
}

export async function resolvePlan(host: BmsFloorplanCard): Promise<FloorPlan> {
  const cfg = host.config!;
// Always load the stored set first — it carries the edit PIN (and any saved
// projects) regardless of how the plan itself is sourced. Without this, a
// card configured with plan/url/projects would never see the PIN and the
// edit lock would silently do nothing.
  host.storedProjects = await loadProjects(host.hass);
  if (cfg.projects && cfg.projects.length) {
    const proj =
      cfg.projects.find((p) => p.id === host.activeProjectId) ?? cfg.projects[0];
    return loadProjectRef(host, proj);
  }
  if (cfg.plan) return cfg.plan;
  if (cfg.url) return fetchPlan(cfg.url);
// Nothing configured → named projects (HA shared / localStorage) or demo.
  host.projectList = listProjects(host.storedProjects);
  const id =
    host.storedProjects.active && host.storedProjects.projects[host.storedProjects.active]
      ? host.storedProjects.active
      : host.projectList[0]?.id;
  if (id) {
    host.currentProjectId = id;
    return host.storedProjects.projects[id];
  }
  host.currentProjectId = null;
  return DEMO_PLAN;
}

export async function loadProjectRef(host: BmsFloorplanCard, proj: ProjectRef): Promise<FloorPlan> {
  if (proj.plan) return proj.plan;
  if (proj.url) return fetchPlan(proj.url);
  if (host.config?.backend) {
    return fetchPlan(`${host.config.backend.replace(/\/$/, '')}/projects/${proj.id}`);
  }
  throw new Error(`Project "${proj.id}" has no plan, url, or backend.`);
}

export async function fetchPlan(url: string): Promise<FloorPlan> {
  const res = await fetch(url, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return (await res.json()) as FloorPlan;
}

export function onSelectProject(host: BmsFloorplanCard, e: Event): void {
  host.activeProjectId = (e.target as HTMLSelectElement).value;
  loadActiveProject(host);
}

export async function onNewPlan(host: BmsFloorplanCard): Promise<void> {
  if (!host.editor) return;
// "New" creates a separate project — your other SAVED projects are untouched.
  const ok = await askConfirm(host, 
    host.tx('Создать НОВЫЙ проект?', 'Create a NEW project?'),
    host.tx(
      'Другие сохранённые проекты останутся. Несохранённые правки текущего будут потеряны. Нарисуйте и нажмите «Сохранить».',
      'Your other saved projects stay. Unsaved changes in the current one will be lost. Draw, then Save to keep the new project.',
    ),
    host.tx('Создать', 'Create'),
    false,
  );
  if (!ok) return;
  if (!host.editor) return;
  const name = `Plan ${host.projectList.length + 1}`;
// New is an unsaved project — don't touch currentProjectId (the view plan).
// It gets a fresh id only on Save, so it never overwrites another project.
  host.editingProjectId = null;
  host.editor.loadPlan(blankPlan(name));
  host.editPlanName = name;
  host.showToast('New project — draw it, then Save to keep it');
}

export function onRenamePlan(host: BmsFloorplanCard, e: Event): void {
  const name = (e.target as HTMLInputElement).value;
  host.editPlanName = name;
  if (host.editor) host.editor.plan.name = name;
}

export async function onSelectStorageProject(host: BmsFloorplanCard, e: Event): Promise<void> {
  const select = e.target as HTMLSelectElement;
  const id = select.value;
  if (!id || id === host.currentProjectId) return;
  const plan = host.storedProjects.projects[id];
  if (!plan) return;
  if (host.editing) {
    const ok = await askConfirm(host, 
      host.tx('Переключить проект?', 'Switch project?'),
      host.tx(
        'Несохранённые правки текущего проекта будут потеряны.',
        'Unsaved changes in the current one will be lost.',
      ),
      host.tx('Переключить', 'Switch'),
    );
    if (!ok) {
      // Put the dropdown back where it was: the answer arrives a tick later,
      // so Lit has already settled on the value the user picked.
      select.value = host.editingProjectId ?? '';
      host.requestUpdate();
      return;
    }
  }
  host.currentProjectId = id;
  host.editingProjectId = id;
  host.activeFloorIndex = 0;
  const copy: FloorPlan = JSON.parse(JSON.stringify(plan));
  const viewCopy: FloorPlan = JSON.parse(JSON.stringify(plan));
  host.currentPlan = viewCopy;
  host.floorNames = plan.floors.map((f, i) => f.name || `Floor ${i + 1}`);
  if (host.editing && host.editor) {
    host.editor.loadPlan(copy);
    host.editPlanName = copy.name ?? '';
  } else if (host.sceneManager) {
    host.sceneManager.loadPlan(viewCopy);
    if (host.hass) {
      host.lastHass = undefined;
      host.lastPushed = undefined;
      applyHass(host, host.hass);
    }
  }
  host.showToast(`Loaded "${plan.name || id}"`);
}

export async function onDeleteProject(host: BmsFloorplanCard): Promise<void> {
  const id = host.editingProjectId ?? host.currentProjectId;
// Re-read so a concurrent change elsewhere isn't lost by this delete-save.
// A failed read must not be mistaken for "there is nothing there".
  const loaded = await loadProjectsResult(host.hass);
  if (!loaded.ok) {
    host.showToast(
      host.tx(
        `Не удалось прочитать хранилище (${loaded.error ?? ''}) — удаление отменено`,
        `Could not read the store (${loaded.error ?? ''}) — delete cancelled`,
      ),
    );
    return;
  }
  host.storedProjects = loaded.data;
  if (!id || !host.storedProjects.projects[id]) {
    host.showToast('This project is not saved yet');
    return;
  }
  const name = host.storedProjects.projects[id].name || id;
  const ok = await askConfirm(host, 
    host.tx('Удалить проект?', 'Delete project?'),
    host.tx(`«${name}» будет удалён безвозвратно.`, `"${name}" will be deleted. This cannot be undone.`),
    host.tx('Удалить', 'Delete'),
  );
  if (!ok) return;
  delete host.storedProjects.projects[id];
  const remaining = listProjects(host.storedProjects);
  host.storedProjects.active = remaining[0]?.id;
  await saveProjects(host.storedProjects, host.hass);
  host.projectList = remaining;
  host.currentProjectId = host.storedProjects.active ?? null;
  host.editingProjectId = host.currentProjectId;
  host.activeFloorIndex = 0;
  const next = host.currentProjectId
    ? host.storedProjects.projects[host.currentProjectId]
    : blankPlan();
  host.currentPlan = JSON.parse(JSON.stringify(next));
  host.floorNames = next.floors.map((f, i) => f.name || `Floor ${i + 1}`);
  if (host.editor) {
    host.editor.loadPlan(JSON.parse(JSON.stringify(next)));
    host.editPlanName = next.name ?? '';
  }
  host.showToast('Project deleted');
}

export function onOpenImport(host: BmsFloorplanCard): void {
  host.importText = '';
  host.importOpen = true;
}

export function onExportPlan(host: BmsFloorplanCard): void {
  if (host.editor) host.importText = JSON.stringify(host.editor.plan, null, 2);
  else if (host.currentPlan) host.importText = JSON.stringify(host.currentPlan, null, 2);
  host.importOpen = true;
}

export function onImportText(host: BmsFloorplanCard, e: Event): void {
  host.importText = (e.target as HTMLTextAreaElement).value;
}

export async function onImportLoad(host: BmsFloorplanCard): Promise<void> {
  let plan: FloorPlan;
  try {
    const raw = JSON.parse(host.importText);
    // Accept native Zircon3D `spacePlan` exports by converting them on the fly.
    plan = isZirconPlan(raw) ? convertZircon(raw) : (raw as FloorPlan);
    if (!plan || !Array.isArray(plan.floors) || plan.floors.length === 0) {
      throw new Error('Plan must have a non-empty "floors" array');
    }
  } catch (err: any) {
    host.showToast(`Import failed: ${err?.message ?? 'invalid JSON'}`);
    return;
  }
  if (!host.editor) host.doEnterEdit();
  if (!host.editor) return;
  host.editor.loadPlan(plan);
  host.editingProjectId = null; // imported = a new project until saved
  host.editPlanName = plan.name ?? 'Imported';
  host.importOpen = false;
  await onSavePlan(host);
  host.showToast(`Imported "${plan.name ?? 'plan'}" and saved`);
}

export async function onSavePlan(host: BmsFloorplanCard): Promise<void> {
  if (!host.editor) return;
  const plan = host.editor.plan;
  if (!plan.name) plan.name = host.editPlanName || 'Plan';
// Re-read the shared set first, then apply only THIS project, so we never
// clobber projects saved meanwhile on another device/tab. A FAILED read
// looks exactly like an empty store, so saving on top of one would delete
// every other project on every device — refuse instead.
  const loaded = await loadProjectsResult(host.hass);
  if (!loaded.ok) {
    host.showToast(
      host.tx(
        `Не сохранено: не удалось прочитать хранилище (${loaded.error ?? ''}). Повторите позже.`,
        `Not saved: the store could not be read (${loaded.error ?? ''}). Try again.`,
      ),
    );
    return;
  }
  host.storedProjects = loaded.data;
  let id = host.editingProjectId;
  if (!id) {
    id = newProjectId();
    while (host.storedProjects.projects[id]) id = newProjectId();
  }
  host.editingProjectId = id;
  host.currentProjectId = id;
  host.storedProjects.projects[id] = JSON.parse(JSON.stringify(plan));
  host.storedProjects.active = id;
  const res = await saveProjects(host.storedProjects, host.hass);
// Adopt the saved plan as the current View-mode plan + refresh project list.
  host.currentPlan = JSON.parse(JSON.stringify(plan));
  host.projectList = listProjects(host.storedProjects);
  host.floorNames = plan.floors.map((f, i) => f.name || `Floor ${i + 1}`);
// Say what actually happened. The shared (install-wide) write is the only
// one that reaches other devices, and it is admin-only in the integration —
// so "saved to all devices" must not be printed after it was refused.
  let msg: string;
  if (res.shared) {
    msg = host.tx(`«${plan.name}» сохранён на все устройства`, `Saved "${plan.name}" to all devices`);
  } else if (res.user) {
    msg = host.tx(
      `«${plan.name}» сохранён только в этой учётной записи — общий план не записан (${res.sharedError ?? 'нет прав или интеграция недоступна'})`,
      `Saved "${plan.name}" to this account only — the shared plan was not written (${res.sharedError ?? 'no permission, or the integration is unavailable'})`,
    );
  } else if (res.local) {
    msg = host.tx(
      `«${plan.name}» сохранён только в этом браузере (Home Assistant недоступен)`,
      `Saved "${plan.name}" in this browser only (Home Assistant unavailable)`,
    );
  } else {
    msg = host.tx(
      `НЕ сохранено: ${res.sharedError ?? res.userError ?? 'хранилище недоступно'}`,
      `NOT saved: ${res.sharedError ?? res.userError ?? 'the store is unavailable'}`,
    );
  }
  host.showToast(msg);
}

// -- Import from the PREVIOUS version (read-only) --------------------------

export function legacySourceLabel(host: BmsFloorplanCard, src: LegacySource): string {
  if (src === 'shared') return host.tx('Старая интеграция (общий план)', 'Old integration (shared plan)');
  if (src === 'user') return host.tx('Старая версия, эта учётная запись', 'Old version, this account');
  return host.tx('Старая версия, этот браузер', 'Old version, this browser');
}

/** Look for plans made with the previous integration. Reads only — the old
 *  store is never written to, so the old card keeps working afterwards. */
export async function onScanLegacy(host: BmsFloorplanCard): Promise<void> {
  host.legacyBusy = true;
  host.legacyFinds = [];
  host.legacyErrors = [];
  host.legacyOpen = true;
  try {
    const scan = await findLegacyProjects(host.hass);
    host.legacyFinds = scan.finds;
    host.legacyErrors = scan.errors;
  } catch (err: any) {
    host.legacyFinds = [];
    host.legacyErrors = [{ source: 'shared', error: String(err?.message ?? err) }];
  } finally {
    host.legacyBusy = false;
  }
}

/** Copy everything found into OUR store. Existing projects are never
 *  overwritten: a clashing name gets a mark appended instead. */
export async function onImportLegacy(host: BmsFloorplanCard): Promise<void> {
  if (!host.legacyFinds.length) return;
  host.legacyBusy = true;
  try {
    const current = await loadProjectsResult(host.hass);
    if (!current.ok) {
      host.showToast(
        host.tx(
          `Не удалось прочитать наше хранилище — перенос отменён (${current.error ?? ''})`,
          `Could not read our own store — import cancelled (${current.error ?? ''})`,
        ),
      );
      return;
    }
    const mark = host.tx('(из старой версии)', '(from the old version)');
    let data = current.data;
    let added = 0;
    let renamed = 0;
    for (const find of host.legacyFinds) {
      const res = mergeProjects(data, find.data, mark);
      data = res.data;
      added += res.added;
      renamed += res.renamed;
    }
    if (!added) {
      host.showToast(host.tx('Переносить нечего', 'Nothing to import'));
      return;
    }
    const save = await saveProjects(data, host.hass);
    if (!save.ha && !save.local) {
      host.showToast(
        host.tx(
          `Перенос не сохранён: ${save.sharedError ?? save.userError ?? ''}`,
          `Import not saved: ${save.sharedError ?? save.userError ?? ''}`,
        ),
      );
      return;
    }
    host.storedProjects = data;
    host.projectList = listProjects(data);
    host.legacyOpen = false;
    host.showToast(
      host.tx(
        `Перенесено проектов: ${added}${renamed ? `, переименовано: ${renamed}` : ''}. Старая версия не тронута.`,
        `Imported ${added} project(s)${renamed ? `, ${renamed} renamed` : ''}. The old version is untouched.`,
      ),
    );
  } finally {
    host.legacyBusy = false;
  }
}
