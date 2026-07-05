export class EconomySystem {
  gold: number;
  lives: number;

  constructor(startGold: number, startLives: number) {
    this.gold = startGold;
    this.lives = startLives;
  }

  canAfford(cost: number): boolean {
    return this.gold >= cost;
  }

  spend(cost: number): void {
    this.gold -= cost;
  }

  earn(amount: number): void {
    this.gold += amount;
  }

  loseLives(amount: number): void {
    this.lives = Math.max(0, this.lives - amount);
  }

  get isGameOver(): boolean {
    return this.lives <= 0;
  }
}
