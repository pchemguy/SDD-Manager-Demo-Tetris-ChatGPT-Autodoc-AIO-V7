import {runOwned,browserPath} from './browser-env.mjs';
const production=process.argv.includes('--production');
console.log('Browser mode: headless; dedicated path:',browserPath);
process.exitCode=await runOwned(['node_modules/playwright/cli.js','test',...process.argv.slice(2).filter(x=>x!=='--production')],{timeout:150000,env:{TEST_PRODUCTION:production?'1':'0'}});
