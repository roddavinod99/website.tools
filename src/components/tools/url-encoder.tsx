"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";

type Mode = "encode" | "decode";
type EncodingType = "component" | "full";
type CharSet = "all" | "special" | "non-ascii";

const SPECIAL_CHARS_REF: Record<string, string> = {
  " ": "%20", "!": "%21", '"': "%22", "#": "%23", $: "%24", "%": "%25",
  "&": "%26", "'": "%27", "(": "%28", ")": "%29", "*": "%2A", "+": "%2B",
  ",": "%2C", "-": "%2D", ".": "%2E", "/": "%2F", ":": "%3A", ";": "%3B",
  "<": "%3C", "=": "%3D", ">": "%3E", "?": "%3F", "@": "%40",
  "[": "%5B", "\\": "%5C", "]": "%5D", "^": "%5E", "_": "%5F",
  "`": "%60", "{": "%7B", "|": "%7C", "}": "%7D", "~": "%7E",
};

function detectEncoded(input: string): boolean {
  return /%[0-9a-fA-F]{2}/.test(input);
}

function encodeWithSet(str: string, type: EncodingType, charSet: CharSet): string {
  const fn = type === "component" ? encodeURIComponent : encodeURI;
  if (charSet === "all") return fn(str);
  if (charSet === "non-ascii") {
    return str.split("").map((c) => {
      return c.charCodeAt(0) > 127 ? fn(c) : c;
    }).join("");
  }
  if (charSet === "special") {
    return str.split("").map((c) => {
      return SPECIAL_CHARS_REF[c] ? SPECIAL_CHARS_REF[c] : c;
    }).join("");
  }
  return fn(str);
}

function validateUrl(str: string): { valid: boolean; error?: string } {
  try {
    new URL(str);
    return { valid: true };
  } catch {
    if (!str.includes(".") && !str.includes("localhost")) return { valid: false, error: "Missing domain or TLD" };
    if (!str.startsWith("http://") && !str.startsWith("https://")) return { valid: false, error: "Missing protocol (http:// or https://)" };
    try {
      const url = new URL(`https://${str}`);
      if (!url.hostname.includes(".")) return { valid: false, error: "Invalid hostname" };
    } catch {
      return { valid: false, error: "Malformed URL detected" };
    }
    return { valid: true };
  }
}

function parseUrlParts(input: string): { protocol: string; hostname: string; path: string; query: string; hash: string; params: { key: string; value: string }[] } | null {
  try {
    const url = new URL(input.startsWith("http") ? input : `https://${input}`);
    const params: { key: string; value: string }[] = [];
    url.searchParams.forEach((value, key) => params.push({ key, value }));
    return {
      protocol: url.protocol,
      hostname: url.hostname,
      path: url.pathname,
      query: url.search,
      hash: url.hash,
      params,
    };
  } catch {
    return null;
  }
}

interface HistoryEntry {
  input: string;
  mode: Mode;
  type: EncodingType;
  output: string;
  timestamp: number;
}

