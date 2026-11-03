import type { ShapeType } from '../../geometry/shapePath';
import type { ResolvedProfile } from '../../profiles/types';
import type { Material } from '../../materials/types';
import { insetOutline } from '../../geometry/insetOutline';
import { polygonPath } from '../../geometry/hull';
import { prepareProfile } from '../../profiles/sample';
import { shadeColor,colorString } from '../../render/shade';
import type { RGB } from '../../render/shade';
export interface BandFacet {d:string;fill:string;u:number;slopeX:number;slopeY:number}
export function bandFacets(type:ShapeType,w:number,h:number,profile:ResolvedProfile,material:Material,relief:number):BandFacet[] {
  const radius=Math.min(w,h)/2;if(radius<=0)return [];
  const n=Math.max(8,Math.min(24,Math.round(radius/3))),sample=prepareProfile(profile),outer=insetOutline(type,w,h,0);
  const total=outer.length-1;const segments=Math.min(total,60,Math.max(3,Math.floor(590/n)));
  const indices=Array.from({length:segments},(_,i)=>Math.floor(i*total/segments));indices.push(total);
  const rings=Array.from({length:n+1},(_,i)=>{const ring=insetOutline(type,w,h,radius*i/n);return indices.map(j=>ring[j]);});
  const result:BandFacet[]=[];
  for(let k=0;k<n;k++) {
    const u=(k+.5)/n,slope=relief*sample(u).slope/radius*(profile.recessed?-1:1);
    let run:{outer:typeof outer;inner:typeof outer;color:RGB;sx:number;sy:number}|undefined;
    const flush=()=>{if(run){result.push({d:polygonPath([...run.outer,...run.inner.slice().reverse()]),fill:colorString(run.color),u,slopeX:run.sx,slopeY:run.sy});run=undefined;}};
    for(let j=0;j<segments;j++) {
      const a=rings[0][j],b=rings[0][j+1],dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy);if(len<1e-8)continue;
      const sx=-dy/len*slope,sy=dx/len*slope,color=shadeColor(material,sx,sy);
      if(run && Math.max(Math.abs(run.color.r-color.r),Math.abs(run.color.g-color.g),Math.abs(run.color.b-color.b))<2.55) {
        run.outer.push(rings[k][j+1]);run.inner.push(rings[k+1][j+1]);
      } else {flush();run={outer:[rings[k][j],rings[k][j+1]],inner:[rings[k+1][j],rings[k+1][j+1]],color,sx,sy};}
    }
    flush();
  }
  result.push({d:polygonPath(rings[n]),fill:colorString(shadeColor(material,0,0)),u:1,slopeX:0,slopeY:0});
  return result;
}
