"use client";

import { useState } from "react";
import { Copy } from "lucide-react";

const CROCKFORD = "0123456789ABCDEFGHJKLMNPQRSTVWXYZ";

function randomBytes(n: number): Uint8Array {
  const arr = new Uint8Array(n);
  crypto.getRandomValues(arr);
  return arr;
}

function encodeTime(timeMs: number): string {
  const timeChars = new Array(10);
  let t = timeMs;
  for (let i = 9; i >= 0; i--) {
    timeChars[i] = CROCKFORD[t & 0x1f];
    t = Math.floor(t / 32);
  }
  return timeChars.join("");
}

function encodeRandom(rand: Uint8Array): string {
  const bits: number[] = [];
  for (const byte of rand) {
    for (let b = 7; b >= 0; b--) bits.push((byte >> b) & 1);
  }
  const chars: string[] = [];
  for (let i = 0; i < bits.length; i += 5) {
    let val = 0;
    for (let j = 0; j < 5 && i + j < bits.length; j++) {
      val = (val << 1) | bits[i + j];
    }
    chars.push(CROCKFORD[val]);
  }
  return chars.join("");
}

function generateULID(): string {
  const timeMs = Date.now();
  const rand = randomBytes(10);
  return encodeTime(timeMs) + encodeRandom(rand);
}

function extractTimestamp(ulid: string): Date {
  let time = 0;
  for (let i = 0; i < 10; i++) {
    const idx = CROCKFORD.indexOf(ulid[i]);
    time = time * 32 + idx;
  }
  return new Date(time);
}

export function UlidGenerator() {
  const [count, setCount] = useState(1);
  const [ulids, setUlids] = useState<string[]>([]);
  const [copied, setCopied] = useState("");

  const generate = () => {
    const newUlids: string[] = [];
    for (let i = 0; i < count; i++) {
      newUlids.push(generateULID());
    }
    setUlids(newUlids);
  };

  const copyToClipboard = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 2000);
  };

  const copyAll = async () => {
    await navigator.clipboard.writeText(ulids.join("\n"));
    setCopied("all");
    setTimeout(() => setCopied(""), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-3">
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Count (1-100)</label>
          <input type="number" min={1} max={100} value={count}
            onChange={(e) => setCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
            className="w-24 rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm font-mono dark:border-dark-border dark:bg-dark-bg dark:text-dark-text" />
        </div>
        <button onClick={generate}
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors">
          Generate
        </button>
        {ulids.length > 0 && (
          <button onClick={copyAll}
            className="rounded-lg border border-surface-200 px-4 py-2 text-sm text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors">
            {copied === "all" ? "Copied All!" : "Copy All"}
          </button>
        )}
      </div>

      {ulids.length > 0 && (
        <div className="space-y-1.5">
          {ulids.map((ulid, idx) => {
            const ts = extractTimestamp(ulid);
            const timestampPart = ulid.slice(0, 10);
            const randomPart = ulid.slice(10);
            return (
              <div key={idx} className="rounded-lg border border-surface-200 bg-surface-50 p-2.5 flex items-center justify-between dark:border-dark-border dark:bg-dark-surface">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs text-surface-400 dark:text-dark-muted w-6 shrink-0 text-right">{idx + 1}</span>
                  <code className="text-sm font-mono select-all break-all">
                    <span className="text-brand-500">{timestampPart}</span>
                    <span className="text-surface-700 dark:text-dark-text">{randomPart}</span>
                  </code>
                  <span className="text-[10px] text-surface-400 dark:text-dark-muted shrink-0">
                    {ts.toISOString()}
                  </span>
                </div>
                <button onClick={() => copyToClipboard(ulid, ulid)}
                  className="text-xs text-brand-500 hover:text-brand-600 flex items-center gap-0.5 shrink-0 ml-2">
                  <Copy size={12} /> {copied === ulid ? "Copied!" : "Copy"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="rounded-lg border border-surface-200 bg-surface-50 p-3 dark:border-dark-border dark:bg-dark-surface">
        <p className="text-xs font-medium text-surface-500 dark:text-dark-muted mb-2">About ULIDs</p>
        <ul className="text-xs text-surface-600 dark:text-dark-text space-y-1">
          <li>26 characters, Crockford Base32 encoded (case-insensitive)</li>
          <li>First 10 characters encode millisecond-precision timestamp</li>
          <li>Last 16 characters encode 128-bit random value</li>
          <li>Lexicographically sortable by creation time</li>
          <li>Compatible with UUID storage (128 bits)</li>
        </ul>
      </div>
    </div>
  );
}
