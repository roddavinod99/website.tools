"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";

const MORSE_MAP: Record<string, string> = {
  "A": ".-", "B": "-...", "C": "-.-.", "D": "-..", "E": ".",
  "F": "..-.", "G": "--.", "H": "....", "I": "..", "J": ".---",
  "K": "-.-", "L": ".-..", "M": "--", "N": "-.", "O": "---",
  "P": ".--.", "Q": "--.-", "R": ".-.", "S": "...", "T": "-",
  "U": "..-", "V": "...-", "W": ".--", "X": "-..-", "Y": "-.--",
  "Z": "--..", "0": "-----", "1": ".----", "2": "..---", "3": "...--",
  "4": "....-", "5": ".....", "6": "-....", "7": "--...", "8": "---..",
  "9": "----.", ".": ".-.-.-", ",": "--..--", "?": "..--..", "'": ".----.",
  "!": "-.-.--", "/": "-..-.", "(": "-.--.", ")": "-.--.-", "&": ".-...",
  ":": "---...", ";": "-.-.-.", "=": "-...-", "+": ".-.-.", "-": "-....-",
  "_": "..--.-", "\"": ".-..-.", "$": "...-..-", "@": ".--.-.",
  " ": "/",
};

const REVERSE_MORSE: Record<string, string> = {};
for (const [char, code] of Object.entries(MORSE_MAP)) {
  REVERSE_MORSE[code] = char;
}

