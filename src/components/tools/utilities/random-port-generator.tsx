"use client";

import { useState } from "react";

const WELL_KNOWN_PORTS: Record<number, string> = {
  20: "FTP Data", 21: "FTP Control", 22: "SSH", 23: "Telnet", 25: "SMTP",
  53: "DNS", 67: "DHCP", 68: "DHCP", 69: "TFTP", 80: "HTTP",
  110: "POP3", 143: "IMAP", 443: "HTTPS", 445: "SMB", 993: "IMAPS",
  995: "POP3S", 3306: "MySQL", 3389: "RDP", 5432: "PostgreSQL",
  6379: "Redis", 8080: "HTTP Alt", 8443: "HTTPS Alt", 27017: "MongoDB",
};

function randomInt(min: number, max: number): number {
  const range = max - min + 1;
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return min + (buf[0] % range);
}

function generateSinglePort(avoidWellKnown: boolean): number {
  const min = avoidWellKnown ? 1024 : 1;
  const max = 65535;
  return randomInt(min, max);
}

function generatePortRange(start: number, end: number, count: number, avoidWellKnown: boolean): number[] {
  const min = avoidWellKnown ? Math.max(start, 1024) : start;
  const max = end;
  const ports = new Set<number>();
  const attempts = count * 10;
  for (let i = 0; i < attempts && ports.size < count; i++) {
    ports.add(randomInt(min, max));
  }
  return Array.from(ports).sort((a, b) => a - b);
}

export function RandomPortGenerator() {
  const [mode, setMode] = useState<"single" | "range" | "multiple">("single");
  const [count, setCount] = useState(5);
  const [rangeStart, setRangeStart] = useState(3000);
  const [rangeEnd, setRangeEnd] = useState(9000);
  const [avoidWellKnown, setAvoidWellKnown] = useState(true);
  const [ports, setPorts] = useState<number[]>([]);
  const [copied, setCopied] = useState(false);

  const generate = () => {
    if (mode === "single") {
      setPorts([generateSinglePort(avoidWellKnown)]);
    } else if (mode === "range") {
      const start = Math.max(1, Math.min(65535, rangeStart));
      const end = Math.max(start, Math.min(65535, rangeEnd));
      setPorts(generatePortRange(start, end, count, avoidWellKnown));
    } else {
      const min = avoidWellKnown ? 1024 : 1;
      const result = generatePortRange(min, 65535, count, avoidWellKnown);
      setPorts(result);
    }
  };

  const copyAll = async () => {
    await navigator.clipboard.writeText(ports.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-2">
          Generation Mode
        </label>
        <div className="flex gap-2">
          {(["single", "range", "multiple"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                mode === m
                  ? "bg-brand-500 text-white"
                  : "border border-surface-200 text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface"
              }`}
            >
              {m === "single" ? "Single Port" : m === "range" ? "From Range" : "Multiple Ports"}
            </button>
          ))}
        </div>
      </div>

      {mode === "range" && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">
              Start Port
            </label>
            <input
              type="number"
              min={1}
              max={65535}
              value={rangeStart}
              onChange={(e) => setRangeStart(parseInt(e.target.value) || 1)}
              className="w-full rounded-lg border border-surface-200 bg-white p-3 font-mono text-sm dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">
              End Port
            </label>
            <input
              type="number"
              min={1}
              max={65535}
              value={rangeEnd}
              onChange={(e) => setRangeEnd(parseInt(e.target.value) || 1)}
              className="w-full rounded-lg border border-surface-200 bg-white p-3 font-mono text-sm dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
            />
          </div>
        </div>
      )}

      {(mode === "multiple" || mode === "range") && (
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">
            Number of Ports
          </label>
          <input
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(e) => setCount(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
            className="w-full rounded-lg border border-surface-200 bg-white p-3 font-mono text-sm dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
          />
        </div>
      )}

      <label className="flex items-center gap-2 text-sm text-surface-700 dark:text-dark-text">
        <input
          type="checkbox"
          checked={avoidWellKnown}
          onChange={(e) => setAvoidWellKnown(e.target.checked)}
          className="accent-brand-500"
        />
        Avoid well-known ports (below 1024)
      </label>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={generate}
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors"
        >
          Generate
        </button>
        {ports.length > 0 && (
          <button
            onClick={copyAll}
            className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors"
          >
            {copied ? "Copied!" : "Copy All"}
          </button>
        )}
      </div>

      {ports.length > 0 && (
        <div className="space-y-1">
          {ports.map((port) => (
            <div
              key={port}
              className="flex items-center justify-between rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 dark:border-dark-border dark:bg-dark-surface"
            >
              <code className="text-sm font-mono text-surface-900 dark:text-dark-text">
                {port}
              </code>
              {WELL_KNOWN_PORTS[port] && (
                <span className="text-xs text-surface-500 dark:text-dark-muted">
                  {WELL_KNOWN_PORTS[port]}
                </span>
              )}
              <span className="text-[10px] text-surface-400 dark:text-dark-muted">
                {port < 1024 ? "System" : port < 49152 ? "Registered" : "Dynamic"}
              </span>
            </div>
          ))}
        </div>
      )}

      {ports.length === 0 && (
        <p className="text-xs text-surface-500 dark:text-dark-muted text-center py-4">
          Click Generate to create random port numbers.
        </p>
      )}
    </div>
  );
}
