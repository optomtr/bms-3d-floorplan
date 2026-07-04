"""Optional standalone kiosk server for the 3D Floor Plan card.

Serves a self-contained, Home-Assistant-free 3D page on its OWN TCP port (off by
default). A wall-mounted tablet or kiosk browser just opens
``http://<ha-host>:<port>/`` and gets the live 3D floor plan with full device
control — no copying files, no ``python -m http.server``, and no per-device token
entry. The server only exposes the 3D page and the card bundle; it never proxies
Home Assistant's admin UI, so a kiosk user can't reach HA settings.

How "live" works without manual steps:

* This server injects Home Assistant's base URL and a long-lived token (both set
  once in the integration's *options*) into the page. The base URL is derived
  from the address the tablet actually used to reach this server, so it is
  reachable on the same network (not an internal loopback or a cloud URL).
* The page connects DIRECTLY to HA's WebSocket API with those credentials, then
  pulls the saved plan from the very same per-user frontend store the in-app
  editor writes to (``frontend/get_user_data`` → ``ha3d_floorplans``). So the
  kiosk always shows exactly what you last saved in the app — nothing to export.

Leave the token blank for a view-only reference (no live state, no control).

The token's HA user must be the same account that edited/saved the plan in the
app, because ``frontend/get_user_data`` is per-user.

SECURITY: the injected token is a full-privilege bearer credential served over
plain HTTP to anyone who can reach the port. Keep this port on a trusted LAN and
NEVER forward it to the internet. Revoking the long-lived token in HA is the
kill switch.
"""

from __future__ import annotations

import json
import logging
import os
from urllib.parse import urlsplit, urlunsplit

from aiohttp import web

from homeassistant.components.http import HomeAssistantView
from homeassistant.core import HomeAssistant
from homeassistant.helpers.network import NoURLAvailableError, get_url

from .const import KIOSK_PATH, MODULE_FILE, MODULE_URL

_LOGGER = logging.getLogger(__name__)

_DIR = os.path.dirname(__file__)
FRONTEND_DIR = os.path.join(_DIR, "frontend")
STANDALONE_HTML = os.path.join(_DIR, "standalone", "index.html")
CARD_PATH = os.path.join(FRONTEND_DIR, MODULE_FILE)

# Replaced in the served HTML with a <script> that sets window.__HA3D__.
# Kept as a plain HTML comment so the file is still valid when served statically
# (e.g. python -m http.server) — then the page just falls back to manual setup.
_INJECT_MARKER = "<!--HA3D_INJECT-->"

_LOOPBACK = {"127.0.0.1", "localhost", "::1"}

# (bytes/text, mtime) caches so a file swap (e.g. an integration update) is
# picked up without a full restart, while avoiding a re-read on every request.
_cache: dict = {}


def _read_cached(path: str, key: str, binary: bool):
    mtime = os.path.getmtime(path)
    if _cache.get(key + "_mt") != mtime:
        mode = "rb" if binary else "r"
        kwargs = {} if binary else {"encoding": "utf-8"}
        with open(path, mode, **kwargs) as fh:
            _cache[key] = fh.read()
        _cache[key + "_mt"] = mtime
    return _cache[key]


def _resolve_ha_url(hass: HomeAssistant) -> str:
    """Best-effort HA base URL (used for its scheme/port; host may be replaced)."""
    for prefer_external in (False, True):
        try:
            return get_url(
                hass,
                prefer_external=prefer_external,
                allow_internal=True,
                allow_external=True,
                allow_ip=True,
            )
        except NoURLAvailableError:
            continue
    return ""


