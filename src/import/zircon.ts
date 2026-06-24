// ---------------------------------------------------------------------------
// Zircon3D `spacePlan` importer.
//
// Converts a native Zircon3D project export (the { spacePlan: { plan: { units }}}
// schema) into our FloorPlan. Zircon models a hierarchy of "units":
//   site → building → floor → area(room|divider) → device(furniture/door/light…)
// Each node carries a transform (t = plan position in metres, r.z = rotation in
// degrees) relative to its PARENT, so world coordinates are obtained by walking
// up the parent chain and composing transforms.
//
// We map:
//   • room areas   → a floor polygon + perimeter walls (openings from `parts`)
//   • divider areas→ interior partition walls (openings from `parts`)
//   • device nodes → furniture (model mapped to our library); doors become wall
//                    openings only; ceiling lights carry their HA entity binding
//                    (mon.card.data.switch.uid) → a live BindingDef.
// ---------------------------------------------------------------------------

import type { FloorPlan, FloorDef, WallDef, RoomDef, FurnitureDef, BindingDef, Vec2 } from '../types';

const DEG = Math.PI / 180;
const r3 = (n: number) => Math.round(n * 1000) / 1000;

interface ZUnits {
  [id: string]: any;
}

function rotate(p: Vec2, deg: number): Vec2 {
  if (!deg) return p;
  const a = deg * DEG;
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [p[0] * c - p[1] * s, p[0] * s + p[1] * c];
}

function localTransform(n: any): { t: Vec2; r: number } {
  const tr = n?.position?.data?.transform || n?.placement?.data?.transform || {};
  const t = tr.t || {};
  return { t: [t.x || 0, t.y || 0], r: tr.r?.z ?? 0 };
}

const STOP = new Set(['floor', 'building', 'site']);

/** Compose transforms up the parent chain to get a world-space point. */
function worldPoint(units: ZUnits, id: string, local: Vec2): Vec2 {
  let v = local;
  let cur: string | null | undefined = id;
  let guard = 0;
  while (cur && guard++ < 32) {
    const n: any = units[cur];
    if (!n || STOP.has(n.space?.type)) break;
    const { t, r } = localTransform(n);
    v = rotate(v, r);
    v = [v[0] + t[0], v[1] + t[1]];
    cur = n.space?.parent;
  }
  return v;
}

function worldRot(units: ZUnits, id: string): number {
  let sum = 0;
  let cur: string | null | undefined = id;
  let guard = 0;
  while (cur && guard++ < 32) {
    const m: any = units[cur];
    if (!m || STOP.has(m.space?.type)) break;
    sum += localTransform(m).r;
    cur = m.space?.parent;
  }
  return sum;
}

const norm = (deg: number) => ((deg % 360) + 360) % 360;

// Zircon displays its Y axis horizontally; rotate the whole plan -90° so our
// default top-down view is wide like the Zircon render. Furniture rotation gets
// the matching +90° offset.
const MAP = (p: Vec2): Vec2 => [r3(p[1]), r3(-p[0])];

/** Map a Zircon device (by name + tags) to one of our furniture library keys. */
function mapModel(name: string, tags: string[]): string | null {
  const n = name.toLowerCase();
  if (tags.includes('cls:building.stairs') || n.includes('stair')) return 'stairs';
  if (tags.includes('plm:on-ceiling') || n.includes('ceiling light')) return 'ceiling_light';
  if (n.includes('sofa') || n.includes('couch')) return 'sofa';
  if (n.includes('closet') || n.includes('wardrobe')) return 'wardrobe';
  if (n.includes('shelf') || n.includes('bookcase')) return 'bookshelf';
  if (n.includes('bed')) return 'bed';
  if (n.includes('table')) return 'dining_table';
  if (n.includes('chair')) return 'chair';
  if (n.includes('tv')) return 'tv';
  if (n.includes('fridge') || n.includes('refriger')) return 'fridge';
  if (n.includes('toilet')) return 'toilet';
  if (n.includes('sink')) return 'sink';
  if (n.includes('bath')) return 'bathtub';
  if (n.includes('desk')) return 'desk';
  return 'marker'; // show something for unknown models rather than dropping it
}

