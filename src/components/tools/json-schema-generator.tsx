"use client";

import { useState, useCallback, useEffect } from "react";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const urlRegex = /^https?:\/\/.+/;
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const dateRegex = /^\d{4}-\d{2}-\d{2}T/;

function detectPattern(value: string): string | undefined {
  if (emailRegex.test(value)) return "email";
  if (urlRegex.test(value)) return "uri";
  if (uuidRegex.test(value)) return "uuid";
  if (dateRegex.test(value)) return "date-time";
  return undefined;
}

function detectSchema(value: unknown, draft: "07" | "2020-12"): Record<string, unknown> {
  if (value === null) return { type: "null" };
  if (Array.isArray(value)) {
    if (value.length === 0) return { type: "array", items: {} };
    const itemSchemas = value.map((v) => JSON.stringify(detectSchema(v, draft)));
    const unique = [...new Set(itemSchemas)];
    const items = unique.length === 1 ? (JSON.parse(unique[0]!) as Record<string, unknown>) : {};
    const minItems = value.length;
    return { type: "array", items, minItems };
  }
  if (typeof value === "string") {
    const schema: Record<string, unknown> = { type: "string" };
    const pattern = detectPattern(value);
    if (pattern === "email") schema.format = "email";
    else if (pattern === "uri") schema.format = "uri";
    else if (pattern === "uuid") schema.format = "uuid";
    else if (pattern === "date-time") schema.format = "date-time";
    return schema;
  }
  if (typeof value === "number") {
    if (Number.isInteger(value)) return { type: "integer" };
    return { type: "number" };
  }
  if (typeof value === "boolean") return { type: "boolean" };
  if (typeof value === "object" && value !== null) {
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj);
    const properties: Record<string, unknown> = {};
    const required: string[] = [];
    const enumVals = new Set<unknown>();

    for (const key of keys) {
      properties[key] = detectSchema(obj[key], draft);
      required.push(key);
      if (typeof obj[key] === "string" || typeof obj[key] === "number" || typeof obj[key] === "boolean") {
        enumVals.add(obj[key]);
      }
    }

    const schema: Record<string, unknown> = {
      type: "object",
      properties,
      required,
      additionalProperties: false,
    };

    if (enumVals.size > 0 && enumVals.size <= keys.length / 2) {
      schema.enum = Array.from(enumVals);
    }

    return schema;
  }
  return {};
}

export function JsonSchemaGenerator() {
  const [input, setInput] = useState('{\n  "name": "John Doe",\n  "email": "john@example.com",\n  "age": 30,\n  "isActive": true,\n  "score": 95.5,\n  "tags": ["admin", "user"],\n  "createdAt": "2024-01-15T10:30:00Z"\n}');
  const [draft, setDraft] = useState<"07" | "2020-12">("07");
  const [validation, setValidation] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  const [output, setOutput] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!input.trim()) { setOutput(""); setError(""); return; }
      try {
        const parsed = JSON.parse(input);
        const schema = detectSchema(parsed, draft);
        const schemaObj: Record<string, unknown> = {
          $schema: draft === "07" ? "http://json-schema.org/draft-07/schema#" : "https://json-schema.org/draft/2020-12/schema",
          ...schema,
        };
        if (validation) {
          try {
            const validate = (data: unknown, sch: Record<string, unknown>): string[] => {
              const errs: string[] = [];
              if (sch.type === "object" && sch.properties) {
                const props = sch.properties as Record<string, unknown>;
                if (typeof data !== "object" || data === null) { errs.push("expected object"); return errs; }
                const obj = data as Record<string, unknown>;
                for (const [k, s] of Object.entries(props)) {
                  if ((s as Record<string, unknown>).required !== false && !(k in obj)) {
                    errs.push(`missing required: ${k}`);
                  }
                  if (k in obj) {
                    const sub = (s as Record<string, unknown>);
                    if (sub.type === "object") errs.push(...validate(obj[k], sub));
                    else if (sub.type === "array" && Array.isArray(obj[k])) {
                      const item = sub.items as Record<string, unknown>;
                      for (const elem of obj[k] as unknown[]) errs.push(...validate(elem, item));
                    }
                  }
                }
              }
              return errs;
            };
            const errors = validate(parsed, schema);
            if (errors.length > 0) setError("Validation: " + errors.join(", "));
            else setError("");
          } catch { setError("Validation check failed"); }
        }
        setOutput(JSON.stringify(schemaObj, null, 2));
      } catch (e) {
        setError("Invalid JSON: " + (e as Error).message);
        setOutput("");
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [input, draft, validation]);

  const handleCopy = useCallback(async (text: string, label: string) => {
    await navigator.clipboard.writeText(text); setCopied(label); setTimeout(() => setCopied(""), 1500);
  }, []);

  const download = () => {
    const a = document.createElement("a");
    a.href = "data:text/json;charset=utf-8," + encodeURIComponent(output);
    a.download = "schema.json";
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

      <div className="flex flex-wrap items-center gap-3">
        <div><label className="block text-xs text-surface-500 dark:text-dark-muted mb-1">Draft</label><select value={draft} onChange={(e) => setDraft(e.target.value as "07" | "2020-12")} className="rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm dark:border-dark-border dark:bg-dark-surface dark:text-dark-text"><option value="07">Draft-07</option><option value="2020-12">Draft-2020-12</option></select></div>
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-1 text-xs text-surface-600 dark:text-dark-muted"><input type="checkbox" checked={validation} onChange={(e) => setValidation(e.target.checked)} className="accent-brand-500" /> Validate against schema</label>
        </div>
      </div>

      {output && (
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Generated JSON Schema</label>
          <div className="relative">
            <pre className="rounded-lg border border-surface-200 bg-surface-50 p-3 text-sm font-mono text-surface-900 overflow-auto max-h-80 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">{output}</pre>
            <div className="absolute top-2 right-2 flex gap-1">
              <button onClick={() => handleCopy(output, "schema")} className="rounded bg-brand-500 px-2 py-1 text-xs text-white hover:bg-brand-600">{copied === "schema" ? "Copied!" : "Copy"}</button>
              <button onClick={download} className="rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">Download .json</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
