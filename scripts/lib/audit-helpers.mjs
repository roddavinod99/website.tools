// @ts-check
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { tsImport } from 'tsx/esm/api';

export const ROOT = fileURLToPath(new URL('../../', import.meta.url));
export const AUDIT_PATH = path.join(ROOT, 'data', 'tool-audit.json');
export const HISTORY_PATH = path.join(ROOT, 'data', 'tool-audit-history.json');

/**
 * Import the trusted local registry, preserving its complete objects.
 * https://tsx.is/dev-api/ts-import
 * @returns {Promise<import('../../src/types/index').Tool[]>}
 */
export async function readTools() {
  const { allTools: tools } = await tsImport('../../src/lib/data/tools.ts', import.meta.url);
  if (!Array.isArray(tools) || tools.length === 0 ||
      tools.some(t => !t || typeof t.slug !== 'string' || !t.slug || typeof t.category !== 'string') ||
      new Set(tools.map(t => t.slug)).size !== tools.length) {
    throw new Error('Invalid or empty tool registry');
  }
  return tools;
}

/**
 * Aggregate observed smoke outcomes, not functional coverage. Retries remain
 * visible and flaky results are deliberately not accepted as a clean audit.
 * @param {import('../../src/types/index').Tool[]} registry
 * @param {unknown} input
 * @param {number | null} exitCode
 */
export function aggregateResults(registry, input, exitCode) {
  /** @type {import('playwright/types/testReporter').TestError[]} */
  const errors = [];
  /** @type {Map<string, import('playwright/types/testReporter').JSONReportTest[]>} */
  const cases = new Map(registry.map(t => [t.slug, []]));
  /** @type {import('playwright/types/testReporter').JSONReport['config']['projects']} */
  let projects = [];
  let valid = false;
  const raw = /** @type {import('playwright/types/testReporter').JSONReport} */ (input);
  try {
    if (!raw || !Array.isArray(raw.suites) || !Array.isArray(raw.errors) ||
        !Array.isArray(raw.config?.projects) || raw.config.projects.length === 0 ||
        !raw.stats || !Number.isFinite(Date.parse(raw.stats.startTime)) ||
        ![raw.stats.expected, raw.stats.unexpected, raw.stats.flaky, raw.stats.skipped].every(value =>
          Number.isInteger(value) && value >= 0)) {
      throw new Error('Invalid Playwright JSON report structure');
    }
    projects = raw.config.projects;
    if (projects.some(p => typeof p.id !== 'string' || !Number.isInteger(p.repeatEach) || p.repeatEach < 1) ||
        new Set(projects.map(p => p.id)).size !== projects.length) {
      throw new Error('Invalid Playwright project configuration');
    }
    errors.push(...raw.errors);
    const counts = { expected: 0, unexpected: 0, flaky: 0, skipped: 0 };
    /** @param {import('playwright/types/testReporter').JSONReportSuite[]} suites */
    function visit(suites) {
      for (const suite of suites) {
        if (!suite || !Array.isArray(suite.specs) || (suite.suites !== undefined && !Array.isArray(suite.suites))) {
          throw new Error('Invalid Playwright suite');
        }
        for (const spec of suite.specs) {
          if (typeof spec.title !== 'string' || !Array.isArray(spec.tests)) throw new Error('Invalid Playwright spec');
          const prefix = 'audit[smoke] ';
          const slug = spec.title.startsWith(prefix) ? spec.title.slice(prefix.length) : '';
          const toolCases = cases.get(slug);
          if (!toolCases) errors.push({ message: `Unmapped audit test: ${spec.title}` });
          for (const test of spec.tests) {
            if (!test || !projects.some(p => p.id === test.projectId) ||
                !['expected', 'unexpected', 'flaky', 'skipped'].includes(test.status) ||
                !['passed', 'failed', 'timedOut', 'skipped', 'interrupted'].includes(test.expectedStatus) ||
                !Array.isArray(test.results) || test.results.some((r, index) =>
                  !r || !['passed', 'failed', 'timedOut', 'skipped', 'interrupted'].includes(r.status ?? '') ||
                  r.retry !== index || !Array.isArray(r.errors))) {
              throw new Error('Invalid Playwright test result');
            }
            counts[test.status]++;
            toolCases?.push(test);
          }
        }
        if (suite.suites) visit(suite.suites);
      }
    }
    visit(raw.suites);
    if (counts.expected !== raw.stats.expected || counts.unexpected !== raw.stats.unexpected ||
        counts.flaky !== raw.stats.flaky || counts.skipped !== raw.stats.skipped) {
      throw new Error('Playwright result totals do not match the reported tests');
    }
    if (raw.stats.unexpected > 0 || raw.stats.flaky > 0 || raw.stats.skipped > 0) {
      errors.push({ message: 'Playwright reported failed, flaky, or skipped tests' });
    }
    valid = true;
  } catch (error) {
    errors.push({ message: error instanceof Error ? error.message : String(error) });
    cases.forEach(tests => tests.splice(0));
  }
  if (exitCode !== 0) errors.push({ message: `Playwright exited with ${exitCode ?? 'no exit code'}` });
  const generatedAt = new Date().toISOString();
  const tools = registry.map(tool => {
    const tests = cases.get(tool.slug) ?? [];
    let smoke = 'pass';
    if (!valid || !tests.length || tests.some(t => !t.results.length) ||
        projects.some(p => tests.filter(t => t.projectId === p.id).length < p.repeatEach)) smoke = 'missing';
    else if (projects.some(p => tests.filter(t => t.projectId === p.id).length > p.repeatEach) ||
        tests.some(t => t.status === 'unexpected' ||
          (t.status !== 'skipped' && (t.expectedStatus !== 'passed' || t.results.at(-1)?.status !== 'passed')) ||
          t.results.some(r => r.status === 'passed' && (r.errors.length > 0 || r.error)))) smoke = 'fail';
    else if (tests.some(t => t.status === 'skipped' || t.results.some(r => r.status === 'skipped'))) smoke = 'skipped';
    else if (tests.some(t => t.status === 'flaky' || t.results.length > 1 || t.results.some(r => r.status !== 'passed'))) smoke = 'flaky';
    return {
      slug: tool.slug, category: tool.category, results: { smoke }, timestamp: generatedAt,
      cases: tests.map(t => ({
        project: t.projectId, outcome: t.status, expectedStatus: t.expectedStatus,
        attempts: t.results.map(r => ({
          retry: r.retry, status: r.status, duration: r.duration, errors: r.errors,
          attachments: r.attachments,
        })),
      })),
    };
  });
  return {
    scope: 'smoke', generatedAt, exitCode, errors, tools,
    status: tools.length > 0 && errors.length === 0 && tools.every(t => t.results.smoke === 'pass') ? 'pass' : 'fail',
  };
}

