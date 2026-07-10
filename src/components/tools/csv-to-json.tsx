"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Upload } from "lucide-react";

type Delimiter = "comma" | "tab" | "semicolon" | "pipe" | "space" | "custom";
type QuoteChar = "double" | "single" | "none";
type OutputFormat = "objects" | "arrays" | "keyed" | "minified";

function detectDelimiter(firstLine: string): Delimiter {
  const counts = [
    { d: "comma" as Delimiter, c: (firstLine.match(/,/g) || []).length },
    { d: "tab" as Delimiter, c: (firstLine.match(/\t/g) || []).length },
    { d: "semicolon" as Delimiter, c: (firstLine.match(/;/g) || []).length },
    { d: "pipe" as Delimiter, c: (firstLine.match(/\|/g) || []).length },
    { d: "space" as Delimiter, c: (firstLine.match(/ /g) || []).length },
  ];
  counts.sort((a, b) => b.c - a.c);
  return counts[0].c > 0 ? counts[0].d : "comma";
}

function parseCSV(text: string, delimiter: string, quoteChar: string, escapeChar: string): string[][] {
  const rows: string[][] = [];
  let current: string[] = [];
  let field = "";
  let inQuotes = false;
  const quote = quoteChar === "none" ? "" : quoteChar;
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    const next = text[i + 1];
    if (escapeChar && ch === escapeChar && next) { field += next; i += 2; continue; }
    if (quote && ch === quote) {
      if (inQuotes && next === quote) { field += quote; i += 2; continue; }
      inQuotes = !inQuotes; i++; continue;
    }
    if (!inQuotes && ch === delimiter) { current.push(field); field = ""; i++; continue; }
    if (!inQuotes && (ch === "\n" || (ch === "\r" && next === "\n"))) {
      if (ch === "\r") i++;
      current.push(field); field = "";
      if (current.some((c) => c.length > 0) || current.length > 1) rows.push(current);
      current = []; i++; continue;
    }
    if (!inQuotes && ch === "\r") { current.push(field); field = ""; rows.push(current); current = []; i++; continue; }
    field += ch; i++;
  }
  if (field || current.length > 0) { current.push(field); rows.push(current); }
  if (inQuotes) throw new Error("Unclosed quote found in CSV");
  return rows;
}

