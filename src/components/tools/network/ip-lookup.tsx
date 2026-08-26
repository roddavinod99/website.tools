"use client";

import { useState, useCallback } from "react";
import { getStorageJSON, setStorageJSON } from "@/lib/client-storage";

interface IpApiResponse {
  query?: string;
  country?: string;
  countryCode?: string;
  region?: string;
  regionName?: string;
  city?: string;
  zip?: string;
  lat?: number;
  lon?: number;
  timezone?: string;
  isp?: string;
  org?: string;
  as?: string;
  asname?: string;
  reverse?: string;
  mobile?: boolean;
  proxy?: boolean;
  hosting?: boolean;
  status?: string;
  message?: string;
  error?: string;
}

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
  asname?: string;
  reverse?: string;
  mobile?: boolean;
  proxy?: boolean;
  hosting?: boolean;
}

interface HistoryEntry {
  ip: string;
  data: IpData;
  timestamp: number;
}

export function IPLookup() {
  const [ip, setIp] = useState("");
  const [data, setData] = useState<IpData | null>(null);
  const [rawApiResponse, setRawApiResponse] = useState<IpApiResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>(() => getStorageJSON<HistoryEntry[]>("ip-lookup-history") || []);

  const lookup = useCallback(async (address: string) => {
    if (!address.trim()) return;
    setLoading(true);
    setError("");
    setShowRaw(false);
    try {
      const res = await fetch(`/api/ip-lookup?ip=${encodeURIComponent(address.trim())}`);
      const json: IpApiResponse = await res.json();
      if (json.error || json.status === "fail") {
        setError(json.error || json.message || "Lookup failed");
        setData(null);
        setRawApiResponse(null);
      } else {
        const result: IpData = {
          query: json.query, country: json.country, regionName: json.regionName,
          city: json.city, zip: json.zip, isp: json.isp, org: json.org,
          as: json.as, lat: json.lat, lon: json.lon, timezone: json.timezone,
          asname: json.asname, reverse: json.reverse, mobile: json.mobile,
          proxy: json.proxy, hosting: json.hosting,
        };
        setData(result);
        setRawApiResponse(json);
        setHistory((prev) => {
          const next = [{ ip: address.trim(), data: result, timestamp: Date.now() }, ...prev.filter((h) => h.ip !== address.trim())].slice(0, 10);
          setStorageJSON("ip-lookup-history", next);
          return next;
        });
      }
    } catch {
      setError("Failed to lookup IP. Check your connection.");
      setData(null);
      setRawApiResponse(null);
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
    if (rawApiResponse) await navigator.clipboard.writeText(JSON.stringify(rawApiResponse, null, 2));
  };

  const parseAsn = (as?: string) => {
    if (!as) return { number: "", name: "" };
    const match = as.match(/^AS(\d+)\s+(.+)$/);
    if (match) return { number: `AS${match[1]}`, name: match[2] };
    return { number: as, name: "" };
  };

  const asnInfo = data?.as ? parseAsn(data.as) : { number: "", name: data?.asname || "" };

  const fields: { label: string; value: string | number | undefined }[] = data ? [
    { label: "IP Address", value: data.query },
    { label: "ISP", value: data.isp },
    { label: "Organization", value: data.org },
    { label: "ASN", value: asnInfo.number || asnInfo.name },
    { label: "Country", value: data.country },
    { label: "Region", value: data.regionName },
    { label: "City", value: data.city },
    { label: "ZIP Code", value: data.zip },
    { label: "Timezone", value: data.timezone },
    { label: "Reverse DNS", value: data.reverse },
    { label: "Connection Type", value: [
      data.hosting && "Hosting",
      data.proxy && "Proxy/VPN",
      data.mobile && "Mobile",
    ].filter(Boolean).join(", ") || "Residential" },
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

      <div className="flex flex-wrap gap-2">
        <button onClick={copyResult} disabled={!rawApiResponse} className="text-xs text-brand-500 hover:text-brand-600 disabled:opacity-40">Copy full JSON response</button>
        <button onClick={() => setShowRaw(!showRaw)} disabled={!rawApiResponse} className="text-xs text-surface-500 hover:text-surface-700 dark:text-dark-muted dark:hover:text-dark-text disabled:opacity-40">
          {showRaw ? "Hide raw response" : "View raw response"}
        </button>
      </div>

      {data && (
        <div className="space-y-3">
          {data.lat !== undefined && data.lon !== undefined && (
            <div className="rounded-lg border border-surface-200 overflow-hidden dark:border-dark-border">
              <div className="bg-surface-50 dark:bg-dark-surface p-2 text-xs text-surface-500 dark:text-dark-muted">
                {data.lat.toFixed(4)}°N, {data.lon.toFixed(4)}°E
              </div>
              <div className="bg-white dark:bg-dark-surface p-4 text-center text-xs text-surface-400 dark:text-dark-muted border-t border-surface-200 dark:border-dark-border">
                Map: {data.lat.toFixed(4)}°N, {data.lon.toFixed(4)}°E
              </div>
            </div>
          )}

          <div data-testid="tool-output" className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {fields.map((f) => f.value !== undefined && f.value !== "" && (
              <div key={f.label} className="flex items-center justify-between rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 dark:border-dark-border dark:bg-dark-surface">
                <span className="text-xs text-surface-500 dark:text-dark-muted">{f.label}</span>
                <span className="text-sm font-mono text-surface-900 dark:text-dark-text">{String(f.value)}</span>
              </div>
            ))}
          </div>

          {showRaw && rawApiResponse && (
            <div className="mt-3">
              <pre className="rounded-lg border border-surface-200 bg-surface-50 p-3 text-xs font-mono text-surface-900 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text overflow-auto max-h-60 whitespace-pre-wrap">
                {JSON.stringify(rawApiResponse, null, 2)}
              </pre>
            </div>
          )}
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