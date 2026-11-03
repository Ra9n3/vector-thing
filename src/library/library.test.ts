import { describe,it,expect,beforeEach } from 'vitest';
import { BUILTIN_TEMPLATES } from './catalog';
import { instantiate } from './instantiate';
import { snapshotTemplate, loadUserTemplates, saveUserTemplates } from './userTemplates';
import { resolveStyle } from '../styles/catalog';
import { materialId } from '../materials/resolve';
import { leavesOf, resolveTargets } from '../selection/targets';
import { duplicateSelection, deleteSelection } from '../selection/groupOps';
import { applyStyle } from '../styles/applyStyle';
import { useStore } from '../store';
import { boundsOf, computeResize } from '../geometry/bounds';
import type { ComponentTemplate } from './types';
const studio=resolveStyle('studio-hardware'), clay=resolveStyle('soft-clay');
const template=(id:string)=>BUILTIN_TEMPLATES.find(t=>t.id===id)!;
describe('component library',()=>{
  it('contains seven categories and instantiates all templates with unique keys, circle ratios and contiguous leaves',()=>{
    expect(BUILTIN_TEMPLATES.length).toBeGreaterThanOrEqual(25);
    expect(new Set(BUILTIN_TEMPLATES.map(t=>t.category)).size).toBe(7);
    for(const t of BUILTIN_TEMPLATES) {
      const r=instantiate(t,{x:40,y:60},1.5,studio,[],[]);
      expect(r.elements.length).toBeGreaterThan(0);
      expect(new Set([...r.elements.map(e=>e.id),...r.groups.map(g=>g.id)]).size).toBe(r.elements.length+r.groups.length);
      expect(new Set(r.elements.map(e=>e.partKey)).size).toBe(r.elements.length);
      expect(leavesOf(r.selection,r.elements,r.groups)).toHaveLength(r.elements.length);
      for(const e of r.elements){if(e.type==='circle')expect(e.width).toBe(e.height);if(e.sitsOn)expect(r.elements.some(base=>base.id===e.sitsOn)).toBe(true);}
      expect(r.groups.some(g=>g.template?.id===t.id)).toBe(r.elements.length>1);
    }
  });
  it('expands rings into nested groups and creates independent ids and contiguous z order',()=>{
    const t=template('knob-scale');
    expect(t).toBeTruthy();
    const first=instantiate(t,{x:0,y:0},1,studio,[],[]);
    const second=instantiate(t,{x:200,y:0},1,studio,first.elements,first.groups);
    expect(second.elements.slice(0,first.elements.length)).toEqual(first.elements);
    const newLeaves=second.elements.slice(first.elements.length);
    expect(newLeaves.filter(e=>e.partKey?.startsWith('scale-')).length).toBeGreaterThan(1);
    const ring=newLeaves.find(e=>e.partKey?.startsWith('scale-'))!.groupId;
    expect(second.groups.find(g=>g.id===ring)?.groupId).toBe(second.selection[0]);
    expect(new Set(second.elements.map(e=>e.id)).size).toBe(second.elements.length);
  });
  it('resolves pack profiles on creation and remaps slots but never fixed materials',()=>{
    const a=instantiate(template('knob'),{x:0,y:0},1,studio,[],[]);
    const b=instantiate(template('knob'),{x:0,y:0},1,clay,[],[]);
    expect(a.elements.find(e=>e.partKey==='cap')!.props.profile.preset).toBe(studio.defaultProfile!.knobs);
    expect(b.elements.find(e=>e.partKey==='cap')!.props.profile.preset).toBe(clay.defaultProfile!.knobs);
    const button=instantiate(template('square-button'),{x:0,y:0},1,studio,[],[]);
    const mapped=applyStyle(button.elements,studio,clay);
    expect(mapped[0].props.material).toBe(materialId(clay.palette[0]));
    expect(mapped[1].props.material).toBe(button.elements[1].props.material);
    expect(mapped[0].props.profile).toEqual(button.elements[0].props.profile);
  });
  it('resolves references declared later and uses fallback on missing pack categories',()=>{
    const t:ComponentTemplate={id:'test',label:'Test',category:'parts',size:{w:30,h:30},parts:[
      {key:'child',shape:'circle',rect:{x:5,y:5,w:10,h:10},profile:'pack',fallback:{preset:'dome'},material:{slot:0},sitsOn:'base'},
      {key:'base',shape:'circle',rect:{x:0,y:0,w:30,h:30},profile:{preset:'flat'},material:{id:'led-orange'}}]};
    const r=instantiate(t,{x:0,y:0},1,studio,[],[]);
    expect(r.elements[0].sitsOn).toBe(r.elements[1].id);
    expect(r.elements[0].props.profile.preset).toBe('dome');
  });
  it('filters template main parts only in Match and remaps duplicated stack references',()=>{
    const r=instantiate(template('knob'),{x:0,y:0},1,studio,[],[]);
    expect(resolveTargets(r.selection,r.elements,r.groups,true,null,e=>!!e.main)).toEqual([r.elements[1].id]);
    expect(resolveTargets(r.selection,r.elements,r.groups,false,r.elements[2].id,e=>!!e.main)).toEqual([r.elements[2].id]);
    let i=0;const copy=duplicateSelection(r,()=>`copy-${i++}`);
    const copyLeaves=leavesOf(copy.selection,copy.elements,copy.groups);
    expect(copyLeaves[1].sitsOn).toBe(copyLeaves[0].id);expect(copyLeaves[2].sitsOn).toBe(copyLeaves[1].id);
    const removed=deleteSelection({...r,selection:[r.elements[0].id]});
    expect(removed.elements[0].sitsOn).toBeUndefined();
  });
  it('duplicates stack references when leaves are selected separately',()=>{
    const r=instantiate(template('knob'),{x:0,y:0},1,studio,[],[]);
    let i=0;const c=duplicateSelection({...r,selection:r.elements.map(e=>e.id)},()=>`separate-${i++}`);
    const copies=c.selection.map(id=>c.elements.find(e=>e.id===id)!);
    expect(copies[1].sitsOn).toBe(copies[0].id);expect(copies[2].sitsOn).toBe(copies[1].id);
  });
  it('scales tiny template parts together without forcing them to the ordinary shape minimum',()=>{
    const r=instantiate(template('knob'),{x:0,y:0},1,studio,[],[]);const box=boundsOf(r.elements)!;
    const out=computeResize('se',r.elements,box,{x:box.x+box.w*2,y:box.y+box.h*2},{free:false,snap:false,minSize:.01});
    expect(out[r.elements[2].id].width).toBe(8);
    expect(out[r.elements[0].id].width).toBe(128);
  });
  it('snapshots geometry, material slots, custom profiles and stack for a round trip',()=>{
    const r=instantiate(template('knob'),{x:50,y:60},1.25,studio,[],[]);
    r.elements[1].props.customColor='#112233';
    const saved=snapshotTemplate('user-1',r.selection,r.elements,r.groups,studio)!;
    const restored=instantiate(saved,{x:200,y:100},1,studio,[],[]);
    expect(restored.elements.map(e=>[e.width,e.height,e.props,e.main])).toEqual(r.elements.map(e=>[e.width,e.height,e.props,e.main]));
    expect(restored.elements[1].x-restored.elements[0].x).toBeCloseTo(r.elements[1].x-r.elements[0].x,5);
    expect(restored.elements[1].sitsOn).toBe(restored.elements[0].id);
    let raw='';const storage={setItem:(_:string,v:string)=>raw=v,getItem:()=>raw} as unknown as Storage;
    saveUserTemplates([saved],storage);expect(loadUserTemplates(storage)).toEqual([saved]);
  });
});
describe('library store integration',()=>{
  beforeEach(()=>useStore.setState({elements:[],groups:[],selection:[],userTemplates:[],styleId:'studio-hardware',matchMode:true,activeId:null}));
  it('places, undoes and redoes in one step; edits only main parts',()=>{
    useStore.getState().placeTemplate('square-button',{x:100,y:100});
    const s=useStore.getState();expect(s.elements).toHaveLength(2);
    const led=s.elements[1].props.material;s.setMaterial('plastic-blue');s.setCustomColor('#123456');
    expect(useStore.getState().elements[0].props.customColor).toBe('#123456');
    expect(useStore.getState().elements[1].props.material).toBe(led);expect(useStore.getState().elements[1].props.customColor).toBeUndefined();
    useStore.getState().undo();useStore.getState().undo();useStore.getState().undo();expect(useStore.getState().elements).toHaveLength(0);
    useStore.getState().redo();expect(useStore.getState().elements).toHaveLength(2);
  });
  it('scales a template as one object and Individual edits only its active leaf',()=>{
    useStore.getState().placeTemplate('knob',{x:0,y:0});
    const before=useStore.getState().elements; useStore.getState().setSize(128);
    const after=useStore.getState().elements;
    expect(after.map((e,i)=>e.width/before[i].width)).toEqual([2,2,2]);
    expect(after[1].x-after[0].x).toBeCloseTo((before[1].x-before[0].x)*2);
    useStore.getState().setMatchMode(false); useStore.getState().setActiveId(after[2].id); useStore.getState().setMaterial('plastic-red');
    expect(useStore.getState().elements.map(e=>e.props.material)).toEqual(['plastic-black','speckle-grey','plastic-red']);
  });
  it('saves and deletes user components with undo/redo',()=>{
    useStore.getState().placeTemplate('knob',{x:0,y:0});useStore.getState().saveToLibrary();
    const id=useStore.getState().userTemplates[0].id;useStore.getState().deleteUserTemplate(id);
    expect(useStore.getState().userTemplates).toHaveLength(0);useStore.getState().undo();
    expect(useStore.getState().userTemplates[0].id).toBe(id);useStore.getState().redo();expect(useStore.getState().userTemplates).toHaveLength(0);
  });
});
