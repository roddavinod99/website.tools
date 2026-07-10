"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Copy, Download, Trash2, RefreshCw, Minimize, ShieldCheck, Upload } from "lucide-react";

type IndentType = "spaces" | "tabs";
type SelfClose = "preserve" | "always-slash" | "never-slash";
type AttrOrder = "preserve" | "sorted";
type QuoteStyle = "double" | "single";

interface FormatError extends Error {
  line: number | null;
  col: number | null;
}

function formatXmlNode(xml: string, indent: string, selfClose: SelfClose, attrOrder: AttrOrder, quoteStyle: QuoteStyle): string {
  let result = xml;
  if (selfClose === "always-slash") result = result.replace(/<(\w[^>]*)>/g, (m, content) => {
    if (m.startsWith("</") || m.startsWith("<!--") || m.startsWith("<?")) return m;
    return `<${content} />`;
  });
  if (selfClose === "never-slash") result = result.replace(/\s*\/>/g, ">");
  if (attrOrder === "sorted") {
    result = result.replace(/(<[^/!?][^>]*?)(\s+[^>]*?)(\/?>)/g, (_m, open, attrs, close) => {
      const attrList = attrs.trim().split(/\s+/).sort((a: string, b: string) => a.localeCompare(b));
      return open + (attrList.length ? " " + attrList.join(" ") : "") + close;
    });
  }
  if (quoteStyle === "single") {
    result = result.replace(/([a-zA-Z][\w.-]*\s*=\s*)"([^"]*)"/g, "$1'$2'");
  }
  return result;
}

