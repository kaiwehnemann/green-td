import type { Creep } from './Creep';
import type { TowerTierDef } from '../core/types';

let nextId = 1;

export class Projectile {
  readonly id: number;
  x: number;
  y: number;
  readonly speed = 500;
  dead = false;

  target: Creep;
  tier: TowerTierDef;

  constructor(x: number, y: number, target: Creep, tier: TowerTierDef) {
    this.id = nextId++;
    this.x = x;
    this.y = y;
    this.target = target;
    this.tier = tier;
  }

  update(dtMs: number): boolean {
    if (this.target.dead || this.target.reachedEnd) {
      this.dead = true;
      return false;
    }
    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const dist = Math.hypot(dx, dy);
    const step = (this.speed * dtMs) / 1000;
    if (step >= dist) {
      this.x = this.target.x;
      this.y = this.target.y;
      this.dead = true;
      return true;
    }
    this.x += (dx / dist) * step;
    this.y += (dy / dist) * step;
    return false;
  }
}
