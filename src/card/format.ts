// ---------------------------------------------------------------------------
// Разбор чисел, введённых человеком, и шаг уставки климата.
// ---------------------------------------------------------------------------

import type { HassEntity } from '../types';

/** Read a number a HUMAN typed. On RU/UZ keyboards the decimal separator is a
 *  comma, and `<input type="number">` does not accept one: the browser drops it
 *  and «3,5» arrives as «35» — a 35-metre-thick wall. So the size fields are
 *  plain text with a decimal keypad, and every one of them comes through here. */
export function humanNum(raw: string): number {
  return parseFloat(String(raw ?? '').trim().replace(',', '.'));
}

/** Step for a climate ±: whole degrees, never finer. A Generic Thermostat
 *  reports target_temp_step 0.1 (Celsius default precision, not settable from
 *  its helper flow), which makes ± crawl 21.0 → 21.1 and land on values like
 *  21.9. Round the device's own step up to a whole degree; entities that already
 *  step by 1° (ACs, the Tuya floor thermostats) are unaffected. */
export function climateStep(ent?: HassEntity): number {
  const s = Number(ent?.attributes?.target_temp_step);
  return Number.isFinite(s) && s >= 1 ? Math.round(s) : 1;
}

/** «Устройства сейчас нет»: Home Assistant его потерял (`unavailable`) или
 *  сущность вовсе удалили из системы (состояния нет совсем).
 *
 *  Это НЕ «выключено». Раньше и то и другое рисовалось как «выключено», и
 *  человек делал единственно возможный вывод: врёт система, а не устройство.
 *
 *  `unknown` СЮДА НЕ ВХОДИТ намеренно: у кнопки (`button.*`) это нормальное
 *  состояние «ещё ни разу не нажимали», и запрет на управление отобрал бы у
 *  домофона кнопку «Открыть дверь». Показанием оно при этом тоже не является —
 *  для читаемых значений см. isUnknownState. */
export function isOfflineState(state?: string): boolean {
  return !state || state === 'unavailable';
}

/** Значение, которого ещё нет (но связь есть). Показывается словами, а не
 *  сырым `unknown`. */
export function isUnknownState(state?: string): boolean {
  return state === 'unknown';
}
