"use client";

import { useState, useMemo, useEffect, useRef } from "react";

type SortMode =
  | "alpha-asc"
  | "alpha-desc"
  | "length-asc"
  | "length-desc"
  | "numeric"
  | "numeric-desc"
  | "random"
  | "reverse"
  | "natural";

function naturalCompare(a: string, b: string): number {
  const re = /(\d+)|(\D+)/g;
  const aParts = a.match(re) || [a];
  const bParts = b.match(re) || [b];
  const len = Math.max(aParts.length, bParts.length);
  for (let i = 0; i < len; i++) {
    const ap = aParts[i] ?? "";
    const bp = bParts[i] ?? "";
    const aNum = parseInt(ap, 10);
    const bNum = parseInt(bp, 10);
    if (!isNaN(aNum) && !isNaN(bNum)) {
      if (aNum !== bNum) return aNum - bNum;
    } else {
      const cmp = ap.localeCompare(bp);
      if (cmp !== 0) return cmp;
    }
  }
  return 0;
}

function executeSort(
  lines: string[],
  mode: SortMode,
  caseSensitive: boolean
): string[] {
  const items = [...lines];
  const compare = caseSensitive ? (a: string, b: string) => a.localeCompare(b) : (a: string, b: string) => a.toLowerCase().localeCompare(b.toLowerCase());

  switch (mode) {
    case "alpha-asc":
      return items.sort(compare);
    case "alpha-desc":
      return items.sort((a, b) => -compare(a, b));
    case "length-asc":
      return items.sort((a, b) => a.length - b.length || compare(a, b));
    case "length-desc":
      return items.sort((a, b) => b.length - a.length || compare(a, b));
    case "numeric":
      return items.sort((a, b) => {
        const an = parseFloat(a) || 0;
        const bn = parseFloat(b) || 0;
        return an - bn;
      });
    case "numeric-desc":
      return items.sort((a, b) => {
        const an = parseFloat(a) || 0;
        const bn = parseFloat(b) || 0;
        return bn - an;
      });
    case "random": {
      const arr = [...items];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    }
    case "reverse":
      return items.reverse();
    case "natural":
      return items.sort((a, b) => naturalCompare(
        caseSensitive ? a : a.toLowerCase(),
        caseSensitive ? b : b.toLowerCase()
      ));
  }
}

const SORT_MODES: { id: SortMode; label: string }[] = [
  { id: "alpha-asc", label: "Alphabetical A-Z" },
  { id: "alpha-desc", label: "Alphabetical Z-A" },
  { id: "numeric", label: "Numeric" },
  { id: "numeric-desc", label: "Numeric ↓" },
  { id: "natural", label: "Natural" },
  { id: "length-asc", label: "Length ↑" },
  { id: "length-desc", label: "Length ↓" },
  { id: "reverse", label: "Reverse" },
  { id: "random", label: "Randomize" },
];

const MAX_INPUT_SIZE = 10 * 1024 * 1024;
const MAX_LINE_LENGTH = 100 * 1024;

