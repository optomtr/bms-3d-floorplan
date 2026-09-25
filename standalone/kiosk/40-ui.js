// ---------------------------------------------------------------------------
// То, что киоск показывает на стене: пометка «нет связи» и экран привязки.
//
// Оба элемента и их стили создаёт ядро, а не страница: так обе копии киоска
// выглядят и ведут себя одинаково, и расхождению неоткуда взяться.
// ---------------------------------------------------------------------------

const ui = {
  offline: null,
  pair: null,
  pairCode: null,
  pairNote: null,
  shown: false,
};

function injectStyles() {
  if (document.getElementById('bms-kiosk-style')) return;
  const style = document.createElement('style');
  style.id = 'bms-kiosk-style';
  style.textContent = [
    '#bms-offline{position:fixed;left:10px;bottom:10px;z-index:30;font:12px/1.2 system-ui,sans-serif;',
    'color:#ffe0b8;background:rgba(58,40,20,.85);padding:5px 10px;border-radius:8px;pointer-events:none;display:none}',
    '#bms-offline.on{display:block}',
    '#bms-pair{position:fixed;inset:0;z-index:40;display:none;align-items:center;justify-content:center;',
    'background:rgba(10,14,22,.72);backdrop-filter:blur(3px);font:16px/1.5 system-ui,sans-serif;color:#e8eef7;padding:16px}',
    '#bms-pair.on{display:flex}',
    '#bms-pair .card{max-width:420px;width:100%;background:#16243d;border:1px solid rgba(255,255,255,.14);',
    'border-radius:16px;padding:22px 24px;text-align:center;box-shadow:0 18px 50px rgba(0,0,0,.45)}',
    '#bms-pair h2{margin:0 0 6px;font-size:18px}',
    '#bms-pair p{margin:0;font-size:13px;color:#9fb3cc}',
    '#bms-pair .code{margin:16px 0 12px;font:700 40px/1.1 ui-monospace,SFMono-Regular,Menlo,monospace;',
    'letter-spacing:.16em;color:#fff}',
    '#bms-pair .note{margin-top:12px;font-size:12px;color:#7f93ad;min-height:1.5em}',
  ].join('');
  document.head.appendChild(style);
}

/** Пометка «нет связи». Показывается ТОЛЬКО когда план уже на экране: пустой
 *  экран с пометкой — это всё тот же пустой экран. */
function setOffline(on, text) {
  if (!ui.offline) {
    ui.offline = document.createElement('div');
    ui.offline.id = 'bms-offline';
    document.body.appendChild(ui.offline);
  }
  ui.offline.textContent = text || 'нет связи';
  ui.offline.classList.toggle('on', !!on);
}

function buildPairOverlay() {
  if (ui.pair) return;
  injectStyles();
  const wrap = document.createElement('div');
  wrap.id = 'bms-pair';
  wrap.innerHTML =
    '<div class="card">' +
    '<h2>Подключение планшета</h2>' +
    '<p>Назовите этот код администратору Home Assistant.</p>' +
    '<div class="code">······</div>' +
    '<p>Настройки → Устройства и службы → BMS Планировка → Настроить → «Подтвердить код планшета».</p>' +
    '<div class="note"></div>' +
    '</div>';
  document.body.appendChild(wrap);
  ui.pair = wrap;
  ui.pairCode = wrap.querySelector('.code');
  ui.pairNote = wrap.querySelector('.note');
}

function showPairing(code, note) {
  buildPairOverlay();
  ui.shown = true;
  if (code) ui.pairCode.textContent = code;
  ui.pairNote.textContent = note || 'Жду подтверждения…';
  ui.pair.classList.add('on');
}

function hidePairing() {
  ui.shown = false;
  if (ui.pair) ui.pair.classList.remove('on');
}

// --- Сама привязка ----------------------------------------------------------

const pairing = {
  running: false,
  attempt: 0,
};

/** Один круг привязки: получить код (или поднять уже показанный), дождаться
 *  подтверждения администратора, выписать токен. Живёт до успеха; сам гаснет,
 *  как только токен получен. Второй раз параллельно не запускается. */
