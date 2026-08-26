"use client";

import { useState, useCallback, useRef, useEffect } from "react";

type Unit = "paragraphs" | "sentences" | "words" | "characters" | "bytes";
type ParagraphStyle = "standard" | "short" | "medium" | "long";
type StartingText = "lorem" | "cicero" | "custom";
type CodeSampleType = "none" | "html" | "css" | "js" | "json" | "sql";
type IpsumStyle = "lorem" | "tech" | "hipster" | "cicero";

const LOREM_WORDS = [
  "a", "ac", "accumsan", "ad", "adipiscing", "aenean", "aliquam", "aliquet",
  "amet", "ante", "aptent", "arcu", "at", "auctor", "bibendum", "blandit",
  "class", "commodo", "condimentum", "congue", "consectetur", "consequat",
  "conubia", "convallis", "cras", "cubilia", "cum", "curabitur", "curae",
  "dapibus", "diam", "dictum", "dictumst", "dignissim", "dolor", "donec",
  "dui", "duis", "egestas", "eget", "eleifend", "elementum", "elit", "enim",
  "erat", "eros", "est", "et", "etiam", "eu", "euismod", "facilisi", "faucibus",
  "felis", "fermentum", "feugiat", "fringilla", "fusce", "gravida", "habitant",
  "habitasse", "hac", "hendrerit", "himenaeos", "iaculis", "id", "imperdiet",
  "in", "inceptos", "integer", "interdum", "ipsum", "justo", "lacinia", "lacus",
  "laoreet", "lectus", "leo", "ligula", "litora", "lobortis", "lorem", "luctus",
  "maecenas", "magna", "magnis", "malesuada", "massa", "mattis", "mauris",
  "metus", "mi", "molestie", "mollis", "montes", "morbi", "mus", "nam",
  "nascetur", "natoque", "nec", "neque", "netus", "nisi", "nisl", "non",
  "nostra", "nulla", "nullam", "nunc", "odio", "orci", "ornare", "parturient",
  "pellentesque", "penatibus", "per", "pharetra", "phasellus", "placerat",
  "platea", "porta", "porttitor", "posuere", "potenti", "praesent", "pretium",
  "primis", "proin", "pulvinar", "purus", "quam", "quis", "quisque", "rhoncus",
  "ridiculus", "risus", "rutrum", "sagittis", "sapien", "scelerisque", "sed",
  "sem", "semper", "senectus", "sit", "sociis", "sociosqu", "sodales",
  "sollicitudin", "suscipit", "suspendisse", "taciti", "tellus", "tempor",
  "tempus", "tincidunt", "torquent", "tortor", "turpis", "ullamcorper",
  "ultrices", "ultricies", "urna", "varius", "vehicula", "vel", "velit",
  "venenatis", "vestibulum", "vitae", "vivamus", "viverra", "volutpat",
  "vulputate",
];

const TECH_WORDS = [
  "api", "async", "await", "backend", "cache", "callback", "cloud", "cluster",
  "container", "database", "deploy", "docker", "endpoint", "encryption", "event",
  "firewall", "framework", "frontend", "gateway", "hash", "http", "https", "inline",
  "instance", "interface", "javascript", "json", "kernel", "lambda", "latency",
  "library", "load", "microservice", "middleware", "module", "namespace", "network",
  "node", "npm", "parse", "pipeline", "protocol", "proxy", "query", "queue",
  "request", "response", "route", "scalable", "schema", "sdk", "server", "socket",
  "state", "store", "stream", "string", "syntax", "thread", "token", "url",
  "variable", "virtual", "webhook", "websocket", "worker", "xml", "yaml", "zero",
];

const HIPSTER_WORDS = [
  "artisan", "authentic", "biodynamic", "blog", "brew", "chill", "craft", "creative",
  "curated", "dreamy", "echo", "ethical", "fair", "farm", "fermented", "folk",
  "free", "fusion", "gluten", "handmade", "hip", "humble", "indie", "kale",
  "kombucha", "local", "minimal", "natural", "nomad", "organic", "passion",
  "photo", "pixel", "plant", "pour", "raw", "recycle", "retro", "roast",
  "rustic", "sailor", "small", "soul", "sourdough", "sustainable", "tiny",
  "toast", "upcycle", "urban", "vegan", "vibe", "vintage", "wooden", "yoga",
];

const CICERO_START = "Quo usque tandem abutere, Catilina, patientia nostra? quam diu etiam furor iste tuus nos eludet? quem ad finem sese effrenata iactabit audacia?";

const PARAGRAPH_LENGTHS: Record<ParagraphStyle, [number, number]> = {
  standard: [3, 7],
  short: [2, 4],
  medium: [5, 10],
  long: [8, 16],
};

const CAP = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function pickWord(dict: string[]): string {
  return dict[Math.floor(Math.random() * dict.length)];
}

function makeWords(n: number, dict: string[]): string[] {
  return Array.from({ length: n }, () => pickWord(dict));
}

