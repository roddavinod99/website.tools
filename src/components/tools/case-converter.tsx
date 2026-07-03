"use client";

import { useState, useMemo, useCallback, useRef } from "react";

type CaseType =
  | "camel" | "pascal" | "snake" | "screamingSnake" | "kebab"
  | "screamingKebab" | "dot" | "title" | "lower" | "upper"
  | "sentence" | "toggle" | "alternating";

interface CaseResult {
  label: string;
  key: CaseType;
  value: string;
  charCount: number;
}

function smartSplit(input: string): string[] {
  const specialSplit = input
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .replace(/([a-zA-Z])(\d)/g, "$1 $2")
    .replace(/(\d)([a-zA-Z])/g, "$1 $2");
  return specialSplit.split(/[\s.]+/).filter(Boolean);
}

function convertTo(input: string, type: CaseType): string {
  const words = smartSplit(input);
  if (words.length === 0) return "";
  switch (type) {
    case "camel":
      return words[0]!.toLowerCase() + words.slice(1).map((w) => w[0]!.toUpperCase() + w.slice(1).toLowerCase()).join("");
    case "pascal":
      return words.map((w) => w[0]!.toUpperCase() + w.slice(1).toLowerCase()).join("");
    case "snake":
      return words.map((w) => w.toLowerCase()).join("_");
    case "screamingSnake":
      return words.map((w) => w.toUpperCase()).join("_");
    case "kebab":
      return words.map((w) => w.toLowerCase()).join("-");
    case "screamingKebab":
      return words.map((w) => w.toUpperCase()).join("-");
    case "dot":
      return words.map((w) => w.toLowerCase()).join(".");
    case "title":
      return words.map((w) => w[0]!.toUpperCase() + w.slice(1).toLowerCase()).join(" ");
    case "lower":
      return words.join(" ").toLowerCase();
    case "upper":
      return words.join(" ").toUpperCase();
    case "sentence": {
      const joined = words.map((w) => w.toLowerCase()).join(" ");
      return joined[0]!.toUpperCase() + joined.slice(1);
    }
    case "toggle": {
      const joined = words.join(" ");
      return joined.split("").map((c) => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join("");
    }
    case "alternating":
      return words.join(" ").split("").map((c, i) => i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()).join("");
  }
}

const caseDefinitions: { label: string; key: CaseType }[] = [
  { label: "camelCase", key: "camel" },
  { label: "PascalCase", key: "pascal" },
  { label: "snake_case", key: "snake" },
  { label: "SCREAMING_SNAKE_CASE", key: "screamingSnake" },
  { label: "kebab-case", key: "kebab" },
  { label: "SCREAMING-KEBAB-CASE", key: "screamingKebab" },
  { label: "dot.case", key: "dot" },
  { label: "Title Case", key: "title" },
  { label: "lower case", key: "lower" },
  { label: "UPPER CASE", key: "upper" },
  { label: "Sentence case", key: "sentence" },
  { label: "tOGGLE cASE", key: "toggle" },
  { label: "aLtErNaTiNg cAsE", key: "alternating" },
];

export function CaseConverter() {
  const [input, setInput] = useState("hello world example");
  const [copiedKey, setCopiedKey] = useState<CaseType | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const results = useMemo<CaseResult[]>(() => {
    if (!input.trim()) return [];
    return caseDefinitions.map((def) => {
      const value = convertTo(input, def.key);
      return { ...def, value, charCount: value.length };
    });
  }, [input]);

  const handlePaste = useCallback(async () => {
    const text = await navigator.clipboard.readText();
    setInput(text);
  }, []);

  const handleCopy = useCallback(async (text: string, key: CaseType) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  }, []);

  const handleCopyAll = useCallback(async () => {
    const all = results.map((r) => `${r.label}: ${r.value}`).join("\n");
    await navigator.clipboard.writeText(all);
  }, [results]);

  const handleClear = useCallback(() => {
    setInput("");
    setCopiedKey(null);
  }, []);

  const wordCount = useMemo(() => smartSplit(input).length, [input]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">
          Input Text
          <span className="ml-2 text-xs text-surface-400 dark:text-dark-muted">
            ({input.length} chars, {wordCount} words)
          </span>
        </label>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter text to convert..."
          rows={4}
          className="w-full rounded-lg border border-surface-200 bg-white p-3 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={handlePaste}
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors"
        >
          Paste from Clipboard
        </button>
        <button
          onClick={handleClear}
          disabled={!input}
          className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 disabled:opacity-40 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors"
        >
          Clear
        </button>
        {results.length > 0 && (
          <button
            onClick={handleCopyAll}
            className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors"
          >
            Copy All
          </button>
        )}
      </div>

      <div className="space-y-2">
        {results.map((r) => (
          <div
            key={r.key}
            className="flex items-center justify-between rounded-lg border border-surface-200 bg-surface-50 p-3 dark:border-dark-border dark:bg-dark-surface"
          >
            <span className="text-sm text-surface-500 dark:text-dark-muted w-40 shrink-0">
              {r.label}
            </span>
            <code className="flex-1 text-sm font-mono text-surface-900 dark:text-dark-text overflow-auto max-h-12 whitespace-pre-wrap break-all select-all">
              {r.value || "\u00A0"}
            </code>
            <div className="flex items-center gap-2 ml-2 shrink-0">
              <span className="text-xs text-surface-400 dark:text-dark-muted min-w-[3ch] text-right">
                {r.charCount}
              </span>
              <button
                onClick={() => handleCopy(r.value, r.key)}
                disabled={!r.value}
                className="text-xs text-brand-500 hover:text-brand-600 disabled:text-surface-300 dark:disabled:text-dark-muted transition-colors min-w-[3rem] text-right"
              >
                {copiedKey === r.key ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {!input.trim() && (
        <p className="text-center text-sm text-surface-400 dark:text-dark-muted py-8">
          Enter text above to see all case conversions
        </p>
      )}
    </div>
  );
}
