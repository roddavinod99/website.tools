#!/usr/bin/env node
// Registry-wide load smoke only, not functional acceptance or release sign-off.
// AUDIT_BASE_URL targets an already-running server; otherwise Playwright starts
// the existing standalone build on localhost:3000. No build is performed here.
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { readTools, collectResults, saveReport, appendHistory, AUDIT_PATH, HISTORY_PATH } from './lib/audit-helpers.mjs';

const tools = await readTools();
console.log(`[tool-audit] Running load smoke for all ${tools.length} registry tools (including noindex).`);
const report = await collectResults(tools, { baseURL: process.env.AUDIT_BASE_URL });
await mkdir(path.dirname(AUDIT_PATH), { recursive: true });
await saveReport(report);
await appendHistory({
  generatedAt: report.generatedAt, scope: report.scope, status: report.status,
  totalTools: tools.length, exitCode: report.exitCode, resultPath: report.resultPath,
});
console.log(`[tool-audit] Smoke ${report.status}. Wrote ${AUDIT_PATH} and ${HISTORY_PATH}`);
process.exitCode = report.status === 'pass' ? 0 : 1;
