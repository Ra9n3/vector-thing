import { test, expect } from '@playwright/test';
const fixtures=['ssl-strip','shape-grid','toggles','neumorphic-panel','stress','glass-glow','medium','outlines'];
for(const fixture of fixtures)test(`@parity ${fixture} live SVG and PNG`,async({page})=>{
 await page.goto(`/?fixture=${fixture}`);await expect(page.locator('svg[data-view="face"]')).toBeVisible();await page.waitForTimeout(1000);
 const diff=await page.evaluate(async()=>{
  const {useStore}=await import('/src/store.ts'),{resolveStyle}=await import('/src/styles/catalog.ts'),{exportScene}=await import('/src/export/scene.ts'),{buildSvg}=await import('/src/export/buildSvg.tsx'),{rasterizePng}=await import('/src/export/png.ts');
  const s=useStore.getState(),v=exportScene({elements:s.elements,groups:s.groups,selection:[],scope:'all',states:'current',look:s.look,direction:s.direction,pack:resolveStyle(s.styleId),background:false})[0];
  const live=document.querySelector('svg[data-view="face"]')!.cloneNode(true) as SVGSVGElement;
  for(const child of [...live.children])if(child.tagName!=='defs' && !child.hasAttribute('data-viewport'))child.remove();
  live.setAttribute('xmlns','http://www.w3.org/2000/svg');live.setAttribute('width',String(v.bounds.w));live.setAttribute('height',String(v.bounds.h));live.setAttribute('viewBox',`0 0 ${v.bounds.w} ${v.bounds.h}`);
  live.querySelector('[data-viewport]')!.setAttribute('transform',`translate(${-v.bounds.x} ${-v.bounds.y})`);
  const img=async(blob:Blob)=>{const u=URL.createObjectURL(blob);try{const i=new Image();i.src=u;await i.decode();return i;}finally{URL.revokeObjectURL(u);}};
  const pixel=async(blob:Blob)=>{const i=await img(blob),c=document.createElement('canvas');c.width=v.bounds.w;c.height=v.bounds.h;const ctx=c.getContext('2d')!;ctx.fillStyle='#808080';ctx.fillRect(0,0,c.width,c.height);ctx.drawImage(i,0,0,c.width,c.height);return ctx.getImageData(0,0,c.width,c.height).data;};
  const svg=(s:string)=>new Blob([s],{type:'image/svg+xml'}),reference=await pixel(svg(buildSvg(v))),canvas=await pixel(svg(new XMLSerializer().serializeToString(live)));
  const error=(a:Uint8ClampedArray,b:Uint8ClampedArray)=>{let total=0;for(let i=0;i<a.length;i+=4)for(let c=0;c<3;c++)total+=Math.abs(a[i+c]-b[i+c]);return total/(a.length/4*3*255);};
  const png:number[]=[];for(const scale of [1,2,3])png.push(error(reference,await pixel(await rasterizePng(buildSvg(v),v.bounds,scale))));
  return {live:error(reference,canvas),png};
 });console.log(fixture,diff);expect(diff.live).toBeLessThan(.02);for(const x of diff.png)expect(x).toBeLessThan(.03);
});
