import { test, expect } from '@playwright/test';

test('guide page wraps content in Prose', async ({ page }) => {
  await page.goto('/guides/concepts/json-basics');
  await expect(page.locator('article.prose')).toBeVisible();
});

test('blog page wraps content in Prose', async ({ page }) => {
  await page.goto('/blog/base64-encode-decode-online');
  await expect(page.locator('article.prose')).toBeVisible();
});
