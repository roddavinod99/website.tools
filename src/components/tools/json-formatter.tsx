"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useComputeWorker } from "@/lib/workers/use-compute-worker";

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

export function JSONFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [errorLine, setErrorLine] = useState<number | null>(null);
  const [errorCol, setErrorCol] = useState<number | null>(null);
  const [indent, setIndent] = useState<number | string>(2);
  const [sortKeysEnabled, setSortKeysEnabled] = useState(false);
  const [stripQuotes, setStripQuotes] = useState(false);
  const [compactArrays, setCompactArrays] = useState(false);
  const [wordWrap, setWordWrap] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchIndex, setSearchIndex] = useState(0);
  const outputRef = useRef<HTMLPreElement>(null);
  const pasteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const compute = useComputeWorker();
  const computeReadyRef = useRef(false);

  useEffect(() => {
    compute.formatJson("{}", 2).then(() => { computeReadyRef.current = true; }).catch(() => {});
  }, [compute]);

  const handleChange = useCallback((val: string) => {
    setInput(val);
    if (pasteTimer.current) clearTimeout(pasteTimer.current);
    pasteTimer.current = setTimeout(() => {
      try { const p = JSON.parse(val); setOutput(JSON.stringify(p, null, indent === "tab" ? "\t" : Number(indent))); setError(""); setErrorLine(null); setErrorCol(null); } catch {}
    }, 400);
  }, [indent]);

  const format = useCallback(() => {
    const runFormat = async () => {
      if (!computeReadyRef.current) {
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
        } catch (e) {
          const msg = (e as Error).message;
          setError(msg);
          const lc = getErrorLineCol(input, msg);
          if (lc) { setErrorLine(lc.line); setErrorCol(lc.col); }
          setOutput("");
        }
        return;
      }
      try {
        const indentNum = indent === "tab" ? 2 : Number(indent);
        const formatted = await compute.formatJson(input, indentNum);
        let parsed = JSON.parse(formatted);
        if (sortKeysEnabled) parsed = sortKeys(parsed as Record<string, unknown>);
        if (compactArrays || stripQuotes) {
          let result = JSON.stringify(parsed, null, indentNum);
          if (stripQuotes) result = stripQuotesFromKeys(result);
          if (compactArrays) result = formatCompactArray(result);
          setOutput(result);
        } else {
          setOutput(JSON.stringify(parsed, null, indentNum));
        }
        setError("");
        setErrorLine(null);
        setErrorCol(null);
      } catch (e) {
        const msg = (e as Error).message;
        setError(msg);
        const lc = getErrorLineCol(input, msg);
        if (lc) { setErrorLine(lc.line); setErrorCol(lc.col); }
        setOutput("");
      }
    };
    runFormat();
  }, [input, indent, sortKeysEnabled, stripQuotes, compactArrays, compute]);

  const minify = useCallback(async () => {
    if (computeReadyRef.current) {
      try {
        const result = await compute.minifyJson(input);
        setOutput(result);
        setError("");
        setErrorLine(null);
        setErrorCol(null);
      } catch (e) {
        const msg = (e as Error).message;
        setError(msg);
        const lc = getErrorLineCol(input, msg);
        if (lc) { setErrorLine(lc.line); setErrorCol(lc.col); }
        setOutput("");
      }
    } else {
      try {
        setOutput(JSON.stringify(JSON.parse(input)));
        setError("");
        setErrorLine(null);
        setErrorCol(null);
      } catch (e) {
        const msg = (e as Error).message;
        setError(msg);
        const lc = getErrorLineCol(input, msg);
        if (lc) { setErrorLine(lc.line); setErrorCol(lc.col); }
        setOutput("");
      }
    }
  }, [input, compute]);

  const validate = useCallback(async () => {
    if (computeReadyRef.current) {
      try {
        const result = await compute.validateJson(input);
        if (result.valid) {
          setError("");
          setErrorLine(null);
          setErrorCol(null);
          setOutput("JSON is valid.");
        } else {
          setError(result.error || "Invalid JSON");
          setErrorLine(null);
          setErrorCol(null);
          setOutput("");
        }
      } catch (e) {
        const msg = (e as Error).message;
        setError(msg);
        const lc = getErrorLineCol(input, msg);
        if (lc) { setErrorLine(lc.line); setErrorCol(lc.col); }
        setOutput("");
      }
    } else {
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
    }
  }, [input, compute]);

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
  }, []);

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

  const inputLines = input.split("\n").length;
  const inputChars = input.length;
  const jsonSize = input ? new TextEncoder().encode(input).length : 0;

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Input JSON</label>
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => handleChange(e.target.value)}
            placeholder='{"key": "value"}'
            rows={8}
            spellCheck={false}
            className="w-full rounded-lg border border-surface-200 bg-white p-3 pr-20 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted"
          />
          <div className="absolute bottom-2 right-2 flex gap-1 text-[10px] text-surface-400 dark:text-dark-muted">
            <span>{inputLines}L</span>
            <span>|</span>
            <span>{inputChars}C</span>
            <span>|</span>
            <span>{(jsonSize / 1024).toFixed(1)}KB</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button onClick={format} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors">Format</button>
        <button onClick={minify} className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors">Minify</button>
        <button onClick={validate} className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors">Validate</button>
        <button onClick={() => copy(output)} disabled={!output} className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 disabled:opacity-40 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors">Copy Formatted</button>
        <button onClick={() => copy(JSON.stringify(JSON.parse(input || "{}")))} disabled={!input} className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 disabled:opacity-40 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors">Copy Minified</button>
        <button onClick={download} disabled={!output} className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 disabled:opacity-40 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors">Download</button>
        <button onClick={clear} className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors">Clear</button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-surface-500 dark:text-dark-muted">Indent:</label>
          <select value={String(indent)} onChange={(e) => setIndent(e.target.value === "tab" ? "tab" : Number(e.target.value))}
            className="rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value="2">2 spaces</option>
            <option value="4">4 spaces</option>
            <option value="8">8 spaces</option>
            <option value="tab">Tab</option>
          </select>
        </div>
        <label className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-dark-muted cursor-pointer">
          <input type="checkbox" checked={sortKeysEnabled} onChange={(e) => setSortKeysEnabled(e.target.checked)} className="rounded border-surface-300" /> Sort keys
        </label>
        <label className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-dark-muted cursor-pointer">
          <input type="checkbox" checked={stripQuotes} onChange={(e) => setStripQuotes(e.target.checked)} className="rounded border-surface-300" /> Strip key quotes
        </label>
        <label className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-dark-muted cursor-pointer">
          <input type="checkbox" checked={compactArrays} onChange={(e) => setCompactArrays(e.target.checked)} className="rounded border-surface-300" /> Compact arrays
        </label>
        <label className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-dark-muted cursor-pointer">
          <input type="checkbox" checked={wordWrap} onChange={(e) => setWordWrap(e.target.checked)} className="rounded border-surface-300" /> Word wrap
        </label>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm font-medium text-red-700 dark:text-red-400">{error}</p>
          {errorLine !== null && (
            <p className="text-xs text-red-500 dark:text-red-400 mt-0.5">Line {errorLine}, Column {errorCol}</p>
          )}
        </div>
      )}

      {output && (
        <div>
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
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search in output..."
                className="flex-1 rounded border border-surface-200 bg-white px-2 py-1 text-xs font-mono text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text"
              />
              <button onClick={() => setSearchIndex((i) => (i - 1 + searchMatches.length) % searchMatches.length)} className="rounded border border-surface-200 px-2 py-1 text-xs text-surface-600 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface">Prev</button>
              <button onClick={() => setSearchIndex((i) => (i + 1) % searchMatches.length)} className="rounded border border-surface-200 px-2 py-1 text-xs text-surface-600 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface">Next</button>
            </div>
          )}
          {!searchMatches.length && searchTerm && (
            <div className="flex items-center gap-1 mb-2">
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search in output..."
                className="flex-1 rounded border border-surface-200 bg-white px-2 py-1 text-xs font-mono text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text"
              />
            </div>
          )}
          <pre
            ref={outputRef}
            className={`rounded-lg border border-surface-200 bg-surface-50 p-3 text-sm font-mono dark:border-dark-border dark:bg-dark-bg overflow-auto max-h-96 ${wordWrap ? "whitespace-pre-wrap" : "whitespace-pre"}`}
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
      )}
    </div>
  );
}
