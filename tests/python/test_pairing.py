#!/usr/bin/env python3
"""Проверки привязки киоска.

Гоняются БЕЗ установленного Home Assistant и без pytest:

    python3 tests/python/test_pairing.py

Так и задуман ``custom_components/bms_floorplan/pairing.py``: он не импортирует
ничего из ядра HA, ему хватает объекта с ``auth`` и хранилища. Вся привязка к
ядру собрана в ``pairing_api.py``, и то, что проверяется в нём (кто имеет право
подтверждать и отзывать, требуют ли ручки входа), проверяется чтением исходника
— в этом окружении поднять websocket_api негде.
"""

from __future__ import annotations

import asyncio
import hashlib
import inspect
import json
import re
import sys
import time
from datetime import timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "custom_components" / "bms_floorplan"))

import logging  # noqa: E402

logging.getLogger("pairing").setLevel(logging.CRITICAL)

import pairing  # noqa: E402

logging.getLogger(pairing.__name__).setLevel(logging.CRITICAL)
from pairing import PairError, PairingManager  # noqa: E402

SECRET_A = "a" * 64
SECRET_B = "b" * 64
SECRET_C = "c" * 64
REQ_1 = "1" * 32
REQ_2 = "2" * 32


# --- Поддельное ядро --------------------------------------------------------


class FakeStore:
    """Хранилище HA. ``fail_next`` роняет ближайшую запись — так проверяется,
    что сорванная запись не оставляет за собой мусора."""

    def __init__(self, data=None):
        self.data = data
        self.saves = 0
        self.fail_next = False

    async def async_load(self):
        return json.loads(json.dumps(self.data)) if self.data is not None else None

    async def async_save(self, data):
        if self.fail_next:
            self.fail_next = False
            raise OSError("диск переполнен")
        self.saves += 1
        self.data = json.loads(json.dumps(data))


class FakeRefreshToken:
    def __init__(self, token_id, user, expiration):
        self.id = token_id
        self.user = user
        self.access_token_expiration = expiration


class FakeUser:
    def __init__(self, user_id, name, group_ids):
        self.id = user_id
        self.name = name
        self.group_ids = list(group_ids)
        self.is_active = True
        self.refresh_tokens = {}

    @property
    def is_admin(self):
        return "system-admin" in self.group_ids


class FakeAuth:
    def __init__(self):
        self.users = {}
        self.tokens = {}
        self.issued = []
        self._n = 0

    def _next(self, prefix):
        self._n += 1
        return f"{prefix}{self._n}"

    async def async_create_system_user(self, name, group_ids):
        user = FakeUser(self._next("user-"), name, group_ids)
        self.users[user.id] = user
        return user

    async def async_get_user(self, user_id):
        return self.users.get(user_id)

    async def async_remove_user(self, user):
        self.users.pop(user.id, None)

    async def async_create_refresh_token(self, user, access_token_expiration=None):
        token = FakeRefreshToken(self._next("refresh-"), user, access_token_expiration)
        self.tokens[token.id] = token
        user.refresh_tokens[token.id] = token
        return token

    def async_get_refresh_token(self, token_id):
        return self.tokens.get(token_id)

    def async_remove_refresh_token(self, token):
        self.tokens.pop(token.id, None)
        token.user.refresh_tokens.pop(token.id, None)

    def async_create_access_token(self, refresh):
        access = self._next("access-")
        self.issued.append((access, refresh.id))
        return access


class FakeHass:
    def __init__(self):
        self.auth = FakeAuth()


def manager(store=None):
    hass = FakeHass()
    return PairingManager(hass, store or FakeStore()), hass


async def paired(secret=SECRET_A):
    """Подтверждённый киоск: удобная заготовка для проверок продления."""
    mgr, hass = manager()
    started = await mgr.start({"secret": secret, "name": "Прихожая"}, ip="10.0.0.5")
    await mgr.approve(started["code"], "admin-1")
    return mgr, hass, started


# --- Проверки ---------------------------------------------------------------


async def test_start_выдаёт_шестизначный_код_и_идентификатор():
    mgr, _ = manager()
    res = await mgr.start({"secret": SECRET_A, "name": "Кухня"}, ip="1.2.3.4")
    assert re.fullmatch(r"[0-9]{6}", res["code"]), res["code"]
    assert re.fullmatch(r"[0-9a-f]{32}", res["device_id"]), res["device_id"]
    assert res["expires_in"] == pairing.CODE_TTL


async def test_повтор_start_с_тем_же_секретом_даёт_тот_же_код():
    """Перезагрузка страницы не должна менять цифры, которые человек уже понёс
    администратору."""
    mgr, _ = manager()
    first = await mgr.start({"secret": SECRET_A}, ip="1.2.3.4")
    second = await mgr.start({"secret": SECRET_A}, ip="1.2.3.4")
    assert first["code"] == second["code"]
    assert first["device_id"] == second["device_id"]


