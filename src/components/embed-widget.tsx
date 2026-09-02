"use client";

import { useState, useCallback } from "react";
import { Code2, Copy, Check, X, ExternalLink } from "lucide-react";
import { siteConfig } from "@/lib/data";

/**
 * EmbedWidget — a self-contained "copy embed code" modal that surfaces on
 * every tool page and every long-tail /convert/* landing page.
 *
 * Backlink strategy: the widget emits an iframe snippet pointing at
 * `/embed/<slug>`. Anyone who pastes the snippet into a blog, Stack
 * Overflow answer, or documentation page gets a free backlink to
 * tools.devstackio.com — and we earn the SEO equity without doing
 * outreach manually.
 *
 * The default iframe is 600x400, but width/height are user-editable.
 * The preview iframe uses the same `/embed/<slug>` route so what users
 * see is what they'll actually get.
 */
export function EmbedWidget({ slug, title }: { slug: string; title: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [width, setWidth] = useState(600);
  const [height, setHeight] = useState(400);

  const embedUrl = `${siteConfig.url.replace(/\/+$/, "")}/embed/${slug}`;
  const embedCode = `<iframe src="${embedUrl}" width="${width}" height="${height}" frameborder="0" title="${title.replace(/"/g, "&quot;")}" loading="lazy"></iframe>`;

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // older browser or clipboard blocked — silent fallback
    }
  }, [embedCode]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-surface-200 bg-white px-3.5 py-2 text-sm font-medium text-surface-700 transition-colors hover:border-brand-500 hover:text-brand-500 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:hover:border-brand-400 dark:hover:text-brand-400"
      >
        <Code2 className="h-4 w-4" aria-hidden="true" />
        Embed this tool
        <ExternalLink className="h-3 w-3 opacity-60" aria-hidden="true" />
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Embed this tool"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl dark:bg-dark-surface">
            <div className="flex items-center justify-between border-b border-surface-200 p-4 dark:border-dark-border">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-surface-900 dark:text-dark-text">
                <Code2 className="h-5 w-5" aria-hidden="true" />
                Embed {title}
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded p-1 text-surface-500 hover:bg-surface-100 hover:text-surface-900 dark:text-dark-muted dark:hover:bg-dark-border dark:hover:text-dark-text"
                aria-label="Close"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <div className="space-y-4 p-4">
              <p className="text-sm text-surface-600 dark:text-dark-muted">
                Copy this snippet into your blog, docs, or Stack Overflow
                answer. The iframe loads this tool with a minimal layout
                (no chrome, no ads).
              </p>
              <div className="grid grid-cols-2 gap-3">
                <label className="text-sm">
                  <span className="block text-xs font-medium text-surface-500 dark:text-dark-muted">Width</span>
                  <input
                    type="number"
                    min={300}
                    max={1200}
                    value={width}
                    onChange={(e) => setWidth(parseInt(e.target.value, 10) || 600)}
                    className="mt-1 w-full rounded border border-surface-200 bg-white px-2 py-1 text-surface-900 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
                  />
                </label>
                <label className="text-sm">
                  <span className="block text-xs font-medium text-surface-500 dark:text-dark-muted">Height</span>
                  <input
                    type="number"
                    min={200}
                    max={1200}
                    value={height}
                    onChange={(e) => setHeight(parseInt(e.target.value, 10) || 400)}
                    className="mt-1 w-full rounded border border-surface-200 bg-white px-2 py-1 text-surface-900 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
                  />
                </label>
              </div>
              <div className="relative">
                <textarea
                  readOnly
                  value={embedCode}
                  rows={4}
                  className="w-full rounded-lg border border-surface-200 bg-surface-50 p-3 font-mono text-xs text-surface-900 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
                  aria-label="Embed code"
                />
                <button
                  type="button"
                  onClick={copy}
                  className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-md border border-surface-200 bg-white px-2 py-1 text-xs font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:hover:bg-dark-border"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3" aria-hidden="true" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" aria-hidden="true" /> Copy
                    </>
                  )}
                </button>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-surface-200 bg-white px-3 py-1.5 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:hover:bg-dark-border"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
