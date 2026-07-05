import type { TowerDef } from '../core/types';

export const TOWERS: TowerDef[] = [
  {
    id: 'ranger_post',
    name: 'Ranger Post',
    description: 'Fast single-target pierce shots. Excellent against lightly armored foes.',
    color: '#6fae3d',
    tiers: [
      { tier: 1, cost: 50, damage: 12, cooldownMs: 500, range: 140, attackType: 'pierce', armorReduction: 1, armorReductionDurationMs: 2000 },
      { tier: 2, cost: 75, damage: 20, cooldownMs: 460, range: 150, attackType: 'pierce', armorReduction: 2, armorReductionDurationMs: 2000 },
      { tier: 3, cost: 150, damage: 34, cooldownMs: 420, range: 160, attackType: 'pierce', armorReduction: 3, armorReductionDurationMs: 2200 },
      { tier: 4, cost: 320, damage: 58, cooldownMs: 360, range: 175, attackType: 'pierce', armorReduction: 4, armorReductionDurationMs: 2200 },
    ],
  },
  {
    id: 'siege_battery',
    name: 'Siege Battery',
    description: 'Slow splash damage, devastating against heavy armor and fortifications.',
    color: '#8a6d3b',
    tiers: [
      { tier: 1, cost: 90, damage: 30, cooldownMs: 1400, range: 130, attackType: 'siege', splashRadius: 45 },
      { tier: 2, cost: 140, damage: 48, cooldownMs: 1350, range: 140, attackType: 'siege', splashRadius: 50 },
      { tier: 3, cost: 260, damage: 78, cooldownMs: 1300, range: 150, attackType: 'siege', splashRadius: 58 },
      { tier: 4, cost: 480, damage: 130, cooldownMs: 1200, range: 165, attackType: 'siege', splashRadius: 65 },
    ],
  },
  {
    id: 'frost_spire',
    name: 'Frost Spire',
    description: 'Magic bolts that chill enemies, slowing their movement.',
    color: '#5ec9d6',
    tiers: [
      {
        tier: 1, cost: 80, damage: 8, cooldownMs: 700, range: 130, attackType: 'magic',
        slowFactor: 0.7, slowDurationMs: 1500,
      },
      {
        tier: 2, cost: 120, damage: 14, cooldownMs: 650, range: 140, attackType: 'magic',
        slowFactor: 0.6, slowDurationMs: 1600,
      },
      {
        tier: 3, cost: 220, damage: 24, cooldownMs: 600, range: 150, attackType: 'magic',
        slowFactor: 0.5, slowDurationMs: 1700,
      },
      {
        tier: 4, cost: 400, damage: 40, cooldownMs: 550, range: 165, attackType: 'magic',
        slowFactor: 0.4, slowDurationMs: 1800,
      },
    ],
  },
  {
    id: 'war_totem',
    name: 'War Totem',
    description: 'Support structure. Empowers nearby towers with attack speed and damage.',
    color: '#c48a2f',
    tiers: [
      {
        tier: 1, cost: 100, damage: 0, cooldownMs: 1000, range: 0, attackType: 'normal',
        aura: { radius: 160, attackSpeedBonus: 0.1, damageBonus: 0.05 },
      },
      {
        tier: 2, cost: 160, damage: 0, cooldownMs: 1000, range: 0, attackType: 'normal',
        aura: { radius: 175, attackSpeedBonus: 0.18, damageBonus: 0.1 },
      },
      {
        tier: 3, cost: 300, damage: 0, cooldownMs: 1000, range: 0, attackType: 'normal',
        aura: { radius: 190, attackSpeedBonus: 0.28, damageBonus: 0.18 },
      },
      {
        tier: 4, cost: 520, damage: 0, cooldownMs: 1000, range: 0, attackType: 'normal',
        aura: { radius: 210, attackSpeedBonus: 0.4, damageBonus: 0.28 },
      },
    ],
  },
  {
    id: 'arcane_watcher',
    name: 'Arcane Watcher',
    description: 'Reveals invisible creatures and strikes flying units with arcane bolts.',
    color: '#9b6fd6',
    tiers: [
      {
        tier: 1, cost: 110, damage: 14, cooldownMs: 800, range: 150, attackType: 'magic',
        trueSight: true, canTargetFlying: true,
      },
      {
        tier: 2, cost: 170, damage: 22, cooldownMs: 760, range: 160, attackType: 'magic',
        trueSight: true, canTargetFlying: true,
      },
      {
        tier: 3, cost: 300, damage: 38, cooldownMs: 700, range: 175, attackType: 'magic',
        trueSight: true, canTargetFlying: true,
      },
      {
        tier: 4, cost: 540, damage: 64, cooldownMs: 640, range: 190, attackType: 'magic',
        trueSight: true, canTargetFlying: true,
      },
    ],
  },
  {
    id: 'venom_tower',
    name: 'Venom Tower',
    description: 'Chaos damage that ignores armor entirely, plus a lingering poison.',
    color: '#4f8a3d',
    tiers: [
      {
        tier: 1, cost: 95, damage: 6, cooldownMs: 900, range: 125, attackType: 'chaos',
        poisonDps: 4, poisonDurationMs: 3000,
      },
      {
        tier: 2, cost: 150, damage: 10, cooldownMs: 860, range: 135, attackType: 'chaos',
        poisonDps: 7, poisonDurationMs: 3200,
      },
      {
        tier: 3, cost: 270, damage: 17, cooldownMs: 800, range: 145, attackType: 'chaos',
        poisonDps: 12, poisonDurationMs: 3400,
      },
      {
        tier: 4, cost: 480, damage: 28, cooldownMs: 740, range: 160, attackType: 'chaos',
        poisonDps: 20, poisonDurationMs: 3600,
      },
    ],
  },
];

export const SELL_RATIO = 1.0; // classic archer-exploit default: full refund on sell
export const STARTING_GOLD = 200;
export const STARTING_LIVES = 20;
