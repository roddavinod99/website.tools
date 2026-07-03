"use client";

import { useState, useCallback, useEffect } from "react";

function toGoName(key: string): string {
  return key.replace(/[^a-zA-Z0-9_]/g, "_").replace(/^(\d)/, "_$1").replace(/^(.)/, (c) => c.toUpperCase());
}

function toTagKey(key: string, tagCase: "snake" | "camel"): string {
  if (tagCase === "snake") return key.replace(/[A-Z]/g, (c) => "_" + c.toLowerCase()).replace(/^_/, "");
  return key.replace(/^./, (c) => c.toLowerCase());
}

function detectGoType(value: unknown, structs: Map<string, string>, name: string, tagCase: "snake" | "camel", omitempty: boolean, inline: boolean): string {
  if (value === null) return "interface{}";
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]interface{}";
    const types = [...new Set(value.map((v) => detectGoType(v, structs, `${name}_Item`, tagCase, omitempty, inline)))];
    if (types.length === 1) return `[]${types[0]}`;
    return "[]interface{}";
  }
  if (typeof value === "string") return "string";
  if (typeof value === "number") return Number.isInteger(value) ? "int" : "float64";
  if (typeof value === "boolean") return "bool";
  if (typeof value === "object" && value !== null) {
    return generateGoStruct(value as Record<string, unknown>, structs, name, tagCase, omitempty, inline);
  }
  return "interface{}";
}

function generateGoStruct(obj: Record<string, unknown>, structs: Map<string, string>, name: string, tagCase: "snake" | "camel", omitempty: boolean, inline: boolean): string {
  if (!inline && structs.has(name)) return name;
  const keys = Object.keys(obj);
  const lines: string[] = [];
  lines.push(`type ${name} struct {`);

  for (const key of keys) {
    const val = obj[key];
    const fieldName = toGoName(key);
    const tagKey = toTagKey(key, tagCase);
    const oe = omitempty ? ",omitempty" : "";
    const goType = inline && typeof val === "object" && val !== null && !Array.isArray(val)
      ? generateGoStruct(val as Record<string, unknown>, structs, `${name}_${fieldName}`, tagCase, omitempty, false)
      : detectGoType(val, structs, `${name}_${fieldName}`, tagCase, omitempty, inline);
    if (inline && typeof val === "object" && val !== null && !Array.isArray(val)) {
      const innerKeys = Object.keys(val as Record<string, unknown>);
      for (const ik of innerKeys) {
        const iv = (val as Record<string, unknown>)[ik]!;
        const ifName = toGoName(ik);
        const itagKey = toTagKey(ik, tagCase);
        const iGoType = detectGoType(iv, structs, `${name}_${ifName}`, tagCase, omitempty, false);
        lines.push(`  ${ifName} ${iGoType} \`json:"${itagKey}${oe}"\``);
      }
    } else {
      lines.push(`  ${fieldName} ${goType} \`json:"${tagKey}${oe}"\``);
    }
  }

  lines.push("}");
  const result = lines.join("\n");
  if (!inline) structs.set(name, result);
  return inline ? result : name;
}

export function JsonToGo() {
  const [input, setInput] = useState('{\n  "name": "John",\n  "age": 30,\n  "isActive": true,\n  "address": {\n    "street": "123 Main St",\n    "city": "NYC"\n  },\n  "tags": ["admin", "user"]\n}');
  const [packageName, setPackageName] = useState("main");
  const [tagCase, setTagCase] = useState<"snake" | "camel">("snake");
  const [omitempty, setOmitempty] = useState(false);
  const [inline, setInline] = useState(true);
  const [rootName, setRootName] = useState("Root");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  const [output, setOutput] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!input.trim()) { setOutput(""); setError(""); return; }
      try {
        const parsed = JSON.parse(input);
        const structs = new Map<string, string>();
        const name = toGoName(rootName);
        if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
          generateGoStruct(parsed as Record<string, unknown>, structs, name, tagCase, omitempty, inline);
        } else {
          detectGoType(parsed, structs, name, tagCase, omitempty, inline);
        }
        const result = `package ${packageName}\n\n${Array.from(structs.values()).join("\n\n")}`;
        setOutput(result);
        setError("");
      } catch (e) {
        setError("Invalid JSON: " + (e as Error).message);
        setOutput("");
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [input, packageName, tagCase, omitempty, inline, rootName]);

  const handleCopy = useCallback(async (text: string, label: string) => {
    await navigator.clipboard.writeText(text); setCopied(label); setTimeout(() => setCopied(""), 1500);
  }, []);

  const download = () => {
    const a = document.createElement("a");
    a.href = "data:text/plain;charset=utf-8," + encodeURIComponent(output);
    a.download = `${packageName}.go`;
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
        <div><label className="block text-xs text-surface-500 dark:text-dark-muted mb-1">Package</label><input type="text" value={packageName} onChange={(e) => setPackageName(e.target.value)} className="w-24 rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" /></div>
        <div><label className="block text-xs text-surface-500 dark:text-dark-muted mb-1">Root Name</label><input type="text" value={rootName} onChange={(e) => setRootName(e.target.value)} className="w-24 rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" /></div>
        <div><label className="block text-xs text-surface-500 dark:text-dark-muted mb-1">Tags</label><select value={tagCase} onChange={(e) => setTagCase(e.target.value as "snake" | "camel")} className="rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm dark:border-dark-border dark:bg-dark-surface dark:text-dark-text"><option value="snake">snake_case</option><option value="camel">camelCase</option></select></div>
        <div className="flex items-end gap-2 pb-1">
          <label className="flex items-center gap-1 text-xs text-surface-600 dark:text-dark-muted"><input type="checkbox" checked={omitempty} onChange={(e) => setOmitempty(e.target.checked)} className="accent-brand-500" /> omitempty</label>
          <label className="flex items-center gap-1 text-xs text-surface-600 dark:text-dark-muted"><input type="checkbox" checked={inline} onChange={(e) => setInline(e.target.checked)} className="accent-brand-500" /> Inline</label>
        </div>
      </div>

      {output && (
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Generated Go Structs</label>
          <div className="relative">
            <pre className="rounded-lg border border-surface-200 bg-surface-50 p-3 text-sm font-mono text-surface-900 overflow-auto max-h-80 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">{output}</pre>
            <div className="absolute top-2 right-2 flex gap-1">
              <button onClick={() => handleCopy(output, "go")} className="rounded bg-brand-500 px-2 py-1 text-xs text-white hover:bg-brand-600">{copied === "go" ? "Copied!" : "Copy"}</button>
              <button onClick={download} className="rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">Download .go</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
