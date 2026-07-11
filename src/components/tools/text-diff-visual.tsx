"use client";

import { useState, useMemo, useCallback } from "react";

type DiffMode = "side-by-side" | "inline";

interface DiffLine {
  type: "same" | "added" | "removed";
  originalNum: number | null;
  modifiedNum: number | null;
  content: string;
}

function lcs(a: string[], b: string[]): number[][] {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  return dp;
}

function computeDiff(original: string, modified: string): DiffLine[] {
  const origLines = original.split("\n");
  const modLines = modified.split("\n");

  if (original === modified) {
    return origLines.map((line, i) => ({
      type: "same" as const,
      originalNum: i + 1,
      modifiedNum: i + 1,
      content: line,
    }));
  }

  const dp = lcs(origLines, modLines);
  const result: DiffLine[] = [];
  let i = origLines.length;
  let j = modLines.length;

  const temp: DiffLine[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && origLines[i - 1] === modLines[j - 1]) {
      temp.push({
        type: "same",
        originalNum: i,
        modifiedNum: j,
        content: origLines[i - 1],
      });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      temp.push({
        type: "added",
        originalNum: null,
        modifiedNum: j,
        content: modLines[j - 1],
      });
      j--;
    } else if (i > 0) {
      temp.push({
        type: "removed",
        originalNum: i,
        modifiedNum: null,
        content: origLines[i - 1],
      });
      i--;
    }
  }

  temp.reverse().forEach((line) => result.push(line));
  return result;
}

