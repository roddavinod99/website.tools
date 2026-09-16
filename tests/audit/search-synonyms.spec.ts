import { test, expect } from '@playwright/test';
import { dismissCookieConsent } from '../helpers/tool-page';

// P1-05: synonym expansion surfaces image tools for "photo" (a term with no
// direct tool match — proven against the shipped index before the change).
test('synonym photo finds image tools', async ({ page }) => {
  await page.goto('/search?q=photo');
  await dismissCookieConsent(page);
  const link = page.locator('a[href="/tools/placeholder-image"]').first();
  await expect(link).toBeVisible({ timeout: 15000 });
});

// Control: exact-name search keeps working after the merge change.
test('exact search still ranks the tool first', async ({ page }) => {
  await page.goto('/search?q=json+formatter');
  await dismissCookieConsent(page);
  const link = page.locator('a[href="/tools/json-formatter"]').first();
  await expect(link).toBeVisible({ timeout: 15000 });
});
