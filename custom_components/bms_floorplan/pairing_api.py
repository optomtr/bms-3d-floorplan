"""Привязка киоска к Home Assistant: HTTP-ручки устройства и команды админа.

Три ручки НЕ требуют входа — иначе устройство с отвергнутым токеном никогда бы
не смогло восстановиться, а именно это владелец и видел на стене. Вместо входа
их защищает секрет устройства: ``start`` только регистрирует намерение (ничего
не выдаёт), ``status`` и ``renew`` требуют доказать знание секрета, а выдать
токен ``renew`` может только тому, чью личность УЖЕ подтвердил администратор.
Анонимной выдачи токена нет ни на одном пути.

Правила границы: тело не больше 8 КиБ и разбирается как JSON до всякой логики,
ответы не кэшируются, любой отказ — короткий машинный код без подробностей.
"""

from __future__ import annotations

import json
import logging
from http import HTTPStatus

import voluptuous as vol
from aiohttp import web

from homeassistant.components import websocket_api
from homeassistant.components.http import HomeAssistantView
from homeassistant.core import HomeAssistant

from .const import (
    DATA_PAIRING,
    DOMAIN,
    PAIR_RENEW_PATH,
    PAIR_START_PATH,
    PAIR_STATUS_PATH,
    WS_KIOSK_APPROVE,
    WS_KIOSK_LIST,
    WS_KIOSK_REVOKE,
)
from .pairing import PairError, PairingManager
from .plan_api import is_active

_LOGGER = logging.getLogger(__name__)

#: Тело запроса привязки — это несколько коротких полей. Всё, что больше, даже
#: не читаем: иначе любой в сети может занять память процесса HA.
MAX_BODY = 8 * 1024

_NO_STORE = {"Cache-Control": "no-store"}


def manager(hass: HomeAssistant) -> PairingManager | None:
    return hass.data.get(DOMAIN, {}).get(DATA_PAIRING)


def _error(status: int, code: str) -> web.Response:
    return web.Response(
        status=status,
        text=json.dumps({"error": code}),
        content_type="application/json",
        headers=_NO_STORE,
    )


def _ok(payload: dict) -> web.Response:
    return web.Response(
        text=json.dumps(payload),
        content_type="application/json",
        headers=_NO_STORE,
    )


class _PairView(HomeAssistantView):
    """Общее для трёх ручек: размер тела, разбор, ограничение частоты."""

    requires_auth = False

    def __init__(self, hass: HomeAssistant) -> None:
        self._hass = hass

    async def _body(self, request: web.Request) -> dict:
        raw = await request.content.read(MAX_BODY + 1)
        if len(raw) > MAX_BODY:
            raise PairError(413, "body_too_large")
        try:
            data = json.loads(raw.decode("utf-8") or "{}")
        except (UnicodeDecodeError, ValueError):
            raise PairError(400, "invalid_json") from None
        if not isinstance(data, dict):
            raise PairError(400, "invalid_json")
        return data

    async def _run(self, request: web.Request, handler) -> web.Response:
        if not is_active(self._hass):
            return _error(HTTPStatus.NOT_FOUND, "integration_unloaded")
        pairing = manager(self._hass)
        if pairing is None:
            return _error(HTTPStatus.SERVICE_UNAVAILABLE, "pairing_unavailable")
        try:
            pairing.limit(request.remote)
            data = await self._body(request)
            return _ok(await handler(pairing, data))
        except PairError as err:
            return _error(err.status, err.code)
        except Exception:  # noqa: BLE001 — наружу не отдаём подробности
            _LOGGER.exception("Сбой в ручке привязки киоска")
            return _error(HTTPStatus.INTERNAL_SERVER_ERROR, "server_error")


class PairStartView(_PairView):
    """Начать привязку: получить шестизначный код. Токена НЕ выдаёт."""

    url = PAIR_START_PATH
    name = f"{DOMAIN}:pair_start"

    async def post(self, request: web.Request) -> web.Response:
        return await self._run(request, lambda p, d: p.start(d, ip=request.remote))


class PairStatusView(_PairView):
    """Подтвердил ли администратор код. Требует секрет: кода мало."""

    url = PAIR_STATUS_PATH
    name = f"{DOMAIN}:pair_status"

    async def post(self, request: web.Request) -> web.Response:
        return await self._run(request, lambda p, d: p.status(d))


class PairRenewView(_PairView):
    """Выдать токен по секрету подтверждённой личности."""

    url = PAIR_RENEW_PATH
    name = f"{DOMAIN}:pair_renew"

    async def post(self, request: web.Request) -> web.Response:
        return await self._run(request, lambda p, d: p.renew(d, ip=request.remote))


# --- Команды администратора --------------------------------------------------


def async_register_ws(hass: HomeAssistant) -> None:
    """Список киосков, подтверждение кода и отзыв — только администратору."""

    @websocket_api.websocket_command({vol.Required("type"): WS_KIOSK_LIST})
    @websocket_api.require_admin
    @websocket_api.async_response
    async def ws_list(hass_, connection, msg):
        pairing = manager(hass_)
        if pairing is None:
            connection.send_error(msg["id"], "pairing_unavailable", "Привязка недоступна.")
            return
        connection.send_result(
            msg["id"], {"devices": pairing.listing(), "pending": pairing.pending_codes()}
        )

    @websocket_api.websocket_command(
        {vol.Required("type"): WS_KIOSK_APPROVE, vol.Required("code"): str}
    )
    @websocket_api.require_admin
    @websocket_api.async_response
    async def ws_approve(hass_, connection, msg):
        pairing = manager(hass_)
        if pairing is None:
            connection.send_error(msg["id"], "pairing_unavailable", "Привязка недоступна.")
            return
        try:
            result = await pairing.approve(msg["code"], _who(connection))
        except PairError as err:
            connection.send_error(msg["id"], err.code, _MESSAGES.get(err.code, err.code))
            return
        connection.send_result(msg["id"], result)

    @websocket_api.websocket_command(
        {vol.Required("type"): WS_KIOSK_REVOKE, vol.Required("device_id"): str}
    )
    @websocket_api.require_admin
    @websocket_api.async_response
    async def ws_revoke(hass_, connection, msg):
        pairing = manager(hass_)
        if pairing is None:
            connection.send_error(msg["id"], "pairing_unavailable", "Привязка недоступна.")
            return
        connection.send_result(msg["id"], await pairing.revoke(msg["device_id"], _who(connection)))


def _who(connection) -> str:
    user = getattr(connection, "user", None)
    return getattr(user, "id", "") or "unknown"


_MESSAGES = {
    "code_expired": "Код не найден или истёк. Попросите планшет показать новый.",
    "invalid_code": "Код состоит из шести цифр.",
    "device_limit": "Слишком много привязанных киосков.",
}
