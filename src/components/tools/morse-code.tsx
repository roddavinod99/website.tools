"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";

const morseMap: Record<string, string> = {
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.", H: "....",
  I: "..", J: ".---", K: "-.-", L: ".-..", M: "--", N: "-.", O: "---", P: ".--.",
  Q: "--.-", R: ".-.", S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-",
  Y: "-.--", Z: "--..", "0": "-----", "1": ".----", "2": "..---", "3": "...--",
  "4": "....-", "5": ".....", "6": "-....", "7": "--...", "8": "---..", "9": "----.",
  ".": ".-.-.-", ",": "--..--", "?": "..--..", "'": ".----.", "!": "-.-.--",
  "/": "-..-.", "(": "-.--.", ")": "-.--.-", "&": ".-...", ":": "---...",
  ";": "-.-.-.", "=": "-...-", "+": ".-.-.", "-": "-....-", "_": "..--.-",
  '"': ".-..-.", "@": ".--.-.", " ": "/",
};

const reverseMorse = Object.fromEntries(Object.entries(morseMap).map(([k, v]) => [v, k]));

const prosigns: Record<string, string> = { "SOS": "... --- ...", "AR": ".-.-.", "SK": "...-.-", "BT": "-...-", "KN": "-.--.", "VA": "...-.-" };

