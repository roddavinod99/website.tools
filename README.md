# Website.Tools — Free Online Developer Tools

> **Privacy-first developer tools platform. 100% free. Zero data leaves your browser.**

[Live Demo](https://tools.devstackio.com) · [Privacy-First Developer Tools](https://tools.devstackio.com/about)

## ✨ Features

- **Developer Tools** — Formatters, validators, generators, converters, security tools, image utilities, and more
- **Privacy First** — All processing happens in your browser. No data is ever sent to a server
- **Fast** — Built with Next.js 16, Turbopack, and ISR for instant page loads
- **Mobile Friendly** — Fully responsive design that works on any device
- **No Login Required** — All tools are free and open, no account needed
- **Keyboard Shortcuts** — Power-user workflows for efficient tool access
- **PWA Ready** — Installable as a Progressive Web App with offline support
- **Accessible** — WCAG 2.2 AA compliant, keyboard navigable, screen reader friendly
- **Ad-Supported** — Google AdSense with Auto Ads for sustainable free access
- **⌘K Palette** — Instant tool search with synonyms, recents, and keyboard navigation
- **One-Click Examples** — Every tool has `Load example` with `autoRun` and shareable `?example=key` URLs
- **Per-Tool Audit** — `npm run audit:tools` gates CI (page loads, no console errors, examples populate, output produced)
- **Visual Baseline** — 11 snapshots (homepage/tool/category/listing/guide/blog/compare/search/404, light+dark)
- **Direct Share** — WhatsApp/X/Facebook/LinkedIn/Reddit/Pinterest/Telegram/Email with SVGRepo original-colour icons, app-intent URLs (`wa.me/?text=`, `twitter.com/intent/tweet`) + Copy + Web Share API (`src/components/tools/utilities/share-buttons.tsx`)
- **Illustrations** — Office-Club Duotone (Overflow Design 2026.09, single-user licence) recolored `#A0A0A0→var(--color-accent)` — `OcProjectDevelopment` in hero, `OcTarget` on 404 (`src/components/illustrations/`)

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- npm 10+

### Development

```bash
# Clone the repository
git clone https://github.com/roddavinod99/tools.git
cd tools

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## 🏗️ Architecture

### Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Icons | Lucide React |
| Fonts | Geist (Vercel) |
| Tool Processing | Client-side (Web APIs, Web Workers, `src/lib/load-example.ts` ready-gate) |
| Search | MiniSearch + Fuse.js in Web Worker (synonyms, `storeFields.text`) |
| Palette | `src/components/layout/search-overlay.tsx` (⌘K, recents) |
| UI Primitives | Preline 4.2 + Tailwind Forms (lazy `preline-provider.tsx`) |
| Ads | Google AdSense (Auto Ads + Manual Placements, `AdContainer` min-height) |
| Process Manager | PM2 cluster mode |
| Reverse Proxy | Nginx |
| Deployment | Oracle Cloud ARM64 (Ampere A1) |

### Rendering Strategy

- **Static Site Generation (SSG)** — Tool pages, category pages, blog posts, guides
- **Incremental Static Regeneration (ISR)** — Sitemap (24h revalidation)
- **Dynamic** — API routes, search endpoint
- **Client-side** — All tool logic runs in the browser

### Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── tools/[slug]/       # Individual tool pages (SoftwareApplication + BreadcrumbList)
│   ├── categories/[slug]/  # Category landing (top-6 ToolCard + see-all)
│   ├── tools/              # Listing 2+8+2 FilterRail + ToolGrid (24/page)
│   ├── compare/[slug]/     # Curated comparisons + auto buildCompare
│   ├── api/                # Server endpoints (currency-rates)
│   └── admin/audit/        # Audit dashboard
├── components/
│   ├── tools/              # 172 tool interfaces + example-url-listener
│   ├── ui/                 # Prose, Breadcrumb, TrustPills, ToolCard, Badge
│   ├── layout/             # Header (CategoriesMegaMenu 640px), Footer 4-col, search-overlay (⌘K)
│   ├── listings/           # FilterRail (sticky) + ToolGrid (24)
│   ├── home/               # hero (trending 8), conversions-rail, recently-added
│   ├── ads/                # AdSense (AdContainer min-height, no CLS)
│   └── providers/          # preline-provider (lazy autoInit)
├── lib/
│   ├── data/               # tools.ts 172, categories.ts 12, site-config
│   ├── seo/                # tool-metadata, lastmod (git), json-ld, landing-pages
│   ├── search/             # synonyms + MiniSearch ranking (storeFields.text)
│   ├── links/related.ts    # getRelatedTools Jaccard + sameCat + pop
│   ├── compare/            # buildCompare + hints
│   ├── examples/           # normalize + loader (text/object, ready⟹subscribed)
│   ├── load-example.ts     # dispatchLoadExample + useLoadExample (200ms)
│   └── version/            # release-data
├── workers/search.worker.ts # Fuse.js + synonyms
├── proxy.ts                # Rate limiter + security (Next 16 proxy, ex-middleware.ts)
└── types/                  # Tool, Category, ToolContent
scripts/
├── tool-audit.mjs          # per-tool Playwright audit (AUDIT_BASE_URL)
├── post-rebuild-smoke.mjs  # bundle-diff + lighthouse placeholder
├── build-audit-dashboard.mjs # public/admin/audit.html
├── measure-route-js.mjs    # per-route 250KB
└── seo-audit.mjs           # 99/100
```

## 🛡️ Security

Security is a core design principle. See [SECURITY.md](SECURITY.md) for the full security policy.

### Key Security Features

- **Content Security Policy** — Build-time per-route SHA-256 hash CSP served by Nginx + `proxy.ts` (`strict-dynamic`, `require-trusted-types-for`) (no nonces; no `unsafe-inline`)
- **HTTP Security Headers** — HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, COOP, CORP
- **Rate Limiting** — Three-tier in-memory rate limiter + Nginx rate limiting zones
- **Input Validation** — All API inputs validated, sanitized, and size-limited
- **SSRF Protection** — DNS hostname validation, private IP blocking, Content-Type enforcement
- **XSS Prevention** — DOMPurify with strict allowlist for all HTML/SVG rendering
- **File Upload Hardening** — MIME validation, magic byte checks, zip bomb detection
- **Process Isolation** — Runs as non-root user with restricted privileges

## 📢 Ad Implementation

This project uses Google AdSense for sustainable free access:

### Ad Strategy
- **Auto Ads** — Google automatically places optimized ads (anchor, vignette, side rail, in-page)
- **Manual Placements** — Strategic banner and in-content ads following Google's best practices
- **Privacy Compliant** — No user data sent to AdSense; all tool processing remains client-side

### Ad Components
- `AdSenseScript` — Loads AdSense JS **via manual DOM injection** (`useEffect` + `document.createElement('script')`) with `lazyOnload` strategy (avoids `next/script` warning)
- `AdBanner` — Horizontal banner ads (728x90 / responsive)
- `InContentAd` — Rectangle ads within content (336x280 / responsive)
- `ResponsiveAd` — Auto-sizing ad units
- `SidebarAd` — Vertical sidebar ads (300x600) for desktop

### Placement Guidelines (Google Best Practices)
- Ads placed between content sections, not interrupting tool usage
- Clear visual separation from content
- No ads near navigation or action buttons
- Mobile-first responsive sizing
- Compliance with [Better Ads Standards](https://www.betterads.org/standards/)

### Environment Variables
```bash
NEXT_PUBLIC_ADSENSE_PUBLISHER_ID=ca-pub-XXXXXXXXXXXXXXXX  # Required for production
```

## 🔧 Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start development server |
| `npm run build` | Production build (runs `prebuild` + `postbuild-csp` + `build-search-index`) |
| `npm start` | Start production server (`node .next/standalone/server.js`) |
| `npm run lint` | ESLint check (local `no-hardcoded-colors` `no-nested-card` `no-rounded-lg`) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | Run Playwright test suite |
| `npm run test:unit` | Vitest (bundle-size, synonyms, prose, links) |
| `npm run test:tools` | Playwright data-driven `tests/tools.spec.ts` 172 tools |
| `npm run test:a11y` | Axe WCAG 2.2 AA (`tests/a11y/page-types.spec.ts` 40) |
| `npm run test:seo` | `tests/seo-structured-data.spec.ts` 5 |
| `npm run test:snapshots` | Visual snapshots 11 `redesign/` |
| `npm run audit:tools` | Per-tool audit (`scripts/tool-audit.mjs`, `AUDIT_BASE_URL`) |
| `npm run smoke` | Post-rebuild `bundle-diff.json` + `lighthouse-*.html` (`scripts/post-rebuild-smoke.mjs`) |
| `npm run dashboard` | `public/admin/audit.html` (`scripts/build-audit-dashboard.mjs`) |
| `npm run signoff` | 6 checks `lint/typecheck/build/unit/tools/seo` (`scripts/release-signoff.mjs`) |
| `npm run seo:audit` | Run SEO audit 99/100 (`scripts/seo-audit.mjs`) |
| `npm run sitemap:submit` | Submit sitemap to IndexNow (`api.indexnow.org`) |
| `npm run version` | Interactive release CLI |
| `npm run version:auto` | Auto version from conventional commits |
| `npm run clean` | Remove build artifacts (`.next/`, `wasm/target/`, test dirs) |
| `npm run analyze` | Bundle analyzer report |

## 📦 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy (PM2)

```bash
npm ci
npm run build
pm2 start ecosystem.config.js
```

### Environment Variables

See [`.env.example`](.env.example) for all available configuration options.

## 🧑‍💻 Project Status

Website.Tools is a **personal, solo-maintained project** funded entirely by
advertising (AdSense). Ad, sponsor, and donation revenue is retained by the
owner and is **not shared**.

- **Sole maintainer:** roddavinod99
- **Governance:** [MAINTAINERS.md](MAINTAINERS.md)
- **Contribution policy:** [CONTRIBUTING.md](CONTRIBUTING.md) — external
  contributions are generally not accepted.
- **Code of conduct:** [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- **Report issues / request features:** paid users and supporters may use the
  GitHub issues tab at your discretion.

## 📄 License

MIT — See [LICENSE](LICENSE) for details.