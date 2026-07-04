"""3D Floor Plan integration.

Serves the bundled frontend JS, loads it on every HA page (so the card and the
in-app editor work everywhere), and registers a native sidebar panel that
survives page refreshes and appears on every device — unlike a Lovelace-resource
DOM injection, which only runs when a dashboard loads the resource.

This is a custom integration, NOT an add-on: it runs inside HA core, so it works
on every install type (Core, Container, Supervised, OS) — no Supervisor needed.
"""

from __future__ import annotations

import logging
import os

from homeassistant.components import frontend, panel_custom
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from . import standalone_server
from .const import (
    CONF_LIVE_TOKEN,
    CONF_STANDALONE_PORT,
    DEFAULT_STANDALONE_PORT,
    DOMAIN,
    MODULE_URL,
    PANEL_ICON,
    PANEL_TITLE,
    PANEL_URL,
    URL_BASE,
)

_LOGGER = logging.getLogger(__name__)

FRONTEND_DIR = os.path.join(os.path.dirname(__file__), "frontend")


async def _register_static_path(hass: HomeAssistant) -> None:
    """Serve the bundled frontend directory at URL_BASE (version-tolerant)."""
    try:
        # HA 2024.7+
        from homeassistant.components.http import StaticPathConfig

        await hass.http.async_register_static_paths(
            [StaticPathConfig(URL_BASE, FRONTEND_DIR, False)]
        )
    except ImportError:
        # Older HA cores.
        hass.http.register_static_path(URL_BASE, FRONTEND_DIR, False)


async def _start_kiosk(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Start the optional standalone kiosk server if a port is configured.

    Isolated + best-effort: any failure (e.g. port in use) is logged and never
    breaks the sidebar panel, which is the integration's core function.
    """
    port = int(entry.options.get(CONF_STANDALONE_PORT, DEFAULT_STANDALONE_PORT) or 0)
    token = str(entry.options.get(CONF_LIVE_TOKEN, "") or "")
    store = hass.data.setdefault(DOMAIN, {}).setdefault(entry.entry_id, {})
    if not port:
        return
    try:
        store["kiosk"] = await standalone_server.async_start(hass, port, token)
    except Exception as err:  # noqa: BLE001 - never fail the whole entry
        _LOGGER.error(
            "Could not start the 3D Floor Plan kiosk server on port %s: %s",
            port,
            err,
        )


async def _stop_kiosk(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Stop the kiosk server for this entry, if one is running."""
    store = hass.data.get(DOMAIN, {}).get(entry.entry_id, {})
    runner = store.pop("kiosk", None)
    if runner is not None:
        await standalone_server.async_stop(runner)


async def _reload_on_options(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Restart only the kiosk server when options (port/token) change.

    We deliberately do NOT reload the whole entry — the panel, static path and
    extra-JS URL are already registered and must stay put; only the optional
    kiosk server depends on the options, so just cycle that.
    """
    await _stop_kiosk(hass, entry)
    await _start_kiosk(hass, entry)


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up from a config entry (UI install — no YAML)."""
    await _register_static_path(hass)

    # Load the card module on every frontend page so the card is usable in
    # dashboards and the editor works app-wide.
    try:
        frontend.add_extra_js_url(hass, MODULE_URL)
    except Exception as err:  # noqa: BLE001 - best effort
        _LOGGER.debug("add_extra_js_url failed: %s", err)

    # Register the native sidebar panel (idempotent).
    panels = hass.data.get("frontend_panels", {})
    if PANEL_URL not in panels:
        try:
            await panel_custom.async_register_panel(
                hass,
                frontend_url_path=PANEL_URL,
                webcomponent_name="ha-3d-floorplan-card",
                module_url=MODULE_URL,
                sidebar_title=PANEL_TITLE,
                sidebar_icon=PANEL_ICON,
                require_admin=False,
                config={},
                embed_iframe=False,
            )
        except ValueError:
            # Already registered (e.g. reload) — fine.
            pass

    # Chrome-free, 3D-only kiosk page at a path on HA's own port (no separate
    # port; reuses the browser's HA login). Register once per HA process — a
    # duplicate route on reload would raise.
    store = hass.data.setdefault(DOMAIN, {})
    if not store.get("kiosk_view"):
        try:
            hass.http.register_view(standalone_server.Kiosk3DView(hass))
            store["kiosk_view"] = True
        except Exception as err:  # noqa: BLE001 - best effort
            _LOGGER.debug("kiosk view registration failed: %s", err)

    # Optional standalone kiosk server (off unless a port is set in options).
    await _start_kiosk(hass, entry)

    # Reload the entry when the user changes the port/token in options.
    entry.async_on_unload(entry.add_update_listener(_reload_on_options))

    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Remove the panel and stop the kiosk server when unloaded."""
    await _stop_kiosk(hass, entry)
    frontend.async_remove_panel(hass, PANEL_URL)
    hass.data.get(DOMAIN, {}).pop(entry.entry_id, None)
    return True
