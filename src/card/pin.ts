// ---------------------------------------------------------------------------
// PIN-замок редактора.
// ---------------------------------------------------------------------------

import type { BmsFloorplanCard } from '../ha-3d-floorplan-card';
import { hashPin, loadProjectsResult, saveProjects } from '../storage';

export function hasEditPin(host: BmsFloorplanCard): boolean {
  return !!host.storedProjects.editPin;
}

export function checkEditPin(host: BmsFloorplanCard, value: string): boolean {
  return !!value && host.storedProjects.editPin === hashPin(value);
}

export function submitPin(host: BmsFloorplanCard, e?: Event): void {
  e?.preventDefault();
  const input = host.renderRoot?.querySelector('.pin-input') as HTMLInputElement | null;
  const val = input?.value ?? '';
  if (checkEditPin(host, val)) {
    host.editUnlocked = true;
    host.pinPromptOpen = false;
    host.pinError = '';
    host.doEnterEdit();
  } else {
    host.pinError = 'Wrong PIN — try again';
    if (input) input.value = '';
  }
}

export function cancelPin(host: BmsFloorplanCard): void {
  host.pinPromptOpen = false;
  host.pinError = '';
}

/** Set or change the edit PIN (called from inside the editor). */
export async function onSetEditPin(host: BmsFloorplanCard): Promise<void> {
  const v = host.editPinInput.trim();
  if (v.length < 3) {
    host.showToast('PIN must be at least 3 characters');
    return;
  }
// Re-read the shared set first so we don't clobber projects (or a PIN) saved
// meanwhile on another device/tab — same guard as onSavePlan/onDeleteProject.
  const loaded = await loadProjectsResult(host.hass);
  if (!loaded.ok) {
    host.showToast(
      host.tx('Не удалось прочитать хранилище — PIN не сохранён', 'Could not read the store — PIN not saved'),
    );
    return;
  }
  host.storedProjects = loaded.data;
  host.storedProjects.editPin = hashPin(v);
  host.editPinInput = '';
  host.editUnlocked = true; // we're already editing
  await saveProjects(host.storedProjects, host.hass);
  host.showToast('Edit PIN set');
  host.requestUpdate();
}

export async function onRemoveEditPin(host: BmsFloorplanCard): Promise<void> {
  const loaded = await loadProjectsResult(host.hass);
  if (!loaded.ok) {
    host.showToast(
      host.tx('Не удалось прочитать хранилище — PIN не изменён', 'Could not read the store — PIN unchanged'),
    );
    return;
  }
  host.storedProjects = loaded.data;
  delete host.storedProjects.editPin;
  await saveProjects(host.storedProjects, host.hass);
  host.showToast('Edit PIN removed');
  host.requestUpdate();
}
