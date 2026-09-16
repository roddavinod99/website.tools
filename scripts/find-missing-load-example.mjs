#!/usr/bin/env node
// @ts-check
// Honest inventory: every registry tool with examples must subscribe to the
// load-example event its page dispatches, or the button is a silent no-op.
// No category exemptions — a visible button that does nothing is a defect
// regardless of tool type. Checks all three subscription hooks with an
// exact slug match.
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readTools } from './lib/audit-helpers.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const allTools = await readTools();
const toolsWithExamples = allTools.filter(
  (t) => Array.isArray(t.examples) && t.examples.length > 0,
);

/** @param {string} dir @returns {Promise<string[]>} */
async function componentFiles(dir) {
  /** @type {string[]} */
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await componentFiles(full)));
    else if (entry.name.endsWith('.tsx')) out.push(full);
  }
  return out;
}

const files = await componentFiles(path.join(root, 'src/components/tools'));
const sources = new Map();
for (const file of files) sources.set(file, await readFile(file, 'utf8'));

const hooks = ['useLoadExample', 'useLoadExampleState', 'usePrefillTool'];
const missing = [];
for (const t of toolsWithExamples) {
  const subscribed = [...sources.values()].some((src) =>
    hooks.some((h) => src.includes(`${h}("${t.slug}"`) || src.includes(`${h}('${t.slug}'`)),
  );
  if (!subscribed) missing.push(`${t.slug} (no ${hooks.join('/')} subscription for its slug)`);
}

if (missing.length) {
  console.error('Tools with examples but no matching subscription:');
  for (const m of missing) console.error('  - ' + m);
  process.exit(1);
}
console.log(`[ok] All ${toolsWithExamples.length} example-bearing tools subscribe to their slug.`);
