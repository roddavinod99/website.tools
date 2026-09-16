import { test, expect } from '@playwright/test';
import { allTools } from '../../src/lib/data/tools';
import { dismissCookieConsent } from '../helpers/tool-page';

// P1-07: above the fold communicates value + search + trending + trust.
test('hero has H1, search, trending chips, and registry-driven trust line', async ({ page }) => {
  await page.goto('/');
  await dismissCookieConsent(page);
  const h1 = page.getByRole('heading', { level: 1 }).first();
  await expect(h1).toBeVisible({ timeout: 15000 });
  await expect(h1).toContainText(/developer tools/i);

  const searchbox = page.getByRole('combobox', { name: 'Search developer tools' });
  await expect(searchbox).toBeVisible({ timeout: 10000 });

  const trending = page.getByRole('navigation', { name: /trending/i });
  await expect(trending).toBeVisible({ timeout: 10000 });
  expect(await trending.getByRole('link').count()).toBeGreaterThanOrEqual(6);

  // Trust line reflects the registry, never a hardcoded stale count.
  await expect(page.getByText(`${allTools.length}+ tools`, { exact: false }).first()).toBeVisible({ timeout: 10000 });
  await expect(page.getByText('165+ tools', { exact: false })).toHaveCount(0);
});

test('hero search expands synonyms', async ({ page }) => {
  await page.goto('/');
  await dismissCookieConsent(page);
  // Hydration + worker readiness is signaled by the live placeholder; typing
  // before that gets wiped by controlled-input hydration.
  const searchbox = page.locator('#tool-search[placeholder="Search developer tools..."]');
  await expect(searchbox).toBeVisible({ timeout: 15000 });
  await searchbox.fill('photo');
  const listbox = page.getByRole('listbox', { name: 'Search results' });
  await expect(listbox).toBeVisible({ timeout: 15000 });
  await expect(listbox.getByRole('button', { name: /image/i }).first()).toBeVisible({ timeout: 10000 });
});
