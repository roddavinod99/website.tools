# DevStackIO Tools — Platform Overhaul Design Spec

- **Date:** 2026-09-05
- **Status:** Awaiting user review
- **Author:** Brainstorming session
- **Companion brief:** `designplan.md` (26 sections)
- **Prior shipped spec:** `docs/superpowers/specs/2026-09-04-design-redesign.md` (v1.14.0 "Crisp Modern Minimal") — this spec is **additive** to that. Tokens, fonts, logomark, dark mode, focus rings, and the `prose` rules from that spec are kept verbatim. Nothing in this spec downgrades the v1.14.0 design system; it adds an "overlay" of layout, IA, and tool-page architecture on top.

> **Reconstruction note:** The brainstorming transcript for this session is captured in this single spec; the per-section questions and approvals are reflected inline. See "Decisions log" at the bottom.

---

## 0. Executive summary

DevStackIO Tools is a privacy-first developer utility platform with 172 tools (registry), 21 implemented tool components, 172 content JSONs, and a v1.14.0 "Crisp Modern Minimal" design system that the user has judged insufficient for the goal of 1M+ monthly visitors and RapidTables-class usability.

This spec defines the **next** layer of the platform: a "Working Utilities Library" overlay that combines the existing Crisp Minimal tokens with a calmer, denser, more search-first UX. It does not change colors, fonts, or the existing component primitives' public APIs. It reorganizes layout, IA, and tool-page architecture, adds Preline UI for missing primitives (modal, dropdown, select, tabs, accordion, tooltip, popover, datepicker, stepper, toggle/switch, range, file upload, sort, pagination, alert, mega-menu), and introduces a per-tool audit methodology that makes "examples must actually work" a CI gate, not a manual QA step.

The target is the designplan's Definition of Done (§24): a website a first-time visitor can understand in 3–5 seconds and a returning user can drive in <30s via ⌘K.

**Not in scope (this spec):** implementation sequencing (P0–P4 from designplan §23). Sequencing is the writing-plans skill's job. This spec locks the **end state**.

---

## 1. Design system foundation (additive to v1.14.0)

### 1.1 Type scale (overlay on existing tokens)

The v1.14.0 spec ships `12 → 128 px` (xs → 9xl). This spec narrows the *practical* scale to six steps for content UI. Components may still use the full Tailwind scale for one-off needs, but the design system documents these six as the canonical roles.

| Token | Size / line | Role | Notes |
|---|---|---|---|
| `--text-xs` | 12 / 16 | Captions, metadata, kbd shortcuts, ad labels | |
| `--text-sm` | 14 / 20 | Labels, table cells, nav items, dense UI, sub-text | |
| `--text-base` | 16 / 24 | Body, inputs, tool output prose, FAQ answers | **Floor on mobile** (prevents iOS zoom) |
| `--text-lg` | 20 / 28 | H3, large body, sub-headers, tool page H1 sub | |
| `--text-2xl` | 28 / 32 | H2, tool card titles, page section H2s | |
| `--text-4xl` | 40 / 48 | Homepage H1, tool page H1, page H1 | Max 2 per page |

**No `--text-3xl` or `--text-5xl+` for content UI.** Step from `2xl → 4xl` is intentional; the existing v1.14.0 9xl scale is reserved for hero accent treatments only.

**Families:** Geist Sans (UI, body), Geist Mono (output, code, monospaced numbers, copy affordance, ⌘K query).

**Weights:** 400 body, 500 UI controls + nav, 600 h2/h3 + emphasis, 700 h1. No 300 or 800.

**Tracking:** `--tracking-tight` (-0.01em) on h1/h2. Default elsewhere.

**Tabular numerals:** `font-feature-settings: "tnum" 1` on numeric displays (char counts, popularity, EMI, conversions, pagination counts). This is a v1.14.0 rule; carry forward.

### 1.2 Spacing scale (4-pt base)

`--space-0` 0, `--space-1` 4, `--space-2` 8, `--space-3` 12, `--space-4` 16, `--space-5` 20, `--space-6` 24, `--space-8` 32, `--space-10` 40, `--space-12` 48, `--space-16` 64, `--space-20` 80, `--space-24` 96.

**Layout grid:** 12-col, 1280px max content width, 32px gutter desktop, 16px tablet, 16px mobile.

**Vertical rhythm:** page sections 64px desktop, 48px mobile. Tool page sections 32px. Ad slots 64px above and below.

### 1.3 Color, elevation, surface (carry forward + additions)

**Keep verbatim from v1.14.0:**
- All 4-axis Crisp Minimal palette tokens (bg, surface, surface-2, border, border-strong, text, text-muted, text-subtle, accent, accent-hover, accent-fg, accent-soft, success, warning, danger) in both light and dark.
- Class-strategy dark mode (`.dark` on `<html>`), `public/theme-init.js` and `ThemeProvider` unchanged.
- Accent focus ring: `--color-accent-hover` 35% alpha in dark, `--color-accent` 30% in light.
- Hand-tuned palettes, not auto-inverted.

**Additions:**

| Token | Light | Dark | Use |
|---|---|---|---|
| `--color-link` | `#1D4ED8` | `#93C5FD` | Inline links (distinct from accent) |
| `--color-surface-3` | `#FFFFFF` | `#0A0A0A` | Modal / popover background |
| `--color-border-subtle` | `#F4F4F5` | `#1C1C1F` | Default 1px dividers |
| `--shadow-overlay` | `0 10px 25px -5px rgb(0 0 0 / 0.10), 0 8px 10px -6px rgb(0 0 0 / 0.05)` | `0 10px 25px -5px rgb(0 0 0 / 0.50), 0 8px 10px -6px rgb(0 0 0 / 0.30)` | Modals, popovers, command palette |

**Shadows:** only `--shadow-overlay` for modals/popovers. **No card shadows, no button shadows.** Elevation comes from surface tints and 1px borders.

**Borders:** 1px default, 1.5px on focus or strong emphasis. Never both a border AND a shadow on the same element.

**Radius cap:** existing v1.14.0 ships 4 / 6 / 8 / 9999px. This spec caps **content UI** at 6px. The 8px tier is reserved for image cards (none today) and the 9999px tier is for pills/badges only.

### 1.4 Motion (carry forward + tighten)

| Token | Duration | Easing | Use |
|---|---|---|---|
| `--motion-instant` | 0ms | — | State toggles (default) |
| `--motion-fast` | 150ms (v1.14.0) | `ease-out` | Hover, focus rings |
| `--motion-base` | 200ms (v1.14.0) | `ease-out` | Modals, dropdowns, tooltips, tabs |
| ~~`--motion-slow`~~ | — | — | **Removed** (per v1.14.0) |

`prefers-reduced-motion: reduce` collapses all to 0ms. No parallax, no scroll-jacking, no animation on tool output appearing (instant is correct — user is waiting).

### 1.5 What this spec keeps vs replaces (per-area salvage decision)

**Keep verbatim from v1.14.0:**
- All 4-axis palette tokens
- Geist Sans + Geist Mono via `next/font`
- Dark/light theming
- Class strategy + theme-init script
- 4-tier radius (4 / 6 / 8 / 9999), capped at 6px for content UI
- `--shadow-focus` for focus rings
- `prose` rules and `data-testid` conventions
- AGENTS.md file-upload protections, 10MB cap, magic-number validation
- Tool capability badges (icon + text, never color alone)
- Decorative `aria-hidden="true"` on kbd/pipe separators

**Constrain via overrides (replace defaults):**
- v1.14.0 components may use `rounded-md` (6px) freely; this spec **prohibits** rounded-lg on cards, inputs, buttons used in content UI. Enforce via a new lint rule.
- v1.14.0 may use shadows on `card-interactive`; this spec **removes** any `box-shadow` on tool cards (border-only).
- Per-component ad-hoc colors are replaced with the token list above. Enforce via an existing eslint rule (no `bg-white`, `bg-gray-*`, `text-black`, `dark:bg-*` outside `src/styles/globals.css`).

**Replace (the per-area decision):**
- Tool page chrome (Section 4) — replace the current `tool-client.tsx` arrangement. Trust badges move from "right column on lg+" to a single text row below the H1. The surface-2 wrapping cards around content sections are removed; content flows directly on the page surface.
- Homepage hero — replace. Currently a "eyebrow + display heading + CTA + grid" pattern per v1.14.0; this spec goes simpler: H1 value prop + 640px search + 8 trending chips + trust line above the fold (Section 3).
- Header — replace the current sticky-blurred header per Section 2.2.
- Listing filter bar — replace per Section 5.2 (2+8+2 with sticky filter rail, not a single card).
- Search UI — replace the current `SearchOverlay` + `ShortcutsModal` with a single command palette (⌘K) and a quick-filter hero search (Section 6).

**Stay as-is:**
- Tooltip, button, badge, input, tabs primitives (kept under the v1.14.0 API). Preline takes over for components that didn't exist (modal, dropdown, accordion, etc.).
- The 21 implemented tool components stay where they are during the spec phase. Per-tool migration is the audit's job (Section 14).

---

## 2. Information architecture + navigation

### 2.1 URL structure (formalize what's already in place)

```
/                              Homepage
/tools                         All tools, paginated, filterable
/tools/[slug]                  Tool detail
/categories                    All categories
/categories/[slug]             Category detail
/popular                       Top-N most-visited tools
/new                           Recently added
/guides                        All learning content
/guides/[slug]                 Guide detail
/blog                          Blog index
/blog/[slug]                   Blog post
/compare/[a]-vs-[b]            A vs B comparison
/convert/[from]-to-[to]        Direct unit conversion (existing)
/search?q=...                  Search results (no-JS fallback)
/api/...                       Server routes
```

**Canonical rule:** one canonical slug per tool, served at `/tools/[slug]`. `aliasSlugs` (existing) `redirect()` (301) to canonical. No trailing slashes, lowercase only, hyphens not underscores. Compare page canonical is alphabetical: `/compare/json-vs-xml`, not `/compare/xml-vs-json`. Reverse `redirect()`s.

### 2.2 Top nav (header)

```
┌──────────────────────────────────────────────────────────────────────┐
│  [logo]   Tools  Categories▾  Guides  Blog        [⌘K Search]  ☾ ▾  │
└──────────────────────────────────────────────────────────────────────┘
```

- Logo (left, wordmark + logomark, already shipped in v1.14.0).
- Primary links (left of center): `Tools`, `Categories` (mega-menu), `Guides`, `Blog`. Mega-menu is the only dropdown.
- Search trigger (right): Preline combobox showing "Search 172 tools…   ⌘K". Clicking or pressing ⌘K opens the command palette (Section 6). On mobile, collapses to a magnifier icon that opens the palette as a full-screen sheet.
- Theme toggle (right): light / dark / system, Preline dropdown.
- No "Home" link — logo is home. No social icons in the header (footer only).
- **Sticky on scroll** with 1px bottom border (`--color-border-subtle`) that appears after scrolling 64px. No background-color change on scroll.
- **Header height: 64px on all viewports.**

### 2.3 Mobile nav

Hamburger → full-screen overlay sheet (Preline `data-hs-overlay`):
- Top: search input (mobile-specific; opens the palette)
- Below: Tools, Categories (accordion), Guides, Blog, Theme toggle
- Bottom: footer link row (About, Privacy, Contact, etc.)

**Touch targets:** 48px min for nav items.

### 2.4 Breadcrumbs

- On every page except homepage. Pattern: `Home / Section / Subsection / Page`.
- Implementation: new `src/components/ui/breadcrumb.tsx`. `<nav aria-label="Breadcrumb"><ol>` with `<a>` links. Schema.org `BreadcrumbList` JSON-LD stays where it is (already correct per AGENTS.md).
- Style: `--text-sm`, separated by `/` glyph, last item is current page (no link, `aria-current="page"`).
- **No background, no border, no card.** Inline at the top of the page content area, 24px above the H1.

