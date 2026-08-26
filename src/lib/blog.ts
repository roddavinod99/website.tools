import { promises as fs } from "fs";
import path from "path";
import { siteConfig } from "./data";

export interface BlogPost {
  title: string;
  excerpt: string;
  date: string;
  dateISO: string;
  readTime: string;
  slug: string;
}

export const blogPosts: BlogPost[] = [
  {
    title: "Base64 Encode/Decode Online — Free Tool for Developers",
    excerpt: "Encode text/files to Base64 and decode Base64 strings instantly. Client-side, supports UTF-8, file uploads, Standard/Base64URL/MIME presets.",
    date: "July 21, 2026",
    dateISO: "2026-07-21",
    readTime: "7 min",
    slug: "base64-encode-decode-online",
  },
  {
    title: "UUID v4 vs v7 Generator — Which UUID Version Should You Use?",
    excerpt: "Compare UUID v4 (random) vs v7 (timestamp-ordered). Database performance benchmarks, code examples for 8 languages, collision analysis, and when to use each version.",
    date: "July 22, 2026",
    dateISO: "2026-07-22",
    readTime: "8 min",
    slug: "uuid-v4-vs-v7-generator",
  },
  {
    title: "SQL Formatter Online — Format, Beautify & Validate SQL Queries",
    excerpt: "Free online SQL formatter for MySQL, PostgreSQL, SQLite, T-SQL, BigQuery. Beautify complex queries, validate syntax, configure style. Client-side, privacy-first.",
    date: "July 23, 2026",
    dateISO: "2026-07-23",
    readTime: "7 min",
    slug: "sql-formatter-online",
  },
  {
    title: "Hash Generator Online — MD5, SHA-256, SHA-512 & More",
    excerpt: "Free online hash generator for text and files. MD5, SHA-1, SHA-256, SHA-384, SHA-512 with HMAC support. Client-side Web Crypto API, batch mode, file streaming.",
    date: "July 24, 2026",
    dateISO: "2026-07-24",
    readTime: "8 min",
    slug: "hash-generator-online",
  },
  {
    title: "Image Compressor for Web — Reduce Size 40-80% (JPEG, PNG, WebP, AVIF)",
    excerpt: "Free online image compressor with quality control. Batch compress JPEG, PNG, WebP, AVIF. Resize, strip EXIF, progressive enhancement. Client-side, no uploads.",
    date: "July 25, 2026",
    dateISO: "2026-07-25",
    readTime: "8 min",
    slug: "image-compressor-for-web",
  },
  {
    title: "URL Parser & Analyzer — Break Down Any URL Into Components",
    excerpt: "Free online URL parser for developers. Parse protocol, host, path, query params, hash. Decode percent-encoding, edit components, reconstruct. Client-side, privacy-first.",
    date: "July 26, 2026",
    dateISO: "2026-07-26",
    readTime: "7 min",
    slug: "url-parser-analyzer",
  },
  {
    title: "Unix Timestamp Converter — Convert Epoch to Human Date & Timezone",
    excerpt: "Free online Unix timestamp converter. Seconds, milliseconds, ISO 8601, RFC 2822. Timezone support, batch mode, relative time. Client-side, no tracking.",
    date: "July 27, 2026",
    dateISO: "2026-07-27",
    readTime: "7 min",
    slug: "unix-timestamp-converter",
  },
  {
    title: "Regex Tester with Capture Groups — Debug Patterns in Real-Time",
    excerpt: "Free online regex tester with capture groups, named groups, flags (g,i,m,s,u,y), substitution, and explanation. Web Worker powered for large inputs. Client-side.",
    date: "July 28, 2026",
    dateISO: "2026-07-28",
    readTime: "8 min",
    slug: "regex-tester-capture-groups",
  },
  {
    title: "Text Diff Checker Online — Compare Files, Code & Configs Side-by-Side",
    excerpt: "Free online text diff checker with side-by-side, unified, and inline views. Word/character-level diff, ignore whitespace, patch export. Web Worker powered, client-side.",
    date: "July 29, 2026",
    dateISO: "2026-07-29",
    readTime: "7 min",
    slug: "text-diff-checker-online",
  },
  {
    title: "Word Counter with Readability — Flesch, Fog, SMOG, ARI Scores",
    excerpt: "Free online word counter with readability analysis. Flesch-Kincaid, Gunning Fog, SMOG, ARI, Coleman-Liau indices. Reading/speaking time, keyword density. Real-time, client-side.",
    date: "July 30, 2026",
    dateISO: "2026-07-30",
    readTime: "7 min",
    slug: "word-counter-readability",
  },
  {
    title: "DNS Lookup Tool — A, MX, TXT, NS, CNAME, DNSSEC Validation",
    excerpt: "Free online DNS lookup for developers. Query A, AAAA, MX, NS, TXT, CNAME, SOA, CAA records. DNSSEC validation, multiple DoH resolvers, raw response. Client-side.",
    date: "July 31, 2026",
    dateISO: "2026-07-31",
    readTime: "8 min",
    slug: "dns-lookup-tool",
  },
  {
    title: "IP Subnet Calculator — CIDR, Netmask, Host Range, VLSM",
    excerpt: "Free online IP subnet calculator for IPv4/IPv6. CIDR, netmask, wildcard, usable hosts, subnet splitting, supernetting. VLSM support, point-to-point /31. Client-side.",
    date: "August 1, 2026",
    dateISO: "2026-08-01",
    readTime: "8 min",
    slug: "ip-subnet-calculator",
  },
  {
    title: "Cron Expression Generator — Visual Builder for Scheduled Jobs",
    excerpt: "Free online cron expression generator with visual builder. Standard 5-field, Quartz 6-field, Spring, systemd timers. Next run preview, validation, timezone support. Client-side.",
    date: "August 2, 2026",
    dateISO: "2026-08-02",
    readTime: "8 min",
    slug: "cron-expression-generator",
  },
  {
    title: "Color Converter Online — HEX, RGB, HSL, HSV, CMYK, OKLCH",
    excerpt: "Free online color converter for designers and developers. HEX, RGB, HSL, HSV, CMYK, LAB, OKLCH with alpha. Color harmonies, WCAG contrast, palette export. Client-side.",
    date: "August 3, 2026",
    dateISO: "2026-08-03",
    readTime: "8 min",
    slug: "color-converter-online",
  },
  {
    title: "Best Free Developer Tools 2026 — 140+ Tools, Zero Cost, Total Privacy",
    excerpt: "Complete guide to 140+ free developer tools: formatters, encoders, generators, converters, security, image, network utilities. All client-side, no tracking, open source.",
    date: "August 4, 2026",
    dateISO: "2026-08-04",
    readTime: "12 min",
    slug: "best-free-developer-tools-2026",
  },
  {
    title: "How to Format JSON Online: Best Free Tools for Developers",
    excerpt: "Complete guide to formatting, validating, and beautifying JSON online. Covers syntax highlighting, error detection, large file handling, and privacy-first tools.",
    date: "July 20, 2026",
    dateISO: "2026-07-20",
    readTime: "6 min",
    slug: "how-to-format-json-online",
  },
  {
    title: "Decode JWT Tokens Instantly — No Login Required",
    excerpt: "Debug authentication issues fast. Paste any JWT to inspect header, payload, and signature. Supports HS256, RS256, ES256, EdDSA with JWKS verification.",
    date: "July 19, 2026",
    dateISO: "2026-07-19",
    readTime: "7 min",
    slug: "decode-jwt-tokens-instantly",
  },
  {
    title: "Generate Secure Passwords in Your Browser — Zero Server Upload",
    excerpt: "Create cryptographically strong passwords using Web Crypto API. 100% client-side, configurable entropy, passphrase mode, zero tracking.",
    date: "July 18, 2026",
    dateISO: "2026-07-18",
    readTime: "5 min",
    slug: "generate-secure-passwords-in-browser",
  },
  {
    title: "Convert JSON to CSV for Excel — Free Online Converter",
    excerpt: "Transform JSON arrays to spreadsheet-ready CSV with nested object flattening, custom delimiters, and large file support. No uploads, no limits.",
    date: "July 17, 2026",
    dateISO: "2026-07-17",
    readTime: "6 min",
    slug: "convert-json-to-csv-for-excel",
  },
  {
    title: "Create QR Codes for Free: Complete Guide (URL, vCard, WiFi, Crypto)",
    excerpt: "Generate QR codes for 10 formats with custom colors, logos, and error correction. URL, contact, WiFi, calendar, crypto payments — all client-side.",
    date: "July 16, 2026",
    dateISO: "2026-07-16",
    readTime: "6 min",
    slug: "create-qr-codes-for-free",
  },
  {
    title: "Getting Started with JSON: A Complete Guide",
    excerpt: "Learn everything you need to know about JSON, from basic syntax to advanced use cases in modern web development.",
    date: "June 28, 2026",
    dateISO: "2026-06-28",
    readTime: "5 min",
    slug: "getting-started-json",
  },
  {
    title: "Understanding JWT Tokens: How They Work",
    excerpt: "A deep dive into JSON Web Tokens, including structure, signing algorithms, and security best practices.",
    date: "June 25, 2026",
    dateISO: "2026-06-25",
    readTime: "8 min",
    slug: "understanding-jwt",
  },
  {
    title: "Image Optimization for the Web",
    excerpt: "Best practices for optimizing images to improve page load times without sacrificing quality.",
    date: "June 20, 2026",
    dateISO: "2026-06-20",
    readTime: "6 min",
    slug: "image-optimization",
  },
  {
    title: "Password Security: Best Practices for 2026",
    excerpt: "A comprehensive guide to password security, including password managers, passkeys, and what to do if you're breached.",
    date: "June 15, 2026",
    dateISO: "2026-06-15",
    readTime: "12 min",
    slug: "password-security",
  },
  {
    title: "The Ultimate Guide to UUIDs",
    excerpt: "Everything developers need to know about UUIDs, including v4 vs v7, use cases, and best practices.",
    date: "June 10, 2026",
    dateISO: "2026-06-10",
    readTime: "7 min",
    slug: "guide-to-uuids",
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export function getPostUrl(slug: string): string {
  return `${siteConfig.url}/blog/${slug}`;
}

export async function getPostContent(slug: string): Promise<string | null> {
  if (!blogPosts.some((p) => p.slug === slug)) return null;
  try {
    const filePath = path.join(process.cwd(), "src/content/blog", `${slug}.md`);
    return await fs.readFile(filePath, "utf-8");
  } catch {
    return null;
  }
}
