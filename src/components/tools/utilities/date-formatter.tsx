"use client";

import { useMemo, useState } from "react";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

interface Pattern {
  key: string;
  label: string;
}

const PATTERNS: Pattern[] = [
  { key: "iso", label: "ISO 8601 (UTC)" },
  { key: "rfc2822", label: "RFC 2822" },
  { key: "rfc3339", label: "RFC 3339" },
  { key: "unix-s", label: "Unix (seconds)" },
  { key: "unix-ms", label: "Unix (milliseconds)" },
  { key: "ymd", label: "YYYY-MM-DD" },
  { key: "yymd", label: "YYMMDD" },
  { key: "compact", label: "YYYYMMDDHHmmss" },
  { key: "us", label: "US locale" },
  { key: "eu", label: "EU locale" },
  { key: "sql", label: "SQL datetime" },
  { key: "filename", label: "File-friendly" },
];

interface token {
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
  second: string;
  ms: string;
}

function buildPattern(key: string, t: token, msTime: number, sTime: number): string {
  switch (key) {
    case "iso":
      return `${t.year}-${t.month}-${t.day}T${t.hour}:${t.minute}:${t.second}.${t.ms}Z`;
    case "rfc2822":
      return new Date(msTime).toUTCString();
    case "rfc3339":
      return `${t.year}-${t.month}-${t.day}T${t.hour}:${t.minute}:${t.second}Z`;
    case "unix-s":
      return String(sTime);
    case "unix-ms":
      return String(msTime);
    case "ymd":
      return `${t.year}-${t.month}-${t.day}`;
    case "yymd":
      return `${t.year.slice(2)}${t.month}${t.day}`;
    case "compact":
      return `${t.year}${t.month}${t.day}${t.hour}${t.minute}${t.second}`;
    case "us":
      return `${t.month}/${t.day}/${t.year} ${t.hour}:${t.minute}:${t.second}`;
    case "eu":
      return `${t.day}/${t.month}/${t.year} ${t.hour}:${t.minute}`;
    case "sql":
      return `${t.year}-${t.month}-${t.day} ${t.hour}:${t.minute}:${t.second}`;
    case "filename":
      return `${t.year}-${t.month}-${t.day}_${t.hour}${t.minute}${t.second}`;
    default:
      return "";
  }
}

export function DateFormatter() {
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
  const [useNow, setUseNow] = useState(true);
  const [raw, setRaw] = useState(() => Math.floor(Date.now() / 1000).toString());
  const [unit, setUnit] = useState<"s" | "ms">("s");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const toggleUseNow = () => setUseNow((prev) => {
    if (!prev) setNow(Math.floor(Date.now() / 1000));
    return !prev;
  });

  const seconds = useMemo(() => {
    if (useNow) return now;
    const n = parseInt(raw, 10);
    if (isNaN(n)) return null;
    return unit === "s" ? n : Math.floor(n / 1000);
  }, [useNow, now, raw, unit]);

  const msTime = seconds === null ? null : seconds * 1000;
  const date = useMemo(() => (msTime === null ? null : new Date(msTime)), [msTime]);

  const token: token | null = useMemo(() => {
    if (!date || isNaN(date.getTime())) return null;
    return {
      year: String(date.getUTCFullYear()),
      month: pad(date.getUTCMonth() + 1),
      day: pad(date.getUTCDate()),
      hour: pad(date.getUTCHours()),
      minute: pad(date.getUTCMinutes()),
      second: pad(date.getUTCSeconds()),
      ms: pad(date.getUTCMilliseconds()).padStart(3, "0"),
    };
  }, [date]);

  const copyFormat = async (key: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const inputCls =
    "w-full rounded-lg border border-surface-200 bg-white p-2.5 font-mono text-sm dark:border-dark-border dark:bg-dark-bg dark:text-dark-text";
  const labelCls = "block text-xs font-medium text-surface-700 dark:text-dark-text mb-1";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => toggleUseNow()}
          className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
            useNow ? "bg-brand-500 text-white" : "border border-surface-200 text-surface-700 hover:bg-surface-50 dark:border-dark-border"
          }`}
        >
          Use current time
        </button>
        <button
          onClick={() => toggleUseNow()}
          className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
            !useNow ? "bg-brand-500 text-white" : "border border-surface-200 text-surface-700 hover:bg-surface-50 dark:border-dark-border"
          }`}
        >
          Enter timestamp
        </button>
      </div>

      {!useNow && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Unix timestamp</label>
            <input
              type="text"
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              placeholder="1783800000"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Unit</label>
            <select value={unit} onChange={(e) => setUnit(e.target.value as "s" | "ms")} className={inputCls}>
              <option value="s">Seconds (10-digit)</option>
              <option value="ms">Milliseconds (13-digit)</option>
            </select>
          </div>
        </div>
      )}

      {date && token && (
        <div className="rounded-lg border border-surface-200 bg-surface-50 p-4 dark:border-dark-border dark:bg-dark-surface">
          <p className="text-xs font-medium uppercase tracking-wider text-surface-400 dark:text-dark-muted">
            Source (UTC)
          </p>
          <p data-testid="tool-output" className="mt-1 text-lg font-bold font-mono text-surface-900 dark:text-dark-text">
            {token.year}-{token.month}-{token.day} {token.hour}:{token.minute}:{token.second} UTC
          </p>
          {!useNow && (
            <p className="mt-1 text-xs text-surface-500 dark:text-dark-muted font-mono">unix {seconds}</p>
          )}
        </div>
      )}

      {date && token && seconds !== null && msTime !== null && (
        <div className="space-y-1.5">
          {PATTERNS.map((p) => {
            const text = buildPattern(p.key, token, msTime, seconds);
            return (
              <button
                key={p.key}
                onClick={() => copyFormat(p.key, text)}
                className="flex w-full items-center justify-between rounded-lg border border-surface-200 bg-white px-3 py-2 text-left hover:border-brand-300 dark:border-dark-border dark:bg-dark-surface"
              >
                <span className="text-xs font-medium text-surface-500 dark:text-dark-muted">{p.label}</span>
                <span className="ml-4 flex-1 truncate font-mono text-xs text-surface-900 dark:text-dark-text">
                  {text}
                </span>
                <span className="ml-2 shrink-0 text-[10px] text-brand-500">
                  {copiedKey === p.key ? "Copied!" : "copy"}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {!date && (
        <p className="text-sm text-red-600 dark:text-red-400">Enter a valid Unix timestamp to format.</p>
      )}

      <p className="text-[10px] text-surface-400 dark:text-dark-muted">
        Formatting uses UTC for predictable, ISO-compliant output. All processing happens locally in your browser.
      </p>
    </div>
  );
}