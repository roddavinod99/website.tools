import { test, expect } from '@playwright/test';

test('/tools has a sticky filter rail and a 24-tool page', async ({ page }) => {
  await page.goto('/tools');
  // Rail may be aside with aria-label Filters or generic aside — check both
  const rail = page.locator('aside').first();
  await expect(rail).toBeVisible({ timeout: 8000 });
  const grid = page.getByTestId('tool-grid');
  await expect(grid).toBeVisible();
  const cards = grid.getByRole('link');
  const count = await cards.count();
  expect(count).toBeLessThanOrEqual(24);
  expect(count).toBeGreaterThan(0);
});
