export type Form = 'anima' | 'animus';

export type SceneId = 'title' | 'regionSelect' | 'play' | 'pause';

export interface Vec2 { x: number; y: number; }

export interface Rect {
  x: number; y: number; w: number; h: number;
}

export interface AABB extends Rect {}

export type Facing = 1 | -1;

export interface RegionDef {
  id: number;
  key: string;
  name: string;
  nameDe: string;
  keywords: [string, string, string];
  theme: string;
  lore: string;
  playable: boolean;
  accent: string;
  bg: string;
  mid: string;
  symbol: 'squareDot' | 'gear' | 'eye' | 'bars' | 'circleDot' | 'hex' | 'leaf';
}

export interface PlatformDef {
  x: number; y: number; w: number; h: number;
  kind?: 'solid' | 'oneway' | 'moving';
  move?: { dx: number; dy: number; period: number };
}

export interface HazardDef {
  x: number; y: number; w: number; h: number;
  kind: 'spikes' | 'laser' | 'void';
  damage?: number;
}

export interface EnemyDef {
  x: number; y: number;
  type: 'watcher' | 'maskentraeger' | 'elite' | 'drone';
  patrol?: number;
}

export interface NpcDef {
  x: number; y: number;
  id: string;
  name: string;
  role: string;
}

export interface SpawnDef { x: number; y: number; }

export interface LevelDef {
  regionId: number;
  width: number;
  height: number;
  spawn: SpawnDef;
  exit: SpawnDef;
  platforms: PlatformDef[];
  hazards: HazardDef[];
  enemies: EnemyDef[];
  npcs: NpcDef[];
  elite?: EnemyDef;
  boss?: { x: number; y: number; type: 'gridWarden' | 'tausendGesichter' };
  parallax?: string;
  /** Visual street width on Z (play plane at z=0). Default ~100. Collision stays 2D. */
  streetDepth?: number;
  /** Back-facade wall height above platform top. Default ~160. */
  wallHeight?: number;
}

export interface DialogueLine {
  speaker: string;
  text: string;
  formHint?: Form;
}

export interface DialogueTree {
  id: string;
  lines: DialogueLine[];
}
