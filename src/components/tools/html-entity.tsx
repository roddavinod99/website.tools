"use client";

import { useState, useEffect, useRef, useCallback } from "react";

type Mode = "encode" | "decode";
type EntityMode = "named" | "numeric" | "hex";
type Preset = "none" | "body" | "attribute";

const HTML_ENTITY_MAP: Record<string, { named: string; numeric: string; hex: string; desc: string }> = {
  "&": { named: "&amp;", numeric: "&#38;", hex: "&#x26;", desc: "Ampersand" },
  "<": { named: "&lt;", numeric: "&#60;", hex: "&#x3C;", desc: "Less than" },
  ">": { named: "&gt;", numeric: "&#62;", hex: "&#x3E;", desc: "Greater than" },
  '"': { named: "&quot;", numeric: "&#34;", hex: "&#x22;", desc: "Double quote" },
  "'": { named: "&apos;", numeric: "&#39;", hex: "&#x27;", desc: "Single quote" },
  "©": { named: "&copy;", numeric: "&#169;", hex: "&#xA9;", desc: "Copyright" },
  "®": { named: "&reg;", numeric: "&#174;", hex: "&#xAE;", desc: "Registered" },
  "™": { named: "&trade;", numeric: "&#8482;", hex: "&#x2122;", desc: "Trademark" },
  "€": { named: "&euro;", numeric: "&#8364;", hex: "&#x20AC;", desc: "Euro" },
  "£": { named: "&pound;", numeric: "&#163;", hex: "&#xA3;", desc: "Pound" },
  "¥": { named: "&yen;", numeric: "&#165;", hex: "&#xA5;", desc: "Yen" },
  "¢": { named: "&cent;", numeric: "&#162;", hex: "&#xA2;", desc: "Cent" },
  "°": { named: "&deg;", numeric: "&#176;", hex: "&#xB0;", desc: "Degree" },
  "±": { named: "&plusmn;", numeric: "&#177;", hex: "&#xB1;", desc: "Plus-minus" },
  "×": { named: "&times;", numeric: "&#215;", hex: "&#xD7;", desc: "Multiplication" },
  "÷": { named: "&divide;", numeric: "&#247;", hex: "&#xF7;", desc: "Division" },
};

const HTML_SPECIAL = new Set(["&", "<", ">", '"', "'"]);

function encodeEntity(str: string, entityMode: EntityMode, preset: Preset, encodeAll: boolean): string {
  return str.split("").map((c) => {
    if (preset === "attribute") {
      if (c === "&") return entityMode === "named" ? "&amp;" : entityMode === "hex" ? "&#x26;" : "&#38;";
      if (c === '"') return entityMode === "named" ? "&quot;" : entityMode === "hex" ? "&#x22;" : "&#34;";
      if (c === "'") return entityMode === "named" ? "&apos;" : entityMode === "hex" ? "&#x27;" : "&#39;";
      if (c === "<") return entityMode === "named" ? "&lt;" : entityMode === "hex" ? "&#x3C;" : "&#60;";
      if (c === ">") return entityMode === "named" ? "&gt;" : entityMode === "hex" ? "&#x3E;" : "&#62;";
    }
    if (preset === "body") {
      if (c === "&") return entityMode === "named" ? "&amp;" : entityMode === "hex" ? "&#x26;" : "&#38;";
      if (c === "<") return entityMode === "named" ? "&lt;" : entityMode === "hex" ? "&#x3C;" : "&#60;";
      if (c === ">") return entityMode === "named" ? "&gt;" : entityMode === "hex" ? "&#x3E;" : "&#62;";
    }
    if (encodeAll || HTML_SPECIAL.has(c)) {
      const entry = HTML_ENTITY_MAP[c];
      if (entry) {
        if (entityMode === "named") return entry.named;
        if (entityMode === "hex") return entry.hex;
        return entry.numeric;
      }
      if (encodeAll && c.charCodeAt(0) > 127) {
        const code = c.charCodeAt(0);
        if (entityMode === "hex") return `&#x${code.toString(16).toUpperCase()};`;
        return `&#${code};`;
      }
      if (HTML_SPECIAL.has(c)) {
        const code = c.charCodeAt(0);
        if (entityMode === "hex") return `&#x${code.toString(16).toUpperCase()};`;
        if (entityMode === "named") {
          if (c === "&") return "&amp;";
          if (c === "<") return "&lt;";
          if (c === ">") return "&gt;";
          if (c === '"') return "&quot;";
          if (c === "'") return "&apos;";
        }
        return `&#${code};`;
      }
    }
    return c;
  }).join("");
}

function decodeEntities(str: string): string {
  const doc = new DOMParser().parseFromString(str, "text/html");
  return doc.documentElement.textContent || "";
}

