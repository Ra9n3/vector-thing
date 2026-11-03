import { test,expect } from '@playwright/test';
const directions=['n','ne','e','se','s','sw','w','nw'];
const styles=['studio-hardware','soft-clay','glossy-mobile','neumorphic'];
const looks=['flat','slight','strong'];
const tests:{fixture:string;style:string;look:string;direction:string}[]=directions.map(direction=>({fixture:'ssl-strip',style:'studio-hardware',look:'slight',direction}));
for(const fixture of ['shape-grid','toggles','neumorphic-panel'])for(const style of styles)for(const look of looks)for(const direction of ['nw','ne','sw','se','s'])tests.push({fixture,style,look,direction});
for(const entry of tests)test(`@visual ${entry.fixture} ${entry.style} ${entry.look} ${entry.direction}`,async({page})=>{
 await page.goto(`/?fixture=${entry.fixture}`);await expect(page.locator('svg[data-view="face"]')).toBeVisible();
 await page.evaluate(async entry=>{const {useStore}=await import('/src/store.ts');const s=useStore.getState();if(s.styleId!==entry.style)s.setStyle(entry.style);useStore.setState({look:entry.look,direction:entry.direction});},entry);
 await page.waitForTimeout(650);
 await expect(page.locator('main')).toHaveScreenshot(`${entry.fixture}-${entry.style}-${entry.look}-${entry.direction}.png`,{animations:'disabled',timeout:process.env.CI?10000:45000});
});
for(const fixture of ['ssl-strip','shape-grid','toggles','neumorphic-panel','stress','glass-glow'])for(const dpr of [1,2])for(const zoom of [.25,1,4]){
 test(`@zoom ${fixture} ${zoom}x dpr${dpr}`,async({browser})=>{
  const context=await browser.newContext({viewport:{width:1440,height:900},deviceScaleFactor:dpr,reducedMotion:'reduce'});const page=await context.newPage();
  await page.goto(`http://127.0.0.1:5173/?fixture=${fixture}`);await expect(page.locator('svg[data-view="face"]')).toBeVisible();
  await page.evaluate(async zoom=>{const {useViewport}=await import('/src/canvas/useViewport.ts');const v=useViewport.getState();v.zoomAt(v.width/2,v.height/2,zoom);},zoom);await page.waitForTimeout(600);
  await expect(page.locator('main')).toHaveScreenshot(`${fixture}-zoom${zoom}-dpr${dpr}.png`,{animations:'disabled',timeout:process.env.CI?10000:45000});await context.close();
 });
}
for(const fixture of ['ssl-strip','toggles'])for(const state of ['default','pressed','disabled'])test(`@state ${fixture} ${state}`,async({page})=>{
 await page.goto(`/?fixture=${fixture}`);await page.evaluate(async state=>{const {useStore}=await import('/src/store.ts');useStore.getState().setElementState(state)},state);await page.waitForTimeout(600);
 await expect(page.locator('main')).toHaveScreenshot(`${fixture}-state-${state}.png`,{animations:'disabled',timeout:process.env.CI?10000:45000});
});

for(const direction of ['e','s'] as const)test(`@visual custom-profile slight ${direction}`,async({page})=>{
 await page.goto('/?fixture=custom-profile');await expect(page.locator('svg[data-view="face"]')).toBeVisible();
 await page.evaluate(async direction=>{const {useStore}=await import('/src/store.ts');useStore.getState().setDirection(direction);},direction);await page.waitForTimeout(650);
 await expect(page.locator('main')).toHaveScreenshot(`custom-profile-slight-${direction}.png`,{animations:'disabled'});
});
