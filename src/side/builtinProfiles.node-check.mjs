import {test} from 'node:test';
import assert from 'node:assert/strict';
import {PRESETS,defaultProfile} from '../profiles/presets.ts';
import {resolveProfile,profileToSamples,sampleProfile} from '../profiles/sample.ts';
import {sectionSamples,sectionSurface} from './sectionPath.ts';
import {profileHandles} from './profileHandles.ts';

for(const preset of PRESETS)test(`${preset.id}: finite 64-value profile table, Side path and handles`,()=>{
  const settings=defaultProfile(preset.id),profile=resolveProfile(settings),table=profileToSamples(profile,64);
  assert.equal(table.length,64);
  assert.ok(table.every(value=>Number.isFinite(value)&&value>=0&&value<=1));
  const path=sectionSurface(sectionSamples(profile,settings.height),320);
  assert.match(path,/^M/);assert.match(path,/L/);assert.doesNotMatch(path,/NaN|Infinity/);
  const handles=profileHandles(preset);assert.ok(handles.length>0);
  for(const handle of handles){const point=handle.position({...settings.params,height:settings.height},profile);assert.ok(Number.isFinite(point.u)&&Number.isFinite(point.h));assert.ok(Number.isFinite(sampleProfile(profile,point.u)));}
});
