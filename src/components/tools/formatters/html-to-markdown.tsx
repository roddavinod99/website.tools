"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Upload } from "lucide-react";
import { validateFileSize } from "@/lib/file-security";

type HeadingStyle = "hash" | "underline";
type BulletMarker = "-" | "*" | "+";
type LinkStyle = "inline" | "reference";
type HrStyle = "---" | "***" | "___";
type CodeStyle = "backtick" | "indented";
type StrongEmStyle = "asterisk" | "underscore";

function htmlToMarkdown(html: string, opts: { headingStyle: HeadingStyle; bulletMarker: BulletMarker; linkStyle: LinkStyle; hrStyle: HrStyle; codeStyle: CodeStyle; strongEmStyle: StrongEmStyle; stripStyles: boolean; preserveAlt: boolean; tables: boolean }): string {
  if (!html.trim()) return "";
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const seChar = opts.strongEmStyle === "underscore" ? "_" : "*";
  const refLinks: string[] = [];
  let refIdx = 0;

  function nodeToMarkdown(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent || "";
    if (node.nodeType !== Node.ELEMENT_NODE) return "";
    const el = node as Element;
    const tag = el.tagName.toLowerCase();
    const childMd = () => Array.from(el.childNodes).map(nodeToMarkdown).join("");

    switch (tag) {
      case "h1": {
        const c = childMd().trim();
        return opts.headingStyle === "underline" ? `${c}\n${"=".repeat(c.length)}\n\n` : `# ${c}\n\n`;
      }
      case "h2": {
        const c = childMd().trim();
        return opts.headingStyle === "underline" ? `${c}\n${"-".repeat(c.length)}\n\n` : `## ${c}\n\n`;
      }
      case "h3": return `### ${childMd().trim()}\n\n`;
      case "h4": return `#### ${childMd().trim()}\n\n`;
      case "h5": return `##### ${childMd().trim()}\n\n`;
      case "h6": return `###### ${childMd().trim()}\n\n`;
      case "p": return `${childMd()}\n\n`;
      case "strong": case "b": return `${seChar}${seChar}${childMd()}${seChar}${seChar}`;
      case "em": case "i": return `${seChar}${childMd()}${seChar}`;
      case "del": case "s": return `~~${childMd()}~~`;
      case "a": {
        const href = el.getAttribute("href") || "";
        const c = childMd();
        if (opts.linkStyle === "reference") {
          refIdx++;
          refLinks.push(`[${refIdx}]: ${href}`);
          return `${c}[${refIdx}]`;
        }
        return `[${c}](${href})`;
      }
      case "img": {
        if (!opts.preserveAlt) return "";
        const alt = el.getAttribute("alt") || "";
        const src = el.getAttribute("src") || "";
        return `![${alt}](${src})`;
      }
      case "code": {
        if (el.parentElement?.tagName.toLowerCase() === "pre") return childMd();
        return `\`${childMd()}\``;
      }
      case "pre": {
        const code = el.querySelector("code");
        const content = code ? Array.from(code.childNodes).map(nodeToMarkdown).join("") : childMd();
        if (opts.codeStyle === "backtick") return `\`\`\`\n${content.trim()}\n\`\`\`\n\n`;
        return content.trim().split("\n").map((l: string) => `    ${l}`).join("\n") + "\n\n";
      }
      case "blockquote": return childMd().trim().split("\n").map((l: string) => `> ${l}`).join("\n") + "\n\n";
      case "ul": return Array.from(el.children).map((li) => `${opts.bulletMarker} ${Array.from(li.childNodes).map(nodeToMarkdown).join("").trim()}`).join("\n") + "\n\n";
      case "ol": return Array.from(el.children).map((li, i) => `${i + 1}. ${Array.from(li.childNodes).map(nodeToMarkdown).join("").trim()}`).join("\n") + "\n\n";
      case "li": return `${opts.bulletMarker} ${childMd().trim()}`;
      case "br": return "\n";
      case "hr": return `${opts.hrStyle}\n\n`;
      case "span": case "div": return childMd();
      case "table": {
        if (!opts.tables) return childMd();
        const rows: string[][] = [];
        el.querySelectorAll("tr").forEach((tr) => {
          const cells: string[] = [];
          tr.querySelectorAll("th, td").forEach((cell) => cells.push(Array.from(cell.childNodes).map(nodeToMarkdown).join("").trim()));
          if (cells.length > 0) rows.push(cells);
        });
        if (rows.length === 0) return "";
        const sep = rows[0].map(() => "---").join(" | ");
        return "\n| " + rows[0].join(" | ") + " |\n| " + sep + " |\n" + rows.slice(1).map((r) => "| " + r.join(" | ") + " |").join("\n") + "\n";
      }
      default: return childMd();
    }
  }

  let result = nodeToMarkdown(doc.body);
  result = result.replace(/(https?:\/\/[^\s<]+)/g, (url) => `[${url}](${url})`);
  result = result.replace(/\n{3,}/g, "\n\n").trim();

  if (opts.linkStyle === "reference" && refLinks.length > 0) {
    result += "\n\n" + refLinks.join("\n");
  }
  return result;
}

