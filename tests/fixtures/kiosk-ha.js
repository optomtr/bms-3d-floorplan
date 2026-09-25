// ---------------------------------------------------------------------------
// Поддельный Home Assistant для проверок киоск-страницы.
//
// Ставится через addInitScript ДО любых скриптов страницы и подменяет ровно две
// вещи: WebSocket и fetch. Сама страница при этом настоящая — та, что поедет на
// планшет. Проверки дёргают рычаги через window.__HA.
//
// Здесь намеренно НЕТ ни одной поблажки киоску: токен проверяется, auth_invalid
// присылается по-настоящему, после него сервер рвёт соединение — как HA.
// ---------------------------------------------------------------------------

(function () {
  'use strict';

  const hex = (n) => {
    const a = new Uint8Array(n);
    crypto.getRandomValues(a);
    return [...a].map((b) => b.toString(16).padStart(2, '0')).join('');
  };

  // Сторож киоска по-настоящему перезагружает страницу — значит, поддельный
  // сервер обязан пережить перезагрузку, иначе после неё токены «сами»
  // перестанут быть годными и проверка соврёт.
  const SAVE_KEY = '__HA_FAKE_STATE';
  const saved = (() => {
    try {
      return JSON.parse(sessionStorage.getItem(SAVE_KEY) || 'null');
    } catch {
      return null;
    }
  })();

  const HA = {
    /** Токены, которые сервер считает годными. */
    validTokens: new Set(),
    /** true — соединиться нельзя вовсе (сеть лежит, HA перезапускается). */
    down: false,
    /** Живые поддельные сокеты. */
    sockets: [],
    /** Что отдаёт get_states. */
    states: [{ entity_id: 'light.kitchen', state: 'on', attributes: {} }],
    /** План, который отдаёт bms_floorplan/plan/get (null = «ещё не сохранён»). */
    plan: null,
    /** Журналы для проверок. */
    authAttempts: [],
    wsOpens: 0,
    pairStarts: 0,
    renews: 0,
    /** Сессия фронтенда HA: отвечает ли /auth/token. */
    refreshOk: true,
    sessionToken: 'session-token-1',
    /** Сессия браузера принадлежит администратору: он вправе подтвердить код. */
    sessionAdmin: true,
    /** Сколько раз код подтвердили командой WebSocket (тихая привязка). */
    wsApprovals: 0,
    /** Состояние поддельной привязки. */
    pair: { code: '424242', device_id: hex(16), secret: null, approved: false, issued: 0 },
  };
  if (saved) {
    Object.assign(HA, saved, { validTokens: new Set(saved.validTokens || []) });
  }
  window.__HA = HA;

  HA.save = () => {
    try {
      sessionStorage.setItem(
        SAVE_KEY,
        JSON.stringify({
          validTokens: [...HA.validTokens],
          down: HA.down,
          refreshOk: HA.refreshOk,
          sessionToken: HA.sessionToken,
          pair: HA.pair,
          plan: HA.plan,
          pairBusy: !!HA.pairBusy,
          mute: !!HA.mute,
          authAttempts: HA.authAttempts,
          wsOpens: HA.wsOpens,
          pairStarts: HA.pairStarts,
          renews: HA.renews,
          sessionAdmin: HA.sessionAdmin,
          wsApprovals: HA.wsApprovals,
        }),
      );
    } catch {
      /* проверке хватит и памяти */
    }
  };
  /** Изменить состояние сервера так, чтобы оно пережило перезагрузку. */
  HA.set = (patch) => {
    Object.assign(HA, patch);
    // Через evaluate множество приезжает массивом — не даём подменить тип.
    if (Array.isArray(HA.validTokens)) HA.validTokens = new Set(HA.validTokens);
    HA.save();
  };

  HA.grant = (token) => {
    HA.validTokens.add(token);
    HA.save();
  };
  HA.revoke = (token) => {
    HA.validTokens.delete(token);
    HA.save();
  };
  /** Администратор подтвердил код. */
  HA.approve = () => {
    HA.pair.approved = true;
    HA.save();
  };
  /** HA перезапустился: все сокеты рвутся со стороны сервера. */
  HA.killSockets = (code) => {
    for (const s of [...HA.sockets]) s.__serverClose(code || 1006);
  };
  /** Событие state_changed в живой сокет. */
  HA.push = (entityId, state) => {
    for (const s of HA.sockets) {
      if (!s.__authed) continue;
      s.__deliver({
        type: 'event',
        event: {
          event_type: 'state_changed',
          data: { entity_id: entityId, new_state: { entity_id: entityId, state, attributes: {} } },
        },
      });
    }
  };

  const PLAN = () => ({
    id: 'p1',
    name: 'Тест',
    floors: [
      {
        id: 'f1',
        name: 'Первый',
        zones: [{ key: 'z1', name: 'Кухня', points: [[0, 0], [4, 0], [4, 3], [0, 3]] }],
        walls: [],
        items: [],
      },
    ],
  });
  HA.samplePlan = PLAN;
  if (!saved) HA.plan = PLAN();

  // --- WebSocket ------------------------------------------------------------

  const RealWS = window.WebSocket;

  class FakeWS {
    constructor(url) {
      this.url = url;
      this.readyState = 0;
      this.onopen = null;
      this.onmessage = null;
      this.onclose = null;
      this.onerror = null;
      this.__authed = false;
      HA.wsOpens++;
      HA.save();
      HA.sockets.push(this);
      setTimeout(() => {
        if (this.readyState !== 0) return;
        if (HA.down) {
          this.__drop(1006);
          return;
        }
        this.readyState = 1;
        if (this.onopen) this.onopen({});
        this.__deliver({ type: 'auth_required', ha_version: '2026.9.2' });
      }, 5);
    }

    __deliver(obj) {
      if (this.readyState !== 1) return;
      if (this.onmessage) this.onmessage({ data: JSON.stringify(obj) });
    }

    __drop(code) {
      if (this.readyState === 3) return;
      this.readyState = 3;
      const i = HA.sockets.indexOf(this);
      if (i >= 0) HA.sockets.splice(i, 1);
      if (this.onclose) this.onclose({ code: code || 1000 });
    }

    /** Разрыв со стороны сервера (перезапуск HA, обрыв сети). */
    __serverClose(code) {
      this.__drop(code);
    }

    close() {
      this.__drop(1000);
    }

    send(raw) {
      if (this.readyState !== 1) throw new Error('socket is not open');
      // Сокет-зомби: планшет проспал, соединение по всем признакам открыто, а
      // на том конце уже никого. Ровно этого браузер сам не замечает.
      if (HA.mute) return;
      let m;
      try {
        m = JSON.parse(raw);
      } catch {
        return;
      }
      if (m.type === 'auth') {
        HA.authAttempts.push(m.access_token);
        HA.save();
        if (HA.validTokens.has(m.access_token)) {
          this.__authed = true;
          this.__token = m.access_token;
          this.__deliver({ type: 'auth_ok', ha_version: '2026.9.2' });
        } else {
          this.__deliver({ type: 'auth_invalid', message: 'Invalid access token' });
          // Как настоящий HA: после auth_invalid соединение закрывается.
          setTimeout(() => this.__drop(1008), 5);
        }
        return;
      }
      if (!this.__authed) return;
      const id = m.id;
      const ok = (result) => this.__deliver({ type: 'result', id, success: true, result });
      const bad = (code) => this.__deliver({ type: 'result', id, success: false, error: { code } });
      if (m.type === 'ping') {
        this.__deliver({ type: 'pong', id });
      } else if (m.type === 'get_states') {
        ok(HA.states);
      } else if (m.type === 'get_config') {
        ok({ version: '2026.9.2' });
      } else if (m.type === 'subscribe_events') {
        ok(null);
      } else if (m.type === 'bms_floorplan/plan/get') {
        ok(HA.plan ? { active: 'p1', projects: { p1: HA.plan } } : {});
      } else if (m.type === 'frontend/get_user_data') {
        ok({ value: null });
      } else if (m.type === 'call_service') {
        ok(null);
      } else if (m.type === 'bms_floorplan/kiosk/approve') {
        // Как в HA: команда require_admin. Токен киоска — НЕ администратор,
        // сессия браузера — администратор, если так настроено в проверке.
        const admin = String(this.__token || '').startsWith('session-token') && HA.sessionAdmin;
        if (!admin) return bad('unauthorized');
        if (!HA.pair.secret || m.code !== HA.pair.code) return bad('code_expired');
        HA.pair.approved = true;
        HA.wsApprovals++;
        HA.save();
        ok({ device_id: HA.pair.device_id });
      } else {
        bad('unknown_command');
      }
    }
  }
  FakeWS.CONNECTING = 0;
  FakeWS.OPEN = 1;
  FakeWS.CLOSING = 2;
  FakeWS.CLOSED = 3;
  FakeWS.__real = RealWS;
  window.WebSocket = FakeWS;

  // --- fetch ----------------------------------------------------------------

  const realFetch = window.fetch.bind(window);
  const json = (status, body) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });

  window.fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : input && input.url ? input.url : String(input);
    const path = (() => {
      try {
        return new URL(url, location.href).pathname;
      } catch {
        return url;
      }
    })();
    const body = init && init.body ? init.body : null;

    if (path === '/auth/token') {
      if (!HA.refreshOk) return json(400, { error: 'invalid_grant' });
      return json(200, { access_token: HA.sessionToken, expires_in: 1800 });
    }

    if (path.startsWith('/api/bms_floorplan/pair/')) {
      let data = {};
      try {
        data = JSON.parse(String(body || '{}'));
      } catch {
        return json(400, { error: 'invalid_json' });
      }
      if (path.endsWith('/start')) {
        HA.pairStarts++;
        HA.save();
        if (HA.pairBusy) return json(429, { error: 'rate_limited' });
        HA.pair.secret = data.secret;
        HA.save();
        return json(200, {
          code: HA.pair.code,
          device_id: HA.pair.device_id,
          expires_in: 600,
        });
      }
      if (path.endsWith('/status')) {
        if (data.device_id !== HA.pair.device_id || data.secret !== HA.pair.secret) {
          return json(403, { error: 'identity_unknown' });
        }
        return json(200, { approved: !!HA.pair.approved });
      }
      if (path.endsWith('/renew')) {
        HA.renews++;
        HA.save();
        if (!HA.pair.approved) return json(403, { error: 'identity_unknown' });
        if (data.device_id !== HA.pair.device_id || data.secret !== HA.pair.secret) {
          return json(403, { error: 'identity_unknown' });
        }
        // Настоящий сервер требует ротацию — повторяем это правило.
        if (!data.next_secret || data.next_secret === data.secret) {
          return json(400, { error: 'rotation_required' });
        }
        HA.pair.secret = data.next_secret;
        const token = 'kiosk-token-' + ++HA.pair.issued;
        HA.grant(token);
        HA.save();
        return json(200, {
          access_token: token,
          device_id: HA.pair.device_id,
          request_id: data.request_id,
          expires_in: 3650 * 86400,
        });
      }
      return json(404, { error: 'not_found' });
    }

    return realFetch(input, init);
  };
})();
