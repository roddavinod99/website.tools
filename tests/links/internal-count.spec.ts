import { test, expect } from '@playwright/test';
import { allTools } from '../../src/lib/data/tools';

const tools = allTools.slice(0, 10);

for (const t of tools) {
  test(`${t.slug} has ≥ 15 outbound internal links`, async ({ page }) => {
    await page.goto(`/tools/${t.slug}`);
    const links = await page.locator('a[href^="/"]').evaluateAll((els) =>
      els.map((e) => e.getAttribute('href')).filter((h): h is string => !!h && !h.startsWith('/api') && !h.startsWith('/_next'))
    );
    const unique = new Set(links);
    expect(unique.size, `expected ≥ 15, got ${unique.size} for ${t.slug}: ${[...unique].slice(0,5).join(', ')}`).toBeGreaterThanOrEqual(15);
  });
}
