"""One shared plan document for the whole install.

The plan lives in HA's PER-USER frontend data (``frontend/get_user_data``), which
means a device reads whatever the account it authenticated as last saved. A wall
tablet signed in with a long-lived token from a *different* account therefore saw
a different, stale plan — edits made in the browser (new devices, a room's design
photo…) never reached it.

This module keeps a single install-wide copy in HA's own storage. The editor
mirrors each save here and the kiosk reads here first, so every user and every
device converges on the same plan regardless of which account it signs in as.
The per-user store stays the editor's source of truth, so nothing is lost if this
endpoint is unavailable (e.g. an older integration build).
"""

from __future__ import annotations

import logging

from aiohttp import web

from homeassistant.components.http import HomeAssistantView
from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import DOMAIN, PLAN_API_PATH

_LOGGER = logging.getLogger(__name__)

STORAGE_KEY = f"{DOMAIN}.plan"
STORAGE_VERSION = 1


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
                _LOGGER.warning("Could not read the shared plan: %s", err)
                self._data = None
            self._loaded = True
        return self._data

    async def async_save(self, data: dict) -> None:
        self._data = data
        self._loaded = True
        await self._store.async_save(data)


class PlanView(HomeAssistantView):
    """GET/POST the shared plan.

    Authenticated, but deliberately not admin-only: a wall tablet's long-lived
    token belongs to whatever account created it, and the whole point here is
    that the account no longer decides which plan a device sees.
    """

    url = PLAN_API_PATH
    name = "ha_3d_floorplan:plan"
    requires_auth = True

    def __init__(self, store: PlanStore) -> None:
        self._store = store

    async def get(self, request: web.Request) -> web.Response:
        """Return the shared plan document, or {} when nothing is stored yet."""
        data = await self._store.async_load()
        return self.json(data or {})

    async def post(self, request: web.Request) -> web.Response:
        """Replace the shared plan document."""
        try:
            body = await request.json()
        except ValueError:
            return self.json_message("invalid JSON", 400)
        if not isinstance(body, dict):
            return self.json_message("expected a JSON object", 400)
        try:
            await self._store.async_save(body)
        except Exception as err:  # noqa: BLE001 - report, don't 500 the editor
            _LOGGER.error("Could not save the shared plan: %s", err)
            return self.json_message("could not save", 500)
        return self.json({"ok": True})
