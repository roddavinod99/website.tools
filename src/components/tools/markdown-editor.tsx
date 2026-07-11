"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { cn } from "@/lib/utils";
import { sanitize } from "@/lib/sanitize";
import hljs from "highlight.js";

type Theme = "light" | "dark" | "sepia";

const THEME_BG: Record<Theme, string> = {
  light: "bg-white",
  dark: "bg-[#0d1117]",
  sepia: "bg-[#fdf6e3]",
};

const THEME_PROSE: Record<Theme, string> = {
  light: "prose prose-sm max-w-none prose-headings:text-surface-900 prose-a:text-brand-500 prose-code:bg-surface-100 prose-code:px-1 prose-code:rounded",
  dark: "prose prose-sm max-w-none prose-invert prose-headings:text-[#c9d1d9] prose-a:text-[#58a6ff] prose-code:bg-[#161b22] prose-code:px-1 prose-code:rounded",
  sepia: "prose prose-sm max-w-none prose-headings:text-[#657b83] prose-a:text-[#268bd2] prose-code:bg-[#eee8d5] prose-code:px-1 prose-code:rounded",
};

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function highlightCode(code: string, lang: string): string {
  if (lang && hljs.getLanguage(lang)) {
    try { return hljs.highlight(code, { language: lang }).value; } catch {}
  }
  return escapeHtml(code);
}