def _reachable_ha_url(hass: HomeAssistant, request: web.Request) -> str:
    """The HA URL the kiosk browser can actually reach.

    HA's own configured URL can be a loopback (127.0.0.1) or a cloud URL that a
    LAN tablet cannot use. The tablet DID reach this server at some host, and HA
    listens on that same host — so we keep HA's scheme + port but swap in the
    request's host.
    """
    base = _resolve_ha_url(hass)
    try:
        req_host = request.url.host
    except Exception:  # noqa: BLE001
        req_host = None

    if not req_host or req_host in _LOOPBACK:
        return base  # can't derive a better host than HA's own

    scheme = "http"
    port = getattr(hass.http, "server_port", None)
    if base:
        try:
            split = urlsplit(base)
            scheme = split.scheme or scheme
            if not port:
                port = split.port
        except ValueError:
            pass

    host_fmt = f"[{req_host}]" if ":" in req_host else req_host  # bracket IPv6
    netloc = f"{host_fmt}:{port}" if port else host_fmt
    return urlunsplit((scheme, netloc, "", "", ""))


def _inject(html: str, config: dict) -> str:
    """Inline window.__HA3D__ config so the kiosk page needs zero manual setup."""
    # Escape '<' so a token can never break out of the <script> element.
    payload = json.dumps(config).replace("<", "\\u003c")
    tag = f"<script>window.__HA3D__={payload};</script>"
    return html.replace(_INJECT_MARKER, tag)


async def async_start(hass: HomeAssistant, port: int, token: str) -> web.AppRunner:
    """Start the kiosk web server on ``port``; return its runner for shutdown."""

    async def handle_index(request: web.Request) -> web.Response:
        # Recompute per request: the reachable HA URL depends on the request's
        # host, and the template can change under us (integration update).
        try:
            template = await hass.async_add_executor_job(
                _read_cached, STANDALONE_HTML, "html", False
            )
        except OSError:
            return web.Response(text="3D Floor Plan is starting…", status=503)
        ha_url = _reachable_ha_url(hass, request)
        config = {"haUrl": ha_url, "token": token or "", "live": bool(token)}
        return web.Response(
            text=_inject(template, config),
            content_type="text/html",
            headers={"Cache-Control": "no-cache"},
        )

    async def handle_card(_request: web.Request) -> web.Response:
        # Serve the bundle from memory with an explicit JS content type: browsers
        # refuse an ES-module import() unless the MIME is a JavaScript type, and
        # FileResponse derives it from the OS registry (which can be text/plain).
        try:
            card_bytes = await hass.async_add_executor_job(
                _read_cached, CARD_PATH, "card", True
            )
        except OSError:
            return web.Response(status=503)
        return web.Response(
            body=card_bytes,
            content_type="text/javascript",
            headers={"Cache-Control": "no-cache"},
        )

    app = web.Application()
    app.router.add_get("/", handle_index)
    app.router.add_get("/index.html", handle_index)
    app.router.add_get(f"/{MODULE_FILE}", handle_card)

    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, host="0.0.0.0", port=port)
    try:
        await site.start()
    except Exception:
        # e.g. port already in use — don't leak the set-up runner.
        await runner.cleanup()
        raise
    _LOGGER.info("3D Floor Plan kiosk server listening on port %s", port)
    return runner


async def async_stop(runner: web.AppRunner) -> None:
    """Stop a server previously started with :func:`async_start`."""
    try:
        await runner.cleanup()
    except Exception as err:  # noqa: BLE001 - best effort on teardown
        _LOGGER.debug("kiosk server cleanup failed: %s", err)


class Kiosk3DView(HomeAssistantView):
    """Serve a chrome-free, 3D-only page at KIOSK_PATH on Home Assistant's own
    port — no separate port, no HA sidebar/header.

    Unauthenticated so a wall tablet can open it directly, but it embeds NO
    secret: the page authenticates over the WebSocket with the browser's existing
    HA login (the token the HA frontend already stored for this origin). A visitor
    who isn't logged into HA simply gets a view-only page — nothing leaks.
    """

    url = KIOSK_PATH
    name = "ha_3d_floorplan:kiosk"
    requires_auth = False

    def __init__(self, hass: HomeAssistant) -> None:
        self._hass = hass

    async def get(self, request: web.Request) -> web.Response:
        try:
            template = await self._hass.async_add_executor_job(
                _read_cached, STANDALONE_HTML, "html", False
            )
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
