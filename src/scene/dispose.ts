// ---------------------------------------------------------------------------
// Ownership rules for freeing Three.js resources.
//
// A wall panel runs for weeks without a reload, so every byte the scene stops
// using has to actually go back. Two traps make a naive `traverse + dispose()`
// wrong, and both cost us a black screen rather than a leak:
//
//   1. Sprites share ONE module-level geometry for the whole application
//      (THREE.Sprite's internal quad). Disposing it because a sprite happened
//      to sit inside a group being torn down kills every other sprite in the
//      app — including the ones in a scene that is still on screen.
//   2. Sprite MATERIALS here are owned by whoever created them: TextLabel owns
//      its canvas texture + material, and the marker sprites share cached
//      textures with a per-sprite material freed by the marker code. Freeing
//      them again from a group walk is a double dispose.
//
// So: this walk owns meshes/lines (geometry + materials), and never touches
// sprites. Whoever created a sprite frees it.
// ---------------------------------------------------------------------------

import * as THREE from 'three';

/** userData flag set on everything this module has freed. An async job that
 *  finishes after a teardown (a .glb still downloading) checks it before
 *  attaching its result to a group that no longer exists. */
export const DISPOSED_FLAG = '__bmsDisposed';

export function isDisposed(obj: THREE.Object3D | null | undefined): boolean {
  return !!obj && obj.userData?.[DISPOSED_FLAG] === true;
}

/** Free the GPU resources of a subtree (geometry + materials of meshes/lines),
 *  and mark the whole subtree disposed. Sprites are skipped — see the note. */
export function disposeObject3D(root: THREE.Object3D | null | undefined): void {
  if (!root) return;
  root.traverse((o) => {
    o.userData[DISPOSED_FLAG] = true;
    if ((o as THREE.Sprite).isSprite) return;
    const mesh = o as THREE.Mesh;
    if (mesh.geometry) mesh.geometry.dispose();
    const mat = (mesh as unknown as { material?: THREE.Material | THREE.Material[] }).material;
    if (mat) (Array.isArray(mat) ? mat : [mat]).forEach((m) => m?.dispose?.());
  });
}

/** Hand a throw-away WebGL context back to the driver instead of waiting for
 *  the garbage collector. A browser keeps only ~8-16 contexts alive (8 in some
 *  Android WebViews) and silently kills the OLDEST when a new one is asked
 *  for — which is how a probe context taken once at startup ends up costing the
 *  live scene its picture. */
export function releaseGl(gl: WebGLRenderingContext | WebGL2RenderingContext | null): void {
  try {
    const ext = gl?.getExtension('WEBGL_lose_context') as { loseContext?: () => void } | null;
    ext?.loseContext?.();
  } catch {
    /* nothing to release */
  }
}
