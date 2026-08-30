# Audit Follow-ups

Items flagged during the [project audit] that were **not** fixed in the
initial cleanup pass. Captured here so they don't get lost.

## Resolved in this pass

- ~~Remove `ssr: false` from `dynamic-tool-loader.tsx` (177 tool components)~~ —
  **attempted, then reverted.** See follow-up #7 below for the
  investigation and the correct fix.
- ~~Remove hardcoded `aggregateRating` from `tools/[slug]/page.tsx` JSON-LD~~
- ~~Fix 10 ESLint warnings (dead imports, dead vars, unused eslint-disable)~~
- ~~Convert `/guides/[slug]` to `/guides/[...slug]` catch-all route~~ — **fix #1
  below; the deployed site is now serving guides at the slashed URLs the
  rest of the app has been linking to.**

## Open follow-ups

### 1. ~~`/guides/[slug]` URL-encoded segments (medium)~~ — **RESOLVED**

The deployed site was serving guides only at the URL-encoded
`/guides/concepts%2Fjson-basics` form. The route file was a single-segment
`[slug]` (regex `^/guides/([^/]+?)(?:/)?$`) but the data slugs contained a
literal `/` (e.g. `concepts/json-basics`). When a user clicked a normal
link (`/guides/concepts/json-basics`), the nginx/edge decoded the path,
treated it as extra segments, and returned 404 → "loading but no
content" on the client.

**Fix applied** (commit pending):

- `src/app/guides/[slug]/page.tsx` → `src/app/guides/[...slug]/page.tsx`
  (catch-all dynamic segment)
- `params.slug` is now `string[]` and is joined with `/` to reconstruct
  the canonical slug
- `generateStaticParams` returns `{ slug: topic.slug.split("/") }` for
  every topic, plus alias paths
- Two legacy short slugs (`getting-started-json`, `understanding-jwt`)
  are mapped to their canonical targets via a local `guideAliases` map
  (mirroring the `aliasSlugs` pattern used by tool pages)
- Aliases are resolved server-side and the canonical page is rendered
  in place; canonical `<link>` and JSON-LD URL fields point at the
  canonical slug for SEO
- `dynamicParams` left at its default (`true`) so any future
  unanticipated slug resolves at request time rather than 404ing

**Verification** (`node .next/standalone/server.js` against the built
artifact):

```
GET /guides/best-practices/image-optimization -> 200 (119791 bytes)
GET /guides/concepts/json-basics                -> 200 (107927 bytes)
GET /guides/getting-started-json                 -> 200 (107923 bytes)
GET /guides                                     -> 200 (166813 bytes)
```

All 5 SEO JSON-LD tests pass, all 32 a11y tests pass, all 113 tool e2e
tests pass, 363/363 unit tests pass, lint + typecheck clean.

Build routes generated 39 topic paths + 2 alias paths = 41 guide routes,
all stored under real directory paths like
`.next/server/app/guides/concepts/json-basics.html` (no more
`%2F` encoding).

### 2. Finance tool layer audit (medium)

30 finance calculators are registered in `src/lib/data/tools.ts` with the
`fi*` id prefix. Per `AGENTS.md` they must reuse:

- `src/lib/finance/calculations.ts` (pure math)
- `src/lib/finance/format.ts` (display formatting)
- `src/components/finance/inputs.tsx` (shared inputs)
- `src/lib/finance/precision.ts` (rounding)

Each calculator should expose a **"Contribution timing"** toggle for
SIP / compound-interest style tools (`annuity` vs `annuityDue`, default
`annuityDue`).

Open questions to investigate:

- Are all 30 calculators actually routed through the shared layer, or do
  some still have inline math?
- Is `ContributionTiming` implemented everywhere it should be?
- Are `loanScheduleTotals` and `amortizationSchedule` used in every
  loan-style tool (so the principal always sums to the loan)?

**Why not fixed now:** Would need to read 30 component files + their math
in detail. A separate, focused pass.

### 3. Per-tool fixture vs registry coverage (low)

`tests/tools.spec.ts` is data-driven over `tests/fixtures/*.json`. Each
new tool needs a fixture entry or it won't be tested. Verify the
fixture set covers every slug in `src/lib/data/tools.ts`.

A quick check is to run:

```bash
node -e "const r=require('./src/lib/data/tools.ts'); console.log(r.allTools.length)"
```

…and compare to the fixture count, but a full coverage report should be
generated as part of the next finance / tool QA pass.

### 4. Hardcoded font URL in OG image route (low)

