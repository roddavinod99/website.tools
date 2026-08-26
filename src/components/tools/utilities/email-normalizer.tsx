"use client";

import { useState } from "react";

function normalizeEmail(email: string, options: { lowercase: boolean; stripDots: boolean; stripPlus: boolean; trimWhitespace: boolean }): string {
  let result = email.trim();
  if (options.trimWhitespace) result = result.trim();
  if (options.lowercase) result = result.toLowerCase();
  const atIdx = result.indexOf("@");
  if (atIdx === -1) return result;
  let local = result.slice(0, atIdx);
  const domain = result.slice(atIdx + 1);
  if (options.stripDots) local = local.replaceAll(".", "");
  if (options.stripPlus) {
    const plusIdx = local.indexOf("+");
    if (plusIdx !== -1) local = local.slice(0, plusIdx);
  }
  return `${local}@${domain}`;
}

export function EmailNormalizer() {
  const [input, setInput] = useState("");
  const [lowercase, setLowercase] = useState(true);
  const [stripDots, setStripDots] = useState(false);
  const [stripPlus, setStripPlus] = useState(true);
  const [trimWhitespace, setTrimWhitespace] = useState(true);
  const [results, setResults] = useState<{ original: string; normalized: string }[]>([]);
  const [copied, setCopied] = useState(false);

  const normalize = () => {
    const lines = input.split("\n").map((l) => l.trim()).filter(Boolean);
    const res = lines.map((line) => ({
      original: line,
      normalized: normalizeEmail(line, { lowercase, stripDots, stripPlus, trimWhitespace }),
    }));
    setResults(res);
  };

  const deduplicate = () => {
    const lines = input.split("\n").map((l) => l.trim()).filter(Boolean);
    const normalizedSet = new Set<string>();
    const unique: string[] = [];
    for (const line of lines) {
      const norm = normalizeEmail(line, { lowercase, stripDots, stripPlus, trimWhitespace });
      if (!normalizedSet.has(norm)) {
        normalizedSet.add(norm);
        unique.push(line);
      }
    }
    setInput(unique.join("\n"));
    const res = unique.map((line) => ({
      original: line,
      normalized: normalizeEmail(line, { lowercase, stripDots, stripPlus, trimWhitespace }),
    }));
    setResults(res);
  };

  const copyAll = async () => {
    const text = results.map((r) => r.normalized).join("\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">
          Email Addresses
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={5}
          placeholder={"Enter email addresses, one per line:\njohn.doe@gmail.com\nJOHN.DOE+work@gmail.com\n  john.Doe@Example.com"}
          className="w-full rounded-lg border border-surface-200 bg-white p-3 font-mono text-sm dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <label className="flex items-center gap-2 text-sm text-surface-700 dark:text-dark-text">
          <input
            type="checkbox"
            checked={lowercase}
            onChange={(e) => setLowercase(e.target.checked)}
            className="accent-brand-500"
          />
          Lowercase
        </label>
        <label className="flex items-center gap-2 text-sm text-surface-700 dark:text-dark-text">
          <input
            type="checkbox"
            checked={stripDots}
            onChange={(e) => setStripDots(e.target.checked)}
            className="accent-brand-500"
          />
          Strip Dots
        </label>
        <label className="flex items-center gap-2 text-sm text-surface-700 dark:text-dark-text">
          <input
            type="checkbox"
            checked={stripPlus}
            onChange={(e) => setStripPlus(e.target.checked)}
            className="accent-brand-500"
          />
          Strip + Aliases
        </label>
        <label className="flex items-center gap-2 text-sm text-surface-700 dark:text-dark-text">
          <input
            type="checkbox"
            checked={trimWhitespace}
            onChange={(e) => setTrimWhitespace(e.target.checked)}
            className="accent-brand-500"
          />
          Trim Whitespace
        </label>
      </div>

      <p className="text-xs text-surface-500 dark:text-dark-muted">
        Gmail ignores dots and +aliases: <code>john.doe+work@gmail.com</code> = <code>johndoe@gmail.com</code>
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={normalize}
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors"
        >
          Normalize
        </button>
        <button
          onClick={deduplicate}
          className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors"
        >
          Deduplicate
        </button>
        {results.length > 0 && (
          <button
            onClick={copyAll}
            className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors"
          >
            {copied ? "Copied!" : "Copy All"}
          </button>
        )}
      </div>

      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((r, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-3 rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 dark:border-dark-border dark:bg-dark-surface"
            >
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-wider text-surface-400 dark:text-dark-muted mb-0.5">
                  Original
                </p>
                <p className="text-xs font-mono text-surface-500 dark:text-dark-muted truncate">
                  {r.original}
                </p>
              </div>
              <span className="text-surface-300 dark:text-dark-muted">→</span>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-wider text-surface-400 dark:text-dark-muted mb-0.5">
                  Normalized
                </p>
                <p className="text-sm font-mono text-surface-900 dark:text-dark-text truncate select-all">
                  {r.normalized}
                </p>
              </div>
            </div>
          ))}
          <p className="text-xs text-surface-500 dark:text-dark-muted">
            {results.length} email{results.length !== 1 ? "s" : ""} processed
            {results.filter((r) => r.original !== r.normalized).length > 0 &&
              ` · ${results.filter((r) => r.original !== r.normalized).length} changed`}
          </p>
        </div>
      )}
    </div>
  );
}
