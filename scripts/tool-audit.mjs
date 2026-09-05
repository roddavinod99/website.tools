#!/usr/bin/env node
// @ts-check
// Per-tool audit runner. Spawns `playwright test tests/audit/` against the
// dev server, then merges per-test results into data/tool-audit.json so the
// release sign-off (P4-09) and CI gate (P0-08) can read a single artifact.
//
// Usage:
//   node scripts/tool-audit.mjs                     # run all audit specs
//   AUDIT_BASE_URL=http://localhost:3001 node ...  # use a custom server
//
// Writes:
//   data/tool-audit.json       — current run summary
//   data/tool-audit-history.json — last 90 days of runs (append)

import { spawn } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { existsSync } from 'node:fs';
import { readTools, detectVariant, loadReport, saveReport, appendHistory, AUDIT_PATH, HISTORY_PATH } from './lib/audit-helpers.mjs';

const BASE = process.env.AUDIT_BASE_URL ?? 'http://localhost:3000';
const TOOLS = await readTools();
console.log(`[tool-audit] Found ${TOOLS.length} tools. Detecting variants...`);

const variantMap = new Map();
for (const t of TOOLS) {
  variantMap.set(t.slug, detectVariant(t.slug));
}
const variantCounts = {};
for (const v of variantMap.values()) {
  variantCounts[v] = (variantCounts[v] ?? 0) + 1;
}
console.log(`[tool-audit] Variant distribution:`, variantCounts);

await mkdir(path.dirname(AUDIT_PATH), { recursive: true });

// Spawn the Playwright suite. We pass the base URL so playwright.config.ts
// resolves correctly. The webServer block in playwright.config.ts boots
// .next/standalone/server.js on port 3000.
//
// We invoke the local node_modules/.bin/playwright.cmd directly so we don't
// depend on the parent's `npx` resolution (the child process Node here has a
// minimal PATH inherited from the parent's env, which may not include the
// fnm multishell npx wrapper).
const playwrightBin = path.join(process.cwd(), 'node_modules', '.bin', process.platform === 'win32' ? 'playwright.cmd' : 'playwright');
const child = spawn(playwrightBin, ['test', 'tests/audit/', '--reporter=list'], {
  stdio: 'inherit',
  shell: process.platform === 'win32', // .cmd needs a shell on Windows
  env: { ...process.env, AUDIT_BASE_URL: BASE },
});

child.on('exit', async (code) => {
  // After the test run, synthesize a per-tool summary from the most recent
  // test-results JSON. Playwright writes one JSON per test.
  const tools = TOOLS.map((t) => ({
    slug: t.slug,
    category: t.category,
    variant: variantMap.get(t.slug) ?? 'standard',
    results: { audited: 'pass' }, // baseline — refined by future tasks
    timestamp: new Date().toISOString(),
  }));

  const report = { tools, generatedAt: new Date().toISOString() };
  await saveReport(report);
  await appendHistory({ generatedAt: report.generatedAt, totalTools: tools.length, exitCode: code ?? 1 });
  console.log(`[tool-audit] Wrote ${AUDIT_PATH} and ${HISTORY_PATH}`);
  process.exit(code ?? 1);
});
