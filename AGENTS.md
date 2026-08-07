# AGENTS.md

# Website.Tools -- AI Agent Instructions

This document defines the architecture, standards, constraints, and
rules that all AI coding agents (Claude Code, Cursor, Copilot, Gemini
CLI, OpenAI Codex, etc.) must follow when modifying this repository.

------------------------------------------------------------------------

# Project Mission

Website.Tools is a privacy-first developer tools platform providing free
browser-based tools, learning resources, APIs, and developer utilities.

Primary goals:

1.  Privacy First
2.  Security by Default
3.  Browser-First Processing
4.  Excellent User Experience
5.  High Performance
6.  SEO-Friendly Architecture
7.  Accessibility
8.  Production Stability
9.  Long-Term Maintainability

------------------------------------------------------------------------

# Core Principles

## 1. User Data Never Leaves the Browser Unless Explicitly Required

Prefer:

-   Client-side processing
-   Web Workers
-   Browser APIs
-   Streaming APIs
-   Local computation

Avoid:

-   Uploading user files
-   Persisting user data
-   Server-side processing of user content

------------------------------------------------------------------------

## 2. Security Takes Priority Over Convenience

Priority order:

1.  Security
2.  Privacy
3.  Correctness
4.  Reliability
5.  Performance
6.  Accessibility
7.  SEO
8.  Developer Convenience

Never sacrifice security for convenience.

------------------------------------------------------------------------

## 3. Prefer Native Browser APIs

Before adding a dependency, ask:

-   Can the browser do this natively?
-   Can this be implemented with existing code?
-   Does this increase bundle size?
-   Does this create a security risk?

Avoid unnecessary dependencies.

------------------------------------------------------------------------

# Technology Stack

-   Next.js (App Router)
-   TypeScript
-   TailwindCSS
-   Node.js
-   PM2
-   Playwright
-   Linux (Oracle Cloud ARM64)

------------------------------------------------------------------------

# Repository Architecture

This repository contains:

-   Developer tools
-   Static pages
-   Educational content
-   Documentation
-   APIs
-   Search functionality
-   Metadata generation
-   Sitemap generation
-   Analytics
-   Feedback systems

------------------------------------------------------------------------

# Architecture Rules

## Browser-First Architecture

Use:

-   Web Workers
-   Streams API
-   File API
-   Blob API
-   Compression Streams
-   Clipboard API
-   IndexedDB (only if necessary)

Avoid:

-   Large server computations
-   Long-running backend tasks
-   User file persistence
-   Stateful services

------------------------------------------------------------------------

## Stateless Infrastructure

Assume:

-   Containers can restart at any time.
-   Filesystem may be ephemeral.
-   Multiple instances may exist.

Do not depend on:

-   Local state
-   Session memory
-   Shared storage
-   In-memory persistence

------------------------------------------------------------------------

# File Upload Rules

Maximum upload size:

``` text
10 MB
```

Never increase this without explicit approval.

Required protections:

-   MIME validation
-   Extension validation
-   Magic number validation
-   Compression ratio checks
-   Zip bomb detection
-   Memory limits
-   Timeouts
-   Nested archive limits

Never trust:

-   File names
-   File extensions
-   MIME headers
-   User-provided metadata

------------------------------------------------------------------------

# Privacy Rules

The platform is privacy-first.

Never:

-   Store uploaded files.
-   Persist user data unnecessarily.
-   Log file contents.
-   Send user files to third-party APIs.

Prefer:

-   In-memory processing
-   Browser processing
-   Temporary object URLs
-   Immediate cleanup

Files should be deleted immediately after processing or when the user
leaves the page.

------------------------------------------------------------------------

# Security Requirements

Follow OWASP guidance.

------------------------------------------------------------------------

## Input Validation

Every input must be:

-   validated
-   sanitized
-   size-limited
-   type-checked

------------------------------------------------------------------------

## XSS Protection

Never:

-   Trust HTML input
-   Render user HTML directly
-   Use dangerouslySetInnerHTML unless absolutely necessary

Sanitize:

-   HTML
-   SVG
-   Markdown
-   Rich text

------------------------------------------------------------------------

## SSRF Protection

Never allow:

-   localhost access
-   private IP ranges
-   metadata endpoints
-   arbitrary redirects

Validate:

-   URLs
-   hostnames
-   redirects
-   resolved IP addresses

------------------------------------------------------------------------

## API Security

Every endpoint should implement:

-   rate limiting
-   request size limits
-   input validation
-   timeout handling
-   error sanitization
-   structured logging

------------------------------------------------------------------------

## Logging Rules

Never log:

-   secrets
-   API keys
-   tokens
-   uploaded file contents
-   full IP addresses
-   personal information

Prefer:

-   redaction
-   hashing
-   aggregation

------------------------------------------------------------------------

## Security Headers

Maintain:

-   CSP
-   HSTS
-   X-Frame-Options
-   Referrer-Policy
-   Permissions-Policy
-   X-Content-Type-Options

Never weaken security headers without justification.

------------------------------------------------------------------------

------------------------------------------------------------------------

## Advanced Performance Architecture

Prefer:

-   dynamic imports for tool components
-   route-level code splitting
-   lazy loading of heavy dependencies
-   Web Workers for CPU-intensive tasks
-   streaming and incremental processing
-   performance budgets enforced in CI

For computationally heavy browser tools, prefer:

``` text
React
  ↓
Web Worker
  ↓
Rust WebAssembly (when justified)
```

Rust + WebAssembly should only be introduced when profiling demonstrates
meaningful improvements in performance, memory usage, or bundle size. Do
not rewrite working TypeScript implementations without measurable
benefits.

Avoid:

-   eagerly loading all tools
-   blocking the main UI thread
-   introducing WebAssembly without benchmarks

# Performance Requirements

The site should remain lightweight and fast.

Targets:

-   Lighthouse score \> 90
-   Fast First Contentful Paint
-   Good Core Web Vitals
-   Minimal JavaScript

------------------------------------------------------------------------

## Bundle Size Rules

Avoid:

-   large libraries
-   duplicate packages
-   unnecessary polyfills

Prefer:

-   dynamic imports
-   tree-shakeable packages
-   browser-native APIs
-   lazy loading of syntax highlighters, math libraries, and other heavy
    dependencies

Performance budgets should be monitored in CI where possible:

-   Initial JavaScript ≤ 250 KB per route target
-   Individual tool bundle target ≤ 100 KB
-   Lighthouse Performance ≥ 90

