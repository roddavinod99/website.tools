# Nginx Configuration

Production and development reverse proxy configurations for the Website.Tools platform.

## Files

| File | Purpose |
|------|---------|
| `nginx.prod.conf.example` | Production template with placeholders |
| `nginx.dev.conf` | Local development proxy |

## Quick Start

### Production

```bash
cp nginx.prod.conf.example nginx.prod.conf
# Edit nginx.prod.conf — replace all ${DOMAIN}, ${APP_HOST}, ${DNS_RESOLVER}
sudo cp nginx.prod.conf /etc/nginx/nginx.conf
sudo nginx -t && sudo systemctl reload nginx
```

### Development

```bash
sudo cp nginx.dev.conf /etc/nginx/nginx.conf
sudo nginx -t && sudo systemctl reload nginx
```

## Template Variables

| Variable | Example | Description |
|----------|---------|-------------|
| `${DOMAIN}` | `example.com` | Your site domain |
| `${APP_HOST}` | `127.0.0.1` | App server address (Docker container or localhost) |
| `${DNS_RESOLVER}` | `1.1.1.1 1.0.0.1` | DNS resolvers for OCSP stapling |

## What This Config Provides

- **Rate Limiting**: 10r/s general API, 2r/s submit, 0.5r/s contact
- **Connection Limits**: 20 concurrent per IP
- **Security Headers**: HSTS, CSP, X-Frame-Options, COOP, CORP, Permissions-Policy
- **Attack Blocking**: Path traversal, WP scans, common exploit paths
- **Bad User-Agent Blocking**: Known scanners and bots
- **SSL Hardening**: TLS 1.2+, OCSP stapling, session tickets off
- **Static Asset Caching**: 1 year for Next.js static, 30 days for media
- **File Upload Limits**: 10MB max

## Deploying to Oracle Cloud ARM

```bash
# On your server
cd /etc/nginx
sudo cp nginx.conf nginx.conf.bak
sudo nano nginx.conf  # paste your config
sudo nginx -t
sudo systemctl reload nginx
```

## Notes

- `unsafe-eval` in CSP is required for the BenchmarkBuilder tool
- `X-XSS-Protection` has been removed (obsolete, ignored by modern browsers)
- The `if` blocks for user-agent and path blocking are safe for simple pattern matching
