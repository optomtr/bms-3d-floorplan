// ---------------------------------------------------------------------------
// EditorController — draw walls directly in the 3D view.
//
// Clicks are raycast onto the floor plane (y = floor elevation) and snapped to
// a grid; walls extrude upward live as you place points. Click near the start
// point to close a room (adds a floor polygon); Finish ends an open run.
//
// This is the "full 3D drawing" approach: you're working in the perspective 3D
// scene, placing wall bases on the floor plane (the only depth-unambiguous
// surface), and seeing real 3D walls rise as you go.
// ---------------------------------------------------------------------------

import * as THREE from 'three';
import type { FloorPlan, FloorDef, WallDef, Vec2, Vec3, RoomDef, RoomShape, OpeningKind, OpeningDef, ZoneDef } from '../types';
import type { SceneManager } from '../scene/scene-manager';
import { defaultY, defaultColor, isWallMount, isSurfaceMount, isLightSet, LIGHT_KEYS } from '../furniture/library';
import { TextLabel } from '../scene/labels';
import { isShapeRoom, roomPolygon } from '../scene/room-shapes';

export type EditTool = 'wall' | 'furniture' | 'select' | 'door' | 'window' | 'opening' | 'floor' | 'arc';

/** Furniture-palette glazing models that become real wall openings on placement. */
const GLAZING_MODELS: Record<string, { kind: OpeningKind; width: number; variant: string; sill?: number; top?: number }> = {
  window_frame: { kind: 'window', width: 1.2, variant: 'single' },
  terrace_window: { kind: 'window', width: 2.4, variant: 'picture' },
  patio_door: { kind: 'door', width: 2.4, variant: 'glass', sill: 0, top: 2.2 },
  // Full-wall floor-to-ceiling terrace glazing (auto-fits the wall) with a door.
  terrace_wall: { kind: 'window', width: 12, variant: 'terrace', sill: 0, top: 2.55 },
  // Doors placed from the palette cut a real opening into the nearest wall (so
  // they're flush in the wall, never floating/flickering) and are then
  // selectable + draggable along the wall.
  door: { kind: 'door', width: 0.9, variant: 'single' },
  double_door: { kind: 'door', width: 1.6, variant: 'double' },
  sliding_door: { kind: 'door', width: 1.7, variant: 'sliding' },
};

/** Wall-mount models that mount IN the wall like a door: placement pierces a
 *  BARE opening (a real hole) and drops the (still animatable) model flush in it,
 *  linked via `attach` so deleting the piece removes the hole. */
const WALL_CUT_MODELS: Record<string, { width: number; top: number }> = {
  garage_door: { width: 2.6, top: 2.2 },
};

const SNAP = 0.1; // grid snap, meters
const CLOSE_DIST = 0.4; // distance to first point that closes a room
const VERT_SNAP = 0.3; // snap a new point onto an existing wall endpoint

// Drawing aids ("magnet"):
const ANGLE_STEP = Math.PI / 12; // 15° — strong pull to parallel/perpendicular
const LEN_TOL = 0.12; // snap a segment's length to a nearby existing wall length
const ALIGN_TOL = 0.25; // align the first point's x/z with an existing endpoint

const snap = (v: number) => Math.round(v / SNAP) * SNAP;
const sameVertex = (a: Vec2, b: Vec2) => Math.hypot(a[0] - b[0], a[1] - b[1]) < 1e-4;
const rotateVec = (x: number, z: number, deg: number): Vec2 => {
  const r = (deg * Math.PI) / 180;
  const c = Math.cos(r);
  const s = Math.sin(r);
  return [x * c - z * s, x * s + z * c];
};

interface SnapResult {
  pt: Vec2;
  /** Snapped onto an existing endpoint (walls join). */
  joined: boolean;
  /** Segment length equals an existing wall's length. */
  matchedLen: boolean;
  /** Segment is parallel to an existing wall. */
  parallel: boolean;
  lengthM: number;
  angleDeg: number;
}

export class EditorController {
  plan: FloorPlan;
  floorIndex = 0;
  tool: EditTool = 'wall';
  onChange?: () => void;
  /** Transient user-facing messages (e.g. "tap closer to a wall"). */
  onMessage?: (msg: string) => void;
  /** Furniture model to drop with the furniture tool. */
  selectedModel = 'sofa';
  /** Current selection (select tool). */
  selectedKind: 'furniture' | 'wall' | 'room' | 'opening' | null = null;
  selectedId: string | null = null; // furniture id
  selectedWall = -1; // wall array index
  selectedRoom = -1; // room array index
  selectedOpeningWall = -1; // wall index owning the selected opening
  selectedOpeningIndex = -1; // opening index within that wall
  /** Manual room-zone being edited (Rooms panel). */
  selectedZoneId: string | null = null;
  private zonePlaceMode = false;

  private sm: SceneManager;
  /** Points of the wall run being drawn; each new click commits a wall. */
  private chain: Vec2[] = [];
  private cursor: Vec2 | null = null;
  /** Underlay scale calibration: collecting two ground points. */
  private calibrating = false;
  private calibPts: Vec2[] = [];
  /** Host hook: called with the measured distance (m) after two calibration
   *  taps, so the UI can prompt for the real length. */
  onCalibrate?: (measuredMeters: number) => void;
  /** Drawing aids on/off (angle/length/alignment snapping). */
  snapEnabled = true;
  private snapInfo: SnapResult | null = null;
  private measureLabel?: TextLabel;
  private dragMode: 'furniture' | 'endpoint' | 'gizmo' | 'wallmove' | 'opening' | null = null;
  private dragVertex: Vec2 | null = null;
  private wallDrag0: { s: Vec2; e: Vec2 } | null = null;
  private furnDrag0: Vec2 = [0, 0];
  private undoStack: string[] = [];
  private redoStack: string[] = [];
  private dragSnapshot: string | null = null;
  private readonly HISTORY_MAX = 80;
  private gizmoHandle: string | null = null;
  private gizmoGrab: Vec2 = [0, 0];
  private gizmoRoom0 = { x: 0, z: 0, width: 3, depth: 3, rotation: 0 };
  /** Hold Shift to disable auto-snap while moving a room. */
  shiftHeld = false;

  constructor(sm: SceneManager, plan: FloorPlan) {
    this.sm = sm;
    this.plan = plan;
  }

  get pointCount(): number {
    return this.chain.length;
  }

  start(): void {
    // A persistent floating label that shows the live segment length/angle while
    // drawing. Kept outside previewGroup so it survives clearPreview().
    this.measureLabel = new TextLabel(1.2);
    this.measureLabel.sprite.visible = false;
    this.sm.scene.add(this.measureLabel.sprite);
    this.sm.setDragHandler({
      start: (e) => this.dragStart(e),
      move: (p) => this.dragMoveTo(p),
      end: () => this.dragEnd(),
    });
    this.applySceneEditState();
    this.applyUnderlay();
    this.setTool('wall');
  }

  stop(): void {
    this.cancelChain();
    this.sm.setUnderlay(null);
    if (this.measureLabel) {
      this.sm.scene.remove(this.measureLabel.sprite);
      this.measureLabel.dispose();
      this.measureLabel = undefined;
    }
    this.sm.setGroundHandler(undefined);
    this.sm.setDragHandler(undefined);
    this.sm.drawZoneDots([], 0); // clear edit-mode zone dots
    this.sm.setEditMode(false);
    this.sm.setDrawMode(false);
  }

  setSnap(on: boolean): void {
    this.snapEnabled = on;
    this.onChange?.();
  }

  /** Switch the floor being edited; keeps the scene's visible floor, grid
   *  elevation and edit target in lockstep. */
  setFloor(index: number): void {
    if (index < 0 || index >= this.plan.floors.length) return;
    this.cancelChain();
    this.clearSelection();
    this.floorIndex = index;
    this.sm.setActiveFloor(index);
    this.applySceneEditState();
    this.applyUnderlay();
    this.onChange?.();
  }

  /** Rename a floor (editable any time, not only at creation). Commits live on
   *  each keystroke, so it deliberately skips the undo stack (a rename isn't
   *  worth an undo step, and per-keystroke snapshots would spam it). */
  setFloorName(index: number, name: string): void {
    const f = this.plan.floors[index];
    if (!f) return;
    f.name = name;
    this.onChange?.();
  }

  addFloor(): void {
    const wh = this.plan.floors[0]?.wallHeight ?? this.plan.wallHeight ?? 2.6;
    this.pushUndo();
    const maxElev = Math.max(0, ...this.plan.floors.map((f) => f.elevation ?? 0));
    const idx = this.plan.floors.length;
    this.plan.floors.push({
      name: `Floor ${idx + 1}`,
      elevation: maxElev + wh + 0.4,
      wallHeight: wh,
      walls: [],
      rooms: [],
      furniture: [],
      bindings: [],
    });
    this.sm.loadPlan(this.plan, true); // build the new floor
    this.setFloor(idx); // switch to it
    this.onMessage?.(`Added "${this.plan.floors[idx].name}" — draw it`);
  }

  deleteFloor(): void {
    if (this.plan.floors.length <= 1) {
      this.onMessage?.('Cannot delete the only floor');
      return;
    }
    this.pushUndo();
    this.plan.floors.splice(this.floorIndex, 1);
    const ni = Math.min(this.floorIndex, this.plan.floors.length - 1);
    this.clearSelection();
    this.floorIndex = ni;
    this.sm.loadPlan(this.plan, false);
    this.setFloor(ni);
  }

  // -- Drag to move (furniture) / reshape (wall endpoints) --------------------

  private dragStart(e: PointerEvent): boolean {
    if (this.tool !== 'select') return false;
    // Snapshot before any drag; committed to history in dragEnd if it changed.
    this.dragSnapshot = JSON.stringify(this.plan);
    // 1) Position Helper handle (when a shape room is selected).
    if (this.selectedKind === 'room') {
      const handle = this.sm.pickGizmo(e);
      if (handle) return this.beginGizmo(handle, e);
    }
    // 2) Furniture grab → select + move (relative).
    const f = this.sm.pickFurniture(e);
    if (f) {
      this.selectFurniture(f.id);
      return this.beginFurnitureMove(e);
    }
    // 2.5) A door/window leaf → select the opening and drag it ALONG its wall.
    const opHit = this.sm.pickOpening(e);
    if (opHit) {
      this.selectOpening(opHit.wallIndex, opHit.openingIndex);
      this.dragMode = 'opening';
      return true;
    }
    // 3) Shape-room body → select + move.
    const r = this.sm.pickRoom(e);
    if (r && isShapeRoom(this.floor().rooms?.[r.index] ?? ({} as RoomDef))) {
      this.selectRoom(r.index);
      return this.beginGizmo('move', e);
    }
    // 4) Wall endpoint reshape (near a vertex), else 5) move the whole wall.
    const gp = this.sm.groundIntersect(e);
    if (gp) {
      const v = this.nearestEndpoint(gp.x, gp.z, 0.45);
      if (v) {
        this.dragMode = 'endpoint';
        this.dragVertex = v;
        const wi = (this.floor().walls ?? []).findIndex(
          (w) => sameVertex(w.start as Vec2, v) || sameVertex(w.end as Vec2, v),
        );
        if (wi >= 0) this.selectWall(wi);
        return true;
      }
      const hw = this.sm.pickWall(e);
      const w = hw ? this.floor().walls?.[hw.index] : null;
      if (hw && w) {
        this.selectWall(hw.index);
        this.dragMode = 'wallmove';
        this.gizmoGrab = [gp.x, gp.z];
        this.wallDrag0 = { s: [w.start[0], w.start[1]], e: [w.end[0], w.end[1]] };
        return true;
      }
      // 6) Nothing grabbed, but a movable object is already selected → move it
      //    (drag from anywhere; camera is reserved while a movable is selected).
      if (this.isMovableSelected()) return this.beginMoveSelected(e, gp);
    }
    return false;
  }

