import type { Creep } from '../entities/Creep';
import type { Tower } from '../entities/Tower';
import type { Projectile } from '../entities/Projectile';
import {
  CELL_SIZE,
  GRID_COLS,
  GRID_ROWS,
  PATH_WAYPOINTS,
  isBuildable,
} from '../core/Grid';
import { DamageNumbers } from '../ui/DamageNumbers';

const ARMOR_COLORS: Record<string, string> = {
  unarmored: '#d8d2c0',
  light: '#b6e07a',
  medium: '#e6cf5a',
  heavy: '#e8934a',
  fortified: '#d06f6f',
  divine: '#d79bec',
  hero: '#f4f4f4',
};

/** Deterministic per-cell pseudo-random in [0,1) for grass/decoration. */
function cellRand(x: number, y: number): number {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private damageNumbers: DamageNumbers;
  private terrain: HTMLCanvasElement; // cached static grass + road

  constructor(canvas: HTMLCanvasElement, damageNumbers: DamageNumbers) {
    this.damageNumbers = damageNumbers;
    canvas.width = GRID_COLS * CELL_SIZE;
    canvas.height = GRID_ROWS * CELL_SIZE;
    this.ctx = canvas.getContext('2d')!;
    this.terrain = document.createElement('canvas');
    this.terrain.width = canvas.width;
    this.terrain.height = canvas.height;
    this.buildTerrain();
  }

  private buildTerrain(): void {
    const ctx = this.terrain.getContext('2d')!;
    const w = this.terrain.width;
    const h = this.terrain.height;

    // Grass base with a subtle vertical gradient.
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#3f8f34');
    grad.addColorStop(1, '#2f7226');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Per-cell grass variation (checker of slightly different greens).
    for (let x = 0; x < GRID_COLS; x++) {
      for (let y = 0; y < GRID_ROWS; y++) {
        const r = cellRand(x, y);
        ctx.fillStyle = `rgba(${r > 0.5 ? '20,60,16' : '90,160,60'},${0.05 + r * 0.06})`;
        ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }
    }

    // Scattered bushes/tufts on non-path cells for flavour.
    for (let x = 0; x < GRID_COLS; x++) {
      for (let y = 0; y < GRID_ROWS; y++) {
        if (!isBuildable(x, y)) continue;
        const r = cellRand(x * 7 + 1, y * 13 + 3);
        if (r > 0.82) {
          const cx = (x + 0.5) * CELL_SIZE;
          const cy = (y + 0.5) * CELL_SIZE;
          this.drawBush(ctx, cx, cy, 5 + r * 4);
        }
      }
    }

    this.drawRoad(ctx);
  }

  private drawBush(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number): void {
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + r * 0.5, r, r * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#245a1a';
    ctx.beginPath();
    ctx.arc(cx - r * 0.4, cy, r * 0.7, 0, Math.PI * 2);
    ctx.arc(cx + r * 0.4, cy, r * 0.7, 0, Math.PI * 2);
    ctx.arc(cx, cy - r * 0.4, r * 0.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#357a26';
    ctx.beginPath();
    ctx.arc(cx, cy - r * 0.2, r * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawRoad(ctx: CanvasRenderingContext2D): void {
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    const trace = () => {
      ctx.beginPath();
      ctx.moveTo(PATH_WAYPOINTS[0].x, PATH_WAYPOINTS[0].y);
      for (let i = 1; i < PATH_WAYPOINTS.length; i++) {
        ctx.lineTo(PATH_WAYPOINTS[i].x, PATH_WAYPOINTS[i].y);
      }
    };

    // Darker soil border.
    ctx.strokeStyle = '#7d6b43';
    ctx.lineWidth = CELL_SIZE * 0.92;
    trace();
    ctx.stroke();

    // Sandy road fill.
    ctx.strokeStyle = '#c9b783';
    ctx.lineWidth = CELL_SIZE * 0.74;
    trace();
    ctx.stroke();

    // Center highlight.
    ctx.strokeStyle = 'rgba(226,214,175,0.55)';
    ctx.lineWidth = CELL_SIZE * 0.3;
    trace();
    ctx.stroke();
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

    ctx.drawImage(this.terrain, 0, 0);

    if (hoverCell) {
      const buildable = isBuildable(hoverCell.x, hoverCell.y);
      ctx.fillStyle = buildable ? 'rgba(150,255,140,0.35)' : 'rgba(255,70,70,0.35)';
      ctx.fillRect(hoverCell.x * CELL_SIZE, hoverCell.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      ctx.strokeStyle = buildable ? 'rgba(220,255,200,0.8)' : 'rgba(255,140,140,0.8)';
      ctx.lineWidth = 2;
      ctx.strokeRect(hoverCell.x * CELL_SIZE + 1, hoverCell.y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
    }

    for (const tower of towers) {
      this.drawTower(tower, tower === selectedTower);
    }

    for (const creep of creeps) {
      this.drawCreep(creep, nowMs);
    }

    for (const p of projectiles) {
      ctx.fillStyle = '#fff6c4';
      ctx.strokeStyle = 'rgba(120,90,20,0.6)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    this.damageNumbers.draw(ctx, nowMs);
  }

  private drawTower(tower: Tower, selected: boolean): void {
    const { ctx } = this;
    const r = CELL_SIZE * 0.36;

    if (selected) {
      ctx.strokeStyle = 'rgba(255,255,255,0.55)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(tower.x, tower.y, tower.tier.range, 0, Math.PI * 2);
      ctx.stroke();
      if (tower.tier.aura) {
        ctx.strokeStyle = 'rgba(255,215,80,0.45)';
        ctx.beginPath();
        ctx.arc(tower.x, tower.y, tower.tier.aura.radius, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Stone base.
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(tower.x, tower.y + r * 0.6, r * 1.05, r * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#7c7466';
    ctx.beginPath();
    ctx.arc(tower.x, tower.y, r * 0.95, 0, Math.PI * 2);
    ctx.fill();

    // Colored turret top.
    ctx.fillStyle = tower.def.color;
    ctx.beginPath();
    ctx.arc(tower.x, tower.y - r * 0.15, r * 0.72, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.45)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Highlight.
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    ctx.arc(tower.x - r * 0.25, tower.y - r * 0.4, r * 0.22, 0, Math.PI * 2);
    ctx.fill();

    // Tier pips.
    for (let i = 0; i <= tower.tierIndex; i++) {
      ctx.fillStyle = '#ffe9a8';
      ctx.beginPath();
      ctx.arc(tower.x - r * 0.5 + i * r * 0.42, tower.y + r * 0.75, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawCreep(creep: Creep, nowMs: number): void {
    const { ctx } = this;
    if (creep.dead) return;
    const boss = creep.def.flags?.boss;
    const r = boss ? 22 : 10;
    const flashing = nowMs < creep.flashUntilMs;
    const isInvisible = creep.def.flags?.invisible && !creep.isRevealed;

    ctx.save();
    ctx.globalAlpha = isInvisible ? 0.35 : 1;

    // Shadow.
    ctx.globalAlpha *= 1;
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(creep.x, creep.y + r * 0.7, r * 0.9, r * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body.
    const base = flashing ? '#ffffff' : ARMOR_COLORS[creep.def.armorClass] ?? '#ffffff';
    ctx.fillStyle = base;
    ctx.beginPath();
    ctx.arc(creep.x, creep.y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.lineWidth = boss ? 3 : 1.5;
    ctx.stroke();

    // Highlight.
    if (!flashing) {
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.beginPath();
      ctx.arc(creep.x - r * 0.3, creep.y - r * 0.35, r * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Status tints.
    if (creep.slowFactor < 1) {
      ctx.strokeStyle = 'rgba(120,210,240,0.9)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(creep.x, creep.y, r + 2, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (creep.def.flags?.flying) {
      ctx.strokeStyle = 'rgba(220,255,255,0.9)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(creep.x, creep.y, r + 4, 0.2, Math.PI - 0.2);
      ctx.stroke();
    }
    ctx.restore();

    // HP bar.
    const barW = boss ? 60 : 22;
    const pct = Math.max(0, creep.hp / creep.maxHp);
    const by = creep.y - r - 9;
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(creep.x - barW / 2 - 1, by - 1, barW + 2, 6);
    ctx.fillStyle = pct > 0.5 ? '#5fd35f' : pct > 0.25 ? '#e0c34a' : '#e05c5c';
    ctx.fillRect(creep.x - barW / 2, by, barW * pct, 4);
  }
}
