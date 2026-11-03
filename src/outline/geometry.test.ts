import {describe,it,expect} from 'vitest';
import {flattenOutline,outlineHash,outlinePath,OUTLINE_MAX_VERTICES} from './geometry';
import {primitiveOutline,presetOutline} from './presets';
import {addNode,deleteNode,moveNode} from './edit';

describe('outline geometry',()=>{
 it('converts rectangle and hexagon to exact vertices',()=>{expect(flattenOutline(primitiveOutline('rect',100,80).nodes,100,80)).toEqual([{x:0,y:0},{x:100,y:0},{x:100,y:80},{x:0,y:80}]);expect(flattenOutline(primitiveOutline('hexagon',100,86.602540378).nodes,100,86.602540378)).toHaveLength(6);});
 it('converts circles and pills with smooth arc nodes',()=>{for(const type of ['circle','pill'] as const){const d=primitiveOutline(type,100,60);expect(d.nodes.every(n=>n.smooth)).toBe(true);const p=flattenOutline(d.nodes,100,60);expect(p.length).toBeGreaterThan(4);expect(p.every(v=>Number.isFinite(v.x)&&Number.isFinite(v.y))).toBe(true);}});
 it('preserves pill straight edges and its exact circular endcaps',()=>{const p=flattenOutline(primitiveOutline('pill',100,60).nodes,100,60);expect(p[0]).toEqual({x:30,y:0});expect(p[1]).toEqual({x:70,y:0});expect(p.every(q=>q.x>=-1e-8&&q.x<=100+1e-8&&q.y>=-1e-8&&q.y<=60+1e-8)).toBe(true);});
 it('rounds straight corners and flattens bulged arcs',()=>{const r=primitiveOutline('rounded',100,100);expect(flattenOutline(r.nodes,100,100).length).toBeGreaterThan(4);const circle=primitiveOutline('circle',100,100),pts=flattenOutline(circle.nodes,100,100);expect(pts.every(p=>Math.abs(Math.hypot(p.x-50,p.y-50)-50)<1e-6)).toBe(true);});
 it('generates deterministic bounded polygons and stars',()=>{for(const count of [3,6,12]){const a=presetOutline('polygon',count),b=presetOutline('star',count,.4);expect(a.nodes).toHaveLength(count);expect(b.nodes).toHaveLength(count*2);expect(outlineHash(a.nodes)).toBe(outlineHash(presetOutline('polygon',count).nodes));expect(outlinePath(b.nodes,100,100)).toBe(outlinePath(b.nodes,100,100));expect(flattenOutline(b.nodes,100,100).length).toBeLessThanOrEqual(OUTLINE_MAX_VERTICES);}});
 it('adds/deletes nodes and keeps the three-node minimum',()=>{const nodes=presetOutline('triangle').nodes,added=addNode(nodes,0,.75,.5);expect(added).toHaveLength(4);expect(deleteNode(added,1)).toHaveLength(3);expect(deleteNode(nodes,1)).toBe(nodes);});
 it('moves mirrored node pairs',()=>{const nodes=primitiveOutline('rect',100,100).nodes,out=moveNode(nodes,0,.2,.1,true,true);expect(out.map(n=>[n.x,n.y])).toEqual([[.2,.1],[.8,.1],[.8,.9],[.2,.9]]);});
 it('never returns more than 2000 vertices',()=>{const circle=primitiveOutline('circle',10000,10000);expect(flattenOutline(circle.nodes,10000,10000,.000001).length).toBeLessThanOrEqual(2000);});
});
