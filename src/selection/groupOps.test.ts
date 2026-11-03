import {describe,it,expect} from 'vitest';
import {defaultProfile} from '../profiles/presets';
import {groupSelection,ungroupSelection,duplicateSelection,reorderSelection} from './groupOps';
import type {Element,GroupState} from './types';
import {computeResize,boundsOf} from '../geometry/bounds';
const el=(id:string,groupId?:string,type:Element['type']='rect',x=0):Element=>({id,groupId,type,state:'default',pressable:true,x,y:0,width:20,height:20,props:{profile:defaultProfile('raised'),material:'plastic-white'}});
const ids=(s:GroupState)=>s.elements.map(e=>e.id);
describe('group operations',()=>{
 it('groups noncontiguous elements at the topmost selected position, preserving order',()=>{
   const s={elements:['a','b','c','d'].map(x=>el(x)),groups:[],selection:['a','c']};
   const n=groupSelection(s,'g');expect(ids(n)).toEqual(['b','a','c','d']);expect(n.elements.filter(e=>e.groupId==='g').map(e=>e.id)).toEqual(['a','c']);expect(ids(s)).toEqual(['a','b','c','d']);
 });
 it('detaches across groups without splitting remaining group blocks',()=>{
   const s={elements:[el('a','g1'),el('b','g1'),el('c','g2'),el('d','g2'),el('e','g2')],groups:[{id:'g1'},{id:'g2'}],selection:['a','d']};
   const n=groupSelection(s,'g3');expect(ids(n)).toEqual(['b','c','e','a','d']);expect(n.groups.map(g=>g.id)).toEqual(['g1','g2','g3']);
   const empty=groupSelection({...s,selection:['a','b','d']},'g3');expect(empty.groups.map(g=>g.id)).not.toContain('g1');
 });
 it('rejects nesting beyond depth three',()=>{
   const s={elements:[el('a','g3'),el('b','g3')],groups:[{id:'g1'},{id:'g2',groupId:'g1'},{id:'g3',groupId:'g2'}],selection:['a','b']};expect(groupSelection(s,'g4')).toBe(s);
 });
 it('ungroups in place and selects direct children',()=>{
   const s={elements:[el('a','g'),el('b','inner'),el('c','inner')],groups:[{id:'g'},{id:'inner',groupId:'g'}],selection:['g']};
   const n=ungroupSelection(s);expect(ids(n)).toEqual(ids(s));expect(n.selection).toEqual(['a','inner']);expect(n.groups).toEqual([{id:'inner'}]);expect(n.elements[0].groupId).toBeUndefined();
 });
 it('duplicates nested structures and preserves originals',()=>{
   const s={elements:[el('a','g'),el('b','inner')],groups:[{id:'g'},{id:'inner',groupId:'g'}],selection:['g']};let n=0;const out=duplicateSelection(s,()=>`new${n++}`);
   expect(ids(out)).toEqual(['a','b','new2','new3']);expect(out.selection).toEqual(['new0']);expect(out.groups).toEqual([{id:'g'},{id:'inner',groupId:'g'},{id:'new0'},{id:'new1',groupId:'new0'}]);expect(s.elements[0].x).toBe(0);
 });
 it('reorders selected groups as blocks and stops at bounds',()=>{
   const s={elements:[el('a'),el('b','g'),el('c','g'),el('d')],groups:[{id:'g'}],selection:['g']};
   const n=reorderSelection(s,'forward');expect(ids(n)).toEqual(['a','d','b','c']);expect(reorderSelection(n,'forward')).toBe(n);expect(ids(reorderSelection(s,'back'))).toEqual(['b','c','a','d']);
 });
 it('keeps single circles resizable with the aspect lock released',()=>{
   const circle=el('c',undefined,'circle',0);const out=computeResize('e',[circle],boundsOf([circle])!,{x:40,y:10},{free:true,snap:false});
   expect(out.c.width).toBe(40);expect(out.c.height).toBe(40);
 });
 it('free scales centers while circles stay round',()=>{
   const els=[el('a',undefined,'rect',0),el('b',undefined,'circle',80)];const box=boundsOf(els)!;
   const out=computeResize('se',els,box,{x:200,y:60},{free:true,snap:false});expect(out.a.width).toBe(40);expect(out.a.height).toBe(60);expect(out.b.width).toBe(40);expect(out.b.height).toBe(40);expect(out.b.x!+out.b.width!/2).toBe(180);expect(out.b.y!+out.b.height!/2).toBe(30);
 });
});
