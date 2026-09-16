import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { chromium, type Browser } from 'playwright';
import { execFileSync, spawnSync } from 'node:child_process';
import { type EventEmitter } from 'node:events';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { runChecks } from './audit/_helpers';
import { allTools } from '../src/lib/data/tools';
import { aggregateResults } from '../scripts/lib/audit-helpers.mjs';

describe('audit smoke browser checks', () => {
  let browser: Browser;
  beforeAll(async () => { browser = await chromium.launch(); });
  afterAll(async () => { await browser?.close(); });

  async function check(body: string, status = 200) {
    const page = await browser.newPage({ baseURL: 'http://audit.invalid' });
    const requests: string[] = [];
    await page.route('**/*', route => {
      requests.push(route.request().url());
      return route.fulfill({ status, contentType: 'text/html', body });
    });
    try {
      const actual = await runChecks(page, 'base64', 500);
      expect((page as unknown as EventEmitter).listenerCount('pageerror')).toBe(0);
      expect((page as unknown as EventEmitter).listenerCount('console')).toBe(0);
      expect(requests.filter(url => url === 'http://audit.invalid/tools/base64')).toHaveLength(1);
      return actual;
    } finally {
      await page.close();
    }
  }

  it('captures both inline page errors and console errors before navigation', async () => {
    const actual = await check(`<div id="tool-interface-base64"><input></div>
      <script>console.error('early console error'); throw new Error('early page error');</script>`);
    expect(actual.checks.noBrowserErrors).toBe('fail');
    expect(actual.errors.join(' ')).toContain('early console error');
    expect(actual.errors.join(' ')).toContain('early page error');
  });

  it('waits for the workspace beyond a loading shell without requiring editable textareas', async () => {
    const actual = await check(`<div id="tool-interface-base64">Loading tool...</div>
      <script>setTimeout(() => {
        document.getElementById('tool-interface-base64').innerHTML = '<textarea readonly>Result</textarea>';
      }, 250);</script>`);
    expect(actual.checks).toEqual({ pageLoads: 'pass', workspaceLoads: 'pass', noBrowserErrors: 'pass' });
  });

  it('accepts input-only calculator workspaces', async () => {
    const actual = await check('<div id="tool-interface-base64"><label>Amount<input value="10"></label></div>');
    expect(actual.checks.workspaceLoads).toBe('pass');
  });

  it.each([
    '<div id="tool-interface-base64">Loading tool...</div>',
    '<div id="tool-interface-base64">Tool interface coming soon</div>',
    '<div id="tool-interface-base64"></div>',
    '<main><textarea>Not a tool workspace</textarea></main>',
  ])('rejects unloaded, placeholder, empty or missing workspaces', async body => {
    expect((await check(body)).checks.workspaceLoads).toBe('fail');
  });

  it('does not accept HTTP errors as page loads', async () => {
    expect((await check('<div id="tool-interface-base64"><input></div>', 404)).checks.pageLoads).toBe('fail');
  });
});

describe('audit suite configuration', () => {
  it('discovers exactly one smoke case for every registry slug including noindex', () => {
    const raw = JSON.parse(execFileSync(process.execPath,
      ['node_modules/playwright/cli.js', 'test', 'tests/audit/', '--list', '--reporter=json'],
      { encoding: 'utf8', env: { ...process.env, PLAYWRIGHT_JSON_OUTPUT_FILE: '', PLAYWRIGHT_JSON_OUTPUT_NAME: '' } }));
    expect(raw.errors).toEqual([]);
    // Other audit specs (autorun, trust-pills, example-url, …) share this
    // directory by plan convention; scope the assertion to smoke cases.
    const smoke = raw.suites.flatMap((suite: { specs: { title: string }[] }) => suite.specs.map(spec => spec.title))
      .filter((title: string) => title.startsWith('audit[smoke] '));
    expect(smoke).toEqual(allTools.map(tool => `audit[smoke] ${tool.slug}`));
  }, 15000);

  it.each(['http://localhost:4321', 'https://staging.example.com'])('honors explicit base URL %s without starting localhost', baseURL => {
    const config = JSON.parse(execFileSync(process.execPath, ['--import', 'tsx', '-e',
      "const config = require('./playwright.config.ts').default; console.log(JSON.stringify({baseURL:config.use.baseURL,webServer:config.webServer??null}));"],
    { encoding: 'utf8', env: { ...process.env, AUDIT_BASE_URL: baseURL } }));
    expect(config).toEqual({ baseURL, webServer: null });
  });
});

it('aggregates a real Playwright JSON run with failures, retries, skips and a global failure', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'audit-reporter-'));
  try {
    const playwright = createRequire(import.meta.url).resolve('@playwright/test');
    await writeFile(path.join(dir, 'fixture.spec.cjs'), `
      const { test, expect } = require(${JSON.stringify(playwright)});
      test('audit[smoke] base64', () => {});
      test('audit[smoke] url-encoder', () => { expect(1).toBe(2); });
      test.skip('audit[smoke] html-entity', () => {});
      test('audit[smoke] binary', ({}, info) => { expect(info.retry).toBe(1); });
    `);
    await writeFile(path.join(dir, 'teardown.cjs'), "module.exports = () => { throw new Error('fixture global failure'); };\n");
    await writeFile(path.join(dir, 'playwright.config.cjs'), `module.exports = {
      testDir: __dirname, testMatch: '*.spec.cjs', retries: 1, workers: 1,
      projects: [{ name: 'chromium' }], globalTeardown: './teardown.cjs',
      outputDir: ${JSON.stringify(path.join(dir, 'artifacts'))}
    };`);
    const output = path.join(dir, 'results.json');
    const run = spawnSync(process.execPath, ['node_modules/playwright/cli.js', 'test',
      '--config', path.join(dir, 'playwright.config.cjs'), '--reporter=json'],
    { encoding: 'utf8', timeout: 20000, env: { ...process.env, PLAYWRIGHT_JSON_OUTPUT_FILE: output } });
    expect(run.error).toBeUndefined();
    expect(run.status).toBe(1);
    const actual = aggregateResults(allTools.slice(0, 5), JSON.parse(await readFile(output, 'utf8')), run.status);
    expect(actual.tools.map(tool => tool.results.smoke)).toEqual(['pass', 'fail', 'skipped', 'flaky', 'missing']);
    expect(actual.errors.some(error => error.message?.includes('fixture global failure'))).toBe(true);
    expect(actual.tools[3].cases[0].attempts.map(attempt => attempt.status)).toEqual(['failed', 'passed']);
    expect(actual.status).toBe('fail');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}, 30000);
