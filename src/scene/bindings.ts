// ---------------------------------------------------------------------------
// Entity binding manager.
//   - Resolves each BindingDef to a scene anchor (a furniture object or a point).
//   - Reflects live state into the scene (emissive materials, point lights,
//     floating text, lock/sensor colors) WITHOUT re-rendering the whole scene —
//     only the changed objects are touched, so frame rate holds with hundreds
//     of bound entities.
//   - Maps taps to the right HA service call (or fires a more-info event).
// ---------------------------------------------------------------------------

import * as THREE from 'three';
import type {
  BindingDef,
  BindingBehavior,
  HomeAssistant,
  HassEntity,
} from '../types';
import type { BuiltFloor } from './builder';
import { TextLabel } from './labels';

interface ActiveBinding {
  def: BindingDef;
  behavior: BindingBehavior;
  anchor: THREE.Object3D | null;
  worldPos: THREE.Vector3;
  /** Meshes whose material should toggle emissive (lights/switches/media). */
  emissiveMeshes: THREE.Mesh[];
  pointLight?: THREE.PointLight;
  label?: TextLabel;
  lastState?: string;
  /** Domain-default fan/cover spin handle. */
  spin?: THREE.Object3D;
  /** Curtain pivot groups to slide open/closed (cover behavior). */
  curtains?: THREE.Object3D[];
  /** Target open fraction for curtains (0 closed .. 1 open). */
  coverOpen?: number;
}

const TOGGLE_DOMAINS = new Set(['light', 'switch', 'fan', 'cover', 'media_player']);

function domainOf(entityId: string): string {
  return entityId.split('.')[0];
}

function behaviorFor(def: BindingDef): BindingBehavior {
  if (def.behavior && def.behavior !== 'auto') return def.behavior;
  return domainOf(def.entity_id) as BindingBehavior;
}

/** Stop a group's meshes from casting shadows. Used for animated pieces (a
 *  spinning fan, a sliding curtain): the shadow map is only re-rendered on scene
 *  changes for performance, so a moving caster would otherwise leave a frozen,
 *  wrong shadow — and skipping it is cheaper too. */
function disableShadowCasting(root: THREE.Object3D | null | undefined): void {
  root?.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) (o as THREE.Mesh).castShadow = false;
  });
}

function collectEmissive(root: THREE.Object3D): THREE.Mesh[] {
  const out: THREE.Mesh[] = [];
  root.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.isMesh) {
      // Prefer meshes explicitly named "emissive"; else take all.
      if (m.name === 'emissive') out.unshift(m);
      else out.push(m);
    }
  });
  // If any explicitly-named emissive mesh exists, use only those.
  const named = out.filter((m) => m.name === 'emissive');
  return named.length ? named : out;
}

function collectByName(root: THREE.Object3D, name: string): THREE.Object3D[] {
  const out: THREE.Object3D[] = [];
  root.traverse((o) => {
    if (o.name === name) out.push(o);
  });
  return out;
}

/**
 * Default cap on real THREE.PointLights per floor. Every extra point light makes
 * every material's shader loop once more per pixel, so a plan that binds ~150
 * lights would otherwise grind (or fail to compile) on a weak GPU. Past the cap,
 * lights still glow via their emissive material — they just don't cast a surface
 * halo. The scene passes a tier-specific cap (fewer on weak devices).
 */
const MAX_POINT_LIGHTS = 16;

export class BindingManager {
  private bindings: ActiveBinding[] = [];
  private root: THREE.Group;
  /** entity_id -> bindings (one entity may drive several anchors). */
  private byEntity = new Map<string, ActiveBinding[]>();
  private pointLightsUsed = 0;
  private maxLights: number;

  constructor(root: THREE.Group, maxLights: number = MAX_POINT_LIGHTS) {
    this.root = root;
    this.maxLights = maxLights;
  }

