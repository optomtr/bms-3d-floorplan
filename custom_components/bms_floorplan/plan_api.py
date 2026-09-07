"""One shared plan document for the whole install.

Home Assistant's per-user frontend data means a device reads whatever the account
it authenticated as last saved — a wall tablet holding another account's
long-lived token saw a different, stale plan. This module keeps a single
install-wide copy in HA's own storage; the editor mirrors every save here and the
kiosk reads here first, so every user and every device converges on one plan.

Access split (this is the security boundary):

* READING is open to any authenticated Home Assistant user — a tablet signs in
  with an ordinary account and must be able to draw the plan.
* WRITING is admin-only. The card calls Home Assistant services based on the
  entity bindings stored in the plan, so whoever can rewrite the plan can make
  every tablet in the building call services of their choosing. That is an
  administrator's decision, not a guest's.
"""

from __future__ import annotations

import logging
from http import HTTPStatus

import voluptuous as vol
from aiohttp import web

from homeassistant.components import websocket_api
from homeassistant.components.http import HomeAssistantView
from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import (
    DATA_ACTIVE,
    DATA_PLAN_STORE,
    DOMAIN,
    MAX_PLAN_BYTES,
    PLAN_API_PATH,
    STORAGE_KEY,
    STORAGE_VERSION,
    WS_PLAN_GET,
    WS_PLAN_SET,
)
from .validation import PlanValidationError, validate_plan_document

_LOGGER = logging.getLogger(__name__)

# Where HA's auth middleware puts the authenticated user on the request. The
# constant moved around between cores; the literal is the long-standing value.
try:  # pragma: no cover - import shape depends on the HA version
    from homeassistant.components.http.const import KEY_HASS_USER
except ImportError:  # pragma: no cover
    KEY_HASS_USER = "hass_user"

ERR_UNAUTHORIZED = "unauthorized"
_ADMIN_ONLY = "Изменять план может только администратор."


def is_admin(connection) -> bool:
    """True only for a signed-in administrator."""
    user = getattr(connection, "user", None)
    return bool(user is not None and user.is_admin)


def request_user(request: web.Request):
    """The authenticated user behind an HTTP request, or None."""
    return request.get(KEY_HASS_USER) or request.get("hass_user")


def is_active(hass: HomeAssistant) -> bool:
    """False once the config entry is unloaded.

    aiohttp cannot drop a route once it is registered, so an unloaded
    integration answers 404 instead of continuing to serve.
    """
    return bool(hass.data.get(DOMAIN, {}).get(DATA_ACTIVE))


class PlanStore:
    """Load/save the shared plan document, cached in memory."""

    def __init__(self, hass: HomeAssistant) -> None:
        self._store: Store = Store(hass, STORAGE_VERSION, STORAGE_KEY)
        self._data: dict | None = None
        self._loaded = False

    async def async_load(self) -> dict | None:
        if not self._loaded:
            try:
                self._data = await self._store.async_load()
            except Exception as err:  # noqa: BLE001 - never break the page
                _LOGGER.warning("Не удалось прочитать общий план: %s", err)
                self._data = None
            self._loaded = True
        return self._data

    async def async_save(self, data: dict) -> None:
        """Validate, then persist. Invalid documents never reach .storage."""
        validate_plan_document(data)
        self._data = data
        self._loaded = True
        await self._store.async_save(data)


def async_register_ws(hass: HomeAssistant, store: PlanStore) -> None:
    """Expose the shared plan over the WebSocket API (works cross-origin)."""

    @websocket_api.websocket_command({vol.Required("type"): WS_PLAN_GET})
    @websocket_api.async_response
    async def ws_get(hass_, connection, msg):
        data = await store.async_load()
        connection.send_result(msg["id"], data or {})

    @websocket_api.websocket_command(
        {vol.Required("type"): WS_PLAN_SET, vol.Required("value"): dict}
    )
    @websocket_api.require_admin
    @websocket_api.async_response
    async def ws_set(hass_, connection, msg):
        # Belt and braces: require_admin above already refuses non-admins, and
        # this repeats the check inside the handler so a future decorator-order
        # slip cannot quietly open the write path.
        if not is_admin(connection):
            connection.send_error(msg["id"], ERR_UNAUTHORIZED, _ADMIN_ONLY)
            return
        try:
            await store.async_save(msg["value"])
        except PlanValidationError as err:
            connection.send_error(msg["id"], err.code, err.message)
            return
        except Exception as err:  # noqa: BLE001 - report, don't drop the socket
            _LOGGER.error("Не удалось сохранить общий план: %s", err)
            connection.send_error(msg["id"], "save_failed", str(err))
            return
        connection.send_result(msg["id"], {"ok": True})

    websocket_api.async_register_command(hass, ws_get)
    websocket_api.async_register_command(hass, ws_set)


class PlanView(HomeAssistantView):
    """GET/POST the shared plan for same-origin callers.

    GET: any authenticated user (a tablet reads the plan under its own account).
    POST: admins only — see the module docstring.

    The store is looked up per request rather than held: an aiohttp route
    outlives the config entry, so a view that captured one store instance would
    keep serving that instance's cache after a remove-and-add.
    """

    url = PLAN_API_PATH
    name = f"{DOMAIN}:plan"
    requires_auth = True

    def __init__(self, hass: HomeAssistant) -> None:
        # hass is held rather than read from request.app: the key that app uses
        # changed between HA versions, this reference does not.
        self._hass = hass

    def _gone(self) -> web.Response:
        return self.json_message("integration unloaded", HTTPStatus.NOT_FOUND)

    def _store(self) -> PlanStore | None:
        return self._hass.data.get(DOMAIN, {}).get(DATA_PLAN_STORE)

    async def get(self, request: web.Request) -> web.Response:
        """Return the shared plan document, or {} when nothing is stored yet."""
        store = self._store()
        if not is_active(self._hass) or store is None:
            return self._gone()
        data = await store.async_load()
        return self.json(data or {})

    async def post(self, request: web.Request) -> web.Response:
        """Replace the shared plan document (admin only)."""
        store = self._store()
        if not is_active(self._hass) or store is None:
            return self._gone()

        user = request_user(request)
        if user is None or not user.is_admin:
            return self.json_message(_ADMIN_ONLY, HTTPStatus.FORBIDDEN)

        # Cheap gate before the body is read into memory at all.
        if (request.content_length or 0) > MAX_PLAN_BYTES:
            return self.json_message(
                f"План больше {MAX_PLAN_BYTES // 1024} КБ.",
                HTTPStatus.REQUEST_ENTITY_TOO_LARGE,
            )

        try:
            body = await request.json()
        except ValueError:
            return self.json_message("Некорректный JSON.", HTTPStatus.BAD_REQUEST)

        try:
            await store.async_save(body)
        except PlanValidationError as err:
            status = (
                HTTPStatus.REQUEST_ENTITY_TOO_LARGE
                if err.code == "too_large"
                else HTTPStatus.BAD_REQUEST
            )
            return self.json_message(err.message, status)
        except Exception as err:  # noqa: BLE001 - report, don't 500 the editor
            _LOGGER.error("Не удалось сохранить общий план: %s", err)
            return self.json_message(
                "Не удалось сохранить план.", HTTPStatus.INTERNAL_SERVER_ERROR
            )
        return self.json({"ok": True})
