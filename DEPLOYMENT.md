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

```bash
# 1. Clone repository
git clone https://github.com/roddavinod99/tools.git /var/www/tools

# 2. Create environment file
cp .env.example .env
# Edit .env with production values
nano .env

# 3. Install dependencies
cd /var/www/tools
npm ci

# 4. Build
npm run build

# 5. Prepare standalone output
mkdir -p .next/standalone/.next
cp -r .next/static .next/standalone/.next/
cp -r public .next/standalone/

# 6. Start with PM2
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
