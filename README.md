# 3D Floor Plan Card for Home Assistant

An interactive **true-3D** floor plan custom Lovelace card. Renders your real
house layout — walls, doors, windows, furnished rooms — and binds every relevant
entity (lights, switches, climate, sensors, locks, media players, covers, fans)
live to the 3D scene. Tap a lamp to toggle it; watch temperatures and sensor
values float in the room; switch between floors of a multi-storey building.

Built specifically to fix two pain points of existing tools:

- **No entity-count caps.** Bind as many entities as you like.
- **Tablet-proof touch.** Pinch-zoom can never "lose" the model on a kiosk
  tablet — camera distance is clamped, panning is bounded to the building, and a
  one-tap **Reset view** button always recenters.

> Pure client-side custom card — **no Python, no add-on, no Supervisor**. Works
> on every HA install type (Core, Container, Supervised, OS).

## Features

- True 3D perspective scene (Three.js), not isometric.
- Accurate layouts from line-segment walls with door/window cutouts.
- Multi-floor support with a floor switcher.
- Built-in **procedural** furniture library (sofa, bed, table, chair, wardrobe,
  kitchen counter, TV, fridge, sink, toilet, door, window frame, ceiling light,
  AC unit, intercom) — recolorable, zero external assets to license.
- Custom `.glb` models per placement for advanced users.
- Live entity binding with targeted re-render (high frame rate with hundreds of
  entities).
- Multiple buildings ("obyekt") in one card via a project dropdown.
- Visual config editor (Phase 1) with a planned full 2D wall-drawing editor
  (Phase 2).

## Install

### HACS as an Integration (recommended)

Installing as an **integration** registers a native **3D Floor Plan** sidebar
panel and loads the frontend on every page — so it appears on every tab, every
device, and survives page refreshes (no YAML, no manual resource). It's a custom
integration, not an add-on, so it works on every HA install type — no Supervisor.

1. HACS → ⋮ → **Custom repositories** → add this repo URL, category
   **Integration**.
2. Install **3D Floor Plan**, then **restart Home Assistant**.
3. Settings → Devices & Services → **Add Integration** → "3D Floor Plan" →
   Submit.
4. The **3D Floor Plan** item appears in the sidebar. Open it and tap **✎ Edit**.

> Upgrading from the old Lovelace-plugin install? Remove that HACS entry first,
> then add the repo again as **Integration** — everything keeps working, just
> reliably.

You can still drop `type: custom:ha-3d-floorplan-card` as a card on any
dashboard (the integration loads the module everywhere).

### Manual (Lovelace resource, optional)

1. Copy `dist/ha-3d-floorplan-card.js` to `/config/www/`.
2. Add the resource (Settings → Dashboards → ⋮ → Resources):

```yaml
resources:
  - url: /local/ha-3d-floorplan-card.js
    type: module
```

## Usage

Minimal card with an inline plan:

```yaml
type: custom:ha-3d-floorplan-card
height: 520px
plan:
  name: My Home
  wallHeight: 2.6
  floors:
    - name: Ground
      walls:
        - { start: [0, 0], end: [6, 0] }
        - { start: [6, 0], end: [6, 5] }
        - { start: [6, 5], end: [0, 5] }
        - { start: [0, 5], end: [0, 0], openings: [{ kind: door, position: 2, width: 1 }] }
      rooms:
        - { name: Living, polygon: [[0,0],[6,0],[6,5],[0,5]], color: "#cfc7ba" }
      furniture:
        - { model: ceiling_light, position: [3, 2.5, 2.5], id: lamp1 }
      bindings:
        - { entity_id: light.living_room, anchor_object: lamp1, behavior: light }
```

Load the plan from a file instead (put JSON under `/config/www/floorplans/`):

```yaml
type: custom:ha-3d-floorplan-card
url: /local/floorplans/home.json
```

Multiple buildings:

```yaml
type: custom:ha-3d-floorplan-card
projects:
  - { id: house, name: Main House, url: /local/floorplans/house.json }
  - { id: garage, name: Garage, plan: { floors: [ ... ] } }
```

A complete two-floor example lives in [`examples/home.json`](examples/home.json).

## Sidebar (side panel) entry

Once the resource is installed, a **3D Floor Plan** item is added to the HA
left sidebar **automatically** — no dashboard or YAML needed. Tapping it opens
the floor plan fullscreen. By default it loads `/local/floorplans/home.json`.

