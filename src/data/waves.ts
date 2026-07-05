import type { ArmorClass, CreepDef, WaveEntry } from '../core/types';

interface WaveSpec {
  name: string;
  armorClass: ArmorClass;
  armor: number;
  baseHp: number;
  speed: number;
  bounty: number;
  count: number;
  spawnIntervalMs: number;
  flags?: CreepDef['flags'];
}

const HP_GROWTH = 1.16;

function scaledHp(base: number, wave: number): number {
  return Math.round(base * Math.pow(HP_GROWTH, wave - 1));
}

const SPECS: Record<number, WaveSpec> = {
  1: { name: 'Sprig Crawler', armorClass: 'unarmored', armor: 0, baseHp: 40, speed: 80, bounty: 3, count: 10, spawnIntervalMs: 700 },
  2: { name: 'Sprig Crawler', armorClass: 'unarmored', armor: 0, baseHp: 40, speed: 82, bounty: 3, count: 12, spawnIntervalMs: 650 },
  3: { name: 'Leaf Skitter', armorClass: 'light', armor: 2, baseHp: 55, speed: 95, bounty: 4, count: 12, spawnIntervalMs: 650 },
  4: { name: 'Leaf Skitter', armorClass: 'light', armor: 2, baseHp: 55, speed: 98, bounty: 4, count: 14, spawnIntervalMs: 600 },
  5: { name: 'Bramble Hulk', armorClass: 'medium', armor: 4, baseHp: 90, speed: 70, bounty: 6, count: 12, spawnIntervalMs: 700 },
  6: { name: 'Bramble Hulk', armorClass: 'medium', armor: 4, baseHp: 90, speed: 72, bounty: 6, count: 14, spawnIntervalMs: 650 },
  7: { name: 'Leaf Skitter', armorClass: 'light', armor: 3, baseHp: 70, speed: 105, bounty: 5, count: 18, spawnIntervalMs: 500 },
  8: { name: 'Gust Wisp', armorClass: 'unarmored', armor: 0, baseHp: 65, speed: 110, bounty: 6, count: 16, spawnIntervalMs: 550, flags: { flying: true } },
  9: { name: 'Bramble Hulk', armorClass: 'medium', armor: 5, baseHp: 110, speed: 74, bounty: 7, count: 16, spawnIntervalMs: 600 },
  10: { name: 'Ironbark Golem', armorClass: 'heavy', armor: 8, baseHp: 220, speed: 55, bounty: 12, count: 10, spawnIntervalMs: 900 },
  11: { name: 'Leaf Skitter', armorClass: 'light', armor: 4, baseHp: 85, speed: 108, bounty: 6, count: 20, spawnIntervalMs: 480 },
  12: { name: 'Shade Lurker', armorClass: 'medium', armor: 5, baseHp: 130, speed: 85, bounty: 9, count: 16, spawnIntervalMs: 560, flags: { invisible: true } },
  13: { name: 'Ironbark Golem', armorClass: 'heavy', armor: 9, baseHp: 260, speed: 56, bounty: 13, count: 12, spawnIntervalMs: 850 },
  14: { name: 'Gust Wisp', armorClass: 'unarmored', armor: 0, baseHp: 90, speed: 115, bounty: 7, count: 20, spawnIntervalMs: 500, flags: { flying: true } },
  15: { name: 'Bramble Hulk', armorClass: 'medium', armor: 6, baseHp: 150, speed: 78, bounty: 9, count: 20, spawnIntervalMs: 550 },
  16: { name: 'Quickfoot Sprite', armorClass: 'light', armor: 4, baseHp: 100, speed: 120, bounty: 8, count: 20, spawnIntervalMs: 480, flags: { evasionChance: 0.5 } },
  17: { name: 'Ironbark Golem', armorClass: 'heavy', armor: 10, baseHp: 320, speed: 58, bounty: 15, count: 14, spawnIntervalMs: 800 },
  18: { name: 'Shade Lurker', armorClass: 'medium', armor: 6, baseHp: 170, speed: 88, bounty: 10, count: 20, spawnIntervalMs: 520, flags: { invisible: true } },
  19: { name: 'Gust Wisp', armorClass: 'unarmored', armor: 2, baseHp: 140, speed: 118, bounty: 9, count: 22, spawnIntervalMs: 460, flags: { flying: true } },
  20: { name: 'Rimehide Beast', armorClass: 'heavy', armor: 11, baseHp: 380, speed: 60, bounty: 16, count: 16, spawnIntervalMs: 750, flags: { frostImmune: true } },
  21: { name: 'Quickfoot Sprite', armorClass: 'light', armor: 5, baseHp: 130, speed: 125, bounty: 9, count: 24, spawnIntervalMs: 440, flags: { evasionChance: 0.5 } },
  22: { name: 'Stone Warden', armorClass: 'fortified', armor: 14, baseHp: 520, speed: 50, bounty: 20, count: 14, spawnIntervalMs: 850 },
  23: { name: 'Shade Lurker', armorClass: 'medium', armor: 7, baseHp: 210, speed: 90, bounty: 11, count: 22, spawnIntervalMs: 500, flags: { invisible: true } },
  24: { name: 'Rimehide Beast', armorClass: 'heavy', armor: 12, baseHp: 440, speed: 62, bounty: 17, count: 18, spawnIntervalMs: 700, flags: { frostImmune: true } },
  25: { name: 'Gust Wisp', armorClass: 'unarmored', armor: 3, baseHp: 190, speed: 122, bounty: 10, count: 26, spawnIntervalMs: 420, flags: { flying: true } },
  26: { name: 'Stone Warden', armorClass: 'fortified', armor: 16, baseHp: 620, speed: 52, bounty: 22, count: 16, spawnIntervalMs: 800 },
  27: { name: 'Quickfoot Sprite', armorClass: 'light', armor: 6, baseHp: 170, speed: 128, bounty: 11, count: 26, spawnIntervalMs: 400, flags: { evasionChance: 0.5 } },
  28: { name: 'Shade Lurker', armorClass: 'medium', armor: 8, baseHp: 260, speed: 92, bounty: 13, count: 24, spawnIntervalMs: 460, flags: { invisible: true } },
  29: { name: 'Rimehide Beast', armorClass: 'heavy', armor: 14, baseHp: 520, speed: 64, bounty: 19, count: 22, spawnIntervalMs: 620, flags: { frostImmune: true } },
  30: {
    name: 'Verdant Colossus', armorClass: 'divine', armor: 20, baseHp: 24000, speed: 45, bounty: 500,
    count: 1, spawnIntervalMs: 0, flags: { boss: true },
  },
};

export function buildWaves(): WaveEntry[] {
  const waves: WaveEntry[] = [];
  for (let wave = 1; wave <= 30; wave++) {
    const spec = SPECS[wave];
    const creep: CreepDef = {
      id: `wave${wave}_${spec.name.toLowerCase().replace(/\s+/g, '_')}`,
      name: spec.name,
      armorClass: spec.armorClass,
      armor: spec.armor,
      hp: wave === 30 ? spec.baseHp : scaledHp(spec.baseHp, wave),
      speed: spec.speed,
      bounty: spec.bounty,
      lifeLoss: spec.flags?.boss ? 10 : 1,
      flags: spec.flags,
    };
    waves.push({ wave, creep, count: spec.count, spawnIntervalMs: spec.spawnIntervalMs });
  }
  return waves;
}

export const WAVES: WaveEntry[] = buildWaves();

/** Boss (wave 30) special ability: every 20s, stacks a debuff on all towers in range, reducing their damage. */
export const BOSS_RESONANCE_INTERVAL_MS = 20000;
export const BOSS_RESONANCE_RADIUS = 220;
export const BOSS_RESONANCE_DAMAGE_REDUCTION_PER_STACK = 0.08;
