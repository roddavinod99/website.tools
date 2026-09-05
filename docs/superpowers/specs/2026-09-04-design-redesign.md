# Design Redesign Spec — DevStackIO Tools

- **Date:** 2026-09-04 (originally); reconstructed 2026-09-05
- **Scope:** Site-wide CSS and visual design system
- **Aesthetic direction:** A — Crisp Modern Minimal
- **Plan:** `docs/superpowers/plans/2026-09-04-design-redesign.md`
- **Status:** Shipped in v1.14.0

> **Reconstruction note:** The original spec was written during brainstorming and was lost during a workspace state issue. The plan (reconstructed 2026-09-05) is the authoritative execution reference. This spec is a concise design-document companion that captures the *why* and *what* at a high level; the plan captures the *how*.

## 1. Background and Goals

DevStackIO Tools shipped with a GitHub-Primer-flavored design system. After growing to 230+ tools, the aesthetic no longer expressed the brand: every page looked like a generic open-source project, the logo was text-only, and the chrome had accumulated patterns inconsistent with a privacy-first developer tool.

**Goals** (confirmed during brainstorming):

1. **Modernize the look** beyond the GitHub-Primer aesthetic while preserving privacy-first, content-first, and developer-tool tone.
2. **Strengthen brand identity** with a distinct accent, a real typeface, and a standalone logomark.
3. **Improve usability** without sacrificing content density on tool pages.
4. **Keep both light and dark themes**, hand-tuned.
5. **Preserve Lighthouse ≥ 90 and WCAG 2.2 AA.**

## 2. Aesthetic — Crisp Modern Minimal

Pure near-monochrome surface, one electric accent, sharp geometry, **borders over shadows**, 6–8 px radii, geometric sans (Geist), minimal motion (≤200 ms). Reads as Vercel / Tailwind UI.

**Locked decisions:**

| Choice | Value |
|---|---|
| Aesthetic direction | Crisp Modern Minimal |
| Accent | Electric Blue (single hue, light + dark variants) |
| Typography | Geist Sans + Geist Mono via `next/font` |
| Logomark | Geometric monogram (D\|I) |
| Brand asset scope | Redesign logo + add standalone logomark |
| Dark mode | Hand-tuned light + dark (both shipped) |
| Hard constraints | Lighthouse ≥ 90, WCAG 2.2 AA |

## 3. Design Tokens

### 3.1 Color system — 4-axis Crisp Minimal palette

| Token | Light | Dark |
|---|---|---|
| `--color-bg` | `#FFFFFF` | `#0A0A0A` |
| `--color-surface` | `#FAFAFA` | `#141414` |
| `--color-surface-2` | `#F4F4F5` | `#1C1C1F` |
| `--color-border` | `#E4E4E7` | `#27272A` |
| `--color-border-strong` | `#D4D4D8` | `#3F3F46` |
| `--color-text` | `#0A0A0A` | `#FAFAFA` |
| `--color-text-muted` | `#52525B` | `#A1A1AA` |
| `--color-text-subtle` | `#A1A1AA` | `#52525B` |
| `--color-accent` | `#0070F3` | `#3B82F6` |
| `--color-accent-hover` | `#0058CC` | `#60A5FA` |
| `--color-accent-fg` | `#FFFFFF` | `#FFFFFF` |
| `--color-accent-soft` | `#E6F1FE` | `#0C2A4D` |
| `--color-success` | `#16A34A` | `#22C55E` |
| `--color-warning` | `#D97706` | `#F59E0B` |
| `--color-danger` | `#DC2626` | `#EF4444` |

Replaces the previous 5+ axis Primer-clone. **Backwards-compat aliases** for the 230+ tool components' legacy CSS variable names are declared in both `:root` and `.dark` so the components did not have to change.

### 3.2 Typography

- **Geist Sans** (variable font, display + body) and **Geist Mono** (variable font, code + numeric) loaded via `next/font/google`.
- Exposed as `--font-geist-sans` and `--font-geist-mono` CSS variables. `globals.css` `--font-sans` and `--font-mono` reassigned to these (with a system fallback for builds before Task 3 lands).
- Type scale: 12 px → 128 px (xs → 9xl). Line heights tightened to 1.15 / 1.3 / 1.5 / 1.6.
- `font-feature-settings: "tnum" 1` on numeric displays.

### 3.3 Geometry and elevation

- **Radii:** collapsed 8 tiers → 4. `--radius-sm: 4px`, `--radius-md: 6px`, `--radius-lg: 8px`, `--radius-full: 9999px`. No 12px+ radii.
- **Shadows:** lightened ~40%. Borders are the primary depth cue. Shadows reserved for popovers, modals, dropdowns.
- **Borders:** `1px solid var(--color-border)` on most surfaces. Hover changes border-color, not transform.

