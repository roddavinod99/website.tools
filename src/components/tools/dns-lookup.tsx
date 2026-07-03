"use client";

import { useState, useCallback } from "react";

const RECORD_TYPES = ["A", "AAAA", "CNAME", "MX", "NS", "TXT", "SOA", "SRV", "PTR", "CAA", "ANY"] as const;
type RecordType = (typeof RECORD_TYPES)[number];

interface DnsAnswer {
  name: string;
  type: number;
  TTL: number;
  data: string;
}

interface DnsResponse {
  Status?: number;
  TC?: boolean;
  RD?: boolean;
  RA?: boolean;
  AD?: boolean;
  CD?: boolean;
  Question?: { name: string; type: number }[];
  Answer?: DnsAnswer[];
  Authority?: DnsAnswer[];
  Additional?: DnsAnswer[];
  Comment?: string;
}

interface HistoryEntry {
  domain: string;
  type: RecordType;
  timestamp: number;
}




function simulateWhois(domain: string) {
  const registrar = ["Namecheap", "GoDaddy", "Cloudflare", "Google Domains", "AWS Route53"][Math.abs(hash(domain)) % 5];
  const year = new Date().getFullYear();
  const createYear = year - (Math.abs(hash(domain + "created")) % 10 + 1);
  const expiryYear = createYear + (Math.abs(hash(domain + "expiry")) % 5 + 1);
  return { registrar, created: `${createYear}-${String(Math.abs(hash(domain)) % 12 + 1).padStart(2, "0")}-${String(Math.abs(hash(domain + "day")) % 28 + 1).padStart(2, "0")}`, expires: `${expiryYear}-${String(Math.abs(hash(domain + "exp")) % 12 + 1).padStart(2, "0")}-${String(Math.abs(hash(domain + "day2")) % 28 + 1).padStart(2, "0")}` };
}

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) { h = ((h << 5) - h) + str.charCodeAt(i); h |= 0; }
  return Math.abs(h);
}

const TYPE_NUMBERS: Record<string, number> = {
  A: 1, AAAA: 28, CNAME: 5, MX: 15, NS: 2, TXT: 16, SOA: 6, SRV: 33, PTR: 12, CAA: 257, ANY: 255,
};

