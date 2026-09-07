// ---------------------------------------------------------------------------
// The floating icons: one pin per room, one per device that belongs to no room,
// plus the edit-mode dots that show where a hand-placed room icon sits.
//
// They are always on top (depthTest off) and hold a roughly constant on-screen
// size as the camera dollies — Zircon-style tap targets, deliberately easier to
// hit on a wall tablet than the 3D object itself.
//
// Textures are SHARED per icon: a plan with 150 bound entities uses ~6 marker
// textures, not 150. Only the per-sprite material is disposed on a rebuild.
// ---------------------------------------------------------------------------

import * as THREE from 'three';
import type { RoomInfo } from '../types';
import { drawMarkerCanvas, markerIconName } from './icons';
import type { RoomDevice } from './room-grouping';

export interface MarkerHost {
  /** Last known states, for colouring (undefined before hass arrives). */
  hass(): any;
  /** Request one more rendered frame. */
  invalidate(): void;
}

/** Whether a device counts as "active" for a marker to glow — ANY controllable
 *  device that is on / running, not only lights. Covers (open/closed) and locks
 *  have no on/off "running" state, so they don't drive the glow. */
function isDeviceActive(behavior?: string, state?: string): boolean {
  if (!state || state === 'unavailable' || state === 'unknown') return false;
  switch (behavior) {
    case 'light':
    case 'switch':
    case 'input_boolean':
    case 'fan':
      return state === 'on';
    case 'climate':
      return state !== 'off';
    case 'media_player':
      return state === 'playing' || state === 'on';
    default:
      return false;
  }
}

export class MarkerLayer {
  /** Device + room pins (view mode). */
  readonly group = new THREE.Group();
  /** Zone icons shown while editing, so they can be positioned. */
  readonly zoneGroup = new THREE.Group();

  private texCache = new Map<string, THREE.Texture>();
  /** entity_id -> its marker sprite, for O(1) on/off recolor. */
  private byEntity = new Map<string, THREE.Sprite>();
  /** Room keys currently flashing for a water leak — see setAlarmRooms(). */
  private alarmRooms = new Set<string>();
  private alarmTimer: number | null = null;
  private alarmOn = true;
  private selectedKey: string | null = null;

  constructor(private readonly host: MarkerHost) {}

  /** Key of the room whose pin wears the accent colour. */
  setSelected(key: string | null): void {
    this.selectedKey = key;
  }

  get selected(): string | null {
    return this.selectedKey;
  }

  /** A shared (cached) marker texture for a behavior's icon. */
  private texture(behavior: string): THREE.Texture {
    const key = markerIconName(behavior);
    let tex = this.texCache.get(key);
    if (!tex) {
      tex = new THREE.CanvasTexture(drawMarkerCanvas(behavior));
      tex.colorSpace = THREE.SRGBColorSpace;
      this.texCache.set(key, tex);
    }
    return tex;
  }

  private sprite(iconBehavior: string, x: number, y: number, z: number): THREE.Sprite {
    const mat = new THREE.SpriteMaterial({
      map: this.texture(iconBehavior),
      depthTest: false, // always visible, even through walls (Zircon-style)
      depthWrite: false,
      transparent: true,
    });
    const sp = new THREE.Sprite(mat);
    sp.position.set(x, y, z);
    sp.renderOrder = 999;
    this.group.add(sp);
    return sp;
  }

  /** Drop every pin (materials are per-sprite; textures are shared). */
  clear(): void {
    for (const child of [...this.group.children]) {
      (child as THREE.Sprite).material.dispose();
    }
    this.group.clear();
    this.byEntity.clear();
  }

  /**
   * Rebuild the pins: one per room (in the order room grouping produced them,
   * zones first), then one per device that belongs to no room. Returns the room
   * sprites in the same order, so the caller can pair them with its room list.
   */
  build(rooms: RoomInfo[], loose: RoomDevice[]): THREE.Sprite[] {
    this.clear();
    const sprites: THREE.Sprite[] = [];
    for (const room of rooms) {
      const [wx, wy, wz] = room.center;
      const sp = this.sprite('room', wx, wy, wz);
      sp.userData = {
        roomMarker: true,
        roomKey: room.key,
        roomName: room.name,
        roomEntities: room.entities,
        wx,
        wy,
        wz,
      };
      sprites.push(sp);
      for (const e of room.entities) this.byEntity.set(e.entity_id, sp);
    }
    for (const d of loose) {
      const sp = this.sprite(d.behavior, d.pos[0], d.pos[1] + 0.35, d.pos[2]);
      sp.userData = {
        markerEntity: d.entity_id,
        markerBehavior: d.behavior,
        wx: d.pos[0],
        wy: d.pos[1],
        wz: d.pos[2],
      };
      this.byEntity.set(d.entity_id, sp);
    }
    // Colour freshly-built markers from the last known state (on = blue).
    const hass = this.host.hass();
    if (hass) this.refreshAll(hass);
    this.host.invalidate();
    return sprites;
  }

