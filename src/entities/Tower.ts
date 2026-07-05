import type { TowerDef, TowerTierDef, TargetingMode } from '../core/types';
import type { Creep } from './Creep';

let nextId = 1;

export class Tower {
  readonly id: number;
  def: TowerDef;
  tierIndex = 0;
  cellX: number;
  cellY: number;
  x: number;
  y: number;
  lastFireMs = -Infinity;
  targeting: TargetingMode = 'first';
  totalSpent: number;

  constructor(def: TowerDef, cellX: number, cellY: number, x: number, y: number) {
    this.id = nextId++;
    this.def = def;
    this.cellX = cellX;
    this.cellY = cellY;
    this.x = x;
    this.y = y;
    this.totalSpent = def.tiers[0].cost;
  }

  get tier(): TowerTierDef {
    return this.def.tiers[this.tierIndex];
  }

  get canUpgrade(): boolean {
    return this.tierIndex < this.def.tiers.length - 1;
  }

  get nextTier(): TowerTierDef | undefined {
    return this.def.tiers[this.tierIndex + 1];
  }

  upgrade(): void {
    if (!this.canUpgrade) return;
    this.tierIndex++;
    this.totalSpent += this.tier.cost;
  }

  sellValue(sellRatio: number): number {
    return Math.round(this.totalSpent * sellRatio);
  }

  canFire(nowMs: number, attackSpeedBonus: number): boolean {
    const cooldown = this.tier.cooldownMs / (1 + attackSpeedBonus);
    return nowMs - this.lastFireMs >= cooldown;
  }

  inRange(creep: Creep): boolean {
    const dist = Math.hypot(creep.x - this.x, creep.y - this.y);
    return dist <= this.tier.range;
  }

  canSee(creep: Creep): boolean {
    if (creep.def.flags?.flying && !this.tier.canTargetFlying) return false;
    if (!creep.isRevealed && !this.tier.trueSight) return false;
    return true;
  }
}
