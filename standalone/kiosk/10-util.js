// ---------------------------------------------------------------------------
// Общие мелочи ядра киоска.
//
// Всё, что здесь есть, обязано работать на планшете, который никто не трогает
// месяцами: ни одна ветка не имеет права закончиться просьбой к человеку.
// ---------------------------------------------------------------------------

/** Пространство имён в localStorage. Общее для обеих копий страницы: планшет,
 *  переехавший с одного адреса киоска на другой, сохраняет привязку. */
const NS = 'bms_floorplan_kiosk';

const HEX64 = /^[0-9a-f]{64}$/;
const HEX32 = /^[0-9a-f]{32}$/;

const now = () => Date.now();

function lsGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    // Приватный режим / отключённое хранилище: киоск обязан работать и так,
    // просто без памяти между перезапусками.
    return null;
  }
}

function lsSet(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function lsDel(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* см. lsGet */
  }
}

function jparse(text) {
  if (typeof text !== 'string') return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/** Криптографически стойкие случайные байты в hex. Источник — SecureRandom
 *  браузера (crypto.getRandomValues); Math.random для секрета недопустим. */
function randHex(bytes) {
  const buf = new Uint8Array(bytes);
  crypto.getRandomValues(buf);
  let out = '';
  for (const b of buf) out += b.toString(16).padStart(2, '0');
  return out;
}

/** Пауза между попытками: 1, 2, 4… секунды с разбросом, ПОТОЛОК 60 секунд.
 *  Разброс нужен, чтобы десяток планшетов на объекте не долбил вернувшийся
 *  Home Assistant в одну и ту же миллисекунду. */
const BACKOFF_CAP_MS = 60000;
function backoff(attempt) {
  const base = Math.min(1000 * Math.pow(2, Math.min(Math.max(attempt, 0), 6)), BACKOFF_CAP_MS);
  const jittered = Math.round(base * (0.7 + Math.random() * 0.6));
  return Math.max(500, Math.min(jittered, BACKOFF_CAP_MS));
}

const errMsg = (e) => (e && e.message ? e.message : String(e));

/** План считается годным только с хотя бы одним этажом: пустой документ на
 *  стене неотличим от поломки. */
const validPlan = (p) => !!p && Array.isArray(p.floors) && p.floors.length > 0;

/** Значение ?card=/?plan= разрешается ровно так, как это сделали бы
 *  import()/fetch(), и обязано остаться НА ЭТОМ ЖЕ origin. Так отсекаются
 *  data:, javascript:, blob:, чужие абсолютные адреса, //host и трюки с
 *  пробелами — регулярное выражение так не умеет. */
function sameOrigin(u) {
  if (!u) return null;
  try {
    const r = new URL(u, location.href);
    return r.origin === location.origin ? r.href : null;
  } catch {
    return null;
  }
}

/** Из документа {active, projects} достаём активный (или первый годный) план. */
function pickProject(data) {
  if (!data || !data.projects) return null;
  let id = data.active;
  if (!(id && validPlan(data.projects[id]))) {
    id = Object.keys(data.projects).find((k) => validPlan(data.projects[k]));
  }
  return id ? data.projects[id] : null;
}

/** Пауза. Объявлена функцией, а не const-стрелкой: ядро склеивается из
 *  нескольких файлов в один блок, и const здесь означал бы мёртвую зону
 *  для всего, что объявлено выше (в этом репозитории это уже ловили). */
function sleepMs(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
