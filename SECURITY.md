# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 0.1.x | ✅ |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please report it privately:

- **Email**: security@devstackio.com
- **GitHub Security Advisories**: https://github.com/roddavinod99/tools/security/advisories/new

Please do **not** report security vulnerabilities through public GitHub issues.

### What to Include

- Type of vulnerability
- Steps to reproduce
- Affected versions
- Potential impact
- Suggested fix (if any)

### Response Timeline

- **24 hours**: Initial acknowledgment
- **7 days**: Assessment and severity determination
- **30 days**: Fix deployed (for critical issues)

## Security Architecture

### Defense in Depth

```
Layer 1: Nginx Reverse Proxy
├── TLS 1.2/1.3
├── Rate limiting (3 zones)
├── Bad user-agent blocking
├── Path traversal blocking
├── Attack path blocking (.php, wp-admin, .env, .git)
├── Security headers (CSP, HSTS, etc.)
└── Request size limits (10 MB)

Layer 2: Next.js Middleware (proxy.ts)
├── Application rate limiting
├── Security headers
└── Request validation

Layer 3: API Routes
├── Input sanitization
├── Content-Type enforcement
├── Origin/Referer validation
├── Body size limits
├── IP redaction in storage
└── Structured logging (no secrets)

Layer 4: Client-Side
├── DOMPurify HTML/SVG sanitization
├── Content Security Policy enforcement
├── Web Worker isolation
└── Service Worker (cache-first for assets)
```

### Security Headers

| Header | Value | Purpose |
|--------|-------|---------|
| Strict-Transport-Security | max-age=63072000; includeSubDomains; preload | Enforce HTTPS |
| Content-Security-Policy | Multi-directive | XSS prevention |
| X-Content-Type-Options | nosniff | MIME sniffing prevention |
| X-Frame-Options | DENY | Clickjacking prevention |
| Referrer-Policy | strict-origin-when-cross-origin | Referrer leakage prevention |
| Permissions-Policy | Restricted | Feature restriction |
| Cross-Origin-Opener-Policy | same-origin | Cross-origin isolation |
| Cross-Origin-Resource-Policy | same-origin | Resource isolation |

### Data Protection

- **No user data stored** — All tool processing is client-side
- **IP addresses** — SHA-256 hashed before storage
- **Form submissions** — Redacted IPs, auto-purged at 500 entries
- **File uploads** — Processed in memory only, never persisted
- **Logs** — No secrets, no PII, no file contents

## Security Checklist

- [ ] Environment variables use production values (not defaults)
- [ ] `.env` files are NOT in git tracking
- [ ] SSL certificates are valid and auto-renewing
- [ ] Rate limiting is enabled (unless behind Cloudflare)
- [ ] CSP does not use `unsafe-inline` where avoidable
- [ ] All API inputs are validated and size-limited
- [ ] File upload limits are enforced at all layers
- [ ] Error messages don't leak internal details
- [ ] Dependencies are up to date (`npm audit`)
- [ ] Service worker uses HTTPS
