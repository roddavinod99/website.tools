"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

interface HeaderEntry { id: number; name: string; value: string; }

const CATEGORIES: Record<string, string[]> = {
  Cache: ["cache-control", "pragma", "expires", "age", "etag", "if-match", "if-none-match", "if-modified-since", "if-unmodified-since", "last-modified", "vary"],
  Content: ["content-type", "content-length", "content-encoding", "content-language", "content-location", "content-disposition", "content-range", "content-security-policy"],
  Auth: ["authorization", "www-authenticate", "proxy-authenticate", "proxy-authorization", "set-cookie", "cookie"],
  CORS: ["access-control-allow-origin", "access-control-allow-methods", "access-control-allow-headers", "access-control-allow-credentials", "access-control-expose-headers", "access-control-max-age", "access-control-request-headers", "access-control-request-method", "origin"],
  Security: ["strict-transport-security", "x-frame-options", "x-content-type-options", "x-xss-protection", "referrer-policy", "permissions-policy", "cross-origin-opener-policy", "cross-origin-embedder-policy", "cross-origin-resource-policy"],
  Transfer: ["transfer-encoding", "connection", "keep-alive", "upgrade", "via", "trailer", "te"],
};

const REQUIRED_SECURITY = ["content-security-policy", "strict-transport-security", "x-frame-options", "x-content-type-options", "referrer-policy", "permissions-policy"];

function categorize(name: string): string {
  const lower = name.toLowerCase();
  for (const [cat, keys] of Object.entries(CATEGORIES)) {
    if (keys.includes(lower)) return cat;
  }
  return "Custom";
}

