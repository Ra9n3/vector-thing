import {beforeEach,describe,expect,it} from 'vitest';
import {useStore,clearHistoryForQA} from '../store';
import {defaultProfile} from './presets';
import type {CustomProfile} from './custom';
const custom:CustomProfile={points:[{x:0,y:.1},{x:.4,y:.8},{x:1,y:.2}],mirror:true,smooth:.5};
describe('custom selection and history',()=>{
 beforeEach(()=>{useStore.setState({elements:[],groups:[],selection:[],matchMode:true,activeId:null,userProfiles:[],properties:{shape:'rounded',profile:defaultProfile('raised'),material:'plastic-white',size:96}});clearHistoryForQA();});
 it('applies to matching selected parts and restores a custom curve after a built-in preset',()=>{const s=useStore.getState();s.addElement('rect',80,40,0,0);const a=useStore.getState().selection[0];s.addElement('circle',50,50,150,0);const b=useStore.getState().selection[0];s.setSelection([a,b]);s.setCustomProfile(custom,true);expect(useStore.getState().elements.every(e=>e.props.profile.kind==='custom')).toBe(true);s.setSideProfile('dip');expect(useStore.getState().elements.every(e=>e.props.profile.kind===undefined)).toBe(true);s.undo();expect(useStore.getState().elements.every(e=>e.props.profile.kind==='custom')).toBe(true);});
 it('edits only the focused part when match is off',()=>{const s=useStore.getState();s.addElement('rect',80,40,0,0);const a=useStore.getState().selection[0];s.addElement('circle',50,50,150,0);const b=useStore.getState().selection[0];s.setSelection([a,b]);s.setMatchMode(false);s.setActiveId(a);s.setCustomProfile(custom,true);const [first,second]=useStore.getState().elements;expect(first.props.profile.kind).toBe('custom');expect(second.props.profile.kind).not.toBe('custom');});
 it('cancels a live edit without recording it',()=>{const s=useStore.getState();s.addElement('rect',80,40,0,0);const before=useStore.getState().elements[0].props.profile;s.setCustomProfile(custom,false);s.cancelCustomProfile();expect(useStore.getState().elements[0].props.profile).toEqual(before);});
});
