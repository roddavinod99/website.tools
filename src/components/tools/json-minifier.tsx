"use client";

import { useState, useCallback, useMemo } from "react";

function minifyWithOptions(
  json: string,
  options: { removeWhitespace: boolean; shortenBooleans: boolean; shortenNumbers: boolean },
  preserveKeys: string[]
): string {
  let result = json;
  if (options.removeWhitespace) {
    try {
      const parsed = JSON.parse(json);
      result = JSON.stringify(parsed);
    } catch {
      result = result.replace(/\s+/g, " ").replace(/\s*([{}[\],:])\s*/g, "$1");
    }
  }
  if (options.shortenBooleans) {
    result = result.replace(/:true\b/g, ":!0").replace(/:false\b/g, ":!1");
  }
  if (options.shortenNumbers) {
    result = result.replace(/:\s*(\d+\.\d+)/g, (_m: string, n: string) => `:${parseFloat(n)}`);
  }
  if (preserveKeys.length > 0) {
    try {
      const parsed = JSON.parse(json);
      const preserved = JSON.parse(result);
      function restoreKeys(obj: unknown, template: unknown) {
        if (obj && typeof obj === "object" && template && typeof template === "object") {
          for (const key of Object.keys(template as Record<string, unknown>)) {
            if (preserveKeys.includes(key)) {
              (obj as Record<string, unknown>)[key] = (template as Record<string, unknown>)[key];
            }
            restoreKeys(
              (obj as Record<string, unknown>)[key],
              (template as Record<string, unknown>)[key]
            );
          }
        }
      }
      restoreKeys(preserved, parsed);
      result = JSON.stringify(preserved);
    } catch {}
  }
  return result;
}

function charFrequency(json: string): [string, number][] {
  const freq: Record<string, number> = {};
  for (const ch of json) freq[ch] = (freq[ch] || 0) + 1;
  return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 10);
}

