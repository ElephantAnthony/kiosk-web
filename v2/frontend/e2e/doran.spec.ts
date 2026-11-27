import { test,expect } from '@playwright/test';
test('doran meal practice follows the server mission and captures each stage',async({page})=>{
 await page.setViewportSize({width:800,height:1400});await page.goto('/');
 const button=(name:string)=>page.getByRole('button',{name});
 const capture=async(name:string)=>{const path=test.info().outputPath(name+'.jpg');await page.screenshot({path,type:'jpeg',quality:85,fullPage:true});await test.info().attach(name,{path,contentType:'image/jpeg'});};
 await button('도란 버거 키오스크').click();await expect(button('포장하기')).toBeVisible();await capture('doran-start');await button('포장하기').click();
 await expect(page.locator('.doran-grid button')).toHaveCount(9);await capture('doran-menu');
 await page.locator('.doran-grid button').filter({has:page.getByText('더블베이컨 버거',{exact:true})}).click();await capture('doran-detail');
 await page.locator('.doran-mode-grid button').filter({hasText:'세트'}).click();await button('세트 구성 선택').click();await button('감자튀김 L').click();await button('제로콜라 M').click();await capture('doran-customize');await button('장바구니 담기').click();await button('메뉴 추가').click();await page.getByRole('group',{name:'메뉴 카테고리'}).getByRole('button',{name:'사이드',exact:true}).click();await button('치즈스틱').click();await button('장바구니 담기').click();await expect(page.locator('.yellow-totals')).toContainText('12,900원');await capture('doran-cart');await button('결제하기').click();await button('카드 결제').click();await capture('doran-payment');await button('결제하기').click();await capture('doran-terminal');await button('모의 결제 완료').click();await expect(page.getByText('주문이 완료되었습니다')).toBeVisible();await capture('doran-complete');await button('연습 결과 확인').click();await expect(page.locator('.score strong')).toHaveText('100%');
});