### 2.5 Footer

Three columns desktop, stacked mobile. Row 1: brand + 1-line value prop + social. Row 2: Product (Tools, Categories, Popular, New), Resources (Guides, Blog, Compare, Status), Company (About, Privacy, Contact, DPA). Row 3: small text (©, license, theme toggle, lang if any). `border-top: 1px --color-border-subtle`. **No dark/light contrast toggle within the footer** — inherits page surface.

### 2.6 Category mega-menu (Preline dropdown)

Trigger: hover (desktop) / tap (mobile). 640px-wide panel anchored under "Categories". 4-col, 2-row max (8 categories per page of the menu). Each category: name, count, 1-line description. Categories with 30+ tools get a small "popular" tag. Outside-click and Esc close it. Keyboard: Tab cycles, Enter activates, Esc closes, focus returns to trigger on close. If total categories exceed 8, the menu shows a "View all categories →" link at the bottom leading to `/categories`.

### 2.7 Recently used (returning users)

Small "Recently used" row appears in the command palette (Section 6) when the user opens it, sourced from `localStorage` (last 8 distinct tool slugs). **No "Recently used" rail on the homepage** — homepage stays focused on discoverability for new visitors; returning users reach the palette with ⌘K in 1 keystroke.

### 2.8 Sitemap / discoverability

- Auto-generated `sitemap.xml` (existing) enumerates: every tool page, every category page, every guide, every blog post, every comparison. `lastmod` from git commit or content hash (NOT generation date). Submit via IndexNow on content change per AGENTS.md.
- `llms.txt`, `humans.txt`, `security.txt`, `manifest.webmanifest` all required by AGENTS.md — verify presence and format, no redesign.
- `robots.txt`: allow all tool/category/guide/blog, disallow `/api/*`, `/private/*`, `/admin/*`, `/contact/success`. Reference sitemap. **Remove** any `Crawl-delay: 10` (Google ignores it per RFC 9309).

---

## 3. Homepage architecture + wireframe

Goal: visitor lands, understands in 3–5 seconds, finds a tool in ≤ 2 clicks.

### 3.1 Above the fold (one viewport, ~800px tall)

```
┌──────────────────────────────────────────────────────────────────────┐
│  [Header — 64px, see 2.2]                                            │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│                                                                       │
│           Free Online Developer Tools. No Signup.                    │  ← H1, 40/48, max 1
│           172 utilities. All client-side. All private.               │  ← Sub, 20/28, --color-text-muted
│                                                                       │
│      ┌──────────────────────────────────────────┐  ⌘K              │  ← Search, 640px, h=56
│      │  🔍  Search 172 tools…                   │                  │
│      └──────────────────────────────────────────┘                  │
│      [JSON] [UUID] [Base64] [QR] [Password] [Hash] [URL] [Color]  →  ← Trending chips, 8 max
│                                                                       │
│  100% Client-Side · Your Data Stays Local · No Account Required     │  ← Trust line, 14/20
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

- H1 is the value proposition, not the brand. ("Free Online Developer Tools" beats "Welcome to DevStackIO Tools.")
- Search bar is the **primary action**. 640px wide, 56px tall, focus ring on `:focus-visible`. Placeholder: "Search 172 tools…" (the count is **registry-driven** via `allTools.length`, never hard-coded; the copy is a placeholder for the wireframe).
- Sub line: "172 utilities. All client-side. All private." — the number is also registry-driven.
- Below search: **8 trending chips** (top 8 by `popularity` from registry, falling back to most-visited-by-analytics when available). Tap = deep-link to the tool. **Not** a card carousel — a single row of text links with subtle hover underline.
- Trust line: small text, single row, no icons (or icons-as-glyphs only, `aria-hidden`). Centered.

**Above the fold = 1 H1 + 1 sub + 1 search + 8 chips + 1 trust line.** No hero illustration, no mascot, no gradient. "Calm, intentional."

### 3.2 Below the fold (ordered for new visitors)

Each section has a 64px top margin, single H2 (28/32), optional 1-line sub-text, content, optional "View all →" link top-right.

| # | Section | Purpose | Content | New visitor answers |
|---|---|---|---|---|
| 1 | **Popular tools** | Fastest path to value | 12 tool cards (3×4 desktop, 2×6 tablet, 1 col mobile), `popularity` desc | "What do people use here?" |
| 2 | **Categories** | Browse by intent | 8 category rows × 3 col grid (24 max), each cell = name + 1-line desc + tool count | "What kinds of tools?" |
| 3 | **Featured tools** | Highlight curated | 4 tool cards, larger variant, with 1-line taglines | "What's new/promoted?" |
| 4 | **Recently added** | Freshness signal | 8 tool cards, 4×2 desktop, by `addedAt` desc | "Is this site alive?" |
| 5 | **Useful conversions & lookups** | Direct landing for common tasks | Compact text list (not cards): 20 entries, icon + name + 1-line desc, 2-col | "I just need to convert X to Y" |
| 6 | **Learning hub** | Long-term SEO + retention | 3 latest guides (3-col) + "All guides →" | "How do I learn this?" |
| 7 | **Ad** (slot 1) | Monetization | `<AdBanner slot={adSlots.homeMid} />` between 5 and 6 | — |
| 8 | **About DevStackIO** | Trust, mission | 1 paragraph + 3 stat callouts (tools, monthly users, languages) | "Who runs this?" |
| 9 | **Ad** (slot 2) | Monetization | `<AdBanner slot={adSlots.homeBottom} />` | — |

**Maximum 2 ads on the homepage.**

### 3.3 Tool card pattern (used in sections 1, 3, 4)

```
┌──────────────────────────────────┐
│ [icon]  JSON Formatter            │  ← icon 20px, name 16/22 weight 600
│         Format and validate JSON. │  ← desc 14/20, --color-text-muted
└──────────────────────────────────┘
```

- **No image. No badge row. No "New" / "Trending" pills on cards.** Badges are reserved for the tool detail page.
- Card = 1px border (`--color-border-subtle`), 4px radius, surface-1 bg, 16px padding, no shadow. **Whole card is the link** (`<a>` wraps content, `aria-label="JSON Formatter — format and validate JSON"`).
- Hover: surface-2 bg + border-strong. No transform, no shadow change.
- Grid: CSS grid `auto-fill, minmax(260px, 1fr)`. Adapts naturally.

### 3.4 Category card pattern (section 2)

```
┌─────────────────────────────────────┐
│ Formatters                  (12)    │  ← name 16/22, count right-aligned, mono
│ JSON, XML, YAML, CSV, HTML.         │  ← desc 14/20
└─────────────────────────────────────┘
```

- Same surface treatment as tool card. Count uses Geist Mono for tabular alignment.
- Tap = `/categories/[slug]`.

### 3.5 "Useful conversions & lookups" (section 5)

A **text-dense list**, not a card grid. Per row: `Base64 Encode · Encode strings to Base64 →`. 2 columns desktop, 1 mobile. ~16px row height. Zero visual noise. This is the "I came from Google for one specific thing and now I see what else is here" surface.

### 3.6 Empty / loading / error states

- **First paint:** server-rendered. LCP target ≤ 1.8s on 4G.
- **Search loading:** debounce 120ms; show "Searching…" in palette only.
- **No results anywhere:** "Nothing here yet. Check back soon." with a link back to `/tools`.

### 3.7 SSR-first

Homepage, category pages, listing pages, tool pages: all content server-rendered. JS enhances (search palette, theme toggle, examples, copy buttons) but is never a prerequisite to read. Verified by disabling JS in Playwright and confirming content + links still work.

### 3.8 Trust badges — homepage

The hero trust line ("100% Client-Side · Your Data Stays Local · No Account Required") **replaces** the badge strip. No floating badge bars anywhere on the homepage. AGENTS.md tool-page rule ("above the tool title") is the intent-of-use rule, not a homepage rule.

---

## 4. Tool page architecture + wireframe

The tool page is the primary unit of value. 172 of them. Each must be self-explanatory, functional, and reachable in 2 scrolls on desktop, 3 on mobile.

### 4.1 Layout (9 + 3 column desktop, 1 mobile)

```
┌──────────────────────────────────────────────────────────────────────────┐
│  [Header — 64px]                                                          │
├──────────────────────────────────────────────────────────────────────────┤
│  Home / Tools / Formatters / JSON Formatter                  [↗ Share]    │  ← Breadcrumb (24px above H1)
│                                                                           │
│  # JSON Formatter                                                         │  ← H1, 40/48
│  Format, validate, and beautify JSON in your browser. Nothing is sent.   │  ← Sub, 20/28, text-muted
│                                                                           │
│  [100% Client-Side] [Your Data Stays Local] [No Account Required]        │  ← Trust pills, 14/20
│                                                                           │
├──────────────────── 24px gap ─────────────────────────────────────────────┤
│                                                                           │
│  WORKSPACE  (9 col)                                SIDEBAR  (3 col)     │
│  ─────────                                          ────────              │
│  Input (label, 14/20)                              [H3] Related tools    │
│  ┌─────────────────────────────────────────┐       · JSON Validator     │
│  │  { "hello": "world" }                   │       · JSON Minifier     │
│  │  ...                                    │       · JSON Viewer       │
│  └─────────────────────────────────────────┘       · JSON Path          │
│  [Example 1] [Example 2] [Example 3]    56 chars · 6 lines              │  ← Examples row + char count
│                                                    · YAML Formatter      │
│  [ Format ]  [ Minify ]  [ Clear ]                                      │  ← Primary action(s) + clear
│                                                    [H3] How-to           │
│  ─── 16px gap ───                                        1. Paste...      │
│                                                            2. Click...    │
│  Output (label, 14/20)                                     3. Copy        │
│  ┌─────────────────────────────────────────┐       [H3] FAQ              │
│  │  {                                       │       · Is this safe?      │
│  │    "hello": "world"                      │       · Max file size?    │
│  │  }                                       │       · JSON5 support?    │
│  └─────────────────────────────────────────┘                              │
│  [ Copy ]  [ Download .json ]  [ Reset ]   ✓ Formatted · 12ms            │  ← Result actions + status
│                                                                           │
├──────────────────────────────────────────────────────────────────────────┤
│  AD (AdBanner, slot 1, between workspace and content sections)          │
├──────────────────────────────────────────────────────────────────────────┤
│  CONTENT  (single col, 8 of 12 centered)                                │
│  ───────                                                                  │
│  About this tool                                                          │
│  [whatItDoes from content/tools/[slug].json]                              │
│                                                                           │
│  How to use  (collapsible <details>, default open)                        │
│  [instructions]                                                           │
│                                                                           │
│  Examples  (collapsible, default closed)                                 │
│  [examples]                                                               │
│                                                                           │
│  Best practices                                                           │
│  [bestPractices]                                                          │
│                                                                           │
│  Common mistakes                                                          │
│  [commonMistakes]                                                         │
│                                                                           │
│  Frequently asked questions                                               │
│  [faq]                                                                     │
│                                                                           │
│  References                                                                │
│  [references with external links]                                         │
│                                                                           │
├──────────────────────────────────────────────────────────────────────────┤
│  AD (AdBanner, slot 2)                                                    │
├──────────────────────────────────────────────────────────────────────────┤
│  RELATED TOOLS  (grid, 4 col desktop, 2 tablet, 1 mobile)                │
│  [card] [card] [card] [card]                                              │
│  [card] [card] [card] [card]                                              │
├──────────────────────────────────────────────────────────────────────────┤
│  [Footer]                                                                 │
└──────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Trust pills (below H1, not right column)

Per the designplan's "Reconsider Bad Component Placement" — the v1.14.0 spec put badges in the right column on `lg+`. This spec moves them to a single text row immediately below the H1 + sub, before the workspace. Justification: highest-intent moment without competing with the page title; keeps the workspace sidebar pair free for content.

