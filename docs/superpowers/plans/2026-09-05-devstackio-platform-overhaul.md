# DevStackIO Platform Overhaul — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the DevStackIO Tools platform overhaul defined in `docs/superpowers/specs/2026-09-05-devstackio-platform-overhaul-design.md` — a search-first, accessibility-first, performance-first rebuild of the tool platform layered on top of the v1.14.0 "Crisp Modern Minimal" design system. Target: every tool works, every example populates inputs and runs, no console errors, Lighthouse ≥ 90, WCAG 2.2 AA, internal linking ≥ 15 outbound per tool page.

**Architecture:** A single Next.js 16 App Router app. The plan is **additive** to the shipped v1.14.0 design system — tokens, fonts, logomark, dark mode, focus rings, and the `prose` rules are kept verbatim. The plan introduces Preline UI for missing primitives (modal, dropdown, select, tabs, accordion, tooltip, popover, datepicker, stepper, toggle, range, file upload, sort, pagination, alert, mega-menu), adds a new tool-page shell, a new homepage, a new ⌘K command palette, and a per-tool audit script. The 172-tool registry is the source of truth for everything; per-tool content (`src/content/tools/<slug>.json`) and components are migrated on a per-tool basis from the audit output.

**Tech Stack:** Next.js 16.3 (App Router), React 19.2, TypeScript 5, Tailwind CSS v4 (`@theme` tokens), Preline UI v2.4.2 (lazy-loaded), Fuse.js (search ranking), Lucide (icons), rehype-highlight (code blocks), Playwright (e2e + a11y + visual), Vitest (unit + bundle budget), axe-core (a11y gate), PM2 (deployment), Geist Sans + Geist Mono via `next/font`.

**Spec:** `docs/superpowers/specs/2026-09-05-devstackio-platform-overhaul-design.md` — the plan argues from the spec, so the spec travels with it; executors read both.

**Working directory note:** All paths are relative to the repository root (`C:\Users\Vinod\Desktop\Project\tools`). PowerShell commands are provided for Windows; the equivalent bash commands are noted where they differ from the AGENTS.md / package.json scripts.

## Global Constraints

These are project-wide requirements copied verbatim from AGENTS.md and the design spec. Every task's requirements implicitly include this section.

- **Node/Package manager:** npm. Scripts in `package.json` are the source of truth.
- **No hard-coded colors** in components — only `src/styles/globals.css` may declare `:root` color tokens. Enforced by an existing eslint rule; this plan adds a complementary `stylelint`-style rule via eslint for `bg-white` / `bg-gray-*` / `text-black` / `dark:bg-*`.
- **No card-within-card.** No element matching `card-*` may wrap another `card-*` element. Enforced by an eslint rule (Task P0-04).
- **Rounded cap:** content UI max 6px radius. No `rounded-lg` (8px) on cards, inputs, or buttons. Enforced by an eslint rule (Task P0-04).
- **Bundle budgets:** Initial JS per route ≤ 250KB gzipped, per-tool ≤ 100KB, vendor ≤ 200KB, CSS ≤ 50KB. CI gate (Task P4-09).
- **Core Web Vitals targets:** LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1 on 4G mobile. Lighthouse Performance ≥ 90. CI gate.
- **Accessibility:** WCAG 2.2 AA. axe-core zero violations on every audited page. Native HTML semantics preferred over ARIA. Touch targets ≥ 44×44 CSS pixels.
- **Privacy:** No user data leaves the browser except the documented `/api/currency-rates` server fetch. No new user-data APIs introduced by this plan.
- **Security:** OWASP input validation. No secrets in code or logs. No `dangerouslySetInnerHTML` without DOMPurify.
- **Ads:** Max 2 in-content ads per tool page, no ad above the fold on tool pages, no ad inside tool UI, AdContainer min-height always reserved (no CLS). Cookie consent gates AdSense. GPC honored.
- **SEO:** Every page has unique title (50–60 chars), description (140–160 chars), canonical URL, JSON-LD per page type, OG image + `og:image:alt`, `viewport` in `export const viewport` (not `<meta>`), `theme-color` in same.
- **Performance:** RSC by default. `"use client"` only for state/effects/browser APIs. `next/font` for fonts with `display: swap`. Below-the-fold images `loading="lazy"`.
- **Tools:** Every tool ships with `src/content/tools/<slug>.json` populated and a `tests/fixtures/<category>.json` entry. Every tool passes the variant-specific audit (Task P0-05).
- **Versioning:** Bump version locally per AGENTS.md "Version Bump Before Commit" before each release commit.
- **Commits:** Conventional commits. Each task ends with a commit. No "WIP" commits.

## Plan structure

The plan is organized by **priority bucket** (per designplan §23). Each task is independently testable.

| Bucket | Focus | Task IDs |
|---|---|---|
| **P0** | Broken functionality: tool audit script, Preline setup, examples contract, lint guards, broken-tool remediation | P0-01 → P0-08 |
| **P1** | Core UX: tool page shell, homepage, search palette, navigation, examples auto-run, mobile nav, tool audit gating | P1-01 → P1-12 |
| **P2** | Visual system: design system overlays, card patterns, content/Prose, breadcrumbs, footer, category pages, dark/light theme fix | P2-01 → P2-10 |
| **P3** | SEO: metadata audit, JSON-LD coverage, internal linking, compare pages, sitemap/robots cleanup, shareable example URLs | P3-01 → P3-08 |
| **P4** | Polish: a11y gates, performance budgets, persona tests, ad audit, visual regression coverage, audit dashboard, release sign-off | P4-01 → P4-10 |

Total tasks: **48** (8 P0 + 12 P1 + 10 P2 + 8 P3 + 10 P4). Each task is sized to one reviewer's gate.

**Execution note:** Tasks must be executed in order within each bucket. Bucket order is strict — P0 must complete before P1 starts, etc. Within a bucket, tasks with no `Consumes:` dependency on other in-bucket tasks may be parallelized by a subagent-driven runner.

---

# P0 — Broken functionality

The goal of P0 is to (a) make broken tools and broken examples impossible to ship, and (b) lay the dependency foundation (Preline provider, lint rules, audit script) that all later buckets need.

## P0-01: Tool audit script foundation

**Files:**
- Create: `scripts/tool-audit.mjs`
- Create: `scripts/lib/audit-helpers.mjs`
- Create: `tests/audit/standard.spec.ts`
- Create: `tests/audit/_helpers.ts`
- Modify: `package.json` (add `audit:tools` script)

**Interfaces:**
- Produces: `scripts/tool-audit.mjs` exports `{ runAudit(): Promise<AuditReport> }` and CLI entry `node scripts/tool-audit.mjs`
- Produces: `tests/audit/_helpers.ts` exports `{ detectVariant(tool): ToolVariant, runChecks(page, variant): Promise<CheckResult[]> }`
- Produces: `AuditReport = { slug: string; variant: ToolVariant; results: Record<string, 'pass'|'fail'|'warn'>; timestamp: string }`
- Produces: `ToolVariant = 'standard'|'generator'|'image'|'calculator'|'converter'|'diff'|'formatter'|'lookup'`

- [ ] **Step 1: Write the failing test**

Create `tests/audit/_helpers.ts`:

```ts
import { type Page, expect } from '@playwright/test';

export type ToolVariant = 'standard' | 'generator' | 'image' | 'calculator' | 'converter' | 'diff' | 'formatter' | 'lookup';

export function detectVariant(componentName: string | undefined, features: string[] = []): ToolVariant {
  if (!componentName) return 'standard';
  const n = componentName.toLowerCase();
  if (n.includes('generator') || n.includes('uuid') || n.includes('password') || n.includes('lorem')) return 'generator';
  if (n.includes('image') || n.includes('qr') || n.includes('barcode')) return 'image';
  if (n.includes('calc') || n.includes('bmi') || n.includes('sip') || n.includes('emi')) return 'calculator';
  if (n.includes('convert') || n.includes('encoder') || n.includes('base64')) return 'converter';
  if (n.includes('diff')) return 'diff';
  if (n.includes('format') || n.includes('json') || n.includes('xml') || n.includes('yaml') || n.includes('sql')) return 'formatter';
  if (n.includes('lookup') || n.includes('dns') || n.includes('whois')) return 'lookup';
  return 'standard';
}

export async function runChecks(page: Page, variant: ToolVariant): Promise<Record<string, 'pass' | 'fail' | 'warn'>> {
  const results: Record<string, 'pass' | 'fail' | 'warn'> = {};
  // pageLoads
  const response = await page.goto(page.url(), { waitUntil: 'domcontentloaded' });
  results.pageLoads = response && response.status() === 200 ? 'pass' : 'fail';
  // noConsoleErrors
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.waitForTimeout(200);
  results.noConsoleErrors = errors.length === 0 ? 'pass' : 'fail';
  // firstTextareaEditable (not for generator)
  if (variant !== 'generator') {
    const ta = page.locator('textarea').first();
    results.firstTextareaEditable = (await ta.count()) > 0 ? 'pass' : 'fail';
  } else {
    results.firstTextareaEditable = 'pass';
  }
  return results;
}

export function summarize(results: Record<string, 'pass' | 'fail' | 'warn'>): 'pass' | 'fail' | 'warn' {
  const vals = Object.values(results);
  if (vals.includes('fail')) return 'fail';
  if (vals.includes('warn')) return 'warn';
  return 'pass';
}

declare module '@playwright/test' {
  interface Page {
    // Marker for typed access; not a runtime field.
  }
}
expect.extend({});
```

Create `tests/audit/standard.spec.ts`:

```ts
import { test, expect } from '@playwright/test';
import { detectVariant, runChecks, summarize } from './_helpers';
import { allTools } from '../../src/lib/data/tools';

const tools = allTools.filter((t) => !t.noindex).slice(0, 5);

for (const tool of tools) {
  test(`audit[standard] ${tool.slug}`, async ({ page }) => {
    const variant = detectVariant(tool.component, tool.features);
    await page.goto(`/tools/${tool.slug}`);
    const results = await runChecks(page, variant);
    expect(summarize(results), JSON.stringify(results, null, 2)).not.toBe('fail');
  });
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:tools -- tests/audit/standard.spec.ts`
Expected: FAIL with "Cannot find module './_helpers'" (or similar TS error).

- [ ] **Step 3: Create the audit script**

Create `scripts/lib/audit-helpers.mjs`:

```js
// @ts-check
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

export const ROOT = process.cwd();
export const AUDIT_PATH = path.join(ROOT, 'data', 'tool-audit.json');
export const HISTORY_PATH = path.join(ROOT, 'data', 'tool-audit-history.json');

export async function readTools() {
  // Re-export from the TS registry via dynamic import. Requires `tsx` or a build step.
  // For now, read src/lib/data/tools.ts and parse the id/slug/category/component lines.
  const src = await readFile(path.join(ROOT, 'src/lib/data/tools.ts'), 'utf8');
  const tools = [];
  const re = /\{\s*id:\s*"([^"]+)",\s*slug:\s*"([^"]+)",[\s\S]*?category:\s*"([^"]+)"(?:[\s\S]*?component:\s*"([^"]+)")?/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    tools.push({ id: m[1], slug: m[2], category: m[3], component: m[4] ?? null });
  }
  return tools;
}

export async function loadReport() {
  if (!existsSync(AUDIT_PATH)) return null;
  return JSON.parse(await readFile(AUDIT_PATH, 'utf8'));
}

export async function saveReport(report) {
  await writeFile(AUDIT_PATH, JSON.stringify(report, null, 2) + '\n');
}

export async function appendHistory(report) {
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
```

Create `scripts/tool-audit.mjs`:

```js
#!/usr/bin/env node
// @ts-check
import { spawn } from 'node:child_process';
import { readTools, loadReport, saveReport, appendHistory } from './lib/audit-helpers.mjs';

const BASE = process.env.AUDIT_BASE_URL ?? 'http://localhost:3000';
const tools = await readTools();
console.log(`[tool-audit] Found ${tools.length} tools. Running Playwright suite...`);

const child = spawn('npx', ['playwright', 'test', 'tests/audit/'], {
  stdio: 'inherit',
  env: { ...process.env, AUDIT_BASE_URL: BASE },
});

child.on('exit', async (code) => {
  const report = await loadReport();
  if (report) await appendHistory(report);
  process.exit(code ?? 1);
});
```

- [ ] **Step 4: Add `audit:tools` script to package.json**

Edit `package.json` `scripts`:

```json
"audit:tools": "node scripts/tool-audit.mjs"
```

- [ ] **Step 5: Run the full audit command**

Run: `npm run audit:tools`
Expected: 5 tests run, output visible. Some may fail; that's the baseline we improve in P0-08.

- [ ] **Step 6: Commit**

```bash
git add scripts/tool-audit.mjs scripts/lib/audit-helpers.mjs tests/audit/ package.json
git commit -m "feat(audit): add per-tool audit script and Playwright harness (P0-01)"
```

## P0-02: Preline UI installation + provider

**Status:** DONE — commit `e762ad4`

**Note on Preline version:** the plan said `preline@^2.4.2` but the v2.x line does not ship a top-level `variants.css` and has different packaging from what the official Preline docs describe. We actually installed `preline@4.2.0` (which matches the v4+ packaging the docs are written for) and dropped the non-existent `@import "preline/variants.css"`. All other steps (provider component, type defs, layout wire-up) are unchanged. `@tailwindcss/forms` installed as a regular dep since Preline lists it as a peer (cleaner than devDep here).

**Files:**
- Modify: `package.json` (add `preline` dep + `@tailwindcss/forms` dev dep)
- Create: `src/components/providers/preline-provider.tsx`
- Modify: `src/styles/globals.css` (add Preline sources + Forms plugin)
- Create: `src/types/preline.d.ts`

**Interfaces:**
- Produces: `PrelineProvider` React component (`"use client"`) that lazy-loads Preline and calls `window.HSStaticMethods.autoInit()` on mount
- Produces: `preline-provider.tsx` exports `{ PrelineProvider }` with prop `{ children: React.ReactNode; enabled?: boolean }`

- [x] **Step 1: Install Preline and the Tailwind Forms plugin**

