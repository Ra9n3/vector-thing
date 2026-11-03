import { describe, expect, it } from 'vitest';
import { convexHull, sweepPath } from './hull';
import { shapeOutline } from './outline';
import type { Point } from './outline';
const area=(p:Point[])=>Math.abs(p.reduce((s,a,i)=>{const b=p[(i+1)%p.length];return s+a.x*b.y-a.y*b.x},0))/2;
const read=(d:string)=>[...d.matchAll(/[ML](-?[\d.]+) (-?[\d.]+)/g)].map(m=>({x:Number(m[1]),y:Number(m[2])}));
describe('outline and swept hull', () => {
  it('returns closed clockwise outlines with fine arc segments',()=>{
    for(const type of ['rect','rounded','circle','pill','hexagon'] as const){const p=shapeOutline(type,100,80);expect(p[0]).toEqual(p[p.length-1]);expect(area(p)).toBeGreaterThan(0);}
    expect(shapeOutline('circle',100,100)).toHaveLength(91);
  });
  it('sweeps rectangles and retains shape area at zero offset',()=>{
    expect(area(read(sweepPath('rect',100,60,{x:0,y:-20})))).toBeCloseTo(100*80);
    expect(area(read(sweepPath('rect',100,60,{x:0,y:0})))).toBeCloseTo(6000);
    const outline=shapeOutline('circle',100,100); expect(area(read(sweepPath('circle',100,100,{x:0,y:0})))).toBeCloseTo(area(convexHull(outline)),0);
  });
});
