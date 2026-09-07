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

One document, many writers — so it is versioned. A writer says which version it
edited (``base_version``); if the stored document has moved on, the write is
REFUSED and the caller is handed the document that won, instead of the second
save silently deleting the first one's projects. A writer that sends no
``base_version`` keeps the old blind-write behaviour — that path exists only for
a card bundle cached in a browser from before this change, and is marked as such
everywhere it appears. The documents themselves and the versioning rules live in
``plan_store``; this module is the API surface over them.

The edit PIN is no longer part of the plan document: it has commands of its own
(read: any user, write: admin) so a plan save can never erase it again.
"""

from __future__ import annotations

import logging
from http import HTTPStatus
from typing import Any

import voluptuous as vol
from aiohttp import web

from homeassistant.components import websocket_api
from homeassistant.components.http import HomeAssistantView
from homeassistant.core import HomeAssistant

from .const import (
    BASE_VERSION_FIELD,
    DATA_ACTIVE,
    DATA_PLAN_STORE,
    DOMAIN,
    MAX_PLAN_BYTES,
    PLAN_API_PATH,
    WS_PIN_GET,
    WS_PIN_SET,
    WS_PLAN_GET,
    WS_PLAN_SET,
)
from .plan_store import (  # re-exported: __init__ builds PlanStore through us
    PlanConflictError,
    PlanStore,
    StoreUnavailableError,
    pin_store,
)
from .validation import PlanValidationError

_LOGGER = logging.getLogger(__name__)

# Where HA's auth middleware puts the authenticated user on the request. The
# constant moved around between cores; the literal is the long-standing value.
try:  # pragma: no cover - import shape depends on the HA version
    from homeassistant.components.http.const import KEY_HASS_USER
except ImportError:  # pragma: no cover
    KEY_HASS_USER = "hass_user"

ERR_UNAUTHORIZED = "unauthorized"
ERR_SAVE_FAILED = "save_failed"
ERR_GONE = "integration_unloaded"

_ADMIN_ONLY = "Изменять план может только администратор."
_PIN_ADMIN_ONLY = "Менять PIN редактора может только администратор."
_GONE_MSG = "Интеграция выключена."


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


def async_register_ws(hass: HomeAssistant, store: PlanStore) -> None:
    """Expose the shared plan over the WebSocket API (works cross-origin)."""

    pins = pin_store(hass)

    @websocket_api.websocket_command({vol.Required("type"): WS_PLAN_GET})
    @websocket_api.async_response
    async def ws_get(hass_, connection, msg):
        try:
            data = await store.async_load()
        except StoreUnavailableError as err:
            # An error, NOT an empty document: the card must not save on top of
            # a read it could not perform.
            connection.send_error(msg["id"], err.code, err.message)
            return
        await pins.async_adopt(data)
        connection.send_result(msg["id"], data or {})

    @websocket_api.websocket_command(
        {
            vol.Required("type"): WS_PLAN_SET,
            vol.Required("value"): dict,
            # Absent = a card bundle from before versioning. See PlanStore.
            vol.Optional(BASE_VERSION_FIELD): vol.Any(int, None),
        }
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
            version = await store.async_save(
                msg["value"], msg.get(BASE_VERSION_FIELD)
            )
        except PlanConflictError as err:
            # A WebSocket *error* carries only a code and a message, and the
            # caller needs the document that won — so a conflict comes back as a
            # result with ok=False. Old clients never send base_version and so
            # never see this shape.
            connection.send_result(
                msg["id"],
                {
                    "ok": False,
                    "error": err.code,
                    "message": err.message,
                    "version": err.version,
                    "current": err.current,
                },
            )
            return
        except PlanValidationError as err:
            connection.send_error(msg["id"], err.code, err.message)
            return
        except StoreUnavailableError as err:
            connection.send_error(msg["id"], err.code, err.message)
            return
        except Exception as err:  # noqa: BLE001 - report, don't drop the socket
            _LOGGER.error("Не удалось сохранить общий план: %s", err)
            connection.send_error(msg["id"], ERR_SAVE_FAILED, str(err))
            return
        connection.send_result(msg["id"], {"ok": True, "version": version})

    @websocket_api.websocket_command({vol.Required("type"): WS_PIN_GET})
    @websocket_api.async_response
    async def ws_pin_get(hass_, connection, msg):
        # Gated here rather than by un-registering on unload: __init__ takes the
        # plan commands back out, and this handler answers for itself.
        if not is_active(hass):
            connection.send_error(msg["id"], ERR_GONE, _GONE_MSG)
            return
        try:
            plan = await store.async_load()
        except StoreUnavailableError:
            plan = None  # carry-over can wait; the PIN store answers on its own
        await pins.async_adopt(plan)
        try:
            pin = await pins.async_get()
        except StoreUnavailableError as err:
            connection.send_error(msg["id"], err.code, err.message)
            return
        connection.send_result(msg["id"], {"pin": pin, "set": pin is not None})

    @websocket_api.websocket_command(
        {vol.Required("type"): WS_PIN_SET, vol.Required("value"): vol.Any(str, None)}
    )
    @websocket_api.require_admin
    @websocket_api.async_response
    async def ws_pin_set(hass_, connection, msg):
        if not is_active(hass):
            connection.send_error(msg["id"], ERR_GONE, _GONE_MSG)
            return
        if not is_admin(connection):
            connection.send_error(msg["id"], ERR_UNAUTHORIZED, _PIN_ADMIN_ONLY)
            return
        try:
            doc = await pins.async_set(msg["value"])
        except PlanValidationError as err:
            connection.send_error(msg["id"], err.code, err.message)
            return
        except StoreUnavailableError as err:
            connection.send_error(msg["id"], err.code, err.message)
            return
        connection.send_result(
            msg["id"], {"ok": True, "set": doc["pin"] is not None}
        )

    websocket_api.async_register_command(hass, ws_get)
    websocket_api.async_register_command(hass, ws_set)
    websocket_api.async_register_command(hass, ws_pin_get)
    websocket_api.async_register_command(hass, ws_pin_set)


def _requested_base_version(request: web.Request, body: Any) -> int | None:
    """``base_version`` from the query string or the body, whichever came.

    Removed from the body when found there, so it is never stored as part of
    the plan. Absent means the old blind-write path (see PlanStore.async_save).
    """
    raw: Any = request.query.get(BASE_VERSION_FIELD)
    if raw is None and isinstance(body, dict) and BASE_VERSION_FIELD in body:
        raw = body.pop(BASE_VERSION_FIELD)
    if raw is None or raw == "":
        return None
    if isinstance(raw, bool):
        raise PlanValidationError("Некорректный base_version.", "invalid_base_version")
    try:
        value = int(raw)
    except (TypeError, ValueError) as err:
        raise PlanValidationError(
            "Некорректный base_version.", "invalid_base_version"
        ) from err
    if value < 0:
        raise PlanValidationError("Некорректный base_version.", "invalid_base_version")
    return value


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
        try:
            data = await store.async_load()
        except StoreUnavailableError as err:
            # 503, never an empty 200: "{}" would read as "there is no plan".
            return self.json_message(err.message, HTTPStatus.SERVICE_UNAVAILABLE)
        await pin_store(self._hass).async_adopt(data)
        return self.json(data or {})

    async def post(self, request: web.Request) -> web.Response:
        """Replace the shared plan document (admin only, version-checked)."""
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
            base_version = _requested_base_version(request, body)
            version = await store.async_save(body, base_version)
        except PlanConflictError as err:
            return self.json(
                {
                    "error": err.code,
                    "message": err.message,
                    "version": err.version,
                    "current": err.current,
                },
                status_code=HTTPStatus.CONFLICT,
            )
        except PlanValidationError as err:
            status = (
                HTTPStatus.REQUEST_ENTITY_TOO_LARGE
                if err.code == "too_large"
                else HTTPStatus.BAD_REQUEST
            )
            return self.json_message(err.message, status)
        except StoreUnavailableError as err:
            return self.json_message(err.message, HTTPStatus.SERVICE_UNAVAILABLE)
        except Exception as err:  # noqa: BLE001 - report, don't 500 the editor
            _LOGGER.error("Не удалось сохранить общий план: %s", err)
            return self.json_message(
                "Не удалось сохранить план.", HTTPStatus.INTERNAL_SERVER_ERROR
            )
        # The new version goes back so the caller can send it as the next
        # base_version instead of re-reading the whole document.
        return self.json({"ok": True, "version": version})
