"use client";

import { useState, useMemo, useRef } from "react";

interface LengthInfo {
  codePoints: number;
  utf16Units: number;
  utf8Bytes: number;
  utf16Bytes: number;
  words: number;
  lines: number;
  nonEmptyLines: number;
  charsNoSpaces: number;
  isEmpty: boolean;
  isWhitespaceOnly: boolean;
  asciiCodes: string;
  hexBytes: string;
  binary: string;
  letters: number;
  digits: number;
  spaces: number;
  punctuation: number;
  symbols: number;
  emojiCount: number;
  emojiList: string[];
  codePointsDisplay: string[];
  hasInvalidUtf8: boolean;
  fitsSms: boolean;
  fitsTwitter: boolean;
  fitsFacebook: boolean;
  fitsInstagram: boolean;
}

function getEmojiRegex(): RegExp {
  return /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{200D}\u{20E3}\u{231A}-\u{231B}\u{23E9}-\u{23F3}\u{23F8}-\u{23FA}\u{25AA}-\u{25AB}\u{25B6}\u{25C0}\u{25FB}-\u{25FE}\u{2934}-\u{2935}\u{2B05}-\u{2B07}\u{2B1B}-\u{2B1C}\u{2B50}\u{2B55}\u{3030}\u{303D}\u{3297}\u{3299}]/gu;
}

function analyzeString(text: string): LengthInfo {
  const codePoints = [...text].length;
  const utf16Units = text.length;
  const utf8Bytes = new TextEncoder().encode(text).length;
  const utf16Bytes = utf16Units * 2;

  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const lines = text ? text.split("\n").length : 0;
  const nonEmptyLines = text ? text.split("\n").filter((l) => l.trim().length > 0).length : 0;
  const charsNoSpaces = text.replace(/\s/g, "").length;
  const isEmpty = text.length === 0;
  const isWhitespaceOnly = text.trim().length === 0 && text.length > 0;

  const asciiCodes = [...text].map((c) => c.charCodeAt(0)).join(" ");
  const hexBytes = new TextEncoder().encode(text).reduce((acc, b) => acc + b.toString(16).padStart(2, "0").toUpperCase() + " ", "").trim();
  const binary = new TextEncoder().encode(text).reduce((acc, b) => acc + b.toString(2).padStart(8, "0") + " ", "").trim();

  const letters = (text.match(/[a-zA-Z]/g) || []).length;
  const digits = (text.match(/[0-9]/g) || []).length;
  const spaces = (text.match(/ /g) || []).length;
  const punctuation = (text.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g) || []).length;
  const symbols = (text.match(/[^\w\s]/g) || []).length - punctuation;
  const emojiList = text.match(getEmojiRegex()) || [];
  const emojiCount = emojiList.length;

  const codePointsDisplay = [...text].map((c) => {
    const cp = c.codePointAt(0)!;
    return `U+${cp.toString(16).toUpperCase().padStart(4, "0")} ${c}`;
  });

  const hasInvalidUtf8 = false;

  const fitsSms = utf8Bytes <= 160;
  const fitsTwitter = utf16Units <= 280;
  const fitsFacebook = utf16Units <= 63206;
  const fitsInstagram = utf16Units <= 2200;

  return {
    codePoints, utf16Units, utf8Bytes, utf16Bytes,
    words, lines, nonEmptyLines, charsNoSpaces, isEmpty, isWhitespaceOnly,
    asciiCodes, hexBytes, binary,
    letters, digits, spaces, punctuation, symbols,
    emojiCount, emojiList, codePointsDisplay, hasInvalidUtf8,
    fitsSms, fitsTwitter, fitsFacebook, fitsInstagram,
  };
}

const LIMITS = [
  { label: "SMS (160)", key: "fitsSms" as const, max: 160 },
  { label: "Twitter (280)", key: "fitsTwitter" as const, max: 280 },
  { label: "Instagram (2200)", key: "fitsInstagram" as const, max: 2200 },
  { label: "Facebook (63206)", key: "fitsFacebook" as const, max: 63206 },
];

