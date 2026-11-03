import type {OutlineData} from '../outline/types';
import type { ShapeType } from '../geometry/shapePath';
import type { ProfileSettings } from '../profiles/types';
export type ElementState = 'default' | 'pressed' | 'disabled';
export interface StateOverride { offset?:{x:number;y:number}; material?:{slot:number}|{id:string} }
export interface Group { id: string; groupId?: string; name?: string; template?: { id: string } }
export interface ElementProps { profile: ProfileSettings; material: string; customColor?: string }
export interface Element {
  id: string; type: ShapeType; outline?:OutlineData; state: ElementState; pressable: boolean;
  stateOverrides?: {pressed?:StateOverride; disabled?:StateOverride}; x: number; y: number; width: number; height: number;
  props: ElementProps; groupId?: string; sitsOn?: string; partKey?: string; main?: boolean; materialSlot?: number | null;
}
export interface GroupState { elements: Element[]; groups: Group[]; selection: string[] }
