export interface HUDCallbacks {
  onStartWave: () => void;
  onSpeedChange: (speed: number) => void;
}

export class HUD {
  readonly el: HTMLDivElement;
  private goldEl: HTMLSpanElement;
  private livesEl: HTMLSpanElement;
  private waveEl: HTMLSpanElement;
  private startBtn: HTMLButtonElement;
  private speedBtns: HTMLButtonElement[] = [];
  private callbacks: HUDCallbacks;

  constructor(callbacks: HUDCallbacks) {
    this.callbacks = callbacks;
    this.el = document.createElement('div');
    this.el.className = 'hud';
    this.el.innerHTML = `
      <div class="hud-stats">
        <span>Gold: <b class="gold">0</b></span>
        <span>Leben: <b class="lives">0</b></span>
        <span>Welle: <b class="wave">0/0</b></span>
      </div>
      <div class="hud-controls">
        <button class="start-btn">Welle starten</button>
        <button class="speed-btn" data-speed="1">1x</button>
        <button class="speed-btn" data-speed="2">2x</button>
        <button class="speed-btn" data-speed="3">3x</button>
      </div>
    `;
    this.goldEl = this.el.querySelector('.gold')!;
    this.livesEl = this.el.querySelector('.lives')!;
    this.waveEl = this.el.querySelector('.wave')!;
    this.startBtn = this.el.querySelector('.start-btn')!;
    this.startBtn.addEventListener('click', () => this.callbacks.onStartWave());

    this.speedBtns = Array.from(this.el.querySelectorAll('.speed-btn'));
    for (const btn of this.speedBtns) {
      btn.addEventListener('click', () => {
        const speed = Number(btn.dataset.speed);
        this.callbacks.onSpeedChange(speed);
        this.setActiveSpeed(speed);
      });
    }
    this.setActiveSpeed(1);
  }

  setActiveSpeed(speed: number): void {
    for (const btn of this.speedBtns) {
      btn.classList.toggle('active', Number(btn.dataset.speed) === speed);
    }
  }

  setWaveButtonEnabled(enabled: boolean): void {
    this.startBtn.disabled = !enabled;
  }

  update(gold: number, lives: number, waveNumber: number, totalWaves: number): void {
    this.goldEl.textContent = String(gold);
    this.livesEl.textContent = String(lives);
    this.waveEl.textContent = `${Math.max(waveNumber, 0)}/${totalWaves}`;
  }
}
