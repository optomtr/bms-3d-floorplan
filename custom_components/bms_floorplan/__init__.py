"""BMS Планировка — интеграция 3D-планировки для Home Assistant.

Serves the bundled frontend JS, loads it on every HA page (so the card and the
in-app editor work everywhere), registers a native sidebar panel that survives
page refreshes, and serves a chrome-free 3D-only kiosk page at
/bms-floorplan-kiosk on HA's own port.

This is a custom integration, NOT an add-on: it runs inside HA core, so it works
on every install type (Core, Container, Supervised, OS) — no Supervisor needed.

It installs ALONGSIDE the previous version: different domain, different panel,
different storage key. The old integration keeps working untouched; the only
contact between them is a read-only import (see legacy_api.py).
"""

from __future__ import annotations

import logging
import os

from homeassistant.components import frontend, panel_custom
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store
from homeassistant.loader import async_get_integration

from . import legacy_api, plan_api, standalone_server
from .const import (
    CARD_TAG,
    DATA_ACTIVE,
    DATA_ALLOW_KIOSK_EXIT,
    DATA_MODULE_URL,
    DATA_PIN_STORE,
    DATA_PLAN_STORE,
    DATA_STATIC_PATH,
    DATA_VIEWS,
    DEFAULT_ALLOW_KIOSK_EXIT,
    DOMAIN,
    OPT_ALLOW_KIOSK_EXIT,
    PANEL_ICON,
    PANEL_TITLE,
    PANEL_URL,
    PIN_STORAGE_KEY,
    PIN_STORAGE_VERSION,
    STORAGE_KEY,
    STORAGE_VERSION,
    URL_BASE,
    WS_LEGACY_GET,
    WS_PIN_GET,
    WS_PIN_SET,
    WS_PLAN_GET,
    WS_PLAN_SET,
    module_url,
)

_LOGGER = logging.getLogger(__name__)

FRONTEND_DIR = os.path.join(os.path.dirname(__file__), "frontend")

# Where websocket_api keeps its command handlers, so ours can be taken back out
# on unload. Defensive: the key is an implementation detail of HA core.
_WS_HANDLERS_KEY = "websocket_api"


async def _async_module_url(hass: HomeAssistant) -> str:
    """Bundle URL with a ?v= cache-buster taken from the manifest.

    The version comes from HA's own integration loader — reading manifest.json
    with a blocking open() at import time would stall the event loop.
    """
    try:
        integration = await async_get_integration(hass, DOMAIN)
        version = str(integration.version) if integration.version else None
    except Exception as err:  # noqa: BLE001 - a missing version is cosmetic
        _LOGGER.debug("Не удалось определить версию интеграции: %s", err)
        version = None
    return module_url(version)


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


def _remove_extra_js_url(hass: HomeAssistant, url: str | None) -> None:
    """Take the card bundle back out of HA's per-page module list."""
    if not url:
        return
    try:
        key = getattr(frontend, "DATA_EXTRA_MODULE_URL", "frontend_extra_module_url")
        manager = hass.data.get(key)
        if manager is not None:
            manager.remove(url)
    except Exception as err:  # noqa: BLE001 - best effort, never block unload
        _LOGGER.debug("Не удалось убрать extra_js_url: %s", err)


def _unregister_ws(hass: HomeAssistant) -> None:
    """Drop our WebSocket commands so they stop answering once unloaded."""
    try:
        handlers = hass.data.get(_WS_HANDLERS_KEY)
        if isinstance(handlers, dict):
            for command in (WS_PLAN_GET, WS_PLAN_SET, WS_LEGACY_GET, WS_PIN_GET, WS_PIN_SET):
                handlers.pop(command, None)
    except Exception as err:  # noqa: BLE001 - best effort
        _LOGGER.debug("Не удалось снять WS-команды: %s", err)


