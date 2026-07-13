"use client";

import { useState, useMemo, useCallback } from "react";

interface ObfuscatedResult {
  method: string;
  value: string;
  description: string;
}

function toHex(str: string): string {
  return Array.from(str).map((c) => {
    const cp = c.codePointAt(0)!;
    return "\\x" + cp.toString(16).padStart(2, "0");
  }).join("");
}

function toBinary(str: string): string {
  return Array.from(str).map((c) => {
    const cp = c.codePointAt(0)!;
    return cp.toString(2).padStart(cp > 0xFF ? 32 : 8, "0");
  }).join(" ");
}

function toUnicode(str: string): string {
  return Array.from(str).map((c) => {
    const cp = c.codePointAt(0)!;
    if (cp > 0xFFFF) {
      return "\\u{" + cp.toString(16).toUpperCase() + "}";
    }
    return "\\u" + cp.toString(16).padStart(4, "0");
  }).join("");
}

function toHTMLEntities(str: string): string {
  return Array.from(str).map((c) => {
    const cp = c.codePointAt(0)!;
    if (cp > 127) return "&#" + cp + ";";
    return c === "<" ? "&lt;" : c === ">" ? "&gt;" : c === "&" ? "&amp;" : c === '"' ? "&quot;" : c === "'" ? "&#39;" : c;
  }).join("");
}

function toURLEncoding(str: string): string {
  return Array.from(str).map((c) => {
    const cp = c.codePointAt(0)!;
    if (cp > 127) return encodeURIComponent(c);
    if (/[a-zA-Z0-9\-_.~]/.test(c)) return c;
    return encodeURIComponent(c);
  }).join("");
}

function toBase64(str: string): string {
  try {
    const bytes = new TextEncoder().encode(str);
    const binString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
    return btoa(binString);
  } catch {
    return "Error: Unable to encode to Base64";
  }
}

function reverseString(str: string): string {
  return Array.from(str).reverse().join("");
}

function toROT13(str: string): string {
  return str.replace(/[a-zA-Z]/g, (c) => {
    const base = c <= "Z" ? 65 : 97;
    return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
  });
}

export function StringObfuscator() {
  const [input, setInput] = useState("Hello, World! 123");
  const [copiedIdx, setCopiedIdx] = useState(-1);

  const results: ObfuscatedResult[] = useMemo(() => {
    if (!input) return [];
    return [
      { method: "Hex Encoding", value: toHex(input), description: "\\x48\\x65\\x6c..." },
      { method: "Binary", value: toBinary(input), description: "01001000 01100101..." },
      { method: "Unicode Escapes", value: toUnicode(input), description: "\\u0048\\u0065..." },
      { method: "HTML Entities", value: toHTMLEntities(input), description: "&lt; &#60; &#38;..." },
      { method: "URL Encoding", value: toURLEncoding(input), description: "%48%65%6c..." },
      { method: "Base64", value: toBase64(input), description: "SGVsbG8sIFdvcmxk..." },
      { method: "Reverse", value: reverseString(input), description: "!dlroW ,olleH" },
      { method: "ROT13", value: toROT13(input), description: "Uryyb, Jbeyq! 123" },
    ];
  }, [input]);

  const copy = useCallback(async (text: string, idx: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(-1), 1500);
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Input Text</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={4}
          placeholder="Enter text to obfuscate..."
          className="w-full rounded-lg border border-surface-200 bg-white p-3 font-mono text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text dark:placeholder:text-dark-muted"
        />
      </div>

      <div className="space-y-2">
        {results.map((r, i) => (
          <div key={r.method} className="rounded-lg border border-surface-200 bg-surface-50 p-3 dark:border-dark-border dark:bg-dark-surface">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-surface-700 dark:text-dark-text">{r.method}</span>
                <span className="rounded-full bg-surface-100 px-2 py-0.5 text-xs text-surface-600 dark:bg-dark-bg dark:text-dark-muted">{r.description}</span>
              </div>
              <button
                onClick={() => copy(r.value, i)}
                className="rounded-lg border border-surface-200 px-3 py-1 text-xs font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-bg"
              >
                {copiedIdx === i ? "Copied!" : "Copy"}
              </button>
            </div>
            <pre className="overflow-x-auto rounded bg-white p-2 text-xs font-mono text-surface-900 dark:bg-dark-bg dark:text-dark-text break-all max-h-24 overflow-y-auto">
              {r.value}
            </pre>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-surface-400 dark:text-dark-muted text-center">
        All obfuscation is done client-side. Your data never leaves your browser.
      </p>
    </div>
  );
}
