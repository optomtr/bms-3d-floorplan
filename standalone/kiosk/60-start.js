// ---------------------------------------------------------------------------
// Точка входа ядра. Страница описывает СВОИ особенности (адрес бандла, откуда
// берётся план, надстройки вроде домофона), всё остальное — здесь.
// ---------------------------------------------------------------------------

let cfg = null;

/** Загрузка бандла карточки. Раньше единственный неудачный import оставлял на
 *  стене надпись и пустоту навсегда; теперь это просто попытка из многих.
 *  На повторах к адресу добавляется метка: браузер запоминает неудачный
 *  разбор модуля, и без неё второй import вернул бы ту же ошибку не спросив
 *  сеть. */
async function loadCardBundle() {
  for (let n = 0; ; n++) {
    const url = n === 0 ? cfg.cardUrl : cfg.cardUrl + (cfg.cardUrl.includes('?') ? '&' : '?') + '_r=' + n;
    try {
      await import(url);
      return;
    } catch (err) {
      cfg.setStatus('карточка не загрузилась, повторяю… (' + errMsg(err) + ')', true);
      await sleepMs(backoff(n));
    }
  }
}

function normalize(options) {
  const o = options || {};
  return {
    cardUrl: o.cardUrl,
    wsUrl: o.wsUrl,
    apiBase: o.apiBase || '',
    useSession: !!o.useSession,
    staticToken: typeof o.staticToken === 'string' ? o.staticToken : '',
    // Привязываться можно только к известному адресу Home Assistant. При
    // ручной раздаче папки без адреса — единственный случай, когда без
    // человека не обойтись.
    canPair: o.canPair !== undefined ? !!o.canPair : !!(o.useSession || o.apiBase),
    deviceName: o.deviceName || 'BMS Планировка · киоск',
    setStatus: o.setStatus || (() => {}),
    cardConfig: o.cardConfig,
    fetchPlan: o.fetchPlan,
    onConnected: o.onConnected || null,
    decorateHass: o.decorateHass || null,
    onReload: o.onReload || null,
  };
}

async function start(options) {
  cfg = normalize(options);
  injectStyles();

  // Сначала — то, что уже известно. Планшет показывает прошлый план сразу,
  // ещё до всякой сети, и больше никогда не встречает человека пустотой.
  await loadCardBundle();
  const cached = cachedPlan();
  if (cached) {
    applyPlan(cached);
    setOffline(true, 'нет связи');
    cfg.setStatus('', false);
  }

  // Полный срок сторожа на первое подключение, а не «уже три минуты как
  // ничего не получалось» с самого запуска.
  live.lastGood = now();
  installRecovery();
  connect();
}

/** Приборная панель для автопроверок и для разбора жалобы с объекта. */
function state() {
  const cred = readCred();
  return {
    source: auth.source,
    hasKioskCred: !!cred,
    hasKioskToken: !!(cred && cred.token),
    pairing: ui.shown,
    pairCode: ui.pairCode ? ui.pairCode.textContent : null,
    offline: !!(ui.offline && ui.offline.classList.contains('on')),
    socket: live.ws ? live.ws.readyState : -1,
    planOnScreen: !!live.card,
    planLoaded: live.planLoaded,
    attempt: live.attempt,
    reloads: live.reloads,
    selfPaired: selfPairing.done,
    glRecoveries: live.glRecoveries,
    sinceGoodMs: now() - live.lastGood,
    entities: Object.keys(live.states).length,
  };
}

// Наружу отдаём ровно то, что нужно обёртке страницы и автопроверкам.
window.BMSKiosk = {
  start,
  state,
  kick,
  request,
  callService,
  subscribe,
  sameOrigin,
  pickProject,
  validPlan,
  cachedPlan,
};
