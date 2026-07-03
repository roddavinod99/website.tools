"use client";

import { useState, useCallback, useRef, useEffect } from "react";

type Unit = "paragraphs" | "sentences" | "words" | "bytes";
type ParagraphStyle = "standard" | "short" | "medium" | "long";
type StartingText = "lorem" | "cicero" | "custom";
type CodeSampleType = "none" | "html" | "css" | "js" | "json" | "sql";

const LOREM_WORDS = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
  "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
  "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud",
  "exercitation", "ullamco", "laboris", "nisi", "ut", "aliquip", "ex", "ea",
  "commodo", "consequat", "duis", "aute", "irure", "dolor", "in", "reprehenderit",
  "in", "voluptate", "velit", "esse", "cillum", "dolore", "eu", "fugiat", "nulla",
  "pariatur", "excepteur", "sint", "occaecat", "cupidatat", "non", "proident",
  "sunt", "in", "culpa", "qui", "officia", "deserunt", "mollit", "anim", "id",
  "est", "laborum",
];

const CICERO_START = "Quo usque tandem abutere, Catilina, patientia nostra? quam diu etiam furor iste tuus nos eludet? quem ad finem sese effrenata iactabit audacia?";

const PARAGRAPH_LENGTHS: Record<ParagraphStyle, [number, number]> = {
  standard: [3, 7],
  short: [2, 4],
  medium: [5, 10],
  long: [8, 16],
};

const RICH_WORDS = [
  { w: "lorem", bold: false }, { w: "ipsum", bold: true }, { w: "dolor", bold: false },
  { w: "sit", bold: false }, { w: "amet", bold: false }, { w: "consectetur", bold: false },
  { w: "adipiscing", bold: false }, { w: "elit", bold: false }, { w: "sed", bold: false },
  { w: "do", bold: false }, { w: "eiusmod", bold: false }, { w: "tempor", bold: true },
  { w: "incididunt", bold: false }, { w: "ut", bold: false }, { w: "labore", bold: false },
  { w: "et", bold: false }, { w: "dolore", bold: false }, { w: "magna", bold: false },
  { w: "aliqua", bold: false }, { w: "enim", bold: false }, { w: "ad", bold: false },
  { w: "minim", bold: false }, { w: "veniam", bold: true }, { w: "quis", bold: false },
  { w: "nostrud", bold: false }, { w: "exercitation", bold: false }, { w: "ullamco", bold: false },
  { w: "laboris", bold: false }, { w: "nisi", bold: false }, { w: "ut", bold: false },
  { w: "aliquip", bold: false }, { w: "ex", bold: false }, { w: "ea", bold: false },
  { w: "commodo", bold: false }, { w: "consequat", bold: false }, { w: "duis", bold: false },
  { w: "aute", bold: false }, { w: "irure", bold: false }, { w: "dolor", bold: false },
  { w: "in", bold: false }, { w: "reprehenderit", bold: false }, { w: "in", bold: false },
  { w: "voluptate", bold: true }, { w: "velit", bold: false }, { w: "esse", bold: false },
  { w: "cillum", bold: false }, { w: "dolore", bold: false }, { w: "eu", bold: false },
  { w: "fugiat", bold: false }, { w: "nulla", bold: false }, { w: "pariatur", bold: false },
  { w: "excepteur", bold: false }, { w: "sint", bold: false }, { w: "occaecat", bold: false },
  { w: "cupidatat", bold: true }, { w: "non", bold: false }, { w: "proident", bold: false },
  { w: "sunt", bold: false }, { w: "in", bold: false }, { w: "culpa", bold: false },
  { w: "qui", bold: false }, { w: "officia", bold: false }, { w: "deserunt", bold: false },
  { w: "mollit", bold: false }, { w: "anim", bold: false }, { w: "id", bold: false },
  { w: "est", bold: false }, { w: "laborum", bold: false },
];

const CAP = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function makeWords(n: number): string[] {
  return Array.from({ length: n }, () => LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)]);
}

function makeSentence(minW: number, maxW: number, rich?: boolean): string {
  const n = Math.floor(Math.random() * (maxW - minW + 1)) + minW;
  if (rich) {
    const words = Array.from({ length: n }, () => RICH_WORDS[Math.floor(Math.random() * RICH_WORDS.length)]);
    const parts = words.map((w, i) => {
      let t = w.w;
      if (i === 0) t = CAP(t);
      if (w.bold) t = `<strong>${t}</strong>`;
      if (Math.random() < 0.08) t = `<a href="#">${t}</a>`;
      if (Math.random() < 0.05) t = `<em>${t}</em>`;
      return t;
    });
    return parts.join(" ") + ".";
  }
  const words = makeWords(n);
  words[0] = CAP(words[0]);
  return words.join(" ") + ".";
}

