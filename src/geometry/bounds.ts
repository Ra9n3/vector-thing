import type { Element } from '../store';
import { aspectLock, MIN_SIZE } from './shapePath';

export const GRID = 8;

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type HandleId = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

export const snapV = (v: number) => Math.round(v / GRID) * GRID;

const r3 = (n: number) => Math.round(n * 1000) / 1000;

export function boundsOf(els: Element[]): Box | null {
  if (els.length === 0) return null;
  let x1 = Infinity;
  let y1 = Infinity;
  let x2 = -Infinity;
  let y2 = -Infinity;
  for (const e of els) {
    x1 = Math.min(x1, e.x);
    y1 = Math.min(y1, e.y);
    x2 = Math.max(x2, e.x + e.width);
    y2 = Math.max(y2, e.y + e.height);
  }
  return { x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
}

export function intersects(a: Box, b: Box) {
  return a.x <= b.x + b.w && a.x + a.w >= b.x && a.y <= b.y + b.h && a.y + a.h >= b.y;
}

/**
 * Scale a set of elements as a group by dragging a handle of their bounding box.
 * Corner drags keep ratio unless `free`; circles/hexagons always keep it.
 */
export function computeResize(
  handle: HandleId,
  els: Element[],
  b0: Box,
  p: { x: number; y: number },
  opts: { free: boolean; snap: boolean },
): Record<string, Partial<Element>> {
  const dx = handle.includes('e') ? 1 : handle.includes('w') ? -1 : 0;
  const dy = handle.includes('s') ? 1 : handle.includes('n') ? -1 : 0;
  const px = opts.snap ? snapV(p.x) : p.x;
  const py = opts.snap ? snapV(p.y) : p.y;

  const ax = dx === 1 ? b0.x : dx === -1 ? b0.x + b0.w : b0.x + b0.w / 2;
  const ay = dy === 1 ? b0.y : dy === -1 ? b0.y + b0.h : b0.y + b0.h / 2;

  let sx = dx ? (dx * (px - ax)) / b0.w : 1;
  let sy = dy ? (dy * (py - ay)) / b0.h : 1;

  const sxMin = Math.max(...els.map((e) => MIN_SIZE / e.width));
  const syMin = Math.max(...els.map((e) => MIN_SIZE / e.height));

  const corner = dx !== 0 && dy !== 0;
  const locked = els.some((e) => aspectLock(e.type) !== null) || (corner && !opts.free);

  if (locked) {
    let s = corner ? Math.max(sx, sy) : dx ? sx : sy;
    s = Math.max(s, sxMin, syMin);
    sx = s;
    sy = s;
  } else {
    if (dx) sx = Math.max(sx, sxMin);
    if (dy) sy = Math.max(sy, syMin);
  }

  const out: Record<string, Partial<Element>> = {};
  for (const e of els) {
    out[e.id] = {
      x: r3(ax + (e.x - ax) * sx),
      y: r3(ay + (e.y - ay) * sy),
      width: r3(e.width * sx),
      height: r3(e.height * sy),
    };
  }
  return out;
}
