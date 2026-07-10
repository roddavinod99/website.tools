# Deployment Guide

## Prerequisites

- Node.js 20+
- Docker (for containerized deployment)
- Domain: `tools.devstackio.com`

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SITE_URL` | Yes | Production URL (no trailing slash) |
| `NEXT_PUBLIC_GA_ID` | No | Google Analytics 4 measurement ID |
| `DISABLE_RATE_LIMIT` | No | Set `true` behind a reverse proxy with its own rate limiting |
| `INDEXNOW_KEY` | No | IndexNow API key for Bing/Yandex/Seznam sitemap submission |

## Option A: Docker

```bash
# Build
docker build -t devstackio-tools .

# Run
docker run -d \
  --name devstackio \
  -p 3000:3000 \
  -e NEXT_PUBLIC_SITE_URL=https://tools.devstackio.com \
  -e NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX \
  -v /host/path/data:/app/data \
  devstackio-tools
```

Data directory (`data/`) is mounted for persistent submissions and SEO reports.

## Option B: PM2 (bare metal / VM)

```bash
# Build
npm run build

# Start
NEXT_PUBLIC_SITE_URL=https://tools.devstackio.com pm2 start ecosystem.config.js
```

## Option C: Vercel

1. Connect repo to Vercel
2. Add env vars in Vercel dashboard
3. Deploy — `vercel.json` handles config

## Production Readiness Gate

Before deploying, run the production readiness report:

```bash
npm run production:readiness
```

This runs 10 checks (build, TypeScript, lint, SEO, a11y, security, dependencies, bundle size, health endpoint, deployment config) and produces a unified PASS/FAIL report. Deploy only when `Ready for Production: YES`.

Reports are written to `data/production-readiness/` as JSON + HTML.

## Post-Deploy Checklist

```bash
# 1. Verify site is live
curl -I https://tools.devstackio.com

# 2. Check health endpoint
curl https://tools.devstackio.com/api/health

# 3. Check sitemap
curl https://tools.devstackio.com/sitemap.xml | head

# 4. Run production readiness gate (live)
npm run production:readiness

# 5. Submit sitemap to search engines
npm run seo:audit:submit --mode=live

# 6. Set up daily cron
sudo ./scripts/setup-cron.sh
```

## Register in Search Consoles

- Google Search Console — add domain `tools.devstackio.com`
- Bing Webmaster Tools — add site, verify ownership

## Cron Setup

The cron job (`scripts/setup-cron.sh`) runs daily at UTC 00:00 and:
1. Runs SEO audit against the live site
2. Submits sitemap to Google, Bing, Yandex, IndexNow
3. Writes reports to `data/seo-reports/`

## Troubleshooting

- **Rate limiting errors**: Set `DISABLE_RATE_LIMIT=true` behind a reverse proxy. The in-memory rate limiter is per-process — it works for single-instance but not PM2 clusters or serverless. Long-term, use **Redis** as a shared store or let **Cloudflare** handle rate limiting at the edge.
- **CSS/JS not loading in container**: Verify `output: "standalone"` in `next.config.ts`
- **Sitemap stale**: ISR regenerates every 24h on request
