import type {OutlineData} from '../outline/types';
import type { ShapeType } from '../geometry/shapePath';
import type { Point } from '../geometry/outline';
import { shapePath } from '../geometry/shapePath';
import { sweepPath } from '../geometry/hull';

export function shadowPaths(type: ShapeType, w: number, h: number, vector: Point, path?:OutlineData) {
  const length = Math.hypot(vector.x, vector.y);
  const unit = length ? { x: vector.x / length, y: vector.y / length } : { x: Math.SQRT1_2, y: Math.SQRT1_2 };
  return {
    cast: sweepPath(type, w, h, vector,path),
    highlight: sweepPath(type, w, h, { x: -vector.x, y: -vector.y },path),
    footprint: shapePath(type, w, h,path),
    contact: { x: unit.x * 1.5, y: unit.y * 1.5 },
    blur: 0.25 * length + 1,
  };
}
export function innerShadowPath(type: ShapeType, w: number, h: number, padding = 32, path?:OutlineData): string {
  return `M${-padding} ${-padding}H${w+padding}V${h+padding}H${-padding}Z${shapePath(type,w,h,path)}`;
}