`src/app/og/[...slug]/route.tsx:7` references
`https://fonts.gstatic.com/s/inter/v19/...` directly. The font fetch has
a 3-second timeout and a fallback to system fonts, but the version is
pinned to `v19`. A pinned CDN URL:

- Couples the OG image quality to a specific font version that Google
  can change without notice.
- Sends a request to gstatic on every cold OG image render.

**Why not fixed now:** Not broken, but worth a self-hosted font or a
build-time font download.

### 5. Commit `541ecdf "preview card issues fixed"` regression check (low)

The commit touches 5 files (`blog/[slug]`, `compare/[slug]`,
`guides/[slug]`, `tools/[slug]`, `public/search-index.json`) and may
have introduced regressions in the OG preview pipeline. Read the diff
with:

```bash
git show 541ecdf
```

…and cross-check the OG image routes still produce correct 1200x630
previews. Also worth checking whether the search index was regenerated
to match the new metadata.

### 6. `scripts/interlink.mjs` `eval()` (low — accepted)

The script reads `.ts` source files and `eval()`s the extracted array
literal to load data without compiling. The eslint-disable directive
was removed because `no-eval` is not enabled in the config, so the
directive was a no-op. The `eval()` itself remains.

A safer alternative would be to either:

- Compile the data files with `tsc` and import the `.js` outputs, or
- Use a regex-based extractor that produces a pure JSON literal, then
  `JSON.parse` it (won't work for all data shapes — e.g. unquoted keys,
  trailing commas in TS).

**Why not fixed now:** Risk of silently breaking the build-time interlink
job. Worth a focused refactor with full coverage of the data shapes.

---

## Verification log (this pass)

| Check | Result |
| --- | --- |
| `npm run lint` | 0 warnings (was 10) |
| `npm run typecheck` | pass |
| `npm run build` | pass — 306 static HTML files, 396 search docs, CSP regenerated |
| `npm run test:unit` | 363/363 pass |
| `npm run test:tools` | 113/113 pass |
| OG image of `/tools/json-formatter` | _(skipped — `ssr: false` change reverted, see #7)_ |

---

### 7. `next/dynamic` with `ssr: false` bails out SSR for 177 tool UIs (medium)

**File:** `src/components/tools/dynamic-tool-loader.tsx:182-189`

The audit attempted to remove `ssr: false` so that tool UIs would be
included in the initial server-rendered HTML. **It did not work.**

#### What actually happens

The static HTML for `/tools/json-formatter` still contains:

```html
<template data-dgst="BAILOUT_TO_CLIENT_SIDE_RENDERING"></template>
<div class="flex items-center justify-center min-h-[200px]">
  <div class="text-sm text-surface-400 dark:text-dark-muted">Loading tool...</div>
</div>
```

`BAILOUT_TO_CLIENT_SIDE_RENDERING` is the diagnostic Next.js attaches when
a `next/dynamic` wrapper bails out during server rendering. The output is
identical whether `ssr: false` is set or not, because:

- `next/dynamic` defers the underlying import as a separate chunk.
- Even with the default `ssr: true`, the dynamic boundary still emits the
  `loading` fallback in the initial server HTML and only resolves the
  actual component on the client.

The e2e harness still passes (113/113) because the harness runs against
the live dev server, which already has the chunks compiled and is fast
enough to satisfy the `tool-output` detection contract.

#### Why this matters

- Crawlers (Google, social-card previewers) see only a "Loading tool…"
  spinner in the initial HTML.
- Social-card previews lose tool UI affordances.
- The first paint always shows the spinner, then the tool pops in
  (CLS and a small LCP hit for tools that draw outside the loading
  placeholder's reserved height).

#### Correct fix (next pass)

Replace the `next/dynamic` boundary with **static imports at the top of
`dynamic-tool-loader.tsx`**, and have `ToolInterface` render the imported
component directly. That removes the dynamic boundary entirely. The
trade-off:

- All 177 tool components ship in the initial client bundle (or are
  split by route if the loader is per-page).
- Webpack / Turbopack will tree-shake the `toolLoaders` map, so the
  import-graph stays manageable.

A lighter alternative is to **make `ToolInterface` an async server
component** that imports each tool's server-safe UI shell (a presentational
subset that doesn't need `"use client"`) and renders it on the server,
while the full interactive client component is loaded via a separate
hydration script. That preserves the bundle-splitting benefit *and*
serves the shell to crawlers.

**Why not fixed now:** Touches every tool component's export shape and
the build chunking strategy. Needs a separate focused pass with
before/after bundle-size measurements.
