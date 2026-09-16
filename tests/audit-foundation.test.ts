import { afterEach, describe, expect, it, vi } from 'vitest';
import { EventEmitter } from 'node:events';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { allTools } from '../src/lib/data/tools';
import * as audit from '../scripts/lib/audit-helpers.mjs';

vi.mock('node:child_process', async importOriginal => ({
  ...await importOriginal<typeof import('node:child_process')>(), spawn: vi.fn(),
}));
import { execFileSync, spawn } from 'node:child_process';

// Exercise the plain-Node consumer, outside Vitest's competing TS loader.
function readRegistry(): typeof allTools {
  return JSON.parse(execFileSync(process.execPath, ['scripts/parse-tools.mjs'], { encoding: 'utf8' }));
}

const tools = [allTools[0]];

function result(status = 'passed', retry = 0) {
  return {
    workerIndex: 0, parallelIndex: 0, status, duration: 10, retry,
    startTime: new Date().toISOString(), errors: [] as { message: string }[], stdout: [], stderr: [],
    attachments: [], annotations: [],
  };
}

function report(status = 'expected', results = [result()]) {
  return {
    config: { projects: [{ id: 'chromium', name: 'chromium', repeatEach: 1 }] },
    suites: [{
      title: 'standard.spec.ts', file: 'audit/standard.spec.ts', column: 0, line: 0, specs: [],
      suites: [{ title: 'nested suite', file: 'audit/standard.spec.ts', column: 1, line: 1,
        specs: [{
          title: 'audit[smoke] base64', ok: status !== 'unexpected', id: 'base64-test',
          file: 'audit/standard.spec.ts', line: 1, column: 1, tags: [],
          tests: [{ timeout: 30000, annotations: [], expectedStatus: 'passed',
            projectName: 'chromium', projectId: 'chromium', status, results }],
        }],
      }],
    }],
    errors: [] as { message: string }[],
    stats: { startTime: new Date().toISOString(), duration: 10,
      expected: Number(status === 'expected'), unexpected: Number(status === 'unexpected'),
      flaky: Number(status === 'flaky'), skipped: Number(status === 'skipped') },
  };
}

describe('audit registry reader', () => {
  it('preserves every complete registry object without crossing object boundaries', async () => {
    const actual = readRegistry();
    expect(actual.length).toBe(allTools.length);
    expect(actual).toEqual(allTools);
  });

  it('retains complex examples, aliases, noindex and processing metadata', async () => {
    const actual = readRegistry();
    expect(actual.find(t => t.slug === 'json-formatter')).toMatchObject({
      id: 'f1', category: 'Formatters', worker: true,
      aliasSlugs: ['json-pretty', 'json-lint', 'json-viewer'],
      examples: allTools.find(t => t.slug === 'json-formatter')!.examples,
    });
    expect(actual.find(t => t.slug === 'base64-decoder')).toMatchObject({ noindex: true });
    expect(actual.find(t => t.slug === 'dns-lookup')).toMatchObject({ processing: 'server' });
    expect(actual.find(t => t.slug === 'binary')).not.toHaveProperty('examples');
  });
});

