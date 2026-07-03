"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

type IpType = "public" | "private" | "loopback" | "link-local" | "multicast" | "reserved";

interface SubnetInfo {
  network: string; broadcast: string; firstHost: string; lastHost: string;
  netmask: string; wildcard: string; totalHosts: number; usableHosts: number;
  cidr: number; ipClass: string; ipType: IpType; binaryIp: string; binaryMask: string; hexIp: string;
}

interface HistoryEntry { input: string; timestamp: number }

function ipToLong(ip: string): number {
  return ip.split(".").reduce((acc, oct) => (acc << 8) + (parseInt(oct, 10) || 0), 0) >>> 0;
}
function longToIp(n: number): string {
  return [(n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff].join(".");
}
function cidrToMask(cidr: number): number {
  return cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0;
}
function toBinary(n: number): string { return n.toString(2).padStart(32, "0"); }
function getIpClass(first: number): string {
  if (first <= 126) return "A"; if (first <= 191) return "B"; if (first <= 223) return "C"; if (first <= 239) return "D"; return "E";
}
function getIpType(ip: number): IpType {
  const f = (ip >>> 24) & 0xff, s = (ip >>> 16) & 0xff;
  if (f === 10 || (f === 172 && s >= 16 && s <= 31) || (f === 192 && s === 168)) return "private";
  if (f === 127) return "loopback"; if (f === 169 && s === 254) return "link-local";
  if (f >= 224 && f <= 239) return "multicast"; if (f >= 240) return "reserved"; return "public";
}
function expandIPv6(addr: string): string {
  try {
    const parts = addr.split("::");
    if (parts.length === 2) {
      const l = parts[0] ? parts[0].split(":") : [], r = parts[1] ? parts[1].split(":") : [];
      return [...l, ...Array(8 - l.length - r.length).fill("0000"), ...r].map(s => s.padStart(4, "0")).join(":");
    }
    return addr.split(":").map(s => s.padStart(4, "0")).join(":");
  } catch { return addr; }
}
function compressIPv6(addr: string): string {
  const exp = expandIPv6(addr).replace(/\b0+\b/g, "0");
  let best = exp, longest = 0;
  for (let i = 0; i < 8; i++) for (let j = i + 1; j <= 8; j++) {
    if (exp.split(":").slice(i, j).every(s => s === "0") && j - i > longest) { longest = j - i; best = exp.replace(exp.split(":").slice(i, j).join(":"), "::").replace(/:::/g, "::"); }
  }
  return best.replace(/\b0+(?=[0-9a-f])/g, "").replace(/^::/, "::").replace(/:$/, "");
}

function calculateSubnet(ip: string, cidr: number): SubnetInfo | null {
  const parts = ip.trim().split(".");
  if (parts.length !== 4 || parts.some(p => isNaN(parseInt(p, 10)) || parseInt(p, 10) < 0 || parseInt(p, 10) > 255) || cidr < 0 || cidr > 32) return null;
  const ipLong = ipToLong(ip.trim()), mask = cidrToMask(cidr), network = ipLong & mask, broadcast = cidr === 32 ? network : (network | (~mask >>> 0));
  const wildcard = ~mask >>> 0, first = cidr >= 31 ? network : network + 1, last = cidr >= 31 ? broadcast : broadcast - 1;
  return {
    network: longToIp(network), broadcast: longToIp(broadcast), firstHost: longToIp(first), lastHost: longToIp(last),
    netmask: longToIp(mask), wildcard: longToIp(wildcard), totalHosts: 2 ** (32 - cidr), usableHosts: cidr >= 31 ? 2 ** (32 - cidr) : 2 ** (32 - cidr) - 2,
    cidr, ipClass: getIpClass((ipLong >>> 24) & 0xff), ipType: getIpType(ipLong),
    binaryIp: toBinary(ipLong), binaryMask: toBinary(mask), hexIp: `0x${ipLong.toString(16).toUpperCase().padStart(8, "0")}`,
  };
}

const IP_TYPE_COLORS: Record<IpType, string> = {
  public: "text-green-600 dark:text-green-400", private: "text-amber-600 dark:text-amber-400",
  loopback: "text-blue-600 dark:text-blue-400", "link-local": "text-purple-600 dark:text-purple-400",
  multicast: "text-orange-600 dark:text-orange-400", reserved: "text-red-600 dark:text-red-400",
};

export function IpCalculator() {
  const [ip, setIp] = useState("192.168.1.0");
  const [cidr, setCidr] = useState(24);
  const [result, setResult] = useState<SubnetInfo | null>(null);
  const [error, setError] = useState("");
  const [copyFeedback, setCopyFeedback] = useState("");
  const [showSubnets, setShowSubnets] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    try { const s = localStorage.getItem("ipcalc_history"); if (s) return JSON.parse(s); } catch { /* empty */ }
    return [];
  });
  const [ipv6Input, setIpv6Input] = useState("");

  useEffect(() => { if (history.length > 0) localStorage.setItem("ipcalc_history", JSON.stringify(history.slice(0, 20))); }, [history]);

  const calculate = () => {
    setError("");
    const r = calculateSubnet(ip, cidr);
    if (!r) { setError("Invalid IP address or CIDR prefix"); setResult(null); return; }
    setResult(r); setShowSubnets(false);
    setHistory(prev => [{ input: `${ip}/${cidr}`, timestamp: Date.now() }, ...prev.filter(e => e.input !== `${ip}/${cidr}`)].slice(0, 20));
  };

  const copyValue = async (label: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopyFeedback(`${label} copied`);
    setTimeout(() => setCopyFeedback(""), 2000);
  };

  const subnets = result && cidr < 32
    ? Array.from({ length: 2 ** ((cidr < 24 ? 24 : 32) - cidr) }, (_, i) => {
        const step = 2 ** (32 - cidr), net = ipToLong(result.network) + i * step;
        return calculateSubnet(longToIp(net), cidr < 24 ? 24 : 32);
      }).filter(Boolean) as SubnetInfo[]
    : [];

  const inputCls = "w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted";

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">IPv4 Address</label>
          <input type="text" value={ip} onChange={e => setIp(e.target.value)} placeholder="192.168.1.0" onKeyDown={e => e.key === "Enter" && calculate()} className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">CIDR Prefix</label>
          <div className="flex gap-2">
            <input type="number" value={cidr} onChange={e => setCidr(Math.max(0, Math.min(32, parseInt(e.target.value) || 24)))} min={0} max={32}
              className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
            <button onClick={calculate} className="shrink-0 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors">Calculate</button>
          </div>
        </div>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400">{error}</div>}

      {result && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {((): { label: string; value: string; cls?: string }[] => [
              { label: "Network", value: `${result.network}/${result.cidr}` },
              { label: "Broadcast", value: result.broadcast }, { label: "First Host", value: result.firstHost },
              { label: "Last Host", value: result.lastHost }, { label: "Netmask", value: result.netmask },
              { label: "Wildcard", value: result.wildcard }, { label: "Total Hosts", value: result.totalHosts.toLocaleString() },
              { label: "Usable Hosts", value: result.usableHosts.toLocaleString() }, { label: "IP Class", value: `Class ${result.ipClass}` },
              { label: "Type", value: result.ipType, cls: IP_TYPE_COLORS[result.ipType] }, { label: "Hex", value: result.hexIp },
              { label: "Netmask (CIDR)", value: `/${result.cidr}` },
            ])().map(f => (
              <div key={f.label} className="group relative rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 dark:border-dark-border dark:bg-dark-surface cursor-pointer" onClick={() => copyValue(f.label, f.value)}>
                <span className="block text-[10px] uppercase tracking-wider text-surface-400 dark:text-dark-muted">{f.label}</span>
                <span className={cn("block text-sm font-mono text-surface-900 dark:text-dark-text truncate", f.cls)}>{f.value}</span>
                <span className="absolute top-1 right-1 text-[9px] text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity">copy</span>
              </div>
            ))}
          </div>

          <div className="space-y-1">
            {[["Binary IP", result.binaryIp], ["Binary Mask", result.binaryMask]].map(([label, binary]) => (
              <div key={label as string}>
                <span className="text-xs font-medium text-surface-500 dark:text-dark-muted">{label as string}</span>
                <div className="flex gap-0.5 font-mono text-xs bg-surface-50 dark:bg-dark-surface rounded-lg border border-surface-200 dark:border-dark-border p-2">
                  {(binary as string).match(/.{1,8}/g)?.map((oct, i) => (
                    <span key={i} className={cn("px-1", (["text-red-500", "text-green-500", "text-blue-500", "text-purple-500"])[i % 4])}>{oct}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {cidr < 32 && (
            <div>
              <button onClick={() => setShowSubnets(v => !v)} className="flex items-center gap-1 text-sm font-medium text-brand-500 hover:text-brand-600 transition-colors">
                <span className={cn("transition-transform", showSubnets && "rotate-90")}>▶</span>
                Subnet Breakdown ({subnets.length} subnets /{cidr < 24 ? "24" : "32"})
              </button>
              {showSubnets && (
                <div className="mt-2 max-h-40 overflow-y-auto space-y-1">
                  {subnets.slice(0, 32).map((s, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border border-surface-200 bg-surface-50 px-3 py-1.5 text-xs font-mono dark:border-dark-border dark:bg-dark-surface">
                      <span className="text-surface-600 dark:text-dark-muted">#{i + 1}</span>
                      <span className="text-surface-900 dark:text-dark-text">{s.network}/{s.cidr}</span>
                      <span className="text-surface-500 dark:text-dark-muted">{s.firstHost} – {s.lastHost}</span>
                      <span className="text-surface-400 dark:text-dark-muted">{s.usableHosts.toLocaleString()} hosts</span>
                    </div>
                  ))}
                  {subnets.length > 32 && <div className="text-xs text-surface-400 dark:text-dark-muted text-center py-1">+{subnets.length - 32} more</div>}
                </div>
              )}
            </div>
          )}

          {result.cidr >= 16 && result.cidr <= 24 && (
            <div className="rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 dark:border-dark-border dark:bg-dark-surface">
              <span className="text-xs font-medium text-surface-500 dark:text-dark-muted">Supernet Suggestion</span>
              <p className="text-sm font-mono text-surface-900 dark:text-dark-text mt-0.5">
                {result.network.split(".").slice(0, result.cidr <= 16 ? 2 : 3).join(".")}.0/{result.cidr <= 16 ? 16 : 24}
              </p>
            </div>
          )}
        </>
      )}

      <div className="border-t border-surface-200 dark:border-dark-border pt-3">
        <details>
          <summary className="text-xs font-medium text-surface-500 dark:text-dark-muted cursor-pointer hover:text-surface-700 dark:hover:text-dark-text transition-colors">IPv6 Tool</summary>
          <div className="mt-2 space-y-2">
            <input type="text" value={ipv6Input} onChange={e => setIpv6Input(e.target.value)} placeholder="fe80::1" className={inputCls} />
            {ipv6Input && (
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 dark:border-dark-border dark:bg-dark-surface">
                  <span className="block text-[10px] uppercase tracking-wider text-surface-400 dark:text-dark-muted">Expanded</span>
                  <span className="block text-xs font-mono text-surface-900 dark:text-dark-text break-all">{expandIPv6(ipv6Input)}</span>
                </div>
                <div className="rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 dark:border-dark-border dark:bg-dark-surface">
                  <span className="block text-[10px] uppercase tracking-wider text-surface-400 dark:text-dark-muted">Compressed</span>
                  <span className="block text-xs font-mono text-surface-900 dark:text-dark-text break-all">{compressIPv6(ipv6Input)}</span>
                </div>
              </div>
            )}
          </div>
        </details>
      </div>

      {copyFeedback && (
        <div className="fixed bottom-4 right-4 rounded-lg bg-brand-500 px-4 py-2 text-sm text-white shadow-lg animate-fade-in">{copyFeedback}</div>
      )}

      {history.length > 0 && (
        <div className="border-t border-surface-200 dark:border-dark-border pt-2">
          <span className="text-[10px] uppercase tracking-wider text-surface-400 dark:text-dark-muted font-medium">Recent</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {history.slice(0, 5).map(e => (
              <button key={e.input} onClick={() => { const [h, c] = e.input.split("/"); setIp(h); setCidr(parseInt(c, 10)); }}
                className="rounded-md border border-surface-200 bg-surface-50 px-2 py-0.5 text-[11px] font-mono text-surface-600 hover:bg-surface-100 dark:border-dark-border dark:bg-dark-surface dark:text-dark-muted dark:hover:bg-dark-border transition-colors"
              >{e.input}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
