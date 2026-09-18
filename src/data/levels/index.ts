import type { LevelDef } from '../../core/types';
import { CIVIC_GRID } from './civicGrid';
import { MEDIA_DISTRICT } from './mediaDistrict';

export function getLevel(regionId: number): LevelDef | null {
  if (regionId === 1) return CIVIC_GRID;
  if (regionId === 3) return MEDIA_DISTRICT;
  return null;
}
