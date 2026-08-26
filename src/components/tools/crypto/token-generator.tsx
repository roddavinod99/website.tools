"use client";

import { useState, useCallback } from "react";

export function TokenGenerator() {
  const [length, setLength] = useState(32);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(false);
  const [customSymbols, setCustomSymbols] = useState("!@#$%^&*()_+-=[]{}|;:,.<>?");
  const [useCustom, setUseCustom] = useState(false);
  const [count, setCount] = useState(1);
  const [tokens, setTokens] = useState<string[]>([]);

  const generate = useCallback(() => {
    let charset = "";
    if (uppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (lowercase) charset += "abcdefghijklmnopqrstuvwxyz";
    if (numbers) charset += "0123456789";
    if (useCustom) charset += customSymbols;
    else if (symbols) charset += "!@#$%^&*()_+-=[]{}|;:,.<>?";
    if (!charset) charset = "abcdefghijklmnopqrstuvwxyz";

    const result: string[] = [];
    for (let c = 0; c < count; c++) {
      let token = "";
      const arr = new Uint32Array(length);
      crypto.getRandomValues(arr);
      for (let i = 0; i < length; i++) token += charset[arr[i] % charset.length];
      result.push(token);
    }
    setTokens(result);
  }, [length, uppercase, lowercase, numbers, symbols, useCustom, customSymbols, count]);

  const copy = async (t: string) => { await navigator.clipboard.writeText(t); };
  const copyAll = async () => { await navigator.clipboard.writeText(tokens.join("\n")); };

  const charsetSize = (uppercase ? 26 : 0) + (lowercase ? 26 : 0) + (numbers ? 10 : 0) + (useCustom ? customSymbols.length : symbols ? 26 : 0);
  const entropy = Math.round(length * Math.log2(Math.max(charsetSize, 1)));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <label className="text-xs text-surface-500 dark:text-dark-muted block mb-0.5">Length</label>
          <input type="number" min={1} max={512} value={length} onChange={(e) => setLength(Number(e.target.value))}
            className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
        </div>
        <div>
          <label className="text-xs text-surface-500 dark:text-dark-muted block mb-0.5">Count</label>
          <input type="number" min={1} max={50} value={count} onChange={(e) => setCount(Math.min(50, Math.max(1, Number(e.target.value))))}
            className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs text-surface-500 dark:text-dark-muted block mb-0.5">Length slider</label>
          <input type="range" min={1} max={512} value={length} onChange={(e) => setLength(Number(e.target.value))} className="w-full accent-brand-500 mt-2" />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {[
          { label: "Uppercase (A-Z)", checked: uppercase, set: setUppercase },
          { label: "Lowercase (a-z)", checked: lowercase, set: setLowercase },
          { label: "Numbers (0-9)", checked: numbers, set: setNumbers },
          { label: "Symbols", checked: symbols, set: setSymbols },
          { label: "Custom charset", checked: useCustom, set: setUseCustom },
        ].map(opt => (
          <label key={opt.label} className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-dark-muted cursor-pointer">
            <input type="checkbox" checked={opt.checked} onChange={(e) => opt.set(e.target.checked)} className="rounded border-surface-300" /> {opt.label}
          </label>
        ))}
      </div>

      {useCustom && (
        <div>
          <label className="text-xs text-surface-500 dark:text-dark-muted block mb-0.5">Custom Characters</label>
          <input type="text" value={customSymbols} onChange={(e) => setCustomSymbols(e.target.value)}
            className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm font-mono text-surface-900 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
        </div>
      )}

      <div className="flex items-center gap-3">
        <button onClick={generate} className="rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-600 transition-colors">Generate</button>
        {tokens.length > 1 && <button onClick={copyAll} className="rounded-lg border border-surface-200 px-4 py-2 text-sm text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors">Copy All</button>}
        <span className="text-xs text-surface-400 dark:text-dark-muted">Charset: {charsetSize} chars · Entropy: {entropy} bits</span>
      </div>

      {tokens.length > 0 && (
        <div className="space-y-1.5">
          {tokens.map((t, i) => (
            <div key={i} className="flex items-center gap-2 p-2 rounded-lg border border-surface-200 dark:border-dark-border bg-surface-50 dark:bg-dark-surface group">
              <code className="flex-1 text-sm font-mono text-surface-900 dark:text-dark-text break-all select-all">{t}</code>
              <button onClick={() => copy(t)} className="rounded bg-brand-500 px-2 py-0.5 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">Copy</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
