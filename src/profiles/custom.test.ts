import {describe,it,expect} from 'vitest';
import {defaultProfile} from './presets';
import {resolveProfile,sampleProfile} from './sample';
import {acrossStops} from '../render/acrossGradient';
import {resolveMaterial} from '../materials/resolve';
import {shadingSpec} from '../render/shadingKey';
import {cssEligibility} from '../export/css/cssEligibility';
import type {Element} from '../selection/types';
const makeCustom=(preset:'dip'|'dome')=>{const base=defaultProfile(preset),resolved=resolveProfile(base);return {...base,kind:'custom' as const,custom:{points:Array.from({length:12},(_,i)=>({x:(i/11)**(preset==='dome'?2:1),y:sampleProfile(resolved,(i/11)**(preset==='dome'?2:1))})),mirror:true,smooth:.5}};};
const el=(profile:ReturnType<typeof makeCustom>):Element=>({id:'a',type:'rect',x:0,y:0,width:100,height:60,state:'default',pressable:true,props:{profile,material:'plastic-white'}});
const luminance=(color:string)=>{const [r,g,b]=color.match(/[\d.]+/g)!.map(Number);return .2126*r+.7152*g+.0722*b;};
describe('custom profiles',()=>{
 it('uses the same fixed-light direction as a built-in dip',()=>{const material=resolveMaterial('plastic-white');const a=acrossStops(resolveProfile(defaultProfile('dip')),material,100,12,'horizontal',65);const b=acrossStops(resolveProfile(makeCustom('dip')),material,100,12,'horizontal',65);const near=(stops:typeof a,x:number)=>stops.reduce((a,b)=>Math.abs(a.offset-x)<Math.abs(b.offset-x)?a:b);const contrast=(stops:typeof a)=>luminance(near(stops,.25).color)-luminance(near(stops,.75).color);expect(Math.sign(contrast(b))).toBe(Math.sign(contrast(a)));});
 it('approximates a dome from twelve points',()=>{const expected=resolveProfile(defaultProfile('dome')),actual=resolveProfile(makeCustom('dome'));for(let i=0;i<=100;i++)expect(Math.abs(sampleProfile(actual,i/100)-sampleProfile(expected,i/100))).toBeLessThan(.08);});
 it('keeps unrelated shading keys stable and rejects CSS',()=>{const base=makeCustom('dip'),a=el(base),b={...a,id:'b'},before=shadingSpec(b).filterKey;const changed={...a,props:{...a.props,profile:{...base,custom:{...base.custom,points:[{x:0,y:0},{x:1,y:1}]}}}};expect(shadingSpec(changed).filterKey).not.toBe(shadingSpec(a).filterKey);expect(shadingSpec(b).filterKey).toBe(before);expect(shadingSpec({...b,id:'other'}).filterKey).toBe(before);expect(cssEligibility([a]).eligible).toBe(false);});
});
