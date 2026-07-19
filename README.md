# DevStackIO — Free Online Developer Tools

> **137+ privacy-first developer tools. 100% free. Zero data leaves your browser.**

[Live Demo](https://tools.devstackio.com) · [Report Bug](https://github.com/roddavinod99/tools/issues) · [Request Feature](https://github.com/roddavinod99/tools/issues)

## ✨ Features

- **137+ Developer Tools** — JSON formatters, code validators, generators, converters, security tools, image utilities, and more
- **Privacy First** — All processing happens in your browser. No data is ever sent to a server
- **Fast** — Built with Next.js 16, Turbopack, and ISR for instant page loads
- **Mobile Friendly** — Fully responsive design that works on any device
- **No Login Required** — All tools are free and open, no account needed
- **Keyboard Shortcuts** — Power-user workflows for efficient tool access
- **PWA Ready** — Installable as a Progressive Web App with offline support
- **Accessible** — WCAG 2.2 AA compliant, keyboard navigable, screen reader friendly

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- npm 10+

### Development

```bash
# Clone the repository
git clone https://github.com/roddavinod99/tools.git
cd tools

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## 🏗️ Architecture

### Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Icons | Lucide React |
| Fonts | Geist (Vercel) |
| Tool Processing | Client-side (Web APIs, Web Workers) |
| Search | Fuse.js in Web Worker |
| Process Manager | PM2 cluster mode |
| Reverse Proxy | Nginx |
| Deployment | Oracle Cloud ARM64 (Ampere A1) |

### Rendering Strategy

- **Static Site Generation (SSG)** — Tool pages, category pages, blog posts, guides
- **Incremental Static Regeneration (ISR)** — Sitemap (24h revalidation)
- **Dynamic** — API routes, search endpoint
- **Client-side** — All tool logic runs in the browser

### Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── tools/[slug]/       # 137 individual tool pages
│   ├── categories/[slug]/  # Category listing pages
│   ├── api/                # Server endpoints
│   └── ...
├── components/
│   ├── tools/              # Interactive tool interfaces
│   ├── ui/                 # Reusable UI components
│   ├── layout/             # Header, Footer, Analytics
│   └── ...
├── lib/
│   ├── constants.ts        # Tool registry, site config
│   ├── search.ts           # Search implementation
│   ├── sanitize.ts         # DOMPurify wrapper
│   ├── highlight-lazy.ts   # Tree-shakeable highlight.js (core + 25 langs)
│   ├── math-lite.ts        # Tree-shakeable mathjs (functions-only subset)
│   ├── version/            # Release & version management system
│   ├── workers/            # Web Worker infrastructure
│   └── ...
├── workers/                # Web Worker implementations
│   ├── compute.worker.ts   # Heavy computation worker
│   └── search.worker.ts    # Fuse.js search worker
├── proxy.ts                # Rate limiter middleware
└── types/                  # TypeScript type definitions
```

## 🛡️ Security

Security is a core design principle. See [SECURITY.md](SECURITY.md) for the full security policy.

### Key Security Features

- **Content Security Policy** — 10-directive CSP configured at both Next.js and Nginx levels
- **HTTP Security Headers** — HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, COOP, CORP
- **Rate Limiting** — Three-tier in-memory rate limiter + Nginx rate limiting zones
- **Input Validation** — All API inputs validated, sanitized, and size-limited
- **SSRF Protection** — DNS hostname validation, private IP blocking, Content-Type enforcement
- **XSS Prevention** — DOMPurify with strict allowlist for all HTML/SVG rendering
- **File Upload Hardening** — MIME validation, magic byte checks, zip bomb detection
- **Process Isolation** — Runs as non-root user with restricted privileges

## 🔧 Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start development server |
| `npm run build` | Production build (runs `prebuild` hook automatically) |
| `npm start` | Start production server |
| `npm run lint` | ESLint check |
| `npm run test` | Run Playwright test suite |
| `npm run analyze` | Bundle analyzer report |
| `npm run production:readiness` | Run production readiness checks |
| `npm run seo:audit` | Run SEO audit |
| `npm run sitemap:submit` | Submit sitemap to search engines |
| `npm run version` | Interactive release CLI (bumps version, updates changelog) |

## 📦 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy (PM2)

```bash
npm ci
npm run build
pm2 start ecosystem.config.js
```

### Environment Variables

See [`.env.example`](.env.example) for all available configuration options.

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

## 📄 License

MIT — See [LICENSE](LICENSE) for details.
