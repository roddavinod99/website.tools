"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Copy, Download, Trash2, Minimize, Maximize, Upload } from "lucide-react";
import { validateFileSize } from "@/lib/file-security";

type Indent = "2" | "4" | "tab";
type OutputCompat = "es5" | "es6";
type Semicolons = "add" | "remove" | "preserve";
type QuotePref = "single" | "double" | "preserve";
type Preset = "aggressive" | "safe" | "readable";

const INDENT_MAP: Record<Indent, string> = { "2": "  ", "4": "    ", tab: "\t" };
const RESERVED = new Set(["arguments", "async", "await", "break", "case", "catch", "class", "const", "continue", "debugger", "default", "delete", "do", "else", "enum", "export", "extends", "false", "finally", "for", "function", "if", "implements", "import", "in", "instanceof", "interface", "let", "new", "null", "of", "package", "private", "protected", "public", "return", "static", "super", "switch", "this", "throw", "true", "try", "typeof", "var", "void", "while", "with", "yield"]);

export function JSMinifier() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [errorLine, setErrorLine] = useState<number | null>(null);
  const [errorCol, setErrorCol] = useState<number | null>(null);
  const [indentW, setIndentW] = useState<Indent>("2");
  const [removeCmts, setRemoveCmts] = useState(true);
  const [removeConsole, setRemoveConsole] = useState(true);
  const [removeDebugger, setRemoveDebugger] = useState(true);
  const [preserveNames, setPreserveNames] = useState("");
  const [wrapLength, setWrapLength] = useState(0);
  const [outputCompat, setOutputCompat] = useState<OutputCompat>("es6");
  const [mode, setMode] = useState<"minify" | "beautify">("minify");
  const [semicolons, setSemicolons] = useState<Semicolons>("preserve");
  const [quotePref, setQuotePref] = useState<QuotePref>("preserve");
  const [preset, setPreset] = useState<Preset>("safe");
  const timer = useRef<ReturnType<typeof setTimeout>>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const minify = useCallback(() => {
    try {
      let code = input;

      if (preset === "aggressive") {
        setRemoveCmts(true);
        setRemoveConsole(true);
        setRemoveDebugger(true);
        setSemicolons("remove");
      } else if (preset === "readable") {
        setRemoveCmts(false);
        setRemoveConsole(false);
        setRemoveDebugger(false);
        setSemicolons("add");
        setWrapLength(80);
      } else {
        setSemicolons("preserve");
      }

      if (removeDebugger) code = code.replace(/\bdebugger\s*;/g, "");
      if (removeConsole) code = code.replace(/\bconsole\s*\.\s*\w+\s*\([^)]*\)\s*;?\s*/g, "");
      if (removeCmts) {
        let result = '';
        let inString = false;
        let stringChar = '';
        for (let ci = 0; ci < code.length; ci++) {
          const ch = code[ci];
          const next = code[ci + 1];
          if (inString) {
            result += ch;
            if (ch === '\\') { result += code[++ci]; continue; }
            if (ch === stringChar) inString = false;
            continue;
          }
          if (ch === '"' || ch === "'" || ch === '`') {
            inString = true;
            stringChar = ch;
            result += ch;
            continue;
          }
          if (ch === '/' && next === '/') {
            while (ci < code.length && code[ci] !== '\n') ci++;
            continue;
          }
          if (ch === '/' && next === '*') {
            ci += 2;
            while (ci < code.length - 1 && !(code[ci] === '*' && code[ci + 1] === '/')) ci++;
            ci++;
            continue;
          }
          result += ch;
        }
        code = result;
      }

      if (semicolons === "remove") {
        code = code.replace(/;\s*([\n\r}])/g, "$1");
      } else if (semicolons === "add") {
        code = code.replace(/(\w+)\s*\n/g, "$1;\n");
      }

      if (quotePref === "single") {
        code = code.replace(/"([^"\\]*(?:\\.[^"\\]*)*)"/g, (m, inner) => {
          if (inner.includes("'") && !inner.includes('"')) return m;
          return `'${inner.replace(/'/g, "\\'")}'`;
        });
      } else if (quotePref === "double") {
        code = code.replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, (m, inner) => {
          if (inner.includes('"') && !inner.includes("'")) return m;
          return `"${inner.replace(/"/g, '\\"')}"`;
        });
      }

      const nameShorten = outputCompat === "es6";
      const toPreserve = new Set(preserveNames.split(",").map((s) => s.trim()).filter(Boolean));
      if (nameShorten) {
        const varDecls = code.match(/(?:const|let|var)\s+(\w+)(?:\s*=\s*[^,;]+)?(?:\s*,\s*(\w+)(?:\s*=\s*[^,;]+)?)*/g) || [];
        const names = new Set<string>();
        for (const decl of varDecls) {
          const tokens = decl.replace(/(?:const|let|var)\s+/, "").split(/[,;=]/).map((s) => s.trim()).filter((s) => /^\w+$/.test(s));
          tokens.forEach((t) => names.add(t));
        }
        const filtered = [...names].filter((n) => !RESERVED.has(n) && !toPreserve.has(n) && n.length > 2);
        const shortNames = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$_".split("");
        let si = 0;
        for (const name of filtered) {
          const short = shortNames[si] || `_${si}`;
          const re = new RegExp(`\\b${name}\\b(?!\\s*=)`, "g");
          code = code.replace(re, short);
          si++;
          if (si >= shortNames.length) break;
        }
      }

      code = code
        .replace(/\s*([{}()\[\];,+\-*/%!<>=&|^~?:.])\s*/g, "$1")
        .replace(/\s+/g, " ")
        .replace(/\n/g, "")
        .replace(/\t/g, "")
        .trim();

      code = code.replace(/(\d)\s+(\d)/g, "$1 $2");
      code = code.replace(/(\w)(\s*)(\d)/g, "$1 $3");
      code = code.replace(/!important/g, "!important");

      if (outputCompat === "es5") {
        code = code.replace(/\bconst\b/g, "var").replace(/\blet\b/g, "var").replace(/=>/g, "function");
        code = code.replace(/`[^`]*`/g, (m) => m.replace(/\$\{/g, "{"));
      }

      setOutput(code);
      setError("");
      setErrorLine(null); setErrorCol(null);
    } catch (e) {
      setError((e as Error).message);
      setOutput("");
    }
  }, [input, removeCmts, removeConsole, removeDebugger, preserveNames, outputCompat, semicolons, quotePref, preset]);

  const beautify = useCallback(() => {
    try {
      let code = input;
      if (removeCmts) code = code.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
      const indent = INDENT_MAP[indentW];
      let depth = 0;
      const result = code
        .replace(/\s+/g, " ")
        .replace(/\s*([{}();])\s*/g, "$1")
        .replace(/([{])/g, "$1\n")
        .replace(/([};])/g, "$1\n")
        .split("\n")
        .map((line) => {
          const trimmed = line.trim();
          if (!trimmed) return "";
          if (/^[}\]]/.test(trimmed)) depth = Math.max(0, depth - 1);
          const prefix = indent.repeat(depth);
          if (/[{[]$/.test(trimmed)) depth++;
          if (wrapLength > 0 && trimmed.length > wrapLength) {
            const parts: string[] = [];
            let remaining = trimmed;
            while (remaining.length > wrapLength) {
              const idx = remaining.lastIndexOf(",", wrapLength);
              const breakAt = idx > 0 ? idx + 1 : wrapLength;
              parts.push(remaining.slice(0, breakAt));
              remaining = indent.repeat(depth + 1) + remaining.slice(breakAt).trim();
            }
            parts.push(remaining);
            return parts.join("\n");
          }
          return prefix + trimmed;
        })
        .filter(Boolean)
        .join("\n");
      setOutput(result);
      setError("");
      setErrorLine(null); setErrorCol(null);
    } catch (e) {
      setError((e as Error).message);
      setOutput("");
    }
  }, [input, indentW, removeCmts, wrapLength]);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (input.trim()) {
        if (mode === "minify") minify(); else beautify();
      }
    }, 400);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [input, mode, minify, beautify]);

  const copy = useCallback(async () => { if (output) await navigator.clipboard.writeText(output); }, [output]);
  const download = useCallback(() => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/javascript" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a");
    a.href = url; a.download = `script.${mode === "minify" ? "min." : ""}js`; a.click(); URL.revokeObjectURL(url);
  }, [output, mode]);
  const clear = useCallback(() => { setInput(""); setOutput(""); setError(""); setErrorLine(null); setErrorCol(null); }, []);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const sizeCheck = validateFileSize(file);
    if (!sizeCheck.valid) { setError(sizeCheck.error!); return; }
    const reader = new FileReader();
    reader.onload = () => setInput(reader.result as string);
    reader.readAsText(file);
  };

  const inputBytes = new TextEncoder().encode(input).length;
  const outputBytes = output ? new TextEncoder().encode(output).length : 0;
  const savedBytes = inputBytes - outputBytes;
  const savedPct = inputBytes > 0 ? ((savedBytes / inputBytes) * 100).toFixed(1) : "0.0";

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium text-surface-700 dark:text-dark-text">JavaScript Input</label>
          <button onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs border border-surface-200 text-surface-600 hover:bg-surface-50 dark:border-dark-border dark:text-dark-muted dark:hover:bg-dark-surface"><Upload className="w-3 h-3" /> Upload .js</button>
          <input ref={fileRef} type="file" accept=".js" onChange={handleFile} className="hidden" />
        </div>
        <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="function hello() { console.log('world'); }" rows={8} spellCheck={false}
          className="w-full rounded-lg border border-surface-200 bg-white p-3 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        <div>
          <label className="text-xs text-surface-500 dark:text-dark-muted block mb-0.5">Preset</label>
          <select value={preset} onChange={(e) => setPreset(e.target.value as Preset)}
            className="w-full rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value="safe">Safe</option><option value="aggressive">Aggressive</option><option value="readable">Readable</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-surface-500 dark:text-dark-muted block mb-0.5">Indent</label>
          <select value={indentW} onChange={(e) => setIndentW(e.target.value as Indent)}
            className="w-full rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value="2">2 spaces</option><option value="4">4 spaces</option><option value="tab">Tab</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-surface-500 dark:text-dark-muted block mb-0.5">Compat</label>
          <select value={outputCompat} onChange={(e) => setOutputCompat(e.target.value as OutputCompat)}
            className="w-full rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value="es6">ES6+</option><option value="es5">ES5</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-surface-500 dark:text-dark-muted block mb-0.5">Semicolons</label>
          <select value={semicolons} onChange={(e) => setSemicolons(e.target.value as Semicolons)}
            className="w-full rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value="preserve">Preserve</option><option value="add">Add</option><option value="remove">Remove</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-surface-500 dark:text-dark-muted block mb-0.5">Quotes</label>
          <select value={quotePref} onChange={(e) => setQuotePref(e.target.value as QuotePref)}
            className="w-full rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value="preserve">Preserve</option><option value="single">Single</option><option value="double">Double</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-surface-500 dark:text-dark-muted block mb-0.5">Wrap at</label>
          <input type="number" min={0} max={200} value={wrapLength} onChange={(e) => setWrapLength(Number(e.target.value))}
            className="w-full rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" placeholder="0=off" />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-dark-muted cursor-pointer">
          <input type="checkbox" checked={removeCmts} onChange={(e) => setRemoveCmts(e.target.checked)} className="rounded border-surface-300" /> Remove comments
        </label>
        <label className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-dark-muted cursor-pointer">
          <input type="checkbox" checked={removeConsole} onChange={(e) => setRemoveConsole(e.target.checked)} className="rounded border-surface-300" /> Remove console.log
        </label>
        <label className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-dark-muted cursor-pointer">
          <input type="checkbox" checked={removeDebugger} onChange={(e) => setRemoveDebugger(e.target.checked)} className="rounded border-surface-300" /> Remove debugger
        </label>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs text-surface-500 dark:text-dark-muted mr-1">Preserve names:</label>
        <input value={preserveNames} onChange={(e) => setPreserveNames(e.target.value)}
          className="flex-1 rounded border border-surface-200 bg-white px-2 py-1 text-xs font-mono text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" placeholder="myVar, myFunc" />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => { setMode("minify"); minify(); }} className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${mode === "minify" ? "bg-brand-500 text-white hover:bg-brand-600" : "border border-surface-200 text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface"}`}>
          <Minimize className="w-3.5 h-3.5" /> Minify
        </button>
        <button onClick={() => { setMode("beautify"); beautify(); }} className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${mode === "beautify" ? "bg-brand-500 text-white hover:bg-brand-600" : "border border-surface-200 text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface"}`}>
          <Maximize className="w-3.5 h-3.5" /> Beautify
        </button>
        <button onClick={copy} disabled={!output} className="inline-flex items-center gap-1.5 rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 disabled:opacity-40 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors"><Copy className="w-3.5 h-3.5" /> Copy</button>
        <button onClick={download} disabled={!output} className="inline-flex items-center gap-1.5 rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 disabled:opacity-40 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors"><Download className="w-3.5 h-3.5" /> Download</button>
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
            <label className="text-sm font-medium text-surface-700 dark:text-dark-text">Output</label>
            <span className="text-xs text-surface-400 dark:text-dark-muted">
              {inputBytes.toLocaleString()}B → {outputBytes.toLocaleString()}B ({savedPct}% saved)
            </span>
          </div>
          <pre className="w-full rounded-lg border border-surface-200 bg-surface-50 p-3 text-sm font-mono text-surface-900 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text overflow-auto max-h-80 whitespace-pre-wrap break-all">{output}</pre>
        </div>
      )}
    </div>
  );
}
