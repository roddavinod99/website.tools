"use client";

import { useState, useCallback, useEffect, useRef } from "react";

const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const DIGITS = "0123456789";
const SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?/~`";
const AMBIGUOUS = "O0I1l|!";
const SIMILAR = "O0I1l|";
const SYLLABLES = [
  "ba", "be", "bi", "bo", "bu", "ca", "ce", "ci", "co", "cu",
  "da", "de", "di", "do", "du", "fa", "fe", "fi", "fo", "fu",
  "ga", "ge", "gi", "go", "gu", "ha", "he", "hi", "ho", "hu",
  "ja", "je", "ji", "jo", "ju", "ka", "ke", "ki", "ko", "ku",
  "la", "le", "li", "lo", "lu", "ma", "me", "mi", "mo", "mu",
  "na", "ne", "ni", "no", "nu", "pa", "pe", "pi", "po", "pu",
  "ra", "re", "ri", "ro", "ru", "sa", "se", "si", "so", "su",
  "ta", "te", "ti", "to", "tu", "va", "ve", "vi", "vo", "vu",
  "xa", "xe", "xi", "xo", "xu", "za", "ze", "zi", "zo", "zu",
];

function getStrength(password: string): { label: string; color: string; score: number } {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;
  if (password.length >= 24) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  if (password.length >= 32) score += 1;
  if (score <= 2) return { label: "Weak", color: "bg-red-500", score: 1 };
  if (score <= 3) return { label: "Fair", color: "bg-orange-500", score: 2 };
  if (score <= 5) return { label: "Good", color: "bg-yellow-500", score: 3 };
  if (score <= 6) return { label: "Strong", color: "bg-lime-500", score: 4 };
  return { label: "Very Strong", color: "bg-green-500", score: 5 };
}

function calcEntropy(charsetSize: number, length: number): number {
  if (!charsetSize || !length) return 0;
  return length * Math.log2(charsetSize);
}

function timeToCrack(entropy: number): string {
  const guessesPerSecond = 1e12;
  const seconds = Math.pow(2, entropy) / guessesPerSecond;
  if (seconds < 1) return "Instant";
  if (seconds < 60) return `About ${Math.round(seconds)} seconds`;
  if (seconds < 3600) return `About ${Math.round(seconds / 60)} minutes`;
  if (seconds < 86400) return `About ${Math.round(seconds / 3600)} hours`;
  if (seconds < 31536000) return `About ${Math.round(seconds / 86400)} days`;
  if (seconds < 315360000) return `About ${Math.round(seconds / 31536000)} years`;
  if (seconds < 3153600000) return `About ${Math.round(seconds / 31536000 / 10)} decades`;
  if (seconds < 31536000000) return `About ${Math.round(seconds / 31536000 / 100)} centuries`;
  return "Centuries+";
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateOne(
  length: number,
  upper: boolean, lower: boolean, nums: boolean, syms: boolean,
  excludeAmbiguous: boolean, excludeSimilar: boolean, noDupes: boolean, customSet: string,
  pronounceable: boolean, pinMode: boolean,
): string {
  if (pinMode) {
    let result = "";
    const arr = new Uint32Array(length);
    crypto.getRandomValues(arr);
    for (let i = 0; i < length; i++) result += DIGITS[arr[i] % 10];
    return result;
  }

  if (pronounceable) {
    const needed = Math.ceil(length / 2);
    const selected: string[] = [];
    const arr = new Uint32Array(needed);
    crypto.getRandomValues(arr);
    for (let i = 0; i < needed; i++) {
      let syl = SYLLABLES[arr[i] % SYLLABLES.length];
      if (upper && i === 0) syl = syl.charAt(0).toUpperCase() + syl.slice(1);
      selected.push(syl);
    }
    let result = selected.join("").slice(0, length);
    if (nums) {
      const pos = result.length;
      const digit = "0123456789"[crypto.getRandomValues(new Uint32Array(1))[0] % 10];
      if (pos > 0) result = result.slice(0, pos - 1) + digit;
    }
    if (syms) {
      result += SYMBOLS[crypto.getRandomValues(new Uint32Array(1))[0] % SYMBOLS.length];
    }
    return result;
  }

  let chars = customSet || "";
  if (!chars) {
    if (upper) chars += UPPERCASE;
    if (lower) chars += LOWERCASE;
    if (nums) chars += DIGITS;
    if (syms) chars += SYMBOLS;
  }
  if (excludeAmbiguous) {
    for (const ch of AMBIGUOUS) chars = chars.replaceAll(ch, "");
  }
  if (excludeSimilar) {
    for (const ch of SIMILAR) chars = chars.replaceAll(ch, "");
  }
  if (!chars) chars = LOWERCASE;

  const required: string[] = [];
  if (!customSet) {
    if (upper) required.push(UPPERCASE[crypto.getRandomValues(new Uint32Array(1))[0] % 26]);
    if (lower) required.push(LOWERCASE[crypto.getRandomValues(new Uint32Array(1))[0] % 26]);
    if (nums) required.push(DIGITS[crypto.getRandomValues(new Uint32Array(1))[0] % 10]);
    if (syms) required.push(SYMBOLS[crypto.getRandomValues(new Uint32Array(1))[0] % SYMBOLS.length]);
  }

  const pool = noDupes ? [...new Set(chars.split(""))] : chars.split("");
  const remaining = length - required.length;
  const filled: string[] = [];
  const limit = Math.floor(0x100000000 / pool.length) * pool.length;
  const buf = new Uint32Array(Math.max(remaining, 0));
  crypto.getRandomValues(buf);
  for (let i = 0; i < remaining; i++) {
    if (buf[i] < limit) {
      filled.push(pool[buf[i] % pool.length]);
    } else {
      const single = new Uint32Array(1);
      crypto.getRandomValues(single);
      filled.push(pool[single[0] % pool.length]);
    }
  }

  const combined = shuffleArray([...required, ...filled]);
  return combined.join("");
}

export function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [lengthInput, setLengthInput] = useState("16");
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
  const [excludeSimilar, setExcludeSimilar] = useState(false);
  const [noDupes, setNoDupes] = useState(false);
  const [pronounceable, setPronounceable] = useState(false);
  const [pinMode, setPinMode] = useState(false);
  const [customSet, setCustomSet] = useState("");
  const [count, setCount] = useState(1);
  const [passwords, setPasswords] = useState<string[]>(() => [generateOne(16, true, true, true, false, false, false, false, "", false, false)]);
  const [history, setHistory] = useState<string[]>(() => [generateOne(16, true, true, true, false, false, false, false, "", false, false)]);
  const [copiedIdx, setCopiedIdx] = useState(-1);
  const [showHistory, setShowHistory] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const generate = useCallback(() => {
    const pwds: string[] = [];
    for (let i = 0; i < count; i++) {
      pwds.push(generateOne(length, uppercase, lowercase, numbers, symbols, excludeAmbiguous, excludeSimilar, noDupes, customSet, pronounceable, pinMode));
    }
    setPasswords(pwds);
    setHistory((prev) => {
      const next = [...pwds, ...prev];
      return next.slice(0, 20);
    });
  }, [length, uppercase, lowercase, numbers, symbols, excludeAmbiguous, excludeSimilar, noDupes, customSet, pronounceable, pinMode, count]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter" && document.activeElement?.tagName !== "TEXTAREA") {
        generate();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [generate]);

  const copyOne = async (pw: string, idx: number) => {
    await navigator.clipboard.writeText(pw);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(-1), 5000);
  };

  const handleLengthSlider = (val: number) => {
    const v = pinMode ? Math.min(16, Math.max(4, val)) : Math.min(128, Math.max(4, val));
    setLength(v);
    setLengthInput(String(v));
  };

  const handleLengthInput = (val: string) => {
    setLengthInput(val);
    const n = parseInt(val, 10);
    if (!isNaN(n)) {
      const clamped = pinMode ? Math.min(16, Math.max(4, n)) : Math.min(128, Math.max(4, n));
      setLength(clamped);
    }
  };

  const handleRestore = (pw: string) => {
    setPasswords([pw]);
  };

  const downloadTxt = () => {
    const content = passwords.join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "passwords.txt"; a.click();
    URL.revokeObjectURL(url);
  };

  const maxLen = pinMode ? 16 : 128;
  const minLen = 4;

  let charsetDisplay = "";
  let charsetSize = 0;
  if (pinMode) { charsetDisplay = "0-9"; charsetSize = 10; }
  else if (pronounceable) { charsetDisplay = "Syllables"; charsetSize = 0; }
  else if (customSet) { charsetDisplay = customSet; charsetSize = new Set(customSet).size; }
  else {
    if (uppercase) { charsetDisplay += "A-Z "; charsetSize += 26; }
    if (lowercase) { charsetDisplay += "a-z "; charsetSize += 26; }
    if (numbers) { charsetDisplay += "0-9 "; charsetSize += 10; }
    if (symbols) { charsetDisplay += "!@#$... "; charsetSize += SYMBOLS.length; }
    if (excludeAmbiguous || excludeSimilar) {
      let filtered = charsetDisplay.replace(/ /g, "");
      if (excludeAmbiguous) for (const ch of AMBIGUOUS) filtered = filtered.replaceAll(ch, "");
      if (excludeSimilar) for (const ch of SIMILAR) filtered = filtered.replaceAll(ch, "");
      charsetSize = new Set(filtered.split("")).size;
    }
  }

  const strength = passwords.length === 1 ? getStrength(passwords[0]) : null;
  const entropy = passwords.length === 1 ? calcEntropy(charsetSize, passwords[0].length) : null;
  const crackTime = passwords.length === 1 && entropy ? timeToCrack(entropy) : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-surface-700 dark:text-dark-text whitespace-nowrap">Length:</label>
          <input
            type="range" min={minLen} max={maxLen} value={length}
            onChange={(e) => handleLengthSlider(parseInt(e.target.value))}
            className="w-28 accent-brand-500"
          />
          <input
            ref={inputRef}
            type="number" min={minLen} max={maxLen} value={lengthInput}
            onChange={(e) => handleLengthInput(e.target.value)}
            className="w-16 rounded-lg border border-surface-200 bg-white px-2 py-1 text-sm text-surface-900 text-center focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-surface-700 dark:text-dark-text whitespace-nowrap">Count:</label>
          <input
            type="number" min={1} max={50} value={count}
            onChange={(e) => setCount(Math.min(50, Math.max(1, parseInt(e.target.value) || 1)))}
            className="w-16 rounded-lg border border-surface-200 bg-white px-2 py-1 text-sm text-surface-900 text-center focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "A-Z", checked: uppercase, set: setUppercase, disabled: pinMode },
          { label: "a-z", checked: lowercase, set: setLowercase, disabled: pinMode || pronounceable },
          { label: "0-9", checked: numbers, set: setNumbers, disabled: pinMode },
          { label: "!@#$%", checked: symbols, set: setSymbols, disabled: pinMode },
        ].map((opt) => (
          <label key={opt.label} className="flex items-center gap-2 text-sm text-surface-700 dark:text-dark-text">
            <input type="checkbox" checked={opt.checked} onChange={(e) => opt.set(e.target.checked)} disabled={opt.disabled} className="accent-brand-500 disabled:opacity-40" />
            {opt.label}
          </label>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <label className="flex items-center gap-2 text-sm text-surface-700 dark:text-dark-text">
          <input type="checkbox" checked={excludeAmbiguous} onChange={(e) => setExcludeAmbiguous(e.target.checked)} className="accent-brand-500" />
          Exclude Ambiguous (O/0/I/1/l/|/!)
        </label>
        <label className="flex items-center gap-2 text-sm text-surface-700 dark:text-dark-text">
          <input type="checkbox" checked={excludeSimilar} onChange={(e) => setExcludeSimilar(e.target.checked)} className="accent-brand-500" />
          Exclude Similar (O/0/I/1/l/|)
        </label>
        <label className="flex items-center gap-2 text-sm text-surface-700 dark:text-dark-text">
          <input type="checkbox" checked={noDupes} onChange={(e) => setNoDupes(e.target.checked)} className="accent-brand-500" />
          No Duplicate Chars
        </label>
        <label className="flex items-center gap-2 text-sm text-surface-700 dark:text-dark-text">
          <input type="checkbox" checked={pronounceable} onChange={(e) => { setPronounceable(e.target.checked); if (e.target.checked) setPinMode(false); }} className="accent-brand-500" />
          Pronounceable
        </label>
        <label className="flex items-center gap-2 text-sm text-surface-700 dark:text-dark-text">
          <input type="checkbox" checked={pinMode} onChange={(e) => { setPinMode(e.target.checked); if (e.target.checked) { setPronounceable(false); if (length > 16) setLength(8); } }} className="accent-brand-500" />
          PIN Mode
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Custom Character Set (overrides selections)</label>
        <input
          type="text" value={customSet} onChange={(e) => setCustomSet(e.target.value)} placeholder="e.g. ABCabc123"
          className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm font-mono text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text"
        />
        {charsetDisplay && !pronounceable && !pinMode && (
          <p className="mt-1 text-xs text-surface-500 dark:text-dark-muted">Chars: {charsetSize} &mdash; {charsetDisplay.trim()}</p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={generate} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors">Generate</button>
        {passwords.length > 0 && (
          <>
            <button onClick={() => copyOne(count === 1 ? passwords[0] : passwords.join("\n"), -2)} className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors">
              {copiedIdx === -2 ? "Copied!" : "Copy All"}
            </button>
            <button onClick={downloadTxt} className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors">Download .txt</button>
          </>
        )}
        <button onClick={() => setShowHistory(!showHistory)} className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors">
          History ({history.length})
        </button>
      </div>

      {strength && (
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 rounded-full bg-surface-200 dark:bg-dark-border overflow-hidden">
            <div className={`h-full rounded-full transition-all ${strength.color}`} style={{ width: `${(strength.score / 5) * 100}%` }} />
          </div>
          <span className="text-xs font-medium text-surface-600 dark:text-dark-muted whitespace-nowrap">{strength.label}</span>
          {entropy !== null && (
            <span className="text-xs font-mono text-surface-500 dark:text-dark-muted whitespace-nowrap">{entropy.toFixed(1)} bits</span>
          )}
        </div>
      )}

      {crackTime && (
        <p className="text-xs text-surface-500 dark:text-dark-muted">Time to crack (1T guesses/s): {crackTime}</p>
      )}

      {passwords.length > 0 && (
        <div className="space-y-2">
          {passwords.map((pw, i) => (
            <div key={i} className="flex items-center gap-2 rounded-lg border border-surface-200 bg-surface-50 p-3 dark:border-dark-border dark:bg-dark-surface">
              <code className="flex-1 text-sm font-mono text-surface-900 dark:text-dark-text select-all break-all">{pw}</code>
              <button onClick={() => copyOne(pw, i)} className="text-xs text-brand-500 hover:text-brand-600 whitespace-nowrap">
                {copiedIdx === i ? "Copied!" : "Copy"}
              </button>
            </div>
          ))}
        </div>
      )}

      {showHistory && history.length > 0 && (
        <div>
          <p className="text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">Password History (click to restore)</p>
          <div className="max-h-36 overflow-y-auto space-y-1">
            {history.map((pw, i) => (
              <button key={i} onClick={() => handleRestore(pw)} className="w-full text-left rounded border border-surface-100 bg-white px-3 py-1.5 text-xs font-mono text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:hover:bg-dark-border transition-colors truncate">
                {pw}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