function renderMarkdown(text: string): string {
  let html = escapeHtml(text);
  html = html.replace(/^###### (.+)$/gm, "<h6>$1</h6>");
  html = html.replace(/^##### (.+)$/gm, "<h5>$1</h5>");
  html = html.replace(/^#### (.+)$/gm, "<h4>$1</h4>");
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");
  html = html.replace(/~~(.+?)~~/g, "<del>$1</del>");
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const highlighted = highlightCode(code.trim(), lang);
    const langTag = lang ? `<span class="text-[10px] text-surface-400 dark:text-dark-muted uppercase">${escapeHtml(lang)}</span>` : "";
    return `<div class="relative rounded-lg bg-surface-50 dark:bg-dark-surface border border-surface-200 dark:border-dark-border my-2"><div class="flex items-center justify-between px-3 py-1 border-b border-surface-200 dark:border-dark-border">${langTag}</div><pre class="overflow-x-auto p-3 text-xs font-mono"><code>${highlighted}</code></pre></div>`;
  });
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-brand-500 underline hover:opacity-80">$1</a>');
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full rounded-lg my-2" />');
  html = html.replace(/^- \[x\] (.+)$/gim, '<li class="flex items-center gap-2"><input type="checkbox" checked disabled class="accent-brand-500" /> <del>$1</del></li>');
  html = html.replace(/^- \[ \] (.+)$/gim, '<li class="flex items-center gap-2"><input type="checkbox" disabled class="accent-brand-500" /> $1</li>');
  html = html.replace(/^\d+\. (.+)$/gm, "<li>$1</li>");
  html = html.replace(/^- (.+)$/gm, "<li>$1</li>");
  html = html.replace(/(?:<li>.*<\/li>(?:\n)?)+/g, (match) => {
    if (match.includes('type="checkbox"')) return `<ul class="list-none pl-5 my-2 space-y-1">${match}</ul>`;
    return `<ul class="list-disc pl-5 my-2 space-y-1">${match}</ul>`;
  });
  html = html.replace(/^---$/gm, "<hr class='my-4 border-surface-200 dark:border-dark-border' />");
  html = html.replace(/(https?:\/\/[^\s<'"()]+[^\s<'"().,;:!?])/g, '<a href="$1" class="text-brand-500 underline hover:opacity-80">$1</a>');
  html = html.replace(/\n\n/g, "</p><p class='my-2'>");
  const tableRegex = /\|(.+)\|\n\|[-| :]+\|\n((?:\|.+\|\n?)*)/g;
  html = html.replace(tableRegex, (_, header: string, body: string) => {
    const headers = header.split("|").map((s: string) => s.trim()).filter(Boolean);
    const rows = body.trim().split("\n").map((line: string) => line.split("|").map((s: string) => s.trim()).filter(Boolean));
    let tbl = "<table class='min-w-full border-collapse border border-surface-200 dark:border-dark-border my-2'><thead><tr>";
    headers.forEach((h: string) => { tbl += `<th class='border border-surface-200 dark:border-dark-border px-3 py-1.5 text-sm font-medium bg-surface-50 dark:bg-dark-surface'>${h}</th>`; });
    tbl += "</tr></thead><tbody>";
    rows.forEach((row: string[]) => {
      tbl += "<tr>";
      row.forEach((cell: string) => { tbl += `<td class='border border-surface-200 dark:border-dark-border px-3 py-1.5 text-sm'>${cell || ""}</td>`; });
      tbl += "</tr>";
    });
    tbl += "</tbody></table>";
    return tbl;
  });
  return `<div class="p-4">${html}</div>`;
}

const TOOLBAR = [
  { label: "B", before: "**", after: "**", hint: "bold" },
  { label: "I", before: "*", after: "*", hint: "italic", cls: "italic" },
  { label: "H1", before: "# ", after: "", hint: "heading1" },
  { label: "H2", before: "## ", after: "", hint: "heading2" },
  { label: "Link", before: "[", after: "](url)", hint: "link" },
  { label: "Image", before: "![alt](", after: ")", hint: "image" },
  { label: "List", before: "- ", after: "", hint: "list" },
  { label: "Code", before: "```\n", after: "\n```", hint: "code" },
  { label: "Table", before: "| Header | Header |\n|--------|--------|\n| Cell | Cell |", after: "", hint: "table" },
];

export function MarkdownEditor() {
  const [input, setInput] = useState(() => {
    try {
      if (typeof window === "undefined") return "# Welcome\n\nStart writing your Markdown here...\n\n## Features\n\n- **Bold** and *italic* text\n- [Links](https://example.com)\n- Code blocks with syntax highlighting\n\n```javascript\nconsole.log('Hello World');\n```\n\n> Blockquotes work too!\n\n| Column 1 | Column 2 |\n|----------|----------|\n| Data | Data |";
      return localStorage.getItem("mdeditor_input") || "# Welcome\n\nStart writing your Markdown here...";
    } catch { return "# Welcome\n\nStart writing your Markdown here..."; }
  });
  const [theme, setTheme] = useState<Theme>("light");
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [fontSize, setFontSize] = useState(14);
  const [splitPos, setSplitPos] = useState(50);
  const [showHtml, setShowHtml] = useState(false);
  const [tableHelper, setTableHelper] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [copyFeedback, setCopyFeedback] = useState("");
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const wordCount = useMemo(() => input.trim() ? input.trim().split(/\s+/).length : 0, [input]);
  const charCount = useMemo(() => input.length, [input]);
  const readingTime = useMemo(() => Math.max(1, Math.ceil(wordCount / 200)), [wordCount]);

  useEffect(() => { localStorage.setItem("mdeditor_input", input); }, [input]);

  const insertAtCursor = useCallback((before: string, after = "") => {
    if (!editorRef.current) return;
    const ta = editorRef.current;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = input.substring(start, end);
    const replacement = before + (selected || "text") + after;
    setInput(input.substring(0, start) + replacement + input.substring(end));
    setTimeout(() => {
      ta.focus();
      const pos = start + before.length + (selected ? selected.length : 4);
      ta.setSelectionRange(pos, pos);
    }, 0);
  }, [input]);

  const insertTable = () => {
    const header = Array(tableCols).fill("Header").map((_, i) => `Header ${i + 1}`).join(" | ");
    const sep = Array(tableCols).fill("------").join(" | ");
    const row = Array(tableCols).fill("Cell").map((_, i) => `Cell ${i + 1}`).join(" | ");
    const rows = Array(tableRows - 1).fill(`| ${row} |`).join("\n");
    insertAtCursor(`| ${header} |\n| ${sep} |\n| ${rows} |`);
    setTableHelper(false);
  };

  const handleCopy = useCallback(async (type: "md" | "html") => {
    const text = type === "md" ? input : renderMarkdown(input);
    await navigator.clipboard.writeText(text);
    setCopyFeedback(`${type.toUpperCase()} copied!`);
    setTimeout(() => setCopyFeedback(""), 2000);
  }, [input]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === "b") { e.preventDefault(); insertAtCursor("**", "**"); }
      if (e.key === "i") { e.preventDefault(); insertAtCursor("*", "*"); }
      if (e.key === "s") { e.preventDefault(); handleCopy("md"); }
    }
  }, [insertAtCursor, handleCopy]);

  const downloadMd = () => {
    const blob = new Blob([input], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "document.md"; a.click();
    URL.revokeObjectURL(url);
  };

  const downloadHtml = () => {
    const fullHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Document</title></head><body>${renderMarkdown(input)}</body></html>`;
    const blob = new Blob([fullHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "document.html"; a.click();
    URL.revokeObjectURL(url);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setInput(reader.result as string);
    reader.readAsText(file);
  };

  const handleMouseDown = () => { isDragging.current = true; };
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setSplitPos(Math.min(80, Math.max(20, ((e.clientX - rect.left) / rect.width) * 100)));
    };
    const handleMouseUp = () => { isDragging.current = false; };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => { document.removeEventListener("mousemove", handleMouseMove); document.removeEventListener("mouseup", handleMouseUp); };
  }, []);

  const renderedHtml = renderMarkdown(input);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1">
          {TOOLBAR.map(t => (
            <button key={t.hint} onClick={() => insertAtCursor(t.before, t.after)}
              title={t.hint}
              className={cn("rounded-md border border-surface-200 bg-white px-2 py-1 text-xs font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:hover:bg-dark-border transition-colors", t.cls)}>{t.label}</button>
          ))}
          <button onClick={() => setTableHelper(!tableHelper)} title="Insert Table"
            className="rounded-md border border-surface-200 bg-white px-2 py-1 text-xs font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:hover:bg-dark-border transition-colors">Table</button>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2 text-xs text-surface-400 dark:text-dark-muted">
          <span>{wordCount} words</span>
          <span>·</span>
          <span>{charCount} chars</span>
          <span>·</span>
          <span>{readingTime} min read</span>
        </div>
      </div>

      {tableHelper && (
        <div className="flex items-center gap-2 p-2 rounded-lg border border-surface-200 dark:border-dark-border bg-surface-50 dark:bg-dark-surface">
          <label className="text-xs text-surface-600 dark:text-dark-muted">Rows:</label>
          <input type="number" min={1} max={20} value={tableRows} onChange={(e) => setTableRows(Number(e.target.value))} className="w-14 rounded border border-surface-200 bg-white px-2 py-1 text-xs dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
          <label className="text-xs text-surface-600 dark:text-dark-muted">Cols:</label>
          <input type="number" min={1} max={10} value={tableCols} onChange={(e) => setTableCols(Number(e.target.value))} className="w-14 rounded border border-surface-200 bg-white px-2 py-1 text-xs dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
          <button onClick={insertTable} className="rounded bg-brand-500 px-2 py-1 text-xs text-white hover:bg-brand-600">Insert</button>
        </div>
      )}

      <div className="flex items-center gap-3 text-xs text-surface-500 dark:text-dark-muted">
        <label className="flex items-center gap-1"><input type="checkbox" checked={showLineNumbers} onChange={e => setShowLineNumbers(e.target.checked)} className="accent-brand-500" /> Line #s</label>
        <label className="flex items-center gap-1"><input type="checkbox" checked={showHtml} onChange={e => setShowHtml(e.target.checked)} className="accent-brand-500" /> HTML</label>
        <select value={theme} onChange={e => setTheme(e.target.value as Theme)} className="rounded-md border border-surface-200 bg-white px-2 py-1 text-xs dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
          <option value="light">Light</option><option value="dark">Dark</option><option value="sepia">Sepia</option>
        </select>
        <input type="range" min={11} max={20} value={fontSize} onChange={e => setFontSize(parseInt(e.target.value))} className="w-16 accent-brand-500" title="Font size" />
        <div className="flex-1" />
        <button onClick={() => handleCopy("md")} className="hover:text-brand-500 transition-colors">Copy MD</button>
        <button onClick={() => handleCopy("html")} className="hover:text-brand-500 transition-colors">Copy HTML</button>
        <button onClick={downloadMd} className="hover:text-brand-500 transition-colors">.md</button>
        <button onClick={downloadHtml} className="hover:text-brand-500 transition-colors">.html</button>
      </div>

      <div className="flex items-center gap-2 text-xs">
        <input ref={fileRef} type="file" accept=".md,.markdown" onChange={handleFile} className="hidden" />
        <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1 rounded border border-surface-200 px-2 py-1 text-surface-600 hover:bg-surface-50 dark:border-dark-border dark:text-dark-muted dark:hover:bg-dark-surface transition-colors">Upload .md</button>
      </div>

      <div ref={containerRef} className="relative flex rounded-lg border border-surface-200 dark:border-dark-border overflow-hidden" style={{ minHeight: "450px" }}>
        <div className="relative" style={{ width: `${splitPos}%` }}>
          <textarea ref={editorRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
            style={{ fontSize: `${fontSize}px` }}
            className="h-full w-full resize-none bg-white p-4 font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted"
            placeholder="Type Markdown here..." spellCheck={false} />
          {showLineNumbers && (
            <div className="absolute top-0 left-0 bottom-0 overflow-hidden border-r border-surface-200 dark:border-dark-border bg-surface-50 dark:bg-[#1e282c] select-none text-right" style={{ width: "2.5rem", fontSize: `${fontSize}px`, lineHeight: "1.25rem" }}>
              {input.split("\n").map((_, i) => (
                <div key={i} className="px-1 text-[11px] leading-5 text-surface-400 dark:text-dark-muted font-mono">{i + 1}</div>
              ))}
            </div>
          )}
        </div>
        <div className="w-1.5 cursor-col-resize bg-surface-200 hover:bg-brand-400 dark:bg-dark-border dark:hover:bg-brand-500 transition-colors shrink-0" onMouseDown={handleMouseDown} />
        <div className="flex-1 overflow-auto" style={{ backgroundColor: THEME_BG[theme] === "bg-white" ? "#fff" : THEME_BG[theme] === "bg-[#0d1117]" ? "#0d1117" : "#fdf6e3" }}>
          {showHtml ? (
            <pre className="p-4 text-xs font-mono overflow-x-auto" style={{ color: theme === "dark" ? "#c9d1d9" : theme === "sepia" ? "#657b83" : undefined }}>
              {renderedHtml.replace(/</g, "&lt;").replace(/>/g, "&gt;")}
            </pre>
          ) : (
            <div className={cn("p-4", THEME_PROSE[theme])} dangerouslySetInnerHTML={{ __html: sanitize(renderedHtml) }} />
          )}
        </div>
      </div>

      {copyFeedback && (
        <div className="fixed bottom-4 right-4 rounded-lg bg-brand-500 px-4 py-2 text-sm text-white shadow-lg animate-fade-in">{copyFeedback}</div>
      )}
    </div>
  );
}
