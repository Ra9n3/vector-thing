import { describe, expect, it } from 'vitest';
import { wallFacets } from './wallFacets';
import { DIR_VEC } from './tilt';
import { shadeWall } from './shade';
import { MATERIALS } from '../materials/resolve';
import { resolveMaterial } from '../materials/resolve';
import { effectKey, effectSpec } from './effectSpec';
import { defaultProfile } from '../profiles/presets';
import { resolveStyle } from '../styles/catalog';
const mat=resolveMaterial('plastic-white');
const points=(d:string)=>[...d.matchAll(/[ML](-?[\d.]+) (-?[\d.]+)/g)].map(m=>({x:+m[1],y:+m[2]}));
describe('wall facets',()=>{
  it('creates one quad for a south rect and separate faces for diagonal view',()=>{
    const south=wallFacets('rect',100,60,{x:0,y:-10},DIR_VEC.s,mat,false);
    expect(south).toHaveLength(1);expect(points(south[0].d)).toHaveLength(4);
    expect(wallFacets('rect',100,60,{x:-10,y:-10},DIR_VEC.se,mat,false)).toHaveLength(2);
    // At exactly 225° the south and east walls have equal illumination by symmetry.
  });
  it('keeps only visible normals, reversing the sign for inner walls',()=>{
    for(const recessed of [false,true]) {
      const facets=wallFacets('circle',100,100,{x:0,y:recessed?10:-10},DIR_VEC.s,mat,recessed);
      expect(facets.length).toBeGreaterThan(0);
      for(const f of facets) {const p=points(f.d), edge=p.slice(0,p.length/2); for(let i=0;i<edge.length-1;i++) {const nx=edge[i+1].y-edge[i].y,ny=-(edge[i+1].x-edge[i].x);expect(recessed ? ny : -ny).toBeLessThan(0.0001);expect(Number.isFinite(nx)).toBe(true);}}
    }
  });
  it('lights northwest more than southeast and is finite for all materials',()=>{
    const a=shadeWall(mat,-1,-1),b=shadeWall(mat,1,1);expect(a.r).toBeGreaterThan(b.r);
    for(const m of MATERIALS) for(const v of Object.values(shadeWall(m,-1,0))) expect(Number.isFinite(v)).toBe(true);
  });
  it('keys view, wall, and shadow settings but not position',()=>{
    const input={type:'circle' as const,width:100,height:100,profile:defaultProfile('raised'),material:mat,look:'slight' as const,direction:'s' as const,style:resolveStyle('studio-hardware')};
    const k=effectKey(input);
    expect(effectKey({...input,look:'strong'})).not.toBe(k);expect(effectKey({...input,direction:'e'})).not.toBe(k);
    expect(effectKey({...input,profile:{...input.profile,wall:1.5}})).not.toBe(k);
    expect(effectKey({...input,style:{...input.style,shadow:{...input.style.shadow,strength:0.2}}})).not.toBe(k);
    expect(effectKey({...input,...{x:12,y:53}})).toBe(k);
    expect(effectSpec({...input,press:1}).wall).toBeCloseTo(effectSpec(input).wall*0.2);
    expect(effectSpec({...input,direction:'nw'}).shadow).toEqual(effectSpec(input).shadow);
    expect(effectSpec({...input,look:'flat'}).facets).toEqual([]);
    expect(effectSpec({...input,profile:defaultProfile('dome')}).wall).toBe(0);
  });
});
