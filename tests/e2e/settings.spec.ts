import {test,expect} from '@playwright/test';
test('six live controls apply without restart and keep form keys separate',async({page})=>{
 await page.goto('/');await expect(page.locator('#setting-fields').getByRole('combobox')).toHaveCount(6);await page.getByRole('button',{name:'Start game',exact:true}).click();await page.keyboard.press('ArrowDown');await expect(page.getByTestId('score')).toHaveText('000001');
 await page.getByLabel('Ghost visibility',{exact:true}).focus();
 await page.getByLabel('Ghost visibility',{exact:true}).selectOption('hide');await page.getByLabel('Hard drop',{exact:true}).selectOption('off');await page.getByLabel('Next-piece preview',{exact:true}).selectOption('off');await page.getByLabel('Hard-drop locking',{exact:true}).selectOption('immediate');await page.getByLabel('General locking',{exact:true}).selectOption('failedDown');await page.getByLabel('Hold piece',{exact:true}).selectOption('off');
 expect(await page.evaluate(()=>document.activeElement?.tagName)).toBe('SELECT');
 await page.keyboard.press('r');await page.keyboard.press('p');await expect(page.getByTestId('status')).toHaveText('Paused');await expect(page.getByTestId('score')).toHaveText('000001');await expect(page.getByTestId('next-kind')).toHaveText('Hidden');
 await page.getByRole('button',{name:'Resume',exact:true}).click();await page.keyboard.press('Space');await page.keyboard.press('c');await expect(page.getByTestId('score')).toHaveText('000001');await expect(page.getByTestId('held-kind')).toHaveText('—');
 await page.getByRole('button',{name:'Restart',exact:true}).click();await expect(page.getByLabel('Hard drop',{exact:true})).toHaveValue('off');
});
test('settings/help toggles preserve a centered board and required information at desktop and narrow sizes',async({page})=>{
 await page.setViewportSize({width:1280,height:800});await page.goto('/');const board=page.locator('canvas');await page.screenshot({path:test.info().outputPath('settings-1280.png')});
 for(const settings of [true,false])for(const help of [true,false]){
  for(const [name,visible] of [['settings',settings],['help',help]] as const){const toggle=page.getByTestId('toggle-'+name);if((await toggle.getAttribute('aria-expanded'))!==String(visible))await toggle.click();}
  const b=await board.boundingBox();const info=await page.getByRole('region',{name:'Game information',exact:true}).boundingBox();expect(info!.x+info!.width).toBeLessThan(b!.x);expect(info!.y+info!.height).toBeLessThanOrEqual(800);if(settings){const s=await page.locator('#settings').boundingBox();expect(s!.x).toBeGreaterThan(b!.x+b!.width);if(help){const h=await page.locator('#help').boundingBox();expect(h!.x).toBeGreaterThan(s!.x+s!.width);}}expect(Math.abs(b!.x+b!.width/2-640)).toBeLessThanOrEqual(1);await expect(page.getByRole('region',{name:'Game information',exact:true})).toBeVisible();await expect(board).toBeVisible();await expect(page.getByRole('region',{name:'Game settings',exact:true})).toBeVisible({visible:settings});await expect(page.getByRole('region',{name:'Controls and help',exact:true})).toBeVisible({visible:help});
 }
 await page.setViewportSize({width:900,height:800});expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeGreaterThanOrEqual(1280);
});
test('every setting choice is usable and reload retains selected values',async({page})=>{
 await page.goto('/');const choices=[['Ghost visibility',['hide','dynamic','show'],'dynamic'],['Hard drop',['on','off'],'on'],['Next-piece preview',['on','off'],'on'],['Hard-drop locking',['follow','immediate'],'follow'],['General locking',['interval','failedDown'],'interval'],['Hold piece',['on','off'],'on']] as const;
 for(const [label,,value] of choices)await expect(page.getByLabel(label,{exact:true})).toHaveValue(value);
 for(const [label,values] of choices){const field=page.getByLabel(label,{exact:true});await field.focus();for(const value of values){await field.selectOption(value);await expect(field).toHaveValue(value);}}
 await expect(page.locator('#help-hold')).toHaveText('Hold (off)');await expect(page.locator('#help-drop')).toHaveText('Hard drop (off)');await page.reload();for(const [label,values] of choices)await expect(page.getByLabel(label,{exact:true})).toHaveValue(values.at(-1)!);
});
test('native selected immediate and failed-down policies change locking behavior',async({page})=>{
 await page.addInitScript(()=>Object.defineProperty(crypto,'getRandomValues',{value:(a:Uint32Array)=>{a.fill(1);return a;}}));
 await page.goto('/');await page.getByLabel('Hard-drop locking',{exact:true}).selectOption('immediate');await page.getByRole('button',{name:'Start game',exact:true}).click();await expect(page.getByTestId('next-kind')).not.toHaveText('—');let next=await page.getByTestId('next-kind').textContent();await page.keyboard.press('Space');await expect(page.getByTestId('next-kind')).not.toHaveText(next!);
 await page.getByLabel('General locking',{exact:true}).focus();await page.getByLabel('General locking',{exact:true}).selectOption('failedDown');await page.getByLabel('Hard-drop locking',{exact:true}).selectOption('follow');await page.getByRole('button',{name:'Restart',exact:true}).click();await expect(page.getByTestId('score')).toHaveText('000000');next=await page.getByTestId('next-kind').textContent();await page.keyboard.press('Space');await expect(page.getByTestId('next-kind')).toHaveText(next!);await page.keyboard.press('ArrowDown');await expect(page.getByTestId('next-kind')).not.toHaveText(next!);
});
test('ghost controls change actual destination raster at the midline',async({page})=>{
 test.skip(process.env.TEST_PRODUCTION==='1','Controlled board fixtures are development-only.');await page.goto('/');await page.getByRole('button',{name:'Start game',exact:true}).click();await page.getByLabel('Ghost visibility',{exact:true}).focus();
 await page.evaluate(()=>{const c=(window as any).__tetris,board=Array.from({length:20},()=>Array(10).fill(null));board[11][4]='J';c.state={...c.state,status:'paused',board,active:{kind:'O',rotation:0,x:3,y:0},lockAt:null};});
 const pixel=()=>page.locator('canvas').evaluate(async(canvas:HTMLCanvasElement)=>{await new Promise(requestAnimationFrame);return [...canvas.getContext('2d')!.getImageData(4*28+3,9*28+7,1,1).data];});
 await page.getByLabel('Ghost visibility',{exact:true}).selectOption('show');expect(await pixel()).toEqual([237,205,112,255]);for(const value of ['hide','dynamic']){await page.getByLabel('Ghost visibility',{exact:true}).selectOption(value);expect(await pixel()).toEqual([11,17,29,255]);}
});