export function StringLength() {
  const [input, setInput] = useState("Hello, world!");
  const [showRepr, setShowRepr] = useState(true);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const info = useMemo(() => analyzeString(input), [input]);

  const copyInfo = async () => {
    const lines = [
      `Code Points: ${info.codePoints}`,
      `UTF-16 Units: ${info.utf16Units}`,
      `UTF-8 Bytes: ${info.utf8Bytes}`,
      `UTF-16 Bytes: ${info.utf16Bytes}`,
      `Words: ${info.words}`,
      `Lines: ${info.lines}`,
      `Non-empty Lines: ${info.nonEmptyLines}`,
      `Characters (no spaces): ${info.charsNoSpaces}`,
      `Empty: ${info.isEmpty}`,
      `Whitespace Only: ${info.isWhitespaceOnly}`,
      `Letters: ${info.letters}`,
      `Digits: ${info.digits}`,
      `Spaces: ${info.spaces}`,
      `Punctuation: ${info.punctuation}`,
      `Symbols: ${info.symbols}`,
      `Emoji Count: ${info.emojiCount}`,
      `SMS (160): ${info.fitsSms ? "Yes" : "No"}`,
      `Twitter (280): ${info.fitsTwitter ? "Yes" : "No"}`,
    ];
    await navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInput(text);
    } catch { /* not available */ }
  };

  const barWidth = Math.min(100, (info.utf16Units / 500) * 100);

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium text-surface-700 dark:text-dark-text">Input Text</label>
          <button onClick={pasteFromClipboard} className="rounded px-2 py-0.5 text-xs border border-surface-200 text-surface-600 hover:bg-surface-50 dark:border-dark-border dark:text-dark-muted dark:hover:bg-dark-surface">Paste</button>
        </div>
        <textarea ref={textareaRef} value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type or paste text here..." rows={5}
          className="w-full rounded-lg border border-surface-200 bg-white p-3 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted" />
      </div>

      <div className="h-2.5 rounded-full bg-surface-200 dark:bg-dark-border overflow-hidden">
        <div className="h-full bg-brand-500 rounded-full transition-all" style={{ width: `${barWidth}%` }} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: "Code Points", value: info.codePoints },
          { label: "UTF-16 Units", value: info.utf16Units },
          { label: "UTF-8 Bytes", value: info.utf8Bytes },
          { label: "UTF-16 Bytes", value: info.utf16Bytes },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-surface-200 bg-surface-50 p-2 text-center dark:border-dark-border dark:bg-dark-surface">
            <div className="text-lg font-bold font-mono text-surface-900 dark:text-dark-text">{s.value.toLocaleString()}</div>
            <div className="text-[10px] text-surface-500 dark:text-dark-muted">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: "Words", value: info.words },
          { label: "Lines", value: info.lines },
          { label: "Non-empty Lines", value: info.nonEmptyLines },
          { label: "No Spaces", value: info.charsNoSpaces },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-surface-200 bg-surface-50 p-2 text-center dark:border-dark-border dark:bg-dark-surface">
            <div className="text-lg font-bold font-mono text-surface-900 dark:text-dark-text">{s.value.toLocaleString()}</div>
            <div className="text-[10px] text-surface-500 dark:text-dark-muted">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: "Status", value: info.isEmpty ? "Empty" : info.isWhitespaceOnly ? "Whitespace" : "Has content" },
          { label: "Letters", value: info.letters },
          { label: "Digits", value: info.digits },
          { label: "Spaces", value: info.spaces },
          { label: "Punctuation", value: info.punctuation },
          { label: "Symbols", value: info.symbols },
          { label: "Emoji", value: info.emojiCount },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-surface-200 bg-surface-50 p-2 text-center dark:border-dark-border dark:bg-dark-surface">
            <div className="text-lg font-bold font-mono text-surface-900 dark:text-dark-text">{s.value}</div>
            <div className="text-[10px] text-surface-500 dark:text-dark-muted">{s.label}</div>
          </div>
        ))}
      </div>

      {info.emojiList.length > 0 && (
        <div className="flex flex-wrap gap-1 text-xs">
          <span className="text-surface-500 dark:text-dark-muted">Emojis:</span>
          {[...new Set(info.emojiList)].map((e, i) => (
            <span key={i} className="text-lg">{e}</span>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {LIMITS.map((l) => {
          const fits = info[l.key];
          return (
            <div key={l.label} className={`rounded-lg border p-2 text-center ${fits ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20" : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"}`}>
              <div className="flex items-center justify-center gap-1">
                <span className={`text-xs font-semibold ${fits ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}>
                  {fits ? "Fits" : "Exceeds"}
                </span>
              </div>
              <div className="text-[10px] text-surface-500 dark:text-dark-muted">{l.label}</div>
            </div>
          );
        })}
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-medium text-surface-500 dark:text-dark-muted">Representations</label>
          <label className="flex items-center gap-1 text-xs text-surface-500 dark:text-dark-muted cursor-pointer select-none">
            <input type="checkbox" checked={showRepr} onChange={(e) => setShowRepr(e.target.checked)} className="accent-brand-500" />
            Show
          </label>
        </div>
        {showRepr && (
          <div className="space-y-2">
            <div>
              <p className="text-[10px] text-surface-400 dark:text-dark-muted mb-0.5">ASCII Codes</p>
              <div className="rounded border border-surface-200 bg-surface-50 p-2 text-xs font-mono text-surface-700 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text break-all max-h-16 overflow-auto">
                {info.asciiCodes || <span className="text-surface-400 italic">(empty)</span>}
              </div>
            </div>
            <div>
              <p className="text-[10px] text-surface-400 dark:text-dark-muted mb-0.5">Hex Bytes</p>
              <div className="rounded border border-surface-200 bg-surface-50 p-2 text-xs font-mono text-surface-700 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text break-all max-h-16 overflow-auto">
                {info.hexBytes || <span className="text-surface-400 italic">(empty)</span>}
              </div>
            </div>
            <div>
              <p className="text-[10px] text-surface-400 dark:text-dark-muted mb-0.5">Binary</p>
              <div className="rounded border border-surface-200 bg-surface-50 p-2 text-xs font-mono text-surface-700 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text break-all max-h-16 overflow-auto" style={{ wordBreak: "break-all" }}>
                {info.binary || <span className="text-surface-400 italic">(empty)</span>}
              </div>
            </div>
            {info.codePointsDisplay.length <= 50 && (
              <div>
                <p className="text-[10px] text-surface-400 dark:text-dark-muted mb-0.5">Code Points</p>
                <div className="rounded border border-surface-200 bg-surface-50 p-2 text-xs font-mono text-surface-700 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text break-all max-h-32 overflow-auto">
                  {info.codePointsDisplay.join(", ") || <span className="text-surface-400 italic">(empty)</span>}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button onClick={copyInfo} className="rounded px-3 py-1 text-xs border border-surface-200 text-surface-600 hover:bg-surface-50 dark:border-dark-border dark:text-dark-muted dark:hover:bg-dark-surface">
          {copied ? "Copied!" : "Copy Info"}
        </button>
        <button onClick={() => setInput("")} className="rounded px-3 py-1 text-xs border border-surface-200 text-surface-600 hover:bg-surface-50 dark:border-dark-border dark:text-dark-muted dark:hover:bg-dark-surface">Clear</button>
      </div>
    </div>
  );
}
