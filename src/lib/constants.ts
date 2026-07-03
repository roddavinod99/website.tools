import type { Tool, Category, SiteConfig, NavItem } from "@/types";

export const siteConfig: SiteConfig = {
  name: "DevStackIO",
  description:
    "The internet's best collection of free online tools for developers. JSON formatters, JWT decoders, image compressors, and more.",
  url: "https://tools.devstackio.com",
  ogImage: "/og.png",
  links: {
    twitter: "https://twitter.com/devstackio",
    github: "https://github.com/devstackio",
  },
};

export const mainNav: NavItem[] = [
  { title: "Tools", href: "/tools" },
  { title: "Categories", href: "/categories" },
  { title: "Guides", href: "/guides" },
  { title: "Blog", href: "/blog" },
  { title: "Learning", href: "/learning" },
  { title: "API", href: "/api" },
];

export const categories: Category[] = [
  { id: "1", name: "Encoders", description: "Text and data encoding tools for converting between formats", slug: "encoders", icon: "FileCode", toolCount: 8, seoKeywords: ["encoder", "decoder", "base64", "url encoding", "html entities", "binary", "hex", "escape unescape"], seoFeatures: ["Encode and decode various formats", "Support multiple encoding schemes", "Browser-based processing for privacy", "Real-time conversion", "No data transmitted to servers", "Free and unlimited use"] },
  { id: "2", name: "Formatters", description: "Code and data formatting, beautification, and validation tools", slug: "formatters", icon: "PanelRightOpen", toolCount: 9, seoKeywords: ["formatter", "validator", "json", "code formatter", "beautifier", "minifier", "syntax validation"], seoFeatures: ["Format and validate code", "Real-time syntax checking", "Multiple format support", "Beautify and minify options", "Syntax highlighting", "Error detection and reporting"] },
  { id: "3", name: "Generators", description: "Generate IDs, passwords, QR codes, random data, and more", slug: "generators", icon: "Wand", toolCount: 8, seoKeywords: ["generator", "uuid", "password", "qr code", "random data", "barcode", "ascii art", "lorem ipsum"], seoFeatures: ["Generate unique identifiers", "Create secure passwords", "Bulk generation support", "Multiple format options", "Instant generation", "Copy to clipboard"] },
  { id: "4", name: "Converters", description: "Convert between data formats, units, colors, and timestamps", slug: "converters", icon: "ArrowLeftRight", toolCount: 16, seoKeywords: ["converter", "json to csv", "csv to json", "markdown", "timestamp", "unit converter", "color converter", "base converter"], seoFeatures: ["Convert between multiple formats", "Instant conversion results", "Support various unit systems", "Real-time conversion", "No registration required", "Free and unlimited use"] },
  { id: "5", name: "Security Tools", description: "Security, cryptography, and authentication tools", slug: "security", icon: "Shield", toolCount: 8, seoKeywords: ["security", "jwt", "hash", "totp", "ssl", "csp", "checksum", "cryptography"], seoFeatures: ["Generate cryptographic hashes", "Decode and analyze JWT tokens", "Multiple hash algorithms", "Browser-based security", "No data transmission", "Instant hash generation"] },
  { id: "6", name: "Image Tools", description: "Image processing, optimization, and conversion tools", slug: "image-tools", icon: "Image", toolCount: 9, seoKeywords: ["image", "resizer", "compressor", "favicon", "svg", "exif", "placeholder", "base64 image"], seoFeatures: ["Resize images to any dimensions", "Compress images for web", "Convert between image formats", "Browser-based processing for privacy", "No uploads required", "Free and unlimited use"] },
  { id: "7", name: "Utilities", description: "Text analysis, development, and utility tools", slug: "utilities", icon: "Wrench", toolCount: 12, seoKeywords: ["utilities", "regex", "diff", "word counter", "text analysis", "cron", "url parser", "user agent"], seoFeatures: ["Analyze and compare text", "Test regular expressions", "Count words and characters", "Real-time analysis", "Browser-based processing", "Free to use"] },
];

