import type { ArmorClass, CreepDef, WaveEntry } from '../core/types';

// Authentic wave table extracted from the original "Green Circle TD v3.1"
// (unit type, count, HP, armor, armor class, flying). HP is scaled down by
// a constant factor to fit single-player tower damage; the relative curve,
// counts, flying flags and the spell-immune waves (every 5th) are preserved.

interface RawWave {
  wave: number; name: string; count: number; hp: number; armor: number;
  armorClass: ArmorClass; flying: boolean; immune: boolean; bounty: number;
}

const RAW: RawWave[] = [
  { wave: 1, name: "Footman", count: 82, hp: 12, armor: 0, armorClass: 'medium', flying: false, immune: false, bounty: 4 },
  { wave: 2, name: "Rifleman", count: 189, hp: 12, armor: 0, armorClass: 'medium', flying: false, immune: false, bounty: 6 },
  { wave: 3, name: "Sorceress", count: 24, hp: 17, armor: 0, armorClass: 'medium', flying: false, immune: false, bounty: 7 },
  { wave: 4, name: "Spell Breaker", count: 104, hp: 12, armor: 0, armorClass: 'medium', flying: false, immune: false, bounty: 8 },
  { wave: 5, name: "Priest", count: 93, hp: 12, armor: 0, armorClass: 'medium', flying: false, immune: true, bounty: 10 },
  { wave: 6, name: "Knight", count: 185, hp: 14, armor: 0, armorClass: 'medium', flying: false, immune: false, bounty: 11 },
  { wave: 7, name: "Flying Machine", count: 133, hp: 22, armor: 0, armorClass: 'medium', flying: true, immune: false, bounty: 12 },
  { wave: 8, name: "Mortar Team", count: 189, hp: 48, armor: 0, armorClass: 'medium', flying: false, immune: false, bounty: 13 },
  { wave: 9, name: "Siege Engine", count: 16, hp: 484, armor: 0, armorClass: 'medium', flying: false, immune: false, bounty: 15 },
  { wave: 10, name: "Grunt", count: 121, hp: 15, armor: 0, armorClass: 'medium', flying: false, immune: true, bounty: 16 },
  { wave: 11, name: "Headhunter", count: 100, hp: 208, armor: 1, armorClass: 'medium', flying: false, immune: false, bounty: 17 },
  { wave: 12, name: "Witch Doctor", count: 32, hp: 1049, armor: 1, armorClass: 'medium', flying: false, immune: false, bounty: 19 },
  { wave: 13, name: "Shaman", count: 80, hp: 600, armor: 1, armorClass: 'medium', flying: false, immune: false, bounty: 20 },
  { wave: 14, name: "Raider", count: 182, hp: 480, armor: 1, armorClass: 'medium', flying: false, immune: false, bounty: 21 },
  { wave: 15, name: "Tauren", count: 28, hp: 780, armor: 1, armorClass: 'medium', flying: false, immune: true, bounty: 22 },
  { wave: 16, name: "Kodo Beast", count: 121, hp: 1779, armor: 0, armorClass: 'medium', flying: false, immune: false, bounty: 24 },
  { wave: 17, name: "Berserker", count: 40, hp: 6716, armor: 1, armorClass: 'medium', flying: true, immune: false, bounty: 25 },
  { wave: 18, name: "Spirit Walker", count: 20, hp: 16493, armor: 1, armorClass: 'medium', flying: false, immune: false, bounty: 26 },
  { wave: 19, name: "Ghoul", count: 200, hp: 2102, armor: 2, armorClass: 'hero', flying: false, immune: false, bounty: 28 },
  { wave: 20, name: "Crypt Fiend", count: 70, hp: 1601, armor: 2, armorClass: 'medium', flying: false, immune: true, bounty: 29 },
  { wave: 21, name: "Banshee", count: 25, hp: 25000, armor: 2, armorClass: 'hero', flying: false, immune: false, bounty: 30 },
  { wave: 22, name: "Necromancer", count: 105, hp: 8364, armor: 2, armorClass: 'hero', flying: false, immune: false, bounty: 32 },
  { wave: 23, name: "Gargoyle", count: 20, hp: 25000, armor: 16, armorClass: 'hero', flying: true, immune: false, bounty: 33 },
  { wave: 24, name: "Abomination", count: 140, hp: 5761, armor: 8, armorClass: 'hero', flying: false, immune: false, bounty: 34 },
  { wave: 25, name: "Meat Wagon", count: 111, hp: 1682, armor: 8, armorClass: 'medium', flying: false, immune: true, bounty: 36 },
  { wave: 26, name: "Obsidian Statue", count: 20, hp: 25000, armor: 30, armorClass: 'hero', flying: false, immune: false, bounty: 37 },
  { wave: 27, name: "Frost Wyrm", count: 200, hp: 6113, armor: 8, armorClass: 'hero', flying: true, immune: false, bounty: 38 },
  { wave: 28, name: "Blademaster", count: 15, hp: 21417, armor: 40, armorClass: 'medium', flying: false, immune: false, bounty: 39 },
  { wave: 29, name: "Demon Hunter", count: 165, hp: 15317, armor: 45, armorClass: 'medium', flying: false, immune: false, bounty: 41 },
  { wave: 30, name: "Mountain King", count: 200, hp: 1948, armor: 50, armorClass: 'medium', flying: false, immune: true, bounty: 42 },
  { wave: 31, name: "Infernal", count: 30, hp: 22162, armor: 55, armorClass: 'medium', flying: false, immune: false, bounty: 43 },
  { wave: 32, name: "Naga Sea Witch", count: 80, hp: 22355, armor: 60, armorClass: 'medium', flying: false, immune: false, bounty: 45 },
  { wave: 33, name: "Crypt Lord", count: 15, hp: 22555, armor: 75, armorClass: 'medium', flying: false, immune: false, bounty: 46 },
  { wave: 34, name: "Death Knight", count: 200, hp: 15317, armor: 80, armorClass: 'medium', flying: false, immune: false, bounty: 47 },
  { wave: 35, name: "Red Dragon", count: 145, hp: 23475, armor: 85, armorClass: 'hero', flying: true, immune: false, bounty: 48 },
  { wave: 36, name: "Spirit", count: 120, hp: 7543, armor: 90, armorClass: 'hero', flying: false, immune: false, bounty: 50 },
];

export const TOTAL_WAVES = RAW.length;

export const WAVES: WaveEntry[] = RAW.map((r) => {
  const creep: CreepDef = {
    id: `wave${r.wave}`,
    name: r.name,
    armorClass: r.armorClass,
    armor: r.armor,
    hp: r.hp,
    speed: 70 + Math.min(40, r.wave),
    bounty: r.bounty,
    lifeLoss: 1,
    flags: {
      flying: r.flying || undefined,
      immune: r.immune || undefined,
      frostImmune: r.immune || undefined,
      boss: r.wave === TOTAL_WAVES || undefined,
    },
  };
  const spawnIntervalMs = Math.max(180, Math.round(9000 / r.count));
  return { wave: r.wave, creep, count: r.count, spawnIntervalMs };
});

// Final-wave boss ability (kept from the earlier design): periodically weakens
// nearby towers with a stacking damage debuff.
export const BOSS_RESONANCE_INTERVAL_MS = 20000;
export const BOSS_RESONANCE_RADIUS = 220;
export const BOSS_RESONANCE_DAMAGE_REDUCTION_PER_STACK = 0.06;
