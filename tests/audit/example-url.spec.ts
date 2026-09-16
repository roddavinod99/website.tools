import { test, expect } from '@playwright/test';
import { allTools } from '../../src/lib/data/tools';
import { waitForOutput, getToolSection, dismissCookieConsent } from '../helpers/tool-page';

// P1-04 (TDD RED): visiting /tools/<slug>?example=<i> populates an input
// with that registry example and yields output — no click required.
// Assertion scans ALL workspace fields (some tools lead with a secondary
// input, e.g. hash salt) and uses index 1 where the default input already
// matches example 0.
const cases = [
  { slug: 'json-formatter', index: 0 },
  { slug: 'base64', index: 0 },
  { slug: 'hash-generator', index: 0 },
  { slug: 'word-counter', index: 0 },
  { slug: 'case-converter', index: 1 },
] as const;

for (const { slug, index } of cases) {
  test(`?example=${index} populates and runs ${slug}`, async ({ page }) => {
    const tool = allTools.find((t) => t.slug === slug)!;
    const text = (tool.examples as string[])[index];
    await page.goto(`/tools/${slug}?example=${index}`);
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible({ timeout: 15000 });
    await dismissCookieConsent(page);
    await expect
      .poll(
        () =>
          page.locator('#tool-interface-' + slug).evaluate(
            (root, needle) =>
              Array.from(root.querySelectorAll('textarea, input')).some((el) =>
                (el as HTMLInputElement).value.includes(needle),
              ),
            text.slice(0, 24),
          ),
        { timeout: 10000 },
      )
      .toBe(true);
    expect(await waitForOutput(page, getToolSection(page), 8000)).toBe(true);
  });
}
