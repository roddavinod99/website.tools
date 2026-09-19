"use client";

import { useState, useEffect, useMemo, useCallback } from "react";

interface ClockEntry {
  tz: string;
  label: string;
}

const FALLBACK_ZONES: ClockEntry[] = [
  { tz: "UTC", label: "UTC" },
  { tz: "America/New_York", label: "New York" },
  { tz: "America/Los_Angeles", label: "Los Angeles" },
  { tz: "Europe/London", label: "London" },
  { tz: "Europe/Berlin", label: "Berlin" },
  { tz: "Asia/Tokyo", label: "Tokyo" },
  { tz: "Asia/Kolkata", label: "Kolkata" },
  { tz: "Australia/Sydney", label: "Sydney" },
  { tz: "Asia/Dubai", label: "Dubai" },
  { tz: "Pacific/Auckland", label: "Auckland" },
  { tz: "America/Sao_Paulo", label: "São Paulo" },
  { tz: "Africa/Cairo", label: "Cairo" },
  { tz: "Asia/Singapore", label: "Singapore" },
  { tz: "Europe/Moscow", label: "Moscow" },
  { tz: "America/Chicago", label: "Chicago" },
  { tz: "Asia/Shanghai", label: "Shanghai" },
  { tz: "Africa/Johannesburg", label: "Johannesburg" },
  { tz: "Europe/Paris", label: "Paris" },
  { tz: "Asia/Bangkok", label: "Bangkok" },
  { tz: "America/Toronto", label: "Toronto" },
];

const DEFAULT_CLOCKS: ClockEntry[] = [
  { tz: "America/New_York", label: "New York" },
  { tz: "Europe/London", label: "London" },
  { tz: "Asia/Tokyo", label: "Tokyo" },
  { tz: "Australia/Sydney", label: "Sydney" },
];

function getSupportedZones(): ClockEntry[] {
  try {
    const maybe = (Intl as unknown as { supportedValuesOf?: (key: string) => string[] }).supportedValuesOf;
    if (typeof maybe === "function") {
      const zones = maybe.call(Intl, "timeZone");
      return zones.map((tz) => {
        const city = tz.split("/").pop()?.replace(/_/g, " ") ?? tz;
        return { tz, label: `${city} (${tz})` };
      });
    }
  } catch {
    // ignore
  }
  return FALLBACK_ZONES;
}

function formatTime(date: Date, tz: string): { time: string; date: string; offset: string } {
  try {
    const time = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(date);
    const dateStr = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
    // offset approximation via Intl
    let offset = "";
    try {
      const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        timeZoneName: "shortOffset",
        hour: "2-digit",
      }).formatToParts(date);
      const tzPart = parts.find((p) => p.type === "timeZoneName");
      offset = tzPart?.value ?? "";
    } catch {
      offset = "";
    }
    return { time, date: dateStr, offset };
  } catch {
    return { time: "Invalid", date: "", offset: "" };
  }
}

function diffHours(a: Date, tzA: string, tzB: string): string {
  try {
    // Use Intl to get numeric offset via formatToParts if available
    const getOffsetMinutes = (tz: string) => {
      const utc = Date.UTC(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate(), a.getUTCHours(), a.getUTCMinutes(), a.getUTCSeconds());
      const tzDateStr = new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(a);
      // tzDateStr like "09/19/2026, 14:30:00"
      const [datePart, timePart] = tzDateStr.split(", ");
      if (!datePart || !timePart) return 0;
      const [mo, da, yr] = datePart.split("/").map(Number);
      const [hh, mm, ss] = timePart.split(":").map(Number);
      const tzUtc = Date.UTC(yr!, mo! - 1, da!, hh!, mm!, ss!);
      return (tzUtc - utc) / 60000;
    };
    const offA = getOffsetMinutes(tzA);
    const offB = getOffsetMinutes(tzB);
    const diff = Math.round((offA - offB) / 60);
    if (diff === 0) return "same time";
    return `${diff > 0 ? "+" : ""}${diff}h ${diff > 0 ? "ahead" : "behind"}`;
  } catch {
    return "";
  }
}

