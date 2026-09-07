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
import type { FloorPlan, FloorDef, Vec2, Vec3, RoomDef, RoomShape, OpeningKind, OpeningDef, ZoneDef } from '../types';
import type { SceneManager } from '../scene/scene-manager';
import { defaultY, defaultColor, isWallMount, isLightSet, LIGHT_KEYS } from '../furniture/library';
import { TextLabel } from '../scene/labels';
import { isShapeRoom, roomPolygon } from '../scene/room-shapes';
import { arcNodes, resolveWallMount, sameVertex, snap } from './geometry';
import {
  nearestEndpoint,
  nearestMountPoint,
  snapPoint,
  type SnapResult,
  type WallMountPoint,
} from './snapping';
import { centroid, closedFaces, mergeCollinearWalls, signedArea } from './topology';
import { PlanHistory } from './history';
import { applyGizmo, buildGizmo, gizmoStart, type GizmoStart } from './gizmo';
import { renderPreview } from './preview';
import {
  GLAZING_MODELS,
  WALL_CUT_MODELS,
  addOpening,
  applyGlazing,
  cutForWallModel,
  findGlazingSpot,
} from './openings';

export type EditTool = 'wall' | 'furniture' | 'select' | 'door' | 'window' | 'opening' | 'floor' | 'arc';

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
  private history = new PlanHistory();
  private dragSnapshot: string | null = null;
  private gizmoHandle: string | null = null;
  private gizmoGrab: Vec2 = [0, 0];
  private gizmoRoom0: GizmoStart = { x: 0, z: 0, width: 3, depth: 3, rotation: 0 };
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
    this.dragSnapshot = this.history.snapshot(this.plan);
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
      const v = nearestEndpoint(this.floor().walls ?? [], gp.x, gp.z, 0.45);
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
    if (this.dragSnapshot) this.history.commitIfChanged(this.dragSnapshot, this.plan);
    this.dragSnapshot = null;
    this.onChange?.();
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
    const openings = w?.openings;
    if (!openings) return;
    this.edit(() => {
      openings.splice(index, 1);
    });
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
    const openings = this.currentRoom()?.openings;
    if (!openings) return;
    this.edit(() => {
      openings.splice(index, 1);
    });
  }

  /** Set the selected wall's length, moving its END along the wall direction. */
  setWallLength(len: number): void {
    if (this.selectedKind !== 'wall' || !(len > 0)) return;
    const w = this.floor().walls?.[this.selectedWall];
    if (!w) return;
    this.edit(() => {
      const dx = w.end[0] - w.start[0];
      const dz = w.end[1] - w.start[1];
      const cur = Math.hypot(dx, dz) || 1;
      w.end = [w.start[0] + (dx / cur) * len, w.start[1] + (dz / cur) * len];
    });
  }

  /** Set the selected wall's thickness in meters (e.g. 0.25, 0.38, 0.78). */
  setWallThickness(t: number): void {
    if (this.selectedKind !== 'wall' || !(t > 0)) return;
    const w = this.floor().walls?.[this.selectedWall];
    if (!w) return;
    this.edit(() => {
      w.thickness = t;
    });
  }

  /** Rotate the selected wall to an absolute heading (deg), pivoting on its start
   *  point and keeping its length — so a 45° infill can be typed exactly. */
  setWallAngle(deg: number): void {
    if (this.selectedKind !== 'wall') return;
    const w = this.floor().walls?.[this.selectedWall];
    if (!w) return;
    const len = Math.hypot(w.end[0] - w.start[0], w.end[1] - w.start[1]) || 1;
    const r = (deg * Math.PI) / 180;
    this.edit(() => {
      w.end = [w.start[0] + Math.cos(r) * len, w.start[1] + Math.sin(r) * len];
    });
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
    return this.selectedEntityPart(0);
  }

  /** Entity bound to the selected furniture's `part`-th opening (0 = the whole
   *  piece / first vent). Lets a roof lantern hold one cover per window. */
  selectedEntityPart(part: number): string | null {
    if (this.selectedKind !== 'furniture' || !this.selectedId) return null;
    const b = this.floor().bindings?.find(
      (x) => x.anchor_object === this.selectedId && (x.part ?? 0) === part,
    );
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
      const cut = cutForWallModel(this.floor().walls ?? [], p, cutCfg);
      if (!cut) {
        this.history.dropLast(); // nothing changed — drop the redundant snapshot
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

  /** Врезать окно/дверь из палитры в ближайшую стену. false — стены рядом нет
   *  (тогда карточка говорит человеку, куда тапать). */
  private placeGlazing(p: THREE.Vector3, model: string): boolean {
    const cfg = GLAZING_MODELS[model];
    if (!cfg) return false;
    const walls = this.floor().walls ?? [];
    const spot = findGlazingSpot(walls, p, cfg);
    if (!spot) return false;
    this.pushUndo();
    const openingIndex = applyGlazing(walls, spot, cfg);
    this.rebuild();
    this.selectOpening(spot.wallIndex, openingIndex);
    this.onMessage?.(`${cfg.kind === 'door' ? 'Glass door' : 'Window'} cut into wall`);
    return true;
  }

  /** Ближайшая точка стены (или грани комнаты-фигуры) для посадки навесного
   *  предмета — вся математика в snapping.ts. */
  private nearestWallPoint(px: number, pz: number): WallMountPoint | null {
    return nearestMountPoint(this.floor(), px, pz);
  }

  private resolveWallMount(model: string, p: WallMountPoint): { x: number; z: number; rotation: number } {
    return resolveWallMount(model, p);
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
    this.edit(() => {
      op.variant = variant;
    });
  }

  /** Slide the selected opening (door / window / terrace) LEFT/RIGHT along its
   *  wall by `delta` meters, clamped so it stays fully within the wall span. */
  nudgeOpeningPosition(delta: number): void {
    if (this.selectedKind !== 'opening') return;
    const wall = this.floor().walls?.[this.selectedOpeningWall];
    const op = this.selectedOpeningData;
    if (!wall || !op) return;
    const len = Math.hypot(wall.end[0] - wall.start[0], wall.end[1] - wall.start[1]);
    const w = op.width ?? 0.9;
    this.edit(() => {
      op.position = Math.max(0, Math.min(len - w, (op.position ?? 0) + delta));
    });
  }

  /** Swap a selected opening between door / window / opening. */
  setOpeningKind(kind: OpeningKind): void {
    const op = this.selectedOpeningData;
    if (!op) return;
    this.edit(() => {
      op.kind = kind;
      op.bare = kind === 'opening' ? true : undefined;
      delete op.sill;
      delete op.top; // let the builder pick kind-appropriate defaults
    });
  }

  setOpeningWidth(width: number): void {
    const op = this.selectedOpeningData;
    if (!op || !(width > 0)) return;
    const wall = this.floor().walls?.[this.selectedOpeningWall];
    if (!wall) return;
    const len = Math.hypot(wall.end[0] - wall.start[0], wall.end[1] - wall.start[1]);
    this.edit(() => {
      op.width = Math.min(width, Math.max(0.3, len - op.position));
    });
  }

  deleteSelectedOpening(): void {
    if (this.selectedKind !== 'opening') return;
    const openings = this.floor().walls?.[this.selectedOpeningWall]?.openings;
    if (!openings) return;
    this.edit(() => {
      openings.splice(this.selectedOpeningIndex, 1);
      this.clearSelection();
      this.rebuild();
    }, 'none');
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
    this.edit(() => {
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
    }, 'none');
  }

  setRoomField(field: 'name' | 'width' | 'depth' | 'height' | 'rotation', value: number | string): void {
    const room = this.currentRoom();
    if (!room) return;
    this.edit(() => {
      if (field === 'name') room.name = String(value);
      else {
        // «3,5» с русской раскладки: Number('3,5') это NaN, правка молча терялась.
        const v = parseFloat(String(value).trim().replace(',', '.'));
        if (Number.isNaN(v)) return;
        if (field === 'width') room.width = Math.max(0.5, v);
        else if (field === 'depth') room.depth = Math.max(0.5, v);
        else if (field === 'height') room.height = Math.max(1, v);
        else if (field === 'rotation') room.rotation = v;
      }
    });
  }

  private buildGizmo(): void {
    this.sm.clearGizmo();
    const room = this.currentRoom();
    if (!room || !isShapeRoom(room)) return;
    buildGizmo(this.sm.gizmoGroup, room, this.elevation() + 0.08);
  }

  private beginGizmo(handle: string, e: PointerEvent): boolean {
    const room = this.currentRoom();
    const gp = this.sm.groundIntersect(e);
    if (!room || !gp) return false;
    this.dragMode = 'gizmo';
    this.gizmoHandle = handle;
    this.gizmoGrab = [gp.x, gp.z];
    this.gizmoRoom0 = gizmoStart(room);
    return true;
  }

  private gizmoMoveTo(p: THREE.Vector3): void {
    const room = this.currentRoom();
    if (!room || !this.gizmoHandle) return;
    // Приклеивание к соседям касается только комнат-фигур этого этажа.
    const neighbours = (this.floor().rooms ?? []).filter((r) => isShapeRoom(r));
    applyGizmo(room, this.gizmoHandle, p, this.gizmoGrab, this.gizmoRoom0, this.shiftHeld, neighbours);
    this.rebuild();
    this.reselect();
    this.onChange?.();
  }

  rotateSelected(): void {
    if (this.selectedKind !== 'furniture') return;
    const f = this.floor().furniture?.find((x) => x.id === this.selectedId);
    if (!f) return;
    this.edit(() => {
      f.rotation = ((f.rotation ?? 0) + 45) % 360;
    });
  }

  /** Move the selected furniture up/down along the vertical axis. */
  nudgeHeight(delta: number): void {
    if (this.selectedKind !== 'furniture') return;
    const f = this.floor().furniture?.find((x) => x.id === this.selectedId);
    if (!f) return;
    this.edit(() => {
      f.position[1] = Math.max(0, Math.round((f.position[1] + delta) * 100) / 100);
    });
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
    this.edit(() => {
      const s = f.scale ?? 1;
      const cur: Vec3 = Array.isArray(s) ? [s[0], s[1], s[2]] : [s, s, s];
      cur[axis] = Math.max(0.1, Math.round(v * 100) / 100);
      f.scale = cur;
    });
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
    this.edit(() => {
      f.brightness = Math.max(0, Math.min(1, v));
    });
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
    this.edit(() => {
      f.spread = Math.max(0.4, Math.min(12, Math.round(v * 100) / 100));
    });
  }

  /** How many elements a light set has (e.g. spotlight count). */
  setCount(v: number): void {
    const f = this.selectedFurniture();
    if (!f) return;
    this.edit(() => {
      f.count = Math.max(1, Math.min(12, Math.round(v)));
    });
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
  /** Refresh the edit-mode zone dots (so the user sees where icons sit). */
  private refreshZones(): void {
    this.sm.drawZoneDots(this.zones, this.elevation(), this.selectedZoneId);
  }

  addZone(): void {
    const fl = this.floor();
    if (!fl.zones) fl.zones = [];
    const zones = fl.zones;
    this.edit(() => {
      // Default the icon to the camera focus (already clamped to the active floor)
      // rather than the whole-scene centre, which the origin grid would dominate.
      const t = this.sm.controls.target;
      const id = `z${zones.length}_${Math.floor(performance.now() % 100000)}`;
      zones.push({ id, name: `Room ${zones.length + 1}`, x: Math.round(t.x), z: Math.round(t.z), entities: [] });
      this.selectedZoneId = id;
    }, 'zones');
  }

  selectZone(id: string | null): void {
    this.selectedZoneId = id;
    this.zonePlaceMode = false;
    this.refreshZones();
    this.onChange?.();
  }

  /** Set (or clear, on empty) a manual room's design photo — a URL/`/local/`
   *  path or an uploaded data URL. See ZoneDef.bgImage for why each zone needs
   *  its own picture instead of borrowing the floor polygon's. No rebuild: the
   *  photo is a view-mode backdrop, invisible in the editor. */
  setZoneBgImage(id: string, value: string): void {
    const z = this.zones.find((x) => x.id === id);
    if (!z) return;
    this.edit(() => {
      // Stored exactly as given. Rewriting a File-editor link to /local here threw
      // the original away, so when that guess was wrong the photo was gone for
      // good; the loader tries both instead (see assetCandidates).
      const v = String(value).trim();
      if (v) z.bgImage = v;
      else delete z.bgImage;
    }, 'none');
  }

  setZoneName(id: string, name: string): void {
    const z = this.zones.find((x) => x.id === id);
    if (!z) return;
    z.name = name;
    this.onChange?.();
  }

  /** Make a zone a SUB-ROOM of `parentId` (or top-level when null). The parent
   *  must be a top-level zone (no grandparent) so nesting stays one level deep. */
  setZoneParent(id: string, parentId: string | null): void {
    const z = this.zones.find((x) => x.id === id);
    if (!z || parentId === id) return;
    this.edit(() => {
      if (parentId) {
        z.parentId = parentId;
        // A zone that becomes a parent can't itself stay a sub-room.
        for (const c of this.zones) if (c.parentId === id) delete c.parentId;
      } else {
        delete z.parentId;
      }
    }, 'none');
  }

  /** Bind (or clear, with an empty value) the sensor a room reads for one of its
   *  readouts — air temperature, floor probe or humidity. Empty → no reading is
   *  shown for that metric (blank), no auto-detect. */
  setZoneSensor(id: string, kind: 'temp' | 'floor' | 'humidity', entityId: string): void {
    const z = this.zones.find((x) => x.id === id);
    if (!z) return;
    this.edit(() => {
      const key = kind === 'temp' ? 'tempSensor' : kind === 'floor' ? 'floorSensor' : 'humiditySensor';
      const v = String(entityId).trim();
      if (v) z[key] = v;
      else delete z[key];
    }, 'none');
  }

  deleteZone(id: string): void {
    const fl = this.floor();
    const zones = fl.zones;
    if (!zones) return;
    this.edit(() => {
      fl.zones = zones.filter((z) => z.id !== id);
      if (this.selectedZoneId === id) this.selectedZoneId = null;
    }, 'zones');
  }

  toggleZoneDevice(id: string, entityId: string): void {
    const z = this.zones.find((x) => x.id === id);
    if (!z) return;
    this.edit(() => {
      z.entities = z.entities.includes(entityId)
        ? z.entities.filter((e) => e !== entityId)
        : [...z.entities, entityId];
    }, 'none');
  }

  /** Reorder rooms: move a zone up/down in the floor's zone list. That order
   *  drives the room pills + panel order (zones come before auto-grouped rooms). */
  moveZone(id: string, dir: -1 | 1): void {
    const fl = this.floor();
    const zs = fl.zones;
    if (!zs) return;
    const i = zs.findIndex((z) => z.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= zs.length) return;
    this.edit(() => {
      [zs[i], zs[j]] = [zs[j], zs[i]];
    }, 'zones');
  }

  /** Reorder a device within a room — the room panel lists lights (and other
   *  devices) in this order, so this sets the light order. */
  moveZoneEntity(id: string, entityId: string, dir: -1 | 1): void {
    const z = this.zones.find((x) => x.id === id);
    if (!z) return;
    const es = z.entities;
    const i = es.indexOf(entityId);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= es.length) return;
    this.edit(() => {
      [es[i], es[j]] = [es[j], es[i]];
    }, 'none');
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
    this.edit(() => {
      if (this.selectedKind === 'wall' && fl.walls?.[this.selectedWall]) {
        fl.walls[this.selectedWall].material = name;
      } else if (this.selectedKind === 'room' && fl.rooms?.[this.selectedRoom]) {
        fl.rooms[this.selectedRoom].material = name;
      } else {
        return false;
      }
    });
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
    this.edit(() => {
      for (const w of fl.walls ?? []) w.color = color;
      // Shape-room perimeter walls are generated from the room, so colour them via
      // the room's wallColor.
      for (const r of shapeRooms) r.wallColor = color;
    });
  }
  setAllWallsMaterial(name: string): void {
    const fl = this.floor();
    const shapeRooms = (fl.rooms ?? []).filter((r) => isShapeRoom(r));
    if (!fl.walls?.length && !shapeRooms.length) return;
    this.edit(() => {
      for (const w of fl.walls ?? []) w.material = name;
      for (const r of shapeRooms) r.wallMaterial = name;
    });
  }
  setAllFloorsColor(color: string): void {
    const rooms = this.floor().rooms;
    if (!rooms?.length) return;
    this.edit(() => {
      for (const r of rooms) r.color = color;
    });
  }
  setAllFloorsMaterial(name: string): void {
    const rooms = this.floor().rooms;
    if (!rooms?.length) return;
    this.edit(() => {
      for (const r of rooms) r.material = name;
    });
  }

  /** Set the color of the selected furniture / wall / room. */
  setColor(color: string): void {
    const fl = this.floor();
    this.edit(() => {
      if (this.selectedKind === 'furniture') {
        const f = fl.furniture?.find((x) => x.id === this.selectedId);
        if (f) f.color = color;
      } else if (this.selectedKind === 'wall' && fl.walls?.[this.selectedWall]) {
        fl.walls[this.selectedWall].color = color;
      } else if (this.selectedKind === 'room' && fl.rooms?.[this.selectedRoom]) {
        fl.rooms[this.selectedRoom].color = color;
      } else {
        return false;
      }
    });
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

  bindEntity(entityId: string | null, part = 0): void {
    if (this.selectedKind !== 'furniture' || !this.selectedId) return;
    const fl = this.floor();
    if (!fl.bindings) fl.bindings = [];
    // Replace only the binding for THIS part, so other windows' covers survive.
    fl.bindings = fl.bindings.filter(
      (b) => !(b.anchor_object === this.selectedId && (b.part ?? 0) === part),
    );
    if (entityId) {
      const def: import('../types').BindingDef = { entity_id: entityId, anchor_object: this.selectedId, behavior: 'auto' };
      if (part) def.part = part;
      fl.bindings.push(def);
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

  private commitArc(A: Vec2, B: Vec2, C: Vec2): void {
    const nodes = arcNodes(A, B, C);
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

  /** Куда на самом деле встанет тапнутая точка (магнит — см. snapping.ts). */
  private snapPoint(x: number, z: number): SnapResult {
    return snapPoint(x, z, {
      walls: this.floor().walls ?? [],
      chain: this.chain,
      enabled: this.snapEnabled,
    });
  }

  /** Поставить проём инструментом «дверь / окно / проём» (см. openings.ts). */
  private addOpening(p: THREE.Vector3, kind: OpeningKind): void {
    this.pushUndo();
    if (!addOpening(this.floor(), p, kind)) {
      this.onMessage?.('Tap closer to a wall (or room edge)');
      return;
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
    const u = this.floor().underlay;
    if (!u || Number.isNaN(value)) return;
    this.edit(() => {
      if (field === 'widthM') u.widthM = Math.max(0.2, value);
      else if (field === 'opacity') u.opacity = Math.max(0.05, Math.min(1, value));
      else u[field] = value;
    }, 'underlay');
  }

  nudgeUnderlay(dx: number, dz: number): void {
    const u = this.floor().underlay;
    if (!u) return;
    this.edit(() => {
      u.x = Math.round(((u.x ?? 0) + dx) * 100) / 100;
      u.z = Math.round(((u.z ?? 0) + dz) * 100) / 100;
    }, 'underlay');
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
    this.history.push(this.plan);
  }

  /**
   * Негласный договор каждой правки, записанный явно: снимок для отмены ДО
   * изменения, пересборка сцены и возврат подсветки ПОСЛЕ, и только потом
   * «хозяин, перерисуйся». Он повторялся руками в трёх с лишним десятках мест,
   * и любая новая правка молча работала, забыв половину.
   *
   * `mutate` возвращает `false` — правка передумала: сцену не трогаем и хозяину
   * не сообщаем (снимок при этом остаётся, ровно как было в старом коде).
   *
   * `after` — что делать после изменения:
   *   'rebuild'  пересобрать сцену и вернуть выделение (обычная правка плана);
   *   'zones'    перерисовать точки зон (правка ручных комнат);
   *   'underlay' обновить подложку-кальку;
   *   'none'     ничего, изменение видно только карточке.
   */
  private edit(mutate: () => boolean | void, after: 'rebuild' | 'zones' | 'underlay' | 'none' = 'rebuild'): void {
    this.pushUndo();
    if (mutate() === false) return;
    if (after === 'rebuild') {
      this.rebuild();
      this.reselect();
    } else if (after === 'zones') {
      this.refreshZones();
    } else if (after === 'underlay') {
      this.applyUnderlay();
    }
    this.onChange?.();
  }

  get canUndo(): boolean {
    return this.history.canUndo;
  }
  get canRedo(): boolean {
    return this.history.canRedo;
  }

  undo(): void {
    const prev = this.history.undo(this.plan);
    if (!prev) return;
    this.plan = prev;
    this.restoreHistory();
  }

  redo(): void {
    const next = this.history.redo(this.plan);
    if (!next) return;
    this.plan = next;
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
    // Близкие концы свариваются в один узел, поэтому нарисованные от руки углы
    // с маленькими щелями всё равно закрываются в комнату (см. topology.ts).
    const faces = closedFaces(walls);
    const area = signedArea;
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
    const out = mergeCollinearWalls(walls);
    fl.walls = out;
    this.clearSelection();
    this.rebuild();
    this.onChange?.();
    this.onMessage?.(`Walls merged: ${walls.length} → ${out.length}`);
  }

  private renderPreview(): void {
    this.sm.clearPreview();
    renderPreview(this.sm.previewGroup, {
      arc: this.tool === 'arc',
      chain: this.chain,
      cursor: this.cursor,
      snapInfo: this.snapInfo,
      walls: this.floor().walls ?? [],
      elevation: this.elevation(),
      wallHeight: this.wallHeight(),
      label: this.measureLabel,
    });
  }
}
