import { describe,it,expect } from 'vitest';
import { defaultProfile } from '../profiles/presets';
import type { Element, Group } from './types';
import { leavesOf, topLevelOf, groupBounds, resolveTargets } from './targets';
const el=(id:string,x:number,groupId?:string):Element=>({id,type:'rect',state:'default',pressable:true,x,y:0,width:10,height:10,groupId,props:{profile:defaultProfile('flat'),material:'plastic-white'}});
const groups:Group[]=[{id:'outer'},{id:'inner',groupId:'outer'}];
const elements=[el('a',0,'outer'),el('b',20,'inner'),el('c',40,'inner'),el('d',80)];
describe('selection targets',()=>{
  it('expands and deduplicates in z order',()=>expect(leavesOf(['inner','outer','b'],elements,groups).map(e=>e.id)).toEqual(['a','b','c']));
  it('resolves level and entered direct child',()=>{expect(topLevelOf('b',elements,groups)).toBe('outer');expect(topLevelOf('b',elements,groups,'outer')).toBe('inner');expect(topLevelOf('b',elements,groups,'inner')).toBe('b');});
  it('derives bounds each time',()=>{expect(groupBounds('outer',elements,groups)).toEqual({x:0,y:0,w:50,h:10});expect(groupBounds('inner',elements.map(e=>e.id==='c'?{...e,x:60}:e),groups)).toEqual({x:20,y:0,w:50,h:10});});
  it('resolves match, active, and stale individual selection',()=>{expect(resolveTargets(['outer'],elements,groups,true,null)).toEqual(['a','b','c']);expect(resolveTargets(['outer'],elements,groups,false,'b')).toEqual(['b']);expect(resolveTargets(['outer'],elements,groups,false,'d')).toEqual(['c']);});
});