  private beginFurnitureMove(e: PointerEvent): boolean {
    const gp = this.sm.groundIntersect(e);
    const fobj = this.selectedId ? this.floor().furniture?.find((x) => x.id === this.selectedId) : null;
    if (!gp || !fobj) return false;
    this.dragMode = 'furniture';
    this.gizmoGrab = [gp.x, gp.z];
    this.furnDrag0 = [fobj.position[0], fobj.position[2]];
    return true;
  }

  private beginMoveSelected(e: PointerEvent, gp: THREE.Vector3): boolean {
    if (this.selectedKind === 'furniture') return this.beginFurnitureMove(e);
    if (this.selectedKind === 'room') return this.beginGizmo('move', e);
    if (this.selectedKind === 'wall' && this.selectedWall >= 0) {
      const w = this.floor().walls?.[this.selectedWall];
      if (w) {
        this.dragMode = 'wallmove';
        this.gizmoGrab = [gp.x, gp.z];
        this.wallDrag0 = { s: [w.start[0], w.start[1]], e: [w.end[0], w.end[1]] };
        return true;
      }
    }
    return false;
  }

  private dragMoveTo(p: THREE.Vector3): void {
    if (this.dragMode === 'gizmo') {
      this.gizmoMoveTo(p);
    } else if (this.dragMode === 'furniture' && this.selectedId) {
      const obj = this.sm.getFurnitureObject(this.selectedId);
      if (obj) {
        obj.position.x = snap(this.furnDrag0[0] + (p.x - this.gizmoGrab[0]));
        obj.position.z = snap(this.furnDrag0[1] + (p.z - this.gizmoGrab[1]));
        this.sm.refreshSelection();
      }
    } else if (this.dragMode === 'endpoint' && this.dragVertex) {
      const nv: Vec2 = [snap(p.x), snap(p.z)];
      if (sameVertex(nv, this.dragVertex)) return;
      this.moveVertex(this.dragVertex, nv);
      this.dragVertex = nv;
      this.rebuild();
      this.reselect();
    } else if (this.dragMode === 'wallmove' && this.selectedWall >= 0 && this.wallDrag0) {
      const w = this.floor().walls?.[this.selectedWall];
      if (w) {
        const dx = snap(p.x - this.gizmoGrab[0]);
        const dz = snap(p.z - this.gizmoGrab[1]);
        w.start = [this.wallDrag0.s[0] + dx, this.wallDrag0.s[1] + dz];
        w.end = [this.wallDrag0.e[0] + dx, this.wallDrag0.e[1] + dz];
        this.rebuild();
        this.reselect();
      }
    } else if (this.dragMode === 'opening' && this.selectedOpeningWall >= 0) {
      // Slide a door/window along its wall: project the pointer onto the wall
      // line and clamp so the opening stays fully within the wall span.
      const wall = this.floor().walls?.[this.selectedOpeningWall];
      const op = this.selectedOpeningData;
      if (wall && op) {
        const ax = wall.start[0], az = wall.start[1];
        const dx = wall.end[0] - ax, dz = wall.end[1] - az;
        const len2 = dx * dx + dz * dz;
        if (len2 > 1e-6) {
          const len = Math.sqrt(len2);
          const t = ((p.x - ax) * dx + (p.z - az) * dz) / len2; // 0..1 along wall
          const w = op.width ?? 0.9;
          const pos = Math.max(0, Math.min(len - w, t * len - w / 2));
          op.position = snap(pos);
          this.rebuild();
          this.reselect();
        }
      }
    }
  }

  private dragEnd(): void {
    if (this.dragMode === 'furniture' && this.selectedId) {
      const obj = this.sm.getFurnitureObject(this.selectedId);
      const f = this.floor().furniture?.find((x) => x.id === this.selectedId);
      if (obj && f) {
        if (isWallMount(f.model)) {
          const w = this.nearestWallPoint(obj.position.x, obj.position.z);
          if (w) {
            const r = this.resolveWallMount(f.model, w);
            f.position = [r.x, f.position[1], r.z];
            f.rotation = r.rotation;
            this.rebuild();
            this.reselect();
          } else {
            f.position = [obj.position.x, f.position[1], obj.position.z];
          }
        } else {
          f.position = [obj.position.x, f.position[1], obj.position.z];
        }
      }
      // The piece moved in place (no rebuild on these branches) → refresh its
      // cached shadow so it doesn't stay behind at the old position.
      this.sm.requestShadowUpdate();
    }
    this.dragMode = null;
    this.dragVertex = null;
    this.gizmoHandle = null;
    this.wallDrag0 = null;
    // Commit to undo history only if the drag actually changed the plan.
    if (this.dragSnapshot && this.dragSnapshot !== JSON.stringify(this.plan)) {
      this.undoStack.push(this.dragSnapshot);
      if (this.undoStack.length > this.HISTORY_MAX) this.undoStack.shift();
      this.redoStack = [];
    }
    this.dragSnapshot = null;
    this.onChange?.();
  }

  private nearestEndpoint(x: number, z: number, tol: number): Vec2 | null {
    let best: Vec2 | null = null;
    let bd = tol;
    for (const w of this.floor().walls ?? []) {
      for (const pt of [w.start, w.end]) {
        const d = Math.hypot(x - pt[0], z - pt[1]);
        if (d < bd) {
          bd = d;
          best = [pt[0], pt[1]];
        }
      }
    }
    return best;
  }

  /** Move a shared vertex: all walls + room polygon points at `from` go to `to`. */
  private moveVertex(from: Vec2, to: Vec2): void {
    for (const w of this.floor().walls ?? []) {
      if (sameVertex(w.start as Vec2, from)) w.start = [to[0], to[1]];
      if (sameVertex(w.end as Vec2, from)) w.end = [to[0], to[1]];
    }
    for (const r of this.floor().rooms ?? []) {
      r.polygon = r.polygon.map((pt) =>
        sameVertex(pt as Vec2, from) ? ([to[0], to[1]] as Vec2) : pt,
      );
    }
  }

  // -- Wall length ------------------------------------------------------------

  get selectedWallLength(): number | null {
    if (this.selectedKind !== 'wall') return null;
    const w = this.floor().walls?.[this.selectedWall];
    if (!w) return null;
    return Math.hypot(w.end[0] - w.start[0], w.end[1] - w.start[1]);
  }

  /** Selected wall thickness in meters (defaults to 0.12 when unset). */
  get selectedWallThickness(): number | null {
    if (this.selectedKind !== 'wall') return null;
    const w = this.floor().walls?.[this.selectedWall];
    if (!w) return null;
    return w.thickness ?? 0.12;
  }

  /** Selected wall's absolute heading in degrees (0 = +x). */
  get selectedWallAngle(): number | null {
    if (this.selectedKind !== 'wall') return null;
    const w = this.floor().walls?.[this.selectedWall];
    if (!w) return null;
    return (Math.atan2(w.end[1] - w.start[1], w.end[0] - w.start[0]) * 180) / Math.PI;
  }

  /** Openings (doors/windows) on the selected wall — for the property list. */
  get selectedWallOpenings(): { kind: string; position: number; width: number }[] {
    if (this.selectedKind !== 'wall') return [];
    return (this.floor().walls?.[this.selectedWall]?.openings ?? []).map((o) => ({
      kind: o.kind,
      position: o.position,
      width: o.width,
    }));
  }

  /** Delete one opening from the selected wall (doors/windows have no 3D click
   *  target, so they're removed from the wall's opening list). */
  deleteWallOpening(index: number): void {
    if (this.selectedKind !== 'wall') return;
    const w = this.floor().walls?.[this.selectedWall];
    if (!w?.openings) return;
    this.pushUndo();
    w.openings.splice(index, 1);
    this.rebuild();
    this.reselect();
    this.onChange?.();
  }

  /** Openings on the selected shape room (for the property list). */
  get selectedRoomOpenings(): { kind: string; position: number; width: number }[] {
    if (this.selectedKind !== 'room') return [];
    return (this.currentRoom()?.openings ?? []).map((o) => ({
      kind: o.kind,
      position: o.position,
      width: o.width,
    }));
  }

  deleteRoomOpening(index: number): void {
    const room = this.currentRoom();
    if (!room?.openings) return;
    this.pushUndo();
    room.openings.splice(index, 1);
    this.rebuild();
    this.reselect();
    this.onChange?.();
  }

  /** Set the selected wall's length, moving its END along the wall direction. */
  setWallLength(len: number): void {
    if (this.selectedKind !== 'wall' || !(len > 0)) return;
    const w = this.floor().walls?.[this.selectedWall];
    if (!w) return;
    this.pushUndo();
    const dx = w.end[0] - w.start[0];
    const dz = w.end[1] - w.start[1];
    const cur = Math.hypot(dx, dz) || 1;
    w.end = [w.start[0] + (dx / cur) * len, w.start[1] + (dz / cur) * len];
    this.rebuild();
    this.reselect();
    this.onChange?.();
  }

  /** Set the selected wall's thickness in meters (e.g. 0.25, 0.38, 0.78). */
  setWallThickness(t: number): void {
    if (this.selectedKind !== 'wall' || !(t > 0)) return;
    const w = this.floor().walls?.[this.selectedWall];
    if (!w) return;
    this.pushUndo();
    w.thickness = t;
    this.rebuild();
    this.reselect();
    this.onChange?.();
  }

  /** Rotate the selected wall to an absolute heading (deg), pivoting on its start
   *  point and keeping its length — so a 45° infill can be typed exactly. */
  setWallAngle(deg: number): void {
    if (this.selectedKind !== 'wall') return;
    const w = this.floor().walls?.[this.selectedWall];
    if (!w) return;
    const len = Math.hypot(w.end[0] - w.start[0], w.end[1] - w.start[1]) || 1;
    const r = (deg * Math.PI) / 180;
    this.pushUndo();
    w.end = [w.start[0] + Math.cos(r) * len, w.start[1] + Math.sin(r) * len];
    this.rebuild();
    this.reselect();
    this.onChange?.();
  }

  setTool(t: EditTool): void {
    // Commit any in-progress chain using the CURRENT (previous) tool before
    // switching, so switching tools doesn't lose or mis-commit a run.
    if (this.chain.length && t !== this.tool) this.finishChain();
    this.tool = t;
    // Camera is on unless a movable object is selected (then left/one-finger
    // moves it). A TAP always performs the tool. No separate "View" tool.
    if (t !== 'select') this.clearSelection();
    this.applyReserve();
    this.onChange?.();
  }

  private floor(): FloorDef {
    return this.plan.floors[this.floorIndex];
  }

  get selectedEntity(): string | null {
    if (this.selectedKind !== 'furniture' || !this.selectedId) return null;
    const b = this.floor().bindings?.find((x) => x.anchor_object === this.selectedId);
    return b?.entity_id ?? null;
  }

  /** Model key of the currently selected furniture (for domain-filtered binding). */
  get selectedObjectModel(): string | null {
    if (this.selectedKind !== 'furniture' || !this.selectedId) return null;
    const f = this.floor().furniture?.find((x) => x.id === this.selectedId);
    return f?.model ?? null;
  }

  /** Current color of the selected furniture / wall / room (for the color picker). */
  get selectedColor(): string | null {
    const fl = this.floor();
    if (this.selectedKind === 'furniture') {
      const f = fl.furniture?.find((x) => x.id === this.selectedId);
      return f?.color ?? (f ? defaultColor(f.model) : null);
    }
    if (this.selectedKind === 'wall') return fl.walls?.[this.selectedWall]?.color ?? null;
    if (this.selectedKind === 'room') return fl.rooms?.[this.selectedRoom]?.color ?? null;
    return null;
  }

  // -- Furniture / selection --------------------------------------------------