describe('Playwright smoke aggregation', () => {
  it('passes only observed successful smoke cases, including nested suites', () => {
    const actual = audit.aggregateResults(tools, report(), 0);
    expect(actual.status).toBe('pass');
    expect(actual.scope).toBe('smoke');
    expect(actual.tools[0].results).toEqual({ smoke: 'pass' });
    expect(actual.tools[0].cases[0].attempts[0].status).toBe('passed');
  });

  it.each([
    ['unexpected', [result('failed')], 'fail'],
    ['unexpected', [result('timedOut')], 'fail'],
    ['unexpected', [result('interrupted')], 'fail'],
    ['skipped', [result('skipped')], 'skipped'],
    ['skipped', [], 'missing'],
    ['flaky', [result('failed'), result('passed', 1)], 'flaky'],
  ])('does not call %s / %j a clean pass', (status, results, want) => {
    const actual = audit.aggregateResults(tools, report(status, results), 0);
    expect(actual.status).toBe('fail');
    expect(actual.tools[0].results.smoke).toBe(want);
    expect(actual.tools[0].cases[0].attempts).toHaveLength(results.length);
  });

  it('does not count expected failures as proof of working tools', () => {
    const raw = report('expected', [result('failed')]);
    raw.suites[0].suites[0].specs[0].tests[0].expectedStatus = 'failed';
    expect(audit.aggregateResults(tools, raw, 0).tools[0].results.smoke).toBe('fail');
  });

  it('marks absent registry tools and absent projects missing', () => {
    const raw = report();
    expect(audit.aggregateResults(allTools.slice(0, 2), raw, 0).tools[1].results.smoke).toBe('missing');
    raw.config.projects.push({ id: 'firefox', name: 'firefox', repeatEach: 1 });
    expect(audit.aggregateResults(tools, raw, 0).tools[0].results.smoke).toBe('missing');
  });

  it('fails the run on global errors or a nonzero/null process exit even when cases pass', () => {
    const raw = report();
    raw.errors.push({ message: 'global teardown failed' });
    const actual = audit.aggregateResults(tools, raw, 0);
    expect(actual.status).toBe('fail');
    expect(actual.errors).toContainEqual({ message: 'global teardown failed' });
    expect(audit.aggregateResults(tools, report(), 1).status).toBe('fail');
    expect(audit.aggregateResults(tools, report(), null).status).toBe('fail');
  });

  it.each([null, {}, { suites: [] }, { ...report(), errors: null },
    { ...report(), suites: [{ specs: [{ tests: 'invalid' }] }] },
  ])('fails closed for malformed JSON report structure: %j', raw => {
    const actual = audit.aggregateResults(tools, raw, 0);
    expect(actual.status).toBe('fail');
    expect(actual.errors.length).toBeGreaterThan(0);
    expect(actual.tools[0].results.smoke).not.toBe('pass');
  });

  it('rejects unexpected or duplicate test cases rather than silently dropping them', () => {
    const raw = report();
    const spec = raw.suites[0].suites[0].specs[0];
    raw.suites[0].suites[0].specs.push(spec);
    expect(audit.aggregateResults(tools, raw, 0).status).toBe('fail');
    spec.title = 'unmapped test';
    expect(audit.aggregateResults(tools, raw, 0).status).toBe('fail');
  });

  it('does not accept contradictory pass attempts with errors or inconsistent totals', () => {
    const raw = report();
    raw.suites[0].suites[0].specs[0].tests[0].results[0].errors = [{ message: 'worker failed' }];
    expect(audit.aggregateResults(tools, raw, 0).status).toBe('fail');
    const missingTotal = report();
    missingTotal.stats.expected = 0;
    expect(audit.aggregateResults(tools, missingTotal, 0).status).toBe('fail');
  });
});

describe('isolated Playwright result collection', () => {
  const dirs: string[] = [];
  afterEach(async () => {
    vi.mocked(spawn).mockReset();
    await Promise.all(dirs.splice(0).map(dir => rm(dir, { recursive: true, force: true })));
  });

  it('uses local Node CLI without a shell and never reuses a prior successful result', async () => {
    const outputDir = await mkdtemp(path.join(tmpdir(), 'audit-unit-'));
    dirs.push(outputDir);
    const paths: string[] = [];
    vi.mocked(spawn).mockImplementation((_command, _args, options) => {
      const child = new EventEmitter();
      const file = options!.env!.PLAYWRIGHT_JSON_OUTPUT_FILE!;
      paths.push(file);
      setImmediate(async () => {
        if (paths.length === 1) await writeFile(file, JSON.stringify(report()));
        child.emit('close', 0);
      });
      return child as ReturnType<typeof spawn>;
    });
    const first = await audit.collectResults(tools, { outputDir, baseURL: 'http://localhost:4321' });
    expect(first.status).toBe('pass');
    const second = await audit.collectResults(tools, { outputDir, baseURL: 'http://localhost:4321' });
    expect(second.status).toBe('fail');
    expect(second.tools[0].results.smoke).toBe('missing');
    expect(paths[0]).not.toBe(paths[1]);
    expect(JSON.parse(await readFile(paths[0], 'utf8')).stats.expected).toBe(1);
    expect(spawn).toHaveBeenCalledWith(process.execPath,
      [expect.stringMatching(/playwright[\\/]cli\.js$/), 'test', 'tests/audit/',
        '--reporter=list,json', expect.stringMatching(/^--output=/)],
      expect.objectContaining({ shell: false, env: expect.objectContaining({ AUDIT_BASE_URL: 'http://localhost:4321' }) }));
  });

  it.each(['malformed', 'spawn-error', 'signal'])('fails closed on %s', async mode => {
    const outputDir = await mkdtemp(path.join(tmpdir(), 'audit-unit-'));
    dirs.push(outputDir);
    vi.mocked(spawn).mockImplementation((_command, _args, options) => {
      const child = new EventEmitter();
      setImmediate(async () => {
        if (mode === 'spawn-error') child.emit('error', new Error('cannot launch'));
        else {
          await writeFile(options!.env!.PLAYWRIGHT_JSON_OUTPUT_FILE!, mode === 'malformed' ? '{' : JSON.stringify(report()));
          child.emit('close', mode === 'signal' ? null : 0);
        }
      });
      return child as ReturnType<typeof spawn>;
    });
    const actual = await audit.collectResults(tools, { outputDir });
    expect(actual.status).toBe('fail');
    expect(actual.errors.length).toBeGreaterThan(0);
  });
});
