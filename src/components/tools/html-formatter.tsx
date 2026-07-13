"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Copy, Download, Trash2, RefreshCw, Minimize, ShieldCheck, Upload } from "lucide-react";
import { validateFileSize } from "@/lib/file-security";

type IndentType = "spaces" | "tabs";
type SelfClose = "html" | "xhtml";
type QuoteStyle = "double" | "single";

const VOID_TAGS = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr", "command", "keygen", "menuitem"]);
const INLINE_TAGS = new Set(["a", "abbr", "b", "bdi", "bdo", "br", "cite", "code", "data", "dfn", "em", "i", "kbd", "mark", "q", "rp", "rt", "ruby", "s", "samp", "small", "span", "strong", "sub", "sup", "time", "u", "var", "wbr"]);

function formatAttrs(attrs: string, sortAttrs: boolean, quoteStyle: QuoteStyle): string {
  const attrRe = /([^\s=]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s>]*)))?/g;
  const matches: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = attrRe.exec(attrs)) !== null) {
    const name = m[1]; const val = m[2] ?? m[3] ?? m[4] ?? "";
    const q = quoteStyle === "double" ? `"` : `'`;
    const escaped = val.replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    matches.push(val ? `${name}=${q}${escaped}${q}` : name);
  }
  if (sortAttrs) matches.sort((a, b) => a.localeCompare(b));
  return matches.length ? " " + matches.join(" ") : "";
}

function formatTag(tag: string, sortAttrs: boolean, selfClose: SelfClose, quoteStyle: QuoteStyle): string {
  const sClose = selfClose === "xhtml" ? " /" : "";
  if (tag.startsWith("</")) return tag;
  if (tag.startsWith("<!--")) return tag;
  if (tag.startsWith("<!DOCTYPE") || tag.startsWith("<!")) return tag;
  const tagMatch = /^<\/?([a-zA-Z][a-zA-Z0-9]*)\b([^>]*?)(\/?)>$/.exec(tag);
  if (!tagMatch) return tag;
  const name = tagMatch[1].toLowerCase();
  const attrs = tagMatch[2].trim();
  const selfFlag = tagMatch[3] === "/" || VOID_TAGS.has(name);
  const formatted = formatAttrs(attrs, sortAttrs, quoteStyle);
  if (selfFlag) return `<${name}${formatted}${sClose}>`;
  return `<${name}${formatted}>`;
}

function formatEmbedded(code: string, lang: "css" | "javascript", indent: string): string {
  if (!code.trim()) return code;
  const lines = code.trim().split("\n");
  return "\n" + lines.map((l) => indent + indent + l.trim()).join("\n") + "\n" + indent;
}

