// ---------------------------------------------------------------------------
// Furniture resolution: built-in procedural pieces OR a custom .glb file.
// ---------------------------------------------------------------------------

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { buildFurniture } from './library';
import type { FurnitureDef, Vec3 } from '../types';

const gltfLoader = new GLTFLoader();
// Cache loaded GLB scenes by URL so repeated placements clone instead of refetch.
const glbCache = new Map<string, Promise<THREE.Group>>();

function loadGlb(url: string): Promise<THREE.Group> {
  let p = glbCache.get(url);
  if (!p) {
    p = new Promise<THREE.Group>((resolve, reject) => {
      gltfLoader.load(
        url,
        (gltf) => {
          gltf.scene.traverse((o) => {
            o.castShadow = true;
            o.receiveShadow = true;
          });
          resolve(gltf.scene);
        },
        undefined,
        (err) => reject(err),
      );
    });
    glbCache.set(url, p);
  }
  return p;
}

function applyTransform(obj: THREE.Object3D, def: FurnitureDef): void {
  obj.position.set(def.position[0], def.position[1], def.position[2]);
  if (def.rotation) obj.rotation.y = THREE.MathUtils.degToRad(def.rotation);
  const s = def.scale ?? 1;
  if (Array.isArray(s)) obj.scale.set(s[0], s[1], s[2]);
  else obj.scale.setScalar(s as number);
}

/**
 * `scene.clone(true)` shares geometry + material instances with the cached
 * source by reference, so disposing a placement (on scene rebuild) would free
 * GPU buffers still used by the cache and other placements. Give every cloned
 * placement its OWN geometry + material so disposal is safe, and apply an
 * optional tint.
 */
function ownResources(root: THREE.Object3D, color?: string): void {
  const c = color ? new THREE.Color(color) : null;
  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    if (mesh.geometry) mesh.geometry = mesh.geometry.clone();
    if (mesh.material) {
      if (Array.isArray(mesh.material)) {
        mesh.material = mesh.material.map((m) => {
          const cl = m.clone() as THREE.MeshStandardMaterial;
          if (c && cl.color) cl.color.multiply(c);
          return cl;
        });
      } else {
        const cl = (mesh.material as THREE.MeshStandardMaterial).clone();
        if (c && cl.color) cl.color.multiply(c);
        mesh.material = cl;
      }
    }
  });
}

/**
 * Resolve a furniture definition to a positioned Object3D.
 * Built-ins return synchronously; .glb resolves async (a placeholder marker is
 * returned immediately and replaced in-place when the model loads).
 */
export function resolveFurniture(def: FurnitureDef): THREE.Object3D {
  if (def.glb) {
    const container = new THREE.Group();
    applyTransform(container, def);
    container.userData.furnitureId = def.id;
    // Placeholder while loading.
    const placeholder = buildFurniture('marker', def.color);
    container.add(placeholder);
    loadGlb(def.glb)
      .then((scene) => {
        const clone = scene.clone(true);
        ownResources(clone, def.color); // independent geometry/material per placement
        container.remove(placeholder);
        container.add(clone);
      })
      .catch((err) => {
        // Keep the marker so the user can see something failed to load.
        console.error(`[3d-floorplan] failed to load GLB "${def.glb}":`, err);
      });
    return container;
  }

  const group = buildFurniture(def.model, def.color, { spread: def.spread, count: def.count });
  applyTransform(group, def);
  group.userData.furnitureId = def.id;
  return group;
}

export function makePosition(p: Vec3): THREE.Vector3 {
  return new THREE.Vector3(p[0], p[1], p[2]);
}
