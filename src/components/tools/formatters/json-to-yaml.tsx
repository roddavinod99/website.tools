"use client";

import { useState, useCallback, useRef, useEffect } from "react";

type Direction = "json-to-yaml" | "yaml-to-json";
type QuoteStyle = "single" | "double" | "minimal";
type NullRep = "null" | "~";
type BlockStyle = "literal" | "folded";

function jsonToYaml(
  obj: unknown,
  indent: number,
  indentSize: number,
  quoteStyle: QuoteStyle,
  nullRep: NullRep,
  blockStyle: BlockStyle,
  lineWidth: number,
  depth = 0,
): string {
  const pad = " ".repeat(depth * indentSize);
  if (obj === null || obj === undefined) return nullRep;
  if (typeof obj === "string") {
    const s = obj as string;
    if (s === "") return "''";
    if (s.includes("\n")) {
      if (blockStyle === "literal") return `|\n${s.split("\n").map((l) => `${pad}  ${l}`).join("\n")}`;
      return `>\n${s.split("\n").map((l) => `${pad}  ${l}`).join("\n")}`;
    }
    if (quoteStyle === "single") return `'${s.replace(/'/g, "''")}'`;
    if (quoteStyle === "double") return `"${s.replace(/"/g, '\\"')}"`;
    if (s.includes(": ") || s.startsWith("-") || s.includes("#") || s.length > lineWidth) return `"${s.replace(/"/g, '\\"')}"`;
    return s;
  }
  if (typeof obj === "number") {
    if (Number.isInteger(obj)) return obj.toString();
    return obj.toString();
  }
  if (typeof obj === "boolean") return obj ? "true" : "false";
  if (obj instanceof Date) return obj.toISOString();
  if (Array.isArray(obj)) {
    if (obj.length === 0) return "[]";
    return obj.map((item) => {
      const val = jsonToYaml(item, indent, indentSize, quoteStyle, nullRep, blockStyle, lineWidth, depth + 1);
      if (typeof item === "object" && item !== null && !Array.isArray(item)) {
        return `${pad}- ${val.trimStart().replace(/\n/g, `\n${pad}  `)}`;
      }
      return `${pad}- ${val}`;
    }).join("\n");
  }
  if (typeof obj === "object") {
    const entries = Object.entries(obj as Record<string, unknown>);
    if (entries.length === 0) return "{}";
    return entries.map(([key, val], i) => {
      const v = jsonToYaml(val, indent, indentSize, quoteStyle, nullRep, blockStyle, lineWidth, depth + 1);
      if (typeof val === "object" && val !== null && !Array.isArray(val)) {
        return `${i === 0 && depth === 0 ? "" : pad}${key}:\n${v}`;
      }
      if (typeof val === "object" && Array.isArray(val) && val.some((item) => typeof item === "object" && item !== null)) {
        return `${pad}${key}:\n${v.split("\n").map((l) => `${pad}${l}`).join("\n")}`;
      }
      return `${pad}${key}: ${v}`;
    }).join("\n");
  }
  return String(obj);
}

function yamlToJsonSimple(yaml: string): string {
  const lines = yaml.split("\n");
  const result: Record<string, unknown> = {};
  const stack: { indent: number; obj: Record<string, unknown>; key: string }[] = [{ indent: -1, obj: result, key: "" }];
  let inBlock = false;
  let blockContent: string[] = [];

  for (const line of lines) {
    const indent = line.search(/\S/);
    const trimmed = line.trim();
    if (inBlock) {
      if (trimmed && indent > 0) { blockContent.push(line); continue; }
      inBlock = false;
      const parent = stack[stack.length - 1];
      parent.obj[parent.key] = blockContent.join("\n");
      blockContent = [];
    }
    if (!trimmed || trimmed.startsWith("#")) continue;
    if (trimmed.endsWith("|") || trimmed.endsWith(">")) {
      inBlock = true;
      blockContent = [];
      const key = trimmed.slice(0, -1).trim();
      while (stack.length > 1 && stack[stack.length - 1].indent >= indent) stack.pop();
      const current = stack[stack.length - 1].obj;
      const next: Record<string, unknown> = {};
      current[key] = next;
      stack.push({ indent, obj: next, key });
      continue;
    }
    if (trimmed.startsWith("- ")) {
      const val = trimmed.slice(2);
      while (stack.length > 1 && stack[stack.length - 1].indent >= indent) stack.pop();
      const current = stack[stack.length - 1].obj;
      if (!Array.isArray(current._arr)) { current._arr = []; current._isArr = true; }
      if (val.includes(":")) {
        const [k, ...rest] = val.split(":");
        const item: Record<string, unknown> = {};
        const v = rest.join(":").trim();
        item[k.trim()] = v || {};
        (current._arr as unknown[]).push(item);
      } else {
        (current._arr as unknown[]).push(val);
      }
      continue;
    }
    if (trimmed.includes(": ")) {
      const colonIdx = trimmed.indexOf(": ");
      const key = trimmed.slice(0, colonIdx);
      const val = trimmed.slice(colonIdx + 2);
      while (stack.length > 1 && stack[stack.length - 1].indent >= indent) stack.pop();
      const current = stack[stack.length - 1].obj;
      if (!val) {
        const next: Record<string, unknown> = {};
        current[key] = next;
        stack.push({ indent, obj: next, key });
      } else {
        const parsed: unknown = val === "null" ? null : val === "~" ? null : val === "true" ? true : val === "false" ? false : /^\d+$/.test(val) ? Number(val) : /^\d+\.\d+$/.test(val) ? Number(val) : val;
        current[key] = parsed;
      }
    }
  }
  if (inBlock && blockContent.length > 0) {
    const parent = stack[stack.length - 1];
    parent.obj[parent.key] = blockContent.join("\n");
  }

  function clean(obj: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      if (k === "_arr" || k === "_isArr") continue;
      if (k === "_arr" && obj._isArr) return obj._arr as unknown as Record<string, unknown>;
      if (v !== null && typeof v === "object" && !Array.isArray(v)) {
        result[k] = clean(v as Record<string, unknown>);
      } else {
        result[k] = v;
      }
    }
    return result;
  }

  return JSON.stringify(clean(result), null, 2);
}

