"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { getStorageJSON, setStorageJSON } from "@/lib/client-storage";

interface ParsedURL {
  href: string; protocol: string; hostname: string; port: string;
  host: string; pathname: string; search: string; hash: string;
  origin: string; username: string; password: string;
  searchParams: Record<string, string>;
}

interface HistoryEntry { url: string; timestamp: number }

function parseURL(url: string): ParsedURL | null {
  try {
    const u = new URL(url);
    const params: Record<string, string> = {};
    u.searchParams.forEach((v, k) => { params[k] = v; });
    return {
      href: u.href, protocol: u.protocol, hostname: u.hostname, port: u.port,
      host: u.host, pathname: u.pathname, search: u.search, hash: u.hash,
      origin: u.origin, username: u.username, password: u.password, searchParams: params,
    };
  } catch { return null; }
}

function normalizeURL(url: string): string {
  try { return new URL(url).href; } catch { return url; }
}

function detectIP(hostname: string): "IPv4" | "IPv6" | "domain" | null {
  if (!hostname) return null;
  const ipv4 = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipv4.test(hostname)) {
    const parts = hostname.split(".").map(Number);
    if (parts.every(p => p >= 0 && p <= 255)) return "IPv4";
  }
  if (hostname.includes(":")) return "IPv6";
  if (/^[a-zA-Z0-9.-]+$/.test(hostname)) return "domain";
  return null;
}

interface EditableFields {
  protocol: string; hostname: string; port: string; pathname: string;
  search: string; hash: string; username: string; password: string;
}

