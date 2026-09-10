// ---------------------------------------------------------------------------
// Навигация пальцами — так, как это делают карты, без обучения.
//
//   один палец  — ВЕДЁТ ПЛАН: точка, за которую взялись, остаётся под пальцем;
//   два пальца  — щипок (приближение), поворот и наклон (это делает
//                 OrbitControls, TOUCH.DOLLY_ROTATE).
//
// Почему один палец обслуживается ЗДЕСЬ, а не через TOUCH.PAN. Собственный
// pan OrbitControls считает смещение по экранной плоскости камеры и по
// расстоянию до точки вращения, а план лежит НАКЛОННО и уходит в глубину: пол
// у нижнего края экрана в трёх метрах от камеры, у верхнего — в сорока. Одна
// цифра на весь экран не может быть верной ни там, ни там, и палец с полом
// разъезжаются на десятки пикселей (замер: tests/29-navigation.spec.ts).
//
// Здесь смещение считается честно: луч через палец кладётся на плоскость пола,
// и камера ВМЕСТЕ с точкой вращения сдвигается ровно на разницу между тем, за
// что взялись, и тем, что под пальцем сейчас. Сдвиг общий, поэтому направление
// взгляда не меняется вовсе, а схваченная точка возвращается под палец точно —
// перенос камеры не меняет направление луча через ту же точку экрана.
//
// Точка вращения переезжает сама собой: она сдвигается вместе с камерой и
// потому всегда остаётся посреди экрана. Именно этого не хватало раньше —
// одним пальцем можно было ТОЛЬКО вращать, и увезти ось вращения с середины
// здания человеку было нечем.
// ---------------------------------------------------------------------------

import * as THREE from 'three';
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/** Что навигации нужно знать о сцене вокруг. */
export interface TouchNavHost {
  /** Высота пола активного этажа: по нему и «едет» план под пальцем. */
  groundY(): number;
  /** Во что целиться лучом «куда смотрит человек» (null — плана ещё нет). */
  pivotRoot(): THREE.Object3D | null;
  /** Рамка, за которую точке вращения нельзя (та же, что у clampTarget). */
  limits(): THREE.Box3 | null;
  /** false в правке: там один палец принадлежит инструменту, а не виду. */
  enabled(): boolean;
}

/**
 * У горизонта луч ложится почти на пол, и миллиметр пальца равен сотням
 * метров плана. Дальше этого отношения «дистанция / высота камеры» точку под
 * пальцем не ищем — вид просто не поедет, вместо того чтобы улететь.
 * 50 — это примерно 1,1° ниже горизонта; наклон камеры ограничен 88,2°, так
 * что в обычной работе порог не срабатывает никогда.
 */
const MAX_REACH = 50;

export class TouchNav {
  /** Пальцы, лежащие на холсте сейчас. */
  private readonly points = new Map<number, { x: number; y: number }>();
  /** Мировая точка пола, за которую взялись одним пальцем. */
  private anchor: THREE.Vector3 | null = null;
  private readonly plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  private readonly ray = new THREE.Raycaster();
  private readonly ndc = new THREE.Vector2();
  private readonly dir = new THREE.Vector3();
  private readonly hit = new THREE.Vector3();
  private readonly off: (() => void)[] = [];

  constructor(
    private readonly dom: HTMLElement,
    private readonly camera: THREE.PerspectiveCamera,
    private readonly controls: OrbitControls,
    private readonly host: TouchNavHost,
  ) {
    const down = (e: PointerEvent) => this.onDown(e);
    const move = (e: PointerEvent) => this.onMove(e);
    const up = (e: PointerEvent) => this.onUp(e);
    dom.addEventListener('pointerdown', down);
    dom.addEventListener('pointermove', move);
    dom.addEventListener('pointerup', up);
    dom.addEventListener('pointercancel', up);
    this.off.push(() => {
      dom.removeEventListener('pointerdown', down);
      dom.removeEventListener('pointermove', move);
      dom.removeEventListener('pointerup', up);
      dom.removeEventListener('pointercancel', up);
    });
  }

  /** Сколько пальцев на холсте (для диагностики и автопроверок). */
  get fingers(): number {
    return this.points.size;
  }

  dispose(): void {
    for (const off of this.off) off();
    this.off.length = 0;
    this.points.clear();
    this.anchor = null;
  }

  // -- пальцы -----------------------------------------------------------------

