"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";

type Mode = "escape" | "unescape";
type EscapeType = "javascript" | "json" | "html" | "url" | "sql-single" | "sql-double" | "csv";
type CharTarget = "all-non-ascii" | "special" | "custom";

const ESCAPE_HANDLERS: Record<EscapeType, { escape: (s: string) => string; unescape: (s: string) => string; label: string }> = {
  javascript: {
    escape: (s) => s.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t").replace(/\f/g, "\\f").replace(/\b/g, "\\b").replace(/[{]/g, "\\{").replace(/[}]/g, "\\}").replace(/[$]/g, "\\$"),
    unescape: (s) => s.replace(/\\(['"\\{}${}])/g, "$1").replace(/\\n/g, "\n").replace(/\\r/g, "\r").replace(/\\t/g, "\t").replace(/\\f/g, "\f").replace(/\\b/g, "\b"),
    label: "JavaScript",
  },
  json: {
    escape: (s) => s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t").replace(/\f/g, "\\f").replace(/\b/g, "\\b").replace(/[{]/g, "\\{").replace(/[}]/g, "\\}"),
    unescape: (s) => s.replace(/\\(["\\/{}])/g, "$1").replace(/\\n/g, "\n").replace(/\\r/g, "\r").replace(/\\t/g, "\t").replace(/\\f/g, "\f").replace(/\\b/g, "\b"),
    label: "JSON",
  },
  html: {
    escape: (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;"),
    unescape: (s) => { const doc = new DOMParser().parseFromString(s, "text/html"); return doc.documentElement.textContent || ""; },
    label: "HTML",
  },
  url: {
    escape: (s) => encodeURIComponent(s),
    unescape: (s) => decodeURIComponent(s),
    label: "URL",
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
};

const CHAR_MAP: Partial<Record<EscapeType, Record<string, string>>> = {
  javascript: { "\\": "\\\\", "'": "\\'", '"': '\\"', "\n": "\\n", "\r": "\\r", "\t": "\\t" },
  json: { "\\": "\\\\", '"': '\\"', "\n": "\\n", "\r": "\\r", "\t": "\\t" },
  html: { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" },
  url: { " ": "%20", '"': "%22", "#": "%23", "%": "%25", "&": "%26" },
  "sql-single": { "'": "''", "\\": "\\\\" },
  "sql-double": { '"': '""', "\\": "\\\\" },
};

function escapeWithTarget(str: string, type: EscapeType, charTarget: CharTarget, customChars: string): string {
  const handler = ESCAPE_HANDLERS[type];
  if (charTarget === "special") return handler.escape(str);
  if (charTarget === "all-non-ascii") {
    return str.split("").map((c) => {
      if (c.charCodeAt(0) > 127) {
        if (type === "javascript" || type === "json") return `\\u${c.charCodeAt(0).toString(16).padStart(4, "0")}`;
        if (type === "url") return encodeURIComponent(c);
        return c;
      }
      return c;
    }).join("");
  }
  if (charTarget === "custom" && customChars) {
    const set = new Set(customChars.split(""));
    return str.split("").map((c) => {
      if (set.has(c)) return handler.escape(c);
      return c;
    }).join("");
  }
  return handler.escape(str);
}

export function EscapeUnescape() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState<Mode>("escape");
  const [type, setType] = useState<EscapeType>("javascript");
  const [charTarget, setCharTarget] = useState<CharTarget>("special");
  const [customChars, setCustomChars] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const convert = useCallback(() => {
    setError("");
    if (!input.trim()) { setOutput(""); return; }
    try {
      const handler = ESCAPE_HANDLERS[type];
      let result: string;
      if (mode === "escape") {
        result = escapeWithTarget(input, type, charTarget, customChars);
      } else {
        try {
          result = handler.unescape(input);
        } catch {
          if (type === "url") result = decodeURI(input);
          else throw new Error("Failed to unescape input");
        }
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
  }, [input, mode, type, charTarget, customChars]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(convert, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [convert]);

  const copy = async () => { if (output) await navigator.clipboard.writeText(output); };

  const charMap = useMemo(() => {
    const map = CHAR_MAP[type];
    if (!map || mode !== "escape") return [];
    return Object.entries(map).filter(([c]) => input.includes(c));
  }, [type, input, mode]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(["escape", "unescape"] as Mode[]).map((m) => (
          <button key={m} onClick={() => { setMode(m); setError(""); }}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${mode === m ? "bg-brand-500 text-white" : "border border-surface-200 text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface"}`}>
            {m === "escape" ? "Escape" : "Unescape"}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {(Object.keys(ESCAPE_HANDLERS) as EscapeType[]).map((t) => (
          <button key={t} onClick={() => setType(t)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${type === t ? "bg-brand-500 text-white" : "border border-surface-200 text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface"}`}>
            {ESCAPE_HANDLERS[t].label}
          </button>
        ))}
      </div>

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

      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Input</label>
        <textarea value={input} onChange={(e) => setInput(e.target.value)}
          placeholder={mode === "escape" ? "Enter text to escape..." : "Enter escaped text..."}
          rows={4} spellCheck={false}
          className="w-full rounded-lg border border-surface-200 bg-white p-3 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted" />
      </div>

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
              <p className="text-xs text-surface-400 dark:text-dark-muted mb-1">Escaped</p>
              <pre className="rounded-lg border border-surface-200 bg-surface-50 p-2 text-xs font-mono text-surface-900 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text overflow-auto max-h-32 break-all select-all">{output}</pre>
            </div>
          </div>
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
