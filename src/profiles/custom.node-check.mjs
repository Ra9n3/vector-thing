import {test} from 'node:test';
import assert from 'node:assert/strict';
import {monotoneStroke,simplifyStroke,customSampler,customLookup,lookupHash} from './custom.ts';
test('stroke clamps, removes backward motion, preserves endpoints, simplifies to 12',()=>{
 const input=Array.from({length:100},(_,i)=>({x:i/99,y:0.5+0.4*Math.sin(i)}));input.splice(60,0,{x:-1,y:4});const p=simplifyStroke(input);
 assert.ok(p.length<=12&&p.length>=2);assert.equal(p[0].x,0);assert.equal(p.at(-1).x,1);assert.ok(p.every((v,i)=>v.y>=0&&v.y<=1&&(!i||v.x>p[i-1].x)));assert.equal(monotoneStroke([{x:.5,y:2}])[0].y,1);
});
test('interpolation stays inside each monotone segment and clamps heights',()=>{
 const pts=[{x:0,y:-1},{x:.2,y:.8},{x:.6,y:.3},{x:1,y:2}], f=customSampler(pts,1);for(let i=0;i<=1000;i++){const x=i/1000,y=f(x);const [lo,hi]=x<=.2?[0,.8]:x<=.6?[.3,.8]:[.3,1];assert.ok(y>=lo-1e-9&&y<=hi+1e-9);}
});
test('lookup is deterministic and mirror applies only to across',()=>{
 const p={points:[{x:0,y:0},{x:.5,y:1},{x:1,y:.2}],mirror:true,smooth:.5},a=customLookup(p,'across');assert.equal(a.length,64);assert.deepEqual(a,[...a].reverse());assert.deepEqual(a,customLookup(p,'across'));assert.equal(lookupHash(a),lookupHash(customLookup(p,'across')));assert.notDeepEqual(customLookup(p,'around'),a);assert.notDeepEqual(customLookup({...p,mirror:false},'across'),a);
});
test('random monotone intervals do not overshoot for any smoothing',()=>{let seed=1234567;const random=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);for(let c=0;c<100;c++){const p=Array.from({length:8},(_,i)=>({x:i/7,y:random()}));for(const smooth of [0,.5,1]){const f=customSampler(p,smooth);for(let i=0;i<7;i++)for(let j=0;j<=20;j++){const y=f((i+j/20)/7),a=p[i].y,b=p[i+1].y;assert.ok(y>=Math.min(a,b)-1e-9&&y<=Math.max(a,b)+1e-9);}}}});
