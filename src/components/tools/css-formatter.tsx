"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Copy, Download, Trash2, RefreshCw, Minimize, Upload } from "lucide-react";

type IndentType = "spaces" | "tabs";
type OutputMode = "expanded" | "compact" | "compressed";
type VendorOrder = "keep" | "prepend-alpha";
type ColorFormat = "none" | "hex-to-named" | "rgb-to-hex" | "hex-to-rgb";
type BracePlacement = "same-line" | "new-line";
type SelFormat = "each-line" | "compact";
type EmptyLines = "preserve" | "remove" | "condense";

function propSortKey(p: string): string {
  const prefixed = /^(-\w+-)?(.+)/.exec(p);
  return prefixed ? `${prefixed[2] || p}` : p;
}

function formatBlock(rules: string[], indent: string, mode: OutputMode, sortProps: boolean, trailingSemi: boolean, colorFormat: ColorFormat, bracePlacement: BracePlacement, selFormat: SelFormat): string[] {
  return rules.map((rule) => {
    const idx = rule.indexOf("{");
    if (idx === -1) return rule;
    let selector = rule.slice(0, idx).trim();
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
    if (selFormat === "each-line") {
      selector = selector.split(",").map((s) => s.trim()).join(",\n");
    }
    const braceOpen = bracePlacement === "same-line" ? " {" : "\n{";
    if (mode === "compressed") return `${selector}{${props.join(";")}${trailingSemi ? ";" : ""}}`;
    if (mode === "compact") return `${selector}${braceOpen} ${props.join("; ")}${trailingSemi ? ";" : ""} }`;
    const bodyFormatted = props.map((p) => `${indent}${p}${trailingSemi ? ";" : ""}`).join("\n");
    return `${selector}${braceOpen}\n${bodyFormatted}\n}`;
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

function validateCSS(css: string): string[] {
  const errors: string[] = [];
  const lines = css.split("\n");
  let braceDepth = 0;
  let parenDepth = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const c of line) {
      if (c === "{") braceDepth++;
      if (c === "}") braceDepth--;
      if (c === "(") parenDepth++;
      if (c === ")") parenDepth--;
    }
    if (braceDepth < 0) { errors.push(`Line ${i + 1}: Unbalanced closing brace`); braceDepth = 0; }
    if (parenDepth < 0) { errors.push(`Line ${i + 1}: Unbalanced closing parenthesis`); parenDepth = 0; }
  }
  if (braceDepth > 0) errors.push(`Unclosed brace at end of file (${braceDepth} open)`);
  if (parenDepth > 0) errors.push(`Unclosed parenthesis at end of file (${parenDepth} open)`);
  return errors;
}

export function CSSFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [errorLine, setErrorLine] = useState<number | null>(null);
  const [indentSize, setIndentSize] = useState<number>(2);
  const [indentType, setIndentType] = useState<IndentType>("spaces");
  const [outputMode, setOutputMode] = useState<OutputMode>("expanded");
  const [sortProps, setSortProps] = useState(true);
  const [sortSelectors, setSortSelectors] = useState(false);
  const [removeEmpty, setRemoveEmpty] = useState(true);
  const [removeDuplicates, setRemoveDuplicates] = useState(false);
  const [removeCmts, setRemoveCmts] = useState(true);
  const [trailingSemi, setTrailingSemi] = useState(true);
  const [vendorOrder, setVendorOrder] = useState<VendorOrder>("keep");
  const [colorFormat, setColorFormat] = useState<ColorFormat>("none");
  const [bracePlacement, setBracePlacement] = useState<BracePlacement>("same-line");
  const [selFormat, setSelFormat] = useState<SelFormat>("compact");
  const [emptyLines, setEmptyLines] = useState<EmptyLines>("remove");
  const timer = useRef<ReturnType<typeof setTimeout>>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const getIndent = useCallback(() => {
    return indentType === "tabs" ? "\t" : " ".repeat(indentSize);
  }, [indentSize, indentType]);

  const format = useCallback(() => {
    try {
      let css = input;
      if (removeCmts) css = css.replace(/\/\*[\s\S]*?\*\//g, "");
      css = css.replace(/@import\s+url\([^)]+\);/g, (m) => `\n${m}`);
      const isScss = /\$[\w-]+\s*:/.test(css) || /@(mixin|include|extend)/.test(css);

      if (emptyLines === "remove") {
        css = css.replace(/\n{3,}/g, "\n\n");
      } else if (emptyLines === "condense") {
        css = css.replace(/\n{3,}/g, "\n\n");
      }

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

      const indent = getIndent();
      const formattedImports = imports.join("\n");
      const formattedAtRules = atRules.join("\n\n");
      const formatted = formatBlock(rules, indent, outputMode, sortProps, trailingSemi, colorFormat, bracePlacement, selFormat).join("\n\n");
      const result = [formattedImports, formattedAtRules, formatted].filter(Boolean).join("\n\n");

      const valErrors = validateCSS(input);
      if (valErrors.length > 0) {
        setError(valErrors.join("; "));
        setErrorLine(null);
      } else {
        setError("");
        setErrorLine(null);
      }

      if (isScss) {
        setOutput(result + "\n\n/* SCSS syntax detected — hints preserved */");
      } else {
        setOutput(result);
      }
    } catch (e) {
      setError((e as Error).message);
      setErrorLine(null);
    }
  }, [input, getIndent, outputMode, sortProps, sortSelectors, removeEmpty, removeDuplicates, removeCmts, trailingSemi, vendorOrder, colorFormat, bracePlacement, selFormat, emptyLines]);

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

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setInput(reader.result as string);
    reader.readAsText(file);
  };

  const inputBytes = new TextEncoder().encode(input).length;
  const outputBytes = output ? new TextEncoder().encode(output).length : 0;
  const compressionRatio = inputBytes > 0 ? ((1 - outputBytes / inputBytes) * 100).toFixed(1) : "0.0";

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium text-surface-700 dark:text-dark-text">CSS Input</label>
          <button onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs border border-surface-200 text-surface-600 hover:bg-surface-50 dark:border-dark-border dark:text-dark-muted dark:hover:bg-dark-surface"><Upload className="w-3 h-3" /> Upload .css</button>
          <input ref={fileRef} type="file" accept=".css" onChange={handleFile} className="hidden" />
        </div>
        <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="body { color: red; font-size: 14px; }" rows={8} spellCheck={false}
          className="w-full rounded-lg border border-surface-200 bg-white p-3 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        <div>
          <label className="text-xs text-surface-500 dark:text-dark-muted block mb-0.5">Indent type</label>
          <select value={indentType} onChange={(e) => setIndentType(e.target.value as IndentType)}
            className="w-full rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value="spaces">Spaces</option><option value="tabs">Tabs</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-surface-500 dark:text-dark-muted block mb-0.5">Indent size</label>
          <select value={indentSize} onChange={(e) => setIndentSize(Number(e.target.value))}
            className="w-full rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value={2}>2</option><option value={4}>4</option>
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
          <label className="text-xs text-surface-500 dark:text-dark-muted block mb-0.5">Brace placement</label>
          <select value={bracePlacement} onChange={(e) => setBracePlacement(e.target.value as BracePlacement)}
            className="w-full rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value="same-line">Same line</option><option value="new-line">New line</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-surface-500 dark:text-dark-muted block mb-0.5">Selector format</label>
          <select value={selFormat} onChange={(e) => setSelFormat(e.target.value as SelFormat)}
            className="w-full rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value="compact">Compact</option><option value="each-line">Each on new line</option>
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
        <div>
          <label className="text-xs text-surface-500 dark:text-dark-muted block mb-0.5">Empty lines</label>
          <select value={emptyLines} onChange={(e) => setEmptyLines(e.target.value as EmptyLines)}
            className="w-full rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value="preserve">Preserve</option><option value="remove">Remove</option><option value="condense">Condense</option>
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
            <span className="text-xs text-surface-400 dark:text-dark-muted">
              {inputBytes.toLocaleString()}B → {outputBytes.toLocaleString()}B ({compressionRatio}% {parseFloat(compressionRatio) >= 0 ? "saved" : "larger"})
            </span>
          </div>
          <pre className="w-full rounded-lg border border-surface-200 bg-surface-50 p-3 text-sm font-mono text-surface-900 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text overflow-auto max-h-80 whitespace-pre-wrap break-all">{output}</pre>
        </div>
      )}
    </div>
  );
}