async function runPairing() {
  if (pairing.running) return;
  if (!cfg.canPair) {
    // Папку раздают вручную и адрес Home Assistant неизвестен — привязывать
    // не к чему. Это единственный случай, когда нужен человек.
    showPairing('——————', 'Укажите адрес Home Assistant (⚙).');
    return;
  }
  pairing.running = true;
  try {
    for (;;) {
      if (readCred()) return; // вход уже появился другим путём
      let session = readPending();
      if (!session) {
        try {
          const secret = randHex(32);
          const res = await pairPost('/start', { secret, name: cfg.deviceName });
          if (!res.code || !res.device_id) throw new Error('pair_start_bad');
          session = {
            secret,
            device_id: res.device_id,
            code: String(res.code),
            until: now() + (Number(res.expires_in) || 600) * 1000,
          };
          writePending(session);
        } catch (err) {
          // Ограничение частоты, HA ещё не поднялся, интеграция выключена —
          // всё это временно. Ждём и пробуем снова, экран не тупик.
          showPairing(null, 'Подключаюсь к Home Assistant…');
          await sleepMs(backoff(pairing.attempt++));
          continue;
        }
      }
      showPairing(session.code, 'Жду подтверждения…');
      pairing.attempt = 0;

      // Ожидание администратора. Опрос каждые 3 секунды; истёкший код
      // выбрасывается и выписывается новый — сам, без человека.
      let approved = false;
      while (now() < session.until) {
        await sleepMs(3000);
        try {
          const st = await pairPost('/status', {
            device_id: session.device_id,
            secret: session.secret,
          });
          if (st && st.approved) {
            approved = true;
            break;
          }
        } catch (err) {
          if (err.status === 403) {
            // Сервер такой личности не знает: код протух или его отозвали.
            break;
          }
          // Связи нет — просто ждём дальше.
        }
      }
      if (!approved) {
        dropPending();
        continue;
      }

      // Подтверждено: выписываем токен по секрету и переезжаем в постоянную
      // привязку. Секрет при этом ротируется (см. renewKioskToken).
      const cred = { device_id: session.device_id, secret: session.secret };
      writeCred(cred);
      try {
        await renewKioskToken(cred);
      } catch (err) {
        if (err.status === 403 || err.status === 404) {
          dropCred();
          dropPending();
          continue; // личность не прижилась — начинаем привязку заново
        }
        await sleepMs(backoff(pairing.attempt++));
        continue; // токен выпишется на следующем круге очереди входов
      }
      dropPending();
      hidePairing();
      // Токен есть — не ждём следующего круга пауз, подключаемся сейчас же.
      kick('привязка подтверждена');
      return;
    }
  } finally {
    pairing.running = false;
  }
}

/** Тихая привязка — киоск становится независимым, пока сессия браузера ещё жива.
 *
 *  Киоск, открытый после входа в Home Assistant, работает сессией браузера. Её
 *  время ограничено: когда HA давно не открывали, она умирает, и тогда на
 *  стене появился бы код привязки — человеку пришлось бы подойти. Владелец
 *  просил, чтобы киоск не просил никогда. Поэтому, пока сессия жива, киоск
 *  сам берёт код и сам же подтверждает его этой сессией: подтверждать вправе
 *  администратор, а в этом браузере вошёл именно он. Экран при этом не
 *  меняется. Вошёл не администратор или интеграция старая — ничего не делаем:
 *  киоск работает сессией, а без неё покажет код, как и раньше.
 *
 *  Один раз за загрузку страницы: отказ не повторяется в цикле. */
const selfPairing = { tried: false, done: false };
async function selfPair() {
  if (selfPairing.tried || !cfg.canPair || readCred() || pairing.running) return;
  selfPairing.tried = true;
  try {
    const secret = randHex(32);
    const res = await pairPost('/start', { secret, name: cfg.deviceName });
    if (!res.code || !res.device_id) return;
    await request({ type: 'bms_floorplan/kiosk/approve', code: String(res.code) });
    const cred = { device_id: res.device_id, secret };
    writeCred(cred);
    await renewKioskToken(cred);
    selfPairing.done = true;
  } catch {
    /* не администратор, связь оборвалась — останется прежний путь */
  }
}
