import combatMatrix from '../data/combatMatrix.json';
import type { AttackType, ArmorClass } from './types';

/**
 * Armor damage multiplier. Positive armor reduces damage taken (diminishing
 * returns), negative armor amplifies it. Both branches meet at 1.0 for armor 0.
 */
export function armorMultiplier(armor: number): number {
  if (armor >= 0) {
    const dr = (0.06 * armor) / (1 + 0.06 * armor);
    return 1 - dr;
  }
  const di = 2 - Math.pow(0.94, -armor);
  return di;
}

export function attackTypeMultiplier(attackType: AttackType, armorClass: ArmorClass): number {
  const table = combatMatrix as Record<AttackType, Record<ArmorClass, number>>;
  return table[attackType][armorClass];
}

export interface DamageInput {
  baseDamage: number;
  attackType: AttackType;
  armorClass: ArmorClass;
  armor: number;
}

export function calculateDamage({ baseDamage, attackType, armorClass, armor }: DamageInput): number {
  const typeMult = attackTypeMultiplier(attackType, armorClass);
  const armorMult = armorMultiplier(armor);
  return Math.max(0, baseDamage * typeMult * armorMult);
}

export function effectiveHp(hp: number, armor: number): number {
  const mult = armorMultiplier(armor);
  if (mult <= 0) return Infinity;
  return hp / mult;
}
