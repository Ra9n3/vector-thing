import {chromium} from 'playwright';
import {writeFileSync} from 'node:fs';
import {gzipSync} from 'node:zlib';
const browser=await chromium.launch({executablePath:process.env.QA_CHROMIUM_PATH || undefined,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
const context=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'});
const page=await context.newPage();
await page.route('**/node_modules/.vite/deps/zustand.js*',async route=>{
 const response=await route.fetch();let body=await response.text();
 body=body.replace('listeners.add(listener);', 'listeners.add(listener); if (Array.isArray(state?.elements)) window.__qaSubscribers = listeners.size;');
 body=body.replace('return () => listeners.delete(listener);', 'return () => { listeners.delete(listener); if (Array.isArray(state?.elements)) window.__qaSubscribers = listeners.size; };');
 await route.fulfill({response,body});
});
await page.goto('http://127.0.0.1:5173/?fixture=stress');await page.locator('svg[data-view="face"]').waitFor();
await page.evaluate(async()=>{const {useStore,clearHistoryForQA}=await import('/src/store.ts');useStore.setState({elements:[],groups:[],selection:[]});clearHistoryForQA();await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));});
const client=await context.newCDPSession(page);await client.send('Performance.enable');await client.send('HeapProfiler.enable');
const cycle=async()=>page.evaluate(async()=>{const {useStore}=await import('/src/store.ts');for(let i=0;i<100;i++){useStore.getState().placeTemplate('knob',{x:0,y:0});await new Promise(r=>requestAnimationFrame(r));useStore.getState().deleteSelection();await new Promise(r=>requestAnimationFrame(r));}});
const snapshot=async n=>{
 const chunks=[];const capture=event=>chunks.push(event.chunk);client.on('HeapProfiler.addHeapSnapshotChunk',capture);await client.send('HeapProfiler.takeHeapSnapshot',{reportProgress:false});client.off('HeapProfiler.addHeapSnapshotChunk',capture);
 const text=chunks.join('');if(n===100||n===300)writeFileSync(`qa/traces/round3-${n}.heapsnapshot.gz`,gzipSync(text));
 const snap=JSON.parse(text),meta=snap.snapshot.meta,fields=meta.node_fields,step=fields.length;const names=snap.strings,values=snap.nodes;
 const name=fields.indexOf('name'),size=fields.indexOf('self_size'),type=fields.indexOf('type'),detached=fields.indexOf('detachedness');let summary={},detachedCount=0;
 for(let i=0;i<values.length;i+=step){const n=names[values[i+name]],t=meta.node_types[type][values[i+type]],bytes=values[i+size],key=`${t}:${n}`;const item=summary[key]??={count:0,selfSize:0};item.count++;item.selfSize+=bytes;if(detached>=0 && values[i+detached]===2)detachedCount++;}
 return {summary,detachedCount,hasDetachedness:detached>=0};
};
let samples=[],snaps={};for(let n=100;n<=500;n+=100){await cycle();await page.evaluate(async()=>{(await import('/src/store.ts')).clearHistoryForQA();await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));});await client.send('HeapProfiler.collectGarbage');const m=Object.fromEntries((await client.send('Performance.getMetrics')).metrics.map(x=>[x.name,x.value])),dom=await client.send('Memory.getDOMCounters'),subscribers=await page.evaluate(()=>window.__qaSubscribers);if(!subscribers)throw new Error('store subscriber counter not installed');const snap=await snapshot(n);samples.push({cycle:n,heap:m.JSHeapUsedSize,documents:dom.documents,nodes:dom.nodes,listeners:dom.jsEventListeners,subscribers,detached:snap.detachedCount,hasDetachedness:snap.hasDetachedness});if(n===100||n===300)snaps[n]=snap.summary;console.log(JSON.stringify(samples.at(-1)));}
const x=samples.map((_,i)=>i),y=samples.map(s=>s.heap),xm=2,ym=y.reduce((a,b)=>a+b,0)/5,slope=x.reduce((s,v,i)=>s+(v-xm)*(y[i]-ym),0)/x.reduce((s,v)=>s+(v-xm)**2,0);
const diff=Object.entries(snaps[300]).map(([key,v])=>({key,deltaBytes:v.selfSize-(snaps[100][key]?.selfSize??0),deltaCount:v.count-(snaps[100][key]?.count??0)})).sort((a,b)=>b.deltaBytes-a.deltaBytes).slice(0,20);
console.log('slope bytes/100',slope,'top live self-size diff',diff);writeFileSync('qa/memory-round3.json',JSON.stringify({samples,slope,diff},null,2));await browser.close();