Customize or disable it by defining `window.ha3dFloorplan` before the resource
loads (e.g. a tiny `/config/www/ha-3d-floorplan-config.js` added as a second
`type: module` resource):

```js
window.ha3dFloorplan = {
  sidebar: true,                 // false to disable the auto sidebar item
  title: '3D Floor Plan',
  icon: 'mdi:floor-plan',
  url: '/local/floorplans/home.json',
  // or full config: config: { type: 'custom:ha-3d-floorplan-card', url: '...' }
};
```

> The auto-injection hooks the sidebar DOM (HA has no supported frontend-only
> sidebar API). It re-injects itself if HA re-renders the sidebar, and degrades
> gracefully if a future HA version changes the structure. For a guaranteed,
> officially-supported sidebar entry, use **`panel_custom`** instead:

```yaml
# configuration.yaml
panel_custom:
  - name: ha-3d-floorplan-card
    sidebar_title: 3D Floor Plan
    sidebar_icon: mdi:floor-plan
    module_url: /local/ha-3d-floorplan-card.js
    config:
      url: /local/floorplans/home.json
```

## Config reference

| Key | Type | Description |
| --- | --- | --- |
| `plan` | object | Inline floor plan (see schema below). |
| `url` | string | Load plan JSON from a URL/path. |
| `projects` | list | Multiple buildings; each has `id`, optional `name`, and `plan` or `url`. |
| `height` | string | Card height CSS value. Default `500px`. |
| `background` | string | Viewport background color. Default `#1b1d22`. |
| `backend` | string | Optional backend base URL for project CRUD (stretch goal). |

### Floor plan schema

```
FloorPlan: { name?, wallHeight?, floors: FloorDef[] }
FloorDef:  { name, elevation?, wallHeight?, walls[], rooms?[], furniture?[], bindings?[] }
WallDef:   { start: [x,y], end: [x,y], height?, thickness?, color?, openings?[] }
OpeningDef:{ kind: "door"|"window", position, width, sill?, top? }
RoomDef:   { name?, polygon: [[x,y],...], color? }
Furniture: { model, glb?, position: [x,y,z], rotation?, scale?, color?, id? }
Binding:   { entity_id, anchor_object?, anchor?: [x,y,z], behavior?, label? }
```

Coordinates are in **meters**; floor-plan `(x, y)` maps to the 3D `(X, Z)` ground
plane, height extrudes up `+Y`.

**Binding behaviors:** `auto` (derive from domain), `light`, `switch`, `climate`,
`sensor`, `binary_sensor`, `lock`, `media_player`, `cover`, `fan`, `label`.

**Furniture models (40+):** seating & tables — `sofa`, `armchair`, `chair`,
`office_chair`, `table`, `coffee_table`, `dining_table`, `desk`, `bed`,
`nightstand`; storage — `wardrobe`, `dresser`, `bookshelf`; kitchen —
`kitchen_counter`, `fridge`, `stove`, `oven`, `microwave`, `dishwasher`,
`sink`; bathroom — `toilet`, `bathtub`, `shower`, `mirror`; laundry/utility —
`washing_machine`, `radiator`; decor — `tv`, `speaker`, `plant`, `rug`,
`painting`, `curtain`, `stairs`, `security_camera`, `intercom`, `ac_unit`,
`door`, `window_frame`. **Lighting:** `ceiling_light`, `floor_lamp`,
`table_lamp`, `wall_light`, `chandelier`, `spotlight`, `pendant_light`,
`led_strip` (bind a `light.*` entity to any of these). Set `glb` to a `.glb`
path to use a custom model instead.

## Tablet / kiosk notes

- The canvas sets `touch-action: none` so the browser never converts a pinch
  into a page zoom.
- Camera min/max distance and pan bounds are clamped to the building.
- The top-right **Reset** button recenters the camera instantly — the kiosk
  safety net.
- For a standalone kiosk page, also set the viewport meta:
  `maximum-scale=1, user-scalable=no`.

## Standalone kiosk page (own port, no HA login)

A wall tablet can show a **live, controllable 3D floor plan with no Home
Assistant chrome** — just the 3D. Three ways to run it:

