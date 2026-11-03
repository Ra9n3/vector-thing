import { useStore } from '../src/store';
import { resolveStyle } from '../src/styles/catalog';
import type { Element, Group } from '../src/selection/types';
import type { Direction, Look } from '../src/viewTypes';
import { migrateDocument } from '../src/document/schema';
import type { UserProfilePreset } from '../src/profiles/userPresets';
interface Fixture {elements:Element[];groups:Group[];styleId:string;look:Look;direction:Direction;selection:string[];schemaVersion?:number;userProfiles?:UserProfilePreset[]}
const fixtures=import.meta.glob<Fixture>('./fixtures/*.json',{eager:true,import:'default'});
export function loadFixture(name:string):boolean {
  const fixture=fixtures[`./fixtures/${name}.json`];if(!fixture)return false;
  const doc=migrateDocument(fixture);
  const pack=resolveStyle(doc.styleId);
  useStore.setState({...doc,canvasBackground:pack.canvasBackground,mode:'face',matchMode:true,activeId:null,hoveredId:null,enteredGroupId:null});
  return true;
}