async def _async_options_updated(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Apply an options change without a reload (the kiosk reads this per request)."""
    hass.data.setdefault(DOMAIN, {})[DATA_ALLOW_KIOSK_EXIT] = bool(
        entry.options.get(OPT_ALLOW_KIOSK_EXIT, DEFAULT_ALLOW_KIOSK_EXIT)
    )


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up from a config entry (UI install — no YAML)."""
    data = hass.data.setdefault(DOMAIN, {})
    data[DATA_ACTIVE] = True
    data[DATA_MODULE_URL] = await _async_module_url(hass)
    data[DATA_ALLOW_KIOSK_EXIT] = bool(
        entry.options.get(OPT_ALLOW_KIOSK_EXIT, DEFAULT_ALLOW_KIOSK_EXIT)
    )

    # aiohttp cannot un-register a static path, so registering twice (a reload)
    # would stack duplicate handlers. Once per HA process is enough.
    if not data.get(DATA_STATIC_PATH):
        await _register_static_path(hass)
        data[DATA_STATIC_PATH] = True

    # Load the card module on every frontend page so the card is usable in
    # dashboards and the editor works app-wide.
    try:
        frontend.add_extra_js_url(hass, data[DATA_MODULE_URL])
    except Exception as err:  # noqa: BLE001 - best effort
        _LOGGER.debug("add_extra_js_url не сработал: %s", err)

    # Native sidebar panel (idempotent).
    panels = hass.data.get("frontend_panels", {})
    if PANEL_URL not in panels:
        try:
            await panel_custom.async_register_panel(
                hass,
                frontend_url_path=PANEL_URL,
                webcomponent_name=CARD_TAG,
                module_url=data[DATA_MODULE_URL],
                sidebar_title=PANEL_TITLE,
                sidebar_icon=PANEL_ICON,
                require_admin=False,
                config={},
                embed_iframe=False,
            )
        except ValueError:
            # Already registered (e.g. reload) — fine.
            pass

    # One shared plan for the whole install, so a tablet using a different
    # account's token stops reading that account's (stale) per-user copy.
    store: plan_api.PlanStore | None = data.get(DATA_PLAN_STORE)
    if store is None:
        store = plan_api.PlanStore(hass)
        data[DATA_PLAN_STORE] = store

    # WebSocket first: it is what a kiosk page on another origin can actually
    # reach. Re-registered on every setup because unload takes them back out.
    try:
        plan_api.async_register_ws(hass, store)
        legacy_api.async_register_ws(hass)
    except Exception:
        # Loud: without this the kiosk silently falls back to per-user data and a
        # tablet keeps showing another account's stale plan.
        _LOGGER.exception("Не удалось зарегистрировать WS-команды плана")

    # Views live for the lifetime of the HA process (aiohttp routes cannot be
    # removed); they answer 404 while the entry is unloaded — see plan_api.is_active.
    if not data.get(DATA_VIEWS):
        try:
            hass.http.register_view(standalone_server.KioskView(hass))
            hass.http.register_view(standalone_server.KioskManifestView(hass))
            hass.http.register_view(standalone_server.AppLauncherView(hass))
            hass.http.register_view(standalone_server.AppLauncherManifestView(hass))
            hass.http.register_view(plan_api.PlanView(hass))
            data[DATA_VIEWS] = True
        except Exception as err:  # noqa: BLE001 - best effort
            _LOGGER.debug("Не удалось зарегистрировать views: %s", err)

    entry.async_on_unload(entry.add_update_listener(_async_options_updated))
    _LOGGER.info("BMS Планировка готова (ws: %s)", WS_PLAN_GET)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Take back everything the setup registered.

    Panel, per-page module and WebSocket commands go away immediately. The static
    path and the HTTP views cannot be un-registered from aiohttp at runtime, so
    they are switched off instead: DATA_ACTIVE gates every view, which then
    answers 404 until the entry is set up again.
    """
    data = hass.data.setdefault(DOMAIN, {})
    data[DATA_ACTIVE] = False

    frontend.async_remove_panel(hass, PANEL_URL)
    _remove_extra_js_url(hass, data.get(DATA_MODULE_URL))
    _unregister_ws(hass)
    return True


async def async_remove_entry(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Delete OUR stored plan when the integration is removed.

    Only ours: the previous version's storage is never touched, so a customer who
    still runs it keeps their plans.
    """
    try:
        await Store(hass, STORAGE_VERSION, STORAGE_KEY).async_remove()
    except Exception as err:  # noqa: BLE001 - removal must not fail the delete
        _LOGGER.warning("Не удалось удалить хранилище плана: %s", err)

    # The edit PIN lives in its own document, so it needs its own removal —
    # otherwise its hash outlives the integration it belonged to.
    try:
        await Store(hass, PIN_STORAGE_VERSION, PIN_STORAGE_KEY).async_remove()
    except Exception as err:  # noqa: BLE001 - removal must not fail the delete
        _LOGGER.warning("Не удалось удалить хранилище PIN: %s", err)

    # Drop the in-memory copy so a re-add starts empty, but KEEP the
    # static-path/view guards: those routes still exist in aiohttp and must not
    # be registered a second time.
    data = hass.data.get(DOMAIN)
    if data is not None:
        data.pop(DATA_PLAN_STORE, None)
        data.pop(DATA_PIN_STORE, None)
        data[DATA_ACTIVE] = False
