"use client";

import { useState, useMemo, useEffect, useRef } from "react";

type Separator = "-" | "_" | "~" | ".";
type CaseOption = "lowercase" | "uppercase" | "original";
type SanitizeMode = "spaces-only" | "full";

const STOP_WORDS = new Set(["a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "of", "by", "with"]);

function hasKorean(text: string): boolean { return /[\uAC00-\uD7AF]/.test(text); }
function hasJapanese(text: string): boolean { return /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/.test(text); }
function hasChinese(text: string): boolean { return /[\u4E00-\u9FFF]/.test(text); }
function hasArabic(text: string): boolean { return /[\u0600-\u06FF]/.test(text); }
function hasCyrillic(text: string): boolean { return /[\u0400-\u04FF]/.test(text); }

function transliterateKorean(text: string): string {
  const result: string[] = [];
  for (const ch of text) {
    const code = ch.charCodeAt(0);
    if (code >= 0xAC00 && code <= 0xD7AF) {
      const syllableIndex = code - 0xAC00;
      const initialIndex = Math.floor(syllableIndex / 588);
      const medialIndex = Math.floor((syllableIndex % 588) / 28);
      const finalIndex = syllableIndex % 28;
      const initials = ["g", "kk", "n", "d", "tt", "r", "m", "b", "pp", "s", "ss", "", "j", "jj", "ch", "k", "t", "p", "h"];
      const medials = ["a", "ae", "ya", "yae", "eo", "e", "yeo", "ye", "o", "wa", "wae", "oe", "yo", "u", "wo", "we", "wi", "yu", "eu", "ui", "i"];
      const finals = ["", "g", "kk", "gs", "n", "nj", "nh", "d", "l", "lg", "lm", "lb", "ls", "lt", "lp", "lh", "m", "b", "bs", "s", "ss", "ng", "j", "ch", "k", "t", "p", "h"];
      result.push(initials[initialIndex]! + medials[medialIndex]! + finals[finalIndex]!);
    } else {
      result.push(ch);
    }
  }
  return result.join("");
}

function transliterate(text: string): string {
  let result = text;
  if (hasKorean(result)) {
    result = transliterateKorean(result);
  }
  if (hasJapanese(result)) {
    result = result.replace(/[\u3040-\u309F]/g, (c) => {
      const map: Record<string, string> = {
        "あ": "a", "い": "i", "う": "u", "え": "e", "お": "o",
        "か": "ka", "き": "ki", "く": "ku", "け": "ke", "こ": "ko",
        "さ": "sa", "し": "shi", "す": "su", "せ": "se", "そ": "so",
        "た": "ta", "ち": "chi", "つ": "tsu", "て": "te", "と": "to",
        "な": "na", "に": "ni", "ぬ": "nu", "ね": "ne", "の": "no",
        "は": "ha", "ひ": "hi", "ふ": "fu", "へ": "he", "ほ": "ho",
        "ま": "ma", "み": "mi", "む": "mu", "め": "me", "も": "mo",
        "や": "ya", "ゆ": "yu", "よ": "yo",
        "ら": "ra", "り": "ri", "る": "ru", "れ": "re", "ろ": "ro",
        "わ": "wa", "を": "o", "ん": "n",
        "が": "ga", "ぎ": "gi", "ぐ": "gu", "げ": "ge", "ご": "go",
        "ざ": "za", "じ": "ji", "ず": "zu", "ぜ": "ze", "ぞ": "zo",
        "だ": "da", "ぢ": "ji", "づ": "zu", "で": "de", "ど": "do",
        "ば": "ba", "び": "bi", "ぶ": "bu", "べ": "be", "ぼ": "bo",
        "ぱ": "pa", "ぴ": "pi", "ぷ": "pu", "ぺ": "pe", "ぽ": "po",
      };
      return map[c] || c;
    });
    result = result.replace(/[\u30A0-\u30FF]/g, (c) => {
      const map: Record<string, string> = {
        "ア": "a", "イ": "i", "ウ": "u", "エ": "e", "オ": "o",
        "カ": "ka", "キ": "ki", "ク": "ku", "ケ": "ke", "コ": "ko",
        "サ": "sa", "シ": "shi", "ス": "su", "セ": "se", "ソ": "so",
        "タ": "ta", "チ": "chi", "ツ": "tsu", "テ": "te", "ト": "to",
        "ナ": "na", "ニ": "ni", "ヌ": "nu", "ネ": "ne", "ノ": "no",
        "ハ": "ha", "ヒ": "hi", "フ": "fu", "ヘ": "he", "ホ": "ho",
        "マ": "ma", "ミ": "mi", "ム": "mu", "メ": "me", "モ": "mo",
        "ヤ": "ya", "ユ": "yu", "ヨ": "yo",
        "ラ": "ra", "リ": "ri", "ル": "ru", "レ": "re", "ロ": "ro",
        "ワ": "wa", "ヲ": "o", "ン": "n",
        "ガ": "ga", "ギ": "gi", "グ": "gu", "ゲ": "ge", "ゴ": "go",
        "ザ": "za", "ジ": "ji", "ズ": "zu", "ゼ": "ze", "ゾ": "zo",
        "ダ": "da", "ヂ": "ji", "ヅ": "zu", "デ": "de", "ド": "do",
        "バ": "ba", "ビ": "bi", "ブ": "bu", "ベ": "be", "ボ": "bo",
        "パ": "pa", "ピ": "pi", "プ": "pu", "ペ": "pe", "ポ": "po",
      };
      return map[c] || c;
    });
  }
  if (hasChinese(result)) {
    result = result.replace(/[\u4E00-\u9FFF]/g, () => "");
  }
  if (hasArabic(result)) {
    const arabicMap: Record<string, string> = {
      "ا": "a", "ب": "b", "ت": "t", "ث": "th", "ج": "j", "ح": "h", "خ": "kh",
      "د": "d", "ذ": "dh", "ر": "r", "ز": "z", "س": "s", "ش": "sh", "ص": "s",
      "ض": "d", "ط": "t", "ظ": "z", "ع": "a", "غ": "gh", "ف": "f", "ق": "q",
      "ك": "k", "ل": "l", "م": "m", "ن": "n", "ه": "h", "و": "w", "ي": "y",
      "ة": "h", "ى": "a", "ء": "a", "إ": "i", "أ": "a", "آ": "a",
    };
    result = result.replace(/[\u0600-\u06FF]/g, (c) => arabicMap[c] || c);
  }
  if (hasCyrillic(result)) {
    const cyrillicMap: Record<string, string> = {
      "а": "a", "б": "b", "в": "v", "г": "g", "д": "d", "е": "e", "ё": "yo",
      "ж": "zh", "з": "z", "и": "i", "й": "y", "к": "k", "л": "l", "м": "m",
      "н": "n", "о": "o", "п": "p", "р": "r", "с": "s", "т": "t", "у": "u",
      "ф": "f", "х": "kh", "ц": "ts", "ч": "ch", "ш": "sh", "щ": "shch",
      "ъ": "", "ы": "y", "ь": "", "э": "e", "ю": "yu", "я": "ya",
      "А": "A", "Б": "B", "В": "V", "Г": "G", "Д": "D", "Е": "E", "Ё": "Yo",
      "Ж": "Zh", "З": "Z", "И": "I", "Й": "Y", "К": "K", "Л": "L", "М": "M",
      "Н": "N", "О": "O", "П": "P", "Р": "R", "С": "S", "Т": "T", "У": "U",
      "Ф": "F", "Х": "Kh", "Ц": "Ts", "Ч": "Ch", "Ш": "Sh", "Щ": "Shch",
      "Ъ": "", "Ы": "Y", "Ь": "", "Э": "E", "Ю": "Yu", "Я": "Ya",
    };
    result = result.replace(/[\u0400-\u04FF]/g, (c) => cyrillicMap[c] || c);
  }
  result = result.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
  const accentMap: Record<string, string> = {
    à: "a", á: "a", â: "a", ã: "a", ä: "a", å: "a", æ: "ae",
    ç: "c", è: "e", é: "e", ê: "e", ë: "e",
    ì: "i", í: "i", î: "i", ï: "i",
    ð: "d", ñ: "n", ò: "o", ó: "o", ô: "o", õ: "o", ö: "o", ø: "o",
    ù: "u", ú: "u", û: "u", ü: "u",
    ý: "y", þ: "th", ß: "ss", ÿ: "y",
    À: "A", Á: "A", Â: "A", Ã: "A", Ä: "A", Å: "A", Æ: "AE",
    Ç: "C", È: "E", É: "E", Ê: "E", Ë: "E",
    Ì: "I", Í: "I", Î: "I", Ï: "I",
    Ð: "D", Ñ: "N", Ò: "O", Ó: "O", Ô: "O", Õ: "O", Ö: "O", Ø: "O",
    Ù: "U", Ú: "U", Û: "U", Ü: "U",
    Ý: "Y", Þ: "TH",
  };
  result = result.replace(/[^\x00-\x7F]/g, (c) => accentMap[c] || c);
  return result;
}

function generateSlug(
  text: string,
  separator: Separator,
  caseOpt: CaseOption,
  sanitizeMode: SanitizeMode,
  maxLength: number,
  prefix: string,
  suffix: string,
  numbered: boolean,
  history: string[],
  removeStopWords: boolean,
): string {
  let slug = text;

  slug = transliterate(slug);

  if (removeStopWords) {
    slug = slug.split(/\s+/).filter(word => !STOP_WORDS.has(word.toLowerCase())).join(" ");
  }

  if (sanitizeMode === "full") {
    slug = slug.replace(/[^a-zA-Z0-9\s_-]/g, "");
  } else {
    slug = slug.replace(/[^\S\n]+/g, " ");
  }

  slug = slug.replace(/[\s_]+/g, " ").trim();

  if (caseOpt === "lowercase") slug = slug.toLowerCase();
  else if (caseOpt === "uppercase") slug = slug.toUpperCase();

  slug = slug.replace(/\s+/g, separator);

  slug = slug.replace(new RegExp(`${separator}{2,}`), separator);
  slug = slug.replace(new RegExp(`^${separator}|${separator}$`), "");

  if (maxLength > 0 && slug.length > maxLength) {
    const truncated = slug.slice(0, maxLength);
    const lastSep = truncated.lastIndexOf(separator);
    if (lastSep > 0) {
      slug = truncated.slice(0, lastSep);
    } else {
      slug = truncated;
    }
  }

  if (prefix) slug = prefix + separator + slug;
  if (suffix) slug = slug + separator + suffix;

  if (numbered && slug) {
    let counter = 1;
    let candidate = slug;
    while (history.includes(candidate)) {
      candidate = `${slug}${separator}${counter}`;
      counter++;
    }
    slug = candidate;
  }

  if (!slug) {
    const rand = Math.random().toString(36).substring(2, 8);
    slug = `slug-${rand}`;
  }

  return slug;
}

const SEPARATORS: { id: Separator; label: string }[] = [
  { id: "-", label: "Hyphen (-)" },
  { id: "_", label: "Underscore (_)" },
  { id: "~", label: "Tilde (~)" },
  { id: ".", label: "Dot (.)" },
];

export function SlugGenerator() {
  const [input, setInput] = useState("Hello World! This is a URL Slug Example");
  const [separator, setSeparator] = useState<Separator>("-");
  const [caseOpt, setCaseOpt] = useState<CaseOption>("lowercase");
  const [sanitizeMode, setSanitizeMode] = useState<SanitizeMode>("full");
  const [maxLength, setMaxLength] = useState(60);
  const [prefix, setPrefix] = useState("");
  const [suffix, setSuffix] = useState("");
  const [numbered, setNumbered] = useState(false);
  const [removeStopWords, setRemoveStopWords] = useState(false);
  const [copied, setCopied] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const [debouncedInput, setDebouncedInput] = useState(input);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedInput(input), 150);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [input]);

  const slug = useMemo(() => {
    return generateSlug(debouncedInput, separator, caseOpt, sanitizeMode, maxLength, prefix, suffix, numbered, [], removeStopWords);
  }, [debouncedInput, separator, caseOpt, sanitizeMode, maxLength, prefix, suffix, numbered, removeStopWords]);

  const [history, setHistory] = useState<string[]>([]);

  const copy = async () => {
    await navigator.clipboard.writeText(slug);
    setCopied(true);
    setHistory((prev) => [slug, ...prev.filter((h) => h !== slug)].slice(0, 20));
    setTimeout(() => setCopied(false), 2000);
  };

  const clearHistory = () => setHistory([]);

  const hasSpecialChars = useMemo(() => {
    return hasKorean(input) || hasJapanese(input) || hasChinese(input) || hasArabic(input) || hasCyrillic(input) || /[^\x00-\x7F]/.test(input);
  }, [input]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Input Text</label>
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
          placeholder="Enter text to slugify..."
          className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted" />
        {hasSpecialChars && (
          <p className="text-xs text-amber-500 mt-1">Non-ASCII characters detected (transliteration will be applied)</p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-surface-600 dark:text-dark-muted">Separator:</label>
          <select value={separator} onChange={(e) => setSeparator(e.target.value as Separator)}
            className="rounded-lg border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 focus:outline-none focus:ring-1 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            {SEPARATORS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-surface-600 dark:text-dark-muted">Case:</label>
          <select value={caseOpt} onChange={(e) => setCaseOpt(e.target.value as CaseOption)}
            className="rounded-lg border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 focus:outline-none focus:ring-1 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value="lowercase">Lowercase</option>
            <option value="uppercase">Uppercase</option>
            <option value="original">Original</option>
          </select>
        </div>
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-surface-600 dark:text-dark-muted">Sanitize:</label>
          <select value={sanitizeMode} onChange={(e) => setSanitizeMode(e.target.value as SanitizeMode)}
            className="rounded-lg border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 focus:outline-none focus:ring-1 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value="full">Full (remove special chars)</option>
            <option value="spaces-only">Spaces only</option>
          </select>
        </div>
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-surface-600 dark:text-dark-muted">Max Length:</label>
          <input type="number" min={0} max={200} value={maxLength} onChange={(e) => setMaxLength(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-14 rounded-lg border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 focus:outline-none focus:ring-1 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
        </div>
        <label className="flex items-center gap-1.5 text-xs text-surface-700 dark:text-dark-text cursor-pointer select-none">
          <input type="checkbox" checked={numbered} onChange={(e) => setNumbered(e.target.checked)} className="accent-brand-500 rounded" />
          Numbered
        </label>
        <label className="flex items-center gap-1.5 text-xs text-surface-700 dark:text-dark-text cursor-pointer select-none">
          <input type="checkbox" checked={removeStopWords} onChange={(e) => setRemoveStopWords(e.target.checked)} className="accent-brand-500 rounded" />
          Remove stop words
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-surface-600 dark:text-dark-muted">Prefix:</label>
          <input type="text" value={prefix} onChange={(e) => setPrefix(e.target.value)} placeholder="(optional)"
            className="w-24 rounded-lg border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 focus:outline-none focus:ring-1 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
        </div>
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-surface-600 dark:text-dark-muted">Suffix:</label>
          <input type="text" value={suffix} onChange={(e) => setSuffix(e.target.value)} placeholder="(optional)"
            className="w-24 rounded-lg border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 focus:outline-none focus:ring-1 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
        </div>
        <div className="flex-1" />
        <button onClick={copy} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors">
          {copied ? "Copied!" : "Copy Slug"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">Original Text</label>
          <div className="rounded-lg border border-surface-200 bg-surface-50 p-3 text-sm text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text break-all min-h-[2.5rem]">
            {input || <span className="text-surface-400 italic">(empty)</span>}
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">Generated Slug</label>
          <div data-testid="tool-output" className="rounded-lg border border-brand-200 bg-brand-50 p-3 text-sm font-mono text-brand-800 dark:border-brand-700 dark:bg-brand-900/20 dark:text-brand-300 break-all select-all min-h-[2.5rem]">
            {slug}
          </div>
        </div>
      </div>

      <div className="flex gap-2 text-xs text-surface-500 dark:text-dark-muted">
        <span>Length: <strong className="text-surface-700 dark:text-dark-text">{slug.length}</strong> chars</span>
        <span>Original: <strong className="text-surface-700 dark:text-dark-text">{input.length}</strong> chars</span>
      </div>

      {history.length > 1 && (
        <div className="border-t border-surface-200 dark:border-dark-border pt-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-surface-500 dark:text-dark-muted">History</p>
            <button onClick={clearHistory} className="text-[10px] text-surface-400 hover:text-surface-600 dark:text-dark-muted dark:hover:text-dark-text">Clear</button>
          </div>
          <div className="max-h-24 overflow-y-auto space-y-0.5">
            {history.slice(0, 10).map((h, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-surface-500 dark:text-dark-muted">
                <span className="text-surface-300 dark:text-dark-muted w-4 text-right">{i + 1}.</span>
                <code className="font-mono text-surface-700 dark:text-dark-text truncate">{h}</code>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
