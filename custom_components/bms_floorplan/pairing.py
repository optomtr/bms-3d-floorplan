"""Собственная личность киоска, отдельная от чьего-либо входа в Home Assistant.

Зачем. Киоск на стене брал доступ из сессии браузера Home Assistant. Сессия
живёт до тех пор, пока в HA заходят; планшет, простоявший месяц, оставался с
отозванным токеном и пустым экраном до тех пор, пока к нему не подойдёт
человек. Здесь у киоска появляется СВОЙ доступ: он ни от кого не зависит и
восстанавливается сам.

Протокол (повторяет проверенный в интеграции bms_tablet):

* Планшет генерирует секрет 256 бит через SecureRandom браузера. Секрет не
  показывается на экране и не попадает ни в URL, ни в QR.
* ``pair/start`` получает секрет и имя, возвращает шестизначный код и случайный
  ``device_id``. Сервер хранит только SHA-256 секрета — открытого секрета на
  диске нет нигде.
* Код действует 10 минут. Кодов всего не больше ``SESSIONS_TOTAL``; с одного
  адреса — не больше ``SESSIONS_PER_IP`` неподтверждённых, поэтому чужой в сети
  вытесняет только свои собственные коды, а не код настоящего планшета.
* Подтверждает код ТОЛЬКО администратор. Создаётся отдельный системный
  пользователь HA в группе обычных пользователей, БЕЗ прав администратора: это
  отдельный отзыв доступа для каждого киоска.
* ``pair/status`` требует секрет: одного кода недостаточно.
* ``pair/renew`` требует идентификатор, текущий секрет, НОВЫЙ секрет и
  стабильный ``request_id``, и не требует действующего токена — иначе устройство
  с протухшим токеном не смогло бы восстановиться. Секрет ротируется; сервер
  помнит предыдущий отпечаток неделю, поэтому потерянный ответ повторяется тем
  же ``request_id``, а не ломает привязку.
* ``revoke`` ставит надгробие ДО удаления пользователя HA: прерванный отзыв
  повторяется при следующем запуске и не оставляет живого доступа.

Модуль намеренно не импортирует ничего из Home Assistant: ему хватает объекта
с ``auth`` и хранилища с ``async_load``/``async_save``. Благодаря этому его
проверки (``tests/python/test_pairing.py``) гоняются без установленного HA, а
вся привязка к ядру собрана в ``pairing_api.py``.
"""

from __future__ import annotations

import asyncio
import copy
import hashlib
import hmac
import logging
import re
import secrets
import time
from collections import OrderedDict
from datetime import timedelta

_LOGGER = logging.getLogger(__name__)

HEX64 = re.compile(r"^[0-9a-f]{64}$")
HEX32 = re.compile(r"^[0-9a-f]{32}$")

DAY = 86400
#: Срок кода привязки.
CODE_TTL = 600
#: Сколько всего неподтверждённых кодов держим.
SESSIONS_TOTAL = 32
#: Сколько неподтверждённых кодов держит один адрес.
SESSIONS_PER_IP = 3
#: Запросов привязки с одного адреса в минуту.
RATE_PER_MINUTE = 30
#: Сколько адресов помним (таблица частоты не должна расти без предела).
RATE_TABLE_MAX = 1024
#: Больше стольких киосков на один дом не бывает.
DEVICE_LIMIT = 512
#: Токен киоска живёт столько. Обновляется задолго до конца (см. страницу).
TOKEN_DAYS = 3650
#: Не чаще одного обновления токена в этот срок. Раньше здесь стояли сутки, но
#: тогда устройство с отвергнутым токеном сидело без доступа до суток. Десять
#: минут одновременно и защищают от потока обновлений, и дают восстановиться.
RENEW_MIN_INTERVAL = 600
#: Предыдущий секрет принимается столько (повтор потерянного ответа).
PREV_SECRET_TTL = 7 * DAY
#: Только цифры: код называют голосом и набирают на телефоне.
CODE_ALPHABET = "0123456789"
CODE_LENGTH = 6
MAX_NAME = 80


