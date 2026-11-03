import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
const browser = await chromium.launch({executablePath:process.env.QA_CHROMIUM_PATH || undefined,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
const context = await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'});
const page = await context.newPage();
const client = await context.newCDPSession(page);
async function trace(fixture,operation){
 await client.send('Tracing.start',{categories:'devtools.timeline,disabled-by-default-devtools.timeline,blink.user_timing,v8.execute',transferMode:'ReturnAsStream'});
 const timing=await page.evaluate(async op=>{
  const {useStore}=await import('/src/store.ts');const s=useStore.getState();const start=performance.now();
  if(op==='style')s.setStyle('soft-clay');
  if(op==='state')s.setElementState('pressed');
  if(op==='look')s.setLook('strong');
  let stages;
  if(op==='png') {
   const {resolveStyle}=await import('/src/styles/catalog.ts'),{exportScene}=await import('/src/export/scene.ts'),{buildSvg}=await import('/src/export/buildSvg.tsx');
   const current=useStore.getState(),v=exportScene({elements:current.elements,groups:current.groups,selection:[],scope:'all',states:'current',look:current.look,direction:current.direction,pack:resolveStyle(current.styleId),background:false})[0];
   let t=performance.now();const svg=buildSvg(v);const build=performance.now()-t;
   const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));const img=new Image();t=performance.now();img.src=url;await img.decode();const decode=performance.now()-t;
   const canvas=document.createElement('canvas');canvas.width=Math.ceil(v.bounds.w*3);canvas.height=Math.ceil(v.bounds.h*3);t=performance.now();canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);const draw=performance.now()-t;
   t=performance.now();await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('encode')),'image/png'));const encode=performance.now()-t;URL.revokeObjectURL(url);stages={build,decode,draw,encode};
  } else await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
  return {total:performance.now()-start,stages};
 },operation);
 const completed=new Promise(resolve=>client.once('Tracing.tracingComplete',resolve));await client.send('Tracing.end');const {stream}=await completed;let chunks=[];while(true){const r=await client.send('IO.read',{handle:stream});chunks.push(r.base64Encoded?Buffer.from(r.data,'base64'):Buffer.from(r.data));if(r.eof)break;}await client.send('IO.close',{handle:stream});const raw=Buffer.concat(chunks);writeFileSync(`qa/traces/${fixture}-${operation}.json.gz`,gzipSync(raw));
 const events=JSON.parse(raw.toString()).traceEvents;const main=new Set(events.filter(e=>e.ph==='M'&&e.name==='thread_name'&&e.args?.name==='CrRendererMain').map(e=>`${e.pid}:${e.tid}`));
 const scripts=/^(FunctionCall|EvaluateScript|RunMicrotasks|TimerFire|EventDispatch|FireAnimationFrame|v8\.execute|CompileScript|ParseScript)$/;
 const rendering=/^(UpdateLayoutTree|RecalculateStyles|Layout|PrePaint|UpdateLayerTree|Layerize)$/;
 const paint=/^(Paint|PaintImage|RasterTask|CompositeLayers)$/;
 let totals={scripting:0,rendering:0,paint:0};
 const perThread=new Map();for(const e of events){if(e.ph!=='X'||!e.dur||!main.has(`${e.pid}:${e.tid}`))continue;const key=`${e.pid}:${e.tid}`;if(!perThread.has(key))perThread.set(key,[]);perThread.get(key).push(e);}
 for(const items of perThread.values()){items.sort((a,b)=>a.ts-b.ts||b.dur-a.dur);
 const ordered=items;for(let i=0;i<ordered.length;i++){const e=ordered[i];let end=e.ts+e.dur,covered=0,last=e.ts;for(let j=i+1;j<ordered.length&&ordered[j].ts<end;j++){const c=ordered[j];if(c.ts<last)continue;const cend=Math.min(end,c.ts+c.dur);covered+=Math.max(0,cend-c.ts);last=cend;}const own=Math.max(0,e.dur-covered)/1000;if(scripts.test(e.name))totals.scripting+=own;else if(rendering.test(e.name))totals.rendering+=own;else if(paint.test(e.name))totals.paint+=own;}
 }
 console.log(JSON.stringify({fixture,operation,timing,mainThreadMs:totals}));
}
for(const fixture of ['medium','stress']){await page.goto(`http://127.0.0.1:5173/?fixture=${fixture}`);await page.locator('svg[data-view="face"]').waitFor();await page.waitForTimeout(1500);for(const op of ['style','state','look','png'])await trace(fixture,op);}
await browser.close();
