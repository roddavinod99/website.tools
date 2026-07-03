"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Copy, RefreshCw, Minimize, ArrowLeftRight, Trash2 } from "lucide-react";

type Indent = "2" | "4" | "tab";
type QuoteStyle = "single" | "double" | "minimal";
type NullRep = "null" | "~" | "empty";
type BoolFormat = "truefalse" | "yesno" | "onoff";

const BOOL_VALUES: Record<string, string[]> = { truefalse: ["true", "false"], yesno: ["yes", "no"], onoff: ["on", "off"] };
const NULL_VALUES: Record<NullRep, string> = { null: "null", "~": "~", empty: "" };
const INDENT_MAP: Record<Indent, string> = { "2": "  ", "4": "    ", tab: "  " };

function toYaml(obj: unknown, indent: string, depth: number, quoteStyle: QuoteStyle, nullRep: NullRep, boolFormat: BoolFormat, lineWidth: number): string {
  const pad = indent.repeat(depth);
  const boolVals = BOOL_VALUES[boolFormat];

  if (obj === null || obj === undefined) {
    const nv = NULL_VALUES[nullRep];
    return nv === "" ? "''" : nv;
  }
  if (typeof obj === "boolean") return obj ? boolVals[0] : boolVals[1];
  if (typeof obj === "number") return String(obj);
  if (typeof obj === "string") {
    if (quoteStyle === "single") return `'${obj.replace(/'/g, "''")}'`;
    if (quoteStyle === "double") return `"${obj.replace(/"/g, '\\"').replace(/\n/g, "\\n")}"`;
    const needsQuote = /^[\s:\{\[\]#,&\*\?\|!%@`]|:\s|#\s|^[>\-]\s/.test(obj) || obj === "" || obj === "null" || obj === "true" || obj === "false" || obj === "~";
    if (needsQuote) return `"${obj.replace(/"/g, '\\"')}"`;
    if (lineWidth > 0 && obj.length > lineWidth) {
      const wrapped = obj.match(new RegExp(`.{1,${Math.max(10, lineWidth - depth * indent.length)}}`, "g")) || [obj];
      return ">\n" + wrapped.map((w) => pad + indent + w.trim()).join("\n");
    }
    return obj;
  }
  if (Array.isArray(obj)) {
    if (obj.length === 0) return "[]";
    return obj.map((item) => {
      const val = toYaml(item, indent, depth + 1, quoteStyle, nullRep, boolFormat, lineWidth);
      const prefix = `${pad}- `;
      if (val.includes("\n")) return prefix + val.split("\n").map((l, i) => i === 0 ? l : pad + "  " + l).join("\n");
      return prefix + val;
    }).join("\n");
  }
  if (typeof obj === "object") {
    const entries = Object.entries(obj as Record<string, unknown>);
    if (entries.length === 0) return "{}";
    return entries.map(([key, val]) => {
      const k = /[:\{\}\[\]#,]/.test(key) ? `"${key}"` : key;
      const v = toYaml(val, indent, depth + 1, quoteStyle, nullRep, boolFormat, lineWidth);
      if (v.includes("\n") || (typeof val === "object" && val !== null)) return `${pad}${k}:\n${v}`;
      return `${pad}${k}: ${v}`;
    }).join("\n");
  }
  return String(obj);
}

function parseYamlLine(line: string): [string, unknown] | null {
  const match = /^(\s*)([\w"'][^:]*?):\s*(.*)$/.exec(line);
  if (!match) return null;
  const key = match[2].replace(/^["']|["']$/g, "");
  let val: unknown = match[3].trim();
  if (val === "" || val === "null") val = null;
  else if (val === "~") val = null;
  else if (val === "true" || val === "yes" || val === "on") val = true;
  else if (val === "false" || val === "no" || val === "off") val = false;
  else if (/^-?\d+(\.\d+)?$/.test(val as string)) val = Number(val);
  else {
    const s = val as string;
    if ((s.startsWith("'") && s.endsWith("'")) || (s.startsWith('"') && s.endsWith('"'))) val = s.slice(1, -1);
  }
  return [key, val];
}

export function YAMLFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [jsonOutput, setJsonOutput] = useState("");
  const [error, setError] = useState("");
  const [errorLine, setErrorLine] = useState<number | null>(null);
  const [errorCol, setErrorCol] = useState<number | null>(null);
  const [indentW, setIndentW] = useState<Indent>("2");
  const [quoteStyle, setQuoteStyle] = useState<QuoteStyle>("minimal");
  const [lineWidth, setLineWidth] = useState(0);
  const [nullRep, setNullRep] = useState<NullRep>("null");
  const [boolFormat, setBoolFormat] = useState<BoolFormat>("truefalse");
  const [showJson, setShowJson] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(null);

  const convertYamlToJson = useCallback((yaml: string): string => {
    const lines = yaml.split("\n").filter((l) => l.trim() && !l.trim().startsWith("#"));
    if (lines.length === 0) throw new Error("Empty input");
    const stack: Array<Record<string, unknown> | unknown[]> = [{}];
    const keyStack: string[] = [];
    const depthStack: number[] = [0];

    for (const line of lines) {
      const indent = line.search(/\S/);
      const trimmed = line.trim();
      const isArrayItem = trimmed.startsWith("- ");
      const content = isArrayItem ? trimmed.slice(2).trim() : trimmed;

      while (indent < (depthStack[depthStack.length - 1] || 0)) {
        depthStack.pop(); keyStack.pop();
        if (!Array.isArray(stack[stack.length - 1])) stack.pop();
      }

      const parent = stack[stack.length - 1];
      if (isArrayItem) {
        const arr = Array.isArray(parent) ? parent : [];
        const parsed = parseYamlLine(`- key: ${content}`);
        arr.push(parsed && parsed[1] !== undefined ? parsed[1] : content || null);
        if (!Array.isArray(parent)) {
          const k = keyStack[keyStack.length - 1] || "items";
          (stack[stack.length - 2] as Record<string, unknown>)[k] = arr;
        }
        keyStack.push("" + arr.length);
      } else {
        const parsed = parseYamlLine(content);
        if (!parsed) continue;
        const [key, val] = parsed;
        const obj = parent as Record<string, unknown>;
        if (typeof val === "object" && val !== null && !Array.isArray(val)) {
          obj[key] = {};
          stack.push(obj[key] as Record<string, unknown>);
          keyStack.push(key);
          depthStack.push(indent);
        } else {
          obj[key] = val;
          keyStack.push(key);
          depthStack.push(indent);
        }
      }
    }
    return JSON.stringify(stack[0], null, 2);
  }, []);

  const format = useCallback(() => {
    try {
      let obj: unknown;
      let parsedAsYaml = false;
      try { obj = JSON.parse(input); } catch {
        obj = JSON.parse(convertYamlToJson(input));
        parsedAsYaml = true;
      }
      const indent = indentW === "tab" ? "  " : INDENT_MAP[indentW];
      const yaml = toYaml(obj, indent, 0, quoteStyle, nullRep, boolFormat, lineWidth);
      setOutput(yaml);
      setJsonOutput(parsedAsYaml ? input : JSON.stringify(obj, null, 2));
      setError("");
      setErrorLine(null); setErrorCol(null);
    } catch (e) {
      const msg = (e as Error).message;
      setError(msg);
      const lc = msg.match(/line\s+(\d+)/i) || msg.match(/position\s+(\d+)/);
      if (lc) {
        const pos = parseInt(lc[1], 10);
        const pre = input.slice(0, pos);
        setErrorLine(pre.split("\n").length);
        setErrorCol(pre.length - pre.lastIndexOf("\n"));
      }
      setOutput("");
    }
  }, [input, indentW, quoteStyle, lineWidth, nullRep, boolFormat, convertYamlToJson]);

  const toJson = useCallback(() => {
    try {
      let obj: unknown;
      try { obj = JSON.parse(input); } catch {
        obj = JSON.parse(convertYamlToJson(input));
      }
      const formatted = JSON.stringify(obj, null, 2);
      setOutput(formatted);
      setJsonOutput(formatted);
      setError("");
    } catch (e) {
      setError((e as Error).message);
      setOutput("");
    }
  }, [input, convertYamlToJson]);

  const minify = useCallback(() => {
    try {
      let obj: unknown;
      try { obj = JSON.parse(input); } catch {
        obj = JSON.parse(convertYamlToJson(input));
      }
      const compact = JSON.stringify(obj);
      setOutput(compact);
      setJsonOutput(compact);
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  }, [input, convertYamlToJson]);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => { if (input.trim()) format(); }, 400);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [input, format]);

  const copy = useCallback(async (text: string) => { if (text) await navigator.clipboard.writeText(text); }, []);
  const clear = useCallback(() => { setInput(""); setOutput(""); setJsonOutput(""); setError(""); setErrorLine(null); setErrorCol(null); }, []);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">YAML / JSON Input</label>
        <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="key: value&#10;nested:&#10;  foo: bar" rows={8} spellCheck={false}
          className="w-full rounded-lg border border-surface-200 bg-white p-3 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        <div>
          <label className="text-xs text-surface-500 dark:text-dark-muted block mb-0.5">Indent</label>
          <select value={indentW} onChange={(e) => setIndentW(e.target.value as Indent)}
            className="w-full rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value="2">2 spaces</option><option value="4">4 spaces</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-surface-500 dark:text-dark-muted block mb-0.5">Quote style</label>
          <select value={quoteStyle} onChange={(e) => setQuoteStyle(e.target.value as QuoteStyle)}
            className="w-full rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value="minimal">Minimal</option><option value="single">Single</option><option value="double">Double</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-surface-500 dark:text-dark-muted block mb-0.5">Null</label>
          <select value={nullRep} onChange={(e) => setNullRep(e.target.value as NullRep)}
            className="w-full rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value="null">null</option><option value="~">~</option><option value="empty">empty</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-surface-500 dark:text-dark-muted block mb-0.5">Boolean</label>
          <select value={boolFormat} onChange={(e) => setBoolFormat(e.target.value as BoolFormat)}
            className="w-full rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value="truefalse">true/false</option><option value="yesno">yes/no</option><option value="onoff">on/off</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-surface-500 dark:text-dark-muted block mb-0.5">Wrap at</label>
          <input type="number" min={0} max={200} value={lineWidth} onChange={(e) => setLineWidth(Number(e.target.value))}
            className="w-full rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" placeholder="0=off" />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button onClick={format} className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors"><RefreshCw className="w-3.5 h-3.5" /> To YAML</button>
        <button onClick={toJson} className="inline-flex items-center gap-1.5 rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors"><ArrowLeftRight className="w-3.5 h-3.5" /> To JSON</button>
        <button onClick={minify} className="inline-flex items-center gap-1.5 rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors"><Minimize className="w-3.5 h-3.5" /> Minify</button>
        <button onClick={() => copy(output)} disabled={!output} className="inline-flex items-center gap-1.5 rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 disabled:opacity-40 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors"><Copy className="w-3.5 h-3.5" /> Copy YAML</button>
        <button onClick={() => copy(jsonOutput)} disabled={!jsonOutput} className="inline-flex items-center gap-1.5 rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 disabled:opacity-40 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors"><Copy className="w-3.5 h-3.5" /> Copy JSON</button>
        <button onClick={clear} className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"><Trash2 className="w-3.5 h-3.5" /> Clear</button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          {errorLine !== null && <p className="text-xs text-red-500 mt-0.5">Line {errorLine}:{errorCol ?? 0}</p>}
        </div>
      )}

      {output && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-surface-700 dark:text-dark-text">YAML Output</label>
            <button onClick={() => setShowJson(!showJson)} className="text-xs text-brand-500 hover:text-brand-600">
              {showJson ? "Hide JSON" : "Show JSON"}
            </button>
          </div>
          <pre className="w-full rounded-lg border border-surface-200 bg-surface-50 p-3 text-sm font-mono text-surface-900 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text overflow-auto max-h-80 whitespace-pre-wrap break-all">{output}</pre>
          {showJson && jsonOutput && (
            <div className="mt-2">
              <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">JSON Equivalent</label>
              <pre className="w-full rounded-lg border border-surface-200 bg-surface-50 p-3 text-sm font-mono text-surface-900 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text overflow-auto max-h-60 whitespace-pre-wrap break-all">{jsonOutput}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
