import {test,expect} from '@playwright/test';
test('desktop starts, keyboard drives the rail, and pause/restart work',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setViewportSize({width:1440,height:1080});await page.goto('/');
 await expect(page.getByRole('heading',{name:'O equilíbrio está nas suas mãos.'})).toBeVisible();
 await page.screenshot({path:'test-results/desktop-start.png'});
 await page.getByRole('button',{name:'Como jogar',exact:true}).click();await expect(page.getByText('Dois dedos.',{exact:false})).toBeVisible();await page.getByRole('button',{name:'ENTENDI'}).click();
 await page.getByRole('button',{name:'COMEÇAR A JOGAR'}).click();
 await expect(page.locator('#overlay')).toBeHidden();
 const before=await page.locator('canvas').evaluate((c:HTMLCanvasElement)=>c.toDataURL());
 await page.keyboard.down('w');await page.keyboard.down('ArrowUp');await page.waitForTimeout(500);await page.keyboard.up('w');await page.keyboard.up('ArrowUp');
 const after=await page.locator('canvas').evaluate((c:HTMLCanvasElement)=>c.toDataURL());expect(after).not.toBe(before);
 await page.getByRole('button',{name:'Pausar jogo'}).click();await expect(page.getByText('A partida está pausada.',{exact:false})).toBeVisible();await page.getByRole('button',{name:'REINICIAR PARTIDA'}).click();
 await expect(page.locator('#score')).toHaveText('00000');
 await page.getByRole('button',{name:'Como jogar',exact:true}).click();await expect(page.getByText('Dois dedos.',{exact:false})).toBeVisible();await page.getByRole('button',{name:'ENTENDI'}).click();
 await page.screenshot({path:'test-results/desktop-play.png'});expect(errors).toEqual([]);
});
test('iPhone layout has no overflow, supports simultaneous touch and cancels gestures',async({browser})=>{
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:3});const page=await context.newPage();
 await page.goto('/');await page.getByRole('button',{name:'COMEÇAR A JOGAR'}).click();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 const rects=await Promise.all(['left','right'].map(id=>page.locator('#'+id).boundingBox()));
 for(let i=0;i<2;i++) {const r=rects[i]!;expect(r.y+r.height).toBeLessThanOrEqual(844);}
 const session=await context.newCDPSession(page);
 const points=rects.map((r,i)=>({x:r!.x+r!.width/2,y:r!.y+r!.height/2-26,id:i+1}));
 await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:points});await page.waitForTimeout(400);
 for(const id of ['left','right'])expect(await page.locator('#'+id+' .stick').evaluate(e=>getComputedStyle(e).transform)).not.toBe('matrix(1, 0, 0, 1, 0, 0)');
 await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 for(const id of ['left','right'])await expect.poll(()=>page.locator('#'+id+' .stick').evaluate(e=>getComputedStyle(e).transform)).toBe('matrix(1, 0, 0, 1, 0, 0)');
 await page.screenshot({path:'test-results/iphone-play.png'});await context.close();
});
test('compact iPhone keeps controls in view',async({page})=>{await page.setViewportSize({width:375,height:667});await page.goto('/');const r=await page.locator('#left').boundingBox();expect(r!.y+r!.height).toBeLessThanOrEqual(667);await page.screenshot({path:'test-results/iphone-small.png'});});
