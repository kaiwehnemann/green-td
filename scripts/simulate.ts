/**
 * Headless balance simulator: runs a fixed tower composition through all 30
 * waves without rendering, so compositions/balance can be checked quickly.
 * Usage: npm run sim
 */
import { Game } from '../src/core/Game';
import { TOWERS } from '../src/data/towers';
import { GRID_COLS, GRID_ROWS, isBuildable } from '../src/core/Grid';

const STEP_MS = 1000 / 60;
const MAX_SIM_MS = 20 * 60 * 1000; // 20 minutes of sim time safety cap

const LAYOUT: Array<{ id: string; x: number; y: number }> = [
  { id: 'ranger_post', x: 4, y: 2 },
  { id: 'ranger_post', x: 8, y: 2 },
  { id: 'siege_battery', x: 12, y: 4 },
  { id: 'frost_spire', x: 6, y: 4 },
  { id: 'war_totem', x: 10, y: 4 },
  { id: 'arcane_watcher', x: 14, y: 6 },
  { id: 'venom_tower', x: 8, y: 6 },
  { id: 'ranger_post', x: 16, y: 8 },
  { id: 'siege_battery', x: 10, y: 8 },
  { id: 'frost_spire', x: 6, y: 10 },
  { id: 'arcane_watcher', x: 14, y: 10 },
  { id: 'ranger_post', x: 10, y: 12 },
];

const placedSpots = new Set<string>();

/** Greedily spends whatever gold is available: places the next unbuilt layout
 * spot if affordable, otherwise upgrades the cheapest upgradable tower. */
function invest(game: Game): void {
  let progressed = true;
  while (progressed) {
    progressed = false;

    for (const spot of LAYOUT) {
      const key = `${spot.x},${spot.y}`;
      if (placedSpots.has(key)) continue;
      if (!isBuildable(spot.x, spot.y)) {
        placedSpots.add(key); // permanently unbuildable, stop retrying
        continue;
      }
      const def = TOWERS.find((t) => t.id === spot.id)!;
      if (!game.economy.canAfford(def.tiers[0].cost)) continue;
      game.setBuildingTower(def);
      if (game.tryPlaceTower(spot.x, spot.y)) {
        placedSpots.add(key);
        progressed = true;
      }
    }

    const upgradable = game.towers
      .filter((t) => t.canUpgrade && game.economy.canAfford(t.nextTier!.cost))
      .sort((a, b) => a.nextTier!.cost - b.nextTier!.cost);
    if (upgradable[0]) {
      game.selectedTower = upgradable[0];
      game.upgradeSelected();
      progressed = true;
    }
  }
}

function main(): void {
  let finished = false;
  let won = false;

  const game = new Game({
    onGoldChange: () => {},
    onLivesChange: () => {},
    onWaveChange: () => {},
    onGameOver: (w) => {
      finished = true;
      won = w;
    },
    onTowerSelected: () => {},
  });

  invest(game);
  console.log(`Grid: ${GRID_COLS}x${GRID_ROWS}, towers placed: ${game.towers.length}, gold left: ${game.economy.gold}`);

  let elapsed = 0;

  while (!finished && elapsed < MAX_SIM_MS) {
    if (game.canStartNextWave) {
      invest(game);
      game.startNextWave();
    }
    game.update(STEP_MS);
    elapsed += STEP_MS;
  }

  console.log('--- Simulation result ---');
  console.log(`Outcome: ${won ? 'WIN' : finished ? 'LOSS' : 'TIMEOUT'}`);
  console.log(`Wave reached: ${game.waveManager.waveNumber}/${game.waveManager.totalWaves}`);
  console.log(`Lives remaining: ${game.economy.lives}`);
  console.log(`Gold remaining: ${game.economy.gold}`);
  console.log(`Simulated time: ${(elapsed / 1000).toFixed(1)}s`);
}

main();
