"""Chrome-free, 3D-only kiosk page served at a path on Home Assistant's own port.

A wall tablet opens ``http://<ha-host>:8123/3d-floorplan-kiosk`` and gets just the
3D floor plan — no HA sidebar or header, and nothing else of HA is exposed. There
is no separate port and no token to manage: the page authenticates over the HA
WebSocket with the browser's existing HA login (the token the HA frontend already
stored for this origin), so it is safe to leave enabled even when HA is reachable
externally. A device that isn't logged into HA simply gets a view-only page —
nothing is embedded in it that could leak.
"""

from __future__ import annotations

import json
import logging
import os
from html import escape
from urllib.parse import urlencode

from aiohttp import web

from homeassistant.components.http import HomeAssistantView

from .const import (
    APP_MANIFEST_PATH,
    APP_PATH,
    KIOSK_MANIFEST_PATH,
    KIOSK_PATH,
    URL_BASE,
    MODULE_URL,
)

_LOGGER = logging.getLogger(__name__)

_DIR = os.path.dirname(__file__)
STANDALONE_HTML = os.path.join(_DIR, "standalone", "index.html")

# Replaced in the served HTML with a <script> that sets window.__HA3D__.
_INJECT_MARKER = "<!--HA3D_INJECT-->"

# (text, mtime) cache so a file swap (e.g. an integration update) is picked up
# without a full restart, while avoiding a re-read on every request.
_cache: dict = {}


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


def _safe_target(raw: str | None, default: str = "/") -> str:
    r"""A SAME-ORIGIN absolute path, or the default.

    The launcher hands this straight to location.replace(), and its manifest
    publishes it as start_url, so a crafted link must not be able to point an
    installed home-screen app at another site. Anything that is not a plain
    "/path" is rejected: a scheme ("https:", "javascript:", "data:"), a
    protocol-relative "//host", a backslash (browsers fold "/\host" to
    "//host"), or an embedded newline/control character.
    """
    if not raw or not raw.startswith("/") or raw.startswith("//"):
        return default
    if any(ch in raw for ch in "\\") or any(ord(ch) < 0x20 or ord(ch) == 0x7F for ch in raw):
        return default
    return raw


def _safe_name(raw: str | None, default: str = "3D Floor Plan") -> str:
    """A short, control-character-free app name."""
    if not raw:
        return default
    clean = "".join(ch for ch in raw if ord(ch) >= 0x20 and ord(ch) != 0x7F).strip()
    return clean[:40] or default


def _app_icons() -> list[dict]:
    return [
        {"src": f"{URL_BASE}/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any"},
        {"src": f"{URL_BASE}/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any"},
        {"src": f"{URL_BASE}/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"},
    ]


class AppLauncherManifestView(HomeAssistantView):
    """Manifest for the home-screen launcher. Holds no secret, like the kiosk's."""

    url = APP_MANIFEST_PATH
    name = "ha_3d_floorplan:app_manifest"
    requires_auth = False

    async def get(self, request: web.Request) -> web.Response:
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
            "background_color": "#16243d",
            "theme_color": "#16243d",
            "icons": _app_icons(),
        }
        return web.Response(text=json.dumps(manifest), content_type="application/manifest+json")


