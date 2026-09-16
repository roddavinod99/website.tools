import { test, expect } from '@playwright/test';
import { dismissCookieConsent } from '../helpers/tool-page';

// P1-08: homepage carries every discoverability section in one scroll.
test('homepage sections all render', async ({ page }) => {
  await page.goto('/');
  await dismissCookieConsent(page);
  for (const id of ['#categories-heading', '#featured-heading', '#recent-heading', '#conversions-heading', '#learning-heading', '#trending-heading']) {
    await expect(page.locator(id).first()).toBeVisible({ timeout: 15000 });
  }
  // Conversions rail is dense text rows, each linking to a tool.
  const railLinks = page.locator('section[aria-labelledby="conversions-heading"] a[href^="/tools/"]');
  expect(await railLinks.count()).toBeGreaterThanOrEqual(10);
});
