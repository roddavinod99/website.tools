"use client";

import { useState, useMemo, useRef } from "react";

type Mode = "match" | "replace" | "split";

interface MatchResult {
  index: number;
  value: string;
  length: number;
  groups: (string | undefined)[];
  namedGroups: Record<string, string>;
  isLookahead: boolean;
  isLookbehind: boolean;
}

const COMMON_PATTERNS = [
  { label: "Email", pattern: "^[\\w.-]+@[\\w.-]+\\.\\w{2,}$" },
  { label: "URL", pattern: "https?://[\\w.-]+(:\\d+)?(/\\S*)?" },
  { label: "Phone (US)", pattern: "\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}" },
  { label: "IP v4", pattern: "\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b" },
  { label: "Date (ISO)", pattern: "\\d{4}-\\d{2}-\\d{2}" },
  { label: "Hex Color", pattern: "#?([a-fA-F0-9]{3}|[a-fA-F0-9]{6})\\b" },
  { label: "Credit Card", pattern: "\\b\\d{4}[ -]?\\d{4}[ -]?\\d{4}[ -]?\\d{4}\\b" },
  { label: "UUID", pattern: "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}" },
  { label: "HTML Tag", pattern: "<[^>]+>" },
  { label: "Whitespace", pattern: "\\s+" },
];

const CHEAT_SHEET_ITEMS = [
  { symbol: ".", desc: "Any character except newline" },
  { symbol: "\\d", desc: "Digit (0-9)" },
  { symbol: "\\w", desc: "Word char (a-z, A-Z, 0-9, _)" },
  { symbol: "\\s", desc: "Whitespace" },
  { symbol: "\\b", desc: "Word boundary" },
  { symbol: "^", desc: "Start of string" },
  { symbol: "$", desc: "End of string" },
  { symbol: "*", desc: "Zero or more" },
  { symbol: "+", desc: "One or more" },
  { symbol: "?", desc: "Zero or one" },
  { symbol: "{n,m}", desc: "Between n and m times" },
  { symbol: "(...) ", desc: "Capture group" },
  { symbol: "(?:...)", desc: "Non-capturing group" },
  { symbol: "(?=...)", desc: "Lookahead" },
  { symbol: "(?!...)", desc: "Negative lookahead" },
  { symbol: "(?<=...)", desc: "Lookbehind" },
  { symbol: "(?<!...)", desc: "Negative lookbehind" },
  { symbol: "[...]", desc: "Character class" },
  { symbol: "|", desc: "Alternation (OR)" },
  { symbol: "\\1", desc: "Back reference" },
];

