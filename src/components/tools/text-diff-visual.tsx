"use client";

import { useState, useMemo, useCallback } from "react";

type DiffMode = "side-by-side" | "inline";
type Granularity = "line" | "word" | "character";

interface DiffLine {
  type: "same" | "added" | "removed";
  originalNum: number | null;
  modifiedNum: number | null;
  content: string;
  chunks?: { text: string; type: "same" | "added" | "removed" }[];
}

function normalizeForCompare(s: string, ignoreWhitespace: boolean, ignoreCase: boolean): string {
  let out = s;
  if (ignoreWhitespace) out = out.trim().replace(/\s+/g, " ");
  if (ignoreCase) out = out.toLowerCase();
  return out;
}

function lcs(a: string[], b: string[]): number[][] {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
      else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp;
}

function wordChunks(original: string, modified: string, granularity: Granularity): { text: string; type: "same" | "added" | "removed" }[] {
  if (granularity === "line") return [];
  if (granularity === "character") {
    const res: { text: string; type: "same" | "added" | "removed" }[] = [];
    const max = Math.max(original.length, modified.length);
    for (let i = 0; i < max; i++) {
      if (i >= original.length) res.push({ text: modified[i]!, type: "added" });
      else if (i >= modified.length) res.push({ text: original[i]!, type: "removed" });
      else if (original[i] !== modified[i]) {
        res.push({ text: original[i]!, type: "removed" });
        res.push({ text: modified[i]!, type: "added" });
      } else res.push({ text: original[i]!, type: "same" });
    }
    return res;
  }
  // word
  const oWords = original.split(/(\s+)/);
  const mWords = modified.split(/(\s+)/);
  // simple LCS on words for better alignment? Use naive pairing for simplicity
  const res: { text: string; type: "same" | "added" | "removed" }[] = [];
  const maxW = Math.max(oWords.length, mWords.length);
  for (let i = 0; i < maxW; i++) {
    if (i >= oWords.length) {
      if (mWords[i]) res.push({ text: mWords[i]!, type: "added" });
    } else if (i >= mWords.length) {
      if (oWords[i]) res.push({ text: oWords[i]!, type: "removed" });
    } else if (oWords[i] !== mWords[i]) {
      if (oWords[i]) res.push({ text: oWords[i]!, type: "removed" });
      if (mWords[i]) res.push({ text: mWords[i]!, type: "added" });
    } else res.push({ text: oWords[i]!, type: "same" });
  }
  return res;
}

function computeDiff(
  original: string,
  modified: string,
  ignoreWhitespace: boolean,
  ignoreCase: boolean,
  granularity: Granularity
): DiffLine[] {
  const origLinesRaw = original.split("\n");
  const modLinesRaw = modified.split("\n");

  const origLinesForCompare = origLinesRaw.map((l) => normalizeForCompare(l, ignoreWhitespace, ignoreCase));
  const modLinesForCompare = modLinesRaw.map((l) => normalizeForCompare(l, ignoreWhitespace, ignoreCase));

  if (original === modified && !ignoreWhitespace && !ignoreCase) {
    return origLinesRaw.map((line, i) => ({
      type: "same" as const,
      originalNum: i + 1,
      modifiedNum: i + 1,
      content: line,
    }));
  }

  // if normalized equals, show as same too
  const normalizedEqual = origLinesForCompare.join("\n") === modLinesForCompare.join("\n");
  if (normalizedEqual && origLinesRaw.length === modLinesRaw.length) {
    return origLinesRaw.map((line, i) => ({
      type: "same" as const,
      originalNum: i + 1,
      modifiedNum: i + 1,
      content: line,
    }));
  }

  const dp = lcs(origLinesForCompare, modLinesForCompare);
  const temp: DiffLine[] = [];
  let i = origLinesRaw.length;
  let j = modLinesRaw.length;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && origLinesForCompare[i - 1] === modLinesForCompare[j - 1]) {
      temp.push({ type: "same", originalNum: i, modifiedNum: j, content: origLinesRaw[i - 1]! });
      i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      const chunks = granularity !== "line" ? wordChunks("", modLinesRaw[j - 1]!, granularity) : undefined;
      temp.push({ type: "added", originalNum: null, modifiedNum: j, content: modLinesRaw[j - 1]!, chunks });
      j--;
    } else if (i > 0) {
      const chunks = granularity !== "line" ? wordChunks(origLinesRaw[i - 1]!, "", granularity) : undefined;
      temp.push({ type: "removed", originalNum: i, modifiedNum: null, content: origLinesRaw[i - 1]!, chunks });
      i--;
    }
  }

  // enrich modified/removed with paired chunks when they are adjacent diff lines?
  // For simplicity, for single-line changes, compute chunk between pair
  // Post-process: find sequences where removed immediately followed by added at same position -> combine chunks
  temp.reverse();
  // If granularity is word/character, try to produce detailed chunks for changed lines that are close
  if (granularity !== "line") {
    for (let k = 0; k < temp.length; k++) {
      if (temp[k]!.type === "removed" && temp[k + 1]?.type === "added") {
        const left = temp[k]!.content;
        const right = temp[k + 1]!.content;
        const chunksBoth = wordChunks(left, right, granularity);
        // split into removed vs added views? Show same logic as before: decorate
        temp[k]!.chunks = chunksBoth.filter((c) => c.type !== "added");
        temp[k + 1]!.chunks = chunksBoth.filter((c) => c.type !== "removed");
        // also keep a combined view for inline? Keep as is
      }
    }
  }

  return temp;
}

