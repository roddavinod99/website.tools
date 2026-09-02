"use client";

import { useMemo, useState } from "react";
import { usePrefillTool } from "@/lib/load-example";

const MS_PER_DAY = 86400000;
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function fmt(date: Date): string {
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  const target = d.getMonth() + months;
  const year = d.getFullYear() + Math.floor(target / 12);
  const month = ((target % 12) + 12) % 12;
  const lastDay = new Date(year, month + 1, 0).getDate();
  d.setFullYear(year);
  d.setMonth(month);
  d.setDate(Math.min(d.getDate(), lastDay));
  return d;
}

interface Duration {
  years: number;
  months: number;
  days: number;
  totalDays: number;
}

function diffBetween(a: Date, b: Date): Duration {
  const start = a <= b ? a : b;
  const end = a <= b ? b : a;
  let years = 0;
  let months = 0;
  const anchor = new Date(start);
  while (addMonths(anchor, years + 1) <= end) years += 1;
  anchor.setFullYear(start.getFullYear() + years);
  while (addMonths(anchor, months + 1) <= end) months += 1;
  anchor.setMonth(start.getMonth() + years * 12 + months);
  const days = Math.round((end.getTime() - anchor.getTime()) / MS_PER_DAY);
  return { years, months, days, totalDays: Math.round((end.getTime() - start.getTime()) / MS_PER_DAY) };
}

type Op = "add" | "subtract";
type Unit = "days" | "weeks" | "months" | "years";

export function DateCalculator() {
  const [mode, setMode] = useState<"arithmetic" | "difference">("arithmetic");
  const [startIso, setStartIso] = useState(() => new Date().toISOString().slice(0, 10));
  const [op, setOp] = useState<Op>("add");
  const [amount, setAmount] = useState("30");
  const [unit, setUnit] = useState<Unit>("days");
  const [dateA, setDateA] = useState(() => new Date().toISOString().slice(0, 10));
  const [dateB, setDateB] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().slice(0, 10);
  });

  // Long-tail landing pages (PR 4 of PLAN.md) prefill the calculator
  // with { startDate, endDate, op, amount, unit, mode } so e.g.
  // /date/days-between-2026-01-01-and-2026-09-02 lands with the
  // difference computed immediately. The hook is a no-op when the
  // user lands on /tools/date-calculator directly.
  usePrefillTool("date-calculator", (prefill) => {
    if (prefill.mode === "arithmetic" || prefill.mode === "difference") {
      setMode(prefill.mode);
    }
    if (prefill.startDate) setStartIso(prefill.startDate);
    if (prefill.dateA) setDateA(prefill.dateA);
    if (prefill.dateB) setDateB(prefill.dateB);
    if (prefill.op === "add" || prefill.op === "subtract") setOp(prefill.op);
    if (prefill.amount) setAmount(prefill.amount);
    if (prefill.unit === "days" || prefill.unit === "weeks" || prefill.unit === "months" || prefill.unit === "years") {
      setUnit(prefill.unit);
    }
  });

  const result = useMemo(() => {
    if (mode === "arithmetic") {
      const n = parseInt(amount, 10);
      if (isNaN(n)) return null;
      const start = new Date(startIso + "T00:00:00");
      let d = start;
      const delta = op === "add" ? n : -n;
      switch (unit) {
        case "days": d = new Date(start.getTime() + delta * MS_PER_DAY); break;
        case "weeks": d = new Date(start.getTime() + delta * 7 * MS_PER_DAY); break;
        case "months": d = addMonths(start, delta); break;
        case "years": d = addMonths(start, delta * 12); break;
      }
      return { type: "result" as const, date: d };
    }
    const a = new Date(dateA + "T00:00:00");
    const b = new Date(dateB + "T00:00:00");
    return { type: "diff" as const, diff: diffBetween(a, b), earlier: a <= b ? a : b };
  }, [mode, startIso, op, amount, unit, dateA, dateB]);

  const inputCls =
    "w-full rounded-lg border border-surface-200 bg-white p-2.5 font-mono text-sm dark:border-dark-border dark:bg-dark-bg dark:text-dark-text";
  const labelCls = "block text-xs font-medium text-surface-700 dark:text-dark-text mb-1";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(["arithmetic", "difference"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
              mode === m ? "bg-brand-500 text-white" : "border border-surface-200 text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text"
            }`}
          >
            {m === "arithmetic" ? "Add / Subtract" : "Date Difference"}
          </button>
        ))}
      </div>

      {mode === "arithmetic" ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className={labelCls}>Start date</label>
            <input type="date" value={startIso} onChange={(e) => setStartIso(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Operation</label>
            <select value={op} onChange={(e) => setOp(e.target.value as Op)} className={inputCls}>
              <option value="add">Add</option>
              <option value="subtract">Subtract</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={labelCls}>Amount</label>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Unit</label>
              <select value={unit} onChange={(e) => setUnit(e.target.value as Unit)} className={inputCls}>
                <option value="days">Days</option>
                <option value="weeks">Weeks</option>
                <option value="months">Months</option>
                <option value="years">Years</option>
              </select>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Start date</label>
            <input type="date" value={dateA} onChange={(e) => setDateA(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>End date</label>
            <input type="date" value={dateB} onChange={(e) => setDateB(e.target.value)} className={inputCls} />
          </div>
        </div>
      )}

      {result?.type === "result" && (
        <div className="rounded-lg border border-surface-200 bg-surface-50 p-4 dark:border-dark-border dark:bg-dark-surface">
          <p className="text-xs font-medium uppercase tracking-wider text-surface-400 dark:text-dark-muted">Result</p>
          <p data-testid="tool-output" className="mt-1 text-xl font-bold text-surface-900 dark:text-dark-text">
            {fmt(result.date)}
          </p>
          <p className="mt-1 text-xs text-surface-500 dark:text-dark-muted">
            {DAY_NAMES[result.date.getDay()]} · {`${op === "add" ? "+" : "-"}${amount} ${unit}`} from{" "}
            {fmt(new Date(startIso))}
          </p>
        </div>
      )}

      {result?.type === "diff" && (
        <div className="rounded-lg border border-surface-200 bg-surface-50 p-4 dark:border-dark-border dark:bg-dark-surface">
          <p className="text-xs font-medium uppercase tracking-wider text-surface-400 dark:text-dark-muted">
            Difference
          </p>
          <p data-testid="tool-output" className="mt-1 text-xl font-bold text-surface-900 dark:text-dark-text">
            {result.diff.years} year{result.diff.years !== 1 ? "s" : ""}, {result.diff.months} month
            {result.diff.months !== 1 ? "s" : ""}, {result.diff.days} day{result.diff.days !== 1 ? "s" : ""}
          </p>
          <p className="mt-1 text-xs text-surface-500 dark:text-dark-muted">
            {result.diff.totalDays.toLocaleString()} total days between {fmt(new Date(dateA))} and{" "}
            {fmt(new Date(dateB))}
          </p>
        </div>
      )}

      <p className="text-[10px] text-surface-400 dark:text-dark-muted">
        Month-end dates clamp to the last valid day (e.g., Jan 31 + 1 month = Feb 28). Leap years are handled. Runs
        locally.
      </p>
    </div>
  );
}