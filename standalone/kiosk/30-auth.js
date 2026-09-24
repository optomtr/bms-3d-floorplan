// ---------------------------------------------------------------------------
// Очередь входов. Ни один отказ здесь не конечный.
//
// Порядок: свой токен киоска → токен сессии Home Assistant (hassTokens) →
// привязка по коду. Ручной токен из ⚙ (только у страницы, которую раздают
// папкой) идёт впереди всех: его ввёл человек руками, значит это осознанный
// выбор устройства.
//
// Отказ ЛЮБОГО источника помечает его негодным и передаёт очередь следующему.
// Раньше страница на auth_invalid поднимала у себя вечный флаг отказа входа и
// замирала до тех пор, пока кто-нибудь не подойдёт и не перезапустит её руками.
// Именно это владелец и видел: «время от времени перестаёт работать».
// Сторож проверок следит, чтобы тот флаг не вернулся (tests/33-kiosk-sync).
// ---------------------------------------------------------------------------

/** Пока столько миллисекунд до конца действия токена — обновляем заранее.
 *  Токен киоска живёт 10 лет, поэтому «заранее» — это год: обновление
 *  случается раз в годы, а не каждую ночь. */
const TOKEN_RENEW_AHEAD_MS = 365 * 24 * 3600 * 1000;

/** Сессионный токен фронтенда HA живёт полчаса — его обновляем за минуту. */
const SESSION_RENEW_AHEAD_MS = 60000;

/** Источник, который только что отвергли, не трогаем столько. */
const SOURCE_COOLDOWN_MS = 5 * 60 * 1000;

const auth = {
  /** Ручной токен признан негодным (до перезагрузки или новой правки в ⚙). */
  staticBadUntil: 0,
  /** Сессия HA признана негодной до этого момента. */
  sessionBadUntil: 0,
  /** Сколько раз подряд обновление токена киоска не дало результата. */
  renewFails: 0,
  /** Чем вошли в текущий сокет — чтобы знать, что гасить на auth_invalid. */
  source: null,
};

/** Полный адрес HTTP-ручки Home Assistant. */
function haApi(path) {
  const base = (cfg.apiBase || '').replace(/\/+$/, '');
  return base + path;
}

/** POST в ручку привязки. Ответ всегда разбирается как JSON; сетевой сбой и
 *  отказ сервера различаются по полю `status`. */
async function pairPost(path, body) {
  const r = await fetch(haApi('/api/bms_floorplan/pair' + path), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // Привязка — не то, что браузеру можно отдать из кэша.
    cache: 'no-store',
    body: JSON.stringify(body),
  });
  let data = null;
  try {
    data = await r.json();
  } catch {
    data = null;
  }
  if (!r.ok) {
    const err = new Error((data && data.error) || 'pair_http_' + r.status);
    err.status = r.status;
    err.code = data && data.error;
    throw err;
  }
  return data || {};
}

/** Обновление токена киоска по секрету. Секрет РОТИРУЕТСЯ: новый пишется на
 *  устройство ДО отправки, вместе со стабильным request_id, поэтому потерянный
 *  ответ повторяется тем же запросом, а не ломает привязку. */
async function renewKioskToken(cred) {
  const next = cred.pending_secret && HEX64.test(cred.pending_secret) ? cred.pending_secret : randHex(32);
  const reqId = cred.request_id && HEX32.test(cred.request_id) ? cred.request_id : randHex(16);
  if (cred.pending_secret !== next || cred.request_id !== reqId) {
    writeCred({ ...cred, pending_secret: next, request_id: reqId });
  }
  const res = await pairPost('/renew', {
    device_id: cred.device_id,
    secret: cred.secret,
    next_secret: next,
    request_id: reqId,
  });
  if (!res || typeof res.access_token !== 'string' || !res.access_token) {
    throw new Error('renew_no_token');
  }
  const fresh = {
    device_id: cred.device_id,
    secret: next,
    token: res.access_token,
    // Срок — подсказка для упреждающего обновления, право решает Home Assistant.
    exp: now() + (Number(res.expires_in) || 3650 * 24 * 3600) * 1000,
    renewed: now(),
  };
  writeCred(fresh);
  return fresh;
}

