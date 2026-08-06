"use client";

import { useState, useEffect } from "react";
import { Copy } from "lucide-react";
import { hmacHex, type HmacHashId } from "@/lib/crypto-hash";

type HashFn = "MD5" | "RIPEMD160" | "SHA1" | "SHA224" | "SHA256" | "SHA3" | "SHA384" | "SHA512";
type OutputEncoding = "Hex" | "Base64" | "Base64url" | "Binary";

const HASH_FUNCTIONS: { value: HashFn; label: string; bits: number; id: HmacHashId }[] = [
  { value: "MD5", label: "MD5", bits: 128, id: "MD5" },
  { value: "RIPEMD160", label: "RIPEMD-160", bits: 160, id: "RIPEMD-160" },
  { value: "SHA1", label: "SHA-1", bits: 160, id: "SHA-1" },
  { value: "SHA224", label: "SHA-224", bits: 224, id: "SHA-224" },
  { value: "SHA256", label: "SHA-256", bits: 256, id: "SHA-256" },
  { value: "SHA384", label: "SHA-384", bits: 384, id: "SHA-384" },
  { value: "SHA3", label: "SHA-3", bits: 512, id: "SHA3-512" },
  { value: "SHA512", label: "SHA-512", bits: 512, id: "SHA-512" },
];

const ENCODING_OPTIONS: { value: OutputEncoding; label: string }[] = [
  { value: "Binary", label: "Binary (base 2)" },
  { value: "Hex", label: "Hexadecimal (base 16)" },
  { value: "Base64", label: "Base64 (base 64)" },
  { value: "Base64url", label: "Base64-url (URL-safe)" },
];

function convertToBinary(hex: string): string {
  return hex
    .split("")
    .map((c) => parseInt(c, 16).toString(2).padStart(4, "0"))
    .join(" ");
}

function encodeHex(hex: string, enc: OutputEncoding): string {
  switch (enc) {
    case "Binary":
      return convertToBinary(hex);
    case "Base64": {
      let out = "";
      for (let i = 0; i < hex.length; i += 2) out += String.fromCharCode(parseInt(hex.slice(i, i + 2), 16));
      return btoa(out);
    }
    case "Base64url": {
      let out = "";
      for (let i = 0; i < hex.length; i += 2) out += String.fromCharCode(parseInt(hex.slice(i, i + 2), 16));
      return btoa(out).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    }
    case "Hex":
    default:
      return hex;
  }
}

export function HmacGenerator() {
  const [message, setMessage] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [algorithm, setAlgorithm] = useState<HashFn>("SHA256");
  const [encoding, setEncoding] = useState<OutputEncoding>("Hex");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fn = HASH_FUNCTIONS.find((a) => a.value === algorithm);
    let cancelled = false;
    if (!fn || !message || !secretKey) {
      Promise.resolve().then(() => {
        if (!cancelled) setOutput("");
      });
      return () => {
        cancelled = true;
      };
    }
    hmacHex(fn.id, message, secretKey).then((hex) => {
      if (!cancelled) setOutput(encodeHex(hex, encoding));
    });
    return () => {
      cancelled = true;
    };
  }, [message, secretKey, algorithm, encoding]);

  const algoInfo = HASH_FUNCTIONS.find((a) => a.value === algorithm)!;

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
          placeholder="Plain text to compute the hash..."
          className="w-full rounded-lg border border-surface-200 bg-white p-3 font-mono text-sm dark:border-dark-border dark:bg-dark-bg dark:text-dark-text" />
      </div>

      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Secret Key</label>
        <input type="text" value={secretKey} onChange={(e) => setSecretKey(e.target.value)}
          placeholder="Enter the secret key..."
          className="w-full rounded-lg border border-surface-200 bg-white p-3 font-mono text-sm dark:border-dark-border dark:bg-dark-bg dark:text-dark-text" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Hashing Function</label>
          <select value={algorithm} onChange={(e) => setAlgorithm(e.target.value as HashFn)}
            className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm dark:border-dark-border dark:bg-dark-bg dark:text-dark-text">
            {HASH_FUNCTIONS.map((fn) => (
              <option key={fn.value} value={fn.value}>{fn.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Output Encoding</label>
          <select value={encoding} onChange={(e) => setEncoding(e.target.value as OutputEncoding)}
            className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm dark:border-dark-border dark:bg-dark-bg dark:text-dark-text">
            {ENCODING_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {output && (
        <div className="rounded-lg border border-surface-200 bg-surface-50 p-3 dark:border-dark-border dark:bg-dark-surface">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-surface-500 dark:text-dark-muted">
              HMAC-{algoInfo.label} ({algoInfo.bits} bits, {encoding})
            </span>
            <button onClick={copyResult} className="text-xs text-brand-500 hover:text-brand-600 flex items-center gap-0.5">
              <Copy size={12} /> {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <pre className="text-sm font-mono text-surface-900 dark:text-dark-text break-all select-all whitespace-pre-wrap">{output}</pre>
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