/**
 * A fresh directory prevents missing output from reusing a previous success.
 * Keep raw JSON and browser artifacts together for failure diagnosis.
 * @param {import('../../src/types/index').Tool[]} tools
 * @param {{ outputDir?: string, baseURL?: string }} options
 */
export async function collectResults(tools, { outputDir = path.join(ROOT, 'test-results', 'tool-audit'), baseURL } = {}) {
  await mkdir(outputDir, { recursive: true });
  const runDir = await mkdtemp(path.join(outputDir, 'run-'));
  const resultPath = path.join(runDir, 'playwright.json');
  /** @type {number | null} */
  let exitCode = null;
  /** @type {{ message: string }[]} */
  const errors = [];
  let raw = null;
  try {
    const cli = path.join(path.dirname(createRequire(import.meta.url).resolve('playwright/package.json')), 'cli.js');
    exitCode = await new Promise((resolve, reject) => {
      const child = spawn(process.execPath, [cli, 'test', 'tests/audit/', '--reporter=list,json', `--output=${path.join(runDir, 'artifacts')}`], {
        cwd: ROOT, stdio: 'inherit', shell: false,
        env: { ...process.env, ...(baseURL ? { AUDIT_BASE_URL: baseURL } : {}), PLAYWRIGHT_JSON_OUTPUT_FILE: resultPath },
      });
      child.once('error', reject);
      child.once('close', resolve);
    });
    raw = JSON.parse(await readFile(resultPath, 'utf8'));
  } catch (error) {
    errors.push({ message: `Audit result collection failed: ${error instanceof Error ? error.message : String(error)}` });
  }
  const report = aggregateResults(tools, raw, exitCode);
  report.errors.push(...errors);
  return { ...report, resultPath, baseURL: baseURL ?? process.env.AUDIT_BASE_URL ?? 'http://localhost:3000' };
}

export async function loadReport() {
  if (!existsSync(AUDIT_PATH)) return null;
  return JSON.parse(await readFile(AUDIT_PATH, 'utf8'));
}

/** @param {ReturnType<typeof aggregateResults>} report */
export async function saveReport(report) {
  await writeFile(AUDIT_PATH, JSON.stringify(report, null, 2) + '\n');
}

/** @param {Record<string, unknown>} report */
export async function appendHistory(report) {
  /** @type {(Record<string, unknown> & { timestamp: string })[]} */
  let history = [];
  if (existsSync(HISTORY_PATH)) {
    history = JSON.parse(await readFile(HISTORY_PATH, 'utf8'));
  }
  history.push({ ...report, timestamp: new Date().toISOString() });
  // Keep last 90 days
  const cutoff = Date.now() - 90 * 24 * 60 * 60 * 1000;
  history = history.filter((r) => new Date(r.timestamp).getTime() > cutoff);
  await writeFile(HISTORY_PATH, JSON.stringify(history, null, 2) + '\n');
}