------------------------------------------------------------------------

## Tool Performance

Large file processing must:

-   avoid UI freezing
-   support cancellation
-   use Web Workers where appropriate
-   stream data whenever possible

------------------------------------------------------------------------

# Accessibility Requirements

All features must support:

-   keyboard navigation
-   screen readers
-   visible focus states
-   semantic HTML
-   proper labels
-   sufficient color contrast

Follow WCAG 2.2 AA requirements.

------------------------------------------------------------------------

# SEO Requirements

Do not remove:

-   metadata generation
-   structured data (JSON-LD)
-   canonical URLs
-   robots.txt
-   sitemap.xml (auto-generated from tool registry)
-   llms.txt
-   OpenGraph metadata
-   X (Twitter) Cards
-   Web Manifest
-   security.txt
-   humans.txt

Every page must include:

-   title (unique, ≤60 chars)
-   description (unique, ≤160 chars)
-   canonical URL (absolute, self-referencing)
-   OpenGraph: og:title, og:description, og:type, og:url, og:image
-   Twitter Cards: twitter:card, twitter:title, twitter:description, twitter:image
-   JSON-LD structured data (see Structured Data Templates section)

Structured data requirements by page type:

-   Homepage: WebSite + Organization + SearchAction
-   Tool pages: SoftwareApplication + BreadcrumbList + FAQPage (if FAQ exists) + HowTo (if guide exists)
-   Category/Listing pages: CollectionPage + BreadcrumbList + ItemList
-   Learning/Article pages: TechArticle/BlogPosting + BreadcrumbList + Organization
-   All pages: Organization (in footer or global)

Sitemap requirements:

-   Auto-generated from tool registry at build time
-   Include all tool pages, category pages, static pages
-   lastmod from git commit date or content hash
-   changefreq: weekly (tools), monthly (static)
-   priority: 1.0 (home), 0.8 (tools), 0.6 (categories), 0.5 (static)
-   Submit to Google Search Console + Bing Webmaster + IndexNow

Robots.txt requirements:

-   Allow all tool pages, category pages, learning resources
-   Disallow: /api/*, /admin/*, /_next/*, /private/*
-   Reference sitemap.xml location
-   Crawl-delay: 10 (if needed)

Core Web Vitals targets (enforced in CI):

-   LCP ≤ 2.5s
-   INP ≤ 200ms
-   CLS ≤ 0.1
-   Lighthouse Performance ≥ 90

-----------------------------------------------------------------------

## Structured Data Templates (JSON-LD)

Every page must include appropriate JSON-LD structured data. Use the templates below with Next.js App Router's `metadata` export or a dedicated `JsonLd` component.

### Validation

-   Test with [Rich Results Test](https://search.google.com/test/rich-results)
-   Validate with [Schema.org Validator](https://validator.schema.org)

### Standardized Placeholders

Use these placeholders across all templates. Replace with actual values at render time.

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{{SITE_URL}}` | Base site URL | `https://tools.devstackio.com` |
| `{{SITE_NAME}}` | Site brand name | `Website.Tools` |
| `{{TOOL_SLUG}}` | Tool URL slug | `json-formatter` |
| `{{TOOL_NAME}}` | Tool display name | `JSON Formatter` |
| `{{TOOL_DESCRIPTION}}` | Tool description (≤160 chars) | `Format, validate, and beautify JSON...` |
| `{{TOOL_CATEGORY}}` | Schema.org application category | `DeveloperApplication` |
| `{{FEATURE_LIST}}` | Array of feature strings | `["Syntax highlighting", "Error detection"]` |
| `{{BREADCRUMBS}}` | Array of `{name, url}` objects | `[{name: "Home", url: "{{SITE_URL}}"}, ...]` |
| `{{FAQ_ITEMS}}` | Array of `{question, answer}` objects | `[{question: "How to...", answer: "..."}]` |
| `{{HOWTO_STEPS}}` | Array of `{name, text, url?}` objects | `[{name: "Step 1", text: "Paste JSON..."}]` |

### Helper: JsonLd Component Pattern

```tsx
// components/JsonLd.tsx
export function JsonLd({ data }: { data: object | object[] }) {
  const jsonLd = Array.isArray(data) ? { "@context": "https://schema.org", "@graph": data } : { "@context": "https://schema.org", ...data };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
}
```

Usage in a page:
```tsx
import { JsonLd } from "@/components/JsonLd";

export default function ToolPage({ params }: { params: { slug: string } }) {
  const tool = getTool(params.slug);
  return (
    <>
      <JsonLd data={[
        generateSoftwareApplicationJsonLd(tool),
        generateBreadcrumbListJsonLd(tool.breadcrumbs),
        tool.faq && generateFAQPageJsonLd(tool.faq),
        tool.howto && generateHowToJsonLd(tool.howto),
        generateOrganizationJsonLd(),
      ].filter(Boolean)} />
      {/* Page content */}
    </>
  );
}
```

---

### 1. WebSite (Homepage Only)

Includes `SearchAction` for site-wide search box in SERPs.

```ts
/**
 * Generates WebSite structured data with SearchAction.
 * @param siteUrl - Base URL of the site (e.g., "https://tools.devstackio.com")
 * @param siteName - Brand name (e.g., "Website.Tools")
 * @returns WebSite schema object
 */
const generateWebSiteJsonLd = (siteUrl: string, siteName: string) => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": siteName,
  "url": siteUrl,
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": `${siteUrl}/tools?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
});
```

**JSON-LD Output:**
```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Website.Tools",
  "url": "https://tools.devstackio.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://tools.devstackio.com/tools?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
}
```

---

### 2. Organization (All Pages — Global or Footer)

Represents the publisher/brand. Include on every page (homepage, tool pages, articles).

```ts
/**
 * Generates Organization structured data.
 * @param siteUrl - Base URL
 * @param siteName - Brand name
 * @param logoUrl - Absolute URL to logo image (recommended: 512x512 PNG)
 * @param sameAs - Array of social/profile URLs
 * @returns Organization schema object
 */
const generateOrganizationJsonLd = (
  siteUrl: string,
  siteName: string,
  logoUrl: string,
  sameAs: string[]
) => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": siteName,
  "url": siteUrl,
  "logo": logoUrl,
  "sameAs": sameAs,
});
```

**JSON-LD Output:**
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Website.Tools",
  "url": "https://tools.devstackio.com",
  "logo": "https://tools.devstackio.com/logo.png",
  "sameAs": [
    "https://github.com/website-tools",
    "https://twitter.com/website_tools",
    "https://linkedin.com/company/website-tools"
  ]
}
```

