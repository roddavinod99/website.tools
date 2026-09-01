# Architecture

## Overview

DevStackIO is a privacy-first developer tools platform built with Next.js 16. The core design principle is that **all tool processing happens in the client's browser** — no data is ever sent to a server.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      CDN (Cloudflare)                        │
├─────────────────────────────────────────────────────────────┤
│                   Nginx Reverse Proxy                        │
│  - SSL termination (TLS 1.2/1.3)                            │
│  - Rate limiting (3 zones)                                  │
│  - Static asset caching                                     │
│  - Security headers (including per-route hash-based CSP)    │
│  - Attack path blocking                                     │
├─────────────────────────────────────────────────────────────┤
│                  Next.js (PM2 Cluster x2)                    │
 │  ├── Static Pages (SSG) ── ~260 pages (164 tools, 8 categories, 25 blog posts, 28 guides, ~30 static) │
 │  ├── ISR ── sitemap.xml (24h revalidation)                  │
 │  ├── Dynamic ── API routes (DNS, IP, submit, contact)       │
 │  └── Middleware ── Rate limiter & security (middleware.ts)  │
├─────────────────────────────────────────────────────────────┤
│                  Client Browser                              │
│  ├── Web Workers ── Search, JSON, CSV, Hash                 │
│  ├── DOMPurify ── HTML/SVG sanitization                    │
│  ├── Fuse.js ── Fuzzy search in Web Worker                 │
│  └── Service Worker ── Offline caching (PWA)               │
└─────────────────────────────────────────────────────────────┘
```

## Key Design Decisions

### 1. Privacy by Design
All tool processing runs client-side using Web APIs. No file uploads or text inputs are sent to the server. This eliminates data privacy concerns and reduces server load.

### 2. Static-First Rendering
Tool pages use Static Site Generation (SSG) with `generateStaticParams`. This means:
- All 164 tool pages are pre-rendered at build time
- Instant page loads (no server processing)
- Excellent SEO (fully rendered HTML)
- Minimal server resource usage

### 3. Web Worker Architecture
Heavy computations (JSON parsing, CSV processing, hash generation) are offloaded to Web Workers to keep the UI responsive:
- **Worker Pool** — Generic pool manages up to 4 workers
- **Compute Worker** — JSON format/validate/minify, CSV parse, hash, text sort
- **Search Worker** — Fuse.js fuzzy search in background thread

### 4. API Layer
The API is minimal and focused on functionality that cannot run client-side:
- `/api/dns-lookup` — Server-side DNS resolution
- `/api/ip-lookup` — Server-side IP geolocation
- `/api/submit` — Form submission capture
- `/api/health` — Health check for monitoring

### 5. Security Layers
Security is implemented at multiple layers:
1. **Nginx** — SSL, rate limiting, attack blocking, **per-route hash-based CSP**
2. **Next.js Middleware** (middleware.ts) — Application-level rate limiting
3. **API Routes** — Input validation, sanitization, origin checking
4. **Client-side** — DOMPurify sanitization

### 6. Monetization (AdSense)
The platform uses **Google AdSense** for sustainable free access:

**Auto Ads** — Enabled globally via `AdSenseScript` component:
- Script loaded **via manual DOM injection** (`useEffect` + `document.createElement('script')`) with `lazyOnload` strategy (avoids `next/script` warning)
- Auto Ads config: `enable_page_level_ads: true`
- Handles: Anchor ads (mobile), Vignette ads (page transitions), Side rails (desktop widescreen), In-page banners, Multiplex ads

**Manual Ad Units** — React components for strategic placement:
- `AdBanner` — Horizontal responsive (728×90 / fluid)
- `InContentAd` — Rectangle in-content (336×280 / fluid)
- `SidebarAd` — Vertical sidebar (300×600 / fluid)
- `ResponsiveAd` — Auto-sizing for any container

**Development Mode** — Ads disabled when `NODE_ENV=development`, showing labeled placeholders for layout testing.

**Compliance** — Follows [AdSense Program Policies](https://support.google.com/adsense/answer/48182):
- Content-first: tools load before ads
- Clear separation from navigation/controls
- Responsive units with `data-full-width-responsive="true"`
- Unique slot IDs per placement
- Works with CMP for GDPR/CCPA consent

## User Experience Goals

The architecture above is the *means*; this section is the *end*. Every infra decision
on this page is in service of these four user-facing commitments. Use them as the test
for new features: if a change would violate one of them, find another way.

### 1. First-paint under 1 second
The home page sets `export const dynamic = "force-static"` (`src/app/page.tsx`) so every
visitor gets a pre-rendered HTML document before any JS runs. This is what keeps the
`First Contentful Paint` target below 1s on a cold connection.

### 2. Tool usable in 10 seconds
A first-time visitor on any tool page should be able to try the tool without bringing
their own input. The mechanism is the `Tool.examples` field in the registry:
- The tool page reads `tool.examples` and renders a `<TryExamples>` strip below the
  tool interface (`src/app/tools/[slug]/tool-client.tsx`).
- Clicking an example dispatches a `devstackio:load-example` `CustomEvent` with the
  example text.
- Tool components opt in with a one-line hook:
  `useLoadExample("tool-slug", (text) => setInput(text));`
  (defined in `src/lib/load-example.ts`).
The event-bus pattern works because the tool component is loaded lazily by
`dynamic-tool-loader.tsx` and therefore lives in a different React tree from the page —
a React context would not reach it, but a `window` event does. Tools that don't
subscribe to the event are unaffected.

### 3. Privacy promise visible in 5 seconds
"100% Client-Side", "Your Data Stays Local", and "No Account Required" are now rendered
**above the title** on every tool page (`src/app/tools/[slug]/tool-client.tsx`), not in
the footer. The promise is the moment-of-highest-intent claim, not an afterthought.

### 4. Searchable and findable in one click
The header mounts `Cmd+K` / `/` search and a Categories menu (`src/components/layout/header.tsx`).
The home page surfaces a lazy-loaded `ToolSearch` component with the full tool registry as
a client-side index, so suggestions are instant once the JS arrives.

## User-Facing Component Map

This complements the system-architecture diagram at the top. The infra diagram shows
where bytes flow; this one shows what a visitor sees and where the code that produces it
lives.

```
┌─────────────────────────────────────────────────────────────┐
│  Visitor lands on /                                         │
│  ─────────────────────                                       │
│  Layout:  src/app/layout.tsx                                 │
│    ├── Header (sticky)                                      │
│    │     src/components/layout/header.tsx                     │
│    │       ├── Logo · mainNav · CategoryMenu                 │
│    │       ├── Search trigger (Cmd+K / `/`)                  │
│    │       ├── Theme toggle                                  │
│    │       └── Keyboard shortcuts modal (?)                  │
│    ├── <main>                                                │
│    └── Footer                                                │
│          src/components/layout/footer.tsx                     │
│            (legal links, RSS, GitHub)                        │
│                                                              │
│  Home page: src/app/page.tsx                                 │
│    Hero → CategoriesSection → FeaturedTools → ToolsCta       │
│    (search, trust points, 8 most-used tools)                 │
│                                                              │
│  Tool page: src/app/tools/[slug]/page.tsx → tool-client.tsx  │
│    Breadcrumb → Trust badges → Title → Tags →                │
│      ToolInterface (lazy) → TryExamples → NextStepCTA →     │
│      ToolActions (Copy) → QuickLinks                         │
│    ...About · Features · How-to · Examples · FAQ ...         │
│    Sidebar: Related tools · Learning resources · SidebarAd   │
└─────────────────────────────────────────────────────────────┘
```

The map intentionally pairs each visible region with the file that renders it. When
someone asks "where does the trust badge live?", the answer is one line in this diagram.

## Performance Targets

| Metric | Target |
|--------|--------|
| Lighthouse Performance | ≥ 90 |
| Lighthouse Accessibility | ≥ 95 |
| Initial JS Bundle | ≤ 250 KB |
| Tool Bundle | ≤ 100 KB |
| Time to Interactive | < 2s |
| First Contentful Paint | < 1s |