function makeParagraph(minS: number, maxS: number, rich?: boolean): string {
  const n = Math.floor(Math.random() * (maxS - minS + 1)) + minS;
  return Array.from({ length: n }, () => makeSentence(8, 20, rich)).join(" ");
}

function makeCodeSample(type: CodeSampleType): string {
  switch (type) {
    case "html": return "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <title>Lorem Ipsum</title>\n</head>\n<body>\n  <p>Lorem ipsum dolor sit amet.</p>\n</body>\n</html>";
    case "css": return "body {\n  font-family: 'Lorem', sans-serif;\n  color: #ipsum;\n  margin: 0;\n  padding: 2rem;\n}";
    case "js": return "function loremIpsum(count) {\n  const words = ['lorem','ipsum','dolor'];\n  return Array.from({ length: count },\n    () => words[Math.floor(Math.random() * words.length)]\n  ).join(' ');\n}";
    case "json": return '{\n  "lorem": "ipsum",\n  "dolor": {\n    "sit": "amet",\n    "consectetur": [1, 2, 3]\n  }\n}';
    case "sql": return "INSERT INTO lorem_ipsum (id, text) VALUES\n(1, 'Lorem ipsum dolor sit amet'),\n(2, 'Consectetur adipiscing elit');";
    default: return "";
  }
}

