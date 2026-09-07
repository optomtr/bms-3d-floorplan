// ---------------------------------------------------------------------------
// The frame loop, with an explicit contract.
//
// Render-on-demand: a frame is drawn only when something actually changed —
// the camera is moving, an animation is running, a state update landed, or the
// editor is open. A static kiosk view then costs ~zero GPU, which is what keeps
// high quality smooth on weak tablets.
//
// The "one more frame, please" flag is the whole point of this module. It used
// to be a field on the scene manager written from eleven places and read from
// one; here it is private, `invalidate()` is the only way to raise it, and
// nothing outside can clear it by accident.
//
// Contract with the host (see RenderLoopHost):
//   * updateCamera() eases damping and says whether the camera is still moving;
//   * animate(dt)    advances fans/curtains and says whether they still move;
//   * drawFrame()    draws exactly one frame and nothing else;
//   * onInteractiveFrame(sec) is told the frame time of CONTINUOUS frames only
//     (camera or animation) — the frames where a human would feel lag.
// The loop never touches the renderer, the scene or the camera itself.
// ---------------------------------------------------------------------------

import * as THREE from 'three';

/** Frames that exist ONLY to advance an animation (a spinning fan, a sliding
 *  curtain) are limited to this rate. Camera movement is never limited. 20 Hz
 *  keeps a blade visibly turning while cutting an always-on fan's cost by two
 *  thirds — the difference between a warm panel and a hot one over a night. */
const ANIM_HZ = 20;
const ANIM_STEP = 1 / ANIM_HZ;

export interface RenderLoopHost {
  updateCamera(): boolean;
  animate(dt: number): boolean;
  drawFrame(): void;
  onInteractiveFrame(seconds: number): void;
}

export class RenderLoop {
  private clock = new THREE.Clock();
  private rafId = 0;
  private running = false;
  /** False while the panel can't be seen (hidden tab / card off screen): the
   *  whole loop stands still, so a running fan costs nothing behind a
   *  screensaver or on a dashboard tab nobody is looking at. */
  private visible = true;
  /** The one-more-frame request. Private on purpose — see the header. */
  private pending = true;
  /** Draw every frame regardless (the editor, where previews change per move). */
  private continuous = false;
  /** Animation time not yet handed to animate(). */
  private animAccum = 0;

  constructor(private readonly host: RenderLoopHost) {}

  get isRunning(): boolean {
    return this.running;
  }

  /** Request one more rendered frame. Call after anything that changes what's
   *  on screen but isn't a camera move or an animation. */
  invalidate(): void {
    this.pending = true;
  }

  /** Draw every frame while `on` (edit mode), instead of on demand. */
  setContinuous(on: boolean): void {
    this.continuous = on;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.clock.getDelta(); // discard time spent stopped
    this.pump();
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.rafId);
    this.rafId = 0;
  }

  /** Whether the panel is being looked at. Two independent reasons to stand
   *  still: the tab/app is hidden, or the card is scrolled off screen. */
  setVisible(v: boolean): void {
    if (this.visible === v) return;
    this.visible = v;
    if (!v) {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
      return;
    }
    // Coming back: throw away the elapsed time so nothing jumps a week forward.
    this.clock.getDelta();
    this.animAccum = 0;
    this.pending = true;
    this.pump();
  }

  /** Draw one frame RIGHT NOW and clear the pending request. Used after the
   *  drawing buffer is re-fitted: setSize() clears it, so with render-on-demand
   *  the canvas would flash black for a frame until the next rAF. */
  drawNow(): void {
    this.host.drawFrame();
    this.pending = false;
  }

  /** Schedule the next frame, unless one is already scheduled or the panel is
   *  stopped / can't be seen. */
  private pump(): void {
    if (!this.running || !this.visible || this.rafId) return;
    this.rafId = requestAnimationFrame(this.tick);
  }

  private tick = (): void => {
    this.rafId = 0;
    if (!this.running || !this.visible) return;
    this.pump();
    const delta = this.clock.getDelta();
    // Camera motion is NEVER rate-limited (that's where lag is felt). Frames
    // that exist only for an animation ARE: a fan that is switched on has no
    // end state, so before this it pinned the panel at 60 fps for as long as it
    // ran — all night, at full GPU. ANIM_HZ still reads as a spinning blade.
    const moved = this.host.updateCamera();
    this.animAccum += delta;
    let anim = false;
    // The epsilon keeps the step landing on a fixed frame boundary (every 3rd
    // frame at 60 Hz) instead of alternating 3/4 frames on float jitter, which
    // would show up as an unevenly turning blade.
    if (this.animAccum >= ANIM_STEP - 1e-3) {
      anim = this.host.animate(this.animAccum);
      this.animAccum = 0;
    }
    const interacting = moved || anim; // continuous frames — where lag is felt
    if (this.pending || interacting || this.continuous) {
      this.host.drawFrame();
      this.pending = false;
      if (interacting) this.host.onInteractiveFrame(delta);
    }
  };
}
