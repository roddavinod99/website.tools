"use client";

import { useState, useEffect, useCallback } from "react";

interface KeyEvent {
  key: string;
  keyCode: number;
  code: string;
  which: number;
  shiftKey: boolean;
  ctrlKey: boolean;
  altKey: boolean;
  metaKey: boolean;
  type: string;
}

export function KeycodeInfo() {
  const [event, setEvent] = useState<KeyEvent | null>(null);

  const handler = useCallback((e: globalThis.KeyboardEvent) => {
    e.preventDefault();
    setEvent({
      key: e.key,
      keyCode: e.keyCode,
      code: e.code,
      which: e.which,
      shiftKey: e.shiftKey,
      ctrlKey: e.ctrlKey,
      altKey: e.altKey,
      metaKey: e.metaKey,
      type: e.type,
    });
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handler]);

  const rows: [string, string | number | boolean][] = event
    ? [
        ["key", event.key],
        ["keyCode", event.keyCode],
        ["code", event.code],
        ["which", event.which],
        ["shiftKey", event.shiftKey],
        ["ctrlKey", event.ctrlKey],
        ["altKey", event.altKey],
        ["metaKey", event.metaKey],
      ]
    : [];

  const displayKey = event ? (event.key === " " ? "Space" : event.key.length === 1 ? event.key.toUpperCase() : event.key) : "?";

  return (
    <div className="space-y-4">
      {!event && (
        <div className="rounded-lg border border-surface-200 bg-surface-50 p-6 text-center dark:border-dark-border dark:bg-dark-bg">
          <p className="text-sm text-surface-500 dark:text-dark-muted">Press any key to see its keycode information</p>
        </div>
      )}

      {event && (
        <>
          <div className="flex items-center justify-center">
            <div className="flex h-28 w-36 items-center justify-center rounded-xl border-2 border-surface-300 bg-white shadow-lg dark:border-dark-border dark:bg-dark-surface">
              <span className="text-4xl font-bold text-surface-800 dark:text-dark-text">{displayKey}</span>
            </div>
          </div>

          <div className="rounded-lg border border-surface-200 bg-white overflow-hidden dark:border-dark-border dark:bg-dark-surface">
            <table className="w-full text-sm">
              <tbody>
                {rows.map(([label, value]) => (
                  <tr key={String(label)} className="border-b border-surface-100 last:border-0 dark:border-dark-border">
                    <td className="px-4 py-2 font-medium text-surface-600 dark:text-dark-muted">{String(label)}</td>
                    <td className="px-4 py-2 font-mono text-surface-900 dark:text-dark-text">
                      {typeof value === "boolean" ? (
                        <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${value ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-surface-100 text-surface-500 dark:bg-dark-bg dark:text-dark-muted"}`}>
                          {String(value)}
                        </span>
                      ) : (
                        String(value)
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
