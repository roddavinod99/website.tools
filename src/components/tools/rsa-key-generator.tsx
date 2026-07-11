"use client";

import { useState, useCallback } from "react";
import { Copy, Download } from "lucide-react";

type KeySize = 1024 | 2048 | 4096;

interface KeyPair {
  publicKey: string;
  privateKey: string;
  size: KeySize;
  algorithm: string;
  generatedAt: string;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function formatPEM(label: string, base64: string): string {
  const lines: string[] = [];
  for (let i = 0; i < base64.length; i += 64) {
    lines.push(base64.slice(i, i + 64));
  }
  return `-----BEGIN ${label}-----\n${lines.join("\n")}\n-----END ${label}-----`;
}

function encodePublicKeySpki(spki: ArrayBuffer): string {
  const base64 = arrayBufferToBase64(spki);
  return formatPEM("PUBLIC KEY", base64);
}

function encodePrivateKeyPkcs8(pkcs8: ArrayBuffer): string {
  const base64 = arrayBufferToBase64(pkcs8);
  return formatPEM("PRIVATE KEY", base64);
}

export function RsaKeyGenerator() {
  const [keySize, setKeySize] = useState<KeySize>(2048);
  const [keyPair, setKeyPair] = useState<KeyPair | null>(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState("");

  const generateKeys = useCallback(async () => {
    setGenerating(true);
    setKeyPair(null);
    try {
      const keyPair = await crypto.subtle.generateKey(
        {
          name: "RSA-OAEP",
          modulusLength: keySize,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: "SHA-256",
        },
        true,
        ["encrypt", "decrypt"]
      );

      const publicKeyBuffer = await crypto.subtle.exportKey("spki", keyPair.publicKey);
      const privateKeyBuffer = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

      setKeyPair({
        publicKey: encodePublicKeySpki(publicKeyBuffer),
        privateKey: encodePrivateKeyPkcs8(privateKeyBuffer),
        size: keySize,
        algorithm: "RSA-OAEP / SHA-256",
        generatedAt: new Date().toLocaleString(),
      });
    } catch (err) {
      console.error("Key generation failed:", err);
    }
    setGenerating(false);
  }, [keySize]);

  const copyToClipboard = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 2000);
  };

  const downloadKey = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-surface-700 dark:text-dark-text mb-2 block">Key Size</label>
        <div className="flex gap-2">
          {([1024, 2048, 4096] as KeySize[]).map((size) => (
            <button key={size} onClick={() => setKeySize(size)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                keySize === size
                  ? "bg-brand-500 text-white"
                  : "bg-surface-100 text-surface-600 hover:bg-surface-200 dark:bg-dark-surface dark:text-dark-text dark:hover:bg-dark-border"
              }`}>
              {size} bits
            </button>
          ))}
        </div>
      </div>

      <button onClick={generateKeys} disabled={generating}
        className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50 transition-colors">
        {generating ? "Generating..." : "Generate Key Pair"}
      </button>

      {keyPair && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-lg border border-surface-200 bg-surface-50 p-2 dark:border-dark-border dark:bg-dark-surface">
              <span className="text-surface-500 dark:text-dark-muted">Algorithm</span>
              <p className="font-medium text-surface-900 dark:text-dark-text">{keyPair.algorithm}</p>
            </div>
            <div className="rounded-lg border border-surface-200 bg-surface-50 p-2 dark:border-dark-border dark:bg-dark-surface">
              <span className="text-surface-500 dark:text-dark-muted">Key Size</span>
              <p className="font-medium text-surface-900 dark:text-dark-text">{keyPair.size} bits</p>
            </div>
            <div className="col-span-2 rounded-lg border border-surface-200 bg-surface-50 p-2 dark:border-dark-border dark:bg-dark-surface">
              <span className="text-surface-500 dark:text-dark-muted">Generated</span>
              <p className="font-medium text-surface-900 dark:text-dark-text">{keyPair.generatedAt}</p>
            </div>
          </div>

          <div className="rounded-lg border border-surface-200 bg-surface-50 p-3 dark:border-dark-border dark:bg-dark-surface">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-surface-500 dark:text-dark-muted">Public Key</span>
              <div className="flex gap-1">
                <button onClick={() => downloadKey(keyPair.publicKey, "public-key.pem")}
                  className="text-xs text-surface-500 hover:text-brand-600 flex items-center gap-0.5">
                  <Download size={12} /> Download
                </button>
                <button onClick={() => copyToClipboard(keyPair.publicKey, "public")}
                  className="text-xs text-brand-500 hover:text-brand-600 flex items-center gap-0.5">
                  <Copy size={12} /> {copied === "public" ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
            <pre className="text-[11px] font-mono text-surface-700 dark:text-dark-text break-all whitespace-pre-wrap select-all max-h-40 overflow-y-auto">{keyPair.publicKey}</pre>
          </div>

          <div className="rounded-lg border border-surface-200 bg-surface-50 p-3 dark:border-dark-border dark:bg-dark-surface">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-surface-500 dark:text-dark-muted">Private Key</span>
              <div className="flex gap-1">
                <button onClick={() => downloadKey(keyPair.privateKey, "private-key.pem")}
                  className="text-xs text-surface-500 hover:text-brand-600 flex items-center gap-0.5">
                  <Download size={12} /> Download
                </button>
                <button onClick={() => copyToClipboard(keyPair.privateKey, "private")}
                  className="text-xs text-brand-500 hover:text-brand-600 flex items-center gap-0.5">
                  <Copy size={12} /> {copied === "private" ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
            <pre className="text-[11px] font-mono text-surface-700 dark:text-dark-text break-all whitespace-pre-wrap select-all max-h-40 overflow-y-auto">{keyPair.privateKey}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
