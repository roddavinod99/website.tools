import { test, expect } from '@playwright/test';
import { allTools } from '../../src/lib/data/tools';
import { waitForOutput, getToolSection, dismissCookieConsent } from '../helpers/tool-page';

// P1-03: clicking Example 1 populates the input AND yields visible output
// (live-compute tools) without requiring a further click. Buttons are gated
// on tool readiness, so wait for enabled before clicking.
const tools = allTools.filter(
  (t) => Array.isArray(t.examples) && t.examples.length > 0,
);

for (const t of tools) {
  test(`example 1 produces output for ${t.slug}`, async ({ page }) => {
    await page.goto(`/tools/${t.slug}`);
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible({ timeout: 15000 });
    await dismissCookieConsent(page);
    const btn = page.getByRole('button', { name: /load example 1/i }).first();
    await expect(btn).toBeEnabled({ timeout: 15000 });
    await btn.click();
    const section = getToolSection(page);
    expect(await waitForOutput(page, section, 8000)).toBe(true);
  });
}
