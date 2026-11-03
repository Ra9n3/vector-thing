import type { Direction } from '../viewTypes';

export const DIRECTION_GRID: Direction[][] = [
  ['nw', 'n', 'ne'], ['w', 'c', 'e'], ['sw', 's', 'se'],
];

/** Spatial keyboard navigation wraps at each edge, so no key gets stuck. */
export function navigateDirection(current: Direction, key: string): Direction | null {
  if (key === 'Home') return 'n';
  if (key === 'End') return 's';
  const delta: Record<string, [number,number]> = { ArrowUp: [-1,0], ArrowDown: [1,0], ArrowLeft: [0,-1], ArrowRight: [0,1] };
  if (!delta[key]) return null;
  let row = DIRECTION_GRID.findIndex((line) => line.includes(current));
  if (row < 0) row = 1;
  let col = DIRECTION_GRID[row].indexOf(current);
  if (col < 0) col = 1;
  const [dy, dx] = delta[key];
  return DIRECTION_GRID[(row + dy + 3) % 3][(col + dx + 3) % 3];
}
