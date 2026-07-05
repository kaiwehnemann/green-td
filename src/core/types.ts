export type AttackType = 'normal' | 'pierce' | 'siege' | 'magic' | 'chaos' | 'spell';

export type ArmorClass =
  | 'unarmored'
  | 'light'
  | 'medium'
  | 'heavy'
  | 'fortified'
  | 'divine'
  | 'hero';

export type MovementType = 'ground' | 'flying';

export interface CreepFlags {
  flying?: boolean;
  frostImmune?: boolean;
  evasionChance?: number;
  invisible?: boolean;
  boss?: boolean;
  /**
   * Spell-immune creeps (every 5th wave in the original Green Circle TD):
   * immune to frost slow, take only 1/4 damage from non-chaos towers, and
   * take 5x damage from chaos towers.
   */
  immune?: boolean;
}

export interface CreepDef {
  id: string;
  name: string;
  armorClass: ArmorClass;
  armor: number;
  hp: number;
  speed: number;
  bounty: number;
  lifeLoss: number;
  flags?: CreepFlags;
}

export interface WaveEntry {
  wave: number;
  creep: CreepDef;
  count: number;
  spawnIntervalMs: number;
}

export interface AuraDef {
  radius: number;
  attackSpeedBonus?: number;
  damageBonus?: number;
  armorBonus?: number;
}

export interface TowerTierDef {
  tier: number;
  cost: number;
  sellRatio?: number;
  damage: number;
  cooldownMs: number;
  range: number;
  attackType: AttackType;
  splashRadius?: number;
  slowFactor?: number;
  slowDurationMs?: number;
  armorReduction?: number;
  armorReductionDurationMs?: number;
  poisonDps?: number;
  poisonDurationMs?: number;
  trueSight?: boolean;
  canTargetFlying?: boolean;
  aura?: AuraDef;
}

export interface TowerDef {
  id: string;
  name: string;
  description: string;
  color: string;
  tiers: TowerTierDef[];
}

export type TargetingMode = 'first' | 'last' | 'strongest' | 'weakest';
