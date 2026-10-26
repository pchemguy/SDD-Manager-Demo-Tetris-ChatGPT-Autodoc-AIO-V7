/** Native browser acceptance for environment. */
import {test,expect} from '@playwright/test';
test('two isolated contexts render playable Canvas and native buttons',async({browser})=>{
 for(let i=0;i<2;i++){
  const context=await browser.newContext({viewport:{width:1440,height:900}}),page=await context.newPage();
  await page.goto('http://127.0.0.1:4173');await page.getByRole('button',{name:'Start game',exact:true}).click();
  await expect(page.getByTestId('status')).toHaveText('Running');
  const rendered=await page.locator('canvas').evaluate((c:HTMLCanvasElement)=>Array.from(c.getContext('2d')!.getImageData(0,0,c.width,c.height).data).some((v,i)=>i%4!==3&&v>120));expect(rendered).toBe(true);
  await page.getByRole('button',{name:'Pause',exact:true}).click();await expect(page.getByTestId('status')).toHaveText('Paused');
  await page.screenshot({path:`test-results/classic-${browser.browserType().name()}-${i}.png`});await context.close();
 }
});
