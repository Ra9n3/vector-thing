import {test,expect} from '@playwright/test';
import type {Page} from '@playwright/test';
async function instrument(page:Page){
 for(const file of ['Canvas','LibraryPanel','DirectionPad','PropertiesPanel'])await page.route(`**/src/components/${file}.tsx`,async route=>{
  const response=await route.fetch();let body=await response.text();
  const react=(await (await page.request.get('http://127.0.0.1:5173/src/components/Canvas.tsx')).text()).match(/\/node_modules\/\.vite\/deps\/react\.js\?v=[^"\s]+/)![0];
  body+=`\nimport QAReact from ${JSON.stringify(react)};\n`;
  if(file==='Canvas')body=body.replace('const frames = useStateAnimation(elements, style, version, instantVersion);',`const frames = useStateAnimation(elements, style, version, instantVersion); QAReact.useLayoutEffect(()=>window.__qaCommit?.('canvas',{style:style.id,look,direction,steps:[...frames.values()].map(f=>({press:f.press,offset:f.offset}))}));`);
  if(file==='LibraryPanel')body=body.replace('const previewStyle = resolveStyle(usePreviewValue(styleId)), previewLook = usePreviewValue(look), previewDirection = usePreviewValue(direction);',`const previewStyle = resolveStyle(usePreviewValue(styleId)), previewLook = usePreviewValue(look), previewDirection = usePreviewValue(direction); QAReact.useLayoutEffect(()=>window.__qaCommit?.('library',{style:previewStyle.id,look:previewLook,direction:previewDirection}));`);
  if(file==='DirectionPad')body=body.replace('const previewLook = usePreviewValue(look);',`const previewLook = usePreviewValue(look); QAReact.useLayoutEffect(()=>window.__qaCommit?.('pad',{style:previewStyle.id,look:previewLook}));`);
  if(file==='PropertiesPanel')body=body.replace('export function PropertiesPanel() {',`export function PropertiesPanel() { QAReact.useLayoutEffect(()=>window.__qaCommit?.('properties',{}));`);
  await route.fulfill({response,body});
 });
}
for(const [fixture,scale] of [['medium',1],['stress',2.5]] as const)for(const op of ['style','look','state'] as const){
 test(`@settled ${fixture} ${op}`,async({browser,browserName})=>{
  test.skip(browserName!=='chromium');const context=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'no-preference'});const page=await context.newPage();await instrument(page);
  await page.goto(`http://127.0.0.1:5173/?fixture=${fixture}`);await expect(page.locator('svg[data-view="face"]')).toBeVisible();await page.waitForTimeout(1800);
  const result=await page.evaluate(async(op)=>{
   const {useStore}=await import('/src/store.ts');const initial=useStore.getState();let start=performance.now(),canvas=-1,full=-1,firstStep=-1,lastStep=-1,firstCommit=-1,endCommit=-1,activeStep=false,scheduled=false,expected:{style:string;look:string;direction:string};const observed=new Set<string>();
   const nextPaint=(cb:()=>void)=>requestAnimationFrame(()=>requestAnimationFrame(cb));
   (window as unknown as {__qaCommit:(id:string,details:any)=>void}).__qaCommit=(id,details)=>{
    if(!expected)return;const match=(!details.style||details.style===expected.style)&&(!details.look||details.look===expected.look)&&(!details.direction||details.direction===expected.direction);
    if(!match)return;
    if(id==='canvas'){
     if(op==='state'){activeStep=details.steps.some((f:{press:number;offset:{x:number;y:number}})=>f.press>0||f.offset.x||f.offset.y);if(activeStep){lastStep=performance.now()-start;if(firstCommit<0)firstCommit=lastStep;if(firstStep<0&&!scheduled){scheduled=true;requestAnimationFrame(()=>{if(activeStep)requestAnimationFrame(()=>{if(firstStep<0)firstStep=performance.now()-start});else scheduled=false;});}}else if(firstCommit>=0&&endCommit<0)endCommit=performance.now()-start;}
     else if(canvas<0)nextPaint(()=>{if(canvas<0)canvas=performance.now()-start});
    }
    if(id!=='canvas')observed.add(id);
    if(op!=='state'&&observed.size===3&&full<0)nextPaint(()=>{if(full<0)full=performance.now()-start});
   };
   start=performance.now();if(op==='style')initial.setStyle('soft-clay');else if(op==='look')initial.setLook('strong');else initial.setElementState('pressed');
   const s=useStore.getState();expected={style:s.styleId,look:s.look,direction:s.direction};
   if(op==='look')observed.add('properties');
   await new Promise<void>((resolve,reject)=>{let deadline=performance.now()+10000;const check=()=>{if(op==='state'?firstStep>=0:canvas>=0&&full>=0){if(op==='state')setTimeout(resolve,250);else resolve();}else if(performance.now()>deadline)reject(new Error(`missing painted step or commit ${op}: ${[...observed]} canvas ${canvas}`));else setTimeout(check,10)};check()});
   delete (window as unknown as {__qaCommit?:unknown}).__qaCommit;
   return {count:initial.elements.length,canvas,full,firstStep,lastStep,animation:firstCommit>=0&&endCommit>=0?endCommit-firstCommit:null};
  },op);
  console.log(fixture,op,result);await context.close();expect(result.count).toBe(fixture==='medium'?20:60);
  if(op==='state')expect(result.firstStep).toBeLessThan(100*scale);else{expect.soft(result.canvas).toBeLessThan(100*scale);expect.soft(result.full).toBeLessThan(250*(fixture==='medium'?1:2));}
 });
}
