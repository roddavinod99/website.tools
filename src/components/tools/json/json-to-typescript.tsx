"use client";

import { useState, useCallback, useEffect } from "react";
import { useLoadExample } from "@/lib/load-example";

function toPascalCase(str: string): string {
  return str.replace(/[_-]+/g, " ").replace(/\s+/g, " ").split(" ").map((s) => s[0]?.toUpperCase() + s.slice(1)).join("").replace(/[^a-zA-Z0-9]/g, "");
}

function samplePreview(value: unknown): string {
  if (typeof value === "string") return `"${value.length > 40 ? value.slice(0, 40) + "…" : value}"`;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (value === null) return "null";
  if (Array.isArray(value)) return value.length > 0 ? `${samplePreview(value[0])} …` : "[]";
  if (typeof value === "object") return "{ … }";
  return "";
}

function generateTypescript(input: string, opts: { outputType: "interface" | "type"; optional: boolean; readonly: boolean; export_: boolean; pascalCase: boolean; jsdoc: boolean }): string {
  const parsed = JSON.parse(input);
  const lines: string[] = [];
  function getTypeName(key: string): string {
    return toPascalCase(key) + (opts.pascalCase ? "" : "");
  }

  function inferType(value: unknown, key: string, parentDefined?: string): string {
    if (value === null) return "null";
    if (Array.isArray(value)) {
      if (value.length === 0) return "unknown[]";
      const itemTypes = [...new Set(value.map((v) => inferType(v, key + "Item", parentDefined)))];
      if (itemTypes.length === 1) return `${itemTypes[0]}[]`;
      return `(${itemTypes.join(" | ")})[]`;
    }
    if (typeof value === "string") return "string";
    if (typeof value === "number") return Number.isInteger(value) ? "number" : "number";
    if (typeof value === "boolean") return "boolean";
    if (typeof value === "object" && value !== null) {
      const obj = value as Record<string, unknown>;
      const objName = parentDefined || getTypeName(key);
      if (Object.keys(obj).length === 0) return "Record<string, unknown>";
      const props = Object.entries(obj).map(([k, v]) => {
        const optional = opts.optional ? "?" : "";
        const readonly = opts.readonly ? "readonly " : "";
        const valType = inferType(v, k, undefined);
        return `  ${readonly}${k}${optional}: ${valType};`;
      });
      const typeStr = `{\n${props.join("\n")}\n}`;
      if (opts.outputType === "type") return typeStr;
      return objName;
    }
    return "unknown";
  }

  function defineType(val: Record<string, unknown>, name: string, defined: Set<string>): void {
    const typeKey = opts.pascalCase ? toPascalCase(name) : name;
    if (defined.has(typeKey)) return;
    defined.add(typeKey);

    const props: string[] = [];
    for (const [key, value] of Object.entries(val)) {
      const optional = opts.optional ? "?" : "";
      const readonly = opts.readonly ? "readonly " : "";

      let valType: string;
      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        const nestedName = opts.pascalCase ? toPascalCase(key) : key;
        valType = nestedName;
        defineType(value as Record<string, unknown>, nestedName, defined);
      } else if (Array.isArray(value)) {
        if (value.length > 0 && typeof value[0] === "object" && value[0] !== null) {
          const nestedName = opts.pascalCase ? toPascalCase(key) : key;
          valType = `${nestedName}[]`;
          if (!Array.isArray(value[0])) {
            defineType(value[0] as Record<string, unknown>, nestedName, defined);
          }
        } else {
          valType = inferType(value, key, undefined);
        }
      } else {
        valType = inferType(value, key, undefined);
      }

      if (opts.jsdoc) {
        const preview = samplePreview(value);
        props.push(`  /**`);
        props.push(`   * ${key} (${valType.replace(/\s+/g, " ").slice(0, 60)})${preview ? ` — e.g. ${preview}` : ""}`);
        props.push(`   */`);
      }
      props.push(`  ${readonly}${key}${optional}: ${valType};`);
    }

    const exportKw = opts.export_ ? "export " : "";
    lines.push(`${exportKw}${opts.outputType === "interface" ? "interface" : "type"} ${typeKey}${opts.outputType === "type" ? " =" : ""}`);
    lines.push(`{`);
    lines.push(props.join("\n"));
    lines.push(`}`);
    if (opts.outputType === "type") lines[lines.length - 1] = lines[lines.length - 1] + ";";
    lines.push("");
  }

  const defined = new Set<string>();
  if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
    defineType(parsed as Record<string, unknown>, "RootObject", defined);
  } else {
    const exportKw = opts.export_ ? "export " : "";
    lines.push(`${exportKw}type Root = ${inferType(parsed, "Root", "Root")};`);
    lines.push("");
  }

  return lines.join("\n");
}

