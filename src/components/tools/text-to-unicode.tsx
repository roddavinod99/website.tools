"use client";

import { useState, useCallback, useEffect, useRef } from "react";

type Direction = "toUnicode" | "toText";

function textToUnicode(text: string): string {
  return Array.from(text)
    .map((ch) => {
      const cp = ch.codePointAt(0)!;
      return `U+${cp.toString(16).toUpperCase().padStart(4, "0")}`;
    })
    .join(" ");
}

function unicodeToText(input: string): string {
  const tokens = input.trim().split(/[\s,]+/).filter(Boolean);
  return tokens
    .map((token) => {
      const cleaned = token.replace(/^U\+|^0x|^#/, "");
      const cp = parseInt(cleaned, 16);
      if (isNaN(cp)) throw new Error(`Invalid Unicode code point: ${token}`);
      return String.fromCodePoint(cp);
    })
    .join("");
}

export function TextToUnicode() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [direction, setDirection] = useState<Direction>("toUnicode");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const convert = useCallback(() => {
    setError("");
    if (!input.trim()) { setOutput(""); return; }
    try {
      setOutput(direction === "toUnicode" ? textToUnicode(input) : unicodeToText(input));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Conversion failed");
      setOutput("");
    }
  }, [input, direction]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(convert, 200);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [convert]);

  const copy = async () => { if (output) await navigator.clipboard.writeText(output); };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {([["toUnicode", "Text → Unicode"], ["toText", "Unicode → Text"]] as [Direction, string][]).map(([d, label]) => (
          <button key={d} onClick={() => { setDirection(d); setOutput(""); setError(""); setInput(""); }}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${direction === d ? "bg-brand-500 text-white" : "rounded-lg border border-surface-200 px-4 py-2 text-sm text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface"}`}>
            {label}
          </button>
        ))}
      </div>

      <div>
        <label className="text-sm font-medium text-surface-700 dark:text-dark-text mb-1 block">
          {direction === "toUnicode" ? "Input Text" : "Unicode Code Points (e.g. U+0048 U+0069)"}
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={direction === "toUnicode" ? "Enter text to convert..." : "U+0048 U+0065 U+006C U+006C U+006F"}
          rows={3}
          spellCheck={false}
          className="w-full rounded-lg border border-surface-200 bg-white p-3 font-mono text-sm dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
        />
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {output && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-surface-700 dark:text-dark-text">Output</label>
            <button onClick={copy} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">Copy</button>
          </div>
          <pre className="w-full rounded-lg border border-surface-200 bg-surface-50 p-3 text-sm font-mono dark:border-dark-border dark:bg-dark-bg dark:text-dark-text overflow-auto max-h-60 select-all whitespace-pre-wrap">{output}</pre>
        </div>
      )}
    </div>
  );
}
