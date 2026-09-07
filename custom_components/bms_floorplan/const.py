"""Constants for the BMS Планировка integration.

Every public name here (domain, panel path, kiosk path, storage key, WebSocket
command) is part of the contract the frontend bundle builds against. The OLD
integration's names are kept below too, but READ-ONLY: the previous version stays
installed and working on customer systems, so nothing of ours may ever write to
one of its keys.
"""

from __future__ import annotations

DOMAIN = "bms_floorplan"

# --- Frontend bundle -------------------------------------------------------
# URL the bundled frontend JS is served from. A ?v=<version> cache-buster is
# appended so browsers and HA's frontend service worker fetch the fresh bundle
# after every update instead of serving a stale cached copy — the static handler
# resolves the file by path and ignores the query string, so serving still works.
URL_BASE = "/bms_floorplan_frontend"
MODULE_FILE = "bms-floorplan-card.js"
CARD_TAG = "bms-floorplan-card"


def module_url(version: str | None) -> str:
    """URL of the card bundle, with a cache-buster when the version is known."""
    return f"{URL_BASE}/{MODULE_FILE}" + (f"?v={version}" if version else "")


# --- Sidebar panel ---------------------------------------------------------
PANEL_URL = "bms-floorplan"
PANEL_TITLE = "BMS Планировка"
PANEL_ICON = "mdi:floor-plan"

# --- Kiosk (chrome-free page on HA's own port) -----------------------------
# It reuses the browser's existing HA login (no token embedded), so it is safe
# to leave enabled even when HA is reachable externally.
KIOSK_PATH = "/bms-floorplan-kiosk"
# Installed to a tablet home screen the kiosk becomes its own app — own icon, no
# browser chrome. Served under KIOSK_PATH; the manifest declares scope "/" so the
# optional exit gesture can reach the HA dashboard without leaving the app.
KIOSK_MANIFEST_PATH = KIOSK_PATH + "/manifest.json"

# --- Home-screen launcher --------------------------------------------------
# Home Assistant's own PWA manifest is baked into the frontend package, so a
# dashboard installed from the browser always gets the HA icon. This route serves
# a tiny page that carries ITS OWN manifest (our icon) and then forwards to
# whatever HA page ?to= names.
APP_PATH = "/bms-floorplan-app"
APP_MANIFEST_PATH = APP_PATH + "/manifest.json"

# --- Shared plan -----------------------------------------------------------
# One install-wide plan document, so which account a device signs in as no longer
# decides which plan it sees.
STORAGE_VERSION = 1
STORAGE_KEY = f"{DOMAIN}.plan"
PLAN_API_PATH = f"/api/{DOMAIN}/plan"

# WebSocket commands are the primary transport: they work from a kiosk page
# served on any origin, where a cross-origin REST fetch would not.
WS_PLAN_GET = f"{DOMAIN}/plan/get"
WS_PLAN_SET = f"{DOMAIN}/plan/set"
WS_LEGACY_GET = f"{DOMAIN}/legacy/get"

# --- Document versioning ---------------------------------------------------
# Two reserved keys the SERVER owns inside the stored plan document. A writer
# sends `base_version`; when it no longer matches, the write is refused instead
# of quietly replacing whatever the other device saved a second earlier.
# A document written before versioning existed simply has no `version` key and
# reads as 0 — nothing has to be migrated by hand.
DOC_VERSION_KEY = "version"
DOC_UPDATED_KEY = "updated_at"
# Field name a writer uses to say which version it is editing on top of.
BASE_VERSION_FIELD = "base_version"

# --- Edit PIN (its OWN document) -------------------------------------------
# The PIN that gates Edit mode used to live inside the plan document, so every
# plan save rewrote it — and a device whose copy predated the PIN erased it.
# It now has a store of its own with its own commands: reading is open (the card
# must know whether Edit is locked), writing is admin-only like the plan.
PIN_STORAGE_VERSION = 1
PIN_STORAGE_KEY = f"{DOMAIN}.pin"
WS_PIN_GET = f"{DOMAIN}/pin/get"
WS_PIN_SET = f"{DOMAIN}/pin/set"
# What is stored is the card's hash of the PIN, never the digits themselves.
MAX_PIN_LENGTH = 128
# The key the PIN used to occupy inside the plan document. Read once, to carry
# an existing PIN over; never written by us again.
LEGACY_PLAN_PIN_KEY = "editPin"

# --- Previous version (READ-ONLY, never written) ---------------------------
# The old integration keeps running for customers who already have it. We only
# ever read these to offer a one-button import.
LEGACY_DOMAIN = "ha_3d_floorplan"
LEGACY_STORAGE_VERSION = 1
LEGACY_STORAGE_KEY = f"{LEGACY_DOMAIN}.plan"
# Per-user copy (frontend/get_user_data) and the browser copy, listed here for
# reference — both are read by the frontend, not by this integration.
LEGACY_USER_DATA_KEY = "ha3d_floorplans"
LEGACY_LOCAL_STORAGE_KEY = "ha3d-floorplans-set"

# --- Limits ----------------------------------------------------------------
# A plan with design photos is genuinely large (base64 images), so the ceiling is
# generous — but it is a ceiling: without one, a single write can fill the disk
# .storage lives on.
MAX_PLAN_BYTES = 8 * 1024 * 1024
MAX_PROJECTS = 200
MAX_FLOORS_PER_PROJECT = 64

# --- Options ---------------------------------------------------------------
# The kiosk's corner exit gesture drops whoever performs it into the FULL Home
# Assistant UI under the tablet's account, so it is off unless an admin turns it
# on for that install.
OPT_ALLOW_KIOSK_EXIT = "allow_kiosk_exit"
DEFAULT_ALLOW_KIOSK_EXIT = False

# --- hass.data keys --------------------------------------------------------
DATA_ACTIVE = "active"
DATA_MODULE_URL = "module_url"
DATA_ALLOW_KIOSK_EXIT = "allow_kiosk_exit"
DATA_PLAN_STORE = "plan_store"
DATA_PIN_STORE = "pin_store"
DATA_STATIC_PATH = "static_path_registered"
DATA_VIEWS = "views_registered"
