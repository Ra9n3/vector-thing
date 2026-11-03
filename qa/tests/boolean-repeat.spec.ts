import {test,expect} from '@playwright/test';
for(const direction of ['e','s'] as const)test.fixme(`@visual fixture10 slight ${direction}`,async({page})=>{
 await page.goto('/?fixture=boolean-repeat');await expect(page.locator('svg[data-view="face"]')).toBeVisible();
 await page.evaluate(async direction=>{const {useStore}=await import('/src/store.ts');useStore.getState().setDirection(direction);},direction);await page.waitForTimeout(650);
 await expect(page.locator('main')).toHaveScreenshot(`boolean-repeat-${direction}.png`,{animations:'disabled'});
});
for(const direction of ['e','s'] as const)test.fixme(`@parity fixture10 SVG Flat PNG ${direction}`,async({page})=>{
 await page.goto('/?fixture=boolean-repeat');await expect(page.locator('svg[data-view="face"]')).toBeVisible();
 const result=await page.evaluate(async direction=>{
  const {useStore}=await import('/src/store.ts'),{resolveStyle}=await import('/src/styles/catalog.ts'),{exportScene}=await import('/src/export/scene.ts'),{buildSvg}=await import('/src/export/buildSvg.tsx'),{buildFlatSvg}=await import('/src/export/flat/flatSvg.ts'),{rasterizePng}=await import('/src/export/png.ts');
  useStore.getState().setDirection(direction);const s=useStore.getState(),v=exportScene({elements:s.elements,groups:s.groups,selection:[],scope:'all',states:'current',look:s.look,direction:s.direction,pack:resolveStyle(s.styleId),background:false})[0];
  const svg=buildSvg(v),flat=buildFlatSvg(v),png=await rasterizePng(svg,v.bounds,1);
  const pixels=async(blob:Blob)=>{const url=URL.createObjectURL(blob);try{const im=new Image();im.src=url;await im.decode();const c=document.createElement('canvas');c.width=v.bounds.w;c.height=v.bounds.h;const ctx=c.getContext('2d')!;ctx.fillStyle='#808080';ctx.fillRect(0,0,c.width,c.height);ctx.drawImage(im,0,0,c.width,c.height);return ctx.getImageData(0,0,c.width,c.height).data;}finally{URL.revokeObjectURL(url);}};
  const exact=await pixels(new Blob([svg],{type:'image/svg+xml'})),flatPixels=await pixels(new Blob([flat],{type:'image/svg+xml'})),pngPixels=await pixels(png);
  const error=(a:Uint8ClampedArray,b:Uint8ClampedArray)=>{let sum=0;for(let i=0;i<a.length;i+=4)for(let c=0;c<3;c++)sum+=Math.abs(a[i+c]-b[i+c]);return sum/(a.length/4*3*255);};return {flat:error(exact,flatPixels),png:error(exact,pngPixels)};
 },direction);expect(result.flat).toBeLessThan(.03);expect(result.png).toBeLessThan(.03);
});
test.fixme('@repeat canvas performance',async({page})=>{
 await page.route('**/src/components/Canvas.tsx',async route=>{
  const response=await route.fetch();let body=await response.text();
  const react=(body.match(/\/node_modules\/\.vite\/deps\/react\.js\?v=[^"\s]+/)??[])[0];if(!react)throw Error('React module missing');
  body+=`\nimport QAReact from ${JSON.stringify(react)};\n`;
  const anchor='const frames = useStateAnimation(elements, style, version, instantVersion);';
  if(!body.includes(anchor))throw Error('Canvas instrumentation missing');
  body=body.replace(anchor,`${anchor} QAReact.useLayoutEffect(()=>window.__repeatCommit?.());`);await route.fulfill({response,body});
 });
 await page.goto('/?fixture=medium');await expect(page.locator('svg[data-view="face"]')).toBeVisible();
 const elapsed=await page.evaluate(async()=>{const {useStore}=await import('/src/store.ts');const store=useStore.getState() as unknown as {elements:unknown[];setRepeatParams:(value:unknown)=>void};if(store.elements.length!==20)throw Error('Wrong fixture');
  return await new Promise<number>((resolve,reject)=>{const win=window as unknown as {__repeatCommit?:()=>void};const timer=setTimeout(()=>reject(Error('missing canvas commit')),10000),start=performance.now();win.__repeatCommit=()=>{win.__repeatCommit=undefined;requestAnimationFrame(()=>requestAnimationFrame(()=>{clearTimeout(timer);resolve(performance.now()-start);}));};store.setRepeatParams({count:12});});
 });expect(elapsed).toBeLessThan(100);
});
test.fixme('@boolean empty result leaves selection and shows a notice',async({page})=>{
 await page.goto('/?fixture=boolean-repeat');await expect(page.locator('svg[data-view="face"]')).toBeVisible();
 await page.evaluate(async()=>{const {useStore}=await import('/src/store.ts');useStore.getState().setSelection(['fixture10-ring','fixture10-union']);});
 await page.getByText('Customize',{exact:true}).click();await page.getByRole('button',{name:'Intersect'}).click();await expect(page.getByRole('alert')).toHaveText('No result');
 const count=await page.evaluate(async()=>{const {useStore}=await import('/src/store.ts');return useStore.getState().elements.length;});expect(count).toBe(8);
});
test.fixme('@light annulus and radial copies',async({page})=>{
 await page.goto('/?fixture=boolean-repeat');await expect(page.locator('svg[data-view="face"]')).toBeVisible();await page.waitForTimeout(650);
 await expect(page.locator('main')).toHaveScreenshot('boolean-repeat-fixed-light.png',{animations:'disabled'});
});