export function HTMLFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [errorLine, setErrorLine] = useState<number | null>(null);
  const [indentSize, setIndentSize] = useState<number>(2);
  const [indentType, setIndentType] = useState<IndentType>("spaces");
  const [wrapLen, setWrapLen] = useState(0);
  const [preserveInline, setPreserveInline] = useState(true);
  const [selfClose, setSelfClose] = useState<SelfClose>("html");
  const [quoteStyle, setQuoteStyle] = useState<QuoteStyle>("double");
  const [removeCmts, setRemoveCmts] = useState(false);
  const [removeEmptyAttrs, setRemoveEmptyAttrs] = useState(false);
  const [sortAttrs, setSortAttrs] = useState(true);
  const [formatEmbed, setFormatEmbed] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout>>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const getIndent = useCallback(() => {
    return indentType === "tabs" ? "\t".repeat(indentSize / 2) : " ".repeat(indentSize);
  }, [indentSize, indentType]);

  const format = useCallback(() => {
    try {
      let html = input;
      const comments: string[] = [];
      if (!removeCmts) {
        html = html.replace(/<!--[\s\S]*?-->/g, (m) => { comments.push(m); return "<!--__CMT__-->"; });
      } else {
        html = html.replace(/<!--[\s\S]*?-->/g, "");
      }

      html = html.replace(/>\s+</g, "><").trim();
      if (!html) { setOutput(""); setError(""); return; }

      const protectedChunks: string[] = [];
      html = html.replace(/(<script\b[^>]*>)([\s\S]*?)(<\/script>)/gi, (_m: string, open: string, content: string, close: string) => {
        protectedChunks.push(content);
        return `${open}__CHUNK_${protectedChunks.length - 1}__${close}`;
      });
      html = html.replace(/(<style\b[^>]*>)([\s\S]*?)(<\/style>)/gi, (_m: string, open: string, content: string, close: string) => {
        protectedChunks.push(content);
        return `${open}__CHUNK_${protectedChunks.length - 1}__${close}`;
      });

      const tokens: string[] = [];
      const tagRe = /(<[^>]+>)/g;
      let lastIdx = 0, match: RegExpExecArray | null;
      while ((match = tagRe.exec(html)) !== null) {
        if (match.index > lastIdx) {
          const text = html.slice(lastIdx, match.index);
          if (text.trim()) tokens.push(text);
        }
        tokens.push(match[1]);
        lastIdx = tagRe.lastIndex;
      }
      if (lastIdx < html.length) {
        const text = html.slice(lastIdx);
        if (text.trim()) tokens.push(text);
      }

      for (let i = 0; i < tokens.length; i++) {
        tokens[i] = tokens[i].replace(/__CHUNK_(\d+)__/g, (_m: string, idx: string) => protectedChunks[parseInt(idx)] || '');
      }

      const indent = getIndent();
      let indentLevel = 0;
      const lines: string[] = [];
      const tagStack: string[] = [];
      let prevWasOpen = false;

      for (let i = 0; i < tokens.length; i++) {
        const tok = tokens[i];
        if (!tok.startsWith("<")) {
          const text = tok.trim();
          if (text) {
            const pad = indent.repeat(indentLevel);
            if (wrapLen > 0 && text.length > wrapLen) {
              const wrapped = text.match(new RegExp(`.{1,${wrapLen}}`, "g")) || [text];
              wrapped.forEach((w) => lines.push(pad + w.trim()));
            } else {
              lines.push(pad + text);
            }
            prevWasOpen = false;
          }
          continue;
        }

        if (tok.startsWith("<!--")) {
          lines.push(indent.repeat(indentLevel) + tok);
          prevWasOpen = false;
          continue;
        }

        if (tok.startsWith("</")) {
          indentLevel = Math.max(0, indentLevel - 1);
          const name = tok.replace(/<\/\s*([a-zA-Z][a-zA-Z0-9]*).*>/, "$1").toLowerCase();
          if (tagStack.length && tagStack[tagStack.length - 1] === name) tagStack.pop();
          lines.push(indent.repeat(indentLevel) + tok);
          prevWasOpen = false;
          continue;
        }

        const tagName = (tok.match(/^<([a-zA-Z][a-zA-Z0-9]*)/) || [])[1]?.toLowerCase();
        const isSelfClosing = tok.endsWith("/>") || VOID_TAGS.has(tagName);
        let formatted = formatTag(tok, sortAttrs, selfClose, quoteStyle);

        if (removeEmptyAttrs) {
          formatted = formatted.replace(/\s+(class|id|style|title|alt|name|value|type|role|data-\w+)\s*=\s*([""''])\2/g, "");
        }

        if (tagName === "style" && formatEmbed) {
          const inner: string[] = [];
          let j = i + 1;
          while (j < tokens.length && !tokens[j]?.startsWith("</style")) {
            if (!tokens[j].startsWith("<")) inner.push(tokens[j]);
            j++;
          }
          if (inner.length) {
            formatted += formatEmbedded(inner.join(" "), "css", indent);
            i = j;
            indentLevel = Math.max(0, indentLevel - 1);
            lines.push(formatted);
            lines.push(indent.repeat(indentLevel) + tokens[j]);
            tagStack.pop();
            prevWasOpen = false;
            continue;
          }
        }

        if (tagName === "script" && formatEmbed) {
          const inner: string[] = [];
          let j = i + 1;
          while (j < tokens.length && !tokens[j]?.startsWith("</script")) {
            if (!tokens[j].startsWith("<")) inner.push(tokens[j]);
            j++;
          }
          if (inner.length) {
            formatted += formatEmbedded(inner.join(" "), "javascript", indent);
            i = j;
            indentLevel = Math.max(0, indentLevel - 1);
            lines.push(formatted);
            lines.push(indent.repeat(indentLevel) + tokens[j]);
            tagStack.pop();
            prevWasOpen = false;
            continue;
          }
        }

        if (!isSelfClosing && tagName) {
          if (preserveInline && INLINE_TAGS.has(tagName)) {
            const pad = prevWasOpen ? "" : indent.repeat(indentLevel);
            lines.push(pad + formatted);
            prevWasOpen = false;
            tagStack.push(tagName);
            continue;
          }
          tagStack.push(tagName);
        }

        if (prevWasOpen && !isSelfClosing && tagName && !INLINE_TAGS.has(tagName)) {
          lines.push(indent.repeat(indentLevel) + formatted);
        } else {
          lines.push(indent.repeat(indentLevel) + formatted);
        }
        if (!isSelfClosing && tagName) indentLevel++;
        prevWasOpen = isSelfClosing ? false : true;
      }

      let result = lines.join("\n").trim();
      if (!removeCmts) result = result.replace(/<!--__CMT__-->/g, () => comments.shift() || "");

      const tagStack2: string[] = [];
      const tagRe2 = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g;
      let m2: RegExpExecArray | null;
      while ((m2 = tagRe2.exec(input)) !== null) {
        const t = m2[1].toLowerCase();
        if (VOID_TAGS.has(t)) continue;
        if (m2[0].startsWith("</")) {
          if (tagStack2.length && tagStack2[tagStack2.length - 1] === t) tagStack2.pop();
        } else if (!m2[0].endsWith("/>")) {
          tagStack2.push(t);
        }
      }
      if (tagStack2.length > 0) {
        setError(`Unclosed tags: ${tagStack2.join(", ")}`);
        setErrorLine(null);
      } else {
        setError("");
        setErrorLine(null);
      }

      setOutput(result);
    } catch (e) {
      setError((e as Error).message);
      setErrorLine(null);
    }
  }, [input, getIndent, wrapLen, preserveInline, selfClose, quoteStyle, removeCmts, removeEmptyAttrs, sortAttrs, formatEmbed]);

  const minify = useCallback(() => {
    try {
      let result = input.replace(/\/\*[\s\S]*?\*\//g, "").replace(/<!--[\s\S]*?-->/g, "").replace(/>\s+</g, "><").replace(/\s{2,}/g, " ").replace(/\n/g, "").replace(/\t/g, "").trim();
      if (quoteStyle === "single") result = result.replace(/"/g, "'");
      setOutput(result);
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  }, [input, quoteStyle]);

  const validate = useCallback(() => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(input, "text/html");
      const parseErrors = doc.querySelectorAll("parsererror");
      if (parseErrors.length > 0) {
        const msg = parseErrors[0].textContent?.trim() || "Invalid HTML";
        setError(msg);
        setOutput("");
      } else {
        const tagStack: string[] = [];
        const tagRe = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g;
        let m: RegExpExecArray | null;
        while ((m = tagRe.exec(input)) !== null) {
          const t = m[1].toLowerCase();
          if (VOID_TAGS.has(t)) continue;
          if (m[0].startsWith("</")) {
            if (tagStack.length && tagStack[tagStack.length - 1] === t) tagStack.pop();
          } else if (!m[0].endsWith("/>")) {
            tagStack.push(t);
          }
        }
        if (tagStack.length > 0) {
          setError(`Unclosed tags: ${tagStack.join(", ")}`);
          setErrorLine(null);
          setOutput("");
        } else {
          setError("");
          setErrorLine(null);
          setOutput("HTML is valid.");
        }
      }
    } catch (e) {
      setError((e as Error).message);
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
    const blob = new Blob([output], { type: "text/html" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a");
    a.href = url; a.download = "formatted.html"; a.click(); URL.revokeObjectURL(url);
  }, [output]);
  const clear = useCallback(() => { setInput(""); setOutput(""); setError(""); setErrorLine(null); }, []);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const sizeCheck = validateFileSize(file);
    if (!sizeCheck.valid) { setError(sizeCheck.error!); return; }
    const reader = new FileReader();
    reader.onload = () => setInput(reader.result as string);
    reader.readAsText(file);
  };

  const inputChars = input.length;

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium text-surface-700 dark:text-dark-text">HTML Input</label>
          <button onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs border border-surface-200 text-surface-600 hover:bg-surface-50 dark:border-dark-border dark:text-dark-muted dark:hover:bg-dark-surface"><Upload className="w-3 h-3" /> Upload .html</button>
          <input ref={fileRef} type="file" accept=".html" onChange={handleFile} className="hidden" />
        </div>
        <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="<html><body><h1>Hello</h1></body></html>" rows={8} spellCheck={false}
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
            <option value="html">&lt;br&gt;</option><option value="xhtml">&lt;br /&gt;</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-surface-500 dark:text-dark-muted block mb-0.5">Quotes</label>
          <select value={quoteStyle} onChange={(e) => setQuoteStyle(e.target.value as QuoteStyle)}
            className="w-full rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value="double">Double</option><option value="single">Single</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-surface-500 dark:text-dark-muted block mb-0.5">Wrap length</label>
          <input type="number" min={0} max={200} value={wrapLen} onChange={(e) => setWrapLen(Number(e.target.value))}
            className="w-full rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" placeholder="0=off" />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-dark-muted cursor-pointer">
          <input type="checkbox" checked={preserveInline} onChange={(e) => setPreserveInline(e.target.checked)} className="rounded border-surface-300" /> Preserve inline
        </label>
        <label className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-dark-muted cursor-pointer">
          <input type="checkbox" checked={sortAttrs} onChange={(e) => setSortAttrs(e.target.checked)} className="rounded border-surface-300" /> Sort attributes
        </label>
        <label className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-dark-muted cursor-pointer">
          <input type="checkbox" checked={removeCmts} onChange={(e) => setRemoveCmts(e.target.checked)} className="rounded border-surface-300" /> Remove comments
        </label>
        <label className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-dark-muted cursor-pointer">
          <input type="checkbox" checked={removeEmptyAttrs} onChange={(e) => setRemoveEmptyAttrs(e.target.checked)} className="rounded border-surface-300" /> Remove empty attrs
        </label>
        <label className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-dark-muted cursor-pointer">
          <input type="checkbox" checked={formatEmbed} onChange={(e) => setFormatEmbed(e.target.checked)} className="rounded border-surface-300" /> Format embedded
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
          {errorLine !== null && <p className="text-xs text-red-500 mt-0.5">Error near line {errorLine}</p>}
        </div>
      )}

      {output && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-surface-700 dark:text-dark-text">Output</label>
            <span className="text-xs text-surface-400 dark:text-dark-muted">{inputChars} → {output.length} chars</span>
          </div>
          <pre className="w-full rounded-lg border border-surface-200 bg-surface-50 p-3 text-sm font-mono text-surface-900 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text overflow-auto max-h-80 whitespace-pre-wrap break-all">{output}</pre>
        </div>
      )}
    </div>
  );
}
