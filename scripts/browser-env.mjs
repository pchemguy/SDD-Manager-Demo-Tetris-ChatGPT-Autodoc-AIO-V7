import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
export const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export const browserPath=path.join(root,'.cache','pw-browsers');
export function runOwned(args,{timeout=150000,env={}}={}) {
  return new Promise(resolve=>{
    const child=spawn(process.execPath,args,{cwd:root,stdio:'inherit',detached:process.platform!=='win32',env:{...process.env,PLAYWRIGHT_BROWSERS_PATH:browserPath,...env}});
    let expired=false;
    const kill=()=>{try {if(process.platform==='win32')spawn('taskkill',['/PID',String(child.pid),'/T','/F'],{stdio:'ignore'});else process.kill(-child.pid,'SIGKILL');}catch{}};
    const timer=setTimeout(()=>{expired=true;kill();},timeout);
    child.on('error',()=>{clearTimeout(timer);kill();resolve(1);});
    child.on('close',code=>{clearTimeout(timer);kill();resolve(expired?124:(code??1));});
    process.once('SIGTERM',kill);process.once('SIGINT',kill);
  });
}
if(process.argv[1]===fileURLToPath(import.meta.url)) {
  console.log('Dedicated browsers:',browserPath);
  process.exitCode=await runOwned(['node_modules/playwright/cli.js',...process.argv.slice(2),...(process.argv[2]==='install'?['--only-shell',...(!process.argv.slice(3).some(x=>!x.startsWith('-'))?['chromium','firefox']:[])]:[])],{timeout:240000});
}
