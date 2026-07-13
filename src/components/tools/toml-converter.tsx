"use client";

import { useState, useCallback, useEffect, useRef } from "react";

function tomlToJson(toml: string): string {
  const lines = toml.split("\n");
  const result: Record<string, unknown> = {};
  let currentSection = result;
  const arrayOfTables: Record<string, unknown[]> = {};

  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;

    const sectionMatch = line.match(/^\[{1,2}(.+?)\]{1,2}$/);
    if (sectionMatch) {
      const isArray = line.startsWith("[[");
      const path = sectionMatch[1]!.trim().split(".").map((p) => p.trim());

      if (isArray) {
        if (!arrayOfTables[path.join(".")]) arrayOfTables[path.join(".")] = [];
        const arr = arrayOfTables[path.join(".")]!;
        const newObj: Record<string, unknown> = {};
        arr.push(newObj);
        currentSection = newObj;

        let target = result;
        for (let i = 0; i < path.length - 1; i++) {
          const key = path[i]!;
          if (!target[key] || typeof target[key] !== "object") target[key] = {};
          target = target[key] as Record<string, unknown>;
        }
        const lastKey = path[path.length - 1]!;
        target[lastKey] = arr;
      } else {
        let target = result;
        for (let i = 0; i < path.length - 1; i++) {
          const key = path[i]!;
          if (!target[key] || typeof target[key] !== "object") target[key] = {};
          target = target[key] as Record<string, unknown>;
        }
        const lastKey = path[path.length - 1]!;
        if (!target[lastKey] || typeof target[lastKey] !== "object") {
          target[lastKey] = {};
        }
        currentSection = target[lastKey] as Record<string, unknown>;
      }
      continue;
    }

    const kvMatch = line.match(/^([a-zA-Z0-9_-]+)\s*=\s*(.+)$/);
    if (kvMatch && currentSection && typeof currentSection === "object" && !Array.isArray(currentSection)) {
      const key = kvMatch[1]!;
      let value: unknown = kvMatch[2]!;

      if (value === "true") value = true;
      else if (value === "false") value = false;
      else if (value === "inf") value = Infinity;
      else if (value === "-inf") value = -Infinity;
      else if (value === "nan") value = "NaN";
      else if (/^[+-]?\d+\.\d+$/.test(value as string)) value = parseFloat(value as string);
      else if (/^[+-]?\d+$/.test(value as string)) value = parseInt(value as string, 10);
      else if ((value as string).startsWith('"') && (value as string).endsWith('"')) value = (value as string).slice(1, -1);
      else if ((value as string).startsWith("[") && (value as string).endsWith("]")) {
        const items = (value as string).slice(1, -1).split(",").map((i) => {
          const v = i.trim();
          if (v === "true") return true;
          if (v === "false") return false;
          if (/^[+-]?\d+$/.test(v)) return parseInt(v, 10);
          if (/^[+-]?\d+\.\d+$/.test(v)) return parseFloat(v);
          if (v.startsWith('"') && v.endsWith('"')) return v.slice(1, -1);
          return v;
        });
        value = items;
      } else if (typeof value === "string") value = value;

      if ((currentSection as Record<string, unknown>)[key] !== undefined) {
        if (!Array.isArray((currentSection as Record<string, unknown>)[key])) {
          (currentSection as Record<string, unknown>)[key] = [(currentSection as Record<string, unknown>)[key]];
        }
        ((currentSection as Record<string, unknown>)[key] as unknown[]).push(value);
      } else {
        (currentSection as Record<string, unknown>)[key] = value;
      }
    }
  }

  return JSON.stringify(result, null, 2);
}

function jsonToToml(json: string, indent: number, sortKeys: boolean): string {
  const parsed = JSON.parse(json);
  const tomlLines: string[] = [];

  function serialize(value: unknown, prefix: string, path: string[] = []): void {
    if (value === null || value === undefined) return;

    if (typeof value === "object" && !Array.isArray(value)) {
      const obj = value as Record<string, unknown>;
      let keys = Object.keys(obj);
      if (sortKeys) keys = keys.sort();

      for (const key of keys) {
        const fullPath = [...path, key];
        const val = obj[key];

        if (typeof val === "object" && !Array.isArray(val) && val !== null) {
          const header = fullPath.join(".");
          if (prefix) {
            tomlLines.push(`[${header}]`);
          }
          serialize(val, prefix, fullPath);
        } else if (Array.isArray(val) && val.length > 0 && typeof val[0] === "object" && val[0] !== null) {
          for (const item of val as Record<string, unknown>[]) {
            const header = fullPath.join(".");
            tomlLines.push(`[[${header}]]`);
            serialize(item, prefix, fullPath);
          }
        } else {
          const k = key.includes(" ") || key.includes(".") ? JSON.stringify(key) : key;
          tomlLines.push(`${k} = ${formatTomlValue(val, indent)}`);
        }
      }
    } else if (Array.isArray(value) && value.length > 0 && typeof value[0] === "object") {
      for (const item of value as Record<string, unknown>[]) {
        const header = path.join(".");
        tomlLines.push(`[[${header}]]`);
        serialize(item, "", path);
      }
    }
  }

  function formatTomlValue(val: unknown, _indent: number): string {
    if (val === null) return '""';
    if (typeof val === "boolean") return val ? "true" : "false";
    if (typeof val === "number") return Number.isFinite(val) ? String(val) : `"${val}"`;
    if (typeof val === "string") {
      if (val.includes("\n")) return `"""\n${val}\n"""`;
      return JSON.stringify(val);
    }
    if (Array.isArray(val)) {
      const items = val.map((v) => formatTomlValue(v, _indent)).join(", ");
      return `[${items}]`;
    }
    return JSON.stringify(val);
  }

  serialize(parsed, "", Object.keys(parsed as Record<string, unknown>));

  return tomlLines.join("\n") + "\n";
}

