import { describe, it, expect } from 'vitest';
import { armorMultiplier, effectiveHp, calculateDamage } from './CombatCalculator';

describe('armorMultiplier', () => {
  it('returns 1.0 at zero armor', () => {
    expect(armorMultiplier(0)).toBeCloseTo(1.0, 5);
  });

  it('reduces damage taken with positive armor (armor 10 -> 0.625x)', () => {
    expect(armorMultiplier(10)).toBeCloseTo(0.625, 4);
  });

  it('amplifies damage taken with negative armor (armor -10 -> +46.14%)', () => {
    const mult = armorMultiplier(-10);
    expect(mult).toBeCloseTo(1.4614, 3);
  });
});

describe('effectiveHp', () => {
  it('1000 HP with 10 armor -> 1600 EHP', () => {
    expect(effectiveHp(1000, 10)).toBeCloseTo(1600, 0);
  });

  it('1000 HP with -10 armor -> ~684 EHP', () => {
    expect(effectiveHp(1000, -10)).toBeCloseTo(1000 / 1.4614, 0);
  });
});

describe('calculateDamage', () => {
  it('applies both attack-type and armor multipliers', () => {
    const dmg = calculateDamage({
      baseDamage: 100,
      attackType: 'pierce',
      armorClass: 'light',
      armor: 0,
    });
    // pierce vs light = 1.5x, armor 0 = 1.0x
    expect(dmg).toBeCloseTo(150, 4);
  });

  it('never returns negative damage', () => {
    const dmg = calculateDamage({
      baseDamage: 1,
      attackType: 'siege',
      armorClass: 'divine',
      armor: 50,
    });
    expect(dmg).toBeGreaterThanOrEqual(0);
  });
});
