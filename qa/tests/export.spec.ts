import { test,expect } from '@playwright/test';
import { Resvg } from '@resvg/resvg-js';
const fixtures=['ssl-strip','shape-grid','toggles','neumorphic-panel','stress','glass-glow','medium','custom-profile'];
for(const fixture of fixtures)test(`@export ${fixture} XML and flat renderer`,async({page})=>{
 await page.goto(`/?fixture=${fixture}`);await expect(page.locator('svg[data-view="face"]')).toBeVisible();
 const output=await page.evaluate(async()=>{
  const {useStore}=await import('/src/store.ts'),{resolveStyle}=await import('/src/styles/catalog.ts'),{exportScene}=await import('/src/export/scene.ts'),{buildSvg}=await import('/src/export/buildSvg.tsx'),{buildFlatSvg}=await import('/src/export/flat/flatSvg.ts');
  const s=useStore.getState(),variant=exportScene({elements:s.elements,groups:s.groups,selection:[],scope:'all',states:'current',look:s.look,direction:s.direction,pack:resolveStyle(s.styleId),background:false})[0];
  return {svg:buildSvg(variant),flat:buildFlatSvg(variant),bounds:variant.bounds};
 });
 expect(output.flat).not.toMatch(/<filter|\sfilter=|mix-blend-mode|<image|<mask|feTurbulence/i);
 const png=new Resvg(output.flat,{fitTo:{mode:'width',value:300}}).render();expect(png.width).toBeGreaterThan(0);expect(png.height).toBeGreaterThan(0);
 const ids=await page.evaluate(({a,b})=>{const host=document.createElement('div');host.innerHTML=a+b;const ids=[...host.querySelectorAll('[id]')].map(el=>el.id);return ids.length-new Set(ids).size;},{a:output.svg,b:output.flat});expect(ids).toBe(0);
});

test('@export IDs are unique per document and reproducible',async({page})=>{
 await page.goto('/?fixture=ssl-strip');await expect(page.locator('svg[data-view="face"]')).toBeVisible();
 const result=await page.evaluate(async()=>{
  const {useStore}=await import('/src/store.ts'),{resolveStyle}=await import('/src/styles/catalog.ts'),{exportScene}=await import('/src/export/scene.ts'),{buildSvg}=await import('/src/export/buildSvg.tsx');
  const s=useStore.getState(),opts={elements:s.elements,groups:s.groups,selection:[],scope:'all' as const,states:'current' as const,look:s.look,direction:s.direction,pack:resolveStyle(s.styleId),background:false};
  const a=buildSvg(exportScene(opts)[0]),same=buildSvg(exportScene(opts)[0]);
  const other=buildSvg(exportScene({...opts,elements:opts.elements.map((e,i)=>i===0?{...e,x:e.x+20}:e)})[0]);
  const ids=(html:string)=>{const host=document.createElement('div');host.innerHTML=html;return [...host.querySelectorAll('[id]')].map(el=>el.id);};
  const single=ids(a),both=ids(a+other);return {same:a===same,single:single.length-new Set(single).size,both:both.length-new Set(both).size};
 });expect(result).toEqual({same:true,single:0,both:0});
});