  /** Register all bindings for a freshly built floor. */
  register(floor: BuiltFloor, defs: BindingDef[]): void {
    for (const def of defs) {
      const behavior = behaviorFor(def);
      let anchor: THREE.Object3D | null = null;
      const worldPos = new THREE.Vector3();

      if (def.anchor_object && floor.furnitureById.has(def.anchor_object)) {
        anchor = floor.furnitureById.get(def.anchor_object)!;
        anchor.getWorldPosition(worldPos);
      } else if (def.anchor) {
        worldPos.set(def.anchor[0], def.anchor[1], def.anchor[2]);
        worldPos.y += floor.group.position.y;
      } else {
        // No anchor — center of floor, raised a bit.
        floor.bbox.getCenter(worldPos);
        worldPos.y = floor.group.position.y + 1.5;
      }

      const ab: ActiveBinding = {
        def,
        behavior,
        anchor,
        worldPos,
        emissiveMeshes: anchor ? collectEmissive(anchor) : [],
        curtains: anchor ? collectByName(anchor, 'curtainPivot') : [],
      };

      this.setupVisual(ab, floor);
      this.bindings.push(ab);
      if (!this.byEntity.has(def.entity_id)) this.byEntity.set(def.entity_id, []);
      this.byEntity.get(def.entity_id)!.push(ab);

      if (anchor) anchor.userData.bindingEntity = def.entity_id;
    }
  }

  private setupVisual(ab: ActiveBinding, floor: BuiltFloor): void {
    const { behavior, worldPos } = ab;

    if (behavior === 'light') {
      // Cap real point lights (each one makes every material's shader loop once
      // more per pixel). Anchored lights fall back to their emissive glow past
      // the cap; an anchorless light has no mesh to glow, so it always keeps its
      // point light (and isn't counted — anchorless lights are rare).
      const hasEmissiveFallback = ab.emissiveMeshes.length > 0;
      if (!hasEmissiveFallback || this.pointLightsUsed < this.maxLights) {
        const light = new THREE.PointLight(0xfff1d0, 0, 8, 2);
        light.position.copy(worldPos);
        light.castShadow = false;
        this.root.add(light);
        ab.pointLight = light;
        if (hasEmissiveFallback) this.pointLightsUsed++;
      }
    }

    if (
      behavior === 'climate' ||
      behavior === 'sensor' ||
      behavior === 'binary_sensor' ||
      behavior === 'lock' ||
      behavior === 'media_player' ||
      behavior === 'label'
    ) {
      const label = new TextLabel(1.2);
      const lift = ab.anchor ? 0.6 : 0;
      label.setPosition(worldPos.x, worldPos.y + lift + 0.4, worldPos.z);
      this.root.add(label.sprite);
      floor.labels.push(label);
      ab.label = label;
    }

    if (behavior === 'fan') {
      ab.spin = ab.anchor ?? undefined;
      disableShadowCasting(ab.anchor); // a spinning fan can't leave a frozen shadow
    }

    // Sliding curtain panels: same reasoning — don't cast a shadow that would
    // freeze mid-slide while the panel visibly moves.
    if (ab.curtains && ab.curtains.length) {
      for (const piv of ab.curtains) disableShadowCasting(piv);
    }
  }

  /** Apply current HA state to all bindings. Only changed entities do work. */
  update(hass: HomeAssistant): void {
    for (const ab of this.bindings) {
      const ent = hass.states[ab.def.entity_id];
      this.applyState(ab, ent);
    }
  }

  /** Targeted update for a single entity (used on subscribed state changes). */
  updateEntity(entityId: string, hass: HomeAssistant): void {
    const list = this.byEntity.get(entityId);
    if (!list) return;
    const ent = hass.states[entityId];
    for (const ab of list) this.applyState(ab, ent);
  }

