/** Actual module worker and WASM load through the application toolchain. */
import {test,expect} from '@playwright/test';
test('isolated SQLite runtime creates a trusted empty database',async({page})=>{
 test.skip(process.env.TEST_PRODUCTION==='1'&&process.env.TEST_RUNTIME!=='1','Acceptance entry is built separately; actual product transfer is tested separately.');
 const base=process.env.TEST_BASE||'/';await page.goto(base+'tests/fixtures/sqlite-runtime.html');const bytes=await page.evaluate(async()=>Array.from(await (window as any).runSQLite()) as number[]);expect(bytes.slice(0,16)).toEqual(Array.from(Buffer.from('SQLite format 3\0')));
});
test('worker validates real encoded bytes with all settings before returning canonical JSON',async({page})=>{
 test.skip(process.env.TEST_PRODUCTION==='1'&&process.env.TEST_RUNTIME!=='1','Separate runtime entry');await page.goto((process.env.TEST_BASE||'/')+'tests/fixtures/sqlite-runtime.html');
 const result=await page.evaluate(async()=>{const run=(window as any).runSQLite,snapshot={formatVersion:1,results:[],settings:{ghost:'show',hardDrop:false,nextPreview:false,hardDropLock:'immediate',lockPolicy:'failedDown',hold:false}},bytes=await run({kind:'encode',snapshot}),json=await run({kind:'decode',bytes});return JSON.parse(new TextDecoder().decode(json));});expect(result).toEqual({formatVersion:1,results:[],settings:{ghost:'show',hardDrop:false,nextPreview:false,hardDropLock:'immediate',lockPolicy:'failedDown',hold:false}});
});
