/** Native browser acceptance for modern. */
import {test,expect} from '@playwright/test';
test('Hold consumes next once and preserves its once-per-piece restriction',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Start game',exact:true}).click();
 const next=await page.getByTestId('next-kind').textContent();await expect(page.getByTestId('held-kind')).toHaveText('—');await page.keyboard.press('c');
 await expect(page.getByTestId('held-kind')).not.toHaveText('—');await expect(page.getByTestId('next-kind')).not.toHaveText(next!);
 const held=await page.getByTestId('held-kind').textContent(),upcoming=await page.getByTestId('next-kind').textContent();await page.keyboard.press('c');await expect(page.getByTestId('held-kind')).toHaveText(held!);await expect(page.getByTestId('next-kind')).toHaveText(upcoming!);
});
test('native hard drop scores and waits before locking',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Start game',exact:true}).click();const board=page.locator('canvas'),before=await board.screenshot();await page.keyboard.press('Space');await expect(page.getByTestId('score')).not.toHaveText('000000');expect((await board.screenshot()).equals(before)).toBe(false);
});
test('ghost raster hides upper/straddling destinations and shows the row-ten boundary',async({page})=>{
 test.skip(process.env.TEST_PRODUCTION==='1','Controlled board fixtures are development-only.');
 await page.goto('/');await page.getByRole('button',{name:'Start game',exact:true}).click();
 const raster=async(y:number)=>page.evaluate(async(y)=>{const c=(window as any).__tetris;const board=Array.from({length:20},()=>Array(10).fill(null));board[y+2][4]='J';c.state={...c.state,status:'paused',board,active:{kind:'O',rotation:0,x:3,y:0},lockAt:null};await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);const canvas=document.querySelector('canvas')!,ctx=canvas.getContext('2d')!,p=ctx.getImageData(Math.round(4*28+3),Math.round(y*28+7),1,1).data;return [...p];},y);
 expect(await raster(9)).toEqual([11,17,29,255]);expect(await raster(10)).not.toEqual([11,17,29,255]);
});
test('hard drop retains its piece through the full interval then locks',async({page})=>{
 test.skip(process.env.TEST_PRODUCTION==='1','Controlled clock fixtures are development-only.');
 await page.goto('/');await page.getByRole('button',{name:'Start game',exact:true}).click();
 const result=await page.evaluate(()=>{const c=(window as any).__tetris;c.pause();c.state={...c.state,status:'running',time:0,gravityAt:1000,lockAt:null,active:{kind:'O',rotation:0,x:3,y:0}};const serial=c.state.pieceSerial;c.command('drop');const dropped=c.state.active.y;for(let i=0;i<3;i++)c.tick(250);c.tick(249);const waiting=c.state.pieceSerial===serial;c.command('drop');const deadline=c.state.lockAt;c.tick(1);const locked=c.state.pieceSerial===serial+1;c.pause();return {dropped,waiting,deadline,locked};});
 expect(result).toEqual({dropped:18,waiting:true,deadline:1000,locked:true});
});
