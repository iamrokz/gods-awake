# Gods Awake: Anima / Animus

Narrative **3D** (Three.js) side-view jump-and-run prototype — dual forms **Anima** (red/white circle) and **Animus** (blue/dark square) across Babylon City dream regions.

Narratives **3D**-Jump-&-Run-Prototyp (Three.js, low-poly noir) — duale Formen **Anima** (rot/weiß) und **Animus** (blau/dunkel) in den Traumregionen von Babylon City.

## Run / Starten

```bash
cd /workspace/gods-awake
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
| Camera side ↔ third-person | `V` |
| Interact / Dialogue | `E` |
| Pause | `Esc` (then `Q` to quit to region select) |

### Forms / Formen

- **Anima** — circle motif, red/white mesh: **Lichtimpuls** (pulse melee) + **Erinnerungsfragmente** (shard projectiles)
- **Animus** — square motif, blue/dark mesh: **Energieklinge** (blade melee) + **Geometrischer Impuls** (square blast)

## 3D / Camera

- WebGL via **Three.js** (low-poly noir: boxes, spheres, cones, simple compositions)
- Toggleable camera (`V`): cinematic **2.5D / side-scroll** (`Seite`) or true **third-person** follow behind the player (`Third-Person`)
- HTML overlay HUD (hearts, form, abilities, region, dialogue)
- Title + region select: dark cinematic HTML/CSS menus

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
Maskenträger enemies, NPCs (Journalistin, Drucker, Schauspielerin), Erzähler dialogue tease, boss **Die Tausend Gesichter** (orbiting face-screens).

UI/dialogue in **German**.

## Stack

- Vite + TypeScript + **Three.js**
- Folder structure: `src/scenes`, `src/entities`, `src/data`, `src/ui`, `src/art`, `src/core`, `src/world`

## Known gaps / Bekannte Lücken

- Only 2 of 7 regions are full levels (by design for this prototype)
- No audio / music yet
- No save system
- Boss AI is simplified (volley patterns, no full multi-phase arena scripting)
- Backdrop is procedural low-poly buildings, not authored art packs
- Physics remains 2D AABB on the play plane (intentional for side-scroller feel)
