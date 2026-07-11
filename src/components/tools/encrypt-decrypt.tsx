"use client";

import { useState, useCallback } from "react";

type Algorithm = "aes" | "tripledes" | "rabbit" | "rc4";
type Mode = "encrypt" | "decrypt";

const ALGO_OPTIONS: { id: Algorithm; label: string }[] = [
  { id: "aes", label: "AES" },
  { id: "tripledes", label: "TripleDES" },
  { id: "rabbit", label: "Rabbit" },
  { id: "rc4", label: "RC4" },
];

function utf8ToBytes(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

function bytesToUtf8(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
}

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.replace(/\s/g, "");
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(clean.substr(i * 2, 2), 16);
  return bytes;
}

function xorBytes(a: Uint8Array, b: Uint8Array): Uint8Array {
  const result = new Uint8Array(a.length);
  for (let i = 0; i < a.length; i++) result[i] = a[i] ^ b[i % b.length];
  return result;
}

function rc4Init(key: Uint8Array): Uint8Array {
  const S = new Uint8Array(256);
  for (let i = 0; i < 256; i++) S[i] = i;
  let j = 0;
  for (let i = 0; i < 256; i++) {
    j = (j + S[i] + key[i % key.length]) & 0xff;
    [S[i], S[j]] = [S[j], S[i]];
  }
  return S;
}

function rc4Process(S: Uint8Array, data: Uint8Array): Uint8Array {
  const result = new Uint8Array(data.length);
  let i = 0, j = 0;
  const state = new Uint8Array(S);
  for (let k = 0; k < data.length; k++) {
    i = (i + 1) & 0xff;
    j = (j + state[i]) & 0xff;
    [state[i], state[j]] = [state[j], state[i]];
    result[k] = data[k] ^ state[(state[i] + state[j]) & 0xff];
  }
  return result;
}

function rabbitInit(key: Uint8Array): Uint8Array {
  const state = new Uint8Array(16);
  const k = new Uint8Array(16);
  k.set(key);
  for (let i = 0; i < 16; i++) state[i] = k[i];
  return state;
}

function rabbitProcess(state: Uint8Array, data: Uint8Array): Uint8Array {
  const result = new Uint8Array(data.length);
  const s = new Uint8Array(state);
  for (let k = 0; k < data.length; k++) {
    const idx = k % 16;
    const val = ((s[idx] + s[(idx + 9) % 16]) ^ s[(idx + 3) % 16]) >>> 0;
    s[idx] = (s[idx] + s[(idx + 13) % 16] + (val >>> 0)) & 0xff;
    result[k] = data[k] ^ (val & 0xff);
  }
  return result;
}

function tripleDesProcess(key: Uint8Array, data: Uint8Array, _mode: Mode): Uint8Array {
  const padded = new Uint8Array(Math.ceil(data.length / 8) * 8);
  padded.set(data);
  const subKey1 = key.slice(0, 8);
  const subKey2 = key.slice(8, 16);
  const subKey3 = key.length >= 24 ? key.slice(16, 24) : subKey1;
  const result = _mode === "encrypt"
    ? xorBytes(xorBytes(xorBytes(padded, subKey1), subKey2), subKey3)
    : xorBytes(xorBytes(xorBytes(padded, subKey3), subKey2), subKey1);
  for (let i = 0; i < result.length; i += 8) {
    const block = result.slice(i, i + 8);
    const expanded = new Uint8Array(16);
    for (let j = 0; j < 8; j++) { expanded[j * 2] = block[j] >> 4; expanded[j * 2 + 1] = block[j] & 0x0f; }
    const keySchedule = rc4Init(key);
    const keystream = rc4Process(keySchedule, expanded);
    for (let j = 0; j < 8; j++) result[i + j] = keystream[j * 2] << 4 | keystream[j * 2 + 1];
  }
  return result;
}

function aesLikeProcess(key: Uint8Array, data: Uint8Array): Uint8Array {
  const result = new Uint8Array(data.length);
  const expandedKey = new Uint8Array(32);
  for (let i = 0; i < 32; i++) expandedKey[i] = key[i % key.length];
  for (let i = 0; i < data.length; i += 16) {
    for (let j = 0; j < 16 && i + j < data.length; j++) {
      result[i + j] = data[i + j] ^ expandedKey[j] ^ expandedKey[(j + 16) % 32];
    }
  }
  return result;
}

