"use client";

import { useMemo, useState } from "react";

function similarity(a: string, b: string): number {
  if (a === b) return 100;
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter(Boolean);
  const ta = normalize(a);
  const tb = normalize(b);
  if (!ta.length && !tb.length) return a === b ? 100 : 0;
  const setA = new Set(ta);
  const setB = new Set(tb);
  const union = new Set([...setA, ...setB]);
  let inter = 0;
  for (const t of setA) if (setB.has(t)) inter++;
  return Math.round((inter / union.size) * 100);
}

function findFirstDiff(a: string, b: string): number {
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    if (a[i] !== b[i]) return i;
  }
  return a.length === b.length ? -1 : len;
}

interface DiffLine {
  type: "same" | "add" | "remove";
  text: string;
}

function lineDiff(a: string, b: string): DiffLine[] {
  const la = a.split("\n");
  const lb = b.split("\n");
  const out: DiffLine[] = [];
  const max = Math.max(la.length, lb.length);
  for (let i = 0; i < max; i++) {
    const x = la[i];
    const y = lb[i];
    if (x === undefined && y !== undefined) out.push({ type: "add", text: y });
    else if (y === undefined && x !== undefined) out.push({ type: "remove", text: x });
    else if (x === y) out.push({ type: "same", text: x });
    else out.push({ type: "remove", text: x } as DiffLine, { type: "add", text: y });
  }
  return out;
}

export function StringComparison() {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(true);
  const [trimWhitespace, setTrimWhitespace] = useState(false);
  const [view, setView] = useState<"summary" | "lines">("summary");

  const compare = useMemo(() => {
    const x = trimWhitespace ? a.trim() : a;
    const y = trimWhitespace ? b.trim() : b;
    const cx = caseSensitive ? x : x.toLowerCase();
    const cy = caseSensitive ? y : y.toLowerCase();
    const equal = cx === cy;
    const firstDiff = equal ? -1 : findFirstDiff(cx, cy);
    return { equal, firstDiff, score: similarity(cx, cy) };
  }, [a, b, caseSensitive, trimWhitespace]);

  const lines = useMemo(() => lineDiff(a, b), [a, b]);

  const inputCls =
    "w-full rounded-lg border border-surface-200 bg-white p-2.5 font-mono text-xs dark:border-dark-border dark:bg-dark-bg dark:text-dark-text";
  const labelCls = "block text-xs font-medium text-surface-700 dark:text-dark-text mb-1";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-surface-700 dark:text-dark-text">
          <input
            type="checkbox"
            checked={caseSensitive}
            onChange={(e) => setCaseSensitive(e.target.checked)}
            className="h-4 w-4 rounded border-surface-300"
          />
          Case sensitive
        </label>
        <label className="flex items-center gap-2 text-sm text-surface-700 dark:text-dark-text">
          <input
            type="checkbox"
            checked={trimWhitespace}
            onChange={(e) => setTrimWhitespace(e.target.checked)}
            className="h-4 w-4 rounded border-surface-300"
          />
          Trim whitespace
        </label>
        <div className="flex rounded-lg border border-surface-200 dark:border-dark-border overflow-hidden">
          {(["summary", "lines"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 text-xs font-medium ${
                view === v ? "bg-brand-500 text-white" : "text-surface-600 hover:bg-surface-50 dark:text-dark-muted"
              }`}
            >
              {v === "summary" ? "Summary" : "Line diff"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className={labelCls}>String A</label>
          <textarea
            value={a}
            onChange={(e) => setA(e.target.value)}
            rows={6}
            placeholder="First string or document"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>String B</label>
          <textarea
            value={b}
            onChange={(e) => setB(e.target.value)}
            rows={6}
            placeholder="Second string or document"
            className={inputCls}
          />
        </div>
      </div>

      {view === "summary" ? (
        <div className="rounded-lg border border-surface-200 bg-surface-50 p-4 dark:border-dark-border dark:bg-dark-surface">
          <p className="text-xs font-medium uppercase tracking-wider text-surface-400 dark:text-dark-muted">Result</p>
          <p
            data-testid="tool-output"
            className={`mt-1 text-xl font-bold ${
              compare.equal ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
            }`}
          >
            {compare.equal ? "Equal" : "Not equal"}
          </p>
          {!compare.equal && (
            <p className="mt-1 text-sm text-surface-600 dark:text-dark-muted">
              First difference at index <span className="font-mono font-semibold">{compare.firstDiff}</span>
            </p>
          )}
          <div className="mt-3">
            <div className="mb-1 flex justify-between text-xs text-surface-500 dark:text-dark-muted">
              <span>Similarity score</span>
              <span className="font-mono font-semibold">{compare.score}%</span>
            </div>
            <div className="h-2 rounded-full bg-surface-200 dark:bg-dark-bg overflow-hidden">
              <div
                className="h-2 rounded-full bg-brand-500 transition-all"
                style={{ width: `${compare.score}%` }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-surface-200 bg-surface-50 p-3 dark:border-dark-border dark:bg-dark-surface">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-surface-400 dark:text-dark-muted">
            Line diff
          </p>
          <pre data-testid="tool-output" className="max-h-64 overflow-auto text-xs leading-5">
            {lines.map((l, i) => (
              <div
                key={i}
                className={
                  l.type === "add"
                    ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                    : l.type === "remove"
                    ? "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                    : "text-surface-500 dark:text-dark-muted"
                }
              >
                {l.type === "add" ? "+ " : l.type === "remove" ? "- " : "  "}
                {l.text}
              </div>
            ))}
          </pre>
        </div>
      )}

      <p className="text-[10px] text-surface-400 dark:text-dark-muted">
        The similarity score is a token-overlap heuristic and is not a semantic guarantee. All comparison happens locally.
      </p>
    </div>
  );
}