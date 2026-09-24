// ---------------------------------------------------------------------------
// Живое соединение с Home Assistant и всё, что заставляет его вернуться.
//
// Правила, которых здесь держимся:
//   * ни одна ветка не заканчивается ожиданием человека;
//   * пауза между попытками растёт, но не больше 60 секунд;
//   * пока план на экране, он там и остаётся — с пометкой «нет связи»;
//   * если ничего не получалось три минуты, страница перезагружает сама себя,
//     но не чаще раза в пять минут (см. mayReload).
// ---------------------------------------------------------------------------

/** Ничего не получалось столько — перезагружаем страницу. */
const WATCHDOG_MS = 3 * 60 * 1000;
/** Как часто сторож смотрит на часы. */
const WATCHDOG_TICK_MS = 15000;
/** Сокет молчит дольше этого, несмотря на ping, — рвём сами. Браузер о
 *  мёртвом соединении после сна планшета может не узнать часами. */
const PING_DEAD_MS = 75000;
const PING_EVERY_MS = 30000;
/** Скачок системных часов больше этого = планшет спал (или проснулся NTP). */
const WAKE_GAP_MS = 30000;
/** Сколько времени дать на восстановление после пробуждения, прежде чем
 *  сторожу будет позволено перезагрузить страницу. */
const WAKE_GRACE_MS = 60000;
/** Как часто перечитываем сохранённый план (события об этом HA не шлёт). */
const PLAN_POLL_MS = 10000;
/** Сколько ждать ответа на проверочный ping после пробуждения. */
const KICK_PING_TIMEOUT_MS = 5000;

const live = {
  ws: null,
  reqId: 10,
  pending: new Map(),
  subs: new Map(),
  states: {},
  card: null,
  planJson: null,
  planLoaded: false,
  attempt: 0,
  timer: 0,
  heartbeat: 0,
  lastGood: 0,
  pushQueued: false,
  reloads: 0,
  glRecoveries: 0,
};

// --- Отправка ---------------------------------------------------------------

function request(msg) {
  return new Promise((res, rej) => {
    const sock = live.ws;
    // Сокет закрыт (нажатие во время переподключения) — отказываем сразу,
    // карточка откатит оптимистичный вид, а не зависнет.
    if (!sock || sock.readyState !== WebSocket.OPEN) {
      rej(new Error('сокет закрыт'));
      return;
    }
    const id = ++live.reqId;
    msg.id = id;
    live.pending.set(id, { res, rej });
    try {
      sock.send(JSON.stringify(msg));
    } catch (e) {
      live.pending.delete(id);
      rej(e);
    }
  });
}

/** Подписка на поток команды (домофонная сигнализация WebRTC). Повторяет
 *  hass.connection.subscribeMessage(cb, msg). */
function subscribe(cb, msg) {
  return new Promise((res, rej) => {
    const sock = live.ws;
    if (!sock || sock.readyState !== WebSocket.OPEN) {
      rej(new Error('сокет закрыт'));
      return;
    }
    const id = ++live.reqId;
    live.subs.set(id, cb);
    live.pending.set(id, {
      res: () =>
        res(() => {
          live.subs.delete(id);
          return request({ type: 'unsubscribe_events', subscription: id }).catch(() => {});
        }),
      rej: (e) => {
        live.subs.delete(id);
        rej(e);
      },
    });
    try {
      sock.send(JSON.stringify({ ...msg, id }));
    } catch (e) {
      live.subs.delete(id);
      live.pending.delete(id);
      rej(e);
    }
  });
}

function callService(domain, service, data) {
  const p = request({ type: 'call_service', domain, service, service_data: data || {} });
  p.catch(() => {});
  return p;
}

const callWS = (msg) => request(msg);

// --- Карточка ---------------------------------------------------------------

function ensureCard(plan) {
  if (live.card) return live.card;
  const el = document.createElement('bms-floorplan-card');
  el.setConfig(cfg.cardConfig(plan));
  document.body.appendChild(el);
  live.card = el;
  watchGl(el);
  return el;
}

/** Показать (возможно, новый) план. true, если картинка действительно
 *  изменилась. */
function applyPlan(plan) {
  if (!validPlan(plan)) return false;
  const json = JSON.stringify(plan);
  if (live.card && json === live.planJson) return false;
  live.planJson = json;
  if (!live.card) {
    ensureCard(plan);
    return true;
  }
  live.card.setConfig(cfg.cardConfig(plan));
  return true;
}

function pushHass() {
  if (live.pushQueued || !live.card) return;
  live.pushQueued = true;
  requestAnimationFrame(() => {
    live.pushQueued = false;
    if (!live.card) return;
    const hass = { states: { ...live.states }, callService, callWS };
    if (cfg.decorateHass) cfg.decorateHass(hass);
    live.card.hass = hass;
  });
}

