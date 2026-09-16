#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
if (!existsSync('data/tool-audit.json')) {
  console.error('[dashboard] No tool-audit.json. Run `npm run audit:tools` first.');
  process.exit(1);
}
const report = JSON.parse(readFileSync('data/tool-audit.json', 'utf8'));
const tools = report.tools ?? report;
const byCat = {}, byVar = { pass: 0, fail: 0, warn: 0 };
for (const t of tools) {
  byCat[t.category] = byCat[t.category] ?? { pass: 0, fail: 0, warn: 0 };
  const sum = (r) => Object.values(r).includes('fail') ? 'fail' : Object.values(r).includes('warn') ? 'warn' : 'pass';
  const s = sum(t.results);
  byCat[t.category][s]++;
  byVar[s] = (byVar[s] ?? 0) + 1;
}
try { mkdirSync('public/admin', { recursive: true }); } catch {}
writeFileSync('public/admin/audit.html', `<!doctype html>
<html><head><meta charset="utf-8"><title>Tool audit</title>
<style>body{font-family:system-ui;padding:24px}table{border-collapse:collapse;width:100%}td,th{padding:6px 12px;border:1px solid #ddd;text-align:left}.pass{color:green}.fail{color:red}.warn{color:#c08400}</style>
</head><body>
<h1>Tool audit</h1>
<p>${tools.length} tools. ${byVar.pass} pass, ${byVar.fail} fail, ${byVar.warn} warn.</p>
<h2>By category</h2>
<table><tr><th>Category</th><th>Pass</th><th>Fail</th><th>Warn</th></tr>
${Object.entries(byCat).map(([c, v]) => `<tr><td>${c}</td><td class="pass">${v.pass}</td><td class="fail">${v.fail}</td><td class="warn">${v.warn}</td></tr>`).join('')}
</table>
<h2>By tool</h2>
<table><tr><th>Slug</th><th>Variant</th><th>Result</th></tr>
${tools.map((t) => `<tr><td>${t.slug}</td><td>${t.variant}</td><td class="${Object.values(t.results).includes('fail') ? 'fail' : Object.values(t.results).includes('warn') ? 'warn' : 'pass'}">${Object.values(t.results).includes('fail') ? 'FAIL' : Object.values(t.results).includes('warn') ? 'WARN' : 'PASS'}</td></tr>`).join('')}
</table>
</body></html>`);
console.log('[dashboard] Wrote public/admin/audit.html');
