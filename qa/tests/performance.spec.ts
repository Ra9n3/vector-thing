import { test,expect } from '@playwright/test';
for (const [fixture,multiplier] of [['medium',1],['stress',2.5]] as const) test(`@performance ${fixture} export`,async({page,browserName})=>{
 test.skip(browserName!=='chromium');await page.goto(`/?fixture=${fixture}`);await expect(page.locator('svg[data-view="face"]')).toBeVisible();await page.waitForTimeout(1800);
 const times=await page.evaluate(async()=>{
  const {useStore}=await import('/src/store.ts'),{resolveStyle}=await import('/src/styles/catalog.ts'),{exportScene}=await import('/src/export/scene.ts'),{buildSvg}=await import('/src/export/buildSvg.tsx'),{rasterizePng}=await import('/src/export/png.ts');
  const step=async(run:()=>void)=>{const t=performance.now();run();await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));return performance.now()-t;};
  const s=useStore.getState(),count=s.elements.length,style=await step(()=>s.setStyle('soft-clay')),state=await step(()=>s.setElementState('pressed')),look=await step(()=>s.setLook('strong'));
  const now=useStore.getState(),v=exportScene({elements:now.elements,groups:now.groups,selection:[],scope:'all',states:'current',look:now.look,direction:now.direction,pack:resolveStyle(now.styleId),background:false})[0];
  let t=performance.now();buildSvg(v);const svg=performance.now()-t;t=performance.now();await rasterizePng(buildSvg(v),v.bounds,3);const png=performance.now()-t;return {count,style,state,look,svg,png};
 });console.log(fixture,'performance ms',times);expect(times.count).toBe(fixture==='medium'?20:60);
expect.soft(times.svg).toBeLessThan(500*multiplier);expect.soft(times.png).toBeLessThan(2000*multiplier);
});

test('@performance place/delete memory and defs',async({page,browserName})=>{
 test.skip(browserName!=='chromium');test.setTimeout(480000);
 await page.route('**/node_modules/.vite/deps/zustand.js*',async route=>{
  const response=await route.fetch();let body=await response.text();
  body=body.replace('listeners.add(listener);','listeners.add(listener); if (Array.isArray(state?.elements)) window.__qaSubscribers = listeners.size;');
  body=body.replace('return () => listeners.delete(listener);','return () => { listeners.delete(listener); if (Array.isArray(state?.elements)) window.__qaSubscribers = listeners.size; };');
  await route.fulfill({response,body});
 });
 await page.goto('/?fixture=stress');await expect(page.locator('svg[data-view="face"]')).toBeVisible();
 await page.evaluate(async()=>{const {useStore,clearHistoryForQA}=await import('/src/store.ts');(globalThis as typeof globalThis & {__qaDefsSizes?:number[]}).__qaDefsSizes=[];useStore.setState({elements:[],groups:[],selection:[]});clearHistoryForQA();await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));});
 const count=()=>page.locator('svg[data-view="face"] defs [id]').count();const baseline=await count();const cacheBaseline=await page.evaluate(()=>(globalThis as typeof globalThis & {__qaDefsSizes?:number[]}).__qaDefsSizes);
 const client=await page.context().newCDPSession(page);await client.send('Performance.enable');await client.send('HeapProfiler.enable');
 const cycle=async()=>page.evaluate(async()=>{const {useStore}=await import('/src/store.ts');for(let i=0;i<100;i++){
  useStore.getState().placeTemplate('knob',{x:0,y:0});await new Promise(r=>requestAnimationFrame(r));
  useStore.getState().deleteSelection();await new Promise(r=>requestAnimationFrame(r));
 }});
 const detached=async()=>{const chunks:string[]=[];const receive=(event:{chunk:string})=>chunks.push(event.chunk);client.on('HeapProfiler.addHeapSnapshotChunk',receive);await client.send('HeapProfiler.takeHeapSnapshot',{reportProgress:false});client.off('HeapProfiler.addHeapSnapshotChunk',receive);const snap=JSON.parse(chunks.join('')),fields:string[]=snap.snapshot.meta.node_fields,index=fields.indexOf('detachedness');if(index<0)throw new Error('heap snapshot has no detachedness field');let total=0;for(let i=index;i<snap.nodes.length;i+=fields.length)if(snap.nodes[i]===2)total++;return total;};
 const samples:{heap:number;listeners:number;subscribers:number;detached:number}[]=[];for(let i=0;i<5;i++){await cycle();await page.evaluate(async()=>{(await import('/src/store.ts')).clearHistoryForQA();await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));});await client.send('HeapProfiler.collectGarbage');const {metrics}=await client.send('Performance.getMetrics'),dom=await client.send('Memory.getDOMCounters');const subscribers=await page.evaluate(()=>(window as unknown as {__qaSubscribers:number}).__qaSubscribers);samples.push({heap:metrics.find(x=>x.name==='JSHeapUsedSize')!.value,listeners:dom.jsEventListeners,subscribers,detached:await detached()});}
 const defs=await count(),cache=await page.evaluate(()=>(globalThis as typeof globalThis & {__qaDefsSizes?:number[]}).__qaDefsSizes);const mean=samples.reduce((a,b)=>a+b.heap,0)/5,slope=samples.reduce((a,b,i)=>a+(i-2)*(b.heap-mean),0)/10;console.log('memory',samples,{slope,baseline,defs,cacheBaseline,cache});
 expect.soft(defs).toBe(baseline);expect.soft(cache).toEqual(cacheBaseline);expect.soft(samples[0].subscribers).toBeGreaterThan(0);for(const field of ['listeners','subscribers','detached'] as const)expect.soft(new Set(samples.map(s=>s[field])).size,field).toBe(1);expect.soft(slope).toBeLessThan(100*1024);
});
