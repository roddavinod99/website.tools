# Competitive Strategy: tools.devstackio.com vs rapidtables.com

> **Goal**: Make `tools.devstackio.com` the best alternative to `https://www.rapidtables.com` on the entire internet (humans + AI agents). Drive from current baseline to **1,000,000+ visitors/month within 9-12 months** on a sustainable privacy-first stack.

---

## 1. Why this plan exists

RapidTables gets ~6 million visitors/month on a 15-year-old, ad-monetized, mobile-hostile, plain-HTML website. They win on **long-tail SEO surface** and **content depth per page**, not on UX. DevStackIO already wins on UX (privacy-first, dark mode, modern React/Next.js, interactive), but currently has a fraction of RapidTables' indexable URL footprint. The plan below closes that gap without sacrificing what makes DevStackIO different.

## 2. Competitive landscape

| Competitor | Strength | Opening for us |
|---|---|---|
| **rapidtables.com** (~6M/mo) | 5,000+ long-tail URLs, every "X-to-Y" pair is a separate indexable page. 15 years of inbound links. Heavy on math/electrical/lighting/finance calculators. | Dated UI, no dark mode, poor mobile, no interactivity, no privacy story. |
| **calculator.net** (~10M/mo) | Comprehensive math/finance/health/fitness. Strong brand trust. | Ad-heavy, dev-tool blind spot. |
| **omnicalculator.com** (~15M/mo) | Polished UX, thorough content per page. | Ad-heavy, registration walls. |
| **convertunits.com** (~3M/mo) | Dedicated to unit conversion, every pair is a separate URL. | Tiny toolset, dated design. |
| **tools.devstackio.com** (current) | 165 modern tools, privacy-first, dark mode, fast, best-in-class dev tools. | Calculator footprint is ~25% of RapidTables'. No long-tail conversion URLs. No pre-filled value pages. No "how to convert" pages. No consumer health/age/date calculators. |

## 3. How RapidTables actually gets 6M visitors (their playbook)

1. **Long-tail URL multiplication**: every "X to Y" pair is a separate URL (`/convert/temperature/fahrenheit-to-celsius.html`).
2. **Pre-filled value pages**: `/convert/temperature/100-c-to-f.html` — same URL pattern, value embedded in the path.
3. **Static HTML, no JS framework** → instant crawlability, sub-200ms TTFB.
4. **Rich text on every page**: definition, formula, worked examples, conversion tables, "see also" cross-links.
5. **Bidirectional cross-linking**: every page links to its reverse + every other page in the same family.
6. **Educational sub-pages**: `/convert/temperature/how-fahrenheit-to-celsius.html` for the "how to convert" intent.
7. **Conversion tables**: the most-linked content on every page (e.g. "0°F = -17.78°C, 32°F = 0°C, 212°F = 100°C").
8. **15+ years of accumulated inbound links** from educators, students, and other sites.

## 4. The 6 honest gaps blocking 1M/mo

1. **Calculator footprint is thin.** Only ~25% of RapidTables' coverage in math/health/date/electrical/lighting.
2. **No `/convert/<x>-to-<y>/` URL pattern.** Single `unit-converter` page vs their ~500 temperature URLs alone.
3. **No pre-filled "value" pages.** Their `/convert/temperature/100-c-to-f.html` is a top-volume query we don't answer.
4. **No "how to convert" educational pages.** Their `/convert/temperature/how-fahrenheit-to-celsius.html` ranks for "how to convert fahrenheit to celsius" intent.
5. **No cross-linking on tool pages.** They devote ~30% of every page to "see also" links. We have 4-8 related-tool cards.
6. **No programmatic landing-page engine.** Without one, we can never get past 165 pages of footprint.

## 5. What we already have going for us

- **165 tools, modern stack** (Next.js 15, TypeScript, Tailwind, Server-rendered, SSG by default)
- **Privacy-first + dark mode** — strongest differentiator in the space
- **Excellent JSON-LD** (SoftwareApplication, FAQPage, HowTo, BreadcrumbList) — already better than RapidTables
- **`llms.txt` published** — AI agents know about us
- **Trust badges at the top of every tool page** (`ShieldCheck` / `EyeOff` / `Lock` / `Activity`)
- **Guides, blog, compare, tutorials, toolkits** — solid content foundation
- **Static generation, IndexNow, sitemap with git-based lastmod** — already in place
- **Finance, IP/subnet, regex, JWT, hash** categories where we beat RapidTables handily
- **Modern UX** — Copy buttons, dark mode, keyboard shortcuts, real-time results, examples, FAQ accordion

## 6. Locked-in decisions (confirmed with user)

