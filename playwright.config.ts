import {defineConfig} from '@playwright/test';
const runtime=process.env.TEST_RUNTIME==='1',base=process.env.TEST_BASE||'/';
const production=process.env.TEST_PRODUCTION==='1';
export default defineConfig({
  testDir:'tests/e2e',timeout:20000,globalTimeout:120000,expect:{timeout:5000},workers:1,
  reporter:[['list']],use:{baseURL:'http://127.0.0.1:4173',headless:true,viewport:{width:1440,height:900},actionTimeout:5000,navigationTimeout:10000},
  projects:[{name:'chromium',use:{browserName:'chromium'}},{name:'firefox',use:{browserName:'firefox',...(process.env.PW_FIREFOX_LOCAL_SANDBOX_WORKAROUND==='1'?{launchOptions:{env:{...process.env,MOZ_DISABLE_CONTENT_SANDBOX:'1'}}}:{})}}],
  webServer:{command:runtime?'npm run preview -- --outDir .cache/runtime-dist --port 4173 --strictPort':production?'npm run preview -- --port 4173 --strictPort':'npm run dev -- --port 4173 --strictPort --mode test',url:'http://127.0.0.1:4173',reuseExistingServer:false,timeout:15000}
});
