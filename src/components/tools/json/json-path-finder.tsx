"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import { Upload, Search, Expand, Minimize2, Copy } from "lucide-react";
import { validateFileSize } from "@/lib/file-security";

type NodeType = "string" | "number" | "boolean" | "null" | "array" | "object" | "undefined";

interface FlatNode {
  key: string;
  value: unknown;
  type: NodeType;
  jsonPath: string;
  jsPath: string;
  depth: number;
  hasChildren: boolean;
  childCount: number;
  isEmpty: boolean;
}

const TYPE_COLORS: Record<NodeType, string> = {
  string: "text-green-600 dark:text-green-400",
  number: "text-blue-600 dark:text-blue-400",
  boolean: "text-orange-500 dark:text-orange-400",
  null: "text-gray-400 dark:text-gray-500",
  array: "text-purple-600 dark:text-purple-400",
  object: "text-teal-600 dark:text-teal-400",
  undefined: "text-gray-400",
};

const TYPE_BADGES: Record<NodeType, string> = {
  string: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  number: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  boolean: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  null: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  array: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  object: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
  undefined: "bg-gray-100 text-gray-500",
};

function getNodeType(val: unknown): NodeType {
  if (val === null) return "null";
  if (Array.isArray(val)) return "array";
  if (typeof val === "undefined") return "undefined";
  return typeof val as NodeType;
}

function formatValue(val: unknown, type: NodeType): string {
  if (type === "string") return `"${val as string}"`;
  if (type === "null") return "null";
  if (type === "undefined") return "undefined";
  return String(val);
}

function truncateValue(val: unknown, type: NodeType, max = 80): string {
  const str = formatValue(val, type);
  if (str.length <= max) return str;
  return str.slice(0, max) + "...";
}

function getChildCount(val: unknown): number {
  if (val === null || typeof val !== "object") return 0;
  if (Array.isArray(val)) return val.length;
  return Object.keys(val as Record<string, unknown>).length;
}

function buildFlatPaths(
  obj: unknown,
  parentJsonPath = "$",
  parentJsPath = "data",
  parentKey = "$",
  depth = 0
): FlatNode[] {
  const nodes: FlatNode[] = [];

  function walk(val: unknown, key: string, jsonPath: string, jsPath: string, d: number) {
    const type = getNodeType(val);
    const hasChildren = val !== null && typeof val === "object" && getChildCount(val) > 0;
    const childCount = hasChildren ? getChildCount(val) : 0;
    const isEmpty = hasChildren ? childCount === 0 : false;

    nodes.push({ key, value: val, type, jsonPath, jsPath, depth: d, hasChildren, childCount, isEmpty });

    if (hasChildren) {
      const entries = Array.isArray(val)
        ? (val as unknown[]).map((v, i) => ({ key: String(i), value: v, suffix: `[${i}]` }))
        : Object.entries(val as Record<string, unknown>).map(([k, v]) => ({ key: k, value: v, suffix: `.${k}` }));
      for (const { key: k, value: v, suffix } of entries) {
        walk(v, k, `${jsonPath}${suffix}`, `${jsPath}${suffix}`, d + 1);
      }
    }
  }

  walk(obj, parentKey, parentJsonPath, parentJsPath, depth);
  return nodes;
}

const commonExpressions = [
  "$", "$.store.book[*].author", "$..author", "$.store.*", "$.store..price",
  "$..book[0]", "$..book[-1:]", "$..book[?(@.price<10)]", "$..book.length",
];

