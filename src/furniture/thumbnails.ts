// ---------------------------------------------------------------------------
// Render small preview thumbnails of each furniture model for the palette.
// Uses one shared offscreen WebGL renderer; results are cached per model.
// ---------------------------------------------------------------------------

import * as THREE from 'three';
import { buildFurniture } from './library';

const SIZE = 76;
const cache = new Map<string, string>();
let renderer: THREE.WebGLRenderer | undefined;

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

  // Free this model's geometry; renderer + cache persist.
  group.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.geometry) m.geometry.dispose();
  });

  cache.set(model, url);
  return url;
}
