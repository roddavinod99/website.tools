"use client";

import { useState, useCallback, useRef, useEffect } from "react";

type ElementCase = "preserve" | "camelCase" | "kebab-case" | "snake_case";
type IndentType = "2" | "4" | "tab";

function convertCase(str: string, caseType: ElementCase): string {
  switch (caseType) {
    case "camelCase": return str.replace(/[-_\s](.)/g, (_, c) => c.toUpperCase()).replace(/^(.)/, (c) => c.toLowerCase());
    case "kebab-case": return str.replace(/([A-Z])/g, "-$1").toLowerCase().replace(/[_]/g, "-").replace(/^-/, "");
    case "snake_case": return str.replace(/([A-Z])/g, "_$1").toLowerCase().replace(/[-]/g, "_").replace(/^_/, "");
    default: return str;
  }
}

function escapeXml(str: string, useCdata: boolean): string {
  if (useCdata && /[<>&'"]/.test(str)) return `<![CDATA[${str}]]>`;
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

interface ToXmlOpts {
  rootName: string;
  elementCase: ElementCase;
  indent: IndentType;
  includeDeclaration: boolean;
  useCdata: boolean;
  attrPrefix: "attr_" | "@";
}

function toXml(obj: unknown, name: string, opts: ToXmlOpts, depth: number): string {
  const indentStr = opts.indent === "tab" ? "\t" : " ".repeat(Number(opts.indent));
  const pad = indentStr.repeat(depth);
  const elName = convertCase(name, opts.elementCase);

  if (obj === null || obj === undefined) return `${pad}<${elName}/>`;
  if (typeof obj === "string" || typeof obj === "number" || typeof obj === "boolean") {
    return `${pad}<${elName}>${escapeXml(String(obj), opts.useCdata)}</${elName}>`;
  }
  if (Array.isArray(obj)) {
    if (obj.length === 0) return `${pad}<${elName}/>`;
    return obj.map((item) => toXml(item, name, opts, depth)).join("\n");
  }
  if (typeof obj === "object") {
    const entries = Object.entries(obj as Record<string, unknown>);
    const attrs: string[] = [];
    const children: [string, unknown][] = [];
    for (const [k, v] of entries) {
      const isAttr = k.startsWith(opts.attrPrefix) || (opts.attrPrefix === "@" && k.startsWith("@"));
      if (isAttr) {
        const attrName = k.replace(opts.attrPrefix, "");
        attrs.push(`${convertCase(attrName, opts.elementCase)}="${escapeXml(String(v ?? ""), false)}"`);
      } else {
        children.push([k, v]);
      }
    }
    if (children.length === 0) {
      return `${pad}<${elName}${attrs.length > 0 ? " " + attrs.join(" ") : ""}/>`;
    }
    const childXml = children.map(([k, v]) => toXml(v, k, opts, depth + 1)).join("\n");
    return `${pad}<${elName}${attrs.length > 0 ? " " + attrs.join(" ") : ""}>\n${childXml}\n${pad}</${elName}>`;
  }
  return `${pad}<${elName}>${escapeXml(String(obj), opts.useCdata)}</${elName}>`;
}

export function JsonToXml() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [rootName, setRootName] = useState("root");
  const [elementCase, setElementCase] = useState<ElementCase>("preserve");
  const [indent, setIndent] = useState<IndentType>("2");
  const [includeDeclaration, setIncludeDeclaration] = useState(true);
  const [useCdata, setUseCdata] = useState(false);
  const [attrPrefix, setAttrPrefix] = useState<"attr_" | "@">("@");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const convert = useCallback(() => {
    const opts: ToXmlOpts = { rootName, elementCase, indent, includeDeclaration, useCdata, attrPrefix };
    if (!input.trim()) { setOutput(""); setError(""); return; }
    try {
      const parsed = JSON.parse(input);
      let xml = "";
      if (includeDeclaration) xml += `<?xml version="1.0" encoding="UTF-8"?>\n`;
      xml += toXml(parsed, rootName || "root", opts, 0);
      setOutput(xml);
      setError("");
    } catch {
      setError("Invalid JSON");
      setOutput("");
    }
  }, [input, rootName, elementCase, indent, includeDeclaration, useCdata, attrPrefix]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(convert, 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [convert]);

  const copy = async () => { if (output) await navigator.clipboard.writeText(output); };
  const download = () => {
    if (!output) return;
    const blob = new Blob([output], { type: "application/xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "output.xml"; a.click();
    URL.revokeObjectURL(url);
  };
  const clear = () => { setInput(""); setOutput(""); setError(""); };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">JSON Input</label>
        <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder='{"key": "value"}' rows={6} spellCheck={false}
          className="w-full rounded-lg border border-surface-200 bg-white p-3 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted" />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-surface-500 dark:text-dark-muted">Root:</label>
          <input value={rootName} onChange={(e) => setRootName(e.target.value)} placeholder="root" className="w-24 rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
        </div>
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-surface-500 dark:text-dark-muted">Case:</label>
          <select value={elementCase} onChange={(e) => setElementCase(e.target.value as ElementCase)}
            className="rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value="preserve">Preserve</option>
            <option value="camelCase">camelCase</option>
            <option value="kebab-case">kebab-case</option>
            <option value="snake_case">snake_case</option>
          </select>
        </div>
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-surface-500 dark:text-dark-muted">Indent:</label>
          <select value={indent} onChange={(e) => setIndent(e.target.value as IndentType)}
            className="rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value="2">2 spaces</option>
            <option value="4">4 spaces</option>
            <option value="tab">Tab</option>
          </select>
        </div>
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-surface-500 dark:text-dark-muted">Attr prefix:</label>
          <select value={attrPrefix} onChange={(e) => setAttrPrefix(e.target.value as "attr_" | "@")}
            className="rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value="@">@</option>
            <option value="attr_">attr_</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-dark-muted cursor-pointer">
          <input type="checkbox" checked={includeDeclaration} onChange={(e) => setIncludeDeclaration(e.target.checked)} className="rounded border-surface-300" /> XML declaration
        </label>
        <label className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-dark-muted cursor-pointer">
          <input type="checkbox" checked={useCdata} onChange={(e) => setUseCdata(e.target.checked)} className="rounded border-surface-300" /> CDATA for special chars
        </label>
      </div>

      <div className="flex gap-2">
        <button onClick={copy} disabled={!output} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-40 transition-colors">Copy XML</button>
        <button onClick={download} disabled={!output} className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 disabled:opacity-40 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors">Download XML</button>
        <button onClick={clear} className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors">Clear</button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm font-medium text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {output && (
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">XML Output</label>
          <pre className="rounded-lg border border-surface-200 bg-surface-50 p-3 text-sm font-mono text-surface-900 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text overflow-auto max-h-60 whitespace-pre-wrap">{output}</pre>
        </div>
      )}
    </div>
  );
}
