"use client";

import { useState, useCallback } from "react";
import { Copy } from "lucide-react";

type Algorithm = "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512";

const ALGORITHMS: { value: Algorithm; label: string; bits: number }[] = [
  { value: "SHA-1", label: "SHA-1", bits: 160 },
  { value: "SHA-256", label: "SHA-256", bits: 256 },
  { value: "SHA-384", label: "SHA-384", bits: 384 },
  { value: "SHA-512", label: "SHA-512", bits: 512 },
];

async function generateHMAC(message: string, key: string, algorithm: Algorithm): Promise<string> {
  const keyData = new TextEncoder().encode(key);
  const msgData = new TextEncoder().encode(message);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: algorithm },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", cryptoKey, msgData);
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function HmacGenerator() {
  const [message, setMessage] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [algorithm, setAlgorithm] = useState<Algorithm>("SHA-256");
  const [output, setOutput] = useState("");
  const [computing, setComputing] = useState(false);
  const [copied, setCopied] = useState(false);

  const compute = useCallback(async () => {
    if (!message || !secretKey) {
      setOutput("");
      return;
    }
    setComputing(true);
    try {
      const hmac = await generateHMAC(message, secretKey, algorithm);
      setOutput(hmac);
    } catch {
      setOutput("Error computing HMAC");
    }
    setComputing(false);
  }, [message, secretKey, algorithm]);

  const copyResult = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Message</label>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3}
          placeholder="Enter the message to authenticate..."
          className="w-full rounded-lg border border-surface-200 bg-white p-3 font-mono text-sm dark:border-dark-border dark:bg-dark-bg dark:text-dark-text" />
      </div>

      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Secret Key</label>
        <input type="text" value={secretKey} onChange={(e) => setSecretKey(e.target.value)}
          placeholder="Enter secret key..."
          className="w-full rounded-lg border border-surface-200 bg-white p-3 font-mono text-sm dark:border-dark-border dark:bg-dark-bg dark:text-dark-text" />
      </div>

      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Algorithm</label>
        <div className="flex flex-wrap gap-2">
          {ALGORITHMS.map((algo) => (
            <button key={algo.value} onClick={() => { setAlgorithm(algo.value); setOutput(""); }}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                algorithm === algo.value
                  ? "bg-brand-500 text-white"
                  : "bg-surface-100 text-surface-600 hover:bg-surface-200 dark:bg-dark-surface dark:text-dark-text dark:hover:bg-dark-border"
              }`}>
              {algo.label}
            </button>
          ))}
        </div>
      </div>

      <button onClick={compute} disabled={!message || !secretKey || computing}
        className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50 transition-colors">
        {computing ? "Computing..." : "Generate HMAC"}
      </button>

      {output && (
        <div className="rounded-lg border border-surface-200 bg-surface-50 p-3 dark:border-dark-border dark:bg-dark-surface">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-surface-500 dark:text-dark-muted">
              HMAC-{algorithm} ({ALGORITHMS.find((a) => a.value === algorithm)?.bits || 256} bits, {output.length} hex chars)
            </span>
            <button onClick={copyResult} className="text-xs text-brand-500 hover:text-brand-600 flex items-center gap-0.5">
              <Copy size={12} /> {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <code className="block text-sm font-mono text-surface-900 dark:text-dark-text break-all select-all">{output}</code>
        </div>
      )}

      <div className="rounded-lg border border-surface-200 bg-surface-50 p-3 dark:border-dark-border dark:bg-dark-surface">
        <p className="text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">About HMAC</p>
        <p className="text-xs text-surface-600 dark:text-dark-text">
          HMAC (Hash-based Message Authentication Code) provides both data integrity and authentication using a secret key. It is widely used for API request signing, webhook verification, and token generation.
        </p>
      </div>
    </div>
  );
}
