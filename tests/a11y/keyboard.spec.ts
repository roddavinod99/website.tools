import { test, expect } from '@playwright/test';

const pages = ['/', '/tools/json-formatter', '/categories/formatters', '/tools', '/search?q=json'];

for (const url of pages) {
  test(`keyboard reaches all actions on ${url}`, async ({ page }) => {
    await page.goto(url);
    const reached = new Set<string>();
    for (let i = 0; i < 30; i++) {
      await page.keyboard.press('Tab');
      const info = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return null;
        return `${el.tagName}:${el.getAttribute('aria-label') ?? el.textContent?.trim()?.slice(0,30) ?? ''}`;
      });
      if (info) reached.add(info);
    }
    expect(reached.size, JSON.stringify([...reached])).toBeGreaterThanOrEqual(5);
  });
}
