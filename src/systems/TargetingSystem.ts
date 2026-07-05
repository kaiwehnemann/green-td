import type { Creep } from '../entities/Creep';
import type { Tower } from '../entities/Tower';

export function pickTarget(tower: Tower, creeps: Creep[]): Creep | null {
  const candidates = creeps.filter(
    (c) => !c.dead && !c.reachedEnd && tower.inRange(c) && tower.canSee(c)
  );
  if (candidates.length === 0) return null;

  switch (tower.targeting) {
    case 'last':
      return candidates.reduce((a, b) => (b.waypointIndex < a.waypointIndex ? b : a));
    case 'strongest':
      return candidates.reduce((a, b) => (b.hp > a.hp ? b : a));
    case 'weakest':
      return candidates.reduce((a, b) => (b.hp < a.hp ? b : a));
    case 'first':
    default:
      return candidates.reduce((a, b) => (b.waypointIndex > a.waypointIndex ? b : a));
  }
}
