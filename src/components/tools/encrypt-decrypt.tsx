"use client";

import { useState, useCallback, useEffect } from "react";

type Algorithm = "aes" | "tripledes" | "rabbit" | "rc4";
type Mode = "encrypt" | "decrypt";

const ALGO_OPTIONS: { id: Algorithm; label: string }[] = [
  { id: "aes", label: "AES" },
  { id: "tripledes", label: "TripleDES" },
  { id: "rabbit", label: "Rabbit" },
  { id: "rc4", label: "RC4" },
];

export function EncryptDecrypt() {
  const [encryptInput, setEncryptInput] = useState("Lorem ipsum dolor sit amet");
  const [decryptInput, setDecryptInput] = useState("U2FsdGVkX1/EC3+6P5dbbkZ3e1kQ5o2yzuU0NHTjmrKnLBEwreV489Kr0DIB+uBs");
  const [algorithm, setAlgorithm] = useState<Algorithm>("aes");
  const [secretKey, setSecretKey] = useState("my secret key");
  const [mode, setMode] = useState<Mode>("encrypt");
  const [encryptOutput, setEncryptOutput] = useState("");
  const [decryptOutput, setDecryptOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  const [libLoading, setLibLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [cryptoLib, setCryptoLib] = useState<{ algoMap: Record<Algorithm, any>; enc: any } | null>(null);

  useEffect(() => {
    import("crypto-js").then((mod) => {
      const { AES, TripleDES, Rabbit, RC4, enc } = mod;
      setCryptoLib({
        algoMap: { aes: AES, tripledes: TripleDES, rabbit: Rabbit, rc4: RC4 },
        enc,
      });
      setLibLoading(false);
    });
  }, []);

  const encrypt = useCallback(() => {
    setError("");
    if (!encryptInput.trim()) { setEncryptOutput(""); return; }
    if (!cryptoLib) return;
    try {
      const result = cryptoLib.algoMap[algorithm].encrypt(encryptInput, secretKey).toString();
      setEncryptOutput(result);
    } catch {
      setError("Encryption failed");
      setEncryptOutput("");
    }
  }, [encryptInput, algorithm, secretKey, cryptoLib]);

  const decrypt = useCallback(() => {
    setError("");
    if (!decryptInput.trim()) { setDecryptOutput(""); return; }
    if (!cryptoLib) return;
    try {
      const bytes = cryptoLib.algoMap[algorithm].decrypt(decryptInput, secretKey);
      const result = bytes.toString(cryptoLib.enc.Utf8);
      if (!result) {
        setError("Unable to decrypt your text. Check the key and input.");
        setDecryptOutput("");
      } else {
        setDecryptOutput(result);
      }
    } catch {
      setError("Unable to decrypt your text");
      setDecryptOutput("");
    }
  }, [decryptInput, algorithm, secretKey, cryptoLib]);

  const handleProcess = () => {
    if (mode === "encrypt") encrypt();
    else decrypt();
  };

  const copy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 1500);
  };

  const currentOutput = mode === "encrypt" ? encryptOutput : decryptOutput;

  return (
    <div className="space-y-4">
      {libLoading && (
        <div className="rounded-lg border border-surface-200 bg-surface-50 p-4 dark:border-dark-border dark:bg-dark-surface text-center">
          <p className="text-sm text-surface-500 dark:text-dark-muted">Loading crypto library...</p>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {(["encrypt", "decrypt"] as Mode[]).map((m) => (
          <button key={m} onClick={() => { setMode(m); setError(""); }}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${mode === m ? "bg-brand-500 text-white" : "border border-surface-200 text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface"}`}>
            {m === "encrypt" ? "Encrypt" : "Decrypt"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-surface-500 dark:text-dark-muted block mb-0.5">Encryption Algorithm</label>
          <select value={algorithm} onChange={(e) => setAlgorithm(e.target.value as Algorithm)}
            className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            {ALGO_OPTIONS.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-surface-500 dark:text-dark-muted block mb-0.5">Secret Key</label>
          <input type="text" value={secretKey} onChange={(e) => setSecretKey(e.target.value)}
            className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm font-mono text-surface-900 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
        </div>
      </div>

      {mode === "encrypt" && (
        <div>
          <label className="text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Your text:</label>
          <textarea value={encryptInput} onChange={(e) => setEncryptInput(e.target.value)}
            placeholder="The string to encrypt" rows={4} spellCheck={false}
            className="w-full rounded-lg border border-surface-200 bg-white p-3 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted" />
        </div>
      )}

      {mode === "decrypt" && (
        <div>
          <label className="text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Your encrypted text:</label>
          <textarea value={decryptInput} onChange={(e) => setDecryptInput(e.target.value)}
            placeholder="The string to decrypt" rows={4} spellCheck={false}
            className="w-full rounded-lg border border-surface-200 bg-white p-3 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted" />
        </div>
      )}

      <button onClick={handleProcess} className="rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-600 transition-colors">
        {mode === "encrypt" ? "Encrypt" : "Decrypt"}
      </button>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {currentOutput && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-surface-700 dark:text-dark-text">
              {mode === "encrypt" ? "Your text encrypted:" : "Your decrypted text:"}
            </label>
            <button onClick={() => copy(currentOutput, "output")} className="rounded bg-brand-500 px-2 py-0.5 text-xs text-white hover:bg-brand-600">
              {copied === "output" ? "Copied!" : "Copy"}
            </button>
          </div>
          <pre className="w-full rounded-lg border border-surface-200 bg-surface-50 p-3 text-sm font-mono text-surface-900 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text overflow-auto max-h-60 break-all select-all">{currentOutput}</pre>
        </div>
      )}
    </div>
  );
}
