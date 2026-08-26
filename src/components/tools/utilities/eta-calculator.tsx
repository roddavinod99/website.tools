"use client";

import { useState, useMemo } from "react";

function formatDuration(totalSeconds: number): { hours: string; minutes: string; seconds: string; display: string } {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  const parts: string[] = [];
  if (h > 0) parts.push(`${h}h`);
  if (m > 0 || h > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return {
    hours: `${h}`,
    minutes: `${m}`,
    seconds: `${s}`,
    display: parts.join(" "),
  };
}

export function EtaCalculator() {
  const [distance, setDistance] = useState("100");
  const [speed, setSpeed] = useState("60");
  const [distanceUnit, setDistanceUnit] = useState<"km" | "mi">("km");
  const [speedUnit, setSpeedUnit] = useState<"km/h" | "mph">("km/h");
  const [swapUnits, setSwapUnits] = useState(false);

  const effectiveDistanceUnit = swapUnits ? (distanceUnit === "km" ? "mi" : "km") : distanceUnit;
  const effectiveSpeedUnit = swapUnits ? (speedUnit === "km/h" ? "mph" : "km/h") : speedUnit;

  const result = useMemo(() => {
    const d = parseFloat(distance);
    const s = parseFloat(speed);
    if (isNaN(d) || isNaN(s) || s <= 0 || d < 0) return null;

    const distMiles = effectiveDistanceUnit === "km" ? d * 0.621371 : d;
    const spdMph = effectiveSpeedUnit === "km/h" ? s * 0.621371 : s;

    const distKm = effectiveDistanceUnit === "km" ? d : d * 1.60934;
    const spdKmh = effectiveSpeedUnit === "km/h" ? s : s * 1.60934;

    const totalSeconds = (distMiles / spdMph) * 3600;
    const avgSpeedKmh = spdKmh;

    return {
      duration: formatDuration(totalSeconds),
      totalSeconds,
      distKm: distKm.toFixed(2),
      distMiles: distMiles.toFixed(2),
      spdKmh: avgSpeedKmh.toFixed(1),
      spdMph: spdMph.toFixed(1),
      arrivalTime: (() => {
        const now = new Date();
        now.setSeconds(now.getSeconds() + Math.round(totalSeconds));
        return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      })(),
    };
  }, [distance, speed, effectiveDistanceUnit, effectiveSpeedUnit]);

  const toggleUnits = () => {
    setSwapUnits((prev) => !prev);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">
            Distance
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              min={0}
              step="any"
              placeholder="0"
              className="flex-1 rounded-lg border border-surface-200 bg-white p-3 font-mono text-sm dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
            />
            <select
              value={effectiveDistanceUnit}
              onChange={(e) => {
                if (swapUnits) {
                  setDistanceUnit(e.target.value === "km" ? "mi" : "km");
                } else {
                  setDistanceUnit(e.target.value as "km" | "mi");
                }
              }}
              className="rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm font-medium text-surface-700 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
            >
              <option value="km">km</option>
              <option value="mi">miles</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">
            Speed
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={speed}
              onChange={(e) => setSpeed(e.target.value)}
              min={0}
              step="any"
              placeholder="0"
              className="flex-1 rounded-lg border border-surface-200 bg-white p-3 font-mono text-sm dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
            />
            <select
              value={effectiveSpeedUnit}
              onChange={(e) => {
                if (swapUnits) {
                  setSpeedUnit(e.target.value === "km/h" ? "mph" : "km/h");
                } else {
                  setSpeedUnit(e.target.value as "km/h" | "mph");
                }
              }}
              className="rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm font-medium text-surface-700 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
            >
              <option value="km/h">km/h</option>
              <option value="mph">mph</option>
            </select>
          </div>
        </div>
      </div>

      <button
        onClick={toggleUnits}
        className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors flex items-center gap-2"
      >
        <span className="text-lg">⇄</span>
        Swap Units ({effectiveDistanceUnit} / {effectiveSpeedUnit})
      </button>

      {result && (
        <div className="space-y-3">
          <div className="rounded-lg border border-surface-200 bg-surface-50 p-4 dark:border-dark-border dark:bg-dark-surface">
            <p className="text-xs font-medium uppercase tracking-wider text-surface-400 dark:text-dark-muted mb-1">
              Estimated Travel Time
            </p>
            <p className="text-2xl font-bold text-surface-900 dark:text-dark-text font-mono">
              {result.duration.display}
            </p>
            <p className="text-xs text-surface-500 dark:text-dark-muted mt-1">
              {result.duration.hours} hours, {result.duration.minutes} minutes, {result.duration.seconds} seconds
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 dark:border-dark-border dark:bg-dark-surface">
              <span className="block text-[10px] uppercase tracking-wider text-surface-400 dark:text-dark-muted">Distance (km)</span>
              <span className="block text-sm font-mono text-surface-900 dark:text-dark-text">{result.distKm}</span>
            </div>
            <div className="rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 dark:border-dark-border dark:bg-dark-surface">
              <span className="block text-[10px] uppercase tracking-wider text-surface-400 dark:text-dark-muted">Distance (mi)</span>
              <span className="block text-sm font-mono text-surface-900 dark:text-dark-text">{result.distMiles}</span>
            </div>
            <div className="rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 dark:border-dark-border dark:bg-dark-surface">
              <span className="block text-[10px] uppercase tracking-wider text-surface-400 dark:text-dark-muted">Speed (km/h)</span>
              <span className="block text-sm font-mono text-surface-900 dark:text-dark-text">{result.spdKmh}</span>
            </div>
            <div className="rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 dark:border-dark-border dark:bg-dark-surface">
              <span className="block text-[10px] uppercase tracking-wider text-surface-400 dark:text-dark-muted">Speed (mph)</span>
              <span className="block text-sm font-mono text-surface-900 dark:text-dark-text">{result.spdMph}</span>
            </div>
          </div>

          <div className="rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 dark:border-dark-border dark:bg-dark-surface text-center">
            <span className="text-xs text-surface-500 dark:text-dark-muted">
              Estimated arrival: <span className="font-medium text-surface-700 dark:text-dark-text">{result.arrivalTime}</span> (if starting now)
            </span>
          </div>
        </div>
      )}

      {(!result || parseFloat(speed) <= 0) && (
        <p className="text-xs text-surface-500 dark:text-dark-muted text-center py-4">
          Enter distance and speed to calculate estimated travel time.
        </p>
      )}
    </div>
  );
}
