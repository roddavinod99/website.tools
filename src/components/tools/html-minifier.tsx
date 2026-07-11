"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Copy, Download, Trash2 } from "lucide-react";

export function HTMLMinifier() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [removeComments, setRemoveComments] = useState(true);
  const [removeWhitespace, setRemoveWhitespace] = useState(true);
  const [removeOptionalTags, setRemoveOptionalTags] = useState(false);
  const [normalizeQuotes, setNormalizeQuotes] = useState(false);
  const [removeTypeAttrs, setRemoveTypeAttrs] = useState(true);
  const [removeEmptyAttrs, setRemoveEmptyAttrs] = useState(true);
  const [collapseBoolean, setCollapseBoolean] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout>>(null);

  const minify = useCallback(() => {
    if (!input.trim()) { setOutput(""); return; }
    let html = input;
    if (removeComments) html = html.replace(/<!--[\s\S]*?-->/g, "");
    if (removeWhitespace) html = html.replace(/>\s+</g, "><").replace(/\s{2,}/g, " ").trim();
    if (removeTypeAttrs) html = html.replace(/<script\s+type="(?:text\/javascript|text\/ecmascript)"\s*/gi, "<script ").replace(/<style\s+type="text\/css"\s*/gi, "<style ");
    if (normalizeQuotes) html = html.replace(/'/g, '"');
    if (removeOptionalTags) html = html.replace(/<\/?(?:li|dt|dd|p|tr|td|th|thead|tbody|tfoot|option)\b[^>]*>/gi, (m) => {
      if (m.startsWith("</")) return "";
      return m;
    });
    if (removeEmptyAttrs) html = html.replace(/\s+(?:class|id|style|title|alt|name|value|type|role|data-\w+)\s*=\s*(["'])\1/g, "");
    if (collapseBoolean) html = html.replace(/<([\w-]+)([^>]*?)\s+(checked|disabled|readonly|required|autoplay|controls|loop|muted|default|multiple|open|hidden|async|defer|novalidate|formnovalidate)([^>]*)>/gi, (m, tag, before, attr, after) => `<${tag}${before}${after}>`);
    setOutput(html);
  }, [input, removeComments, removeWhitespace, removeOptionalTags, normalizeQuotes, removeTypeAttrs, removeEmptyAttrs, collapseBoolean]);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(minify, 400);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [minify]);

  const copy = async () => { if (output) await navigator.clipboard.writeText(output); };
  const download = () => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "minified.html"; a.click();
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
          { label: "Remove comments", checked: removeComments, set: setRemoveComments },
          { label: "Strip whitespace", checked: removeWhitespace, set: setRemoveWhitespace },
          { label: "Remove optional tags", checked: removeOptionalTags, set: setRemoveOptionalTags },
          { label: "Normalize quotes", checked: normalizeQuotes, set: setNormalizeQuotes },
          { label: "Remove type attrs", checked: removeTypeAttrs, set: setRemoveTypeAttrs },
          { label: "Remove empty attrs", checked: removeEmptyAttrs, set: setRemoveEmptyAttrs },
          { label: "Collapse boolean attrs", checked: collapseBoolean, set: setCollapseBoolean },
        ].map(opt => (
          <label key={opt.label} className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-dark-muted cursor-pointer">
            <input type="checkbox" checked={opt.checked} onChange={(e) => opt.set(e.target.checked)} className="rounded border-surface-300" /> {opt.label}
          </label>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">HTML Input</label>
        <textarea value={input} onChange={(e) => setInput(e.target.value)}
          placeholder="Paste HTML here to minify..." rows={8} spellCheck={false}
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
