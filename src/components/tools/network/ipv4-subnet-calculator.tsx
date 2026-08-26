"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface SubnetResult {
  networkAddress: string;
  broadcastAddress: string;
  subnetMask: string;
  wildcardMask: string;
  hostRange: string;
  firstHost: string;
  lastHost: string;
  totalHosts: number;
  usableHosts: number;
  cidr: number;
  ipClass: string;
}

function ipToLong(ip: string): number {
  return ip.split(".").reduce((acc, oct) => (acc << 8) + (parseInt(oct, 10) || 0), 0) >>> 0;
}

function longToIp(n: number): string {
  return [(n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff].join(".");
}

function cidrToMask(cidr: number): number {
  return cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0;
}

function maskToCidr(mask: string): number | null {
  const maskLong = ipToLong(mask);
  const expected = cidrToMask(maskLong.toString(2).split("1").length - 1);
  if ((maskLong >>> 0) !== (expected >>> 0)) return null;
  return maskLong.toString(2).split("1").length - 1;
}

function isValidIp(ip: string): boolean {
  const parts = ip.split(".");
  return parts.length === 4 && parts.every(p => {
    const n = parseInt(p, 10);
    return !isNaN(n) && n >= 0 && n <= 255 && String(n) === p;
  });
}

function getIpClass(ipLong: number): string {
  const firstOctet = (ipLong >>> 24) & 0xff;
  if (firstOctet >= 1 && firstOctet <= 126) return "A";
  if (firstOctet >= 128 && firstOctet <= 191) return "B";
  if (firstOctet >= 192 && firstOctet <= 223) return "C";
  if (firstOctet >= 224 && firstOctet <= 239) return "D (Multicast)";
  if (firstOctet >= 240 && firstOctet <= 255) return "E (Reserved)";
  return "N/A";
}

function calculate(input: string): SubnetResult | null {
  const trimmed = input.trim();
  let ip: string;
  let cidr: number;

  const cidrMatch = trimmed.match(/^(\d+\.\d+\.\d+\.\d+)\/(\d{1,2})$/);
  const maskMatch = trimmed.match(/^(\d+\.\d+\.\d+\.\d+)\s+(\d+\.\d+\.\d+\.\d+)$/);
  const slashMask = trimmed.match(/^(\d+\.\d+\.\d+\.\d+)\/(\d+\.\d+\.\d+\.\d+)$/);

  if (cidrMatch) {
    ip = cidrMatch[1];
    cidr = parseInt(cidrMatch[2], 10);
  } else if (maskMatch) {
    ip = maskMatch[1];
    const parsed = maskToCidr(maskMatch[2]);
    if (parsed === null) return null;
    cidr = parsed;
  } else if (slashMask) {
    ip = slashMask[1];
    const parsed = maskToCidr(slashMask[2]);
    if (parsed === null) return null;
    cidr = parsed;
  } else {
    return null;
  }

  if (!isValidIp(ip) || cidr < 0 || cidr > 32) return null;

  const ipLong = ipToLong(ip);
  const mask = cidrToMask(cidr);
  const network = ipLong & mask;
  const broadcast = cidr === 32 ? network : (network | (~mask >>> 0));
  const wildcard = ~mask >>> 0;
  const firstHost = cidr >= 31 ? network : network + 1;
  const lastHost = cidr >= 31 ? broadcast : broadcast - 1;
  const totalHosts = 2 ** (32 - cidr);
  const usableHosts = cidr >= 31 ? totalHosts : totalHosts - 2;

  return {
    networkAddress: longToIp(network),
    broadcastAddress: longToIp(broadcast),
    subnetMask: longToIp(mask),
    wildcardMask: longToIp(wildcard),
    hostRange: cidr >= 31 ? `${longToIp(firstHost)} - ${longToIp(lastHost)} (single host)` : `${longToIp(firstHost)} - ${longToIp(lastHost)}`,
    firstHost: longToIp(firstHost),
    lastHost: longToIp(lastHost),
    totalHosts,
    usableHosts,
    cidr,
    ipClass: getIpClass(ipLong),
  };
}

export function Ipv4SubnetCalculator() {
  const [input, setInput] = useState("192.168.1.0/24");
  const [result, setResult] = useState<SubnetResult | null>(null);
  const [error, setError] = useState("");
  const [copyFeedback, setCopyFeedback] = useState("");

  const navigateSubnet = (direction: "prev" | "next") => {
    if (!result) return;
    const step = direction === "next" ? (result.totalHosts) : (-result.totalHosts);
    const currentNetworkLong = ipToLong(result.networkAddress);
    const newNetworkLong = (currentNetworkLong + step) >>> 0;
    const newIp = longToIp(newNetworkLong);
    const newInput = `${newIp}/${result.cidr}`;
    setInput(newInput);
    const r = calculate(newInput);
    if (r) {
      setResult(r);
      setError("");
    }
  };

  const calculateSubnet = () => {
    setError("");
    const r = calculate(input);
    if (!r) {
      setError("Invalid input. Use CIDR (e.g., 192.168.1.0/24) or IP + mask (e.g., 192.168.1.0 255.255.255.0)");
      setResult(null);
      return;
    }
    setResult(r);
  };

  const copyValue = async (label: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopyFeedback(`${label} copied`);
    setTimeout(() => setCopyFeedback(""), 2000);
  };

  const fields: { label: string; value: string }[] = result ? [
    { label: "Network Address", value: `${result.networkAddress}/${result.cidr}` },
    { label: "Broadcast Address", value: result.broadcastAddress },
    { label: "Subnet Mask", value: result.subnetMask },
    { label: "Wildcard Mask", value: result.wildcardMask },
    { label: "Host Range", value: result.hostRange },
    { label: "Total Hosts", value: result.totalHosts.toLocaleString() },
    { label: "Usable Hosts", value: result.usableHosts.toLocaleString() },
    { label: "CIDR Notation", value: `/${result.cidr}` },
    { label: "IP Class", value: `Class ${result.ipClass}` },
  ] : [];

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <label className="block text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">IPv4 Subnet Input</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && calculateSubnet()}
            placeholder="192.168.1.0/24 or 192.168.1.0 255.255.255.0"
            className="flex-1 rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted"
          />
          <button onClick={calculateSubnet} className="shrink-0 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors">Calculate</button>
        </div>
        <p className="mt-1 text-[11px] text-surface-400 dark:text-dark-muted">
          Supports: CIDR (192.168.1.0/24), IP + mask (192.168.1.0 255.255.255.0), or IP/slash-mask (192.168.1.0/255.255.255.0)
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400">{error}</div>
      )}

      {result && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {fields.map(f => (
            <div
              key={f.label}
              className="group relative rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 dark:border-dark-border dark:bg-dark-surface cursor-pointer"
              onClick={() => copyValue(f.label, f.value)}
            >
              <span className="block text-[10px] uppercase tracking-wider text-surface-400 dark:text-dark-muted">{f.label}</span>
              <span className="block text-sm font-mono text-surface-900 dark:text-dark-text truncate">{f.value}</span>
              <span className="absolute top-1 right-1 text-[9px] text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity">copy</span>
            </div>
          ))}
        </div>
      )}

      {result && result.cidr > 0 && result.cidr < 32 && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigateSubnet("prev")}
            className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors"
          >
            ← Previous Subnet
          </button>
          <span className="text-xs text-surface-500 dark:text-dark-muted">
            {result.networkAddress}/{result.cidr}
          </span>
          <button
            onClick={() => navigateSubnet("next")}
            className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors"
          >
            Next Subnet →
          </button>
        </div>
      )}

      {result && (
        <div className="rounded-lg border border-surface-200 bg-surface-50 px-3 py-3 dark:border-dark-border dark:bg-dark-surface">
          <span className="block text-[10px] uppercase tracking-wider text-surface-400 dark:text-dark-muted mb-2">Binary View</span>
          <div className="space-y-1 font-mono text-xs">
            <div className="flex gap-2">
              <span className="w-20 text-surface-500 dark:text-dark-muted shrink-0">Address</span>
              <div className="flex gap-0.5 flex-wrap">
                {ipToLong(result.networkAddress).toString(2).padStart(32, "0").match(/.{1,8}/g)?.map((oct, i) => (
                  <span key={i} className={cn("px-1", ["text-red-500", "text-green-500", "text-blue-500", "text-purple-500"][i])}>{oct}</span>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <span className="w-20 text-surface-500 dark:text-dark-muted shrink-0">Mask</span>
              <div className="flex gap-0.5 flex-wrap">
                {cidrToMask(result.cidr).toString(2).padStart(32, "0").match(/.{1,8}/g)?.map((oct, i) => (
                  <span key={i} className={cn("px-1", ["text-red-500", "text-green-500", "text-blue-500", "text-purple-500"][i])}>{oct}</span>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <span className="w-20 text-surface-500 dark:text-dark-muted shrink-0">Wildcard</span>
              <div className="flex gap-0.5 flex-wrap">
                {((~cidrToMask(result.cidr)) >>> 0).toString(2).padStart(32, "0").match(/.{1,8}/g)?.map((oct, i) => (
                  <span key={i} className={cn("px-1", ["text-red-500", "text-green-500", "text-blue-500", "text-purple-500"][i])}>{oct}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {copyFeedback && (
        <div className="fixed bottom-4 right-4 rounded-lg bg-brand-500 px-4 py-2 text-sm text-white shadow-lg animate-fade-in">{copyFeedback}</div>
      )}
    </div>
  );
}