  private placeFurniture(p: THREE.Vector3): void {
    const fl = this.floor();
    // Glazing models (doors / windows) cut a real see-through opening into the
    // nearest wall instead of sitting on its surface. They are wall-only: if no
    // wall is close enough we tell the user rather than dropping a floating
    // (flickering) model.
    if (GLAZING_MODELS[this.selectedModel]) {
      if (!this.placeGlazing(p, this.selectedModel)) {
        this.onMessage?.('Tap on (or near) a wall to place this');
      }
      return;
    }
    // Wall-cut models (garage door): pierce a bare hole in the nearest wall and
    // drop the model flush into it, linked so deleting the piece closes the hole.
    const cutCfg = WALL_CUT_MODELS[this.selectedModel];
    if (cutCfg) {
      this.pushUndo();
      const cut = this.cutForWallModel(p, cutCfg);
      if (!cut) {
        this.undoStack.pop(); // nothing changed — drop the redundant snapshot
        this.onMessage?.('Tap on (or near) a wall to install the garage door');
        return;
      }
      if (!fl.furniture) fl.furniture = [];
      const wh = fl.wallHeight ?? this.plan.wallHeight ?? 2.6;
      const id = `f${fl.furniture.length}_${Math.floor(performance.now() % 100000)}`;
      fl.furniture.push({
        model: this.selectedModel,
        position: [cut.x, defaultY(this.selectedModel, wh), cut.z],
        rotation: cut.rotation,
        color: defaultColor(this.selectedModel),
        id,
        attach: { kind: 'wall', index: cut.wallIndex, opening: cut.openingIndex },
      });
      this.rebuild();
      this.selectFurniture(id);
      this.onMessage?.('Garage door installed in wall');
      return;
    }
    this.pushUndo();
    if (!fl.furniture) fl.furniture = [];
    const wh = fl.wallHeight ?? this.plan.wallHeight ?? 2.6;
    const id = `f${fl.furniture.length}_${Math.floor(performance.now() % 100000)}`;
    let x = snap(p.x);
    let z = snap(p.z);
    let rotation = 0;
    // Wall-mount items (TV, painting, sconce…) snap to the nearest wall + orient.
    if (isWallMount(this.selectedModel)) {
      const w = this.nearestWallPoint(p.x, p.z);
      if (w) {
        const r = this.resolveWallMount(this.selectedModel, w);
        x = r.x;
        z = r.z;
        rotation = r.rotation;
      }
    }
    fl.furniture.push({
      model: this.selectedModel,
      position: [x, defaultY(this.selectedModel, wh), z],
      rotation,
      color: defaultColor(this.selectedModel),
      id,
    });
    this.rebuild();
    this.selectFurniture(id);
  }

  /** Cut a window/door opening into the nearest wall for a glazing furniture
   *  model. Returns false if no wall is close enough (then place as furniture). */
  private placeGlazing(p: THREE.Vector3, model: string): boolean {
    const cfg = GLAZING_MODELS[model];
    if (!cfg) return false;
    const walls = this.floor().walls ?? [];
    let best: { i: number; along: number; len: number } | null = null;
    let bd = 0.9;
    for (let i = 0; i < walls.length; i++) {
      const w = walls[i];
      const ax = w.start[0], az = w.start[1], bx = w.end[0], bz = w.end[1];
      const dx = bx - ax, dz = bz - az;
      const l2 = dx * dx + dz * dz;
      if (l2 < 1e-6) continue;
      let t = ((p.x - ax) * dx + (p.z - az) * dz) / l2;
      t = Math.max(0, Math.min(1, t));
      const cx = ax + dx * t, cz = az + dz * t;
      const d = Math.hypot(p.x - cx, p.z - cz);
      if (d < bd) {
        bd = d;
        best = { i, along: t * Math.sqrt(l2), len: Math.sqrt(l2) };
      }
    }
    if (!best) return false;
    const width = Math.min(cfg.width, Math.max(0.4, best.len - 0.1));
    const position = Math.max(0, Math.min(best.len - width, best.along - width / 2));
    this.pushUndo();
    const w = walls[best.i];
    (w.openings ??= []).push({
      kind: cfg.kind,
      position,
      width,
      variant: cfg.variant,
      ...(cfg.sill !== undefined ? { sill: cfg.sill } : {}),
      ...(cfg.top !== undefined ? { top: cfg.top } : {}),
    });
    this.rebuild();
    this.selectOpening(best.i, w.openings!.length - 1);
    this.onMessage?.(`${cfg.kind === 'door' ? 'Glass door' : 'Window'} cut into wall`);
    return true;
  }

  /** Cut a BARE (leaf-less) door opening on the nearest wall for a wall-cut model
   *  and return the opening's wall/index plus the in-wall placement (centreline
   *  point + wall angle) so the model can be dropped flush into the hole. */
  private cutForWallModel(
    p: THREE.Vector3,
    cfg: { width: number; top: number },
  ): { wallIndex: number; openingIndex: number; x: number; z: number; rotation: number } | null {
    const walls = this.floor().walls ?? [];
    let best: { i: number; along: number; len: number } | null = null;
    let bd = 1.0;
    for (let i = 0; i < walls.length; i++) {
      const w = walls[i];
      const ax = w.start[0], az = w.start[1], bx = w.end[0], bz = w.end[1];
      const dx = bx - ax, dz = bz - az;
      const l2 = dx * dx + dz * dz;
      if (l2 < 1e-6) continue;
      let t = ((p.x - ax) * dx + (p.z - az) * dz) / l2;
      t = Math.max(0, Math.min(1, t));
      const cx = ax + dx * t, cz = az + dz * t;
      const d = Math.hypot(p.x - cx, p.z - cz);
      if (d < bd) {
        bd = d;
        best = { i, along: t * Math.sqrt(l2), len: Math.sqrt(l2) };
      }
    }
    if (!best) return null;
    const w = walls[best.i];
    const len = best.len;
    const width = Math.min(cfg.width, Math.max(0.4, len - 0.1));
    const position = Math.max(0, Math.min(len - width, best.along - width / 2));
    (w.openings ??= []).push({ kind: 'door', position, width, sill: 0, top: cfg.top, bare: true });
    const dxu = (w.end[0] - w.start[0]) / len, dzu = (w.end[1] - w.start[1]) / len;
    const centre = position + width / 2;
    return {
      wallIndex: best.i,
      openingIndex: w.openings!.length - 1,
      x: w.start[0] + dxu * centre,
      z: w.start[1] + dzu * centre,
      rotation: (-Math.atan2(w.end[1] - w.start[1], w.end[0] - w.start[0]) * 180) / Math.PI,
    };
  }

  /** Nearest point on any wall / shape-room edge, with orientation + normal/side
   *  (which face of the wall the tapped point is on), for snapping wall-mounted
   *  furniture. */
  private nearestWallPoint(
    px: number,
    pz: number,
  ): { x: number; z: number; rotation: number; nx: number; nz: number; thickness: number } | null {
    let bd = 1.2;
    let best:
      | { x: number; z: number; rotation: number; nx: number; nz: number; thickness: number }
      | null = null;
    const fl = this.floor();
    const tryEdge = (ax: number, az: number, bx: number, bz: number, thickness: number) => {
      const dx = bx - ax, dz = bz - az;
      const len2 = dx * dx + dz * dz;
      if (len2 < 1e-6) return;
      let t = ((px - ax) * dx + (pz - az) * dz) / len2;
      t = Math.max(0, Math.min(1, t));
      const cx = ax + dx * t, cz = az + dz * t;
      const d = Math.hypot(px - cx, pz - cz);
      if (d < bd) {
        bd = d;
        const len = Math.sqrt(len2);
        // unit normal pointing toward the tapped side
        let nx = -dz / len, nz = dx / len;
        if ((px - cx) * nx + (pz - cz) * nz < 0) {
          nx = -nx;
          nz = -nz;
        }
        best = { x: cx, z: cz, rotation: (-Math.atan2(dz, dx) * 180) / Math.PI, nx, nz, thickness };
      }
    };
    for (const w of fl.walls ?? []) {
      tryEdge(w.start[0], w.start[1], w.end[0], w.end[1], w.thickness ?? 0.12);
    }
    for (const room of fl.rooms ?? []) {
      if (!isShapeRoom(room)) continue;
      const poly = roomPolygon(room);
      const th = room.thickness ?? 0.12;
      for (let i = 0; i < poly.length; i++) {
        const a = poly[i];
        const b = poly[(i + 1) % poly.length];
        tryEdge(a[0], a[1], b[0], b[1], th);
      }
    }
    return best;
  }

  /** Resolve final position + rotation for a wall-mounted piece. Surface-mount
   *  items (TV, painting…) are pushed onto the room-side face and turned to face
   *  the room; doors/windows/curtains stay in the wall plane. */
  private resolveWallMount(
    model: string,
    p: { x: number; z: number; rotation: number; nx: number; nz: number; thickness: number },
  ): { x: number; z: number; rotation: number } {
    if (!isSurfaceMount(model)) return { x: p.x, z: p.z, rotation: p.rotation };
    const off = p.thickness / 2 + 0.04;
    const x = p.x + p.nx * off;
    const z = p.z + p.nz * off;
    // Rotation so the model's front (+Z local) faces the room (the normal).
    const rotation = (Math.atan2(p.nx, p.nz) * 180) / Math.PI;
    return { x, z, rotation };
  }

  selectFurniture(id: string | null): void {
    this.selectedKind = id ? 'furniture' : null;
    this.selectedId = id;
    this.selectedWall = -1;
    this.selectedRoom = -1;
    this.sm.setSelection(id ? this.sm.getFurnitureObject(id) ?? null : null);
    this.applyReserve();
    this.onChange?.();
  }

  selectWall(index: number): void {
    this.selectedKind = 'wall';
    this.selectedWall = index;
    this.selectedId = null;
    this.selectedRoom = -1;
    this.sm.setSelection(this.sm.getWallObject(index) ?? null);
    this.applyReserve();
    this.onChange?.();
  }

  selectRoom(index: number): void {
    this.selectedKind = 'room';
    this.selectedRoom = index;
    this.selectedId = null;
    this.selectedWall = -1;
    this.sm.setSelection(this.sm.getRoomObject(index) ?? null);
    this.buildGizmo();
    this.applyReserve();
    this.onChange?.();
  }

  /** Select a door/window opening directly (picked from its leaf/glass). */
  selectOpening(wallIndex: number, openingIndex: number): void {
    this.selectedKind = 'opening';
    this.selectedOpeningWall = wallIndex;
    this.selectedOpeningIndex = openingIndex;
    this.selectedId = null;
    this.selectedWall = -1;
    this.selectedRoom = -1;
    this.sm.setSelection(this.sm.getWallObject(wallIndex) ?? null);
    this.applyReserve();
    this.onChange?.();
  }

  /** The currently-selected opening's definition (or null). */
  get selectedOpeningData(): OpeningDef | null {
    if (this.selectedKind !== 'opening') return null;
    return this.floor().walls?.[this.selectedOpeningWall]?.openings?.[this.selectedOpeningIndex] ?? null;
  }
  get selectedOpeningKind(): OpeningKind | null {
    return this.selectedOpeningData?.kind ?? null;
  }
  get selectedOpeningVariant(): string {
    return this.selectedOpeningData?.variant ?? 'single';
  }
  get selectedOpeningWidth(): number | null {
    return this.selectedOpeningData?.width ?? null;
  }

  setOpeningVariant(variant: string): void {
    const op = this.selectedOpeningData;
    if (!op) return;
    this.pushUndo();
    op.variant = variant;
    this.rebuild();
    this.reselect();
    this.onChange?.();
  }

  /** Swap a selected opening between door / window / opening. */
  setOpeningKind(kind: OpeningKind): void {
    const op = this.selectedOpeningData;
    if (!op) return;
    this.pushUndo();
    op.kind = kind;
    op.bare = kind === 'opening' ? true : undefined;
    delete op.sill;
    delete op.top; // let the builder pick kind-appropriate defaults
    this.rebuild();
    this.reselect();
    this.onChange?.();
  }

  setOpeningWidth(width: number): void {
    const op = this.selectedOpeningData;
    if (!op || !(width > 0)) return;
    const wall = this.floor().walls?.[this.selectedOpeningWall];
    if (!wall) return;
    const len = Math.hypot(wall.end[0] - wall.start[0], wall.end[1] - wall.start[1]);
    this.pushUndo();
    op.width = Math.min(width, Math.max(0.3, len - op.position));
    this.rebuild();
    this.reselect();
    this.onChange?.();
  }

