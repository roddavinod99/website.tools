"use client";

import { useState, useCallback, useEffect, useRef } from "react";

const NATO: Record<string, string> = {
  A: "Alpha", B: "Bravo", C: "Charlie", D: "Delta", E: "Echo", F: "Foxtrot",
  G: "Golf", H: "Hotel", I: "India", J: "Juliet", K: "Kilo",
  L: "Lima", M: "Mike", N: "November", O: "Oscar", P: "Papa", Q: "Quebec",
  R: "Romeo", S: "Sierra", T: "Tango", U: "Uniform", V: "Victor", W: "Whiskey",
  X: "X-ray", Y: "Yankee", Z: "Zulu",
  0: "Zero", 1: "One", 2: "Two", 3: "Three", 4: "Four",
  5: "Five", 6: "Six", 7: "Seven", 8: "Eight", 9: "Niner",
};

function toNATO(text: string): string {
  return text
    .toUpperCase()
    .split("")
    .map((ch) => {
      if (NATO[ch]) return NATO[ch];
      if (ch === " ") return "—";
      return ch;
    })
    .join("\n");
}

export function NatoAlphabet() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const convert = useCallback(() => {
    if (!input.trim()) { setOutput(""); return; }
    setOutput(toNATO(input));
  }, [input]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(convert, 200);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [convert]);

  const copy = async () => { if (output) await navigator.clipboard.writeText(output); };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-surface-700 dark:text-dark-text mb-1 block">Input Text</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type text to convert..."
          rows={3}
          spellCheck={false}
          className="w-full rounded-lg border border-surface-200 bg-white p-3 font-mono text-sm dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
        />
      </div>

      {output && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-surface-700 dark:text-dark-text">NATO Phonetic</label>
            <button onClick={copy} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">Copy</button>
          </div>
          <pre className="w-full rounded-lg border border-surface-200 bg-surface-50 p-3 text-sm font-mono dark:border-dark-border dark:bg-dark-bg dark:text-dark-text overflow-auto max-h-60 select-all whitespace-pre-wrap">{output}</pre>
        </div>
      )}
    </div>
  );
}