| Decision | Choice |
|---|---|
| Scope | **Phases 1 + 2**: 12 calculators + 350+ conversion URLs |
| Timeline | **9-12 months** to 1M/mo |
| URL strategy | **Static SSG** for all new pages (pre-rendered at build time) |
| Audience | **Full expansion** (dev tools + consumer calculators) |
| URL prefix | **`/convert/*`** (matches RapidTables 1:1) |
| Path depth | **Two-segment**: `/convert/<category>/<from>-to-<to>` |
| Brand voice | **Privacy-first + modern UX** (vs RapidTables' dated UI) |
| Backlink strategy | **Embeddable iframe widgets** (modal on every tool page) |
| Search Console | Both GSC and Bing Webmaster verified |

## 7. The 7-PR build sequence

| # | PR | New URLs | Search universe added | Days |
|---|---|---|---|---|
| 1 | **Landing-page engine** — types, registry, catch-all route, sitemap segmentation, embed widget, JSON-LD helpers | 0 (infrastructure) | — | 3-5 |
| 2 | **Unit converter long-tail** — ~350 conversion URLs + 10 category hubs + 20 "how to" pages + 30 pre-filled value pages | ~410 | ~5M/mo | 3-5 |
| 3 | **BMI Calculator** + 50 pre-filled health pages + `/categories/health-calculators` | ~52 | ~4M/mo | 2-3 |
| 4 | **Age + Date Calculators** + ~60 pre-filled pages + `/categories/date-time-calculators` | ~63 | ~3M/mo | 2-3 |
| 5 | **Mortgage + Compound Interest + Loan EMI upgrades** + ~80 pre-filled pages | ~82 | ~3.5M/mo | 3-4 |
| 6 | **Scientific + Math trio + Tip + Discount** + `/categories/math-calculators` | ~33 | ~2.5M/mo | 3-4 |
| 7 | **Inflation + VAT/GST upgrades + Electrical + Lighting categories + cross-linking retrofit** | ~108 | ~1.5M/mo | 3-4 |
| **Total** | | **~748 new URLs** | **~19.5M/mo** | **~20-28 days** |

## 8. PR 1 — Landing-page engine (the heart of the plan)

### Goal
Build the infrastructure that lets the next 6 PRs each ship dozens of static landing pages without touching routing, JSON-LD, or sitemap code.

### Architecture

```
src/lib/seo/landing-pages.ts              # LandingPage type, generator registry, build-time emitter
src/app/convert/[category]/[...slug]/page.tsx  # Catch-all SSG route
src/components/landing/                   # Landing page template, conversion table, see-also block
src/components/embed-widget.tsx           # "Copy embed code" modal + iframe-friendly rendering
src/lib/seo/json-ld.ts                    # Extended with WebApplication + FAQPage + BreadcrumbList builders
scripts/emit-landing-pages.mjs            # One-off generator (called by build)
tests/landing-pages.test.ts               # Pure-data tests for the generator
```

### Data model

```ts
// src/lib/seo/landing-pages.ts

export type LandingPageIntent = "compute" | "convert" | "learn" | "define";

export interface LandingPage {
  /** Canonical tool slug, must exist in src/lib/data/tools.ts */
  canonicalSlug: string;
  /** Category for the URL: "length" | "temperature" | "health" | etc. */
  category: string;
  /** Final URL slug: "cm-to-feet" | "100-c-to-f" | "180cm-75kg" */
  slug: string;
  /** Page intent */
  intent: LandingPageIntent;
  /** Title (≤ 60 chars for SEO) */
  title: string;
  /** Meta description (≤ 160 chars) */
  description: string;
  /** Prefill values passed to the canonical tool's input fields */
  prefill: Record<string, string>;
  /** Optional body content: definition, formula, examples, see-also */
  content?: {
    intro?: string;
    formula?: string;
    example?: string;
    table?: { label: string; from: string; to: string }[];
    seeAlso?: string[];   // slugs of other landing pages
  };
  /** FAQ items for FAQPage JSON-LD */
  faq?: { question: string; answer: string }[];
  /** Whether to noindex this page (default false) */
  noindex?: boolean;
}
```

### Registry pattern

A flat list of typed entries:

```ts
// inside the same file
export const landingPages: LandingPage[] = [
  // PR 2 — units
  { canonicalSlug: "unit-converter", category: "length", slug: "cm-to-feet", intent: "convert", ... },
  { canonicalSlug: "unit-converter", category: "temperature", slug: "100-c-to-f", intent: "convert", ... },
  // PR 3 — BMI
  { canonicalSlug: "bmi-calculator", category: "health", slug: "180cm-75kg", intent: "compute", ... },
  // PR 4 — age
  { canonicalSlug: "age-calculator", category: "age", slug: "from-1990-05-15", intent: "compute", ... },
];
```

### Catch-all SSG route

`src/app/convert/[category]/[...slug]/page.tsx`:

- `generateStaticParams` walks the registry, emits `{ category, slug: [page.slug] }` for every page
- Resolves the page from the registry by `(category, slug[0])`
- Looks up the canonical tool via `allTools.find(t => t.slug === page.canonicalSlug)`
- Renders the tool (passing `prefill`) inside a landing-page template that includes:
  - H1 from `page.title`
  - Lead paragraph from `page.description` + `page.content.intro`
  - `<ToolInterface>` (the existing dynamic loader) with prefill applied via a `useEffect` that calls `dispatchLoadExample` (PR 5+ — for PR 1, the tool renders with the prefill via `URLSearchParams` consumed in the tool's component)
  - Conversion table (from `page.content.table`)
  - "See also" cross-links (from `page.content.seeAlso`)
  - FAQ block (from `page.faq`)
  - JSON-LD: `WebApplication` (or `SoftwareApplication` for tool pages) + `FAQPage` + `BreadcrumbList` + `Organization @id` reference
  - Trust badges (existing `ShieldCheck` / `EyeOff` / `Lock` / `Activity`)
- `generateMetadata` builds title/description/OG/Twitter/canonical
- `metadata.robots = noindex` if `page.noindex`

### Sitemap segmentation

`src/app/sitemap.ts` is updated to emit a `sitemapindex` referencing four child sitemaps:

- `sitemap-tools.xml` — every `/tools/<slug>` page
- `sitemap-conversions.xml` — every `/convert/<category>/<slug>` page (NEW)
- `sitemap-guides.xml` — every `/guides/...` page
- `sitemap-blog.xml` — every `/blog/...` page

The current `src/app/sitemap.ts` likely emits a single `UrlSet`; this PR refactors it into a `SitemapIndex` referencing the four children. Each child is its own route handler under `src/app/sitemap-<name>.xml/route.ts` or generated via a `generateSitemaps()` function.

`lastmod` per AGENTS.md: W3C Datetime format, sourced from the git commit date for tool pages + landing pages. The existing pattern in `src/lib/sitemap` (if present) or a new `src/lib/sitemap/lastmod.ts` is used.

### Embed widget

`src/components/embed-widget.tsx`:

- A button in the tool page header (or QuickLinks): "Embed this tool"
- Opens a modal with:
  - A 600x400 iframe preview of the tool
  - A `<textarea>` with copy-paste HTML: `<iframe src="https://tools.devstackio.com/embed/<slug>" width="600" height="400" frameborder="0"></iframe>`
  - Width/height inputs
- The `/embed/<slug>` route renders the tool with a special "minimal" layout (no header, no sidebar, no ads, no personalization hooks)
- Backlink strategy: anyone who wants to embed the tool in their blog/Stack Overflow answer/etc. gets a free backlink to tools.devstackio.com

### JSON-LD helpers

Extend `src/lib/seo/json-ld.ts` (added in v1.1.14) with:

- `webApplicationJsonLd({ name, description, url, applicationCategory, featureList, screenshotUrl })` — for landing pages
- `softwareApplicationJsonLd(tool)` — already exists, reused
- `faqPageJsonLd(faqs)` — already exists, reused
- `breadcrumbListJsonLd(items)` — already exists, reused
- All emitted script bodies go through `jsonLdScriptBody()` (per the Next.js JSON-LD guide, escapes `<` → `\u003c`)

### What PR 1 does NOT include (deferred to later PRs)

- No actual landing-page content. The registry is empty (or has 1-2 placeholder entries to prove the route works).
- No BMI tool, no age tool, no new calculators.
- No new categories.
- The existing `unit-converter` tool is referenced but no `/convert/...` pages are emitted yet.

### PR 1 verification

- `npm run lint` clean
- `npm run typecheck` clean
- `npm run build` clean (308 + N landing pages)
- `npm run test:tools` 113/113 (no regression)
- `npm run test:a11y` 32/32 (no regression)
- `npm run test:unit` (new `tests/landing-pages.test.ts` passes)
- Sitemap now emits a `sitemapindex` with 4 children
- Embed widget renders a working modal on every tool page

### PR 1 commit + version

- Conventional commit: `feat(seo): landing-page engine for long-tail conversion URLs`
- Version bump: minor (1.6.0 → 1.7.0) per AGENTS.md auto-release

## 9. PR 2 — Unit converter long-tail

### Goal
~410 new static URLs from the existing `unit-converter` tool. No new components.

### Conversion pairs (top-volume by global search)

| Category | Pair count | Sample URLs |
|---|---|---|
| Length | 50 | `/convert/length/cm-to-feet`, `/convert/length/feet-to-cm`, `/convert/length/inch-to-cm`, `/convert/length/meter-to-feet`, `/convert/length/km-to-mile`, … |
| Weight | 30 | `/convert/weight/kg-to-lb`, `/convert/weight/lb-to-kg`, `/convert/weight/oz-to-g`, … |
| Temperature | 12 | `/convert/temperature/c-to-f`, `/convert/temperature/f-to-c`, `/convert/temperature/c-to-k`, `/convert/temperature/f-to-k`, … |
| Time | 40 | `/convert/time/seconds-to-minutes`, `/convert/time/hours-to-days`, … |
| Area | 30 | `/convert/area/sqm-to-sqft`, `/convert/area/acres-to-hectares`, … |
| Volume | 40 | `/convert/volume/liters-to-gallons`, `/convert/volume/cups-to-ml`, … |
| Speed | 20 | `/convert/speed/mph-to-kmh`, `/convert/speed/knots-to-mph`, … |
| Pressure | 20 | `/convert/pressure/psi-to-bar`, `/convert/pressure/pa-to-psi`, … |
| Energy | 20 | `/convert/energy/kwh-to-btu`, `/convert/energy/joules-to-calories`, … |
| Data storage | 30 | `/convert/data-storage/mb-to-kb`, `/convert/data-storage/gb-to-mb`, … |
| Number bases | 12 | `/convert/number/decimal-to-binary`, `/convert/number/binary-to-hex`, … |
| Currency | (use existing `currency-converter`) | — |

### Category hubs (12 pages)

`/convert/length`, `/convert/weight`, `/convert/temperature`, … — each lists every pair in the family + a "Popular conversions" block + a 200-word "About" content block.

### "How to convert" pages (20 pages)

`/convert/length/how-cm-to-feet`, `/convert/temperature/how-fahrenheit-to-celsius`, … — educational intent, each ~300 words of body content with worked examples.

### Pre-filled value pages (~30 pages)

The 10 highest-volume pre-fills per top category. Examples:
- `/convert/temperature/100-c-to-f`
- `/convert/temperature/0-c-to-f`
- `/convert/temperature/32-f-to-c`
- `/convert/temperature/98-f-to-c`
- `/convert/length/180cm-to-feet`
- `/convert/length/6ft-in-cm`
- `/convert/weight/70kg-to-lb`
- `/convert/weight/150lb-to-kg`
- …

Total: ~410 new URLs.

### `unit-converter` tool changes

The existing tool needs to:
- Accept `?value=X&fromUnit=Y&toUnit=Z` query params and prefill the inputs
- Use `useSearchParams()` to read the query
- Set the inputs on mount via `useEffect`
- For pre-filled "value" pages, the URL is `/convert/temperature/100-c-to-f` and the path encodes the value — the catch-all route splits the slug, extracts the value, and sets `?value=100&fromUnit=c&toUnit=f`

### PR 2 verification

Same as PR 1, plus:
- All 410 new pages render with the right prefill
- All 410 pages are in `sitemap-conversions.xml`
- Cross-linking works: `/convert/length/cm-to-feet` links to `/convert/length/feet-to-cm` and to `/convert/length/inch-to-cm`

### PR 2 commit + version

`feat(seo): long-tail conversion URLs for unit converter (~410 pages)` → 1.7.0 → 1.8.0 (minor)

## 10. PRs 3-7 (high-level)

Each PR follows the same pattern:

1. Add the new tool(s) to the registry
2. Build the tool component(s) (browser-only, React 19 hooks, no `useEffect` setState anti-pattern)
3. Add the content JSON file
4. Add the registry entry with sequential ID (`f` is taken by Formatters, so Finance is `fi<n>`, Utilities is `u<n>`, etc.)
5. Add a fixture entry to `tests/fixtures/<category>.json`
6. Wire the tool into `dynamic-tool-loader.tsx`
7. Add a list of landing pages to `landing-pages.ts` (the engine from PR 1)
8. Run all 5 verification commands
9. Commit + version bump

### PR 3 — BMI Calculator

- `src/components/tools/health/bmi-calculator.tsx` (~300 lines)
- `src/content/tools/bmi-calculator.json`
- 50 pre-filled landing pages: `/health/bmi-180cm-75kg`, `/health/bmi-165cm-60kg`, …
- New `/categories/health-calculators` hub
- BMI formula + WHO classification table on every page

### PR 4 — Age + Date Calculators

- `src/components/tools/date/age-calculator.tsx`
- `src/components/tools/date/date-calculator.tsx`
- 60 pre-filled pages: `/age/from-1990-05-15`, `/date/days-between-2026-01-01-and-2026-09-02`, …
- New `/categories/date-time-calculators` hub

### PR 5 — Mortgage + Compound + EMI upgrades

You already have these. The PR is about *expanding* them:
- Mortgage: US/UK/CA/AU/IN country variants, down-payment sliders, full amortization table
- Compound Interest: monthly/annual contribution modes, inflation-adjusted mode
- Loan EMI: car/personal/home/education loan types
- 80 pre-filled pages: `/finance/mortgage-300000-30y-7pct`, `/finance/compound-10000-10y-5pct-monthly-500`, …

### PR 6 — Scientific + Math trio + Tip + Discount

- Scientific Calculator: full screen, history, brackets, trig/log, memory keys
- Average / Stddev / Variance: one tool with three modes
- Tip Calculator: split-bill, country presets
- Discount Calculator: sequential discounts, BOGO
- 30 pre-filled pages
- New `/categories/math-calculators` hub

### PR 7 — Inflation + VAT/GST upgrades + categories

- Inflation Calculator: 1950→2026 historical data, country presets
- VAT/GST Calculator: reverse mode, reduced rates
- New `/categories/electrical-calculators` hub
- New `/categories/lighting-calculators` hub
- Cross-linking retrofit on the top 30 existing tool pages (add a "Popular conversions" / "Common questions" block)

## 11. Architecture constraints (per AGENTS.md)

All PRs honor these rules:

- **Browser-first** — no user data leaves the browser
- **Server-rendered first** — every new page is SSG
- **Privacy-first** — no analytics on landing-page content
- **JSON-LD correctness** — every script body goes through `jsonLdScriptBody()` (escapes `<`)
- **Trust badges** — every new tool page gets `ShieldCheck` / `EyeOff` / `Lock` / `Activity` at the top
- **Accessibility** — every interactive element is keyboard-navigable, every icon has `aria-hidden`, every kbd chip is `aria-hidden` per AGENTS.md
- **No placeholder functionality** — every calculator is fully functional, no "Coming Soon"
- **No x86-only binaries** — BMI / Age / Date are all browser-only, no WASM
- **Edge / ARM compatible** — pure SSG, no server-side state
- **Bundle budget** — pre-existing 5.01MB overshoot is documented; new code should not make it worse

## 12. Post-build: Phase 5 — Inbound + monitoring (ongoing, after the 7 PRs)

- Set up **Search Console** queries report review (weekly): identify queries where we rank 8-20 → add landing pages
- **Embed widget** accumulations: 100+ embeds/month by month 6 → ~50 new backlinks/month
- **Hacker News + Reddit + Dev.to launches** for each new tool
- **Webmaster outreach** to sites linking to RapidTables but not us
- **Quarterly content audit**: which landing pages have impressions but no clicks? → rewrite titles/descriptions
- **Quarterly coverage audit**: which high-volume queries are still unanswered? → next PR cycle

## 13. Realistic traffic curve (conservative)

| Month | Indexed URLs | Est. monthly visitors | Milestone |
|---|---|---|---|
| 0 (now) | ~230 | unknown (under 10K likely) | Foundation |
| +3 | ~590 | 5K - 15K | Phase 1 + 2 partial |
| +6 | ~720 | 15K - 40K | Phase 2 + 3 |
| +9 | ~830 | 40K - 80K | Phase 4 |
| +12 | ~830 | 800K - 1.2M | **1M hit** |
| +18 | ~1,000+ | 1.5M - 3M | Phase 5 momentum |

## 14. The 5 things we will NOT do

- ❌ User account system (privacy-first is our edge)
- ❌ Server-rendered calculator farm (we're browser-first)
- ❌ Redesign the home page
- ❌ More dev-tool categories until we have 50+ calculators
- ❌ Buy backlinks (earn them)

## 15. Open follow-ups (after the 7 PRs)

- **Phase 3** — content depth on existing tool pages (200-300 word "what is X" blocks)
- **Phase 4** — additional category hubs beyond the 7-PR list
- **Backlink outreach tooling** (manual for now)
- **Search Console queries dashboard** (auto-detect ranking opportunities)
- **Internationalization** — RapidTables has no real i18n; if we add German / Spanish / French / Japanese / Hindi versions of the landing pages, that's a 5-10× traffic multiplier

---

*Last updated: 2026-09-02. This document is the source of truth for the rapidtables-alternative strategy. All 7 PRs reference it.*
