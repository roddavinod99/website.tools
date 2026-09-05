# Design Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace DevStackIO Tools' GitHub-Primer visual design with a Crisp Modern Minimal system: monochrome surface, Electric Blue accent, Geist typography, geometric (D|I) logomark, hand-tuned light + dark themes — without changing any tool behavior or breaking Lighthouse ≥ 90 / WCAG 2.2 AA.

**Architecture:** Token-first refactor. `src/styles/globals.css` becomes the single source of truth — a 4-axis color system (bg/surface/text/accent) replaces the current 5+ axis Primer-clone. Old token names are kept as aliases so the 230+ tool components don't need to change. UI primitives in `src/components/ui/*` get restyled in place; their public API is preserved. Layout chrome, home, listing, static, and tool-client get restyled. Geist loads via `next/font` in `src/app/layout.tsx`. Brand assets regenerate as SVG.

**Tech Stack:** Next.js (App Router), TypeScript, Tailwind v4 (`@theme inline`, `@layer`, `@utility`), `next/font/google`, `clsx`, `lucide-react`, Playwright, Vitest. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-09-04-design-redesign.md`

**Per-task briefs, implementer reports, and review packages:** `.superpowers/sdd/2026-09-04-design-redesign/` (35 files: `task-N-brief.md`, `task-N-report.md`, `review-*` diffs, `progress.md` ledger).

## Global Constraints

These are spec-wide rules. Every task's requirements implicitly include this section.

- **Aesthetic:** Crisp Modern Minimal (borders > shadows, 6–8px radii, ≤200ms motion, monochrome surface, single Electric Blue accent).
- **Accent:** `#0070F3` (light) / `#3B82F6` (dark) / `#0058CC` hover light / `#60A5FA` hover dark / `#E6F1FE` accent-soft light / `#0C2A4D` accent-soft dark.
- **Typography:** Geist Sans + Geist Mono via `next/font/google`. `--font-sans` and `--font-mono` in `globals.css` reassigned to point at the font variables (with a system fallback so builds resolve before Task 3 lands).
- **Public API of `src/components/ui/*` primitives is preserved** — props, types, exports, file names unchanged.
- **No new dependencies.**
- **Backwards-compat aliases:** the 230+ tool components consume legacy CSS variable names. Every legacy name from `src/styles/globals.css:367-593` is re-declared in BOTH `:root` and `.dark` pointing at new tokens. The Tailwind theme keys (`brand-*`, `neutral-*`, `surface-*`, `dark-*`, `success-*`..`info-*`, `product-*`, `tool-*`, `result-*`) remain in `@theme inline`. **Plan-additive aliases (per Task 2 ruling):** `--brand`, `--color-primary`, `--result-error`, `--result-success`, `--tool-bg`, `--tool-border`, `--tool-surface`, `--tool-card-shadow`.
- **Lighthouse:** Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95. Bundle budget unchanged (5 MB; pre-existing 5.13 MB failure is out of scope per AGENTS.md).
- **WCAG 2.2 AA:** body text contrast ≥ 4.5:1, UI components ≥ 3:1, focus visible, reduced motion respected, touch targets ≥ 44px, skip link preserved.
- **Ad containers:** `min-height` reservation must not change.
- **Theme strategy:** class-based (`.dark` on `<html>`). `public/theme-init.js` and `src/components/theme/theme-provider.tsx` unchanged.
- **No JSON-LD / metadata template changes.**
- **Logo assets:** new vector files replace the current PNGs; PNGs kept as email fallback.

---

## File Structure (locked before tasks)

The plan covers 15 tasks touching ~70 files. The per-task briefs in `.superpowers/sdd/2026-09-04-design-redesign/` list the exact files for each task. High-level breakdown:

### Created
- `public/logo-light.svg`, `public/logo-dark.svg`, `public/logomark.svg`, `public/favicon.svg`, `public/og.svg` (Task 4)
- `src/components/ui/logomark.tsx` (Task 5)
- `tests/visual/redesign.spec.ts` (Task 12)
- `docs/superpowers/specs/2026-09-04-design-redesign.md` (this spec, reconstructed)
- `docs/superpowers/plans/2026-09-04-design-redesign.md` (this plan, reconstructed)

### Modified
- `src/styles/globals.css` (Task 2)
- `src/app/layout.tsx` (Task 3)
- `src/components/ui/{button,card,badge,tabs,tooltip,tool-card,tool-header,tool-grid-section,try-examples,advanced-options,option-panel,input}.tsx` (Task 5)
- `src/components/layout/{header,footer,search-overlay,shortcuts-modal}.tsx` (Task 6)
- `src/components/home/*.tsx` (15 files) (Task 7)
- `src/app/{tools,categories,popular,new,search,convert,toolkits}/**` listing pages (Task 8)
- `src/app/tools/[slug]/tool-client.tsx` (Task 9)
- `src/app/{about,privacy,cookie-policy,dpa,terms,disclaimer,acceptable-use,dmca,security,accessibility,blog,guides,workflows,tutorials,best-practices,changelog,roadmap,contact,support,feedback,feature-request,report-bug,suggest,status,api,compare,sitemap}/**` (32 files) (Task 10)
- `src/components/ads/{ad-container,adsense-script}.tsx` (Task 11)

