import {describe,it,expect} from 'vitest';
import {booleanOp,containsPoint,polygonArea,preparePolygons} from './polygon';
import {flattenCircle} from './flatten';
import type {Polygon} from './polygon';
const rect=(x:number,y:number,w:number,h:number):Polygon[]=>[[[{x,y},{x:x+w,y},{x:x+w,y:y+h},{x,y:y+h}]]];
describe('polygon booleans',()=>{
 it('handles union, subtraction, and intersection',()=>{const a=rect(0,0,10,10),b=rect(5,5,10,10);expect(polygonArea(booleanOp(a,b,'union'))).toBe(175);expect(polygonArea(booleanOp(a,b,'subtract'))).toBe(75);expect(polygonArea(booleanOp(a,b,'intersect'))).toBe(25);});
 it('keeps holes and handles empty differences',()=>{const outer:Polygon[]=[[flattenCircle(0,0,100)]],inner:Polygon[]=[[flattenCircle(0,0,50)]],annulus=booleanOp(outer,inner,'subtract');expect(annulus[0]).toHaveLength(2);expect(Math.abs(polygonArea(annulus)/(Math.PI*7500)-1)).toBeLessThan(.005);expect(containsPoint(annulus,{x:0,y:0})).toBe(false);expect(booleanOp(outer,outer,'subtract')).toEqual([]);});
 it('caps vertices deterministically',()=>{const ring=Array.from({length:4000},(_,i)=>({x:100*Math.cos(2*Math.PI*i/4000),y:100*Math.sin(2*Math.PI*i/4000)})),out=preparePolygons([[ring]]);expect(out.flat().reduce((n,r)=>n+r.length,0)).toBeLessThanOrEqual(2000);expect(preparePolygons([[ring]])).toEqual(out);});
});
