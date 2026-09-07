// ---------------------------------------------------------------------------
// Camera behaviour: the touch hardening from the brief, and the two moves the
// rest of the app asks for — frame the floor, and keep the orbit target from
// wandering off it.
// ---------------------------------------------------------------------------

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { num } from './sanitize';

/** OrbitControls tuned for a wall tablet: damped, clamped, pinch-safe. */
export function createControls(camera: THREE.Camera, dom: HTMLElement): OrbitControls {
  const controls = new OrbitControls(camera, dom);
  controls.enableDamping = true;
  controls.dampingFactor = 0.12;
  controls.screenSpacePanning = false;
  // Zoom toward the cursor / two-finger pinch midpoint, not a fixed point.
  controls.zoomToCursor = true;
  controls.minDistance = 2;
  controls.maxDistance = 40;
  // Keep the camera above the floor so you can't flip under the building.
  controls.maxPolarAngle = Math.PI * 0.49;
  controls.touches = {
    ONE: THREE.TOUCH.ROTATE,
    TWO: THREE.TOUCH.DOLLY_PAN,
  };
  return controls;
}

/**
 * Frame a floor — the kiosk safety net.
 *
 * @param box       the floor's bounding box (empty/absent → a default area)
 * @param distance  the project's framing multiplier (config: cameraDistance)
 * @param distMul   a one-off multiplier; < 1 dollies closer (e.g. the short,
 *                  wide Обзор banner, where fit-to-view leaves the model tiny)
 */
export function frameBox(
  camera: THREE.PerspectiveCamera,
  controls: OrbitControls,
  box: THREE.Box3 | undefined,
  distance: number,
  distMul: number,
): void {
  let b = box;
  // isEmpty() answers FALSE for a NaN box (every NaN comparison is false), so a
  // poisoned box would be framed as if it were real and park the camera at NaN —
  // a black screen with nothing in the console. Check finiteness too.
  if (!b || b.isEmpty() || !isFinite3(b)) {
    // Blank/empty plan: frame a default area around the origin so the camera
    // isn't left parked far away with nothing in view.
    b = new THREE.Box3(new THREE.Vector3(-4, 0, -4), new THREE.Vector3(4, 2.6, 4));
  }
  const center = b.getCenter(new THREE.Vector3());
  const size = b.getSize(new THREE.Vector3());
  const maxDim = Math.max(num(size.x, 0), num(size.z, 0), 2);

  controls.target.copy(center);
  // Pull back enough to frame the floor. `distance` (config) scales it —
  // <1 = closer, >1 = further. Default sits noticeably closer than before.
  const dist = Math.max(0.5, (maxDim * 0.95 + 3) * num(distance, 1) * num(distMul, 1));
  camera.position.set(center.x + dist * 0.7, center.y + dist * 0.8, center.z + dist * 0.7);
  controls.maxDistance = dist * 3;
  controls.minDistance = Math.max(1.2, maxDim * 0.1);
  camera.lookAt(center);
  controls.update();
}

/** Keep the orbit target from drifting outside the floor bbox + margin. */
export function clampTarget(camera: THREE.Camera, controls: OrbitControls, box: THREE.Box3): void {
  if (box.isEmpty()) return;
  const margin = 3;
  const t = controls.target;
  const nx = THREE.MathUtils.clamp(t.x, box.min.x - margin, box.max.x + margin);
  const ny = THREE.MathUtils.clamp(t.y, box.min.y, box.max.y + 1);
  const nz = THREE.MathUtils.clamp(t.z, box.min.z - margin, box.max.z + margin);
  // Apply the same correction to the camera so zoom-to-cursor (which moves both
  // camera and target) doesn't jump/stick when the target hits the clamp.
  camera.position.x += nx - t.x;
  camera.position.y += ny - t.y;
  camera.position.z += nz - t.z;
  t.set(nx, ny, nz);
}

function isFinite3(b: THREE.Box3): boolean {
  return (
    Number.isFinite(b.min.x) && Number.isFinite(b.min.y) && Number.isFinite(b.min.z) &&
    Number.isFinite(b.max.x) && Number.isFinite(b.max.y) && Number.isFinite(b.max.z)
  );
}