Format: 3 small text pills in a single horizontal row, 14/20, separated by 16px. Each pill = `<icon> <text>`. No backgrounds, no borders — text only, with the icon color matching `--color-text-muted`. Hover does nothing. **No card, no border, no background.**

### 4.3 Input panel (workspace top half)

- **Label** above textarea: 14/20, `--color-text-muted`. Pattern: `Input` or `Input — paste your JSON below`. One label, never duplicated.
- **Textarea**: monospace (Geist Mono), 16px, 16/24 line-height. Min 12 rows, max 32 rows; **resizable vertically** (browser-native). No horizontal resize. No character limit displayed inside the textarea (count lives below).
- **Examples row** (Section 7 has the full contract): one-click buttons `Example 1` `Example 2` `Example 3`. Up to 5 per tool. Dispatches `devstackio:load-example` event with `{ slug, text }`. **Subscribed tools populate inputs and (if `autoRun`) trigger the primary action.**
- **Char / line count** to the right of examples, mono, 14/20, `--color-text-muted`. Live (updates as user types or pastes). Hidden on tools where it doesn't apply (e.g. calculator).
- **Action row**: primary action (`Format`, `Convert`, `Calculate`, `Generate`, `Encode`, …) on the left. **One primary, never two.** Secondary actions (Minify/Beautify, JSON5↔JSON, etc.) are Preline dropdowns attached to the primary. Clear is text-only on the right, never a button-styled element.

### 4.4 Output panel (workspace bottom half)

- **Label**: 14/20, `--color-text-muted`. Pattern: `Output`. **If the tool is purely generative (no input)**, drop the Input panel entirely and the Output panel becomes the only workspace.
- **Result region**: monospace, 16/24, **read-only by default**. Wrapped in `<pre><code data-testid="tool-output">` per AGENTS.md e2e contract. The first `<textarea>` in the tool section must remain editable — output lives in its own `<pre>` or `<output>` element, not the input.
- **Result actions** row: `Copy` (text action, `aria-live="polite"` confirmation "Copied"), `Download` (downloads as `.ext` matching the output type), `Reset` (clears output, keeps input). **Status text** to the right, mono, 14/20: `✓ Formatted · 12ms` or `⚠ 2 errors · line 3, line 7`. Inline with actions, right-aligned.
- **Errors** appear in the output panel as inline mono text with line/column context where the parser supports it. Never as a modal or toast.
- **For tools that produce an image** (QR, barcode, chart): the `<img>` is the output, with `data-testid="tool-output"` and a `Download PNG` action. No `<pre>` wrapper.

### 4.5 Sidebar (3 col, 280px desktop, hidden on mobile)

- **Related tools** (8 max, listed in text rows, not cards). Source: registry `related` field if set, else co-occurrence in `keywords` + same category, ranked by `popularity`. Tap = navigate.
- **How-to** (1-line per step, no cards). Loaded from `tool-content.howto` if present, else a 3-step generic "paste → run → copy".
- **FAQ** (collapsible, 4 questions max, first expanded). Loaded from `tool-content.faq`. "See all questions" link to the FAQ section below the workspace.
- **Sticky on scroll** within the workspace viewport (`position: sticky; top: 96px`). **Hidden on mobile** (the same content lives inline below the workspace).
- **No card wrapping the sidebar.** 1px left border (32px from workspace), content flows vertically with 24px gap between sub-sections.

### 4.6 Tool page variants (intentional non-uniformity)

Permitted variants, all sharing the same shell (header, breadcrumb, H1/sub/pills, content sections, related, footer):

| Variant | When | Difference |
|---|---|---|
| **Standard** | Most tools | Full input + examples + action + output + sidebar |
| **Generator** | UUID, password, lorem, names, fake data | No input panel. One action = `Generate`. Output is multi-record (10/100/1000) with count control. |
| **Image** | QR, barcode, image tools | Input on left, generated `<img>` on right (or stacked mobile). Download always. |
| **Calculator** | SIP, EMI, BMI, percent | Numeric input fields (not textarea), inline result, no copy/download. |
| **Converter** | Currency, unit, base64, encoders | Two input fields (from + to), single output, swap button between them. |
| **Diff / Compare** | JSON diff, text diff, image diff | Two input panels side-by-side, output shows diff inline. |
| **Formatter** | JSON, XML, YAML, SQL, CSS, HTML | Standard + syntax highlighting in output. |
| **Lookup** | DNS, WHOIS, IP, hash lookup | Input + action; output is a table (`<dl>` semantics) not a `<pre>`. |

All variants use the same outer chrome and the same input/output contracts (e2e fixture contract holds). Shell is uniform; workspace isn't.

### 4.7 H1 SEO

- Exactly one H1 per page. Tool name.
- Sub line: includes the **primary action verb** ("format", "convert", "generate", "calculate", "encode", "decode", "validate"). Max 160 chars. Reused as meta description.
- H1 + sub include the action verb and the data type for SERP clarity.

### 4.8 Ad placement

Max 2 in-content ads per tool page (slot 1 + slot 2). Slot 3 from v1.14.0 removed. **No ad in sidebar. No ad above the fold. No ad inside the workspace.**

### 4.9 Tool page loading + error states

- **Initial render:** server-side. H1 + sub + trust pills + breadcrumb + content sections all in SSR HTML.
- **Hydration:** the workspace component is a `"use client"` island. Hydration must complete before LCP (target ≤ 1.8s 4G, 2.5s 3G).
- **Empty input + click action:** show inline hint in output ("Paste input above, then click Format").
- **Tool error:** the output area shows the error in mono text with a "Copy error" link. **Never an unhandled exception** — every tool wraps its compute in try/catch.

---

## 5. Category + listing pages

### 5.1 Page types

| Route | Purpose | Source |
|---|---|---|
| `/tools` | Every tool, paginated | All tools, `popularity` desc |
| `/categories` | Every category | All categories with tool counts |
| `/categories/[slug]` | One category's tools | Filtered registry |
| `/popular` | Top-N most-visited | Top 50 by analytics, fallback `popularity` |
| `/new` | Recently added | Last 30 by `addedAt` desc |
| `/search?q=...` | Free-text results | Section 6 |

### 5.2 Layout (12 col, 2+8+2 with sticky filter rail)

```
┌──────────────────────────────────────────────────────────────────────────┐
│  [Header]                                                                 │
├──────────────────────────────────────────────────────────────────────────┤
│  Home / Tools / Formatters                                                │
│                                                                           │
│  # Formatters                                            12 tools        │  ← H1 + count
│  JSON, XML, YAML, CSV, SQL, and HTML formatters that run in your        │  ← Sub, text-muted
│  browser. No upload. No signup.                                           │
│                                                                           │
├──────────┬────────────────────────────────────────────┬──────────────────┤
│ FILTERS  │  TOOL GRID                                │  SIDE NOTES      │  ← 2 / 8 / 2
│ ───────  │  ──────────                                │  ──────────      │
│ Search   │  ┌──────────────┐ ┌──────────────┐         │  Quick links     │
│ [_____]  │  │ JSON Format. │ │ XML Format.  │         │  · JSON          │
│          │  └──────────────┘ └──────────────┘         │  · XML           │
│ Category │  ┌──────────────┐ ┌──────────────┐         │  · YAML          │
│ □ All    │  │ YAML Format. │ │ CSV Format.  │         │  · SQL           │
│ ☑ Form.  │  └──────────────┘ └──────────────┘         │  · HTML          │
│ □ Encod. │  ┌──────────────┐ ┌──────────────┐         │                  │
│ □ Gener. │  │ SQL Format.  │ │ HTML Format. │         │  Ad (slot 1)     │
│ □ ...    │  └──────────────┘ └──────────────┘         │                  │
│          │                                                │                  │
│ Sort     │  [ 1 ] 2 3 4 ... 12  →                       │                  │
│ [Popul.▼]│                                                │                  │
│          │                                                │                  │
│ View     │                                                │                  │
│ [Grid][L]│                                                │                  │
└──────────┴────────────────────────────────────────────┴──────────────────┘
│  [Footer]                                                                 │
└──────────────────────────────────────────────────────────────────────────┘
```

- **Filter rail (2 col, 240px desktop, drawer on mobile):** search-in-page (filters by name), category checkboxes (auto-built from registry, current category pre-checked), sort dropdown (Popular / Newest / A-Z / Recently used), view toggle (grid / list, persists in `localStorage`).
- **Tool grid (8 col):** CSS grid `auto-fill, minmax(240px, 1fr)`, 16px gap. 24 tools per page. Ad slot 1 inlines after the 12th card on the 1st page only.
- **Side notes (2 col, hidden mobile):** "Quick links" — text list of most common sub-tasks in this category. Each is a deep-link. One ad slot below.

### 5.3 Tool card on listing pages

Same as Section 3.3, with a denser variant: 2-line description (truncated with ellipsis) for browse mode.

### 5.4 Pagination

- **24 tools per page.** `← Prev  1  2  3 … 12  Next →`. Active page is `--color-accent` text, not a button. **Numbers stay text, never buttons.** `aria-current="page"` on the active.
- **Page is a URL parameter** (`?page=2`), not client state. Refreshable, shareable, crawlable.
- **No infinite scroll.**

### 5.5 Category landing page (`/categories/[slug]`)

Distinct from `/tools`. **Primary CTA is the tool itself**, not "browse all." H1 = category name. Sub = 1-line description. **Top 6 most-popular tools** in a 2×3 grid (larger cards, with 1-line taglines). Below: "All {N} tools in {Category} →" linking to `/tools?category={slug}`.

### 5.6 Categories index (`/categories`)

3-col grid of category cards (Section 3.4). Sorted by tool count desc.

### 5.7 /popular and /new

- `/popular` = top 50 by analytics, fallback `popularity`. Same grid as `/tools` minus the filter rail.
- `/new` = last 30 by `addedAt` desc. Same layout. Empty state if < 30.

### 5.8 Empty / loading / error

- **No tools in this category:** "No tools in this category yet. Check back soon." + "Browse all tools →". Centered. No illustration.
- **Filter results in zero hits:** "No tools match these filters. Try removing one." + "Clear filters" button.
- **Server error:** the route's `error.tsx` shows "Something went wrong. Try again." with a retry button. Never a stack trace in production.

### 5.9 SEO surfaces

- H1 = category name. Meta description = category sub-line.
- JSON-LD = `CollectionPage` + `BreadcrumbList` + `ItemList` (each tool as `ListItem` with nested `SoftwareApplication`) via the existing `collectionPage()` helper in `src/lib/seo/json-ld.ts`.
- Canonical = self-referencing absolute URL.
- OG: title + description + absolute image URL (site OG card).
- Page 2+ title: `Formatters — Page 2 of 12 | DevStackIO`.

---

## 6. Search

### 6.1 The two primary search surfaces

| Surface | When | Where |
|---|---|---|
| **Hero search bar** (homepage) | New visitor, broad exploration | Above the fold, 640px wide, single input |
| **Command palette (⌘K)** | Returning user, power user, anything-typed | Modal overlay, opens on `Cmd/Ctrl+K` or search-trigger click |

Both call the **same** client-side index. Hero search is the palette without overlay chrome — typing on the hero navigates to the first result on Enter; ⌘K opens the palette. On mobile, both surfaces use the palette UI (hero replaced by a magnifier icon).

### 6.2 Search index

Build at `npm run build` (existing `scripts/build-search-index.mjs`). Each entry:

```json
{
  "slug": "json-formatter",
  "name": "JSON Formatter",
  "category": "Formatters",
  "description": "Format, validate, and beautify JSON in your browser.",
  "keywords": ["json", "format", "validate", "beautify", "prettify", "minify"],
  "popularity": 92,
  "url": "/tools/json-formatter"
}
```

**Target payload:** ≤ 80KB gzipped for 1000 tools. Currently 172 tools → ~12KB gzipped.

