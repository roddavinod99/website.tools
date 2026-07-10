"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";

interface DiffEntry {
  path: string;
  type: "added" | "removed" | "changed" | "unchanged";
  leftValue?: string;
  rightValue?: string;
}

function deepDiff(
  left: unknown,
  right: unknown,
  path = "$",
  ignoreOrder = false
): DiffEntry[] {
  const result: DiffEntry[] = [];

  if (left === right) {
    result.push({ path, type: "unchanged", leftValue: JSON.stringify(left), rightValue: JSON.stringify(right) });
    return result;
  }

  const bothObjects =
    left !== null && typeof left === "object" && right !== null && typeof right === "object";

  if (bothObjects && !Array.isArray(left) && !Array.isArray(right)) {
    const leftKeys = Object.keys(left as Record<string, unknown>);
    const rightKeys = Object.keys(right as Record<string, unknown>);
    const allKeys = ignoreOrder
      ? [...new Set([...leftKeys, ...rightKeys])]
      : [...new Set([...leftKeys, ...rightKeys])];

    for (const key of allKeys) {
      const childPath = path + "." + key;
      const hasLeft = key in (left as Record<string, unknown>);
      const hasRight = key in (right as Record<string, unknown>);

      if (hasLeft && !hasRight) {
        result.push({ path: childPath, type: "removed", leftValue: JSON.stringify((left as Record<string, unknown>)[key], null, 2) });
      } else if (!hasLeft && hasRight) {
        result.push({ path: childPath, type: "added", rightValue: JSON.stringify((right as Record<string, unknown>)[key], null, 2) });
      } else {
        const lv = (left as Record<string, unknown>)[key];
        const rv = (right as Record<string, unknown>)[key];
        if (typeof lv === "object" && typeof rv === "object" && lv !== null && rv !== null) {
          result.push(...deepDiff(lv, rv, childPath, ignoreOrder));
        } else if (lv !== rv) {
          result.push({ path: childPath, type: "changed", leftValue: JSON.stringify(lv, null, 2), rightValue: JSON.stringify(rv, null, 2) });
        } else {
          result.push({ path: childPath, type: "unchanged", leftValue: JSON.stringify(lv), rightValue: JSON.stringify(rv) });
        }
      }
    }
  } else if (bothObjects && Array.isArray(left) && Array.isArray(right)) {
    if (ignoreOrder) {
      const leftSet = new Set(left.map((v) => JSON.stringify(v)));
      const rightSet = new Set(right.map((v) => JSON.stringify(v)));
      for (const item of left) {
        const key = JSON.stringify(item);
        if (!rightSet.has(key)) result.push({ path, type: "removed", leftValue: key });
      }
      for (const item of right) {
        const key = JSON.stringify(item);
        if (!leftSet.has(key)) result.push({ path, type: "added", rightValue: key });
      }
    } else {
      const maxLen = Math.max(left.length, right.length);
      for (let i = 0; i < maxLen; i++) {
        const childPath = path + "[" + i + "]";
        if (i >= left.length) {
          result.push({ path: childPath, type: "added", rightValue: JSON.stringify(right[i], null, 2) });
        } else if (i >= right.length) {
          result.push({ path: childPath, type: "removed", leftValue: JSON.stringify(left[i], null, 2) });
        } else {
          result.push(...deepDiff(left[i], right[i], childPath, ignoreOrder));
        }
      }
    }
  } else {
    result.push({ path, type: "changed", leftValue: JSON.stringify(left, null, 2), rightValue: JSON.stringify(right, null, 2) });
  }

  return result;
}

function computeStats(entries: DiffEntry[]): { added: number; removed: number; changed: number; unchanged: number; total: number } {
  const added = entries.filter((e) => e.type === "added").length;
  const removed = entries.filter((e) => e.type === "removed").length;
  const changed = entries.filter((e) => e.type === "changed").length;
  const unchanged = entries.filter((e) => e.type === "unchanged").length;
  return { added, removed, changed, unchanged, total: entries.length };
}

