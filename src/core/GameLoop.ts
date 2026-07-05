export type UpdateFn = (dtMs: number) => void;
export type RenderFn = (alpha: number) => void;

const FIXED_STEP_MS = 1000 / 60;

export class GameLoop {
  private accumulator = 0;
  private lastTime = 0;
  private running = false;
  private rafId = 0;
  private speedMultiplier = 1;

  private readonly update: UpdateFn;
  private readonly render: RenderFn;

  constructor(update: UpdateFn, render: RenderFn) {
    this.update = update;
    this.render = render;
  }

  setSpeed(mult: number): void {
    this.speedMultiplier = mult;
  }

  getSpeed(): number {
    return this.speedMultiplier;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.rafId = requestAnimationFrame(this.tick);
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.rafId);
  }

  private tick = (now: number): void => {
    if (!this.running) return;
    let frameMs = now - this.lastTime;
    this.lastTime = now;
    frameMs = Math.min(frameMs, 250);
    this.accumulator += frameMs * this.speedMultiplier;

    while (this.accumulator >= FIXED_STEP_MS) {
      this.update(FIXED_STEP_MS);
      this.accumulator -= FIXED_STEP_MS;
    }

    this.render(this.accumulator / FIXED_STEP_MS);
    this.rafId = requestAnimationFrame(this.tick);
  };
}
