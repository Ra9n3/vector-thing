import {chromium} from 'playwright';
import fs from 'node:fs';
const moduleText=await (await fetch('http://127.0.0.1:5173/src/components/Canvas.tsx')).text();
const reactModule=moduleText.match(/\/node_modules\/\.vite\/deps\/react\.js\?v=[^"\s]+/)[0];
const browser=await chromium.launch({executablePath:process.env.QA_CHROMIUM_PATH,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
const metrics=async c=>Object.fromEntries((await c.send('Performance.getMetrics')).metrics.map(m=>[m.name,m.value]));
const median=xs=>xs.sort((a,b)=>a-b)[Math.floor(xs.length/2)];
async function setup(mode,prof=false){
 const context=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'});const page=await context.newPage();
 for(const path of ['App','components/PropertiesPanel','components/Canvas','components/LibraryPanel'])await page.route(`**/src/${path}.tsx`,async route=>{
  const response=await route.fetch();let body=await response.text();
  if(path==='App' && (mode==='library'||mode==='both'))body=body.replace('jsxDEV(LibraryPanel,','jsxDEV(() => null,');
  if(path==='components/PropertiesPanel' && (mode==='pad'||mode==='both'))body=body.replace('jsxDEV(DirectionPad,','jsxDEV(() => null,');
  if(prof){const pairs=path==='App'?[['Canvas','Canvas'],['LibraryPanel','LibraryPanel'],['PropertiesPanel','PropertiesPanel']]:path==='components/PropertiesPanel'?[['DirectionPad','DirectionPad']]:path==='components/Canvas'?[['ElementView','ElementView']]:[['TemplateTile','TemplateTile']];
   let wraps='';for(const [name,id] of pairs){body=body.replaceAll(`jsxDEV(${name},`,`jsxDEV(QA_${name},`);wraps+=`\nconst QA_${name} = p => QAR.createElement(QAR.Profiler,{id:${JSON.stringify(id)},onRender:(id,phase,actualDuration,baseDuration,startTime,commitTime)=>{(window.__qaCommits ||= []).push({id,phase,actualDuration,baseDuration,startTime,commitTime})}},QAR.createElement(${name},p));`;}
   body+=`\nimport QAR from ${JSON.stringify(reactModule)};`+wraps+'\n';
  }
  await route.fulfill({response,body});
 });
 await page.goto('http://127.0.0.1:5173/?fixture=medium');await page.locator('svg[data-view="face"]').waitFor();await page.waitForTimeout(1200);const c=await context.newCDPSession(page);await c.send('Performance.enable');return {context,page,c};
}
let results=[];
for(const mode of ['normal','library','pad','both'])for(const op of ['style','look']){let runs=[];for(let i=0;i<5;i++){const {context,page,c}=await setup(mode);const before=await metrics(c);const wall=await page.evaluate(async op=>{const s=(await import('/src/store.ts')).useStore.getState();if(s.elements.length!==20)throw Error('bad fixture');const t=performance.now();op==='style'?s.setStyle('soft-clay'):s.setLook('strong');await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));return performance.now()-t},op);const after=await metrics(c);runs.push({scripting:(after.ScriptDuration-before.ScriptDuration)*1000,wall});await context.close();}results.push({mode,op,scriptingMedian:median(runs.map(x=>x.scripting)),wallMedian:median(runs.map(x=>x.wall)),runs});console.log(JSON.stringify(results.at(-1)));}
const {context,page,c}=await setup('normal',true);await c.send('Profiler.enable');await c.send('Profiler.setSamplingInterval',{interval:100});await page.evaluate(()=>{window.__qaCommits=[]});await c.send('Profiler.start');await page.evaluate(async()=>{const s=(await import('/src/store.ts')).useStore.getState();if(s.elements.length!==20)throw Error('bad fixture');s.setStyle('soft-clay');await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))});const {profile}=await c.send('Profiler.stop');const commits=await page.evaluate(()=>window.__qaCommits);const nodes=new Map(profile.nodes.map(n=>[n.id,n]));const sums=new Map();profile.samples.forEach((id,i)=>{const f=nodes.get(id).callFrame;const key=`${f.functionName || '(anonymous)'}|${f.url}|${f.lineNumber+1}`;sums.set(key,(sums.get(key)||0)+profile.timeDeltas[i]/1000);});const top=[...sums].sort((a,b)=>b[1]-a[1]).slice(0,15);console.log('FUNCTIONS',JSON.stringify(top));console.log('COMMITS',JSON.stringify(commits));fs.writeFileSync('/tmp/qa-round3-experiment.json',JSON.stringify({results,top,commits,profile},null,2));await context.close();await browser.close();
