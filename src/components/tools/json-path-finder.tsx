"use client";

import { useState, useMemo, useCallback } from "react";

function jsonPathQuery(obj: unknown, expr: string): { path: string; value: unknown }[] {
  const results: { path: string; value: unknown }[] = [];
  if (!expr || !obj) return results;

  const parts = expr.replace(/^\$\.?/, "").split(".");
  let current: unknown = obj;
  let currentPath = "$";

  if (expr === "$") {
    results.push({ path: "$", value: obj });
    return results;
  }

  const matchAll = expr.match(/\.\.(\w+)/);
  if (matchAll) {
    const searchKey = matchAll[1]!;
    const walk = (val: unknown, path: string) => {
      if (val && typeof val === "object") {
        if (Array.isArray(val)) {
          val.forEach((item, i) => walk(item, `${path}[${i}]`));
        } else {
          for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
            const p = `${path}.${k}`;
            if (k === searchKey) results.push({ path: p, value: v });
            walk(v, p);
          }
        }
      }
    };
    walk(obj, "$");
    return results;
  }

  const wildcard = expr.match(/\.\*$/);
  if (wildcard && typeof obj === "object" && obj !== null) {
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      results.push({ path: `$.${k}`, value: v });
    }
    return results;
  }

  const bracketMatch = expr.match(/\[(\d+)\]/);
  if (bracketMatch && Array.isArray(obj)) {
    const idx = parseInt(bracketMatch[1]!);
    if (idx < obj.length) {
      results.push({ path: expr, value: obj[idx] });
    }
    return results;
  }

  for (const part of parts) {
    if (!part) continue;
    if (current && typeof current === "object" && part in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[part];
      currentPath += `.${part}`;
    } else {
      return results;
    }
  }
  results.push({ path: currentPath, value: current });
  return results;
}


const commonExpressions = [
  "$", "$.store.book[*].author", "$..author", "$.store.*", "$.store..price",
  "$..book[0]", "$..book[-1:]", "$..book[?(@.price<10)]", "$..book.length",
];

