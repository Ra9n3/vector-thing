import type { Element } from '../selection/types';
import type { Direction, Look } from '../viewTypes';
import type { StylePack } from '../styles/types';
import type { StateFrame } from '../states/visual';
import { finalFrame } from '../states/visual';
import { effectiveProfile } from '../states/apply';
import { resolveProfile } from '../profiles/sample';
import { tiltGeometry, wallPx } from './tilt';
export interface StackOptions {pack:StylePack; frames?:Map<string,StateFrame>}
const frameOf=(el:Element,opts:StackOptions)=>opts.frames?.get(el.id) ?? finalFrame(el,opts.pack);
function capOffset(el:Element,look:Look,direction:Direction,opts?:StackOptions,legacyPress=0) {
  const frame=opts && frameOf(el,opts);
  const profile=opts ? effectiveProfile(el.props.profile,frame!.state,opts.pack,el.pressable!==false) : el.props.profile;
  const wall=wallPx(profile,el.width,el.height)*(1-.8*(frame?.press ?? legacyPress));
  return tiltGeometry(look,direction,wall,resolveProfile(profile).recessed).capOffset;
}
/** Ancestors contribute both their state movement and their own cap offset. */
export function stackOffset(el:Element,elements:Element[],look:Look,direction:Direction,options?:StackOptions|number) {
  const opts=typeof options==='object'?options:undefined, legacyPress=typeof options==='number'?options:0;
  const byId=new Map(elements.map(e=>[e.id,e])),seen=new Set([el.id]);let current=el,x=0,y=0;
  while(current.sitsOn) {
    const base=byId.get(current.sitsOn);if(!base||seen.has(base.id))break;seen.add(base.id);
    const o=capOffset(base,look,direction,opts,legacyPress),move=opts?frameOf(base,opts).offset:{x:0,y:0};
    x+=o.x+move.x;y+=o.y+move.y;current=base;
  }
  return {x,y};
}
export function renderedOffset(el:Element,elements:Element[],look:Look,direction:Direction,opts?:StackOptions) {
  const stack=stackOffset(el,elements,look,direction,opts),own=opts?frameOf(el,opts).offset:{x:0,y:0};
  return {x:stack.x+own.x,y:stack.y+own.y};
}
export function displayedElement(el:Element,elements:Element[],look:Look,direction:Direction,opts?:StackOptions):Element {
  const o=renderedOffset(el,elements,look,direction,opts);
  return o.x || o.y ? {...el,x:el.x+o.x,y:el.y+o.y}:el;
}
export function stackedShadowClip(el:Element,elements:Element[],look:Look,direction:Direction,options?:StackOptions|number) {
  const base=elements.find(e=>e.id===el.sitsOn);if(!base)return undefined;
  const opts=typeof options==='object'?options:undefined, legacyPress=typeof options==='number'?options:0;
  const parent=opts?renderedOffset(base,elements,look,direction,opts):stackOffset(base,elements,look,direction,legacyPress);
  const child=opts?renderedOffset(el,elements,look,direction,opts):stackOffset(el,elements,look,direction,legacyPress);
  const cap=capOffset(base,look,direction,opts,legacyPress);
  return {type:base.type,width:base.width,height:base.height,
    x:base.x+parent.x+cap.x-el.x-child.x,y:base.y+parent.y+cap.y-el.y-child.y};
}
