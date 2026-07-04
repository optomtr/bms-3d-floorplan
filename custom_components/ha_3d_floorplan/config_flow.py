"""Config flow for 3D Floor Plan (single-instance, no options)."""

from __future__ import annotations

import voluptuous as vol

from homeassistant import config_entries

from .const import DOMAIN, PANEL_TITLE


class Ha3dFloorplanConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Add the integration via the UI with a single confirmation step."""

    VERSION = 1

    async def async_step_user(self, user_input=None):
        await self.async_set_unique_id(DOMAIN)
        self._abort_if_unique_id_configured()

        if user_input is not None:
            return self.async_create_entry(title=PANEL_TITLE, data={})

        return self.async_show_form(step_id="user", data_schema=vol.Schema({}))
