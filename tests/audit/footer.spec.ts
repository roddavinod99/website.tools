import { test, expect } from '@playwright/test';

test('footer has 3 columns and no card wrapper', async ({ page }) => {
  await page.goto('/');
  const footer = page.locator('footer');
  await expect(footer).toBeVisible();
  const lists = footer.getByRole('list');
  expect(await lists.count()).toBeGreaterThanOrEqual(3);
  // No card class on the footer or its sections — checks rounded/card
  expect(await footer.evaluate((el) => el.className.includes('rounded'))).toBe(false);
  // Should have border-top per spec
  const borderTop = await footer.evaluate((el) => getComputedStyle(el).borderTopWidth);
  expect(borderTop).not.toBe('0px');
});
