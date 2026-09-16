import { test, expect } from '@playwright/test';
import { allTools } from '../../src/lib/data/tools';

// P1-02: privacy promise renders as a single row below the H1, not in a card.
const tools = allTools.filter((t) => !t.noindex).slice(0, 5);

for (const t of tools) {
  test(`trust pills below H1 for ${t.slug}`, async ({ page }) => {
    await page.goto(`/tools/${t.slug}`);
    const h1 = page.getByRole('heading', { level: 1 });
    const pills = page.getByRole('list', { name: 'Privacy guarantees' });
    await expect(h1).toBeVisible({ timeout: 15000 });
    await expect(pills).toBeVisible({ timeout: 15000 });
    const h1Box = await h1.boundingBox();
    const pillsBox = await pills.boundingBox();
    expect(h1Box && pillsBox && pillsBox.y > h1Box.y, 'pills should be below H1').toBeTruthy();
    // No card chrome around the pills
    expect(await pills.evaluate((el) => el.className.includes('rounded'))).toBe(false);
  });
}
