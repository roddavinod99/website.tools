"use client";

import { useState, useCallback, useRef, useEffect } from "react";

type Delimiter = "comma" | "tab" | "semicolon" | "pipe" | "custom";
type NullHandling = "empty" | "null" | "skip";

function flattenObject(obj: Record<string, unknown>, prefix = "", sep = "."): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(obj)) {
    const k = prefix ? `${prefix}${sep}${key}` : key;
    if (val !== null && typeof val === "object" && !Array.isArray(val)) {
      Object.assign(result, flattenObject(val as Record<string, unknown>, k, sep));
    } else {
      result[k] = val;
    }
  }
  return result;
}

function escapeCSV(val: string, delim: string, quoteAll: boolean): string {
  if (quoteAll || val.includes(delim) || val.includes('"') || val.includes("\n")) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

export function JSONToCSV() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [delimiter, setDelimiter] = useState<Delimiter>("comma");
  const [customDelim, setCustomDelim] = useState("|");
  const [quoteAll, setQuoteAll] = useState(false);
  const [includeHeader, setIncludeHeader] = useState(true);
  const [flattenNested, setFlattenNested] = useState(true);
  const [nullHandling, setNullHandling] = useState<NullHandling>("empty");
  const [addBom, setAddBom] = useState(false);
  const [rowCount, setRowCount] = useState(0);
  const [colCount, setColCount] = useState(0);
  const [preview, setPreview] = useState<string[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const convert = useCallback(() => {
    const getDelimStr = () => {
      switch (delimiter) {
        case "comma": return ",";
        case "tab": return "\t";
        case "semicolon": return ";";
        case "pipe": return "|";
        case "custom": return customDelim;
      }
    };

    if (!input.trim()) { setOutput(""); setError(""); setRowCount(0); setColCount(0); setPreview([]); return; }
    try {
      const parsed = JSON.parse(input);
      const arr = Array.isArray(parsed) ? parsed : [parsed];
      if (arr.length === 0) throw new Error("Array is empty");
      const rows: string[][] = [];
      let headers: string[] = [];

      if (arr.some((r: unknown) => r !== null && typeof r === "object")) {
        const normalized = arr.map((r: unknown) => {
          if (r === null || typeof r !== "object") return {};
          return flattenNested ? flattenObject(r as Record<string, unknown>) : (r as Record<string, unknown>);
        });
        const headerSet = new Set<string>();
        normalized.forEach((r: Record<string, unknown>) => Object.keys(r).forEach((k) => headerSet.add(k)));
        headers = Array.from(headerSet);
        setColCount(headers.length);
        for (const row of normalized) {
          const csvRow = headers.map((h) => {
            const val = row[h];
            if (val === null || val === undefined) {
              if (nullHandling === "null") return "null";
              if (nullHandling === "skip") return "";
              return "";
            }
            if (typeof val === "object") return JSON.stringify(val);
            return String(val);
          });
          rows.push(csvRow);
        }
      } else {
        headers = ["value"];
        setColCount(1);
        for (const item of arr) {
          rows.push([item === null || item === undefined ? (nullHandling === "null" ? "null" : "") : String(item)]);
        }
      }

      setRowCount(rows.length);
      const delim = getDelimStr();
      const csvRows = rows.map((r) => r.map((c) => escapeCSV(c, delim, quoteAll)).join(delim));
      const headerLine = includeHeader ? headers.map((h) => escapeCSV(h, delim, quoteAll)).join(delim) : "";
      const bom = addBom ? "\uFEFF" : "";
      const full = bom + (headerLine ? headerLine + "\n" : "") + csvRows.join("\n");
      setOutput(full);
      setPreview(headers);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON");
      setOutput("");
    }
  }, [input, delimiter, customDelim, quoteAll, includeHeader, flattenNested, nullHandling, addBom]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(convert, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [convert]);

  const copy = async () => { if (output) await navigator.clipboard.writeText(output); };
  const download = () => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "output.csv"; a.click();
    URL.revokeObjectURL(url);
  };
  const clear = () => { setInput(""); setOutput(""); setError(""); setRowCount(0); setColCount(0); setPreview([]); };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">JSON Input</label>
        <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder='[{"name":"John","age":30}]' rows={6} spellCheck={false}
          className="w-full rounded-lg border border-surface-200 bg-white p-3 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted" />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-surface-500 dark:text-dark-muted">Delimiter:</label>
          <select value={delimiter} onChange={(e) => setDelimiter(e.target.value as Delimiter)}
            className="rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value="comma">Comma (,)</option>
            <option value="tab">Tab</option>
            <option value="semicolon">Semicolon (;)</option>
            <option value="pipe">Pipe (|)</option>
            <option value="custom">Custom</option>
          </select>
          {delimiter === "custom" && (
            <input value={customDelim} onChange={(e) => setCustomDelim(e.target.value)} maxLength={1} className="w-10 rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-surface-500 dark:text-dark-muted">Null:</label>
          <select value={nullHandling} onChange={(e) => setNullHandling(e.target.value as NullHandling)}
            className="rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value="empty">Empty string</option>
            <option value="null">{'"'}null{'"'}</option>
            <option value="skip">Skip row</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-dark-muted cursor-pointer">
          <input type="checkbox" checked={quoteAll} onChange={(e) => setQuoteAll(e.target.checked)} className="rounded border-surface-300" /> Quote all fields
        </label>
        <label className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-dark-muted cursor-pointer">
          <input type="checkbox" checked={includeHeader} onChange={(e) => setIncludeHeader(e.target.checked)} className="rounded border-surface-300" /> Include header row
        </label>
        <label className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-dark-muted cursor-pointer">
          <input type="checkbox" checked={flattenNested} onChange={(e) => setFlattenNested(e.target.checked)} className="rounded border-surface-300" /> Flatten nested (dot notation)
        </label>
        <label className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-dark-muted cursor-pointer">
          <input type="checkbox" checked={addBom} onChange={(e) => setAddBom(e.target.checked)} className="rounded border-surface-300" /> BOM for Excel
        </label>
      </div>

      {preview.length > 0 && (
        <div className="text-xs text-surface-500 dark:text-dark-muted">
          {rowCount} rows, {colCount} columns
        </div>
      )}

      <div className="flex gap-2">
        <button onClick={copy} disabled={!output} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-40 transition-colors">Copy CSV</button>
        <button onClick={download} disabled={!output} className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 disabled:opacity-40 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors">Download CSV</button>
        <button onClick={clear} className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors">Clear</button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm font-medium text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {output && (
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">CSV Output</label>
          <pre className="rounded-lg border border-surface-200 bg-surface-50 p-3 text-sm font-mono text-surface-900 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text overflow-auto max-h-60 whitespace-pre-wrap">{output}</pre>
        </div>
      )}
    </div>
  );
}
