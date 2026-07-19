# Troubleshooting Guide

## Common Issues

### Build Failures

**Problem**: `npm run build` fails with TypeScript errors.

**Solutions**:
1. Check TypeScript version: `npx tsc --version` (should be 5.x)
2. Clear TypeScript cache: delete `tsconfig.tsbuildinfo` and `.next/`
3. Run typecheck: `npx tsc --noEmit` to see all errors
4. Check for missing types: `npm ls @types/node @types/react`

**Problem**: Build succeeds locally but fails in CI.

**Solutions**:
1. Check Node.js version matches CI (`NODE_VERSION: "20"` in deploy.yml)
2. Run `npm ci` instead of `npm install` (clean install)
3. Check for platform-specific dependencies

**Problem**: CI fails with `npm error code EUSAGE` / `lock file's sharp@0.34.5 does not satisfy sharp@0.35.3`.

**Root cause**: `package-lock.json` is out of sync with `package.json`. This happens when `package.json` is edited (e.g., dependency version bump) but `npm install` is not re-run to update the lock file. CI uses `npm ci` which strictly requires lock file accuracy.

**Solutions**:
1. Run `npm install` locally to regenerate `package-lock.json`
2. Commit the updated `package-lock.json`
3. Verify: `node -e "const lock = require('./package-lock.json'); console.log(lock.packages['node_modules/sharp'].version);"` should match your `package.json` version

### Bundle Size Budget Failures

**Problem**: Vitest bundle-size test fails with `expected [ …(1) ] to have a length of +0 but got 1`.

**Root cause**: A JavaScript chunk exceeds the 500 KB budget. This happens when a large library (highlight.js, mathjs) is imported without tree-shaking.

**Solutions**:
1. Check which library is oversized:
   ```bash
   node -e "const fs = require('fs'); const c = fs.readFileSync('.next/static/chunks/' + fs.readdirSync('.next/static/chunks').filter(f => f.endsWith('.js')).map(f => ({n:f,s:fs.statSync('.next/static/chunks/'+f).size})).sort((a,b)=>b.s-a.s)[0].n, 'utf8'); ['highlight','mathjs','dompurify','crypto-js'].forEach(p => { const m = c.match(new RegExp(p,'g')); if(m) console.log(p, m.length); });"
   ```
2. If highlight.js is oversized: use `src/lib/highlight-lazy.ts` instead of `import("highlight.js")` — it loads core + only 25 common languages via tree-shakeable static imports
3. If mathjs is oversized: use `src/lib/math-lite.ts` instead of `import("mathjs").then(({create, all}) => ...)` — it imports only 27 specific function dependencies instead of the 371+ "all" preset

### Deployment Issues

**Problem**: Nginx 502 Bad Gateway.

**Solutions**:
1. Check if app is running: `pm2 status`
2. Check app logs: `pm2 logs devstackio`
3. Verify Nginx upstream: `curl http://localhost:3000/api/health`
4. Check Nginx logs: `tail -f /var/log/nginx/error.log`
5. Restart PM2: `pm2 restart devstackio`

**Problem**: HTTP 429 Too Many Requests.

**Solutions**:
1. Check rate limit configuration in `nginx/nginx.prod.conf`
2. Set `DISABLE_RATE_LIMIT=true` if behind Cloudflare
3. Verify client IP is forwarded correctly (X-Forwarded-For header)

**Problem**: SSL certificate expired.

**Solutions**:
1. Check expiration: `sudo certbot certificates`
2. Renew: `sudo certbot renew`
3. Verify auto-renewal: `sudo certbot renew --dry-run`
4. Check cron: `systemctl status certbot.timer`

### Runtime Issues

**Problem**: CSS/JS not loading.

**Solutions**:
1. Verify `output: "standalone"` in `next.config.ts`
2. Check `public/` directory is copied to `standalone` build
3. Clear browser cache (hard reload)
4. Check Nginx cache headers

**Problem**: Memory usage too high.

**Solutions**:
1. Check current usage: `pm2 monit`
2. Increase memory limit in `ecosystem.config.js`: `max_memory_restart: "1G"`
3. Reduce PM2 instances: change `instances: 2` to `instances: 1`
4. Check for memory leaks: `pm2 logs --lines 100`
5. Set up monitoring: `pm2 install pm2-server-monit`

**Problem**: Tools not loading/blank screen.

**Solutions**:
1. Check browser console for JavaScript errors
2. Clear browser cache and cookies
3. Try incognito/private mode
4. Check if ad blocker is blocking tool scripts
5. Update browser to latest version

**Problem**: Sitemap not updating.

**Solutions**:
1. ISR revalidates on first request after 24h
2. Trigger manually: `curl https://tools.devstackio.com/sitemap.xml`
3. Check cache: ISR uses `stale-while-revalidate`
4. Run sitemap submission: `npm run sitemap:submit`

### Development Issues

**Problem**: Port 3000 already in use.

**Solutions**:
1. Kill existing process: `npx kill-port 3000`
2. Use different port: `PORT=3001 npm run dev`
3. Find and stop process: `netstat -ano | findstr :3000`

**Problem**: Dependencies not installing.

**Solutions**:
1. Delete `node_modules` and `package-lock.json`
2. Run `npm cache clean --force`
3. Run `npm install` again
4. Check Node.js version: `node --version` (must be 20+)

### Monitoring & Health

**Health Endpoint**: `https://tools.devstackio.com/api/health`

Returns:
- Status (ok/degraded)
- Memory usage (heapUsedMB, heapTotalMB, rssMB)
- CPU load (1m, 5m, 15m averages)
- Server uptime
- Version

### Getting Help

If you can't resolve your issue:
1. Search existing [GitHub Issues](https://github.com/roddavinod99/tools/issues)
2. Create a new issue with detailed reproduction steps
3. Include environment info, logs, and screenshots
