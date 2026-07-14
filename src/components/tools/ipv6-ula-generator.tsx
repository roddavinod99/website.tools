"use client";

import { useState } from "react";

function randomByte(): number {
  return Math.floor(Math.random() * 256);
}

function generateUla(): { full: string; compressed: string; prefix: string } {
  const prefix = "fd";
  const bytes: number[] = [0xfd];
  for (let i = 0; i < 5; i++) bytes.push(randomByte());

  const segs = bytes.map(b => b.toString(16).padStart(2, "0"));
  const full = `${segs[0]}${segs[1]}:${segs[2]}${segs[3]}:${segs[4]}${segs[5]}:0000:0000:0000:0000:0000`;

  const prefixPart = `${segs[0]}${segs[1]}:${segs[2]}${segs[3]}:${segs[4]}${segs[5]}`;
  const compressed = `${prefixPart}::/64`;

  return { full, compressed, prefix };
}

export function Ipv6UlaGenerator() {
  const [count, setCount] = useState(1);
  const [ulas, setUlas] = useState<{ full: string; compressed: string; prefix: string }[]>([]);
  const [copyFeedback, setCopyFeedback] = useState("");

  const generate = () => {
    const results: { full: string; compressed: string; prefix: string }[] = [];
    for (let i = 0; i < count; i++) {
      results.push(generateUla());
    }
    setUlas(results);
  };

  const copyAll = async () => {
    const text = ulas.map(u => u.compressed).join("\n");
    await navigator.clipboard.writeText(text);
    setCopyFeedback("All ULAs copied");
    setTimeout(() => setCopyFeedback(""), 2000);
  };

  const copyValue = async (label: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopyFeedback(`${label} copied`);
    setTimeout(() => setCopyFeedback(""), 2000);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">Number of ULAs</label>
          <input
            type="number"
            value={count}
            onChange={e => setCount(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
            min={1}
            max={50}
            className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted"
          />
        </div>
        <div className="flex items-end">
          <button onClick={generate} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors w-full">
            Generate
          </button>
        </div>
      </div>

      {ulas.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-surface-500 dark:text-dark-muted">
              Generated ULAs ({ulas.length})
            </span>
            {ulas.length > 1 && (
              <button onClick={copyAll} className="rounded-lg border border-surface-200 px-3 py-1 text-xs font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors">
                Copy All
              </button>
            )}
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {ulas.map((ula, i) => (
              <div key={i} className="rounded-lg border border-surface-200 bg-surface-50 p-3 dark:border-dark-border dark:bg-dark-surface space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider text-surface-400 dark:text-dark-muted">ULA #{i + 1}</span>
                </div>
                <div
                  className="grid grid-cols-2 gap-2 cursor-pointer"
                  onClick={() => copyValue(`ULA #${i + 1}`, ula.compressed)}
                >
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider text-surface-400 dark:text-dark-muted">With /64 Prefix</span>
                    <span className="block text-sm font-mono text-brand-600 dark:text-brand-400 break-all">{ula.compressed}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider text-surface-400 dark:text-dark-muted">ULA ID (40-bit)</span>
                    <span className="block text-sm font-mono text-surface-900 dark:text-dark-text break-all">{ula.prefix}</span>
                  </div>
                </div>
                <div
                  className="cursor-pointer"
                  onClick={() => copyValue(`Expanded #${i + 1}`, ula.full)}
                >
                  <span className="block text-[10px] uppercase tracking-wider text-surface-400 dark:text-dark-muted">Full Expanded Form</span>
                  <span className="block text-xs font-mono text-surface-600 dark:text-dark-muted break-all">{ula.full}</span>
                </div>
                <span className="block text-[9px] text-brand-400 opacity-0 hover:opacity-100 transition-opacity text-right">click to copy</span>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 dark:border-dark-border dark:bg-dark-surface">
            <span className="block text-[10px] uppercase tracking-wider text-surface-400 dark:text-dark-muted mb-1">About IPv6 ULA</span>
            <div className="text-xs text-surface-600 dark:text-dark-muted space-y-0.5">
              <p><strong>Prefix:</strong> fd00::/8 (fc00::/7 block, with L bit set)</p>
              <p><strong>Global ID:</strong> 40-bit random identifier for uniqueness</p>
              <p><strong>Subnet:</strong> /64 prefix for standard IPv6 subnetting</p>
              <p><strong>Use case:</strong> Internal/private networks, similar to RFC 1918 for IPv4</p>
            </div>
          </div>
        </>
      )}

      {copyFeedback && (
        <div className="fixed bottom-4 right-4 rounded-lg bg-brand-500 px-4 py-2 text-sm text-white shadow-lg animate-fade-in">{copyFeedback}</div>
      )}
    </div>
  );
}
