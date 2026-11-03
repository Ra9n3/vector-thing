import { describe,expect,it,beforeEach } from 'vitest';
import { STATE, pressOf, stateMaterial, stateOffset, effectiveProfile, shadowMods, withState } from './apply';
import { animationSteps, quantizePress } from './animate';
import { visualElement, finalFrame } from './visual';
import { MATERIALS, resolveMaterial, materialId } from '../materials/resolve';
import { defaultProfile } from '../profiles/presets';
import { resolveProfile } from '../profiles/sample';
import { resolveStyle } from '../styles/catalog';
import { hexToRgb } from '../render/shade';
import { acrossStops } from '../render/acrossGradient';
import { instantiate } from '../library/instantiate';
import { BUILTIN_TEMPLATES } from '../library/catalog';
import { isRing } from '../library/types';
import { displayedElement, stackOffset } from '../render/stack';
import { tiltGeometry,wallPx } from '../render/tilt';
import { shadingSpec } from '../render/shadingKey';
import { boundsOf, computeResize } from '../geometry/bounds';
import { effectKey } from '../render/effectSpec';
import { useStore } from '../store';
import type { Element,ElementState } from '../selection/types';
const studio=resolveStyle('studio-hardware'),neumo=resolveStyle('neumorphic');
const el:Element={id:'a',type:'rounded',state:'default',pressable:true,x:0,y:0,width:64,height:40,props:{profile:defaultProfile('raised'),material:'plastic-red'}};
const template=(id:string)=>BUILTIN_TEMPLATES.find(t=>t.id===id)!;
describe('state application',()=>{
  it('presses only pressable, raised elements in lower mode',()=>{
    const profile=resolveProfile(el.props.profile);
    expect(pressOf(el,'pressed',profile,studio)).toBe(1);
    for(const state of ['default','disabled'] as const)expect(pressOf(el,state,profile,studio)).toBe(0);
    expect(pressOf({...el,pressable:false},'pressed',profile,studio)).toBe(0);
    expect(pressOf(el,'pressed',profile,neumo)).toBe(0);
    expect(pressOf(el,'pressed',resolveProfile(defaultProfile('inset')),studio)).toBe(0);
  });
  it('keeps flat gradients within 3% of the state surface for every material',()=>{
    for(const base of MATERIALS) for(const state of ['default','pressed','disabled'] as const){
      const m=stateMaterial(base,state,'#808080');const color=hexToRgb(m.color);
      const stop=acrossStops(resolveProfile(defaultProfile('flat')),m,100,20,'vertical',2)[0].color.match(/\d+/g)!.map(Number);
      for(const [i,k] of (['r','g','b'] as const).entries()) expect(Math.abs(stop[i]-color[k]),`${base.id} ${state} ${k}`).toBeLessThanOrEqual(255*.03);
    }
  });
  it('mutes disabled materials and darkens pressed, leaving default identical',()=>{
    const m=resolveMaterial('led-orange');expect(stateMaterial(m,'default','#eeeeee')).toBe(m);
    const disabled=stateMaterial(m,'disabled','#aaaaaa');expect(disabled.glow).toBeUndefined();
    expect(disabled.specular).toBeCloseTo(m.specular*STATE.DISABLED_SPECULAR);expect(disabled.contrast).toBeLessThan(m.contrast);
    const saturation=(c:string)=>{const x=Object.values(hexToRgb(c));return Math.max(...x)-Math.min(...x)};
    expect(saturation(disabled.color)).toBeLessThan(saturation(m.color));
    expect(Object.values(hexToRgb(stateMaterial(m,'pressed','#fff').color)).reduce((a,b)=>a+b,0)).toBeLessThan(Object.values(hexToRgb(m.color)).reduce((a,b)=>a+b,0));
  });
  it('insets Neumorphic pressed parts, preserves height/wall, and otherwise keeps the same profile',()=>{
    const p={...el.props.profile,height:.8,wall:1.4};const inset=effectiveProfile(p,'pressed',neumo,true);
    expect(inset.preset).toBe('inset');expect(inset.params).toEqual(defaultProfile('inset').params);expect(inset.height).toBe(.8);expect(inset.wall).toBe(1.4);
    expect(effectiveProfile(p,'pressed',studio,true)).toBe(p);expect(effectiveProfile(p,'disabled',neumo,true)).toBe(p);expect(effectiveProfile(p,'pressed',neumo,false)).toBe(p);
  });
  it('modifies shadows and does not mutate states',()=>{
    expect(shadowMods('disabled',0)).toMatchObject({strength:.5,length:.5});expect(shadowMods('pressed',1).strength).toBeCloseTo(1.4);
    const arr=[el],result=withState(arr,'pressed');expect(result[0].state).toBe('pressed');expect(el.state).toBe('default');expect(result[0]).not.toBe(el);
    expect(stateOffset(el,'pressed')).toEqual({x:0,y:0});expect(stateOffset({...el,stateOverrides:{pressed:{offset:{x:3,y:4}}}},'pressed')).toEqual({x:3,y:4});
  });
  it('validates template overrides and pressable part set',()=>{
    const pressable:string[]=[];
    for(const t of BUILTIN_TEMPLATES)for(const p of t.parts){
      if(p.pressable)pressable.push(`${t.id}:${p.key}`);
      for(const override of Object.values(p.states ?? {})) if(override?.material){expect(!!p.main,`${t.id}:${p.key}`).toBe(false);if('slot' in override.material)expect(override.material.slot).toBeGreaterThanOrEqual(0),expect(override.material.slot).toBeLessThan(6);}
      if(isRing(p))expect(p.pressable ?? false).toBe(false);
    }
    expect(pressable.sort()).toEqual(['push-button:body','square-button:body','pill-button:body','round-button:body','fader-cap:cap','fader-ribbed:cap','fader:cap','rocker:body'].sort());
  });
  it('resolves state material slots using the current palette without overriding main custom colors',()=>{
    const r=instantiate(template('toggle'),{x:0,y:0},1,studio,[],[]);const track={...r.elements[0],state:'pressed' as const};track.props={...track.props,customColor:'#123456'};
    expect(visualElement(track,studio,studio.canvasBackground).material.color).toBe(resolveMaterial(studio.palette[2]).color);
    expect(visualElement(track,neumo,neumo.canvasBackground).material.color).toBe(resolveMaterial(neumo.palette[2]).color);
    expect(materialId(studio.palette[2])).not.toBe(materialId(neumo.palette[2]));
  });
  it('moves stacked children with pressed bases and applies own offset after stacking',()=>{
    const r=instantiate(template('square-button'),{x:0,y:0},1,studio,[],[]);r.elements[0].state='pressed';
    const base=r.elements[0], child=r.elements[1];const wall=wallPx(base.props.profile,base.width,base.height)*.2;
    expect(stackOffset(child,r.elements,'strong','s',{pack:studio}).y).toBeCloseTo(tiltGeometry('strong','s',wall,false).capOffset.y);
    const toggle=instantiate(template('toggle'),{x:0,y:0},2,studio,[],[]);toggle.elements.forEach(e=>e.state='pressed');
    expect(displayedElement(toggle.elements[1],toggle.elements,'flat','s',{pack:studio}).x-toggle.elements[1].x).toBe(56);
  });
  it('scales state offsets when resizing and preserves their default geometry',()=>{
    const r=instantiate(template('toggle'),{x:0,y:0},1,studio,[],[]);const box=boundsOf(r.elements)!;
    const patches=computeResize('se',r.elements,box,{x:box.x+box.w*2,y:box.y+box.h*2},{free:false,snap:false,minSize:.01});
    expect(patches[r.elements[1].id].stateOverrides!.pressed!.offset).toEqual({x:56,y:0});
    expect(r.elements[1].stateOverrides!.pressed!.offset).toEqual({x:28,y:0});
  });
  it('moves descendants with a moving ancestor and applies its own offset',()=>{
    const base={...el,state:'pressed' as const,stateOverrides:{pressed:{offset:{x:9,y:5}}}};
    const child={...el,id:'child',sitsOn:base.id,state:'pressed' as const,stateOverrides:{pressed:{offset:{x:11,y:2}}}};
    const arr=[base,child];const cap=tiltGeometry('strong','s',wallPx(base.props.profile,base.width,base.height)*.2,false).capOffset;
    const shown=displayedElement(child,arr,'strong','s',{pack:studio});
    expect(shown.x-child.x).toBeCloseTo(20+cap.x);expect(shown.y-child.y).toBeCloseTo(7+cap.y);
  });
  it('quantizes five steps and has a reduced-motion path',()=>{
    expect(animationSteps(false)).toEqual([0,.25,.5,.75,1]);expect(animationSteps(true)).toEqual([1]);
    for(const n of [0,.1,.26,.49,.73,.9,1])expect([0,.25,.5,.75,1]).toContain(quantizePress(n));
  });
  it('keys state and press but not position or state offsets',()=>{
    const visual=visualElement(el,studio,studio.canvasBackground),key=(e:Element,state:ElementState,press:number)=>shadingSpec(e,{material:visual.material,state,press,pressMode:studio.pressMode}).key;
    expect(key(el,'default',0)).not.toBe(key(el,'pressed',0));expect(key(el,'pressed',0)).not.toBe(key(el,'pressed',.25));
    expect(key({...el,x:300,stateOverrides:{pressed:{offset:{x:10,y:20}}}},'default',0)).toBe(key(el,'default',0));
    const i={type:el.type,width:el.width,height:el.height,profile:el.props.profile,material:visual.material,look:'slight' as const,direction:'s' as const,style:studio};
    expect(effectKey({...i,state:'pressed',press:.5})).not.toBe(effectKey({...i,state:'default',press:0}));
    expect(effectKey({...i,...{x:100,y:500}})).toBe(effectKey(i));expect(finalFrame(el,studio).press).toBe(0);
  });
});
describe('state history and resize',()=>{
  beforeEach(()=>useStore.setState({elements:[],groups:[],selection:[],userTemplates:[],styleId:'studio-hardware',canvasBackground:studio.canvasBackground,matchMode:true,activeId:null}));
  it('sets group leaves regardless of Individual, with a single undo',()=>{
    const s=useStore.getState();s.placeTemplate('square-button',{x:0,y:0});s.setMatchMode(false);s.setElementState('pressed');
    expect(useStore.getState().elements.map(e=>e.state)).toEqual(['pressed','pressed']);s.undo();expect(useStore.getState().elements.map(e=>e.state)).toEqual(['default','default']);s.redo();expect(useStore.getState().elements.map(e=>e.state)).toEqual(['pressed','pressed']);
  });
  it('changes only the selected single element and undoes in one step',()=>{
    const s=useStore.getState();s.addElement('rounded',64,40,0,0);s.addElement('rounded',64,40,150,0);
    s.setElementState('pressed');expect(useStore.getState().elements.map(e=>e.state)).toEqual(['default','pressed']);
    s.undo();expect(useStore.getState().elements.map(e=>e.state)).toEqual(['default','default']);
    s.redo();expect(useStore.getState().elements.map(e=>e.state)).toEqual(['default','pressed']);
  });
  it('keeps states across style changes and uses the new background',()=>{
    const s=useStore.getState();s.placeTemplate('push-button',{x:0,y:0});s.setElementState('disabled');
    const a=visualElement(useStore.getState().elements[0],studio,studio.canvasBackground).material.color;
    s.setStyle('soft-clay');const next=useStore.getState();expect(next.elements[0].state).toBe('disabled');
    expect(visualElement(next.elements[0],resolveStyle('soft-clay'),next.canvasBackground).material.color).not.toBe(a);
    s.undo();expect(useStore.getState().elements[0].state).toBe('disabled');
  });
  it('sets all with empty selection and scales saved offsets',()=>{
    const s=useStore.getState();s.placeTemplate('toggle',{x:0,y:0});s.setSize(112);
    expect(useStore.getState().elements[1].stateOverrides!.pressed!.offset!.x).toBe(56);
    s.clearSelection();s.setElementState('disabled');expect(useStore.getState().elements.every(e=>e.state==='disabled')).toBe(true);s.undo();expect(useStore.getState().elements.every(e=>e.state==='default')).toBe(true);
  });
  it('preserves overrides but resets state in a library snapshot',()=>{
    const s=useStore.getState();s.placeTemplate('toggle',{x:0,y:0});s.setElementState('pressed');s.saveToLibrary();const saved=useStore.getState().userTemplates[0];
    const placed=instantiate(saved,{x:0,y:0},1,studio,[],[]);expect(placed.elements.every(e=>e.state==='default')).toBe(true);expect(placed.elements[1].stateOverrides!.pressed!.offset!.x).toBe(28);
  });
});
