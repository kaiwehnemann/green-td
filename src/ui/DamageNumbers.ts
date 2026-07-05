export interface DamageNumber {
  x: number;
  y: number;
  value: number;
  createdMs: number;
  crit: boolean;
}

const LIFETIME_MS = 700;
const RISE_PX = 30;

export class DamageNumbers {
  private numbers: DamageNumber[] = [];

  spawn(x: number, y: number, value: number, nowMs: number, crit = false): void {
    this.numbers.push({ x, y, value, createdMs: nowMs, crit });
  }

  update(nowMs: number): void {
    this.numbers = this.numbers.filter((n) => nowMs - n.createdMs < LIFETIME_MS);
  }

  draw(ctx: CanvasRenderingContext2D, nowMs: number): void {
    for (const n of this.numbers) {
      const t = (nowMs - n.createdMs) / LIFETIME_MS;
      const y = n.y - t * RISE_PX;
      const alpha = 1 - t;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = n.crit ? 'bold 16px sans-serif' : 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(0,0,0,0.85)';
      ctx.fillStyle = n.crit ? '#ffd23f' : '#ffffff';
      const text = Math.round(n.value).toString();
      ctx.strokeText(text, n.x, y);
      ctx.fillText(text, n.x, y);
      ctx.restore();
    }
  }
}