  /**
   * Rooms with a live water-leak alarm: their pins flash red. This is the one
   * thing allowed to override the selection colour — a leak has to be visible
   * from across the room, whatever else the panel is showing.
   *
   * The scene renders on demand, so a flash needs something to drive frames;
   * the timer below does that, and only exists while an alarm is up. Passing an
   * empty list stops it.
   */
  setAlarmRooms(keys: string[]): void {
    const next = new Set(keys);
    const same = next.size === this.alarmRooms.size && [...next].every((k) => this.alarmRooms.has(k));
    if (same) return;
    this.alarmRooms = next;
    if (next.size && this.alarmTimer == null) {
      this.alarmTimer = window.setInterval(() => {
        this.alarmOn = !this.alarmOn;
        this.repaint();
      }, 480);
    } else if (!next.size && this.alarmTimer != null) {
      clearInterval(this.alarmTimer);
      this.alarmTimer = null;
      this.alarmOn = true;
    }
    this.repaint();
  }

  /** Re-colour everything and ask for a frame. */
  repaint(): void {
    const hass = this.host.hass();
    if (hass) this.refreshAll(hass);
    else for (const c of this.group.children) this.paint(c as THREE.Sprite, hass);
    this.host.invalidate();
  }

  /** Tint a marker: the selected room's pin is accent-orange; other room pins
   *  glow soft-amber when any of their lights are on; loose device markers turn
   *  blue when on. Returns true when the colour actually MOVED — the caller uses
   *  that to decide whether a new frame is worth drawing at all. */
  private paint(sp: THREE.Sprite, hass: any): boolean {
    const ud = sp.userData;
    const mat = sp.material as THREE.SpriteMaterial;
    const set = (hex: number): boolean => {
      if (mat.color.getHex() === hex) return false;
      mat.color.setHex(hex);
      return true;
    };
    if (ud.roomMarker) {
      if (ud.roomKey && this.alarmRooms.has(ud.roomKey)) {
        // Red ↔ pale red, so the pin reads as flashing rather than just tinted.
        return set(this.alarmOn ? 0xff3b30 : 0xffd8d5);
      }
      if (ud.roomKey && ud.roomKey === this.selectedKey) return set(0xf3a83c);
      const anyOn = (ud.roomEntities || []).some((e: any) => isDeviceActive(e.behavior, hass?.states?.[e.entity_id]?.state));
      return set(anyOn ? 0xf6c98a : 0xffffff);
    }
    const on = isDeviceActive(ud.markerBehavior, hass?.states?.[ud.markerEntity]?.state);
    return set(on ? 0x4da3ff : 0xffffff);
  }

  /** Re-colour every pin. True when at least one colour moved. */
  refreshAll(hass: any): boolean {
    if (!hass?.states) return false;
    let changed = false;
    for (const c of this.group.children) {
      if (this.paint(c as THREE.Sprite, hass)) changed = true;
    }
    return changed;
  }

  /** Re-colour just the pin holding one entity. True when the colour moved. */
  refreshOne(entityId: string, hass: any): boolean {
    const sp = this.byEntity.get(entityId);
    return sp ? this.paint(sp, hass) : false;
  }

  /** Keep markers a roughly constant on-screen size as the camera dollies. */
  updateScales(cameraPos: THREE.Vector3): void {
    for (const grp of [this.group, this.zoneGroup]) {
      for (const c of grp.children) {
        const d = cameraPos.distanceTo(c.position);
        c.scale.set(THREE.MathUtils.clamp(d * 0.05, 0.3, 1.2), THREE.MathUtils.clamp(d * 0.05, 0.3, 1.2), 1);
      }
    }
  }

  /** Show hand-placed zone icons while editing (so they can be positioned). */
  drawZoneDots(zones: { id: string; x: number; z: number; name?: string }[], y: number, selId?: string | null): void {
    this.clearZoneDots();
    for (const z of zones) {
      const mat = new THREE.SpriteMaterial({
        map: this.texture('room'),
        depthTest: false,
        depthWrite: false,
        transparent: true,
      });
      mat.color.setHex(z.id === selId ? 0x4da3ff : 0xffffff);
      const sp = new THREE.Sprite(mat);
      sp.position.set(z.x, y, z.z);
      sp.renderOrder = 1000;
      this.zoneGroup.add(sp);
    }
  }

  clearZoneDots(): void {
    for (const c of [...this.zoneGroup.children]) (c as THREE.Sprite).material.dispose();
    this.zoneGroup.clear();
  }

  dispose(): void {
    if (this.alarmTimer != null) {
      clearInterval(this.alarmTimer);
      this.alarmTimer = null;
    }
    this.alarmRooms.clear();
    this.clear();
    this.clearZoneDots();
    for (const t of this.texCache.values()) t.dispose();
    this.texCache.clear();
  }
}