export function HtmlToMarkdown() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [headingStyle, setHeadingStyle] = useState<HeadingStyle>("hash");
  const [bulletMarker, setBulletMarker] = useState<BulletMarker>("-");
  const [linkStyle, setLinkStyle] = useState<LinkStyle>("inline");
  const [hrStyle] = useState<HrStyle>("---");
  const [codeStyle, setCodeStyle] = useState<CodeStyle>("backtick");
  const [strongEmStyle, setStrongEmStyle] = useState<StrongEmStyle>("asterisk");
  const [stripStyles, setStripStyles] = useState(false);
  const [preserveAlt, setPreserveAlt] = useState(true);
  const [tables, setTables] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const convert = useCallback(() => {
    const opts = { headingStyle, bulletMarker, linkStyle, hrStyle, codeStyle, strongEmStyle, stripStyles, preserveAlt, tables };
    if (!input.trim()) { setOutput(""); setError(""); return; }
    try {
      const md = htmlToMarkdown(input, opts);
      setOutput(md);
      setError("");
    } catch (e) {
      setError("Conversion failed: " + (e instanceof Error ? e.message : ""));
      setOutput("");
    }
  }, [input, headingStyle, bulletMarker, linkStyle, hrStyle, codeStyle, strongEmStyle, stripStyles, preserveAlt, tables]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(convert, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [convert]);

  const copy = async () => { if (output) await navigator.clipboard.writeText(output); };
  const download = () => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "output.md"; a.click();
    URL.revokeObjectURL(url);
  };
  const clear = () => { setInput(""); setOutput(""); setError(""); };
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const sizeCheck = validateFileSize(file);
    if (!sizeCheck.valid) { setError(sizeCheck.error!); return; }
    const reader = new FileReader();
    reader.onload = () => setInput(reader.result as string);
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">HTML Input</label>
        <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="<h1>Hello</h1><p>World</p>" rows={6} spellCheck={false}
          className="w-full rounded-lg border border-surface-200 bg-white p-3 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted" />
        <div className="mt-1">
          <input ref={fileRef} type="file" accept=".html,.htm" onChange={handleFile} className="hidden" />
          <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1 text-xs text-brand-500 hover:text-brand-600" aria-label="Upload HTML file"><Upload className="w-3 h-3" /> Upload HTML</button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-surface-500 dark:text-dark-muted">Headings:</label>
          <select value={headingStyle} onChange={(e) => setHeadingStyle(e.target.value as HeadingStyle)}
            className="rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value="hash">## (ATX)</option>
            <option value="underline">==== (Setext)</option>
          </select>
        </div>
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-surface-500 dark:text-dark-muted">Bullets:</label>
          <select value={bulletMarker} onChange={(e) => setBulletMarker(e.target.value as BulletMarker)}
            className="rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value="-">-</option>
            <option value="*">*</option>
            <option value="+">+</option>
          </select>
        </div>
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-surface-500 dark:text-dark-muted">Links:</label>
          <select value={linkStyle} onChange={(e) => setLinkStyle(e.target.value as LinkStyle)}
            className="rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value="inline">Inline</option>
            <option value="reference">Reference</option>
          </select>
        </div>
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-surface-500 dark:text-dark-muted">Code:</label>
          <select value={codeStyle} onChange={(e) => setCodeStyle(e.target.value as CodeStyle)}
            className="rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value="backtick">Fenced (```)</option>
            <option value="indented">Indented</option>
          </select>
        </div>
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-surface-500 dark:text-dark-muted">Bold/Italic:</label>
          <select value={strongEmStyle} onChange={(e) => setStrongEmStyle(e.target.value as StrongEmStyle)}
            className="rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value="asterisk">** *</option>
            <option value="underscore">__ _</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-dark-muted cursor-pointer">
          <input type="checkbox" checked={stripStyles} onChange={(e) => setStripStyles(e.target.checked)} className="rounded border-surface-300" /> Strip inline styles
        </label>
        <label className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-dark-muted cursor-pointer">
          <input type="checkbox" checked={preserveAlt} onChange={(e) => setPreserveAlt(e.target.checked)} className="rounded border-surface-300" /> Preserve image alt text
        </label>
        <label className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-dark-muted cursor-pointer">
          <input type="checkbox" checked={tables} onChange={(e) => setTables(e.target.checked)} className="rounded border-surface-300" /> GFM tables
        </label>
      </div>

      <div className="flex gap-2">
        <button onClick={copy} disabled={!output} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-40 transition-colors" aria-label="Copy Markdown">Copy Markdown</button>
        <button onClick={download} disabled={!output} className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 disabled:opacity-40 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors" aria-label="Download .md">Download .md</button>
        <button onClick={clear} className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors">Clear</button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm font-medium text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {output && (
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Markdown Output</label>
          <pre className="rounded-lg border border-surface-200 bg-surface-50 p-3 text-sm font-mono text-surface-900 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text overflow-auto max-h-60 whitespace-pre-wrap">{output}</pre>
        </div>
      )}
    </div>
  );
}
