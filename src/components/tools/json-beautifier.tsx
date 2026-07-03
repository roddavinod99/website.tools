"use client";

import { useState, useCallback, useMemo } from "react";

const themes: Record<string, { bg: string; text: string; key: string; string: string; number: string; boolean: string; null: string; bracket: string }> = {
  default: { bg: "bg-surface-50 dark:bg-dark-bg", text: "text-surface-900 dark:text-dark-text", key: "text-blue-600", string: "text-green-600", number: "text-orange-500", boolean: "text-purple-600", null: "text-gray-400", bracket: "text-surface-600" },
  monokai: { bg: "bg-[#272822]", text: "text-[#F8F8F2]", key: "text-[#66D9EF]", string: "text-[#E6DB74]", number: "text-[#AE81FF]", boolean: "text-[#A6E22E]", null: "text-[#75715E]", bracket: "text-[#F8F8F2]" },
  github: { bg: "bg-[#F6F8FA] dark:bg-[#0D1117]", text: "text-[#24292F] dark:text-[#C9D1D9]", key: "text-[#0550AE] dark:text-[#79C0FF]", string: "text-[#0A3069] dark:text-[#A5D6FF]", number: "text-[#0550AE] dark:text-[#79C0FF]", boolean: "text-[#CF222E] dark:text-[#FF7B72]", null: "text-[#6E7681]", bracket: "text-[#24292F] dark:text-[#C9D1D9]" },
  "solarized-dark": { bg: "bg-[#002B36]", text: "text-[#839496]", key: "text-[#268BD2]", string: "text-[#2AA198]", number: "text-[#D33682]", boolean: "text-[#B58900]", null: "text-[#586E75]", bracket: "text-[#93A1A1]" },
  "solarized-light": { bg: "bg-[#FDF6E3]", text: "text-[#586E75]", key: "text-[#268BD2]", string: "text-[#2AA198]", number: "text-[#D33682]", boolean: "text-[#B58900]", null: "text-[#93A1A1]", bracket: "text-[#657B83]" },
};

function highlightJson(json: string, theme: typeof themes[string]): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /("(?:\\.|[^"\\])*"|true|false|null|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|[{}[\],:]|\s+)/g;
  let match: RegExpExecArray | null;
  let idx = 0;
  while ((match = regex.exec(json)) !== null) {
    const token = match[1];
    if (token === undefined) continue;
    if (/^\s+$/.test(token)) { parts.push(<span key={idx++}>{token}</span>); continue; }
    let color = theme.text;
    if (token.startsWith('"')) {
      const isKey = json[regex.lastIndex] === ":" || json[regex.lastIndex] === " " && json[regex.lastIndex + 1] === ":";
      color = isKey ? theme.key : theme.string;
    } else if (token === "true" || token === "false") color = theme.boolean;
    else if (token === "null") color = theme.null;
    else if (/^-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?$/.test(token)) color = theme.number;
    else color = theme.bracket;
    parts.push(<span key={idx++} className={color}>{token}</span>);
  }
  return parts;
}

function sortKeysDeep(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(sortKeysDeep);
  if (obj !== null && typeof obj === "object") {
    const sorted: Record<string, unknown> = {};
    for (const k of Object.keys(obj as Record<string, unknown>).sort()) sorted[k] = sortKeysDeep((obj as Record<string, unknown>)[k]);
    return sorted;
  }
  return obj;
}

function toJsObjectLiteral(json: string, indent: number | string): string {
  const indentStr = indent === "tab" ? "\t" : " ".repeat(Number(indent));
  let js = JSON.stringify(JSON.parse(json), null, indentStr);
  js = js.replace(/"([^"]+)":/g, "$1:");
  js = js.replace(/"(?![^:]*:)((?:\\.|[^"\\])*)"/g, (_m: string, inner: string) => {
    if (/^-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?$/.test(inner)) return inner;
    if (inner === "true" || inner === "false" || inner === "null") return inner;
    return `"${inner}"`;
  });
  js = "const data = " + js + ";";
  return js;
}

