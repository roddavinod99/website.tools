# Deployment Guide

## Prerequisites

- **Server**: Oracle Cloud ARM64 (Ampere A1) — Ubuntu 24.04
- **Node.js**: 20+ (LTS)
- **PM2**: `npm install -g pm2`
- **Nginx**: `apt install nginx`
- **SSL**: Let's Encrypt (`certbot`)
- **Domain**: `tools.devstackio.com`

## Infrastructure

```
Internet → Nginx (443) → PM2 Cluster (2x instance, port 3000)
              ↓                       ↓
         SSL/TLS 1.2/1.3        Next.js Standalone
              ↓                       ↓
         Rate Limiting          137 SSG Pages
              ↓                       ↓
         Attack Blocking        API Routes
```

## Environment Setup

Environment variables are automatically injected during CI/CD deployment from
GitHub Secrets (`.github/workflows/deploy.yml`). No manual `.env` setup needed.

> **Important**: CI runs `npm ci` which requires `package-lock.json` to be in sync with `package.json`. Always run `npm install` locally and commit the updated lock file when changing dependencies. Out-of-sync lock files cause CI failures with `npm error code EUSAGE`.

Required GitHub Secrets (set once in repo Settings → Secrets and variables → Actions):

| Secret | Description | Example |
|--------|-------------|---------|
| `ORACLE_HOST` | Server IP | `192.168.1.1` |
| `ORACLE_USER` | SSH user | `ubuntu` |
| `ORACLE_SSH_KEY` | SSH private key | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `NEXT_PUBLIC_GA_ID` | Google Analytics ID (optional) | `G-XXXXXXXXXX` |
| `NEXT_PUBLIC_ADSENSE_PUBLISHER_ID` | AdSense ID (optional) | `ca-pub-XXXXXXXXXXXXXXXX` |
| `IP_HASH_SALT` | 64-char hex salt | `openssl rand -hex 32` output |

## AdSense Configuration

The platform uses **Google AdSense Auto Ads** for automatic ad placement optimization.

### Setup

1. **Create AdSense Account** — [Google AdSense](https://www.google.com/adsense/start/)
2. **Add Site** — Add `tools.devstackio.com` to your AdSense account
3. **Get Publisher ID** — Format: `ca-pub-XXXXXXXXXXXXXXXX`
4. **Configure Auto Ads** — In AdSense dashboard:
   - Enable **Auto ads** for the site
   - Enable **Overlay formats**: Anchor ads, Vignette ads, Side rails
   - Enable **In-page formats**: Banner ads, Multiplex ads, Related search
   - Configure **Ad load** and **Excluded areas** as needed
4. **Add to GitHub Secrets** — Add `NEXT_PUBLIC_ADSENSE_PUBLISHER_ID` to repo secrets

### How It Works

The implementation (`src/components/ads/adsense-script.tsx`):

- Loads AdSense script with `afterInteractive` strategy
- Enables **Auto Ads** via `enable_page_level_ads: true`
- Provides **manual ad units** as React components for strategic placement:
  - `AdBanner` — Horizontal responsive banner (728x90 / fluid)
  - `InContentAd` — Rectangle in-content (336x280 / fluid)
  - `SidebarAd` — Vertical sidebar (300x600 / fluid)
  - `ResponsiveAd` — Auto-sizing for any container

### Ad Placement Strategy

| Page Type | Placements |
|-----------|------------|
| **Home** | After Hero, after Featured Tools, after Learning Section |
| **Tool Pages** | After tool interface, after How-to, after Best Practices, after FAQ, after Learning Resources |
| **Tools Listing** | After header, middle of grid (50% mark) |
| **Category Pages** | After header, middle of grid (50% mark) |

All placements follow [Google AdSense Best Practices](https://support.google.com/adsense/answer/1282097):
- Content-first (ads don't block tool functionality)
- Clear separation from navigation/controls
- Responsive units adapt to mobile/desktop
- Auto Ads handle overlay formats (anchors, vignettes, side rails)

### Development Mode

Ads are **disabled in development** (`NODE_ENV=development`). Placeholders show ad dimensions for layout testing.

### Compliance

- No misleading labels (ads only labeled "Advertisements" or "Sponsored links")
- No ads disguised as content or navigation
- Respects AdSense Program Policies
- Works with Consent Management Platform (CMP) for GDPR/CCPA

## One-time server setup (manual, first deploy only):

```bash
# 1. Clone repository
git clone https://github.com/roddavinod99/tools.git /var/www/tools

# 2. Install Node.js and PM2
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo bash -
sudo apt install -y nodejs
npm install -g pm2

# 3. Create initial .env (required for first build)
cp .env.example .env
nano .env

# 5. Build for first time
npm run build

# 6. Prepare standalone output
mkdir -p .next/standalone/.next
cp -r .next/static .next/standalone/.next/
cp -r public .next/standalone/

# 7. Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Nginx Configuration

```bash
# 1. Copy production config
sudo cp /var/www/tools/nginx/nginx.prod.conf.example /etc/nginx/sites-available/tools
sudo nano /etc/nginx/sites-available/tools
# Replace placeholders: ${DOMAIN}, ${APP_HOST}, ${DNS_RESOLVER}

# 2. Enable site
sudo ln -s /etc/nginx/sites-available/tools /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## SSL Certificate

```bash
sudo certbot --nginx -d tools.devstackio.com
```

## GitHub Secrets for CI/CD

| Secret | Description |
|--------|-------------|
| `ORACLE_HOST` | Oracle Cloud server IP address |
| `ORACLE_USER` | SSH username (e.g., `ubuntu`) |
| `ORACLE_SSH_KEY` | Private SSH key (PEM format) |
| `ORACLE_PORT` | SSH port (default: 22) |

## Post-Deployment Checklist

- [ ] SSL certificate valid: `curl -I https://tools.devstackio.com`
- [ ] Health endpoint OK: `curl https://tools.devstackio.com/api/health`
- [ ] Sitemap accessible: `curl https://tools.devstackio.com/sitemap.xml | head`
- [ ] Security headers present: `curl -I https://tools.devstackio.com`
- [ ] Rate limiting active: `ab -n 100 -c 10 https://tools.devstackio.com/api/health`
- [ ] Cron jobs installed: `sudo crontab -l`
- [ ] PM2 processes running: `pm2 status`
- [ ] Logs directory writable: `ls -la /var/www/tools/logs/`
- [ ] Production readiness: `npm run production:readiness`
- [ ] Sitemap submitted: `npm run sitemap:submit`

## Monitoring

### PM2 Monitoring
```bash
pm2 monit           # Real-time CPU/memory
pm2 logs            # Application logs
pm2 status          # Process status
```

### Nginx Monitoring
```bash
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Health Checks
```
GET /api/health → { status: "ok", healthy: true, uptime: ..., memory: {...} }
```

## Updating

```bash
cd /var/www/tools
git pull origin main
npm ci
npm run build
mkdir -p .next/standalone/.next
cp -r .next/static .next/standalone/.next/
cp -r public .next/standalone/
pm2 restart devstackio
```

## Rolling Back

```bash
cd /var/www/tools
git log --oneline -5
git reset --hard <previous-commit>
npm ci
npm run build
[repeat standalone prep]
pm2 restart devstackio
```

## Scaling

The PM2 config runs 2 cluster instances by default. To scale:

```bash
# Scale to 4 instances
pm2 scale devstackio 4

# Or update ecosystem.config.js and restart
# instances: 4
pm2 restart devstackio
```

## Troubleshooting

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for common issues and solutions.
