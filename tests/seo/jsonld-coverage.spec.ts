import { test, expect } from '@playwright/test';
import { allTools } from '../../src/lib/data/tools';

const tools = allTools.slice(0, 10);

for (const t of tools) {
  test(`tool ${t.slug} emits SoftwareApplication and BreadcrumbList JSON-LD`, async ({ page }) => {
    await page.goto(`/tools/${t.slug}`);
    const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
    const all = scripts.join('');
    expect(all, 'SoftwareApplication').toContain('"@type":"SoftwareApplication"');
    expect(all, 'BreadcrumbList').toContain('"@type":"BreadcrumbList"');
  });
}
