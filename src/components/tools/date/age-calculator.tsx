"use client";

import { useState, useMemo, useCallback } from "react";
import { usePrefillTool } from "@/lib/load-example";

const MS_PER_DAY = 86400000;
const MS_PER_HOUR = 3600000;
const MS_PER_MINUTE = 60000;

const ZODIAC_SIGNS: { name: string; from: string; to: string }[] = [
  { name: "Capricorn", from: "12-22", to: "01-19" },
  { name: "Aquarius", from: "01-20", to: "02-18" },
  { name: "Pisces", from: "02-19", to: "03-20" },
  { name: "Aries", from: "03-21", to: "04-19" },
  { name: "Taurus", from: "04-20", to: "05-20" },
  { name: "Gemini", from: "05-21", to: "06-20" },
  { name: "Cancer", from: "06-21", to: "07-22" },
  { name: "Leo", from: "07-23", to: "08-22" },
  { name: "Virgo", from: "08-23", to: "09-22" },
  { name: "Libra", from: "09-23", to: "10-22" },
  { name: "Scorpio", from: "10-23", to: "11-21" },
  { name: "Sagittarius", from: "11-22", to: "12-21" },
];

function zodiacFor(date: Date): string {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const key = `${mm}-${dd}`;
  for (const z of ZODIAC_SIGNS) {
    if (z.from <= z.to) {
      if (key >= z.from && key <= z.to) return z.name;
    } else {
      // Capricorn spans Dec → Jan
      if (key >= z.from || key <= z.to) return z.name;
    }
  }
  return "Unknown";
}

function generationFor(year: number): string {
  if (year >= 2013) return "Generation Alpha";
  if (year >= 1997) return "Generation Z";
  if (year >= 1981) return "Millennial";
  if (year >= 1965) return "Generation X";
  if (year >= 1946) return "Baby Boomer";
  if (year >= 1928) return "Silent Generation";
  return "Greatest Generation";
}

function dayOfWeekName(date: Date): string {
  return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][date.getDay()]!;
}

