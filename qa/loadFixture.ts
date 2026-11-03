import { useStore } from '../src/store';
import { resolveStyle } from '../src/styles/catalog';
import type { Element, Group } from '../src/selection/types';
import type { Direction, Look } from '../src/viewTypes';
interface Fixture {elements:Element[];groups:Group[];styleId:string;look:Look;direction:Direction;selection:string[]}
const fixtures=import.meta.glob<Fixture>('./fixtures/*.json',{eager:true,import:'default'});
export function loadFixture(name:string):boolean {
  const fixture=fixtures[`./fixtures/${name}.json`];if(!fixture)return false;
  const pack=resolveStyle(fixture.styleId);
  useStore.setState({...fixture,canvasBackground:pack.canvasBackground,mode:'face',matchMode:true,activeId:null,hoveredId:null,enteredGroupId:null});
  return true;
}
