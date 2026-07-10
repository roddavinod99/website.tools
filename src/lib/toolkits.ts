import { allTools } from "./constants";

export interface Toolkit {
  name: string;
  description: string;
  slug: string;
  icon: string;
  toolCount: number;
  color: string;
}

const toolkitSlugs: Record<string, string[]> = {
  "json-toolkit": [
    "json-formatter", "json-validator", "json-minifier", "json-beautifier",
    "json-diff", "json-to-csv", "json-to-yaml", "json-to-xml",
    "xml-to-json", "json-to-typescript", "json-to-go",
    "json-schema-generator", "json-path-finder",
  ],
  "encoder-toolkit": [
    "base64", "url-encoder", "html-entity", "binary",
    "hex", "escape-unescape", "image-to-base64", "morse-code",
  ],
  "generator-toolkit": [
    "uuid-generator", "password-generator", "qr-generator",
    "barcode-generator", "lorem-ipsum", "random-data",
    "ascii-art", "cron-expression",
  ],
  "security-toolkit": [
    "hash-generator", "jwt-decoder", "jwt-generator",
    "totp-generator", "ssl-decoder", "csp-generator", "file-checksum",
  ],
  "image-toolkit": [
    "image-compressor", "image-resizer", "svg-optimizer",
    "favicon-generator", "placeholder-image", "exif-reader",
    "svg-to-css", "color-eyedropper",
  ],
  "text-toolkit": [
    "word-counter", "text-analyzer", "case-converter",
    "text-sorter", "diff-checker", "slug-generator",
    "string-length", "number-to-words",
  ],
  "dev-toolkit": [
    "css-formatter", "html-formatter", "sql-formatter",
    "xml-formatter", "yaml-formatter", "js-minifier",
    "ip-calculator", "url-parser", "http-header-parser",
    "user-agent-parser", "regex-tester", "markdown-preview",
    "timestamp-converter", "color-converter", "unit-converter",
    "base-converter",
  ],
};

function getToolkitCount(slug: string): number {
  const slugs = toolkitSlugs[slug];
  if (!slugs) return 0;
  return allTools.filter((t) => slugs.includes(t.slug)).length;
}

export const toolkits: Record<string, Toolkit> = {
  "json-toolkit": {
    name: "JSON Toolkit",
    description: "Format, validate, diff, convert, and generate code from JSON — all in one place.",
    slug: "json-toolkit",
    icon: "Braces",
    toolCount: getToolkitCount("json-toolkit"),
    color: "bg-amber-500",
  },
  "encoder-toolkit": {
    name: "Encoder Toolkit",
    description: "Encode and decode data with Base64, URL, HTML entities, binary, hex, and more.",
    slug: "encoder-toolkit",
    icon: "FileCode",
    toolCount: getToolkitCount("encoder-toolkit"),
    color: "bg-blue-500",
  },
  "generator-toolkit": {
    name: "Generator Toolkit",
    description: "Generate UUIDs, passwords, QR codes, barcodes, lorem ipsum, and random data.",
    slug: "generator-toolkit",
    icon: "Wand2",
    toolCount: getToolkitCount("generator-toolkit"),
    color: "bg-purple-500",
  },
  "security-toolkit": {
    name: "Security Toolkit",
    description: "Hash data, decode JWT tokens, generate TOTP codes, analyze SSL certificates, and more.",
    slug: "security-toolkit",
    icon: "Shield",
    toolCount: getToolkitCount("security-toolkit"),
    color: "bg-red-500",
  },
  "image-toolkit": {
    name: "Image Toolkit",
    description: "Compress, resize, optimize, and analyze images. Generate favicons and placeholders.",
    slug: "image-toolkit",
    icon: "Image",
    toolCount: getToolkitCount("image-toolkit"),
    color: "bg-green-500",
  },
  "text-toolkit": {
    name: "Text Toolkit",
    description: "Analyze, convert, sort, compare, and transform text with tools for every task.",
    slug: "text-toolkit",
    icon: "Hash",
    toolCount: getToolkitCount("text-toolkit"),
    color: "bg-teal-500",
  },
  "dev-toolkit": {
    name: "Developer Toolkit",
    description: "Format code, parse network data, convert units, and debug with development utilities.",
    slug: "dev-toolkit",
    icon: "Wrench",
    toolCount: getToolkitCount("dev-toolkit"),
    color: "bg-indigo-500",
  },
};
