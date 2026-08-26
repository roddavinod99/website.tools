"use client";

import { useState, useCallback, useMemo } from "react";

interface MetaTagConfig {
  title: string;
  description: string;
  author: string;
  keywords: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogType: string;
  twitterCard: string;
  canonicalUrl: string;
  robots: string;
}

function generateMetaTags(config: MetaTagConfig): string {
  const tags: string[] = [];

  tags.push(`<title>${config.title || "Page Title"}</title>`);
  tags.push(`<meta name="description" content="${config.description || "Page description"}" />`);

  if (config.author) tags.push(`<meta name="author" content="${config.author}" />`);
  if (config.keywords) tags.push(`<meta name="keywords" content="${config.keywords}" />`);
  if (config.robots) tags.push(`<meta name="robots" content="${config.robots}" />`);

  if (config.canonicalUrl) tags.push(`<link rel="canonical" href="${config.canonicalUrl}" />`);

  if (config.ogTitle || config.ogDescription || config.ogImage) {
    tags.push("");
    tags.push("<!-- Open Graph / Facebook -->");
    tags.push(`<meta property="og:type" content="${config.ogType || "website"}" />`);
    if (config.canonicalUrl) tags.push(`<meta property="og:url" content="${config.canonicalUrl}" />`);
    if (config.ogTitle) tags.push(`<meta property="og:title" content="${config.ogTitle}" />`);
    if (config.ogDescription) tags.push(`<meta property="og:description" content="${config.ogDescription}" />`);
    if (config.ogImage) tags.push(`<meta property="og:image" content="${config.ogImage}" />`);
  }

  if (config.title || config.description || config.ogImage) {
    tags.push("");
    tags.push("<!-- Twitter -->");
    tags.push(`<meta name="twitter:card" content="${config.twitterCard || "summary_large_image"}" />`);
    if (config.ogTitle) tags.push(`<meta name="twitter:title" content="${config.ogTitle || config.title}" />`);
    if (config.ogDescription) tags.push(`<meta name="twitter:description" content="${config.ogDescription || config.description}" />`);
    if (config.ogImage) tags.push(`<meta name="twitter:image" content="${config.ogImage}" />`);
  }

  return tags.join("\n");
}

export function MetaTagGenerator() {
  const [config, setConfig] = useState<MetaTagConfig>({
    title: "My Awesome Page",
    description: "This is a description of my awesome page that will appear in search results.",
    author: "",
    keywords: "",
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
    ogType: "website",
    twitterCard: "summary_large_image",
    canonicalUrl: "",
    robots: "index, follow",
  });

  const [copied, setCopied] = useState(false);

  const updateField = useCallback((field: keyof MetaTagConfig, value: string) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  }, []);

  const output = useMemo(() => generateMetaTags(config), [config]);

  const copy = useCallback(async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [output]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Page Title</label>
          <input
            type="text"
            value={config.title}
            onChange={(e) => updateField("title", e.target.value)}
            placeholder="My Page Title"
            className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text dark:placeholder:text-dark-muted"
          />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Author</label>
          <input
            type="text"
            value={config.author}
            onChange={(e) => updateField("author", e.target.value)}
            placeholder="Author name"
            className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text dark:placeholder:text-dark-muted"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Description</label>
        <textarea
          value={config.description}
          onChange={(e) => updateField("description", e.target.value)}
          rows={2}
          placeholder="A brief description of the page..."
          className="w-full rounded-lg border border-surface-200 bg-white p-3 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text dark:placeholder:text-dark-muted"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Keywords</label>
          <input
            type="text"
            value={config.keywords}
            onChange={(e) => updateField("keywords", e.target.value)}
            placeholder="keyword1, keyword2, keyword3"
            className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text dark:placeholder:text-dark-muted"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Canonical URL</label>
          <input
            type="text"
            value={config.canonicalUrl}
            onChange={(e) => updateField("canonicalUrl", e.target.value)}
            placeholder="https://example.com/page"
            className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text dark:placeholder:text-dark-muted"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">OG Title</label>
          <input
            type="text"
            value={config.ogTitle}
            onChange={(e) => updateField("ogTitle", e.target.value)}
            placeholder="Open Graph title"
            className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text dark:placeholder:text-dark-muted"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">OG Image URL</label>
          <input
            type="text"
            value={config.ogImage}
            onChange={(e) => updateField("ogImage", e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text dark:placeholder:text-dark-muted"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">OG Description</label>
        <input
          type="text"
          value={config.ogDescription}
          onChange={(e) => updateField("ogDescription", e.target.value)}
          placeholder="Open Graph description"
          className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text dark:placeholder:text-dark-muted"
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">OG Type</label>
          <select
            value={config.ogType}
            onChange={(e) => updateField("ogType", e.target.value)}
            className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
          >
            <option value="website">website</option>
            <option value="article">article</option>
            <option value="product">product</option>
            <option value="profile">profile</option>
            <option value="video.other">video</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Twitter Card</label>
          <select
            value={config.twitterCard}
            onChange={(e) => updateField("twitterCard", e.target.value)}
            className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
          >
            <option value="summary">summary</option>
            <option value="summary_large_image">summary_large_image</option>
            <option value="app">app</option>
            <option value="player">player</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Robots</label>
          <select
            value={config.robots}
            onChange={(e) => updateField("robots", e.target.value)}
            className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
          >
            <option value="index, follow">index, follow</option>
            <option value="noindex, follow">noindex, follow</option>
            <option value="index, nofollow">index, nofollow</option>
            <option value="noindex, nofollow">noindex, nofollow</option>
          </select>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium text-surface-700 dark:text-dark-text">Generated HTML Meta Tags</label>
          <button
            onClick={copy}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors"
          >
            {copied ? "Copied!" : "Copy HTML"}
          </button>
        </div>
        <pre className="w-full rounded-lg border border-surface-200 bg-surface-50 p-3 font-mono text-xs text-surface-900 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text overflow-auto max-h-64 whitespace-pre-wrap">
          {output}
        </pre>
      </div>

      {config.title && (
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Search Result Preview</label>
          <div className="rounded-lg border border-surface-200 bg-white p-4 dark:border-dark-border dark:bg-dark-bg">
            <p className="text-blue-700 dark:text-blue-400 text-lg font-medium hover:underline cursor-pointer truncate">
              {config.title}
            </p>
            {config.canonicalUrl && (
              <p className="text-green-700 dark:text-green-500 text-xs truncate">{config.canonicalUrl}</p>
            )}
            <p className="text-surface-600 dark:text-dark-muted text-sm mt-1 line-clamp-2">
              {config.description || "No description provided."}
            </p>
          </div>
        </div>
      )}

      <p className="text-[10px] text-surface-400 dark:text-dark-muted text-center">
        Generated meta tags are ready to paste into your HTML &lt;head&gt; section.
      </p>
    </div>
  );
}
