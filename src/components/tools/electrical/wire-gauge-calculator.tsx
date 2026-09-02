"use client";

import { useState, useMemo } from "react";
import { usePrefillTool } from "@/lib/load-example";

/**
 * Wire Gauge Calculator — AWG / mm² / diameter / resistance.
 *
 * Per AGENTS.md "Browser-First Architecture": pure browser math, no
 * network roundtrips, no Date.now/Math.random in render.
 *
 * AWG (American Wire Gauge) cross-section follows the standard
 * formula:  A(n) = 0.012668 mm² × 92^((36-n)/19.5)  for n in 0000..40
 * Diameter follows:  d(n) = 0.127 mm × 92^((36-n)/39)
 * Resistance per km at 20°C:  R(n) = 0.017241 / A(n) Ω/km
 *
 * Common gauge values are pre-baked so we can show a quick reference
 * table even when the user hasn't typed anything yet.
 */

interface GaugeRow {
  awg: string;
  diameterMm: number;
  areaMm2: number;
  resistance: number;
}

const AWG_TABLE: GaugeRow[] = [
  { awg: "0000 (4/0)", diameterMm: 11.684, areaMm2: 107.2, resistance: 0.16 },
  { awg: "000 (3/0)", diameterMm: 10.405, areaMm2: 85.01, resistance: 0.20 },
  { awg: "00 (2/0)", diameterMm: 9.266, areaMm2: 67.43, resistance: 0.26 },
  { awg: "0 (1/0)", diameterMm: 8.252, areaMm2: 53.49, resistance: 0.32 },
  { awg: "1", diameterMm: 7.348, areaMm2: 42.41, resistance: 0.41 },
  { awg: "2", diameterMm: 6.544, areaMm2: 33.62, resistance: 0.51 },
  { awg: "4", diameterMm: 5.189, areaMm2: 21.15, resistance: 0.82 },
  { awg: "6", diameterMm: 4.115, areaMm2: 13.30, resistance: 1.30 },
  { awg: "8", diameterMm: 3.264, areaMm2: 8.366, resistance: 2.06 },
  { awg: "10", diameterMm: 2.588, areaMm2: 5.261, resistance: 3.28 },
  { awg: "12", diameterMm: 2.053, areaMm2: 3.309, resistance: 5.21 },
  { awg: "14", diameterMm: 1.628, areaMm2: 2.081, resistance: 8.29 },
  { awg: "16", diameterMm: 1.291, areaMm2: 1.309, resistance: 13.18 },
  { awg: "18", diameterMm: 1.024, areaMm2: 0.823, resistance: 20.95 },
  { awg: "20", diameterMm: 0.812, areaMm2: 0.518, resistance: 33.30 },
  { awg: "22", diameterMm: 0.644, areaMm2: 0.326, resistance: 52.96 },
  { awg: "24", diameterMm: 0.511, areaMm2: 0.205, resistance: 84.22 },
  { awg: "26", diameterMm: 0.405, areaMm2: 0.129, resistance: 134.0 },
  { awg: "28", diameterMm: 0.321, areaMm2: 0.081, resistance: 213.0 },
];

type Mode = "awg-to-mm2" | "mm2-to-awg" | "awg-to-diameter" | "diameter-to-awg";

function parseAwg(s: string): number | null {
  // Accept "10", "10 AWG", "AWG 10", "#10"
  const m = s.replace(/[^0-9-]/g, "").trim();
  if (!m) return null;
  const n = parseInt(m, 10);
  if (Number.isNaN(n) || n < -4 || n > 40) return null;
  return n;
}

function awgToArea(awg: number): number {
  // 0.012668 mm² × 92^((36-n)/19.5)
  return 0.012668 * Math.pow(92, (36 - awg) / 19.5);
}

function awgToDiameter(awg: number): number {
  return 0.127 * Math.pow(92, (36 - awg) / 39);
}

function mm2ToAwg(area: number): number {
  if (area <= 0) return NaN;
  // Inverse: n = 36 - 19.5 × log92(A / 0.012668)
  const n = 36 - 19.5 * (Math.log(area / 0.012668) / Math.log(92));
  return n;
}