export function LoremIpsum() {
  const [unit, setUnit] = useState<Unit>("paragraphs");
  const [count, setCount] = useState(3);
  const [starting, setStarting] = useState<StartingText>("lorem");
  const [customStart, setCustomStart] = useState("");
  const [paragraphStyle, setParagraphStyle] = useState<ParagraphStyle>("standard");
  const [richFormatting, setRichFormatting] = useState(false);
  const [htmlOutput, setHtmlOutput] = useState(false);
  const [markdownOutput, setMarkdownOutput] = useState(false);
  const [codeSample, setCodeSample] = useState<CodeSampleType>("none");
  const [output, setOutput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const generate = useCallback(() => {
    if (codeSample !== "none") {
      const sample = makeCodeSample(codeSample);
      setOutput(sample);
      setCharCount(sample.length);
      setWordCount(sample.split(/\s+/).length);
      setHistory((p) => [sample.slice(0, 100), ...p].slice(0, 20));
      return;
    }

    let result = "";
    if (unit === "bytes") {
      const text = makeSentence(5, 15);
      const encoded = new TextEncoder().encode(text);
      result = Array.from(encoded).map((b) => b.toString(16).padStart(2, "0")).join(" ");
    } else if (unit === "words") {
      const words = makeWords(count);
      words[0] = CAP(words[0]);
      result = words.join(" ") + ".";
      if (htmlOutput) result = `<p>${result}</p>`;
    } else if (unit === "sentences") {
      const sents = Array.from({ length: count }, () => makeSentence(8, 20, richFormatting));
      result = sents.join(" ");
      if (htmlOutput) result = sents.map((s) => `<p>${s}</p>`).join("\n");
      else if (markdownOutput) result = sents.map((s) => `${s}\n`).join("");
    } else {
      const [minS, maxS] = PARAGRAPH_LENGTHS[paragraphStyle];
      const paras: string[] = [];
      if (starting === "lorem") {
        paras.push("Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.");
      } else if (starting === "cicero") {
        paras.push(CICERO_START);
      } else if (starting === "custom" && customStart.trim()) {
        paras.push(customStart.trim());
      }
      const startCount = starting !== "lorem" && starting !== "cicero" && !customStart.trim() ? 0 : 1;
      const remaining = count - startCount;
      for (let i = 0; i < Math.max(0, remaining); i++) {
        paras.push(makeParagraph(minS, maxS, richFormatting));
      }
      if (htmlOutput) result = paras.map((p) => `<p>${p}</p>`).join("\n");
      else if (markdownOutput) {
        let md = paras.map((p) => `${p}\n`).join("");
        if (richFormatting) md = md.replace(/<strong>(.*?)<\/strong>/g, "**$1**").replace(/<em>(.*?)<\/em>/g, "*$1*").replace(/<a href="#">(.*?)<\/a>/g, "[$1](#)");
        result = md;
      } else result = paras.join("\n\n");
    }
    setOutput(result);
    setCharCount(result.length);
    setWordCount(result.split(/\s+/).filter(Boolean).length);
    setHistory((p) => [result.slice(0, 200), ...p].slice(0, 20));
  }, [unit, count, starting, customStart, paragraphStyle, richFormatting, htmlOutput, markdownOutput, codeSample]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { generate(); }, 200);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [generate]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); generate(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [generate]);

  const copy = async () => {
    if (output) { await navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  const download = (ext: "txt" | "html") => {
    const blob = new Blob([output], { type: ext === "html" ? "text/html" : "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `lorem-ipsum.${ext}`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Type</label>
          <select value={unit} onChange={(e) => setUnit(e.target.value as Unit)}
            className="rounded-lg border border-surface-200 bg-white p-2 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value="paragraphs">Paragraphs</option>
            <option value="sentences">Sentences</option>
            <option value="words">Words</option>
            <option value="bytes">Bytes (hex)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Count</label>
          <input type="number" min={1} max={1000} value={count}
            onChange={(e) => setCount(Math.max(1, Math.min(1000, parseInt(e.target.value) || 1)))}
            className="w-20 rounded-lg border border-surface-200 bg-white p-2 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
        </div>
        {unit === "paragraphs" && (
          <>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Style</label>
              <select value={paragraphStyle} onChange={(e) => setParagraphStyle(e.target.value as ParagraphStyle)}
                className="rounded-lg border border-surface-200 bg-white p-2 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
                <option value="standard">Standard</option>
                <option value="short">Short</option>
                <option value="medium">Medium</option>
                <option value="long">Long</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Start</label>
              <select value={starting} onChange={(e) => setStarting(e.target.value as StartingText)}
                className="rounded-lg border border-surface-200 bg-white p-2 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
                <option value="lorem">Traditional Lorem</option>
                <option value="cicero">Cicero</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </>
        )}
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Code</label>
          <select value={codeSample} onChange={(e) => setCodeSample(e.target.value as CodeSampleType)}
            className="rounded-lg border border-surface-200 bg-white p-2 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value="none">None</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="js">JavaScript</option>
            <option value="json">JSON</option>
            <option value="sql">SQL</option>
          </select>
        </div>
      </div>

      {starting === "custom" && (
        <textarea value={customStart} onChange={(e) => setCustomStart(e.target.value)} placeholder="Enter custom starting text..."
          rows={2}
          className="w-full rounded-lg border border-surface-200 bg-white p-2 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
      )}

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-surface-700 dark:text-dark-text">
          <input type="checkbox" checked={richFormatting} onChange={(e) => setRichFormatting(e.target.checked)} className="accent-brand-500" />
          Rich formatting
        </label>
        <label className="flex items-center gap-2 text-sm text-surface-700 dark:text-dark-text">
          <input type="checkbox" checked={htmlOutput} onChange={(e) => setHtmlOutput(e.target.checked)} className="accent-brand-500" />
          HTML tags
        </label>
        <label className="flex items-center gap-2 text-sm text-surface-700 dark:text-dark-text">
          <input type="checkbox" checked={markdownOutput} onChange={(e) => setMarkdownOutput(e.target.checked)} className="accent-brand-500" />
          Markdown
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={generate} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors">
          Generate (Ctrl+Enter)
        </button>
        <button onClick={copy} className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors">
          {copied ? "Copied!" : "Copy"}
        </button>
        <button onClick={() => download("txt")} className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors">.txt</button>
        <button onClick={() => download("html")} className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors">.html</button>
      </div>

      {output && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-surface-700 dark:text-dark-text">Output</label>
            <div className="flex gap-3 text-xs text-surface-500 dark:text-dark-muted">
              <span><strong>{charCount.toLocaleString()}</strong> chars</span>
              <span><strong>{wordCount.toLocaleString()}</strong> words</span>
            </div>
          </div>
          <textarea ref={textAreaRef} readOnly value={output}
            className="w-full rounded-lg border border-surface-200 bg-surface-50 p-3 text-sm font-mono text-surface-900 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text overflow-auto max-h-80 whitespace-pre-wrap" rows={8} />
        </div>
      )}

      {history.length > 0 && (
        <div className="border-t border-surface-200 pt-3 dark:border-dark-border">
          <p className="text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">History (last 20)</p>
          <div className="max-h-24 overflow-y-auto space-y-1">
            {history.map((h, i) => (
              <button key={i} onClick={() => setOutput(h)}
                className="w-full text-left rounded border border-surface-100 bg-white px-2 py-1 text-xs text-surface-600 hover:bg-surface-50 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:hover:bg-dark-border truncate">
                {h.replace(/<[^>]+>/g, "").slice(0, 80)}...
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