export function JSONMinifier() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [removeWhitespace, setRemoveWhitespace] = useState(true);
  const [shortenBooleans, setShortenBooleans] = useState(false);
  const [shortenNumbers, setShortenNumbers] = useState(false);
  const [preserveKeysStr, setPreserveKeysStr] = useState("");
  const [showPretty, setShowPretty] = useState(false);

  const preserveKeys = useMemo(
    () => preserveKeysStr.split(",").map((s) => s.trim()).filter(Boolean),
    [preserveKeysStr]
  );

  const minify = useCallback(() => {
    try {
      JSON.parse(input);
      const minified = minifyWithOptions(
        input,
        { removeWhitespace, shortenBooleans, shortenNumbers },
        preserveKeys
      );
      setOutput(minified);
      setError("");
    } catch (e) {
      setError((e as Error).message);
      setOutput("");
    }
  }, [input, removeWhitespace, shortenBooleans, shortenNumbers, preserveKeys]);

  const copy = useCallback(async () => {
    if (output) await navigator.clipboard.writeText(output);
  }, [output]);

  const download = useCallback(() => {
    if (!output) return;
    const blob = new Blob([output], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "minified.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [output]);

  const originalBytes = useMemo(() => new TextEncoder().encode(input).length, [input]);
  const minifiedBytes = useMemo(() => new TextEncoder().encode(output).length, [output]);
  const reduction = originalBytes > 0 ? ((originalBytes - minifiedBytes) / originalBytes * 100) : 0;
  const freq = useMemo(() => input ? charFrequency(input) : [], [input]);
  const maxFreq = freq.length > 0 ? freq[0][1] : 1;

  const prettyOutput = useMemo(() => {
    if (!output) return "";
    try { return JSON.stringify(JSON.parse(output), null, 2); } catch { return output; }
  }, [output]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Input JSON</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='{"key": "value"}'
          rows={6}
          spellCheck={false}
          className="w-full rounded-lg border border-surface-200 bg-white p-3 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <label className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-dark-muted cursor-pointer">
          <input type="checkbox" checked={removeWhitespace} onChange={(e) => setRemoveWhitespace(e.target.checked)} className="rounded border-surface-300" /> Remove whitespace
        </label>
        <label className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-dark-muted cursor-pointer">
          <input type="checkbox" checked={shortenBooleans} onChange={(e) => setShortenBooleans(e.target.checked)} className="rounded border-surface-300" /> Shorten booleans
        </label>
        <label className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-dark-muted cursor-pointer">
          <input type="checkbox" checked={shortenNumbers} onChange={(e) => setShortenNumbers(e.target.checked)} className="rounded border-surface-300" /> Shorten numbers
        </label>
        <label className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-dark-muted cursor-pointer">
          <input type="checkbox" checked={showPretty} onChange={(e) => setShowPretty(e.target.checked)} className="rounded border-surface-300" /> Pretty print
        </label>
      </div>

      <div>
        <label className="block text-xs text-surface-500 dark:text-dark-muted mb-1">Preserve keys (comma separated):</label>
        <input
          value={preserveKeysStr}
          onChange={(e) => setPreserveKeysStr(e.target.value)}
          placeholder="id, name, timestamp"
          className="w-full rounded border border-surface-200 bg-white px-2 py-1 text-xs font-mono text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button onClick={minify} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors">Minify</button>
        <button onClick={copy} disabled={!output} className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 disabled:opacity-40 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors">Copy Minified</button>
        <button onClick={download} disabled={!output} className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 disabled:opacity-40 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors">Download .min.json</button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {output && (
        <>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-surface-200 bg-white p-3 text-center dark:border-dark-border dark:bg-dark-surface">
              <p className="text-xs text-surface-500 dark:text-dark-muted">Original</p>
              <p className="text-lg font-bold text-surface-700 dark:text-dark-text">{(originalBytes / 1024).toFixed(2)} KB</p>
            </div>
            <div className="rounded-lg border border-surface-200 bg-white p-3 text-center dark:border-dark-border dark:bg-dark-surface">
              <p className="text-xs text-surface-500 dark:text-dark-muted">Minified</p>
              <p className="text-lg font-bold text-green-600 dark:text-green-400">{(minifiedBytes / 1024).toFixed(2)} KB</p>
            </div>
            <div className="rounded-lg border border-surface-200 bg-white p-3 text-center dark:border-dark-border dark:bg-dark-surface">
              <p className="text-xs text-surface-500 dark:text-dark-muted">Reduction</p>
              <p className={`text-lg font-bold ${reduction > 0 ? "text-green-600 dark:text-green-400" : "text-surface-500"}`}>
                {reduction.toFixed(1)}%
              </p>
            </div>
          </div>

          {reduction > 0 && (
            <div className="h-4 w-full rounded-full bg-surface-200 dark:bg-dark-border overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all duration-300"
                style={{ width: `${Math.min(reduction, 100)}%` }}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">
              {showPretty ? "Pretty Output" : "Minified Output"}
            </label>
            <pre className="w-full rounded-lg border border-surface-200 bg-surface-50 p-3 text-sm font-mono text-surface-900 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text overflow-auto max-h-48 whitespace-pre-wrap break-all select-all">
              {showPretty ? prettyOutput : output}
            </pre>
          </div>

          {freq.length > 0 && (
            <div>
              <p className="text-xs font-medium text-surface-500 dark:text-dark-muted mb-2">Character Frequency (top 10)</p>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-1">
                {freq.map(([char, count]) => (
                  <div key={char} className="text-center">
                    <div className="flex items-end justify-center h-12 gap-px">
                      <div
                        className="w-4 bg-brand-400 rounded-t"
                        style={{ height: `${(count / maxFreq) * 100}%` }}
                      />
                    </div>
                    <p className="text-[10px] font-mono text-surface-500 dark:text-dark-muted mt-0.5">
                      {char === " " ? "␣" : char === "\n" ? "⏎" : char}
                    </p>
                    <p className="text-[10px] text-surface-400">{count}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
