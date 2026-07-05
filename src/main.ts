import './styles.css';
import { Game } from './core/Game';
import { HUD } from './ui/HUD';
import { TowerPanel } from './ui/TowerPanel';
import { Renderer } from './render/Renderer';
import { GameLoop } from './core/GameLoop';
import { CELL_SIZE, isBuildable } from './core/Grid';
import { STARTING_GOLD } from './data/towers';

const root = document.getElementById('app')!;
root.classList.add('game-root');

const canvasColumn = document.createElement('div');
canvasColumn.className = 'canvas-column';
const canvas = document.createElement('canvas');

let hoverCell: { x: number; y: number } | null = null;

const hud = new HUD({
  onStartWave: () => game.startNextWave(),
  onSpeedChange: (speed) => loop.setSpeed(speed),
});

const towerPanel = new TowerPanel(
  {
    onSelectBuildTower: (def) => game.setBuildingTower(def),
    onUpgrade: () => game.upgradeSelected(),
    onSell: () => game.sellSelected(),
    onTargetingChange: (mode) => game.setTargetingForSelected(mode),
  },
  STARTING_GOLD
);
towerPanel.clearInfo();

const game = new Game({
  onGoldChange: (gold) => {
    hud.update(game.economy.gold, game.economy.lives, game.waveManager.waveNumber, game.waveManager.totalWaves);
    towerPanel.setGold(gold);
  },
  onLivesChange: () => {
    hud.update(game.economy.gold, game.economy.lives, game.waveManager.waveNumber, game.waveManager.totalWaves);
  },
  onWaveChange: (waveNumber, totalWaves) => {
    hud.update(game.economy.gold, game.economy.lives, waveNumber, totalWaves);
    hud.setWaveButtonEnabled(game.canStartNextWave);
  },
  onGameOver: (won) => {
    showOverlay(won ? 'Sieg! Alle Wellen überstanden.' : 'Game Over');
  },
  onTowerSelected: (tower) => {
    if (tower) {
      towerPanel.showTowerInfo(tower);
    } else {
      towerPanel.clearInfo();
    }
  },
});

canvasColumn.appendChild(hud.el);
canvasColumn.appendChild(canvas);
root.appendChild(canvasColumn);
root.appendChild(towerPanel.el);

const renderer = new Renderer(canvas, game.damageNumbers);

canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
  const y = Math.floor((e.clientY - rect.top) / CELL_SIZE);
  hoverCell = { x, y };
});

canvas.addEventListener('mouseleave', () => {
  hoverCell = null;
});

canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
  const y = Math.floor((e.clientY - rect.top) / CELL_SIZE);

  if (game.buildingDef) {
    const placed = game.tryPlaceTower(x, y);
    if (placed) towerPanel.clearBuildSelection();
    return;
  }

  if (!isBuildable(x, y)) {
    game.selectTowerAt(x, y);
    return;
  }
  game.selectTowerAt(x, y);
});

function showOverlay(message: string): void {
  loop.stop();
  const overlay = document.createElement('div');
  overlay.className = 'overlay';
  overlay.innerHTML = `<div>${message}</div>`;
  document.body.appendChild(overlay);
}

const loop = new GameLoop(
  (dtMs) => game.update(dtMs),
  () => {
    renderer.draw({
      creeps: game.creeps,
      towers: game.towers,
      projectiles: game.projectiles,
      hoverCell,
      selectedTower: game.selectedTower,
      nowMs: performance.now(),
    });
  }
);

hud.update(game.economy.gold, game.economy.lives, 0, game.waveManager.totalWaves);
hud.setWaveButtonEnabled(true);
loop.start();
