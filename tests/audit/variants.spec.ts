import { test, expect, type Locator } from '@playwright/test';
import { dismissCookieConsent } from '../helpers/tool-page';

// Fills that survive controlled-input hydration: if the value is wiped by a
// late hydration commit, fill once more before asserting.
async function fillStable(locator: Locator, value: string): Promise<void> {
  await locator.fill(value);
  try {
    await expect(locator).toHaveValue(value, { timeout: 3000 });
  } catch {
    await locator.fill(value);
    await expect(locator).toHaveValue(value, { timeout: 5000 });
  }
}

// P1-11: per-variant interaction flows on representative tools.
test('generator produces records on demand', async ({ page }) => {
  await page.goto('/tools/uuid-generator');
  await dismissCookieConsent(page);
  const btn = page.getByRole('button', { name: /generate/i }).first();
  await expect(btn).toBeVisible({ timeout: 15000 });
  await btn.click();
  const section = page.locator('#tool-interface-uuid-generator');
  await expect(section).toContainText(/[0-9a-f]{8}-[0-9a-f]{4}/i, { timeout: 8000 });
});

test('image tool renders a generated code on canvas', async ({ page }) => {
  await page.goto('/tools/qr-generator');
  await dismissCookieConsent(page);
  // Hydration gate: example buttons enable only after the tool subscribes;
  // filling before that gets wiped by the hydration commit.
  await expect(page.getByRole('button', { name: /load example 1/i }).first()).toBeEnabled({ timeout: 15000 });
  const input = page.locator('#tool-interface-qr-generator').locator('textarea, input[type="text"]').first();
  await fillStable(input, 'https://tools.devstackio.com');
  await expect(page.locator('#tool-interface-qr-generator img[alt="QR Code"]').first()).toBeVisible({ timeout: 15000 });
});

test('calculator computes live from inputs', async ({ page }) => {
  await page.goto('/tools/bmi-calculator');
  await dismissCookieConsent(page);
  await expect(page.getByRole('button', { name: /load example 1/i }).first()).toBeEnabled({ timeout: 15000 });
  const height = page.getByTestId('bmi-height');
  await fillStable(height, '180');
  await fillStable(page.getByTestId('bmi-weight'), '75');
  await expect(page.locator('#tool-interface-bmi-calculator')).toContainText(/23\./, { timeout: 8000 });
});

test('diff tool reports identical inputs without empty output', async ({ page }) => {
  await page.goto('/tools/diff-checker');
  await dismissCookieConsent(page);
  const areas = page.locator('#tool-interface-diff-checker textarea');
  await expect(areas.first()).toBeVisible({ timeout: 15000 });
  await areas.nth(0).fill('same text');
  await areas.nth(1).fill('same text');
  const section = page.locator('#tool-interface-diff-checker');
  await expect(section).not.toBeEmpty({ timeout: 8000 });
});

test('server lookup page loads with usable input', async ({ page }) => {
  await page.goto('/tools/dns-lookup');
  await dismissCookieConsent(page);
  const input = page.locator('#tool-interface-dns-lookup').locator('textarea, input[type="text"]').first();
  await expect(input).toBeVisible({ timeout: 15000 });
});
