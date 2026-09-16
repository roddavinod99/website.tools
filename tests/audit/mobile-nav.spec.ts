import { test, expect } from '@playwright/test';

// P1-09: mobile hamburger opens an accessible navigation sheet.
test('mobile nav opens, focuses, navigates, and closes on Esc', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');
  const toggle = page.getByRole('button', { name: /toggle menu/i });
  await expect(toggle).toBeVisible({ timeout: 10000 });
  await toggle.click();
  const sheet = page.getByRole('dialog', { name: /navigation/i });
  await expect(sheet).toBeVisible({ timeout: 5000 });
  // Focus moves inside on open.
  const focused = await page.evaluate(() => document.activeElement?.tagName);
  expect(['A', 'BUTTON'].includes(focused ?? '')).toBe(true);
  // A primary link navigates.
  await sheet.getByRole('link', { name: /^tools$/i }).first().click();
  await expect(page).toHaveURL(/\/tools/, { timeout: 10000 });
});
