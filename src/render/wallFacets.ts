import type {OutlineData} from '../outline/types';
import type { ShapeType } from '../geometry/shapePath';
import { shapeOutline } from '../geometry/outline';
import type { Point } from '../geometry/outline';
import { polygonPath } from '../geometry/hull';
import type { Material } from '../materials/types';
import { colorString, shadeWall } from './shade';
import type { RGB } from './shade';

/** Adjacent wall strips are grouped when their colors differ by under 1%. */
export function wallFacets(type: ShapeType, w: number, h: number, wallVec: Point, dirVec: Point, material: Material, recessed: boolean, path?:OutlineData): { d: string; fill: string }[] {
  if (Math.hypot(wallVec.x, wallVec.y) < 1e-9) return [];
  const outline = shapeOutline(type, w, h, path);
  const groups: { edge: Point[]; color: RGB; normal: Point }[] = [];
  for (let i=0; i<outline.length-1; i++) {
    const a=outline[i], b=outline[i+1], dx=b.x-a.x, dy=b.y-a.y, len=Math.hypot(dx,dy);
    if (len < 1e-9) continue;
    const nx=dy/len, ny=-dx/len, dot=nx*dirVec.x+ny*dirVec.y;
    if (recessed ? dot >= -1e-9 : dot <= 1e-9) continue;
    const color=shadeWall(material, recessed ? -nx : nx, recessed ? -ny : ny);
    const last=groups[groups.length-1];
    const same = last && Math.max(Math.abs(last.color.r-color.r), Math.abs(last.color.g-color.g), Math.abs(last.color.b-color.b)) < 2.55;
    const adjacent = last && Math.hypot(last.edge[last.edge.length-1].x-a.x,last.edge[last.edge.length-1].y-a.y)<1e-6;
    if (same && adjacent && last.normal.x * nx + last.normal.y * ny > 0.99) last.edge.push(b); else groups.push({edge:[a,b],color,normal:{x:nx,y:ny}});
  }
  // The first and last runs can meet at the outline's closing point.
  if (groups.length > 1) {
    const a=groups[0], b=groups[groups.length-1], end=b.edge[b.edge.length-1], start=a.edge[0];
    if (a.normal.x*b.normal.x+a.normal.y*b.normal.y > 0.99 && Math.hypot(end.x-start.x,end.y-start.y)<1e-6 && Math.max(Math.abs(a.color.r-b.color.r),Math.abs(a.color.g-b.color.g),Math.abs(a.color.b-b.color.b))<2.55) {
      a.edge=[...b.edge,...a.edge.slice(1)]; groups.pop();
    }
  }
  return groups.map(({edge,color}) => ({d:polygonPath([...edge,...[...edge].reverse().map(p=>({x:p.x+wallVec.x,y:p.y+wallVec.y}))]),fill:colorString(color)}));
}
