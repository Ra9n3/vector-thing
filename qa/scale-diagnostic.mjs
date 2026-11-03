import {webkit} from 'playwright';
import {utils} from 'playwright-core/lib/coreBundle';
import {spawn} from 'node:child_process';
import {readFileSync,writeFileSync} from 'node:fs';
const server=spawn('npm',['run','dev','--','--host','0.0.0.0','--port','5174','--strictPort'],{stdio:['ignore','pipe','pipe'],detached:true});
try{
 await new Promise((resolve,reject)=>{let log='';const timer=setTimeout(()=>reject(Error(log)),30000);server.stdout.on('data',chunk=>{log+=chunk;if(log.includes('ready in')){clearTimeout(timer);resolve();}});server.stderr.on('data',chunk=>log+=chunk);server.once('exit',()=>{clearTimeout(timer);reject(Error(log));});});
 const browser=await webkit.launch(),results=[];
 for(const dpr of [1,2]){const context=await browser.newContext({viewport:{width:1440,height:900},deviceScaleFactor:dpr,reducedMotion:'reduce'});const page=await context.newPage();
  for(const fixture of ['glass-glow','neumorphic-panel'])for(const zoom of [.25,1,4]){
   await page.goto(`http://127.0.0.1:5174/?fixture=${fixture}`);await page.locator('svg[data-view="face"]').waitFor();await page.evaluate(async zoom=>{const {useViewport}=await import('/src/canvas/useViewport.ts');const v=useViewport.getState();v.zoomAt(v.width/2,v.height/2,zoom);},zoom);await page.waitForTimeout(1200);
   const expected=readFileSync(`qa/snapshots/${fixture}-zoom${zoom}-dpr${dpr}.png`);
   for(const factor of new Set([1,zoom,zoom*dpr])){
    await page.evaluate(factor=>{for(const light of document.querySelectorAll('feDiffuseLighting,feSpecularLighting')){const original=light.getAttribute('data-qa-scale')??light.getAttribute('surfaceScale');if(original===null)continue;light.setAttribute('data-qa-scale',original);light.setAttribute('surfaceScale',String(Number(original)*factor));}},factor);await page.waitForTimeout(500);
    const actual=await page.locator('main').screenshot({scale:'css',animations:'disabled'});const diff=utils.getComparator('image/png')(actual,expected,{maxDiffPixels:0});results.push({fixture,zoom,dpr,factor,diff:diff?.errorMessage??'0 pixels'});
   }
  }await context.close();
 }
 await browser.close();writeFileSync('/tmp/qa-scale.json',JSON.stringify(results,null,2));
}finally{process.kill(-server.pid,'SIGTERM');}
