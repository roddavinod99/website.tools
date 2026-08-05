"use client";

import { useState, useCallback } from "react";
import { encryptAESGCM, decryptAESGCM, formatEncryptedResult, parseEncryptedResult, legacyFormatToWebCrypto } from "@/lib/web-crypto";

type Mode = "encrypt" | "decrypt";

export function EncryptDecrypt() {
  const [encryptInput, setEncryptInput] = useState("Lorem ipsum dolor sit amet");
  const [decryptInput, setDecryptInput] = useState("");
  const [secretKey, setSecretKey] = useState("my secret key");
  const [mode, setMode] = useState<Mode>("encrypt");
  const [encryptOutput, setEncryptOutput] = useState("");
  const [decryptOutput, setDecryptOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  const encrypt = useCallback(async () => {
    setError("");
    if (!encryptInput.trim()) { setEncryptOutput(""); return; }
    try {
      const result = await encryptAESGCM(encryptInput, secretKey);
      setEncryptOutput(formatEncryptedResult(result));
    } catch {
      setError("Encryption failed");
      setEncryptOutput("");
    }
  }, [encryptInput, secretKey]);

  const decrypt = useCallback(async () => {
    setError("");
    if (!decryptInput.trim()) { setDecryptOutput(""); return; }
    try {
      let params = parseEncryptedResult(decryptInput);
      if (!params) {
        params = legacyFormatToWebCrypto(decryptInput);
      }
      if (!params) {
        setError("Invalid encrypted data format. Use JSON format from this tool.");
        setDecryptOutput("");
        return;
      }
      const result = await decryptAESGCM(params, secretKey);
      setDecryptOutput(result);
    } catch {
      setError("Unable to decrypt. Check the key and input format.");
      setDecryptOutput("");
    }
  }, [decryptInput, secretKey]);

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
          <label className="text-xs text-surface-500 dark:text-dark-muted block mb-0.5">Algorithm</label>
          <select
            value="aes-gcm"
            disabled
            className="w-full rounded-lg border border-surface-200 bg-surface-100 px-3 py-2 text-sm text-surface-500 dark:border-dark-border dark:bg-dark-surface dark:text-dark-muted cursor-not-allowed"
          >
            <option value="aes-gcm">AES-GCM (Web Crypto API)</option>
          </select>
          <p className="mt-1 text-xs text-surface-400 dark:text-dark-muted">
            Modern authenticated encryption. Legacy algorithms (TripleDES, RC4, Rabbit) removed for security.
          </p>
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
            placeholder='Paste JSON output from encryption: {"data":"...","iv":"...","salt":"..."}' rows={4} spellCheck={false}
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
              {mode === "encrypt" ? "Your text encrypted (JSON):" : "Your decrypted text:"}
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