async def test_секрет_проверяется_до_всякой_логики():
    mgr, _ = manager()
    for bad in (None, "", "не-hex", "A" * 64, "a" * 63, 42):
        try:
            await mgr.start({"secret": bad})
        except PairError as err:
            assert err.status == 400 and err.code == "invalid_secret"
        else:
            raise AssertionError(f"секрет {bad!r} приняли")


async def test_на_диск_попадает_только_хэш_секрета():
    store = FakeStore()
    mgr = PairingManager(FakeHass(), store)
    started = await mgr.start({"secret": SECRET_A}, ip="1.1.1.1")
    await mgr.approve(started["code"], "admin-1")
    dump = json.dumps(store.data)
    assert SECRET_A not in dump, "открытый секрет утёк в хранилище"
    assert hashlib.sha256(SECRET_A.encode()).hexdigest() in dump


async def test_ограничение_частоты_по_адресу():
    mgr, _ = manager()
    for _ in range(pairing.RATE_PER_MINUTE):
        mgr.limit("9.9.9.9")
    try:
        mgr.limit("9.9.9.9")
    except PairError as err:
        assert (err.status, err.code) == (429, "rate_limited")
    else:
        raise AssertionError("ограничение частоты не сработало")
    # Соседний адрес ограничением не задет.
    mgr.limit("9.9.9.10")


async def test_таблица_адресов_не_растёт_без_предела():
    mgr, _ = manager()
    for i in range(pairing.RATE_TABLE_MAX + 50):
        mgr.limit(f"10.0.{i // 256}.{i % 256}")
    assert len(mgr.rates) <= pairing.RATE_TABLE_MAX + 1


async def test_один_адрес_вытесняет_только_свои_коды():
    mgr, _ = manager()
    mine = []
    for secret in ("1" * 64, "2" * 64, "3" * 64, "4" * 64):
        mine.append((await mgr.start({"secret": secret}, ip="7.7.7.7"))["code"])
    # Чужой код, сделанный раньше всех, обязан выжить.
    other = await mgr.start({"secret": "5" * 64}, ip="8.8.8.8")
    assert other["code"] in mgr.sessions
    live = [c for c in mine if c in mgr.sessions]
    assert len(live) == pairing.SESSIONS_PER_IP, live


async def test_status_требует_секрет_а_не_только_код():
    mgr, _ = manager()
    started = await mgr.start({"secret": SECRET_A}, ip="1.1.1.1")
    assert (await mgr.status({"device_id": started["device_id"], "secret": SECRET_A}))["approved"] is False
    try:
        await mgr.status({"device_id": started["device_id"], "secret": SECRET_B})
    except PairError as err:
        assert (err.status, err.code) == (403, "identity_unknown")
    else:
        raise AssertionError("чужой секрет приняли")


async def test_подтверждение_создаёт_НЕадминистратора():
    mgr, hass, started = await paired()
    user = list(hass.auth.users.values())[0]
    assert user.group_ids == ["system-users"]
    assert user.is_admin is False
    assert mgr.devices[started["device_id"]]["user_id"] == user.id


async def test_подтверждение_неизвестного_кода():
    mgr, _ = manager()
    for code, expect in (("000000", "code_expired"), ("12", "invalid_code"), ("", "invalid_code")):
        try:
            await mgr.approve(code, "admin-1")
        except PairError as err:
            assert err.code == expect, (code, err.code)
        else:
            raise AssertionError(f"код {code!r} приняли")


async def test_повторное_подтверждение_не_плодит_пользователей():
    mgr, hass, started = await paired()
    again = await mgr.approve(started["code"], "admin-1")
    assert again["device_id"] == started["device_id"]
    assert len(hass.auth.users) == 1


async def test_сорванная_запись_не_оставляет_пользователя_сиротой():
    store = FakeStore()
    mgr = PairingManager(FakeHass(), store)
    started = await mgr.start({"secret": SECRET_A}, ip="1.1.1.1")
    store.fail_next = True
    try:
        await mgr.approve(started["code"], "admin-1")
    except OSError:
        pass
    else:
        raise AssertionError("ошибка записи должна была выйти наружу")
    assert mgr.hass.auth.users == {}, "пользователь HA остался без записи о нём"
    assert mgr.devices == {}


async def test_renew_без_подтверждения_ничего_не_выдаёт():
    """Анонимной выдачи токена нет ни на одном пути."""
    mgr, _ = manager()
    started = await mgr.start({"secret": SECRET_A}, ip="1.1.1.1")
    try:
        await mgr.renew(
            {
                "device_id": started["device_id"],
                "secret": SECRET_A,
                "next_secret": SECRET_B,
                "request_id": REQ_1,
            }
        )
    except PairError as err:
        assert (err.status, err.code) == (403, "identity_unknown")
    else:
        raise AssertionError("токен выдали неподтверждённому устройству")


