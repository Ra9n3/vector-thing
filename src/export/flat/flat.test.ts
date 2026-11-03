import { describe,expect,it } from 'vitest';
import { JSDOM } from 'jsdom';
import { insetOutline } from '../../geometry/insetOutline';
import { shapeOutline } from '../../geometry/outline';
import { outsetHull } from '../../geometry/hull';
import { softLayers } from './softLayers';
import { bandFacets } from './bandFacets';
import { buildFlatSvg } from './flatSvg';
import { shadeColor,colorString } from '../../render/shade';
import { resolveStyle } from '../../styles/catalog';
import { resolveMaterial,MATERIALS } from '../../materials/resolve';
import { defaultProfile } from '../../profiles/presets';
import { resolveProfile } from '../../profiles/sample';
import { exportScene } from '../scene';
import type { Element } from '../../selection/types';
const pack=resolveStyle('studio-hardware');
describe('flat geometry',()=>{
 it('preserves vertex count and finite values at all inset depths',()=>{for(const type of ['rect','rounded','circle','pill','hexagon'] as const)for(const d of [0,4,18,50,100]) {const p=insetOutline(type,100,60,d);expect(p.length).toBe(shapeOutline(type,100,60).length);expect(p.every(x=>Number.isFinite(x.x)&&Number.isFinite(x.y))).toBe(true);}});
 it('makes monotone soft layers with the requested central opacity',()=>{const layers=softLayers(8,.6);let alpha=0;for(const x of layers)alpha=1-(1-alpha)*(1-x.opacity);expect(alpha).toBeCloseTo(.6,4);expect(layers.every((x,i)=>!i||x.opacity<=layers[i-1].opacity)).toBe(true);});
 it('outsets a circle approximately correctly',()=>{const p=outsetHull(shapeOutline('circle',100,100),10);const area=Math.abs(p.reduce((s,x,i)=>{const y=p[(i+1)%p.length];return s+x.x*y.y-y.x*x.y},0))/2;expect(area/(Math.PI*60*60)).toBeGreaterThan(.98);expect(area/(Math.PI*60*60)).toBeLessThan(1.02);});
 it('uses shadeColor for band facets and stays within the path cap',()=>{const m=resolveMaterial('plastic-red'),f=bandFacets('circle',100,100,resolveProfile(defaultProfile('dome')),m,14);expect(f.length).toBeLessThanOrEqual(600);expect(f[0].fill).toBe(colorString(shadeColor(m,f[0].slopeX,f[0].slopeY)));});
 it('never emits filter, image or mask features across materials and shapes',()=>{
   for(const type of ['rect','rounded','circle','pill','hexagon'] as const)for(const material of MATERIALS){
    const el:Element={id:'e',type,state:'default',pressable:true,x:0,y:0,width:40,height:40,props:{material:material.id,profile:defaultProfile('raised')}};
    const variants=exportScene({elements:[el],groups:[],selection:[],scope:'all',states:'all',look:'slight',direction:'se',pack,background:false});
    for(const variant of variants){const s=buildFlatSvg(variant);expect(s).not.toMatch(/<filter|\sfilter=|mix-blend-mode|<image|<mask|feTurbulence/i);const doc=new JSDOM(s,{contentType:'image/svg+xml'}).window.document;expect(doc.querySelector('parsererror')).toBeNull();}
   }
 },20000);
});