function detectHtmlEntity(input: string): boolean {
  return /&(?:#[xX][0-9a-fA-F]+|#\d+|[a-zA-Z]+);/.test(input);
}

export function HtmlEntity() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState<Mode>("encode");
  const [entityMode, setEntityMode] = useState<EntityMode>("named");
  const [preset, setPreset] = useState<Preset>("none");
  const [encodeAll, setEncodeAll] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const convert = useCallback(() => {
    setError("");
    if (!input.trim()) { setOutput(""); return; }
    try {
      if (mode === "encode") {
        setOutput(encodeEntity(input, entityMode, preset, encodeAll));
      } else {
        setOutput(decodeEntities(input));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Conversion failed");
      setOutput("");
    }
  }, [input, mode, entityMode, preset, encodeAll]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(convert, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [convert]);

  const copy = async () => { if (output) await navigator.clipboard.writeText(output); };

  const refEntries = Object.entries(HTML_ENTITY_MAP).filter(([c]) => input.includes(c));
  const inputSize = input.length;
  const outputSize = output.length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(["encode", "decode"] as Mode[]).map((m) => (
          <button key={m} onClick={() => { setMode(m); setError(""); }}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${mode === m ? "bg-brand-500 text-white" : "border border-surface-200 text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface"}`}>
            {m === "encode" ? "Encode" : "Decode"}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {(["named", "numeric", "hex"] as EntityMode[]).map((em) => (
          <button key={em} onClick={() => setEntityMode(em)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${entityMode === em ? "bg-brand-500 text-white" : "border border-surface-200 text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface"}`}>
            {em === "named" ? "Named (&amp;)" : em === "numeric" ? "Numeric (&#38;)" : "Hex (&#x26;)"}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {(["none", "body", "attribute"] as Preset[]).map((p) => (
          <button key={p} onClick={() => setPreset(p)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${preset === p ? "bg-brand-500 text-white" : "border border-surface-200 text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface"}`}>
            {p === "none" ? "Custom" : p === "body" ? "HTML Body" : "HTML Attribute"}
          </button>
        ))}
        {mode === "encode" && preset === "none" && (
          <label className="flex items-center gap-1.5 rounded-lg border border-surface-200 px-3 py-1.5 text-xs text-surface-700 dark:border-dark-border dark:text-dark-text">
            <input type="checkbox" checked={encodeAll} onChange={(e) => setEncodeAll(e.target.checked)} className="rounded border-surface-300 text-brand-500 focus:ring-brand-400" />
            Encode all chars
          </label>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">
          {mode === "encode" ? "Text to Encode" : "HTML Entity to Decode"}
        </label>
        <textarea value={input} onChange={(e) => { const val = e.target.value; setInput(val); if (val && detectHtmlEntity(val) && mode === "encode") setMode("decode"); }}
          placeholder={mode === "encode" ? '<div class="example">' : "&lt;div&gt;"}
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
            <label className="block text-sm font-medium text-surface-700 dark:text-dark-text">Output</label>
            <button onClick={copy} className="rounded bg-brand-500 px-2 py-0.5 text-xs text-white hover:bg-brand-600">Copy</button>
          </div>
          <pre className="w-full rounded-lg border border-surface-200 bg-surface-50 p-3 text-sm font-mono text-surface-900 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text overflow-auto max-h-60 break-all select-all">{output}</pre>
        </div>
      )}

      {input && output && (
        <div className="flex gap-3 text-xs text-surface-500 dark:text-dark-muted">
          <span>Input: {inputSize} char{inputSize !== 1 ? "s" : ""}</span>
          <span>Output: {outputSize} char{outputSize !== 1 ? "s" : ""}</span>
          <span className={outputSize > inputSize ? "text-accent-brand-500" : "text-green-500"}>
            {outputSize > inputSize ? `+${((outputSize / inputSize - 1) * 100).toFixed(0)}%` : `${((1 - outputSize / inputSize) * 100).toFixed(0)}% smaller`}
          </span>
        </div>
      )}

      {refEntries.length > 0 && (
        <div>
          <p className="text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">Entity Reference</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
            {refEntries.map(([char, info]) => (
              <span key={char} className="rounded border border-surface-200 bg-white px-2 py-1 text-xs font-mono dark:border-dark-border dark:bg-dark-surface">
                <span className="text-surface-900 dark:text-dark-text">{char}</span>
                <span className="text-surface-400 dark:text-dark-muted"> → </span>
                <span className="text-brand-500">{entityMode === "named" ? info.named : entityMode === "hex" ? info.hex : info.numeric}</span>
                <span className="text-surface-400 dark:text-dark-muted ml-1">({info.desc})</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {!input && (
        <div>
          <p className="text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">Common HTML Entities</p>
          <div className="flex flex-wrap gap-1">
            {Object.entries(HTML_ENTITY_MAP).slice(0, 8).map(([char, info]) => (
              <button key={char} onClick={() => setInput((prev) => prev + char)}
                className="rounded border border-surface-200 px-2 py-0.5 text-xs font-mono text-surface-600 hover:bg-surface-50 dark:border-dark-border dark:text-dark-muted dark:hover:bg-dark-surface">
                {char} {info.named}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