export function JsonPathFinder() {
  const [input, setInput] = useState('{\n  "store": {\n    "book": [\n      { "title": "Book A", "author": "Author 1", "price": 12.99 },\n      { "title": "Book B", "author": "Author 2", "price": 8.99 }\n    ],\n    "bicycle": { "color": "red", "price": 19.95 }\n  }\n}');
  const [pathExpr, setPathExpr] = useState("$.store.book[*].author");
  const [copied, setCopied] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(["$"]));
  const [showPaths, setShowPaths] = useState(false);
  const [fileError, setFileError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const parsed = useMemo(() => {
    try { return JSON.parse(input); }
    catch { return null; }
  }, [input]);

  const allNodes = useMemo(() => {
    if (!parsed) return [];
    return buildFlatPaths(parsed, "$", "data", "$", 0);
  }, [parsed]);

  const filterMatch = useCallback((path: string) => {
    if (!searchFilter) return true;
    return path.toLowerCase().includes(searchFilter.toLowerCase());
  }, [searchFilter]);

  const visibleNodes = useMemo(() => {
    if (allNodes.length === 0) return [];
    const result: FlatNode[] = [];
    for (const node of allNodes) {
      const parentPath = node.jsonPath.includes(".")
        ? node.jsonPath.slice(0, node.jsonPath.lastIndexOf("."))
        : node.jsonPath.includes("[")
          ? node.jsonPath.slice(0, node.jsonPath.lastIndexOf("["))
          : "$";
      const parentExpanded = parentPath === "$" ? expandedPaths.has("$") : expandedPaths.has(parentPath);
      if (parentExpanded || node.depth === 0) {
        if (filterMatch(node.jsonPath) || filterMatch(node.jsPath)) {
          result.push(node);
        }
      }
    }
    return result;
  }, [allNodes, expandedPaths, filterMatch]);

  const toggleExpand = (path: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const expandAll = () => {
    setExpandedPaths(new Set(allNodes.filter((n) => n.hasChildren).map((n) => n.jsonPath)));
  };

  const collapseAll = () => {
    setExpandedPaths(new Set(["$"]));
  };

  const error = useMemo(() => {
    if (!input.trim()) return "";
    try { JSON.parse(input); }
    catch (e) { return "Invalid JSON: " + (e as Error).message; }
    return "";
  }, [input]);

  const handleCopy = useCallback(async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 1500);
  }, []);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const sizeCheck = validateFileSize(file);
    if (!sizeCheck.valid) { setFileError(sizeCheck.error!); return; }
    const reader = new FileReader();
    reader.onload = () => setInput(reader.result as string);
    reader.readAsText(file);
  };

  const resultJson = useMemo(() => {
    if (!parsed || !pathExpr.trim()) return "";
    function resolvePath(obj: unknown, segments: string[]): unknown[] {
      if (segments.length === 0) return [obj];
      const [head, ...rest] = segments;
      if (head === "..") {
        if (rest.length > 0) {
          const key = rest[0];
          const remaining = rest.slice(1);
          function deepSearch(val: unknown): void {
            if (val === null || typeof val !== "object") return;
            if (Array.isArray(val)) {
              for (const item of val) deepSearch(item);
            } else {
              const objRecord = val as Record<string, unknown>;
              if (key in objRecord) {
                results.push(...resolvePath(objRecord[key], remaining));
              }
              for (const v of Object.values(objRecord)) deepSearch(v);
            }
          }
          deepSearch(obj);
        }
        return results;
      }
      if (head === "*") {
        if (obj === null || typeof obj !== "object") return [];
        const values = Array.isArray(obj) ? obj : Object.values(obj as Record<string, unknown>);
        return values.flatMap((v) => resolvePath(v, rest));
      }
      const indexMatch = head.match(/^\[(\d+)\]$/);
      if (indexMatch) {
        const idx = parseInt(indexMatch[1], 10);
        if (Array.isArray(obj) && idx < obj.length) return resolvePath(obj[idx], rest);
        return [];
      }
      if (typeof obj === "object" && obj !== null && !Array.isArray(obj) && head in (obj as Record<string, unknown>)) {
        return resolvePath((obj as Record<string, unknown>)[head], rest);
      }
      return [];
    }
    function tokenize(path: string): string[] {
      const clean = path.replace(/^\$\.?/, "");
      if (!clean) return [];
      const segments: string[] = [];
      let i = 0;
      while (i < clean.length) {
        if (clean[i] === ".") {
          if (clean[i + 1] === ".") { segments.push(".."); i += 2; if (clean[i] === ".") i++; }
          else { i++; }
        } else if (clean[i] === "[") {
          const close = clean.indexOf("]", i);
          if (close === -1) { segments.push(clean.slice(i)); break; }
          segments.push(clean.slice(i, close + 1));
          i = close + 1;
        } else {
          let end = i + 1;
          while (end < clean.length && clean[end] !== "." && clean[end] !== "[") end++;
          segments.push(clean.slice(i, end));
          i = end;
        }
      }
      return segments;
    }
    const segments = tokenize(pathExpr);
    const results = resolvePath(parsed, segments);
    if (results.length === 0) return "";
    if (results.length === 1) return JSON.stringify(results[0], null, 2);
    return JSON.stringify(results, null, 2);
  }, [parsed, pathExpr]);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">JSON Input</label>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={5}
            className="w-full rounded-lg border border-surface-200 bg-white p-3 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input ref={fileRef} type="file" accept=".json" onChange={handleFile} className="hidden" />
        <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1 rounded-lg border border-surface-200 px-3 py-1.5 text-xs font-medium text-surface-600 hover:bg-surface-50 dark:border-dark-border dark:text-dark-muted dark:hover:bg-dark-surface transition-colors">
          <Upload className="w-3 h-3" /> Upload .json
        </button>
        <span className="text-xs text-surface-400 dark:text-dark-muted">{allNodes.length} nodes</span>
      </div>

      {fileError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm text-red-700 dark:text-red-400">{fileError}</p>
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      {parsed && (
        <>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-surface-400" />
                <input type="text" value={searchFilter} onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Filter paths..."
                  className="w-full rounded-lg border border-surface-200 bg-white pl-7 pr-3 py-1.5 text-xs font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
              </div>
              <button onClick={expandAll} className="flex items-center gap-1 rounded-lg border border-surface-200 px-2 py-1.5 text-xs text-surface-600 hover:bg-surface-50 dark:border-dark-border dark:text-dark-muted dark:hover:bg-dark-surface transition-colors">
                <Expand className="w-3 h-3" /> All
              </button>
              <button onClick={collapseAll} className="flex items-center gap-1 rounded-lg border border-surface-200 px-2 py-1.5 text-xs text-surface-600 hover:bg-surface-50 dark:border-dark-border dark:text-dark-muted dark:hover:bg-dark-surface transition-colors">
                <Minimize2 className="w-3 h-3" /> All
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-surface-200 bg-white dark:border-dark-border dark:bg-dark-surface max-h-80 overflow-auto">
            <div className="px-3 py-2 border-b border-surface-200 dark:border-dark-border flex items-center gap-2">
              <span className="text-xs font-medium text-surface-500 dark:text-dark-muted">JSON Tree</span>
              <button onClick={() => setShowPaths(!showPaths)} className="text-xs text-brand-500 hover:text-brand-600 ml-auto">{showPaths ? "Hide" : "Show"} paths</button>
            </div>
            <div className="p-2 text-xs font-mono space-y-0.5">
              {visibleNodes.map((node) => {
                const padLeft = node.depth * 16;
                const isExpanded = expandedPaths.has(node.jsonPath);
                return (
                  <div key={node.jsonPath} className="flex items-start gap-1 py-0.5 hover:bg-surface-50 dark:hover:bg-dark-surface/50 rounded px-1 group" style={{ paddingLeft: `${padLeft + 4}px` }}>
                    <div className="flex items-center gap-1 min-w-0 flex-1">
                      {node.hasChildren ? (
                        <button onClick={() => toggleExpand(node.jsonPath)}
                          className="shrink-0 w-4 h-4 flex items-center justify-center text-[10px] text-surface-400 hover:text-surface-600 dark:hover:text-dark-text rounded">
                          {isExpanded ? "▼" : "▶"}
                        </button>
                      ) : (
                        <span className="shrink-0 w-4" />
                      )}
                      <span className="text-surface-600 dark:text-dark-muted shrink-0">{node.key === "$" ? "$" : node.key.match(/^\[\d+\]$/) ? <span className="text-purple-500">{node.key}</span> : <span>{node.key}</span>}</span>
                      <span className="text-surface-300 dark:text-dark-muted">:</span>
                      {node.hasChildren && !isExpanded ? (
                        <span className="text-surface-400 text-[10px]">
                          {node.type === "array" ? `[${node.childCount} items]` : `{${node.childCount} keys}`}
                        </span>
                      ) : (
                        <span className={`${TYPE_COLORS[node.type]} truncate`} title={formatValue(node.value, node.type)}>
                          {truncateValue(node.value, node.type)}
                        </span>
                      )}
                      <span className={`ml-1 text-[9px] px-1 rounded ${TYPE_BADGES[node.type]}`}>{node.type}</span>
                    </div>
                    <div className="shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {showPaths && (
                        <div className="flex items-center gap-1 text-[9px] text-surface-400 dark:text-dark-muted">
                          <code className="text-brand-500">{node.jsonPath}</code>
                          <span className="text-surface-300">|</span>
                          <code className="text-brand-500">{node.jsPath}</code>
                        </div>
                      )}
                      <button onClick={() => handleCopy(node.jsonPath, `path-${node.jsonPath}`)}
                        className="text-surface-400 hover:text-brand-500 transition-colors" title="Copy JSONPath">
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
              {visibleNodes.length === 0 && (
                <p className="text-xs text-surface-400 dark:text-dark-muted p-2">No matching nodes</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">JSONPath Expression</label>
              <input type="text" value={pathExpr} onChange={(e) => setPathExpr(e.target.value)} placeholder="$.store.book[*].author"
                className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
            </div>
            <div className="flex flex-wrap items-center gap-1 self-end">
              {commonExpressions.map((e) => (
                <button key={e} onClick={() => setPathExpr(e)}
                  className={`rounded border px-2 py-1 text-xs ${pathExpr === e ? "bg-brand-100 border-brand-300 text-brand-700 dark:bg-brand-900/30 dark:border-brand-700 dark:text-brand-400" : "border-surface-200 text-surface-600 hover:bg-surface-50 dark:border-dark-border dark:text-dark-muted"}`}>{e}</button>
              ))}
            </div>
          </div>

          {resultJson && (
            <div className="rounded-lg border border-surface-200 bg-white p-3 dark:border-dark-border dark:bg-dark-surface">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-surface-500 dark:text-dark-muted">Query Result</span>
                <button onClick={() => handleCopy(resultJson, "result")} className="text-xs text-brand-500 hover:text-brand-600 transition-colors">
                  {copied === "result" ? "Copied!" : "Copy"}
                </button>
              </div>
              <pre className="text-xs font-mono text-surface-700 dark:text-dark-text bg-surface-50 p-2 rounded max-h-40 overflow-auto dark:bg-dark-surface/50">{resultJson}</pre>
            </div>
          )}
        </>
      )}
    </div>
  );
}
