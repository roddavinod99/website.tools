import { test, expect } from '@playwright/test';

const targets = [
  { name: 'homepage-light', url: '/', theme: 'light' as const },
  { name: 'homepage-dark', url: '/', theme: 'dark' as const },
  { name: 'tool-light', url: '/tools/json-formatter', theme: 'light' as const },
  { name: 'tool-dark', url: '/tools/json-formatter', theme: 'dark' as const },
];

for (const t of targets) {
  test(`snapshot ${t.name}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: t.theme });
    await page.goto(t.url);
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot(`${t.name}.png`, { fullPage: true, maxDiffPixelRatio: 0.01 });
  });
}
