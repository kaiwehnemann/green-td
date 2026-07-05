import { Creep } from '../entities/Creep';
import { Tower } from '../entities/Tower';
import { Projectile } from '../entities/Projectile';
import { WaveManager } from '../systems/WaveManager';
import { EconomySystem } from '../systems/EconomySystem';
import { pickTarget } from '../systems/TargetingSystem';
import { computeAuraBonuses } from '../systems/AuraSystem';
import { calculateDamage } from './CombatCalculator';
import { cellToWorld, isBuildable } from './Grid';
import { DamageNumbers } from '../ui/DamageNumbers';
import { STARTING_GOLD, STARTING_LIVES, SELL_RATIO } from '../data/towers';
import {
  BOSS_RESONANCE_INTERVAL_MS,
  BOSS_RESONANCE_RADIUS,
  BOSS_RESONANCE_DAMAGE_REDUCTION_PER_STACK,
} from '../data/waves';
import type { TowerDef, TargetingMode } from './types';

export interface GameCallbacks {
  onGoldChange: (gold: number) => void;
  onLivesChange: (lives: number) => void;
  onWaveChange: (waveNumber: number, totalWaves: number, active: boolean) => void;
  onGameOver: (won: boolean) => void;
  onTowerSelected: (tower: Tower | null) => void;
}

export class Game {
  creeps: Creep[] = [];
  towers: Tower[] = [];
  projectiles: Projectile[] = [];
  economy = new EconomySystem(STARTING_GOLD, STARTING_LIVES);
  waveManager: WaveManager;
  damageNumbers = new DamageNumbers();
  selectedTower: Tower | null = null;
  buildingDef: TowerDef | null = null;
  private nowMs = 0;
  private resonanceStacks = new Map<number, number>();
  private lastResonanceMs = 0;
  private gameOver = false;
  private callbacks: GameCallbacks;

  constructor(callbacks: GameCallbacks) {
    this.callbacks = callbacks;
    this.waveManager = new WaveManager({
      onCreepSpawned: (creep) => this.creeps.push(creep),
      onWaveComplete: () => this.emitWaveState(),
      onAllWavesComplete: () => {},
    });
  }

  get canStartNextWave(): boolean {
    return !this.waveManager.isWaveActive && !this.waveManager.allWavesStarted && !this.gameOver;
  }

  startNextWave(): void {
    if (this.waveManager.startNextWave()) {
      this.emitWaveState();
    }
  }

  setBuildingTower(def: TowerDef | null): void {
    this.buildingDef = def;
  }

  tryPlaceTower(cellX: number, cellY: number): boolean {
    if (!this.buildingDef) return false;
    if (!isBuildable(cellX, cellY)) return false;
    if (this.towers.some((t) => t.cellX === cellX && t.cellY === cellY)) return false;
    const cost = this.buildingDef.tiers[0].cost;
    if (!this.economy.canAfford(cost)) return false;

    this.economy.spend(cost);
    this.callbacks.onGoldChange(this.economy.gold);
    const world = cellToWorld({ x: cellX, y: cellY });
    const tower = new Tower(this.buildingDef, cellX, cellY, world.x, world.y);
    this.towers.push(tower);
    this.buildingDef = null;
    return true;
  }

  selectTowerAt(cellX: number, cellY: number): void {
    const tower = this.towers.find((t) => t.cellX === cellX && t.cellY === cellY) ?? null;
    this.selectedTower = tower;
    this.callbacks.onTowerSelected(tower);
  }

  upgradeSelected(): void {
    const tower = this.selectedTower;
    if (!tower || !tower.canUpgrade) return;
    const cost = tower.nextTier!.cost;
    if (!this.economy.canAfford(cost)) return;
    this.economy.spend(cost);
    tower.upgrade();
    this.callbacks.onGoldChange(this.economy.gold);
    this.callbacks.onTowerSelected(tower);
  }

  sellSelected(): void {
    const tower = this.selectedTower;
    if (!tower) return;
    this.economy.earn(tower.sellValue(SELL_RATIO));
    this.towers = this.towers.filter((t) => t !== tower);
    this.selectedTower = null;
    this.callbacks.onGoldChange(this.economy.gold);
    this.callbacks.onTowerSelected(null);
  }

  setTargetingForSelected(mode: TargetingMode): void {
    if (!this.selectedTower) return;
    this.selectedTower.targeting = mode;
    this.callbacks.onTowerSelected(this.selectedTower);
  }

  private emitWaveState(): void {
    this.callbacks.onWaveChange(
      Math.max(this.waveManager.waveNumber, 0),
      this.waveManager.totalWaves,
      this.waveManager.isWaveActive
    );
  }

