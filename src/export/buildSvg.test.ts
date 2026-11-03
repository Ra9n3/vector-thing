import { describe,expect,it } from 'vitest';
import { JSDOM } from 'jsdom';
import { buildSvg } from './buildSvg';
import { exportScene } from './scene';
import { instantiate } from '../library/instantiate';
import { BUILTIN_TEMPLATES } from '../library/catalog';
import { useStore } from '../store';
import { resolveStyle } from '../styles/catalog';
const pack=resolveStyle('studio-hardware'),template=BUILTIN_TEMPLATES.find(t=>t.id==='knob')!;
const r=instantiate(template,{x:0,y:0},1,pack,[],[]);
const scene=(elements=r.elements)=>exportScene({elements,groups:r.groups,selection:r.selection,scope:'all',states:'current',look:'slight',direction:'s',pack,background:false})[0];
describe('SVG output',()=>{
 it('is deterministic XML, without UI attributes, with scoped IDs and natural viewBox',()=>{
   const v=scene(),a=buildSvg(v),b=buildSvg(v);expect(a).toBe(b);expect(a).not.toMatch(/\sdata-/);expect(a).not.toContain('pointer-events=');
   const doc=new JSDOM(a,{contentType:'image/svg+xml'}).window.document;
   expect(doc.querySelector('parsererror')).toBeNull();expect(doc.documentElement.getAttribute('viewBox')).toBe(`0 0 ${v.bounds.w} ${v.bounds.h}`);
   const ids=[...doc.querySelectorAll('[id]')].map(e=>e.id);expect(ids.length).toBeGreaterThan(0);expect(ids.every(id=>/^e[a-z0-9]{6}-/.test(id))).toBe(true);
   expect(new Set(ids).size).toBe(ids.length);
   const refs=[...a.matchAll(/(?:url\(#|href="#)([^)"']+)/g)].map(m=>m[1]);
   for(const ref of refs)expect(ids,`missing ${ref}`).toContain(ref);
   const different=new JSDOM(buildSvg(scene(r.elements.map(e=>({...e,x:e.x+20}))),1),{contentType:'image/svg+xml'}).window.document;
   expect(ids[0].slice(0,7)).not.toBe(different.querySelector('[id]')!.id.slice(0,7));
 });
 it('deduplicates identical filter definitions',()=>{
   const doc=new JSDOM(buildSvg(scene()),{contentType:'image/svg+xml'}).window.document;
   const keys=[...doc.querySelectorAll('filter')].map(filter=>{const copy=filter.cloneNode(true) as Element;copy.removeAttribute('id');return copy.outerHTML;});
   expect(new Set(keys).size).toBe(keys.length);
 });
 it('emits no unreferenced IDs',()=>{
   const xml=buildSvg(scene());
   const ids=[...xml.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
   const refs=new Set([...xml.matchAll(/(?:url\(#|(?:href|xlink:href)="#)([^)"']+)/g)].map(m=>m[1]));
   expect(ids.length).toBeGreaterThan(0);for(const id of ids)expect(refs.has(id),id).toBe(true);
 });
 it('does not alter the document or create a history entry',()=>{
   useStore.setState({elements:[],groups:[],selection:[],styleId:'studio-hardware'});const s=useStore.getState();
   s.addElement('rect',80,40,0,0);const before=useStore.getState().elements;const out=exportScene({elements:before,groups:[],selection:[],scope:'all',states:'all',look:'slight',direction:'s',pack,background:false});
   out.forEach(v=>buildSvg(v));expect(useStore.getState().elements).toBe(before);s.undo();expect(useStore.getState().elements).toEqual([]);
 });
 it('deduplicates identical shading definitions and scales lighting for PNG',()=>{
   const e=r.elements[1];const repeated=[e,{...e,id:'other',x:e.x+100}];const v=scene(repeated),one=buildSvg(v,1),two=buildSvg(v,2);
   const a=new JSDOM(one,{contentType:'image/svg+xml'}).window.document,b=new JSDOM(two,{contentType:'image/svg+xml'}).window.document;
   expect(a.querySelectorAll('feDiffuseLighting')).toHaveLength(1);
   expect(Number(b.querySelector('feDiffuseLighting')!.getAttribute('surfaceScale'))).toBeCloseTo(2*Number(a.querySelector('feDiffuseLighting')!.getAttribute('surfaceScale')),1);
 });
});
