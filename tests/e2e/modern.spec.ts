import {test,expect} from '@playwright/test';
test('Hold consumes next once and preserves its once-per-piece restriction',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Start game',exact:true}).click();
 const next=await page.getByTestId('next-kind').textContent();await expect(page.getByTestId('held-kind')).toHaveText('—');await page.keyboard.press('c');
 await expect(page.getByTestId('held-kind')).not.toHaveText('—');await expect(page.getByTestId('next-kind')).not.toHaveText(next!);
 const held=await page.getByTestId('held-kind').textContent(),upcoming=await page.getByTestId('next-kind').textContent();await page.keyboard.press('c');await expect(page.getByTestId('held-kind')).toHaveText(held!);await expect(page.getByTestId('next-kind')).toHaveText(upcoming!);
});
