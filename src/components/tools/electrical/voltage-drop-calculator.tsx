"use client";

import { useState, useMemo } from "react";
import { usePrefillTool } from "@/lib/load-example";

/**
 * Voltage Drop Calculator — pure browser implementation, 100% client-side.
 *
 * Computes the voltage drop along a wire run for a given current,
 * length, gauge, and voltage. Supports copper (resistivity
 * 1.7241×10⁻⁸ Ω·m) and aluminum (2.65×10⁻⁸ Ω·m) at 20°C.
 *
 * The "round trip" length is used: 2L because current flows out
 * and back. Single-phase uses L1+L2; three-phase multiplies by
 * √3. 12V and 24V systems are typically allowed a higher %
 * voltage drop than 120/240V mains wiring.
 */

type Material = "copper" | "aluminum";
type System = "12V" | "24V" | "120V-single" | "240V-single" | "120-240V-3phase";
type Phase = "single" | "three";

const COPPER_RESISTIVITY = 1.7241e-8; // Ω·m at 20°C
const ALUMINUM_RESISTIVITY = 2.65e-8;

const AWG_RESISTANCE: Record<string, number> = {
  // Ω per km at 20°C copper
  "0000 (4/0)": 0.16,
  "000 (3/0)": 0.20,
  "00 (2/0)": 0.26,
  "0 (1/0)": 0.32,
  "1": 0.41,
  "2": 0.51,
  "4": 0.82,
  "6": 1.30,
  "8": 2.06,
  "10": 3.28,
  "12": 5.21,
  "14": 8.29,
  "16": 13.18,
  "18": 20.95,
  "20": 33.30,
  "22": 52.96,
  "24": 84.22,
  "26": 134.0,
  "28": 213.0,
};

// System nominal voltages and recommended max voltage drop percentages
const SYSTEM_DEFAULTS: Record<System, { voltage: number; maxPct: number; phase: Phase }> = {
  "12V": { voltage: 12, maxPct: 3, phase: "single" },
  "24V": { voltage: 24, maxPct: 3, phase: "single" },
  "120V-single": { voltage: 120, maxPct: 3, phase: "single" },
  "240V-single": { voltage: 240, maxPct: 3, phase: "single" },
  "120-240V-3phase": { voltage: 240, maxPct: 5, phase: "three" },
};

function fmt(n: number, digits: number = 3): string {
  if (!Number.isFinite(n)) return "—";
  return Number(n.toPrecision(digits)).toString();
}

