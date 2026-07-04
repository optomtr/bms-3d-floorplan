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

from aiohttp import web

from homeassistant.components.http import HomeAssistantView

from .const import KIOSK_PATH, MODULE_URL

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
