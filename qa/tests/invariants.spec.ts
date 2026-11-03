import { test,expect } from '@playwright/test';
const fixtures=['ssl-strip','shape-grid','toggles','neumorphic-panel','stress','glass-glow','medium'];
for(const fixture of fixtures) test(`@invariant ${fixture}`,async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`/?fixture=${fixture}`);await expect(page.locator('svg[data-view="face"]')).toBeVisible();
  await page.waitForTimeout(1000);
  const result=await page.evaluate(async()=>{
    const {useStore}=await import('/src/store.ts');const {useViewport}=await import('/src/canvas/useViewport.ts');
    const {displayedElement}=await import('/src/render/stack.ts');const {visualElement}=await import('/src/states/visual.ts');
    const {effectSpec}=await import('/src/render/effectSpec.ts');const {resolveStyle}=await import('/src/styles/catalog.ts');
    const st=useStore.getState(),pack=resolveStyle(st.styleId),ids=[...document.querySelectorAll('[id]')].map(e=>e.id);
    const duplicates=ids.filter((id,i)=>ids.indexOf(id)!==i);
    const bad:string[]=[];for(const node of document.querySelectorAll('svg path,svg linearGradient,svg radialGradient,svg filter,svg feDiffuseLighting,svg feSpecularLighting'))for(const a of node.attributes)if(/NaN|undefined|Infinity/.test(a.value))bad.push(`${node.tagName}.${a.name}=${a.value}`);
    const hullErrors:string[]=[];
    for(const el of st.elements){const element=document.querySelector(`svg[data-view="face"] [data-el="${el.id}"]`)!;
      const hit=element?.querySelector(':scope > path[fill="transparent"]');
      const visual=visualElement(el,pack,st.canvasBackground),spec=effectSpec({type:el.type,width:el.width,height:el.height,profile:visual.element.props.profile,material:visual.material,look:st.look,direction:st.direction,style:pack,press:visual.frame.press,state:visual.frame.state});
      if(!hit||hit.getAttribute('d')!==spec.hitPath)hullErrors.push(el.id);
      const shown=displayedElement(el,st.elements,st.look,st.direction,{pack});
      if(element?.getAttribute('transform')!==`translate(${shown.x} ${shown.y})`)hullErrors.push(`${el.id}:position`);
    }
    const selected=st.elements[0];st.setSelection([selected.id]);
    await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
    const box=document.querySelector('svg[data-view="face"] [data-handle="se"]')?.parentElement?.querySelector('rect');
    const shown=displayedElement(selected,st.elements,st.look,st.direction,{pack}),vp=useViewport.getState();
    const expected={x:vp.panX+shown.x*vp.zoom,y:vp.panY+shown.y*vp.zoom,w:selected.width*vp.zoom,h:selected.height*vp.zoom};
    return {count:st.elements.length,duplicates,bad,hullErrors,expected,box:box?{x:Number(box.getAttribute('x')),y:Number(box.getAttribute('y')),w:Number(box.getAttribute('width')),h:Number(box.getAttribute('height'))}:null};
  });
  expect(errors).toEqual([]);expect(result.count).toBeGreaterThan(0);expect(result.duplicates).toEqual([]);expect(result.bad).toEqual([]);expect(result.hullErrors).toEqual([]);
  expect(result.box).not.toBeNull();for(const k of ['x','y','w','h'] as const)expect(result.box![k]).toBeCloseTo(result.expected[k],2);
});

for(const fixture of ['ssl-strip','toggles'])test(`@stack ${fixture} all directions and states`,async({page})=>{
 await page.goto(`/?fixture=${fixture}`);await expect(page.locator('svg[data-view="face"]')).toBeVisible();
 const result=await page.evaluate(async()=>{
  const {useStore}=await import('/src/store.ts'),{resolveStyle}=await import('/src/styles/catalog.ts'),{displayedElement,stackOffset}=await import('/src/render/stack.ts'),{visualElement}=await import('/src/states/visual.ts'),{effectSpec}=await import('/src/render/effectSpec.ts');
  const st=useStore.getState(),pack=resolveStyle(st.styleId),failures:string[]=[];
  for(const state of ['default','pressed','disabled'] as const)for(const look of ['slight','strong'] as const)for(const direction of ['n','ne','e','se','s','sw','w','nw'] as const){
   const all=st.elements.map(e=>({...e,state}));for(const e of all.filter(x=>x.sitsOn)){
    const base=all.find(x=>x.id===e.sitsOn)!;const parent=displayedElement(base,all,look,direction,{pack}),child=displayedElement(e,all,look,direction,{pack}),vis=visualElement(base,pack,pack.canvasBackground);
    const cap=effectSpec({type:base.type,width:base.width,height:base.height,profile:vis.element.props.profile,material:vis.material,look,direction,style:pack,press:vis.frame.press,state:vis.frame.state}).capOffset;
    const baseOffset=stackOffset(base,all,look,direction,{pack}),childOffset=stackOffset(e,all,look,direction,{pack}),move=vis.frame.offset;
    if(!Number.isFinite(child.x+child.y)||Math.abs((childOffset.x-baseOffset.x)-cap.x-move.x)>1e-6||Math.abs((childOffset.y-baseOffset.y)-cap.y-move.y)>1e-6||!Number.isFinite(parent.x+parent.y))failures.push(`${state}/${look}/${direction}/${e.id}`);
   }
  }return failures;
 });expect(result).toEqual([]);
});