export function VoltageDropCalculator() {
  const [system, setSystem] = useState<System>("120V-single");
  const [current, setCurrent] = useState("15");
  const [length, setLength] = useState("50");
  const [gauge, setGauge] = useState("12");
  const [material, setMaterial] = useState<Material>("copper");

  // Long-tail landing pages (PR 7 of PLAN.md) prefill the calculator
  // with { system, current, length, gauge, material } so e.g.
  // /wire/voltage-drop-12v-15a-50ft-12awg lands with the drop
  // already computed.
  usePrefillTool("voltage-drop-calculator", (prefill) => {
    if (prefill.system && prefill.system in SYSTEM_DEFAULTS) setSystem(prefill.system as System);
    if (prefill.current) setCurrent(prefill.current);
    if (prefill.length) setLength(prefill.length);
    if (prefill.gauge) setGauge(prefill.gauge);
    if (prefill.material === "copper" || prefill.material === "aluminum") setMaterial(prefill.material);
  });

  const result = useMemo(() => {
    const I = parseFloat(current); // amps
    const L = parseFloat(length); // feet (one-way)
    const sys = SYSTEM_DEFAULTS[system];
    if (!Number.isFinite(I) || !Number.isFinite(L) || I <= 0 || L <= 0) return null;

    // Convert AWG → resistance per km copper
    const rKmCu = AWG_RESISTANCE[gauge];
    if (!rKmCu) return null;
    // Adjust for aluminum (resistivity ratio 2.65/1.7241 ≈ 1.537)
    const rKm = material === "aluminum" ? rKmCu * (ALUMINUM_RESISTIVITY / COPPER_RESISTIVITY) : rKmCu;

    // Length conversion: feet → meters, and use round-trip
    const Lm = L * 0.3048;
    const Ltrip = 2 * Lm;

    const dropVolts = I * (rKm / 1000) * Ltrip * (sys.phase === "single" ? 1 : Math.sqrt(3));
    const dropPct = (dropVolts / sys.voltage) * 100;
    const endVoltage = sys.voltage - dropVolts;
    const ok = dropPct <= sys.maxPct;
    return {
      dropVolts,
      dropPct,
      endVoltage,
      ok,
      gauge,
      current: I,
      length: L,
      system: sys,
      material,
    };
  }, [current, length, gauge, material, system]);

  const inputCls =
    "w-full rounded-lg border border-surface-200 bg-white p-2.5 font-mono text-sm dark:border-dark-border dark:bg-dark-bg dark:text-dark-text";
  const labelCls = "block text-xs font-medium text-surface-700 dark:text-dark-text mb-1";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="vd-system" className={labelCls}>System</label>
          <select
            id="vd-system"
            value={system}
            onChange={(e) => setSystem(e.target.value as System)}
            className={inputCls}
          >
            <option value="12V">12V DC (auto, marine, solar)</option>
            <option value="24V">24V DC (truck, RV, solar)</option>
            <option value="120V-single">120V AC (single-phase mains)</option>
            <option value="240V-single">240V AC (single-phase mains)</option>
            <option value="120-240V-3phase">240V AC three-phase</option>
          </select>
        </div>
        <div>
          <label htmlFor="vd-material" className={labelCls}>Wire material</label>
          <select
            id="vd-material"
            value={material}
            onChange={(e) => setMaterial(e.target.value as Material)}
            className={inputCls}
          >
            <option value="copper">Copper</option>
            <option value="aluminum">Aluminum</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label htmlFor="vd-current" className={labelCls}>Current (A)</label>
          <input
            id="vd-current"
            type="number"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            placeholder="15"
            min="0"
            step="any"
            data-testid="vd-input"
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="vd-length" className={labelCls}>Length (ft, one-way)</label>
          <input
            id="vd-length"
            type="number"
            value={length}
            onChange={(e) => setLength(e.target.value)}
            placeholder="50"
            min="0"
            step="any"
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="vd-gauge" className={labelCls}>Wire gauge</label>
          <select
            id="vd-gauge"
            value={gauge}
            onChange={(e) => setGauge(e.target.value)}
            className={inputCls}
          >
            {Object.keys(AWG_RESISTANCE).map((g) => (
              <option key={g} value={g}>AWG {g}</option>
            ))}
          </select>
        </div>
      </div>

      {result && (
        <div
          data-testid="tool-output"
          className={`rounded-2xl border p-5 ${
            result.ok
              ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20"
              : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
          }`}
        >
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Voltage drop</p>
              <p className="mt-1 text-2xl font-bold text-surface-900 dark:text-dark-text">{fmt(result.dropVolts, 4)} V</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">% of nominal</p>
              <p className="mt-1 text-2xl font-bold text-surface-900 dark:text-dark-text">{fmt(result.dropPct, 3)}%</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">End voltage</p>
              <p className="mt-1 text-2xl font-bold text-surface-900 dark:text-dark-text">{fmt(result.endVoltage, 3)} V</p>
            </div>
          </div>
          <p className="mt-3 text-sm">
            {result.ok
              ? <span className="text-emerald-700 dark:text-emerald-300">Within the {result.system.maxPct}% recommended limit for {result.system.voltage}V systems.</span>
              : <span className="text-red-700 dark:text-red-300">Exceeds the {result.system.maxPct}% recommended limit. Use a heavier gauge (lower AWG number) or split into shorter runs.</span>}
          </p>
        </div>
      )}

      <p className="text-[10px] text-surface-400 dark:text-dark-muted">
        Round-trip length (out + back) is used. Single-phase: V_drop = 2 × I × R × L.
        Three-phase: V_drop = √3 × I × R × L. All math runs in your browser.
      </p>
    </div>
  );
}