const FLAGS = [
  { id: "g", label: "g", tooltip: "Global" },
  { id: "i", label: "i", tooltip: "Case insensitive" },
  { id: "m", label: "m", tooltip: "Multiline" },
  { id: "s", label: "s", tooltip: "Dot all" },
  { id: "u", label: "u", tooltip: "Unicode" },
  { id: "y", label: "y", tooltip: "Sticky" },
];

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function detectLookarounds(pattern: string): { lookahead: number; lookbehind: number } {
  const la = (pattern.match(/\(\?=/g) || []).length + (pattern.match(/\(\?!/g) || []).length;
  const lb = (pattern.match(/\(\?<=/g) || []).length + (pattern.match(/\(\?<!/g) || []).length;
  return { lookahead: la, lookbehind: lb };
}

export function RegexTester() {
  const [pattern, setPattern] = useState("(\\w+)@(\\w+)\\.(\\w+)");
  const [flags, setFlags] = useState("gm");
  const [testText, setTestText] = useState("user@example.com\nadmin@test.org");
  const [mode, setMode] = useState<Mode>("match");
  const [replacement, setReplacement] = useState("");
  const [autoEscape, setAutoEscape] = useState(false);
  const [showCheatSheet, setShowCheatSheet] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(-1);
  const resultRef = useRef<HTMLDivElement>(null);

  const activePattern = autoEscape ? escapeRegex(pattern) : pattern;

  const regex = useMemo(() => {
    try {
      return new RegExp(activePattern, flags);
    } catch {
      return null;
    }
  }, [activePattern, flags]);

  const validationError = useMemo(() => {
    if (!pattern) return null;
    try {
      new RegExp(activePattern, flags);
      return null;
    } catch (e) {
      return (e as Error).message;
    }
  }, [activePattern, flags, pattern]);

  const lookarounds = useMemo(() => detectLookarounds(pattern), [pattern]);

  const matches = useMemo(() => {
    if (!regex || !testText || mode !== "match") return [];
    const results: MatchResult[] = [];
    const re = new RegExp(regex.source, regex.flags.includes("g") ? regex.flags : regex.flags + "g");
    let m: RegExpExecArray | null;
    while ((m = re.exec(testText)) !== null) {
      const namedGroups: Record<string, string> = {};
      if (m.groups) Object.assign(namedGroups, m.groups);
      const localIdx = m.index;
      const groupVals: (string | undefined)[] = [];
      for (let i = 1; i < m.length; i++) groupVals.push(m[i]);
      results.push({
        index: localIdx,
        value: m[0],
        length: m[0].length,
        groups: groupVals,
        namedGroups,
        isLookahead: false,
        isLookbehind: false,
      });
      if (!re.global) break;
    }
    return results;
  }, [regex, testText, mode]);

  const replaceResult = useMemo(() => {
    if (!regex || !testText || mode !== "replace") return null;
    try {
      return testText.replace(regex, replacement);
    } catch {
      return null;
    }
  }, [regex, testText, mode, replacement]);

  const splitResult = useMemo(() => {
    if (!regex || !testText || mode !== "split") return null;
    try {
      return testText.split(regex);
    } catch {
      return null;
    }
  }, [regex, testText, mode]);

  const highlightText = useMemo(() => {
    if (mode !== "match" || !regex || !testText) return null;
    const parts: { text: string; match: boolean; color: string }[] = [];
    const colors = ["bg-yellow-200 dark:bg-yellow-700/40", "bg-green-200 dark:bg-green-700/40", "bg-blue-200 dark:bg-blue-700/40", "bg-purple-200 dark:bg-purple-700/40", "bg-pink-200 dark:bg-pink-700/40", "bg-orange-200 dark:bg-orange-700/40"];
    let lastIdx = 0;
    let ci = 0;
    const re = new RegExp(regex.source, regex.flags.includes("g") ? regex.flags : regex.flags + "g");
    let m: RegExpExecArray | null;
    while ((m = re.exec(testText)) !== null) {
      if (m.index > lastIdx) parts.push({ text: testText.slice(lastIdx, m.index), match: false, color: "" });
      parts.push({ text: m[0], match: true, color: colors[ci % colors.length] });
      lastIdx = m.index + m[0].length;
      ci++;
      if (!re.global) break;
    }
    if (lastIdx < testText.length) parts.push({ text: testText.slice(lastIdx), match: false, color: "" });
    return parts;
  }, [regex, testText, mode]);

  const toggleFlag = (flag: string) => {
    setFlags((prev) => prev.includes(flag) ? prev.replace(flag, "") : prev + flag);
  };

  const insertPattern = (pat: string) => setPattern(pat);

  const copy = async (text: string, idx: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(-1), 2000);
  };

  const matchCount = matches.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {(["match", "replace", "split"] as Mode[]).map((m) => (
          <button key={m} onClick={() => setMode(m)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${mode === m ? "bg-brand-500 text-white" : "border border-surface-200 text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface"}`}>
            {m === "match" ? "Match" : m === "replace" ? "Replace" : "Split"}
          </button>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium text-surface-700 dark:text-dark-text">Regex Pattern</label>
          <div className="flex gap-1">
            <button onClick={() => setShowLibrary(!showLibrary)}
              className="rounded px-2 py-0.5 text-xs border border-surface-200 text-surface-600 hover:bg-surface-50 dark:border-dark-border dark:text-dark-muted dark:hover:bg-dark-surface">Library</button>
            <button onClick={() => setShowCheatSheet(!showCheatSheet)}
              className="rounded px-2 py-0.5 text-xs border border-surface-200 text-surface-600 hover:bg-surface-50 dark:border-dark-border dark:text-dark-muted dark:hover:bg-dark-surface">Cheat Sheet</button>
            <label className="flex items-center gap-1 text-xs text-surface-600 dark:text-dark-muted cursor-pointer select-none">
              <input type="checkbox" checked={autoEscape} onChange={(e) => setAutoEscape(e.target.checked)} className="accent-brand-500" />
              Escape
            </label>
          </div>
        </div>
        <div className="flex gap-2">
          <input type="text" value={pattern} onChange={(e) => setPattern(e.target.value)}
            placeholder="Enter regex pattern..."
            className="flex-1 rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted" />
          <div className="flex items-center gap-0.5">
            {FLAGS.map((f) => (
              <button key={f.id} onClick={() => toggleFlag(f.id)} title={f.tooltip}
                className={`h-7 w-7 rounded text-xs font-mono font-semibold transition-colors ${flags.includes(f.id) ? "bg-brand-500 text-white" : "border border-surface-200 text-surface-500 dark:border-dark-border dark:text-dark-muted hover:bg-surface-100 dark:hover:bg-dark-surface"}`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
        {validationError && (
          <p className="mt-1 text-xs text-red-500 dark:text-red-400">{validationError}</p>
        )}
      </div>

      {showLibrary && (
        <div className="rounded-lg border border-surface-200 bg-surface-50 p-2 dark:border-dark-border dark:bg-dark-surface">
          <p className="text-xs font-medium text-surface-500 dark:text-dark-muted mb-1.5 px-1">Common Patterns</p>
          <div className="flex flex-wrap gap-1">
            {COMMON_PATTERNS.map((p) => (
              <button key={p.label} onClick={() => insertPattern(p.pattern)}
                className="rounded bg-white dark:bg-dark-bg border border-surface-200 dark:border-dark-border px-2 py-1 text-xs font-mono text-surface-700 dark:text-dark-text hover:bg-brand-50 dark:hover:bg-brand-900/20 hover:border-brand-300 dark:hover:border-brand-700 transition-colors">
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {showCheatSheet && (
        <div className="rounded-lg border border-surface-200 bg-surface-50 p-2 dark:border-dark-border dark:bg-dark-surface max-h-48 overflow-y-auto">
          <p className="text-xs font-medium text-surface-500 dark:text-dark-muted mb-1.5 px-1">Regex Cheat Sheet</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-0.5">
            {CHEAT_SHEET_ITEMS.map((item) => (
              <div key={item.symbol} className="flex gap-2 text-xs">
                <code className="font-mono text-brand-600 dark:text-brand-400 min-w-[4rem]">{item.symbol}</code>
                <span className="text-surface-600 dark:text-dark-muted">{item.desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Test String</label>
        <textarea value={testText} onChange={(e) => setTestText(e.target.value)} rows={6}
          placeholder="Enter text to test against..."
          className="w-full rounded-lg border border-surface-200 bg-white p-3 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted" />
      </div>

      {mode === "replace" && (
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Replacement String</label>
          <input type="text" value={replacement} onChange={(e) => setReplacement(e.target.value)}
            placeholder="$1 (use $1, $2, etc. for backreferences)"
            className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted" />
        </div>
      )}

      {mode === "match" && highlightText && (
        <div className="rounded-lg border border-surface-200 bg-white p-3 text-sm font-mono leading-relaxed whitespace-pre-wrap break-all dark:border-dark-border dark:bg-dark-surface dark:text-dark-text max-h-48 overflow-y-auto">
          {highlightText.length === 0 ? (
            <span className="text-surface-400 dark:text-dark-muted">{testText || "\u00A0"}</span>
          ) : (
            highlightText.map((part, i) =>
              part.match ? <span key={i} className={`rounded px-0.5 ${part.color}`}>{part.text}</span> : <span key={i}>{part.text}</span>
            )
          )}
        </div>
      )}

      {mode === "replace" && replaceResult !== null && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-surface-700 dark:text-dark-text">Replaced Result</label>
            <button onClick={() => copy(replaceResult, 999)} className="text-xs text-brand-500 hover:text-brand-600">
              {copiedIdx === 999 ? "Copied!" : "Copy"}
            </button>
          </div>
          <pre className="w-full rounded-lg border border-surface-200 bg-surface-50 p-3 text-sm font-mono text-surface-900 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text overflow-auto max-h-40 select-all break-all">{replaceResult}</pre>
        </div>
      )}

      {mode === "split" && splitResult && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-surface-700 dark:text-dark-text">Split Result ({splitResult.length} parts)</label>
            <button onClick={() => copy(splitResult.join("\n"), 998)} className="text-xs text-brand-500 hover:text-brand-600">
              {copiedIdx === 998 ? "Copied!" : "Copy"}
            </button>
          </div>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {splitResult.map((part, i) => (
              <div key={i} className="flex gap-2 rounded border border-surface-200 bg-surface-50 px-3 py-1.5 text-sm font-mono dark:border-dark-border dark:bg-dark-bg">
                <span className="text-surface-400 dark:text-dark-muted shrink-0">{i + 1}.</span>
                <span className="text-surface-900 dark:text-dark-text break-all">{part || <span className="text-surface-400 italic">(empty)</span>}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {regex && testText && mode === "match" && (
        <div ref={resultRef}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-surface-600 dark:text-dark-muted">
              <span className="font-semibold text-brand-500">{matchCount}</span> match{matchCount !== 1 ? "es" : ""} found
              {lookarounds.lookahead + lookarounds.lookbehind > 0 && (
                <span className="ml-2 text-xs">(contains {lookarounds.lookahead} lookahead, {lookarounds.lookbehind} lookbehind)</span>
              )}
            </p>
            <div className="flex gap-1">
              <button onClick={() => copy(pattern, 0)} className="rounded px-2 py-0.5 text-xs border border-surface-200 text-surface-600 hover:bg-surface-50 dark:border-dark-border dark:text-dark-muted dark:hover:bg-dark-surface">Copy Regex</button>
              <button onClick={() => copy(JSON.stringify(matches, null, 2), 1)} className="rounded px-2 py-0.5 text-xs border border-surface-200 text-surface-600 hover:bg-surface-50 dark:border-dark-border dark:text-dark-muted dark:hover:bg-dark-surface">Copy Matches</button>
            </div>
          </div>
          <div className="space-y-1 max-h-80 overflow-y-auto">
            {matches.map((m, i) => (
              <div key={i} className="rounded-lg border border-surface-200 bg-surface-50 p-2 dark:border-dark-border dark:bg-dark-surface animate-fade-in">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex gap-2 text-xs text-surface-400 dark:text-dark-muted font-mono">
                    <span>#{i + 1}</span>
                    <span>idx:{m.index}</span>
                    <span>len:{m.length}</span>
                  </div>
                  <button onClick={() => copy(m.value, i + 10)} className="text-xs text-brand-500 hover:text-brand-600">
                    {copiedIdx === i + 10 ? "Copied!" : "Copy"}
                  </button>
                </div>
                <code className="text-sm font-mono text-surface-900 dark:text-dark-text break-all">{m.value}</code>
                {m.groups.length > 0 && (
                  <div className="mt-1.5 pl-3 border-l-2 border-brand-300 dark:border-brand-700">
                    <p className="text-xs text-surface-500 dark:text-dark-muted mb-0.5">Capture Groups:</p>
                    {m.groups.map((g, gi) => (
                      <div key={gi} className="flex gap-2 text-xs font-mono">
                        <span className="text-brand-500 shrink-0">${gi + 1}:</span>
                        <span className="text-surface-900 dark:text-dark-text break-all">{g ?? <span className="text-red-400">undefined</span>}</span>
                      </div>
                    ))}
                    {Object.keys(m.namedGroups).length > 0 && (
                      <div className="mt-1">
                        <p className="text-xs text-surface-500 dark:text-dark-muted mb-0.5">Named Groups:</p>
                        {Object.entries(m.namedGroups).map(([name, val]) => (
                          <div key={name} className="flex gap-2 text-xs font-mono">
                            <span className="text-purple-500 dark:text-purple-400 shrink-0">?&lt;{name}&gt;:</span>
                            <span className="text-surface-900 dark:text-dark-text break-all">{val}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {regex && testText && mode === "match" && matches.length === 0 && (
        <p className="text-sm text-surface-400 dark:text-dark-muted italic">No matches found</p>
      )}
    </div>
  );
}
