// ---------------------------------------------------------------------------
// Числа, которые набирает человек, и числа, которые он читает.
//
// На русской и узбекской раскладке десятичный разделитель — ЗАПЯТАЯ. Полагаться
// на то, что <input type="number"> сам приведёт «3,5» к «3.5», нельзя: экранная
// клавиатура планшета отдаёт строку как есть, а parseFloat('3,5') читает 3 —
// стена молча становится втрое короче задуманной.
//
// Поэтому разбор здесь свой, и он же используется на выходе: показываем тоже с
// запятой, иначе человек видит одно, а набирает другое.
// ---------------------------------------------------------------------------

/** Пробелы всех сортов (включая неразрывный и узкий) плюс апостроф-разделитель
 *  тысяч — их вырезаем, они ничего не значат в размере. */
const JUNK = /[\s   ']/g;

/**
 * Прочитать размер, набранный человеком. «3,5» → 3.5, «1 234,5» → 1234.5,
 * «3.5» → 3.5, «» / «абв» → `fallback`.
 *
 * Несколько точек («1.234.5») трактуются как разделители тысяч плюс десятичная
 * последней группы: так ведут себя банковские поля, и это единственное чтение,
 * при котором ошибка не увеличивает число в тысячу раз.
 */
export function humanNum(raw: unknown, fallback = NaN): number {
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : fallback;
  if (raw == null) return fallback;
  let s = String(raw).trim().replace(JUNK, '');
  if (!s) return fallback;
  s = s.replace(/,/g, '.');
  const parts = s.split('.');
  if (parts.length > 2) s = `${parts.slice(0, -1).join('')}.${parts[parts.length - 1]}`;
  const v = Number(s);
  return Number.isFinite(v) ? v : fallback;
}

/** Ограничить число рамками (NaN → `lo`). */
export function clamp(v: number, lo: number, hi: number): number {
  if (!Number.isFinite(v)) return lo;
  return v < lo ? lo : v > hi ? hi : v;
}

/**
 * Число в текст с запятой и без хвостовых нулей: 5 → «5», 5.2 → «5,2»,
 * 5.204 → «5,2».
 *
 * Хвостовые нули режутся только в ДРОБНОЙ части: наивный `/0+$/` превращал бы
 * 500 в 5.
 */
export function fmtNum(v: number, digits = 2): string {
  if (!Number.isFinite(v)) return '—';
  let s = v.toFixed(digits);
  if (digits > 0) s = s.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
  return s.replace('.', ',');
}

/** «5,2 м». */
export const fmtM = (v: number): string => `${fmtNum(v, 2)} м`;
/** «20,4 м²». */
export const fmtArea = (v: number): string => `${fmtNum(v, 1)} м²`;
/** «−90°». */
export const fmtDeg = (v: number): string => `${fmtNum(v, 1)}°`;
/** «12 см» для мелочей вроде толщины стены. */
export const fmtCm = (v: number): string => `${fmtNum(v * 100, 0)} см`;
