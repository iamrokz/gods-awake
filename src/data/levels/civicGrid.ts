import type { LevelDef } from '../../core/types';

export const CIVIC_GRID: LevelDef = {
  regionId: 1,
  width: 4800,
  height: 900,
  spawn: { x: 80, y: 620 },
  exit: { x: 4550, y: 520 },
  parallax: 'civic',
  streetDepth: 110,
  wallHeight: 170,
  platforms: [
    // ground sections with gaps
    { x: 0, y: 760, w: 700, h: 140 },
    { x: 800, y: 760, w: 500, h: 140 },
    { x: 1450, y: 760, w: 400, h: 140 },
    { x: 2000, y: 760, w: 600, h: 140 },
    { x: 2750, y: 760, w: 450, h: 140 },
    { x: 3350, y: 760, w: 500, h: 140 },
    { x: 4000, y: 760, w: 800, h: 140 },

    // early ledges
    { x: 220, y: 620, w: 160, h: 24 },
    { x: 420, y: 520, w: 140, h: 24 },
    { x: 620, y: 440, w: 120, h: 24 },

    // mid platforms over gap
    { x: 720, y: 640, w: 100, h: 20 },
    { x: 920, y: 560, w: 140, h: 24 },
    { x: 1120, y: 480, w: 120, h: 24 },
    { x: 1280, y: 580, w: 160, h: 24 },

    // plaza area
    { x: 1550, y: 620, w: 200, h: 24 },
    { x: 1800, y: 540, w: 180, h: 24 },
    { x: 2050, y: 460, w: 220, h: 24 },
    { x: 2300, y: 540, w: 160, h: 24 },
    { x: 2480, y: 640, w: 140, h: 24 },

    // vertical climb before elite
    { x: 2680, y: 600, w: 100, h: 20 },
    { x: 2850, y: 500, w: 120, h: 24 },
    { x: 3050, y: 420, w: 140, h: 24 },
    { x: 3250, y: 520, w: 160, h: 24 },

    // elite arena floor raised
    { x: 3450, y: 620, w: 480, h: 28 },
    { x: 3500, y: 480, w: 100, h: 20 },
    { x: 3780, y: 480, w: 100, h: 20 },

    // exit approach
    { x: 4100, y: 640, w: 160, h: 24 },
    { x: 4300, y: 560, w: 200, h: 24 },
    { x: 4520, y: 560, w: 180, h: 28 },
  ],
  hazards: [
    { x: 700, y: 740, w: 100, h: 20, kind: 'spikes' },
    { x: 1300, y: 740, w: 150, h: 20, kind: 'spikes' },
    { x: 2600, y: 740, w: 150, h: 20, kind: 'spikes' },
    { x: 3850, y: 740, w: 150, h: 20, kind: 'spikes' },
    { x: 2100, y: 300, w: 80, h: 160, kind: 'laser', damage: 1 },
  ],
  enemies: [
    { x: 500, y: 700, type: 'watcher', patrol: 120 },
    { x: 1000, y: 700, type: 'watcher', patrol: 140 },
    { x: 1180, y: 430, type: 'drone', patrol: 80 },
    { x: 1700, y: 700, type: 'watcher', patrol: 100 },
    { x: 2150, y: 410, type: 'watcher', patrol: 80 },
    { x: 2400, y: 700, type: 'watcher', patrol: 120 },
    { x: 2900, y: 450, type: 'drone', patrol: 60 },
    { x: 3200, y: 700, type: 'watcher', patrol: 100 },
  ],
  elite: { x: 3650, y: 540, type: 'elite', patrol: 160 },
  npcs: [
    { x: 300, y: 700, id: 'civic_archivist', name: 'Archivarin', role: 'Guide' },
    { x: 1600, y: 700, id: 'civic_clerk', name: 'Beamter', role: 'Clerk' },
    { x: 3100, y: 700, id: 'civic_rebel', name: 'Abtrünniger', role: 'Rebel' },
  ],
};
