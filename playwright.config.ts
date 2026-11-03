import { defineConfig, devices } from '@playwright/test';
const executablePath=process.env.QA_CHROMIUM_PATH;
export default defineConfig({
  testDir:'./qa/tests', timeout:90000, expect:{timeout:15000,toHaveScreenshot:{maxDiffPixelRatio:.01}},
  snapshotPathTemplate:'{testDir}/../snapshots/{arg}{ext}',
  fullyParallel:false,workers:1, reporter:[['list']],
  use:{baseURL:'http://127.0.0.1:5173',viewport:{width:1440,height:900},reducedMotion:'reduce'},
  projects:[
    {name:'chromium',use:{...devices['Desktop Chrome'],viewport:{width:1440,height:900},...(executablePath?{launchOptions:{executablePath,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']}}:{})}},
    {name:'firefox',use:{...devices['Desktop Firefox'],viewport:{width:1440,height:900}}},
    {name:'webkit',use:{...devices['Desktop Safari'],viewport:{width:1440,height:900}}},
  ],
  webServer:{command:'npm run dev -- --host 0.0.0.0',url:'http://127.0.0.1:5173',reuseExistingServer:true,timeout:60000},
});