export function MorseCode() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"text" | "morse">("text");
  const [speed, setSpeed] = useState(20);
  const [frequency, setFrequency] = useState(600);
  const [letterSpacing, setLetterSpacing] = useState(3);
  const [wordSpacing, setWordSpacing] = useState(7);
  const [playing, setPlaying] = useState(false);
  const [, setActiveChar] = useState(-1);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<number[]>([]);

  const morseCode = useMemo(() => {
    if (mode === "morse") return input;
    return input.toUpperCase().split("").map((c) => morseMap[c] ?? "").filter(Boolean).join(" ");
  }, [input, mode]);

  const decodedText = useMemo(() => {
    if (mode === "text") return input;
    return input.split(" / ").map((word) => word.split(" ").map((s) => reverseMorse[s] ?? "?").join("")).join(" ");
  }, [input, mode]);

  const isValid = useMemo(() => {
    if (mode === "text") return true;
    return input.split(/\s+/).every((s) => !s || s in reverseMorse || s === "/");
  }, [input, mode]);

  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayText(mode === "text" ? morseCode : decodedText);
    }, 300);
    return () => clearTimeout(timer);
  }, [input, mode, morseCode, decodedText]);

  const playMorse = useCallback(() => {
    if (!input || playing) return;
    const code = (mode === "text" ? morseCode : input);
    const unit = 1200 / speed;
    const ctx = new AudioContext();
    audioCtxRef.current = ctx;
    setPlaying(true);
    const timings: number[] = [];
    let time = 0;
    for (const ch of code) {
      if (ch === ".") { timings.push(time); time += unit; timings.push(-1); time += unit; }
      else if (ch === "-") { timings.push(time); time += unit * 3; timings.push(-1); time += unit; }
      else if (ch === " ") { time += unit * letterSpacing; }
      else if (ch === "/") { time += unit * wordSpacing; }
    }
    let idx = 0;
    const schedule = () => {
      if (!audioCtxRef.current || idx >= timings.length) { setPlaying(false); return; }
      const t = timings[idx]!;
      if (t >= 0) {
        setActiveChar(idx);
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = frequency;
        osc.type = "sine";
        const start = timings[idx]!;
        const end = timings[idx + 1]!;
        const duration = end - start;
        osc.start(start / 1000);
        gain.gain.setValueAtTime(0.3, start / 1000);
        gain.gain.setValueAtTime(0.3, (start + duration) / 1000);
        gain.gain.linearRampToValueAtTime(0, (start + duration + 20) / 1000);
        osc.stop((start + duration + 20) / 1000);
      }
      idx++;
      if (idx < timings.length) timerRef.current.push(window.setTimeout(schedule, 1));
      else setPlaying(false);
    };
    schedule();
  }, [input, mode, speed, frequency, letterSpacing, wordSpacing, playing, morseCode]);

  const stopPlay = () => {
    timerRef.current.forEach(clearTimeout);
    timerRef.current = [];
    audioCtxRef.current?.close();
    audioCtxRef.current = null;
    setPlaying(false);
    setActiveChar(-1);
  };

  useEffect(() => () => { stopPlay(); }, []);

  const copy = async () => { if (displayText) await navigator.clipboard.writeText(displayText); };

  const timingDiagram = useMemo(() => {
    if (!morseCode && mode === "text") return [];
    const code = mode === "text" ? morseCode : input;
    const unit = 40;
    const bars: { type: "dot" | "dash" | "space"; width: number }[] = [];
    for (const ch of code) {
      if (ch === ".") bars.push({ type: "dot", width: unit });
      else if (ch === "-") bars.push({ type: "dash", width: unit * 3 });
      else if (ch === " ") bars.push({ type: "space", width: unit * letterSpacing });
      else if (ch === "/") bars.push({ type: "space", width: unit * wordSpacing });
    }
    return bars;
  }, [input, mode, morseCode, letterSpacing, wordSpacing]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button onClick={() => setMode("text")} className={`rounded-lg px-3 py-1.5 text-xs font-medium ${mode === "text" ? "bg-brand-500 text-white" : "border border-surface-200 text-surface-700 dark:border-dark-border dark:text-dark-text"}`}>Text to Morse</button>
        <button onClick={() => setMode("morse")} className={`rounded-lg px-3 py-1.5 text-xs font-medium ${mode === "morse" ? "bg-brand-500 text-white" : "border border-surface-200 text-surface-700 dark:border-dark-border dark:text-dark-text"}`}>Morse to Text</button>
      </div>

      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">{mode === "text" ? "Input Text" : "Input Morse Code"}</label>
        <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder={mode === "text" ? "Enter text to convert..." : "Enter Morse code (use . for dot, - for dash, space between letters, / between words)..."} rows={4} className="w-full rounded-lg border border-surface-200 bg-white p-3 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
      </div>

      {!isValid && <p className="text-sm text-red-500">Invalid Morse code detected</p>}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-surface-500 dark:text-dark-muted mb-1">Speed (WPM): {speed}</label>
          <input type="range" min={5} max={40} value={speed} onChange={(e) => setSpeed(+e.target.value)} className="w-full accent-brand-500" />
        </div>
        <div>
          <label className="block text-xs text-surface-500 dark:text-dark-muted mb-1">Frequency: {frequency} Hz</label>
          <input type="range" min={400} max={1000} value={frequency} onChange={(e) => setFrequency(+e.target.value)} className="w-full accent-brand-500" />
        </div>
        <div>
          <label className="block text-xs text-surface-500 dark:text-dark-muted mb-1">Letter spacing: {letterSpacing}</label>
          <input type="range" min={1} max={7} value={letterSpacing} onChange={(e) => setLetterSpacing(+e.target.value)} className="w-full accent-brand-500" />
        </div>
        <div>
          <label className="block text-xs text-surface-500 dark:text-dark-muted mb-1">Word spacing: {wordSpacing}</label>
          <input type="range" min={3} max={15} value={wordSpacing} onChange={(e) => setWordSpacing(+e.target.value)} className="w-full accent-brand-500" />
        </div>
      </div>

      {displayText && (
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Output</label>
          <div className="flex items-start gap-2 rounded-lg border border-surface-200 bg-surface-50 p-3 dark:border-dark-border dark:bg-dark-surface">
            <code className="flex-1 text-sm font-mono text-surface-900 dark:text-dark-text break-all select-all max-h-20 overflow-auto">{displayText}</code>
            <button onClick={copy} className="text-xs text-brand-500 hover:text-brand-600 shrink-0">Copy</button>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button onClick={playMorse} disabled={!input || playing} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50 transition-colors">{playing ? "Playing..." : "Play Audio"}</button>
        {playing && <button onClick={stopPlay} className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50 dark:border-red-900 dark:text-red-400">Stop</button>}
      </div>

      {timingDiagram.length > 0 && (
        <div>
          <p className="text-sm font-medium text-surface-700 dark:text-dark-text mb-2">Timing Diagram</p>
          <div className="flex items-center gap-0.5 overflow-auto pb-2">
            {timingDiagram.map((bar, i) => (
              <div key={i} className={`shrink-0 h-6 rounded-sm ${bar.type === "dot" ? "bg-brand-500" : bar.type === "dash" ? "bg-brand-600" : "bg-transparent"}`} style={{ width: Math.max(bar.width, 2) }} />
            ))}
          </div>
        </div>
      )}

      <details className="rounded-lg border border-surface-200 p-3 dark:border-dark-border">
        <summary className="text-sm font-medium text-surface-700 dark:text-dark-text cursor-pointer">Reference Table</summary>
        <div className="mt-2 grid grid-cols-4 md:grid-cols-6 gap-1 max-h-48 overflow-auto">
          {Object.entries(morseMap).filter(([k]) => k !== " ").map(([char, code]) => (
            <div key={char} className="flex items-center gap-1 rounded bg-surface-50 px-2 py-1 dark:bg-dark-surface/50">
              <span className="text-xs font-mono font-bold text-surface-700 dark:text-dark-text">{char}</span>
              <span className="text-xs font-mono text-surface-500 dark:text-dark-muted">{code}</span>
            </div>
          ))}
        </div>
      </details>

      <details className="rounded-lg border border-surface-200 p-3 dark:border-dark-border">
        <summary className="text-sm font-medium text-surface-700 dark:text-dark-text cursor-pointer">Prosigns</summary>
        <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-1">
          {Object.entries(prosigns).map(([name, code]) => (
            <div key={name} className="rounded bg-surface-50 px-2 py-1 dark:bg-dark-surface/50">
              <span className="text-xs font-mono font-bold text-surface-700 dark:text-dark-text">{name}</span>
              <span className="text-xs font-mono text-surface-500 dark:text-dark-muted ml-2">{code}</span>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}