async def test_renew_выдаёт_токен_и_ротирует_секрет():
    mgr, hass, started = await paired()
    res = await mgr.renew(
        {"device_id": started["device_id"], "secret": SECRET_A, "next_secret": SECRET_B, "request_id": REQ_1},
        ip="10.0.0.5",
    )
    assert res["access_token"] in [a for a, _ in hass.auth.issued]
    refresh = hass.auth.tokens[mgr.devices[started["device_id"]]["token_id"]]
    assert refresh.access_token_expiration == timedelta(days=pairing.TOKEN_DAYS)
    # Старый секрет больше не текущий.
    record = mgr.devices[started["device_id"]]
    assert record["hash"] == hashlib.sha256(SECRET_B.encode()).hexdigest()
    assert record["prev_hash"] == hashlib.sha256(SECRET_A.encode()).hexdigest()
    assert record["last_ip"] == "10.0.0.5"


async def test_renew_требует_ротацию():
    mgr, _hass, started = await paired()
    try:
        await mgr.renew(
            {"device_id": started["device_id"], "secret": SECRET_A, "next_secret": SECRET_A, "request_id": REQ_1}
        )
    except PairError as err:
        assert (err.status, err.code) == (400, "rotation_required")
    else:
        raise AssertionError("ротацию не потребовали")


async def test_потерянный_ответ_повторяется_тем_же_запросом():
    mgr, hass, started = await paired()
    args = {
        "device_id": started["device_id"],
        "secret": SECRET_A,
        "next_secret": SECRET_B,
        "request_id": REQ_1,
    }
    first = await mgr.renew(dict(args))
    # Устройство не получило ответ и повторяет ТОТ ЖЕ запрос.
    again = await mgr.renew(dict(args))
    assert again["access_token"] and again["access_token"] != first["access_token"]
    assert len(hass.auth.tokens) == 1, "повтор не должен плодить refresh-токены"
    # А вот тот же старый секрет с ДРУГИМ запросом — уже не повтор.
    try:
        await mgr.renew({**args, "request_id": REQ_2})
    except PairError as err:
        assert (err.status, err.code) == (403, "identity_unknown")
    else:
        raise AssertionError("приняли чужую попытку под видом повтора")


async def test_слишком_частое_продление_отклоняется():
    mgr, _, started = await paired()
    await mgr.renew(
        {"device_id": started["device_id"], "secret": SECRET_A, "next_secret": SECRET_B, "request_id": REQ_1}
    )
    try:
        await mgr.renew(
            {"device_id": started["device_id"], "secret": SECRET_B, "next_secret": SECRET_C, "request_id": REQ_2}
        )
    except PairError as err:
        assert (err.status, err.code) == (429, "renew_too_soon")
    else:
        raise AssertionError("поток обновлений не ограничен")


async def test_удалённый_в_HA_токен_восстанавливается_сразу():
    """Администратор удалил рабочий токен вручную — киоск обязан получить новый
    НЕ дожидаясь окна ограничения, иначе на стене будет пусто."""
    mgr, hass, started = await paired()
    await mgr.renew(
        {"device_id": started["device_id"], "secret": SECRET_A, "next_secret": SECRET_B, "request_id": REQ_1}
    )
    token_id = mgr.devices[started["device_id"]]["token_id"]
    hass.auth.async_remove_refresh_token(hass.auth.tokens[token_id])
    res = await mgr.renew(
        {"device_id": started["device_id"], "secret": SECRET_B, "next_secret": SECRET_C, "request_id": REQ_2}
    )
    assert res["access_token"]


async def test_запись_не_указывает_на_токен_чужого_пользователя():
    mgr, hass, started = await paired()
    stranger = await hass.auth.async_create_system_user("Чужой", ["system-users"])
    alien = await hass.auth.async_create_refresh_token(stranger)
    mgr.devices[started["device_id"]]["token_id"] = alien.id
    try:
        await mgr.renew(
            {"device_id": started["device_id"], "secret": SECRET_A, "next_secret": SECRET_B, "request_id": REQ_1}
        )
    except PairError as err:
        assert (err.status, err.code) == (409, "identity_conflict")
    else:
        raise AssertionError("привязку к чужому токену не заметили")


