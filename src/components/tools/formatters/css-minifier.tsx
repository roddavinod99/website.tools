"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Copy, Download, Trash2 } from "lucide-react";

const NAMED_COLORS: Record<string, string> = {
  "f00": "red", "ff0": "yellow", "0f0": "lime", "0ff": "cyan", "00f": "blue", "f0f": "magenta", "fff": "white", "000": "black",
  "c0c0c0": "silver", "808080": "gray", "800000": "maroon", "808000": "olive", "008000": "green", "008080": "teal", "000080": "navy",
};

function compressColors(css: string): string {
  return css.replace(/#([0-9a-fA-F]{6})\b/g, (_, hex) => {
    const h = hex.toLowerCase();
    if (NAMED_COLORS[h]) return NAMED_COLORS[h];
    if (h[0] === h[1] && h[2] === h[3] && h[4] === h[5]) return `#${h[0]}${h[2]}${h[4]}`;
    return `#${h}`;
  });
}

function mergeRules(css: string): string {
  const parts = css.split(/(?=[^{]*\{)/).filter(Boolean);
  const bodyMap = new Map<string, string[]>();
  const order: string[] = [];
  for (const part of parts) {
    const idx = part.indexOf("{");
    if (idx === -1) continue;
    const sel = part.slice(0, idx).trim();
    const body = part.slice(idx + 1, part.lastIndexOf("}")).trim();
    if (!sel || !body) continue;
    if (!bodyMap.has(body)) { bodyMap.set(body, []); order.push(body); }
    bodyMap.get(body)!.push(sel);
  }
  return order.map(body => `${bodyMap.get(body)!.join(",")}{${body}}`).join("");
}

function mergeAdjacentSelectors(css: string): string {
  const parts = css.split(/(?=[^{]*\{)/).filter(Boolean);
  const merged: string[] = [];
  let i = 0;
  while (i < parts.length) {
    const idx = parts[i].indexOf("{");
    if (idx === -1) { merged.push(parts[i]); i++; continue; }
    let sel = parts[i].slice(0, idx).trim();
    let body = parts[i].slice(idx + 1, parts[i].lastIndexOf("}")).trim();
    while (i + 1 < parts.length) {
      const nextIdx = parts[i + 1].indexOf("{");
      if (nextIdx === -1) break;
      const nextSel = parts[i + 1].slice(0, nextIdx).trim();
      const nextBody = parts[i + 1].slice(nextIdx + 1, parts[i + 1].lastIndexOf("}")).trim();
      if (body !== nextBody) break;
      sel += `,${nextSel}`;
      body = nextBody;
      i++;
    }
    merged.push(`${sel}{${body}}`);
    i++;
  }
  return merged.join("");
}

function removeQuotes(css: string): string {
  return css.replace(/(['"])([a-zA-Z0-9_-]+)\1/g, "$2");
}

function clearEmptyRules(css: string): string {
  return css.replace(/[^{}]*\{\s*\}/g, "");
}

export function CSSMinifier() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [compressColorsOpt, setCompressColors] = useState(true);
  const [mergeRulesOpt, setMergeRules] = useState(true);
  const [mergeAdjacentOpt, setMergeAdjacent] = useState(false);
  const [removeQuotesOpt, setRemoveQuotes] = useState(true);
  const [clearEmptyOpt, setClearEmpty] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout>>(null);

  const minify = useCallback(() => {
    if (!input.trim()) { setOutput(""); return; }
    let css = input;
    css = css.replace(/\/\*[\s\S]*?\*\//g, "");
    css = css.replace(/\s*([{}:;,])\s*/g, "$1");
    css = css.replace(/;\}/g, "}");
    css = css.replace(/\s+/g, " ").trim();
    if (compressColorsOpt) css = compressColors(css);
    if (clearEmptyOpt) css = clearEmptyRules(css);
    if (removeQuotesOpt) css = removeQuotes(css);
    if (mergeRulesOpt) css = mergeRules(css);
    if (mergeAdjacentOpt) css = mergeAdjacentSelectors(css);
    setOutput(css);
  }, [input, compressColorsOpt, mergeRulesOpt, mergeAdjacentOpt, removeQuotesOpt, clearEmptyOpt]);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(minify, 400);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [minify]);

  const copy = async () => { if (output) await navigator.clipboard.writeText(output); };
  const download = () => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/css" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "style.min.css"; a.click();
    URL.revokeObjectURL(url);
  };
  const clear = () => { setInput(""); setOutput(""); };

  const inputBytes = new TextEncoder().encode(input).length;
  const outputBytes = output ? new TextEncoder().encode(output).length : 0;
  const saved = inputBytes > 0 ? ((1 - outputBytes / inputBytes) * 100).toFixed(1) : "0.0";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        {[
          { label: "Compress colors", checked: compressColorsOpt, set: setCompressColors },
          { label: "Merge identical rules", checked: mergeRulesOpt, set: setMergeRules },
          { label: "Merge adjacent selectors", checked: mergeAdjacentOpt, set: setMergeAdjacent },
          { label: "Remove quotes", checked: removeQuotesOpt, set: setRemoveQuotes },
          { label: "Clear empty rules", checked: clearEmptyOpt, set: setClearEmpty },
        ].map(opt => (
          <label key={opt.label} className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-dark-muted cursor-pointer">
            <input type="checkbox" checked={opt.checked} onChange={(e) => opt.set(e.target.checked)} className="rounded border-surface-300" /> {opt.label}
          </label>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">CSS Input</label>
        <textarea value={input} onChange={(e) => setInput(e.target.value)}
          placeholder="Paste CSS here to minify..." rows={8} spellCheck={false}
          className="w-full rounded-lg border border-surface-200 bg-white p-3 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted" />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button onClick={copy} disabled={!output} className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-40 transition-colors"><Copy className="w-3.5 h-3.5" /> Copy Minified</button>
        <button onClick={download} disabled={!output} className="inline-flex items-center gap-1.5 rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 disabled:opacity-40 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors"><Download className="w-3.5 h-3.5" /> Download</button>
        <button onClick={clear} className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"><Trash2 className="w-3.5 h-3.5" /> Clear</button>
      </div>

      {output && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-surface-700 dark:text-dark-text">Minified Output</label>
            <span className="text-xs text-surface-400 dark:text-dark-muted">
              {inputBytes.toLocaleString()}B → {outputBytes.toLocaleString()}B ({saved}% saved)
            </span>
          </div>
          <pre className="w-full rounded-lg border border-surface-200 bg-surface-50 p-3 text-sm font-mono text-surface-900 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text overflow-auto max-h-80 whitespace-pre-wrap break-all select-all">{output}</pre>
        </div>
      )}
    </div>
  );
}
