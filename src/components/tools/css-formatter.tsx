"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Copy, Download, Trash2, RefreshCw, Minimize } from "lucide-react";

type Indent = "2" | "4" | "tab";
type OutputMode = "expanded" | "compact" | "compressed";
type VendorOrder = "keep" | "prepend-alpha";
type ColorFormat = "none" | "hex-to-named" | "rgb-to-hex" | "hex-to-rgb";

const INDENT_MAP: Record<Indent, string> = { "2": "  ", "4": "    ", tab: "\t" };

function propSortKey(p: string): string {
  const prefixed = /^(-\w+-)?(.+)/.exec(p);
  return prefixed ? `${prefixed[2] || p}` : p;
}

function formatBlock(rules: string[], indent: string, mode: OutputMode, sortProps: boolean, trailingSemi: boolean, colorFormat: ColorFormat): string[] {
  return rules.map((rule) => {
    const idx = rule.indexOf("{");
    if (idx === -1) return rule;
    const selector = rule.slice(0, idx).trim();
    const body = rule.slice(idx + 1, rule.lastIndexOf("}")).trim();
    if (!body) return mode === "compressed" ? "" : `${selector} {}`;
    let props = body.split(";").filter(Boolean).map((p) => p.trim());
    if (sortProps) props.sort((a, b) => propSortKey(a).localeCompare(propSortKey(b)));
    props = props.map((p) => {
      if (!trailingSemi && p.endsWith(";")) p = p.slice(0, -1).trim();
      if (colorFormat === "hex-to-named") p = p.replace(/#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g, hexToNamed);
      if (colorFormat === "rgb-to-hex") p = p.replace(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/g, (_, r, g, b) => rgbToHex(Number(r), Number(g), Number(b)));
      if (colorFormat === "hex-to-rgb") p = p.replace(/#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g, hexToRgb);
      return p;
    });
    if (mode === "compressed") return `${selector}{${props.join(";")}${trailingSemi ? ";" : ""}}`;
    if (mode === "compact") return `${selector} { ${props.join("; ")}${trailingSemi ? ";" : ""} }`;
    const bodyFormatted = props.map((p) => `${indent}${p}${trailingSemi ? ";" : ""}`).join("\n");
    return `${selector} {\n${bodyFormatted}\n}`;
  }).filter(Boolean);
}

const NAMED: Record<string, string> = {
  "f00": "red", "ff0": "yellow", "0f0": "lime", "0ff": "cyan", "00f": "blue", "f0f": "magenta", "fff": "white", "000": "black",
  "c0c0c0": "silver", "808080": "gray", "800000": "maroon", "808000": "olive", "008000": "green", "008080": "teal", "000080": "navy",
};

function hexToNamed(m: string): string {
  const h = m.replace("#", "").toLowerCase();
  const full = h.length === 3 ? h[0] + h[0] + h[1] + h[1] + h[2] + h[2] : h;
  return NAMED[full] ? NAMED[full] : m;
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function hexToRgb(m: string): string {
  const h = m.replace("#", "");
  const full = h.length === 3 ? h[0] + h[0] + h[1] + h[1] + h[2] + h[2] : h;
  const r = parseInt(full.slice(0, 2), 16), g = parseInt(full.slice(2, 4), 16), b = parseInt(full.slice(4, 6), 16);
  if (isNaN(r)) return m;
  return `rgb(${r}, ${g}, ${b})`;
}

export function CSSFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [errorLine, setErrorLine] = useState<number | null>(null);
  const [indentW, setIndentW] = useState<Indent>("2");
  const [outputMode, setOutputMode] = useState<OutputMode>("expanded");
  const [sortProps, setSortProps] = useState(true);
  const [sortSelectors, setSortSelectors] = useState(false);
  const [removeEmpty, setRemoveEmpty] = useState(true);
  const [removeDuplicates, setRemoveDuplicates] = useState(false);
  const [removeCmts, setRemoveCmts] = useState(true);
  const [trailingSemi, setTrailingSemi] = useState(true);
  const [vendorOrder, setVendorOrder] = useState<VendorOrder>("keep");
  const [colorFormat, setColorFormat] = useState<ColorFormat>("none");
  const timer = useRef<ReturnType<typeof setTimeout>>(null);

  const format = useCallback(() => {
    try {
      let css = input;
      if (removeCmts) css = css.replace(/\/\*[\s\S]*?\*\//g, "");
      css = css.replace(/@import\s+url\([^)]+\);/g, (m) => `\n${m}`);
      const isScss = /\$[\w-]+\s*:/.test(css) || /@(mixin|include|extend)/.test(css);
      const atRules: string[] = [];
      css = css.replace(/@[^{]+{[\s\S]*?(?=@|$)}/g, (m) => { atRules.push(m); return ""; });
      const imports: string[] = [];
      css = css.replace(/@import\s+[^;]+;/g, (m) => { imports.push(m.trim()); return ""; });

      const parts = css.split(/(?=[^{]*\{)/).filter(Boolean);
      let rules: string[] = [];
      for (let p of parts) {
        p = p.trim();
        if (!p || p === "}") continue;
        const braceIdx = p.indexOf("{");
        if (braceIdx === -1) continue;
        const sel = p.slice(0, braceIdx).trim();
        let body = p.slice(braceIdx + 1);
        const closeIdx = body.lastIndexOf("}");
        if (closeIdx !== -1) body = body.slice(0, closeIdx);
        body = body.replace(/\s+/g, " ").trim();
        if (removeEmpty && !body.replace(/\s/g, "")) continue;
        rules.push(`${sel} { ${body} }`);
      }

      if (removeDuplicates) {
        const seen = new Set<string>();
        rules = rules.filter((r) => {
          const key = r.slice(0, r.indexOf("{")).trim();
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      }

      if (sortSelectors) {
        rules.sort((a, b) => a.slice(0, a.indexOf("{")).trim().localeCompare(b.slice(0, b.indexOf("{")).trim()));
      }

      if (vendorOrder === "prepend-alpha") {
        rules = rules.map((r) => {
          const idx = r.indexOf("{");
          const sel = r.slice(0, idx);
          const body = r.slice(idx);
          const parts = sel.split(",").map((s) => s.trim());
          const hasVendor = parts.filter((p) => /^-(\w+)-/.test(p));
          const noVendor = parts.filter((p) => !/^-(\w+)-/.test(p));
          hasVendor.sort();
          noVendor.sort();
          return [...hasVendor, ...noVendor].join(", ") + body;
        });
      }

      const indent = INDENT_MAP[indentW];
      const formattedImports = imports.join("\n");
      const formattedAtRules = atRules.join("\n\n");
      const formatted = formatBlock(rules, indent, outputMode, sortProps, trailingSemi, colorFormat).join("\n\n");
      const result = [formattedImports, formattedAtRules, formatted].filter(Boolean).join("\n\n");

      if (isScss) {
        setOutput(result + "\n\n/* SCSS syntax detected — hints preserved */");
      } else {
        setOutput(result);
      }
      setError("");
      setErrorLine(null);
    } catch (e) {
      setError((e as Error).message);
      setErrorLine(null);
    }
  }, [input, indentW, outputMode, sortProps, sortSelectors, removeEmpty, removeDuplicates, removeCmts, trailingSemi, vendorOrder, colorFormat]);

  const minify = useCallback(() => {
    try {
      const css = input.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s*([{}:;,])\s*/g, "$1").replace(/;\}/g, "}").replace(/\s+/g, " ").replace(/\n/g, "").replace(/\t/g, "").trim();
      setOutput(css);
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  }, [input]);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => { if (input.trim()) format(); }, 400);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [input, format]);

  const copy = useCallback(async () => { if (output) await navigator.clipboard.writeText(output); }, [output]);
  const download = useCallback(() => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/css" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a");
    a.href = url; a.download = "formatted.css"; a.click(); URL.revokeObjectURL(url);
  }, [output]);
  const clear = useCallback(() => { setInput(""); setOutput(""); setError(""); setErrorLine(null); }, []);

  const inputChars = input.length;
  const saved = inputChars - (output ? output.length : 0);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">CSS Input</label>
        <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="body { color: red; font-size: 14px; }" rows={8} spellCheck={false}
          className="w-full rounded-lg border border-surface-200 bg-white p-3 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        <div>
          <label className="text-xs text-surface-500 dark:text-dark-muted block mb-0.5">Indent</label>
          <select value={indentW} onChange={(e) => setIndentW(e.target.value as Indent)}
            className="w-full rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value="2">2 spaces</option><option value="4">4 spaces</option><option value="tab">Tab</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-surface-500 dark:text-dark-muted block mb-0.5">Mode</label>
          <select value={outputMode} onChange={(e) => setOutputMode(e.target.value as OutputMode)}
            className="w-full rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value="expanded">Expanded</option><option value="compact">Compact</option><option value="compressed">Compressed</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-surface-500 dark:text-dark-muted block mb-0.5">Vendor prefix</label>
          <select value={vendorOrder} onChange={(e) => setVendorOrder(e.target.value as VendorOrder)}
            className="w-full rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value="keep">Keep order</option><option value="prepend-alpha">Alpha prepend</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-surface-500 dark:text-dark-muted block mb-0.5">Color format</label>
          <select value={colorFormat} onChange={(e) => setColorFormat(e.target.value as ColorFormat)}
            className="w-full rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value="none">Keep</option><option value="hex-to-named">#fff → white</option><option value="rgb-to-hex">rgb → hex</option><option value="hex-to-rgb">hex → rgb</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-surface-500 dark:text-dark-muted block mb-0.5">Trailing ;</label>
          <select value={trailingSemi ? "add" : "remove"} onChange={(e) => setTrailingSemi(e.target.value === "add")}
            className="w-full rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value="add">Add</option><option value="remove">Remove</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-dark-muted cursor-pointer">
          <input type="checkbox" checked={sortProps} onChange={(e) => setSortProps(e.target.checked)} className="rounded border-surface-300" /> Sort properties
        </label>
        <label className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-dark-muted cursor-pointer">
          <input type="checkbox" checked={sortSelectors} onChange={(e) => setSortSelectors(e.target.checked)} className="rounded border-surface-300" /> Sort selectors
        </label>
        <label className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-dark-muted cursor-pointer">
          <input type="checkbox" checked={removeEmpty} onChange={(e) => setRemoveEmpty(e.target.checked)} className="rounded border-surface-300" /> Remove empty rules
        </label>
        <label className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-dark-muted cursor-pointer">
          <input type="checkbox" checked={removeDuplicates} onChange={(e) => setRemoveDuplicates(e.target.checked)} className="rounded border-surface-300" /> Remove dup selectors
        </label>
        <label className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-dark-muted cursor-pointer">
          <input type="checkbox" checked={removeCmts} onChange={(e) => setRemoveCmts(e.target.checked)} className="rounded border-surface-300" /> Remove comments
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button onClick={format} className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors"><RefreshCw className="w-3.5 h-3.5" /> Format</button>
        <button onClick={minify} className="inline-flex items-center gap-1.5 rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors"><Minimize className="w-3.5 h-3.5" /> Minify</button>
        <button onClick={copy} disabled={!output} className="inline-flex items-center gap-1.5 rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 disabled:opacity-40 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors"><Copy className="w-3.5 h-3.5" /> Copy</button>
        <button onClick={download} disabled={!output} className="inline-flex items-center gap-1.5 rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 disabled:opacity-40 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors"><Download className="w-3.5 h-3.5" /> Download</button>
        <button onClick={clear} className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"><Trash2 className="w-3.5 h-3.5" /> Clear</button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          {errorLine !== null && <p className="text-xs text-red-500 mt-0.5">Error near line {errorLine}</p>}
        </div>
      )}

      {output && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-surface-700 dark:text-dark-text">Output</label>
            <span className="text-xs text-surface-400 dark:text-dark-muted">{saved > 0 ? `${saved}B saved` : `${Math.abs(saved)}B larger`}</span>
          </div>
          <pre className="w-full rounded-lg border border-surface-200 bg-surface-50 p-3 text-sm font-mono text-surface-900 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text overflow-auto max-h-80 whitespace-pre-wrap break-all">{output}</pre>
        </div>
      )}
    </div>
  );
}
