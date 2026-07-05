# Green TD

Ein browserbasiertes Tower-Defense-Spiel, inspiriert von klassischen
Warcraft-3-Tower-Defense-Karten: fester Kreatur-Pfad, Rüstungsklassen mit
Angriffstyp-Multiplikatoren, Türme mit vier Ausbaustufen, Auren, Debuffs und
30 Wellen inklusive Endboss. Eigenständige Umsetzung in TypeScript + Canvas —
kein Godot-Editor, keine Blizzard-Assets, alles datengetrieben und mit
Claude Code weiterentwickelbar.

## Tech-Stack

- TypeScript + Vite, Rendering auf `<canvas>` (kein Framework)
- Datengetriebenes Design: Türme, Wellen und Kampf-Matrix liegen als
  Konfiguration in `src/data/`
- Vitest für die Kampfformeln, ein Node-Skript für Headless-Balancing

## Schnellstart

```bash
npm install
npm run dev       # Dev-Server, Spiel im Browser
npm run build     # Produktions-Build nach dist/
npm test          # Unit-Tests (Kampfformeln)
npm run sim       # Headless-Simulator: feste Turmkomposition gegen alle 30 Wellen
```

## Architektur

```
/src
  /data        combatMatrix.json, towers.ts, waves.ts
  /core        Game.ts, GameLoop.ts, Grid.ts, CombatCalculator.ts, types.ts
  /entities    Creep.ts, Tower.ts, Projectile.ts
  /systems     WaveManager.ts, TargetingSystem.ts, EconomySystem.ts, AuraSystem.ts
  /ui          HUD.ts, TowerPanel.ts, DamageNumbers.ts
  /render      Renderer.ts
  main.ts
/scripts
  simulate.ts  Headless-Balancing-Tool
```

### Kampfsystem

Rüstung reduziert (bei Werten ≥ 0) bzw. verstärkt (bei negativen Werten)
erlittenen Schaden nach der klassischen WC3-Formel:

- `DR = 0.06·A / (1 + 0.06·A)` für `A ≥ 0`
- `DI = 2 − 0.94^(−A)` für `A < 0`

Zusätzlich hat jeder Angriffstyp (`pierce`, `siege`, `magic`, `chaos`, …)
einen Multiplikator pro Rüstungsklasse (`unarmored` … `divine`), definiert in
`src/data/combatMatrix.json`. Siehe `src/core/CombatCalculator.test.ts` für
Testfälle (z. B. 1000 HP + 10 Rüstung → 1600 effektive HP).

### Türme

| Turm | Angriffstyp | Besonderheit |
|---|---|---|
| Ranger Post | Pierce | schnell, Rüstungs-Debuff |
| Siege Battery | Siege | Flächenschaden, stark gegen Heavy/Fortified |
| Frost Spire | Magic | verlangsamt Ziele |
| War Totem | – | Aura: Angriffstempo + Schaden für Türme in Reichweite |
| Arcane Watcher | Magic | True Sight (deckt Unsichtbares auf), trifft Flieger |
| Venom Tower | Chaos | ignoriert Rüstung, zusätzlicher Gift-Tick |

Jeder Turm hat 4 Ausbaustufen. Der Verkaufswert ist per `SELL_RATIO` in
`src/data/towers.ts` konfigurierbar (Standard: 100 % Rückerstattung).

### Wellen

30 Wellen in `src/data/waves.ts`, mit steigender HP-Skalierung und
Sondereigenschaften: fliegend, unsichtbar (erfordert True Sight),
Ausweichchance, Frost-Immunität. Welle 30 ist ein Boss mit einer
Flächenfähigkeit ("Arcane Resonance"), die alle 20 Sekunden einen
stapelbaren Schadens-Debuff auf Türme in der Nähe legt.

### Balancing

`npm run sim` platziert eine feste Turmkomposition und spielt alle Wellen
ohne Rendering durch — nützlich, um Balancing-Änderungen an `towers.ts` /
`waves.ts` schnell zu verifizieren, ohne 30 Wellen von Hand zu spielen.

## Steuerung

- Turm im Shop rechts anklicken, dann auf freies Feld klicken zum Bauen
- Turm anklicken zum Auswählen: Zielverhalten, Ausbau, Verkauf
- "Welle starten" löst die nächste Welle aus, 1x/2x/3x steuert die Geschwindigkeit
