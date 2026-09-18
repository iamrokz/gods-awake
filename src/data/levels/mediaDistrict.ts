import type { LevelDef } from '../../core/types';

export const MEDIA_DISTRICT: LevelDef = {
  regionId: 3,
  width: 5200,
  height: 900,
  spawn: { x: 100, y: 620 },
  exit: { x: 4900, y: 480 },
  parallax: 'media',
  platforms: [
    { x: 0, y: 760, w: 600, h: 140 },
    { x: 700, y: 760, w: 450, h: 140 },
    { x: 1300, y: 760, w: 500, h: 140 },
    { x: 1950, y: 760, w: 400, h: 140 },
    { x: 2500, y: 760, w: 550, h: 140 },
    { x: 3200, y: 760, w: 400, h: 140 },
    { x: 3750, y: 760, w: 500, h: 140 },
    { x: 4400, y: 760, w: 800, h: 140 },

    // screen platforms
    { x: 180, y: 600, w: 140, h: 22 },
    { x: 380, y: 500, w: 120, h: 22 },
    { x: 560, y: 420, w: 100, h: 22 },

    { x: 780, y: 620, w: 130, h: 22 },
    { x: 980, y: 520, w: 150, h: 22 },
    { x: 1180, y: 440, w: 120, h: 22 },

    // billboard walkways
    { x: 1400, y: 600, w: 200, h: 24 },
    { x: 1650, y: 500, w: 180, h: 24 },
    { x: 1880, y: 400, w: 160, h: 24 },
    { x: 2100, y: 520, w: 140, h: 24 },
    { x: 2300, y: 620, w: 160, h: 24 },

    // mid climb
    { x: 2550, y: 600, w: 120, h: 22 },
    { x: 2720, y: 500, w: 140, h: 22 },
    { x: 2920, y: 400, w: 160, h: 22 },
    { x: 3120, y: 520, w: 140, h: 22 },

    // erzähler tease ledge
    { x: 3350, y: 600, w: 200, h: 24 },
    { x: 3600, y: 500, w: 180, h: 24 },

    // boss arena
    { x: 3900, y: 620, w: 560, h: 30 },
    { x: 3950, y: 480, w: 100, h: 20 },
    { x: 4300, y: 480, w: 100, h: 20 },
    { x: 4120, y: 380, w: 120, h: 20 },

    // exit
    { x: 4600, y: 600, w: 160, h: 24 },
    { x: 4800, y: 520, w: 220, h: 28 },
  ],
  hazards: [
    { x: 600, y: 740, w: 100, h: 20, kind: 'spikes' },
    { x: 1150, y: 740, w: 150, h: 20, kind: 'spikes' },
    { x: 2350, y: 740, w: 150, h: 20, kind: 'spikes' },
    { x: 3600, y: 740, w: 150, h: 20, kind: 'spikes' },
    { x: 1750, y: 280, w: 60, h: 200, kind: 'laser', damage: 1 },
    { x: 3000, y: 250, w: 60, h: 180, kind: 'laser', damage: 1 },
  ],
  enemies: [
    { x: 450, y: 700, type: 'maskentraeger', patrol: 100 },
    { x: 900, y: 700, type: 'maskentraeger', patrol: 120 },
    { x: 1050, y: 470, type: 'maskentraeger', patrol: 70 },
    { x: 1500, y: 550, type: 'maskentraeger', patrol: 90 },
    { x: 1750, y: 450, type: 'drone', patrol: 70 },
    { x: 2200, y: 700, type: 'maskentraeger', patrol: 110 },
    { x: 2800, y: 450, type: 'maskentraeger', patrol: 80 },
    { x: 3100, y: 700, type: 'maskentraeger', patrol: 100 },
    { x: 3500, y: 550, type: 'maskentraeger', patrol: 90 },
  ],
  boss: { x: 4150, y: 480, type: 'tausendGesichter' },
  npcs: [
    { x: 280, y: 700, id: 'media_journalist', name: 'Journalistin', role: 'Wahrheit' },
    { x: 1450, y: 700, id: 'media_drucker', name: 'Drucker', role: 'Verbreitung' },
    { x: 2650, y: 700, id: 'media_actress', name: 'Schauspielerin', role: 'Darstellung' },
  ],
};
