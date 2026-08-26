"use client";

import { useState, useCallback } from "react";

function toNumeronym(word: string): string {
  if (word.length <= 3) return word;
  return `${word[0]}${word.length - 2}${word[word.length - 1]}`;
}

export function NumeronymGenerator() {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);

  const results = useCallback(() => {
    const words = input.split(/[,\s]+/).filter(Boolean);
    return words.map(w => ({
      original: w,
      numeronym: toNumeronym(w),
      valid: w.length > 3,
    }));
  }, [input]);

  const numeronyms = results();

  const copyAll = async () => {
    const text = numeronyms.map(n => `${n.original} → ${n.numeronym}`).join("\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyOne = async (text: string) => { await navigator.clipboard.writeText(text); };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Enter Words</label>
        <textarea value={input} onChange={(e) => setInput(e.target.value)}
          placeholder="internationalization, accessibility, cryptocurrency, hello, css..." rows={4} spellCheck={false}
          className="w-full rounded-lg border border-surface-200 bg-white p-3 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted" />
        <p className="mt-1 text-xs text-surface-400 dark:text-dark-muted">Enter words separated by spaces or commas. Words with 3 or fewer characters remain unchanged.</p>
      </div>

      {numeronyms.length > 0 && (
        <>
          <button onClick={copyAll} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors">
            {copied ? "Copied!" : "Copy All"}
          </button>

          <div className="space-y-1.5">
            {numeronyms.map((n, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg border border-surface-200 dark:border-dark-border bg-white dark:bg-dark-surface group">
                <span className="text-sm text-surface-500 dark:text-dark-muted min-w-[200px] truncate">{n.original}</span>
                <span className="text-surface-300 dark:text-dark-muted">→</span>
                <code className="text-sm font-mono font-medium text-surface-900 dark:text-dark-text flex-1">{n.numeronym}</code>
                <span className="text-xs text-surface-400 dark:text-dark-muted">{n.original.length} chars</span>
                <button onClick={() => copyOne(n.numeronym)} className="rounded bg-brand-500 px-2 py-0.5 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">Copy</button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
