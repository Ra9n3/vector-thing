import {test,expect} from '@playwright/test';
for(const direction of ['e','s'] as const)test(`@parity custom profile SVG, Flat SVG and PNG ${direction}`,async({page})=>{
 await page.goto('/?fixture=custom-profile');await expect(page.locator('svg[data-view="face"]')).toBeVisible();await page.evaluate(async direction=>{const {useStore}=await import('/src/store.ts');useStore.getState().setDirection(direction);},direction);await page.waitForTimeout(1000);
 const result=await page.evaluate(async()=>{
  const {useStore}=await import('/src/store.ts'),{resolveStyle}=await import('/src/styles/catalog.ts'),{exportScene}=await import('/src/export/scene.ts'),{buildSvg}=await import('/src/export/buildSvg.tsx'),{buildFlatSvg}=await import('/src/export/flat/flatSvg.ts'),{rasterizePng}=await import('/src/export/png.ts');
  const s=useStore.getState(),v=exportScene({elements:s.elements,groups:s.groups,selection:[],scope:'all',states:'current',look:s.look,direction:s.direction,pack:resolveStyle(s.styleId),background:false})[0];
  const svg=buildSvg(v),flat=buildFlatSvg(v),png=await rasterizePng(svg,v.bounds,1);
  const pixels=async(blob:Blob)=>{const url=URL.createObjectURL(blob);try{const im=new Image();im.src=url;await im.decode();const c=document.createElement('canvas');c.width=v.bounds.w;c.height=v.bounds.h;const ctx=c.getContext('2d')!;ctx.fillStyle='#808080';ctx.fillRect(0,0,c.width,c.height);ctx.drawImage(im,0,0,c.width,c.height);return ctx.getImageData(0,0,c.width,c.height).data;}finally{URL.revokeObjectURL(url);}};
  const exact=await pixels(new Blob([svg],{type:'image/svg+xml'})),flatPixels=await pixels(new Blob([flat],{type:'image/svg+xml'})),pngPixels=await pixels(png);
  const error=(a:Uint8ClampedArray,b:Uint8ClampedArray)=>{let n=0;for(let i=0;i<a.length;i+=4)for(let c=0;c<3;c++)n+=Math.abs(a[i+c]-b[i+c]);return n/(a.length/4*3*255);};
  return {flat:error(exact,flatPixels),png:error(exact,pngPixels)};
 });console.log('custom parity',result);expect(result.png).toBeLessThan(.03);expect(result.flat).toBeLessThan(.03);
});