/** Потеря контекста WebGL — вторая линия обороны.
 *
 *  Первая живёт в самой карточке (src/card/scene.ts): она пересобирает сцену
 *  на webglcontextlost/restored. Если это почему-то не сработало, киоск через
 *  шесть секунд собирает карточку заново с нуля: планшет, проспавший ночь,
 *  обязан проснуться с картинкой, а не с чёрным прямоугольником. */
function watchGl(cardEl) {
  const attach = () => {
    const canvas = cardEl.renderRoot && cardEl.renderRoot.querySelector('canvas');
    if (!canvas) return false;
    if (canvas.__bmsGlWatched) return true;
    canvas.__bmsGlWatched = true;
    canvas.addEventListener(
      'webglcontextlost',
      () => {
        setTimeout(() => {
          const gone = !cardEl.isConnected || !cardEl.sceneManager || canvas.isContextLost?.();
          if (!gone) return;
          live.glRecoveries++;
          rebuildCard();
        }, 6000);
      },
      false,
    );
    return true;
  };
  if (attach()) return;
  // Холст появляется только после первой отрисовки карточки.
  let tries = 0;
  const t = setInterval(() => {
    if (attach() || ++tries > 40) clearInterval(t);
  }, 250);
}

/** Собрать карточку заново из последнего известного плана. */
function rebuildCard() {
  const plan = jparse(live.planJson) || cachedPlan();
  const old = live.card;
  live.card = null;
  live.planJson = null;
  if (old) {
    try {
      old.remove();
    } catch {
      /* уже убрана */
    }
  }
  if (plan) {
    applyPlan(plan);
    pushHass();
  }
}

// --- Состояние на экране ----------------------------------------------------

function markGood() {
  live.lastGood = now();
  setOffline(false);
}

function markOffline(why) {
  if (live.card) setOffline(true, 'нет связи');
  else cfg.setStatus(why || 'подключаюсь к Home Assistant…', true);
}

// --- Соединение -------------------------------------------------------------

function scheduleReconnect(why, immediate) {
  if (live.timer) return;
  markOffline(why);
  const delay = immediate ? 0 : backoff(live.attempt++);
  live.timer = setTimeout(() => {
    live.timer = 0;
    connect();
  }, delay);
}

/** Немедленное переподключение: сеть вернулась, вкладку показали, планшет
 *  проснулся. Сбрасывает накопленную паузу — ждать больше нечего. */
function kick(why) {
  // После пробуждения даём минуту на восстановление, иначе сторож перезагрузит
  // страницу раньше, чем сокет успеет открыться.
  live.lastGood = Math.max(live.lastGood, now() - WATCHDOG_MS + WAKE_GRACE_MS);
  const sock = live.ws;
  if (sock && sock.readyState === WebSocket.OPEN) {
    // Сокет выглядит живым. После сна это часто неправда: планшет вернулся в
    // сеть с другого адреса, а браузер об этом ещё не знает и будет держать
    // «открытое» соединение часами. Поэтому спрашиваем — и ждём ответа.
    let answered = false;
    request({ type: 'ping' }).then(
      () => {
        answered = true;
        markGood();
      },
      () => {},
    );
    setTimeout(() => {
      if (answered || live.ws !== sock) return;
      live.attempt = 0; // это не череда неудач, а одно пробуждение
      closeSock(sock);
    }, KICK_PING_TIMEOUT_MS);
    return;
  }
  if (sock && sock.readyState === WebSocket.CONNECTING) return;
  live.attempt = 0;
  clearTimeout(live.timer);
  live.timer = 0;
  scheduleReconnect(why, true);
}

function stopHeartbeat() {
  if (live.heartbeat) clearInterval(live.heartbeat);
  live.heartbeat = 0;
}

function startHeartbeat(sock) {
  stopHeartbeat();
  live.heartbeat = setInterval(() => {
    if (live.ws !== sock || sock.readyState !== WebSocket.OPEN) return;
    request({ type: 'ping' }).then(markGood, () => {});
    if (now() - live.lastGood > PING_DEAD_MS) {
      try {
        sock.close();
      } catch {
        /* уже закрыт */
      }
    }
  }, PING_EVERY_MS);
}

