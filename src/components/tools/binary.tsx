"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";

type Mode = "encode" | "decode";
type OutputStyle = "space" | "continuous";
type BitMode = "7bit" | "8bit";

function textToBinary(str: string, outputStyle: OutputStyle, bitMode: BitMode): string {
  const bits = bitMode === "7bit" ? 7 : 8;
  return str.split("").map((char) => {
    let code = char.charCodeAt(0);
    if (bitMode === "7bit") code &= 0x7f;
    return code.toString(2).padStart(bits, "0");
  }).join(outputStyle === "space" ? " " : "");
}

function binaryToText(bin: string, bitMode: BitMode): string {
  const cleaned = bin.replace(/[^01]/g, "");
  if (!cleaned) throw new Error("No valid binary digits found");
  const bits = bitMode === "7bit" ? 7 : 8;
  if (cleaned.length % bits !== 0) {
    throw new Error(`Binary length (${cleaned.length}) is not a multiple of ${bits} bits`);
  }
  const chars: number[] = [];
  for (let i = 0; i < cleaned.length; i += bits) {
    const byte = cleaned.slice(i, i + bits);
    chars.push(parseInt(byte, 2));
  }
  return String.fromCharCode(...chars);
}

function charToHex(c: string): string {
  return c.charCodeAt(0).toString(16).padStart(2, "0");
}

function charToOctal(c: string): string {
  return c.charCodeAt(0).toString(8).padStart(3, "0");
}

export function Binary() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState<Mode>("encode");
  const [outputStyle, setOutputStyle] = useState<OutputStyle>("space");
  const [bitMode, setBitMode] = useState<BitMode>("8bit");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const convert = useCallback(() => {
    setError("");
    if (!input.trim()) { setOutput(""); return; }
    try {
      if (mode === "encode") {
        setOutput(textToBinary(input, outputStyle, bitMode));
      } else {
        setOutput(binaryToText(input, bitMode));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Conversion failed");
      setOutput("");
    }
  }, [input, mode, outputStyle, bitMode]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(convert, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [convert]);

  const copy = async () => { if (output) await navigator.clipboard.writeText(output); };

  const charMap = useMemo(() => {
    if (mode !== "encode" || !input) return [];
    return input.split("").map((char) => ({
      char,
      code: char.charCodeAt(0),
      binary: char.charCodeAt(0).toString(2).padStart(bitMode === "7bit" ? 7 : 8, "0"),
      hex: charToHex(char),
      octal: charToOctal(char),
    }));
  }, [input, mode, bitMode]);

  const bitLength = useMemo(() => {
    if (!output) return 0;
    return output.replace(/\s/g, "").length;
  }, [output]);

  const handleFileConvert = useCallback(() => {
    const inputEl = document.createElement("input");
    inputEl.type = "file";
    inputEl.onchange = () => {
      const file = inputEl.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const arrayBuffer = reader.result as ArrayBuffer;
        const bytes = new Uint8Array(arrayBuffer);
        const bits = bitMode === "7bit" ? 7 : 8;
        const binaryStr = Array.from(bytes).map((b) => {
          const val = bitMode === "7bit" ? b & 0x7f : b;
          return val.toString(2).padStart(bits, "0");
        }).join(outputStyle === "space" ? " " : "");
        setInput(`[File: ${file.name}]`);
        setOutput(binaryStr);
      };
      reader.readAsArrayBuffer(file);
    };
    inputEl.click();
  }, [bitMode, outputStyle]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(["encode", "decode"] as Mode[]).map((m) => (
          <button key={m} onClick={() => { setMode(m); setError(""); }}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${mode === m ? "bg-brand-500 text-white" : "border border-surface-200 text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface"}`}>
            {m === "encode" ? "Text to Binary" : "Binary to Text"}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {(["space", "continuous"] as OutputStyle[]).map((s) => (
          <button key={s} onClick={() => setOutputStyle(s)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${outputStyle === s ? "bg-brand-500 text-white" : "border border-surface-200 text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface"}`}>
            {s === "space" ? "Space-separated" : "Continuous"}
          </button>
        ))}
        {(["7bit", "8bit"] as BitMode[]).map((b) => (
          <button key={b} onClick={() => setBitMode(b)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${bitMode === b ? "bg-brand-500 text-white" : "border border-surface-200 text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface"}`}>
            {b === "7bit" ? "7-bit ASCII" : "8-bit Byte"}
          </button>
        ))}
        {mode === "encode" && (
          <button onClick={handleFileConvert} className="rounded-lg border border-surface-200 px-3 py-1.5 text-xs font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface">
            File to Binary
          </button>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">
          {mode === "encode" ? "Text Input" : "Binary Input"}
        </label>
        <textarea value={input} onChange={(e) => setInput(e.target.value)}
          placeholder={mode === "encode" ? "Hello" : "01001000 01101001"}
          rows={4} spellCheck={false}
          className="w-full rounded-lg border border-surface-200 bg-white p-3 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted" />
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {output && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-surface-700 dark:text-dark-text">Output</label>
            <button onClick={copy} className="rounded bg-brand-500 px-2 py-0.5 text-xs text-white hover:bg-brand-600">Copy</button>
          </div>
          <pre className="w-full rounded-lg border border-surface-200 bg-surface-50 p-3 text-sm font-mono text-surface-900 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text overflow-auto max-h-60 break-all select-all">{output}</pre>
        </div>
      )}

      {output && (
        <div className="flex gap-3 text-xs text-surface-500 dark:text-dark-muted">
          <span>Bit length: {bitLength}</span>
          <span>Byte length: {Math.ceil(bitLength / parseInt(bitMode))}</span>
        </div>
      )}

      {charMap.length > 0 && (
        <div>
          <p className="text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">Character Breakdown</p>
          <div className="max-h-48 overflow-y-auto rounded-lg border border-surface-200 dark:border-dark-border">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="bg-surface-50 text-surface-500 dark:bg-dark-surface dark:text-dark-muted">
                  <th className="px-2 py-1 text-left">Char</th>
                  <th className="px-2 py-1 text-left">Code</th>
                  <th className="px-2 py-1 text-left">Binary</th>
                  <th className="px-2 py-1 text-left">Hex</th>
                  <th className="px-2 py-1 text-left">Octal</th>
                </tr>
              </thead>
              <tbody>
                {charMap.map((entry, i) => (
                  <tr key={i} className="border-t border-surface-100 text-surface-700 dark:border-dark-border dark:text-dark-text hover:bg-surface-50 dark:hover:bg-dark-surface">
                    <td className="px-2 py-1">{entry.char === " " ? "␣" : entry.char}</td>
                    <td className="px-2 py-1 text-surface-400">{entry.code}</td>
                    <td className="px-2 py-1 text-brand-500">{entry.binary}</td>
                    <td className="px-2 py-1">{entry.hex}</td>
                    <td className="px-2 py-1">{entry.octal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
