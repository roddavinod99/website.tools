"use client";

import { useState, useCallback, useEffect } from "react";

function toGoName(str: string): string {
  return str.replace(/[_-]+/g, " ").replace(/\s+/g, " ").split(" ").map((s) => s[0]?.toUpperCase() + s.slice(1)).join("").replace(/[^a-zA-Z0-9]/g, "");
}

function generateGo(input: string, opts: { packageName: string; structName: string; jsonTags: boolean; includeOmitempty: boolean; inlineStructs: boolean; pointerTypes: boolean; sortKeys: boolean }): string {
  const parsed = JSON.parse(input);
  const lines: string[] = [];
  const defined = new Set<string>();

  lines.push(`package ${opts.packageName}`);
  lines.push("");

  function goType(value: unknown, key: string, parentStruct?: string): string {
    if (value === null) return "interface{}";
    if (Array.isArray(value)) {
      if (value.length === 0) return "[]interface{}";
      const itemType = goType(value[0], key + "Item", parentStruct);
      return `[]${itemType}`;
    }
    if (typeof value === "string") return "string";
    if (typeof value === "number") return Number.isInteger(value) ? "int" : "float64";
    if (typeof value === "boolean") return "bool";
    if (typeof value === "object" && value !== null) {
      if (opts.inlineStructs) {
        const structName = toGoName(key);
        return structName;
      }
      return toGoName(key);
    }
    return "interface{}";
  }

  function defineStruct(val: Record<string, unknown>, name: string): void {
    const goName = toGoName(name);
    if (defined.has(goName)) return;
    defined.add(goName);

    let entries = Object.entries(val);
    if (opts.sortKeys) entries = entries.sort(([a], [b]) => a.localeCompare(b));

    const fields: string[] = [];
    for (const [key, value] of entries) {
      const fieldName = toGoName(key);
      let fieldType: string;

      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        const structName = opts.inlineStructs ? toGoName(key) : name + toGoName(key);
        fieldType = structName;
        if (opts.inlineStructs) {
          defineStruct(value as Record<string, unknown>, structName);
        } else {
          defineStruct(value as Record<string, unknown>, structName);
        }
      } else if (Array.isArray(value) && value.length > 0 && typeof value[0] === "object" && value[0] !== null) {
        const elemName = opts.inlineStructs ? toGoName(key) : name + toGoName(key);
        fieldType = goType(value[0], key, elemName);
        if (typeof value[0] === "object" && value[0] !== null) {
          if (opts.inlineStructs) {
            defineStruct(value[0] as Record<string, unknown>, elemName);
          } else {
            defineStruct(value[0] as Record<string, unknown>, elemName);
          }
        }
      } else {
        fieldType = goType(value, key, goName);
      }

      if (opts.pointerTypes && (fieldType === "string" || fieldType === "int" || fieldType === "float64" || fieldType === "bool")) {
        if (fieldType === "int") fieldType = "*int";
        else if (fieldType === "float64") fieldType = "*float64";
        else if (fieldType === "bool") fieldType = "*bool";
        else fieldType = "*string";
      }

      if (opts.jsonTags) {
        const omitempty = opts.includeOmitempty ? ",omitempty" : "";
        fields.push(`\t${fieldName} ${fieldType} \`json:"${key}${omitempty}"\``);
      } else {
        fields.push(`\t${fieldName} ${fieldType}`);
      }
    }

    lines.push(`type ${goName} struct {`);
    if (fields.length > 0) lines.push(fields.join("\n"));
    lines.push("}");
    lines.push("");
  }

  if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
    defineStruct(parsed as Record<string, unknown>, opts.structName || "Root");
  } else {
    const rootType = goType(parsed, "Root");
    lines.push(`type Root ${rootType}`);
    lines.push("");
  }

  return lines.join("\n");
}

export function JsonToGo() {
  const [input, setInput] = useState('{\n  "name": "John Doe",\n  "age": 30,\n  "email": "john@example.com",\n  "isActive": true,\n  "address": {\n    "street": "123 Main St",\n    "city": "New York",\n    "zipCode": "10001"\n  },\n  "scores": [95, 87, 92]\n}');
  const [packageName, setPackageName] = useState("main");
  const [structName, setStructName] = useState("Root");
  const [jsonTags, setJsonTags] = useState(true);
  const [includeOmitempty, setIncludeOmitempty] = useState(false);
  const [inlineStructs, setInlineStructs] = useState(true);
  const [pointerTypes, setPointerTypes] = useState(false);
  const [sortKeys, setSortKeys] = useState(true);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!input.trim()) { setOutput(""); setError(""); return; }
      try {
        const result = generateGo(input, { packageName: packageName || "main", structName: structName || "Root", jsonTags, includeOmitempty, inlineStructs, pointerTypes, sortKeys });
        setOutput(result);
        setError("");
      } catch (e) {
        setError("Invalid JSON: " + (e as Error).message);
        setOutput("");
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [input, packageName, structName, jsonTags, includeOmitempty, inlineStructs, pointerTypes, sortKeys]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 1500);
  }, [output]);

  const download = () => {
    const a = document.createElement("a");
    a.href = "data:text/plain;charset=utf-8," + encodeURIComponent(output);
    a.download = "types.go";
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
        <div><label className="block text-xs text-surface-500 dark:text-dark-muted mb-1">Package</label><input value={packageName} onChange={(e) => setPackageName(e.target.value)} className="rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm w-24 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" /></div>
        <div><label className="block text-xs text-surface-500 dark:text-dark-muted mb-1">Struct Name</label><input value={structName} onChange={(e) => setStructName(e.target.value)} className="rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm w-24 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" /></div>
        <div className="flex items-end gap-2 pb-1">
          <label className="flex items-center gap-1 text-xs text-surface-600 dark:text-dark-muted"><input type="checkbox" checked={jsonTags} onChange={(e) => setJsonTags(e.target.checked)} className="accent-brand-500" /> JSON tags</label>
          {jsonTags && <label className="flex items-center gap-1 text-xs text-surface-600 dark:text-dark-muted"><input type="checkbox" checked={includeOmitempty} onChange={(e) => setIncludeOmitempty(e.target.checked)} className="accent-brand-500" /> omitempty</label>}
          <label className="flex items-center gap-1 text-xs text-surface-600 dark:text-dark-muted"><input type="checkbox" checked={inlineStructs} onChange={(e) => setInlineStructs(e.target.checked)} className="accent-brand-500" /> Inline structs</label>
          <label className="flex items-center gap-1 text-xs text-surface-600 dark:text-dark-muted"><input type="checkbox" checked={pointerTypes} onChange={(e) => setPointerTypes(e.target.checked)} className="accent-brand-500" /> Pointer types</label>
          <label className="flex items-center gap-1 text-xs text-surface-600 dark:text-dark-muted"><input type="checkbox" checked={sortKeys} onChange={(e) => setSortKeys(e.target.checked)} className="accent-brand-500" /> Sort fields</label>
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {output && (
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Generated Go Code</label>
          <div className="relative">
            <pre className="rounded-lg border border-surface-200 bg-surface-50 p-3 text-sm font-mono text-surface-900 overflow-auto max-h-80 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">{output}</pre>
            <div className="absolute top-2 right-2 flex gap-1">
              <button onClick={handleCopy} className="rounded bg-brand-500 px-2 py-1 text-xs text-white hover:bg-brand-600" aria-label="Copy Go code">{copied ? "Copied!" : "Copy"}</button>
              <button onClick={download} className="rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" aria-label="Download Go code">Download .go</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
