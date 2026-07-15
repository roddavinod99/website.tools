"use client";

import { useState, useCallback, useEffect } from "react";

function factorial(n: number): number {
  if (n < 0) return NaN;
  if (n === 0 || n === 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

function safeEvaluate(expr: string, limitedEvaluate: (expr: string, scope?: Record<string, unknown>) => unknown): number {
  const processed = expr.replace(/(\d+)!/g, (_, numStr) => {
    return `factorial(${numStr})`;
  });

  const result = limitedEvaluate(processed, { factorial });
  return result as number;
}

interface HistoryEntry {
  expression: string;
  result: string;
  timestamp: number;
}

const EXAMPLES = [
  "2 * (3 + 4) / 7",
  "sqrt(144) + 3^2",
  "sin(pi / 2) + cos(0)",
  "abs(-42) * log(100)",
  "5!",
  "(10 + 5) % 3",
  "2^10",
  "ceil(3.2) + floor(3.8)",
];

export function MathEvaluator() {
  const [expression, setExpression] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [libLoading, setLibLoading] = useState(true);
  const [limitedEvaluate, setLimitedEvaluate] = useState<((expr: string, scope?: Record<string, unknown>) => unknown) | null>(null);

  useEffect(() => {
    import("mathjs").then((mod) => {
      const { create, all } = mod;
      const math = create(all);
      math.import({
        import: () => { throw new Error("Function import is disabled"); },
        createUnit: () => { throw new Error("Function createUnit is disabled"); },
        reviver: () => { throw new Error("Function reviver is disabled"); },
      }, { override: true });
      setLimitedEvaluate(math.evaluate.bind(math));
      setLibLoading(false);
    });
  }, []);

  const evaluate = useCallback((expr: string) => {
    if (!limitedEvaluate) return;
    try {
      const res = safeEvaluate(expr, limitedEvaluate);
      if (typeof res !== "number" || isNaN(res)) {
        setError("Invalid expression");
        setResult(null);
        return;
      }
      const formatted = Number.isInteger(res) ? String(res) : parseFloat(res.toFixed(10)).toString();
      setResult(formatted);
      setError(null);
      setHistory((prev) => [
        { expression: expr, result: formatted, timestamp: Date.now() },
        ...prev.slice(0, 19),
      ]);
    } catch {
      setError("Invalid expression");
      setResult(null);
    }
  }, [limitedEvaluate]);

  const handleSubmit = () => {
    if (expression.trim()) evaluate(expression.trim());
  };

  return (
    <div className="space-y-4">
      {libLoading && (
        <div className="rounded-lg border border-surface-200 bg-surface-50 p-4 dark:border-dark-border dark:bg-dark-surface text-center">
          <p className="text-sm text-surface-500 dark:text-dark-muted">Loading math library...</p>
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Math Expression</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={expression}
            onChange={(e) => setExpression(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="e.g. 2 * (3 + 4) / 7"
            className="flex-1 rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text dark:placeholder:text-dark-muted"
          />
          <button onClick={handleSubmit} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors">
            Evaluate
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm font-medium text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {result !== null && (
        <div className="rounded-lg border border-surface-200 bg-surface-50 p-4 dark:border-dark-border dark:bg-dark-surface">
          <p className="text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">Result</p>
          <p className="text-2xl font-mono font-bold text-brand-600 dark:text-brand-400">{result}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Supported Functions</label>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {[
            ["+", "Addition"], ["-", "Subtraction"], ["*", "Multiplication"], ["/", "Division"],
            ["^", "Power"], ["%", "Modulo"], ["sqrt(x)", "Square root"], ["abs(x)", "Absolute value"],
            ["sin(x)", "Sine"], ["cos(x)", "Cosine"], ["tan(x)", "Tangent"], ["log(x)", "Log base 10"],
            ["ln(x)", "Natural log"], ["pi", "Pi constant"], ["e", "Euler's number"], ["n!", "Factorial"],
          ].map(([fn, desc]) => (
            <div key={fn} className="flex gap-2 rounded bg-white dark:bg-dark-bg px-2 py-1">
              <code className="font-mono text-brand-600 dark:text-brand-400 min-w-[4rem]">{fn}</code>
              <span className="text-surface-600 dark:text-dark-muted">{desc}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Try These</label>
        <div className="flex flex-wrap gap-1">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => { setExpression(ex); evaluate(ex); }}
              className="rounded-full bg-surface-100 px-2 py-0.5 text-xs text-surface-600 hover:bg-surface-200 dark:bg-dark-surface dark:text-dark-muted dark:hover:bg-dark-bg transition-colors"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      {history.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">History</label>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {history.map((h) => (
              <button
                key={h.timestamp}
                onClick={() => { setExpression(h.expression); }}
                className="flex w-full items-center justify-between rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm font-mono hover:bg-surface-50 dark:border-dark-border dark:bg-dark-bg dark:hover:bg-dark-surface transition-colors"
              >
                <span className="text-surface-900 dark:text-dark-text truncate">{h.expression}</span>
                <span className="text-brand-600 dark:text-brand-400 font-semibold shrink-0 ml-2">= {h.result}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <p className="text-[10px] text-surface-400 dark:text-dark-muted text-center">
        All calculations are done client-side. Your data never leaves your browser.
      </p>
    </div>
  );
}
