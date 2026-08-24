# Home-screen launcher (no integration required)

Home Assistant's PWA manifest is baked into its frontend package, so "Add to home
screen" on a dashboard always produces the **Home Assistant** icon — there is no
setting, theme or dashboard option that changes it.

These two files are a launcher page that owns its own icon and then forwards to
whatever dashboard you name. Installing *it* gives a home-screen app with this
project's house mark that opens your dashboard, with no browser chrome.

The icons are inlined as `data:` URIs, so there is nothing else to upload — two
text files is the whole thing.

## Install

1. Copy `index.html` and `manifest.json` into `config/www/dom/` on the Home
   Assistant machine (File editor, Samba, VS Code or SSH — whichever you have).
   Create `www` first if it does not exist, and restart HA once if it was new.
2. On the phone, open — once, with the `?to=` pointing at your dashboard:

       http://<your-ha>:8123/local/dom/?to=/lovelace/0

3. Chrome menu → **Install** / **Add to home screen**.

`?to=` is remembered on that device, so the installed app (which starts with no
query string) keeps opening the same page. It is validated against the page's own
origin, so a crafted link cannot point the app at another site.

If you run the `ha_3d_floorplan` integration you do not need these files at all —
it serves the same launcher at `/3d-floorplan-app?to=…&name=…`.