export function JSONDiff() {
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");
  const [viewMode, setViewMode] = useState<"side" | "unified" | "tree">("side");
  const [ignoreOrder, setIgnoreOrder] = useState(false);
  const [mergeMode, setMergeMode] = useState(false);
  const [mergedData, setMergedData] = useState<string>("");
  const [, setMergeChoices] = useState<Record<string, "left" | "right">>({}); // choices tracked via setMergeChoices
  const dropRef = useRef<HTMLDivElement>(null);

  const diff = useMemo(() => {
    try {
      const l = JSON.parse(left);
      const r = JSON.parse(right);
      return deepDiff(l, r, "$", ignoreOrder);
    } catch {
      return [];
    }
  }, [left, right, ignoreOrder]);

  const stats = useMemo(() => computeStats(diff), [diff]);
  const pctDiff = stats.total > 0 ? ((stats.added + stats.removed + stats.changed) / stats.total * 100) : 0;

  const unifiedText = useMemo(() => {
    const lines: string[] = [];
    for (const entry of diff) {
      if (entry.type === "unchanged") continue;
      if (entry.type === "added") { lines.push(`+ ${entry.path}: ${entry.rightValue}`); }
      else if (entry.type === "removed") { lines.push(`- ${entry.path}: ${entry.leftValue}`); }
      else { lines.push(`~ ${entry.path}`); lines.push(`- ${entry.leftValue}`); lines.push(`+ ${entry.rightValue}`); }
    }
    return lines.join("\n");
  }, [diff]);

  const jsonPatch = useMemo(() => {
    const patch: Record<string, unknown>[] = [];
    for (const entry of diff) {
      if (entry.type === "added") patch.push({ op: "add", path: entry.path, value: JSON.parse(entry.rightValue || "null") });
      else if (entry.type === "removed") patch.push({ op: "remove", path: entry.path });
      else if (entry.type === "changed") patch.push({ op: "replace", path: entry.path, value: JSON.parse(entry.rightValue || "null") });
    }
    return JSON.stringify(patch, null, 2);
  }, [diff]);

  const copyPatch = useCallback(async () => { await navigator.clipboard.writeText(jsonPatch); }, [jsonPatch]);
  const copyUnified = useCallback(async () => { await navigator.clipboard.writeText(unifiedText); }, [unifiedText]);
  const copyMerged = useCallback(async () => { if (mergedData) await navigator.clipboard.writeText(mergedData); }, [mergedData]);

  const handleAcceptLeft = useCallback(() => {
    try {
      const data = JSON.parse(left);
      setMergedData(JSON.stringify(data, null, 2));
      setMergeChoices({});
    } catch {}
  }, [left]);

  const handleAcceptRight = useCallback(() => {
    try {
      const data = JSON.parse(right);
      setMergedData(JSON.stringify(data, null, 2));
      setMergeChoices({});
    } catch {}
  }, [right]);

  const handleDrop = useCallback((side: "left" | "right", e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      if (side === "left") setLeft(text);
      else setRight(text);
    };
    reader.readAsText(file);
  }, []);

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const rightLines = useMemo(() => {
    try { return JSON.stringify(JSON.parse(right), null, 2).split("\n"); } catch { return []; }
  }, [right]);

  const leftLines = useMemo(() => {
    try { return JSON.stringify(JSON.parse(left), null, 2).split("\n"); } catch { return []; }
  }, [left]);

  const lineDiff = useMemo(() => {
    const maxLen = Math.max(leftLines.length, rightLines.length);
    const result: { type: "same" | "diff" | "added" | "removed"; left: string; right: string }[] = [];
    for (let i = 0; i < maxLen; i++) {
      const l = leftLines[i] ?? "";
      const r = rightLines[i] ?? "";
      if (l === r) result.push({ type: "same", left: l, right: r });
      else if (!l) result.push({ type: "added", left: l, right: r });
      else if (!r) result.push({ type: "removed", left: l, right: r });
      else result.push({ type: "diff", left: l, right: r });
    }
    return result;
  }, [leftLines, rightLines]);

  const treeDiffEntries = useMemo(() => {
    return diff.filter((e) => e.type !== "unchanged");
  }, [diff]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div
          ref={dropRef}
          onDrop={(e) => handleDrop("left", e)}
          onDragOver={handleDragOver}
        >
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Left (Original)</label>
          <textarea value={left} onChange={(e) => setLeft(e.target.value)} rows={8} spellCheck={false}
            placeholder='{"key": "value"}'
            className="w-full rounded-lg border border-surface-200 bg-white p-3 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted"
          />
          <p className="text-[10px] text-surface-400 dark:text-dark-muted mt-0.5">Drop a .json file here</p>
        </div>
        <div onDrop={(e) => handleDrop("right", e)} onDragOver={handleDragOver}>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Right (Modified)</label>
          <textarea value={right} onChange={(e) => setRight(e.target.value)} rows={8} spellCheck={false}
            placeholder='{"key": "value"}'
            className="w-full rounded-lg border border-surface-200 bg-white p-3 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted"
          />
          <p className="text-[10px] text-surface-400 dark:text-dark-muted mt-0.5">Drop a .json file here</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => setViewMode("side")} className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${viewMode === "side" ? "bg-brand-500 text-white" : "border-surface-200 text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface"}`}>Side-by-Side</button>
        <button onClick={() => setViewMode("unified")} className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${viewMode === "unified" ? "bg-brand-500 text-white" : "border-surface-200 text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface"}`}>Unified</button>
        <button onClick={() => setViewMode("tree")} className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${viewMode === "tree" ? "bg-brand-500 text-white" : "border-surface-200 text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface"}`}>Tree</button>
        <label className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-dark-muted cursor-pointer ml-2">
          <input type="checkbox" checked={ignoreOrder} onChange={(e) => setIgnoreOrder(e.target.checked)} className="rounded border-surface-300" /> Ignore key order
        </label>
        <button onClick={() => setMergeMode(!mergeMode)} className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${mergeMode ? "bg-brand-500 text-white" : "border-surface-200 text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface"}`}>Merge Mode</button>
      </div>

      {stats.total > 0 && (
        <div className="grid grid-cols-5 gap-2">
          {[
            { label: "Total Keys", value: stats.total, color: "text-surface-700 dark:text-dark-text" },
            { label: "Added", value: stats.added, color: "text-green-600 dark:text-green-400" },
            { label: "Removed", value: stats.removed, color: "text-red-600 dark:text-red-400" },
            { label: "Changed", value: stats.changed, color: "text-orange-500 dark:text-orange-400" },
            { label: "Different", value: pctDiff.toFixed(1) + "%", color: "text-brand-500" },
          ].map((s) => (
            <div key={s.label} className="rounded-lg border border-surface-200 bg-white p-2 text-center dark:border-dark-border dark:bg-dark-surface">
              <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-surface-500 dark:text-dark-muted">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {stats.total > 0 && (
        <div className="flex items-center gap-2">
          <button onClick={copyPatch} className="rounded border border-surface-200 px-3 py-1 text-xs text-surface-600 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface">Copy JSON Patch</button>
          <button onClick={copyUnified} className="rounded border border-surface-200 px-3 py-1 text-xs text-surface-600 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface">Copy Unified Text</button>
          {mergeMode && mergedData && (
            <button onClick={copyMerged} className="rounded border border-surface-200 px-3 py-1 text-xs text-surface-600 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface">Copy Merged</button>
          )}
        </div>
      )}

      {mergeMode && (
        <div className="flex items-center gap-2 p-2 rounded-lg border border-brand-200 bg-brand-50 dark:border-brand-800 dark:bg-brand-900/20">
          <span className="text-xs font-medium text-brand-700 dark:text-brand-400">Merge:</span>
          <button onClick={handleAcceptLeft} className="rounded border border-brand-300 px-3 py-1 text-xs text-brand-700 hover:bg-brand-100 dark:border-brand-700 dark:text-brand-400 dark:hover:bg-brand-900/40">Accept Left</button>
          <button onClick={handleAcceptRight} className="rounded border border-brand-300 px-3 py-1 text-xs text-brand-700 hover:bg-brand-100 dark:border-brand-700 dark:text-brand-400 dark:hover:bg-brand-900/40">Accept Right</button>
          {mergedData && (
            <pre className="flex-1 text-xs font-mono text-surface-700 dark:text-dark-text truncate">{mergedData.slice(0, 100)}...</pre>
          )}
        </div>
      )}

      {viewMode === "side" && left && right && (
        <div className="grid grid-cols-2 gap-4">
          {["Left", "Right"].map((side, si) => (
            <div key={side}>
              <p className="text-xs text-surface-400 dark:text-dark-muted mb-1">{side}</p>
              <div className="rounded-lg border border-surface-200 bg-surface-50 p-2 dark:border-dark-border dark:bg-dark-surface max-h-80 overflow-auto font-mono text-xs leading-5">
                {lineDiff.map((pair, i) => (
                  <div
                    key={i}
                    className={`${
                      pair.type === "diff" ? "bg-orange-100 dark:bg-orange-900/30" :
                      pair.type === "added" && si === 1 ? "bg-green-100 dark:bg-green-900/30" :
                      pair.type === "removed" && si === 0 ? "bg-red-100 dark:bg-red-900/30" : ""
                    }`}
                  >
                    <span className="select-none text-surface-300 dark:text-dark-muted w-6 inline-block text-right mr-2">{i + 1}</span>
                    {si === 0 ? pair.left || " " : pair.right || " "}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {viewMode === "unified" && unifiedText && (
        <div>
          <p className="text-xs text-surface-400 dark:text-dark-muted mb-1">Unified Diff</p>
          <pre className="w-full rounded-lg border border-surface-200 bg-surface-50 p-3 text-xs font-mono text-surface-900 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text overflow-auto max-h-80 whitespace-pre-wrap">
            {unifiedText.split("\n").map((line, i) => {
              let cls = "text-surface-900 dark:text-dark-text";
              if (line.startsWith("+ ")) cls = "text-green-700 dark:text-green-400";
              else if (line.startsWith("- ")) cls = "text-red-700 dark:text-red-400";
              else if (line.startsWith("~ ")) cls = "text-orange-600 dark:text-orange-400";
              return <div key={i} className={cls}>{line}</div>;
            })}
          </pre>
        </div>
      )}

      {viewMode === "tree" && treeDiffEntries.length > 0 && (
        <div>
          <p className="text-xs text-surface-400 dark:text-dark-muted mb-1">Tree Diff (changes only)</p>
          <div className="rounded-lg border border-surface-200 bg-white p-2 dark:border-dark-border dark:bg-dark-surface max-h-80 overflow-auto font-mono text-xs">
            {treeDiffEntries.map((entry, i) => (
              <div key={i} className="mb-1 pb-1 border-b border-surface-100 dark:border-dark-border last:border-0">
                <div className="flex items-center gap-1">
                  <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${
                    entry.type === "added" ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400" :
                    entry.type === "removed" ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400" :
                    "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400"
                  }`}>
                    {entry.type === "added" ? "+" : entry.type === "removed" ? "-" : "~"}
                  </span>
                  <span className="text-surface-700 dark:text-dark-text font-medium">{entry.path}</span>
                </div>
                {entry.leftValue !== undefined && entry.type !== "added" && (
                  <div className="text-red-600 dark:text-red-400 pl-6 mt-0.5 line-through opacity-70">{entry.leftValue.length > 60 ? entry.leftValue.slice(0, 60) + "..." : entry.leftValue}</div>
                )}
                {entry.rightValue !== undefined && entry.type !== "removed" && (
                  <div className="text-green-600 dark:text-green-400 pl-6 mt-0.5">{entry.rightValue.length > 60 ? entry.rightValue.slice(0, 60) + "..." : entry.rightValue}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
