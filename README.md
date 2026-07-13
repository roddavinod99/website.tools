# DevStackIO — Free Online Developer Tools

128 free, privacy-first developer tools built with Next.js 16. All processing happens in your browser — no data ever leaves your device.

**→ https://tools.devstackio.com**

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI:** shadcn/ui + Lucide Icons
- **Fonts:** Geist (Vercel)
- **Processing:** Client-side — all 128 tools use Web APIs, no server-side computation
- **Container:** Docker (multi-stage, non-root) + PM2 cluster mode

## Quick Start

```bash
npm install
npm run dev        # http://localhost:3000
```

### Production

```bash
npm run build
npm start          # http://localhost:3000
```

### Docker

```bash
docker build -t devstackio .
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SITE_URL=https://tools.devstackio.com \
  devstackio
```

## Architecture

### Pages (139 total)

| Type | Routes | Examples |
|------|--------|---------|
| Static (`○`) | `/`, `/about`, `/tools`, `/blog`, etc. | Prerendered at build time |
| SSG (`●`) | `/tools/[slug]`, `/blog/[slug]`, etc. | 128 tools, 5 blog posts, 7 categories, 7 toolkits, 10 guides/learning paths |
| ISR (`●` + revalidate) | `/sitemap.xml` | Revalidated every 24h — no rebuild needed |
| Dynamic (`ƒ`) | `/search`, `/api/*` | Server-rendered on demand |

### Rendering Strategy

- **Tool/category/guide/blog pages:** Static Site Generation (SSG) via `generateStaticParams`
- **Sitemap:** Incremental Static Regeneration (ISR) with `revalidate: 86400` — avoids nightly rebuilds
- **API routes:** Dynamic — `/api/dns-lookup`, `/api/ip-lookup`, `/api/submit`
- **Search:** Dynamic — full-text search across all tool names, descriptions, and content

## Project Structure

```
src/
  app/
    tools/[slug]/        # 128 individual tool pages (SSG)
    categories/[slug]/   # 7 category listing pages (SSG)
    guides/[slug]/       # 10 developer guide pages (SSG)
    learning/[slug]/     # 10 learning topic pages (SSG, redirect to /guides/[slug])
    blog/[slug]/         # 5 blog post pages (SSG)
    toolkits/[slug]/     # 7 toolkit pages (SSG)
    api/                 # Server endpoints (DNS, IP, form submit, contact, health)
    popular/             # Popular tools listing
    new/                 # New tools listing
    tutorials/           # Tutorial pages
    best-practices/      # Best practices pages
    changelog/           # Changelog page
    roadmap/             # Roadmap page
    status/              # Status page
    contact/             # Contact page
    suggest/             # Suggest a tool
    feature-request/     # Feature request form
    feedback/            # Feedback form
    report-bug/          # Bug report form
    support/             # Support page
    about/               # About page
    privacy/             # Privacy policy
    terms/               # Terms of service
    cookie-policy/       # Cookie policy
    disclaimer/          # Disclaimer
    ads.txt/             # AdSense ads.txt
    feed.xml/            # RSS feed
    sitemap/              # Sitemap index
    sitemap.ts           # XML sitemap with ISR revalidation
    robots.ts            # Crawl rules + sitemap URL
  components/
    tools/               # Interactive tool interfaces
    ui/                  # Reusable UI components (shadcn/ui)
    layout/              # Header, Footer, Analytics
    toolkits/            # Toolkit group pages
    ads/                 # Ad components
    home/                # Homepage components
    legal/               # Legal page components
    theme/               # Theme components
  lib/
    constants.ts         # Site config, all 128 tools, categories, learning topics
    tool-content.ts      # Tool descriptions, use cases, who-should-use
    toolkits.ts          # Toolkit definitions
    blog.ts              # Blog post metadata and content loading
    sanitize.ts          # DOMPurify wrapper (HTML/SVG allowlist)
    utils.ts             # Utility functions
  types/
    index.ts             # TypeScript types (Tool, Category, SiteConfig, NavItem)
  content/
    blog/                # Blog post markdown files
  proxy.ts               # Rate limiter middleware (Next.js 16 proxy convention)
public/
  .well-known/
    security.txt         # RFC 9116 security contact & disclosure policy
  llms.txt               # LLM/AI discovery context file
  og.png                 # Open Graph image (1200×630)
  favicon.svg            # SVG favicon
scripts/
  sitemap-submitter.mjs  # Cron-based sitemap submission to search engines
  seo-audit.mjs          # SEO audit tool
  production-readiness.mjs  # Production readiness gate (10 checks)
  setup-cron.sh          # Ubuntu crontab installer for daily UTC 00:00 run
  lib/                   # Shared script utilities
data/
  .gitkeep               # Runtime state directory (sitemap hashes, logs)
  submissions/
    .gitkeep             # Form submission storage (auto-created on first POST)
.next/                   # Build output (gitignored)
```

