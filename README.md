# Gods Awake: Anima / Animus

Narrative 2D side-view Jump & Run prototype — dual forms **Anima** (red/white) and **Animus** (blue/dark) across Babylon City dream regions.

Narratives 2D-Jump-&-Run-Prototyp — duale Formen **Anima** (rot/weiß) und **Animus** (blau/dunkel) in den Traumregionen von Babylon City.

## Run / Starten

```bash
npm install
npm run dev
```

Build & preview:

```bash
npm run build
npm run preview
```

Open the URL Vite prints (default `http://localhost:5173`).

## Controls / Steuerung

| Action | Keys |
|--------|------|
| Move / Bewegen | `WASD` or Arrow keys |
| Jump / Springen | `Space` / `W` / `↑` |
| Primary attack | `J` or Left mouse |
| Secondary attack | `K` or Right mouse |
| Form switch Anima ↔ Animus | `F` or `Tab` |
| Interact / Dialogue | `E` |
| Pause | `Esc` (then `Q` to quit to region select) |

### Forms / Formen

- **Anima** — circle motif, red/white: **Lichtimpuls** (pulse melee) + **Erinnerungsfragmente** (shard projectiles)
- **Animus** — square motif, blue/dark: **Energieklinge** (blade melee) + **Geometrischer Impuls** (square blast)

## Design map / Design-Karte

| # | Region | Status | Theme |
|---|--------|--------|-------|
| 1 | Civic Grid | **Playable** | Orientierung, Kontrolle, Oberfläche |
| 2 | Industrial Belt | Locked + lore | Arbeit, Produktion, Ausbeutung |
| 3 | Media District | **Playable** | Information, Darstellung, Manipulation |
| 4 | Financial Core | Locked + lore | Kapital, Macht, Gleichgewicht |
| 5 | Sacred Quarter | Locked + lore | Sinn, Glaube, Befreiung |
| 6 | Innovation Sector | Locked + lore | Fortschritt, Veränderung, Wissen |
| 7 | The Garden | Locked + lore | Harmonie, Natur, Neubeginn |

### Civic Grid
Platforms, spike/laser hazards, Watcher + Drone enemies, 3 NPCs (Archivarin, Beamter, Abtrünniger), Elite Grid-Warden mid-boss, exit gate.

### Media District
Maskenträger enemies, NPCs (Journalistin, Drucker, Schauspielerin), Erzähler dialogue tease, boss **Die Tausend Gesichter** (multi-face/screens).

Art is procedural Canvas (low-poly silhouettes, noir + red accents, region palettes). UI/dialogue in **German**.

## Stack

- Vite + TypeScript + HTML5 Canvas (no Phaser)
- Folder structure: `src/scenes`, `src/entities`, `src/data`, `src/ui`, `src/art`, `src/core`

## Known gaps / Bekannte Lücken

- Only 2 of 7 regions are full levels (by design for this prototype)
- No audio / music yet
- No save system
- Boss AI is simplified (volley patterns)
- Parallax is lightweight silhouette layers
