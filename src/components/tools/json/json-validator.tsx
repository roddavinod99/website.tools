"use client";

import { useState, useCallback, useRef, useMemo, useEffect } from "react";

interface ValidationResult {
  valid: boolean;
  error?: string;
  line?: number;
  column?: number;
  data?: unknown;
}

interface StructureNode {
  key: string;
  type: string;
  children?: StructureNode[];
  path: string;
}

function analyzeStructure(data: unknown, path = "$"): StructureNode {
  if (Array.isArray(data)) {
    return {
      key: path,
      type: `Array[${data.length}]`,
      children: data.length > 0 && typeof data[0] === "object" && data[0] !== null
        ? [analyzeStructure(data[0], `${path}[0]`)]
        : undefined,
      path,
    };
  }
  if (data !== null && typeof data === "object") {
    const entries = Object.entries(data as Record<string, unknown>);
    return {
      key: path,
      type: `Object`,
      children: entries.map(([k, v]) => analyzeStructure(v, `${path}.${k}`)),
      path,
    };
  }
  return { key: path, type: typeof data, path };
}

function computeStats(data: unknown): { keys: number; depth: number; arrays: number; types: Record<string, number> } {
  const types: Record<string, number> = {};
  let keys = 0;
  let depth = 0;
  let arrays = 0;

  function walk(v: unknown, d: number) {
    depth = Math.max(depth, d);
    if (Array.isArray(v)) { arrays++; types.array = (types.array || 0) + 1; v.forEach((item) => walk(item, d + 1)); }
    else if (v !== null && typeof v === "object") {
      types.object = (types.object || 0) + 1;
      for (const val of Object.values(v as Record<string, unknown>)) { keys++; walk(val, d + 1); }
    } else {
      const t = typeof v;
      types[t] = (types[t] || 0) + 1;
    }
  }
  walk(data, 0);
  return { keys, depth, arrays, types };
}

interface TreeNodeProps {
  node: StructureNode;
  expanded: Set<string>;
  toggle: (p: string) => void;
  onSelect: (p: string) => void;
  selected: string;
}

function TreeNode({ node, expanded, toggle, onSelect, selected }: TreeNodeProps) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expanded.has(node.path);
  const isSelected = selected === node.path;
  return (
    <div>
      <button
        onClick={() => { onSelect(node.path); if (hasChildren) toggle(node.path); }}
        className={`flex items-center gap-1 px-2 py-0.5 text-xs w-full text-left rounded hover:bg-surface-100 dark:hover:bg-dark-surface ${isSelected ? "bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-400" : "text-surface-700 dark:text-dark-text"}`}
      >
        {hasChildren && <span className="w-3 text-center text-surface-400">{isExpanded ? "▼" : "▶"}</span>}
        {!hasChildren && <span className="w-3" />}
        <span className="font-medium">{node.key.replace(/^.*\./, "")}</span>
        <span className="text-surface-400 dark:text-dark-muted ml-1">({node.type})</span>
      </button>
      {hasChildren && isExpanded && (
        <div className="ml-3 border-l border-surface-200 dark:border-dark-border">
          {node.children!.map((child) => (
            <TreeNode key={child.path} node={child} expanded={expanded} toggle={toggle} onSelect={onSelect} selected={selected} />
          ))}
        </div>
      )}
    </div>
  );
}