function isAlphaNumOrPunct(c: string): boolean {
  return /^[a-zA-Z0-9 .,?'!/():;&"=+\-_@$]$/.test(c);
}

export function MorseCode() {
  const [input, setInput] = useState("SOS");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const audioCtxRef = useRef<AudioContext | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const outputResult = useMemo(() => {
    try {
      if (!input.trim()) return { output: "", error: "" };
      if (mode === "encode") {
        const result = input.toUpperCase().split("").map((c) => {
          if (c === " ") return MORSE_MAP[" "] || "/";
          if (MORSE_MAP[c]) return MORSE_MAP[c];
          if (isAlphaNumOrPunct(c)) return MORSE_MAP[c] || "?";
          return "";
        }).filter(Boolean).join(" ");
        return { output: result, error: "" };
      } else {
        const words = input.trim().split(/\s{2,}|\/\s*/);
        const result = words.map((word) => {
          return word.split(/\s+/).map((code) => REVERSE_MORSE[code] || "?").join("");
        }).join(" ");
        return { output: result, error: "" };
      }
    } catch (e) {
      return { output: "", error: (e as Error).message };
    }
  }, [input, mode]);

  const output = outputResult.output;
  const error = outputResult.error || uploadError;

  const stats = useMemo(() => {
    if (mode !== "encode" || !output) return null;
    const dots = (output.match(/\./g) || []).length;
    const dashes = (output.match(/-/g) || []).length;
    const spaces = (output.match(/\//g) || []).length;
    const letters = output.split(/\s+/).filter(Boolean).length;
    return { dots, dashes, spaces, letters };
  }, [output, mode]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [output]);

  const handleClear = useCallback(() => { setInput(""); setUploadError(""); }, []);

  const download = useCallback(() => {
    const ext = mode === "encode" ? "morse" : "txt";
    const a = document.createElement("a");
    a.href = "data:text/plain;charset=utf-8," + encodeURIComponent(output);
    a.download = `output.${ext}`;
    a.click();
  }, [output, mode]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setUploadError("File too large (max 10MB)"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setInput(text);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const playMorse = useCallback(() => {
    if (!output || isPlaying) return;
    setIsPlaying(true);
    const AudioCtx = window.AudioContext || (window as unknown as Record<string, unknown>).webkitAudioContext;
    if (!AudioCtx) { setIsPlaying(false); return; }
    const ctx = new (AudioCtx as typeof AudioContext)();
    audioCtxRef.current = ctx;

    const dotDuration = 0.1;
    const freq = 700;
    const symbols = output.split("").filter((c) => c === "." || c === "-" || c === " " || c === "/");
    let currentTime = ctx.currentTime;

    for (const sym of symbols) {
      if (sym === ".") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = freq;
        osc.type = "sine";
        gain.gain.setValueAtTime(0.5, currentTime);
        gain.gain.setValueAtTime(0, currentTime + dotDuration);
        osc.connect(gain).connect(ctx.destination);
        osc.start(currentTime);
        osc.stop(currentTime + dotDuration);
        currentTime += dotDuration * 1.5;
      } else if (sym === "-") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = freq;
        osc.type = "sine";
        gain.gain.setValueAtTime(0.5, currentTime);
        gain.gain.setValueAtTime(0, currentTime + dotDuration * 3);
        osc.connect(gain).connect(ctx.destination);
        osc.start(currentTime);
        osc.stop(currentTime + dotDuration * 3);
        currentTime += dotDuration * 3.5;
      } else if (sym === " ") {
        currentTime += dotDuration;
      } else if (sym === "/") {
        currentTime += dotDuration * 3;
      }
    }

    setTimeout(() => {
      ctx.close();
      audioCtxRef.current = null;
      setIsPlaying(false);
    }, (currentTime - ctx.currentTime) * 1000 + 200);
  }, [output, isPlaying]);

  useEffect(() => {
    return () => {
      audioCtxRef.current?.close();
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 rounded-lg border border-surface-200 p-1 dark:border-dark-border">
          <button onClick={() => setMode("encode")} className={`px-3 py-1.5 text-sm rounded-md transition-colors ${mode === "encode" ? "bg-brand-500 text-white" : "text-surface-600 hover:bg-surface-100 dark:text-dark-muted dark:hover:bg-dark-surface"}`}>Encode Text → Morse</button>
          <button onClick={() => setMode("decode")} className={`px-3 py-1.5 text-sm rounded-md transition-colors ${mode === "decode" ? "bg-brand-500 text-white" : "text-surface-600 hover:bg-surface-100 dark:text-dark-muted dark:hover:bg-dark-surface"}`}>Decode Morse → Text</button>
        </div>
        <button onClick={handleClear} className="rounded-lg border border-surface-200 px-3 py-1.5 text-sm text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface">Clear</button>
        <input ref={fileInputRef} type="file" accept={mode === "encode" ? ".txt" : ".morse,.txt"} onChange={handleFileUpload} className="hidden" />
        <button onClick={() => fileInputRef.current?.click()} className="rounded-lg border border-surface-200 px-3 py-1.5 text-sm text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface">Upload File</button>
      </div>

      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">
          {mode === "encode" ? "Plain Text" : "Morse Code"}
        </label>
        <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={4}
          placeholder={mode === "encode" ? "Enter text to encode..." : "Enter morse code (use . - and space between letters, / between words)..."}
          className="w-full rounded-lg border border-surface-200 bg-white p-3 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {output && (
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">
            {mode === "encode" ? "Morse Code" : "Decoded Text"}
          </label>
          <div className="relative">
            <pre className="rounded-lg border border-surface-200 bg-surface-50 p-3 text-sm font-mono text-surface-900 overflow-auto max-h-40 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text whitespace-pre-wrap break-all">{output}</pre>
            <div className="absolute top-2 right-2 flex gap-1">
              <button onClick={handleCopy} className="rounded bg-brand-500 px-2 py-1 text-xs text-white hover:bg-brand-600" aria-label="Copy output">{copied ? "Copied!" : "Copy"}</button>
              <button onClick={download} className="rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" aria-label="Download output">Download</button>
              {mode === "encode" && (
                <button onClick={playMorse} disabled={isPlaying} className="rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 hover:bg-surface-50 disabled:opacity-40 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" aria-label="Play morse code">{isPlaying ? "Playing..." : "Play"}</button>
              )}
            </div>
          </div>

          {stats && (
            <div className="mt-2 flex flex-wrap gap-3 text-xs text-surface-500 dark:text-dark-muted">
              <span>Dots: {stats.dots}</span>
              <span>Dashes: {stats.dashes}</span>
              <span>Word separators: {stats.spaces}</span>
              <span>Letters encoded: {stats.letters}</span>
              <span>Total length: {output.length} chars</span>
            </div>
          )}
        </div>
      )}

      {!input.trim() && (
        <p className="text-center text-sm text-surface-400 dark:text-dark-muted py-8">
          {mode === "encode" ? "Enter text to convert to Morse code" : "Enter Morse code to convert to text"}
        </p>
      )}
    </div>
  );
}
