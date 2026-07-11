"use client";

import { useState, useCallback, useEffect, useRef } from "react";

type ListFormat = "newline" | "csv" | "numbered" | "bulleted" | "json" | "comma";

const FORMAT_LABELS: Record<ListFormat, string> = {
  newline: "One Per Line",
  csv: "CSV",
  numbered: "Numbered",
  bulleted: "Bulleted",
  json: "JSON Array",
  comma: "Comma-Separated",
};

function parseItems(text: string, from: ListFormat): string[] {
  let items: string[] = [];
  const cleaned = text.trim();
  if (!cleaned) return [];

  switch (from) {
    case "newline":
      items = cleaned.split("\n");
      break;
    case "csv":
      items = cleaned.split(",").map((s) => s.trim());
      break;
    case "numbered":
      items = cleaned.split("\n").map((line) => line.replace(/^\d+[\.\)]\s*/, "").trim());
      break;
    case "bulleted":
      items = cleaned.split("\n").map((line) => line.replace(/^[\-\*\•\◦\▪]\s*/, "").trim());
      break;
    case "json":
      try {
        const parsed = JSON.parse(cleaned);
        items = Array.isArray(parsed) ? parsed.map(String) : [];
      } catch {
        return [];
      }
      break;
    case "comma":
      items = cleaned.split(",").map((s) => s.trim());
      break;
  }
  return items.filter((s) => s.length > 0);
}

function formatItems(items: string[], to: ListFormat): string {
  switch (to) {
    case "newline":
      return items.join("\n");
    case "csv":
      return items.join(", ");
    case "numbered":
      return items.map((item, i) => `${i + 1}. ${item}`).join("\n");
    case "bulleted":
      return items.map((item) => `- ${item}`).join("\n");
    case "json":
      return JSON.stringify(items, null, 2);
    case "comma":
      return items.join(",");
  }
}

export function ListConverter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [fromFormat, setFromFormat] = useState<ListFormat>("newline");
  const [toFormat, setToFormat] = useState<ListFormat>("json");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const convert = useCallback(() => {
    if (!input.trim()) { setOutput(""); return; }
    const items = parseItems(input, fromFormat);
    if (items.length === 0) { setOutput(""); return; }
    setOutput(formatItems(items, toFormat));
  }, [input, fromFormat, toFormat]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(convert, 200);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [convert]);

  const copy = async () => { if (output) await navigator.clipboard.writeText(output); };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5">
          <label className="text-sm font-medium text-surface-700 dark:text-dark-text">From:</label>
          <select value={fromFormat} onChange={(e) => setFromFormat(e.target.value as ListFormat)}
            className="rounded-lg border border-surface-200 bg-white px-3 py-1.5 text-sm dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            {Object.entries(FORMAT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <span className="text-surface-400 dark:text-dark-muted">→</span>
        <div className="flex items-center gap-1.5">
          <label className="text-sm font-medium text-surface-700 dark:text-dark-text">To:</label>
          <select value={toFormat} onChange={(e) => setToFormat(e.target.value as ListFormat)}
            className="rounded-lg border border-surface-200 bg-white px-3 py-1.5 text-sm dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            {Object.entries(FORMAT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-surface-700 dark:text-dark-text mb-1 block">Input List</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="apple\nbanana\ncherry"
          rows={6}
          spellCheck={false}
          className="w-full rounded-lg border border-surface-200 bg-white p-3 font-mono text-sm dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
        />
      </div>

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