export function WorldClock() {
  const [now, setNow] = useState<Date | null>(() => {
    if (typeof window === "undefined") return null;
    return new Date();
  });
  const [clocks, setClocks] = useState<ClockEntry[]>(DEFAULT_CLOCKS);
  const [selectedZone, setSelectedZone] = useState("");
  const [copied, setCopied] = useState("");

  const allZones = useMemo(() => getSupportedZones(), []);
  const localTz = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return "UTC";
    }
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const addZone = useCallback(() => {
    if (!selectedZone) return;
    if (clocks.some((c) => c.tz === selectedZone)) return;
    const found = allZones.find((z) => z.tz === selectedZone);
    const entry: ClockEntry = found ? { tz: found.tz, label: found.label.split(" (")[0]! } : { tz: selectedZone, label: selectedZone.split("/").pop()?.replace(/_/g, " ") ?? selectedZone };
    setClocks((prev) => [...prev, entry]);
  }, [selectedZone, clocks, allZones]);

  const removeZone = useCallback((tz: string) => {
    setClocks((prev) => prev.filter((c) => c.tz !== tz));
  }, []);

  const handleCopy = useCallback(async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 1500);
  }, []);

  if (!now) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border border-surface-200 bg-surface-50 p-6 text-center dark:border-dark-border dark:bg-dark-surface">
          <p className="text-sm text-surface-500 dark:text-dark-muted">Loading clocks...</p>
        </div>
      </div>
    );
  }

  const localFormatted = formatTime(now, localTz);

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-brand-200 bg-brand-50 p-3 dark:border-brand-800 dark:bg-brand-950/30 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-brand-700 dark:text-brand-400">Local time · {localTz}</p>
          <p className="text-lg font-mono font-bold text-surface-900 dark:text-dark-text">{localFormatted.time}</p>
          <p className="text-xs text-surface-500 dark:text-dark-muted">{localFormatted.date} {localFormatted.offset}</p>
        </div>
        <button onClick={() => handleCopy(`${localFormatted.time} ${localFormatted.date} ${localTz}`, "local")} aria-label="Copy local time" className="rounded bg-brand-500 px-2 py-1 text-xs text-white hover:bg-brand-600">
          {copied === "local" ? "Copied!" : "Copy"}
        </button>
      </div>

      <div className="flex flex-wrap gap-2 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-surface-700 dark:text-dark-text mb-1">Add timezone</label>
          <select value={selectedZone} onChange={(e) => setSelectedZone(e.target.value)} aria-label="Select timezone to add" className="w-full rounded-md border border-surface-200 bg-white px-3 py-2 text-sm text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value="">Select a timezone...</option>
            {allZones.map((z) => (
              <option key={z.tz} value={z.tz}>
                {z.label}
              </option>
            ))}
          </select>
        </div>
        <button onClick={addZone} disabled={!selectedZone} aria-label="Add timezone" className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-40">
          Add
        </button>
      </div>

      <div data-testid="tool-output" className="grid gap-3 sm:grid-cols-2">
        {clocks.map((entry) => {
          const fmt = formatTime(now, entry.tz);
          const diff = diffHours(now, entry.tz, localTz);
          return (
            <div key={entry.tz} className="rounded-md border border-surface-200 bg-white p-3 dark:border-dark-border dark:bg-dark-surface">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-surface-900 dark:text-dark-text">{entry.label}</p>
                  <p className="text-[11px] text-surface-400 dark:text-dark-muted font-mono">{entry.tz}</p>
                </div>
                <button onClick={() => removeZone(entry.tz)} aria-label={`Remove ${entry.label}`} className="rounded px-1.5 py-0.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                  Remove
                </button>
              </div>
              <p className="mt-2 text-xl font-mono font-bold text-surface-900 dark:text-dark-text">{fmt.time}</p>
              <p className="text-xs text-surface-500 dark:text-dark-muted">{fmt.date} {fmt.offset && `· ${fmt.offset}`}</p>
              <p className="mt-1 text-xs">
                <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${diff === "same time" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : diff.startsWith("+") ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"}`}>
                  {diff} vs local
                </span>
              </p>
              <button onClick={() => handleCopy(`${fmt.time} ${fmt.date} ${entry.tz}`, entry.tz)} aria-label={`Copy time for ${entry.label}`} className="mt-2 rounded border border-surface-200 px-2 py-1 text-xs text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text">
                {copied === entry.tz ? "Copied!" : "Copy"}
              </button>
            </div>
          );
        })}
      </div>

      {clocks.length === 0 && <p className="text-sm text-surface-500 dark:text-dark-muted text-center">No clocks added. Select a timezone above to add one.</p>}

      <p className="text-[11px] text-surface-400 dark:text-dark-muted text-center">Times rendered with <code>Intl.DateTimeFormat</code> and updated every second via <code>setInterval</code>. No network requests.</p>
    </div>
  );
}
