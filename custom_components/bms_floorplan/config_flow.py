"""Config flow for BMS Планировка (single instance) plus its options.

Раздел «Настроить» у интеграции — это и есть панель администратора киосков:
здесь подтверждают шестизначный код планшета и здесь же отзывают доступ.
Диалог настроек интеграции в Home Assistant доступен ТОЛЬКО администратору, так
что отдельной проверки прав тут не нужно — но те же действия продублированы
командами WebSocket с явным ``require_admin`` (см. pairing_api).
"""

from __future__ import annotations

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.core import callback
from homeassistant.helpers import selector

from .const import (
    DATA_PAIRING,
    DEFAULT_ALLOW_KIOSK_EXIT,
    DOMAIN,
    OPT_ALLOW_KIOSK_EXIT,
    PANEL_TITLE,
)
from .pairing import PairError


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
    """Настройки киоска и управление привязанными киосками."""

    def __init__(self, config_entry: config_entries.ConfigEntry) -> None:
        # Private attribute on purpose: assigning self.config_entry is deprecated
        # in newer cores, where the framework supplies it.
        self._entry = config_entry

    def _pairing(self):
        return (self.hass.data.get(DOMAIN) or {}).get(DATA_PAIRING)

    async def async_step_init(self, user_input=None):
        return self.async_show_menu(
            step_id="init", menu_options=["settings", "approve", "devices"]
        )

    # -- Один переключатель: можно ли выйти из киоска -------------------------

    async def async_step_settings(self, user_input=None):
        """Off by default. The gesture hands whoever performs it the tablet's own
        Home Assistant account, so turning it on is an explicit decision per
        install — a tablet in a hallway is reachable by anyone walking past it.
        """
        if user_input is not None:
            return self.async_create_entry(title="", data=user_input)

        current = self._entry.options.get(OPT_ALLOW_KIOSK_EXIT, DEFAULT_ALLOW_KIOSK_EXIT)
        schema = vol.Schema(
            {vol.Required(OPT_ALLOW_KIOSK_EXIT, default=bool(current)): bool}
        )
        return self.async_show_form(step_id="settings", data_schema=schema)

    # -- Подтверждение кода планшета ------------------------------------------

    async def async_step_approve(self, user_input=None):
        pairing = self._pairing()
        if pairing is None:
            return self.async_abort(reason="pairing_unavailable")

        errors: dict[str, str] = {}
        if user_input is not None:
            try:
                await pairing.approve(user_input.get("code", ""), self._admin())
            except PairError as err:
                errors["code"] = err.code
            else:
                return self.async_abort(reason="kiosk_approved")

        waiting = len(pairing.pending_codes())
        return self.async_show_form(
            step_id="approve",
            data_schema=vol.Schema({vol.Required("code"): str}),
            errors=errors,
            description_placeholders={"waiting": str(waiting)},
        )

    # -- Отзыв доступа ---------------------------------------------------------

    async def async_step_devices(self, user_input=None):
        pairing = self._pairing()
        if pairing is None:
            return self.async_abort(reason="pairing_unavailable")

        live = [d for d in pairing.listing() if not d["revoked"]]
        if not live:
            return self.async_abort(reason="no_kiosks")

        if user_input is not None:
            for device_id in user_input.get("revoke", []):
                await pairing.revoke(device_id, self._admin())
            return self.async_abort(reason="kiosk_revoked")

        options = [
            selector.SelectOptionDict(value=d["device_id"], label=self._label(d))
            for d in live
        ]
        schema = vol.Schema(
            {
                vol.Optional("revoke", default=[]): selector.SelectSelector(
                    selector.SelectSelectorConfig(options=options, multiple=True)
                )
            }
        )
        return self.async_show_form(step_id="devices", data_schema=schema)

    @staticmethod
    def _label(device: dict) -> str:
        """Имя киоска плюс хвост идентификатора — два одинаково названных
        планшета должны различаться на экране."""
        return f"{device['name']} ({device['device_id'][-6:]})"

    def _admin(self) -> str:
        context = getattr(self, "context", None) or {}
        return str(context.get("source", "options")) if not context.get("user_id") else str(
            context["user_id"]
        )