function makeSentence(minW: number, maxW: number, dict: string[]): string {
  const n = Math.floor(Math.random() * (maxW - minW + 1)) + minW;
  const words = makeWords(n, dict);
  words[0] = CAP(words[0]);
  return words.join(" ") + ".";
}

function makeParagraph(minS: number, maxS: number, dict: string[]): string {
  const n = Math.floor(Math.random() * (maxS - minS + 1)) + minS;
  return Array.from({ length: n }, () => makeSentence(8, 20, dict)).join(" ");
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

function getDict(style: IpsumStyle): string[] {
  switch (style) {
    case "tech": return TECH_WORDS;
    case "hipster": return HIPSTER_WORDS;
    case "cicero": return LOREM_WORDS;
    default: return LOREM_WORDS;
  }
}

export function LoremIpsum() {
  const [unit, setUnit] = useState<Unit>("paragraphs");
  const [count, setCount] = useState(3);
  const [starting, setStarting] = useState<StartingText>("lorem");
  const [customStart, setCustomStart] = useState("");
  const [paragraphStyle, setParagraphStyle] = useState<ParagraphStyle>("standard");
  const [htmlOutput, setHtmlOutput] = useState(false);
  const [markdownOutput, setMarkdownOutput] = useState(false);
  const [codeSample, setCodeSample] = useState<CodeSampleType>("none");
  const [output, setOutput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [ipsumStyle, setIpsumStyle] = useState<IpsumStyle>("lorem");
  const [loremStart, setLoremStart] = useState(true);
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

    const dict = getDict(ipsumStyle);
    let result = "";
    if (unit === "bytes") {
      const text = makeSentence(5, 15, dict);
      const encoded = new TextEncoder().encode(text);
      result = Array.from(encoded).map((b) => b.toString(16).padStart(2, "0")).join(" ");
    } else if (unit === "words") {
      const words = makeWords(count, dict);
      words[0] = CAP(words[0]);
      result = words.join(" ") + ".";
      if (htmlOutput) result = `<p>${result}</p>`;
    } else if (unit === "characters") {
      let text = "";
      while (text.length < count) {
        text += makeSentence(8, 20, dict) + " ";
      }
      result = text.slice(0, count);
      if (htmlOutput) result = `<p>${result}</p>`;
    } else if (unit === "sentences") {
      const sents = Array.from({ length: count }, () => makeSentence(8, 20, dict));
      result = sents.join(" ");
      if (htmlOutput) result = sents.map((s) => `<p>${s}</p>`).join("\n");
      else if (markdownOutput) result = sents.map((s) => `${s}\n`).join("");
    } else {
      const [minS, maxS] = PARAGRAPH_LENGTHS[paragraphStyle];
      const paras: string[] = [];
      const totalParas = count;
      let startIdx = 0;
      if (loremStart && ipsumStyle === "lorem") {
        paras.push("Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.");
        startIdx = 1;
      } else if (starting === "cicero") {
        paras.push(CICERO_START);
        startIdx = 1;
      } else if (starting === "custom" && customStart.trim()) {
        paras.push(customStart.trim());
        startIdx = 1;
      }
      for (let i = 0; i < totalParas - startIdx; i++) {
        paras.push(makeParagraph(minS, maxS, dict));
      }
      if (htmlOutput) result = paras.map((p) => `<p>${p}</p>`).join("\n");
      else if (markdownOutput) {
        result = paras.map((p) => `${p}\n`).join("");
      } else result = paras.join("\n\n");
    }
    setOutput(result);
    setCharCount(result.length);
    setWordCount(result.split(/\s+/).filter(Boolean).length);
    setHistory((p) => [result.slice(0, 200), ...p].slice(0, 20));
  }, [unit, count, starting, customStart, paragraphStyle, htmlOutput, markdownOutput, codeSample, ipsumStyle, loremStart]);

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
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Style</label>
          <select value={ipsumStyle} onChange={(e) => setIpsumStyle(e.target.value as IpsumStyle)}
            className="rounded-lg border border-surface-200 bg-white p-2 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value="lorem">Lorem Ipsum (classic)</option>
            <option value="tech">Tech Ipsum</option>
            <option value="hipster">Hipster Ipsum</option>
            <option value="cicero">Cicero (original Latin)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Type</label>
          <select value={unit} onChange={(e) => setUnit(e.target.value as Unit)}
            className="rounded-lg border border-surface-200 bg-white p-2 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value="paragraphs">Paragraphs</option>
            <option value="sentences">Sentences</option>
            <option value="words">Words</option>
            <option value="characters">Characters</option>
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
        {unit === "paragraphs" && ipsumStyle === "lorem" && (
          <label className="flex items-center gap-2 text-sm text-surface-700 dark:text-dark-text">
            <input type="checkbox" checked={loremStart} onChange={(e) => setLoremStart(e.target.checked)} className="accent-brand-500" />
            Start with &ldquo;Lorem ipsum dolor sit amet&hellip;&rdquo;
          </label>
        )}
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
