import type { Element, ElementState } from '../selection/types';
import type { StylePack } from '../styles/types';
import type { Material } from '../materials/types';
import { resolveMaterial, materialId } from '../materials/resolve';
import { resolveProfile } from '../profiles/sample';
import { effectiveProfile, pressOf, stateMaterial, stateOffset } from './apply';
export interface StateFrame {state:ElementState; press:number; offset:{x:number;y:number}}
export function finalFrame(el:Element,pack:StylePack):StateFrame {
  const state=el.state ?? 'default';
  return {state,press:pressOf(el,state,resolveProfile(el.props.profile),pack),offset:stateOffset(el,state)};
}
export function visualElement(el:Element,pack:StylePack,background:string,frame=finalFrame(el,pack),surfaceOnly=false):{element:Element;material:Material;frame:StateFrame} {
  const override=frame.state==='default'?undefined:el.stateOverrides?.[frame.state]?.material;
  const ref=override ? ('slot' in override ? pack.palette[override.slot] ?? pack.palette[0] : override.id) : el.props.material;
  const custom=override && !el.main ? undefined : el.props.customColor;
  const base=resolveMaterial(ref,custom);
  // Non-pressable parts retain their normal appearance, apart from explicit state overrides.
  const materialState=frame.state==='pressed' && el.pressable===false ? 'default' : frame.state;
  const material=stateMaterial(base,materialState,background);
  const profile=surfaceOnly ? el.props.profile : effectiveProfile(el.props.profile,frame.state,pack,el.pressable !== false);
  return {element:profile===el.props.profile?el:{...el,props:{...el.props,profile,material:materialId(ref)}},material,frame};
}