async def test_отзыв_убирает_доступ_целиком():
    mgr, hass, started = await paired()
    await mgr.renew(
        {"device_id": started["device_id"], "secret": SECRET_A, "next_secret": SECRET_B, "request_id": REQ_1}
    )
    await mgr.revoke(started["device_id"], "admin-1")
    record = mgr.devices[started["device_id"]]
    assert record["revoked"] is True
    assert "hash" not in record and "prev_hash" not in record
    assert hass.auth.users == {}, "выделенный пользователь обязан исчезнуть"
    assert hass.auth.tokens == {}, "его токены тоже"
    try:
        await mgr.renew(
            {"device_id": started["device_id"], "secret": SECRET_B, "next_secret": SECRET_C, "request_id": REQ_2}
        )
    except PairError as err:
        assert (err.status, err.code) == (403, "identity_unknown")
    else:
        raise AssertionError("отозванный киоск получил токен")


async def test_прерванный_отзыв_доводится_до_конца_при_запуске():
    """Надгробие пишется ДО удаления пользователя. Если HA упал между этими
    шагами, при следующем запуске доступ обязан исчезнуть сам."""
    hass = FakeHass()
    user = await hass.auth.async_create_system_user("Киоск", ["system-users"])
    await hass.auth.async_create_refresh_token(user)
    store = FakeStore({"devices": {"d" * 32: {"name": "Киоск", "user_id": user.id, "revoked": True}}})
    mgr = PairingManager(hass, store)
    await mgr.async_load()
    assert hass.auth.users == {}
    assert hass.auth.tokens == {}


async def test_подтверждённая_личность_переживает_перезапуск():
    hass = FakeHass()
    store = FakeStore()
    mgr = PairingManager(hass, store)
    started = await mgr.start({"secret": SECRET_A}, ip="1.1.1.1")
    await mgr.approve(started["code"], "admin-1")

    fresh = PairingManager(hass, FakeStore(store.data))
    await fresh.async_load()
    # Код давно истёк, а личность — нет.
    assert (await fresh.status({"device_id": started["device_id"], "secret": SECRET_A}))["approved"] is True


async def test_истёкший_код_выбрасывается():
    mgr, _ = manager()
    started = await mgr.start({"secret": SECRET_A}, ip="1.1.1.1")
    for session in mgr.sessions.values():
        session["until"] = time.time() - 1
    try:
        await mgr.approve(started["code"], "admin-1")
    except PairError as err:
        assert err.code == "code_expired"
    else:
        raise AssertionError("истёкший код подтвердили")


async def test_список_для_админа_не_раскрывает_ни_секретов_ни_кодов():
    mgr, _, started = await paired()
    dump = json.dumps(mgr.listing() + mgr.pending_codes(), default=str)
    assert SECRET_A not in dump
    assert hashlib.sha256(SECRET_A.encode()).hexdigest() not in dump
    assert started["code"] not in dump
    assert started["device_id"] in dump


# --- Границы, которые живут в pairing_api.py --------------------------------


def _api_source() -> str:
    return (ROOT / "custom_components" / "bms_floorplan" / "pairing_api.py").read_text(encoding="utf-8")


async def test_команды_админа_защищены_require_admin():
    src = _api_source()
    for handler in ("ws_list", "ws_approve", "ws_revoke"):
        block = src[src.index(f"async def {handler}") - 400 : src.index(f"async def {handler}")]
        assert "@websocket_api.require_admin" in block, f"{handler} без require_admin"


async def test_ручки_устройства_не_требуют_входа_но_ограничены():
    src = _api_source()
    assert "requires_auth = False" in src
    # Ограничение частоты и потолок тела — до всякой логики.
    run = src[src.index("async def _run") : src.index("class PairStartView")]
    assert "pairing.limit(request.remote)" in run
    assert "self._body(request)" in run
    assert "MAX_BODY" in src and "Cache-Control" in src


async def test_страница_киоска_не_кладёт_секрет_в_адрес():
    core = (ROOT / "standalone" / "kiosk").glob("*.js")
    text = "\n".join(p.read_text(encoding="utf-8") for p in core)
    assert "crypto.getRandomValues" in text, "секрет обязан быть криптостойким"
    assert "randHex(32)" in text, "секрет обязан быть 256-битным"
    # Секрет уходит только телом POST, никогда строкой запроса.
    assert "secret=" not in text
    assert "?secret" not in text


# --- Запуск -----------------------------------------------------------------


async def main() -> int:
    tests = [(n, f) for n, f in sorted(globals().items()) if n.startswith("test_") and inspect.iscoroutinefunction(f)]
    failed = []
    for name, fn in tests:
        # Каждой проверке — свои часы ограничителя частоты.
        try:
            await fn()
            print(f"  OK  {name}")
        except AssertionError as err:
            failed.append((name, err))
            print(f"  ХМ  {name}: {err}")
        except Exception as err:  # noqa: BLE001
            failed.append((name, err))
            print(f"  ХМ  {name}: {type(err).__name__}: {err}")
    print(f"\nПроверок: {len(tests)}, красных: {len(failed)}")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
