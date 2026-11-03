import type { Element, ElementState, StateOverride } from '../selection/types';
import type { ProfileSettings, ResolvedProfile } from '../profiles/types';
import type { Material } from '../materials/types';
import type { StylePack } from '../styles/types';
import { defaultProfile } from '../profiles/presets';
import { hexToRgb, rgbToHex } from '../render/shade';

export const STATE = { PRESS_WALL:0.2, PRESS_DARKEN:0.10, PRESS_SPECULAR:0.8, PRESS_CONTACT:1.4,
  DISABLED_DESATURATE:0.65, DISABLED_FADE:0.30, DISABLED_SPECULAR:0.3, DISABLED_CONTRAST:0.65,
  DISABLED_TEXTURE:0.5, DISABLED_SHADOW:0.5 } as const;
export function pressOf(el:Element,state:ElementState,profile:ResolvedProfile,pack:StylePack):number {
  return state==='pressed' && el.pressable !== false && (pack.pressMode ?? 'lower')==='lower' && !profile.recessed ? 1 : 0;
}
export function stateMaterial(m:Material,state:ElementState,canvasBg:string):Material {
  if(state==='default')return m;
  const c=hexToRgb(m.color);
  if(state==='pressed')return {...m,color:rgbToHex({r:c.r*(1-STATE.PRESS_DARKEN),g:c.g*(1-STATE.PRESS_DARKEN),b:c.b*(1-STATE.PRESS_DARKEN)}),specular:m.specular*STATE.PRESS_SPECULAR};
  const gray=.2126*c.r+.7152*c.g+.0722*c.b, bg=hexToRgb(canvasBg);
  const channel=(v:number,b:number)=>(v+(gray-v)*STATE.DISABLED_DESATURATE)*(1-STATE.DISABLED_FADE)+b*STATE.DISABLED_FADE;
  const {glow:_,...rest}=m;
  return {...rest,color:rgbToHex({r:channel(c.r,bg.r),g:channel(c.g,bg.g),b:channel(c.b,bg.b)}),specular:m.specular*STATE.DISABLED_SPECULAR,
    contrast:m.contrast*STATE.DISABLED_CONTRAST,...(m.texture?{texture:{...m.texture,amount:m.texture.amount*STATE.DISABLED_TEXTURE}}:{})};
}
export function stateOffset(el:Element,state:ElementState):{x:number;y:number} {
  return state==='default'?{x:0,y:0}:el.stateOverrides?.[state]?.offset ?? {x:0,y:0};
}
export function effectiveProfile(s:ProfileSettings,state:ElementState,pack:StylePack,pressable:boolean):ProfileSettings {
  if(state!=='pressed' || !pressable || (pack.pressMode ?? 'lower')!=='inset')return s;
  const inset=defaultProfile('inset');return {...inset,height:s.height,wall:s.wall};
}
export function shadowMods(state:ElementState,press:number):{strength:number;length:number;contrast:number} {
  if(state==='disabled')return {strength:STATE.DISABLED_SHADOW,length:STATE.DISABLED_SHADOW,contrast:STATE.DISABLED_CONTRAST};
  return {strength:state==='pressed'?1+(STATE.PRESS_CONTACT-1)*Math.max(0,Math.min(1,press)):1,length:1,contrast:1};
}
export function withState(elements:Element[],state:ElementState):Element[] {return elements.map(e=>({...e,state}));}
export function scaleOverrides(overrides:Element['stateOverrides'],sx:number,sy:number):Element['stateOverrides'] {
  if(!overrides)return undefined;
  const scale=(v:StateOverride|undefined)=>v?{...v,...(v.offset?{offset:{x:v.offset.x*sx,y:v.offset.y*sy}}:{})}:undefined;
  return {...(overrides.pressed?{pressed:scale(overrides.pressed)}:{}),...(overrides.disabled?{disabled:scale(overrides.disabled)}:{})};
}