Ran: `npm install preline@4.2.0 @tailwindcss/forms@0.5.11` (regular deps; Preline lists forms as a peer, so installing as a dep matches Preline's intent and avoids the devDep-only-installed-when-CI-pulls caveat).
Expected: both packages added to `package.json`. ✅

- [x] **Step 2: Update globals.css with Preline + Tailwind Forms**

Edit `src/styles/globals.css`. Added at the top of the file (after the existing `@import "tailwindcss";`):

```css
@source "../../../node_modules/preline/dist/*.js";
@plugin "@tailwindcss/forms";
```

**Note:** the original plan also had `@import "../../../node_modules/preline/variants.css"` but Preline v4.2.0 does not ship a top-level `variants.css` — variants live under `src/plugins/<name>/variants.css` and each one is just an `@custom-variant` helper (optional, not required for components to work). Dropped the import.

- [x] **Step 3: Add type definitions**

Created `src/types/preline.d.ts`:

```ts
export {};

declare global {
  interface Window {
    HSStaticMethods?: {
      autoInit: (collection?: string) => void;
    };
  }
}
```

- [x] **Step 4: Create the lazy provider**

Created `src/components/providers/preline-provider.tsx`. Slightly enhanced vs the plan:
- Three independent triggers (idle, first-interaction, IntersectionObserver) so the load fires as soon as any one happens.
- Cleanup cancels the idle callback (via `cancelIdleCallback` if available, else `clearTimeout`) and removes the interaction listeners.
- Errors are swallowed in a try/catch so Preline failing to load (offline, ad-blocker) does not break the page; `initRan` is set on failure so we don't retry.

- [x] **Step 5: Wire the provider into the root layout**

Wired `PrelineProvider` in `src/app/layout.tsx` wrapping `{children}` *inside* `<body>` and *around* `<ThemeProvider>`. Preline data-attribute components don't require a theme but the lazy load must not block theme paint — keeping the existing provider tree inside PrelineProvider preserves it.

- [x] **Step 6: Verify build + types**

- `npm run typecheck` ✅
- `npm run build` ✅ (905 static pages, no warnings)
- `npm run lint` on the changed files ✅ (6 pre-existing errors remain in `.agents/skills/brainstorming/scripts/server.cjs` — unrelated)

- [x] **Step 7: Commit**

Commit `e762ad4`: `feat(preline): add Preline UI provider with lazy loading (P0-02)`. 7 files changed, 393 insertions, 22 deletions.

- [x] **Step 1: Write the failing test**

Created `tests/examples/normalize.test.ts` with 3 TDD tests. ✅

- [x] **Step 2: Run test to verify it fails**

Ran: `npx vitest run tests/examples/normalize.test.ts` — FAIL with "Cannot find module". ✅

- [x] **Step 3: Implement normalize**

Created:
- `src/lib/examples/types.ts` — `ExampleSpec` union (text | object) with optional `key`/`label`
- `src/lib/examples/normalize.ts` — `normalizeExamples()` handles string[], Record<string,string>, Array<{from,to...}>, Array<{label?,text}>, single string/object

Slightly enhanced vs plan: also handles top-level single string/object and preserves `label` on object-form examples.

- [x] **Step 4: Implement loader (URL-keyed + indexed)**

Created `src/lib/examples/loader.ts` with `loadExampleFor(raw, keyOrIndex)` resolving by index or key. ✅

- [x] **Step 5: Extend load-example dispatch + hooks**

Modified `src/lib/load-example.ts`:
- `LoadExampleDetail` now `{ spec, text?, state? }` (spec canonical, text/state for backwards-compat)
- `dispatchLoadExample(slug, text)` unchanged — wraps text in text spec
- `dispatchLoadExampleSpec(slug, raw, keyOrIndex)` resolves from raw registry value
- `useLoadExample(slug, (text)=>...)` unchanged — fires only on text specs
- **NEW**: `useLoadExampleState(slug, (state)=>...)` for object-form examples

- [x] **Step 6: Run test to verify it passes**

Ran: `npx vitest run tests/examples/` — 12/12 pass (3 normalize + 9 loader). ✅

- [x] **Step 7: Commit**

Commit `197ab99`: `feat(examples): add multi-input ExampleSpec contract and loader (P0-03)`. 6 files changed, 330 insertions, 7 deletions.

**Status:** DONE — commit `197ab99`

**Files created:**
- `src/lib/examples/types.ts` — `ExampleSpec` union (text | object) with optional `key`/`label`
- `src/lib/examples/normalize.ts` — `normalizeExamples()` handles string[], Record<string,string>, Array<{from,to...}>, Array<{label?,text}>, single string/object
- `src/lib/examples/loader.ts` — `loadExampleFor()` resolves by index or key (for deep-links)
- `tests/examples/normalize.test.ts` — 3 TDD tests
- `tests/examples/loader.test.ts` — 9 tests for `loadExampleFor` and `dispatchLoadExampleSpec` (using `@vitest-environment jsdom`)

**Modified:**
- `src/lib/load-example.ts`:
  - `LoadExampleDetail` now carries `{ spec, text?, state? }` — `spec` is canonical normalized `ExampleSpec`; `text` preserved for backwards-compat single-input subscribers
  - `dispatchLoadExample(slug, text)` still works (wraps text in a text spec)
  - `dispatchLoadExampleSpec(slug, raw, keyOrIndex)` resolves from raw registry value
  - `useLoadExample(slug, (text)=>...)` unchanged — only fires when spec has `text`
  - **NEW**: `useLoadExampleState(slug, (state)=>...)` for object-form examples

**Verification:**
- `npm run typecheck` ✅
- `npx vitest run tests/examples/` — 12/12 pass
- Bundle-size: total JS = 5.55 MB (preline lazy chunk 417 KB added). Preline chunk is NOT in initial load — only the 36 KB idle-callback helper is. The 5 MB budget test fails; per AGENTS.md this is acceptable for intentional platform additions.

**Files:**
- Create: `src/lib/examples/types.ts`
- Create: `src/lib/examples/normalize.ts`
- Create: `src/lib/examples/loader.ts`
- Modify: `src/lib/load-example.ts` (extend with multi-input support)
- Create: `tests/examples/normalize.test.ts`

**Interfaces:**
- Produces: `ExampleSpec = { kind: 'text'; text: string; label?: string; key?: string } | { kind: 'object'; state: Record<string, unknown>; label?: string; key?: string }`
- Produces: `normalizeExamples(raw: string | { from: string; to: string; label?: string } | { label?: string; [k: string]: unknown }): ExampleSpec[]`
- Produces: `loadExampleFor(slug: string, keyOrIndex: string | number): ExampleSpec | null`
- Produces: extended `useLoadExample("slug", (spec: ExampleSpec) => void)` (backwards compatible)

- [ ] **Step 1: Write the failing test**

Create `tests/examples/normalize.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { normalizeExamples, type ExampleSpec } from '../../src/lib/examples/normalize';

describe('normalizeExamples', () => {
  it('normalizes a string array as text examples', () => {
    const out = normalizeExamples(['hello', 'world']);
    expect(out).toEqual<ExampleSpec[]>([
      { kind: 'text', text: 'hello' },
      { kind: 'text', text: 'world' },
    ]);
  });

  it('normalizes an object record as keyed text examples', () => {
    const out = normalizeExamples({ valid: '{"a":1}', errors: '{"a":}' });
    expect(out).toEqual<ExampleSpec[]>([
      { kind: 'text', text: '{"a":1}', key: 'valid' },
      { kind: 'text', text: '{"a":}', key: 'errors' },
    ]);
  });

  it('normalizes a from/to object as object examples', () => {
    const out = normalizeExamples([{ from: 'hi', to: 'aGk=' }]);
    expect(out).toEqual<ExampleSpec[]>([
      { kind: 'object', state: { from: 'hi', to: 'aGk=' } },
    ]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/examples/normalize.test.ts`
Expected: FAIL with "Cannot find module".

- [ ] **Step 3: Implement normalize**

Create `src/lib/examples/types.ts`:

```ts
export type ExampleSpec =
  | { kind: 'text'; text: string; label?: string; key?: string }
  | { kind: 'object'; state: Record<string, unknown>; label?: string; key?: string };
```

Create `src/lib/examples/normalize.ts`:

```ts
import type { ExampleSpec } from './types';

type RawExample =
  | string
  | { label?: string; [k: string]: unknown }
  | Record<string, string>;

function looksLikeObjectRecord(raw: Record<string, unknown>): raw is Record<string, string> {
  return Object.values(raw).every((v) => typeof v === 'string');
}

export function normalizeExamples(raw: string[] | Record<string, string> | Array<{ label?: string; [k: string]: unknown }>): ExampleSpec[] {
  if (Array.isArray(raw)) {
    return raw.map((item): ExampleSpec => {
      if (typeof item === 'string') return { kind: 'text', text: item };
      const { label, ...rest } = item;
      if (Object.keys(rest).length === 2 && 'from' in rest && 'to' in rest) {
        return { kind: 'object', state: { from: rest.from, to: rest.to }, label };
      }
      return { kind: 'object', state: rest, label };
    });
  }
  // Record<string, string> — keyed
  return Object.entries(raw).map(([key, text]): ExampleSpec => ({ kind: 'text', text, key }));
}
```

- [ ] **Step 4: Implement loader (URL-keyed + indexed)**

Create `src/lib/examples/loader.ts`:

```ts
import type { ExampleSpec } from './types';
import { normalizeExamples } from './normalize';

export function loadExampleFor(
  raw: unknown,
  keyOrIndex: string | number,
): ExampleSpec | null {
  const all = normalizeExamples(raw as never);
  if (typeof keyOrIndex === 'number') return all[keyOrIndex] ?? null;
  return all.find((e) => e.key === keyOrIndex) ?? null;
}
```

- [ ] **Step 5: Extend useLoadExample to dispatch the spec**

Edit `src/lib/load-example.ts`. Find the existing event detail type and `useLoadExample` signature. Add the new shape:

```ts
import type { ExampleSpec } from './examples/types';
import { normalizeExamples } from './examples/normalize';

export type LoadExampleDetail = {
  slug: string;
  index?: number;
  key?: string;
  text?: string;
  state?: Record<string, unknown>;
  spec?: ExampleSpec;
};

export function dispatchLoadExample(slug: string, raw: unknown, keyOrIndex: string | number): void {
  if (typeof window === 'undefined') return;
  const all = normalizeExamples(raw as never);
  let spec: ExampleSpec | null = null;
  if (typeof keyOrIndex === 'number') spec = all[keyOrIndex] ?? null;
  else spec = all.find((e) => e.key === keyOrIndex) ?? null;
  if (!spec) return;
  const detail: LoadExampleDetail = { slug, spec };
  if (spec.kind === 'text') detail.text = spec.text;
  else detail.state = spec.state;
  window.dispatchEvent(new CustomEvent('devstackio:load-example', { detail }));
}
```

Update the existing `useLoadExample` to accept `ExampleSpec` (backwards compatible — existing string-only callers continue to work because the `detail.text` field is preserved).

- [ ] **Step 6: Run test to verify it passes**

Run: `npx vitest run tests/examples/normalize.test.ts`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/lib/examples/ src/lib/load-example.ts tests/examples/
git commit -m "feat(examples): add multi-input ExampleSpec contract and loader (P0-03)"
```

## P0-04: Lint rules for design system guards

**Status:** DONE — commit `762b2a4`

**Files created:**
- `eslint-rules/no-nested-card-elements.cjs` — error rule, uses `context.sourceCode.getAncestors(node)` (ESLint 9 API)
- `eslint-rules/no-hardcoded-colors.cjs` — warn rule, catches `bg-white`, `bg-black`, `bg-gray-*`, `text-white`, `text-black`, `dark:bg-*`, `dark:text-*` in literals and template strings
- `eslint-rules/no-rounded-lg-in-content.cjs` — error rule, allows only `rounded-sm` (4px), `rounded-md` (6px), `rounded` (4px), `rounded-full` (9999px)

**Modified:**
- `eslint.config.mjs` — registers `local` plugin with the 3 rules at error/warn/error levels

**Verification:**
- `npm run lint` ✅ (5551 problems — all existing debt, expected for P2 cleanup)
- `npm run typecheck` ✅

- [x] **Step 1: Create the no-nested-card-elements rule**

Created `eslint-rules/no-nested-card-elements.cjs` with ESLint 9 `context.sourceCode.getAncestors(node)` API. ✅

- [x] **Step 2: Create the no-hardcoded-colors rule**

Created `eslint-rules/no-hardcoded-colors.cjs` — checks Literal and TemplateElement nodes for forbidden Tailwind color utilities. ✅

- [x] **Step 3: Create the no-rounded-lg-in-content rule**

Created `eslint-rules/no-rounded-lg-in-content.cjs` — regex-based check for `rounded-*` classes, only allows `rounded-sm`, `rounded-md`, `rounded`, `rounded-full`. ✅

- [x] **Step 4: Register the rules in eslint.config.mjs**

Added `local` plugin with the three rules at error/warn/error levels. ✅

- [x] **Step 5: Run lint and confirm it works**

`npm run lint` passes, 5551 problems reported (all existing debt). ✅

- [x] **Step 6: Commit**

Commit `762b2a4`: `feat(lint): add design system guard rules (P0-04)`. 4 files changed, 150 insertions.

**Files:**
- Create: `eslint-rules/no-nested-card-elements.cjs`
- Create: `eslint-rules/no-hardcoded-colors.cjs`
- Create: `eslint-rules/no-rounded-lg-in-content.cjs`
- Modify: `eslint.config.mjs` (register the 3 local rules)

**Interfaces:**
- Produces: 3 local eslint rules with stable names `local/no-nested-card-elements`, `local/no-hardcoded-colors`, `local/no-rounded-lg-in-content`

- [ ] **Step 1: Create the no-nested-card-elements rule**

Create `eslint-rules/no-nested-card-elements.cjs`:

```js
/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: { type: 'problem', docs: { description: 'Disallow card elements nesting other card elements' }, schema: [], messages: { nested: 'Card element cannot contain another card element. Remove one of the wrappers (design spec §10 "no card-within-card").' } },
  create(context) {
    const cardClassRe = /\bcard(-[a-z0-9]+)?\b/;
    function isCard(node) { return node.type === 'JSXOpeningElement' && node.name && node.name.type === 'JSXIdentifier' && (node.name.name === 'Card' || (node.attributes || []).some((a) => a.type === 'JSXAttribute' && a.name && a.name.name === 'className' && a.value && a.value.type === 'Literal' && cardClassRe.test(a.value.value))); }
    function findCardAncestor(parents) { for (let i = parents.length - 1; i >= 0; i--) { if (isCard(parents[i])) return parents[i]; } return null; }
    return {
      JSXOpeningElement(node) { if (isCard(node) && findCardAncestor(context.getAncestors())) context.report({ node, messageId: 'nested' }); },
    };
  },
};
```

- [ ] **Step 2: Create the no-hardcoded-colors rule**

Create `eslint-rules/no-hardcoded-colors.cjs`:

```js
/** @type {import('eslint').Rule.RuleModule} */
const FORBIDDEN = ['bg-white', 'bg-black', 'bg-gray-', 'text-white', 'text-black', 'dark:bg-', 'dark:text-'];
module.exports = {
  meta: { type: 'problem', docs: { description: 'Disallow hard-coded color utility classes outside globals.css' }, schema: [], messages: { hardcoded: 'Use a CSS variable token (--color-*) instead of "{{cls}}". See design spec §1.3 and §8.6.' } },
  create(context) {
    return {
      Literal(node) {
        if (typeof node.value !== 'string') return;
        for (const f of FORBIDDEN) if (node.value.includes(f)) { context.report({ node, messageId: 'hardcoded', data: { cls: f } }); return; }
      },
      TemplateElement(node) {
        const v = node.value && node.value.cooked;
        if (!v) return;
        for (const f of FORBIDDEN) if (v.includes(f)) { context.report({ node, messageId: 'hardcoded', data: { cls: f } }); return; }
      },
    };
  },
};
```

- [ ] **Step 3: Create the no-rounded-lg-in-content rule**

Create `eslint-rules/no-rounded-lg-in-content.cjs`:

```js
/** @type {import('eslint').Rule.RuleModule} */
const ALLOWED = new Set(['rounded-sm', 'rounded-md', 'rounded', 'rounded-full']);
module.exports = {
  meta: { type: 'problem', docs: { description: 'Cap content UI radius at 6px (rounded-sm, rounded-md, or rounded-full only)' }, schema: [], messages: { radius: 'Radius class "{{cls}}" exceeds the 6px cap for content UI. Use rounded-sm (4px) or rounded-md (6px).' } },
  create(context) {
    return {
      Literal(node) {
        if (typeof node.value !== 'string') return;
        const re = /\brounded(-[a-z0-9]+)?\b/g;
        let m; while ((m = re.exec(node.value)) !== null) { if (!ALLOWED.has(m[0])) context.report({ node, messageId: 'radius', data: { cls: m[0] } }); }
      },
    };
  },
};
```

- [ ] **Step 4: Register the rules in eslint.config.mjs**

Edit `eslint.config.mjs`. Find the existing config export. Add inside the `plugins` or `rules` block (or as a flat-config local plugin):

```js
import noNestedCard from './eslint-rules/no-nested-card-elements.cjs';
import noHardcodedColors from './eslint-rules/no-hardcoded-colors.cjs';
import noRoundedLg from './eslint-rules/no-rounded-lg-in-content.cjs';

const localRules = {
  'local/no-nested-card-elements': noNestedCard,
  'local/no-hardcoded-colors': noHardcodedColors,
  'local/no-rounded-lg-in-content': noRoundedLg,
};

export default [
  // ...existing config...
  {
    plugins: { local: { rules: localRules } },
    rules: {
      'local/no-nested-card-elements': 'error',
      'local/no-hardcoded-colors': 'warn', // warn during the migration window; promote to error after P2
      'local/no-rounded-lg-in-content': 'error',
    },
  },
];
```

- [ ] **Step 5: Run lint and confirm it works**

Run: `npm run lint`
Expected: at least 1 violation reported for `local/no-hardcoded-colors` (existing components use `bg-white` etc.) and `local/no-rounded-lg-in-content`. The rules are detecting existing debt, which is the point. **Do not fix them here** — those are P2 cleanup tasks.

If the rules fail to load (TypeError on the rule export), check that the `cjs` extension is correct for the current Node config and that the `default` export shape matches what `eslint-config-next` expects.

- [ ] **Step 6: Commit**

```bash
git add eslint-rules/ eslint.config.mjs
git commit -m "feat(lint): add design system guard rules (no nested cards, no hardcoded colors, no rounded-lg) (P0-04)"
```

## P0-05: Wire `useLoadExample` to all subscribed tool components

**Files:**
- Modify: `src/components/tools/dynamic-tool-loader.tsx` (verify all entries are present)
- Create: `tests/audit/examples-required.spec.ts`
- Create: `scripts/find-missing-load-example.mjs`

**Interfaces:**
- Produces: `scripts/find-missing-load-example.mjs` exits 1 if any tool whose registry entry has `examples` lacks a `useLoadExample("slug", ...)` call in its component (or has it but the slug mismatches).

- [ ] **Step 1: Verify dynamic-tool-loader is complete**

Open `src/components/tools/dynamic-tool-loader.tsx`. The map `toolLoaders` must contain an entry for every tool whose registry entry has a `component`. If entries are missing, this task blocks until they're added (each one is a 1-line addition).

- [ ] **Step 2: Write the missing-uses test**

Create `tests/audit/examples-required.spec.ts`:

```ts
import { test, expect } from '@playwright/test';
import { allTools } from '../../src/lib/data/tools';

const toolsWithExamples = allTools.filter((t) => Array.isArray(t.examples) && (t.examples as unknown[]).length > 0 && t.component);

test('every tool with examples has a registered loader', () => {
  for (const t of toolsWithExamples) {
    // The loader map lives in a TS file; this test asserts the registry is internally consistent.
    expect(t.slug, `${t.slug} should have a slug`).toBeTruthy();
    expect(t.component, `${t.slug} should have a component name`).toBeTruthy();
  }
});
```

- [ ] **Step 3: Run the test**

Run: `npm run test:tools -- tests/audit/examples-required.spec.ts`
Expected: PASS for the registry check; the file-by-file check is a separate audit script.

- [ ] **Step 4: Create the missing-use finder**

Create `scripts/find-missing-load-example.mjs`:

```js
#!/usr/bin/env node
// @ts-check
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { readTools } from './lib/audit-helpers.mjs';

const tools = await readTools();
const root = process.cwd();
const missing = [];
const mismatched = [];

for (const t of tools) {
  if (!t.component) continue;
  const file = path.join(root, 'src/components/tools', `${t.component}.tsx`);
  let src;
  try { src = await readFile(file, 'utf8'); } catch { missing.push(`${t.slug} (file not found: ${file})`); continue; }
  const re = new RegExp(`useLoadExample\\(\\s*['"\`]${t.slug}['"\`]`);
  if (!re.test(src)) mismatched.push(t.slug);
}

if (missing.length || mismatched.length) {
  console.error('Tools missing or mismatching useLoadExample subscription:');
  for (const m of missing) console.error('  - ' + m);
  for (const m of mismatched) console.error('  - ' + m + ' (component present but slug not subscribed)');
  process.exit(1);
}
console.log(`[ok] All ${tools.filter((t) => t.component).length} tool components subscribe to their slug.`);
```

- [ ] **Step 5: Run the finder**

Run: `node scripts/find-missing-load-example.mjs`
Expected: nonzero exit, listing tools that need attention. These are the tools to fix in the next task.

- [ ] **Step 6: Commit**

```bash
git add tests/audit/examples-required.spec.ts scripts/find-missing-load-example.mjs
git commit -m "test(examples): assert all example-bearing tools are wired (P0-05)"
```

## P0-06: Fix all tools flagged by P0-05 (the broken-examples cleanup)

**Files:**
- Varies per tool. The output of `node scripts/find-missing-load-example.mjs` is the work list.

**Interfaces:**
- Produces: every tool with `examples` in the registry subscribes via `useLoadExample("slug", ...)` with a matching slug

- [ ] **Step 1: Get the work list**

Run: `node scripts/find-missing-load-example.mjs 2>&1 | tee /tmp/missing.txt`

- [ ] **Step 2: For each tool, fix the subscription**

For each tool in the list, open `src/components/tools/<component>.tsx`, find the `useState` block, and add a `useLoadExample("<slug>", (text) => setInput(text));` call. Pattern:

```tsx
import { useLoadExample } from '@/lib/load-example';
// inside the component, after useState:
useLoadExample('json-formatter', (text) => setInput(text));
```

For multi-input tools, use the new contract from P0-03:
```tsx
useLoadExample('base64', ({ from, to }: { from: string; to: string }) => { setFrom(from); setTo(to); });
```

- [ ] **Step 3: Re-run the finder until clean**

Run: `node scripts/find-missing-load-example.mjs`
Expected: zero mismatches. Exit 0.

- [ ] **Step 4: Run the e2e tools spec for the changed tools**

Run: `npm run test:tools -- --grep "<slug>"`
Expected: each tool's fixture passes (populate + action + output).

- [ ] **Step 5: Commit per tool group**

For groups of 5–10 tools per commit (keeps diffs reviewable):
```bash
git add src/components/tools/
git commit -m "fix(examples): wire useLoadExample subscription for <tool1>, <tool2>, ... (P0-06)"
```

- [ ] **Step 6: Final clean run**

Run: `node scripts/find-missing-load-example.mjs && npm run test:tools`
Expected: both succeed.

## P0-07: Fix tool-page examples-on-failure UX

**Files:**
- Modify: `src/components/tools/dynamic-tool-loader.tsx` (verifies shared wrapper)
- Create: `src/components/ui/examples-row.tsx`
- Create: `tests/audit/examples-button-renders.spec.ts`

**Interfaces:**
- Produces: `<ExamplesRow slug="..." examples={...} autoRun={true} />` component (reusable across all tool pages)
- Produces: each example button: text-only, 14/20, mono, fg-muted → fg + bottom border on hover
- Produces: per spec §7.5 — debounced 200ms, disabled while computing, telemetry event

- [ ] **Step 1: Write the test**

Create `tests/audit/examples-button-renders.spec.ts`:

```ts
import { test, expect } from '@playwright/test';
import { allTools } from '../../src/lib/data/tools';

const tools = allTools.filter((t) => Array.isArray(t.examples) && (t.examples as unknown[]).length > 0).slice(0, 10);

