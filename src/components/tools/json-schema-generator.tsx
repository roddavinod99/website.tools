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

function detectSchema(value: unknown, draft: "07" | "2020-12", includeExamples: boolean, allRequired: boolean, addDescriptions: boolean): Record<string, unknown> {
  if (value === null) return { type: "null" };
  if (Array.isArray(value)) {
    if (value.length === 0) return { type: "array", items: {} };
    const itemSchemas = value.map((v) => JSON.stringify(detectSchema(v, draft, includeExamples, allRequired, addDescriptions)));
    const unique = [...new Set(itemSchemas)];
    const items = unique.length === 1 ? (JSON.parse(unique[0]!) as Record<string, unknown>) : {};
    const schema: Record<string, unknown> = { type: "array", items };
    if (includeExamples && value.length > 0) schema.examples = value.slice(0, 3);
    return schema;
  }
  if (typeof value === "string") {
    const schema: Record<string, unknown> = { type: "string" };
    const pattern = detectPattern(value);
    if (pattern === "email") schema.format = "email";
    else if (pattern === "uri") schema.format = "uri";
    else if (pattern === "uuid") schema.format = "uuid";
    else if (pattern === "date-time") schema.format = "date-time";
    if (addDescriptions) schema.description = `String value: ${value.slice(0, 80)}`;
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

    for (const key of keys) {
      const propSchema = detectSchema(obj[key], draft, includeExamples, allRequired, addDescriptions);
      if (addDescriptions && !propSchema.description) propSchema.description = `Property "${key}"`;
      if (includeExamples && (typeof obj[key] === "string" || typeof obj[key] === "number" || typeof obj[key] === "boolean")) {
        propSchema.examples = [obj[key]];
      }
      properties[key] = propSchema;
      if (allRequired || !(obj[key] === null || obj[key] === undefined)) {
        required.push(key);
      }
    }

    const schema: Record<string, unknown> = {
      type: "object",
      properties,
      additionalProperties: false,
    };
    if (required.length > 0) schema.required = required;
    return schema;
  }
  return {};
}

export function JsonSchemaGenerator() {
  const [input, setInput] = useState('{\n  "name": "John Doe",\n  "email": "john@example.com",\n  "age": 30,\n  "isActive": true,\n  "score": 95.5,\n  "tags": ["admin", "user"],\n  "createdAt": "2024-01-15T10:30:00Z"\n}');
  const [draft, setDraft] = useState<"07" | "2020-12">("07");
  const [includeExamples, setIncludeExamples] = useState(false);
  const [allRequired, setAllRequired] = useState(true);
  const [addDescriptions, setAddDescriptions] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  const [output, setOutput] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!input.trim()) { setOutput(""); setError(""); return; }
      try {
        const parsed = JSON.parse(input);
        const schema = detectSchema(parsed, draft, includeExamples, allRequired, addDescriptions);
        const schemaObj: Record<string, unknown> = {
          $schema: draft === "07" ? "http://json-schema.org/draft-07/schema#" : "https://json-schema.org/draft/2020-12/schema",
          ...schema,
        };
        setOutput(JSON.stringify(schemaObj, null, 2));
        setError("");
      } catch (e) {
        setError("Invalid JSON: " + (e as Error).message);
        setOutput("");
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [input, draft, includeExamples, allRequired, addDescriptions]);

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
        <div className="flex items-end gap-2 pb-1">
          <label className="flex items-center gap-1 text-xs text-surface-600 dark:text-dark-muted"><input type="checkbox" checked={allRequired} onChange={(e) => setAllRequired(e.target.checked)} className="accent-brand-500" /> Mark all required</label>
          <label className="flex items-center gap-1 text-xs text-surface-600 dark:text-dark-muted"><input type="checkbox" checked={includeExamples} onChange={(e) => setIncludeExamples(e.target.checked)} className="accent-brand-500" /> Include examples</label>
          <label className="flex items-center gap-1 text-xs text-surface-600 dark:text-dark-muted"><input type="checkbox" checked={addDescriptions} onChange={(e) => setAddDescriptions(e.target.checked)} className="accent-brand-500" /> Add descriptions</label>
        </div>
      </div>

      {output && (
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Generated JSON Schema</label>
          <div className="relative">
            <pre className="rounded-lg border border-surface-200 bg-surface-50 p-3 text-sm font-mono text-surface-900 overflow-auto max-h-80 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">{output}</pre>
            <div className="absolute top-2 right-2 flex gap-1">
              <button onClick={() => handleCopy(output, "schema")} className="rounded bg-brand-500 px-2 py-1 text-xs text-white hover:bg-brand-600" aria-label="Copy schema">{copied === "schema" ? "Copied!" : "Copy"}</button>
              <button onClick={download} className="rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" aria-label="Download schema">Download .json</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
