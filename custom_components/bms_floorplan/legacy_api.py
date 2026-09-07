"""Read-only bridge to the PREVIOUS version's storage.

Customers keep the old integration installed and working; our job is to let an
administrator copy a plan out of it once, with a button. So this module opens the
old Store by name and reads it — nothing here ever writes, and nothing in this
integration ever touches an old key. The old integration does not even have to be
installed or running: ``.storage/ha_3d_floorplan.plan`` is just a file.

Admin-only, like every other command that can move plan data around.
"""

from __future__ import annotations

import logging

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import LEGACY_STORAGE_KEY, LEGACY_STORAGE_VERSION, WS_LEGACY_GET
from .plan_api import ERR_UNAUTHORIZED, is_admin

_LOGGER = logging.getLogger(__name__)


async def async_read_legacy_plan(hass: HomeAssistant) -> dict | None:
    """The old install-wide plan document, or None when there is none.

    READ ONLY. Never construct a save/remove call against this Store.
    """
    store: Store = Store(hass, LEGACY_STORAGE_VERSION, LEGACY_STORAGE_KEY)
    try:
        data = await store.async_load()
    except Exception as err:  # noqa: BLE001 - a missing/odd old file is not fatal
        _LOGGER.warning("Не удалось прочитать план старой версии: %s", err)
        return None
    return data if isinstance(data, dict) else None


def async_register_ws(hass: HomeAssistant) -> None:
    """Register bms_floorplan/legacy/get."""

    @websocket_api.websocket_command({vol.Required("type"): WS_LEGACY_GET})
    @websocket_api.require_admin
    @websocket_api.async_response
    async def ws_legacy_get(hass_, connection, msg):
        # Repeated inside the handler on purpose — see plan_api.ws_set.
        if not is_admin(connection):
            connection.send_error(
                msg["id"],
                ERR_UNAUTHORIZED,
                "Переносить планы старой версии может только администратор.",
            )
            return
        data = await async_read_legacy_plan(hass_)
        connection.send_result(
            msg["id"], {"found": data is not None, "data": data}
        )

    websocket_api.async_register_command(hass, ws_legacy_get)
