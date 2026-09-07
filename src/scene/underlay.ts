// ---------------------------------------------------------------------------
// The tracing guide: a scanned/exported 2D floor plan laid flat on the floor
// plane so walls can be drawn over it. Editor-only — never part of the rendered
// plan, and removable.
// ---------------------------------------------------------------------------

import * as THREE from 'three';
import type { Underlay } from '../types';

/** Replace the underlay inside `group` (pass null to just clear it). */
export function setUnderlay(group: THREE.Group, u: Underlay | null, elevation = 0): void {
  // Dispose any previous underlay: it owns a decoded image texture, which is
  // the single biggest thing in the scene on a traced plan.
  for (const g of [...group.children]) {
    g.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.geometry) m.geometry.dispose();
      const mat = m.material as THREE.MeshBasicMaterial | undefined;
      if (mat) {
        mat.map?.dispose();
        mat.dispose();
      }
    });
  }
  group.clear();
  if (!u || !u.image) return;

  const aspect = u.aspect > 0 ? u.aspect : 1;
  const w = Math.max(0.1, u.widthM || 10);
  const d = w * aspect;
  const tex = new THREE.TextureLoader().load(u.image);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.MeshBasicMaterial({
    map: tex,
    transparent: true,
    opacity: u.opacity ?? 0.6,
    depthWrite: false, // walls/floor draw over it cleanly
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat);
  mesh.rotation.x = -Math.PI / 2; // lie flat on the floor (XZ plane)
  mesh.renderOrder = -1;

  const wrap = new THREE.Group();
  wrap.add(mesh);
  wrap.position.set(u.x ?? 0, elevation + 0.012, u.z ?? 0);
  wrap.rotation.y = (u.rotation ?? 0) * (Math.PI / 180);
  group.add(wrap);
}