export const allTools: Tool[] = [
  // ── Encoders (8) ──
  { id: "e1", name: "Base64 Encoder/Decoder", description: "Encode and decode Base64 strings online free", category: "Encoders", slug: "base64", popularity: 95, icon: "FileCode", featured: true, trending: true },
  { id: "e2", name: "URL Encoder/Decoder", description: "Encode and decode URLs and URL components online free", category: "Encoders", slug: "url-encoder", popularity: 90, icon: "Link", featured: true },
  { id: "e3", name: "HTML Entity Encoder/Decoder", description: "Encode and decode HTML entities for web development", category: "Encoders", slug: "html-entity", popularity: 70, icon: "Code" },
  { id: "e4", name: "Binary Encoder/Decoder", description: "Convert text to binary and binary to text online free", category: "Encoders", slug: "binary", popularity: 65, icon: "Binary" },
  { id: "e5", name: "Hex Encoder/Decoder", description: "Convert text to hexadecimal and vice versa online free", category: "Encoders", slug: "hex", popularity: 68, icon: "Hash" },
  { id: "e6", name: "String Escape/Unescape", description: "Escape and unescape strings for JavaScript, JSON, HTML, URL, and more", category: "Encoders", slug: "escape-unescape", popularity: 72, icon: "Quote" },
  { id: "e7", name: "Base64 Image Converter", description: "Convert images to Base64 encoded strings for embedding in HTML/CSS", category: "Encoders", slug: "image-to-base64", popularity: 74, icon: "Image" },
  { id: "e8", name: "Morse Code Converter", description: "Convert text to Morse code and vice versa with audio playback", category: "Encoders", slug: "morse-code", popularity: 55, icon: "Circle" },

  // ── Formatters (9) ──
  { id: "f1", name: "JSON Formatter", description: "Format, validate, and minify JSON data with syntax highlighting", category: "Formatters", slug: "json-formatter", popularity: 98, icon: "Braces", featured: true, trending: true },
  { id: "f2", name: "HTML Formatter/Validator", description: "Format, validate, and minify HTML code online free", category: "Formatters", slug: "html-formatter", popularity: 82, icon: "Code" },
  { id: "f3", name: "CSS Formatter/Minifier", description: "Format, beautify, and minify CSS code online free", category: "Formatters", slug: "css-formatter", popularity: 78, icon: "Palette" },
  { id: "f4", name: "JavaScript Minifier/Beautifier", description: "Minify, beautify, and validate JavaScript code with customizable options", category: "Formatters", slug: "js-minifier", popularity: 85, icon: "FileCode", featured: true },
  { id: "f5", name: "SQL Formatter", description: "Format and beautify SQL queries with syntax validation", category: "Formatters", slug: "sql-formatter", popularity: 92, icon: "Database", featured: true },
  { id: "f6", name: "XML Formatter/Validator", description: "Format, validate, and minify XML documents online", category: "Formatters", slug: "xml-formatter", popularity: 72, icon: "FileX" },
  { id: "f7", name: "YAML Formatter/Validator", description: "Format, validate, and minify YAML files online free", category: "Formatters", slug: "yaml-formatter", popularity: 70, icon: "FileType" },
  { id: "f8", name: "Text Analyzer", description: "Comprehensive text analysis with character, word, and language statistics", category: "Formatters", slug: "text-analyzer", popularity: 76, icon: "Hash" },
  { id: "f9", name: "JSON Diff Checker", description: "Compare two JSON objects and highlight their differences side-by-side", category: "Formatters", slug: "json-diff", popularity: 75, icon: "GitCompare", featured: true },

  // ── Generators (8) ──
  { id: "g1", name: "UUID Generator", description: "Generate UUIDs (Universally Unique Identifiers) v4 and v7", category: "Generators", slug: "uuid-generator", popularity: 90, icon: "FingerprintPattern", featured: true },
  { id: "g2", name: "Password Generator", description: "Generate secure, random passwords with customizable options", category: "Generators", slug: "password-generator", popularity: 85, icon: "Lock", featured: true },
  { id: "g3", name: "QR Code Generator", description: "Generate customizable QR codes with advanced styling options", category: "Generators", slug: "qr-generator", popularity: 88, icon: "QrCode", featured: true, trending: true },
  { id: "g4", name: "Random Data Generator", description: "Generate realistic random data for testing and development", category: "Generators", slug: "random-data", popularity: 74, icon: "Shuffle" },
  { id: "g5", name: "ASCII Art Generator", description: "Generate ASCII art text with various fonts and styles", category: "Generators", slug: "ascii-art", popularity: 62, icon: "TextCursor" },
  { id: "g6", name: "Barcode Generator", description: "Generate barcodes in various formats (Code128, EAN, UPC, etc.)", category: "Generators", slug: "barcode-generator", popularity: 66, icon: "Barcode" },
  { id: "g7", name: "Lorem Ipsum Generator", description: "Generate placeholder text with multiple styles including Lorem Ipsum and more", category: "Generators", slug: "lorem-ipsum", popularity: 70, icon: "Type" },
  { id: "g8", name: "Cron Expression Generator", description: "Build and validate cron expressions with visual editor and timezone support", category: "Generators", slug: "cron-expression", popularity: 60, icon: "Clock" },

  // ── Converters (16) ──
  { id: "c1", name: "JSON to CSV Converter", description: "Convert JSON data to CSV format with advanced formatting options", category: "Converters", slug: "json-to-csv", popularity: 84, icon: "Table", featured: true },
  { id: "c2", name: "CSV to JSON Converter", description: "Convert CSV data to JSON format with advanced parsing options", category: "Converters", slug: "csv-to-json", popularity: 82, icon: "FileSpreadsheet" },
  { id: "c3", name: "JSON to XML Converter", description: "Convert JSON data to XML format with customizable options", category: "Converters", slug: "json-to-xml", popularity: 68, icon: "FileX" },
  { id: "c4", name: "XML to JSON Converter", description: "Convert XML data to JSON format with customizable options", category: "Converters", slug: "xml-to-json", popularity: 70, icon: "FileCode" },
  { id: "c5", name: "Markdown to HTML Converter", description: "Convert Markdown to HTML with live preview and GFM support", category: "Converters", slug: "markdown-to-html", popularity: 78, icon: "FileText" },
  { id: "c6", name: "HTML to Markdown Converter", description: "Convert HTML code to Markdown format with customizable options", category: "Converters", slug: "html-to-markdown", popularity: 72, icon: "FileDown" },
  { id: "c7", name: "JSON to YAML Converter", description: "Convert JSON data to YAML format and vice versa", category: "Converters", slug: "json-to-yaml", popularity: 74, icon: "FileType" },
  { id: "c8", name: "TOML/JSON/YAML Converter", description: "Convert between TOML, JSON, and YAML formats", category: "Converters", slug: "toml-converter", popularity: 58, icon: "Repeat" },
  { id: "c9", name: "Timestamp Converter", description: "Convert Unix timestamps to human-readable dates and back", category: "Converters", slug: "timestamp-converter", popularity: 79, icon: "Clock", featured: true },
  { id: "c10", name: "Color Converter", description: "Convert between color formats (HEX, RGB, HSL, HSV, CMYK) and generate palettes", category: "Converters", slug: "color-converter", popularity: 76, icon: "Palette" },
  { id: "c11", name: "Unit Converter", description: "Convert between different units of measurement online free", category: "Converters", slug: "unit-converter", popularity: 72, icon: "Ruler" },
  { id: "c12", name: "Case Converter", description: "Convert text between camelCase, snake_case, kebab-case and more", category: "Converters", slug: "case-converter", popularity: 68, icon: "CaseSensitive" },
  { id: "c13", name: "Base Converter", description: "Convert numbers between binary, octal, decimal, hexadecimal, and base36", category: "Converters", slug: "base-converter", popularity: 64, icon: "Binary" },
  { id: "c14", name: "Number to Words", description: "Convert numbers to words in English", category: "Converters", slug: "number-to-words", popularity: 56, icon: "Heading" },
  { id: "c15", name: "JSON to TypeScript", description: "Generate TypeScript interfaces and types from JSON data", category: "Converters", slug: "json-to-typescript", popularity: 80, icon: "FileCode", featured: true, new: true },
  { id: "c16", name: "JSON to Go Struct", description: "Generate Go struct definitions from JSON data", category: "Converters", slug: "json-to-go", popularity: 66, icon: "FileCode" },

  // ── Security Tools (8) ──
  { id: "s1", name: "JWT Decoder", description: "Decode and analyze JWT tokens online free", category: "Security Tools", slug: "jwt-decoder", popularity: 95, icon: "Key", featured: true, trending: true },
  { id: "s2", name: "JWT Generator", description: "Generate JSON Web Tokens with custom claims and multiple algorithms", category: "Security Tools", slug: "jwt-generator", popularity: 78, icon: "KeyRound" },
  { id: "s3", name: "Hash Generator", description: "Generate MD5, SHA-1, SHA-256, SHA-384, and SHA-512 hashes for text and files", category: "Security Tools", slug: "hash-generator", popularity: 81, icon: "Shield", featured: true },
  { id: "s4", name: "TOTP Generator", description: "Generate Time-based One-Time Passwords for two-factor authentication", category: "Security Tools", slug: "totp-generator", popularity: 72, icon: "Smartphone" },
  { id: "s5", name: "SSL Certificate Decoder", description: "Decode and analyze PEM/X.509 SSL certificates", category: "Security Tools", slug: "ssl-decoder", popularity: 68, icon: "ShieldCheck" },
  { id: "s6", name: "CSP Generator", description: "Generate Content Security Policy headers with visual builder", category: "Security Tools", slug: "csp-generator", popularity: 62, icon: "ShieldAlert" },
  { id: "s7", name: "File Checksum Calculator", description: "Calculate and verify file checksums (MD5, SHA-1, SHA-256, SHA-512)", category: "Security Tools", slug: "file-checksum", popularity: 66, icon: "FileCheck" },
  { id: "s8", name: "JSON Schema Generator", description: "Generate JSON Schema from sample JSON data automatically", category: "Security Tools", slug: "json-schema-generator", popularity: 74, icon: "Files", new: true },

  // ── Image Tools (9) ──
  { id: "i1", name: "Image Compressor", description: "Compress images with quality control for JPEG, PNG, and WebP formats", category: "Image Tools", slug: "image-compressor", popularity: 87, icon: "ImageMinus", featured: true },
  { id: "i2", name: "Image Resizer", description: "Resize, compress and convert images with batch processing support", category: "Image Tools", slug: "image-resizer", popularity: 83, icon: "Crop", featured: true },
  { id: "i3", name: "Favicon Generator", description: "Create favicons from images or text for all platforms and devices", category: "Image Tools", slug: "favicon-generator", popularity: 70, icon: "Square" },
  { id: "i4", name: "SVG Optimizer", description: "Optimize and minify SVG files with SVGO", category: "Image Tools", slug: "svg-optimizer", popularity: 68, icon: "Image" },
  { id: "i5", name: "Placeholder Image Generator", description: "Generate placeholder images with custom dimensions and colors", category: "Image Tools", slug: "placeholder-image", popularity: 64, icon: "ImagePlus" },
  { id: "i6", name: "SVG to CSS Converter", description: "Convert SVG code to CSS background-image with optimized data URI", category: "Image Tools", slug: "svg-to-css", popularity: 66, icon: "FileCode" },
  { id: "i7", name: "EXIF Reader", description: "Extract and view EXIF metadata from images", category: "Image Tools", slug: "exif-reader", popularity: 72, icon: "Info" },
  { id: "i8", name: "EXIF Transfer", description: "Transfer EXIF metadata from one image to another while preserving image quality", category: "Image Tools", slug: "exif-transfer", popularity: 52, icon: "ArrowLeftRight" },
  { id: "i9", name: "Color Eyedropper", description: "Pick and extract colors from anywhere on your screen for designers", category: "Image Tools", slug: "color-eyedropper", popularity: 60, icon: "Droplets" },

  // ── Utilities (13) ──
  { id: "u1", name: "Regex Tester", description: "Test and debug regular expressions with real-time matching, capture groups, and extended flags", category: "Utilities", slug: "regex-tester", popularity: 77, icon: "SearchCode", featured: true },
  { id: "u2", name: "Text Diff Checker", description: "Compare two texts and visualize their differences with side-by-side or unified views", category: "Utilities", slug: "diff-checker", popularity: 64, icon: "GitCompare" },
  { id: "u3", name: "Word Counter", description: "Count words, characters, sentences, and analyze text readability with Flesch scores", category: "Utilities", slug: "word-counter", popularity: 80, icon: "Hash", featured: true },
  { id: "u4", name: "Text Sorter & Deduplicator", description: "Sort lines, remove duplicates, filter empty lines, and randomize text", category: "Utilities", slug: "text-sorter", popularity: 62, icon: "ArrowUpDown" },
  { id: "u5", name: "HTTP Header Parser", description: "Parse and analyze HTTP request and response headers", category: "Utilities", slug: "http-header-parser", popularity: 68, icon: "Globe" },
  { id: "u6", name: "URL Parser", description: "Parse and analyze URL components (protocol, host, path, query, hash)", category: "Utilities", slug: "url-parser", popularity: 70, icon: "Link2" },
  { id: "u7", name: "User Agent Parser", description: "Parse and analyze browser User-Agent strings", category: "Utilities", slug: "user-agent-parser", popularity: 66, icon: "Monitor" },
  { id: "u8", name: "IP Address Calculator", description: "Calculate subnet masks, CIDR notation, and IP ranges", category: "Utilities", slug: "ip-calculator", popularity: 74, icon: "Network", featured: true },
  { id: "u9", name: "JSON Path Finder", description: "Find and extract JSON values using JSONPath expressions", category: "Utilities", slug: "json-path-finder", popularity: 72, icon: "Search" },
  { id: "u10", name: "Markdown Preview", description: "Live preview and edit Markdown with syntax highlighting", category: "Utilities", slug: "markdown-preview", popularity: 76, icon: "FileText" },
  { id: "u11", name: "Slug Generator", description: "Generate URL-safe slugs from text with transliteration support", category: "Utilities", slug: "slug-generator", popularity: 60, icon: "Link" },
  { id: "u12", name: "String Length Calculator", description: "Calculate string length in bytes, characters, and code points", category: "Utilities", slug: "string-length", popularity: 58, icon: "Ruler" },
];

