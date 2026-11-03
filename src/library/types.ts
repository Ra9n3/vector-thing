import type { StateOverride } from '../selection/types';
import type { ShapeType } from '../geometry/shapePath';
import type { ProfilePoint, ProfilePresetId, ProfileSettings } from '../profiles/types';
export type Category = 'buttons'|'knobs'|'faders'|'toggles'|'cards'|'badges'|'parts'|'my';
export interface ProfileDef {
  preset: ProfilePresetId; params?: Record<string,number>; height?: number; wall?: number;
  mode?: ProfileSettings['mode']; acrossAxis?: ProfileSettings['acrossAxis']; customPoints?: ProfilePoint[];
}
export type PartMaterial = {slot:number}|{id:string};
export interface PartDef {
  pressable?:boolean; states?:{pressed?:StateOverride; disabled?:StateOverride};
  key:string; shape:ShapeType; rect:{x:number;y:number;w:number;h:number}; profile:ProfileDef|'pack';
  fallback?:ProfileDef; modeOverride?: {mode: ProfileSettings['mode']; acrossAxis: ProfileSettings['acrossAxis']}; material:PartMaterial; main?:boolean; sitsOn?:string; customColor?:string;
}
export interface RingDef {
  pressable?:boolean; states?:{pressed?:StateOverride; disabled?:StateOverride};
  key:string; generate:'ring'; count:number; startDeg:number; sweepDeg:number; radius:number; size:number;
  shape:ShapeType; profile:ProfileDef|'pack'; fallback?:ProfileDef; material:PartMaterial; main?:boolean;
}
export interface ComponentTemplate { id:string; category:Category; label:string; size:{w:number;h:number}; parts:(PartDef|RingDef)[] }
export const isRing = (part:PartDef|RingDef): part is RingDef => 'generate' in part;
