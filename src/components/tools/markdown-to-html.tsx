"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { sanitize as sanitizeHtml } from "@/lib/sanitize";

function simpleMarkdown(md: string, sanitize: boolean): string {
  let html = md
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/^###### (.+)$/gm, "<h6>$1</h6>")
    .replace(/^##### (.+)$/gm, "<h5>$1</h5>")
    .replace(/^#### (.+)$/gm, "<h4>$1</h4>")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/^> (.+)$/gm, "<blockquote><p>$1</p></blockquote>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/^\d+\. (.+)$/gm, "<li>$1</li>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/~~(.+?)~~/g, "<del>$1</del>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')
    .replace(/^---$/gm, "<hr />")
    .replace(/\|(.+)\|/g, (match) => {
      if (match.includes("---")) return "";
      const cells = match.slice(1, -1).split("|").map((c) => c.trim());
      return `<td>${cells.join("</td><td>")}</td>`;
    });

  if (sanitize) {
    html = html.replace(/<script[\s\S]*?<\/script>/gi, "");
    html = html.replace(/on\w+="[^"]*"/gi, "");
    html = html.replace(/on\w+='[^']*'/gi, "");
  }

  html = html.replace(/<\/li>\n<li>/g, "</li><li>");
  html = html.replace(/(<li>.*<\/li>)/gs, "<ul>$1</ul>");
  html = html.replace(/<\/ul>\s*<ul>/g, "");
  const lines = html.split("\n").filter(Boolean);
  const wrapped = lines.map((l) => {
    if (l.startsWith("<h") || l.startsWith("<ul") || l.startsWith("<pre") || l.startsWith("<blockquote") || l.startsWith("<hr") || l.startsWith("<img") || l.startsWith("</")) return l;
    return `<p>${l}</p>`;
  }).join("\n");
  return wrapped;
}

function countWords(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

function estimateReadingTime(words: number): string {
  const min = Math.max(1, Math.round(words / 200));
  return `${min} min read`;
}

export function MarkdownToHtml() {
  const [input, setInput] = useState("# Hello\n\nThis is **bold** and *italic*.\n\n- Item 1\n- Item 2\n\n```js\nconsole.log('hi')\n```");
  const [output, setOutput] = useState("");
  const [sanitize, setSanitize] = useState(true);
  const [prettyPrint, setPrettyPrint] = useState(false);
  const [showSource, setShowSource] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const convert = useCallback(() => {
    if (!input.trim()) { setOutput(""); return; }
    const raw = simpleMarkdown(input, sanitize);
    if (prettyPrint) {
      const indent = "  ";
      let pretty = "";
      let depth = 0;
      for (const ch of raw) {
        if (ch === "<") { pretty += (depth > 0 ? "\n" + indent.repeat(depth) : ""); pretty += ch; if (raw[raw.indexOf(ch) + 1] === "/") depth--; }
        else if (ch === ">") { pretty += ch; if (raw[raw.indexOf(ch) - 1] !== "/" && !raw.slice(0, raw.indexOf(ch)).endsWith("/")) depth++; }
        else pretty += ch;
      }
      setOutput(pretty);
    } else {
      setOutput(raw.replace(/\n{2,}/g, "\n"));
    }
  }, [input, sanitize, prettyPrint]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(convert, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [convert]);

  const wordCount = useMemo(() => countWords(input), [input]);
  const readTime = useMemo(() => estimateReadingTime(wordCount), [wordCount]);

  const copy = async () => { if (output) await navigator.clipboard.writeText(output); };
  const download = () => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "output.html"; a.click();
    URL.revokeObjectURL(url);
  };
  const clear = () => { setInput(""); setOutput(""); };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Markdown Input</label>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={8} spellCheck={false}
            className="w-full rounded-lg border border-surface-200 bg-white p-3 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted" />
          <div className="flex justify-between text-xs text-surface-400 dark:text-dark-muted mt-1">
            <span>{wordCount} words</span>
            <span>{readTime}</span>
          </div>
        </div>
        {showPreview && (
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">
              {showSource ? "HTML Source" : "Preview"}
            </label>
            {showSource ? (
              <pre className="w-full rounded-lg border border-surface-200 bg-surface-50 p-3 text-sm font-mono text-surface-900 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text overflow-auto max-h-64 whitespace-pre-wrap min-h-[11rem]">{output || " "}</pre>
            ) : (
              <div className="w-full rounded-lg border border-surface-200 bg-white p-3 text-sm text-surface-900 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text overflow-auto max-h-64 min-h-[11rem] prose prose-sm dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(output) || "<p style='color:#999'>Preview will appear here</p>" }} />
            )}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-dark-muted cursor-pointer">
          <input type="checkbox" checked={sanitize} onChange={(e) => setSanitize(e.target.checked)} className="rounded border-surface-300" /> Sanitize HTML
        </label>
        <label className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-dark-muted cursor-pointer">
          <input type="checkbox" checked={prettyPrint} onChange={(e) => setPrettyPrint(e.target.checked)} className="rounded border-surface-300" /> Pretty-print HTML
        </label>
        <label className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-dark-muted cursor-pointer">
          <input type="checkbox" checked={showSource} onChange={(e) => { setShowSource(e.target.checked); setShowPreview(true); }} className="rounded border-surface-300" /> Show source
        </label>
        <label className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-dark-muted cursor-pointer">
          <input type="checkbox" checked={showPreview} onChange={(e) => setShowPreview(e.target.checked)} className="rounded border-surface-300" /> Show preview
        </label>
      </div>

      <div className="flex gap-2">
        <button onClick={copy} disabled={!output} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-40 transition-colors">Copy HTML</button>
        <button onClick={download} disabled={!output} className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 disabled:opacity-40 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors">Download HTML</button>
        <button onClick={clear} className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors">Clear</button>
      </div>
    </div>
  );
}
