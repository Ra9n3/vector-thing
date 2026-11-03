import {beforeEach,describe,expect,it} from 'vitest';
import {useStore} from '../store';
import {defaultProfile} from '../profiles/presets';
import {presetOutline} from './presets';

describe('outline store actions',()=>{
 beforeEach(()=>useStore.setState({elements:[],groups:[],selection:[],matchMode:true,activeId:null,properties:{shape:'rounded',profile:defaultProfile('raised'),material:'speckle-grey',size:96}}));
 it('applies a new preset to selection and undoes without losing the original shape',()=>{const s=useStore.getState();s.addElement('rect',100,80,0,0);s.setOutlinePreset('polygon',12);expect(useStore.getState().elements[0].outline?.nodes).toHaveLength(12);s.undo();expect(useStore.getState().elements[0].type).toBe('rect');});
 it('converts a primitive and groups continuous outline edits into a single undo',()=>{const s=useStore.getState();s.addElement('rect',100,80,0,0);const id=useStore.getState().selection[0];s.convertToOutline(id);const before=useStore.getState().elements[0].outline!;const first={...before,nodes:before.nodes.map((n,i)=>i===0?{...n,x:.1}:n)},last={...first,nodes:first.nodes.map((n,i)=>i===0?{...n,x:.2}:n)};s.setOutline(id,first,false);s.setOutline(id,last,true);expect(useStore.getState().elements[0].outline).toEqual(last);s.undo();expect(useStore.getState().elements[0].outline).toEqual(before);s.undo();expect(useStore.getState().elements[0].type).toBe('rect');});
 it('preserves paths in copied elements independently',()=>{const s=useStore.getState();s.addElement('rect',100,80,0,0);s.setOutlinePreset('star',5,.4);const original=useStore.getState().elements[0];s.duplicateSelection();const copy=useStore.getState().elements.find(e=>e.id!==original.id)!;expect(copy.outline).toEqual(presetOutline('star',5,.4));s.setOutline(copy.id,presetOutline('triangle'),true);expect(useStore.getState().elements.find(e=>e.id===original.id)?.outline).toEqual(original.outline);});
});
