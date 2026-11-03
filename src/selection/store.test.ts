import {beforeEach,describe,expect,it} from 'vitest';
import { useStore } from '../store';
import {defaultProfile} from '../profiles/presets';
import type {Element} from './types';
const e=(id:string,x:number,material='plastic-white',preset:'raised'|'dip'='raised'):Element=>({id,type:'rect',state:'default',pressable:true,x,y:0,width:80,height:40,props:{material,profile:defaultProfile(preset)}});
describe('group state and target edits',()=>{
 beforeEach(()=>useStore.setState({elements:[e('a',0),e('b',120,'plastic-red'),e('c',240)],groups:[],selection:['a','b'],matchMode:true,activeId:null,enteredGroupId:null}));
 it('groups, reorders, ungroups and duplicates with one undo each',()=>{
   const s=useStore.getState(), original=s.elements;
   s.group();let state=useStore.getState();const group=state.selection[0];expect(state.groups).toHaveLength(1);expect(state.elements.map(e=>e.groupId)).toEqual([group,group,undefined]);
   const grouped=state.elements;s.undo();expect(useStore.getState().elements).toEqual(original);expect(useStore.getState().groups).toEqual([]);s.redo();expect(useStore.getState().elements).toEqual(grouped);
   s.reorder('front');expect(useStore.getState().elements.map(e=>e.id)).toEqual(['c','a','b']);s.undo();expect(useStore.getState().elements).toEqual(grouped);
   s.ungroup();expect(useStore.getState().selection).toEqual(['a','b']);s.undo();expect(useStore.getState().groups).toEqual([{id:group}]);
   s.duplicateSelection();expect(useStore.getState().groups).toHaveLength(2);expect(useStore.getState().elements).toHaveLength(5);s.undo();expect(useStore.getState().elements).toEqual(grouped);
 });
 it('applies every property to active individual leaf, or all in Match',()=>{
   const s=useStore.getState();s.group();s.setMaterial('metal-gold');expect(useStore.getState().elements.map(e=>e.props.material)).toEqual(['metal-gold','metal-gold','plastic-white']);
   s.setMatchMode(false);expect(useStore.getState().activeId).toBe('b');s.setActiveId('a');s.setMaterial('plastic-blue');s.setCustomColor('#abcdef');s.setWall(1.5);s.setProfileMode('across');s.setProfileAxis('horizontal');s.setSideProfile('dip');
   let [a,b]=useStore.getState().elements;expect(a.props).toMatchObject({material:'plastic-blue',customColor:'#abcdef',profile:{preset:'dip',wall:1.5,mode:'across',acrossAxis:'horizontal'}});expect(b.props.material).toBe('metal-gold');expect(b.props.profile.preset).toBe('raised');
   s.setMatchMode(true);expect(useStore.getState().activeId).toBeNull();s.setSideProfile('raised');s.setProfileParam(['a','b'],'height',0.8,true);[a,b]=useStore.getState().elements;expect(a.props.profile.height).toBe(0.8);expect(b.props.profile.height).toBe(0.8);
 });
 it('scales selected sizes with a common factor without moving centers',()=>{
   const s=useStore.getState();useStore.setState({elements:[e('a',0),{...e('b',120),width:40,height:20}],selection:['a','b']});s.setSize(120);const [a,b]=useStore.getState().elements;
   expect(a.width/80).toBeCloseTo(b.width/40,2);expect(a.x+a.width/2).toBe(40);expect(b.x+b.width/2).toBe(140);
 });
 it('moves and deletes whole groups even in Individual mode',()=>{
   const s=useStore.getState();s.group();s.setMatchMode(false);s.nudge(10,0);expect(useStore.getState().elements.map(e=>e.x)).toEqual([10,130,240]);s.deleteSelection();expect(useStore.getState().elements.map(e=>e.id)).toEqual(['c']);expect(useStore.getState().groups).toEqual([]);s.undo();expect(useStore.getState().groups).toHaveLength(1);
 });
});