### 6.3 Ranking algorithm

5-signal weighted score:

1. **Exact name match (50%)** — `name.toLowerCase() === query` is the top hit.
2. **Name prefix match (20%)** — `name.toLowerCase().startsWith(query)`.
3. **Substring match across name + keywords (15%)** — token-based.
4. **Fuzzy match (10%)** — Fuse.js with `threshold: 0.4`, `distance: 100`, `minMatchCharLength: 2`. Catches typos and partial words.
5. **Popularity tiebreaker (5%)** — `popularity` 0-100 from registry.

**Synonyms** (`src/lib/search/synonyms.ts`): `["js", "javascript"]`, `["img", "image", "picture", "photo"]`, `["uuid", "guid"]`, `["hash", "checksum", "digest"]`, `["diff", "compare"]`, `["min", "minify", "compress"]`, `["pretty", "beautify", "format", "prettify"]`. Query is expanded before indexing. Client-side only — no privacy impact.

### 6.4 Command palette (⌘K)

```
┌────────────────────────────────────────────────────────────┐
│  🔍  json form_                                  esc      │
├────────────────────────────────────────────────────────────┤
│  RECENTLY USED                                              │
│  ↻  JSON Validator                          /tools/json... │
│  ↻  Base64 Encoder                          /tools/base... │
│                                                            │
│  TOOLS                                                     │
│  •  JSON Formatter             Formatters · 92           │
│  •  JSON Validator             Formatters · 78           │
│  •  JSON Minifier              Formatters · 71           │
│  •  JSON Viewer                Formatters · 65           │
│                                                            │
│  GUIDES                                                     │
│  •  How to format JSON for APIs                            │
│                                                            │
│  ──────────────────────────────────────────                 │
│  ↑↓ navigate  ↵ open  esc close  ⌘K toggle                │
└────────────────────────────────────────────────────────────┘
```

- **Trigger:** `Cmd/Ctrl+K` from anywhere, or click the header search trigger. On mobile, a magnifier icon in the header.
- **Size:** 640px wide max, 60vh tall max, centered. **Surface-3 background** with `--shadow-overlay`.
- **Input:** monospace (Geist Mono), 16/24, no border (the surface IS the container), focus ring on the input.
- **Sections** (in order): **Recently used** (if any, max 5), **Tools** (top 8), **Guides** (top 3, only if 2+ chars typed), **Categories** (top 3, only if 2+ chars typed and no tool results).
- **Result row:** 16/22 name + 14/20 description in text-muted + 14/20 category in mono right-aligned.
- **Keyboard:** ↑/↓ navigates (active row has surface-2 bg + 1px left border in `--color-accent`), Enter opens, Esc closes, focus returns to trigger on close. Active row is announced via `aria-live="polite"` on a hidden region.
- **No results:** "No matches for "jsonnnn". Try a shorter query or browse all tools." with a "Browse all tools →" link. Never blank.
- **Empty (no query):** Recently used + 8 trending tools. Footer help bar with keyboard hints.

### 6.5 Hero search (homepage)

Same input, no overlay. Typing filters the trending chips below into matching results (live, 120ms debounce). Enter opens the first result. Chips transition from "trending" to "matching" in place. **No separate results dropdown** — chips ARE the results, capped at 8. If the user wants more, they press ⌘K or click "Search all →" (links to `/search?q=...`).

The homepage hero is a **quick filter**, not a search interface. Power search lives in ⌘K.

### 6.6 /search fallback page

For users with JS disabled or who arrive via a shared search link. Server-rendered. H1 "Search results for "{query}"", count, sort dropdown (Relevance / Popular / A-Z), grid of tool cards, pagination if > 24 results, no-results state as in 6.4. URL-driven, refreshable, crawlable.

### 6.7 Search index build + caching

- Built by `scripts/build-search-index.mjs` (existing) at `npm run build`. Output: `/public/search-index.json` (verify path during implementation).
- Loaded **once** on first palette open, cached in module memory. Once per session.
- If the index fails to load: "Search is temporarily unavailable. Try `/tools`." with a link. **No silent failure.**

### 6.8 Mobile search

Header's magnifier icon opens the palette as a **full-screen sheet** (Preline `data-hs-overlay`) on viewports < 768px. Same content, larger tap targets (56px row height vs 48px desktop). Hero search hidden on mobile (replaced by the magnifier). Trending chips remain.

### 6.9 Accessibility for search

- Palette has `role="dialog"` `aria-modal="true"` `aria-label="Search tools"`. Focus is trapped inside.
- On open, focus moves to the input. On close, focus returns to the trigger.
- `aria-activedescendant` on the input references the currently-highlighted result (WAI-ARIA combobox pattern).
- All results are `<a>` links. ↑/↓ only changes active descendant.
- `/search` page is fully usable without JS (form submits via GET).
- High-contrast mode: focus ring is `--color-accent` at 2px, contrast-safe against surface-3.

---

## 7. Examples system

### 7.1 The registry contract (carry forward + extend)

AGENTS.md "Adding a New Tool" §5 already defines `examples: string[]` and `useLoadExample("slug", callback)`. This spec extends it for multi-input tools.

### 7.2 Three input shapes

**Single input** (most tools — JSON Formatter, Base64, UUID, etc.):
```ts
useLoadExample("json-formatter", (text: string) => setInput(text));
```
The event `detail.text` populates the primary input.

**Two inputs** (converters: `from`, `to`):
```ts
useLoadExample("base64", ({ from, to }: { from: string; to: string }) => {
  setFrom(from);
  setTo(to);
});
```
The event `detail` is `{ slug, from, to }` for two-input tools. Registry stores examples as `{ from, to }` records.

**N inputs** (any tool with options: image size, output format, etc.):
```ts
useLoadExample("qr-generator", (state: Record<string, unknown>) => {
  setAllInputs(state);
});
```
The event `detail` is `{ slug, state }` where `state` is a partial input-state object.

**Tools that don't subscribe** (Section 4.6 variants: generator, calculator, image): no subscription, examples row hidden.

### 7.3 Registry shape

```ts
// String entries → single-input tool, text only
examples: ["valid JSON", "JSON with errors"]

// Object entries → multi-input tool
examples: [
  { from: "Hello", to: "SGVsbG8=" },
  { from: "你好", to: "5L2g5aW9" },
]

// Keyed (URL-shareable, see Section 12.7)
examples: {
  valid: '{"hello":"world"}',
  nested: '{"a":{"b":{"c":1}}}',
  errors: '{"hello": world}',
}
```

Loader normalizes all shapes into a discriminated `ExampleSpec` union. Tool component picks which form it consumes via `useLoadExample`.

### 7.4 Auto-run vs populate-only

Two behaviors, declared per-tool in registry:

- **`autoRun: true` (default for formatters, validators, converters):** populates input, then triggers the primary action. User sees the example + result instantly.
- **`autoRun: false` (default for generators, destructive tools):** populates input only. User must click the action. Reason: generators can produce 10–1000 records.

Both behaviors satisfy the designplan's "populate inputs" requirement. Auto-run is a quality-of-life upgrade for the most common case.

### 7.5 The "Examples" button row (tool page UI)

```
[ Example 1 ] [ Example 2 ] [ Example 3 ]
```

- Up to 5 buttons per tool. Order = registry order. Names are short (≤ 24 chars, mono).
- **Style:** text-only, `--color-text-muted` default, `--color-text` + 1px bottom border `--color-border-strong` on hover. **No button-shaped buttons** (no background, no padding) — these are links that act.
- **Position:** inside the Input panel, directly below the textarea (Section 4.3).
- **Mobile:** same row, wraps if needed, full-width tap targets (44px min).
- **Loading / disabled state:** if the tool is computing, all example buttons disable for 200ms with a subtle "…" inline.
- **Telemetry:** each click fires `devstackio:example-clicked` with `{ slug, exampleIndex }` for internal analytics. No PII.

### 7.6 Long-form "Examples" section (content)

Below the workspace, in the **Examples** collapsible (`<details>` default closed), render one block per registry example:

```
Example 1: Valid JSON
Input:
  { "hello": "world" }
Output:
  {
    "hello": "world"
  }
```

Each block has a **"Try it"** link that scrolls to the workspace and dispatches the same `devstackio:load-example` event. Same `autoRun` rules apply. Doubles as the SEO-visible documentation.

### 7.7 Failure modes and guarantees

| Failure | Behavior |
|---|---|
| Tool doesn't subscribe | Page-level Examples row hidden (variant-aware, 4.6) |
| Tool subscribes but the example shape doesn't match | Console warning in dev, silent in prod, example button visibly no-op |
| Click during compute | Debounced; second click ignored for 200ms with "…" hint |
| Example text is empty string | Button still dispatches (clears the input) — explicit reset use case |
| Hydration not complete | Examples row appears on first paint with `disabled` and `aria-busy="true"`, removes on hydration |
| Subscribe handler throws | Tool page catches, shows inline error in output area, never crashes the page |

### 7.8 Verification

- **Per-tool fixture** in `tests/fixtures/<category>.json` (AGENTS.md "Adding a New Tool" §6) MUST include at least one example and the `action` field. The Playwright e2e spec auto-clicks the first example and verifies input is populated, then clicks action and verifies output. **No tool ships without passing this.**
- **Manual verification checklist** (added to AGENTS.md Definition of Done):
  1. Open the tool page
  2. Click Example 1
  3. Verify input is populated
  4. Verify all required fields are populated
  5. Click primary action
  6. Verify output is correct
  7. Verify Copy / Download / Reset work
- This checklist runs in CI via the per-tool fixture spec. Manual verification is a release gate, not a development gate.

---

## 8. Content / Guide / Blog / Compare page treatment

### 8.1 Three content types

| Type | URL | Source | Audience | Tone |
|---|---|---|---|---|
| **Guide** | `/guides/[slug]` | MDX in `src/content/guides/` | Someone learning | Tutorial, step-by-step |
| **Blog** | `/blog/[slug]` | MDX in `src/content/blog/` | Industry/news | Editorial, dated |
| **Compare** | `/compare/[a]-vs-[b]` | Generated from registry | Tool chooser | Table + verdict |

All three render with the same **prose component** so visual consistency is enforced in code, not in author discipline.

### 8.2 The prose component

`<Prose>` — wraps MDX content with our design tokens. Renders:

- **Headings:** H2 (28/32, top margin 48px), H3 (20/26, top 32px), H4 (16/22 weight 600, top 24px, color `--color-text-muted`). No H5/H6.
- **Body:** 16/24, max-width 720px, color `--color-text`. Below 1024px, max-width 100%.
- **Links:** `--color-link`, underline-on-hover only, never default. External links get `target="_blank" rel="noopener noreferrer"` and an `↗` glyph (aria-hidden).
- **Lists:** 16/24, 8px gap between items, 24px nested indent.
- **Inline code:** Geist Mono 14/20, surface-2 bg, 1px border-subtle, 4px radius, 2px vertical padding. Same in light and dark.
- **Code blocks:** rendered by `rehype-highlight` (already a dep). Geist Mono 14/22, surface-1 bg, 1px border-subtle, 6px radius, 16px padding, horizontal scroll (never wrap). Token colors from a single syntax theme file (`src/styles/highlight-theme.css`) with dark and light variants. No inline styles.
- **Tables:** 14/20, 1px borders (border-subtle), surface-1 header bg, no zebra striping. **No card around the table** — table is content.
- **Blockquotes:** 16/22, 4px left border `--color-border-strong`, 16px left padding, color `--color-text-muted`. **No card, no background.**
- **Images:** max-width 100%, no border, no shadow. Captions in 14/20 text-muted below.
- **Callouts:** Preline `alert` component, 4 variants: `info` (accent), `warning` (amber), `success` (green), `danger` (red). Each: 1px border in the variant color + 16px padding + leading icon.

### 8.3 Page layout (8 of 12 centered)