export function TomlConverter() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"json-to-toml" | "toml-to-json">("json-to-toml");
  const [indent, setIndent] = useState(2);
  const [sortKeys, setSortKeys] = useState(false);
  const [formatResult, setFormatResult] = useState(true);
  const [validation, setValidation] = useState<{ valid: boolean; msg: string } | null>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (!input.trim()) { setOutput(""); setError(""); setValidation(null); return; }
      setError("");
      try {
        if (mode === "json-to-toml") {
          JSON.parse(input);
          const result = jsonToToml(input, indent, sortKeys);
          setOutput(result);
          setValidation({ valid: true, msg: "Valid JSON" });
        } else {
          const result = tomlToJson(input);
          const parsed = JSON.parse(result);
          setOutput(formatResult ? JSON.stringify(parsed, null, indent) : JSON.stringify(parsed));
          setValidation({ valid: true, msg: "Valid TOML" });
        }
      } catch (e) {
        setError((e as Error).message);
        setOutput("");
        setValidation({ valid: false, msg: "Invalid input" });
      }
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [input, mode, indent, sortKeys, formatResult]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [output]);

  const download = useCallback(() => {
    const ext = mode === "json-to-toml" ? "toml" : "json";
    const a = document.createElement("a");
    a.href = "data:text/plain;charset=utf-8," + encodeURIComponent(output);
    a.download = `converted.${ext}`;
    a.click();
  }, [output, mode]);

  const handleClear = useCallback(() => { setInput(""); setOutput(""); setError(""); setValidation(null); }, []);

  const inputLabel = mode === "json-to-toml" ? "JSON Input" : "TOML Input";
  const outputLabel = mode === "json-to-toml" ? "TOML Output" : "JSON Output";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 rounded-lg border border-surface-200 p-1 dark:border-dark-border">
          <button onClick={() => setMode("json-to-toml")} className={`px-3 py-1.5 text-sm rounded-md transition-colors ${mode === "json-to-toml" ? "bg-brand-500 text-white" : "text-surface-600 hover:bg-surface-100 dark:text-dark-muted dark:hover:bg-dark-surface"}`}>JSON → TOML</button>
          <button onClick={() => setMode("toml-to-json")} className={`px-3 py-1.5 text-sm rounded-md transition-colors ${mode === "toml-to-json" ? "bg-brand-500 text-white" : "text-surface-600 hover:bg-surface-100 dark:text-dark-muted dark:hover:bg-dark-surface"}`}>TOML → JSON</button>
        </div>
        <button onClick={handleClear} className="rounded-lg border border-surface-200 px-3 py-1.5 text-sm text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface">Clear</button>
      </div>

      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">{inputLabel}</label>
        <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={6}
          placeholder={mode === "json-to-toml" ? '{"key": "value"}' : "key = \"value\""}
          className="w-full rounded-lg border border-surface-200 bg-white p-3 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div>
          <label className="block text-xs text-surface-500 dark:text-dark-muted mb-1">Indent</label>
          <select value={indent} onChange={(e) => setIndent(Number(e.target.value))} className="rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value={2}>2 spaces</option><option value={4}>4 spaces</option><option value={8}>8 spaces</option>
          </select>
        </div>
        {mode === "json-to-toml" && (
          <label className="flex items-center gap-1 text-xs text-surface-600 dark:text-dark-muted pt-4">
            <input type="checkbox" checked={sortKeys} onChange={(e) => setSortKeys(e.target.checked)} className="accent-brand-500" />
            Sort keys
          </label>
        )}
        {mode === "toml-to-json" && (
          <label className="flex items-center gap-1 text-xs text-surface-600 dark:text-dark-muted pt-4">
            <input type="checkbox" checked={formatResult} onChange={(e) => setFormatResult(e.target.checked)} className="accent-brand-500" />
            Pretty-print
          </label>
        )}
      </div>

      {validation && (
        <span className={`text-xs ${validation.valid ? "text-green-600" : "text-red-500"}`}>{validation.msg}</span>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      {output && (
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">{outputLabel}</label>
          <div className="relative">
            <pre className="rounded-lg border border-surface-200 bg-surface-50 p-3 text-sm font-mono text-surface-900 overflow-auto max-h-60 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">{output}</pre>
            <div className="absolute top-2 right-2 flex gap-1">
              <button onClick={handleCopy} className="rounded bg-brand-500 px-2 py-1 text-xs text-white hover:bg-brand-600" aria-label="Copy output">{copied ? "Copied!" : "Copy"}</button>
              <button onClick={download} className="rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" aria-label="Download output">Download</button>
            </div>
          </div>
          <p className="text-xs text-surface-400 dark:text-dark-muted mt-1">
            {output.length} bytes
          </p>
        </div>
      )}

      {!input.trim() && (
        <p className="text-center text-sm text-surface-400 dark:text-dark-muted py-8">Enter input above to convert</p>
      )}
    </div>
  );
}
