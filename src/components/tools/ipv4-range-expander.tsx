"use client";

import { useState } from "react";

interface RangeResult {
  network: string;
  cidr: number;
  ips: string[];
  total: number;
}

function ipToLong(ip: string): number | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  const nums = parts.map(p => parseInt(p, 10));
  if (nums.some(n => isNaN(n) || n < 0 || n > 255 || String(n) !== parts[nums.indexOf(n)])) return null;
  return (nums[0] << 24 | nums[1] << 16 | nums[2] << 8 | nums[3]) >>> 0;
}

function longToIp(n: number): string {
  return [(n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff].join(".");
}

function expandCidr(input: string): RangeResult | null {
  const match = input.trim().match(/^(\d+\.\d+\.\d+\.\d+)\/(\d{1,2})$/);
  if (!match) return null;

  const ip = match[1];
  const cidr = parseInt(match[2], 10);
  if (cidr < 0 || cidr > 32) return null;

  const ipLong = ipToLong(ip);
  if (ipLong === null) return null;

  const mask = cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0;
  const network = (ipLong & mask) >>> 0;
  const total = 2 ** (32 - cidr);

  if (total > 65536) return null;

  const ips: string[] = [];
  for (let i = 0; i < total; i++) {
    ips.push(longToIp((network + i) >>> 0));
  }

  return { network: longToIp(network), cidr, ips, total };
}

export function Ipv4RangeExpander() {
  const [input, setInput] = useState("192.168.1.0/30");
  const [result, setResult] = useState<RangeResult | null>(null);
  const [error, setError] = useState("");
  const [copyFeedback, setCopyFeedback] = useState("");
  const [showAll, setShowAll] = useState(false);

  const expand = () => {
    setError("");
    setShowAll(false);
    const r = expandCidr(input);
    if (!r) {
      const match = input.trim().match(/^(\d+\.\d+\.\d+\.\d+)\/(\d{1,2})$/);
      if (match) {
        const cidr = parseInt(match[2], 10);
        if (cidr < 0 || cidr > 32) {
          setError("Invalid CIDR prefix (must be 0-32)");
        } else {
          setError("Range too large to display (max /16). Use a smaller range.");
        }
      } else {
        setError("Invalid input. Use CIDR notation (e.g., 192.168.1.0/30)");
      }
      setResult(null);
      return;
    }
    setResult(r);
  };

  const copyAll = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.ips.join("\n"));
    setCopyFeedback("All IPs copied");
    setTimeout(() => setCopyFeedback(""), 2000);
  };

  const copyOne = async (ip: string) => {
    await navigator.clipboard.writeText(ip);
    setCopyFeedback(`${ip} copied`);
    setTimeout(() => setCopyFeedback(""), 2000);
  };

  const visibleIps = result ? (showAll ? result.ips : result.ips.slice(0, 64)) : [];

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <label className="block text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">CIDR Range</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && expand()}
            placeholder="192.168.1.0/30"
            className="flex-1 rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted"
          />
          <button onClick={expand} className="shrink-0 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors">Expand</button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400">{error}</div>
      )}

      {result && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <div className="rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 dark:border-dark-border dark:bg-dark-surface">
              <span className="block text-[10px] uppercase tracking-wider text-surface-400 dark:text-dark-muted">Network</span>
              <span className="block text-sm font-mono text-surface-900 dark:text-dark-text">{result.network}/{result.cidr}</span>
            </div>
            <div className="rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 dark:border-dark-border dark:bg-dark-surface">
              <span className="block text-[10px] uppercase tracking-wider text-surface-400 dark:text-dark-muted">Total IPs</span>
              <span className="block text-sm font-mono text-surface-900 dark:text-dark-text">{result.total.toLocaleString()}</span>
            </div>
            <div className="rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 dark:border-dark-border dark:bg-dark-surface">
              <span className="block text-[10px] uppercase tracking-wider text-surface-400 dark:text-dark-muted">Usable Hosts</span>
              <span className="block text-sm font-mono text-surface-900 dark:text-dark-text">{result.cidr >= 31 ? result.total : Math.max(0, result.total - 2)}</span>
            </div>
          </div>

          {result.total > 1024 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
              Warning: This range contains {result.total.toLocaleString()} addresses. Only the first 64 are shown by default.
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-surface-500 dark:text-dark-muted">IP Addresses ({visibleIps.length} of {result.total.toLocaleString()})</span>
              <button onClick={copyAll} className="rounded-lg border border-surface-200 px-3 py-1 text-xs font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors">
                Copy All
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto rounded-lg border border-surface-200 dark:border-dark-border">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px bg-surface-200 dark:bg-dark-border">
                {visibleIps.map((ip, i) => (
                  <button
                    key={i}
                    onClick={() => copyOne(ip)}
                    className="bg-white px-3 py-1.5 text-xs font-mono text-surface-700 hover:bg-brand-50 dark:bg-dark-bg dark:text-dark-text dark:hover:bg-dark-surface text-left transition-colors"
                  >
                    <span className="text-surface-400 dark:text-dark-muted mr-1">{i + 1}.</span>
                    {ip}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {result.total > 64 && !showAll && (
            <button onClick={() => setShowAll(true)} className="w-full rounded-lg border border-surface-200 px-3 py-2 text-sm text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors">
              Show all {result.total.toLocaleString()} addresses
            </button>
          )}
        </>
      )}

      {copyFeedback && (
        <div className="fixed bottom-4 right-4 rounded-lg bg-brand-500 px-4 py-2 text-sm text-white shadow-lg animate-fade-in">{copyFeedback}</div>
      )}
    </div>
  );
}