class AppLauncherView(HomeAssistantView):
    """A tiny page whose only job is to own the home-screen icon.

    Open it in the browser, use "Install"/"Add to home screen", and the shortcut
    takes THIS page's manifest icon; launching it forwards to ?to=.
    """

    url = APP_PATH
    name = "ha_3d_floorplan:app"
    requires_auth = False

    async def get(self, request: web.Request) -> web.Response:
        target = _safe_target(request.query.get("to"))
        app_name = _safe_name(request.query.get("name"))
        manifest = APP_MANIFEST_PATH + "?" + urlencode({"to": target, "name": app_name})
        html = (
            "<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\">"
            "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">"
            f"<title>{escape(app_name)}</title>"
            f"<link rel=\"manifest\" href=\"{escape(manifest, quote=True)}\">"
            f"<link rel=\"apple-touch-icon\" href=\"{URL_BASE}/icon-180.png\">"
            f"<link rel=\"icon\" type=\"image/png\" href=\"{URL_BASE}/favicon-64.png\">"
            "<meta name=\"theme-color\" content=\"#16243d\">"
            "<meta name=\"mobile-web-app-capable\" content=\"yes\">"
            "<meta name=\"apple-mobile-web-app-capable\" content=\"yes\">"
            f"<meta name=\"apple-mobile-web-app-title\" content=\"{escape(app_name, quote=True)}\">"
            "<style>html,body{height:100%;margin:0;background:#16243d;color:#e8eef7;"
            "font:16px/1.5 system-ui,-apple-system,sans-serif;display:grid;place-items:center}"
            "a{color:#9fc4e6}</style></head><body>"
            f"<div>Открываю… <a href=\"{escape(target, quote=True)}\">{escape(target)}</a></div>"
            # replace(), not assign: the launcher must not sit in the back stack.
            f"<script>location.replace({json.dumps(target)});</script>"
            "</body></html>"
        )
        return web.Response(text=html, content_type="text/html",
                            headers={"Cache-Control": "no-cache"})


class Kiosk3DManifestView(HomeAssistantView):
    """Serve the kiosk's web-app manifest.

    Unauthenticated like the kiosk page itself, and for the same reason: it
    holds no secret, only a name, a colour and icon paths.
    """

    url = KIOSK_MANIFEST_PATH
    name = "ha_3d_floorplan:kiosk_manifest"
    requires_auth = False

    async def get(self, request: web.Request) -> web.Response:
        manifest = {
            "id": KIOSK_PATH,
            "name": "3D Floor Plan",
            "short_name": "Floor Plan",
            "start_url": KIOSK_PATH,
            # Deliberately wider than the manifest's own directory: the corner
            # gesture navigates to an HA dashboard, and anything outside scope
            # would be kicked out to a browser tab.
            "scope": "/",
            "display": "standalone",
            "orientation": "any",
            "background_color": "#16243d",
            "theme_color": "#16243d",
            "icons": [
                {
                    "src": f"{URL_BASE}/icon-192.png",
                    "sizes": "192x192",
                    "type": "image/png",
                    "purpose": "any",
                },
                {
                    "src": f"{URL_BASE}/icon-512.png",
                    "sizes": "512x512",
                    "type": "image/png",
                    "purpose": "any",
                },
                {
                    "src": f"{URL_BASE}/icon-maskable-512.png",
                    "sizes": "512x512",
                    "type": "image/png",
                    "purpose": "maskable",
                },
            ],
        }
        return web.Response(
            text=json.dumps(manifest),
            content_type="application/manifest+json",
        )

class Kiosk3DView(HomeAssistantView):
    """Serve the chrome-free, 3D-only page at KIOSK_PATH on HA's own port.

    Unauthenticated so a wall tablet can open it directly, but it embeds NO
    secret: the page authenticates over the WebSocket with the browser's existing
    HA login. A visitor who isn't logged into HA just gets a view-only page.
    """

    url = KIOSK_PATH
    name = "ha_3d_floorplan:kiosk"
    requires_auth = False

    def __init__(self, hass) -> None:
        self._hass = hass

    async def get(self, request: web.Request) -> web.Response:
        try:
            template = await self._hass.async_add_executor_job(_read_html)
        except OSError:
            # e.g. the file is mid-swap during an integration update.
            return web.Response(text="3D Floor Plan is starting…", status=503)
        # HA serves the card bundle off its own root path, and the page reuses the
        # logged-in session for live data — so no URL/token is embedded.
        config = {"cardUrl": MODULE_URL, "useSession": True, "live": True}
        return web.Response(
            text=_inject(template, config),
            content_type="text/html",
            headers={"Cache-Control": "no-cache"},
        )
