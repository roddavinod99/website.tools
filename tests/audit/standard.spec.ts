import { test, expect } from '@playwright/test';
import { runChecks } from './_helpers';
import { allTools } from '../../src/lib/data/tools';

// Indexing policy does not exempt a registered tool from load smoke coverage.
for (const tool of allTools) {
  test(`audit[smoke] ${tool.slug}`, async ({ page }, testInfo) => {
    const results = await runChecks(page, tool.slug);
    await testInfo.attach('smoke-checks', {
      body: JSON.stringify(results), contentType: 'application/json',
    });
    expect(Object.values(results.checks).every(status => status === 'pass'),
      `Load smoke only: ${JSON.stringify(results)}`).toBe(true);
  });
}
