"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import DOMPurify from "dompurify";
import { Upload } from "lucide-react";

const safeSanitize = (html: string, opts?: object) => {
  try { return opts ? DOMPurify.sanitize(html, opts) : DOMPurify.sanitize(html); } catch { return html; }
};

function simpleMarkdown(md: string, opts: { gfm: boolean; highlight: boolean; smartypants: boolean; sanitize: boolean; smartLines: boolean; headerIds: boolean }): string {
  let html = md
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/^###### (.+)$/gm, (_, c) => opts.headerIds ? `<h6 id="${c.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}">${c}</h6>` : `<h6>${c}</h6>`)
    .replace(/^##### (.+)$/gm, (_, c) => opts.headerIds ? `<h5 id="${c.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}">${c}</h5>` : `<h5>${c}</h5>`)
    .replace(/^#### (.+)$/gm, (_, c) => opts.headerIds ? `<h4 id="${c.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}">${c}</h4>` : `<h4>${c}</h4>`)
    .replace(/^### (.+)$/gm, (_, c) => opts.headerIds ? `<h3 id="${c.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}">${c}</h3>` : `<h3>${c}</h3>`)
    .replace(/^## (.+)$/gm, (_, c) => opts.headerIds ? `<h2 id="${c.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}">${c}</h2>` : `<h2>${c}</h2>`)
    .replace(/^# (.+)$/gm, (_, c) => opts.headerIds ? `<h1 id="${c.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}">${c}</h1>` : `<h1>${c}</h1>`)
    .replace(/^> (.+)$/gm, "<blockquote><p>$1</p></blockquote>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/^\d+\. (.+)$/gm, "<li>$1</li>");

  if (opts.gfm) {
    html = html.replace(/(\r\n|\n|\r)/gm, opts.smartLines ? "<br>\n" : "\n");
    html = html.replace(/~~(.+?)~~/g, "<del>$1</del>");
    html = html.replace(/(?:^|\n)- \[(x| )\] (.+)/gm, (_, checked, text) => `<li class="task-list-item"><input type="checkbox" ${checked === "x" ? "checked" : ""} disabled> ${text}</li>`);
    const tableRegex = /\n\|(.+)\|\n\|[-| ]+\|\n((?:\|.+\|\n?)*)/g;
    html = html.replace(tableRegex, (_, header, body) => {
      const headerCells = header.split("|").filter((c: string) => c.trim()).map((c: string) => `<th>${c.trim()}</th>`).join("");
      const rows = body.trim().split("\n").filter((r: string) => r.trim()).map((r: string) => `<tr>${r.split("|").filter((c: string) => c.trim()).map((c: string) => `<td>${c.trim()}</td>`).join("")}</tr>`).join("");
      return `\n<table><thead><tr>${headerCells}</tr></thead><tbody>${rows}</tbody></table>\n`;
    });
    html = html.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1">$1</a>');
  }

  html = html
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/```(\w*)\n([\s\S]*?)```/g, opts.highlight ? '<pre><code class="language-$1 hljs">$2</code></pre>' : '<pre><code class="language-$1">$2</code></pre>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')
    .replace(/^---$/gm, "<hr />")
    .replace(/\|(.+)\|/g, (match) => {
      if (match.includes("---")) return "";
      const cells = match.slice(1, -1).split("|").map((c) => c.trim());
      return `<td>${cells.join("</td><td>")}</td>`;
    });

  if (opts.smartypants) {
    html = html.replace(/\.\.\./g, "&hellip;").replace(/--/g, "&mdash;").replace(/(\w)'(?=\w)/g, "$1&rsquo;").replace(/'/g, "&rsquo;").replace(/"(?=\w)/g, "&ldquo;").replace(/"(?!\w)/g, "&rdquo;");
  }

  if (opts.sanitize) {
    html = safeSanitize(html, {
      ALLOWED_TAGS: [
        "p", "br", "b", "i", "em", "strong", "a", "ul", "ol", "li",
        "h1", "h2", "h3", "h4", "h5", "h6", "code", "pre", "blockquote",
        "hr", "sub", "sup", "span", "div", "table", "thead", "tbody", "tr", "th", "td",
        "img", "svg", "path", "circle", "rect", "line", "polyline", "polygon",
        "g", "defs", "clipPath", "mask", "text", "tspan", "use", "del",
        "input", "label",
      ],
      ALLOWED_ATTR: [
        "href", "target", "rel", "src", "alt", "class", "id", "style",
        "width", "height", "viewBox", "fill", "stroke", "stroke-width",
        "d", "cx", "cy", "r", "x", "y", "rx", "ry", "points", "xmlns",
        "preserveAspectRatio", "fill-rule", "clip-rule", "transform",
        "checked", "disabled", "type",
      ],
    });
  }

  html = html.replace(/<\/li>\n<li>/g, "</li><li>");
  html = html.replace(/(<li>.*<\/li>)/gs, "<ul>$1</ul>");
  html = html.replace(/<\/ul>\s*<ul>/g, "");
  const lines = html.split("\n").filter(Boolean);
  const wrapped = lines.map((l) => {
    if (l.startsWith("<h") || l.startsWith("<ul") || l.startsWith("<pre") || l.startsWith("<blockquote") || l.startsWith("<hr") || l.startsWith("<img") || l.startsWith("</") || l.startsWith("<table") || l.startsWith("<tr") || l.startsWith("<td") || l.startsWith("<th") || l.startsWith("<thead") || l.startsWith("<tbody") || l.startsWith("<input")) return l;
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

const examples: Record<string, string> = {
  basic: "# Hello World\n\nThis is **bold** text and *italic* text.\n\n- Item 1\n- Item 2\n\n```js\nconsole.log('hello')\n```",
  article: "# My Article\n\n## Introduction\n\nThis is a paragraph with **bold** and *italic*.\n\n> This is a blockquote\n\n## Conclusion\n\nThanks for reading!",
  readme: "# Project Name\n\n## Description\n\nA **great** project.\n\n## Installation\n\n```bash\nnpm install\n```\n\n## Usage\n\nSee [docs](https://example.com).\n\n## License\n\nMIT",
};

export function MarkdownToHtml() {
  const [input, setInput] = useState("# Hello\n\nThis is **bold** and *italic*.\n\n- Item 1\n- Item 2\n\n```js\nconsole.log('hi')\n```");
  const [output, setOutput] = useState("");
  const [gfm, setGfm] = useState(true);
  const [highlight, setHighlight] = useState(true);
  const [smartypants, setSmartypants] = useState(true);
  const [sanitize, setSanitize] = useState(true);
  const [smartLines, setSmartLines] = useState(false);
  const [headerIds, setHeaderIds] = useState(true);
  const [prettyPrint, setPrettyPrint] = useState(false);
  const [showSource, setShowSource] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [example, setExample] = useState("basic");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const convert = useCallback(() => {
    if (!input.trim()) { setOutput(""); return; }
    const raw = simpleMarkdown(input, { gfm, highlight, smartypants, sanitize, smartLines, headerIds });
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
  }, [input, gfm, highlight, smartypants, sanitize, smartLines, headerIds, prettyPrint]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(convert, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [convert]);

  const handleExample = (val: string) => {
    setExample(val);
    if (val !== "custom") setInput(examples[val] || "");
  };

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
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setInput(reader.result as string);
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <label className="text-xs text-surface-500 dark:text-dark-muted">Template:</label>
        <select value={example} onChange={(e) => handleExample(e.target.value)} className="rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
          <option value="basic">Basic</option>
          <option value="article">Article</option>
          <option value="readme">README</option>
          <option value="custom">Custom</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Markdown Input</label>
          <textarea value={input} onChange={(e) => { setInput(e.target.value); setExample("custom"); }} rows={8} spellCheck={false}
            className="w-full rounded-lg border border-surface-200 bg-white p-3 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted" />
          <div className="flex justify-between text-xs text-surface-400 dark:text-dark-muted mt-1">
            <span>
              <input ref={fileRef} type="file" accept=".md,.markdown" onChange={handleFile} className="hidden" />
              <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1 text-brand-500 hover:text-brand-600"><Upload className="w-3 h-3" /> Upload .md</button>
            </span>
            <span>{wordCount} words &middot; {readTime}</span>
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
                dangerouslySetInnerHTML={{ __html: safeSanitize(output) || "<p style='color:#999'>Preview will appear here</p>" }} />
            )}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-dark-muted cursor-pointer">
          <input type="checkbox" checked={gfm} onChange={(e) => setGfm(e.target.checked)} className="rounded border-surface-300" /> GFM (tables, tasks, autolinks)
        </label>
        <label className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-dark-muted cursor-pointer">
          <input type="checkbox" checked={highlight} onChange={(e) => setHighlight(e.target.checked)} className="rounded border-surface-300" /> Code highlighting
        </label>
        <label className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-dark-muted cursor-pointer">
          <input type="checkbox" checked={smartypants} onChange={(e) => setSmartypants(e.target.checked)} className="rounded border-surface-300" /> Smart typography
        </label>
        <label className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-dark-muted cursor-pointer">
          <input type="checkbox" checked={sanitize} onChange={(e) => setSanitize(e.target.checked)} className="rounded border-surface-300" /> Sanitize HTML
        </label>
        <label className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-dark-muted cursor-pointer">
          <input type="checkbox" checked={smartLines} onChange={(e) => setSmartLines(e.target.checked)} className="rounded border-surface-300" /> Smart line breaks
        </label>
        <label className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-dark-muted cursor-pointer">
          <input type="checkbox" checked={headerIds} onChange={(e) => setHeaderIds(e.target.checked)} className="rounded border-surface-300" /> Header IDs
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
        <button onClick={copy} disabled={!output} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-40 transition-colors" aria-label="Copy HTML">Copy HTML</button>
        <button onClick={download} disabled={!output} className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 disabled:opacity-40 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors" aria-label="Download HTML">Download HTML</button>
        <button onClick={clear} className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors">Clear</button>
      </div>
    </div>
  );
}