export function JSONValidator() {
  const [input, setInput] = useState("");
  const [schemaInput, setSchemaInput] = useState("");
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [showSchema, setShowSchema] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["$"]));
  const [selectedPath, setSelectedPath] = useState("$");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const validate = useCallback(() => {
    if (!input.trim()) { setResult(null); return; }
    try {
      const data = JSON.parse(input);
      if (schemaInput.trim()) {
        try {
          JSON.parse(schemaInput);
        } catch {
          setResult({ valid: false, error: "Invalid JSON Schema (not valid JSON)" });
          return;
        }
      }
      setResult({ valid: true, data });
    } catch (e) {
      const msg = (e as Error).message;
      let line: number | undefined;
      let column: number | undefined;
      const lc = msg.match(/position\s+(\d+)/) || msg.match(/at\s+(\d+)/);
      if (lc) {
        const pos = parseInt(lc[1], 10);
        const before = input.slice(0, pos);
        line = before.split("\n").length;
        column = pos - before.lastIndexOf("\n");
      }
      setResult({ valid: false, error: msg, line, column });
    }
  }, [input, schemaInput]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(validate, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [validate]);

  const stats = useMemo(() => result?.valid && result.data ? computeStats(result.data) : null, [result]);
  const tree = useMemo(() => result?.valid && result.data ? analyzeStructure(result.data) : null, [result]);

  const toggleNode = useCallback((path: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path); else next.add(path);
      return next;
    });
  }, []);

  const suggestions = useMemo(() => {
    if (!result || result.valid) return [];
    const s: string[] = [];
    const msg = result.error || "";
    if (msg.includes("trailing comma") || msg.includes("extra comma")) s.push("Remove trailing commas before closing brackets/braces");
    if (msg.includes("Unexpected token") || msg.includes("Unexpected identifier")) s.push("Check for unquoted keys or missing commas between items");
    if (msg.includes("Unexpected string")) s.push("Ensure string values are wrapped in double quotes");
    if (msg.includes("Unexpected number")) s.push("Ensure numbers are not wrapped in quotes and are valid numeric literals");
    if (msg.includes("is not valid JSON")) s.push("Verify the input is proper JSON format - use a JSON formatter to help");
    if (s.length === 0) s.push("Check the JSON structure for syntax errors near the indicated position");
    return s;
  }, [result]);

  const getValueAtPath = (data: unknown, path: string): string => {
    const parts = path.replace("$", "").split(".").filter(Boolean);
    let current: unknown = data;
    for (const p of parts) {
      if (current && typeof current === "object") {
        const arrMatch = p.match(/^(.+)\[(\d+)\]$/);
        if (arrMatch) {
          current = (current as Record<string, unknown>)[arrMatch[1]];
          if (Array.isArray(current)) current = current[parseInt(arrMatch[2])];
        } else {
          current = (current as Record<string, unknown>)[p];
        }
      }
    }
    try { return JSON.stringify(current, null, 2); } catch { return String(current); }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">JSON Input</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='{"key": "value"}'
          rows={6}
          spellCheck={false}
          className="w-full rounded-lg border border-surface-200 bg-white p-3 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted"
        />
      </div>

      <div className="flex items-center gap-2">
        <button onClick={validate} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors">Validate</button>
        <button onClick={() => setShowSchema(!showSchema)} className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${showSchema ? "bg-brand-50 border-brand-300 text-brand-700 dark:bg-brand-900/20 dark:border-brand-700 dark:text-brand-400" : "border-surface-200 text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface"}`}>
          {showSchema ? "Hide Schema" : "Add Schema"}
        </button>
      </div>

      {showSchema && (
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">JSON Schema (optional)</label>
          <textarea
            value={schemaInput}
            onChange={(e) => setSchemaInput(e.target.value)}
            placeholder='{"type": "object", "properties": {...}}'
            rows={4}
            spellCheck={false}
            className="w-full rounded-lg border border-surface-200 bg-white p-3 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted"
          />
        </div>
      )}

      {result && (
        <div className={`rounded-lg border p-3 ${result.valid ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20" : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"}`}>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${result.valid ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"}`}>
              {result.valid ? "VALID" : "INVALID"}
            </span>
            <p className={`text-sm ${result.valid ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}>
              {result.valid ? "JSON is valid" : result.error}
            </p>
          </div>
          {result.line && (
            <p className="text-xs text-red-500 dark:text-red-400 mt-1">Line {result.line}, Column {result.column}</p>
          )}
          {!result.valid && suggestions.length > 0 && (
            <div className="mt-2">
              <p className="text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">Suggestions:</p>
              <ul className="list-disc list-inside text-xs text-surface-600 dark:text-dark-muted space-y-0.5">
                {suggestions.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Keys", value: stats.keys },
            { label: "Nesting Depth", value: stats.depth },
            { label: "Arrays", value: stats.arrays },
            { label: "Types Used", value: Object.keys(stats.types).length },
          ].map((s) => (
            <div key={s.label} className="rounded-lg border border-surface-200 bg-white p-3 text-center dark:border-dark-border dark:bg-dark-surface">
              <p className="text-2xl font-bold text-brand-500">{s.value}</p>
              <p className="text-xs text-surface-500 dark:text-dark-muted">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {stats && (
        <div>
          <p className="text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">Value Type Distribution</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.types).map(([type, count]) => (
              <span key={type} className="inline-flex items-center gap-1 rounded-full bg-surface-100 px-2.5 py-0.5 text-xs text-surface-700 dark:bg-dark-surface dark:text-dark-text">
                {type}: {count}
              </span>
            ))}
          </div>
        </div>
      )}

      {stats && (
        <p className="text-xs text-surface-400 dark:text-dark-muted">
          Size: {new TextEncoder().encode(input).length} bytes | Formatted: {new TextEncoder().encode(JSON.stringify(result?.data, null, 2)).length} bytes
        </p>
      )}

      {tree && (
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Structure Tree</label>
          <div className="rounded-lg border border-surface-200 bg-white p-2 max-h-60 overflow-auto dark:border-dark-border dark:bg-dark-surface">
            <TreeNode node={tree} expanded={expanded} toggle={toggleNode} onSelect={setSelectedPath} selected={selectedPath} />
          </div>
          {selectedPath && selectedPath !== "$" && result?.valid && (
            <div className="mt-2">
              <p className="text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">Path: <code className="text-brand-500">{selectedPath}</code></p>
              <pre className="rounded border border-surface-200 bg-surface-50 p-2 text-xs font-mono text-surface-700 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text overflow-auto max-h-24">
                {getValueAtPath(result.data, selectedPath)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
