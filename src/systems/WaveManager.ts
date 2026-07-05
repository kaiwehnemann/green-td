import { Creep } from '../entities/Creep';
import { WAVES } from '../data/waves';
import type { WaveEntry } from '../core/types';

export type WaveManagerListener = {
  onCreepSpawned?: (creep: Creep) => void;
  onWaveComplete?: (waveNumber: number) => void;
  onAllWavesComplete?: () => void;
};

export class WaveManager {
  currentWaveIndex = -1; // index into WAVES, -1 = not started
  private spawnedInWave = 0;
  private spawnTimerMs = 0;
  private waveInProgress = false;
  private waveEntries: WaveEntry[] = WAVES;
  private readonly listener: WaveManagerListener;

  constructor(listener: WaveManagerListener = {}) {
    this.listener = listener;
  }

  get waveNumber(): number {
    return this.currentWaveIndex + 1;
  }

  get totalWaves(): number {
    return this.waveEntries.length;
  }

  get isWaveActive(): boolean {
    return this.waveInProgress;
  }

  get allWavesStarted(): boolean {
    return this.currentWaveIndex >= this.waveEntries.length - 1;
  }

  startNextWave(): boolean {
    if (this.waveInProgress || this.allWavesStarted) return false;
    this.currentWaveIndex++;
    this.spawnedInWave = 0;
    this.spawnTimerMs = 0;
    this.waveInProgress = true;
    return true;
  }

  update(dtMs: number, activeCreepCount: () => number): void {
    if (!this.waveInProgress) return;
    const entry = this.waveEntries[this.currentWaveIndex];

    if (this.spawnedInWave < entry.count) {
      this.spawnTimerMs -= dtMs;
      if (this.spawnTimerMs <= 0) {
        const creep = new Creep(entry.creep, 1);
        this.listener.onCreepSpawned?.(creep);
        this.spawnedInWave++;
        this.spawnTimerMs = entry.spawnIntervalMs;
      }
      return;
    }

    if (activeCreepCount() === 0) {
      this.waveInProgress = false;
      this.listener.onWaveComplete?.(entry.wave);
      if (this.allWavesStarted) {
        this.listener.onAllWavesComplete?.();
      }
    }
  }
}