export function UrlParser() {
  const [input, setInput] = useState("https://user:pass@api.example.com:8443/path/to/resource?query=value&page=1#section");
  const [parsed, setParsed] = useState<ParsedURL | null>(null);
  const [error, setError] = useState("");
  const [copyFeedback, setCopyFeedback] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>(() => getStorageJSON<HistoryEntry[]>("urlparse_history") || []);
  const [encodeInput, setEncodeInput] = useState("");
  const [encodeMode, setEncodeMode] = useState<"encode" | "decode">("encode");
  const [encodeResult, setEncodeResult] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [relativeUrl, setRelativeUrl] = useState("");
  const [resolvedUrl, setResolvedUrl] = useState("");
  const [buildMode, setBuildMode] = useState(false);
  const [fields, setFields] = useState<EditableFields>({
    protocol: "https:", hostname: "example.com", port: "443", pathname: "/path",
    search: "?query=value", hash: "#section", username: "", password: "",
  });
  useEffect(() => {
    if (history.length > 0) setStorageJSON("urlparse_history", history.slice(0, 20));
  }, [history]);

  const buildUrl = useCallback((f: EditableFields): string => {
    const auth = f.username ? `${f.username}${f.password ? `:${f.password}` : ""}@` : "";
    return `${f.protocol}//${auth}${f.hostname}${f.port ? `:${f.port}` : ""}${f.pathname}${f.search}${f.hash}`;
  }, []);

  const doParse = useCallback((urlStr: string) => {
    setError("");
    if (!urlStr.trim()) { setParsed(null); return; }
    let url = urlStr.trim();
    if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(url)) url = `https://${url}`;
    const result = parseURL(url);
    if (!result) { setError("Invalid URL. Check format."); setParsed(null); return; }
    setParsed(result);
    setFields({
      protocol: result.protocol, hostname: result.hostname, port: result.port,
      pathname: result.pathname, search: result.search, hash: result.hash,
      username: result.username, password: result.password,
    });
    setHistory(prev => [{ url: result.href, timestamp: Date.now() }, ...prev.filter(e => e.url !== result.href)].slice(0, 20));
  }, []);

  const parse = useCallback(() => doParse(input), [input, doParse]);

  const copyValue = async (label: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopyFeedback(`${label} copied`);
    setTimeout(() => setCopyFeedback(""), 2000);
  };

  const resolveRelative = () => {
    try { setResolvedUrl(new URL(relativeUrl, baseUrl || undefined).href); } catch { setResolvedUrl("Invalid"); }
  };

  const doEncode = () => {
    try {
      setEncodeResult(encodeMode === "encode" ? encodeURIComponent(encodeInput) : decodeURIComponent(encodeInput));
    } catch { setEncodeResult("Error"); }
  };

  const percentEncoded = (s: string) => {
    const matches = s.match(/%[0-9A-Fa-f]{2}/g);
    return matches ? matches.length : 0;
  };

  const reconstructedUrl = buildUrl(fields);

  const ipType = parsed ? detectIP(parsed.hostname) : null;

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <label className="block text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">URL</label>
        <div className="flex gap-2">
          <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="https://example.com/path"
            onKeyDown={e => e.key === "Enter" && parse()}
            className="flex-1 rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted"
          />
          <button onClick={parse} className="shrink-0 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors">Parse</button>
        </div>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400">{error}</div>}

      {parsed && (
        <>
          <div data-testid="tool-output" className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {((): { label: string; value: string; cls?: string }[] => [
              { label: "Protocol", value: parsed.protocol },
              { label: "Hostname", value: parsed.hostname },
              { label: "Port", value: parsed.port || "(default)" },
              { label: "Pathname", value: parsed.pathname, cls: "text-brand-500" },
              { label: "Search", value: parsed.search || "(none)" },
              { label: "Hash", value: parsed.hash || "(none)" },
              { label: "Origin", value: parsed.origin },
              { label: "Username", value: parsed.username || "(none)" },
              { label: "Password", value: parsed.password ? "****" : "(none)" },
            ])().map(f => (
              <div key={f.label} className="group relative rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 dark:border-dark-border dark:bg-dark-surface cursor-pointer" onClick={() => copyValue(f.label, f.value)}>
                <span className="block text-[10px] uppercase tracking-wider text-surface-400 dark:text-dark-muted">{f.label}</span>
                <span className={cn("block text-sm font-mono text-surface-900 dark:text-dark-text truncate", f.cls)}>{f.value}</span>
                <span className="absolute top-1 right-1 text-[9px] text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity">copy</span>
              </div>
            ))}
          </div>

          {ipType && (
            <div className="flex items-center gap-2 text-xs">
              <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-medium",
                ipType === "IPv4" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" :
                ipType === "IPv6" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" :
                "bg-surface-100 text-surface-600 dark:bg-dark-surface dark:text-dark-muted"
              )}>{ipType}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs">
            <span className="text-surface-400 dark:text-dark-muted">Percent-encoded chars: {percentEncoded(parsed.href)}</span>
            <span className="text-surface-300 dark:text-dark-border">|</span>
            <span className="text-surface-400 dark:text-dark-muted">Normalized: {normalizeURL(parsed.href)}</span>
          </div>

          {Object.keys(parsed.searchParams).length > 0 && (
            <div>
              <span className="block text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">Query Parameters</span>
              <div className="rounded-lg border border-surface-200 dark:border-dark-border overflow-hidden">
                <table className="w-full text-xs">
                  <thead><tr className="bg-surface-50 dark:bg-dark-surface">
                    <th className="text-left px-3 py-1.5 text-surface-500 dark:text-dark-muted font-medium">Key</th>
                    <th className="text-left px-3 py-1.5 text-surface-500 dark:text-dark-muted font-medium">Decoded Value</th>
                    <th className="text-left px-3 py-1.5 text-surface-500 dark:text-dark-muted font-medium">Encoded</th>
                  </tr></thead>
                  <tbody>
                    {Object.entries(parsed.searchParams).map(([k, v]) => (
                      <tr key={k} className="border-t border-surface-200 dark:border-dark-border">
                        <td className="px-3 py-1.5 font-mono text-surface-900 dark:text-dark-text">{k}</td>
                        <td className="px-3 py-1.5 font-mono text-surface-900 dark:text-dark-text break-all">{decodeURIComponent(v)}</td>
                        <td className="px-3 py-1.5 font-mono text-surface-400 dark:text-dark-muted">{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button onClick={() => setBuildMode(v => !v)} className="text-xs font-medium text-brand-500 hover:text-brand-600 transition-colors">
              {buildMode ? "Hide URL Builder" : "URL Builder"}
            </button>
          </div>

          {buildMode && (
            <div className="rounded-lg border border-surface-200 dark:border-dark-border p-3 space-y-2">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(Object.keys(fields) as (keyof EditableFields)[]).map(k => (
                  <div key={k}>
                    <label className="block text-[10px] uppercase tracking-wider text-surface-400 dark:text-dark-muted mb-0.5">{k}</label>
                    <input type="text" value={fields[k]} onChange={e => setFields(f => ({ ...f, [k]: e.target.value }))}
                      className="w-full rounded-md border border-surface-200 bg-white px-2 py-1 text-xs font-mono text-surface-900 focus:outline-none focus:ring-1 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text"
                    />
                  </div>
                ))}
              </div>
              <div className="rounded-lg bg-surface-50 dark:bg-dark-surface px-3 py-2 text-xs font-mono text-surface-900 dark:text-dark-text break-all">
                {reconstructedUrl}
              </div>
            </div>
          )}

          <div className="border-t border-surface-200 dark:border-dark-border pt-3 space-y-2">
            <details>
              <summary className="text-xs font-medium text-surface-500 dark:text-dark-muted cursor-pointer hover:text-surface-700 dark:hover:text-dark-text transition-colors">URL Resolution &amp; Encoding</summary>
              <div className="mt-2 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input type="text" value={baseUrl} onChange={e => setBaseUrl(e.target.value)} placeholder="Base URL"
                    className="rounded-lg border border-surface-200 bg-white px-3 py-2 text-xs font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted"
                  />
                  <input type="text" value={relativeUrl} onChange={e => setRelativeUrl(e.target.value)} placeholder="Relative URL"
                    className="rounded-lg border border-surface-200 bg-white px-3 py-2 text-xs font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted"
                  />
                  <button onClick={resolveRelative} className="rounded-lg bg-brand-500 px-3 py-2 text-xs font-medium text-white hover:bg-brand-600 transition-colors">Resolve</button>
                </div>
                {resolvedUrl && <div className="rounded-lg bg-surface-50 dark:bg-dark-surface px-3 py-2 text-xs font-mono text-surface-900 dark:text-dark-text break-all">{resolvedUrl}</div>}
                <div className="flex gap-2">
                  <input type="text" value={encodeInput} onChange={e => setEncodeInput(e.target.value)} placeholder="String to encode/decode"
                    className="flex-1 rounded-lg border border-surface-200 bg-white px-3 py-2 text-xs font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted"
                  />
                  <select value={encodeMode} onChange={e => setEncodeMode(e.target.value as "encode" | "decode")}
                    className="rounded-lg border border-surface-200 bg-white px-2 py-2 text-xs text-surface-700 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text"
                  >
                    <option value="encode">Encode</option><option value="decode">Decode</option>
                  </select>
                  <button onClick={doEncode} className="rounded-lg bg-brand-500 px-3 py-2 text-xs font-medium text-white hover:bg-brand-600 transition-colors">Go</button>
                </div>
                {encodeResult && <div className="rounded-lg bg-surface-50 dark:bg-dark-surface px-3 py-2 text-xs font-mono text-surface-900 dark:text-dark-text break-all">{encodeResult}</div>}
              </div>
            </details>
          </div>
        </>
      )}

      {copyFeedback && (
        <div className="fixed bottom-4 right-4 rounded-lg bg-brand-500 px-4 py-2 text-sm text-white shadow-lg animate-fade-in">
          {copyFeedback}
        </div>
      )}

      {history.length > 0 && (
        <div className="border-t border-surface-200 dark:border-dark-border pt-2">
          <span className="text-[10px] uppercase tracking-wider text-surface-400 dark:text-dark-muted font-medium">Recent</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {history.slice(0, 5).map(e => (
              <button key={e.url} onClick={() => { setInput(e.url); doParse(e.url); }}
                className="max-w-[200px] truncate rounded-md border border-surface-200 bg-surface-50 px-2 py-0.5 text-[11px] font-mono text-surface-600 hover:bg-surface-100 dark:border-dark-border dark:bg-dark-surface dark:text-dark-muted dark:hover:bg-dark-border transition-colors"
              >{e.url}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
