import { describe, it, expect } from 'vitest';
import { DIRECTION_GRID, navigateDirection } from './directionNavigation';
import type { Direction } from '../viewTypes';

describe('direction keyboard navigation', () => {
  it('moves spatially, wraps at edges, and reaches every cell', () => {
    const seen = new Set<Direction>(['c']);
    const queue: Direction[] = ['c'];
    while (queue.length) {
      const current = queue.shift()!;
      for (const key of ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight']) {
        const next=navigateDirection(current,key)!;
        expect(next).not.toBe(current);
        if (!seen.has(next)) {seen.add(next);queue.push(next);}
      }
    }
    expect([...seen].sort()).toEqual(DIRECTION_GRID.flat().sort());
    expect(navigateDirection('c','ArrowUp')).toBe('n');
    expect(navigateDirection('n','ArrowRight')).toBe('ne');
    expect(navigateDirection('nw','ArrowUp')).toBe('sw');
    expect(navigateDirection('c','Home')).toBe('n');expect(navigateDirection('c','End')).toBe('s');
    expect(navigateDirection('c','Enter')).toBeNull();
  });
});
