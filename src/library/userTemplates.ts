import type { Element, Group } from '../selection/types';
import type { ComponentTemplate, PartDef } from './types';
import type { StylePack } from '../styles/types';
import { leavesOf } from '../selection/targets';
import { boundsOf } from '../geometry/bounds';
import { materialId } from '../materials/resolve';
const STORAGE_KEY='vector-thing.user-templates.v1';
export function snapshotTemplate(id:string, selection:string[], elements:Element[], groups:Group[], pack:StylePack): ComponentTemplate | null {
  if(selection.length!==1) return null;
  const leaves=leavesOf(selection,elements,groups), bounds=boundsOf(leaves);
  if(!bounds||!leaves.length)return null;
  const fromTemplate=groups.some(g=>g.id===selection[0] && g.template);
  const keys=new Map(leaves.map((e,i)=>[e.id,`part-${i}`]));
  const parts:PartDef[]=leaves.map(e=>{
    const slot=pack.palette.findIndex(p=>materialId(p)===e.props.material);
    // A saved main part must never have its color replaced by a state override.
    const hasStateMaterial=!!(e.stateOverrides?.pressed?.material || e.stateOverrides?.disabled?.material);
    return {key:keys.get(e.id)!,shape:e.type,...(e.outline?{outline:structuredClone(e.outline)}:{}),rect:{x:e.x-bounds.x,y:e.y-bounds.y,w:e.width,h:e.height},
      profile:{...e.props.profile,params:{...e.props.profile.params},...(e.props.profile.customPoints?{customPoints:e.props.profile.customPoints.map(p=>({...p}))}:{})},
      material:slot<0?{id:e.props.material}:{slot},main:!hasStateMaterial && (fromTemplate?!!e.main:true), pressable:e.pressable ?? true,
      ...(e.stateOverrides?{states:e.stateOverrides}:{}),
      ...(e.sitsOn && keys.has(e.sitsOn)?{sitsOn:keys.get(e.sitsOn)}:{}),
      ...(e.props.customColor?{customColor:e.props.customColor}:{})};
  });
  return {id,category:'my',label:'Saved component',size:{w:bounds.w,h:bounds.h},parts};
}
export function loadUserTemplates(storage?:Storage): ComponentTemplate[] {
  try {
    const store=storage ?? (typeof localStorage==='undefined'?undefined:localStorage);
    const value=JSON.parse(store?.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(value) ? value.filter((x):x is ComponentTemplate=>x && typeof x.id==='string' && x.category==='my' && Array.isArray(x.parts) && x.size && Number.isFinite(x.size.w) && Number.isFinite(x.size.h)) : [];
  } catch {return [];}
}
export function saveUserTemplates(templates:ComponentTemplate[], storage?:Storage): void {
  try { (storage ?? (typeof localStorage==='undefined'?undefined:localStorage))?.setItem(STORAGE_KEY,JSON.stringify(templates)); } catch { /* unavailable storage leaves the in-memory library usable */ }
}