  deleteSelectedOpening(): void {
    if (this.selectedKind !== 'opening') return;
    const wall = this.floor().walls?.[this.selectedOpeningWall];
    if (!wall?.openings) return;
    this.pushUndo();
    wall.openings.splice(this.selectedOpeningIndex, 1);
    this.clearSelection();
    this.rebuild();
    this.onChange?.();
  }

  clearSelection(): void {
    this.selectedKind = null;
    this.selectedId = null;
    this.selectedWall = -1;
    this.selectedRoom = -1;
    this.selectedOpeningWall = -1;
    this.selectedOpeningIndex = -1;
    this.sm.setSelection(null);
    this.sm.clearGizmo();
    this.applyReserve();
    this.onChange?.();
  }

  /** A movable selection reserves left/one-finger for dragging (camera off). */
  private isMovableSelected(): boolean {
    if (this.selectedKind === 'furniture' || this.selectedKind === 'wall') return true;
    if (this.selectedKind === 'room') {
      const r = this.currentRoom();
      return !!r && isShapeRoom(r);
    }
    return false;
  }

  private applyReserve(): void {
    this.sm.setLeftReserved(this.isMovableSelected());
  }

  /** Re-apply the selection highlight after a rebuild (object instances change). */
  private reselect(): void {
    if (this.selectedKind === 'furniture' && this.selectedId)
      this.sm.setSelection(this.sm.getFurnitureObject(this.selectedId) ?? null);
    else if (this.selectedKind === 'wall' && this.selectedWall >= 0)
      this.sm.setSelection(this.sm.getWallObject(this.selectedWall) ?? null);
    else if (this.selectedKind === 'room' && this.selectedRoom >= 0) {
      this.sm.setSelection(this.sm.getRoomObject(this.selectedRoom) ?? null);
      this.buildGizmo();
    } else if (this.selectedKind === 'opening' && this.selectedOpeningWall >= 0) {
      this.sm.setSelection(this.sm.getWallObject(this.selectedOpeningWall) ?? null);
    }
  }

  // -- Building Mode: shape rooms + Position Helper gizmo ----------------------

  private currentRoom(): RoomDef | null {
    if (this.selectedKind !== 'room') return null;
    return this.floor().rooms?.[this.selectedRoom] ?? null;
  }

  get selectedRoomData(): RoomDef | null {
    return this.currentRoom();
  }

  /** Drop a parametric room shape at the camera target and select it. */
  addRoomShape(shape: RoomShape): void {
    const fl = this.floor();
    this.pushUndo();
    if (!fl.rooms) fl.rooms = [];
    const c = this.sm.controls.target;
    const room: RoomDef = {
      id: `r${fl.rooms.length}_${Math.floor(performance.now() % 100000)}`,
      name: `Room ${fl.rooms.length + 1}`,
      shape,
      x: snap(c.x),
      z: snap(c.z),
      width: 4,
      depth: 3,
      rotation: 0,
      polygon: [],
    };
    fl.rooms.push(room);
    this.rebuild();
    this.selectRoom(fl.rooms.length - 1);
    this.setTool('select');
    this.onChange?.();
  }

  setRoomField(field: 'name' | 'width' | 'depth' | 'height' | 'rotation', value: number | string): void {
    const room = this.currentRoom();
    if (!room) return;
    this.pushUndo();
    if (field === 'name') room.name = String(value);
    else {
      const v = Number(value);
      if (Number.isNaN(v)) return;
      if (field === 'width') room.width = Math.max(0.5, v);
      else if (field === 'depth') room.depth = Math.max(0.5, v);
      else if (field === 'height') room.height = Math.max(1, v);
      else if (field === 'rotation') room.rotation = v;
    }
    this.rebuild();
    this.reselect();
    this.onChange?.();
  }