test('@render pressed updates only pressable elements without overrides',async({page})=>{
 await page.goto('/?fixture=medium');await expect(page.locator('svg[data-view="face"]')).toBeVisible();
 const result=await page.evaluate(async()=>{
  const {useStore}=await import('/src/store.ts');const before=useStore.getState().elements;
  const root=globalThis as typeof globalThis & {__qaRenderCounts?:Record<string,number>};root.__qaRenderCounts={};
  useStore.getState().setElementState('pressed');await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
  const rendered=Object.keys(root.__qaRenderCounts);delete root.__qaRenderCounts;
  return {rendered,expected:before.filter(e=>e.pressable!==false).map(e=>e.id),count:before.length};
 });expect(result.count).toBe(20);expect(result.rendered.sort()).toEqual(result.expected.sort());
});

test('@render animation leaves static parts untouched',async({browser})=>{
 const context=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'no-preference'});const page=await context.newPage();
 await page.goto('http://127.0.0.1:5173/?fixture=medium');await expect(page.locator('svg[data-view="face"]')).toBeVisible();
 const result=await page.evaluate(async()=>{
  const {useStore}=await import('/src/store.ts');const before=useStore.getState().elements;
  const root=globalThis as typeof globalThis & {__qaRenderCounts?:Record<string,number>};root.__qaRenderCounts={};
  useStore.getState().setElementState('pressed');await new Promise(r=>setTimeout(r,1200));
  const rendered=Object.keys(root.__qaRenderCounts);delete root.__qaRenderCounts;
  return {rendered,static:before.filter(e=>e.pressable===false).map(e=>e.id)};
 });await context.close();expect(result.rendered.filter(id=>result.static.includes(id))).toEqual([]);
});

test('@defs unique surface keys',async({page})=>{
 await page.goto('/?fixture=ssl-strip');await expect(page.locator('svg[data-view="face"]')).toBeVisible();
 const result=await page.evaluate(async()=>{
  const {useStore}=await import('/src/store.ts'),{resolveStyle}=await import('/src/styles/catalog.ts'),{visualElement}=await import('/src/states/visual.ts'),{shadingSpec}=await import('/src/render/shadingKey.ts');
  const s=useStore.getState(),pack=resolveStyle(s.styleId);
  const keys=s.elements.map(e=>{const v=visualElement(e,pack,s.canvasBackground);return shadingSpec(v.element,{material:v.material,state:v.frame.state,press:v.frame.press,pressMode:pack.pressMode}).filterKey;});
  const ids=[...document.querySelectorAll('svg[data-view="face"] defs > filter,svg[data-view="face"] defs > linearGradient')].map(e=>e.id).filter(id=>/^shading-[^-]+-\d+$/.test(id));
  return {elements:s.elements.length,unique:new Set(keys).size,defs:ids.length};
 });expect(result).toEqual({elements:15,unique:11,defs:11});
});

test('@defs look and direction do not rebuild surfaces',async({page})=>{
 await page.addInitScript(()=>{(globalThis as typeof globalThis & {__qaSurfaceBuilds?:Record<string,number>}).__qaSurfaceBuilds={};});
 await page.goto('/?fixture=medium');await expect(page.locator('svg[data-view="face"]')).toBeVisible();
 const result=await page.evaluate(async()=>{
  const {useStore}=await import('/src/store.ts');const counts=(globalThis as typeof globalThis & {__qaSurfaceBuilds:Record<string,number>}).__qaSurfaceBuilds;
  const surfaceIds=()=>[...document.querySelectorAll('svg[data-view="face"] defs > filter,svg[data-view="face"] defs > linearGradient')].map(n=>n.id).filter(id=>/^shading-[^-]+-\d+$/.test(id));
  const ids=surfaceIds(),before=ids.map(id=>counts[id]??0);
  useStore.getState().setLook('strong');await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
  useStore.getState().setDirection('ne');await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
  const afterIds=surfaceIds();return {count:useStore.getState().elements.length,ids,afterIds,before,after:afterIds.map(id=>counts[id]??0)};
 });
 expect(result.count).toBe(20);expect(result.ids.length).toBeGreaterThan(0);expect(result.afterIds).toEqual(result.ids);expect(result.after).toEqual(result.before);
});