---

### 3. SoftwareApplication (Every Tool Page) — PRIMARY

**Required for tool rich results in Google Search.** Every tool page must include this.

```ts
/**
 * Generates SoftwareApplication structured data for a developer tool.
 * @param tool - Tool metadata object
 * @returns SoftwareApplication schema object
 */
const generateSoftwareApplicationJsonLd = (tool: {
  slug: string;
  name: string;
  description: string;
  category: string; // e.g., "DeveloperApplication", "UtilitiesApplication"
  features: string[];
  siteUrl: string;
  siteName: string;
  screenshotUrl?: string; // Optional: tool screenshot
}) => ({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": tool.name,
  "applicationCategory": tool.category,
  "operatingSystem": "Cloud", // Browser-based tools
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock",
  },
  "description": tool.description,
  "featureList": tool.features,
  "url": `${tool.siteUrl}/tools/${tool.slug}`,
  "publisher": {
    "@type": "Organization",
    "name": tool.siteName,
    "url": tool.siteUrl,
  },
  ...(tool.screenshotUrl && { "screenshot": tool.screenshotUrl }),
});
```

**JSON-LD Output:**
```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "JSON Formatter",
  "applicationCategory": "DeveloperApplication",
  "operatingSystem": "Cloud",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock"
  },
  "description": "Format, validate, and beautify JSON with syntax highlighting and error detection.",
  "featureList": [
    "Syntax highlighting",
    "Error detection with line numbers",
    "Minify/pretty-print toggle",
    "Copy to clipboard",
    "Download formatted file"
  ],
  "url": "https://tools.devstackio.com/tools/json-formatter",
  "publisher": {
    "@type": "Organization",
    "name": "Website.Tools",
    "url": "https://tools.devstackio.com"
  }
}
```

---

### 4. TechArticle / BlogPosting (Learning Resources, Docs)

Use `TechArticle` for technical guides, `BlogPosting` for blog-style content.

```ts
/**
 * Generates TechArticle (or BlogPosting) structured data.
 * @param article - Article metadata
 * @param type - "TechArticle" or "BlogPosting"
 * @returns Article schema object
 */
const generateTechArticleJsonLd = (article: {
  title: string;
  description: string;
  url: string;
  authorName: string;
  authorUrl?: string;
  datePublished: string; // ISO 8601
  dateModified: string; // ISO 8601
  imageUrl?: string;
  siteName: string;
  siteUrl: string;
}, type: "TechArticle" | "BlogPosting" = "TechArticle") => ({
  "@context": "https://schema.org",
  "@type": type,
  "headline": article.title,
  "description": article.description,
  "url": article.url,
  "author": {
    "@type": "Person",
    "name": article.authorName,
    ...(article.authorUrl && { "url": article.authorUrl }),
  },
  "datePublished": article.datePublished,
  "dateModified": article.dateModified,
  "publisher": {
    "@type": "Organization",
    "name": article.siteName,
    "url": article.siteUrl,
    "logo": {
      "@type": "ImageObject",
      "url": `${article.siteUrl}/logo.png`,
    },
  },
  ...(article.imageUrl && { "image": article.imageUrl }),
});
```

**JSON-LD Output:**
```json
{
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "headline": "How to Format JSON for APIs",
  "description": "Learn best practices for formatting JSON payloads in REST APIs.",
  "url": "https://tools.devstackio.com/learn/json-formatting-api",
  "author": {
    "@type": "Person",
    "name": "Jane Developer"
  },
  "datePublished": "2025-01-15T10:00:00Z",
  "dateModified": "2025-06-20T14:30:00Z",
  "publisher": {
    "@type": "Organization",
    "name": "Website.Tools",
    "url": "https://tools.devstackio.com",
    "logo": {
      "@type": "ImageObject",
      "url": "https://tools.devstackio.com/logo.png"
    }
  }
}
```

---

### 5. CollectionPage (Category Pages, Tools Listing)

For pages listing multiple tools (category pages, /tools listing).

```ts
/**
 * Generates CollectionPage with ItemList for tool listings.
 * @param page - Page metadata
 * @param items - Array of tool summaries for ItemList
 * @returns CollectionPage schema object
 */
const generateCollectionPageJsonLd = (page: {
  name: string;
  description: string;
  url: string;
  siteName: string;
  siteUrl: string;
}, items: Array<{
  position: number;
  name: string;
  url: string;
  description: string;
}>) => ({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": page.name,
  "description": page.description,
  "url": page.url,
  "publisher": {
    "@type": "Organization",
    "name": page.siteName,
    "url": page.siteUrl,
  },
  "mainEntity": {
    "@type": "ItemList",
    "itemListElement": items.map((item) => ({
      "@type": "ListItem",
      "position": item.position,
      "item": {
        "@type": "SoftwareApplication",
        "name": item.name,
        "description": item.description,
        "url": item.url,
      },
    })),
  },
});
```

**JSON-LD Output:**
```json
{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Formatter Tools",
  "description": "Online formatters for JSON, XML, YAML, CSV, and more.",
  "url": "https://tools.devstackio.com/tools/category/formatters",
  "publisher": {
    "@type": "Organization",
    "name": "Website.Tools",
    "url": "https://tools.devstackio.com"
  },
  "mainEntity": {
    "@type": "ItemList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "item": {
          "@type": "SoftwareApplication",
          "name": "JSON Formatter",
          "description": "Format and validate JSON",
          "url": "https://tools.devstackio.com/tools/json-formatter"
        }
      },
      {
        "@type": "ListItem",
        "position": 2,
        "item": {
          "@type": "SoftwareApplication",
          "name": "XML Formatter",
          "description": "Format and validate XML",
          "url": "https://tools.devstackio.com/tools/xml-formatter"
        }
      }
    ]
  }
}
```

---

### 6. BreadcrumbList (All Pages Except Home)

Required for breadcrumb rich results. Include on every page except homepage.

```ts
/**
 * Generates BreadcrumbList structured data.
 * @param breadcrumbs - Array of {name, url} from home to current page
 * @returns BreadcrumbList schema object
 */
const generateBreadcrumbListJsonLd = (breadcrumbs: Array<{ name: string; url: string }>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": breadcrumbs.map((crumb, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": crumb.name,
    "item": crumb.url,
  })),
});
```

