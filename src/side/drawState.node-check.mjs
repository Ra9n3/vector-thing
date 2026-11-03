import {test} from 'node:test';
import assert from 'node:assert/strict';
import {useStore} from '../store.ts';

test('choosing any built-in preset exits Draw mode and restores the preset',()=>{
 useStore.getState().addElement('rect',140,65,0,0);
 for(const preset of ['flat','raised','pillow','dip','ribbed','dome','inset']){
  useStore.getState().setDrawProfile(true);useStore.getState().setSideProfile(preset);
  const s=useStore.getState();assert.equal(s.drawProfile,false);assert.equal(s.elements.find(e=>s.selection.includes(e.id)).props.profile.preset,preset);
 }
});
test('leaving Side exits Draw mode',()=>{
 useStore.getState().setMode('side');useStore.getState().setDrawProfile(true);assert.equal(useStore.getState().drawProfile,true);
 useStore.getState().setMode('face');assert.equal(useStore.getState().drawProfile,false);
});
