"use client";

import { useState, useEffect, useCallback } from "react";

type Lang = "TypeScript" | "Go" | "Python" | "Java" | "Rust" | "C#";

function toPascalCase(str: string): string {
  const cleaned = str.replace(/[^a-zA-Z0-9]+/g, " ").trim();
  if (!cleaned) return "Field";
  return cleaned
    .split(/\s+/)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("")
    .replace(/^(\d)/, "_$1");
}

function toCamelCase(str: string): string {
  const p = toPascalCase(str);
  return p.charAt(0).toLowerCase() + p.slice(1);
}

function toSnakeCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .toLowerCase()
    .replace(/^_+|_+$/g, "")
    .replace(/^(\d)/, "_$1") || "field";
}

const SAMPLE_JSON = `{
  "id": 1,
  "name": "Jane Doe",
  "isActive": true,
  "score": 98.6,
  "tags": ["admin", "editor"],
  "address": {
    "street": "123 Main St",
    "city": "Springfield",
    "zip": "12345"
  },
  "projects": [
    { "title": "Alpha", "stars": 42 },
    { "title": "Beta", "stars": 7 }
  ]
}`;

type JsonValue = string | number | boolean | null | JsonValue[] | { [k: string]: JsonValue };

function generateTypeScript(value: JsonValue, rootName: string): string {
  const defined: string[] = [];
  const seen = new Set<string>();

  function tsType(v: JsonValue, key: string): string {
    if (v === null) return "null";
    if (Array.isArray(v)) {
      if (v.length === 0) return "unknown[]";
      const types = [...new Set(v.map((e) => tsType(e, key)))];
      return types.length === 1 ? `${types[0]}[]` : `(${types.join(" | ")})[]`;
    }
    if (typeof v === "string") return "string";
    if (typeof v === "number") return "number";
    if (typeof v === "boolean") return "boolean";
    if (typeof v === "object") {
      const name = toPascalCase(key);
      defineInterface(v as Record<string, JsonValue>, name);
      return name;
    }
    return "unknown";
  }

  function defineInterface(obj: Record<string, JsonValue>, name: string) {
    const safeName = toPascalCase(name);
    if (seen.has(safeName)) return;
    seen.add(safeName);
    // define nested first
    for (const [k, v] of Object.entries(obj)) {
      if (v !== null && typeof v === "object" && !Array.isArray(v)) {
        defineInterface(v as Record<string, JsonValue>, k);
      } else if (Array.isArray(v) && v.length > 0 && typeof v[0] === "object" && v[0] !== null && !Array.isArray(v[0])) {
        defineInterface(v[0] as Record<string, JsonValue>, k);
      }
    }
    const lines: string[] = [];
    lines.push(`export interface ${safeName} {`);
    for (const [k, v] of Object.entries(obj)) {
      const t = tsType(v, k);
      const optional = v === null ? "?" : "";
      // quote key if needed
      const keyStr = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k) ? k : `"${k}"`;
      lines.push(`  ${keyStr}${optional}: ${t};`);
    }
    lines.push(`}`);
    defined.push(lines.join("\n"));
  }

  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    defineInterface(value as Record<string, JsonValue>, rootName);
    return defined.join("\n\n");
  } else if (Array.isArray(value)) {
    if (value.length > 0 && typeof value[0] === "object" && value[0] !== null && !Array.isArray(value[0])) {
      defineInterface(value[0] as Record<string, JsonValue>, rootName + "Item");
      const itemName = toPascalCase(rootName + "Item");
      return defined.join("\n\n") + `\n\nexport type ${toPascalCase(rootName)} = ${itemName}[];`;
    }
    const t = tsType(value, rootName);
    return `export type ${toPascalCase(rootName)} = ${t};`;
  } else {
    return `export type ${toPascalCase(rootName)} = ${tsType(value, rootName)};`;
  }
}