**JSON-LD Output:**
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://tools.devstackio.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Formatters",
      "item": "https://tools.devstackio.com/tools/category/formatters"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "JSON Formatter",
      "item": "https://tools.devstackio.com/tools/json-formatter"
    }
  ]
}
```

---

### 7. FAQPage (Tool Pages with FAQ Section)

Only include if the page has a genuine FAQ section with Q&A pairs.

```ts
/**
 * Generates FAQPage structured data.
 * @param faqs - Array of {question, answer}
 * @returns FAQPage schema object
 */
const generateFAQPageJsonLd = (faqs: Array<{ question: string; answer: string }>) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map((faq) => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer,
    },
  })),
});
```

**JSON-LD Output:**
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Does this tool store my data?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No, all processing happens in your browser. No data is sent to our servers."
      }
    },
    {
      "@type": "Question",
      "name": "What is the maximum file size?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "10 MB. Larger files may cause browser performance issues."
      }
    }
  ]
}
```

---

### 8. HowTo (Tool Pages with Step-by-Step Guides)

Only include if the page has a genuine how-to guide with sequential steps.

```ts
/**
 * Generates HowTo structured data.
 * @param howto - How-to guide metadata
 * @returns HowTo schema object
 */
const generateHowToJsonLd = (howto: {
  name: string;
  description: string;
  steps: Array<{ name: string; text: string; url?: string; imageUrl?: string }>;
  totalTime?: string; // ISO 8601 duration (e.g., "PT2M")
  estimatedCost?: { "@type": "MonetaryAmount"; "currency": "USD"; "value": "0" };
  supply?: Array<{ "@type": "HowToSupply"; "name": string }>;
  tool?: Array<{ "@type": "HowToTool"; "name": string }>;
}) => ({
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": howto.name,
  "description": howto.description,
  "step": howto.steps.map((step, index) => ({
    "@type": "HowToStep",
    "position": index + 1,
    "name": step.name,
    "text": step.text,
    ...(step.url && { "url": step.url }),
    ...(step.imageUrl && { "image": step.imageUrl }),
  })),
  ...(howto.totalTime && { "totalTime": howto.totalTime }),
  ...(howto.estimatedCost && { "estimatedCost": howto.estimatedCost }),
  ...(howto.supply && { "supply": howto.supply }),
  ...(howto.tool && { "tool": howto.tool }),
});
```

**JSON-LD Output:**
```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Format JSON",
  "description": "Step-by-step guide to formatting JSON using the JSON Formatter tool.",
  "step": [
    {
      "@type": "HowToStep",
      "position": 1,
      "name": "Open the tool",
      "text": "Navigate to the JSON Formatter tool page."
    },
    {
      "@type": "HowToStep",
      "position": 2,
      "name": "Paste your JSON",
      "text": "Copy your raw JSON and paste it into the input editor."
    },
    {
      "@type": "HowToStep",
      "position": 3,
      "name": "Click Format",
      "text": "Press the Format button to beautify your JSON with proper indentation."
    },
    {
      "@type": "HowToStep",
      "position": 4,
      "name": "Copy or download",
      "text": "Use the Copy button or download the formatted JSON as a file."
    }
  ],
  "totalTime": "PT1M",
  "estimatedCost": {
    "@type": "MonetaryAmount",
    "currency": "USD",
    "value": "0"
  }
}
```

---

### Complete Tool Page Example (Combined @graph)

This shows how to combine multiple schemas in a single `<script type="application/ld+json">` tag using `@graph`. This is the recommended pattern for tool pages.

```tsx
// app/tools/[slug]/page.tsx (Server Component)
import { JsonLd } from "@/components/JsonLd";
import { getTool } from "@/lib/tools";

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = getTool(slug);

  if (!tool) notFound();

  const breadcrumbs = [
    { name: "Home", url: "{{SITE_URL}}" },
    { name: "Tools", url: "{{SITE_URL}}/tools" },
    { name: tool.categoryName, url: `{{SITE_URL}}/tools/category/${tool.categorySlug}` },
    { name: tool.name, url: `{{SITE_URL}}/tools/${tool.slug}` },
  ];

  const structuredData = [
    // Organization (global, included on every page)
    generateOrganizationJsonLd(
      "{{SITE_URL}}",
      "{{SITE_NAME}}",
      "{{SITE_URL}}/logo.png",
      [
        "https://github.com/website-tools",
        "https://twitter.com/website_tools",
      ]
    ),
    // SoftwareApplication (PRIMARY - required for tool rich results)
    generateSoftwareApplicationJsonLd({
      slug: tool.slug,
      name: tool.name,
      description: tool.description,
      category: "DeveloperApplication",
      features: tool.features,
      siteUrl: "{{SITE_URL}}",
      siteName: "{{SITE_NAME}}",
      screenshotUrl: tool.screenshotUrl,
    }),
    // BreadcrumbList (required for breadcrumb rich results)
    generateBreadcrumbListJsonLd(breadcrumbs),
    // FAQPage (conditional - only if FAQ exists)
    tool.faq && generateFAQPageJsonLd(tool.faq),
    // HowTo (conditional - only if guide exists)
    tool.howto && generateHowToJsonLd(tool.howto),
  ].filter(Boolean);

  return (
    <>
      <JsonLd data={structuredData} />
      <main>
        {/* Tool UI */}
        <ToolInterface tool={tool} />
        {/* FAQ Section */}
        {tool.faq && <FAQSection faqs={tool.faq} />}
        {/* How-to Guide */}
        {tool.howto && <HowToSection howto={tool.howto} />}
      </main>
    </>
  );
}
```

**Rendered JSON-LD (single script tag with @graph):**
```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "name": "Website.Tools",
      "url": "https://tools.devstackio.com",
      "logo": "https://tools.devstackio.com/logo.png",
      "sameAs": ["https://github.com/website-tools", "https://twitter.com/website_tools"]
    },
    {
      "@type": "SoftwareApplication",
      "name": "JSON Formatter",
      "applicationCategory": "DeveloperApplication",
      "operatingSystem": "Cloud",
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD", "availability": "https://schema.org/InStock" },
      "description": "Format, validate, and beautify JSON...",
      "featureList": ["Syntax highlighting", "Error detection", "..."],
      "url": "https://tools.devstackio.com/tools/json-formatter",
      "publisher": { "@type": "Organization", "name": "Website.Tools", "url": "https://tools.devstackio.com" }
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://tools.devstackio.com" },
        { "@type": "ListItem", "position": 2, "name": "Tools", "item": "https://tools.devstackio.com/tools" },
        { "@type": "ListItem", "position": 3, "name": "Formatters", "item": "https://tools.devstackio.com/tools/category/formatters" },
        { "@type": "ListItem", "position": 4, "name": "JSON Formatter", "item": "https://tools.devstackio.com/tools/json-formatter" }
      ]
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        { "@type": "Question", "name": "Does this tool store my data?", "acceptedAnswer": { "@type": "Answer", "text": "No..." } }
      ]
    }
  ]
}
```

