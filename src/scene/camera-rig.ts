// ---------------------------------------------------------------------------
// Camera behaviour: the touch hardening from the brief, and the two moves the
// rest of the app asks for — frame the floor, and keep the orbit target from
// wandering off it.
//
// Схема жестов живёт здесь же, одной таблицей (applyTouchScheme), потому что
// «кто чем управляет» — это свойство камеры, а не указателя. МЫШЬ схема не
// трогает: у OrbitControls для неё отдельный mouseButtons.
// ---------------------------------------------------------------------------

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { num } from './sanitize';

/**
 * Ближе этого к точке вращения камеру не подпускаем, метры.
 *
 * Раньше порог считался от размера плана (maxDim * 0.1), и на этаже 40 x 25 м
 * получалось 4 метра: к комнате нельзя было подойти ближе, чем на два её шага,
 * — ровно то, на что жаловался владелец. Порог не зависит от размера здания:
 * 1,2 м от точки под взглядом — это «стоя посреди комнаты», ближе смотреть
 * уже не на что, а ближняя плоскость камеры (0,1 м) ещё далеко.
 */
export const MIN_DISTANCE = 1.2;

/** Насколько камера обязана держаться над полом активного этажа, метры. */
const FLOOR_CLEARANCE = 0.35;

/** OrbitControls tuned for a wall tablet: damped, clamped, pinch-safe. */
export function createControls(camera: THREE.Camera, dom: HTMLElement): OrbitControls {
  const controls = new OrbitControls(camera, dom);
  controls.enableDamping = true;
  controls.dampingFactor = 0.12;
  controls.screenSpacePanning = false;
  // Zoom toward the cursor / two-finger pinch midpoint, not a fixed point.
  controls.zoomToCursor = true;
  controls.minDistance = MIN_DISTANCE;
  controls.maxDistance = 40;
  // Keep the camera above the floor so you can't flip under the building.
  controls.maxPolarAngle = Math.PI * 0.49;
  applyTouchScheme(controls, false);
  return controls;
}

/**
 * Что делают пальцы.
 *
 * ПРОСМОТР: один палец OrbitControls не отдаём вовсе (ONE: null) — им ведёт
 * план TouchNav (см. touch-nav.ts), точка под пальцем остаётся под пальцем.
 * Два пальца — щипок (приближение) вместе с поворотом и наклоном.
 *
 * ПРАВКА: как было. Один палец принадлежит инструменту (тап рисует стену,
 * протяжка крутит камеру), два — щипок с перемещением. Ломать это нельзя:
 * монтажник чертит одним пальцем.
 *
 * Мышь не участвует: у неё свой mouseButtons, и он остаётся прежним.
 */
export function applyTouchScheme(controls: OrbitControls, editing: boolean): void {
  controls.touches = editing
    ? { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN }
    : { ONE: null as unknown as THREE.TOUCH, TWO: THREE.TOUCH.DOLLY_ROTATE };
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
  // НЕ от размера плана: см. MIN_DISTANCE.
  controls.minDistance = MIN_DISTANCE;
  camera.lookAt(center);
  controls.update();
}

/**
 * Рамка, за которую точке вращения нельзя. План плюс запас; запас растёт
 * вместе с планом.
 *
 * Постоянные 3 метра держали квартиру, но на этаже 40 x 25 м упирались в
 * невидимую стенку раньше, чем человек доводил вид до дальнего края: половина
 * экрана уходила за границу, а вид вставал. Треть длинной стороны (но не
 * больше 20 м) даёт увести план к любому краю и всё же не потерять его совсем.
 */
export function targetLimits(box: THREE.Box3): THREE.Box3 | null {
  if (box.isEmpty() || !isFinite3(box)) return null;
  const size = box.getSize(new THREE.Vector3());
  const margin = THREE.MathUtils.clamp(Math.max(size.x, size.z) * 0.35, 3, 20);
  return new THREE.Box3(
    new THREE.Vector3(box.min.x - margin, box.min.y, box.min.z - margin),
    new THREE.Vector3(box.max.x + margin, box.max.y + 1, box.max.z + margin),
  );
}

/** Keep the orbit target from drifting outside the floor bbox + margin. */
export function clampTarget(camera: THREE.Camera, controls: OrbitControls, box: THREE.Box3): void {
  const lim = targetLimits(box);
  if (!lim) return;
  const t = controls.target;
  const nx = THREE.MathUtils.clamp(t.x, lim.min.x, lim.max.x);
  const ny = THREE.MathUtils.clamp(t.y, lim.min.y, lim.max.y);
  const nz = THREE.MathUtils.clamp(t.z, lim.min.z, lim.max.z);
  // Apply the same correction to the camera so zoom-to-cursor (which moves both
  // camera and target) doesn't jump/stick when the target hits the clamp.
  camera.position.x += nx - t.x;
  camera.position.y += ny - t.y;
  camera.position.z += nz - t.z;
  t.set(nx, ny, nz);

  // И не даём камере лечь на пол. Предел приближения теперь 1,2 м (раньше на
  // большом плане было четыре), а наклон разрешён почти до горизонта — вместе
  // это позволяло уехать камерой под перекрытие и увидеть чёрный экран.
  // Поднимаем камеру ВМЕСТЕ с целью: общий сдвиг не меняет направление
  // взгляда, картинка просто чуть приподнимается.
  const floorY = lim.min.y + FLOOR_CLEARANCE;
  if (camera.position.y < floorY) {
    const up = floorY - camera.position.y;
    camera.position.y += up;
    t.y += up;
  }
}

function isFinite3(b: THREE.Box3): boolean {
  return (
    Number.isFinite(b.min.x) && Number.isFinite(b.min.y) && Number.isFinite(b.min.z) &&
    Number.isFinite(b.max.x) && Number.isFinite(b.max.y) && Number.isFinite(b.max.z)
  );
}