function processAlgo(algo: Algorithm, data: Uint8Array, key: Uint8Array, mode: Mode): Uint8Array {
  switch (algo) {
    case "aes": return aesLikeProcess(key, data);
    case "tripledes": return tripleDesProcess(key, data, mode);
    case "rabbit": return rabbitProcess(rabbitInit(key), data);
    case "rc4": return rc4Process(rc4Init(key), data);
  }
}

export function EncryptDecrypt() {
  const [input, setInput] = useState("");
  const [secretKey, setSecretKey] = useState("my-secret-key");
  const [algorithm, setAlgorithm] = useState<Algorithm>("aes");
  const [mode, setMode] = useState<Mode>("encrypt");
  const [inputFormat, setInputFormat] = useState<"text" | "hex">("text");
  const [outputFormat, setOutputFormat] = useState<"text" | "hex">("hex");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const process = useCallback(() => {
    setError("");
    try {
      if (!input.trim()) { setOutput(""); return; }
      if (!secretKey.trim()) { setError("Secret key is required"); return; }

      const key = utf8ToBytes(secretKey);
      let data: Uint8Array;
      if (mode === "encrypt") {
        data = utf8ToBytes(input);
      } else {
        data = inputFormat === "hex" ? hexToBytes(input) : utf8ToBytes(input);
      }

      const result = processAlgo(algorithm, data, key, mode);

      if (outputFormat === "hex") {
        setOutput(bytesToHex(result));
      } else {
        try { setOutput(bytesToUtf8(result)); } catch { setOutput(bytesToHex(result)); }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Processing failed");
      setOutput("");
    }
  }, [input, secretKey, algorithm, mode, inputFormat, outputFormat]);

  const copy = async () => { if (output) await navigator.clipboard.writeText(output); };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(["encrypt", "decrypt"] as Mode[]).map(m => (
          <button key={m} onClick={() => setMode(m)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${mode === m ? "bg-brand-500 text-white" : "border border-surface-200 text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface"}`}>
            {m === "encrypt" ? "Encrypt" : "Decrypt"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-surface-500 dark:text-dark-muted block mb-0.5">Algorithm</label>
          <select value={algorithm} onChange={(e) => setAlgorithm(e.target.value as Algorithm)}
            className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            {ALGO_OPTIONS.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
          </select>
        </div>
        {mode === "decrypt" && (
          <div>
            <label className="text-xs text-surface-500 dark:text-dark-muted block mb-0.5">Input Format</label>
            <select value={inputFormat} onChange={(e) => setInputFormat(e.target.value as "text" | "hex")}
              className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
              <option value="text">Text</option><option value="hex">Hex</option>
            </select>
          </div>
        )}
        <div>
          <label className="text-xs text-surface-500 dark:text-dark-muted block mb-0.5">Output Format</label>
          <select value={outputFormat} onChange={(e) => setOutputFormat(e.target.value as "text" | "hex")}
            className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option value="hex">Hex</option><option value="text">Text</option>
          </select>
        </div>
      </div>

      <div>
        <label className="text-xs text-surface-500 dark:text-dark-muted block mb-0.5">Secret Key</label>
        <input type="text" value={secretKey} onChange={(e) => setSecretKey(e.target.value)}
          className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm font-mono text-surface-900 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
      </div>

      <div>
        <label className="text-sm font-medium text-surface-700 dark:text-dark-text mb-1">{mode === "encrypt" ? "Text to Encrypt" : "Data to Decrypt"}</label>
        <textarea value={input} onChange={(e) => setInput(e.target.value)}
          placeholder={mode === "encrypt" ? "Enter text to encrypt..." : "Enter ciphertext to decrypt..."} rows={5} spellCheck={false}
          className="w-full rounded-lg border border-surface-200 bg-white p-3 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted" />
      </div>

      <button onClick={process} className="rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-600 transition-colors">
        {mode === "encrypt" ? "Encrypt" : "Decrypt"}
      </button>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {output && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-surface-700 dark:text-dark-text">Output</label>
            <button onClick={copy} className="rounded bg-brand-500 px-2 py-0.5 text-xs text-white hover:bg-brand-600">Copy</button>
          </div>
          <pre className="w-full rounded-lg border border-surface-200 bg-surface-50 p-3 text-sm font-mono text-surface-900 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text overflow-auto max-h-60 break-all select-all">{output}</pre>
        </div>
      )}
    </div>
  );
}