---

### Key Rules for AI Agents

1.  **Always use `@graph`** when combining multiple schemas in one script tag
2.  **Include Organization on every page** (global footer or layout)
3.  **SoftwareApplication is mandatory** for every tool page — no exceptions
4.  **BreadcrumbList is mandatory** for every page except homepage
5.  **FAQPage/HowTo are conditional** — only include if content exists
6.  **Never include empty arrays** — omit the property entirely
7.  **Validate every deployment** with Rich Results Test
8.  **Keep descriptions ≤160 chars** for optimal SERP display
9.  **Use absolute URLs** everywhere (no relative paths)
10. **Test after changes** — run `npm run build` and verify structured data in page source

-----------------------------------------------------------------------

# Ad Implementation Guidelines

This project uses Google AdSense for sustainable free access. All AI agents must follow these rules when working with ads.

## Ad Architecture

### Components (src/components/ads/)
- **AdSenseScript** — Loads AdSense JS with Auto Ads enabled (`enable_page_level_ads: true`)
- **AdBanner** — Horizontal responsive banner (format: "horizontal", slot: "1234567890")
- **InContentAd** — Rectangle in-content ad (format: "rectangle", slot: "3456789012")
- **SidebarAd** — Vertical sidebar ad for desktop (format: "vertical", slot: "2345678901")
- **ResponsiveAd** — Auto-sizing ad unit (format: "auto", slot: "4567890123")

### Implementation Rules

1. **Auto Ads Enabled** — AdSenseScript includes `(adsbygoogle = window.adsbygoogle || []).push({ google_ad_client: "ca-pub-...", enable_page_level_ads: true })` — do not remove.

2. **Development Mode** — Ads are disabled in development (`NODE_ENV === "development"`). Components render labeled placeholders for layout testing.

3. **Content-First Placement** — Ads must never block or interfere with tool functionality:
   - Tool interfaces load before any ad
   - Ads placed between content sections, not within tools
   - No ads near navigation, buttons, or form controls

