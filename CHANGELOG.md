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
## [0.2.5] - 2026-08-03

### Changed

- Merge branch 'main' of https://github.com/roddavinod99/website.tools
- new changes
## [0.2.6] - 2026-08-03

### Infrastructure

- add WASM build step with caching to deploy workflow
## [0.2.7] - 2026-08-03

### Infrastructure

- copy WASM pkg to src/lib/wasm for Next.js build
## [0.2.8] - 2026-08-03

### Changed

- fix X-Frame-Options expectation to match config
## [0.2.9] - 2026-08-05

### Changed

- Merge remote-tracking branch 'origin/main' - resolve version conflicts
- New changes
## [0.2.10] - 2026-08-05

### Infrastructure

- update gitignore and remove lighthouse budget
- fix wasm-pack cache step IDs to prevent reinstall on cache hit
## [0.2.11] - 2026-08-05

### Infrastructure

- move auto-version bump to deploy job only (fixes merge conflicts on push)
## [0.3.0] - 2026-08-06

### Changed

- new changes
- Merge remote-tracking branch 'origin/main' (v0.2.11) with security hardening
- Security hardening: Comprehensive vulnerability remediation
### Infrastructure

- set Node version to 24 across workflows
- enterprise & solo-maintainer project posture
### Refactored

- remove crypto-js dependency, implement native crypto-hash module
### Added

- blog/guide E-E-A-T, cross-links, and content cleanup
- add References section and relevance-based related-tools linking to all tool pages
### Fixed

- restore typecheck, remove dead tool-actions UI, make copy functional
## [0.3.1] - 2026-08-07

### Infrastructure

- ignore crawl directory and remove audit export
### Changed

- Merge origin/main: v0.3.0 release
- new chang
## [0.3.2] - 2026-08-08

### Performance

- replace mathjs with native chunk-free evaluator
### Fixed

- serve .well-known/security.txt, fix favicon and meta descriptions
### Infrastructure

- align sitemap with Google guidelines
### Changed

- deploy issues
- Merge branch 'main' of https://github.com/roddavinod99/website.tools
- new updates 0.3.1
## [0.4.0] - 2026-08-09

### Added

- Finance tools suite (loan EMI, SIP, mortgage, savings, tax, and more) with currency converter API

### Fixed

- Precise loan schedules, debt payoff, ROI, savings, and tax math
- Allowlist example JWTs in gitleaks, bump action majors

### Documentation

- Instruct agents to use all available MCP servers

## [0.5.0] - 2026-08-14

### Added

- Privacy-first public visit counter to the footer
- Redesigned homepage, static pages, and shared layout

## [0.6.0] - 2026-08-14

### Changed

- Visitor counter update

## [0.7.0] - 2026-08-16

### Fixed

- FAQ rendering - always expanded, parser handles all formats
- Move OG preview card into public/ so og:image resolves

## [0.8.0] - 2026-08-19

### Fixed

- Run security tests serially and add .env.production for standalone server

## [1.0.0] - 2026-08-20

### Fixed

- Keep action buttons visible and disabled in empty state across 34 tool components

### Changed

- Mark stable 1.0.0 release

## [1.1.0] - 2026-08-21

### Added

- add comparison pages, guides, accessibility page, and structured data audit/tests
### Fixed

- use sudo for nginx CSP config deploy
### Documentation

- clean polluted CHANGELOG and drop erroneous 0.9.0 release
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