// ---------------------------------------------------------------------------
// View-mode geometry collapse.
//
// Two independent cuts, both VIEW ONLY:
//   * mergeStaticGeometry — collapse a floor's static architecture (walls,
//     floor slabs, opening frames) into a handful of merged meshes, one per
//     material look. A heavy plan goes from hundreds of draw calls to a few.
//   * simplifyMaterials — swap Standard (PBR) materials for matte Lambert
//     twins. Standard runs a full PBR BRDF per pixel per light, the dominant
//     fill-rate cost on a weak GPU; Lambert is a cheap diffuse and, on a
//     stylised floor plan, looks nearly identical.
//
// DESTRUCTIVE, and deliberately so: merging removes the original meshes from
// the floor group and disposes them, which leaves `wallById` / `roomById` /
// `furnitureById` pointing at objects that are no longer in the scene. That is
// why the EDITOR never merges — it rebuilds the scene unmerged on every change
// (SceneManager.loadPlan), so per-wall/room selection keeps working. Anything
// that needs to select or highlight a single element must not run after this.
// ---------------------------------------------------------------------------

import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { BuiltFloor } from './builder';

/** A matte Lambert twin of a Standard (PBR) material. Copies every property
 *  that affects the look (no metal/gloss to lose on a floor plan). */
function toLambert(std: THREE.MeshStandardMaterial): THREE.MeshLambertMaterial {
  const lam = new THREE.MeshLambertMaterial({
    color: std.color,
    map: std.map,
    emissive: std.emissive,
    emissiveIntensity: std.emissiveIntensity,
    emissiveMap: std.emissiveMap,
    transparent: std.transparent,
    opacity: std.opacity,
    alphaTest: std.alphaTest,
    side: std.side,
    depthWrite: std.depthWrite,
    vertexColors: std.vertexColors,
    flatShading: std.flatShading,
    toneMapped: std.toneMapped,
  });
  lam.name = std.name;
  lam.userData = std.userData;
  return lam;
}

/**
 * Collapse one floor's mergeable meshes into a few, one per material look.
 * `keepRoots` are objects (and their descendants) that must stay live —
 * anything bound to an entity, because it still has to glow / spin / slide and
 * carry a marker.
 */
export function mergeStaticGeometry(floor: BuiltFloor, keepRoots: Set<THREE.Object3D>): void {
  const inKept = (o: THREE.Object3D): boolean => {
    for (let cur: THREE.Object3D | null = o; cur; cur = cur.parent) {
      if (keepRoots.has(cur)) return true;
    }
    return false;
  };
  floor.group.updateMatrixWorld(true);
  const invFloor = floor.group.matrixWorld.clone().invert();

  // Bucket mergeable meshes by a material "signature" (same look → one mesh).
  const groups = new Map<string, { mat: THREE.Material; meshes: THREE.Mesh[] }>();
  floor.group.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh || m.userData.merged || inKept(m)) return;
    if (Array.isArray(m.material) || !m.geometry) return;
    const mat = m.material as THREE.MeshStandardMaterial;
    const sig = [
      mat.type,
      mat.color?.getHexString?.() ?? '',
      mat.emissive?.getHexString?.() ?? '', mat.emissiveIntensity ?? '',
      (mat.map as { uuid?: string } | null)?.uuid ?? '',
      mat.transparent, mat.opacity, mat.roughness, mat.metalness, mat.side, mat.depthWrite,
    ].join('|');
    let g = groups.get(sig);
    if (!g) { g = { mat, meshes: [] }; groups.set(sig, g); }
    g.meshes.push(m);
  });

  for (const { mat, meshes } of groups.values()) {
    if (meshes.length < 2) continue; // nothing to gain from a lone mesh
    const geos: THREE.BufferGeometry[] = [];
    for (const m of meshes) {
      m.updateMatrixWorld(true);
      const g = m.geometry.clone();
      g.applyMatrix4(invFloor.clone().multiply(m.matrixWorld)); // bake into floor space
      geos.push(g);
    }
    const merged = mergeGeometries(geos, false);
    geos.forEach((g) => g.dispose());
    if (!merged) continue; // incompatible attributes — leave those meshes as-is
    const mesh = new THREE.Mesh(merged, mat.clone());
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.merged = true;
    floor.group.add(mesh);
    for (const m of meshes) {
      m.removeFromParent();
      m.geometry.dispose();
      (m.material as THREE.Material).dispose();
    }
  }
}

/**
 * Swap every Standard (PBR) material in the scene for a matte Lambert twin. A
 * cache maps each source material to ONE Lambert, preserving the draw-call
 * batching a merge just created.
 *
 * The PBR originals are freed afterwards: each holds a compiled shader program
 * on the GPU, and on a panel that reloads its plan for weeks those add up to a
 * renderer that never gives memory back. Their maps are shared/cached elsewhere
 * and are deliberately NOT disposed (the Lambert twin copied the references).
 */
export function simplifyMaterials(scene: THREE.Object3D): void {
  const cache = new Map<THREE.Material, THREE.MeshLambertMaterial>();
  const conv = (mat: THREE.Material): THREE.Material => {
    if (!(mat as THREE.MeshStandardMaterial).isMeshStandardMaterial) return mat;
    let lam = cache.get(mat);
    if (!lam) {
      lam = toLambert(mat as THREE.MeshStandardMaterial);
      cache.set(mat, lam);
    }
    return lam;
  };
  scene.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh) return;
    m.material = Array.isArray(m.material) ? m.material.map(conv) : conv(m.material);
  });
  for (const src of cache.keys()) src.dispose();
}
