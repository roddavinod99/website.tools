"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";

type Mode = "escape" | "unescape";
type EscapeType = "javascript" | "json" | "html" | "xml" | "url" | "csv" | "regex" | "c" | "java" | "python" | "sql-single" | "sql-double";
type CharTarget = "all-non-ascii" | "special" | "custom";

const MAX_INPUT_SIZE = 1_000_000;

const ESCAPE_HANDLERS: Record<EscapeType, { escape: (s: string) => string; unescape: (s: string) => string; label: string }> = {
  javascript: {
    escape: (s) => s.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t").replace(/\f/g, "\\f").replace(/\b/g, "\\b").replace(/[{]/g, "\\{").replace(/[}]/g, "\\}").replace(/[$]/g, "\\$"),
    unescape: (s) => s.replace(/\\(['"\\{}${}])/g, "$1").replace(/\\n/g, "\n").replace(/\\r/g, "\r").replace(/\\t/g, "\t").replace(/\\f/g, "\f").replace(/\\b/g, "\b"),
    label: "JavaScript",
  },
  json: {
    escape: (s) => JSON.stringify(s).slice(1, -1),
    unescape: (s) => JSON.parse(`"${s}"`),
    label: "JSON",
  },
  html: {
    escape: (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;"),
    unescape: (s) => { const doc = new DOMParser().parseFromString(s, "text/html"); return doc.documentElement.textContent || ""; },
    label: "HTML",
  },
  xml: {
    escape: (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;"),
    unescape: (s) => { const doc = new DOMParser().parseFromString(s, "text/xml"); return doc.documentElement.textContent || ""; },
    label: "XML",
  },
  url: {
    escape: (s) => encodeURIComponent(s),
    unescape: (s) => decodeURIComponent(s),
    label: "URL",
  },
  csv: {
    escape: (s) => {
      if (s.includes(",") || s.includes('"') || s.includes("\n") || s.includes("\r")) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    },
    unescape: (s) => {
      if (s.startsWith('"') && s.endsWith('"')) {
        return s.slice(1, -1).replace(/""/g, '"');
      }
      return s;
    },
    label: "CSV",
  },
  regex: {
    escape: (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
    unescape: (s) => s.replace(/\\([.*+?^${}()|[\]\\])/g, "$1"),
    label: "Regex",
  },
  c: {
    escape: (s) => s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t").replace(/\0/g, "\\0").replace(/\f/g, "\\f").replace(/\b/g, "\\b"),
    unescape: (s) => s.replace(/\\(["\\])/g, "$1").replace(/\\n/g, "\n").replace(/\\r/g, "\r").replace(/\\t/g, "\t").replace(/\\0/g, "\0").replace(/\\f/g, "\f").replace(/\\b/g, "\b"),
    label: "C/C++",
  },
  java: {
    escape: (s) => s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t").replace(/\f/g, "\\f").replace(/\b/g, "\\b").replace(/'/g, "\\'"),
    unescape: (s) => s.replace(/\\(["'\\])/g, "$1").replace(/\\n/g, "\n").replace(/\\r/g, "\r").replace(/\\t/g, "\t").replace(/\\f/g, "\f").replace(/\\b/g, "\b"),
    label: "Java",
  },
  python: {
    escape: (s) => s.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t").replace(/\f/g, "\\f").replace(/\b/g, "\\b"),
    unescape: (s) => s.replace(/\\(["'\\])/g, "$1").replace(/\\n/g, "\n").replace(/\\r/g, "\r").replace(/\\t/g, "\t").replace(/\\f/g, "\f").replace(/\\b/g, "\b"),
    label: "Python",
  },
  "sql-single": {
    escape: (s) => s.replace(/'/g, "''").replace(/\\/g, "\\\\"),
    unescape: (s) => s.replace(/''/g, "'").replace(/\\\\/g, "\\"),
    label: "SQL (Single)",
  },
  "sql-double": {
    escape: (s) => s.replace(/"/g, '""').replace(/\\/g, "\\\\"),
    unescape: (s) => s.replace(/""/g, '"').replace(/\\\\/g, "\\"),
    label: "SQL (Double)",
  },
};

function detectFormat(input: string): EscapeType | null {
  if (/^%[0-9a-fA-F]{2}/.test(input) || /%[0-9a-fA-F]{2}/.test(input)) return "url";
  if (/&(?:amp|lt|gt|quot|apos|#[xX][0-9a-fA-F]+|#\d+);/.test(input)) return "html";
  if (/\\u[0-9a-fA-F]{4}/.test(input)) return "javascript";
  if (/\\[.*+?^${}()|[\]\\]/.test(input) && /[.*+?^${}()|[\]\\]/.test(input.replace(/\\./g, ""))) return "regex";
  if (input.startsWith('"') && input.endsWith('"') && !input.includes("\n")) return "csv";
  if (/\\[nrtbf0]/.test(input)) return "c";
  return null;
}

function escapeWithUnicode(str: string, handler: { escape: (s: string) => string; unescape: (s: string) => string }, enableUnicode: boolean, preserveNewlines: boolean): string {
  let result = handler.escape(str);
  if (enableUnicode) {
    result = result.split("").map((c) => {
      if (c.charCodeAt(0) > 127) {
        return `\\u${c.charCodeAt(0).toString(16).padStart(4, "0")}`;
      }
      return c;
    }).join("");
  }
  if (preserveNewlines) {
    result = result.replace(/\\n/g, "\n").replace(/\\r/g, "\r");
  }
  return result;
}

function unescapeWithUnicode(str: string, handler: { escape: (s: string) => string; unescape: (s: string) => string }, enableUnicode: boolean): string {
  let result = str;
  if (enableUnicode) {
    result = result.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  }
  return handler.unescape(result);
}

const CHAR_MAP: Partial<Record<EscapeType, Record<string, string>>> = {
  javascript: { "\\": "\\\\", "'": "\\'", '"': '\\"', "\n": "\\n", "\r": "\\r", "\t": "\\t" },
  json: { "\\": "\\\\", '"': '\\"', "\n": "\\n", "\r": "\\r", "\t": "\\t" },
  html: { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" },
  xml: { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" },
  url: { " ": "%20", '"': "%22", "#": "%23", "%": "%25", "&": "%26" },
  regex: { ".": "\\.", "*": "\\*", "+": "\\+", "?": "\\?", "^": "\\^", "$": "\\$", "{": "\\{", "}": "\\}", "(": "\\(", ")": "\\)", "|": "\\|", "[": "\\[", "]": "\\]", "\\": "\\\\" },
  "sql-single": { "'": "''", "\\": "\\\\" },
  "sql-double": { '"': '""', "\\": "\\\\" },
};

export function EscapeUnescape() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState<Mode>("escape");
  const [type, setType] = useState<EscapeType>("javascript");
  const [charTarget, setCharTarget] = useState<CharTarget>("special");
  const [customChars, setCustomChars] = useState("");
  const [unicodeEscaping, setUnicodeEscaping] = useState(false);
  const [preserveNewlines, setPreserveNewlines] = useState(false);
  const [showSizeWarning, setShowSizeWarning] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const convert = useCallback(() => {
    setError("");
    setShowSizeWarning(false);
    if (!input.trim()) { setOutput(""); return; }
    if (input.length > MAX_INPUT_SIZE) {
      setShowSizeWarning(true);
      setOutput("");
      return;
    }
    try {
      const handler = ESCAPE_HANDLERS[type];
      let result: string;
      if (mode === "escape") {
        if (charTarget === "all-non-ascii") {
          result = escapeWithUnicode(input, handler, true, preserveNewlines);
        } else if (charTarget === "custom" && customChars) {
          const set = new Set(customChars.split(""));
          result = input.split("").map((c) => {
            if (set.has(c)) return escapeWithUnicode(c, handler, unicodeEscaping, preserveNewlines);
            return c;
          }).join("");
        } else {
          result = escapeWithUnicode(input, handler, unicodeEscaping, preserveNewlines);
        }
      } else {
        result = unescapeWithUnicode(input, handler, unicodeEscaping);
      }
      setOutput(result);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Conversion failed";
      let suggestion = "";
      if (type === "url" && msg.includes("URI")) suggestion = "Tip: Ensure the input is a valid URL-encoded string";
      if (type === "json" && msg.includes("parse")) suggestion = "Tip: Check for properly escaped JSON characters";
      if (type === "html" && msg.includes("parse")) suggestion = "Tip: Ensure all HTML entities are complete (&name; or &#code;)";
      setError(suggestion ? `${msg}. ${suggestion}` : msg);
      setOutput("");
    }
  }, [input, mode, type, charTarget, customChars, unicodeEscaping, preserveNewlines]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(convert, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [convert]);

  const copy = async () => { if (output) await navigator.clipboard.writeText(output); };

  const swapMode = () => {
    setMode(mode === "escape" ? "unescape" : "escape");
    setInput(output);
    setOutput(input);
  };

  const charMap = useMemo(() => {
    const map = CHAR_MAP[type];
    if (!map || mode !== "escape") return [];
    return Object.entries(map).filter(([c]) => input.includes(c));
  }, [type, input, mode]);

  const stats = useMemo(() => {
    if (!input || !output) return null;
    const inputChars = input.length;
    const outputChars = output.length;
    const escapedCount = output.split("").filter((_, i) => output[i] !== input[i]).length;
    return { inputChars, outputChars, escapedCount };
  }, [input, output]);

  const detectedFormat = useMemo(() => {
    if (!input.trim()) return null;
    return detectFormat(input);
  }, [input]);

  const escapeTypes = Object.keys(ESCAPE_HANDLERS) as EscapeType[];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(["escape", "unescape"] as Mode[]).map((m) => (
          <button key={m} onClick={() => { setMode(m); setError(""); }}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${mode === m ? "bg-brand-500 text-white" : "border border-surface-200 text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface"}`}>
            {m === "escape" ? "Escape" : "Unescape"}
          </button>
        ))}
        <button onClick={swapMode} className="rounded-lg border border-surface-200 px-3 py-1.5 text-xs font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface">
          Swap ⇄
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <select value={type} onChange={(e) => setType(e.target.value as EscapeType)}
          className="rounded-lg border border-surface-200 bg-white px-3 py-1.5 text-xs font-medium text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
          {escapeTypes.map((t) => (
            <option key={t} value={t}>{ESCAPE_HANDLERS[t].label}</option>
          ))}
        </select>
      </div>

      {detectedFormat && detectedFormat !== type && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-2 dark:border-blue-800 dark:bg-blue-900/20">
          <p className="text-xs text-blue-700 dark:text-blue-400">
            Detected format: {ESCAPE_HANDLERS[detectedFormat].label}.
            <button onClick={() => setType(detectedFormat)} className="ml-1 underline hover:no-underline">Switch?</button>
          </p>
        </div>
      )}

      {mode === "escape" && (
        <div className="flex flex-wrap gap-2">
          {(["special", "all-non-ascii", "custom"] as CharTarget[]).map((t) => (
            <button key={t} onClick={() => setCharTarget(t)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${charTarget === t ? "bg-brand-500 text-white" : "border border-surface-200 text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface"}`}>
              {t === "special" ? "Special Chars" : t === "all-non-ascii" ? "Non-ASCII" : "Specific Chars"}
            </button>
          ))}
          {charTarget === "custom" && (
            <input type="text" value={customChars} onChange={(e) => setCustomChars(e.target.value)}
              placeholder="Chars to escape..."
              className="rounded-lg border border-surface-200 bg-white px-2 py-1 text-xs font-mono text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text w-40" />
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <label className="flex items-center gap-1.5 rounded-lg border border-surface-200 px-3 py-1.5 text-xs text-surface-700 dark:border-dark-border dark:text-dark-text">
          <input type="checkbox" checked={unicodeEscaping} onChange={(e) => setUnicodeEscaping(e.target.checked)} className="rounded border-surface-300 text-brand-500 focus:ring-brand-400" />
          Unicode \uXXXX
        </label>
        <label className="flex items-center gap-1.5 rounded-lg border border-surface-200 px-3 py-1.5 text-xs text-surface-700 dark:border-dark-border dark:text-dark-text">
          <input type="checkbox" checked={preserveNewlines} onChange={(e) => setPreserveNewlines(e.target.checked)} className="rounded border-surface-300 text-brand-500 focus:ring-brand-400" />
          Preserve newlines
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Input</label>
        <textarea value={input} onChange={(e) => setInput(e.target.value)}
          placeholder={mode === "escape" ? "Enter text to escape..." : "Enter escaped text..."}
          rows={4} spellCheck={false}
          className="w-full rounded-lg border border-surface-200 bg-white p-3 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted" />
      </div>

      {showSizeWarning && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20">
          <p className="text-sm text-amber-700 dark:text-amber-400">Input exceeds 1MB limit. Please reduce input size.</p>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {output && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-surface-700 dark:text-dark-text">
              {mode === "escape" ? "Escaped Output" : "Unescaped Output"}
            </label>
            <button onClick={copy} className="rounded bg-brand-500 px-2 py-0.5 text-xs text-white hover:bg-brand-600">Copy</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-surface-400 dark:text-dark-muted mb-1">Original</p>
              <pre className="rounded-lg border border-surface-200 bg-white p-2 text-xs font-mono text-surface-900 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text overflow-auto max-h-32 break-all">{input}</pre>
            </div>
            <div>
              <p className="text-xs text-surface-400 dark:text-dark-muted mb-1">{mode === "escape" ? "Escaped" : "Unescaped"}</p>
              <pre className="rounded-lg border border-surface-200 bg-surface-50 p-2 text-xs font-mono text-surface-900 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text overflow-auto max-h-32 break-all select-all">{output}</pre>
            </div>
          </div>
        </div>
      )}

      {stats && (
        <div className="flex gap-3 text-xs text-surface-500 dark:text-dark-muted">
          <span>Chars: {stats.inputChars}</span>
          <span>Output chars: {stats.outputChars}</span>
          <span>Escaped chars: {Math.abs(stats.outputChars - stats.inputChars)}</span>
        </div>
      )}

      {charMap.length > 0 && (
        <div>
          <p className="text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">Character Map</p>
          <div className="flex flex-wrap gap-1">
            {charMap.map(([char, escaped]) => (
              <span key={char} className="inline-flex items-center gap-1 rounded bg-surface-100 px-2 py-0.5 text-xs font-mono text-surface-700 dark:bg-dark-surface dark:text-dark-text">
                <span className="text-surface-900 dark:text-dark-text">{char === " " ? "␣" : char === "\n" ? "\\n" : char === "\r" ? "\\r" : char === "\t" ? "\\t" : char}</span>
                <span className="text-surface-400">→</span>
                <span className="text-brand-500">{escaped}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