  private onDown(e: PointerEvent): void {
    if (e.pointerType !== 'touch') return;
    // Первый палец серии: если от прошлого жеста что-то «зависло» (браузер
    // потерял захват и не прислал pointerup), забываем это здесь — иначе вид
    // молча перестал бы слушаться до конца смены.
    if (e.isPrimary) this.points.clear();
    this.points.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (!this.host.enabled()) {
      this.anchor = null;
      return;
    }
    if (this.points.size === 1) {
      this.grab(e.clientX, e.clientY);
      return;
    }
    // Пошёл жест двумя пальцами — план больше не ведём, а ось вращения
    // переносим туда, куда человек смотрит.
    this.anchor = null;
    if (this.points.size === 2) this.recenterPivot();
  }

  private onMove(e: PointerEvent): void {
    if (e.pointerType !== 'touch' || !this.points.has(e.pointerId)) return;
    this.points.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (this.points.size !== 1 || !this.anchor || !this.host.enabled()) return;
    this.drag(e.clientX, e.clientY);
  }

  private onUp(e: PointerEvent): void {
    if (e.pointerType !== 'touch') return;
    this.points.delete(e.pointerId);
    this.anchor = null;
    // Сняли один палец из двух — оставшийся снова ведёт план. Хватаемся за ту
    // точку, где он стоит СЕЙЧАС, иначе вид дёрнулся бы на всё расстояние,
    // которое палец прошёл во время щипка.
    if (this.points.size === 1 && this.host.enabled()) {
      const p = this.points.values().next().value;
      if (p) this.grab(p.x, p.y);
    }
  }

  // -- один палец ведёт план --------------------------------------------------

  private grab(x: number, y: number): void {
    this.anchor = this.groundAt(x, y);
  }

  private drag(x: number, y: number): void {
    const now = this.groundAt(x, y);
    if (!now || !this.anchor) return;
    const dx = this.anchor.x - now.x;
    const dz = this.anchor.z - now.z;
    if (!Number.isFinite(dx) || !Number.isFinite(dz)) return;
    // Камера и цель — на ОДИН и тот же вектор: взгляд не поворачивается, ось
    // вращения остаётся посреди экрана.
    this.camera.position.x += dx;
    this.camera.position.z += dz;
    this.controls.target.x += dx;
    this.controls.target.z += dz;
    this.controls.update();
  }

  /** Мировая точка пола под экранной точкой (или null — луч ушёл за горизонт). */
  private groundAt(x: number, y: number): THREE.Vector3 | null {
    const rect = this.dom.getBoundingClientRect();
    if (!(rect.width > 0) || !(rect.height > 0)) return null;
    const gy = this.host.groundY();
    const height = this.camera.position.y - gy;
    if (!(height > 0.05)) return null;
    this.ndc.set(((x - rect.left) / rect.width) * 2 - 1, -((y - rect.top) / rect.height) * 2 + 1);
    this.ray.setFromCamera(this.ndc, this.camera);
    if (!(this.ray.ray.direction.y < -1e-4)) return null;
    this.plane.constant = -gy;
    if (!this.ray.ray.intersectPlane(this.plane, this.hit)) return null;
    if (this.hit.distanceTo(this.camera.position) > height * MAX_REACH) return null;
    return this.hit.clone();
  }

  // -- два пальца крутят вокруг того, на что смотрят --------------------------

  /**
   * Перенести ось вращения на первую поверхность по оси взгляда (а если по
   * взгляду ничего нет — на пол). Перенос строго ВДОЛЬ оси взгляда, поэтому
   * меняется только радиус: ни поворот, ни наклон не дёргаются, картинка на
   * экране остаётся ровно та же.
   */
  private recenterPivot(): void {
    const cam = this.camera;
    cam.getWorldDirection(this.dir);
    const dist = this.viewDistance();
    if (dist === null) return;
    const t = THREE.MathUtils.clamp(dist, this.controls.minDistance, this.controls.maxDistance);
    const next = cam.position.clone().addScaledVector(this.dir, t);
    // За рамку плана ось не уводим: там её тут же вернул бы clampTarget — и
    // вернул бы ВМЕСТЕ с камерой, то есть жест начался бы с рывка.
    const box = this.host.limits();
    if (box && !box.containsPoint(next)) return;
    this.controls.target.copy(next);
    this.controls.update();
  }

  /** Дальность до того, на что смотрит камера: сначала геометрия, потом пол. */
  private viewDistance(): number | null {
    const root = this.host.pivotRoot();
    if (root) {
      this.ray.set(this.camera.position, this.dir);
      const hits = this.ray.intersectObject(root, true);
      const first = hits.find((h) => h.distance > 0.05);
      if (first) return first.distance;
    }
    if (!(this.dir.y < -1e-4)) return null;
    const d = (this.host.groundY() - this.camera.position.y) / this.dir.y;
    return Number.isFinite(d) && d > 0 ? d : null;
  }
}
