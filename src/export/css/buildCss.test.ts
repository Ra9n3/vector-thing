import { describe,expect,it } from 'vitest';
import { buildCss } from './buildCss';
import { cssEligibility } from './cssEligibility';
import { exportScene } from '../scene';
import { instantiate } from '../../library/instantiate';
import { BUILTIN_TEMPLATES } from '../../library/catalog';
import { resolveStyle } from '../../styles/catalog';
import { defaultProfile } from '../../profiles/presets';
import { acrossStops } from '../../render/acrossGradient';
import { resolveProfile } from '../../profiles/sample';
import { resolveMaterial } from '../../materials/resolve';
import { effectiveHeight } from '../../render/lighting';
import { displayedElement } from '../../render/stack';
import { visualElement } from '../../states/visual';
import { effectSpec } from '../../render/effectSpec';
import type { Element } from '../../selection/types';
const pack=resolveStyle('studio-hardware');
const variants=(elements:Element[])=>exportScene({elements,groups:[],selection:[],scope:'all',states:'all',look:'slight',direction:'s',pack,background:false});
describe('CSS output',()=>{
 it('includes the across gradient stops, reduced motion, and unique classes',()=>{
   const profile={...defaultProfile('dip'),mode:'across' as const};const e:Element={id:'a',type:'rect',x:0,y:0,width:80,height:50,state:'default',pressable:true,props:{profile,material:'plastic-red'}};
   const css=buildCss(variants([e,{...e,id:'b',x:100}]),'test');const stops=acrossStops(resolveProfile(profile),resolveMaterial('plastic-red'),50,effectiveHeight(80,50,profile.height),'vertical');
   expect(css.css).toContain(`${stops[0].color} ${stops[0].offset*100}%`);expect(css.css).toContain(`${stops[50].color} ${stops[50].offset*100}%`);expect(css.css).toContain('prefers-reduced-motion');expect(css.html).toContain('test-part-1');expect(css.html).toContain('test-part-2');
 });
 it('includes the toggle thumb translation and state selectors',()=>{
   const r=instantiate(BUILTIN_TEMPLATES.find(t=>t.id==='toggle')!,{x:0,y:0},1,pack,[],[]);const css=buildCss(variants(r.elements),'toggle');
   expect(css.css).toContain('translate(28px,');expect(css.css).toContain(':active');expect(css.css).toContain('[aria-disabled="true"]');
 });
 it('translates a pointer with the pressed cap and emits only changed properties',()=>{
   const base:Element={id:'base',type:'rounded',x:0,y:0,width:64,height:40,state:'default',pressable:true,props:{profile:defaultProfile('raised'),material:'plastic-red'}};
   const pointer:Element={...base,id:'pointer',partKey:'pointer',type:'pill',x:20,y:10,width:4,height:15,pressable:false,sitsOn:'base',props:{profile:defaultProfile('flat'),material:'plastic-white'}};
   const vv=variants([base,pointer]),d=vv[0],p=vv[1],dv=visualElement(d.elements[0],pack,pack.canvasBackground),pv=visualElement(p.elements[0],pack,pack.canvasBackground);
   const make=(vis:typeof dv)=>effectSpec({type:'rounded',width:64,height:40,profile:vis.element.props.profile,material:vis.material,look:'slight',direction:'s',style:pack,press:vis.frame.press,state:vis.frame.state}).capOffset;
   const off=(shown:Element,v:typeof d)=>displayedElement(shown,v.context,v.look,v.direction,{pack});const change=off(p.elements[1],p).y-off(d.elements[1],d).y;
   expect(change).toBeCloseTo(make(pv).y-make(dv).y);const css=buildCss(vv,'button').css;
   expect(css).toContain(`translate(0px, ${Number(change.toFixed(2))}px)`);
   const line=css.split('\n').find(l=>l.includes(':active .button-pointer'))!;
   expect(line).toContain('transform:');expect(line).not.toContain('width:');expect(line).not.toContain('height:');
 });
 it('reports hexagons unsupported and texture dropped',()=>{
   const e:Element={id:'a',type:'hexagon',x:0,y:0,width:40,height:40,state:'default',pressable:true,props:{profile:defaultProfile('flat'),material:'speckle-grey'}};
   expect(cssEligibility([e])).toEqual({eligible:false,textureDropped:true});
 });
});
