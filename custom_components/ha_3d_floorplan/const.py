"""Constants for the 3D Floor Plan integration."""

DOMAIN = "ha_3d_floorplan"

# URL where the bundled frontend JS is served from.
URL_BASE = "/ha_3d_floorplan_frontend"
MODULE_FILE = "ha-3d-floorplan-card.js"
MODULE_URL = f"{URL_BASE}/{MODULE_FILE}"

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
