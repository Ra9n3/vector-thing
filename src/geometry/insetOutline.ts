import { shapeOutline } from './outline';
import { ROUNDED_RATIO } from './shapePath';
import type { ShapeType } from './shapePath';
import type { Point } from './outline';
/** Inward parallel outlines with the same sampling and ordering as shapeOutline. */
export function insetOutline(type:ShapeType,w:number,h:number,d:number):Point[] {
  const outline=shapeOutline(type,w,h),cx=w/2,cy=h/2;
  d=Math.max(0,Math.min(d,Math.min(w,h)/2));
  if(type==='circle'||type==='hexagon') {
    const radius=type==='circle'?Math.min(w,h)/2:Math.min(w/2,h/Math.sqrt(3));
    const inner=Math.max(0,radius-(type==='hexagon'?2*d/Math.sqrt(3):d));const k=radius?inner/radius:0;
    return outline.map(p=>({x:cx+(p.x-cx)*k,y:cy+(p.y-cy)*k}));
  }
  if(type==='rect')return outline.map(p=>({x:p.x<=cx?d:w-d,y:p.y<=cy?d:h-d}));
  const r=Math.min(w,h)*(type==='pill'?.5:ROUNDED_RATIO),r2=Math.max(0,r-d);
  return outline.map(p=>{
    const centerX=p.x<=cx?r:w-r,centerY=p.y<=cy?r:h-r;
    const targetX=p.x<=cx?d+r2:w-d-r2,targetY=p.y<=cy?d+r2:h-d-r2;
    const k=r?r2/r:0;return {x:targetX+(p.x-centerX)*k,y:targetY+(p.y-centerY)*k};
  });
}
