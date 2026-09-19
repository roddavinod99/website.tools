"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useToolUrlState } from "@/lib/url-state";
import { useLoadExample } from "@/lib/load-example";

interface TokenSpan {
  text: string;
  color: string;
}

function tokenizeJson(json: string): TokenSpan[][] {
  const lines: TokenSpan[][] = [];
  const tokenRegex = /("(?:\\.|[^"\\])*"|true|false|null|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|[{}[\],:]|\s+)/g;
  let match: RegExpExecArray | null;
  let line: TokenSpan[] = [];
  const colors: Record<string, string> = {
    string: "text-green-600 dark:text-green-400",
    number: "text-orange-500 dark:text-orange-400",
    boolean: "text-purple-600 dark:text-purple-400",
    null: "text-gray-400 dark:text-gray-500",
    key: "text-blue-600 dark:text-blue-400",
    punctuation: "text-surface-600 dark:text-dark-text",
  };
  while ((match = tokenRegex.exec(json)) !== null) {
    const token = match[1];
    if (token === undefined) continue;
    if (/^\s+$/.test(token)) {
      if (token.includes("\n")) {
        const parts = token.split(/(\n)/);
        for (const p of parts) {
          if (p === "\n") { lines.push(line); line = []; }
          else if (p) line.push({ text: p, color: colors.punctuation });
        }
      } else {
        line.push({ text: token, color: colors.punctuation });
      }
      continue;
    }
    if (token.startsWith('"')) {
      const isKey = json[tokenRegex.lastIndex] === ":" || json[tokenRegex.lastIndex] === " " && json[tokenRegex.lastIndex + 1] === ":";
      line.push({ text: token, color: isKey ? colors.key : colors.string });
    } else if (token === "true" || token === "false") {
      line.push({ text: token, color: colors.boolean });
    } else if (token === "null") {
      line.push({ text: token, color: colors.null });
    } else if (/^-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?$/.test(token)) {
      line.push({ text: token, color: colors.number });
    } else {
      line.push({ text: token, color: colors.punctuation });
    }
  }
  if (line.length) lines.push(line);
  return lines;
}

function sortKeys(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(sortKeys);
  if (obj !== null && typeof obj === "object") {
    const sorted: Record<string, unknown> = {};
    for (const k of Object.keys(obj).sort()) sorted[k] = sortKeys((obj as Record<string, unknown>)[k]);
    return sorted;
  }
  return obj;
}

function stripQuotesFromKeys(json: string): string {
  return json.replace(/"([^"]+)":/g, "$1:");
}

function formatCompactArray(json: string): string {
  return json.replace(/\[\s*([^\]]+?)\s*\]/g, (_, inner: string) => {
    const items = inner.split(",").map((s: string) => s.trim());
    if (items.length <= 4 && items.join(", ").length < 60) return `[${items.join(", ")}]`;
    return `[\n${items.map((i: string) => `  ${i}`).join(",\n")}\n]`;
  });
}

function getErrorLineCol(input: string, msg: string): { line: number; col: number } | null {
  const lc = msg.match(/position\s+(\d+)/) || msg.match(/at\s+(\d+)/);
  if (lc) {
    const pos = parseInt(lc[1], 10);
    const before = input.slice(0, pos);
    return { line: before.split("\n").length, col: pos - before.lastIndexOf("\n") };
  }
  return null;
}

const HISTORY_KEY = "json-formatter-history";

type ViewTab = "text" | "tree";

function getJsonType(v: unknown): string {
  if (v === null) return "null";
  if (Array.isArray(v)) return "array";
  return typeof v;
}

function typeBadgeClass(type: string): string {
  switch (type) {
    case "string": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    case "number": return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
    case "boolean": return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
    case "null": return "bg-gray-100 text-gray-500 dark:bg-dark-border dark:text-dark-muted";
    case "array": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    case "object": return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
    default: return "bg-surface-100 text-surface-600 dark:bg-dark-border dark:text-dark-muted";
  }
}

