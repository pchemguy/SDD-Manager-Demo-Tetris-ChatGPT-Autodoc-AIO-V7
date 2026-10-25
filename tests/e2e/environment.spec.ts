import {test,expect} from '@playwright/test';
test('two isolated contexts render Canvas and receive native input',async({browser})=>{
  for(let i=0;i<2;i++) {
    const context=await browser.newContext();
    const page=await context.newPage();
    await page.goto('http://127.0.0.1:4173');
    await page.getByRole('button',{name:'Harness input'}).click();
    await expect(page.getByRole('button',{name:'Input received'})).toBeVisible();
    const pixels=await page.locator('canvas').evaluate((canvas:HTMLCanvasElement)=>{
      const c=canvas.getContext('2d')!;
      return {red:Array.from(c.getImageData(2,2,1,1).data),glyph:c.getImageData(0,30,150,35).data.some((value,i)=>i%4===3&&value>0)};
    });
    expect(pixels.red).toEqual([232,76,85,255]);expect(pixels.glyph).toBe(true);
    await page.screenshot({path:`test-results/environment-${browser.browserType().name()}-${i}.png`});
    await context.close();
  }
});
