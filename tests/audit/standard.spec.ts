import { test, expect } from '@playwright/test';
import { detectVariant, runChecks, summarize } from './_helpers';
import { allTools } from '../../src/lib/data/tools';

const tools = allTools.filter((t) => !t.noindex).slice(0, 5);

for (const tool of tools) {
  test(`audit[standard] ${tool.slug}`, async ({ page }) => {
    const variant = detectVariant(tool.slug, tool.keywords);
    await page.goto(`/tools/${tool.slug}`);
    const results = await runChecks(page, variant);
    expect.soft(summarize(results), `audit results: ${JSON.stringify(results)}`).not.toBe('fail');
  });
}