  private applyState(ab: ActiveBinding, ent?: HassEntity): void {
    const state = ent?.state ?? 'unavailable';
    const friendly =
      ab.def.label ?? ent?.attributes?.friendly_name ?? ab.def.entity_id;

    switch (ab.behavior) {
      case 'light': {
        const on = state === 'on';
        const bright = (ent?.attributes?.brightness ?? 255) / 255;
        if (ab.pointLight) ab.pointLight.intensity = on ? 2.5 * bright : 0;
        this.setEmissive(ab, on ? 0xfff1d0 : 0x000000, on ? bright : 0);
        break;
      }
      case 'switch':
      case 'media_player': {
        const on = state === 'on' || state === 'playing' || state === 'home';
        this.setEmissive(ab, on ? 0x4fd06a : 0x000000, on ? 0.6 : 0);
        if (ab.label && ab.behavior === 'media_player') {
          ab.label.setText(state, on ? '#7CFC8A' : '#cccccc');
        }
        break;
      }
      case 'climate': {
        const cur = ent?.attributes?.current_temperature;
        const target = ent?.attributes?.temperature;
        const txt =
          cur != null
            ? `${cur}°${target != null ? ` → ${target}°` : ''}`
            : state;
        ab.label?.setText(txt, '#9ad0ff');
        break;
      }
      case 'sensor':
      case 'label': {
        const unit = ent?.attributes?.unit_of_measurement ?? '';
        ab.label?.setText(`${friendlyShort(friendly)}: ${state}${unit}`, '#ffe7a0');
        break;
      }
      case 'binary_sensor': {
        const on = state === 'on';
        ab.label?.setText(`${friendlyShort(friendly)}: ${on ? 'ON' : 'off'}`,
          on ? '#ff8080' : '#bbbbbb');
        this.setEmissive(ab, on ? 0xff5555 : 0x000000, on ? 0.5 : 0);
        break;
      }
      case 'lock': {
        const locked = state === 'locked';
        ab.label?.setText(locked ? '🔒 locked' : '🔓 unlocked',
          locked ? '#7CFC8A' : '#ff8080');
        this.setEmissive(ab, locked ? 0x4fd06a : 0xff5555, 0.5);
        break;
      }
      case 'cover': {
        // Use position attr (0-100) if present, else open/closed.
        const pos = ent?.attributes?.current_position;
        const open = typeof pos === 'number' ? pos / 100
          : (state === 'open' || state === 'opening') ? 1 : 0;
        if (ab.curtains && ab.curtains.length) {
          ab.coverOpen = open; // curtains slide in animate()
        } else {
          this.setEmissive(ab, open > 0.5 ? 0x4fd06a : 0x000000, open > 0.5 ? 0.4 : 0);
        }
        break;
      }
      case 'fan': {
        ab.spin = state === 'on' ? ab.anchor ?? undefined : undefined;
        break;
      }
    }
    ab.lastState = state;
  }

  private setEmissive(ab: ActiveBinding, color: number, intensity: number): void {
    for (const mesh of ab.emissiveMeshes) {
      const mat = mesh.material as THREE.MeshStandardMaterial;
      if (!mat || !('emissive' in mat)) continue;
      mat.emissive.setHex(color);
      mat.emissiveIntensity = intensity;
      mat.needsUpdate = false; // color/intensity changes don't need recompile
    }
  }

  /** Per-frame animation for fans + sliding curtains. Returns true if anything
   *  is still moving, so the render loop knows a redraw is needed this frame. */
  animate(delta: number): boolean {
    let active = false;
    for (const ab of this.bindings) {
      if (ab.behavior === 'fan' && ab.spin) {
        ab.spin.rotation.y += delta * 6;
        active = true;
      }
      if (ab.curtains && ab.curtains.length && ab.coverOpen !== undefined) {
        // Closed = scale.x 1 (full span); open = 0.16 (gathered to the side).
        const target = 1 - 0.84 * ab.coverOpen;
        const k = Math.min(1, delta * 4); // smooth slide
        for (const piv of ab.curtains) {
          if (Math.abs(target - piv.scale.x) > 0.001) {
            piv.scale.x += (target - piv.scale.x) * k;
            active = true;
          } else {
            piv.scale.x = target; // settled — snap exactly, stop animating
          }
        }
      }
    }
    return active;
  }

  /** The furniture Object3Ds entities are bound to. These must stay LIVE (light
   *  glow, fan spin, curtain slide, and the markers that anchor to them), so the
   *  view-mode geometry merge keeps them separate; everything else can merge. */
  anchorObjects(): THREE.Object3D[] {
    const out: THREE.Object3D[] = [];
    for (const ab of this.bindings) if (ab.anchor) out.push(ab.anchor);
    return out;
  }

  /** Snap curtain/blind panels straight to their current cover target (no
   *  slide). Called when a floor becomes active so an already-open curtain shows
   *  open immediately instead of sliding from closed on entry. */
  settleCovers(): void {
    for (const ab of this.bindings) {
      if (ab.curtains && ab.curtains.length && ab.coverOpen !== undefined) {
        const target = 1 - 0.84 * ab.coverOpen;
        for (const piv of ab.curtains) piv.scale.x = target;
      }
    }
  }

