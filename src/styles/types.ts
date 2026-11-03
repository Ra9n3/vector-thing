import type { MaterialRef } from '../materials/types';
import type { ProfilePresetId } from '../profiles/types';
import type { Direction, Look } from '../viewTypes';

export interface StylePack {
  pressMode: 'lower' | 'inset';
  id: string;
  label: string;
  canvasBackground: string;
  palette: MaterialRef[];
  shadow: { color: string; strength: number };
  highlightShadow?: { color: string; strength: number };
  look: Look;
  direction: Direction;
  goodDirections: Direction[];
  defaultProfile?: Record<string, ProfilePresetId>;
}
