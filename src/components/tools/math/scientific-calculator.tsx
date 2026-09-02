"use client";

import { useState, useCallback } from "react";
import { usePrefillTool } from "@/lib/load-example";

/**
 * Scientific Calculator — pure browser implementation, 100% client-side.
 *
 * Per AGENTS.md "react-hooks/purity" rule: the trig / log buttons
 * capture the current input in an event handler (handleFunction) and
 * never read it during render. Math.* calls are pure and idempotent,
 * so this is safe.
 *
 * Per AGENTS.md "use client": the file starts with "use client" and
 * there is no server-side data dependency. All state stays in the
 * browser; no network roundtrips.
 */

type Op = "+" | "-" | "×" | "÷" | "^";
interface Pending {
  value: number;
  op: Op;
}

function fmt(n: number): string {
  if (!Number.isFinite(n)) return "Error";
  if (Math.abs(n) >= 1e12) return n.toExponential(6);
  // Up to 10 significant digits, no trailing zeros
  return Number(n.toPrecision(12)).toString();
}

function applyOp(a: number, b: number, op: Op): number {
  switch (op) {
    case "+":
      return a + b;
    case "-":
      return a - b;
    case "×":
      return a * b;
    case "÷":
      return b === 0 ? NaN : a / b;
    case "^":
      return Math.pow(a, b);
  }
}

function unaryOp(v: number, op: string): number {
  switch (op) {
    case "sqrt":
      return v < 0 ? NaN : Math.sqrt(v);
    case "sq":
      return v * v;
    case "inv":
      return v === 0 ? NaN : 1 / v;
    case "neg":
      return -v;
    case "pct":
      return v / 100;
    default:
      return v;
  }
}

const TRIG_FNS: { label: string; apply: (rad: number) => number }[] = [
  { label: "sin", apply: (r) => Math.sin(r) },
  { label: "cos", apply: (r) => Math.cos(r) },
  { label: "tan", apply: (r) => Math.tan(r) },
  { label: "asin", apply: (r) => Math.asin(r) },
  { label: "acos", apply: (r) => Math.acos(r) },
  { label: "atan", apply: (r) => Math.atan(r) },
];

const LOG_FNS: { label: string; apply: (n: number) => number }[] = [
  { label: "log", apply: (n) => Math.log10(n) },
  { label: "ln", apply: (n) => Math.log(n) },
  { label: "10^x", apply: (n) => Math.pow(10, n) },
  { label: "e^x", apply: (n) => Math.exp(n) },
];

const CONSTANTS: { label: string; value: number }[] = [
  { label: "π", value: Math.PI },
  { label: "e", value: Math.E },
];