function JsonTreeNode({
  name,
  value,
  depth,
  expandSignal,
  expandValue,
}: {
  name?: string;
  value: unknown;
  depth: number;
  expandSignal: number;
  expandValue: boolean;
}) {
  const type = getJsonType(value);
  const isExpandable = type === "object" || type === "array";
  const entries = isExpandable
    ? type === "array"
      ? (value as unknown[]).map((v, i) => [String(i), v] as const)
      : Object.entries(value as Record<string, unknown>)
    : [];
  const [expanded, setExpanded] = useState(depth < 2);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setExpanded(expandValue);
  }, [expandSignal, expandValue]);

  if (!isExpandable) {
    return (
      <div className="flex flex-wrap items-center gap-1.5 py-0.5 pl-2 text-sm font-mono">
        {name !== undefined && (
          <>
            <span className="text-blue-600 dark:text-blue-400">&quot;{name}&quot;</span>
            <span className="text-surface-400 dark:text-dark-muted">:</span>
          </>
        )}
        <span className={type === "string" ? "text-green-600 dark:text-green-400" : type === "number" ? "text-orange-500 dark:text-orange-400" : type === "boolean" ? "text-purple-600 dark:text-purple-400" : "text-gray-400 dark:text-gray-500"}>
          {type === "string" ? `"${String(value)}"` : String(value)}
        </span>
        <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${typeBadgeClass(type)}`}>{type}</span>
      </div>
    );
  }

  const length = entries.length;
  const label = type === "array" ? `Array[${length}]` : `Object {${length}}`;

  return (
    <div className="pl-2">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="flex items-center gap-1.5 py-0.5 text-sm font-mono hover:bg-surface-50 dark:hover:bg-dark-surface rounded px-1 -ml-1"
        aria-expanded={expanded}
        aria-label={`${expanded ? "Collapse" : "Expand"} ${name ?? label}`}
      >
        <span className="inline-flex h-4 w-4 items-center justify-center text-surface-400 dark:text-dark-muted text-xs" aria-hidden="true">
          {expanded ? "▾" : "▸"}
        </span>
        {name !== undefined && (
          <>
            <span className="text-blue-600 dark:text-blue-400">&quot;{name}&quot;</span>
            <span className="text-surface-400 dark:text-dark-muted">:</span>
          </>
        )}
        <span className="text-surface-600 dark:text-dark-text">{label}</span>
        <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${typeBadgeClass(type)}`}>{type}</span>
        {type === "array" && <span className="text-xs text-surface-400 dark:text-dark-muted">length {length}</span>}
      </button>
      {expanded && (
        <div className="ml-3 border-l border-surface-200 dark:border-dark-border pl-2">
          {length === 0 ? (
            <span className="text-xs text-surface-400 dark:text-dark-muted italic">empty</span>
          ) : (
            entries.map(([k, v]) => (
              <JsonTreeNode key={k} name={type === "array" ? undefined : k} value={v} depth={depth + 1} expandSignal={expandSignal} expandValue={expandValue} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

export function JSONFormatter() {
  const { state, updateState } = useToolUrlState({
    input: "",
    indent: "2",
    sortKeysEnabled: false,
    stripQuotes: false,
    compactArrays: false,
    wordWrap: true,
    searchTerm: "",
  });

  const [input, setInput] = useState(() => state.input as string);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [errorLine, setErrorLine] = useState<number | null>(null);
  const [errorCol, setErrorCol] = useState<number | null>(null);
  const [indent, setIndent] = useState<number | string>(() => state.indent as number | string);
  const [sortKeysEnabled, setSortKeysEnabled] = useState(() => state.sortKeysEnabled as boolean);
  const [stripQuotes, setStripQuotes] = useState(() => state.stripQuotes as boolean);
  const [compactArrays, setCompactArrays] = useState(() => state.compactArrays as boolean);
  const [wordWrap, setWordWrap] = useState(() => state.wordWrap as boolean);
  const [searchTerm, setSearchTerm] = useState(() => state.searchTerm as string);
  const [searchIndex, setSearchIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<ViewTab>("text");
  const [history, setHistory] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  });
  const [historySearch, setHistorySearch] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [expandSignal, setExpandSignal] = useState(0);
  const [expandValue, setExpandValue] = useState(true);
  const outputRef = useRef<HTMLPreElement>(null);
  const pasteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const historyIdRef = useRef(0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setHistory(JSON.parse(raw) as string[]);
    } catch {
      // ignore
    }
  }, []);

  const persistHistory = useCallback((next: string[]) => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next.slice(0, 50)));
    } catch {
      // quota
    }
  }, []);

  const addToHistory = useCallback((formatted: string) => {
    if (!formatted.trim()) return;
    setHistory((prev) => {
      const next = [formatted, ...prev.filter((h) => h !== formatted)].slice(0, 50);
      persistHistory(next);
      return next;
    });
    historyIdRef.current += 1;
  }, [persistHistory]);

  const handleChange = useCallback((val: string) => {
    setInput(val);
    updateState({ input: val });
    if (pasteTimer.current) clearTimeout(pasteTimer.current);
    pasteTimer.current = setTimeout(() => {
      try { const p = JSON.parse(val); setOutput(JSON.stringify(p, null, indent === "tab" ? "\t" : Number(indent))); setError(""); setErrorLine(null); setErrorCol(null); } catch {}
    }, 400);
  }, [indent, updateState]);

  useLoadExample("json-formatter", (text) => handleChange(text));

  const format = useCallback(async () => {
    const runFormat = () => {
      try {
        let parsed = JSON.parse(input);
        if (sortKeysEnabled) parsed = sortKeys(parsed as Record<string, unknown>);
        const indentStr = indent === "tab" ? "\t" : Number(indent);
        let formatted = JSON.stringify(parsed, null, indentStr);
        if (stripQuotes) formatted = stripQuotesFromKeys(formatted);
        if (compactArrays) formatted = formatCompactArray(formatted);
        setOutput(formatted);
        setError("");
        setErrorLine(null);
        setErrorCol(null);
        addToHistory(formatted);
      } catch (e) {
        const msg = (e as Error).message;
        setError(msg);
        const lc = getErrorLineCol(input, msg);
        if (lc) { setErrorLine(lc.line); setErrorCol(lc.col); }
        setOutput("");
      }
    };
    runFormat();
  }, [input, indent, sortKeysEnabled, stripQuotes, compactArrays, addToHistory]);

  const minify = useCallback(async () => {
    try {
      const minified = JSON.stringify(JSON.parse(input));
      setOutput(minified);
      setError("");
      setErrorLine(null);
      setErrorCol(null);
      addToHistory(minified);
    } catch (e) {
      const msg = (e as Error).message;
      setError(msg);
      const lc = getErrorLineCol(input, msg);
      if (lc) { setErrorLine(lc.line); setErrorCol(lc.col); }
      setOutput("");
    }
  }, [input, addToHistory]);

  const validate = useCallback(async () => {
    try {
      JSON.parse(input);
      setError("");
      setErrorLine(null);
      setErrorCol(null);
      setOutput("JSON is valid.");
    } catch (e) {
      const msg = (e as Error).message;
      setError(msg);
      const lc = getErrorLineCol(input, msg);
      if (lc) { setErrorLine(lc.line); setErrorCol(lc.col); }
      setOutput("");
    }
  }, [input]);

  const copy = useCallback(async (text: string) => {
    if (text) await navigator.clipboard.writeText(text);
  }, []);

  const download = useCallback(() => {
    if (!output) return;
    const blob = new Blob([output], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "formatted.json"; a.click();
    URL.revokeObjectURL(url);
  }, [output]);

  const clear = useCallback(() => {
    setInput(""); setOutput(""); setError(""); setErrorLine(null); setErrorCol(null); setSearchTerm(""); setSearchIndex(0);
    updateState({ input: "", searchTerm: "" });
  }, [updateState]);

  const tokens = useMemo(() => output ? tokenizeJson(output) : [], [output]);

  const searchMatches = useMemo(() => {
    if (!searchTerm || !output) return [];
    const regex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    const matches: number[] = [];
    let m: RegExpExecArray | null;
    while ((m = regex.exec(output)) !== null) matches.push(m.index);
    return matches;
  }, [searchTerm, output]);

  useEffect(() => {
    if (searchMatches.length && outputRef.current) {
      const lines = output.slice(0, searchMatches[searchIndex]).split("\n").length;
      const child = outputRef.current.children[lines - 1];
      if (child) child.scrollIntoView({ block: "center" });
    }
  }, [searchIndex, searchMatches, output]);

  const parsedForTree = useMemo(() => {
    if (!output || output === "JSON is valid.") return null;
    try {
      return JSON.parse(output);
    } catch {
      try {
        return JSON.parse(input);
      } catch {
        return null;
      }
    }
  }, [output, input]);

  const filteredHistory = useMemo(() => {
    if (!historySearch.trim()) return history;
    const q = historySearch.toLowerCase();
    return history.filter((h) => h.toLowerCase().includes(q));
  }, [history, historySearch]);

  const inputLines = input.split("\n").length;
  const inputChars = input.length;
  const jsonSize = input ? new TextEncoder().encode(input).length : 0;

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="json-input" className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Input JSON</label>
        <div className="relative">
          <textarea
            id="json-input"
            value={input}
            onChange={(e) => handleChange(e.target.value)}
            placeholder='{"key": "value"}'
            rows={8}
            spellCheck={false}
            className="w-full rounded-md border border-surface-200 bg-white p-3 pr-20 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted"
          />
          <div className="absolute bottom-2 right-2 flex gap-1 text-[10px] text-[var(--color-text-muted)] dark:text-[var(--color-dark-text-secondary)]">
            <span>{inputLines}L</span>
            <span>|</span>
            <span>{inputChars}C</span>
            <span>|</span>
            <span>{(jsonSize / 1024).toFixed(1)}KB</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button onClick={format} className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors">Format</button>
        <button onClick={minify} className="rounded-md border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors">Minify</button>
        <button onClick={validate} className="rounded-md border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors">Validate</button>
        <button onClick={() => copy(output)} disabled={!output} className="rounded-md border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 disabled:opacity-40 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors" aria-label="Copy formatted JSON to clipboard">Copy Formatted</button>
        <button onClick={() => copy(JSON.stringify(JSON.parse(input || "{}")))} disabled={!input} className="rounded-md border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 disabled:opacity-40 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors" aria-label="Copy minified JSON to clipboard">Copy Minified</button>
        <button onClick={download} disabled={!output} className="rounded-md border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 disabled:opacity-40 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors" aria-label="Download formatted JSON as file">Download</button>
        <button onClick={clear} className="rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors">Clear</button>
        <button onClick={() => setHistoryOpen((v) => !v)} className="rounded-md border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors" aria-label={historyOpen ? "Close history drawer" : "Open history drawer"} aria-expanded={historyOpen}>
          History ({history.length})
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5">
          <label htmlFor="json-indent" className="text-xs text-surface-500 dark:text-dark-muted">Indent:</label>
          <select id="json-indent" value={String(indent)} onChange={(e) => { const val = e.target.value === "tab" ? "tab" : Number(e.target.value); setIndent(val); updateState({ indent: val }); }}
            className="rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value="2">2 spaces</option>
            <option value="4">4 spaces</option>
            <option value="8">8 spaces</option>
            <option value="tab">Tab</option>
          </select>
        </div>
        <label className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-dark-muted cursor-pointer">
          <input type="checkbox" id="json-sort-keys" checked={sortKeysEnabled} onChange={(e) => { const val = e.target.checked; setSortKeysEnabled(val); updateState({ sortKeysEnabled: val }); }} className="rounded border-surface-300" /> Sort keys
        </label>
        <label className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-dark-muted cursor-pointer">
          <input type="checkbox" id="json-strip-quotes" checked={stripQuotes} onChange={(e) => { const val = e.target.checked; setStripQuotes(val); updateState({ stripQuotes: val }); }} className="rounded border-surface-300" /> Strip key quotes
        </label>
        <label className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-dark-muted cursor-pointer">
          <input type="checkbox" id="json-compact-arrays" checked={compactArrays} onChange={(e) => { const val = e.target.checked; setCompactArrays(val); updateState({ compactArrays: val }); }} className="rounded border-surface-300" /> Compact arrays
        </label>
        <label className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-dark-muted cursor-pointer">
          <input type="checkbox" id="json-word-wrap" checked={wordWrap} onChange={(e) => { const val = e.target.checked; setWordWrap(val); updateState({ wordWrap: val }); }} className="rounded border-surface-300" /> Word wrap
        </label>
      </div>

      {historyOpen && (
        <div className="rounded-md border border-surface-200 bg-white dark:border-dark-border dark:bg-dark-surface p-3 space-y-2" role="region" aria-label="JSON history">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-medium text-surface-700 dark:text-dark-text">History</h3>
            <button
              onClick={() => {
                setHistory([]);
                try { localStorage.removeItem(HISTORY_KEY); } catch {}
              }}
              className="rounded border border-surface-200 px-2 py-1 text-xs text-surface-600 hover:bg-surface-50 dark:border-dark-border dark:text-dark-muted dark:hover:bg-dark-bg"
              aria-label="Clear history"
            >
              Clear all
            </button>
          </div>
          <input
            type="text"
            value={historySearch}
            onChange={(e) => setHistorySearch(e.target.value)}
            placeholder="Search history..."
            className="w-full rounded border border-surface-200 bg-white px-2 py-1.5 text-xs text-surface-700 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
            aria-label="Search history"
          />
          <div className="max-h-48 overflow-auto space-y-1">
            {filteredHistory.length === 0 ? (
              <p className="text-xs text-surface-400 dark:text-dark-muted py-2 text-center">{history.length === 0 ? "No history yet" : "No matches"}</p>
            ) : (
              filteredHistory.map((item, idx) => (
                <button
                  key={`${idx}-${item.length}-${item.slice(0, 24)}`}
                  onClick={() => {
                    setInput(item);
                    updateState({ input: item });
                    try {
                      const p = JSON.parse(item);
                      const indentStr = indent === "tab" ? "\t" : Number(indent);
                      setOutput(JSON.stringify(p, null, indentStr));
                      setError("");
                      setErrorLine(null);
                      setErrorCol(null);
                    } catch {
                      setInput(item);
                    }
                    setHistoryOpen(false);
                  }}
                  className="w-full text-left truncate rounded border border-surface-100 bg-surface-50 px-2 py-1.5 text-xs font-mono text-surface-600 hover:bg-surface-100 dark:border-dark-border dark:bg-dark-bg dark:text-dark-muted dark:hover:bg-dark-border"
                  aria-label={`Load history entry ${item.slice(0, 40)}`}
                >
                  {item.slice(0, 120).replace(/\s+/g, " ")}
                </button>
              ))
            )}
          </div>
          <p className="text-[11px] text-surface-400 dark:text-dark-muted">Last 50 formatted outputs • stored locally • click to load</p>
        </div>
      )}

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm font-medium text-red-700 dark:text-red-400">{error}</p>
          {errorLine !== null && (
            <p className="text-xs text-red-500 dark:text-red-400 mt-0.5">Line {errorLine}, Column {errorCol}</p>
          )}
        </div>
      )}

      {output && (
        <div>
          <div role="tablist" aria-label="JSON view modes" className="flex gap-1 mb-2 border-b border-surface-200 dark:border-dark-border">
            <button
              role="tab"
              aria-selected={activeTab === "text"}
              aria-controls="panel-text"
              id="tab-text"
              onClick={() => setActiveTab("text")}
              className={`rounded-t-md px-3 py-1.5 text-xs font-medium transition-colors ${activeTab === "text" ? "bg-brand-500 text-white" : "text-surface-600 hover:bg-surface-100 dark:text-dark-muted dark:hover:bg-dark-surface"}`}
            >
              Text
            </button>
            <button
              role="tab"
              aria-selected={activeTab === "tree"}
              aria-controls="panel-tree"
              id="tab-tree"
              onClick={() => setActiveTab("tree")}
              className={`rounded-t-md px-3 py-1.5 text-xs font-medium transition-colors ${activeTab === "tree" ? "bg-brand-500 text-white" : "text-surface-600 hover:bg-surface-100 dark:text-dark-muted dark:hover:bg-dark-surface"}`}
            >
              Tree
            </button>
            {activeTab === "tree" && parsedForTree !== null && (
              <div className="ml-auto flex items-center gap-1 pb-1">
                <button onClick={() => { setExpandValue(true); setExpandSignal((s) => s + 1); }} className="rounded border border-surface-200 px-2 py-1 text-[11px] text-surface-600 hover:bg-surface-50 dark:border-dark-border dark:text-dark-muted dark:hover:bg-dark-surface" aria-label="Expand all nodes">Expand all</button>
                <button onClick={() => { setExpandValue(false); setExpandSignal((s) => s + 1); }} className="rounded border border-surface-200 px-2 py-1 text-[11px] text-surface-600 hover:bg-surface-50 dark:border-dark-border dark:text-dark-muted dark:hover:bg-dark-surface" aria-label="Collapse all nodes">Collapse all</button>
              </div>
            )}
          </div>

          {activeTab === "text" ? (
            <div id="panel-text" role="tabpanel" aria-labelledby="tab-text">
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-surface-700 dark:text-dark-text">Output</label>
                {searchMatches.length > 0 && (
                  <span className="text-xs text-surface-400 dark:text-dark-muted">
                    {searchIndex + 1}/{searchMatches.length} matches
                  </span>
                )}
              </div>
              {searchMatches.length > 0 && (
                <div className="flex items-center gap-1 mb-2">
                  <label htmlFor="json-search" className="sr-only">Search in output</label>
                  <input
                    id="json-search"
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); updateState({ searchTerm: e.target.value }); }}
                    placeholder="Search in output..."
                    className="flex-1 rounded border border-surface-200 bg-white px-2 py-1 text-xs font-mono text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text"
                  />
                  <button onClick={() => setSearchIndex((i) => (i - 1 + searchMatches.length) % searchMatches.length)} className="rounded border border-surface-200 px-2 py-1 text-xs text-surface-600 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface" aria-label="Previous match">Prev</button>
                  <button onClick={() => setSearchIndex((i) => (i + 1) % searchMatches.length)} className="rounded border border-surface-200 px-2 py-1 text-xs text-surface-600 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface" aria-label="Next match">Next</button>
                </div>
              )}
              {!searchMatches.length && searchTerm && (
                <div className="flex items-center gap-1 mb-2">
                  <label htmlFor="json-search-empty" className="sr-only">Search in output</label>
                  <input
                    id="json-search-empty"
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); updateState({ searchTerm: e.target.value }); }}
                    placeholder="Search in output..."
                    className="flex-1 rounded border border-surface-200 bg-white px-2 py-1 text-xs font-mono text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text"
                  />
                </div>
              )}
              <pre
                ref={outputRef}
                data-testid="tool-output"
                className={`rounded-md border border-surface-200 bg-surface-50 p-3 text-sm font-mono dark:border-dark-border dark:bg-dark-bg overflow-auto max-h-96 ${wordWrap ? "whitespace-pre-wrap" : "whitespace-pre"}`}
              >
                {tokens.map((line, li) => (
                  <div key={li} className="flex">
                    <span className="select-none text-right text-surface-300 dark:text-dark-muted w-8 mr-3 shrink-0 text-xs leading-5">{li + 1}</span>
                    <span className="leading-5">
                      {line.map((token, ti) => (
                        <span key={ti} className={token.color}>{token.text}</span>
                      ))}
                    </span>
                  </div>
                ))}
              </pre>
            </div>
          ) : (
            <div id="panel-tree" role="tabpanel" aria-labelledby="tab-tree" data-testid="tool-output" className="rounded-md border border-surface-200 bg-surface-50 dark:border-dark-border dark:bg-dark-bg p-3 max-h-96 overflow-auto">
              {parsedForTree === null ? (
                <p className="text-sm text-surface-500 dark:text-dark-muted">No valid JSON to display in tree view. Format valid JSON first.</p>
              ) : (
                <JsonTreeNode value={parsedForTree} depth={0} expandSignal={expandSignal} expandValue={expandValue} />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