/** Токен сессии, который фронтенд Home Assistant сохранил для этого origin.
 *  Возвращает строку или null. НИКОГДА не бросает: любой сбой — это просто
 *  «сейчас не получилось», и очередь идёт дальше. */
async function sessionToken() {
  const t = jparse(lsGet('hassTokens'));
  if (!t || !t.access_token) return null;
  if ((t.expires || 0) - now() >= SESSION_RENEW_AHEAD_MS) return t.access_token;
  // Почти истёкший токен НЕ отправляем как есть: он вызвал бы auth_invalid.
  if (!t.refresh_token) return null;
  let r;
  try {
    r = await fetch(haApi('/auth/token'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      cache: 'no-store',
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: t.refresh_token,
        client_id: t.clientId || location.origin + '/',
      }),
    });
  } catch {
    // Сети нет — это временно, наказывать источник нечем.
    return null;
  }
  if (!r.ok) {
    // 400/403 значит, что refresh-токен отозвали: сессия мертва. Сам ключ
    // hassTokens не стираем — он принадлежит фронтенду HA, не нам.
    if (r.status === 400 || r.status === 403) auth.sessionBadUntil = now() + SOURCE_COOLDOWN_MS;
    return null;
  }
  const j = await r.json().catch(() => null);
  if (!j || !j.access_token) return null;
  t.access_token = j.access_token;
  t.expires = now() + (Number(j.expires_in) || 1800) * 1000;
  lsSet('hassTokens', JSON.stringify(t));
  return t.access_token;
}

/** Следующий годный токен: {source, token} либо null, если входа нет вообще.
 *  null — НЕ тупик: он включает экран привязки, который сам гаснет, как только
 *  администратор подтвердит код. */
async function nextToken() {
  if (cfg.staticToken && now() >= auth.staticBadUntil) {
    return { source: 'static', token: cfg.staticToken };
  }

  const cred = readCred();
  if (cred) {
    const fresh = cred.token && (cred.exp || 0) - now() > TOKEN_RENEW_AHEAD_MS;
    if (fresh) return { source: 'kiosk', token: cred.token };
    try {
      const updated = await renewKioskToken(cred);
      auth.renewFails = 0;
      return { source: 'kiosk', token: updated.token };
    } catch (err) {
      // Личность сервер не знает (отозвали или переставили HA) — привязка
      // больше ничего не стоит, выбрасываем её и идём дальше по очереди.
      if (err.status === 403 || err.status === 404) {
        dropCred();
      } else {
        auth.renewFails++;
        // Сервер сказал «рано» либо просто не отвечает: старый токен, если он
        // ещё есть, вполне мог остаться рабочим — пробуем им.
        if (cred.token) return { source: 'kiosk', token: cred.token };
      }
    }
  }

  if (cfg.useSession && now() >= auth.sessionBadUntil) {
    const tk = await sessionToken();
    if (tk) return { source: 'session', token: tk };
  }

  return null;
}

/** Вход отвергнут. Гасим ровно тот источник, которым входили, и отдаём очередь
 *  следующему — вместо того чтобы остановиться. */
function invalidate(source) {
  if (source === 'static') {
    // Значение из ⚙ не стираем: человек должен увидеть, что он ввёл, и
    // поправить. На этот запуск источник просто выключен.
    auth.staticBadUntil = now() + 24 * 3600 * 1000;
    return;
  }
  if (source === 'session') {
    auth.sessionBadUntil = now() + SOURCE_COOLDOWN_MS;
    return;
  }
  if (source === 'kiosk') {
    const cred = readCred();
    if (!cred) return;
    // Токен негоден — выбрасываем ИМЕННО его, секрет остаётся: по нему киоск
    // сам выпишет новый токен на следующем круге.
    const next = { ...cred };
    delete next.token;
    delete next.exp;
    writeCred(next);
    // Секрет тоже не помог дважды подряд — привязки больше нет, уходим к
    // сессии, а если и её нет — к экрану привязки.
    if (auth.renewFails >= 2) {
      dropCred();
      auth.renewFails = 0;
    }
  }
}
