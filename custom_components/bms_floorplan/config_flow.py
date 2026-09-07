"""Config flow for BMS Планировка (single instance) plus its options."""

from __future__ import annotations

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.core import callback

from .const import (
    DEFAULT_ALLOW_KIOSK_EXIT,
    DOMAIN,
    OPT_ALLOW_KIOSK_EXIT,
    PANEL_TITLE,
)


class BmsFloorplanConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Add the integration via the UI with a single confirmation step."""

    VERSION = 1

    async def async_step_user(self, user_input=None):
        await self.async_set_unique_id(DOMAIN)
        self._abort_if_unique_id_configured()

        if user_input is not None:
            return self.async_create_entry(title=PANEL_TITLE, data={})

        return self.async_show_form(step_id="user", data_schema=vol.Schema({}))

    @staticmethod
    @callback
    def async_get_options_flow(
        config_entry: config_entries.ConfigEntry,
    ) -> BmsFloorplanOptionsFlow:
        return BmsFloorplanOptionsFlow(config_entry)


class BmsFloorplanOptionsFlow(config_entries.OptionsFlow):
    """One switch: may the kiosk be left for the full Home Assistant UI?

    Off by default. The gesture hands whoever performs it the tablet's own Home
    Assistant account, so turning it on is an explicit decision per install — a
    tablet in a hallway is reachable by anyone walking past it.
    """

    def __init__(self, config_entry: config_entries.ConfigEntry) -> None:
        # Private attribute on purpose: assigning self.config_entry is deprecated
        # in newer cores, where the framework supplies it.
        self._entry = config_entry

    async def async_step_init(self, user_input=None):
        if user_input is not None:
            return self.async_create_entry(title="", data=user_input)

        current = self._entry.options.get(
            OPT_ALLOW_KIOSK_EXIT, DEFAULT_ALLOW_KIOSK_EXIT
        )
        schema = vol.Schema(
            {vol.Required(OPT_ALLOW_KIOSK_EXIT, default=bool(current)): bool}
        )
        return self.async_show_form(step_id="init", data_schema=schema)
