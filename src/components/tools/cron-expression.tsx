"use client";

import { useState, useMemo, useCallback, useRef } from "react";

type CronFields = [string, string, string, string, string, string?];

interface Preset { label: string; cron: string; }
interface ValidationResult { valid: boolean; error?: string; field?: number; }

const PRESETS: Preset[] = [
  { label: "Every minute", cron: "* * * * *" },
  { label: "Every 5 min", cron: "*/5 * * * *" },
  { label: "Every 15 min", cron: "*/15 * * * *" },
  { label: "Every 30 min", cron: "*/30 * * * *" },
  { label: "Hourly", cron: "0 * * * *" },
  { label: "Daily @ midnight", cron: "0 0 * * *" },
  { label: "Every weekday 9am", cron: "0 9 * * 1-5" },
  { label: "Weekly @ midnight", cron: "0 0 * * 0" },
  { label: "Monthly (1st)", cron: "0 0 1 * *" },
  { label: "Yearly (Jan 1)", cron: "0 0 1 1 *" },
];

const MACROS: Record<string, string> = {
  "@yearly": "0 0 1 1 *", "@annually": "0 0 1 1 *",
  "@monthly": "0 0 1 * *", "@weekly": "0 0 * * 0",
  "@daily": "0 0 * * *", "@midnight": "0 0 * * *",
  "@hourly": "0 * * * *", "@reboot": "@reboot",
};