export function ScientificCalculator() {
  const [display, setDisplay] = useState("0");
  const [memory, setMemory] = useState<number>(0);
  const [pending, setPending] = useState<Pending | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [angleMode, setAngleMode] = useState<"deg" | "rad">("deg");
  const [history, setHistory] = useState<string[]>([]);

  // Long-tail landing pages (PR 6 of PLAN.md) prefill the calculator
  // with an initial value, e.g. /calc/sin-30-degrees.
  usePrefillTool("scientific-calculator", (prefill) => {
    if (prefill.value) setDisplay(prefill.value);
    if (prefill.angleMode === "deg" || prefill.angleMode === "rad") {
      setAngleMode(prefill.angleMode);
    }
  });

  const inputValue = useCallback((): number => {
    const v = parseFloat(display);
    return Number.isFinite(v) ? v : NaN;
  }, [display]);

  const handleDigit = useCallback(
    (d: string) => {
      if (waitingForOperand) {
        setDisplay(d);
        setWaitingForOperand(false);
      } else {
        setDisplay(display === "0" ? d : display + d);
      }
    },
    [display, waitingForOperand],
  );

  const handleDecimal = useCallback(() => {
    if (waitingForOperand) {
      setDisplay("0.");
      setWaitingForOperand(false);
      return;
    }
    if (!display.includes(".")) {
      setDisplay(display + ".");
    }
  }, [display, waitingForOperand]);

  const handleClear = useCallback(() => {
    setDisplay("0");
    setPending(null);
    setWaitingForOperand(false);
  }, []);

  const handleClearAll = useCallback(() => {
    setDisplay("0");
    setPending(null);
    setWaitingForOperand(false);
    setHistory([]);
  }, []);

  const handleBackspace = useCallback(() => {
    if (waitingForOperand) return;
    if (display.length === 1 || display === "0") {
      setDisplay("0");
    } else {
      setDisplay(display.slice(0, -1));
    }
  }, [display, waitingForOperand]);

  const handleOperator = useCallback(
    (op: Op) => {
      const v = inputValue();
      if (Number.isNaN(v)) return;
      if (pending !== null) {
        const result = applyOp(pending.value, v, pending.op);
        setDisplay(fmt(result));
        if (Number.isFinite(result)) {
          setHistory((h) => [`${fmt(pending.value)} ${pending.op} ${fmt(v)} = ${fmt(result)}`, ...h].slice(0, 10));
        }
        setPending({ value: result, op });
      } else {
        setPending({ value: v, op });
      }
      setWaitingForOperand(true);
    },
    [inputValue, pending],
  );

  const handleEquals = useCallback(() => {
    const v = inputValue();
    if (Number.isNaN(v) || pending === null) return;
    const result = applyOp(pending.value, v, pending.op);
    setDisplay(fmt(result));
    setHistory((h) => [`${fmt(pending.value)} ${pending.op} ${fmt(v)} = ${fmt(result)}`, ...h].slice(0, 10));
    setPending(null);
    setWaitingForOperand(true);
  }, [inputValue, pending]);

  const handleUnary = useCallback(
    (op: string) => {
      const v = inputValue();
      if (Number.isNaN(v)) return;
      const r = unaryOp(v, op);
      setDisplay(fmt(r));
      setHistory((h) => [`${op}(${fmt(v)}) = ${fmt(r)}`, ...h].slice(0, 10));
      setWaitingForOperand(true);
    },
    [inputValue],
  );

  const handleTrig = useCallback(
    (label: string) => {
      const v = inputValue();
      if (Number.isNaN(v)) return;
      const radians = angleMode === "deg" ? (v * Math.PI) / 180 : v;
      const fn = TRIG_FNS.find((t) => t.label === label);
      if (!fn) return;
      const r = fn.apply(radians);
      // For inverse trig, the result is in radians; convert to degrees
      // if the user is in deg mode
      const out = angleMode === "deg" && (label === "asin" || label === "acos" || label === "atan")
        ? (r * 180) / Math.PI
        : r;
      setDisplay(fmt(out));
      setHistory((h) => [`${label}(${fmt(v)}${angleMode}) = ${fmt(out)}`, ...h].slice(0, 10));
      setWaitingForOperand(true);
    },
    [inputValue, angleMode],
  );

  const handleLog = useCallback(
    (label: string) => {
      const v = inputValue();
      if (Number.isNaN(v)) return;
      const fn = LOG_FNS.find((l) => l.label === label);
      if (!fn) return;
      const r = fn.apply(v);
      setDisplay(fmt(r));
      setHistory((h) => [`${label}(${fmt(v)}) = ${fmt(r)}`, ...h].slice(0, 10));
      setWaitingForOperand(true);
    },
    [inputValue],
  );

  const handleConstant = useCallback(
    (value: number) => {
      setDisplay(fmt(value));
      setWaitingForOperand(false);
    },
    [],
  );

  const handleMemory = useCallback(
    (action: "MC" | "MR" | "M+" | "M-") => {
      const v = inputValue();
      switch (action) {
        case "MC":
          setMemory(0);
          return;
        case "MR":
          setDisplay(fmt(memory));
          setWaitingForOperand(false);
          return;
        case "M+":
          if (!Number.isNaN(v)) setMemory(memory + v);
          return;
        case "M-":
          if (!Number.isNaN(v)) setMemory(memory - v);
          return;
      }
    },
    [inputValue, memory],
  );

  const btnCls =
    "rounded-lg px-2 py-2 text-sm font-medium transition-colors active:scale-95";
  const numBtnCls = `${btnCls} bg-surface-50 text-surface-900 hover:bg-surface-100 dark:bg-dark-bg dark:text-dark-text dark:hover:bg-dark-border`;
  const opBtnCls = `${btnCls} bg-brand-500 text-white hover:bg-brand-600`;
  const fnBtnCls = `${btnCls} bg-surface-100 text-surface-700 hover:bg-surface-200 dark:bg-dark-surface dark:text-dark-text dark:hover:bg-dark-border`;
  const ctrlBtnCls = `${btnCls} bg-surface-200 text-surface-700 hover:bg-surface-300 dark:bg-dark-border dark:text-dark-text dark:hover:bg-dark-bg`;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div
          role="status"
          aria-label={`Memory: ${memory === 0 ? "empty" : fmt(memory)}`}
          className="text-xs text-surface-500 dark:text-dark-muted"
        >
          M: <span className="font-mono">{memory === 0 ? "0" : fmt(memory)}</span>
        </div>
        <div className="inline-flex rounded-md border border-surface-200 bg-white p-0.5 text-xs dark:border-dark-border dark:bg-dark-surface">
          {(["deg", "rad"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setAngleMode(m)}
              className={`rounded px-2 py-1 transition-colors ${
                angleMode === m
                  ? "bg-brand-500 text-white"
                  : "text-surface-600 dark:text-dark-muted"
              }`}
              aria-pressed={angleMode === m}
            >
              {m.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div
        data-testid="tool-output"
        className="rounded-xl border border-surface-200 bg-surface-900 p-4 text-right font-mono dark:border-dark-border"
        role="region"
        aria-label="Calculator display"
      >
        <p className="text-3xl font-semibold text-white break-all">
          {display}
        </p>
        {pending && (
          <p className="mt-1 text-xs text-surface-300" aria-live="polite">
            {fmt(pending.value)} {pending.op}
          </p>
        )}
      </div>

      <div className="grid grid-cols-5 gap-1.5" role="group" aria-label="Scientific calculator keys">
        <button type="button" onClick={() => handleMemory("MC")} className={ctrlBtnCls} aria-label="Memory clear">MC</button>
        <button type="button" onClick={() => handleMemory("MR")} className={ctrlBtnCls} aria-label="Memory recall">MR</button>
        <button type="button" onClick={() => handleMemory("M+")} className={ctrlBtnCls} aria-label="Memory add">M+</button>
        <button type="button" onClick={() => handleMemory("M-")} className={ctrlBtnCls} aria-label="Memory subtract">M-</button>
        <button type="button" onClick={handleClearAll} className={ctrlBtnCls} aria-label="Clear all">AC</button>

        <button type="button" onClick={() => handleUnary("sqrt")} className={fnBtnCls} aria-label="Square root">√</button>
        <button type="button" onClick={() => handleUnary("sq")} className={fnBtnCls} aria-label="Square">x²</button>
        <button type="button" onClick={() => handleUnary("inv")} className={fnBtnCls} aria-label="Reciprocal">1/x</button>
        <button type="button" onClick={() => handleUnary("pct")} className={fnBtnCls} aria-label="Percent">%</button>
        <button type="button" onClick={handleBackspace} className={ctrlBtnCls} aria-label="Backspace">⌫</button>

        {CONSTANTS.map((c) => (
          <button
            key={c.label}
            type="button"
            onClick={() => handleConstant(c.value)}
            className={fnBtnCls}
            aria-label={`Constant ${c.label}`}
          >
            {c.label}
          </button>
        ))}
        <button type="button" onClick={() => handleUnary("neg")} className={fnBtnCls} aria-label="Negate">±</button>
        <button type="button" onClick={handleClear} className={ctrlBtnCls} aria-label="Clear entry">C</button>
        <button type="button" onClick={() => handleOperator("÷")} className={opBtnCls} aria-label="Divide">÷</button>

        {TRIG_FNS.map((t) => (
          <button
            key={t.label}
            type="button"
            onClick={() => handleTrig(t.label)}
            className={fnBtnCls}
            aria-label={t.label === "asin" ? "arcsine" : t.label === "acos" ? "arccosine" : t.label === "atan" ? "arctangent" : t.label}
          >
            {t.label}
          </button>
        ))}

        {LOG_FNS.map((l) => (
          <button
            key={l.label}
            type="button"
            onClick={() => handleLog(l.label)}
            className={fnBtnCls}
            aria-label={l.label === "10^x" ? "10 to the x" : l.label === "e^x" ? "e to the x" : l.label}
          >
            {l.label}
          </button>
        ))}

        <button type="button" onClick={() => handleOperator("^")} className={fnBtnCls} aria-label="Power">x^y</button>
        <button type="button" onClick={() => handleOperator("×")} className={opBtnCls} aria-label="Multiply">×</button>

        <button type="button" onClick={() => handleDigit("7")} className={numBtnCls}>7</button>
        <button type="button" onClick={() => handleDigit("8")} className={numBtnCls}>8</button>
        <button type="button" onClick={() => handleDigit("9")} className={numBtnCls}>9</button>
        <button type="button" onClick={() => handleOperator("-")} className={opBtnCls} aria-label="Subtract">−</button>
        <button type="button" onClick={handleClear} className={ctrlBtnCls} aria-label="Clear entry">C</button>

        <button type="button" onClick={() => handleDigit("4")} className={numBtnCls}>4</button>
        <button type="button" onClick={() => handleDigit("5")} className={numBtnCls}>5</button>
        <button type="button" onClick={() => handleDigit("6")} className={numBtnCls}>6</button>
        <button type="button" onClick={() => handleOperator("+")} className={opBtnCls} aria-label="Add">+</button>
        <button type="button" onClick={handleEquals} className={`${opBtnCls} row-span-2`} aria-label="Equals" style={{ gridRow: "span 2" }}>=</button>

        <button type="button" onClick={() => handleDigit("1")} className={numBtnCls}>1</button>
        <button type="button" onClick={() => handleDigit("2")} className={numBtnCls}>2</button>
        <button type="button" onClick={() => handleDigit("3")} className={numBtnCls}>3</button>
        <button type="button" onClick={() => handleDigit("0")} className={`${numBtnCls} col-span-2`} style={{ gridColumn: "span 2" }}>0</button>
        <button type="button" onClick={handleDecimal} className={numBtnCls}>.</button>
      </div>

      {history.length > 0 && (
        <details className="rounded-lg border border-surface-200 bg-white dark:border-dark-border dark:bg-dark-surface">
          <summary className="cursor-pointer list-none px-3 py-2 text-xs font-medium text-surface-500 dark:text-dark-muted [&::-webkit-details-marker]:hidden">
            History ({history.length})
          </summary>
          <ul className="space-y-1 px-3 pb-3 font-mono text-xs text-surface-700 dark:text-dark-text">
            {history.map((h, i) => (
              <li key={i} className="border-b border-surface-100 pb-1 last:border-b-0 dark:border-dark-border">
                {h}
              </li>
            ))}
          </ul>
        </details>
      )}

      <p className="text-[10px] text-surface-400 dark:text-dark-muted">
        All math runs in your browser. Trig functions respect the {angleMode.toUpperCase()} mode; inverse trig returns {angleMode === "deg" ? "degrees" : "radians"}.
      </p>
    </div>
  );
}
