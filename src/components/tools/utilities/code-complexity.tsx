"use client";

import { useMemo, useState } from "react";

interface FunctionMetrics {
  name: string;
  cyclomatic: number;
  lines: number;
}

interface Analysis {
  totalLines: number;
  codeLines: number;
  commentLines: number;
  blankLines: number;
  functions: FunctionMetrics[];
  totalCyclomatic: number;
  section: string;
}

function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
}

function lineStats(src: string): { codeLines: number; commentLines: number; blankLines: number } {
  const lines = src.split("\n");
  let code = 0;
  let comment = 0;
  let blank = 0;
  let inBlock = false;
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      blank++;
      continue;
    }
    if (inBlock) {
      comment++;
      if (line.includes("*/")) inBlock = false;
      continue;
    }
    if (line.startsWith("//")) {
      comment++;
      continue;
    }
    if (line.startsWith("/*")) {
      comment++;
      if (!line.endsWith("*/")) inBlock = true;
      continue;
    }
    code++;
  }
  return { codeLines: code, commentLines: comment, blankLines: blank };
}

function cyclomaticOf(code: string): number {
  let complexity = 1;
  const decisionWords = [/\b(if\b)/g, /\b(for\b)/g, /\b(while\b)/g, /\b(case\b)/g, /\b(catch\b)/g, /\b(else\s+if\b)/g];
  for (const re of decisionWords) {
    while (re.exec(code) !== null) complexity++;
  }
  const logical = /\b(&&|\|\||\bisNaN\s*\(|\?!)\b/g;
  while (logical.exec(code) !== null) complexity++;
  return complexity;
}

function extractFunctions(code: string): FunctionMetrics[] {
  const cleaned = stripComments(code);
  const out: FunctionMetrics[] = [];
  const re = /(?:(?:function\s+(\w+))|(?:(\w+)\s*=\s*[A-Za-z_$][\w$]*\([^)]*\))|(?:const\s+(\w+)\s*=\s*\([^)]*\)\s*=>))[\s\S]*?^\}/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(cleaned)) !== null) {
    const name = m[1] || m[2] || m[3] || "anonymous";
    const body = m[0];
    const lines = body.split("\n").length;
    out.push({ name, cyclomatic: cyclomaticOf(body), lines });
  }
  return out;
}

function maintainability(avg: number, codeLines: number): string {
  const score = Math.max(0, Math.min(100, 100 - (avg - 1) * 8 - codeLines / 25));
  if (score >= 75) return `Good (${Math.round(score)}/100)`;
  if (score >= 50) return `Moderate (${Math.round(score)}/100)`;
  return `Needs attention (${Math.round(score)}/100)`;
}

export function CodeComplexity() {
  const [code, setCode] = useState("// Paste your JavaScript or TypeScript here\nfunction greet(name) {\n  if (!name) return 'Hello, world';\n  for (let i = 0; i < 3; i++) {\n    console.log(name);\n  }\n  while (name.length > 10) {\n    name = name.slice(0, -1);\n  }\n  return 'Hello ' + name;\n}\n");

  const analysis = useMemo<Analysis>(() => {
    const stats = lineStats(code);
    const clean = stripComments(code);
    const functions = extractFunctions(clean);
    const totalCyclomatic = functions.reduce((s, f) => s + f.cyclomatic, 1);
    return {
      ...stats,
      totalLines: stats.codeLines + stats.commentLines + stats.blankLines,
      functions,
      totalCyclomatic,
      section: functions.length ? `${functions.length} functions` : "single snippet",
    };
  }, [code]);

  const avg = analysis.functions.length ? analysis.totalCyclomatic / analysis.functions.length : 1;
  const worst = [...analysis.functions].sort((a, b) => b.cyclomatic - a.cyclomatic).slice(0, 3);

  const inputCls =
    "w-full rounded-lg border border-surface-200 bg-white p-2.5 font-mono text-xs dark:border-dark-border dark:bg-dark-bg dark:text-dark-text";
  const labelCls = "block text-xs font-medium text-surface-700 dark:text-dark-text mb-1";

  return (
    <div className="space-y-4">
      <div>
        <label className={labelCls}>JavaScript / TypeScript code</label>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          rows={12}
          spellCheck={false}
          placeholder="Paste your code here"
          className={inputCls}
        />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="Total lines" value={analysis.totalLines} />
        <Stat label="Code" value={analysis.codeLines} />
        <Stat label="Comments" value={analysis.commentLines} />
        <Stat label="Blank" value={analysis.blankLines} />
      </div>

      {!code.trim() ? (
        <p className="text-sm text-surface-500 dark:text-dark-muted">Paste code above to analyze complexity.</p>
      ) : (
        <>
          <div className="rounded-lg border border-surface-200 bg-surface-50 p-4 dark:border-dark-border dark:bg-dark-surface">
            <p className="text-xs font-medium uppercase tracking-wider text-surface-400 dark:text-dark-muted">
              Overall
            </p>
            <p data-testid="tool-output" className="mt-1 text-xl font-bold text-surface-900 dark:text-dark-text">
              Cyclomatic complexity ~{analysis.totalCyclomatic}
            </p>
            <p className="mt-1 text-xs text-surface-500 dark:text-dark-muted">
              {analysis.functions.length} function{analysis.functions.length !== 1 ? "s" : ""} · avg {avg.toFixed(1)} per
              function · {maintainability(avg, analysis.codeLines)}
            </p>

            {worst.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">
                  Highest complexity functions
                </p>
                <ul className="space-y-1">
                  {worst.map((f) => (
                    <li
                      key={f.name}
                      className="flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs bg-white dark:bg-dark-bg border border-surface-200 dark:border-dark-border"
                    >
                      <span className="font-mono font-medium text-surface-800 dark:text-dark-text">{f.name}</span>
                      <span className="font-mono text-surface-500 dark:text-dark-muted">
                        {f.cyclomatic} paths · {f.lines} lines
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </>
      )}

      <p className="text-[10px] text-surface-400 dark:text-dark-muted">
        Complexity counts decision points (if, for, while, catch, conditionals). It is a guide, not a judgement. All
        analysis happens locally in your browser.
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-surface-200 bg-white p-3 dark:border-dark-border dark:bg-dark-surface">
      <p className="text-xs text-surface-500 dark:text-dark-muted">{label}</p>
      <p className="mt-0.5 text-lg font-bold font-mono text-surface-900 dark:text-dark-text">{value}</p>
    </div>
  );
}