const DAY_NAMES = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const MONTH_NAMES = ["", "JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const FIELD_LABELS = ["Minute", "Hour", "Day of Month", "Month", "Day of Week", "Seconds"];

function describeCron(parts: (string | undefined)[]): string {
  const [min = "*", hour = "*", dom = "*", mon = "*", dow = "*", sec] = parts;
  if (sec !== undefined) return describeSixField(parts);
  const all = [min, hour, dom, mon, dow];
  if (all.every((f) => f === "*")) return "Every minute";
  if (min === "0" && hour === "*" && dom === "*" && mon === "*" && dow === "*") return "Every hour (at minute 0)";
  if (min === "*" && hour === "*" && dom === "*" && mon === "*" && dow === "*") return "Every minute";

  const desc: string[] = [];
  if (min.startsWith("*/") && hour === "*") desc.push(`every ${min.slice(2)} minutes`);
  else if (min !== "*" && hour === "*") desc.push(`every hour at minute ${min}`);
  else if (min !== "*" && hour !== "*") {
    if (hour.startsWith("*/")) desc.push(`every ${hour.slice(2)} hours at minute ${min}`);
    else desc.push(`At ${hour.padStart(2, "0")}:${min.padStart(2, "0")}`);
  }
  if (dom !== "*" && mon !== "*") desc.push(`on day ${dom} of month ${mon}`);
  else if (dom !== "*") desc.push(`on day ${dom}`);
  else if (mon !== "*") desc.push(`in ${MONTH_NAMES[parseInt(mon)] || mon}`);
  if (dow !== "*") {
    if (dow.includes("-")) { const [s, e] = dow.split("-"); desc.push(`on ${DAY_NAMES[parseInt(s)]}-${DAY_NAMES[parseInt(e)]}`); }
    else if (dow.includes(",")) desc.push(`on ${dow.split(",").map((d) => DAY_NAMES[parseInt(d)]).join(",")}`);
    else desc.push(`on ${DAY_NAMES[parseInt(dow)]}`);
  }
  return desc.join(", ") || "Custom";
}

function describeSixField([sec, min, hour, dom, mon, dow]: (string | undefined)[]): string {
  if ([sec, min, hour, dom, mon, dow].every((f) => f === "*")) return "Every second";
  let desc = describeCron([min, hour, dom, mon, dow]);
  if (sec !== "*") { if (sec === "0") desc = desc.replace("Every minute", "Every minute (at second 0)").replace("every", "at second 0, every"); else desc = `At second ${sec}, ${desc}`; }
  return desc;
}

function parseCron(raw: string): CronFields {
  const trimmed = raw.trim();
  const macro = MACROS[trimmed.toLowerCase()];
  if (macro) return parseCron(macro);
  if (trimmed === "@reboot") return ["@reboot", "*", "*", "*", "*"];
  const parts = trimmed.split(/\s+/);
  if (parts.length < 5) return ["*", "*", "*", "*", "*"];
  const extra = parts.length === 6 ? parts[5] : undefined;
  return [parts[0], parts[1], parts[2], parts[3], parts[4], extra];
}

function validateCron(raw: string): ValidationResult {
  const trimmed = raw.trim();
  if (!trimmed) return { valid: false, error: "Expression is empty" };
  if (trimmed === "@reboot") return { valid: true };
  if (MACROS[trimmed.toLowerCase()]) return { valid: true };
  if (trimmed.startsWith("@")) return { valid: false, error: `Unknown macro: ${trimmed}` };
  const parts = trimmed.split(/\s+/);
  if (parts.length < 5) return { valid: false, error: `Expected 5 fields, got ${parts.length}`, field: parts.length };
  if (parts.length > 6) return { valid: false, error: `Too many fields (${parts.length})`, field: 6 };
  const ranges = [
    { name: "Minute", min: 0, max: 59 },
    { name: "Hour", min: 0, max: 23 },
    { name: "Day of Month", min: 1, max: 31 },
    { name: "Month", min: 1, max: 12 },
    { name: "Day of Week", min: 0, max: 7 },
  ];
  if (parts.length === 6) ranges.unshift({ name: "Seconds", min: 0, max: 59 });
  const startIdx = parts.length === 6 ? 0 : 0;
  for (let i = startIdx; i < parts.length; i++) {
    const idx = i - startIdx;
    const field = parts[i];
    if (field === "*" || field === "?") continue;
    const tokens = field.split(",");
    for (const token of tokens) {
      if (/^\d+$/.test(token)) {
        const n = parseInt(token);
        if (n < ranges[idx].min || n > ranges[idx].max) return { valid: false, error: `${ranges[idx].name}: ${n} out of range (${ranges[idx].min}-${ranges[idx].max})`, field: i };
      } else if (/^\d+-\d+$/.test(token)) {
        const [l, r] = token.split("-").map(Number);
        if (l < ranges[idx].min || r > ranges[idx].max || l > r) return { valid: false, error: `Invalid range in ${ranges[idx].name}: ${token}`, field: i };
      } else if (/^\*\/\d+$/.test(token)) {
        const n = parseInt(token.slice(2));
        if (n < 1 || n > ranges[idx].max) return { valid: false, error: `Invalid step in ${ranges[idx].name}: ${token}`, field: i };
      } else if (/^\d+\/\d+$/.test(token)) {
        // valid step syntax
      } else if (/^[a-zA-Z]+$/.test(token)) {
        if (idx === 3) { if (!MONTH_NAMES.slice(1).includes(token.toUpperCase())) return { valid: false, error: `Unknown month: ${token}`, field: i }; }
        else if (idx === 4) { if (!DAY_NAMES.slice(0, 7).includes(token.toUpperCase())) return { valid: false, error: `Unknown day: ${token}`, field: i }; }
        else return { valid: false, error: `Unexpected text in ${ranges[idx].name}: ${token}`, field: i };
      } else return { valid: false, error: `Invalid token in ${ranges[idx].name}: ${token}`, field: i };
    }
  }
  return { valid: true };
}

function computeNextTimes(cron: string, count: number, tz?: string): { times: Date[]; errors: string[] } {
  if (cron === "@reboot") return { times: [new Date()], errors: [] };
  const parsed = parseCron(cron);
  const [s, min = "*", hour = "*", dom = "*", mon = "*", dow = "*"] = parsed;
  if (s !== undefined && s !== "0") return { times: [], errors: ["Seconds-based preview not supported"] };
  const times: Date[] = [];
  const errors: string[] = [];
  const now = new Date();
  let current = new Date(now);
  current.setSeconds(0, 0);
  if (tz) {
    try { const t = new Date(current.toLocaleString("en-US", { timeZone: tz })); if (!isNaN(t.getTime())) current = t; }
    catch { /* ignore */ }
  }
  current.setMinutes(current.getMinutes() + 1 - (current.getMinutes() % 1));
  const maxIter = 525600;
  for (let iter = 0; iter < maxIter && times.length < count; iter++) {
    const mOk = min === "*" || min.split(",").map(Number).includes(current.getMinutes());
    const hOk = hour === "*" || hour.split(",").map(Number).includes(current.getHours());
    const domOk = dom === "*" || dom === "?" || dom.split(",").map(Number).includes(current.getDate());
    const monOk = mon === "*" || mon === "?" || mon.split(",").map(Number).includes(current.getMonth() + 1);
    const dowOk = dow === "*" || dow === "?" || dow.split(",").map(Number).includes(current.getDay());
    if (mOk && hOk && domOk && monOk && dowOk) times.push(new Date(current));
    current.setMinutes(current.getMinutes() + 1);
    if (current.getFullYear() > now.getFullYear() + 5) break;
  }
  return { times, errors };
}

function formatTime(date: Date, tz?: string): string {
  try {
    if (tz) return date.toLocaleString("en-US", { timeZone: tz, hour12: false, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
    return date.toISOString().replace("T", " ").slice(0, 16);
  } catch { return date.toISOString().replace("T", " ").slice(0, 16); }
}

const FIELD_HELP: Record<string, string> = {
  minute: "Minute of the hour (0-59). Use * for every minute, */5 for every 5 minutes, 0,15,30,45 for specific minutes.",
  hour: "Hour of the day (0-23). Use * for every hour, */2 for every 2 hours, 9-17 for a range.",
  dayOfMonth: "Day of the month (1-31). Use * for every day, 1,15 for specific days, 1-15 for a range.",
  month: "Month (1-12 or JAN-DEC). Use * for every month, 1-6 for first half, 1,4,7,10 for quarterly.",
  dayOfWeek: "Day of week (0-7, 0=SUN). Use * for every day, 1-5 for weekdays, 0,6 for weekends.",
};

export function CronExpression() {
  const [cronStr, setCronStr] = useState("0 0 * * *");
  const [editMode, setEditMode] = useState<"form" | "raw">("form");
  const [withSeconds, setWithSeconds] = useState(false);
  const [timezone, setTimezone] = useState("");
  const [favorites, setFavorites] = useState<string[]>(() => {
    try { const saved = localStorage.getItem("cron-favorites"); return saved ? JSON.parse(saved) : []; } catch { return []; }
  });
  const [favCopied, setFavCopied] = useState(false);
  const [validation, setValidation] = useState<ValidationResult>({ valid: true });
  const rawRef = useRef<HTMLInputElement>(null);

  const parts = useMemo(() => parseCron(cronStr), [cronStr]);
  const displayParts = useMemo(() => {
    if (withSeconds && parts[5] === undefined) return [parts[0], parts[1], parts[2], parts[3], parts[4], "0"];
    if (!withSeconds && parts[5] !== undefined) return [parts[0], parts[1], parts[2], parts[3], parts[4]];
    return parts;
  }, [parts, withSeconds]);

  const description = useMemo(() => describeCron(displayParts as CronFields), [displayParts]);

  const { times: nextTimes, errors: nextErrors } = useMemo(() => computeNextTimes(cronStr, 10, timezone || undefined), [cronStr, timezone]);

  const applyPreset = useCallback((cron: string) => {
    setCronStr(cron);
    setValidation(validateCron(cron));
  }, []);

  const handleRawChange = useCallback((val: string) => {
    setCronStr(val);
    setValidation(validateCron(val));
  }, []);

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

  const saveToFavorites = () => {
    if (favorites.includes(cronStr)) return;
    const next = [...favorites, cronStr].slice(-10);
    setFavorites(next);
    localStorage.setItem("cron-favorites", JSON.stringify(next));
  };

  const removeFav = (cron: string) => {
    const next = favorites.filter((f) => f !== cron);
    setFavorites(next);
    localStorage.setItem("cron-favorites", JSON.stringify(next));
  };

  const copyAsSystemd = () => {
    const content = `[Unit]\nDescription=Cron job: ${description}\n\n[Timer]\nOnCalendar=${cronStr}\nPersistent=true\n\n[Install]\nWantedBy=timers.target`;
    navigator.clipboard.writeText(content);
    setFavCopied(true);
    setTimeout(() => setFavCopied(false), 2000);
  };

  const copyAsCrontab = () => {
    navigator.clipboard.writeText(`# ${description}\n${cronStr} /path/to/command`);
    setFavCopied(true);
    setTimeout(() => setFavCopied(false), 2000);
  };

  const fields = useMemo(() => {
    const labels = FIELD_LABELS.slice(FIELD_LABELS.length - 5);
    if (withSeconds) labels.unshift("Seconds");
    return labels.map((label, i) => ({ label, value: displayParts[i] || "*", key: label.toLowerCase().replace(/\s+/g, "") }));
  }, [displayParts, withSeconds]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button key={p.cron} onClick={() => applyPreset(p.cron)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              cronStr === p.cron
                ? "border-brand-400 bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-300"
                : "border-surface-200 text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface"
            }`}>
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-surface-700 dark:text-dark-text">
          <input type="checkbox" checked={withSeconds} onChange={(e) => { const checked = e.target.checked; setWithSeconds(checked); const p = parseCron(cronStr); const dp = checked && p[5] === undefined ? [...p, "0"] : !checked && p[5] !== undefined ? p.slice(0, 5) : p; setCronStr(dp.join(" ")); }} className="accent-brand-500" />
          6-field (seconds)
        </label>
        <div className="flex items-center gap-2">
          <label className="text-sm text-surface-700 dark:text-dark-text">Mode:</label>
          <button onClick={() => setEditMode("form")}
            className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${editMode === "form" ? "bg-brand-500 text-white" : "border border-surface-200 text-surface-700 dark:border-dark-border dark:text-dark-text"}`}>Form</button>
          <button onClick={() => setEditMode("raw")}
            className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${editMode === "raw" ? "bg-brand-500 text-white" : "border border-surface-200 text-surface-700 dark:border-dark-border dark:text-dark-text"}`}>Raw</button>
        </div>
        <div>
          <label className="text-sm text-surface-700 dark:text-dark-text mr-1">TZ:</label>
          <input type="text" value={timezone} onChange={(e) => setTimezone(e.target.value)} placeholder="UTC"
            className="w-24 rounded-lg border border-surface-200 bg-white p-1.5 text-xs text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
        </div>
      </div>

      {editMode === "form" ? (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {fields.map((f, i) => (
            <div key={f.key}>
              <label className="block text-xs font-medium text-surface-600 dark:text-dark-muted mb-1">{f.label}</label>
              <input type="text" value={f.value}
                onChange={(e) => {
                  const p = [...displayParts] as string[];
                  while (p.length <= i) p.push("*");
                  p[i] = e.target.value || "*";
                  setCronStr(p.join(" "));
                  setValidation(validateCron(p.join(" ")));
                }}
                className="w-full rounded-lg border border-surface-200 bg-white p-2 text-sm font-mono text-surface-900 text-center focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
            </div>
          ))}
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Raw Cron Expression</label>
          <div className="flex gap-2">
            <input ref={rawRef} type="text" value={cronStr}
              onChange={(e) => handleRawChange(e.target.value)}
              className="flex-1 rounded-lg border border-surface-200 bg-white p-3 text-lg font-mono text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
          </div>
        </div>
      )}

      {!validation.valid && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-700 dark:border-red-700 dark:bg-red-900/30 dark:text-red-300">
          {validation.error}
        </div>
      )}

      <div className="rounded-lg border border-surface-200 bg-surface-50 p-3 dark:border-dark-border dark:bg-dark-surface">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-surface-500 dark:text-dark-muted mb-0.5">Cron Expression</p>
            <p className="text-lg font-mono font-bold text-surface-900 dark:text-dark-text select-all">{cronStr}</p>
            <p className="text-sm text-surface-600 dark:text-dark-muted mt-1">{description}</p>
          </div>
          <button onClick={() => copy(cronStr)}
            className="rounded-lg border border-surface-200 px-3 py-1.5 text-xs font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors">Copy</button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={saveToFavorites} className="rounded-lg border border-surface-200 px-3 py-1.5 text-xs font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors">Save to Favorites</button>
        <button onClick={copyAsCrontab} className="rounded-lg border border-surface-200 px-3 py-1.5 text-xs font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors">
          {favCopied ? "Copied!" : "Copy as crontab"}
        </button>
        <button onClick={copyAsSystemd} className="rounded-lg border border-surface-200 px-3 py-1.5 text-xs font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors">
          Copy as systemd timer
        </button>
        <select value="" onChange={(e) => { if (e.target.value) applyPreset(e.target.value); }}
          className="rounded-lg border border-surface-200 bg-white p-1.5 text-xs text-surface-900 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
          <option value="">Macros...</option>
          {Object.entries(MACROS).map(([k, v]) => (<option key={k} value={v}>{k}</option>))}
        </select>
      </div>

      {favorites.length > 0 && (
        <div>
          <p className="text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">Favorites</p>
          <div className="flex flex-wrap gap-1">
            {favorites.map((fav) => (
              <div key={fav} className="flex items-center gap-1 rounded-lg border border-surface-200 bg-white px-2 py-1 dark:border-dark-border dark:bg-dark-surface">
                <button onClick={() => applyPreset(fav)} className="text-xs font-mono text-surface-700 hover:text-brand-500 dark:text-dark-text">{fav}</button>
                <button onClick={() => removeFav(fav)} className="text-xs text-surface-400 hover:text-red-500">&times;</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {nextTimes.length > 0 && (
        <div>
          <p className="text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Next Execution Times</p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1">
            {nextTimes.map((t: Date, i: number) => (
              <div key={i} className="rounded border border-surface-200 bg-surface-50 px-2 py-1 text-xs font-mono text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
                {formatTime(t, timezone || undefined)}
              </div>
            ))}
          </div>
        </div>
      )}
      {nextErrors.length > 0 && (
        <p className="text-xs text-orange-500">{nextErrors[0]}</p>
      )}

      <div className="border-t border-surface-200 pt-3 dark:border-dark-border">
        <p className="text-xs font-medium text-surface-500 dark:text-dark-muted mb-2">Field Explanations</p>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
          {fields.map((f) => (
            <div key={f.key} className="text-xs text-surface-600 dark:text-dark-muted">
              <span className="font-medium text-surface-700 dark:text-dark-text">{f.label}:</span> {FIELD_HELP[f.key] || "See cron documentation."}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
