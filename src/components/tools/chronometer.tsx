"use client";

import { useState, useRef, useCallback } from "react";

interface Lap {
  id: number;
  time: number;
  diff: number;
}

function formatTime(ms: number): string {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const centis = Math.floor((ms % 1000) / 10);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(centis).padStart(2, "0")}`;
}

export function Chronometer() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<Lap[]>([]);
  const startTimeRef = useRef<number>(0);
  const accumulatedRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const lapIdRef = useRef(0);

  const update = useCallback(() => {
    const elapsed = Date.now() - startTimeRef.current + accumulatedRef.current;
    setTime(elapsed);
    rafRef.current = requestAnimationFrame(update);
  }, []);

  const start = useCallback(() => {
    if (isRunning) return;
    startTimeRef.current = Date.now();
    setIsRunning(true);
    rafRef.current = requestAnimationFrame(update);
  }, [isRunning, update]);

  const stop = useCallback(() => {
    if (!isRunning) return;
    cancelAnimationFrame(rafRef.current);
    accumulatedRef.current += Date.now() - startTimeRef.current;
    setIsRunning(false);
  }, [isRunning]);

  const reset = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    setTime(0);
    setIsRunning(false);
    accumulatedRef.current = 0;
    setLaps([]);
    lapIdRef.current = 0;
  }, []);

  const lap = useCallback(() => {
    if (!isRunning && time === 0) return;
    const prevLapTime = laps.length > 0 ? laps[0].time : 0;
    const lapTime = time;
    lapIdRef.current += 1;
    setLaps((prev) => [
      { id: lapIdRef.current, time: lapTime, diff: lapTime - prevLapTime },
      ...prev,
    ]);
  }, [isRunning, time, laps]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center">
        <div className="rounded-2xl border-2 border-surface-200 bg-surface-50 px-8 py-6 dark:border-dark-border dark:bg-dark-surface">
          <p className="text-5xl font-mono font-bold text-surface-900 dark:text-dark-text tabular-nums tracking-wider">
            {formatTime(time)}
          </p>
        </div>
      </div>

      <div className="flex justify-center gap-2">
        {!isRunning ? (
          <button
            onClick={start}
            className="rounded-lg bg-green-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-600 transition-colors"
          >
            Start
          </button>
        ) : (
          <button
            onClick={stop}
            className="rounded-lg bg-red-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-red-600 transition-colors"
          >
            Stop
          </button>
        )}

        <button
          onClick={lap}
          disabled={!isRunning && time === 0}
          className="rounded-lg border border-surface-200 px-6 py-2.5 text-sm font-medium text-surface-700 hover:bg-surface-50 disabled:opacity-40 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors"
        >
          Lap
        </button>

        <button
          onClick={reset}
          disabled={time === 0 && laps.length === 0}
          className="rounded-lg border border-surface-200 px-6 py-2.5 text-sm font-medium text-surface-700 hover:bg-surface-50 disabled:opacity-40 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors"
        >
          Reset
        </button>
      </div>

      {laps.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-surface-700 dark:text-dark-text">Laps ({laps.length})</label>
            <button
              onClick={() => {
                const text = laps.map((l, i) => `Lap ${laps.length - i}: ${formatTime(l.diff)}`).join("\n");
                navigator.clipboard.writeText(text);
              }}
              className="rounded-lg border border-surface-200 px-3 py-1 text-xs font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface"
            >
              Copy Laps
            </button>
          </div>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {laps.map((l, i) => {
              const isBest = l.diff === Math.min(...laps.map((lap) => lap.diff));
              const isWorst = laps.length > 1 && l.diff === Math.max(...laps.map((lap) => lap.diff));
              return (
                <div
                  key={l.id}
                  className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm font-mono ${
                    isBest
                      ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
                      : isWorst
                      ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
                      : "border-surface-200 bg-white dark:border-dark-border dark:bg-dark-bg"
                  }`}
                >
                  <span className="text-surface-500 dark:text-dark-muted">
                    Lap {laps.length - i}
                    {isBest && <span className="ml-2 text-green-600 dark:text-green-400 text-xs">BEST</span>}
                    {isWorst && <span className="ml-2 text-red-600 dark:text-red-400 text-xs">SLOWEST</span>}
                  </span>
                  <div className="text-right">
                    <span className="text-surface-900 dark:text-dark-text">{formatTime(l.diff)}</span>
                    <span className="text-surface-400 dark:text-dark-muted ml-2 text-xs">({formatTime(l.time)})</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <p className="text-[10px] text-surface-400 dark:text-dark-muted text-center">
        Timing uses requestAnimationFrame for smooth, accurate updates.
      </p>
    </div>
  );
}