export const featuredTools: Tool[] = allTools.filter((t) => t.featured);

export const benefits = [
  { title: "Free Forever", description: "All tools are completely free. No hidden charges, no credit card needed.", icon: "Gift" },
  { title: "Browser-Based", description: "Everything runs in your browser. No downloads or installations required.", icon: "Globe" },
  { title: "No Login", description: "Start using tools immediately. No account creation, no passwords to remember.", icon: "LogOut" },
  { title: "Privacy-First", description: "Your data stays on your device. We never store or share your information.", icon: "Shield" },
  { title: "Lightning Fast", description: "Optimized for speed. Tools load instantly and respond in real-time.", icon: "Zap" },
  { title: "Mobile Friendly", description: "Fully responsive design that works on any device, from phone to desktop.", icon: "Smartphone" },
  { title: "Keyboard Shortcuts", description: "Power-user shortcuts for efficient workflows and quick tool access.", icon: "Keyboard" },
  { title: "Secure", description: "HTTPS everywhere. Your data is encrypted in transit and never persisted.", icon: "Lock" },
];

export const learningTopics = [
  { title: "Getting Started with JSON", description: "Learn the fundamentals of JSON syntax, structure, and common use cases in modern web development.", slug: "getting-started-json", readTime: "5 min" },
  { title: "Understanding JWT Tokens", description: "A comprehensive guide to JSON Web Tokens, how they work, and best practices for implementation.", slug: "understanding-jwt", readTime: "8 min" },
  { title: "Image Optimization Guide", description: "Best practices for optimizing images for the web without sacrificing quality.", slug: "image-optimization-guide", readTime: "6 min" },
  { title: "Password Security Best Practices", description: "How to create and manage secure passwords, plus common pitfalls to avoid.", slug: "password-security", readTime: "4 min" },
  { title: "Understanding Base64 Encoding", description: "What Base64 is, how it works, and when to use it in web development.", slug: "understanding-base64", readTime: "6 min" },
  { title: "CSS Minification Guide", description: "How to minify CSS for production and why it matters for performance.", slug: "css-minification-guide", readTime: "5 min" },
  { title: "Regex Fundamentals", description: "Learn regular expressions from basics to advanced patterns with practical examples.", slug: "regex-fundamentals", readTime: "10 min" },
  { title: "Unix Timestamps Explained", description: "Everything you need to know about Unix timestamps, timezones, and date handling.", slug: "unix-timestamps-explained", readTime: "7 min" },
  { title: "HTML Encoding & Special Characters", description: "A guide to HTML entities, special characters, and why encoding matters for security.", slug: "html-encoding-guide", readTime: "5 min" },
  { title: "Data Serialization Formats", description: "Compare JSON, YAML, TOML, and XML to choose the right format for your project.", slug: "data-serialization-formats", readTime: "8 min" },
];

export const faqItems = [
  { question: "Are the tools really free?", answer: "Yes, all tools on DevStackIO are completely free. We believe developer tools should be accessible to everyone." },
  { question: "Do I need to create an account?", answer: "No. Every tool works without any account or login. Just open and use." },
  { question: "Is my data secure?", answer: "All processing happens in your browser. Your data never leaves your device, and we never store or share your information." },
  { question: "Can I use these tools offline?", answer: "Many tools work offline after the first load. We're working on expanding offline support." },
  { question: "How do you sustain the platform?", answer: "We're building a premium API for enterprise users. All web tools remain free forever." },
  { question: "How many tools are available?", answer: "We currently offer 70 free tools across 7 categories, with new tools added regularly." },
  { question: "Do you support mobile devices?", answer: "Yes, all tools are fully responsive and work on smartphones, tablets, and desktops." },
  { question: "Can I request a new tool?", answer: "Absolutely! Use the Suggest a Tool page to let us know what you need." },
];