function modelY(model: string): number {
  if (model === 'ceiling_light') return 2.65;
  return 0;
}

/** True if the given parsed JSON looks like a Zircon spacePlan export. */
export function isZirconPlan(j: any): boolean {
  return !!(j && j.spacePlan && j.spacePlan.plan && j.spacePlan.plan.units);
}

export function convertZircon(j: any): FloorPlan {
  const units: ZUnits = j.spacePlan.plan.units;
  const ids = Object.keys(units);

  const walls: WallDef[] = [];
  const rooms: RoomDef[] = [];
  const furniture: FurnitureDef[] = [];
  const bindings: BindingDef[] = [];

  let floorName = 'Floor 1';
  for (const id of ids) {
    if (units[id].space?.type === 'floor') {
      floorName = units[id].info?.name || floorName;
      break;
    }
  }

  for (const id of ids) {
    const n = units[id];
    const ty = n.space?.type;

    if (ty === 'area') {
      const sd = n.shape?.data;
      const stype = sd?.type;
      const pts = sd?.points || [];

      if (stype === 'room' && pts.length >= 3) {
        const world = pts.map((p: any) => MAP(worldPoint(units, id, [p.p.x, p.p.y])));
        rooms.push({
          polygon: world.map((w: Vec2) => [w[0], w[1]] as Vec2),
          color: '#c9c4bb',
        });
        // Openings, grouped by the edge they sit on.
        const parts = sd?.parts || {};
        const byEdge: Record<string, any[]> = {};
        for (const k in parts) {
          const d = parts[k].data;
          (byEdge[d.edge] ??= []).push(d);
        }
        for (let i = 0; i < world.length; i++) {
          const a = world[i];
          const b = world[(i + 1) % world.length];
          const eid = `edge:${pts[i].i}-${pts[(i + 1) % pts.length].i}`;
          const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
          const ops = (byEdge[eid] || []).map((d) => ({
            kind: 'door' as const,
            position: Math.max(0, Math.min(len, d.start)),
            width: Math.max(0.3, d.end - d.start),
          }));
          walls.push({
            start: [r3(a[0]), r3(a[1])],
            end: [r3(b[0]), r3(b[1])],
            thickness: 0.12,
            openings: ops.length ? ops : undefined,
          });
        }
      } else if (stype === 'divider' && pts.length >= 2) {
        const a = MAP(worldPoint(units, id, [pts[0].p.x, pts[0].p.y]));
        const b = MAP(worldPoint(units, id, [pts[1].p.x, pts[1].p.y]));
        const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
        const parts = sd?.parts || {};
        const ops = Object.keys(parts).map((k) => {
          const d = parts[k].data;
          return {
            kind: 'door' as const,
            position: Math.max(0, Math.min(len, d.start)),
            width: Math.max(0.3, d.end - d.start),
          };
        });
        walls.push({
          start: [r3(a[0]), r3(a[1])],
          end: [r3(b[0]), r3(b[1])],
          thickness: 0.1,
          openings: ops.length ? ops : undefined,
        });
      }
    } else if (ty === 'device') {
      const name = n.info?.name || '';
      const tags: string[] = n.info?.tags || [];
      if (tags.includes('cls:building.door')) continue; // opening already cut into the wall
      const model = mapModel(name, tags);
      if (!model) continue;
      const o = MAP(worldPoint(units, id, [0, 0]));
      const rz = worldRot(units, id);
      furniture.push({
        model,
        position: [o[0], modelY(model), o[1]],
        rotation: norm(-rz + 90),
        id,
      });
      const uid = n.mon?.card?.data?.switch?.uid;
      if (uid) bindings.push({ entity_id: uid, anchor_object: id, behavior: 'light' });
    }
  }

  const floor: FloorDef = {
    name: floorName,
    elevation: 0,
    wallHeight: 2.7,
    walls,
    rooms,
    furniture,
    bindings,
  };
  return {
    name: j.spacePlan.info?.name || 'Imported plan',
    wallHeight: 2.7,
    floors: [floor],
  };
}
