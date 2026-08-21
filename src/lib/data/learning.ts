export interface LearningTopic {
  title: string;
  description: string;
  slug: string;
  readTime: string;
  category: string;
  published: string;
  modified: string;
  tools?: string[];
}

export const learningTopics: LearningTopic[] = [
  { title: "Getting Started with JSON", description: "Learn the fundamentals of JSON syntax, structure, and common use cases in modern web development.", slug: "getting-started-json", readTime: "5 min", category: "JSON", published: "2026-06-28", modified: "2026-06-28", tools: ["json-formatter", "json-validator", "json-minifier"] },
  { title: "Understanding JWT Tokens", description: "A comprehensive guide to JSON Web Tokens, how they work, and best practices for implementation.", slug: "understanding-jwt", readTime: "8 min", category: "JWT & Security", published: "2026-06-25", modified: "2026-06-25", tools: ["jwt-decoder", "jwt-generator"] },
  { title: "Image Optimization Guide", description: "Best practices for optimizing images for the web without sacrificing quality.", slug: "image-optimization-guide", readTime: "6 min", category: "Web Performance", published: "2026-06-20", modified: "2026-06-20", tools: ["image-compressor", "image-resizer"] },
  { title: "Password Security Best Practices", description: "How to create and manage secure passwords, plus common pitfalls to avoid.", slug: "password-security", readTime: "4 min", category: "JWT & Security", published: "2026-06-15", modified: "2026-06-15", tools: ["password-generator", "password-strength"] },
  { title: "Understanding Base64 Encoding", description: "What Base64 is, how it works, and when to use it in web development.", slug: "understanding-base64", readTime: "6 min", category: "Encodings", published: "2026-07-01", modified: "2026-07-01", tools: ["base64", "image-to-base64"] },
  { title: "CSS Minification Guide", description: "How to minify CSS for production and why it matters for performance.", slug: "css-minification-guide", readTime: "5 min", category: "Web Performance", published: "2026-07-02", modified: "2026-07-02", tools: ["css-minifier", "css-formatter"] },
  { title: "Regex Fundamentals", description: "Learn regular expressions from basics to advanced patterns with practical examples.", slug: "regex-fundamentals", readTime: "10 min", category: "Dev Techniques", published: "2026-07-03", modified: "2026-07-03", tools: ["regex-tester", "regex-memo"] },
  { title: "Unix Timestamps Explained", description: "Everything you need to know about Unix timestamps, timezones, and date handling.", slug: "unix-timestamps-explained", readTime: "7 min", category: "Data Formats", published: "2026-07-04", modified: "2026-07-04", tools: ["timestamp-converter"] },
  { title: "HTML Encoding & Special Characters", description: "A guide to HTML entities, special characters, and why encoding matters for security.", slug: "html-encoding-guide", readTime: "5 min", category: "Encodings", published: "2026-07-05", modified: "2026-07-05", tools: ["html-entity", "html-formatter"] },
  { title: "Data Serialization Formats", description: "Compare JSON, YAML, TOML, and XML to choose the right format for your project.", slug: "data-serialization-formats", readTime: "8 min", category: "Data Formats", published: "2026-07-06", modified: "2026-07-06", tools: ["yaml-formatter", "toml-converter", "xml-formatter", "json-to-yaml"] },
  { title: "How to Convert JSON to CSV", description: "Flatten JSON arrays into spreadsheet-ready CSV files with our browser-based converter.", slug: "json-to-csv-guide", readTime: "5 min", category: "Converters", published: "2026-08-20", modified: "2026-08-20", tools: ["json-to-csv", "csv-to-json"] },
  { title: "SQL Formatting Guide", description: "How to format SQL queries for readability and maintainability across every dialect.", slug: "sql-formatting-guide", readTime: "5 min", category: "Dev Techniques", published: "2026-08-20", modified: "2026-08-20", tools: ["sql-formatter"] },
  { title: "HTML to Markdown Conversion", description: "Convert HTML documents to Markdown and back for CMS exports, docs, and static sites.", slug: "html-markdown-guide", readTime: "6 min", category: "Converters", published: "2026-08-20", modified: "2026-08-20", tools: ["html-to-markdown", "markdown-to-html", "markdown-preview"] },
  { title: "Color Conversion Guide", description: "Convert between HEX, RGB, HSL, and CMYK color models with exact, lossless values.", slug: "color-conversion-guide", readTime: "4 min", category: "Dev Techniques", published: "2026-08-20", modified: "2026-08-20", tools: ["color-converter", "color-eyedropper"] },
  { title: "Text Diff and Comparison", description: "Compare two versions of text or files and see exactly what changed, character by character.", slug: "text-diff-guide", readTime: "5 min", category: "Dev Techniques", published: "2026-08-20", modified: "2026-08-20", tools: ["diff-checker", "text-diff-visual", "string-comparison"] },
  { title: "Cron Expression Guide", description: "Understand cron syntax, build schedules, and preview next run times before deploying.", slug: "cron-expression-guide", readTime: "6 min", category: "Dev Techniques", published: "2026-08-20", modified: "2026-08-20", tools: ["cron-expression"] },
  { title: "URL Parsing Guide", description: "Parse URLs into scheme, host, path, query, and fragment — and validate them safely.", slug: "url-parsing-guide", readTime: "5 min", category: "Encodings", published: "2026-08-20", modified: "2026-08-20", tools: ["url-parser", "url-encoder"] },
  { title: "JSON Schema Guide", description: "Generate and use JSON Schema to validate API payloads and configuration files.", slug: "json-schema-guide", readTime: "7 min", category: "JSON", published: "2026-08-20", modified: "2026-08-20", tools: ["json-schema-generator", "json-validator"] },
  { title: "QR Code Generation Guide", description: "Create scannable QR codes for URLs, text, Wi-Fi, and contact details that work everywhere.", slug: "qr-code-guide", readTime: "5 min", category: "Generators", published: "2026-08-20", modified: "2026-08-20", tools: ["qr-generator", "wifi-qr-generator"] },
  { title: "Random Data Generation Guide", description: "Generate realistic, reproducible test data with names, emails, addresses, and UUIDs.", slug: "random-data-guide", readTime: "5 min", category: "Generators", published: "2026-08-20", modified: "2026-08-20", tools: ["random-data", "uuid-generator", "lorem-ipsum"] },
  { title: "Case Conversion Guide", description: "Convert between camelCase, PascalCase, snake_case, and kebab-case consistently.", slug: "case-conversion-guide", readTime: "4 min", category: "Encodings", published: "2026-08-20", modified: "2026-08-20", tools: ["case-converter", "slug-generator", "text-sorter"] },
  { title: "IP Subnetting Guide", description: "Calculate network addresses, usable host ranges, and masks for IPv4 and IPv6 subnets.", slug: "ip-subnetting-guide", readTime: "6 min", category: "Dev Techniques", published: "2026-08-20", modified: "2026-08-20", tools: ["ipv4-subnet-calculator", "ipv6-calculator", "ip-calculator"] },
  { title: "File Checksum Guide", description: "Verify file integrity with MD5, SHA-256, SHA-512, and CRC32 checksums in your browser.", slug: "file-checksum-guide", readTime: "5 min", category: "JWT & Security", published: "2026-08-20", modified: "2026-08-20", tools: ["file-checksum", "hash-generator"] },
  { title: "Markdown Formatting Guide", description: "Master Markdown syntax for headings, lists, links, tables, and code blocks.", slug: "markdown-guide", readTime: "6 min", category: "Dev Techniques", published: "2026-08-20", modified: "2026-08-20", tools: ["markdown-editor", "markdown-preview", "markdown-to-html"] },
  { title: "Word Count and Readability Guide", description: "Count words, characters, sentences, and estimate reading time for any text.", slug: "word-count-guide", readTime: "4 min", category: "Dev Techniques", published: "2026-08-20", modified: "2026-08-20", tools: ["word-counter"] },
  { title: "UUID Generation Guide", description: "Choose the right UUID version — v4, v7, or v5 — and generate them securely.", slug: "uuid-guide", readTime: "6 min", category: "Generators", published: "2026-08-20", modified: "2026-08-20", tools: ["uuid-generator", "ulid-generator"] },
  { title: "bcrypt Password Hashing Guide", description: "Understand how bcrypt salts, costs, and hashes passwords for secure storage.", slug: "bcrypt-guide", readTime: "5 min", category: "JWT & Security", published: "2026-08-20", modified: "2026-08-20", tools: ["bcrypt-generator", "password-strength"] },
  { title: "HMAC Authentication Guide", description: "Sign API requests and verify webhooks with HMAC-SHA256 and other keyed hashes.", slug: "hmac-guide", readTime: "5 min", category: "JWT & Security", published: "2026-08-20", modified: "2026-08-20", tools: ["hmac-generator", "hash-generator"] },
];

export const learningCategories = Array.from(
  learningTopics.reduce((acc, topic) => {
    acc.set(topic.category, (acc.get(topic.category) ?? 0) + 1);
    return acc;
  }, new Map<string, number>()),
  ([name, count]) => ({ name, count })
);