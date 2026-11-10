import {test,expect} from '@playwright/test';
test('production installs its offline shell and retains the local record',async({page,context})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173');
 await page.evaluate(async()=>{await navigator.serviceWorker.ready;localStorage.setItem('equilibrio.record','1200');});
 await page.reload();await expect(page.locator('.record').first()).toHaveText('01200');
 await expect.poll(()=>page.evaluate(async()=>{const cache=await caches.open('equilibrio-v1');const keys=await cache.keys();return keys.filter(k=>k.url.includes('/assets/')).length;})).toBeGreaterThanOrEqual(2);
 await context.setOffline(true);await page.reload();
 await expect(page.getByRole('button',{name:'COMEÇAR A JOGAR'})).toBeVisible();await page.getByRole('button',{name:'COMEÇAR A JOGAR'}).click();await expect(page.locator('#overlay')).toBeHidden();
 expect(errors).toEqual([]);await context.setOffline(false);
});
