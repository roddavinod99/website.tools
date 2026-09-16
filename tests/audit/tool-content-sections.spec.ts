import { test, expect } from '@playwright/test';
import { dismissCookieConsent } from '../helpers/tool-page';

// P1-10: long-form tool content uses native collapsibles; How to Use is open
// by default, Examples is closed by default (spec §4.1).
for (const section of ['How to Use', 'Examples']) {
  test(`"${section}" renders as a collapsible on json-formatter`, async ({ page }) => {
    await page.goto('/tools/json-formatter');
    await dismissCookieConsent(page);
    const details = page.locator('details', { has: page.locator('summary', { hasText: section }) });
    await expect(details.locator('summary').first()).toBeVisible({ timeout: 15000 });
    if (section === 'How to Use') {
      await expect(details).toHaveAttribute('open', '');
    } else {
      await expect(details).not.toHaveAttribute('open', '');
    }
  });
}
