"use client";

import { useState, useMemo, useRef, useEffect } from "react";

type DiffView = "side-by-side" | "unified";
type DiffLevel = "line" | "word" | "character";

interface DiffLine {
  type: "same" | "added" | "removed" | "modified";
  leftNum: number | null;
  rightNum: number | null;
  leftText: string;
  rightText: string;
  chunks?: { text: string; type: "same" | "added" | "removed" }[];
}

interface DiffStats {
  added: number;
  removed: number;
  modified: number;
  unchanged: number;
}

function computeDiff(
  left: string,
  right: string,
  ignoreWhitespace: boolean,
  ignoreCase: boolean,
  level: DiffLevel
): { lines: DiffLine[]; stats: DiffStats } {
  let lText = left;
  let rText = right;
  if (ignoreCase) { lText = lText.toLowerCase(); rText = rText.toLowerCase(); }

  const lLines = lText.split("\n");
  const rLines = rText.split("\n");
  const maxLen = Math.max(lLines.length, rLines.length);
  const lines: DiffLine[] = [];
  const stats: DiffStats = { added: 0, removed: 0, modified: 0, unchanged: 0 };

  for (let i = 0; i < maxLen; i++) {
    const l = lLines[i] ?? "";
    const r = rLines[i] ?? "";
    const lClean = ignoreWhitespace ? l.trim() : l;
    const rClean = ignoreWhitespace ? r.trim() : r;

    if (lClean === rClean && l !== "") {
      lines.push({ type: "same", leftNum: i + 1, rightNum: i + 1, leftText: lLines[i] ?? "", rightText: rLines[i] ?? "" });
      stats.unchanged++;
    } else if (l === "" && r !== "") {
      lines.push({ type: "added", leftNum: null, rightNum: i + 1, leftText: "", rightText: rLines[i] ?? "" });
      stats.added++;
    } else if (l !== "" && r === "") {
      lines.push({ type: "removed", leftNum: i + 1, rightNum: null, leftText: lLines[i] ?? "", rightText: "" });
      stats.removed++;
    } else {
      const chunks = level !== "line" ? computeWordDiff(lLines[i] ?? "", rLines[i] ?? "", level) : undefined;
      lines.push({ type: "modified", leftNum: i + 1, rightNum: i + 1, leftText: lLines[i] ?? "", rightText: rLines[i] ?? "", chunks });
      stats.modified++;
    }
  }
  return { lines, stats };
}

function computeWordDiff(left: string, right: string, level: DiffLevel): { text: string; type: "same" | "added" | "removed" }[] {
  if (level === "character") {
    return computeCharDiff(left, right);
  }
  const lWords = left.split(/(\s+)/);
  const rWords = right.split(/(\s+)/);
  const result: { text: string; type: "same" | "added" | "removed" }[] = [];
  const maxW = Math.max(lWords.length, rWords.length);
  for (let i = 0; i < maxW; i++) {
    if (i >= lWords.length) {
      if (rWords[i]) result.push({ text: rWords[i], type: "added" });
    } else if (i >= rWords.length) {
      if (lWords[i]) result.push({ text: lWords[i], type: "removed" });
    } else if (lWords[i] !== rWords[i]) {
      if (lWords[i]) result.push({ text: lWords[i], type: "removed" });
      if (rWords[i]) result.push({ text: rWords[i], type: "added" });
    } else {
      result.push({ text: lWords[i], type: "same" });
    }
  }
  return result;
}

function computeCharDiff(left: string, right: string): { text: string; type: "same" | "added" | "removed" }[] {
  const result: { text: string; type: "same" | "added" | "removed" }[] = [];
  const maxC = Math.max(left.length, right.length);
  for (let i = 0; i < maxC; i++) {
    if (i >= left.length) result.push({ text: right[i], type: "added" });
    else if (i >= right.length) result.push({ text: left[i], type: "removed" });
    else if (left[i] !== right[i]) {
      result.push({ text: left[i], type: "removed" });
      result.push({ text: right[i], type: "added" });
    } else result.push({ text: left[i], type: "same" });
  }
  return result;
}

