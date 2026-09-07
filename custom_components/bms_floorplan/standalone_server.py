"""Chrome-free kiosk page and home-screen launcher, on Home Assistant's own port.

A wall tablet opens ``http://<ha-host>:8123/bms-floorplan-kiosk`` and gets just
the 3D floor plan — no HA sidebar or header. There is no separate port and no
token to manage: the page authenticates over the HA WebSocket with the browser's
existing HA login, so it is safe to leave enabled even when HA is reachable
externally. A device that is not logged into HA simply gets a view-only page —
nothing is embedded in it that could leak.

Both pages are served WITHOUT authentication (a tablet has to be able to reach
them before it logs in), which is exactly why nothing they emit may contain
attacker-controlled markup: see ``_safe_target`` and the launcher below.
"""

from __future__ import annotations

import json
import logging
import os
from html import escape
from http import HTTPStatus
from urllib.parse import urlencode

from aiohttp import web

from homeassistant.components.http import HomeAssistantView

from .const import (
    APP_MANIFEST_PATH,
    APP_PATH,
    DATA_ALLOW_KIOSK_EXIT,
    DATA_MODULE_URL,
    DOMAIN,
    KIOSK_MANIFEST_PATH,
    KIOSK_PATH,
    PANEL_TITLE,
    URL_BASE,
    module_url,
)
from .plan_api import is_active

_LOGGER = logging.getLogger(__name__)

_DIR = os.path.dirname(__file__)
STANDALONE_HTML = os.path.join(_DIR, "standalone", "index.html")

# Replaced in the served HTML with a <script> that sets window.__HA3D__.
_INJECT_MARKER = "<!--HA3D_INJECT-->"

# (text, mtime) cache so a file swap (e.g. an integration update) is picked up
# without a full restart, while avoiding a re-read on every request.
_cache: dict = {}

_THEME = "#16243d"


def _read_html() -> str:
    mtime = os.path.getmtime(STANDALONE_HTML)
    if _cache.get("mtime") != mtime:
        with open(STANDALONE_HTML, "r", encoding="utf-8") as fh:
            _cache["html"] = fh.read()
        _cache["mtime"] = mtime
    return _cache["html"]


def _inject(html: str, config: dict) -> str:
    """Inline window.__HA3D__ config so the kiosk page needs zero manual setup."""
    # Escape '<' so a value can never break out of the <script> element.
    payload = json.dumps(config).replace("<", "\\u003c")
    tag = f"<script>window.__HA3D__={payload};</script>"
    return html.replace(_INJECT_MARKER, tag)


# Characters that could end an HTML attribute or open a tag. A target is only
# ever printed inside markup, so none of them has any business being in one.
_TARGET_FORBIDDEN = "<>\"'\\`"


def _safe_target(raw: str | None, default: str = "/") -> str:
    r"""A SAME-ORIGIN absolute path, or the default.

    The launcher prints this into a link and a redirect, and its manifest
    publishes it as start_url, so a crafted link must be able to neither point an
    installed home-screen app at another site nor inject markup into this page.
    Anything that is not a plain "/path" is rejected: a scheme ("https:",
    "javascript:", "data:"), a protocol-relative "//host", a backslash (browsers
    fold "/\host" to "//host"), an embedded newline/control character, and any
    quote or angle bracket — the page is served unauthenticated on Home
    Assistant's own origin, so markup smuggled in here would run with the
    victim's HA session.
    """
    if not raw or not raw.startswith("/") or raw.startswith("//"):
        return default
    if any(ch in raw for ch in _TARGET_FORBIDDEN):
        return default
    if any(ord(ch) < 0x20 or ord(ch) == 0x7F for ch in raw):
        return default
    return raw


def _safe_name(raw: str | None, default: str = PANEL_TITLE) -> str:
    """A short app name with no control characters and no markup delimiters."""
    if not raw:
        return default
    clean = "".join(
        ch
        for ch in raw
        if ord(ch) >= 0x20 and ord(ch) != 0x7F and ch not in _TARGET_FORBIDDEN
    ).strip()
    return clean[:40] or default


def _app_icons() -> list[dict]:
    return [
        {"src": f"{URL_BASE}/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any"},
        {"src": f"{URL_BASE}/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any"},
        {"src": f"{URL_BASE}/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"},
    ]


def _gone() -> web.Response:
    """aiohttp cannot drop a route, so an unloaded integration answers 404."""
    return web.Response(status=HTTPStatus.NOT_FOUND, text="Not Found")


class _IntegrationView(HomeAssistantView):
    """Base: holds hass, and answers 404 while the config entry is unloaded.

    hass is held rather than read from request.app — the key that app uses
    changed between HA versions, this reference does not. aiohttp cannot drop a
    route once registered, so "unregistered" means "stops answering".
    """

    def __init__(self, hass) -> None:
        self._hass = hass

    @property
    def _live(self) -> bool:
        return is_active(self._hass)


class AppLauncherManifestView(_IntegrationView):
    """Manifest for the home-screen launcher. Holds no secret, like the kiosk's."""

    url = APP_MANIFEST_PATH
    name = f"{DOMAIN}:app_manifest"
    requires_auth = False

    async def get(self, request: web.Request) -> web.Response:
        if not self._live:
            return _gone()
        target = _safe_target(request.query.get("to"))
        app_name = _safe_name(request.query.get("name"))
        start = APP_PATH + "?" + urlencode({"to": target, "name": app_name})
        manifest = {
            "id": start,
            "name": app_name,
            "short_name": app_name,
            "start_url": start,
            # Wider than this route on purpose: the launcher forwards into the HA
            # dashboard, and anything outside scope opens in a browser tab instead
            # of staying in the installed app.
            "scope": "/",
            "display": "standalone",
            "orientation": "any",
            "background_color": _THEME,
            "theme_color": _THEME,
            "icons": _app_icons(),
        }
        return web.Response(
            text=json.dumps(manifest, ensure_ascii=False),
            content_type="application/manifest+json",
        )