**Simplest — a path on Home Assistant's own port (no extra port, no token).**
Open `http://<home-assistant-host>:8123/3d-floorplan-kiosk` on a device that is
already logged into Home Assistant. It shows only the 3D (no sidebar/header) and
reuses that browser's existing HA login for live control — nothing is embedded
in the page, so it's safe even if HA is reachable externally. A device that
isn't logged in just gets a view-only page.

If instead you want a fully separate endpoint (its own port, its own token):

**Automatic (recommended) — the integration serves it for you.** No file
copying, no `python -m http.server`, no per-device token entry:

1. In HA: **Settings → Devices & Services → 3D Floor Plan → Configure**.
2. Set a **Kiosk server port** (e.g. `8099`) and paste a **long-lived access
   token** (HA → your profile → *Long-lived access tokens*). Create the token
   with the **same HA account you edit the plan with** — the page pulls your
   saved plan from that user's storage.
3. Open `http://<home-assistant-host>:<port>/` on the tablet. It auto-connects,
   loads your last-saved plan live, and controls devices. Leave the token blank
   for a **view-only** reference.

The kiosk server only serves the 3D page and the card bundle — it never proxies
HA's admin UI. **Security:** the injected token is a full-privilege credential
served over plain HTTP to anyone who can reach the port, so keep this port on a
**trusted LAN and never forward it to the internet**; revoking the long-lived
token in HA is the kill switch. TLS: front it with your existing HTTPS reverse
proxy if you need it. The token is never taken from the URL, so a crafted link
can't steal or redirect it; `?card=`/`?plan=` overrides are same-origin only.

**Manual — serve the `standalone/` folder yourself.** Copy the built
`ha-3d-floorplan-card.js` next to `standalone/index.html`, (optionally) drop an
exported `plan.json` beside it, serve the folder (`python -m http.server 8099`),
and tap ⚙ to enter your HA URL + token for live control. See the comment at the
top of [`standalone/index.html`](standalone/index.html) for details.

## Development

```bash
npm install
npm run build      # → dist/ha-3d-floorplan-card.js (single bundled file)
npm run watch      # rebuild on change
npm run typecheck
```

Local preview without HA: serve the repo over HTTP and open `test/index.html`
(e.g. `npx serve` then visit `/test/`). It mounts the card with a mock `hass`
and buttons to simulate live state changes.

## In-app editor (draw in 3D)

Tap **✎ Edit** (top-right) to draw your floor plan directly in the 3D view —
no JSON, no YAML, no external modeling tool:

- **▟ Wall** — tap two points and a wall appears **immediately** (no Finish);
  keep tapping to chain connected walls. Points snap onto existing endpoints
  (**green node** = walls join). Tap near the start to close a room. **End run**
  stops the current chain; **Undo** removes the last wall.
- **Camera while editing** — right-drag (desktop) or **two fingers** (tablet)
  orbit + zoom at any time, so you never switch tools just to move the camera.
  Left-click / one finger performs the active tool.
- **🚪 Door / 🪟 Window** — tap a wall to cut an opening at that spot.
- **🛋 Furniture** — pick a model (40+ pieces incl. lighting) from a visual
  palette with **thumbnails**, then tap the floor to place it.
- **☝ Select** — tap a piece to select it (green box). Tap the floor to move it,
  **⟳ Rotate** 45°, **🗑 Delete**, or bind a Home Assistant entity to it via the
  **entity dropdown** (searchable, all your HA entities — no YAML).
- **✋ View** temporarily frees the camera (orbit/pan) without editing.
- **New** starts a blank plan; **Save** stores it; **✓ Done** returns to View.

Saved plans go to **Home Assistant's per-user storage** (shared across all your
devices — design PC and kiosk tablet), with a localStorage fallback. No backend
or files required. With no `plan`/`url`/`projects` configured, the card loads
your saved plan automatically, falling back to a built-in demo.

## Roadmap

- **Phase 1 (done):** render + bind + touch hardening + config editor.
- **Phase 2 (done):** in-app 3D editor — wall drawing, 40+ furniture & lighting
  palette, place/move/rotate/delete, tap-to-bind entity picker, HA-shared save.
- **Next:** multi-floor editing in the editor, opening (door/window) tool,
  per-piece color picker, undo/redo.
- **Stretch:** optional Node backend for versioned project files + GLB export.

## License

MIT. See [LICENSE](LICENSE). Built-in furniture is procedurally generated (no
third-party assets bundled).