### Untouched (verify only)
- 230+ tool components in `src/components/tools/**`
- `public/theme-init.js` (logic unchanged)
- `src/components/theme/theme-provider.tsx` (logic unchanged)
- `src/components/ads/index.tsx`, `src/lib/data/ads.ts`
- All `src/lib/**` business logic
- All API routes
- All JSON-LD generators
- `src/lib/seo/__generated__/tool-lastmod.ts` (gitignored, generated)

---

## Task Summary (15 tasks)

The per-task briefs and reports are in `.superpowers/sdd/2026-09-04-design-redesign/`. This summary is the controller's signpost for execution.

| # | Task | Commit | Status |
|---|---|---|---|
| 1 | Baseline current build & snapshots | (no commit; tag `pre-redesign-baseline`) | DONE |
| 2 | Rewrite `src/styles/globals.css` (token system) | `79fa11c` | DONE |
| 3 | Wire Geist fonts in `src/app/layout.tsx` | `dbbb6ac` | DONE |
| 4 | Generate brand assets (logos, logomark, favicon, og) | `fdd146f` | DONE |
| 5 | Restyle UI primitives in `src/components/ui/*` | `7813cbc` | DONE |
| 6 | Restyle layout chrome (header, footer, search, shortcuts) | `fb34443` | DONE |
| 7 | Restyle home page (`src/app/page.tsx` + `src/components/home/*`) | `5d00427` | DONE |
| 8 | Restyle listing & search pages | `e0422e5` | DONE |
| 9 | Restyle tool page chrome (`tool-client.tsx`) | `8ab8d79` | DONE |
| 10 | Restyle static / legal / content pages (batched) | `d6f7f3c` + `4c7f483` (fix) | DONE |
| 11 | Ad system visual alignment (no behavior change) | `43c3169` | DONE |
| 12 | Visual regression snapshots | `123d773` | DONE |
| 13 | Full test pass and bundle budget re-baseline | (in progress) | IN PROGRESS |
| 14 | Lighthouse + manual pre-merge checklist | (pending) | PENDING |
| 15 | Version bump, changelog, and final commit | (pending) | PENDING |

Each completed task (1–12) has a `task-N-brief.md` (the requirements) and a `task-N-report.md` (the implementer's report) in `.superpowers/sdd/2026-09-04-design-redesign/`, plus a `review-*` diff package reviewed by an independent task reviewer. The ledger in `progress.md` records every completion, every deviation, and every ruling.

## Task 13: Full test pass and bundle budget re-baseline

**Files:** none (verification only)
**Goal:** Confirm the redesign did not regress any test or break the bundle budget.
**See:** `.superpowers/sdd/2026-09-04-design-redesign/task-13-brief.md`

Steps (see brief for verbatim commands):
1. `npm run test:unit` — expect 395/395 + 1 pre-existing bundle-size failure.
2. `npm run test:tools` — expect 120/120.
3. `npm run test:a11y` — expect clean.
4. `npm run test:snapshots` — expect baseline match against `tests/snapshots/redesign/`.
5. `npm run build` — expect green. Report bundle size. If bundle has grown > 50 KB beyond pre-existing 5.13 MB, **stop and report**.

## Task 14: Lighthouse + manual pre-merge checklist

**Files:** none (verification only)
**See:** `.superpowers/sdd/2026-09-04-design-redesign/task-14-brief.md`

Lighthouse on `/` and `/tools/json-formatter` (desktop + mobile). Targets: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95. Manual brand asset check (favicon, og, logomark, light + dark wordmarks). Manual a11y check (tab through, NVDA, `prefers-reduced-motion`). Manual mobile check (375 px viewport). If any checklist item fails, file a follow-up; do not merge with checklist failures.

## Task 15: Version bump, changelog, and final commit

**Files:** `package.json`, `CHANGELOG.md`, `data/build-number.json`, `data/release.json`, `data/releases/`
**See:** `.superpowers/sdd/2026-09-04-design-redesign/task-15-brief.md`

1. `npm run version:auto -- --dry-run --verbose` — review.
2. `npm run version:auto` — apply.
3. Stage and commit as `release: vX.Y.Z`.
4. **Do not push** — per AGENTS.md, the commit exists locally for the user to push.

---

## Self-Review (reconstruction)

**1. Spec coverage:** every spec section is implemented in the per-task briefs and reflected in the 12 completed commits. See spec section 13 "Implementation History" for the commit-by-commit map.

**2. Placeholder scan:** none. All "TBD"/"TODO" references in the original spec were resolved before writing the plan.

**3. Type consistency:** every cross-task interface (e.g., `<Logomark size>`, `<Button variant>`, `Button.subtle` variant, `Card` variants, `nav` element) is defined in one task and consumed in another without drift.

**4. Scope check:** the plan touches only the file families listed above. No new tools, no new pages, no copy changes, no backend changes, no new dependencies.

---

**Plan reconstructed and saved to `docs/superpowers/plans/2026-09-04-design-redesign.md`.** The per-task briefs and reports are in `.superpowers/sdd/2026-09-04-design-redesign/`.