function generateGo(value: JsonValue, rootName: string): string {
  const defined = new Set<string>();
  const lines: string[] = [];
  lines.push("package main");
  lines.push("");

  function goType(v: JsonValue, key: string): string {
    if (v === null) return "interface{}";
    if (Array.isArray(v)) {
      if (v.length === 0) return "[]interface{}";
      return `[]${goType(v[0]!, key)}`;
    }
    if (typeof v === "string") return "string";
    if (typeof v === "number") return Number.isInteger(v) ? "int" : "float64";
    if (typeof v === "boolean") return "bool";
    if (typeof v === "object") return toPascalCase(key);
    return "interface{}";
  }

  function defineStruct(obj: Record<string, JsonValue>, name: string) {
    const gName = toPascalCase(name);
    if (defined.has(gName)) return;
    defined.add(gName);
    for (const [k, v] of Object.entries(obj)) {
      if (v !== null && typeof v === "object" && !Array.isArray(v)) defineStruct(v as Record<string, JsonValue>, k);
      else if (Array.isArray(v) && v.length > 0 && typeof v[0] === "object" && v[0] !== null && !Array.isArray(v[0])) defineStruct(v[0] as Record<string, JsonValue>, k);
    }
    lines.push(`type ${gName} struct {`);
    for (const [k, v] of Object.entries(obj)) {
      const field = toPascalCase(k);
      const t = goType(v, k);
      lines.push(`\t${field} ${t} \`json:"${k}"\``);
    }
    lines.push("}");
    lines.push("");
  }

  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    defineStruct(value as Record<string, JsonValue>, rootName);
  } else {
    lines.push(`type ${toPascalCase(rootName)} ${goType(value, rootName)}`);
    lines.push("");
  }
  return lines.join("\n").trim();
}

function generatePython(value: JsonValue, rootName: string): string {
  const lines: string[] = [];
  lines.push("from dataclasses import dataclass");
  lines.push("from typing import List, Optional");
  lines.push("");

  const defined = new Set<string>();

  function pyType(v: JsonValue, key: string): string {
    if (v === null) return "Optional[str]";
    if (Array.isArray(v)) {
      if (v.length === 0) return "List[str]";
      const t = pyType(v[0]!, key);
      return `List[${t.replace("Optional[", "").replace("]", "")}]`;
    }
    if (typeof v === "string") return "str";
    if (typeof v === "number") return Number.isInteger(v) ? "int" : "float";
    if (typeof v === "boolean") return "bool";
    if (typeof v === "object") return toPascalCase(key);
    return "str";
  }

  function defineDataclass(obj: Record<string, JsonValue>, name: string) {
    const pName = toPascalCase(name);
    if (defined.has(pName)) return;
    defined.add(pName);
    for (const [k, v] of Object.entries(obj)) {
      if (v !== null && typeof v === "object" && !Array.isArray(v)) defineDataclass(v as Record<string, JsonValue>, k);
      else if (Array.isArray(v) && v.length > 0 && typeof v[0] === "object" && v[0] !== null && !Array.isArray(v[0])) defineDataclass(v[0] as Record<string, JsonValue>, k);
    }
    lines.push("@dataclass");
    lines.push(`class ${pName}:`);
    if (Object.keys(obj).length === 0) {
      lines.push("    pass");
    } else {
      for (const [k, v] of Object.entries(obj)) {
        const field = toSnakeCase(k);
        const t = pyType(v, k);
        lines.push(`    ${field}: ${t}`);
      }
    }
    lines.push("");
  }

  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    defineDataclass(value as Record<string, JsonValue>, rootName);
  } else {
    lines.push(`# Root type: ${pyType(value, rootName)}`);
  }
  return lines.join("\n").trim();
}

