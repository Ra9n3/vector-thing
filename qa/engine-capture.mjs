import {chromium,firefox,webkit} from 'playwright';
import {spawn} from 'node:child_process';
import {writeFileSync} from 'node:fs';
const engine=process.argv[2];if(!['chromium','firefox','webkit'].includes(engine))throw Error('browser');
const server=spawn('npm',['run','dev','--','--host','0.0.0.0','--port','5174','--strictPort'],{stdio:['ignore','pipe','pipe'],detached:true});
try{
 await new Promise((resolve,reject)=>{let log='';const timer=setTimeout(()=>reject(Error(log)),30000);server.stdout.on('data',chunk=>{log+=chunk;if(log.includes('ready in')){clearTimeout(timer);resolve();}});server.stderr.on('data',chunk=>log+=chunk);server.once('exit',()=>{clearTimeout(timer);reject(Error(log));});});
 const browser=await {chromium,firefox,webkit}[engine].launch(engine==='chromium'&&process.env.QA_CHROMIUM_PATH?{executablePath:process.env.QA_CHROMIUM_PATH,args:['--no-sandbox','--disable-gpu']}:{ });
 const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});const captures=[];
 for(const [fixture,zoom] of [['shape-grid',1],['glass-glow',4],['neumorphic-panel',4]]){
  await page.goto(`http://127.0.0.1:5174/?fixture=${fixture}`);await page.locator('svg[data-view="face"]').waitFor();
  await page.evaluate(async zoom=>{const {useViewport}=await import('/src/canvas/useViewport.ts');const s=useViewport.getState();s.zoomAt(s.width/2,s.height/2,zoom);},zoom);await page.waitForTimeout(1200);
  for(const variant of (zoom===4 ? ['reference','embedded','scale2','scale4'] : ['reference','embedded'])) {
   if(variant==='embedded') {
    await page.evaluate(()=>{for(const image of document.querySelectorAll('feImage')){const href=image.getAttribute('href');if(!href?.startsWith('#'))continue;const map=document.getElementById(href.slice(1));if(!map)continue;const width=image.getAttribute('width'),height=image.getAttribute('height');const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${map.outerHTML}</svg>`;image.setAttribute('href',`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`);}});
    await page.waitForTimeout(1000);
   }
   if(variant==='scale2'||variant==='scale4') {
    const factor=variant==='scale2'?2:4;
    await page.evaluate(factor=>{for(const light of document.querySelectorAll('feDiffuseLighting,feSpecularLighting')){const original=light.getAttribute('data-qa-scale')??light.getAttribute('surfaceScale');if(original===null)continue;light.setAttribute('data-qa-scale',original);light.setAttribute('surfaceScale',String(Number(original)*factor));}},factor);
    await page.waitForTimeout(1000);
   }
   const png=await page.locator('main').screenshot();
   const jpeg=await page.evaluate(async image=>{const im=new Image();im.src=`data:image/png;base64,${image}`;await im.decode();const canvas=document.createElement('canvas');const scale=Math.min(1,640/im.width);canvas.width=Math.round(im.width*scale);canvas.height=Math.round(im.height*scale);canvas.getContext('2d').drawImage(im,0,0,canvas.width,canvas.height);return canvas.toDataURL('image/jpeg',.45).split(',')[1];},png.toString('base64'));
   captures.push({fixture,zoom,variant,jpeg});
  }
 }
 writeFileSync('/tmp/qa-engine.json',JSON.stringify({engine,captures}));await browser.close();
} finally {process.kill(-server.pid,'SIGTERM');}
