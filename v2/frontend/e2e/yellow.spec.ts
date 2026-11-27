import { test, expect } from '@playwright/test';
test('yellow cafe shows original product art, paging and category navigation',async({page})=>{
  await page.goto('/');
  await page.getByRole('button',{name:/옐로 카페/}).click();
  await page.getByRole('button',{name:'메뉴 선택 시작'}).click();
  await expect(page.locator('.yellow-grid button')).toHaveCount(12);
  await expect(page.locator('.yellow-grid svg')).toHaveCount(12);
  await page.getByRole('button',{name:'다음 메뉴 페이지'}).click();
  await expect(page.locator('.yellow-grid button')).toHaveCount(1);
  await page.getByRole('group',{name:'메뉴 카테고리'}).getByRole('button',{name:'커피',exact:true}).click();
  await expect(page.getByRole('button',{name:/아메리카노 \(ICE\)/})).toBeVisible();
  await expect(page.getByRole('button',{name:'이전 메뉴 페이지'})).toBeDisabled();
});
