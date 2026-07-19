import { promises as fs } from "fs";
import path from "path";
import { siteConfig } from "./constants";

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
