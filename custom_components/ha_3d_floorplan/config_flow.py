"""Config flow for 3D Floor Plan.

The initial setup is a single confirmation step (no fields). Everything optional
— the standalone kiosk server port and its live-control token — lives in the
*options* flow, so users who only want the sidebar panel are never bothered.
"""

from __future__ import annotations

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.core import callback

from .const import (
    CONF_LIVE_TOKEN,
    CONF_STANDALONE_PORT,
    DEFAULT_STANDALONE_PORT,
    DOMAIN,
    PANEL_TITLE,
)


class Ha3dFloorplanConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
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
    def async_get_options_flow(config_entry):
        return Ha3dFloorplanOptionsFlow(config_entry)


class Ha3dFloorplanOptionsFlow(config_entries.OptionsFlow):
    """Configure the optional standalone kiosk server (port + live token)."""

    def __init__(self, config_entry) -> None:
        # Store under a private name to stay compatible across HA versions
        # (newer cores manage ``self.config_entry`` themselves).
        self._entry = config_entry

    async def async_step_init(self, user_input=None):
        if user_input is not None:
            return self.async_create_entry(title="", data=user_input)

        opts = self._entry.options
        schema = vol.Schema(
            {
                vol.Optional(
                    CONF_STANDALONE_PORT,
                    default=opts.get(CONF_STANDALONE_PORT, DEFAULT_STANDALONE_PORT),
                ): vol.All(vol.Coerce(int), vol.Range(min=0, max=65535)),
                vol.Optional(
                    CONF_LIVE_TOKEN,
                    default=opts.get(CONF_LIVE_TOKEN, ""),
                ): str,
            }
        )
        return self.async_show_form(step_id="init", data_schema=schema)
