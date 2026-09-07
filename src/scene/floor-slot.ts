// ---------------------------------------------------------------------------
// One floor, in one place.
//
// The scene used to keep six parallel arrays — built geometry, its group, its
// binding manager, its room outlines, its zones, its elevation — all indexed by
// the same `activeFloor` number. Six arrays that must be pushed to in the same
// order, truncated together, and read with the same index: any one of them
// forgotten in a new code path gives a floor whose rooms belong to its
// neighbour, and nothing throws.
// ---------------------------------------------------------------------------

import type * as THREE from 'three';
import type { ZoneDef } from '../types';
import type { BuiltFloor } from './builder';
import type { BindingManager } from './bindings';
import type { RoomOutline } from './room-grouping';

export interface FloorSlot {
  /** Geometry + the id registries (wallById / roomById / furnitureById). */
  built: BuiltFloor;
  /** Shorthand for `built.group` — the scene node shown/hidden per floor. */
  group: THREE.Group;
  bindings: BindingManager;
  /** Room polygons in world XZ, for grouping markers by room. */
  rooms: RoomOutline[];
  /** Hand-placed room zones (explicit device membership). */
  zones: ZoneDef[];
  elevation: number;
}
