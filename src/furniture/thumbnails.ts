// ---------------------------------------------------------------------------
// Render small preview thumbnails of each furniture model for the palette.
// Uses one shared offscreen WebGL renderer; results are cached per model.
// ---------------------------------------------------------------------------

import * as THREE from 'three';
import { buildFurniture } from './library';
import { disposeObject3D } from '../scene/dispose';

const SIZE = 76;
const cache = new Map<string, string>();
let renderer: THREE.WebGLRenderer | undefined;
let idleTimer: ReturnType<typeof setTimeout> | undefined;

/** How long the palette's offscreen renderer is kept after the last thumbnail.
 *  Opening the palette renders a burst of models; holding the context for a few
 *  seconds covers that burst, and every result is cached as a data URL, so the
 *  context is almost never needed again. */
const IDLE_RELEASE_MS = 5000;

function getRenderer(): THREE.WebGLRenderer {
  if (!renderer) {
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true, // required for toDataURL
    });
    renderer.setSize(SIZE, SIZE);
    renderer.setPixelRatio(1);
  }
  return renderer;
}

/**
 * Hand the offscreen context back. This renderer used to be created on the
 * first palette open and kept FOREVER — a whole WebGL context permanently spent
 * on 76px pictures. A browser keeps only ~8-16 contexts (8 in some Android
 * WebViews) and silently kills the oldest to make room, so on a panel that is
 * opened and closed all day this one stolen slot is part of why the live scene
 * eventually goes black. The data-URL cache survives, so nothing is re-rendered.
 */
export function releaseThumbnailRenderer(): void {
  if (idleTimer) {
    clearTimeout(idleTimer);
    idleTimer = undefined;
  }
  if (!renderer) return;
  renderer.dispose();
  renderer.forceContextLoss();
  renderer.domElement.width = renderer.domElement.height = 0;
  renderer = undefined;
}

function scheduleRelease(): void {
  if (idleTimer) clearTimeout(idleTimer);
  idleTimer = setTimeout(releaseThumbnailRenderer, IDLE_RELEASE_MS);
}

export function getThumbnail(model: string): string {
  const hit = cache.get(model);
  if (hit) return hit;

  const r = getRenderer();
  const scene = new THREE.Scene();
  scene.add(new THREE.AmbientLight(0xffffff, 0.95));
  const dir = new THREE.DirectionalLight(0xffffff, 0.8);
  dir.position.set(3, 5, 4);
  scene.add(dir);

  // No explicit color → buildFurniture uses the model's realistic default, so
  // the palette previews look like the placed pieces.
  const group = buildFurniture(model);
  scene.add(group);

  const box = new THREE.Box3().setFromObject(group);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z, 0.4);

  const cam = new THREE.PerspectiveCamera(38, 1, 0.01, 100);
  const dist = maxDim * 2.3;
  cam.position.set(center.x + dist * 0.85, center.y + dist * 0.7, center.z + dist * 0.95);
  cam.lookAt(center);

  let url = '';
  try {
    r.render(scene, cam);
    url = r.domElement.toDataURL('image/png');
  } catch {
    url = '';
  }

  // Free this model's geometry AND its materials (each buildFurniture call
  // makes fresh MeshStandardMaterials; leaving them behind kept a compiled
  // shader program per material for the life of the page).
  disposeObject3D(group);
  scene.remove(group);

  cache.set(model, url);
  scheduleRelease();
  return url;
}
