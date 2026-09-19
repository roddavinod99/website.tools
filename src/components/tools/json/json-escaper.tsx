"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import { validateFileUpload } from "@/lib/file-security";

type Tab = "escape" | "unescape";

function escapeJsonString(input: string): string {
  return JSON.stringify(input).slice(1, -1);
}

function unescapeJsonString(input: string): string {
  const trimmed = input.trim();
  // Try JSON.parse with wrapping quotes if not already quoted
  const toParse = trimmed.startsWith('"') && trimmed.endsWith('"') ? trimmed : `"${trimmed}"`;
  try {
    return JSON.parse(toParse);
  } catch {
    // manual unescape fallback
    return input
      .replace(/\\"/g, '"')
      .replace(/\\'/g, "'")
      .replace(/\\\\/g, "\\")
      .replace(/\\n/g, "\n")
      .replace(/\\r/g, "\r")
      .replace(/\\t/g, "\t")
      .replace(/\\b/g, "\b")
      .replace(/\\f/g, "\f")
      .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  }
}

function escapeWithUnicode(input: string, unicode: boolean): string {
  let escaped = escapeJsonString(input);
  if (unicode) {
    escaped = escaped.replace(/[\u0080-\uFFFF]/g, (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, "0")}`);
  }
  return escaped;
}

export function JsonEscaper() {
  const [tab, setTab] = useState<Tab>("escape");
  const [input, setInput] = useState('Hello "world"\nLine 2 with \\ backslash and unicode: café 🎉');
  const [unicode, setUnicode] = useState(false);
  const [wrapQuotes, setWrapQuotes] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const { output, computedError } = useMemo(() => {
    if (!input) return { output: "", computedError: "" };
    try {
      if (tab === "escape") {
        const esc = escapeWithUnicode(input, unicode);
        return { output: wrapQuotes ? `"${esc}"` : esc, computedError: "" };
      } else {
        const res = unescapeJsonString(input);
        // check if JSON.parse would have succeeded, else no error (manual fallback succeeded)
        return { output: res, computedError: "" };
      }
    } catch (e) {
      return { output: "", computedError: (e as Error).message };
    }
  }, [input, tab, unicode, wrapQuotes]);

  const displayError = useMemo(() => {
    if (computedError) return computedError;
    if (tab !== "unescape" || !input) return "";
    try {
      const trimmed = input.trim();
      const toParse = trimmed.startsWith('"') && trimmed.endsWith('"') ? trimmed : `"${trimmed}"`;
      JSON.parse(toParse);
      return "";
    } catch (e) {
      if (input.includes("\\")) {
        return (e as Error).message;
      }
      return "";
    }
  }, [input, tab, computedError]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [output]);

  const handleFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await validateFileUpload(file);
    if (!result.valid) {
      setError(result.error || "Invalid file");
      return;
    }
    const text = await file.text();
    setInput(text);
    setError("");
    if (fileRef.current) fileRef.current.value = "";
  }, []);

  const handleSwap = () => {
    setInput(output);
    setTab(tab === "escape" ? "unescape" : "escape");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(["escape", "unescape"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            aria-label={`Switch to ${t} tab`}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              tab === t ? "bg-brand-500 text-white" : "border border-surface-200 text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface"
            }`}
          >
            {t === "escape" ? "Escape" : "Unescape"}
          </button>
        ))}
        <button
          onClick={handleSwap}
          aria-label="Swap input and output"
          className="rounded-md border border-surface-200 px-3 py-1.5 text-xs font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface"
        >
          Swap ⇄
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-1.5 text-xs text-surface-700 dark:text-dark-text cursor-pointer">
          <input type="checkbox" checked={unicode} onChange={(e) => setUnicode(e.target.checked)} className="accent-brand-500" />
          Escape Unicode as \uXXXX
        </label>
        {tab === "escape" && (
          <label className="flex items-center gap-1.5 text-xs text-surface-700 dark:text-dark-text cursor-pointer">
            <input type="checkbox" checked={wrapQuotes} onChange={(e) => setWrapQuotes(e.target.checked)} className="accent-brand-500" />
            Wrap in quotes
          </label>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Input</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={5}
          spellCheck={false}
          placeholder={tab === "escape" ? "Enter raw text to escape..." : "Enter escaped JSON string..."}
          aria-label={tab === "escape" ? "Raw text input" : "Escaped JSON input"}
          className="w-full rounded-md border border-surface-200 bg-white p-3 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text"
        />
        <div className="mt-1 flex items-center gap-2">
          <input ref={fileRef} type="file" accept=".txt,.json,.js,.ts,.csv,.md" onChange={handleFile} className="text-xs text-surface-500 dark:text-dark-muted file:mr-2 file:rounded file:border-0 file:bg-brand-50 file:px-2 file:py-0.5 file:text-xs file:font-medium file:text-brand-700 dark:file:bg-brand-900/30 dark:file:text-brand-400" aria-label="Upload file" />
          <span className="text-xs text-surface-400 dark:text-dark-muted">{input.length} chars · {new TextEncoder().encode(input).length} bytes</span>
        </div>
      </div>

      {(error || displayError) && (
        <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error || displayError}
        </div>
      )}

      <div className="flex gap-2">
        <button onClick={handleCopy} disabled={!output} aria-label="Copy output" className="rounded bg-brand-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-600 disabled:opacity-40">
          {copied ? "Copied!" : "Copy"}
        </button>
        <button onClick={() => setInput("")} aria-label="Clear input" className="rounded border border-surface-200 px-3 py-1.5 text-xs font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text">
          Clear
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">{tab === "escape" ? "Escaped Output" : "Unescaped Output"}</label>
        <pre
          data-testid="tool-output"
          className="w-full rounded-md border border-surface-200 bg-surface-50 p-3 text-sm font-mono text-surface-900 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text overflow-auto max-h-80 whitespace-pre-wrap break-all"
        >
          {output || <span className="text-surface-400 dark:text-dark-muted">Output will appear here</span>}
        </pre>
        <div className="mt-1 flex gap-2 text-xs text-surface-500 dark:text-dark-muted">
          <span>{output.length} chars</span>
          {unicode && tab === "escape" && <span>· Unicode escaped</span>}
          {input.includes("\n") && <span>· {input.split("\n").length} lines</span>}
        </div>
      </div>

      <div className="rounded-md border border-surface-200 bg-white p-3 dark:border-dark-border dark:bg-dark-surface">
        <p className="text-xs font-medium text-surface-700 dark:text-dark-text mb-1">How it works</p>
        <ul className="text-xs text-surface-500 dark:text-dark-muted list-disc pl-4 space-y-0.5">
          <li><strong>Escape:</strong> uses JSON.stringify semantics — escapes quotes, backslashes, newlines, tabs, etc.</li>
          <li><strong>Unescape:</strong> tries JSON.parse first, falls back to manual unescaping for partial strings.</li>
          <li>Unicode option escapes non-ASCII as \uXXXX.</li>
        </ul>
      </div>
    </div>
  );
}