function fmt(date: Date): string {
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

interface Duration {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalHours: number;
  totalMinutes: number;
}

function diffBetween(a: Date, b: Date): Duration {
  const start = a <= b ? a : b;
  const end = a <= b ? b : a;
  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();
  if (days < 0) {
    months -= 1;
    const lastMonth = new Date(end.getFullYear(), end.getMonth(), 0);
    days += lastMonth.getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  if (years < 0) {
    years = 0;
    months = 0;
    days = 0;
  }
  const totalMs = end.getTime() - start.getTime();
  return {
    years,
    months,
    days,
    totalDays: Math.floor(totalMs / MS_PER_DAY),
    totalHours: Math.floor(totalMs / MS_PER_HOUR),
    totalMinutes: Math.floor(totalMs / MS_PER_MINUTE),
  };
}

function nextBirthday(birthdate: Date, from: Date): Date {
  const next = new Date(from);
  next.setFullYear(from.getFullYear());
  next.setMonth(birthdate.getMonth());
  next.setDate(birthdate.getDate());
  if (next.getTime() < from.getTime()) {
    next.setFullYear(from.getFullYear() + 1);
  }
  return next;
}

export function AgeCalculator() {
  const [birthdate, setBirthdate] = useState("");
  const [atDate, setAtDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [copied, setCopied] = useState(false);

  // Long-tail landing pages (PR 4 of PLAN.md) prefill the calculator
  // with { birthdate } so e.g. /age/from-1990-05-15 shows the age
  // for a person born on 1990-05-15 immediately on load.
  usePrefillTool("age-calculator", (prefill) => {
    if (prefill.birthdate) setBirthdate(prefill.birthdate);
    if (prefill.atDate) setAtDate(prefill.atDate);
  });

  const birth = useMemo(() => {
    if (!birthdate) return null;
    const d = new Date(birthdate + "T00:00:00");
    return isNaN(d.getTime()) ? null : d;
  }, [birthdate]);

  const at = useMemo(() => {
    if (!atDate) return null;
    const d = new Date(atDate + "T00:00:00");
    return isNaN(d.getTime()) ? null : d;
  }, [atDate]);

  const error = useMemo(() => {
    if (!birth || !at) return null;
    if (birth.getTime() > at.getTime()) {
      return "Birthdate is in the future relative to the 'at' date. Pick a non-future birthdate or move the 'at' date forward.";
    }
    const year = birth.getFullYear();
    if (year < 1900 || year > new Date().getFullYear()) {
      return "Birthdate must be between 1900 and the current year.";
    }
    return null;
  }, [birth, at]);

  const duration = useMemo(() => {
    if (!birth || !at || error) return null;
    return diffBetween(birth, at);
  }, [birth, at, error]);

  const upcoming = useMemo(() => {
    if (!birth || !at || error) return null;
    const nb = nextBirthday(birth, at);
    return { date: nb, daysUntil: Math.round((nb.getTime() - at.getTime()) / MS_PER_DAY) };
  }, [birth, at, error]);

  const copy = useCallback(async () => {
    if (!duration || !birth || !at) return;
    const text = `Age: ${duration.years} years, ${duration.months} months, ${duration.days} days (${duration.totalDays.toLocaleString()} total days). Born ${fmt(birth)}, calculated on ${fmt(at)}.`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }, [duration, birth, at]);

  const inputCls =
    "w-full rounded-lg border border-surface-200 bg-white p-2.5 font-mono text-sm dark:border-dark-border dark:bg-dark-bg dark:text-dark-text";
  const labelCls = "block text-xs font-medium text-surface-700 dark:text-dark-text mb-1";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Date of birth</label>
          <input
            type="date"
            value={birthdate}
            onChange={(e) => setBirthdate(e.target.value)}
            max={new Date().toISOString().slice(0, 10)}
            data-testid="age-birthdate"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Age at (date)</label>
          <input
            type="date"
            value={atDate}
            onChange={(e) => setAtDate(e.target.value)}
            data-testid="age-atdate"
            className={inputCls}
          />
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300"
        >
          {error}
        </div>
      )}

      {duration && birth && (
        <div
          data-testid="tool-output"
          onClick={copy}
          className="cursor-pointer rounded-lg border border-surface-200 bg-surface-50 p-4 transition-shadow hover:shadow-md dark:border-dark-border dark:bg-dark-surface"
        >
          <div className="flex items-baseline justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-surface-500 dark:text-dark-muted">
              Age
            </p>
            <p className="text-[10px] text-brand-500">{copied ? "Copied!" : "click to copy"}</p>
          </div>
          <p className="mt-1 text-3xl font-bold text-surface-900 dark:text-dark-text">
            {duration.years} <span className="text-base font-medium text-surface-500 dark:text-dark-muted">years</span>{" "}
            {duration.months} <span className="text-base font-medium text-surface-500 dark:text-dark-muted">months</span>{" "}
            {duration.days} <span className="text-base font-medium text-surface-500 dark:text-dark-muted">days</span>
          </p>
          <p className="mt-1 text-xs text-surface-500 dark:text-dark-muted">
            {duration.totalDays.toLocaleString()} total days · {duration.totalHours.toLocaleString()} hours · {duration.totalMinutes.toLocaleString()} minutes
          </p>
        </div>
      )}

      {duration && birth && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-surface-200 bg-white p-3 dark:border-dark-border dark:bg-dark-surface">
            <p className="text-[10px] font-medium uppercase tracking-wider text-surface-500 dark:text-dark-muted">Born on</p>
            <p className="mt-1 text-sm font-semibold text-surface-900 dark:text-dark-text">{fmt(birth)}</p>
            <p className="text-[10px] text-surface-500 dark:text-dark-muted">{dayOfWeekName(birth)}</p>
          </div>
          <div className="rounded-lg border border-surface-200 bg-white p-3 dark:border-dark-border dark:bg-dark-surface">
            <p className="text-[10px] font-medium uppercase tracking-wider text-surface-500 dark:text-dark-muted">Zodiac</p>
            <p className="mt-1 text-sm font-semibold text-surface-900 dark:text-dark-text">{zodiacFor(birth)}</p>
            <p className="text-[10px] text-surface-500 dark:text-dark-muted">Western astrology</p>
          </div>
          <div className="rounded-lg border border-surface-200 bg-white p-3 dark:border-dark-border dark:bg-dark-surface">
            <p className="text-[10px] font-medium uppercase tracking-wider text-surface-500 dark:text-dark-muted">Generation</p>
            <p className="mt-1 text-sm font-semibold text-surface-900 dark:text-dark-text">{generationFor(birth.getFullYear())}</p>
            <p className="text-[10px] text-surface-500 dark:text-dark-muted">Cohort estimate</p>
          </div>
        </div>
      )}

      {upcoming && duration && (
        <div className="rounded-lg border border-surface-200 bg-white p-4 dark:border-dark-border dark:bg-dark-surface">
          <p className="text-[10px] font-medium uppercase tracking-wider text-surface-500 dark:text-dark-muted">Next birthday</p>
          <p className="mt-1 text-base font-semibold text-surface-900 dark:text-dark-text">
            {fmt(upcoming.date)} <span className="text-sm font-normal text-surface-500 dark:text-dark-muted">({dayOfWeekName(upcoming.date)})</span>
          </p>
          <p className="mt-1 text-xs text-surface-600 dark:text-dark-muted">
            {upcoming.daysUntil === 0
              ? "Today!"
              : upcoming.daysUntil === 1
              ? "Tomorrow — turning " + (duration.years + 1)
              : `In ${upcoming.daysUntil} days — turning ${duration.years + 1}`}
          </p>
        </div>
      )}

      {!duration && !error && (
        <p className="text-xs text-surface-500 dark:text-dark-muted text-center py-4">
          Enter a date of birth to compute age, total days, and the next birthday.
        </p>
      )}

      <p className="text-[10px] text-surface-400 dark:text-dark-muted">
        Year-month-day arithmetic uses calendar months (Jan 31 + 1 month = Feb 28/29). All math runs in your browser.
      </p>
    </div>
  );
}