export function CsvToJson() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [delimiter, setDelimiter] = useState<Delimiter>("comma");
  const [customDelim, setCustomDelim] = useState("|");
  const [quoteChar, setQuoteChar] = useState<QuoteChar>("double");
  const [escapeChar, setEscapeChar] = useState("\\");
  const [firstRowHeaders, setFirstRowHeaders] = useState(true);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("objects");
  const [prettyPrint, setPrettyPrint] = useState(true);
  const [indentSize, setIndentSize] = useState(2);
  const [encodeNonAscii, setEncodeNonAscii] = useState(false);
  const [rowCount, setRowCount] = useState(0);
  const [colCount, setColCount] = useState(0);
  const [preview, setPreview] = useState<string[][]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const convert = useCallback(() => {
    const getDelimStr = () => {
      switch (delimiter) {
        case "comma": return ",";
        case "tab": return "\t";
        case "semicolon": return ";";
        case "pipe": return "|";
        case "space": return " ";
        case "custom": return customDelim;
      }
    };

    const quoteMap: Record<QuoteChar, string> = { double: '"', single: "'", none: "" };

    if (!input.trim()) { setOutput(""); setError(""); setRowCount(0); setColCount(0); setPreview([]); return; }
    try {
      const rows = parseCSV(input, getDelimStr(), quoteMap[quoteChar], escapeChar);
      if (rows.length === 0) throw new Error("No data rows found");
      const cols = rows[0].length;
      for (let r = 1; r < rows.length; r++) {
        if (rows[r].length !== cols) throw new Error(`Row ${r + 1} has ${rows[r].length} columns, expected ${cols}`);
      }
      setRowCount(firstRowHeaders ? rows.length - 1 : rows.length);
      setColCount(cols);
      setPreview(rows.slice(0, firstRowHeaders ? 6 : 5));
      const dataRows = firstRowHeaders ? rows.slice(1) : rows;
      const headers = firstRowHeaders ? rows[0] : dataRows[0].map((_, i) => `col${i + 1}`);
      let result: unknown;
      switch (outputFormat) {
        case "objects": {
          result = dataRows.map((row) => {
            const obj: Record<string, string> = {};
            headers.forEach((h, i) => { obj[h] = row[i] ?? ""; });
            return obj;
          });
          break;
        }
        case "arrays": {
          result = dataRows.map((row) => row);
          break;
        }
        case "keyed": {
          if (!firstRowHeaders) throw new Error("Keyed format requires first row as headers");
          result = Object.fromEntries(dataRows.map((row) => [row[0] ?? "", Object.fromEntries(headers.slice(1).map((h, i) => [h, row[i + 1] ?? ""]))]));
          break;
        }
        case "minified": {
          result = dataRows.map((row) => {
            const obj: Record<string, string> = {};
            headers.forEach((h, i) => { obj[h] = row[i] ?? ""; });
            return obj;
          });
          break;
        }
      }
      let json = JSON.stringify(result, null, prettyPrint ? indentSize : undefined);
      if (encodeNonAscii) json = json.replace(/[\u0080-\uffff]/g, (ch) => `\\u${ch.charCodeAt(0).toString(16).padStart(4, "0")}`);
      setOutput(json);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Conversion failed");
      setOutput("");
    }
  }, [input, delimiter, customDelim, quoteChar, escapeChar, firstRowHeaders, outputFormat, prettyPrint, indentSize, encodeNonAscii]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(convert, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [convert]);

  const copy = async () => { if (output) await navigator.clipboard.writeText(output); };
  const download = () => {
    if (!output) return;
    const blob = new Blob([output], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "converted.json"; a.click();
    URL.revokeObjectURL(url);
  };
  const clear = () => { setInput(""); setOutput(""); setError(""); setRowCount(0); setColCount(0); setPreview([]); };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith(".csv")) {
      const reader = new FileReader();
      reader.onload = () => setInput(reader.result as string);
      reader.readAsText(file);
    }
  };
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setError("File exceeds 10MB limit"); return; }
    const reader = new FileReader();
    reader.onload = () => { setInput(reader.result as string); };
    reader.readAsText(file);
  };
  const fileSize = new TextEncoder().encode(input).length;

  return (
    <div className="space-y-4">
      <div ref={dropRef} onDrop={handleDrop} onDragOver={(e) => e.preventDefault()} className="space-y-2">
        <label className="block text-sm font-medium text-surface-700 dark:text-dark-text">CSV Input</label>
        <textarea value={input} onChange={(e) => { const val = e.target.value; setInput(val); if (val.trim()) { const first = val.trim().split("\n")[0]; if (first) setDelimiter(detectDelimiter(first)); } }} placeholder="name,age,city&#10;Alice,30,NYC&#10;Bob,25,LA" rows={6} spellCheck={false}
          className="w-full rounded-lg border border-surface-200 bg-white p-3 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted" />
        <div className="flex justify-between text-xs text-surface-400 dark:text-dark-muted">
          <span>
            <input ref={fileRef} type="file" accept=".csv" onChange={handleFile} className="hidden" />
            <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1 text-brand-500 hover:text-brand-600" aria-label="Upload CSV file"><Upload className="w-3 h-3" /> Upload CSV</button>
          </span>
          <span>{rowCount > 0 && `${rowCount} rows, ${colCount} cols`} {fileSize > 0 && `(${(fileSize / 1024).toFixed(1)} KB)`}</span>
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
            <option value="space">Space</option>
            <option value="custom">Custom</option>
          </select>
          {delimiter === "custom" && (
            <input value={customDelim} onChange={(e) => setCustomDelim(e.target.value)} maxLength={1} className="w-10 rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-surface-500 dark:text-dark-muted">Quote:</label>
          <select value={quoteChar} onChange={(e) => setQuoteChar(e.target.value as QuoteChar)}
            className="rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value="double">Double</option>
            <option value="single">Single</option>
            <option value="none">None</option>
          </select>
        </div>
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-surface-500 dark:text-dark-muted">Escape:</label>
          <input value={escapeChar} onChange={(e) => setEscapeChar(e.target.value)} maxLength={1} placeholder="\\" className="w-10 rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
        </div>
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-surface-500 dark:text-dark-muted">Output:</label>
          <select value={outputFormat} onChange={(e) => setOutputFormat(e.target.value as OutputFormat)}
            className="rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value="objects">Array of Objects</option>
            <option value="arrays">Array of Arrays</option>
            <option value="keyed">Keyed by Column</option>
            <option value="minified">Minified</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-dark-muted cursor-pointer">
          <input type="checkbox" checked={firstRowHeaders} onChange={(e) => setFirstRowHeaders(e.target.checked)} className="rounded border-surface-300" /> First row as headers
        </label>
        <label className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-dark-muted cursor-pointer">
          <input type="checkbox" checked={prettyPrint} onChange={(e) => setPrettyPrint(e.target.checked)} className="rounded border-surface-300" /> Pretty print
        </label>
        {prettyPrint && (
          <div className="flex items-center gap-1">
            <label className="text-xs text-surface-500 dark:text-dark-muted">Indent:</label>
            <select value={indentSize} onChange={(e) => setIndentSize(Number(e.target.value))} className="rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
              <option value={2}>2</option>
              <option value={4}>4</option>
              <option value={8}>8</option>
            </select>
          </div>
        )}
        <label className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-dark-muted cursor-pointer">
          <input type="checkbox" checked={encodeNonAscii} onChange={(e) => setEncodeNonAscii(e.target.checked)} className="rounded border-surface-300" /> Encode non-ASCII
        </label>
      </div>

      {preview.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-surface-200 dark:border-dark-border">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="bg-surface-50 dark:bg-dark-surface">
                {preview[0].map((h, i) => (
                  <th key={i} className="px-3 py-1.5 text-left text-surface-600 dark:text-dark-muted font-medium border-r border-surface-200 dark:border-dark-border last:border-r-0">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {preview.slice(1, 6).map((row, ri) => (
                <tr key={ri} className="border-t border-surface-200 dark:border-dark-border">
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-3 py-1.5 text-surface-900 dark:text-dark-text border-r border-surface-200 dark:border-dark-border last:border-r-0">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {rowCount > 5 && <p className="p-2 text-xs text-surface-400 dark:text-dark-muted text-center">... and {rowCount - 5} more rows</p>}
        </div>
      )}

      <div className="flex gap-2">
        <button onClick={copy} disabled={!output} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-40 transition-colors" aria-label="Copy JSON">Copy JSON</button>
        <button onClick={download} disabled={!output} className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 disabled:opacity-40 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors" aria-label="Download JSON">Download JSON</button>
        <button onClick={clear} className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors">Clear</button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm font-medium text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {output && (
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">JSON Output</label>
          <pre className="rounded-lg border border-surface-200 bg-surface-50 p-3 text-sm font-mono text-surface-900 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text overflow-auto max-h-60 whitespace-pre-wrap">{output}</pre>
        </div>
      )}
    </div>
  );
}
