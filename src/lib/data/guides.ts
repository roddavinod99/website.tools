export interface GuideTopic {
  title: string;
  description: string;
  slug: string;
  readTime: string;
  category: string;
  published: string;
  modified: string;
  tools?: string[];
}

export const guidesTopics: GuideTopic[] = [
  // Concepts
  { title: "JSON Basics", description: "Learn the fundamentals of JSON syntax, structure, and common use cases in modern web development.", slug: "concepts/json-basics", readTime: "5 min", category: "Concepts", published: "2026-06-28", modified: "2026-08-28", tools: ["json-formatter", "json-validator", "json-minifier"] },
  { title: "JWT Structure", description: "A comprehensive guide to JSON Web Tokens, how they work, and best practices for implementation.", slug: "concepts/jwt-structure", readTime: "8 min", category: "Concepts", published: "2026-06-25", modified: "2026-08-28", tools: ["jwt-decoder", "jwt-generator"] },
  { title: "Base64 Encoding", description: "What Base64 is, how it works, and when to use it in web development.", slug: "concepts/base64-encoding", readTime: "6 min", category: "Concepts", published: "2026-07-01", modified: "2026-08-28", tools: ["base64", "image-to-base64"] },
  { title: "Cron Syntax", description: "Understand cron syntax, build schedules, and preview next run times before deploying.", slug: "concepts/cron-syntax", readTime: "6 min", category: "Concepts", published: "2026-08-20", modified: "2026-08-28", tools: ["cron-expression"] },
  { title: "IP Subnetting", description: "Calculate network addresses, usable host ranges, and masks for IPv4 and IPv6 subnets.", slug: "concepts/ip-subnetting", readTime: "6 min", category: "Concepts", published: "2026-08-20", modified: "2026-08-28", tools: ["ipv4-subnet-calculator", "ipv6-calculator", "ip-calculator"] },
  { title: "Regex Fundamentals", description: "Learn regular expressions from basics to advanced patterns with practical examples.", slug: "concepts/regex-fundamentals", readTime: "10 min", category: "Concepts", published: "2026-07-03", modified: "2026-08-28", tools: ["regex-tester", "regex-memo"] },
  { title: "Unix Timestamps", description: "Everything you need to know about Unix timestamps, timezones, and date handling.", slug: "concepts/unix-timestamps", readTime: "7 min", category: "Concepts", published: "2026-07-04", modified: "2026-08-28", tools: ["timestamp-converter"] },
  { title: "UUID Versions", description: "Choose the right UUID version — v4, v7, or v5 — and generate them securely.", slug: "concepts/uuid-versions", readTime: "6 min", category: "Concepts", published: "2026-08-20", modified: "2026-08-28", tools: ["uuid-generator", "ulid-generator"] },
  { title: "Data Serialization Formats", description: "Compare JSON, YAML, TOML, and XML to choose the right format for your project.", slug: "concepts/data-serialization-formats", readTime: "8 min", category: "Concepts", published: "2026-07-06", modified: "2026-08-28", tools: ["yaml-formatter", "toml-converter", "xml-formatter", "json-to-yaml"] },
  { title: "HTML Encoding", description: "A guide to HTML entities, special characters, and why encoding matters for security.", slug: "concepts/html-encoding", readTime: "5 min", category: "Concepts", published: "2026-07-05", modified: "2026-08-28", tools: ["html-entity", "html-formatter"] },
  { title: "Markdown Syntax", description: "Master Markdown syntax for headings, lists, links, tables, and code blocks.", slug: "concepts/markdown-syntax", readTime: "6 min", category: "Concepts", published: "2026-08-20", modified: "2026-08-28", tools: ["markdown-editor", "markdown-preview", "markdown-to-html"] },

  // Best Practices
  { title: "Password Security", description: "How to create and manage secure passwords, plus common pitfalls to avoid.", slug: "best-practices/password-security", readTime: "8 min", category: "Best Practices", published: "2026-06-15", modified: "2026-08-28", tools: ["password-generator", "password-strength"] },
  { title: "Image Optimization", description: "Best practices for optimizing images for the web without sacrificing quality.", slug: "best-practices/image-optimization", readTime: "6 min", category: "Best Practices", published: "2026-06-20", modified: "2026-08-28", tools: ["image-compressor", "image-resizer"] },
  { title: "SQL Formatting", description: "How to format SQL queries for readability and maintainability across every dialect.", slug: "best-practices/sql-formatting", readTime: "5 min", category: "Best Practices", published: "2026-08-20", modified: "2026-08-28", tools: ["sql-formatter"] },
  { title: "JWT Security", description: "Best practices for secure JWT implementation, algorithm selection, and token validation.", slug: "best-practices/jwt-security", readTime: "8 min", category: "Best Practices", published: "2026-08-28", modified: "2026-08-28", tools: ["jwt-decoder", "jwt-generator"] },
  { title: "bcrypt Hashing", description: "Understand how bcrypt salts, costs, and hashes passwords for secure storage.", slug: "best-practices/bcrypt-hashing", readTime: "5 min", category: "Best Practices", published: "2026-08-20", modified: "2026-08-28", tools: ["bcrypt-generator", "password-strength"] },
  { title: "HMAC Authentication", description: "Sign API requests and verify webhooks with HMAC-SHA256 and other keyed hashes.", slug: "best-practices/hmac-authentication", readTime: "5 min", category: "Best Practices", published: "2026-08-20", modified: "2026-08-28", tools: ["hmac-generator", "hash-generator"] },
  { title: "File Integrity Checksums", description: "Verify file integrity with MD5, SHA-256, SHA-512, and CRC32 checksums in your browser.", slug: "best-practices/file-integrity-checksums", readTime: "5 min", category: "Best Practices", published: "2026-08-20", modified: "2026-08-28", tools: ["file-checksum", "hash-generator"] },
  { title: "Secure Password Generation", description: "Generate cryptographically secure passwords and passphrases using Web Crypto API.", slug: "best-practices/secure-password-generation", readTime: "4 min", category: "Best Practices", published: "2026-08-28", modified: "2026-08-28", tools: ["password-generator"] },
  { title: "CSS Minification", description: "How to minify CSS for production and why it matters for performance.", slug: "best-practices/css-minification", readTime: "5 min", category: "Best Practices", published: "2026-07-02", modified: "2026-08-28", tools: ["css-minifier", "css-formatter"] },

  // References
  { title: "Color Models", description: "Convert between HEX, RGB, HSL, HSV, CMYK, LAB, OKLCH — with alpha, harmonies, contrast.", slug: "references/color-models", readTime: "4 min", category: "References", published: "2026-08-20", modified: "2026-08-28", tools: ["color-converter", "color-eyedropper"] },
  { title: "Case Conversion", description: "Convert between camelCase, PascalCase, snake_case, and kebab-case consistently.", slug: "references/case-conversion", readTime: "4 min", category: "References", published: "2026-08-20", modified: "2026-08-28", tools: ["case-converter", "slug-generator", "text-sorter"] },
  { title: "JSON to CSV", description: "Flatten JSON arrays into spreadsheet-ready CSV files with our browser-based converter.", slug: "references/json-to-csv", readTime: "5 min", category: "References", published: "2026-08-20", modified: "2026-08-28", tools: ["json-to-csv", "csv-to-json"] },
  { title: "HTML to Markdown", description: "Convert HTML documents to Markdown and back for CMS exports, docs, and static sites.", slug: "references/html-to-markdown", readTime: "6 min", category: "References", published: "2026-08-20", modified: "2026-08-28", tools: ["html-to-markdown", "markdown-to-html", "markdown-preview"] },
  { title: "JSON Schema", description: "Generate and use JSON Schema to validate API payloads and configuration files.", slug: "references/json-schema", readTime: "7 min", category: "References", published: "2026-08-20", modified: "2026-08-28", tools: ["json-schema-generator", "json-validator"] },
  { title: "URL Components", description: "Parse URLs into scheme, host, path, query, and fragment — and validate them safely.", slug: "references/url-components", readTime: "5 min", category: "References", published: "2026-08-20", modified: "2026-08-28", tools: ["url-parser", "url-encoder"] },
  { title: "Text Diff Comparison", description: "Compare two versions of text or files and see exactly what changed, character by character.", slug: "references/text-diff-comparison", readTime: "5 min", category: "References", published: "2026-08-20", modified: "2026-08-28", tools: ["diff-checker", "text-diff-visual", "string-comparison"] },

  // Tutorials
  { title: "QR Code Generation", description: "Create scannable QR codes for URLs, text, Wi-Fi, and contact details that work everywhere.", slug: "tutorials/qr-code-generation", readTime: "5 min", category: "Tutorials", published: "2026-08-20", modified: "2026-08-28", tools: ["qr-generator", "wifi-qr-generator"] },
  { title: "Random Data Generation", description: "Generate realistic, reproducible test data with names, emails, addresses, and UUIDs.", slug: "tutorials/random-data-generation", readTime: "5 min", category: "Tutorials", published: "2026-08-20", modified: "2026-08-28", tools: ["random-data", "uuid-generator", "lorem-ipsum"] },
  { title: "Cron Scheduling", description: "Understand cron syntax, build schedules, and preview next run times before deploying.", slug: "tutorials/cron-scheduling", readTime: "6 min", category: "Tutorials", published: "2026-08-20", modified: "2026-08-28", tools: ["cron-expression"] },
  { title: "Base64 Encoding & Decoding", description: "Encode and decode Base64 with Standard, URL-safe, and MIME presets.", slug: "tutorials/base64-encoding-decoding", readTime: "5 min", category: "Tutorials", published: "2026-08-28", modified: "2026-08-28", tools: ["base64", "image-to-base64"] },

  // Troubleshooting
  { title: "JSON Errors & Fixes", description: "Common JSON syntax errors and how to fix them — trailing commas, unquoted keys, smart quotes.", slug: "troubleshooting/json-errors", readTime: "4 min", category: "Troubleshooting", published: "2026-08-28", modified: "2026-08-28", tools: ["json-formatter", "json-validator"] },
  { title: "JWT Decoding", description: "Debug JWT tokens — inspect header, payload, verify signatures, troubleshoot 401/403 errors.", slug: "troubleshooting/jwt-decoding", readTime: "6 min", category: "Troubleshooting", published: "2026-08-28", modified: "2026-08-28", tools: ["jwt-decoder"] },
  { title: "Regex Debugging", description: "Test and debug regular expressions with real-time matching, capture groups, and ReDoS prevention.", slug: "troubleshooting/regex-debugging", readTime: "6 min", category: "Troubleshooting", published: "2026-08-28", modified: "2026-08-28", tools: ["regex-tester"] },
  { title: "Hash Verification", description: "Verify file integrity and API signatures with MD5, SHA-1, SHA-256, SHA-512, HMAC.", slug: "troubleshooting/hash-verification", readTime: "5 min", category: "Troubleshooting", published: "2026-08-28", modified: "2026-08-28", tools: ["hash-generator", "file-checksum", "hmac-generator"] },
  { title: "DNS Troubleshooting", description: "Diagnose DNS resolution issues — NXDOMAIN, propagation, MX/SPF/DKIM/DMARC, DNSSEC.", slug: "troubleshooting/dns-troubleshooting", readTime: "8 min", category: "Troubleshooting", published: "2026-08-28", modified: "2026-08-28", tools: ["dns-lookup"] },
  { title: "Timestamp Conversion", description: "Convert between Unix seconds, milliseconds, ISO 8601 — handle timezone, Y2038, leap seconds.", slug: "troubleshooting/timestamp-conversion", readTime: "6 min", category: "Troubleshooting", published: "2026-08-28", modified: "2026-08-28", tools: ["timestamp-converter"] },
  { title: "Image Compression", description: "Troubleshoot image compression issues — quality settings, format choice, artifacts, transparency.", slug: "troubleshooting/image-compression", readTime: "5 min", category: "Troubleshooting", published: "2026-08-28", modified: "2026-08-28", tools: ["image-compressor", "image-resizer"] },
  { title: "Word Count Analysis", description: "Count words, characters, sentences — readability scores (Flesch, Fog, SMOG), keyword density.", slug: "troubleshooting/word-count-analysis", readTime: "4 min", category: "Troubleshooting", published: "2026-08-28", modified: "2026-08-28", tools: ["word-counter"] },
];

export const guidesCategories = Array.from(
  guidesTopics.reduce((acc, topic) => {
    acc.set(topic.category, (acc.get(topic.category) ?? 0) + 1);
    return acc;
  }, new Map<string, number>()),
  ([name, count]) => ({ name, count })
);