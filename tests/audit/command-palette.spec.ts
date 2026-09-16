import { test, expect } from '@playwright/test';
import { dismissCookieConsent } from '../helpers/tool-page';

// P1-06: the search overlay behaves as a ⌘K palette.
test('Ctrl+K opens the palette with footer hints', async ({ page }) => {
  await page.goto('/');
  await dismissCookieConsent(page);
  await page.keyboard.press('Control+k');
  const dialog = page.getByRole('dialog', { name: 'Search tools and guides' });
  await expect(dialog).toBeVisible({ timeout: 10000 });
  await expect(dialog.getByText('navigate', { exact: false })).toBeVisible();
});

test('empty palette shows recently used tools', async ({ page }) => {
  await page.goto('/tools/json-formatter');
  await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible({ timeout: 15000 });
  await page.waitForTimeout(1000); // let recordToolView persist
  await page.goto('/');
  await page.keyboard.press('Control+k');
  const dialog = page.getByRole('dialog', { name: 'Search tools and guides' });
  await expect(dialog).toBeVisible({ timeout: 10000 });
  await expect(dialog.getByText('Recently used', { exact: false })).toBeVisible({ timeout: 10000 });
  await expect(dialog.getByRole('button', { name: /json formatter/i }).first()).toBeVisible();
});

test('no-results state links to full browsing', async ({ page }) => {
  await page.goto('/');
  await dismissCookieConsent(page);
  await page.keyboard.press('Control+k');
  const dialog = page.getByRole('dialog', { name: 'Search tools and guides' });
  await expect(dialog).toBeVisible({ timeout: 10000 });
  await dialog.locator('#search-overlay-input').fill('zxqwjkvv');
  await expect(dialog.getByRole('button', { name: /browse all tools/i })).toBeVisible({ timeout: 10000 });
});

test('typing finds a tool and opens it', async ({ page }) => {
  await page.goto('/');
  await dismissCookieConsent(page);
  await page.keyboard.press('Control+k');
  const dialog = page.getByRole('dialog', { name: 'Search tools and guides' });
  await expect(dialog).toBeVisible({ timeout: 10000 });
  await dialog.locator('#search-overlay-input').fill('base64');
  const first = dialog.locator('[data-search-result]').first();
  await expect(first).toBeVisible({ timeout: 15000 });
  await first.click();
  await expect(page).toHaveURL(/\/tools\/base64/, { timeout: 10000 });
});
