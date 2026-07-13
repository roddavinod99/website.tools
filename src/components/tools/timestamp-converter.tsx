"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";

type Timezone = "UTC" | "local" | "America/New_York" | "America/Chicago" | "America/Denver" | "America/Los_Angeles" | "Europe/London" | "Europe/Berlin" | "Europe/Moscow" | "Asia/Tokyo" | "Asia/Shanghai" | "Asia/Kolkata" | "Asia/Dubai" | "Australia/Sydney" | "Pacific/Auckland";

const TIMEZONES: { label: string; value: Timezone }[] = [
  { label: "Local", value: "local" },
  { label: "UTC", value: "UTC" },
  { label: "New York (EST)", value: "America/New_York" },
  { label: "Chicago (CST)", value: "America/Chicago" },
  { label: "Denver (MST)", value: "America/Denver" },
  { label: "Los Angeles (PST)", value: "America/Los_Angeles" },
  { label: "London (GMT)", value: "Europe/London" },
  { label: "Berlin (CET)", value: "Europe/Berlin" },
  { label: "Moscow (MSK)", value: "Europe/Moscow" },
  { label: "Tokyo (JST)", value: "Asia/Tokyo" },
  { label: "Shanghai (CST)", value: "Asia/Shanghai" },
  { label: "Kolkata (IST)", value: "Asia/Kolkata" },
  { label: "Dubai (GST)", value: "Asia/Dubai" },
  { label: "Sydney (AEST)", value: "Australia/Sydney" },
  { label: "Auckland (NZST)", value: "Pacific/Auckland" },
];

function detectInput(input: string): { type: string; value: number | string } | null {
  const s = input.trim();
  if (!s) return null;
  const num = s.replace(/,/g, "");
  if (/^-?\d+(\.\d+)?$/.test(num)) {
    const n = parseFloat(num);
    if (n < 1e18) return { type: "unix", value: n };
  }
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return { type: "iso", value: s };
  if (/^\d{2}\/\d{2}\/\d{4}/.test(s)) return { type: "human", value: s };
  if (/^\d{2}-\d{2}-\d{4}/.test(s)) return { type: "human", value: s };
  if (/^\d{2}\.\d{2}\.\d{4}/.test(s)) return { type: "human", value: s };
  const ts = Date.parse(s);
  if (!isNaN(ts)) return { type: "human", value: s };
  return null;
}

function parseDetected(detected: { type: string; value: number | string }): Date | null {
  if (detected.type === "unix") {
    const val = detected.value as number;
    if (val > 1e15) return new Date(val / 1000);
    if (val > 1e12) return new Date(val);
    return new Date(val * 1000);
  }
  const d = new Date(detected.value as string);
  return isNaN(d.getTime()) ? null : d;
}

function formatInTimezone(date: Date, tz: Timezone): string {
  if (tz === "UTC") return date.toUTCString();
  if (tz === "local") return date.toLocaleString();
  try { return date.toLocaleString("en-US", { timeZone: tz }); } catch { return date.toLocaleString(); }
}

function formatMongoObjectId(date: Date): string {
  return `${Math.floor(date.getTime() / 1000).toString(16).padStart(8, "0")}0000000000000000`;
}

function relativeTime(date: Date, nowMs: number): string {
  const diff = nowMs - date.getTime();
  const abs = Math.abs(diff);
  const seconds = Math.floor(abs / 1000);
  const mins = Math.floor(seconds / 60);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);
  const suffix = diff >= 0 ? "ago" : "from now";
  const n = (v: number, u: string) => `${v} ${u}${v !== 1 ? "s" : ""} ${suffix}`;
  if (years > 0) return n(years, "year");
  if (months > 0) return n(months, "month");
  if (weeks > 0) return n(weeks, "week");
  if (days > 0) return n(days, "day");
  if (hours > 0) return n(hours, "hour");
  if (mins > 0) return n(mins, "minute");
  return n(seconds, "second");
}

function getConversions(date: Date, tz: Timezone, nowMs: number): { label: string; value: string }[] {
  const ts = date.getTime();
  const secs = Math.floor(ts / 1000);
  return [
    { label: "JS locale date string", value: date.toString() },
    { label: "ISO 8601", value: date.toISOString() },
    { label: "ISO 8601 UTC", value: date.toISOString() },
    { label: "ISO 9075", value: date.toLocaleString("sv-SE").replace(" ", "T") },
    { label: "RFC 3339", value: date.toISOString().replace("Z", "+00:00") },
    { label: "RFC 7231", value: date.toUTCString() },
    { label: "Unix timestamp (seconds)", value: String(secs) },
    { label: "Timestamp (milliseconds)", value: String(ts) },
    { label: "UTC format", value: date.toUTCString() },
    { label: "Mongo ObjectID", value: formatMongoObjectId(date) },
    { label: "Human-readable", value: formatInTimezone(date, tz) },
    { label: "Locale string", value: date.toLocaleString() },
    { label: "Locale date", value: date.toLocaleDateString() },
    { label: "Locale time", value: date.toLocaleTimeString() },
    { label: "Relative", value: relativeTime(date, nowMs) },
  ];
}

