import type { ExportVariant } from '../scene';
import { finalizeSvg } from '../buildSvg';
import { visualElement } from '../../states/visual';
import { displayedElement,stackedShadowClip } from '../../render/stack';
import { effectSpec } from '../../render/effectSpec';
import { shadingSpec } from '../../render/shadingKey';
import { shapePath } from '../../geometry/shapePath';
import { shapeOutline } from '../../geometry/outline';
import { convexHull,outsetHull,polygonPath } from '../../geometry/hull';
import { acrossStops } from '../../render/acrossGradient';
import { bandFacets } from './bandFacets';
import { softLayers } from './softLayers';
const num=(n:number)=>Number(n.toFixed(3));
export function buildFlatSvg(v:ExportVariant):string {
  const defs:string[]=[],parts:string[]=[];const {bounds,pack,look,direction,context}=v;
  for(const [i,el] of v.elements.entries()) {
    const visual=visualElement(el,pack,pack.canvasBackground),shown=displayedElement(el,context,look,direction,{pack});
    const spec=shadingSpec(visual.element,{material:visual.material,state:visual.frame.state,press:visual.frame.press,pressMode:pack.pressMode});
    const effect=effectSpec({type:el.type,outline:el.outline,width:el.width,height:el.height,profile:visual.element.props.profile,material:visual.material,look,direction,style:pack,press:visual.frame.press,state:visual.frame.state});
    const path=shapePath(el.type,el.width,el.height,el.outline),clip=`clip-${i}`,ao=`ao-${i}`,gradient=`grad-${i}`,shadowClip=stackedShadowClip(el,context,look,direction,{pack});
    defs.push(`<clipPath id="${clip}"><path d="${path}"/></clipPath>`);
    if(shadowClip)defs.push(`<clipPath id="base-${i}"><path d="${shapePath(shadowClip.type,shadowClip.width,shadowClip.height,shadowClip.outline)}" transform="translate(${shadowClip.x} ${shadowClip.y})"/></clipPath>`);
    defs.push(`<linearGradient id="${ao}" gradientUnits="userSpaceOnUse" x1="${effect.capOffset.x}" y1="${effect.capOffset.y}" x2="0" y2="0"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".25"/></linearGradient>`);
    let content='';const outline=shapeOutline(el.type,el.width,el.height,el.outline);
    const layers=(points:typeof outline,sigma:number,strength:number,color:string)=>softLayers(sigma,strength).reverse().map(l=>`<path d="${polygonPath(outsetHull(points,l.outset))}" fill="${color}" opacity="${num(l.opacity)}"/>`).join('');
    if(!effect.recessed) {
      const shadow=effect.shadow,swept=convexHull([...outline,...outline.map(p=>({x:p.x+shadow.x,y:p.y+shadow.y}))]);
      let shadows=layers(swept,effect.paths.blur,pack.shadow.strength*(effect.mods.length===1?1:effect.mods.strength),pack.shadow.color);
      shadows+=layers(outline.map(p=>({x:p.x+effect.paths.contact.x,y:p.y+effect.paths.contact.y})),1.5,Math.min(1,pack.shadow.strength*.6*effect.mods.strength),pack.shadow.color);
      if(pack.highlightShadow)shadows=layers(convexHull([...outline,...outline.map(p=>({x:p.x-shadow.x,y:p.y-shadow.y}))]),effect.paths.blur,pack.highlightShadow.strength*(effect.mods.length===1?1:effect.mods.strength),pack.highlightShadow.color)+shadows;
      content+=shadowClip?`<g clip-path="url(#base-${i})">${shadows}</g>`:shadows;
      if(visual.material.glow)content+=`<g transform="translate(${effect.capOffset.x} ${effect.capOffset.y})">${layers(outline,visual.material.glow.radius/2,visual.material.glow.strength,visual.material.glow.color)}</g>`;
      content+=`<g opacity="${visual.material.opacity}">${effect.facets.map(f=>`<path d="${f.d}" fill="${f.fill}" stroke="${f.fill}" stroke-width=".5" stroke-linejoin="round"/>`).join('')}${visual.material.opacity>=1 && effect.facets.length?`<path d="${effect.facets.map(f=>f.d).join('')}" fill="url(#${ao})"/>`:''}</g>`;
    }
    let cap='';
    if(spec.mode==='across') {
      const stops=acrossStops(spec.profile,spec.material,spec.axis==='vertical'?el.height:el.width,spec.relief,spec.axis);
      defs.push(`<linearGradient id="${gradient}" x1="0" y1="0" x2="${spec.axis==='horizontal'?1:0}" y2="${spec.axis==='vertical'?1:0}">${stops.map(s=>`<stop offset="${num(s.offset*100)}%" stop-color="${s.color}"/>`).join('')}</linearGradient>`);
      cap=`<path d="${path}" fill="url(#${gradient})"/>`;
    } else cap=`<g clip-path="url(#${clip})">${bandFacets(el.type,el.width,el.height,spec.profile,spec.material,spec.relief,el.outline).map(f=>`<path d="${f.d}" fill="${f.fill}" stroke="${f.fill}" stroke-width=".5" stroke-linejoin="round"/>`).join('')}</g>`;
    cap=`<g transform="translate(${effect.capOffset.x} ${effect.capOffset.y})" opacity="${visual.material.opacity}">${cap}</g>`;
    if(effect.recessed){const off=Math.min(4,.15*effect.wall)*Math.SQRT1_2;const inner=Array.from({length:6},(_,j)=>`<path d="${path}" fill="none" stroke="${pack.shadow.color}" stroke-width="${(j+1)*1.5}" opacity="${num(pack.shadow.strength*.06*effect.mods.strength)}" transform="translate(${num(off)} ${num(off)})"/>`).join('');content+=`<g clip-path="url(#${clip})">${effect.facets.map(f=>`<path d="${f.d}" fill="${f.fill}"/>`).join('')}${cap}${inner}</g>`;}else content+=cap;
    parts.push(`<g transform="translate(${shown.x} ${shown.y})">${content}</g>`);
  }
  return finalizeSvg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${bounds.w} ${bounds.h}" width="${bounds.w}" height="${bounds.h}"><defs>${defs.join('')}</defs>${v.background?`<rect width="${bounds.w}" height="${bounds.h}" fill="${pack.canvasBackground}"/>`:''}<g transform="translate(${-bounds.x} ${-bounds.y})">${parts.join('')}</g></svg>`);
}
