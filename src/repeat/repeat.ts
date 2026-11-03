export interface LinearRepeat {id:string;sourceId:string;mode:'linear';count:number;dx:number;dy:number}
export interface RadialRepeat {id:string;sourceId:string;mode:'radial';count:number;radius:number;start:number;sweep:number}
export type RepeatMetadata=LinearRepeat|RadialRepeat;
export interface RepeatSource {id:string;x:number;y:number;width:number;height:number;props:unknown;groupId?:string}
export type GeneratedCopy<T extends RepeatSource>=T & {repeatSourceId:string;repeatIndex:number};
const finite=(value:number,fallback:number)=>Number.isFinite(value)?value:fallback;
const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));
export function normalizeRepeat(repeat:RepeatMetadata):RepeatMetadata {
 if(repeat.mode==='linear')return {...repeat,count:Math.round(clamp(finite(repeat.count,2),2,20)),dx:finite(repeat.dx,0),dy:finite(repeat.dy,0)};
 return {...repeat,count:Math.round(clamp(finite(repeat.count,2),2,36)),radius:Math.max(0,finite(repeat.radius,0)),start:finite(repeat.start,0),sweep:clamp(finite(repeat.sweep,360),-360,360)};
}
/** Copies are derived on demand; the source's profile/material object is shared. */
export function generateCopies<T extends RepeatSource>(input:RepeatMetadata,sources:T[]):GeneratedCopy<T>[] {
 if(!sources.length)return [];const repeat=normalizeRepeat(input);
 return Array.from({length:repeat.count},(_,i)=>{
  let dx:number,dy:number;
  if(repeat.mode==='linear'){dx=i*repeat.dx;dy=i*repeat.dy;}
  else {const step=Math.abs(repeat.sweep)===360?repeat.sweep/repeat.count:repeat.sweep/(repeat.count-1),angle=(repeat.start+i*step)*Math.PI/180;dx=repeat.radius*Math.cos(angle);dy=repeat.radius*Math.sin(angle);}
  return sources.map(source=>({...source,id:`${repeat.id}:${i}:${source.id}`,x:source.x+dx,y:source.y+dy,repeatSourceId:source.id,repeatIndex:i}));
 }).flat();
}
/** Detached parts no longer retain live-repeat metadata or mutable source properties. */
export function detachCopies<T extends RepeatSource>(copies:GeneratedCopy<T>[],groupId:string,nextId:()=>string):T[] {
 return copies.map(copy=>{const {repeatSourceId:_source,repeatIndex:_index,...part}=copy;void _source;void _index;return {...part,id:nextId(),groupId,props:structuredClone(part.props)} as T;});
}
export const REPEAT_PRESETS={
 ticks:{mode:'radial',count:12,radius:60,start:-90,sweep:360},
 spokes:{mode:'radial',count:6,radius:40,start:-90,sweep:360},
 grip:{mode:'linear',count:8,dx:12,dy:0},
 ribs:{mode:'linear',count:5,dx:12,dy:0},
} as const;