```
┌─────────────────────────────────────────────────────────────────────┐
│ [Header]                                                             │
│ Home / Guides / How to format JSON for APIs                         │
│                                                                      │
│ # How to format JSON for APIs                                       │  H1
│ A practical guide to JSON formatting for production APIs.            │  Sub
│                                                                      │
│ Published 2026-08-15 · Updated 2026-09-05 · 8 min read · By J. Doe │  Meta, text-muted
│                                                                      │
│ [8-col prose]                                                        │
│                                                                      │
│ [Inline ToC, right sidebar, 4-col, sticky]                           │
│  · Overview                                                          │
│  · Step 1                                                            │
│  · Step 2                                                            │
│  · Common mistakes                                                   │
│                                                                      │
│ [Ad slot 1]                                                          │
│                                                                      │
│ [Related guides, 3-col]                                              │
│  · How to validate JSON                                              │
│  · How to design REST APIs                                           │
│  · Common JSON mistakes                                              │
│                                                                      │
│ [Footer]                                                             │
└─────────────────────────────────────────────────────────────────────┘
```

- Reading width 720px, centered. Long-form content gets 8 of 12 cols.
- Right ToC sidebar (4 col, 240px, sticky at `top: 96px`, hidden mobile). Auto-generated from H2/H3.
- Meta line below H1: published, updated, read-time, author. All `--color-text-muted`, 14/20.
- **No card around the article body.** Prose is just text on the page surface.

### 8.4 Compare page (`/compare/[a]-vs-[b]`)

Auto-generated from registry:

```
┌────────────────────────────────────────────────────────────────────┐
│  Home / Compare / JSON Formatter vs XML Formatter                  │
│                                                                     │
│  # JSON Formatter vs XML Formatter                                 │  H1
│  Side-by-side comparison of the two formatters.                     │  Sub
│                                                                     │
│  ┌──────────────────────────┬──────────────────────────────────┐  │
│  │ JSON Formatter            │ XML Formatter                     │  │  ← 2-col comparison
│  │ Format, validate, ...     │ Format, validate, beautify XML... │  │     table, surface-2 bg
│  │ Inputs: text              │ Inputs: text                      │  │     1px border, no shadow
│  │ Outputs: text             │ Outputs: text                     │  │
│  │ Works offline: ✓          │ Works offline: ✓                  │  │
│  │ Best for: APIs, config    │ Best for: docs, feeds             │  │
│  │ Popularity: 92            │ Popularity: 64                     │  │
│  └──────────────────────────┴──────────────────────────────────┘  │
│                                                                     │
│  ## When to use JSON Formatter                                     │
│  [prose]                                                             │
│                                                                     │
│  ## When to use XML Formatter                                       │
│  [prose]                                                             │
│                                                                     │
│  ## Try them                                                        │
│  [Open JSON Formatter →]   [Open XML Formatter →]                  │
└────────────────────────────────────────────────────────────────────┘
```

- Auto-generated from `tool.description`, `tool.keywords`, `tool.features`, `tool.popularity`, plus a small static `comparison[slug]` map of "when to use" hints.
- Canonical URL: alphabetical `(a, b)`, reverse `redirect()`s to canonical.
- Structured data: `Article` (TechArticle) with two referenced `SoftwareApplication`s.

### 8.5 Card patterns

| Card type | When | Style |
|---|---|---|
| **Article card** | Guides/Blog index, related, footer | 1px border, 4px radius, surface-1, 16px padding. H3 (16/22 weight 600), 1-line sub (14/20 text-muted), optional meta. No image. |
| **Category card** | Categories index, homepage section 2 | Section 3.4 — name + count + 1-line desc |
| **Tool card** | Listing, homepage sections 1/3/4 | Section 3.3 — icon + name + 1-2 line desc |
| **Stat card** | About page, footer | Number (mono 28/32 weight 600) + label (12/16 text-muted). 1px border, surface-1. |

**No card contains a card.** Enforced by lint.

### 8.6 Dark/light theme consistency (the designplan §9 fix)

The bug: blog/guide card hard-coded white while everything else dark. The fix is structural:

- **No hard-coded colors** in any content component. Every color is a token. Enforced by eslint (no `bg-white`, `bg-gray-*`, `text-black`, `dark:bg-*` outside `src/styles/globals.css`).
- **No "light-only" components.** Every component renders correctly in both themes. CI check: render the same page in light and dark, snapshot diff the structure, fail if either is unreadable.
- **Visual regression test:** Playwright snapshots the homepage, a tool page, a guide, and a category page in both light and dark. Run on every PR (existing `test:snapshots`).
- **No `:root` overrides outside `globals.css`.** All token changes go through one file.

### 8.7 No-results / loading / error

- **404 for missing guides/blog/compare:** standard `not-found.tsx` with a search bar and "Browse all guides →" link.
- **MDX parse error:** "This article has a formatting issue. We've been notified." + reload link. Never expose the stack trace.
- **Compare page with only one valid tool:** redirect to the single tool's page.

---

## 9. Mobile + responsive rules

### 9.1 Breakpoints

Tailwind v4 defaults, no custom overrides:

| Name | Range | Layout |
|---|---|---|
| `mobile` | < 640px | 1 col. Hamburger nav. 16px page padding. |
| `sm` | 640–767px | 1 col. Hamburger nav. 24px page padding. |
| `md` | 768–1023px | 2 col. Hamburger nav. 32px page padding. |
| `lg` | 1024–1279px | 12 col. Top nav. Sidebar appears (tool page). 32px gutter. |
| `xl` | 1280–1535px | 12 col, 1280px max. Top nav. 32px gutter. |
| `2xl` | ≥ 1536px | 12 col, 1280px max (centered). 32px gutter. |

