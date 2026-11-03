import type { ComponentTemplate, PartDef, ProfileDef } from './types';
import { isRing } from './types';
import type { Element, Group } from '../selection/types';
import type { StylePack } from '../styles/types';
import { defaultProfile } from '../profiles/presets';
import { scaleOverrides } from '../states/apply';
import { materialId } from '../materials/resolve';

/** at is the desired center, in canvas coordinates. All identifiers derive from the input. */
export function instantiate(t:ComponentTemplate, at:{x:number;y:number}, scale:number, pack:StylePack, elements:Element[], groups:Group[]) {
  const used=new Set([...elements.map(e=>e.id),...groups.map(g=>g.id)]);let seq=0;
  const id=()=>{let v;do {v=`part-${seq++}`;} while(used.has(v));used.add(v);return v;};
  const expanded: {part:PartDef; ring?:string}[]=[];
  for(const part of t.parts) {
    if(!isRing(part)) {expanded.push({part});continue;}
    const diameter=part.size*Math.min(t.size.w,t.size.h), radius=part.radius*Math.min(t.size.w,t.size.h)/2;
    for(let i=0;i<part.count;i++) {
      const a=(part.startDeg+(part.count<=1?0:part.sweepDeg*i/(part.count-1)))*Math.PI/180;
      expanded.push({ring:part.key,part:{key:`${part.key}-${i}`,shape:part.shape,rect:{x:t.size.w/2+radius*Math.cos(a)-diameter/2,y:t.size.h/2+radius*Math.sin(a)-diameter/2,w:diameter,h:diameter},profile:part.profile,fallback:part.fallback,material:part.material,main:part.main,pressable:part.pressable,states:part.states}});
    }
  }
  const newGroups:Group[]=[];const root=expanded.length>1?id():undefined;
  if(root)newGroups.push({id:root,template:{id:t.id}});
  const ringGroups=new Map<string,string>();
  const byKey=new Map<string,string>();
  const origin={x:at.x-t.size.w*scale/2,y:at.y-t.size.h*scale/2};
  const created=expanded.map(({part,ring})=>{
    let groupId=root;
    if(root && ring) {if(!ringGroups.has(ring)){const group=id();ringGroups.set(ring,group);newGroups.push({id:group,groupId:root});}groupId=ringGroups.get(ring);}
    const resolved:ProfileDef = part.profile==='pack' ? { ...(part.fallback ?? {preset:'raised'}), preset:pack.defaultProfile?.[t.category] ?? part.fallback?.preset ?? 'raised', ...part.modeOverride } : part.profile;
    const base=defaultProfile(resolved.preset);
    const profile={...base,...resolved,params:{...base.params,...resolved.params}};
    const slot='slot' in part.material ? (part.material.slot>=0 && part.material.slot<pack.palette.length ? part.material.slot : 0) : null;
    const material=slot===null ? (part.material as {id:string}).id : materialId(pack.palette[slot]);
    let {x,y,w,h}=part.rect;
    if(part.shape==='circle') {const d=Math.min(w,h);x+=(w-d)/2;y+=(h-d)/2;w=d;h=d;}
    const el:Element={id:id(),type:part.shape,state:'default',pressable:part.pressable ?? false,stateOverrides:scaleOverrides(part.states,scale,scale),x:origin.x+x*scale,y:origin.y+y*scale,width:w*scale,height:h*scale,
      props:{profile,material,...(part.customColor?{customColor:part.customColor}:{})},partKey:part.key,main:!!part.main,materialSlot:slot,
      ...(groupId?{groupId}:{})};
    byKey.set(part.key,el.id);return el;
  });
  expanded.forEach(({part},i)=>{if(part.sitsOn && byKey.has(part.sitsOn)) created[i].sitsOn=byKey.get(part.sitsOn);});
  return {elements:[...elements,...created],groups:[...groups,...newGroups],selection:root?[root]:created.map(e=>e.id)};
}