### 3.4 Motion

- Durations: keep `--transition-fast: 150ms`, `--transition-normal: 200ms`. **Remove** `--transition-slow`, `--transition-slower`, `--ease-spring`.
- `card-interactive` no longer `translateY` on hover. Pure border-color shift.

## 4. Brand and logomark

- **Wordmark:** "DevStackIO" + "Tools" badge. Light and dark variants.
- **Logomark:** standalone D\|I monogram. Used in header, footer, favicon, social card, app icon.
- **Favicon:** logomark on `#0070F3` rounded-square tile. SVG, replaces the old generic favicon.
- **Old PNGs preserved** as email fallback.

## 5. Component System

- **UI primitives** (`Button`, `Card`, `Badge`, `Tabs`, `Tooltip`, `ToolCard`, `ToolHeader`, `ToolGridSection`, `TryExamples`, `AdvancedOptions`, `OptionPanel`, `Input`): restyled in place. **Public API preserved.** New `Button` `subtle` variant added.
- **Layout chrome** (Header, Footer, SearchOverlay, ShortcutsModal): sticky blurred header, logomark+wordmark+badge composition, surface-2 footer, surface modals.
- **Tool page chrome** (`tool-client.tsx`): trust badges moved to right column on `lg+`, sections wrapped in surface-2 cards, ghost action bar, new `<ToolCard>` grid.
- **Home:** tight typographic hero with accent underline, eyebrow + display heading + CTA + grid section pattern.
- **Listing pages:** filter bar (surface-2 card), tool grid (`mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3`), no pagination controls (static grids).
- **Static / legal / content pages:** wrap in `<article className="prose">`; new `prose` rules auto-style h1 (2px accent border-bottom), table styles, etc.
- **Ad system:** `min-height` reservation preserved byte-identical; only the dev-mode placeholder chrome restyled.

## 6. Dark Mode

- Class strategy (`.dark` on `<html>`). `public/theme-init.js` and `ThemeProvider` unchanged.
- Hand-tuned palettes, not auto-inverted.
- Accent in dark is brighter (`#3B82F6`) for same perceived contrast. Hover `#60A5FA`. Accent-soft in dark is deep navy (`#0C2A4D`), not bright.
- Focus ring uses `--color-accent-hover` + 35% alpha in dark, `--color-accent` + 30% in light.
- Both modes tested in CI snapshots (18 PNGs at `tests/snapshots/redesign/`).

## 7. Accessibility (WCAG 2.2 AA)

- Body text contrast ≥ 4.5:1 (target 7:1). UI components ≥ 3:1. Accent on background tested for both modes.
- Focus visible (`--shadow-focus` ring on every interactive).
- `prefers-reduced-motion` respected.
- Touch targets ≥ 44 px.
- Skip link preserved.
- Tool capability badges include icon + text, never color alone.
- Decorative kbd / pipe separators marked `aria-hidden="true"`.

## 8. Performance (Lighthouse ≥ 90)

- No new dependencies. Tailwind v4 + `next/font` only.
- Bundle size: 5,384,185 bytes (5.13 MB) post-redesign vs 5,382,459 bytes (5.13 MB) pre-redesign — **+1,726 bytes / +0.03%**.
- Geist fonts preloaded with `display: swap`. No font-driven CLS.
- AdContainer `min-height` reservation preserves CLS guarantee.
- 905 static pages pre-rendered (SSG). CSP max length 2837 bytes (safe < 8 KB).

## 9. Testing

| Layer | Tool | Status |
|---|---|---|
| Unit | `npm run test:unit` | 395/395 + 1 pre-existing bundle-size failure (out of scope) |
| Tool fixtures | `npm run test:tools` | 120/120 |
| A11y | `npm run test:a11y` | 0 critical/serious violations on 23 URLs |
| Visual snapshots | `tests/visual/redesign.spec.ts` | 18/18 redesigned pages match |
| JSON-LD | `npm run test:seo` | Organization schema with `@id: .../#organization` preserved |

## 10. Rollback

- `git revert` of the v1.14.0 release restores the prior design in one operation.
- Old token names kept as aliases in the new `globals.css`, so reverting the layout chrome + primitives still produces a working site even mid-migration.

## 11. Out of Scope

- New tools, new pages, new features.
- Copy / content rewrites (FAQ, guides, blog).
- Backend / API / data model changes.
- New analytics or ads.
- Logo redesign for the **main** DevStackIO brand site (out of repo).
- Internationalization (RTL, Arabic font).

## 12. Decisions Log

See `docs/superpowers/plans/2026-09-04-design-redesign.md` § 12 for the full decisions log.