function isSuspicious(name: string, value: string): boolean {
  const lower = name.toLowerCase();
  if (lower === "content-length" && isNaN(parseInt(value, 10))) return true;
  if (lower === "host" && value.includes("/")) return true;
  if (/[<>]/.test(value)) return true;
  if (/[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(value)) return true;
  return false;
}

function generateCurl(headers: HeaderEntry[], method = "GET", url = "https://example.com"): string {
  const parts = [`curl -X ${method} '${url}'`];
  headers.forEach(h => parts.push(`  -H '${h.name}: ${h.value}'`));
  return parts.join(" \\\n");
}

function generateFetch(headers: HeaderEntry[]): string {
  const obj: Record<string, string> = {};
  headers.forEach(h => { obj[h.name] = h.value; });
  return JSON.stringify({ headers: obj }, null, 2);
}

const VALIDATION_RULES: [string, RegExp][] = [
  ["content-type", /^[a-z]+\/[a-z0-9.+*-]+(;\s*[a-z]+=[a-z0-9]+)*$/i],
  ["content-length", /^\d+$/],
  ["authorization", /^(Bearer\s+\S+|Basic\s+\S+|Digest\s+.+)$/i],
  ["host", /^[a-z0-9.-]+(:\d+)?$/i],
];

export function HttpHeaderParser() {
  const [input, setInput] = useState(`Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
Cache-Control: no-cache, no-store, must-revalidate
X-Request-ID: abc-123-def-456`);
  const [headers, setHeaders] = useState<HeaderEntry[]>([]);
  const [error, setError] = useState("");
  const [sorted, setSorted] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState("");
  const [builderMode, setBuilderMode] = useState(false);
  const [builderName, setBuilderName] = useState("");
  const [builderValue, setBuilderValue] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editValue, setEditValue] = useState("");

  const parse = () => {
    setError("");
    const lines = input.split("\n").filter(l => l.trim());
    const parsed: HeaderEntry[] = [];
    let id = 0;
    for (const line of lines) {
      const colonIdx = line.indexOf(":");
      if (colonIdx === -1) { setError(`Invalid line: "${line}"`); return; }
      const name = line.substring(0, colonIdx).trim();
      const value = line.substring(colonIdx + 1).trim();
      if (!name) { setError(`Missing name: "${line}"`); return; }
      parsed.push({ id: id++, name, value });
    }
    setHeaders(parsed);
  };

  const displayHeaders = useMemo(() => {
    const result = sorted ? [...headers].sort((a, b) => a.name.localeCompare(b.name)) : headers;
    return result;
  }, [headers, sorted]);

  const missingSecurity = useMemo(() => {
    const present = headers.map(h => h.name.toLowerCase());
    return REQUIRED_SECURITY.filter(h => !present.includes(h));
  }, [headers]);

  const totalBytes = useMemo(() => {
    return headers.reduce((acc, h) => acc + h.name.length + h.value.length + 2, 0);
  }, [headers]);

  const copyAs = async (format: "text" | "json") => {
    if (format === "text") {
      await navigator.clipboard.writeText(headers.map(h => `${h.name}: ${h.value}`).join("\n"));
    } else {
      await navigator.clipboard.writeText(JSON.stringify(Object.fromEntries(headers.map(h => [h.name, h.value])), null, 2));
    }
    setCopyFeedback(`Copied as ${format}`);
    setTimeout(() => setCopyFeedback(""), 2000);
  };

  const addHeader = () => {
    if (!builderName.trim() || !builderValue.trim()) return;
    setHeaders(prev => [...prev, { id: Date.now(), name: builderName.trim(), value: builderValue.trim() }]);
    setBuilderName(""); setBuilderValue("");
  };

  const removeHeader = (id: number) => setHeaders(prev => prev.filter(h => h.id !== id));

  const updateHeader = (id: number, name: string, value: string) => {
    setHeaders(prev => prev.map(h => h.id === id ? { ...h, name, value } : h));
    setEditingId(null);
  };

  const startEdit = (h: HeaderEntry) => {
    setEditName(h.name);
    setEditValue(h.value);
    setEditingId(h.id);
  };

  const validateHeader = (name: string, value: string): string | null => {
    const lower = name.toLowerCase();
    for (const [ruleName, re] of VALIDATION_RULES) {
      if (ruleName === lower && !re.test(value)) return `Invalid ${name} format`;
    }
    return null;
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <label className="block text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">Raw HTTP Headers</label>
        <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="Header-Name: header-value" rows={5}
          className="w-full rounded-lg border border-surface-200 bg-white p-3 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <button onClick={parse} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors">Parse</button>
        <button onClick={() => setSorted(v => !v)} disabled={headers.length === 0}
          className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface disabled:opacity-50 transition-colors"
        >{sorted ? "Unsorted" : "Sort A-Z"}</button>
        <button onClick={() => { copyAs("text"); }} disabled={headers.length === 0}
          className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface disabled:opacity-50 transition-colors">Copy Text</button>
        <button onClick={() => { copyAs("json"); }} disabled={headers.length === 0}
          className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface disabled:opacity-50 transition-colors">Copy JSON</button>
        <button onClick={() => setBuilderMode(v => !v)} disabled={headers.length === 0}
          className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface disabled:opacity-50 transition-colors">{builderMode ? "Done Editing" : "Edit Headers"}</button>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400">{error}</div>}

      {headers.length > 0 && (
        <>
          <div className="flex flex-wrap items-center gap-3 text-xs text-surface-500 dark:text-dark-muted">
            <span>{headers.length} headers</span>
            <span>{totalBytes} bytes</span>
            {missingSecurity.length > 0 && (
              <span className="text-amber-600 dark:text-amber-400">
                Missing security: {missingSecurity.join(", ")}
              </span>
            )}
            {missingSecurity.length === 0 && <span className="text-green-600 dark:text-green-400">All security headers present</span>}
          </div>

          <div className="rounded-lg border border-surface-200 dark:border-dark-border overflow-hidden">
            <table className="w-full text-xs">
              <thead><tr className="bg-surface-50 dark:bg-dark-surface">
                <th className="text-left px-3 py-1.5 text-surface-500 dark:text-dark-muted font-medium">Name</th>
                <th className="text-left px-3 py-1.5 text-surface-500 dark:text-dark-muted font-medium">Value</th>
                <th className="text-left px-3 py-1.5 text-surface-500 dark:text-dark-muted font-medium">Category</th>
                <th className="w-16 px-3 py-1.5 text-surface-500 dark:text-dark-muted font-medium">Actions</th>
              </tr></thead>
              <tbody>
                {displayHeaders.map(h => {
                  const cat = categorize(h.name);
                  const susp = isSuspicious(h.name, h.value);
                  const validationErr = validateHeader(h.name, h.value);
                  return (
                    <tr key={h.id} className={cn("border-t border-surface-200 dark:border-dark-border", susp && "bg-red-50 dark:bg-red-900/10")}>
                      {editingId === h.id ? (
                        <>
                          <td className="px-3 py-1.5"><input type="text" value={editName}
                            className="w-full rounded border border-surface-300 bg-white px-2 py-1 text-xs font-mono dark:border-dark-border dark:bg-dark-surface dark:text-dark-text"
                            onChange={e => setEditName(e.target.value)}
                          /></td>
                          <td className="px-3 py-1.5"><input type="text" value={editValue}
                            className="w-full rounded border border-surface-300 bg-white px-2 py-1 text-xs font-mono dark:border-dark-border dark:bg-dark-surface dark:text-dark-text"
                            onChange={e => setEditValue(e.target.value)}
                          /></td>
                          <td className="px-3 py-1.5"><span className="px-1.5 py-0.5 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-800 dark:text-brand-200 text-[10px]">{cat}</span></td>
                          <td className="px-3 py-1.5">
                            <button onClick={() => updateHeader(h.id, editName, editValue)} className="text-brand-500 hover:text-brand-600 text-[10px]">Save</button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className={cn("px-3 py-1.5 font-mono text-surface-900 dark:text-dark-text", susp && "text-red-600 dark:text-red-400")}>{h.name}</td>
                          <td className="px-3 py-1.5 font-mono text-surface-700 dark:text-dark-muted break-all max-w-[300px]">{h.value}</td>
                          <td className="px-3 py-1.5"><span className={cn("px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-surface-100 text-surface-600 dark:bg-dark-surface dark:text-dark-muted")}>{cat}</span></td>
                          <td className="px-3 py-1.5">
                            {builderMode && (
                              <div className="flex gap-1">
                                <button onClick={() => startEdit(h)} className="text-brand-500 hover:text-brand-600 text-[10px]">Edit</button>
                                <button onClick={() => removeHeader(h.id)} className="text-red-500 hover:text-red-600 text-[10px]">Del</button>
                              </div>
                            )}
                          </td>
                        </>
                      )}
                      {validationErr && !editingId && (
                        <td colSpan={4} className="px-3 py-0.5 text-[10px] text-red-500">{validationErr}</td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {builderMode && (
            <div className="flex gap-2 items-end">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-surface-400 dark:text-dark-muted mb-0.5">Name</label>
                <input type="text" value={builderName} onChange={e => setBuilderName(e.target.value)} placeholder="Header-Name"
                  className="rounded-lg border border-surface-200 bg-white px-3 py-2 text-xs font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-surface-400 dark:text-dark-muted mb-0.5">Value</label>
                <input type="text" value={builderValue} onChange={e => setBuilderValue(e.target.value)} placeholder="header-value"
                  className="rounded-lg border border-surface-200 bg-white px-3 py-2 text-xs font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted"
                />
              </div>
              <button onClick={addHeader} className="rounded-lg bg-brand-500 px-4 py-2 text-xs font-medium text-white hover:bg-brand-600 transition-colors">Add</button>
            </div>
          )}

          <div className="border-t border-surface-200 dark:border-dark-border pt-3 space-y-2">
            <details>
              <summary className="text-xs font-medium text-surface-500 dark:text-dark-muted cursor-pointer hover:text-surface-700 dark:hover:text-dark-text transition-colors">cURL &amp; Fetch Export</summary>
              <div className="mt-2 space-y-2">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-surface-400 dark:text-dark-muted">cURL</span>
                  <pre className="mt-0.5 rounded-lg bg-surface-50 dark:bg-dark-surface px-3 py-2 text-xs font-mono text-surface-900 dark:text-dark-text overflow-x-auto">{generateCurl(headers)}</pre>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-surface-400 dark:text-dark-muted">JavaScript Fetch</span>
                  <pre className="mt-0.5 rounded-lg bg-surface-50 dark:bg-dark-surface px-3 py-2 text-xs font-mono text-surface-900 dark:text-dark-text overflow-x-auto">{generateFetch(headers)}</pre>
                </div>
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
    </div>
  );
}