export function JSONToYAML() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [direction, setDirection] = useState<Direction>("json-to-yaml");
  const [indentSize, setIndentSize] = useState(2);
  const [quoteStyle, setQuoteStyle] = useState<QuoteStyle>("minimal");
  const [nullRep, setNullRep] = useState<NullRep>("null");
  const [blockStyle, setBlockStyle] = useState<BlockStyle>("literal");
  const [lineWidth, setLineWidth] = useState(80);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const convert = useCallback(() => {
    if (!input.trim()) { setOutput(""); setError(""); return; }
    try {
      if (direction === "json-to-yaml") {
        const parsed = JSON.parse(input);
        setOutput(jsonToYaml(parsed, indentSize, indentSize, quoteStyle, nullRep, blockStyle, lineWidth));
      } else {
        const json = yamlToJsonSimple(input);
        JSON.parse(json);
        setOutput(json);
      }
      setError("");
    } catch (e) {
      setError(direction === "json-to-yaml" ? "Invalid JSON" : "Invalid YAML: " + (e instanceof Error ? e.message : ""));
      setOutput("");
    }
  }, [input, direction, indentSize, quoteStyle, nullRep, blockStyle, lineWidth]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(convert, 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [convert]);

  const copy = async () => { if (output) await navigator.clipboard.writeText(output); };
  const download = () => {
    if (!output) return;
    const ext = direction === "json-to-yaml" ? ".yaml" : ".json";
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `output${ext}`; a.click();
    URL.revokeObjectURL(url);
  };
  const clear = () => { setInput(""); setOutput(""); setError(""); };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <select value={direction} onChange={(e) => { setDirection(e.target.value as Direction); setInput(""); setOutput(""); setError(""); }}
          className="rounded-lg border border-surface-200 bg-white px-3 py-1.5 text-sm text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
          <option value="json-to-yaml">JSON → YAML</option>
          <option value="yaml-to-json">YAML → JSON</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">{direction === "json-to-yaml" ? "JSON" : "YAML"} Input</label>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder={direction === "json-to-yaml" ? '{"key": "value"}' : "key: value"} rows={8} spellCheck={false}
            className="w-full rounded-lg border border-surface-200 bg-white p-3 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted" />
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">{direction === "json-to-yaml" ? "YAML" : "JSON"} Output</label>
          <pre className="w-full rounded-lg border border-surface-200 bg-surface-50 p-3 text-sm font-mono text-surface-900 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text overflow-auto max-h-64 whitespace-pre-wrap min-h-[11rem]">{output || " "}</pre>
        </div>
      </div>

      {direction === "json-to-yaml" && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-surface-500 dark:text-dark-muted">Indent:</label>
            <select value={indentSize} onChange={(e) => setIndentSize(Number(e.target.value))}
              className="rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
              <option value={2}>2</option>
              <option value={4}>4</option>
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-surface-500 dark:text-dark-muted">Quotes:</label>
            <select value={quoteStyle} onChange={(e) => setQuoteStyle(e.target.value as QuoteStyle)}
              className="rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
              <option value="minimal">Minimal</option>
              <option value="single">Single</option>
              <option value="double">Double</option>
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-surface-500 dark:text-dark-muted">Null:</label>
            <select value={nullRep} onChange={(e) => setNullRep(e.target.value as NullRep)}
              className="rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
              <option value="null">null</option>
              <option value="~">~</option>
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-surface-500 dark:text-dark-muted">Block:</label>
            <select value={blockStyle} onChange={(e) => setBlockStyle(e.target.value as BlockStyle)}
              className="rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
              <option value="literal">Literal (|)</option>
              <option value="folded">Folded (&gt;)</option>
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-surface-500 dark:text-dark-muted">Line width:</label>
            <input type="number" value={lineWidth} onChange={(e) => setLineWidth(Number(e.target.value))} min={20} max={200} className="w-16 rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button onClick={copy} disabled={!output} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-40 transition-colors">Copy {direction === "json-to-yaml" ? "YAML" : "JSON"}</button>
        <button onClick={download} disabled={!output} className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 disabled:opacity-40 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors">Download .{direction === "json-to-yaml" ? "yaml" : "json"}</button>
        <button onClick={clear} className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors">Clear</button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm font-medium text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}
