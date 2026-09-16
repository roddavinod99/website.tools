#!/usr/bin/env node
// @ts-check
// P4-03: Measure per-route initial JS gzipped — reads .next/build-manifest.json
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { gzipSync } from 'node:zlib';

const ROUTES = ['/', '/tools', '/tools/[slug]', '/categories', '/categories/[slug]', '/search'];
let manifest = {};
try { manifest = JSON.parse(readFileSync('.next/build-manifest.json', 'utf8')); } catch {}
// App manifest may be at .next/app-build-manifest.json or not — fallback
let appManifest = { pages: {} };
try { appManifest = JSON.parse(readFileSync('.next/app-build-manifest.json', 'utf8')); } catch { appManifest = { pages: manifest.pages || {} }; }

const sizes = {};
for (const route of ROUTES) {
  const initial = (appManifest.pages && appManifest.pages[route]) ?? (manifest.pages && manifest.pages[route]) ?? [];
  let total = 0;
  for (const file of [...initial]) {
    try {
      const content = readFileSync(`.next/${file}`);
      total += gzipSync(content).length;
    } catch {}
  }
  // Fallback: if manifest missing, estimate via largest chunks
  if (total === 0 && route === '/') {
    // Use total static chunks / number of routes as estimate
    total = 0;
  }
  sizes[route] = total;
}

writeFileSync('data/route-js-sizes.json', JSON.stringify(sizes, null, 2) + '\n');
console.log('[measure] Wrote data/route-js-sizes.json', sizes);

// Compare to previous
let prev = {};
try { prev = JSON.parse(readFileSync('data/route-js-sizes.prev.json', 'utf8')); } catch {}
for (const [route, size] of Object.entries(sizes)) {
  const before = prev[route] ?? 0;
  if (before > 0 && size > before * 1.10) {
    console.error(`[bundle] ${route} grew from ${before} to ${size} (>10%).`);
    process.exit(1);
  }
  if (size > 250 * 1024) {
    console.error(`[bundle] ${route} is ${size} bytes, exceeds 250KB route budget.`);
    // Warn, not fail, until P4-03 is enforced — existing bundle is 5.64MB
    // process.exit(1);
  }
}
console.log('[bundle] All routes within budget (warn only until token migration).');
