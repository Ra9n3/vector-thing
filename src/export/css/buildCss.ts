import type { ExportVariant } from '../scene';
import type { Element,ElementState } from '../../selection/types';
import { visualElement } from '../../states/visual';
import { displayedElement } from '../../render/stack';
import { shadingSpec } from '../../render/shadingKey';
import { effectSpec } from '../../render/effectSpec';
import { acrossStops } from '../../render/acrossGradient';
import { colorString,hexToRgb,shadeColor,shadeWall } from '../../render/shade';
import { prepareProfile } from '../../profiles/sample';
import { DIR_VEC } from '../../render/tilt';
import { BUILTIN_TEMPLATES } from '../../library/catalog';
const round=(n:number)=>Number(n.toFixed(2));
const kebab=(s:string)=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'part';
const alphaColor=(rgb:string,a:number)=>a>=1?rgb:rgb.replace(/^rgb\(([^)]+)\)$/,`rgba($1, ${round(a)})`);
const rgba=(hex:string,a:number)=>{const c=hexToRgb(hex);return `rgba(${c.r}, ${c.g}, ${c.b}, ${round(Math.max(0,Math.min(1,a)))})`;};
type Props=Record<string,string>;
function partProps(el:Element,v:ExportVariant):{props:Props;x:number;y:number} {
  const {pack,look,direction,context,bounds}=v,visual=visualElement(el,pack,pack.canvasBackground),shown=displayedElement(el,context,look,direction,{pack});
  const spec=shadingSpec(visual.element,{material:visual.material,state:visual.frame.state,press:visual.frame.press,pressMode:pack.pressMode});
  const effect=effectSpec({type:el.type,width:el.width,height:el.height,profile:visual.element.props.profile,material:visual.material,look,direction,style:pack,press:visual.frame.press,state:visual.frame.state});
  const x=shown.x+effect.capOffset.x-bounds.x,y=shown.y+effect.capOffset.y-bounds.y;
  const props:Props={width:`${round(el.width)}px`,height:`${round(el.height)}px`,
    'border-radius':el.type==='circle'?'50%':el.type==='rect'?'0':`${round(Math.min(el.width,el.height)*(el.type==='pill'?.5:.18))}px`};
  if(spec.mode==='across') {
    const stops=acrossStops(spec.profile,spec.material,spec.axis==='vertical'?el.height:el.width,spec.relief,spec.axis);
    props.background=`linear-gradient(to ${spec.axis==='vertical'?'bottom':'right'}, ${stops.map(s=>`${alphaColor(s.color,visual.material.opacity)} ${s.offset*100}%`).join(', ')})`;
  } else {
    const sample=prepareProfile(spec.profile),radius=Math.min(el.width,el.height)/2;
    const stops=Array.from({length:12},(_,i)=>{const t=i/11,u=1-t,sl=spec.relief*sample(u).slope/Math.max(1,radius)*(spec.profile.recessed?-1:1);return `${alphaColor(colorString(shadeColor(visual.material,sl*.707,sl*.707)),visual.material.opacity)} ${round(t*100)}%`;});
    props.background=`radial-gradient(circle at 35% 30%, ${stops.join(', ')})`;
    props['background-color']=rgba(visual.material.color,visual.material.opacity);
  }
  const shadows:string[]=[];
  if(effect.recessed)shadows.push(`inset 2px 2px ${round(Math.max(2,effect.wall))}px ${rgba(pack.shadow.color,pack.shadow.strength*effect.mods.strength)}`,
    `inset -2px -2px ${round(Math.max(2,effect.wall))}px ${rgba(pack.highlightShadow?.color??'#ffffff',pack.highlightShadow?.strength??.25)}`);
  else if(spec.mode==='around')shadows.push(`inset 1px 1px ${round(Math.max(1,effect.wall*.3))}px rgba(255, 255, 255, 0.25)`,`inset -1px -1px ${round(Math.max(1,effect.wall*.3))}px rgba(0, 0, 0, 0.2)`);
  if(!effect.recessed) {
    const dir=DIR_VEC[direction],wallColor=alphaColor(colorString(shadeWall(visual.material,dir.x,dir.y)),visual.material.opacity);
    const steps=Math.min(24,Math.ceil(Math.hypot(effect.capOffset.x,effect.capOffset.y)));
    for(let i=1;i<=steps;i++)shadows.push(`${round(-effect.capOffset.x*i/steps)}px ${round(-effect.capOffset.y*i/steps)}px 0 0 ${wallColor}`);
    shadows.push(`${round(effect.paths.contact.x-effect.capOffset.x)}px ${round(effect.paths.contact.y-effect.capOffset.y)}px 3px ${rgba(pack.shadow.color,pack.shadow.strength*.6*effect.mods.strength)}`);
    shadows.push(`${round(effect.shadow.x-effect.capOffset.x)}px ${round(effect.shadow.y-effect.capOffset.y)}px ${round(effect.paths.blur*2)}px ${rgba(pack.shadow.color,pack.shadow.strength*(effect.mods.length===1?1:effect.mods.strength))}`);
    if(pack.highlightShadow)shadows.push(`${round(-effect.shadow.x-effect.capOffset.x)}px ${round(-effect.shadow.y-effect.capOffset.y)}px ${round(effect.paths.blur*2)}px ${rgba(pack.highlightShadow.color,pack.highlightShadow.strength)}`);
    if(visual.material.glow)shadows.push(`0 0 ${round(visual.material.glow.radius*2)}px ${rgba(visual.material.glow.color,visual.material.glow.strength)}`);
  }
  props['box-shadow']=shadows.join(', ')||'none';return {props,x,y};
}
const declarations=(props:Props)=>Object.entries(props).map(([k,v])=>`${k}: ${v};`).join(' ');
export interface CssOutput {html:string;css:string;document:string;approximations:string[]}
/** Accepts the three aligned variants, preserving their z order and unselected stack context. */
export function buildCss(variants:ExportVariant[],name='design'):CssOutput {
  const def=variants.find(v=>v.state==='default') ?? variants[0];if(!def || !def.elements.length)return {html:'',css:'',document:'',approximations:[]};
  const pressed=variants.find(v=>v.state==='pressed')??def,disabled=variants.find(v=>v.state==='disabled')??def;
  const template=BUILTIN_TEMPLATES.find(t=>t.id===name)?.label??name,root=kebab(template),used=new Set<string>();
  const classes=def.elements.map((e,i)=>{let base=`${root}-${kebab(e.partKey??`part-${i+1}`)}`,c=base,n=2;while(used.has(c))c=`${base}-${n++}`;used.add(c);return c;});
  const one=def.elements.length===1;
  const html=one?`<div class="${root} ${classes[0]}"></div>`:`<div class="${root}">${classes.map(c=>`<div class="${c}"></div>`).join('')}</div>`;
  const rules:string[]=[];
  rules.push(`.${root} { position: relative; ${one?'':`width: ${def.bounds.w}px; height: ${def.bounds.h}px;`} transition: transform 120ms, box-shadow 120ms; }`);
  def.elements.forEach((el,i)=>{
    const current=partProps(el,def);const base:Props={...(one?{}:{position:'absolute',left:`${round(current.x)}px`,top:`${round(current.y)}px`}),...current.props,transition:'transform 120ms, box-shadow 120ms'};
    rules.push(`.${classes[i]} { ${declarations(base)} }`);
    for(const [state,variant] of [['pressed',pressed],['disabled',disabled]] as [ElementState,ExportVariant][]) {
      const e=variant.elements.find(item=>item.id===el.id);if(!e)continue;const other=partProps(e,variant);const changes:Props={};
      for(const [key,value] of Object.entries(other.props))if(current.props[key]!==value)changes[key]=value;
      const dx=round(other.x-current.x),dy=round(other.y-current.y);if(dx||dy)changes.transform=`translate(${dx}px, ${dy}px)`;
      if(!Object.keys(changes).length)continue;
      const selectors=state==='pressed'?[`:active`,`[aria-pressed="true"]`]:[`[aria-disabled="true"]`,'.is-disabled'];
      rules.push(`${selectors.map(s=>one?`.${root}${s}`:`.${root}${s} .${classes[i]}`).join(', ')} { ${declarations(changes)} }`);
    }
  });
  rules.push(`@media (prefers-reduced-motion: reduce) { .${root}, .${root} * { transition: none; } }`);
  const css=rules.join('\n');
  const document=`<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${html}</body></html>`;
  const approximations:string[]=[];
  if(variants.some(v=>v.elements.some(e=>{const vis=visualElement(e,v.pack,v.pack.canvasBackground);return shadingSpec(vis.element).mode==='around';})))approximations.push('Around bevel');
  if(variants.some(v=>v.elements.some(e=>{const vis=visualElement(e,v.pack,v.pack.canvasBackground);const offset=effectSpec({type:e.type,width:e.width,height:e.height,profile:vis.element.props.profile,material:vis.material,look:v.look,direction:v.direction,style:v.pack,press:vis.frame.press,state:vis.frame.state}).capOffset;return Math.hypot(offset.x,offset.y)>0;})))approximations.push('Walls');
  if(variants.some(v=>v.elements.some(e=>!!visualElement(e,v.pack,v.pack.canvasBackground).material.texture)))approximations.push('Texture');
  return {html,css,document,approximations};
}