function diameterToAwg(d: number): number {
  if (d <= 0) return NaN;
  const n = 36 - 39 * (Math.log(d / 0.127) / Math.log(92));
  return n;
}

function fmt(n: number, digits: number = 3): string {
  if (!Number.isFinite(n)) return "—";
  return Number(n.toPrecision(digits)).toString();
}

function lookupAwg(awg: number): GaugeRow | null {
  if (awg === 0) return AWG_TABLE.find((r) => r.awg.startsWith("0 (")) ?? null;
  if (awg === -1) return AWG_TABLE.find((r) => r.awg.startsWith("00 ")) ?? null;
  if (awg === -2) return AWG_TABLE.find((r) => r.awg.startsWith("000 ")) ?? null;
  if (awg === -3) return AWG_TABLE.find((r) => r.awg.startsWith("0000 ")) ?? null;
  return AWG_TABLE.find((r) => r.awg === String(awg)) ?? null;
}

export function WireGaugeCalculator() {
  const [mode, setMode] = useState<Mode>("awg-to-mm2");
  const [awg, setAwg] = useState("12");
  const [area, setArea] = useState("");
  const [diameter, setDiameter] = useState("");

  // Long-tail landing pages (PR 7 of PLAN.md) prefill the calculator
  // with { mode, awg, area, diameter } so e.g. /wire/awg-12-to-mm2
  // lands with the conversion already computed.
  usePrefillTool("wire-gauge-calculator", (prefill) => {
    if (prefill.mode === "awg-to-mm2" || prefill.mode === "mm2-to-awg" || prefill.mode === "awg-to-diameter" || prefill.mode === "diameter-to-awg") {
      setMode(prefill.mode);
    }
    if (prefill.awg) setAwg(prefill.awg);
    if (prefill.area) setArea(prefill.area);
    if (prefill.diameter) setDiameter(prefill.diameter);
  });

  const result = useMemo(() => {
    switch (mode) {
      case "awg-to-mm2": {
        const n = parseAwg(awg);
        if (n === null) return null;
        const a = awgToArea(n);
        const d = awgToDiameter(n);
        const r = 0.017241 / a; // Ω/km at 20°C copper
        return { primary: `${fmt(a, 4)} mm²`, secondary: `${fmt(d, 3)} mm diameter`, tertiary: `${fmt(r, 4)} Ω/km`, note: `AWG ${n}` };
      }
      case "mm2-to-awg": {
        const a = parseFloat(area);
        if (!Number.isFinite(a) || a <= 0) return null;
        const n = mm2ToAwg(a);
        const r = 0.017241 / a;
        return { primary: `~AWG ${fmt(n, 1)}`, secondary: `${fmt(a, 3)} mm²`, tertiary: `${fmt(r, 4)} Ω/km`, note: `closest standard: ${lookupAwg(Math.round(n))?.awg ?? "n/a"}` };
      }
      case "awg-to-diameter": {
        const n = parseAwg(awg);
        if (n === null) return null;
        const d = awgToDiameter(n);
        const a = awgToArea(n);
        return { primary: `${fmt(d, 3)} mm`, secondary: `${fmt(a, 4)} mm²`, tertiary: `${fmt(d / 25.4, 4)} in`, note: `AWG ${n}` };
      }
      case "diameter-to-awg": {
        const d = parseFloat(diameter);
        if (!Number.isFinite(d) || d <= 0) return null;
        const n = diameterToAwg(d);
        const a = (Math.PI / 4) * d * d;
        return { primary: `~AWG ${fmt(n, 1)}`, secondary: `${fmt(d, 3)} mm diameter`, tertiary: `${fmt(a, 4)} mm² area`, note: `closest standard: ${lookupAwg(Math.round(n))?.awg ?? "n/a"}` };
      }
    }
  }, [mode, awg, area, diameter]);

  const inputCls =
    "w-full rounded-lg border border-surface-200 bg-white p-2.5 font-mono text-sm dark:border-dark-border dark:bg-dark-bg dark:text-dark-text";
  const labelCls = "block text-xs font-medium text-surface-700 dark:text-dark-text mb-1";

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="wg-mode" className={labelCls}>Conversion</label>
        <select
          id="wg-mode"
          value={mode}
          onChange={(e) => setMode(e.target.value as Mode)}
          className={inputCls}
        >
          <option value="awg-to-mm2">AWG → mm² (cross-section)</option>
          <option value="mm2-to-awg">mm² → AWG (closest standard)</option>
          <option value="awg-to-diameter">AWG → diameter (mm)</option>
          <option value="diameter-to-awg">diameter (mm) → AWG</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="wg-awg" className={labelCls}>
            {mode === "mm2-to-awg" || mode === "diameter-to-awg" ? "AWG (output)" : "AWG (input)"}
          </label>
          <input
            id="wg-awg"
            type="text"
            value={awg}
            onChange={(e) => setAwg(e.target.value)}
            placeholder="12"
            data-testid="wg-input"
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="wg-other" className={labelCls}>
            {mode === "mm2-to-awg"
              ? "Cross-section (mm²)"
              : mode === "diameter-to-awg"
              ? "Diameter (mm)"
              : "—"}
          </label>
          <input
            id="wg-other"
            type="number"
            value={mode === "mm2-to-awg" ? area : mode === "diameter-to-awg" ? diameter : ""}
            onChange={(e) => (mode === "mm2-to-awg" ? setArea(e.target.value) : setDiameter(e.target.value))}
            placeholder={mode === "mm2-to-awg" ? "3.309" : mode === "diameter-to-awg" ? "2.053" : ""}
            step="any"
            disabled={mode === "awg-to-mm2" || mode === "awg-to-diameter"}
            className={inputCls}
          />
        </div>
      </div>

      {result && (
        <div
          data-testid="tool-output"
          className="rounded-2xl border border-surface-200 bg-surface-50 p-5 dark:border-dark-border dark:bg-dark-surface"
        >
          <p className="text-2xl font-bold text-surface-900 dark:text-dark-text">{result.primary}</p>
          <p className="mt-1 text-sm text-surface-600 dark:text-dark-muted">{result.secondary}</p>
          <p className="mt-1 text-sm text-surface-600 dark:text-dark-muted">{result.tertiary}</p>
          <p className="mt-3 text-xs text-surface-500 dark:text-dark-muted">{result.note}</p>
        </div>
      )}

      <details className="rounded-lg border border-surface-200 bg-white dark:border-dark-border dark:bg-dark-surface">
        <summary className="cursor-pointer list-none px-3 py-2 text-xs font-medium text-surface-500 dark:text-dark-muted [&::-webkit-details-marker]:hidden">
          AWG quick reference
        </summary>
        <div className="overflow-x-auto px-3 pb-3">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-surface-200 text-left text-surface-500 dark:border-dark-border dark:text-dark-muted">
                <th className="py-1 pr-3">AWG</th>
                <th className="py-1 pr-3">Diameter (mm)</th>
                <th className="py-1 pr-3">Area (mm²)</th>
                <th className="py-1">Ω/km (Cu, 20°C)</th>
              </tr>
            </thead>
            <tbody className="font-mono text-surface-700 dark:text-dark-text">
              {AWG_TABLE.map((r) => (
                <tr key={r.awg} className="border-b border-surface-100 last:border-b-0 dark:border-dark-border">
                  <td className="py-1 pr-3">{r.awg}</td>
                  <td className="py-1 pr-3">{r.diameterMm}</td>
                  <td className="py-1 pr-3">{r.areaMm2}</td>
                  <td className="py-1">{r.resistance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>

      <p className="text-[10px] text-surface-400 dark:text-dark-muted">
        Resistance values assume copper at 20°C (resistivity 1.7241×10⁻⁸ Ω·m).
        All math runs in your browser.
      </p>
    </div>
  );
}
