// ---------------------------------------------------------------------------
// «Помощник положения» комнаты-фигуры: диск переноса, кольцо поворота и угловые
// ручки размера, плюс математика, которая двигает комнату за ручку.
// ---------------------------------------------------------------------------

import * as THREE from 'three';
import type { RoomDef, Vec2 } from '../types';
import { roomPolygon } from '../scene/room-shapes';
import { rotateVec, snap } from './geometry';

/** Комната на момент захвата ручки: всё считается от этого состояния, а не от
 *  предыдущего кадра, иначе перетаскивание «уползает». */
export interface GizmoStart {
  x: number;
  z: number;
  width: number;
  depth: number;
  rotation: number;
}

export function gizmoStart(room: RoomDef): GizmoStart {
  return {
    x: room.x ?? 0,
    z: room.z ?? 0,
    width: room.width ?? 3,
    depth: room.depth ?? 3,
    rotation: room.rotation ?? 0,
  };
}

/** Построить ручки в `group` (группа предварительно очищается вызывающим). */
export function buildGizmo(group: THREE.Group, room: RoomDef, y: number): void {
  const cx = room.x ?? 0;
  const cz = room.z ?? 0;
  const rot = room.rotation ?? 0;

  const handle = (geo: THREE.BufferGeometry, color: number, pos: Vec2, id: string, flat = true) => {
    const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color, depthTest: false }));
    if (flat) m.rotation.x = -Math.PI / 2;
    m.position.set(pos[0], y, pos[1]);
    m.renderOrder = 1000;
    m.userData.gizmoHandle = id;
    group.add(m);
  };

  // Перенос (диск в центре).
  handle(new THREE.CircleGeometry(0.28, 24), 0x4aa3ff, [cx, cz], 'move');
  // Поворот (кольцо) вынесен за одну из граней.
  const off = rotateVec(0, -((room.depth ?? 3) / 2 + 0.7), rot);
  handle(new THREE.TorusGeometry(0.2, 0.05, 8, 20), 0x4fd06a, [cx + off[0], cz + off[1]], 'rotate');
  // Угловые ручки размера (только у прямоугольника).
  if (room.shape === 'rect') {
    roomPolygon(room).forEach((c, i) => {
      const s = new THREE.Mesh(
        new THREE.SphereGeometry(0.16, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0xffcc44, depthTest: false }),
      );
      s.position.set(c[0], y, c[1]);
      s.renderOrder = 1000;
      s.userData.gizmoHandle = `corner${i}`;
      group.add(s);
    });
  }
}

/**
 * Сдвинуть комнату по тянущемуся указателю. Меняет `room` на месте.
 *
 * @param grab      точка пола, в которой ручку взяли
 * @param start     комната на момент захвата
 * @param freeform  зажат Shift — без автопривязки к соседям и к 15°
 * @param neighbours другие комнаты-фигуры этажа (для приклеивания граней)
 */
export function applyGizmo(
  room: RoomDef,
  handle: string,
  p: { x: number; z: number },
  grab: Vec2,
  start: GizmoStart,
  freeform: boolean,
  neighbours: RoomDef[],
): void {
  if (handle === 'move') {
    room.x = snap(start.x + (p.x - grab[0]));
    room.z = snap(start.z + (p.z - grab[1]));
    if (!freeform) snapRoomToNeighbours(room, neighbours);
    return;
  }
  if (handle === 'rotate') {
    let deg = (Math.atan2(p.z - (room.z ?? 0), p.x - (room.x ?? 0)) * 180) / Math.PI + 90;
    if (!freeform) deg = Math.round(deg / 15) * 15;
    room.rotation = deg;
    return;
  }
  if (handle.startsWith('corner') && room.shape === 'rect') {
    const i = parseInt(handle.slice(6), 10);
    const signs: Vec2[] = [
      [-1, -1],
      [1, -1],
      [1, 1],
      [-1, 1],
    ];
    const [sx, sz] = signs[i] ?? [1, 1];
    // Неподвижный противоположный угол (в мире), в стартовом повороте комнаты.
    const oppLocal: Vec2 = [(-sx * start.width) / 2, (-sz * start.depth) / 2];
    const oppWorld = rotateVec(oppLocal[0], oppLocal[1], start.rotation);
    const oppX = start.x + oppWorld[0];
    const oppZ = start.z + oppWorld[1];
    // Указатель в системе комнаты.
    const rel = rotateVec(p.x - start.x, p.z - start.z, -start.rotation);
    const newW = Math.max(0.5, snap(Math.abs(rel[0] - (-sx * start.width) / 2)));
    const newD = Math.max(0.5, snap(Math.abs(rel[1] - (-sz * start.depth) / 2)));
    // Новый центр — середина между неподвижным углом и тянущимся, в мире.
    const cornerWorldFromOpp = rotateVec(sx * newW, sz * newD, start.rotation);
    room.width = newW;
    room.depth = newD;
    room.x = snap(oppX + cornerWorldFromOpp[0] / 2);
    room.z = snap(oppZ + cornerWorldFromOpp[1] / 2);
  }
}

/** Приклеить грани комнаты, стоящей по осям, к граням соседних таких же.
 *  `rooms` — уже отобранные комнаты-фигуры этого этажа. */
export function snapRoomToNeighbours(room: RoomDef, rooms: RoomDef[]): void {
  if (Math.abs((room.rotation ?? 0) % 360) > 1) return;
  const tol = 0.35;
  const w = room.width ?? 3;
  const d = room.depth ?? 3;
  const L = (room.x ?? 0) - w / 2;
  const T = (room.z ?? 0) - d / 2;
  const others = rooms.filter((r) => r !== room && Math.abs((r.rotation ?? 0) % 360) <= 1);
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
}
