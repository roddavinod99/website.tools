"use client";

import { useMemo, useState } from "react";

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const cleaned = hex.replace("#", "").trim();
  let full: string;
  if (cleaned.length === 3) {
    full = cleaned.split("").map((c) => c + c).join("");
  } else if (cleaned.length === 6) {
    full = cleaned;
  } else {
    return null;
  }
  const num = parseInt(full, 16);
  if (isNaN(num)) return null;
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function toLinear(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function luminance(rgb: { r: number; g: number; b: number }): number {
  return 0.2126 * toLinear(rgb.r) + 0.7152 * toLinear(rgb.g) + 0.0722 * toLinear(rgb.b);
}

function contrastRatio(fg: { r: number; g: number; b: number }, bg: { r: number; g: number; b: number }): number {
  const l1 = luminance(fg);
  const l2 = luminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

interface Verdict {
  label: string;
  pass: boolean;
  ratio: number;
  required: number;
}

export function ContrastChecker() {
  const [fgHex, setFgHex] = useState("#111827");
  const [bgHex, setBgHex] = useState("#ffffff");

  const fg = useMemo(() => hexToRgb(fgHex), [fgHex]);
  const bg = useMemo(() => hexToRgb(bgHex), [bgHex]);
  const valid = fg !== null && bg !== null;
  const ratio = valid ? contrastRatio(fg!, bg!) : 0;

  const verdicts: Verdict[] = [
    { label: "Normal text (AA)", pass: ratio >= 4.5, ratio, required: 4.5 },
    { label: "Large text (AA)", pass: ratio >= 3, ratio, required: 3 },
    { label: "UI components (AA)", pass: ratio >= 3, ratio, required: 3 },
    { label: "Normal text (AAA)", pass: ratio >= 7, ratio, required: 7 },
    { label: "Large text (AAA)", pass: ratio >= 4.5, ratio, required: 4.5 },
  ];

  const presetPairs = [
    { name: "Black on white", fg: "#000000", bg: "#ffffff" },
    { name: "White on black", fg: "#ffffff", bg: "#000000" },
    { name: "Gray #767676 on white", fg: "#767676", bg: "#ffffff" },
    { name: "Blue #1a73e8 on white", fg: "#1a73e8", bg: "#ffffff" },
    { name: "White on #1a73e8", fg: "#ffffff", bg: "#1a73e8" },
    { name: "Dark on cream", fg: "#2b2b2b", bg: "#f5f0e6" },
  ];

  const copyRatio = async () => {
    if (!valid) return;
    await navigator.clipboard.writeText(`${ratio.toFixed(2)}:1`);
  };

  const inputCls =
    "w-full rounded-lg border border-surface-200 bg-white p-3 font-mono text-sm dark:border-dark-border dark:bg-dark-bg dark:text-dark-text";
  const labelCls = "block text-sm font-medium text-surface-700 dark:text-dark-text mb-1";

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Foreground (text) color</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={hexToRgb(fgHex) ? fgHex : "#000000"}
              onChange={(e) => setFgHex(e.target.value)}
              aria-label="Foreground color picker"
              className="h-11 w-14 shrink-0 cursor-pointer rounded-lg border border-surface-200 dark:border-dark-border"
            />
            <input
              type="text"
              value={fgHex}
              onChange={(e) => setFgHex(e.target.value)}
              placeholder="#000000"
              aria-label="Foreground hex value"
              className={inputCls}
            />
          </div>
        </div>
        <div>
          <label className={labelCls}>Background color</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={hexToRgb(bgHex) ? bgHex : "#ffffff"}
              onChange={(e) => setBgHex(e.target.value)}
              aria-label="Background color picker"
              className="h-11 w-14 shrink-0 cursor-pointer rounded-lg border border-surface-200 dark:border-dark-border"
            />
            <input
              type="text"
              value={bgHex}
              onChange={(e) => setBgHex(e.target.value)}
              placeholder="#ffffff"
              aria-label="Background hex value"
              className={inputCls}
            />
          </div>
        </div>
      </div>

      <div
        className="rounded-xl border border-surface-200 p-6 text-center dark:border-dark-border"
        style={{ backgroundColor: bgHex, color: fgHex }}
      >
        <p className="text-lg font-semibold">Aa Sample text preview</p>
        <p className="mt-1 text-sm opacity-90">The quick brown fox jumps over the lazy dog.</p>
      </div>

      {!valid && (
        <p className="text-sm text-red-600 dark:text-red-400">
          Enter valid 3- or 6-digit hex colors to see results.
        </p>
      )}

      {valid && (
        <>
          <div className="rounded-lg border border-surface-200 bg-surface-50 p-4 dark:border-dark-border dark:bg-dark-surface">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-surface-400 dark:text-dark-muted">
                  Contrast ratio
                </p>
                <p
                  data-testid="tool-output"
                  className="mt-1 text-3xl font-bold font-mono text-surface-900 dark:text-dark-text"
                >
                  {ratio.toFixed(2)}:1
                </p>
              </div>
              <button
                onClick={copyRatio}
                className="rounded-lg border border-surface-200 px-3 py-1.5 text-xs font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-bg"
              >
                Copy ratio
              </button>
            </div>
            <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
              {verdicts.map((v) => (
                <li
                  key={v.label}
                  className={`flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs ${
                    v.pass
                      ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                      : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                  }`}
                >
                  <span>{v.label}</span>
                  <span className="font-semibold">{v.pass ? "PASS" : "FAIL"}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <label className={labelCls}>Common color pairs</label>
            <div className="grid gap-2 sm:grid-cols-2">
              {presetPairs.map((p) => {
                const r = contrastRatio(hexToRgb(p.fg)!, hexToRgb(p.bg)!);
                return (
                  <button
                    key={p.name}
                    onClick={() => { setFgHex(p.fg); setBgHex(p.bg); }}
                    className="flex items-center justify-between rounded-lg border border-surface-200 px-3 py-2 text-xs hover:border-brand-300 dark:border-dark-border"
                    style={{ backgroundColor: p.bg, color: p.fg }}
                  >
                    <span className="font-medium">{p.name}</span>
                    <span className="font-mono">{r.toFixed(2)}:1</span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      <p className="text-[10px] text-surface-400 dark:text-dark-muted">
        Ratios follow the WCAG 2.2 relative luminance formula. All computation happens locally in your browser.
      </p>
    </div>
  );
}