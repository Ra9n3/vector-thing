import type {OutlineData} from '../outline/types';
import type { Point } from './outline';
import { shapeOutline } from './outline';
import type { ShapeType } from './shapePath';

export function convexHull(points: Point[]): Point[] {
  const sorted = [...points].sort((a,b) => a.x-b.x || a.y-b.y).filter((p,i,a) => !i || p.x !== a[i-1].x || p.y !== a[i-1].y);
  if (sorted.length <= 1) return sorted;
  const cross = (o:Point,a:Point,b:Point) => (a.x-o.x)*(b.y-o.y)-(a.y-o.y)*(b.x-o.x);
  const half = (list:Point[]) => { const out:Point[] = []; for (const p of list) { while (out.length >= 2 && cross(out[out.length-2],out[out.length-1],p) <= 1e-10) out.pop(); out.push(p); } return out; };
  const lower=half(sorted), upper=half([...sorted].reverse()); lower.pop(); upper.pop();
  return [...lower,...upper];
}
export function polygonPath(points: Point[]): string {
  if (!points.length) return '';
  const f = (n:number) => Number(n.toFixed(4));
  return `M${points.map(p => `${f(p.x)} ${f(p.y)}`).join('L')}Z`;
}
export function sweepPath(type: ShapeType, w: number, h: number, vec: Point, path?:OutlineData): string {
  const outline = shapeOutline(type,w,h,path);
  return polygonPath(convexHull([...outline,...outline.map(p => ({x:p.x+vec.x,y:p.y+vec.y}))]));
}

export function sweepBounds(type: ShapeType, w: number, h: number, vec: Point, path?:OutlineData) {
  const points = shapeOutline(type,w,h,path);
  if(!points.length)return {x:0,y:0,w:0,h:0};
  const xs = points.map(p=>p.x), ys = points.map(p=>p.y);
  const minX=Math.min(...xs)+Math.min(0,vec.x), minY=Math.min(...ys)+Math.min(0,vec.y);
  const maxX=Math.max(...xs)+Math.max(0,vec.x), maxY=Math.max(...ys)+Math.max(0,vec.y);
  return {x:minX,y:minY,w:maxX-minX,h:maxY-minY};
}

/** Convex outset using a 12-sample disk at each point. */
export function outsetHull(points:Point[],d:number):Point[] {
  d=Math.max(0,d);if(d===0)return convexHull(points);
  return convexHull(points.flatMap(p=>Array.from({length:12},(_,i)=>({x:p.x+d*Math.cos(i*Math.PI/6),y:p.y+d*Math.sin(i*Math.PI/6)}))));
}