class PairError(Exception):
    """Отказ с кодом состояния HTTP и коротким машинным кодом."""

    def __init__(self, status: int, code: str) -> None:
        self.status = status
        self.code = code
        super().__init__(code)


def fingerprint(value) -> str:
    """SHA-256 секрета. На диск попадает только он."""
    if not isinstance(value, str) or not HEX64.fullmatch(value):
        raise PairError(400, "invalid_secret")
    return hashlib.sha256(value.encode()).hexdigest()


def _device_id(value) -> str:
    if not isinstance(value, str) or not HEX32.fullmatch(value):
        raise PairError(400, "invalid_request")
    return value


class PairingManager:
    """Личности киосков: выдача, продление, отзыв.

    ``hass`` нужен только ради ``hass.auth``; ``store`` — любой объект с
    ``async_load``/``async_save``.
    """

    def __init__(self, hass, store) -> None:
        self.hass = hass
        self.store = store
        self.devices: dict = {}
        self.sessions: OrderedDict = OrderedDict()
        self.rates: OrderedDict = OrderedDict()
        self.lock = asyncio.Lock()
        #: user_id → когда его в последний раз видели (только в памяти).
        self.seen: dict = {}

    # -- Жизненный цикл ------------------------------------------------------

    async def async_load(self) -> None:
        data = await self.store.async_load()
        self.devices = (data or {}).get("devices", {}) or {}
        # Надгробие переживает перезапуск: прерванный отзыв доводится до конца,
        # иначе отозванный киоск остался бы с живым пользователем HA.
        for device in list(self.devices.values()):
            if device.get("revoked"):
                await self._remove_user(device)

    async def _save(self, devices: dict) -> None:
        await self.store.async_save({"devices": devices})
        self.devices = devices

    # -- Защита --------------------------------------------------------------

    def limit(self, ip) -> None:
        """Ограничение частоты по адресу. Бросает 429."""
        moment = time.monotonic()
        key = str(ip or "unknown")
        events = [t for t in self.rates.pop(key, []) if moment - t < 60]
        self.rates[key] = events
        if len(self.rates) > RATE_TABLE_MAX:
            self.rates.popitem(last=False)
        if len(events) >= RATE_PER_MINUTE:
            raise PairError(429, "rate_limited")
        events.append(moment)

    def prune(self) -> None:
        for code in [c for c, s in self.sessions.items() if s["until"] < time.time()]:
            del self.sessions[code]

    # -- Привязка ------------------------------------------------------------

    async def start(self, data: dict, ip=None) -> dict:
        digest = fingerprint((data or {}).get("secret"))
        name = (data or {}).get("name") or "BMS Планировка"
        if not isinstance(name, str) or not 1 <= len(name) <= MAX_NAME:
            raise PairError(400, "invalid_name")
        async with self.lock:
            self.prune()
            # Повторный start с ТЕМ ЖЕ секретом отдаёт тот же код: перезагрузка
            # страницы не должна менять цифры, которые человек уже понёс админу.
            for code, session in self.sessions.items():
                if hmac.compare_digest(session["hash"], digest):
                    return {
                        "code": code,
                        "device_id": session["id"],
                        "expires_in": max(0, int(session["until"] - time.time())),
                    }
            source = str(ip or "unknown")
            mine = [c for c, s in self.sessions.items() if s.get("ip") == source and not s.get("approved")]
            if len(mine) >= SESSIONS_PER_IP:
                del self.sessions[mine[0]]
            elif len(self.sessions) >= SESSIONS_TOTAL:
                # Таблица полна — отказ, а НЕ вытеснение кода с чужого адреса.
                raise PairError(429, "pairing_busy")
            code = self._fresh_code()
            device_id = secrets.token_hex(16)
            self.sessions[code] = {
                "id": device_id,
                "name": name,
                "hash": digest,
                "until": time.time() + CODE_TTL,
                "ip": source,
            }
            return {"code": code, "device_id": device_id, "expires_in": CODE_TTL}

    def _fresh_code(self) -> str:
        while True:
            code = "".join(secrets.choice(CODE_ALPHABET) for _ in range(CODE_LENGTH))
            if code not in self.sessions:
                return code

    async def status(self, data: dict) -> dict:
        digest = fingerprint((data or {}).get("secret"))
        device_id = _device_id((data or {}).get("device_id"))
        self.prune()
        for session in self.sessions.values():
            if session["id"] == device_id and hmac.compare_digest(session["hash"], digest):
                return {"approved": bool(session.get("approved"))}
        # Подтверждённая личность переживает и перезапуск, и истечение кода.
        device = self.devices.get(device_id) or {}
        if not device.get("revoked") and hmac.compare_digest(device.get("hash", ""), digest):
            return {"approved": True}
        raise PairError(403, "identity_unknown")

    async def approve(self, code, admin: str) -> dict:
        """Подтверждение администратором. Создаёт НЕадминистративного пользователя."""
        if not isinstance(code, str) or not code.strip():
            raise PairError(400, "invalid_code")
        code = code.strip().upper()
        if len(code) != CODE_LENGTH:
            raise PairError(400, "invalid_code")
        async with self.lock:
            self.prune()
            session = self.sessions.get(code)
            if session is None:
                raise PairError(404, "code_expired")
            if session.get("approved"):
                return {"device_id": session["id"]}
            if len(self.devices) >= DEVICE_LIMIT:
                raise PairError(429, "device_limit")
            # Отдельный пользователь на киоск = отдельный отзыв доступа.
            user = await self.hass.auth.async_create_system_user(
                "BMS Киоск · " + session["name"], group_ids=["system-users"]
            )
            try:
                devices = copy.deepcopy(self.devices)
                devices[session["id"]] = {
                    "name": session["name"],
                    "user_id": user.id,
                    "hash": session["hash"],
                    "created": time.time(),
                    "approved_by": admin,
                }
                await self._save(devices)
            except BaseException:
                # Запись не удалась — пользователь HA не должен остаться сиротой.
                await self.hass.auth.async_remove_user(user)
                raise
            session["approved"] = True
            _LOGGER.info("Киоск BMS подтверждён: %s (админ %s)", session["id"], admin)
            return {"device_id": session["id"]}

    async def renew(self, data: dict, ip=None) -> dict:
        """Выдать токен по секрету. Действующий токен для этого НЕ нужен."""
        data = data or {}
        device_id = _device_id(data.get("device_id"))
        request_id = data.get("request_id")
        if not isinstance(request_id, str) or not HEX32.fullmatch(request_id):
            raise PairError(400, "invalid_request")
        digest = fingerprint(data.get("secret"))
        next_hash = fingerprint(data.get("next_secret"))
        if hmac.compare_digest(digest, next_hash):
            raise PairError(400, "rotation_required")
        async with self.lock:
            device = self.devices.get(device_id)
            if not device or device.get("revoked"):
                raise PairError(403, "identity_unknown")
            moment = time.time()
            current = hmac.compare_digest(device.get("hash", ""), digest)
            # Повтор завершённой ротации: тот же запрос, тот же новый секрет,
            # окно доверия не продлевается.
            replay = (
                moment < device.get("prev_until", 0)
                and hmac.compare_digest(device.get("prev_hash", ""), digest)
                and device.get("request_id") == request_id
                and hmac.compare_digest(device.get("hash", ""), next_hash)
            )
            if not current and not replay:
                raise PairError(403, "identity_unknown")
            user = await self.hass.auth.async_get_user(device["user_id"])
            if user is None or not user.is_active:
                raise PairError(403, "identity_unknown")
            refresh = self.hass.auth.async_get_refresh_token(device.get("token_id", ""))
            # Запись никогда не должна указывать на токен ЧУЖОГО пользователя.
            if refresh is not None and refresh.user.id != user.id:
                raise PairError(409, "identity_conflict")
            if current and refresh is not None and moment - device.get("renewed", 0) < RENEW_MIN_INTERVAL:
                raise PairError(429, "renew_too_soon")
            created = current or refresh is None
            if created:
                refresh = await self.hass.auth.async_create_refresh_token(
                    user, access_token_expiration=timedelta(days=TOKEN_DAYS)
                )
            try:
                devices = copy.deepcopy(self.devices)
                record = devices[device_id]
                if current:
                    record.update(
                        hash=next_hash,
                        prev_hash=digest,
                        prev_until=moment + PREV_SECRET_TTL,
                        request_id=request_id,
                        token_id=refresh.id,
                        renewed=moment,
                    )
                else:
                    record["token_id"] = refresh.id
                # Кто и откуда обновил доступ — видно администратору.
                record.update(last_renew_at=moment, last_ip=str(ip or ""), last_seen=moment)
                await self._save(devices)
                token = self.hass.auth.async_create_access_token(refresh)
                for previous in list(user.refresh_tokens.values()):
                    if previous.id != refresh.id:
                        self.hass.auth.async_remove_refresh_token(previous)
            except BaseException:
                if created:
                    self.hass.auth.async_remove_refresh_token(refresh)
                raise
            _LOGGER.info(
                "Токен киоска %s: %s", device_id, "повторён" if replay else "обновлён"
            )
            return {
                "access_token": token,
                "device_id": device_id,
                "request_id": request_id,
                "expires_in": TOKEN_DAYS * DAY,
            }

    # -- Отзыв ---------------------------------------------------------------

    async def _remove_user(self, device: dict) -> None:
        user = await self.hass.auth.async_get_user(device.get("user_id"))
        if user is None:
            return
        for token in list(user.refresh_tokens.values()):
            self.hass.auth.async_remove_refresh_token(token)
        await self.hass.auth.async_remove_user(user)

    async def revoke(self, device_id, admin: str) -> dict:
        async with self.lock:
            if device_id not in self.devices:
                return {}
            devices = copy.deepcopy(self.devices)
            record = devices[device_id]
            # Надгробие пишется ДО удаления пользователя: прерванный отзыв
            # доводится до конца при следующем запуске.
            record.update(revoked=True)
            record.pop("hash", None)
            record.pop("prev_hash", None)
            await self._save(devices)
            await self._remove_user(record)
            for code in [c for c, s in self.sessions.items() if s["id"] == device_id]:
                del self.sessions[code]
            _LOGGER.warning("Доступ киоска отозван: %s (админ %s)", device_id, admin)
            return {}

    # -- Справка -------------------------------------------------------------

    def mark_seen(self, user_id) -> None:
        self.seen[user_id] = time.time()

    def device_for_user(self, user_id):
        for key, device in self.devices.items():
            if device.get("user_id") == user_id and not device.get("revoked"):
                return key
        return None

    def listing(self) -> list[dict]:
        out = []
        for key, device in self.devices.items():
            seen = [t for t in (device.get("last_seen"), self.seen.get(device.get("user_id"))) if t]
            out.append(
                {
                    "device_id": key,
                    "name": device.get("name", ""),
                    "revoked": bool(device.get("revoked")),
                    "created": device.get("created"),
                    "renewed": device.get("renewed"),
                    "last_ip": device.get("last_ip"),
                    "last_seen": max(seen) if seen else None,
                }
            )
        return out

    def pending_codes(self) -> list[dict]:
        """Коды, которые сейчас ждут администратора (сам код НЕ раскрываем)."""
        self.prune()
        return [
            {"name": s["name"], "expires_in": max(0, int(s["until"] - time.time()))}
            for s in self.sessions.values()
            if not s.get("approved")
        ]