export function TextDiffVisual() {
  const [original, setOriginal] = useState("Hello World\nThis is a test\nKeep this line\nRemove this\nEnd");
  const [modified, setModified] = useState("Hello World\nThis is a test\nKeep this line\nAdd this new line\nEnd");
  const [mode, setMode] = useState<DiffMode>("side-by-side");

  const diff = useMemo(() => computeDiff(original, modified), [original, modified]);

  const stats = useMemo(() => {
    const added = diff.filter((d) => d.type === "added").length;
    const removed = diff.filter((d) => d.type === "removed").length;
    const same = diff.filter((d) => d.type === "same").length;
    return { added, removed, same };
  }, [diff]);

  const copyDiff = useCallback(async () => {
    const text = diff.map((d) => {
      const prefix = d.type === "added" ? "+" : d.type === "removed" ? "-" : " ";
      return prefix + d.content;
    }).join("\n");
    await navigator.clipboard.writeText(text);
  }, [diff]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Original</label>
          <textarea
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
            rows={8}
            placeholder="Original text..."
            className="w-full rounded-lg border border-surface-200 bg-white p-3 font-mono text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text dark:placeholder:text-dark-muted"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Modified</label>
          <textarea
            value={modified}
            onChange={(e) => setModified(e.target.value)}
            rows={8}
            placeholder="Modified text..."
            className="w-full rounded-lg border border-surface-200 bg-white p-3 font-mono text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text dark:placeholder:text-dark-muted"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setMode("side-by-side")}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
            mode === "side-by-side" ? "bg-brand-500 text-white" : "rounded-full bg-surface-100 px-2 py-0.5 text-xs text-surface-600 dark:bg-dark-surface dark:text-dark-muted"
          }`}
        >
          Side by Side
        </button>
        <button
          onClick={() => setMode("inline")}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
            mode === "inline" ? "bg-brand-500 text-white" : "rounded-full bg-surface-100 px-2 py-0.5 text-xs text-surface-600 dark:bg-dark-surface dark:text-dark-muted"
          }`}
        >
          Inline
        </button>
        <button
          onClick={copyDiff}
          className="rounded-lg border border-surface-200 px-3 py-1 text-xs font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface"
        >
          Copy Diff
        </button>
      </div>

      <div className="flex gap-2 text-xs">
        <span className="rounded-full bg-green-100 px-2 py-0.5 text-green-700 dark:bg-green-900/30 dark:text-green-400">+{stats.added} added</span>
        <span className="rounded-full bg-red-100 px-2 py-0.5 text-red-700 dark:bg-red-900/30 dark:text-red-400">-{stats.removed} removed</span>
        <span className="rounded-full bg-surface-100 px-2 py-0.5 text-surface-600 dark:bg-dark-surface dark:text-dark-muted">{stats.same} unchanged</span>
      </div>

      {mode === "side-by-side" ? (
        <div className="rounded-lg border border-surface-200 bg-surface-50 dark:border-dark-border dark:bg-dark-surface overflow-auto max-h-80">
          <div className="grid grid-cols-2 divide-x divide-surface-200 dark:divide-dark-border">
            <div>
              {diff.filter((d) => d.type !== "added").map((d, i) => (
                <div
                  key={`orig-${i}`}
                  className={`flex border-b border-surface-200 dark:border-dark-border ${
                    d.type === "removed"
                      ? "bg-red-50 dark:bg-red-900/20"
                      : "bg-white dark:bg-dark-bg"
                  }`}
                >
                  <span className="w-8 shrink-0 text-right pr-1 text-xs text-surface-400 dark:text-dark-muted font-mono border-r border-surface-200 dark:border-dark-border">
                    {d.originalNum}
                  </span>
                  <span className="flex-1 px-2 py-1 text-xs font-mono text-surface-900 dark:text-dark-text">
                    {d.type === "removed" ? <span className="text-red-600 dark:text-red-400">{d.content}</span> : d.content}
                  </span>
                </div>
              ))}
            </div>
            <div>
              {diff.filter((d) => d.type !== "removed").map((d, i) => (
                <div
                  key={`mod-${i}`}
                  className={`flex border-b border-surface-200 dark:border-dark-border ${
                    d.type === "added"
                      ? "bg-green-50 dark:bg-green-900/20"
                      : "bg-white dark:bg-dark-bg"
                  }`}
                >
                  <span className="w-8 shrink-0 text-right pr-1 text-xs text-surface-400 dark:text-dark-muted font-mono border-r border-surface-200 dark:border-dark-border">
                    {d.modifiedNum}
                  </span>
                  <span className="flex-1 px-2 py-1 text-xs font-mono text-surface-900 dark:text-dark-text">
                    {d.type === "added" ? <span className="text-green-600 dark:text-green-400">{d.content}</span> : d.content}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-surface-200 bg-surface-50 dark:border-dark-border dark:bg-dark-surface overflow-auto max-h-80">
          {diff.map((d, i) => (
            <div
              key={i}
              className={`flex border-b border-surface-200 dark:border-dark-border ${
                d.type === "added"
                  ? "bg-green-50 dark:bg-green-900/20"
                  : d.type === "removed"
                  ? "bg-red-50 dark:bg-red-900/20"
                  : "bg-white dark:bg-dark-bg"
              }`}
            >
              <span className="w-8 shrink-0 text-right pr-1 text-xs text-surface-400 dark:text-dark-muted font-mono border-r border-surface-200 dark:border-dark-border">
                {d.originalNum || d.modifiedNum}
              </span>
              <span className="w-5 shrink-0 text-center text-xs font-mono font-bold border-r border-surface-200 dark:border-dark-border">
                <span className={
                  d.type === "added" ? "text-green-600 dark:text-green-400" :
                  d.type === "removed" ? "text-red-600 dark:text-red-400" :
                  "text-surface-400 dark:text-dark-muted"
                }>
                  {d.type === "added" ? "+" : d.type === "removed" ? "-" : " "}
                </span>
              </span>
              <span className="flex-1 px-2 py-1 text-xs font-mono text-surface-900 dark:text-dark-text">
                {d.content}
              </span>
            </div>
          ))}
        </div>
      )}

      <p className="text-[10px] text-surface-400 dark:text-dark-muted text-center">
        Word-level diff using LCS algorithm. All processing is done client-side.
      </p>
    </div>
  );
}
