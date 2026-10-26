/** Native browser acceptance for preferences. */
import {test,expect} from '@playwright/test';
const cases=[['ghost','Ghost visibility','dynamic','show'],['hardDrop','Hard drop','on','off'],['nextPreview','Next-piece preview','on','off'],['hardDropLock','Hard-drop locking','follow','immediate'],['lockPolicy','General locking','interval','failedDown'],['hold','Hold piece','on','off']] as const;
for(const [key,label,defaultValue,alternate] of cases)test('persists independent '+key+' URL/cookie precedence and explicit defaults',async({page,context})=>{
 const base='http://127.0.0.1:4173',name='tetris_'+key;await context.addCookies([{name,value:alternate,url:base}]);
 await page.goto('/?'+key+'='+defaultValue+'&u=kept#fragment');const field=page.getByLabel(label,{exact:true});await expect(field).toHaveValue(defaultValue);expect((await context.cookies()).find(c=>c.name===name)!.value).toBe(defaultValue);
 await context.addCookies([{name,value:alternate,url:base}]);await page.goto('/?u=kept#fragment');await expect(field).toHaveValue(alternate);expect(new URL(page.url()).searchParams.has(key)).toBe(false);
 await page.goto('/?'+key+'=invalid&u=kept#fragment');await expect(field).toHaveValue(alternate);await expect(page.locator('#message')).toContainText(key);
 await page.goto('/?'+key+'='+defaultValue+'&'+key+'='+defaultValue+'&u=kept#fragment');await expect(field).toHaveValue(alternate);
 await field.focus();await field.selectOption(defaultValue);let url=new URL(page.url());expect(url.searchParams.getAll(key)).toEqual([defaultValue]);expect(url.searchParams.get('u')).toBe('kept');expect(url.hash).toBe('#fragment');expect((await context.cookies()).find(c=>c.name===name)!.value).toBe(defaultValue);
 await field.selectOption(alternate);const cookie=(await context.cookies()).find(c=>c.name===name)!;expect(cookie.value).toBe(alternate);expect(cookie.path).toBe('/');expect(cookie.sameSite).toBe('Lax');expect(cookie.secure).toBe(false);expect(cookie.expires).toBeGreaterThan(Date.now()/1000+86400*364);
 const reopened=await context.newPage();await reopened.goto(base+'/?u=kept#fragment');await expect(reopened.getByLabel(label,{exact:true})).toHaveValue(alternate);expect(new URL(reopened.url()).searchParams.has(key)).toBe(false);await reopened.close();
});
test('denied cookie/history writes preserve effective settings and exact URL with a clear error',async({page})=>{
 await page.goto('/?u=a%20b#fragment');const before=page.url();await page.evaluate(()=>{const original=history.replaceState.bind(history);Object.assign(window,{__restoreHistory:original});history.replaceState=()=>{throw new DOMException('denied','SecurityError');};});await page.getByLabel('Hold piece',{exact:true}).selectOption('off');await expect(page.getByLabel('Hold piece',{exact:true})).toHaveValue('on');await expect(page.locator('#message')).toContainText('not changed');expect(page.url()).toBe(before);expect(await page.evaluate(()=>document.cookie)).not.toContain('tetris_hold');
 await page.evaluate(()=>{history.replaceState=(window as any).__restoreHistory;Object.defineProperty(document,'cookie',{configurable:true,get:()=>'',set:()=>{}});});await page.getByLabel('Hold piece',{exact:true}).selectOption('off');await expect(page.getByLabel('Hold piece',{exact:true})).toHaveValue('on');await expect(page.locator('#message')).toContainText('refused');expect(page.url()).toBe(before);
});
test('saved cookie survives closing and reopening an isolated persistent browser profile',async({browserName})=>{
 const {chromium,firefox}=await import('@playwright/test'),{rm}=await import('node:fs/promises');const profile=test.info().outputPath('owned-preference-profile');let context;
 try{for(let cycle=0;cycle<2;cycle++){
  context=await (browserName==='firefox'?firefox:chromium).launchPersistentContext(profile,{headless:true,...(browserName==='firefox'&&process.env.PW_FIREFOX_LOCAL_SANDBOX_WORKAROUND==='1'?{env:{...process.env,MOZ_DISABLE_CONTENT_SANDBOX:'1'}}:{})});
  const page=context.pages()[0]??await context.newPage();await page.goto('http://127.0.0.1:4173/'+(cycle===0?'?hold=off':''));await expect(page.getByLabel('Hold piece',{exact:true})).toHaveValue('off');await context.close();context=undefined;
 }}finally{if(context)await context.close();await rm(profile,{recursive:true,force:true});}
});
test('incomplete rollback leaves a clear error and disables all further preference writes',async({page})=>{
 await page.goto('/?u=kept#fragment');await page.evaluate(()=>{let count=0;const original=history.replaceState.bind(history);history.replaceState=(state,title,url)=>{count++;(window as any).__historyWrites=count;if(count===1)original(state,title,url);throw new DOMException('recovery denied','SecurityError');};});
 await page.getByLabel('Hold piece',{exact:true}).selectOption('off');await expect(page.locator('#message')).toContainText('recovery is incomplete');for(const field of await page.locator('#setting-fields').getByRole('combobox').all())await expect(field).toBeDisabled();await expect(page.getByLabel('Hold piece',{exact:true})).toHaveValue('on');const writes=await page.evaluate(()=>(window as any).__historyWrites);
 await page.getByLabel('Hold piece',{exact:true}).dispatchEvent('change');await expect(page.locator('#message')).toContainText('recovery is incomplete');expect(await page.evaluate(()=>(window as any).__historyWrites)).toBe(writes);
});
