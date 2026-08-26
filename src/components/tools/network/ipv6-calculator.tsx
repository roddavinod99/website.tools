"use client";

import { useMemo, useState } from "react";

interface IPv6Result {
  groups: string[];
  valid: boolean;
  error?: string;
}

function validateIPv6(input: string): IPv6Result {
  if (!input.trim()) return { groups: [], valid: false, error: "IPv6 address is required" };
  const s = input.replace(/\[(.*)\]:\d+$/, "$1").trim();
  if (s.split("::").length > 2) {
    return { groups: [], valid: false, error: "Only one '::' compression is allowed" };
  }
  if (!/^[0-9a-fA-F:]+$/.test(s)) {
    return { groups: [], valid: false, error: "IPv6 may only contain hex digits and colons" };
  }
  const [head, tail] = s.split("::");
  const headGroups = head && head.length ? head.split(":") : [];
  const tailGroups = tail && tail.length ? tail.split(":") : [];
  const parts = [...headGroups, ...tailGroups];
  if (parts.some((p) => p.length > 4)) {
    return { groups: [], valid: false, error: "A group cannot exceed 4 hex digits" };
  }
  if (parts.some((p) => !/^[0-9a-fA-F]*$/.test(p))) {
    return { groups: [], valid: false, error: "Each group must contain only hex digits" };
  }
  const total = headGroups.length + tailGroups.length;
  const compressed = s.includes("::");
  if (!compressed && total !== 8) {
    return { groups: [], valid: false, error: "An IPv6 address without '::' must have exactly 8 groups" };
  }
  if (compressed && total > 8) {
    return { groups: [], valid: false, error: "Expanded address has more than 8 groups" };
  }
  const fullGroups: string[] = [];
  if (compressed) {
    const missing = 8 - total;
    fullGroups.push(...headGroups);
    for (let i = 0; i < missing; i++) fullGroups.push("0");
    fullGroups.push(...tailGroups);
  } else {
    fullGroups.push(...parts);
  }
  return { groups: fullGroups, valid: true };
}

function expand(groups: string[]): string {
  return groups.map((g) => g.padStart(4, "0")).join(":");
}

function compress(groups: string[]): string {
  const hex = groups.map((g) => g.padStart(4, "0"));
  let bestStart = -1;
  let bestLen = 0;
  for (let i = 0; i < hex.length; i++) {
    if (hex[i] === "0000") {
      let j = i;
      while (j < hex.length && hex[j] === "0000") j++;
      const len = j - i;
      if (len > bestLen) {
        bestLen = len;
        bestStart = i;
      }
      i = j - 1;
    }
  }
  const trimmed = hex.map((g) => g.replace(/^0+(?=[0-9a-f])/, ""));
  if (bestLen <= 1 || bestStart < 0) return trimmed.join(":");
  const before = trimmed.slice(0, bestStart);
  const after = trimmed.slice(bestStart + bestLen);
  const beforeStr = before.length ? before.join(":") + ":" : "";
  const afterStr = after.length ? ":" + after.join(":") : "";
  return `${beforeStr}::${afterStr}`.replace(/^:/, "").replace(/:$/, "");
}

function classify(groups: string[]): string {
  const first = parseInt(groups[0], 16);
  if (first === 0 && groups.every((g) => g === "0")) return "Unspecified (::)";
  if (groups[0] === "0" && groups[1] === "0" && groups[2] === "0" && groups[3] === "0" && groups.slice(4).every((g) => g === "0") && groups[7] === "1")
    return "Loopback (::1)";
  if (first >= 0xff00) return "Multicast (ff00::/8)";
  if ((first & 0xfc00) === 0xfc00) return "Unique Local (fc00::/7)";
  if ((first & 0xffc0) === 0xfe80) return "Link-local (fe80::/10)";
  if (first === 0x2001 && parseInt(groups[1], 16) === 0xdb8) return "Documentation (2001:db8::/32)";
  return "Global Unicast";
}

function hostCountText(hostBits: number): string {
  if (hostBits <= 53) return String(2 ** hostBits);
  const approx = (hostBits * 0.3010).toFixed(1);
  return `2^${hostBits} (≈ 10^${approx}) addresses`;
}

export function Ipv6Calculator() {
  const [input, setInput] = useState("2001:db8::1");
  const [prefixLen, setPrefixLen] = useState("64");
  const [copied, setCopied] = useState(false);

  const parsed = useMemo(() => validateIPv6(input), [input]);
  const prefix = parseInt(prefixLen, 10);
  const prefixValid = !isNaN(prefix) && prefix >= 0 && prefix <= 128;

  const full = parsed.valid ? expand(parsed.groups) : "";
  const short = parsed.valid ? compress(parsed.groups) : "";
  const scope = parsed.valid ? classify(parsed.groups) : "";
  const hostCount = prefixValid && parsed.valid ? hostCountText(128 - prefix) : "";

  const copyFull = async () => {
    if (!full) return;
    await navigator.clipboard.writeText(full);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inputCls =
    "w-full rounded-lg border border-surface-200 bg-white p-2.5 font-mono text-sm dark:border-dark-border dark:bg-dark-bg dark:text-dark-text";
  const labelCls = "block text-xs font-medium text-surface-700 dark:text-dark-text mb-1";

  return (
    <div className="space-y-4">
      <div>
        <label className={labelCls}>IPv6 address</label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="2001:db8::1"
          className={inputCls}
          aria-invalid={input.trim() !== "" && !parsed.valid}
        />
      </div>
      <div>
        <label className={labelCls}>Prefix length</label>
        <input
          type="number"
          value={prefixLen}
          onChange={(e) => setPrefixLen(e.target.value)}
          placeholder="64"
          min={0}
          max={128}
          className={inputCls}
        />
        {!prefixValid && <p className="mt-1 text-xs text-red-600 dark:text-red-400">Prefix must be 0–128</p>}
      </div>

      {!parsed.valid && <p className="text-sm text-red-600 dark:text-red-400">{parsed.error}</p>}

      {parsed.valid && (
        <>
          <div className="rounded-lg border border-surface-200 bg-surface-50 p-4 dark:border-dark-border dark:bg-dark-surface">
            <p className="text-xs font-medium uppercase tracking-wider text-surface-400 dark:text-dark-muted">
              Expanded
            </p>
            <p data-testid="tool-output" className="mt-1 break-all font-mono text-sm text-surface-900 dark:text-dark-text">
              {full}
            </p>
            <p className="text-xs font-medium uppercase tracking-wider text-surface-400 dark:text-dark-muted mt-3">
              Compressed
            </p>
            <p className="mt-1 break-all font-mono text-sm text-surface-900 dark:text-dark-text">{short}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-brand-50 px-2.5 py-1 font-medium text-brand-700 dark:bg-brand-900/30 dark:text-brand-400">
                {scope}
              </span>
              {prefixValid && (
                <span className="rounded-full bg-surface-100 px-2.5 py-1 font-medium text-surface-700 dark:bg-dark-surface dark:text-dark-text">
                  /{prefix} · {hostCount} host addresses
                </span>
              )}
            </div>
          </div>

          <button
            onClick={copyFull}
            className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface"
          >
            {copied ? "Copied!" : "Copy expanded"}
          </button>
        </>
      )}

      <p className="text-[10px] text-surface-400 dark:text-dark-muted">
        Follows RFC 4291 and RFC 5952 addressing rules. All computation happens locally in your browser.
      </p>
    </div>
  );
}