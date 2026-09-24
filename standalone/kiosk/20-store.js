// ---------------------------------------------------------------------------
// Что киоск помнит между запусками: свою привязку, последний показанный план и
// когда он в последний раз перезагружал сам себя.
// ---------------------------------------------------------------------------

const LS_CRED = NS + '.cred'; // собственная привязка киоска (токен + секрет)
const LS_PEND = NS + '.pending'; // незавершённая привязка (код показан, ждём админа)
const LS_PLAN = NS + '.plan'; // последний показанный план
const LS_RELOAD = NS + '.reload'; // отметка последней самоперезагрузки

// --- Привязка ---------------------------------------------------------------

/** Привязка читается СТРОГО: чужая или побитая запись не должна утащить киоск
 *  в бесконечные 400-е. Не прошла проверку — считаем, что привязки нет. */
function readCred() {
  const c = jparse(lsGet(LS_CRED));
  if (!c || typeof c !== 'object') return null;
  if (typeof c.device_id !== 'string' || !HEX32.test(c.device_id)) return null;
  if (typeof c.secret !== 'string' || !HEX64.test(c.secret)) return null;
  if (c.token !== undefined && typeof c.token !== 'string') return null;
  return c;
}

function writeCred(cred) {
  return lsSet(LS_CRED, JSON.stringify(cred));
}

function dropCred() {
  lsDel(LS_CRED);
}

/** Незавершённая привязка переживает перезагрузку: человек, который уже пошёл
 *  за администратором, не должен вернуться к ДРУГОМУ коду на экране. */
function readPending() {
  const p = jparse(lsGet(LS_PEND));
  if (!p || typeof p !== 'object') return null;
  if (typeof p.secret !== 'string' || !HEX64.test(p.secret)) return null;
  if (typeof p.device_id !== 'string' || !HEX32.test(p.device_id)) return null;
  if (typeof p.code !== 'string' || !/^[0-9]{6}$/.test(p.code)) return null;
  if (!(Number(p.until) > now())) return null;
  return p;
}

function writePending(p) {
  lsSet(LS_PEND, JSON.stringify(p));
}

function dropPending() {
  lsDel(LS_PEND);
}

// --- Последний план ---------------------------------------------------------

/** Копия плана без фотографий комнат. Фото — base64 и занимают почти весь
 *  объём хранилища; геометрия важнее картинки, пустой экран хуже обоих. */
function stripPhotos(plan) {
  const lean = JSON.parse(JSON.stringify(plan));
  for (const f of lean.floors || []) {
    for (const z of f.zones || []) delete z.bgImage;
    delete f.bgImage;
  }
  return lean;
}

/** Запомнить план, чтобы следующий запуск начался с картинки, а не с пустоты. */
function cachePlan(plan) {
  if (!validPlan(plan)) return false;
  let text;
  try {
    text = JSON.stringify(plan);
  } catch {
    return false;
  }
  if (lsSet(LS_PLAN, text)) return true;
  try {
    return lsSet(LS_PLAN, JSON.stringify(stripPhotos(plan)));
  } catch {
    return false;
  }
}

function cachedPlan() {
  const p = jparse(lsGet(LS_PLAN));
  return validPlan(p) ? p : null;
}

// --- Самоперезагрузка -------------------------------------------------------

/** Сторож перезагружает страницу не чаще, чем раз в столько. Отметка лежит в
 *  localStorage, а не в памяти: она обязана пережить саму перезагрузку, иначе
 *  сторож превращается в бесконечный цикл. */
const RELOAD_MIN_GAP_MS = 5 * 60 * 1000;

function mayReload() {
  const t = Number(lsGet(LS_RELOAD)) || 0;
  // Часы планшета могут уехать назад (NTP после сна) — отметка из будущего
  // не должна запереть сторожа навсегда.
  if (t > now()) return true;
  return now() - t > RELOAD_MIN_GAP_MS;
}

function markReload() {
  lsSet(LS_RELOAD, String(now()));
}
