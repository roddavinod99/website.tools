"use client";

import { useState, useCallback, useEffect, useRef } from "react";

interface SlugOptions {
  lowercase: boolean;
  spacesToHyphens: boolean;
  removeSpecial: boolean;
  truncateLength: number;
}

function slugify(text: string, options: SlugOptions): string {
  let result = text;
  if (options.removeSpecial) {
    result = result.replace(/[^\w\s-]/g, "");
  }
  if (options.spacesToHyphens) {
    result = result.replace(/[\s_]+/g, "-");
  }
  if (options.lowercase) {
    result = result.toLowerCase();
  }
  result = result.replace(/-+/g, "-").replace(/^-|-$/g, "");
  if (options.truncateLength > 0 && result.length > options.truncateLength) {
    result = result.substring(0, options.truncateLength).replace(/-$/, "");
  }
  return result;
}

export function SlugifyString() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [options, setOptions] = useState<SlugOptions>({
    lowercase: true,
    spacesToHyphens: true,
    removeSpecial: true,
    truncateLength: 0,
  });
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const convert = useCallback(() => {
    if (!input) { setOutput(""); return; }
    setOutput(slugify(input, options));
  }, [input, options]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(convert, 150);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [convert]);

  const copy = async () => { if (output) await navigator.clipboard.writeText(output); };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-surface-700 dark:text-dark-text mb-1 block">Input String</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Hello World! This is a Post #1..."
          rows={3}
          spellCheck={false}
          className="w-full rounded-lg border border-surface-200 bg-white p-3 font-mono text-sm dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-dark-muted cursor-pointer">
          <input type="checkbox" checked={options.lowercase} onChange={(e) => setOptions((o) => ({ ...o, lowercase: e.target.checked }))} className="rounded border-surface-300" /> Lowercase
        </label>
        <label className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-dark-muted cursor-pointer">
          <input type="checkbox" checked={options.spacesToHyphens} onChange={(e) => setOptions((o) => ({ ...o, spacesToHyphens: e.target.checked }))} className="rounded border-surface-300" /> Spaces → Hyphens
        </label>
        <label className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-dark-muted cursor-pointer">
          <input type="checkbox" checked={options.removeSpecial} onChange={(e) => setOptions((o) => ({ ...o, removeSpecial: e.target.checked }))} className="rounded border-surface-300" /> Remove Special Chars
        </label>
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-surface-500 dark:text-dark-muted">Max Length:</label>
          <input
            type="number"
            min={0}
            max={500}
            value={options.truncateLength}
            onChange={(e) => setOptions((o) => ({ ...o, truncateLength: Number(e.target.value) }))}
            className="w-16 rounded border border-surface-200 bg-white px-2 py-1 text-xs dark:border-dark-border dark:bg-dark-surface dark:text-dark-text"
          />
        </div>
      </div>

      {output && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-surface-700 dark:text-dark-text">Slug</label>
            <button onClick={copy} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">Copy</button>
          </div>
          <pre className="w-full rounded-lg border border-surface-200 bg-surface-50 p-3 text-sm font-mono dark:border-dark-border dark:bg-dark-bg dark:text-dark-text overflow-auto max-h-60 select-all">{output}</pre>
        </div>
      )}
    </div>
  );
}