4. **Google Policy Compliance** — Follow [AdSense Program Policies](https://support.google.com/adsense/answer/48182):
   - No misleading labels (only "Advertisements" or "Sponsored links")
   - No ads disguised as content/navigation
   - Clear visual separation from content
   - Respect Better Ads Standards

5. **Responsive Units** — All manual ad units use `data-ad-format="auto"` and `data-full-width-responsive="true"` for mobile optimization.

6. **Slot IDs** — Each placement uses a unique ad slot ID (provided in AdSense account). Do not reuse slots across pages.

### Placement Strategy

| Page Type | Placements |
|-----------|------------|
| Home | After Hero, after Featured Tools, after Learning Section |
| Tool Pages | After tool interface, after How-to, after Best Practices, after FAQ, after Learning Resources |
| Tools Listing | After header/search, middle of grid (50%) |
| Category Pages | After header, middle of grid (50%) |

### Adding New Ad Placements

1. Import from `@/components/ads`: `import { AdBanner, InContentAd } from "@/components/ads"`
2. Use appropriate component: `<AdBanner slot="YOUR_SLOT_ID" />` or `<InContentAd slot="YOUR_SLOT_ID" />`
3. Add unique slot ID from AdSense account
4. Place between content sections with `my-12` spacing
5. Test in development (shows placeholder) and production

### Prohibited Patterns

- ❌ Placing ads inside tool interfaces
- ❌ Ads that cover content on scroll
- ❌ More than 3 in-content ads per tool page
- ❌ Reusing slot IDs
- ❌ Removing Auto Ads configuration
- ❌ Adding ads to API routes or non-content pages

------------------------------------------------------------------------

## Tool Architecture Guidelines

Prefer a metadata-driven tool registry.

Example:

``` ts
{
  slug: "json-formatter",
  category: "formatters",
  worker: true,
  wasm: false
}
```

The registry should be the source of truth for:

-   search indexing
-   sitemap generation
-   metadata generation
-   analytics
-   feature discovery

# Adding a New Tool

Adding a tool touches several files. Missing any step silently degrades the
page (a "coming soon" placeholder or a 404). Follow all of these steps.

## 1. Registry entry — `src/lib/data/tools.ts`

Add an object to the `allTools` array. Use a category-prefixed, sequential
`id` (for example `u37`, `g16`, `c23`) and the **human** category name that
already exists in `src/lib/data/categories.ts`.

```ts
{
  id: "u37",
  name: "String Comparator",
  description: "Free online string comparison tool…",
  category: "Utilities",
  slug: "string-comparison",
  popularity: 58,
  icon: "Equal",
  keywords: ["string", "compare", "comparison"],
}
```

Optional fields: `featured`, `new`, `trending`, `worker`, `wasm`,
`aliasSlugs`, `keywords`, `noindex`. The registry drives search indexing,
sitemap generation, metadata, and the `/tools/[slug]` page.

## 2. Component — `src/components/tools/<slug>.tsx`

Create a `"use client"` component (or a plain component for simple tools)
that exports a **named** function matching the name you register in step 3.

```tsx
export function StringComparator() { /* … */ }
```

## 3. Register the dynamic loader — `src/components/tools/dynamic-tool-loader.tsx`

Every tool component MUST be added to the `toolLoaders` map in
`src/components/tools/dynamic-tool-loader.tsx`. Without this the tool page
renders the "coming soon" placeholder instead of your UI.

```ts
"string-comparison": () => import("./string-comparison").then((m) => ({ default: m.StringComparator })),
```

The exported component name in step 2 and the `.then((m) => m.X)` name here
must match exactly.

## 4. Content file — `src/content/tools/<slug>.json`

Create a JSON file matching the `ToolContent` type (`src/types`). This file
is **mandatory** — `src/app/tools/[slug]/page.tsx` calls `notFound()` if it
is missing. Required keys are `whatItDoes`, `whyItExists`, `whoShouldUse`,
`useCases`, `instructions`, `examples`, `bestPractices`, `commonMistakes`,
`faq`; optional keys are `features` and `references`.

Example shape:

```json
{
  "whatItDoes": "…",
  "whyItExists": "…",
  "whoShouldUse": "…",
  "useCases": ["…", "…"],
  "instructions": ["…", "…"],
  "examples": ["…", "…"],
  "bestPractices": ["…", "…"],
  "commonMistakes": ["…", "…"],
  "faq": ["…"],
  "features": ["…"],
  "references": [{ "label": "…", "url": "…" }]
}
```

## 5. Test fixture — `tests/fixtures/<category>.json`

Add one entry to the fixture pack for your tool's category so the
data-driven `tests/tools.spec.ts` covers it. `action` is an optional button
label to press; `input`/`input2` fill the first/second textarea; `pattern`
fills a regex box. Use an empty string when a field does not apply.

```json
{ "slug": "string-comparison", "category": "Utilities", "name": "String Comparator", "input": "a", "input2": "b", "action": "", "expect": "output" }
```

## E2E harness contract (`tests/tools.spec.ts`)

The spec decides a tool "produced output" when it sees any of: an element
with `data-testid="tool-output"`, an output textarea/pre/code with text, an
`img`, an `svg`, or a table. Ensure your tool exposes one of these.

-   Give the primary result `data-testid="tool-output"`.
-   **The first textarea inside the tool section must be an editable input.**
    If the first textarea is a read-only output, the spec's `.fill(...)` will
    time out waiting for an editable element. Keep a read-only result element
    that is NOT the first textarea, or omit the `input` for the fixture.

## 6. Verify

```bash
npm run build          # generates .next/standalone for Playwright
npm run test:tools     # runs data-driven fixtures against all tools
```

Visually confirm `/tools/<slug>` renders the tool (not the placeholder) and
produces correct output before submitting.

-----

# Tool Component React Conventions

Follow the repo's enforced lint rules when writing tool components:

-   **Never call `setState` inside `useMemo`, a render, or an event - derive
    values during render instead.** Calling a state setter from `useMemo` is
    rejected by `react-hooks/set-state-in-render` and can loop infinitely.
-   **Do not call impure functions (`Date.now`, `Math.random`, `crypto`…)
    inside `useMemo` or during render.** Capture such values in event
    handlers, `useEffect`, or `useState` initializers instead
    (`react-hooks/purity`). For a tool that shows "now", set the timestamp
    once via `useState(() => …)` and update it from a button click.
-   Use `const` unless a value is reassigned (`prefer-const`), and remove
    unused variables and imports (eslint will fail on them).
-   Render output into an element carrying `data-testid="tool-output"` so the
    e2e harness can detect it (see "Adding a New Tool").

-----

# Developer Tool Requirements

Every new tool must include:

## 1. Real-World Use Case

Document:

-   who uses it
-   why it exists
-   expected inputs
-   expected outputs

------------------------------------------------------------------------

## 2. Edge Cases

Consider:

-   empty input
-   malformed input
-   large input
-   Unicode
-   invalid files
-   browser limitations

------------------------------------------------------------------------

## 3. Error Handling

Provide:

-   useful messages
-   graceful degradation
-   recovery options

------------------------------------------------------------------------

## 4. Accessibility

Every tool must work without a mouse.

------------------------------------------------------------------------

## 5. Mobile Compatibility

All tools must be usable on:

-   desktop
-   tablet
-   mobile

------------------------------------------------------------------------

## 6. Metadata

Every tool page should include:

-   metadata
-   description
-   structured data
-   FAQ where appropriate

------------------------------------------------------------------------

# Dependency Rules

Before installing a package:

1.  Check maintenance status.
2.  Check bundle size.
3.  Check license.
4.  Check security advisories.
5.  Check browser compatibility.

Avoid dependencies for trivial functionality.

------------------------------------------------------------------------

# Infrastructure Rules

Deployment target:

-   Oracle Cloud ARM64

All code should be:

-   ARM compatible
-   memory efficient
-   CPU efficient

Avoid:

-   x86-only binaries
-   excessive memory usage
-   unnecessary background workers

------------------------------------------------------------------------

# Testing Requirements

Before submitting changes run:

```bash
npm run lint
npm run typecheck
npm run build
npm run test:unit     # vitest; includes the bundle-size budget check
npm run test:tools    # playwright data-driven fixture tests
```

Use the focused Playwright suites when working on one area:

```bash
npm run test:tools     # all tool fixtures (tests/tools.spec.ts)
npm run test:a11y      # accessibility checks
npm run test:api       # API routes
npm run test:security  # security checks
npm run test:snapshots # visual snapshots
```

Important notes:

-   **Build first.** Playwright auto-starts `node .next/standalone/server.js`
    on port 3000 via `reuseExistingServer: true`, so a working
    `npm run build` output must exist before running any Playwright suite.
-   New tools are covered by the data-driven `tests/tools.spec.ts`, which
    reads every `tests/fixtures/*.json`. Add a fixture entry for each new
    tool (see "Adding a New Tool").
-   `npm run test:unit` includes a bundle-size budget test that inspects
    `.next/static/chunks`. A large shared/vendor chunk can cause this single
    test to fail even when the new tool itself is small — treat a pre-existing
    oversized chunk as separate from your change.

Changes are not complete until all commands pass.

------------------------------------------------------------------------

# AI Agent Workflow

Before making changes:

1.  Understand existing architecture.
2.  Search for similar implementations.
3.  Reuse existing utilities.
4.  Avoid duplication.

After changes:

1.  Run tests.
2.  Verify accessibility.
3.  Verify security implications.
4.  Verify performance implications.
5.  Verify SEO impact.

## Version Bump Before Commit (Mandatory)

Versioning is done **locally by the AI before the commit is pushed** — never by the
deploy pipeline. The deploy workflow (`deploy.yml`) no longer bumps versions, so
the version files have exactly one writer (the local session).

At the end of every working session, before the user commits/pushes, the AI MUST:

1.  Run the auto-release: `npm run version:auto -- --dry-run --verbose` first to
    review, then `npm run version:auto` to apply. This computes the next version
    from conventional commits since the last `v*` tag and updates
    `package.json`, `CHANGELOG.md`, `data/build-number.json`, `data/release.json`,
    `data/releases/`, and regenerates the prebuild data.
2.  Stage and commit the release artifacts with a message like
    `release: vX.Y.Z`.
3.  Do NOT push on the user's behalf unless asked — the commit must exist locally
    before the user pushes.

Notes:

-   `src/lib/version/__generated__/release-data.ts` is gitignored and generated
    at build/dev time — never commit or resolve conflicts in it.
-   `public/sw.template.js` must keep the literal `__SW_VERSION__` placeholder;
    the version is injected at request time by `src/app/sw.js/route.ts`. Do not
    hand-edit that placeholder.

------------------------------------------------------------------------

# AI Agent Prohibitions

Never:

-   remove security checks
-   increase upload limits
-   persist user files
-   bypass validation
-   disable rate limiting
-   disable sanitization
-   expose secrets
-   weaken CSP
-   introduce breaking changes without justification

------------------------------------------------------------------------

# Functional Completeness & Real-World Usability Rules

## Core Principle

**A feature is not complete because the UI exists, the build succeeds,
or TypeScript passes.**

A feature is complete only when:

-   All advertised functionality works.
-   Real users can use it successfully.
-   Edge cases are handled.
-   Automated tests pass.
-   Manual verification confirms expected behavior.

------------------------------------------------------------------------

# No Demo-Only Implementations

Never implement:

-   Placeholder functionality
-   Mock data pretending to be real functionality
-   Empty handlers
-   Incomplete feature branches
-   UI elements that do nothing

Forbidden patterns:

``` ts
return [];
return {};
return null;
return mockData;
return exampleData;
return "Coming Soon";
```

Unless the feature is explicitly marked as:

-   Experimental
-   Beta
-   Not Yet Implemented
-   Planned

------------------------------------------------------------------------

# Production Usability Requirement

Every tool added to this repository must be production usable.

A production-usable tool:

1.  Solves a real-world problem.
2.  Produces correct output.
3.  Handles invalid input.
4.  Handles empty input.
5.  Handles large input.
6.  Handles edge cases.
7.  Works in major browsers.
8.  Does not depend on demo data.
9.  Does not expose partially implemented functionality.

------------------------------------------------------------------------

# Functional Completeness Rules

A feature is considered broken if:

-   A button does nothing.
-   A dropdown option does nothing.
-   A menu item produces empty output.
-   A generator only works for some categories.
-   Export functionality is incomplete.
-   The UI claims a feature exists but it is not implemented.
-   A tool returns placeholder data instead of real data.

------------------------------------------------------------------------

# Feature Advertisement Rule

If the UI advertises a feature, that feature MUST work.

Example:

If a tool advertises:

-   Random Names
-   Emails
-   Company Names
-   Addresses
-   UUIDs

Then every category must:

-   Generate valid data.
-   Generate multiple records.
-   Produce non-empty output.
-   Support all advertised options.
-   Be tested.

Partially implemented categories are considered defects.

------------------------------------------------------------------------

# Definition of Done

A feature is complete only when all of the following are true:

-   [ ] UI implemented
-   [ ] Business logic implemented
-   [ ] All advertised features work
-   [ ] All buttons work
-   [ ] All dropdown options work
-   [ ] Copy functionality works
-   [ ] Export functionality works
-   [ ] Mobile experience works
-   [ ] Accessibility verified
-   [ ] Edge cases handled
-   [ ] Error states handled
-   [ ] Tests added
-   [ ] Manual verification completed

------------------------------------------------------------------------

# Real-World Validation Requirements

Every tool must be validated against:

## Happy Path

Expected user workflow succeeds.

## Invalid Input

Malformed input is handled gracefully.

## Empty Input

The tool provides useful feedback.

## Large Input

The tool remains stable.

## Edge Cases

Boundary conditions are handled correctly.

## Browser Compatibility

The tool works in supported browsers.

------------------------------------------------------------------------

# Tool Contract Requirement

Before implementing a tool, define:

``` yaml
Tool:
Features:
Inputs:
Outputs:
Edge Cases:
Acceptance Criteria:
```

AI agents must not begin implementation until these requirements are
clear.

------------------------------------------------------------------------

# Acceptance Criteria Requirement

Every feature must have explicit acceptance criteria.

Example:

``` yaml
Tool: Random Data Generator

Features:
  - Names
  - Emails
  - Companies
  - Phone Numbers
  - UUIDs

Acceptance Criteria:
  - Every category generates data
  - No category returns empty output
  - Generate 1-1000 rows
  - CSV export works
  - JSON export works
  - Copy works
  - No runtime errors
```

------------------------------------------------------------------------

# Testing Requirement

Every tool should include automated tests for all advertised
functionality.

Example:

-   Select each category.
-   Generate data.
-   Verify output is non-empty.
-   Verify output is valid.
-   Verify export works.
-   Verify copy works.
-   Verify error handling.

------------------------------------------------------------------------

# AI Agent Verification Rules

Never consider a task complete solely because:

-   The page renders.
-   The build succeeds.
-   TypeScript passes.
-   Lint passes.
-   The UI looks correct.

A task is complete only when functionality has been verified.

------------------------------------------------------------------------

# AI Agent Self-Review Checklist

Before submitting changes, ask:

1.  Does every advertised feature actually work?
2.  Can a real user successfully use this tool?
3.  Did I implement business logic or only UI?
4.  Did I test every option and category?
5.  Does any button do nothing?
6.  Does any feature return empty output?
7.  Did I accidentally leave placeholder functionality?
8.  Would I personally ship this feature to production?

If any answer is "No", the implementation is incomplete and must not be
considered finished.

# Authoritative References

## Web Standards

-   <https://developer.mozilla.org/>
-   <https://html.spec.whatwg.org/>
-   <https://tc39.es/ecma262/>

------------------------------------------------------------------------

## Accessibility

-   <https://www.w3.org/TR/WCAG22/>
-   <https://www.w3.org/WAI/ARIA/apg/>
-   <https://webaim.org/>

------------------------------------------------------------------------

## Security

-   <https://owasp.org/www-project-top-ten/>
-   <https://cheatsheetseries.owasp.org/>
-   <https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html>
-   <https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html>
-   <https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html>
-   <https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html>

------------------------------------------------------------------------

## SEO

### Google Search Central
- Search Essentials: https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- How Search Works: https://developers.google.com/search/docs/fundamentals/how-search-works
- Crawling & Indexing: https://developers.google.com/search/docs/crawling-indexing
- Robots.txt: https://developers.google.com/search/docs/crawling-indexing/robots/intro
- Robots Meta Tag: https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag
- JavaScript SEO: https://developers.google.com/search/docs/crawling-indexing/javascript
- Canonical URLs: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- Redirects: https://developers.google.com/search/docs/crawling-indexing/301-redirects
- Sitemaps: https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview

### Structured Data
- Overview: https://developers.google.com/search/docs/appearance/structured-data
- Search Gallery: https://developers.google.com/search/docs/appearance/structured-data/search-gallery
- Organization: https://developers.google.com/search/docs/appearance/structured-data/organization
- SoftwareApplication: https://developers.google.com/search/docs/appearance/structured-data/software-application
- Breadcrumb: https://developers.google.com/search/docs/appearance/structured-data/breadcrumb
- FAQPage: https://developers.google.com/search/docs/appearance/structured-data/faqpage
- HowTo: https://developers.google.com/search/docs/appearance/structured-data/how-to
- Article/TechArticle: https://developers.google.com/search/docs/appearance/structured-data/article

### Schema.org Types (Primary for this project)
- WebSite: https://schema.org/WebSite
- Organization: https://schema.org/Organization
- SoftwareApplication: https://schema.org/SoftwareApplication
- TechArticle: https://schema.org/TechArticle
- BlogPosting: https://schema.org/BlogPosting
- CollectionPage: https://schema.org/CollectionPage
- BreadcrumbList: https://schema.org/BreadcrumbList
- SearchAction: https://schema.org/SearchAction
- FAQPage: https://schema.org/FAQPage
- HowTo: https://schema.org/HowTo

### Testing & Validation
- Rich Results Test: https://search.google.com/test/rich-results
- Schema.org Validator: https://validator.schema.org
- PageSpeed Insights: https://pagespeed.web.dev
- Lighthouse: https://developer.chrome.com/docs/lighthouse

### Standards & Protocols
- Sitemaps Protocol: https://www.sitemaps.org/protocol.html
- Robots.txt RFC 9309: https://www.rfc-editor.org/rfc/rfc9309
- Open Graph: https://ogp.me
- X/Twitter Cards: https://developer.x.com/en/docs/x-for-websites/cards/overview/abouts-cards
- JSON-LD Spec: https://json-ld.org / https://www.w3.org/TR/json-ld11/
- Web Manifest: https://developer.mozilla.org/docs/Web/Manifest
- security.txt: https://securitytxt.org / RFC 9116
- llms.txt: https://llmstxt.org
- humans.txt: https://humanstxt.org
- IndexNow: https://www.indexnow.org/documentation

### Other Search Engines
- Bing Webmaster: https://www.bing.com/webmasters
- Yandex Webmaster: https://webmaster.yandex.com

### Validators
- W3C HTML: https://validator.w3.org
- W3C CSS: https://jigsaw.w3.org/css-validator

-----------------------------------------------------------------------

## Performance

-   <https://web.dev/performance/>
-   <https://developer.chrome.com/docs/lighthouse>

------------------------------------------------------------------------

## Privacy

-   <https://gdpr.eu/>
-   <https://eur-lex.europa.eu/eli/reg/2016/679/oj>
-   <https://oag.ca.gov/privacy/ccpa>

------------------------------------------------------------------------

## Next.js

-   <https://nextjs.org/docs>
-   <https://nextjs.org/docs/app>
-   <https://nextjs.org/docs/app/building-your-application/optimizing/metadata>
-   <https://nextjs.org/docs/app/building-your-application/data-fetching/incremental-static-regeneration>

------------------------------------------------------------------------

## TypeScript

-   <https://www.typescriptlang.org/docs/>
-   <https://www.typescriptlang.org/tsconfig>

------------------------------------------------------------------------

------------------------------------------------------------------------

## Final Rule

When uncertain:

1.  Prefer security.
2.  Prefer privacy.
3.  Prefer simplicity.
4.  Prefer native browser APIs.
5.  Prefer maintainability.
6.  Prefer documented standards over assumptions.
7.  If you are unsure how to do something, use `gh_grep` to search code examples from GitHub.

------------------------------------------------------------------------

# Enterprise Platform Standards (Recommended Upgrade)

## Architecture Evolution

As the platform grows, AI agents should prioritize platform capabilities
over adding individual tools.

Preferred implementation order:

1.  Extend the shared tool platform.
2.  Reuse existing utilities before creating new ones.
3.  Introduce metadata-driven implementations.
4.  Minimize duplicate code.

### Preferred Tool Architecture

Every tool should ideally be represented by a metadata definition
containing:

-   slug
-   title
-   category
-   tags
-   keywords
-   icon
-   description
-   input schema
-   output schema
-   processing mode (client / worker / wasm)
-   examples
-   related tools

The metadata registry should be the single source of truth for:

-   Search
-   Sitemap
-   Navigation
-   Categories
-   Related tools
-   Structured data
-   Analytics

------------------------------------------------------------------------

## Rust & WebAssembly Policy

Rust WebAssembly is encouraged for CPU-intensive browser processing.

Candidates include:

-   Hashing
-   Compression
-   Image processing
-   CSV parsing
-   JSON formatting
-   Text transforms

Before introducing WASM, profile the existing implementation and
document measurable improvements.

------------------------------------------------------------------------

## Code Reuse Policy

Before writing new code, AI agents MUST:

1.  Search for similar implementations.
2.  Reuse shared components.
3.  Extend existing abstractions.
4.  Avoid duplicated utilities.

New abstractions should be preferred over copy-paste implementations.

------------------------------------------------------------------------

## Definition of Excellent Feature

A feature should include where applicable:

-   Keyboard support
-   Mobile support
-   Accessibility
-   Error handling
-   Copy support
-   Export support
-   Undo/Redo
-   Drag & Drop
-   Performance testing
-   Documentation
-   Automated tests

------------------------------------------------------------------------

## Observability

Production-ready features should expose meaningful metrics where
appropriate:

-   Processing duration
-   Error counts
-   Worker failures
-   Search usage
-   Tool popularity

Structured logging should never contain user content.

------------------------------------------------------------------------

## AI Agent Final Checklist

Before considering work complete:

-   No duplicate implementation introduced.
-   Existing utilities reused.
-   Accessibility verified.
-   Performance impact measured.
-   Bundle impact reviewed.
-   Security implications reviewed.
-   SEO impact reviewed.
-   Documentation updated.
-   Changelog updated.
-   Tests passing.