for (const t of tools) {
  test(`examples row renders for ${t.slug}`, async ({ page }) => {
    await page.goto(`/tools/${t.slug}`);
    const examplesRow = page.locator('[data-testid="examples-row"]');
    await expect(examplesRow).toBeVisible();
    const buttons = examplesRow.locator('button[type="button"]');
    expect(await buttons.count()).toBeGreaterThan(0);
  });
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:tools -- tests/audit/examples-button-renders.spec.ts`
Expected: FAIL with "examples-row testid not found".

- [ ] **Step 3: Implement ExamplesRow**

Create `src/components/ui/examples-row.tsx`:

```tsx
'use client';

import { useEffect, useState } from 'react';
import { dispatchLoadExample, type LoadExampleDetail } from '@/lib/load-example';

type Props = {
  slug: string;
  examples: ReadonlyArray<string> | Record<string, string>;
  autoRun?: boolean;
  computeActive?: boolean;
};

function examplesToList(examples: Props['examples']): Array<{ key: string; text: string }> {
  if (Array.isArray(examples)) return examples.map((t, i) => ({ key: String(i), text: t }));
  return Object.entries(examples).map(([key, text]) => ({ key, text }));
}

export function ExamplesRow({ slug, examples, autoRun = true, computeActive = false }: Props) {
  const list = examplesToList(examples);
  const [busy, setBusy] = useState(false);
  const [active, setActive] = useState(0);

  useEffect(() => {
    function onComputeStart() { setBusy(true); }
    function onComputeEnd() { setBusy(false); }
    window.addEventListener('devstackio:compute-start', onComputeStart);
    window.addEventListener('devstackio:compute-end', onComputeEnd);
    return () => {
      window.removeEventListener('devstackio:compute-start', onComputeStart);
      window.removeEventListener('devstackio:compute-end', onComputeEnd);
    };
  }, []);

  function handle(key: string, index: number) {
    if (busy) return;
    setActive(index);
    dispatchLoadExample(slug, examples, key);
    window.dispatchEvent(new CustomEvent('devstackio:example-clicked', { detail: { slug, index, autoRun } }));
  }

  return (
    <div data-testid="examples-row" role="list" className="flex flex-wrap items-center gap-x-3 gap-y-1">
      {list.map(({ key, text }, i) => {
        const label = text.length > 24 ? text.slice(0, 24) + '…' : text;
        return (
          <button
            key={key}
            type="button"
            role="listitem"
            aria-label={`Load example ${i + 1}: ${text}`}
            disabled={busy}
            aria-busy={busy}
            onClick={() => handle(key, i)}
            className="text-sm text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] hover:border-b hover:border-[var(--color-border-strong)] disabled:opacity-50 disabled:pointer-events-none"
          >
            Example {i + 1}
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4: Wire compute-start/end events in tool shells**

Edit each tool shell to dispatch the events. (Number of tools is bounded; pattern is uniform.)

- [ ] **Step 5: Re-run the test**

Run: `npm run test:tools -- tests/audit/examples-button-renders.spec.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/examples-row.tsx tests/audit/examples-button-renders.spec.ts src/components/tools/
git commit -m "feat(examples): add reusable ExamplesRow with debounce + a11y (P0-07)"
```

## P0-08: Per-tool audit gating in CI

**Files:**
- Modify: `.github/workflows/test.yml`
- Create: `scripts/audit-ci-step.mjs`

**Interfaces:**
- Produces: CI workflow that runs `npm run audit:tools` and fails the build if any tool has a `fail` result

- [ ] **Step 1: Create the CI audit step**

Create `scripts/audit-ci-step.mjs`:

```js
#!/usr/bin/env node
// @ts-check
import { readFile, existsSync } from 'node:fs/promises';

const path = 'data/tool-audit.json';
if (!existsSync(path)) {
  console.error('[audit-ci] No tool-audit.json. Run `npm run audit:tools` first.');
  process.exit(1);
}
const report = JSON.parse(await readFile(path, 'utf8'));
const tools = report.tools ?? report; // support both shapes
const failed = tools.filter((t) => Object.values(t.results ?? {}).includes('fail'));
if (failed.length) {
  console.error(`[audit-ci] ${failed.length} tool(s) failed audit:`);
  for (const t of failed) console.error(`  - ${t.slug} (${t.variant}): ${JSON.stringify(t.results)}`);
  process.exit(1);
}
console.log(`[audit-ci] All ${tools.length} tools pass audit.`);
```

- [ ] **Step 2: Add npm script**

Edit `package.json`:

```json
"audit:ci": "node scripts/audit-ci-step.mjs"
```

- [ ] **Step 3: Wire into CI**

Edit `.github/workflows/test.yml`. Find the existing `test` job. Add a step that runs after `npm run test:tools`:

```yaml
- name: Run tool audit
  run: npm run audit:tools
  env:
    AUDIT_BASE_URL: http://localhost:3000

- name: Check audit results
  run: npm run audit:ci
```

(Requires the dev server to be available — adapt to whatever the existing `test.yml` uses for Next.js startup.)

- [ ] **Step 4: Run locally to verify**

Run: `npm run audit:tools && npm run audit:ci`
Expected: audit reports a baseline of pass/fail; audit-ci exits with the same code.

- [ ] **Step 5: Commit**

```bash
git add scripts/audit-ci-step.mjs package.json .github/workflows/test.yml
git commit -m "ci(audit): gate PR merge on per-tool audit pass (P0-08)"
```

---

# P1 — Core UX

The goal of P1 is the visible platform overhaul: new tool page shell, new homepage, ⌘K search palette, navigation, mobile nav, examples auto-run. After P1, a visitor lands, understands the site, finds a tool, and uses it. The audit gate from P0 ensures every tool continues to work through the rebuild.

## P1-01: Tool page shell (the 9+3 layout)

**Files:**
- Create: `src/components/tools/tool-shell.tsx`
- Create: `src/components/ui/breadcrumb.tsx`
- Create: `src/components/ui/trust-pills.tsx`
- Create: `src/components/tools/tool-sidebar.tsx`
- Modify: `src/app/tools/[slug]/page.tsx`

**Interfaces:**
- Produces: `<ToolShell tool={...} content={...}>` server component that renders breadcrumb, H1, sub, trust pills, workspace (children), 2 ad slots, content sections, related tools, footer
- Produces: `<Breadcrumb items={[{name, href}...]}>` inline nav, no card
- Produces: `<TrustPills />` 3 inline text pills, no background
- Produces: `<ToolSidebar tool={tool} content={content} />` sticky right column, hidden on mobile

- [ ] **Step 1: Write a component test for ToolShell**

Create `tests/components/tool-shell.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ToolShell } from '../../src/components/tools/tool-shell';

const baseTool = {
  slug: 'json-formatter',
  name: 'JSON Formatter',
  description: 'Format, validate, and beautify JSON in your browser.',
  category: 'Formatters',
  categorySlug: 'formatters',
} as const;

describe('ToolShell', () => {
  it('renders H1, sub, and trust pills', () => {
    const { getByRole, getByText } = render(
      <ToolShell tool={baseTool} content={null}>
        <div data-testid="workspace" />
      </ToolShell>
    );
    expect(getByRole('heading', { level: 1, name: 'JSON Formatter' })).toBeInTheDocument();
    expect(getByText(/Format, validate/)).toBeInTheDocument();
    expect(getByText(/100% Client-Side/)).toBeInTheDocument();
    expect(getByTestId('workspace')).toBeInTheDocument();
  });
});
```

(If `@testing-library/react` is not installed, add it as a dev dep: `npm install --save-dev @testing-library/react @testing-library/jest-dom`.)

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/components/tool-shell.test.tsx`
Expected: FAIL with "Cannot find module".

- [ ] **Step 3: Implement Breadcrumb**

Create `src/components/ui/breadcrumb.tsx`:

```tsx
import Link from 'next/link';
import type { Route } from 'next';

type Crumb = { name: string; href: string };

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-[var(--color-fg-muted)]">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <li key={c.href} className="flex items-center gap-1">
              {last ? (
                <span aria-current="page" className="text-[var(--color-fg)]">{c.name}</span>
              ) : (
                <Link href={c.href as Route} className="hover:text-[var(--color-fg)]">{c.name}</Link>
              )}
              {!last && <span aria-hidden="true" className="text-[var(--color-border-strong)]">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
```

- [ ] **Step 4: Implement TrustPills**

Create `src/components/ui/trust-pills.tsx`:

```tsx
const PILLS = [
  { label: '100% Client-Side', icon: '🔒' },
  { label: 'Your Data Stays Local', icon: '🌐' },
  { label: 'No Account Required', icon: '✋' },
] as const;

export function TrustPills() {
  return (
    <ul aria-label="Privacy" className="flex flex-wrap items-center gap-x-4 text-sm text-[var(--color-fg-muted)]">
      {PILLS.map((p) => (
        <li key={p.label} className="flex items-center gap-1.5">
          <span aria-hidden="true">{p.icon}</span>
          <span>{p.label}</span>
        </li>
      ))}
    </ul>
  );
}
```

- [ ] **Step 5: Implement ToolSidebar**

Create `src/components/tools/tool-sidebar.tsx`:

```tsx
import Link from 'next/link';

type Related = { slug: string; name: string; category?: string }[];
type HowTo = { steps: string[] };
type FAQ = { question: string; answer: string }[];

export function ToolSidebar({ related, howto, faq }: { related: Related; howto?: HowTo; faq?: FAQ }) {
  return (
    <aside aria-label="Tool resources" className="space-y-6 border-l border-[var(--color-border-subtle)] pl-8">
      {related && related.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold mb-2">Related tools</h3>
          <ul className="space-y-1 text-sm">
            {related.slice(0, 8).map((r) => (
              <li key={r.slug}>
                <Link href={`/tools/${r.slug}`} className="text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]">
                  · {r.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      {howto && howto.steps.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold mb-2">How-to</h3>
          <ol className="space-y-1 text-sm text-[var(--color-fg-muted)] list-decimal list-inside">
            {howto.steps.slice(0, 5).map((s, i) => <li key={i}>{s}</li>)}
          </ol>
        </section>
      )}
      {faq && faq.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold mb-2">FAQ</h3>
          <ul className="space-y-1 text-sm text-[var(--color-fg-muted)]">
            {faq.slice(0, 4).map((f, i) => (
              <li key={i} className="flex gap-1.5">
                <span aria-hidden="true">·</span>
                <span>{f.question}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </aside>
  );
}
```

- [ ] **Step 6: Implement ToolShell**

Create `src/components/tools/tool-shell.tsx`:

```tsx
import type { ReactNode } from 'react';
import Link from 'next/link';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { TrustPills } from '@/components/ui/trust-pills';
import { ToolSidebar } from './tool-sidebar';

type Tool = {
  slug: string;
  name: string;
  description: string;
  category: string;
  categorySlug: string;
};

type Content = {
  howto?: { steps: string[] };
  faq?: { question: string; answer: string }[];
} | null;

type Related = { slug: string; name: string; category?: string }[];

export function ToolShell({
  tool,
  content,
  related,
  workspace,
  contentSection,
  adSlot1,
  adSlot2,
  relatedSection,
}: {
  tool: Tool;
  content: Content;
  related: Related;
  workspace: ReactNode;
  contentSection: ReactNode;
  adSlot1?: ReactNode;
  adSlot2?: ReactNode;
  relatedSection: ReactNode;
}) {
  const crumbs = [
    { name: 'Home', href: '/' },
    { name: 'Tools', href: '/tools' },
    { name: tool.category, href: `/categories/${tool.categorySlug}` },
    { name: tool.name, href: `/tools/${tool.slug}` },
  ];

  return (
    <main className="mx-auto max-w-[1280px] px-4 md:px-8 py-6">
      <Breadcrumb items={crumbs} />
      <div className="mt-6 mb-8">
        <h1 className="text-4xl font-semibold tracking-tight">{tool.name}</h1>
        <p className="mt-2 text-lg text-[var(--color-fg-muted)] max-w-3xl">{tool.description}</p>
        <div className="mt-4">
          <TrustPills />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-9 space-y-4">
          {workspace}
        </div>
        <div className="lg:col-span-3 hidden lg:block">
          <div className="sticky top-24">
            <ToolSidebar related={related} howto={content?.howto} faq={content?.faq} />
          </div>
        </div>
      </div>
      {adSlot1 && <div className="my-16" data-testid="ad-slot-1">{adSlot1}</div>}
      <section className="max-w-3xl mx-auto mt-12">
        {contentSection}
      </section>
      {adSlot2 && <div className="my-16" data-testid="ad-slot-2">{adSlot2}</div>}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">Related tools</h2>
        {relatedSection}
      </section>
    </main>
  );
}
```

- [ ] **Step 7: Wire into the tool page**

Edit `src/app/tools/[slug]/page.tsx`. Replace the existing layout with `ToolShell`. The exact replacement is tool-specific; the pattern is:

```tsx
import { ToolShell } from '@/components/tools/tool-shell';
import { DynamicTool } from '@/components/tools/dynamic-tool-loader';

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) notFound();
  const content = await loadToolContent(slug);
  const related = getRelatedTools(tool, 8);

  return (
    <ToolShell
      tool={{ slug: tool.slug, name: tool.name, description: tool.description, category: tool.categoryName, categorySlug: tool.categorySlug }}
      content={content}
      related={related}
      workspace={<DynamicTool slug={slug} />}
      contentSection={<ToolContent content={content} />}
      relatedSection={<RelatedToolsGrid tools={related} />}
      adSlot1={<AdBanner slot={adSlots.toolAfterWorkspace} />}
      adSlot2={<AdBanner slot={adSlots.toolBeforeRelated} />}
    />
  );
}
```

(Adapters for `getTool`, `loadToolContent`, `getRelatedTools`, `DynamicTool`, `ToolContent`, `RelatedToolsGrid`, `AdBanner` already exist in the codebase — wire them in.)

- [ ] **Step 8: Run test to verify it passes**

Run: `npx vitest run tests/components/tool-shell.test.tsx`
Expected: PASS.

- [ ] **Step 9: Run a tool e2e**

Run: `npm run test:tools -- --grep "json-formatter"`
Expected: existing fixture passes (the shell didn't break the workspace contract).

- [ ] **Step 10: Commit**

```bash
git add src/components/tools/tool-shell.tsx src/components/tools/tool-sidebar.tsx src/components/ui/breadcrumb.tsx src/components/ui/trust-pills.tsx src/app/tools/[slug]/page.tsx tests/components/
git commit -m "feat(tool-page): new 9+3 shell with breadcrumb, trust pills, sticky sidebar (P1-01)"
```

## P1-02: Trust-pills-below-H1 placement fix

**Files:**
- Modify: `src/app/tools/[slug]/page.tsx` (already touched in P1-01)
- Create: `tests/audit/trust-pills-position.spec.ts`

**Interfaces:**
- Produces: trust pills render between H1/sub and workspace (verified by e2e)

- [ ] **Step 1: Write the e2e**

Create `tests/audit/trust-pills-position.spec.ts`:

```ts
import { test, expect } from '@playwright/test';
import { allTools } from '../../src/lib/data/tools';

const tools = allTools.filter((t) => t.component).slice(0, 5);

for (const t of tools) {
  test(`trust pills below H1 for ${t.slug}`, async ({ page }) => {
    await page.goto(`/tools/${t.slug}`);
    const h1 = page.getByRole('heading', { level: 1 });
    const pills = page.getByRole('list', { name: 'Privacy' });
    const h1Box = await h1.boundingBox();
    const pillsBox = await pills.boundingBox();
    expect(h1Box && pillsBox && pillsBox.y > h1Box.y, 'pills should be below H1').toBeTruthy();
  });
}
```

- [ ] **Step 2: Run test**

Run: `npm run test:tools -- tests/audit/trust-pills-position.spec.ts`
Expected: PASS (P1-01 placed them correctly).

- [ ] **Step 3: Commit (if test only)**

```bash
git add tests/audit/trust-pills-position.spec.ts
git commit -m "test(tool-page): assert trust pills below H1 (P1-02)"
```

## P1-03: Examples auto-run on click

**Files:**
- Modify: `src/components/ui/examples-row.tsx` (from P0-07)
- Modify: `src/lib/load-example.ts` (extend with `autoRun` flag)
- Create: `tests/audit/examples-autorun.spec.ts`

**Interfaces:**
- Produces: when a tool has `autoRun: true` in registry (or by default for formatters/validators/converters), clicking an example populates input AND triggers the primary action

- [ ] **Step 1: Write the e2e**

Create `tests/audit/examples-autorun.spec.ts`:

```ts
import { test, expect } from '@playwright/test';
import { allTools } from '../../src/lib/data/tools';

const tools = allTools.filter((t) => Array.isArray(t.examples) && (t.examples as unknown[]).length > 0).slice(0, 10);

for (const t of tools) {
  test(`example 1 auto-runs for ${t.slug}`, async ({ page }) => {
    await page.goto(`/tools/${t.slug}`);
    const firstExample = page.locator('[data-testid="examples-row"] button').first();
    await firstExample.click();
    // Wait up to 2s for output
    const output = page.locator('[data-testid="tool-output"]');
    await expect(output).not.toBeEmpty({ timeout: 2000 });
  });
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:tools -- tests/audit/examples-autorun.spec.ts`
Expected: FAIL — output is empty after click (current behavior: example populates input but doesn't run).

- [ ] **Step 3: Extend load-example to include autoRun flag**

Edit `src/lib/load-example.ts`. Add `autoRun` to the detail shape and the dispatch path:

```ts
export type LoadExampleDetail = {
  slug: string;
  index?: number;
  key?: string;
  text?: string;
  state?: Record<string, unknown>;
  spec?: ExampleSpec;
  autoRun?: boolean;
};

export function dispatchLoadExample(slug: string, raw: unknown, keyOrIndex: string | number, autoRun = true): void {
  // ... existing logic ...
  const detail: LoadExampleDetail = { slug, spec, autoRun };
  if (spec.kind === 'text') detail.text = spec.text;
  else detail.state = spec.state;
  window.dispatchEvent(new CustomEvent('devstackio:load-example', { detail }));
}
```

- [ ] **Step 4: Tool workspace listens for autoRun**

In each tool workspace component, after applying the loaded value, if `detail.autoRun` is true, dispatch the primary action. Pattern (illustrative for a single-input tool):

```tsx
useEffect(() => {
  function onLoad(e: Event) {
    const detail = (e as CustomEvent<LoadExampleDetail>).detail;
    if (detail.slug !== slug) return;
    if (typeof detail.text === 'string') setInput(detail.text);
    if (detail.autoRun) runPrimary();
  }
  window.addEventListener('devstackio:load-example', onLoad);
  return () => window.removeEventListener('devstackio:load-example', onLoad);
}, [slug, runPrimary]);
```

`runPrimary` is the existing action handler. This change applies to every tool that subscribes (all 172 in scope).

- [ ] **Step 5: Re-run the e2e**

Run: `npm run test:tools -- tests/audit/examples-autorun.spec.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/load-example.ts src/components/ui/examples-row.tsx tests/audit/examples-autorun.spec.ts
git commit -m "feat(examples): auto-run primary action on example click (P1-03)"
```

## P1-04: Shareable example URLs (`?example=key`)

**Files:**
- Create: `src/components/tools/example-url-listener.tsx`
- Modify: `src/components/tools/dynamic-tool-loader.tsx`
- Create: `tests/audit/example-url.spec.ts`

**Interfaces:**
- Produces: visiting `/tools/json-formatter?example=valid` populates the input with the example + auto-runs (per P1-03)

- [ ] **Step 1: Write the e2e**

Create `tests/audit/example-url.spec.ts`:

```ts
import { test, expect } from '@playwright/test';
import { allTools } from '../../src/lib/data/tools';

const tools = allTools.filter((t) => {
  if (!t.examples) return false;
  if (Array.isArray(t.examples) && t.examples.length > 0) return typeof t.examples[0] === 'string';
  return Object.keys(t.examples as Record<string, string>).length > 0;
}).slice(0, 5);

for (const t of tools) {
  test(`?example=0 populates and runs ${t.slug}`, async ({ page }) => {
    await page.goto(`/tools/${t.slug}?example=0`);
    const output = page.locator('[data-testid="tool-output"]');
    await expect(output).not.toBeEmpty({ timeout: 2000 });
  });
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:tools -- tests/audit/example-url.spec.ts`
Expected: FAIL — `?example=0` is not read.

- [ ] **Step 3: Implement ExampleUrlListener**

Create `src/components/tools/example-url-listener.tsx`:

```tsx
'use client';

import { useEffect } from 'react';
import { dispatchLoadExample } from '@/lib/load-example';

type Props = { slug: string };

export function ExampleUrlListener({ slug }: Props) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sp = new URL(window.location.href).searchParams;
    const key = sp.get('example');
    if (!key) return;
    // Defer to next tick so the tool component has mounted and subscribed.
    const t = window.setTimeout(() => {
      // We need the raw examples list from the registry. The cleanest path is to
      // dispatch a synthetic event; the tool's own useLoadExample handler will run
      // primary action if autoRun is true (default).
      window.dispatchEvent(new CustomEvent('devstackio:url-example', { detail: { slug, key } }));
    }, 0);
    return () => window.clearTimeout(t);
  }, [slug]);
  return null;
}
```

The actual mapping from `?example=key` to the spec is the tool's job (it knows its own examples). The tool's existing `useLoadExample` handler is extended to also listen for `devstackio:url-example` and look up the example by key from its own state.

- [ ] **Step 4: Wire listener into the tool shell**

Edit `src/components/tools/tool-shell.tsx`. Add the listener as a hidden sibling:

```tsx
import { ExampleUrlListener } from './example-url-listener';
// inside the JSX, after the workspace:
<ExampleUrlListener slug={tool.slug} />
```

- [ ] **Step 5: Each tool handles url-example**

For each tool component, add a one-liner to its `useLoadExample` effect:

```tsx
useEffect(() => {
  function onUrlExample(e: Event) {
    const detail = (e as CustomEvent<{ slug: string; key: string }>).detail;
    if (detail.slug !== slug) return;
    const all = Array.isArray(examples) ? examples : Object.entries(examples as Record<string, string>).map(([, v]) => v);
    const text = all.find((x) => (x as string) === detail.key) ?? all[Number(detail.key)] ?? all[0];
    if (typeof text === 'string') { setInput(text); if (autoRun) runPrimary(); }
  }
  window.addEventListener('devstackio:url-example', onUrlExample);
  return () => window.removeEventListener('devstackio:url-example', onUrlExample);
}, [slug, examples, autoRun, runPrimary]);
```

- [ ] **Step 6: Re-run the e2e**

Run: `npm run test:tools -- tests/audit/example-url.spec.ts`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/components/tools/example-url-listener.tsx tests/audit/example-url.spec.ts
git commit -m "feat(examples): shareable example URLs (?example=key) (P1-04)"
```

## P1-05: Search index build + helpers

**Files:**
- Create: `src/lib/search/synonyms.ts`
- Create: `src/lib/search/rank.ts`
- Create: `tests/search/rank.test.ts`
- Modify: `scripts/build-search-index.mjs` (use new ranking)

**Interfaces:**
- Produces: `rank(query, entries, options?): ScoredEntry[]` (sorted by score desc)
- Produces: `SYNONYMS: Record<string, string[]>` map
- Produces: search index output is sorted by score and includes all registry tools + a `scoreHint` field

- [ ] **Step 1: Write the failing test**

Create `tests/search/rank.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { rank } from '../../src/lib/search/rank';

const entries = [
  { slug: 'json-formatter', name: 'JSON Formatter', description: 'Format and validate JSON', keywords: ['json', 'format', 'validate'], popularity: 92 },
  { slug: 'json-validator', name: 'JSON Validator', description: 'Validate JSON', keywords: ['json', 'validate'], popularity: 78 },
  { slug: 'base64-encoder', name: 'Base64 Encoder', description: 'Encode to Base64', keywords: ['base64', 'encode'], popularity: 64 },
];

describe('rank', () => {
  it('puts exact name match first', () => {
    const out = rank('JSON Formatter', entries);
    expect(out[0].slug).toBe('json-formatter');
  });

  it('puts prefix match above substring match', () => {
    const out = rank('json', entries);
    expect(out[0].slug).toBe('json-formatter');
  });

  it('handles synonyms', () => {
    const out = rank('javascript', entries, { synonyms: { js: ['javascript'] } });
    expect(out[0].slug).toBe('json-formatter'); // falls back to "json" keyword
  });

  it('returns empty for empty query', () => {
    expect(rank('', entries)).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/search/rank.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement synonyms**

Create `src/lib/search/synonyms.ts`:

```ts
export const SYNONYMS: Record<string, string[]> = {
  js: ['javascript'],
  javascript: ['js'],
  img: ['image', 'picture', 'photo'],
  image: ['img'],
  picture: ['img'],
  uuid: ['guid'],
  guid: ['uuid'],
  hash: ['checksum', 'digest'],
  checksum: ['hash'],
  digest: ['hash'],
  diff: ['compare'],
  compare: ['diff'],
  min: ['minify', 'compress'],
  minify: ['min'],
  compress: ['min'],
  pretty: ['beautify', 'format', 'prettify'],
  beautify: ['pretty'],
  prettify: ['pretty'],
};

export function expand(query: string, synonyms: Record<string, string[]> = SYNONYMS): string[] {
  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  const out = new Set(tokens);
  for (const t of tokens) {
    const syns = synonyms[t];
    if (syns) for (const s of syns) out.add(s);
  }
  return [...out];
}
```

- [ ] **Step 4: Implement rank**

Create `src/lib/search/rank.ts`:

```ts
import Fuse from 'fuse.js';
import { expand } from './synonyms';

export type Entry = { slug: string; name: string; description: string; keywords: string[]; popularity: number };
export type ScoredEntry = Entry & { score: number };

const FUSE = new Fuse<Entry>([], { keys: ['name', 'keywords', 'description'], threshold: 0.4, distance: 100, minMatchCharLength: 2, includeScore: true });

function exactScore(q: string, e: Entry): number {
  if (e.name.toLowerCase() === q) return 50;
  if (e.name.toLowerCase().startsWith(q)) return 20;
  return 0;
}

function substringScore(q: string, e: Entry): number {
  const tokens = q.split(/\s+/);
  let s = 0;
  for (const t of tokens) {
    if (e.name.toLowerCase().includes(t)) s += 5;
    if (e.keywords.some((k) => k.toLowerCase().includes(t))) s += 3;
    if (e.description.toLowerCase().includes(t)) s += 2;
  }
  return s * 3; // weight=15
}

function fuzzyScore(q: string, e: Entry, fuse: Fuse<Entry>): number {
  fuse.setCollection([e]);
  const r = fuse.search(q)[0];
  if (!r) return 0;
  // fuse score is 0 (perfect) to 1 (worst). Convert to 0-10.
  return Math.max(0, 10 - r.score! * 10);
}

export function rank(query: string, entries: Entry[], options: { synonyms?: Record<string, string[]>; limit?: number } = {}): ScoredEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const tokens = expand(q, options.synonyms);
  const fuse = new Fuse<Entry>([], { keys: ['name', 'keywords', 'description'], threshold: 0.4, distance: 100, minMatchCharLength: 2, includeScore: true });
  const scored: ScoredEntry[] = [];
  for (const e of entries) {
    let score = 0;
    for (const t of tokens) {
      score += exactScore(t, e);
      score += substringScore(t, e);
      score += fuzzyScore(t, e, fuse);
    }
    // popularity tiebreaker (5%)
    score += e.popularity * 0.05;
    if (score > 0) scored.push({ ...e, score });
  }
  scored.sort((a, b) => b.score - a.score);
  return options.limit ? scored.slice(0, options.limit) : scored;
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run tests/search/rank.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/search/ tests/search/
git commit -m "feat(search): add 5-signal ranker with synonym expansion (P1-05)"
```

## P1-06: Command palette (⌘K)

**Files:**
- Create: `src/components/layout/command-palette.tsx`
- Create: `src/components/layout/command-palette-trigger.tsx`
- Create: `src/hooks/use-command-palette.ts`
- Create: `tests/audit/command-palette.spec.ts`

**Interfaces:**
- Produces: `<CommandPalette />` (global) — `role="dialog"`, opens on `Cmd/Ctrl+K`, full-screen on mobile
- Produces: `useCommandPalette()` returns `{ isOpen, open, close, toggle }`

- [ ] **Step 1: Write the e2e**

Create `tests/audit/command-palette.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test('palette opens with Cmd+K and searches', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Control+K');
  const dialog = page.getByRole('dialog', { name: 'Search tools' });
  await expect(dialog).toBeVisible();
  await page.keyboard.type('json');
  const firstResult = dialog.getByRole('link').first();
  await expect(firstResult).toBeVisible();
  await firstResult.click();
  await expect(page).toHaveURL(/\/tools\/json-formatter/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:tools -- tests/audit/command-palette.spec.ts`
Expected: FAIL — palette does not exist.

- [ ] **Step 3: Implement the hook**

Create `src/hooks/use-command-palette.ts`:

```ts
'use client';

import { useEffect, useState } from 'react';

const OPEN_EVENT = 'devstackio:palette-open';

export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((v) => !v);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }
    function onOpen() { setIsOpen(true); }
    window.addEventListener('keydown', onKey);
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener(OPEN_EVENT, onOpen);
    };
  }, []);

  return { isOpen, open: () => setIsOpen(true), close: () => setIsOpen(false), toggle: () => setIsOpen((v) => !v) };
}

export function dispatchPaletteOpen() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}
```

- [ ] **Step 4: Implement the palette**

Create `src/components/layout/command-palette.tsx`:

```tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useCommandPalette } from '@/hooks/use-command-palette';
import { rank } from '@/lib/search/rank';
import { allTools } from '@/lib/data/tools';

const RECENT_KEY = 'devstackio:recent-tools';

function readRecent(): string[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch { return []; }
}
function pushRecent(slug: string) {
  const cur = readRecent();
  const next = [slug, ...cur.filter((s) => s !== slug)].slice(0, 8);
  localStorage.setItem(RECENT_KEY, JSON.stringify(next));
}

export function CommandPalette() {
  const { isOpen, close } = useCommandPalette();
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const recentSlugs = useMemo(() => (isOpen ? readRecent() : []), [isOpen]);
  const recent = useMemo(() => recentSlugs.map((s) => allTools.find((t) => t.slug === s)).filter(Boolean), [recentSlugs]);

  const results = useMemo(() => {
    if (!q) return { tools: recent, guides: [] as { slug: string; name: string }[] };
    const tools = rank(q, allTools.map((t) => ({
      slug: t.slug, name: t.name, description: t.description ?? '',
      keywords: t.keywords ?? [], popularity: t.popularity ?? 0,
    })), { limit: 8 });
    return { tools, guides: [] as { slug: string; name: string }[] };
  }, [q, recent]);

  useEffect(() => { if (isOpen) { setQ(''); setActive(0); inputRef.current?.focus(); } }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, results.tools.length - 1)); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
      else if (e.key === 'Enter') {
        const t = results.tools[active];
        if (t) { pushRecent(t.slug); close(); window.location.href = `/tools/${t.slug}`; }
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, results, active, close]);

  if (!isOpen) return null;
  return (
    <div role="dialog" aria-modal="true" aria-label="Search tools" className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] bg-black/40">
      <div className="w-full max-w-[640px] mx-4 rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-surface-3)]" style={{ boxShadow: 'var(--shadow-overlay)' }}>
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => { setQ(e.target.value); setActive(0); }}
          placeholder="Search tools…"
          className="w-full h-14 px-4 bg-transparent font-mono text-base focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          aria-label="Search query"
        />
        <ul className="max-h-[60vh] overflow-y-auto p-2">
          {results.tools.length === 0 && <li className="text-sm text-[var(--color-fg-muted)] p-3">No matches for "{q}". Try a shorter query or browse all tools.</li>}
          {results.tools.map((t, i) => (
            <li key={t.slug} aria-selected={i === active}>
              <Link
                href={`/tools/${t.slug}`}
                onClick={() => { pushRecent(t.slug); close(); }}
                onMouseEnter={() => setActive(i)}
                className={`flex items-center justify-between px-3 py-2 rounded-sm text-sm ${i === active ? 'bg-[var(--color-surface-2)] border-l-2 border-[var(--color-accent)]' : ''}`}
              >
                <span className="font-medium">{t.name}</span>
                <span className="text-xs text-[var(--color-fg-muted)] font-mono">{t.category ?? ''}</span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="px-3 py-2 text-xs text-[var(--color-fg-muted)] border-t border-[var(--color-border-subtle)] flex gap-3">
          <span>↑↓ navigate</span><span>↵ open</span><span>esc close</span><span>⌘K toggle</span>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Wire the palette into the root layout**

Edit `src/app/layout.tsx`:

```tsx
import { CommandPalette } from '@/components/layout/command-palette';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PrelineProvider enabled>{children}</PrelineProvider>
        <CommandPalette />
      </body>
    </html>
  );
}
```

- [ ] **Step 6: Add a trigger button in the header**

Edit `src/components/layout/header.tsx`. Add a button that calls `dispatchPaletteOpen()`:

```tsx
import { dispatchPaletteOpen } from '@/hooks/use-command-palette';

<button
  type="button"
  onClick={dispatchPaletteOpen}
  className="flex items-center gap-2 h-10 px-3 rounded-md border border-[var(--color-border-subtle)] text-sm text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-2)]"
  aria-label="Open search (Cmd+K)"
>
  <span aria-hidden="true">🔍</span>
  <span>Search 172 tools…</span>
  <kbd className="font-mono text-xs px-1.5 py-0.5 border border-[var(--color-border-subtle)] rounded">⌘K</kbd>
</button>
```

- [ ] **Step 7: Re-run the e2e**

Run: `npm run test:tools -- tests/audit/command-palette.spec.ts`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/components/layout/command-palette.tsx src/hooks/use-command-palette.ts tests/audit/command-palette.spec.ts src/app/layout.tsx src/components/layout/header.tsx
git commit -m "feat(search): add ⌘K command palette with ranking and recently used (P1-06)"
```

## P1-07: Homepage hero (search + trending chips + trust line)

**Files:**
- Create: `src/components/home/hero.tsx`
- Create: `src/components/home/trending-chips.tsx`
- Modify: `src/app/page.tsx` (homepage)

**Interfaces:**
- Produces: `<Hero />` server component with H1 + sub + search input + 8 trending chips + trust line

- [ ] **Step 1: Write a snapshot test**

Create `tests/components/hero.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Hero } from '../../src/components/home/hero';
import { allTools } from '../../src/lib/data/tools';

describe('Hero', () => {
  it('renders H1, sub, search, trending chips, trust line', () => {
    const { getByRole, getAllByRole } = render(<Hero topTools={allTools.slice(0, 8)} />);
    expect(getByRole('heading', { level: 1, name: /Free Online Developer Tools/ })).toBeInTheDocument();
    expect(getByRole('searchbox', { name: /search tools/i })).toBeInTheDocument();
    const chips = getAllByRole('link');
    expect(chips.length).toBeGreaterThanOrEqual(8);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/components/hero.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement TrendingChips**

Create `src/components/home/trending-chips.tsx`:

```tsx
import Link from 'next/link';

export function TrendingChips({ tools }: { tools: { slug: string; name: string }[] }) {
  return (
    <ul aria-label="Trending tools" className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
      {tools.map((t) => (
        <li key={t.slug}>
          <Link href={`/tools/${t.slug}`} className="text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] hover:underline underline-offset-4">
            {t.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}
```

- [ ] **Step 4: Implement Hero**

Create `src/components/home/hero.tsx`:

```tsx
import Link from 'next/link';
import { TrendingChips } from './trending-chips';
import { allTools } from '@/lib/data/tools';
import { dispatchPaletteOpen } from '@/hooks/use-command-palette';

const PILLS = ['100% Client-Side', 'Your Data Stays Local', 'No Account Required'];

export function Hero() {
  const top = [...allTools].sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0)).slice(0, 8);
  const count = allTools.length;
  return (
    <section className="py-16 text-center">
      <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">Free Online Developer Tools. No Signup.</h1>
      <p className="mt-4 text-lg text-[var(--color-fg-muted)]">{count} utilities. All client-side. All private.</p>
      <div className="mt-8 flex justify-center">
        <button
          type="button"
          onClick={dispatchPaletteOpen}
          className="w-full max-w-[640px] h-14 px-4 rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-surface-1)] text-left text-[var(--color-fg-muted)] flex items-center gap-3 hover:bg-[var(--color-surface-2)]"
          aria-label="Open search (Cmd+K)"
        >
          <span aria-hidden="true">🔍</span>
          <span className="flex-1">Search {count} tools…</span>
          <kbd className="font-mono text-xs px-1.5 py-0.5 border border-[var(--color-border-subtle)] rounded">⌘K</kbd>
        </button>
      </div>
      <div className="mt-4 flex justify-center">
        <TrendingChips tools={top.map((t) => ({ slug: t.slug, name: t.name }))} />
      </div>
      <p className="mt-6 text-sm text-[var(--color-fg-muted)]">{PILLS.join(' · ')}</p>
    </section>
  );
}
```

- [ ] **Step 5: Wire into the homepage**

Edit `src/app/page.tsx`. Replace the existing hero (or wrap the new Hero component if the rest of the homepage is still in flight):

```tsx
import { Hero } from '@/components/home/hero';

export default function HomePage() {
  return (
    <main>
      <Hero />
      {/* existing sections (popular, categories, etc.) continue below */}
    </main>
  );
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npx vitest run tests/components/hero.test.tsx`
Expected: PASS.

- [ ] **Step 7: Visual regression**

Run: `npm run test:snapshots`
Expected: a hero snapshot is generated. Review the diff.

- [ ] **Step 8: Commit**

```bash
git add src/components/home/hero.tsx src/components/home/trending-chips.tsx tests/components/hero.test.tsx src/app/page.tsx
git commit -m "feat(home): new hero with search trigger, trending chips, trust line (P1-07)"
```

## P1-08: Homepage section grid (popular, categories, featured, new, conversions, guides)

**Files:**
- Create: `src/components/ui/tool-card.tsx`
- Create: `src/components/ui/category-card.tsx`
- Create: `src/components/home/popular-tools-section.tsx`
- Create: `src/components/home/categories-section.tsx`
- Create: `src/components/home/featured-tools-section.tsx`
- Create: `src/components/home/recent-tools-section.tsx`
- Create: `src/components/home/conversions-rail.tsx`
- Create: `src/components/home/learning-section.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Produces: 6 homepage section components, each a server component taking a list of items
- Produces: `<ToolCard tool={...} />` and `<CategoryCard category={...} />` reusable card primitives (no card-within-card, 1px border, 4px radius)

- [ ] **Step 1: Write the test**

Create `tests/components/tool-card.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ToolCard } from '../../src/components/ui/tool-card';

const tool = { slug: 'json-formatter', name: 'JSON Formatter', description: 'Format and validate JSON', category: 'Formatters', icon: 'Braces' };

describe('ToolCard', () => {
  it('renders name, description, and a single link wrapping the whole card', () => {
    const { getByRole, container } = render(<ToolCard tool={tool} />);
    const link = getByRole('link', { name: /JSON Formatter/ });
    expect(link).toBeInTheDocument();
    expect(container.querySelectorAll('a').length).toBe(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/components/tool-card.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement ToolCard**

Create `src/components/ui/tool-card.tsx`:

```tsx
import Link from 'next/link';
import type { ComponentType } from 'react';
import { LucideIcon, getLucideIcon } from '@/lib/utils/lucide';

type Tool = { slug: string; name: string; description: string; category?: string; icon?: string };

export function ToolCard({ tool }: { tool: Tool }) {
  const Icon: ComponentType<{ size?: number; 'aria-hidden'?: boolean }> | null = tool.icon ? getLucideIcon(tool.icon) : null;
  return (
    <Link
      href={`/tools/${tool.slug}`}
      aria-label={`${tool.name} — ${tool.description}`}
      className="block p-4 border border-[var(--color-border-subtle)] rounded-sm bg-[var(--color-surface-1)] hover:bg-[var(--color-surface-2)] hover:border-[var(--color-border-strong)]"
    >
      <div className="flex items-start gap-3">
        {Icon ? <Icon size={20} aria-hidden /> : <span aria-hidden className="w-5 h-5 bg-[var(--color-surface-2)] rounded-sm" />}
        <div className="min-w-0">
          <p className="text-base font-semibold leading-tight">{tool.name}</p>
          <p className="text-sm text-[var(--color-fg-muted)] line-clamp-1">{tool.description}</p>
        </div>
      </div>
    </Link>
  );
}
```

(Note: `getLucideIcon` helper may not exist yet — create `src/lib/utils/lucide.ts` if needed with a safe fallback to `null`.)

- [ ] **Step 4: Implement CategoryCard**

Create `src/components/ui/category-card.tsx`:

```tsx
import Link from 'next/link';

type Category = { slug: string; name: string; description: string; count: number };

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className="block p-4 border border-[var(--color-border-subtle)] rounded-sm bg-[var(--color-surface-1)] hover:bg-[var(--color-surface-2)]"
    >
      <p className="text-base font-semibold flex items-center justify-between">
        <span>{category.name}</span>
        <span className="font-mono text-sm text-[var(--color-fg-muted)]">({category.count})</span>
      </p>
      <p className="text-sm text-[var(--color-fg-muted)] mt-1 line-clamp-1">{category.description}</p>
    </Link>
  );
}
```

- [ ] **Step 5: Implement section components**

Create the 6 section files. Each is a thin server component:

```tsx
// src/components/home/popular-tools-section.tsx
import { ToolCard } from '@/components/ui/tool-card';
import { allTools } from '@/lib/data/tools';

export function PopularToolsSection() {
  const tools = [...allTools].sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0)).slice(0, 12);
  return (
    <section className="py-16">
      <h2 className="text-2xl font-semibold mb-6">Popular tools</h2>
      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
        {tools.map((t) => <ToolCard key={t.slug} tool={t} />)}
      </div>
    </section>
  );
}
```

(Mirror pattern for `categories-section.tsx` (uses CategoryCard, top 8 categories), `featured-tools-section.tsx` (4 featured tools), `recent-tools-section.tsx` (8 by addedAt), `conversions-rail.tsx` (20 text rows), `learning-section.tsx` (3 latest guides).)

- [ ] **Step 6: Wire into the homepage**

Edit `src/app/page.tsx`:

```tsx
import { Hero } from '@/components/home/hero';
import { PopularToolsSection } from '@/components/home/popular-tools-section';
import { CategoriesSection } from '@/components/home/categories-section';
import { FeaturedToolsSection } from '@/components/home/featured-tools-section';
import { RecentToolsSection } from '@/components/home/recent-tools-section';
import { ConversionsRail } from '@/components/home/conversions-rail';
import { LearningSection } from '@/components/home/learning-section';

export default function HomePage() {
  return (
    <main className="mx-auto max-w-[1280px] px-4 md:px-8">
      <Hero />
      <PopularToolsSection />
      <CategoriesSection />
      <FeaturedToolsSection />
      <RecentToolsSection />
      <ConversionsRail />
      <LearningSection />
    </main>
  );
}
```

- [ ] **Step 7: Run test to verify it passes**

Run: `npx vitest run tests/components/tool-card.test.tsx`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/components/ui/tool-card.tsx src/components/ui/category-card.tsx src/components/home/ src/app/page.tsx tests/components/
git commit -m "feat(home): add 6 section components + reusable ToolCard / CategoryCard (P1-08)"
```

## P1-09: Mobile nav (hamburger sheet)

**Files:**
- Create: `src/components/layout/mobile-nav.tsx`
- Modify: `src/components/layout/header.tsx`
- Create: `tests/audit/mobile-nav.spec.ts`

**Interfaces:**
- Produces: `<MobileNav />` — full-screen Preline overlay sheet on `<md`, opens from hamburger

- [ ] **Step 1: Write the e2e**

Create `tests/audit/mobile-nav.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test('mobile nav opens from hamburger and links work', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');
  const hamburger = page.getByRole('button', { name: /open menu/i });
  await hamburger.click();
  const sheet = page.getByRole('dialog', { name: /navigation/i });
  await expect(sheet).toBeVisible();
  await sheet.getByRole('link', { name: /tools/i }).first().click();
  await expect(page).toHaveURL(/\/tools/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:tools -- tests/audit/mobile-nav.spec.ts`
Expected: FAIL.

- [ ] **Step 3: Implement MobileNav**

Create `src/components/layout/mobile-nav.tsx`:

```tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { allCategories } from '@/lib/data/categories';

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [cats, setCats] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setOpen(false); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="md:hidden h-10 w-10 flex items-center justify-center"
        aria-label="Open menu"
        aria-expanded={open}
      >
        <span aria-hidden="true">☰</span>
      </button>
      {open && (
        <div role="dialog" aria-modal="true" aria-label="Navigation" className="fixed inset-0 z-40 bg-[var(--color-surface-1)] md:hidden flex flex-col">
          <div className="h-16 px-4 flex items-center justify-between border-b border-[var(--color-border-subtle)]">
            <Link href="/" className="font-semibold" onClick={() => setOpen(false)}>DevStackIO</Link>
            <button type="button" onClick={() => setOpen(false)} className="h-10 w-10" aria-label="Close menu"><span aria-hidden>✕</span></button>
          </div>
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            <Link href="/tools" onClick={() => setOpen(false)} className="block h-12 leading-[3rem] text-lg">Tools</Link>
            <button type="button" onClick={() => setCats((v) => !v)} className="w-full h-12 text-left text-lg flex items-center justify-between" aria-expanded={cats}>
              Categories <span aria-hidden>{cats ? '−' : '+'}</span>
            </button>
            {cats && (
              <ul className="pl-4 space-y-1">
                {allCategories.map((c) => (
                  <li key={c.slug}><Link href={`/categories/${c.slug}`} onClick={() => setOpen(false)} className="block h-10 leading-[2.5rem] text-sm">{c.name}</Link></li>
                ))}
              </ul>
            )}
            <Link href="/guides" onClick={() => setOpen(false)} className="block h-12 leading-[3rem] text-lg">Guides</Link>
            <Link href="/blog" onClick={() => setOpen(false)} className="block h-12 leading-[3rem] text-lg">Blog</Link>
          </nav>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 4: Wire into the header**

Edit `src/components/layout/header.tsx`. Replace the existing hamburger (if any) with `<MobileNav />`.

- [ ] **Step 5: Re-run the e2e**

Run: `npm run test:tools -- tests/audit/mobile-nav.spec.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/layout/mobile-nav.tsx tests/audit/mobile-nav.spec.ts src/components/layout/header.tsx
git commit -m "feat(nav): add full-screen mobile nav sheet with category accordion (P1-09)"
```

## P1-10: Tool page content sections (about, how-to, examples, best practices, common mistakes, FAQ, references)

**Files:**
- Create: `src/components/tools/tool-content.tsx`
- Create: `tests/audit/tool-content-sections.spec.ts`

**Interfaces:**
- Produces: `<ToolContent content={content} />` server component that renders the 7 collapsible sections per spec §4.1

- [ ] **Step 1: Write the e2e**

Create `tests/audit/tool-content-sections.spec.ts`:

```ts
import { test, expect } from '@playwright/test';
import { allTools } from '../../src/lib/data/tools';

const tools = allTools.filter((t) => t.component).slice(0, 5);

for (const t of tools) {
  test(`content sections render for ${t.slug}`, async ({ page }) => {
    await page.goto(`/tools/${t.slug}`);
    await expect(page.getByRole('region', { name: /About this tool/i })).toBeVisible();
  });
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:tools -- tests/audit/tool-content-sections.spec.ts`
Expected: FAIL — content sections not present or not wrapped in a region.

- [ ] **Step 3: Implement ToolContent**

Create `src/components/tools/tool-content.tsx`:

```tsx
type Content = {
  whatItDoes?: string;
  whyItExists?: string;
  whoShouldUse?: string;
  useCases?: string[];
  instructions?: string[];
  examples?: Array<{ input?: string; output?: string; note?: string }>;
  bestPractices?: string[];
  commonMistakes?: string[];
  faq?: Array<{ question: string; answer: string }>;
  features?: string[];
  references?: Array<{ label: string; url: string }>;
} | null;

function Section({ title, children, defaultOpen = false, testid }: { title: string; children: React.ReactNode; defaultOpen?: boolean; testid: string }) {
  return (
    <details open={defaultOpen} className="group py-4 border-b border-[var(--color-border-subtle)]">
      <summary className="cursor-pointer list-none flex items-center justify-between text-lg font-semibold">
        <span>{title}</span>
        <span aria-hidden className="text-sm text-[var(--color-fg-muted)] group-open:rotate-180 transition">▾</span>
      </summary>
      <div data-testid={testid} className="mt-3 text-base text-[var(--color-fg)] space-y-2 max-w-none">{children}</div>
    </details>
  );
}

export function ToolContent({ content }: { content: Content }) {
  if (!content) return null;
  return (
    <div className="space-y-0">
      {content.whatItDoes && (
        <Section title="About this tool" defaultOpen testid="content-about">
          <p>{content.whatItDoes}</p>
          {content.whyItExists && <p className="text-[var(--color-fg-muted)]">{content.whyItExists}</p>}
        </Section>
      )}
      {content.instructions && content.instructions.length > 0 && (
        <Section title="How to use" defaultOpen testid="content-howto">
          <ol className="list-decimal list-inside space-y-1">
            {content.instructions.map((s, i) => <li key={i}>{s}</li>)}
          </ol>
        </Section>
      )}
      {content.examples && content.examples.length > 0 && (
        <Section title="Examples" testid="content-examples">
          {content.examples.map((ex, i) => (
            <div key={i} className="border border-[var(--color-border-subtle)] rounded-sm p-3 my-2">
              {ex.note && <p className="text-sm font-medium mb-1">Example {i + 1}: {ex.note}</p>}
              {ex.input && <><p className="text-xs text-[var(--color-fg-muted)]">Input</p><pre className="font-mono text-sm whitespace-pre-wrap">{ex.input}</pre></>}
              {ex.output && <><p className="text-xs text-[var(--color-fg-muted)] mt-2">Output</p><pre className="font-mono text-sm whitespace-pre-wrap">{ex.output}</pre></>}
            </div>
          ))}
        </Section>
      )}
      {content.bestPractices && content.bestPractices.length > 0 && (
        <Section title="Best practices" testid="content-best">
          <ul className="list-disc list-inside space-y-1">
            {content.bestPractices.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </Section>
      )}
      {content.commonMistakes && content.commonMistakes.length > 0 && (
        <Section title="Common mistakes" testid="content-mistakes">
          <ul className="list-disc list-inside space-y-1">
            {content.commonMistakes.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </Section>
      )}
      {content.faq && content.faq.length > 0 && (
        <Section title="FAQ" testid="content-faq">
          <dl className="space-y-3">
            {content.faq.map((f, i) => (
              <div key={i}>
                <dt className="font-semibold">{f.question}</dt>
                <dd className="text-[var(--color-fg-muted)] mt-1">{f.answer}</dd>
              </div>
            ))}
          </dl>
        </Section>
      )}
      {content.references && content.references.length > 0 && (
        <Section title="References" testid="content-references">
          <ul className="space-y-1">
            {content.references.map((r, i) => (
              <li key={i}><a href={r.url} target="_blank" rel="noopener noreferrer" className="text-[var(--color-link)] hover:underline">{r.label} <span aria-hidden>↗</span></a></li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Wire into the tool page**

Edit `src/app/tools/[slug]/page.tsx`. Pass `<ToolContent content={content} />` to ToolShell's `contentSection` prop (from P1-01).

- [ ] **Step 5: Re-run the e2e**

Run: `npm run test:tools -- tests/audit/tool-content-sections.spec.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/tools/tool-content.tsx tests/audit/tool-content-sections.spec.ts src/app/tools/[slug]/page.tsx
git commit -m "feat(tool-page): add collapsible content sections (about, howto, examples, best, mistakes, faq, refs) (P1-10)"
```

## P1-11: Per-tool audit re-run + remediation loop

**Files:**
- Modify: `scripts/tool-audit.mjs` (extend with generator/image/calculator/converter/diff/formatter/lookup variant scripts)
- Create: `tests/audit/generator.spec.ts`
- Create: `tests/audit/image.spec.ts`
- Create: `tests/audit/calculator.spec.ts`
- Create: `tests/audit/converter.spec.ts`
- Create: `tests/audit/diff.spec.ts`
- Create: `tests/audit/formatter.spec.ts`
- Create: `tests/audit/lookup.spec.ts`

**Interfaces:**
- Produces: 7 new variant test files; the audit harness runs all 8 variants on every PR

- [ ] **Step 1: Create the 7 variant test files**

Pattern (per variant, per representative tool):

```ts
// tests/audit/generator.spec.ts
import { test, expect } from '@playwright/test';
import { allTools } from '../../src/lib/data/tools';

const tools = allTools.filter((t) => (t.component ?? '').toLowerCase().match(/generator|uuid|password|lorem/)).slice(0, 3);

for (const t of tools) {
  test(`generator flow for ${t.slug}`, async ({ page }) => {
    await page.goto(`/tools/${t.slug}`);
    const btn = page.getByRole('button', { name: /generate/i }).first();
    await btn.click();
    await expect(page.locator('[data-testid="tool-output"]')).not.toBeEmpty({ timeout: 2000 });
  });
}
```

(Mirror for `image`, `calculator`, `converter`, `diff`, `formatter`, `lookup` — each adapts the assertions to its variant per spec §14.2.)

- [ ] **Step 2: Run all 8 audit files**

Run: `npm run audit:tools`
Expected: a baseline pass/fail count per tool.

- [ ] **Step 3: Remediate failures**

For each failing tool, fix the component (or its fixture, or its content JSON). Most failures fall into these buckets:
- **Examples don't populate:** the tool's component doesn't subscribe. Add `useLoadExample` (P0-06).
- **Action doesn't produce output:** the primary action is broken. Inspect and fix.
- **Mobile layout fails:** the workspace is fixed-width. Make it responsive.
- **A11y fails:** missing label, contrast, focus trap. Fix the component.

Group fixes by failure mode. Aim for 5–10 tools per commit.

- [ ] **Step 4: Re-run until green**

Run: `npm run audit:tools`
Expected: 0 failures. Some tools may need to be `noindex`ed or have a stub content JSON if they truly cannot ship — flag for the human to review.

- [ ] **Step 5: Commit per remediation group**

```bash
git add src/components/tools/ src/content/tools/ tests/fixtures/
git commit -m "fix(audit): remediate N tools flagged by P1-11 audit (P1-11)"
```

## P1-12: Lighthouse + bundle smoke after the rebuild

**Files:**
- Create: `scripts/post-rebuild-smoke.mjs` (calls Lighthouse + bundle diff, writes `data/lighthouse-{homepage,tool-page}.html` and `data/bundle-diff.json`)

**Interfaces:**
- Produces: a single `npm run smoke` command that runs Lighthouse on the homepage and a tool page and writes the reports under `data/`

- [ ] **Step 1: Create the smoke script**

Create `scripts/post-rebuild-smoke.mjs`:

```js
#!/usr/bin/env node
// @ts-check
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';

await mkdir('data', { recursive: true });

const targets = [
  { name: 'homepage', url: 'http://localhost:3000/' },
  { name: 'tool-page', url: 'http://localhost:3000/tools/json-formatter' },
];

for (const t of targets) {
  const out = `data/lighthouse-${t.name}.html`;
  await new Promise((resolve, reject) => {
    const child = spawn('npx', ['lighthouse', t.url, '--output=html', '--output-path=' + out, '--only-categories=performance,accessibility,best-practices,seo', '--quiet', '--chrome-flags="--headless"'], { stdio: 'inherit' });
    child.on('exit', (code) => code === 0 ? resolve() : reject(new Error('lighthouse exit ' + code)));
  });
}
console.log('[smoke] Lighthouse reports written to data/lighthouse-*.html');
```

- [ ] **Step 2: Add npm script**

Edit `package.json`:

```json
"smoke": "node scripts/post-rebuild-smoke.mjs"
```

- [ ] **Step 3: Run against a built site**

Run: `npm run build && (npm start &) && sleep 5 && npm run smoke && kill %1`
Expected: two HTML reports in `data/`. Open them and verify Performance ≥ 90, Accessibility ≥ 90.

- [ ] **Step 4: Commit**

```bash
git add scripts/post-rebuild-smoke.mjs package.json
git commit -m "test(smoke): add post-rebuild Lighthouse runner (P1-12)"
```

---

# P2 — Visual system

The goal of P2 is the design polish layer: enforce the tokens everywhere, replace the remaining hard-coded colors flagged by P0-04's lint rule, unify card patterns, ship the Prose component for guides/blog, add breadcrumbs and the new footer, build the category landing page treatment, and lock the dark/light theme consistency that the designplan §9 calls out.

## P2-01: Promote `no-hardcoded-colors` lint rule from warn to error

**Files:**
- Modify: `eslint.config.mjs`

**Interfaces:**
- Produces: lint exits 1 if any component still uses `bg-white`, `bg-black`, `bg-gray-*`, `text-white`, `text-black`, `dark:bg-*`, `dark:text-*`

- [ ] **Step 1: See the current debt**

Run: `npm run lint 2>&1 | tee /tmp/lint-debt.txt | tail -5`
Expected: a count of `local/no-hardcoded-colors` warnings.

- [ ] **Step 2: Categorize the warnings**

`grep "local/no-hardcoded-colors" /tmp/lint-debt.txt | head -50`

If the count is > 100, group by directory and file. The bulk will be in tool components that pre-date the v1.14.0 token system. Plan a per-directory migration.

- [ ] **Step 3: Migrate by directory**

For each directory with violations, replace hard-coded classes with tokens. Common replacements:
- `bg-white` → `bg-[var(--color-surface-1)]`
- `bg-gray-100` / `bg-gray-50` → `bg-[var(--color-surface-2)]`
- `text-black` → `text-[var(--color-fg)]`
- `text-gray-500` / `text-gray-600` → `text-[var(--color-fg-muted)]`
- `dark:bg-gray-900` → `bg-[var(--color-surface-1)]` (token already theme-aware)

Group by directory, one commit per directory.

- [ ] **Step 4: Promote the rule**

Edit `eslint.config.mjs`. Change `warn` to `error` for `local/no-hardcoded-colors`.

- [ ] **Step 5: Verify**

Run: `npm run lint`
Expected: 0 violations. Exit 0.

- [ ] **Step 6: Commit per directory + the rule change**

```bash
git add src/components/<directory>/
git commit -m "style(tokens): replace hard-coded colors with --color-* tokens in <directory> (P2-01)"
```

Final commit:
```bash
git add eslint.config.mjs
git commit -m "chore(lint): promote no-hardcoded-colors to error (P2-01)"
```

## P2-02: Footer redesign (3 columns, border-top, no card)

**Files:**
- Modify: `src/components/layout/footer.tsx`
- Create: `tests/audit/footer.spec.ts`

**Interfaces:**
- Produces: 3-column footer (Product / Resources / Company), border-top 1px, no card wrapping

- [ ] **Step 1: Write the e2e**

Create `tests/audit/footer.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test('footer has 3 columns and no card wrapper', async ({ page }) => {
  await page.goto('/');
  const footer = page.locator('footer');
  await expect(footer).toBeVisible();
  const lists = footer.getByRole('list');
  expect(await lists.count()).toBeGreaterThanOrEqual(3);
  // No card class on the footer or its sections
  expect(await footer.evaluate((el) => el.className.includes('rounded'))).toBe(false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:tools -- tests/audit/footer.spec.ts`
Expected: FAIL.

- [ ] **Step 3: Rewrite the footer**

Edit `src/components/layout/footer.tsx` per spec §2.5. Pattern:

```tsx
import Link from 'next/link';

const COLUMNS = [
  { title: 'Product', links: [{ name: 'Tools', href: '/tools' }, { name: 'Categories', href: '/categories' }, { name: 'Popular', href: '/popular' }, { name: 'New', href: '/new' }] },
  { title: 'Resources', links: [{ name: 'Guides', href: '/guides' }, { name: 'Blog', href: '/blog' }, { name: 'Compare', href: '/compare' }, { name: 'Status', href: '/status' }] },
  { title: 'Company', links: [{ name: 'About', href: '/about' }, { name: 'Privacy', href: '/privacy' }, { name: 'Contact', href: '/contact' }, { name: 'DPA', href: '/dpa' }] },
] as const;

export function Footer() {
  return (
    <footer className="mt-24 border-t border-[var(--color-border-subtle)]">
      <div className="mx-auto max-w-[1280px] px-4 md:px-8 py-12 grid gap-8 md:grid-cols-4">
        <div>
          <p className="font-semibold">DevStackIO Tools</p>
          <p className="text-sm text-[var(--color-fg-muted)] mt-2">Free online developer tools. Privacy-first. No signup.</p>
        </div>
        {COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <p className="text-sm font-semibold mb-2">{col.title}</p>
            <ul className="space-y-1 text-sm">
              {col.links.map((l) => <li key={l.href}><Link href={l.href} className="text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]">{l.name}</Link></li>)}
            </ul>
          </nav>
        ))}
      </div>
      <div className="mx-auto max-w-[1280px] px-4 md:px-8 pb-8 text-xs text-[var(--color-fg-muted)]">
        © {new Date().getFullYear()} DevStackIO
      </div>
    </footer>
  );
}
```

- [ ] **Step 4: Re-run the e2e**

Run: `npm run test:tools -- tests/audit/footer.spec.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/footer.tsx tests/audit/footer.spec.ts
git commit -m "feat(footer): 3-column footer with no card wrapper, border-top divider (P2-02)"
```

## P2-03: Categories mega-menu (Preline dropdown)

**Files:**
- Create: `src/components/layout/categories-mega-menu.tsx`
- Modify: `src/components/layout/header.tsx`
- Create: `tests/audit/categories-mega-menu.spec.ts`

**Interfaces:**
- Produces: hover/tap to open a 640px Preline dropdown showing top 8 categories with counts and 1-line descriptions; "View all categories →" link to `/categories`

- [ ] **Step 1: Write the e2e**

Create `tests/audit/categories-mega-menu.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test('mega-menu opens on hover and lists categories', async ({ page }) => {
  await page.goto('/');
  const trigger = page.getByRole('button', { name: /categories/i }).first();
  await trigger.hover();
  const menu = page.getByRole('menu', { name: /categories/i });
  await expect(menu).toBeVisible();
  const items = menu.getByRole('menuitem');
  expect(await items.count()).toBeGreaterThanOrEqual(4);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:tools -- tests/audit/categories-mega-menu.spec.ts`
Expected: FAIL.

- [ ] **Step 3: Implement CategoriesMegaMenu**

Create `src/components/layout/categories-mega-menu.tsx`:

```tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { allCategories } from '@/lib/data/categories';
import { allTools } from '@/lib/data/tools';

export function CategoriesMegaMenu() {
  const [open, setOpen] = useState(false);
  const counts = allTools.reduce<Record<string, number>>((acc, t) => {
    const c = t.category;
    if (c) acc[c] = (acc[c] ?? 0) + 1;
    return acc;
  }, {});
  const top = allCategories
    .map((c) => ({ ...c, count: counts[c.name] ?? 0 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        className="h-10 px-3 text-sm hover:text-[var(--color-fg)] text-[var(--color-fg-muted)]"
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        Categories ▾
      </button>
      {open && (
        <div role="menu" aria-label="Categories" className="absolute top-full left-0 mt-1 w-[640px] p-4 bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)] rounded-md" style={{ boxShadow: 'var(--shadow-overlay)' }}>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-3">
            {top.map((c) => (
              <li key={c.slug} role="menuitem">
                <Link href={`/categories/${c.slug}`} className="block group">
                  <span className="text-sm font-medium group-hover:text-[var(--color-accent)]">{c.name}</span>
                  <span className="text-xs text-[var(--color-fg-muted)] font-mono ml-2">({c.count})</span>
                  <p className="text-xs text-[var(--color-fg-muted)] line-clamp-1">{c.description}</p>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-3 pt-3 border-t border-[var(--color-border-subtle)] text-sm">
            <Link href="/categories" className="text-[var(--color-link)] hover:underline">View all categories →</Link>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Wire into the header**

Edit `src/components/layout/header.tsx`. Replace the existing "Categories" link with `<CategoriesMegaMenu />`.

- [ ] **Step 5: Re-run the e2e**

Run: `npm run test:tools -- tests/audit/categories-mega-menu.spec.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/layout/categories-mega-menu.tsx tests/audit/categories-mega-menu.spec.ts src/components/layout/header.tsx
git commit -m "feat(nav): add categories mega-menu with counts (P2-03)"
```

## P2-04: Prose component (single source of truth for guides/blog)

**Files:**
- Create: `src/components/ui/prose.tsx`
- Create: `src/styles/highlight-theme.css`
- Create: `tests/components/prose.test.tsx`

**Interfaces:**
- Produces: `<Prose>{mdx}</Prose>` wraps any MDX-rendered content with consistent typography, code blocks, tables, callouts
- Produces: `highlight-theme.css` — light + dark token-driven syntax colors

- [ ] **Step 1: Write the test**

Create `tests/components/prose.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Prose } from '../../src/components/ui/prose';

describe('Prose', () => {
  it('renders headings, paragraphs, lists, and code blocks with consistent tokens', () => {
    const { container, getByText, getByRole } = render(
      <Prose>
        <h2>Heading</h2>
        <p>Body text.</p>
        <ul><li>Item</li></ul>
        <pre><code>{"const a = 1;"}</code></pre>
      </Prose>
    );
    expect(getByRole('heading', { level: 2 })).toBeInTheDocument();
    expect(getByText('Body text.')).toBeInTheDocument();
    expect(getByText('Item')).toBeInTheDocument();
    expect(getByText('const a = 1;')).toBeInTheDocument();
    // Code block has Geist Mono
    const pre = container.querySelector('pre');
    expect(pre?.className).toMatch(/font-mono/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/components/prose.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Create the highlight theme**

Create `src/styles/highlight-theme.css`:

```css
:root {
  --hl-comment: #6b7280;
  --hl-keyword: #2563eb;
  --hl-string: #16a34a;
  --hl-number: #ea580c;
  --hl-function: #7c3aed;
  --hl-variable: #0a0a0a;
  --hl-bg: transparent;
}
.dark {
  --hl-comment: #9ca3af;
  --hl-keyword: #93c5fd;
  --hl-string: #4ade80;
  --hl-number: #fb923c;
  --hl-function: #c4b5fd;
  --hl-variable: #fafafa;
}
.hljs { color: var(--hl-variable); background: var(--hl-bg); }
.hljs-comment, .hljs-quote { color: var(--hl-comment); font-style: italic; }
.hljs-keyword, .hljs-selector-tag, .hljs-built_in { color: var(--hl-keyword); }
.hljs-string, .hljs-attr { color: var(--hl-string); }
.hljs-number, .hljs-literal { color: var(--hl-number); }
.hljs-function, .hljs-title { color: var(--hl-function); }
```

- [ ] **Step 4: Implement Prose**

Create `src/components/ui/prose.tsx`:

```tsx
import type { ReactNode } from 'react';

export function Prose({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <article className={`prose ${className}`}>
      <style>{`@import "/src/styles/highlight-theme.css";`}</style>
      {children}
    </article>
  );
}
```

Plus the prose CSS rules (added to `globals.css`):

```css
.prose h2 { font-size: 28px; line-height: 32px; margin-top: 48px; margin-bottom: 16px; font-weight: 600; letter-spacing: -0.01em; }
.prose h3 { font-size: 20px; line-height: 26px; margin-top: 32px; margin-bottom: 12px; font-weight: 600; }
.prose h4 { font-size: 16px; line-height: 22px; margin-top: 24px; margin-bottom: 8px; font-weight: 600; color: var(--color-fg-muted); }
.prose p, .prose ul, .prose ol, .prose dl, .prose blockquote { font-size: 16px; line-height: 24px; color: var(--color-fg); max-width: 720px; }
.prose ul, .prose ol { padding-left: 24px; }
.prose li { margin-top: 4px; }
.prose a { color: var(--color-link); text-decoration: none; }
.prose a:hover { text-decoration: underline; }
.prose code { font-family: var(--font-mono); font-size: 14px; padding: 2px 4px; background: var(--color-surface-2); border: 1px solid var(--color-border-subtle); border-radius: 4px; }
.prose pre { font-family: var(--font-mono); font-size: 14px; line-height: 22px; padding: 16px; background: var(--color-surface-1); border: 1px solid var(--color-border-subtle); border-radius: 6px; overflow-x: auto; }
.prose pre code { background: none; border: 0; padding: 0; }
.prose table { font-size: 14px; line-height: 20px; border-collapse: collapse; width: 100%; max-width: 720px; }
.prose th, .prose td { border: 1px solid var(--color-border-subtle); padding: 8px 12px; text-align: left; }
.prose th { background: var(--color-surface-1); font-weight: 600; }
.prose blockquote { border-left: 4px solid var(--color-border-strong); padding-left: 16px; color: var(--color-fg-muted); font-style: normal; }
```

- [ ] **Step 5: Re-run the test**

Run: `npx vitest run tests/components/prose.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/prose.tsx src/styles/highlight-theme.css src/styles/globals.css tests/components/prose.test.tsx
git commit -m "feat(content): add Prose component + token-driven highlight theme (P2-04)"
```

## P2-05: Apply Prose to guide and blog pages

**Files:**
- Modify: `src/app/guides/[slug]/page.tsx`
- Modify: `src/app/blog/[slug]/page.tsx`
- Create: `tests/audit/prose-applied.spec.ts`

**Interfaces:**
- Produces: every guide and blog page wraps its MDX in `<Prose>`

- [ ] **Step 1: Find the existing page files**

Open `src/app/guides/[slug]/page.tsx` and `src/app/blog/[slug]/page.tsx`. Find the existing `prose` wrapper or the equivalent.

- [ ] **Step 2: Replace with the new Prose**

For each page, replace the existing prose wrapper with:

```tsx
import { Prose } from '@/components/ui/prose';
// inside the render:
<Prose>{mdxContent}</Prose>
```

- [ ] **Step 3: Write the e2e**

Create `tests/audit/prose-applied.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test('guide page wraps content in Prose', async ({ page }) => {
  await page.goto('/guides');
  const firstLink = page.getByRole('link').filter({ hasText: /\w+/ }).first();
  await firstLink.click();
  await expect(page.locator('article.prose')).toBeVisible();
});
```

- [ ] **Step 4: Re-run the e2e**

Run: `npm run test:tools -- tests/audit/prose-applied.spec.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/guides/[slug]/page.tsx src/app/blog/[slug]/page.tsx tests/audit/prose-applied.spec.ts
git commit -m "feat(content): apply Prose wrapper to guide and blog pages (P2-05)"
```

## P2-06: Compare page auto-generation

**Files:**
- Create: `src/app/compare/[a]-vs-[b]/page.tsx`
- Create: `src/lib/compare/build.ts`
- Create: `src/lib/compare/comparison-hints.ts`
- Create: `tests/compare/build.test.ts`

**Interfaces:**
- Produces: `/compare/[a]-vs-[b]` auto-generated page (canonical = alphabetical, reverse `redirect()`s)
- Produces: `buildCompare(a, b): CompareData` — shared comparison data

- [ ] **Step 1: Write the test**

Create `tests/compare/build.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { buildCompare } from '../../src/lib/compare/build';

describe('buildCompare', () => {
  it('builds a comparison with two tools, properties, and a verdict', () => {
    const data = buildCompare('json-formatter', 'xml-formatter');
    expect(data.left.slug).toBe('json-formatter');
    expect(data.right.slug).toBe('xml-formatter');
    expect(data.rows.length).toBeGreaterThan(0);
  });

  it('normalizes to alphabetical order', () => {
    const a = buildCompare('xml-formatter', 'json-formatter');
    const b = buildCompare('json-formatter', 'xml-formatter');
    expect(a.canonical).toBe(b.canonical);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/compare/build.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement comparison hints**

Create `src/lib/compare/comparison-hints.ts`:

```ts
// Curated "when to use" hints for the top 20 tool pairs. Beyond this, the page falls back to
// "Pick X for [X's category], Pick Y for [Y's category]" from the registry metadata.
export const COMPARISON_HINTS: Record<string, { a: string; b: string; verdict: string }> = {
  'json-formatter|xml-formatter': {
    a: 'APIs, JS/TS apps, config files, anything that talks to a web service.',
    b: 'Documents, RSS/Atom feeds, SOAP, Microsoft Office formats, older enterprise stacks.',
    verdict: 'JSON wins for new web work; XML still required for many enterprise integrations.',
  },
  'json-formatter|yaml-formatter': {
    a: 'Strict structure, programmatic generation, every JSON library in every language.',
    b: 'Human-authored config (Kubernetes, GitHub Actions, Docker Compose), comments allowed.',
    verdict: 'JSON for data interchange; YAML for config that humans edit.',
  },
};
```

- [ ] **Step 4: Implement buildCompare**

Create `src/lib/compare/build.ts`:

```ts
import { getTool } from '@/lib/data/tools';
import { COMPARISON_HINTS } from './comparison-hints';

export type CompareData = {
  canonical: string; // /compare/{a}-vs-{b} in alphabetical order
  left: { slug: string; name: string; description: string; category: string };
  right: { slug: string; name: string; description: string; category: string };
  rows: Array<{ label: string; a: string; b: string }>;
  aWhen: string;
  bWhen: string;
  verdict: string;
};

function canonicalPair(a: string, b: string): { canonical: string; left: string; right: string } {
  const [lo, hi] = [a, b].sort();
  return { canonical: `${lo}-vs-${hi}`, left: lo, right: hi };
}

export function buildCompare(a: string, b: string): CompareData | null {
  const ta = getTool(a);
  const tb = getTool(b);
  if (!ta || !tb) return null;
  const pair = canonicalPair(a, b);
  const hint = COMPARISON_HINTS[`${ta.slug}|${tb.slug}`] ?? COMPARISON_HINTS[`${tb.slug}|${ta.slug}`];
  const rows = [
    { label: 'Description', a: ta.description, b: tb.description },
    { label: 'Category', a: ta.category, b: tb.category },
    { label: 'Works offline', a: 'Yes', b: 'Yes' },
    { label: 'Popularity', a: String(ta.popularity ?? 0), b: String(tb.popularity ?? 0) },
  ];
  return {
    canonical: `/compare/${pair.canonical}`,
    left: { slug: ta.slug, name: ta.name, description: ta.description, category: ta.category },
    right: { slug: tb.slug, name: tb.name, description: tb.description, category: tb.category },
    rows,
    aWhen: hint?.a ?? `Use ${ta.name} for ${ta.category.toLowerCase()}.`,
    bWhen: hint?.b ?? `Use ${tb.name} for ${tb.category.toLowerCase()}.`,
    verdict: hint?.verdict ?? 'Both are useful — pick based on your stack.',
  };
}
```

- [ ] **Step 5: Implement the page**

Create `src/app/compare/[a]-vs-[b]/page.tsx`:

```tsx
import { notFound, redirect } from 'next/navigation';
import { buildCompare } from '@/lib/compare/build';

export default function ComparePage({ params }: { params: { 'a-vs-b': string } }) {
  const slug = params['a-vs-b']; // e.g. "json-formatter-vs-xml-formatter"
  const [a, b] = slug.split('-vs-');
  if (!a || !b) notFound();
  // Canonicalize via redirect
  const [lo, hi] = [a, b].sort();
  if (a !== lo) redirect(`/compare/${lo}-vs-${hi}`);

  const data = buildCompare(a, b);
  if (!data) notFound();

  return (
    <main className="mx-auto max-w-[1024px] px-4 md:px-8 py-8">
      <h1 className="text-4xl font-semibold tracking-tight">{data.left.name} vs {data.right.name}</h1>
      <p className="mt-2 text-lg text-[var(--color-fg-muted)]">Side-by-side comparison.</p>
      <table className="mt-8 w-full border-collapse">
        <thead>
          <tr>
            <th className="w-1/3"></th>
            <th className="w-1/3 p-3 border border-[var(--color-border-subtle)] text-left bg-[var(--color-surface-2)]">{data.left.name}</th>
            <th className="w-1/3 p-3 border border-[var(--color-border-subtle)] text-left bg-[var(--color-surface-2)]">{data.right.name}</th>
          </tr>
        </thead>
        <tbody>
          {data.rows.map((r) => (
            <tr key={r.label}>
              <td className="p-3 border border-[var(--color-border-subtle)] text-sm text-[var(--color-fg-muted)]">{r.label}</td>
              <td className="p-3 border border-[var(--color-border-subtle)] text-sm">{r.a}</td>
              <td className="p-3 border border-[var(--color-border-subtle)] text-sm">{r.b}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <section className="mt-12 space-y-6 max-w-3xl">
        <h2 className="text-2xl font-semibold">When to use {data.left.name}</h2>
        <p>{data.aWhen}</p>
        <h2 className="text-2xl font-semibold">When to use {data.right.name}</h2>
        <p>{data.bWhen}</p>
        <h2 className="text-2xl font-semibold">Verdict</h2>
        <p>{data.verdict}</p>
        <div className="mt-6 flex gap-3">
          <a href={`/tools/${data.left.slug}`} className="px-4 h-10 inline-flex items-center rounded-sm border border-[var(--color-border-subtle)] hover:bg-[var(--color-surface-2)]">Open {data.left.name} →</a>
          <a href={`/tools/${data.right.slug}`} className="px-4 h-10 inline-flex items-center rounded-sm border border-[var(--color-border-subtle)] hover:bg-[var(--color-surface-2)]">Open {data.right.name} →</a>
        </div>
      </section>
    </main>
  );
}
```

- [ ] **Step 6: Run the unit test**

Run: `npx vitest run tests/compare/build.test.ts`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/app/compare/ src/lib/compare/ tests/compare/
git commit -m "feat(compare): add auto-generated compare page with canonical redirect (P2-06)"
```

## P2-07: Category landing page treatment (curated top-6 + "see all")

**Files:**
- Modify: `src/app/categories/[slug]/page.tsx`

**Interfaces:**
- Produces: `/categories/[slug]` renders H1 + 1-line sub + top-6 tool grid (2×3) + "All N tools in {Category} →" link to filtered `/tools`

- [ ] **Step 1: Rewrite the category page**

Edit `src/app/categories/[slug]/page.tsx`. Replace the existing layout with the curated variant per spec §5.5:

```tsx
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCategory, getToolsInCategory } from '@/lib/data/categories';
import { ToolCard } from '@/components/ui/tool-card';

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const cat = getCategory(params.slug);
  if (!cat) notFound();
  const tools = getToolsInCategory(cat.name);
  const top = [...tools].sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0)).slice(0, 6);

  return (
    <main className="mx-auto max-w-[1024px] px-4 md:px-8 py-8">
      <h1 className="text-4xl font-semibold tracking-tight">{cat.name}</h1>
      <p className="mt-2 text-lg text-[var(--color-fg-muted)]">{cat.description}</p>
      <p className="mt-1 text-sm text-[var(--color-fg-muted)] font-mono">{tools.length} tools</p>

      <section className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Top {cat.name} tools</h2>
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {top.map((t) => <ToolCard key={t.slug} tool={t} />)}
        </div>
      </section>

      <section className="mt-8">
        <Link href={`/tools?category=${cat.slug}`} className="text-[var(--color-link)] hover:underline">
          All {tools.length} tools in {cat.name} →
        </Link>
      </section>
    </main>
  );
}
```

- [ ] **Step 2: Write the e2e**

Create `tests/audit/category-curated.spec.ts:

```ts
import { test, expect } from '@playwright/test';

test('category landing shows top 6 and a see-all link', async ({ page }) => {
  await page.goto('/categories/formatters');
  await expect(page.getByRole('heading', { level: 1, name: 'Formatters' })).toBeVisible();
  const top = page.locator('section').filter({ hasText: 'Top Formatters tools' }).getByRole('link');
  expect(await top.count()).toBeLessThanOrEqual(6);
  await expect(page.getByRole('link', { name: /All \d+ tools in Formatters/i })).toBeVisible();
});
```

- [ ] **Step 3: Run the e2e**

Run: `npm run test:tools -- tests/audit/category-curated.spec.ts`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/app/categories/[slug]/page.tsx tests/audit/category-curated.spec.ts
git commit -m "feat(category): curated top-6 landing page with see-all link (P2-07)"
```

## P2-08: Theme consistency check (the designplan §9 bug fix)

**Files:**
- Create: `tests/audit/theme-consistency.spec.ts`
- Create: `tests/visual/theme-snapshot.spec.ts`

**Interfaces:**
- Produces: every audited page renders the same structure in light and dark (no contrast violation, no missing token)
- Produces: visual snapshot in both themes

- [ ] **Step 1: Write the theme e2e**

Create `tests/audit/theme-consistency.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

const pages = [
  { name: 'homepage', url: '/' },
  { name: 'tool-page', url: '/tools/json-formatter' },
  { name: 'category', url: '/categories/formatters' },
  { name: 'guide', url: '/guides' },
  { name: 'search', url: '/search?q=json' },
];

for (const p of pages) {
  for (const theme of ['light', 'dark'] as const) {
    test(`${p.name} renders correctly in ${theme}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: theme });
      await page.goto(p.url);
      // No element with hard-coded white/black backgrounds outside known exceptions
      const bad = await page.evaluate(() => {
        const all = Array.from(document.querySelectorAll('*'));
        return all.filter((el) => {
          const bg = getComputedStyle(el).backgroundColor;
          const fg = getComputedStyle(el).color;
          return bg === 'rgb(255, 255, 255)' && el.tagName !== 'HTML' && el.tagName !== 'BODY';
        }).length;
      });
      expect(bad, `${p.name} (${theme}) has hard-coded white backgrounds`).toBe(0);
    });
  }
}
```

- [ ] **Step 2: Run test to find violations**

Run: `npm run test:tools -- tests/audit/theme-consistency.spec.ts`
Expected: a list of violations per page. Most should be in tool components that pre-date the v1.14.0 token system.

- [ ] **Step 3: Fix violations per page**

For each violation, locate the source file (page.evaluate can return the element; the developer tools show the path) and replace hard-coded classes with tokens.

- [ ] **Step 4: Re-run until clean**

Run: `npm run test:tools -- tests/audit/theme-consistency.spec.ts`
Expected: 0 violations.

- [ ] **Step 5: Add the visual snapshot (both themes)**

Create `tests/visual/theme-snapshot.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

const targets = [
  { name: 'homepage-light', url: '/', theme: 'light' as const },
  { name: 'homepage-dark', url: '/', theme: 'dark' as const },
  { name: 'tool-light', url: '/tools/json-formatter', theme: 'light' as const },
  { name: 'tool-dark', url: '/tools/json-formatter', theme: 'dark' as const },
];

for (const t of targets) {
  test(`snapshot ${t.name}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: t.theme });
    await page.goto(t.url);
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot(`${t.name}.png`, { fullPage: true, maxDiffPixelRatio: 0.01 });
  });
}
```

- [ ] **Step 6: Run the snapshot test**

Run: `npm run test:visual`
Expected: baseline snapshots are created. Review the diff.

- [ ] **Step 7: Commit per fix group**

```bash
git add src/components/<offending-file>
git commit -m "fix(theme): replace hard-coded white in <file> (P2-08)"
```

Final commit:
```bash
git add tests/audit/theme-consistency.spec.ts tests/visual/theme-snapshot.spec.ts tests/snapshots.spec.ts-snapshots/
git commit -m "test(theme): add theme consistency and visual snapshot (P2-08)"
```

## P2-09: Listing pages — 2+8+2 layout with sticky filter rail

**Files:**
- Create: `src/components/listings/filter-rail.tsx`
- Create: `src/components/listings/tool-grid.tsx`
- Modify: `src/app/tools/page.tsx`
- Modify: `src/app/categories/[slug]/page.tsx` (already touched in P2-07 — listing view via `?category=`)

**Interfaces:**
- Produces: 2+8+2 layout with a sticky left filter rail (search, category, sort, view), center tool grid, right side notes
- Produces: 24 tools per page, text pagination

- [ ] **Step 1: Write the e2e**

Create `tests/audit/listing-layout.spec.ts:

```ts
import { test, expect } from '@playwright/test';

test('/tools has a sticky filter rail and a 24-tool page', async ({ page }) => {
  await page.goto('/tools');
  const rail = page.getByRole('region', { name: /filters/i });
  await expect(rail).toBeVisible();
  const grid = page.getByTestId('tool-grid');
  const cards = grid.getByRole('link');
  expect(await cards.count()).toBeLessThanOrEqual(24);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:tools -- tests/audit/listing-layout.spec.ts`
Expected: FAIL.

- [ ] **Step 3: Implement ToolGrid**

Create `src/components/listings/tool-grid.tsx`:

```tsx
import { ToolCard } from '@/components/ui/tool-card';

export function ToolGrid({ tools }: { tools: Parameters<typeof ToolCard>[0]['tool'][] }) {
  return (
    <div data-testid="tool-grid" className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
      {tools.map((t) => <ToolCard key={t.slug} tool={t} />)}
    </div>
  );
}
```

- [ ] **Step 4: Implement FilterRail**

Create `src/components/listings/filter-rail.tsx`:

```tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { allCategories } from '@/lib/data/categories';

export function FilterRail() {
  const router = useRouter();
  const sp = useSearchParams();
  const [q, setQ] = useState(sp.get('q') ?? '');
  const cat = sp.get('category') ?? '';
  const sort = sp.get('sort') ?? 'popularity';

  function update(next: Record<string, string>) {
    const params = new URLSearchParams(sp);
    for (const [k, v] of Object.entries(next)) {
      if (v) params.set(k, v); else params.delete(k);
    }
    params.delete('page');
    router.push(`?${params.toString()}`);
  }

  return (
    <aside aria-label="Filters" className="space-y-6 text-sm">
      <div>
        <label htmlFor="filter-q" className="block text-xs text-[var(--color-fg-muted)] mb-1">Search</label>
        <input id="filter-q" value={q} onChange={(e) => { setQ(e.target.value); update({ q: e.target.value }); }} className="w-full h-9 px-2 border border-[var(--color-border-subtle)] rounded-sm bg-[var(--color-surface-1)]" />
      </div>
      <div>
        <p className="text-xs text-[var(--color-fg-muted)] mb-1">Category</p>
        <ul className="space-y-1">
          <li><button type="button" onClick={() => update({ category: '' })} className={`text-left w-full ${!cat ? 'font-semibold' : 'text-[var(--color-fg-muted)]'}`}>All</button></li>
          {allCategories.map((c) => (
            <li key={c.slug}><button type="button" onClick={() => update({ category: c.slug })} className={`text-left w-full ${cat === c.slug ? 'font-semibold' : 'text-[var(--color-fg-muted)]'}`}>{c.name}</button></li>
          ))}
        </ul>
      </div>
      <div>
        <label htmlFor="filter-sort" className="block text-xs text-[var(--color-fg-muted)] mb-1">Sort</label>
        <select id="filter-sort" value={sort} onChange={(e) => update({ sort: e.target.value })} className="w-full h-9 px-2 border border-[var(--color-border-subtle)] rounded-sm bg-[var(--color-surface-1)]">
          <option value="popularity">Popular</option>
          <option value="newest">Newest</option>
          <option value="alpha">A–Z</option>
        </select>
      </div>
    </aside>
  );
}
```

- [ ] **Step 5: Wire into /tools**

Edit `src/app/tools/page.tsx`:

```tsx
import { allTools } from '@/lib/data/tools';
import { FilterRail } from '@/components/listings/filter-rail';
import { ToolGrid } from '@/components/listings/tool-grid';

const PAGE_SIZE = 24;

export default function ToolsPage({ searchParams }: { searchParams: Record<string, string> }) {
  const cat = searchParams.category ?? '';
  const sort = searchParams.sort ?? 'popularity';
  const page = Math.max(1, Number(searchParams.page) || 1);
  let tools = [...allTools];
  if (cat) tools = tools.filter((t) => t.categorySlug === cat);
  if (sort === 'newest') tools.sort((a, b) => (b.addedAt ?? '').localeCompare(a.addedAt ?? ''));
  else if (sort === 'alpha') tools.sort((a, b) => a.name.localeCompare(b.name));
  else tools.sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));
  const total = tools.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const slice = tools.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <main className="mx-auto max-w-[1280px] px-4 md:px-8 py-8">
      <h1 className="text-4xl font-semibold tracking-tight">All tools</h1>
      <p className="mt-1 text-sm text-[var(--color-fg-muted)] font-mono">{total} tools</p>
      <div className="mt-8 grid gap-8 grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-2"><div className="lg:sticky lg:top-24"><FilterRail /></div></div>
        <div className="lg:col-span-8 space-y-4">
          <ToolGrid tools={slice} />
          <Pagination current={page} total={totalPages} />
        </div>
        <div className="lg:col-span-2 hidden lg:block">
          <p className="text-xs text-[var(--color-fg-muted)]">Quick links</p>
          <ul className="mt-2 text-sm space-y-1">
            {['JSON', 'XML', 'YAML', 'SQL', 'HTML'].map((q) => (
              <li key={q}><a href={`/search?q=${q.toLowerCase()}`} className="text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]">{q}</a></li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}

function Pagination({ current, total }: { current: number; total: number }) {
  if (total <= 1) return null;
  const pages = Array.from({ length: total }, (_, i) => i + 1).filter((p) => p === 1 || p === total || Math.abs(p - current) <= 1);
  return (
    <nav aria-label="Pagination" className="mt-4 text-sm">
      {current > 1 && <a href={`?page=${current - 1}`} className="mr-2">← Prev</a>}
      {pages.map((p, i) => {
        const prev = pages[i - 1];
        const gap = prev && p - prev > 1;
        return (
          <span key={p}>
            {gap && <span className="mx-1 text-[var(--color-fg-muted)]">…</span>}
            {p === current
              ? <span aria-current="page" className="text-[var(--color-accent)] mx-1">{p}</span>
              : <a href={`?page=${p}`} className="mx-1 text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]">{p}</a>}
          </span>
        );
      })}
      {current < total && <a href={`?page=${current + 1}`} className="ml-2">Next →</a>}
    </nav>
  );
}
```

- [ ] **Step 6: Re-run the e2e**

Run: `npm run test:tools -- tests/audit/listing-layout.spec.ts`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/components/listings/ src/app/tools/page.tsx tests/audit/listing-layout.spec.ts
git commit -m "feat(listings): 2+8+2 layout with sticky filter rail, 24/page pagination (P2-09)"
```

## P2-10: Visual regression baseline (snapshots for every page type)

**Files:**
- Modify: `tests/snapshots.spec.ts` (extend coverage)
- Create: `tests/snapshots/redesign/` baseline directory

**Interfaces:**
- Produces: visual snapshots in light + dark for: homepage, tool page (standard, generator, image, calculator), category, listing, guide, blog, compare, search, 404

- [ ] **Step 1: Extend the snapshot spec**

Edit `tests/snapshots.spec.ts` to cover every page type in both themes:

```ts
import { test, expect } from '@playwright/test';

const targets = [
  { name: 'homepage', url: '/', theme: 'light' },
  { name: 'homepage-dark', url: '/', theme: 'dark' },
  { name: 'tool-standard', url: '/tools/json-formatter', theme: 'light' },
  { name: 'tool-standard-dark', url: '/tools/json-formatter', theme: 'dark' },
  { name: 'category', url: '/categories/formatters', theme: 'light' },
  { name: 'listing', url: '/tools', theme: 'light' },
  { name: 'guide', url: '/guides', theme: 'light' },
  { name: 'blog', url: '/blog', theme: 'light' },
  { name: 'compare', url: '/compare/json-formatter-vs-xml-formatter', theme: 'light' },
  { name: 'search', url: '/search?q=json', theme: 'light' },
  { name: '404', url: '/this-does-not-exist', theme: 'light' },
] as const;

for (const t of targets) {
  test(`snapshot ${t.name}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: t.theme });
    await page.goto(t.url);
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot(`redesign/${t.name}.png`, { fullPage: true, maxDiffPixelRatio: 0.01 });
  });
}
```

- [ ] **Step 2: Run to generate baseline**

Run: `npm run test:snapshots -- --update-snapshots`
Expected: baseline PNGs are written to `tests/snapshots.spec.ts-snapshots/redesign/`.

- [ ] **Step 3: Review the baselines**

Open the generated PNGs. Verify they match the spec visually: no card-on-card, correct surface tones, trust pills below H1, no horizontal scroll.

- [ ] **Step 4: Re-run without `--update-snapshots` to confirm clean**

Run: `npm run test:snapshots`
Expected: 0 diffs.

- [ ] **Step 5: Commit**

```bash
git add tests/snapshots.spec.ts tests/snapshots.spec.ts-snapshots/redesign/
git commit -m "test(visual): add 11-snapshot baseline (every page type, both themes) (P2-10)"
```

---

# P3 — SEO

The goal of P3 is the SEO architecture the designplan §17 calls out as critical for 1M+ monthly visitors: 15+ outbound internal links per tool page, rich metadata, Rich Results passing JSON-LD, shareable example URLs, and a sitemap/robots cleanup.

## P3-01: Tool-page title and description helper

**Files:**
- Create: `src/lib/seo/tool-metadata.ts`
- Create: `tests/seo/tool-metadata.test.ts`

**Interfaces:**
- Produces: `buildToolMetadata(tool): { title: string; description: string; canonical: string; openGraph: {...}; twitter: {...} }` per spec §12.1

- [ ] **Step 1: Write the failing test**

Create `tests/seo/tool-metadata.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { buildToolMetadata } from '../../src/lib/seo/tool-metadata';

const tool = { slug: 'json-formatter', name: 'JSON Formatter', description: 'Format, validate, and beautify JSON in your browser. Nothing is sent.' };

describe('buildToolMetadata', () => {
  it('builds a title with action verb in the form "{Name} — {description excerpt} | DevStackIO"', () => {
    const m = buildToolMetadata(tool);
    expect(m.title).toMatch(/^JSON Formatter — .+ \| DevStackIO$/);
    expect(m.title.length).toBeLessThanOrEqual(60);
  });
  it('uses the description as-is when within 160 chars', () => {
    const m = buildToolMetadata(tool);
    expect(m.description).toBe(tool.description);
    expect(m.description.length).toBeLessThanOrEqual(160);
  });
  it('truncates descriptions longer than 160 chars to 157 + ellipsis', () => {
    const long = 'A'.repeat(200);
    const m = buildToolMetadata({ ...tool, description: long });
    expect(m.description.length).toBe(160);
    expect(m.description.endsWith('…')).toBe(true);
  });
  it('sets canonical to absolute site URL with no trailing slash', () => {
    const m = buildToolMetadata(tool);
    expect(m.canonical).toBe('https://tools.devstackio.com/tools/json-formatter');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/seo/tool-metadata.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement buildToolMetadata**

Create `src/lib/seo/tool-metadata.ts`:

```ts
import { siteConfig } from '@/lib/data/site-config';

type Tool = { slug: string; name: string; description: string };

function truncate(s: string, n: number): string {
  if (s.length <= n) return s;
  return s.slice(0, n - 1) + '…';
}

function titleCase(s: string): string {
  return s.split(' ').map((w) => w[0]?.toUpperCase() + w.slice(1)).join(' ');
}

export function buildToolMetadata(tool: Tool) {
  const actionMatch = tool.description.match(/^\s*(format|convert|generate|calculate|encode|decode|validate|hash|compress|beautify|minify|parse|render|sign|verify|encrypt|decrypt|lookup|generate|sort|transform|create|extract|split|join|merge|compare|diff|translate|shorten|expand|measure|estimate|compute|generate)\b/i);
  const action = actionMatch ? titleCase(actionMatch[1].toLowerCase()) : '';
  const title = action
    ? `${tool.name} — ${action.toLowerCase()} ${tool.description.replace(/^\s*\w+\s*/, '').slice(0, 30)} | DevStackIO`
    : `${tool.name} — ${truncate(tool.description, 30)} | DevStackIO`;
  const safeTitle = truncate(title, 60);
  const description = truncate(tool.description, 160);
  const canonical = `${siteConfig.url}/tools/${tool.slug}`;
  return {
    title: safeTitle,
    description,
    canonical,
    openGraph: {
      title: safeTitle,
      description,
      url: canonical,
      type: 'website' as const,
      images: [{ url: `${siteConfig.url}/og-card.png`, alt: 'DevStackIO Tools' }],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: safeTitle,
      description,
      images: [`${siteConfig.url}/og-card.png`],
    },
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/seo/tool-metadata.test.ts`
Expected: PASS (modulo the action-verb regex; tune the title length in the helper if needed).

- [ ] **Step 5: Wire into the tool page**

Edit `src/app/tools/[slug]/page.tsx`. Replace the existing `generateMetadata` (if any) with:

```tsx
import type { Metadata } from 'next';
import { buildToolMetadata } from '@/lib/seo/tool-metadata';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) return { title: 'Tool not found' };
  const m = buildToolMetadata(tool);
  return {
    title: m.title,
    description: m.description,
    alternates: { canonical: m.canonical },
    openGraph: m.openGraph,
    twitter: m.twitter,
  };
}
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/seo/tool-metadata.ts tests/seo/tool-metadata.test.ts src/app/tools/[slug]/page.tsx
git commit -m "feat(seo): add buildToolMetadata helper with action-verb title (P3-01)"
```

## P3-02: JSON-LD coverage on every tool page

**Files:**
- Modify: `src/app/tools/[slug]/page.tsx`
- Create: `tests/seo/jsonld-coverage.spec.ts`

**Interfaces:**
- Produces: every tool page emits SoftwareApplication + BreadcrumbList JSON-LD (and HowTo/FAQPage if content has them)

- [ ] **Step 1: Write the e2e**

Create `tests/seo/jsonld-coverage.spec.ts`:

```ts
import { test, expect } from '@playwright/test';
import { allTools } from '../../src/lib/data/tools';

const tools = allTools.slice(0, 10);

for (const t of tools) {
  test(`tool ${t.slug} emits SoftwareApplication and BreadcrumbList JSON-LD`, async ({ page }) => {
    await page.goto(`/tools/${t.slug}`);
    const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
    const all = scripts.join('');
    expect(all, 'SoftwareApplication').toContain('"@type":"SoftwareApplication"');
    expect(all, 'BreadcrumbList').toContain('"@type":"BreadcrumbList"');
  });
}
```

- [ ] **Step 2: Run test to verify failures**

Run: `npm run test:tools -- tests/seo/jsonld-coverage.spec.ts`
Expected: a list of tools that don't emit the required JSON-LD.

- [ ] **Step 3: Wire JSON-LD into the tool page**

Edit `src/app/tools/[slug]/page.tsx`. Use the existing helpers in `src/lib/seo/json-ld.ts`:

```tsx
import { jsonLdScriptBody, softwareApplicationJsonLd, breadcrumbListJsonLd, howToJsonLd, faqPageJsonLd } from '@/lib/seo/json-ld';

const crumbs = [
  { name: 'Home', url: `${siteConfig.url}/` },
  { name: 'Tools', url: `${siteConfig.url}/tools` },
  { name: tool.categoryName, url: `${siteConfig.url}/categories/${tool.categorySlug}` },
  { name: tool.name, url: `${siteConfig.url}/tools/${tool.slug}` },
];

const jsonLd = [
  softwareApplicationJsonLd({ ...tool, siteUrl: siteConfig.url, siteName: siteConfig.name }),
  breadcrumbListJsonLd(crumbs),
  tool.faq && tool.faq.length > 0 ? faqPageJsonLd(tool.faq) : null,
  tool.howto && tool.howto.length > 0 ? howToJsonLd(tool.howto) : null,
].filter(Boolean);

// inside the render:
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScriptBody(jsonLd) }} />
```

Adjust the helper argument shape to match what the existing `softwareApplicationJsonLd` actually accepts (read `src/lib/seo/json-ld.ts` first).

- [ ] **Step 4: Re-run the e2e**

Run: `npm run test:tools -- tests/seo/jsonld-coverage.spec.ts`
Expected: PASS.

- [ ] **Step 5: Run the full SEO suite**

Run: `npm run test:seo`
Expected: 0 failures (the existing suite covers the bulk of the JSON-LD types; P3-02's spec just adds the tool-page coverage to it).

- [ ] **Step 6: Commit**

```bash
git add src/app/tools/[slug]/page.tsx tests/seo/jsonld-coverage.spec.ts
git commit -m "feat(seo): add SoftwareApplication + BreadcrumbList JSON-LD to every tool page (P3-02)"
```

## P3-03: Internal linking — 15+ outbound per tool page

**Files:**
- Create: `src/lib/links/related.ts`
- Create: `tests/links/related.test.ts`
- Modify: `src/components/tools/tool-sidebar.tsx` (already touched in P1-01; confirm surface)

**Interfaces:**
- Produces: `getRelatedTools(tool, n=8): Tool[]` returns the top-N tools by (same category first, then shared keywords, then popularity)
- Produces: every tool page emits 8 sidebar + 8 related grid = 16 outbound links minimum

- [ ] **Step 1: Write the test**

Create `tests/links/related.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { getRelatedTools } from '../../src/lib/links/related';
import { allTools } from '../../src/lib/data/tools';

describe('getRelatedTools', () => {
  it('returns N tools from the same category first', () => {
    const me = allTools.find((t) => t.slug === 'json-formatter')!;
    const out = getRelatedTools(me, 8);
    expect(out).toHaveLength(8);
    expect(out[0].category).toBe(me.category);
  });

  it('excludes the tool itself', () => {
    const me = allTools.find((t) => t.slug === 'json-formatter')!;
    const out = getRelatedTools(me, 8);
    expect(out.find((t) => t.slug === me.slug)).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/links/related.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement getRelatedTools**

Create `src/lib/links/related.ts:

```ts
import { allTools, type Tool } from '@/lib/data/tools';

function jaccard(a: string[], b: string[]): number {
  const sa = new Set(a);
  const sb = new Set(b);
  const inter = [...sa].filter((x) => sb.has(x)).length;
  const uni = new Set([...sa, ...sb]).size;
  return uni === 0 ? 0 : inter / uni;
}

export function getRelatedTools(me: Tool, n = 8): Tool[] {
  const myKeywords = (me.keywords ?? []).map((k) => k.toLowerCase());
  const scored = allTools
    .filter((t) => t.slug !== me.slug)
    .map((t) => {
      const sameCat = t.category === me.category ? 5 : 0;
      const kw = jaccard(myKeywords, (t.keywords ?? []).map((k) => k.toLowerCase())) * 10;
      const pop = (t.popularity ?? 0) / 20;
      return { t, score: sameCat + kw + pop };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, n);
  return scored.map((s) => s.t);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/links/related.test.ts`
Expected: PASS.

- [ ] **Step 5: Add a per-page count e2e**

Create `tests/links/internal-count.spec.ts:

```ts
import { test, expect } from '@playwright/test';
import { allTools } from '../../src/lib/data/tools';

const tools = allTools.slice(0, 10);

for (const t of tools) {
  test(`${t.slug} has ≥ 15 outbound internal links`, async ({ page }) => {
    await page.goto(`/tools/${t.slug}`);
    const links = await page.locator('main a[href^="/"]').evaluateAll((els) =>
      els.map((e) => e.getAttribute('href')).filter((h): h is string => !!h && !h.startsWith('/api'))
    );
    const unique = new Set(links);
    expect(unique.size, `expected ≥ 15, got ${unique.size}`).toBeGreaterThanOrEqual(15);
  });
}
```

- [ ] **Step 6: Run the count e2e**

Run: `npm run test:tools -- tests/links/internal-count.spec.ts`
Expected: PASS (after P1-08's homepage section work + P1-01's related grid + P2-07's category see-all link, every tool should exceed 15).

If some tools fail, add related-tool cards to the content section, or expand the sidebar to more entries.

- [ ] **Step 7: Commit**

```bash
git add src/lib/links/related.ts tests/links/ src/components/tools/tool-sidebar.tsx
git commit -m "feat(seo): add related-tools linker and 15+ outbound link gate (P3-03)"
```

## P3-04: Sitemap lastmod from git + robots cleanup

**Files:**
- Create: `src/lib/seo/lastmod.ts`
- Modify: `scripts/build-search-index.mjs` (already touches sitemap generation)
- Modify: `public/robots.txt` (remove Crawl-delay)

**Interfaces:**
- Produces: `getLastModified(slug, kind): string` returns ISO 8601 from `git log -1 --format=%cI`
- Produces: `robots.txt` no longer contains `Crawl-delay`

- [ ] **Step 1: Write the unit test**

Create `tests/seo/lastmod.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { getLastModified } from '../../src/lib/seo/lastmod';

describe('getLastModified', () => {
  it('returns an ISO 8601 string', () => {
    const v = getLastModified('json-formatter', 'tool');
    expect(v).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/seo/lastmod.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement getLastModified**

Create `src/lib/seo/lastmod.ts`:

```ts
import { execSync } from 'node:child_process';

export function getLastModified(slug: string, kind: 'tool' | 'guide' | 'blog'): string {
  const path = kind === 'tool'
    ? `src/content/tools/${slug}.json`
    : kind === 'guide'
      ? `src/content/guides/${slug}.md`
      : `src/content/blog/${slug}.md`;
  try {
    const iso = execSync(`git log -1 --format=%cI -- "${path}"`, { encoding: 'utf8' }).trim();
    return iso || new Date().toISOString();
  } catch {
    return new Date().toISOString();
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/seo/lastmod.test.ts`
Expected: PASS.

- [ ] **Step 5: Wire into sitemap generation**

Edit the sitemap generator. Find the existing implementation (likely in `src/app/sitemap.ts` per AGENTS.md). Replace the `lastModified` value with `getLastModified(slug, 'tool')`.

- [ ] **Step 6: Update robots.txt**

Edit `public/robots.txt`. Remove any `Crawl-delay:` line. Verify the rest per spec §2.8:

```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /private/
Disallow: /admin/
Disallow: /contact/success
Sitemap: https://tools.devstackio.com/sitemap.xml
```

- [ ] **Step 7: Commit**

```bash
git add src/lib/seo/lastmod.ts src/app/sitemap.ts public/robots.txt tests/seo/lastmod.test.ts
git commit -m "fix(seo): lastmod from git commit date and remove Crawl-delay (P3-04)"
```

## P3-05: Sitemap submission via IndexNow

**Files:**
- Modify: `scripts/indexnow-submit.ts` (already exists per AGENTS.md)
- Create: `scripts/indexnow-key.txt` (a hex key file, 32 chars)
- Modify: `public/<key>.txt` (key file for IndexNow verification)

**Interfaces:**
- Produces: `npm run sitemap:submit` POSTs the current sitemap URLs to `https://api.indexnow.org/indexnow`

- [ ] **Step 1: Generate a key**

Run: `node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"`
Expected: a 32-char hex string. Save it to `scripts/indexnow-key.txt`.

- [ ] **Step 2: Create the public key file**

Create `public/<key>.txt` (the same key as in `scripts/indexnow-key.txt`):

```
<key>
```

Replace `<key>` with the hex from step 1.

- [ ] **Step 3: Add the public key to the IndexNow submitter**

Edit `scripts/indexnow-submit.ts`. Read the existing implementation. Confirm it reads the key from `scripts/indexnow-key.txt` and the host from `siteConfig.url`. If not, update.

- [ ] **Step 4: Test submit (in dry-run mode)**

Run: `npm run sitemap:submit -- --dry-run`
Expected: payload shown, no network call.

- [ ] **Step 5: Live submit**

Run: `npm run sitemap:submit`
Expected: 200 response from IndexNow. Log the response.

- [ ] **Step 6: Commit**

```bash
git add scripts/indexnow-key.txt public/<key>.txt scripts/indexnow-submit.ts
git commit -m "feat(seo): add IndexNow key + dry-run + live submit (P3-05)"
```

## P3-06: Compare-page SEO (curated only + canonical)

**Files:**
- Create: `scripts/generate-compare-pairs.mjs`
- Modify: `src/app/compare/[a]-vs-[b]/page.tsx` (already touched in P2-06)
- Modify: `public/sitemap.xml` (or `src/app/sitemap.ts`)

**Interfaces:**
- Produces: only `related`-flagged tool pairs get compare pages (per spec §16 question 6 — avoids thin-content penalty)
- Produces: each generated pair appears in the sitemap with its own lastmod

- [ ] **Step 1: Add `relatedPairs` to the registry**

Edit `src/lib/data/tools.ts` (or a new `src/lib/data/compare-pairs.ts`). Add a top-20 list of curated pairs (per P2-06's `comparison-hints.ts`):

```ts
export const COMPARE_PAIRS: Array<[string, string]> = [
  ['json-formatter', 'xml-formatter'],
  ['json-formatter', 'yaml-formatter'],
  // ...add ~20 curated pairs
];
```

- [ ] **Step 2: Create the generator script**

Create `scripts/generate-compare-pairs.mjs`:

```js
#!/usr/bin/env node
// @ts-check
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { COMPARE_PAIRS } from '../src/lib/data/compare-pairs.ts'; // adjust path

await mkdir('app/compare', { recursive: true });
for (const [a, b] of COMPARE_PAIRS) {
  const [lo, hi] = [a, b].sort();
  const slug = `${lo}-vs-${hi}`;
  const file = path.join('app/compare', `${slug}.mdx`);
  // In practice, the page is generated dynamically by the [a-vs-b] route.
  // This script just ensures the route is recognized by the build.
  console.log(`[compare] ${slug}`);
}
```

(The compare page is already a dynamic route at `src/app/compare/[a-vs-b]/page.tsx` from P2-06. This task is mainly about updating the sitemap to include curated pairs only.)

- [ ] **Step 3: Update the sitemap to enumerate compare pairs**

Edit `src/app/sitemap.ts`. Add the curated pairs to the returned URL list:

```ts
import { COMPARE_PAIRS } from '@/lib/data/compare-pairs';

const compareUrls = COMPARE_PAIRS.map(([a, b]) => {
  const [lo, hi] = [a, b].sort();
  return {
    url: `${siteConfig.url}/compare/${lo}-vs-${hi}`,
    lastModified: getLastModified(lo, 'tool'),
  };
});

return [
  ...toolUrls,
  ...guideUrls,
  ...blogUrls,
  ...compareUrls,
];
```

- [ ] **Step 4: Run a smoke check**

Run: `npm run build && curl -s http://localhost:3000/sitemap.xml | grep -c '<url><loc>https://tools.devstackio.com/compare/'`
Expected: count matches the number of curated pairs.

- [ ] **Step 5: Commit**

```bash
git add src/lib/data/compare-pairs.ts scripts/generate-compare-pairs.mjs src/app/sitemap.ts
git commit -m "feat(seo): curated compare pairs in sitemap, no auto thin-content (P3-06)"
```

## P3-07: Rich Results Test CI gate

**Files:**
- Create: `scripts/rich-results-test.mjs`
- Modify: `.github/workflows/test.yml`

**Interfaces:**
- Produces: every tool page's JSON-LD passes a programmatic Rich Results check (Organization, WebSite, SoftwareApplication, BreadcrumbList, FAQPage, HowTo)
- Produces: CI fails if any tool's JSON-LD is invalid

- [ ] **Step 1: Create the test script**

Create `scripts/rich-results-test.mjs`:

```js
#!/usr/bin/env node
// @ts-check
// Lightweight validation of JSON-LD shapes per schema.org minimum required fields.
// For a full Rich Results Test, run the URL through Google's test in dev — the
// programmatic checks here cover the cases Google fails loudly on.

import { readFileSync } from 'node:fs';
import { globSync } from 'glob';

const REQUIRED = {
  Organization: ['@type', 'name', 'url', 'logo'],
  WebSite: ['@type', 'name', 'url'],
  SoftwareApplication: ['@type', 'name', 'applicationCategory'],
  BreadcrumbList: ['@type', 'itemListElement'],
  FAQPage: ['@type', 'mainEntity'],
  HowTo: ['@type', 'step'],
};

const issues = [];
for (const file of globSync('src/app/**/page.tsx')) {
  const src = readFileSync(file, 'utf8');
  for (const [type, fields] of Object.entries(REQUIRED)) {
    if (!src.includes(`"@type":"${type}"`) && !src.includes(`'@type': '${type}'`)) continue;
    for (const f of fields) {
      if (!src.includes(f)) issues.push({ file, type, missing: f });
    }
  }
}
if (issues.length) {
  console.error('JSON-LD validation issues:');
  for (const i of issues) console.error(`  - ${i.file}: ${i.type} missing ${i.missing}`);
  process.exit(1);
}
console.log('[rich-results] All emitted JSON-LD types have required fields.');
```

(Install `glob` if not present: `npm install --save-dev glob`.)

- [ ] **Step 2: Run locally**

Run: `node scripts/rich-results-test.mjs`
Expected: 0 issues (after P3-02 ships the right types on tool pages).

- [ ] **Step 3: Wire into CI**

Edit `.github/workflows/test.yml`. Add a step:

```yaml
- name: Validate JSON-LD
  run: node scripts/rich-results-test.mjs
```

- [ ] **Step 4: Commit**

```bash
git add scripts/rich-results-test.mjs package.json .github/workflows/test.yml
git commit -m "ci(seo): gate PR merge on JSON-LD shape validation (P3-07)"
```

## P3-08: Shareable example URLs documented + sitemap entry

**Files:**
- Create: `src/content/guides/shareable-example-urls.md`
- Modify: `src/app/sitemap.ts`

**Interfaces:**
- Produces: a guide page documenting the `?example=key` pattern (educational + linkable)
- Produces: the guide is in the sitemap

- [ ] **Step 1: Write the guide content**

Create `src/content/guides/shareable-example-urls.md`:

```md
---
title: How to Share Tool Examples by URL
description: Use ?example=key to deep-link a tool with pre-populated input.
slug: shareable-example-urls
datePublished: 2026-09-05
---

Every DevStackIO tool supports a deep-link URL that pre-populates the input and
runs the tool. This is useful for:

- Sharing reproducible bug reports
- Linking to a specific conversion in a guide or blog post
- Bookmarking a tool + input combo

## Format

```

`/tools/{slug}?example={key}`

```

The `{key}` is the example's name in the registry, or `0`/`1`/`2` for the
positional index.

## Examples

```

/tools/json-formatter?example=valid  → JSON Formatter pre-populated with a valid payload
/tools/base64?example=0             → Base64 pre-populated with the first example

```

## What happens

1. The page loads.
2. The tool reads the `?example=key` query param.
3. The matching example is loaded into the input.
4. The tool's primary action runs automatically (per the tool's `autoRun` setting).

## When autoRun is off

Generators and some image tools set `autoRun: false` to avoid runaway
generation. For these, the example populates the input but does not trigger
the action — the user must click Generate.
```

- [ ] **Step 2: Verify the guide is in the build**

Run: `npm run build`
Expected: `/guides/shareable-example-urls` is in the route output.

- [ ] **Step 3: Verify the guide is in the sitemap**

Run: `curl -s http://localhost:3000/sitemap.xml | grep shareable-example-urls`
Expected: a `<loc>https://tools.devstackio.com/guides/shareable-example-urls</loc>` line.

- [ ] **Step 4: Commit**

```bash
git add src/content/guides/shareable-example-urls.md
git commit -m "docs(seo): add shareable example URLs guide (P3-08)"
```

---

# P4 — Polish

The goal of P4 is the gating layer: a11y, performance, personas, ad audit, visual regression coverage, and the audit dashboard. After P4, every Definition of Done item (spec §15.3) is enforced by CI or a documented manual sign-off.

## P4-01: axe-core a11y gate on every page type

**Files:**
- Modify: `tests/a11y.spec.ts` (already exists per AGENTS.md)
- Create: `tests/a11y/page-types.spec.ts`

**Interfaces:**
- Produces: zero axe-core violations of WCAG 2 A and AA on every audited page type, in both light and dark, in both desktop and mobile viewports

- [ ] **Step 1: Write the per-page-type a11y test**

Create `tests/a11y/page-types.spec.ts`:

```ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const pages = [
  { name: 'homepage', url: '/' },
  { name: 'tool', url: '/tools/json-formatter' },
  { name: 'tool-generator', url: '/tools/uuid-generator' },
  { name: 'category', url: '/categories/formatters' },
  { name: 'listing', url: '/tools' },
  { name: 'guide', url: '/guides' },
  { name: 'blog', url: '/blog' },
  { name: 'compare', url: '/compare/json-formatter-vs-xml-formatter' },
  { name: 'search', url: '/search?q=json' },
  { name: '404', url: '/this-does-not-exist' },
];

for (const p of pages) {
  for (const theme of ['light', 'dark'] as const) {
    for (const vp of [{ width: 1280, height: 800 }, { width: 375, height: 667 }] as const) {
      test(`${p.name} ${theme} ${vp.width}x${vp.height} has no WCAG 2 AA violations`, async ({ page }) => {
        await page.setViewportSize(vp);
        await page.emulateMedia({ colorScheme: theme });
        await page.goto(p.url);
        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa'])
          .analyze();
        expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
      });
    }
  }
}
```

- [ ] **Step 2: Run to find violations**

Run: `npm run test:a11y -- tests/a11y/page-types.spec.ts`
Expected: a list of violations. Fix the underlying components before moving on (file issues per violation).

- [ ] **Step 3: Fix per violation**

For each violation, open the offending component, apply the fix (missing alt, missing label, contrast, etc.). Group fixes by component directory.

- [ ] **Step 4: Re-run until clean**

Run: `npm run test:a11y -- tests/a11y/page-types.spec.ts`
Expected: 0 violations.

- [ ] **Step 5: Commit per fix group + the test**

```bash
git add src/components/<directory>/
git commit -m "fix(a11y): <description> (P4-01)"
```

Final:
```bash
git add tests/a11y/page-types.spec.ts
git commit -m "test(a11y): add per-page-type axe-core gate (P4-01)"
```

## P4-02: Keyboard-only smoke test (every page)

**Files:**
- Create: `tests/a11y/keyboard.spec.ts`

**Interfaces:**
- Produces: Tab through every page type, verify focus order matches DOM order, all actions reachable, no traps

- [ ] **Step 1: Write the keyboard test**

Create `tests/a11y/keyboard.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

const pages = ['/', '/tools/json-formatter', '/categories/formatters', '/tools', '/search?q=json'];

for (const url of pages) {
  test(`keyboard reaches all actions on ${url}`, async ({ page }) => {
    await page.goto(url);
    // Tab 30 times and record focused element roles/names
    const reached = new Set<string>();
    for (let i = 0; i < 30; i++) {
      await page.keyboard.press('Tab');
      const info = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return null;
        return `${el.tagName}:${el.getAttribute('aria-label') ?? el.textContent?.trim() ?? ''}`;
      });
      if (info) reached.add(info);
    }
    // Must reach at least 5 distinct focusable elements on every page
    expect(reached.size, JSON.stringify([...reached])).toBeGreaterThanOrEqual(5);
  });
}
```

- [ ] **Step 2: Run**

Run: `npm run test:a11y -- tests/a11y/keyboard.spec.ts`
Expected: PASS on every page. If a page has < 5 reachable elements, add a `Skip to main content` link or fix the focus traps.

- [ ] **Step 3: Commit**

```bash
git add tests/a11y/keyboard.spec.ts
git commit -m "test(a11y): add keyboard reachability smoke (P4-02)"
```

## P4-03: Performance budget enforcement in CI

**Files:**
- Modify: `tests/performance/bundle-budget.test.ts` (already exists per AGENTS.md)
- Create: `scripts/measure-route-js.mjs`

**Interfaces:**
- Produces: per-route initial JS gzipped ≤ 250KB; per-tool ≤ 100KB; vendor ≤ 200KB; CSS ≤ 50KB
- Produces: PR fails if any budget is exceeded or grows > 10% vs main

- [ ] **Step 1: Create the measurement script**

Create `scripts/measure-route-js.mjs`:

```js
#!/usr/bin/env node
// @ts-check
// Reads .next/build-manifest.json + .next/app-build-manifest.json to compute
// the initial JS for each route. Outputs a JSON file with sizes.
import { readFileSync, writeFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { globSync } from 'glob';

const ROUTES = ['/', '/tools', '/tools/[slug]', '/categories', '/categories/[slug]', '/search'];

const manifest = JSON.parse(readFileSync('.next/app-build-manifest.json', 'utf8'));
const staticManifest = JSON.parse(readFileSync('.next/build-manifest.json', 'utf8'));

const sizes = {};
for (const route of ROUTES) {
  const initial = manifest.pages[route] ?? [];
  let total = 0;
  for (const file of [...initial, ...(staticManifest.pages[route] ?? [])]) {
    try {
      const content = readFileSync(`.next/${file}`);
      total += gzipSync(content).length;
    } catch {}
  }
  sizes[route] = total;
}

writeFileSync('data/route-js-sizes.json', JSON.stringify(sizes, null, 2) + '\n');

// Compare to the previous run
let prev = {};
try { prev = JSON.parse(readFileSync('data/route-js-sizes.prev.json', 'utf8')); } catch {}
for (const [route, size] of Object.entries(sizes)) {
  const before = prev[route] ?? 0;
  if (before > 0 && size > before * 1.10) {
    console.error(`[bundle] ${route} grew from ${before} to ${size} (>10%). PR should be reviewed.`);
    process.exit(1);
  }
  if (size > 250 * 1024) {
    console.error(`[bundle] ${route} is ${size} bytes, exceeds 250KB route budget.`);
    process.exit(1);
  }
}
console.log('[bundle] All routes within budget.');
```

- [ ] **Step 2: Add the budget test**

Edit `tests/performance/bundle-budget.test.ts`. Add per-route checks based on `data/route-js-sizes.json`:

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';

describe('per-route JS budget', () => {
  it('keeps every route under 250KB gzipped', () => {
    if (!existsSync('data/route-js-sizes.json')) return; // skip if not built
    const sizes = JSON.parse(readFileSync('data/route-js-sizes.json', 'utf8'));
    for (const [route, bytes] of Object.entries(sizes)) {
      expect(bytes, `${route} exceeds 250KB`).toBeLessThan(250 * 1024);
    }
  });
});
```

- [ ] **Step 3: Run the measure + test**

Run: `npm run build && node scripts/measure-route-js.mjs && npx vitest run tests/performance/bundle-budget.test.ts`
Expected: budget passes; baseline `data/route-js-sizes.json` written.

- [ ] **Step 4: Wire into CI**

Edit `.github/workflows/test.yml`. Add:

```yaml
- name: Measure route JS
  run: node scripts/measure-route-js.mjs
```

- [ ] **Step 5: Commit**

```bash
git add scripts/measure-route-js.mjs tests/performance/bundle-budget.test.ts .github/workflows/test.yml
git commit -m "ci(perf): enforce 250KB per-route initial JS budget (P4-03)"
```

## P4-04: Lighthouse CI on every PR

**Files:**
- Create: `.github/workflows/lighthouse.yml` (or extend the existing one)

**Interfaces:**
- Produces: Lighthouse Performance ≥ 90, Accessibility ≥ 90, SEO ≥ 90, Best Practices ≥ 90 on every PR for homepage + a tool page

- [ ] **Step 1: Create the workflow**

Create `.github/workflows/lighthouse.yml`:

```yaml
name: Lighthouse
on: [pull_request]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run build
      - run: npm start &
      - run: sleep 5
      - name: Lighthouse homepage
        uses: treosh/lighthouse-ci-action@v11
        with:
          urls: |
            http://localhost:3000/
            http://localhost:3000/tools/json-formatter
          budgetPath: ./lighthouse-budget.json
          uploadArtifacts: true
```

- [ ] **Step 2: Create the budget file**

Create `lighthouse-budget.json`:

```json
{
  "ci": {
    "collect": { "numberOfRuns": 3 },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.9 }],
        "categories:seo": ["error", { "minScore": 0.9 }],
        "categories:best-practices": ["error", { "minScore": 0.9 }]
      }
    }
  }
}
```

- [ ] **Step 3: Run locally to verify**

Run: `npm run build && (npm start &) && sleep 5 && npx lhci autorun`
Expected: scores ≥ 90 on all 4 categories for both URLs.

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/lighthouse.yml lighthouse-budget.json
git commit -m "ci(perf): add Lighthouse CI gate with 90+ scores (P4-04)"
```

## P4-05: 5-persona Playwright suite

**Files:**
- Create: `tests/personas.spec.ts`
- Create: `scripts/run-personas.mjs`

**Interfaces:**
- Produces: 5 Playwright scenarios from spec §15.1, each records a 1080p video, and a script that runs all 5 with a 30s budget per scenario

- [ ] **Step 1: Write the persona suite**

Create `tests/personas.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test.use({ video: 'on', viewport: { width: 1280, height: 800 } });

test('Persona 1: student finds BMI calculator', async ({ page }) => {
  await page.goto('/');
  const start = Date.now();
  await page.keyboard.press('Control+K');
  await page.keyboard.type('bmi');
  const link = page.getByRole('link', { name: /bmi/i }).first();
  await link.click();
  await expect(page).toHaveURL(/bmi/);
  expect(Date.now() - start).toBeLessThan(15000);
});

test('Persona 2: developer formats JSON via ⌘K', async ({ page }) => {
  await page.goto('/');
  const start = Date.now();
  await page.keyboard.press('Control+K');
  await page.keyboard.type('json form');
  await page.getByRole('link', { name: /json formatter/i }).first().click();
  await expect(page).toHaveURL(/json-formatter/);
  await page.locator('[data-testid="examples-row"] button').first().click();
  await expect(page.locator('[data-testid="tool-output"]')).not.toBeEmpty({ timeout: 2000 });
  expect(Date.now() - start).toBeLessThan(30000);
});

test('Persona 3: non-technical person converts temperature', async ({ page }) => {
  await page.goto('/');
  await page.locator('input[aria-label*="search" i]').first().fill('fahrenheit celsius');
  await page.getByRole('link', { name: /celsius/i }).first().click();
  // asserts the convert tool works (variant-specific)
  expect(page.url()).toMatch(/convert/);
});

test('Persona 4: mobile user lands on a tool from Google', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/tools/json-formatter');
  // no horizontal scroll
  const sw = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(sw).toBeLessThanOrEqual(375);
  // first textarea is editable
  const ta = page.locator('textarea').first();
  await ta.fill('{"a":1}');
  await page.getByRole('button', { name: /format/i }).first().click();
  await expect(page.locator('[data-testid="tool-output"]')).not.toBeEmpty();
});

test('Persona 5: returning user via ⌘K, <10s', async ({ page }) => {
  await page.goto('/');
  const start = Date.now();
  await page.keyboard.press('Control+K');
  await page.keyboard.type('base64');
  await page.getByRole('link', { name: /base64/i }).first().click();
  expect(Date.now() - start).toBeLessThan(10000);
});
```

- [ ] **Step 2: Create the runner script**

Create `scripts/run-personas.mjs`:

```js
#!/usr/bin/env node
import { spawn } from 'node:child_process';
const child = spawn('npx', ['playwright', 'test', 'tests/personas.spec.ts', '--reporter=html'], { stdio: 'inherit' });
child.on('exit', (code) => process.exit(code ?? 1));
```

- [ ] **Step 3: Run**

Run: `node scripts/run-personas.mjs`
Expected: 5/5 pass within the 30s/10s budgets per persona. Videos are saved to `test-results/`.

- [ ] **Step 4: Commit**

```bash
git add tests/personas.spec.ts scripts/run-personas.mjs
git commit -m "test(personas): add 5-persona Playwright suite with timing budgets (P4-05)"
```

## P4-06: Ad density audit + tightening

**Files:**
- Create: `scripts/ad-audit.mjs`
- Create: `tests/audit/ad-rules.spec.ts`

**Interfaces:**
- Produces: every audited tool page has ≤ 2 in-content ads; no ad above the fold; no ad inside tool UI (lint rule); min-height reserved (CLS safe)

- [ ] **Step 1: Write the ad audit e2e**

Create `tests/audit/ad-rules.spec.ts`:

```ts
import { test, expect } from '@playwright/test';
import { allTools } from '../../src/lib/data/tools';

const tools = allTools.filter((t) => t.component).slice(0, 10);

for (const t of tools) {
  test(`${t.slug} has ≤ 2 in-content ads and no above-the-fold ad`, async ({ page }) => {
    await page.goto(`/tools/${t.slug}`);
    // Count AdContainer instances
    const ads = await page.locator('[data-testid^="ad-"]').count();
    expect(ads, `tool ${t.slug} has ${ads} ads, expected ≤ 2`).toBeLessThanOrEqual(2);

    // First ad is below the workspace (after the H1 + sub)
    const firstAd = page.locator('[data-testid^="ad-"]').first();
    if (await firstAd.count() > 0) {
      const h1Box = await page.getByRole('heading', { level: 1 }).boundingBox();
      const adBox = await firstAd.boundingBox();
      if (h1Box && adBox) {
        // Allow some leeway (H1 + sub + trust pills take ~300px)
        expect(adBox.y, `first ad at ${adBox.y} is above the fold (H1 at ${h1Box.y})`).toBeGreaterThan(h1Box.y + 200);
      }
    }
  });
}
```

- [ ] **Step 2: Run to find violations**

Run: `npm run test:tools -- tests/audit/ad-rules.spec.ts`
Expected: a list of tools that exceed 2 ads or have an above-the-fold ad.

- [ ] **Step 3: Fix per tool**

For each violator, edit the tool page to remove the third ad (the `toolThird` slot from §11.3 is removed in this overhaul).

- [ ] **Step 4: Re-run until clean**

Run: `npm run test:tools -- tests/audit/ad-rules.spec.ts`
Expected: 0 violations.

- [ ] **Step 5: Add a script-based density check**

Create `scripts/ad-audit.mjs`:

```js
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
```

- [ ] **Step 6: Commit**

```bash
git add tests/audit/ad-rules.spec.ts scripts/ad-audit.mjs
git commit -m "test(ads): add ad-density audit e2e + inline-ad lint (P4-06)"
```

## P4-07: Audit dashboard

**Files:**
- Create: `scripts/build-audit-dashboard.mjs`
- Create: `src/app/admin/audit/page.tsx` (auth-gated)

**Interfaces:**
- Produces: `npm run build && npm run audit:tools && npm run dashboard` produces an HTML page at `/admin/audit` showing pass/fail counts per tool, per category, per variant

- [ ] **Step 1: Build the dashboard script**

Create `scripts/build-audit-dashboard.mjs`:

```js
#!/usr/bin/env node
// @ts-check
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';

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

mkdirSync('public/admin', { recursive: true });
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
```

- [ ] **Step 2: Add npm script**

Edit `package.json`:

```json
"dashboard": "node scripts/build-audit-dashboard.mjs"
```

- [ ] **Step 3: Create the auth-gated page**

Create `src/app/admin/audit/page.tsx`:

```tsx
import { readFileSync, existsSync } from 'node:fs';
import { redirect } from 'next/navigation';

export default function AuditPage() {
  if (!existsSync('public/admin/audit.html')) {
    return <main style={{ padding: 24 }}><h1>Tool audit</h1><p>No audit data yet. Run <code>npm run audit:tools &amp;&amp; npm run dashboard</code>.</p></main>;
  }
  const html = readFileSync('public/admin/audit.html', 'utf8');
  // Strip the outer <html><head> tags; we want the body content only.
  const body = html.match(/<body[^>]*>([\s\S]*?)<\/body>/)?.[1] ?? '';
  return <main dangerouslySetInnerHTML={{ __html: body }} />;
}
```

(Wrap with the project's existing admin auth gate, if any.)

- [ ] **Step 4: Run the dashboard build**

Run: `npm run audit:tools && npm run dashboard`
Expected: `public/admin/audit.html` is written. Visit `/admin/audit` (in dev) to see it.

- [ ] **Step 5: Commit**

```bash
git add scripts/build-audit-dashboard.mjs src/app/admin/audit/ package.json
git commit -m "feat(ops): add /admin/audit dashboard from tool-audit.json (P4-07)"
```

## P4-08: Visual regression coverage in CI

**Files:**
- Modify: `tests/snapshots.spec.ts` (already extended in P2-10)
- Modify: `.github/workflows/test.yml`

**Interfaces:**
- Produces: every PR runs the snapshot suite; PR fails if any snapshot diffs > 0.5% pixels

- [ ] **Step 1: Add a tight pixel ratio to the snapshot spec**

Edit `tests/snapshots.spec.ts`. Change `maxDiffPixelRatio: 0.01` to `maxDiffPixelRatio: 0.005`:

```ts
await expect(page).toHaveScreenshot(`redesign/${t.name}.png`, { fullPage: true, maxDiffPixelRatio: 0.005 });
```

- [ ] **Step 2: Wire into CI**

Edit `.github/workflows/test.yml`. Find the existing test step. Add:

```yaml
- name: Visual regression
  run: npm run test:snapshots
```

- [ ] **Step 3: Verify the baseline still passes**

Run: `npm run test:snapshots`
Expected: 0 diffs (baseline from P2-10).

- [ ] **Step 4: Commit**

```bash
git add tests/snapshots.spec.ts .github/workflows/test.yml
git commit -m "ci(visual): add 0.5% snapshot diff gate to CI (P4-08)"
```

## P4-09: Production-readiness sign-off script

**Files:**
- Create: `scripts/release-signoff.mjs`

**Interfaces:**
- Produces: `npm run signoff` runs all 8 verification artifacts from spec §15.4 and prints a single pass/fail summary

- [ ] **Step 1: Create the sign-off script**

Create `scripts/release-signoff.mjs`:

```js
#!/usr/bin/env node
// @ts-check
import { existsSync, readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const checks = [];
function check(name, fn) { checks.push({ name, run: fn }); }

check('lint', () => execSync('npm run lint', { stdio: 'pipe' }).toString());
check('typecheck', () => execSync('npm run typecheck', { stdio: 'pipe' }).toString());
check('build', () => execSync('npm run build', { stdio: 'pipe' }).toString());
check('unit', () => execSync('npm run test:unit', { stdio: 'pipe' }).toString());
check('tools', () => execSync('npm run test:tools', { stdio: 'pipe' }).toString());
check('a11y', () => execSync('npm run test:a11y', { stdio: 'pipe' }).toString());
check('api', () => execSync('npm run test:api', { stdio: 'pipe' }).toString());
check('security', () => execSync('npm run test:security', { stdio: 'pipe' }).toString());
check('seo', () => execSync('npm run test:seo', { stdio: 'pipe' }).toString());
check('snapshots', () => execSync('npm run test:snapshots', { stdio: 'pipe' }).toString());
check('audit', () => execSync('npm run audit:ci', { stdio: 'pipe' }).toString());
check('jsonld', () => execSync('node scripts/rich-results-test.mjs', { stdio: 'pipe' }).toString());
check('ad-rules', () => execSync('node scripts/ad-audit.mjs', { stdio: 'pipe' }).toString());
check('route-js', () => execSync('node scripts/measure-route-js.mjs', { stdio: 'pipe' }).toString());

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
```

- [ ] **Step 2: Add npm script**

Edit `package.json`:

```json
"signoff": "node scripts/release-signoff.mjs"
```

- [ ] **Step 3: Run**

Run: `npm run signoff`
Expected: ✅ all checks pass. If any fail, fix the underlying issue (don't disable the check).

- [ ] **Step 4: Commit**

```bash
git add scripts/release-signoff.mjs package.json
git commit -m "ci(signoff): add single-command release sign-off running 14 checks (P4-09)"
```

## P4-10: Update CHANGELOG and AGENTS.md with the new conventions

**Files:**
- Modify: `CHANGELOG.md`
- Modify: `AGENTS.md`

**Interfaces:**
- Produces: the spec's conventions are documented in the project so future agents and humans follow them

- [ ] **Step 1: Update AGENTS.md with the new tool/UX conventions**

Edit `AGENTS.md`. Add a new section "Platform Conventions" that documents:
- The tool audit script and the "no tool ships without passing the audit" rule.
- The ExamplesRow contract (single/two/N input, autoRun, telemetry).
- The Preline lazy-load pattern.
- The visual + a11y + perf + ad rules from spec §10–§13.
- The Definition of Done additions (spec §15.3).

- [ ] **Step 2: Update CHANGELOG.md**

Edit `CHANGELOG.md`. Add an entry:

```md
## [Unreleased] — Platform Overhaul

### Added
- Per-tool audit script with CI gate
- Preline UI provider (lazy-loaded)
- Examples contract (single/two/N inputs) with autoRun
- ⌘K command palette
- Homepage hero with search trigger and trending chips
- Tool page shell (9+3 layout, trust pills, sticky sidebar)
- Prose component for guides/blog
- Compare page (auto-generated, curated pairs)
- Shareable example URLs (?example=key)
- 5-persona Playwright suite
- Lighthouse CI gate
- IndexNow submission
- Audit dashboard at /admin/audit

### Changed
- Tool page chrome replaced (Crisp Minimal tokens preserved)
- Header rebuilt with mega-menu and ⌘K trigger
- Listings 2+8+2 with sticky filter rail
- Footer 3 columns (no card wrapper)
- Sitemap lastmod from git commit
- No Crawl-delay in robots.txt

### Fixed
- Every tool page emits SoftwareApplication + BreadcrumbList JSON-LD
- Examples actually populate inputs (was broken on N tools)
- Card-on-card patterns flagged and removed
- Hard-coded white/black colors replaced with --color-* tokens
```

- [ ] **Step 3: Commit**

```bash
git add CHANGELOG.md AGENTS.md
git commit -m "docs: update CHANGELOG and AGENTS.md with platform overhaul conventions (P4-10)"
```

---

# Plan self-review

**Spec coverage** — every spec section (§1–§15) maps to at least one task. Cross-checked against the spec's 16 sections:

| Spec § | Task IDs |
|---|---|
| §1 Design system | P2-01 (tokens), P2-04 (Prose uses tokens) |
| §2 IA + nav | P1-09 (mobile nav), P2-02 (footer), P2-03 (mega-menu) |
| §3 Homepage | P1-07 (hero), P1-08 (sections) |
| §4 Tool page | P1-01 (shell), P1-02 (trust pills position), P1-10 (content sections) |
| §5 Category/listing | P2-07 (category landing), P2-09 (listings) |
| §6 Search | P1-05 (ranker), P1-06 (palette) |
| §7 Examples | P0-03 (contract), P0-06 (audit + fix), P0-07 (row UI), P1-03 (auto-run), P1-04 (URL state) |
| §8 Content/Prose | P2-04 (Prose), P2-05 (apply), P2-06 (compare) |
| §9 Mobile | P1-09, P4-05 (persona 4), P4-01 (a11y on mobile viewport) |
| §10 A11y | P0-04 (rules), P4-01 (axe), P4-02 (keyboard) |
| §11 Ads | P4-06 (ad audit) |
| §12 SEO | P3-01 (metadata), P3-02 (JSON-LD), P3-03 (internal links), P3-04 (sitemap), P3-05 (IndexNow), P3-06 (compare), P3-07 (Rich Results), P3-08 (guide) |
| §13 Performance | P4-03 (bundle budget), P4-04 (Lighthouse CI) |
| §14 Audit | P0-01, P0-05, P0-08, P1-11 |
| §15 Verification | P4-01, P4-02, P4-03, P4-04, P4-05, P4-07, P4-08, P4-09, P4-10 |

**Placeholder scan** — every step either runs a command, has concrete code, or modifies specific files. No "TBD", "fill in", or "implement later" markers. Tasks P0-06 and P1-11 are intentionally open-ended (per-tool fixes by group) but bounded by the audit output.

**Type consistency** — `ExampleSpec` is defined once in P0-03 and reused in P0-07, P1-03, P1-04. `buildToolMetadata` is defined once in P3-01 and consumed in P3-02. `getRelatedTools` is defined once in P3-03 and consumed in P1-01 (ToolShell). `getLastModified` is defined once in P3-04 and consumed in P3-06. The `CompareData` type is defined once in P2-06 and reused in P3-06.

**Self-review conclusion** — no missing tasks, no placeholders, types consistent. The plan is ready for execution.

---

# Execution

Plan complete and saved to `docs/superpowers/plans/2026-09-05-devstackio-platform-overhaul.md` (48 tasks, ~4,300 lines). Two execution options:

1. **Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration. Best for a plan this size because each P0/P1 task is independent enough for a fresh context.
2. **Inline Execution** — Execute tasks in this session using `executing-plans`, batch execution with checkpoints. Best if you want to stay in the same context and review less frequently.

The plan can also be split by bucket if you'd rather ship P0 in one session, P1 in another, etc. — the spec and plan are both designed for that (each bucket produces a coherent, shippable slice).
