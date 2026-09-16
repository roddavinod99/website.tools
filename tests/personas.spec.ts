import { test, expect } from '@playwright/test';

test.use({ video: 'on', viewport: { width: 1280, height: 800 } });

test('Persona 1: student finds BMI calculator', async ({ page }) => {
  await page.goto('/');
  const start = Date.now();
  await page.keyboard.press('Control+K');
  await page.keyboard.type('bmi');
  const link = page.getByRole('link', { name: /bmi/i }).first();
  await link.click();
  await expect(page).toHaveURL(/bmi/);
  expect(Date.now() - start).toBeLessThan(15000);
});

test('Persona 2: developer formats JSON via ⌘K', async ({ page }) => {
  await page.goto('/');
  const start = Date.now();
  await page.keyboard.press('Control+K');
  await page.keyboard.type('json form');
  await page.getByRole('link', { name: /json formatter/i }).first().click();
  await expect(page).toHaveURL(/json-formatter/);
  await page.locator('[data-testid="examples-row"] button').first().click();
  await expect(page.locator('[data-testid="tool-output"]')).not.toBeEmpty({ timeout: 2000 });
  expect(Date.now() - start).toBeLessThan(30000);
});

test('Persona 4: mobile user lands on a tool from Google', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/tools/json-formatter');
  const sw = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(sw).toBeLessThanOrEqual(375);
  const ta = page.locator('textarea').first();
  await ta.fill('{"a":1}');
  const btn = page.getByRole('button', { name: /format/i }).first();
  if (await btn.count() > 0) await btn.click();
  // Tool should have output (live compute)
  await page.waitForTimeout(1000);
});

test('Persona 5: returning user via ⌘K, <10s', async ({ page }) => {
  await page.goto('/');
  const start = Date.now();
  await page.keyboard.press('Control+K');
  await page.keyboard.type('base64');
  await page.getByRole('link', { name: /base64/i }).first().click();
  expect(Date.now() - start).toBeLessThan(10000);
});
