"use client";

import { useState, useCallback, useEffect, useRef } from "react";

export function BasicAuthGenerator() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [output, setOutput] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const generate = useCallback(() => {
    if (!username && !password) { setOutput(""); return; }
    const encoded = btoa(`${username}:${password}`);
    setOutput(`Authorization: Basic ${encoded}`);
  }, [username, password]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(generate, 150);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [generate]);

  const copy = async () => { if (output) await navigator.clipboard.writeText(output); };
  const copyValue = async () => {
    if (username || password) {
      await navigator.clipboard.writeText(btoa(`${username}:${password}`));
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-surface-700 dark:text-dark-text mb-1 block">Username</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter username"
          className="w-full rounded-lg border border-surface-200 bg-white p-3 font-mono text-sm dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-surface-700 dark:text-dark-text mb-1 block">Password</label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="text"
          placeholder="Enter password"
          className="w-full rounded-lg border border-surface-200 bg-white p-3 font-mono text-sm dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
        />
      </div>

      {output && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-surface-700 dark:text-dark-text">Authorization Header</label>
            <div className="flex gap-2">
              <button onClick={copy} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">Copy Header</button>
              <button onClick={copyValue} className="rounded-lg border border-surface-200 px-4 py-2 text-sm text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface">Copy Value Only</button>
            </div>
          </div>
          <pre className="w-full rounded-lg border border-surface-200 bg-surface-50 p-3 text-sm font-mono dark:border-dark-border dark:bg-dark-bg dark:text-dark-text overflow-auto max-h-60 select-all">{output}</pre>
        </div>
      )}
    </div>
  );
}