export function TextDiffVisual() {
  const [original, setOriginal] = useState("Hello World\nThis is a test\nKeep this line\nRemove this\nEnd");
  const [modified, setModified] = useState("Hello World\nThis is a test\nKeep this line\nAdd this new line\nEnd");
  const [view, setView] = useState<DiffMode>("side-by-side");
  const [granularity, setGranularity] = useState<Granularity>("line");
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [ignoreCase, setIgnoreCase] = useState(false);

  const diff = useMemo(() => computeDiff(original, modified, ignoreWhitespace, ignoreCase, granularity), [original, modified, ignoreWhitespace, ignoreCase, granularity]);

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

  const renderChunks = (chunks: { text: string; type: string }[]) => (
    <span className="break-all">
      {chunks.map((c, ci) => (
        <span key={ci} className={c.type === "same" ? "" : c.type === "added" ? "bg-green-300 dark:bg-green-700/60 rounded px-0.5" : "bg-red-300 dark:bg-red-700/60 rounded px-0.5"}>
          {c.text}
        </span>
      ))}
    </span>
  );

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
            aria-label="Original text"
            className="w-full rounded-md border border-surface-200 bg-white p-3 font-mono text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text dark:placeholder:text-dark-muted"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Modified</label>
          <textarea
            value={modified}
            onChange={(e) => setModified(e.target.value)}
            rows={8}
            placeholder="Modified text..."
            aria-label="Modified text"
            className="w-full rounded-md border border-surface-200 bg-white p-3 font-mono text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text dark:placeholder:text-dark-muted"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView("side-by-side")}
            aria-label="Side by side view"
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${view === "side-by-side" ? "bg-brand-500 text-white" : "border border-surface-200 text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface"}`}
          >
            Side by Side
          </button>
          <button
            onClick={() => setView("inline")}
            aria-label="Inline view"
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${view === "inline" ? "bg-brand-500 text-white" : "border border-surface-200 text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface"}`}
          >
            Inline
          </button>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-surface-600 dark:text-dark-muted">Mode:</label>
          <select value={granularity} onChange={(e) => setGranularity(e.target.value as Granularity)} aria-label="Diff granularity" className="rounded-md border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value="line">Line</option>
            <option value="word">Word</option>
            <option value="character">Character</option>
          </select>
        </div>

        <label className="flex items-center gap-1.5 text-xs text-surface-700 dark:text-dark-text cursor-pointer">
          <input type="checkbox" checked={ignoreWhitespace} onChange={(e) => setIgnoreWhitespace(e.target.checked)} aria-label="Ignore whitespace" className="accent-brand-500" />
          Ignore whitespace
        </label>
        <label className="flex items-center gap-1.5 text-xs text-surface-700 dark:text-dark-text cursor-pointer">
          <input type="checkbox" checked={ignoreCase} onChange={(e) => setIgnoreCase(e.target.checked)} aria-label="Ignore case" className="accent-brand-500" />
          Ignore case
        </label>

        <button onClick={copyDiff} aria-label="Copy diff" className="rounded-md border border-surface-200 px-3 py-1 text-xs font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface">
          Copy Diff
        </button>
      </div>

      <div className="flex gap-2 text-xs">
        <span className="rounded-full bg-green-100 px-2 py-0.5 text-green-700 dark:bg-green-900/30 dark:text-green-400">+{stats.added} added</span>
        <span className="rounded-full bg-red-100 px-2 py-0.5 text-red-700 dark:bg-red-900/30 dark:text-red-400">-{stats.removed} removed</span>
        <span className="rounded-full bg-surface-100 px-2 py-0.5 text-surface-600 dark:bg-dark-surface dark:text-dark-muted">{stats.same} unchanged</span>
        <span className="rounded-full bg-surface-100 px-2 py-0.5 text-surface-600 dark:bg-dark-surface dark:text-dark-muted">{granularity} mode</span>
      </div>

      <div data-testid="tool-output">
        {view === "side-by-side" ? (
          <div className="rounded-md border border-surface-200 bg-surface-50 dark:border-dark-border dark:bg-dark-surface overflow-auto max-h-80">
            <div className="grid grid-cols-2 divide-x divide-surface-200 dark:divide-dark-border">
              <div>
                {diff.filter((d) => d.type !== "added").map((d, i) => (
                  <div
                    key={`orig-${i}`}
                    className={`flex border-b border-surface-200 dark:border-dark-border ${d.type === "removed" ? "bg-red-50 dark:bg-red-900/20" : "bg-white dark:bg-dark-bg"}`}
                  >
                    <span className="w-8 shrink-0 text-right pr-1 text-xs text-[var(--color-text-muted)] dark:text-[var(--color-dark-text-secondary)] font-mono border-r border-surface-200 dark:border-dark-border">{d.originalNum}</span>
                    <span className="flex-1 px-2 py-1 text-xs font-mono text-surface-900 dark:text-dark-text">
                      {d.type === "removed" && d.chunks && granularity !== "line" ? renderChunks(d.chunks) : d.type === "removed" ? <span className="text-red-600 dark:text-red-400">{d.content}</span> : d.content}
                    </span>
                  </div>
                ))}
              </div>
              <div>
                {diff.filter((d) => d.type !== "removed").map((d, i) => (
                  <div
                    key={`mod-${i}`}
                    className={`flex border-b border-surface-200 dark:border-dark-border ${d.type === "added" ? "bg-green-50 dark:bg-green-900/20" : "bg-white dark:bg-dark-bg"}`}
                  >
                    <span className="w-8 shrink-0 text-right pr-1 text-xs text-[var(--color-text-muted)] dark:text-[var(--color-dark-text-secondary)] font-mono border-r border-surface-200 dark:border-dark-border">{d.modifiedNum}</span>
                    <span className="flex-1 px-2 py-1 text-xs font-mono text-surface-900 dark:text-dark-text">
                      {d.type === "added" && d.chunks && granularity !== "line" ? renderChunks(d.chunks) : d.type === "added" ? <span className="text-green-600 dark:text-green-400">{d.content}</span> : d.content}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-md border border-surface-200 bg-surface-50 dark:border-dark-border dark:bg-dark-surface overflow-auto max-h-80">
            {diff.map((d, i) => (
              <div
                key={i}
                className={`flex border-b border-surface-200 dark:border-dark-border ${d.type === "added" ? "bg-green-50 dark:bg-green-900/20" : d.type === "removed" ? "bg-red-50 dark:bg-red-900/20" : "bg-white dark:bg-dark-bg"}`}
              >
                <span className="w-8 shrink-0 text-right pr-1 text-xs text-[var(--color-text-muted)] dark:text-[var(--color-dark-text-secondary)] font-mono border-r border-surface-200 dark:border-dark-border">{d.originalNum || d.modifiedNum}</span>
                <span className="w-5 shrink-0 text-center text-xs font-mono font-bold border-r border-surface-200 dark:border-dark-border">
                  <span className={d.type === "added" ? "text-green-600 dark:text-green-400" : d.type === "removed" ? "text-red-600 dark:text-red-400" : "text-[var(--color-text-muted)] dark:text-[var(--color-dark-text-secondary)]"}>
                    {d.type === "added" ? "+" : d.type === "removed" ? "-" : " "}
                  </span>
                </span>
                <span className="flex-1 px-2 py-1 text-xs font-mono text-surface-900 dark:text-dark-text">
                  {d.chunks && granularity !== "line" ? renderChunks(d.chunks) : d.content}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-[10px] text-surface-400 dark:text-dark-muted text-center">LCS-based diff with line/word/character granularity. All processing is done client-side. Use ignore flags to skip whitespace/case differences.</p>
    </div>
  );
}
