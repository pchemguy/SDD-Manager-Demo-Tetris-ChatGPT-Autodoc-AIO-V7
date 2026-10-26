/** Native browser acceptance for penetrator. */
import {test,expect} from '@playwright/test';
test('shows available penetrator bonuses in actual shipped panels',async({page})=>{await page.goto('/');await expect(page.getByTestId('bonuses')).toHaveText('—');await expect(page.getByTestId('bonuses')).toHaveAttribute('aria-label','Available penetrator bonuses: 0');await expect(page.getByText('Penetrator',{exact:true})).toBeVisible();});
test('native activation spends once, paints white and drops below blockers without Hold',async({page})=>{
 test.skip(process.env.TEST_PRODUCTION==='1','Controlled fixtures are development-only.');
 await page.goto('/');await page.getByRole('button',{name:'Start game',exact:true}).click();
 await page.evaluate(()=>{const c=(window as any).__tetris,g=c.state,board=Array.from({length:20},()=>Array(10).fill(null));for(const y of [8,17])for(const x of [4,5])board[y][x]='J';c.state={...g,board,active:{kind:'O',rotation:0,x:3,y:3},bonuses:2,penetrating:false};});
 await expect(page.getByTestId('bonuses')).toHaveText('⚡⚡');await expect(page.getByTestId('bonuses')).toHaveAttribute('aria-label','Available penetrator bonuses: 2');await page.keyboard.press('v');await expect(page.getByTestId('bonuses')).toHaveText('⚡');await expect(page.getByTestId('bonuses')).toHaveAttribute('aria-label','Available penetrator bonuses: 1');await page.keyboard.press('v');await expect(page.getByTestId('bonuses')).toHaveText('⚡');await expect(page.getByTestId('bonuses')).toHaveAttribute('aria-label','Available penetrator bonuses: 1');
 const white=await page.locator('canvas').evaluate((canvas:HTMLCanvasElement)=>[...canvas.getContext('2d')!.getImageData(4*28+8,3*28+8,1,1).data]);expect(white).toEqual([255,255,255,255]);const ghost=await page.locator('canvas').evaluate((canvas:HTMLCanvasElement)=>[...canvas.getContext('2d')!.getImageData(4*28+3,18*28+7,1,1).data]);expect(ghost).toEqual([255,255,255,255]);
 await page.screenshot({path:test.info().outputPath('penetrator.png')});
 await page.keyboard.press('c');await expect(page.getByTestId('held-kind')).toHaveText('—');await page.keyboard.press('Space');expect(await page.evaluate(()=>(window as any).__tetris.state.active.y)).toBe(18);
 await expect.poll(()=>page.evaluate(()=>(window as any).__tetris.state.penetrating)).toBe(false);
 const settled=await page.locator('canvas').evaluate((canvas:HTMLCanvasElement)=>[...canvas.getContext('2d')!.getImageData(4*28+8,19*28+8,1,1).data]);expect(settled).toEqual([237,205,112,255]);expect(await page.locator('.mini-piece i').evaluateAll(nodes=>nodes.every(n=>getComputedStyle(n).backgroundColor!=='rgb(255, 255, 255)'))).toBe(true);expect(await page.evaluate(()=>(window as any).__tetris.state.board[17][5])).toBe('J');
 await page.keyboard.press('r');await expect(page.getByTestId('bonuses')).toHaveText('—');await expect(page.getByTestId('bonuses')).toHaveAttribute('aria-label','Available penetrator bonuses: 0');
});
test('native animation rewards four simultaneous lines with one bonus',async({page})=>{
 test.skip(process.env.TEST_PRODUCTION==='1','Controlled fixtures are development-only.');await page.goto('/');await page.getByRole('button',{name:'Start game',exact:true}).click();
 await page.evaluate(()=>{const c=(window as any).__tetris,g=c.state,board=Array.from({length:20},()=>Array(10).fill(null));for(let y=16;y<20;y++)for(let x=0;x<10;x++)if(x!==5)board[y][x]='J';c.state={...g,board,active:{kind:'I',rotation:1,x:3,y:16},lockAt:g.time+100};});await expect(page.getByTestId('bonuses')).toHaveText('⚡');await expect(page.getByTestId('bonuses')).toHaveAttribute('aria-label','Available penetrator bonuses: 1');await expect(page.getByTestId('lines')).toHaveText('04');
});
