import type { TowerDef, TargetingMode } from '../core/types';
import type { Tower } from '../entities/Tower';
import { TOWERS, SELL_RATIO } from '../data/towers';

export interface TowerPanelCallbacks {
  onSelectBuildTower: (def: TowerDef | null) => void;
  onUpgrade: () => void;
  onSell: () => void;
  onTargetingChange: (mode: TargetingMode) => void;
}

export class TowerPanel {
  readonly el: HTMLDivElement;
  private shopEl: HTMLDivElement;
  private infoEl: HTMLDivElement;
  private selectedBuildId: string | null = null;
  private callbacks: TowerPanelCallbacks;
  private gold: number;

  constructor(callbacks: TowerPanelCallbacks, gold: number) {
    this.callbacks = callbacks;
    this.gold = gold;
    this.el = document.createElement('div');
    this.el.className = 'tower-panel';
    this.shopEl = document.createElement('div');
    this.shopEl.className = 'shop';
    this.infoEl = document.createElement('div');
    this.infoEl.className = 'info';
    this.el.appendChild(this.shopEl);
    this.el.appendChild(this.infoEl);
    this.renderShop();
  }

  setGold(gold: number): void {
    this.gold = gold;
    this.renderShop();
  }

  private renderShop(): void {
    this.shopEl.innerHTML = '<h3>Türme</h3>';
    for (const def of TOWERS) {
      const cost = def.tiers[0].cost;
      const btn = document.createElement('button');
      btn.className = 'tower-btn';
      if (this.selectedBuildId === def.id) btn.classList.add('active');
      btn.disabled = this.gold < cost;
      btn.innerHTML = `<span class="swatch" style="background:${def.color}"></span>${def.name} (${cost}g)`;
      btn.title = def.description;
      btn.addEventListener('click', () => {
        this.selectedBuildId = this.selectedBuildId === def.id ? null : def.id;
        this.callbacks.onSelectBuildTower(this.selectedBuildId ? def : null);
        this.renderShop();
      });
      this.shopEl.appendChild(btn);
    }
  }

  clearBuildSelection(): void {
    this.selectedBuildId = null;
    this.renderShop();
  }

  showTowerInfo(tower: Tower): void {
    const tier = tower.tier;
    const next = tower.nextTier;
    const sellValue = tower.sellValue(SELL_RATIO);
    this.infoEl.innerHTML = `
      <h3>${tower.def.name} (Stufe ${tower.tierIndex + 1})</h3>
      <p>${tower.def.description}</p>
      <p>Schaden: ${tier.damage} (${tier.attackType})</p>
      <p>Reichweite: ${tier.range}</p>
      <p>Cooldown: ${tier.cooldownMs}ms</p>
      <div class="targeting">
        ${(['first', 'last', 'strongest', 'weakest'] as TargetingMode[])
          .map(
            (mode) =>
              `<button data-mode="${mode}" class="${tower.targeting === mode ? 'active' : ''}">${mode}</button>`
          )
          .join('')}
      </div>
      ${next ? `<button class="upgrade-btn">Ausbauen (${next.cost}g)</button>` : '<p>Max. Stufe</p>'}
      <button class="sell-btn">Verkaufen (${sellValue}g)</button>
    `;
    this.infoEl.querySelector('.upgrade-btn')?.addEventListener('click', () => this.callbacks.onUpgrade());
    this.infoEl.querySelector('.sell-btn')?.addEventListener('click', () => this.callbacks.onSell());
    for (const btn of Array.from(this.infoEl.querySelectorAll('.targeting button'))) {
      btn.addEventListener('click', () =>
        this.callbacks.onTargetingChange((btn as HTMLElement).dataset.mode as TargetingMode)
      );
    }
  }

  clearInfo(): void {
    this.infoEl.innerHTML = '<p class="hint">Turm auswählen oder platzieren.</p>';
  }
}
