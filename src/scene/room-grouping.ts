// ---------------------------------------------------------------------------
// Which room does each device belong to?
//
// This answer is needed in two places: the ACTIVE floor builds a sprite per
// room from it, and the whole-home Обзор needs every floor's rooms at once as
// plain data. Those were two copies of the same ~60 lines, with a comment
// asking whoever touched one to remember the other. They are one function here.
//
// The rule, in order:
//   1) A manual zone OWNS the entities it lists — the user said so, and that
//      overrides geometry. First zone to claim an entity wins it.
//   2) Everything left is placed by its position: the SMALLEST room polygon
//      containing it, so a nook inside a hall wins over the hall.
//   3) Whatever is in no polygon stays `loose` — its own little marker.
//
// Purely a function of its arguments (no scene, no `this`), so the same inputs
// always give the same rooms — which is what makes the two call sites provably
// equal.
// ---------------------------------------------------------------------------

import type { RoomInfo, ZoneDef } from '../types';

/** A room polygon in world XZ, with the floor's elevation and optional photo. */
export interface RoomOutline {
  name?: string;
  poly: [number, number][];
  elev: number;
  bgImage?: string;
}

/** One bound device with its live world position (BindingManager.markerData). */
export interface RoomDevice {
  entity_id: string;
  behavior: string;
  model?: string;
  pos: [number, number, number];
}

export interface RoomGroupingInput {
  devices: RoomDevice[];
  outlines: RoomOutline[];
  zones: ZoneDef[];
  /** Floor elevation — where a zone's hand-placed icon floats. */
  elevation: number;
  /** Live states, ONLY to drop bindings whose entity no longer exists. Pass
   *  undefined before hass has arrived: then nothing is dropped (the scene must
   *  not be blanked during the first render). */
  hass?: { states?: Record<string, unknown> };
  /** Prepended to every room key. The whole-home view qualifies keys by floor
   *  (`f2::`) so they stay unique across floors; the active floor uses ''. */
  keyPrefix?: string;
}

export interface RoomGrouping {
  rooms: RoomInfo[];
  /** Devices in no room at all — drawn as individual device markers. */
  loose: RoomDevice[];
}

/** How high above the floor a room's icon floats (metres). */
export const ROOM_MARKER_Y = 1.6;

