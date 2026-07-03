"use client";

import { useState, useCallback, useRef, useEffect } from "react";

type Format = "toml" | "json" | "yaml";
type DetectMode = "auto" | "manual";

function jsonToToml(obj: unknown, prefix = ""): string {
  if (obj === null || obj === undefined) return "";
  if (typeof obj === "string") {
    if ((obj as string).includes("\n")) return `"""\n${obj}\n"""`;
    return `"${obj.replace(/"/g, '\\"')}"`;
  }
  if (typeof obj === "number" || typeof obj === "boolean") return String(obj);
  if (Array.isArray(obj)) return `[${obj.map((i) => jsonToToml(i)).join(", ")}]`;
  if (typeof obj === "object") {
    const entries = Object.entries(obj as Record<string, unknown>);
    const scalars: string[] = [];
    const tables: string[] = [];
    for (const [key, val] of entries) {
      if (val !== null && typeof val === "object" && !Array.isArray(val)) {
        const sub = jsonToToml(val, `${prefix}${key}.`).trim();
        if (sub) tables.push(`[${prefix}${key}]\n${sub}`);
      } else if (Array.isArray(val) && val.length > 0 && val.some((v) => v !== null && typeof v === "object")) {
        const arrOfTables = val.filter((v): v is Record<string, unknown> => v !== null && typeof v === "object");
        for (const item of arrOfTables) {
          const sub = jsonToToml(item, `${prefix}${key}.`).trim();
          if (sub) tables.push(`[[${prefix}${key}]]\n${sub}`);
        }
        const scalarsArr = val.filter((v) => v === null || typeof v !== "object");
        if (scalarsArr.length > 0) scalars.push(`${key} = [${scalarsArr.map((v) => jsonToToml(v)).join(", ")}]`);
      } else {
        scalars.push(`${key} = ${jsonToToml(val)}`);
      }
    }
    return [...scalars, ...tables].join("\n");
  }
  return String(obj);
}

function jsonToYaml(obj: unknown, indent = 0): string {
  const pad = "  ".repeat(indent);
  if (obj === null || obj === undefined) return "null";
  if (typeof obj === "string") {
    const s = obj as string;
    if (s.includes(":") || s.includes("#") || s.includes("\n") || s.startsWith("'")) return `"${s.replace(/"/g, '\\"')}"`;
    return s;
  }
  if (typeof obj === "number" || typeof obj === "boolean") return String(obj);
  if (Array.isArray(obj)) { return obj.map((item) => `${pad}- ${jsonToYaml(item, indent + 1).trimStart()}`).join("\n"); }
  if (typeof obj === "object") {
    const entries = Object.entries(obj as Record<string, unknown>);
    if (entries.length === 0) return "{}";
    return entries.map(([key, val]) => {
      const v = jsonToYaml(val, indent + 1);
      return `${pad}${key}: ${v.includes("\n") ? `\n${v}` : v}`;
    }).join("\n");
  }
  return String(obj);
}

function detectFormat(input: string): Format {
  const t = input.trim();
  if (!t) return "json";
  if (t.startsWith("{") || t.startsWith("[")) return "json";
  if (t.includes("\n") && (t.includes(" = ") || t.startsWith("[") && t.includes("]"))) return "toml";
  return "yaml";
}

function parseYamlSimple(yaml: string): string {
  const lines = yaml.split("\n").filter((l) => l.trim() && !l.trim().startsWith("#"));
  const result: Record<string, unknown> = {};
  const stack: { indent: number; obj: Record<string, unknown> }[] = [{ indent: -1, obj: result }];
  for (const line of lines) {
    const indent = line.search(/\S/);
    const trimmed = line.trim();
    const isArray = trimmed.startsWith("- ");
    const content = isArray ? trimmed.slice(2) : trimmed;
    const colonIdx = content.indexOf(": ");
    const key = colonIdx > -1 ? content.slice(0, colonIdx).trim() : content;
    const val = colonIdx > -1 ? content.slice(colonIdx + 2).trim() : "";
    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) stack.pop();
    const current = stack[stack.length - 1].obj;
    if (isArray) {
      if (!Array.isArray(current._arr)) { current._arr = []; current._isArr = true; }
      if (colonIdx === -1) (current._arr as unknown[]).push(val || key);
      else { const o: Record<string, unknown> = {}; o[key] = val || {}; (current._arr as unknown[]).push(o); }
    } else if (val) {
      current[key] = val === "null" ? null : val === "true" ? true : val === "false" ? false : /^\d+\.?\d*$/.test(val) ? Number(val) : val;
    } else {
      const next: Record<string, unknown> = {};
      current[key] = next;
      stack.push({ indent, obj: next });
    }
  }
  function clean(obj: Record<string, unknown>): unknown {
    if (obj._isArr) return (obj as unknown as { _arr: unknown[] })._arr.map((v) => typeof v === "object" && v !== null ? clean(v as Record<string, unknown>) : v);
    const r: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      if (k === "_arr" || k === "_isArr") continue;
      r[k] = v !== null && typeof v === "object" ? clean(v as Record<string, unknown>) : v;
    }
    return r;
  }
  return JSON.stringify(clean(result), null, 2);
}

