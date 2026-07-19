# Changelog

## [0.1.0] - 2026-07-15

### Added

- Initial release with 137+ developer tools
- Tool categories: Encoders, Formatters, Generators, Converters, Security Tools, Image Tools, Utilities
- Static Site Generation with 208 prerendered pages
- PWA support with service worker and manifest
- Web Worker system for heavy computation
- Fuse.js fuzzy search in Web Worker
- Bundle analyzer integration
- Custom analytics tracking
- Performance test infrastructure
- Rust WASM infrastructure for future optimization
- SEO alias pages for common search variations
- Enhanced JSON-LD structured data (SoftwareApplication, FAQ, HowTo, BreadcrumbList, SoftwareSourceCode)

### Security

- Content Security Policy with 10 directives
- Rate limiting at Nginx and application level
- DOMPurify HTML/SVG sanitization with strict allowlist
- File upload hardening (MIME validation, magic bytes, zip bomb detection)
- SSRF protection for API routes
- Security headers (HSTS, X-Frame-Options, COOP, CORP)
- RFC 9116 security.txt
- IP address hashing in security logs

### Performance

- Lazy-loaded heavy dependencies (highlight.js, mathjs, crypto-js, qrcode, bcryptjs, libphonenumber-js)
- Web Workers for JSON, CSV, hash, and text processing
- Fuse.js search in dedicated Web Worker
- Optimized bundle with dynamic imports
- Next.js 16 Turbopack for fast builds
- ISR for sitemap (24h revalidation)

### Infrastructure

- PM2 cluster mode (2 instances)
- Nginx reverse proxy with rate limiting
- GitHub Actions CI/CD pipeline
- Automated SEO audit scripts
- Production readiness gate
- Daily cron jobs for sitemap submission

## [0.2.0] - 2026-07-19

### Performance

- **Bundle size optimization**: Replaced full `import("highlight.js")` (384 langs) with `highlight-lazy.ts` (core + 25 common langs, static subpath imports for tree-shaking)
- **Bundle size optimization**: Replaced `mathjs` "all" preset (371+ factories) with `math-lite.ts` (27 specific function dependencies via static imports, 133 keys vs 371+)
- Largest chunk reduced from **936 KB → 310 KB** (67% reduction)
- Bundle size budget test now passes (all chunks under 500 KB)

### Added

- **Google AdSense Integration** for sustainable free access:
  - Auto Ads enabled (anchor, vignette, side rail, in-page, multiplex formats)
  - Manual ad components: `AdSenseScript`, `AdBanner`, `InContentAd`, `SidebarAd`, `ResponsiveAd`
  - Strategic placements: Home page (3), Tools listing (2), Category pages (2), Tool pages (5 in-content)
  - Development mode placeholders (disabled in `NODE_ENV=development`)
  - GDPR/CCPA compliant via CMP integration
  - Follows Google AdSense best practices and Better Ads Standards

### Fixed

- Fixed `package-lock.json` mismatch: `sharp@0.34.5` vs `package.json` `sharp@^0.35.3` — regenerated lock file to prevent CI `npm ci` failures

### Infrastructure

- Updated `DEPLOYMENT.md`, `TROUBLESHOOTING.md` with lock file sync and bundle size debugging guidance
- Updated `README.md` with new scripts and project structure documentation
- Updated `ARCHITECTURE.md` with AdSense monetization layer documentation

## Template

For future releases:

```
## [version] - date

### Added
- ...

### Changed
- ...

### Deprecated
- ...

### Removed
- ...

### Fixed
- ...

### Security
- ...
```