class AppLauncherView(_IntegrationView):
    """A tiny page whose only job is to own the home-screen icon.

    Open it in the browser, use "Install"/"Add to home screen", and the shortcut
    takes THIS page's manifest icon; launching it forwards to ?to=.

    The forward is a <meta http-equiv="refresh"> plus a plain link — deliberately
    NOT an inline <script> carrying the target. This page is unauthenticated and
    lives on Home Assistant's own origin, so a script built from a query
    parameter is a cross-site-scripting hole aimed straight at the visitor's HA
    session; a redirect and an href cannot execute anything. An immediate meta
    refresh also replaces the history entry, so the launcher does not sit in the
    back stack.
    """

    url = APP_PATH
    name = f"{DOMAIN}:app"
    requires_auth = False

    async def get(self, request: web.Request) -> web.Response:
        if not self._live:
            return _gone()
        target = _safe_target(request.query.get("to"))
        app_name = _safe_name(request.query.get("name"))
        manifest = APP_MANIFEST_PATH + "?" + urlencode({"to": target, "name": app_name})
        target_attr = escape(target, quote=True)
        html = (
            "<!doctype html><html lang=\"ru\"><head><meta charset=\"utf-8\">"
            "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">"
            f"<meta http-equiv=\"refresh\" content=\"0; url={target_attr}\">"
            f"<title>{escape(app_name)}</title>"
            f"<link rel=\"manifest\" href=\"{escape(manifest, quote=True)}\">"
            f"<link rel=\"apple-touch-icon\" href=\"{URL_BASE}/icon-180.png\">"
            f"<link rel=\"icon\" type=\"image/png\" href=\"{URL_BASE}/favicon-64.png\">"
            f"<meta name=\"theme-color\" content=\"{_THEME}\">"
            "<meta name=\"mobile-web-app-capable\" content=\"yes\">"
            "<meta name=\"apple-mobile-web-app-capable\" content=\"yes\">"
            f"<meta name=\"apple-mobile-web-app-title\" content=\"{escape(app_name, quote=True)}\">"
            "<style>html,body{height:100%;margin:0;background:#16243d;color:#e8eef7;"
            "font:16px/1.5 system-ui,-apple-system,sans-serif;display:grid;place-items:center}"
            "a{color:#9fc4e6}</style></head><body>"
            f"<div>Открываю… <a href=\"{target_attr}\">{escape(target)}</a></div>"
            "</body></html>"
        )
        return web.Response(text=html, content_type="text/html",
                            headers={"Cache-Control": "no-cache"})


class KioskManifestView(_IntegrationView):
    """Serve the kiosk's web-app manifest.

    Unauthenticated like the kiosk page itself, and for the same reason: it holds
    no secret, only a name, a colour and icon paths.
    """

    url = KIOSK_MANIFEST_PATH
    name = f"{DOMAIN}:kiosk_manifest"
    requires_auth = False

    async def get(self, request: web.Request) -> web.Response:
        if not self._live:
            return _gone()
        manifest = {
            "id": KIOSK_PATH,
            "name": PANEL_TITLE,
            "short_name": "Планировка",
            "start_url": KIOSK_PATH,
            # Deliberately wider than the manifest's own directory: when the exit
            # gesture is enabled it navigates to an HA dashboard, and anything
            # outside scope would be kicked out to a browser tab.
            "scope": "/",
            "display": "standalone",
            "orientation": "any",
            "background_color": _THEME,
            "theme_color": _THEME,
            "icons": _app_icons(),
        }
        return web.Response(
            text=json.dumps(manifest, ensure_ascii=False),
            content_type="application/manifest+json",
        )


class KioskView(_IntegrationView):
    """Serve the chrome-free, 3D-only page at KIOSK_PATH on HA's own port.

    Unauthenticated so a wall tablet can open it directly, but it embeds NO
    secret: the page authenticates over the WebSocket with the browser's existing
    HA login. A visitor who isn't logged into HA just gets a view-only page.
    """

    url = KIOSK_PATH
    name = f"{DOMAIN}:kiosk"
    requires_auth = False

    async def get(self, request: web.Request) -> web.Response:
        if not self._live:
            return _gone()
        try:
            template = await self._hass.async_add_executor_job(_read_html)
        except OSError:
            # e.g. the file is mid-swap during an integration update.
            return web.Response(text="BMS Планировка запускается…", status=503)

        data = self._hass.data.get(DOMAIN, {})
        # HA serves the card bundle off its own root path, and the page reuses the
        # logged-in session for live data — so no URL/token is embedded.
        config = {
            "cardUrl": data.get(DATA_MODULE_URL) or module_url(None),
            "useSession": True,
            "live": True,
            # Off unless an admin enabled it in the integration's options: the
            # gesture drops whoever performs it into the FULL Home Assistant UI
            # under the tablet's account.
            "allowExit": bool(data.get(DATA_ALLOW_KIOSK_EXIT)),
        }
        return web.Response(
            text=_inject(template, config),
            content_type="text/html",
            headers={"Cache-Control": "no-cache"},
        )