  /**
   * Given a clicked Object3D, walk up to find a bound anchor and return the
   * action to perform. Returns null if the object isn't bound.
   */
  resolveClick(obj: THREE.Object3D): { entity_id: string; behavior: BindingBehavior } | null {
    let cur: THREE.Object3D | null = obj;
    while (cur) {
      const eid = cur.userData?.bindingEntity as string | undefined;
      if (eid) {
        const ab = this.byEntity.get(eid)?.[0];
        return { entity_id: eid, behavior: ab?.behavior ?? 'auto' };
      }
      cur = cur.parent;
    }
    return null;
  }

  /** All anchor objects, for raycasting. */
  get anchors(): THREE.Object3D[] {
    return this.bindings.map((b) => b.anchor).filter((a): a is THREE.Object3D => !!a);
  }

  /** One floating-marker descriptor per bound entity (live anchor position).
   *  Covers (curtains) that sit close together collapse to a single marker so
   *  2-3 stacked curtains don't spawn an overlapping pile of icons. */
  markerData(): { entity_id: string; behavior: BindingBehavior; pos: [number, number, number] }[] {
    const out: { entity_id: string; behavior: BindingBehavior; pos: [number, number, number] }[] = [];
    const seen = new Set<string>();
    const coverPts: THREE.Vector3[] = [];
    const p = new THREE.Vector3();
    for (const ab of this.bindings) {
      if (seen.has(ab.def.entity_id)) continue;
      if (ab.anchor) ab.anchor.getWorldPosition(p);
      else p.copy(ab.worldPos);
      if (ab.behavior === 'cover') {
        if (coverPts.some((c) => c.distanceTo(p) <= 1.6)) {
          seen.add(ab.def.entity_id);
          continue;
        }
        coverPts.push(p.clone());
      }
      seen.add(ab.def.entity_id);
      out.push({ entity_id: ab.def.entity_id, behavior: ab.behavior, pos: [p.x, p.y, p.z] });
    }
    return out;
  }

  /** Bound entities whose anchor is within `radius` of a world point — so a tap
   *  near several stacked curtains/lights surfaces all of them. */
  near(point: THREE.Vector3, radius: number): { entity_id: string; behavior: BindingBehavior }[] {
    const out: { entity_id: string; behavior: BindingBehavior }[] = [];
    const seen = new Set<string>();
    const p = new THREE.Vector3();
    for (const ab of this.bindings) {
      if (!ab.anchor || seen.has(ab.def.entity_id)) continue;
      ab.anchor.getWorldPosition(p);
      if (p.distanceTo(point) <= radius) {
        seen.add(ab.def.entity_id);
        out.push({ entity_id: ab.def.entity_id, behavior: ab.behavior });
      }
    }
    return out;
  }

  dispose(): void {
    for (const ab of this.bindings) {
      if (ab.pointLight) this.root.remove(ab.pointLight);
    }
    this.bindings = [];
    this.byEntity.clear();
  }
}

/** Map a click to a service call. Returns null if it should open more-info. */
export function clickToService(
  entityId: string,
  behavior: BindingBehavior,
): { domain: string; service: string; data: Record<string, any> } | null {
  const domain = domainOf(entityId);
  const data = { entity_id: entityId };
  switch (behavior) {
    case 'light':
      return { domain: 'light', service: 'toggle', data };
    case 'switch':
      return { domain: 'switch', service: 'toggle', data };
    case 'fan':
      return { domain: 'fan', service: 'toggle', data };
    case 'cover':
      return { domain: 'cover', service: 'toggle', data };
    case 'media_player':
      return { domain: 'media_player', service: 'media_play_pause', data };
    case 'lock':
      // Toggle handled by caller (needs current state); fall through to more-info.
      return null;
    default:
      // sensors/climate/etc. → open more-info
      if (TOGGLE_DOMAINS.has(domain)) {
        return { domain, service: 'toggle', data };
      }
      return null;
  }
}

function friendlyShort(name: string): string {
  return name.length > 18 ? name.slice(0, 16) + '…' : name;
}