export function URLEncoder() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState<Mode>("encode");
  const [encodingType, setEncodingType] = useState<EncodingType>("component");
  const [charSet, setCharSet] = useState<CharSet>("all");
  const [urlValidation, setUrlValidation] = useState<{ valid: boolean; error?: string } | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const outputComponentEncoded = useCallback(() => {
    if (!input || mode !== "encode") return "";
    try { return encodeURIComponent(input); } catch { return ""; }
  }, [input, mode]);

  const outputComponentDecoded = useCallback(() => {
    if (!input || mode !== "decode") return "";
    try { return decodeURIComponent(input); } catch { return ""; }
  }, [input, mode]);

  const outputFullEncoded = useCallback(() => {
    if (!input || mode !== "encode") return "";
    try { return encodeURI(input); } catch { return ""; }
  }, [input, mode]);

  const outputFullDecoded = useCallback(() => {
    if (!input || mode !== "decode") return "";
    try { return decodeURI(input); } catch { return ""; }
  }, [input, mode]);

  const convert = useCallback(() => {
    setError("");
    setUrlValidation(null);
    if (!input.trim()) { setOutput(""); return; }
    try {
      if (mode === "encode") {
        const result = encodeWithSet(input, encodingType, charSet);
        setOutput(result);
        if (result) {
          setHistory((prev) => {
            const entry: HistoryEntry = { input, mode, type: encodingType, output: result, timestamp: Date.now() };
            return [entry, ...prev].slice(0, 10);
          });
        }
        if (encodingType === "full") setUrlValidation(validateUrl(input));
      } else {
        const fn = encodingType === "component" ? decodeURIComponent : decodeURI;
        const result = fn(input);
        setOutput(result);
        if (result) {
          setHistory((prev) => {
            const entry: HistoryEntry = { input, mode, type: encodingType, output: result, timestamp: Date.now() };
            return [entry, ...prev].slice(0, 10);
          });
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Conversion failed");
      setOutput("");
    }
  }, [input, mode, encodingType, charSet]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(convert, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [convert]);

  const copy = async (text?: string) => {
    const t = text ?? output;
    if (t) await navigator.clipboard.writeText(t);
  };

  const charRefEntries = Object.entries(SPECIAL_CHARS_REF).filter(([c]) => input.includes(c));

  const urlParts = useMemo(() => {
    if (!input.trim()) return null;
    return parseUrlParts(input);
  }, [input]);

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
        {(["component", "full"] as EncodingType[]).map((t) => (
          <button key={t} onClick={() => setEncodingType(t)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${encodingType === t ? "bg-brand-500 text-white" : "border border-surface-200 text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface"}`}>
            {t === "component" ? "Component" : "Full URL"}
          </button>
        ))}
        <select value={charSet} onChange={(e) => setCharSet(e.target.value as CharSet)}
          className="rounded-lg border border-surface-200 bg-white px-3 py-1.5 text-xs font-medium text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
          <option value="all">Encode All Chars</option>
          <option value="special">Special Chars Only</option>
          <option value="non-ascii">Non-ASCII Only</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Input</label>
          <textarea value={input} onChange={(e) => setInput(e.target.value)}
          placeholder={mode === "encode" ? "Enter text or URL to encode..." : "Enter URL-encoded string..."}
          rows={4} spellCheck={false}
          className="w-full rounded-lg border border-surface-200 bg-white p-3 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted" />
      </div>

      {urlValidation && mode === "encode" && (
        <div className={`rounded-lg border p-3 ${urlValidation.valid ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20" : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"}`}>
          <p className={`text-sm ${urlValidation.valid ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}>
            {urlValidation.valid ? "URL is valid" : `URL Error: ${urlValidation.error}`}
          </p>
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
              {mode === "encode" ? "Encoded" : "Decoded"}
            </label>
            <button onClick={() => copy()} className="rounded bg-brand-500 px-2 py-0.5 text-xs text-white hover:bg-brand-600">Copy</button>
          </div>
          <pre className="w-full rounded-lg border border-surface-200 bg-surface-50 p-3 text-sm font-mono text-surface-900 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text overflow-auto max-h-40 break-all select-all">{output}</pre>
        </div>
      )}

      {mode === "encode" && input && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="rounded-lg border border-surface-200 p-2 dark:border-dark-border">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-surface-500 dark:text-dark-muted">Component Encoded</p>
              <button onClick={() => copy(outputComponentEncoded())} className="text-xs text-brand-500 hover:text-brand-600">Copy</button>
            </div>
            <p className="text-xs font-mono text-surface-700 dark:text-dark-text break-all">{outputComponentEncoded() || "-"}</p>
          </div>
          <div className="rounded-lg border border-surface-200 p-2 dark:border-dark-border">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-surface-500 dark:text-dark-muted">Full URL Encoded</p>
              <button onClick={() => copy(outputFullEncoded())} className="text-xs text-brand-500 hover:text-brand-600">Copy</button>
            </div>
            <p className="text-xs font-mono text-surface-700 dark:text-dark-text break-all">{outputFullEncoded() || "-"}</p>
          </div>
        </div>
      )}

      {mode === "decode" && input && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="rounded-lg border border-surface-200 p-2 dark:border-dark-border">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-surface-500 dark:text-dark-muted">Component Decoded</p>
              <button onClick={() => copy(outputComponentDecoded())} className="text-xs text-brand-500 hover:text-brand-600">Copy</button>
            </div>
            <p className="text-xs font-mono text-surface-700 dark:text-dark-text break-all">{outputComponentDecoded() || "-"}</p>
          </div>
          <div className="rounded-lg border border-surface-200 p-2 dark:border-dark-border">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-surface-500 dark:text-dark-muted">Full URL Decoded</p>
              <button onClick={() => copy(outputFullDecoded())} className="text-xs text-brand-500 hover:text-brand-600">Copy</button>
            </div>
            <p className="text-xs font-mono text-surface-700 dark:text-dark-text break-all">{outputFullDecoded() || "-"}</p>
          </div>
        </div>
      )}

      {charRefEntries.length > 0 && mode === "encode" && (
        <div>
          <p className="text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">Character Encoding Reference</p>
          <div className="flex flex-wrap gap-1">
            {charRefEntries.map(([char, encoded]) => (
              <span key={char} className="inline-flex items-center gap-1 rounded bg-surface-100 px-2 py-0.5 text-xs font-mono text-surface-700 dark:bg-dark-surface dark:text-dark-text">
                {char} → {encoded}
              </span>
            ))}
          </div>
        </div>
      )}

      {urlParts && urlParts.params.length > 0 && (
        <div>
          <p className="text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">URL Analysis</p>
          <div className="rounded-lg border border-surface-200 dark:border-dark-border overflow-hidden">
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 p-2 text-xs font-mono bg-surface-50 dark:bg-dark-surface">
              <span className="text-surface-400">Protocol:</span>
              <span className="text-surface-700 dark:text-dark-text">{urlParts.protocol}</span>
              <span className="text-surface-400">Hostname:</span>
              <span className="text-surface-700 dark:text-dark-text">{urlParts.hostname}</span>
              <span className="text-surface-400">Path:</span>
              <span className="text-surface-700 dark:text-dark-text break-all">{urlParts.path}</span>
              {urlParts.query && <><span className="text-surface-400">Query:</span><span className="text-surface-700 dark:text-dark-text break-all">{urlParts.query}</span></>}
              {urlParts.hash && <><span className="text-surface-400">Hash:</span><span className="text-surface-700 dark:text-dark-text">{urlParts.hash}</span></>}
            </div>
          </div>
          <div className="mt-2 rounded-lg border border-surface-200 dark:border-dark-border overflow-hidden">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="bg-surface-50 text-surface-500 dark:bg-dark-surface dark:text-dark-muted">
                  <th className="px-2 py-1 text-left">Parameter</th>
                  <th className="px-2 py-1 text-left">Value</th>
                </tr>
              </thead>
              <tbody>
                {urlParts.params.map((p, i) => (
                  <tr key={i} className="border-t border-surface-100 text-surface-700 dark:border-dark-border dark:text-dark-text">
                    <td className="px-2 py-1 text-brand-500">{p.key}</td>
                    <td className="px-2 py-1 break-all">{p.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div>
          <p className="text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">Recent Conversions</p>
          <div className="max-h-24 overflow-y-auto space-y-1">
            {history.slice(0, 5).map((h, i) => (
              <button key={i} onClick={() => setInput(h.input)}
                className="w-full text-left rounded border border-surface-200 p-1.5 text-xs font-mono text-surface-600 hover:bg-surface-50 dark:border-dark-border dark:text-dark-muted dark:hover:bg-dark-surface truncate">
                {h.input} → {h.output}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