function connect() {
  clearTimeout(live.timer);
  live.timer = 0;
  let sock;
  try {
    sock = live.ws = new WebSocket(cfg.wsUrl);
  } catch (e) {
    // Неверный адрес — раньше это была остановка навсегда. Теперь просто
    // ещё одна неудачная попытка.
    scheduleReconnect('адрес Home Assistant не открывается');
    return;
  }
  // Продолжения от сокета, который уже заменён новым, игнорируем: устаревший
  // обработчик не должен отправлять в новый сокет и затирать состояние.
  const current = () => live.ws === sock;

  sock.onmessage = async (ev) => {
    if (!current()) return;
    let m;
    try {
      m = JSON.parse(ev.data);
    } catch {
      return;
    }
    if (m.type === 'auth_required') {
      let got = null;
      try {
        got = await nextToken();
      } catch {
        got = null;
      }
      if (!current()) return;
      if (!got) {
        // Входа нет ни одного — показываем код привязки. Экран сам погаснет,
        // как только администратор его подтвердит.
        auth.source = null;
        runPairing();
        closeSock(sock);
        return;
      }
      auth.source = got.source;
      try {
        sock.send(JSON.stringify({ type: 'auth', access_token: got.token }));
      } catch {
        closeSock(sock);
      }
    } else if (m.type === 'auth_invalid') {
      // Ключевая правка. Раньше здесь ставился флаг, после которого страница
      // не подключалась уже никогда.
      invalidate(auth.source);
      auth.source = null;
      closeSock(sock);
    } else if (m.type === 'auth_ok') {
      hidePairing();
      dropPending();
      markGood();
      live.attempt = 0;
      startHeartbeat(sock);
      try {
        const res = await request({ type: 'get_states' });
        if (!current()) return;
        const next = {};
        for (const s of res || []) next[s.entity_id] = s;
        live.states = next; // пересобираем → уходят удалённые сущности
        markGood();
        if (cfg.onConnected) {
          try {
            await cfg.onConnected({ request, subscribe, states: live.states });
          } catch {
            /* надстройка страницы не имеет права ронять синхронизацию */
          }
        }
        if (!current()) return;
        const plan = await cfg.fetchPlan(request);
        if (!current()) return;
        if (plan) {
          applyPlan(plan);
          cachePlan(plan);
          live.planLoaded = true;
          cfg.setStatus('', false);
        } else if (!live.card) {
          cfg.setStatus('подключено · план ещё не сохранён', true);
        }
        pushHass();
        await request({ type: 'subscribe_events', event_type: 'state_changed' });
        markGood();
      } catch (e) {
        if (!current()) return;
        closeSock(sock);
      }
    } else if (m.type === 'result' || m.type === 'pong') {
      const p = live.pending.get(m.id);
      if (p) {
        live.pending.delete(m.id);
        if (m.type === 'pong' || m.success) p.res(m.result);
        else p.rej(m.error || new Error('вызов не удался'));
      }
      markGood();
    } else if (m.type === 'event' && live.subs.has(m.id)) {
      const cb = live.subs.get(m.id);
      if (cb) cb(m.event);
      markGood();
    } else if (m.type === 'event' && m.event && m.event.event_type === 'state_changed') {
      const d = m.event.data;
      if (d.new_state) live.states[d.entity_id] = d.new_state;
      else delete live.states[d.entity_id];
      markGood();
      pushHass();
    }
  };

  sock.onclose = () => {
    if (!current()) return;
    stopHeartbeat();
    live.pending.forEach((p) => p.rej(new Error('соединение закрыто')));
    live.pending.clear();
    live.subs.clear();
    scheduleReconnect('связь потеряна — переподключаюсь…');
  };

  sock.onerror = () => closeSock(sock);
}

function closeSock(sock) {
  try {
    sock.close();
  } catch {
    /* уже закрыт */
  }
  // Сокет, закрытый до открытия, события close не получит — подстрахуемся.
  if (live.ws === sock && sock.readyState === WebSocket.CLOSED) {
    scheduleReconnect('связь потеряна — переподключаюсь…');
  }
}

// --- Сторож и пробуждение ---------------------------------------------------

function installRecovery() {
  // Сторож: ничего не получалось три минуты → перезагрузка, но не чаще чем
  // раз в пять минут (отметка лежит в localStorage и переживает перезагрузку).
  setInterval(() => {
    if (ui.shown) return; // ждём человека с кодом — перезагрузка ничего не даст
    if (now() - live.lastGood < WATCHDOG_MS) return;
    if (!mayReload()) return;
    markReload();
    live.reloads++;
    if (cfg.onReload) cfg.onReload();
    else location.reload();
  }, WATCHDOG_TICK_MS);

  // Планшет спал: системные часы прыгнули вперёд сильнее, чем шёл таймер.
  // Сокет после такого почти всегда зомби, хотя readyState говорит OPEN.
  let tick = now();
  setInterval(() => {
    const t = now();
    const gap = t - tick - 1000;
    tick = t;
    if (gap > WAKE_GAP_MS) kick('планшет проснулся');
  }, 1000);

  addEventListener('online', () => kick('сеть вернулась'));
  addEventListener('pageshow', () => kick('страница показана'));
  addEventListener('focus', () => kick('окно активно'));
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) kick('вкладку показали');
  });

  // Перечитываем сохранённый план: HA не шлёт о нём событий, а правки в
  // редакторе должны доезжать до стены сами.
  setInterval(async () => {
    if (!live.ws || live.ws.readyState !== WebSocket.OPEN) return;
    let plan = null;
    try {
      plan = await cfg.fetchPlan(request);
    } catch {
      return;
    }
    if (plan && applyPlan(plan)) {
      cachePlan(plan);
      live.planLoaded = true;
      pushHass();
    }
  }, PLAN_POLL_MS);
}