export function JsonPathFinder() {
  const [input, setInput] = useState('{\n  "store": {\n    "book": [\n      { "title": "Book A", "author": "Author 1", "price": 12.99 },\n      { "title": "Book B", "author": "Author 2", "price": 8.99 }\n    ],\n    "bicycle": { "color": "red", "price": 19.95 }\n  }\n}');
  const [pathExpr, setPathExpr] = useState("$.store.book[*].author");
  const [copied, setCopied] = useState("");

  const parsed = useMemo(() => {
    try { return JSON.parse(input); }
    catch { return null; }
  }, [input]);

  const results = useMemo(() => {
    if (!parsed) return [];
    try { return jsonPathQuery(parsed, pathExpr); }
    catch { return []; }
  }, [parsed, pathExpr]);

  const resultJson = useMemo(() => {
    const vals = results.map((r) => r.value);
    return JSON.stringify(vals.length === 1 ? vals[0] : vals, null, 2);
  }, [results]);

  const error = useMemo(() => {
    if (!input.trim()) return "";
    try { JSON.parse(input); }
    catch (e) { return "Invalid JSON: " + (e as Error).message; }
    if (!pathExpr.trim() || !parsed) return "";
    try { jsonPathQuery(parsed, pathExpr); }
    catch { return "Invalid JSONPath expression"; }
    return "";
  }, [input, parsed, pathExpr]);

  const handleCopy = useCallback(async (text: string, label: string) => {
    await navigator.clipboard.writeText(text); setCopied(label); setTimeout(() => setCopied(""), 1500);
  }, []);

  const [treeExpanded, setTreeExpanded] = useState<Record<string, boolean>>({});

  const renderTree = (val: unknown, path: string, depth: number): React.ReactNode => {
    if (depth > 3) return <span className="text-surface-400">...</span>;
    if (val === null) return <span className="text-red-400">null</span>;
    if (typeof val === "string") return <span className="text-green-600 dark:text-green-400">&quot;{val}&quot;</span>;
    if (typeof val === "number") return <span className="text-blue-600 dark:text-blue-400">{val}</span>;
    if (typeof val === "boolean") return <span className="text-purple-600 dark:text-purple-400">{String(val)}</span>;
    if (Array.isArray(val)) {
      const isExpanded = treeExpanded[path] !== false;
      return (
        <span>
          <button onClick={() => setTreeExpanded((p) => ({ ...p, [path]: !isExpanded }))} className="text-xs text-brand-500 hover:text-brand-600 mr-1">[{isExpanded ? "-" : "+"}]</button>
          {isExpanded ? val.map((v, i) => <div key={i} className="ml-4"><span className="text-surface-400 text-xs">[{i}] </span>{renderTree(v, `${path}[${i}]`, depth + 1)}</div>) : <span className="text-surface-400">{val.length} items</span>}
        </span>
      );
    }
    if (typeof val === "object" && val !== null) {
      const entries = Object.entries(val as Record<string, unknown>);
      const isExpanded = treeExpanded[path] !== false;
      return (
        <span>
          <button onClick={() => setTreeExpanded((p) => ({ ...p, [path]: !isExpanded }))} className="text-xs text-brand-500 hover:text-brand-600 mr-1">{isExpanded ? "−" : "+"}</button>
          {isExpanded ? entries.map(([k, v]) => (
            <div key={k} className="ml-4">
              <button onClick={() => {
                const newPath = path === "$" ? `$.${k}` : `${path}.${k}`;
                setPathExpr(newPath);
              }} className="text-xs text-brand-500 hover:text-brand-600 mr-1">{k}: </button>
              {renderTree(v, path === "$" ? `$.${k}` : `${path}.${k}`, depth + 1)}
            </div>
          )) : <span className="text-surface-400">{entries.length} keys</span>}
        </span>
      );
    }
    return <span className="text-surface-400">undefined</span>;
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">JSON Input</label>
        <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={6}
          className="w-full rounded-lg border border-surface-200 bg-white p-3 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
      </div>

      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">JSONPath Expression</label>
        <input type="text" value={pathExpr} onChange={(e) => setPathExpr(e.target.value)} placeholder="$.store.book[*].author"
          className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex flex-wrap gap-1">
        {commonExpressions.map((e) => (
          <button key={e} onClick={() => setPathExpr(e)} className={`rounded border px-2 py-1 text-xs ${pathExpr === e ? "bg-brand-100 border-brand-300 text-brand-700 dark:bg-brand-900/30 dark:border-brand-700 dark:text-brand-400" : "border-surface-200 text-surface-600 hover:bg-surface-50 dark:border-dark-border dark:text-dark-muted"}`}>{e}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {parsed && (
          <div className="rounded-lg border border-surface-200 bg-white p-3 dark:border-dark-border dark:bg-dark-surface">
            <p className="text-xs font-medium text-surface-500 dark:text-dark-muted mb-2">JSON Tree (click keys to build path)</p>
            <div className="text-xs font-mono max-h-60 overflow-auto">{renderTree(parsed, "$", 0)}</div>
          </div>
        )}

        <div className="rounded-lg border border-surface-200 bg-white p-3 dark:border-dark-border dark:bg-dark-surface">
          <p className="text-xs font-medium text-surface-500 dark:text-dark-muted mb-2">Results ({results.length} match{results.length !== 1 ? "es" : ""})</p>
          {results.length > 0 ? (
            <>
              <div className="space-y-1 mb-2 max-h-20 overflow-auto">
                {results.map((r, i) => (
                  <div key={i} className="flex gap-2 text-xs"><span className="text-brand-500 shrink-0">{r.path}</span></div>
                ))}
              </div>
              <pre className="text-xs font-mono text-surface-700 dark:text-dark-text bg-surface-50 p-2 rounded max-h-40 overflow-auto dark:bg-dark-surface/50">{resultJson}</pre>
            </>
          ) : (
            <p className="text-xs text-surface-400">No matches</p>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={() => handleCopy(resultJson, "results")} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50 transition-colors" disabled={!results.length}>{copied === "results" ? "Copied!" : "Copy Results"}</button>
      </div>
    </div>
  );
}
