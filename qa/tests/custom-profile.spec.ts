import {test,expect} from '@playwright/test';
test('@custom draw, edit, undo and escape',async({page})=>{
 await page.goto('/?fixture=custom-profile');await expect(page.locator('svg[data-view="face"]')).toBeVisible();
 await page.evaluate(async()=>{const {useStore}=await import('/src/store.ts');useStore.getState().setSelection(['custom-fader']);useStore.getState().setMode('side');});
 await page.getByText('Customize',{exact:true}).click();await page.getByRole('button',{name:'Draw profile'}).click();
 const side=page.getByLabel('Side profile'),box=await side.boundingBox();if(!box)throw Error('Side view missing');
 await page.mouse.move(box.x+box.width*.38,box.y+box.height*.40);await page.mouse.down();await page.mouse.move(box.x+box.width*.50,box.y+box.height*.43,{steps:8});await page.mouse.move(box.x+box.width*.62,box.y+box.height*.39,{steps:8});await page.mouse.up();
 const profile=await page.evaluate(async()=>{const {useStore}=await import('/src/store.ts');return useStore.getState().elements.find(e=>e.id==='custom-fader')!.props.profile;});
 expect(profile.kind).toBe('custom');expect(profile.custom!.points.length).toBeGreaterThanOrEqual(2);expect(profile.custom!.points.length).toBeLessThanOrEqual(12);
 await page.getByRole('button',{name:'Undo',exact:true}).last().click();
 await page.mouse.move(box.x+box.width*.4,box.y+box.height*.4);await page.mouse.down();await page.mouse.move(box.x+box.width*.5,box.y+box.height*.42);await page.keyboard.press('Escape');await page.mouse.up();
});
test.fixme('@custom rotated across profile keeps fixed light',async()=>{ /* Requires rotation support from Task 13. */ });
test('@performance custom edit medium',async({page,browserName})=>{
 test.skip(browserName!=='chromium');
 await page.route('**/src/components/Canvas.tsx',async route=>{
  const response=await route.fetch();let body=await response.text();
  const react=(body.match(/\/node_modules\/\.vite\/deps\/react\.js\?v=[^"\s]+/)??[])[0];if(!react)throw Error('React module missing');
  body+=`\nimport QAReact from ${JSON.stringify(react)};\n`;
  const anchor='const frames = useStateAnimation(elements, style, version, instantVersion);';
  if(!body.includes(anchor))throw Error('Canvas instrumentation missing');
  body=body.replace(anchor,`${anchor} QAReact.useLayoutEffect(()=>window.__customCommit?.());`);await route.fulfill({response,body});
 });
 await page.goto('/?fixture=medium');await expect(page.locator('svg[data-view="face"]')).toBeVisible();await page.waitForTimeout(1800);
 const result=await page.evaluate(async()=>{const {useStore}=await import('/src/store.ts');const s=useStore.getState(),id=s.elements[0].id;s.setSelection([id]);await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
  return await new Promise<number>((resolve,reject)=>{const win=window as unknown as {__customCommit?:()=>void};const timer=setTimeout(()=>reject(Error('missing commit')),10000);const start=performance.now();win.__customCommit=()=>{win.__customCommit=undefined;requestAnimationFrame(()=>requestAnimationFrame(()=>{clearTimeout(timer);resolve(performance.now()-start);}));};s.setCustomProfile({points:[{x:0,y:.1},{x:.5,y:.8},{x:1,y:.2}],mirror:true,smooth:.5},true);});
 });console.log('custom edit medium ms',result);expect(result).toBeLessThan(100);
});
