import { test, expect } from '@playwright/test';

test('mega-menu opens on hover and lists categories', async ({ page }) => {
  await page.goto('/');
  const trigger = page.getByRole('button', { name: /categories/i }).first();
  await trigger.hover();
  const menu = page.getByRole('menu', { name: /categories/i });
  await expect(menu).toBeVisible();
  const items = menu.getByRole('menuitem');
  expect(await items.count()).toBeGreaterThanOrEqual(4);
});