export function DNSLookup() {
  const [domain, setDomain] = useState("");
  const [type, setType] = useState<RecordType>("A");
  const [data, setData] = useState<DnsResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    try { const saved = localStorage.getItem("dns-lookup-history"); return saved ? JSON.parse(saved) : []; } catch { return []; }
  });

  const lookup = useCallback(async (d: string, t: RecordType) => {
    if (!d.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/dns-lookup?domain=${encodeURIComponent(d.trim())}&type=${t}`);
      const json: DnsResponse & { error?: string } = await res.json();
      if (json.error) {
        setError(json.error);
        setData(null);
      } else if (json.Status !== 0) {
        setError(`DNS query failed with status ${json.Status}`);
        setData(json);
      } else {
        setData(json);
        setError("");
        setHistory((prev) => {
          const next = [{ domain: d.trim(), type: t, timestamp: Date.now() }, ...prev.filter((h) => h.domain !== d.trim())].slice(0, 10);
          localStorage.setItem("dns-lookup-history", JSON.stringify(next));
          return next;
        });
      }
    } catch {
      setError("Failed to lookup DNS. Check your connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  const typeMapReverse = Object.fromEntries(Object.entries(TYPE_NUMBERS).map(([k, v]) => [v, k]));

  const copyJson = async () => { if (data) await navigator.clipboard.writeText(JSON.stringify(data, null, 2)); };
  const copyText = async () => {
    if (!data?.Answer) return;
    const text = data.Answer.map((r) => `${r.name} ${r.TTL} ${typeMapReverse[r.type] || r.type} ${r.data}`).join("\n");
    await navigator.clipboard.writeText(text);
  };

  const whois = domain ? simulateWhois(domain.trim() || "example.com") : null;

  const isTypo = (d: string) => {
    const known = [".com", ".org", ".net", ".io", ".dev", ".app", ".gov", ".edu"];
    return d.endsWith(".cmo") || d.endsWith(".con") || known.some((k) => d.endsWith(k) && d !== d.toLowerCase());
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input type="text" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="e.g. example.com"
          onKeyDown={(e) => e.key === "Enter" && lookup(domain, type)}
          className="flex-1 rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted" />
        <select value={type} onChange={(e) => setType(e.target.value as RecordType)}
          className="rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
          {RECORD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <button onClick={() => lookup(domain, type)} disabled={loading || !domain.trim()}
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-40 transition-colors whitespace-nowrap">
          {loading ? "Looking up..." : "Lookup"}
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm font-medium text-red-700 dark:text-red-400">{error}</p>
          <div className="flex gap-2 mt-1">
            <button onClick={() => lookup(domain, type)} className="text-xs text-brand-500 hover:text-brand-600">Retry</button>
            {isTypo(domain.trim()) && <span className="text-xs text-amber-600 dark:text-amber-400">Possible typo in domain name</span>}
          </div>
        </div>
      )}

      {data?.Answer && data.Answer.length > 0 && (
        <div>
          <div className="overflow-x-auto rounded-lg border border-surface-200 dark:border-dark-border">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="bg-surface-50 dark:bg-dark-surface">
                  <th className="px-3 py-2 text-left text-surface-600 dark:text-dark-muted font-medium">Name</th>
                  <th className="px-3 py-2 text-left text-surface-600 dark:text-dark-muted font-medium">TTL</th>
                  <th className="px-3 py-2 text-left text-surface-600 dark:text-dark-muted font-medium">Class</th>
                  <th className="px-3 py-2 text-left text-surface-600 dark:text-dark-muted font-medium">Type</th>
                  <th className="px-3 py-2 text-left text-surface-600 dark:text-dark-muted font-medium">Value</th>
                </tr>
              </thead>
              <tbody>
                {data.Answer.map((record, i) => {
                  const typeName = typeMapReverse[record.type] || `TYPE${record.type}`;
                  return (
                    <tr key={i} className="border-t border-surface-200 dark:border-dark-border">
                      <td className="px-3 py-2 text-surface-900 dark:text-dark-text">{record.name}</td>
                      <td className="px-3 py-2 text-surface-500 dark:text-dark-muted">{record.TTL}s</td>
                      <td className="px-3 py-2 text-surface-500 dark:text-dark-muted">IN</td>
                      <td className="px-3 py-2"><span className="rounded bg-brand-100 px-1.5 py-0.5 text-brand-700 dark:bg-brand-800 dark:text-brand-200">{typeName}</span></td>
                      <td className="px-3 py-2 text-surface-900 dark:text-dark-text break-all max-w-xs">{record.data}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex gap-2 mt-2">
            <button onClick={copyJson} className="text-xs text-brand-500 hover:text-brand-600">Copy as JSON</button>
            <button onClick={copyText} className="text-xs text-brand-500 hover:text-brand-600">Copy as text</button>
            <button onClick={() => setShowRaw(!showRaw)} className="text-xs text-surface-500 hover:text-surface-700 dark:text-dark-muted dark:hover:text-dark-text">
              {showRaw ? "Hide raw" : "Show raw"}
            </button>
          </div>
          {showRaw && (
            <pre className="mt-2 rounded-lg border border-surface-200 bg-surface-50 p-3 text-xs font-mono text-surface-900 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text overflow-auto max-h-40 whitespace-pre-wrap">
              {JSON.stringify(data, null, 2)}
            </pre>
          )}
          {whois && (
            <div className="mt-3 rounded-lg border border-surface-200 bg-surface-50 p-3 dark:border-dark-border dark:bg-dark-surface">
              <p className="text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">WHOIS Summary (simulated)</p>
              <div className="text-xs text-surface-700 dark:text-dark-text">
                <span>Registrar: {whois.registrar}</span>
                <span className="mx-2">|</span>
                <span>Created: {whois.created}</span>
                <span className="mx-2">|</span>
                <span>Expires: {whois.expires}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {data?.Answer && data.Answer.length === 0 && (
        <p className="text-sm text-surface-400 dark:text-dark-muted">No {type} records found for {domain}</p>
      )}

      <div className="flex justify-between">
        {history.length > 0 && (
          <div className="flex flex-wrap gap-1">
            <span className="text-xs text-surface-400 dark:text-dark-muted self-center">History:</span>
            {history.map((h) => (
              <button key={h.domain + h.type} onClick={() => { setDomain(h.domain); setType(h.type); lookup(h.domain, h.type); }}
                className="rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:hover:bg-dark-surface transition-colors">
                {h.domain} ({h.type})
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
