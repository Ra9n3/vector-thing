import { describe,expect,it } from 'vitest';
import { exportScene } from './scene';
import { instantiate } from '../library/instantiate';
import { BUILTIN_TEMPLATES } from '../library/catalog';
import { resolveStyle } from '../styles/catalog';
import { displayedElement } from '../render/stack';
const pack=resolveStyle('studio-hardware');const template=BUILTIN_TEMPLATES.find(t=>t.id==='square-button')!;
const r=instantiate(template,{x:100,y:100},1,pack,[],[]);
const opts={elements:r.elements,groups:r.groups,selection:r.selection,scope:'selection' as const,states:'all' as const,look:'strong' as const,direction:'s' as const,pack,background:false};
describe('export scene',()=>{
 it('expands groups in z order and shares integer bounds across all states without mutation',()=>{
   const before=JSON.stringify(r),v=exportScene(opts);expect(v.map(x=>x.state)).toEqual(['default','pressed','disabled']);
   expect(v.map(x=>x.bounds)).toEqual([v[0].bounds,v[0].bounds,v[0].bounds]);expect(v[0].elements.map(e=>e.id)).toEqual(r.elements.map(e=>e.id));
   expect(JSON.stringify(r)).toBe(before);expect(v[1].elements.every(e=>e.state==='pressed')).toBe(true);
   for(const n of Object.values(v[0].bounds))expect(Number.isInteger(n)).toBe(true);
   expect(v[0].bounds.w).toBeGreaterThan(48+2*22);
 });
 it('uses an unselected base in the stack context without exporting it',()=>{
   const v=exportScene({...opts,selection:[r.elements[1].id],states:'current'})[0];expect(v.elements).toHaveLength(1);expect(v.context).toHaveLength(2);
   const displayed=displayedElement(v.elements[0],v.context,v.look,v.direction,{pack});expect(displayed.y).not.toBe(v.elements[0].y);
   expect(v.bounds.x).toBeLessThan(displayed.x);expect(v.bounds.y).toBeLessThan(displayed.y);
 });
});
