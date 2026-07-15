"use client";

import { useState, useCallback, useEffect } from "react";
import { Copy } from "lucide-react";

export function BcryptGenerator() {
  const [mode, setMode] = useState<"generate" | "verify">("generate");
  const [password, setPassword] = useState("");
  const [cost, setCost] = useState(10);
  const [result, setResult] = useState("");
  const [compareString, setCompareString] = useState("");
  const [compareHash, setCompareHash] = useState("");
  const [compareResult, setCompareResult] = useState<boolean | null>(null);
  const [copied, setCopied] = useState(false);
  const [libLoading, setLibLoading] = useState(true);
  const [bcrypt, setBcrypt] = useState<{ hashSync: (password: string, salt: number) => string; compareSync: (password: string, hash: string) => boolean } | null>(null);

  useEffect(() => {
    import("bcryptjs").then((mod) => {
      setBcrypt({ hashSync: mod.hashSync, compareSync: mod.compareSync });
      setLibLoading(false);
    });
  }, []);

  const handleGenerate = useCallback(() => {
    if (!password || !bcrypt) return;
    try {
      const hashed = bcrypt.hashSync(password, cost);
      setResult(hashed);
    } catch {
      setResult("Error generating hash");
    }
  }, [password, cost, bcrypt]);

  const handleCompare = useCallback(() => {
    if (!bcrypt) return;
    try {
      const match = bcrypt.compareSync(compareString, compareHash);
      setCompareResult(match);
    } catch {
      setCompareResult(false);
    }
  }, [compareString, compareHash, bcrypt]);

  const copyResult = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {libLoading && (
        <div className="rounded-lg border border-surface-200 bg-surface-50 p-4 dark:border-dark-border dark:bg-dark-surface text-center">
          <p className="text-sm text-surface-500 dark:text-dark-muted">Loading bcrypt library...</p>
        </div>
      )}
      <div>
        <div className="flex gap-2 mb-4">
          {(["generate", "verify"] as const).map((m) => (
            <button key={m} onClick={() => { setMode(m); setResult(""); setCompareResult(null); }}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                mode === m ? "bg-brand-500 text-white" : "bg-surface-100 text-surface-600 hover:bg-surface-200 dark:bg-dark-surface dark:text-dark-text dark:hover:bg-dark-border"
              }`}>
              {m === "generate" ? "Hash" : "Compare"}
            </button>
          ))}
        </div>

        {mode === "generate" && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-surface-700 dark:text-dark-text mb-1 block">Your string:</label>
              <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your string to bcrypt..."
                className="w-full rounded-lg border border-surface-200 bg-white p-3 font-mono text-sm dark:border-dark-border dark:bg-dark-bg dark:text-dark-text" />
            </div>

            <div>
              <label className="text-sm font-medium text-surface-700 dark:text-dark-text mb-1 block">
                Salt rounds: {cost}
              </label>
              <input type="range" min={0} max={14} value={cost} onChange={(e) => setCost(parseInt(e.target.value))}
                className="w-full accent-brand-500" />
              <div className="flex justify-between text-xs text-surface-500 dark:text-dark-muted">
                <span>Fast (0)</span>
                <span>Secure (14)</span>
              </div>
            </div>

            <button onClick={handleGenerate} disabled={!password}
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50 transition-colors">
              Generate Hash
            </button>

            {result && (
              <div className="rounded-lg border border-surface-200 bg-surface-50 p-3 dark:border-dark-border dark:bg-dark-surface">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-surface-500 dark:text-dark-muted">Bcrypt Hash</span>
                  <button onClick={copyResult} className="text-xs text-brand-500 hover:text-brand-600 flex items-center gap-0.5">
                    <Copy size={12} /> {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
                <code className="block text-sm font-mono text-surface-900 dark:text-dark-text break-all select-all">{result}</code>
              </div>
            )}
          </div>
        )}

        {mode === "verify" && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-surface-700 dark:text-dark-text mb-1 block">Your string:</label>
              <input type="text" value={compareString} onChange={(e) => setCompareString(e.target.value)} placeholder="Your string to compare..."
                className="w-full rounded-lg border border-surface-200 bg-white p-3 font-mono text-sm dark:border-dark-border dark:bg-dark-bg dark:text-dark-text" />
            </div>

            <div>
              <label className="text-sm font-medium text-surface-700 dark:text-dark-text mb-1 block">Your hash:</label>
              <input type="text" value={compareHash} onChange={(e) => setCompareHash(e.target.value)} placeholder="$2a$10$..."
                className="w-full rounded-lg border border-surface-200 bg-white p-3 font-mono text-sm dark:border-dark-border dark:bg-dark-bg dark:text-dark-text" />
            </div>

            <button onClick={handleCompare} disabled={!compareString || !compareHash}
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50 transition-colors">
              Compare
            </button>

            {compareResult !== null && (
              <div className={`rounded-lg border p-3 ${
                compareResult
                  ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
                  : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
              }`}>
                <p className={`text-sm font-medium ${compareResult ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}>
                  Do they match? {compareResult ? "Yes" : "No"}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
