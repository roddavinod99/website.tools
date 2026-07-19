"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { cn } from "@/lib/utils";
import { sanitize } from "@/lib/sanitize";
import { validateFileSize } from "@/lib/file-security";
import { getStorageItem, setStorageItem } from "@/lib/client-storage";

type Theme = "github" | "dark" | "solarized";

const THEME_STYLES: Record<Theme, string> = {
  github: "bg-white text-surface-900",
  dark: "bg-dark-bg text-dark-text",
  solarized: "bg-[#fdf6e3] text-[#657b83]",
};

const THEME_PROSE: Record<Theme, string> = {
  github: "prose prose-sm max-w-none prose-headings:text-surface-900 prose-a:text-brand-500 prose-code:bg-surface-100 prose-code:px-1 prose-code:rounded",
  dark: "prose prose-sm max-w-none prose-invert prose-headings:text-dark-text prose-a:text-brand-300 prose-code:bg-dark-surface prose-code:px-1 prose-code:rounded",
  solarized: "prose prose-sm max-w-none prose-headings:text-[#657b83] prose-a:text-[#268bd2] prose-code:bg-[#eee8d5] prose-code:px-1 prose-code:rounded",
};

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const EMOJI_MAP: Record<string, string> = {
  ":smile:": "😊", ":heart:": "❤️", ":fire:": "🔥", ":rocket:": "🚀",
  ":thumbsup:": "👍", ":check:": "✅", ":warning:": "⚠️", ":tada:": "🎉",
  ":100:": "💯", ":clap:": "👏", ":book:": "📖", ":bug:": "🐛",
  ":star:": "⭐", ":zap:": "⚡", ":ship:": "🚢", ":memo:": "📝",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function highlightCode(code: string, lang: string, hljsInstance?: any): string {
  if (hljsInstance && lang && hljsInstance.getLanguage(lang)) {
    try {
      return hljsInstance.highlight(code, { language: lang }).value;
    } catch {}
  }
  return escapeHtml(code);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderMarkdown(text: string, hljsInstance?: any): string {
  let html = escapeHtml(text);

  html = html.replace(/:[\w+]+:/g, m => EMOJI_MAP[m] || m);

  html = html.replace(/^####### (.+)$/gm, "<p><strong>$1</strong></p>");
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
    const trimmed = code.trim();
    const highlighted = highlightCode(trimmed, lang, hljsInstance);
    const langTag = lang ? `<span class="text-[10px] text-surface-400 dark:text-dark-muted uppercase">${escapeHtml(lang)}</span>` : "";
    return `<div class="relative rounded-lg bg-surface-50 dark:bg-dark-surface border border-surface-200 dark:border-dark-border my-2"><div class="flex items-center justify-between px-3 py-1 border-b border-surface-200 dark:border-dark-border">${langTag}</div><pre class="overflow-x-auto p-3 text-xs font-mono"><code>${highlighted}</code></pre></div>`;
  });

  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-brand-500 underline hover:opacity-80">$1</a>');
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full rounded-lg my-2" />');

  html = html.replace(/^(> .+)$/gm, (match) => {
    const lines = match.split("\n").map(l => l.replace(/^> /, "").replace(/^>$/, ""));
    const content = lines.join("<br/>");
    return `<blockquote class='border-l-4 border-surface-300 dark:border-dark-border pl-4 italic text-surface-600 dark:text-dark-muted my-2'>${content}</blockquote>`;
  });

  html = html.replace(/^- \[x\] (.+)$/gim, '<li class="flex items-center gap-2"><input type="checkbox" checked disabled class="accent-brand-500" /> <del>$1</del></li>');
  html = html.replace(/^- \[ \] (.+)$/gim, '<li class="flex items-center gap-2"><input type="checkbox" disabled class="accent-brand-500" /> $1</li>');

  html = html.replace(/^\d+\. (.+)$/gm, "<li>$1</li>");
  html = html.replace(/^- (.+)$/gm, "<li>$1</li>");

  html = html.replace(/(?:<li>.*<\/li>(?:\n)?)+/g, (match) => {
    if (match.includes('type="checkbox"')) {
      return `<ul class="list-none pl-5 my-2 space-y-1">${match}</ul>`;
    }
    return `<ul class="list-disc pl-5 my-2 space-y-1">${match}</ul>`;
  });

  html = html.replace(/(?:<li>(?:\d+\.\s)?.*<\/li>(?:\n)?)+/g, "<ol class='list-decimal pl-5 my-2 space-y-1'>$&</ol>");

  html = html.replace(/^---$/gm, "<hr class='my-4 border-surface-200 dark:border-dark-border' />");

  html = html.replace(/^\[(.+?)\]:\s*(.+)$/gm, "");

  html = html.replace(/(https?:\/\/[^\s<'"()]+[^\s<'"().,;:!?])/g, '<a href="$1" class="text-brand-500 underline hover:opacity-80">$1</a>');

  html = html.replace(/\n\n/g, "</p><p class='my-2'>");
  html = html.replace(/^(?!<[hupodibta])/gm, "");

  const tableRegex = /\|(.+)\|\n\|[-| :]+\|\n((?:\|.+\|\n?)*)/g;
  html = html.replace(tableRegex, (_, header: string, body: string) => {
    const headers = header.split("|").map(s => s.trim()).filter(Boolean);
    const rows = body.trim().split("\n").map(line =>
      line.split("|").map(s => s.trim()).filter(Boolean)
    );
    let tbl = "<table class='min-w-full border-collapse border border-surface-200 dark:border-dark-border my-2'>";
    tbl += "<thead><tr>";
    headers.forEach(h => { tbl += `<th class='border border-surface-200 dark:border-dark-border px-3 py-1.5 text-sm font-medium bg-surface-50 dark:bg-dark-surface'>${h}</th>`; });
    tbl += "</tr></thead><tbody>";
    rows.forEach(row => {
      tbl += "<tr>";
      row.forEach((cell) => { tbl += `<td class='border border-surface-200 dark:border-dark-border px-3 py-1.5 text-sm'>${cell || ""}</td>`; });
      tbl += "</tr>";
    });
    tbl += "</tbody></table>";
    return tbl;
  });

  return `<div class="p-4">${html}</div>`;
}

const TOOLBAR_ACTIONS = [
  { label: "B", cmd: "**", hint: "bold" },
  { label: "I", cmd: "*", hint: "italic", cls: "italic" },
  { label: "H", cmd: "# ", hint: "heading" },
  { label: "🔗", cmd: "[](url)", hint: "link" },
  { label: "🖼", cmd: "![](url)", hint: "image" },
  { label: "•", cmd: "- ", hint: "list" },
  { label: "`", cmd: "``", hint: "code" },
  { label: "📊", cmd: "| col1 | col2 |\n|------|------|\n| val1 | val2 |", hint: "table" },
];

export function MarkdownPreview() {
  const [input, setInput] = useState(() => {
    return getStorageItem("mdpreview_input") || "# Hello\n\nType **markdown** here to see a **live preview**.\n\n- List item 1\n- List item 2\n\n> A blockquote";
  });
  const [theme, setTheme] = useState<Theme>("github");
  const [showHtml, setShowHtml] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(false);
  const [fontSize, setFontSize] = useState(13);
  const [copyFeedback, setCopyFeedback] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [splitPos, setSplitPos] = useState(50);
  const isDragging = useRef(false);
  const fileRef = useRef<HTMLInputElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [hljsInstance, setHljsInstance] = useState<any>(null);

  useEffect(() => {
    import("@/lib/highlight-lazy").then((mod) => {
      setHljsInstance(mod.default);
    });
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css";
    link.id = "hljs-dynamic-css-preview";
    document.head.appendChild(link);
    return () => {
      const existing = document.getElementById("hljs-dynamic-css-preview");
      if (existing) existing.remove();
    };
  }, []);

  const wordCount = useMemo(() => input.trim() ? input.trim().split(/\s+/).length : 0, [input]);
  const readingTime = useMemo(() => Math.max(1, Math.ceil(wordCount / 200)), [wordCount]);

  useEffect(() => {
    setStorageItem("mdpreview_input", input);
  }, [input]);

  const insertAtCursor = useCallback((cmd: string) => {
    if (!editorRef.current) return;
    const ta = editorRef.current;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const before = input.substring(0, start);
    const after = input.substring(end);
    setInput(`${before}${cmd}${after}`);
    setTimeout(() => { ta.focus(); ta.setSelectionRange(start + cmd.length, start + cmd.length); }, 0);
  }, [input]);

  const downloadMd = () => {
    const blob = new Blob([input], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "document.md"; a.click();
    URL.revokeObjectURL(url);
  };

  const downloadHtml = () => {
    const fullHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Document</title><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css"><script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script><script>hljs.highlightAll();</script></head><body>${renderMarkdown(input, hljsInstance)}</body></html>`;
    const blob = new Blob([fullHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "document.html"; a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = async (type: "md" | "html") => {
    await navigator.clipboard.writeText(type === "md" ? input : renderMarkdown(input, hljsInstance));
    setCopyFeedback(`${type.toUpperCase()} copied`);
    setTimeout(() => setCopyFeedback(""), 2000);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/") || f.name.endsWith(".md") || f.name.endsWith(".markdown"));
    if (files.length > 0) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        if (files[0].name.endsWith(".md") || files[0].name.endsWith(".markdown")) {
          setInput(result);
        } else {
          const imgSyntax = `![${files[0].name}](${result})`;
          setInput(prev => prev + "\n" + imgSyntax);
        }
      };
      if (files[0].name.endsWith(".md") || files[0].name.endsWith(".markdown")) {
        reader.readAsText(files[0]);
      } else {
        reader.readAsDataURL(files[0]);
      }
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const sizeCheck = validateFileSize(file);
    if (!sizeCheck.valid) { alert(sizeCheck.error); return; }
    const reader = new FileReader();
    reader.onload = () => setInput(reader.result as string);
    reader.readAsText(file);
  };

  const handleMouseDown = () => { isDragging.current = true; };
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setSplitPos(Math.min(80, Math.max(20, pct)));
    };
    const handleMouseUp = () => { isDragging.current = false; };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => { document.removeEventListener("mousemove", handleMouseMove); document.removeEventListener("mouseup", handleMouseUp); };
  }, []);

  const generatedHtml = renderMarkdown(input, hljsInstance);

  return (
    <div className="space-y-3 animate-fade-in">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1">
          {TOOLBAR_ACTIONS.map(a => (
            <button key={a.hint} onClick={() => insertAtCursor(a.cmd)}
              title={a.hint}
              className={cn("rounded-md border border-surface-200 bg-white px-2 py-1 text-xs font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:hover:bg-dark-border transition-colors", a.cls)}
            >{a.label}</button>
          ))}
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2 text-xs text-surface-400 dark:text-dark-muted">
          <span>{wordCount} words</span>
          <span>·</span>
          <span>{readingTime} min read</span>
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs text-surface-500 dark:text-dark-muted">
        <label className="flex items-center gap-1">
          <input type="checkbox" checked={showLineNumbers} onChange={e => setShowLineNumbers(e.target.checked)} className="accent-brand-500" />
          Line #s
        </label>
        <label className="flex items-center gap-1">
          <input type="checkbox" checked={showHtml} onChange={e => setShowHtml(e.target.checked)} className="accent-brand-500" />
          HTML
        </label>
        <select value={theme} onChange={e => setTheme(e.target.value as Theme)}
          className="rounded-md border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text"
        >
          <option value="github">GitHub</option>
          <option value="dark">Dark</option>
          <option value="solarized">Solarized</option>
        </select>
        <input type="range" min={10} max={20} value={fontSize} onChange={e => setFontSize(parseInt(e.target.value, 10))}
          className="w-16 accent-brand-500" title="Font size"
        />
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

      <div ref={containerRef} className="relative flex rounded-lg border border-surface-200 dark:border-dark-border overflow-hidden" style={{ minHeight: "400px" }}>
        <div className="relative" style={{ width: `${splitPos}%` }}>
          <textarea
            ref={editorRef}
            value={input} onChange={e => setInput(e.target.value)}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            style={{ fontSize: `${fontSize}px` }}
            className={cn(
              "h-full w-full resize-none bg-white p-4 font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted",
              dragOver && "ring-2 ring-brand-400",
            )}
            placeholder="Type markdown here..."
            spellCheck={false}
          />
          {showLineNumbers && (
            <div className="absolute top-0 left-0 bottom-0 overflow-hidden border-r border-surface-200 dark:border-dark-border bg-surface-50 dark:bg-dark-surface select-none text-right" style={{ width: "2.5rem", fontSize: `${fontSize}px`, lineHeight: "1.25rem" }}>
              {input.split("\n").map((_, i) => (
                <div key={i} className="px-1 text-[11px] leading-5 text-surface-400 dark:text-dark-muted font-mono">{i + 1}</div>
              ))}
            </div>
          )}
        </div>
        <div
          className="w-1.5 cursor-col-resize bg-surface-200 hover:bg-brand-400 dark:bg-dark-border dark:hover:bg-brand-500 transition-colors shrink-0"
          onMouseDown={handleMouseDown}
        />
        <div className="flex-1 overflow-auto" style={{ backgroundColor: theme === "solarized" ? "#fdf6e3" : theme === "dark" ? "#0d1117" : "#ffffff" }}>
          {showHtml ? (
            <pre className="p-4 text-xs font-mono overflow-x-auto" style={{ color: theme === "solarized" ? "#657b83" : theme === "dark" ? "#f0f6fc" : undefined }}>
              {generatedHtml.replace(/</g, "&lt;").replace(/>/g, "&gt;")}
            </pre>
          ) : (
            <div className={cn(THEME_STYLES[theme])}>
              <div
                className={cn(THEME_PROSE[theme], "p-4")}
                dangerouslySetInnerHTML={{ __html: sanitize(generatedHtml) }}
              />
            </div>
          )}
        </div>
      </div>

      {copyFeedback && (
        <div className="fixed bottom-4 right-4 rounded-lg bg-brand-500 px-4 py-2 text-sm text-white shadow-lg animate-fade-in">
          {copyFeedback}
        </div>
      )}
    </div>
  );
}
