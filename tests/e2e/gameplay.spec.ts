import {test,expect} from '@playwright/test';
test('plays, pauses, freezes and restarts a classic game',async({page})=>{
 await page.addInitScript(()=>Object.defineProperty(crypto,'getRandomValues',{value:(a:Uint32Array)=>{a.fill(1);return a;}}));
 await page.goto('/');
 await page.getByRole('button',{name:'Start game',exact:true}).click();
 const board=page.getByLabel('Tetris playfield, 10 columns by 20 rows');
 await expect(page.getByTestId('status')).toHaveText('Running');
 await board.focus();const before=await board.screenshot();await page.keyboard.press('ArrowLeft');const after=await board.screenshot();expect(after.equals(before)).toBe(false);await page.keyboard.press('ArrowUp');expect((await board.screenshot()).equals(after)).toBe(false);
 await page.keyboard.press('ArrowDown');await expect(page.getByTestId('score')).toHaveText('000001');
 await page.keyboard.press('p');await expect(page.getByTestId('status')).toHaveText('Paused');
 const frozen=await board.screenshot();await page.waitForTimeout(350);expect((await board.screenshot()).equals(frozen)).toBe(true);
 await page.getByRole('button',{name:'Resume',exact:true}).click();await expect(page.getByTestId('status')).toHaveText('Running');
 await page.getByRole('button',{name:'Restart',exact:true}).click();await expect(page.getByTestId('score')).toHaveText('000000');
 const bounds=await board.boundingBox();expect(Math.abs(bounds!.x+bounds!.width/2-720)).toBeLessThanOrEqual(1);
});
test('clears a fixture line, completes a game once and restarts',async({page})=>{
 test.skip(process.env.TEST_PRODUCTION==='1','Fixture access exists only in the test development build.');
 await page.goto('/');await page.getByRole('button',{name:'Start game',exact:true}).click();
 await page.evaluate(()=>{const c=(window as any).__tetris,g=c.state;const board=Array.from({length:20},()=>Array(10).fill(null));for(let x=0;x<10;x++)if(x<3||x>6)board[19][x]='J';c.state={...g,board,active:{kind:'I',rotation:0,x:3,y:18},lockAt:g.time+1000};});
 await page.keyboard.press('ArrowDown');await expect(page.getByTestId('lines')).toHaveText('01');await expect(page.getByTestId('score')).toHaveText('000100');
 await page.evaluate(()=>{const c=(window as any).__tetris,g=c.state;const board=Array.from({length:20},()=>Array(10).fill(null));board[1][4]='J';c.state={...g,board,active:{kind:'O',rotation:0,x:3,y:-1},lockAt:g.time+100,status:'running'};});
 await expect(page.getByTestId('status')).toHaveText('Game over');expect(await page.evaluate(()=>(window as any).__tetris.state.completion)).toBe(1);
 await page.getByRole('button',{name:'Restart',exact:true}).click();await expect(page.getByTestId('status')).toHaveText('Running');await expect(page.getByTestId('score')).toHaveText('000000');
});
test('keeps fractional-DPR backing dimensions stable across frames',async({browser})=>{
 const context=await browser.newContext({deviceScaleFactor:4/3,viewport:{width:1440,height:900}}),page=await context.newPage();await page.goto('http://127.0.0.1:4173');
 const value=await page.locator('canvas').evaluate(async(canvas:HTMLCanvasElement)=>{
  await new Promise(requestAnimationFrame);let writes=0;const descriptor=Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype,'width')!;
  Object.defineProperty(canvas,'width',{get(){return descriptor.get!.call(canvas);},set(v){writes++;descriptor.set!.call(canvas,v);},configurable:true});
  for(let i=0;i<5;i++)await new Promise(requestAnimationFrame);
  return {writes,width:canvas.width,dpr:devicePixelRatio};
 });
 expect(value.dpr).toBeCloseTo(4/3,2);expect(value.width).toBe(Math.round(280*value.dpr));expect(value.writes).toBe(0);await context.close();
});
test('returns from browser navigation with working controls',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Start game',exact:true}).click();await page.goto('/?navigation-test=1');await page.goBack();
 const status=await page.getByTestId('status').textContent();
 if(status==='Paused')await page.getByRole('button',{name:'Resume',exact:true}).click();else await page.getByRole('button',{name:'Start game',exact:true}).click();
 await page.keyboard.press('ArrowDown');await expect(page.getByTestId('score')).toHaveText('000001');
 await page.getByRole('button',{name:'Restart',exact:true}).focus();await expect(page.getByTestId('status')).toHaveText('Paused');
});
