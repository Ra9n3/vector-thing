import { ROUNDED_RATIO } from './shapePath';
import type { ShapeType } from './shapePath';
export interface Point { x: number; y: number }

/** Clockwise in SVG coordinates, with the initial point repeated at the end. */
export function shapeOutline(type: ShapeType, w: number, h: number): Point[] {
  let points: Point[] = [];
  if (type === 'rect') points = [{ x: 0, y: 0 }, { x: w, y: 0 }, { x: w, y: h }, { x: 0, y: h }];
  else if (type === 'hexagon') {
    const r = Math.min(w / 2, h / Math.sqrt(3)), hh = r * Math.sqrt(3) / 2, cx = w / 2, cy = h / 2;
    points = [{ x: cx + r, y: cy }, { x: cx + r / 2, y: cy + hh }, { x: cx - r / 2, y: cy + hh }, { x: cx - r, y: cy }, { x: cx - r / 2, y: cy - hh }, { x: cx + r / 2, y: cy - hh }];
  } else if (type === 'circle') {
    const r = Math.min(w, h) / 2;
    points = Array.from({ length: 90 }, (_, i) => ({ x: w / 2 + r * Math.cos(i * Math.PI / 45), y: h / 2 + r * Math.sin(i * Math.PI / 45) }));
  } else {
    const r = Math.min(w, h) * (type === 'pill' ? 0.5 : ROUNDED_RATIO);
    const centers = [{ x: w-r, y: r }, { x: w-r, y: h-r }, { x: r, y: h-r }, { x: r, y: r }];
    for (let corner = 0; corner < 4; corner++) {
      for (let i = 0; i <= 23; i++) {
        const a = (-90 + corner * 90 + i * 90 / 23) * Math.PI / 180;
        const point = { x: centers[corner].x + r * Math.cos(a), y: centers[corner].y + r * Math.sin(a) };
        const prev = points[points.length - 1];
        if (!prev || Math.hypot(point.x-prev.x, point.y-prev.y) > 1e-8) points.push(point);
      }
    }
    if (points.length > 1 && Math.hypot(points[0].x-points[points.length-1].x, points[0].y-points[points.length-1].y) < 1e-8) points.pop();
  }
  return [...points, { ...points[0] }];
}
