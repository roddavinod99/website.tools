"use client";

import { useState, useCallback, useEffect } from "react";

function toTypeName(key: string): string {
  return key.replace(/[^a-zA-Z0-9_]/g, "_").replace(/^(\d)/, "_$1").replace(/^(.)/, (c) => c.toUpperCase());
}

function detectType(value: unknown, interfaces: Map<string, string>, name: string, useType: boolean, optional: boolean, readonly: boolean, jsdoc: boolean): string {
  if (value === null) return "null";
  if (Array.isArray(value)) {
    if (value.length === 0) return "any[]";
    const types = [...new Set(value.map((v) => detectType(v, interfaces, `${name}_Item`, useType, optional, readonly, jsdoc)))];
    if (types.length === 1) return `${types[0]}[]`;
    if (types.length > 1 && types.every((t) => t.startsWith("{"))) return `(${types.join(" | ")})[]`;
    if (types.length > 1) return `(${types.join(" | ")})[]`;
    return "any[]";
  }
  if (typeof value === "string") return "string";
  if (typeof value === "number") return Number.isInteger(value) ? "number" : "number";
  if (typeof value === "boolean") return "boolean";
  if (typeof value === "object" && value !== null) {
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj);
    if (keys.length === 0) return "Record<string, unknown>";
    return generateInterface(obj, interfaces, name, useType, optional, readonly, jsdoc);
  }
  return "unknown";
}

function generateInterface(obj: Record<string, unknown>, interfaces: Map<string, string>, name: string, useType: boolean, optional: boolean, readonly: boolean, jsdoc: boolean): string {
  if (interfaces.has(name)) return name;
  const keys = Object.keys(obj);
  const body: string[] = [];

  for (const key of keys) {
    const val = obj[key];
    const propName = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `"${key}"`;
    const opt = optional ? "?" : "";
    const ro = readonly ? "readonly " : "";
    const type = detectType(val, interfaces, `${name}_${toTypeName(key)}`, useType, optional, readonly, jsdoc);
    if (jsdoc) {
      const inferred = typeof val === "string" ? `/** ${val.slice(0, 60)} */` : typeof val === "number" ? "/** numeric value */" : typeof val === "boolean" ? "/** boolean flag */" : Array.isArray(val) ? "/** array */" : val !== null && typeof val === "object" ? "/** nested object */" : "";
      if (inferred) body.push(`  ${inferred}`);
    }
    body.push(`  ${ro}${propName}${opt}: ${type};`);
  }

  const decl = useType ? `type ${name} = {` : `interface ${name} {`;
  interfaces.set(name, [decl, ...body, "}"].join("\n"));
  return name;
}

export function JsonToTypeScript() {
  const [input, setInput] = useState('{\n  "name": "John",\n  "age": 30,\n  "isActive": true,\n  "address": {\n    "street": "123 Main St",\n    "city": "NYC"\n  },\n  "tags": ["admin", "user"]\n}');
  const [name, setName] = useState("Root");
  const [useType, setUseType] = useState(false);
  const [optional, setOptional] = useState(false);
  const [readonly, setReadonly] = useState(false);
  const [exportKw, setExportKw] = useState(true);
  const [jsdoc, setJsdoc] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  const [output, setOutput] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!input.trim()) { setOutput(""); setError(""); return; }
      try {
        const parsed = JSON.parse(input);
        const interfaces = new Map<string, string>();
        const typeName = toTypeName(name);
        if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
          generateInterface(parsed as Record<string, unknown>, interfaces, typeName, useType, optional, readonly, jsdoc);
        } else {
          detectType(parsed, interfaces, typeName, useType, optional, readonly, jsdoc);
        }
        const exp = exportKw ? "export " : "";
        const result = Array.from(interfaces.values()).map((iface) => `${exp}${iface}`).join("\n\n");
        setOutput(result);
        setError("");
      } catch (e) {
        setError("Invalid JSON: " + (e as Error).message);
        setOutput("");
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [input, name, useType, optional, readonly, exportKw, jsdoc]);

  const handleCopy = useCallback(async (text: string, label: string) => {
    await navigator.clipboard.writeText(text); setCopied(label); setTimeout(() => setCopied(""), 1500);
  }, []);

  const download = () => {
    const a = document.createElement("a");
    a.href = "data:text/typescript;charset=utf-8," + encodeURIComponent(output);
    a.download = `${toTypeName(name)}.ts`;
    a.click();
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">JSON Input</label>
        <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={6}
          className="w-full rounded-lg border border-surface-200 bg-white p-3 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex flex-wrap gap-3">
        <div><label className="block text-xs text-surface-500 dark:text-dark-muted mb-1">Name</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-28 rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" /></div>
        <div><label className="block text-xs text-surface-500 dark:text-dark-muted mb-1">Style</label><select value={useType ? "type" : "interface"} onChange={(e) => setUseType(e.target.value === "type")} className="rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm dark:border-dark-border dark:bg-dark-surface dark:text-dark-text"><option value="interface">Interface</option><option value="type">Type</option></select></div>
        <div className="flex items-end gap-2 pb-1">
          <label className="flex items-center gap-1 text-xs text-surface-600 dark:text-dark-muted"><input type="checkbox" checked={optional} onChange={(e) => setOptional(e.target.checked)} className="accent-brand-500" /> Optional (?:)</label>
          <label className="flex items-center gap-1 text-xs text-surface-600 dark:text-dark-muted"><input type="checkbox" checked={readonly} onChange={(e) => setReadonly(e.target.checked)} className="accent-brand-500" /> Readonly</label>
          <label className="flex items-center gap-1 text-xs text-surface-600 dark:text-dark-muted"><input type="checkbox" checked={exportKw} onChange={(e) => setExportKw(e.target.checked)} className="accent-brand-500" /> Export</label>
          <label className="flex items-center gap-1 text-xs text-surface-600 dark:text-dark-muted"><input type="checkbox" checked={jsdoc} onChange={(e) => setJsdoc(e.target.checked)} className="accent-brand-500" /> JSDoc</label>
        </div>
      </div>

      {output && (
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Generated TypeScript</label>
          <div className="relative">
            <pre className="rounded-lg border border-surface-200 bg-surface-50 p-3 text-sm font-mono text-surface-900 overflow-auto max-h-80 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">{output}</pre>
            <div className="absolute top-2 right-2 flex gap-1">
              <button onClick={() => handleCopy(output, "ts")} className="rounded bg-brand-500 px-2 py-1 text-xs text-white hover:bg-brand-600">{copied === "ts" ? "Copied!" : "Copy"}</button>
              <button onClick={download} className="rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">Download .ts</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
