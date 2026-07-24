"""Constants for the 3D Floor Plan integration."""

import json
import os

DOMAIN = "ha_3d_floorplan"

# Integration version, read from the manifest so it lives in exactly one place.
try:
    with open(
        os.path.join(os.path.dirname(__file__), "manifest.json"), encoding="utf-8"
    ) as _mf:
        VERSION = json.load(_mf).get("version", "")
except (OSError, ValueError):
    VERSION = ""

# URL where the bundled frontend JS is served from. A ?v=<version> cache-buster is
# appended so browsers and HA's frontend service worker fetch the fresh bundle
# after every update instead of serving a stale cached copy — the static handler
# resolves the file by path and ignores the query string, so serving still works.
URL_BASE = "/ha_3d_floorplan_frontend"
MODULE_FILE = "ha-3d-floorplan-card.js"
_CACHE_BUST = f"?v={VERSION}" if VERSION else ""
MODULE_URL = f"{URL_BASE}/{MODULE_FILE}{_CACHE_BUST}"

# Sidebar panel.
PANEL_URL = "3d-floorplan"
PANEL_TITLE = "3D Floor Plan"
PANEL_ICON = "mdi:floor-plan"

# Path (on HA's own port) that serves a chrome-free, 3D-only kiosk page. It
# reuses the browser's existing HA login (no token embedded), so it's safe to
# leave enabled even when HA is reachable externally.
KIOSK_PATH = "/3d-floorplan-kiosk"

# Shared plan API. The plan is otherwise kept in HA's PER-USER frontend data, so
# a wall tablet signed in with a different account's long-lived token read a
# different (stale) plan and never saw edits made in the browser. The editor
# mirrors every save here, and the kiosk reads here first, so which account a
# device authenticates as no longer matters.
PLAN_API_PATH = "/api/ha3d_floorplan/plan"
