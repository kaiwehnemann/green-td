import type { CreepDef } from '../core/types';
import { PATH_WAYPOINTS, type Point } from '../core/Grid';

let nextId = 1;

export class Creep {
  readonly id: number;
  readonly def: CreepDef;
  hp: number;
  maxHp: number;
  armor: number;
  x: number;
  y: number;
  waypointIndex = 1;
  reachedEnd = false;
  dead = false;
  slowUntilMs = 0;
  slowFactor = 1;
  armorReductionUntilMs = 0;
  armorReductionAmount = 0;
  flashUntilMs = 0;
  poisonDps = 0;
  poisonUntilMs = 0;
  revealedUntilMs = 0;

  constructor(def: CreepDef, waveScale: number) {
    this.id = nextId++;
    this.def = def;
    this.maxHp = Math.round(def.hp * waveScale);
    this.hp = this.maxHp;
    this.armor = def.armor;
    const start = PATH_WAYPOINTS[0];
    this.x = start.x;
    this.y = start.y;
  }

  get isVisible(): boolean {
    return !this.def.flags?.invisible;
  }

  get effectiveArmor(): number {
    return this.armor - this.armorReductionAmount;
  }

  get currentSpeed(): number {
    return this.def.speed * this.slowFactor;
  }

  applySlow(factor: number, durationMs: number, nowMs: number): void {
    if (this.def.flags?.frostImmune) return;
    this.slowFactor = Math.min(this.slowFactor, factor);
    this.slowUntilMs = Math.max(this.slowUntilMs, nowMs + durationMs);
  }

  applyArmorReduction(amount: number, durationMs: number, nowMs: number): void {
    this.armorReductionAmount = Math.max(this.armorReductionAmount, amount);
    this.armorReductionUntilMs = Math.max(this.armorReductionUntilMs, nowMs + durationMs);
  }

  applyPoison(dps: number, durationMs: number, nowMs: number): void {
    this.poisonDps = Math.max(this.poisonDps, dps);
    this.poisonUntilMs = Math.max(this.poisonUntilMs, nowMs + durationMs);
  }

  reveal(durationMs: number, nowMs: number): void {
    this.revealedUntilMs = Math.max(this.revealedUntilMs, nowMs + durationMs);
  }

  get isRevealed(): boolean {
    return this.isVisible || Date.now() < this.revealedUntilMs;
  }

  takeDamage(amount: number, nowMs: number): void {
    this.hp -= amount;
    this.flashUntilMs = nowMs + 90;
    if (this.hp <= 0) {
      this.hp = 0;
      this.dead = true;
    }
  }

  update(dtMs: number, nowMs: number): void {
    if (nowMs > this.slowUntilMs) this.slowFactor = 1;
    if (nowMs > this.armorReductionUntilMs) this.armorReductionAmount = 0;
    if (nowMs < this.poisonUntilMs && this.poisonDps > 0) {
      this.takeDamage((this.poisonDps * dtMs) / 1000, nowMs);
    } else {
      this.poisonDps = 0;
    }
    if (this.dead || this.reachedEnd) return;

    const target = PATH_WAYPOINTS[this.waypointIndex];
    if (!target) {
      this.reachedEnd = true;
      return;
    }
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const dist = Math.hypot(dx, dy);
    const step = (this.currentSpeed * dtMs) / 1000;

    if (step >= dist) {
      this.x = target.x;
      this.y = target.y;
      this.waypointIndex++;
      if (this.waypointIndex >= PATH_WAYPOINTS.length) {
        this.reachedEnd = true;
      }
    } else {
      this.x += (dx / dist) * step;
      this.y += (dy / dist) * step;
    }
  }

  get position(): Point {
    return { x: this.x, y: this.y };
  }
}
