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
│  - Security headers                                         │
│  - Attack path blocking                                     │
├─────────────────────────────────────────────────────────────┤
│                  Next.js (PM2 Cluster x2)                    │
│  ├── Static Pages (SSG) ── 137 tool pages, categories       │
│  ├── ISR ── sitemap.xml (24h revalidation)                  │
│  ├── Dynamic ── API routes (DNS, IP, submit, contact)       │
│  └── Middleware ── Rate limiter (proxy.ts)                  │
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
- All 137+ tool pages are pre-rendered at build time
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
1. **Nginx** — SSL, rate limiting, attack blocking, security headers
2. **Next.js Middleware** (proxy.ts) — Application-level rate limiting
3. **API Routes** — Input validation, sanitization, origin checking
4. **Client-side** — DOMPurify sanitization, CSP enforcement

## Performance Targets

| Metric | Target |
|--------|--------|
| Lighthouse Performance | ≥ 90 |
| Lighthouse Accessibility | ≥ 95 |
| Initial JS Bundle | ≤ 250 KB |
| Tool Bundle | ≤ 100 KB |
| Time to Interactive | < 2s |
| First Contentful Paint | < 1s |