function convertTomlToJson(toml: string): string {
  const result: Record<string, unknown> = {};
  let currentPath = "";
  const lines = toml.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      currentPath = trimmed.slice(1, -1).trim();
      if (currentPath.startsWith("[")) {
        currentPath = currentPath.slice(1, -1).trim();
      }
      continue;
    }
    if (trimmed.includes(" = ")) {
      const eqIdx = trimmed.indexOf(" = ");
      const key = trimmed.slice(0, eqIdx).trim();
      let val: unknown = trimmed.slice(eqIdx + 3).trim();
      if (val === "true") val = true;
      else if (val === "false") val = false;
      else if ((val as string).startsWith('"') && (val as string).endsWith('"')) val = (val as string).slice(1, -1).replace(/\\"/g, '"');
      else if (/^\d+\.?\d*$/.test(val as string)) val = Number(val);
      const parts = currentPath ? currentPath.split(".") : [];
      let current = result;
      for (const p of parts) { if (!current[p]) current[p] = {}; current = current[p] as Record<string, unknown>; }
      current[key] = val;
    }
  }
  return JSON.stringify(result, null, 2);
}

export function TomlConverter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [fromFormat, setFromFormat] = useState<Format>("json");
  const [toFormat, setToFormat] = useState<Format>("toml");
  const [detectMode, setDetectMode] = useState<DetectMode>("manual");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const convert = useCallback(() => {
    if (!input.trim()) { setOutput(""); setError(""); return; }
    try {
      const actualFrom = detectMode === "auto" ? detectFormat(input) : fromFormat;
      let parsed: unknown;
      switch (actualFrom) {
        case "json": parsed = JSON.parse(input); break;
        case "yaml": parsed = JSON.parse(parseYamlSimple(input)); break;
        case "toml": parsed = JSON.parse(convertTomlToJson(input)); break;
      }
      let result = "";
      switch (toFormat) {
        case "json": result = JSON.stringify(parsed, null, 2); break;
        case "yaml": result = jsonToYaml(parsed); break;
        case "toml": result = jsonToToml(parsed); break;
      }
      setOutput(result);
      setError("");
    } catch (e) {
      const actualFrom = detectMode === "auto" ? detectFormat(input) : fromFormat;
      setError(`Invalid ${actualFrom.toUpperCase()} input: ${e instanceof Error ? e.message : ""}`);
      setOutput("");
    }
  }, [input, fromFormat, toFormat, detectMode]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(convert, 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [convert]);

  const copy = async () => { if (output) await navigator.clipboard.writeText(output); };
  const download = () => {
    if (!output) return;
    const ext = toFormat === "json" ? ".json" : toFormat === "yaml" ? ".yaml" : ".toml";
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `output${ext}`; a.click();
    URL.revokeObjectURL(url);
  };
  const clear = () => { setInput(""); setOutput(""); setError(""); };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-dark-muted cursor-pointer">
          <input type="checkbox" checked={detectMode === "auto"} onChange={(e) => setDetectMode(e.target.checked ? "auto" : "manual")} className="rounded border-surface-300" /> Auto-detect format
        </label>
        <div className="flex items-center gap-2">
          <select value={fromFormat} onChange={(e) => setFromFormat(e.target.value as Format)} disabled={detectMode === "auto"}
            className="rounded-lg border border-surface-200 bg-white px-3 py-1.5 text-sm text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text disabled:opacity-40">
            <option value="json">JSON</option>
            <option value="toml">TOML</option>
            <option value="yaml">YAML</option>
          </select>
          <span className="text-sm text-surface-400 dark:text-dark-muted">→</span>
          <select value={toFormat} onChange={(e) => setToFormat(e.target.value as Format)}
            className="rounded-lg border border-surface-200 bg-white px-3 py-1.5 text-sm text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value="toml">TOML</option>
            <option value="json">JSON</option>
            <option value="yaml">YAML</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Input</label>
        <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Paste input here..." rows={6} spellCheck={false}
          className="w-full rounded-lg border border-surface-200 bg-white p-3 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted" />
      </div>

      <div className="flex gap-2">
        <button onClick={copy} disabled={!output} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-40 transition-colors">Copy {toFormat.toUpperCase()}</button>
        <button onClick={download} disabled={!output} className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 disabled:opacity-40 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors">Download .{toFormat}</button>
        <button onClick={clear} className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors">Clear</button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm font-medium text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {output && (
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">{toFormat.toUpperCase()} Output</label>
          <pre className="rounded-lg border border-surface-200 bg-surface-50 p-3 text-sm font-mono text-surface-900 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text overflow-auto max-h-60 whitespace-pre-wrap">{output}</pre>
        </div>
      )}
    </div>
  );
}
