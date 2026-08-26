"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Upload } from "lucide-react";


type Delimiter = "comma" | "tab" | "semicolon" | "pipe" | "custom";
type NullHandling = "empty" | "null" | "skip";
type ArrayHandling = "indexing" | "flatten" | "json";
type DateFormat = "iso" | "locale" | "timestamp" | "none";

function flattenObject(obj: Record<string, unknown>, prefix = "", sep = ".", depth = 0, maxDepth = 20): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  if (maxDepth >= 0 && depth >= maxDepth) { result[prefix || "value"] = JSON.stringify(obj); return result; }
  for (const [key, val] of Object.entries(obj)) {
    const k = prefix ? `${prefix}${sep}${key}` : key;
    if (val !== null && typeof val === "object" && !Array.isArray(val)) {
      Object.assign(result, flattenObject(val as Record<string, unknown>, k, sep, depth + 1, maxDepth));
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

function detectDate(val: string): boolean {
  if (!val || val.length < 10) return false;
  const isoDate = /^\d{4}-\d{2}-\d{2}(T|\s)\d{2}:\d{2}/;
  if (isoDate.test(val)) return true;
  const usDate = /^\d{1,2}\/\d{1,2}\/\d{4}/;
  if (usDate.test(val)) return true;
  const ts = Date.parse(val);
  return !isNaN(ts) && val.length > 8;
}

function convertDateFormat(val: string, format: DateFormat): string {
  if (format === "none" || !detectDate(val)) return val;
  const d = new Date(val);
  if (isNaN(d.getTime())) return val;
  switch (format) {
    case "iso": return d.toISOString();
    case "locale": return d.toLocaleString();
    case "timestamp": return d.getTime().toString();
    default: return val;
  }
}

function detectColumnTypes(rows: Record<string, unknown>[]): Record<string, string> {
  const types: Record<string, string> = {};
  for (const key of Object.keys(rows[0] || {})) {
    const vals = rows.map((r) => r[key]);
    const nonNull = vals.filter((v) => v !== null && v !== undefined && v !== "");
    if (vals.every((v) => v === null || v === undefined)) { types[key] = "null"; continue; }
    if (nonNull.length === 0) { types[key] = "unknown"; continue; }
    const sample = nonNull[0];
    if (typeof sample === "number") types[key] = "number";
    else if (typeof sample === "boolean") types[key] = "boolean";
    else if (typeof sample === "string" && detectDate(sample as string)) types[key] = "date";
    else if (typeof sample === "string" && !isNaN(Number(sample))) types[key] = "number";
    else types[key] = "string";
  }
  return types;
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
  const [maxDepth, setMaxDepth] = useState(0);
  const [nullHandling, setNullHandling] = useState<NullHandling>("empty");
  const [arrayHandling, setArrayHandling] = useState<ArrayHandling>("json");
  const [dateFormat, setDateFormat] = useState<DateFormat>("none");
  const [addBom, setAddBom] = useState(false);
  const [rowCount, setRowCount] = useState(0);
  const [colCount, setColCount] = useState(0);
  const [preview, setPreview] = useState<string[]>([]);
  const [columnTypes, setColumnTypes] = useState<Record<string, string>>({});
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const fileRef = useRef<HTMLInputElement>(null);

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

    if (!input.trim()) { setOutput(""); setError(""); setRowCount(0); setColCount(0); setPreview([]); setColumnTypes({}); return; }
    try {
      const parsed = JSON.parse(input);
      const arr = Array.isArray(parsed) ? parsed : [parsed];
      if (arr.length === 0) throw new Error("Array is empty");

      const normalized = arr.map((r: unknown) => {
        if (r === null || typeof r !== "object") return {};
        const obj = r as Record<string, unknown>;
        if (flattenNested) {
          const flattened = flattenObject(obj, "", ".", 0, maxDepth <= 0 ? -1 : maxDepth);
          const result: Record<string, unknown> = {};
          for (const [k, v] of Object.entries(flattened)) {
            if (Array.isArray(v)) {
              if (arrayHandling === "indexing") {
                (v as unknown[]).forEach((item, i) => { result[`${k}_${i}`] = item; });
              } else if (arrayHandling === "flatten") {
                (v as unknown[]).forEach((item, i) => { result[`${k}_${i}`] = item; });
              } else {
                result[k] = JSON.stringify(v);
              }
            } else {
              result[k] = v;
            }
          }
          return result;
        }
        return obj;
      });

      const headerSet = new Set<string>();
      normalized.forEach((r: Record<string, unknown>) => Object.keys(r).forEach((k) => headerSet.add(k)));
      const headers = Array.from(headerSet);
      setColCount(headers.length);

      setColumnTypes(detectColumnTypes(normalized));

      const rows: string[][] = [];
      const skipIndices = new Set<number>();
      for (let ri = 0; ri < normalized.length; ri++) {
        const row = normalized[ri];
        const csvRow = headers.map((h) => {
          let val = row[h];
          if (val === null || val === undefined) {
            if (nullHandling === "null") return "null";
            if (nullHandling === "skip") { skipIndices.add(ri); return ""; }
            return "";
          }
          if (typeof val === "object") return JSON.stringify(val);
          if (typeof val === "string" && dateFormat !== "none") val = convertDateFormat(val, dateFormat);
          return String(val);
        });
        rows.push(csvRow);
      }

      const filteredRows = nullHandling === "skip" ? rows.filter((_, i) => !skipIndices.has(i)) : rows;
      setRowCount(filteredRows.length);
      const delim = getDelimStr();
      const csvRows = filteredRows.map((r) => r.map((c) => escapeCSV(c, delim, quoteAll)).join(delim));
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
  }, [input, delimiter, customDelim, quoteAll, includeHeader, flattenNested, maxDepth, nullHandling, arrayHandling, dateFormat, addBom]);

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
  const clear = () => { setInput(""); setOutput(""); setError(""); setRowCount(0); setColCount(0); setPreview([]); setColumnTypes({}); };
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setError("File exceeds 10MB limit"); return; }
    const reader = new FileReader();
    reader.onload = () => setInput(reader.result as string);
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">JSON Input</label>
        <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder='[{"name":"John","age":30}]' rows={6} spellCheck={false}
          className="w-full rounded-lg border border-surface-200 bg-white p-3 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted" />
        <div className="flex justify-between mt-1">
          <input ref={fileRef} type="file" accept=".json" onChange={handleFile} className="text-xs text-surface-500 dark:text-dark-muted file:mr-2 file:rounded file:border-0 file:bg-brand-50 file:px-2 file:py-0.5 file:text-xs file:font-medium file:text-brand-700 dark:file:bg-brand-900/30 dark:file:text-brand-400" />
          <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1 text-xs text-brand-500 hover:text-brand-600" aria-label="Upload JSON file"><Upload className="w-3 h-3" /> Upload JSON</button>
        </div>
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
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-surface-500 dark:text-dark-muted">Arrays:</label>
          <select value={arrayHandling} onChange={(e) => setArrayHandling(e.target.value as ArrayHandling)}
            className="rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value="json">JSON strings</option>
            <option value="indexing">Index (_0, _1)</option>
            <option value="flatten">Flatten (merge)</option>
          </select>
        </div>
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-surface-500 dark:text-dark-muted">Dates:</label>
          <select value={dateFormat} onChange={(e) => setDateFormat(e.target.value as DateFormat)}
            className="rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value="none">Keep original</option>
            <option value="iso">ISO 8601</option>
            <option value="locale">Locale</option>
            <option value="timestamp">Timestamp</option>
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
          <input type="checkbox" checked={flattenNested} onChange={(e) => setFlattenNested(e.target.checked)} className="rounded border-surface-300" /> Flatten nested
        </label>
        <label className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-dark-muted cursor-pointer">
          <input type="checkbox" checked={addBom} onChange={(e) => setAddBom(e.target.checked)} className="rounded border-surface-300" /> BOM for Excel
        </label>
      </div>

      {flattenNested && (
        <div className="flex items-center gap-2">
          <label className="text-xs text-surface-500 dark:text-dark-muted">Flatten depth:</label>
          <input type="number" min={0} max={100} value={maxDepth} onChange={(e) => setMaxDepth(Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))} className="w-16 rounded border border-surface-200 bg-white px-2 py-1 text-xs font-mono text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
          <span className="text-xs text-surface-400 dark:text-dark-muted">{maxDepth <= 0 ? "Unlimited" : `${maxDepth} levels`}</span>
        </div>
      )}

      {preview.length > 0 && (
        <div className="text-xs text-surface-500 dark:text-dark-muted space-y-1">
          <div>{rowCount} rows, {colCount} columns</div>
          {Object.keys(columnTypes).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {Object.entries(columnTypes).slice(0, 15).map(([col, type]) => (
                <span key={col} className="inline-flex items-center gap-1 rounded-full bg-surface-100 px-2 py-0.5 dark:bg-dark-surface">
                  <span className="text-surface-700 dark:text-dark-text">{col}</span>
                  <span className={`font-medium ${type === "null" ? "text-red-500" : type === "date" ? "text-purple-500" : type === "number" ? "text-blue-500" : type === "boolean" ? "text-green-500" : "text-brand-500"}`}>{type}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2">
        <button onClick={copy} disabled={!output} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-40 transition-colors" aria-label="Copy CSV">Copy CSV</button>
        <button onClick={download} disabled={!output} className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 disabled:opacity-40 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors" aria-label="Download CSV">Download CSV</button>
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
