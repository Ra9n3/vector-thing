import {test,expect} from '@playwright/test';

test('every built-in profile has a finite table, Side path and handles',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');
 const presets=await page.evaluate(async()=>{const {PRESETS}=await import('/src/profiles/presets.ts');const {useStore}=await import('/src/store.ts');useStore.getState().addElement('rect',140,65,0,0);useStore.getState().setMode('side');useStore.getState().setLook('slight');useStore.getState().setDirection('s');return PRESETS.map(p=>p.id);});
 for(const preset of presets){
  const table=await page.evaluate(async preset=>{const {useStore}=await import('/src/store.ts');const {resolveProfile,profileToSamples}=await import('/src/profiles/sample.ts');const s=useStore.getState();s.setDrawProfile(true);s.setSideProfile(preset as Parameters<typeof s.setSideProfile>[0]);const selected=useStore.getState().elements.find(e=>useStore.getState().selection.includes(e.id))!;return {values:profileToSamples(resolveProfile(selected.props.profile),64),draw:useStore.getState().drawProfile};},preset);
  expect(table.draw,preset).toBe(false);expect(table.values).toHaveLength(64);expect(table.values.every(n=>Number.isFinite(n)&&n>=0&&n<=1),preset).toBe(true);
  const side=page.locator('svg[aria-label="Side profile"]');await expect(side).toBeVisible();
  const curve=side.locator('path[fill="none"][stroke-linejoin="round"]');await expect(curve).toBeVisible();await expect(curve).not.toHaveAttribute('d',/NaN|Infinity/);
  await expect(side.locator('[data-handle-param]').first()).toBeVisible();await expect(page.getByLabel('Face preview')).toBeVisible();
 }
 const drawAfterExit=await page.evaluate(async()=>{const {useStore}=await import('/src/store.ts');useStore.getState().setDrawProfile(true);useStore.getState().setMode('face');return useStore.getState().drawProfile;});
 expect(drawAfterExit).toBe(false);expect(errors).toEqual([]);
});

test('library thumbnails render and category tabs have scroll buttons',async({page})=>{
 await page.goto('/');const tabs=page.getByRole('tablist',{name:'Category'});await expect(tabs).toBeVisible();
 const root=page.locator('.MuiTabs-root').filter({has:tabs});await expect(root.locator('.MuiTabs-scrollButtons').last()).toBeVisible();
 await root.locator('.MuiTabs-scrollButtons').last().click();await expect(page.getByRole('tab',{name:'Faders'})).toBeInViewport();
 const tiles=page.locator('.MuiCardActionArea-root svg');expect(await tiles.count()).toBeGreaterThan(1);
 expect(await tiles.nth(0).innerHTML()).not.toEqual(await tiles.nth(1).innerHTML());
});
