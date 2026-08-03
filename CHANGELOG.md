# Changelog

## [0.1.3] - 2026-07-28

### Added

- Pre-deploy cleanup in GitHub Actions to clear stale artifacts on Oracle server
- Post-build cleanup in CI/CD to keep runners lean

### Changed

- Deploy workflow: added rm -rf .next wasm/target test-results playwright-report node_modules/.cache before build on server
- Deploy workflow: added npm run clean after build (before standalone prep)
- Validate workflow: added npm run clean after build to free GitHub runner space

### Infrastructure

- Storage savings: ~2.8 GB per deploy (local + server)
- Faster CI runs (no accumulated cache)

## [0.1.2] - 2026-07-28

### Added

- Pre-deploy cleanup in GitHub Actions to clear stale artifacts on Oracle server

## [0.1.1] - 2026-07-26

### Added

- `npm run clean` script to remove build artifacts (`wasm/target/`, `.next/`, `test-results/`, `playwright-report/`)
- Pre-deploy cleanup in GitHub Actions to clear stale artifacts on Oracle server
- Post-build cleanup in CI/CD to keep runners lean

### Changed

- Deploy workflow: added `rm -rf .next wasm/target test-results playwright-report node_modules/.cache` before build on server
- Deploy workflow: added `npm run clean` after build (before standalone prep)
- Validate workflow: added `npm run clean` after build to free GitHub runner space

### Infrastructure

- Storage savings: ~2.8 GB per deploy (local + server)
- Faster CI runs (no accumulated cache)

## [0.1.0] - 2026-07-15

### Added

- Initial release with 123 developer tools
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

## [0.2.0] - 2026-07-28

### Added

- Google AdSense Integration for sustainable free access - Auto Ads enabled, manual ad components, strategic placements, GDPR/CCPA compliant

### Performance

- Bundle size optimization: Replaced full import highlight.js (384 langs) with highlight-lazy.ts (core + 25 common langs)
- Bundle size optimization: Replaced mathjs all preset (371+ factories) with math-lite.ts (27 specific function dependencies)
- Largest chunk reduced from 936 KB to 310 KB (67% reduction)
- Bundle size budget test now passes (all chunks under 500 KB)

### Fixed

- Fixed package-lock.json mismatch: sharp@0.34.5 vs package.json sharp@^0.35.3

### Infrastructure

- Updated DEPLOYMENT.md, TROUBLESHOOTING.md with lock file sync and bundle size debugging guidance
- Updated README.md with new scripts and project structure documentation
- Updated ARCHITECTURE.md with AdSense monetization layer documentation

## [0.2.1] - 2026-08-02

### Fixed

- restart devstackio app, not stale tools process
- commit wasm glue module missing from gitignore'ed pkg dir
- silence hydration-mount lint error and ignore wasm generated types
- enable cssChunking strict to ensure CSS chunks emit in standalone output
### Infrastructure

- add .npmrc to gitignore
- remove playwright-mcp reports and snapshots from repo, add to gitignore
### Changed

- New updates
## [0.2.2] - 2026-08-03

### Changed

- Merge branch 'main' of https://github.com/roddavinod99/website.tools
- all new changes
## [0.2.3] - 2026-08-03

### Changed

- Merge remote changes, resolve conflicts
- SEO & Performance: Dynamic imports, CSP fixes, source maps, sitemap enhancements
## [0.2.4] - 2026-08-03

### Changed

- Merge branch 'main' of https://github.com/roddavinod99/website.tools
- changes done 0.2.3
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