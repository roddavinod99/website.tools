# Deployment Guide

## Prerequisites

- Node.js 20+
- Docker + Docker Compose (for containerized deployment)
- Domain: `tools.devstackio.com`
- SSL certificates (Let's Encrypt)

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SITE_URL` | Yes | Production URL (no trailing slash) |
| `NEXT_PUBLIC_GA_ID` | No | Google Analytics 4 measurement ID |
| `NEXT_PUBLIC_ADSENSE_PUBLISHER_ID` | No | Google AdSense publisher ID |
| `NEXT_PUBLIC_CONTACT_EMAIL` | No | Contact email displayed on the contact page |
| `PORT` | No | Server port (default: 3000) |
| `DISABLE_RATE_LIMIT` | No | Set `true` behind a reverse proxy with its own rate limiting |
| `INDEXNOW_KEY` | No | IndexNow API key for Bing/Yandex/Seznam sitemap submission |

## Option A: Docker (Recommended)

```bash
# Clone and configure
git clone <repo-url> ~/tools
cd ~/tools
cp .env.example .env.local

# Edit .env.local with your values
nano .env.local

# Build and start
docker compose up -d --build

# Verify
docker compose ps
curl -I http://localhost:3000
```

### SSL Setup (First Time)

```bash
# Install certbot on host
sudo apt install certbot

# Stop nginx temporarily
docker compose stop nginx

# Generate certificates
sudo certbot certonly --standalone -d tools.devstackio.com

# Start nginx
docker compose up -d nginx
```

### Updating

```bash
cd ~/tools
git pull origin main
docker compose down
docker compose build --no-cache
docker compose up -d
```

## Option B: PM2 (Bare Metal / VM)

```bash
# Build
npm ci
npm run build

# Create logs directory
mkdir -p logs

# Start with PM2
NEXT_PUBLIC_SITE_URL=https://tools.devstackio.com pm2 start ecosystem.config.js

# Save PM2 process list and configure startup
pm2 save
pm2 startup

# Monitor
pm2 monit
```

### PM2 Updating

```bash
cd ~/tools
git pull origin main
npm ci
npm run build
pm2 restart devstackio
```

## Option C: Vercel

1. Connect repo to Vercel
2. Add env vars in Vercel dashboard
3. Deploy — `output: "standalone"` is already configured in `next.config.ts`

## CI/CD Pipeline

Pushes to `main` automatically trigger:

1. **Validation job** — lint + build
2. **Deploy job** — SSH into Oracle Cloud, pull changes, rebuild containers, verify health

### Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `ORACLE_HOST` | Oracle Cloud server IP/hostname |
| `ORACLE_USER` | SSH username (e.g., `ubuntu`) |
| `ORACLE_SSH_KEY` | Private SSH key for authentication |

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
- **Nginx 502**: Check that the app container is healthy: `docker compose ps`
- **SSL errors**: Verify certificates exist at `/etc/letsencrypt/live/tools.devstackio.com/`
- **Memory issues**: Check `docker compose stats` or `pm2 monit`; adjust limits in `docker-compose.yml` or `ecosystem.config.js`
