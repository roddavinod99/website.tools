"use client";

import { useState } from "react";

function randomHex(): string {
  return Math.floor(Math.random() * 256).toString(16).toUpperCase().padStart(2, "0");
}

function generateMac(options: { localBit: boolean; multicastBit: boolean; separator: string; prefix: string }): string {
  const bytes: string[] = [];
  for (let i = 0; i < 6; i++) bytes.push(randomHex());

  if (options.prefix) {
    const prefixBytes = options.prefix.replace(/[:-]/g, "").toUpperCase();
    for (let i = 0; i < Math.min(6, Math.floor(prefixBytes.length / 2)); i++) {
      bytes[i] = prefixBytes.slice(i * 2, i * 2 + 2);
    }
  }

  let first = parseInt(bytes[0], 16);

  if (options.multicastBit) {
    first |= 0x01;
  } else {
    first &= 0xFE;
  }

  if (options.localBit) {
    first |= 0x02;
  } else {
    first &= 0xFD;
  }

  bytes[0] = first.toString(16).toUpperCase().padStart(2, "0");
  return bytes.join(options.separator);
}

export function MacAddressGenerator() {
  const [count, setCount] = useState(1);
  const [localBit, setLocalBit] = useState(false);
  const [multicastBit, setMulticastBit] = useState(false);
  const [separator, setSeparator] = useState(":");
  const [prefix, setPrefix] = useState("");
  const [addresses, setAddresses] = useState<string[]>([]);
  const [copyFeedback, setCopyFeedback] = useState("");

  const generate = () => {
    const results: string[] = [];
    for (let i = 0; i < count; i++) {
      results.push(generateMac({ localBit, multicastBit, separator, prefix }));
    }
    setAddresses(results);
  };

  const copyAll = async () => {
    await navigator.clipboard.writeText(addresses.join("\n"));
    setCopyFeedback("All addresses copied");
    setTimeout(() => setCopyFeedback(""), 2000);
  };

  const copyOne = async (mac: string) => {
    await navigator.clipboard.writeText(mac);
    setCopyFeedback(`${mac} copied`);
    setTimeout(() => setCopyFeedback(""), 2000);
  };

  const inputCls = "w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted";

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">Count</label>
          <input
            type="number"
            value={count}
            onChange={e => setCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
            min={1}
            max={100}
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">Separator</label>
          <select
            value={separator}
            onChange={e => setSeparator(e.target.value)}
            className="rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
          >
            <option value=":">Colon (:)</option>
            <option value="-">Dash (-)</option>
            <option value=".">Dot (.)</option>
            <option value="">None</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">Custom Prefix (optional)</label>
          <input
            type="text"
            value={prefix}
            onChange={e => setPrefix(e.target.value.replace(/[^0-9a-fA-F:-]/g, ""))}
            placeholder="e.g. AA:BB:CC"
            maxLength={17}
            className={inputCls}
          />
        </div>
        <div className="flex items-end gap-4">
          <label className="flex items-center gap-2 text-sm text-surface-700 dark:text-dark-text cursor-pointer">
            <input
              type="checkbox"
              checked={localBit}
              onChange={e => setLocalBit(e.target.checked)}
              className="rounded border-surface-300 text-brand-500 focus:ring-brand-400"
            />
            <span className="text-xs">Local (L bit)</span>
          </label>
        </div>
        <div className="flex items-end gap-4">
          <label className="flex items-center gap-2 text-sm text-surface-700 dark:text-dark-text cursor-pointer">
            <input
              type="checkbox"
              checked={multicastBit}
              onChange={e => setMulticastBit(e.target.checked)}
              className="rounded border-surface-300 text-brand-500 focus:ring-brand-400"
            />
            <span className="text-xs">Multicast (M bit)</span>
          </label>
        </div>
      </div>

      <button onClick={generate} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors">
        Generate {count > 1 ? `${count} MACs` : "MAC Address"}
      </button>

      {addresses.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-surface-500 dark:text-dark-muted">
              Generated Addresses ({addresses.length})
            </span>
            {addresses.length > 1 && (
              <button onClick={copyAll} className="rounded-lg border border-surface-200 px-3 py-1 text-xs font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors">
                Copy All
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto rounded-lg border border-surface-200 dark:border-dark-border">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-surface-200 dark:bg-dark-border">
              {addresses.map((mac, i) => (
                <button
                  key={i}
                  onClick={() => copyOne(mac)}
                  className="bg-white px-3 py-2 text-xs font-mono text-surface-700 hover:bg-brand-50 dark:bg-dark-bg dark:text-dark-text dark:hover:bg-dark-surface text-left transition-colors"
                >
                  <span className="text-surface-400 dark:text-dark-muted mr-1">{i + 1}.</span>
                  {mac}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 dark:border-dark-border dark:bg-dark-surface">
            <span className="block text-[10px] uppercase tracking-wider text-surface-400 dark:text-dark-muted mb-1">Bit Explanation</span>
            <div className="text-xs text-surface-600 dark:text-dark-muted space-y-0.5">
              <p><strong>First octet bits:</strong> xxxxxxxx</p>
              <p><strong>Bit 0 (least significant):</strong> Multicast/Unicast (1=multicast, 0=unicast) {multicastBit ? "← Set" : ""}</p>
              <p><strong>Bit 1:</strong> Universal/Local (1=locally administered, 0=globally unique) {localBit ? "← Set" : ""}</p>
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
