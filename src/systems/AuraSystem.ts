import type { Tower } from '../entities/Tower';

export interface AuraBonuses {
  attackSpeedBonus: number;
  damageBonus: number;
  armorBonus: number;
}

const NONE: AuraBonuses = { attackSpeedBonus: 0, damageBonus: 0, armorBonus: 0 };

/** Aura effects stack additively across every aura tower in range. */
export function computeAuraBonuses(target: Tower, towers: Tower[]): AuraBonuses {
  let attackSpeedBonus = 0;
  let damageBonus = 0;
  let armorBonus = 0;

  for (const source of towers) {
    if (source === target) continue;
    const aura = source.tier.aura;
    if (!aura) continue;
    const dist = Math.hypot(source.x - target.x, source.y - target.y);
    if (dist > aura.radius) continue;
    attackSpeedBonus += aura.attackSpeedBonus ?? 0;
    damageBonus += aura.damageBonus ?? 0;
    armorBonus += aura.armorBonus ?? 0;
  }

  if (attackSpeedBonus === 0 && damageBonus === 0 && armorBonus === 0) return NONE;
  return { attackSpeedBonus, damageBonus, armorBonus };
}
