// ---------------------------------------------------------------------------
// Стенд для автопроверок.
//
// Ничего из src/ не импортирует и не собирает: грузит ГОТОВЫЙ бандл (по
// умолчанию /dist/bms-floorplan-card.js) и даёт тестам рычаги —
// состояния сущностей, журнал вызовов служб, поддельное WS-хранилище планов
// и управляемые сбои чтения/записи.
//
// Бандл можно подменить параметром ?bundle=<url> — так проверка «умеет ли она
// краснеть» гоняется против намеренно испорченной копии, а сам dist/ остаётся
// нетронутым.
// ---------------------------------------------------------------------------

const params = new URLSearchParams(location.search);
const BUNDLE = params.get('bundle') || '/dist/bms-floorplan-card.js';

// Home Assistant отдаёт <ha-card> сам — на стенде нужна заглушка.
if (!customElements.get('ha-card')) {
  customElements.define('ha-card', class extends HTMLElement {});
}

function clone(v) {
  return v === undefined || v === null ? v : JSON.parse(JSON.stringify(v));
}

const api = {
  bundleUrl: BUNDLE,
  bundleLoaded: false,
  card: null,
  /** Текущая карта сущностей (объекты пересоздаются только при изменении —
   *  карта сравнивает состояния ПО ССЫЛКЕ). */
  states: {},
  /** Журнал всего, что карточка отправила в hass.callService. */
  serviceCalls: [],
  /** Журнал всего, что ушло в hass.callWS. */
  wsCalls: [],
  /** Тест может подменить: (domain, service, data) => Promise | undefined. */
  serviceHandler: null,
  /** Поддельные хранилища планов. `pin` и `version` — под новый протокол
   *  интеграции (base_version + отдельный документ PIN); старый бандл их просто
   *  не спрашивает. */
  wsStore: { shared: null, user: {}, legacy: null, pin: null, version: 1, enforceVersion: false },
  /** Управляемые сбои: { '<ws type>': { times: 1, message: '...', code: '...' } }.
   *  times убывает; times: -1 — навсегда. */
  wsFail: {},
  /** Сколько кадров отрисовал three.js на момент отметки. */
  frameMark: 0,
};

api.reset = () => {
  api.card = null;
  api.states = {};
  api.serviceCalls = [];
  api.wsCalls = [];
  api.serviceHandler = null;
  api.wsStore = { shared: null, user: {}, legacy: null, pin: null, version: 1, enforceVersion: false };
  api.wsFail = {};
};

function shouldFail(type) {
  const f = api.wsFail[type];
  if (!f) return null;
  if (f.times === 0) return null;
  if (typeof f.times === 'number' && f.times > 0) f.times -= 1;
  return f;
}

/** Ошибка чтения, которую storage.ts обязан отличить от «эндпойнта нет»:
 *  ни 'unknown command', ни 'not found' в тексте. */
function wsError(f) {
  const e = new Error(f.message || 'сбой чтения хранилища');
  if (f.code) e.code = f.code;
  return e;
}

api.makeHass = () => ({
  language: 'ru',
  locale: { language: 'ru' },
  states: { ...api.states },
  callService: (domain, service, data = {}) => {
    api.serviceCalls.push({ domain, service, data: clone(data), at: performance.now() });
    if (api.serviceHandler) return api.serviceHandler(domain, service, data);
    return Promise.resolve();
  },
  callWS: async (msg) => {
    api.wsCalls.push(clone(msg));
    const f = shouldFail(msg.type);
    if (f) throw wsError(f);
    switch (msg.type) {
      case 'bms_floorplan/plan/get': {
        const doc = clone(api.wsStore.shared);
        if (doc && typeof doc === 'object') doc.version = api.wsStore.version;
        return doc;
      }
      case 'bms_floorplan/plan/set': {
        // Новый протокол: запись несёт base_version. Конфликт проверяем только
        // когда тест этого явно попросил.
        if (
          api.wsStore.enforceVersion &&
          msg.base_version !== undefined &&
          msg.base_version !== api.wsStore.version
        ) {
          throw wsError({ message: 'план изменён на другом устройстве', code: 'version_conflict' });
        }
        api.wsStore.shared = clone(msg.value);
        api.wsStore.version += 1;
        return { ok: true, version: api.wsStore.version };
      }
      case 'bms_floorplan/pin/get':
        return { pin: api.wsStore.pin };
      case 'bms_floorplan/pin/set':
        api.wsStore.pin = msg.pin ?? msg.value ?? null;
        return { ok: true };
      case 'frontend/get_user_data':
        return { value: clone(api.wsStore.user[msg.key] ?? null) };
      case 'frontend/set_user_data':
        api.wsStore.user[msg.key] = clone(msg.value);
        return { ok: true };
      case 'bms_floorplan/legacy/get': {
        if (!api.wsStore.legacy) throw wsError({ message: 'unknown command', code: 'unknown_command' });
        return { found: true, data: clone(api.wsStore.legacy) };
      }
      default:
        throw wsError({ message: `unknown command: ${msg.type}`, code: 'unknown_command' });
    }
  },
});

api.loadBundle = async () => {
  if (!api.bundleLoaded) {
    await import(BUNDLE);
    api.bundleLoaded = true;
  }
  return customElements.whenDefined('bms-floorplan-card');
};

/**
 * Смонтировать карточку.
 * opts: { config, states, height, withHass }
 */
api.mount = async (opts = {}) => {
  await api.loadBundle();
  if (opts.states) api.setStates(opts.states, { push: false });
  const card = document.createElement('bms-floorplan-card');
  card.setConfig({
    type: 'custom:bms-floorplan-card',
    height: opts.height || '480px',
    language: 'ru',
    ...(opts.config || {}),
  });
  document.getElementById('host').appendChild(card);
  api.card = card;
  if (opts.withHass !== false) card.hass = api.makeHass();
  return true;
};

api.unmount = () => {
  const c = api.card;
  api.card = null;
  c?.remove();
  return true;
};

/** Признак «сцена построена» — по нему тесты ждут готовности. */
api.sceneReady = () => {
  const c = api.card;
  return !!(c && c.sceneManager && c.sceneManager.renderer && (c.planLoaded || c.loadError));
};

api.setStates = (patch, { push = true } = {}) => {
  for (const [id, v] of Object.entries(patch)) {
    if (v === null) {
      delete api.states[id];
      continue;
    }
    const prev = api.states[id];
    // НОВЫЙ объект: карточка диффит состояния по ссылке.
    api.states[id] = {
      entity_id: id,
      state: v.state !== undefined ? v.state : (prev?.state ?? 'off'),
      attributes: { ...(prev?.attributes || {}), ...(v.attributes || {}) },
    };
  }
  if (push) api.push();
  return true;
};

api.push = () => {
  if (api.card) api.card.hass = api.makeHass();
  return true;
};

/** Число кадров, реально отрисованных three.js. */
api.frames = () => api.card?.sceneManager?.renderer?.info?.render?.frame ?? -1;

api.markFrames = () => {
  api.frameMark = api.frames();
  return api.frameMark;
};

api.framesSinceMark = () => api.frames() - api.frameMark;

/** Корень теневого DOM карточки — тесты ищут элементы только через него. */
api.root = () => api.card?.renderRoot ?? null;

api.text = (sel) => api.root()?.querySelector(sel)?.textContent?.trim() ?? null;

api.click = (sel) => {
  const el = api.root()?.querySelector(sel);
  if (!el) return false;
  el.click();
  return true;
};

window.BMS = api;
window.dispatchEvent(new Event('bms-harness-ready'));
