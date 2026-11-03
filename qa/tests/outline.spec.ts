import {test,expect} from '@playwright/test';

for(const direction of ['e','s'] as const) test.skip(`@visual outlines slight ${direction} (baseline not yet captured)`,async({page})=>{
 await page.goto('/?fixture=outlines');
 await page.evaluate(async direction=>{const {useStore}=await import('/src/store.ts');useStore.setState({look:'slight',direction});},direction);
 await expect(page.locator('main')).toHaveScreenshot(`outlines-slight-${direction}.png`,{animations:'disabled'});
});

test('@outline node drag is one undo step',async({page})=>{
 await page.goto('/?fixture=outlines');await expect(page.locator('svg[data-view="face"]')).toBeVisible();
 await page.evaluate(async()=>{const {useStore}=await import('/src/store.ts');useStore.getState().setSelection(['outline-polygon-6']);});
 await page.getByText('Customize',{exact:true}).click();await page.getByLabel('Edit outline').click();
 const node=page.locator('[data-outline-node="0"]');await expect(node).toBeVisible();const before=await page.evaluate(async()=>{const {useStore}=await import('/src/store.ts');return useStore.getState().elements.find(e=>e.id==='outline-polygon-6')!.outline;});
 const box=await node.boundingBox();if(!box)throw Error('missing node');await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width/2+15,box.y+box.height/2+10,{steps:4});await page.mouse.up();
 const after=await page.evaluate(async()=>{const {useStore}=await import('/src/store.ts');return useStore.getState().elements.find(e=>e.id==='outline-polygon-6')!.outline;});expect(after).not.toEqual(before);await page.keyboard.press('Control+z');
 const undone=await page.evaluate(async()=>{const {useStore}=await import('/src/store.ts');return useStore.getState().elements.find(e=>e.id==='outline-polygon-6')!.outline;});expect(undone).toEqual(before);
});

test('@performance outline drag release at 20 elements',async({page,browserName})=>{
 test.skip(browserName!=='chromium');await page.goto('/?fixture=medium');await expect(page.locator('svg[data-view="face"]')).toBeVisible();
 await page.evaluate(async()=>{const {useStore}=await import('/src/store.ts');useStore.getState().setSelection(['medium-0']);});
 await page.getByText('Customize',{exact:true}).click();await page.getByLabel('Edit outline').click();const node=page.locator('[data-outline-node="0"]');await expect(node).toBeVisible();
 const box=await node.boundingBox();if(!box)throw Error('missing node');await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width/2+12,box.y+box.height/2+8,{steps:4});
 await page.evaluate(()=>{(window as typeof window & {outlineRelease:Promise<number>}).outlineRelease=new Promise(resolve=>window.addEventListener('pointerup',()=>{const start=performance.now();requestAnimationFrame(()=>requestAnimationFrame(()=>resolve(performance.now()-start)));},{once:true,capture:true}));});
 await page.mouse.up();const duration=await page.evaluate(()=>(window as typeof window & {outlineRelease:Promise<number>}).outlineRelease);console.log('outline release ms',duration);expect(duration).toBeLessThan(100);
});
