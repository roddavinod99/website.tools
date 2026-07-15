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