**No `xs` breakpoint. No custom breakpoints** in components (use Tailwind's). Custom breakpoints allowed only in `tailwind.config` if absolutely needed; default set is sufficient.

### 9.2 Per-page mobile behavior

| Page | Mobile layout | Notes |
|---|---|---|
| **Homepage** | Hero stack (1 col), trending chips row (wrap), popular grid (1 col), categories grid (1 col), featured (1 col), new (1 col), conversions (1 col), guides (1 col). 64px section spacing → 48px mobile. | Trending chips wrap to 2 rows. Search bar = full width (no 640px max). |
| **Tool page** | Workspace (1 col), examples (1 col row), action (full width), output (1 col), result actions (stack). Sidebar collapses to a "Related · How-to · FAQ" section **below the workspace**, full width. Trust pills stack. | Workspace is the entire viewport width. Textareas go full width. |
| **Category / listing** | Filter rail collapses into a **bottom-sheet drawer** (Preline `data-hs-drawer`) triggered by a sticky "Filter" button. Tool grid = 1 col. Pagination = stack. | Filter state preserved when sheet closes. |
| **Content (guide/blog)** | Prose 1 col, ToC becomes an inline `<details>` at the top, no sticky. Ad slots collapse to 1 width. | Reading width = 100%, no max. |
| **Compare** | 2-col comparison becomes 1 col (one tool per row, label in a `<dt>` cell). | |
| **Search results** | Same as listings (filter sheet, 1 col grid). | |
| **Command palette** | Full-screen sheet (Section 6.8). | |

### 9.3 Touch targets

- **Minimum 44×44 CSS pixels** for any tappable element (Apple HIG) — applied to nav items, buttons, links, checkboxes, accordion triggers, tabs, example buttons, copy/download/reset, pagination numbers.
- **48×48 preferred** for primary actions and nav items (Android Material).
- **Spacing between tappable elements: 8px minimum.**
- **No hover-only affordances.** Every action reachable on `:focus-visible` and visible during 200ms long-press.
- **No `cursor: pointer` on non-interactive elements.**

### 9.4 Inputs on mobile

- **Textareas**: `font-size: 16px` minimum (prevents iOS zoom-on-focus). Same on `lg`.
- **Numeric inputs**: `inputmode="decimal"` or `inputmode="numeric"`. `type="number"` is **banned** for tool inputs (per AGENTS.md finance convention). Use `type="text"` + `inputmode="decimal"`.
- **Selects**: native `<select>` default. Preline styled `<select>` only when native is unusable.
- **Paste support**: paste from clipboard is the primary mobile input path.

### 9.5 Tables on mobile

- **Default: horizontal scroll** inside a `max-width: 100%; overflow-x: auto` wrapper. Subtle right-edge shadow to indicate scrollability.
- **For tables where scroll is unacceptable** (e.g. compare with 2 columns): convert to a **stacked definition list** (`<dl>`) at `<md`. Each row becomes a section with `<dt>` as the label and `<dd>` as the value.
- **No "responsive table" libraries.**

### 9.6 Code blocks on mobile

- Horizontal scroll inside the block, no wrap.
- 14/20 monospace (same as desktop).
- Touch scroll momentum enabled.
- Long lines get a "Copy" affordance pinned to the top-right of the block.

### 9.7 Typography on mobile

- **No size reduction on body text.** Body 16/24 on mobile, same as desktop.
- **H1 32/40** on mobile (down from 40/48). H2 24/28. H3 18/24. Spacing scales down 25%.
- **Line-length**: 720px prose max only applies ≥ `md`. Mobile = full viewport.

### 9.8 Navigation on mobile

- Header: logo (left), magnifier search (right), hamburger (right). 64px tall. No "Categories" link visible — lives in the hamburger sheet.
- **Hamburger sheet**: full-screen overlay (Preline), with: search input at top (focuses on open), Tools, Categories (accordion), Guides, Blog, Theme toggle, footer link row. Outside-tap and back button close. `aria-modal="true"`, focus trap.
- **Sticky header** on scroll: yes, with the same 1px bottom-border-on-scroll behavior. No size change.

### 9.9 Ads on mobile

- All AdSense slots use `data-ad-format="auto"` + `data-full-width-responsive="true"`.
- **No ads in mobile tool page workspace.**
- **Sidebars collapse** on mobile (no vertical sidebar ads below `md`).
- Ad slot min-heights (90/250/280/600px) reserved from SSR (AGENTS.md CLS rule) — apply on all viewports.

### 9.10 Landscape on mobile

- **Tool page**: when `orientation: landscape` and `height < 500px`, the workspace becomes **2-col side-by-side** (input left, output right, 50/50). Examples + action row above both. Result actions below output.
- **Homepage**: unchanged from portrait.
- **Navigation**: header stays 64px; hamburger sheet becomes a side sheet (right, 320px) instead of full-screen.

### 9.11 Performance on mobile

- No layout shift on hydration. Workspace min-height reserved from SSR.
- Touch-friendly scroll: `overflow-scrolling: touch` on iOS, native smooth scroll on Android.
- No hover-induced reflows.
- `loading="lazy"` for below-the-fold images, `fetchpriority="high"` for the LCP element (none today, rule for when added).

---

## 10. Accessibility

WCAG 2.2 AA is the floor; we target 2.2 AAA where it costs nothing.

### 10.1 Perceptual

| Concern | Rule | Source |
|---|---|---|
| Text contrast | All text ≥ 4.5:1 against background. Large text (≥ 18px or 14px bold) ≥ 3:1. Non-text UI (icons, state borders) ≥ 3:1. | WCAG 1.4.3, 1.4.11 |
| Color independence | No state communicated by color alone. Icon + color, or text + color. | WCAG 1.4.1 |
| Focus indicator | 2px solid `--color-accent` ring, 2px offset, visible on every focusable element. Never removed. | WCAG 2.4.7, 2.4.11 |
| `prefers-reduced-motion` | All animations collapse to 0ms. No parallax. No scroll-jacking. | WCAG 2.3.3 |
| `prefers-color-scheme` | Respected by default; theme toggle overrides. | WCAG 1.4.3 |
| `forced-colors` (Windows High Contrast) | Borders and focus indicators remain visible when system colors are forced. Verified in axe-core. | WCAG 1.4.3 |

### 10.2 Operable

| Concern | Rule | Source |
|---|---|---|
| Keyboard | Every interactive element reachable and operable by keyboard. Tab order = visual order. | WCAG 2.1.1, 2.4.3 |
| No keyboard trap | Modal/palette/drawer focus is trapped while open; Esc always releases. | WCAG 2.1.2 |
| Skip link | "Skip to main content" link on first Tab of every page, jumps to `<main id="main">`. | WCAG 2.4.1 |
| Page title | Every page has a unique `<title>` (≤ 60 chars). Set in `metadata.title`. | WCAG 2.4.2 |
| Link purpose | Link text describes destination. No "click here" / "read more" without context. | WCAG 2.4.4 |
| Multiple ways | ≥ 2 ways to find any page (nav, search, sitemap, related). | WCAG 2.4.5 |
| Touch target size | ≥ 24×24 (WCAG 2.5.8 minimum), 44×44 (Section 9.3 enforced). | WCAG 2.5.5, 2.5.8 |
| Target spacing | Adjacent tappables separated by ≥ 24px or under 5px. | WCAG 2.5.8 |

### 10.3 Understandable

| Concern | Rule | Source |
|---|---|---|
| Language | `<html lang="en">` (or per-page). `lang` on `<pre>`/`<code>` containing non-English text. | WCAG 3.1.1, 3.1.2 |
| Consistent navigation | Header + footer don't change between pages (except active state). | WCAG 3.2.3 |
| Consistent identification | Same icon + label for the same action across pages. | WCAG 3.2.4 |
| Input assistance | Form errors identify the field, describe the problem, suggest a fix. | WCAG 3.3.1, 3.3.3 |
| Labels | Every input has a visible label. No `placeholder` as the only label. | WCAG 1.3.1, 3.3.2 |

### 10.4 Robust

| Concern | Rule | Source |
|---|---|---|
| Valid HTML | Passes `html-validate` with no errors. | WCAG 4.1.1 |
| Name, role, value | All custom components have proper ARIA. No ARIA where native semantics suffice. | WCAG 4.1.2 |
| Status messages | `aria-live="polite"` for tool result status (`Copied`, `Formatted in 12ms`). `role="alert"` for blocking errors only. | WCAG 4.1.3 |
| Parsing | No duplicate IDs, no broken nesting, no unclosed tags. | WCAG 4.1.1 |

### 10.5 Semantic primitives (no ARIA when native works)

| Native element | Use for |
|---|---|
| `<button>` | All actions |
| `<a href>` | All navigation |
| `<input type="checkbox">` etc. | Form controls |
| `<dialog>` | Modals (Preline or native) |
| `<details>`/`<summary>` | FAQ, long-form collapsibles |
| `<nav>`, `<main>`, `<header>`, `<footer>`, `<aside>`, `<section>` | Page landmarks |
| `<table>` with `<thead>/<tbody>/<th scope>` | Compare tables |
| `<dl>/<dt>/<dd>` | Definition lists, lookup results |

**Custom ARIA** only when no native element works. No `role="button"` on `<div>`. No `aria-label` overriding visible text.

### 10.6 Tool page a11y specifics

- **Input textarea**: `aria-label="JSON input"` (or per-tool), `aria-describedby` points to a sibling `<p>` with the format hint.
- **Output region**: `role="region" aria-live="polite" aria-label="Result"`. When the output updates, the announcement is "Result updated" + the new content.
- **Status text** (e.g., "Formatted · 12ms"): `aria-live="polite"`. Not announced on every keystroke, only on action completion.
- **Examples row**: `<ul role="list">` with `<li>` for each example. Each example is a `<button type="button" aria-label="Load example 1: Valid JSON">`.
- **Action button**: `<button type="button" disabled={isComputing} aria-busy={isComputing}>`.
- **Errors in output**: `role="alert"` only if blocking. Inline errors are `aria-live="polite"`.

### 10.7 Automated a11y gates (CI)

- **axe-core** (already in `devDependencies` `@axe-core/playwright`) runs on every PR. Zero violations of WCAG 2 A or AA. AAA findings logged but non-blocking.
- **HTML validate** in CI: no errors.
- **Color contrast**: programmatic check on every text/background pair (axe covers this).
- **Keyboard test** (Playwright): Tab through every page, verify focus order matches DOM order, verify all actions reachable.
- **Screen reader smoke test** (manual, quarterly): NVDA on Windows, VoiceOver on macOS, TalkBack on Android. Cover homepage, a tool page, a guide, the search palette.

### 10.8 `npm run test:a11y` (existing, extended)

- Every page in the site (homepage, tool page, category, listing, guide, blog, compare, search, 404)
- Both light and dark themes
- Both desktop and mobile viewports
- Both `prefers-reduced-motion: no-preference` and `prefers-reduced-motion: reduce`
- A representative tool per variant (Standard, Generator, Image, Calculator, Converter, Diff, Formatter, Lookup)

Run on every PR. Merge gate.

---

## 11. Ad placement policy

### 11.1 Carry forward (no change)

From AGENTS.md "Ad Implementation Guidelines":

- **Manual DOM injection** in `AdSenseScript` (avoid the `next/script` `data-nscript` console warning).
- **`strategy="lazyOnload"`** for the AdSense client script.
- **Env-driven slot IDs** in `src/lib/data/ads.ts`, never hard-coded.
- **Dev mode = ads disabled**, render labeled placeholders.
- **All units** use `data-ad-format="auto"` + `data-full-width-responsive="true"`.
- **CLS prevention**: `AdContainer` reserves a fixed `min-height` per format on every render (90/250/280/600px).
- **No auto-ads** (publisher controls them in the AdSense console).
- **Slot IDs are unique per placement**, never reused.

### 11.2 Tighten vs current rules

| Rule | Current (AGENTS.md) | This spec |
|---|---|---|
| Max in-content ads per tool page | 3 | **2** (workspace-exit slot + content-exit slot). Removes the third "after FAQ" slot. |
| Min-height reservation | Yes | **Keep, AND extend to all breakpoints.** Mobile slot heights don't change. |
| Ads in sidebar | (not addressed) | **Never in tool page sidebar.** Sidebar is content. Listing pages may have one sidebar slot (Section 5.2). |
| Ad label | "Advertisements" | **"Advertisement"** (singular, matches Better Ads Standards wording). |
| Ad inside tool UI | Prohibited | **Prohibited + add lint rule** (no `<AdContainer>` inside a `src/components/tools/*` file). |
| Ad between content sections | Allowed | **Allowed, with 64px top margin** (Section 1.2 rhythm). |
| Ad above the fold on tool page | Allowed | **Prohibited** — workspace is the above-the-fold content. First ad is below the workspace, after the content sections. |

### 11.3 Slot inventory

```
homeTop           — after hero
homeMid           — between conversions and learning hub (Section 3.2)
homeBottom        — before footer

toolAfterWorkspace   — between workspace and content sections
toolBeforeRelated    — between content sections and related tools
toolThird            — REMOVED (was: after FAQ). Now a no-op slot.

categoryHeader     — between category header and tool grid
categoryMid        — inline after 12th card on page 1 only
categoryBottom     — before pagination

listingTop         — between header and grid
listingMid         — inline after 12th card on page 1 only
listingBottom      — before pagination

guideInline        — between prose body and "Related guides"
blogInline         — same pattern
```

**No "global" ad** that injects at the top of every page. Each page owns its ad placement explicitly.

### 11.4 Labeling (AdSense policy + Better Ads Standards)

- **Visible label** above every ad: `Advertisement` in 12/16, `--color-text-muted`, left-aligned, 8px space below to the ad.
- **No "Sponsored" / "Promoted" / "Recommended"** labels.
- **Placeholder label** in dev mode: same wording so layout matches production.

### 11.5 Consent (GDPR / CCPA / AdSense EU user consent)

- **Cookie consent** (existing `CookieConsent`) gates AdSense load. **No ad JS executes before consent.**
- **California (CCPA/CPRA)**: "Do Not Sell or Share" link in footer. When AdSense personalization is in effect, it counts as "sharing" — the consent banner must block it pre-consent. Verify `consent-init.js` does this.
- **Global Privacy Control (GPC)**: respect `Sec-GPC: 1` header and `navigator.globalPrivacyControl`. If set, treat as full opt-out regardless of UI consent state.

### 11.6 What we never do

- ❌ Ads on the search palette (modal)
- ❌ Ads inside `<pre>`/`<code>` (the tool output)
- ❌ Ads that mimic tool UI
- ❌ Ads on the 404 page
- ❌ Ads on contact, privacy, or legal pages
- ❌ Sticky ads (no `position: fixed` ad)
- ❌ Ads that block the first interaction (no "interstitials" on tool pages)

### 11.7 Ad audit cadence

- **Quarterly**: review AdSense "Ad review" report, fix policy violations within 7 days.
- **On every page change** that touches a tool page or a section above the fold: Playwright snapshot the page with ads blocked + ads allowed, verify the workspace is unchanged.
- **Ad density review** (every 6 months): if average ads per page exceeds 2.5, audit and remove.

---

## 12. SEO architecture

### 12.1 Per-page metadata (carry forward + tighten)

| Element | Rule | Source |
|---|---|---|
| `<title>` | Unique, 50–60 chars. Static pages: `{Page H1} | DevStackIO`. Tool pages: `{Tool Name} — {action verb from sub} | DevStackIO` (e.g. "JSON Formatter — Format, validate, and beautify JSON | DevStackIO"). Category pages page 2+: `{Category} — Page {N} of {total} | DevStackIO` (Section 5.9). | AGENTS.md |
| Meta description | Unique, 140–160 chars, action-led. Used in OG too. | AGENTS.md |
| Canonical | Self-referencing absolute URL, no trailing slash, lowercase, hyphens. | AGENTS.md |
| `robots` meta | `index, follow, max-image-preview:large` default. `noindex` per-tool when `tool.noindex === true`. | AGENTS.md |
| OpenGraph | `og:title`, `og:description`, `og:type` (website or article for blog), `og:url`, `og:image` (absolute site OG card), **`og:image:alt` required** (AGENTS.md note). | AGENTS.md |
| Twitter | `summary_large_image`, mirrors OG. | AGENTS.md |
| `viewport` | In `export const viewport` per Next.js App Router metadata API, never as a hand-written `<meta>`. | AGENTS.md |
| `theme-color` | Same — exported, not inline. | AGENTS.md |

### 12.2 JSON-LD (carry forward)

- **Organization** emitted **once globally** in `layout.tsx` with `@id: ".../#organization"`. Pages reference by `@id`, never re-declare.
- **WebSite + SearchAction** on homepage only.
- **SoftwareApplication** on every tool page.
- **BreadcrumbList** on every page except homepage.
- **FAQPage** on tool/guide pages with a real FAQ.
- **HowTo** on tool pages with a real how-to section.
- **CollectionPage + ItemList** on category and listing pages.
- **TechArticle** for guides, **BlogPosting** for blog posts.
- All JSON-LD bodies emitted via `jsonLdScriptBody()` helper (`<` → `\u003c` Next.js rule).

**Tightening:** every JSON-LD block must pass Google's Rich Results Test (CI gate). `npm run test:seo` already exists per AGENTS.md — extend it to cover all 172 tool pages.

### 12.3 Sitemap (carry forward, tighten)

- `sitemap.xml` auto-generated from registry at build time.
- **Include**: every tool page, every category page, every guide, every blog post, every comparison.
- **Exclude** (`robots.txt`): `/api/*`, `/private/*`, `/admin/*`, `/contact/success`. Plus any tool with `tool.noindex === true`.
- **`lastmod`** from git commit date or content hash (NOT sitemap generation date) per AGENTS.md.
- **IndexNow** submission on content add/update/delete per AGENTS.md.
- **Remove** `Crawl-delay: 10` from `robots.txt` (Google ignores it per RFC 9309).

### 12.4 Internal linking (the SEO bet)

Three linking surfaces:

1. **Sidebar "Related tools"** (Section 4.5). Every tool page surfaces 8 related tools. Source: registry `related` field if set, else co-occurrence in `keywords` + same category, ranked by `popularity`.
2. **Tool page content sections** (Section 4.1): "Related tools" grid below content (8 cards, 4×2 desktop). Same source.
3. **Auto-generated cross-links in content** (prose.mdx): in every guide and blog post, link to relevant tools. Pattern: "Use the [JSON Formatter](/tools/json-formatter) to clean up your payload." Same tab.

Plus:
- **Comparison pages** (Section 8.4): auto-generated, canonical alphabetical.
- **Category landing pages** (Section 5.5): curated top-6 + "see all" → every tool in that category gets a link.
- **Conversions & lookups rail** (homepage section 5): 20 deep-links to common tools.

**Estimated internal links per tool page:** ≥ 15 outbound (8 sidebar + 8 related grid + 5-10 inline from content + 1-3 from comparison pages).

### 12.5 Headings + content hierarchy

- **H1** = exactly one per page. Tool name on tool pages, category name on category pages, article title on guides/blog.
- **H2** = primary content sections.
- **H3** = subsections, sidebar headers, FAQ questions.
- **No skipped levels.** H1 → H2 → H3. H4 is rare and only inside FAQ answers or nested lists.
- **No H1 in the layout header.** Logo text is `<span>`, not `<h1>`.

### 12.6 URL canonicalization

- All tool URLs lowercase, hyphenated, no trailing slash. The registry `slug` is the source of truth.
- `aliasSlugs` (existing) `redirect()` to canonical (301, not 302).
- No URL parameters on tool pages except `?example=key` (Section 12.7) and `?utm_*`.
- No hash routes. All routes are server-rendered.

### 12.7 Shareable examples (URL state)

Some tools can be deep-linked with a pre-populated example: `/tools/json-formatter?example=valid`. Page loads with example in input + auto-runs (per Section 7.4 `autoRun`). Shareable links create backlinks — a low-cost, high-SEO-value feature.

Implemented as:
- Registry `examples` indexed by key (not position):
  ```ts
  examples: {
    valid: '{"hello":"world"}',
    nested: '{"a":{"b":{"c":1}}}',
    errors: '{"hello": world}',
  }
  ```
- Page reads `?example=key` and dispatches `devstackio:load-example` with `{ slug, text }` on mount.
- Tool components don't need to know about the URL — they just listen for the event.

### 12.8 Image SEO

- No tool page images (icon-only, no screenshots). Faster pages, no image SEO needed.
- Logo + OG card are the only persistent images. Both have descriptive `alt` and `og:image:alt`.
- Guide MDX may include images. Every `<Image>` (next/image) requires `alt` (AGENTS.md "Accessibility").

### 12.9 Hreflang

- **Single-language** for now (`en`). If/when multi-language is added, hreflang + per-language URLs need their own spec.
- `<html lang="en">` on every page (Section 10.3).

---

## 13. Performance

### 13.1 Core Web Vitals targets (enforced in CI)

| Metric | Target | Source | Enforcement |
|---|---|---|---|
| **LCP** | ≤ 2.5s on 4G mobile | web.dev/vitals | Lighthouse CI fails > 2.5s |
| **INP** | ≤ 200ms | web.dev/vitals | Real-user monitoring (RUM) via `web-vitals` lib |
| **CLS** | ≤ 0.1 | web.dev/vitals | Lighthouse CI + AdContainer min-height rule |
| **TTFB** | ≤ 600ms p75 | internal | Server logs |
| **TBT** | ≤ 200ms | Lighthouse | Lighthouse CI |
| **Lighthouse Performance score** | ≥ 90 | AGENTS.md | Lighthouse CI fails < 90 |

### 13.2 Bundle budgets (enforced in CI)

| Budget | Limit | Per |
|---|---|---|
| **Initial JS per route** | ≤ 250 KB (gzipped) | First-load JS for the route |
| **Tool bundle** | ≤ 100 KB (gzipped) | Per-tool component + its direct deps |
| **Shared/vendor chunk** | ≤ 200 KB (gzipped) | Across the app |
| **CSS per route** | ≤ 50 KB (gzipped) | Critical CSS inlined, rest async |
| **Total page weight** | ≤ 1.5 MB | All resources, all viewports |

`npm run test:unit` already includes a bundle-size test per AGENTS.md — extend to enforce per-route limits. **CI gate**: PR fails if any budget exceeded.

### 13.3 Preline cost + how we manage it

Preline `dist/index.js` is **~50KB gzipped** for the full bundle. We:

1. **Import once** in `src/components/providers/preline-provider.tsx`, not per-component.
2. **Lazy-load the script** on first use. The provider is dynamic-imported by an `IntersectionObserver` on the body root (loads when user has scrolled past 100px or interacted, whichever first) or on first modal/dropdown trigger. **Never on first paint.**
3. **Defer initialization** until DOM is ready. `window.HSStaticMethods.autoInit()` runs on `requestIdleCallback`, never blocking input.
4. **No Preline for components we don't need.** The Preline bundle is one file, so this is a global decision: if a route doesn't need any Preline component, the provider skips loading.

Net cost: **0 KB on routes that don't use Preline components.** **+50 KB on routes that do.** Fits within the 250KB route budget.

**Verification during build:** bundle analyzer (`npm run analyze` existing) on every PR, diff against main, fail if per-route initial JS grows by > 10% without justification.

### 13.4 What gets lazy-loaded

- **Tool component** (`/components/tools/[slug].tsx`): already dynamically imported by the dynamic-tool-loader (per AGENTS.md). Each tool is its own chunk.
- **Heavy libs** (syntax highlighter, image processing, WASM modules): dynamic-import on first tool that needs them.
- **AdSense client script**: `lazyOnload` (AGENTS.md). Skipped if consent denied.
- **Search index** (`/search-index.json`): fetched on first palette open, cached in module memory.
- **Preline**: dynamic import, IntersectionObserver-triggered.
- **Below-the-fold images** (when added): `loading="lazy"`.
- **Theme toggle script**: inlined (tiny), runs on `DOMContentLoaded`.

### 13.5 What does NOT get lazy-loaded

- **Critical CSS** for above-the-fold: inlined in `<head>`.
- **Header + footer + breadcrumb** components: in initial bundle. Small, used everywhere.
- **Web fonts** (Geist Sans + Geist Mono): `next/font` with `display: swap`, preloaded, no FOUT-blocking.
- **Tailwind CSS** base + tokens: in critical CSS.

### 13.6 Image and font strategy

- No raster images on tool pages. Tool icons are inline SVG (Lucide, already a dep).
- No web fonts beyond Geist (already loaded via `next/font`).
- No icon font. Lucide is tree-shakeable (per-component imports only).
- No emoji in source (AGENTS.md rule).

### 13.7 SSR / streaming / RSC strategy

- Default: Server Components. No `"use client"` unless the component needs state, effects, or browser APIs.
- Workspace is the only `"use client"` island on a tool page. H1, sub, trust pills, breadcrumb, content sections, and related tools are all RSC.
- Streaming: use Next.js `<Suspense>` for slow data fetches (none today, but the pattern is in place for `/api/currency-rates` and any future feature flag).
- No client-side data fetching on first paint. Every page is server-rendered with full content visible without JS.

### 13.8 Caching

- Static pages (tool pages, category pages, listings, content): statically generated at build time.
- API routes (`/api/currency-rates`): existing 10-minute in-memory cache per AGENTS.md.
- `/search-index.json`: 1-day `Cache-Control: public, max-age=86400, stale-while-revalidate=604800`. Regenerated on each `npm run build`.
- Sitemap, robots, llms.txt, etc.: same, 1-day.

### 13.9 Performance regression gate

`npm run production:readiness` (existing) extends to:

- Lighthouse CI: 3 runs × mobile + desktop, fail on score drop > 2 points vs main.
- Bundle diff: fail on > 10% per-route JS growth.
- CLS: fail on any new ad-hoc min-height missing.
- LCP element snapshot: track which element is the LCP per route; alert if it changes to something unexpected (e.g. an ad).

---

## 14. Tool audit methodology

### 14.1 The audit script

A new script `scripts/tool-audit.mjs` that runs against the running dev/prod server and produces a report. Runs in CI on every PR; runs on demand locally.

For each tool slug:

1. Fetch `/tools/[slug]`. Check 200 OK, content-length, page renders.
2. Detect variant (Section 4.6: Standard / Generator / Image / Calculator / Converter / Diff / Formatter / Lookup). Inferred from tool's component name + registry metadata.
3. Run the per-variant test sequence (below).
4. Collect pass/fail per check, per tool.
5. Emit `data/tool-audit.json` with `{ slug, variant, results: { check: 'pass' | 'fail' | 'warn' } }`.

### 14.2 Per-variant test sequence

**Standard / Formatter / Lookup / Converter (4 variants, same shell):**
1. Page loads (200, < 200KB HTML, no console errors).
2. First textarea is editable.
3. Click first example → textarea populated.
4. Click primary action → output region has content (`data-testid="tool-output"` not empty).
5. Output content matches expected fixture output.
6. Click "Copy" → clipboard contains output (or "Copied" announced).
7. Click "Reset" → output cleared, input preserved (or cleared, per-tool — verify against fixture).
8. Mobile: same flow at 375px viewport.
9. No `data-testid` violations, no broken images, no missing aria-labels.

**Generator:**
1. Page loads.
2. No input textarea present.
3. "Generate" button present and reachable.
4. Click Generate → output region has at least 1 record.
5. Change count to 10 → output has 10 records.
6. Change count to 1000 → output has 1000 records (timeout 5s).
7. Copy works on generated text.
8. Mobile: same flow.

**Image (QR, barcode, etc.):**
1. Page loads.
2. Input is editable.
3. Click example → input populated.
4. Click Generate → `<img>` rendered with valid `src` (data URL or blob).
5. `<img>` has `data-testid="tool-output"`.
6. Download produces a valid PNG/SVG.
7. Mobile: same flow.

**Calculator:**
1. Page loads.
2. Inputs are number fields (or text with `inputmode="decimal"`).
3. Enter values → result updates live or on Calculate.
4. Edge case: zero, negative, very large, very small.
5. Mobile: same flow.

**Diff / Compare:**
1. Page loads.
2. Two input textareas editable.
3. Click example → both populated.
4. Click Compare → diff rendered in output.
5. Identical inputs → "No differences" message (not empty output).
6. Mobile: same flow.

### 14.3 Audit categorization

| Bucket | Criteria | Action |
|---|---|---|
| **Pass** | All checks pass | Ship. |
| **Pass with warnings** | Functional passes, minor issues | File an issue, ship. |
| **Fail (functional)** | Example doesn't populate, action produces no output, copy doesn't work, JS error | Block release. Fix. |
| **Fail (a11y)** | axe-core violation, missing label, focus trap | Block release. Fix. |
| **Fail (responsive)** | Horizontal scroll, broken layout, hidden CTA on mobile | Block release. Fix. |
| **Fail (visual)** | Theme bug, contrast bug, layout shift | Block release. Fix. |

**No "I'll fix it later"** for fails. A tool either passes the audit or it doesn't ship.

### 14.4 Per-area salvage decision (per your direction)

For each tool, the audit output drives a per-area decision:

| Area | Decision criteria | Default if unclear |
|---|---|---|
| **Tool component** | Pass audit? | Replace if not |
| **Tool content JSON** | `whatItDoes`, `whyItExists`, `whoShouldUse`, `useCases`, `instructions`, `examples`, `bestPractices`, `commonMistakes`, `faq` all present, non-empty, accurate | Rewrite from scratch if any missing or wrong |
| **Tool registry entry** | Has `examples`, `keywords`, `popularity`, correct `category`, `noindex` only when intended | Update |
| **Fixture** (`tests/fixtures/<category>.json`) | Has `input`, `action`, `expect`, `pattern` (regex tools) | Add |
| **Page chrome** | Uses the standard tool shell (Section 4) | Migrate |

The audit report shows per tool, per area whether each piece is salvageable. The implementation plan then groups the work: e.g. "rewrite all 12 missing `bestPractices` sections in one PR", "fix 3 broken `useLoadExample` subscriptions in one PR", "migrate 5 tools off the legacy shell in one PR."

### 14.5 Tool categorisation by current state (estimated)

Estimated based on file counts. The actual distribution will come from running the audit:

- **Likely pass**: ~60% (v1.14.0 touched the chrome; many tools may already work)
- **Likely fail (functional)**: ~15%
- **Likely fail (a11y)**: ~10%
- **Likely fail (responsive)**: ~10%
- **Likely fail (visual)**: ~5%

These are guesses. The audit script produces ground truth.

### 14.6 Audit cadence

- **Every PR** that touches a tool: re-audit that tool.
- **Weekly** (cron): full audit of all 172 tools, results posted to a `tool-audit` dashboard or stored in `data/tool-audit-history.json` for trend tracking.
- **Pre-release**: full audit + a smoke test of all categories. PR must show "0 fails" for any tool being shipped.
- **Quarterly** (manual): run the audit on the live production site to catch regressions.

### 14.7 Audit dashboard

A simple HTML page at `/admin/audit` (auth-gated, internal-only) that:
- Shows current pass/fail count per tool, per category, per variant.
- Shows trend: which tools have regressed in the last 30 days.
- Shows which tools have warnings to clean up.
- Allows clicking a tool to see the full audit log.

Build-time artifact, not a runtime route. Generated from `data/tool-audit.json` at the end of every audit run.

---

## 15. Verification + acceptance

### 15.1 The 5 personas (from designplan §25)

| # | Persona | Test |
|---|---|---|
| 1 | **Student searching for a calculator** | Open homepage. Search "BMI". Find tool in ≤ 2 clicks. Compute BMI. Read result. Mobile (iPhone 13 viewport, 390×844). |
| 2 | **Developer searching for a JSON formatter** | Open homepage. ⌘K. Type "json form". First result is "JSON Formatter". Enter. Click Example 1. Get formatted output. Copy. Total time < 30s. |
| 3 | **Non-technical person searching for a conversion tool** | Open homepage. Type "fahrenheit celsius" in search. Find the converter. Convert 100°F → 37.78°C. Verify result is correct. Tablet (iPad, 768×1024). |
| 4 | **Mobile user arriving from Google** | Mobile viewport (375×667, slow 4G). Land on a tool page via direct link. Find input. Enter data. Get result. Copy. No horizontal scroll, no layout shift, no waiting. |
| 5 | **Returning user who already knows the exact tool** | Open homepage. ⌘K. Type "base64". Enter. Encode. < 10s total. |

Each persona is a Playwright test scenario in `tests/personas.spec.ts`. Recorded as 1080p video on CI for human review. Fail on any unmet step.

### 15.2 Browser + device matrix

Verified in CI via Playwright projects:

| Browser | Version | Viewport |
|---|---|---|
| Chrome (latest) | latest stable | 1280×720, 375×667 |
| Firefox (latest) | latest stable | 1280×720, 375×667 |
| Safari (latest) | latest stable | 1280×720, 390×844 (iPhone 14) |
| Edge (latest) | latest stable | 1280×720 |
| Mobile Safari (iOS 16+) | via Webkit | 390×844 |
| Chrome Android (latest) | via Chromium | 360×800 |

Why these: 96%+ of DevStackIO's traffic comes from these (per existing analytics — verify in implementation). The project's `browserslist` already targets last 2 versions of each.

### 15.3 Definition of Done (synthesized from designplan §24)

A release is **not** done until **every** item below is true:

**Functional:**
- [ ] Every tool in the registry passes `tests/tools.spec.ts` (per-tool fixture, populate + action + output)
- [ ] Every tool passes the variant-specific audit (Section 14.2)
- [ ] No JavaScript errors in console on any audited page (any severity)
- [ ] No 404s in any internal link
- [ ] Search returns relevant results for the top 50 most-searched queries (manually verified)

**UX:**
- [ ] Homepage hero is above the fold at 1280×800, search bar is 640px wide
- [ ] Tool page workspace is above the fold at 1280×800
- [ ] All 5 personas (Section 15.1) pass
- [ ] Mobile (375×667) and tablet (768×1024) layouts match the spec
- [ ] No page has horizontal scroll on any audited viewport
- [ ] No card-within-card patterns exist (lint rule passes)
- [ ] No hard-coded colors outside `globals.css` (lint rule passes)
- [ ] Trust pills appear on every tool page

**Visual:**
- [ ] No contrast violations on any audited page (axe-core)
- [ ] Both light and dark themes render every component without readability issues
- [ ] No placeholder content (Lorem, "Coming Soon", empty cards)
- [ ] Typography uses only the 6 defined scale steps
- [ ] Spacing uses only the defined scale
- [ ] No element exceeds the max-radius cap (6px)

**Accessibility:**
- [ ] axe-core: 0 violations of WCAG 2 A and AA on every audited page
- [ ] Keyboard-only navigation works on every page
- [ ] Screen reader smoke test passes (NVDA + VoiceOver, quarterly)
- [ ] `prefers-reduced-motion` collapses all animations
- [ ] Touch targets ≥ 44×44 on mobile
- [ ] Skip link present and functional

**SEO:**
- [ ] Every page has unique title (50–60 chars) and description (140–160 chars)
- [ ] Canonical URL set on every page
- [ ] JSON-LD passes Google Rich Results Test for every page type
- [ ] Sitemap.xml is current and includes lastmod
- [ ] llms.txt, humans.txt, security.txt, manifest.webmanifest all valid
- [ ] Internal link count per tool page ≥ 15 outbound
- [ ] OG image + alt on every page

**Performance:**
- [ ] Lighthouse Performance ≥ 90 (mobile + desktop)
- [ ] LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1 (p75 mobile 4G)
- [ ] Initial JS per route ≤ 250KB gzipped
- [ ] No bundle growth > 10% vs main without justification

**Ads:**
- [ ] Max 2 in-content ads per tool page
- [ ] No ad above the fold on tool pages
- [ ] No ad inside tool UI (lint rule)
- [ ] AdContainer min-height reserved (no CLS)
- [ ] Cookie consent gates AdSense (no ad JS before consent)
- [ ] GPC honored

**Build + release:**
- [ ] `npm run lint` passes
- [ ] `npm run typecheck` passes
- [ ] `npm run build` succeeds
- [ ] `npm run test:unit` passes (includes bundle budget)
- [ ] `npm run test:tools` passes (all 172 fixtures)
- [ ] `npm run test:a11y` passes
- [ ] `npm run test:api` passes
- [ ] `npm run test:security` passes
- [ ] `npm run test:seo` passes
- [ ] `npm run test:snapshots` passes (visual regression, light + dark)
- [ ] Version bumped (AGENTS.md "Version Bump Before Commit")

### 15.4 Verification artifacts

Every release produces:

1. **Audit report** — `data/tool-audit.json` (Section 14.1).
2. **Lighthouse report** — `data/lighthouse-{homepage,tool-page,category-page}.html` per release.
3. **Bundle report** — `data/bundle-diff.json` showing per-route size delta.
4. **Persona videos** — `data/personas/{persona}-{viewport}.webm` (5 personas × 2 viewports).
5. **Visual snapshots** — light + dark, every page type (existing `test:snapshots`).
6. **SEO audit** — `data/seo-audit.json` from `npm run seo:audit`.
7. **Sitemap** — current `public/sitemap.xml` committed for diff.
8. **Changelog** — `CHANGELOG.md` updated per AGENTS.md "Version Bump Before Commit."

### 15.5 Sign-off

A release is signed off when:
- The implementation lead reviews the artifacts above.
- The 5 personas pass.
- All Definition of Done items checked.
- The commit passes the AGENTS.md "Version Bump" rule.

**No "looks good, ship it" without the artifacts.** This is the anti-pattern the designplan §26 calls out.

---

## 16. Open questions for the implementation plan

These are not blockers for the spec but need decisions before the writing-plans skill starts. Listing them so the implementation plan author can resolve them up front:

1. **Preline free vs paid tier.** Spec assumes open-source free tier. If a paid component is needed (none in scope today), the budget needs re-approval.
2. **Compare page authorship.** Auto-generated from registry + a small static `comparison[slug]` map. Is "auto + static hints" acceptable, or do we want MDX-authored compare pages for the top 20?
3. **Search index hosting.** Currently `public/search-index.json`. If we exceed 80KB gzipped at 1000 tools, switch to chunked fetch (one per category).
4. **Audit dashboard hosting.** Build-time HTML at `/admin/audit`. Confirm auth model (existing admin auth, or new gate).
5. **Tool audit history retention.** `data/tool-audit-history.json` — how long? Suggested 90 days.
6. **Compare pages SEO risk.** 172 tools → ~14,700 pairs (172 × 171 / 2). Generated pages risk thin-content penalties. Suggest: only generate pairs where `related` field is set explicitly (curated), or limit to top-200 by popularity. **Default: curated only.**
7. **Persona video storage.** 5 × 2 = 10 webm files per release, ~50MB each. Not for git. Store where? (S3, GitHub Action artifact, etc.)
8. **Mobile landscape breakpoint.** 500px height feels right but should be verified against actual iPhone landscape (390×844 → effective 844×390).

---

## Decisions log

This spec is the synthesis of a brainstorming session on 2026-09-05. Key decisions, in order:

1. **Scope of this session**: audit + spec only, no code (recommended choice).
2. **Posture to current code**: per-area salvage-or-replace judgment, not blanket replacement (recommended choice).
3. **Spec specificity**: concrete with wireframes included (recommended choice).
4. **Spec scope**: full end-state across all 25 design areas; sequencing deferred to writing-plans (recommended choice).
5. **Design approach**: "Working Utilities Library" (recommended choice — search-first, calm, dense, scales).
6. **Preline UI dependency**: confirmed via context7 docs (Tailwind v4 setup, MIT, 50KB gzipped, lazy-loadable). Adopted for missing primitives (modal, dropdown, select, tabs, accordion, tooltip, popover, datepicker, stepper, toggle, range, file upload, sort, pagination, alert, mega-menu). Custom primitives kept: button, input, card, table, command-palette, syntax highlighting, focus trap, virtualization, all tool shells.
7. **Section 1 (design system)**: approved as-is.
8. **Section 2 (IA + nav)**: approved as-is.
9. **Section 3 (homepage)**: approved as-is.
10. **Section 4 (tool page)**: approved as-is.
11. **Section 5 (category/listing)**: approved as-is.
12. **Section 6 (search)**: approved as-is.
13. **Section 7 (examples)**: approved as-is.
14. **Section 8 (content)**: approved as-is.
15. **Section 9 (mobile)**: approved as-is.
16. **Section 10 (a11y)**: approved as-is.
17. **Section 11 (ads)**: approved as-is.
18. **Section 12 (SEO)**: approved as-is.
19. **Section 13 (performance)**: approved as-is.
20. **Section 14 (tool audit)**: approved as-is.
21. **Section 15 (verification)**: approved as-is.

---

## Out of scope (this spec, explicitly)

- **Implementation sequencing (P0–P4 from designplan §23)**: writing-plans skill.
- **Specific PR breakdown**: writing-plans skill.
- **Per-tool individual fixes**: tool audit (Section 14) output drives these.
- **New tool development**: separate spec.
- **Multi-language support**: separate spec.
- **Visual companion / mockups**: not produced for this session (per your earlier "audit + spec only" direction).
