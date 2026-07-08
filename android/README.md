# BMS 3D Floor Plan — Android kiosk app

A thin, fullscreen **WebView kiosk** that shows the 3D floor-plan panel on a wall
tablet and controls the home live — the same panel the Home Assistant
integration renders, connected over the local network with a token.

- **Authoring stays in Home Assistant.** You build the house model, place
  furniture, and bind lights / climate / covers etc. in HA. The tablet only
  **views and controls** the saved plan (it's pulled live).
- **Connection:** the app loads the bundled kiosk page and hands it your HA URL
  + a **long-lived access token**; the page opens a WebSocket to
  `ws://<HA>:8123/api/websocket` and drives devices — no cloud, no HA login flow.
- The APK bundles the kiosk page (`standalone/index.html`) and the built card
  (`dist/ha-3d-floorplan-card.js`); CI copies both into `app/src/main/assets/kiosk/`.

## Install & configure

1. Download `bms-3d-floorplan.apk` from the latest
   [Release](https://github.com/Abdunazar7/bms-3d-floorplan/releases) (or the
   **Build Android APK** workflow artifact).
2. Sideload it on the tablet (allow "install unknown apps").
3. On first launch, enter the HA address (e.g. `http://192.168.1.50:8123`) and a
   long-lived token (HA profile → Long-lived access tokens). Tablet and HA must
   be on the same Wi-Fi.
4. To re-open settings later, **long-press the top-right corner**.

> Tip: set an edit PIN in the card (in HA) so the kiosk stays view/control-only.

## Build

CI builds it on every version tag and on demand (`Build Android APK` workflow).
Locally you need the Android SDK + JDK 17, then:

```
# from the repo root — bundle the web assets first
mkdir -p android/app/src/main/assets/kiosk
cp standalone/index.html       android/app/src/main/assets/kiosk/index.html
cp dist/ha-3d-floorplan-card.js android/app/src/main/assets/kiosk/ha-3d-floorplan-card.js
cd android && gradle assembleDebug
# -> app/build/outputs/apk/debug/app-debug.apk
```

The APK is **debug-signed** (installable; no Play Store). For a release-signed
build, add a keystore + signing config.
