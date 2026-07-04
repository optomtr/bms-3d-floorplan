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