function generateJava(value: JsonValue, rootName: string): string {
  const lines: string[] = [];
  const defined = new Set<string>();

  function javaType(v: JsonValue, key: string): string {
    if (v === null) return "Object";
    if (Array.isArray(v)) {
      if (v.length === 0) return "List<Object>";
      return `List<${javaType(v[0]!, key).replace("List<", "").replace(">", "").replace("int", "Integer").replace("double", "Double").replace("boolean", "Boolean").replace("String", "String")}>`.replace("List<Integer>", "List<Integer>").replace("List<Double>", "List<Double>");
    }
    if (typeof v === "string") return "String";
    if (typeof v === "number") return Number.isInteger(v) ? "int" : "double";
    if (typeof v === "boolean") return "boolean";
    if (typeof v === "object") return toPascalCase(key);
    return "Object";
  }

  function javaBox(t: string): string {
    if (t === "int") return "Integer";
    if (t === "double") return "Double";
    if (t === "boolean") return "Boolean";
    if (t.startsWith("List<")) return t;
    return t;
  }

  function defineClass(obj: Record<string, JsonValue>, name: string) {
    const jName = toPascalCase(name);
    if (defined.has(jName)) return;
    defined.add(jName);
    for (const [k, v] of Object.entries(obj)) {
      if (v !== null && typeof v === "object" && !Array.isArray(v)) defineClass(v as Record<string, JsonValue>, k);
      else if (Array.isArray(v) && v.length > 0 && typeof v[0] === "object" && v[0] !== null && !Array.isArray(v[0])) defineClass(v[0] as Record<string, JsonValue>, k);
    }
    lines.push(`public class ${jName} {`);
    for (const [k, v] of Object.entries(obj)) {
      let t = javaType(v, k);
      // box primitive for List
      if (t.startsWith("List<")) {
        const inner = t.slice(5, -1);
        t = `List<${javaBox(inner)}>`;
      }
      const field = toCamelCase(k);
      lines.push(`    public ${t} ${field};`);
    }
    lines.push("}");
    lines.push("");
  }

  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    defineClass(value as Record<string, JsonValue>, rootName);
  } else {
    lines.push(`// Root type: ${javaType(value, rootName)}`);
  }
  return lines.join("\n").trim();
}

function generateRust(value: JsonValue, rootName: string): string {
  const lines: string[] = [];
  lines.push("use serde::{Deserialize, Serialize};");
  lines.push("");
  const defined = new Set<string>();

  function rustType(v: JsonValue, key: string): string {
    if (v === null) return "Option<String>";
    if (Array.isArray(v)) {
      if (v.length === 0) return "Vec<String>";
      return `Vec<${rustType(v[0]!, key).replace("Option<", "").replace(">", "")}>`.replace("Vec<String>", "Vec<String>");
    }
    if (typeof v === "string") return "String";
    if (typeof v === "number") return Number.isInteger(v) ? "i64" : "f64";
    if (typeof v === "boolean") return "bool";
    if (typeof v === "object") return toPascalCase(key);
    return "String";
  }

  function defineStruct(obj: Record<string, JsonValue>, name: string) {
    const rName = toPascalCase(name);
    if (defined.has(rName)) return;
    defined.add(rName);
    for (const [k, v] of Object.entries(obj)) {
      if (v !== null && typeof v === "object" && !Array.isArray(v)) defineStruct(v as Record<string, JsonValue>, k);
      else if (Array.isArray(v) && v.length > 0 && typeof v[0] === "object" && v[0] !== null && !Array.isArray(v[0])) defineStruct(v[0] as Record<string, JsonValue>, k);
    }
    lines.push("#[derive(Debug, Serialize, Deserialize)]");
    lines.push(`pub struct ${rName} {`);
    for (const [k, v] of Object.entries(obj)) {
      const field = toSnakeCase(k);
      const t = rustType(v, k);
      if (field !== k) {
        lines.push(`    #[serde(rename = "${k}")]`);
      }
      lines.push(`    pub ${field}: ${t},`);
    }
    lines.push("}");
    lines.push("");
  }

  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    defineStruct(value as Record<string, JsonValue>, rootName);
  } else {
    lines.push(`// Root type: ${rustType(value, rootName)}`);
  }
  return lines.join("\n").trim();
}

function generateCSharp(value: JsonValue, rootName: string): string {
  const lines: string[] = [];
  lines.push("using System.Collections.Generic;");
  lines.push("using System.Text.Json.Serialization;");
  lines.push("");
  const defined = new Set<string>();

  function csType(v: JsonValue, key: string): string {
    if (v === null) return "string?";
    if (Array.isArray(v)) {
      if (v.length === 0) return "List<object>";
      return `List<${csType(v[0]!, key).replace("?", "")}>`;
    }
    if (typeof v === "string") return "string";
    if (typeof v === "number") return Number.isInteger(v) ? "int" : "double";
    if (typeof v === "boolean") return "bool";
    if (typeof v === "object") return toPascalCase(key);
    return "object";
  }

  function defineClass(obj: Record<string, JsonValue>, name: string) {
    const cName = toPascalCase(name);
    if (defined.has(cName)) return;
    defined.add(cName);
    for (const [k, v] of Object.entries(obj)) {
      if (v !== null && typeof v === "object" && !Array.isArray(v)) defineClass(v as Record<string, JsonValue>, k);
      else if (Array.isArray(v) && v.length > 0 && typeof v[0] === "object" && v[0] !== null && !Array.isArray(v[0])) defineClass(v[0] as Record<string, JsonValue>, k);
    }
    lines.push(`public class ${cName}`);
    lines.push("{");
    for (const [k, v] of Object.entries(obj)) {
      const prop = toPascalCase(k);
      const t = csType(v, k);
      lines.push(`    [JsonPropertyName("${k}")]`);
      lines.push(`    public ${t} ${prop} { get; set; }`);
    }
    lines.push("}");
    lines.push("");
  }

  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    defineClass(value as Record<string, JsonValue>, rootName);
  } else {
    lines.push(`// Root type: ${csType(value, rootName)}`);
  }
  return lines.join("\n").trim();
}