export function TimestampConverter() {
  const [input, setInput] = useState("");
  const [tz, setTz] = useState<Timezone>("local");
  const [nowMs, setNowMs] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState("");
  const [countdown, setCountdown] = useState("");
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [diffTarget, setDiffTarget] = useState("");
  const [diffResult, setDiffResult] = useState("");

  useEffect(() => {
    setMounted(true);
    const tick = () => setNowMs(Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => () => { if (countdownRef.current) clearInterval(countdownRef.current); }, []);

  const detected = useMemo(() => detectInput(input), [input]);

  const parsedDate = useMemo(() => {
    if (!detected) return null;
    return parseDetected(detected);
  }, [detected]);

  const isLive = !input.trim();
  const activeDate = parsedDate ?? (mounted && nowMs !== null ? new Date(nowMs) : new Date(0));
  const conversions = useMemo(() => getConversions(activeDate, tz, mounted && nowMs !== null ? nowMs : 0), [activeDate, tz, nowMs, mounted]);

  const handleCopy = useCallback(async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(label);
      setTimeout(() => setCopied(""), 1500);
    }
  }, []);

  const handleStartCountdown = useCallback(() => {
    if (!parsedDate) return;
    if (countdownRef.current) clearInterval(countdownRef.current);
    const update = () => {
      const diff = parsedDate.getTime() - Date.now();
      if (diff <= 0) {
        setCountdown("Reached!");
        if (countdownRef.current) clearInterval(countdownRef.current);
        return;
      }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(`${d}d ${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`);
    };
    update();
    countdownRef.current = setInterval(update, 1000);
  }, [parsedDate]);

  const handleDiff = useCallback(() => {
    if (!parsedDate) { setDiffResult(""); return; }
    const d2 = detectInput(diffTarget);
    if (!d2) { setDiffResult(""); return; }
    const date2 = parseDetected(d2);
    if (!date2) { setDiffResult(""); return; }
    const diffMs = date2.getTime() - parsedDate.getTime();
    const abs = Math.abs(diffMs);
    const days = Math.floor(abs / 86400000);
    const hours = Math.floor((abs % 86400000) / 3600000);
    const mins = Math.floor((abs % 3600000) / 60000);
    const secs = Math.floor((abs % 60000) / 1000);
    const sign = diffMs >= 0 ? "" : "-";
    setDiffResult(`${sign}${days}d ${hours}h ${mins}m ${secs}s`);
  }, [diffTarget, parsedDate]);

  return (
    <div className="space-y-4">
      {mounted && nowMs !== null && (
        <div className="rounded-lg border border-brand-200 bg-brand-50 px-5 py-4 dark:border-brand-800 dark:bg-brand-950/30">
          <div className="flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand-500" />
            </span>
            <span suppressHydrationWarning className="text-2xl font-bold font-mono text-surface-900 dark:text-dark-text">
              {activeDate.toLocaleTimeString()}
            </span>
            <span suppressHydrationWarning className="text-sm text-surface-500 dark:text-dark-muted">
              {activeDate.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </span>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter timestamp or date string (empty = live clock)..."
          className="flex-1 rounded-lg border border-surface-200 bg-white px-3 py-2.5 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted"
        />
        <select
          value={tz}
          onChange={(e) => setTz(e.target.value as Timezone)}
          className="rounded-lg border border-surface-200 bg-white px-3 py-2.5 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text"
        >
          {TIMEZONES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      {!isLive && !parsedDate && (
        <p className="text-sm text-red-500">Could not parse input. Try a Unix timestamp (sec or ms), ISO 8601 date, or human-readable date string.</p>
      )}

      <div className="border-t border-surface-200 dark:border-dark-border" />

      <div className="space-y-0">
        {conversions.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-3 border-b border-surface-100 py-2.5 dark:border-dark-border/50 last:border-b-0"
          >
            <span className="w-48 shrink-0 text-right text-xs font-medium text-surface-500 dark:text-dark-muted">
              {item.label}
            </span>
            <code suppressHydrationWarning className="flex-1 truncate text-sm font-mono text-surface-900 dark:text-dark-text select-all" title={item.value}>
              {item.value}
            </code>
            <button
              onClick={() => handleCopy(item.value, item.label)}
              className="shrink-0 rounded px-2 py-1 text-xs font-medium text-brand-500 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-950/30 transition-colors min-w-[3.5rem] text-center"
            >
              {copied === item.label ? "Copied!" : "Copy"}
            </button>
          </div>
        ))}
      </div>

      <details className="rounded-lg border border-surface-200 dark:border-dark-border">
        <summary className="cursor-pointer px-4 py-2.5 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:text-dark-text dark:hover:bg-dark-surface transition-colors">
          Countdown to Target
        </summary>
        <div className="border-t border-surface-200 px-4 py-3 dark:border-dark-border">
          <div className="flex gap-2 items-center">
            <button onClick={handleStartCountdown} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors">
              Start Countdown
            </button>
            {countdown && <span className="text-lg font-mono text-surface-900 dark:text-dark-text">{countdown}</span>}
          </div>
        </div>
      </details>

      <details className="rounded-lg border border-surface-200 dark:border-dark-border">
        <summary className="cursor-pointer px-4 py-2.5 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:text-dark-text dark:hover:bg-dark-surface transition-colors">
          Difference Calculator
        </summary>
        <div className="border-t border-surface-200 px-4 py-3 dark:border-dark-border">
          <div className="flex gap-2">
            <input
              type="text"
              value={diffTarget}
              onChange={(e) => setDiffTarget(e.target.value)}
              placeholder="Enter a second timestamp or date..."
              className="flex-1 rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm font-mono text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text"
            />
            <button onClick={handleDiff} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors">
              Calculate
            </button>
          </div>
          {diffResult && <p className="mt-2 text-sm font-mono text-surface-700 dark:text-dark-text">{diffResult}</p>}
        </div>
      </details>
    </div>
  );
}