  private buildGizmo(): void {
    this.sm.clearGizmo();
    const room = this.currentRoom();
    if (!room || !isShapeRoom(room)) return;
    const g = this.sm.gizmoGroup;
    const y = this.elevation() + 0.08;
    const cx = room.x ?? 0;
    const cz = room.z ?? 0;
    const rot = room.rotation ?? 0;

    const handle = (
      geo: THREE.BufferGeometry,
      color: number,
      pos: Vec2,
      id: string,
      flat = true,
    ) => {
      const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color, depthTest: false }));
      if (flat) m.rotation.x = -Math.PI / 2;
      m.position.set(pos[0], y, pos[1]);
      m.renderOrder = 1000;
      m.userData.gizmoHandle = id;
      g.add(m);
    };

    // Move (center disc).
    handle(new THREE.CircleGeometry(0.28, 24), 0x4aa3ff, [cx, cz], 'move');
    // Rotate (ring) offset beyond one edge.
    const off = rotateVec(0, -((room.depth ?? 3) / 2 + 0.7), rot);
    handle(new THREE.TorusGeometry(0.2, 0.05, 8, 20), 0x4fd06a, [cx + off[0], cz + off[1]], 'rotate');
    // Corner resize handles (rect only).
    if (room.shape === 'rect') {
      roomPolygon(room).forEach((c, i) => {
        const s = new THREE.Mesh(
          new THREE.SphereGeometry(0.16, 12, 12),
          new THREE.MeshBasicMaterial({ color: 0xffcc44, depthTest: false }),
        );
        s.position.set(c[0], y, c[1]);
        s.renderOrder = 1000;
        s.userData.gizmoHandle = `corner${i}`;
        g.add(s);
      });
    }
  }

  private beginGizmo(handle: string, e: PointerEvent): boolean {
    const room = this.currentRoom();
    const gp = this.sm.groundIntersect(e);
    if (!room || !gp) return false;
    this.dragMode = 'gizmo';
    this.gizmoHandle = handle;
    this.gizmoGrab = [gp.x, gp.z];
    this.gizmoRoom0 = {
      x: room.x ?? 0,
      z: room.z ?? 0,
      width: room.width ?? 3,
      depth: room.depth ?? 3,
      rotation: room.rotation ?? 0,
    };
    return true;
  }

  private gizmoMoveTo(p: THREE.Vector3): void {
    const room = this.currentRoom();
    if (!room || !this.gizmoHandle) return;
    const g0 = this.gizmoRoom0;
    const h = this.gizmoHandle;
    if (h === 'move') {
      room.x = snap(g0.x + (p.x - this.gizmoGrab[0]));
      room.z = snap(g0.z + (p.z - this.gizmoGrab[1]));
      if (!this.shiftHeld) this.snapRoom(room);
    } else if (h === 'rotate') {
      let deg = (Math.atan2(p.z - (room.z ?? 0), p.x - (room.x ?? 0)) * 180) / Math.PI + 90;
      if (!this.shiftHeld) deg = Math.round(deg / 15) * 15;
      room.rotation = deg;
    } else if (h.startsWith('corner') && room.shape === 'rect') {
      const i = parseInt(h.slice(6), 10);
      const signs: Vec2[] = [
        [-1, -1],
        [1, -1],
        [1, 1],
        [-1, 1],
      ];
      const [sx, sz] = signs[i] ?? [1, 1];
      // Fixed opposite corner (world), in the room's start rotation.
      const oppLocal: Vec2 = [(-sx * g0.width) / 2, (-sz * g0.depth) / 2];
      const oppWorld = rotateVec(oppLocal[0], oppLocal[1], g0.rotation);
      const oppX = g0.x + oppWorld[0];
      const oppZ = g0.z + oppWorld[1];
      // Pointer in the room-local frame (unrotate around the FIXED opposite corner... use center0).
      const rel = rotateVec(p.x - g0.x, p.z - g0.z, -g0.rotation);
      const newW = Math.max(0.5, snap(Math.abs(rel[0] - (-sx * g0.width) / 2)));
      const newD = Math.max(0.5, snap(Math.abs(rel[1] - (-sz * g0.depth) / 2)));
      // New center = midpoint of fixed opposite corner and the dragged corner, world.
      const cornerLocalNew: Vec2 = [(sx * newW) / 2, (sz * newD) / 2];
      const cornerWorldFromOpp = rotateVec(sx * newW, sz * newD, g0.rotation);
      room.width = newW;
      room.depth = newD;
      room.x = snap(oppX + cornerWorldFromOpp[0] / 2);
      room.z = snap(oppZ + cornerWorldFromOpp[1] / 2);
      void cornerLocalNew;
    }
    this.rebuild();
    this.reselect();
    this.onChange?.();
  }

  /** Snap an axis-aligned room's edges to nearby axis-aligned rooms. */
  private snapRoom(room: RoomDef): void {
    if (Math.abs(((room.rotation ?? 0) % 360)) > 1) return;
    const tol = 0.35;
    const w = room.width ?? 3;
    const d = room.depth ?? 3;
    let L = (room.x ?? 0) - w / 2;
    let T = (room.z ?? 0) - d / 2;
    const others = (this.floor().rooms ?? []).filter(
      (r) => r !== room && isShapeRoom(r) && Math.abs((r.rotation ?? 0) % 360) <= 1,
    );
    let bestDX = 0;
    let bestDXd = tol;
    let bestDZ = 0;
    let bestDZd = tol;
    for (const o of others) {
      const ow = o.width ?? 3;
      const od = o.depth ?? 3;
      const oL = (o.x ?? 0) - ow / 2;
      const oR = (o.x ?? 0) + ow / 2;
      const oT = (o.z ?? 0) - od / 2;
      const oB = (o.z ?? 0) + od / 2;
      for (const myX of [L, L + w]) {
        for (const oX of [oL, oR]) {
          const diff = oX - myX;
          if (Math.abs(diff) < bestDXd) {
            bestDXd = Math.abs(diff);
            bestDX = diff;
          }
        }
      }
      for (const myZ of [T, T + d]) {
        for (const oZ of [oT, oB]) {
          const diff = oZ - myZ;
          if (Math.abs(diff) < bestDZd) {
            bestDZd = Math.abs(diff);
            bestDZ = diff;
          }
        }
      }
    }
    room.x = (room.x ?? 0) + bestDX;
    room.z = (room.z ?? 0) + bestDZ;
    void L;
    void T;
  }

  rotateSelected(): void {
    if (this.selectedKind !== 'furniture') return;
    const f = this.floor().furniture?.find((x) => x.id === this.selectedId);
    if (!f) return;
    this.pushUndo();
    f.rotation = ((f.rotation ?? 0) + 45) % 360;
    this.rebuild();
    this.reselect();
    this.onChange?.();
  }

  /** Move the selected furniture up/down along the vertical axis. */
  nudgeHeight(delta: number): void {
    if (this.selectedKind !== 'furniture') return;
    const f = this.floor().furniture?.find((x) => x.id === this.selectedId);
    if (!f) return;
    this.pushUndo();
    f.position[1] = Math.max(0, Math.round((f.position[1] + delta) * 100) / 100);
    this.rebuild();
    this.reselect();
    this.onChange?.();
  }

  /** Current per-axis scale of the selected furniture (defaults to 1,1,1). */
  get selectedFurnitureScale(): Vec3 | null {
    if (this.selectedKind !== 'furniture') return null;
    const f = this.floor().furniture?.find((x) => x.id === this.selectedId);
    if (!f) return null;
    const s = f.scale ?? 1;
    return Array.isArray(s) ? (s as Vec3) : [s, s, s];
  }

  /** Resize the selected furniture along one axis (0=x width, 1=y height, 2=z depth). */
  setFurnitureScale(axis: 0 | 1 | 2, v: number): void {
    if (this.selectedKind !== 'furniture' || !(v > 0)) return;
    const f = this.floor().furniture?.find((x) => x.id === this.selectedId);
    if (!f) return;
    this.pushUndo();
    const s = f.scale ?? 1;
    const cur: Vec3 = Array.isArray(s) ? [s[0], s[1], s[2]] : [s, s, s];
    cur[axis] = Math.max(0.1, Math.round(v * 100) / 100);
    f.scale = cur;
    this.rebuild();
    this.reselect();
    this.onChange?.();
  }

  /** Whether the selected furniture is a light fixture (brightness applies). */
  get selectedIsLight(): boolean {
    if (this.selectedKind !== 'furniture' || !this.selectedId) return false;
    const f = this.floor().furniture?.find((x) => x.id === this.selectedId);
    return !!f && LIGHT_KEYS.includes(f.model);
  }
  get selectedBrightness(): number {
    if (this.selectedKind !== 'furniture' || !this.selectedId) return 0;
    const f = this.floor().furniture?.find((x) => x.id === this.selectedId);
    return f?.brightness ?? 0;
  }

  /** Manually set the selected light's glow level (0..1). */
  setBrightness(v: number): void {
    if (this.selectedKind !== 'furniture' || !this.selectedId) return;
    const f = this.floor().furniture?.find((x) => x.id === this.selectedId);
    if (!f) return;
    this.pushUndo();
    f.brightness = Math.max(0, Math.min(1, v));
    this.rebuild();
    this.reselect();
    this.onChange?.();
  }

  private selectedFurniture() {
    if (this.selectedKind !== 'furniture' || !this.selectedId) return null;
    return this.floor().furniture?.find((x) => x.id === this.selectedId) ?? null;
  }

  /** Whether the selection is a light SET (spotlight_bar / led_backlight / …). */
  get selectedIsLightSet(): boolean {
    const f = this.selectedFurniture();
    return !!f && isLightSet(f.model);
  }
  get selectedSpread(): number {
    return this.selectedFurniture()?.spread ?? 1;
  }
  get selectedCount(): number {
    return this.selectedFurniture()?.count ?? 6;
  }

  /** Widen a light set's spacing (each element keeps its size). */
  setSpread(v: number): void {
    const f = this.selectedFurniture();
    if (!f) return;
    this.pushUndo();
    f.spread = Math.max(0.4, Math.min(12, Math.round(v * 100) / 100));
    this.rebuild();
    this.reselect();
    this.onChange?.();
  }

  /** How many elements a light set has (e.g. spotlight count). */
  setCount(v: number): void {
    const f = this.selectedFurniture();
    if (!f) return;
    this.pushUndo();
    f.count = Math.max(1, Math.min(12, Math.round(v)));
    this.rebuild();
    this.reselect();
    this.onChange?.();
  }

  // -- Manual room "zones" ----------------------------------------------------

  get zones(): ZoneDef[] {
    return this.floor().zones ?? [];
  }
  get selectedZone(): ZoneDef | null {
    return this.zones.find((z) => z.id === this.selectedZoneId) ?? null;
  }
  get zonePlacing(): boolean {
    return this.zonePlaceMode;
  }
  /** All entities bound on this floor, for the zone membership checklist. */
  get floorEntities(): { entity_id: string; name: string }[] {
    const seen = new Set<string>();
    const out: { entity_id: string; name: string }[] = [];
    for (const b of this.floor().bindings ?? []) {
      if (b.entity_id && !seen.has(b.entity_id)) {
        seen.add(b.entity_id);
        out.push({ entity_id: b.entity_id, name: b.entity_id });
      }
    }
    return out;
  }

  /** Refresh the edit-mode zone dots (so the user sees where icons sit). */
  private refreshZones(): void {
    this.sm.drawZoneDots(this.zones, this.elevation(), this.selectedZoneId);
  }

  addZone(): void {
    const fl = this.floor();
    if (!fl.zones) fl.zones = [];
    this.pushUndo();
    // Default the icon to the camera focus (already clamped to the active floor)
    // rather than the whole-scene centre, which the origin grid would dominate.
    const t = this.sm.controls.target;
    const id = `z${fl.zones.length}_${Math.floor(performance.now() % 100000)}`;
    fl.zones.push({ id, name: `Room ${fl.zones.length + 1}`, x: Math.round(t.x), z: Math.round(t.z), entities: [] });
    this.selectedZoneId = id;
    this.refreshZones();
    this.onChange?.();
  }

  selectZone(id: string | null): void {
    this.selectedZoneId = id;
    this.zonePlaceMode = false;
    this.refreshZones();
    this.onChange?.();
  }

  setZoneName(id: string, name: string): void {
    const z = this.zones.find((x) => x.id === id);
    if (!z) return;
    z.name = name;
    this.onChange?.();
  }

  deleteZone(id: string): void {
    const fl = this.floor();
    if (!fl.zones) return;
    this.pushUndo();
    fl.zones = fl.zones.filter((z) => z.id !== id);
    if (this.selectedZoneId === id) this.selectedZoneId = null;
    this.refreshZones();
    this.onChange?.();
  }

  toggleZoneDevice(id: string, entityId: string): void {
    const z = this.zones.find((x) => x.id === id);
    if (!z) return;
    this.pushUndo();
    z.entities = z.entities.includes(entityId)
      ? z.entities.filter((e) => e !== entityId)
      : [...z.entities, entityId];
    this.onChange?.();
  }

  /** Arm "place" mode — the next floor tap sets the selected zone's icon spot. */
  beginZonePlace(): void {
    if (!this.selectedZoneId) return;
    this.zonePlaceMode = true;
    this.onMessage?.('Tap the floor to place the room icon');
    this.onChange?.();
  }

  /** Surface material preset for the selected wall (or floor of a room). */
  setSurfaceMaterial(name: string): void {
    const fl = this.floor();
    this.pushUndo();
    if (this.selectedKind === 'wall' && fl.walls?.[this.selectedWall]) {
      fl.walls[this.selectedWall].material = name;
    } else if (this.selectedKind === 'room' && fl.rooms?.[this.selectedRoom]) {
      fl.rooms[this.selectedRoom].material = name;
    } else {
      return;
    }
    this.rebuild();
    this.reselect();
    this.onChange?.();
  }

  get selectedMaterial(): string {
    const fl = this.floor();
    if (this.selectedKind === 'wall') return fl.walls?.[this.selectedWall]?.material ?? 'plain';
    if (this.selectedKind === 'room') return fl.rooms?.[this.selectedRoom]?.material ?? 'plain';
    return 'plain';
  }

  // -- Whole-floor surface appearance (apply to ALL walls / ALL floors) -------
  // Saves tapping every wall/room one by one to set a colour or wallpaper.

  setAllWallsColor(color: string): void {
    const fl = this.floor();
    const shapeRooms = (fl.rooms ?? []).filter((r) => isShapeRoom(r));
    if (!fl.walls?.length && !shapeRooms.length) return;
    this.pushUndo();
    for (const w of fl.walls ?? []) w.color = color;
    // Shape-room perimeter walls are generated from the room, so colour them via
    // the room's wallColor.
    for (const r of shapeRooms) r.wallColor = color;
    this.rebuild();
    this.reselect();
    this.onChange?.();
  }
  setAllWallsMaterial(name: string): void {
    const fl = this.floor();
    const shapeRooms = (fl.rooms ?? []).filter((r) => isShapeRoom(r));
    if (!fl.walls?.length && !shapeRooms.length) return;
    this.pushUndo();
    for (const w of fl.walls ?? []) w.material = name;
    for (const r of shapeRooms) r.wallMaterial = name;
    this.rebuild();
    this.reselect();
    this.onChange?.();
  }
  setAllFloorsColor(color: string): void {
    const fl = this.floor();
    if (!fl.rooms?.length) return;
    this.pushUndo();
    for (const r of fl.rooms) r.color = color;
    this.rebuild();
    this.reselect();
    this.onChange?.();
  }
  setAllFloorsMaterial(name: string): void {
    const fl = this.floor();
    if (!fl.rooms?.length) return;
    this.pushUndo();
    for (const r of fl.rooms) r.material = name;
    this.rebuild();
    this.reselect();
    this.onChange?.();
  }

  /** Set the color of the selected furniture / wall / room. */
  setColor(color: string): void {
    const fl = this.floor();
    this.pushUndo();
    if (this.selectedKind === 'furniture') {
      const f = fl.furniture?.find((x) => x.id === this.selectedId);
      if (f) f.color = color;
    } else if (this.selectedKind === 'wall' && fl.walls?.[this.selectedWall]) {
      fl.walls[this.selectedWall].color = color;
    } else if (this.selectedKind === 'room' && fl.rooms?.[this.selectedRoom]) {
      fl.rooms[this.selectedRoom].color = color;
    } else {
      return;
    }
    this.rebuild();
    this.reselect();
    this.onChange?.();
  }

  deleteSelected(): void {
    const fl = this.floor();
    if (!this.selectedKind) return;
    if (this.selectedKind === 'opening') {
      this.deleteSelectedOpening();
      return;
    }
    this.pushUndo();
    if (this.selectedKind === 'furniture' && this.selectedId) {
      const piece = fl.furniture?.find((x) => x.id === this.selectedId);
      // A door/window model linked to an opening removes that opening too.
      if (piece?.attach) {
        const a = piece.attach;
        const ops = a.kind === 'wall' ? fl.walls?.[a.index]?.openings : fl.rooms?.[a.index]?.openings;
        if (ops && a.opening < ops.length) ops.splice(a.opening, 1);
      }
      fl.furniture = (fl.furniture ?? []).filter((x) => x.id !== this.selectedId);
      fl.bindings = (fl.bindings ?? []).filter((b) => b.anchor_object !== this.selectedId);
    } else if (this.selectedKind === 'wall' && this.selectedWall >= 0) {
      fl.walls?.splice(this.selectedWall, 1);
    } else if (this.selectedKind === 'room' && this.selectedRoom >= 0) {
      fl.rooms?.splice(this.selectedRoom, 1);
    } else {
      return;
    }
    this.clearSelection();
    this.rebuild();
  }

  bindEntity(entityId: string | null): void {
    if (this.selectedKind !== 'furniture' || !this.selectedId) return;
    const fl = this.floor();
    if (!fl.bindings) fl.bindings = [];
    fl.bindings = fl.bindings.filter((b) => b.anchor_object !== this.selectedId);
    if (entityId) {
      fl.bindings.push({ entity_id: entityId, anchor_object: this.selectedId, behavior: 'auto' });
    }
    this.rebuild();
    this.reselect();
    this.onChange?.();
  }

  private elevation(): number {
    return this.plan.floors[this.floorIndex]?.elevation ?? 0;
  }

  private wallHeight(): number {
    return (
      this.plan.floors[this.floorIndex]?.wallHeight ?? this.plan.wallHeight ?? 2.6
    );
  }

  private applySceneEditState(): void {
    this.sm.setEditMode(true, this.elevation());
    this.sm.setGroundHandler({
      click: (p, e) => this.onClick(p, e),
      move: (p) => this.onMove(p),
    });
    this.applyReserve(); // camera on, unless a movable object is selected
    this.refreshZones(); // show hand-placed room icons for this floor
  }

  private onClick(p: THREE.Vector3, e?: PointerEvent): void {
    // Underlay scale calibration: collect two ground points a known distance
    // apart, then ask the host for the real length.
    if (this.calibrating) {
      this.calibPts.push([p.x, p.z]);
      if (this.calibPts.length >= 2) {
        const a = this.calibPts[0];
        const b = this.calibPts[1];
        const d = Math.hypot(b[0] - a[0], b[1] - a[1]);
        this.calibrating = false;
        this.calibPts = [];
        this.onCalibrate?.(d);
      } else {
        this.onMessage?.('Now tap the second point');
      }
      return;
    }
    // Placing a manual room icon: the next tap sets its position.
    if (this.zonePlaceMode) {
      const z = this.selectedZone;
      if (z) {
        this.pushUndo();
        z.x = Math.round(p.x * 10) / 10;
        z.z = Math.round(p.z * 10) / 10;
        this.zonePlaceMode = false;
        this.refreshZones();
        this.onChange?.();
      }
      return;
    }
    if (this.tool === 'furniture') {
      this.placeFurniture(p);
      return;
    }
    if (this.tool === 'arc') {
      const { pt } = this.snapPoint(p.x, p.z);
      this.arcClick(pt);
      return;
    }
    if (this.tool === 'door' || this.tool === 'window' || this.tool === 'opening') {
      this.addOpening(p, this.tool);
      return;
    }
    if (this.tool === 'select') {
      // Tap selects (drag is handled separately: camera, or move a grabbed item).
      const hitF = e ? this.sm.pickFurniture(e) : null;
      if (hitF) {
        this.selectFurniture(hitF.id);
        return;
      }
      // A door/window leaf takes priority over its wall, so it's selectable.
      const hitOp = e ? this.sm.pickOpening(e) : null;
      if (hitOp) {
        this.selectOpening(hitOp.wallIndex, hitOp.openingIndex);
        return;
      }
      const hitW = e ? this.sm.pickWall(e) : null;
      if (hitW) {
        this.selectWall(hitW.index);
        return;
      }
      const hitR = e ? this.sm.pickRoom(e) : null;
      if (hitR) this.selectRoom(hitR.index);
      else this.clearSelection();
      return;
    }
    if (this.tool !== 'wall' && this.tool !== 'floor') return;
    const floorTool = this.tool === 'floor';
    const { pt } = this.snapPoint(p.x, p.z);

    // First tap: drop the start point.
    if (this.chain.length === 0) {
      this.chain = [pt];
      this.renderPreview();
      this.onChange?.();
      return;
    }

    const startPt = this.chain[0];
    const lastPt = this.chain[this.chain.length - 1];

    // Tap the same spot as the last vertex again → finish the run.
    if (lastPt[0] === pt[0] && lastPt[1] === pt[1]) {
      if (floorTool) this.commitFloorChain();
      else this.commitChain(false);
      return;
    }

    // Tap near the start vertex (≥3 points) → close the loop.
    if (this.chain.length >= 2 && Math.hypot(pt[0] - startPt[0], pt[1] - startPt[1]) < 0.25) {
      if (floorTool) this.commitFloorChain();
      else this.commitChain(true);
      return;
    }

    // Continuous chaining: keep adding vertices; commit on finish/close.
    this.chain.push(pt);
    this.renderPreview();
    this.onChange?.();
  }

  /** Commit the in-progress chain as a floor polygon only (no walls). */
  private commitFloorChain(): void {
    const pts = this.chain;
    if (pts.length < 3) {
      this.cancelChain();
      this.onMessage?.('Tap at least 3 corners for a floor');
      return;
    }
    this.pushUndo();
    const fl = this.floor();
    if (!fl.rooms) fl.rooms = [];
    fl.rooms.push({ polygon: pts.map((p) => [p[0], p[1]] as Vec2), color: '#c9c4bb' });
    this.cancelChain();
    this.rebuild();
    this.onChange?.();
    this.onMessage?.('Floor added');
  }

  /** Commit the in-progress wall chain. When `close`, also add the closing wall
   *  back to the start and fill the loop with a floor (room). */
  private commitChain(close: boolean): void {
    const pts = this.chain;
    if (pts.length < 2) {
      this.cancelChain();
      return;
    }
    this.pushUndo();
    const fl = this.floor();
    if (!fl.walls) fl.walls = [];
    for (let i = 0; i < pts.length - 1; i++) {
      fl.walls.push({ start: [pts[i][0], pts[i][1]], end: [pts[i + 1][0], pts[i + 1][1]] });
    }
    if (close) {
      const a = pts[pts.length - 1];
      const b = pts[0];
      fl.walls.push({ start: [a[0], a[1]], end: [b[0], b[1]] });
      if (!fl.rooms) fl.rooms = [];
      fl.rooms.push({ polygon: pts.map((p) => [p[0], p[1]] as Vec2), color: '#c9c4bb' });
    }
    const n = pts.length - 1 + (close ? 1 : 0);
    this.cancelChain();
    this.rebuild();
    this.onChange?.();
    this.onMessage?.(close ? 'Room closed — floor added' : `${n} wall${n === 1 ? '' : 's'} added`);
  }

  // --- Curved (arc) wall tool -------------------------------------------------
  // Three taps: START, END, then a BULGE point the arc passes through. The arc is
  // faceted into a chain of short straight walls (reusing the straight-wall
  // engine — the target plan itself draws its curves as chord segments).

  private arcClick(pt: Vec2): void {
    if (this.chain.length < 2) {
      this.chain.push(pt);
      this.renderPreview();
      this.onChange?.();
      return;
    }
    this.commitArc(this.chain[0], this.chain[1], pt);
  }

  /** Circle through 3 points, faceted into node points along the arc that goes
   *  from A to B through C. Collinear → just [A, B]. */
  private arcNodes(A: Vec2, B: Vec2, C: Vec2): Vec2[] {
    const [ax, az] = A, [bx, bz] = B, [cx, cz] = C;
    const d = 2 * (ax * (bz - cz) + bx * (cz - az) + cx * (az - bz));
    if (Math.abs(d) < 1e-6) return [A, B];
    const a2 = ax * ax + az * az, b2 = bx * bx + bz * bz, c2 = cx * cx + cz * cz;
    const ux = (a2 * (bz - cz) + b2 * (cz - az) + c2 * (az - bz)) / d;
    const uz = (a2 * (cx - bx) + b2 * (ax - cx) + c2 * (bx - ax)) / d;
    const r = Math.hypot(ax - ux, az - uz);
    const angA = Math.atan2(az - uz, ax - ux);
    const angB = Math.atan2(bz - uz, bx - ux);
    const angC = Math.atan2(cz - uz, cx - ux);
    const TAU = Math.PI * 2;
    const norm = (x: number) => ((x % TAU) + TAU) % TAU;
    let sweep = norm(angB - angA);
    if (norm(angC - angA) > sweep) sweep -= TAU; // take the side C is on
    const N = Math.min(40, Math.max(2, Math.round((r * Math.abs(sweep)) / 0.4)));
    const nodes: Vec2[] = [];
    for (let k = 0; k <= N; k++) {
      const t = angA + sweep * (k / N);
      nodes.push([+(ux + r * Math.cos(t)).toFixed(3), +(uz + r * Math.sin(t)).toFixed(3)]);
    }
    return nodes;
  }

  private commitArc(A: Vec2, B: Vec2, C: Vec2): void {
    const nodes = this.arcNodes(A, B, C);
    if (nodes.length < 2) {
      this.cancelChain();
      return;
    }
    this.pushUndo();
    const fl = this.floor();
    if (!fl.walls) fl.walls = [];
    for (let i = 0; i < nodes.length - 1; i++)
      fl.walls.push({ start: [nodes[i][0], nodes[i][1]], end: [nodes[i + 1][0], nodes[i + 1][1]] });
    const n = nodes.length - 1;
    this.cancelChain();
    this.rebuild();
    this.onChange?.();
    this.onMessage?.(`Curved wall — ${n} segment${n === 1 ? '' : 's'}`);
  }

  private onMove(p: THREE.Vector3): void {
    if (this.tool === 'arc') {
      if (this.chain.length === 0) return;
      const r = this.snapPoint(p.x, p.z);
      this.cursor = r.pt;
      this.snapInfo = r;
      this.renderPreview();
      return;
    }
    if ((this.tool !== 'wall' && this.tool !== 'floor') || this.chain.length === 0) return;
    const r = this.snapPoint(p.x, p.z);
    this.cursor = r.pt;
    this.snapInfo = r;
    this.renderPreview();
  }

  /**
   * Snap a candidate point with drawing aids, in priority:
   *  1) join — onto a nearby existing endpoint / chain vertex,
   *  2) angle — snap the segment direction to 15° steps (parallel / perpendicular),
   *  3) length — match a nearby existing wall's length (equal-length walls),
   * plus first-point axis alignment. Disabled when snapEnabled is false (free grid).
   */
  private snapPoint(x: number, z: number): SnapResult {
    const last = this.chain[this.chain.length - 1] as Vec2 | undefined;
    const angTo = (a: Vec2, b: Vec2) =>
      (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
    const make = (pt: Vec2, extra: Partial<SnapResult> = {}): SnapResult => ({
      pt,
      joined: false,
      matchedLen: false,
      parallel: false,
      lengthM: last ? Math.hypot(pt[0] - last[0], pt[1] - last[1]) : 0,
      angleDeg: last ? angTo(last, pt) : 0,
      ...extra,
    });

    // 1) Join to an existing endpoint or chain vertex.
    let best: Vec2 | null = null;
    let bd = VERT_SNAP;
    for (const c of [...this.existingEndpoints(), ...this.chain]) {
      const d = Math.hypot(x - c[0], z - c[1]);
      if (d < bd) {
        bd = d;
        best = c;
      }
    }
    if (best) return make([best[0], best[1]], { joined: true });

    if (!this.snapEnabled) return make([snap(x), snap(z)]);

    // First point of a run: align x/z with an existing endpoint if close.
    if (!last) {
      let px = snap(x);
      let pz = snap(z);
      for (const e of this.existingEndpoints()) {
        if (Math.abs(x - e[0]) < ALIGN_TOL) px = e[0];
        if (Math.abs(z - e[1]) < ALIGN_TOL) pz = e[1];
      }
      return make([px, pz]);
    }

    // 2) Angle snap relative to the previous point.
    const dx = x - last[0];
    const dz = z - last[1];
    const rawLen = Math.hypot(dx, dz);
    if (rawLen < 1e-4) return make([last[0], last[1]]);
    const ang = Math.round(Math.atan2(dz, dx) / ANGLE_STEP) * ANGLE_STEP;

    // 3) Length: match a nearby existing wall length, else grid.
    let finalLen = Math.round(rawLen / SNAP) * SNAP;
    let matchedLen = false;
    let bestDiff = LEN_TOL;
    for (const w of this.floor().walls ?? []) {
      const wl = Math.hypot(w.end[0] - w.start[0], w.end[1] - w.start[1]);
      if (Math.abs(wl - rawLen) < bestDiff) {
        bestDiff = Math.abs(wl - rawLen);
        finalLen = wl;
        matchedLen = true;
      }
    }

    // Keep the exact angle-snapped direction and matched/grid length — do NOT
    // re-grid-snap the coordinates (that would distort both angle and length).
    const pt: Vec2 = [last[0] + Math.cos(ang) * finalLen, last[1] + Math.sin(ang) * finalLen];

    // Parallel test uses the actual committed direction.
    const fang = Math.atan2(pt[1] - last[1], pt[0] - last[0]);
    const parallel = (this.floor().walls ?? []).some((w) => {
      const wa = Math.atan2(w.end[1] - w.start[1], w.end[0] - w.start[0]);
      let diff = Math.abs(wa - fang) % Math.PI;
      if (diff > Math.PI / 2) diff = Math.PI - diff;
      return diff < 0.03;
    });

    return make(pt, { matchedLen, parallel });
  }

  private existingEndpoints(): Vec2[] {
    const out: Vec2[] = [];
    for (const w of this.floor().walls ?? []) {
      out.push([w.start[0], w.start[1]], [w.end[0], w.end[1]]);
    }
    return out;
  }

  private isConnection(pt: Vec2): boolean {
    return this.existingEndpoints().some(
      (e) => Math.hypot(e[0] - pt[0], e[1] - pt[1]) < 1e-3,
    );
  }

  /** Add a door/window opening to the wall nearest the tapped point. */
  private addOpening(p: THREE.Vector3, kind: OpeningKind): void {
    const fl = this.floor();
    this.pushUndo();
    const width = kind === 'door' ? 0.9 : kind === 'opening' ? 1.4 : 1.0;
    // A plain "opening" (passage) is a bare hole with a header — no leaf/glass.
    const bare = kind === 'opening';
    // Nearest segment among BOTH explicit walls and shape-room perimeter edges.
    let bd = 0.6;
    type Hit =
      | { type: 'wall'; wall: WallDef; along: number; len: number }
      | { type: 'room'; room: RoomDef; edge: number; along: number; len: number };
    let best: Hit | null = null;

    const consider = (
      ax: number, az: number, bx: number, bz: number,
      make: (along: number, len: number) => Hit,
    ) => {
      const dx = bx - ax, dz = bz - az;
      const len2 = dx * dx + dz * dz;
      if (len2 < 1e-6) return;
      let t = ((p.x - ax) * dx + (p.z - az) * dz) / len2;
      t = Math.max(0, Math.min(1, t));
      const cx = ax + dx * t, cz = az + dz * t;
      const d = Math.hypot(p.x - cx, p.z - cz);
      if (d < bd) {
        bd = d;
        const len = Math.sqrt(len2);
        best = make(t * len, len);
      }
    };

    for (const w of fl.walls ?? []) {
      consider(w.start[0], w.start[1], w.end[0], w.end[1], (along, len) => ({
        type: 'wall', wall: w, along, len,
      }));
    }
    for (const room of fl.rooms ?? []) {
      if (!isShapeRoom(room)) continue;
      const poly = roomPolygon(room);
      for (let i = 0; i < poly.length; i++) {
        const a = poly[i];
        const b = poly[(i + 1) % poly.length];
        const edge = i;
        consider(a[0], a[1], b[0], b[1], (along, len) => ({
          type: 'room', room, edge, along, len,
        }));
      }
    }

    if (!best) {
      this.onMessage?.('Tap closer to a wall (or room edge)');
      return;
    }
    const hit = best as Hit;
    const position = Math.max(0, Math.min(hit.len - width, hit.along - width / 2));
    const center = position + width / 2;
    let seg: [number, number, number, number];
    if (hit.type === 'wall') {
      if (!hit.wall.openings) hit.wall.openings = [];
      hit.wall.openings.push({ kind, position, width, ...(bare ? { bare } : {}) });
      seg = [hit.wall.start[0], hit.wall.start[1], hit.wall.end[0], hit.wall.end[1]];
    } else {
      if (!hit.room.openings) hit.room.openings = [];
      hit.room.openings.push({ kind, edge: hit.edge, position, width, ...(bare ? { bare } : {}) });
      const poly = roomPolygon(hit.room);
      const a = poly[hit.edge];
      const b = poly[(hit.edge + 1) % poly.length];
      seg = [a[0], a[1], b[0], b[1]];
    }
    // The opening is drawn directly by the builder (a simple frameless leaf /
    // framed window) — no separate model, so nothing overlaps to flicker.
    const [ax, az, bx, bz] = seg;
    const len = Math.hypot(bx - ax, bz - az) || 1;
    const wx = ax + ((bx - ax) / len) * center;
    const wz = az + ((bz - az) / len) * center;
    // Cut through any OTHER coincident (collinear, overlapping) wall / room edge
    // at the same spot, so a door/window placed where two rooms share a wall
    // doesn't stay blocked by the second wall.
    const ang0 = Math.atan2(bz - az, bx - ax);
    const cutSeg = (ax2: number, az2: number, bx2: number, bz2: number): number | null => {
      const dx = bx2 - ax2, dz = bz2 - az2;
      const l2 = dx * dx + dz * dz;
      if (l2 < 1e-6) return null;
      let a2 = Math.atan2(dz, dx);
      // collinear if parallel or anti-parallel
      const da = Math.abs(((a2 - ang0 + Math.PI) % Math.PI));
      if (da > 0.03 && Math.abs(da - Math.PI) > 0.03) return null;
      const l = Math.sqrt(l2);
      const t = ((wx - ax2) * dx + (wz - az2) * dz) / l2;
      const cx = ax2 + dx * t, cz = az2 + dz * t;
      if (Math.hypot(wx - cx, wz - cz) > 0.12) return null; // not on this line
      const along = t * l;
      if (along < 0 || along > l) return null;
      return Math.max(0, Math.min(l - width, along - width / 2));
    };
    for (const w of fl.walls ?? []) {
      if (hit.type === 'wall' && w === hit.wall) continue;
      const pos = cutSeg(w.start[0], w.start[1], w.end[0], w.end[1]);
      if (pos != null) (w.openings ??= []).push({ kind, position: pos, width, ...(bare ? { bare } : {}) });
    }
    for (const room of fl.rooms ?? []) {
      if (!isShapeRoom(room)) continue;
      const poly = roomPolygon(room);
      for (let e = 0; e < poly.length; e++) {
        if (hit.type === 'room' && room === hit.room && e === hit.edge) continue;
        const a = poly[e], b = poly[(e + 1) % poly.length];
        const pos = cutSeg(a[0], a[1], b[0], b[1]);
        if (pos != null) (room.openings ??= []).push({ kind, edge: e, position: pos, width, ...(bare ? { bare } : {}) });
      }
    }
    this.rebuild();
    this.onChange?.();
    const word = kind === 'door' ? 'Door' : kind === 'window' ? 'Window' : 'Opening';
    this.onMessage?.(`${word} added — select the wall to edit/delete it`);
  }

  /** Undo: remove the last committed wall of the current run (and its point). */
  undoPoint(): void {
    // While drawing: step back one vertex. Otherwise remove the last wall.
    if (this.chain.length >= 1) {
      this.chain.pop();
      if (this.chain.length === 0) this.cancelChain();
      else this.renderPreview();
    } else if ((this.floor().walls?.length ?? 0) > 0) {
      this.pushUndo();
      this.floor().walls!.pop();
      this.rebuild();
    }
    this.onChange?.();
  }

  /** Finish the current run: a floor polygon (floor tool) or an open wall run. */
  finishChain(): void {
    if (this.tool === 'arc') {
      this.cancelChain(); // an incomplete arc (needs 3 taps) can't commit
    } else if (this.tool === 'floor') {
      this.commitFloorChain();
    } else if (this.chain.length >= 2) {
      this.commitChain(false);
    } else {
      this.cancelChain();
    }
  }

  cancelChain(): void {
    this.chain = [];
    this.cursor = null;
    this.snapInfo = null;
    if (this.measureLabel) this.measureLabel.sprite.visible = false;
    this.sm.clearPreview();
    this.onChange?.();
  }

  /** Start a fresh blank plan to draw from scratch. */
  loadPlan(plan: FloorPlan): void {
    this.plan = plan;
    this.floorIndex = 0;
    this.cancelChain();
    this.clearSelection();
    this.sm.loadPlan(plan, false); // blank → frame the origin, don't keep far camera
    this.applySceneEditState();
    this.onChange?.();
  }

  private rebuild(): void {
    this.sm.loadPlan(this.plan, true); // keep camera where it is
    this.applySceneEditState();
    this.applyUnderlay();
  }

  // -- Reference image underlay (tracing guide) -------------------------------

  /** Push the current floor's underlay into the scene (or clear it). */
  private applyUnderlay(): void {
    this.sm.setUnderlay(this.floor().underlay ?? null, this.elevation());
  }

  get underlay(): import('../types').Underlay | null {
    return this.floor().underlay ?? null;
  }

  /** Set/replace the reference image for the current floor. */
  setUnderlayImage(image: string, naturalW: number, naturalH: number): void {
    this.pushUndo();
    const fl = this.floor();
    const c = this.sm.controls.target;
    const prev = fl.underlay;
    fl.underlay = {
      image,
      widthM: prev?.widthM ?? 10,
      aspect: naturalW > 0 ? naturalH / naturalW : 1,
      x: prev?.x ?? Math.round(c.x * 100) / 100,
      z: prev?.z ?? Math.round(c.z * 100) / 100,
      rotation: prev?.rotation ?? 0,
      opacity: prev?.opacity ?? 0.6,
    };
    this.applyUnderlay();
    this.onChange?.();
    this.onMessage?.('Reference image added — set its width (m), then trace walls');
  }

  setUnderlayField(field: 'widthM' | 'opacity' | 'rotation' | 'x' | 'z', value: number): void {
    const fl = this.floor();
    if (!fl.underlay || Number.isNaN(value)) return;
    this.pushUndo();
    if (field === 'widthM') fl.underlay.widthM = Math.max(0.2, value);
    else if (field === 'opacity') fl.underlay.opacity = Math.max(0.05, Math.min(1, value));
    else fl.underlay[field] = value;
    this.applyUnderlay();
    this.onChange?.();
  }

  nudgeUnderlay(dx: number, dz: number): void {
    const fl = this.floor();
    if (!fl.underlay) return;
    this.pushUndo();
    fl.underlay.x = Math.round(((fl.underlay.x ?? 0) + dx) * 100) / 100;
    fl.underlay.z = Math.round(((fl.underlay.z ?? 0) + dz) * 100) / 100;
    this.applyUnderlay();
    this.onChange?.();
  }

  /** Begin two-point scale calibration (the next two ground taps). */
  startUnderlayCalibration(): void {
    if (!this.floor().underlay) {
      this.onMessage?.('Add a reference image first');
      return;
    }
    this.cancelChain();
    this.calibrating = true;
    this.calibPts = [];
    this.onMessage?.('Calibrate: tap two points a known distance apart on the image');
  }

  /** Apply a calibration: rescale the underlay so `measured` metres on screen
   *  equals the `real` metres the user entered. */
  applyUnderlayScale(measured: number, real: number): void {
    const fl = this.floor();
    if (!fl.underlay || !(measured > 0) || !(real > 0)) return;
    this.pushUndo();
    fl.underlay.widthM = Math.max(0.2, fl.underlay.widthM * (real / measured));
    this.applyUnderlay();
    this.onChange?.();
    this.onMessage?.(`Scale set — ${real} m across those points`);
  }

  /** Saved reset-view distance multiplier for this project. */
  get cameraDistance(): number {
    return this.plan.cameraDistance ?? 1;
  }

  /** Set the default camera framing distance (persists with the project). */
  setCameraDistance(v: number): void {
    if (!(v > 0)) return;
    this.plan.cameraDistance = Math.round(v * 100) / 100;
    this.sm.setCameraDistance(v);
    this.sm.resetView();
    this.onChange?.();
  }

  removeUnderlay(): void {
    const fl = this.floor();
    if (!fl.underlay) return;
    this.pushUndo();
    delete fl.underlay;
    this.applyUnderlay();
    this.onChange?.();
    this.onMessage?.('Reference image removed');
  }

  // -- Undo / redo ------------------------------------------------------------

  /** Snapshot the plan before a mutating action. Call at the start of each edit. */
  private pushUndo(): void {
    this.undoStack.push(JSON.stringify(this.plan));
    if (this.undoStack.length > this.HISTORY_MAX) this.undoStack.shift();
    this.redoStack = [];
  }

  get canUndo(): boolean {
    return this.undoStack.length > 0;
  }
  get canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  undo(): void {
    if (!this.undoStack.length) return;
    this.redoStack.push(JSON.stringify(this.plan));
    this.plan = JSON.parse(this.undoStack.pop() as string);
    this.restoreHistory();
  }

  redo(): void {
    if (!this.redoStack.length) return;
    this.undoStack.push(JSON.stringify(this.plan));
    this.plan = JSON.parse(this.redoStack.pop() as string);
    this.restoreHistory();
  }

  private restoreHistory(): void {
    this.cancelChain();
    this.clearSelection();
    if (this.floorIndex >= this.plan.floors.length) {
      this.floorIndex = this.plan.floors.length - 1;
    }
    this.sm.loadPlan(this.plan, true);
    this.sm.setActiveFloor(this.floorIndex);
    this.applySceneEditState();
    this.applyUnderlay();
    this.onChange?.();
  }

  // -- Auto floors: fill every closed wall loop with a floor ------------------

  /** Detect the closed regions (faces) formed by the current floor's walls and
   *  add a floor (RoomDef polygon) to each enclosed area that doesn't already
   *  have one. Works for hand-traced walls that weren't closed via the start. */
  autoFloors(): void {
    const fl = this.floor();
    const walls = fl.walls ?? [];
    if (walls.length < 3) {
      this.onMessage?.('Draw or import some walls first');
      return;
    }
    // Weld near-coincident endpoints into one node, so hand-traced corners that
    // don't meet exactly (small gaps) still close into rooms.
    const WELD = 0.2;
    const pts: Vec2[] = [];
    const adj = new Map<number, Set<number>>();
    const nodeId = (p: Vec2): number => {
      for (let i = 0; i < pts.length; i++) {
        if (Math.hypot(pts[i][0] - p[0], pts[i][1] - p[1]) <= WELD) return i;
      }
      pts.push([p[0], p[1]]);
      adj.set(pts.length - 1, new Set());
      return pts.length - 1;
    };
    const edges: Array<[number, number]> = [];
    for (const w of walls) {
      const a = nodeId(w.start as Vec2);
      const b = nodeId(w.end as Vec2);
      if (a !== b) {
        adj.get(a)!.add(b);
        adj.get(b)!.add(a);
        edges.push([a, b]);
      }
    }
    const ang = (from: number, to: number): number =>
      Math.atan2(pts[to][1] - pts[from][1], pts[to][0] - pts[from][0]);
    const TAU = Math.PI * 2;
    const used = new Set<string>();
    const he = (u: number, v: number) => `${u}|${v}`;
    const faces: Vec2[][] = [];
    for (const [a, b] of edges) {
      for (const [u0, v0] of [[a, b], [b, a]] as const) {
        if (used.has(he(u0, v0))) continue;
        const facePts: number[] = [];
        let u = u0;
        let v = v0;
        let guard = 0;
        do {
          used.add(he(u, v));
          facePts.push(u);
          const back = ang(v, u);
          let bestW: number | null = null;
          let bestTurn = Infinity;
          for (const w2 of adj.get(v)!) {
            let turn = back - ang(v, w2);
            turn = ((turn % TAU) + TAU) % TAU; // (0, 2π]
            if (turn < 1e-9) turn = TAU; // going straight back is the last resort
            if (turn < bestTurn) {
              bestTurn = turn;
              bestW = w2;
            }
          }
          if (bestW === null) break;
          u = v;
          v = bestW;
          guard++;
        } while (!(u === u0 && v === v0) && guard < 100000);
        if (facePts.length >= 3) faces.push(facePts.map((i) => pts[i]));
      }
    }
    const area = (poly: Vec2[]): number => {
      let s = 0;
      for (let i = 0; i < poly.length; i++) {
        const a = poly[i];
        const b = poly[(i + 1) % poly.length];
        s += a[0] * b[1] - b[0] * a[1];
      }
      return s / 2;
    };
    const centroid = (poly: Vec2[]): Vec2 => {
      let cx = 0, cz = 0;
      for (const p of poly) {
        cx += p[0];
        cz += p[1];
      }
      return [cx / poly.length, cz / poly.length];
    };
    // Interior faces have positive signed area in this traversal; the outer
    // boundary is negative. Keep reasonably-sized interior faces.
    const interior = faces.filter((f) => area(f) > 0.5);
    if (!interior.length) {
      this.onMessage?.('No closed rooms found — make sure walls connect at corners');
      return;
    }
    const existing = (fl.rooms ?? []).map((r) => {
      const poly = isShapeRoom(r) ? roomPolygon(r) : r.polygon;
      return { c: centroid(poly), a: Math.abs(area(poly)) };
    });
    let added = 0;
    this.pushUndo();
    if (!fl.rooms) fl.rooms = [];
    for (const f of interior) {
      const c = centroid(f);
      const a = Math.abs(area(f));
      const dup = existing.some(
        (e) => Math.hypot(e.c[0] - c[0], e.c[1] - c[1]) < 0.4 && Math.abs(e.a - a) / Math.max(e.a, a) < 0.2,
      );
      if (dup) continue;
      fl.rooms.push({ polygon: f.map((p) => [Math.round(p[0] * 1000) / 1000, Math.round(p[1] * 1000) / 1000] as Vec2), color: '#c9c4bb' });
      existing.push({ c, a });
      added++;
    }
    this.rebuild();
    this.onChange?.();
    this.onMessage?.(added ? `Added ${added} floor${added === 1 ? '' : 's'}` : 'All rooms already have floors');
  }

  // -- Wall cleanup: dedupe + merge collinear overlapping walls ---------------

  /** Merge duplicate / overlapping collinear walls on the current floor into
   *  single segments (so coincident walls don't block openings and corners are
   *  clean). Openings are preserved via world-coordinate remap. */
  mergeWalls(): void {
    const fl = this.floor();
    const walls = fl.walls ?? [];
    if (walls.length < 2) {
      this.onMessage?.('Nothing to merge');
      return;
    }
    this.pushUndo();
    const EPS = 0.08;
    // Describe each wall on its infinite line.
    type Item = { w: WallDef; ang: number; perp: number; t0: number; t1: number };
    const items: Item[] = walls.map((w) => {
      const dx = w.end[0] - w.start[0];
      const dz = w.end[1] - w.start[1];
      let ang = Math.atan2(dz, dx);
      if (ang < 0) ang += Math.PI; // normalize to [0, π)
      const ux = Math.cos(ang), uz = Math.sin(ang);
      const t0 = w.start[0] * ux + w.start[1] * uz;
      const t1 = w.end[0] * ux + w.end[1] * uz;
      const perp = w.start[0] * -uz + w.start[1] * ux; // signed distance from origin
      return { w, ang, perp, t0: Math.min(t0, t1), t1: Math.max(t0, t1) };
    });
    const used = new Array(items.length).fill(false);
    const out: WallDef[] = [];
    for (let i = 0; i < items.length; i++) {
      if (used[i]) continue;
      const group = [items[i]];
      used[i] = true;
      for (let j = i + 1; j < items.length; j++) {
        if (used[j]) continue;
        const a = items[i], b = items[j];
        const sameLine =
          Math.abs(a.ang - b.ang) < 0.03 && Math.abs(a.perp - b.perp) < EPS;
        if (!sameLine) continue;
        // overlap (or touch) with any member already in the group
        const overlaps = group.some((g) => b.t1 >= g.t0 - EPS && b.t0 <= g.t1 + EPS);
        if (overlaps) {
          group.push(b);
          used[j] = true;
        }
      }
      if (group.length === 1) {
        out.push(group[0].w);
        continue;
      }
      // Merge the group into one segment spanning [min t0, max t1] on its line.
      const ang = group[0].ang;
      const ux = Math.cos(ang), uz = Math.sin(ang);
      const tmin = Math.min(...group.map((g) => g.t0));
      const tmax = Math.max(...group.map((g) => g.t1));
      const perp = group[0].perp;
      // A point on the line: origin + perp * normal, then move along u by t.
      const nx = -uz, nz = ux;
      const px = perp * nx, pz = perp * nz;
      const ms: Vec2 = [px + ux * tmin, pz + uz * tmin];
      const me: Vec2 = [px + ux * tmax, pz + uz * tmax];
      const merged: WallDef = {
        start: ms,
        end: me,
        height: group[0].w.height,
        thickness: group[0].w.thickness,
        color: group[0].w.color,
        material: group[0].w.material,
        openings: [],
      };
      for (const g of group) {
        for (const op of g.w.openings ?? []) {
          // opening world-start along its own wall, then param on merged line
          const wdx = g.w.end[0] - g.w.start[0];
          const wdz = g.w.end[1] - g.w.start[1];
          const wlen = Math.hypot(wdx, wdz) || 1;
          const owx = g.w.start[0] + (wdx / wlen) * op.position;
          const owz = g.w.start[1] + (wdz / wlen) * op.position;
          const pos = (owx - ms[0]) * ux + (owz - ms[1]) * uz;
          merged.openings!.push({ ...op, position: Math.max(0, pos) });
        }
      }
      if (!merged.openings!.length) delete merged.openings;
      out.push(merged);
    }
    fl.walls = out;
    this.clearSelection();
    this.rebuild();
    this.onChange?.();
    this.onMessage?.(`Walls merged: ${walls.length} → ${out.length}`);
  }

  private renderPreview(): void {
    this.sm.clearPreview();
    const group = this.sm.previewGroup;
    const elev = this.elevation();
    const h = this.wallHeight();

    // Arc tool: tap 1 = start, tap 2 = end, then move the cursor to bulge the
    // arc; it previews as a faceted chain of green ghost segments.
    if (this.tool === 'arc' && this.chain.length >= 1) {
      const nodes =
        this.chain.length === 2 && this.cursor
          ? this.arcNodes(this.chain[0], this.chain[1], this.cursor)
          : [...this.chain, ...(this.cursor ? [this.cursor] : [])];
      for (const p of nodes) {
        const dot = new THREE.Mesh(
          new THREE.SphereGeometry(0.07, 12, 12),
          new THREE.MeshBasicMaterial({ color: 0x4fd06a }),
        );
        dot.position.set(p[0], elev + 0.06, p[1]);
        group.add(dot);
      }
      for (let i = 0; i < nodes.length - 1; i++) {
        const a = nodes[i];
        const b = nodes[i + 1];
        const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
        if (len < 1e-3) continue;
        const mesh = new THREE.Mesh(
          new THREE.BoxGeometry(len, h, 0.1),
          new THREE.MeshBasicMaterial({ color: 0x4fd06a, transparent: true, opacity: 0.4 }),
        );
        mesh.position.set((a[0] + b[0]) / 2, elev + h / 2, (a[1] + b[1]) / 2);
        mesh.rotation.y = -Math.atan2(b[1] - a[1], b[0] - a[0]);
        group.add(mesh);
      }
      if (this.measureLabel) {
        if (this.chain.length === 2 && this.cursor) {
          const seg = nodes.length - 1;
          const mid = nodes[Math.floor(nodes.length / 2)];
          this.measureLabel.setText(`arc · ${seg} seg`, '#7CFC8A');
          this.measureLabel.setPosition(mid[0], elev + h + 0.4, mid[1]);
          this.measureLabel.sprite.visible = true;
        } else {
          this.measureLabel.sprite.visible = false;
        }
      }
      return;
    }

    const chain = this.cursor ? [...this.chain, this.cursor] : [...this.chain];

    // Vertices. Points that land on an existing wall endpoint get a larger
    // green "connection" node so you can see two walls joining.
    for (const p of chain) {
      const connected = this.isConnection(p);
      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(connected ? 0.12 : 0.07, 12, 12),
        new THREE.MeshBasicMaterial({ color: connected ? 0x4fd06a : 0x44aaff }),
      );
      dot.position.set(p[0], elev + 0.06, p[1]);
      group.add(dot);
    }

    // Segment ghosts. The active (last) segment is tinted green when a drawing
    // aid is engaged (length matched or parallel to an existing wall).
    for (let i = 0; i < chain.length - 1; i++) {
      const a = chain[i];
      const b = chain[i + 1];
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (len < 1e-3) continue;
      const isActive = i === chain.length - 2 && !!this.cursor;
      const aided = isActive && this.snapInfo && (this.snapInfo.matchedLen || this.snapInfo.parallel);
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(len, h, 0.1),
        new THREE.MeshBasicMaterial({
          color: aided ? 0x4fd06a : 0x44aaff,
          transparent: true,
          opacity: aided ? 0.5 : 0.35,
        }),
      );
      const angle = Math.atan2(b[1] - a[1], b[0] - a[0]);
      mesh.position.set((a[0] + b[0]) / 2, elev + h / 2, (a[1] + b[1]) / 2);
      mesh.rotation.y = -angle;
      group.add(mesh);
    }

    // Live measurement label on the active segment.
    if (this.measureLabel) {
      if (this.cursor && this.chain.length >= 1 && this.snapInfo) {
        const a = this.chain[this.chain.length - 1];
        const b = this.cursor;
        const si = this.snapInfo;
        const tags = `${si.parallel ? ' ∥' : ''}${si.matchedLen ? ' =' : ''}`;
        this.measureLabel.setText(
          `${si.lengthM.toFixed(2)}m  ${Math.round(((si.angleDeg % 360) + 360) % 360)}°${tags}`,
          si.matchedLen || si.parallel ? '#7CFC8A' : '#ffffff',
        );
        this.measureLabel.setPosition((a[0] + b[0]) / 2, elev + h + 0.4, (a[1] + b[1]) / 2);
        this.measureLabel.sprite.visible = true;
      } else {
        this.measureLabel.sprite.visible = false;
      }
    }

    // Highlight the closing target when near the start.
    if (this.chain.length >= 2 && this.cursor) {
      const s = this.chain[0];
      if (Math.hypot(this.cursor[0] - s[0], this.cursor[1] - s[1]) < CLOSE_DIST) {
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(0.22, 0.04, 8, 24),
          new THREE.MeshBasicMaterial({ color: 0x4fd06a }),
        );
        ring.rotation.x = Math.PI / 2;
        ring.position.set(s[0], elev + 0.06, s[1]);
        group.add(ring);
      }
    }
  }
}