export function groupRooms(input: RoomGroupingInput): RoomGrouping {
  const { devices: allDevices, outlines, zones, elevation, hass, keyPrefix = '' } = input;
  const rooms: RoomInfo[] = [];
  const keyOf = (base: string) => `${keyPrefix}${base}#${rooms.length}`;
  /** An entity exists as far as we can tell: either hass hasn't loaded yet, or
   *  it really is in states. An *unavailable* entity is still present — only a
   *  truly removed id is dropped. */
  const present = (id: string) => !hass || !!hass.states?.[id];

  const behaviorOf = new Map(allDevices.map((d) => [d.entity_id, d.behavior]));
  const modelOf = new Map(allDevices.map((d) => [d.entity_id, d.model]));
  const claimed = new Set<string>();

  // 1) Manual zones (hand-placed icons) come first and OWN their listed
  //    entities, overriding the automatic grouping for those devices.
  for (const z of zones) {
    // A zone is an EXPLICIT device list, so keep every entity the user checked —
    // not only the ones bound to a 3D furniture object (behaviorOf). For an
    // unbound entity the behaviour is taken from its domain; the panel filters
    // out any that no longer exist in hass at render time.
    const ents = (z.entities ?? []).filter((id) => !claimed.has(id) && (behaviorOf.has(id) || present(id)));
    if (!ents.length) continue;
    for (const id of ents) claimed.add(id);
    rooms.push({
      key: keyOf(z.id ?? z.name ?? 'zone'),
      id: z.id,
      parentId: z.parentId,
      name: z.name,
      entities: ents.map((id) => ({
        entity_id: id,
        behavior: behaviorOf.get(id) ?? id.split('.')[0],
        model: modelOf.get(id),
      })),
      center: [z.x, elevation + ROOM_MARKER_Y, z.z],
      bgImage: zonePhoto(z, zones, outlines),
      tempSensor: z.tempSensor,
      floorSensor: z.floorSensor,
      humiditySensor: z.humiditySensor,
    });
  }

  // 2) Auto-group the remaining (unclaimed) devices by their room polygon.
  //    A binding whose entity no longer exists in HA (renamed/deleted) is
  //    skipped: an anchored-but-dead entity would otherwise spawn a phantom
  //    "empty room" marker next to the real one.
  const devices = allDevices.filter((d) => !claimed.has(d.entity_id) && present(d.entity_id));
  const perRoom = new Map<number, RoomDevice[]>();
  const loose: RoomDevice[] = [];
  const areas = outlines.map((r) => polyArea(r.poly)); // constant across devices
  for (const d of devices) {
    // If several room polygons contain the device (overlapping/auto-floor
    // rooms), pick the SMALLEST — the most specific room it belongs to.
    let ri = -1;
    let bestArea = Infinity;
    for (let i = 0; i < outlines.length; i++) {
      if (pointInPoly(d.pos[0], d.pos[2], outlines[i].poly) && areas[i] < bestArea) {
        bestArea = areas[i];
        ri = i;
      }
    }
    if (ri >= 0) (perRoom.get(ri) ?? perRoom.set(ri, []).get(ri)!).push(d);
    else loose.push(d);
  }

  for (const [ri, ds] of perRoom) {
    const room = outlines[ri];
    const [cx, cz] = polyCentroid(room.poly);
    rooms.push({
      key: keyOf(room.name ?? 'room'),
      name: room.name,
      entities: ds.map((d) => ({ entity_id: d.entity_id, behavior: d.behavior, model: d.model })),
      center: [cx, room.elev + ROOM_MARKER_Y, cz],
      bgImage: room.bgImage,
    });
  }

  return { rooms, loose };
}

/** A zone's OWN photo always wins. With none set it borrows the photo of the
 *  geometric room it sits in, but ONLY where that room holds exactly one zone.
 *  Rooms often share a floor polygon, and borrowing there is what put one
 *  room's picture behind all its neighbours; a one-zone room is unambiguous, so
 *  plans whose photo was set on the room shape keep working. */
function zonePhoto(z: ZoneDef, zones: ZoneDef[], outlines: RoomOutline[]): string | undefined {
  if (z.bgImage) return z.bgImage;
  let host: RoomOutline | null = null;
  let hostArea = Infinity;
  for (const r of outlines) {
    if (!r.bgImage || !pointInPoly(z.x, z.z, r.poly)) continue;
    const a = polyArea(r.poly); // smallest containing room = most specific
    if (a < hostArea) {
      hostArea = a;
      host = r;
    }
  }
  if (!host) return z.bgImage;
  const inHost = zones.filter((o) => pointInPoly(o.x, o.z, host!.poly)).length;
  // Not exactly one zone in that room: keep what the zone itself had (nothing,
  // or the empty string a cleared field leaves behind) rather than inventing.
  return inHost === 1 ? host.bgImage : z.bgImage;
}

/** Ray-casting point-in-polygon test (polygon points are world [x, z]). */
export function pointInPoly(x: number, z: number, poly: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], zi = poly[i][1];
    const xj = poly[j][0], zj = poly[j][1];
    if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inside = !inside;
  }
  return inside;
}

export function polyCentroid(poly: [number, number][]): [number, number] {
  let x = 0;
  let z = 0;
  for (const p of poly) {
    x += p[0];
    z += p[1];
  }
  return [x / poly.length, z / poly.length];
}

/** Absolute polygon area (shoelace), for picking the most specific room. */
export function polyArea(poly: [number, number][]): number {
  let a = 0;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    a += (poly[j][0] + poly[i][0]) * (poly[j][1] - poly[i][1]);
  }
  return Math.abs(a) / 2;
}