function generateCode(json: string, lang: Lang, rootName: string): string {
  const parsed: JsonValue = JSON.parse(json);
  const safeRoot = toPascalCase(rootName) || "Root";
  switch (lang) {
    case "TypeScript":
      return generateTypeScript(parsed, safeRoot);
    case "Go":
      return generateGo(parsed, safeRoot);
    case "Python":
      return generatePython(parsed, safeRoot);
    case "Java":
      return generateJava(parsed, safeRoot);
    case "Rust":
      return generateRust(parsed, safeRoot);
    case "C#":
      return generateCSharp(parsed, safeRoot);
    default:
      return "";
  }
}

export function JsonToCode() {
  const [input, setInput] = useState(SAMPLE_JSON);
  const [lang, setLang] = useState<Lang>("TypeScript");
  const [rootName, setRootName] = useState("Root");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!input.trim()) {
        setOutput("");
        setError("");
        return;
      }
      try {
        const code = generateCode(input, lang, rootName || "Root");
        setOutput(code);
        setError("");
      } catch (e) {
        setError("Invalid JSON: " + (e as Error).message);
        setOutput("");
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [input, lang, rootName]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [output]);

  const download = () => {
    const ext: Record<Lang, string> = {
      TypeScript: "ts",
      Go: "go",
      Python: "py",
      Java: "java",
      Rust: "rs",
      "C#": "cs",
    };
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${toPascalCase(rootName) || "Root"}.${ext[lang]}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">JSON Input</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={10}
          spellCheck={false}
          placeholder='{"key": "value"}'
          aria-label="JSON input"
          className="w-full rounded-md border border-surface-200 bg-white p-3 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div>
          <label className="block text-xs text-surface-500 dark:text-dark-muted mb-1">Language</label>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as Lang)}
            aria-label="Select language"
            className="rounded-md border border-surface-200 bg-white px-3 py-2 text-sm text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text"
          >
            {(["TypeScript", "Go", "Python", "Java", "Rust", "C#"] as Lang[]).map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-surface-500 dark:text-dark-muted mb-1">Root name</label>
          <input
            value={rootName}
            onChange={(e) => setRootName(e.target.value)}
            aria-label="Root type name"
            placeholder="Root"
            className="rounded-md border border-surface-200 bg-white px-3 py-2 text-sm text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text w-32"
          />
        </div>
        <div className="flex items-end gap-2 pb-1">
          <button onClick={handleCopy} disabled={!output} aria-label="Copy code" className="rounded bg-brand-500 px-3 py-2 text-xs font-medium text-white hover:bg-brand-600 disabled:opacity-40">
            {copied ? "Copied!" : "Copy"}
          </button>
          <button onClick={download} disabled={!output} aria-label="Download code" className="rounded border border-surface-200 bg-white px-3 py-2 text-xs font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text disabled:opacity-40">
            Download
          </button>
          <button onClick={() => setInput(SAMPLE_JSON)} aria-label="Load example" className="rounded border border-surface-200 px-3 py-2 text-xs font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text">
            Example
          </button>
        </div>
      </div>

      {error && (
        <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {output && (
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Generated {lang} Code</label>
          <pre data-testid="tool-output" className="w-full rounded-md border border-surface-200 bg-surface-50 p-3 text-sm font-mono text-surface-900 overflow-auto max-h-96 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text whitespace-pre">
            {output}
          </pre>
        </div>
      )}

      <p className="text-[11px] text-surface-400 dark:text-dark-muted">Traverses JSON sample to infer types. Handles nested objects, arrays, nulls, and primitive unions. No dependencies — pure TypeScript.</p>
    </div>
  );
}
