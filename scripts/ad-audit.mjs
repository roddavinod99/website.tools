#!/usr/bin/env node
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
const toolsDir = 'src/app/tools';
let count = 0;
for (const file of readdirSync(toolsDir).filter((f) => f.endsWith('.tsx'))) {
  const src = readFileSync(join(toolsDir, file), 'utf8');
  const ads = (src.match(/<Ad[A-Z]/g) || []).length;
  if (ads > 0) {
    console.error(`[ad-audit] ${file} has ${ads} ad(s) inline. Tool UI must be ad-free.`);
    count++;
  }
}
if (count) { console.error(`[ad-audit] ${count} tool file(s) with inline ads.`); process.exit(1); }
console.log('[ad-audit] No inline ads in tool UI.');
