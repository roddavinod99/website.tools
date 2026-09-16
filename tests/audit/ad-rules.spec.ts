import { test, expect } from '@playwright/test';
import { allTools } from '../../src/lib/data/tools';
const tools = allTools.filter((t) => !t.noindex).slice(0, 10);
for (const t of tools) {
  test(`${t.slug} has ≤ 2 in-content ads and no above-the-fold ad`, async ({ page }) => {
    await page.goto(`/tools/${t.slug}`);
    const ads = await page.locator('[data-testid^="ad-"]').count();
    expect(ads, `tool ${t.slug} has ${ads} ads, expected ≤ 2`).toBeLessThanOrEqual(2);
    const firstAd = page.locator('[data-testid^="ad-"]').first();
    if (await firstAd.count() > 0) {
      const h1Box = await page.getByRole('heading', { level: 1 }).boundingBox();
      const adBox = await firstAd.boundingBox();
      if (h1Box && adBox) {
        expect(adBox.y, `first ad at ${adBox.y} is above the fold (H1 at ${h1Box.y})`).toBeGreaterThan(h1Box.y + 200);
      }
    }
  });
}