export function TextSorter() {
  const [input, setInput] = useState("banana\napple\ncherry\ndate\n123\n45");
  const [mode, setMode] = useState<SortMode>("alpha-asc");
  const [removeDuplicates, setRemoveDuplicates] = useState(false);
  const [removeEmptyLines, setRemoveEmptyLines] = useState(true);
  const [trimWhitespace, setTrimWhitespace] = useState(true);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [copied, setCopied] = useState(false);
  const [inputSizeWarn, setInputSizeWarn] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [debouncedInput, setDebouncedInput] = useState(input);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedInput(input), 200);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [input]);

  const handleInputChange = (val: string) => {
    const bytes = new TextEncoder().encode(val).length;
    if (bytes > MAX_INPUT_SIZE) {
      setInputSizeWarn(`Input exceeds 10MB limit (${(bytes / 1024 / 1024).toFixed(1)}MB). Please reduce input size.`);
      return;
    }
    setInputSizeWarn("");
    setInput(val);
  };

  const lineSizeWarn = useMemo(() => {
    for (const line of debouncedInput.split("\n")) {
      if (new TextEncoder().encode(line).length > MAX_LINE_LENGTH) {
        return true;
      }
    }
    return false;
  }, [debouncedInput]);

  const sizeWarning = inputSizeWarn || (lineSizeWarn ? "One or more lines exceed the 100KB per-line limit." : "");

  const processed = useMemo(() => {
    let lines = debouncedInput.split("\n");

    if (lineSizeWarn) {
      return { rawCount: lines.length, uniqueCount: new Set(lines).size, lines: [] };
    }

    if (trimWhitespace) lines = lines.map((l) => l.trim());
    if (removeEmptyLines) lines = lines.filter((l) => l.length > 0);
    if (removeDuplicates) lines = [...new Set(lines)];
    return { rawCount: debouncedInput.split("\n").length, uniqueCount: new Set(lines).size, lines };
  }, [debouncedInput, trimWhitespace, removeEmptyLines, removeDuplicates, lineSizeWarn]);

  const output = useMemo(
    () => executeSort(processed.lines, mode, caseSensitive),
    [processed.lines, mode, caseSensitive]
  );

  const outputText = useMemo(() => output.join("\n"), [output]);

  const copy = async () => {
    await navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const download = () => {
    const blob = new Blob([outputText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "sorted.txt"; a.click();
    URL.revokeObjectURL(url);
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      handleInputChange(text);
    } catch { /* clipboard read not available */ }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-surface-700 dark:text-dark-text">Input (one per line)</label>
            <div className="flex gap-1">
              <button onClick={pasteFromClipboard} className="rounded px-2 py-0.5 text-xs border border-surface-200 text-surface-600 hover:bg-surface-50 dark:border-dark-border dark:text-dark-muted dark:hover:bg-dark-surface">Paste</button>
              <button onClick={() => setInput("")} className="rounded px-2 py-0.5 text-xs border border-surface-200 text-surface-600 hover:bg-surface-50 dark:border-dark-border dark:text-dark-muted dark:hover:bg-dark-surface">Clear</button>
            </div>
          </div>
          <textarea ref={inputRef} value={input} onChange={(e) => handleInputChange(e.target.value)} rows={10}
            className="w-full rounded-lg border border-surface-200 bg-white p-3 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted" />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-surface-700 dark:text-dark-text">Output ({output.length} lines)</label>
            <div className="flex gap-1">
              <button onClick={copy} className="rounded px-2 py-0.5 text-xs border border-surface-200 text-surface-600 hover:bg-surface-50 dark:border-dark-border dark:text-dark-muted dark:hover:bg-dark-surface">{copied ? "Copied!" : "Copy"}</button>
              <button onClick={download} disabled={output.length === 0} className="rounded px-2 py-0.5 text-xs border border-surface-200 text-surface-600 hover:bg-surface-50 dark:border-dark-border dark:text-dark-muted dark:hover:bg-dark-surface disabled:opacity-50">Download .txt</button>
            </div>
          </div>
          <textarea value={outputText} readOnly rows={10}
            className="w-full rounded-lg border border-surface-200 bg-surface-50 p-3 text-sm font-mono text-surface-900 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text" />
        </div>
      </div>

      {sizeWarning && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-300">{sizeWarning}</div>
      )}

      <div className="flex flex-wrap gap-2">
        {SORT_MODES.map((m) => (
          <button key={m.id} onClick={() => setMode(m.id)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${mode === m.id ? "bg-brand-500 text-white" : "border border-surface-200 text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface"}`}>
            {m.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-1.5 text-xs text-surface-700 dark:text-dark-text cursor-pointer select-none">
          <input type="checkbox" checked={removeDuplicates} onChange={(e) => setRemoveDuplicates(e.target.checked)} className="accent-brand-500 rounded" />
          Remove Duplicates
        </label>
        <label className="flex items-center gap-1.5 text-xs text-surface-700 dark:text-dark-text cursor-pointer select-none">
          <input type="checkbox" checked={removeEmptyLines} onChange={(e) => setRemoveEmptyLines(e.target.checked)} className="accent-brand-500 rounded" />
          Remove Empty Lines
        </label>
        <label className="flex items-center gap-1.5 text-xs text-surface-700 dark:text-dark-text cursor-pointer select-none">
          <input type="checkbox" checked={trimWhitespace} onChange={(e) => setTrimWhitespace(e.target.checked)} className="accent-brand-500 rounded" />
          Trim Whitespace
        </label>
        <label className="flex items-center gap-1.5 text-xs text-surface-700 dark:text-dark-text cursor-pointer select-none">
          <input type="checkbox" checked={caseSensitive} onChange={(e) => setCaseSensitive(e.target.checked)} className="accent-brand-500 rounded" />
          Case Sensitive
        </label>
      </div>

      <div className="flex gap-3 text-xs text-surface-500 dark:text-dark-muted">
        <span>Input: <strong className="text-surface-700 dark:text-dark-text">{processed.rawCount}</strong> lines</span>
        <span>After filters: <strong className="text-surface-700 dark:text-dark-text">{processed.lines.length}</strong> lines</span>
        {removeDuplicates && <span>Unique: <strong className="text-surface-700 dark:text-dark-text">{processed.uniqueCount}</strong></span>}
        <span>Output: <strong className="text-surface-700 dark:text-dark-text">{output.length}</strong> lines</span>
      </div>
    </div>
  );
}
