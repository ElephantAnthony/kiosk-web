import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('landing page reports actual database readiness', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('스스로 주문');
  await expect(page.getByRole('status')).toHaveText('서버 및 데이터베이스 연결 정상');
  await page.getByRole('button', { name: '연결 다시 확인' }).click();
  await expect(page.getByRole('status')).toHaveText('서버 및 데이터베이스 연결 정상');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')).toEqual([]);
});
