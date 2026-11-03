import {describe,it,expect} from 'vitest';
import {detachCopies,generateCopies,normalizeRepeat} from './repeat';
const part={id:'part',x:0,y:0,width:10,height:10,props:{profile:'dome',material:'steel'}};
describe('repeat geometry',()=>{
 it('generates linear offsets without duplicating source properties',()=>{const copies=generateCopies({id:'r',sourceId:'part',mode:'linear',count:3,dx:7,dy:2},[part]);expect(copies.map(p=>[p.x,p.y])).toEqual([[0,0],[7,2],[14,4]]);expect(copies.every(p=>p.props===part.props)).toBe(true);});
 it('uses 360/N and includes the end of a partial sweep',()=>{const r={id:'r',sourceId:'part',mode:'radial' as const,count:4,radius:10,start:0,sweep:360};const copies=generateCopies(r,[part]);expect(copies.map(p=>[Math.round(p.x),Math.round(p.y)])).toEqual([[10,0],[0,10],[-10,0],[0,-10]]);expect(generateCopies({...r,count:3,sweep:90},[part])[2].y).toBeCloseTo(10);});
 it('limits counts and detaches independent copies',()=>{expect(normalizeRepeat({id:'r',sourceId:'part',mode:'linear',count:99,dx:1,dy:0}).count).toBe(20);const copies=generateCopies({id:'r',sourceId:'part',mode:'linear',count:2,dx:1,dy:0},[part]);let id=0;const detached=detachCopies(copies,'group',()=>String(id++));expect(detached[0].props).not.toBe(part.props);expect(detached[0].props).not.toBe(detached[1].props);});
});