## API Endpoints

| Endpoint | Method | Purpose | Protection |
|----------|--------|---------|------------|
| `/api/dns-lookup` | GET | DNS record lookup (A, AAAA, MX, NS, TXT, CNAME, SOA) | Regex-validated hostnames, DNS type allowlist, 200-entry cache |
| `/api/ip-lookup` | GET | IP geolocation & network info | `net.isIPv4` validation, private IP blocklist, 200-entry cache |
| `/api/submit` | POST | Form submissions (suggest, feedback, feature-request, report-bug, newsletter) | Origin/referer check, JSON Content-Type, 10KB body limit, input sanitization, IP redacted, 500-entry disk quota |
| `/api/contact` | POST | Contact form submissions | Origin/referer check, input sanitization, rate limiting |
| `/api/health` | GET | Health check endpoint | None (public) |

## Security

- **CSP:** 9-directive policy — `default-src 'self'`, `script-src 'self' 'unsafe-inline' 'unsafe-eval'` plus Google Tag Manager/Analytics, AdSense, Cloudflare Insights; configured in `next.config.ts`
- **HSTS:** `max-age=63072000; includeSubDomains; preload` — configured in `next.config.ts`
- **COOP/CORP:** `Cross-Origin-Opener-Policy: same-origin`, `Cross-Origin-Resource-Policy: same-origin`
- **SSRF protection:** DNS hostname regex validation, IPv4-only + private-range blocking, Content-Type enforcement, body size limits
- **XSS protection:** All `dangerouslySetInnerHTML` usages wrapped with DOMPurify (HTML + SVG allowlist)
- **Rate limiting:** `proxy.ts` middleware — 5 req/min on submit, 100 req/min on other APIs, per-IP per-path, stale eviction, Retry-After headers
- **Form submissions:** IP addresses redacted, max 500 entries on disk with auto-purge
- **Container:** Non-root `nextjs` user, `--read-only` root filesystem (Docker runtime flag)

## Sitemap & Search Engine Submission

The sitemap at `/sitemap.xml` uses ISR (revalidates every 24 hours). A cron script (`scripts/sitemap-submitter.mjs`) runs daily and:

1. Fetches the sitemap via two-pass ISR trigger (first fetch triggers revalidation, 5s wait, second gets fresh content)
2. Normalizes XML (strips `lastmod`), hashes content, compares with previous state
3. Submits to Google, Bing, and Yandex when content changes or ≥5 days elapsed
4. Optionally submits via IndexNow (requires `INDEXNOW_KEY` env var + `/{key}.txt` on server)
5. Cleans `.next` cached sitemap files after verification

**Setup on server:**
```bash
sudo ./scripts/setup-cron.sh    # Installs cron job (daily UTC 00:00)
```

## AI Discovery

| File | Purpose |
|------|---------|
| `/llms.txt` | LLM context file — categorized tool index with usage guidelines |
| `/robots.txt` | Default crawl rules (`*` allows all, disallows `/api/`, `/contact/success`, `/admin/`) |

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_SITE_URL` | Yes | — | Canonical site URL (`https://tools.devstackio.com`) |
| `NEXT_PUBLIC_GA_ID` | No | `""` | Google Analytics measurement ID (empty = disabled) |
| `NEXT_PUBLIC_ADSENSE_PUBLISHER_ID` | No | `""` | Google AdSense publisher ID (empty = disabled) |
| `NEXT_PUBLIC_CONTACT_EMAIL` | No | `contact@devstackio.com` | Contact email displayed on the contact page |
| `PORT` | No | `3000` | Server port |
| `DISABLE_RATE_LIMIT` | No | `false` | Set `true` behind a reverse proxy with its own rate limiting |
| `INDEXNOW_KEY` | No | — | IndexNow API key for Bing/Yandex/Seznam submission |

## Deployment

### PM2 (recommended for VPS/Ubuntu)

```bash
npm run build
npm start
```

PM2 config is at `ecosystem.config.js` — cluster mode (2 instances), 500 MB max memory, automatic restart with backoff.

### Docker

```bash
docker build -t devstackio .
docker run -d -p 3000:3000 --restart unless-stopped \
  -e NEXT_PUBLIC_SITE_URL=https://tools.devstackio.com \
   -e NEXT_PUBLIC_GA_ID=G-Y02LPSJJCZ \
  devstackio
```

**Minimum requirements:** 1 GB RAM, 5 GB storage, Node.js 20+. Handles 10,000+ daily visitors.

## Adding a New Tool

1. Add the tool definition to `src/lib/constants.ts` in the `allTools` array
2. Create the interactive tool component in `src/components/tools/`
3. Add tool content in `src/lib/tool-content.ts`
4. Add sanitized `dangerouslySetInnerHTML` if rendering user-like content (wrap with `sanitize()`)
5. The tool page is auto-generated via `generateStaticParams` — no routing changes needed

## License

MIT
