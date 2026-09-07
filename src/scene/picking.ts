// ---------------------------------------------------------------------------
// Turning a pointer event into something the app can name.
//
// Every pick used to repeat the same six lines — canvas rect, NDC conversion,
// raycaster.setFromCamera, intersect, walk up the parents looking for a userData
// key. They are one method here, so a fix to the tap maths lands everywhere at
// once. The object REGISTRIES (which mesh is wall 3, which is the sofa) are the
// builder's `wallById` / `roomById` / `furnitureById`; this module only finds
// the tag on the way up.
//
// Also here: the two camera-input modes (draw / left-reserved) and the green
// selection box, because they are the same subject — what a pointer does.
// ---------------------------------------------------------------------------

import * as THREE from 'three';
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/** Tags the builder writes on meshes, which a pick walks up the tree to find. */
export type PickTag = 'wallIndex' | 'roomIndex';

export class Picker {
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();

  constructor(
    private readonly camera: THREE.Camera,
    private readonly dom: HTMLElement,
  ) {}

  /** Aim the raycaster at the event and return the canvas rect (the caller
   *  needs it to report the tap position in canvas pixels). */
  private aim(e: PointerEvent): DOMRect {
    const rect = this.dom.getBoundingClientRect();
    this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    return rect;
  }

  /** Tap position in canvas pixels, for anchoring a popup. */
  screenPos(e: PointerEvent): [number, number] {
    const rect = this.dom.getBoundingClientRect();
    return [e.clientX - rect.left, e.clientY - rect.top];
  }

  /** Walk up from a hit object until `find` answers. */
  private up<T>(hits: THREE.Intersection[], find: (o: THREE.Object3D) => T | null): T | null {
    for (const h of hits) {
      let cur: THREE.Object3D | null = h.object;
      while (cur) {
        const v = find(cur);
        if (v !== null && v !== undefined) return v;
        cur = cur.parent;
      }
    }
    return null;
  }

  /** The furniture placement under the pointer (by its `furnitureId`). */
  furniture(e: PointerEvent, group: THREE.Object3D): { id: string; object: THREE.Object3D } | null {
    this.aim(e);
    const hits = this.raycaster.intersectObject(group, true);
    return this.up(hits, (o) => {
      const id = o.userData?.furnitureId as string | undefined;
      return id ? { id, object: o } : null;
    });
  }

  /** A wall sub-group (`wallIndex`) or room floor mesh (`roomIndex`). */
  byTag(e: PointerEvent, group: THREE.Object3D, key: PickTag): { index: number; object: THREE.Object3D } | null {
    this.aim(e);
    const hits = this.raycaster.intersectObject(group, true);
    return this.up(hits, (o) => {
      const v = o.userData?.[key];
      return typeof v === 'number' ? { index: v, object: o } : null;
    });
  }

  /** A door/window leaf — the wall + opening index, so the opening can be
   *  selected directly (without selecting the wall first). */
  opening(
    e: PointerEvent,
    group: THREE.Object3D,
  ): { wallIndex: number; openingIndex: number; object: THREE.Object3D } | null {
    this.aim(e);
    const hits = this.raycaster.intersectObject(group, true);
    return this.up(hits, (o) => {
      const wi = o.userData?.openingWall;
      const oi = o.userData?.openingIndex;
      if (wi === undefined || oi === undefined) return null;
      return { wallIndex: wi as number, openingIndex: oi as number, object: o };
    });
  }

  /** A gizmo handle id (`gizmoHandle`). */
  gizmo(e: PointerEvent, group: THREE.Object3D): string | null {
    if (!group.children.length) return null;
    this.aim(e);
    const hits = this.raycaster.intersectObjects(group.children, true);
    return this.up(hits, (o) => (o.userData?.gizmoHandle as string | undefined) ?? null);
  }

  /** Floating markers are flat sprites: no parent walk, and never recursive. */
  marker(e: PointerEvent, group: THREE.Object3D): THREE.Object3D | null {
    if (!group.children.length) return null;
    this.aim(e);
    const hits = this.raycaster.intersectObjects(group.children, false);
    return hits.length ? hits[0].object : null;
  }

  /** First hit among a flat list of bound anchors (with their children). */
  anchors(e: PointerEvent, anchors: THREE.Object3D[]): THREE.Intersection | null {
    this.aim(e);
    const hits = this.raycaster.intersectObjects(anchors, true);
    return hits.length ? hits[0] : null;
  }

  /** Where the pointer meets the floor plane. */
  ground(e: PointerEvent, plane: THREE.Plane): THREE.Vector3 | null {
    this.aim(e);
    const out = new THREE.Vector3();
    return this.raycaster.ray.intersectPlane(plane, out) ? out : null;
  }
}

/**
 * Camera is ALWAYS fully controllable while editing (left-drag orbit, right
 * pan, wheel zoom, one-finger orbit, two-finger pan/zoom). The editor
 * distinguishes a TAP (tool action) from a DRAG (camera), and suspends the
 * camera only while actually dragging a grabbed object/handle.
 */
export function applyDrawMode(controls: OrbitControls): void {
  controls.enableRotate = true;
  controls.enableZoom = true;
  controls.enablePan = true;
  controls.mouseButtons = {
    LEFT: THREE.MOUSE.ROTATE,
    MIDDLE: THREE.MOUSE.DOLLY,
    RIGHT: THREE.MOUSE.PAN,
  };
  controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN };
}

/**
 * When a movable object is selected, reserve LEFT mouse / one-finger for
 * dragging that object (so it moves instead of orbiting the camera). Camera is
 * still available via right-drag / two fingers.
 */
export function applyLeftReserved(controls: OrbitControls): void {
  controls.mouseButtons = {
    LEFT: null as any,
    MIDDLE: THREE.MOUSE.DOLLY,
    RIGHT: THREE.MOUSE.ROTATE,
  };
  controls.touches = { ONE: null as any, TWO: THREE.TOUCH.DOLLY_PAN };
}

/** The green box around the selected object. Owns its helper's lifetime: a
 *  BoxHelper holds geometry, so dropping the reference without disposing leaked
 *  one per selection change. */
export class SelectionBox {
  private helper?: THREE.BoxHelper;

  constructor(private readonly scene: THREE.Scene) {}

  set(obj: THREE.Object3D | null): void {
    if (this.helper) {
      this.scene.remove(this.helper);
      this.helper.geometry.dispose();
      this.helper = undefined;
    }
    if (obj) {
      this.helper = new THREE.BoxHelper(obj, 0x4fd06a);
      this.scene.add(this.helper);
    }
  }

  /** Keep the box aligned after moving an object live (during a drag). */
  refresh(): void {
    this.helper?.update();
  }
}