function unifiedFormat(lines: DiffLine[]): string {
  return lines.map((l) => {
    if (l.type === "added") return `+ ${l.rightText}`;
    if (l.type === "removed") return `- ${l.leftText}`;
    if (l.type === "modified") return `- ${l.leftText}\n+ ${l.rightText}`;
    return `  ${l.leftText}`;
  }).join("\n");
}

export function DiffChecker() {
  const [leftText, setLeftText] = useState("");
  const [rightText, setRightText] = useState("");
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [view, setView] = useState<DiffView>("side-by-side");
  const [level, setLevel] = useState<DiffLevel>("line");
  const [, setCopiedIdx] = useState(-1);
  const leftRef = useRef<HTMLTextAreaElement>(null);
  const rightRef = useRef<HTMLTextAreaElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setLeft(leftText); setRight(rightText); }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [leftText, rightText]);

  const { lines, stats } = useMemo(
    () => computeDiff(left, right, ignoreWhitespace, ignoreCase, level),
    [left, right, ignoreWhitespace, ignoreCase, level]
  );

  const swapSides = () => {
    const tmp = leftText;
    setLeftText(rightText);
    setRightText(tmp);
  };

  const copy = async (text: string, idx: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(-1), 2000);
  };

  const handleFile = (side: "left" | "right") => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      if (side === "left") setLeftText(text);
      else setRightText(text);
    };
    reader.readAsText(file);
  };

  const downloadPatch = () => {
    const content = unifiedFormat(lines);
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "diff.patch"; a.click();
    URL.revokeObjectURL(url);
  };

  const lineColors: Record<string, string> = {
    same: "",
    added: "bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-300",
    removed: "bg-red-100 dark:bg-red-900/30 text-red-900 dark:text-red-300",
    modified: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-900 dark:text-yellow-300",
  };

  const renderUnifiedLine = (l: DiffLine, i: number) => {
    if (l.type === "added") {
      return <div key={i} className={`flex px-2 py-0.5 font-mono text-xs leading-relaxed ${lineColors.added}`}>
        <span className="text-green-600 dark:text-green-400 w-6 shrink-0">+</span>
        <span className="text-surface-400 dark:text-dark-muted w-8 shrink-0 text-right mr-2">{l.rightNum ?? ""}</span>
        <span className="break-all">{l.rightText || "\u00A0"}</span>
      </div>;
    }
    if (l.type === "removed") {
      return <div key={i} className={`flex px-2 py-0.5 font-mono text-xs leading-relaxed ${lineColors.removed}`}>
        <span className="text-red-600 dark:text-red-400 w-6 shrink-0">-</span>
        <span className="text-surface-400 dark:text-dark-muted w-8 shrink-0 text-right mr-2">{l.leftNum ?? ""}</span>
        <span className="break-all">{l.leftText || "\u00A0"}</span>
      </div>;
    }
    if (l.type === "modified") {
      return (
        <div key={i}>
          <div className={`flex px-2 py-0.5 font-mono text-xs leading-relaxed ${lineColors.removed}`}>
            <span className="text-red-600 dark:text-red-400 w-6 shrink-0">-</span>
            <span className="text-surface-400 dark:text-dark-muted w-8 shrink-0 text-right mr-2">{l.leftNum ?? ""}</span>
            {l.chunks ? renderChunks(l.chunks, "removed") : <span className="break-all">{l.leftText || "\u00A0"}</span>}
          </div>
          <div className={`flex px-2 py-0.5 font-mono text-xs leading-relaxed ${lineColors.added}`}>
            <span className="text-green-600 dark:text-green-400 w-6 shrink-0">+</span>
            <span className="text-surface-400 dark:text-dark-muted w-8 shrink-0 text-right mr-2">{l.rightNum ?? ""}</span>
            {l.chunks ? renderChunks(l.chunks, "added") : <span className="break-all">{l.rightText || "\u00A0"}</span>}
          </div>
        </div>
      );
    }
    return (
      <div key={i} className="flex px-2 py-0.5 font-mono text-xs leading-relaxed">
        <span className="text-surface-400 dark:text-dark-muted w-6 shrink-0">&nbsp;</span>
        <span className="text-surface-400 dark:text-dark-muted w-8 shrink-0 text-right mr-2">{l.leftNum ?? ""}</span>
        <span className="break-all">{l.leftText || "\u00A0"}</span>
      </div>
    );
  };

  const renderChunks = (chunks: { text: string; type: string }[], _defaultType: string) => (
    <span className="break-all">
      {chunks.map((c, ci) => (
        <span key={ci} className={
          c.type === "same" ? "" :
          c.type === "added" ? "bg-green-300 dark:bg-green-700/60 rounded" :
          c.type === "removed" ? "bg-red-300 dark:bg-red-700/60 rounded" : ""
        }>{c.text}</span>
      ))}
    </span>
  );

  const renderSideLine = (l: DiffLine, side: "left" | "right") => {
    const text = side === "left" ? l.leftText : l.rightText;
    const num = side === "left" ? l.leftNum : l.rightNum;
    let bg = "";
    if (l.type === "added") bg = side === "left" ? "bg-green-50 dark:bg-green-900/15" : "bg-green-100 dark:bg-green-900/30";
    else if (l.type === "removed") bg = side === "left" ? "bg-red-100 dark:bg-red-900/30" : "bg-red-50 dark:bg-red-900/15";
    else if (l.type === "modified") bg = "bg-yellow-50 dark:bg-yellow-900/20";
    return (
      <div className={`flex px-2 py-0.5 font-mono text-xs leading-relaxed ${bg}`}>
        <span className="text-surface-400 dark:text-dark-muted w-8 shrink-0 text-right mr-2 select-none">{num ?? ""}</span>
        {l.chunks && l.type === "modified" ? renderChunks(l.chunks, side) : <span className="break-all">{text || "\u00A0"}</span>}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(["side-by-side", "unified"] as DiffView[]).map((v) => (
          <button key={v} onClick={() => setView(v)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${view === v ? "bg-brand-500 text-white" : "border border-surface-200 text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface"}`}>
            {v === "side-by-side" ? "Side by Side" : "Unified"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Original</label>
          <textarea ref={leftRef} value={leftText} onChange={(e) => setLeftText(e.target.value)} rows={10}
            placeholder="Paste original text or drag & drop a file..."
            onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) { const r = new FileReader(); r.onload = () => setLeftText(r.result as string); r.readAsText(f); } }}
            onDragOver={(e) => e.preventDefault()}
            className="w-full rounded-lg border border-surface-200 bg-white p-3 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted" />
          <input type="file" accept=".txt,.js,.ts,.jsx,.tsx,.html,.css,.json,.xml,.md,.csv" onChange={handleFile("left")} className="mt-1 text-xs text-surface-500 dark:text-dark-muted file:mr-2 file:rounded file:border-0 file:bg-brand-50 file:px-2 file:py-0.5 file:text-xs file:font-medium file:text-brand-700 dark:file:bg-brand-900/30 dark:file:text-brand-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Changed</label>
          <textarea ref={rightRef} value={rightText} onChange={(e) => setRightText(e.target.value)} rows={10}
            placeholder="Paste changed text or drag & drop a file..."
            onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) { const r = new FileReader(); r.onload = () => setRightText(r.result as string); r.readAsText(f); } }}
            onDragOver={(e) => e.preventDefault()}
            className="w-full rounded-lg border border-surface-200 bg-white p-3 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted" />
          <input type="file" accept=".txt,.js,.ts,.jsx,.tsx,.html,.css,.json,.xml,.md,.csv" onChange={handleFile("right")} className="mt-1 text-xs text-surface-500 dark:text-dark-muted file:mr-2 file:rounded file:border-0 file:bg-brand-50 file:px-2 file:py-0.5 file:text-xs file:font-medium file:text-brand-700 dark:file:bg-brand-900/30 dark:file:text-brand-400" />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs text-surface-600 dark:text-dark-muted">Level:</label>
          <select value={level} onChange={(e) => setLevel(e.target.value as DiffLevel)}
            className="rounded-lg border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 focus:outline-none focus:ring-1 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value="line">Line</option>
            <option value="word">Word</option>
            <option value="character">Character</option>
          </select>
        </div>
        <label className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-dark-muted cursor-pointer select-none">
          <input type="checkbox" checked={ignoreWhitespace} onChange={(e) => setIgnoreWhitespace(e.target.checked)} className="accent-brand-500" />
          Ignore Whitespace
        </label>
        <label className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-dark-muted cursor-pointer select-none">
          <input type="checkbox" checked={ignoreCase} onChange={(e) => setIgnoreCase(e.target.checked)} className="accent-brand-500" />
          Ignore Case
        </label>
        <button onClick={swapSides}
          className="rounded-lg border border-surface-200 px-3 py-1 text-xs font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors">
          Swap Sides
        </button>
      </div>

      {lines.length > 0 && (
        <>
          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex gap-3 text-xs">
              <span className="text-green-600 dark:text-green-400">+{stats.added} added</span>
              <span className="text-red-600 dark:text-red-400">-{stats.removed} removed</span>
              <span className="text-yellow-600 dark:text-yellow-400">~{stats.modified} modified</span>
              <span className="text-surface-400 dark:text-dark-muted">{stats.unchanged} unchanged</span>
            </div>
            <div className="flex-1" />
            <button onClick={() => copy(leftText, 1)} className="rounded px-2 py-0.5 text-xs border border-surface-200 text-surface-600 hover:bg-surface-50 dark:border-dark-border dark:text-dark-muted dark:hover:bg-dark-surface">Copy Left</button>
            <button onClick={() => copy(rightText, 2)} className="rounded px-2 py-0.5 text-xs border border-surface-200 text-surface-600 hover:bg-surface-50 dark:border-dark-border dark:text-dark-muted dark:hover:bg-dark-surface">Copy Right</button>
            <button onClick={() => copy(unifiedFormat(lines), 3)} className="rounded px-2 py-0.5 text-xs border border-surface-200 text-surface-600 hover:bg-surface-50 dark:border-dark-border dark:text-dark-muted dark:hover:bg-dark-surface">Copy Diff</button>
            <button onClick={downloadPatch} className="rounded px-2 py-0.5 text-xs border border-surface-200 text-surface-600 hover:bg-surface-50 dark:border-dark-border dark:text-dark-muted dark:hover:bg-dark-surface">Download .patch</button>
          </div>

          {view === "side-by-side" ? (
            <div className="grid grid-cols-2 gap-0 border border-surface-200 rounded-lg overflow-hidden dark:border-dark-border">
              <div className="max-h-96 overflow-auto border-r border-surface-200 dark:border-dark-border">
                <div className="sticky top-0 bg-surface-100 dark:bg-dark-surface px-2 py-1 text-xs font-medium text-surface-500 dark:text-dark-muted border-b border-surface-200 dark:border-dark-border">Original</div>
                {lines.map((l) => renderSideLine(l, "left"))}
              </div>
              <div className="max-h-96 overflow-auto">
                <div className="sticky top-0 bg-surface-100 dark:bg-dark-surface px-2 py-1 text-xs font-medium text-surface-500 dark:text-dark-muted border-b border-surface-200 dark:border-dark-border">Changed</div>
                {lines.map((l) => renderSideLine(l, "right"))}
              </div>
            </div>
          ) : (
            <div className="max-h-96 overflow-auto border border-surface-200 rounded-lg dark:border-dark-border">
              <div className="sticky top-0 bg-surface-100 dark:bg-dark-surface px-2 py-1 text-xs font-medium text-surface-500 dark:text-dark-muted border-b border-surface-200 dark:border-dark-border">Unified Diff</div>
              {lines.map((l, i) => renderUnifiedLine(l, i))}
            </div>
          )}
        </>
      )}

      {lines.length === 0 && (left || right) && (
        <p className="text-xs text-surface-400 dark:text-dark-muted italic">No differences (texts are identical)</p>
      )}
    </div>
  );
}
