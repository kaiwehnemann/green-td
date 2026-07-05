import type { Creep } from '../entities/Creep';
import type { Tower } from '../entities/Tower';
import type { Projectile } from '../entities/Projectile';
import { CELL_SIZE, GRID_COLS, GRID_ROWS, isBuildable, isPathCell } from '../core/Grid';
import { DamageNumbers } from '../ui/DamageNumbers';

const ARMOR_COLORS: Record<string, string> = {
  unarmored: '#c9c9c9',
  light: '#9fd66c',
  medium: '#e0c34a',
  heavy: '#e08a3d',
  fortified: '#c56b6b',
  divine: '#d18fe0',
  hero: '#f2f2f2',
};

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private damageNumbers: DamageNumbers;

  constructor(canvas: HTMLCanvasElement, damageNumbers: DamageNumbers) {
    this.canvas = canvas;
    this.damageNumbers = damageNumbers;
    canvas.width = GRID_COLS * CELL_SIZE;
    canvas.height = GRID_ROWS * CELL_SIZE;
    this.ctx = canvas.getContext('2d')!;
  }

  draw(opts: {
    creeps: Creep[];
    towers: Tower[];
    projectiles: Projectile[];
    hoverCell: { x: number; y: number } | null;
    selectedTower: Tower | null;
    nowMs: number;
  }): void {
    const { ctx } = this;
    const { creeps, towers, projectiles, hoverCell, selectedTower, nowMs } = opts;

    ctx.fillStyle = '#182617';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawGrid();
    this.drawPath();

    if (hoverCell) {
      const buildable = isBuildable(hoverCell.x, hoverCell.y);
      ctx.fillStyle = buildable ? 'rgba(120,255,120,0.25)' : 'rgba(255,80,80,0.3)';
      ctx.fillRect(hoverCell.x * CELL_SIZE, hoverCell.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }

    for (const tower of towers) {
      this.drawTower(tower, tower === selectedTower);
    }

    for (const creep of creeps) {
      this.drawCreep(creep, nowMs);
    }

    for (const p of projectiles) {
      ctx.fillStyle = '#fff6c4';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    this.damageNumbers.draw(ctx, nowMs);
  }

  private drawGrid(): void {
    const { ctx } = this;
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= GRID_COLS; x++) {
      ctx.beginPath();
      ctx.moveTo(x * CELL_SIZE, 0);
      ctx.lineTo(x * CELL_SIZE, GRID_ROWS * CELL_SIZE);
      ctx.stroke();
    }
    for (let y = 0; y <= GRID_ROWS; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * CELL_SIZE);
      ctx.lineTo(GRID_COLS * CELL_SIZE, y * CELL_SIZE);
      ctx.stroke();
    }
  }

  private drawPath(): void {
    const { ctx } = this;
    ctx.fillStyle = '#4a3a24';
    for (let x = 0; x < GRID_COLS; x++) {
      for (let y = 0; y < GRID_ROWS; y++) {
        if (isPathCell(x, y)) {
          ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
      }
    }
  }

  private drawTower(tower: Tower, selected: boolean): void {
    const { ctx } = this;
    const r = CELL_SIZE * 0.38;

    if (selected) {
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.beginPath();
      ctx.arc(tower.x, tower.y, tower.tier.range, 0, Math.PI * 2);
      ctx.stroke();
      if (tower.tier.aura) {
        ctx.strokeStyle = 'rgba(255,215,80,0.4)';
        ctx.beginPath();
        ctx.arc(tower.x, tower.y, tower.tier.aura.radius, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    ctx.fillStyle = tower.def.color;
    ctx.beginPath();
    ctx.arc(tower.x, tower.y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#10140f';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(String(tower.tierIndex + 1), tower.x, tower.y + 4);
  }

  private drawCreep(creep: Creep, nowMs: number): void {
    const { ctx } = this;
    if (creep.dead) return;
    const r = 10;
    const flashing = nowMs < creep.flashUntilMs;
    const isInvisible = creep.def.flags?.invisible && !creep.isRevealed;

    ctx.save();
    ctx.globalAlpha = isInvisible ? 0.35 : 1;
    ctx.fillStyle = flashing ? '#ffffff' : ARMOR_COLORS[creep.def.armorClass] ?? '#ffffff';
    ctx.beginPath();
    ctx.arc(creep.x, creep.y, creep.def.flags?.boss ? r * 2.2 : r, 0, Math.PI * 2);
    ctx.fill();
    if (creep.def.flags?.flying) {
      ctx.strokeStyle = '#dff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    ctx.restore();

    // HP bar
    const barW = 22;
    const pct = Math.max(0, creep.hp / creep.maxHp);
    ctx.fillStyle = '#000';
    ctx.fillRect(creep.x - barW / 2, creep.y - r - 10, barW, 4);
    ctx.fillStyle = pct > 0.5 ? '#5fd35f' : pct > 0.25 ? '#e0c34a' : '#e05c5c';
    ctx.fillRect(creep.x - barW / 2, creep.y - r - 10, barW * pct, 4);
  }
}
