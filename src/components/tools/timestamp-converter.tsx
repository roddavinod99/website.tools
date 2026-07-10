"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";

type Timezone = "UTC" | "local" | "America/New_York" | "America/Chicago" | "America/Denver" | "America/Los_Angeles" | "Europe/London" | "Europe/Berlin" | "Europe/Moscow" | "Asia/Tokyo" | "Asia/Shanghai" | "Asia/Kolkata" | "Asia/Dubai" | "Australia/Sydney" | "Pacific/Auckland";

const timezones: { label: string; value: Timezone }[] = [
  { label: "UTC", value: "UTC" },
  { label: "Local", value: "local" },
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

function formatInTimezone(date: Date, tz: Timezone): string {
  if (tz === "UTC") return date.toUTCString();
  if (tz === "local") return date.toLocaleString();
  try { return date.toLocaleString("en-US", { timeZone: tz }); } catch { return date.toLocaleString(); }
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function relativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
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

function formatDateFields(d: Date): { year: number; month: number; day: number; hour: number; minute: number; second: number; dow: string; ms: number } {
  return {
    year: d.getFullYear(),
    month: d.getMonth() + 1,
    day: d.getDate(),
    hour: d.getHours(),
    minute: d.getMinutes(),
    second: d.getSeconds(),
    dow: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][d.getDay()]!,
    ms: d.getMilliseconds(),
  };
}

export function TimestampConverter() {
  const [input, setInput] = useState("");
  const [tz, setTz] = useState<Timezone>("local");
  const [useUtc, setUseUtc] = useState(false);
  const [, setCountdownTarget] = useState<number | null>(null);
  const [countdown, setCountdown] = useState("");
  const [diffTarget, setDiffTarget] = useState("");
  const [diffResult, setDiffResult] = useState("");
  const [copied, setCopied] = useState("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const detected = useMemo(() => detectInput(input), [input]);

  const parsedDate = useMemo(() => {
    if (!detected) return null;
    if (detected.type === "unix") {
      const val = detected.value as number;
      if (val > 1e15) return new Date(val / 1000);
      if (val > 1e12) return new Date(val);
      return new Date(val * 1000);
    }
    const d = new Date(detected.value as string);
    return isNaN(d.getTime()) ? null : d;
  }, [detected]);

  const fields = useMemo(() => parsedDate ? formatDateFields(parsedDate) : null, [parsedDate]);

  const rangeWarning = useMemo(() => {
    if (!parsedDate) return "";
    const y = parsedDate.getFullYear();
    if (y < 1970) return "Before Unix epoch (1970)";
    if (y > 2038) return "After Year 2038 problem threshold";
    return "";
  }, [parsedDate]);

  const leapYear = useMemo(() => fields ? isLeapYear(fields.year) : false, [fields]);

  const conversions = useMemo(() => {
    if (!parsedDate) return [];
    const ts = parsedDate.getTime();
    const secs = Math.floor(ts / 1000);
    const ms = ts;
    const items = [
      { label: "Unix Seconds (10-digit)", value: secs.toString() },
      { label: "Unix Milliseconds (13-digit)", value: ms.toString() },
      { label: "ISO 8601 (UTC)", value: parsedDate.toISOString() },
      { label: "ISO 8601 (Local)", value: useUtc ? parsedDate.toISOString() : parsedDate.toLocaleString("sv-SE").replace(" ", "T") },
      { label: "RFC 2822", value: parsedDate.toUTCString() },
      { label: "RFC 3339", value: parsedDate.toISOString().replace("Z", "") + "Z" },
      { label: `Human (${tz})`, value: formatInTimezone(parsedDate, tz) },
      { label: "Locale String", value: parsedDate.toLocaleString() },
      { label: "Locale Date", value: parsedDate.toLocaleDateString() },
      { label: "Locale Time", value: parsedDate.toLocaleTimeString() },
      { label: "Relative", value: relativeTime(parsedDate) },
      { label: "UTC String", value: parsedDate.toUTCString() },
    ];
    return items;
  }, [parsedDate, tz, useUtc]);

  const handleCurrent = useCallback(() => {
    const now = Date.now();
    setInput(Math.floor(now / 1000).toString());
  }, []);

  const handleCopy = useCallback(async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 1500);
  }, []);

  const handleDiff = useCallback(() => {
    const detected2 = detectInput(diffTarget);
    if (!detected2 || !parsedDate) { setDiffResult(""); return; }
    let d2: Date;
    if (detected2.type === "unix") {
      const val = detected2.value as number;
      d2 = val > 1e15 ? new Date(val / 1000) : val > 1e12 ? new Date(val) : new Date(val * 1000);
    } else {
      d2 = new Date(detected2.value as string);
    }
    if (isNaN(d2.getTime())) { setDiffResult(""); return; }
    const diffMs = d2.getTime() - parsedDate.getTime();
    const abs = Math.abs(diffMs);
    const days = Math.floor(abs / 86400000);
    const hours = Math.floor((abs % 86400000) / 3600000);
    const mins = Math.floor((abs % 3600000) / 60000);
    const secs = Math.floor((abs % 60000) / 1000);
    const sign = diffMs >= 0 ? "" : "-";
    setDiffResult(`${sign}${days}d ${hours}h ${mins}m ${secs}s (${sign}${abs}ms)`);
  }, [diffTarget, parsedDate]);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const handleStartCountdown = useCallback(() => {
    if (!parsedDate) return;
    setCountdownTarget(parsedDate.getTime());
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const diff = parsedDate!.getTime() - Date.now();
      if (diff <= 0) { setCountdown("Reached!"); if (timerRef.current) clearInterval(timerRef.current); return; }
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setCountdown(`${days}d ${hours.toString().padStart(2, "0")}h ${mins.toString().padStart(2, "0")}m ${secs.toString().padStart(2, "0")}s`);
    }, 1000);
  }, [parsedDate]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">
          Timestamp / Date Input
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Unix timestamp (sec or ms), ISO 8601, or date string..."
            className="flex-1 rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted"
          />
          <button onClick={handleCurrent} className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors whitespace-nowrap">Now</button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-surface-700 dark:text-dark-text">Timezone:</label>
          <select value={tz} onChange={(e) => setTz(e.target.value as Timezone)} className="rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            {timezones.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <label className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-dark-muted cursor-pointer">
          <input type="checkbox" checked={useUtc} onChange={(e) => setUseUtc(e.target.checked)} className="rounded border-surface-300" /> Use UTC
        </label>
      </div>

      {!parsedDate && input.trim() && (
        <p className="text-sm text-red-500">Could not parse input. Try a Unix timestamp (sec or ms), ISO date, or date string.</p>
      )}

      {parsedDate && (
        <>
          {rangeWarning && (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-2 text-sm text-yellow-700 dark:border-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400">{rangeWarning}</div>
          )}

          <div className="space-y-2">
            {conversions.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-lg border border-surface-200 bg-surface-50 p-3 dark:border-dark-border dark:bg-dark-surface">
                <span className="text-sm text-surface-500 dark:text-dark-muted w-34 shrink-0">{item.label}</span>
                <code className="flex-1 text-sm font-mono text-surface-900 dark:text-dark-text select-all overflow-auto max-h-10">{item.value}</code>
                <button onClick={() => handleCopy(item.value, item.label)} disabled={!item.value} className="ml-2 text-xs text-brand-500 hover:text-brand-600 disabled:text-surface-300 dark:disabled:text-dark-muted transition-colors min-w-[3rem] text-right">{copied === item.label ? "Copied!" : "Copy"}</button>
              </div>
            ))}
          </div>

          {fields && (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
              {[
                { label: "Year", value: fields.year },
                { label: "Month", value: fields.month },
                { label: "Day", value: fields.day },
                { label: "Hour", value: fields.hour },
                { label: "Minute", value: fields.minute },
                { label: "Second", value: fields.second },
                { label: "Day of Week", value: fields.dow },
              ].map((f) => (
                <div key={f.label} className="rounded-lg border border-surface-200 bg-white p-2 text-center dark:border-dark-border dark:bg-dark-surface">
                  <p className="text-lg font-bold text-brand-500">{f.value}</p>
                  <p className="text-xs text-surface-500 dark:text-dark-muted">{f.label}</p>
                </div>
              ))}
            </div>
          )}

          {leapYear && <p className="text-xs text-green-600 dark:text-green-400">Leap year detected</p>}

          <div className="border-t border-surface-200 pt-4 dark:border-dark-border">
            <p className="text-sm font-medium text-surface-700 dark:text-dark-text mb-2">Countdown to Target</p>
            <div className="flex gap-2 items-center">
              <button onClick={handleStartCountdown} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors">Start Countdown</button>
              {countdown && <span className="text-lg font-mono text-surface-900 dark:text-dark-text">{countdown}</span>}
            </div>
          </div>

          <div className="border-t border-surface-200 pt-4 dark:border-dark-border">
            <p className="text-sm font-medium text-surface-700 dark:text-dark-text mb-2">Difference Calculator</p>
            <div className="flex gap-2">
              <input type="text" value={diffTarget} onChange={(e) => setDiffTarget(e.target.value)} placeholder="Enter second timestamp..." className="flex-1 rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm font-mono text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
              <button onClick={handleDiff} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors">Calculate</button>
            </div>
            {diffResult && <p className="mt-2 text-sm font-mono text-surface-700 dark:text-dark-text">{diffResult}</p>}
          </div>
        </>
      )}

      {!input.trim() && (
        <div className="text-center text-sm text-surface-400 dark:text-dark-muted py-8">
          Enter a Unix timestamp (seconds or milliseconds), ISO 8601 date, or human-readable date to convert
        </div>
      )}
    </div>
  );
}
