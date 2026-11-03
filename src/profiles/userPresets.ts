import type {CustomProfile} from './custom';
export interface UserProfilePreset {id:string;name:string;profile:CustomProfile}
export function savePreset(presets:UserProfilePreset[],id:string,name:string,profile:CustomProfile):UserProfilePreset[] {
  return [...presets,{id,name:name.trim()||'Custom',profile:{...profile,points:profile.points.map(p=>({...p}))}}];
}
export function renamePreset(presets:UserProfilePreset[],id:string,name:string):UserProfilePreset[] {
  const value=name.trim();return value?presets.map(p=>p.id===id?{...p,name:value}:p):presets;
}
export function deletePreset(presets:UserProfilePreset[],id:string):UserProfilePreset[] {return presets.filter(p=>p.id!==id);}

const KEY='vector-thing.user-profiles.v1';
export function loadProfilePresets(storage?:Storage):UserProfilePreset[] {
  try {const source=storage??(typeof localStorage==='undefined'?undefined:localStorage);const data:unknown=JSON.parse(source?.getItem(KEY)??'[]');
    return Array.isArray(data)?data.filter((p):p is UserProfilePreset=>!!p&&typeof p.id==='string'&&typeof p.name==='string'&&Array.isArray(p.profile?.points)&&p.profile.points.length>=2&&p.profile.points.length<=12&&typeof p.profile.mirror==='boolean'&&Number.isFinite(p.profile.smooth)&&p.profile.points.every((point:unknown)=>!!point&&typeof point==='object'&&'x' in point&&'y' in point&&typeof point.x==='number'&&typeof point.y==='number'&&Number.isFinite(point.x)&&Number.isFinite(point.y))):[];
  } catch {return [];}
}
export function persistProfilePresets(presets:UserProfilePreset[],storage?:Storage):void {
  try {(storage??(typeof localStorage==='undefined'?undefined:localStorage))?.setItem(KEY,JSON.stringify(presets));} catch { /* Storage is optional. */ }
}
