# Referenzdaten aus den Original-Karten

Es liegen zwei Originale vor:
- **`Green_Circle_TD_3.1`** — das *klassische* Green (Circle) TD, 36 Wellen,
  eine Bahn pro Spieler. **Diese Werte werden im Nachbau verwendet** (siehe
  `green_circle_td_waves.json`).
- **`Green TD v36.0`** — eine stark aufgebohrte Mehrspieler-Variante mit 66
  Wellen (siehe `waves_reference.json`), unten dokumentiert.

## Green Circle TD 3.1 — verwendete echte Werte

- **36 Wellen**, exakte Einheiten/Anzahl/HP/Rüstung aus `war3map.j` +
  `war3map.w3u` (HP für den Solo-Nachbau um Faktor 20 herunterskaliert, echte
  Kurve/Anzahl/Flug erhalten).
- **Startgold: 172.** Kopfgeld = „Point Value" pro Kill.
- **Spell-Immun alle 5 Wellen** (5, 10, 15, 20, 25, 30): immun gegen
  Frost-Verlangsamung, nehmen nur **¼ Schaden** von normalen Türmen, aber
  **5× Schaden von Chaos-Türmen** — im Nachbau umgesetzt.
- **Flug-Wellen:** 7, 17, 23, 27, 35 (nur Luft-fähige Türme treffen sie).
- **Turm-Familien im Original:** Siege, Poison, Chaos, Frost/Ice, Air, Aura
  (Speed/Damage). Der Nachbau bildet diese Rollen mit seinen sechs Türmen ab.

---

# Referenzdaten aus der Karte „Green TD v36.0" (Mehrspieler-Variante)

Diese Datei dokumentiert **Fakten**, die aus der Original-Warcraft-3-Karte
(`Green_TD_36.0.w3x`) extrahiert wurden, um einen eigenständigen Nachbau
datengetreu zu machen. Es wurde **kein** urheberrechtlich geschützter
Original-Code und **keine** Assets ins Repository übernommen — nur die
Spielwerte/Struktur (Ideen und Fakten), die für einen Klon nötig sind.

## Extraktionsmethode (nachvollziehbar)

1. `.w3x` = Warcraft-3-Kartendatei mit 512-Byte-`HM3W`-Kopf, danach ein
   **MPQ-Archiv**.
2. Die ersten 512 Bytes abschneiden → reines MPQ.
3. Mit einem MPQ-Reader (hier: gepatchtes `mpyq` mit Entschlüsselung des
   Datei-Schlüssels) die Einträge lesen: `(listfile)`, `war3map.j`
   (JASS-Spiellogik), `war3map.w3u` (Einheitenwerte), `war3map.wts`
   (Texte/Namen), `war3mapUnits.doo` (platzierte Einheiten), `war3map.w3e`
   (Terrain), `war3map.wpm` (Pathing).
4. `war3map.j` parsen → Wellen, Ökonomie, Trigger.

## Grundstruktur

- **Mehrspieler** (1–9 Spieler), jeder Spieler hat eine eigene Bahn
  (Path 1 Pink … Path 9 Teal). Alle Spieler bekommen dieselben Wellen
  gleichzeitig in ihre eigene Bahn — es ist ein **Wettlauf/Survival**, kein
  Koop auf einer Karte.
- **66 Wellen** (nicht 30). Jede Welle = ein Einheitentyp, feste Anzahl
  **pro Bahn** (Welle 1: 20 Footmen pro Spieler).
- Gegner sind reskinnte Standard-WC3-Einheiten (Footman, Rifleman, …) plus
  einige Custom-Einheiten; Wellen 39–56 sind **Helden** (zäh), Welle 66 ist
  der **Endboss** (`U002`) zusammen mit Zombies.

## Ökonomie (aus `war3map.j`)

- **Startgold: 250**
- **Wellen-Abschlussbonus** steigt pro Welle um 5:
  Welle 1 → +10, Welle 2 → +15, Welle 3 → +20, … (5 + 5·Welle)
- **Kopfgeld pro Kill:** der „Point Value" der jeweiligen Einheit
  (`GetUnitPointValue`) wird dem Besitzer als Gold gutgeschrieben.

## Türme (aus Text-Tabelle `war3map.wts`, STRING 3)

- Air Tower (nur Luft)
- AntiAir Tower
- Poison Tower
- Chaos Tower (rüstungsignorierender Schaden)
- Frost Tower (verlangsamt)
- Aura Tower (Support/Buff)
- Siege Tower (Flächenschaden)
- Multishot Tower (mehrere Ziele)
- Detected/Detection System (deckt Unsichtbares auf)

Türme haben mehrere Ausbaustufen (Details in `war3map.w3u`/`war3map.w3a`,
noch nicht vollständig geparst).

## Wellenliste

Maschinenlesbar in [`waves_reference.json`](./waves_reference.json)
(Einheitencode, Klartextname, Anzahl pro Bahn, Gesamtzahl über alle Bahnen).

## Noch offen (für 100 % Treue zu parsen)

- `war3map.w3u`: exakte HP / Rüstung / Rüstungsklasse / Bewegungstyp
  (Boden/Luft) je Gegnereinheit und die Turm-Werte (Schaden, Cooldown,
  Reichweite, Angriffstyp).
- `war3map.w3e` / `war3map.wpm`: exakter Wegverlauf einer Bahn.
- Sende-/Wettlauf-Mechanik zwischen Spielern (falls Mehrspieler gewünscht).
