"use client";

import { useState, useCallback } from "react";
import { getStorageJSON, setStorageJSON } from "@/lib/client-storage";

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

interface WhoisResponse {
  found: boolean;
  registrar?: string;
  created?: string;
  updated?: string;
  expires?: string;
  status?: string[];
  nameservers?: string[];
  dnssec?: boolean;
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
  const [history, setHistory] = useState<HistoryEntry[]>(() => getStorageJSON<HistoryEntry[]>("dns-lookup-history") || []);
  const [whois, setWhois] = useState<WhoisResponse | null>(null);
  const [whoisLoading, setWhoisLoading] = useState(false);
  const [whoisError, setWhoisError] = useState("");

  const lookupWhois = useCallback(async (d: string) => {
    setWhoisLoading(true);
    setWhoisError("");
    try {
      const res = await fetch(`/api/whois?domain=${encodeURIComponent(d.trim())}`);
      const json: WhoisResponse & { error?: string } = await res.json();
      if (json.error) {
        setWhoisError(json.error);
        setWhois(null);
      } else if (json.found === false) {
        setWhoisError("WHOIS data is not available for this domain.");
        setWhois(null);
      } else {
        setWhois(json);
      }
    } catch {
      setWhoisError("Failed to load WHOIS data.");
      setWhois(null);
    } finally {
      setWhoisLoading(false);
    }
  }, []);

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
          setStorageJSON("dns-lookup-history", next);
          return next;
        });
        void lookupWhois(d);
      }
    } catch {
      setError("Failed to lookup DNS. Check your connection.");
    } finally {
      setLoading(false);
    }
  }, [lookupWhois]);

  const typeMapReverse = Object.fromEntries(Object.entries(TYPE_NUMBERS).map(([k, v]) => [v, k]));

  const copyJson = async () => { if (data) await navigator.clipboard.writeText(JSON.stringify(data, null, 2)); };
  const copyText = async () => {
    if (!data?.Answer) return;
    const text = data.Answer.map((r) => `${r.name} ${r.TTL} ${typeMapReverse[r.type] || r.type} ${r.data}`).join("\n");
    await navigator.clipboard.writeText(text);
  };

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
          {/* DNS Response Summary Flags */}
          <div className="mb-3 flex flex-wrap gap-1.5" aria-label="DNS Response Flags">
            {data.RD && <span className="inline-flex items-center gap-1 rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" title="Recursion Desired">RD</span>}
            {data.RA && <span className="inline-flex items-center gap-1 rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300" title="Recursion Available">RA</span>}
            {data.AD && <span className="inline-flex items-center gap-1 rounded bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" title="Authenticated Data">AD</span>}
            {data.CD && <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" title="Checking Disabled">CD</span>}
            {data.TC && <span className="inline-flex items-center gap-1 rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-300" title="Truncated">TC</span>}
            <span className="inline-flex items-center gap-1 rounded bg-surface-100 px-2 py-0.5 text-xs font-medium text-surface-700 dark:bg-dark-surface dark:text-dark-muted" title="Response Code">
              RCODE: {data.Status ?? 0}
            </span>
          </div>

          {/* Answer Records Table */}
          <div data-testid="tool-output" className="table-responsive rounded-lg border border-surface-200 dark:border-dark-border">
            <table className="table-base font-mono">
              <thead>
                <tr className="bg-surface-50 dark:bg-dark-surface">
                  <th className="table-header text-left text-surface-600 dark:text-dark-muted font-medium">Name</th>
                  <th className="table-header text-left text-surface-600 dark:text-dark-muted font-medium">TTL</th>
                  <th className="table-header text-left text-surface-600 dark:text-dark-muted font-medium">Class</th>
                  <th className="table-header text-left text-surface-600 dark:text-dark-muted font-medium">Type</th>
                  <th className="table-header text-left text-surface-600 dark:text-dark-muted font-medium">Value</th>
                </tr>
              </thead>
              <tbody>
                {data.Answer.map((record, i) => {
                  const typeName = typeMapReverse[record.type] || `TYPE${record.type}`;
                  return (
                    <tr key={i} className="border-t border-surface-200 dark:border-dark-border">
                      <td className="table-cell text-surface-900 dark:text-dark-text">{record.name}</td>
                      <td className="table-cell text-surface-500 dark:text-dark-muted">{record.TTL}s</td>
                      <td className="table-cell text-surface-500 dark:text-dark-muted">IN</td>
                      <td className="table-cell"><span className="rounded bg-brand-100 px-1.5 py-0.5 text-brand-700 dark:bg-brand-800 dark:text-brand-200">{typeName}</span></td>
                      <td className="table-cell text-surface-900 dark:text-dark-text break-all max-w-xs">{record.data}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Authority Section */}
          {data.Authority && data.Authority.length > 0 && (
            <div className="mt-3">
              <h4 className="text-xs font-semibold text-surface-600 dark:text-dark-muted mb-2 uppercase tracking-wide">Authority Records</h4>
              <div className="table-responsive rounded-lg border border-surface-200 dark:border-dark-border">
                <table className="table-base font-mono text-xs">
                  <thead>
                    <tr className="bg-surface-50 dark:bg-dark-surface">
                      <th className="table-header text-left text-surface-600 dark:text-dark-muted font-medium">Name</th>
                      <th className="table-header text-left text-surface-600 dark:text-dark-muted font-medium">TTL</th>
                      <th className="table-header text-left text-surface-600 dark:text-dark-muted font-medium">Type</th>
                      <th className="table-header text-left text-surface-600 dark:text-dark-muted font-medium">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.Authority.map((record, i) => {
                      const typeName = typeMapReverse[record.type] || `TYPE${record.type}`;
                      return (
                        <tr key={i} className="border-t border-surface-200 dark:border-dark-border">
                          <td className="table-cell text-surface-900 dark:text-dark-text">{record.name}</td>
                          <td className="table-cell text-surface-500 dark:text-dark-muted">{record.TTL}s</td>
                          <td className="table-cell"><span className="rounded bg-amber-100 px-1.5 py-0.5 text-amber-700 dark:bg-amber-800 dark:text-amber-200">{typeName}</span></td>
                          <td className="table-cell text-surface-900 dark:text-dark-text break-all max-w-xs">{record.data}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Additional Section */}
          {data.Additional && data.Additional.length > 0 && (
            <div className="mt-3">
              <h4 className="text-xs font-semibold text-surface-600 dark:text-dark-muted mb-2 uppercase tracking-wide">Additional Records</h4>
              <div className="table-responsive rounded-lg border border-surface-200 dark:border-dark-border">
                <table className="table-base font-mono text-xs">
                  <thead>
                    <tr className="bg-surface-50 dark:bg-dark-surface">
                      <th className="table-header text-left text-surface-600 dark:text-dark-muted font-medium">Name</th>
                      <th className="table-header text-left text-surface-600 dark:text-dark-muted font-medium">TTL</th>
                      <th className="table-header text-left text-surface-600 dark:text-dark-muted font-medium">Type</th>
                      <th className="table-header text-left text-surface-600 dark:text-dark-muted font-medium">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.Additional.map((record, i) => {
                      const typeName = typeMapReverse[record.type] || `TYPE${record.type}`;
                      return (
                        <tr key={i} className="border-t border-surface-200 dark:border-dark-border">
                          <td className="table-cell text-surface-900 dark:text-dark-text">{record.name}</td>
                          <td className="table-cell text-surface-500 dark:text-dark-muted">{record.TTL}s</td>
                          <td className="table-cell"><span className="rounded bg-emerald-100 px-1.5 py-0.5 text-emerald-700 dark:bg-emerald-800 dark:text-emerald-200">{typeName}</span></td>
                          <td className="table-cell text-surface-900 dark:text-dark-text break-all max-w-xs">{record.data}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Actions & Raw Response */}
          <div className="flex flex-wrap gap-2 mt-3">
            <button onClick={copyJson} className="text-xs text-brand-500 hover:text-brand-600">Copy as JSON</button>
            <button onClick={copyText} className="text-xs text-brand-500 hover:text-brand-600">Copy as text</button>
            <button onClick={() => setShowRaw(!showRaw)} className="text-xs text-surface-500 hover:text-surface-700 dark:text-dark-muted dark:hover:text-dark-text">
              {showRaw ? "Hide raw response" : "View raw response"}
            </button>
          </div>
          {showRaw && (
            <pre className="mt-2 rounded-lg border border-surface-200 bg-surface-50 p-3 text-xs font-mono text-surface-900 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text overflow-auto max-h-60 whitespace-pre-wrap">
              {JSON.stringify(data, null, 2)}
            </pre>
          )}

          {/* WHOIS / RDAP Summary */}
          {whoisLoading && (
            <div className="mt-3 rounded-lg border border-surface-200 bg-surface-50 p-3 text-xs text-surface-500 dark:border-dark-border dark:bg-dark-surface dark:text-dark-muted">
              Loading WHOIS/RDAP data…
            </div>
          )}
          {!whoisLoading && whoisError && (
            <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-400">
              {whoisError}
            </div>
          )}
          {!whoisLoading && whois && !whoisError && (
            <div className="mt-3 rounded-lg border border-surface-200 bg-surface-50 p-3 dark:border-dark-border dark:bg-dark-surface">
              <p className="text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">WHOIS / RDAP Summary</p>
              <div className="text-xs text-surface-700 dark:text-dark-text space-y-1">
                {whois.registrar && <p>Registrar: {whois.registrar}</p>}
                {whois.created && <p>Created: {new Date(whois.created).toLocaleDateString()}</p>}
                {whois.updated && <p>Updated: {new Date(whois.updated).toLocaleDateString()}</p>}
                {whois.expires && <p>Expires: {new Date(whois.expires).toLocaleDateString()}</p>}
                {whois.status && whois.status.length > 0 && <p>Status: {whois.status.join(", ")}</p>}
                {whois.nameservers && whois.nameservers.length > 0 && <p>Nameservers: {whois.nameservers.join(", ")}</p>}
                <p>DNSSEC: {whois.dnssec ? "Enabled" : "Not detected"}</p>
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
