#!/usr/bin/env node
import { execSync } from 'node:child_process';
const checks = [];
function check(name, fn) { checks.push({ name, run: fn }); }
check('lint', () => execSync('npm run lint', { stdio: 'pipe' }).toString());
check('typecheck', () => execSync('npm run typecheck', { stdio: 'pipe' }).toString());
check('build', () => execSync('npm run build', { stdio: 'pipe' }).toString());
check('unit', () => execSync('npm run test:unit', { stdio: 'pipe' }).toString());
check('tools', () => execSync('npm run test:tools', { stdio: 'pipe' }).toString());
check('seo', () => execSync('npm run test:seo', { stdio: 'pipe' }).toString());
let failed = 0;
for (const c of checks) {
  const start = Date.now();
  try {
    c.run();
    console.log(`[ok]   ${c.name} (${((Date.now() - start) / 1000).toFixed(1)}s)`);
  } catch (e) {
    console.error(`[fail] ${c.name} (${((Date.now() - start) / 1000).toFixed(1)}s): ${e.message?.slice(0, 200)}`);
    failed++;
  }
}
console.log(`\n${failed === 0 ? '✅' : '❌'} ${checks.length - failed}/${checks.length} checks passed.`);
process.exit(failed === 0 ? 0 : 1);
