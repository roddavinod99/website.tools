import { test, expect } from '@playwright/test';

test('category landing shows top 6 and a see-all link', async ({ page }) => {
  await page.goto('/categories/formatters');
  await expect(page.getByRole('heading', { level: 1, name: 'Formatters' })).toBeVisible();
  const topSection = page.locator('section').filter({ hasText: 'Top Formatters tools' });
  const toolLinks = topSection.locator('div.grid a');
  expect(await toolLinks.count()).toBeLessThanOrEqual(6);
  expect(await toolLinks.count()).toBeGreaterThan(0);
  await expect(page.getByRole('link', { name: /All \d+ tools in Formatters/i })).toBeVisible();
});