export function XMLFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [errorLine, setErrorLine] = useState<number | null>(null);
  const [errorCol, setErrorCol] = useState<number | null>(null);
  const [indentSize, setIndentSize] = useState<number>(2);
  const [indentType, setIndentType] = useState<IndentType>("spaces");
  const [removeCmts, setRemoveCmts] = useState(false);
  const [removeWS, setRemoveWS] = useState(false);
  const [selfClose, setSelfClose] = useState<SelfClose>("preserve");
  const [attrOrder, setAttrOrder] = useState<AttrOrder>("preserve");
  const [quoteStyle, setQuoteStyle] = useState<QuoteStyle>("double");
  const [addDecl, setAddDecl] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout>>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const getIndent = useCallback(() => {
    return indentType === "tabs" ? "\t".repeat(indentSize / 2) : " ".repeat(indentSize);
  }, [indentSize, indentType]);

  const process = useCallback((xmlStr: string): string => {
    let xml = xmlStr;
    if (removeCmts) xml = xml.replace(/<!--[\s\S]*?-->/g, "");
    if (removeWS) xml = xml.replace(/>\s+<([^/!])/g, "><$1");

    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, "text/xml");
    const parseErrors = doc.querySelectorAll("parsererror");
    if (parseErrors.length > 0) {
      const errText = parseErrors[0].textContent?.trim() || "Invalid XML";
      const lineM = errText.match(/line\s+(\d+)/i);
      const colM = errText.match(/column\s+(\d+)/i);
      const err = new Error(errText) as FormatError;
      err.line = lineM ? parseInt(lineM[1], 10) : null;
      err.col = colM ? parseInt(colM[1], 10) : null;
      throw err;
    }

    let serialized = new XMLSerializer().serializeToString(doc);
    serialized = serialized.replace(/>\s+</g, "><");

    const indent = getIndent();
    let depth = 0;
    const formatted = serialized
      .replace(/(<\/?[^>]+>)/g, (m) => {
        const isClosing = m.startsWith("</");
        if (isClosing) depth = Math.max(0, depth - 1);
        const spaces = indent.repeat(depth);
        if (!isClosing && !m.endsWith("/>") && !m.startsWith("<?") && !m.startsWith("<!--")) depth++;
        return "\n" + spaces + m;
      })
      .trim();

    const processed = formatXmlNode(formatted, indent, selfClose, attrOrder, quoteStyle);

    if (addDecl && !processed.startsWith("<?xml")) {
      return '<?xml version="1.0" encoding="UTF-8"?>\n' + processed;
    }
    if (!addDecl) {
      return processed.replace(/^<\?xml[^>]*>\n?/, "");
    }
    return processed;
  }, [getIndent, removeCmts, removeWS, selfClose, attrOrder, quoteStyle, addDecl]);

  const format = useCallback(() => {
    try {
      const result = process(input);
      setOutput(result);
      setError("");
      setErrorLine(null);
      setErrorCol(null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Formatting failed";
      setError(msg);
      setErrorLine(e instanceof Error ? (e as FormatError).line ?? null : null);
      setErrorCol(e instanceof Error ? (e as FormatError).col ?? null : null);
      setOutput("");
    }
  }, [input, process]);

  const minify = useCallback(() => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(input, "text/xml");
      const parseErrors = doc.querySelectorAll("parsererror");
      if (parseErrors.length > 0) {
        const errText = parseErrors[0].textContent?.trim() || "Invalid XML";
        const lineM = errText.match(/line\s+(\d+)/i);
        const colM = errText.match(/column\s+(\d+)/i);
        setError(errText);
        setErrorLine(lineM ? parseInt(lineM[1], 10) : null);
        setErrorCol(colM ? parseInt(colM[1], 10) : null);
        setOutput("");
        return;
      }
      let result = new XMLSerializer().serializeToString(doc)
        .replace(/>\s+</g, "><")
        .replace(/\n/g, "")
        .replace(/\t/g, "")
        .replace(/\s{2,}/g, " ")
        .trim();
      if (!addDecl && result.startsWith("<?xml")) result = result.replace(/^<\?xml[^>]*?>/, "").trim();
      setOutput(result);
      setError("");
      setErrorLine(null);
      setErrorCol(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Minification failed");
      setOutput("");
    }
  }, [input, addDecl]);

  const validate = useCallback(() => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(input, "text/xml");
      const parseErrors = doc.querySelectorAll("parsererror");
      if (parseErrors.length > 0) {
        const msg = parseErrors[0].textContent?.trim() || "Invalid XML";
        setError(msg);
        setOutput("");
        const lineM = msg.match(/line\s+(\d+)/i);
        const colM = msg.match(/column\s+(\d+)/i);
        setErrorLine(lineM ? parseInt(lineM[1], 10) : null);
        setErrorCol(colM ? parseInt(colM[1], 10) : null);
      } else {
        setError("");
        setErrorLine(null);
        setErrorCol(null);
        setOutput("XML is well-formed and valid.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Validation failed");
      setOutput("");
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
    const blob = new Blob([output], { type: "application/xml" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a");
    a.href = url; a.download = "formatted.xml"; a.click(); URL.revokeObjectURL(url);
  }, [output]);
  const clear = useCallback(() => { setInput(""); setOutput(""); setError(""); setErrorLine(null); setErrorCol(null); }, []);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setInput(reader.result as string);
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium text-surface-700 dark:text-dark-text">XML Input</label>
          <button onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs border border-surface-200 text-surface-600 hover:bg-surface-50 dark:border-dark-border dark:text-dark-muted dark:hover:bg-dark-surface"><Upload className="w-3 h-3" /> Upload .xml</button>
          <input ref={fileRef} type="file" accept=".xml" onChange={handleFile} className="hidden" />
        </div>
        <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="<root><item>value</item></root>" rows={8} spellCheck={false}
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
            <option value={2}>2</option><option value={4}>4</option><option value={8}>8</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-surface-500 dark:text-dark-muted block mb-0.5">Self-closing</label>
          <select value={selfClose} onChange={(e) => setSelfClose(e.target.value as SelfClose)}
            className="w-full rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value="preserve">Preserve</option><option value="always-slash">Always /&gt;</option><option value="never-slash">Never /&gt;</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-surface-500 dark:text-dark-muted block mb-0.5">Attributes</label>
          <select value={attrOrder} onChange={(e) => setAttrOrder(e.target.value as AttrOrder)}
            className="w-full rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value="preserve">Preserve</option><option value="sorted">Sort A-Z</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-surface-500 dark:text-dark-muted block mb-0.5">Quotes</label>
          <select value={quoteStyle} onChange={(e) => setQuoteStyle(e.target.value as QuoteStyle)}
            className="w-full rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value="double">Double</option><option value="single">Single</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-dark-muted cursor-pointer">
          <input type="checkbox" checked={addDecl} onChange={(e) => setAddDecl(e.target.checked)} className="rounded border-surface-300" /> XML declaration
        </label>
        <label className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-dark-muted cursor-pointer">
          <input type="checkbox" checked={removeCmts} onChange={(e) => setRemoveCmts(e.target.checked)} className="rounded border-surface-300" /> Remove comments
        </label>
        <label className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-dark-muted cursor-pointer">
          <input type="checkbox" checked={removeWS} onChange={(e) => setRemoveWS(e.target.checked)} className="rounded border-surface-300" /> Remove whitespace nodes
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button onClick={format} className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors"><RefreshCw className="w-3.5 h-3.5" /> Format</button>
        <button onClick={minify} className="inline-flex items-center gap-1.5 rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors"><Minimize className="w-3.5 h-3.5" /> Minify</button>
        <button onClick={validate} className="inline-flex items-center gap-1.5 rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors"><ShieldCheck className="w-3.5 h-3.5" /> Validate</button>
        <button onClick={copy} disabled={!output} className="inline-flex items-center gap-1.5 rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 disabled:opacity-40 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors"><Copy className="w-3.5 h-3.5" /> Copy</button>
        <button onClick={download} disabled={!output} className="inline-flex items-center gap-1.5 rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 disabled:opacity-40 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors"><Download className="w-3.5 h-3.5" /> Download</button>
        <button onClick={clear} className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"><Trash2 className="w-3.5 h-3.5" /> Clear</button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          {errorLine !== null && (
            <p className="text-xs text-red-500 mt-0.5">Line {errorLine}{errorCol !== null ? `, Column ${errorCol}` : ""}</p>
          )}
        </div>
      )}

      {output && (
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Output</label>
          <pre className="w-full rounded-lg border border-surface-200 bg-surface-50 p-3 text-sm font-mono text-surface-900 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text overflow-auto max-h-80 whitespace-pre-wrap break-all">{output}</pre>
        </div>
      )}
    </div>
  );
}
