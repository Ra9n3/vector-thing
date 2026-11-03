import type { Element,ElementState,Group } from '../selection/types';
import type { StylePack } from '../styles/types';
import type { Look,Direction } from '../viewTypes';
import { leavesOf } from '../selection/targets';
import { withState } from '../states/apply';
import { visualElement } from '../states/visual';
import { displayedElement } from '../render/stack';
import { effectSpec } from '../render/effectSpec';
import { sweepBounds } from '../geometry/hull';
export interface Rect {x:number;y:number;w:number;h:number}
export interface ExportVariant {state:ElementState|'current';elements:Element[];context:Element[];bounds:Rect;look:Look;direction:Direction;pack:StylePack;background:boolean}
export interface SceneOptions {elements:Element[];groups:Group[];selection:string[];scope:'selection'|'all';states:'current'|'all';look:Look;direction:Direction;pack:StylePack;background:boolean}
export function exportScene(opts:SceneOptions):ExportVariant[] {
  const selected=opts.scope==='selection'?new Set(leavesOf(opts.selection,opts.elements,opts.groups).map(e=>e.id)):null;
  const states:ExportVariant['state'][]=opts.states==='all'?['default','pressed','disabled']:['current'];
  let left=Infinity,top=Infinity,right=-Infinity,bottom=-Infinity;
  const variants=states.map(state=>{
    const context=state==='current'?opts.elements:withState(opts.elements,state);
    const elements=selected?context.filter(e=>selected.has(e.id)):context;
    for(const el of elements) {
      const visual=visualElement(el,opts.pack,opts.pack.canvasBackground),shown=displayedElement(el,context,opts.look,opts.direction,{pack:opts.pack});
      const spec=effectSpec({type:el.type,outline:el.outline,width:el.width,height:el.height,profile:visual.element.props.profile,material:visual.material,look:opts.look,direction:opts.direction,style:opts.pack,press:visual.frame.press,state:visual.frame.state});
      const hull=sweepBounds(el.type,el.width,el.height,spec.capOffset,el.outline);
      const extent=Math.max(4,Math.hypot(spec.shadow.x,spec.shadow.y)+4*spec.paths.blur,2*(visual.material.glow?.radius ?? 0));
      left=Math.min(left,shown.x+hull.x-extent);top=Math.min(top,shown.y+hull.y-extent);
      right=Math.max(right,shown.x+hull.x+hull.w+extent);bottom=Math.max(bottom,shown.y+hull.y+hull.h+extent);
    }
    return {state,elements,context,look:opts.look,direction:opts.direction,pack:opts.pack,background:opts.background};
  });
  const bounds=Number.isFinite(left)?{x:Math.floor(left),y:Math.floor(top),w:Math.ceil(right)-Math.floor(left),h:Math.ceil(bottom)-Math.floor(top)}:{x:0,y:0,w:1,h:1};
  return variants.map(v=>({...v,bounds}));
}
export function exportName(opts:SceneOptions):string {
  const group=opts.scope==='selection'&&opts.selection.length===1?opts.groups.find(g=>g.id===opts.selection[0] && g.template):undefined;
  return group?.template?.id.replace(/[^a-z0-9_-]/gi,'-') ?? 'design';
}
