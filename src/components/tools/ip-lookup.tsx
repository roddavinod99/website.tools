"use client";

import { useState, useCallback } from "react";

interface IpData {
  query?: string;
  country?: string;
  regionName?: string;
  city?: string;
  zip?: string;
  isp?: string;
  org?: string;
  as?: string;
  lat?: number;
  lon?: number;
  timezone?: string;
}

interface HistoryEntry {
  ip: string;
  data: IpData;
  timestamp: number;
}

export function IPLookup() {
  const [ip, setIp] = useState("");
  const [data, setData] = useState<IpData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("ip-lookup-history");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const lookup = useCallback(async (address: string) => {
    if (!address.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/ip-lookup?ip=${encodeURIComponent(address.trim())}`);
      const json = await res.json();
      if (json.error || json.status === "fail") {
        setError(json.error || json.message || "Lookup failed");
        setData(null);
      } else {
        const result: IpData = {
          query: json.query, country: json.country, regionName: json.regionName,
          city: json.city, zip: json.zip, isp: json.isp, org: json.org,
          as: json.as, lat: json.lat, lon: json.lon, timezone: json.timezone,
        };
        setData(result);
        setHistory((prev) => {
          const next = [{ ip: address.trim(), data: result, timestamp: Date.now() }, ...prev.filter((h) => h.ip !== address.trim())].slice(0, 10);
          localStorage.setItem("ip-lookup-history", JSON.stringify(next));
          return next;
        });
      }
    } catch {
      setError("Failed to lookup IP. Check your connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  const lookupSelf = useCallback(async () => {
    try {
      const res = await fetch("https://api.ipify.org?format=json");
      const json = await res.json();
      if (json.ip) { setIp(json.ip); lookup(json.ip); }
    } catch {
      setError("Could not detect your IP");
    }
  }, [lookup]);

  const copyResult = async () => {
    if (data) await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
  };

  const fields: { label: string; value: string | number | undefined }[] = data ? [
    { label: "IP Address", value: data.query },
    { label: "ISP", value: data.isp },
    { label: "Organization", value: data.org },
    { label: "Country", value: data.country },
    { label: "Region", value: data.regionName },
    { label: "City", value: data.city },
    { label: "ZIP Code", value: data.zip },
    { label: "Timezone", value: data.timezone },
    { label: "ASN", value: data.as },
  ] : [];

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input type="text" value={ip} onChange={(e) => setIp(e.target.value)} placeholder="Enter IP address (e.g. 8.8.8.8)"
          onKeyDown={(e) => e.key === "Enter" && lookup(ip)}
          className="flex-1 rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted" />
        <button onClick={() => lookup(ip)} disabled={loading || !ip.trim()}
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-40 transition-colors">
          {loading ? "Looking up..." : "Lookup"}
        </button>
        <button onClick={lookupSelf} disabled={loading}
          className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors whitespace-nowrap">
          My IP
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm font-medium text-red-700 dark:text-red-400">{error}</p>
          <button onClick={() => lookup(ip)} className="mt-1 text-xs text-brand-500 hover:text-brand-600">Retry</button>
        </div>
      )}

      {data && (
        <div className="space-y-2">
          {data.lat !== undefined && data.lon !== undefined && (
            <div className="mb-2 rounded-lg border border-surface-200 overflow-hidden dark:border-dark-border">
              <div className="bg-surface-50 dark:bg-dark-surface p-2 text-xs text-surface-500 dark:text-dark-muted">
                {data.lat.toFixed(4)}, {data.lon.toFixed(4)}
              </div>
              <div className="bg-white dark:bg-dark-surface p-4 text-center text-xs text-surface-400 dark:text-dark-muted border-t border-surface-200 dark:border-dark-border">
                Map: {data.lat.toFixed(4)}°N, {data.lon.toFixed(4)}°E
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {fields.map((f) => f.value !== undefined && f.value !== "" && (
              <div key={f.label} className="flex items-center justify-between rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 dark:border-dark-border dark:bg-dark-surface">
                <span className="text-xs text-surface-500 dark:text-dark-muted">{f.label}</span>
                <span className="text-sm font-mono text-surface-900 dark:text-dark-text">{String(f.value)}</span>
              </div>
            ))}
          </div>
          <button onClick={copyResult} className="text-xs text-brand-500 hover:text-brand-600">Copy results as JSON</button>
        </div>
      )}

      {history.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">History</label>
          <div className="flex flex-wrap gap-1">
            {history.map((h) => (
              <button key={h.ip} onClick={() => { setIp(h.ip); setData(h.data); setError(""); }}
                className="rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:hover:bg-dark-surface transition-colors">
                {h.ip}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
