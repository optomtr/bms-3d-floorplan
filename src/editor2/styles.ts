// ---------------------------------------------------------------------------
// Оформление движка.
//
// Всё живёт под .e2-root и держится на переменных: оболочка перекрашивает
// редактор под свою тему, не трогая разметку. Цели нажатия — 44 px: это не
// вкус, а размер пальца, и на планшете монтажника это единственный размер,
// который работает.
// ---------------------------------------------------------------------------

export const ENGINE_CSS = `
.e2-root {
  --e2-bg: #14161b;
  --e2-grid-1: #20232b;
  --e2-grid-2: #2b303b;
  --e2-axis: #3c4454;
  --e2-wall: #d7dee9;
  --e2-room: #4e7fbe;
  --e2-accent: #4fc3f7;
  --e2-text: #e8edf5;
  --e2-muted: #9aa6b8;
  --e2-panel: rgba(20, 23, 30, 0.92);
  --e2-panel-line: #333a47;
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 240px;
  overflow: hidden;
  background: var(--e2-bg);
  color: var(--e2-text);
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  font-size: 13px;
  user-select: none;
  -webkit-user-select: none;
  touch-action: none;
}
.e2-svg { position: absolute; inset: 0; width: 100%; height: 100%; display: block; touch-action: none; cursor: crosshair; }
.e2-root[data-tool="select"] .e2-svg { cursor: default; }

.e2-grid-minor { stroke: var(--e2-grid-1); stroke-width: 1; }
.e2-grid-major { stroke: var(--e2-grid-2); stroke-width: 1; }
.e2-axis { stroke: var(--e2-axis); stroke-width: 1; stroke-dasharray: 6 5; }

.e2-ruler-bg { fill: var(--e2-panel); }
.e2-ruler-tick { stroke: var(--e2-muted); stroke-width: 1; }
.e2-ruler-tx { fill: var(--e2-muted); font-size: 10px; }
.e2-ruler-cursor { stroke: var(--e2-accent); stroke-width: 1.5; }
.e2-scale-tx { fill: var(--e2-muted); font-size: 11px; }

.e2-room { fill: rgba(78, 127, 190, 0.16); stroke: rgba(120, 160, 210, 0.55); stroke-width: 1; }
.e2-room.e2-sel { fill: rgba(79, 195, 247, 0.22); stroke: var(--e2-accent); stroke-width: 2; }
.e2-room-name { fill: var(--e2-text); font-size: 13px; font-weight: 600; }
.e2-room-area { fill: var(--e2-muted); font-size: 11px; }

.e2-wall { stroke: var(--e2-wall); stroke-linecap: butt; }
.e2-wall.e2-sel { stroke: var(--e2-accent); }
.e2-open-cut { stroke: var(--e2-bg); stroke-linecap: butt; }
.e2-open { fill: none; stroke-linecap: butt; }
.e2-open-door { stroke: #ffcc66; }
.e2-open-window { stroke: #7fd7ff; }
.e2-open-opening { stroke: #9aa6b8; stroke-dasharray: 5 4; }
.e2-open.e2-sel { stroke: var(--e2-accent); }
.e2-open-jamb { stroke: var(--e2-wall); stroke-width: 1.5; }

.e2-furn { fill: rgba(154, 166, 184, 0.18); stroke: #93a1b8; stroke-width: 1.2; }
.e2-furn.e2-sel { fill: rgba(79, 195, 247, 0.22); stroke: var(--e2-accent); stroke-width: 2; }
.e2-furn-front { stroke: #cfd8e6; stroke-width: 2; }
.e2-furn-tx { fill: var(--e2-muted); font-size: 10px; }

.e2-zone { fill: rgba(79, 195, 247, 0.18); stroke: var(--e2-accent); stroke-width: 1.5; }
.e2-zone.e2-sel { fill: rgba(79, 195, 247, 0.4); }
.e2-zone-count { fill: var(--e2-text); font-size: 11px; font-weight: 600; }
.e2-zone-tx { fill: var(--e2-muted); font-size: 11px; }
.e2-zone-ring { fill: none; stroke: var(--e2-accent); stroke-width: 1.5; stroke-dasharray: 4 4; }

.e2-handle { fill: var(--e2-bg); stroke: var(--e2-accent); stroke-width: 2; }
.e2-rot-arm { stroke: var(--e2-accent); stroke-width: 1.5; stroke-dasharray: 4 3; }
.e2-rot-handle { fill: var(--e2-accent); stroke: var(--e2-bg); stroke-width: 2; }

.e2-draft-line { fill: none; stroke: var(--e2-accent); stroke-width: 2; }
.e2-draft-ghost { stroke: var(--e2-accent); stroke-width: 2; stroke-dasharray: 7 5; }
.e2-draft-node { fill: var(--e2-accent); }
.e2-draft-close { fill: none; stroke: #7bed9f; stroke-width: 3; }
.e2-draft-rect { fill: rgba(79, 195, 247, 0.12); stroke: var(--e2-accent); stroke-width: 2; stroke-dasharray: 7 5; }
.e2-draft-open { stroke: var(--e2-accent); stroke-linecap: butt; opacity: 0.85; }
.e2-draft-furn { fill: rgba(79, 195, 247, 0.18); stroke: var(--e2-accent); stroke-width: 1.5; stroke-dasharray: 5 4; }
.e2-cursor { fill: var(--e2-accent); }
.e2-cursor-join { fill: none; stroke: #7bed9f; stroke-width: 3; }

.e2-badge-bg { fill: rgba(15, 18, 24, 0.88); stroke: var(--e2-panel-line); stroke-width: 1; }
.e2-badge-tx { fill: var(--e2-text); font-size: 11px; font-weight: 600; }
.e2-dim-on .e2-badge-bg { fill: rgba(79, 195, 247, 0.95); stroke: none; }
.e2-dim-on .e2-badge-tx { fill: #06222e; }
.e2-dim-angle .e2-badge-tx { fill: var(--e2-muted); }
.e2-dim-area .e2-badge-tx { fill: #06222e; }

.e2-hud { position: absolute; inset: 0; pointer-events: none; }
.e2-hud > * { pointer-events: auto; }

.e2-status {
  position: absolute; left: 30px; bottom: 12px; max-width: calc(100% - 220px);
  padding: 9px 14px; border-radius: 10px; background: var(--e2-panel);
  border: 1px solid var(--e2-panel-line); color: var(--e2-text); line-height: 1.35;
}

.e2-controls { position: absolute; right: 12px; bottom: 12px; display: flex; flex-direction: column; gap: 8px; }
.e2-modes { position: absolute; left: 30px; top: 30px; display: flex; gap: 8px; flex-wrap: wrap; }

.e2-btn {
  min-width: 44px; min-height: 44px; padding: 0 14px;
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  border-radius: 10px; border: 1px solid var(--e2-panel-line);
  background: var(--e2-panel); color: var(--e2-text);
  font: inherit; font-weight: 600; cursor: pointer;
}
.e2-btn:hover { border-color: var(--e2-accent); }
.e2-btn[aria-pressed="true"], .e2-btn.e2-on { background: var(--e2-accent); color: #06222e; border-color: var(--e2-accent); }

.e2-fields {
  position: absolute; display: none; gap: 8px; align-items: flex-end;
  padding: 8px 10px; border-radius: 12px; background: var(--e2-panel);
  border: 1px solid var(--e2-accent); box-shadow: 0 6px 22px rgba(0, 0, 0, 0.45);
}
.e2-fields[data-open="1"] { display: flex; }
.e2-field { display: flex; flex-direction: column; gap: 3px; }
.e2-field label { font-size: 10px; color: var(--e2-muted); }
.e2-field input {
  width: 78px; min-height: 40px; padding: 0 8px; border-radius: 8px;
  border: 1px solid var(--e2-panel-line); background: #0f1218; color: var(--e2-text);
  font: inherit; font-weight: 600; text-align: right;
}
.e2-field input:focus { outline: none; border-color: var(--e2-accent); }
.e2-fields-hint { font-size: 10px; color: var(--e2-muted); align-self: center; max-width: 92px; line-height: 1.25; }

.e2-ask {
  position: absolute; left: 50%; top: 30px; transform: translateX(-50%);
  display: none; gap: 10px; align-items: center;
  padding: 10px 12px; border-radius: 12px; background: var(--e2-panel);
  border: 1px solid var(--e2-accent);
}
.e2-ask[data-open="1"] { display: flex; }
.e2-ask-tx { font-weight: 600; }
`;