function toJsonp(json: string, callback: string, indent: number | string): string {
  const formatted = JSON.stringify(JSON.parse(json), null, indent === "tab" ? "\t" : Number(indent));
  return `${callback}(${formatted});`;
}

export function JSONBeautifier() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [indent, setIndent] = useState<number | string>(2);
  const [themeName, setThemeName] = useState("default");
  const [sortKeys, setSortKeys] = useState(false);
  const [bracketPadding, setBracketPadding] = useState(false);
  const [quoteStyle, setQuoteStyle] = useState<"double" | "single">("double");
  const [trailingComma, setTrailingComma] = useState<"none" | "add" | "remove">("none");
  const [outputFormat, setOutputFormat] = useState<"formatted" | "object-literal" | "jsonp">("formatted");
  const [jsonpCallback, setJsonpCallback] = useState("callback");
  const [showDiff, setShowDiff] = useState(false);

  const beautify = useCallback(() => {
    try {
      let parsed = JSON.parse(input);
      if (sortKeys) parsed = sortKeysDeep(parsed);
      const indentStr = indent === "tab" ? "\t" : Number(indent);
      let formatted = JSON.stringify(parsed, null, indentStr);

      if (outputFormat === "object-literal") {
        setOutput(toJsObjectLiteral(formatted, indent));
        setError("");
        return;
      }
      if (outputFormat === "jsonp") {
        setOutput(toJsonp(formatted, jsonpCallback, indent));
        setError("");
        return;
      }

      if (bracketPadding) {
        formatted = formatted.replace(/\{/g, "{ ").replace(/\}/g, " }").replace(/\[/g, "[ ").replace(/\]/g, " ]");
      }
      if (quoteStyle === "single") {
        formatted = formatted.replace(/"((?:\\.|[^"\\])*)"/g, (_m: string, inner: string) => `'${inner.replace(/'/g, "\\'")}'`);
      }
      if (trailingComma === "add") {
        formatted = formatted.replace(/\}(\s*)$/gm, "},$1").replace(/\](\s*)$/gm, "],$1");
        formatted = formatted.replace(/,(?=\s*[}\]])/g, "");
        formatted = formatted.replace(/^[}\]]\s*$/gm, (m) => m);
      }
      if (trailingComma === "remove") {
        formatted = formatted.replace(/,(\s*[}\]])/g, "$1");
      }
      setOutput(formatted);
      setError("");
    } catch (e) {
      setError((e as Error).message);
      setOutput("");
    }
  }, [input, indent, sortKeys, bracketPadding, quoteStyle, trailingComma, outputFormat, jsonpCallback]);

  const copy = useCallback(async () => { if (output) await navigator.clipboard.writeText(output); }, [output]);
  const download = useCallback(() => {
    if (!output) return;
    const blob = new Blob([output], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "beautified.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [output]);
  const print = useCallback(() => {
    if (!output) return;
    const w = window.open("", "", "width=800,height=600");
    if (w) { w.document.write(`<pre style="font-family:monospace;font-size:13px;">${output.replace(/</g, "&lt;")}</pre>`); w.print(); }
  }, [output]);

  const theme = themes[themeName] || themes.default;
  const highlighted = useMemo(() => output ? highlightJson(output, theme) : [], [output, theme]);

  const formattedOrigin = useMemo(() => {
    if (!input) return "";
    try { return JSON.stringify(JSON.parse(input), null, 2); } catch { return ""; }
  }, [input]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Input JSON</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='{"key": "value"}'
          rows={6}
          spellCheck={false}
          className="w-full rounded-lg border border-surface-200 bg-white p-3 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button onClick={beautify} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors">Beautify</button>
        <button onClick={copy} disabled={!output} className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 disabled:opacity-40 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors">Copy</button>
        <button onClick={download} disabled={!output} className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 disabled:opacity-40 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors">Download</button>
        <button onClick={print} disabled={!output} className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 disabled:opacity-40 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors">Print</button>
        <button onClick={() => setShowDiff(!showDiff)} disabled={!input || !output} className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-40 ${showDiff ? "bg-brand-50 border-brand-300 text-brand-700 dark:bg-brand-900/20 dark:border-brand-700 dark:text-brand-400" : "border-surface-200 text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface"}`}>
          {showDiff ? "Hide Diff" : "Show Diff"}
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div>
          <label className="text-xs text-surface-500 dark:text-dark-muted block mb-0.5">Theme</label>
          <select value={themeName} onChange={(e) => setThemeName(e.target.value)}
            className="w-full rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            {Object.keys(themes).map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-surface-500 dark:text-dark-muted block mb-0.5">Indent</label>
          <select value={String(indent)} onChange={(e) => setIndent(e.target.value === "tab" ? "tab" : Number(e.target.value))}
            className="w-full rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value="2">2 spaces</option>
            <option value="4">4 spaces</option>
            <option value="8">8 spaces</option>
            <option value="tab">Tab</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-surface-500 dark:text-dark-muted block mb-0.5">Output format</label>
          <select value={outputFormat} onChange={(e) => setOutputFormat(e.target.value as typeof outputFormat)}
            className="w-full rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value="formatted">Formatted JSON</option>
            <option value="object-literal">JS Object</option>
            <option value="jsonp">JSONP</option>
          </select>
        </div>
        {outputFormat === "jsonp" && (
          <div>
            <label className="text-xs text-surface-500 dark:text-dark-muted block mb-0.5">Callback</label>
            <input value={jsonpCallback} onChange={(e) => setJsonpCallback(e.target.value)}
              className="w-full rounded border border-surface-200 bg-white px-2 py-1 text-xs font-mono text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
          </div>
        )}
        <div>
          <label className="text-xs text-surface-500 dark:text-dark-muted block mb-0.5">Quote style</label>
          <select value={quoteStyle} onChange={(e) => setQuoteStyle(e.target.value as typeof quoteStyle)}
            className="w-full rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value="double">Double</option>
            <option value="single">Single</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-surface-500 dark:text-dark-muted block mb-0.5">Trailing comma</label>
          <select value={trailingComma} onChange={(e) => setTrailingComma(e.target.value as typeof trailingComma)}
            className="w-full rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value="none">None</option>
            <option value="add">Add</option>
            <option value="remove">Remove</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-dark-muted cursor-pointer">
          <input type="checkbox" checked={sortKeys} onChange={(e) => setSortKeys(e.target.checked)} className="rounded border-surface-300" /> Sort keys
        </label>
        <label className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-dark-muted cursor-pointer">
          <input type="checkbox" checked={bracketPadding} onChange={(e) => setBracketPadding(e.target.checked)} className="rounded border-surface-300" /> Bracket padding
        </label>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {showDiff && formattedOrigin && output && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">Original (formatted)</p>
            <pre className={`rounded-lg border border-surface-200 p-3 text-xs font-mono overflow-auto max-h-64 ${theme.bg} ${theme.text}`}>
              {highlightJson(formattedOrigin, theme)}
            </pre>
          </div>
          <div>
            <p className="text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">Beautified</p>
            <pre className={`rounded-lg border border-surface-200 p-3 text-xs font-mono overflow-auto max-h-64 ${theme.bg} ${theme.text}`}>
              {highlighted}
            </pre>
          </div>
        </div>
      )}

      {!showDiff && output && (
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Beautified Output</label>
          <pre className={`w-full rounded-lg border border-surface-200 p-3 text-sm font-mono overflow-auto max-h-96 ${theme.bg} ${theme.text}`}>
            {highlighted}
          </pre>
        </div>
      )}
    </div>
  );
}