  update(dtMs: number): void {
    if (this.gameOver) return;
    this.nowMs += dtMs;

    this.waveManager.update(dtMs, () => this.creeps.filter((c) => !c.dead && !c.reachedEnd).length);

    for (const creep of this.creeps) {
      creep.update(dtMs, this.nowMs);
    }

    this.handleBossResonance();
    this.handleTowerFiring();
    this.handleProjectiles(dtMs);
    this.handleCreepRemoval();
    this.damageNumbers.update(this.nowMs);

    if (this.economy.isGameOver && !this.gameOver) {
      this.gameOver = true;
      this.callbacks.onGameOver(false);
    } else if (this.waveManager.allWavesStarted && !this.waveManager.isWaveActive && this.creeps.length === 0 && !this.gameOver) {
      this.gameOver = true;
      this.callbacks.onGameOver(true);
    }
  }

  private handleBossResonance(): void {
    const boss = this.creeps.find((c) => c.def.flags?.boss && !c.dead);
    if (!boss) return;
    if (this.nowMs - this.lastResonanceMs < BOSS_RESONANCE_INTERVAL_MS) return;
    this.lastResonanceMs = this.nowMs;
    for (const tower of this.towers) {
      const dist = Math.hypot(tower.x - boss.x, tower.y - boss.y);
      if (dist <= BOSS_RESONANCE_RADIUS) {
        this.resonanceStacks.set(tower.id, (this.resonanceStacks.get(tower.id) ?? 0) + 1);
      }
    }
  }

  private resonanceMultiplier(tower: Tower): number {
    const stacks = this.resonanceStacks.get(tower.id) ?? 0;
    return Math.max(0.1, 1 - stacks * BOSS_RESONANCE_DAMAGE_REDUCTION_PER_STACK);
  }

  private handleTowerFiring(): void {
    for (const tower of this.towers) {
      if (tower.tier.damage <= 0) continue; // pure support towers (auras) don't attack
      const aura = computeAuraBonuses(tower, this.towers);
      if (!tower.canFire(this.nowMs, aura.attackSpeedBonus)) continue;

      const target = pickTarget(tower, this.creeps);
      if (!target) continue;

      tower.lastFireMs = this.nowMs;
      const dmgMult = (1 + aura.damageBonus) * this.resonanceMultiplier(tower);
      this.projectiles.push(new Projectile(tower.x, tower.y, target, { ...tower.tier, damage: tower.tier.damage * dmgMult }));
    }
  }

  private handleProjectiles(dtMs: number): void {
    const remaining: Projectile[] = [];
    for (const proj of this.projectiles) {
      const hit = proj.update(dtMs);
      if (hit) {
        this.resolveHit(proj);
      } else if (!proj.dead) {
        remaining.push(proj);
      }
    }
    this.projectiles = remaining;
  }

  private resolveHit(proj: Projectile): void {
    const primary = proj.target;
    const tier = proj.tier;
    const targets = [primary];

    if (tier.splashRadius) {
      for (const c of this.creeps) {
        if (c === primary || c.dead || c.reachedEnd) continue;
        if (Math.hypot(c.x - primary.x, c.y - primary.y) <= tier.splashRadius) {
          targets.push(c);
        }
      }
    }

    for (const creep of targets) {
      if (creep.dead) continue;
      if (creep.def.flags?.evasionChance && Math.random() < creep.def.flags.evasionChance) {
        this.damageNumbers.spawn(creep.x, creep.y, 0, this.nowMs);
        continue;
      }
      const dmg = calculateDamage({
        baseDamage: tier.damage,
        attackType: tier.attackType,
        armorClass: creep.def.armorClass,
        armor: creep.effectiveArmor,
      });
      creep.takeDamage(dmg, this.nowMs);
      this.damageNumbers.spawn(creep.x, creep.y - 12, dmg, this.nowMs);

      if (tier.slowFactor) creep.applySlow(tier.slowFactor, tier.slowDurationMs ?? 0, this.nowMs);
      if (tier.armorReduction) creep.applyArmorReduction(tier.armorReduction, tier.armorReductionDurationMs ?? 0, this.nowMs);
      if (tier.poisonDps) creep.applyPoison(tier.poisonDps, tier.poisonDurationMs ?? 0, this.nowMs);
      if (tier.trueSight) creep.reveal(1500, this.nowMs);
    }
  }

  private handleCreepRemoval(): void {
    const stillAlive: Creep[] = [];
    for (const creep of this.creeps) {
      if (creep.dead) {
        this.economy.earn(creep.def.bounty);
        this.callbacks.onGoldChange(this.economy.gold);
        continue;
      }
      if (creep.reachedEnd) {
        this.economy.loseLives(creep.def.lifeLoss);
        this.callbacks.onLivesChange(this.economy.lives);
        continue;
      }
      stillAlive.push(creep);
    }
    this.creeps = stillAlive;
  }
}