export function JsonToTypescript() {
  const [input, setInput] = useState('{\n  "firstName": "John",\n  "lastName": "Doe",\n  "age": 30,\n  "email": "john@example.com",\n  "address": {\n    "street": "123 Main St",\n    "city": "New York",\n    "zipCode": "10001"\n  },\n  "tags": ["admin", "user"]\n}');
  useLoadExample("json-to-typescript", (text) => setInput(text));
  const [outputType, setOutputType] = useState<"interface" | "type">("interface");
  const [optional, setOptional] = useState(false);
  const [readonly, setReadonly] = useState(false);
  const [export_, setExport_] = useState(true);
  const [pascalCase, setPascalCase] = useState(true);
  const [jsdoc, setJsdoc] = useState(false);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!input.trim()) { setOutput(""); setError(""); return; }
      try {
        const result = generateTypescript(input, { outputType, optional, readonly, export_, pascalCase, jsdoc });
        setOutput(result);
        setError("");
      } catch (e) {
        setError("Invalid JSON: " + (e as Error).message);
        setOutput("");
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [input, outputType, optional, readonly, export_, pascalCase, jsdoc]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 1500);
  }, [output]);

  const download = () => {
    const a = document.createElement("a");
    a.href = "data:text/typescript;charset=utf-8," + encodeURIComponent(output);
    a.download = "types.ts";
    a.click();
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">JSON Input</label>
        <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={6}
          className="w-full rounded-lg border border-surface-200 bg-white p-3 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div>
          <label className="block text-xs text-surface-500 dark:text-dark-muted mb-1">Output Style</label>
          <div className="flex gap-1 rounded-lg border border-surface-200 p-1 dark:border-dark-border">
            <button onClick={() => setOutputType("interface")} className={`px-3 py-1.5 text-sm rounded-md transition-colors ${outputType === "interface" ? "bg-brand-500 text-white" : "text-surface-600 hover:bg-surface-100 dark:text-dark-muted dark:hover:bg-dark-surface"}`}>Interface</button>
            <button onClick={() => setOutputType("type")} className={`px-3 py-1.5 text-sm rounded-md transition-colors ${outputType === "type" ? "bg-brand-500 text-white" : "text-surface-600 hover:bg-surface-100 dark:text-dark-muted dark:hover:bg-dark-surface"}`}>Type Alias</button>
          </div>
        </div>
        <div className="flex items-end gap-2 pb-1">
          <label className="flex items-center gap-1 text-xs text-surface-600 dark:text-dark-muted"><input type="checkbox" checked={optional} onChange={(e) => setOptional(e.target.checked)} className="accent-brand-500" /> Optional props</label>
          <label className="flex items-center gap-1 text-xs text-surface-600 dark:text-dark-muted"><input type="checkbox" checked={readonly} onChange={(e) => setReadonly(e.target.checked)} className="accent-brand-500" /> Readonly</label>
          <label className="flex items-center gap-1 text-xs text-surface-600 dark:text-dark-muted"><input type="checkbox" checked={export_} onChange={(e) => setExport_(e.target.checked)} className="accent-brand-500" /> Export</label>
          <label className="flex items-center gap-1 text-xs text-surface-600 dark:text-dark-muted"><input type="checkbox" checked={pascalCase} onChange={(e) => setPascalCase(e.target.checked)} className="accent-brand-500" /> PascalCase names</label>
          <label className="flex items-center gap-1 text-xs text-surface-600 dark:text-dark-muted"><input type="checkbox" checked={jsdoc} onChange={(e) => setJsdoc(e.target.checked)} className="accent-brand-500" /> JSDoc comments</label>
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex flex-wrap gap-1">
        <button onClick={handleCopy} disabled={!output} className="rounded bg-brand-500 px-2 py-1 text-xs text-white hover:bg-brand-600 disabled:opacity-40" aria-label="Copy TypeScript">{copied ? "Copied!" : "Copy"}</button>
        <button onClick={download} disabled={!output} className="rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 hover:bg-surface-50 disabled:opacity-40 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" aria-label="Download TypeScript">Download .ts</button>
      </div>

      {output && (
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Generated TypeScript</label>
          <pre className="rounded-lg border border-surface-200 bg-surface-50 p-3 text-sm font-mono text-surface-900 overflow-auto max-h-80 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">{output}</pre>
        </div>
      )}
    </div>
  );
}
